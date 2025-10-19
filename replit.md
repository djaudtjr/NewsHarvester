# 뉴스 수집기 (News Aggregator)

A comprehensive news aggregation application that collects articles from multiple sources (Naver, Bing) with intelligent deduplication, trending analytics, and personalized email delivery of PDF news summaries.

## Features

### Core Functionality
- **Multi-Source News Search**: Integrates with NewsAPI, Naver, and Bing News APIs to fetch articles
- **Smart Deduplication**: Removes duplicate articles by comparing normalized titles and selecting the most recent/accurate version
- **Real-time Trending Dashboard**: Shows popular categories based on Naver Data Lab or aggregated article data
- **Advanced Search Filters**: Search by keyword, date range, and specific news source
- **Personalized Email Subscriptions**: Users can subscribe to specific keywords and receive daily PDF summaries
- **User Preferences**: Save favorite news sources, categories, and language preferences for personalized search defaults
- **Article Bookmarking**: Save interesting articles to read later with dedicated bookmarks page

### Email Automation
- **Scheduled PDF Generation**: Creates PDF summaries 1 hour before delivery time using OpenAI for article summarization
- **Automated Delivery**: Sends emails via SendGrid at user-specified times
- **Subscription Management**: Full CRUD operations for email subscriptions

## Project Structure

### Frontend (`client/`)
- **Pages**:
  - `landing.tsx`: Landing page for logged-out users
  - `home.tsx`: Main application for logged-in users with news feed and bookmark management
  - `settings.tsx`: User preferences management (sources, categories, language)
  - `bookmarks.tsx`: Saved articles page showing all bookmarked items
- **Components**:
  - `news-card.tsx`: Article display card with image, title, description, metadata, and bookmark button
  - `trending-dashboard.tsx`: Horizontal scrolling trend indicators
  - `search-filter-panel.tsx`: Keyword search with date range and source filters
  - `subscription-modal.tsx`: Modal for managing email subscriptions
  - `email-status-indicator.tsx`: Dropdown showing active subscriptions
  - `theme-toggle.tsx`: Dark/light mode switcher
- **Hooks**:
  - `useAuth.ts`: Replit Auth integration hook

### Backend (`server/`)
- **Authentication**: `replitAuth.ts` - Replit OIDC provider integration
- **Database**: `db.ts` - PostgreSQL connection via Neon
- **Storage**: `storage.ts` - Data access layer for users, subscriptions, articles, email logs
- **Services**:
  - `newsService.ts`: Multi-source news fetching, deduplication, trend analytics
  - `emailService.ts`: PDF generation with OpenAI + email delivery via SendGrid
  - `scheduler.ts`: Cron jobs for automated email delivery
- **Routes**: `routes.ts` - API endpoints for news search, trends, subscriptions

### Database Schema (`shared/schema.ts`)
- `users`: User profiles (Replit Auth)
- `sessions`: Session storage (Replit Auth)
- `subscriptions`: Email subscription preferences (keywords, delivery time)
- `articles`: Cached news articles with deduplication
- `emailLogs`: Email delivery tracking
- `userPreferences`: User preferences (favorite sources, categories, language)
- `bookmarks`: User-article bookmarks for saving articles

## API Endpoints

### Public
- `GET /api/news/search?keyword=...&startDate=...&endDate=...&source=...` - Search news
- `GET /api/trends` - Get trending topics

### Protected (Requires Authentication)
- `GET /api/auth/user` - Get current user
- `GET /api/subscriptions` - List user's subscriptions
- `POST /api/subscriptions` - Create subscription
- `DELETE /api/subscriptions/:id` - Delete subscription
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update user preferences
- `GET /api/bookmarks` - Get user's bookmarked articles
- `POST /api/bookmarks` - Create bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark

## Environment Variables

Required:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `OPENAI_API_KEY` - OpenAI API key for article summarization
- SendGrid credentials (managed via Replit connector)

Auto-provided by Replit:
- `REPLIT_DOMAINS` - Deployment domains
- `REPL_ID` - Repl identifier
- Database credentials (PGHOST, PGPORT, etc.)

## Development

### Setup
1. Environment is pre-configured with Node.js 20
2. Dependencies auto-installed via Replit packager
3. Database auto-provisioned and schema pushed

### Running
- Workflow "Start application" runs `npm run dev`
- Frontend: Vite dev server
- Backend: Express server on port 5000
- Hot reload enabled for both

### Database Migrations
```bash
npm run db:push
```

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI, Wouter (routing), TanStack Query
- **Backend**: Express, TypeScript, Drizzle ORM, Passport.js (Replit Auth)
- **Database**: PostgreSQL (Neon serverless)
- **Email**: SendGrid
- **AI**: OpenAI GPT-5 for summaries
- **PDF**: PDFKit
- **Scheduling**: node-cron

## Production Deployment Notes

### Real API Integration
Replace mock implementations in `server/newsService.ts` with:
1. **Naver News API**:
   - Register at https://developers.naver.com/
   - Add `NAVER_CLIENT_ID` and `NAVER_CLIENT_SECRET` env vars
   - Uncomment production code in `searchNaverNews()`

2. **Bing News Search API**:
   - Register at https://portal.azure.com
   - Add `BING_API_KEY` env var
   - Uncomment production code in `searchBingNews()`

3. **Naver Data Lab**:
   - Use same Naver credentials
   - Uncomment production code in `getTrendingTopics()`

### Email Configuration
- SendGrid connector is already integrated
- Verify sender email in SendGrid dashboard
- Production: Add custom domain for sender

## Design System

Follows Material Design principles with:
- **Colors**: Trustworthy blue primary, coral accents
- **Typography**: Inter font family, clear hierarchy
- **Spacing**: Consistent 4px/8px/16px grid
- **Components**: Shadcn UI for accessibility and consistency
- **Dark Mode**: Full support with theme toggle

## User Journeys

1. **News Discovery**: Login → Search keyword → View results → Bookmark interesting articles → Click to read original
2. **Subscription Setup**: Login → Email indicator → Add subscription → Configure keywords & time
3. **Email Delivery**: System searches keywords → Generates PDF → Sends at scheduled time
4. **Personalization**: Login → Settings → Configure favorite sources/categories → Save preferences
5. **Bookmarks**: Login → Search news → Click bookmark icon → View saved articles in bookmarks page
