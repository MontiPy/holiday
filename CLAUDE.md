# Thanksgiving Gratitude App

A beautiful, cozy Thanksgiving gratitude board where family and friends can leave warm notes before the feast.

## Project Overview

This is a static web application with:
- **Frontend**: Vanilla HTML, CSS, and JavaScript
- **Backend**: Supabase for real-time note storage and retrieval
- **Deployment**: Vercel

## Technology Stack

- HTML5 + CSS3 (custom styling with warm autumn theme)
- Vanilla JavaScript (no framework dependencies)
- Supabase REST API for data persistence
- Vercel for hosting and deployment

## Project Structure

```
holiday/
├── index.html              # Main HTML page
├── script.js               # App logic and Supabase integration
├── styles.css              # Custom styling
├── backend.config.js       # Generated config (gitignored)
├── backend.config.example.js  # Template for config
├── build.js                # Build script to generate config from env vars
├── package.json            # NPM configuration
├── vercel.json            # Vercel deployment configuration
└── .gitignore             # Git ignore rules
```

## Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd holiday
   ```

2. **Set up Supabase configuration**

   Copy the example config:
   ```bash
   cp backend.config.example.js backend.config.js
   ```

   Edit `backend.config.js` with your Supabase credentials:
   ```javascript
   window.BACKEND_CONFIG = {
     supabaseUrl: "https://your-project.supabase.co",
     supabaseAnonKey: "your-anon-key",
     table: "gratitude_notes",
   };
   ```

3. **Set up Supabase database**

   Create a table in your Supabase project:
   ```sql
   CREATE TABLE gratitude_notes (
     id BIGSERIAL PRIMARY KEY,
     name TEXT NOT NULL,
     message TEXT NOT NULL,
     created TIMESTAMPTZ DEFAULT NOW()
   );

   -- Enable Row Level Security
   ALTER TABLE gratitude_notes ENABLE ROW LEVEL SECURITY;

   -- Allow anyone to read notes
   CREATE POLICY "Anyone can read notes"
     ON gratitude_notes FOR SELECT
     USING (true);

   -- Allow anyone to create notes
   CREATE POLICY "Anyone can create notes"
     ON gratitude_notes FOR INSERT
     WITH CHECK (true);
   ```

4. **Open in browser**

   Simply open `index.html` in your web browser. No build step needed for local development.

## Deploying to Vercel

### Prerequisites

- A [Vercel account](https://vercel.com/signup)
- A [Supabase account](https://supabase.com) with a project set up
- The Supabase table created (see Local Development step 3)

### Deployment Steps

#### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables**
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_ANON_KEY
   vercel env add SUPABASE_TABLE
   ```

5. **Redeploy with environment variables**
   ```bash
   vercel --prod
   ```

#### Option 2: Deploy via Vercel Dashboard

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`

3. **Configure environment variables**

   In the Vercel dashboard, add these environment variables:

   | Name | Value | Example |
   |------|-------|---------|
   | `SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` |
   | `SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGci...` |
   | `SUPABASE_TABLE` | Table name (optional) | `gratitude_notes` |

   To find these values:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and anon/public key

4. **Deploy**
   - Click "Deploy"
   - Vercel will run `npm run build` which generates `backend.config.js` from your environment variables
   - Your site will be live in seconds!

### Environment Variables

The build script (`build.js`) reads these environment variables and generates `backend.config.js`:

- **SUPABASE_URL** (required): Your Supabase project URL
- **SUPABASE_ANON_KEY** (required): Your Supabase anonymous key (safe to use client-side with RLS)
- **SUPABASE_TABLE** (optional): Table name, defaults to `gratitude_notes`

## Security Notes

- The Supabase anon key is safe to expose in client-side code when Row Level Security (RLS) policies are properly configured
- RLS policies ensure users can only read and create notes, not update or delete
- The `backend.config.js` file is gitignored to prevent accidental commits of credentials during local development
- During Vercel deployment, the file is generated from environment variables

## Features

- **Countdown Timer**: Shows days and hours until Thanksgiving
- **Gratitude Board**: Real-time shared notes that sync across all visitors
- **Offline Support**: Falls back to localStorage if Supabase is unavailable
- **Responsive Design**: Beautiful on mobile and desktop
- **No Build Required**: Pure HTML/CSS/JS for simple local development

## Troubleshooting

### Notes aren't saving to Supabase

1. Check that environment variables are set correctly in Vercel
2. Verify your Supabase table exists and has the correct schema
3. Ensure RLS policies are enabled and allow INSERT and SELECT operations
4. Check the browser console for error messages

### Build fails on Vercel

1. Ensure `package.json` and `build.js` are committed to your repository
2. Check that all environment variables are set in Vercel dashboard
3. Review the build logs in Vercel for specific error messages

### App shows "local-only mode" message

This means the Supabase configuration is missing or invalid. Check:
1. Environment variables are set in Vercel
2. The build script successfully generated `backend.config.js`
3. Your Supabase URL and key are correct

## Future Enhancements

- Add ability to edit/delete own notes
- Implement user authentication
- Add photo uploads to notes
- Export notes as PDF for printing
- Add emoji reactions to notes

## License

MIT
