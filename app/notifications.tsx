import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { NotificationRuleStorage, type NotificationRule } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

export default function NotificationsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [rules, setRules] = useState<NotificationRule[]>([]);

  const loadRules = async () => {
    if (!projectId) return;
    const allRules = await NotificationRuleStorage.getAll(projectId);
    setRules(allRules);
  };

  useFocusEffect(
    useCallback(() => {
      loadRules();
    }, [projectId])
  );

  const handleToggle = async (ruleId: string, enabled: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await NotificationRuleStorage.toggle(ruleId, enabled);
    await loadRules();
  };

  const handleDelete = (rule: NotificationRule) => {
    Alert.alert(
      'Delete Rule',
      `Are you sure you want to delete "${rule.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await NotificationRuleStorage.remove(rule.id);
            await loadRules();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleAddRule = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/create-rule', params: { projectId } });
  };

  const handleEditRule = (rule: NotificationRule) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: '/create-rule',
      params: {
        projectId,
        ruleId: rule.id,
        name: rule.name,
        triggerType: rule.triggerType,
        tableName: rule.tableName || '',
        thresholdMetric: rule.threshold?.metric || '',
        thresholdValue: rule.threshold?.value?.toString() || '',
        message: rule.message,
      },
    });
  };

  const getTriggerLabel = (rule: NotificationRule) => {
    switch (rule.triggerType) {
      case 'new_user':
        return 'New user signup';
      case 'new_row':
        return `New row in ${rule.tableName}`;
      case 'threshold':
        return `${rule.threshold?.metric.toUpperCase()} > ${rule.threshold?.value}%`;
      default:
        return 'Unknown trigger';
    }
  };

  const renderRule = ({ item }: { item: NotificationRule }) => (
    <TouchableOpacity
      onPress={() => handleEditRule(item)}
      onLongPress={() => handleDelete(item)}
      className="bg-surface rounded-2xl p-4 mb-3 border border-border"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-base font-semibold text-foreground flex-1">{item.name}</Text>
        <Switch
          value={item.enabled}
          onValueChange={(value) => handleToggle(item.id, value)}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor="#ffffff"
        />
      </View>
      <Text className="text-sm text-muted mb-1">{getTriggerLabel(item)}</Text>
      <Text className="text-xs text-muted" numberOfLines={2}>
        {item.message}
      </Text>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-surface items-center justify-center mb-4">
        <IconSymbol name="paperplane.fill" size={40} color={colors.muted} />
      </View>
      <Text className="text-2xl font-bold text-foreground mb-2 text-center">
        No Notification Rules
      </Text>
      <Text className="text-base text-muted text-center mb-6">
        Create custom alerts for events in your Supabase project
      </Text>
      <TouchableOpacity
        onPress={handleAddRule}
        className="bg-primary px-6 py-3 rounded-full"
        activeOpacity={0.8}
      >
        <Text className="text-white font-semibold">Create Rule</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer>
      <View className="flex-1">
        <View className="px-6 pt-4 pb-3 flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-foreground">Notifications</Text>
          {rules.length > 0 && (
            <TouchableOpacity
              onPress={handleAddRule}
              className="w-10 h-10 rounded-full bg-primary items-center justify-center"
              activeOpacity={0.8}
            >
              <Text className="text-white text-2xl font-light">+</Text>
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={rules}
          renderItem={renderRule}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 24,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    </ScreenContainer>
  );
}
