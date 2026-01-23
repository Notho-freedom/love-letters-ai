-- Enable pg_cron and pg_net extensions for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Create templates table
CREATE TABLE public.templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('poem', 'letter', 'story', 'message')),
  description TEXT NOT NULL,
  content TEXT NOT NULL,
  tone TEXT NOT NULL DEFAULT 'romantic',
  occasion TEXT,
  emoji TEXT NOT NULL DEFAULT '💕',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS and allow public read
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view templates" 
ON public.templates FOR SELECT 
USING (true);

-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  emoji TEXT NOT NULL,
  condition_type TEXT NOT NULL,
  condition_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS and allow public read
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" 
ON public.badges FOR SELECT 
USING (true);

-- Create user_badges table
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their badges" 
ON public.user_badges FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert badges" 
ON public.user_badges FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('like', 'scheduled_reminder', 'badge_earned', 'creation_sent')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  related_id UUID,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_emailed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

-- Add notification preferences to profiles
ALTER TABLE public.profiles 
ADD COLUMN email_notifications BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN like_notifications BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN reminder_notifications BOOLEAN NOT NULL DEFAULT true;

-- Insert default templates
INSERT INTO public.templates (name, type, description, content, tone, occasion, emoji, is_premium) VALUES
('Déclaration passionnée', 'poem', 'Un poème intense pour déclarer votre amour', 'Mon cœur bat pour toi seul(e),
Comme l''océan bat contre les rochers,
Inlassablement, passionnément, éternellement.

Chaque instant sans toi est un désert,
Chaque seconde avec toi est un jardin fleuri.
Tu es ma lumière dans la nuit,
Mon étoile guide, ma raison de vivre.

Je t''aime plus que les mots ne peuvent le dire,
Plus que le soleil n''aime le ciel,
Plus que la lune n''aime les étoiles.', 'passionate', 'declaration', '💘', false),

('Tendresse quotidienne', 'message', 'Un message doux pour le quotidien', 'Mon amour,

Je pense à toi en ce moment et je voulais simplement te dire combien tu comptes pour moi. Ta présence illumine mes journées et ton sourire réchauffe mon cœur.

Merci d''être toi, tout simplement.

Je t''aime.', 'tender', 'quotidien', '💌', false),

('Lettre d''anniversaire', 'letter', 'Une lettre romantique pour un anniversaire', 'Mon amour,

En ce jour si spécial, je voulais prendre le temps de te dire tout ce que mon cœur ressent. Depuis que tu es entré(e) dans ma vie, chaque jour est une nouvelle aventure, chaque moment une nouvelle raison de sourire.

Tu as transformé ma vie en un conte de fées moderne, où l''amour n''est pas un rêve mais une réalité quotidienne. Tes yeux, ton sourire, ta voix... tout en toi me fait tomber amoureux(se) encore et encore.

Joyeux anniversaire, mon étoile.

Avec tout mon amour,', 'romantic', 'anniversaire', '🎂', false),

('Réconciliation', 'letter', 'Une lettre pour se faire pardonner', 'Mon cœur,

Les mots me manquent pour exprimer combien je regrette. Ce silence entre nous me pèse plus que tout. Tu es ma moitié, et sans toi, je suis incomplet(e).

Je sais que j''ai fait des erreurs, et je veux que tu saches que je suis prêt(e) à tout pour réparer ce qui a été brisé. Notre amour vaut tous les combats, toutes les larmes.

Pardonne-moi, s''il te plaît.

Je t''aime, aujourd''hui et pour toujours.', 'tender', 'reconciliation', '🕊️', false),

('Histoire magique', 'story', 'Une courte histoire d''amour enchantée', 'Il était une fois, dans un monde pas si lointain, deux âmes qui ne savaient pas encore qu''elles étaient destinées à se trouver.

Le premier jour où leurs regards se croisèrent, les étoiles elles-mêmes sourirent. C''était comme si l''univers entier s''était aligné pour ce moment précis, comme si chaque instant de leur vie n''avait été qu''une préparation à cette rencontre.

Et depuis ce jour, ils écrivent ensemble la plus belle des histoires...

La leur.', 'poetic', NULL, '✨', false),

('Saint-Valentin Premium', 'poem', 'Poème exclusif pour la Saint-Valentin', 'Dans le jardin secret de mon âme,
Où fleurissent les roses éternelles,
Tu es le soleil qui réchauffe,
Tu es la pluie qui fait grandir.

Nos deux cœurs battent à l''unisson,
Symphonie parfaite de l''amour,
Mélodie que seuls les anges connaissent,
Et que nous jouons chaque jour.

En cette Saint-Valentin,
Je te promets les étoiles,
La lune, le soleil et l''infini,
Car avec toi, tout devient possible.', 'romantic', 'saint-valentin', '💝', true),

('Première rencontre', 'poem', 'Pour célébrer le jour où tout a commencé', 'Ce jour-là, l''univers a changé,
Quand pour la première fois je t''ai regardé(e).
Le temps s''est arrêté, mon cœur a dansé,
Et depuis, plus rien n''est comme avant.

Tu as coloré mon monde en gris,
De toutes les couleurs de l''arc-en-ciel.
Merci d''exister, merci d''être là,
Merci de m''aimer comme tu le fais.', 'romantic', 'rencontre', '💫', false);

-- Insert default badges
INSERT INTO public.badges (code, name, description, emoji, condition_type, condition_value) VALUES
('first_creation', 'Premier Poète', 'Créez votre première œuvre d''amour', '✍️', 'creations_count', 1),
('prolific_writer', 'Plume d''Or', 'Créez 10 œuvres d''amour', '🏆', 'creations_count', 10),
('master_poet', 'Maître Poète', 'Créez 50 œuvres d''amour', '👑', 'creations_count', 50),
('first_send', 'Cupidon', 'Envoyez votre première création', '💘', 'sends_count', 1),
('popular_creator', 'Cœur d''Or', 'Recevez 10 likes sur vos créations', '💛', 'likes_received', 10),
('loved_by_all', 'Icône de l''Amour', 'Recevez 100 likes sur vos créations', '💖', 'likes_received', 100),
('first_share', 'Généreux', 'Partagez une création dans la galerie', '🌟', 'shares_count', 1),
('audio_lover', 'Voix de l''Amour', 'Convertissez 5 créations en audio', '🎵', 'audio_count', 5),
('premium_member', 'VIP', 'Devenez membre Premium', '💎', 'is_premium', 1),
('scheduler', 'Planificateur', 'Programmez 5 envois', '📅', 'scheduled_count', 5);

-- Function to check and award badges
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER AS $$
DECLARE
  badge_record RECORD;
  user_stats RECORD;
  v_user_id UUID;
BEGIN
  -- Get user_id from the affected row
  IF TG_TABLE_NAME = 'creations' THEN
    v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  ELSIF TG_TABLE_NAME = 'creation_likes' THEN
    -- For likes, we need to get the creation owner
    SELECT user_id INTO v_user_id FROM public.creations WHERE id = COALESCE(NEW.creation_id, OLD.creation_id);
  ELSE
    v_user_id := COALESCE(NEW.user_id, OLD.user_id);
  END IF;

  IF v_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Calculate user stats
  SELECT 
    (SELECT COUNT(*) FROM public.creations WHERE user_id = v_user_id) as creations_count,
    (SELECT COUNT(*) FROM public.creations WHERE user_id = v_user_id AND is_sent = true) as sends_count,
    (SELECT COALESCE(SUM(likes_count), 0) FROM public.creations WHERE user_id = v_user_id) as likes_received,
    (SELECT COUNT(*) FROM public.creations WHERE user_id = v_user_id AND is_public = true) as shares_count,
    (SELECT COUNT(*) FROM public.creations WHERE user_id = v_user_id AND audio_url IS NOT NULL) as audio_count,
    (SELECT COUNT(*) FROM public.scheduled_emails WHERE user_id = v_user_id) as scheduled_count,
    (SELECT CASE WHEN is_premium THEN 1 ELSE 0 END FROM public.profiles WHERE user_id = v_user_id) as is_premium
  INTO user_stats;

  -- Check each badge
  FOR badge_record IN SELECT * FROM public.badges LOOP
    -- Skip if already earned
    IF EXISTS (SELECT 1 FROM public.user_badges WHERE user_id = v_user_id AND badge_id = badge_record.id) THEN
      CONTINUE;
    END IF;

    -- Check condition
    IF (badge_record.condition_type = 'creations_count' AND user_stats.creations_count >= badge_record.condition_value) OR
       (badge_record.condition_type = 'sends_count' AND user_stats.sends_count >= badge_record.condition_value) OR
       (badge_record.condition_type = 'likes_received' AND user_stats.likes_received >= badge_record.condition_value) OR
       (badge_record.condition_type = 'shares_count' AND user_stats.shares_count >= badge_record.condition_value) OR
       (badge_record.condition_type = 'audio_count' AND user_stats.audio_count >= badge_record.condition_value) OR
       (badge_record.condition_type = 'scheduled_count' AND user_stats.scheduled_count >= badge_record.condition_value) OR
       (badge_record.condition_type = 'is_premium' AND user_stats.is_premium >= badge_record.condition_value) THEN
      
      -- Award badge
      INSERT INTO public.user_badges (user_id, badge_id) VALUES (v_user_id, badge_record.id);
      
      -- Create notification
      INSERT INTO public.notifications (user_id, type, title, message, related_id)
      VALUES (v_user_id, 'badge_earned', 'Nouveau badge débloqué !', badge_record.emoji || ' ' || badge_record.name || ' - ' || badge_record.description, badge_record.id);
    END IF;
  END LOOP;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for badge checking
CREATE TRIGGER check_badges_on_creation
AFTER INSERT OR UPDATE ON public.creations
FOR EACH ROW
EXECUTE FUNCTION public.check_and_award_badges();

CREATE TRIGGER check_badges_on_like
AFTER INSERT ON public.creation_likes
FOR EACH ROW
EXECUTE FUNCTION public.check_and_award_badges();

-- Function to create like notification
CREATE OR REPLACE FUNCTION public.notify_on_like()
RETURNS TRIGGER AS $$
DECLARE
  creation_owner UUID;
  creation_type TEXT;
  liker_name TEXT;
BEGIN
  -- Get creation owner and type
  SELECT user_id, type INTO creation_owner, creation_type FROM public.creations WHERE id = NEW.creation_id;
  
  -- Don't notify if liking own creation
  IF creation_owner = NEW.user_id THEN
    RETURN NEW;
  END IF;
  
  -- Get liker name
  SELECT full_name INTO liker_name FROM public.profiles WHERE user_id = NEW.user_id;
  
  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, message, related_id)
  VALUES (
    creation_owner, 
    'like', 
    'Nouveau like ! 💖', 
    COALESCE(liker_name, 'Quelqu''un') || ' a aimé votre ' || creation_type,
    NEW.creation_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER notify_like
AFTER INSERT ON public.creation_likes
FOR EACH ROW
EXECUTE FUNCTION public.notify_on_like();