# Supa Mobile

A React Native mobile app for monitoring your Supabase projects. Track user analytics, resource usage (CPU, memory, disk), and set up custom notification rules for important events.

![App Icon](./assets/images/icon.png)

## Features

- 📊 **Project Dashboard** - View real-time stats including total users, active users, API requests, and database size
- 📈 **Resource Monitoring** - Track CPU, memory, and disk usage with color-coded indicators
- 🔔 **Custom Notifications** - Create rules for new user signups, table inserts, or resource thresholds
- 🌓 **Dark Mode** - Automatic theme switching based on system preferences
- 💾 **Local Storage** - All data stored locally using AsyncStorage (no cloud dependency)
- 🎨 **Native iOS Feel** - Follows Apple Human Interface Guidelines
- 🔐 **Real Data** - Fetches actual metrics from Supabase Management API and Metrics API

## Tech Stack

- **React Native 0.81** with Expo SDK 54
- **Expo Router 6** for file-based navigation
- **NativeWind 4** (Tailwind CSS for React Native)
- **TypeScript 5.9**
- **Supabase JavaScript Client** for database queries
- **Supabase Management API** for project analytics
- **Supabase Metrics API** for resource monitoring
- **AsyncStorage** for local data persistence

## Prerequisites

- Node.js 18+ and pnpm
- [Expo Go](https://expo.dev/client) app on your iOS or Android device
- A Supabase project (get one free at [supabase.com](https://supabase.com))
- Your Supabase **service role key** (for admin access to project data)
- (Optional) A Supabase **Personal Access Token** (for API usage statistics)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/jordienr/supa-mobile.git
cd supa-mobile
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start the Development Server

```bash
pnpm dev
```

This will start both the Metro bundler and the backend server.

### 4. Open the App

**On Mobile Device:**
1. Install [Expo Go](https://expo.dev/client) from the App Store or Google Play
2. Scan the QR code displayed in your terminal with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

**On Web:**
- The app will automatically open in your browser at `http://localhost:8081`

## Using the App

### Connect Your First Project

1. Open the app and tap **"Connect Project"**
2. Enter your Supabase project details:
   - **Project URL**: Found in your Supabase dashboard (e.g., `https://xxxxx.supabase.co`)
   - **Service Role Key**: Found in Settings → API → Project API keys (the `service_role` key, NOT the `anon` key)
   - **Personal Access Token** (optional): For API usage statistics. Generate at [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
   - **Project Name** (optional): A friendly name for your project

3. Tap **"Connect Project"** to validate and save

⚠️ **Security Note**: The service role key has full admin access to your project. It will be stored securely on your device using encrypted storage and never shared with any external services.

### What Data is Fetched

The app fetches **real data** from your Supabase project:

- **Total Users**: Queried from `auth.users` table
- **Active Users**: Users who signed in within the last 24 hours
- **API Requests**: Fetched from Supabase Management API (requires Personal Access Token)
- **Database Size**: Calculated using `pg_database_size()` function
- **Resource Usage**: Fetched from Supabase Metrics API (Prometheus format)
- **Recent Activity**: Recent user signups from `auth.users` table

### View Project Stats

- Tap on a project card to view the dashboard
- Pull down to refresh data
- View stats for users, API requests, and database size
- Monitor resource usage with color-coded progress bars

### Create Notification Rules

1. From the dashboard, tap the bell icon (top-right)
2. Tap the **+** button to create a new rule
3. Choose a trigger type:
   - **New User**: Alert on user signups
   - **New Row**: Alert when a row is inserted into a specific table
   - **Threshold**: Alert when CPU, memory, or disk exceeds a percentage
4. Configure the rule and save

## Project Structure

```
supa-mobile/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation
│   │   └── index.tsx        # Projects list (home)
│   ├── add-project.tsx      # Add new project form
│   ├── dashboard.tsx        # Project dashboard
│   ├── notifications.tsx    # Notification rules list
│   └── create-rule.tsx      # Create/edit notification rule
├── components/              # Reusable components
│   ├── screen-container.tsx # SafeArea wrapper
│   └── ui/                  # UI components
├── lib/                     # Core utilities
│   ├── supabase.ts         # Supabase client, Management API & Metrics API
│   └── utils.ts            # Helper functions
├── hooks/                   # Custom React hooks
├── assets/                  # Images and icons
├── theme.config.js         # Color palette configuration
└── app.config.ts           # Expo configuration
```

## Available Scripts

```bash
# Start development server (Metro + backend)
pnpm dev

# Start Metro bundler only
pnpm dev:metro

# Start backend server only
pnpm dev:server

# Type checking
pnpm check

# Linting
pnpm lint

# Format code
pnpm format

# Run tests
pnpm test

# Build for production
pnpm build

# Start production server
pnpm start
```

## API Integration Details

### Management API

The app uses Supabase's Management API to fetch project analytics:

- **Base URL**: `https://api.supabase.com/v1`
- **Authentication**: Bearer token (Personal Access Token)
- **Endpoints Used**:
  - `/projects/{ref}/analytics/endpoints/usage.api-requests-count` - API request statistics

### Metrics API

The app uses Supabase's Metrics API for resource monitoring:

- **Endpoint**: `https://{project-ref}.supabase.co/customer/v1/privileged/metrics`
- **Authentication**: HTTP Basic Auth (username: `service_role`, password: service role key)
- **Format**: Prometheus exposition format (~200 metrics)

### Database Queries

Direct database queries using the Supabase client:

- **User counts**: `SELECT COUNT(*) FROM auth.users`
- **Active users**: Filter by `last_sign_in_at` timestamp
- **Database size**: `pg_database_size()` function
- **Recent activity**: Recent rows from `auth.users`

## Customization

### Update App Name and Icon

Edit `app.config.ts`:

```typescript
const env = {
  appName: "Your App Name",
  appSlug: "your-app-slug",
  logoUrl: "https://your-logo-url.png",
  // ...
};
```

Replace icons in `assets/images/`:
- `icon.png` - App icon (1024x1024)
- `splash-icon.png` - Splash screen icon
- `favicon.png` - Web favicon

### Update Theme Colors

Edit `theme.config.js`:

```javascript
const themeColors = {
  primary: { light: '#10b981', dark: '#10b981' },
  background: { light: '#ffffff', dark: '#0a0a0a' },
  // ...
};
```

## Building for Production

### iOS (requires macOS)

```bash
pnpm ios
```

### Android

```bash
pnpm android
```

### Web

```bash
pnpm build
pnpm start
```

## Limitations & Future Enhancements

**Current Limitations:**
- Resource metrics (CPU/memory/disk) are fetched from Metrics API but parsing Prometheus format is simplified
- Trend indicators (↑↓) are calculated as 0 (requires historical data storage)
- Push notifications require additional setup with Expo's notification service
- Real-time updates require manual refresh (pull-to-refresh)

**Planned Features:**
- [ ] Real-time data updates using Supabase Realtime
- [ ] Push notification integration
- [ ] Settings screen for theme and project management
- [ ] Historical data storage for trend calculations
- [ ] Proper Prometheus metrics parsing
- [ ] Export reports (PDF/CSV)
- [ ] Multi-project comparison view
- [ ] Query performance insights

## Security Best Practices

1. **Never commit your service role key** to version control
2. **Store keys securely** - The app uses AsyncStorage (consider upgrading to Expo SecureStore for production)
3. **Personal Access Tokens** have the same privileges as your user account - treat them like passwords
4. **Rate limits** - Management API has 120 requests/minute per user per project
5. **Audit access** - Regularly review which apps have access to your Personal Access Tokens

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Open an issue on [GitHub](https://github.com/jordienr/supa-mobile/issues)
- Check the [Expo documentation](https://docs.expo.dev/)
- Visit [Supabase documentation](https://supabase.com/docs)
- Read [Supabase Management API docs](https://supabase.com/docs/reference/api/introduction)

---

Built with ❤️ using React Native and Supabase
