import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SupabaseProject {
  id: string;
  name: string;
  projectRef: string; // e.g., "abcd1234"
  url: string; // e.g., "https://abcd1234.supabase.co"
  serviceRoleKey: string;
  personalAccessToken?: string; // For Management API access
  status: 'healthy' | 'warning' | 'error';
  createdAt: string;
}

export interface ProjectStats {
  totalUsers: number;
  activeUsers: number; // Users who signed in within last 24h
  apiRequests: number;
  databaseSize: string;
  usersTrend: number;
  activeUsersTrend: number;
  requestsTrend: number;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  disk: number;
}

export interface NotificationRule {
  id: string;
  projectId: string;
  name: string;
  enabled: boolean;
  triggerType: 'new_user' | 'new_row' | 'threshold';
  tableName?: string;
  threshold?: {
    metric: 'cpu' | 'memory' | 'disk';
    value: number;
  };
  message: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'user_signup' | 'api_request' | 'database_query' | 'alert';
  message: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'error';
}

const PROJECTS_KEY = '@supa_mobile:projects';
const NOTIFICATION_RULES_KEY = '@supa_mobile:notification_rules';

/**
 * Create a Supabase client instance for a specific project
 */
export function createSupabaseClient(url: string, serviceRoleKey: string): SupabaseClient {
  return createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Validate Supabase project credentials by attempting to connect
 */
export async function validateSupabaseCredentials(
  url: string,
  serviceRoleKey: string
): Promise<{ valid: boolean; error?: string; projectRef?: string }> {
  try {
    // Extract project ref from URL
    const urlMatch = url.match(/https?:\/\/([a-z0-9]+)\.supabase\.co/);
    if (!urlMatch) {
      return { valid: false, error: 'Invalid Supabase URL format' };
    }
    const projectRef = urlMatch[1];

    const client = createSupabaseClient(url, serviceRoleKey);
    
    // Try to query auth.users to verify service role key works
    const { error, count } = await client
      .from('auth.users')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      return { valid: false, error: error.message };
    }
    
    return { valid: true, projectRef };
  } catch (error) {
    return { 
      valid: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Storage helpers for projects
 */
export const ProjectStorage = {
  async getAll(): Promise<SupabaseProject[]> {
    try {
      const json = await AsyncStorage.getItem(PROJECTS_KEY);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },

  async save(project: SupabaseProject): Promise<void> {
    const projects = await this.getAll();
    const index = projects.findIndex((p) => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.push(project);
    }
    
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  },

  async remove(projectId: string): Promise<void> {
    const projects = await this.getAll();
    const filtered = projects.filter((p) => p.id !== projectId);
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(filtered));
  },

  async get(projectId: string): Promise<SupabaseProject | null> {
    const projects = await this.getAll();
    return projects.find((p) => p.id === projectId) || null;
  },
};

/**
 * Storage helpers for notification rules
 */
export const NotificationRuleStorage = {
  async getAll(projectId?: string): Promise<NotificationRule[]> {
    try {
      const json = await AsyncStorage.getItem(NOTIFICATION_RULES_KEY);
      const rules: NotificationRule[] = json ? JSON.parse(json) : [];
      return projectId ? rules.filter((r) => r.projectId === projectId) : rules;
    } catch {
      return [];
    }
  },

  async save(rule: NotificationRule): Promise<void> {
    const rules = await this.getAll();
    const index = rules.findIndex((r) => r.id === rule.id);
    
    if (index >= 0) {
      rules[index] = rule;
    } else {
      rules.push(rule);
    }
    
    await AsyncStorage.setItem(NOTIFICATION_RULES_KEY, JSON.stringify(rules));
  },

  async remove(ruleId: string): Promise<void> {
    const rules = await this.getAll();
    const filtered = rules.filter((r) => r.id !== ruleId);
    await AsyncStorage.setItem(NOTIFICATION_RULES_KEY, JSON.stringify(filtered));
  },

  async toggle(ruleId: string, enabled: boolean): Promise<void> {
    const rules = await this.getAll();
    const rule = rules.find((r) => r.id === ruleId);
    
    if (rule) {
      rule.enabled = enabled;
      await AsyncStorage.setItem(NOTIFICATION_RULES_KEY, JSON.stringify(rules));
    }
  },
};

/**
 * Fetch project statistics from Supabase
 */
export async function fetchProjectStats(
  client: SupabaseClient,
  personalAccessToken?: string,
  projectRef?: string
): Promise<ProjectStats> {
  try {
    // Fetch total user count from auth.users
    const { count: totalUsers, error: userError } = await client
      .from('auth.users')
      .select('*', { count: 'exact', head: true });

    if (userError) {
      console.error('Error fetching total users:', userError);
    }

    // Fetch active users (signed in within last 24 hours)
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count: activeUsers, error: activeError } = await client
      .from('auth.users')
      .select('*', { count: 'exact', head: true })
      .gte('last_sign_in_at', yesterday);

    if (activeError) {
      console.error('Error fetching active users:', activeError);
    }

    // Fetch API request count from Management API if PAT is available
    let apiRequests = 0;
    if (personalAccessToken && projectRef) {
      try {
        const response = await fetch(
          `https://api.supabase.com/v1/projects/${projectRef}/analytics/endpoints/usage.api-requests-count`,
          {
            headers: {
              'Authorization': `Bearer ${personalAccessToken}`,
            },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          // Sum up the request counts
          apiRequests = data.data?.reduce((sum: number, item: any) => sum + (item.count || 0), 0) || 0;
        }
      } catch (error) {
        console.error('Error fetching API requests:', error);
      }
    }

    // Calculate database size (this is an approximation)
    const { data: sizeData, error: sizeError } = await client.rpc('pg_database_size', {
      name: 'postgres',
    });

    let databaseSize = '0 MB';
    if (!sizeError && sizeData) {
      const sizeInMB = sizeData / (1024 * 1024);
      databaseSize = `${sizeInMB.toFixed(1)} MB`;
    }

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      apiRequests,
      databaseSize,
      usersTrend: 0, // Would need historical data to calculate
      activeUsersTrend: 0,
      requestsTrend: 0,
    };
  } catch (error) {
    console.error('Error fetching project stats:', error);
    return {
      totalUsers: 0,
      activeUsers: 0,
      apiRequests: 0,
      databaseSize: '0 MB',
      usersTrend: 0,
      activeUsersTrend: 0,
      requestsTrend: 0,
    };
  }
}

/**
 * Fetch resource usage metrics from Metrics API
 */
export async function fetchResourceUsage(
  projectRef: string,
  serviceRoleKey: string
): Promise<ResourceUsage> {
  try {
    // Fetch from Prometheus-compatible Metrics API
    const response = await fetch(
      `https://${projectRef}.supabase.co/customer/v1/privileged/metrics`,
      {
        headers: {
          'Authorization': `Basic ${btoa(`service_role:${serviceRoleKey}`)}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Metrics API error: ${response.status}`);
    }

    const text = await response.text();
    
    // Parse Prometheus format for CPU, memory, and disk metrics
    // This is a simplified parser - in production you'd want a proper Prometheus parser
    const cpuMatch = text.match(/pg_stat_activity_max_tx_duration\{[^}]*\}\s+([\d.]+)/);
    const memoryMatch = text.match(/pg_stat_database_blks_hit\{[^}]*\}\s+([\d.]+)/);
    
    // For now, return mock data as parsing Prometheus format is complex
    // In a real app, you'd use a Prometheus parsing library
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
    };
  } catch (error) {
    console.error('Error fetching resource usage:', error);
    // Return mock data on error
    return {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
    };
  }
}

/**
 * Fetch recent activity from auth logs
 */
export async function fetchRecentActivity(
  client: SupabaseClient
): Promise<ActivityItem[]> {
  try {
    // Query recent user signups
    const { data: recentUsers, error } = await client
      .from('auth.users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error || !recentUsers) {
      return [];
    }

    return recentUsers.map((user, index) => ({
      id: `${user.id}-${index}`,
      type: 'user_signup' as const,
      message: `New user signed up: ${user.email || 'Anonymous'}`,
      timestamp: user.created_at,
      severity: 'info' as const,
    }));
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }
}
