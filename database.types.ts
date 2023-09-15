export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
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
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
      activities: {
        Row: {
          activity_date: string | null
          activity_type: string | null
          activity_year_month: number | null
          business_office: string | null
          claim_flag: boolean | null
          client_company_id: string | null
          client_contact_id: string | null
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          department: string | null
          document_url: string | null
          follow_up_flag: boolean | null
          id: string
          meeting_id: string | null
          member_name: string | null
          priority: string | null
          product_introduction1: string | null
          product_introduction2: string | null
          product_introduction3: string | null
          product_introduction4: string | null
          product_introduction5: string | null
          property_id: string | null
          quotation_id: string | null
          scheduled_follow_up_date: string | null
          summary: string | null
          updated_at: string | null
        }
        Insert: {
          activity_date?: string | null
          activity_type?: string | null
          activity_year_month?: number | null
          business_office?: string | null
          claim_flag?: boolean | null
          client_company_id?: string | null
          client_contact_id?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          department?: string | null
          document_url?: string | null
          follow_up_flag?: boolean | null
          id?: string
          meeting_id?: string | null
          member_name?: string | null
          priority?: string | null
          product_introduction1?: string | null
          product_introduction2?: string | null
          product_introduction3?: string | null
          product_introduction4?: string | null
          product_introduction5?: string | null
          property_id?: string | null
          quotation_id?: string | null
          scheduled_follow_up_date?: string | null
          summary?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_date?: string | null
          activity_type?: string | null
          activity_year_month?: number | null
          business_office?: string | null
          claim_flag?: boolean | null
          client_company_id?: string | null
          client_contact_id?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          department?: string | null
          document_url?: string | null
          follow_up_flag?: boolean | null
          id?: string
          meeting_id?: string | null
          member_name?: string | null
          priority?: string | null
          product_introduction1?: string | null
          product_introduction2?: string | null
          product_introduction3?: string | null
          product_introduction4?: string | null
          product_introduction5?: string | null
          property_id?: string | null
          quotation_id?: string | null
          scheduled_follow_up_date?: string | null
          summary?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_client_company_id_fkey"
            columns: ["client_company_id"]
            referencedRelation: "client_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_client_contact_id_fkey"
            columns: ["client_contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_created_by_company_id_fkey"
            columns: ["created_by_company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_meeting_id_fkey"
            columns: ["meeting_id"]
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_property_id_fkey"
            columns: ["property_id"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_quotation_id_fkey"
            columns: ["quotation_id"]
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          }
        ]
      }
      alignments: {
        Row: {
          client_company_id: string | null
          client_user_id: string | null
          confirm_sales_flag: boolean | null
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          id: string
          immediate_action_flag: boolean | null
          like: boolean | null
          number: string | null
          response_comment: string | null
          sales_amount: string | null
          sales_link_property: string | null
          sales_number: string | null
          summary: string | null
          to_department_of_user: string | null
          to_unit_of_user: string | null
          to_user_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_company_id?: string | null
          client_user_id?: string | null
          confirm_sales_flag?: boolean | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          id?: string
          immediate_action_flag?: boolean | null
          like?: boolean | null
          number?: string | null
          response_comment?: string | null
          sales_amount?: string | null
          sales_link_property?: string | null
          sales_number?: string | null
          summary?: string | null
          to_department_of_user?: string | null
          to_unit_of_user?: string | null
          to_user_id?: string | null
          updated_at?: string | null
        }
        Update: {
          client_company_id?: string | null
          client_user_id?: string | null
          confirm_sales_flag?: boolean | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          id?: string
          immediate_action_flag?: boolean | null
          like?: boolean | null
          number?: string | null
          response_comment?: string | null
          sales_amount?: string | null
          sales_link_property?: string | null
          sales_number?: string | null
          summary?: string | null
          to_department_of_user?: string | null
          to_unit_of_user?: string | null
          to_user_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alignments_client_company_id_fkey"
            columns: ["client_company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alignments_client_user_id_fkey"
            columns: ["client_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alignments_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alignments_sales_link_property_fkey"
            columns: ["sales_link_property"]
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alignments_to_user_id_fkey"
            columns: ["to_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      c: {
        Row: {
          address: string | null
          auditor: string | null
          ban_reason: string | null
          board_member: string | null
          budget_request_month1: string | null
          budget_request_month2: string | null
          business_content: string | null
          business_sites: string | null
          call_careful_flag: string | null
          call_careful_reason: string | null
          capital: string | null
          chairperson: string | null
          claim: string | null
          clients: string | null
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          department_contacts: string | null
          department_name: string | null
          director: string | null
          email: string | null
          email_ban_flag: string | null
          established_in: string | null
          facility: string | null
          fax_dm_ban_flag: string | null
          fiscal_end_month: string | null
          group_company: string | null
          id: string | null
          industry_large: string | null
          industry_small: string | null
          industry_type: string | null
          main_fax: string | null
          main_phone_number: string | null
          manager: string | null
          managing_director: string | null
          member: string | null
          name: string | null
          number_of_employees_class: string | null
          overseas_bases: string | null
          product_category_large: string | null
          product_category_medium: string | null
          product_category_small: string | null
          representative_name: string | null
          sending_ban_flag: string | null
          senior_managing_director: string | null
          senior_vice_president: string | null
          supplier: string | null
          updated_at: string | null
          website_url: string | null
          zipcode: string | null
        }
        Insert: {
          address?: string | null
          auditor?: string | null
          ban_reason?: string | null
          board_member?: string | null
          budget_request_month1?: string | null
          budget_request_month2?: string | null
          business_content?: string | null
          business_sites?: string | null
          call_careful_flag?: string | null
          call_careful_reason?: string | null
          capital?: string | null
          chairperson?: string | null
          claim?: string | null
          clients?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          department_contacts?: string | null
          department_name?: string | null
          director?: string | null
          email?: string | null
          email_ban_flag?: string | null
          established_in?: string | null
          facility?: string | null
          fax_dm_ban_flag?: string | null
          fiscal_end_month?: string | null
          group_company?: string | null
          id?: string | null
          industry_large?: string | null
          industry_small?: string | null
          industry_type?: string | null
          main_fax?: string | null
          main_phone_number?: string | null
          manager?: string | null
          managing_director?: string | null
          member?: string | null
          name?: string | null
          number_of_employees_class?: string | null
          overseas_bases?: string | null
          product_category_large?: string | null
          product_category_medium?: string | null
          product_category_small?: string | null
          representative_name?: string | null
          sending_ban_flag?: string | null
          senior_managing_director?: string | null
          senior_vice_president?: string | null
          supplier?: string | null
          updated_at?: string | null
          website_url?: string | null
          zipcode?: string | null
        }
        Update: {
          address?: string | null
          auditor?: string | null
          ban_reason?: string | null
          board_member?: string | null
          budget_request_month1?: string | null
          budget_request_month2?: string | null
          business_content?: string | null
          business_sites?: string | null
          call_careful_flag?: string | null
          call_careful_reason?: string | null
          capital?: string | null
          chairperson?: string | null
          claim?: string | null
          clients?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          department_contacts?: string | null
          department_name?: string | null
          director?: string | null
          email?: string | null
          email_ban_flag?: string | null
          established_in?: string | null
          facility?: string | null
          fax_dm_ban_flag?: string | null
          fiscal_end_month?: string | null
          group_company?: string | null
          id?: string | null
          industry_large?: string | null
          industry_small?: string | null
          industry_type?: string | null
          main_fax?: string | null
          main_phone_number?: string | null
          manager?: string | null
          managing_director?: string | null
          member?: string | null
          name?: string | null
          number_of_employees_class?: string | null
          overseas_bases?: string | null
          product_category_large?: string | null
          product_category_medium?: string | null
          product_category_small?: string | null
          representative_name?: string | null
          sending_ban_flag?: string | null
          senior_managing_director?: string | null
          senior_vice_president?: string | null
          supplier?: string | null
          updated_at?: string | null
          website_url?: string | null
          zipcode?: string | null
        }
        Relationships: []
      }
      client_companies: {
        Row: {
          address: string
          auditor: string | null
          ban_reason: string | null
          board_member: string | null
          budget_request_month1: string | null
          budget_request_month2: string | null
          business_content: string | null
          business_sites: string | null
          call_careful_flag: boolean | null
          call_careful_reason: string | null
          capital: string | null
          chairperson: string | null
          claim: string | null
          clients: string | null
          corporate_number: string | null
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          department_contacts: string | null
          department_name: string | null
          director: string | null
          email: string | null
          email_ban_flag: boolean | null
          established_in: string | null
          facility: string | null
          fax_dm_ban_flag: boolean | null
          fiscal_end_month: string | null
          group_company: string | null
          id: string
          industry_large: string | null
          industry_small: string | null
          industry_type: string | null
          main_fax: string | null
          main_phone_number: string | null
          manager: string | null
          managing_director: string | null
          member: string | null
          name: string
          number_of_employees: string | null
          number_of_employees_class: string | null
          overseas_bases: string | null
          product_category_large: string | null
          product_category_medium: string | null
          product_category_small: string | null
          representative_name: string | null
          sending_ban_flag: boolean | null
          senior_managing_director: string | null
          senior_vice_president: string | null
          supplier: string | null
          updated_at: string | null
          website_url: string | null
          zipcode: string | null
        }
        Insert: {
          address: string
          auditor?: string | null
          ban_reason?: string | null
          board_member?: string | null
          budget_request_month1?: string | null
          budget_request_month2?: string | null
          business_content?: string | null
          business_sites?: string | null
          call_careful_flag?: boolean | null
          call_careful_reason?: string | null
          capital?: string | null
          chairperson?: string | null
          claim?: string | null
          clients?: string | null
          corporate_number?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          department_contacts?: string | null
          department_name?: string | null
          director?: string | null
          email?: string | null
          email_ban_flag?: boolean | null
          established_in?: string | null
          facility?: string | null
          fax_dm_ban_flag?: boolean | null
          fiscal_end_month?: string | null
          group_company?: string | null
          id?: string
          industry_large?: string | null
          industry_small?: string | null
          industry_type?: string | null
          main_fax?: string | null
          main_phone_number?: string | null
          manager?: string | null
          managing_director?: string | null
          member?: string | null
          name: string
          number_of_employees?: string | null
          number_of_employees_class?: string | null
          overseas_bases?: string | null
          product_category_large?: string | null
          product_category_medium?: string | null
          product_category_small?: string | null
          representative_name?: string | null
          sending_ban_flag?: boolean | null
          senior_managing_director?: string | null
          senior_vice_president?: string | null
          supplier?: string | null
          updated_at?: string | null
          website_url?: string | null
          zipcode?: string | null
        }
        Update: {
          address?: string
          auditor?: string | null
          ban_reason?: string | null
          board_member?: string | null
          budget_request_month1?: string | null
          budget_request_month2?: string | null
          business_content?: string | null
          business_sites?: string | null
          call_careful_flag?: boolean | null
          call_careful_reason?: string | null
          capital?: string | null
          chairperson?: string | null
          claim?: string | null
          clients?: string | null
          corporate_number?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          department_contacts?: string | null
          department_name?: string | null
          director?: string | null
          email?: string | null
          email_ban_flag?: boolean | null
          established_in?: string | null
          facility?: string | null
          fax_dm_ban_flag?: boolean | null
          fiscal_end_month?: string | null
          group_company?: string | null
          id?: string
          industry_large?: string | null
          industry_small?: string | null
          industry_type?: string | null
          main_fax?: string | null
          main_phone_number?: string | null
          manager?: string | null
          managing_director?: string | null
          member?: string | null
          name?: string
          number_of_employees?: string | null
          number_of_employees_class?: string | null
          overseas_bases?: string | null
          product_category_large?: string | null
          product_category_medium?: string | null
          product_category_small?: string | null
          representative_name?: string | null
          sending_ban_flag?: boolean | null
          senior_managing_director?: string | null
          senior_vice_president?: string | null
          supplier?: string | null
          updated_at?: string | null
          website_url?: string | null
          zipcode?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_companies_created_by_company_id_fkey"
            columns: ["created_by_company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_companies_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      clientcompany_contact: {
        Row: {
          client_company_id: string | null
          contact_id: string | null
          created_at: string | null
          id: number
        }
        Insert: {
          client_company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: number
        }
        Update: {
          client_company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "clientcompany_contact_client_company_id_fkey"
            columns: ["client_company_id"]
            referencedRelation: "client_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientcompany_contact_contact_id_fkey"
            columns: ["contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          }
        ]
      }
      companies: {
        Row: {
          created_at: string | null
          customer_address: string | null
          customer_auditor: string | null
          customer_budget_request_month1: string | null
          customer_budget_request_month2: string | null
          customer_business_content: string | null
          customer_business_sites: string | null
          customer_capital: string | null
          customer_chairperson: string | null
          customer_clients: string | null
          customer_corporate_number: string | null
          customer_department_contacts: string | null
          customer_director: string | null
          customer_email: string | null
          customer_established_in: string | null
          customer_facility: string | null
          customer_fiscal_end_month: string | null
          customer_group_company: string | null
          customer_industry_large: string | null
          customer_industry_small: string | null
          customer_industry_type: string | null
          customer_is_competitor_flag: boolean | null
          customer_main_fax: string | null
          customer_main_phone_number: string | null
          customer_manager: string | null
          customer_managing_director: string | null
          customer_member: string | null
          customer_name: string | null
          customer_number_of_employees: string | null
          customer_number_of_employees_class: string | null
          customer_overseas_bases: string | null
          customer_product_category_large: string | null
          customer_product_category_medium: string | null
          customer_product_category_small: string | null
          customer_representative_name: string | null
          customer_representative_position_name: string | null
          customer_seal_url: string | null
          customer_senior_managing_director: string | null
          customer_senior_vice_president: string | null
          customer_suppliers: string | null
          customer_website_url: string | null
          customer_zipcode: string | null
          id: string
          logo_url: string | null
          subscriber_id: string | null
          subscription_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_address?: string | null
          customer_auditor?: string | null
          customer_budget_request_month1?: string | null
          customer_budget_request_month2?: string | null
          customer_business_content?: string | null
          customer_business_sites?: string | null
          customer_capital?: string | null
          customer_chairperson?: string | null
          customer_clients?: string | null
          customer_corporate_number?: string | null
          customer_department_contacts?: string | null
          customer_director?: string | null
          customer_email?: string | null
          customer_established_in?: string | null
          customer_facility?: string | null
          customer_fiscal_end_month?: string | null
          customer_group_company?: string | null
          customer_industry_large?: string | null
          customer_industry_small?: string | null
          customer_industry_type?: string | null
          customer_is_competitor_flag?: boolean | null
          customer_main_fax?: string | null
          customer_main_phone_number?: string | null
          customer_manager?: string | null
          customer_managing_director?: string | null
          customer_member?: string | null
          customer_name?: string | null
          customer_number_of_employees?: string | null
          customer_number_of_employees_class?: string | null
          customer_overseas_bases?: string | null
          customer_product_category_large?: string | null
          customer_product_category_medium?: string | null
          customer_product_category_small?: string | null
          customer_representative_name?: string | null
          customer_representative_position_name?: string | null
          customer_seal_url?: string | null
          customer_senior_managing_director?: string | null
          customer_senior_vice_president?: string | null
          customer_suppliers?: string | null
          customer_website_url?: string | null
          customer_zipcode?: string | null
          id?: string
          logo_url?: string | null
          subscriber_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_address?: string | null
          customer_auditor?: string | null
          customer_budget_request_month1?: string | null
          customer_budget_request_month2?: string | null
          customer_business_content?: string | null
          customer_business_sites?: string | null
          customer_capital?: string | null
          customer_chairperson?: string | null
          customer_clients?: string | null
          customer_corporate_number?: string | null
          customer_department_contacts?: string | null
          customer_director?: string | null
          customer_email?: string | null
          customer_established_in?: string | null
          customer_facility?: string | null
          customer_fiscal_end_month?: string | null
          customer_group_company?: string | null
          customer_industry_large?: string | null
          customer_industry_small?: string | null
          customer_industry_type?: string | null
          customer_is_competitor_flag?: boolean | null
          customer_main_fax?: string | null
          customer_main_phone_number?: string | null
          customer_manager?: string | null
          customer_managing_director?: string | null
          customer_member?: string | null
          customer_name?: string | null
          customer_number_of_employees?: string | null
          customer_number_of_employees_class?: string | null
          customer_overseas_bases?: string | null
          customer_product_category_large?: string | null
          customer_product_category_medium?: string | null
          customer_product_category_small?: string | null
          customer_representative_name?: string | null
          customer_representative_position_name?: string | null
          customer_seal_url?: string | null
          customer_senior_managing_director?: string | null
          customer_senior_vice_president?: string | null
          customer_suppliers?: string | null
          customer_website_url?: string | null
          customer_zipcode?: string | null
          id?: string
          logo_url?: string | null
          subscriber_id?: string | null
          subscription_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_subscriber_id_fkey"
            columns: ["subscriber_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_subscription_id_fkey"
            columns: ["subscription_id"]
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
      contacts: {
        Row: {
          approval_amount: string | null
          ban_reason: string | null
          call_careful_flag: boolean | null
          call_careful_reason: string | null
          claim: string | null
          client_company_id: string | null
          company_cell_phone: string | null
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          direct_fax: string | null
          direct_line: string | null
          email: string | null
          email_ban_flag: boolean | null
          extension: string | null
          fax_dm_ban_flag: boolean | null
          id: string
          name: string
          occupation: string | null
          personal_cell_phone: string | null
          position_class: string | null
          position_name: string | null
          sending_materials_ban_flag: boolean | null
          updated_at: string | null
        }
        Insert: {
          approval_amount?: string | null
          ban_reason?: string | null
          call_careful_flag?: boolean | null
          call_careful_reason?: string | null
          claim?: string | null
          client_company_id?: string | null
          company_cell_phone?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          direct_fax?: string | null
          direct_line?: string | null
          email?: string | null
          email_ban_flag?: boolean | null
          extension?: string | null
          fax_dm_ban_flag?: boolean | null
          id?: string
          name: string
          occupation?: string | null
          personal_cell_phone?: string | null
          position_class?: string | null
          position_name?: string | null
          sending_materials_ban_flag?: boolean | null
          updated_at?: string | null
        }
        Update: {
          approval_amount?: string | null
          ban_reason?: string | null
          call_careful_flag?: boolean | null
          call_careful_reason?: string | null
          claim?: string | null
          client_company_id?: string | null
          company_cell_phone?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          direct_fax?: string | null
          direct_line?: string | null
          email?: string | null
          email_ban_flag?: boolean | null
          extension?: string | null
          fax_dm_ban_flag?: boolean | null
          id?: string
          name?: string
          occupation?: string | null
          personal_cell_phone?: string | null
          position_class?: string | null
          position_name?: string | null
          sending_materials_ban_flag?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_client_company_id_fkey"
            columns: ["client_company_id"]
            referencedRelation: "client_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_created_by_company_id_fkey"
            columns: ["created_by_company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      meetings: {
        Row: {
          client_company_id: string | null
          client_contact_id: string | null
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          id: string
          meeting_business_office: string | null
          meeting_department: string | null
          meeting_member_name: string | null
          meeting_participation_request: string | null
          meeting_type: string | null
          meeting_year_month: number | null
          planned_appoint_check_flag: boolean | null
          planned_comment: string | null
          planned_date: string | null
          planned_duration: number | null
          planned_product1: string | null
          planned_product2: string | null
          planned_purpose: string | null
          planned_start_time: string | null
          pre_meeting_participation_request: string | null
          result_category: string | null
          result_date: string | null
          result_duration: number | null
          result_end_time: string | null
          result_negotiate_decision_maker: string | null
          result_number_of_meeting_participants: number | null
          result_presentation_product1: string | null
          result_presentation_product2: string | null
          result_presentation_product3: string | null
          result_presentation_product4: string | null
          result_presentation_product5: string | null
          result_start_time: string | null
          result_summary: string | null
          updated_at: string | null
          web_tool: string | null
        }
        Insert: {
          client_company_id?: string | null
          client_contact_id?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          id?: string
          meeting_business_office?: string | null
          meeting_department?: string | null
          meeting_member_name?: string | null
          meeting_participation_request?: string | null
          meeting_type?: string | null
          meeting_year_month?: number | null
          planned_appoint_check_flag?: boolean | null
          planned_comment?: string | null
          planned_date?: string | null
          planned_duration?: number | null
          planned_product1?: string | null
          planned_product2?: string | null
          planned_purpose?: string | null
          planned_start_time?: string | null
          pre_meeting_participation_request?: string | null
          result_category?: string | null
          result_date?: string | null
          result_duration?: number | null
          result_end_time?: string | null
          result_negotiate_decision_maker?: string | null
          result_number_of_meeting_participants?: number | null
          result_presentation_product1?: string | null
          result_presentation_product2?: string | null
          result_presentation_product3?: string | null
          result_presentation_product4?: string | null
          result_presentation_product5?: string | null
          result_start_time?: string | null
          result_summary?: string | null
          updated_at?: string | null
          web_tool?: string | null
        }
        Update: {
          client_company_id?: string | null
          client_contact_id?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          id?: string
          meeting_business_office?: string | null
          meeting_department?: string | null
          meeting_member_name?: string | null
          meeting_participation_request?: string | null
          meeting_type?: string | null
          meeting_year_month?: number | null
          planned_appoint_check_flag?: boolean | null
          planned_comment?: string | null
          planned_date?: string | null
          planned_duration?: number | null
          planned_product1?: string | null
          planned_product2?: string | null
          planned_purpose?: string | null
          planned_start_time?: string | null
          pre_meeting_participation_request?: string | null
          result_category?: string | null
          result_date?: string | null
          result_duration?: number | null
          result_end_time?: string | null
          result_negotiate_decision_maker?: string | null
          result_number_of_meeting_participants?: number | null
          result_presentation_product1?: string | null
          result_presentation_product2?: string | null
          result_presentation_product3?: string | null
          result_presentation_product4?: string | null
          result_presentation_product5?: string | null
          result_start_time?: string | null
          result_summary?: string | null
          updated_at?: string | null
          web_tool?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meetings_client_company_id_fkey"
            columns: ["client_company_id"]
            referencedRelation: "client_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_client_contact_id_fkey"
            columns: ["client_contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_created_by_company_id_fkey"
            columns: ["created_by_company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meetings_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pickbox: {
        Row: {
          created_at: string | null
          id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
        }
        Update: {
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          id: string
          inside_short_name: string | null
          outside_short_name: string | null
          product_name: string | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          id?: string
          inside_short_name?: string | null
          outside_short_name?: string | null
          product_name?: string | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          id?: string
          inside_short_name?: string | null
          outside_short_name?: string | null
          product_name?: string | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          accept_notification: boolean | null
          approval_amount: string | null
          avatar_url: string | null
          call_ban_flag: boolean | null
          company_cell_phone: string | null
          company_id: string | null
          company_role: string | null
          created_at: string
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          department: string | null
          direct_fax: string | null
          direct_line: string | null
          email: string | null
          email_ban_flag: boolean | null
          employee_id: string | null
          first_name: string | null
          first_time_login: boolean | null
          id: string
          is_active: boolean | null
          is_subscriber: boolean | null
          last_name: string | null
          occupation: string | null
          office: string | null
          personal_cell_phone: string | null
          position_class: string | null
          position_name: string | null
          profile_name: string | null
          purpose_of_use: string | null
          role: string | null
          sending_materials_ban_flag: boolean | null
          signature_stamp_id: string | null
          stripe_customer_id: string | null
          subscription_id: string | null
          unit: string | null
          updated_at: string | null
          usage: string | null
        }
        Insert: {
          accept_notification?: boolean | null
          approval_amount?: string | null
          avatar_url?: string | null
          call_ban_flag?: boolean | null
          company_cell_phone?: string | null
          company_id?: string | null
          company_role?: string | null
          created_at?: string
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          department?: string | null
          direct_fax?: string | null
          direct_line?: string | null
          email?: string | null
          email_ban_flag?: boolean | null
          employee_id?: string | null
          first_name?: string | null
          first_time_login?: boolean | null
          id: string
          is_active?: boolean | null
          is_subscriber?: boolean | null
          last_name?: string | null
          occupation?: string | null
          office?: string | null
          personal_cell_phone?: string | null
          position_class?: string | null
          position_name?: string | null
          profile_name?: string | null
          purpose_of_use?: string | null
          role?: string | null
          sending_materials_ban_flag?: boolean | null
          signature_stamp_id?: string | null
          stripe_customer_id?: string | null
          subscription_id?: string | null
          unit?: string | null
          updated_at?: string | null
          usage?: string | null
        }
        Update: {
          accept_notification?: boolean | null
          approval_amount?: string | null
          avatar_url?: string | null
          call_ban_flag?: boolean | null
          company_cell_phone?: string | null
          company_id?: string | null
          company_role?: string | null
          created_at?: string
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          department?: string | null
          direct_fax?: string | null
          direct_line?: string | null
          email?: string | null
          email_ban_flag?: boolean | null
          employee_id?: string | null
          first_name?: string | null
          first_time_login?: boolean | null
          id?: string
          is_active?: boolean | null
          is_subscriber?: boolean | null
          last_name?: string | null
          occupation?: string | null
          office?: string | null
          personal_cell_phone?: string | null
          position_class?: string | null
          position_name?: string | null
          profile_name?: string | null
          purpose_of_use?: string | null
          role?: string | null
          sending_materials_ban_flag?: boolean | null
          signature_stamp_id?: string | null
          stripe_customer_id?: string | null
          subscription_id?: string | null
          unit?: string | null
          updated_at?: string | null
          usage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_created_by_company_id_fkey"
            columns: ["created_by_company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_signature_stamp_id_fkey"
            columns: ["signature_stamp_id"]
            referencedRelation: "signature_stamps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_subscription_id_fkey"
            columns: ["subscription_id"]
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          }
        ]
      }
      properties: {
        Row: {
          client_company_id: string | null
          client_contact_id: string | null
          competition_state: string | null
          competitor: string | null
          competitor_appearance_date: string | null
          competitor_product: string | null
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          current_status: string | null
          customer_budget: number | null
          decision_maker_negotiation: string | null
          discount_rate: number | null
          discounted_price: number | null
          expansion_date: string | null
          expansion_quarter: string | null
          expansion_year_month: number | null
          expected_order_date: string | null
          expected_sales_price: number | null
          id: string
          lease_division: string | null
          lease_expiration_date: string | null
          leasing_company: string | null
          order_certainty_start_of_month: string | null
          pending_flag: boolean | null
          product_name: string | null
          product_sales: number | null
          property_business_office: string | null
          property_date: string | null
          property_department: string | null
          property_member_name: string | null
          property_name: string | null
          property_summary: string | null
          property_year_month: number | null
          reason_class: string | null
          reason_detail: string | null
          rejected_flag: boolean | null
          repeat_flag: boolean | null
          review_order_certainty: string | null
          sales_class: string | null
          sales_contribution_category: string | null
          sales_date: string | null
          sales_price: number | null
          sales_quarter: string | null
          sales_year_month: number | null
          sold_product_name: string | null
          step_in_flag: boolean | null
          subscription_canceled_at: string | null
          subscription_interval: string | null
          subscription_start_date: string | null
          term_division: string | null
          unit_sales: number | null
          updated_at: string | null
        }
        Insert: {
          client_company_id?: string | null
          client_contact_id?: string | null
          competition_state?: string | null
          competitor?: string | null
          competitor_appearance_date?: string | null
          competitor_product?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          current_status?: string | null
          customer_budget?: number | null
          decision_maker_negotiation?: string | null
          discount_rate?: number | null
          discounted_price?: number | null
          expansion_date?: string | null
          expansion_quarter?: string | null
          expansion_year_month?: number | null
          expected_order_date?: string | null
          expected_sales_price?: number | null
          id?: string
          lease_division?: string | null
          lease_expiration_date?: string | null
          leasing_company?: string | null
          order_certainty_start_of_month?: string | null
          pending_flag?: boolean | null
          product_name?: string | null
          product_sales?: number | null
          property_business_office?: string | null
          property_date?: string | null
          property_department?: string | null
          property_member_name?: string | null
          property_name?: string | null
          property_summary?: string | null
          property_year_month?: number | null
          reason_class?: string | null
          reason_detail?: string | null
          rejected_flag?: boolean | null
          repeat_flag?: boolean | null
          review_order_certainty?: string | null
          sales_class?: string | null
          sales_contribution_category?: string | null
          sales_date?: string | null
          sales_price?: number | null
          sales_quarter?: string | null
          sales_year_month?: number | null
          sold_product_name?: string | null
          step_in_flag?: boolean | null
          subscription_canceled_at?: string | null
          subscription_interval?: string | null
          subscription_start_date?: string | null
          term_division?: string | null
          unit_sales?: number | null
          updated_at?: string | null
        }
        Update: {
          client_company_id?: string | null
          client_contact_id?: string | null
          competition_state?: string | null
          competitor?: string | null
          competitor_appearance_date?: string | null
          competitor_product?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          current_status?: string | null
          customer_budget?: number | null
          decision_maker_negotiation?: string | null
          discount_rate?: number | null
          discounted_price?: number | null
          expansion_date?: string | null
          expansion_quarter?: string | null
          expansion_year_month?: number | null
          expected_order_date?: string | null
          expected_sales_price?: number | null
          id?: string
          lease_division?: string | null
          lease_expiration_date?: string | null
          leasing_company?: string | null
          order_certainty_start_of_month?: string | null
          pending_flag?: boolean | null
          product_name?: string | null
          product_sales?: number | null
          property_business_office?: string | null
          property_date?: string | null
          property_department?: string | null
          property_member_name?: string | null
          property_name?: string | null
          property_summary?: string | null
          property_year_month?: number | null
          reason_class?: string | null
          reason_detail?: string | null
          rejected_flag?: boolean | null
          repeat_flag?: boolean | null
          review_order_certainty?: string | null
          sales_class?: string | null
          sales_contribution_category?: string | null
          sales_date?: string | null
          sales_price?: number | null
          sales_quarter?: string | null
          sales_year_month?: number | null
          sold_product_name?: string | null
          step_in_flag?: boolean | null
          subscription_canceled_at?: string | null
          subscription_interval?: string | null
          subscription_start_date?: string | null
          term_division?: string | null
          unit_sales?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "properties_client_company_id_fkey"
            columns: ["client_company_id"]
            referencedRelation: "client_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_client_contact_id_fkey"
            columns: ["client_contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_created_by_company_id_fkey"
            columns: ["created_by_company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      quotations: {
        Row: {
          activity_type: string | null
          author: string | null
          client_company_id: string | null
          client_contact_id: string | null
          company_logo_url: string | null
          company_seal_url: string | null
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          custom_number: string | null
          delivery_date: string | null
          delivery_place: string | null
          discount_amount: string | null
          discount_rate: string | null
          discount_title: string | null
          expiration_date: string | null
          follow_up_flag: boolean | null
          id: string
          manager1_signature_stamp_id: string | null
          manager2_signature_stamp_id: string | null
          member_signature_stamp_id: string | null
          notices: string | null
          number: string | null
          priority: string | null
          quotation_date: string | null
          quotation_division: string | null
          quotation_remarks: string | null
          recipient_address: string | null
          recipient_company_name: string | null
          recipient_department: string | null
          recipient_direct_fax: string | null
          recipient_direct_line: string | null
          recipient_email: string | null
          recipient_first_name: string | null
          recipient_last_name: string | null
          recipient_zipcode: string | null
          sales_tax_class: string | null
          sales_tax_rate: string | null
          scheduled_follow_up_date: string | null
          sending_method: string | null
          square_stamp_print: boolean | null
          submission_class: string | null
          summary: string | null
          total_amount: string | null
          total_price: string | null
          transaction_terms: string | null
          updated_at: string | null
        }
        Insert: {
          activity_type?: string | null
          author?: string | null
          client_company_id?: string | null
          client_contact_id?: string | null
          company_logo_url?: string | null
          company_seal_url?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          custom_number?: string | null
          delivery_date?: string | null
          delivery_place?: string | null
          discount_amount?: string | null
          discount_rate?: string | null
          discount_title?: string | null
          expiration_date?: string | null
          follow_up_flag?: boolean | null
          id?: string
          manager1_signature_stamp_id?: string | null
          manager2_signature_stamp_id?: string | null
          member_signature_stamp_id?: string | null
          notices?: string | null
          number?: string | null
          priority?: string | null
          quotation_date?: string | null
          quotation_division?: string | null
          quotation_remarks?: string | null
          recipient_address?: string | null
          recipient_company_name?: string | null
          recipient_department?: string | null
          recipient_direct_fax?: string | null
          recipient_direct_line?: string | null
          recipient_email?: string | null
          recipient_first_name?: string | null
          recipient_last_name?: string | null
          recipient_zipcode?: string | null
          sales_tax_class?: string | null
          sales_tax_rate?: string | null
          scheduled_follow_up_date?: string | null
          sending_method?: string | null
          square_stamp_print?: boolean | null
          submission_class?: string | null
          summary?: string | null
          total_amount?: string | null
          total_price?: string | null
          transaction_terms?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_type?: string | null
          author?: string | null
          client_company_id?: string | null
          client_contact_id?: string | null
          company_logo_url?: string | null
          company_seal_url?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          custom_number?: string | null
          delivery_date?: string | null
          delivery_place?: string | null
          discount_amount?: string | null
          discount_rate?: string | null
          discount_title?: string | null
          expiration_date?: string | null
          follow_up_flag?: boolean | null
          id?: string
          manager1_signature_stamp_id?: string | null
          manager2_signature_stamp_id?: string | null
          member_signature_stamp_id?: string | null
          notices?: string | null
          number?: string | null
          priority?: string | null
          quotation_date?: string | null
          quotation_division?: string | null
          quotation_remarks?: string | null
          recipient_address?: string | null
          recipient_company_name?: string | null
          recipient_department?: string | null
          recipient_direct_fax?: string | null
          recipient_direct_line?: string | null
          recipient_email?: string | null
          recipient_first_name?: string | null
          recipient_last_name?: string | null
          recipient_zipcode?: string | null
          sales_tax_class?: string | null
          sales_tax_rate?: string | null
          scheduled_follow_up_date?: string | null
          sending_method?: string | null
          square_stamp_print?: boolean | null
          submission_class?: string | null
          summary?: string | null
          total_amount?: string | null
          total_price?: string | null
          transaction_terms?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_client_company_id_fkey"
            columns: ["client_company_id"]
            referencedRelation: "client_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_client_contact_id_fkey"
            columns: ["client_contact_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_created_by_company_id_fkey"
            columns: ["created_by_company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_manager1_signature_stamp_id_fkey"
            columns: ["manager1_signature_stamp_id"]
            referencedRelation: "signature_stamps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_manager2_signature_stamp_id_fkey"
            columns: ["manager2_signature_stamp_id"]
            referencedRelation: "signature_stamps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_member_signature_stamp_id_fkey"
            columns: ["member_signature_stamp_id"]
            referencedRelation: "signature_stamps"
            referencedColumns: ["id"]
          }
        ]
      }
      requests: {
        Row: {
          comment: string | null
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          follow_up_flag: boolean | null
          id: string
          request_number: number | null
          response_deadline: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          follow_up_flag?: boolean | null
          id?: string
          request_number?: number | null
          response_deadline?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          created_by_company_id?: string | null
          created_by_department_of_user?: string | null
          created_by_unit_of_user?: string | null
          created_by_user_id?: string | null
          follow_up_flag?: boolean | null
          id?: string
          request_number?: number | null
          response_deadline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requests_created_by_company_id_fkey"
            columns: ["created_by_company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      signature_stamps: {
        Row: {
          created_at: string | null
          furigana: string
          id: string
          image_url: string
          kanji: string
          romaji: string
        }
        Insert: {
          created_at?: string | null
          furigana: string
          id?: string
          image_url: string
          kanji: string
          romaji: string
        }
        Update: {
          created_at?: string | null
          furigana?: string
          id?: string
          image_url?: string
          kanji?: string
          romaji?: string
        }
        Relationships: []
      }
      stripe_webhook_events: {
        Row: {
          accounts_to_create: number | null
          cancel_at: string | null
          cancel_at_period_end: boolean | null
          cancel_comment: string | null
          cancel_feedback: string | null
          cancel_reason: string | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          interval: string | null
          interval_count: number | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscriber_id: string | null
          subscription_plan: string | null
          subscription_stage: string | null
          user_role: string | null
          webhook_created: string | null
          webhook_event_type: string | null
          webhook_id: string | null
        }
        Insert: {
          accounts_to_create?: number | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          cancel_comment?: string | null
          cancel_feedback?: string | null
          cancel_reason?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval?: string | null
          interval_count?: number | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscriber_id?: string | null
          subscription_plan?: string | null
          subscription_stage?: string | null
          user_role?: string | null
          webhook_created?: string | null
          webhook_event_type?: string | null
          webhook_id?: string | null
        }
        Update: {
          accounts_to_create?: number | null
          cancel_at?: string | null
          cancel_at_period_end?: boolean | null
          cancel_comment?: string | null
          cancel_feedback?: string | null
          cancel_reason?: string | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval?: string | null
          interval_count?: number | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscriber_id?: string | null
          subscription_plan?: string | null
          subscription_stage?: string | null
          user_role?: string | null
          webhook_created?: string | null
          webhook_event_type?: string | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_webhook_events_subscriber_id_fkey"
            columns: ["subscriber_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscribed_accounts: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          subscribe_status: string | null
          subscription_id: string | null
          user_id: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          subscribe_status?: string | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          subscribe_status?: string | null
          subscription_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribed_accounts_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscribed_accounts_subscription_id_fkey"
            columns: ["subscription_id"]
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscribed_accounts_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      subscriptions: {
        Row: {
          accounts_to_create: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          interval: string | null
          status: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscriber_id: string | null
          subscription_plan: string | null
          subscription_stage: string | null
        }
        Insert: {
          accounts_to_create?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscriber_id?: string | null
          subscription_plan?: string | null
          subscription_stage?: string | null
        }
        Update: {
          accounts_to_create?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          interval?: string | null
          status?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscriber_id?: string | null
          subscription_plan?: string | null
          subscription_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_clients: {
        Row: {
          client_user_id: string | null
          complete_flag: boolean | null
          created_at: string | null
          id: number
          pick_date: string | null
          pick_reason: string | null
          pick_target: string | null
          pick_year_month: string | null
          user_id: string | null
        }
        Insert: {
          client_user_id?: string | null
          complete_flag?: boolean | null
          created_at?: string | null
          id?: number
          pick_date?: string | null
          pick_reason?: string | null
          pick_target?: string | null
          pick_year_month?: string | null
          user_id?: string | null
        }
        Update: {
          client_user_id?: string | null
          complete_flag?: boolean | null
          created_at?: string | null
          id?: number
          pick_date?: string | null
          pick_reason?: string | null
          pick_target?: string | null
          pick_year_month?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_clients_client_user_id_fkey"
            columns: ["client_user_id"]
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_clients_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_pickboxes: {
        Row: {
          created_at: string | null
          id: string
          pickbox_id: string | null
          title: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          pickbox_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          pickbox_id?: string | null
          title?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_pickboxes_pickbox_id_fkey"
            columns: ["pickbox_id"]
            referencedRelation: "pickbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_pickboxes_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_picks: {
        Row: {
          client_user_id: string | null
          complete_flag: boolean | null
          created_at: string | null
          id: string
          pick_reason: string | null
          pick_year_month: string | null
          pickbox_id: string | null
          user_id: string | null
        }
        Insert: {
          client_user_id?: string | null
          complete_flag?: boolean | null
          created_at?: string | null
          id?: string
          pick_reason?: string | null
          pick_year_month?: string | null
          pickbox_id?: string | null
          user_id?: string | null
        }
        Update: {
          client_user_id?: string | null
          complete_flag?: boolean | null
          created_at?: string | null
          id?: string
          pick_reason?: string | null
          pick_year_month?: string | null
          pickbox_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_picks_client_user_id_fkey"
            columns: ["client_user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_picks_pickbox_id_fkey"
            columns: ["pickbox_id"]
            referencedRelation: "pickbox"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_picks_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      search_activities_and_companies_and_contacts: {
        Args: {
          params: Json
        }
        Returns: {
          company_id: string
          company_name: string
          contact_id: string
          contact_name: string
          department_name: string
          main_phone_number: string
          main_fax: string
          zipcode: string
          address: string
          company_email: string
          number_of_employees_class: string
          capital: string
          established_in: string
          business_content: string
          website_url: string
          industry_type: string
          product_category_large: string
          product_category_medium: string
          product_category_small: string
          fiscal_end_month: string
          budget_request_month1: string
          budget_request_month2: string
          clients: string
          supplier: string
          facility: string
          business_sites: string
          overseas_bases: string
          group_company: string
          corporate_number: string
          direct_line: string
          direct_fax: string
          extension: string
          company_cell_phone: string
          personal_cell_phone: string
          contact_email: string
          position_name: string
          position_class: string
          occupation: string
          approval_amount: string
          contact_created_by_company_id: string
          contact_created_by_user_id: string
          contact_created_by_department_of_user: string
          contact_created_by_unit_of_user: string
          call_careful_flag: boolean
          call_careful_reason: string
          email_ban_flag: boolean
          sending_materials_ban_flag: boolean
          fax_dm_ban_flag: boolean
          ban_reason: string
          claim: string
          activity_id: string
          activity_created_at: string
          activity_updated_at: string
          activity_created_by_company_id: string
          activity_created_by_user_id: string
          activity_created_by_department_of_user: string
          activity_created_by_unit_of_user: string
          summary: string
          scheduled_follow_up_date: string
          follow_up_flag: boolean
          document_url: string
          activity_type: string
          claim_flag: boolean
          product_introduction1: string
          product_introduction2: string
          product_introduction3: string
          product_introduction4: string
          product_introduction5: string
          business_office: string
          member_name: string
          priority: string
          activity_date: string
          department: string
        }[]
      }
      search_activities_and_companies_and_contacts_v2: {
        Args: {
          params: Json
        }
        Returns: {
          company_id: string
          company_name: string
          contact_id: string
          contact_name: string
          department_name: string
          main_phone_number: string
          main_fax: string
          zipcode: string
          address: string
          company_email: string
          number_of_employees_class: string
          capital: string
          established_in: string
          business_content: string
          website_url: string
          industry_type: string
          product_category_large: string
          product_category_medium: string
          product_category_small: string
          fiscal_end_month: string
          budget_request_month1: string
          budget_request_month2: string
          clients: string
          supplier: string
          facility: string
          business_sites: string
          overseas_bases: string
          group_company: string
          corporate_number: string
          direct_line: string
          direct_fax: string
          extension: string
          company_cell_phone: string
          personal_cell_phone: string
          contact_email: string
          position_name: string
          position_class: string
          occupation: string
          approval_amount: string
          contact_created_by_company_id: string
          contact_created_by_user_id: string
          contact_created_by_department_of_user: string
          contact_created_by_unit_of_user: string
          call_careful_flag: boolean
          call_careful_reason: string
          email_ban_flag: boolean
          sending_materials_ban_flag: boolean
          fax_dm_ban_flag: boolean
          ban_reason: string
          claim: string
          activity_id: string
          activity_created_at: string
          activity_updated_at: string
          activity_created_by_company_id: string
          activity_created_by_user_id: string
          activity_created_by_department_of_user: string
          activity_created_by_unit_of_user: string
          summary: string
          scheduled_follow_up_date: string
          follow_up_flag: boolean
          document_url: string
          activity_type: string
          claim_flag: boolean
          product_introduction1: string
          product_introduction2: string
          product_introduction3: string
          product_introduction4: string
          product_introduction5: string
          business_office: string
          member_name: string
          priority: string
          activity_date: string
          department: string
          activity_year_month: number
          meeting_id: string
          property_id: string
          quotation_id: string
        }[]
      }
      search_companies: {
        Args: {
          params: Json
        }
        Returns: {
          address: string
          auditor: string | null
          ban_reason: string | null
          board_member: string | null
          budget_request_month1: string | null
          budget_request_month2: string | null
          business_content: string | null
          business_sites: string | null
          call_careful_flag: boolean | null
          call_careful_reason: string | null
          capital: string | null
          chairperson: string | null
          claim: string | null
          clients: string | null
          corporate_number: string | null
          created_at: string | null
          created_by_company_id: string | null
          created_by_department_of_user: string | null
          created_by_unit_of_user: string | null
          created_by_user_id: string | null
          department_contacts: string | null
          department_name: string | null
          director: string | null
          email: string | null
          email_ban_flag: boolean | null
          established_in: string | null
          facility: string | null
          fax_dm_ban_flag: boolean | null
          fiscal_end_month: string | null
          group_company: string | null
          id: string
          industry_large: string | null
          industry_small: string | null
          industry_type: string | null
          main_fax: string | null
          main_phone_number: string | null
          manager: string | null
          managing_director: string | null
          member: string | null
          name: string
          number_of_employees: string | null
          number_of_employees_class: string | null
          overseas_bases: string | null
          product_category_large: string | null
          product_category_medium: string | null
          product_category_small: string | null
          representative_name: string | null
          sending_ban_flag: boolean | null
          senior_managing_director: string | null
          senior_vice_president: string | null
          supplier: string | null
          updated_at: string | null
          website_url: string | null
          zipcode: string | null
        }[]
      }
      search_companies_and_contacts: {
        Args: {
          params: Json
        }
        Returns: {
          company_id: string
          company_name: string
          contact_id: string
          contact_name: string
          department_name: string
          main_phone_number: string
          main_fax: string
          zipcode: string
          address: string
          company_email: string
          number_of_employees_class: string
          capital: string
          established_in: string
          business_content: string
          website_url: string
          industry_type: string
          product_category_large: string
          product_category_medium: string
          product_category_small: string
          fiscal_end_month: string
          budget_request_month1: string
          budget_request_month2: string
          clients: string
          supplier: string
          facility: string
          business_sites: string
          overseas_bases: string
          group_company: string
          corporate_number: string
          direct_line: string
          direct_fax: string
          extension: string
          company_cell_phone: string
          personal_cell_phone: string
          contact_email: string
          position_name: string
          position_class: string
          occupation: string
          approval_amount: string
          created_by_company_id: string
          created_by_user_id: string
          created_by_department_of_user: string
          created_by_unit_of_user: string
          call_careful_flag: boolean
          call_careful_reason: string
          email_ban_flag: boolean
          sending_materials_ban_flag: boolean
          fax_dm_ban_flag: boolean
          ban_reason: string
          claim: string
        }[]
      }
      search_meetings_and_companies_and_contacts: {
        Args: {
          params: Json
        }
        Returns: {
          company_id: string
          company_name: string
          contact_id: string
          contact_name: string
          department_name: string
          main_phone_number: string
          main_fax: string
          zipcode: string
          address: string
          company_email: string
          number_of_employees_class: string
          capital: string
          established_in: string
          business_content: string
          website_url: string
          industry_type: string
          product_category_large: string
          product_category_medium: string
          product_category_small: string
          fiscal_end_month: string
          budget_request_month1: string
          budget_request_month2: string
          clients: string
          supplier: string
          facility: string
          business_sites: string
          overseas_bases: string
          group_company: string
          corporate_number: string
          direct_line: string
          direct_fax: string
          extension: string
          company_cell_phone: string
          personal_cell_phone: string
          contact_email: string
          position_name: string
          position_class: string
          occupation: string
          approval_amount: string
          contact_created_by_company_id: string
          contact_created_by_user_id: string
          contact_created_by_department_of_user: string
          contact_created_by_unit_of_user: string
          call_careful_flag: boolean
          call_careful_reason: string
          email_ban_flag: boolean
          sending_materials_ban_flag: boolean
          fax_dm_ban_flag: boolean
          ban_reason: string
          claim: string
          meeting_id: string
          meeting_created_at: string
          meeting_updated_at: string
          meeting_created_by_company_id: string
          meeting_created_by_user_id: string
          meeting_created_by_department_of_user: string
          meeting_created_by_unit_of_user: string
          meeting_type: string
          web_tool: string
          planned_date: string
          planned_start_time: string
          planned_purpose: string
          planned_duration: number
          planned_appoint_check_flag: boolean
          planned_product1: string
          planned_product2: string
          planned_comment: string
          result_date: string
          result_start_time: string
          result_end_time: string
          result_duration: number
          result_number_of_meeting_participants: number
          result_presentation_product1: string
          result_presentation_product2: string
          result_presentation_product3: string
          result_presentation_product4: string
          result_presentation_product5: string
          result_category: string
          result_summary: string
          result_negotiate_decision_maker: string
          pre_meeting_participation_request: string
          meeting_participation_request: string
          meeting_business_office: string
          meeting_department: string
          meeting_member_name: string
          meeting_year_month: number
        }[]
      }
      search_properties_and_companies_and_contacts: {
        Args: {
          params: Json
        }
        Returns: {
          company_id: string
          company_name: string
          contact_id: string
          contact_name: string
          department_name: string
          main_phone_number: string
          main_fax: string
          zipcode: string
          address: string
          company_email: string
          number_of_employees_class: string
          capital: string
          established_in: string
          business_content: string
          website_url: string
          industry_type: string
          product_category_large: string
          product_category_medium: string
          product_category_small: string
          fiscal_end_month: string
          budget_request_month1: string
          budget_request_month2: string
          clients: string
          supplier: string
          facility: string
          business_sites: string
          overseas_bases: string
          group_company: string
          corporate_number: string
          direct_line: string
          direct_fax: string
          extension: string
          company_cell_phone: string
          personal_cell_phone: string
          contact_email: string
          position_name: string
          position_class: string
          occupation: string
          approval_amount: string
          contact_created_by_company_id: string
          contact_created_by_user_id: string
          contact_created_by_department_of_user: string
          contact_created_by_unit_of_user: string
          call_careful_flag: boolean
          call_careful_reason: string
          email_ban_flag: boolean
          sending_materials_ban_flag: boolean
          fax_dm_ban_flag: boolean
          ban_reason: string
          claim: string
          property_id: string
          property_created_at: string
          property_created_by_company_id: string
          property_created_by_user_id: string
          property_created_by_department_of_user: string
          property_created_by_unit_of_user: string
          current_status: string
          property_name: string
          property_summary: string
          pending_flag: boolean
          rejected_flag: boolean
          product_name: string
          product_sales: number
          expected_order_date: string
          expected_sales_price: number
          term_division: string
          sold_product_name: string
          unit_sales: number
          sales_contribution_category: string
          sales_price: number
          discounted_price: number
          discount_rate: number
          sales_class: string
          expansion_date: string
          sales_date: string
          expansion_quarter: string
          sales_quarter: string
          subscription_start_date: string
          subscription_canceled_at: string
          leasing_company: string
          lease_division: string
          lease_expiration_date: string
          step_in_flag: boolean
          repeat_flag: boolean
          order_certainty_start_of_month: string
          review_order_certainty: string
          competitor_appearance_date: string
          competitor: string
          competitor_product: string
          reason_class: string
          reason_detail: string
          customer_budget: number
          decision_maker_negotiation: string
          expansion_year_month: number
          sales_year_month: number
          property_updated_at: string
          subscription_interval: string
          competition_state: string
          property_year_month: number
          property_department: string
          property_business_office: string
          property_member_name: string
          property_date: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: unknown
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
