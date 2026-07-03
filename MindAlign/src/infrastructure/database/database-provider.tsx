import { drizzle, type ExpoSQLiteDatabase } from 'drizzle-orm/expo-sqlite';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';

import migrations from '../../../drizzle/migrations';

import { DATABASE_NAME } from './constants';
import * as schema from './schema';
import { ErrorState } from '@/presentation/components/screen-state';

type AppDatabase = ExpoSQLiteDatabase<typeof schema>;

const DatabaseContext = createContext<AppDatabase | null>(null);

type MigrationGateProps = {
  children: ReactNode;
  onRetry: () => void;
};

function MigrationGate({ children, onRetry }: MigrationGateProps) {
  const sqlite = useSQLiteContext();
  const db = useMemo(() => drizzle(sqlite, { schema }), [sqlite]);
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <ErrorState
        testID="migration-error"
        title="Database update failed"
        message={error.message}
        actionLabel="Retry"
        onAction={onRetry}
      />
    );
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
  const [attempt, setAttempt] = useState(0);

  return (
    <SQLiteProvider
      key={attempt}
      databaseName={DATABASE_NAME}
      options={{ enableChangeListener: true }}
    >
      <MigrationGate onRetry={() => setAttempt((current) => current + 1)}>{children}</MigrationGate>
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
