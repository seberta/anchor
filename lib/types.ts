export type Database = {
  public: {
    Tables: {
      therapists: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id: string; name: string };
        Update: { name?: string };
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
        Insert: { therapist_id: string; name: string };
        Update: { name?: string; archived?: boolean };
      };
      patient_context: {
        Row: { id: string; patient_id: string; content: string; updated_at: string };
        Insert: { patient_id: string; content: string };
        Update: { content?: string; updated_at?: string };
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
        Insert: { patient_id: string };
        Update: { therapist_notes?: string; flagged?: boolean; summary?: string };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: "user" | "assistant";
          content: string;
          created_at: string;
        };
        Insert: { conversation_id: string; role: "user" | "assistant"; content: string };
        Update: never;
      };
    };
  };
};

// Convenience row types
export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type PatientContext = Database["public"]["Tables"]["patient_context"]["Row"];
export type Conversation = Database["public"]["Tables"]["conversations"]["Row"];
export type Message = Database["public"]["Tables"]["messages"]["Row"];
