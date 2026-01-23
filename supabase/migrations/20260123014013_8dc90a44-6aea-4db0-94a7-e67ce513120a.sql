-- Add is_public column to creations for gallery feature
ALTER TABLE public.creations 
ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Add likes count
ALTER TABLE public.creations 
ADD COLUMN likes_count INTEGER NOT NULL DEFAULT 0;

-- Add subscription status to profiles
ALTER TABLE public.profiles 
ADD COLUMN is_premium BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN subscription_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN stripe_customer_id TEXT;

-- Create likes table
CREATE TABLE public.creation_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creation_id UUID NOT NULL REFERENCES public.creations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(creation_id, user_id)
);

-- Enable RLS on likes
ALTER TABLE public.creation_likes ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Anyone can view likes" 
ON public.creation_likes FOR SELECT 
USING (true);

CREATE POLICY "Users can like" 
ON public.creation_likes FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" 
ON public.creation_likes FOR DELETE 
USING (auth.uid() = user_id);

-- Policy for viewing public creations (anyone can see)
CREATE POLICY "Anyone can view public creations" 
ON public.creations FOR SELECT 
USING (is_public = true);

-- Function to increment likes count
CREATE OR REPLACE FUNCTION public.increment_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.creations 
  SET likes_count = likes_count + 1 
  WHERE id = NEW.creation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION public.decrement_likes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.creations 
  SET likes_count = likes_count - 1 
  WHERE id = OLD.creation_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for likes count
CREATE TRIGGER on_like_created
AFTER INSERT ON public.creation_likes
FOR EACH ROW
EXECUTE FUNCTION public.increment_likes();

CREATE TRIGGER on_like_deleted
AFTER DELETE ON public.creation_likes
FOR EACH ROW
EXECUTE FUNCTION public.decrement_likes();