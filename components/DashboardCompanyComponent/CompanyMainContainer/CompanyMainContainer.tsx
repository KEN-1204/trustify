import React, { ChangeEvent, FC, FormEvent, Suspense, memo, useCallback, useEffect, useRef, useState } from "react";
import styles from "../CompanyDetail/CompanyDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
// import { UnderRightActivityLog } from "./UnderRightActivityLog/UnderRightActivityLog";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import dynamic from "next/dynamic";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import productCategoriesM from "@/utils/productCategoryM";
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";
import { BsCheck2 } from "react-icons/bs";
import { FallbackUnderRightActivityLog } from "./UnderRightActivityLog/FallbackUnderRightActivityLog";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import { MdClose, MdEdit, MdOutlineEdit } from "react-icons/md";
import { HiOutlineSearch } from "react-icons/hi";
import { IoIosSend } from "react-icons/io";
import { InputSendAndCloseBtn } from "./InputSendAndCloseBtn/InputSendAndCloseBtn";
import { toHalfWidthAndSpaceAndHyphen } from "@/utils/Helpers/toHalfWidthAndSpaceAndHyphen";
import { useQueryClient } from "@tanstack/react-query";
import { useMutateClientCompany } from "@/hooks/useMutateClientCompany";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { Spinner78 } from "@/components/Parts/Spinner78/Spinner78";
import SpinnerIDS2 from "@/components/Parts/SpinnerIDS/SpinnerIDS2";
import { Client_company_row_data } from "@/types";
import { validateAndFormatPhoneNumber } from "@/utils/Helpers/validateAndFormatPhoneNumber";
import { validateAndFormatPostalCode } from "@/utils/Helpers/validateAndFormatPostalCode";
import { formatJapaneseAddress } from "@/utils/Helpers/formatJapaneseAddress";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { optionsIndustryType, optionsMonth, optionsProductL } from "./selectOptionsData";
import { CiEdit } from "react-icons/ci";

// ====================== 擬似テストデータ用 ======================
// https://nextjs-ja-translation-docs.vercel.app/docs/advanced-features/dynamic-import
// デフォルトエクスポートの場合のダイナミックインポート
// const DynamicComponent = dynamic(() => import('../components/hello'));
// 通常
import { UnderRightActivityLog } from "./UnderRightActivityLog/UnderRightActivityLog";
// 名前付きエクスポートの場合のダイナミックインポート
// const UnderRightActivityLog = dynamic(
//   () => import("./UnderRightActivityLog/UnderRightActivityLog").then((mod) => mod.UnderRightActivityLog),
//   {
//     ssr: false,
//   }
// );
// ====================== 擬似テストデータ用 ======================
/**カスタムローディングコンポーネント オプションの loading コンポーネントを追加して、動的コンポーネントの読み込み中に読み込み状態をレンダリングできます
 * const DynamicComponentWithCustomLoading = dynamic(() => import('../components/hello'), {
  loading: () => <p>...</p>
});
 */
// SSRを使用しない場合
// 常にサーバー側にモジュールを含める必要はありません。たとえば、ブラウザのみで動作するライブラリがモジュールに含まれている場合です。

const CompanyMainContainerMemo: FC = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // サーチモード、編集モード
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  // ツールチップ
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  // 上画面の選択中の列データ会社
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  // 「条件に一致する全ての会社をフェッチするか」、「条件に一致する自社で作成した会社のみをフェッチするか」の抽出条件を保持
  const isFetchAllCompanies = useDashboardStore((state) => state.isFetchAllCompanies);
  const setIsFetchAllCompanies = useDashboardStore((state) => state.setIsFetchAllCompanies);
  // 各フィールドの編集モード => ダブルクリックで各フィールド名をstateに格納し、各フィールドをエディットモードへ
  const isEditModeField = useDashboardStore((state) => state.isEditModeField);
  const setIsEditModeField = useDashboardStore((state) => state.setIsEditModeField);
  const [isComposing, setIsComposing] = useState(false); // 日本語のように変換、確定が存在する言語入力の場合の日本語入力の変換中を保持するstate、日本語入力開始でtrue, エンターキーで変換確定した時にfalse
  const [isValidInput, setIsValidInput] = useState(false);

  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);

  const newSearchCompanyParams = useDashboardStore((state) => state.newSearchCompanyParams);
  const setNewSearchCompanyParams = useDashboardStore((state) => state.setNewSearchCompanyParams);
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // useMutation
  const { updateClientCompanyFieldMutation, updateMultipleClientCompanyFields } = useMutateClientCompany();

  // 🌟サブミット
  const [inputName, setInputName] = useState("");
  const [inputDepartment, setInputDepartment] = useState("");
  const [inputTel, setInputTel] = useState("");
  const [inputFax, setInputFax] = useState("");
  const [inputZipcode, setInputZipcode] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [inputEmployeesClass, setInputEmployeesClass] = useState("");
  const [inputCapital, setInputCapital] = useState<string>("");
  const [inputFound, setInputFound] = useState("");
  const [inputContent, setInputContent] = useState("");
  const [inputHP, setInputHP] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputIndustryType, setInputIndustryType] = useState("");
  const [inputProductL, setInputProductL] = useState("");
  const [inputProductM, setInputProductM] = useState("");
  const [inputProductS, setInputProductS] = useState("");
  const [inputFiscal, setInputFiscal] = useState("");
  const [inputClient, setInputClient] = useState("");
  const [inputSupplier, setInputSupplier] = useState("");
  const [inputFacility, setInputFacility] = useState("");
  const [inputBusinessSite, setInputBusinessSite] = useState("");
  const [inputOverseas, setInputOverseas] = useState("");
  const [inputGroup, setInputGroup] = useState("");
  const [inputCorporateNum, setInputCorporateNum] = useState("");
  // 代表者
  const [inputRepresentativeName, setInputRepresentativeName] = useState("");
  const [inputChairperson, setInputChairperson] = useState("");
  const [inputSeniorVicePresident, setInputSeniorVicePresident] = useState("");
  const [inputSeniorManagingDirector, setInputSeniorManagingDirector] = useState("");
  const [inputManagingDirector, setInputManagingDirector] = useState("");
  const [inputDirector, setInputDirector] = useState("");
  const [inputBoardMember, setInputBoardMember] = useState("");
  const [inputAuditor, setInputAuditor] = useState("");
  const [inputManager, setInputManager] = useState("");
  const [inputMember, setInputMember] = useState("");
  // 従業員数 フィールドエディットモードのみでサーチなし
  const [inputNumberOfEmployees, setInputNumberOfEmployees] = useState("");

  // サーチ編集モードでリプレイス前の値に復元する関数
  function beforeAdjustFieldValue(value: string | null) {
    if (value === "") return ""; // 全てのデータ
    if (value === null) return ""; // 全てのデータ
    if (value.includes("%")) value = value.replace(/\%/g, "＊");
    if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
    if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
    return value;
  }

  // 編集モードtrueの場合、サーチ条件をinputタグのvalueに格納
  // 新規サーチの場合には、サーチ条件を空にする
  useEffect(() => {
    // if (newSearchCompanyParams === null) return;
    if (isEditModeField) return console.log("フィールドエディットモードのためuseEffectでのinput更新はなしリターン");

    if (editSearchMode && searchMode) {
      if (newSearchCompanyParams === null) return;
      console.log(
        "🔥Companyメインコンテナー useEffect 編集モード inputにnewSearchCompanyParamsを格納",
        newSearchCompanyParams
      );
      setInputName(beforeAdjustFieldValue(newSearchCompanyParams.name));
      setInputDepartment(beforeAdjustFieldValue(newSearchCompanyParams.department_name));
      setInputTel(beforeAdjustFieldValue(newSearchCompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchCompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchCompanyParams?.zipcode));
      setInputEmployeesClass(beforeAdjustFieldValue(newSearchCompanyParams?.number_of_employees_class));
      setInputAddress(beforeAdjustFieldValue(newSearchCompanyParams?.address));
      // setInputCapital(beforeAdjustFieldValue(newSearchCompanyParams?.capital));
      setInputCapital(
        beforeAdjustFieldValue(!!newSearchCompanyParams?.capital ? newSearchCompanyParams.capital.toString() : "")
      );
      setInputFound(beforeAdjustFieldValue(newSearchCompanyParams?.established_in));
      setInputContent(beforeAdjustFieldValue(newSearchCompanyParams?.business_content));
      setInputHP(beforeAdjustFieldValue(newSearchCompanyParams.website_url));
      setInputEmail(beforeAdjustFieldValue(newSearchCompanyParams.email));
      setInputIndustryType(beforeAdjustFieldValue(newSearchCompanyParams.industry_type));
      setInputProductL(beforeAdjustFieldValue(newSearchCompanyParams.product_category_large));
      setInputProductM(beforeAdjustFieldValue(newSearchCompanyParams.product_category_medium));
      setInputProductS(beforeAdjustFieldValue(newSearchCompanyParams.product_category_small));
      setInputFiscal(beforeAdjustFieldValue(newSearchCompanyParams.fiscal_end_month));
      setInputClient(beforeAdjustFieldValue(newSearchCompanyParams.clients));
      setInputSupplier(beforeAdjustFieldValue(newSearchCompanyParams.supplier));
      setInputFacility(beforeAdjustFieldValue(newSearchCompanyParams.facility));
      setInputBusinessSite(beforeAdjustFieldValue(newSearchCompanyParams.business_sites));
      setInputOverseas(beforeAdjustFieldValue(newSearchCompanyParams.overseas_bases));
      setInputGroup(beforeAdjustFieldValue(newSearchCompanyParams.group_company));
      setInputCorporateNum(beforeAdjustFieldValue(newSearchCompanyParams.corporate_number));
      // 代表者
      setInputRepresentativeName(beforeAdjustFieldValue(newSearchCompanyParams.representative_name));
      setInputChairperson(beforeAdjustFieldValue(newSearchCompanyParams.chairperson));
      setInputSeniorVicePresident(beforeAdjustFieldValue(newSearchCompanyParams.senior_vice_president));
      setInputSeniorManagingDirector(beforeAdjustFieldValue(newSearchCompanyParams.senior_managing_director));
      setInputManagingDirector(beforeAdjustFieldValue(newSearchCompanyParams.managing_director));
      setInputDirector(beforeAdjustFieldValue(newSearchCompanyParams.director));
      setInputBoardMember(beforeAdjustFieldValue(newSearchCompanyParams.board_member));
      setInputAuditor(beforeAdjustFieldValue(newSearchCompanyParams.auditor));
      setInputManager(beforeAdjustFieldValue(newSearchCompanyParams.manager));
      setInputMember(beforeAdjustFieldValue(newSearchCompanyParams.member));
    } else if (!editSearchMode && searchMode) {
      console.log("🔥Companyメインコンテナー useEffect 新規サーチモード inputを初期化", newSearchCompanyParams);
      if (!!inputName) setInputName("");
      if (!!inputDepartment) setInputDepartment("");
      if (!!inputTel) setInputTel("");
      if (!!inputFax) setInputFax("");
      if (!!inputZipcode) setInputZipcode("");
      if (!!inputEmployeesClass) setInputEmployeesClass("");
      if (!!inputAddress) setInputAddress("");
      if (!!inputCapital) setInputCapital("");
      if (!!inputFound) setInputFound("");
      if (!!inputContent) setInputContent("");
      if (!!inputHP) setInputHP("");
      if (!!inputEmail) setInputEmail("");
      if (!!inputIndustryType) setInputIndustryType("");
      if (!!inputProductL) setInputProductL("");
      if (!!inputProductM) setInputProductM("");
      if (!!inputProductS) setInputProductS("");
      if (!!inputFiscal) setInputFiscal("");
      if (!!inputClient) setInputClient("");
      if (!!inputSupplier) setInputSupplier("");
      if (!!inputFacility) setInputFacility("");
      if (!!inputBusinessSite) setInputBusinessSite("");
      if (!!inputOverseas) setInputOverseas("");
      if (!!inputGroup) setInputGroup("");
      if (!!inputCorporateNum) setInputCorporateNum("");
      // 代表者
      if (!!inputRepresentativeName) setInputRepresentativeName("");
      if (!!inputChairperson) setInputChairperson("");
      if (!!inputSeniorVicePresident) setInputSeniorVicePresident("");
      if (!!inputSeniorManagingDirector) setInputSeniorManagingDirector("");
      if (!!inputManagingDirector) setInputManagingDirector("");
      if (!!inputDirector) setInputDirector("");
      if (!!inputBoardMember) setInputBoardMember("");
      if (!!inputAuditor) setInputAuditor("");
      if (!!inputManager) setInputManager("");
      if (!!inputMember) setInputMember("");
    }
  }, [editSearchMode, searchMode]);
  // }, [editSearchMode]);

  // サーチ関数実行
  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // フィールド編集モードがtrueならサブミットせずにリターン
    if (isEditModeField) return console.log("サブミット フィールドエディットモードのためリターン");

    console.log("handleSearchSubmit実行 サブミット");

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

    let _name = adjustFieldValue(inputName);
    let _department_name = adjustFieldValue(inputDepartment);
    let _main_phone_number = adjustFieldValue(inputTel);
    let _main_fax = adjustFieldValue(inputFax);
    let _zipcode = adjustFieldValue(inputZipcode);
    let _number_of_employees_class = adjustFieldValue(inputEmployeesClass);
    let _address = adjustFieldValue(inputAddress);
    // let _capital = adjustFieldValue(inputCapital);
    let _capital = adjustFieldValue(inputCapital) ? parseInt(inputCapital, 10) : null;
    let _established_in = adjustFieldValue(inputFound);
    let _business_content = adjustFieldValue(inputContent);
    let _website_url = adjustFieldValue(inputHP);
    let _email = adjustFieldValue(inputEmail);
    let _industry_type = adjustFieldValue(inputIndustryType);
    let _product_category_large = adjustFieldValue(inputProductL);
    let _product_category_medium = adjustFieldValue(inputProductM);
    let _product_category_small = adjustFieldValue(inputProductS);
    let _fiscal_end_month = adjustFieldValue(inputFiscal);
    let _clients = adjustFieldValue(inputClient);
    let _supplier = adjustFieldValue(inputSupplier);
    let _facility = adjustFieldValue(inputFacility);
    let _business_sites = adjustFieldValue(inputBusinessSite);
    let _overseas_bases = adjustFieldValue(inputOverseas);
    let _group_company = adjustFieldValue(inputGroup);
    let _corporate_number = adjustFieldValue(inputCorporateNum);

    // 代表者
    let _representative_name = adjustFieldValue(inputRepresentativeName);
    let _chairperson = adjustFieldValue(inputChairperson);
    let _senior_vice_president = adjustFieldValue(inputSeniorVicePresident);
    let _senior_managing_director = adjustFieldValue(inputSeniorManagingDirector);
    let _managing_director = adjustFieldValue(inputManagingDirector);
    let _director = adjustFieldValue(inputDirector);
    let _board_member = adjustFieldValue(inputDirector);
    let _auditor = adjustFieldValue(inputAuditor);
    let _manager = adjustFieldValue(inputManager);
    let _member = adjustFieldValue(inputMember);

    // // Asterisks to percent signs for PostgreSQL's LIKE operator
    // if (_field1.includes("*")) _field1 = _field1.replace(/\*/g, "%");
    // if (_field1 === "is null") _field1 = null;
    // if (_field1 === "is not null") _field1 = "%%";

    const params = {
      name: _name,
      department_name: _department_name,
      main_phone_number: _main_phone_number,
      main_fax: _main_fax,
      zipcode: _zipcode,
      number_of_employees_class: _number_of_employees_class,
      address: _address,
      capital: _capital,
      established_in: _established_in,
      business_content: _business_content,
      website_url: _website_url,
      email: _email,
      industry_type: _industry_type,
      product_category_large: _product_category_large,
      product_category_medium: _product_category_medium,
      product_category_small: _product_category_small,
      fiscal_end_month: _fiscal_end_month,
      clients: _clients,
      supplier: _supplier,
      facility: _facility,
      business_sites: _business_sites,
      overseas_bases: _overseas_bases,
      group_company: _group_company,
      corporate_number: _corporate_number,
      // 代表者
      representative_name: _representative_name,
      chairperson: _chairperson,
      senior_vice_president: _senior_vice_president,
      senior_managing_director: _senior_managing_director,
      managing_director: _managing_director,
      director: _director,
      board_member: _board_member,
      auditor: _auditor,
      manager: _manager,
      member: _member,
    };

    console.log("✅ 条件 params", params);

    setInputName("");
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
    setInputEmail("");
    setInputIndustryType("");
    setInputProductL("");
    setInputProductM("");
    setInputProductS("");
    setInputFiscal("");
    setInputClient("");
    setInputSupplier("");
    setInputFacility("");
    setInputBusinessSite("");
    setInputOverseas("");
    setInputGroup("");
    setInputCorporateNum("");
    // 代表者
    setInputRepresentativeName("");
    setInputChairperson("");
    setInputSeniorVicePresident("");
    setInputSeniorManagingDirector("");
    setInputManagingDirector("");
    setInputDirector("");
    setInputBoardMember("");
    setInputAuditor("");
    setInputManager("");
    setInputMember("");

    // サーチモードをfalse
    setSearchMode(false);
    // 編集モードをfalse
    setEditSearchMode(false);

    // Zustandに検索条件を格納
    setNewSearchCompanyParams(params);

    console.log("✅ params", params);
    // const { data, error } = await supabase.rpc("search_companies", { params });

    // 会社IDがnull、つまりまだ有料アカウントを持っていないユーザー
    // const { data, error } = await supabase
    //   .rpc("search_companies", { params })
    //   .is("created_by_company_id", null)
    //   .range(0, 20);

    // if (error) return alert(error.message);
    // console.log("✅ 検索結果データ取得 data", data);
  };

  // ================== 🌟ツールチップ ==================
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
  };
  const handleOpenTooltip = ({ e, display = "" }: TooltipParams) => {
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
  // ================== ✅ツールチップ ==================

  // ================== 🌟シングルクリック、ダブルクリックイベント ==================
  // ダブルクリックで各フィールドごとに個別で編集
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 選択行データが自社専用の会社データかどうか
  const isOwnCompany =
    !!userProfileState?.company_id &&
    !!selectedRowDataCompany?.created_by_company_id &&
    selectedRowDataCompany.created_by_company_id === userProfileState.company_id;

  // シングルクリック => 何もアクションなし
  const handleSingleClickField = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      // 自社で作成した会社でない場合はそのままリターン
      if (!isOwnCompany) return;
      if (setTimeoutRef.current !== null) return;

      setTimeoutRef.current = setTimeout(() => {
        setTimeoutRef.current = null;
        // シングルクリック時に実行したい処理
        // 0.2秒後に実行されてしまうためここには書かない
      }, 200);
      console.log("シングルクリック");
    },
    [isOwnCompany]
  );

  // const originalOptionRef = useRef(""); // 同じ選択肢選択時にエディットモード終了用
  // ダブルクリック => ダブルクリックしたフィールドを編集モードに変更
  type DoubleClickProps = {
    e: React.MouseEvent<HTMLSpanElement>;
    field: string;
    dispatch: React.Dispatch<React.SetStateAction<any>>;
    // isSelectChangeEvent?: boolean;
    selectedRowDataValue?: any;
  };
  const handleDoubleClickField = useCallback(
    ({ e, field, dispatch, selectedRowDataValue }: DoubleClickProps) => {
      // 自社で作成した会社でない場合はそのままリターン
      if (!isOwnCompany) return;

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
        dispatch(text); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
        setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
        // if (isSelectChangeEvent) originalOptionRef.current = e.currentTarget.innerText; // selectタグ同じ選択肢選択時の編集モード終了用
      }
    },
    [isOwnCompany, setIsEditModeField]
  );
  // ================== ✅シングルクリック、ダブルクリックイベント ==================

  // プロパティ名のユニオン型の作成
  // Client_company_row_data型の全てのプロパティ名をリテラル型のユニオンとして展開
  type ClientCompanyFieldNames = keyof Client_company_row_data;
  // ================== 🌟エンターキーで個別フィールドをアップデート inputタグ ==================
  const handleKeyDownUpdateField = async ({
    e,
    fieldName,
    value,
    id,
    required,
  }: {
    e: React.KeyboardEvent<HTMLInputElement>;
    // fieldName: string;
    fieldName: ClientCompanyFieldNames;
    value: any;
    id: string | undefined;
    required: boolean;
  }) => {
    // 日本語入力変換中はtrueで変換確定のエンターキーではUPDATEクエリが実行されないようにする
    // 英語などの入力変換が存在しない言語ではisCompositionStartは発火しないため常にfalse
    if (e.key === "Enter" && !isComposing) {
      if (required && (value === "" || value === null))
        return toast.info(`この項目は入力が必須です。`, { autoClose: 3000 });

      // 先にアンダーラインが残らないようにremoveしておく
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

      if (!id || !selectedRowDataCompany) {
        toast.error(`エラー：会社データが見つかりませんでした。`, { autoClose: 3000 });
        return;
      }
      console.log(
        "handleKeyDownUpdateField関数実行 ",
        "fieldName",
        fieldName,
        "selectedRowDataCompany[fieldName]",
        selectedRowDataCompany[fieldName],
        "value",
        value
      );
      // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
      if (selectedRowDataCompany[fieldName] === value) {
        console.log("同じためリターン");
        setIsEditModeField(null); // エディットモードを終了
        return;
      }
      // 資本金などのint4(integer), int8(BIGINT)などは数値型に変換して入力値と現在のvalueを比較する
      if (["capital"].includes(fieldName)) {
        if (selectedRowDataCompany[fieldName] === Number(value)) {
          console.log("数値型に変換 同じためリターン", fieldName, "Number(value)", Number(value));
          setIsEditModeField(null); // エディットモードを終了
          return;
        }
      }

      const updatePayload = {
        fieldName: fieldName,
        value: value,
        id: id,
      };
      // 入力変換確定状態でエンターキーが押された場合の処理
      console.log("onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 updatePayload", updatePayload);
      await updateClientCompanyFieldMutation.mutateAsync(updatePayload);
      setIsEditModeField(null); // エディットモードを終了
    }
  };
  // ================== ✅エンターキーで個別フィールドをアップデート inputタグ ==================
  // ================== 🌟エンターキーで個別フィールドをアップデート textareaタグ ==================
  const handleKeyDownUpdateFieldTextarea = async ({
    e,
    fieldName,
    value,
    id,
    required,
    preventNewLine = false,
  }: {
    e: React.KeyboardEvent<HTMLTextAreaElement>;
    // fieldName: string;
    fieldName: ClientCompanyFieldNames;
    value: any;
    id: string | undefined;
    required: boolean;
    preventNewLine?: boolean;
  }) => {
    // 日本語入力変換中はtrueで変換確定のエンターキーではUPDATEクエリが実行されないようにする
    // 英語などの入力変換が存在しない言語ではisCompositionStartは発火しないため常にfalse
    if (e.key === "Enter" && !isComposing && !e.shiftKey) {
      if (preventNewLine) e.preventDefault(); // preventNewLineがtrueなら改行動作を阻止
      if (required && (value === "" || value === null))
        return toast.info(`この項目は入力が必須です。`, { autoClose: 3000 });

      // 先にアンダーラインが残らないようにremoveしておく
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

      if (!id || !selectedRowDataCompany) {
        toast.error(`エラー：会社データが見つかりませんでした。`, { autoClose: 3000 });
        return;
      }
      // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
      if (selectedRowDataCompany[fieldName] === value) {
        console.log("同じためリターン");
        setIsEditModeField(null); // エディットモードを終了
        return;
      }

      const updatePayload = {
        fieldName: fieldName,
        value: value,
        id: id,
      };
      // 入力変換確定状態でエンターキーが押された場合の処理
      console.log("onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 updatePayload", updatePayload);
      await updateClientCompanyFieldMutation.mutateAsync(updatePayload);
      setIsEditModeField(null); // エディットモードを終了
    }
  };
  // ================== ✅エンターキーで個別フィールドをアップデート textareaタグ ==================
  // ================== 🌟Sendキーで個別フィールドをアップデート ==================
  const handleClickSendUpdateField = async ({
    e,
    fieldName,
    value,
    id,
    required,
  }: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
    // fieldName: string;
    fieldName: ClientCompanyFieldNames;
    value: any;
    id: string | undefined;
    required: boolean;
  }) => {
    if (required && (value === "" || value === null))
      return toast.info(`この項目は入力が必須です。`, { autoClose: 3000 });

    e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

    if (!id || !selectedRowDataCompany) {
      toast.error(`エラー：会社データが見つかりませんでした。`, { autoClose: 3000 });
      return;
    }

    console.log(
      "handleClickSendUpdateField関数実行 ",
      "selectedRowDataCompany[fieldName]",
      selectedRowDataCompany[fieldName],
      "value",
      value
    );

    // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
    if (selectedRowDataCompany[fieldName] === value) {
      console.log(
        "同じためリターン",
        "selectedRowDataCompany[fieldName]",
        selectedRowDataCompany[fieldName],
        "value",
        value
      );
      setIsEditModeField(null); // エディットモードを終了
      return;
    }

    const updatePayload = {
      fieldName: fieldName,
      value: value,
      id: id,
    };
    // 入力変換確定状態でエンターキーが押された場合の処理
    console.log("sendアイコンクリックでUPDATE実行 updatePayload", updatePayload);
    await updateClientCompanyFieldMutation.mutateAsync(updatePayload);
    setIsEditModeField(null); // エディットモードを終了
  };
  // ================== ✅Sendキーで個別フィールドをアップデート ==================
  // ================== 🌟セレクトボックスで個別フィールドをアップデート ==================

  const handleChangeSelectUpdateField = async ({
    e,
    fieldName,
    value,
    id,
  }: {
    e: ChangeEvent<HTMLSelectElement>;
    // fieldName: string;
    fieldName: ClientCompanyFieldNames;
    value: any;
    id: string | undefined;
  }) => {
    e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

    if (!id || !selectedRowDataCompany) {
      toast.error(`エラー：会社データが見つかりませんでした。`, { autoClose: 3000 });
      return;
    }
    // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン
    if (selectedRowDataCompany[fieldName] === value) {
      console.log("同じためリターン");
      setIsEditModeField(null); // エディットモードを終了
      return;
    }

    // 製品分類(大分類以外)
    if (fieldName !== "product_category_large") {
      const updatePayload = {
        fieldName: fieldName,
        value: value,
        id: id,
      };
      // 入力変換確定状態でエンターキーが押された場合の処理
      console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
      await updateClientCompanyFieldMutation.mutateAsync(updatePayload);
    }
    // 製品分類(大分類以外)のUPDATE、同時に製品分類(中分類)をnullに更新してリセット
    else if (fieldName === "product_category_large") {
      const updateObject = { product_category_large: value, product_category_medium: null };
      const updateProductCategoryLargePayload = {
        updateObject: updateObject,
        id: id,
      };
      console.log("selectタグでUPDATE実行 updateProductCategoryLargePayload", updateProductCategoryLargePayload);
      await updateMultipleClientCompanyFields.mutateAsync(updateProductCategoryLargePayload);
    }
    setIsEditModeField(null); // エディットモードを終了
  };
  // selectタグで同じ選択肢を選択した際にフィールドエディットモードを終了させるイベントハンドラ
  // const handleFinishEditModeOnClick = (e: React.MouseEvent<HTMLSelectElement, MouseEvent>) => {
  //   // selectタグは現在選択中の選択肢を選択した場合には、onChangeイベントは発火しないので、選択中のinputStateは変更されないため、onClickイベントが発火したときに、ダブルクリックで格納したデータベースの値を保持するoriginalOptionRefとinputStateが同じままになるので、条件式が一致するので、ここでフィールドエディットモードを終了する
  //   // onClickイベントよりonChangeイベントがselectタグにおいては先に発火する
  //   // if (originalOptionRef.current === e.currentTarget.value) {
  //   //   // 現在選択中の選択肢と同じ選択肢を選択した場合には、編集モードを終了する
  //   //   originalOptionRef.current = ""; // refの値を空にしてから終了
  //   //   setIsEditModeField(null); // エディットモードを終了
  //   // }
  // };
  // ================== ✅セレクトボックスで個別フィールドをアップデート ==================

  console.log(
    "🔥 CompanyMainContainerレンダリング searchMode",
    searchMode,
    "newSearchCompanyParams",
    newSearchCompanyParams,
    "selectedRowDataCompany",
    selectedRowDataCompany
  );

  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  return (
    <form className={`${styles.main_container} w-full `} onSubmit={handleSearchSubmit}>
      {/* フィールドエディットモードの時のオーバーレイ */}
      {/* {!searchMode && isEditModeField !== null && (
        <div
          className="fixed left-0 top-0 z-[1000] h-full w-full bg-[#00000000]"
          onClick={() => setIsEditModeField(null)}
        />
      )} */}
      {/* ------------------------- スクロールコンテナ ------------------------- */}
      {/* <div className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] `}> */}
      <div
        className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${
          tableContainerSize === "half" && underDisplayFullScreen ? `${styles.height_all}` : ``
        } ${tableContainerSize === "all" && underDisplayFullScreen ? `${styles.height_all}` : ``}`}
      >
        {/* ------------------------- 左コンテナ ------------------------- */}
        <div
          className={`${styles.left_container} h-full pb-[35px] pt-[10px]`}
          // className={`${styles.left_container} h-full min-w-[calc(50vw-var(--sidebar-mini-width))] pb-[35px] pt-[10px]`}
        >
          {/* --------- ラッパー --------- */}
          <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
            {/* row_areaグループ */}
            {/* {searchMode && (
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>検索タイプ</span>
                    {searchMode && (
                      <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                        value={isFetchAllCompanies ? `All` : `Own`}
                        onChange={(e) => setIsFetchAllCompanies(e.target.value === "All")}
                      >
                        <option value="All">条件に一致する全ての会社</option>
                        <option value="Own">条件に一致する自社で作成した会社のみ</option>
                      </select>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]"></div>
              </div>
            )} */}
            {/* 会社名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●会社名</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "name" && (
                    <div className="flex items-center space-x-[9px]">
                      <span
                        className={`${styles.value} ${styles.value_highlight} ${
                          isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`
                        }`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => handleDoubleClickField({ e, field: "name", dispatch: setInputName })}
                        onMouseEnter={(e) => {
                          // 会社名は自社専用チェックがあるため一つ親要素が他より多い
                          e.currentTarget.parentElement?.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                      </span>
                      {/* 自社専用会社の時のチェックマーク */}
                      {selectedRowDataCompany?.created_by_company_id === userProfileState?.company_id && (
                        <div
                          data-text={`自社専用の会社データです。`}
                          data-text2={`自社で作成した会社データは編集が可能です。`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, display: "top" })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                        </div>
                      )}
                      {!!selectedRowDataCompany && (
                        <div
                          className={`relative !ml-[4px] h-[22px] w-[22px] ${styles.editable_icon}`}
                          data-text={`表示されている各データをダブルクリックすることで個別に編集可能です。`}
                          data-text2={`編集できるのは自社で作成した自社専用データのみです。`}
                          onMouseEnter={(e) => {
                            handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {/* <MdOutlineEdit
                            className={`pointer-events-none min-h-[20px] min-w-[20px] text-[20px] text-[var(--color-text-sub-light)]`}
                          /> */}
                          <CiEdit
                            className={`pointer-events-none min-h-[22px] min-w-[22px] text-[22px] text-[var(--color-text-sub)]`}
                          />
                        </div>
                      )}
                      {/* <MdEdit className="min-h-[18px] min-w-[18px] text-[18px] text-[var(--color-text-sub)]" /> */}
                    </div>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="text"
                      placeholder="株式会社○○"
                      autoFocus
                      className={`${styles.input_box}`}
                      value={inputName}
                      onChange={(e) => setInputName(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "name" && (
                    <>
                      <input
                        type="text"
                        placeholder="株式会社○○"
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                        value={inputName}
                        // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                        onChange={(e) => setInputName(e.target.value)}
                        // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={async (e) => {
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "name",
                            // value: inputName,
                            value: toHalfWidthAndSpace(inputName.trim()),
                            id: selectedRowDataCompany?.id,
                            required: true,
                          });
                        }}
                        // onKeyDown={async (e) => {
                        //   // 日本語入力変換中はtrueで変換確定のエンターキーではUPDATEクエリが実行されないようにする
                        //   // 英語などの入力変換が存在しない言語ではisCompositionStartは発火しないため常にfalse
                        //   if (e.key === "Enter" && !isComposing) {
                        //     e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        //     if (!selectedRowDataCompany?.id) {
                        //       toast.error(`エラー：会社データが見つかりませんでした。`, {
                        //         position: "top-right",
                        //         autoClose: 1500,
                        //       });
                        //       return;
                        //     }
                        //     // 入力変換確定状態でエンターキーが押された場合の処理
                        //     console.log(
                        //       "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行",
                        //       "selectedRowDataCompany",
                        //       selectedRowDataCompany
                        //     );
                        //     const updatePayload = {
                        //       fieldName: "name",
                        //       value: inputName,
                        //       id: selectedRowDataCompany.id,
                        //     };
                        //     await updateClientCompanyFieldMutation.mutateAsync(updatePayload);
                        //     setIsEditModeField(null); // エディットモードを終了
                        //   }
                        // }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputName}
                          setInputState={setInputName}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "name",
                              // value: inputName,
                              value: toHalfWidthAndSpace(inputName.trim()),
                              id: selectedRowDataCompany?.id,
                              required: true,
                            })
                          }
                          required={true}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div
                          // className={`"flex-center translate-y-[-50%]" absolute right-[10px] top-[calc(50%-2.5px)] z-[2100] min-h-[26px] min-w-[26px]`}
                          className={`${styles.field_edit_mode_loading_area}`}
                        >
                          <SpinnerComet w="22px" h="22px" s="3px" />
                          {/* <SpinnerX w="w-[22px]" h="h-[22px]" /> */}
                          {/* <Spinner78 s="22px" c="var(--color-bg-brand-f)" /> */}
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "name" && (
                    <div
                      // className={`fixed left-0 top-0 z-[1000] h-full w-full bg-[#00000000]`}
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

            {/* 部署名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●部署名</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "department_name" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) =>
                        handleDoubleClickField({ e, field: "department_name", dispatch: setInputDepartment })
                      }
                      onMouseEnter={(e) => {
                        console.log(e.currentTarget.parentElement, e.currentTarget.parentElement?.parentElement);
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.department_name ? selectedRowDataCompany?.department_name : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="text"
                      placeholder="「代表取締役＊」や「＊製造部＊」「＊品質＊」など"
                      className={`${styles.input_box}`}
                      value={inputDepartment}
                      onChange={(e) => setInputDepartment(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "department_name" && (
                    <>
                      <input
                        type="text"
                        placeholder="株式会社○○"
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                        value={inputDepartment}
                        onChange={(e) => setInputDepartment(e.target.value)}
                        // onBlur={() => setInputDepartment(toHalfWidthAndSpaceAndHyphen(inputDepartment.trim()))}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) =>
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "department_name",
                            // value: inputDepartment,
                            value: toHalfWidthAndSpace(inputDepartment.trim()),
                            id: selectedRowDataCompany?.id,
                            required: true,
                          })
                        }
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputDepartment}
                          setInputState={setInputDepartment}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "department_name",
                              // value: inputDepartment,
                              value: toHalfWidthAndSpace(inputDepartment.trim()),
                              id: selectedRowDataCompany?.id,
                              required: true,
                            })
                          }
                          required={true}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "department_name" && (
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

            {/* 代表TEL・代表Fax */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●代表TEL</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "main_phone_number" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) =>
                        handleDoubleClickField({ e, field: "main_phone_number", dispatch: setInputTel })
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.main_phone_number ? selectedRowDataCompany?.main_phone_number : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="tel"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={inputTel}
                      onChange={(e) => setInputTel(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ  */}
                  {!searchMode && isEditModeField === "main_phone_number" && (
                    <>
                      <input
                        type="tel"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        // className={`${styles.input_box} z-[2000] !pr-[65px]`}
                        value={inputTel}
                        onChange={(e) => setInputTel(e.target.value)}
                        // onBlur={(e) => setInputTel(toHalfWidthAndSpaceAndHyphen(inputTel.trim()))}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          // 電話番号用バリデーションチェック
                          if (e.key === "Enter" && !isComposing) {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(inputTel.trim());
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
                              fieldName: "main_phone_number",
                              // value: inputTel,
                              value: formattedNumber,
                              id: selectedRowDataCompany?.id,
                              required: true,
                            });
                          }
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputTel}
                          setInputState={setInputTel}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            const { isValid, formattedNumber } = validateAndFormatPhoneNumber(inputTel.trim());
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
                              fieldName: "main_phone_number",
                              // value: inputTel,
                              value: formattedNumber,
                              id: selectedRowDataCompany?.id,
                              required: true,
                            });
                          }}
                          required={true}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "main_phone_number" && (
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
              {/* 代表FAX */}
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>代表Fax</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "main_fax" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => handleDoubleClickField({ e, field: "main_fax", dispatch: setInputFax })}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.main_fax ? selectedRowDataCompany?.main_fax : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="tel"
                      className={`${styles.input_box}`}
                      value={inputFax}
                      onChange={(e) => setInputFax(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ  */}
                  {!searchMode && isEditModeField === "main_fax" && (
                    <>
                      <input
                        type="tel"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} z-[2000] ${styles.field_edit_mode_input_box}`}
                        value={inputFax}
                        onChange={(e) => setInputFax(e.target.value)}
                        // onBlur={(e) => setInputFax(toHalfWidthAndSpaceAndHyphen(inputFax.trim()))}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          // 電話番号用バリデーションチェック
                          if (e.key === "Enter" && !isComposing) {
                            const { isValid, formattedNumber: formattedFax } = validateAndFormatPhoneNumber(
                              inputFax.trim()
                            );
                            if (!isValid) {
                              setInputFax(formattedFax);
                              toast.error(`有効なFax番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`, {
                                position: "bottom-center",
                                autoClose: false,
                                transition: Zoom,
                              });
                              return;
                            }
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "main_fax",
                              value: formattedFax,
                              id: selectedRowDataCompany?.id,
                              required: true,
                            });
                          }
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputFax}
                          setInputState={setInputFax}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            const { isValid, formattedNumber: formattedFax } = validateAndFormatPhoneNumber(
                              inputFax.trim()
                            );
                            if (!isValid) {
                              setInputFax(formattedFax);
                              toast.error(`有効なFax番号を入力してください。「数字、ハイフン、＋、()」のみ有効です。`, {
                                position: "bottom-center",
                                autoClose: false,
                                transition: Zoom,
                              });
                              return;
                            }
                            handleClickSendUpdateField({
                              e,
                              fieldName: "main_fax",
                              value: formattedFax,
                              id: selectedRowDataCompany?.id,
                              required: true,
                            });
                          }}
                          required={true}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "main_fax" && (
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

            {/* 郵便番号・規模(ランク) */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  {/* ディスプレイ */}
                  <span className={`${styles.title}`}>郵便番号</span>
                  {!searchMode && isEditModeField !== "zipcode" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => handleDoubleClickField({ e, field: "zipcode", dispatch: setInputZipcode })}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.zipcode ? selectedRowDataCompany?.zipcode : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputZipcode}
                      onChange={(e) => setInputZipcode(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ  */}
                  {!searchMode && isEditModeField === "zipcode" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputZipcode}
                        onChange={(e) => setInputZipcode(e.target.value)}
                        // onBlur={(e) => setInputZipcode(toHalfWidthAndSpaceAndHyphen(inputZipcode.trim()))}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          // 郵便番号用バリデーションチェック
                          if (e.key === "Enter" && !isComposing) {
                            const { isValid, formattedPostalCodeCode } = validateAndFormatPostalCode(
                              inputZipcode.trim()
                            );
                            if (!isValid) {
                              setInputZipcode(formattedPostalCodeCode);
                              toast.error(
                                `有効な郵便番号を入力してください。「数字、英字、ハイフン、スペース」のみ有効です。`,
                                { position: "bottom-center", autoClose: false, transition: Zoom }
                              );
                              return;
                            }
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "zipcode",
                              value: formattedPostalCodeCode,
                              id: selectedRowDataCompany?.id,
                              required: true,
                            });
                          }
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputZipcode}
                          setInputState={setInputZipcode}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                            const { isValid, formattedPostalCodeCode } = validateAndFormatPostalCode(
                              inputZipcode.trim()
                            );
                            if (!isValid) {
                              setInputZipcode(formattedPostalCodeCode);
                              toast.error(
                                `有効な郵便番号を入力してください。「数字、英字、ハイフン、スペース」のみ有効です。`,
                                { position: "bottom-center", autoClose: false, transition: Zoom }
                              );
                              return;
                            }
                            handleClickSendUpdateField({
                              e,
                              fieldName: "zipcode",
                              value: formattedPostalCodeCode,
                              id: selectedRowDataCompany?.id,
                              required: true,
                            });
                          }}
                          required={true}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "zipcode" && (
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
              {/* 規模(ランク) */}
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "number_of_employees_class" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "number_of_employees_class",
                          dispatch: setInputEmployeesClass,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.number_of_employees_class
                        ? selectedRowDataCompany?.number_of_employees_class
                        : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <select
                      name="position_class"
                      id="position_class"
                      className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                      value={inputEmployeesClass}
                      onChange={(e) => setInputEmployeesClass(e.target.value)}
                    >
                      <option value="">全て選択</option>
                      <option value="A*">A 1000名以上</option>
                      <option value="B*">B 500~999名</option>
                      <option value="C*">C 300~499名</option>
                      <option value="D*">D 200~299名</option>
                      <option value="E*">E 100~199名</option>
                      <option value="F*">F 50~99名</option>
                      <option value="G*">G 1~49名</option>
                      {/* <option value="">回答を選択してください</option> */}
                      {/* <option value="A 1000名以上">A 1000名以上</option>
                      <option value="B 500~999名">B 500~999名</option>
                      <option value="C 300~499名">C 300~499名</option>
                      <option value="D 200~299名">D 200~299名</option>
                      <option value="E 100~199名">E 100~199名</option>
                      <option value="F 50~99名">F 50~99名</option>
                      <option value="G 1~49名">G 1~49名</option> */}
                    </select>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "number_of_employees_class" && (
                    <>
                      <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => {
                          // setInputEmployeesClass(e.target.value);
                          handleChangeSelectUpdateField({
                            e,
                            fieldName: "number_of_employees_class",
                            value: e.target.value,
                            id: selectedRowDataCompany?.id,
                          });
                        }}
                      >
                        {/* <option value="">全て選択</option> */}
                        <option value="A 1000名以上">A 1000名以上</option>
                        <option value="B 500-999名">B 500-999名</option>
                        <option value="C 300-499名">C 300-499名</option>
                        <option value="D 200-299名">D 200-299名</option>
                        <option value="E 100-199名">E 100-199名</option>
                        <option value="F 50-99名">F 50-99名</option>
                        <option value="G 1-49名">G 1-49名</option>
                      </select>
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "number_of_employees_class" && (
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

            {/* 住所 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>○住所</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "address" && (
                    <span
                      className={`${styles.textarea_value} h-[45px] ${
                        isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`
                      }`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "address",
                          dispatch: setInputAddress,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.address ? selectedRowDataCompany?.address : ""}
                    </span>
                  )}
                  {/* サーチ */}
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
                  {/* ============= フィールドエディットモード関連 住所 ============= */}
                  {/* フィールドエディットモード textareaタグ */}
                  {!searchMode && isEditModeField === "address" && (
                    <>
                      <textarea
                        name="address"
                        id="address"
                        cols={30}
                        // rows={10}
                        placeholder=""
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.address}`}
                        value={inputAddress}
                        onChange={(e) => setInputAddress(e.target.value)}
                        // onBlur={() => setInputAddress(formatJapaneseAddress(inputDepartment.trim()))}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) =>
                          handleKeyDownUpdateFieldTextarea({
                            e,
                            fieldName: "address",
                            // value: inputAddress,
                            value: formatJapaneseAddress(inputAddress.trim()),
                            id: selectedRowDataCompany?.id,
                            required: true,
                            preventNewLine: true,
                          })
                        }
                      ></textarea>
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputAddress}
                          setInputState={setInputAddress}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "address",
                              // value: inputAddress,
                              value: formatJapaneseAddress(inputAddress.trim()),
                              id: selectedRowDataCompany?.id,
                              required: true,
                            })
                          }
                          required={true}
                          btnPositionY="bottom-[8px]"
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "address" && (
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
                <div className={`${styles.underline} `}></div>
              </div>
            </div>

            {/* 資本金・設立 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>資本金(万円)</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "capital" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "capital",
                          dispatch: setInputCapital,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                      {selectedRowDataCompany?.capital
                        ? convertToJapaneseCurrencyFormat(selectedRowDataCompany.capital)
                        : ""}
                    </span>
                  )}
                  {/* サーチ */}
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
                            : // ?  (convertToMillions(inputCapital.trim()) as number).toString()
                              ""
                        )
                      }
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "capital" && (
                    <>
                      <input
                        type="text"
                        placeholder="例：10億円/1000万円"
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                        value={inputCapital}
                        onChange={(e) => setInputCapital(e.target.value)}
                        // onBlur={() => {
                        //   setInputCapital(
                        //     !!inputCapital && inputCapital !== ""
                        //       ? (convertToMillions(inputCapital.trim()) as number).toString()
                        //       : ""
                        //   );
                        // }}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) =>
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "capital",
                            // value: inputCapital,
                            value:
                              !!inputCapital && inputCapital !== ""
                                ? (convertToMillions(inputCapital.trim()) as number).toString()
                                : "",
                            id: selectedRowDataCompany?.id,
                            required: false,
                          })
                        }
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputCapital}
                          setInputState={setInputCapital}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "capital",
                              // value: inputCapital,
                              value:
                                !!inputCapital && inputCapital !== ""
                                  ? (convertToMillions(inputCapital.trim()) as number).toString()
                                  : "",
                              id: selectedRowDataCompany?.id,
                              required: false,
                            })
                          }
                          required={true}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "capital" && (
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
              {/* 設立 */}
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>設立</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "established_in" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "established_in",
                          dispatch: setInputFound,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.established_in ? selectedRowDataCompany?.established_in : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputFound}
                      onChange={(e) => setInputFound(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "established_in" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                        value={inputFound}
                        onChange={(e) => setInputFound(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) =>
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "established_in",
                            value: toHalfWidthAndSpace(inputFound.trim()),
                            id: selectedRowDataCompany?.id,
                            required: true,
                          })
                        }
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputFound}
                          setInputState={setInputFound}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "established_in",
                              value: toHalfWidthAndSpace(inputFound.trim()),
                              id: selectedRowDataCompany?.id,
                              required: true,
                            })
                          }
                          required={true}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "established_in" && (
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

            {/* 事業内容 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full`}>
                  <span className={`${styles.title}`}>事業概要</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "business_content" && (
                    <>
                      <span
                        className={`${styles.textarea_value} h-[45px] ${
                          isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`
                        }`}
                        data-text={`${
                          selectedRowDataCompany?.business_content ? selectedRowDataCompany?.business_content : ""
                        }`}
                        // onMouseEnter={(e) => handleOpenTooltip({ e })}
                        // onMouseLeave={handleCloseTooltip}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          handleCloseTooltip();
                          handleDoubleClickField({
                            e,
                            field: "business_content",
                            dispatch: setInputContent,
                            selectedRowDataValue: selectedRowDataCompany?.business_content
                              ? selectedRowDataCompany?.business_content
                              : null,
                          });
                        }}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e });
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataCompany?.business_content
                            ? selectedRowDataCompany.business_content.replace(/\n/g, "<br>")
                            : "",
                        }}
                      >
                        {/* {selectedRowDataCompany?.business_content ? selectedRowDataCompany?.business_content : ""} */}
                      </span>
                    </>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <textarea
                      // name="address"
                      // id="address"
                      cols={30}
                      // rows={10}
                      className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                      value={inputContent}
                      onChange={(e) => setInputContent(e.target.value)}
                    ></textarea>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード textareaタグ */}
                  {!searchMode && isEditModeField === "business_content" && (
                    <>
                      <textarea
                        cols={30}
                        // rows={10}
                        placeholder=""
                        style={{ whiteSpace: "pre-wrap" }}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                        // onCompositionStart={() => setIsComposing(true)}
                        // onCompositionEnd={() => setIsComposing(false)}
                        // onKeyDown={(e) =>
                        //   handleKeyDownUpdateFieldTextarea({
                        //     e,
                        //     fieldName: "business_content",
                        //     value: inputContent.trim(),
                        //     id: selectedRowDataCompany?.id,
                        //     required: false,
                        //     preventNewLine: false,
                        //   })
                        // }
                      ></textarea>
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputContent}
                          setInputState={setInputContent}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "business_content",
                              value: inputContent.trim(),
                              id: selectedRowDataCompany?.id,
                              required: false,
                            })
                          }
                          required={false}
                          isDisplayClose={true}
                          btnPositionY="bottom-[8px]"
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area} ${styles.under_right}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "business_content" && (
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

            {/* HP */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>HP</span>
                  {/* {!searchMode && (
                    <span className={`${styles.value}`}>
                      {selectedRowDataCompany?.website_url ? selectedRowDataCompany?.website_url : ""}
                    </span>
                  )} */}
                  {!searchMode && !!selectedRowDataCompany?.website_url ? (
                    <a
                      href={selectedRowDataCompany.website_url}
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
                      {selectedRowDataCompany.website_url}
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

            {/* Email */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>Email</span>
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
                        if (!selectedRowDataCompany?.email) return;
                        try {
                          await navigator.clipboard.writeText(selectedRowDataCompany.email);
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
                      {selectedRowDataCompany?.email ? selectedRowDataCompany?.email : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
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
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "industry_type" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "industry_type",
                          dispatch: setInputIndustryType,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.industry_type ? selectedRowDataCompany?.industry_type : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && !inputProductL && (
                    <select
                      name="position_class"
                      id="position_class"
                      className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
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
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "industry_type" && (
                    <>
                      <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                        value={inputIndustryType}
                        onChange={(e) => {
                          // setInputEmployeesClass(e.target.value);
                          handleChangeSelectUpdateField({
                            e,
                            fieldName: "industry_type",
                            value: e.target.value,
                            id: selectedRowDataCompany?.id,
                          });
                        }}
                      >
                        {optionsIndustryType.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "industry_type" && (
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

            {/* 製品分類(大分類) */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} !mr-[15px] !min-w-max`}>○製品分類(大分類)</span>
                  {/* ディスプレイ 大分類・中分類は個別に編集できないためエディットモードは無し */}
                  {!searchMode && isEditModeField !== "product_category_large" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "product_category_large",
                          dispatch: setInputProductL,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.product_category_large
                        ? selectedRowDataCompany?.product_category_large
                        : ""}
                    </span>
                  )}
                  {/* サーチ 業種が選択されている場合には製品分類は非表示にする 同時に検索はかけられないように設定 */}
                  {searchMode && !inputIndustryType && (
                    <select
                      name="position_class"
                      id="position_class"
                      className={`ml-auto h-full w-[80%] cursor-pointer ${styles.select_box}`}
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
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "product_category_large" && (
                    <>
                      <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                        value={inputProductL}
                        onChange={async (e) => {
                          // setInputEmployeesClass(e.target.value);
                          await handleChangeSelectUpdateField({
                            e,
                            fieldName: "product_category_large",
                            value: e.target.value,
                            id: selectedRowDataCompany?.id,
                          });
                        }}
                      >
                        {optionsProductL.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateMultipleClientCompanyFields.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "product_category_large" && (
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
            {/* 製品分類(中分類) */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} !mr-[15px] !min-w-max`}>○製品分類(中分類)</span>
                  {!searchMode && !!selectedRowDataCompany && isEditModeField !== "product_category_medium" && (
                    <span
                      className={`${styles.value}  ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "product_category_medium",
                          dispatch: setInputProductM,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.product_category_medium
                        ? selectedRowDataCompany?.product_category_medium
                        : selectedRowDataCompany?.product_category_large
                        ? "-"
                        : ""}
                    </span>
                  )}
                  {!searchMode && !selectedRowDataCompany && isEditModeField !== "product_category_medium" && (
                    <span className={`${styles.value}`}></span>
                  )}
                  {/* サーチ */}
                  {searchMode && !!inputProductL && (
                    <select
                      value={inputProductM}
                      onChange={(e) => setInputProductM(e.target.value)}
                      className={`${inputProductL ? "" : "hidden"} ml-auto h-full w-[80%] cursor-pointer ${
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
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "product_category_medium" && (
                    <>
                      <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                        value={inputProductM}
                        onChange={(e) => {
                          // setInputEmployeesClass(e.target.value);
                          handleChangeSelectUpdateField({
                            e,
                            fieldName: "product_category_medium",
                            value: e.target.value,
                            id: selectedRowDataCompany?.id,
                          });
                        }}
                      >
                        {selectedRowDataCompany?.product_category_large === "電子部品・モジュール" &&
                          productCategoriesM.moduleCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "機械部品" &&
                          productCategoriesM.machinePartsCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "製造・加工機械" &&
                          productCategoriesM.processingMachineryCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "科学・理化学機器" &&
                          productCategoriesM.scienceCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "素材・材料" &&
                          productCategoriesM.materialCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "測定・分析" &&
                          productCategoriesM.analysisCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "画像処理" &&
                          productCategoriesM.imageProcessingCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "制御・電機機器" &&
                          productCategoriesM.controlEquipmentCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "工具・消耗品・備品" &&
                          productCategoriesM.toolCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "設計・生産支援" &&
                          productCategoriesM.designCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "IT・ネットワーク" &&
                          productCategoriesM.ITCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "オフィス" &&
                          productCategoriesM.OfficeCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "業務支援サービス" &&
                          productCategoriesM.businessSupportCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "セミナー・スキルアップ" &&
                          productCategoriesM.skillUpCategoryM.map((option) => option)}
                        {selectedRowDataCompany?.product_category_large === "その他" &&
                          productCategoriesM.othersCategoryM.map((option) => option)}
                      </select>
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "product_category_medium" && (
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
            {/* 製品分類(小分類) */}
            {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} !mr-[5px] !min-w-max`}>○製品分類(小分類)</span>
                  {!searchMode && (
                    <span className={`${styles.value}`}>
                      {selectedRowDataCompany?.product_category_small
                        ? selectedRowDataCompany?.product_category_small
                        : ""}
                    </span>
                  )}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputProductS}
                      onChange={(e) => setInputProductS(e.target.value)}
                    />
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div> */}

            {/* 従業員数・決算月 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className={`flex h-full w-1/2 flex-col pr-[20px]`}>
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>従業員数</span>
                  {/* <span className={`${styles.title}`}>会員専用</span> */}
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "number_of_employees" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "number_of_employees",
                          dispatch: setInputNumberOfEmployees,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.number_of_employees ? selectedRowDataCompany?.number_of_employees : ""}
                    </span>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "number_of_employees" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                        value={inputNumberOfEmployees}
                        onChange={(e) => setInputNumberOfEmployees(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) =>
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "number_of_employees",
                            value: toHalfWidthAndSpace(inputNumberOfEmployees.trim()),
                            id: selectedRowDataCompany?.id,
                            required: true,
                          })
                        }
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputNumberOfEmployees}
                          setInputState={setInputNumberOfEmployees}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "number_of_employees",
                              value: toHalfWidthAndSpace(inputNumberOfEmployees.trim()),
                              id: selectedRowDataCompany?.id,
                              required: true,
                            })
                          }
                          required={true}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "number_of_employees" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                  {/* サーチは従業員数の詳細では必要なし */}

                  {/* {!searchMode && <span className={`${styles.value}`}>有料会員様専用のフィールドです</span>} */}
                  {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  {/* サブスク未加入者にはブラーを表示 */}
                  {/* <div className={`${styles.limited_lock_cover_half} flex-center`}>
                    <FaLock />
                  </div> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              {/* 決算月 */}
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>決算月</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "fiscal_end_month" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "fiscal_end_month",
                          dispatch: setInputFiscal,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.fiscal_end_month ? `${selectedRowDataCompany?.fiscal_end_month}月` : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {/* {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputFiscal}
                      onChange={(e) => setInputFiscal(e.target.value)}
                    />
                  )} */}
                  {searchMode && (
                    <select
                      className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                      value={inputFiscal}
                      onChange={(e) => setInputFiscal(e.target.value)}
                    >
                      <option value="">全て選択</option>
                      {optionsMonth.map((option) => (
                        <option key={option} value={`${option}*`}>
                          {option}月
                        </option>
                      ))}
                    </select>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "fiscal_end_month" && (
                    <>
                      <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                        value={inputFiscal}
                        onChange={(e) => {
                          // setInputEmployeesClass(e.target.value);
                          handleChangeSelectUpdateField({
                            e,
                            fieldName: "fiscal_end_month",
                            value: e.target.value,
                            id: selectedRowDataCompany?.id,
                          });
                        }}
                      >
                        {optionsMonth.map((option) => (
                          <option key={option} value={option}>
                            {option}月
                          </option>
                        ))}
                      </select>
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "fiscal_end_month" && (
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

            {/* 予算申請月1・予算申請月2 🌟自社専用会社のみ表示 一旦無し　実装は後で、 */}

            {/* 主要取引先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要取引先</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "clients" && (
                    <span
                      data-text={`${selectedRowDataCompany?.clients ? selectedRowDataCompany?.clients : ""}`}
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      // onMouseEnter={(e) => handleOpenTooltip({ e })}
                      // onMouseLeave={handleCloseTooltip}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleCloseTooltip();
                        handleDoubleClickField({
                          e,
                          field: "clients",
                          dispatch: setInputClient,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataCompany?.clients ? selectedRowDataCompany?.clients : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputClient}
                      onChange={(e) => setInputClient(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "clients" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                        value={inputClient}
                        onChange={(e) => setInputClient(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "clients",
                            value: toHalfWidthAndSpace(inputClient.trim()),
                            id: selectedRowDataCompany?.id,
                            required: false,
                          });
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputClient}
                          setInputState={setInputClient}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "clients",
                              value: toHalfWidthAndSpace(inputClient.trim()),
                              id: selectedRowDataCompany?.id,
                              required: false,
                            })
                          }
                          required={false}
                          isDisplayClose={true}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "clients" && (
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

            {/* 主要仕入先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要仕入先</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "supplier" && (
                    <span
                      data-text={`${selectedRowDataCompany?.supplier ? selectedRowDataCompany?.supplier : ""}`}
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      // onMouseEnter={(e) => handleOpenTooltip({ e })}
                      // onMouseLeave={handleCloseTooltip}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleCloseTooltip();
                        handleDoubleClickField({
                          e,
                          field: "supplier",
                          dispatch: setInputSupplier,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataCompany?.supplier ? selectedRowDataCompany?.supplier : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputSupplier}
                      onChange={(e) => setInputSupplier(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "supplier" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                        value={inputSupplier}
                        onChange={(e) => setInputSupplier(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "supplier",
                            value: toHalfWidthAndSpace(inputSupplier.trim()),
                            id: selectedRowDataCompany?.id,
                            required: false,
                          });
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputSupplier}
                          setInputState={setInputSupplier}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "supplier",
                              value: toHalfWidthAndSpace(inputSupplier.trim()),
                              id: selectedRowDataCompany?.id,
                              required: false,
                            })
                          }
                          required={false}
                          isDisplayClose={true}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "supplier" && (
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

            {/* 設備 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full`}>
                  <span className={`${styles.title}`}>設備</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "facility" && (
                    <span
                      data-text={`${selectedRowDataCompany?.facility ? selectedRowDataCompany?.facility : ""}`}
                      className={`${styles.textarea_value} h-[45px] ${
                        isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`
                      }`}
                      // onMouseEnter={(e) => handleOpenTooltip({ e })}
                      // onMouseLeave={handleCloseTooltip}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleCloseTooltip();
                        handleDoubleClickField({
                          e,
                          field: "facility",
                          dispatch: setInputFacility,
                          selectedRowDataValue: selectedRowDataCompany?.facility
                            ? selectedRowDataCompany?.facility
                            : null,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        handleCloseTooltip();
                      }}
                      dangerouslySetInnerHTML={{
                        __html: selectedRowDataCompany?.facility
                          ? selectedRowDataCompany?.facility.replace(/\n/g, "<br>")
                          : "",
                      }}
                    >
                      {/* {selectedRowDataCompany?.facility ? selectedRowDataCompany?.facility : ""} */}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <textarea
                      cols={30}
                      // rows={10}
                      className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                      value={inputFacility}
                      onChange={(e) => setInputFacility(e.target.value)}
                    ></textarea>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード textareaタグ */}
                  {!searchMode && isEditModeField === "facility" && (
                    <>
                      <textarea
                        cols={30}
                        // rows={10}
                        placeholder=""
                        style={{ whiteSpace: "pre-wrap" }}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                        value={inputFacility}
                        onChange={(e) => setInputFacility(e.target.value)}
                      ></textarea>
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputFacility}
                          setInputState={setInputFacility}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "facility",
                              value: inputFacility.trim(),
                              id: selectedRowDataCompany?.id,
                              required: false,
                            })
                          }
                          required={false}
                          isDisplayClose={true}
                          btnPositionY="bottom-[8px]"
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area} ${styles.under_right}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "facility" && (
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

            {/* 事業拠点・海外拠点 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>事業拠点</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "business_sites" && (
                    <span
                      data-text={`${
                        selectedRowDataCompany?.business_sites ? selectedRowDataCompany?.business_sites : ""
                      }`}
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      // onMouseEnter={(e) => handleOpenTooltip({ e })}
                      // onMouseLeave={handleCloseTooltip}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleCloseTooltip();
                        handleDoubleClickField({
                          e,
                          field: "business_sites",
                          dispatch: setInputBusinessSite,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataCompany?.business_sites ? selectedRowDataCompany?.business_sites : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputBusinessSite}
                      onChange={(e) => setInputBusinessSite(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "business_sites" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputBusinessSite}
                        onChange={(e) => setInputBusinessSite(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "business_sites",
                            value: toHalfWidthAndSpace(inputBusinessSite.trim()),
                            id: selectedRowDataCompany?.id,
                            required: false,
                          });
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputBusinessSite}
                          setInputState={setInputBusinessSite}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "business_sites",
                              value: toHalfWidthAndSpace(inputBusinessSite.trim()),
                              id: selectedRowDataCompany?.id,
                              required: false,
                            })
                          }
                          required={false}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "business_sites" && (
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
                  <span className={`${styles.title}`}>海外拠点</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "overseas_bases" && (
                    <span
                      data-text={`${
                        selectedRowDataCompany?.overseas_bases ? selectedRowDataCompany?.overseas_bases : ""
                      }`}
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      // onMouseEnter={(e) => handleOpenTooltip({ e })}
                      // onMouseLeave={handleCloseTooltip}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleCloseTooltip();
                        handleDoubleClickField({
                          e,
                          field: "overseas_bases",
                          dispatch: setInputOverseas,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataCompany?.overseas_bases ? selectedRowDataCompany?.overseas_bases : ""}
                    </span>
                  )}
                  {/* サーチモード */}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputOverseas}
                      onChange={(e) => setInputOverseas(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "overseas_bases" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputOverseas}
                        onChange={(e) => setInputOverseas(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "overseas_bases",
                            value: toHalfWidthAndSpace(inputOverseas.trim()),
                            id: selectedRowDataCompany?.id,
                            required: false,
                          });
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputOverseas}
                          setInputState={setInputOverseas}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "overseas_bases",
                              value: toHalfWidthAndSpace(inputOverseas.trim()),
                              id: selectedRowDataCompany?.id,
                              required: false,
                            })
                          }
                          required={false}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "overseas_bases" && (
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

            {/* グループ会社 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>グループ会社</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "group_company" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      data-text={`${
                        selectedRowDataCompany?.group_company ? selectedRowDataCompany?.group_company : ""
                      }`}
                      // onMouseEnter={(e) => handleOpenTooltip({ e })}
                      // onMouseLeave={handleCloseTooltip}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleCloseTooltip();
                        handleDoubleClickField({
                          e,
                          field: "group_company",
                          dispatch: setInputGroup,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        handleOpenTooltip({ e });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        handleCloseTooltip();
                      }}
                    >
                      {selectedRowDataCompany?.group_company ? selectedRowDataCompany?.group_company : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputGroup}
                      onChange={(e) => setInputGroup(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "group_company" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputGroup}
                        onChange={(e) => setInputGroup(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "group_company",
                            value: toHalfWidthAndSpace(inputGroup.trim()),
                            id: selectedRowDataCompany?.id,
                            required: false,
                          });
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputGroup}
                          setInputState={setInputGroup}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "group_company",
                              value: toHalfWidthAndSpace(inputGroup.trim()),
                              id: selectedRowDataCompany?.id,
                              required: false,
                            })
                          }
                          required={false}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "group_company" && (
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

            {/* 法人番号・ID */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>○法人番号</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "corporate_number" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      // onMouseEnter={(e) => handleOpenTooltip({ e })}
                      // onMouseLeave={handleCloseTooltip}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "corporate_number",
                          dispatch: setInputCorporateNum,
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {selectedRowDataCompany?.corporate_number ? selectedRowDataCompany?.corporate_number : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      value={inputCorporateNum}
                      onChange={(e) => setInputCorporateNum(e.target.value)}
                    />
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード inputタグ */}
                  {!searchMode && isEditModeField === "corporate_number" && (
                    <>
                      <input
                        type="text"
                        placeholder=""
                        autoFocus
                        className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                        value={inputCorporateNum}
                        onChange={(e) => setInputCorporateNum(e.target.value)}
                        onCompositionStart={() => setIsComposing(true)}
                        onCompositionEnd={() => setIsComposing(false)}
                        onKeyDown={(e) => {
                          handleKeyDownUpdateField({
                            e,
                            fieldName: "corporate_number",
                            value: toHalfWidthAndSpace(inputCorporateNum.trim()),
                            id: selectedRowDataCompany?.id,
                            required: false,
                          });
                        }}
                      />
                      {/* 送信ボタンとクローズボタン */}
                      {!updateClientCompanyFieldMutation.isLoading && (
                        <InputSendAndCloseBtn
                          inputState={inputCorporateNum}
                          setInputState={setInputCorporateNum}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "corporate_number",
                              value: toHalfWidthAndSpace(inputCorporateNum.trim()),
                              id: selectedRowDataCompany?.id,
                              required: false,
                            })
                          }
                          required={false}
                          isDisplayClose={false}
                        />
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateClientCompanyFieldMutation.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "corporate_number" && (
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
              {/* ID */}
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                {/* <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title_min}`}>ID</span>
                  {!searchMode && (
                    <span className={`${styles.value} truncate`}>
                      {selectedRowDataCompany?.id ? selectedRowDataCompany?.id : ""}
                    </span>
                  )}
                </div>
                <div className={`${styles.underline}`}></div> */}
              </div>
            </div>

            {/* サーチモード時は左側の下に表示 */}
            {searchMode && (
              <>
                {/* 代表者・会長 サーチモード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>代表者</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataCompany?.representative_name
                            ? selectedRowDataCompany?.representative_name
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputRepresentativeName}
                          onChange={(e) => setInputRepresentativeName(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  {/* 会長 サーチ */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>会長</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataCompany?.chairperson ? selectedRowDataCompany?.chairperson : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputChairperson}
                          onChange={(e) => setInputChairperson(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 副社長・専務取締役 サーチモード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>副社長</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataCompany?.senior_vice_president
                            ? selectedRowDataCompany?.senior_vice_president
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputSeniorVicePresident}
                          onChange={(e) => setInputSeniorVicePresident(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  {/* 専務取締役 サーチ */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>専務取締役</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataCompany?.senior_managing_director
                              ? selectedRowDataCompany?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataCompany?.senior_managing_director
                            ? selectedRowDataCompany?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputSeniorManagingDirector}
                          onChange={(e) => setInputSeniorManagingDirector(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 常務取締役・取締役 サーチモード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>常務取締役</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataCompany?.managing_director ? selectedRowDataCompany?.managing_director : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataCompany?.managing_director ? selectedRowDataCompany?.managing_director : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputManagingDirector}
                          onChange={(e) => setInputManagingDirector(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  {/* 取締役 サーチ */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>取締役</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataCompany?.director ? selectedRowDataCompany?.director : ""}`}
                          className={`${styles.value} truncate`}
                          onMouseEnter={(e) => handleOpenTooltip({ e })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataCompany?.director ? selectedRowDataCompany?.director : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputDirector}
                          onChange={(e) => setInputDirector(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 役員・監査役 サーチモード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>役員</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataCompany?.board_member ? selectedRowDataCompany?.board_member : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataCompany?.board_member ? selectedRowDataCompany?.board_member : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputBoardMember}
                          onChange={(e) => setInputBoardMember(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  {/* 監査役 サーチ */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>監査役</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataCompany?.auditor ? selectedRowDataCompany?.auditor : ""}`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataCompany?.auditor ? selectedRowDataCompany?.auditor : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputAuditor}
                          onChange={(e) => setInputAuditor(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 部長・担当者 サーチモード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>部長</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataCompany?.manager ? selectedRowDataCompany?.manager : ""}`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataCompany?.manager ? selectedRowDataCompany?.manager : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputManager}
                          onChange={(e) => setInputManager(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  {/* 担当者サーチ */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>担当者</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataCompany?.member ? selectedRowDataCompany?.member : ""}`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataCompany?.member ? selectedRowDataCompany?.member : ""}
                        </span>
                      )}
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputMember}
                          onChange={(e) => setInputMember(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
              </>
            )}

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
                  <UnderRightActivityLog />
                </Suspense>
              </ErrorBoundary>
              {/* <FallbackUnderRightActivityLog /> */}
              {/* 下エリア 禁止フラグなど */}
              <div
                className={`${styles.right_under_container} h-screen w-full  bg-[#f0f0f0]/[0] ${
                  isOpenSidebar ? `transition-base02` : `transition-base01`
                }`}
              >
                {/* 代表者・会長 サーチモードではない通常モード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>代表者</span>
                      {/* ディスプレイ */}
                      {!searchMode && isEditModeField !== "representative_name" && (
                        <span
                          className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                          data-text={`${
                            selectedRowDataCompany?.representative_name
                              ? selectedRowDataCompany?.representative_name
                              : ""
                          }`}
                          // onMouseEnter={(e) => handleOpenTooltip({ e })}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "representative_name",
                              dispatch: setInputRepresentativeName,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataCompany?.representative_name
                            ? selectedRowDataCompany?.representative_name
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "representative_name" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputRepresentativeName}
                            onChange={(e) => setInputRepresentativeName(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "representative_name",
                                value: toHalfWidthAndSpace(inputRepresentativeName.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateClientCompanyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputRepresentativeName}
                              setInputState={setInputRepresentativeName}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "representative_name",
                                  value: toHalfWidthAndSpace(inputRepresentativeName.trim()),
                                  id: selectedRowDataCompany?.id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateClientCompanyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "representative_name" && (
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
                  {/* 会長 通常 */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>会長</span>
                      {/* ディスプレイ */}
                      {!searchMode && isEditModeField !== "chairperson" && (
                        <span
                          className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                          data-text={`${
                            selectedRowDataCompany?.chairperson ? selectedRowDataCompany?.chairperson : ""
                          }`}
                          // onMouseEnter={(e) => handleOpenTooltip({ e })}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "chairperson",
                              dispatch: setInputChairperson,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataCompany?.chairperson ? selectedRowDataCompany?.chairperson : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "chairperson" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputChairperson}
                            onChange={(e) => setInputChairperson(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "chairperson",
                                value: toHalfWidthAndSpace(inputChairperson.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateClientCompanyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputChairperson}
                              setInputState={setInputChairperson}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "chairperson",
                                  value: toHalfWidthAndSpace(inputChairperson.trim()),
                                  id: selectedRowDataCompany?.id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateClientCompanyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "chairperson" && (
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

                {/* 副社長・専務取締役 サーチモードではない通常モード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>副社長</span>
                      {/* ディスプレイ */}
                      {!searchMode && isEditModeField !== "senior_vice_president" && (
                        <span
                          className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                          data-text={`${
                            selectedRowDataCompany?.senior_vice_president
                              ? selectedRowDataCompany?.senior_vice_president
                              : ""
                          }`}
                          // onMouseEnter={(e) => handleOpenTooltip({ e })}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "senior_vice_president",
                              dispatch: setInputSeniorVicePresident,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataCompany?.senior_vice_president
                            ? selectedRowDataCompany?.senior_vice_president
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "senior_vice_president" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputSeniorVicePresident}
                            onChange={(e) => setInputSeniorVicePresident(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "senior_vice_president",
                                value: toHalfWidthAndSpace(inputSeniorVicePresident.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateClientCompanyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputSeniorVicePresident}
                              setInputState={setInputSeniorVicePresident}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "senior_vice_president",
                                  value: toHalfWidthAndSpace(inputSeniorVicePresident.trim()),
                                  id: selectedRowDataCompany?.id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateClientCompanyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "senior_vice_president" && (
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
                  {/* 専務取締役 通常 */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>専務取締役</span>
                      {/* ディスプレイ */}
                      {!searchMode && isEditModeField !== "senior_managing_director" && (
                        <span
                          data-text={`${
                            selectedRowDataCompany?.senior_managing_director
                              ? selectedRowDataCompany?.senior_managing_director
                              : ""
                          }`}
                          className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                          // onMouseEnter={(e) => handleOpenTooltip({ e })}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "senior_managing_director",
                              dispatch: setInputSeniorManagingDirector,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataCompany?.senior_managing_director
                            ? selectedRowDataCompany?.senior_managing_director
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "senior_managing_director" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputSeniorManagingDirector}
                            onChange={(e) => setInputSeniorManagingDirector(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "senior_managing_director",
                                value: toHalfWidthAndSpace(inputSeniorManagingDirector.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateClientCompanyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputSeniorManagingDirector}
                              setInputState={setInputSeniorManagingDirector}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "senior_managing_director",
                                  value: toHalfWidthAndSpace(inputSeniorManagingDirector.trim()),
                                  id: selectedRowDataCompany?.id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateClientCompanyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "senior_managing_director" && (
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

                {/* 常務取締役・取締役 サーチモードではない通常モード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>常務取締役</span>
                      {/* ディスプレイ */}
                      {!searchMode && isEditModeField !== "managing_director" && (
                        <span
                          data-text={`${
                            selectedRowDataCompany?.managing_director ? selectedRowDataCompany?.managing_director : ""
                          }`}
                          className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                          // onMouseEnter={(e) => handleOpenTooltip({ e })}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "managing_director",
                              dispatch: setInputManagingDirector,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataCompany?.managing_director ? selectedRowDataCompany?.managing_director : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "managing_director" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputManagingDirector}
                            onChange={(e) => setInputManagingDirector(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "managing_director",
                                value: toHalfWidthAndSpace(inputManagingDirector.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateClientCompanyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputManagingDirector}
                              setInputState={setInputManagingDirector}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "managing_director",
                                  value: toHalfWidthAndSpace(inputManagingDirector.trim()),
                                  id: selectedRowDataCompany?.id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateClientCompanyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "managing_director" && (
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
                  {/* 取締役 通常 */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>取締役</span>
                      {/* ディスプレイ */}
                      {!searchMode && isEditModeField !== "director" && (
                        <span
                          className={`${styles.value} truncate ${
                            isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`
                          }`}
                          data-text={`${selectedRowDataCompany?.director ? selectedRowDataCompany?.director : ""}`}
                          // onMouseEnter={(e) => handleOpenTooltip({ e })}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "director",
                              dispatch: setInputDirector,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataCompany?.director ? selectedRowDataCompany?.director : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "director" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputDirector}
                            onChange={(e) => setInputDirector(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "director",
                                value: toHalfWidthAndSpace(inputDirector.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateClientCompanyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputDirector}
                              setInputState={setInputDirector}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "director",
                                  value: toHalfWidthAndSpace(inputDirector.trim()),
                                  id: selectedRowDataCompany?.id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateClientCompanyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "director" && (
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

                {/* 役員・監査役 サーチモードではない通常モード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>役員</span>
                      {/* ディスプレイ */}
                      {!searchMode && isEditModeField !== "board_member" && (
                        <span
                          data-text={`${
                            selectedRowDataCompany?.board_member ? selectedRowDataCompany?.board_member : ""
                          }`}
                          className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                          // onMouseEnter={(e) => handleOpenTooltip({ e })}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "board_member",
                              dispatch: setInputBoardMember,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataCompany?.board_member ? selectedRowDataCompany?.board_member : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "board_member" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputBoardMember}
                            onChange={(e) => setInputBoardMember(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "board_member",
                                value: toHalfWidthAndSpace(inputBoardMember.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateClientCompanyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputBoardMember}
                              setInputState={setInputBoardMember}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "board_member",
                                  value: toHalfWidthAndSpace(inputBoardMember.trim()),
                                  id: selectedRowDataCompany?.id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateClientCompanyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "board_member" && (
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
                      <span className={`${styles.title}`}>監査役</span>
                      {/* ディスプレイ */}
                      {!searchMode && isEditModeField !== "auditor" && (
                        <span
                          data-text={`${selectedRowDataCompany?.auditor ? selectedRowDataCompany?.auditor : ""}`}
                          className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                          // onMouseEnter={(e) => handleOpenTooltip({ e })}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "auditor",
                              dispatch: setInputAuditor,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataCompany?.auditor ? selectedRowDataCompany?.auditor : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "auditor" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputAuditor}
                            onChange={(e) => setInputAuditor(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "auditor",
                                value: toHalfWidthAndSpace(inputAuditor.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateClientCompanyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputAuditor}
                              setInputState={setInputAuditor}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "auditor",
                                  value: toHalfWidthAndSpace(inputAuditor.trim()),
                                  id: selectedRowDataCompany?.id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateClientCompanyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "auditor" && (
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

                {/* 部長・担当者 サーチモードではない通常モード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>部長</span>
                      {/* ディスプレイ */}
                      {!searchMode && isEditModeField !== "manager" && (
                        <span
                          data-text={`${selectedRowDataCompany?.manager ? selectedRowDataCompany?.manager : ""}`}
                          className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                          // onMouseEnter={(e) => handleOpenTooltip({ e })}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "manager",
                              dispatch: setInputManager,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataCompany?.manager ? selectedRowDataCompany?.manager : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "manager" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputManager}
                            onChange={(e) => setInputManager(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "manager",
                                value: toHalfWidthAndSpace(inputManager.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateClientCompanyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputManager}
                              setInputState={setInputManager}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "manager",
                                  value: toHalfWidthAndSpace(inputManager.trim()),
                                  id: selectedRowDataCompany?.id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateClientCompanyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "manager" && (
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
                  {/* 担当者 通常 */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>担当者</span>
                      {/* ディスプレイ */}
                      {!searchMode && isEditModeField !== "member" && (
                        <span
                          data-text={`${selectedRowDataCompany?.member ? selectedRowDataCompany?.member : ""}`}
                          className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                          // onMouseEnter={(e) => handleOpenTooltip({ e })}
                          // onMouseLeave={handleCloseTooltip}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "member",
                              dispatch: setInputMember,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataCompany?.member ? selectedRowDataCompany?.member : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "member" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputMember}
                            onChange={(e) => setInputMember(e.target.value)}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "member",
                                value: toHalfWidthAndSpace(inputMember.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateClientCompanyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputMember}
                              setInputState={setInputMember}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "member",
                                  value: toHalfWidthAndSpace(inputMember.trim()),
                                  id: selectedRowDataCompany?.id,
                                  required: false,
                                })
                              }
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateClientCompanyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "member" && (
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
                {/* TEL要注意フラグ・TEL要注意理由 */}
                {/* <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>TEL要注意</span>

                      <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          // checked={!!checkedColumnHeader} // 初期値
                          checked={!!selectedRowDataCompany?.call_careful_flag}
                          onChange={() => console.log("チェッククリック")}
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
                            selectedRowDataCompany?.call_careful_reason
                              ? selectedRowDataCompany?.call_careful_reason
                              : ""
                          }`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e, "right")}
                          onMouseLeave={handleCloseTooltip}
                          // onDoubleClick={(e) => handleDoubleClick(e, index, columnHeaderItemList[index].columnName)}
                        >
                          {selectedRowDataCompany?.call_careful_reason
                            ? selectedRowDataCompany?.call_careful_reason
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div> */}

                {/* メール禁止フラグ・資料禁止フラグ */}
                {/* <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>メール禁止フラグ</span>

                      <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          // checked={!!checkedColumnHeader} // 初期値
                          checked={!!selectedRowDataCompany?.email_ban_flag}
                          onChange={() => console.log("チェッククリック")}
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
                      <span className={`${styles.check_title}`}>資料禁止フラグ</span>

                      <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          // checked={!!checkedColumnHeader} // 初期値
                          checked={!!selectedRowDataCompany?.sending_ban_flag}
                          onChange={() => console.log("チェッククリック")}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div> */}

                {/* FAX・DM禁止フラグ */}
                {/* <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>FAX・DM禁止フラグ</span>

                      <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          // checked={!!checkedColumnHeader} // 初期値
                          checked={!!selectedRowDataCompany?.fax_dm_ban_flag}
                          onChange={() => console.log("チェッククリック")}
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
                </div> */}

                {/* 禁止理由 */}
                {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>禁止理由</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataCompany?.ban_reason ? selectedRowDataCompany?.ban_reason : ""}`}
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip({e})}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataCompany?.ban_reason ? selectedRowDataCompany?.ban_reason : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div> */}
                {/* クレーム */}
                {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>クレーム</span>
                      {!searchMode && (
                        <span
                          data-text="吾輩は猫である。名前はまだ無い。"
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip({e})}
                          onMouseLeave={handleCloseTooltip}
                        >
                          吾輩は猫である。名前はまだ無い。
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div> */}

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
                  例えば、「&quot;東京都大田区&quot;」の会社で「ホームページ」が存在する会社を検索する場合は、「●住所」に「東京都大田区※」と入力し、「HP」に「is
                  not null」と入力してください。
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「※ アスタリスク」は、「前方一致・後方一致・部分一致」を表します
                </div>
                <div className="flex items-center">
                  <span className="h-full w-[15px]"></span>
                  例えば、会社名に「&quot;工業&quot;」と付く会社を検索したい場合に、「※工業※」、「&quot;精機&quot;」と付く会社は「※精機※」と検索することで、指定した文字が付くデータを検索可能です
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
                {/* <div className="mt-[10px] flex h-[30px] w-full items-center justify-between"> */}
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

export const CompanyMainContainer = memo(CompanyMainContainerMemo);

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
