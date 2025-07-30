
# Manetho - AI-Powered Learning Platform

> **Manetho** is a comprehensive AI-powered learning platform that combines interactive study tools, real-time collaboration, and intelligent content generation to create an engaging educational experience.

## Features

### AI-Powered Learning Tools
- **AI Chat Assistant** - Intelligent doubt solving with context-aware responses
- **Flashcard Generation** - AI-generated flashcards from study materials
- **Quiz Creation** - Automated quiz generation with difficulty levels
- **Mind Map Builder** - AI-assisted mind map creation and visualization
- **Study Plan Generator** - Personalized learning routines and schedules

### Collaborative Learning
- **Study Groups** - Create and join study groups with real-time messaging
- **Direct Messaging** - Private conversations between users
- **Video Meetings** - Google Meet integration for virtual study sessions
- **Community Forums** - Thread-based discussions and knowledge sharing

### Progress Tracking
- **Learning Analytics** - Detailed progress tracking and performance metrics
- **Study Streaks** - Gamified learning with streak tracking
- **Achievement System** - Badges and rewards for learning milestones
- **Performance Insights** - AI-powered recommendations and insights

### Interactive Tools
- **Mind Map Visualization** - Interactive mind maps with drag-and-drop
- **Flashcard System** - Spaced repetition and review scheduling
- **Quiz Engine** - Multiple question types with instant feedback
- **File Management** - Upload and organize study materials
- **Real-time Collaboration** - Live editing and shared workspaces

### Security & Authentication
- **Clerk Authentication** - Secure user authentication and management
- **Role-based Access** - Student, teacher, and admin roles
- **File Security** - Secure file uploads and storage
- **Privacy Controls** - Granular privacy settings for content

## Tech Stack

### Frontend
- **Next.js 15.3.0** - React framework with App Router
- **React 19.0.0** - UI library with latest features
- **TypeScript 5** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons
- **@xyflow/react** - Mind map visualization

### Backend
- **Next.js API Routes** - Serverless backend
- **Drizzle ORM** - Type-safe database operations
- **PostgreSQL** - Relational database (Neon Cloud)
- **Pusher** - Real-time communication
- **Appwrite** - File storage and management

### External Services
- **Clerk** - Authentication and user management
- **Google Meet** - Video conferencing
- **Neon Database** - Serverless PostgreSQL hosting

## Quick Start

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **PostgreSQL** (or Neon Cloud account)
- **Clerk Account** ([Sign up](https://clerk.com/))
- **Appwrite Account** ([Sign up](https://appwrite.io/))

### 1. Clone the Repository

```bash
git clone https://github.com/Musa-Tur-Farazi/Manetho.git
cd manetho
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# If you encounter peer dependency issues, use:
npm install --force
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```bash
# Database
DATABASE_URL="your_neon_database_url"

# Authentication (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="your_clerk_publishable_key"
CLERK_SECRET_KEY="your_clerk_secret_key"

# File Storage (Appwrite)
NEXT_PUBLIC_APPWRITE_ENDPOINT="your_appwrite_endpoint"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="your_appwrite_project_id"
APPWRITE_API_KEY="your_appwrite_api_key"
NEXT_PUBLIC_APPWRITE_BUCKET_ID="your_appwrite_bucket_id"

# Real-time Communication (Pusher)
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
NEXT_PUBLIC_PUSHER_CLUSTER="your_pusher_cluster"
PUSHER_APP_ID="your_pusher_app_id"
PUSHER_SECRET="your_pusher_secret"

# Video Calling (Agora - Legacy)
NEXT_PUBLIC_AGORA_APP_ID="your_agora_app_id"
AGORA_APP_CERTIFICATE="your_agora_app_certificate"

# Optional: Webhook Secret
CLERK_WEBHOOK_SECRET="your_webhook_secret"
```

### 4. Database Setup

```bash

npx drizzle-kit generate 

npx drizzle-kit push



### 5. Start Development Server

```bash
# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Installation Commands

### Core Dependencies

```bash
# Framework and React
npm install next@15.3.0 react@19.0.0 react-dom@19.0.0

# Authentication
npm install @clerk/nextjs@6.15.1 @clerk/themes@2.2.34

# Database and ORM
npm install @neondatabase/serverless@1.0.0 drizzle-orm@0.43.1

# UI and Styling
npm install @radix-ui/react-slot@1.2.0 class-variance-authority@0.7.1 clsx@2.1.1 tailwind-merge@3.2.0
npm install framer-motion@12.7.4 lucide-react@0.488.0
npm install next-themes@0.4.6 sonner@2.0.3

# Mind Map and Flow
npm install @xyflow/react@12.8.2

# Real-time Features
npm install pusher@5.2.0 pusher-js@8.4.0

# File Storage
npm install appwrite@18.1.1 node-appwrite@17.0.0

# Utilities
npm install date-fns@4.1.0 dotenv@16.5.0 nanoid@5.1.5 uuid@11.1.0
npm install file-saver@2.0.5 html2canvas@1.4.1 jspdf@3.0.1

# Math and Markdown
npm install katex@0.16.22 react-katex@3.1.0
npm install react-markdown@10.1.0 rehype-katex@7.0.1 rehype-raw@7.0.0 remark-math@6.0.0

# State Management
npm install zustand@5.0.6

# Webhooks
npm install svix@1.64.1
```

### Development Dependencies

```bash
# TypeScript and Types
npm install --save-dev typescript@5 @types/node@20 @types/react@19 @types/react-dom@19

# ESLint
npm install --save-dev @eslint/eslintrc@3 eslint@9 eslint-config-next@15.3.0

# Tailwind CSS
npm install --save-dev @tailwindcss/postcss@4 tailwindcss@4 tw-animate-css@1.2.5

# Database Tools
npm install --save-dev drizzle-kit@0.31.0 tsx@4.19.3
```

### One-Command Installation

```bash
# Install everything at once
npm install next@15.3.0 react@19.0.0 react-dom@19.0.0 @clerk/nextjs@6.15.1 @clerk/themes@2.2.34 @neondatabase/serverless@1.0.0 drizzle-orm@0.43.1 @radix-ui/react-slot@1.2.0 class-variance-authority@0.7.1 clsx@2.1.1 tailwind-merge@3.2.0 framer-motion@12.7.4 lucide-react@0.488.0 next-themes@0.4.6 sonner@2.0.3 @xyflow/react@12.8.2 pusher@5.2.0 pusher-js@8.4.0 appwrite@18.1.1 node-appwrite@17.0.0 date-fns@4.1.0 dotenv@16.5.0 nanoid@5.1.5 uuid@11.1.0 file-saver@2.0.5 html2canvas@1.4.1 jspdf@3.0.1 katex@0.16.22 react-katex@3.1.0 react-markdown@10.1.0 rehype-katex@7.0.1 rehype-raw@7.0.0 remark-math@6.0.0 zustand@5.0.6 svix@1.64.1 && npm install --save-dev typescript@5 @types/node@20 @types/react@19 @types/react-dom@19 @eslint/eslintrc@3 eslint@9 eslint-config-next@15.3.0 @tailwindcss/postcss@4 tailwindcss@4 tw-animate-css@1.2.5 drizzle-kit@0.31.0 tsx@4.19.3
```

## Project Structure

```
manetho/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Authentication pages
│   │   ├── (pages)/           # Main application pages
│   │   ├── api/               # API routes
│   │   └── layout.tsx         # Root layout
│   ├── components/            # Reusable components
│   │   ├── ui/               # UI components
│   │   ├── chat/             # Chat components
│   │   ├── mindmap/          # Mind map components
│   │   └── theme/            # Theme components
│   ├── db/                   # Database configuration
│   │   ├── schema.ts         # Database schema
│   │   ├── index.ts          # Database connection
│   │   └── seed.ts           # Database seeding
│   ├── lib/                  # Utility libraries
│   │   ├── pusher-client.ts  # Real-time client
│   │   ├── pusher-server.ts  # Real-time server
│   │   └── utils.ts          # Utility functions
│   └── hooks/                # Custom React hooks
├── drizzle/                  # Database migrations
├── public/                   # Static assets
├── components.json           # UI component configuration
├── drizzle.config.ts         # Database configuration
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
```

If you want to run directly via Github Actions, go to this link to visit the website : 
http://20.2.64.88:4000/

For this, you have to setup the Github Secrets using the env.local file provided.
