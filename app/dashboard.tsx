import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import {
  ProjectStorage,
  createSupabaseClient,
  fetchProjectStats,
  fetchResourceUsage,
  fetchRecentActivity,
  type SupabaseProject,
  type ProjectStats,
  type ResourceUsage,
  type ActivityItem,
} from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

export default function DashboardScreen() {
  const colors = useColors();
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();

  const [project, setProject] = useState<SupabaseProject | null>(null);
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [resources, setResources] = useState<ResourceUsage | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!projectId) return;

    const proj = await ProjectStorage.get(projectId);
    if (!proj) {
      router.back();
      return;
    }

    setProject(proj);

    const client = createSupabaseClient(proj.url, proj.anonKey);
    const [statsData, resourcesData, activitiesData] = await Promise.all([
      fetchProjectStats(client),
      fetchResourceUsage(),
      fetchRecentActivity(client),
    ]);

    setStats(statsData);
    setResources(resourcesData);
    setActivities(activitiesData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [projectId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getResourceColor = (value: number) => {
    if (value >= 85) return colors.error;
    if (value >= 70) return colors.warning;
    return colors.success;
  };

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return '↑';
    if (trend < 0) return '↓';
    return '→';
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return colors.success;
    if (trend < 0) return colors.error;
    return colors.muted;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        <View className="px-6 pt-4 pb-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-1">
              <Text className="text-3xl font-bold text-foreground">{project?.name}</Text>
              <View className="flex-row items-center mt-1">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: colors.success }}
                />
                <Text className="text-sm text-muted">Healthy</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({ pathname: '/notifications', params: { projectId } });
              }}
              className="w-10 h-10 rounded-full bg-surface items-center justify-center"
              activeOpacity={0.7}
            >
              <IconSymbol name="paperplane.fill" size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Stats Grid */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3 mb-3">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-sm text-muted mb-1">Total Users</Text>
              <Text className="text-2xl font-bold text-foreground mb-1">
                {stats?.totalUsers.toLocaleString()}
              </Text>
              <View className="flex-row items-center">
                <Text style={{ color: getTrendColor(stats?.usersTrend || 0) }} className="text-xs font-medium">
                  {getTrendIcon(stats?.usersTrend || 0)} {Math.abs(stats?.usersTrend || 0)}%
                </Text>
              </View>
            </View>

            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-sm text-muted mb-1">Active Users</Text>
              <Text className="text-2xl font-bold text-foreground mb-1">
                {stats?.activeUsers.toLocaleString()}
              </Text>
              <View className="flex-row items-center">
                <Text style={{ color: getTrendColor(stats?.activeUsersTrend || 0) }} className="text-xs font-medium">
                  {getTrendIcon(stats?.activeUsersTrend || 0)} {Math.abs(stats?.activeUsersTrend || 0)}%
                </Text>
              </View>
            </View>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-sm text-muted mb-1">API Requests</Text>
              <Text className="text-2xl font-bold text-foreground mb-1">
                {stats?.apiRequests.toLocaleString()}
              </Text>
              <View className="flex-row items-center">
                <Text style={{ color: getTrendColor(stats?.requestsTrend || 0) }} className="text-xs font-medium">
                  {getTrendIcon(stats?.requestsTrend || 0)} {Math.abs(stats?.requestsTrend || 0)}%
                </Text>
              </View>
            </View>

            <View className="flex-1 bg-surface rounded-2xl p-4 border border-border">
              <Text className="text-sm text-muted mb-1">Database Size</Text>
              <Text className="text-2xl font-bold text-foreground mb-1">{stats?.databaseSize}</Text>
              <Text className="text-xs text-muted">Today</Text>
            </View>
          </View>
        </View>

        {/* Resource Usage */}
        <View className="px-6 mb-6">
          <Text className="text-xl font-bold text-foreground mb-3">Resource Usage</Text>

          <View className="bg-surface rounded-2xl p-4 border border-border gap-4">
            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-foreground">CPU</Text>
                <Text className="text-sm font-medium" style={{ color: getResourceColor(resources?.cpu || 0) }}>
                  {resources?.cpu}%
                </Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${resources?.cpu ?? 0}%`,
                    backgroundColor: getResourceColor(resources?.cpu ?? 0),
                  }}
                />
              </View>
            </View>

            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-foreground">Memory</Text>
                <Text className="text-sm font-medium" style={{ color: getResourceColor(resources?.memory || 0) }}>
                  {resources?.memory}%
                </Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${resources?.memory ?? 0}%`,
                    backgroundColor: getResourceColor(resources?.memory ?? 0),
                  }}
                />
              </View>
            </View>

            <View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm font-medium text-foreground">Disk</Text>
                <Text className="text-sm font-medium" style={{ color: getResourceColor(resources?.disk || 0) }}>
                  {resources?.disk}%
                </Text>
              </View>
              <View className="h-2 bg-border rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    width: `${resources?.disk ?? 0}%`,
                    backgroundColor: getResourceColor(resources?.disk ?? 0),
                  }}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Recent Activity */}
        <View className="px-6">
          <Text className="text-xl font-bold text-foreground mb-3">Recent Activity</Text>

          <View className="bg-surface rounded-2xl border border-border overflow-hidden">
            {activities.map((activity, index) => (
              <View
                key={activity.id}
                className="p-4"
                style={{
                  borderBottomWidth: index < activities.length - 1 ? 1 : 0,
                  borderBottomColor: colors.border,
                }}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-foreground mb-1">{activity.message}</Text>
                    <Text className="text-xs text-muted">{formatTimestamp(activity.timestamp)}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
