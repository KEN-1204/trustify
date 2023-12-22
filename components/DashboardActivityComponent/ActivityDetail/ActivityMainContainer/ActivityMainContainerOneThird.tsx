import React, { FC, FormEvent, Suspense, memo, useEffect, useState } from "react";
import styles from "../ActivityDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
// import { UnderRightActivityLog } from "./UnderRightActivityLog/UnderRightActivityLog";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import dynamic from "next/dynamic";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import productCategoriesM, { moduleCategoryM } from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { format } from "date-fns";
import { MdClose } from "react-icons/md";
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { optionsOccupation } from "@/components/DashboardContactComponent/ContactDetail/ContactMainContainer/selectOptionsData";
import { useMutateActivity } from "@/hooks/useMutateActivity";

// https://nextjs-ja-translation-docs.vercel.app/docs/advanced-features/dynamic-import
// デフォルトエクスポートの場合のダイナミックインポート
// const DynamicComponent = dynamic(() => import('../components/hello'));
// 名前付きエクスポートの場合のダイナミックインポート
// const ContactUnderRightActivityLog = dynamic(
//   () =>
//     import("./ContactUnderRightActivityLog/ContactUnderRightActivityLog").then(
//       (mod) => mod.ContactUnderRightActivityLog
//     ),
//   {
//     ssr: false,
//   }
// );
/**カスタムローディングコンポーネント オプションの loading コンポーネントを追加して、動的コンポーネントの読み込み中に読み込み状態をレンダリングできます
 * const DynamicComponentWithCustomLoading = dynamic(() => import('../components/hello'), {
  loading: () => <p>...</p>
});
 */
// SSRを使用しない場合
// 常にサーバー側にモジュールを含める必要はありません。たとえば、ブラウザのみで動作するライブラリがモジュールに含まれている場合です。

const ActivityMainContainerOneThirdMemo = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // サーチモード
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  // 編集サーチモード
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  // ツールチップ
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  // 上画面の選択中の列データ会社
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const setSelectedRowDataActivity = useDashboardStore((state) => state.setSelectedRowDataActivity);
  // 担当者編集モーダルオープン
  const setIsOpenUpdateActivityModal = useDashboardStore((state) => state.setIsOpenUpdateActivityModal);
  // rpc()サーチ用パラメータ
  const newSearchActivity_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchActivity_Contact_CompanyParams
  );
  const setNewSearchActivity_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchActivity_Contact_CompanyParams
  );
  // 各フィールドの編集モード => ダブルクリックで各フィールド名をstateに格納し、各フィールドをエディットモードへ
  const isEditModeField = useDashboardStore((state) => state.isEditModeField);
  const setIsEditModeField = useDashboardStore((state) => state.setIsEditModeField);
  const [isComposing, setIsComposing] = useState(false); // 日本語のように変換、確定が存在する言語入力の場合の日本語入力の変換中を保持するstate、日本語入力開始でtrue, エンターキーで変換確定した時にfalse

  // useMutation
  const { updateActivityFieldMutation } = useMutateActivity();

  // 🌟サブミット
  const [inputCompanyName, setInputCompanyName] = useState("");
  const [inputDepartmentName, setInputDepartmentName] = useState(""); // 部署名
  const [inputTel, setInputTel] = useState("");
  const [inputFax, setInputFax] = useState("");
  const [inputZipcode, setInputZipcode] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [inputEmployeesClass, setInputEmployeesClass] = useState("");
  const [inputCapital, setInputCapital] = useState<string>("");
  const [inputFound, setInputFound] = useState("");
  const [inputContent, setInputContent] = useState("");
  const [inputHP, setInputHP] = useState("");
  const [inputCompanyEmail, setInputCompanyEmail] = useState("");
  const [inputIndustryType, setInputIndustryType] = useState("");
  const [inputProductL, setInputProductL] = useState("");
  const [inputProductM, setInputProductM] = useState("");
  const [inputProductS, setInputProductS] = useState("");
  const [inputFiscal, setInputFiscal] = useState("");
  const [inputBudgetRequestMonth1, setInputBudgetRequestMonth1] = useState("");
  const [inputBudgetRequestMonth2, setInputBudgetRequestMonth2] = useState("");
  const [inputClient, setInputClient] = useState("");
  const [inputSupplier, setInputSupplier] = useState("");
  const [inputFacility, setInputFacility] = useState("");
  const [inputBusinessSite, setInputBusinessSite] = useState("");
  const [inputOverseas, setInputOverseas] = useState("");
  const [inputGroup, setInputGroup] = useState("");
  const [inputCorporateNum, setInputCorporateNum] = useState("");
  // contactsテーブル
  const [inputContactName, setInputContactName] = useState("");
  const [inputDirectLine, setInputDirectLine] = useState("");
  const [inputDirectFax, setInputDirectFax] = useState("");
  const [inputExtension, setInputExtension] = useState("");
  const [inputCompanyCellPhone, setInputCompanyCellPhone] = useState("");
  const [inputPersonalCellPhone, setInputPersonalCellPhone] = useState("");
  const [inputContactEmail, setInputContactEmail] = useState("");
  const [inputPositionName, setInputPositionName] = useState("");
  const [inputPositionClass, setInputPositionClass] = useState("");
  const [inputOccupation, setInputOccupation] = useState("");
  const [inputApprovalAmount, setInputApprovalAmount] = useState("");
  const [inputContactCreatedByCompanyId, setInputContactCreatedByCompanyId] = useState("");
  const [inputContactCreatedByUserId, setInputContactCreatedByUserId] = useState("");
  // activityテーブル
  const [inputActivityCreatedByCompanyId, setInputActivityCreatedByCompanyId] = useState("");
  const [inputActivityCreatedByUserId, setInputActivityCreatedByUserId] = useState("");
  const [inputActivityCreatedByDepartmentOfUser, setInputActivityCreatedByDepartmentOfUser] = useState("");
  const [inputActivityCreatedByUnitOfUser, setInputActivityCreatedByUnitOfUser] = useState("");
  const [inputSummary, setInputSummary] = useState("");
  const [inputScheduledFollowUpDate, setInputScheduledFollowUpDate] = useState<Date | null>(null);
  const [inputFollowUpFlag, setInputFollowUpFlag] = useState<boolean | null>(null);
  const [inputDocumentUrl, setInputDocumentUrl] = useState("");
  const [inputActivityType, setInputActivityType] = useState("");
  const [inputClaimFlag, setInputClaimFlag] = useState<boolean | null>(null);
  const [inputProductIntroduction1, setInputProductIntroduction1] = useState("");
  const [inputProductIntroduction2, setInputProductIntroduction2] = useState("");
  const [inputProductIntroduction3, setInputProductIntroduction3] = useState("");
  const [inputProductIntroduction4, setInputProductIntroduction4] = useState("");
  const [inputProductIntroduction5, setInputProductIntroduction5] = useState("");
  const [inputBusinessOffice, setInputBusinessOffice] = useState("");
  const [inputMemberName, setInputMemberName] = useState("");
  const [inputPriority, setInputPriority] = useState("");
  const [inputActivityDate, setInputActivityDate] = useState<Date | null>(null);
  const [inputDepartment, setInputDepartment] = useState(""); // 事業部名
  const [inputActivityYearMonth, setInputActivityYearMonth] = useState<number | null>(null);

  // サーチ編集モードでリプレイス前の値に復元する関数
  function beforeAdjustFieldValue(value: string | null) {
    if (typeof value === "boolean") return value; // Booleanの場合、そのままの値を返す
    if (value === "") return ""; // 全てのデータ
    if (value === null) return ""; // 全てのデータ
    if (value.includes("%")) value = value.replace(/\%/g, "＊");
    if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
    if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
    return value;
  }

  // 数値型のフィールド用
  function adjustFieldValueNumber(value: number | null) {
    if (value === null) return null; // 全てのデータ
    return value;
  }
  console.log("🔥メインコンテナーnewSearchActivity_Contact_CompanyParams", newSearchActivity_Contact_CompanyParams);

  // 編集モードtrueの場合、サーチ条件をinputタグのvalueに格納
  // 新規サーチの場合には、サーチ条件を空にする
  useEffect(() => {
    // if (newSearchActivity_Contact_CompanyParams === null) return;

    if (editSearchMode && searchMode) {
      if (newSearchActivity_Contact_CompanyParams === null) return;
      console.log(
        "🔥Activityメインコンテナー useEffect 編集モード inputにnewSearchActivity_Contact_CompanyParamsを格納",
        newSearchActivity_Contact_CompanyParams
      );
      //   setInputCompanyName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.company_name));
      setInputCompanyName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["client_companies.name"]));
      setInputDepartmentName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.department_name));
      //   setInputContactName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["contacts.name"]));
      setInputTel(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.zipcode));
      setInputEmployeesClass(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.number_of_employees_class)
      );
      setInputAddress(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.address));
      setInputCapital(
        beforeAdjustFieldValue(
          newSearchActivity_Contact_CompanyParams?.capital
            ? newSearchActivity_Contact_CompanyParams.capital.toString()
            : ""
        )
      );
      setInputFound(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.established_in));
      setInputContent(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.business_content));
      setInputHP(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.website_url));
      //   setInputCompanyEmail(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.company_email));
      setInputCompanyEmail(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["client_companies.email"]));
      setInputIndustryType(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.industry_type));
      setInputProductL(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_category_large));
      setInputProductM(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_category_medium));
      setInputProductS(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_category_small));
      setInputFiscal(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.fiscal_end_month));
      setInputBudgetRequestMonth1(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.budget_request_month1)
      );
      setInputBudgetRequestMonth2(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.budget_request_month2)
      );
      setInputClient(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.clients));
      setInputSupplier(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.supplier));
      setInputFacility(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.facility));
      setInputBusinessSite(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.business_sites));
      setInputOverseas(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.overseas_bases));
      setInputGroup(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.group_company));
      setInputCorporateNum(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.corporate_number));

      // contactsテーブル
      //   setInputContactName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["contacts.name"]));
      setInputDirectLine(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.direct_line));
      setInputDirectFax(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.direct_fax));
      setInputExtension(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.extension));
      setInputCompanyCellPhone(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.company_cell_phone));
      setInputPersonalCellPhone(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.personal_cell_phone));
      //   setInputContactEmail(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.contact_email));
      setInputContactEmail(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["contacts.email"]));
      setInputPositionName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.position_name));
      setInputPositionClass(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.position_class));
      setInputOccupation(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.occupation));
      setInputApprovalAmount(
        beforeAdjustFieldValue(
          newSearchActivity_Contact_CompanyParams.approval_amount
            ? newSearchActivity_Contact_CompanyParams.approval_amount.toString()
            : ""
        )
      );
      setInputContactCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["contacts.created_by_company_id"])
      );
      setInputContactCreatedByUserId(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["contacts.created_by_user_id"])
      );

      // activitiesテーブル
      setInputActivityCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["activities.created_by_company_id"])
      );
      setInputActivityCreatedByUserId(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["activities.created_by_user_id"])
      );
      setInputActivityCreatedByDepartmentOfUser(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["activities.created_by_department_of_user"])
      );
      setInputActivityCreatedByUnitOfUser(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["activities.created_by_unit_of_user"])
      );
      setInputSummary(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.summary));
      // setInputScheduledFollowUpDate(
      //   beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.scheduled_follow_up_date)
      // );
      // setInputScheduledFollowUpDate(newSearchActivity_Contact_CompanyParams.scheduled_follow_up_date);
      setInputScheduledFollowUpDate(
        newSearchActivity_Contact_CompanyParams.scheduled_follow_up_date
          ? new Date(newSearchActivity_Contact_CompanyParams.scheduled_follow_up_date)
          : null
      );
      setInputFollowUpFlag(newSearchActivity_Contact_CompanyParams.follow_up_flag);
      setInputDocumentUrl(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.document_url));
      setInputActivityType(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.activity_type));
      setInputClaimFlag(newSearchActivity_Contact_CompanyParams.claim_flag);
      setInputProductIntroduction1(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_introduction1)
      );
      setInputProductIntroduction2(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_introduction2)
      );
      setInputProductIntroduction3(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_introduction3)
      );
      setInputProductIntroduction4(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_introduction4)
      );
      setInputProductIntroduction5(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_introduction5)
      );
      setInputBusinessOffice(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.business_office));
      setInputMemberName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.member_name));
      setInputPriority(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.priority));
      // setInputActivityDate(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.activity_date));
      setInputActivityDate(
        newSearchActivity_Contact_CompanyParams.activity_date
          ? new Date(newSearchActivity_Contact_CompanyParams.activity_date)
          : null
      );
      setInputDepartment(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.department));
      setInputActivityYearMonth(adjustFieldValueNumber(newSearchActivity_Contact_CompanyParams.activity_year_month));
    } else if (!editSearchMode && searchMode) {
      console.log(
        "🔥Activityメインコンテナー useEffect 新規サーチモード inputを初期化",
        newSearchActivity_Contact_CompanyParams
      );
      if (!!inputCompanyName) setInputCompanyName("");
      // if (!!input) setInputContactName("");
      if (!!inputDepartmentName) setInputDepartmentName(""); // 部署名(クライアント)
      if (!!inputTel) setInputTel("");
      if (!!inputFax) setInputFax("");
      if (!!inputZipcode) setInputZipcode("");
      if (!!inputEmployeesClass) setInputEmployeesClass("");
      if (!!inputAddress) setInputAddress("");
      if (!!inputCapital) setInputCapital("");
      if (!!inputFound) setInputFound("");
      if (!!inputContent) setInputContent("");
      if (!!inputHP) setInputHP("");
      if (!!inputCompanyEmail) setInputCompanyEmail("");
      if (!!inputIndustryType) setInputIndustryType("");
      if (!!inputProductL) setInputProductL("");
      if (!!inputProductM) setInputProductM("");
      if (!!inputProductS) setInputProductS("");
      if (!!inputFiscal) setInputFiscal("");
      if (!!inputBudgetRequestMonth1) setInputBudgetRequestMonth1("");
      if (!!inputBudgetRequestMonth2) setInputBudgetRequestMonth2("");
      if (!!inputClient) setInputClient("");
      if (!!inputSupplier) setInputSupplier("");
      if (!!inputFacility) setInputFacility("");
      if (!!inputBusinessSite) setInputBusinessSite("");
      if (!!inputOverseas) setInputOverseas("");
      if (!!inputGroup) setInputGroup("");
      if (!!inputCorporateNum) setInputCorporateNum("");

      // contactsテーブル
      if (!!inputContactName) setInputContactName("");
      if (!!inputDirectLine) setInputDirectLine("");
      if (!!inputDirectFax) setInputDirectFax("");
      if (!!inputExtension) setInputExtension("");
      if (!!inputCompanyCellPhone) setInputCompanyCellPhone("");
      if (!!inputPersonalCellPhone) setInputPersonalCellPhone("");
      if (!!inputContactEmail) setInputContactEmail("");
      if (!!inputPositionName) setInputPositionName("");
      if (!!inputPositionClass) setInputPositionClass("");
      if (!!inputOccupation) setInputOccupation("");
      if (!!inputApprovalAmount) setInputApprovalAmount("");
      if (!!inputContactCreatedByCompanyId) setInputContactCreatedByCompanyId("");
      if (!!inputContactCreatedByUserId) setInputContactCreatedByUserId("");

      // activitiesテーブル
      if (!!inputActivityCreatedByCompanyId) setInputActivityCreatedByCompanyId("");
      if (!!inputActivityCreatedByUserId) setInputActivityCreatedByUserId("");
      if (!!inputActivityCreatedByDepartmentOfUser) setInputActivityCreatedByDepartmentOfUser("");
      if (!!inputActivityCreatedByUnitOfUser) setInputActivityCreatedByUnitOfUser("");
      if (!!inputSummary) setInputSummary("");
      if (!!inputScheduledFollowUpDate) setInputScheduledFollowUpDate(null);
      if (!!inputFollowUpFlag) setInputFollowUpFlag(null);
      if (!!inputDocumentUrl) setInputDocumentUrl("");
      if (!!inputActivityType) setInputActivityType("");
      if (!!inputClaimFlag) setInputClaimFlag(null);
      if (!!inputProductIntroduction1) setInputProductIntroduction1("");
      if (!!inputProductIntroduction2) setInputProductIntroduction2("");
      if (!!inputProductIntroduction3) setInputProductIntroduction3("");
      if (!!inputProductIntroduction4) setInputProductIntroduction4("");
      if (!!inputProductIntroduction5) setInputProductIntroduction5("");
      if (!!inputBusinessOffice) setInputBusinessOffice("");
      if (!!inputMemberName) setInputMemberName("");
      if (!!inputPriority) setInputPriority("");
      if (!!inputActivityDate) setInputActivityDate(null);
      if (!!inputDepartment) setInputDepartment(""); // 事業部名(自社)
      if (!!inputActivityYearMonth) setInputActivityYearMonth(null);
    }
  }, [editSearchMode, searchMode]);

  // サーチ関数実行
  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // フィールド編集モードがtrueならサブミットせずにリターン
    if (isEditModeField) return console.log("サブミット フィールドエディットモードのためリターン");

    if (!userProfileState || !userProfileState.company_id) return alert("エラー：ユーザー情報が見つかりませんでした。");

    // // Asterisks to percent signs for PostgreSQL's LIKE operator
    function adjustFieldValue(value: string | null) {
      // if (typeof value === "boolean") return value; // Booleanの場合、そのままの値を返す
      if (value === "") return null; // 全てのデータ
      if (value === null) return null; // 全てのデータ
      if (value.includes("*")) value = value.replace(/\*/g, "%");
      if (value.includes("＊")) value = value.replace(/\＊/g, "%");
      if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
      // if (value === "is not null") return "%%";
      if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
      return value;
    }

    setLoadingGlobalState(true);

    let _company_name = adjustFieldValue(inputCompanyName);
    let _department_name = adjustFieldValue(inputDepartmentName);
    let _main_phone_number = adjustFieldValue(inputTel);
    let _main_fax = adjustFieldValue(inputFax);
    let _zipcode = adjustFieldValue(inputZipcode);
    let _number_of_employees_class = adjustFieldValue(inputEmployeesClass);
    let _address = adjustFieldValue(inputAddress);
    let _capital = adjustFieldValue(inputCapital) ? parseInt(inputCapital, 10) : null;
    let _established_in = adjustFieldValue(inputFound);
    let _business_content = adjustFieldValue(inputContent);
    let _website_url = adjustFieldValue(inputHP);
    let _company_email = adjustFieldValue(inputCompanyEmail);
    let _industry_type = adjustFieldValue(inputIndustryType);
    let _product_category_large = adjustFieldValue(inputProductL);
    let _product_category_medium = adjustFieldValue(inputProductM);
    let _product_category_small = adjustFieldValue(inputProductS);
    let _fiscal_end_month = adjustFieldValue(inputFiscal);
    let _budget_request_month1 = adjustFieldValue(inputBudgetRequestMonth1);
    let _budget_request_month2 = adjustFieldValue(inputBudgetRequestMonth2);
    let _clients = adjustFieldValue(inputClient);
    let _supplier = adjustFieldValue(inputSupplier);
    let _facility = adjustFieldValue(inputFacility);
    let _business_sites = adjustFieldValue(inputBusinessSite);
    let _overseas_bases = adjustFieldValue(inputOverseas);
    let _group_company = adjustFieldValue(inputGroup);
    let _corporate_number = adjustFieldValue(inputCorporateNum);
    // contactsテーブル
    let _contact_name = adjustFieldValue(inputContactName);
    let _direct_line = adjustFieldValue(inputDirectLine);
    let _direct_fax = adjustFieldValue(inputDirectFax);
    let _extension = adjustFieldValue(inputExtension);
    let _company_cell_phone = adjustFieldValue(inputCompanyCellPhone);
    let _personal_cell_phone = adjustFieldValue(inputPersonalCellPhone);
    let _contact_email = adjustFieldValue(inputContactEmail);
    let _position_name = adjustFieldValue(inputPositionName);
    let _position_class = adjustFieldValue(inputPositionClass);
    let _occupation = adjustFieldValue(inputOccupation);
    // let _approval_amount = adjustFieldValue(inputApprovalAmount);
    let _approval_amount = adjustFieldValue(inputApprovalAmount) ? parseInt(inputApprovalAmount, 10) : null;
    let _contact_created_by_company_id = adjustFieldValue(inputContactCreatedByCompanyId);
    let _contact_created_by_user_id = adjustFieldValue(inputContactCreatedByUserId);
    // activitiesテーブル
    let _activity_created_by_company_id = adjustFieldValue(inputActivityCreatedByCompanyId);
    let _activity_created_by_user_id = adjustFieldValue(inputActivityCreatedByUserId);
    let _activity_created_by_department_of_user = adjustFieldValue(inputActivityCreatedByDepartmentOfUser);
    let _activity_created_by_unit_of_user = adjustFieldValue(inputActivityCreatedByUnitOfUser);
    let _summary = adjustFieldValue(inputSummary);
    // let _scheduled_follow_up_date = adjustFieldValue(inputScheduledFollowUpDate);
    let _scheduled_follow_up_date = inputScheduledFollowUpDate ? inputScheduledFollowUpDate.toISOString() : null;
    let _follow_up_flag = inputFollowUpFlag;
    let _document_url = adjustFieldValue(inputDocumentUrl);
    let _activity_type = adjustFieldValue(inputActivityType);
    let _claim_flag = inputClaimFlag;
    let _product_introduction1 = adjustFieldValue(inputProductIntroduction1);
    let _product_introduction2 = adjustFieldValue(inputProductIntroduction2);
    let _product_introduction3 = adjustFieldValue(inputProductIntroduction3);
    let _product_introduction4 = adjustFieldValue(inputProductIntroduction4);
    let _product_introduction5 = adjustFieldValue(inputProductIntroduction5);
    let _business_office = adjustFieldValue(inputBusinessOffice);
    let _member_name = adjustFieldValue(inputMemberName);
    let _priority = adjustFieldValue(inputPriority);
    // let _activity_date = adjustFieldValue(inputActivityDate);
    let _activity_date = inputActivityDate ? inputActivityDate.toISOString() : null;
    let _department = adjustFieldValue(inputDepartment);
    let _activity_year_month = adjustFieldValueNumber(inputActivityYearMonth);

    const params = {
      "client_companies.name": _company_name,
      //   company_name: _company_name,
      department_name: _department_name,
      main_phone_number: _main_phone_number,
      main_fax: _main_fax,
      zipcode: _zipcode,
      address: _address,
      number_of_employees_class: _number_of_employees_class,
      capital: _capital,
      established_in: _established_in,
      business_content: _business_content,
      website_url: _website_url,
      //   company_email: _company_email,
      "client_companies.email": _company_email,
      industry_type: _industry_type,
      product_category_large: _product_category_large,
      product_category_medium: _product_category_medium,
      product_category_small: _product_category_small,
      fiscal_end_month: _fiscal_end_month,
      budget_request_month1: _budget_request_month1,
      budget_request_month2: _budget_request_month2,
      clients: _clients,
      supplier: _supplier,
      facility: _facility,
      business_sites: _business_sites,
      overseas_bases: _overseas_bases,
      group_company: _group_company,
      corporate_number: _corporate_number,
      // contactsテーブル
      //   contact_name: _contact_name,
      "contacts.name": _contact_name,
      direct_line: _direct_line,
      direct_fax: _direct_fax,
      extension: _extension,
      company_cell_phone: _company_cell_phone,
      personal_cell_phone: _personal_cell_phone,
      //   contact_email: _contact_email,
      "contacts.email": _contact_email,
      position_name: _position_name,
      position_class: _position_class,
      occupation: _occupation,
      approval_amount: _approval_amount,
      "contacts.created_by_company_id": _contact_created_by_company_id,
      "contacts.created_by_user_id": _contact_created_by_user_id,
      // activitiesテーブル
      // "activities.created_by_company_id": _activity_created_by_company_id,
      "activities.created_by_company_id": userProfileState.company_id,
      "activities.created_by_user_id": _activity_created_by_user_id,
      "activities.created_by_department_of_user": _activity_created_by_department_of_user,
      "activities.created_by_unit_of_user": _activity_created_by_unit_of_user,
      summary: _summary,
      scheduled_follow_up_date: _scheduled_follow_up_date,
      follow_up_flag: _follow_up_flag,
      document_url: _document_url,
      activity_type: _activity_type,
      claim_flag: _claim_flag,
      product_introduction1: _product_introduction1,
      product_introduction2: _product_introduction2,
      product_introduction3: _product_introduction3,
      product_introduction4: _product_introduction4,
      product_introduction5: _product_introduction5,
      business_office: _business_office,
      member_name: _member_name,
      priority: _priority,
      activity_date: _activity_date,
      department: _department,
      activity_year_month: _activity_year_month,
    };

    // console.log("✅ 条件 params", params);

    // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_companies", { params });

    setInputCompanyName("");
    setInputDepartmentName("");
    setInputTel("");
    setInputFax("");
    setInputZipcode("");
    setInputEmployeesClass("");
    setInputAddress("");
    setInputCapital("");
    setInputFound("");
    setInputContent("");
    setInputHP("");
    setInputCompanyEmail("");
    setInputIndustryType("");
    setInputProductL("");
    setInputProductM("");
    setInputProductS("");
    setInputFiscal("");
    setInputBudgetRequestMonth1("");
    setInputBudgetRequestMonth2("");
    setInputClient("");
    setInputSupplier("");
    setInputFacility("");
    setInputBusinessSite("");
    setInputOverseas("");
    setInputGroup("");
    setInputCorporateNum("");
    // contactsテーブル
    setInputContactName("");
    setInputDirectLine("");
    setInputDirectFax("");
    setInputExtension("");
    setInputCompanyCellPhone("");
    setInputPersonalCellPhone("");
    setInputContactEmail("");
    setInputPositionName("");
    setInputPositionClass("");
    setInputOccupation("");
    setInputApprovalAmount("");
    setInputContactCreatedByCompanyId("");
    setInputContactCreatedByUserId("");
    // activitiesテーブル
    setInputActivityCreatedByCompanyId("");
    setInputActivityCreatedByUserId("");
    setInputActivityCreatedByDepartmentOfUser("");
    setInputActivityCreatedByUnitOfUser("");
    setInputSummary("");
    setInputScheduledFollowUpDate(null);
    setInputFollowUpFlag(null);
    setInputDocumentUrl("");
    setInputActivityType("");
    setInputClaimFlag(null);
    setInputProductIntroduction1("");
    setInputProductIntroduction2("");
    setInputProductIntroduction3("");
    setInputProductIntroduction4("");
    setInputProductIntroduction5("");
    setInputBusinessOffice("");
    setInputMemberName("");
    setInputPriority("");
    setInputActivityDate(null);
    setInputDepartment("");
    setInputActivityYearMonth(null);

    setSearchMode(false);
    setEditSearchMode(false);

    // Zustandに検索条件を格納
    setNewSearchActivity_Contact_CompanyParams(params);

    // 選択中の列データをリセット
    setSelectedRowDataActivity(null);

    console.log("✅ 条件 params", params);
    // const { data, error } = await supabase.rpc("search_companies", { params });
    // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_activities_and_companies_and_contacts", { params });

    // 会社IDがnull、つまりまだ有料アカウントを持っていないユーザー
    // const { data, error } = await supabase
    //   .rpc("search_companies_and_contacts", { params })
    //   .is("created_by_company_id", null)
    //   .range(0, 20);

    // ユーザーIDが自身のIDと一致するデータのみ 成功
    // const { data, error } = await supabase
    //   .rpc("search_companies_and_contacts", { params })
    //   .eq("created_by_user_id", `${userProfileState?.id}`)
    //   .range(0, 20);

    // if (error) return alert(error.message);
    // console.log("✅ 検索結果データ取得 data", data);

    // setLoadingGlobalState(false);
  };

  // ================== 🌟ツールチップ🌟 ==================
  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string = "center") => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosWrap({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: (e.target as HTMLDivElement).dataset.text as string,
      content2: content2,
      content3: content3,
      display: display,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPosWrap(null);
  };
  // ================== ✅ツールチップ✅ ==================

  const handleClaimChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputClaimFlag(true);
        break;
      case "チェック無し":
        setInputClaimFlag(false);
        break;
      default:
        setInputClaimFlag(null);
    }
  };

  const handleFollowUpFlagChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputFollowUpFlag(true);
        break;
      case "チェック無し":
        setInputFollowUpFlag(false);
        break;
      default:
        setInputFollowUpFlag(null);
    }
  };

  console.log("🔥 ActivityMainContainerレンダリング searchMode", searchMode);

  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  return (
    <form className={`${styles.main_container} w-full `} onSubmit={handleSearchSubmit}>
      {/* ------------------------- スクロールコンテナ ------------------------- */}
      <div
        className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${
          tableContainerSize === "half" && underDisplayFullScreen ? `${styles.height_all}` : ``
        } ${tableContainerSize === "all" && underDisplayFullScreen ? `${styles.height_all}` : ``}`}
      >
        {/* ---------------- 通常モード 左コンテナ ---------------- */}
        {!searchMode && (
          <div
            // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
            className={`${styles.left_container} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] pb-[35px] pt-[5px]`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* 左エリア 活動~クレームまで */}
              {/* 活動日・クレーム */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>活動日</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.activity_date
                          ? format(new Date(selectedRowDataActivity.activity_date), "yyyy-MM-dd")
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>クレーム</span>
                    {!searchMode && (
                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          // checked={!!checkedColumnHeader} // 初期値
                          checked={!!selectedRowDataActivity?.claim_flag}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdateActivityModal(true);
                          }}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    )}
                    {/* {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.claim_flag ? selectedRowDataActivity?.claim_flag : ""}
                        </span>
                      )} */}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 活動タイプ・優先度 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>活動ﾀｲﾌﾟ</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.activity_type ? selectedRowDataActivity?.activity_type : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>優先度</span>
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataActivity?.priority
                        //     ? selectedRowDataActivity?.priority
                        //     : ""
                        // }`}
                        className={`${styles.value} !w-full text-center`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.priority ? selectedRowDataActivity?.priority : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 次回ﾌｫﾛｰ予定日・フォロー完了 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex flex-col`}>
                      <span>次回ﾌｫﾛｰ</span>
                      <span>予定日</span>
                    </div>
                    {/* <span className={`${styles.title} !mr-[15px]`}>次回ﾌｫﾛｰ予定日</span> */}
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataActivity?.managing_director ? selectedRowDataActivity?.managing_director : ""
                        // }`}
                        className={`${styles.value}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.scheduled_follow_up_date
                          ? format(new Date(selectedRowDataActivity.scheduled_follow_up_date), "yyyy-MM-dd")
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                {selectedRowDataActivity?.scheduled_follow_up_date && (
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>フォロー完了</span>

                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="checkbox"
                          checked={!!selectedRowDataActivity?.follow_up_flag}
                          onChange={() => {
                            setLoadingGlobalState(false);
                            setIsOpenUpdateActivityModal(true);
                          }}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                )}
              </div>

              {/* 概要 */}
              {/* <div className={`${styles.row_area} flex h-[90px] w-full items-center`}> */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title} ${styles.title_sm}`}>概要</span>
                    {!searchMode && (
                      <div
                        className={`${styles.textarea_box} ${styles.textarea_box_bg}`}
                        // className={`${styles.value} h-[85px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataActivity?.summary
                            ? selectedRowDataActivity?.summary.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></div>
                    )}
                    {/* {searchMode && (
                        <textarea
                          name="activity_summary"
                          id="activity_summary"
                          cols={30}
                          rows={10}
                          className={`${styles.textarea_box} `}
                          value={inputSummary}
                          onChange={(e) => setInputSummary(e.target.value)}
                        ></textarea>
                      )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業部名 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>事業部名</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.department ? selectedRowDataActivity?.department : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>活動年月度</span>
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataActivity?.senior_managing_director
                        //     ? selectedRowDataActivity?.senior_managing_director
                        //     : ""
                        // }`}
                        className={`${styles.value}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.activity_year_month
                          ? selectedRowDataActivity?.activity_year_month
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業所・自社担当 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>事業所</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.business_office ? selectedRowDataActivity?.business_office : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>自社担当</span>
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataActivity?.member_name
                        //     ? selectedRowDataActivity?.member_name
                        //     : ""
                        // }`}
                        className={`${styles.value}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.member_name ? selectedRowDataActivity?.member_name : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 実施1・実施2 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>実施1</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.product_introduction1
                          ? selectedRowDataActivity?.product_introduction1
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>実施2</span>
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataActivity?.senior_managing_director
                        //     ? selectedRowDataActivity?.senior_managing_director
                        //     : ""
                        // }`}
                        className={`${styles.value}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.product_introduction2
                          ? selectedRowDataActivity?.product_introduction2
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 実施3・実施4 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>実施3</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.product_introduction3
                          ? selectedRowDataActivity?.product_introduction3
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>実施4</span>
                    {!searchMode && (
                      <span
                        // data-text={`${
                        //   selectedRowDataActivity?.senior_managing_director
                        //     ? selectedRowDataActivity?.senior_managing_director
                        //     : ""
                        // }`}
                        className={`${styles.value}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.product_introduction4
                          ? selectedRowDataActivity?.product_introduction4
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 実施5 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>実施5</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.product_introduction5
                          ? selectedRowDataActivity?.product_introduction5
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    {/* <span className={`${styles.title}`}>実施4</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataActivity?.senior_managing_director
                              ? selectedRowDataActivity?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataActivity?.senior_managing_director
                            ? selectedRowDataActivity?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  </div>
                  {/* <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* TEL要注意フラグ・TEL要注意理由 */}
              <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    {/* <span className={`${styles.check_title}`}>TEL要注意フラグ</span> */}
                    <div className={`${styles.check_title} ${styles.double_text} flex flex-col`}>
                      <span>TEL</span>
                      <span>要注意フラグ</span>
                    </div>

                    <div className={`${styles.grid_select_cell_header} `}>
                      <input
                        type="checkbox"
                        // checked={!!checkedColumnHeader} // 初期値
                        checked={!!selectedRowDataActivity?.call_careful_flag}
                        onChange={() => {
                          setLoadingGlobalState(false);
                          setIsOpenUpdateActivityModal(true);
                        }}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.right_under_title}`}>注意理由</span>
                    {!searchMode && (
                      <span
                        data-text={`${
                          selectedRowDataActivity?.call_careful_reason
                            ? selectedRowDataActivity?.call_careful_reason
                            : ""
                        }`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e, "right")}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.call_careful_reason
                          ? selectedRowDataActivity?.call_careful_reason
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* メール禁止フラグ・資料禁止フラグ */}
              <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    {/* <span className={`${styles.check_title}`}>メール禁止フラグ</span> */}
                    <div className={`${styles.check_title} ${styles.double_text} flex flex-col`}>
                      <span>メール</span>
                      <span>禁止フラグ</span>
                    </div>

                    <div className={`${styles.grid_select_cell_header} `}>
                      <input
                        type="checkbox"
                        checked={!!selectedRowDataActivity?.email_ban_flag}
                        onChange={() => {
                          setLoadingGlobalState(false);
                          setIsOpenUpdateActivityModal(true);
                        }}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    {/* <span className={`${styles.check_title}`}>資料禁止フラグ</span> */}
                    <div className={`${styles.check_title} ${styles.double_text} flex flex-col`}>
                      <span>資料</span>
                      <span>禁止フラグ</span>
                    </div>

                    <div className={`${styles.grid_select_cell_header} `}>
                      <input
                        type="checkbox"
                        checked={!!selectedRowDataActivity?.sending_materials_ban_flag}
                        onChange={() => {
                          setLoadingGlobalState(false);
                          setIsOpenUpdateActivityModal(true);
                        }}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* FAX・DM禁止フラグ */}
              <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    {/* <span className={`${styles.check_title}`}>FAX・DM禁止フラグ</span> */}
                    <div className={`${styles.check_title} ${styles.double_text} flex flex-col`}>
                      <span>FAX・DM</span>
                      <span>禁止フラグ</span>
                    </div>

                    <div className={`${styles.grid_select_cell_header} `}>
                      <input
                        type="checkbox"
                        checked={!!selectedRowDataActivity?.fax_dm_ban_flag}
                        onChange={() => {
                          setLoadingGlobalState(false);
                          setIsOpenUpdateActivityModal(true);
                        }}
                        className={`${styles.grid_select_cell_header_input}`}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}></div>
                </div>
              </div>

              {/* 禁止理由 */}
              <div className={`${styles.row_area} flex h-[70px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title}`}>禁止理由</span>
                    {!searchMode && (
                      <div
                        data-text={`${selectedRowDataActivity?.ban_reason ? selectedRowDataActivity?.ban_reason : ""}`}
                        className={`${styles.value} h-[65px]`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataActivity?.ban_reason
                            ? selectedRowDataActivity?.ban_reason.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></div>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* クレーム */}
              <div className={`${styles.row_area} flex h-[70px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full  `}>
                    <span className={`${styles.title}`}>クレーム</span>
                    {!searchMode && (
                      <div
                        data-text={`${selectedRowDataActivity?.claim ? selectedRowDataActivity?.claim : ""}`}
                        className={`${styles.value} h-[65px]`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataActivity?.claim
                            ? selectedRowDataActivity?.claim.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></div>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 左エリア 活動~クレームまで ここまで */}
            </div>
            {/* --------- ラッパーここまで --------- */}
          </div>
        )}
        {/* ---------------- 通常モード 左コンテナここまで ---------------- */}

        {/* ---------------- 通常モード 真ん中コンテナ 会社名~住所までエリア ---------------- */}
        {!searchMode && (
          <div
            className={`${styles.right_container} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] grow bg-[aqua]/[0] pb-[35px] pt-[5px]`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full w-full flex-col bg-[#000]/[0]`}>
              <div
                className={`${styles.right_under_container} h-screen w-full  bg-[#f0f0f0]/[0] ${
                  isOpenSidebar ? `transition-base02` : `transition-base01`
                }`}
              >
                {/* コンテンツ row_areaグループ 会社名~住所まで 通常モード */}
                {/* 会社名 通常モード */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>●会社名</span>
                      {!searchMode && (
                        <span className={`${styles.value} ${styles.value_highlight}`}>
                          {selectedRowDataActivity?.company_name ? selectedRowDataActivity?.company_name : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          placeholder="株式会社○○"
                          autoFocus
                          className={`${styles.input_box}`}
                          value={inputCompanyName}
                          onChange={(e) => setInputCompanyName(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 部署名 通常モード */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>●部署名</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.department_name ? selectedRowDataActivity?.department_name : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          placeholder="「代表取締役＊」や「＊製造部＊」「＊品質＊」など"
                          className={`${styles.input_box}`}
                          value={inputDepartmentName}
                          onChange={(e) => setInputDepartmentName(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 担当者名 通常モード */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>担当者名</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.contact_name ? selectedRowDataActivity?.contact_name : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="tel"
                          placeholder=""
                          className={`${styles.input_box}`}
                          value={inputContactName}
                          onChange={(e) => setInputContactName(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>直通TEL</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.direct_line ? selectedRowDataActivity?.direct_line : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="tel"
                          className={`${styles.input_box}`}
                          value={inputDirectLine}
                          onChange={(e) => setInputDirectLine(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 内線TEL・代表TEL 通常モード */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>内線TEL</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.extension ? selectedRowDataActivity?.extension : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="tel"
                          placeholder=""
                          className={`${styles.input_box}`}
                          value={inputExtension}
                          onChange={(e) => setInputExtension(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>代表TEL</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.main_phone_number ? selectedRowDataActivity?.main_phone_number : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="tel"
                          className={`${styles.input_box}`}
                          value={inputTel}
                          onChange={(e) => setInputTel(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 直通FAX・代表FAX 通常モード */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>直通FAX</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.direct_fax ? selectedRowDataActivity?.direct_fax : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputDirectFax}
                          onChange={(e) => setInputDirectFax(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className={`flex h-full w-1/2 flex-col pr-[20px]`}>
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>代表FAX</span>
                      {/* <span className={`${styles.title}`}>会員専用</span> */}
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.main_fax ? selectedRowDataActivity?.main_fax : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputFax}
                          onChange={(e) => setInputFax(e.target.value)}
                        />
                      )}
                      {/* {!searchMode && <span className={`${styles.value}`}>有料会員様専用のフィールドです</span>} */}
                      {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      {/* サブスク未加入者にはブラーを表示 */}
                      {/* <div className={`${styles.limited_lock_cover_half} flex-center`}>
                    <FaLock />
                  </div> */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 社用携帯・私用携帯 通常モード */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>社用携帯</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.company_cell_phone
                            ? selectedRowDataActivity?.company_cell_phone
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputCompanyCellPhone}
                          onChange={(e) => setInputCompanyCellPhone(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>私用携帯</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.personal_cell_phone
                            ? selectedRowDataActivity?.personal_cell_phone
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputPersonalCellPhone}
                          onChange={(e) => setInputPersonalCellPhone(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* Email 通常モード */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>E-mail</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.contact_email ? selectedRowDataActivity?.contact_email : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputContactEmail}
                          onChange={(e) => setInputContactEmail(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 郵便番号 通常モード */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>郵便番号</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.zipcode ? selectedRowDataActivity?.zipcode : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputZipcode}
                          onChange={(e) => setInputZipcode(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}></span>
                      {/* {!searchMode && (
                    <span className={`${styles.value}`}>
                      {selectedRowDataActivity?.established_in ? selectedRowDataActivity?.established_in : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputFound}
                      onChange={(e) => setInputFound(e.target.value)}
                    />
                  )} */}
                    </div>
                    {/* <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>

                {/* 住所 通常モード */}
                <div
                  className={` ${
                    searchMode ? `${styles.row_area_lg_box}` : `${styles.row_area}`
                  } flex w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>○住所</span>
                      {!searchMode && (
                        <span className={`${styles.textarea_value} h-[45px]`}>
                          {selectedRowDataActivity?.address ? selectedRowDataActivity?.address : ""}
                        </span>
                      )}
                      {searchMode && (
                        <textarea
                          name="address"
                          id="address"
                          cols={30}
                          // rows={10}
                          placeholder="「神奈川県＊」や「＊大田区＊」など"
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                          value={inputAddress}
                          onChange={(e) => setInputAddress(e.target.value)}
                        ></textarea>
                      )}
                    </div>
                    <div className={`${styles.underline} `}></div>
                  </div>
                </div>
                {/* コンテンツ row_areaグループ 会社名~住所まで 通常モード ここまで */}
              </div>
            </div>
            {/* --------- ラッパーここまで --------- */}
          </div>
        )}
        {/* ---------------- 通常モード 真ん中コンテナ 会社名~住所までエリア ここまで ---------------- */}

        {/* ---------------- 通常モード 右コンテナ 役職名~会社IDまで ---------------- */}
        {!searchMode && (
          <div
            // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
            className={`${styles.left_container} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)] pb-[35px] pt-[5px]`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* コンテンツエリア row_areaグループ 役職名=会社IDまで */}
              {/* 役職名・職位 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>役職名</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.position_name ? selectedRowDataActivity?.position_name : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputPositionName}
                        onChange={(e) => setInputPositionName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>職位</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.position_class ? selectedRowDataActivity?.position_class : ""}
                      </span>
                    )}
                    {searchMode && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputPositionClass}
                        onChange={(e) => setInputPositionClass(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="1 代表者">1 代表者</option>
                        <option value="2 取締役/役員">2 取締役/役員</option>
                        <option value="3 部長">3 部長</option>
                        <option value="4 課長">4 課長</option>
                        <option value="5 課長未満">5 課長未満</option>
                        <option value="6 所長・工場長">6 所長・工場長</option>
                        <option value="7 不明">7 不明</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当職種・決裁金額 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当職種</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.occupation ? selectedRowDataActivity?.occupation : ""}
                      </span>
                    )}
                    {searchMode && (
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        {optionsOccupation.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    {/* <span className={`${styles.title} !mr-[15px]`}>決裁金額(万円)</span> */}
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>決裁金額</span>
                      <span>(万円)</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.approval_amount ? selectedRowDataActivity?.approval_amount : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 規模（ランク）・決算月 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.number_of_employees_class
                          ? selectedRowDataActivity?.number_of_employees_class
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="A*">A 1000名以上</option>
                        <option value="B*">B 500~999名</option>
                        <option value="C*">C 300~499名</option>
                        <option value="D*">D 200~299名</option>
                        <option value="E*">E 100~199名</option>
                        <option value="F*">F 50~99名</option>
                        <option value="G*">G 1~49名</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>決算月</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.fiscal_end_month ? selectedRowDataActivity?.fiscal_end_month : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputFiscal}
                        onChange={(e) => setInputFiscal(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 予算申請月1・予算申請月2 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title}`}>予算申請月1</span> */}
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>予算</span>
                      <span>申請月1</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.budget_request_month1
                          ? selectedRowDataActivity?.budget_request_month1
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBudgetRequestMonth1}
                        onChange={(e) => setInputBudgetRequestMonth1(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    {/* <span className={`${styles.title}`}>予算申請月2</span> */}
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>予算</span>
                      <span>申請月2</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.budget_request_month2
                          ? selectedRowDataActivity?.budget_request_month2
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBudgetRequestMonth2}
                        onChange={(e) => setInputBudgetRequestMonth2(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 資本金・設立 通常モード テスト */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title}`}>資本金(万円)</span> */}
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>資本金</span>
                      <span>(万円)</span>
                    </div>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                        {selectedRowDataActivity?.capital
                          ? convertToJapaneseCurrencyFormat(selectedRowDataActivity.capital)
                          : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={!!inputCapital ? inputCapital : ""}
                        onChange={(e) => setInputCapital(e.target.value)}
                        onBlur={() =>
                          setInputCapital(
                            !!inputCapital && inputCapital !== ""
                              ? (convertToMillions(inputCapital.trim()) as number).toString()
                              : ""
                          )
                        }
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>設立</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.established_in ? selectedRowDataActivity?.established_in : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputFound}
                        onChange={(e) => setInputFound(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業内容 通常モード */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>事業内容</span>
                    {!searchMode && (
                      <>
                        {/* <span className={`${styles.textarea_value} h-[45px]`}>
                        東京都港区芝浦4-20-2
                        芝浦アイランドブルームタワー602号室あああああああああああああああああああああああああああああ芝浦アイランドブルームタワー602号室222あああああああああああああああああああああああああああああ
                      </span> */}
                        <span
                          data-text={`${
                            selectedRowDataActivity?.business_content ? selectedRowDataActivity?.business_content : ""
                          }`}
                          className={`${styles.textarea_value} h-[45px]`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataActivity?.business_content
                              ? selectedRowDataActivity?.business_content.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataActivity?.business_content ? selectedRowDataActivity?.business_content : ""} */}
                        </span>
                      </>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要取引先 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>主要取引先</span>
                    {!searchMode && (
                      <span
                        data-text={`${selectedRowDataActivity?.clients ? selectedRowDataActivity?.clients : ""}`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.clients ? selectedRowDataActivity?.clients : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputClient}
                        onChange={(e) => setInputClient(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要仕入先 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>主要仕入先</span>
                    {!searchMode && (
                      <span
                        data-text={`${selectedRowDataActivity?.supplier ? selectedRowDataActivity?.supplier : ""}`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.supplier ? selectedRowDataActivity?.supplier : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputSupplier}
                        onChange={(e) => setInputSupplier(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 設備 通常モード */}
              <div
                className={`${
                  searchMode ? `${styles.row_area_lg_box}` : `${styles.row_area}`
                } flex w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>設備</span>
                    {!searchMode && (
                      <>
                        <span
                          data-text={`${selectedRowDataActivity?.facility ? selectedRowDataActivity?.facility : ""}`}
                          className={`${styles.textarea_value} h-[45px]`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataActivity?.facility
                              ? selectedRowDataActivity?.facility.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataActivity?.facility ? selectedRowDataActivity?.facility : ""} */}
                        </span>
                      </>
                    )}
                    {searchMode && (
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                        value={inputFacility}
                        onChange={(e) => setInputFacility(e.target.value)}
                      ></textarea>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業拠点・海外拠点 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>事業拠点</span>
                    {!searchMode && (
                      <span
                        data-text={`${
                          selectedRowDataActivity?.business_sites ? selectedRowDataActivity?.business_sites : ""
                        }`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.business_sites ? selectedRowDataActivity?.business_sites : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBusinessSite}
                        onChange={(e) => setInputBusinessSite(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>海外拠点</span>
                    {!searchMode && (
                      <span
                        data-text={`${
                          selectedRowDataActivity?.overseas_bases ? selectedRowDataActivity?.overseas_bases : ""
                        }`}
                        className={`${styles.value}`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.overseas_bases ? selectedRowDataActivity?.overseas_bases : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputOverseas}
                        onChange={(e) => setInputOverseas(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* グループ会社 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>ｸﾞﾙｰﾌﾟ会社</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity?.group_company ? selectedRowDataActivity?.group_company : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.group_company ? selectedRowDataActivity?.group_company : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputGroup}
                        onChange={(e) => setInputGroup(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* HP */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>HP</span>
                    {!searchMode && !!selectedRowDataActivity?.website_url ? (
                      <a
                        href={selectedRowDataActivity.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.value} ${styles.anchor}`}
                      >
                        {selectedRowDataActivity.website_url}
                      </a>
                    ) : (
                      <span></span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="「is not null」でHP有りのデータのみ抽出"
                        value={inputHP}
                        onChange={(e) => setInputHP(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 会社Email 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>会社Email</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.email_value}`}
                        onClick={async () => {
                          if (!selectedRowDataActivity?.company_email) return;
                          try {
                            await navigator.clipboard.writeText(selectedRowDataActivity.company_email);
                            toast.success(`コピーしました!`, {
                              position: "bottom-center",
                              autoClose: 1000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              transition: Zoom,
                            });
                          } catch (e: any) {
                            toast.error(`コピーできませんでした!`, {
                              position: "bottom-center",
                              autoClose: 1000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              transition: Zoom,
                            });
                          }
                        }}
                      >
                        {selectedRowDataActivity?.company_email ? selectedRowDataActivity?.company_email : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="「is not null」でHP有りのデータのみ抽出"
                        value={inputCompanyEmail}
                        onChange={(e) => setInputCompanyEmail(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 業種 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>○業種</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.industry_type ? selectedRowDataActivity?.industry_type : ""}
                      </span>
                    )}
                    {searchMode && !inputProductL && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box}`}
                      //   value={inputIndustryType}
                      //   onChange={(e) => setInputIndustryType(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputIndustryType}
                        onChange={(e) => setInputIndustryType(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="機械要素・部品">機械要素・部品</option>
                        <option value="自動車・輸送機器">自動車・輸送機器</option>
                        <option value="電子部品・半導体">電子部品・半導体</option>
                        <option value="製造・加工受託">製造・加工受託</option>
                        <option value="産業用機械">産業用機械</option>
                        <option value="産業用電気機器">産業用電気機器</option>
                        <option value="IT・情報通信">IT・情報通信</option>
                        <option value="ソフトウェア">ソフトウェア</option>
                        <option value="医薬品・バイオ">医薬品・バイオ</option>
                        <option value="樹脂・プラスチック">樹脂・プラスチック</option>
                        <option value="ゴム製品">ゴム製品</option>
                        <option value="鉄/非鉄金属">鉄/非鉄金属</option>
                        <option value="民生用電気機器">民生用電気機器</option>
                        <option value="航空・宇宙">航空・宇宙</option>
                        <option value="CAD/CAM">CAD/CAM</option>
                        <option value="建材・資材・什器">建材・資材・什器</option>
                        <option value="小売">小売</option>
                        <option value="飲食料品">飲食料品</option>
                        <option value="飲食店・宿泊業">飲食店・宿泊業</option>
                        <option value="公益・特殊・独立行政法人">公益・特殊・独立行政法人</option>
                        <option value="水産・農林業">水産・農林業</option>
                        <option value="繊維">繊維</option>
                        <option value="ガラス・土石製品">ガラス・土石製品</option>
                        <option value="造船・重機">造船・重機</option>
                        <option value="環境">環境</option>
                        <option value="印刷業">印刷業</option>
                        <option value="運輸業">運輸業</option>
                        <option value="金融・証券・保険業">金融・証券・保険業</option>
                        <option value="警察・消防・自衛隊">警察・消防・自衛隊</option>
                        <option value="鉱業">鉱業</option>
                        <option value="紙・バルブ">紙・バルブ</option>
                        <option value="木材">木材</option>
                        <option value="ロボット">ロボット</option>
                        <option value="試験・分析・測定">試験・分析・測定</option>
                        <option value="エネルギー">エネルギー</option>
                        <option value="電気・ガス・水道業">電気・ガス・水道業</option>
                        <option value="医療・福祉">医療・福祉</option>
                        <option value="サービス業">サービス業</option>
                        <option value="その他">その他</option>
                        <option value="化学">化学</option>
                        <option value="セラミックス">セラミックス</option>
                        <option value="食品機械">食品機械</option>
                        <option value="光学機器">光学機器</option>
                        <option value="医療機器">医療機器</option>
                        <option value="その他製造">その他製造</option>
                        <option value="倉庫・運輸関連業">倉庫・運輸関連業</option>
                        <option value="教育・研究機関">教育・研究機関</option>
                        <option value="石油・石炭製品">石油・石炭製品</option>
                        <option value="商社・卸売">商社・卸売</option>
                        <option value="官公庁">官公庁</option>
                        <option value="個人">個人</option>
                        <option value="不明">不明</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（大分類） 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !mr-[15px]`}>製品分類（大分類）</span> */}
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>製品分類</span>
                      <span>(大分類)</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity?.product_category_large
                            ? selectedRowDataActivity?.product_category_large
                            : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.product_category_large
                          ? selectedRowDataActivity?.product_category_large
                          : ""}
                      </span>
                    )}
                    {searchMode && !inputIndustryType && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductL}
                      //   onChange={(e) => setInputProductL(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputProductL}
                        onChange={(e) => setInputProductL(e.target.value)}
                      >
                        <option value=""></option>
                        <option value="電子部品・モジュール">電子部品・モジュール</option>
                        <option value="機械部品">機械部品</option>
                        <option value="製造・加工機械">製造・加工機械</option>
                        <option value="科学・理化学機器">科学・理化学機器</option>
                        <option value="素材・材料">素材・材料</option>
                        <option value="測定・分析">測定・分析</option>
                        <option value="画像処理">画像処理</option>
                        <option value="制御・電機機器">制御・電機機器</option>
                        <option value="工具・消耗品・備品">工具・消耗品・備品</option>
                        <option value="設計・生産支援">設計・生産支援</option>
                        <option value="IT・ネットワーク">IT・ネットワーク</option>
                        <option value="オフィス">オフィス</option>
                        <option value="業務支援サービス">業務支援サービス</option>
                        <option value="セミナー・スキルアップ">セミナー・スキルアップ</option>
                        <option value="その他">その他</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（中分類） 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !mr-[15px]`}>製品分類（中分類）</span> */}
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>製品分類</span>
                      <span>(中分類)</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity?.product_category_medium
                            ? selectedRowDataActivity?.product_category_medium
                            : ""
                        }`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {selectedRowDataActivity?.product_category_medium
                          ? selectedRowDataActivity?.product_category_medium
                          : ""}
                      </span>
                    )}
                    {searchMode && !!inputProductL && (
                      // <input
                      //   type="text"
                      //   className={`${styles.input_box} ml-[20px]`}
                      //   value={inputProductM}
                      //   onChange={(e) => setInputProductM(e.target.value)}
                      // />
                      <select
                        name="position_class"
                        id="position_class"
                        value={inputProductM}
                        onChange={(e) => setInputProductM(e.target.value)}
                        className={`${inputProductL ? "" : "hidden"} ml-auto h-full w-full cursor-pointer  ${
                          styles.select_box
                        }`}
                      >
                        {inputProductL === "電子部品・モジュール" &&
                          productCategoriesM.moduleCategoryM.map((option) => option)}
                        {inputProductL === "機械部品" &&
                          productCategoriesM.machinePartsCategoryM.map((option) => option)}
                        {inputProductL === "製造・加工機械" &&
                          productCategoriesM.processingMachineryCategoryM.map((option) => option)}
                        {inputProductL === "科学・理化学機器" &&
                          productCategoriesM.scienceCategoryM.map((option) => option)}
                        {inputProductL === "素材・材料" && productCategoriesM.materialCategoryM.map((option) => option)}
                        {inputProductL === "測定・分析" && productCategoriesM.analysisCategoryM.map((option) => option)}
                        {inputProductL === "画像処理" &&
                          productCategoriesM.imageProcessingCategoryM.map((option) => option)}
                        {inputProductL === "制御・電機機器" &&
                          productCategoriesM.controlEquipmentCategoryM.map((option) => option)}
                        {inputProductL === "工具・消耗品・備品" &&
                          productCategoriesM.toolCategoryM.map((option) => option)}
                        {inputProductL === "設計・生産支援" &&
                          productCategoriesM.designCategoryM.map((option) => option)}
                        {inputProductL === "IT・ネットワーク" && productCategoriesM.ITCategoryM.map((option) => option)}
                        {inputProductL === "オフィス" && productCategoriesM.OfficeCategoryM.map((option) => option)}
                        {inputProductL === "業務支援サービス" &&
                          productCategoriesM.businessSupportCategoryM.map((option) => option)}
                        {inputProductL === "セミナー・スキルアップ" &&
                          productCategoriesM.skillUpCategoryM.map((option) => option)}
                        {inputProductL === "その他" && productCategoriesM.othersCategoryM.map((option) => option)}
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類（小分類） */}
              {/* <div className={`${styles.row_area} ${searchMode ? `${styles.row_area_search_mode}` : ``} flex h-[30px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>製品分類（小分類）</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataActivity?.product_category_small
                              ? selectedRowDataActivity?.product_category_small
                              : ""
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataActivity?.product_category_small
                            ? selectedRowDataActivity?.product_category_small
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box} ml-[20px]`}
                          value={inputProductS}
                          onChange={(e) => setInputProductS(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
              </div> */}

              {/* 法人番号・ID 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>○法人番号</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataActivity?.corporate_number ? selectedRowDataActivity?.corporate_number : ""}
                      </span>
                    )}
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputCorporateNum}
                        onChange={(e) => setInputCorporateNum(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_min}`}>会社ID</span>
                    {!searchMode && (
                      <span className={`${styles.value} truncate`}>
                        {selectedRowDataActivity?.company_id ? selectedRowDataActivity?.company_id : ""}
                      </span>
                    )}
                  </div> */}
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* コンテンツエリア row_areaグループ 役職名=会社IDまで ここまで */}
            </div>
            {/* --------- ラッパー ここまで --------- */}
          </div>
        )}
        {/* ---------------- 通常モード 右コンテナ 役職名~会社IDまで ここまで ---------------- */}

        {/* ---------------- 🌟サーチモード 左コンテナ🌟 ---------------- */}
        {searchMode && (
          <div
            // className={`${styles.left_container} h-full min-w-[calc((100vw-var(--sidebar-width))/3)] pb-[35px] pt-[10px]`}
            className={`${styles.left_container} h-full min-w-[calc(50vw-var(--sidebar-mini-width))] max-w-[calc(50vw-var(--sidebar-mini-width))] pb-[35px] pt-[0px]`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* コンテンツ row_areaグループ 全体 サーチモード */}
              <>
                {/* ============= 会社情報エリアここから ============= */}
                {/* コンテンツ row_area 会社名~会社IDまで サーチモード */}
                {/* 会社情報 サーチ */}
                <div
                  className={`${styles.row_area} ${styles.row_area_search_mode} mb-[5px] mt-[20px] flex w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full !min-h-[33px] items-center`}>
                      <span className={`${styles.section_title}`}>会社情報</span>
                    </div>
                    <div className={`${styles.section_underline}`}></div>
                  </div>
                </div>
                {/* 会社名 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>●会社名</span>
                      {!searchMode && (
                        <span className={`${styles.value} ${styles.value_highlight}`}>
                          {selectedRowDataActivity?.company_name ? selectedRowDataActivity?.company_name : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          placeholder="株式会社○○"
                          autoFocus
                          className={`${styles.input_box}`}
                          value={inputCompanyName}
                          onChange={(e) => setInputCompanyName(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 部署名 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>●部署名</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.department_name ? selectedRowDataActivity?.department_name : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          placeholder="「代表取締役＊」や「＊製造部＊」「＊品質＊」など"
                          className={`${styles.input_box}`}
                          value={inputDepartmentName}
                          onChange={(e) => setInputDepartmentName(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 担当者名 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>担当者名</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.contact_name ? selectedRowDataActivity?.contact_name : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="tel"
                          placeholder=""
                          className={`${styles.input_box}`}
                          value={inputContactName}
                          onChange={(e) => setInputContactName(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>直通TEL</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.direct_line ? selectedRowDataActivity?.direct_line : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="tel"
                          className={`${styles.input_box}`}
                          value={inputDirectLine}
                          onChange={(e) => setInputDirectLine(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 内線TEL・代表TEL サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>内線TEL</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.extension ? selectedRowDataActivity?.extension : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="tel"
                          placeholder=""
                          className={`${styles.input_box}`}
                          value={inputExtension}
                          onChange={(e) => setInputExtension(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>代表TEL</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.main_phone_number ? selectedRowDataActivity?.main_phone_number : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="tel"
                          className={`${styles.input_box}`}
                          value={inputTel}
                          onChange={(e) => setInputTel(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 直通FAX・代表FAX サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>直通FAX</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.direct_fax ? selectedRowDataActivity?.direct_fax : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputDirectFax}
                          onChange={(e) => setInputDirectFax(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className={`flex h-full w-1/2 flex-col pr-[20px]`}>
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>代表FAX</span>
                      {/* <span className={`${styles.title}`}>会員専用</span> */}
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.main_fax ? selectedRowDataActivity?.main_fax : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputFax}
                          onChange={(e) => setInputFax(e.target.value)}
                        />
                      )}
                      {/* {!searchMode && <span className={`${styles.value}`}>有料会員様専用のフィールドです</span>} */}
                      {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      {/* サブスク未加入者にはブラーを表示 */}
                      {/* <div className={`${styles.limited_lock_cover_half} flex-center`}>
                    <FaLock />
                  </div> */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 社用携帯・私用携帯 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>社用携帯</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.company_cell_phone
                            ? selectedRowDataActivity?.company_cell_phone
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputCompanyCellPhone}
                          onChange={(e) => setInputCompanyCellPhone(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>私用携帯</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.personal_cell_phone
                            ? selectedRowDataActivity?.personal_cell_phone
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputPersonalCellPhone}
                          onChange={(e) => setInputPersonalCellPhone(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* Email サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>E-mail</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.contact_email ? selectedRowDataActivity?.contact_email : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputContactEmail}
                          onChange={(e) => setInputContactEmail(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 郵便番号 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>郵便番号</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.zipcode ? selectedRowDataActivity?.zipcode : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputZipcode}
                          onChange={(e) => setInputZipcode(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}></span>
                      {/* {!searchMode && (
                    <span className={`${styles.value}`}>
                      {selectedRowDataActivity?.established_in ? selectedRowDataActivity?.established_in : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputFound}
                      onChange={(e) => setInputFound(e.target.value)}
                    />
                  )} */}
                    </div>
                    {/* <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>

                {/* 住所 サーチ */}
                <div
                  className={` ${
                    searchMode ? `${styles.row_area_lg_box}` : `${styles.row_area}`
                  } flex w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>○住所</span>
                      {!searchMode && (
                        <span className={`${styles.textarea_value} h-[45px]`}>
                          {selectedRowDataActivity?.address ? selectedRowDataActivity?.address : ""}
                        </span>
                      )}
                      {searchMode && (
                        <textarea
                          name="address"
                          id="address"
                          cols={30}
                          // rows={10}
                          placeholder="「神奈川県＊」や「＊大田区＊」など"
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                          value={inputAddress}
                          onChange={(e) => setInputAddress(e.target.value)}
                        ></textarea>
                      )}
                    </div>
                    <div className={`${styles.underline} `}></div>
                  </div>
                </div>

                {/* 役職名・職位 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>役職名</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.position_name ? selectedRowDataActivity?.position_name : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputPositionName}
                          onChange={(e) => setInputPositionName(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>職位</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.position_class ? selectedRowDataActivity?.position_class : ""}
                        </span>
                      )}
                      {searchMode && (
                        // <input
                        //   type="text"
                        //   className={`${styles.input_box} ml-[20px]`}
                        //   value={inputProductL}
                        //   onChange={(e) => setInputProductL(e.target.value)}
                        // />
                        <select
                          name="position_class"
                          id="position_class"
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputPositionClass}
                          onChange={(e) => setInputPositionClass(e.target.value)}
                        >
                          <option value=""></option>
                          <option value="1 代表者">1 代表者</option>
                          <option value="2 取締役/役員">2 取締役/役員</option>
                          <option value="3 部長">3 部長</option>
                          <option value="4 課長">4 課長</option>
                          <option value="5 課長未満">5 課長未満</option>
                          <option value="6 所長・工場長">6 所長・工場長</option>
                          <option value="7 不明">7 不明</option>
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 担当職種・決裁金額 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>担当職種</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.occupation ? selectedRowDataActivity?.occupation : ""}
                        </span>
                      )}
                      {searchMode && (
                        <select
                          name="position_class"
                          id="position_class"
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputEmployeesClass}
                          onChange={(e) => setInputEmployeesClass(e.target.value)}
                        >
                          <option value=""></option>
                          {optionsOccupation.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      {/* <span className={`${styles.title} !mr-[15px]`}>決裁金額(万円)</span> */}
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>決裁金額</span>
                        <span>(万円)</span>
                      </div>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.approval_amount ? selectedRowDataActivity?.approval_amount : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          // value={inputApprovalAmount}
                          // onChange={(e) => setInputApprovalAmount(e.target.value)}
                          value={!!inputApprovalAmount ? inputApprovalAmount : ""}
                          onChange={(e) => setInputApprovalAmount(e.target.value)}
                          onBlur={() =>
                            setInputApprovalAmount(
                              !!inputApprovalAmount && inputApprovalAmount !== ""
                                ? (convertToMillions(inputApprovalAmount.trim()) as number).toString()
                                : ""
                            )
                          }
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 規模（ランク）・決算月 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.number_of_employees_class
                            ? selectedRowDataActivity?.number_of_employees_class
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        // <input
                        //   type="text"
                        //   className={`${styles.input_box} ml-[20px]`}
                        //   value={inputProductL}
                        //   onChange={(e) => setInputProductL(e.target.value)}
                        // />
                        <select
                          name="position_class"
                          id="position_class"
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputEmployeesClass}
                          onChange={(e) => setInputEmployeesClass(e.target.value)}
                        >
                          <option value=""></option>
                          <option value="A*">A 1000名以上</option>
                          <option value="B*">B 500~999名</option>
                          <option value="C*">C 300~499名</option>
                          <option value="D*">D 200~299名</option>
                          <option value="E*">E 100~199名</option>
                          <option value="F*">F 50~99名</option>
                          <option value="G*">G 1~49名</option>
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>決算月</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.fiscal_end_month ? selectedRowDataActivity?.fiscal_end_month : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputFiscal}
                          onChange={(e) => setInputFiscal(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 予算申請月1・予算申請月2 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <span className={`${styles.title}`}>予算申請月1</span> */}
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>予算</span>
                        <span>申請月1</span>
                      </div>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.budget_request_month1
                            ? selectedRowDataActivity?.budget_request_month1
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputBudgetRequestMonth1}
                          onChange={(e) => setInputBudgetRequestMonth1(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      {/* <span className={`${styles.title}`}>予算申請月2</span> */}
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>予算</span>
                        <span>申請月2</span>
                      </div>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.budget_request_month2
                            ? selectedRowDataActivity?.budget_request_month2
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputBudgetRequestMonth2}
                          onChange={(e) => setInputBudgetRequestMonth2(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 資本金・設立 サーチ テスト */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>資本金(万円)</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                          {selectedRowDataActivity?.capital
                            ? convertToJapaneseCurrencyFormat(selectedRowDataActivity.capital)
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={!!inputCapital ? inputCapital : ""}
                          onChange={(e) => setInputCapital(e.target.value)}
                          onBlur={() =>
                            setInputCapital(
                              !!inputCapital && inputCapital !== ""
                                ? (convertToMillions(inputCapital.trim()) as number).toString()
                                : ""
                            )
                          }
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>設立</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.established_in ? selectedRowDataActivity?.established_in : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputFound}
                          onChange={(e) => setInputFound(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業内容 サーチ */}
                <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box}  flex h-full`}>
                      <span className={`${styles.title}`}>事業内容</span>
                      {!searchMode && (
                        <>
                          {/* <span className={`${styles.textarea_value} h-[45px]`}>
                        東京都港区芝浦4-20-2
                        芝浦アイランドブルームタワー602号室あああああああああああああああああああああああああああああ芝浦アイランドブルームタワー602号室222あああああああああああああああああああああああああああああ
                      </span> */}
                          <span
                            data-text={`${
                              selectedRowDataActivity?.business_content ? selectedRowDataActivity?.business_content : ""
                            }`}
                            className={`${styles.textarea_value} h-[45px]`}
                            onMouseEnter={(e) => handleOpenTooltip(e)}
                            onMouseLeave={handleCloseTooltip}
                            dangerouslySetInnerHTML={{
                              __html: selectedRowDataActivity?.business_content
                                ? selectedRowDataActivity?.business_content.replace(/\n/g, "<br>")
                                : "",
                            }}
                          >
                            {/* {selectedRowDataActivity?.business_content ? selectedRowDataActivity?.business_content : ""} */}
                          </span>
                        </>
                      )}
                      {searchMode && (
                        <textarea
                          name="address"
                          id="address"
                          cols={30}
                          // rows={10}
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                          value={inputContent}
                          onChange={(e) => setInputContent(e.target.value)}
                        ></textarea>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 主要取引先 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>主要取引先</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataActivity?.clients ? selectedRowDataActivity?.clients : ""}`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataActivity?.clients ? selectedRowDataActivity?.clients : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputClient}
                          onChange={(e) => setInputClient(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 主要仕入先 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>主要仕入先</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataActivity?.supplier ? selectedRowDataActivity?.supplier : ""}`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataActivity?.supplier ? selectedRowDataActivity?.supplier : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputSupplier}
                          onChange={(e) => setInputSupplier(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 設備 サーチ */}
                <div
                  className={`${
                    searchMode ? `${styles.row_area_lg_box}` : `${styles.row_area}`
                  } flex w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box}  flex h-full`}>
                      <span className={`${styles.title}`}>設備</span>
                      {!searchMode && (
                        <>
                          <span
                            data-text={`${selectedRowDataActivity?.facility ? selectedRowDataActivity?.facility : ""}`}
                            className={`${styles.textarea_value} h-[45px]`}
                            onMouseEnter={(e) => handleOpenTooltip(e)}
                            onMouseLeave={handleCloseTooltip}
                            dangerouslySetInnerHTML={{
                              __html: selectedRowDataActivity?.facility
                                ? selectedRowDataActivity?.facility.replace(/\n/g, "<br>")
                                : "",
                            }}
                          >
                            {/* {selectedRowDataActivity?.facility ? selectedRowDataActivity?.facility : ""} */}
                          </span>
                        </>
                      )}
                      {searchMode && (
                        <textarea
                          name="address"
                          id="address"
                          cols={30}
                          // rows={10}
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                          value={inputFacility}
                          onChange={(e) => setInputFacility(e.target.value)}
                        ></textarea>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業拠点・海外拠点 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業拠点</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataActivity?.business_sites ? selectedRowDataActivity?.business_sites : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataActivity?.business_sites ? selectedRowDataActivity?.business_sites : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputBusinessSite}
                          onChange={(e) => setInputBusinessSite(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>海外拠点</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataActivity?.overseas_bases ? selectedRowDataActivity?.overseas_bases : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataActivity?.overseas_bases ? selectedRowDataActivity?.overseas_bases : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputOverseas}
                          onChange={(e) => setInputOverseas(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* グループ会社 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>ｸﾞﾙｰﾌﾟ会社</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataActivity?.group_company ? selectedRowDataActivity?.group_company : ""
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataActivity?.group_company ? selectedRowDataActivity?.group_company : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputGroup}
                          onChange={(e) => setInputGroup(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* HP サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>HP</span>
                      {!searchMode && !!selectedRowDataActivity?.website_url ? (
                        <a
                          href={selectedRowDataActivity.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.value} ${styles.anchor}`}
                        >
                          {selectedRowDataActivity.website_url}
                        </a>
                      ) : (
                        <span></span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder="「is not null」でHP有りのデータのみ抽出"
                          value={inputHP}
                          onChange={(e) => setInputHP(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 会社Email サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>会社Email</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value} ${styles.email_value}`}
                          onClick={async () => {
                            if (!selectedRowDataActivity?.company_email) return;
                            try {
                              await navigator.clipboard.writeText(selectedRowDataActivity.company_email);
                              toast.success(`コピーしました!`, {
                                position: "bottom-center",
                                autoClose: 1000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                transition: Zoom,
                              });
                            } catch (e: any) {
                              toast.error(`コピーできませんでした!`, {
                                position: "bottom-center",
                                autoClose: 1000,
                                hideProgressBar: false,
                                closeOnClick: true,
                                pauseOnHover: true,
                                draggable: true,
                                progress: undefined,
                                transition: Zoom,
                              });
                            }
                          }}
                        >
                          {selectedRowDataActivity?.company_email ? selectedRowDataActivity?.company_email : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder="「is not null」でHP有りのデータのみ抽出"
                          value={inputCompanyEmail}
                          onChange={(e) => setInputCompanyEmail(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 業種 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>○業種</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.industry_type ? selectedRowDataActivity?.industry_type : ""}
                        </span>
                      )}
                      {searchMode && !inputProductL && (
                        // <input
                        //   type="text"
                        //   className={`${styles.input_box}`}
                        //   value={inputIndustryType}
                        //   onChange={(e) => setInputIndustryType(e.target.value)}
                        // />
                        <select
                          name="position_class"
                          id="position_class"
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputIndustryType}
                          onChange={(e) => setInputIndustryType(e.target.value)}
                        >
                          <option value=""></option>
                          <option value="機械要素・部品">機械要素・部品</option>
                          <option value="自動車・輸送機器">自動車・輸送機器</option>
                          <option value="電子部品・半導体">電子部品・半導体</option>
                          <option value="製造・加工受託">製造・加工受託</option>
                          <option value="産業用機械">産業用機械</option>
                          <option value="産業用電気機器">産業用電気機器</option>
                          <option value="IT・情報通信">IT・情報通信</option>
                          <option value="ソフトウェア">ソフトウェア</option>
                          <option value="医薬品・バイオ">医薬品・バイオ</option>
                          <option value="樹脂・プラスチック">樹脂・プラスチック</option>
                          <option value="ゴム製品">ゴム製品</option>
                          <option value="鉄/非鉄金属">鉄/非鉄金属</option>
                          <option value="民生用電気機器">民生用電気機器</option>
                          <option value="航空・宇宙">航空・宇宙</option>
                          <option value="CAD/CAM">CAD/CAM</option>
                          <option value="建材・資材・什器">建材・資材・什器</option>
                          <option value="小売">小売</option>
                          <option value="飲食料品">飲食料品</option>
                          <option value="飲食店・宿泊業">飲食店・宿泊業</option>
                          <option value="公益・特殊・独立行政法人">公益・特殊・独立行政法人</option>
                          <option value="水産・農林業">水産・農林業</option>
                          <option value="繊維">繊維</option>
                          <option value="ガラス・土石製品">ガラス・土石製品</option>
                          <option value="造船・重機">造船・重機</option>
                          <option value="環境">環境</option>
                          <option value="印刷業">印刷業</option>
                          <option value="運輸業">運輸業</option>
                          <option value="金融・証券・保険業">金融・証券・保険業</option>
                          <option value="警察・消防・自衛隊">警察・消防・自衛隊</option>
                          <option value="鉱業">鉱業</option>
                          <option value="紙・バルブ">紙・バルブ</option>
                          <option value="木材">木材</option>
                          <option value="ロボット">ロボット</option>
                          <option value="試験・分析・測定">試験・分析・測定</option>
                          <option value="エネルギー">エネルギー</option>
                          <option value="電気・ガス・水道業">電気・ガス・水道業</option>
                          <option value="医療・福祉">医療・福祉</option>
                          <option value="サービス業">サービス業</option>
                          <option value="その他">その他</option>
                          <option value="化学">化学</option>
                          <option value="セラミックス">セラミックス</option>
                          <option value="食品機械">食品機械</option>
                          <option value="光学機器">光学機器</option>
                          <option value="医療機器">医療機器</option>
                          <option value="その他製造">その他製造</option>
                          <option value="倉庫・運輸関連業">倉庫・運輸関連業</option>
                          <option value="教育・研究機関">教育・研究機関</option>
                          <option value="石油・石炭製品">石油・石炭製品</option>
                          <option value="商社・卸売">商社・卸売</option>
                          <option value="官公庁">官公庁</option>
                          <option value="個人">個人</option>
                          <option value="不明">不明</option>
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/* 製品分類（大分類） サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <span className={`${styles.title} !mr-[15px]`}>製品分類（大分類）</span> */}
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>製品分類</span>
                        <span>(大分類)</span>
                      </div>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataActivity?.product_category_large
                              ? selectedRowDataActivity?.product_category_large
                              : ""
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataActivity?.product_category_large
                            ? selectedRowDataActivity?.product_category_large
                            : ""}
                        </span>
                      )}
                      {searchMode && !inputIndustryType && (
                        // <input
                        //   type="text"
                        //   className={`${styles.input_box} ml-[20px]`}
                        //   value={inputProductL}
                        //   onChange={(e) => setInputProductL(e.target.value)}
                        // />
                        <select
                          name="position_class"
                          id="position_class"
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputProductL}
                          onChange={(e) => setInputProductL(e.target.value)}
                        >
                          <option value=""></option>
                          <option value="電子部品・モジュール">電子部品・モジュール</option>
                          <option value="機械部品">機械部品</option>
                          <option value="製造・加工機械">製造・加工機械</option>
                          <option value="科学・理化学機器">科学・理化学機器</option>
                          <option value="素材・材料">素材・材料</option>
                          <option value="測定・分析">測定・分析</option>
                          <option value="画像処理">画像処理</option>
                          <option value="制御・電機機器">制御・電機機器</option>
                          <option value="工具・消耗品・備品">工具・消耗品・備品</option>
                          <option value="設計・生産支援">設計・生産支援</option>
                          <option value="IT・ネットワーク">IT・ネットワーク</option>
                          <option value="オフィス">オフィス</option>
                          <option value="業務支援サービス">業務支援サービス</option>
                          <option value="セミナー・スキルアップ">セミナー・スキルアップ</option>
                          <option value="その他">その他</option>
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/* 製品分類（中分類） サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <span className={`${styles.title} !mr-[15px]`}>製品分類（中分類）</span> */}
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>製品分類</span>
                        <span>(中分類)</span>
                      </div>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataActivity?.product_category_medium
                              ? selectedRowDataActivity?.product_category_medium
                              : ""
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataActivity?.product_category_medium
                            ? selectedRowDataActivity?.product_category_medium
                            : ""}
                        </span>
                      )}
                      {searchMode && !!inputProductL && (
                        // <input
                        //   type="text"
                        //   className={`${styles.input_box} ml-[20px]`}
                        //   value={inputProductM}
                        //   onChange={(e) => setInputProductM(e.target.value)}
                        // />
                        <select
                          name="position_class"
                          id="position_class"
                          value={inputProductM}
                          onChange={(e) => setInputProductM(e.target.value)}
                          className={`${inputProductL ? "" : "hidden"} ml-auto h-full w-full cursor-pointer  ${
                            styles.select_box
                          }`}
                        >
                          {inputProductL === "電子部品・モジュール" &&
                            productCategoriesM.moduleCategoryM.map((option) => option)}
                          {inputProductL === "機械部品" &&
                            productCategoriesM.machinePartsCategoryM.map((option) => option)}
                          {inputProductL === "製造・加工機械" &&
                            productCategoriesM.processingMachineryCategoryM.map((option) => option)}
                          {inputProductL === "科学・理化学機器" &&
                            productCategoriesM.scienceCategoryM.map((option) => option)}
                          {inputProductL === "素材・材料" &&
                            productCategoriesM.materialCategoryM.map((option) => option)}
                          {inputProductL === "測定・分析" &&
                            productCategoriesM.analysisCategoryM.map((option) => option)}
                          {inputProductL === "画像処理" &&
                            productCategoriesM.imageProcessingCategoryM.map((option) => option)}
                          {inputProductL === "制御・電機機器" &&
                            productCategoriesM.controlEquipmentCategoryM.map((option) => option)}
                          {inputProductL === "工具・消耗品・備品" &&
                            productCategoriesM.toolCategoryM.map((option) => option)}
                          {inputProductL === "設計・生産支援" &&
                            productCategoriesM.designCategoryM.map((option) => option)}
                          {inputProductL === "IT・ネットワーク" &&
                            productCategoriesM.ITCategoryM.map((option) => option)}
                          {inputProductL === "オフィス" && productCategoriesM.OfficeCategoryM.map((option) => option)}
                          {inputProductL === "業務支援サービス" &&
                            productCategoriesM.businessSupportCategoryM.map((option) => option)}
                          {inputProductL === "セミナー・スキルアップ" &&
                            productCategoriesM.skillUpCategoryM.map((option) => option)}
                          {inputProductL === "その他" && productCategoriesM.othersCategoryM.map((option) => option)}
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 法人番号・ID サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } mb-[10px] flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>○法人番号</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.corporate_number ? selectedRowDataActivity?.corporate_number : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputCorporateNum}
                          onChange={(e) => setInputCorporateNum(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    {/* <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title_min}`}>会社ID</span>
                      {!searchMode && (
                        <span className={`${styles.value} truncate`}>
                          {selectedRowDataActivity?.company_id ? selectedRowDataActivity?.company_id : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>
              </>
              {/* コンテンツ row_area 会社名~会社IDまで サーチモード ここまで */}
              {/* ============= 会社情報エリアここまで ============= */}
              {/* ============= 活動情報エリアここから ============= */}
              {/* コンテンツ row_area 活動日~クレームまで サーチモード */}
              <>
                {/* 活動情報 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} mb-[5px] flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full !min-h-[33px] items-center`}>
                      <span className={`${styles.section_title}`}>活動情報</span>
                    </div>
                    <div className={`${styles.section_underline}`}></div>
                  </div>
                </div>
                {/* 活動日・クレームフラグ サーチ */}
                <div
                  className={`${styles.row_area} ${searchMode ? `${styles.row_area_search_mode}` : ``} ${
                    styles.row_area_search_mode
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>活動日</span>
                      {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      <DatePickerCustomInput
                        startDate={inputActivityDate}
                        setStartDate={setInputActivityDate}
                        required={false}
                      />
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>クレーム</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.claim_flag ? selectedRowDataActivity?.claim_flag : ""}
                        </span>
                      )}
                      {/* <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          className={`${styles.grid_select_cell_header_input}`}
                          checked={inputClaimFlag ? inputClaimFlag : false}
                          onChange={() => setInputClaimFlag(!inputClaimFlag)}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div> */}
                      <select
                        name="claim_flag"
                        id="claim_flag"
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        // value={inputClaimFlag}
                        // onChange={(e) => setInputClaimFlag(e.target.value)}
                        value={inputClaimFlag === null ? "指定なし" : inputClaimFlag ? "チェック有り" : "チェック無し"}
                        onChange={handleClaimChangeSelectTagValue}
                      >
                        <option value="指定なし">指定なし</option>
                        <option value="チェック無し">チェック無し</option>
                        <option value="チェック有り">チェック有り</option>
                      </select>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 活動タイプ・優先度 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>活動ﾀｲﾌﾟ</span>
                      {searchMode && (
                        <select
                          name="activity_type"
                          id="activity_type"
                          className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                          value={inputActivityType}
                          onChange={(e) => {
                            setInputActivityType(e.target.value);
                          }}
                        >
                          <option value=""></option>
                          <option value="TEL発信(不在)">TEL発信(不在)</option>
                          <option value="TEL発信(能動)">TEL発信(能動)</option>
                          <option value="TEL発信(受動)">TEL発信(受動)</option>
                          <option value="TEL発信(売前ﾌｫﾛｰ)">TEL発信(売前ﾌｫﾛｰ)</option>
                          <option value="TEL発信(売後ﾌｫﾛｰ)">TEL発信(売後ﾌｫﾛｰ)</option>
                          <option value="TEL発信(ｱﾎﾟ組み)">TEL発信(ｱﾎﾟ組み)</option>
                          <option value="TEL発信(その他)">TEL発信(その他)</option>
                          <option value="Email受信">Email受信</option>
                          <option value="Email送信">Email送信</option>
                          <option value="その他">その他</option>
                          <option value="引継ぎ">引継ぎ</option>
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>優先度</span>
                      {searchMode && (
                        <select
                          name="priority"
                          id="priority"
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputPriority}
                          onChange={(e) => setInputPriority(e.target.value)}
                        >
                          <option value=""></option>
                          <option value="高">高</option>
                          <option value="中">中</option>
                          <option value="低">低</option>
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 次回ﾌｫﾛｰ予定日・フォロー完了 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} flex flex-col`}>
                        <span>次回ﾌｫﾛｰ</span>
                        <span>予定日</span>
                      </div>
                      {/* <span className={`${styles.title} !mr-[15px]`}>次回ﾌｫﾛｰ予定日</span> */}
                      <DatePickerCustomInput
                        startDate={inputScheduledFollowUpDate}
                        setStartDate={setInputScheduledFollowUpDate}
                        required={false}
                      />
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>

                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>フォロー完了</span>

                      {/* <div className={`${styles.grid_select_cell_header} `}>
                          <input
                            type="checkbox"
                            checked={!!selectedRowDataActivity?.follow_up_flag}
                            onChange={() => {
                              setLoadingGlobalState(false);
                              setIsOpenUpdateActivityModal(true);
                            }}
                            className={`${styles.grid_select_cell_header_input}`}
                          />
                          <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                          </svg>
                        </div> */}
                      <select
                        name="follow_up_flag"
                        id="follow_up_flag"
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        // value={inputClaimFlag}
                        // onChange={(e) => setInputClaimFlag(e.target.value)}
                        value={
                          inputFollowUpFlag === null ? "指定なし" : inputFollowUpFlag ? "チェック有り" : "チェック無し"
                        }
                        onChange={handleFollowUpFlagChangeSelectTagValue}
                      >
                        <option value="指定なし">指定なし</option>
                        <option value="チェック無し">チェック無し</option>
                        <option value="チェック有り">チェック有り</option>
                      </select>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 概要 サーチ */}
                {/* <div className={`${styles.row_area} flex h-[90px] w-full items-center`}> */}
                <div className={`${styles.row_area_lg_box} flex h-[90px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>概要</span>
                      {searchMode && (
                        <textarea
                          name="activity_summary"
                          id="activity_summary"
                          cols={30}
                          // rows={10}
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                          value={inputSummary}
                          onChange={(e) => setInputSummary(e.target.value)}
                        ></textarea>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業部名 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業部名</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputDepartment}
                          onChange={(e) => setInputDepartment(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      {/* <span className={`${styles.title}`}>活動年月度</span> */}
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>活動</span>
                        <span>年月度</span>
                      </div>
                      {searchMode && (
                        <input
                          type="number"
                          min="0"
                          className={`${styles.input_box}`}
                          placeholder='"202312" など年月を入力'
                          value={inputActivityYearMonth === null ? "" : inputActivityYearMonth}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setInputActivityYearMonth(null);
                            } else {
                              const numValue = Number(val);

                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputActivityYearMonth(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                              } else {
                                setInputActivityYearMonth(numValue);
                              }
                            }
                          }}
                        />
                      )}
                      {/* バツボタン */}
                      {!!inputActivityYearMonth && (
                        <div className={`${styles.close_btn_number}`} onClick={() => setInputActivityYearMonth(null)}>
                          <MdClose className="text-[20px] " />
                        </div>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業所・自社担当 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業所</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputBusinessOffice}
                          onChange={(e) => setInputBusinessOffice(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>自社担当</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputMemberName}
                          onChange={(e) => setInputMemberName(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施1・実施2 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施1</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputProductIntroduction1}
                          onChange={(e) => setInputProductIntroduction1(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>実施2</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputProductIntroduction2}
                          onChange={(e) => setInputProductIntroduction2(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施3・実施4 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施3</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputProductIntroduction3}
                          onChange={(e) => setInputProductIntroduction3(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>実施4</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputProductIntroduction4}
                          onChange={(e) => setInputProductIntroduction4(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施5 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施5</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputProductIntroduction5}
                          onChange={(e) => setInputProductIntroduction5(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      {/* <span className={`${styles.title}`}>実施4</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataActivity?.senior_managing_director
                              ? selectedRowDataActivity?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataActivity?.senior_managing_director
                            ? selectedRowDataActivity?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                    </div>
                    {/* <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>
              </>
              {/* コンテンツ row_area 活動日~実施5まで サーチモード ここまで */}
              {/* ============= 活動情報エリアここまで ============= */}

              {/* コンテンツ row_areaグループ 全体 サーチモード */}
            </div>
            {/* --------- ラッパーここまで --------- */}
          </div>
        )}
        {/* ---------------- サーチモード 左コンテナ ここまで ---------------- */}

        {/* ---------------- サーチモード 右コンテナ ---------------- */}
        {searchMode && (
          <div
            className={`${styles.right_sticky_container} sticky top-0 h-full grow bg-[aqua]/[0] pt-[10px] text-[var(--color-text)] `}
          >
            <div
              className={`${styles.right_sticky_contents_wrapper} flex h-[350px] w-full flex-col rounded-[8px] bg-[var(--color-bg-brand-f10)] px-[20px] `}
            >
              <div className={` text-[13px]`}>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○検索したい条件を入力してください。（必要な項目のみ入力でOK）
                </div>
                <div className="flex  min-h-[30px] items-center">
                  <span className="h-full w-[15px]"></span>
                  例えば、「&quot;東京都大田区&quot;」の会社で「事業拠点」が存在する会社を検索する場合は、「●住所」に「東京都大田区※」と入力し、「事業拠点」に「is
                  not null」と入力し、検索ボタンを押してください。
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「※ アスタリスク」は、「前方一致・後方一致・部分一致」を表します
                </div>
                <div className="flex items-center">
                  <span className="h-full w-[15px]"></span>
                  例えば、会社名に「&quot;工業&quot;」と付く会社を検索したい場合に、「※工業※」、「&quot;製作所&quot;」と付く会社は「※製作所※」と検索することで、指定した文字が付くデータを検索可能です
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「is not null」は「&quot;空欄でない&quot;データ」を抽出します
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「is null」は「&quot;空欄の&quot;データ」を抽出します
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○項目を空欄のまま検索した場合は、その項目の「全てのデータ」を抽出します
                </div>
                {/* <div className="mt-[10px] flex h-[30px] w-full items-center">
                  <button type="submit" className={`${styles.btn}`}>
                    検索
                  </button>
                </div> */}
                <div
                  className={`mt-[10px] flex ${
                    isOpenSidebar ? "min-h-[34px]" : `min-h-[42px]`
                  } w-full items-center justify-between space-x-[15px]`}
                >
                  <div
                    className={`transition-base02 flex-center ${
                      isOpenSidebar ? "max-h-[34px] text-[14px]" : `max-h-[38px] text-[15px]`
                    } w-[100%] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-sub-light)] px-[25px] py-[15px] text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setSearchMode(false);
                      // 編集モード中止
                      if (editSearchMode) setEditSearchMode(false);
                    }}
                  >
                    戻る
                  </div>
                  <button
                    type="submit"
                    className={`${styles.btn} transition-base02 ${
                      isOpenSidebar ? "min-h-[30px] text-[14px]" : `min-h-[38px] text-[15px]`
                    }`}
                  >
                    検索
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ---------------- サーチモード 右コンテナ ここまで ---------------- */}
      </div>
      {/* ------------------------- スクロールコンテナここまで ------------------------- */}
    </form>
  );
};

export const ActivityMainContainerOneThird = memo(ActivityMainContainerOneThirdMemo);
