-- setupProfiles.sql

-- Create the profiles table if it doesn't exist
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  city text,
  created_at timestamp default current_timestamp
);

-- Drop the existing trigger if it exists
DROP TRIGGER IF EXISTS on_email_confirmation ON auth.users;

CREATE OR REPLACE FUNCTION public.create_profile_after_email_confirmation()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  -- Check if the user's email is confirmed
  IF NEW.email_confirmed_at IS NOT NULL THEN
    -- Insert a new profile into the profiles table with trimmed name from email
    INSERT INTO public.profiles (id, name, city)
    VALUES (NEW.id, SPLIT_PART(NEW.email, '@', 1), 'Default City');
  END IF;
  RETURN NEW;
END;
$$;


-- Create the trigger to call the above function when email is confirmed
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
