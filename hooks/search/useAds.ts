import { useState, useCallback } from 'react';
import { supabase } from '@/utils/supabase';
import { supabaseRequest } from '@/utils/supabaseRequest';

export interface Ad {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  link_url?: string;
  status: 'active' | 'inactive' | 'pending';
  created_at: string;
  updated_at: string;
  impressions: number;
  clicks: number;
}

export function useAds() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAds = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase.from('ads').select('*').order('created_at', {
        ascending: false,
      });

      if (status) {
        query = query.eq('status', status);
      }

      const { data } = await supabaseRequest<Ad[]>(
        async () => {
          const { data, error, status: responseStatus } = await query;
          return { data, error, status: responseStatus };
        },
        { logTag: 'ads:list' }
      );

      setAds(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch ads');
    } finally {
      setLoading(false);
    }
  }, []);

  const addAd = useCallback(async (adData: Partial<Ad>) => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await supabaseRequest<Ad>(
        async () => {
          const { data, error, status } = await supabase
            .from('ads')
            .insert([adData])
            .select()
            .single();
          return { data, error, status };
        },
        { logTag: 'ads:create' }
      );

      setAds(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add ad');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const recordAdImpression = useCallback(async (adId: string, userId: string) => {
    try {
      await supabaseRequest(
        async () => {
          const { data, error, status } = await supabase
            .from('ad_impressions')
            .insert([
              {
                ad_id: adId,
                user_id: userId,
              },
            ]);
          return { data, error, status };
        },
        { logTag: 'ads:recordImpression' }
      );

      setAds(prev =>
        prev.map(ad =>
          ad.id === adId ? { ...ad, impressions: (ad.impressions || 0) + 1 } : ad
        )
      );
    } catch (err) {
      console.error('Error recording ad impression:', err);
    }
  }, []);

  return {
    ads,
    loading,
    error,
    fetchAds,
    addAd,
    recordAdImpression,
  };
} 
