-- Create story_chapters table for chapter-based stories
CREATE TABLE public.story_chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creation_id UUID NOT NULL REFERENCES public.creations(id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  is_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(creation_id, chapter_number)
);

-- Enable RLS
ALTER TABLE public.story_chapters ENABLE ROW LEVEL SECURITY;

-- Create policies (access based on parent creation ownership)
CREATE POLICY "Users can view their story chapters" 
ON public.story_chapters 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.creations 
    WHERE creations.id = story_chapters.creation_id 
    AND creations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chapters for their stories" 
ON public.story_chapters 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.creations 
    WHERE creations.id = story_chapters.creation_id 
    AND creations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their story chapters" 
ON public.story_chapters 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.creations 
    WHERE creations.id = story_chapters.creation_id 
    AND creations.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their story chapters" 
ON public.story_chapters 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.creations 
    WHERE creations.id = story_chapters.creation_id 
    AND creations.user_id = auth.uid()
  )
);

-- Policy for public creations chapters viewing
CREATE POLICY "Anyone can view public story chapters" 
ON public.story_chapters 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.creations 
    WHERE creations.id = story_chapters.creation_id 
    AND creations.is_public = true
  )
);

-- Trigger for updated_at
CREATE TRIGGER update_story_chapters_updated_at
BEFORE UPDATE ON public.story_chapters
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();