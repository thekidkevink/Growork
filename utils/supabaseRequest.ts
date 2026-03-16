import { PostgrestError } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { checkNetworkStatus, getNetworkErrorMessage, isNetworkError } from './networkUtils'
import { alertAndNotifyNetworkIssue } from './uiFeedback'

export type SupabaseRequestResult<T> = {
  data: T
  fromCache?: boolean
}

export type SupabaseRequestOptions = {
  retries?: number // number of retries on transient failure
  retryDelayBaseMs?: number // base for exponential backoff
  timeoutMs?: number // not strictly needed since we wrap fetch with timeout globally
  onAuthFailure?: () => Promise<void> | void // hook for sign-out, etc.
  suppressNetworkCheck?: boolean // skip network check (e.g., for cached reads)
  logTag?: string // short operation name for logs
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const isAuthLockTimeoutError = (error: unknown): boolean => {
  const message =
    typeof error === 'string'
      ? error.toLowerCase()
      : error instanceof Error
      ? error.message.toLowerCase()
      : typeof error === 'object' && error && 'message' in error
      ? String((error as any).message).toLowerCase()
      : ''

  return (
    message.includes('acquiring process lock') ||
    message.includes('process lock') ||
    message.includes('auth-token') ||
    message.includes('timed out')
  )
}

const isRetriableStatus = (status?: number) => {
  if (!status) return false
  // 408 Request Timeout, 425 Too Early, 429 Too Many Requests, 5xx Server errors
  return status === 408 || status === 425 || status === 429 || (status >= 500 && status <= 599)
}

const isRetriableError = (error?: PostgrestError | null): boolean => {
  if (!error) return false
  const message = (error.message || '').toLowerCase()
  return (
    isAuthLockTimeoutError(error) ||
    isNetworkError(error) ||
    message.includes('timeout') ||
    message.includes('fetch failed') ||
    message.includes('connect') ||
    message.includes('temporarily unavailable')
  )
}



export async function supabaseRequest<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null; status?: number }>,
  opts: SupabaseRequestOptions = {}
): Promise<SupabaseRequestResult<T>> {
  const {
    retries = 2,
    retryDelayBaseMs = 500,
    onAuthFailure,
    suppressNetworkCheck = false,
    logTag = 'sb'
  } = opts

  if (!suppressNetworkCheck) {
    const net = await checkNetworkStatus()
    if (!net.isConnected || net.isInternetReachable === false) {
      const msg = 'Offline: no internet connection.'
      console.warn(`[${logTag}] ${msg}`)
      try { await alertAndNotifyNetworkIssue(msg) } catch {}
      throw new Error(msg)
    }
  }

  let attempt = 0
  let didRefreshAuth = false

  while (true) {
    try {
      attempt += 1
      const res = await queryFn()

      if (res.error) {
        const status = res.status

        // Handle 401 auth errors with one token refresh attempt
        if (status === 401 && !didRefreshAuth) {
          try {
            const { error: refreshErr } = await supabase.auth.refreshSession()
            if (!refreshErr) {
              didRefreshAuth = true
              console.info(`[${logTag}] 401 received, refreshed session and retrying...`)
              continue
            }
          } catch {}

          // Optional caller hook for auth failure (e.g., sign out)
          if (onAuthFailure) await onAuthFailure()
        }

        // Retry transient failures
        if (isRetriableStatus(status) || isRetriableError(res.error)) {
          if (attempt <= retries + 1) {
            const delay = retryDelayBaseMs * Math.pow(2, attempt - 1) + Math.random() * 150
            console.warn(`[${logTag}] transient error (status ${status ?? 'n/a'}), retrying in ${Math.round(delay)}ms...`)
            await sleep(delay)
            continue
          }
        }

        // Non-retriable or retries exhausted
        const friendly =
          isNetworkError(res.error) || isRetriableStatus(status)
            ? getNetworkErrorMessage(res.error)
            : res.error.message || 'Request failed'
        const err = new Error(friendly)
        ;(err as any).cause = res.error
        try {
          if (isNetworkError(res.error) || isRetriableStatus(status)) {
            await alertAndNotifyNetworkIssue(friendly)
          }
        } catch {}
        throw err
      }

      // Success
      return { data: res.data as T }
    } catch (e: any) {
      // Fetch/transport-level errors (aborts, timeouts already wrapped via global fetch)
      if (attempt <= retries + 1 && (isNetworkError(e) || isAuthLockTimeoutError(e))) {
        const delay = retryDelayBaseMs * Math.pow(2, attempt - 1) + Math.random() * 150
        console.warn(`[${logTag}] transport error, retrying in ${Math.round(delay)}ms...`)
        await sleep(delay)
        continue
      }
      try {
        if (isNetworkError(e)) {
          const msg = getNetworkErrorMessage(e)
          await alertAndNotifyNetworkIssue(msg)
        }
      } catch {}
      throw e
    }
  }
}

// Helper for paginated list reads
export async function paginate<T>(
  table: string,
  {
    from = 0,
    to = 19,
    orderBy,
    ascending = false
  }: { from?: number; to?: number; orderBy?: string; ascending?: boolean },
  opts?: SupabaseRequestOptions
) {
  return supabaseRequest<T[]>(
    async () => {
      let q = supabase.from(table).select('*', { count: 'exact' }).range(from, to)
      if (orderBy) q = q.order(orderBy, { ascending })
      // Note: caller can inspect count via an additional Head query if needed
      const { data, error, status } = await q
      return { data, error, status }
    },
    { ...opts, logTag: opts?.logTag ?? `pg:${table}` }
  )
}

// Force single row or throw helpful error
export async function singleOrThrow<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null; status?: number }>,
  context: string,
  opts?: SupabaseRequestOptions
) {
  const { data } = await supabaseRequest<T>(queryFn, opts)
  if (!data) throw new Error(`${context}: not found`)
  return data
}


