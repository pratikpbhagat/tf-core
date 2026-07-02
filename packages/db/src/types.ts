export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          target_id: string | null
          target_table: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          target_id?: string | null
          target_table?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          assessment_year: string
          created_at: string
          document_type: string
          file_path: string
          filing_id: string
          id: string
          reviewer_note: string | null
          status: Database["public"]["Enums"]["document_status"]
          uploaded_by: string
          version: number
        }
        Insert: {
          assessment_year: string
          created_at?: string
          document_type: string
          file_path: string
          filing_id: string
          id?: string
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          uploaded_by: string
          version?: number
        }
        Update: {
          assessment_year?: string
          created_at?: string
          document_type?: string
          file_path?: string
          filing_id?: string
          id?: string
          reviewer_note?: string | null
          status?: Database["public"]["Enums"]["document_status"]
          uploaded_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "documents_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      filing_deadlines: {
        Row: {
          assessment_year: string
          created_at: string
          due_date: string
          filer_category: Database["public"]["Enums"]["filer_category"]
          id: string
          is_extended: boolean
          is_illustrative: boolean
          source_notification_ref: string | null
          updated_at: string
        }
        Insert: {
          assessment_year: string
          created_at?: string
          due_date: string
          filer_category: Database["public"]["Enums"]["filer_category"]
          id?: string
          is_extended?: boolean
          is_illustrative?: boolean
          source_notification_ref?: string | null
          updated_at?: string
        }
        Update: {
          assessment_year?: string
          created_at?: string
          due_date?: string
          filer_category?: Database["public"]["Enums"]["filer_category"]
          id?: string
          is_extended?: boolean
          is_illustrative?: boolean
          source_notification_ref?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      filing_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          filing_id: string
          id: string
          is_client_visible: boolean
          note: string | null
          status: Database["public"]["Enums"]["filing_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          filing_id: string
          id?: string
          is_client_visible?: boolean
          note?: string | null
          status: Database["public"]["Enums"]["filing_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          filing_id?: string
          id?: string
          is_client_visible?: boolean
          note?: string | null
          status?: Database["public"]["Enums"]["filing_status"]
        }
        Relationships: [
          {
            foreignKeyName: "filing_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filing_status_history_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
        ]
      }
      filings: {
        Row: {
          assessment_year: string
          assigned_preparer_id: string | null
          client_id: string
          created_at: string
          e_verified: boolean
          id: string
          refund_or_demand: number | null
          regime_comparison_note: string | null
          regime_selected: Database["public"]["Enums"]["regime_type"]
          service_id: string
          status: Database["public"]["Enums"]["filing_status"]
          tax_computed: number | null
          tracking_code: string
          updated_at: string
        }
        Insert: {
          assessment_year: string
          assigned_preparer_id?: string | null
          client_id: string
          created_at?: string
          e_verified?: boolean
          id?: string
          refund_or_demand?: number | null
          regime_comparison_note?: string | null
          regime_selected?: Database["public"]["Enums"]["regime_type"]
          service_id: string
          status?: Database["public"]["Enums"]["filing_status"]
          tax_computed?: number | null
          tracking_code?: string
          updated_at?: string
        }
        Update: {
          assessment_year?: string
          assigned_preparer_id?: string | null
          client_id?: string
          created_at?: string
          e_verified?: boolean
          id?: string
          refund_or_demand?: number | null
          regime_comparison_note?: string | null
          regime_selected?: Database["public"]["Enums"]["regime_type"]
          service_id?: string
          status?: Database["public"]["Enums"]["filing_status"]
          tax_computed?: number | null
          tracking_code?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "filings_assigned_preparer_id_fkey"
            columns: ["assigned_preparer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "filings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          created_at: string
          filing_id: string
          id: string
          is_internal: boolean
          message: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          filing_id: string
          id?: string
          is_internal?: boolean
          message: string
          sender_id: string
        }
        Update: {
          created_at?: string
          filing_id?: string
          id?: string
          is_internal?: boolean
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications_log: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          dedupe_key: string | null
          filing_id: string | null
          id: string
          sent_at: string
          sent_to: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          dedupe_key?: string | null
          filing_id?: string | null
          id?: string
          sent_at?: string
          sent_to: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          dedupe_key?: string | null
          filing_id?: string | null
          id?: string
          sent_at?: string
          sent_to?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_log_filing_id_fkey"
            columns: ["filing_id"]
            isOneToOne: false
            referencedRelation: "filings"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          applicable_deadline_type: Database["public"]["Enums"]["filer_category"]
          category: string
          created_at: string
          description: string
          eligibility_criteria: string
          faq: Json
          id: string
          is_active: boolean
          is_illustrative: boolean
          name: string
          price_display: string
          required_documents: Json
          slug: string
          updated_at: string
        }
        Insert: {
          applicable_deadline_type?: Database["public"]["Enums"]["filer_category"]
          category: string
          created_at?: string
          description: string
          eligibility_criteria: string
          faq?: Json
          id?: string
          is_active?: boolean
          is_illustrative?: boolean
          name: string
          price_display: string
          required_documents?: Json
          slug: string
          updated_at?: string
        }
        Update: {
          applicable_deadline_type?: Database["public"]["Enums"]["filer_category"]
          category?: string
          created_at?: string
          description?: string
          eligibility_criteria?: string
          faq?: Json
          id?: string
          is_active?: boolean
          is_illustrative?: boolean
          name?: string
          price_display?: string
          required_documents?: Json
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_sensitive_identity: {
        Row: {
          aadhaar_encrypted: string | null
          encryption_key_version: number
          pan_encrypted: string | null
          pan_hash: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          aadhaar_encrypted?: string | null
          encryption_key_version?: number
          pan_encrypted?: string | null
          pan_hash?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          aadhaar_encrypted?: string | null
          encryption_key_version?: number
          pan_encrypted?: string | null
          pan_hash?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sensitive_identity_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          pan_masked: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          pan_masked?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          pan_masked?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_filing: { Args: { p_filing_id: string }; Returns: boolean }
      generate_tracking_code: { Args: never; Returns: string }
      get_filing_status_by_tracking_code: {
        Args: { p_tracking_code: string }
        Returns: {
          assessment_year: string
          created_at: string
          e_verified: boolean
          service_name: string
          status: Database["public"]["Enums"]["filing_status"]
          timeline: Json
          tracking_code: string
        }[]
      }
      get_full_aadhaar: { Args: { p_user_id: string }; Returns: string }
      get_full_pan: { Args: { p_user_id: string }; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_preparer: { Args: never; Returns: boolean }
      set_filing_regime: {
        Args: {
          p_filing_id: string
          p_regime: Database["public"]["Enums"]["regime_type"]
        }
        Returns: undefined
      }
      set_user_aadhaar: {
        Args: { p_aadhaar: string; p_user_id: string }
        Returns: undefined
      }
      set_user_pan: {
        Args: { p_pan: string; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      document_status: "pending" | "approved" | "rejected"
      filer_category: "individual" | "audit" | "transfer_pricing"
      filing_status:
        | "submitted"
        | "documents_under_review"
        | "additional_info_needed"
        | "tax_computation_in_progress"
        | "computation_shared_for_approval"
        | "filed_on_portal"
        | "itr_v_generated"
        | "e_verified"
        | "processed"
        | "demand_raised"
      notification_channel: "email" | "sms"
      notification_type:
        | "status_change"
        | "doc_requested"
        | "computation_ready"
        | "deadline_reminder"
        | "e_verify_reminder"
        | "refund_update"
      regime_type: "old" | "new" | "undecided"
      user_role: "client" | "preparer" | "admin"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      document_status: ["pending", "approved", "rejected"],
      filer_category: ["individual", "audit", "transfer_pricing"],
      filing_status: [
        "submitted",
        "documents_under_review",
        "additional_info_needed",
        "tax_computation_in_progress",
        "computation_shared_for_approval",
        "filed_on_portal",
        "itr_v_generated",
        "e_verified",
        "processed",
        "demand_raised",
      ],
      notification_channel: ["email", "sms"],
      notification_type: [
        "status_change",
        "doc_requested",
        "computation_ready",
        "deadline_reminder",
        "e_verify_reminder",
        "refund_update",
      ],
      regime_type: ["old", "new", "undecided"],
      user_role: ["client", "preparer", "admin"],
    },
  },
} as const

