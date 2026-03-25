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
      ai_insights: {
        Row: {
          created_at: string
          detailed_analysis: Json | null
          id: string
          insight_type: string
          is_read: boolean | null
          period_end: string
          period_start: string
          recommendations: string[] | null
          summary: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          detailed_analysis?: Json | null
          id?: string
          insight_type: string
          is_read?: boolean | null
          period_end: string
          period_start: string
          recommendations?: string[] | null
          summary: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          detailed_analysis?: Json | null
          id?: string
          insight_type?: string
          is_read?: boolean | null
          period_end?: string
          period_start?: string
          recommendations?: string[] | null
          summary?: string
          title?: string
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
        }
        Insert: {
          content: string
          content_it?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at: string
          summary: string
          summary_it?: string | null
          title: string
          title_it?: string | null
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
        }
        Relationships: []
      }
      challenge_daily_entries: {
        Row: {
          behavioral_mission: string | null
          behavioral_mission_completed: boolean | null
          challenge_id: string
          checkin_response: string | null
          coach_message: string | null
          created_at: string
          day_number: number
          id: string
          is_failure: boolean | null
          mental_mission: string | null
          mental_mission_completed: boolean | null
          phase_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          behavioral_mission?: string | null
          behavioral_mission_completed?: boolean | null
          challenge_id: string
          checkin_response?: string | null
          coach_message?: string | null
          created_at?: string
          day_number: number
          id?: string
          is_failure?: boolean | null
          mental_mission?: string | null
          mental_mission_completed?: boolean | null
          phase_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          behavioral_mission?: string | null
          behavioral_mission_completed?: boolean | null
          challenge_id?: string
          checkin_response?: string | null
          coach_message?: string | null
          created_at?: string
          day_number?: number
          id?: string
          is_failure?: boolean | null
          mental_mission?: string | null
          mental_mission_completed?: boolean | null
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
          energy_level: number
          id: string
          mood: string
          notes: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          checkin_date?: string
          created_at?: string
          energy_level: number
          id?: string
          mood: string
          notes?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          checkin_date?: string
          created_at?: string
          energy_level?: number
          id?: string
          mood?: string
          notes?: string | null
          updated_at?: string
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
          jokers_remaining: number
          last_check_in: string | null
          longest_streak: number
          progress_offset: number
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
          jokers_remaining?: number
          last_check_in?: string | null
          longest_streak?: number
          progress_offset?: number
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
          jokers_remaining?: number
          last_check_in?: string | null
          longest_streak?: number
          progress_offset?: number
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
          ai_suggestions: string[] | null
          context: string | null
          created_at: string
          debrief_date: string
          id: string
          ignored_signal: string | null
          is_completed: boolean | null
          location: string | null
          mood: string | null
          signal_details: string | null
          time_of_day: string | null
          trigger: string | null
          updated_at: string
          user_id: string
          was_alone: boolean | null
        }
        Insert: {
          action_plan?: string | null
          ai_suggestions?: string[] | null
          context?: string | null
          created_at?: string
          debrief_date?: string
          id?: string
          ignored_signal?: string | null
          is_completed?: boolean | null
          location?: string | null
          mood?: string | null
          signal_details?: string | null
          time_of_day?: string | null
          trigger?: string | null
          updated_at?: string
          user_id: string
          was_alone?: boolean | null
        }
        Update: {
          action_plan?: string | null
          ai_suggestions?: string[] | null
          context?: string | null
          created_at?: string
          debrief_date?: string
          id?: string
          ignored_signal?: string | null
          is_completed?: boolean | null
          location?: string | null
          mood?: string | null
          signal_details?: string | null
          time_of_day?: string | null
          trigger?: string | null
          updated_at?: string
          user_id?: string
          was_alone?: boolean | null
        }
        Relationships: []
      }
      habit_adaptations: {
        Row: {
          adaptation_type: string
          created_at: string
          habit_id: string
          id: string
          original_value: string | null
          pattern_data: Json | null
          reason: string
          status: string
          suggested_value: string
          updated_at: string
          user_id: string
        }
        Insert: {
          adaptation_type: string
          created_at?: string
          habit_id: string
          id?: string
          original_value?: string | null
          pattern_data?: Json | null
          reason: string
          status?: string
          suggested_value: string
          updated_at?: string
          user_id: string
        }
        Update: {
          adaptation_type?: string
          created_at?: string
          habit_id?: string
          id?: string
          original_value?: string | null
          pattern_data?: Json | null
          reason?: string
          status?: string
          suggested_value?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_adaptations_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_analytics: {
        Row: {
          avg_completion_hour: number | null
          best_day_of_week: number | null
          completion_rate: number | null
          created_at: string
          current_streak: number | null
          evening_person: boolean | null
          habit_id: string
          id: string
          longest_streak: number | null
          morning_person: boolean | null
          total_completions: number | null
          total_misses: number | null
          updated_at: string
          user_id: string
          week_start: string
          weekend_struggler: boolean | null
          worst_day_of_week: number | null
        }
        Insert: {
          avg_completion_hour?: number | null
          best_day_of_week?: number | null
          completion_rate?: number | null
          created_at?: string
          current_streak?: number | null
          evening_person?: boolean | null
          habit_id: string
          id?: string
          longest_streak?: number | null
          morning_person?: boolean | null
          total_completions?: number | null
          total_misses?: number | null
          updated_at?: string
          user_id: string
          week_start: string
          weekend_struggler?: boolean | null
          worst_day_of_week?: number | null
        }
        Update: {
          avg_completion_hour?: number | null
          best_day_of_week?: number | null
          completion_rate?: number | null
          created_at?: string
          current_streak?: number | null
          evening_person?: boolean | null
          habit_id?: string
          id?: string
          longest_streak?: number | null
          morning_person?: boolean | null
          total_completions?: number | null
          total_misses?: number | null
          updated_at?: string
          user_id?: string
          week_start?: string
          weekend_struggler?: boolean | null
          worst_day_of_week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "habit_analytics_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
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
      health_suggestions: {
        Row: {
          based_on: Json | null
          category: string
          created_at: string
          date: string
          description: string
          id: string
          modified_note: string | null
          status: string
          title: string
          updated_at: string
          urgency: string
          user_id: string
        }
        Insert: {
          based_on?: Json | null
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          modified_note?: string | null
          status?: string
          title: string
          updated_at?: string
          urgency?: string
          user_id: string
        }
        Update: {
          based_on?: Json | null
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          modified_note?: string | null
          status?: string
          title?: string
          updated_at?: string
          urgency?: string
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          full_name: string | null
          id: string
          last_name: string | null
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
          is_read: boolean | null
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
          is_read?: boolean | null
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
          is_read?: boolean | null
          pattern_data?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      trigger_logs: {
        Row: {
          created_at: string
          emotion: string
          id: string
          impulse_intensity: number
          location_context: string | null
          logged_at: string
          notes: string | null
          situation: string
          time_context: string
          user_id: string
          was_alone: boolean | null
        }
        Insert: {
          created_at?: string
          emotion: string
          id?: string
          impulse_intensity: number
          location_context?: string | null
          logged_at?: string
          notes?: string | null
          situation: string
          time_context: string
          user_id: string
          was_alone?: boolean | null
        }
        Update: {
          created_at?: string
          emotion?: string
          id?: string
          impulse_intensity?: number
          location_context?: string | null
          logged_at?: string
          notes?: string | null
          situation?: string
          time_context?: string
          user_id?: string
          was_alone?: boolean | null
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
      wearable_health_data: {
        Row: {
          active_minutes: number | null
          calories_burned: number | null
          created_at: string
          date: string
          heart_rate_avg: number | null
          hrv_avg: number | null
          id: string
          recovery_score: number | null
          sleep_hours: number | null
          sleep_quality: number | null
          source: string | null
          steps: number | null
          stress_level: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          active_minutes?: number | null
          calories_burned?: number | null
          created_at?: string
          date?: string
          heart_rate_avg?: number | null
          hrv_avg?: number | null
          id?: string
          recovery_score?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          source?: string | null
          steps?: number | null
          stress_level?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          active_minutes?: number | null
          calories_burned?: number | null
          created_at?: string
          date?: string
          heart_rate_avg?: number | null
          hrv_avg?: number | null
          id?: string
          recovery_score?: number | null
          sleep_hours?: number | null
          sleep_quality?: number | null
          source?: string | null
          steps?: number | null
          stress_level?: number | null
          updated_at?: string
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
