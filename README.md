# ABDU Academy - Course Platform

A premium online course platform built with Next.js 16, Appwrite, Cloudflare R2, and Stripe.

## Tech Stack

- **Frontend & Backend**: Next.js 16 (App Router)
- **Database & Authentication**: Appwrite
- **File Storage**: Cloudflare R2
- **Payment Processing**: Stripe
- **UI Components**: shadcn/ui + Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 20+ 
- npm or yarn
- Appwrite account
- Cloudflare R2 bucket
- Stripe account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

4. Fill in your environment variables in `.env.local`:
   - Appwrite credentials
   - Cloudflare R2 credentials
   - Stripe API keys

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   ├── (public)/          # Public pages
│   ├── dashboard/         # Student dashboard
│   ├── learn/             # Course learning interface
│   ├── instructor/        # Instructor dashboard
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── course/           # Course-specific components
│   └── dashboard/        # Dashboard components
├── lib/                   # Utility libraries
│   ├── appwrite/         # Appwrite client & helpers
│   ├── r2/               # R2 storage utilities
│   └── stripe/           # Stripe integration
└── types/                # TypeScript type definitions
```

## Environment Variables

See `.env.example` for all required environment variables.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## License

Private project
