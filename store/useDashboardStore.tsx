import {
  ActiveMenuTab,
  Activity_row_data,
  Client_company,
  Client_company_row_data,
  ColumnHeaderItemList,
  Contact_row_data,
  DisplayKeys,
  EditPosition,
  EditedCard,
  EditedProduct,
  FiscalYearMonthObjForTarget,
  InputSalesTargetsIdToDataMap,
  InputSalesTargets,
  MainEntityTarget,
  Meeting_row_data,
  MemberAccounts,
  NewSearchActivity_Contact_CompanyParams,
  NewSearchCompanyParams,
  NewSearchContact_CompanyParams,
  NewSearchMeeting_Contact_CompanyParams,
  NewSearchProperty_Contact_CompanyParams,
  NewSearchQuotation_Contact_CompanyParams,
  Notification,
  PeriodSDB,
  Product,
  Property_row_data,
  QuotationProductsDetail,
  Quotation_row_data,
  SelectedDealCard,
  SettingModalProperties,
  StampObj,
  StatusClosingDays,
  StripeSchedule,
  UpsertSettingEntitiesObj,
  UpsertTargetObj,
  UserProfile,
  UserProfileCompanySubscription,
  TotalSalesTargetsYearHalf,
  SalesTargetsYearHalf,
  TotalSalesTargetsYearHalfObj,
  TotalSalesTargetsHalfDetailsObj,
  MonthTargetStatusMapForAllMembers,
  MainTotalTargets,
  SubEntitySalesTarget,
} from "@/types";
import { activityColumnHeaderItemListData } from "@/utils/activityColumnHeaderItemListDate";
import { companyColumnHeaderItemListData } from "@/utils/companyColumnHeaderItemListData";
import { contactColumnHeaderItemListData } from "@/utils/contactColumnHeaderItemListData";
import { meetingColumnHeaderItemListData } from "@/utils/meetingColumnHeaderItemListData";
import { propertyColumnHeaderItemListData } from "@/utils/propertyColumnHeaderItemListData";
import { quotationColumnHeaderItemListData } from "@/utils/quotationColumnHeaderItemListData";
import {
  salesTargetColumnHeaderItemListData,
  salesTargetWithYoYColumnHeaderItemListData,
} from "@/utils/salesTargetColumnHeaderItemListData";
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

  // =================== テーブル各種設定 ===================
  // Row evenの色を変更
  evenRowColorChange: boolean;
  setEvenRowColorChange: (payload: boolean) => void;
  // 検索タイプ (デフォルトで部分一致検索)
  searchType: string;
  setSearchType: (payload: string) => void;

  // =================== 「会社画面」検索条件 ===================
  // 【「条件に一致する全ての会社をフェッチするか」、「条件に一致する自社で作成した会社のみをフェッチするか」の抽出条件を保持】
  isFetchAllCompanies: boolean;
  setIsFetchAllCompanies: (payload: boolean) => void;
  // =================== 「活動」「面談」「案件」用、部署、課、係、事業所切り替えドロップダウンメニュー ===================
  // 自事業部か、全事業部かを選択
  isFetchAllDepartments: boolean;
  setIsFetchAllDepartments: (payload: boolean) => void;
  // 自課か全課か
  isFetchAllSections: boolean;
  setIsFetchAllSections: (payload: boolean) => void;
  // 自係か全係か
  isFetchAllUnits: boolean;
  setIsFetchAllUnits: (payload: boolean) => void;
  // 自事業所か全事業所か
  isFetchAllOffices: boolean;
  setIsFetchAllOffices: (payload: boolean) => void;
  // 全ユーザーか自分のか
  isFetchAllMembers: boolean;
  setIsFetchAllMembers: (payload: boolean) => void;

  // ---------------- 詳細画面モーダル ----------------
  // 会社詳細画面
  isOpenClientCompanyDetailModal: boolean;
  setIsOpenClientCompanyDetailModal: (payload: boolean) => void;
  // 担当者詳細画面
  isOpenContactDetailModal: boolean;
  setIsOpenContactDetailModal: (payload: boolean) => void;
  // 案件詳細モーダル(SDBネタ表)
  isOpenPropertyDetailModal: boolean;
  setIsOpenPropertyDetailModal: (payload: boolean) => void;

  // =================== 会社作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewClientCompanyModal: boolean;
  setIsOpenInsertNewClientCompanyModal: (payload: boolean) => void;
  // 編集モーダル
  isOpenUpdateClientCompanyModal: boolean;
  setIsOpenUpdateClientCompanyModal: (payload: boolean) => void;
  // 会社複製可否state
  isDuplicateCompany: boolean;
  setIsDuplicateCompany: (payload: boolean) => void;

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
  // =================== 見積作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewQuotationModal: boolean;
  setIsOpenInsertNewQuotationModal: (payload: boolean) => void;
  // 編集モーダル
  isOpenUpdateQuotationModal: boolean;
  setIsOpenUpdateQuotationModal: (payload: boolean) => void;

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

  // =================== サイドテーブル 印鑑データ ===================
  isOpenSearchStampSideTable: boolean;
  setIsOpenSearchStampSideTable: (payload: boolean) => void;
  isOpenSearchStampSideTableBefore: boolean;
  setIsOpenSearchStampSideTableBefore: (payload: boolean) => void;
  prevStampObj: StampObj;
  setPrevStampObj: (payload: StampObj) => void;
  stampObj: StampObj;
  setStampObj: (payload: StampObj) => void;

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
  // editedClientCompany: Client_company;
  // updateEditedClientCompany: (payload: Client_company) => void;
  // resetEditedClientCompany: () => void;

  // =================== ローディング状態保持 ===================
  loadingGlobalState: boolean;
  setLoadingGlobalState: (payload: boolean) => void;
  // INSERT/UPDATE時のローディング
  isLoadingUpsertGlobal: boolean;
  setIsLoadingUpsertGlobal: (payload: boolean) => void;

  // =================== ユーザープロフィール ===================
  userProfileState: UserProfileCompanySubscription | null;
  setUserProfileState: (payload: UserProfileCompanySubscription | null) => void;
  // userProfileState: UserProfile | null;
  // setUserProfileState: (payload: UserProfile | null) => void;
  // プロフィール画像オブジェクトURL文字列
  avatarImgURL: string | null;
  setAvatarImgURL: (payload: string | null) => void;
  // ハンコ画像オブジェクトURL文字列
  myStampImgURL: string | null;
  setMyStampImgURL: (payload: string | null) => void;
  // 会社ロゴ画像オブジェクトURL文字列
  companyLogoImgURL: string | null;
  setCompanyLogoImgURL: (payload: string | null) => void;
  // 角印画像オブジェクトURL文字列
  companySealImgURL: string | null;
  setCompanySealImgURL: (payload: string | null) => void;

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

  // =================== 上画面の行選択した時に下画面に会社情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataCompany: Client_company_row_data | null;
  setSelectedRowDataCompany: (payload: Client_company_row_data | null) => void;

  // 会社データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  // newSearchCompanyCondition: Omit<Client_company_row_data, ''>
  newSearchCompanyParams: NewSearchCompanyParams | null;
  setNewSearchCompanyParams: (payload: NewSearchCompanyParams | null) => void;
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataCompanyに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataCompany: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataCompany: (payload: boolean) => void;

  // =================== 担当者テーブル ヘッダーリスト保持用state関連 ===================
  contactColumnHeaderItemList: ColumnHeaderItemList[];
  setContactColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の行選択した時に下画面に担当者情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataContact: Contact_row_data | null;
  setSelectedRowDataContact: (payload: Contact_row_data | null) => void;

  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchContact_CompanyParams: NewSearchContact_CompanyParams | null;
  setNewSearchContact_CompanyParams: (payload: NewSearchContact_CompanyParams | null) => void;
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataContactに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataContact: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataContact: (payload: boolean) => void;

  // =================== 活動テーブル ヘッダーリスト保持用state関連 ===================
  activityColumnHeaderItemList: ColumnHeaderItemList[];
  setActivityColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の行選択した時に下画面に担当者情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataActivity: Activity_row_data | null;
  setSelectedRowDataActivity: (payload: Activity_row_data | null) => void;
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchActivity_Contact_CompanyParams: NewSearchActivity_Contact_CompanyParams | null;
  setNewSearchActivity_Contact_CompanyParams: (payload: NewSearchActivity_Contact_CompanyParams | null) => void;
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataActivityに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataActivity: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataActivity: (payload: boolean) => void;

  // =================== 面談テーブル ヘッダーリスト保持用state関連 ===================
  meetingColumnHeaderItemList: ColumnHeaderItemList[];
  setMeetingColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の行選択した時に下画面に担当者情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataMeeting: Meeting_row_data | null;
  setSelectedRowDataMeeting: (payload: Meeting_row_data | null) => void;
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchMeeting_Contact_CompanyParams: NewSearchMeeting_Contact_CompanyParams | null;
  setNewSearchMeeting_Contact_CompanyParams: (payload: NewSearchMeeting_Contact_CompanyParams | null) => void;
  // UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataMeetingに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataMeeting: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataMeeting: (payload: boolean) => void;

  // =================== 案件テーブル ヘッダーリスト保持用state関連 ===================
  propertyColumnHeaderItemList: ColumnHeaderItemList[];
  setPropertyColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の行選択した時に下画面に担当者情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataProperty: Property_row_data | null;
  setSelectedRowDataProperty: (payload: Property_row_data | null) => void;
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchProperty_Contact_CompanyParams: NewSearchProperty_Contact_CompanyParams | null;
  setNewSearchProperty_Contact_CompanyParams: (payload: NewSearchProperty_Contact_CompanyParams | null) => void;
  // INSERT,UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataPropertyに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataProperty: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataProperty: (payload: boolean) => void;

  // =================== 見積テーブル ヘッダーリスト保持用state関連 ===================
  quotationColumnHeaderItemList: ColumnHeaderItemList[];
  setQuotationColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // =================== 上画面の行選択した時に下画面に担当者情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataQuotation: Quotation_row_data | null;
  setSelectedRowDataQuotation: (payload: Quotation_row_data | null) => void;
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchQuotation_Contact_CompanyParams: NewSearchQuotation_Contact_CompanyParams | null;
  setNewSearchQuotation_Contact_CompanyParams: (payload: NewSearchQuotation_Contact_CompanyParams | null) => void;
  // INSERT,UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataQuotationに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataQuotation: boolean;
  setIsUpdateRequiredForLatestSelectedRowDataQuotation: (payload: boolean) => void;
  // 見積作成モード
  isInsertModeQuotation: boolean;
  setIsInsertModeQuotation: (payload: boolean) => void;
  // 見積編集モード
  isUpdateModeQuotation: boolean;
  setIsUpdateModeQuotation: (payload: boolean) => void;

  // 見積画面の商品リストの選択中の行データ
  // 選択中の行データオブジェクト
  selectedRowDataQuotationProduct: QuotationProductsDetail | null;
  setSelectedRowDataQuotationProduct: (payload: QuotationProductsDetail | null) => void;
  // 選択中の商品セルの列と行
  editPosition: EditPosition;
  setEditPosition: (payload: EditPosition) => void;
  // セルの編集モード
  isEditingCell: boolean;
  setIsEditingCell: (payload: boolean) => void;

  // 見積価格関連
  // 価格合計
  inputTotalPriceEdit: string;
  setInputTotalPriceEdit: (payload: string) => void;
  // 値引金額
  inputDiscountAmountEdit: string;
  setInputDiscountAmountEdit: (payload: string) => void;
  // 値引率
  inputDiscountRateEdit: string;
  setInputDiscountRateEdit: (payload: string) => void;
  // 合計金額
  inputTotalAmountEdit: string;
  setInputTotalAmountEdit: (payload: string) => void;

  // 見積書プレビューモーダル
  isOpenQuotationPreviewModal: boolean;
  setIsOpenQuotationPreviewModal: (payload: boolean) => void;
  // プロフィール用見積書プレビューモーダル
  isOpenQuotationPreviewForProfile: boolean;
  setIsOpenQuotationPreviewForProfile: (payload: boolean) => void;

  // =================== 売上目標テーブル ヘッダーリスト保持用state関連 ===================
  // テーブルカラムヘッダー
  salesTargetColumnHeaderItemList: ColumnHeaderItemList[];
  setSalesTargetColumnHeaderItemList: (payload: ColumnHeaderItemList[]) => void;
  // 現在表示しているメイン目標のエンティティ
  mainEntityTarget: MainEntityTarget | null;
  setMainEntityTarget: (payload: MainEntityTarget | null) => void;
  // 現在表示中の会計年度
  selectedFiscalYearTarget: number | null;
  setSelectedFiscalYearTarget: (payload: number | null) => void;
  // 会計年度の選択肢 2020年度から現在の会計年度まで
  optionsFiscalYear: number[];
  setOptionsFiscalYear: (payload: number[]) => void;
  // ユーザーの会計年度の期首と期末の年月(カレンダー年月)
  fiscalYearStartEndDate: { startDate: Date; endDate: Date } | null;
  setFiscalYearStartEndDate: (payload: { startDate: Date; endDate: Date } | null) => void;
  // テーブルに表示するデータセットキー「売上目標・前年度売上・前年比」
  displayKeys: DisplayKeys[];
  setDisplayKeys: (payload: DisplayKeys[]) => void;
  // 現在の会計年月度 202303
  currentFiscalStartYearMonth: number | null;
  setCurrentFiscalStartYearMonth: (payload: number | null) => void;
  // 売上目標フェッチ時の年月度の12ヶ月分の配列
  annualFiscalMonths: FiscalYearMonthObjForTarget | null;
  setAnnualFiscalMonths: (payload: FiscalYearMonthObjForTarget | null) => void;
  // 前年度売上の12ヶ月分の年月度配列
  lastAnnualFiscalMonths: FiscalYearMonthObjForTarget | null;
  setLastAnnualFiscalMonths: (payload: FiscalYearMonthObjForTarget | null) => void;
  // 目標設定モード
  upsertTargetMode: string | null;
  setUpsertTargetMode: (payload: string | null) => void;
  // 目標設定時のエンティティ・年度オブジェクト
  upsertTargetObj: UpsertTargetObj | null;
  setUpsertTargetObj: (payload: UpsertTargetObj | null) => void;
  // 目標設定時の上位エンティティと紐づく設定対象の下位エンティティ配列・年度オブジェクト
  upsertSettingEntitiesObj: UpsertSettingEntitiesObj | null;
  setUpsertSettingEntitiesObj: (payload: UpsertSettingEntitiesObj | null) => void;
  // ユーザーのエンティティの中でメンバーの親に当たる末端のエンティティ
  // endEntity: string;
  // setEndEntity: (payload: string) => void;
  // 目標入力値保存用のグローバルstate {entityId: {data: -, isCollected: false}} isCollectedでデータの収集が完了したかどうかを確認
  // 親から子へデータを収集を伝えるためのトリガー
  saveTriggerSalesTarget: boolean;
  setSaveTriggerSalesTarget: (payload: boolean) => void;
  // データ収集時にエラーが起きた場合の検知
  resultCollectSalesTargets: boolean;
  setResultCollectSalesTargets: (payload: boolean) => void;
  // 各テーブルの目標入力値を保持するstate
  inputSalesTargetsIdToDataMap: InputSalesTargetsIdToDataMap;
  setInputSalesTargetsIdToDataMap: (payload: InputSalesTargetsIdToDataMap) => void;
  // 【事業部〜係レベル用】売上目標設定対象となる各テーブルの合計値を保持するstate(会社レベル以外でのレベル設定時に使用)
  totalInputSalesTargetsYearHalf: TotalSalesTargetsYearHalfObj;
  setTotalInputSalesTargetsYearHalf: (payload: TotalSalesTargetsYearHalfObj) => void;

  // 【メンバーレベル用】売上目標設定対象となる各テーブルの合計値を保持するstate(会社レベル以外でのレベル設定時に使用)
  totalInputSalesTargetsHalfDetails: TotalSalesTargetsHalfDetailsObj;
  setTotalInputSalesTargetsHalfDetails: (payload: TotalSalesTargetsHalfDetailsObj) => void;
  // メンバーレベルの目標設定時に「上期詳細」「下期詳細」を切り替えるstate
  selectedPeriodTypeForMemberLevel: "first_half_details" | "second_half_details";
  setSelectedPeriodTypeForMemberLevel: (payload: "first_half_details" | "second_half_details") => void;
  // エンティティinvalidateトリガー
  triggerQueryEntities: boolean;
  setTriggerQueryEntities: (payload: boolean) => void;
  // リスト編集時にレベル内のエンティティからメンバーが所属しているエンティティのidをSetオブジェクトで保持し、リスト編集モーダル内でメンバー所属ありのエンティティのみを残せるようにする
  entityIdsWithMembersSetObj: Set<string> | null;
  setEntityIdsWithMembersSetObj: (payload: Set<string> | null) => void;
  // メンバーレベルでの、全てのメンバーの月次目標の入力完了と、月次目標の合計とQ1, Q2の総合目標と一致しているかどうかを保持するstate
  monthTargetStatusMapForAllMembers: MonthTargetStatusMapForAllMembers | null;
  setMonthTargetStatusMapForAllMembers: (payload: MonthTargetStatusMapForAllMembers | null) => void;
  // 目標トップページ
  // 表示期間(年度全て・上期詳細・下期詳細)
  displayTargetPeriodType: "fiscal_year" | "first_half" | "second_half";
  setDisplayTargetPeriodType: (payload: "fiscal_year" | "first_half" | "second_half") => void;
  // 総合目標の「売上目標・前年度売上」の「年度・上期・下期」を保持 サブ目標のそれぞれのシェアの算出に使用(目標トップページ)
  mainTotalTargets: MainTotalTargets | null;
  setMainTotalTargets: (payload: MainTotalTargets | null) => void;
  // 売上推移に売上目標をchartDataに追加用
  subEntitiesSalesTargets: SubEntitySalesTarget[] | null;
  setSubEntitiesSalesTargets: (payload: SubEntitySalesTarget[] | null) => void;

  // =================== 営業カレンダー ===================
  isOpenBusinessCalendarSettingModal: boolean;
  setIsOpenBusinessCalendarSettingModal: (payload: boolean) => void;
  isOpenBusinessCalendarModalDisplayOnly: boolean;
  setIsOpenBusinessCalendarModalDisplayOnly: (payload: boolean) => void;
  // 選択中の会計年度
  selectedFiscalYearSetting: number | null;
  setSelectedFiscalYearSetting: (payload: number) => void;
  // 決算日が28~30までで末日でない決算日の場合の各月度の開始日、終了日カスタムinput
  fiscalMonthStartEndInputArray: { startDate: Date; endDate: Date }[] | null;
  setFiscalMonthStartEndInputArray: (payload: { startDate: Date; endDate: Date }[] | null) => void;
  // 各会計年度別の定休日の適用状況・ステータス
  statusAnnualClosingDaysArray: StatusClosingDays[] | null;
  setStatusAnnualClosingDaysArray: (payload: StatusClosingDays[] | null) => void;

  // =================== SDB ===================
  // ネタ表, 進捗ホワイトボード, SDBなどのタブ "salesProgress"
  activeTabSDB: "sales_progress" | "sales_dashboard" | "sales_process" | "sales_area_map";
  setActiveTabSDB: (payload: "sales_progress" | "sales_dashboard" | "sales_process" | "sales_area_map") => void;
  // 全社, 事業部, 係, メンバー個人ごとのデータの範囲別
  activeLevelSDB: { parent_entity_level: string; entity_level: string } | null;
  setActiveLevelSDB: (payload: { parent_entity_level: string; entity_level: string } | null) => void;
  // 月次・四半期・半期・年度ごとの期間データの範囲別
  // FiscalYearAllKeys: 売上推移と売上目標のどちらにも対応できるように期間タイプは「"fiscal_year" | "half_year" | "quarter" | "year_month"」ではなく詳細で保持
  activePeriodSDB: PeriodSDB | null;
  setActivePeriodSDB: (payload: PeriodSDB | null) => void;
  // エンティティ変更時にonResetFetchCompleteを実行するためのグローバルstate
  isRequiredResetChangeEntity: boolean;
  setIsRequiredResetChangeEntity: (payload: boolean) => void;

  // 選択中のコンテンツ(どの事業部か、どの係か、どのメンバーか)
  // セクション関連
  // メンバーセクション 選択中のメンバー
  // エンティティidとディスプレイ個別メンバー配列(中小だと全社のみで良い企業もあるため、全社でも個別メンバーのネタ表を表示できるようにする)
  selectedObjSectionSDBMember: MemberAccounts | null;
  setSelectedObjSectionSDBMember: (payload: MemberAccounts | null) => void;

  // 「上期詳細」「下期詳細」を切り替えるstate
  selectedPeriodTypeHalfDetailSDB: "first_half_details" | "second_half_details";
  setSelectedPeriodTypeHalfDetailSDB: (payload: "first_half_details" | "second_half_details") => void;
  // 現在表示中の会計年度(SDB用)
  selectedFiscalYearTargetSDB: number | null;
  setSelectedFiscalYearTargetSDB: (payload: number | null) => void;
  // 現在の会計年月度 202303(SDB用)
  currentFiscalStartYearMonthSDB: number | null;
  setCurrentFiscalStartYearMonthSDB: (payload: number | null) => void;
  // 売上目標フェッチ時の年月度の12ヶ月分の配列(SDB用)
  annualFiscalMonthsSDB: FiscalYearMonthObjForTarget | null;
  setAnnualFiscalMonthsSDB: (payload: FiscalYearMonthObjForTarget | null) => void;
  // ユーザーの会計年度の期首と期末の年月(カレンダー年月)(SDB用)
  fiscalYearStartEndDateSDB: { startDate: Date; endDate: Date } | null;
  setFiscalYearStartEndDateSDB: (payload: { startDate: Date; endDate: Date } | null) => void;

  // --------- ネタ表ボード ---------
  editedTaskCard: EditedCard;
  setEditedTaskCard: (payload: EditedCard) => void;
  // 選択中のカード
  selectedDealCard: SelectedDealCard;
  setSelectedDealCard: (payload: SelectedDealCard) => void;
  // 選択中のネタカードの概要確認モーダル
  isOpenDealCardModal: boolean;
  setIsOpenDealCardModal: (payload: boolean) => void;
  // ローカルネタ表カードリフレッシュ mapメソッドで選択中のカードを更新
  // isRequiredRefreshDealCards: boolean;
  // setIsRequiredRefreshDealCards: (payload: boolean) => void;
  isRequiredRefreshDealCards: string | null;
  setIsRequiredRefreshDealCards: (payload: string | null) => void;

  // 受注済みに変更後の売上入力モーダルと編集モーダルに渡すstate
  isOpenCongratulationsModal: boolean;
  setIsOpenCongratulationsModal: (payload: boolean) => void;
  isRequiredInputSoldProduct: boolean;
  setIsRequiredInputSoldProduct: (payload: boolean) => void;
  // モーダル開閉stateを共通化はしない 複数モーダルを同時にひらけなくなるため => 複数モーダル表示する際には共通モーダル開閉stateを複数作成すれば良い
  // A受注済み => 他の確度に変更した際に売上データをリセットするか確認モーダル(ユーザーに確認してもらってから売上実績と達成率を反映させるため)
  isOpenResetSalesConfirmationModal: boolean;
  setIsOpenResetSalesConfirmationModal: (payload: boolean) => void;
  // SDB共通モーダル
  isOpenModalSDB: string | null;
  setIsOpenModalSDB: (payload: string | null) => void;
  // SDBの期間変更時のローディング
  isLoadingSDB: boolean;
  setIsLoadingSDB: (payload: boolean) => void;

  // テーマカラー
  // activeThemeColor: string;
  activeThemeColor:
    | "theme-brand-f"
    | "theme-brand-f-gradient"
    | "theme-black-gradient"
    | "theme-simple12"
    | "theme-simple17";
  setActiveThemeColor: (
    payload: "theme-brand-f" | "theme-brand-f-gradient" | "theme-black-gradient" | "theme-simple12" | "theme-simple17"
  ) => void;

  // ------------ CSVインポート ------------
  // CSVインポートモーダル
  isOpenImportModal: boolean;
  setIsOpenImportModal: (payload: boolean) => void;
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
  isOpenSidebar: false,
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

  // ---------------- 詳細画面モーダル ----------------
  // 会社詳細画面
  isOpenClientCompanyDetailModal: false,
  setIsOpenClientCompanyDetailModal: (payload) => set({ isOpenClientCompanyDetailModal: payload }),
  // 担当者詳細画面
  isOpenContactDetailModal: false,
  setIsOpenContactDetailModal: (payload) => set({ isOpenContactDetailModal: payload }),
  // 案件詳細モーダル(SDBネタ表)
  isOpenPropertyDetailModal: false,
  setIsOpenPropertyDetailModal: (payload) => set({ isOpenPropertyDetailModal: payload }),

  // =================== 会社作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewClientCompanyModal: false,
  setIsOpenInsertNewClientCompanyModal: (payload) => set({ isOpenInsertNewClientCompanyModal: payload }),
  // 編集モーダル
  isOpenUpdateClientCompanyModal: false,
  setIsOpenUpdateClientCompanyModal: (payload) => set({ isOpenUpdateClientCompanyModal: payload }),
  // 会社複製可否state
  isDuplicateCompany: false,
  setIsDuplicateCompany: (payload) => set({ isDuplicateCompany: payload }),

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

  // =================== 見積作成モーダル ===================
  // 新規作成モーダル
  isOpenInsertNewQuotationModal: false,
  setIsOpenInsertNewQuotationModal: (payload) => set({ isOpenInsertNewQuotationModal: payload }),
  // 編集モーダル
  isOpenUpdateQuotationModal: false,
  setIsOpenUpdateQuotationModal: (payload) => set({ isOpenUpdateQuotationModal: payload }),

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

  // =================== サイドテーブル 印鑑データ ===================
  isOpenSearchStampSideTable: false,
  setIsOpenSearchStampSideTable: (payload) => set({ isOpenSearchStampSideTable: payload }),
  isOpenSearchStampSideTableBefore: false,
  setIsOpenSearchStampSideTableBefore: (payload) => set({ isOpenSearchStampSideTableBefore: payload }),
  prevStampObj: { signature_stamp_id: null, signature_stamp_url: null },
  setPrevStampObj: (payload) => set({ prevStampObj: payload }),
  stampObj: { signature_stamp_id: null, signature_stamp_url: null },
  setStampObj: (payload) => set({ stampObj: payload }),

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
    updated_at: "",
    created_by_company_id: "",
    created_by_user_id: "",
    created_by_department_of_user: "",
    created_by_section_of_user: "",
    created_by_unit_of_user: "",
    created_by_office_of_user: "",
    product_name: "",
    inside_short_name: "",
    outside_short_name: "",
    // unit_price: null,
    unit_price: "",
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

  // =================== テーブル各種設定 ===================
  // Row evenの色を変更
  evenRowColorChange: true,
  setEvenRowColorChange: (payload) => set({ evenRowColorChange: payload }),
  // 検索タイプ (デフォルトで部分一致検索)
  searchType: "partial_match",
  setSearchType: (payload) => set({ searchType: payload }),

  // =================== 「会社画面」検索条件 ===================
  // 【「条件に一致する全ての会社をフェッチするか」、「条件に一致する自社で作成した会社のみをフェッチするか」の抽出条件を保持】
  isFetchAllCompanies: true,
  setIsFetchAllCompanies: (payload) => set({ isFetchAllCompanies: payload }),
  // =================== 「活動」「面談」「案件」用、部署、課、係、事業所切り替えドロップダウンメニュー ===================
  // 自事業部か、全事業部かを選択
  isFetchAllDepartments: true,
  setIsFetchAllDepartments: (payload) => set({ isFetchAllDepartments: payload }),
  // 自課か全課か
  isFetchAllSections: true,
  setIsFetchAllSections: (payload) => set({ isFetchAllSections: payload }),
  // 自係か全係か
  isFetchAllUnits: true,
  setIsFetchAllUnits: (payload) => set({ isFetchAllUnits: payload }),
  // 自事業所か全事業所か
  isFetchAllOffices: true,
  setIsFetchAllOffices: (payload) => set({ isFetchAllOffices: payload }),
  // 自事業所か全事業所か
  isFetchAllMembers: true,
  setIsFetchAllMembers: (payload) => set({ isFetchAllMembers: payload }),

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
  // editedClientCompany: {
  //   id: "",
  //   address: "",
  //   auditor: "",
  //   ban_reason: "",
  //   budget_request_month1: null,
  //   budget_request_month2: null,
  //   business_content: "",
  //   business_sites: "",
  //   call_careful_flag: null,
  //   call_careful_reason: "",
  //   capital: null,
  //   corporate_number: null,
  //   chairperson: "",
  //   claim: "",
  //   clients: "",
  //   created_by_company_id: "",
  //   created_by_department_of_user: "",
  //   created_by_unit_of_user: "",
  //   created_by_user_id: "",
  //   department_contacts: "",
  //   department_name: "",
  //   director: "",
  //   email: "",
  //   email_ban_flag: null,
  //   established_in: "",
  //   facility: "",
  //   fax_dm_ban_flag: null,
  //   fiscal_end_month: null,
  //   group_company: "",
  //   industry_large: "",
  //   industry_small: "",
  //   industry_type: "",
  //   main_fax: "",
  //   main_phone_number: "",
  //   manager: "",
  //   managing_director: "",
  //   member: "",
  //   name: "",
  //   number_of_employees_class: "",
  //   number_of_employees: "",
  //   overseas_bases: "",
  //   product_category_large: "",
  //   product_category_medium: "",
  //   product_category_small: "",
  //   representative_name: "",
  //   representative_position_name: "",
  //   sending_ban_flag: null,
  //   senior_managing_director: "",
  //   senior_vice_president: "",
  //   supplier: "",
  //   website_url: "",
  //   zipcode: "",
  // },
  // updateEditedClientCompany: (payload) =>
  //   set({
  //     editedClientCompany: {
  //       id: payload.id,
  //       address: payload.address,
  //       auditor: payload.auditor,
  //       // ban_reason: payload.ban_reason,
  //       budget_request_month1: payload.budget_request_month1,
  //       budget_request_month2: payload.budget_request_month2,
  //       business_content: payload.business_content,
  //       business_sites: payload.business_sites,
  //       // call_careful_flag: payload.call_careful_flag,
  //       // call_careful_reason: payload.call_careful_reason,
  //       capital: payload.capital,
  //       corporate_number: payload.corporate_number,
  //       chairperson: payload.chairperson,
  //       // claim: payload.claim,
  //       clients: payload.clients,
  //       created_by_company_id: payload.created_by_company_id,
  //       created_by_department_of_user: payload.created_by_department_of_user,
  //       created_by_unit_of_user: payload.created_by_unit_of_user,
  //       created_by_user_id: payload.created_by_user_id,
  //       department_contacts: payload.department_contacts,
  //       department_name: payload.department_name,
  //       director: payload.director,
  //       email: payload.email,
  //       // email_ban_flag: payload.email_ban_flag,
  //       established_in: payload.established_in,
  //       facility: payload.facility,
  //       // fax_dm_ban_flag: payload.fax_dm_ban_flag,
  //       fiscal_end_month: payload.fiscal_end_month,
  //       group_company: payload.group_company,
  //       industry_large: payload.industry_large,
  //       industry_small: payload.industry_small,
  //       // industry_type: payload.industry_type,
  //       industry_type_id: payload.industry_type_id,
  //       main_fax: payload.main_fax,
  //       main_phone_number: payload.main_phone_number,
  //       manager: payload.manager,
  //       managing_director: payload.managing_director,
  //       member: payload.member,
  //       name: payload.name,
  //       number_of_employees_class: payload.number_of_employees_class,
  //       number_of_employees: payload.number_of_employees,
  //       overseas_bases: payload.overseas_bases,
  //       product_category_large: payload.product_category_large,
  //       product_category_medium: payload.product_category_medium,
  //       product_category_small: payload.product_category_small,
  //       representative_name: payload.representative_name,
  //       // representative_position_name: payload.representative_position_name,
  //       // sending_ban_flag: payload.sending_ban_flag,
  //       senior_managing_director: payload.senior_managing_director,
  //       senior_vice_president: payload.senior_vice_president,
  //       supplier: payload.supplier,
  //       website_url: payload.website_url,
  //       zipcode: payload.zipcode,
  //     },
  //   }),
  // resetEditedClientCompany: () =>
  //   set({
  //     editedClientCompany: {
  //       id: "",
  //       address: "",
  //       auditor: "",
  //       // ban_reason: "",
  //       budget_request_month1: null,
  //       budget_request_month2: null,
  //       business_content: "",
  //       business_sites: "",
  //       // call_careful_flag: null,
  //       // call_careful_reason: "",
  //       capital: null,
  //       corporate_number: null,
  //       chairperson: "",
  //       // claim: "",
  //       clients: "",
  //       created_by_company_id: "",
  //       created_by_department_of_user: "",
  //       created_by_unit_of_user: "",
  //       created_by_user_id: "",
  //       department_contacts: "",
  //       department_name: "",
  //       director: "",
  //       email: "",
  //       // email_ban_flag: null,
  //       established_in: "",
  //       facility: "",
  //       // fax_dm_ban_flag: null,
  //       fiscal_end_month: null,
  //       group_company: "",
  //       industry_large: "",
  //       industry_small: "",
  //       industry_type: "",
  //       main_fax: "",
  //       main_phone_number: "",
  //       manager: "",
  //       managing_director: "",
  //       member: "",
  //       name: "",
  //       number_of_employees_class: "",
  //       number_of_employees: "",
  //       overseas_bases: "",
  //       product_category_large: "",
  //       product_category_medium: "",
  //       product_category_small: "",
  //       representative_name: "",
  //       // representative_position_name: "",
  //       // sending_ban_flag: null,
  //       senior_managing_director: "",
  //       senior_vice_president: "",
  //       supplier: "",
  //       website_url: "",
  //       zipcode: "",
  //     },
  //   }),

  // =================== ローディング状態保持 ===================
  loadingGlobalState: false,
  setLoadingGlobalState: (payload) => set({ loadingGlobalState: payload }),
  // INSERT/UPDATE時のローディング
  isLoadingUpsertGlobal: false,
  setIsLoadingUpsertGlobal: (payload) => set({ isLoadingUpsertGlobal: payload }),

  // =================== ユーザープロフィール ===================
  userProfileState: null,
  setUserProfileState: (payload) => set({ userProfileState: payload }),
  // プロフィール画像オブジェクトURL文字列
  avatarImgURL: null,
  setAvatarImgURL: (payload) => set({ avatarImgURL: payload }),
  // ハンコ画像オブジェクトURL文字列
  myStampImgURL: null,
  setMyStampImgURL: (payload) => set({ myStampImgURL: payload }),
  // 会社ロゴ画像オブジェクトURL文字列
  companyLogoImgURL: null,
  setCompanyLogoImgURL: (payload) => set({ companyLogoImgURL: payload }),
  // 角印画像オブジェクトURL文字列
  companySealImgURL: null,
  setCompanySealImgURL: (payload) => set({ companySealImgURL: payload }),

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

  // =================== 上画面の行選択した時に下画面に会社情報を映す用のState ===================
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

  // =================== 上画面の行選択した時に下画面に担当者情報を映す用のState ===================
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

  // =================== 上画面の行選択した時に下画面に担当者情報を映す用のState ===================
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
  // =================== 上画面の行選択した時に下画面に担当者情報を映す用のState ===================
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

  // =================== 上画面の行選択した時に下画面に担当者情報を映す用のState ===================
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

  // =================== 見積テーブル ヘッダーリスト保持用state関連 ===================
  quotationColumnHeaderItemList: quotationColumnHeaderItemListData,
  setQuotationColumnHeaderItemList: (payload) => set({ quotationColumnHeaderItemList: payload }),
  // =================== 上画面の行選択した時に下画面に担当者情報を映す用のState ===================
  // 選択中の行データオブジェクト
  selectedRowDataQuotation: null,
  setSelectedRowDataQuotation: (payload) => set({ selectedRowDataQuotation: payload }),
  // 担当者データ新規サーチで取得した検索条件を保持し、上画面のuseInfiniteQueryに渡す
  newSearchQuotation_Contact_CompanyParams: null,
  setNewSearchQuotation_Contact_CompanyParams: (payload) => set({ newSearchQuotation_Contact_CompanyParams: payload }),
  // INSERT,UPDATEクエリ後にinvalidateQueryでキャッシュ更新された選択中の行データをselectedRowDataQuotationに反映するために発火通知するか否かのstate(発火通知してDOMクリックで更新する)
  isUpdateRequiredForLatestSelectedRowDataQuotation: false,
  setIsUpdateRequiredForLatestSelectedRowDataQuotation: (payload) =>
    set({ isUpdateRequiredForLatestSelectedRowDataQuotation: payload }),
  // 見積作成モード
  isInsertModeQuotation: false,
  setIsInsertModeQuotation: (payload) => set({ isInsertModeQuotation: payload }),
  // 見積編集モード
  isUpdateModeQuotation: false,
  setIsUpdateModeQuotation: (payload) => set({ isUpdateModeQuotation: payload }),

  // 見積画面の商品リストの選択中の行データ
  // 選択中の行データオブジェクト
  selectedRowDataQuotationProduct: null,
  setSelectedRowDataQuotationProduct: (payload) => set({ selectedRowDataQuotationProduct: payload }),
  // 選択中の商品セルの列と行
  editPosition: { row: null, col: null },
  setEditPosition: (payload) => set({ editPosition: payload }),
  // セルの編集モード
  isEditingCell: false,
  setIsEditingCell: (payload) => set({ isEditingCell: payload }),

  // 見積価格関連
  // 価格合計
  inputTotalPriceEdit: "",
  setInputTotalPriceEdit: (payload) => set({ inputTotalPriceEdit: payload }),
  // 値引金額
  inputDiscountAmountEdit: "",
  setInputDiscountAmountEdit: (payload) => set({ inputDiscountAmountEdit: payload }),
  // 値引率
  inputDiscountRateEdit: "",
  setInputDiscountRateEdit: (payload) => set({ inputDiscountRateEdit: payload }),
  // 合計金額
  inputTotalAmountEdit: "",
  setInputTotalAmountEdit: (payload) => set({ inputTotalAmountEdit: payload }),

  // 見積書プレビューモーダル
  isOpenQuotationPreviewModal: false,
  setIsOpenQuotationPreviewModal: (payload) => set({ isOpenQuotationPreviewModal: payload }),
  // プロフィール用見積書プレビューモーダル
  isOpenQuotationPreviewForProfile: false,
  setIsOpenQuotationPreviewForProfile: (payload) => set({ isOpenQuotationPreviewForProfile: payload }),

  // =================== 売上目標テーブル ヘッダーリスト保持用state関連 ===================
  // テーブルカラムヘッダー
  // salesTargetColumnHeaderItemList: salesTargetColumnHeaderItemListData,
  salesTargetColumnHeaderItemList: salesTargetColumnHeaderItemListData,
  setSalesTargetColumnHeaderItemList: (payload) => set({ salesTargetColumnHeaderItemList: payload }),
  // 現在表示しているメイン目標のエンティティ
  mainEntityTarget: null,
  setMainEntityTarget: (payload) => set({ mainEntityTarget: payload }),
  // 現在表示中の会計年度
  selectedFiscalYearTarget: null,
  setSelectedFiscalYearTarget: (payload) => set({ selectedFiscalYearTarget: payload }),
  // 会計年度の選択肢 2020年度から現在の会計年度まで
  optionsFiscalYear: [],
  setOptionsFiscalYear: (payload) => set({ optionsFiscalYear: payload }),
  // ユーザーの会計年度の期首と期末の年月(カレンダー年月)
  fiscalYearStartEndDate: null,
  setFiscalYearStartEndDate: (payload) => set({ fiscalYearStartEndDate: payload }),
  // テーブルに表示するデータセットキー「売上目標・前年度売上・前年比」
  displayKeys: ["sales_targets", "yoy_growth", "last_year_sales"],
  setDisplayKeys: (payload) => set({ displayKeys: payload }),
  // 現在の会計年月度 202303
  currentFiscalStartYearMonth: null,
  setCurrentFiscalStartYearMonth: (payload) => set({ currentFiscalStartYearMonth: payload }),
  // 売上目標フェッチ時の年月度の12ヶ月分の配列
  annualFiscalMonths: null,
  setAnnualFiscalMonths: (payload) => set({ annualFiscalMonths: payload }),
  // 前年度売上の12ヶ月分の年月度配列
  lastAnnualFiscalMonths: null,
  setLastAnnualFiscalMonths: (payload) => set({ lastAnnualFiscalMonths: payload }),
  // 目標設定モード エンティティ設定モード、売上設定モード
  upsertTargetMode: null,
  setUpsertTargetMode: (payload) => set({ upsertTargetMode: payload }),
  // 目標設定時のエンティティ・年度オブジェクト
  upsertTargetObj: null,
  setUpsertTargetObj: (payload) => set({ upsertTargetObj: payload }),
  // 目標設定時の上位エンティティと紐づく設定対象の下位エンティティ配列・年度オブジェクト
  upsertSettingEntitiesObj: null,
  setUpsertSettingEntitiesObj: (payload) => set({ upsertSettingEntitiesObj: payload }),
  // 目標入力値保存用のグローバルstate {entityId: {data: -, isCollected: false}} isCollectedでデータの収集が完了したかどうかを確認
  // 親から子へデータを収集を伝えるためのトリガー
  saveTriggerSalesTarget: false,
  setSaveTriggerSalesTarget: (payload) => set({ saveTriggerSalesTarget: payload }),
  // データ収集時にエラーが起きた場合の検知
  resultCollectSalesTargets: false,
  setResultCollectSalesTargets: (payload) => set({ resultCollectSalesTargets: payload }),
  // 各テーブルの目標入力値を保持するstate
  inputSalesTargetsIdToDataMap: {},
  setInputSalesTargetsIdToDataMap: (payload) => set({ inputSalesTargetsIdToDataMap: payload }),
  // 【事業部〜係レベル用】売上目標設定対象となる各テーブルの合計値を保持するstate(会社レベル以外でのレベル設定時に使用)
  totalInputSalesTargetsYearHalf: {
    total_targets: {
      sales_target_year: 0,
      sales_target_first_half: 0,
      sales_target_second_half: 0,
    },
    input_targets_array: [],
  },
  setTotalInputSalesTargetsYearHalf: (payload) => set({ totalInputSalesTargetsYearHalf: payload }),
  // 【メンバーレベル用】売上目標設定対象となる各テーブルの合計値を保持するstate(会社レベル以外でのレベル設定時に使用)
  totalInputSalesTargetsHalfDetails: {
    total_targets: {
      sales_target_half: 0,
      // sales_target_first_quarter: 0,
      // sales_target_second_quarter: 0,
      // sales_target_month_01: 0,
      // sales_target_month_02: 0,
      // sales_target_month_03: 0,
      // sales_target_month_04: 0,
      // sales_target_month_05: 0,
      // sales_target_month_06: 0,
    },
    input_targets_array: [],
  },
  setTotalInputSalesTargetsHalfDetails: (payload) => set({ totalInputSalesTargetsHalfDetails: payload }),

  // メンバーレベルの目標設定時に「上期詳細」「下期詳細」を切り替えるstate
  selectedPeriodTypeForMemberLevel: "first_half_details",
  setSelectedPeriodTypeForMemberLevel: (payload) => set({ selectedPeriodTypeForMemberLevel: payload }),
  // エンティティinvalidateトリガー
  triggerQueryEntities: false,
  setTriggerQueryEntities: (payload) => set({ triggerQueryEntities: payload }),
  // リスト編集時にレベル内のエンティティからメンバーが所属しているエンティティのidをSetオブジェクトで保持し、リスト編集モーダル内でメンバー所属ありのエンティティのみを残せるようにする
  entityIdsWithMembersSetObj: null,
  setEntityIdsWithMembersSetObj: (payload) => set({ entityIdsWithMembersSetObj: payload }),
  // メンバーレベルでの、全てのメンバーの月次目標の入力完了と、月次目標の合計とQ1, Q2の総合目標と一致しているかどうかを保持するstate
  monthTargetStatusMapForAllMembers: null,
  setMonthTargetStatusMapForAllMembers: (payload) => set({ monthTargetStatusMapForAllMembers: payload }),

  // 目標トップページ
  // 表示期間(年度全て・上期詳細・下期詳細)
  displayTargetPeriodType: "fiscal_year",
  setDisplayTargetPeriodType: (payload) => set({ displayTargetPeriodType: payload }),
  // 総合目標の「売上目標・前年度売上」の「年度・上期・下期」を保持 サブ目標のそれぞれのシェアの算出に使用(目標トップページ)
  mainTotalTargets: null,
  setMainTotalTargets: (payload) => set({ mainTotalTargets: payload }),
  // 売上推移に売上目標をchartDataに追加用
  subEntitiesSalesTargets: null,
  setSubEntitiesSalesTargets: (payload) => set({ subEntitiesSalesTargets: payload }),

  // =================== 営業カレンダー ===================
  isOpenBusinessCalendarSettingModal: false,
  setIsOpenBusinessCalendarSettingModal: (payload) => set({ isOpenBusinessCalendarSettingModal: payload }),
  isOpenBusinessCalendarModalDisplayOnly: false,
  setIsOpenBusinessCalendarModalDisplayOnly: (payload) => set({ isOpenBusinessCalendarModalDisplayOnly: payload }),
  // 選択中の会計年度
  selectedFiscalYearSetting: null,
  setSelectedFiscalYearSetting: (payload) => set({ selectedFiscalYearSetting: payload }),
  // 決算日が28~30までで末日でない決算日の場合の各月度の開始日、終了日カスタムinput
  fiscalMonthStartEndInputArray: null,
  setFiscalMonthStartEndInputArray: (payload) => set({ fiscalMonthStartEndInputArray: payload }),
  // 各会計年度別の定休日の適用状況・ステータス
  statusAnnualClosingDaysArray: null,
  setStatusAnnualClosingDaysArray: (payload) => set({ statusAnnualClosingDaysArray: payload }),

  // =================== SDB ===================
  // ネタ表, 進捗ホワイトボード, SDBなどのタブ
  activeTabSDB: "sales_progress",
  setActiveTabSDB: (payload) => set({ activeTabSDB: payload }),
  // SDBで表示する全社, 事業部, 課, 係エンティティレベル 親エンティティグループを選択するためメンバーレベルは無し
  activeLevelSDB: null,
  setActiveLevelSDB: (payload) => set({ activeLevelSDB: payload }),
  // 月次・四半期・半期・年度ごとの期間データの範囲別
  // 年度以外 半期20241, 四半期20244, 月度202403で保持
  // FiscalYearAllKeys: 売上推移と売上目標のどちらにも対応できるように期間タイプは「"fiscal_year" | "half_year" | "quarter" | "year_month"」ではなく詳細で保持
  activePeriodSDB: null,
  setActivePeriodSDB: (payload) => set({ activePeriodSDB: payload }),
  // エンティティ変更時にonResetFetchCompleteを実行するためのグローバルstate
  isRequiredResetChangeEntity: false,
  setIsRequiredResetChangeEntity: (payload) => set({ isRequiredResetChangeEntity: payload }),

  // 選択中のコンテンツ(どの事業部か、どの係か、どのメンバーか)
  // セクション関連
  // メンバーセクション 選択中のメンバー
  // エンティティidとディスプレイ個別メンバー配列(中小だと全社のみで良い企業もあるため、全社でも個別メンバーのネタ表を表示できるようにする)
  selectedObjSectionSDBMember: null,
  setSelectedObjSectionSDBMember: (payload) => set({ selectedObjSectionSDBMember: payload }),

  // 「上期詳細」「下期詳細」を切り替えるstate
  selectedPeriodTypeHalfDetailSDB: "first_half_details",
  setSelectedPeriodTypeHalfDetailSDB: (payload) => set({ selectedPeriodTypeHalfDetailSDB: payload }),
  // 現在表示中の会計年度(SDB用)
  selectedFiscalYearTargetSDB: null,
  setSelectedFiscalYearTargetSDB: (payload) => set({ selectedFiscalYearTargetSDB: payload }),
  // 現在の会計年月度 202303(SDB用)
  currentFiscalStartYearMonthSDB: null,
  setCurrentFiscalStartYearMonthSDB: (payload) => set({ currentFiscalStartYearMonthSDB: payload }),
  // 売上目標フェッチ時の年月度の12ヶ月分の配列(SDB用)
  annualFiscalMonthsSDB: null,
  setAnnualFiscalMonthsSDB: (payload) => set({ annualFiscalMonthsSDB: payload }),
  // ユーザーの会計年度の期首と期末の年月(カレンダー年月)(SDB用)
  fiscalYearStartEndDateSDB: null,
  setFiscalYearStartEndDateSDB: (payload) => set({ fiscalYearStartEndDateSDB: payload }),

  // --------- ネタ表ボード ---------
  editedTaskCard: null,
  setEditedTaskCard: (payload) => set({ editedTaskCard: payload }),
  // 選択中のカード
  selectedDealCard: null,
  setSelectedDealCard: (payload) => set({ selectedDealCard: payload }),
  // 選択中のネタカードの概要確認モーダル
  isOpenDealCardModal: false,
  setIsOpenDealCardModal: (payload) => set({ isOpenDealCardModal: payload }),
  // ローカルネタ表カードリフレッシュ mapメソッドで選択中のカードを更新
  // isRequiredRefreshDealCards: false,
  // setIsRequiredRefreshDealCards: (payload) => set({ isRequiredRefreshDealCards: payload }),
  isRequiredRefreshDealCards: null,
  setIsRequiredRefreshDealCards: (payload) => set({ isRequiredRefreshDealCards: payload }),

  // 受注済みに変更後の売上入力モーダルと編集モーダルに渡すstate
  isOpenCongratulationsModal: false,
  setIsOpenCongratulationsModal: (payload) => set({ isOpenCongratulationsModal: payload }),
  isRequiredInputSoldProduct: false,
  setIsRequiredInputSoldProduct: (payload) => set({ isRequiredInputSoldProduct: payload }),
  // モーダル開閉stateを共通化はしない 複数モーダルを同時にひらけなくなるため => 複数モーダル表示する際には共通モーダル開閉stateを複数作成すれば良い
  // A受注済み => 他の確度に変更した際に売上データをリセットするか確認モーダル(ユーザーに確認してもらってから売上実績と達成率を反映させるため)
  isOpenResetSalesConfirmationModal: false,
  setIsOpenResetSalesConfirmationModal: (payload) => set({ isOpenResetSalesConfirmationModal: payload }),
  // SDB共通モーダル
  isOpenModalSDB: null,
  setIsOpenModalSDB: (payload) => set({ isOpenModalSDB: payload }),
  // SDBの期間変更時のローディング
  isLoadingSDB: false,
  setIsLoadingSDB: (payload) => set({ isLoadingSDB: payload }),

  // テーマカラー theme-brand-f, theme-black-gradient, theme-simple12, theme-simple17
  activeThemeColor: "theme-brand-f",
  setActiveThemeColor: (payload) => set({ activeThemeColor: payload }),

  // ------------ CSVインポート ------------
  // CSVインポートモーダル
  isOpenImportModal: false,
  setIsOpenImportModal: (payload) => set({ isOpenImportModal: payload }),
}));

export default useDashboardStore;
