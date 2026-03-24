import { supabase } from '@/utils/supabase';
import { supabaseRequest } from '@/utils/supabaseRequest';
import { useCallback, useState } from 'react';

export function usePostById() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPostById = useCallback(async (postId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch the post by ID
      const { data: post } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('posts')
            .select('*')
            .eq('id', postId)
            .single();
          return { data, error, status };
        },
        { logTag: 'posts:getById' }
      );

      if (!post) {
        throw new Error('Post not found');
      }

      // Fetch the user profile for this post
      const { data: profile } = await supabaseRequest<any>(
        async () => {
          const { data, error, status } = await supabase
            .from('legacy_public_profiles')
            .select('*')
            .eq('id', post.user_id)
            .maybeSingle();
          return { data, error, status };
        },
        { logTag: 'profiles:getForPostById' }
      );

      const companyId = post?.criteria?.companyId || post?.criteria?.company_id;
      let company: any = null;

      if (companyId) {
        const { data: companyData } = await supabaseRequest<any>(
          async () => {
            const { data, error, status } = await supabase
              .from("companies")
              .select("id, name, logo_url")
              .eq("id", companyId)
              .maybeSingle();
            return { data, error, status };
          },
          { logTag: "companies:getForPostById" }
        );

        company = companyData || null;
      }

      // Return post with profile data
      const criteria = {
        ...(post.criteria || {}),
        company:
          post?.criteria?.company || post.company_name || company?.name || undefined,
        companyId:
          post?.criteria?.companyId || post?.criteria?.company_id || company?.id || undefined,
        companyLogo:
          post?.criteria?.companyLogo || post.company_logo || company?.logo_url || undefined,
      };

      return {
        data: {
          ...post,
          criteria,
          profiles: profile || null,
          company_name:
            post.company_name ||
            criteria.company ||
            (profile ? `${profile.name || ''} ${profile.surname || ''}`.trim() : 'Anonymous'),
          company_image:
            post.company_logo ||
            criteria.companyLogo ||
            profile?.avatar_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              criteria.company || post.company_name || 'Company'
            )}&size=128`
        },
        error: null
      };
    } catch (err: any) {
      console.error('Error fetching post by ID:', err);
      setError(err.message);
      return { data: null, error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPostById,
  };
}
