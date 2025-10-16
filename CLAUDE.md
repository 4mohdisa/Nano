# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PixelPrompt is an AI-powered image editing assistant that allows users to upload images and describe edits in natural language. The app uses Google Gemini AI to process and apply the requested changes. Built with Next.js 15, TypeScript, and Supabase.

## Development Commands

### Essential Commands
```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Environment Setup
Required: Create `.env.local` with `GEMINI_API_KEY`
Optional: Reddit API credentials (`REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`)
Optional: Supabase config (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
Optional: OpenRouter API key (`OPENROUTER_API_KEY`)

## Architecture Patterns

### Three-Tier Storage System
1. **Supabase (Primary)**: Authenticated users with RLS policies
2. **localStorage (Fallback)**: Client-side JSON storage (50 item limit)
3. **IndexedDB (Offline)**: Editor history and pending items

All database operations in `src/lib/database.ts` automatically cascade through these tiers. Always check `isSupabaseConfigured()` before Supabase calls.

### AI Processing Pipeline
1. **Upload** (Upload Tab) - User uploads image via drag-and-drop or file picker + enters text prompt
2. **Edit** (`/api/edit`) - Main endpoint handles both URL and base64 images with multi-strategy fallback (Gemini Image → Sharp enhancement → original)
3. **Alternative** (`/api/gemini/edit`) - OpenRouter fallback using base64 encoding (currently unused)

### Cross-Component Communication
Uses localStorage events for real-time updates between tabs:
- `pendingEditorItem` - Triggers Editor processing from Upload tab
- `editHistory` - Updates History view after edits
- Storage event listeners in `app/page.tsx` coordinate tab switching

### API Timeout Management
- Image download: 30s
- AI processing: 45s
- Total request: 2 minutes max
- Reddit API: Rate-limited with delays

## Key Type Definitions

All types in `src/types/index.ts`:

**RedditPost**: Reddit API response format
**EditForm**: Structured AI parsing output with `task_type`, `instructions`, `objects_to_remove/add`, `style`, `mask_needed`
**EditRequest**: Processing state tracker
**HistoryItem**: Completed edit record

## Component Responsibilities

**Dashboard** (`app/page.tsx`): Three-tab interface (Upload/Editor/History) with localStorage listeners for real-time coordination

**Upload View** (`upload-view.tsx`): Drag-and-drop or file picker for image upload → text prompt input → sends to Editor tab via localStorage events

**Editor View**: Processes pending items with uploaded images → calls `/api/edit` → saves to all storage layers → displays before/after comparison

**History View**: Loads from all storage sources → normalizes formats → client-side filtering

## Database Patterns

### User Credits System
- Daily limit: 2 generations for regular users, unlimited for admins
- Auto-reset via `reset_daily_credits()` function
- Check with `DatabaseService.checkCreditLimit(userId)` before edits
- Increment with `DatabaseService.incrementUserCredits(userId)`

### Admin Management
Functions: `is_user_admin()`, `set_user_admin_by_email()`, `set_user_admin_by_uid()`
Env vars: `ADMIN_ID` (email), `ADMIN_UID` (UUID)

### Row Level Security
All tables have RLS policies - users can only access their own data unless admin

## Image Processing

Uses Sharp for server-side manipulation:
- JPEG quality: 90
- PNG compression: 6
- WebP quality: 85
- Max dimensions: 2048x2048

Images are downloaded, processed, converted to base64 for AI APIs.

## Important Notes

### API Runtime Configuration
API routes use Node.js runtime (requires `Buffer` support). Edge runtime not compatible with current image processing pipeline.

### Path Aliases
Use `@/*` for imports from `src/` directory (configured in tsconfig.json)

### Next.js Image Domains
Configured in `next.config.js` for Reddit and Imgur CDNs. Add new domains there if fetching from additional sources.

### Authentication Flow
Supabase Auth with Google OAuth. Trigger `handle_new_user()` creates user profile automatically. Falls back to localStorage when Supabase unavailable.

### Credit System Integration
Always check credits before initiating edits:
```typescript
const { canGenerate, remainingCredits, isAdmin } = await DatabaseService.checkCreditLimit(userId)
if (!canGenerate) throw new Error('Daily limit reached')
```

## Testing Notes

No test suite currently implemented. Manual testing via:
1. Queue tab: Test Reddit fetching and parsing
2. Editor tab: Test image processing pipeline
3. History tab: Test storage retrieval and display
4. API routes have GET endpoints returning mock data for testing

## Common Development Patterns

### Adding New Storage
1. Add table to `supabase-schema.sql`
2. Add types to `src/lib/supabase.ts` Database interface
3. Add methods to `src/lib/database.ts` with Supabase + localStorage fallback
4. Add RLS policies if user-specific data

### Adding New AI Features
1. Create API route in `src/app/api/`
2. Use Node.js runtime for Buffer support
3. Implement timeout handling (45s max)
4. Add fallback strategies for failures
5. Update EditForm types if needed

### Component State Management
Prefer localStorage + events over prop drilling for cross-tab communication. Use React hooks for local state, context for theme/auth only.
