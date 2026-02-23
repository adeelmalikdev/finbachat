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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assessments: {
        Row: {
          answers: Json
          assessment_type: Database["public"]["Enums"]["assessment_type"]
          behavior_score: number | null
          completed_at: string
          confidence_score: number | null
          created_at: string
          id: string
          knowledge_score: number | null
          overall_score: number | null
          user_id: string
        }
        Insert: {
          answers?: Json
          assessment_type: Database["public"]["Enums"]["assessment_type"]
          behavior_score?: number | null
          completed_at?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          knowledge_score?: number | null
          overall_score?: number | null
          user_id: string
        }
        Update: {
          answers?: Json
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          behavior_score?: number | null
          completed_at?: string
          confidence_score?: number | null
          created_at?: string
          id?: string
          knowledge_score?: number | null
          overall_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          xp_required: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          xp_required?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          xp_required?: number
        }
        Relationships: []
      }
      budget_sim_months: {
        Row: {
          allocations: Json
          balance_after: number
          balance_before: number
          created_at: string
          id: string
          life_event: Json | null
          month_number: number
          savings_total: number
          session_id: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          allocations?: Json
          balance_after?: number
          balance_before?: number
          created_at?: string
          id?: string
          life_event?: Json | null
          month_number: number
          savings_total?: number
          session_id: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          allocations?: Json
          balance_after?: number
          balance_before?: number
          created_at?: string
          id?: string
          life_event?: Json | null
          month_number?: number
          savings_total?: number
          session_id?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "budget_sim_months_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "budget_sim_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_sim_sessions: {
        Row: {
          behavior_type: string | null
          completed_at: string | null
          created_at: string
          current_month: number
          id: string
          monthly_income: number
          status: string
          total_xp_earned: number
          user_id: string
        }
        Insert: {
          behavior_type?: string | null
          completed_at?: string | null
          created_at?: string
          current_month?: number
          id?: string
          monthly_income?: number
          status?: string
          total_xp_earned?: number
          user_id: string
        }
        Update: {
          behavior_type?: string | null
          completed_at?: string | null
          created_at?: string
          current_month?: number
          id?: string
          monthly_income?: number
          status?: string
          total_xp_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      content_likes: {
        Row: {
          content_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_likes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "expert_content"
            referencedColumns: ["id"]
          },
        ]
      }
      expert_content: {
        Row: {
          author_id: string
          body: string
          category: string | null
          created_at: string
          id: string
          likes_count: number
          status: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id: string
          body: string
          category?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          status?: Database["public"]["Enums"]["content_status"]
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string
          body?: string
          category?: string | null
          created_at?: string
          id?: string
          likes_count?: number
          status?: Database["public"]["Enums"]["content_status"]
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_range: string | null
          avatar_url: string | null
          bio: string | null
          city: string | null
          content_preference: string | null
          created_at: string
          daily_goal_minutes: number | null
          display_name: string | null
          employment_status: string | null
          experience_level: string | null
          financial_goals: string[] | null
          gender: string | null
          id: string
          income_range: string | null
          notify_badges: boolean | null
          notify_content: boolean | null
          notify_leaderboard: boolean | null
          notify_streak: boolean | null
          notify_weekly: boolean | null
          preferred_difficulty: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          age_range?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          content_preference?: string | null
          created_at?: string
          daily_goal_minutes?: number | null
          display_name?: string | null
          employment_status?: string | null
          experience_level?: string | null
          financial_goals?: string[] | null
          gender?: string | null
          id: string
          income_range?: string | null
          notify_badges?: boolean | null
          notify_content?: boolean | null
          notify_leaderboard?: boolean | null
          notify_streak?: boolean | null
          notify_weekly?: boolean | null
          preferred_difficulty?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          age_range?: string | null
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          content_preference?: string | null
          created_at?: string
          daily_goal_minutes?: number | null
          display_name?: string | null
          employment_status?: string | null
          experience_level?: string | null
          financial_goals?: string[] | null
          gender?: string | null
          id?: string
          income_range?: string | null
          notify_badges?: boolean | null
          notify_content?: boolean | null
          notify_leaderboard?: boolean | null
          notify_streak?: boolean | null
          notify_weekly?: boolean | null
          preferred_difficulty?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      questions: {
        Row: {
          assessment_type: Database["public"]["Enums"]["assessment_type"]
          category_id: string | null
          correct_answer: string | null
          created_at: string
          difficulty: string
          id: string
          options: Json
          order_index: number
          question_text: string
          question_type: string
          score_weight: number
        }
        Insert: {
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          category_id?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: string
          id?: string
          options?: Json
          order_index?: number
          question_text: string
          question_type?: string
          score_weight?: number
        }
        Update: {
          assessment_type?: Database["public"]["Enums"]["assessment_type"]
          category_id?: string | null
          correct_answer?: string | null
          created_at?: string
          difficulty?: string
          id?: string
          options?: Json
          order_index?: number
          question_text?: string
          question_type?: string
          score_weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          decisions: Json
          id: string
          insights: string | null
          simulation_type: string
          started_at: string
          status: string
          total_score: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          decisions?: Json
          id?: string
          insights?: string | null
          simulation_type: string
          started_at?: string
          status?: string
          total_score?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          decisions?: Json
          id?: string
          insights?: string | null
          simulation_type?: string
          started_at?: string
          status?: string
          total_score?: number | null
          user_id?: string
        }
        Relationships: []
      }
      tool_results: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          outputs: Json
          tool_name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs?: Json
          outputs?: Json
          tool_name: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          outputs?: Json
          tool_name?: string
          user_id?: string
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          badges_earned: string[] | null
          behavior_type: string | null
          created_at: string
          financial_health_score: number | null
          id: string
          level: number
          updated_at: string
          user_id: string
          xp: number
        }
        Insert: {
          badges_earned?: string[] | null
          behavior_type?: string | null
          created_at?: string
          financial_health_score?: number | null
          id?: string
          level?: number
          updated_at?: string
          user_id: string
          xp?: number
        }
        Update: {
          badges_earned?: string[] | null
          behavior_type?: string | null
          created_at?: string
          financial_health_score?: number | null
          id?: string
          level?: number
          updated_at?: string
          user_id?: string
          xp?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_lessons: {
        Row: {
          added_by: string
          category: string
          created_at: string
          description: string
          difficulty: string
          duration: string
          id: string
          title: string
          youtube_id: string
          youtube_url: string
        }
        Insert: {
          added_by: string
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          duration?: string
          id?: string
          title: string
          youtube_id: string
          youtube_url: string
        }
        Update: {
          added_by?: string
          category?: string
          created_at?: string
          description?: string
          difficulty?: string
          duration?: string
          id?: string
          title?: string
          youtube_id?: string
          youtube_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_likes: { Args: { _content_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_likes: { Args: { _content_id: string }; Returns: undefined }
      increment_views: { Args: { _content_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "user" | "expert" | "admin"
      assessment_type: "baseline" | "post"
      content_status: "draft" | "pending_review" | "approved" | "rejected"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "expert", "admin"],
      assessment_type: ["baseline", "post"],
      content_status: ["draft", "pending_review", "approved", "rejected"],
    },
  },
} as const
