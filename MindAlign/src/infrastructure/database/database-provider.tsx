import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import migrations from '../../../drizzle/migrations';

import { DATABASE_NAME } from './constants';
import * as schema from './schema';

type AppDatabase = ExpoSQLiteDatabase<typeof schema>;

const DatabaseContext = createContext<AppDatabase | null>(null);

function MigrationGate({ children }: { children: ReactNode }) {
  const sqlite = useSQLiteContext();
  const db = useMemo(() => drizzle(sqlite, { schema }), [sqlite]);
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    throw error;
  }

  if (!success) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (__DEV__) {
    console.log('[DatabaseProvider] migrations applied');
  }

  return <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>;
}

export function DatabaseProvider({ children }: { children: ReactNode }) {
  return (
    <SQLiteProvider databaseName={DATABASE_NAME} options={{ enableChangeListener: true }}>
      <MigrationGate>{children}</MigrationGate>
    </SQLiteProvider>
  );
}

export function useAppDatabase(): AppDatabase {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error('useAppDatabase must be used within DatabaseProvider');
  }
  return db;
}
