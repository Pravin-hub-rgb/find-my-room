-- setupProfiles.sql

-- Create the profiles table if it doesn't exist
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  city text,
  created_at timestamp default current_timestamp
);

-- Drop the existing trigger if it exists
CREATE OR REPLACE FUNCTION public.create_profile_after_email_confirmation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Check if the user's email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL THEN
    -- Insert into profiles with email and name
    INSERT INTO public.profiles (id, name, email)
    VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1), NEW.email);
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger ko banana joj function ko call karega jab email confirm hojayegi
CREATE TRIGGER on_email_confirmation
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
EXECUTE FUNCTION public.create_profile_after_email_confirmation();


GRANT INSERT ON TABLE public.profiles TO authenticated;

REVOKE EXECUTE ON FUNCTION public.create_profile_after_email_confirmation() FROM PUBLIC;



-- Rooms table 

CREATE TABLE rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  room_type text,
  price numeric,
  state text NOT NULL,
  district text NOT NULL,
  locality text,
  address text,
  image_urls text[], -- array of image URLs from storage
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE rooms DROP COLUMN title;

alter table rooms
add column latitude double precision,
add column longitude double precision;


alter table profiles
drop column city;

alter table profiles
add column state text,
add column district text;

alter table rooms add column bhk_type text;
ALTER TABLE rooms DROP COLUMN room_type;

ALTER TABLE profiles ADD COLUMN email text;


-- CREATE OR REPLACE FUNCTION public.create_profile_after_email_confirmation()
-- RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
-- BEGIN
--   -- Check if the user's email is confirmed
--   IF NEW.email_confirmed_at IS NOT NULL THEN
--     -- Insert into profiles with email and name
--     INSERT INTO public.profiles (id, name, email)
--     VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1), NEW.email);
--   END IF;
--   RETURN NEW;
-- END;
-- $$;