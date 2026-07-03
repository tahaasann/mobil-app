import { Redirect, type Href } from 'expo-router';

/** Legacy `/settings` deep links → profile tab (FAZ 16 / T-256). */
export default function SettingsRedirect() {
  return <Redirect href={'/(tabs)/profile' as Href} />;
}
