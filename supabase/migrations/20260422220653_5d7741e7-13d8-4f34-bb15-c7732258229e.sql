-- HABITS
CREATE TABLE public.habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL DEFAULT '✨',
  color TEXT NOT NULL DEFAULT '#4f46e5',
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- COMPLETIONS
CREATE TABLE public.completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (habit_id, date)
);

CREATE INDEX idx_completions_user_date ON public.completions(user_id, date);

ALTER TABLE public.completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own completions" ON public.completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own completions" ON public.completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own completions" ON public.completions FOR DELETE USING (auth.uid() = user_id);

-- BADGES
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_key TEXT NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_key, habit_id)
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own badges" ON public.badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own badges" ON public.badges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own badges" ON public.badges FOR DELETE USING (auth.uid() = user_id);

-- USER SETTINGS
CREATE TABLE public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL PRIMARY KEY,
  dark_mode BOOLEAN NOT NULL DEFAULT true,
  primary_color TEXT NOT NULL DEFAULT '#4f46e5',
  accent_color TEXT NOT NULL DEFAULT '#818cf8',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own settings" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own settings" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own settings" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- Auto-create settings on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();