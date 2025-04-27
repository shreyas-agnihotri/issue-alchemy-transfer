export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clone_history: {
        Row: {
          created_at: string
          failed_issues: number
          id: string
          source_project_id: string
          successful_issues: number
          target_project_id: string
          total_issues: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          failed_issues: number
          id?: string
          source_project_id: string
          successful_issues: number
          target_project_id: string
          total_issues: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          failed_issues?: number
          id?: string
          source_project_id?: string
          successful_issues?: number
          target_project_id?: string
          total_issues?: number
          user_id?: string | null
        }
        Relationships: []
      }
      clone_issue_results: {
        Row: {
          clone_history_id: string
          created_at: string
          error_message: string | null
          id: string
          source_issue_id: string
          source_issue_key: string
          status: string
          target_issue_id: string | null
          target_issue_key: string | null
        }
        Insert: {
          clone_history_id: string
          created_at?: string
          error_message?: string | null
          id?: string
          source_issue_id: string
          source_issue_key: string
          status: string
          target_issue_id?: string | null
          target_issue_key?: string | null
        }
        Update: {
          clone_history_id?: string
          created_at?: string
          error_message?: string | null
          id?: string
          source_issue_id?: string
          source_issue_key?: string
          status?: string
          target_issue_id?: string | null
          target_issue_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clone_issue_results_clone_history_id_fkey"
            columns: ["clone_history_id"]
            isOneToOne: false
            referencedRelation: "clone_history"
            referencedColumns: ["id"]
          },
        ]
      }
      issue_links: {
        Row: {
          created_at: string
          id: string
          metadata: Json
          source_issue_id: string
          target_issue_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json
          source_issue_id: string
          target_issue_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json
          source_issue_id?: string
          target_issue_id?: string
        }
        Relationships: []
      }
      jira_configs: {
        Row: {
          api_key: string
          created_at: string
          id: string
          jira_url: string
          jql_filter: string | null
          updated_at: string
          user_email: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          jira_url: string
          jql_filter?: string | null
          updated_at?: string
          user_email: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          jira_url?: string
          jql_filter?: string | null
          updated_at?: string
          user_email?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
