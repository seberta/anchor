export type Database = {
  public: {
    Tables: {
      therapists: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id: string; name: string; created_at?: string };
        Update: { name?: string };
        Relationships: [];
      };
      patients: {
        Row: {
          id: string;
          therapist_id: string;
          name: string;
          chat_token: string;
          archived: boolean;
          created_at: string;
        };
        Insert: { therapist_id: string; name: string; id?: string; chat_token?: string; archived?: boolean; created_at?: string };
        Update: { name?: string; archived?: boolean };
        Relationships: [];
      };
      patient_context: {
        Row: { id: string; patient_id: string; content: string; updated_at: string };
        Insert: { patient_id: string; content: string; id?: string; updated_at?: string };
        Update: { content?: string; updated_at?: string };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          patient_id: string;
          started_at: string;
          last_message_at: string;
          therapist_notes: string | null;
          flagged: boolean;
          summary: string | null;
        };
        Insert: { patient_id: string; id?: string; started_at?: string; last_message_at?: string; therapist_notes?: string | null; flagged?: boolean; summary?: string | null };
        Update: { therapist_notes?: string | null; flagged?: boolean; summary?: string | null };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: { conversation_id: string; role: "user" | "assistant"; content: string; id?: string; created_at?: string };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Convenience row types
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type PatientContext = Database["public"]["Tables"]["patient_context"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
