import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';

export default function SecurityInfoScreen() {
  const router = useRouter();
  const colors = useColors();

  const openGitHub = () => {
    Linking.openURL('https://github.com/jordienr/supa-mobile');
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 pt-4 pb-8">
          <View className="mb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-4"
              activeOpacity={0.7}
            >
              <IconSymbol name="chevron.left" size={24} color={colors.foreground} />
            </TouchableOpacity>
            <Text className="text-3xl font-bold text-foreground mb-2">🔒 Security & Privacy</Text>
            <Text className="text-base text-muted">
              How Supa Mobile protects your data
            </Text>
          </View>

          <View className="gap-6">
            <View className="bg-surface rounded-xl p-5 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">
                🔐 Encrypted Storage
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                Your service role key and Personal Access Token are stored using <Text className="font-medium text-foreground">Expo SecureStore</Text>, which provides hardware-backed encryption on iOS and Android. These keys are encrypted at rest and never leave your device.
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-5 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">
                👁️ Read-Only Operations
              </Text>
              <Text className="text-sm text-muted leading-relaxed mb-3">
                This app <Text className="font-medium text-foreground">only performs SELECT queries</Text> on your Supabase project. No data is ever modified, created, or deleted.
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                Operations performed:
              </Text>
              <View className="mt-2 gap-2">
                <Text className="text-sm text-muted">• Count users in auth.users table</Text>
                <Text className="text-sm text-muted">• Query database size</Text>
                <Text className="text-sm text-muted">• Fetch recent user signups</Text>
                <Text className="text-sm text-muted">• Read resource metrics (CPU, memory, disk)</Text>
                <Text className="text-sm text-muted">• Fetch API usage statistics</Text>
              </View>
            </View>

            <View className="bg-surface rounded-xl p-5 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">
                🌐 No External Servers
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                Your credentials are <Text className="font-medium text-foreground">never sent to any third-party servers</Text>. All API calls are made directly from your device to Supabase's official APIs:
              </Text>
              <View className="mt-2 gap-2">
                <Text className="text-sm text-muted">• api.supabase.com (Management API)</Text>
                <Text className="text-sm text-muted">• your-project.supabase.co (Metrics API)</Text>
                <Text className="text-sm text-muted">• your-project.supabase.co (Database queries)</Text>
              </View>
            </View>

            <View className="bg-surface rounded-xl p-5 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">
                📖 Open Source
              </Text>
              <Text className="text-sm text-muted leading-relaxed mb-3">
                Supa Mobile is <Text className="font-medium text-foreground">100% open source</Text>. You can review the entire codebase on GitHub to verify that your data is handled securely.
              </Text>
              <TouchableOpacity
                onPress={openGitHub}
                className="bg-primary rounded-lg py-3 px-4 items-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-semibold">View Source Code on GitHub</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-surface rounded-xl p-5 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">
                ⚠️ Service Role Key
              </Text>
              <Text className="text-sm text-muted leading-relaxed mb-3">
                The service role key has <Text className="font-medium text-foreground">full admin access</Text> to your Supabase project. This is necessary to query the auth.users table and access the Metrics API.
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                <Text className="font-medium text-foreground">Why it's safe:</Text> The key is encrypted on your device and only used for read operations. Since the app is open source, you can verify that no malicious operations are performed.
              </Text>
            </View>

            <View className="bg-surface rounded-xl p-5 border border-border">
              <Text className="text-lg font-semibold text-foreground mb-3">
                🗑️ Data Deletion
              </Text>
              <Text className="text-sm text-muted leading-relaxed">
                You can delete your stored credentials at any time by removing a project from the app. This will permanently delete all encrypted keys from your device.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
