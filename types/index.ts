// =================== Language ===================

// クリック位置
export type ClickedItemPos = {
  x: number;
  y: number;
  itemWidth: number;
  itemHeight: number;
} | null;

// =================== Tooltip ===================
// ホバー位置
export type hoveredItemPos = {
  x: number;
  y: number;
  itemWidth: number;
  itemHeight: number;
  content: string;
  content2?: string | null;
  content3?: string | null;
  display: string;
  textLength?: number;
} | null;
// 左右にツールチップを表示
export type hoveredItemPosHorizon = {
  x: number;
  y: number;
  itemWidth: number;
  itemHeight: number;
  content: string;
  content2?: string | null;
  display?: string | null;
} | null;
// ホバー位置 ツールチップ側でMouseEnterした位置で動的に上下に表示
export type hoveredItemPosWrap = {
  x: number;
  y: number;
  itemWidth: number;
  itemHeight: number;
  content: string;
  content2?: string | null;
  content3?: string | null;
  display?: string | null;
  textLength?: number;
} | null;

// =================== アクティブタブ ===================
export type ActiveMenuTab = string;

// =================== カラム順番 ===================
export type ColumnHeaderItemList = {
  columnId: number;
  columnName: string;
  columnIndex: number;
  columnWidth: string;
  isOverflow: boolean;
  isFrozen: boolean;
};

// =================== サイドバーセクション開閉状態 ===================

// =================== Profile ===================
export type Profile = {
  accept_notification?: boolean | null;
  approval_amount?: string | null;
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

//supabaseのprofilesテーブルのフィールド内容にデータ型を定義 初回登録時はsupabaseから取得の際にundefinedで返ってきて登録になるので、データ型はユニオン型で定義

// 営業先会社 client_companiesテーブル
export type Client_company = {
  id: string;
  address?: string | null;
  auditor?: string | null;
  ban_reason?: string | null;
  budget_request_month1?: string | null;
  budget_request_month2?: string | null;
  business_content?: string | null;
  business_sites?: string | null;
  call_careful_flag?: boolean | null;
  call_careful_reason?: string | null;
  capital?: string | null;
  corporate_number?: string | null;
  chairperson?: string | null;
  claim?: string | null;
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
  fiscal_end_month?: string | null;
  group_company?: string | null;
  industry_large?: string | null;
  industry_small?: string | null;
  industry_type?: string | null;
  main_fax?: string | null;
  main_phone_number?: string;
  manager?: string | null;
  managing_director?: string | null;
  board_member?: string | null;
  member?: string | null;
  name?: string;
  number_of_employees_class?: string | null;
  number_of_employees?: string | null;
  overseas_bases?: string | null;
  product_category_large?: string | null;
  product_category_medium?: string | null;
  product_category_small?: string | null;
  representative_name?: string | null;
  // representative_position_name?: string | null;
  sending_ban_flag?: boolean | null;
  senior_managing_director?: string | null;
  senior_vice_president?: string | null;
  supplier?: string | null;
  updated_at?: string | null;
  website_url?: string | null;
  zipcode?: string | null;
};

export type Client_company_row_data = {
  id?: string;
  address?: string | null;
  auditor?: string | null;
  ban_reason?: string | null;
  budget_request_month1?: string | null;
  budget_request_month2?: string | null;
  business_content?: string | null;
  business_sites?: string | null;
  call_careful_flag?: boolean | null;
  call_careful_reason?: string | null;
  capital?: string | null;
  corporate_number?: string | null;
  chairperson?: string | null;
  claim?: string | null;
  clients?: string | null;
  created_at?: string | null;
  created_by_company_id?: string | null;
  created_by_department_of_user?: string | null;
  created_by_unit_of_user?: string | null;
  created_by_user_id?: string | null;
  department_contacts?: string | null;
  department_name?: string;
  director?: string | null;
  board_member?: string | null;
  email?: string | null;
  email_ban_flag?: boolean | null;
  established_in?: string | null;
  facility?: string | null;
  fax_dm_ban_flag?: boolean | null;
  fiscal_end_month?: string | null;
  group_company?: string | null;
  industry_large?: string | null;
  industry_small?: string | null;
  industry_type?: string | null;
  main_fax?: string | null;
  main_phone_number?: string;
  manager?: string | null;
  managing_director?: string | null;
  member?: string | null;
  name?: string;
  number_of_employees_class?: string | null;
  number_of_employees?: string | null;
  overseas_bases?: string | null;
  product_category_large?: string | null;
  product_category_medium?: string | null;
  product_category_small?: string | null;
  representative_name?: string | null;
  // representative_position_name?: string | null;
  sending_ban_flag?: boolean | null;
  senior_managing_director?: string | null;
  senior_vice_president?: string | null;
  supplier?: string | null;
  updated_at?: string | null;
  website_url?: string | null;
  zipcode?: string | null;
};
// export type Client_company_row_data = {
//   id?: string;
//   corporate_number?: string | null;
//   name?: string | null;
//   representative_name?: string | null;
//   department_name?: string | null;
//   main_phone_number?: string | null;
//   main_fax?: string | null;
//   zipcode?: string | null;
//   address?: string | null;
//   industry_large?: string | null;
//   industry_small?: string | null;
//   industry_type?: string | null;
//   product_category_large?: string | null;
//   product_category_medium?: string | null;
//   product_category_small?: string | null;
//   number_of_employees_class?: string | null;
//   fiscal_end_month?: string | null;
//   capital?: string | null;
//   email?: string | null;
//   clients?: string | null;
//   supplier?: string | null;
//   // representative_position_name?: string | null;
//   chairperson?: string | null;
//   senior_vice_president?: string | null;
//   senior_managing_director?: string | null;
//   managing_director?: string | null;
//   director?: string | null;
//   auditor?: string | null;
//   manager?: string | null;
//   member?: string | null;
//   facility?: string | null;
//   business_sites?: string | null;
//   overseas_bases?: string | null;
//   group_company?: string | null;
//   number_of_employees?: string | null;
//   established_in?: string | null;
// };

export type NewSearchCompanyParams = {
  name: string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  number_of_employees_class: string | null;
  address: string | null;
  capital: string | null;
  established_in: string | null;
  business_content: string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  clients: string | null;
  supplier: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;
};

export type UserProfile = {
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
  unit: string | null;
} | null;

export type Contact = {
  id: string;
  created_at: string;
  updated_at: string | null;
  name: string;
  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  email: string | null;
  position: string | null;
  position_class: string | null;
  occupation: string | null;
  approval_amount: number | null;
  email_ban_flag: boolean;
  sending_materials_ban_flag: boolean;
  fax_dm_ban_flag: boolean;
  ban_reason: string | null;
  claim: string | null;
  call_careful_flag: boolean;
  call_careful_reason: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
};
