export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      activities: {
        Row: {
          activity_type: string | null;
          claim_flag: boolean | null;
          client_company_id: string | null;
          client_contact_id: string | null;
          created_at: string | null;
          created_by_company_id: string | null;
          created_by_department_of_user: string | null;
          created_by_user_id: string | null;
          created_unit_of_user: string | null;
          document_url: string | null;
          follow_up_flag: boolean | null;
          id: string;
          priority: string | null;
          scheduled_follow_up_date: string | null;
          summary: string | null;
          updated_at: string | null;
        };
        Insert: {
          activity_type?: string | null;
          claim_flag?: boolean | null;
          client_company_id?: string | null;
          client_contact_id?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_user_id?: string | null;
          created_unit_of_user?: string | null;
          document_url?: string | null;
          follow_up_flag?: boolean | null;
          id?: string;
          priority?: string | null;
          scheduled_follow_up_date?: string | null;
          summary?: string | null;
          updated_at?: string | null;
        };
        Update: {
          activity_type?: string | null;
          claim_flag?: boolean | null;
          client_company_id?: string | null;
          client_contact_id?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_user_id?: string | null;
          created_unit_of_user?: string | null;
          document_url?: string | null;
          follow_up_flag?: boolean | null;
          id?: string;
          priority?: string | null;
          scheduled_follow_up_date?: string | null;
          summary?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "activities_client_company_id_fkey";
            columns: ["client_company_id"];
            referencedRelation: "client_companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_client_contact_id_fkey";
            columns: ["client_contact_id"];
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_created_by_company_id_fkey";
            columns: ["created_by_company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "activities_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      alignments: {
        Row: {
          client_company_id: string | null;
          client_user_id: string | null;
          confirm_sales_flag: boolean | null;
          created_at: string | null;
          created_by_company_id: string | null;
          created_by_department_of_user: string | null;
          created_by_unit_of_user: string | null;
          created_by_user_id: string | null;
          id: string;
          immediate_action_flag: boolean | null;
          like: boolean | null;
          number: number | null;
          response_comment: string | null;
          sales_amount: number | null;
          sales_link_property: string | null;
          sales_number: number | null;
          summary: string | null;
          to_department_of_user: string | null;
          to_unit_of_user: string | null;
          to_user_id: string | null;
          updated_at: string | null;
        };
        Insert: {
          client_company_id?: string | null;
          client_user_id?: string | null;
          confirm_sales_flag?: boolean | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          id?: string;
          immediate_action_flag?: boolean | null;
          like?: boolean | null;
          number?: number | null;
          response_comment?: string | null;
          sales_amount?: number | null;
          sales_link_property?: string | null;
          sales_number?: number | null;
          summary?: string | null;
          to_department_of_user?: string | null;
          to_unit_of_user?: string | null;
          to_user_id?: string | null;
          updated_at?: string | null;
        };
        Update: {
          client_company_id?: string | null;
          client_user_id?: string | null;
          confirm_sales_flag?: boolean | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          id?: string;
          immediate_action_flag?: boolean | null;
          like?: boolean | null;
          number?: number | null;
          response_comment?: string | null;
          sales_amount?: number | null;
          sales_link_property?: string | null;
          sales_number?: number | null;
          summary?: string | null;
          to_department_of_user?: string | null;
          to_unit_of_user?: string | null;
          to_user_id?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "alignments_client_company_id_fkey";
            columns: ["client_company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alignments_client_user_id_fkey";
            columns: ["client_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alignments_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alignments_sales_link_property_fkey";
            columns: ["sales_link_property"];
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "alignments_to_user_id_fkey";
            columns: ["to_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      client_companies: {
        Row: {
          address: string;
          auditor: string | null;
          ban_reason: string | null;
          budget_request_month1: number | null;
          budget_request_month2: number | null;
          business_content: string | null;
          business_sites: string | null;
          call_careful_flag: boolean | null;
          call_careful_reason: string | null;
          capital: number | null;
          chairperson: string | null;
          claim: string | null;
          clients: string | null;
          created_at: string | null;
          created_by_company_id: string | null;
          created_by_department_of_user: string | null;
          created_by_unit_of_user: string | null;
          created_by_user_id: string | null;
          department_contacts: string | null;
          department_name: string;
          director: string | null;
          email: string | null;
          email_ban_flag: boolean | null;
          established_in: string | null;
          facility: string | null;
          fax_dm_ban_flag: boolean | null;
          fiscal_end_month: number | null;
          group_company: string | null;
          id: string;
          industry_large: string | null;
          industry_small: string | null;
          industry_type: string | null;
          inspection_equipment: string | null;
          main_fax: string | null;
          main_phone_number: string;
          manager: string | null;
          managing_director: string | null;
          member: string | null;
          name: string;
          number_of_employees_class: string | null;
          number_of_employees: string | null;
          overseas_bases: string | null;
          product_category_large: string | null;
          product_category_medium: string | null;
          product_category_small: string | null;
          representative_name: string | null;
          representative_position_name: string | null;
          sending_ban_flag: boolean | null;
          senior_managing_director: string | null;
          senior_vice_president: string | null;
          subsidiary: string | null;
          supplier: string | null;
          updated_at: string | null;
          website_url: string | null;
          zipcode: string | null;
        };
        Insert: {
          address: string;
          auditor?: string | null;
          ban_reason?: string | null;
          budget_request_month1?: number | null;
          budget_request_month2?: number | null;
          business_content?: string | null;
          business_sites?: string | null;
          call_careful_flag?: boolean | null;
          call_careful_reason?: string | null;
          capital?: number | null;
          chairperson?: string | null;
          cliam?: string | null;
          clients?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          department_contacts?: string | null;
          department_name: string;
          director?: string | null;
          email?: string | null;
          email_ban_flag?: boolean | null;
          established_in?: string | null;
          facility?: string | null;
          fax_dm_ban_flag?: boolean | null;
          fiscal_end_month?: number | null;
          group_company?: string | null;
          id?: string;
          industry_large?: string | null;
          industry_small?: string | null;
          industry_type?: string | null;
          inspection_equipment?: string | null;
          main_fax?: string | null;
          main_phone_number: string;
          manager?: string | null;
          managing_director?: string | null;
          member?: string | null;
          name: string;
          number_of_employee_class?: string | null;
          number_of_employees?: string | null;
          overseas_bases?: string | null;
          product_category_large?: string | null;
          product_category_medium?: string | null;
          product_category_small?: string | null;
          representative_name?: string | null;
          representative_position_name?: string | null;
          sending_ban_flag?: boolean | null;
          senior_managing_director?: string | null;
          senior_vice_president?: string | null;
          subsidiary?: string | null;
          supplier?: string | null;
          updated_at?: string | null;
          website_url?: string | null;
          zipcode?: string | null;
        };
        Update: {
          address?: string;
          auditor?: string | null;
          ban_reason?: string | null;
          budget_request_month1?: number | null;
          budget_request_month2?: number | null;
          business_content?: string | null;
          business_sites?: string | null;
          call_careful_flag?: boolean | null;
          call_careful_reason?: string | null;
          capital?: number | null;
          chairperson?: string | null;
          cliam?: string | null;
          clients?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          department_contacts?: string | null;
          department_name?: string;
          director?: string | null;
          email?: string | null;
          email_ban_flag?: boolean | null;
          established_in?: string | null;
          facility?: string | null;
          fax_dm_ban_flag?: boolean | null;
          fiscal_end_month?: number | null;
          group_company?: string | null;
          id?: string;
          industry_large?: string | null;
          industry_small?: string | null;
          industry_type?: string | null;
          inspection_equipment?: string | null;
          main_fax?: string | null;
          main_phone_number?: string;
          manager?: string | null;
          managing_director?: string | null;
          member?: string | null;
          name?: string;
          number_of_employee_class?: string | null;
          number_of_employees?: string | null;
          overseas_bases?: string | null;
          product_category_large?: string | null;
          product_category_medium?: string | null;
          product_category_small?: string | null;
          representative_name?: string | null;
          representative_position_name?: string | null;
          sending_ban_flag?: boolean | null;
          senior_managing_director?: string | null;
          senior_vice_president?: string | null;
          subsidiary?: string | null;
          supplier?: string | null;
          updated_at?: string | null;
          website_url?: string | null;
          zipcode?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "client_companies_created_by_company_id_fkey";
            columns: ["created_by_company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "client_companies_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      clientcompany_contact: {
        Row: {
          client_company_id: string | null;
          contact_id: string | null;
          created_at: string | null;
          id: number;
        };
        Insert: {
          client_company_id?: string | null;
          contact_id?: string | null;
          created_at?: string | null;
          id?: number;
        };
        Update: {
          client_company_id?: string | null;
          contact_id?: string | null;
          created_at?: string | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "clientcompany_contact_client_company_id_fkey";
            columns: ["client_company_id"];
            referencedRelation: "client_companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "clientcompany_contact_contact_id_fkey";
            columns: ["contact_id"];
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          }
        ];
      };
      companies: {
        Row: {
          address: string | null;
          auditor: string | null;
          base_name: string | null;
          budget_request_month1: number | null;
          budget_request_month2: number | null;
          business_content: string | null;
          business_sites: string | null;
          capital: number | null;
          chairperson: string | null;
          clients: string | null;
          corporate_number: number | null;
          created_at: string | null;
          department_contacts: string | null;
          director: string | null;
          email: string | null;
          established_in: string | null;
          established_in_year_month: number | null;
          facility: string | null;
          fiscal_end_month: number | null;
          group_company: string | null;
          id: string;
          industry_large: string | null;
          industry_small: string | null;
          industry_type: string | null;
          inspection_equipment: string | null;
          is_competitor_flag: boolean | null;
          logo_url: string | null;
          main_fax: string | null;
          main_phone_number: string | null;
          manager: string | null;
          "managing Director": string | null;
          member: string | null;
          name: string | null;
          notify_service_provider: string | null;
          number_of_employees: string | null;
          number_of_employees_class: string | null;
          overseas_bases: string | null;
          product_category_large: string | null;
          product_category_medium: string | null;
          product_category_small: string | null;
          representative_name: string | null;
          representative_position_name: string | null;
          seal_url: string | null;
          "senior Managing Director": string | null;
          "senior Vice President": string | null;
          subscriber_id: string | null;
          subscription_id: string | null;
          subsidiary: string | null;
          suppliers: string | null;
          updated_at: string | null;
          website_url: string | null;
          zipcode: string | null;
        };
        Insert: {
          address?: string | null;
          auditor?: string | null;
          base_name?: string | null;
          budget_request_month1?: number | null;
          budget_request_month2?: number | null;
          business_content?: string | null;
          business_sites?: string | null;
          capital?: number | null;
          chairperson?: string | null;
          clients?: string | null;
          corporate_number?: number | null;
          created_at?: string | null;
          department_contacts?: string | null;
          director?: string | null;
          email?: string | null;
          established_in?: string | null;
          established_in_year_month?: number | null;
          facility?: string | null;
          fiscal_end_month?: number | null;
          group_company?: string | null;
          id?: string;
          industry_large?: string | null;
          industry_small?: string | null;
          industry_type?: string | null;
          inspection_equipment?: string | null;
          is_competitor_flag?: boolean | null;
          logo_url?: string | null;
          main_fax?: string | null;
          main_phone_number?: string | null;
          manager?: string | null;
          "managing Director"?: string | null;
          member?: string | null;
          name?: string | null;
          notify_service_provider?: string | null;
          number_of_employees?: string | null;
          number_of_employees_class?: string | null;
          overseas_bases?: string | null;
          product_category_large?: string | null;
          product_category_medium?: string | null;
          product_category_small?: string | null;
          representative_name?: string | null;
          representative_position_name?: string | null;
          seal_url?: string | null;
          "senior Managing Director"?: string | null;
          "senior Vice President"?: string | null;
          subscriber_id?: string | null;
          subscription_id?: string | null;
          subsidiary?: string | null;
          suppliers?: string | null;
          updated_at?: string | null;
          website_url?: string | null;
          zipcode?: string | null;
        };
        Update: {
          address?: string | null;
          auditor?: string | null;
          base_name?: string | null;
          budget_request_month1?: number | null;
          budget_request_month2?: number | null;
          business_content?: string | null;
          business_sites?: string | null;
          capital?: number | null;
          chairperson?: string | null;
          clients?: string | null;
          corporate_number?: number | null;
          created_at?: string | null;
          department_contacts?: string | null;
          director?: string | null;
          email?: string | null;
          established_in?: string | null;
          established_in_year_month?: number | null;
          facility?: string | null;
          fiscal_end_month?: number | null;
          group_company?: string | null;
          id?: string;
          industry_large?: string | null;
          industry_small?: string | null;
          industry_type?: string | null;
          inspection_equipment?: string | null;
          is_competitor_flag?: boolean | null;
          logo_url?: string | null;
          main_fax?: string | null;
          main_phone_number?: string | null;
          manager?: string | null;
          "managing Director"?: string | null;
          member?: string | null;
          name?: string | null;
          notify_service_provider?: string | null;
          number_of_employees?: string | null;
          number_of_employees_class?: string | null;
          overseas_bases?: string | null;
          product_category_large?: string | null;
          product_category_medium?: string | null;
          product_category_small?: string | null;
          representative_name?: string | null;
          representative_position_name?: string | null;
          seal_url?: string | null;
          "senior Managing Director"?: string | null;
          "senior Vice President"?: string | null;
          subscriber_id?: string | null;
          subscription_id?: string | null;
          subsidiary?: string | null;
          suppliers?: string | null;
          updated_at?: string | null;
          website_url?: string | null;
          zipcode?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "companies_subscriber_id_fkey";
            columns: ["subscriber_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "companies_subscription_id_fkey";
            columns: ["subscription_id"];
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
      contacts: {
        Row: {
          approval_amount: number | null;
          ban_reason: string | null;
          call_careful_flag: boolean | null;
          call_careful_reason: string | null;
          claim: string | null;
          company_cell_phone: string | null;
          created_at: string | null;
          created_by_company_id: string | null;
          created_by_department_of_user: string | null;
          created_by_unit_of_user: string | null;
          created_by_user_id: string | null;
          department: string | null;
          direct_fax: string | null;
          direct_line: string | null;
          email: string | null;
          email_ban_flag: boolean | null;
          fax_dm_ban_flag: boolean | null;
          id: string;
          last_name: string | null;
          occupation: string | null;
          personal_cell_phone: string | null;
          position: string | null;
          position_class: string | null;
          sending_materials_ban_flag: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          approval_amount?: number | null;
          ban_reason?: string | null;
          call_careful_flag?: boolean | null;
          call_careful_reason?: string | null;
          claim?: string | null;
          company_cell_phone?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          department?: string | null;
          direct_fax?: string | null;
          direct_line?: string | null;
          email?: string | null;
          email_ban_flag?: boolean | null;
          fax_dm_ban_flag?: boolean | null;
          id?: string;
          last_name?: string | null;
          occupation?: string | null;
          personal_cell_phone?: string | null;
          position?: string | null;
          position_class?: string | null;
          sending_materials_ban_flag?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          approval_amount?: number | null;
          ban_reason?: string | null;
          call_careful_flag?: boolean | null;
          call_careful_reason?: string | null;
          claim?: string | null;
          company_cell_phone?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          department?: string | null;
          direct_fax?: string | null;
          direct_line?: string | null;
          email?: string | null;
          email_ban_flag?: boolean | null;
          fax_dm_ban_flag?: boolean | null;
          id?: string;
          last_name?: string | null;
          occupation?: string | null;
          personal_cell_phone?: string | null;
          position?: string | null;
          position_class?: string | null;
          sending_materials_ban_flag?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "contacts_created_by_company_id_fkey";
            columns: ["created_by_company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "contacts_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      meetings: {
        Row: {
          activity_type: string | null;
          client_company_id: string | null;
          client_contact_id: string | null;
          created_at: string | null;
          created_by_company_id: string | null;
          created_by_department_of_user: string | null;
          created_by_unit_of_user: string | null;
          created_by_user_id: string | null;
          follow_up_flag: boolean | null;
          id: string;
          meeting_participation_request: string | null;
          meeting_type: string | null;
          planned_appoint_check_flag: boolean | null;
          planned_comment: string | null;
          planned_date: string | null;
          planned_duration: number | null;
          planned_product1: string | null;
          planned_product2: string | null;
          planned_purpose: string | null;
          planned_start_time: string | null;
          pre_meeting_participation_request: string | null;
          priority: string | null;
          result_category: string | null;
          result_date: string | null;
          result_duration: number | null;
          result_end_time: string | null;
          result_nagotiated_dicision_maker: string | null;
          result_number_of_meeting_participants: number | null;
          result_presentation_product1: string | null;
          result_presentation_product2: string | null;
          result_presentation_product3: string | null;
          result_presentation_product4: string | null;
          result_presentation_product5: string | null;
          result_start_time: string | null;
          scheduled_follow_up_date: string | null;
          summary: string | null;
          updated_at: string | null;
          web_tool: string | null;
        };
        Insert: {
          activity_type?: string | null;
          client_company_id?: string | null;
          client_contact_id?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          follow_up_flag?: boolean | null;
          id?: string;
          meeting_participation_request?: string | null;
          meeting_type?: string | null;
          planned_appoint_check_flag?: boolean | null;
          planned_comment?: string | null;
          planned_date?: string | null;
          planned_duration?: number | null;
          planned_product1?: string | null;
          planned_product2?: string | null;
          planned_purpose?: string | null;
          planned_start_time?: string | null;
          pre_meeting_participation_request?: string | null;
          priority?: string | null;
          result_category?: string | null;
          result_date?: string | null;
          result_duration?: number | null;
          result_end_time?: string | null;
          result_nagotiated_dicision_maker?: string | null;
          result_number_of_meeting_participants?: number | null;
          result_presentation_product1?: string | null;
          result_presentation_product2?: string | null;
          result_presentation_product3?: string | null;
          result_presentation_product4?: string | null;
          result_presentation_product5?: string | null;
          result_start_time?: string | null;
          scheduled_follow_up_date?: string | null;
          summary?: string | null;
          updated_at?: string | null;
          web_tool?: string | null;
        };
        Update: {
          activity_type?: string | null;
          client_company_id?: string | null;
          client_contact_id?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          follow_up_flag?: boolean | null;
          id?: string;
          meeting_participation_request?: string | null;
          meeting_type?: string | null;
          planned_appoint_check_flag?: boolean | null;
          planned_comment?: string | null;
          planned_date?: string | null;
          planned_duration?: number | null;
          planned_product1?: string | null;
          planned_product2?: string | null;
          planned_purpose?: string | null;
          planned_start_time?: string | null;
          pre_meeting_participation_request?: string | null;
          priority?: string | null;
          result_category?: string | null;
          result_date?: string | null;
          result_duration?: number | null;
          result_end_time?: string | null;
          result_nagotiated_dicision_maker?: string | null;
          result_number_of_meeting_participants?: number | null;
          result_presentation_product1?: string | null;
          result_presentation_product2?: string | null;
          result_presentation_product3?: string | null;
          result_presentation_product4?: string | null;
          result_presentation_product5?: string | null;
          result_start_time?: string | null;
          scheduled_follow_up_date?: string | null;
          summary?: string | null;
          updated_at?: string | null;
          web_tool?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "meetings_client_company_id_fkey";
            columns: ["client_company_id"];
            referencedRelation: "client_companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meetings_client_contact_id_fkey";
            columns: ["client_contact_id"];
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meetings_created_by_company_id_fkey";
            columns: ["created_by_company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "meetings_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      pickbox: {
        Row: {
          created_at: string | null;
          id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          amount: number | null;
          created_at: string | null;
          created_by_company_id: string | null;
          created_by_user_id: string | null;
          id: string;
          name: string | null;
          quantity: number | null;
          quotation_id: string | null;
          short_name: string | null;
          unit: string | null;
          unit_price: number | null;
          updated_at: string | null;
        };
        Insert: {
          amount?: number | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_user_id?: string | null;
          id?: string;
          name?: string | null;
          quantity?: number | null;
          quotation_id?: string | null;
          short_name?: string | null;
          unit?: string | null;
          unit_price?: number | null;
          updated_at?: string | null;
        };
        Update: {
          amount?: number | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_user_id?: string | null;
          id?: string;
          name?: string | null;
          quantity?: number | null;
          quotation_id?: string | null;
          short_name?: string | null;
          unit?: string | null;
          unit_price?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "products_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "products_quotation_id_fkey";
            columns: ["quotation_id"];
            referencedRelation: "quotations";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          accept_notification: boolean | null;
          approval_amount: number | null;
          avatar_url: string | null;
          call_ban_flag: boolean | null;
          company_cell_phone: string | null;
          company_id: string | null;
          company_role: string | null;
          created_at: string;
          created_by_company_id: string | null;
          created_by_department_of_user: string | null;
          created_by_unit_of_user: string | null;
          created_by_user_id: string | null;
          department: string | null;
          direct_fax: string | null;
          direct_line: string | null;
          email: string | null;
          email_ban_flag: boolean | null;
          employee_id: string | null;
          first_name: string | null;
          first_time_login: boolean | null;
          id: string;
          is_active: boolean | null;
          is_subscriber: boolean | null;
          last_name: string | null;
          occupation: string | null;
          office: string | null;
          personal_cell_phone: string | null;
          position: string | null;
          position_class: string | null;
          profile_name: string | null;
          role: string | null;
          sending_materials_ban_flag: boolean | null;
          signature_stamp_id: string | null;
          stripe_customer_id: string | null;
          subscription_id: string | null;
          updated_at: string | null;
          visit_ban_flag: boolean | null;
        };
        Insert: {
          accept_notification?: boolean | null;
          approval_amount?: number | null;
          avatar_url?: string | null;
          call_ban_flag?: boolean | null;
          company_cell_phone?: string | null;
          company_id?: string | null;
          company_role?: string | null;
          created_at?: string;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          department?: string | null;
          direct_fax?: string | null;
          direct_line?: string | null;
          email?: string | null;
          email_ban_flag?: boolean | null;
          employee_id?: string | null;
          first_name?: string | null;
          first_time_login?: boolean | null;
          id: string;
          is_active?: boolean | null;
          is_subscriber?: boolean | null;
          last_name?: string | null;
          occupation?: string | null;
          office?: string | null;
          personal_cell_phone?: string | null;
          position?: string | null;
          position_class?: string | null;
          profile_name?: string | null;
          role?: string | null;
          sending_materials_ban_flag?: boolean | null;
          signature_stamp_id?: string | null;
          stripe_customer_id?: string | null;
          subscription_id?: string | null;
          updated_at?: string | null;
          visit_ban_flag?: boolean | null;
        };
        Update: {
          accept_notification?: boolean | null;
          approval_amount?: number | null;
          avatar_url?: string | null;
          call_ban_flag?: boolean | null;
          company_cell_phone?: string | null;
          company_id?: string | null;
          company_role?: string | null;
          created_at?: string;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          department?: string | null;
          direct_fax?: string | null;
          direct_line?: string | null;
          email?: string | null;
          email_ban_flag?: boolean | null;
          employee_id?: string | null;
          first_name?: string | null;
          first_time_login?: boolean | null;
          id?: string;
          is_active?: boolean | null;
          is_subscriber?: boolean | null;
          last_name?: string | null;
          occupation?: string | null;
          office?: string | null;
          personal_cell_phone?: string | null;
          position?: string | null;
          position_class?: string | null;
          profile_name?: string | null;
          role?: string | null;
          sending_materials_ban_flag?: boolean | null;
          signature_stamp_id?: string | null;
          stripe_customer_id?: string | null;
          subscription_id?: string | null;
          updated_at?: string | null;
          visit_ban_flag?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_created_by_company_id_fkey";
            columns: ["created_by_company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_signature_stamp_id_fkey";
            columns: ["signature_stamp_id"];
            referencedRelation: "signature_stamps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "profiles_subscription_id_fkey";
            columns: ["subscription_id"];
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          }
        ];
      };
      properties: {
        Row: {
          activity_type: string | null;
          client_company_id: string | null;
          client_contact_id: string | null;
          competitor: string | null;
          competitor_appearance_date: string | null;
          competitor_product: string | null;
          created_at: string | null;
          created_by_company_id: string | null;
          created_by_department_of_user: string | null;
          created_by_unit_of_user: string | null;
          created_by_user_id: string | null;
          current_status: string | null;
          customer_budget: number | null;
          decision_maker_negotiation: string | null;
          discount_rate: number | null;
          discounted_price: number | null;
          expansion_date: string | null;
          expansion_quarter: string | null;
          expansion_year_month: number | null;
          expected_order_date: string | null;
          expected_sales_price: number | null;
          follow_up_flag: boolean | null;
          id: string;
          lease_division: string | null;
          lease_expiration_date: string | null;
          leasing_company: string | null;
          name: string | null;
          order_certainty_start_of_month: string | null;
          pending_flag: boolean | null;
          priority: string | null;
          product_name: string | null;
          product_sales: number | null;
          reason_class: string | null;
          reason_detail: string | null;
          rejected_flag: boolean | null;
          repeat_flag: boolean | null;
          review_order_certainty: string | null;
          sales_class: string | null;
          sales_contribution_category: string | null;
          sales_date: string | null;
          sales_price: number | null;
          sales_quarter: string | null;
          sales_year_month: number | null;
          scheduled_follow_up_date: string | null;
          sold_product_name: string | null;
          step_in_flag: boolean | null;
          subscription_canceled_at: string | null;
          subscription_start_date: string | null;
          summary: string | null;
          term_division: string | null;
          unit_sales: number | null;
          updated_at: string | null;
        };
        Insert: {
          activity_type?: string | null;
          client_company_id?: string | null;
          client_contact_id?: string | null;
          competitor?: string | null;
          competitor_appearance_date?: string | null;
          competitor_product?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          current_status?: string | null;
          customer_budget?: number | null;
          decision_maker_negotiation?: string | null;
          discount_rate?: number | null;
          discounted_price?: number | null;
          expansion_date?: string | null;
          expansion_quarter?: string | null;
          expansion_year_month?: number | null;
          expected_order_date?: string | null;
          expected_sales_price?: number | null;
          follow_up_flag?: boolean | null;
          id?: string;
          lease_division?: string | null;
          lease_expiration_date?: string | null;
          leasing_company?: string | null;
          name?: string | null;
          order_certainty_start_of_month?: string | null;
          pending_flag?: boolean | null;
          priority?: string | null;
          product_name?: string | null;
          product_sales?: number | null;
          reason_class?: string | null;
          reason_detail?: string | null;
          rejected_flag?: boolean | null;
          repeat_flag?: boolean | null;
          review_order_certainty?: string | null;
          sales_class?: string | null;
          sales_contribution_category?: string | null;
          sales_date?: string | null;
          sales_price?: number | null;
          sales_quarter?: string | null;
          sales_year_month?: number | null;
          scheduled_follow_up_date?: string | null;
          sold_product_name?: string | null;
          step_in_flag?: boolean | null;
          subscription_canceled_at?: string | null;
          subscription_start_date?: string | null;
          summary?: string | null;
          term_division?: string | null;
          unit_sales?: number | null;
          updated_at?: string | null;
        };
        Update: {
          activity_type?: string | null;
          client_company_id?: string | null;
          client_contact_id?: string | null;
          competitor?: string | null;
          competitor_appearance_date?: string | null;
          competitor_product?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          current_status?: string | null;
          customer_budget?: number | null;
          decision_maker_negotiation?: string | null;
          discount_rate?: number | null;
          discounted_price?: number | null;
          expansion_date?: string | null;
          expansion_quarter?: string | null;
          expansion_year_month?: number | null;
          expected_order_date?: string | null;
          expected_sales_price?: number | null;
          follow_up_flag?: boolean | null;
          id?: string;
          lease_division?: string | null;
          lease_expiration_date?: string | null;
          leasing_company?: string | null;
          name?: string | null;
          order_certainty_start_of_month?: string | null;
          pending_flag?: boolean | null;
          priority?: string | null;
          product_name?: string | null;
          product_sales?: number | null;
          reason_class?: string | null;
          reason_detail?: string | null;
          rejected_flag?: boolean | null;
          repeat_flag?: boolean | null;
          review_order_certainty?: string | null;
          sales_class?: string | null;
          sales_contribution_category?: string | null;
          sales_date?: string | null;
          sales_price?: number | null;
          sales_quarter?: string | null;
          sales_year_month?: number | null;
          scheduled_follow_up_date?: string | null;
          sold_product_name?: string | null;
          step_in_flag?: boolean | null;
          subscription_canceled_at?: string | null;
          subscription_start_date?: string | null;
          summary?: string | null;
          term_division?: string | null;
          unit_sales?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "properties_client_company_id_fkey";
            columns: ["client_company_id"];
            referencedRelation: "client_companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_client_contact_id_fkey";
            columns: ["client_contact_id"];
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_created_by_company_id_fkey";
            columns: ["created_by_company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "properties_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      quotations: {
        Row: {
          activity_type: string | null;
          author: string | null;
          client_company_id: string | null;
          client_contact_id: string | null;
          company_logo_url: string | null;
          company_seal_url: string | null;
          created_at: string | null;
          created_by_company_id: string | null;
          created_by_department_of_user: string | null;
          created_by_unit_of_user: string | null;
          created_by_user_id: string | null;
          custom_number: string | null;
          delivery_date: string | null;
          delivery_place: string | null;
          discount_amount: number | null;
          discount_rate: number | null;
          discount_title: string | null;
          expiration_date: string | null;
          follow_up_flag: boolean | null;
          id: string;
          manager1_signature_stamp_id: string | null;
          manager2_signature_stamp_id: string | null;
          member_signature_stamp_id: string | null;
          notices: string | null;
          number: number | null;
          priority: string | null;
          quotation_date: string | null;
          quotation_division: string | null;
          quotation_remarks: string | null;
          recipient_address: string | null;
          recipient_company_name: string | null;
          recipient_department: string | null;
          recipient_direct_fax: string | null;
          recipient_direct_line: string | null;
          recipient_email: string | null;
          recipient_first_name: string | null;
          recipient_last_name: string | null;
          recipient_zipcode: string | null;
          sales_tax_class: string | null;
          sales_tax_rate: number | null;
          scheduled_follow_up_date: string | null;
          sending_method: string | null;
          square_stamp_print: boolean | null;
          submission_class: string | null;
          summary: string | null;
          total_amount: number | null;
          total_price: number | null;
          transaction_terms: string | null;
          updated_at: string | null;
        };
        Insert: {
          activity_type?: string | null;
          author?: string | null;
          client_company_id?: string | null;
          client_contact_id?: string | null;
          company_logo_url?: string | null;
          company_seal_url?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          custom_number?: string | null;
          delivery_date?: string | null;
          delivery_place?: string | null;
          discount_amount?: number | null;
          discount_rate?: number | null;
          discount_title?: string | null;
          expiration_date?: string | null;
          follow_up_flag?: boolean | null;
          id?: string;
          manager1_signature_stamp_id?: string | null;
          manager2_signature_stamp_id?: string | null;
          member_signature_stamp_id?: string | null;
          notices?: string | null;
          number?: number | null;
          priority?: string | null;
          quotation_date?: string | null;
          quotation_division?: string | null;
          quotation_remarks?: string | null;
          recipient_address?: string | null;
          recipient_company_name?: string | null;
          recipient_department?: string | null;
          recipient_direct_fax?: string | null;
          recipient_direct_line?: string | null;
          recipient_email?: string | null;
          recipient_first_name?: string | null;
          recipient_last_name?: string | null;
          recipient_zipcode?: string | null;
          sales_tax_class?: string | null;
          sales_tax_rate?: number | null;
          scheduled_follow_up_date?: string | null;
          sending_method?: string | null;
          square_stamp_print?: boolean | null;
          submission_class?: string | null;
          summary?: string | null;
          total_amount?: number | null;
          total_price?: number | null;
          transaction_terms?: string | null;
          updated_at?: string | null;
        };
        Update: {
          activity_type?: string | null;
          author?: string | null;
          client_company_id?: string | null;
          client_contact_id?: string | null;
          company_logo_url?: string | null;
          company_seal_url?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          custom_number?: string | null;
          delivery_date?: string | null;
          delivery_place?: string | null;
          discount_amount?: number | null;
          discount_rate?: number | null;
          discount_title?: string | null;
          expiration_date?: string | null;
          follow_up_flag?: boolean | null;
          id?: string;
          manager1_signature_stamp_id?: string | null;
          manager2_signature_stamp_id?: string | null;
          member_signature_stamp_id?: string | null;
          notices?: string | null;
          number?: number | null;
          priority?: string | null;
          quotation_date?: string | null;
          quotation_division?: string | null;
          quotation_remarks?: string | null;
          recipient_address?: string | null;
          recipient_company_name?: string | null;
          recipient_department?: string | null;
          recipient_direct_fax?: string | null;
          recipient_direct_line?: string | null;
          recipient_email?: string | null;
          recipient_first_name?: string | null;
          recipient_last_name?: string | null;
          recipient_zipcode?: string | null;
          sales_tax_class?: string | null;
          sales_tax_rate?: number | null;
          scheduled_follow_up_date?: string | null;
          sending_method?: string | null;
          square_stamp_print?: boolean | null;
          submission_class?: string | null;
          summary?: string | null;
          total_amount?: number | null;
          total_price?: number | null;
          transaction_terms?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "quotations_client_company_id_fkey";
            columns: ["client_company_id"];
            referencedRelation: "client_companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_client_contact_id_fkey";
            columns: ["client_contact_id"];
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_created_by_company_id_fkey";
            columns: ["created_by_company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_manager1_signature_stamp_id_fkey";
            columns: ["manager1_signature_stamp_id"];
            referencedRelation: "signature_stamps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_manager2_signature_stamp_id_fkey";
            columns: ["manager2_signature_stamp_id"];
            referencedRelation: "signature_stamps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "quotations_member_signature_stamp_id_fkey";
            columns: ["member_signature_stamp_id"];
            referencedRelation: "signature_stamps";
            referencedColumns: ["id"];
          }
        ];
      };
      requests: {
        Row: {
          comment: string | null;
          created_at: string | null;
          created_by_company_id: string | null;
          created_by_department_of_user: string | null;
          created_by_unit_of_user: string | null;
          created_by_user_id: string | null;
          follow_up_flag: boolean | null;
          id: string;
          request_number: number | null;
          response_deadline: string | null;
          updated_at: string | null;
        };
        Insert: {
          comment?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          follow_up_flag?: boolean | null;
          id?: string;
          request_number?: number | null;
          response_deadline?: string | null;
          updated_at?: string | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string | null;
          created_by_company_id?: string | null;
          created_by_department_of_user?: string | null;
          created_by_unit_of_user?: string | null;
          created_by_user_id?: string | null;
          follow_up_flag?: boolean | null;
          id?: string;
          request_number?: number | null;
          response_deadline?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "requests_created_by_company_id_fkey";
            columns: ["created_by_company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "requests_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      signature_stamps: {
        Row: {
          created_at: string | null;
          furigana: string;
          id: string;
          image_url: string;
          kanji: string;
          romaji: string;
        };
        Insert: {
          created_at?: string | null;
          furigana: string;
          id?: string;
          image_url: string;
          kanji: string;
          romaji: string;
        };
        Update: {
          created_at?: string | null;
          furigana?: string;
          id?: string;
          image_url?: string;
          kanji?: string;
          romaji?: string;
        };
        Relationships: [];
      };
      stripe_webhook_events: {
        Row: {
          accounts_to_create: number | null;
          cancel_at: string | null;
          cancel_at_period_end: boolean | null;
          cancel_comment: string | null;
          cancel_feedback: string | null;
          cancel_reason: string | null;
          canceled_at: string | null;
          created_at: string | null;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          interval: string | null;
          interval_count: string | null;
          status: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscriber_id: string | null;
          subscription_plan: string | null;
          subscription_stage: string | null;
          webhook_created: string | null;
          webhook_event_type: string | null;
          webhook_id: string | null;
        };
        Insert: {
          accounts_to_create?: number | null;
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          cancel_comment?: string | null;
          cancel_feedback?: string | null;
          cancel_reason?: string | null;
          canceled_at?: string | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          interval?: string | null;
          interval_count?: string | null;
          status?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscriber_id?: string | null;
          subscription_plan?: string | null;
          subscription_stage?: string | null;
          webhook_created?: string | null;
          webhook_event_type?: string | null;
          webhook_id?: string | null;
        };
        Update: {
          accounts_to_create?: number | null;
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          cancel_comment?: string | null;
          cancel_feedback?: string | null;
          cancel_reason?: string | null;
          canceled_at?: string | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          interval?: string | null;
          interval_count?: string | null;
          status?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscriber_id?: string | null;
          subscription_plan?: string | null;
          subscription_stage?: string | null;
          webhook_created?: string | null;
          webhook_event_type?: string | null;
          webhook_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "stripe_webhook_events_subscriber_id_fkey";
            columns: ["subscriber_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      subscribed_accounts: {
        Row: {
          company_id: string | null;
          created_at: string | null;
          id: string;
          subscribe_status: string | null;
          subscription_id: string | null;
          user_id: string | null;
        };
        Insert: {
          company_id?: string | null;
          created_at?: string | null;
          id?: string;
          subscribe_status?: string | null;
          subscription_id?: string | null;
          user_id?: string | null;
        };
        Update: {
          company_id?: string | null;
          created_at?: string | null;
          id?: string;
          subscribe_status?: string | null;
          subscription_id?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscribed_accounts_company_id_fkey";
            columns: ["company_id"];
            referencedRelation: "companies";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscribed_accounts_subscription_id_fkey";
            columns: ["subscription_id"];
            referencedRelation: "subscriptions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscribed_accounts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          accounts_to_create: number | null;
          created_at: string | null;
          current_period_end: string | null;
          current_period_start: string | null;
          id: string;
          interval: string | null;
          status: string | null;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          subscriber_id: string | null;
          subscription_plan: string | null;
          subscription_stage: string | null;
        };
        Insert: {
          accounts_to_create?: number | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          interval?: string | null;
          status?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscriber_id?: string | null;
          subscription_plan?: string | null;
          subscription_stage?: string | null;
        };
        Update: {
          accounts_to_create?: number | null;
          created_at?: string | null;
          current_period_end?: string | null;
          current_period_start?: string | null;
          id?: string;
          interval?: string | null;
          status?: string | null;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          subscriber_id?: string | null;
          subscription_plan?: string | null;
          subscription_stage?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_subscriber_id_fkey";
            columns: ["subscriber_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_clients: {
        Row: {
          client_user_id: string | null;
          complete_flag: boolean | null;
          created_at: string | null;
          id: number;
          pick_date: string | null;
          pick_reason: string | null;
          pick_target: string | null;
          pick_year_month: number | null;
          user_id: string | null;
        };
        Insert: {
          client_user_id?: string | null;
          complete_flag?: boolean | null;
          created_at?: string | null;
          id?: number;
          pick_date?: string | null;
          pick_reason?: string | null;
          pick_target?: string | null;
          pick_year_month?: number | null;
          user_id?: string | null;
        };
        Update: {
          client_user_id?: string | null;
          complete_flag?: boolean | null;
          created_at?: string | null;
          id?: number;
          pick_date?: string | null;
          pick_reason?: string | null;
          pick_target?: string | null;
          pick_year_month?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_clients_client_user_id_fkey";
            columns: ["client_user_id"];
            referencedRelation: "contacts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_clients_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_pickboxes: {
        Row: {
          created_at: string | null;
          id: string;
          pickbox_id: string | null;
          title: string | null;
          user_id: string | null;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          pickbox_id?: string | null;
          title?: string | null;
          user_id?: string | null;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          pickbox_id?: string | null;
          title?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_pickboxes_pickbox_id_fkey";
            columns: ["pickbox_id"];
            referencedRelation: "pickbox";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_pickboxes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      user_picks: {
        Row: {
          client_user_id: string | null;
          complete_flag: boolean | null;
          created_at: string | null;
          id: string;
          pick_reason: string | null;
          pick_year_month: number | null;
          pickbox_id: string | null;
          updated_at: string | null;
          user_id: string | null;
        };
        Insert: {
          client_user_id?: string | null;
          complete_flag?: boolean | null;
          created_at?: string | null;
          id?: string;
          pick_reason?: string | null;
          pick_year_month?: number | null;
          pickbox_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Update: {
          client_user_id?: string | null;
          complete_flag?: boolean | null;
          created_at?: string | null;
          id?: string;
          pick_reason?: string | null;
          pick_year_month?: number | null;
          pickbox_id?: string | null;
          updated_at?: string | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "user_picks_client_user_id_fkey";
            columns: ["client_user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_picks_pickbox_id_fkey";
            columns: ["pickbox_id"];
            referencedRelation: "pickbox";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_picks_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null;
          avif_autodetection: boolean | null;
          created_at: string | null;
          file_size_limit: number | null;
          id: string;
          name: string;
          owner: string | null;
          public: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id: string;
          name: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          allowed_mime_types?: string[] | null;
          avif_autodetection?: boolean | null;
          created_at?: string | null;
          file_size_limit?: number | null;
          id?: string;
          name?: string;
          owner?: string | null;
          public?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "buckets_owner_fkey";
            columns: ["owner"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      migrations: {
        Row: {
          executed_at: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Insert: {
          executed_at?: string | null;
          hash: string;
          id: number;
          name: string;
        };
        Update: {
          executed_at?: string | null;
          hash?: string;
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      objects: {
        Row: {
          bucket_id: string | null;
          created_at: string | null;
          id: string;
          last_accessed_at: string | null;
          metadata: Json | null;
          name: string | null;
          owner: string | null;
          path_tokens: string[] | null;
          updated_at: string | null;
          version: string | null;
        };
        Insert: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Update: {
          bucket_id?: string | null;
          created_at?: string | null;
          id?: string;
          last_accessed_at?: string | null;
          metadata?: Json | null;
          name?: string | null;
          owner?: string | null;
          path_tokens?: string[] | null;
          updated_at?: string | null;
          version?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey";
            columns: ["bucket_id"];
            referencedRelation: "buckets";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "objects_owner_fkey";
            columns: ["owner"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_insert_object: {
        Args: {
          bucketid: string;
          name: string;
          owner: string;
          metadata: Json;
        };
        Returns: undefined;
      };
      extension: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      filename: {
        Args: {
          name: string;
        };
        Returns: string;
      };
      foldername: {
        Args: {
          name: string;
        };
        Returns: unknown;
      };
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>;
        Returns: {
          size: number;
          bucket_id: string;
        }[];
      };
      search: {
        Args: {
          prefix: string;
          bucketname: string;
          limits?: number;
          levels?: number;
          offsets?: number;
          search?: string;
          sortcolumn?: string;
          sortorder?: string;
        };
        Returns: {
          name: string;
          id: string;
          updated_at: string;
          created_at: string;
          last_accessed_at: string;
          metadata: Json;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
