-- Create enum types for the database
CREATE TYPE post_type AS ENUM ('news', 'job');
CREATE TYPE ad_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE application_status AS ENUM ('pending', 'reviewed', 'accepted', 'rejected');
CREATE TYPE document_type AS ENUM (
  'cv',
  'cover_letter',
  'qualification',
  'national_id',
  'drivers_licence',
  'other'
);
CREATE TYPE user_type AS ENUM ('user', 'business');
CREATE TYPE notification_type AS ENUM ('post_like', 'post_comment', 'post_bookmark', 'comment_like', 'application_status', 'company_status');

-- Create a function to update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to update the updated_at timestamp automatically for posts
CREATE TRIGGER set_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  type notification_type NOT NULL,
  data jsonb,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);


-- Create index for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Create companies table
CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  logo_url text,
  website text,
  contact_email text,
  contact_phone text,
  industry text,
  size text,
  founded_year integer,
  location text,
  user_id uuid NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT companies_pkey PRIMARY KEY (id),
  CONSTRAINT companies_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Create trigger for companies updated_at
CREATE TRIGGER set_companies_updated_at
BEFORE UPDATE ON public.companies
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Create trigger for profiles updated_at
CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TABLE public.ad_impressions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  ad_id uuid,
  user_id uuid,
  shown_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT ad_impressions_pkey PRIMARY KEY (id),
  CONSTRAINT ad_impressions_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE,
  CONSTRAINT ad_impressions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE TABLE public.ads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  post_id uuid,
  user_id uuid,
  budget numeric,
  spent numeric DEFAULT 0,
  priority integer DEFAULT 0,
  status ad_status DEFAULT 'active',
  start_date timestamp with time zone,
  end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT ads_pkey PRIMARY KEY (id),
  CONSTRAINT ads_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT ads_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE
);
CREATE TABLE public.applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  post_id uuid,
  resume_id uuid,
  cover_letter_id uuid,
  resume_url text,
  cover_letter text,
  status application_status DEFAULT 'pending',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT applications_pkey PRIMARY KEY (id),
  CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT applications_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT applications_cover_letter_id_fkey FOREIGN KEY (cover_letter_id) REFERENCES public.documents(id) ON DELETE SET NULL,
  CONSTRAINT applications_resume_id_fkey FOREIGN KEY (resume_id) REFERENCES public.documents(id) ON DELETE SET NULL,
  CONSTRAINT applications_unique UNIQUE (user_id, post_id)
);
CREATE TABLE public.comments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  post_id uuid,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT comments_pkey PRIMARY KEY (id),
  CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE TABLE public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type document_type NOT NULL,
  name text,
  file_url text NOT NULL,
  uploaded_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);
CREATE TABLE public.likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  post_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT likes_pkey PRIMARY KEY (id),
  CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT likes_unique UNIQUE (user_id, post_id)
);
CREATE TABLE public.posts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  type post_type NOT NULL,
  title text,
  content text,
  image_url text,
  criteria jsonb,
  industry text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone,
  is_sponsored boolean DEFAULT false,
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.profiles (
  id uuid NOT NULL,
  username text UNIQUE,
  avatar_url text,
  bio text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  user_type user_type NOT NULL DEFAULT 'user',
  profile_role text NOT NULL DEFAULT 'user' CHECK (profile_role IN ('user', 'admin')),
  name text NOT NULL DEFAULT ''::text,
  surname text NOT NULL DEFAULT ''::text,
  date_of_birth date,
  website text,
  phone text,
  location text,
  profession text,
  experience_years integer,
  education text,
  skills text[],
  company_limit_override integer,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.bookmarks (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  post_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT bookmarks_pkey PRIMARY KEY (id),
  CONSTRAINT bookmarks_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
  CONSTRAINT bookmarks_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT bookmarks_unique UNIQUE (user_id, post_id)
);

CREATE TABLE public.comment_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  comment_id uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT comment_likes_pkey PRIMARY KEY (id),
  CONSTRAINT comment_likes_comment_id_fkey FOREIGN KEY (comment_id) REFERENCES public.comments(id) ON DELETE CASCADE,
  CONSTRAINT comment_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT comment_likes_unique UNIQUE (user_id, comment_id)
);

-- Link table: profiles follow companies
CREATE TABLE public.company_follows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL,
  company_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT company_follows_pkey PRIMARY KEY (id),
  CONSTRAINT company_follows_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT company_follows_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE CASCADE,
  CONSTRAINT company_follows_unique UNIQUE (profile_id, company_id)
);

CREATE TABLE public.business_account_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text,
  full_name text NOT NULL,
  phone text,
  profession text,
  company_name text,
  industry text,
  location text,
  message text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes text,
  reviewed_at timestamp with time zone,
  reviewed_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT business_account_requests_pkey PRIMARY KEY (id),
  CONSTRAINT business_account_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT business_account_requests_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.profiles(id) ON DELETE SET NULL
);

CREATE POLICY "Users can delete their own pending business requests"
ON public.business_account_requests
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
  AND status = 'pending'
);

CREATE OR REPLACE FUNCTION public.review_business_account_request(
  p_request_id uuid,
  p_status text,
  p_admin_notes text DEFAULT null
)
RETURNS public.business_account_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  acting_profile public.profiles;
  target_request public.business_account_requests;
  updated_request public.business_account_requests;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid review status.';
  END IF;

  SELECT *
  INTO acting_profile
  FROM public.profiles
  WHERE id = auth.uid();

  IF acting_profile.id IS NULL OR acting_profile.profile_role <> 'admin' THEN
    RAISE EXCEPTION 'Admin access required.';
  END IF;

  SELECT *
  INTO target_request
  FROM public.business_account_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF target_request.id IS NULL THEN
    RAISE EXCEPTION 'Business request not found.';
  END IF;

  IF p_status = 'approved' THEN
    UPDATE public.profiles
    SET user_type = 'business'
    WHERE id = target_request.user_id;

    INSERT INTO public.notifications (
      user_id,
      title,
      body,
      type,
      data
    )
    VALUES (
      target_request.user_id,
      'Business Account Approved',
      'Your business account request has been approved. You can now access business tools.',
      'company_status',
      jsonb_build_object(
        'type', 'business_request_approved',
        'request_id', target_request.id,
        'status', 'approved'
      )
    );
  ELSE
    INSERT INTO public.notifications (
      user_id,
      title,
      body,
      type,
      data
    )
    VALUES (
      target_request.user_id,
      'Business Account Request Rejected',
      coalesce(
        'Your business account request was not approved. Reason: ' || nullif(trim(coalesce(p_admin_notes, '')), ''),
        'Your business account request was not approved.'
      ),
      'company_status',
      jsonb_build_object(
        'type', 'business_request_rejected',
        'request_id', target_request.id,
        'status', 'rejected',
        'admin_notes', nullif(trim(coalesce(p_admin_notes, '')), '')
      )
    );
  END IF;

  UPDATE public.business_account_requests
  SET
    status = p_status,
    admin_notes = nullif(trim(coalesce(p_admin_notes, '')), ''),
    reviewed_at = timezone('utc'::text, now()),
    reviewed_by = auth.uid()
  WHERE id = p_request_id
  RETURNING *
  INTO updated_request;

  RETURN updated_request;
END;
$$;

CREATE OR REPLACE FUNCTION public.retract_business_account_approval(
  p_request_id uuid
)
RETURNS public.business_account_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  acting_profile public.profiles;
  target_request public.business_account_requests;
  updated_request public.business_account_requests;
  remaining_approved_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT *
  INTO acting_profile
  FROM public.profiles
  WHERE id = auth.uid();

  IF acting_profile.id IS NULL OR acting_profile.profile_role <> 'admin' THEN
    RAISE EXCEPTION 'Admin access required.';
  END IF;

  SELECT *
  INTO target_request
  FROM public.business_account_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF target_request.id IS NULL THEN
    RAISE EXCEPTION 'Business request not found.';
  END IF;

  IF target_request.status <> 'approved' THEN
    RAISE EXCEPTION 'Only approved requests can be retracted.';
  END IF;

  UPDATE public.business_account_requests
  SET
    status = 'pending',
    admin_notes = null,
    reviewed_at = null,
    reviewed_by = null
  WHERE id = p_request_id
  RETURNING *
  INTO updated_request;

  SELECT count(*)
  INTO remaining_approved_count
  FROM public.business_account_requests
  WHERE user_id = target_request.user_id
    AND status = 'approved';

  IF remaining_approved_count = 0 THEN
    UPDATE public.profiles
    SET user_type = 'user'
    WHERE id = target_request.user_id;
  END IF;

  INSERT INTO public.notifications (
    user_id,
    title,
    body,
    type,
    data
  )
  VALUES (
    target_request.user_id,
    'Business Access Returned To Review',
    'Your business access has been moved back to pending review by an admin.',
    'company_status',
    jsonb_build_object(
      'type', 'business_request_retracted',
      'request_id', target_request.id,
      'status', 'pending'
    )
  );

  RETURN updated_request;
END;
$$;

-- Link table: users follow users
CREATE TABLE public.user_follows (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  follower_id uuid NOT NULL,
  following_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_follows_pkey PRIMARY KEY (id),
  CONSTRAINT user_follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT user_follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.profiles(id) ON DELETE CASCADE,
  CONSTRAINT user_follows_unique UNIQUE (follower_id, following_id)
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_company_follows_profile ON public.company_follows(profile_id);
CREATE INDEX IF NOT EXISTS idx_company_follows_company ON public.company_follows(company_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows(following_id);

CREATE OR REPLACE FUNCTION public.delete_post_cascade(post_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  owned_by_user boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM public.posts
    WHERE id = post_uuid
      AND user_id = auth.uid()
  )
  INTO owned_by_user;

  IF NOT owned_by_user THEN
    RAISE EXCEPTION 'You are not allowed to delete this post.';
  END IF;

  DELETE FROM public.comment_likes
  WHERE comment_id IN (
    SELECT id FROM public.comments WHERE post_id = post_uuid
  );

  DELETE FROM public.ad_impressions
  WHERE ad_id IN (
    SELECT id FROM public.ads WHERE post_id = post_uuid
  );

  DELETE FROM public.applications
  WHERE post_id = post_uuid;

  DELETE FROM public.bookmarks
  WHERE post_id = post_uuid;

  DELETE FROM public.likes
  WHERE post_id = post_uuid;

  DELETE FROM public.comments
  WHERE post_id = post_uuid;

  DELETE FROM public.ads
  WHERE post_id = post_uuid;

  DELETE FROM public.posts
  WHERE id = post_uuid
    AND user_id = auth.uid();

  RETURN true;
END;
$$;
