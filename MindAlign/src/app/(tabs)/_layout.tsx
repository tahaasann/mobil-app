import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

const TAB_ICONS: Record<'index' | 'chat' | 'saved' | 'profile', string> = {
  index: '⌂',
  chat: '💬',
  saved: '🔖',
  profile: '👤',
};

export default function TabsLayout() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const tabBarHeight = 56 + insets.bottom;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#059669',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: tabBarHeight,
          paddingBottom: insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarLabel: t('tabs.home'),
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 18 }} accessibilityElementsHidden>
              {TAB_ICONS.index}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('tabs.chat'),
          tabBarLabel: t('tabs.chat'),
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }} accessibilityElementsHidden>
              {TAB_ICONS.chat}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: t('tabs.saved'),
          tabBarLabel: t('tabs.saved'),
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }} accessibilityElementsHidden>
              {TAB_ICONS.saved}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 16 }} accessibilityElementsHidden>
              {TAB_ICONS.profile}
            </Text>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null,
          tabBarButton: () => null,
        }}
      />
    </Tabs>
  );
}
