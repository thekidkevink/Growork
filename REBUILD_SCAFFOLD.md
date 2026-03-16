# GROWORK Rebuild Scaffold

This scaffold captures the agreed rebuild direction for the Expo + Supabase app.

## Product principle
Recreate the old client-approved product feel first, then improve it.

## Rebuild priorities
1. Auth + signup flow matching the old app feel
2. Unified tab shell
3. Home mixed feed
4. Profile hub
5. Bookmarks
6. Company creation / business unlock
7. Jobs posting / applications
8. Admin later

## Route plan
- `/auth/email`
  - signup step 1: email + password
- `/auth/username`
  - signup step 2: username + first name + surname
- `/auth/success`
  - signup step 3: welcome / verification success
- `/auth/login`
  - login
- `/(tabs)`
  - unified consumer shell
- `/(tabs)/index`
  - Home feed
- `/(tabs)/applications`
  - Jobs / Applications hub
- `/(tabs)/search`
  - Search
- `/(tabs)/bookmarks`
  - Bookmarks
- `/(tabs)/profile`
  - Profile hub
- `/post/[id]`
  - content detail
- `/company/[id]`
  - company detail
- `/application/[id]`
  - application detail

## Core data assumptions
### Account model
Every public signup creates a normal user account first.

- `auth.users`
  - Supabase auth identity
- `public.profiles`
  - profile row for every user
  - no required employer/job seeker split at signup
- `public.companies`
  - business capability emerges from ownership/management relationships

### Capability model
Business capability is relationship-driven, not role-driven.

- `isAdmin(profile)`
  - internal/manual only
- `hasBusinessCapability(userId)`
  - true if user owns or manages a company
- `canPostJobs(userId)`
  - true if user has business capability
- `canManageApplicants(userId)`
  - true if user owns or manages the company tied to the listing/post

### Home feed model
Home is the emotional center of the product.

Feed content types:
- `job`
- `news`
- `company_post`

Support:
- mixed feed query
- tabs/filters: all, jobs, news
- bookmark/like/comment affordances
- pagination
- pull to refresh
- industry filtering later if available

## Suggested feature structure
```
src/
  features/
    auth/
      domain/
      services/
    app-shell/
      config/
    capabilities/
      domain/
      services/
    feed/
      domain/
      services/
    profile/
      domain/
    companies/
      domain/
    jobs/
      domain/
```

## First implementation slice
- Scaffold account and capability models
- Formalize route constants and tab config
- Formalize signup step contract
- Add home feed query contract + placeholder controller
- Use these as the target architecture while we progressively migrate screens
