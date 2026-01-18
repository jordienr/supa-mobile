import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { ProjectStorage, validateSupabaseCredentials, type SupabaseProject } from '@/lib/supabase';
import * as Haptics from 'expo-haptics';

export default function AddProjectScreen() {
  const colors = useColors();
  const router = useRouter();
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConnect = async () => {
    if (!url.trim() || !anonKey.trim()) {
      Alert.alert('Missing Information', 'Please provide both project URL and API key');
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const { valid, error } = await validateSupabaseCredentials(url.trim(), anonKey.trim());

    if (!valid) {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Connection Failed', error || 'Could not connect to Supabase project');
      return;
    }

    const project: SupabaseProject = {
      id: Date.now().toString(),
      name: name.trim() || 'My Project',
      url: url.trim(),
      anonKey: anonKey.trim(),
      status: 'healthy',
      createdAt: new Date().toISOString(),
    };

    await ProjectStorage.save(project);
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    router.back();
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-4">
          <View className="mb-6">
            <Text className="text-3xl font-bold text-foreground mb-2">Add Project</Text>
            <Text className="text-base text-muted">
              Connect your Supabase project to start monitoring
            </Text>
          </View>

          <View className="gap-4 mb-6">
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Project Name (Optional)
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="My Awesome Project"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Project URL *
              </Text>
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="https://xxxxx.supabase.co"
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="next"
              />
              <Text className="text-xs text-muted mt-1">
                Found in your Supabase project settings
              </Text>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Anon/Public API Key *
              </Text>
              <TextInput
                value={anonKey}
                onChangeText={setAnonKey}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                placeholderTextColor={colors.muted}
                className="bg-surface border border-border rounded-xl px-4 py-3 text-foreground"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleConnect}
              />
              <Text className="text-xs text-muted mt-1">
                Found in Settings → API → Project API keys
              </Text>
            </View>
          </View>

          <View className="bg-surface rounded-xl p-4 mb-6 border border-border">
            <Text className="text-sm text-muted leading-relaxed">
              💡 <Text className="font-medium">Tip:</Text> You can find your project URL and API key in your Supabase
              dashboard under Settings → API
            </Text>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              onPress={handleConnect}
              disabled={loading}
              className="bg-primary rounded-full py-4 items-center"
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-white font-semibold text-base">Connect Project</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              disabled={loading}
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
