# PixelPrompt - AI Image Editing Assistant Documentation

## Project Overview
- **Purpose**: AI-powered image editing assistant with natural language prompts
- **Version**: 0.2.0
- **Tech Stack**: Next.js 15, TypeScript, Supabase, Google Gemini AI
- **Author**: Mohammed Isa

## Architecture

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS + shadcn/ui
- **State**: React hooks + localStorage + IndexedDB
- **Auth**: Supabase Auth (with localStorage fallback)

### Backend
- **API**: Next.js API routes (Node.js runtime)
- **Database**: Supabase PostgreSQL (with localStorage fallback)
- **AI**: Google Gemini 2.5 Flash + Gemini 2.5 Flash Image Preview
- **Image Processing**: Sharp library for optimization

## File Structure
```
src/
├── app/
│   ├── api/
│   │   └── edit/route.ts              # Main image editing endpoint
│   ├── app/page.tsx                   # Main dashboard (3-tab interface)
│   ├── page.tsx                       # Landing page
│   └── layout.tsx                     # Root layout with providers
├── components/
│   ├── ui/                           # shadcn/ui components
│   ├── upload-view.tsx               # Image upload interface
│   ├── editor-view.tsx               # Image editing & comparison
│   ├── history-view.tsx              # Processing history
│   ├── image-viewer.tsx              # Full-screen image viewer
│   ├── auth-modal.tsx                # Authentication modal
│   ├── theme-toggle.tsx              # Dark/light mode toggle
│   └── user-menu.tsx                 # User menu with credits
├── lib/
│   ├── auth-context.tsx              # Authentication provider
│   ├── database.ts                   # Multi-layer storage service
│   ├── supabase.ts                   # Supabase client & types
│   ├── theme-context.tsx             # Theme management
│   └── utils.ts                      # Utility functions
└── types/index.ts                    # TypeScript definitions
```

## Core Workflow
1. **Upload**: User uploads image and provides text prompt describing desired edits
2. **Process**: Convert image to base64 → Send to Gemini 2.5 Flash Image Preview
3. **Edit**: AI processes image with requested changes
4. **Display**: Show before/after comparison in dashboard
5. **Save**: Store to Supabase + localStorage + IndexedDB

## API Endpoints

### Image Editing (`/api/edit`)
- **POST**: Main editing endpoint
  - Accepts both URLs and base64 data URLs
  - Base64 parsing → Sharp processing → Gemini AI → Fallback strategies
  - Timeouts: 30s download, 45s AI processing
  - Fallbacks: Enhanced Sharp processing → Original image

## Data Models

### Uploaded Image
```typescript
interface UploadedImage {
  id: string
  file: File
  preview: string  // base64 data URL
  name: string
  size: number
}
```

### History Item
```typescript
interface HistoryItem {
  id: string
  postId: string
  postTitle: string
  requestText: string  // User's edit prompt
  status: 'completed' | 'failed'
  originalImageUrl: string
  editedImageUrl?: string
  timestamp: number
  processingTime?: number
}
```

## Storage Strategy
**Three-tier fallback system:**
1. **Supabase Database** (authenticated users) → RLS policies, user management
2. **localStorage** (browser storage) → JSON serialization, 50 item limit
3. **IndexedDB** (persistent browser) → Editor history, offline capability

## Database Schema (Supabase)
```sql
-- Users (extends auth.users)
users: id, email, name, avatar_url, is_admin, created_at, updated_at

-- Edit processing history
edit_history: id, user_id, post_id, post_title, request_text, edit_prompt, original_image_url, edited_image_url, method, status, processing_time

-- User credit system
user_credits: id, user_id, daily_generations, last_reset_date, total_generations
```

## Component Logic

### Dashboard (`app/page.tsx`)
- Three tabs: Upload, Editor, History
- localStorage event listeners for real-time updates
- Pending item notifications with badges

### Upload View (`upload-view.tsx`)
- Drag-and-drop file upload interface
- File validation (image types, 10MB max)
- Preview with remove functionality
- Text prompt input for edit description
- Creates edit requests → stores in localStorage → triggers Editor tab

### Editor View (`editor-view.tsx`)
- Listens for pending items in localStorage
- Processes images via POST /api/edit
- Before/after comparison (slider + side-by-side)
- Saves to all storage layers (Supabase + localStorage + IndexedDB)

### History View (`history-view.tsx`)
- Loads from all storage sources
- Normalizes different data formats
- Client-side filtering and search

## Environment Variables
```env
# Required
GEMINI_API_KEY=                    # Google AI API key

# Optional (Supabase - falls back to localStorage)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Optional (Admin Configuration)
ADMIN_ID=                          # Admin email for unlimited generations
ADMIN_UID=                         # Admin user ID
```

## Error Handling
- **API Timeouts**: Comprehensive timeout management (30s download, 45s AI processing)
- **File Validation**: Image type and size validation before upload
- **Storage Fallbacks**: Automatic fallback between storage layers
- **AI Failures**: Multiple processing strategies with enhanced fallbacks
- **Network Issues**: Offline capability with IndexedDB

## Key Features
- **Drag-and-Drop Upload**: Intuitive file upload with preview
- **Natural Language Editing**: Describe edits in plain English
- **Responsive Design**: Mobile-first with touch optimization
- **Real-time Updates**: localStorage events for cross-component communication
- **Offline Support**: IndexedDB for persistent storage
- **Image Optimization**: Sharp processing with multiple formats
- **Authentication**: Supabase Auth with Google OAuth
- **Credit System**: 2 free generations per day (unlimited for admins)
- **Theme System**: Dark/light mode with persistence
- **Download System**: Multiple image format support

## Development Notes
- Uses Node.js runtime for API routes (Buffer support)
- Follows functional programming patterns
- Strict TypeScript with comprehensive type definitions
- shadcn/ui components with Radix UI primitives
- Mobile-optimized with proper touch targets
- SEO optimized with complete meta tags
