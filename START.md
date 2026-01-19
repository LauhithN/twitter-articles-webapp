# Quick Start - Run Locally Without Supabase

The app includes demo data, so you can run it immediately without configuring Supabase.

## Steps

1. **Install dependencies:**
   ```bash
   cd twitter-articles-webapp
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   ```
   http://localhost:3000
   ```

That's it! The app will automatically display 6 demo articles with the brutalist design.

## What You'll See

- Homepage with "Popular on X" header
- 6 demo articles in a responsive grid (1/2/3 columns)
- Brutalist design: black borders, green accent (#00ff00), no rounded corners
- "REFRESH" button (won't do anything without Supabase)
- Article cards showing:
  - Domain and tweet count
  - Article title
  - Description
  - "Updated Xh ago" timestamp

## Add Real Data Later

When ready to connect real data:

1. Create Supabase project
2. Run SQL from README.md
3. Copy `.env.local.example` to `.env.local`
4. Add your Supabase credentials
5. Restart the dev server

The app will automatically switch from demo data to real Supabase data.

## Build for Production

```bash
npm run build
npm start
```

Or deploy to Vercel - it works the same with or without Supabase configured.
