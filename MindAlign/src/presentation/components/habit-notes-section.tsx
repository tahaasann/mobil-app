import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { HabitNote } from '@/domain/entities/habit-note';
import { GlassCard } from '@/presentation/components/glass-card';
import { GlassPressable } from '@/presentation/components/glass-pressable';

type HabitNotesSectionProps = {
  notes: HabitNote[];
  onAddNote: (content: string) => Promise<void>;
  onDeleteNote: (noteId: string) => Promise<void>;
};

export function HabitNotesSection({ notes, onAddNote, onDeleteNote }: HabitNotesSectionProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAdd = async () => {
    const content = draft.trim();
    if (!content || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      await onAddNote(content);
      setDraft('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GlassCard variant="subtle" className="p-4" testID="habit-notes-section">
      <Text className="text-base font-semibold text-foreground dark:text-foreground-dark">
        {t('habitDetail.notesTitle')}
      </Text>
      <Text className="mt-1 text-sm text-muted dark:text-muted-dark">
        {t('habitDetail.notesHint')}
      </Text>

      <TextInput
        accessibilityLabel={t('habitDetail.notePlaceholder')}
        multiline
        placeholder={t('habitDetail.notePlaceholder')}
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        testID="habit-note-input"
        value={draft}
        onChangeText={setDraft}
      />

      <GlassPressable
        accessibilityRole="button"
        accessibilityLabel={t('habitDetail.addNote')}
        className="mt-3 rounded-xl bg-accent px-4 py-3"
        disabled={!draft.trim() || isSaving}
        testID="habit-note-add"
        onPress={() => void handleAdd()}
      >
        <Text className="text-center text-sm font-semibold text-white">
          {t('habitDetail.addNote')}
        </Text>
      </GlassPressable>

      <View className="mt-4 gap-3">
        {notes.length === 0 ? (
          <Text className="text-sm text-muted dark:text-muted-dark">
            {t('habitDetail.notesEmpty')}
          </Text>
        ) : (
          notes.map((note) => (
            <View
              key={note.id}
              className="rounded-xl border border-white/20 bg-white/40 p-3 dark:bg-black/20"
              testID={`habit-note-item-${note.id}`}
            >
              <Text className="text-sm text-foreground dark:text-foreground-dark">
                {note.content}
              </Text>
              <GlassPressable
                accessibilityRole="button"
                accessibilityLabel={t('habitDetail.deleteNote')}
                className="mt-2 self-start rounded-lg bg-red-500/90 px-3 py-1"
                testID={`habit-note-delete-${note.id}`}
                onPress={() => void onDeleteNote(note.id)}
              >
                <Text className="text-xs font-semibold text-white">
                  {t('habitDetail.deleteNote')}
                </Text>
              </GlassPressable>
            </View>
          ))
        )}
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  input: {
    marginTop: 12,
    minHeight: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1A1A1A',
    textAlignVertical: 'top',
  },
});
