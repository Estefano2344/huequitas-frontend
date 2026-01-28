# Las HueQuitas - Food Review Platform

A beautiful, production-ready frontend application for discovering and reviewing local restaurants.

## Features

### Authentication
- Sign In / Sign Up with tabbed interface
- JWT token management with localStorage
- Protected routes with automatic redirects

### Home Dashboard
- Browse restaurant listings with images and ratings
- Search restaurants by name
- Filter by category (Soups, Main, Desserts)
- View latest reviews and ratings

### Review System
- Create reviews with star ratings (1-5)
- Add restaurant names and detailed feedback
- Optional photo upload (UI ready)
- Form validation

### Community Chat
- Real-time chat interface
- Active user count display
- Message history
- Smooth scrolling

### Top Rated Rankings
- View top restaurants sorted by rating
- Medal indicators for top 3
- Detailed restaurant information
- Visual hierarchy

## Tech Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS with warm gastronomic palette
- **Routing**: React Router DOM
- **HTTP Client**: Axios with JWT interceptor
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx
│   ├── RestaurantCard.tsx
│   └── ReviewModal.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx
├── pages/              # Page components
│   ├── AuthPage.tsx
│   ├── HomePage.tsx
│   ├── ChatPage.tsx
│   └── RankingPage.tsx
├── services/           # API and data services
│   └── mockData.ts     # Mock API with simulated delays
├── types/              # TypeScript types
│   └── index.ts
├── utils/              # Utility functions
│   └── axios.ts        # Axios instance with interceptor
├── App.tsx             # Main app with routing
└── main.tsx            # Application entry point
```

## Environment Configuration

The `.env` file contains:

```
VITE_API_URL=http://localhost:8000
```

You can update this to point to your actual backend API gateway.

## Mock Data

The application uses a mock API service (`src/services/mockData.ts`) that simulates:
- Login/SignUp with setTimeout delays
- Restaurant fetching and filtering
- Review creation
- Chat messages
- Top rated rankings

This allows you to test the entire UI flow immediately without a backend.

## Getting Started

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Connecting to Real Backend

When ready to connect to your actual API:

1. Update the `VITE_API_URL` in `.env`
2. Replace mock API calls in components with real API calls using the configured axios instance
3. The axios interceptor will automatically attach JWT tokens to all requests

## Design Features

- Warm gastronomic color palette (oranges, yellows, dark greys)
- Smooth transitions and hover effects
- Responsive design for all screen sizes
- Loading states and error handling
- Accessibility considerations
- Modern glass-morphism effects

## Security Features

- JWT token stored in localStorage
- Axios interceptor automatically adds Bearer token
- Protected routes with authentication checks
- Automatic logout on 401 responses
- Public/Private route guards

## Testing the App

1. Start the development server
2. You'll be redirected to the Sign In page
3. Use any email and a password with at least 6 characters
4. Explore the features:
   - Browse restaurants on the home page
   - Search and filter by category
   - Click "Write Review" to create a review
   - Visit "Top Rated" to see rankings
   - Go to "Chat" to see the messaging interface

All API calls are simulated with realistic delays to mimic real network requests.
