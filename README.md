# Movie Explorer

A modern, responsive web application for discovering and managing your favorite movies. Built with Next.js 14, featuring a beautiful dark-themed UI inspired by Netflix and Spotify.

## Live Demo

[Add deployment URL here]

## Features

### Core Functionality
- **Movie Search**: Real-time search with debounced input (500ms delay) to minimize API calls
- **Movie Details**: Comprehensive movie information including runtime, genres, tagline, production details
- **Favorites Management**: Add/remove movies to a personal collection with persistent storage
- **Rating System**: 5-star rating system with visual feedback
- **Personal Notes**: Add and edit notes for each favorited movie
- **Responsive Design**: Fully responsive layout optimized for mobile, tablet, and desktop

### User Experience
- **Loading States**: Skeleton loaders and spinners for smooth loading experiences
- **Error Handling**: Graceful error boundaries with recovery options
- **Toast Notifications**: Non-blocking feedback for user actions (success/error messages)
- **Image Optimization**: Next.js Image component with blur placeholders and lazy loading
- **Accessibility**: ARIA labels, keyboard navigation, focus management
- **Touch-Friendly**: Minimum 44px touch targets for mobile devices

### UI Components
- Reusable component library (Button, Input, Card, Badge, Modal, etc.)
- Dark mode optimized color palette
- Smooth animations and transitions
- Hover effects and interactive states
- Empty states with helpful messaging

## Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework
- **React 19** - UI library
- **Lucide React** - Icon library

### Key Libraries
- **Axios** - HTTP client for API requests
- **clsx** - Conditional class name utility
- **Next.js Image** - Optimized image component with WebP support

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- TMDB API key ([Get one here](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie-explorer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   TMDB_API_KEY=your_tmdb_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
   
   Replace `your_tmdb_api_key_here` with your actual TMDB API key.

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Technical Decisions & Tradeoffs

### Next.js API Routes as Proxy
**Decision**: Use Next.js API routes to proxy TMDB API requests instead of calling TMDB directly from the client.

**Rationale**:
- **Security**: Keeps API keys server-side, never exposed to the client
- **CORS**: Avoids CORS issues with TMDB API
- **Caching**: Enables server-side caching with Next.js fetch options
- **Data Transformation**: Centralized data normalization and error handling
- **Rate Limiting**: Can implement rate limiting at the proxy level if needed

**Tradeoff**: Adds an extra network hop, but provides better security and control.

### LocalStorage vs Server Persistence
**Decision**: Use browser LocalStorage for favorites persistence.

**Rationale**:
- **Simplicity**: No backend infrastructure required for MVP
- **Performance**: Instant reads/writes, no network latency
- **Offline Support**: Works without internet connection
- **Privacy**: Data stays on user's device

**Tradeoff**: 
- Data is device-specific (doesn't sync across devices)
- Limited storage capacity (~5-10MB)
- No backup/recovery if browser data is cleared
- Not suitable for multi-user scenarios

**Future**: Would migrate to server-side database with user authentication for production.

### State Management Approach
**Decision**: React hooks (useState, useEffect) with custom hooks for complex logic.

**Rationale**:
- **Simplicity**: No external state management library needed
- **Type Safety**: Full TypeScript support
- **Reusability**: Custom hooks (`useFavorites`, `useMovieSearch`) encapsulate logic
- **Performance**: React's built-in optimizations sufficient for this use case

**Tradeoff**: 
- Could become complex with more features
- No global state management (would need Context API or Zustand for larger apps)

### UI/UX Decisions

**Dark Theme by Default**
- Better for extended viewing sessions
- Matches modern streaming platforms (Netflix, Spotify)
- Reduces eye strain

**Debounced Search**
- 500ms delay prevents excessive API calls
- Improves performance and reduces API quota usage
- Better user experience with less flickering

**Skeleton Loaders**
- Provides visual feedback during loading
- Reduces perceived load time
- Better UX than blank screens or spinners alone

**Toast Notifications**
- Non-blocking feedback doesn't interrupt workflow
- Auto-dismiss after 3 seconds
- Stackable for multiple notifications

**Responsive Grid Layout**
- Mobile: 1 column (optimal for small screens)
- Tablet: 2 columns (good use of space)
- Desktop: 3-4 columns (maximizes content visibility)

## Known Limitations

### Current Implementation
- **No User Authentication**: All data is stored locally per device
- **No Data Sync**: Favorites don't sync across devices or browsers
- **Limited Search**: Basic text search only, no advanced filtering (genre, year, rating)
- **No Pagination UI**: Search results show all pages but no pagination controls
- **No Watchlist/Watched Separation**: Single favorites list, no distinction between "want to watch" and "watched"
- **No Social Features**: Can't share favorites or see what others are watching
- **No Recommendations**: No personalized movie suggestions
- **No Export/Import**: Can't backup or restore favorites data
- **No Offline Mode**: Requires internet connection for search and movie details
- **Limited Error Recovery**: Basic error handling, no retry logic for failed requests

### Technical Constraints
- **API Rate Limits**: Subject to TMDB API rate limits (40 requests per 10 seconds)
- **Image Loading**: Depends on TMDB CDN availability
- **Browser Storage**: Limited by browser's LocalStorage quota
- **No Server-Side Rendering for Favorites**: Favorites page requires client-side JavaScript

## Future Enhancements

### High Priority
- **User Authentication**: Sign up/login with email or OAuth (Google, GitHub)
- **Server-Side Persistence**: Database (PostgreSQL/MongoDB) for favorites, ratings, notes
- **Data Sync**: Sync favorites across devices and browsers
- **Advanced Search**: Filter by genre, year, rating, language
- **Watchlist/Watched Separation**: Separate lists for "Want to Watch" and "Watched"
- **Pagination**: Proper pagination controls for search results

### Medium Priority
- **Movie Recommendations**: Personalized suggestions based on favorites and ratings
- **Export/Import**: Backup and restore favorites as JSON
- **Offline Mode**: Service Worker for offline access to favorites
- **Advanced Filtering**: Filter favorites by rating, date added, genre
- **Sorting Options**: Sort favorites by title, date added, rating, release date
- **Bulk Operations**: Select multiple movies for batch actions

### Nice to Have
- **Social Features**: 
  - Share favorites with friends
  - See what friends are watching
  - Public profiles
- **Movie Reviews**: Write and read reviews
- **Watch History**: Track when movies were watched
- **Statistics Dashboard**: View favorite genres, average ratings, watch trends
- **Collections**: Group movies into custom collections (e.g., "Christmas Movies", "Sci-Fi Favorites")
- **Trailer Integration**: Embed movie trailers in details modal
- **Similar Movies**: Show similar movies based on current selection
- **Dark/Light Theme Toggle**: User preference for theme
- **Internationalization**: Multi-language support

### Technical Improvements
- **Performance**: 
  - Implement virtual scrolling for large lists
  - Add service worker for caching
  - Optimize bundle size with code splitting
- **Testing**: 
  - Unit tests for hooks and utilities
  - Integration tests for API routes
  - E2E tests for critical user flows
- **Monitoring**: 
  - Error tracking (Sentry)
  - Analytics (Plausible/Posthog)
  - Performance monitoring
- **Documentation**: 
  - API documentation
  - Component Storybook
  - Contributing guidelines

## Project Structure

```
movie-explorer/
├── app/
│   ├── api/              # Next.js API routes
│   │   └── movies/       # Movie API endpoints
│   ├── components/       # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── ...           # Feature components
│   ├── lib/              # Utilities and hooks
│   │   └── hooks/        # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   └── ...               # Pages and layouts
├── public/               # Static assets
└── ...                   # Config files
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add your license here]

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the movie data API
- [Lucide](https://lucide.dev/) for the beautiful icon set
- [Next.js](https://nextjs.org/) team for the amazing framework
