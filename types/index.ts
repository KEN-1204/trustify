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
  content4?: string | null;
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
  section: string | null;
  unit: string | null;
  usage: string | null;
  purpose_of_use: string | null;
  target_type: string | null; // 🌠追加 売上目標に追加するか否か デフォルト値はsales_target
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
  created_by_section_of_user?: string | null;
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
  // industry_type?: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  street_address: string | null;
  building_name: string | null;
  // ここまで
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
  created_by_section_of_user?: string | null;
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
  // industry_type?: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  street_address: string | null;
  building_name: string | null;
  // ここまで
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  section: string | null;
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
  section: string | null;
  usage: string | null;
  purpose_of_use: string | null;
  // 🔹companiesテーブル
  company_id: string | null;
  company_created_at: string | null;
  company_updated_at: string | null;
  logo_url: string | null;
  customer_seal_url: string | null;
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
  customer_closing_days: number[];
  customer_fiscal_year_basis: string; // firstDayBasis or endDayBasis
  // 🔹subscribed_accountsテーブル
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
  target_type: string | null; // 🌠追加 売上目標に追加するか否か デフォルト値はsales_target
  // 事業部、課、係、事業所、社員番号
  assigned_department_id: string | null;
  assigned_department_name: string | null;
  assigned_section_id: string | null;
  assigned_section_name: string | null;
  assigned_unit_id: string | null;
  assigned_unit_name: string | null;
  assigned_office_id: string | null;
  assigned_office_name: string | null;
  assigned_employee_id: string | null;
  assigned_employee_id_name: string | null;
  // 印鑑データ
  assigned_signature_stamp_id: string | null;
  assigned_signature_stamp_url: string | null;
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
// section: string | null;
//   usage: string | null;
//   purpose_of_use: string | null;
//   subscribed_account_id: string | null;
//   account_created_at: string | null;
//   account_company_role: string | null;
//   account_state: string | null;
//   account_invited_email: string | null;
// };
// profilesとsubscribed_accountsの外部結合データ
// 部署、係、事業所、社員番号ありvar
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
  section: string | null;
  unit: string | null;
  usage: string | null;
  purpose_of_use: string | null;
  target_type: string | null; // 🌠追加 売上目標に追加するか否か デフォルト値はsales_target
  subscribed_account_id: string | null;
  account_created_at: string | null;
  account_company_role: string | null;
  account_state: string | null;
  account_invited_email: string | null;
  // 事業部、課、係、事業所、社員番号
  assigned_department_id: string | null;
  assigned_department_name: string | null;
  assigned_section_id: string | null;
  assigned_section_name: string | null;
  assigned_unit_id: string | null;
  assigned_unit_name: string | null;
  assigned_office_id: string | null;
  assigned_office_name: string | null;
  assigned_employee_id: string | null;
  assigned_employee_id_name: string | null;
  // 印鑑データ
  assigned_signature_stamp_id: string | null;
  assigned_signature_stamp_url: string | null;
};

// データ節約ver MemberAccounts ネタ表ボード
export type MemberAccountsDealBoard = {
  id: string;
  avatar_url: string | null;
  email: string | null;
  profile_name: string | null;
  position_name: string | null;
  account_company_role: string | null;
  // 事業部、課、係、事業所、社員番号
  assigned_department_id: string | null;
  assigned_department_name: string | null;
  assigned_section_id: string | null;
  assigned_section_name: string | null;
  assigned_unit_id: string | null;
  assigned_unit_name: string | null;
  assigned_office_id: string | null;
  assigned_office_name: string | null;
  assigned_employee_id: string | null;
  assigned_employee_id_name: string | null;
  // 印鑑データ
  assigned_signature_stamp_id: string | null;
  assigned_signature_stamp_url: string | null;
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
  created_by_section_of_user: string | null;
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null;
  initial_client_company_name: string | null;
  initial_client_company_address: string | null;
  initial_client_company_main_phone_number: string | null;
  initial_client_company_department_name: string | null;
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
  created_by_section_of_user: string | null;
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
  company_department_name: string | null;
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  created_by_section_of_user: string | null;
  created_by_unit_of_user: string | null;
  created_by_office_of_user: string | null;
  call_careful_flag: boolean | null;
  call_careful_reason: string | null;
  email_ban_flag: boolean | null;
  sending_materials_ban_flag: boolean | null;
  fax_dm_ban_flag: boolean | null;
  ban_reason: string | null;
  claim: string | null;
  // 削除時の復旧プレイスホルダー
  initial_client_company_name: string | null;
  initial_client_company_address: string | null;
  initial_client_company_main_phone_number: string | null;
  initial_client_company_department_name: string | null;
  // 🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_section_name: string | null;
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
  // department_name: string | null;
  company_department_name: string | null;
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  contact_created_by_section_of_user: string | null;
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
  activity_created_by_section_of_user: string | null;
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
  // 年月度
  activity_year_month: number | null;
  // 年度〜四半期
  activity_quarter: number | null;
  activity_half_year: number | null;
  activity_fiscal_year: number | null;
  //
  meeting_id: string | null;
  property_id: string | null;
  quotation_id: string | null;
  //🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_section_name: string | null;
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
  // department_name: string | null;
  company_department_name: string | null;
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  contact_created_by_section_of_user: string | null;
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
  meeting_created_by_section_of_user: string | null;
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
  meeting_quarter: number | null;
  meeting_half_year: number | null;
  meeting_fiscal_year: number | null;
  //🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_section_name: string | null;
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
  company_department_name: string | null;
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  contact_created_by_section_of_user: string | null;
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
  meeting_created_by_section_of_user: string | null;
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
  meeting_quarter: number | null;
  meeting_half_year: number | null;
  meeting_fiscal_year: number | null;
  //🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_section_name: string | null;
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
export type Property_row_data = {
  company_id: string;
  contact_id: string;
  property_id: string;
  company_name: string | null;
  contact_name: string | null;
  // department_name: string | null;
  company_department_name: string | null;
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  contact_created_by_section_of_user: string | null;
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
  property_created_by_section_of_user: string | null;
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
  // 🔹年度・半期・四半期・月度関連
  // 日付
  property_date: string | null;
  expansion_date: string | null;
  sales_date: string | null;
  expected_order_date: string | null;
  // 年月度(会計基準の)
  property_year_month: number | null;
  expansion_year_month: number | null;
  sales_year_month: number | null;
  expected_order_year_month: number | null;
  // 四半期(会計基準の)
  property_quarter: number | null; // 🌠追加
  expansion_quarter: number | null;
  sales_quarter: number | null;
  expected_order_quarter: number | null;
  // 半期(会計基準の)
  property_half_year: number | null; // 🌠追加
  expansion_half_year: number | null; // 🌠追加
  sales_half_year: number | null; // 🌠追加
  expected_order_half_year: number | null; // 🌠追加
  // 年度(会計基準の)
  property_fiscal_year: number | null; // 🌠追加
  expansion_fiscal_year: number | null; // 🌠追加
  sales_fiscal_year: number | null; // 🌠追加
  expected_order_fiscal_year: number | null; // 🌠追加
  // 🔹年度・半期・四半期・月度関連ここまで
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
  subscription_interval: string | null;
  competition_state: string | null;
  property_department: string | null;
  property_business_office: string | null;
  property_member_name: string | null;
  //🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_section_name: string | null;
  assigned_unit_name: string | null;
  assigned_office_name: string | null;
};

export type NewSearchContact_CompanyParams = {
  "client_companies.name": string | null;
  "client_companies.department_name": string | null;
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  "client_companies.department_name": string | null;
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  "activities.created_by_section_of_user": string | null;
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
  // 年月度
  activity_year_month: number | null;
  activity_quarter: number | null;
  activity_half_year: number | null;
  activity_fiscal_year: number | null;
  // 条件検索用のパラメータには年度〜四半期は入れず
};
// 面談サーチパラメータ用
export type NewSearchMeeting_Contact_CompanyParams = {
  "client_companies.name": string | null;
  "client_companies.department_name": string | null;
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  "meetings.created_by_section_of_user": string | null;
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
  // 年月度〜年度
  meeting_year_month: number | null;
  meeting_quarter: number | null;
  meeting_half_year: number | null;
  meeting_fiscal_year: number | null;
};

export type NewSearchProperty_Contact_CompanyParams = {
  "client_companies.name": string | null;
  "client_companies.department_name": string | null;
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  "properties.created_by_section_of_user": string | null;
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
  // 日付(カレンダー)
  property_date: string | null;
  expansion_date: string | null;
  sales_date: string | null;
  expected_order_date: string | null;
  // 年月度(会計基準の)
  property_year_month: number | null;
  expansion_year_month: number | null;
  sales_year_month: number | null;
  expected_order_year_month: number | null; // 🌠追加
  // 四半期(会計基準の)
  property_quarter: number | null; // 🌠追加
  expansion_quarter: number | null;
  sales_quarter: number | null;
  expected_order_quarter: number | null; // 🌠追加
  // 半期(会計基準の)
  property_half_year: number | null; // 🌠追加
  expansion_half_year: number | null; // 🌠追加
  sales_half_year: number | null; // 🌠追加
  expected_order_half_year: number | null; // 🌠追加
  // 年度(会計基準の)
  property_fiscal_year: number | null; // 🌠追加
  expansion_fiscal_year: number | null; // 🌠追加
  sales_fiscal_year: number | null; // 🌠追加
  expected_order_fiscal_year: number | null; // 🌠追加

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
  subscription_interval: string | null;
  competition_state: string | null;
  property_department: string | null;
  property_business_office: string | null;
  property_member_name: string | null;
};

// 活動 activitiesテーブル
export type Activity = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_section_of_user: string | null;
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
  // 年月度
  activity_year_month: number | null;
  // 年度〜四半期
  activity_quarter: number | null;
  activity_half_year: number | null;
  activity_fiscal_year: number | null;
  //
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
  created_by_section_of_user: string | null;
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
  // 年度〜年月度
  meeting_year_month: number | null;
  meeting_quarter: number | null;
  meeting_half_year: number | null;
  meeting_fiscal_year: number | null;
};

// 製品 productsテーブル
export type Product = {
  id: string;
  created_at: string;
  updated_at: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_section_of_user: string | null;
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
  // updated_at: string | null;
  created_by_company_id: string;
  created_by_user_id: string;
  created_by_department_of_user: string;
  created_by_section_of_user: string;
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
  target_type: string | null; // 🌠追加 売上目標に追加するか否か デフォルト値はsales_target
};
// 課・セクションリストテーブル
export type Section = {
  id: string;
  created_at: string;
  created_by_company_id: string | null;
  created_by_department_id: string | null;
  section_name: string | null;
  target_type: string | null; // 🌠追加 売上目標に追加するか否か デフォルト値はsales_target
};
// 係・ユニットリストテーブル
export type Unit = {
  id: string;
  created_at: string;
  created_by_company_id: string | null;
  created_by_department_id: string | null;
  created_by_section_id: string | null;
  unit_name: string | null;
  target_type: string | null; // 🌠追加 売上目標に追加するか否か デフォルト値はsales_target
};
// 事業所・営業所リストテーブル
export type Office = {
  id: string;
  created_at: string;
  created_by_company_id: string | null;
  office_name: string | null;
  target_type: string | null; // 🌠追加 売上目標に追加するか否か デフォルト値はsales_target
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
  created_by_section_of_user: string | null;
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
  // 🔹年度・半期・四半期・月度関連
  // 日付(カレンダー)
  property_date: string | null;
  expansion_date: string | null;
  sales_date: string | null;
  expected_order_date: string | null; // 🌠追加
  // 年月度(会計基準の)
  property_year_month: number | null;
  expansion_year_month: number | null;
  sales_year_month: number | null;
  expected_order_year_month: number | null;
  // 四半期(会計基準の)
  property_quarter: number | null; // 🌠追加
  expansion_quarter: number | null;
  sales_quarter: number | null;
  expected_order_quarter: number | null;
  // 半期(会計基準の)
  property_half_year: number | null; // 🌠追加
  expansion_half_year: number | null; // 🌠追加
  sales_half_year: number | null; // 🌠追加
  expected_order_half_year: number | null; // 🌠追加
  // 年度(会計基準の)
  property_fiscal_year: number | null; // 🌠追加
  expansion_fiscal_year: number | null; // 🌠追加
  sales_fiscal_year: number | null; // 🌠追加
  expected_order_fiscal_year: number | null; // 🌠追加
  // 🔹年度・半期・四半期・月度関連ここまで
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
  subscription_interval: string | null;
  competition_state: string | null;
  property_department: string | null;
  property_business_office: string | null;
  property_member_name: string | null;
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
  created_by_section_of_user: string | null;
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
  // 年度〜年月度
  meeting_year_month: number | null;
  meeting_quarter: number | null;
  meeting_half_year: number | null;
  meeting_fiscal_year: number | null;
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
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_section_of_user: string | null;
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
  // 年月度〜年度
  quotation_year_month: number | null;
  quotation_quarter: number | null;
  quotation_half_year: number | null;
  quotation_fiscal_year: number | null;
  //
  quotation_title: string | null;
  in_charge_stamp_flag: boolean | null;
  supervisor1_stamp_flag: boolean | null;
  supervisor2_stamp_flag: boolean | null;
  in_charge_stamp_name: string | null;
  supervisor1_stamp_name: string | null;
  supervisor2_stamp_name: string | null;
};

// 見積商品リストテーブル
export type QuotationProducts = {
  id: string;
  created_at: string;
  updated_at: string | null;
  quotation_product_name: string | null;
  quotation_product_inside_short_name: string | null;
  quotation_product_outside_short_name: string | null;
  // quotation_product_unit_price: string | null;
  // quotation_product_quantity: string | null;
  // priority: string | null;
  quotation_product_unit_price: number | null;
  quotation_product_quantity: number | null;
  priority: number | null;
  quotation_id: string | null;
  product_id: string | null;
};

// 顧客会社とクライアント会社の結合テーブル(見積ルール)
export type CustomersClients = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  customer_company_id: string | null;
  client_company_id: string | null;
  quotation_rule: string | null;
};

// 印鑑データ
export type SignatureStamp = {
  id: string;
  created_at: string | null;
  updated_at: string | null;
  image_url: string | null;
  kanji: string | null;
  furigana: string | null;
  romaji: string | null;
};
// 印鑑データオブジェクト SettingProfileで使用
export type StampObj = {
  signature_stamp_id: string | null;
  signature_stamp_url: string | null;
};

// 送付先 会社・担当者
export type Destination = {
  // 🔹送付先会社
  destination_company_id: string | null;
  destination_company_name: string | null;
  destination_company_department_name: string | null;
  destination_company_zipcode: string | null;
  destination_company_address: string | null;
  // 🔹送付先担当者
  destination_contact_id: string | null;
  destination_contact_name: string | null;
  destination_contact_direct_line: string | null;
  destination_contact_direct_fax: string | null;
  destination_contact_email: string | null;
};

// 商品リストの選択中のセルの列と行
export type EditPosition = { row: number | null; col: number | null };

// 見積商品リストの配列 (取得、UPSERT用)
export type QuotationProductsDetail = {
  // quotation_product_id: string; // quotation_products.id // quotation_product_idはDBから取得してもユーザーが商品を削除して再度追加した場合nullになり追うことはできないため、商品idと見積idの組み合わせの一意性を確認してUPSERTを行う
  product_id: string; // products.id
  product_name: string | null;
  outside_short_name: string | null;
  inside_short_name: string | null;
  unit_price: number | null;
  product_created_by_user_id: string | null;
  product_created_by_company_id: string | null;
  product_created_by_department_of_user: string | null;
  product_created_by_section_of_user: string | null;
  product_created_by_unit_of_user: string | null;
  product_created_by_office_of_user: string | null;
  quotation_product_name: string | null;
  quotation_product_outside_short_name: string | null;
  quotation_product_inside_short_name: string | null;
  quotation_product_unit_price: number | null;
  quotation_product_quantity: number | null;
  quotation_product_priority: number | null;
};
export type QuotationProductsDetails = QuotationProductsDetail[];

// 見積テーブル
export type Quotation_row_data = {
  company_id: string;
  contact_id: string;
  quotation_id: string;
  company_name: string | null;
  contact_name: string | null;
  // department_name: string | null;
  company_department_name: string | null;
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
  // industry_type: string | null;
  // 🔹〜別売上用 業界別、国別、都道府県別、市区町村別
  industry_type_id?: number | null;
  country_id?: number | null;
  region_id?: number | null;
  city_id?: number | null;
  // ここまで
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
  contact_created_by_section_of_user: string | null;
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
  quotation_created_by_section_of_user: string | null;
  quotation_created_by_unit_of_user: string | null;
  quotation_created_by_office_of_user: string | null;
  destination_company_id: string | null;
  destination_contact_id: string | null;
  in_charge_stamp_name: string | null;
  in_charge_stamp_flag: boolean | null;
  in_charge_stamp_id: string | null;
  in_charge_user_id: string | null;
  supervisor1_stamp_name: string | null;
  supervisor1_stamp_flag: boolean | null;
  supervisor1_stamp_id: string | null;
  supervisor1_user_id: string | null;
  supervisor2_stamp_name: string | null;
  supervisor2_stamp_flag: boolean | null;
  supervisor2_stamp_id: string | null;
  supervisor2_user_id: string | null;
  quotation_no_custom: string | null;
  quotation_no_system: string | null;
  quotation_department: string | null;
  quotation_business_office: string | null;
  quotation_member_name: string | null;
  // 年月度〜年度
  quotation_year_month: number | null;
  quotation_quarter: number | null;
  quotation_half_year: number | null;
  quotation_fiscal_year: number | null;
  //
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
  // -- 🔹印鑑ユーザー(profilesテーブル)
  in_charge_user_name: string | null;
  supervisor1_user_name: string | null;
  supervisor2_user_name: string | null;
  //🌠追加 事業部、係、事業所
  assigned_department_name: string | null;
  assigned_section_name: string | null;
  assigned_unit_name: string | null;
  assigned_office_name: string | null;
  assigned_employee_id_name: string | null;
  // 🔹商品リスト
  quotation_products_details: QuotationProductsDetails;
  // 🔹見積ルール customers_clients結合テーブル
  quotation_rule: string | null;
};

// 見積 サーチパラメータ
export type NewSearchQuotation_Contact_CompanyParams = {
  // 🔹依頼元 client_companiesテーブル
  "cc.name": string | null;
  "cc.department_name": string | null;
  main_phone_number: string | null;
  main_fax: string | null;
  "cc.zipcode": string | null;
  "cc.address": string | null;
  // 🔹送付先 cc_destinationテーブル
  "cc_destination.name": string | null;
  "cc_destination.department_name": string | null;
  "cc_destination.zipcode": string | null;
  "cc_destination.address": string | null;
  // number_of_employees_class: string | null;
  // capital: number | null;
  // established_in: string | null;
  // business_content: string | null;
  // website_url: string | null;
  // "cc.email": string | null;
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
  // 🔹依頼元contactsテーブル
  "c.name": string | null;
  "c.direct_line": string | null;
  "c.direct_fax": string | null;
  extension: string | null;
  company_cell_phone: string | null;
  // personal_cell_phone: string | null;
  // contact_email: string | null;
  "c.email": string | null;
  // 🔹送付先c_destinationテーブル
  "c_destination.name": string | null;
  "c_destination.direct_line": string | null;
  "c_destination.direct_fax": string | null;
  "c_destination.email": string | null;
  // 送付先ここまで
  // position_name: string | null;
  // position_class: string | null;
  // occupation: string | null;
  // position_class: number | null; //🌠変更オブジェクトマッピング
  // occupation: number | null; //🌠変更オブジェクトマッピング
  // approval_amount: string | null;
  // approval_amount: number | null;
  "c.created_by_company_id": string | null;
  // "c.created_by_user_id": string | null;

  // created_at: string;
  // updated_at: string | null;
  // 🔹見積テーブル
  "q.created_by_company_id": string | null;
  "q.created_by_user_id": string | null;
  "q.created_by_department_of_user": string | null;
  "q.created_by_section_of_user": string | null;
  "q.created_by_unit_of_user": string | null;
  "q.created_by_office_of_user": string | null; //🌠追加
  // submission_class: string | null;
  quotation_date: string | null;
  expiration_date: string | null;
  // deadline: string | null;
  // delivery_place: string | null;
  // payment_terms: string | null;
  quotation_division: string | null;
  // sending_method: string | null;
  // use_corporate_seal: boolean | null;
  quotation_notes: string | null;
  // sales_tax_class: string | null;
  // sales_tax_rate: string | null;
  // total_price: string | null;
  // discount_amount: string | null;
  // discount_rate: string | null;
  // discount_title: string | null;
  // total_amount: string | null;
  quotation_remarks: string | null;
  // set_item_count: number | null;
  // set_unit_name: string | null;
  // set_price: string | null;
  // lease_period: number | null;
  // lease_rate: string | null;
  // lease_monthly_fee: string | null;
  // 見積関連情報
  quotation_no_custom: string | null;
  quotation_no_system: string | null;
  // quotation_department: string | null;
  // quotation_business_office: string | null;
  quotation_member_name: string | null;
  // 年月度のみパラメータに渡す
  quotation_year_month: number | null;
  quotation_quarter: number | null;
  quotation_half_year: number | null;
  quotation_fiscal_year: number | null;
  quotation_title: string | null;
  // 担当印 担当者名
  "q.in_charge_stamp_name": string | null;
  // 担当印 社員番号
  "e.employee_id_name": string | null;
  // employee_id_name: string | null;
};

// 市区町村
export type Cities = {
  city_id: number;
  created_at: string;
  updated_at: string | null;
  city_name_ja: string | null;
  city_name_en: string | null;
  city_code_jp: number | null;
  region_id: number | null;
  country_id: number | null;
};

// 営業カレンダーの各日付
export type CustomerBusinessCalendars = {
  id: string;
  created_at: string;
  updated_at: string | null;
  customer_id: string | null;
  date: string | null;
  day_of_week: number | null;
  status: string | null;
  working_hours: number | null;
};

// 各会計年度別の定休日の適用状況・ステータス
export type StatusClosingDays = { fiscal_year: number; applied_closing_days: number[]; updated_at: number | null };

// ---------------- ネタ表(トレロボード) ----------------

// export type ColumnProps = {
//   title: string;
//   headingColor: string;
//   column: string;
//   cards: CardType[];
//   setCards: Dispatch<SetStateAction<CardType[]>>;
// };

export type CardType = { id: string; taskTitle: string; contents: string | null; columnTitle: string };

// export type EditedCard = { columnTitle: string; card: CardType } | null;
export type EditedCard = CardType | null;

// export type DealCardType = {
//   property_id: string;
//   company_name: string; // 会社名
//   company_department_name: string | null; // 部署名
//   column_title_num: number; // 月初確度 or 中間確度 中間確度があればこちらを優先
//   expansion_year_month: number; // 展開日付 => 当月発生の場合はネタ外として扱う
//   rejected_flag: boolean; // 物件没フラグ => 没の場合は、その確度の最後尾に並べて、斜線を引きdraggableをfalseにする
//   pending_flag: boolean; // 物件没フラグ => 没の場合は、その確度の最後尾に並べて、斜線を引きdraggableをfalseにする
// };
export type DealCardType = Property_row_data & {
  column_title_num: number; // 月初確度 or 中間確度 中間確度があればこちらを優先
};

export type SelectedDealCard = {
  ownerId: string;
  dealCard: DealCardType;
} | null;

// export type ThemeColorSDB =
//   | "theme-brand-f"
//   | "theme-brand-f-gradient"
//   | "theme-black-gradient"
//   | "theme-simple12"
//   | "theme-simple17";

// SDB セクション関連
export type SectionMenuParams = {
  // e: React.MouseEvent<HTMLElement, MouseEvent>;
  e: React.MouseEvent<HTMLElement, globalThis.MouseEvent | MouseEvent>;
  title: string;
  displayX?: string;
  maxWidth?: number;
  minWidth?: number;
  fadeType?: string;
};

export type PopupDescMenuParams = {
  // e: React.MouseEvent<HTMLElement, MouseEvent>;
  e: React.MouseEvent<HTMLElement, globalThis.MouseEvent | MouseEvent>;
  title: string;
  displayX?: string;
  maxWidth?: number;
  minWidth?: number;
  fadeType?: string;
  isHoverable?: boolean;
  sectionMenuWidth?: number;
};

// パイチャート
// らべる
export type CustomizedLabelProps = {
  cornerRadius: any;
  cx: number;
  cy: number;
  endAngle: number;
  fill: string;
  index: number;
  innerRadius: number;
  maxRadius: number;
  midAngle: number;
  middleRadius: number;
  name: string;
  outerRadius: number;
  paddingAngle: number;
  payload: { [key: string]: any };
  percent: number;
  startAngle: number;
  stroke: string;
  strokeWidth: string;
  textAnchor: string;
  tooltipPayload: any[];
  tooltipPosition: { x: number; y: number };
  value: number;
  x: number;
  y: number;
};

// 売上目標 売上目標テーブルからFUNCTIONで取得
// export type SalesTargetFYRowData = {
//   entity_id: string;
//   entity_level: string | null;
//   entity_name: string | null;
//   // 紐付け関連
//   created_by_company_id: string | null;
//   created_by_department_id: string | null;
//   created_by_section_id: string | null;
//   created_by_unit_id: string | null;
//   created_by_user_id: string | null;
//   created_by_office_id: string | null;
//   // 当年度売上目標
//   fiscal_year_sales_target: number | null;
//   first_half_sales_target: number | null;
//   second_half_sales_target: number | null;
//   first_quarter_sales_target: number | null;
//   second_quarter_sales_target: number | null;
//   third_quarter_sales_target: number | null;
//   fourth_quarter_sales_target: number | null;
//   January_sales_target: number | null;
//   February_sales_target: number | null;
//   March_sales_target: number | null;
//   April_sales_target: number | null;
//   May_sales_target: number | null;
//   June_sales_target: number | null;
//   July_sales_target: number | null;
//   August_sales_target: number | null;
//   September_sales_target: number | null;
//   October_sales_target: number | null;
//   November_sales_target: number | null;
//   December_sales_target: number | null;
// };

// 売上目標 売上目標テーブルからFUNCTIONで取得
export type SalesTargetFYRowData = {
  share: number | null;
  share_first_half: number | null;
  share_second_half: number | null;
  dataset_type: string;
  entity_id: string;
  entity_level: string | null;
  entity_name: string | null;
  // created_by_company_id: string | null;
  // created_by_department_id: string | null;
  // created_by_section_id: string | null;
  // created_by_unit_id: string | null;
  // created_by_user_id: string | null;
  // created_by_office_id: string | null;
  fiscal_year: number | null;
  first_half: number | null;
  second_half: number | null;
  first_quarter: number | null;
  second_quarter: number | null;
  third_quarter: number | null;
  fourth_quarter: number | null;
  month_01: number | null;
  month_02: number | null;
  month_03: number | null;
  month_04: number | null;
  month_05: number | null;
  month_06: number | null;
  month_07: number | null;
  month_08: number | null;
  month_09: number | null;
  month_10: number | null;
  month_11: number | null;
  month_12: number | null;
  // January: number | null;
  // February: number | null;
  // March: number | null;
  // April: number | null;
  // May: number | null;
  // June: number | null;
  // July: number | null;
  // August: number | null;
  // September: number | null;
  // October: number | null;
  // November: number | null;
  // December: number | null;
};
// 上期詳細カラム
export type SalesTargetFHRowData = {
  share: number | null;
  share_first_half: number | null;
  share_second_half: number | null;
  dataset_type: string;
  entity_id: string;
  entity_level: string | null;
  entity_name: string | null;
  first_half: number | null;
  first_quarter: number | null;
  second_quarter: number | null;
  month_01: number | null;
  month_02: number | null;
  month_03: number | null;
  month_04: number | null;
  month_05: number | null;
  month_06: number | null;
};
// 下期詳細
export type SalesTargetSHRowData = {
  share: number | null;
  share_first_half: number | null;
  share_second_half: number | null;
  dataset_type: string;
  entity_id: string;
  entity_level: string | null;
  entity_name: string | null;
  second_half: number | null;
  third_quarter: number | null;
  fourth_quarter: number | null;
  month_07: number | null;
  month_08: number | null;
  month_09: number | null;
  month_10: number | null;
  month_11: number | null;
  month_12: number | null;
};

// 年度全て Key
export type FiscalYearAllKeys =
  | "fiscal_year"
  | "first_half"
  | "second_half"
  | "first_quarter"
  | "second_quarter"
  | "third_quarter"
  | "fourth_quarter"
  | "month_01"
  | "month_02"
  | "month_03"
  | "month_04"
  | "month_05"
  | "month_06"
  | "month_07"
  | "month_08"
  | "month_09"
  | "month_10"
  | "month_11"
  | "month_12";
// 上期詳細Key
export type FirstHalfDetailsKeys =
  | "first_half"
  | "first_quarter"
  | "second_quarter"
  | "month_01"
  | "month_02"
  | "month_03"
  | "month_04"
  | "month_05"
  | "month_06";
// 下期詳細Key
export type SecondHalfDetailsKeys =
  | "second_half"
  | "third_quarter"
  | "fourth_quarter"
  | "month_07"
  | "month_08"
  | "month_09"
  | "month_10"
  | "month_11"
  | "month_12";

// 売上目標・前年度売上フェッチ時の年月度の12ヶ月分の配列
export type FiscalYearMonthKey =
  | "month_01"
  | "month_02"
  | "month_03"
  | "month_04"
  | "month_05"
  | "month_06"
  | "month_07"
  | "month_08"
  | "month_09"
  | "month_10"
  | "month_11"
  | "month_12";
export type QuarterKey = "first_quarter" | "second_quarter" | "third_quarter" | "fourth_quarter";
export type HalfYearKey = "first_half" | "second_half";
export type PropertiesPeriodKey = "fiscal_year" | "half_year" | "quarter" | "year_month";

// マップされた型（Mapped Types）*1
export type FiscalYearMonthObjForTarget = { [K in FiscalYearMonthKey]: number };

// SDB 売上進捗 期間
export type PeriodSDB = { periodType: PropertiesPeriodKey; period: number };
// export type PeriodSDB = { periodType: FiscalYearAllKeys; period: number };

// 前年度売上実績 案件テーブルからFUNCTIONで取得
export type LastYearSalesRowData = {
  share: number | null;
  dataset_type: string;
  entity_id: string;
  entity_level: string | null;
  entity_name: string | null;
  // 紐付け関連
  created_by_company_id: string | null;
  created_by_department_id: string | null;
  created_by_section_id: string | null;
  created_by_unit_id: string | null;
  created_by_user_id: string | null;
  created_by_office_id: string | null;
  // 前年度売上実績
  fiscal_year: number | null;
  first_half: number | null;
  second_half: number | null;
  first_quarter: number | null;
  second_quarter: number | null;
  third_quarter: number | null;
  fourth_quarter: number | null;
  month_01: number | null;
  month_02: number | null;
  month_03: number | null;
  month_04: number | null;
  month_05: number | null;
  month_06: number | null;
  month_07: number | null;
  month_08: number | null;
  month_09: number | null;
  month_10: number | null;
  month_11: number | null;
  month_12: number | null;
  // January: number | null;
  // February: number | null;
  // March: number | null;
  // April: number | null;
  // May: number | null;
  // June: number | null;
  // July: number | null;
  // August: number | null;
  // September: number | null;
  // October: number | null;
  // November: number | null;
  // December: number | null;
};

// 前々年度売上実績 案件テーブルからFUNCTIONで取得
export type LastLastYearSalesRowData = {
  share: number | null;
  dataset_type: string;
  entity_id: string;
  entity_level: string | null;
  entity_name: string | null;
  // 紐付け関連
  created_by_company_id: string | null;
  created_by_department_id: string | null;
  created_by_section_id: string | null;
  created_by_unit_id: string | null;
  created_by_user_id: string | null;
  created_by_office_id: string | null;
  // 前々年度売上実績
  fiscal_year: number | null;
  first_half: number | null;
  second_half: number | null;
  first_quarter: number | null;
  second_quarter: number | null;
  third_quarter: number | null;
  fourth_quarter: number | null;
  month_01: number | null;
  month_02: number | null;
  month_03: number | null;
  month_04: number | null;
  month_05: number | null;
  month_06: number | null;
  month_07: number | null;
  month_08: number | null;
  month_09: number | null;
  month_10: number | null;
  month_11: number | null;
  month_12: number | null;
  // January: number | null;
  // February: number | null;
  // March: number | null;
  // April: number | null;
  // May: number | null;
  // June: number | null;
  // July: number | null;
  // August: number | null;
  // September: number | null;
  // October: number | null;
  // November: number | null;
  // December: number | null;
};

// 前年比 売上目標と前年度売上実績からクライアントサイドで算出
export type YoYGrowthRowData = {
  dataset_type: string;
  entity_id: string;
  entity_level: string | null;
  entity_name: string | null;
  // 紐付け関連
  created_by_company_id: string | null;
  created_by_department_id: string | null;
  created_by_section_id: string | null;
  created_by_unit_id: string | null;
  created_by_user_id: string | null;
  created_by_office_id: string | null;
  // 前年比
  fiscal_year: number | null;
  first_half: number | null;
  second_half: number | null;
  first_quarter: number | null;
  second_quarter: number | null;
  third_quarter: number | null;
  fourth_quarter: number | null;
  month_01: number | null;
  month_02: number | null;
  month_03: number | null;
  month_04: number | null;
  month_05: number | null;
  month_06: number | null;
  month_07: number | null;
  month_08: number | null;
  month_09: number | null;
  month_10: number | null;
  month_11: number | null;
  month_12: number | null;
  // January: number | null;
  // February: number | null;
  // March: number | null;
  // April: number | null;
  // May: number | null;
  // June: number | null;
  // July: number | null;
  // August: number | null;
  // September: number | null;
  // October: number | null;
  // November: number | null;
  // December: number | null;
};

// 前年度前年伸び率実績
export type Yo2YGrowthRowData = {
  dataset_type: string;
  entity_id: string;
  entity_level: string | null;
  entity_name: string | null;
  // 紐付け関連
  created_by_company_id: string | null;
  created_by_department_id: string | null;
  created_by_section_id: string | null;
  created_by_unit_id: string | null;
  created_by_user_id: string | null;
  created_by_office_id: string | null;
  // 前年比
  fiscal_year: number | null;
  first_half: number | null;
  second_half: number | null;
  first_quarter: number | null;
  second_quarter: number | null;
  third_quarter: number | null;
  fourth_quarter: number | null;
  January: number | null;
  February: number | null;
  March: number | null;
  April: number | null;
  May: number | null;
  June: number | null;
  July: number | null;
  August: number | null;
  September: number | null;
  October: number | null;
  November: number | null;
  December: number | null;
};

// 「売上目標・前年度売上・前年比」の３つのデータセットをqueryFnで取得した３つの結果をオブジェクトにまとめたデータ型
export type SalesTargetsRowDataWithYoY = {
  sales_targets: SalesTargetFYRowData;
  last_year_sales: SalesTargetFYRowData;
  yoy_growth: SalesTargetFYRowData;
};
// export type SalesTargetsRowDataWithYoY = {
//   sales_targets: SalesTargetFYRowData & { share: number | null };
//   last_year_sales: SalesTargetFYRowData & { share: number | null };
//   yoy_growth: SalesTargetFYRowData & { share: number | null };
// };

// ------------- 🌠売上目標DB関連🌠 -------------
// 目標設定済み年度
export type FiscalYears = {
  id: string;
  created_at: string;
  fiscal_year: number;
  period_start: string | null;
  period_end: string | null;
  created_by_company_id: string | null;
  target_type: string | null;
  is_confirmed_first_half_details: boolean;
  is_confirmed_second_half_details: boolean;
};
// エンティティレベル
export type EntityLevelStructures = {
  id: string;
  created_at: string;
  updated_at: string;
  fiscal_year_id: string;
  created_by_company_id: string;
  entity_level: string;
  is_confirmed_annual_half: boolean;
  is_confirmed_first_half_details: boolean;
  is_confirmed_second_half_details: boolean;
  target_type: string;
};
// レベル内の各エンティティ
export type EntityStructures = {
  id: string;
  created_at: string;
  updated_at: string;
  fiscal_year_id: string | null;
  entity_level_id: string | null;
  parent_entity_level_id: string | null;
  target_type: string | null;
  created_by_company_id: string | null;
  created_by_department_id: string | null;
  created_by_section_id: string | null;
  created_by_unit_id: string | null;
  created_by_user_id: string | null;
  created_by_office_id: string | null;
  parent_created_by_company_id: string | null;
  parent_created_by_department_id: string | null;
  parent_created_by_section_id: string | null;
  parent_created_by_unit_id: string | null;
  parent_created_by_user_id: string | null;
  parent_created_by_office_id: string | null;
  is_confirmed_annual_half: boolean;
  is_confirmed_first_half_details: boolean;
  is_confirmed_second_half_details: boolean;
  entity_name: string | null;
  parent_entity_name: string | null;
};
// SELECTで取得する時用のEntityLevel
export type EntityLevels = {
  id: string;
  created_at: string;
  updated_at: string | null;
  fiscal_year_id: string;
  created_by_company_id: string;
  entity_level: string;
  is_confirmed_annual_half: boolean;
  is_confirmed_first_half_details: boolean;
  is_confirmed_second_half_details: boolean;
  target_type: string;
  fiscal_year: number; //fiscal_yearsテーブルからfiscal_yaerを取得
};

// 売上目標テーブル
export type SalesTargets = {
  id: string;
  created_at: string;
  updated_at: string | null;
  fiscal_year_id: string | null;
  entity_level_id: string | null;
  entity_id: string | null;
  created_by_company_id: string | null;
  created_by_department_id: string | null;
  created_by_section_id: string | null;
  created_by_unit_id: string | null;
  created_by_user_id: string | null;
  created_by_office_id: string | null;
  period_type: string | null;
  period: number | null;
  sales_target: number | null;
};

// レベル内の各エンティティをFUNCTIONで取得するデータ型
//  {レベル名: [{上位エンティティid: [obj, obj, ...]}, {上位エンティティid: [obj, obj, ...]}]}
// エンティティレベル名
// 各レベル名をkeyとして割り当てられるvalueの配列
// [{上位エンティティid: [エンティティobj, エンティティobj, ...]}, {上位エンティティid: [obj, obj, ...]}]
// SELECTで取得する時用のEntity
export type Entity = {
  id: string;
  created_at: string;
  updated_at: string;
  fiscal_year_id: string;
  entity_level_id: string;
  parent_entity_level_id: string;
  target_type: string;
  entity_id: string;
  parent_entity_id: string | null;
  is_confirmed_annual_half: boolean;
  is_confirmed_first_half_details: boolean;
  is_confirmed_second_half_details: boolean;
  entity_name: string;
  parent_entity_name: string;
  fiscal_year: number; // fiscal_yearsテーブル
  entity_level: string; // entity_level_structuresテーブル
  parent_entity_level: string; // entity_level_structuresテーブル
};
export type EntityGroupByParent = {
  parent_entity_id: string | null;
  parent_entity_name: string;
  entities: Entity[];
};
export type EntityLevelNames = "company" | "department" | "section" | "unit" | "member" | "office";
export type EntitiesHierarchy = Record<EntityLevelNames, EntityGroupByParent[]>;
// export type EntitiesHierarchy = { [K in EntityLevelNames]: EntityGroupByParent[] };

// メンバーエンティティグループ 上位エンティティに紐づくグループとして取得し、選択肢として表示 {上位エンティティid: {メンバーobj}}
export type MemberGroupsByParentEntity = {
  [key: string]: {
    parent_entity_id: string;
    parent_entity_name: string;
    // parent_entity_level_id: string;
    // parent_entity_level: string;
    member_group: (MemberAccounts & { company_id: string; company_name: string })[];
  };
};

// 🔸追加した各エンティティ内にメンバーがいるかどうか人数をcountで確認useQuery🔸
export type AddedEntityMemberCount = {
  entity_id: string;
  entity_name: string;
  member_count: number;
};

// 目標設定用 年度・エンティティ関連オブジェクト
export type UpsertSettingEntitiesObj = {
  fiscalYear: number;
  periodType: "year_half" | "first_half_details" | "second_half_details" | ""; // 期間タイプ(fiscal_year, first_half_details, second_half_details) 初期セットでは空文字をセットする なぜなら次のレベルがメンバーレベルかどうかがわからないため
  entityLevel: string; // 全社・事業部
  entities: Entity[]; // 設定するエンティティid配列
  // entityName: string;
  parentEntityLevelId: string; // 紐づく上位エンティティid
  parentEntityLevel: string; // 紐づく上位エンティティ詳細
  parentEntityId: string;
  parentEntityName: string;
};

// 売上目標画面のメインエンティティ
// export type MainEntityTarget = {
//   entityLevel: string;
//   entityId: string;
//   entityName: string;
// };
export type MainEntityTarget = {
  // entityLevel: string;
  // entityId: string;
  // entityName: string;

  // fiscalYear: number;
  periodType: "year_half" | "first_half_details" | "second_half_details" | ""; // 期間タイプ(fiscal_year, first_half_details, second_half_details) 初期セットでは空文字をセットする なぜなら次のレベルがメンバーレベルかどうかがわからないため
  entityLevel: EntityLevelNames; // 全レイヤー(office除く)
  entities: Entity[]; // 設定するエンティティid配列
  // entityName: string;
  parentEntityLevelId: string; // 紐づく上位エンティティid
  parentEntityLevel: "company" | "department" | "section" | "unit"; // 紐づく上位エンティティ詳細(メンバーレベル無し)
  parentEntityId: string;
  parentEntityName: string;
};

// ------------- 🌠売上目標DB関連🌠 -------------

// ３行１セットデータ型 FUNCTIONで取得するdataset_typeではスネークケースのため、Zustandもスネークケースで定義
export type DisplayKeys = "sales_targets" | "last_year_sales" | "yoy_growth";
// 🔹前年度の前年比伸び率実績(前年度の前年比)と前々年度売上あり
// export type DisplayKeys = "sales_targets" | "last_year_sales" | "yoy_growth" | "last_last_year_sales" | "yo2y_growth";

// export type DisplayKeys = "salesTargets" | "lastYearSales" | "yoyGrowth";
// yo2y_growth：前年度の前年比の伸び率実績(前年度の前年比)Year Over Two Years
// yoy: Year Over Year
export type MainTotalTargets = {
  [K in "sales_targets" | "last_year_sales" | "yoy_growth"]: {
    // [K in "fiscal_year" | "first_half" | "second_half"]: number;
    [K in FiscalYearAllKeys]: number | null;
  };
};
// 売上推移に売上目標をchartDataに追加用
export type SubEntitySalesTargetObj = {
  [K in "sales_targets" | "last_year_sales" | "yoy_growth"]: {
    // [K in "fiscal_year" | "first_half" | "second_half"]: number;
    [K in FiscalYearAllKeys]: number | null;
  };
};
export type SubEntitySalesTarget = {
  entity_id: string;
  entity_name: string;
  entity_level: string;
  sales_target_obj: SubEntitySalesTargetObj;
};
// export type SubEntityTarget = {
//   sales_targets: {
//     [K in FiscalYearAllKeys]: number;
//   };
// };

/**
*1
[K in FiscalYearMonthKey]: number;はマップされた型を表し、FiscalYearMonthKeyで定義された各ユニオンメンバー（"month_01"、"month_02"、...）をキーとし、それぞれのキーにnumber型の値を割り当てます。

この方法により、FiscalYearMonthObjForTarget型を使用してオブジェクトを定義すると、"month_01"から"month_12"までの各キーに対して数値を割り当てることができます。そして、これらのキー以外のものを使用しようとすると、TypeScriptの型チェックによってエラーが発生します。

マップされた型は、既存の型を新しい型に変換する強力な方法を提供し、型の再利用性と柔軟性を向上させます。この機能を活用することで、より型安全で保守しやすいコードを書くことができます。
 */

// =========営業担当データ
export type MemberObj = {
  memberId: string | null;
  memberName: string | null;
  departmentId: string | null;
  sectionId: string | null;
  unitId: string | null;
  officeId: string | null;
  signature_stamp_id?: string | null;
  signature_stamp_url?: string | null;
};

// 目標設定用 年度・エンティティ関連オブジェクト
export type UpsertTargetObj = {
  fiscalYear: number;
  entityLevel: string; // 全社・事業部
  entityId: string; // 設定するエンティティid
  entityName: string;
  childEntityLevel: string;
};

// ---------------- 【事業部〜係レベルUPSERT用】 ----------------
// 目標設定時の「年度・半期」の「過去3年分の売上」と「前年度の前年伸び率実績」 useQuery
export type SalesSummaryYearHalf = {
  // period_type: string; // 年度・上半期・下半期(fiscal_year, first_half, second_half)
  period_type: "fiscal_year" | "first_half" | "second_half"; // 年度・上半期・下半期(fiscal_year, first_half, second_half)
  last_year_sales: number;
  two_years_ago_sales: number;
  three_years_ago_sales: number;
  // growth_rate: number;
  yo2y_growth: number; // 前年度前年伸び率実績(2年前から1年前の成長率)
};
// ---------------- 【事業部〜係レベルUPSERT用】 ----------------
// ---------------- 【メンバーレベルUPSERT用】 ----------------
export type SalesSummaryHalfDetails = {
  // period_type: string; // 半期・Q1, Q1, 1月度~6月度(half_year, first_quarter, second_quarter, month_01~06)
  period_type:
    | "half_year"
    | "first_quarter"
    | "second_quarter"
    | "month_01"
    | "month_02"
    | "month_03"
    | "month_04"
    | "month_05"
    | "month_06"; // 半期・Q1, Q1, 1月度~6月度(half_year, first_quarter, second_quarter, month_01~06)
  last_year_sales: number;
  two_years_ago_sales: number;
  three_years_ago_sales: number;
  // growth_rate: number;
  yo2y_growth: number; // 前年度前年伸び率実績(2年前から1年前の成長率)
};
// ---------------- 【メンバーレベルUPSERT用】 ----------------

// ---------------- 【事業部〜係レベルUPSERT用】 ----------------
// 「年度・半期」目標のキー
export type KeysSalesTargetsYearHalf = "sales_target_year" | "sales_target_first_half" | "sales_target_second_half";
// メイン目標の売上目標「年度・半期」
export type SalesTargetsYearHalf = { [K in KeysSalesTargetsYearHalf]: number };
// 設定対象のサブテーブルの売上目標の合計「年度・半期」
export type TotalSalesTargetsYearHalf = { [K in KeysSalesTargetsYearHalf]: number };
export type TotalSalesTargetsYearHalfObj = {
  total_targets: TotalSalesTargetsYearHalf;
  input_targets_array: { entity_id: string; entity_name: string; input_targets: SalesTargetsYearHalf }[];
};
// ---------------- 【事業部〜係レベルUPSERT用】 ----------------
// ---------------- 【メンバーレベルUPSERT用】 ----------------
// 「半期詳細」目標のキー
export type KeysSalesTargetsHalfDetails = "sales_target_half";
// | "sales_target_first_quarter"
// | "sales_target_second_quarter"
// | "sales_target_month_01"
// | "sales_target_month_02"
// | "sales_target_month_03"
// | "sales_target_month_04"
// | "sales_target_month_05"
// | "sales_target_month_06";
export type KeysMainSalesTargetsHalfDetails = "sales_target_half";
// メイン目標の売上目標「半期詳細」半期目標のみ
export type SalesTargetsHalfDetails = { [K in KeysSalesTargetsHalfDetails]: number };
// 設定対象のサブテーブルの売上目標の合計「半期詳細」 メンバーレベル設定時の総合目標は半期のみ保持する
export type TotalSalesTargetsHalfDetails = { [K in KeysMainSalesTargetsHalfDetails]: number };
export type TotalSalesTargetsHalfDetailsObj = {
  total_targets: TotalSalesTargetsHalfDetails;
  input_targets_array: { entity_id: string; entity_name: string; input_targets: SalesTargetsHalfDetails }[];
};
// ---------------- 【メンバーレベルUPSERT用】 ----------------

// メンバーレベル売上目標設定時の全メンバーの月次売上目標の入力完了有無と月次目標合計値とQ1, Q2の総合目標と一致しているかを保持
export type MonthTargetStatusMapForAllMembers = Map<
  string,
  {
    member_id: string;
    member_name: string;
    isCompleteAllMonthTargets: boolean;
  }
>;

// 売上目標設定時のカラム
export type SalesTargetUpsertColumns = {
  period_type: string;
  sales_target: number | string | null;
  share: number | null;
  yoy_growth: number | null;
  yo2y_growth: number | null;
  last_year_sales: number | null;
  two_years_ago_sales: number | null;
  three_years_ago_sales: number | null;
  sales_trend: SparkChartObj;
};

// 売上目標保存時の各エンティティの入力値を保持するstate 年度~半期
export type inputSalesData = {
  period_type: string;
  period: number; // 2024, 20241, 202401
  sales_target: number;
};
export type InputSalesTargets = {
  entity_id: string;
  entity_name: string;
  sales_targets: inputSalesData[];
};

// {entityId: {data: ローカルobj, isCollected: false, error: }} isCollectedデータ収集が完了
export type EntityInputSalesTargetObj = { data: InputSalesTargets; isCollected: boolean; error: string | null };
export type InputSalesTargetsIdToDataMap = { [key: string]: EntityInputSalesTargetObj };

// 🔹スパークチャート
export type SparkChartObj = {
  title: string;
  subTitle: string;
  mainValue: number | null;
  growthRate: number | null;
  data: { date: string | number | null; value: number | null }[];
};

// 🔹エリアチャート value1, value2 ...
export type AreaChartObj = {
  date: string | number;
  value1: number;
  [key: string]: string | number;
};

export type LabelValue = {
  id: string;
  label: string;
  value: any;
  prev_value?: number | null | undefined; // 前年伸びが存在する時の前年度の売上や値
  growth_rate?: number | null | undefined; // 前年伸びはオプショナル
};

export type LabelValueGroupByPeriod = {
  date: string | number;
  label_list: LabelValue[];
};

export type LegendNameId = {
  entity_id: string;
  entity_name: string;
};

// 売上推移 useQueryのqueryFn内のFUNCTIONのレスポンスデータ
export type SalesTrendResponse = {
  entity_id: string;
  entity_name: string;
  entity_level: string;
  period: number;
  period_type: string;
  current_sales: number;
  previous_sales: number | null;
  growth_rate: number | null;
};

// 🌠最終的にuseQueryで返すレスポンスデータ(整形後) 売上推移
export type SalesTrendYearHalf = {
  chartData: AreaChartObj[];
  labelValueGroupByPeriod: LabelValueGroupByPeriod[];
  salesTrends: SalesTrendResponse[];
  legendList: LegendNameId[];
  groupedByPeriod: { [key: number | string]: SalesTrendResponse[] };
  labelType: string; // dateやsales_periodなど
  periodType: string; // 期間タイプ
  entityLevel: string; // エンティティレベル
  entityIdToNameMapping: {
    [key: string]: string;
  }; // エンティティid: value1 or value2 or ...
};

// 🔹ドーナツチャート value1, value2 ...
export type DonutChartObj = {
  name: number | string;
  value: number;
  [key: string]: number | string;
};
// ドーナツチャート 残ネタ獲得状況
export type LabelDataSalesProbability = {
  sales_probability_name: number;
  average_price: number;
  quantity: number;
  probability: number;
  amount: number;
  period: number;
  [key: string]: number;
};

// 🌠最終的なuseQueryの確度別の残ネタ獲得状況
export type SalesProbabilitiesChartData = {
  total_amount: number;
  chartData: DonutChartObj[];
  labelListSalesProbabilities: LabelDataSalesProbability[];
};

// ドーナツチャート SDB売上予測ボード
export type SalesForecastChartData = {
  current_sales_amount: number; // COALESCEで0をセットしているため必ずnumber型で返却される
  current_sales_target: number | null;
  current_achievement_rate: number | null;
  total_amount: number;
  chartData: DonutChartObj[];
  labelListSalesProbabilities: LabelDataSalesProbability[];
};

// ドーナツチャート 売上目標シェア
export type DonutChartShareObj = {
  name: string;
  value: number;
  [key: string]: number | string;
};
// ドーナツチャート 売上目標シェア
export type LabelDataSalesTargetsShare = {
  entity_name: string;
  amount: number;
  share: number;
  period: number;
  [key: string]: number | string;
};
// useQueryのレスポンスデータ(売上目標シェア)
// export type responseShareTargets = {
//   total_amount: number;
//   label_data: LabelDataSalesTargetsShare[];
// };

// 🌠最終的なuseQueryのエンティティ別 売上目標シェア
export type SalesTargetsShareChartData = {
  total_amount: number;
  chartData: DonutChartShareObj[];
  labelListShareSalesTargets: LabelDataSalesTargetsShare[];
};

export type EntityObjForChart = {
  [K in "entity_name" | "entity_id" | "entity_structure_id"]: string;
};

// ---------------- SDB関連 ----------------
// 売上進捗・達成率チャート用 営業プロセス結果
// 面談ALL・新規面談・展開・展開率・展開F・展開F率・F獲得・F獲得率・A数・面談効率
export type SalesProcessesForSDB = {
  category:
    | "call_pr"
    | "call_all"
    | "meeting_all"
    | "meeting_new"
    | "expansion_all"
    | "expansion_rate"
    | "f_expansion"
    | "f_expansion_rate"
    | "award"
    | "half_year_f_expansion"
    | "half_year_f_expansion_award"
    | "half_year_f_expansion_award_rate"
    | "sales_total_amount"
    | "sales_target"
    | "achievement_rate"
    | "half_year_sales_total_amount"
    | "half_year_sales_target"
    | "half_year_achievement_rate";
  result: number;
};
export type SalesProcessesOnlyHalfYearForSDB = {
  category:
    | "call_pr"
    | "call_all"
    | "meeting_all"
    | "meeting_new"
    | "expansion_all"
    | "expansion_rate"
    | "f_expansion"
    | "f_expansion_rate"
    | "award"
    // | "half_year_f_expansion"
    | "half_year_f_expansion_award"
    | "half_year_f_expansion_award_rate"
    | "sales_total_amount"
    | "sales_target"
    | "achievement_rate";
  // | "half_year_sales_total_amount"
  // | "half_year_sales_target"
  // | "half_year_achievement_rate";
  result: number;
};

// SDBモーダル開閉タイプ
// type OpenModalSDBType = ''

// ----------- 業種・製品分類 関連 -----------
// ------------ 🌠製品分類【大分類】
export type ProductCategoriesLarge =
  | "electronic_components_modules"
  | "mechanical_parts"
  | "manufacturing_processing_machines"
  | "scientific_chemical_equipment"
  | "materials"
  | "measurement_analysis"
  | "image_processing"
  | "control_electrical_equipment"
  | "tools_consumables_supplies"
  | "design_production_support"
  | "it_network"
  | "office"
  | "business_support_services"
  | "seminars_skill_up"
  | "others";

// ------------ 🌠製品分類【中分類】
// 電子部品
export type ProductCategoriesMediumModule =
  | "electronic_components"
  | "connectors"
  | "terminal_blocks"
  | "led"
  | "fpd_touch_panel"
  | "small_motors"
  | "power_supplies"
  | "batteries"
  | "semiconductors_ic"
  | "rfid_ic_tag"
  | "optical_components"
  | "cables"
  | "contracted_services";

// 機械部品
export type ProductCategoriesMediumMachine =
  | "mechanical_elements"
  | "bearings"
  | "screws"
  | "motors"
  | "pumps"
  | "piping_components"
  | "water_oil_hydraulic_pneumatic_equipment"
  | "vacuum_equipment"
  | "molds"
  | "jigs"
  | "automotive_parts";

// 製造・加工機械
export type ProductCategoriesMediumProcessingMachinery =
  | "machine_tools"
  | "processing_machines"
  | "semiconductor_manufacturing_equipment"
  | "mounting_machines"
  | "industrial_robots"
  | "assembly_machines"
  | "painting_machines"
  | "food_machines"
  | "packaging_machines"
  | "conveying_machines"
  | "marking"
  | "contracted_services";

// 科学・理化学
export type ProductCategoriesMediumScience =
  | "chemical_equipment"
  | "cleaning_machines"
  | "powder_equipment"
  | "heating_equipment_furnaces"
  | "surface_treatment_equipment"
  | "laboratory_equipment_supplies";

// 素材・材料
export type ProductCategoriesMediumMaterial =
  | "metal_materials"
  | "polymer_materials"
  | "glass"
  | "ceramics"
  | "wood"
  | "paper_pulps"
  | "organic_natural_materials"
  | "chemicals";

// 測定・分析
export type ProductCategoriesMediumAnalysis =
  | "distance_measuring_machine"
  | "weight_measuring_machine"
  | "electronic_measuring_machine"
  | "temperature_humidity_machine"
  | "electrical_machine"
  | "coordinate_measuring_machine"
  | "other_measuring_machine"
  | "testing_machine"
  | "inspection_machine"
  | "microscopes"
  | "recorders_loggers"
  | "analytical_machine"
  | "environmental_analysis_machine"
  | "contracted_services";

// 画像処理
export type ProductCategoriesMediumImageProcessing =
  | "cameras"
  | "lenses"
  | "light_sources_lighting"
  | "image_processing"
  | "security_surveillance_systems"
  | "barcode_readers";

// 制御・電機機器
export type ProductCategoriesMediumControlEquipment =
  | "process_control_equipment"
  | "fa_equipment"
  | "safety_equipment"
  | "environmental_equipment"
  | "filters"
  | "clean_rooms"
  | "lighting"
  | "air_conditioning_equipment"
  | "water_treatment_equipment"
  | "static_electricity_measures"
  | "energy_equipment";

// 工具・消耗品・備品
export type ProductCategoriesMediumTool =
  | "cutting_tools"
  | "abrasives"
  | "hand_tools"
  | "power_pneumatic_tools"
  | "consumables"
  | "cleaning_tools"
  | "safety_hygiene_supplies"
  | "packaging_materials"
  | "supplies"
  | "storage_facilities";

// 設計・生産支援
export type ProductCategoriesMediumDesign = "cad" | "cam" | "cae" | "prototype" | "contracted_services";

// IT・ネットワーク
export type ProductCategoriesMediumIT =
  | "industrial_computers"
  | "embedded_systems"
  | "core_systems"
  | "production_management"
  | "information_systems"
  | "network"
  | "operating_systems"
  | "servers"
  | "security";

// オフィス
export type ProductCategoriesMediumOffice = "office_automation_equipment" | "consumables" | "supplies";

// 業務支援サービス
export type ProductCategoriesMediumBusinessSupport =
  | "consultants"
  | "rental_lease"
  | "human_resources_services"
  | "services";

// セミナー・スキルアップ
export type ProductCategoriesMediumSkillUp = "for_engineer" | "for_management";

// 製品分類【中分類】全て
export type ProductCategoriesMedium =
  | ProductCategoriesMediumModule
  | ProductCategoriesMediumMachine
  | ProductCategoriesMediumProcessingMachinery
  | ProductCategoriesMediumScience
  | ProductCategoriesMediumMaterial
  | ProductCategoriesMediumAnalysis
  | ProductCategoriesMediumImageProcessing
  | ProductCategoriesMediumControlEquipment
  | ProductCategoriesMediumTool
  | ProductCategoriesMediumDesign
  | ProductCategoriesMediumIT
  | ProductCategoriesMediumOffice
  | ProductCategoriesMediumBusinessSupport
  | ProductCategoriesMediumSkillUp
  | "others";

// 🌠「電子部品・モジュール」 中分類の【小分類】
// 電子部品
export type ModuleProductCategoriesSElectronicComponents =
  | "electron_tubes"
  | "resistors"
  | "capacitors"
  | "transformers"
  | "inductors_coils"
  | "filters"
  | "oscillators"
  | "amplifiers"
  | "power_sources"
  | "ac_adapters"
  | "rf_microwave_components"
  | "antennas"
  | "piezoelectric_devices"
  | "lamps_emitters"
  | "transducers"
  | "isolators"
  | "converters"
  | "inverters"
  | "relays"
  | "sound_components"
  | "fans"
  | "solenoids_actuators"
  | "fuses"
  | "peltier_device"
  | "couplers"
  | "encoders"
  | "emc_solutions"
  | "printed_circuit_boards"
  | "ultrasonic_generators"
  | "switches"
  | "sensors"
  | "other_electronic_components";

// コネクタ
export type ModuleProductCategoriesSConnectors =
  | "coaxial_connectors"
  | "circular_connectors"
  | "rectangular_connectors"
  | "board_to_board_connectors"
  | "board_to_cable_connectors"
  | "board_to_fpc_connectors"
  | "optical_connectors"
  | "automotive_connectors"
  | "other_connectors";

// 端子台
export type ModuleProductCategoriesSTerminalBlocks =
  | "crimp_terminals"
  | "sockets"
  | "waterproof_connectors"
  | "pcb_terminal_blocks"
  | "connector_terminal_blocks"
  | "other_terminal_blocks";

// LED
export type ModuleProductCategoriesSLed = "bullet_type_led" | "chip_type_led" | "led_modules";

// FPD・タッチパネル
export type ModuleProductCategoriesSFpdTouchPanel =
  | "organic_led"
  | "lcd_displays"
  | "touch_panels"
  | "other_fpd_related";

// FPD・タッチパネル
export type ModuleProductCategoriesSSmallMotors =
  | "dc_motors"
  | "vibration_motors"
  | "brushless_dc_motors"
  | "stepping_motors"
  | "fan_motors"
  | "ac_motors";

// 電源
export type ModuleProductCategoriesSPowerSources = "other_power_sources" | "switching_power_sources";

// 電池・バッテリー
export type ModuleProductCategoriesSBatteries =
  | "secondary_batteries"
  | "hydrogen_batteries"
  | "lithium_ion_batteries"
  | "chargers";

// 半導体・IC
export type ModuleProductCategoriesSSemiconductorsIc =
  | "wafers"
  | "diodes"
  | "transistors"
  | "memory"
  | "microcomputers"
  | "asic"
  | "custom_ics"
  | "other_semiconductors";

// 「RFIC・ICタグ」
export type ModuleProductCategoriesS_rfid_ic_tag = "ic_tags";

// 「光学部品」
export type ModuleProductCategoriesS_optical_components =
  | "lenses"
  | "prisms"
  | "mirrors"
  | "optical_lab_components"
  | "laser_components"
  | "other_optical_components";

// ケーブル
export type ModuleProductCategoriesS_cables =
  | "cables"
  | "harnesses"
  | "lan_optical_cables"
  | "ferrite_cores"
  | "wiring_materials"
  | "other_cable_related_products";

// 受託サービス
export type ModuleProductCategoriesS_contracted_services =
  | "pcb_design_manufacturing"
  | "electronic_manufacturing_services";

// ========================= ✅「機械部品」 大分類 mechanical_parts の小分類関連✅ =========================
// 機械要素
export type MachineProductCategoriesS_mechanical_elements =
  | "gears"
  | "fasteners"
  | "springs"
  | "shafts"
  | "chains_sprockets"
  | "belts_pulleys"
  | "power_transmission_equipment"
  | "couplings"
  | "wheels"
  | "clutches"
  | "brakes"
  | "reducers"
  | "slip_rings"
  | "rollers"
  | "actuators"
  | "belts"
  | "joints"
  | "cylinders"
  | "transmissions"
  | "casters"
  | "nozzles"
  | "other_mechanical_elements";

// 軸受・ベアリング
export type MachineProductCategoriesS_bearings = "metal_bearings" | "plastic_bearings";

// ねじ
export type MachineProductCategoriesS_screws = "nuts" | "bolts";

// モータ
export type MachineProductCategoriesS_motors =
  | "servo_motors"
  | "stepping_motors"
  | "linear_motors"
  | "induction_motors"
  | "pm_motors"
  | "ac_motors"
  | "dc_motors"
  | "electromagnets"
  | "other_motors";

// ポンプ
export type MachineProductCategoriesS_pumps =
  | "syringe_pumps"
  | "positive_displacement_pumps"
  | "turbo_pumps"
  | "special_pumps"
  | "other_pumps";

// 配管部品
export type MachineProductCategoriesS_piping_components =
  | "valves"
  | "filters"
  | "pipe_fittings"
  | "tubes"
  | "hoses"
  | "piping_materials";

// 油空水圧機器
export type MachineProductCategoriesS_water_oil_hydraulic_pneumatic_equipment =
  | "water_pressure_equipment"
  | "oil_pressure_equipment"
  | "pneumatic_equipment";

// 真空機器
export type MachineProductCategoriesS_vacuum_equipment = "vacuum_equipment" | "seals_gaskets" | "vacuum_pumps";

// 金型
export type MachineProductCategoriesS_molds =
  | "rubber_molds"
  | "plastic_molds"
  | "resin_molds"
  | "press_molds"
  | "mold_design"
  | "other_molds";

// 治具
export type MachineProductCategoriesS_jigs = "inspection_jigs" | "machining_jigs" | "assembly_jigs" | "brackets";

// 自動車部品
export type MachineProductCategoriesS_automotive_parts =
  | "engine_parts"
  | "automotive_catalyst_test_equipment"
  | "o2_sensor_test_equipment"
  | "fuel_system_parts"
  | "canister_test_device"
  | "transmission_parts"
  | "brake_components"
  | "drivetrain_parts"
  | "axle_parts"
  | "body_parts"
  | "steering_system_parts"
  | "electrical_parts"
  | "interior_parts"
  | "other_automotive_parts";

// ========================= ✅「製造・加工機械」 大分類 manufacturing_processing_machines の小分類関連✅ =========================

// 工作機械
export type ProcessingMachineryProductCategoriesS_machine_tools =
  | "lathes"
  | "drilling_machines"
  | "boring_machines"
  | "milling_machines"
  | "planers_shapers_slotters"
  | "grinding_machines"
  | "gear_cutting_finishing_machines"
  | "special_processing_machines"
  | "edm_machines"
  | "other_machine_tools";

// 加工機械
export type ProcessingMachineryProductCategoriesS_processing_machines =
  | "plastic_working_machines"
  | "welding_machines"
  | "heading_machines"
  | "winding_machines"
  | "printing_machines"
  | "injection_molding_machines"
  | "blow_molding_machines"
  | "extrusion_molding_machines"
  | "vacuum_molding_machines"
  | "plastic_processing_machines"
  | "rubber_processing_machines"
  | "powder_molding_machines"
  | "forging_machines"
  | "textile_processing_machines"
  | "paper_processing_machines"
  | "wood_processing_machines"
  | "stone_processing_machines"
  | "other_processing_machines";

// 半導体製造装置
export type ProcessingMachineryProductCategoriesS_semiconductor_manufacturing_equipment =
  | "cvd_equipment"
  | "sputtering_equipment"
  | "annealing_furnaces"
  | "coaters"
  | "resist_processing_equipment"
  | "oxidation_diffusion_equipment"
  | "steppers"
  | "etching_equipment"
  | "ion_implantation_equipment"
  | "ashing_equipment"
  | "deposition_equipment"
  | "electron_beam_printing_equipment"
  | "semiconductor_testers"
  | "semiconductor_inspection_testing_equipment"
  | "wafer_processing_polishing_equipment"
  | "molding_equipment"
  | "bonding_equipment"
  | "cmp_equipment"
  | "photomasks"
  | "other_semiconductor_manufacturing_equipment";

// 実装機械
export type ProcessingMachineryProductCategoriesS_mounting_machines =
  | "mounters"
  | "inserters"
  | "reflow_equipment"
  | "pcb_processing_machines"
  | "taping_machines"
  | "soldering_equipment"
  | "pcb_transport_equipment_loaders_unloaders"
  | "other_mounting_machines";

// 産業用ロボット
export type ProcessingMachineryProductCategoriesS_industrial_robots =
  | "machining_centers"
  | "scara_robots"
  | "multi_joint_robots"
  | "cartesian_robots"
  | "assembly_robots"
  | "conveying_handling_robots"
  | "welding_robots"
  | "inspection_robots"
  | "other_industrial_robots";

// 組立機械
export type ProcessingMachineryProductCategoriesS_assembly_machines =
  | "dispensers"
  | "assembly_machines"
  | "automatic_sorters"
  | "parts_feeders"
  | "other_assembly_machines";

// 塗装機械
export type ProcessingMachineryProductCategoriesS_painting_machines =
  | "painting_machines"
  | "sprayers"
  | "other_painting_machines";

// 食品機械
export type ProcessingMachineryProductCategoriesS_food_machines =
  | "food_processing_equipment"
  | "food_cutting_equipment"
  | "food_washing_equipment"
  | "beverage_manufacturing_equipment"
  | "frozen_treats_manufacturing_equipment"
  | "food_packaging_machines"
  | "food_hygiene_contamination_prevention_equipment"
  | "food_testing_analysis_measuring_equipment"
  | "food_storage_facilities"
  | "food_conveying_equipment"
  | "other_food_machinery";

// 包装機械
export type ProcessingMachineryProductCategoriesS_packaging_machines =
  | "bag_making_slitting_machines"
  | "case_former"
  | "filling_bottling_machines"
  | "case_packer"
  | "vacuum_packaging_machines"
  | "overwrapping_machines"
  | "sealing_machines"
  | "shrink_wrapping_machines"
  | "strapping_packaging_machines"
  | "other_packaging_machinery";

// 搬送機械
export type ProcessingMachineryProductCategoriesS_conveying_machines =
  | "cranes"
  | "conveyors"
  | "sorting_machines"
  | "palletizers"
  | "balancers"
  | "lifts"
  | "carts"
  | "other_conveying_machines";

// マーキング
export type ProcessingMachineryProductCategoriesS_marking =
  | "commercial_printers"
  | "labelers"
  | "labels"
  | "special_labels"
  | "nameplates"
  | "engraving_machines"
  | "laser_markers"
  | "other_marking";

// 受託サービス
export type ProcessingMachineryProductCategoriesS_contracted_services =
  | "machine_design"
  | "manufacturing_services"
  | "processing_services";

// ========================= ✅「科学・理化学」 大分類 scientific_chemical_equipment の小分類関連✅ =========================

// 理化学機器
export type ProcessingMachineryProductCategoriesS_chemical_equipment =
  | "incubators"
  | "refrigerators_freezers"
  | "drying_equipment"
  | "autoclaves"
  | "sterilizers"
  | "constant_temperature_water_baths"
  | "pure_water_production_equipment"
  | "centrifuges"
  | "dispensers"
  | "pipettes"
  | "stirrers"
  | "concentrators"
  | "stainless_containers"
  | "separation_equipment"
  | "distillation_equipment"
  | "degassing_equipment"
  | "uv_exposure_equipment"
  | "plasma_generators"
  | "ozone_generators"
  | "gas_generators"
  | "nitrogen_gas_generators"
  | "emulsifiers_dispersers"
  | "mixers_agitators"
  | "other_chemical_equipment";

// 洗浄機
export type ProcessingMachineryProductCategoriesS_cleaning_machines =
  | "high_pressure_cleaners"
  | "ultrasonic_cleaners"
  | "other_cleaning_machines";

// 粉体機器
export type ProcessingMachineryProductCategoriesS_powder_equipment =
  | "crushers"
  | "fine_crushers"
  | "sieves_shakers"
  | "granulators"
  | "powder_feeders"
  | "homogenizers"
  | "shakers"
  | "powder_conveyors"
  | "other_powder_equipment";

// 加熱装置・炉
export type ProcessingMachineryProductCategoriesS_heating_equipment_furnaces =
  | "heating_equipment"
  | "aluminum_heaters"
  | "ceramic_heaters"
  | "silicon_heaters"
  | "other_heaters"
  | "electric_furnaces"
  | "industrial_furnaces";

// 表面処理装置
export type ProcessingMachineryProductCategoriesS_surface_treatment_equipment =
  | "plating_equipment"
  | "plasma_surface_treatment_equipment"
  | "surface_treatment_services"
  | "other_surface_treatment_equipment";

// 実験器具・消耗品
export type ProcessingMachineryProductCategoriesS_laboratory_equipment_supplies =
  | "glass_instruments_containers"
  | "plastic_instruments_containers"
  | "stainless_instruments_containers"
  | "other_laboratory_instruments_containers";

// ========================= ✅「素材・材料」 大分類 materials の小分類関連✅ =========================

// 金属材料
export type MaterialProductCategoriesS_metal_materials =
  | "steel"
  | "alloys"
  | "special_steel"
  | "non_ferrous_metals"
  | "stainless_steel"
  | "aluminum"
  | "rare_metals"
  | "magnets"
  | "solders"
  | "other_metal_materials";

// 高分子材料
export type MaterialProductCategoriesS_polymer_materials =
  | "plastics"
  | "engineering_plastics"
  | "rubber"
  | "fibers"
  | "composite_materials"
  | "other_polymer_materials";

// ガラス
export type MaterialProductCategoriesS_glass = "glass";

// セラミックス
export type MaterialProductCategoriesS_ceramics = "ceramics" | "fine_ceramics";

// 木材
export type MaterialProductCategoriesS_wood = "wood" | "processed_wood_products";

// 紙・パルプ
export type MaterialProductCategoriesS_paper_pulps = "paper_pulp" | "processed_paper_pulp_products";

// 有機天然材料
export type MaterialProductCategoriesS_organic_natural_materials = "fats_oils" | "organic_natural_materials";

// 薬品
export type MaterialProductCategoriesS_chemicals = "chemicals";

// ========================= ✅「測定・分析」 大分類 measurement_analysis の小分類関連✅ =========================

// 距離測定器
export type AnalysisProductCategoriesS_distance_measuring_machine = "distance_measuring_instruments";

// 重量測定器
export type AnalysisProductCategoriesS_weight_measuring_machine =
  | "weight_measuring_instruments"
  | "scales"
  | "weighing_machines"
  | "other_weight_measuring_instruments";

// 電子計測器
export type AnalysisProductCategoriesS_electronic_measuring_machine =
  | "oscilloscopes"
  | "logic_analyzers"
  | "ammeters"
  | "power_meters"
  | "lcr_meters"
  | "time_frequency_measurement"
  | "signal_generators"
  | "electronic_loads"
  | "other_electronic_measuring_instruments"
  | "optical_measuring_instruments";

// ----------- 業種・製品分類 関連 ここまで -----------
