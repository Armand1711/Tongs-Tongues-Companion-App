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
          display_name: string | null;
          challenge_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          image_url: string;
          caption?: string | null;
          display_name?: string | null;
          challenge_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          image_url?: string;
          caption?: string | null;
          display_name?: string | null;
          challenge_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "posts_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: false;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          }
        ];
      };
      challenges: {
        Row: {
          id: string;
          theme: string;
          starts_at: string;
          ends_at: string;
          status: "active" | "closed";
          created_at: string;
        };
        Insert: {
          id?: string;
          theme: string;
          starts_at?: string;
          ends_at: string;
          status?: "active" | "closed";
          created_at?: string;
        };
        Update: {
          id?: string;
          theme?: string;
          starts_at?: string;
          ends_at?: string;
          status?: "active" | "closed";
          created_at?: string;
        };
        Relationships: [];
      };
      voucher_codes: {
        Row: {
          id: string;
          challenge_id: string;
          post_id: string;
          user_id: string;
          code: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          challenge_id: string;
          post_id: string;
          user_id: string;
          code: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          challenge_id?: string;
          post_id?: string;
          user_id?: string;
          code?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "voucher_codes_challenge_id_fkey";
            columns: ["challenge_id"];
            isOneToOne: true;
            referencedRelation: "challenges";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "voucher_codes_post_id_fkey";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "posts";
            referencedColumns: ["id"];
          }
        ];
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
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          display_name: string | null;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          display_name?: string | null;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          display_name?: string | null;
          body?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey";
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
          display_name: string | null;
          challenge_id: string | null;
          created_at: string;
          vote_count: number;
        };
        Relationships: [];
      };
      hall_of_fame: {
        Row: {
          challenge_id: string;
          theme: string;
          ends_at: string;
          post_id: string;
          image_url: string;
          caption: string | null;
          display_name: string | null;
          won_at: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      close_challenge_if_due: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
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
export type Challenge = Tables<"challenges">;
export type VoucherCode = Tables<"voucher_codes">;
export type Comment = Tables<"comments">;
export type PostWithVotes = Views<"posts_with_votes">;
export type HallOfFameEntry = Views<"hall_of_fame">;
