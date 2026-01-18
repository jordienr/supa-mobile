import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { NotificationRuleStorage, type NotificationRule } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

type TriggerType = 'new_user' | 'new_row' | 'threshold';
type ThresholdMetric = 'cpu' | 'memory' | 'disk';

export default function CreateRuleScreen() {
  const colors = useColors();
  const router = useRouter();
  const params = useLocalSearchParams<{
    projectId: string;
    ruleId?: string;
    name?: string;
    triggerType?: string;
    tableName?: string;
    thresholdMetric?: string;
    thresholdValue?: string;
    message?: string;
  }>();

  const isEditing = !!params.ruleId;

  const [name, setName] = useState(params.name || '');
  const [triggerType, setTriggerType] = useState<TriggerType>(
    (params.triggerType as TriggerType) || 'new_user'
  );
  const [tableName, setTableName] = useState(params.tableName || '');
  const [thresholdMetric, setThresholdMetric] = useState<ThresholdMetric>(
    (params.thresholdMetric as ThresholdMetric) || 'cpu'
  );
  const [thresholdValue, setThresholdValue] = useState(params.thresholdValue || '80');
  const [message, setMessage] = useState(params.message || '');

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please provide a rule name');
      return;
    }

    if (triggerType === 'new_row' && !tableName.trim()) {
      Alert.alert('Missing Information', 'Please provide a table name');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Missing Information', 'Please provide a notification message');
      return;
    }

    const rule: NotificationRule = {
      id: params.ruleId || Date.now().toString(),
      projectId: params.projectId,
      name: name.trim(),
      enabled: true,
      triggerType,
      tableName: triggerType === 'new_row' ? tableName.trim() : undefined,
      threshold:
        triggerType === 'threshold'
          ? {
              metric: thresholdMetric,
              value: parseInt(thresholdValue, 10),
            }
          : undefined,
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };

    await NotificationRuleStorage.save(rule);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const TriggerTypeButton = ({
    type,
    label,
  }: {
    type: TriggerType;
    label: string;
  }) => (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTriggerType(type);
      }}
      className={`flex-1 py-3 px-4 rounded-xl border ${
        triggerType === type
          ? 'border-primary bg-primary/10'
          : 'border-border bg-surface'
      }`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-center font-medium ${
          triggerType === type ? 'text-primary' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const MetricButton = ({
    metric,
    label,
  }: {
    metric: ThresholdMetric;
    label: string;
  }) => (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setThresholdMetric(metric);
      }}
      className={`flex-1 py-3 px-4 rounded-xl border ${
        thresholdMetric === metric
          ? 'border-primary bg-primary/10'
          : 'border-border bg-surface'
      }`}
      activeOpacity={0.7}
    >
      <Text
        className={`text-center font-medium ${
          thresholdMetric === metric ? 'text-primary' : 'text-foreground'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-4">
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-2">
              {isEditing ? 'Edit Rule' : 'Create Rule'}
            </Text>
            <Text className="text-base text-muted">
              Set up custom notifications for your project
            </Text>
          </View>

          <View className="gap-4 mb-6">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Rule Name *
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="High CPU Alert"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Trigger Type *
              </Text>
              <View className="flex-row gap-2">
                <TriggerTypeButton type="new_user" label="New User" />
                <TriggerTypeButton type="new_row" label="New Row" />
                <TriggerTypeButton type="threshold" label="Threshold" />
              </View>
            </View>

            {triggerType === 'new_row' && (
              <View>
                <Text className="text-sm font-medium text-foreground mb-2">
                  Table Name *
                </Text>
                <TextInput
                  value={tableName}
                  onChangeText={setTableName}
                  placeholder="subscriptions"
                  placeholderTextColor={colors.muted}
                  className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            )}

            {triggerType === 'threshold' && (
              <>
                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Metric *
                  </Text>
                  <View className="flex-row gap-2">
                    <MetricButton metric="cpu" label="CPU" />
                    <MetricButton metric="memory" label="Memory" />
                    <MetricButton metric="disk" label="Disk" />
                  </View>
                </View>

                <View>
                  <Text className="text-sm font-medium text-foreground mb-2">
                    Threshold Value (%) *
                  </Text>
                  <TextInput
                    value={thresholdValue}
                    onChangeText={setThresholdValue}
                    placeholder="80"
                    placeholderTextColor={colors.muted}
                    className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                    keyboardType="number-pad"
                    returnKeyType="next"
                  />
                </View>
              </>
            )}

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Notification Message *
              </Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="⚠️ CPU usage is above 80%"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                returnKeyType="done"
              />
              <Text className="text-xs text-muted mt-1">
                This message will be shown in the push notification
              </Text>
            </View>
          </View>

          <View className="gap-3 mb-6">
            <TouchableOpacity
              onPress={handleSave}
              className="bg-primary rounded-full py-4 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold text-base">
                {isEditing ? 'Update Rule' : 'Create Rule'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="py-4 items-center"
              activeOpacity={0.7}
            >
              <Text className="text-muted font-medium">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
