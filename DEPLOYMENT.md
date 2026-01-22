# デプロイメントガイド

このガイドでは、Vienneアプリ（旅行管理アプリ）をVercelとSupabaseを使用してデプロイする手順を説明します。

## 📋 前提条件

- GitHubアカウント
- Vercelアカウント（GitHubでサインアップ可能）
- Supabaseアカウント（無料プランで十分）

## 🗄️ Step 1: Supabaseプロジェクトのセットアップ

### 1.1 Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com/)にアクセスしてログイン
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Name**: `vienne-travel-app`（任意の名前）
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)`（日本から最も近い）
4. 「Create new project」をクリックして数分待つ

### 1.2 データベーススキーマの作成

1. Supabaseダッシュボードで、左メニューから「SQL Editor」を選択
2. 「New Query」をクリック
3. 以下のSQLスキーマを実行：

```sql
-- Profilesテーブル（ユーザー情報）
CREATE TABLE profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schedules（スケジュール）
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id),
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  address TEXT,
  tags TEXT[],
  notes TEXT,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions（会計記録）
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  paid_by TEXT REFERENCES profiles(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  purpose TEXT,
  schedule_id UUID REFERENCES schedules(id),
  participants TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wishes（行きたい場所リスト）
CREATE TABLE wishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES profiles(id),
  title TEXT NOT NULL,
  location TEXT,
  url TEXT,
  tags TEXT[],
  notes TEXT,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tags（タグマスター）
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  category TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 初期データの挿入（メンバー4人）
INSERT INTO profiles (id, name) VALUES
  ('u1', '青山'),
  ('u2', '浅田'),
  ('u3', '市川'),
  ('u4', '鬼澤');

-- サンプルタグの挿入
INSERT INTO tags (name, color, category) VALUES
  ('観光', '#8B4513', 'schedule'),
  ('食事', '#DC143C', 'schedule'),
  ('移動', '#4169E1', 'schedule'),
  ('ショッピング', '#FFD700', 'schedule'),
  ('宿泊', '#2E8B57', 'schedule'),
  ('イベント', '#FF1493', 'schedule');

-- Row Level Security (RLS) の有効化
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

-- 全てのユーザーが読み書きできるポリシー（開発用）
CREATE POLICY "Enable all operations for all users" ON profiles FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON schedules FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON transactions FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON wishes FOR ALL USING (true);
CREATE POLICY "Enable all operations for all users" ON tags FOR ALL USING (true);
```

4. 「RUN」をクリックしてスキーマを実行

### 1.3 API認証情報の取得

1. 左メニューから「Settings」→「API」を選択
2. 以下の情報をメモ：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`（長いキー）

## 🚀 Step 2: Vercelでのデプロイ

### 2.1 GitHubリポジトリの準備

1. GitHubで新しいリポジトリを作成
2. ローカルのプロジェクトをプッシュ：

```bash
cd C:\Users\keigo\Downloads\Vienne
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/your-username/vienne-travel-app.git
git push -u origin main
```

### 2.2 Vercelプロジェクトのセットアップ

1. [Vercel](https://vercel.com/)にアクセスしてログイン
2. 「Add New...」→「Project」をクリック
3. GitHubリポジトリを選択してインポート
4. プロジェクト設定：
   - **Framework Preset**: Next.js（自動検出される）
   - **Root Directory**: `app`（重要！）
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. 環境変数の設定（Environment Variables）：
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabaseから取得したProject URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabaseから取得したanon key

6. 「Deploy」をクリック

### 2.3 デプロイ完了

数分待つとデプロイが完了します。Vercelが自動的にURLを発行します：
- Production: `https://your-app.vercel.app`

## 📱 Step 3: PWAの設定（オプション）

アプリをスマートフォンのホーム画面に追加できるようにします。

1. ブラウザでデプロイされたアプリを開く
2. モバイルブラウザのメニューから「ホーム画面に追加」を選択
3. アプリアイコンがホーム画面に追加されます

## 🔧 Step 4: ローカル開発環境のセットアップ

デプロイ後もローカルで開発を続ける場合：

1. `.env.local`ファイルを作成：

```bash
cd app
cp .env.local.example .env.local
```

2. `.env.local`を編集してSupabaseの認証情報を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

3. 開発サーバーを起動：

```bash
npm run dev
```

## 🔄 継続的デプロイ

Vercelは自動的にGitHubと連携しています：
- `main`ブランチへのプッシュ → 本番環境に自動デプロイ
- 他のブランチへのプッシュ → プレビュー環境に自動デプロイ

## 🐛 トラブルシューティング

### ビルドエラーが発生する場合

1. Vercelのダッシュボードで「Deployments」タブを確認
2. 失敗したデプロイのログを確認
3. よくある原因：
   - 環境変数が設定されていない
   - Root Directoryが`app`になっていない
   - TypeScriptのエラー

### データベース接続エラー

1. `.env.local`の環境変数が正しく設定されているか確認
2. SupabaseのAPIキーが正しいか確認
3. Supabaseプロジェクトが有効か確認

### PWAが動作しない

1. HTTPSで配信されているか確認（Vercelは自動的にHTTPS）
2. `manifest.json`が正しく配置されているか確認
3. Service Workerの設定を確認

## 📊 データの管理

### Supabaseダッシュボードでデータを確認

1. Supabaseダッシュボード → 「Table Editor」
2. 各テーブルのデータを直接編集可能
3. SQLクエリで複雑な操作も可能

### データのバックアップ

1. Supabaseダッシュボード → 「Settings」→「Database」
2. 定期的にバックアップを実行することを推奨

## 🎉 完了！

これでアプリがデプロイされ、誰でもアクセスできるようになりました。
旅行を楽しんでください！🇦🇹✈️
