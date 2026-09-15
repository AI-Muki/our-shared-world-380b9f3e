export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          budget: string
          category: string
          completed_at: string | null
          couple_id: string
          created_at: string
          created_by: string
          description: string | null
          duration: string
          id: string
          location: string | null
          notes: string | null
          planned_date: string | null
          priority: number
          status: string
          title: string
          updated_at: string
          vibe: string
        }
        Insert: {
          budget?: string
          category?: string
          completed_at?: string | null
          couple_id: string
          created_at?: string
          created_by: string
          description?: string | null
          duration?: string
          id?: string
          location?: string | null
          notes?: string | null
          planned_date?: string | null
          priority?: number
          status?: string
          title: string
          updated_at?: string
          vibe?: string
        }
        Update: {
          budget?: string
          category?: string
          completed_at?: string | null
          couple_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          duration?: string
          id?: string
          location?: string | null
          notes?: string | null
          planned_date?: string | null
          priority?: number
          status?: string
          title?: string
          updated_at?: string
          vibe?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      bucket_items: {
        Row: {
          completed_at: string | null
          couple_id: string
          created_at: string
          created_by: string
          id: string
          location: string | null
          notes: string | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          couple_id: string
          created_at?: string
          created_by: string
          id?: string
          location?: string | null
          notes?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          couple_id?: string
          created_at?: string
          created_by?: string
          id?: string
          location?: string | null
          notes?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bucket_items_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_members: {
        Row: {
          couple_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          couple_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          couple_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "couple_members_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      couple_spaces: {
        Row: {
          anniversary_date: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          photo_url: string | null
          updated_at: string
        }
        Insert: {
          anniversary_date?: string | null
          created_at?: string
          created_by: string
          id?: string
          name?: string
          photo_url?: string | null
          updated_at?: string
        }
        Update: {
          anniversary_date?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      date_ideas: {
        Row: {
          couple_id: string
          created_at: string
          created_by: string
          id: string
          is_secret: boolean
          text: string
          used_at: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string
          created_by: string
          id?: string
          is_secret?: boolean
          text: string
          used_at?: string | null
        }
        Update: {
          couple_id?: string
          created_at?: string
          created_by?: string
          id?: string
          is_secret?: boolean
          text?: string
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "date_ideas_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          couple_id: string
          created_at: string
          created_by: string
          emoji: string
          id: string
          name: string
        }
        Insert: {
          couple_id: string
          created_at?: string
          created_by: string
          emoji?: string
          id?: string
          name: string
        }
        Update: {
          couple_id?: string
          created_at?: string
          created_by?: string
          emoji?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "games_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          code: string
          couple_id: string
          created_at: string
          created_by: string
          expires_at: string
          id: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          couple_id: string
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          couple_id?: string
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invites_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          couple_id: string
          created_at: string
          created_by: string
          game_id: string
          id: string
          notes: string | null
          played_at: string
          score_text: string | null
          winner_id: string | null
        }
        Insert: {
          couple_id: string
          created_at?: string
          created_by: string
          game_id: string
          id?: string
          notes?: string | null
          played_at?: string
          score_text?: string | null
          winner_id?: string | null
        }
        Update: {
          couple_id?: string
          created_at?: string
          created_by?: string
          game_id?: string
          id?: string
          notes?: string | null
          played_at?: string
          score_text?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_couple_id_fkey"
            columns: ["couple_id"]
            isOneToOne: false
            referencedRelation: "couple_spaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_couple_member: {
        Args: { _couple_id: string; _user_id: string }
        Returns: boolean
      }
      my_couple_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
