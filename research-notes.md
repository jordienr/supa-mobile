# Supabase Management API Research

## Authentication

All Management API requests require an access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Two ways to generate access tokens:

1. **Personal Access Token (PAT)**:
   - Long-lived tokens manually generated
   - Useful for automating workflows or developing against the Management API
   - Carry same privileges as user account (keep secret!)
   - Generate at: https://supabase.com/dashboard/account/tokens

2. **OAuth2**:
   - Allows application to generate tokens on behalf of Supabase user
   - Provides secure and limited access without requiring credentials
   - Tokens are short-lived and tied to specific scopes
   - For third-party apps that need to create/manage Supabase projects

## Available Endpoints for Metrics

### Analytics Endpoints:
- `GET /v1/projects/{ref}/analytics/endpoints/functions.combined-stats` - Function statistics
- `GET /v1/projects/{ref}/analytics/endpoints/logs.all` - All logs
- `GET /v1/projects/{ref}/analytics/endpoints/usage.api-counts` - API usage counts
- `GET /v1/projects/{ref}/analytics/endpoints/usage.api-requests-count` - API request counts

### Advisors (Experimental):
- `GET /v1/projects/{ref}/advisors/performance` - Performance advisors
- `GET /v1/projects/{ref}/advisors/security` - Security advisors

## Next Steps

Need to check:
1. Metrics API for CPU, memory, disk usage
2. How to get user count statistics
3. Project reference ID format


## Metrics API Details

### Endpoint URL Format:
```
https://<project-ref>.supabase.co/customer/v1/privileged/metrics
```

### Authentication:
- **HTTP Basic Auth**
- Username: `service_role`
- Password: `<service_role_key>` (from project API settings)

### What Metrics Are Available:
- ~200 Postgres performance and health metrics in Prometheus format
- CPU, IO, WAL, connections, query stats
- Database bloat indicators
- Replication metrics

### Important Notes:
- Metrics API is currently in **beta**
- Metric names and labels might evolve
- Not available in self-hosted Supabase instances
- Requires service role key (not anon key)

## For User Count Statistics

Need to check if Management API has endpoints for:
- Total users count
- Active users
- User signups over time

The Metrics API focuses on database/infrastructure metrics, not application-level user statistics.


## Key Findings

### What's Available:

1. **Metrics API** (Prometheus-compatible):
   - URL: `https://<project-ref>.supabase.co/customer/v1/privileged/metrics`
   - Auth: HTTP Basic (username: `service_role`, password: service role key)
   - Provides: ~200 Postgres performance metrics (CPU, IO, WAL, connections, queries)
   - Format: Prometheus exposition format (requires parsing)

2. **Management API** (REST):
   - Base URL: `https://api.supabase.com/v1`
   - Auth: Bearer token (Personal Access Token or OAuth2)
   - Available endpoints:
     - `/projects/{ref}/analytics/endpoints/usage.api-counts` - API usage counts
     - `/projects/{ref}/analytics/endpoints/usage.api-requests-count` - API request counts
     - `/projects/{ref}/analytics/endpoints/logs.all` - All logs
     - `/projects/{ref}/analytics/endpoints/functions.combined-stats` - Function stats

### What's NOT Available:

- **No direct "user count" endpoint** in Management API
- **No "active users" metric** exposed via API
- User statistics would need to be queried from `auth.users` table directly using the database connection
- Resource usage (CPU/memory/disk %) is available in Metrics API but in Prometheus format (not simple JSON)

### Recommended Approach:

For a mobile app, we have two options:

**Option A: Use service role key directly in app (NOT RECOMMENDED)**
- Security risk: service role key has full admin access
- Should never be exposed in client-side code

**Option B: Build a backend proxy (RECOMMENDED)**
- Create a secure backend that:
  1. Accepts user's Personal Access Token (PAT)
  2. Proxies requests to Management API and Metrics API
  3. Parses Prometheus metrics into JSON
  4. Queries auth.users table for user counts
  5. Returns simplified JSON to mobile app

**Option C: Simplified approach for MVP**
- Ask user for their Personal Access Token (PAT) from https://supabase.com/dashboard/account/tokens
- Store PAT securely in the app
- Use PAT to call Management API directly
- For Metrics API, would need to parse Prometheus format
- For user counts, query auth.users table using project's service role key

### Security Considerations:

- Personal Access Tokens have same privileges as user account
- Should be stored securely (encrypted storage)
- Users should be warned about token security
- Rate limits: 120 requests/minute per user per project
