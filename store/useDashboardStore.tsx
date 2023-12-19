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
  SettingModalProperties,
  StripeSchedule,
  UserProfile,
  UserProfileCompanySubscription,
} from "@/types";
import { activityColumnHeaderItemListData } from "@/utils/activityColumnHeaderItemListDate";
import { companyColumnHeaderItemListData } from "@/utils/companyColumnHeaderItemListData";
import { contactColumnHeaderItemListData } from "@/utils/contactColumnHeaderItemListData";
import { meetingColumnHeaderItemListData } from "@/utils/meetingColumnHeaderItemListData";
import { propertyColumnHeaderItemListData } from "@/utils/propertyColumnHeaderItemListData";
// import { Session } from "@supabase/supabase-js";
import { ReactNode } from "react";
import Stripe from "stripe";
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

  // =================== 「会社画面」検索条件 ===================
  // 【「条件に一致する全ての会社をフェッチするか」、「条件に一致する自社で作成した会社のみをフェッチするか」の抽出条件を保持】
  isFetchAllCompanies: boolean;
  setIsFetchAllCompanies: (payload: boolean) => void;

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
  // 【アカウント設定モーダルの画面からのx, yとサイズ保持用】
  settingModalProperties: SettingModalProperties | null;
  setSettingModalProperties: (payload: SettingModalProperties) => void;
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
  notSetAccounts: MemberAccounts[];
  setNotSetAccounts: (payload: MemberAccounts[]) => void;
  // 未設定で削除よていのアカウントを保持するState
  notSetAndDeleteRequestedAccounts: MemberAccounts[];
  setNotSetAndDeleteRequestedAccounts: (payload: MemberAccounts[]) => void;
  // =================== アカウント設定 会社 ===================
  companyOwnerName: string;
  setCompanyOwnerName: (payload: string) => void;

  // =================== アカウント設定 メンバー ===================
  // // 【チームから削除クリック時の削除確認モーダル開閉状態】
  // removeTeamMember: MemberAccounts | null;
  // setRemoveTeamMember: (payload: MemberAccounts | null) => void;
  // // チームロールドロップダウンメニュー開閉状態
  // isOpenRoleMenu: boolean;
  // setIsOpenRoleMenu: (payload: boolean) => void;

  // =================== アカウント設定 支払いとプラン ===================
  // 【アカウントを増やす・アカウントを減らすモーダル開閉状態】 increase decrease nullを渡す
  isOpenChangeAccountCountsModal: string | null;
  setIsOpenChangeAccountCountsModal: (payload: string | null) => void;
  // 【アカウントを増やすモーダルの次回invoiceを取得するuseQueryのisReadyのState】
  isReadyQueryInvoice: boolean;
  setIsReadyQueryInvoice: (payload: boolean) => void;
  // 【アカウントを増やすモーダル StripeのnextInvoice保持用state】
  nextInvoice: Stripe.UpcomingInvoice | null;
  setNextInvoice: (payload: Stripe.UpcomingInvoice | null) => void;
  // 【プランを変更モーダル】
  nextInvoiceForChangePlan: Stripe.UpcomingInvoice | null;
  setNextInvoiceForChangePlan: (payload: Stripe.UpcomingInvoice | null) => void;
  // 【アカウントを削除リクエストしたスケジュール】
  deleteAccountRequestSchedule: StripeSchedule | null;
  setDeleteAccountRequestSchedule: (payload: StripeSchedule | null) => void;
  // 【プランをダウングレードのリクエストをしたスケジュール】
  downgradePlanSchedule: StripeSchedule | null;
  setDowngradePlanSchedule: (payload: StripeSchedule | null) => void;
  // 【デフォルトの支払い方法】
  defaultPaymentMethodState: any | null;
  setDefaultPaymentMethodState: (payload: any | null) => void;

  // =================== メンバーシップ再開 ===================
  // 【削除するメンバーのオブジェクトを保持する配列】
  selectedMembersArrayForDeletion: MemberAccounts[];
  setSelectedMembersArrayForDeletion: (payload: MemberAccounts[]) => void;

  // =================== アンダーテーブル関連 ===================
  // 【サーチモード切り替え】
  searchMode: boolean;
  setSearchMode: (payload: boolean) => void;
  // 【サーチ編集モード切り替え】
  editSearchMode: boolean;
  setEditSearchMode: (payload: boolean) => void;
  // 【エディットモード(フィールド編集モード)切り替え】
  isEditModeField: string | null;
  setIsEditModeField: (payload: string | null) => void;
  // 【下画面サイズ・フルスクリーンかデフォルトかを保持】
  underDisplayFullScreen: boolean;
  setUnderDisplayFullScreen: (payload: boolean) => void;

  // =================== クライアント会社編集用state関連 ===================
  editedClientCompany: Client_company;
  updateEditedClientCompany: (payload: Client_company) => void;
  resetEditedClientCompany: () => void;

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

  // =================== 会社テーブル ヘッダーリスト保持用state関連 ===================
  columnHeaderItemList: ColumnHeaderItemList[];
  setColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;

  // =================== 上画面の列選択した時に下画面に会社情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataCompany: Client_company_row_data | null;
  setSelectedRowDataCompany: (payload: Client_company_row_data) => void;

  // 会社データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  // newSearchCompanyCondition: Omit<Client_company_row_data, ''>
  newSearchCompanyParams: NewSearchCompanyParams | null;
  setNewSearchCompanyParams: (payload: NewSearchCompanyParams) => void;
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataCompanyに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataCompany: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataCompany: (payload: boolean) => void;

  // =================== 担当者テーブル ヘッダーリスト保持用state関連 ===================
  contactColumnHeaderItemList: ColumnHeaderItemList[];
  setContactColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataContact: Contact_row_data | null;
  setSelectedRowDataContact: (payload: Contact_row_data | null) => void;

  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchContact_CompanyParams: NewSearchContact_CompanyParams | null;
  setNewSearchContact_CompanyParams: (payload: NewSearchContact_CompanyParams) => void;
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataContactに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataContact: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataContact: (payload: boolean) => void;

  // =================== 活動テーブル ヘッダーリスト保持用state関連 ===================
  activityColumnHeaderItemList: ColumnHeaderItemList[];
  setActivityColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataActivity: Activity_row_data | null;
  setSelectedRowDataActivity: (payload: Activity_row_data | null) => void;
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchActivity_Contact_CompanyParams: NewSearchActivity_Contact_CompanyParams | null;
  setNewSearchActivity_Contact_CompanyParams: (payload: NewSearchActivity_Contact_CompanyParams) => void;
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataActivityに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataActivity: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataActivity: (payload: boolean) => void;

  // =================== 面談テーブル ヘッダーリスト保持用state関連 ===================
  meetingColumnHeaderItemList: ColumnHeaderItemList[];
  setMeetingColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataMeeting: Meeting_row_data | null;
  setSelectedRowDataMeeting: (payload: Meeting_row_data | null) => void;
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchMeeting_Contact_CompanyParams: NewSearchMeeting_Contact_CompanyParams | null;
  setNewSearchMeeting_Contact_CompanyParams: (payload: NewSearchMeeting_Contact_CompanyParams) => void;
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataMeetingに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataMeeting: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataMeeting: (payload: boolean) => void;

  // =================== 案件テーブル ヘッダーリスト保持用state関連 ===================
  propertyColumnHeaderItemList: ColumnHeaderItemList[];
  setPropertyColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の列選択した時に下画面に担当者情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataProperty: Property_row_data | null;
  setSelectedRowDataProperty: (payload: Property_row_data | null) => void;
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchProperty_Contact_CompanyParams: NewSearchProperty_Contact_CompanyParams | null;
  setNewSearchProperty_Contact_CompanyParams: (payload: NewSearchProperty_Contact_CompanyParams) => void;
  // INSERT,UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataPropertyに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataProperty: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataProperty: (payload: boolean) => void;
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
  // 【アカウント設定モーダルの画面からのx, yとサイズ保持用】
  settingModalProperties: null,
  setSettingModalProperties: (payload) => set({ settingModalProperties: payload }),

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
  notSetAccounts: [],
  setNotSetAccounts: (payload) => set({ notSetAccounts: payload }),
  // 未設定で削除よていのアカウントを保持するState
  notSetAndDeleteRequestedAccounts: [],
  setNotSetAndDeleteRequestedAccounts: (payload) => set({ notSetAndDeleteRequestedAccounts: payload }),
  // =================== アカウント設定 会社 ===================
  companyOwnerName: "",
  setCompanyOwnerName: (payload) => set({ companyOwnerName: payload }),

  // =================== アカウント設定 メンバー ===================
  // // 【チームから削除クリック時の削除確認モーダル開閉状態】
  // removeTeamMember: null,
  // setRemoveTeamMember: (payload) => set({ removeTeamMember: payload }),
  // // チームロールドロップダウンメニュー開閉状態
  // isOpenRoleMenu: false,
  // setIsOpenRoleMenu: (payload) => set({ isOpenRoleMenu: payload }),

  // =================== アカウント設定 支払いとプラン ===================
  // 【アカウントを増やす・アカウントを減らすモーダル開閉状態】 increase decrease nullを渡す
  isOpenChangeAccountCountsModal: null,
  setIsOpenChangeAccountCountsModal: (payload) => set({ isOpenChangeAccountCountsModal: payload }),
  // 【アカウントを増やすモーダルの次回invoiceを取得するuseQueryのisReadyのState】
  isReadyQueryInvoice: true,
  setIsReadyQueryInvoice: (payload) => set({ isReadyQueryInvoice: payload }),
  // 【アカウントを増やすモーダル StripeのnextInvoice保持用state】
  nextInvoice: null,
  setNextInvoice: (payload) => set({ nextInvoice: payload }),
  // 【プランを変更モーダル】
  nextInvoiceForChangePlan: null,
  setNextInvoiceForChangePlan: (payload) => set({ nextInvoiceForChangePlan: payload }),
  // 【アカウントを削除リクエストしたスケジュール】
  deleteAccountRequestSchedule: null,
  setDeleteAccountRequestSchedule: (payload) => set({ deleteAccountRequestSchedule: payload }),
  // 【プランをダウングレードのリクエストをしたスケジュール】
  downgradePlanSchedule: null,
  setDowngradePlanSchedule: (payload) => set({ downgradePlanSchedule: payload }),
  // 【デフォルトの支払い方法】
  defaultPaymentMethodState: null,
  setDefaultPaymentMethodState: (payload) => set({ defaultPaymentMethodState: payload }),

  // =================== メンバーシップ再開 ===================
  // 【削除するメンバーのオブジェクトを保持する配列】
  selectedMembersArrayForDeletion: [],
  setSelectedMembersArrayForDeletion: (payload) => set({ selectedMembersArrayForDeletion: payload }),

  // =================== テーブルサイズ切り替えボタン ===================
  // 【テーブルサイズ切り替えメニュー開閉状態】
  isOpenChangeSizeMenu: false,
  setIsOpenChangeSizeMenu: (payload) => set({ isOpenChangeSizeMenu: payload }),
  // 【テーブルサイズの保持】
  tableContainerSize: "one_third",
  setTableContainerSize: (payload) => set({ tableContainerSize: payload }),
  // =================== 「会社画面」検索条件 ===================
  // 【「条件に一致する全ての会社をフェッチするか」、「条件に一致する自社で作成した会社のみをフェッチするか」の抽出条件を保持】
  isFetchAllCompanies: true,
  setIsFetchAllCompanies: (payload) => set({ isFetchAllCompanies: payload }),
  // =================== アンダーテーブル関連 ===================
  // 【サーチモード切り替え】
  searchMode: false,
  setSearchMode: (payload) => set({ searchMode: payload }),
  // 【サーチ編集モード切り替え】
  editSearchMode: false,
  setEditSearchMode: (payload) => set({ editSearchMode: payload }),
  // 【エディットモード(フィールド編集モード)切り替え】
  isEditModeField: null,
  setIsEditModeField: (payload) => set({ isEditModeField: payload }),
  // 【下画面サイズ・フルスクリーンかデフォルトかを保持】
  underDisplayFullScreen: false,
  setUnderDisplayFullScreen: (payload) => set({ underDisplayFullScreen: payload }),

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

  // =================== 会社テーブル ヘッダーリスト保持用state関連 ===================
  // 上画面のテーブルはチェックボックスありで1のため、columnIndexは2から
  columnHeaderItemList: companyColumnHeaderItemListData,
  setColumnHeaderItemList: (payload) => set({ columnHeaderItemList: payload }),

  // =================== 上画面の列選択した時に下画面に会社情報を映す用のState ===================
  // 会社オブジェクト
  selectedRowDataCompany: null,
  setSelectedRowDataCompany: (payload) => set({ selectedRowDataCompany: payload }),

  // 会社データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  // newSearchCompanyParams: Omit<Client_company_row_data, ''>
  newSearchCompanyParams: null,
  setNewSearchCompanyParams: (payload) => set({ newSearchCompanyParams: payload }),
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataCompanyに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataCompany: false,
  setIsUpdateRequiredForLatestSelectedRowDataCompany: (payload) =>
    set({ isUpdateRequiredForLatestSelectedRowDataCompany: payload }),

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
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataContactに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataContact: false,
  setIsUpdateRequiredForLatestSelectedRowDataContact: (payload) =>
    set({ isUpdateRequiredForLatestSelectedRowDataContact: payload }),

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
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataActivityに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataActivity: false,
  setIsUpdateRequiredForLatestSelectedRowDataActivity: (payload) =>
    set({ isUpdateRequiredForLatestSelectedRowDataActivity: payload }),

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
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataMeetingに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataMeeting: false,
  setIsUpdateRequiredForLatestSelectedRowDataMeeting: (payload) =>
    set({ isUpdateRequiredForLatestSelectedRowDataMeeting: payload }),

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
  // INSERT,UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataPropertyに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataProperty: false,
  setIsUpdateRequiredForLatestSelectedRowDataProperty: (payload) =>
    set({ isUpdateRequiredForLatestSelectedRowDataProperty: payload }),
}));

export default useDashboardStore;
