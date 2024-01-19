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
  marginTop?: number;
  marginBottom?: number;
  itemsPosition?: string;
  maxWidth?: number;
  whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces";
} | null;
// モーダル
export type hoveredItemPosModal = {
  x: number;
  y: number;
  itemWidth: number;
  itemHeight: number;
  containerLeft?: number;
  containerTop?: number;
  containerWidth?: number;
  containerHeight?: number;
  content: string;
  content2?: string | null;
  content3?: string | null;
  content4?: string | null;
  display: string | undefined;
  textLength?: number;
  marginTop?: number;
  marginBottom?: number;
  itemsPosition?: string;
  maxWidth?: number;
  whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces";
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
  marginTop?: number;
  marginBottom?: number;
  itemsPosition?: string;
  maxWidth?: number;
  whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces";
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
  id: string;
  created_at: string;
  updated_at: string | null;
  avatar_url: string | null;
  company_id: string | null;
  subscription_id: string | null;
  is_subscriber: boolean | null;
  company_role: string | null;
  role: string | null;
  stripe_customer_id: string | null;
  last_name: string | null;
  first_name: string | null;
  email: string | null;
  department: string | null;
  position_name: string | null;
  position_class: string | null;
  direct_line: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  call_ban_flag: boolean | null;
  sending_materials_ban_flag: boolean | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  occupation: string | null;
  approval_amount: string | null;
  direct_fax: string | null;
  email_ban_flag: boolean | null;
  signature_stamp_id: string | null;
  employee_id: string | null;
  is_active: boolean | null;
  profile_name: string | null;
  accept_notification: boolean | null;
  first_time_login: boolean | null;
  office: string | null;
  unit: string | null;
  usage: string | null;
  purpose_of_use: string | null;
};

//supabaseのprofilesテーブルのフィールド内容にデータ型を定義 初回登録時はsupabaseから取得の際にundefinedで返ってきて登録になるので、データ型はユニオン型で定義

// 営業先会社 client_companiesテーブル
export type Client_company = {
  id: string;
  created_at?: string | null;
  updated_at?: string | null;
  created_by_company_id?: string | null;
  created_by_user_id?: string | null;
  created_by_department_of_user?: string | null;
  created_by_unit_of_user?: string | null;
  created_by_office_of_user?: string | null;
  name?: string;
  department_name?: string;
  main_fax?: string | null;
  zipcode?: string | null;
  address?: string | null;
  department_contacts?: string | null;
  industry_large?: string | null;
  industry_small?: string | null;
  industry_type?: string | null;
  product_category_large?: string | null;
  product_category_medium?: string | null;
  product_category_small?: string | null;
  number_of_employees_class?: string | null;
  fiscal_end_month?: string | null;
  // capital?: string | null;
  capital?: number | null;
  budget_request_month1?: string | null;
  budget_request_month2?: string | null;
  website_url?: string | null;
  clients?: string | null;
  supplier?: string | null;
  business_content?: string | null;
  established_in?: string | null;
  representative_name?: string | null;
  chairperson?: string | null;
  senior_vice_president?: string | null;
  senior_managing_director?: string | null;
  managing_director?: string | null;
  director?: string | null;
  auditor?: string | null;
  manager?: string | null;
  member?: string | null;
  facility?: string | null;
  business_sites?: string | null;
  overseas_bases?: string | null;
  group_company?: string | null;
  email?: string | null;
  main_phone_number?: string | null;
  corporate_number?: string | null;
  board_member?: string | null;
  number_of_employees?: string | null;
  // ban_reason?: string | null;
  // call_careful_flag?: boolean | null;
  // call_careful_reason?: string | null;
  // claim?: string | null;
  // email_ban_flag?: boolean | null;
  // fax_dm_ban_flag?: boolean | null;
  // representative_position_name?: string | null;
  // sending_ban_flag?: boolean | null;
};

export type Client_company_row_data = {
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
  // capital?: string | null;
  capital?: number | null;
  corporate_number?: string | null;
  chairperson?: string | null;
  claim?: string | null;
  clients?: string | null;
  created_at?: string | null;
  created_by_company_id?: string | null;
  created_by_user_id?: string | null;
  created_by_department_of_user?: string | null;
  created_by_unit_of_user?: string | null;
  created_by_office_of_user?: string | null;
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

export type NewSearchCompanyParams = {
  name: string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  email: string | null;
  zipcode: string | null;
  number_of_employees_class: string | null;
  address: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  facility: string | null;
  clients: string | null;
  supplier: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;
  website_url: string | null;
  // 代表者
  representative_name: string | null;
  chairperson: string | null;
  senior_vice_president: string | null;
  senior_managing_director: string | null;
  managing_director: string | null;
  director: string | null;
  auditor: string | null;
  manager: string | null;
  member: string | null;
  board_member: string | null;
};

export type UserProfile = {
  id: string;
  created_at: string;
  updated_at: string | null;
  avatar_url: string | null;
  company_id: string | null;
  subscription_id: string | null;
  is_subscriber: boolean | null;
  company_role: string | null;
  role: string | null;
  stripe_customer_id: string | null;
  last_name: string | null;
  first_name: string | null;
  email: string | null;
  department: string | null;
  position_name: string | null;
  position_class: string | null;
  direct_line: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  call_ban_flag: boolean | null;
  sending_materials_ban_flag: boolean | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  occupation: string | null;
  approval_amount: string | null;
  direct_fax: string | null;
  email_ban_flag: boolean | null;
  signature_stamp_id: string | null;
  employee_id: string | null;
  is_active: boolean | null;
  profile_name: string | null;
  accept_notification: boolean | null;
  first_time_login: boolean | null;
  office: string | null;
  unit: string | null;
  usage: string | null;
  purpose_of_use: string | null;
};
// get_user_data関数のユーザー全データ保持用
export type UserProfileCompanySubscription = {
  id: string;
  created_at: string;
  updated_at: string | null;
  avatar_url: string | null;
  is_subscriber: boolean | null;
  company_role: string | null;
  role: string | null;
  stripe_customer_id: string | null;
  last_name: string | null;
  first_name: string | null;
  email: string | null;
  department: string | null;
  position_name: string | null;
  position_class: string | null;
  direct_line: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  occupation: string | null;
  direct_fax: string | null;
  signature_stamp_id: string | null;
  employee_id: string | null;
  is_active: boolean | null;
  profile_name: string | null;
  accept_notification: boolean | null;
  first_time_login: boolean | null;
  office: string | null;
  unit: string | null;
  usage: string | null;
  purpose_of_use: string | null;
  company_id: string | null;
  company_created_at: string | null;
  company_updated_at: string | null;
  logo_url: string | null;
  customer_name: string | null;
  customer_main_phone_number: string | null;
  customer_main_fax: string | null;
  customer_zipcode: string | null;
  customer_address: string | null;
  customer_industry_large: string | null;
  customer_industry_small: string | null;
  customer_industry_type: string | null;
  customer_product_category_large: string | null;
  customer_product_category_medium: string | null;
  customer_product_category_small: string | null;
  customer_number_of_employees_class: string | null;
  customer_fiscal_end_month: string | null;
  // customer_capital: string | null;
  customer_capital: number | null;
  customer_budget_request_month1: string | null;
  customer_budget_request_month2: string | null;
  customer_website_url: string | null;
  subscribed_account_id: string | null;
  account_created_at: string | null;
  account_company_role: string | null;
  account_state: string | null;
  subscription_id: string | null;
  subscription_created_at: string | null;
  subscription_subscriber_id: string | null;
  subscription_stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  status: string | null;
  subscription_interval: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  subscription_plan: string | null;
  subscription_stage: string | null;
  accounts_to_create: number | null;
  number_of_active_subscribed_accounts: number | null;
  cancel_at_period_end: boolean | null;
  // 事業部、係、事業所、社員番号
  assigned_department_id: string | null;
  assigned_department_name: string | null;
  assigned_unit_id: string | null;
  assigned_unit_name: string | null;
  assigned_office_id: string | null;
  assigned_office_name: string | null;
  assigned_employee_id: string | null;
  assigned_employee_id_name: string | null;
};
export type Subscription = {
  id: string;
  created_at: string | null;
  subscriber_id: string | null;
  stripe_subscription_id: string | null;
  stripe_customer_id: string | null;
  status: string | null;
  subscription_interval: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  subscription_plan: string | null;
  subscription_stage: string | null;
  accounts_to_create: number | null;
  number_of_active_subscribed_accounts: number | null;
  cancel_at_period_end: boolean | null;
};
export type SubscribedAccount = {
  id: string;
  created_at: string;
  user_id: string | null;
  company_id: string | null;
  subscription_id: string | null;
  company_role: string | null;
  account_state: string | null;
  invited_email: string | null;
};
// profilesとsubscribed_accountsの外部結合データ
// 部署、係、事業所、社員番号なしvar
// export type MemberAccounts = {
//   id: string;
//   created_at: string;
//   updated_at: string | null;
//   avatar_url: string | null;
//   is_subscriber: boolean | null;
//   company_role: string | null;
//   role: string | null;
//   stripe_customer_id: string | null;
//   last_name: string | null;
//   first_name: string | null;
//   email: string | null;
//   department: string | null;
//   position_name: string | null;
//   position_class: string | null;
//   direct_line: string | null;
//   company_cell_phone: string | null;
//   personal_cell_phone: string | null;
//   occupation: string | null;
//   direct_fax: string | null;
//   signature_stamp_id: string | null;
//   employee_id: string | null;
//   is_active: boolean | null;
//   profile_name: string | null;
//   accept_notification: boolean | null;
//   first_time_login: boolean | null;
//   office: string | null;
//   unit: string | null;
//   usage: string | null;
//   purpose_of_use: string | null;
//   subscribed_account_id: string | null;
//   account_created_at: string | null;
//   account_company_role: string | null;
//   account_state: string | null;
//   account_invited_email: string | null;
// };
// profilesとsubscribed_accountsの外部結合データ
// 部署、係、事業所、社員番号なしvar
export type MemberAccounts = {
  id: string;
  created_at: string;
  updated_at: string | null;
  avatar_url: string | null;
  is_subscriber: boolean | null;
  company_role: string | null;
  role: string | null;
  stripe_customer_id: string | null;
  last_name: string | null;
  first_name: string | null;
  email: string | null;
  department: string | null;
  position_name: string | null;
  position_class: string | null;
  direct_line: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  occupation: string | null;
  direct_fax: string | null;
  signature_stamp_id: string | null;
  employee_id: string | null;
  is_active: boolean | null;
  profile_name: string | null;
  accept_notification: boolean | null;
  first_time_login: boolean | null;
  office: string | null;
  unit: string | null;
  usage: string | null;
  purpose_of_use: string | null;
  subscribed_account_id: string | null;
  account_created_at: string | null;
  account_company_role: string | null;
  account_state: string | null;
  account_invited_email: string | null;
  // 事業部、係、事業所、社員番号
  assigned_department_id: string | null;
  assigned_department_name: string | null;
  assigned_unit_id: string | null;
  assigned_unit_name: string | null;
  assigned_office_id: string | null;
  assigned_office_name: string | null;
  assigned_employee_id: string | null;
  assigned_employee_id_name: string | null;
};

export type Invitation = {
  id: string;
  created_at: string;
  updated_at: string | null;
  to_user_id: string | null;
  from_user_name: string | null;
  from_company_name: string | null;
  from_company_id: string | null;
  subscribed_account_id: string | null;
  result: string | null;
};
export type Notification = {
  id: string;
  created_at: string;
  updated_at: string | null;
  to_user_id: string | null;
  to_user_name: string | null;
  to_user_email: string | null;
  to_subscribed_account_id: string | null;
  from_user_id: string | null;
  from_user_name: string | null;
  from_user_email: string | null;
  from_user_avatar_url: string | null;
  from_company_id: string | null;
  from_company_name: string | null;
  already_read: boolean | null;
  already_read_at: string | null;
  completed: boolean | null;
  completed_at: string | null;
  result: string | null;
  type: string | null;
  content: string | null;
  from_provider: boolean | null;
  expiration_date: string | null;
};

export type StripeSchedule = {
  id: string;
  created_at: string;
  updated_at: string | null;
  stripe_customer_id: string | null;
  stripe_schedule_id: string | null;
  schedule_status: string | null;
  stripe_subscription_id: string | null;
  stripe_subscription_item_id: string | null;
  current_price_id: string | null;
  scheduled_price_id: string | null;
  current_quantity: number | null;
  scheduled_quantity: number | null;
  note: string | null;
  update_reason: string | null;
  canceled_at: string | null;
  company_id: string | null;
  subscription_id: string | null;
  current_price: number | null;
  scheduled_price: number | null;
  completed_at: string | null;
  stripe_created: string | null;
  user_id: string | null;
  current_start_date: string | null;
  current_end_date: string | null;
  released_at: string | null;
  end_behavior: string | null;
  released_subscription: string | null;
  type: string | null;
  current_plan: string | null;
  scheduled_plan: string | null;
};

// Stripe PaymentMethodオブジェクト

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
  position_name: string | null;
  // position_class: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  // occupation: string | null;
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
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
  created_by_office_of_user: string | null;
};
// 【Contact一括編集UPDATE用updateContactMutation関数】
export type EditedContact = {
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
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  email_ban_flag: boolean;
  sending_materials_ban_flag: boolean;
  fax_dm_ban_flag: boolean;
  ban_reason: string | null;
  claim: string | null;
  call_careful_flag: boolean;
  call_careful_reason: string | null;
  client_company_id: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null;
};
// 上画面の列選択した時に下画面に担当者情報を映す用のState
// 選択中の行データオブジェクト GridTableで取得した結合データ
export type Contact_row_data = {
  company_id: string;
  company_name: string | null;
  contact_id: string;
  contact_name: string | null;
  contact_created_at: string;
  contact_updated_at: string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  company_email: string | null;
  number_of_employees_class: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  website_url: string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  budget_request_month1: string | null;
  budget_request_month2: string | null;
  clients: string | null;
  supplier: string | null;
  facility: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;
  // contactsテーブル
  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  contact_email: string | null;
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null; // 🌠追加
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null;
  call_careful_flag: boolean | null;
  call_careful_reason: string | null;
  email_ban_flag: boolean | null;
  sending_materials_ban_flag: boolean | null;
  fax_dm_ban_flag: boolean | null;
  ban_reason: string | null;
  claim: string | null;
  // 🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_unit_name: string | null;
  assigned_office_name: string | null;
};
// 上画面の列選択した時に下画面に担当者情報を映す用のState
// 選択中の行データオブジェクト GridTableで取得した結合データ
export type Activity_row_data = {
  company_id: string;
  contact_id: string;
  activity_id: string;
  company_name: string | null;
  contact_name: string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  company_email: string | null;
  number_of_employees_class: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  website_url: string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  budget_request_month1: string | null;
  budget_request_month2: string | null;
  clients: string | null;
  supplier: string | null;
  facility: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;

  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  contact_email: string | null;
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  contact_created_by_company_id: string | null;
  contact_created_by_user_id: string | null;
  contact_created_by_department_of_user: string | null;
  contact_created_by_unit_of_user: string | null;
  contact_created_by_office_of_user: string | null; //🌠追加
  call_careful_flag: boolean | null;
  call_careful_reason: string | null;
  email_ban_flag: boolean | null;
  sending_materials_ban_flag: boolean | null;
  fax_dm_ban_flag: boolean | null;
  ban_reason: string | null;
  claim: string | null;

  activity_created_at: string;
  activity_updated_at: string | null;
  activity_created_by_company_id: string | null;
  activity_created_by_user_id: string | null;
  activity_created_by_department_of_user: string | null;
  activity_created_by_unit_of_user: string | null;
  activity_created_by_office_of_user: string | null; //🌠追加
  summary: string | null;
  scheduled_follow_up_date: string | null;
  follow_up_flag: boolean | null;
  document_url: string | null;
  activity_type: string | null;
  claim_flag: boolean | null;
  product_introduction1: string | null;
  product_introduction2: string | null;
  product_introduction3: string | null;
  product_introduction4: string | null;
  product_introduction5: string | null;
  business_office: string | null;
  member_name: string | null;
  priority: string | null;
  activity_date: string | null;
  department: string | null;
  activity_year_month: number | null;
  meeting_id: string | null;
  property_id: string | null;
  quotation_id: string | null;
  //🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_unit_name: string | null;
  assigned_office_name: string | null;
};
// 上画面の列選択した時に下画面に担当者情報を映す用のState
// 選択中の行データオブジェクト GridTableで取得した結合データ
// 面談時の紹介した商品群の配列
export type IntroducedProductsName = {
  introduced_product_id: string;
  introduced_product_name: string | null;
  introduced_outside_short_name: string | null;
  introduced_inside_short_name: string | null;
  introduced_unit_price: number | null;
  introduced_product_priority: number | null;
};
export type IntroducedProductsNames = IntroducedProductsName[];
// type IntroducedProductsNames = string[];
// 同席者データ
export type AttendeeInfo = {
  attendee_id: string;
  attendee_name: string | null;
  attendee_position_class: number | null;
  attendee_position_name: string | null;
  attendee_direct_line: string | null;
  attendee_email: string | null;
  attendee_company: string | null;
  attendee_main_phone_number: string | null;
  attendee_address: string | null;
  attendee_department_name: string | null;
};
// 同席者の配列
type AttendeesInfo = AttendeeInfo[];

export type Meeting_row_data = {
  company_id: string;
  contact_id: string;
  meeting_id: string;
  company_name: string | null;
  contact_name: string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  company_email: string | null;
  number_of_employees_class: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  website_url: string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  budget_request_month1: string | null;
  budget_request_month2: string | null;
  clients: string | null;
  supplier: string | null;
  facility: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;

  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  contact_email: string | null;
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  contact_created_by_company_id: string | null;
  contact_created_by_user_id: string | null;
  contact_created_by_department_of_user: string | null;
  contact_created_by_unit_of_user: string | null;
  contact_created_by_office_of_user: string | null;
  call_careful_flag: boolean | null;
  call_careful_reason: string | null;
  email_ban_flag: boolean | null;
  sending_materials_ban_flag: boolean | null;
  fax_dm_ban_flag: boolean | null;
  ban_reason: string | null;
  claim: string | null;

  meeting_created_at: string;
  meeting_updated_at: string | null;
  meeting_created_by_company_id: string | null;
  meeting_created_by_user_id: string | null;
  meeting_created_by_department_of_user: string | null;
  meeting_created_by_unit_of_user: string | null;
  meeting_created_by_office_of_user: string | null; //🌠追加
  meeting_type: string | null;
  web_tool: string | null;
  planned_date: string | null;
  planned_start_time: string | null;
  planned_purpose: string | null;
  planned_duration: number | null;
  planned_appoint_check_flag: boolean | null;
  planned_product1: string | null;
  planned_product2: string | null;
  planned_comment: string | null;
  result_date: string | null;
  result_start_time: string | null;
  result_end_time: string | null;
  result_duration: number | null;
  result_number_of_meeting_participants: number | null;
  result_presentation_product1: string | null;
  result_presentation_product2: string | null;
  result_presentation_product3: string | null;
  result_presentation_product4: string | null;
  result_presentation_product5: string | null;
  result_category: string | null;
  result_summary: string | null;
  result_negotiate_decision_maker: string | null;
  result_top_position_class: number | null;
  pre_meeting_participation_request: string | null;
  meeting_participation_request: string | null;
  meeting_business_office: string | null;
  meeting_department: string | null;
  meeting_member_name: string | null;
  meeting_year_month: number | null;
  //🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_unit_name: string | null;
  assigned_office_name: string | null;
  // 🌠面談時の商品グループと同席者グループ
  introduced_products_names: IntroducedProductsNames;
  attendees_info: AttendeesInfo;
  // 🌟面談予定の紹介予定商品1と2をproductsテーブルから
  // p1, p2のエイリアスを別に付けてそれぞれで商品名を取得
  planned_product_name1: string | null;
  planned_outside_short_name1: string | null;
  planned_inside_short_name1: string | null;
  planned_product_name2: string | null;
  planned_outside_short_name2: string | null;
  planned_inside_short_name2: string | null;
};
// 上画面の列選択した時に下画面に担当者情報を映す用のState
// 選択中の行データオブジェクト GridTableで取得した結合データ
// カレンダー用
export type ValidMeeting = {
  company_id: string;
  contact_id: string;
  meeting_id: string;
  company_name: string | null;
  contact_name: string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  company_email: string | null;
  number_of_employees_class: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  website_url: string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  budget_request_month1: string | null;
  budget_request_month2: string | null;
  clients: string | null;
  supplier: string | null;
  facility: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;

  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  contact_email: string | null;
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  contact_created_by_company_id: string | null;
  contact_created_by_user_id: string | null;
  contact_created_by_department_of_user: string | null;
  contact_created_by_unit_of_user: string | null;
  contact_created_by_office_of_user: string | null; //🌠追加
  call_careful_flag: boolean | null;
  call_careful_reason: string | null;
  email_ban_flag: boolean | null;
  sending_materials_ban_flag: boolean | null;
  fax_dm_ban_flag: boolean | null;
  ban_reason: string | null;
  claim: string | null;

  meeting_created_at: string;
  meeting_updated_at: string | null;
  meeting_created_by_company_id: string | null;
  meeting_created_by_user_id: string | null;
  meeting_created_by_department_of_user: string | null;
  meeting_created_by_unit_of_user: string | null;
  meeting_created_by_office_of_user: string | null; //🌠追加
  meeting_type: string | null;
  web_tool: string | null;
  planned_date: string;
  planned_start_time: string;
  planned_purpose: string | null;
  planned_duration: number | null;
  planned_appoint_check_flag: boolean | null;
  planned_product1: string | null;
  planned_product2: string | null;
  planned_comment: string | null;
  result_date: string | null;
  result_start_time: string | null;
  result_end_time: string | null;
  result_duration: number | null;
  result_number_of_meeting_participants: number | null;
  result_presentation_product1: string | null;
  result_presentation_product2: string | null;
  result_presentation_product3: string | null;
  result_presentation_product4: string | null;
  result_presentation_product5: string | null;
  result_category: string | null;
  result_summary: string | null;
  result_negotiate_decision_maker: string | null;
  result_top_position_class: number | null;
  pre_meeting_participation_request: string | null;
  meeting_participation_request: string | null;
  meeting_business_office: string | null;
  meeting_department: string | null;
  meeting_member_name: string | null;
  meeting_year_month: number | null;
  //🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_unit_name: string | null;
  assigned_office_name: string | null;
  // 🌠面談時の商品グループと同席者グループ
  introduced_products_names: IntroducedProductsNames;
  attendees_info: AttendeesInfo;
};
// 上画面の列選択した時に下画面に担当者情報を映す用のState
// 選択中の行データオブジェクト GridTableで取得した結合データ
export type Property_row_data = {
  company_id: string;
  contact_id: string;
  property_id: string;
  company_name: string | null;
  contact_name: string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  company_email: string | null;
  number_of_employees_class: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  website_url: string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  budget_request_month1: string | null;
  budget_request_month2: string | null;
  clients: string | null;
  supplier: string | null;
  facility: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;

  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  contact_email: string | null;
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  contact_created_by_company_id: string | null;
  contact_created_by_user_id: string | null;
  contact_created_by_department_of_user: string | null;
  contact_created_by_unit_of_user: string | null;
  contact_created_by_office_of_user: string | null; //🌠追加
  call_careful_flag: boolean | null;
  call_careful_reason: string | null;
  email_ban_flag: boolean | null;
  sending_materials_ban_flag: boolean | null;
  fax_dm_ban_flag: boolean | null;
  ban_reason: string | null;
  claim: string | null;

  property_created_at: string;
  property_updated_at: string | null;
  property_created_by_company_id: string | null;
  property_created_by_user_id: string | null;
  property_created_by_department_of_user: string | null;
  property_created_by_unit_of_user: string | null;
  property_created_by_office_of_user: string | null; //🌠追加
  client_contact_id: string | null;
  client_company_id: string | null;
  current_status: string | null;
  property_name: string | null;
  property_summary: string | null;
  pending_flag: boolean | null;
  rejected_flag: boolean | null;
  // product_name: string | null;
  expected_product_id: string | null;
  expected_product: string | null;
  product_sales: number | null;
  expected_order_date: string | null;
  // expected_sales_price: number | null;
  expected_sales_price: string | null;
  term_division: string | null;
  // sold_product_name: string | null;
  sold_product_id: string | null;
  sold_product: string | null;
  unit_sales: number | null;
  sales_contribution_category: string | null;
  // sales_price: number | null;
  sales_price: string | null;
  // discounted_price: number | null;
  discounted_price: string | null;
  // discount_rate: number | null;
  discount_rate: string | null;
  sales_class: string | null;
  expansion_date: string | null;
  sales_date: string | null;
  // expansion_quarter: string | null;
  // sales_quarter: string | null;
  expansion_quarter: number | null;
  sales_quarter: number | null;
  subscription_start_date: string | null;
  subscription_canceled_at: string | null;
  leasing_company: string | null;
  lease_division: string | null;
  lease_expiration_date: string | null;
  step_in_flag: boolean | null;
  repeat_flag: boolean | null;
  // order_certainty_start_of_month: string | null;
  // review_order_certainty: string | null;
  order_certainty_start_of_month: number | null;
  review_order_certainty: number | null;
  competitor_appearance_date: string | null;
  competitor: string | null;
  competitor_product: string | null;
  reason_class: string | null;
  reason_detail: string | null;
  // customer_budget: number | null;
  customer_budget: string | null;
  decision_maker_negotiation: string | null;
  expansion_year_month: number | null;
  sales_year_month: number | null;
  subscription_interval: string | null;
  competition_state: string | null;
  property_year_month: number | null;
  property_department: string | null;
  property_business_office: string | null;
  property_member_name: string | null;
  property_date: string | null;
  //🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_unit_name: string | null;
  assigned_office_name: string | null;
};

// 面談時の紹介した商品群の配列
export type QuotationProductsDetail = {
  quotation_product_id: string;
  product_name: string | null;
  outside_short_name: string | null;
  inside_short_name: string | null;
  unit_price: number | null;
  quotation_product_name: string | null;
  quotation_outside_short_name: string | null;
  quotation_inside_short_name: string | null;
  quotation_unit_price: number | null;
  quotation_product_priority: number | null;
};
export type QuotationProductsDetails = IntroducedProductsName[];

// 見積テーブル
export type Quotation_row_data = {
  company_id: string;
  contact_id: string;
  property_id: string;
  company_name: string | null;
  contact_name: string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  company_email: string | null;
  number_of_employees_class: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  website_url: string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  budget_request_month1: string | null;
  budget_request_month2: string | null;
  clients: string | null;
  supplier: string | null;
  facility: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;
  // 🔹contacts
  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  contact_email: string | null;
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  contact_created_by_company_id: string | null;
  contact_created_by_user_id: string | null;
  contact_created_by_department_of_user: string | null;
  contact_created_by_unit_of_user: string | null;
  contact_created_by_office_of_user: string | null; //🌠追加
  call_careful_flag: boolean | null;
  call_careful_reason: string | null;
  email_ban_flag: boolean | null;
  sending_materials_ban_flag: boolean | null;
  fax_dm_ban_flag: boolean | null;
  ban_reason: string | null;
  claim: string | null;
  // 🔹見積 quotations
  submission_class: string | null;
  quotation_date: string | null;
  expiration_date: string | null;
  deadline: string | null;
  delivery_place: string | null;
  payment_terms: string | null;
  quotation_division: string | null;
  sending_method: string | null;
  use_corporate_seal: boolean | null;
  quotation_notes: string | null;
  sales_tax_class: string | null;
  sales_tax_rate: string | null;
  total_price: string | null;
  discount_amount: string | null;
  discount_rate: string | null;
  discount_title: string | null;
  total_amount: string | null;
  quotation_remarks: string | null;
  set_item_count: number | null;
  set_unit_name: string | null;
  set_price: string | null;
  lease_period: number | null;
  lease_rate: string | null;
  lease_monthly_fee: string | null;
  // 見積関連情報
  // quotation_company_details_id: string | null;
  quotation_created_by_company_id: string | null;
  quotation_created_by_user_id: string | null;
  quotation_created_by_department_of_user: string | null;
  quotation_created_by_unit_of_user: string | null;
  quotation_created_by_office_of_user: string | null;
  destination_company_id: string | null;
  destination_contact_id: string | null;
  in_charge_stamp_id: string | null;
  in_charge_user_id: string | null;
  supervisor1_stamp_id: string | null;
  supervisor1_user_id: string | null;
  supervisor2_stamp_id: string | null;
  supervisor2_user_id: string | null;
  quotation_no_custom: string | null;
  quotation_no_system: string | null;
  quotation_member_name: string | null;
  quotation_year_month: number | null;
  quotation_title: string | null;
  // -- 🔹送付先会社
  destination_company_name: string | null;
  destination_company_department_name: string | null;
  destination_company_zipcode: string | null;
  destination_company_address: string | null;
  // -- 🔹送付先担当者
  destination_contact_name: string | null;
  destination_contact_direct_line: string | null;
  destination_contact_direct_fax: string | null;
  destination_contact_email: string | null;
  // -- 🔹印鑑
  in_charge_stamp_image_url: string | null;
  supervisor1_stamp_image_url: string | null;
  supervisor2_stamp_image_url: string | null;
  // -- 🔹印鑑ユーザー
  in_charge_user_name: string | null;
  supervisor1_user_name: string | null;
  supervisor2_user_name: string | null;
  //🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_unit_name: string | null;
  assigned_office_name: string | null;
  assigned_employee_id_name: string | null;
  // 🔹商品リスト
  quotation_products_details: QuotationProductsDetails;
};

export type NewSearchContact_CompanyParams = {
  "client_companies.name": string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  number_of_employees_class: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  website_url: string | null;
  // company_email: string | null;
  "client_companies.email": string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  budget_request_month1: string | null;
  budget_request_month2: string | null;
  clients: string | null;
  supplier: string | null;
  facility: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;

  "contacts.name": string | null;
  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  // contact_email: string | null;
  "contacts.email": string | null;
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  // created_by_company_id: string | null;
  "contacts.created_by_company_id": string | null;
  created_by_user_id: string | null;
};
// 検索時に下で条件入力した内容を上のrpc()のparamsに渡す用のstate
export type NewSearchActivity_Contact_CompanyParams = {
  "client_companies.name": string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  number_of_employees_class: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  website_url: string | null;
  // company_email: string | null;
  "client_companies.email": string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  budget_request_month1: string | null;
  budget_request_month2: string | null;
  clients: string | null;
  supplier: string | null;
  facility: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;

  "contacts.name": string | null;
  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  // contact_email: string | null;
  "contacts.email": string | null;
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  "contacts.created_by_company_id": string | null;
  "contacts.created_by_user_id": string | null;

  // created_at: string;
  // updated_at: string | null;
  "activities.created_by_company_id": string | null;
  "activities.created_by_user_id": string | null;
  "activities.created_by_department_of_user": string | null;
  "activities.created_by_unit_of_user": string | null;
  "activities.created_by_office_of_user": string | null; //🌠追加
  summary: string | null;
  scheduled_follow_up_date: string | null;
  follow_up_flag: boolean | null;
  document_url: string | null;
  activity_type: string | null;
  claim_flag: boolean | null;
  product_introduction1: string | null;
  product_introduction2: string | null;
  product_introduction3: string | null;
  product_introduction4: string | null;
  product_introduction5: string | null;
  business_office: string | null;
  member_name: string | null;
  priority: string | null;
  activity_date: string | null;
  department: string | null;
  activity_year_month: number | null;
};
// 面談サーチパラメータ用
export type NewSearchMeeting_Contact_CompanyParams = {
  "client_companies.name": string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  number_of_employees_class: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  website_url: string | null;
  // company_email: string | null;
  "client_companies.email": string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  budget_request_month1: string | null;
  budget_request_month2: string | null;
  clients: string | null;
  supplier: string | null;
  facility: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;

  "contacts.name": string | null;
  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  // contact_email: string | null;
  "contacts.email": string | null;
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  "contacts.created_by_company_id": string | null;
  "contacts.created_by_user_id": string | null;

  // created_at: string;
  // updated_at: string | null;
  "meetings.created_by_company_id": string | null;
  "meetings.created_by_user_id": string | null;
  "meetings.created_by_department_of_user": string | null;
  "meetings.created_by_unit_of_user": string | null;
  "meetings.created_by_office_of_user": string | null; //🌠追加
  meeting_type: string | null;
  web_tool: string | null;
  planned_date: string | null;
  planned_start_time: string | null;
  planned_purpose: string | null;
  planned_duration: number | null;
  planned_appoint_check_flag: boolean | null;
  planned_product1: string | null;
  planned_product2: string | null;
  planned_comment: string | null;
  result_date: string | null;
  result_start_time: string | null;
  result_end_time: string | null;
  result_duration: number | null;
  result_number_of_meeting_participants: number | null;
  result_presentation_product1: string | null;
  result_presentation_product2: string | null;
  result_presentation_product3: string | null;
  result_presentation_product4: string | null;
  result_presentation_product5: string | null;
  result_category: string | null;
  result_summary: string | null;
  result_negotiate_decision_maker: string | null;
  result_top_position_class: number | null;
  pre_meeting_participation_request: string | null;
  meeting_participation_request: string | null;
  meeting_business_office: string | null;
  meeting_department: string | null;
  meeting_member_name: string | null;
  meeting_year_month: number | null;
};

export type NewSearchProperty_Contact_CompanyParams = {
  "client_companies.name": string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  number_of_employees_class: string | null;
  // capital: string | null;
  capital: number | null;
  established_in: string | null;
  business_content: string | null;
  website_url: string | null;
  // company_email: string | null;
  "client_companies.email": string | null;
  industry_type: string | null;
  product_category_large: string | null;
  product_category_medium: string | null;
  product_category_small: string | null;
  fiscal_end_month: string | null;
  budget_request_month1: string | null;
  budget_request_month2: string | null;
  clients: string | null;
  supplier: string | null;
  facility: string | null;
  business_sites: string | null;
  overseas_bases: string | null;
  group_company: string | null;
  corporate_number: string | null;

  "contacts.name": string | null;
  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  // contact_email: string | null;
  "contacts.email": string | null;
  position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  position_class: number | null; //🌠変更オブジェクトマッピング
  occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  approval_amount: number | null;
  "contacts.created_by_company_id": string | null;
  "contacts.created_by_user_id": string | null;

  // created_at: string;
  // updated_at: string | null;
  "properties.created_by_company_id": string | null;
  "properties.created_by_user_id": string | null;
  "properties.created_by_department_of_user": string | null;
  "properties.created_by_unit_of_user": string | null;
  "properties.created_by_office_of_user": string | null; //🌠追加
  current_status: string | null;
  // property_name: string | null;
  property_name: string | null;
  property_summary: string | null;
  pending_flag: boolean | null;
  rejected_flag: boolean | null;
  // product_name: string | null;
  // expected_product_id: string | null;
  expected_product: string | null;
  product_sales: number | null;
  expected_order_date: string | null;
  // expected_sales_price: number | null;
  expected_sales_price: string | null;
  term_division: string | null;
  // sold_product_name: string | null;
  // sold_product_id: string | null;
  sold_product: string | null;
  unit_sales: number | null;
  sales_contribution_category: string | null;
  // sales_price: number | null;
  // discounted_price: number | null;
  // discount_rate: number | null;
  sales_price: string | null;
  discounted_price: string | null;
  discount_rate: string | null;
  sales_class: string | null;
  expansion_date: string | null;
  sales_date: string | null;
  // expansion_quarter: string | null;
  // sales_quarter: string | null;
  expansion_quarter: number | null;
  sales_quarter: number | null;
  subscription_start_date: string | null;
  subscription_canceled_at: string | null;
  leasing_company: string | null;
  lease_division: string | null;
  lease_expiration_date: string | null;
  step_in_flag: boolean | null;
  repeat_flag: boolean | null;
  // order_certainty_start_of_month: string | null;
  // review_order_certainty: string | null;
  order_certainty_start_of_month: number | null;
  review_order_certainty: number | null;
  competitor_appearance_date: string | null;
  competitor: string | null;
  competitor_product: string | null;
  reason_class: string | null;
  reason_detail: string | null;
  // customer_budget: number | null;
  customer_budget: string | null;
  decision_maker_negotiation: string | null;
  expansion_year_month: number | null;
  sales_year_month: number | null;
  subscription_interval: string | null;
  competition_state: string | null;
  property_year_month: number | null;
  property_department: string | null;
  property_business_office: string | null;
  property_member_name: string | null;
  property_date: string | null;
};

export type NewSearchQuotation_Contact_CompanyParams = {
  "client_companies.name": string | null;
  department_name: string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  zipcode: string | null;
  address: string | null;
  // number_of_employees_class: string | null;
  // capital: number | null;
  // established_in: string | null;
  // business_content: string | null;
  // website_url: string | null;
  // "client_companies.email": string | null;
  // industry_type: string | null;
  // product_category_large: string | null;
  // product_category_medium: string | null;
  // product_category_small: string | null;
  // fiscal_end_month: string | null;
  // budget_request_month1: string | null;
  // budget_request_month2: string | null;
  // clients: string | null;
  // supplier: string | null;
  // facility: string | null;
  // business_sites: string | null;
  // overseas_bases: string | null;
  // group_company: string | null;
  // corporate_number: string | null;

  "contacts.name": string | null;
  direct_line: string | null;
  direct_fax: string | null;
  extension: string | null;
  company_cell_phone: string | null;
  // personal_cell_phone: string | null;
  // contact_email: string | null;
  "contacts.email": string | null;
  // position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  // position_class: number | null; //🌠変更オブジェクトマッピング
  // occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  // approval_amount: number | null;
  "contacts.created_by_company_id": string | null;
  "contacts.created_by_user_id": string | null;

  // created_at: string;
  // updated_at: string | null;
  // 🔹見積テーブル
  "quotations.created_by_company_id": string | null;
  "quotations.created_by_user_id": string | null;
  "quotations.created_by_department_of_user": string | null;
  "quotations.created_by_unit_of_user": string | null;
  "quotations.created_by_office_of_user": string | null; //🌠追加
  // submission_class: string | null;
  quotation_date: string | null;
  expiration_date: string | null;
  // deadline: string | null;
  // delivery_place: string | null;
  // payment_terms: string | null;
  // quotation_division: string | null;
  // sending_method: string | null;
  // use_corporate_seal: boolean | null;
  // quotation_notes: string | null;
  // sales_tax_class: string | null;
  // sales_tax_rate: string | null;
  // total_price: string | null;
  // discount_amount: string | null;
  // discount_rate: string | null;
  // discount_title: string | null;
  // total_amount: string | null;
  // quotation_remarks: string | null;
  // set_item_count: number | null;
  // set_unit_name: string | null;
  // set_price: string | null;
  // lease_period: number | null;
  // lease_rate: string | null;
  // lease_monthly_fee: string | null;
  // 見積関連情報
  quotation_no_custom: string | null;
  quotation_no_system: string | null;
  quotation_department: string | null;
  quotation_business_office: string | null;
  quotation_member_name: string | null;
  quotation_year_month: number | null;
  quotation_title: string | null;
  // 社員番号
  employee_id_name: string | null;
};

// 活動 activitiesテーブル
export type Activity = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null; //🌠追加
  client_contact_id: string | null;
  client_company_id: string | null;
  summary: string | null;
  scheduled_follow_up_date: string | null;
  follow_up_flag: boolean | null;
  document_url: string | null;
  activity_type: string | null;
  claim_flag: boolean | null;
  product_introduction1: string | null;
  product_introduction2: string | null;
  product_introduction3: string | null;
  product_introduction4: string | null;
  product_introduction5: string | null;
  business_office: string | null;
  member_name: string | null;
  priority: string | null;
  activity_date: string | null;
  department: string | null;
  meeting_id: string | null;
  activity_year_month: number | null;
  property_id: string | null;
  quotation_id: string | null;
};

// 面談 meetingテーブル
export type Meeting = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null; //🌠追加
  client_contact_id: string | null;
  client_company_id: string | null;
  meeting_type: string | null;
  web_tool: string | null;
  planned_date: string | null;
  planned_start_time: string | null;
  planned_purpose: string | null;
  planned_duration: number | null;
  planned_appoint_check_flag: boolean | null;
  planned_product1: string | null;
  planned_product2: string | null;
  planned_comment: string | null;
  result_date: string | null;
  result_start_time: string | null;
  result_end_time: string | null;
  result_duration: number | null;
  result_number_of_meeting_participants: number | null;
  result_presentation_product1: string | null;
  result_presentation_product2: string | null;
  result_presentation_product3: string | null;
  result_presentation_product4: string | null;
  result_presentation_product5: string | null;
  result_category: string | null;
  result_summary: string | null;
  result_negotiate_decision_maker: string | null;
  result_top_position_class: number | null;
  pre_meeting_participation_request: string | null;
  meeting_participation_request: string | null;
  meeting_business_office: string | null;
  meeting_department: string | null;
  meeting_member_name: string | null;
  meeting_year_month: number | null;
};

// 製品 productsテーブル
export type Product = {
  id: string;
  created_at: string;
  updated_at: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null; //🌠追加
  product_name: string | null;
  inside_short_name: string | null;
  outside_short_name: string | null;
  unit_price: number | null; //numericなので数値でOK Decimalおw使う場合はstringでもOK
  // unit_price: string | null; //numericなのでstringでDecimalで扱う
};
export type EditedProduct = {
  id: string;
  created_at: string;
  updated_at: string | null;
  created_by_company_id: string;
  created_by_user_id: string;
  created_by_department_of_user: string;
  created_by_unit_of_user: string;
  created_by_office_of_user: string; //🌠追加
  product_name: string;
  inside_short_name: string;
  outside_short_name: string;
  // unit_price: number | null;
  unit_price: string; //編集時はテキストで編集して保存時にnumber型に変換する
  // unit_price: string;
};
// 事業部リストテーブル
export type Department = {
  id: string;
  created_at: string;
  created_by_company_id: string | null;
  department_name: string | null;
};
// 係・ユニットリストテーブル
export type Unit = {
  id: string;
  created_at: string;
  created_by_company_id: string | null;
  created_by_department_id: string | null;
  unit_name: string | null;
};
// 事業所・営業所リストテーブル
export type Office = {
  id: string;
  created_at: string;
  created_by_company_id: string | null;
  office_name: string | null;
};
export type Employee_id = {
  id: string;
  created_at: string;
  created_by_company_id: string | null;
  to_user_id: string | null;
  employee_id_name: string | null;
};

// 案件・物件 propertiesテーブル
export type Property = {
  id: string;
  created_at: string;
  updated_at: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null; //🌠追加
  client_contact_id: string | null;
  client_company_id: string | null;
  current_status: string | null;
  property_name: string | null;
  property_summary: string | null;
  pending_flag: boolean | null;
  rejected_flag: boolean | null;
  // product_name: string | null;
  expected_product_id: string | null;
  expected_product: string | null;
  product_sales: number | null; //🌟変更
  expected_order_date: string | null;
  // expected_sales_price: number | null;
  expected_sales_price: string | null;
  term_division: string | null;
  // sold_product_name: string | null;
  sold_product_id: string | null;
  sold_product: string | null;
  unit_sales: number | null;
  sales_contribution_category: string | null;
  // sales_price: number | null;
  // discounted_price: number | null;
  // discount_rate: number | null;
  sales_price: string | null;
  discounted_price: string | null;
  discount_rate: string | null;
  sales_class: string | null;
  expansion_date: string | null;
  sales_date: string | null;
  // expansion_quarter: string | null;
  // sales_quarter: string | null;
  expansion_quarter: number | null;
  sales_quarter: number | null;
  subscription_start_date: string | null;
  subscription_canceled_at: string | null;
  leasing_company: string | null;
  lease_division: string | null;
  lease_expiration_date: string | null;
  step_in_flag: boolean | null;
  repeat_flag: boolean | null;
  // order_certainty_start_of_month: string | null;
  // review_order_certainty: string | null;
  order_certainty_start_of_month: number | null;
  review_order_certainty: number | null;
  competitor_appearance_date: string | null;
  competitor: string | null;
  competitor_product: string | null;
  reason_class: string | null;
  reason_detail: string | null;
  // customer_budget: number | null;
  customer_budget: string | null;
  decision_maker_negotiation: string | null;
  expansion_year_month: number | null;
  sales_year_month: number | null;
  subscription_interval: string | null;
  competition_state: string | null;
  property_year_month: number | null;
  property_department: string | null;
  property_business_office: string | null;
  property_member_name: string | null;
  property_date: string | null;
};

// モーダルのサイズ(ツールチップ計算用)
export type SettingModalProperties = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

// 面談結果保存payload用 meeting, products, attendeesテーブル
export type ResultMeetingWithProductsAttendees = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null; //🌠追加
  client_contact_id: string | null;
  client_company_id: string | null;
  meeting_type: string | null;
  web_tool: string | null;
  planned_date: string | null;
  planned_start_time: string | null;
  planned_purpose: string | null;
  planned_duration: number | null;
  planned_appoint_check_flag: boolean | null;
  planned_product1: string | null;
  planned_product2: string | null;
  planned_comment: string | null;
  result_date: string | null;
  result_start_time: string | null;
  result_end_time: string | null;
  result_duration: number | null;
  result_number_of_meeting_participants: number | null;
  result_presentation_product1: string | null;
  result_presentation_product2: string | null;
  result_presentation_product3: string | null;
  result_presentation_product4: string | null;
  result_presentation_product5: string | null;
  result_category: string | null;
  result_summary: string | null;
  result_negotiate_decision_maker: string | null;
  result_top_position_class: number | null;
  pre_meeting_participation_request: string | null;
  meeting_participation_request: string | null;
  meeting_business_office: string | null;
  meeting_department: string | null;
  meeting_member_name: string | null;
  meeting_year_month: number | null;
  // 実施商品テーブル用と、同席者テーブル用
  product_ids: (string | null)[];
  attendee_ids: (string | null)[];
  // 紹介済み商品配列と同席者配列で削除が必要な個数
  delete_product_count: number | null;
  delete_attendee_count: number | null;
};

// 見積テーブル
export type Quotation = {
  id: string;
  created_at: string;
  updated_at: string | null;
  submission_class: string | null;
  quotation_date: string | null;
  expiration_date: string | null;
  deadline: string | null;
  delivery_place: string | null;
  payment_terms: string | null;
  quotation_division: string | null;
  sending_method: string | null;
  use_corporate_seal: boolean | null;
  quotation_notes: string | null;
  sales_tax_class: string | null;
  sales_tax_rate: string | null;
  total_price: string | null;
  discount_amount: string | null;
  discount_rate: string | null;
  discount_title: string | null;
  total_amount: string | null;
  quotation_remarks: string | null;
  set_item_count: number | null;
  set_unit_name: string | null;
  set_price: string | null;
  lease_period: number | null;
  lease_rate: string | null;
  lease_monthly_fee: string | null;
  // 紐付け関連情報
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null;
  client_company_id: string | null;
  client_contact_id: string | null;
  destination_company_id: string | null;
  destination_contact_id: string | null;
  in_charge_stamp_id: string | null;
  in_charge_user_id: string | null;
  supervisor1_stamp_id: string | null;
  supervisor1_user_id: string | null;
  supervisor2_stamp_id: string | null;
  supervisor2_user_id: string | null;
  quotation_no_custom: string | null;
  quotation_no_system: string | null;
  quotation_member_name: string | null;
  quotation_business_office: string | null;
  quotation_department: string | null;
  quotation_year_month: number | null;
  quotation_title: string | null;
};

// 見積INSERT保存payload用 quotation, quotation_productsテーブル
export type QuotationWithProducts = {
  id: string;
  created_at: string;
  updated_at: string | null;
  submission_class: string | null;
  quotation_date: string | null;
  expiration_date: string | null;
  deadline: string | null;
  delivery_place: string | null;
  payment_terms: string | null;
  quotation_division: string | null;
  sending_method: string | null;
  use_corporate_seal: boolean | null;
  quotation_notes: string | null;
  sales_tax_class: string | null;
  sales_tax_rate: string | null;
  total_price: string | null;
  discount_amount: string | null;
  discount_rate: string | null;
  discount_title: string | null;
  total_amount: string | null;
  quotation_remarks: string | null;
  set_item_count: number | null;
  set_unit_name: string | null;
  set_price: string | null;
  lease_period: number | null;
  lease_rate: string | null;
  lease_monthly_fee: string | null;
  // 紐付け関連情報
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null;
  client_company_id: string | null;
  client_contact_id: string | null;
  destination_company_id: string | null;
  destination_contact_id: string | null;
  in_charge_stamp_id: string | null;
  in_charge_user_id: string | null;
  supervisor1_stamp_id: string | null;
  supervisor1_user_id: string | null;
  supervisor2_stamp_id: string | null;
  supervisor2_user_id: string | null;
  quotation_no_custom: string | null;
  quotation_no_system: string | null;
  quotation_member_name: string | null;
  quotation_business_office: string | null;
  quotation_department: string | null;
  quotation_year_month: number | null;
  quotation_title: string | null;
  // 実施商品テーブル用と、同席者テーブル用
  product_ids: (string | null)[];
  // 紹介済み商品配列と同席者配列で削除が必要な個数
  delete_product_count: number | null;
};
