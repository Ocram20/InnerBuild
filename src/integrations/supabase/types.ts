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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          created_at: string
          detailed_analysis: Json | null
          id: string
          insight_type: string
          is_read: boolean
          period_end: string | null
          period_start: string | null
          recommendations: string[] | null
          summary: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detailed_analysis?: Json | null
          id?: string
          insight_type: string
          is_read?: boolean
          period_end?: string | null
          period_start?: string | null
          recommendations?: string[] | null
          summary?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          detailed_analysis?: Json | null
          id?: string
          insight_type?: string
          is_read?: boolean
          period_end?: string | null
          period_start?: string | null
          recommendations?: string[] | null
          summary?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          content: string
          content_it: string | null
          created_at: string
          id: string
          is_published: boolean
          published_at: string
          summary: string
          summary_it: string | null
          title: string
          title_it: string | null
          updated_at: string
        }
        Insert: {
          content?: string
          content_it?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string
          summary?: string
          summary_it?: string | null
          title: string
          title_it?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_it?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string
          summary?: string
          summary_it?: string | null
          title?: string
          title_it?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      challenge_daily_entries: {
        Row: {
          behavioral_mission: string | null
          behavioral_mission_completed: boolean
          challenge_id: string
          checkin_response: string | null
          coach_message: string | null
          created_at: string
          day_number: number
          id: string
          is_failure: boolean
          mental_mission: string | null
          mental_mission_completed: boolean
          phase_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          behavioral_mission?: string | null
          behavioral_mission_completed?: boolean
          challenge_id: string
          checkin_response?: string | null
          coach_message?: string | null
          created_at?: string
          day_number: number
          id?: string
          is_failure?: boolean
          mental_mission?: string | null
          mental_mission_completed?: boolean
          phase_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          behavioral_mission?: string | null
          behavioral_mission_completed?: boolean
          challenge_id?: string
          checkin_response?: string | null
          coach_message?: string | null
          created_at?: string
          day_number?: number
          id?: string
          is_failure?: boolean
          mental_mission?: string | null
          mental_mission_completed?: boolean
          phase_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_daily_entries_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "detox_challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          energy_level: number | null
          id: string
          mood: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          energy_level?: number | null
          id?: string
          mood?: string | null
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_reflections: {
        Row: {
          created_at: string
          day_summary: string | null
          grateful_for: string[] | null
          id: string
          lessons_learned: string | null
          reflection_date: string
          updated_at: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string
          day_summary?: string | null
          grateful_for?: string[] | null
          id?: string
          lessons_learned?: string | null
          reflection_date?: string
          updated_at?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string
          day_summary?: string | null
          grateful_for?: string[] | null
          id?: string
          lessons_learned?: string | null
          reflection_date?: string
          updated_at?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          id: string
          is_completed: boolean
          target_date: string
          title: string
          updated_at: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          target_date: string
          title: string
          updated_at?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_completed?: boolean
          target_date?: string
          title?: string
          updated_at?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      detox_challenges: {
        Row: {
          category: string
          created_at: string
          current_streak: number
          daily_steps: string[] | null
          description: string | null
          duration_days: number
          id: string
          last_check_in: string | null
          longest_streak: number
          science_note: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          current_streak?: number
          daily_steps?: string[] | null
          description?: string | null
          duration_days: number
          id?: string
          last_check_in?: string | null
          longest_streak?: number
          science_note?: string | null
          start_date?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          current_streak?: number
          daily_steps?: string[] | null
          description?: string | null
          duration_days?: number
          id?: string
          last_check_in?: string | null
          longest_streak?: number
          science_note?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      failure_debriefs: {
        Row: {
          action_plan: string | null
          ai_suggestions: Json | null
          context: string | null
          created_at: string
          debrief_date: string
          id: string
          ignored_signal: string | null
          is_completed: boolean
          journey_id: string | null
          lesson_learned: string | null
          location: string | null
          mood: string | null
          signal_details: string | null
          time_of_day: string | null
          trigger: string | null
          trigger_description: string | null
          updated_at: string
          user_id: string
          was_alone: boolean
          what_happened: string | null
        }
        Insert: {
          action_plan?: string | null
          ai_suggestions?: Json | null
          context?: string | null
          created_at?: string
          debrief_date?: string
          id?: string
          ignored_signal?: string | null
          is_completed?: boolean
          journey_id?: string | null
          lesson_learned?: string | null
          location?: string | null
          mood?: string | null
          signal_details?: string | null
          time_of_day?: string | null
          trigger?: string | null
          trigger_description?: string | null
          updated_at?: string
          user_id: string
          was_alone?: boolean
          what_happened?: string | null
        }
        Update: {
          action_plan?: string | null
          ai_suggestions?: Json | null
          context?: string | null
          created_at?: string
          debrief_date?: string
          id?: string
          ignored_signal?: string | null
          is_completed?: boolean
          journey_id?: string | null
          lesson_learned?: string | null
          location?: string | null
          mood?: string | null
          signal_details?: string | null
          time_of_day?: string | null
          trigger?: string | null
          trigger_description?: string | null
          updated_at?: string
          user_id?: string
          was_alone?: boolean
          what_happened?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "failure_debriefs_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "recovery_journey"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          completed_at: string
          created_at: string
          habit_id: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          habit_id: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          habit_id?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          category: string
          created_at: string
          description: string | null
          frequency: string
          id: string
          is_active: boolean
          reminder_time: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          reminder_time?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          reminder_time?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          entry_date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          entry_date?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          entry_date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      not_to_do_items: {
        Row: {
          created_at: string
          id: string
          status: string
          target_date: string
          title: string
          updated_at: string
          user_id: string
          xp_earned: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          target_date: string
          title: string
          updated_at?: string
          user_id: string
          xp_earned?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          target_date?: string
          title?: string
          updated_at?: string
          user_id?: string
          xp_earned?: number | null
        }
        Relationships: []
      }
      password_history: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
          preferred_language: string | null
          stripe_customer_id: string | null
          subscription_status: string | null
          total_challenges_created: number
          updated_at: string
          user_id: string
          username: string | null
          username_changed_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          preferred_language?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          total_challenges_created?: number
          updated_at?: string
          user_id: string
          username?: string | null
          username_changed_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          full_name?: string | null
          id?: string
          last_name?: string | null
          preferred_language?: string | null
          stripe_customer_id?: string | null
          subscription_status?: string | null
          total_challenges_created?: number
          updated_at?: string
          user_id?: string
          username?: string | null
          username_changed_at?: string | null
        }
        Relationships: []
      }
      recovery_checkins: {
        Row: {
          checkin_date: string
          created_at: string
          id: string
          journey_id: string
          notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          id?: string
          journey_id: string
          notes?: string | null
          status: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          id?: string
          journey_id?: string
          notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recovery_checkins_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "recovery_journey"
            referencedColumns: ["id"]
          },
        ]
      }
      recovery_journey: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          is_active: boolean
          jokers_remaining: number
          last_check_in: string | null
          longest_streak: number
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          is_active?: boolean
          jokers_remaining?: number
          last_check_in?: string | null
          longest_streak?: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          is_active?: boolean
          jokers_remaining?: number
          last_check_in?: string | null
          longest_streak?: number
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          content: string
          created_at: string
          id: string
          mood: string | null
          prompt: string
          reflection_date: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mood?: string | null
          prompt: string
          reflection_date?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mood?: string | null
          prompt?: string
          reflection_date?: string
          user_id?: string
        }
        Relationships: []
      }
      trigger_insights: {
        Row: {
          created_at: string
          description: string
          generated_at: string
          id: string
          insight_type: string
          is_read: boolean
          pattern_data: Json | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          generated_at?: string
          id?: string
          insight_type: string
          is_read?: boolean
          pattern_data?: Json | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          generated_at?: string
          id?: string
          insight_type?: string
          is_read?: boolean
          pattern_data?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      trigger_logs: {
        Row: {
          created_at: string
          emotion: string | null
          id: string
          impulse_intensity: number | null
          location: string | null
          location_context: string | null
          logged_at: string
          notes: string | null
          situation: string | null
          time_context: string | null
          user_id: string
          was_alone: boolean
        }
        Insert: {
          created_at?: string
          emotion?: string | null
          id?: string
          impulse_intensity?: number | null
          location?: string | null
          location_context?: string | null
          logged_at?: string
          notes?: string | null
          situation?: string | null
          time_context?: string | null
          user_id: string
          was_alone?: boolean
        }
        Update: {
          created_at?: string
          emotion?: string | null
          id?: string
          impulse_intensity?: number | null
          location?: string | null
          location_context?: string | null
          logged_at?: string
          notes?: string | null
          situation?: string | null
          time_context?: string | null
          user_id?: string
          was_alone?: boolean
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
