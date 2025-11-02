-- EXTENSIONS (required for UUID + crypto)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

------------------------------------------------------------
-- PROFILES (extends Supabase auth.users)
------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  avatar_url text,
  clubs jsonb DEFAULT '[]'::jsonb, -- [{club_id:"",role:"President"}]
  created_at timestamp DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------
-- CLUBS
------------------------------------------------------------
CREATE TABLE public.clubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  faculty_department text,
  club_logo_url text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp DEFAULT now()
);

ALTER TABLE public.clubs ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------
-- EVENT PROPOSALS
------------------------------------------------------------
CREATE TABLE public.event_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  requested_budget numeric,
  attachments jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'pending', -- pending/approved/rejected
  remarks text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp DEFAULT now()
);

ALTER TABLE public.event_proposals ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------
-- EVENTS (created after proposal approval)
------------------------------------------------------------
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  club_id uuid REFERENCES public.clubs(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  start_time timestamp,
  end_time timestamp,
  venue text,
  poster_url text,
  certificate_bg_url text, -- certificate background
  approved boolean DEFAULT false,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------
-- EVENT ATTENDANCE & CERTIFICATES
------------------------------------------------------------
CREATE TABLE public.event_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES public.events(id) ON DELETE CASCADE,
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  attended boolean DEFAULT false,
  certificate_url text,
  created_at timestamp DEFAULT now()
);

ALTER TABLE public.event_attendance ENABLE ROW LEVEL SECURITY;

------------------------------------------------------------
-- TRIGGER: WHEN PROPOSAL APPROVED => CREATE EVENT
------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_event_on_approval()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
    INSERT INTO public.events (club_id, title, description, created_by, approved)
    VALUES (NEW.club_id, NEW.title, NEW.description, NEW.created_by, true);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS event_on_proposal_approve ON public.event_proposals;

CREATE TRIGGER event_on_proposal_approve
AFTER UPDATE ON public.event_proposals
FOR EACH ROW
EXECUTE FUNCTION public.create_event_on_approval();

------------------------------------------------------------
-- BASIC PUBLIC READ POLICIES (you will refine later)
------------------------------------------------------------

-- Profiles: user can read their own data
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

-- Clubs: everyone can read clubs
CREATE POLICY "Public clubs readable" ON public.clubs
FOR SELECT USING (true);

-- Proposals: creator and admins can see
CREATE POLICY "View own proposals" ON public.event_proposals
FOR SELECT USING (auth.uid() = created_by);

-- Events: public readable
CREATE POLICY "Public events readable" ON public.events
FOR SELECT USING (true);

-- Attendance: user sees own
CREATE POLICY "User sees own attendance" ON public.event_attendance
FOR SELECT USING (auth.uid() = user_id);
