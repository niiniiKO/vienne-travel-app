-- Profiles (Users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  avatar_url TEXT
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Schedules
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  title TEXT NOT NULL,
  event_type TEXT CHECK (event_type IN ('point', 'range')) DEFAULT 'point',
  address TEXT,
  tag TEXT[],
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transactions (Accounting)
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  amount NUMERIC NOT NULL,
  currency TEXT CHECK (currency IN ('EUR', 'JPY')) NOT NULL,
  paid_by UUID REFERENCES profiles(id) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Transaction Shares (Who owes whom)
CREATE TABLE transaction_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  -- We assume simple split: if listed here, they owe an equal share.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Wishes (Want to go)
CREATE TABLE wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  status TEXT CHECK (status IN ('want', 'done')) DEFAULT 'want',
  tag TEXT[],
  memo TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Infos (Knowledge)
CREATE TABLE infos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content_html TEXT,
  content_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tasks (To-do items)
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  memo TEXT,
  is_done BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for tags (allow all operations for now - adjust as needed)
CREATE POLICY "Allow all operations on tags" ON tags FOR ALL USING (true) WITH CHECK (true);

-- Create policies for tasks (allow all operations for now - adjust as needed)
CREATE POLICY "Allow all operations on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);

-- Create policies for schedules (allow all operations for now - adjust as needed)
CREATE POLICY "Allow all operations on schedules" ON schedules FOR ALL USING (true) WITH CHECK (true);

-- Initial Data (Members)
INSERT INTO profiles (name) VALUES ('青山'), ('浅田'), ('市川'), ('鬼澤');

-- Initial Data (Tags)
INSERT INTO tags (name) VALUES 
  ('sightseeing'),
  ('food'),
  ('move'),
  ('Munich'),
  ('Vienna'),
  ('Prague');
