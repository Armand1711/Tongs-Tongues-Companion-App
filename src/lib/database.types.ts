// Hand-authored to match supabase/schema.sql. If you regenerate this from the
// Supabase CLI (`supabase gen types typescript`), keep the shape in sync.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cards: {
        Row: {
          id: string;
          item_name: string;
          item_slug: string;
          language: string;
          language_code: string;
          word: string;
          phonetic: string;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          item_name: string;
          item_slug: string;
          language: string;
          language_code: string;
          word: string;
          phonetic: string;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          item_name?: string;
          item_slug?: string;
          language?: string;
          language_code?: string;
          word?: string;
          phonetic?: string;
          image_url?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_collections: {
        Row: {
          id: string;
          user_id: string;
          card_id: string;
          collected_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          card_id: string;
          collected_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          card_id?: string;
          collected_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_collections_card_id_fkey";
            columns: ["card_id"];
            isOneToOne: false;
            referencedRelation: "cards";
            referencedColumns: ["id"];
          }
        ];
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          caption: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          caption?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          caption?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      votes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      posts_with_votes: {
        Row: {
          id: string;
          user_id: string;
          image_url: string;
          caption: string | null;
          created_at: string;
          vote_count: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type Views<T extends keyof Database["public"]["Views"]> =
  Database["public"]["Views"][T]["Row"];

export type Card = Tables<"cards">;
export type UserCollection = Tables<"user_collections">;
export type Post = Tables<"posts">;
export type Vote = Tables<"votes">;
export type PostWithVotes = Views<"posts_with_votes">;
