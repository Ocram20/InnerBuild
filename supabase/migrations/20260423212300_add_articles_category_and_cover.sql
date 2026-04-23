ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'article';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS cover_image_url text;
