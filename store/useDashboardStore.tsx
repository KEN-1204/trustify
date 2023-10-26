import {
  ActiveMenuTab,
  Activity_row_data,
  Client_company,
  Client_company_row_data,
  ColumnHeaderItemList,
  Contact_row_data,
  EditedProduct,
  Meeting_row_data,
  MemberAccounts,
  NewSearchActivity_Contact_CompanyParams,
  NewSearchCompanyParams,
  NewSearchContact_CompanyParams,
  NewSearchMeeting_Contact_CompanyParams,
  NewSearchProperty_Contact_CompanyParams,
  Notification,
  Product,
  Property_row_data,
  UserProfile,
  UserProfileCompanySubscription,
} from "@/types";
import { activityColumnHeaderItemListData } from "@/utils/activityColumnHeaderItemListDate";
import { contactColumnHeaderItemListData } from "@/utils/contactColumnHeaderItemListData";
import { meetingColumnHeaderItemListData } from "@/utils/meetingColumnHeaderItemListData";
import { propertyColumnHeaderItemListData } from "@/utils/propertyColumnHeaderItemListData";
// import { Session } from "@supabase/supabase-js";
import { ReactNode } from "react";
import { create } from "zustand";

type State = {
  // =================== サイドバー ===================
  // 【アクティブメニュータブ】
  activeMenuTab: ActiveMenuTab;
  setActiveMenuTab: (payload: ActiveMenuTab) => void;
  // 【サイドバーメニュー開閉状態】
  isOpenSideBarMenu: boolean;
  setIsOpenSideBarMenu: (payload: boolean) => void;
  // 【サイドバーピックボックス開閉状態】
  isOpenSideBarPickBox: boolean;
  setIsOpenSideBarPickBox: (payload: boolean) => void;
  // 【サイドバーの拡大・縮小】
  isOpenSidebar: boolean;
  setIsOpenSidebar: (payload: boolean) => void;
  // =================== データ編集モーダル ===================
  // 【データ編集モーダル開閉状態】
  isOpenEditModal: boolean;
  setIsOpenEditModal: (payload: boolean) => void;
  // 【データ編集モーダル テキストエリア内容】
  textareaInput: string;
  setTextareaInput: (payload: string) => void;
  // =================== テーブルカラム編集モーダル ===================
  // 【テーブルカラム編集モーダル開閉状態】
  isOpenEditColumns: boolean;
  setIsOpenEditColumns: (payload: boolean) => void;
  // 【カラム順番入れ替え・表示非表示の編集内容保持state】
  editedColumnHeaderItemList: ColumnHeaderItemList[];
  setEditedColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // 【カラム順番入れ替え 初期状態の内容を保持してリセット可能にするstate】
  resetColumnHeaderItemList: ColumnHeaderItemList[];
  setResetColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  ColumnHeaderItemListReset: (payload: ColumnHeaderItemList[]) => void;

  // =================== テーブルサイズ切り替え ===================
  // 【テーブルサイズ切り替えメニュー開閉状態】
  isOpenChangeSizeMenu: boolean;
  setIsOpenChangeSizeMenu: (payload: boolean) => void;
  // 【テーブルサイズの保持】
  tableContainerSize: string;
  setTableContainerSize: (payload: string) => void;

  // =================== 会社作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewClientCompanyModal: boolean;
  setIsOpenInsertNewClientCompanyModal: (payload: boolean) => void;
  // 編集モーダル
  isOpenUpdateClientCompanyModal: boolean;
  setIsOpenUpdateClientCompanyModal: (payload: boolean) => void;

  // =================== 担当者作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewContactModal: boolean;
  setIsOpenInsertNewContactModal: (payload: boolean) => void;
  // 編集モーダル
  isOpenUpdateContactModal: boolean;
  setIsOpenUpdateContactModal: (payload: boolean) => void;

  // =================== 活動作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewActivityModal: boolean;
  setIsOpenInsertNewActivityModal: (payload: boolean) => void;
  // 編集モーダル
  isOpenUpdateActivityModal: boolean;
  setIsOpenUpdateActivityModal: (payload: boolean) => void;

  // =================== 面談作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewMeetingModal: boolean;
  setIsOpenInsertNewMeetingModal: (payload: boolean) => void;
  // 編集モーダル
  isOpenUpdateMeetingModal: boolean;
  setIsOpenUpdateMeetingModal: (payload: boolean) => void;
  // =================== 案件作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewPropertyModal: boolean;
  setIsOpenInsertNewPropertyModal: (payload: boolean) => void;
  // 編集モーダル
  isOpenUpdatePropertyModal: boolean;
  setIsOpenUpdatePropertyModal: (payload: boolean) => void;

  // =================== アカウント設定モーダル ===================
  // アカウント設定開閉
  isOpenSettingAccountModal: boolean;
  setIsOpenSettingAccountModal: (payload: boolean) => void;
  // 選択中のメニュー
  selectedSettingAccountMenu: string;
  setSelectedSettingAccountMenu: (payload: string) => void;
  // =================== 製品追加・編集モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewProductModal: boolean;
  setIsOpenInsertNewProductModal: (payload: boolean) => void;
  // 編集モーダル
  isOpenUpdateProductModal: boolean;
  setIsOpenUpdateProductModal: (payload: boolean) => void;
  // 編集中のProduct
  editedProduct: EditedProduct;
  setEditedProduct: (payload: EditedProduct) => void;
  // 現在の製品情報をStateに格納
  productsState: Product[];
  setProductsState: (payload: Product[]) => void;
  // =================== 招待メールモーダル ===================
  // 招待モーダル開閉
  isOpenSettingInvitationModal: boolean;
  setIsOpenSettingInvitationModal: (payload: boolean) => void;
  // 未設定アカウント数を保持するState
  // notSetAccountsCount: number | null;
  // setNotSetAccountsCount: (payload: number | null) => void;
  notSetAccounts: MemberAccounts[] | null[];
  setNotSetAccounts: (payload: MemberAccounts[] | null[]) => void;
  // =================== アカウント設定 会社 ===================
  companyOwnerName: string;
  setCompanyOwnerName: (payload: string) => void;

  // =================== アカウント設定 メンバー ===================
  // 【チームから削除クリック時の削除確認モーダル開閉状態】
  // removeTeamMember: MemberAccounts | null;
  // setRemoveTeamMember: (payload: MemberAccounts | null) => void;

  // =================== アンダーテーブル関連 ===================
  // 【サーチモード切り替え】
  searchMode: boolean;
  setSearchMode: (payload: boolean) => void;
  // 【サーチ編集モード切り替え】
  editSearchMode: boolean;
  setEditSearchMode: (payload: boolean) => void;
  // 【下画面サイズ・フルスクリーンかデフォルトかを保持】
  underDisplayFullScreen: boolean;
  setUnderDisplayFullScreen: (payload: boolean) => void;

  // =================== クライアント会社編集用state関連 ===================
  editedClientCompany: Client_company;
  updateEditedClientCompany: (payload: Client_company) => void;
  resetEditedClientCompany: () => void;

  // =================== 会社テーブル ヘッダーリスト保持用state関連 ===================
  columnHeaderItemList: ColumnHeaderItemList[];
  setColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;

  // =================== 上画面の列選択した時に下画面に会社情報を映す用のState ===================
  // オブジェクト
  selectedRowDataCompany: Client_company_row_data | null;
  setSelectedRowDataCompany: (payload: Client_company_row_data) => void;

  // 会社データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  // newSearchCompanyCondition: Omit<Client_company_row_data, ''>
  newSearchCompanyParams: NewSearchCompanyParams | null;
  setNewSearchCompanyParams: (payload: NewSearchCompanyParams) => void;

  // =================== ローディング状態保持 ===================
  loadingGlobalState: boolean;
  setLoadingGlobalState: (payload: boolean) => void;

  // =================== ユーザープロフィール ===================
  userProfileState: UserProfileCompanySubscription | null;
  setUserProfileState: (payload: UserProfileCompanySubscription | null) => void;
  // userProfileState: UserProfile | null;
  // setUserProfileState: (payload: UserProfile | null) => void;

  // =================== 「お知らせ」notifications関連 ===================
  // 全お知らせ
  myAllNotifications: Notification[] | [];
  setMyAllNotifications: (payload: Notification[] | []) => void;
  // 未読+ToDo Newのお知らせ
  unReadNotifications: Notification[] | [];
  setUnReadNotifications: (payload: Notification[] | []) => void;
  // 既読+ToDoのお知らせ
  alreadyReadNotifications: Notification[] | [];
  setAlreadyReadNotifications: (payload: Notification[] | []) => void;
  // 未完了のお知らせ
  incompleteNotifications: Notification[] | [];
  setIncompleteNotifications: (payload: Notification[] | []) => void;
  // 完了済みのお知らせ
  completedNotifications: Notification[] | [];
  setCompletedNotifications: (payload: Notification[] | []) => void;
  // 【お知らせの所有者変更モーダル開閉状態】
  openNotificationChangeTeamOwnerModal: boolean;
  setOpenNotificationChangeTeamOwnerModal: (payload: boolean) => void;
  // 【お知らせの所有者変更モーダルをクリック時にお知らせの情報を保持するState】
  notificationDataState: Notification | null;
  setNotificationDataState: (payload: Notification | null) => void;

  // =================== プロフィールメニュー ===================
  // 【プロフィールメニュー開閉状態】

  // =================== 担当者テーブル ヘッダーリスト保持用state関連 ===================
  contactColumnHeaderItemList: ColumnHeaderItemList[];
  setContactColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // オブジェクト
  selectedRowDataContact: Contact_row_data | null;
  setSelectedRowDataContact: (payload: Contact_row_data | null) => void;

  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchContact_CompanyParams: NewSearchContact_CompanyParams | null;
  setNewSearchContact_CompanyParams: (payload: NewSearchContact_CompanyParams) => void;

  // =================== 活動テーブル ヘッダーリスト保持用state関連 ===================
  activityColumnHeaderItemList: ColumnHeaderItemList[];
  setActivityColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // オブジェクト
  selectedRowDataActivity: Activity_row_data | null;
  setSelectedRowDataActivity: (payload: Activity_row_data | null) => void;
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchActivity_Contact_CompanyParams: NewSearchActivity_Contact_CompanyParams | null;
  setNewSearchActivity_Contact_CompanyParams: (payload: NewSearchActivity_Contact_CompanyParams) => void;

  // =================== 面談テーブル ヘッダーリスト保持用state関連 ===================
  meetingColumnHeaderItemList: ColumnHeaderItemList[];
  setMeetingColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // オブジェクト
  selectedRowDataMeeting: Meeting_row_data | null;
  setSelectedRowDataMeeting: (payload: Meeting_row_data | null) => void;
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchMeeting_Contact_CompanyParams: NewSearchMeeting_Contact_CompanyParams | null;
  setNewSearchMeeting_Contact_CompanyParams: (payload: NewSearchMeeting_Contact_CompanyParams) => void;

  // =================== 案件テーブル ヘッダーリスト保持用state関連 ===================
  propertyColumnHeaderItemList: ColumnHeaderItemList[];
  setPropertyColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // オブジェクト
  selectedRowDataProperty: Property_row_data | null;
  setSelectedRowDataProperty: (payload: Property_row_data | null) => void;
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchProperty_Contact_CompanyParams: NewSearchProperty_Contact_CompanyParams | null;
  setNewSearchProperty_Contact_CompanyParams: (payload: NewSearchProperty_Contact_CompanyParams) => void;
};

const useDashboardStore = create<State>((set) => ({
  // =================== サイドバー ===================
  // 【アクティブメニュータブ】
  activeMenuTab: "HOME",
  setActiveMenuTab: (payload) => set({ activeMenuTab: payload }),
  // 【サイドバーメニュー開閉状態】
  isOpenSideBarMenu: true,
  setIsOpenSideBarMenu: (payload) => set({ isOpenSideBarMenu: payload }),
  // 【サイドバーピックボックス開閉状態】
  isOpenSideBarPickBox: true,
  setIsOpenSideBarPickBox: (payload) => set({ isOpenSideBarPickBox: payload }),
  // 【サイドバーの拡大・縮小】
  isOpenSidebar: true,
  setIsOpenSidebar: (payload) => set({ isOpenSidebar: payload }),

  // =================== データ編集モーダル ===================
  // 【データ編集モーダル開閉状態】
  isOpenEditModal: false,
  setIsOpenEditModal: (payload) => set({ isOpenEditModal: payload }),
  // 【データ編集モーダル テキストエリア内容】
  textareaInput: "",
  setTextareaInput: (payload) => set({ textareaInput: payload }),

  // =================== テーブルカラム編集モーダル ===================
  // 【テーブルカラム編集モーダル開閉状態】
  isOpenEditColumns: false,
  setIsOpenEditColumns: (payload) => set({ isOpenEditColumns: payload }),
  // 【カラム順番入れ替え・表示非表示モーダルの編集内容保持state】
  editedColumnHeaderItemList: [],
  setEditedColumnHeaderItemList: (payload) => set({ editedColumnHeaderItemList: payload }),
  // 【カラム順番入れ替え 初期状態の内容を保持してリセット可能にするstate】
  resetColumnHeaderItemList: [],
  setResetColumnHeaderItemList: (payload) => set({ resetColumnHeaderItemList: payload }),
  ColumnHeaderItemListReset: (payload) => set({ resetColumnHeaderItemList: payload }),

  // =================== 会社作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewClientCompanyModal: false,
  setIsOpenInsertNewClientCompanyModal: (payload) => set({ isOpenInsertNewClientCompanyModal: payload }),
  // 編集モーダル
  isOpenUpdateClientCompanyModal: false,
  setIsOpenUpdateClientCompanyModal: (payload) => set({ isOpenUpdateClientCompanyModal: payload }),

  // =================== 担当者作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewContactModal: false,
  setIsOpenInsertNewContactModal: (payload) => set({ isOpenInsertNewContactModal: payload }),
  // 編集モーダル
  isOpenUpdateContactModal: false,
  setIsOpenUpdateContactModal: (payload) => set({ isOpenUpdateContactModal: payload }),

  // =================== 活動作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewActivityModal: false,
  setIsOpenInsertNewActivityModal: (payload) => set({ isOpenInsertNewActivityModal: payload }),
  // 編集モーダル
  isOpenUpdateActivityModal: false,
  setIsOpenUpdateActivityModal: (payload) => set({ isOpenUpdateActivityModal: payload }),

  // =================== 面談作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewMeetingModal: false,
  setIsOpenInsertNewMeetingModal: (payload) => set({ isOpenInsertNewMeetingModal: payload }),
  // 編集モーダル
  isOpenUpdateMeetingModal: false,
  setIsOpenUpdateMeetingModal: (payload) => set({ isOpenUpdateMeetingModal: payload }),

  // =================== 案件作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewPropertyModal: false,
  setIsOpenInsertNewPropertyModal: (payload) => set({ isOpenInsertNewPropertyModal: payload }),
  // 編集モーダル
  isOpenUpdatePropertyModal: false,
  setIsOpenUpdatePropertyModal: (payload) => set({ isOpenUpdatePropertyModal: payload }),

  // =================== アカウント設定モーダル ===================
  // 開閉
  isOpenSettingAccountModal: false,
  setIsOpenSettingAccountModal: (payload) => set({ isOpenSettingAccountModal: payload }),
  // 選択中のメニュー
  selectedSettingAccountMenu: "Profile",
  setSelectedSettingAccountMenu: (payload) => set({ selectedSettingAccountMenu: payload }),

  // =================== 製品追加・編集モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewProductModal: false,
  setIsOpenInsertNewProductModal: (payload) => set({ isOpenInsertNewProductModal: payload }),
  // 編集モーダル
  isOpenUpdateProductModal: false,
  setIsOpenUpdateProductModal: (payload) => set({ isOpenUpdateProductModal: payload }),
  // 編集中のProduct
  editedProduct: {
    id: "",
    created_at: "",
    created_by_company_id: "",
    created_by_user_id: "",
    created_by_department_of_user: "",
    created_by_unit_of_user: "",
    product_name: "",
    inside_short_name: "",
    outside_short_name: "",
    unit_price: null,
  },
  setEditedProduct: (payload) => set({ editedProduct: payload }),
  // 現在の製品情報をStateに格納
  productsState: [],
  setProductsState: (payload) => set({ productsState: payload }),
  // =================== 招待メールモーダル ===================
  // 招待モーダル開閉
  isOpenSettingInvitationModal: false,
  setIsOpenSettingInvitationModal: (payload) => set({ isOpenSettingInvitationModal: payload }),
  // 未設定アカウント数を保持するState
  // notSetAccountsCount: null,
  // setNotSetAccountsCount: (payload) => set({ notSetAccountsCount: payload }),
  notSetAccounts: [],
  setNotSetAccounts: (payload) => set({ notSetAccounts: payload }),
  // =================== アカウント設定 会社 ===================
  companyOwnerName: "",
  setCompanyOwnerName: (payload) => set({ companyOwnerName: payload }),

  // =================== アカウント設定 メンバー ===================
  // 【チームから削除クリック時の削除確認モーダル開閉状態】
  // removeTeamMember: null,
  // setRemoveTeamMember: (payload) => set({ removeTeamMember: payload }),

  // =================== テーブルサイズ切り替えボタン ===================
  // 【テーブルサイズ切り替えメニュー開閉状態】
  isOpenChangeSizeMenu: false,
  setIsOpenChangeSizeMenu: (payload) => set({ isOpenChangeSizeMenu: payload }),
  // 【テーブルサイズの保持】
  tableContainerSize: "one_third",
  setTableContainerSize: (payload) => set({ tableContainerSize: payload }),
  // =================== アンダーテーブル関連 ===================
  // 【サーチモード切り替え】
  searchMode: false,
  setSearchMode: (payload) => set({ searchMode: payload }),
  // 【サーチ編集モード切り替え】
  editSearchMode: false,
  setEditSearchMode: (payload) => set({ editSearchMode: payload }),
  // 【下画面サイズ・フルスクリーンかデフォルトかを保持】
  underDisplayFullScreen: false,
  setUnderDisplayFullScreen: (payload) => set({ underDisplayFullScreen: payload }),

  // =================== 会社テーブル ヘッダーリスト保持用state関連 ===================
  // 上画面のテーブルはチェックボックスありで1のため、columnIndexは2から
  columnHeaderItemList: [
    {
      columnId: 0,
      columnIndex: 2,
      columnName: "id",
      columnWidth: "50px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 1,
      columnIndex: 3,
      columnName: "corporate_number",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 2,
      columnIndex: 4,
      columnName: "name",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 3,
      columnIndex: 5,
      columnName: "department_name",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 4,
      columnIndex: 6,
      columnName: "representative_name",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 5,
      columnIndex: 7,
      columnName: "main_phone_number",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 6,
      columnIndex: 8,
      columnName: "main_fax",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 7,
      columnIndex: 9,
      columnName: "zipcode",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 8,
      columnIndex: 10,
      columnName: "address",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 9,
      columnIndex: 11,
      columnName: "number_of_employees",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 10,
      columnIndex: 12,
      columnName: "number_of_employees_class",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 11,
      columnIndex: 13,
      columnName: "capital",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 12,
      columnIndex: 14,
      columnName: "established_in",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 13,
      columnIndex: 15,
      columnName: "business_content",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 14,
      columnIndex: 16,
      columnName: "email",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 15,
      columnIndex: 17,
      columnName: "website_url",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 16,
      columnIndex: 18,
      columnName: "industry_large",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 17,
      columnIndex: 19,
      columnName: "industry_small",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 18,
      columnIndex: 20,
      columnName: "industry_type",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 19,
      columnIndex: 21,
      columnName: "product_category_large",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 20,
      columnIndex: 22,
      columnName: "product_category_medium",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 21,
      columnIndex: 23,
      columnName: "product_category_small",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },

    {
      columnId: 22,
      columnIndex: 24,
      columnName: "fiscal_end_month",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },

    {
      columnId: 23,
      columnIndex: 25,
      columnName: "clients",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 24,
      columnIndex: 26,
      columnName: "supplier",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    // {
    //   columnId: 21,
    //   columnIndex: 23,
    //   columnName: "representative_position_name",
    //   columnWidth: "200px",
    //   isFrozen: false,
    //   isOverflow: false,
    // },
    {
      columnId: 25,
      columnIndex: 27,
      columnName: "chairperson",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 26,
      columnIndex: 28,
      columnName: "senior_vice_president",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 27,
      columnIndex: 29,
      columnName: "senior_managing_director",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 28,
      columnIndex: 30,
      columnName: "managing_director",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 29,
      columnIndex: 31,
      columnName: "director",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 30,
      columnIndex: 32,
      columnName: "auditor",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 31,
      columnIndex: 33,
      columnName: "manager",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 32,
      columnIndex: 34,
      columnName: "member",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 33,
      columnIndex: 35,
      columnName: "facility",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 34,
      columnIndex: 36,
      columnName: "business_sites",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 35,
      columnIndex: 37,
      columnName: "overseas_bases",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },
    {
      columnId: 36,
      columnIndex: 38,
      columnName: "group_company",
      columnWidth: "200px",
      isFrozen: false,
      isOverflow: false,
    },

    // {
    //   columnId: 36,
    //   columnIndex: 38,
    //   columnName: "subsidiary",
    //   columnWidth: "200px",
    //   isFrozen: false,
    //   isOverflow: false,
    // },
  ],
  setColumnHeaderItemList: (payload) => set({ columnHeaderItemList: payload }),

  // =================== クライアント会社編集用state関連 ===================
  editedClientCompany: {
    id: "",
    address: "",
    auditor: "",
    ban_reason: "",
    budget_request_month1: null,
    budget_request_month2: null,
    business_content: "",
    business_sites: "",
    call_careful_flag: null,
    call_careful_reason: "",
    capital: null,
    corporate_number: null,
    chairperson: "",
    claim: "",
    clients: "",
    created_by_company_id: "",
    created_by_department_of_user: "",
    created_by_unit_of_user: "",
    created_by_user_id: "",
    department_contacts: "",
    department_name: "",
    director: "",
    email: "",
    email_ban_flag: null,
    established_in: "",
    facility: "",
    fax_dm_ban_flag: null,
    fiscal_end_month: null,
    group_company: "",
    industry_large: "",
    industry_small: "",
    industry_type: "",
    main_fax: "",
    main_phone_number: "",
    manager: "",
    managing_director: "",
    member: "",
    name: "",
    number_of_employees_class: "",
    number_of_employees: "",
    overseas_bases: "",
    product_category_large: "",
    product_category_medium: "",
    product_category_small: "",
    representative_name: "",
    representative_position_name: "",
    sending_ban_flag: null,
    senior_managing_director: "",
    senior_vice_president: "",
    supplier: "",
    website_url: "",
    zipcode: "",
  },
  updateEditedClientCompany: (payload) =>
    set({
      editedClientCompany: {
        id: payload.id,
        address: payload.address,
        auditor: payload.auditor,
        // ban_reason: payload.ban_reason,
        budget_request_month1: payload.budget_request_month1,
        budget_request_month2: payload.budget_request_month2,
        business_content: payload.business_content,
        business_sites: payload.business_sites,
        // call_careful_flag: payload.call_careful_flag,
        // call_careful_reason: payload.call_careful_reason,
        capital: payload.capital,
        corporate_number: payload.corporate_number,
        chairperson: payload.chairperson,
        // claim: payload.claim,
        clients: payload.clients,
        created_by_company_id: payload.created_by_company_id,
        created_by_department_of_user: payload.created_by_department_of_user,
        created_by_unit_of_user: payload.created_by_unit_of_user,
        created_by_user_id: payload.created_by_user_id,
        department_contacts: payload.department_contacts,
        department_name: payload.department_name,
        director: payload.director,
        email: payload.email,
        // email_ban_flag: payload.email_ban_flag,
        established_in: payload.established_in,
        facility: payload.facility,
        // fax_dm_ban_flag: payload.fax_dm_ban_flag,
        fiscal_end_month: payload.fiscal_end_month,
        group_company: payload.group_company,
        industry_large: payload.industry_large,
        industry_small: payload.industry_small,
        industry_type: payload.industry_type,
        main_fax: payload.main_fax,
        main_phone_number: payload.main_phone_number,
        manager: payload.manager,
        managing_director: payload.managing_director,
        member: payload.member,
        name: payload.name,
        number_of_employees_class: payload.number_of_employees_class,
        number_of_employees: payload.number_of_employees,
        overseas_bases: payload.overseas_bases,
        product_category_large: payload.product_category_large,
        product_category_medium: payload.product_category_medium,
        product_category_small: payload.product_category_small,
        representative_name: payload.representative_name,
        // representative_position_name: payload.representative_position_name,
        // sending_ban_flag: payload.sending_ban_flag,
        senior_managing_director: payload.senior_managing_director,
        senior_vice_president: payload.senior_vice_president,
        supplier: payload.supplier,
        website_url: payload.website_url,
        zipcode: payload.zipcode,
      },
    }),
  resetEditedClientCompany: () =>
    set({
      editedClientCompany: {
        id: "",
        address: "",
        auditor: "",
        // ban_reason: "",
        budget_request_month1: null,
        budget_request_month2: null,
        business_content: "",
        business_sites: "",
        // call_careful_flag: null,
        // call_careful_reason: "",
        capital: null,
        corporate_number: null,
        chairperson: "",
        // claim: "",
        clients: "",
        created_by_company_id: "",
        created_by_department_of_user: "",
        created_by_unit_of_user: "",
        created_by_user_id: "",
        department_contacts: "",
        department_name: "",
        director: "",
        email: "",
        // email_ban_flag: null,
        established_in: "",
        facility: "",
        // fax_dm_ban_flag: null,
        fiscal_end_month: null,
        group_company: "",
        industry_large: "",
        industry_small: "",
        industry_type: "",
        main_fax: "",
        main_phone_number: "",
        manager: "",
        managing_director: "",
        member: "",
        name: "",
        number_of_employees_class: "",
        number_of_employees: "",
        overseas_bases: "",
        product_category_large: "",
        product_category_medium: "",
        product_category_small: "",
        representative_name: "",
        // representative_position_name: "",
        // sending_ban_flag: null,
        senior_managing_director: "",
        senior_vice_president: "",
        supplier: "",
        website_url: "",
        zipcode: "",
      },
    }),

  // =================== 上画面の列選択した時に下画面に会社情報を映す用のState ===================
  // 会社オブジェクト
  selectedRowDataCompany: null,
  setSelectedRowDataCompany: (payload) => set({ selectedRowDataCompany: payload }),

  // 会社データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  // newSearchCompanyParams: Omit<Client_company_row_data, ''>
  newSearchCompanyParams: null,
  setNewSearchCompanyParams: (payload) => set({ newSearchCompanyParams: payload }),

  // =================== ローディング状態保持 ===================
  loadingGlobalState: false,
  setLoadingGlobalState: (payload) => set({ loadingGlobalState: payload }),

  // =================== ユーザープロフィール ===================
  userProfileState: null,
  setUserProfileState: (payload) => set({ userProfileState: payload }),

  // =================== 「お知らせ」notifications関連 ===================
  // 全お知らせ
  myAllNotifications: [],
  setMyAllNotifications: (payload) => set({ myAllNotifications: payload }),
  // 未読+ToDo Newのお知らせ
  unReadNotifications: [],
  setUnReadNotifications: (payload) => set({ unReadNotifications: payload }),
  // 既読+ToDoのお知らせ
  alreadyReadNotifications: [],
  setAlreadyReadNotifications: (payload) => set({ alreadyReadNotifications: payload }),
  // 未完了のお知らせ
  incompleteNotifications: [],
  setIncompleteNotifications: (payload) => set({ incompleteNotifications: payload }),
  // 完了済みのお知らせ
  completedNotifications: [],
  setCompletedNotifications: (payload) => set({ completedNotifications: payload }),
  // 【お知らせの所有者変更モーダル開閉状態】
  openNotificationChangeTeamOwnerModal: false,
  setOpenNotificationChangeTeamOwnerModal: (payload) => set({ openNotificationChangeTeamOwnerModal: payload }),
  // 【お知らせの所有者変更モーダルをクリック時にお知らせの情報を保持するState】
  notificationDataState: null,
  setNotificationDataState: (payload) => set({ notificationDataState: payload }),

  // =================== 担当者テーブル ヘッダーリスト保持用state関連 ===================
  // 上画面のテーブルはチェックボックスありで1のため、columnIndexは2から
  contactColumnHeaderItemList: contactColumnHeaderItemListData,
  setContactColumnHeaderItemList: (payload) => set({ contactColumnHeaderItemList: payload }),

  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // オブジェクト
  selectedRowDataContact: null,
  setSelectedRowDataContact: (payload) => set({ selectedRowDataContact: payload }),

  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchContact_CompanyParams: null,
  setNewSearchContact_CompanyParams: (payload) => set({ newSearchContact_CompanyParams: payload }),

  // =================== 活動テーブル ヘッダーリスト保持用state関連 ===================
  // 上画面のテーブルはチェックボックスありで1のため、columnIndexは2から
  activityColumnHeaderItemList: activityColumnHeaderItemListData,
  setActivityColumnHeaderItemList: (payload) => set({ activityColumnHeaderItemList: payload }),

  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // オブジェクト
  selectedRowDataActivity: null,
  setSelectedRowDataActivity: (payload) => set({ selectedRowDataActivity: payload }),

  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchActivity_Contact_CompanyParams: null,
  setNewSearchActivity_Contact_CompanyParams: (payload) => set({ newSearchActivity_Contact_CompanyParams: payload }),

  // =================== 面談テーブル ヘッダーリスト保持用state関連 ===================
  meetingColumnHeaderItemList: meetingColumnHeaderItemListData,
  setMeetingColumnHeaderItemList: (payload) => set({ meetingColumnHeaderItemList: payload }),
  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // オブジェクト
  selectedRowDataMeeting: null,
  setSelectedRowDataMeeting: (payload) => set({ selectedRowDataMeeting: payload }),

  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchMeeting_Contact_CompanyParams: null,
  setNewSearchMeeting_Contact_CompanyParams: (payload) => set({ newSearchMeeting_Contact_CompanyParams: payload }),

  // =================== 案件テーブル ヘッダーリスト保持用state関連 ===================
  propertyColumnHeaderItemList: propertyColumnHeaderItemListData,
  setPropertyColumnHeaderItemList: (payload) => set({ propertyColumnHeaderItemList: payload }),

  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // オブジェクト
  selectedRowDataProperty: null,
  setSelectedRowDataProperty: (payload) => set({ selectedRowDataProperty: payload }),
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchProperty_Contact_CompanyParams: null,
  setNewSearchProperty_Contact_CompanyParams: (payload) => set({ newSearchProperty_Contact_CompanyParams: payload }),
}));

export default useDashboardStore;
