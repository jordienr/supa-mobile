# Supa Mobile - Design Document

## Overview
A mobile app for monitoring Supabase project statistics, including user analytics, real-time notifications, custom alerts, and resource usage metrics (CPU, memory, disk). The app follows Apple Human Interface Guidelines for a native iOS feel.

## Design Principles
- **Mobile-first**: Optimized for portrait orientation (9:16) and one-handed usage
- **Native iOS feel**: Follows Apple HIG for familiar, intuitive interactions
- **Real-time updates**: Live data streaming for critical metrics
- **Glanceable information**: Quick access to key stats without deep navigation

## Color Scheme
- **Primary**: `#10b981` (Supabase green) - for accents, active states, success indicators
- **Background**: Light `#ffffff` / Dark `#0a0a0a`
- **Surface**: Light `#f5f5f5` / Dark `#1a1a1a` - for cards and elevated surfaces
- **Foreground**: Light `#1a1a1a` / Dark `#f5f5f5` - primary text
- **Muted**: Light `#6b7280` / Dark `#9ca3af` - secondary text, labels
- **Border**: Light `#e5e7eb` / Dark `#374151`
- **Error**: `#ef4444` - alerts, critical issues
- **Warning**: `#f59e0b` - warnings, attention needed

## Screen List

### 1. Projects Screen (Home)
**Primary Content:**
- List of connected Supabase projects (cards)
- Each card shows: project name, status indicator (green/yellow/red), quick stats (users, requests today)
- Empty state: "Connect Your First Project" with CTA button

**Functionality:**
- Tap card → navigate to Project Dashboard
- Pull to refresh
- Add new project button (top-right)

### 2. Project Dashboard
**Primary Content:**
- Project name header with status badge
- Stats grid (2x2):
  - Total users (with trend indicator)
  - Active users (last 24h)
  - API requests (today)
  - Database size
- Resource usage section:
  - CPU usage (progress bar + percentage)
  - Memory usage (progress bar + percentage)
  - Disk usage (progress bar + percentage)
- Recent activity feed (scrollable list)

**Functionality:**
- Pull to refresh
- Tap stat card → detailed view
- Real-time updates for metrics
- Settings button (top-right)

### 3. Add Project Screen
**Primary Content:**
- Form fields:
  - Project URL (text input)
  - Project API Key (secure text input)
  - Project name (optional, text input)
- Helper text explaining where to find credentials
- "Connect Project" button

**Functionality:**
- Validate credentials
- Test connection before saving
- Save to local storage (AsyncStorage)

### 4. Notifications Screen
**Primary Content:**
- List of notification rules (cards)
- Each card shows: rule name, trigger condition, enabled toggle
- Empty state: "No notification rules yet"

**Functionality:**
- Toggle rule on/off
- Tap card → edit rule
- Add new rule button (top-right)
- Delete rule (swipe left)

### 5. Create/Edit Notification Rule
**Primary Content:**
- Form fields:
  - Rule name (text input)
  - Trigger type (picker: new user, new row in table, threshold alert)
  - Table selection (if applicable)
  - Threshold value (if applicable)
  - Notification message template
- "Save Rule" button

**Functionality:**
- Validate rule configuration
- Test rule (optional)
- Save to local storage

### 6. Settings Screen
**Primary Content:**
- Sections:
  - **Appearance**: Theme toggle (light/dark/auto)
  - **Notifications**: Enable push notifications toggle
  - **Projects**: Manage connected projects
  - **About**: App version, support links

**Functionality:**
- Toggle settings
- Disconnect projects
- Clear cache

## Key User Flows

### Flow 1: First-time Setup
1. User opens app → Projects Screen (empty state)
2. Tap "Connect Your First Project"
3. Add Project Screen → enter credentials
4. Validate → success → navigate to Project Dashboard
5. Dashboard loads with real-time data

### Flow 2: Monitor Project Health
1. User opens app → Projects Screen
2. Tap project card → Project Dashboard
3. View stats grid and resource usage
4. Pull to refresh for latest data
5. Scroll through recent activity feed

### Flow 3: Create Custom Notification
1. From Dashboard → tap bell icon (top-right) → Notifications Screen
2. Tap "Add Rule" button
3. Create Notification Rule Screen → fill form:
   - Name: "New Subscription"
   - Trigger: "New row in table"
   - Table: "subscriptions"
   - Message: "New subscription from {{email}}"
4. Tap "Save Rule"
5. Rule appears in list with toggle enabled

### Flow 4: Receive Alert
1. App running in background
2. CPU usage exceeds 80%
3. Push notification delivered: "⚠️ High CPU Usage: 85%"
4. User taps notification → opens app to Project Dashboard
5. Dashboard highlights CPU metric in warning color

## Layout Patterns

### Card Design
- Rounded corners (16px)
- Subtle shadow for depth
- Padding: 16px
- Background: surface color
- Border: 1px solid border color

### Stats Display
- Large number (32px, bold)
- Label below (14px, muted color)
- Trend indicator (arrow + percentage, small text)
- Color-coded: green (positive), red (negative), gray (neutral)

### Progress Bars
- Height: 8px
- Rounded ends
- Background: muted surface
- Fill: color-coded (green <70%, yellow 70-85%, red >85%)
- Percentage label to the right

### List Items
- Height: 72px minimum
- Left icon (if applicable)
- Primary text (16px, medium weight)
- Secondary text below (14px, muted)
- Right accessory (chevron, toggle, or badge)
- Divider between items

## Interaction Design

### Gestures
- **Tap**: Primary action (navigate, toggle)
- **Pull to refresh**: Update data
- **Swipe left**: Delete action (on list items)
- **Long press**: Context menu (future enhancement)

### Haptics
- Light impact on button taps
- Medium impact on toggle switches
- Success notification on successful actions
- Error notification on failures

### Animations
- Subtle fade-in for data updates (250ms)
- Spring animation for pull-to-refresh
- Smooth transitions between screens (300ms)
- Progress bar fill animation (400ms)

## Technical Considerations

### Data Refresh Strategy
- Auto-refresh dashboard every 30 seconds when active
- Manual refresh via pull-to-refresh
- Real-time updates via Supabase Realtime (if available)
- Background fetch for notifications (when app inactive)

### Offline Handling
- Cache last known stats
- Show "Offline" indicator
- Queue notification rule changes
- Sync when connection restored

### Performance
- Lazy load activity feed (paginated)
- Optimize re-renders with React.memo
- Use FlatList for all lists
- Debounce search/filter inputs

## Future Enhancements
- Multi-project comparison view
- Custom dashboard widgets
- Export reports (PDF/CSV)
- Team collaboration features
- Query performance insights
- Database schema viewer
