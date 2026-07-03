export type CoachTurn = {
  role: 'user' | 'assistant';
  content: string;
};

export const MAX_CONVERSATION_TURNS = 6;

export function trimConversationHistory(turns: CoachTurn[]): CoachTurn[] {
  return turns.slice(-MAX_CONVERSATION_TURNS);
}
