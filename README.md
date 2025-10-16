# PixelPrompt - AI-Powered Image Editor

![PixelPrompt Screenshot](./screenshot.jpg)

**Version 0.2.0**

PixelPrompt is an intelligent image editing assistant that allows you to upload photos and describe edits in natural language. Powered by Google Gemini AI, it automatically applies your requested changes to create professional-looking edited images.

## ✨ Features

- **🎨 Simple Upload Interface**: Drag-and-drop or browse to upload your images
- **💬 Natural Language Prompts**: Describe edits in plain English - no technical skills needed
- **⚡ Lightning Fast**: AI-powered editing in seconds using Google Gemini 2.5 Flash Image Preview
- **🔒 Privacy First**: Secure processing with enterprise-grade security
- **☁️ Cloud Storage**: Save your edits with Supabase-powered cloud storage
- **📱 Mobile Responsive**: Works seamlessly on all devices
- **🎯 Credit System**: 2 free generations per day for all users
- **🌓 Dark/Light Mode**: Beautiful interface in both themes

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Google AI API key (for Gemini)
- Supabase account (optional - works with localStorage fallback)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/4mohdisa/pixelprompt.git
cd pixelprompt
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# Required: Google AI (Gemini) API Key
GEMINI_API_KEY=your_google_ai_api_key_here

# Optional: Supabase (falls back to localStorage if not configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Admin Configuration
ADMIN_ID=your_admin_email@example.com
ADMIN_UID=your_admin_user_id
```

4. **Run the development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 How to Use

### Simple 3-Step Process:

1. **Upload**: Drag-and-drop your image or click to browse (supports PNG, JPG, WEBP up to 10MB)
2. **Describe**: Enter a text prompt describing the edits you want (e.g., "Remove the person in the background and enhance the colors")
3. **Generate**: Click "Continue to Editor" → Review prompt → "Generate Edited Image" → Download your result

### Tips for Best Results:

- Be specific about what you want to change
- Describe the desired style or mood
- Use high-quality, well-lit images
- You can refine your prompt in the Editor before generating

## 🏗️ Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + TailwindCSS
- **UI Components**: shadcn/ui + Radix UI
- **Database**: Supabase PostgreSQL with Row Level Security
- **AI**: Google Gemini 2.5 Flash + Gemini 2.5 Flash Image Preview
- **Image Processing**: Sharp
- **Authentication**: Supabase Auth (Google OAuth)
- **Storage**: Multi-tier (Supabase + localStorage + IndexedDB)
- **Analytics**: Vercel Analytics

## 📂 Project Structure

```
pixelprompt/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── edit/          # Main image editing endpoint
│   │   │   └── gemini/        # AI processing endpoints
│   │   ├── app/               # Dashboard page
│   │   ├── page.tsx           # Landing page
│   │   └── layout.tsx         # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # shadcn/ui components
│   │   ├── upload-view.tsx   # Image upload interface
│   │   ├── editor-view.tsx   # Image editor & comparison
│   │   └── history-view.tsx  # Saved images gallery
│   ├── lib/                  # Utilities and services
│   │   ├── database.ts       # Multi-layer storage service
│   │   ├── supabase.ts       # Supabase client
│   │   └── auth-context.tsx  # Authentication provider
│   └── types/                # TypeScript definitions
├── public/                   # Static assets
├── supabase-schema.sql      # Database schema
└── README.md                # This file
```

## 🔧 Configuration

### Google AI Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file as `GEMINI_API_KEY`

### Supabase Setup (Optional)

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from `supabase-schema.sql` in your Supabase SQL editor
3. Add your project URL and anon key to `.env.local`
4. The app will automatically use Supabase when configured, otherwise falls back to localStorage

### Admin Access

Set admin users by adding their email or user ID to `.env.local`:
- Admins get unlimited generations (no daily limit)
- Regular users get 2 free generations per day

## 🚢 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/4mohdisa/pixelprompt)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

### Other Platforms

The app can be deployed to any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🔐 Security Features

- Row Level Security (RLS) on all database tables
- Environment variable validation
- Secure image processing pipeline
- Google OAuth authentication
- CSRF protection
- Input sanitization

## 🎨 Features in Detail

### Credit System
- Regular users: 2 free generations per day
- Automatic daily reset at midnight
- Admin users: Unlimited generations
- Real-time credit display in dashboard

### Storage System
Three-tier fallback for reliability:
1. **Supabase** (Primary) - Cloud storage for authenticated users
2. **localStorage** (Fallback) - Browser storage (50 item limit)
3. **IndexedDB** (Offline) - Persistent browser storage

### Image Processing
- Supports PNG, JPG, WEBP formats
- Max file size: 10MB
- Automatic image optimization with Sharp
- Multi-strategy AI processing with fallbacks
- Base64 support for uploaded images

## 🤝 Contributing

Contributions are welcome! Feel free to:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) for powerful AI models
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Next.js](https://nextjs.org/) for the React framework
- [Supabase](https://supabase.com/) for backend infrastructure

## 📧 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Provide detailed information and steps to reproduce

---

**Built with ❤️ by Mohammed Isa**

*Powered by Google Gemini AI*
