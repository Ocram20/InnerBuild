-- Create articles table for educational/scientific content
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can read published articles where published_at <= now()
CREATE POLICY "Public can read published articles" 
ON public.articles 
FOR SELECT 
USING (
  is_published = true 
  AND published_at <= now()
);

-- Create index for efficient querying by published_at
CREATE INDEX idx_articles_published_at ON public.articles(published_at DESC);

-- Create index for filtering published articles
CREATE INDEX idx_articles_is_published ON public.articles(is_published) WHERE is_published = true;