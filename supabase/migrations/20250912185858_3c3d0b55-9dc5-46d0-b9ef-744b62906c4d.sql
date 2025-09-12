-- Fix function security warnings by setting search_path properly
CREATE OR REPLACE FUNCTION public.reset_daily_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.user_credits 
  SET 
    credits_remaining = 3,
    last_reset_date = CURRENT_DATE,
    updated_at = now()
  WHERE 
    last_reset_date < CURRENT_DATE 
    AND is_unlimited = false;
END;
$$;

CREATE OR REPLACE FUNCTION public.grant_unlimited_credits(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  target_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NOT NULL THEN
    -- Insert or update user credits
    INSERT INTO public.user_credits (user_id, credits_remaining, is_unlimited, updated_at)
    VALUES (target_user_id, 999999, true, now())
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      credits_remaining = 999999,
      is_unlimited = true,
      updated_at = now();
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits_remaining, is_unlimited)
  VALUES (NEW.id, 3, false);
  RETURN NEW;
END;
$$;