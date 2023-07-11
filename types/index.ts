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

// =================== アクティブタブ ===================
export type ActiveMenuTab = string;

// =================== カラム順番 ===================
export type ColumnHeaderItemList = {
  columnId: number;
  columnName: string;
  columnIndex: number;
  columnWidth: string;
  isOverflow: boolean;
};

// =================== サイドバーセクション開閉状態 ===================

// =================== Profile ===================

//supabaseのprofilesテーブルのフィールド内容にデータ型を定義 初回登録時はsupabaseから取得の際にundefinedで返ってきて登録になるので、データ型はユニオン型で定義
export type Profile = {
  id: string | undefined;
  created_at: string;
  updated_at: string | null;
  avatar_url: string | null;
  signature_stamp_id: string | null;
  employee_id: string | null;
  company_id: string | null;
  subscription_id: string | null;
  is_subscriber: boolean | null;
  company_role: string | null;
  role: string | null;
  stripe_customer_id: string | null;
  created_by_company_id: string | null;
  created_by_user_id: string | null;
  created_by_department_of_user: string | null;
  created_by_unit_of_user: string | null;
  profile_name: string | null;
  last_name: string | null;
  first_name: string | null;
  department: string | null;
  direct_line: string | null;
  direct_fax: string | null;
  company_cell_phone: string | null;
  personal_cell_phone: string | null;
  email: string | null;
  position: string | null;
  position_class: string | null;
  occupation: string | null;
  approval_amount: number | null;
  call_ban_flag: boolean | null;
  email_ban_flag: boolean | null;
  sending_materials_ban_flag: boolean | null;
  visit_ban_flag: boolean | null;
  is_active: boolean | null;
};

export type EditedProfile = {};
