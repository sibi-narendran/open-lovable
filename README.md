# Open Lovable

Chat with AI to build React apps instantly. An example app made by the [Firecrawl](https://firecrawl.dev/?ref=open-lovable-github) team. For a complete cloud solution, check out [Lovable.dev](https://lovable.dev/) ❤️.

<img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExODAwZGJzcDVmZGYxc3MyNDUycTliYnAwem1qbzhtNHh0c2JrNDdmZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/LMYzMkNmOecj3yFw81/giphy.gif" alt="Open Lovable Demo" width="100%"/>

## Setup

1. **Clone & Install**
```bash
git clone https://github.com/firecrawl/open-lovable.git
cd open-lovable
pnpm install  # or npm install / yarn install
```

2. **Add `.env.local`**

```env
# =================================================================
# REQUIRED
# =================================================================
FIRECRAWL_API_KEY=your_firecrawl_api_key    # https://firecrawl.dev

# =================================================================
# AUTHENTICATION - Supabase (Required for user authentication)
# =================================================================
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url      # https://supabase.com/dashboard/project/_/settings/api
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key    # https://supabase.com/dashboard/project/_/settings/api

# =================================================================
# APPLICATION URL (Required for production magic link authentication)
# =================================================================
NEXT_PUBLIC_APP_URL=https://your-production-domain.com  # Your production domain URL (omit for localhost in development)

# =================================================================
# AI PROVIDER - Choose your LLM
# =================================================================
ANTHROPIC_API_KEY=your_anthropic_api_key  # https://console.anthropic.com
OPENAI_API_KEY=your_openai_api_key        # https://platform.openai.com
GEMINI_API_KEY=your_gemini_api_key        # https://aistudio.google.com/app/apikey
GROQ_API_KEY=your_groq_api_key            # https://console.groq.com

# =================================================================
# FAST APPLY (Optional - for faster edits)
# =================================================================
MORPH_API_KEY=your_morphllm_api_key    # https://morphllm.com/dashboard

# =================================================================
# SANDBOX PROVIDER - Choose ONE: Vercel (default) or E2B
# =================================================================
SANDBOX_PROVIDER=vercel  # or 'e2b'

# Option 1: Vercel Sandbox (default)
# Choose one authentication method:

# Method A: OIDC Token (recommended for development)
# Run `vercel link` then `vercel env pull` to get VERCEL_OIDC_TOKEN automatically
VERCEL_OIDC_TOKEN=auto_generated_by_vercel_env_pull

# Method B: Personal Access Token (for production or when OIDC unavailable)
# VERCEL_TEAM_ID=team_xxxxxxxxx      # Your Vercel team ID 
# VERCEL_PROJECT_ID=prj_xxxxxxxxx    # Your Vercel project ID
# VERCEL_TOKEN=vercel_xxxxxxxxxxxx   # Personal access token from Vercel dashboard

# Option 2: E2B Sandbox
# E2B_API_KEY=your_e2b_api_key      # https://e2b.dev
```

3. **Run**
```bash
pnpm dev  # or npm run dev / yarn dev
```

Open [http://localhost:3000](http://localhost:3000)

## Authentication

This project uses [Supabase](https://supabase.com) for user authentication with magic link email authentication.

### Setup Supabase

1. **Create a Supabase Project**
   - Go to [https://supabase.com](https://supabase.com)
   - Create a new project or use an existing one
   - Wait for the project to be fully provisioned

2. **Get Your Credentials**
   - Navigate to Project Settings → API
   - Copy your Project URL (`NEXT_PUBLIC_SUPABASE_URL`)
   - Copy your `anon` public key (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)

3. **Configure Environment Variables**
   - Add the Supabase credentials to your `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   # For production deployment - set your production domain URL
   NEXT_PUBLIC_APP_URL=https://your-production-domain.com
   ```

4. **Configure Email Redirect URL**
   - In Supabase Dashboard → Authentication → URL Configuration
   - Add your redirect URL: `http://localhost:3000/auth/callback` (for development)
   - Add your production URL: `https://your-domain.com/auth/callback` (for production)
   
   **Important**: The `NEXT_PUBLIC_APP_URL` environment variable must match your production domain to ensure magic links work correctly in production. The application automatically uses this URL for generating magic link callback URLs when deployed.

### Authentication Flow

1. **User enters email** → Navigate to `/auth` page
2. **Magic link sent** → User receives email with authentication link
3. **User clicks link** → Redirected to `/auth/callback` route
4. **Session created** → User is authenticated and redirected to home page
5. **Auth state persists** → Session is maintained across page refreshes using cookies

### Authentication Features

- ✅ Magic link email authentication (passwordless)
- ✅ Session persistence across page refreshes
- ✅ Auth state management via React Context
- ✅ Conditional UI rendering based on auth state
- ✅ User profile dropdown with logout
- ✅ Server-side and client-side auth handling

### Files Created

The following files were created for authentication:

- `lib/supabase/client.ts` - Browser-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client for Next.js
- `lib/supabase/middleware.ts` - Middleware helper for auth state management
- `app/auth/page.tsx` - Email entry form for magic link authentication
- `app/auth/callback/route.ts` - Callback handler for magic link authentication
- `contexts/AuthContext.tsx` - React context for auth state management
- `components/auth/UserIcon.tsx` - User avatar/icon component with dropdown menu

### Files Modified

The following files were modified:

- `app/layout.tsx` - Added `AuthProvider` wrapper to make auth state available app-wide
- `app/page.tsx` - Updated header to conditionally show Login/Get Started buttons or user icon

### Technical Details

- **Server-side auth**: Uses `@supabase/ssr` for Next.js App Router compatibility
- **Client-side auth**: Uses `@supabase/supabase-js` via SSR wrapper for browser operations
- **Session management**: Cookie-based session storage for persistence
- **UI components**: Radix UI `DropdownMenu` for accessible user menu
- **State management**: React Context API for global auth state
- **Auth state listener**: Real-time updates via Supabase `onAuthStateChange` event

## License

MIT
