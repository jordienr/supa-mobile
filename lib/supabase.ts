import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SupabaseProject {
  id: string;
  name: string;
  url: string;
  anonKey: string;
  status: 'healthy' | 'warning' | 'error';
  createdAt: string;
}

export interface ProjectStats {
  totalUsers: number;
  activeUsers: number;
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
export function createSupabaseClient(url: string, anonKey: string): SupabaseClient {
  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Validate Supabase project credentials by attempting to connect
 */
export async function validateSupabaseCredentials(
  url: string,
  anonKey: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    const client = createSupabaseClient(url, anonKey);
    const { error } = await client.from('_').select('*').limit(1);
    
    // If we get a "relation does not exist" error, credentials are valid
    // Any other error means invalid credentials
    if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
      return { valid: false, error: error.message };
    }
    
    return { valid: true };
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
  client: SupabaseClient
): Promise<ProjectStats> {
  try {
    // Fetch user count from auth.users
    const { count: totalUsers } = await client
      .from('auth.users')
      .select('*', { count: 'exact', head: true });

    // For demo purposes, generate mock data
    // In production, you would query actual metrics from Supabase
    return {
      totalUsers: totalUsers || 0,
      activeUsers: Math.floor((totalUsers || 0) * 0.3),
      apiRequests: Math.floor(Math.random() * 10000),
      databaseSize: `${(Math.random() * 500).toFixed(1)} MB`,
      usersTrend: Math.random() > 0.5 ? Math.floor(Math.random() * 20) : -Math.floor(Math.random() * 10),
      activeUsersTrend: Math.random() > 0.5 ? Math.floor(Math.random() * 15) : -Math.floor(Math.random() * 8),
      requestsTrend: Math.random() > 0.5 ? Math.floor(Math.random() * 25) : -Math.floor(Math.random() * 12),
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
 * Fetch resource usage metrics
 */
export async function fetchResourceUsage(): Promise<ResourceUsage> {
  // In production, this would query actual metrics from Supabase monitoring API
  // For now, return mock data
  return {
    cpu: Math.floor(Math.random() * 100),
    memory: Math.floor(Math.random() * 100),
    disk: Math.floor(Math.random() * 100),
  };
}

/**
 * Fetch recent activity
 */
export async function fetchRecentActivity(
  client: SupabaseClient
): Promise<ActivityItem[]> {
  // In production, this would query actual activity logs
  // For now, return mock data
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'user_signup',
      message: 'New user signed up',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      severity: 'info',
    },
    {
      id: '2',
      type: 'api_request',
      message: 'API request to /users endpoint',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      severity: 'info',
    },
    {
      id: '3',
      type: 'database_query',
      message: 'SELECT query on users table',
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      severity: 'info',
    },
  ];

  return activities;
}
