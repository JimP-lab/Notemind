-- Create user_credits table to track credits for each user
CREATE TABLE public.user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits_remaining INTEGER NOT NULL DEFAULT 3,
  is_unlimited BOOLEAN NOT NULL DEFAULT false,
  last_reset_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- Users can only view and update their own credits
CREATE POLICY "Users can view their own credits" 
ON public.user_credits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" 
ON public.user_credits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Edge functions can manage credits" 
ON public.user_credits 
FOR ALL 
USING (true);

-- Create function to reset daily credits
CREATE OR REPLACE FUNCTION public.reset_daily_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to grant unlimited credits after payment
CREATE OR REPLACE FUNCTION public.grant_unlimited_credits(user_email TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to initialize user credits
CREATE OR REPLACE FUNCTION public.initialize_user_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, credits_remaining, is_unlimited)
  VALUES (NEW.id, 3, false);
  RETURN NEW;
END;
$$;

-- Create trigger to initialize credits when user signs up
CREATE TRIGGER on_user_created_init_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_user_credits();