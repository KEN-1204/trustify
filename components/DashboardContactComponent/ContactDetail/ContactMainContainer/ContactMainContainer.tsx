import React, { ChangeEvent, FC, FormEvent, Suspense, memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "../ContactDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
// import { UnderRightActivityLog } from "./UnderRightActivityLog/UnderRightActivityLog";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import dynamic from "next/dynamic";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import productCategoriesM, { moduleCategoryM } from "@/utils/productCategoryM";
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";
import { FallbackUnderRightActivityLog } from "@/components/DashboardCompanyComponent/CompanyMainContainer/UnderRightActivityLog/FallbackUnderRightActivityLog";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { useMutateContact } from "@/hooks/useMutateContact";
import { Contact, Contact_row_data } from "@/types";
import { CiEdit } from "react-icons/ci";
import { MdEdit, MdOutlineEdit, MdOutlineModeEditOutline } from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { InputSendAndCloseBtn } from "@/components/DashboardCompanyComponent/CompanyMainContainer/InputSendAndCloseBtn/InputSendAndCloseBtn";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { validateAndFormatPhoneNumber } from "@/utils/Helpers/validateAndFormatPhoneNumber";
import {
  getOccupationName,
  getPositionClassName,
  optionsIndustryType,
  optionsOccupation,
  optionsPositionsClass,
  optionsProductL,
} from "../../../../utils/selectOptions";
// import {
//   optionsIndustryType,
//   optionsProductL,
// } from "@/components/DashboardCompanyComponent/CompanyMainContainer/selectOptionsData";

// https://nextjs-ja-translation-docs.vercel.app/docs/advanced-features/dynamic-import
// デフォルトエクスポートの場合のダイナミックインポート
// const DynamicComponent = dynamic(() => import('../components/hello'));
// 通常
import { ContactUnderRightActivityLog } from "./ContactUnderRightActivityLog/ContactUnderRightActivityLog";
import { mappingOccupation, mappingPositionClass } from "@/utils/mappings";
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

const ContactMainContainerMemo: FC = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // サーチモード
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  // 編集サーチモード
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  console.log("🔥 ContactMainContainerレンダリング searchMode", searchMode);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  const newSearchContact_CompanyParams = useDashboardStore((state) => state.newSearchContact_CompanyParams);
  const setNewSearchContact_CompanyParams = useDashboardStore((state) => state.setNewSearchContact_CompanyParams);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // 上画面の選択中の列データ会社
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const setSelectedRowDataContact = useDashboardStore((state) => state.setSelectedRowDataContact);
  // 担当者編集モーダルオープン
  const setIsOpenUpdateContactModal = useDashboardStore((state) => state.setIsOpenUpdateContactModal);
  // 各フィールドの編集モード => ダブルクリックで各フィールド名をstateに格納し、各フィールドをエディットモードへ
  const isEditModeField = useDashboardStore((state) => state.isEditModeField);
  const setIsEditModeField = useDashboardStore((state) => state.setIsEditModeField);
  const [isComposing, setIsComposing] = useState(false); // 日本語のように変換、確定が存在する言語入力の場合の日本語入力の変換中を保持するstate、日本語入力開始でtrue, エンターキーで変換確定した時にfalse
  const [isValidInput, setIsValidInput] = useState(false);

  // useMutation
  const { updateContactFieldMutation } = useMutateContact();

  // 🌟サブミット
  const [inputCompanyName, setInputCompanyName] = useState("");
  const [inputDepartment, setInputDepartment] = useState("");
  const [inputTel, setInputTel] = useState("");
  const [inputFax, setInputFax] = useState("");
  const [inputZipcode, setInputZipcode] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [inputEmployeesClass, setInputEmployeesClass] = useState("");
  const [inputCapital, setInputCapital] = useState("");
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
  const [inputContactName, setInputContactName] = useState(""); // 担当者名
  const [inputDirectLine, setInputDirectLine] = useState(""); // 直通TEL
  const [inputDirectFax, setInputDirectFax] = useState(""); // 直通Fax
  const [inputExtension, setInputExtension] = useState(""); // 内線TEL
  const [inputCompanyCellPhone, setInputCompanyCellPhone] = useState(""); // 社用携帯
  const [inputPersonalCellPhone, setInputPersonalCellPhone] = useState(""); // 私用携帯
  const [inputContactEmail, setInputContactEmail] = useState(""); // Email(担当者)
  const [inputPositionName, setInputPositionName] = useState(""); // 役職名
  const [inputPositionClass, setInputPositionClass] = useState(""); // 職位
  const [inputOccupation, setInputOccupation] = useState(""); // 担当職種
  const [inputApprovalAmount, setInputApprovalAmount] = useState(""); // 決裁金額 stringで入力してnumberに変換 ユーザーの入力が楽になるため(フォーマットもstringならしやすい)
  const [inputCreatedByCompanyId, setInputCreatedByCompanyId] = useState(""); // どの会社が作成したか
  const [inputCreatedByUserId, setInputCreatedByUserId] = useState(""); // どのユーザーが作成したか
  // フラグ関連 フィールドエディット用 初期はfalseにしておき、useEffectでselectedRowDataのフラグを反映する
  const [checkboxCallCarefulFlag, setCheckboxCallCarefulFlag] = useState(false); //TEL要注意フラグ
  const [checkboxEmailBanFlag, setCheckboxEmailBanFlag] = useState(false); //メール禁止フラグ
  const [checkboxSendingMaterialFlag, setCheckboxSendingMaterialFlag] = useState(false); //資料禁止フラグ
  const [checkboxFaxDmFlag, setCheckboxFaxDmFlag] = useState(false); //FAX・DM禁止
  // 注意理由、クレーム、禁止理由は個別フィールド編集のみ
  const [inputCarefulReason, setInputCarefulReason] = useState("");
  const [inputClaim, setInputClaim] = useState("");
  const [inputBanReason, setInputBanReason] = useState("");

  // フラグの初期値を更新
  // TEL要注意フラグ
  useEffect(() => {
    setCheckboxCallCarefulFlag(
      selectedRowDataContact?.call_careful_flag ? selectedRowDataContact.call_careful_flag : false
    );
  }, [selectedRowDataContact?.call_careful_flag]);
  // メール禁止フラグ
  useEffect(() => {
    setCheckboxEmailBanFlag(selectedRowDataContact?.email_ban_flag ? selectedRowDataContact.email_ban_flag : false);
  }, [selectedRowDataContact?.email_ban_flag]);
  // 資料禁止フラグ
  useEffect(() => {
    setCheckboxSendingMaterialFlag(
      selectedRowDataContact?.sending_materials_ban_flag ? selectedRowDataContact.sending_materials_ban_flag : false
    );
  }, [selectedRowDataContact?.sending_materials_ban_flag]);
  // FAX・DM禁止
  useEffect(() => {
    setCheckboxFaxDmFlag(selectedRowDataContact?.fax_dm_ban_flag ? selectedRowDataContact.fax_dm_ban_flag : false);
  }, [selectedRowDataContact?.fax_dm_ban_flag]);

  // サーチ編集モードでリプレイス前の値に復元する関数
  function beforeAdjustFieldValue(value: string | null) {
    if (value === "") return ""; // 全てのデータ
    if (value === null) return ""; // 全てのデータ
    if (value.includes("%")) value = value.replace(/\%/g, "＊");
    if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
    if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
    return value;
  }
  console.log("🔥メインコンテナーnewSearchContact_CompanyParams", newSearchContact_CompanyParams);

  // 編集モードtrueの場合、サーチ条件をinputタグのvalueに格納
  // 新規サーチの場合には、サーチ条件を空にする
  useEffect(() => {
    // if (newSearchContact_CompanyParams === null) return;

    if (editSearchMode && searchMode) {
      if (newSearchContact_CompanyParams === null) return;
      console.log("🔥メインコンテナーnewSearchContact_CompanyParams編集モード", newSearchContact_CompanyParams);
      //   setInputCompanyName(beforeAdjustFieldValue(newSearchContact_CompanyParams.company_name));
      setInputCompanyName(beforeAdjustFieldValue(newSearchContact_CompanyParams["client_companies.name"]));
      setInputDepartment(beforeAdjustFieldValue(newSearchContact_CompanyParams.department_name));
      //   setInputContactName(beforeAdjustFieldValue(newSearchContact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchContact_CompanyParams["contacts.name"]));
      setInputTel(beforeAdjustFieldValue(newSearchContact_CompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchContact_CompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchContact_CompanyParams?.zipcode));
      setInputEmployeesClass(beforeAdjustFieldValue(newSearchContact_CompanyParams?.number_of_employees_class));
      setInputAddress(beforeAdjustFieldValue(newSearchContact_CompanyParams?.address));
      setInputCapital(
        beforeAdjustFieldValue(
          newSearchContact_CompanyParams?.capital ? newSearchContact_CompanyParams.capital.toString() : ""
        )
      );
      setInputFound(beforeAdjustFieldValue(newSearchContact_CompanyParams?.established_in));
      setInputContent(beforeAdjustFieldValue(newSearchContact_CompanyParams?.business_content));
      setInputHP(beforeAdjustFieldValue(newSearchContact_CompanyParams.website_url));
      //   setInputCompanyEmail(beforeAdjustFieldValue(newSearchContact_CompanyParams.company_email));
      setInputCompanyEmail(beforeAdjustFieldValue(newSearchContact_CompanyParams["client_companies.email"]));
      setInputIndustryType(beforeAdjustFieldValue(newSearchContact_CompanyParams.industry_type));
      setInputProductL(beforeAdjustFieldValue(newSearchContact_CompanyParams.product_category_large));
      setInputProductM(beforeAdjustFieldValue(newSearchContact_CompanyParams.product_category_medium));
      setInputProductS(beforeAdjustFieldValue(newSearchContact_CompanyParams.product_category_small));
      setInputFiscal(beforeAdjustFieldValue(newSearchContact_CompanyParams.fiscal_end_month));
      setInputBudgetRequestMonth1(beforeAdjustFieldValue(newSearchContact_CompanyParams.budget_request_month1));
      setInputBudgetRequestMonth2(beforeAdjustFieldValue(newSearchContact_CompanyParams.budget_request_month2));
      setInputClient(beforeAdjustFieldValue(newSearchContact_CompanyParams.clients));
      setInputSupplier(beforeAdjustFieldValue(newSearchContact_CompanyParams.supplier));
      setInputFacility(beforeAdjustFieldValue(newSearchContact_CompanyParams.facility));
      setInputBusinessSite(beforeAdjustFieldValue(newSearchContact_CompanyParams.business_sites));
      setInputOverseas(beforeAdjustFieldValue(newSearchContact_CompanyParams.overseas_bases));
      setInputGroup(beforeAdjustFieldValue(newSearchContact_CompanyParams.group_company));
      setInputCorporateNum(beforeAdjustFieldValue(newSearchContact_CompanyParams.corporate_number));

      // contactsテーブル
      //   setInputContactName(beforeAdjustFieldValue(newSearchContact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchContact_CompanyParams["contacts.name"]));
      setInputDirectLine(beforeAdjustFieldValue(newSearchContact_CompanyParams.direct_line));
      setInputDirectFax(beforeAdjustFieldValue(newSearchContact_CompanyParams.direct_fax));
      setInputExtension(beforeAdjustFieldValue(newSearchContact_CompanyParams.extension));
      setInputCompanyCellPhone(beforeAdjustFieldValue(newSearchContact_CompanyParams.company_cell_phone));
      setInputPersonalCellPhone(beforeAdjustFieldValue(newSearchContact_CompanyParams.personal_cell_phone));
      //   setInputContactEmail(beforeAdjustFieldValue(newSearchContact_CompanyParams.contact_email));
      setInputContactEmail(beforeAdjustFieldValue(newSearchContact_CompanyParams["contacts.email"]));
      setInputPositionName(beforeAdjustFieldValue(newSearchContact_CompanyParams.position_name));
      setInputPositionClass(
        beforeAdjustFieldValue(
          newSearchContact_CompanyParams.position_class ? newSearchContact_CompanyParams.position_class.toString() : ""
        )
      );
      setInputOccupation(
        beforeAdjustFieldValue(
          newSearchContact_CompanyParams.occupation ? newSearchContact_CompanyParams.occupation.toString() : ""
        )
      );
      setInputApprovalAmount(
        beforeAdjustFieldValue(
          newSearchContact_CompanyParams.approval_amount
            ? newSearchContact_CompanyParams.approval_amount.toString()
            : ""
        )
      );
      // setInputCreatedByCompanyId(beforeAdjustFieldValue(newSearchContact_CompanyParams.created_by_company_id));
      setInputCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchContact_CompanyParams["contacts.created_by_company_id"])
      );
      setInputCreatedByUserId(beforeAdjustFieldValue(newSearchContact_CompanyParams.created_by_user_id));
    } else if (!editSearchMode && searchMode) {
      console.log("🔥Contactメインコンテナー useEffect 新規サーチモード inputを初期化");
      if (!!inputCompanyName) setInputCompanyName("");
      // if (!!inputContactName) setInputContactName("");
      if (!!inputDepartment) setInputDepartment("");
      if (!!inputContactName) setInputContactName("");
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
      if (!!inputCreatedByCompanyId) setInputCreatedByCompanyId("");
      if (!!inputCreatedByUserId) setInputCreatedByUserId("");
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
    let _department_name = adjustFieldValue(inputDepartment);
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
    let _position_class = adjustFieldValue(inputPositionClass) ? parseInt(inputPositionClass, 10) : null;
    let _occupation = adjustFieldValue(inputOccupation) ? parseInt(inputOccupation, 10) : null;
    let _approval_amount = adjustFieldValue(inputApprovalAmount) ? parseInt(inputApprovalAmount, 10) : null;
    let _created_by_company_id = adjustFieldValue(inputCreatedByCompanyId);
    let _created_by_user_id = adjustFieldValue(inputCreatedByUserId);

    // // Asterisks to percent signs for PostgreSQL's LIKE operator
    // if (_field1.includes("*")) _field1 = _field1.replace(/\*/g, "%");
    // if (_field1 === "is null") _field1 = null;
    // if (_field1 === "is not null") _field1 = "%%";

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
      // created_by_company_id: _created_by_company_id,
      "contacts.created_by_company_id": userProfileState.company_id,
      created_by_user_id: _created_by_user_id,
    };

    // console.log("✅ 条件 params", params);

    // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_companies", { params });

    setInputCompanyName("");
    setInputDepartment("");
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
    setInputCreatedByCompanyId("");
    setInputCreatedByUserId("");

    setSearchMode(false);
    setEditSearchMode(false);

    // Zustandに検索条件を格納
    setNewSearchContact_CompanyParams(params);

    // 選択中の列データをリセット
    setSelectedRowDataContact(null);

    console.log("✅ 条件 params", params);
    // const { data, error } = await supabase.rpc("search_companies", { params });
    // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });

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

  // ================== 🌟シングルクリック、ダブルクリックイベント🌟 ==================
  // ダブルクリックで各フィールドごとに個別で編集
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 選択行データが自社専用の会社データかどうか
  const isOurContact =
    !!userProfileState?.company_id &&
    !!selectedRowDataContact?.created_by_company_id &&
    selectedRowDataContact.created_by_company_id === userProfileState.company_id;

  // シングルクリック => 何もアクションなし
  const handleSingleClickField = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      // 自社で作成した会社でない場合はそのままリターン
      if (!isOurContact) return;
      if (setTimeoutRef.current !== null) return;

      setTimeoutRef.current = setTimeout(() => {
        setTimeoutRef.current = null;
        // シングルクリック時に実行したい処理
        // 0.2秒後に実行されてしまうためここには書かない
      }, 200);
      console.log("シングルクリック");
    },
    [isOurContact]
  );

  // const originalOptionRef = useRef(""); // 同じ選択肢選択時にエディットモード終了用
  // 編集前のダブルクリック時の値を保持 => 変更されたかどうかを確認
  const originalValueFieldEdit = useRef("");
  type DoubleClickProps = {
    e: React.MouseEvent<HTMLSpanElement>;
    field: string;
    dispatch: React.Dispatch<React.SetStateAction<any>>;
    // isSelectChangeEvent?: boolean;
    selectedRowDataValue?: any;
  };
  // ダブルクリック => ダブルクリックしたフィールドを編集モードに変更
  const handleDoubleClickField = useCallback(
    ({ e, field, dispatch, selectedRowDataValue }: DoubleClickProps) => {
      // 自社で作成した会社でない場合はそのままリターン
      if (!isOurContact) return;

      console.log(
        "ダブルクリック",
        "field",
        field,
        "e.currentTarget.innerText",
        e.currentTarget.innerText,
        "e.currentTarget.innerHTML",
        e.currentTarget.innerHTML
      );
      if (setTimeoutRef.current) {
        clearTimeout(setTimeoutRef.current);

        // console.log(e.detail);
        setTimeoutRef.current = null;
        // ダブルクリック時に実行したい処理
        // クリックした要素のテキストを格納
        // const text = e.currentTarget.innerText;
        let text;
        text = e.currentTarget.innerHTML;
        if (!!selectedRowDataValue) {
          text = selectedRowDataValue;
        }
        if (field === "fiscal_end_month") {
          text = text.replace(/月/g, ""); // 決算月の場合は、1月の月を削除してstateに格納 optionタグのvalueと一致させるため
        }
        if (["call_careful_reason"].includes(field) && text === "-") {
          text = "";
        }
        originalValueFieldEdit.current = text;
        dispatch(text); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
        setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
        // if (isSelectChangeEvent) originalOptionRef.current = e.currentTarget.innerText; // selectタグ同じ選択肢選択時の編集モード終了用
      }
    },
    [isOurContact, setIsEditModeField]
  );
  // ================== ✅シングルクリック、ダブルクリックイベント✅ ==================
  // プロパティ名のユニオン型の作成
  // Client_company_row_data型の全てのプロパティ名をリテラル型のユニオンとして展開
  // type ContactFieldNames = keyof Contact_row_data;
  type ContactFieldNames = keyof Contact;
  type ExcludeKeys = "company_id" | "contact_id"; // 除外するキー
  type ContactFieldNamesForSelectedRowData = Exclude<keyof Contact_row_data, ExcludeKeys>; // Contact_row_dataタイプのプロパティ名のみのデータ型を取得
  // ================== 🌟エンターキーで個別フィールドをアップデート inputタグ ==================
  const handleKeyDownUpdateField = async ({
    e,
    fieldName,
    fieldNameForSelectedRowData,
    originalValue,
    newValue,
    id,
    required,
  }: {
    e: React.KeyboardEvent<HTMLInputElement>;
    // fieldName: string;
    fieldName: ContactFieldNames;
    fieldNameForSelectedRowData: ContactFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
  }) => {
    // 日本語入力変換中はtrueで変換確定のエンターキーではUPDATEクエリが実行されないようにする
    // 英語などの入力変換が存在しない言語ではisCompositionStartは発火しないため常にfalse
    if (e.key === "Enter" && !isComposing) {
      if (required && (newValue === "" || newValue === null))
        return toast.info(`この項目は入力が必須です。`, { autoClose: 3000 });

      // 先にアンダーラインが残らないようにremoveしておく
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

      if (!id || !selectedRowDataContact) {
        toast.error(`エラー：データが見つかりませんでした。`, { autoClose: 3000 });
        return;
      }
      console.log(
        "フィールドアップデート エンターキー",
        " ・フィールド名:",
        fieldName,
        " ・結合フィールド名:",
        fieldNameForSelectedRowData,
        " ・元の値:",
        originalValue,
        " ・新たな値:",
        newValue
      );
      // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
      if (originalValue === newValue) {
        console.log("同じためリターン");
        setIsEditModeField(null); // エディットモードを終了
        return;
      }
      // 決裁金額などのint4(integer), int8(BIGINT)などは数値型に変換して入力値と現在のvalueを比較する
      // ダブルクリック時は〜万円になっているため、convertToMillions関数を通して検証する 決裁金額がnullならそのままnullでUPDATE
      if (["approval_amount"].includes(fieldName) && !!newValue) {
        console.log(
          "フィールドアップデート 決裁金額approval_amountチェック オリジナル",
          originalValue,
          "新たな値",
          newValue
        );
        // 数字を含んでいるかチェック
        if (/\d/.test(originalValue) && /\d/.test(newValue)) {
          console.log(
            "数字を含んでいるかチェック 含んでいるため同じかチェック",
            "convertToMillions(originalValue)",
            convertToMillions(originalValue),
            "newValue",
            newValue
          );
          if (convertToMillions(originalValue) === newValue) {
            console.log("数値型に変換 同じためリターン");
            setIsEditModeField(null); // エディットモードを終了
            return;
          }
        } else {
          // 決裁金額が数値を含まない文字列の場合はエラー
          toast.error(`エラー：有効なデータではありません。`, { autoClose: 3000 });
          return console.log("決裁金額が数値を含まないエラー リターン");
        }
      }

      const updatePayload = {
        fieldName: fieldName,
        fieldNameForSelectedRowData: fieldNameForSelectedRowData,
        newValue: newValue,
        id: id,
      };
      // 入力変換確定状態でエンターキーが押された場合の処理
      console.log("onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 updatePayload", updatePayload);
      await updateContactFieldMutation.mutateAsync(updatePayload);
      originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
      setIsEditModeField(null); // エディットモードを終了
    }
  };
  // ================== ✅エンターキーで個別フィールドをアップデート inputタグ✅ ==================
  // ================== 🌟エンターキーで個別フィールドをアップデート textareaタグ🌟 ==================
  const handleKeyDownUpdateFieldTextarea = async ({
    e,
    fieldName,
    fieldNameForSelectedRowData,
    originalValue,
    newValue,
    id,
    required,
    preventNewLine = false,
  }: {
    e: React.KeyboardEvent<HTMLTextAreaElement>;
    // fieldName: string;
    fieldName: ContactFieldNames;
    fieldNameForSelectedRowData: ContactFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
    preventNewLine?: boolean;
  }) => {
    // 日本語入力変換中はtrueで変換確定のエンターキーではUPDATEクエリが実行されないようにする
    // 英語などの入力変換が存在しない言語ではisCompositionStartは発火しないため常にfalse
    if (e.key === "Enter" && !isComposing && !e.shiftKey) {
      if (preventNewLine) e.preventDefault(); // preventNewLineがtrueなら改行動作を阻止
      if (required && (newValue === "" || newValue === null))
        return toast.info(`この項目は入力が必須です。`, { autoClose: 3000 });

      // 先にアンダーラインが残らないようにremoveしておく
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

      if (!id || !selectedRowDataContact) {
        toast.error(`エラー：データが見つかりませんでした。`, { autoClose: 3000 });
        return;
      }
      // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
      if (originalValue === newValue) {
        console.log("同じためリターン");
        setIsEditModeField(null); // エディットモードを終了
        return;
      }

      console.log(
        "フィールドアップデート テキストエリア",
        " ・フィールド名:",
        fieldName,
        " ・結合フィールド名:",
        fieldNameForSelectedRowData,
        " ・元の値:",
        originalValue,
        " ・新たな値:",
        newValue
      );

      const updatePayload = {
        fieldName: fieldName,
        fieldNameForSelectedRowData: fieldNameForSelectedRowData,
        newValue: newValue,
        id: id,
      };
      // 入力変換確定状態でエンターキーが押された場合の処理
      console.log("onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 updatePayload", updatePayload);
      await updateContactFieldMutation.mutateAsync(updatePayload);
      originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
      setIsEditModeField(null); // エディットモードを終了
    }
  };
  // ================== ✅エンターキーで個別フィールドをアップデート textareaタグ ==================
  // ================== 🌟Sendキーで個別フィールドをアップデート ==================
  const handleClickSendUpdateField = async ({
    e,
    fieldName,
    fieldNameForSelectedRowData,
    originalValue,
    newValue,
    id,
    required,
  }: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
    // fieldName: string;
    fieldName: ContactFieldNames;
    fieldNameForSelectedRowData: ContactFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
  }) => {
    if (required && (newValue === "" || newValue === null))
      return toast.info(`この項目は入力が必須です。`, { autoClose: 3000 });

    e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

    if (!id || !selectedRowDataContact) {
      toast.error(`エラー：データが見つかりませんでした。`, { autoClose: 3000 });
      return;
    }

    console.log(
      "フィールドアップデート Sendキー",
      "フィールド名: ",
      fieldName,
      "結合フィールド名: ",
      fieldNameForSelectedRowData,
      "元の値: ",
      originalValue,
      "新たな値: ",
      newValue
    );

    // 決裁金額などのint4(integer), int8(BIGINT)などは数値型に変換して入力値と現在のvalueを比較する
    // ダブルクリック時は〜万円になっているため、convertToMillions関数を通して検証する
    if (["approval_amount"].includes(fieldName) && !!newValue) {
      console.log(
        "フィールドアップデート 決裁金額approval_amountチェック オリジナル",
        originalValue,
        "新たな値",
        newValue
      );
      // 数字を含んでいるかチェック
      if (/\d/.test(originalValue) && /\d/.test(newValue)) {
        console.log(
          "数字を含んでいるかチェック 含んでいるため同じかチェック",
          "convertToMillions(originalValue)",
          convertToMillions(originalValue),
          "newValue",
          newValue
        );
        if (convertToMillions(originalValue) === newValue) {
          console.log("数値型に変換 同じためリターン");
          setIsEditModeField(null); // エディットモードを終了
          return;
        }
      } else {
        // 決裁金額が数値を含まない文字列の場合はエラー
        toast.error(`エラー：有効なデータではありません。`, { autoClose: 3000 });
        return console.log("決裁金額が数値を含まないエラー リターン");
      }
    }
    // 決裁金額以外で入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
    else if (originalValue === newValue) {
      console.log("同じためリターン", "originalValue", originalValue, "newValue", newValue);
      setIsEditModeField(null); // エディットモードを終了
      return;
    }

    const updatePayload = {
      fieldName: fieldName,
      fieldNameForSelectedRowData: fieldNameForSelectedRowData,
      newValue: newValue,
      id: id,
    };
    // 入力変換確定状態でエンターキーが押された場合の処理
    console.log("sendアイコンクリックでUPDATE実行 updatePayload", updatePayload);
    await updateContactFieldMutation.mutateAsync(updatePayload);
    originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
    setIsEditModeField(null); // エディットモードを終了
  };
  // ================== ✅Sendキーで個別フィールドをアップデート ==================
  // ================== 🌟セレクトボックスで個別フィールドをアップデート ==================

  const handleChangeSelectUpdateField = async ({
    e,
    fieldName,
    fieldNameForSelectedRowData,
    originalValue,
    newValue,
    id,
  }: {
    e: ChangeEvent<HTMLSelectElement>;
    // fieldName: string;
    fieldName: ContactFieldNames;
    fieldNameForSelectedRowData: ContactFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
  }) => {
    e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

    if (!id || !selectedRowDataContact) {
      toast.error(`エラー：データが見つかりませんでした。`, { autoClose: 3000 });
      return;
    }
    // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
    if (originalValue === newValue) {
      console.log("同じためリターン");
      setIsEditModeField(null); // エディットモードを終了
      return;
    }

    console.log(
      "フィールドアップデート セレクトボックス",
      " ・フィールド名:",
      fieldName,
      " ・結合フィールド名:",
      fieldNameForSelectedRowData,
      " ・元の値:",
      originalValue,
      " ・新たな値:",
      newValue
    );

    const updatePayload = {
      fieldName: fieldName,
      fieldNameForSelectedRowData: fieldNameForSelectedRowData,
      newValue: newValue,
      id: id,
    };
    // 入力変換確定状態でエンターキーが押された場合の処理
    console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
    await updateContactFieldMutation.mutateAsync(updatePayload);
    originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
    setIsEditModeField(null); // エディットモードを終了
  };
  // ================== ✅セレクトボックスで個別フィールドをアップデート ==================

  return (
    <form className={`${styles.main_container} w-full `} onSubmit={handleSearchSubmit}>
      {/* ------------------------- スクロールコンテナ ------------------------- */}
      {/* <div className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] `}> */}
      <div
        className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${
          tableContainerSize === "half" && underDisplayFullScreen ? `${styles.height_all}` : ``
        } ${tableContainerSize === "all" && underDisplayFullScreen ? `${styles.height_all}` : ``}`}
      >
        {/* ------------------------- 左コンテナ ------------------------- */}
        <div
          // className={`${styles.left_container} h-full min-w-[calc(50vw-var(--sidebar-open-width))] pb-[35px] pt-[10px]`}
          className={`${styles.left_container} h-full pb-[35px] pt-[10px]`}
        >
          {/* --------- ラッパー --------- */}
          <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
            {/* 会社名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●会社名</span>
                  {/* ディスプレイ */}
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.value_highlight} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.company_name ? selectedRowDataContact?.company_name : ""}
                    </span>
                  )}
                  {/* <CiEdit className="min-h-[22px] min-w-[22px] text-[22px] text-[var(--color-text-sub)]" /> */}
                  {/* <MdEdit className="min-h-[22px] min-w-[22px] text-[22px] text-[var(--color-text-sub)]" /> */}
                  {/* サーチ */}
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

            {/* 部署名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●部署名</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.department_name ? selectedRowDataContact?.department_name : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="text"
                      placeholder="「代表取締役＊」や「＊製造部＊」「＊品質＊」など"
                      className={`${styles.input_box}`}
                      value={inputDepartment}
                      onChange={(e) => setInputDepartment(e.target.value)}
                    />
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 担当者名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●担当者名</span>
                  {!searchMode && isEditModeField !== "name" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "name",
                          dispatch: setInputContactName,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.contact_name ? selectedRowDataContact?.contact_name : ""}
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
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "name" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputContactName}
                        onChange={(e) => setInputContactName(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) =>
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "name",
                            fieldNameForSelectedRowData: "contact_name",
                            originalValue: originalValueFieldEdit.current,
                            newValue: toHalfWidthAndSpace(inputContactName.trim()),
                            id: selectedRowDataContact?.contact_id,
                            required: true,
                          })
                        }
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateContactFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputContactName}
                          setInputState={setInputContactName}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "name",
                              fieldNameForSelectedRowData: "contact_name",
                              originalValue: originalValueFieldEdit.current,
                              newValue: toHalfWidthAndSpace(inputContactName.trim()),
                              id: selectedRowDataContact?.contact_id,
                              required: true,
                            })
                          }
                          required={true}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateContactFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "name" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>直通TEL</span>
                  {!searchMode && isEditModeField !== "direct_line" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "direct_line",
                          dispatch: setInputDirectLine,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.direct_line ? selectedRowDataContact?.direct_line : ""}
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
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "direct_line" && (
                    <>
                      <input
                        type="tel"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputDirectLine}
                        onChange={(e) => setInputDirectLine(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          // 電話番号用バリデーションチェック
                          if (e.key === "Enter" && !isComposing) {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(inputDirectLine.trim());
                            if (!isValid) {
                              setInputTel(formattedNumber);
                              toast.error(
                                `有効な電話番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`,
                                { position: "bottom-center", autoClose: false, transition: Zoom }
                              );
                              return;
                            }

                            handleKeyDownUpdateField({
                              e,
                              fieldName: "direct_line",
                              fieldNameForSelectedRowData: "direct_line",
                              originalValue: originalValueFieldEdit.current,
                              newValue: formattedNumber,
                              id: selectedRowDataContact?.contact_id,
                              required: false,
                            });
                          }
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateContactFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputDirectLine}
                          setInputState={setInputDirectLine}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(inputDirectLine.trim());
                            if (!isValid) {
                              setInputTel(formattedNumber);
                              toast.error(
                                `有効な電話番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`,
                                { position: "bottom-center", autoClose: false, transition: Zoom }
                              );
                              return;
                            }

                            handleClickSendUpdateField({
                              e,
                              fieldName: "direct_line",
                              fieldNameForSelectedRowData: "contact_name",
                              originalValue: originalValueFieldEdit.current,
                              newValue: formattedNumber,
                              id: selectedRowDataContact?.contact_id,
                              required: false,
                            });
                          }}
                          required={false}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateContactFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "direct_line" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 内線TEL・代表TEL */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>内線TEL</span>
                  {!searchMode && isEditModeField !== "extension" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "extension",
                          dispatch: setInputExtension,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.extension ? selectedRowDataContact?.extension : ""}
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
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "extension" && (
                    <>
                      <input
                        type="tel"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputExtension}
                        onChange={(e) => setInputExtension(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          // 電話番号用バリデーションチェック
                          if (e.key === "Enter" && !isComposing) {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(inputExtension.trim());
                            if (!isValid) {
                              setInputTel(formattedNumber);
                              toast.error(
                                `有効な電話番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`,
                                { position: "bottom-center", autoClose: false, transition: Zoom }
                              );
                              return;
                            }

                            handleKeyDownUpdateField({
                              e,
                              fieldName: "extension",
                              fieldNameForSelectedRowData: "extension",
                              originalValue: originalValueFieldEdit.current,
                              newValue: formattedNumber,
                              id: selectedRowDataContact?.contact_id,
                              required: false,
                            });
                          }
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateContactFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputExtension}
                          setInputState={setInputExtension}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(inputExtension.trim());
                            if (!isValid) {
                              setInputTel(formattedNumber);
                              toast.error(
                                `有効な電話番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`,
                                { position: "bottom-center", autoClose: false, transition: Zoom }
                              );
                              return;
                            }

                            handleClickSendUpdateField({
                              e,
                              fieldName: "extension",
                              fieldNameForSelectedRowData: "contact_name",
                              originalValue: originalValueFieldEdit.current,
                              newValue: formattedNumber,
                              id: selectedRowDataContact?.contact_id,
                              required: false,
                            });
                          }}
                          required={false}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateContactFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "extension" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>代表TEL</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.main_phone_number ? selectedRowDataContact?.main_phone_number : ""}
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

            {/* 直通FAX・代表FAX */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>直通FAX</span>
                  {!searchMode && isEditModeField !== "direct_fax" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "direct_fax",
                          dispatch: setInputDirectFax,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.direct_fax ? selectedRowDataContact?.direct_fax : ""}
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
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "direct_fax" && (
                    <>
                      <input
                        type="tel"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputDirectFax}
                        onChange={(e) => setInputDirectFax(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          // 電話番号用バリデーションチェック
                          if (e.key === "Enter" && !isComposing) {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(inputDirectFax.trim());
                            if (!isValid) {
                              setInputTel(formattedNumber);
                              toast.error(`有効なFax番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`, {
                                position: "bottom-center",
                                autoClose: false,
                                transition: Zoom,
                              });
                              return;
                            }

                            handleKeyDownUpdateField({
                              e,
                              fieldName: "direct_fax",
                              fieldNameForSelectedRowData: "direct_fax",
                              originalValue: originalValueFieldEdit.current,
                              newValue: formattedNumber,
                              id: selectedRowDataContact?.contact_id,
                              required: false,
                            });
                          }
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateContactFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputDirectFax}
                          setInputState={setInputDirectFax}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(inputDirectFax.trim());
                            if (!isValid) {
                              setInputTel(formattedNumber);
                              toast.error(`有効なFax番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`, {
                                position: "bottom-center",
                                autoClose: false,
                                transition: Zoom,
                              });
                              return;
                            }

                            handleClickSendUpdateField({
                              e,
                              fieldName: "direct_fax",
                              fieldNameForSelectedRowData: "direct_fax",
                              originalValue: originalValueFieldEdit.current,
                              newValue: formattedNumber,
                              id: selectedRowDataContact?.contact_id,
                              required: false,
                            });
                          }}
                          required={false}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateContactFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "direct_fax" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className={`flex h-full w-1/2 flex-col pr-[20px]`}>
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>代表FAX</span>
                  {/* <span className={`${styles.title}`}>会員専用</span> */}
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.main_fax ? selectedRowDataContact?.main_fax : ""}
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

            {/* 社用携帯・私用携帯 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>社用携帯</span>
                  {!searchMode && isEditModeField !== "company_cell_phone" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "company_cell_phone",
                          dispatch: setInputCompanyCellPhone,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.company_cell_phone ? selectedRowDataContact?.company_cell_phone : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="tel"
                      className={`${styles.input_box}`}
                      value={inputCompanyCellPhone}
                      onChange={(e) => setInputCompanyCellPhone(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "company_cell_phone" && (
                    <>
                      <input
                        type="tel"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputCompanyCellPhone}
                        onChange={(e) => setInputCompanyCellPhone(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          // 電話番号用バリデーションチェック
                          if (e.key === "Enter" && !isComposing) {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(
                              inputCompanyCellPhone.trim()
                            );
                            if (!isValid) {
                              setInputTel(formattedNumber);
                              toast.error(`有効な番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`, {
                                position: "bottom-center",
                                autoClose: false,
                                transition: Zoom,
                              });
                              return;
                            }

                            handleKeyDownUpdateField({
                              e,
                              fieldName: "company_cell_phone",
                              fieldNameForSelectedRowData: "company_cell_phone",
                              originalValue: originalValueFieldEdit.current,
                              newValue: formattedNumber,
                              id: selectedRowDataContact?.contact_id,
                              required: false,
                            });
                          }
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateContactFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputCompanyCellPhone}
                          setInputState={setInputCompanyCellPhone}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(
                              inputCompanyCellPhone.trim()
                            );
                            if (!isValid) {
                              setInputTel(formattedNumber);
                              toast.error(`有効な番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`, {
                                position: "bottom-center",
                                autoClose: false,
                                transition: Zoom,
                              });
                              return;
                            }

                            handleClickSendUpdateField({
                              e,
                              fieldName: "company_cell_phone",
                              fieldNameForSelectedRowData: "company_cell_phone",
                              originalValue: originalValueFieldEdit.current,
                              newValue: formattedNumber,
                              id: selectedRowDataContact?.contact_id,
                              required: false,
                            });
                          }}
                          required={false}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateContactFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "company_cell_phone" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>私用携帯</span>
                  {!searchMode && isEditModeField !== "personal_cell_phone" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "personal_cell_phone",
                          dispatch: setInputPersonalCellPhone,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.personal_cell_phone ? selectedRowDataContact?.personal_cell_phone : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="tel"
                      className={`${styles.input_box}`}
                      value={inputPersonalCellPhone}
                      onChange={(e) => setInputPersonalCellPhone(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "personal_cell_phone" && (
                    <>
                      <input
                        type="tel"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputPersonalCellPhone}
                        onChange={(e) => setInputPersonalCellPhone(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          // 電話番号用バリデーションチェック
                          if (e.key === "Enter" && !isComposing) {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(
                              inputPersonalCellPhone.trim()
                            );
                            if (!isValid) {
                              setInputTel(formattedNumber);
                              toast.error(`有効な番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`, {
                                position: "bottom-center",
                                autoClose: false,
                                transition: Zoom,
                              });
                              return;
                            }

                            handleKeyDownUpdateField({
                              e,
                              fieldName: "personal_cell_phone",
                              fieldNameForSelectedRowData: "personal_cell_phone",
                              originalValue: originalValueFieldEdit.current,
                              newValue: formattedNumber,
                              id: selectedRowDataContact?.contact_id,
                              required: false,
                            });
                          }
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateContactFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputPersonalCellPhone}
                          setInputState={setInputPersonalCellPhone}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(
                              inputPersonalCellPhone.trim()
                            );
                            if (!isValid) {
                              setInputTel(formattedNumber);
                              toast.error(`有効な番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`, {
                                position: "bottom-center",
                                autoClose: false,
                                transition: Zoom,
                              });
                              return;
                            }

                            handleClickSendUpdateField({
                              e,
                              fieldName: "personal_cell_phone",
                              fieldNameForSelectedRowData: "personal_cell_phone",
                              originalValue: originalValueFieldEdit.current,
                              newValue: formattedNumber,
                              id: selectedRowDataContact?.contact_id,
                              required: false,
                            });
                          }}
                          required={false}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateContactFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "personal_cell_phone" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 担当者Email */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>E-mail</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={async () => {
                        if (!selectedRowDataContact?.contact_email) return;
                        try {
                          await navigator.clipboard.writeText(selectedRowDataContact.contact_email);
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
                      {selectedRowDataContact?.contact_email ? selectedRowDataContact.contact_email : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="email"
                      className={`${styles.input_box}`}
                      value={inputContactEmail}
                      onChange={(e) => setInputContactEmail(e.target.value)}
                    />
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 郵便番号・ */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>郵便番号</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.zipcode ? selectedRowDataContact?.zipcode : ""}
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
                      {selectedRowDataContact?.established_in ? selectedRowDataContact?.established_in : ""}
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

            {/* 住所 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>○住所</span>
                  {!searchMode && (
                    <span
                      className={`${styles.textarea_value} ${styles.address} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.address ? selectedRowDataContact?.address : ""}
                    </span>
                  )}
                  {searchMode && (
                    <textarea
                      name="address"
                      id="address"
                      cols={30}
                      // rows={10}
                      placeholder="「神奈川県＊」や「＊大田区＊」など"
                      className={`${styles.textarea_box} ${styles.textarea_box_bg} ${styles.textarea_box_search_mode} ${styles.address}`}
                      value={inputAddress}
                      onChange={(e) => setInputAddress(e.target.value)}
                    ></textarea>
                  )}
                </div>
                <div className={`${styles.underline} `}></div>
              </div>
            </div>

            {/* 役職名・職位 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>役職名</span>
                  {!searchMode && isEditModeField !== "position_name" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "position_name",
                          dispatch: setInputPositionName,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.position_name ? selectedRowDataContact?.position_name : ""}
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
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "position_name" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputPositionName}
                        onChange={(e) => setInputPositionName(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) =>
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "position_name",
                            fieldNameForSelectedRowData: "position_name",
                            originalValue: originalValueFieldEdit.current,
                            newValue: toHalfWidthAndSpace(inputPositionName.trim()),
                            id: selectedRowDataContact?.contact_id,
                            required: true,
                          })
                        }
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateContactFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputPositionName}
                          setInputState={setInputPositionName}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "position_name",
                              fieldNameForSelectedRowData: "position_name",
                              originalValue: originalValueFieldEdit.current,
                              newValue: toHalfWidthAndSpace(inputPositionName.trim()),
                              id: selectedRowDataContact?.contact_id,
                              required: true,
                            })
                          }
                          required={true}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateContactFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "position_name" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>職位</span>
                  {!searchMode && isEditModeField !== "position_class" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "position_class",
                          dispatch: setInputPositionClass,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataContact?.position_class ? selectedRowDataContact?.position_class : ""} */}
                      {selectedRowDataContact &&
                      selectedRowDataContact?.position_class &&
                      mappingPositionClass[selectedRowDataContact.position_class]?.[language]
                        ? mappingPositionClass[selectedRowDataContact.position_class]?.[language]
                        : ""}
                    </span>
                  )}
                  {searchMode && (
                    <select
                      className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                      value={inputPositionClass}
                      onChange={(e) => setInputPositionClass(e.target.value)}
                    >
                      <option value=""></option>
                      {optionsPositionsClass.map((classNum) => (
                        <option key={classNum} value={`${classNum}`}>
                          {getPositionClassName(classNum, language)}
                        </option>
                      ))}
                      {/* <option value="代表者">代表者</option>
                      <option value="取締役/役員">取締役/役員</option>
                      <option value="部長">部長</option>
                      <option value="課長">課長</option>
                      <option value="課長未満">課長未満</option>
                      <option value="所長・工場長">所長・工場長</option>
                      <option value="その他">その他</option> */}
                    </select>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "position_class" && (
                    <>
                      <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                        value={inputPositionClass}
                        onChange={(e) => {
                          handleChangeSelectUpdateField({
                            e,
                            fieldName: "position_class",
                            fieldNameForSelectedRowData: "position_class",
                            newValue: e.target.value,
                            originalValue: originalValueFieldEdit.current,
                            id: selectedRowDataContact?.contact_id,
                          });
                        }}
                      >
                        {optionsPositionsClass.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateContactFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "position_class" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 担当職種・決裁金額 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>担当職種</span>
                  {!searchMode && isEditModeField !== "occupation" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "occupation",
                          dispatch: setInputOccupation,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataContact?.occupation ? selectedRowDataContact?.occupation : ""} */}
                      {selectedRowDataContact &&
                      selectedRowDataContact?.occupation &&
                      mappingOccupation[selectedRowDataContact.occupation]?.[language]
                        ? mappingOccupation[selectedRowDataContact.occupation]?.[language]
                        : ""}
                    </span>
                  )}
                  {searchMode && (
                    <select
                      name="occupation"
                      id="occupation"
                      className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                      value={inputOccupation}
                      onChange={(e) => setInputOccupation(e.target.value)}
                    >
                      <option value=""></option>
                      {optionsOccupation.map((num) => (
                        <option key={num} value={`${num}`}>
                          {getOccupationName(num, language)}
                        </option>
                      ))}
                      {/* {optionsOccupation.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))} */}
                      {/* <option value="社長・専務">社長・専務</option>
                      <option value="取締役・役員">取締役・役員</option>
                      <option value="プロジェクト管理">プロジェクト管理</option>
                      <option value="営業">営業</option>
                      <option value="マーケティング">マーケティング</option>
                      <option value="クリエイティブ">クリエイティブ</option>
                      <option value="ソフトウェア開発">ソフトウェア開発</option>
                      <option value="開発・設計">開発・設計</option>
                      <option value="製造">製造</option>
                      <option value="品質管理・品質保証">品質管理・品質保証</option>
                      <option value="生産管理">生産管理</option>
                      <option value="生産技術">生産技術</option>
                      <option value="人事">人事</option>
                      <option value="経理">経理</option>
                      <option value="総務">総務</option>
                      <option value="法務">法務</option>
                      <option value="財務">財務</option>
                      <option value="購買">購買</option>
                      <option value="情報システム/IT管理者">情報システム/IT管理者</option>
                      <option value="CS/カスタマーサービス">CS/カスタマーサービス</option>
                      <option value="その他">その他</option> */}
                    </select>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "occupation" && (
                    <>
                      <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                        value={inputOccupation}
                        onChange={(e) => {
                          handleChangeSelectUpdateField({
                            e,
                            fieldName: "occupation",
                            fieldNameForSelectedRowData: "occupation",
                            newValue: e.target.value,
                            originalValue: originalValueFieldEdit.current,
                            id: selectedRowDataContact?.contact_id,
                          });
                        }}
                      >
                        {optionsOccupation.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateContactFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "occupation" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  {/* <span className={`${styles.title} !mr-[12px]`}>決裁金額(万円)</span> */}
                  <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                    <span>決裁金額</span>
                    <span>(万円)</span>
                  </div>

                  {!searchMode && isEditModeField !== "approval_amount" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "approval_amount",
                          dispatch: setInputApprovalAmount,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.approval_amount
                        ? convertToJapaneseCurrencyFormat(selectedRowDataContact?.approval_amount)
                        : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
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
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "approval_amount" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputApprovalAmount}
                        onChange={(e) => setInputApprovalAmount(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) =>
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "approval_amount",
                            fieldNameForSelectedRowData: "approval_amount",
                            originalValue: originalValueFieldEdit.current,
                            newValue:
                              !!inputApprovalAmount && inputApprovalAmount !== ""
                                ? convertToMillions(inputApprovalAmount.trim())
                                : "",
                            // newValue:
                            //   !!inputApprovalAmount && inputApprovalAmount !== ""
                            //     ? (convertToMillions(inputApprovalAmount.trim()) as number).toString()
                            //     : "",
                            id: selectedRowDataContact?.contact_id,
                            required: true,
                          })
                        }
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateContactFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputApprovalAmount}
                          setInputState={setInputApprovalAmount}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "approval_amount",
                              fieldNameForSelectedRowData: "approval_amount",
                              originalValue: originalValueFieldEdit.current,
                              newValue:
                                !!inputApprovalAmount && inputApprovalAmount !== ""
                                  ? convertToMillions(inputApprovalAmount.trim())
                                  : "",
                              // newValue:
                              //   !!inputApprovalAmount && inputApprovalAmount !== ""
                              //     ? (convertToMillions(inputApprovalAmount.trim()) as number).toString()
                              //     : "",
                              id: selectedRowDataContact?.contact_id,
                              required: true,
                            })
                          }
                          required={true}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateContactFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "approval_amount" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 規模（ランク）・決算月 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.number_of_employees_class
                        ? selectedRowDataContact?.number_of_employees_class
                        : ""}
                    </span>
                  )}
                  {searchMode && (
                    <select
                      name="position_class"
                      id="position_class"
                      className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
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
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.fiscal_end_month ? selectedRowDataContact?.fiscal_end_month : ""}
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

            {/* 予算申請月1・予算申請月2 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>予算申請月1</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.budget_request_month1
                        ? selectedRowDataContact?.budget_request_month1
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
                  <span className={`${styles.title}`}>予算申請月2</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.budget_request_month2
                        ? selectedRowDataContact?.budget_request_month2
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

            {/* 資本金・設立 テスト */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>資本金(万円)</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                      {selectedRowDataContact?.capital
                        ? convertToJapaneseCurrencyFormat(selectedRowDataContact.capital)
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
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.established_in ? selectedRowDataContact?.established_in : ""}
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

            {/* 事業概要 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full`}>
                  <span className={`${styles.title}`}>事業概要</span>
                  {!searchMode && (
                    <>
                      <span
                        data-text={`${
                          selectedRowDataContact?.business_content ? selectedRowDataContact?.business_content : ""
                        }`}
                        className={`${styles.textarea_value} h-[45px] ${styles.uneditable_field}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                        onMouseEnter={(e) => {
                          handleOpenTooltip(e);
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataContact?.business_content
                            ? selectedRowDataContact?.business_content.replace(/\n/g, "<br>")
                            : "",
                        }}
                      >
                        {/* {selectedRowDataContact?.business_content ? selectedRowDataContact?.business_content : ""} */}
                      </span>
                    </>
                  )}
                  {searchMode && (
                    <textarea
                      name="address"
                      id="address"
                      cols={30}
                      // rows={10}
                      className={`${styles.textarea_box} ${styles.textarea_box_bg} ${styles.textarea_box_search_mode}`}
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                    ></textarea>
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 主要取引先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要取引先</span>
                  {!searchMode && (
                    <span
                      data-text={`${selectedRowDataContact?.clients ? selectedRowDataContact?.clients : ""}`}
                      className={`${styles.value} ${styles.uneditable_field}`}
                      // onMouseEnter={(e) => handleOpenTooltip(e)}
                      // onMouseLeave={handleCloseTooltip}
                      onMouseEnter={(e) => {
                        handleOpenTooltip(e);
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        handleCloseTooltip();
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.clients ? selectedRowDataContact?.clients : ""}
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

            {/* 主要仕入先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要仕入先</span>
                  {!searchMode && (
                    <span
                      data-text={`${selectedRowDataContact?.supplier ? selectedRowDataContact?.supplier : ""}`}
                      className={`${styles.value} ${styles.uneditable_field}`}
                      // onMouseEnter={(e) => handleOpenTooltip(e)}
                      // onMouseLeave={handleCloseTooltip}
                      onMouseEnter={(e) => {
                        handleOpenTooltip(e);
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        handleCloseTooltip();
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.supplier ? selectedRowDataContact?.supplier : ""}
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

            {/* 設備 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full`}>
                  <span className={`${styles.title}`}>設備</span>
                  {!searchMode && (
                    <>
                      <span
                        data-text={`${selectedRowDataContact?.facility ? selectedRowDataContact?.facility : ""}`}
                        className={`${styles.textarea_value} h-[45px] ${styles.uneditable_field}`}
                        // onMouseEnter={(e) => handleOpenTooltip(e)}
                        // onMouseLeave={handleCloseTooltip}
                        onMouseEnter={(e) => {
                          handleOpenTooltip(e);
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataContact?.facility
                            ? selectedRowDataContact?.facility.replace(/\n/g, "<br>")
                            : "",
                        }}
                      >
                        {/* {selectedRowDataContact?.facility ? selectedRowDataContact?.facility : ""} */}
                      </span>
                    </>
                  )}
                  {searchMode && (
                    <textarea
                      name="address"
                      id="address"
                      cols={30}
                      // rows={10}
                      className={`${styles.textarea_box} ${styles.textarea_box_bg} ${styles.textarea_box_search_mode}`}
                      value={inputFacility}
                      onChange={(e) => setInputFacility(e.target.value)}
                    ></textarea>
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 事業拠点・海外拠点 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>事業拠点</span>
                  {!searchMode && (
                    <span
                      data-text={`${
                        selectedRowDataContact?.business_sites ? selectedRowDataContact?.business_sites : ""
                      }`}
                      className={`${styles.value} ${styles.uneditable_field}`}
                      // onMouseEnter={(e) => handleOpenTooltip(e)}
                      // onMouseLeave={handleCloseTooltip}
                      onMouseEnter={(e) => {
                        handleOpenTooltip(e);
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        handleCloseTooltip();
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.business_sites ? selectedRowDataContact?.business_sites : ""}
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
                        selectedRowDataContact?.overseas_bases ? selectedRowDataContact?.overseas_bases : ""
                      }`}
                      className={`${styles.value} ${styles.uneditable_field}`}
                      // onMouseEnter={(e) => handleOpenTooltip(e)}
                      // onMouseLeave={handleCloseTooltip}
                      onMouseEnter={(e) => {
                        handleOpenTooltip(e);
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        handleCloseTooltip();
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.overseas_bases ? selectedRowDataContact?.overseas_bases : ""}
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

            {/* グループ会社 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>グループ会社</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      data-text={`${
                        selectedRowDataContact?.group_company ? selectedRowDataContact?.group_company : ""
                      }`}
                      // onMouseEnter={(e) => handleOpenTooltip(e)}
                      // onMouseLeave={handleCloseTooltip}
                      onMouseEnter={(e) => {
                        handleOpenTooltip(e);
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        handleCloseTooltip();
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.group_company ? selectedRowDataContact?.group_company : ""}
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
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>HP</span>
                  {!searchMode && !!selectedRowDataContact?.website_url ? (
                    <a
                      href={selectedRowDataContact.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${styles.value} ${styles.anchor}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact.website_url}
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

            {/* 会社Email */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>会社Email</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.email_value}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                      onClick={async () => {
                        if (!selectedRowDataContact?.company_email) return;
                        try {
                          await navigator.clipboard.writeText(selectedRowDataContact.company_email);
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
                      {selectedRowDataContact?.company_email ? selectedRowDataContact?.company_email : ""}
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

            {/* 業種 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>○業種</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.industry_type ? selectedRowDataContact?.industry_type : ""}
                    </span>
                  )}
                  {searchMode && !inputProductL && (
                    <select
                      name="position_class"
                      id="position_class"
                      className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                      value={inputIndustryType}
                      onChange={(e) => setInputIndustryType(e.target.value)}
                    >
                      <option value=""></option>
                      {optionsIndustryType.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
            {/* 製品分類（大分類） */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  {/* <span className={`${styles.title} !mr-[15px]`}>製品分類（大分類）</span> */}
                  <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                    <span>製品分類</span>
                    <span>(大分類)</span>
                  </div>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      data-text={`${
                        selectedRowDataContact?.product_category_large
                          ? selectedRowDataContact?.product_category_large
                          : ""
                      }`}
                      // onMouseEnter={(e) => handleOpenTooltip(e)}
                      // onMouseLeave={handleCloseTooltip}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.product_category_large
                        ? selectedRowDataContact?.product_category_large
                        : ""}
                    </span>
                  )}
                  {searchMode && !inputIndustryType && (
                    <select
                      name="position_class"
                      id="position_class"
                      // className={`ml-auto h-full w-[80%] cursor-pointer ${styles.select_box}`}
                      className={`ml-auto h-full w-[100%] cursor-pointer ${styles.select_box}`}
                      value={inputProductL}
                      onChange={(e) => setInputProductL(e.target.value)}
                    >
                      <option value=""></option>
                      {optionsProductL.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
            {/* 製品分類（中分類） */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  {/* <span className={`${styles.title} !mr-[15px]`}>製品分類（中分類）</span> */}
                  <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                    <span>製品分類</span>
                    <span>(中分類)</span>
                  </div>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      data-text={`${
                        selectedRowDataContact?.product_category_medium
                          ? selectedRowDataContact?.product_category_medium
                          : ""
                      }`}
                      // onMouseEnter={(e) => handleOpenTooltip(e)}
                      // onMouseLeave={handleCloseTooltip}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.product_category_medium
                        ? selectedRowDataContact?.product_category_medium
                        : ""}
                    </span>
                  )}
                  {searchMode && !!inputProductL && (
                    <select
                      value={inputProductM}
                      onChange={(e) => setInputProductM(e.target.value)}
                      // className={`${inputProductL ? "" : "hidden"} ml-auto h-full w-[80%] cursor-pointer ${
                      className={`${inputProductL ? "" : "hidden"} ml-auto h-full w-[100%] cursor-pointer ${
                        styles.select_box
                      }`}
                    >
                      {inputProductL === "電子部品・モジュール" &&
                        productCategoriesM.moduleCategoryM.map((option) => option)}
                      {inputProductL === "機械部品" && productCategoriesM.machinePartsCategoryM.map((option) => option)}
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
                      {inputProductL === "設計・生産支援" && productCategoriesM.designCategoryM.map((option) => option)}
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
            {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>製品分類（小分類）</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value}`}
                      data-text={`${
                        selectedRowDataContact?.product_category_small
                          ? selectedRowDataContact?.product_category_small
                          : ""
                      }`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      {selectedRowDataContact?.product_category_small
                        ? selectedRowDataContact?.product_category_small
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

            {/* 法人番号・ID */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>○法人番号</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataContact?.corporate_number ? selectedRowDataContact?.corporate_number : ""}
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
                      {selectedRowDataContact?.company_id ? selectedRowDataContact?.company_id : ""}
                    </span>
                  )}
                </div>
                <div className={`${styles.underline}`}></div> */}
              </div>
            </div>

            {/* --------- ラッパーここまで --------- */}
          </div>
        </div>
        {/* ---------------- 右コンテナ サーチモードではない通常モード 活動テーブル ---------------- */}
        {!searchMode && (
          <div className={`${styles.right_container} h-full grow bg-[aqua]/[0] pb-[35px] pt-[20px]`}>
            <div className={`${styles.right_contents_wrapper} flex h-full w-full flex-col bg-[#000]/[0]`}>
              {/* 活動履歴 */}
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense
                  fallback={<FallbackUnderRightActivityLog />}
                  // fallback={<Fallback className="min-h-[calc(100vh-100vh/3-var(--header-height)/3--20px-22px-40px)]" />}
                >
                  <ContactUnderRightActivityLog />
                </Suspense>
              </ErrorBoundary>
              {/* <FallbackUnderRightActivityLog /> */}
              {/* 下エリア 禁止フラグなど */}
              <div
                className={`${styles.right_under_container} h-screen w-full  bg-[#f0f0f0]/[0] ${
                  isOpenSidebar ? `transition-base02` : `transition-base01`
                }`}
              >
                {/* 代表者・会長 */}
                {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>代表者</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataContact?.representative_name
                            ? selectedRowDataContact?.representative_name
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>会長</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataContact?.chairperson ? selectedRowDataContact?.chairperson : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div> */}

                {/* 副社長・専務取締役 */}
                {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>副社長</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataContact?.senior_vice_president
                            ? selectedRowDataContact?.senior_vice_president
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>専務取締役</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataContact?.senior_managing_director
                              ? selectedRowDataContact?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataContact?.senior_managing_director
                            ? selectedRowDataContact?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div> */}

                {/* 常務取締役・取締役 */}
                {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>常務取締役</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataContact?.managing_director ? selectedRowDataContact?.managing_director : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataContact?.managing_director ? selectedRowDataContact?.managing_director : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>取締役</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataContact?.director ? selectedRowDataContact?.director : ""}`}
                          className={`${styles.value} truncate`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataContact?.director ? selectedRowDataContact?.director : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div> */}

                {/* 役員・監査役 */}
                {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>役員</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataContact?.board_member ? selectedRowDataContact?.board_member : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataContact?.board_member ? selectedRowDataContact?.board_member : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>監査役</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataContact?.auditor ? selectedRowDataContact?.auditor : ""}`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataContact?.auditor ? selectedRowDataContact?.auditor : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div> */}

                {/* 部長・担当者 */}
                {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>部長</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataContact?.manager ? selectedRowDataContact?.manager : ""}`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataContact?.manager ? selectedRowDataContact?.manager : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>担当者</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataContact?.member ? selectedRowDataContact?.member : ""}`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataContact?.member ? selectedRowDataContact?.member : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div> */}
                {/* TEL要注意フラグ・TEL要注意理由 */}
                <div className={`${styles.right_row_area}  mt-[10px] flex min-h-[35px] w-full grow items-start`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>TEL要注意フラグ</span>

                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          className={`${styles.grid_select_cell_header_input} `}
                          // checked={!!checkedColumnHeader} // 初期値
                          // checked={!!selectedRowDataContact?.call_careful_flag}
                          // onChange={() => {
                          //   // setLoadingGlobalState(false);
                          //   setIsOpenUpdateContactModal(true);
                          // }}
                          checked={checkboxCallCarefulFlag}
                          onChange={async (e) => {
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataContact) return;
                            if (!selectedRowDataContact?.contact_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);
                            if (!checkboxCallCarefulFlag === selectedRowDataContact?.call_careful_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "call_careful_flag",
                              fieldNameForSelectedRowData: "call_careful_flag" as "call_careful_flag",
                              newValue: !checkboxCallCarefulFlag,
                              id: selectedRowDataContact.contact_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updateContactFieldMutation.mutate(updatePayload);
                            setCheckboxCallCarefulFlag(!checkboxCallCarefulFlag);
                          }}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-start`}>
                      <span className={`${styles.right_under_title}`}>注意理由</span>
                      {!searchMode && isEditModeField !== "call_careful_reason" && (
                        <span
                          data-text={`${
                            selectedRowDataContact?.call_careful_reason
                              ? selectedRowDataContact?.call_careful_reason
                              : ""
                          }`}
                          className={`${styles.value} ${styles.editable_field}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e, "right")}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "call_careful_reason",
                              dispatch: setInputCarefulReason,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // if (!selectedRowDataContact?.call_careful_reason) return;
                            // handleOpenTooltip(e, "right");
                            handleOpenTooltip(e);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            // if (!selectedRowDataContact?.call_careful_reason) return;
                            handleCloseTooltip();
                          }}
                          // onDoubleClick={() => setIsOpenUpdateContactModal(true)}
                        >
                          {selectedRowDataContact?.call_careful_reason
                            ? selectedRowDataContact?.call_careful_reason
                            : selectedRowDataContact?.call_careful_flag
                            ? "-"
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "call_careful_reason" && (
                        <>
                          {/* <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputCarefulReason}
                            onChange={(e) => setInputCarefulReason(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) =>
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "call_careful_reason",
                                fieldNameForSelectedRowData: "call_careful_reason",
                                originalValue: originalValueFieldEdit.current,
                                newValue: toHalfWidthAndSpace(inputCarefulReason.trim()),
                                id: selectedRowDataContact?.contact_id,
                                required: false,
                              })
                            }
                          /> */}
                          <textarea
                            cols={30}
                            // rows={10}
                            placeholder=""
                            style={{ whiteSpace: "pre-wrap" }}
                            className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                            value={inputCarefulReason}
                            onChange={(e) => setInputCarefulReason(e.target.value)}
                          ></textarea>
                          {/* 送信ボタンとクローズボタン */}
                          <InputSendAndCloseBtn
                            inputState={inputCarefulReason}
                            setInputState={setInputCarefulReason}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "call_careful_reason",
                                fieldNameForSelectedRowData: "call_careful_reason",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputCarefulReason ? inputCarefulReason.trim() : null,
                                id: selectedRowDataContact?.contact_id,
                                required: false,
                              })
                            }
                            required={false}
                            // isDisplayClose={true}
                            // btnPositionY="bottom-[8px]"
                            isOutside={true}
                            outsidePosition="under_right"
                            isLoadingSendEvent={updateContactFieldMutation.isLoading}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {/* {!updateContactFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputCarefulReason}
                              setInputState={setInputCarefulReason}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "call_careful_reason",
                                  fieldNameForSelectedRowData: "call_careful_reason",
                                  originalValue: originalValueFieldEdit.current,
                                  newValue: toHalfWidthAndSpace(inputCarefulReason.trim()),
                                  id: selectedRowDataContact?.contact_id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={true}
                            />
                          )} */}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {/* {updateContactFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )} */}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "call_careful_reason" && (
                        <div
                          className={`${styles.edit_mode_overlay}`}
                          onClick={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                            setIsEditModeField(null); // エディットモードを終了
                          }}
                        />
                      )}
                      {/* ============= フィールドエディットモード関連ここまで ============= */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* メール禁止フラグ・資料禁止フラグ */}
                <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>メール禁止フラグ</span>

                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          className={`${styles.grid_select_cell_header_input}`}
                          // checked={!!checkedColumnHeader} // 初期値
                          // checked={!!selectedRowDataContact?.email_ban_flag}
                          checked={checkboxEmailBanFlag}
                          onChange={async (e) => {
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataContact) return;
                            if (!selectedRowDataContact?.contact_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);
                            if (!checkboxEmailBanFlag === selectedRowDataContact?.email_ban_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "email_ban_flag",
                              fieldNameForSelectedRowData: "email_ban_flag" as "email_ban_flag",
                              newValue: !checkboxEmailBanFlag,
                              id: selectedRowDataContact.contact_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updateContactFieldMutation.mutate(updatePayload);
                            setCheckboxEmailBanFlag(!checkboxEmailBanFlag);
                          }}
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
                      <span className={`${styles.check_title}`}>資料禁止フラグ</span>

                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          className={`${styles.grid_select_cell_header_input}`}
                          // checked={!!checkedColumnHeader} // 初期値
                          // checked={!!selectedRowDataContact?.sending_materials_ban_flag}
                          checked={checkboxSendingMaterialFlag}
                          onChange={async (e) => {
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataContact) return;
                            if (!selectedRowDataContact?.contact_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);
                            if (!checkboxSendingMaterialFlag === selectedRowDataContact?.sending_materials_ban_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "sending_materials_ban_flag",
                              fieldNameForSelectedRowData: "sending_materials_ban_flag" as "sending_materials_ban_flag",
                              newValue: !checkboxSendingMaterialFlag,
                              id: selectedRowDataContact.contact_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updateContactFieldMutation.mutate(updatePayload);
                            setCheckboxSendingMaterialFlag(!checkboxSendingMaterialFlag);
                          }}
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
                      <span className={`${styles.check_title}`}>FAX・DM禁止フラグ</span>

                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          className={`${styles.grid_select_cell_header_input}`}
                          // checked={!!checkedColumnHeader} // 初期値
                          // checked={!!selectedRowDataContact?.fax_dm_ban_flag}
                          checked={checkboxFaxDmFlag}
                          onChange={async (e) => {
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataContact) return;
                            if (!selectedRowDataContact?.contact_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);
                            if (!checkboxFaxDmFlag === selectedRowDataContact?.fax_dm_ban_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "fax_dm_ban_flag",
                              fieldNameForSelectedRowData: "fax_dm_ban_flag" as "fax_dm_ban_flag",
                              newValue: !checkboxFaxDmFlag,
                              id: selectedRowDataContact.contact_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updateContactFieldMutation.mutate(updatePayload);
                            setCheckboxFaxDmFlag(!checkboxFaxDmFlag);
                          }}
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

                {/* クレーム */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full  `}>
                      <span className={`${styles.title}`}>クレーム</span>
                      {!searchMode && isEditModeField !== "claim" && (
                        <div
                          data-text={`${selectedRowDataContact?.claim ? selectedRowDataContact?.claim : ""}`}
                          // className={`${styles.value} h-[65px] ${
                          //   isOurContact ? styles.editable_field : styles.uneditable_field
                          // }`}
                          // className={`${styles.textarea_value} ${
                          //   isOurContact ? styles.editable_field : styles.uneditable_field
                          // }`}
                          // className={`${
                          //   !!selectedRowDataContact?.claim ? styles.textarea_box : styles.textarea_value
                          // } ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                          className={`${styles.textarea_box} ${
                            isOurContact ? styles.editable_field : styles.uneditable_field
                          }`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "claim",
                              dispatch: setInputClaim,
                              selectedRowDataValue: selectedRowDataContact?.claim
                                ? selectedRowDataContact?.claim
                                : null,
                            });
                          }}
                          onMouseEnter={(e) => {
                            if (!selectedRowDataContact?.claim) return;
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // handleOpenTooltip(e);
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedRowDataContact?.claim) return;
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            // handleCloseTooltip();
                          }}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataContact?.claim
                              ? selectedRowDataContact?.claim.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataContact?.claim ? selectedRowDataContact?.claim : ""} */}
                        </div>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "claim" && (
                        <>
                          <textarea
                            cols={30}
                            // rows={10}
                            placeholder=""
                            style={{ whiteSpace: "pre-wrap" }}
                            className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                            value={inputClaim}
                            onChange={(e) => setInputClaim(e.target.value)}
                          ></textarea>
                          {/* 送信ボタンとクローズボタン */}
                          {!updateContactFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputClaim}
                              setInputState={setInputClaim}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "claim",
                                  fieldNameForSelectedRowData: "claim",
                                  originalValue: originalValueFieldEdit.current,
                                  newValue: inputClaim ? toHalfWidthAndSpace(inputClaim.trim()) : null,
                                  id: selectedRowDataContact?.contact_id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={true}
                              btnPositionY="bottom-[8px]"
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateContactFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area} ${styles.under_right}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "claim" && (
                        <div
                          className={`${styles.edit_mode_overlay}`}
                          onClick={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                            setIsEditModeField(null); // エディットモードを終了
                          }}
                        />
                      )}
                      {/* ============= フィールドエディットモード関連ここまで ============= */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 禁止理由 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>禁止理由</span>
                      {!searchMode && isEditModeField !== "ban_reason" && (
                        <div
                          data-text={`${selectedRowDataContact?.ban_reason ? selectedRowDataContact?.ban_reason : ""}`}
                          className={`${
                            !!selectedRowDataContact?.ban_reason ||
                            !!selectedRowDataContact?.email_ban_flag ||
                            !!selectedRowDataContact?.fax_dm_ban_flag ||
                            !!selectedRowDataContact?.sending_materials_ban_flag
                              ? styles.textarea_box
                              : styles.textarea_value
                          } ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                          // onMouseEnter={(e) => handleOpenTooltip(e)}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "ban_reason",
                              dispatch: setInputBanReason,
                              selectedRowDataValue: selectedRowDataContact?.ban_reason
                                ? selectedRowDataContact?.ban_reason
                                : null,
                            });
                          }}
                          onMouseEnter={(e) => {
                            if (!selectedRowDataContact?.ban_reason) return;
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // handleOpenTooltip(e);
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedRowDataContact?.ban_reason) return;
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            // handleCloseTooltip();
                          }}
                          // onDoubleClick={() => setIsOpenUpdateContactModal(true)}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataContact?.ban_reason
                              ? selectedRowDataContact?.ban_reason.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataContact?.ban_reason
                            ? selectedRowDataContact?.ban_reason.replace(/\n/g, "<br>")
                            : ""} */}
                        </div>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {(!!selectedRowDataContact?.email_ban_flag ||
                        !!selectedRowDataContact?.fax_dm_ban_flag ||
                        !!selectedRowDataContact?.sending_materials_ban_flag) &&
                        !searchMode &&
                        isEditModeField === "ban_reason" && (
                          <>
                            <textarea
                              cols={30}
                              // rows={10}
                              placeholder=""
                              style={{ whiteSpace: "pre-wrap" }}
                              className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                              value={inputBanReason}
                              onChange={(e) => setInputBanReason(e.target.value)}
                            ></textarea>
                            {/* 送信ボタンとクローズボタン */}
                            {!updateContactFieldMutation.isLoading && (
                              <InputSendAndCloseBtn
                                inputState={inputBanReason}
                                setInputState={setInputBanReason}
                                onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                  handleClickSendUpdateField({
                                    e,
                                    fieldName: "ban_reason",
                                    fieldNameForSelectedRowData: "ban_reason",
                                    originalValue: originalValueFieldEdit.current,
                                    newValue: inputBanReason ? toHalfWidthAndSpace(inputBanReason.trim()) : null,
                                    id: selectedRowDataContact?.contact_id,
                                    required: false,
                                  })
                                }
                                required={false}
                                isDisplayClose={true}
                                btnPositionY="bottom-[8px]"
                              />
                            )}
                            {/* エディットフィールド送信中ローディングスピナー */}
                            {updateContactFieldMutation.isLoading && (
                              <div className={`${styles.field_edit_mode_loading_area} ${styles.under_right}`}>
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )}
                            {/* エディットフィールド送信中ローディングスピナー */}
                            {updateContactFieldMutation.isLoading && (
                              <div className={`${styles.field_edit_mode_loading_area} ${styles.under_right}`}>
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )}
                          </>
                        )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "ban_reason" && (
                        <div
                          className={`${styles.edit_mode_overlay}`}
                          onClick={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                            setIsEditModeField(null); // エディットモードを終了
                          }}
                        />
                      )}
                      {/* ============= フィールドエディットモード関連ここまで ============= */}
                      {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/*  */}
              </div>

              {/*  */}
            </div>
          </div>
        )}
        {/* ---------------- 右コンテナ input時はstickyにしてnullやis nullなどのボタンや説明を配置 ---------------- */}
        {searchMode && (
          <div
            className={`${styles.right_sticky_container} sticky top-0 h-full grow bg-[aqua]/[0] pt-[20px] text-[var(--color-text)] `}
          >
            <div
              className={`${styles.right_sticky_contents_wrapper} flex h-[350px] w-full flex-col rounded-[8px] bg-[var(--color-bg-brand-f10)] px-[20px] `}
            >
              {/* <div className="flex h-[40px] w-full items-center justify-center text-[18px] font-semibold ">
                会社 条件検索
              </div> */}
              <div className={` text-[13px]`}>
                <div className="mt-[5px] flex  min-h-[30px] items-center">○検索したい条件を入力してください。</div>
                <div className="flex  min-h-[30px] items-center">
                  <span className="h-full w-[15px]"></span>
                  例えば、「&quot;東京都大田区&quot;」の会社で「事業拠点」が存在する会社を検索する場合は、「●住所」に「東京都大田区※」と入力し、「事業拠点」に「is
                  not null」と入力してください。
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
      </div>
    </form>
  );
};

export const ContactMainContainer = memo(ContactMainContainerMemo);

/* Divider、区切り線 */
//  <div className="flex h-full w-1/2 flex-col pr-[15px]">
//    <div className="flex h-full items-center">○法人番号</div>
//    <div className={`${styles.underline}`}></div>
//  </div>;

/**
 * 
 * <div
        className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${
          tableContainerSize === "half" ? `${styles.height_all}` : ``
        } ${tableContainerSize === "all" ? `${styles.height_all}` : ``}`}
      >
*/
