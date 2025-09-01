export interface MessageRow {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
}

export interface ConversationRow {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  updated_at: string;
}