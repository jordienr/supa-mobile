import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { ProjectStorage, type SupabaseProject } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

export default function ProjectsScreen() {
  const colors = useColors();
  const router = useRouter();
  const [projects, setProjects] = useState<SupabaseProject[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadProjects = async () => {
    const allProjects = await ProjectStorage.getAll();
    setProjects(allProjects);
  };

  useFocusEffect(
    useCallback(() => {
      loadProjects();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProjects();
    setRefreshing(false);
  };

  const handleAddProject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/add-project');
  };

  const handleProjectPress = (project: SupabaseProject) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/dashboard',
      params: { projectId: project.id },
    });
  };

  const getStatusColor = (status: SupabaseProject['status']) => {
    switch (status) {
      case 'healthy':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.muted;
    }
  };

  const renderProject = ({ item }: { item: SupabaseProject }) => (
    <TouchableOpacity
      onPress={() => handleProjectPress(item)}
      className="bg-surface rounded-2xl p-4 mb-3 border border-border"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-lg font-semibold text-foreground flex-1">{item.name}</Text>
        <View
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: getStatusColor(item.status) }}
        />
      </View>
      <Text className="text-sm text-muted mb-3" numberOfLines={1}>
        {item.url}
      </Text>
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="text-xs text-muted mb-1">Users</Text>
          <Text className="text-base font-medium text-foreground">-</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-muted mb-1">Requests Today</Text>
          <Text className="text-base font-medium text-foreground">-</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View className="items-center justify-center py-20 px-6">
      <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-4">
        <IconSymbol name="house.fill" size={40} color={colors.muted} />
      </View>
      <Text className="text-2xl font-bold text-foreground mb-2">No Projects Yet</Text>
      <Text className="text-base text-muted text-center mb-6">
        Connect your first Supabase project to start monitoring
      </Text>
      <TouchableOpacity
        onPress={() => router.push('/add-project')}
        className="bg-primary px-6 py-3 rounded-full mb-4"
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold">Connect Project</Text>
      </TouchableOpacity>
      <View className="flex-row items-center gap-4">
        <TouchableOpacity
          onPress={() => router.push('/security-info')}
          activeOpacity={0.7}
        >
          <Text className="text-sm text-muted">🔒 Security Info</Text>
        </TouchableOpacity>
        <Text className="text-muted">•</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://github.com/jordienr/supa-mobile')}
          activeOpacity={0.7}
        >
          <Text className="text-sm text-muted">💻 Open Source</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScreenContainer className="flex-1">
      <View className="px-6 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-3xl font-bold text-foreground">Projects</Text>
        {projects.length > 0 && (
          <TouchableOpacity
            onPress={handleAddProject}
            className="w-10 h-10 rounded-full bg-primary items-center justify-center"
            activeOpacity={0.8}
          >
            <Text className="text-white text-2xl font-light">+</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={projects}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: 24,
          flexGrow: 1,
        }}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      />
    </ScreenContainer>
  );
}
