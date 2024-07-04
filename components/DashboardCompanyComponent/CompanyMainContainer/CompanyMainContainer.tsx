import React, {
  ChangeEvent,
  Dispatch,
  FC,
  FormEvent,
  SetStateAction,
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "../CompanyDetail/CompanyDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
// import { UnderRightActivityLog } from "./UnderRightActivityLog/UnderRightActivityLog";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import dynamic from "next/dynamic";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import productCategoriesM, {
  mappingProductCategoriesMedium,
  productCategoriesMediumIdsSet,
  productCategoriesMediumNameOnlySet,
  productCategoryLargeToMappingMediumMap,
  productCategoryLargeToOptionsMediumMap,
  productCategoryLargeToOptionsMediumObjMap,
} from "@/utils/productCategoryM";
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";
import { BsCheck2 } from "react-icons/bs";
import { FallbackUnderRightActivityLog } from "./UnderRightActivityLog/FallbackUnderRightActivityLog";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import {
  MdClose,
  MdDoNotDisturbAlt,
  MdEdit,
  MdOutlineDeleteOutline,
  MdOutlineDone,
  MdOutlineEdit,
} from "react-icons/md";
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
import { Client_company_row_data, ProductCategoriesLarge, ProductCategoriesMedium } from "@/types";
import { validateAndFormatPhoneNumber } from "@/utils/Helpers/validateAndFormatPhoneNumber";
import { validateAndFormatPostalCode } from "@/utils/Helpers/validateAndFormatPostalCode";
import { formatJapaneseAddress } from "@/utils/Helpers/formatJapaneseAddress";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
// import { optionsIndustryType, optionsMonth, optionsProductL } from "./selectOptionsData";
import { CiEdit } from "react-icons/ci";

// ====================== 擬似テストデータ用 ======================
// https://nextjs-ja-translation-docs.vercel.app/docs/advanced-features/dynamic-import
// デフォルトエクスポートの場合のダイナミックインポート
// const DynamicComponent = dynamic(() => import('../components/hello'));
// 通常
import { UnderRightActivityLog } from "./UnderRightActivityLog/UnderRightActivityLog";
import {
  MonthType,
  NumberOfEmployeesClassType,
  getNumberOfEmployeesClass,
  mappingIndustryType,
  mappingMonth,
  mappingNumberOfEmployeesClass,
  mappingProductL,
  optionsIndustryType,
  optionsMonth,
  optionsNumberOfEmployeesClass,
  optionsProductL,
  optionsProductLNameOnly,
  optionsProductLNameOnlySet,
  productCategoriesLargeIdsSet,
  productCategoryLargeNameToIdMap,
} from "@/utils/selectOptions";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import {
  ProductCategoriesSmall,
  mappingProductCategoriesSmall,
  productCategoriesSmallNameOnlySet,
  productCategoryMediumToMappingSmallMap,
  productCategoryMediumToOptionsSmallMap_All,
  productCategoryMediumToOptionsSmallMap_All_obj,
} from "@/utils/productCategoryS";
import { CustomSelectMultiple } from "@/components/Parts/CustomSelectMultiple/CustomSelectMultiple";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import { zenkakuToHankaku } from "@/utils/Helpers/zenkakuToHankaku";
import { toHalfWidthAndRemoveSpace } from "@/utils/Helpers/toHalfWidthAndRemoveSpace";
import {
  adjustFieldRangeNumeric,
  adjustIsNNN,
  beforeAdjustFieldRangeNumeric,
  beforeAdjustIsNNN,
  copyInputRange,
  isCopyableInputRange,
  isEmptyInputRange,
  setArrayParam,
} from "@/utils/Helpers/MainContainer/commonHelper";
import { LuCopyPlus } from "react-icons/lu";
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
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // サーチモード、編集モード
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  // ツールチップ
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
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
  // const queryClient = useQueryClient();

  // useMutation
  const { updateClientCompanyFieldMutation, updateMultipleClientCompanyFields, updateProductCategoriesFields } =
    useMutateClientCompany();

  // ================================ 🌟useQuery初回マウント時のフェッチ遅延用🌟 ================================
  // const [isReady, setIsReady] = useState(false);
  // useEffect(() => {
  //   setIsReady(true);
  // }, []);
  // ================================ 🌟事業部、係、事業所リスト取得useQuery🌟 ================================
  // const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  // const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  // const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ================================ ✅事業部、係、事業所リスト取得useQuery✅ ================================
  // ================================ 🌟事業部リスト取得useQuery🌟 ================================
  // const {
  //   data: departmentDataArray,
  //   isLoading: isLoadingQueryDepartment,
  //   refetch: refetchQUeryDepartments,
  // } = useQueryDepartments(userProfileState?.company_id, true);

  // useMutation
  // const { createDepartmentMutation, updateDepartmentFieldMutation, deleteDepartmentMutation } = useMutateDepartment();
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟係・チームリスト取得useQuery🌟 ================================
  // const {
  //   data: unitDataArray,
  //   isLoading: isLoadingQueryUnit,
  //   refetch: refetchQUeryUnits,
  // } = useQueryUnits(userProfileState?.company_id, true);

  // useMutation
  // const { createUnitMutation, updateUnitFieldMutation, updateMultipleUnitFieldsMutation, deleteUnitMutation } =
  // useMutateUnit();
  // ================================ ✅係・チームリスト取得useQuery✅ ================================
  // ================================ 🌟事業所・営業所リスト取得useQuery🌟 ================================
  // const {
  //   data: officeDataArray,
  //   isLoading: isLoadingQueryOffice,
  //   refetch: refetchQUeryOffices,
  // } = useQueryOffices(userProfileState?.company_id, true);

  // useMutation
  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅事業所・営業所リスト取得useQuery✅ ================================

  // 配列でサーチするカラム (OR検索)
  // ・規模(ランク)
  // ・業種
  // ・決算月

  // 範囲検索するカラム
  // ・資本金

  // ・数値型(NUMERIC): 資本金、従業員数、価格など
  // ・TIMESTAMPTZ型: 日付と共に開始時間と終了時間の詳細な時間単位での範囲指定が可能
  // WHERE event_timestamp BETWEEN '2024-01-01 08:00:00' AND '2024-01-01 17:00:00';
  // WHERE event_timestamp >= '2024-01-01 08:00:00' AND event_timestamp <= '2024-01-01 17:00:00';
  // ・日付型(DATE)
  // ・TIME型

  // 🌟サブミット
  const [inputName, setInputName] = useState("");
  const [inputDepartment, setInputDepartment] = useState("");
  const [inputTel, setInputTel] = useState("");
  const [inputFax, setInputFax] = useState("");
  const [inputZipcode, setInputZipcode] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  const [inputEmployeesClass, setInputEmployeesClass] = useState("");
  // ----------------------- サーチ配列 規模(ランク) -----------------------
  const [inputEmployeesClassArray, setInputEmployeesClassArray] = useState<NumberOfEmployeesClassType[]>([]);
  const [isNullNotNullEmployeesClass, setIsNullNotNullEmployeesClass] = useState<"is null" | "is not null" | null>(
    null
  );
  const selectedEmployeesClassArraySet = useMemo(() => {
    return new Set([...inputEmployeesClassArray]);
  }, [inputEmployeesClassArray]);
  const getEmployeesClassNameSearch = (option: NumberOfEmployeesClassType) => {
    return mappingNumberOfEmployeesClass[option][language];
  };
  // ----------------------- サーチ配列 規模(ランク) ----------------------- ここまで

  const [inputCapital, setInputCapital] = useState<string>("");
  // ----------------------- 範囲検索 資本金 -----------------------
  const [inputCapitalSearch, setInputCapitalSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ----------------------- 範囲検索 資本金 ----------------------- ここまで
  const [inputFound, setInputFound] = useState("");
  const [inputContent, setInputContent] = useState("");
  const [inputHP, setInputHP] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  // const [inputIndustryType, setInputIndustryType] = useState<number | null>(null);
  const [inputIndustryType, setInputIndustryType] = useState("");
  // ----------------------- サーチ配列 業種(number) -----------------------
  const [inputIndustryTypeArray, setInputIndustryTypeArray] = useState<number[]>([]);
  const [isNullNotNullIndustryType, setIsNullNotNullIndustryType] = useState<"is null" | "is not null" | null>(null);
  const selectedIndustryTypeArraySet = useMemo(() => {
    return new Set([...inputIndustryTypeArray]);
  }, [inputIndustryTypeArray]);
  const getIndustryTypeMonthNameSearch = (option: number) => {
    return mappingIndustryType[option][language];
  };
  // optionsIndustryType
  // ----------------------- サーチ配列 業種(number) -----------------------ここまで

  // ----------------------- 🌟製品分類関連🌟 -----------------------
  // 製品分類 -----------
  // const [inputProductL, setInputProductL] = useState("");
  // const [inputProductM, setInputProductM] = useState("");
  // const [inputProductS, setInputProductS] = useState("");
  // 製品分類に「データあり(ISNOTNULL)」「データなし(ISNULL)」がセットされた場合に使用
  const [isNullNotNullCategoryLarge, setIsNullNotNullCategoryLarge] = useState<"is null" | "is not null" | null>(null);
  const [isNullNotNullCategoryMedium, setIsNullNotNullCategoryMedium] = useState<"is null" | "is not null" | null>(
    null
  );
  const [isNullNotNullCategorySmall, setIsNullNotNullCategorySmall] = useState<"is null" | "is not null" | null>(null);
  // 製品分類 個別フィールドアップデート時の変更前オリジナルの値を保持するref INSERT対象とDELETE対象の判別に必要
  const originalProductCategoriesLargeRef = useRef<ProductCategoriesLarge[] | null>(null);
  const originalProductCategoriesMediumRef = useRef<ProductCategoriesMedium[] | null>(null);
  const originalProductCategoriesSmallRef = useRef<ProductCategoriesSmall[] | null>(null);
  const [inputProductArrayLarge, setInputProductArrayLarge] = useState<ProductCategoriesLarge[]>([]);
  const [inputProductArrayMedium, setInputProductArrayMedium] = useState<ProductCategoriesMedium[]>([]);
  const [inputProductArraySmall, setInputProductArraySmall] = useState<ProductCategoriesSmall[]>([]);
  // カスタムセレクトボックス用にnameのみで選択中のSetオブジェクトを作成
  // ---------------- 🔸大分類🔸 ----------------
  const selectedProductCategoryLargeSet = useMemo(() => {
    return new Set([...inputProductArrayLarge]);
  }, [inputProductArrayLarge]);

  const getProductCategoryLargeName = (option: ProductCategoriesLarge) => {
    return mappingProductL[option][language];
  };

  // ---------------- 🔸中分類🔸 ----------------
  const selectedProductCategoryMediumSet = useMemo(() => {
    return new Set([...inputProductArrayMedium]);
  }, [inputProductArrayMedium]);

  // 中分類のoptions 大分類で複数選択している場合には、選択中の大分類に紐づく全ての中分類をoptionsにセット
  const optionsProductCategoryMediumAll = useMemo(() => {
    const filteredOptionsNameOnly = optionsProductLNameOnly.filter((name) => selectedProductCategoryLargeSet.has(name));
    const newOptionsM = filteredOptionsNameOnly
      .map((option) => {
        return productCategoryLargeToOptionsMediumMap[option];
      })
      .flatMap((array) => array);

    return newOptionsM;
  }, [optionsProductLNameOnly, selectedProductCategoryLargeSet, productCategoryLargeToOptionsMediumMap]);

  // 名称変換マップ
  const mappingProductCategoryMediumAll = useMemo(() => {
    let mappingObj = {} as {
      [x: string]: {
        [key: string]: string;
      };
    };

    Array.from(selectedProductCategoryLargeSet).forEach((name) => {
      mappingObj = { ...mappingObj, ...productCategoryLargeToMappingMediumMap[name] };
    });

    return new Map(Object.entries(mappingObj).map(([key, value]) => [key, value]));
  }, [selectedProductCategoryLargeSet]);

  const getProductCategoryMediumNameAll = (option: ProductCategoriesMedium) => {
    const mappingObj = mappingProductCategoryMediumAll.get(option);
    return mappingObj ? mappingObj[language] : "-";
    // return mappingProductCategoryMediumAll[option][language];
  };

  // 🌠中分類が選択されている状態で大分類のチェックが外された場合には、外された大分類に紐づく中分類を削除する
  useEffect(() => {
    // 大分類に紐づくoptionのみで作成したoptionsProductCategoryMediumAllに含まれていない選択中の中分類は削除
    const optionsProductCategoryMediumAllSet = new Set(optionsProductCategoryMediumAll);
    const newMediumArray = [...inputProductArrayMedium].filter((option) =>
      optionsProductCategoryMediumAllSet.has(option as any)
    );
    console.log("🔥大分類が変更されたため中分類を更新");
    setInputProductArrayMedium(newMediumArray);
  }, [optionsProductCategoryMediumAll]);

  // ---------------- 🔸中分類🔸 ここまで ----------------

  // ---------------- 🔸小分類🔸 ----------------
  const selectedProductCategorySmallSet = useMemo(() => {
    return new Set([...inputProductArraySmall]);
  }, [inputProductArraySmall]);

  // 小分類のoptions 中分類で複数選択している場合には、選択中の中分類に紐づく全ての小分類をoptionsにセット
  const optionsProductCategorySmallAll = useMemo(() => {
    // 取得した現在選択可能な全ての中分類のoptionsから既に選択中の中分類を取得
    const filteredOptionsMediumNameOnly = Array.from(selectedProductCategoryMediumSet);

    // 選択中の中分類の選択肢に紐づく小分類のoptionsを全て取得
    const newOptionsSmall = filteredOptionsMediumNameOnly
      .map((optionName) => {
        // 選択中の大分類に応じて中分類のMapを使用
        return productCategoryMediumToOptionsSmallMap_All[optionName];
      })
      .flatMap((array) => array);

    return newOptionsSmall;
  }, [selectedProductCategoryMediumSet]);

  // 🌠小分類が選択されている状態で中分類のチェックが外された場合には、外された中分類に紐づく小分類を削除する
  useEffect(() => {
    // 中分類に紐づくoptionのみで作成したoptionsProductCategorySmallAllに含まれていない選択中の小分類は削除
    const optionsProductCategorySmallAllSet = new Set(optionsProductCategorySmallAll);
    const newSmallArray = [...inputProductArraySmall].filter((option) =>
      optionsProductCategorySmallAllSet.has(option as any)
    );
    console.log("🔥中分類が変更されたため小分類を更新");
    setInputProductArraySmall(newSmallArray);
  }, [optionsProductCategorySmallAll]);

  // 名称変換マップ
  const mappingProductCategorySmallAll = useMemo(() => {
    let mappingObj = {} as {
      [x: string]: {
        [key: string]: string;
      };
    };

    Array.from(selectedProductCategoryMediumSet).forEach((option) => {
      mappingObj = { ...mappingObj, ...productCategoryMediumToMappingSmallMap[option] };
    });

    return new Map(Object.entries(mappingObj).map(([key, value]) => [key, value]));
  }, [selectedProductCategoryMediumSet]);

  const getProductCategorySmallNameAll = (option: ProductCategoriesSmall) => {
    const mappingObj = mappingProductCategorySmallAll.get(option);
    return mappingObj ? mappingObj[language] : "-";
    // return mappingProductCategorySmallAll[option][language];
  };
  // ---------------- 🔸小分類🔸 ここまで ----------------

  // 🔸上テーブルから選択された行データの各製品分類の配列の要素数が1つ以上の場合は表示用にフォーマットする
  // 大分類
  const formattedProductCategoriesLarge = useMemo(() => {
    if (!selectedRowDataCompany || !selectedRowDataCompany.product_categories_large_array?.length) return "";
    return selectedRowDataCompany.product_categories_large_array
      .map((name) =>
        optionsProductLNameOnlySet.has(name) ? `#${mappingProductL[name as ProductCategoriesLarge][language]}` : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataCompany?.product_categories_large_array]);

  // 中分類
  const formattedProductCategoriesMedium = useMemo(() => {
    if (!selectedRowDataCompany || !selectedRowDataCompany.product_categories_medium_array?.length) return "";
    return selectedRowDataCompany.product_categories_medium_array
      .map((name) =>
        productCategoriesMediumNameOnlySet.has(name)
          ? `#${mappingProductCategoriesMedium[name as ProductCategoriesMedium][language]}`
          : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataCompany?.product_categories_medium_array]);

  // 小分類
  const formattedProductCategoriesSmall = useMemo(() => {
    if (!selectedRowDataCompany || !selectedRowDataCompany.product_categories_small_array?.length) return "";
    return selectedRowDataCompany.product_categories_small_array
      .map((name) =>
        productCategoriesSmallNameOnlySet.has(name)
          ? `#${mappingProductCategoriesSmall[name as ProductCategoriesSmall][language]}`
          : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataCompany?.product_categories_small_array]);

  // 製品分類 -----------ここまで
  // ----------------------- 🌟製品分類関連🌟 ここまで -----------------------

  const [inputFiscal, setInputFiscal] = useState("");
  // ----------------------- サーチ配列 決算月 -----------------------
  const [inputFiscalArray, setInputFiscalArray] = useState<MonthType[]>([]);
  const [isNullNotNullFiscal, setIsNullNotNullFiscal] = useState<"is null" | "is not null" | null>(null);
  const selectedFiscalArraySet = useMemo(() => {
    return new Set([...inputFiscalArray]);
  }, [inputFiscalArray]);
  // optionsMonth
  const getFiscalMonthNameSearch = (option: MonthType) => {
    return mappingMonth[option][language];
  };
  // ----------------------- サーチ配列 決算月 ----------------------- ここまで
  const [inputBudgetRequestMonth1, setInputBudgetRequestMonth1] = useState("");
  const [inputBudgetRequestMonth2, setInputBudgetRequestMonth2] = useState("");
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
  // 従業員数 フィールドエディットモード用
  const [inputNumberOfEmployees, setInputNumberOfEmployees] = useState("");
  // ----------------------- 範囲検索 従業員数 -----------------------
  // 従業員数サーチ用
  const [inputNumberOfEmployeesSearch, setInputNumberOfEmployeesSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ----------------------- 範囲検索 従業員数 ----------------------- ここまで

  // 検索タイプ
  const searchType = useDashboardStore((state) => state.searchType);

  // 編集モードtrueの場合、サーチ条件をinputタグのvalueに格納
  // 新規サーチの場合には、サーチ条件を空にする
  useEffect(() => {
    // if (newSearchCompanyParams === null) return;
    if (isEditModeField) return console.log("フィールドエディットモードのためuseEffectでのinput更新はなしリターン");

    if (editSearchMode && searchMode) {
      if (newSearchCompanyParams === null) return;

      // サーチ編集モードでリプレイス前の値に復元する関数
      const beforeAdjustFieldValue = (value: string | null) => {
        if (value === "") return ""; // 全てのデータ
        if (value === null) return ""; // 全てのデータ
        if (searchType === "manual" && value.includes("\\%")) value = value.replace(/\\%/g, "%"); // \%を%に戻す
        if (searchType === "manual" && value.includes("\\_")) value = value.replace(/\\_/g, "_"); // \_を_に戻す
        if (value.includes("%")) value = value.replace(/\%/g, "＊");
        if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
        if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
        return value;
      };

      // // 🔸範囲検索用の変換 数値型(Numeric Type) 資本金、従業員数、価格など 下限値「~以上」, 上限値 「~以下」
      // const adjustFieldRangeNumeric = (
      //   value: { min: number | null; max: number | null } | "ISNULL" | "ISNOTNULL",
      //   type: "" | "price" | "integer" = ""
      // ): { min: string; max: string } | "is null" | "is not null" => {
      //   if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
      //   if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
      //   const { min, max } = value;

      //   if (min !== null && max !== null) {
      //     if (type === "price") return { min: formatDisplayPrice(min), max: formatDisplayPrice(max) };
      //     if (type === "integer") return { min: parseInt(String(min), 10).toFixed(0), max: max.toFixed(0) };
      //     return { min: String(min), max: String(max) };
      //   } else if (min !== null && max === null) {
      //     if (type === "price") return { min: formatDisplayPrice(min), max: "" };
      //     if (type === "integer") return { min: min.toFixed(0), max: "" };
      //     return { min: String(min), max: "" };
      //   } else if (min === null && max !== null) {
      //     if (type === "price") return { min: "", max: formatDisplayPrice(max) };
      //     if (type === "integer") return { min: "", max: max.toFixed(0) };
      //     return { min: "", max: String(max) };
      //   }
      //   return { min: "", max: "" };
      // };

      // const beforeAdjustIsNNN = (value: "ISNULL" | "ISNOTNULL"): "is null" | "is not null" =>
      //   value === "ISNULL" ? "is null" : "is not null";

      // // 🔸string配列のパラメータをstateにセットする関数
      // const setArrayParam = (
      //   param: string[] | number[] | "ISNULL" | "ISNOTNULL",
      //   dispatch: Dispatch<SetStateAction<any>>,
      //   dispatchNNN: Dispatch<SetStateAction<"is null" | "is not null" | null>>
      // ) => {
      //   if (param === "ISNULL" || param === "ISNOTNULL") {
      //     dispatchNNN(beforeAdjustIsNNN(param));
      //   } else {
      //     dispatch(!!param.length ? param : []);
      //   }
      // };

      console.log(
        "🔥Companyメインコンテナー useEffect 編集モード inputにnewSearchCompanyParamsを格納",
        newSearchCompanyParams
      );
      setInputName(beforeAdjustFieldValue(newSearchCompanyParams.name));
      setInputDepartment(beforeAdjustFieldValue(newSearchCompanyParams.department_name));
      setInputTel(beforeAdjustFieldValue(newSearchCompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchCompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchCompanyParams?.zipcode));
      // サーチ配列 ------------------------
      // setInputEmployeesClass(beforeAdjustFieldValue(newSearchCompanyParams?.number_of_employees_class));
      setArrayParam(
        newSearchCompanyParams?.number_of_employees_class,
        setInputEmployeesClassArray,
        setIsNullNotNullEmployeesClass
      );
      // サーチ配列 ------------------------ ここまで
      setInputAddress(beforeAdjustFieldValue(newSearchCompanyParams?.address));
      // 範囲検索 ------------------------
      // setInputCapital(beforeAdjustFieldValue(newSearchCompanyParams?.capital));
      // setInputCapitalSearch(
      //   beforeAdjustFieldValue(!!newSearchCompanyParams?.capital ? newSearchCompanyParams.capital.toString() : "")
      // );
      setInputCapitalSearch(beforeAdjustFieldRangeNumeric(newSearchCompanyParams?.capital, "price"));
      setInputNumberOfEmployeesSearch(beforeAdjustFieldRangeNumeric(newSearchCompanyParams?.number_of_employees));
      // 範囲検索 ------------------------ ここまで
      setInputFound(beforeAdjustFieldValue(newSearchCompanyParams?.established_in));
      setInputContent(beforeAdjustFieldValue(newSearchCompanyParams?.business_content));
      setInputHP(beforeAdjustFieldValue(newSearchCompanyParams.website_url));
      setInputEmail(beforeAdjustFieldValue(newSearchCompanyParams.email));
      // サーチ配列 ------------------------
      // setInputIndustryType(
      //   beforeAdjustFieldValue(
      //     newSearchCompanyParams.industry_type_id ? newSearchCompanyParams.industry_type_id.toString() : ""
      //   )
      // );
      setArrayParam(newSearchCompanyParams?.industry_type_id, setInputIndustryTypeArray, setIsNullNotNullIndustryType);
      // サーチ配列 ------------------------ ここまで
      // ------------------------ 製品分類関連 ------------------------
      // 編集モードはidからnameへ変換
      // setInputProductL(beforeAdjustFieldValue(newSearchCompanyParams.product_category_large));
      // setInputProductM(beforeAdjustFieldValue(newSearchCompanyParams.product_category_medium));
      // setInputProductS(beforeAdjustFieldValue(newSearchCompanyParams.product_category_small));
      // console.log("製品分類をidからnameへ変換🔥", newSearchCompanyParams.product_category_all_ids);
      // --------------- 製品分類LMSパターン ---------------
      console.log(
        "製品分類をidからnameへ変換🔥",
        newSearchCompanyParams.product_category_large_ids,
        newSearchCompanyParams.product_category_medium_ids,
        newSearchCompanyParams.product_category_small_ids
      );

      // 🔸大分類
      let productCategoryLargeNamesArray: ProductCategoriesLarge[] = [];
      const largeIds = newSearchCompanyParams.product_category_large_ids;
      if (largeIds === "ISNULL" || largeIds === "ISNOTNULL") {
        setIsNullNotNullCategoryLarge(beforeAdjustIsNNN(largeIds));
      } else if (0 < largeIds.length) {
        console.log("============================ 大分類実行🔥", largeIds);
        // idからnameへ変換
        const largeIdToNameMap = new Map(optionsProductL.map((obj) => [obj.id, obj.name]));
        productCategoryLargeNamesArray = largeIds
          .map((id) => {
            return largeIdToNameMap.get(id);
          })
          .filter((name): name is ProductCategoriesLarge => name !== undefined && name !== null);
        setInputProductArrayLarge(productCategoryLargeNamesArray);
      }

      // 🔸中分類
      let productCategoryMediumNamesArray: ProductCategoriesMedium[] = [];
      const mediumIds = newSearchCompanyParams.product_category_medium_ids;
      if (mediumIds === "ISNULL" || mediumIds === "ISNOTNULL") {
        setIsNullNotNullCategoryMedium(beforeAdjustIsNNN(mediumIds));
      } else if (0 < mediumIds.length && 0 < productCategoryLargeNamesArray.length) {
        console.log("============================ 中分類実行🔥", mediumIds, productCategoryLargeNamesArray);
        // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryLargeToOptionsMediumObjMap
        const optionsMediumObj = productCategoryLargeNamesArray
          .map((name) => productCategoryLargeToOptionsMediumObjMap[name])
          .flatMap((array) => array);
        const mediumIdToNameMap = new Map(optionsMediumObj.map((obj) => [obj.id, obj.name]));
        productCategoryMediumNamesArray = mediumIds
          .map((id) => {
            return mediumIdToNameMap.get(id);
          })
          .filter((name): name is ProductCategoriesMedium => name !== undefined && name !== null);
        setInputProductArrayMedium(productCategoryMediumNamesArray);
      }

      // 🔸小分類
      let productCategorySmallNamesArray: ProductCategoriesSmall[] = [];
      const smallIds = newSearchCompanyParams.product_category_small_ids;
      if (smallIds === "ISNULL" || smallIds === "ISNOTNULL") {
        setIsNullNotNullCategorySmall(beforeAdjustIsNNN(smallIds));
      } else if (0 < smallIds.length && 0 < productCategoryMediumNamesArray.length) {
        console.log("============================ 小分類実行🔥");
        // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryMediumToOptionsSmallMap_All_obj
        const optionsSmallObj = productCategoryMediumNamesArray
          .map((name) => productCategoryMediumToOptionsSmallMap_All_obj[name])
          .flatMap((array) => array);
        const mediumIdToNameMap = new Map(optionsSmallObj.map((obj) => [obj.id, obj.name]));
        productCategorySmallNamesArray = smallIds
          .map((id) => {
            return mediumIdToNameMap.get(id);
          })
          .filter((name): name is ProductCategoriesSmall => name !== undefined && name !== null);
        setInputProductArraySmall(productCategorySmallNamesArray);
      }
      // --------------- 製品分類Allパターン ---------------
      // // 🔹全てまとめた製品分類の配列から大中小に配列を分ける
      // const copiedProductCategoryAllIds = [...newSearchCompanyParams.product_category_all_ids];
      // const productCategoryLargeIdsArray: number[] = [];
      // const productCategoryMediumIdsArray: number[] = [];
      // const productCategorySmallIdsArray: number[] = [];
      // copiedProductCategoryAllIds.forEach((id) => {
      //   if (productCategoriesLargeIdsSet.has(id)) {
      //     productCategoryLargeIdsArray.push(id);
      //   } else if (productCategoriesMediumIdsSet.has(id)) {
      //     productCategoryMediumIdsArray.push(id);
      //   } else {
      //     productCategorySmallIdsArray.push(id);
      //   }
      // });

      // // 🔸大分類
      // let productCategoryLargeNamesArray: ProductCategoriesLarge[] = [];
      // if (0 < productCategoryLargeIdsArray.length) {
      //   console.log("============================ 大分類実行🔥", productCategoryLargeIdsArray);
      //   // idからnameへ変換
      //   const largeIdToNameMap = new Map(optionsProductL.map((obj) => [obj.id, obj.name]));
      //   productCategoryLargeNamesArray = productCategoryLargeIdsArray
      //     .map((id) => {
      //       return largeIdToNameMap.get(id);
      //     })
      //     .filter((name): name is ProductCategoriesLarge => name !== undefined && name !== null);
      //   setInputProductArrayLarge(productCategoryLargeNamesArray);
      // }
      // // 🔸中分類
      // let productCategoryMediumNamesArray: ProductCategoriesMedium[] = [];
      // if (0 < productCategoryMediumIdsArray.length && 0 < productCategoryLargeNamesArray.length) {
      //   console.log(
      //     "============================ 中分類実行🔥",
      //     productCategoryMediumIdsArray,
      //     productCategoryLargeNamesArray
      //   );
      //   // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryLargeToOptionsMediumObjMap
      //   const optionsMediumObj = productCategoryLargeNamesArray
      //     .map((name) => productCategoryLargeToOptionsMediumObjMap[name])
      //     .flatMap((array) => array);
      //   const mediumIdToNameMap = new Map(optionsMediumObj.map((obj) => [obj.id, obj.name]));
      //   productCategoryMediumNamesArray = productCategoryMediumIdsArray
      //     .map((id) => {
      //       return mediumIdToNameMap.get(id);
      //     })
      //     .filter((name): name is ProductCategoriesMedium => name !== undefined && name !== null);
      //   setInputProductArrayMedium(productCategoryMediumNamesArray);
      // }
      // // 🔸小分類
      // let productCategorySmallNamesArray: ProductCategoriesSmall[] = [];
      // if (0 < productCategorySmallIdsArray.length && 0 < productCategoryMediumNamesArray.length) {
      //   console.log("============================ 小分類実行🔥");
      //   // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryMediumToOptionsSmallMap_All_obj
      //   const optionsSmallObj = productCategoryMediumNamesArray
      //     .map((name) => productCategoryMediumToOptionsSmallMap_All_obj[name])
      //     .flatMap((array) => array);
      //   const mediumIdToNameMap = new Map(optionsSmallObj.map((obj) => [obj.id, obj.name]));
      //   productCategorySmallNamesArray = productCategorySmallIdsArray
      //     .map((id) => {
      //       return mediumIdToNameMap.get(id);
      //     })
      //     .filter((name): name is ProductCategoriesSmall => name !== undefined && name !== null);
      //   setInputProductArraySmall(productCategorySmallNamesArray);
      // }
      // ------------------------ 製品分類関連 ------------------------ ここまで

      // サーチ配列 ------------------------
      // setInputFiscal(beforeAdjustFieldValue(newSearchCompanyParams.fiscal_end_month));
      setArrayParam(newSearchCompanyParams?.fiscal_end_month, setInputFiscalArray, setIsNullNotNullFiscal);
      // サーチ配列 ------------------------ ここまで
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
      // サーチ配列 規模ランク-----------------------
      // if (!!inputEmployeesClass) setInputEmployeesClass("");
      if (!!inputEmployeesClassArray.length) setInputEmployeesClassArray([]);
      if (isNullNotNullEmployeesClass !== null) setIsNullNotNullEmployeesClass(null);
      // サーチ配列 規模ランク-----------------------ここまで
      if (!!inputAddress) setInputAddress("");
      // if (!!inputCapital) setInputCapital("");
      setInputCapitalSearch({ min: "", max: "" });
      setInputNumberOfEmployeesSearch({ min: "", max: "" });
      if (!!inputFound) setInputFound("");
      if (!!inputContent) setInputContent("");
      if (!!inputHP) setInputHP("");
      if (!!inputEmail) setInputEmail("");
      // サーチ配列 業種 -----------------------
      // if (!!inputIndustryType) setInputIndustryType("");
      if (!!inputIndustryTypeArray.length) setInputIndustryTypeArray([]);
      if (isNullNotNullIndustryType !== null) setIsNullNotNullIndustryType(null);
      // サーチ配列 業種 -----------------------ここまで
      // 製品分類の処理 ------------------------
      // if (!!inputProductL) setInputProductL("");
      // if (!!inputProductM) setInputProductM("");
      // if (!!inputProductS) setInputProductS("");
      if (!!inputProductArrayLarge.length) setInputProductArrayLarge([]);
      if (!!inputProductArrayMedium.length) setInputProductArrayMedium([]);
      if (!!inputProductArraySmall.length) setInputProductArraySmall([]);
      if (isNullNotNullCategoryLarge !== null) setIsNullNotNullCategoryLarge(null);
      if (isNullNotNullCategoryMedium !== null) setIsNullNotNullCategoryMedium(null);
      if (isNullNotNullCategorySmall !== null) setIsNullNotNullCategorySmall(null);
      // 製品分類の処理 ------------------------ ここまで
      // サーチ配列 決算月
      // if (!!inputFiscal) setInputFiscal("");
      if (!!inputFiscalArray.length) setInputFiscalArray([]);
      if (isNullNotNullFiscal !== null) setIsNullNotNullFiscal(null);
      // サーチ配列 決算月ここまで
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

    handleCloseTooltip();

    // フィールド編集モードがtrueならサブミットせずにリターン
    if (isEditModeField) return console.log("サブミット フィールドエディットモードのためリターン");

    console.log("handleSearchSubmit実行 サブミット");

    // // 🔸Asterisks to percent signs for PostgreSQL's LIKE operator
    function adjustFieldValue(value: string | null) {
      if (value === "") return null; // 全てのデータ
      if (value === null) return null; // 全てのデータ
      if (searchType === "manual" && value.includes("%")) value = value.replace(/%/g, "\\%");
      if (searchType === "manual" && value.includes("％")) value = value.replace(/％/g, "\\%");
      if (searchType === "manual" && value.includes("_")) value = value.replace(/_/g, "\\_");
      if (searchType === "manual" && value.includes("＿")) value = value.replace(/＿/g, "\\_");
      if (value.includes("*")) value = value.replace(/\*/g, "%");
      if (value.includes("＊")) value = value.replace(/\＊/g, "%");
      if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
      // if (value === "is not null") return "%%";
      if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
      return value;
    }

    // // 🔸TEXT型以外もIS NULL, IS NOT NULLの条件を追加
    // const adjustFieldValueInteger = (value: string | null): number | "ISNULL" | "ISNOTNULL" | null => {
    //   if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
    //   if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
    //   if (isValidNumber(value) && !isNaN(parseInt(value!, 10))) {
    //     return parseInt(value!, 10);
    //   } else {
    //     return null;
    //   }
    // };

    // // 🔸範囲検索用の変換 数値型(Numeric Type) 資本金、従業員数、価格など 下限値「~以上」, 上限値 「~以下」
    // const adjustFieldRangeNumeric = (
    //   value: { min: string; max: string } | "is null" | "is not null",
    //   formatType: "" | "integer" = ""
    // ): { min: number | null; max: number | null } | "ISNULL" | "ISNOTNULL" => {
    //   if (value === "is null") return "ISNULL";
    //   if (value === "is not null") return "ISNOTNULL";
    //   const { min, max } = value;

    //   const halfMin = toHalfWidthAndRemoveSpace(min).trim();
    //   const halfMax = toHalfWidthAndRemoveSpace(max).trim();

    //   const minValid = isValidNumber(halfMin);
    //   const maxValid = isValidNumber(halfMax);

    //   const minNum = formatType === "integer" ? parseInt(halfMin, 10) : Number(halfMin!);
    //   const maxNum = formatType === "integer" ? parseInt(halfMax, 10) : Number(halfMax!);

    //   console.log("value", value, min, halfMin, minNum, minValid, max, halfMax, maxNum, maxValid);

    //   if (minValid && maxValid) {
    //     if (isNaN(minNum) || isNaN(maxNum)) throw new Error(`数値が適切ではありません。適切な数値を入力してください。`);
    //     if (minNum! <= maxNum!) {
    //       return { min: minNum, max: maxNum };
    //     } else {
    //       const errorMsg =
    //         language === "ja"
    //           ? "数値の下限値が上限値を上回っています。上限値を下限値と同じかそれ以上に設定してください。"
    //           : "The minimum value cannot be greater than the maximum value.";
    //       throw new Error(errorMsg);
    //     }
    //   } else if (minValid && !maxValid) {
    //     if (isNaN(minNum)) throw new Error(`数値が適切ではありません。適切な数値を入力してください。`);
    //     return { min: minNum, max: null };
    //   } else if (!minValid && maxValid) {
    //     if (isNaN(maxNum)) throw new Error(`数値が適切ではありません。適切な数値を入力してください。`);
    //     return { min: null, max: maxNum };
    //   }

    //   return { min: null, max: null };
    // };

    // // 🔸範囲検索用の変換 TIMESTAMPTZ型 活動日、面談日
    // const adjustFieldRangeTIMESTAMPTZ = (
    //   value: { min: Date | null; max: Date | null } | "is null" | "is not null"
    // ): { min: string | null; max: string | null } | "ISNULL" | "ISNOTNULL" => {
    //   if (value === "is null") return "ISNULL";
    //   if (value === "is not null") return "ISNOTNULL";
    //   const { min, max } = value;

    //   if (min instanceof Date && max instanceof Date) {
    //     if (min.getTime() <= max.getTime()) {
    //       return {
    //         min: min.toISOString(),
    //         max: max.toISOString(),
    //       };
    //     } else {
    //       language === "ja"
    //         ? "日付の下限値が上限値を上回っています。上限値を下限値と同じかそれ以上に設定してください。"
    //         : "The minimum date cannot be later than the maximum date.";
    //       throw new Error("The minimum date cannot be later than the maximum date.");
    //     }
    //   } else if (min instanceof Date && max === null) {
    //     return {
    //       min: min.toISOString(),
    //       max: null,
    //     };
    //   } else if (min === null && max instanceof Date) {
    //     return {
    //       min: null,
    //       max: max.toISOString(),
    //     };
    //   }

    //   return { min: null, max: null };
    // };

    // // 🔸範囲検索用の変換 TIME型 面談開始
    // const adjustFieldRangeTIME = (
    //   value: { min: string | null; max: string | null } | "is null" | "is not null"
    // ): { min: string | null; max: string | null } | "ISNULL" | "ISNOTNULL" => {
    //   if (value === "is null") return "ISNULL";
    //   if (value === "is not null") return "ISNOTNULL";
    //   const { min, max } = value;

    //   // // 00:00 ~ 23:59の形式かチェック
    //   const isValidTime = (time: string | null) => !!time && /^(2[0-3]|[01][0-9]):[0-5][0-9]$/.test(time);
    //   const minValid = isValidTime(min);
    //   const maxValid = isValidTime(max);

    //   // 両方の時間が有効で、上限値が下限値以上であることを確認
    //   if (minValid && maxValid) {
    //     if (min! <= max!) {
    //       return { min: min, max: max };
    //     } else {
    //       const errorMsg =
    //         language === "ja"
    //           ? "時間の下限値が上限値を上回っています。上限値を下限値と同じかそれ以上に設定してください。"
    //           : "The minimum value cannot be greater than the maximum value.";
    //       throw new Error(errorMsg);
    //     }
    //   } else if (minValid && !maxValid) {
    //     return { min: min, max: null };
    //   } else if (!minValid && maxValid) {
    //     return { min: null, max: max };
    //   }

    //   return { min: null, max: null };
    // };

    // // 🔸製品分類用 is null, is not nullをIS NULL, IS NOT NULLに変換
    // const adjustIsNNN = (value: "is null" | "is not null"): "ISNULL" | "ISNOTNULL" =>
    //   value === "is null" ? "ISNULL" : "ISNOTNULL";

    setLoadingGlobalState(true);

    try {
      let _name = adjustFieldValue(inputName);
      let _department_name = adjustFieldValue(inputDepartment);
      let _main_phone_number = adjustFieldValue(inputTel);
      let _main_fax = adjustFieldValue(inputFax);
      let _zipcode = adjustFieldValue(inputZipcode);
      // let _number_of_employees_class = adjustFieldValue(inputEmployeesClass);
      // サーチ配列 TEXT[] ------------
      let _number_of_employees_class = inputEmployeesClassArray;
      // サーチ配列 TEXT[] ------------ここまで
      let _address = adjustFieldValue(inputAddress);
      // 範囲検索 -----------
      // let _capital = adjustFieldValue(inputCapital);
      // let _capital = isValidNumber(inputCapital) ? parseInt(inputCapital, 10) : null;
      // let _capital = adjustFieldValueInteger(inputCapital);
      // let _capital = adjustFieldRangeNumeric(inputCapitalSearch);
      let _capital = adjustFieldRangeNumeric(inputCapitalSearch, "millions");
      let _number_of_employees = adjustFieldRangeNumeric(inputNumberOfEmployeesSearch);
      // 範囲検索 -----------ここまで
      let _established_in = adjustFieldValue(inputFound);
      let _business_content = adjustFieldValue(inputContent);
      let _website_url = adjustFieldValue(inputHP);
      let _email = adjustFieldValue(inputEmail);
      // サーチ配列 number[] -----------
      // let _industry_type_id = isValidNumber(inputIndustryType) ? parseInt(inputIndustryType, 10) : null;
      // let _industry_type_id = adjustFieldValueInteger(inputIndustryType);
      let _industry_type_id = inputIndustryTypeArray;
      // サーチ配列 number[] ------------ここまで
      // // 🔸製品分類の配列内のnameをidに変換してから大中小を全て１つの配列にまとめてセットする
      // let _product_category_large = adjustFieldValue(inputProductL);
      // let _product_category_medium = adjustFieldValue(inputProductM);
      // let _product_category_small = adjustFieldValue(inputProductS);
      // サーチ配列 TEXT[] ------------
      // let _fiscal_end_month = adjustFieldValue(inputFiscal);
      let _fiscal_end_month = inputFiscalArray;
      // サーチ配列 TEXT[] ------------ここまで
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

      // 製品分類の処理 ----------------------------------------------
      // 🔸製品分類の配列内のnameをidに変換してから大中小を全て１つの配列にまとめてセットする
      // 大分類
      let productCategoryLargeIdsArray: number[] = [];
      if (0 < inputProductArrayLarge.length) {
        const largeNameToIdMap = new Map(optionsProductL.map((obj) => [obj.name, obj.id]));
        productCategoryLargeIdsArray = inputProductArrayLarge
          .map((name) => {
            return largeNameToIdMap.get(name);
          })
          .filter((id): id is number => id !== undefined && id !== null);
        console.log("============================ 大分類実行🔥", largeNameToIdMap, productCategoryLargeIdsArray);
      }
      // 中分類
      let productCategoryMediumIdsArray: number[] = [];
      if (0 < inputProductArrayMedium.length) {
        // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryLargeToOptionsMediumObjMap
        const optionsMediumObj = inputProductArrayLarge
          .map((name) => productCategoryLargeToOptionsMediumObjMap[name])
          .flatMap((array) => array);
        const mediumNameToIdMap = new Map(optionsMediumObj.map((obj) => [obj.name, obj.id]));
        productCategoryMediumIdsArray = inputProductArrayMedium
          .map((name) => {
            return mediumNameToIdMap.get(name);
          })
          .filter((id): id is number => id !== undefined && id !== null);
        console.log(
          "============================ 中分類実行🔥",
          optionsMediumObj,
          mediumNameToIdMap,
          productCategoryMediumIdsArray
        );
      }
      // 小分類
      let productCategorySmallIdsArray: number[] = [];
      if (0 < inputProductArraySmall.length) {
        // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryMediumToOptionsSmallMap_All_obj
        const optionsSmallObj = inputProductArrayMedium
          .map((name) => productCategoryMediumToOptionsSmallMap_All_obj[name])
          .flatMap((array) => array);
        const mediumNameToIdMap = new Map(optionsSmallObj.map((obj) => [obj.name, obj.id]));
        productCategorySmallIdsArray = inputProductArraySmall
          .map((name) => {
            return mediumNameToIdMap.get(name);
          })
          .filter((id): id is number => id !== undefined && id !== null);
        console.log(
          "============================ 小分類実行🔥",
          optionsSmallObj,
          mediumNameToIdMap,
          productCategorySmallIdsArray
        );
      }

      // --------------- 製品分類Allパターン ---------------
      // 大分類・中分類・小分類を全て１つの配列にまとめてINSERT => １つにまとめない (サーチ編集の時に大中小をidからそれぞれnameに分ける必要あるため)
      // const productCategoryAllIdsArray = [
      //   ...productCategoryLargeIdsArray,
      //   ...productCategoryMediumIdsArray,
      //   ...productCategorySmallIdsArray,
      // ].sort((a, b) => a - b); // 同じ製品配列の内容でも追加順でキャッシュが異なることが内容にソートをする
      // --------------- 製品分類Allパターン ---------------

      // 製品分類の処理ここまで ----------------------------------------------

      const params = {
        name: _name,
        department_name: _department_name,
        main_phone_number: _main_phone_number,
        main_fax: _main_fax,
        zipcode: _zipcode,
        // サーチ配列 TEXT[] ------------
        // number_of_employees_class: _number_of_employees_class,
        number_of_employees_class:
          isNullNotNullEmployeesClass === null ? _number_of_employees_class : adjustIsNNN(isNullNotNullEmployeesClass),
        // サーチ配列 TEXT[] ------------ここまで
        address: _address,
        // 範囲検索 ------------
        capital: _capital,
        number_of_employees: _number_of_employees,
        // 範囲検索 ------------ここまで
        established_in: _established_in,
        business_content: _business_content,
        website_url: _website_url,
        email: _email,
        // サーチ配列 number[] ------------
        // industry_type_id: _industry_type_id,
        industry_type_id:
          isNullNotNullIndustryType === null ? _industry_type_id : adjustIsNNN(isNullNotNullIndustryType),
        // サーチ配列 number[] ------------ここまで
        // 製品分類 ----------------
        // 🌠製品分類はid(INTEGER)を大中小を全て１つの配列としてまとめてEXISTSでフィルタする
        // product_category_large: _product_category_large,
        // product_category_medium: _product_category_medium,
        // product_category_small: _product_category_small,
        product_category_large_ids:
          isNullNotNullCategoryLarge === null ? productCategoryLargeIdsArray : adjustIsNNN(isNullNotNullCategoryLarge),
        product_category_medium_ids:
          isNullNotNullCategoryMedium === null
            ? productCategoryMediumIdsArray
            : adjustIsNNN(isNullNotNullCategoryMedium),
        product_category_small_ids:
          isNullNotNullCategorySmall === null ? productCategorySmallIdsArray : adjustIsNNN(isNullNotNullCategorySmall),
        // product_category_all_ids: productCategoryAllIdsArray,
        // 製品分類 ---------------- ここまで
        // サーチ配列 TEXT[] ------------
        // fiscal_end_month: _fiscal_end_month,
        fiscal_end_month: isNullNotNullFiscal === null ? _fiscal_end_month : adjustIsNNN(isNullNotNullFiscal),
        // サーチ配列 TEXT[] ------------ここまで
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

      // if (true) {
      //   console.log("------------------------------------------------------------------------");

      //   const paramsText = Object.entries(params)
      //     .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      //     .map(([key, value]) => `${key}:${value === null ? `null` : `${value}`}`)
      //     .join(", ");
      //   console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥params", params, "paramsText", paramsText);
      //   console.log("------------------------------------------------------------------------");

      //   setLoadingGlobalState(false);
      //   return;
      // }

      setInputName("");
      setInputDepartment("");
      setInputTel("");
      setInputFax("");
      setInputZipcode("");
      // サーチ配列
      // setInputEmployeesClass("");
      setInputEmployeesClassArray([]);
      if (isNullNotNullEmployeesClass !== null) setIsNullNotNullEmployeesClass(null);
      // サーチ配列 ここまで
      setInputAddress("");
      // setInputCapital("");
      setInputCapitalSearch({ min: "", max: "" });
      setInputNumberOfEmployeesSearch({ min: "", max: "" });
      setInputFound("");
      setInputContent("");
      setInputHP("");
      setInputEmail("");
      // サーチ配列
      // setInputIndustryType("");
      setInputIndustryTypeArray([]);
      if (isNullNotNullIndustryType !== null) setIsNullNotNullIndustryType(null);
      // サーチ配列 ここまで
      // 製品分類 ----------------
      // 🌠製品分類はid(INTEGER)を大中小を全て１つの配列としてまとめてEXISTSでフィルタする
      // setInputProductL("");
      // setInputProductM("");
      // setInputProductS("");
      setInputProductArrayLarge([]);
      setInputProductArrayMedium([]);
      setInputProductArraySmall([]);
      if (isNullNotNullCategoryLarge !== null) setIsNullNotNullCategoryLarge(null);
      if (isNullNotNullCategoryMedium !== null) setIsNullNotNullCategoryMedium(null);
      if (isNullNotNullCategorySmall !== null) setIsNullNotNullCategorySmall(null);
      // 製品分類 ---------------- ここまで
      // サーチ配列 決算月 -----------------------
      // setInputFiscal("");
      setInputFiscalArray([]);
      if (isNullNotNullFiscal !== null) setIsNullNotNullFiscal(null);
      // サーチ配列 決算月 -----------------------ここまで
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

      // スクロールコンテナを最上部に戻す
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: "auto" });
      }
    } catch (error: any) {
      setLoadingGlobalState(false);
      console.log("❌エラー：", error);
      if (language === "ja") {
        alert(error.message);
      } else {
        let newErrMsg = error.message;
        switch (newErrMsg) {
          case "日付の下限値が上限値を上回っています。上限値を下限値と同じかそれ以上に設定してください。":
            newErrMsg = "The minimum date cannot be later than the maximum date.";
            break;
          case "数値の下限値が上限値を上回っています。上限値を下限値と同じかそれ以上に設定してください。":
            newErrMsg = "The minimum value cannot be greater than the maximum value.";
            break;
          case `数値が適切ではありません。適切な数値を入力してください。`:
            newErrMsg = error.message;
            break;

          default:
            break;
        }
        alert(newErrMsg);
      }
    }
  };

  // ================== 🌟ツールチップ ==================
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
    content?: string;
    content2?: string;
    content3?: string;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display = "top",
    content = "",
    content2,
    content3,
    itemsPosition = "center",
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2Text = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3Text = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosWrap({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      // content: (e.target as HTMLDivElement).dataset.text as string,
      content: content !== "" ? content : ((e.target as HTMLDivElement).dataset.text as string),
      content2: !!content2 ? content2 : content2Text,
      content3: !!content3 ? content3 : content3Text,
      display: display,
      itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (!!hoveredItemPosWrap) setHoveredItemPosWrap(null);
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

        // 自社で作成した会社でない場合はそのままリターン
        if (!isOwnCompany) return;

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
        if (field === "number_of_employees_class") {
          text = selectedRowDataValue;
          console.log("number_of_employees_class", text, selectedRowDataValue);
        }
        dispatch(text); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
        setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
        // if (isSelectChangeEvent) originalOptionRef.current = e.currentTarget.innerText; // selectタグ同じ選択肢選択時の編集モード終了用
      }
    },
    [isOwnCompany, setIsEditModeField]
  );
  // ================== ✅シングルクリック、ダブルクリックイベント ==================

  const handleDoubleClickCategories = () => {
    handleCloseTooltip();
    console.log("ダブルクリック");
    if (setTimeoutRef.current) {
      clearTimeout(setTimeoutRef.current);

      // console.log(e.detail);
      setTimeoutRef.current = null;
      // ダブルクリック時に実行したい処理

      // 自社で作成した会社でない場合はそのままリターン
      if (!isOwnCompany) return;
      // ---------------------- 製品分類ルート ----------------------
      // 製品分類の大中小どれかがダブルクリックされた場合には、大中小すべての値をinputStateにセットして3つ同時にフィールドエディットモードに変更する

      setInputProductArrayLarge(selectedRowDataCompany?.product_categories_large_array ?? []);
      setInputProductArrayMedium(selectedRowDataCompany?.product_categories_medium_array ?? []);
      setInputProductArraySmall(selectedRowDataCompany?.product_categories_small_array ?? []);

      // 変更前の元々の値を保持 送信クリックで元々の値から変更されていない場合には、そのまま閉じるため
      originalProductCategoriesLargeRef.current = selectedRowDataCompany?.product_categories_large_array ?? [];
      originalProductCategoriesMediumRef.current = selectedRowDataCompany?.product_categories_medium_array ?? [];
      originalProductCategoriesSmallRef.current = selectedRowDataCompany?.product_categories_small_array ?? [];

      setIsEditModeField("product_categories"); // クリックされたフィールドの編集モードを開く
      return;

      // ---------------------- 製品分類ルート ここまで ----------------------
    }
  };

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
  // ================== 🌟製品分類専用 個別フィールドをアップデート ==================
  const handleUpdateProductCategories = async () => {
    if (!selectedRowDataCompany || !selectedRowDataCompany.id) {
      alert("会社データを確認できませんでした。 エラー：CMC10");
      setIsEditModeField(null); // エディットモードを終了
      return;
    }
    const originalCategoriesLargeArray = originalProductCategoriesLargeRef.current;
    const originalCategoriesMediumArray = originalProductCategoriesMediumRef.current;
    const originalCategoriesSmallArray = originalProductCategoriesSmallRef.current;
    if (
      !Array.isArray(originalCategoriesLargeArray) ||
      !Array.isArray(originalCategoriesMediumArray) ||
      !Array.isArray(originalCategoriesSmallArray)
    ) {
      alert("製品分類データが確認できませんでした。 エラー：CMC11");
      setIsEditModeField(null); // エディットモードを終了
      return;
    }
    // 元々の値と変更されていなければそのままフィールドエディットモードを終了する
    // originalProductCategoriesAllRef.current.has()

    // 大中小全てnameの状態でひとまとめの配列を作成
    const newProductCategoriesAll = [...inputProductArrayLarge, ...inputProductArrayMedium, ...inputProductArraySmall];
    const originalProductCategoriesAll = new Set([
      ...originalCategoriesLargeArray,
      ...originalCategoriesMediumArray,
      ...originalCategoriesSmallArray,
    ]);
    // 全てのnameが同じならリターン １つでも別のnameが含まれていればその時点で走査を停止しアップデート
    if (
      newProductCategoriesAll.length === originalProductCategoriesAll.size &&
      newProductCategoriesAll.every((name) => originalProductCategoriesAll.has(name))
    ) {
      setIsEditModeField(null); // エディットモードを終了
      return;
    } else {
      // 元々の製品分類から変更されていることが確認できたためアップデート
      // 1. nameをidに変換
      // 2. INSERT対象の製品分類を作成
      // 3. DELETE対象の製品分類を作成

      // 🔸1. nameをidに変換
      // --------------------- 🔸製品分類関連の前処理 ---------------------
      // 🔸製品分類をnameからidに変換して配列にまとめる
      // 大分類
      let productCategoryLargeIdsArray: number[] = []; // INSERT対象
      let originalCategoryLargeIdsArray: number[] = []; // オリジナル
      // const largeNameToIdMap = new Map(optionsProductL.map((obj) => [obj.name, obj.id]));
      // 🔹大分類 new
      if (0 < inputProductArrayLarge.length) {
        // 🔹1. INSERT対象の分類のnameをidに変換
        productCategoryLargeIdsArray = inputProductArrayLarge
          .map((name) => {
            return productCategoryLargeNameToIdMap.get(name);
          })
          .filter((id): id is number => id !== undefined && id !== null);
      }
      // 🔹大分類 original
      if (0 < originalCategoriesLargeArray.length) {
        // 🔹2. オリジナルの分類のnameをidに変換
        originalCategoryLargeIdsArray = originalCategoriesLargeArray
          .map((name) => {
            return productCategoryLargeNameToIdMap.get(name);
          })
          .filter((id): id is number => id !== undefined && id !== null);
      }
      console.log(
        "============================ 大分類実行🔥",
        "オリジナル",
        originalCategoryLargeIdsArray,
        originalCategoriesLargeArray,
        "INSERT",
        productCategoryLargeIdsArray,
        inputProductArrayLarge
      );
      // 中分類
      let productCategoryMediumIdsArray: number[] = []; // INSERT対象
      let originalCategoryMediumIdsArray: number[] = []; // オリジナル
      // 🔹中分類 new
      if (0 < inputProductArrayMedium.length) {
        // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryLargeToOptionsMediumObjMap
        // 🔹1-1.
        const optionsMediumObj = inputProductArrayLarge
          .map((name) => productCategoryLargeToOptionsMediumObjMap[name])
          .flatMap((array) => array);
        const mediumNameToIdMap = new Map(optionsMediumObj.map((obj) => [obj.name, obj.id]));
        // 🔹1-2. INSERT対象の分類のnameをidに変換
        productCategoryMediumIdsArray = inputProductArrayMedium
          .map((name) => {
            return mediumNameToIdMap.get(name);
          })
          .filter((id): id is number => id !== undefined && id !== null);
      }
      // 🔹中分類 original
      if (0 < originalCategoriesMediumArray.length) {
        // 🔹2-1. オリジナルの選択中の大分類から中分類の配列を取得してMapオブジェクトを作成
        const originalOptionsMediumObj = originalCategoriesLargeArray
          .map((name) => productCategoryLargeToOptionsMediumObjMap[name])
          .flatMap((array) => array);
        const originalMediumNameToIdMap = new Map(originalOptionsMediumObj.map((obj) => [obj.name, obj.id]));
        // 🔹2. オリジナルの分類のnameをidに変換
        originalCategoryMediumIdsArray = originalCategoriesMediumArray
          .map((name) => {
            return originalMediumNameToIdMap.get(name);
          })
          .filter((id): id is number => id !== undefined && id !== null);
      }
      console.log(
        "============================ 中分類実行🔥",
        "オリジナル",
        originalCategoryMediumIdsArray,
        originalCategoriesMediumArray,
        "INSERT",
        productCategoryMediumIdsArray,
        inputProductArrayMedium
      );
      // 小分類
      let productCategorySmallIdsArray: number[] = []; // INSERT対象
      let originalCategorySmallIdsArray: number[] = []; // オリジナル
      // 🔹小分類 new
      if (0 < inputProductArraySmall.length) {
        // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryMediumToOptionsSmallMap_All_obj
        // 🔹1-1.
        const optionsSmallObj = inputProductArrayMedium
          .map((name) => productCategoryMediumToOptionsSmallMap_All_obj[name])
          .flatMap((array) => array);
        const smallNameToIdMap = new Map(optionsSmallObj.map((obj) => [obj.name, obj.id]));
        // 🔹1-2. INSERT対象の分類のnameをidに変換
        productCategorySmallIdsArray = inputProductArraySmall
          .map((name) => {
            return smallNameToIdMap.get(name);
          })
          .filter((id): id is number => id !== undefined && id !== null);
      }
      // 🔹小分類 original
      if (0 < originalCategoriesSmallArray.length) {
        // 🔹2-1. オリジナルの選択中の中分類から小分類の配列を取得してMapオブジェクトを作成
        const originalOptionsSmallObj = originalCategoriesMediumArray
          .map((name) => productCategoryMediumToOptionsSmallMap_All_obj[name])
          .flatMap((array) => array);
        const originalSmallNameToIdMap = new Map(originalOptionsSmallObj.map((obj) => [obj.name, obj.id]));
        // 🔹2-2. オリジナルの分類のnameをidに変換
        originalCategorySmallIdsArray = originalCategoriesSmallArray
          .map((name) => {
            return originalSmallNameToIdMap.get(name);
          })
          .filter((id): id is number => id !== undefined && id !== null);
      }
      console.log(
        "============================ 小分類実行🔥",
        "オリジナル",
        originalCategorySmallIdsArray,
        originalCategoriesSmallArray,
        "INSERT",
        productCategorySmallIdsArray,
        inputProductArraySmall
      );

      // 大分類・中分類・小分類を全て１つの配列にまとめる
      const productCategoryAllIdsArray = [
        ...productCategoryLargeIdsArray,
        ...productCategoryMediumIdsArray,
        ...productCategorySmallIdsArray,
      ];

      // 1. オリジナルの製品分類に存在せず、現在選択中の製品分類配列に含まれて製品分類は新たにINSERT
      // 2. オリジナルの製品分類に存在していて、現在選択中の製品分類配列にも含まれている場合はON CONFLICTで衝突してDO NOTHINGでそのまま
      // 3. オリジナルの製品分類に存在していて、現在選択中の製品分類には存在しない製品分類がある場合はDELETEする必要あり

      // 🔸3のDELETE対象の特定とDELETE用に配列をまとめる
      // オリジナルの製品分類の大中小を全て１つの配列にまとめる
      const originalCategoryAllIdsArray = [
        ...originalCategoryLargeIdsArray,
        ...originalCategoryMediumIdsArray,
        ...originalCategorySmallIdsArray,
      ];

      // 新たに追加されたINSERT対象となる製品分類のみを抽出して配列にまとめる オリジナルに存在しないidのみが新たにINSERT対象のidとなる
      const originalCategoryAllIdsSet = new Set(originalCategoryAllIdsArray);
      const insertCategoryIdsArray = productCategoryAllIdsArray.filter((id) => !originalCategoryAllIdsSet.has(id));

      // 現在選択中の配列のSetオブジェクトを作成し、オリジナル全てのidをチェックし選択中のidに含まれていないidを全て抽出しDELETE対象にする
      const selectedCategoryAllIdsSet = new Set(productCategoryAllIdsArray);
      const deleteCategoryIdsArray = originalCategoryAllIdsArray.filter((id) => !selectedCategoryAllIdsSet.has(id));

      console.log(
        "製品分類 選択中の全ての製品分類",
        productCategoryAllIdsArray,
        "オリジナルの全ての製品分類",
        originalCategoryAllIdsArray,
        "INSERT対象の分類id",
        insertCategoryIdsArray,
        "削除対象の分類id",
        deleteCategoryIdsArray,
        "選択中の製品分類 大分類",
        productCategoryLargeIdsArray,
        inputProductArrayLarge,
        "選択中の製品分類 中分類",
        productCategoryMediumIdsArray,
        inputProductArrayMedium,
        "選択中の製品分類 小分類",
        productCategorySmallIdsArray,
        inputProductArraySmall
      );

      const insertAndDeletePayload = {
        _client_company_id: selectedRowDataCompany.id,
        _insert_product_categories_all_ids: insertCategoryIdsArray,
        _delete_product_categories_all_ids: deleteCategoryIdsArray,
      };

      // if (true) {
      //   console.log("insertAndDeletePayload", insertAndDeletePayload);
      //   console.log("--------------------------------------------------");
      //   setIsEditModeField(null); // エディットモードを終了
      //   return;
      // }

      console.log("🔥insertAndDeletePayload", insertAndDeletePayload);
      console.log("--------------------------------------------------");

      await updateProductCategoriesFields.mutateAsync(insertAndDeletePayload);

      setIsEditModeField(null); // エディットモードを終了
      // --------------------- 🔸製品分類関連の前処理 ここまで ---------------------
    }
  };
  // ================== 🌟製品分類専用 個別フィールドをアップデート ここまで ==================

  // 資本金の変換をメモ化
  const convertedCapital = useMemo(() => {
    return selectedRowDataCompany?.capital ? convertToJapaneseCurrencyFormat(selectedRowDataCompany.capital) : "";
  }, [selectedRowDataCompany?.capital]);

  // フィールドエディットタイトル
  const fieldEditTitle = (title: string) => (isEditModeField === title ? `${styles.field_edit}` : ``);

  // -------------------------- 🌠サーチモード input下の追加エリア関連🌠 --------------------------
  // ツールチップ
  const additionalInputTooltipText = (index: number) =>
    index === 0 ? `空欄以外のデータのみ抽出` : `空欄のデータのみ抽出`;

  // 🔸「入力値をリセット」をクリック
  const handleClickResetInput = (
    dispatch: Dispatch<SetStateAction<any>>,
    inputType: "string" | "range_string" | "array" = "string"
  ) => {
    handleCloseTooltip();

    if (inputType === "array") {
      dispatch([]);
    } else if (inputType === "range_string") {
      dispatch({ min: "", max: "" });
    } else if (inputType === "string") {
      dispatch("");
    }
  };

  // 🔸配列用「入力値をリセット」
  const handleResetArray = (
    fieldName:
      | "category_large"
      | "category_medium"
      | "category_small"
      | "number_of_employees_class"
      | "fiscal_end_month"
      | "industry_type_id"
  ) => {
    if (fieldName === "category_large") {
      if (isNullNotNullCategoryLarge !== null) setIsNullNotNullCategoryLarge(null);
      if (0 < inputProductArrayLarge.length) setInputProductArrayLarge([]);
    }
    if (fieldName === "category_medium") {
      if (isNullNotNullCategoryMedium !== null) setIsNullNotNullCategoryMedium(null);
      if (0 < inputProductArrayMedium.length) setInputProductArrayMedium([]);
    }
    if (fieldName === "category_small") {
      if (isNullNotNullCategorySmall !== null) setIsNullNotNullCategorySmall(null);
      if (0 < inputProductArraySmall.length) setInputProductArraySmall([]);
    }
    if (fieldName === "number_of_employees_class") {
      if (isNullNotNullEmployeesClass !== null) setIsNullNotNullEmployeesClass(null);
      if (0 < inputEmployeesClassArray.length) setInputEmployeesClassArray([]);
    }
    if (fieldName === "industry_type_id") {
      if (isNullNotNullIndustryType !== null) setIsNullNotNullIndustryType(null);
      if (0 < inputIndustryTypeArray.length) setInputIndustryTypeArray([]);
    }
    if (fieldName === "fiscal_end_month") {
      if (isNullNotNullFiscal !== null) setIsNullNotNullFiscal(null);
      if (0 < inputFiscalArray.length) setInputFiscalArray([]);
    }
  };

  // 🔸製品分類全てリセット
  const resetProductCategories = (type: "lms" | "ms" | "s") => {
    if (type === "lms" && 0 < inputProductArrayLarge.length) setInputProductArrayLarge([]);
    if (["lms", "ms"].includes(type) && 0 < inputProductArrayMedium.length) setInputProductArrayMedium([]);
    if (["lms", "ms", "s"].includes(type) && 0 < inputProductArraySmall.length) setInputProductArraySmall([]);
  };

  // 🔸「入力有り」をクリック
  const handleClickIsNotNull = (
    dispatch: Dispatch<SetStateAction<any>>
    // inputType: "" | "category_large" | "category_medium" | "category_small" | "number_of_employees_class" = ""
  ) => {
    // if (inputType === "category_large") resetProductCategories("lms");
    // if (inputType === "category_medium") resetProductCategories("ms");
    // if (inputType === "category_small") resetProductCategories("s");
    // if (inputType === "number_of_employees_class") setInputEmployeesClassArray([]);
    return dispatch("is not null");
  };

  // 🔸「入力無し」をクリック
  const handleClickIsNull = (
    dispatch: Dispatch<SetStateAction<any>>
    // inputType: "" | "category_large" | "category_medium" | "category_small" | "number_of_employees_class" = ""
  ) => {
    // if (inputType === "category_large") resetProductCategories("lms");
    // if (inputType === "category_medium") resetProductCategories("ms");
    // if (inputType === "category_small") resetProductCategories("s");
    // if (inputType === "number_of_employees_class") setInputEmployeesClassArray([]);
    return dispatch("is null");
  };

  // 🔸「入力有り」 or 「入力無し」をクリック
  const handleClickAdditionalAreaBtn = (
    index: number,
    dispatch: Dispatch<SetStateAction<any>>,
    type:
      | ""
      | "category_large"
      | "category_medium"
      | "category_small"
      | "number_of_employees_class"
      | "fiscal_end_month"
      | "industry_type_id" = ""
  ) => {
    if (type === "category_large") resetProductCategories("lms");
    if (type === "category_medium") resetProductCategories("ms");
    if (type === "category_small") resetProductCategories("s");
    if (type === "number_of_employees_class") setInputEmployeesClassArray([]);
    if (type === "industry_type_id") setInputIndustryTypeArray([]);
    if (type === "fiscal_end_month") setInputFiscalArray([]);

    if (index === 0) dispatch("is not null");
    if (index === 1) dispatch("is null");
    // if (index === 0) handleClickIsNotNull(dispatch, type);
    // if (index === 1) handleClickIsNull(dispatch, type);
    handleCloseTooltip();
  };

  const nullNotNullIconMap: { [key: string]: React.JSX.Element } = {
    "is null": <MdDoNotDisturbAlt className="pointer-events-none mr-[6px] text-[15px]" />,
    "is not null": <BsCheck2 className="pointer-events-none mr-[6px] stroke-[1] text-[15px]" />,
  };
  const nullNotNullTextMap: { [key: string]: string } = {
    "is null": `空欄のデータ`,
    "is not null": `空欄でないデータ`,
  };

  const firstLineComponents = [
    <>
      <MdOutlineDone className="pointer-events-none text-[15px] text-[#fff]" />
      <span>データ有り</span>
    </>,
    <>
      <MdDoNotDisturbAlt className="pointer-events-none text-[14px] text-[#fff]" />
      <span>データ無し</span>
    </>,
  ];
  // -------------------------- 🌠サーチモード input下の追加エリア関連🌠 --------------------------ここまで

  console.log(
    "🔥 CompanyMainContainerレンダリング searchMode",
    searchMode,
    "newSearchCompanyParams",
    newSearchCompanyParams,
    "selectedRowDataCompany",
    selectedRowDataCompany,
    "inputIndustryTypeArray",
    inputIndustryTypeArray,
    "selectedIndustryTypeArraySet",
    selectedIndustryTypeArraySet,
    "isNullNotNullIndustryType",
    isNullNotNullIndustryType,
    "inputFiscalArray",
    inputFiscalArray,
    "selectedFiscalArraySet",
    selectedFiscalArraySet,
    "isNullNotNullFiscal",
    isNullNotNullFiscal
    // "inputEmployeesClassArray",
    // inputEmployeesClassArray,
    // "isNullNotNullEmployeesClass",
    // isNullNotNullEmployeesClass,
    // "selectedEmployeesClassArraySet",
    // selectedEmployeesClassArraySet,
    // "inputCapitalSearch",
    // inputCapitalSearch,
    // "optionsIndustryType",
    // optionsIndustryType,
    // "inputProductArrayLarge",
    // inputProductArrayLarge,
    // isNullNotNullCategoryLarge,
    // "inputProductArrayMedium",
    // inputProductArrayMedium,
    // isNullNotNullCategoryMedium,
    // "inputProductArraySmall",
    // inputProductArraySmall,
    // isNullNotNullCategorySmall
    // "formattedProductCategoriesLarge",
    // formattedProductCategoriesLarge,
    // "formattedProductCategoriesMedium",
    // formattedProductCategoriesMedium,
    // "formattedProductCategoriesSmall",
    // formattedProductCategoriesSmall
  );

  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <form className={`${styles.main_container} w-full `} onSubmit={handleSearchSubmit}>
      <div className={`absolute left-0 top-[62px] z-10 h-0 w-full`}></div>
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
        ref={scrollContainerRef}
        className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${
          tableContainerSize === "half" && underDisplayFullScreen ? `${styles.height_all}` : ``
        } ${tableContainerSize === "all" && underDisplayFullScreen ? `${styles.height_all}` : ``} ${
          searchMode ? `${styles.is_search_mode}` : ``
        }`}
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
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                            handleOpenTooltip({ e });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
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
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                          handleOpenTooltip({ e });
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        handleCloseTooltip();
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
                                { autoClose: false }
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
                                { autoClose: false }
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
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                    <>
                      {["is null", "is not null"].includes(inputFax) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputFax]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputFax]}</span>
                        </div>
                      ) : (
                        <>
                          <input
                            type="tel"
                            className={`${styles.input_box}`}
                            value={inputFax}
                            onChange={(e) => setInputFax(e.target.value)}
                          />
                        </>
                      )}
                    </>
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
                                autoClose: false,
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
                                autoClose: false,
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
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputFax ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputFax)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputFax)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                      {/* <div className={`line_second`}>
                        <div className={`text_btn`} onClick={() => {}}>
                          <span>データ有り</span>
                        </div>
                        <div className={`text_btn`} onClick={() => {}}>
                          <span>データ無し</span>
                        </div>
                      </div> */}
                    </div>
                    {/* <div
                      className={`fade05_forward absolute left-0 top-[100%] z-[10] hidden h-max min-h-full w-full flex-col items-end justify-start rounded-b-[6px] bg-[var(--color-bg-base)] pl-[10px] pr-[30px] group-hover:flex`}
                    >
                      <div className={`${styles.line_first} flex min-h-[35px] items-center justify-end space-x-[6px]`}>
                        <button
                          type="button"
                          className={`flex-center transition-color03 relative max-h-[25px]  min-h-[25px] min-w-[25px] max-w-[25px] cursor-pointer rounded-full border border-solid border-[#666] bg-[#00000066] text-[11px] font-bold text-[#fff] hover:border-[#ff3b5b] hover:bg-[var(--color-btn-bg-delete)] active:bg-[var(--color-btn-bg-delete-active)]`}
                          // data-text={`設定した時間を削除`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `設定した時間を削除` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => {
                            handleCloseTooltip();
                          }}
                        >
                          <MdOutlineDeleteOutline className="pointer-events-none text-[16px]" />
                        </button>
                        {firstLineComponents
                          .map((_, index) => (
                            <div
                              className={`flex-center max-h-[25px] min-h-[25px] cursor-pointer space-x-[3px] rounded-[6px] border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-btn-brand-f)] px-[10px] text-[11px] text-[#fff] hover:bg-[var(--color-bg-brand-f)]`}
                              onClick={() => {
                                handleCloseTooltip();
                              }}
                              // data-text={`入力`}
                              // onMouseEnter={(e) => handleOpenTooltip({ e })}
                              // onMouseLeave={handleCloseTooltip}
                            >
                              <MdClose className="pointer-events-none text-[15px] text-[#fff]" />
                              <span>時間設定</span>
                            </div>
                          ))}
                      </div>
                      <div className={`${styles.line_second} flex min-h-[35px] flex-wrap items-start justify-end`}>
                        <div
                          className={`flex-center ml-[6px] max-h-[25px] min-h-[25px] min-w-[50px] cursor-pointer rounded-[6px] border-solid px-[8px] text-[11px] text-[var(--color-text-title)] hover:border hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f)] hover:text-[#fff] active:bg-[var(--color-bg-brand-f-deep)]`}
                          onClick={() => {}}
                        >
                          <span>データ有り</span>
                        </div>
                        <div
                          className={`flex-center ml-[6px] max-h-[25px] min-h-[25px] min-w-[50px] cursor-pointer rounded-[6px] border-solid px-[8px] text-[11px] text-[var(--color-text-title)] hover:border hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f)] hover:text-[#fff] active:bg-[var(--color-bg-brand-f-deep)]`}
                          onClick={() => {}}
                        >
                          <span>データ無し</span>
                        </div>
                      </div>
                    </div> */}
                  </>
                )}
              </div>
            </div>

            {/* 郵便番号・規模(ランク) */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                    <>
                      {["is null", "is not null"].includes(inputZipcode) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputZipcode]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputZipcode]}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputZipcode}
                          onChange={(e) => setInputZipcode(e.target.value)}
                        />
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputZipcode ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputZipcode)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputZipcode)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
              {/* 規模(ランク) */}
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${fieldEditTitle("number_of_employees_class")}`}>規模(ﾗﾝｸ)</span>
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
                          selectedRowDataValue: selectedRowDataCompany?.number_of_employees_class,
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
                        ? getNumberOfEmployeesClass(selectedRowDataCompany?.number_of_employees_class)
                        : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <>
                      {isNullNotNullEmployeesClass === "is null" || isNullNotNullEmployeesClass === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[isNullNotNullEmployeesClass]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullEmployeesClass]}</span>
                        </div>
                      ) : (
                        <CustomSelectMultiple
                          stateArray={inputEmployeesClassArray}
                          dispatch={setInputEmployeesClassArray}
                          selectedSetObj={selectedEmployeesClassArraySet}
                          options={optionsNumberOfEmployeesClass}
                          getOptionName={getEmployeesClassNameSearch}
                          withBorder={true}
                          // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                          customClass="font-normal"
                          bgDark={false}
                          maxWidth={`calc(100% - 95px)`}
                          maxHeight={30}
                          // zIndexSelectBox={2000}
                          hideOptionAfterSelect={true}
                        />
                      )}
                      {/* <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                        value={inputEmployeesClass}
                        onChange={(e) => setInputEmployeesClass(e.target.value)}
                      >
                        <option value=""></option>
                        {optionsNumberOfEmployeesClass.map((option) => (
                          <option key={option} value={option + "*"}>
                            {getNumberOfEmployeesClass(option)}
                          </option>
                        ))}
                        <option value="is not null">入力有りのデータのみ</option>
                        <option value="is null">入力無しのデータのみ</option>
                      </select> */}
                    </>
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
                        {optionsNumberOfEmployeesClass.map((option) => (
                          <option key={option} value={option}>
                            {getNumberOfEmployeesClass(option)}
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${
                            isNullNotNullEmployeesClass === null && inputEmployeesClassArray.length === 0
                              ? `hidden`
                              : `flex`
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleResetArray("number_of_employees_class")}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() =>
                              handleClickAdditionalAreaBtn(
                                index,
                                setIsNullNotNullEmployeesClass,
                                "number_of_employees_class"
                              )
                            }
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* 住所 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box} flex h-full ${styles.title_box_lg}`}>
                  <span className={`${styles.title}`}>○住所</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "address" && (
                    <span
                      // className={`${styles.textarea_value} h-[45px] ${
                      //   isOwnCompany ? `cursor-pointer` : ``
                      // }`}
                      className={`${styles.textarea_value} h-[45px]`}
                      // onClick={handleSingleClickField}
                      // onDoubleClick={(e) => {
                      //   handleDoubleClickField({
                      //     e,
                      //     field: "address",
                      //     dispatch: setInputAddress,
                      //   });
                      // }}
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
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                      {convertedCapital}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <>
                      {inputCapitalSearch === "is null" || inputCapitalSearch === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputCapitalSearch]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputCapitalSearch]}</span>
                        </div>
                      ) : (
                        <div
                          className={`flex h-full w-full items-center`}
                          onMouseEnter={(e) => {
                            const content = `「〜以上」は下限値のみ、「〜以下」は上限値のみを\n「〜以上〜以下」で範囲指定する場合は上下限値の両方を入力してください。\n上下限値に同じ値を入力した場合は入力値と一致するデータを抽出します。`;
                            handleOpenTooltip({ e, display: "top", content: content, itemsPosition: `left` });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        >
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            value={inputCapitalSearch.min}
                            onChange={(e) =>
                              setInputCapitalSearch({ min: e.target.value, max: inputCapitalSearch.max })
                            }
                            onBlur={() => {
                              const formatHalfInput = toHalfWidthAndRemoveSpace(inputCapitalSearch.min);
                              const convertedPrice = convertToMillions(formatHalfInput.trim());
                              if (convertedPrice !== null && !isNaN(convertedPrice)) {
                                setInputCapitalSearch({
                                  // min: String(convertedPrice),
                                  min: convertedPrice.toLocaleString(),
                                  max: inputCapitalSearch.max,
                                });
                              } else {
                                setInputCapitalSearch({ min: "", max: inputCapitalSearch.max });
                              }
                            }}
                            onFocus={() =>
                              !!inputCapitalSearch.min &&
                              setInputCapitalSearch({
                                ...inputCapitalSearch,
                                min: inputCapitalSearch.min.replace(/[^\d.]/g, ""),
                              })
                            }
                            onMouseEnter={(e) => {
                              const el = e.currentTarget;
                              if (el.offsetWidth < el.scrollWidth)
                                handleOpenTooltip({ e, content: inputCapitalSearch.min });
                            }}
                            onMouseLeave={handleCloseTooltip}
                          />

                          <span className="mx-[10px]">〜</span>

                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            value={inputCapitalSearch.max}
                            onChange={(e) =>
                              setInputCapitalSearch({ min: inputCapitalSearch.min, max: e.target.value })
                            }
                            onBlur={() => {
                              const formatHalfInput = toHalfWidthAndRemoveSpace(inputCapitalSearch.max);
                              const convertedPrice = convertToMillions(formatHalfInput.trim());

                              if (convertedPrice !== null && !isNaN(convertedPrice)) {
                                setInputCapitalSearch({
                                  min: inputCapitalSearch.min,
                                  //  max: String(convertedPrice)
                                  max: convertedPrice.toLocaleString(),
                                });
                              } else {
                                setInputCapitalSearch({ min: inputCapitalSearch.min, max: "" });
                              }
                            }}
                            onFocus={() =>
                              !!inputCapitalSearch.max &&
                              setInputCapitalSearch({
                                ...inputCapitalSearch,
                                max: inputCapitalSearch.max.replace(/[^\d.]/g, ""),
                              })
                            }
                            onMouseEnter={(e) => {
                              const el = e.currentTarget;
                              if (el.offsetWidth < el.scrollWidth)
                                handleOpenTooltip({ e, content: inputCapitalSearch.max });
                            }}
                            onMouseLeave={handleCloseTooltip}
                          />
                        </div>
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        {isCopyableInputRange(inputCapitalSearch) && (
                          <button
                            type="button"
                            className={`icon_btn_green flex`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => {
                              copyInputRange(setInputCapitalSearch);
                              handleCloseTooltip();
                            }}
                          >
                            <LuCopyPlus className="pointer-events-none text-[14px]" />
                          </button>
                        )}
                        <button
                          type="button"
                          className={`icon_btn_red ${isEmptyInputRange(inputCapitalSearch) ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputCapitalSearch, "range_string")}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputCapitalSearch)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
              {/* 設立 */}
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                    <>
                      {["is null", "is not null"].includes(inputFound) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputFound]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputFound]}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputFound}
                          onChange={(e) => setInputFound(e.target.value)}
                        />
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputFound ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputFound)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputFound)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* 事業概要 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full ${styles.title_box_lg}`}>
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
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
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
                    <>
                      {["is null", "is not null"].includes(inputContent) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputContent]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputContent]}</span>
                        </div>
                      ) : (
                        <textarea
                          cols={30}
                          // rows={10}
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                          value={inputContent}
                          onChange={(e) => setInputContent(e.target.value)}
                        ></textarea>
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div
                      className={`additional_search_area_under_input one_line fade05_forward hidden group-hover:flex`}
                    >
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputContent ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputContent)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputContent)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* HP */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
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
                    <>
                      {["is null", "is not null"].includes(inputHP) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputHP]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputHP]}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          // placeholder="「is not null」でHP有りのデータのみ抽出"
                          value={inputHP}
                          onChange={(e) => setInputHP(e.target.value)}
                        />
                      )}
                    </>
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputHP ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputHP)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputHP)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* Email */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
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
                    <>
                      {["is null", "is not null"].includes(inputEmail) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputEmail]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputEmail]}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputEmail}
                          onChange={(e) => setInputEmail(e.target.value)}
                        />
                      )}
                    </>
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputEmail ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputEmail)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputEmail)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* 業種 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${fieldEditTitle("industry_type_id")}`}>○業種</span>
                  {/* ディスプレイ */}
                  {!searchMode && isEditModeField !== "industry_type_id" && (
                    <span
                      className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "industry_type_id",
                          dispatch: setInputIndustryType,
                          selectedRowDataValue: selectedRowDataCompany?.industry_type_id ?? "",
                        });
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                      }}
                    >
                      {/* {selectedRowDataCompany?.industry_type_id ? selectedRowDataCompany?.industry_type_id : ""} */}
                      {selectedRowDataCompany?.industry_type_id
                        ? mappingIndustryType[selectedRowDataCompany?.industry_type_id][language]
                        : ""}
                    </span>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <>
                      {isNullNotNullIndustryType === "is null" || isNullNotNullIndustryType === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[isNullNotNullIndustryType]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullIndustryType]}</span>
                        </div>
                      ) : (
                        <CustomSelectMultiple
                          stateArray={inputIndustryTypeArray}
                          dispatch={setInputIndustryTypeArray}
                          selectedSetObj={selectedIndustryTypeArraySet}
                          options={optionsIndustryType}
                          getOptionName={getIndustryTypeMonthNameSearch}
                          withBorder={true}
                          // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                          customClass="font-normal"
                          bgDark={false}
                          maxWidth={`calc(100% - 95px)`}
                          maxHeight={30}
                          // zIndexSelectBox={2000}
                          hideOptionAfterSelect={true}
                        />
                      )}
                      {/* <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                        value={inputIndustryType}
                        onChange={(e) => setInputIndustryType(e.target.value)}
                      >
                        <option value=""></option>
                        {optionsIndustryType.map((option) => (
                          <option key={option} value={option.toString()}>
                            {mappingIndustryType[option][language]}
                          </option>
                        ))}
                        <option value="is not null">入力有りのデータのみ</option>
                        <option value="is null">入力無しのデータのみ</option>
                      </select> */}
                    </>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "industry_type_id" && (
                    <>
                      <select
                        className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                        value={inputIndustryType}
                        onChange={(e) => {
                          // setInputEmployeesClass(e.target.value);
                          handleChangeSelectUpdateField({
                            e,
                            fieldName: "industry_type_id",
                            value: e.target.value,
                            id: selectedRowDataCompany?.id,
                          });
                        }}
                      >
                        {optionsIndustryType.map((option) => (
                          <option key={option} value={option}>
                            {mappingIndustryType[option][language]}
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
                  {!searchMode && isEditModeField === "industry_type_id" && (
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${
                            isNullNotNullIndustryType === null && inputIndustryTypeArray.length === 0
                              ? `hidden`
                              : `flex`
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          // onClick={() => handleClickResetInput(setInputIndustryType)}
                          onClick={() => handleResetArray("industry_type_id")}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() =>
                              handleClickAdditionalAreaBtn(index, setIsNullNotNullIndustryType, "industry_type_id")
                            }
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* 製品分類(大分類) */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  {/* <span className={`${styles.title} !mr-[15px] !min-w-max`}>○製品分類(大分類)</span> */}
                  <div
                    className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                      "product_categories"
                    )}`}
                  >
                    <span>製品分類</span>
                    <span>(大分類)</span>
                  </div>
                  {/* ディスプレイ 製品分類はダブルクリックで大中小を全て編集モードに変更して一括で更新する */}
                  {!searchMode && isEditModeField !== "product_categories" && (
                    <>
                      {formattedProductCategoriesLarge !== "" && (
                        <span
                          className={`${styles.value} ${styles.hashtag} ${
                            isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`
                          }`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleDoubleClickCategories();
                          }}
                          data-text={`${formattedProductCategoriesLarge}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {formattedProductCategoriesLarge}
                          {/* {selectedRowDataCompany?.product_category_large
                        ? selectedRowDataCompany?.product_category_large
                        : ""} */}
                        </span>
                      )}
                      {!!selectedRowDataCompany && isOwnCompany && formattedProductCategoriesLarge === "" && (
                        <div
                          className={`flex-center h-full w-full cursor-pointer bg-[#33333300]`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleDoubleClickCategories();
                          }}
                          data-text={`製品分類を追加する`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          <div className={`relative h-[22px] w-[22px] ${styles.editable_icon}`}>
                            <CiEdit
                              className={`pointer-events-none min-h-[22px] min-w-[22px] text-[22px] text-[var(--color-text-sub)]`}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {/* サーチ */}
                  {/* {searchMode && !inputIndustryType && ( */}
                  {searchMode && (
                    <>
                      {isNullNotNullCategoryLarge === "is null" || isNullNotNullCategoryLarge === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[isNullNotNullCategoryLarge]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullCategoryLarge]}</span>
                        </div>
                      ) : (
                        <CustomSelectMultiple
                          stateArray={inputProductArrayLarge}
                          dispatch={setInputProductArrayLarge}
                          selectedSetObj={selectedProductCategoryLargeSet}
                          options={optionsProductLNameOnly}
                          getOptionName={getProductCategoryLargeName}
                          withBorder={true}
                          // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                          customClass="font-normal"
                          bgDark={false}
                          maxWidth={`calc(100% - 95px)`}
                          maxHeight={30}
                          // zIndexSelectBox={2000}
                          hideOptionAfterSelect={true}
                        />
                      )}
                    </>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "product_categories" && (
                    <>
                      {/* <select
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
                      {updateMultipleClientCompanyFields.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )} */}

                      <CustomSelectMultiple
                        stateArray={inputProductArrayLarge}
                        dispatch={setInputProductArrayLarge}
                        selectedSetObj={selectedProductCategoryLargeSet}
                        options={optionsProductLNameOnly}
                        getOptionName={getProductCategoryLargeName}
                        withBorder={true}
                        // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                        customClass="font-normal"
                        bgDark={false}
                        maxWidth={`calc(100% - 95px)`}
                        maxHeight={30}
                        zIndexSelectBox={2000}
                        hideOptionAfterSelect={true}
                      />
                      {/* 送信、バツボタンエリア */}
                      {!updateProductCategoriesFields.isLoading && (
                        <div
                          className={`${styles.field_edit_mode_btn_area} ${
                            !updateProductCategoriesFields.isLoading
                              ? styles.right_position
                              : styles.right_position_loading
                          }  space-x-[6px]`}
                        >
                          {/* 送信ボタン フィールドエディットモード専用 */}
                          <div
                            className={`flex-center transition-bg03 border-[var(--color-bg-brand-f) group min-h-[26px] min-w-[26px] cursor-pointer rounded-full border border-solid border-transparent hover:bg-[var(--color-bg-brand-f)] hover:shadow-lg`}
                            onClick={(e) => {
                              e.currentTarget.parentElement?.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                              handleUpdateProductCategories();
                            }}
                          >
                            <IoIosSend
                              className={`text-[20px] text-[var(--color-bg-brand-f)] group-hover:text-[#fff]`}
                            />
                          </div>
                          {/* バツボタン フィールドエディットモード専用 */}
                          <div
                            className={`${styles.close_btn_field_edit_mode} hover:shadow-lg`}
                            onClick={(e) => {
                              e.currentTarget.parentElement?.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                              setIsEditModeField(null); // エディットモードを終了
                            }}
                          >
                            <MdClose className="text-[20px] " />
                          </div>
                        </div>
                      )}
                      {/* エディットフィールド送信中ローディングスピナー */}
                      {updateProductCategoriesFields.isLoading && (
                        <div
                          className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                        >
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )}
                      {/* {!updateMultipleClientCompanyFields.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )} */}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ */}
                  {!searchMode && isEditModeField === "product_categories" && (
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${
                            isNullNotNullCategoryLarge === null && inputProductArrayLarge.length === 0
                              ? `hidden`
                              : `flex`
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleResetArray("category_large")}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() =>
                              handleClickAdditionalAreaBtn(index, setIsNullNotNullCategoryLarge, "category_large")
                            }
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>
            {/* 製品分類(中分類) */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  {/* <span className={`${styles.title} !mr-[15px] !min-w-max`}>○製品分類(中分類)</span> */}
                  <div
                    className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                      "product_categories"
                    )}`}
                  >
                    <span className={``}>製品分類</span>
                    <span className={``}>(中分類)</span>
                  </div>
                  {!searchMode && !!selectedRowDataCompany && isEditModeField !== "product_categories" && (
                    <>
                      {formattedProductCategoriesMedium !== "" && (
                        <span
                          className={`${styles.value} ${styles.hashtag} ${
                            isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`
                          }`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleDoubleClickCategories();
                          }}
                          data-text={`${formattedProductCategoriesMedium}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {formattedProductCategoriesMedium}
                        </span>
                      )}
                      {!!selectedRowDataCompany && isOwnCompany && formattedProductCategoriesMedium === "" && (
                        <div
                          className={`flex-center h-full w-full cursor-pointer bg-[#33333300]`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleDoubleClickCategories();
                          }}
                          data-text={`製品分類を追加する`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          <div className={`relative h-[22px] w-[22px] ${styles.editable_icon}`}>
                            <CiEdit
                              className={`pointer-events-none min-h-[22px] min-w-[22px] text-[22px] text-[var(--color-text-sub)]`}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <>
                      {isNullNotNullCategoryMedium === "is null" || isNullNotNullCategoryMedium === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[isNullNotNullCategoryMedium]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullCategoryMedium]}</span>
                        </div>
                      ) : (
                        !!inputProductArrayLarge.length && (
                          <CustomSelectMultiple
                            stateArray={inputProductArrayMedium}
                            dispatch={setInputProductArrayMedium}
                            selectedSetObj={selectedProductCategoryMediumSet}
                            options={optionsProductCategoryMediumAll}
                            getOptionName={getProductCategoryMediumNameAll}
                            withBorder={true}
                            // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                            customClass="font-normal"
                            bgDark={false}
                            maxWidth={`calc(100% - 95px)`}
                            maxHeight={30}
                            // zIndexSelectBox={2000}
                            hideOptionAfterSelect={true}
                          />
                        )
                      )}
                    </>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "product_categories" && (
                    <>
                      <CustomSelectMultiple
                        stateArray={inputProductArrayMedium}
                        dispatch={setInputProductArrayMedium}
                        selectedSetObj={selectedProductCategoryMediumSet}
                        options={optionsProductCategoryMediumAll}
                        getOptionName={getProductCategoryMediumNameAll}
                        withBorder={true}
                        // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                        customClass="font-normal"
                        bgDark={false}
                        maxWidth={`calc(100% - 95px)`}
                        maxHeight={30}
                        zIndexSelectBox={2000}
                        hideOptionAfterSelect={true}
                      />
                      {/* {updateMultipleClientCompanyFields.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )} */}
                      {/* エディットフィールド送信中ローディングスピナー */}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ 大分類のオーバーレイを表示 */}
                  {/* {!searchMode && isEditModeField === "product_categories" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )} */}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${
                            isNullNotNullCategoryMedium === null && inputProductArrayMedium.length === 0
                              ? `hidden`
                              : `flex`
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleResetArray("category_medium")}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() =>
                              handleClickAdditionalAreaBtn(index, setIsNullNotNullCategoryMedium, "category_medium")
                            }
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>
            {/* 製品分類(小分類) */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  {/* <span className={`${styles.title} !mr-[5px] !min-w-max`}>○製品分類(小分類)</span> */}
                  <div
                    className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                      "product_categories"
                    )}`}
                  >
                    <span className={``}>製品分類</span>
                    <span className={``}>(小分類)</span>
                  </div>
                  {!searchMode && !!selectedRowDataCompany && isEditModeField !== "product_categories" && (
                    <>
                      {formattedProductCategoriesSmall !== "" && (
                        <span
                          className={`${styles.value} ${styles.hashtag} ${
                            isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`
                          }`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleDoubleClickCategories();
                          }}
                          data-text={`${formattedProductCategoriesSmall}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            console.log(el.scrollWidth, el.offsetWidth, el.scrollHeight, el.offsetHeight);
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {formattedProductCategoriesSmall}
                        </span>
                      )}
                      {!!selectedRowDataCompany && isOwnCompany && formattedProductCategoriesSmall === "" && (
                        <div
                          className={`flex-center h-full w-full cursor-pointer bg-[#33333300]`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            handleDoubleClickCategories();
                          }}
                          data-text={`製品分類を追加する`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          <div className={`relative h-[22px] w-[22px] ${styles.editable_icon}`}>
                            <CiEdit
                              className={`pointer-events-none min-h-[22px] min-w-[22px] text-[22px] text-[var(--color-text-sub)]`}
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}
                  {/* サーチ */}
                  {searchMode && (
                    <>
                      {isNullNotNullCategorySmall === "is null" || isNullNotNullCategorySmall === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[isNullNotNullCategorySmall]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullCategorySmall]}</span>
                        </div>
                      ) : (
                        !!inputProductArrayMedium.length && (
                          <CustomSelectMultiple
                            stateArray={inputProductArraySmall}
                            dispatch={setInputProductArraySmall}
                            selectedSetObj={selectedProductCategorySmallSet}
                            options={optionsProductCategorySmallAll}
                            getOptionName={getProductCategorySmallNameAll}
                            withBorder={true}
                            // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                            customClass="font-normal"
                            bgDark={false}
                            maxWidth={`calc(100% - 95px)`}
                            maxHeight={30}
                            // zIndexSelectBox={2000}
                            hideOptionAfterSelect={true}
                          />
                        )
                      )}
                    </>
                  )}
                  {/* ============= フィールドエディットモード関連 ============= */}
                  {/* フィールドエディットモード selectタグ  */}
                  {!searchMode && isEditModeField === "product_categories" && (
                    <>
                      <CustomSelectMultiple
                        stateArray={inputProductArraySmall}
                        dispatch={setInputProductArraySmall}
                        selectedSetObj={selectedProductCategorySmallSet}
                        options={optionsProductCategorySmallAll}
                        getOptionName={getProductCategorySmallNameAll}
                        withBorder={true}
                        // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                        customClass="font-normal"
                        bgDark={false}
                        maxWidth={`calc(100% - 95px)`}
                        maxHeight={30}
                        zIndexSelectBox={2000}
                        hideOptionAfterSelect={true}
                      />
                      {/* {updateMultipleClientCompanyFields.isLoading && (
                        <div className={`${styles.field_edit_mode_loading_area}`}>
                          <SpinnerComet w="22px" h="22px" s="3px" />
                        </div>
                      )} */}
                      {/* エディットフィールド送信中ローディングスピナー */}
                    </>
                  )}
                  {/* フィールドエディットモードオーバーレイ 大分類のオーバーレイを表示 */}
                  {/* {!searchMode && isEditModeField === "product_categories" && (
                    <div
                      className={`${styles.edit_mode_overlay}`}
                      onClick={(e) => {
                        e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
                        setIsEditModeField(null); // エディットモードを終了
                      }}
                    />
                  )} */}
                  {/* ============= フィールドエディットモード関連ここまで ============= */}
                </div>
                <div className={`${styles.underline}`}></div>
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${
                            isNullNotNullCategorySmall === null && inputProductArraySmall.length === 0
                              ? `hidden`
                              : `flex`
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleResetArray("category_small")}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() =>
                              handleClickAdditionalAreaBtn(index, setIsNullNotNullCategorySmall, "category_small")
                            }
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* 従業員数・決算月 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className={`group relative flex h-full w-1/2 flex-col pr-[20px]`}>
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
                  {/* サーチ */}
                  {searchMode && (
                    <>
                      {inputNumberOfEmployeesSearch === "is null" || inputNumberOfEmployeesSearch === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputNumberOfEmployeesSearch]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputNumberOfEmployeesSearch]}</span>
                        </div>
                      ) : (
                        <div
                          className={`flex h-full w-full items-center`}
                          onMouseEnter={(e) => {
                            const content = `「〜以上」は下限値のみ、「〜以下」は上限値のみを\n「〜以上〜以下」で範囲指定する場合は上下限値の両方を入力してください。\n上下限値に同じ値を入力した場合は入力値と一致するデータを抽出します。`;
                            handleOpenTooltip({ e, display: "top", content: content, itemsPosition: `left` });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        >
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            value={inputNumberOfEmployeesSearch.min}
                            onChange={(e) =>
                              setInputNumberOfEmployeesSearch({
                                min: e.target.value,
                                max: inputNumberOfEmployeesSearch.max,
                              })
                            }
                            onBlur={() => {
                              const formatHalfInput = toHalfWidthAndRemoveSpace(
                                inputNumberOfEmployeesSearch.min
                              ).trim();
                              const newEmployeesCount = parseInt(formatHalfInput, 10);

                              if (newEmployeesCount !== null && !isNaN(newEmployeesCount)) {
                                setInputNumberOfEmployeesSearch({
                                  min: String(newEmployeesCount),
                                  max: inputNumberOfEmployeesSearch.max,
                                });
                              } else {
                                setInputNumberOfEmployeesSearch({ min: "", max: inputNumberOfEmployeesSearch.max });
                              }
                            }}
                          />

                          <span className="mx-[10px]">〜</span>

                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            value={inputNumberOfEmployeesSearch.max}
                            onChange={(e) =>
                              setInputNumberOfEmployeesSearch({
                                min: inputNumberOfEmployeesSearch.min,
                                max: e.target.value,
                              })
                            }
                            onBlur={() => {
                              const formatHalfInput = toHalfWidthAndRemoveSpace(
                                inputNumberOfEmployeesSearch.max
                              ).trim();
                              const newEmployeesCount = parseInt(formatHalfInput, 10);

                              if (newEmployeesCount !== null && !isNaN(newEmployeesCount)) {
                                setInputNumberOfEmployeesSearch({
                                  min: inputNumberOfEmployeesSearch.min,
                                  max: String(newEmployeesCount),
                                });
                              } else {
                                setInputNumberOfEmployeesSearch({ min: inputNumberOfEmployeesSearch.min, max: "" });
                              }
                            }}
                          />
                        </div>
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        {isCopyableInputRange(inputNumberOfEmployeesSearch) && (
                          <button
                            type="button"
                            className={`icon_btn_green flex`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => {
                              copyInputRange(setInputNumberOfEmployeesSearch);
                              handleCloseTooltip();
                            }}
                          >
                            <LuCopyPlus className="pointer-events-none text-[14px]" />
                          </button>
                        )}
                        <button
                          type="button"
                          className={`icon_btn_red ${
                            isEmptyInputRange(inputNumberOfEmployeesSearch) ? `hidden` : `flex`
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputNumberOfEmployeesSearch, "range_string")}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputNumberOfEmployeesSearch)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
              {/* 決算月 */}
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title} ${fieldEditTitle("fiscal_end_month")}`}>決算月</span>
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
                    <>
                      {isNullNotNullFiscal === "is null" || isNullNotNullFiscal === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[isNullNotNullFiscal]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullFiscal]}</span>
                        </div>
                      ) : (
                        <CustomSelectMultiple
                          stateArray={inputFiscalArray}
                          dispatch={setInputFiscalArray}
                          selectedSetObj={selectedFiscalArraySet}
                          options={optionsMonth}
                          getOptionName={getFiscalMonthNameSearch}
                          withBorder={true}
                          // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                          customClass="font-normal"
                          bgDark={false}
                          maxWidth={`calc(100% - 95px)`}
                          maxHeight={30}
                          // zIndexSelectBox={2000}
                          hideOptionAfterSelect={true}
                        />
                      )}
                      {/* // <select
                    //   className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                    //   value={inputFiscal}
                    //   onChange={(e) => setInputFiscal(e.target.value)}
                    // >
                    //   <option value=""></option>
                    //   {optionsMonth.map((option) => (
                    //     <option key={option} value={option}>
                    //       {option}月
                    //     </option>
                    //   ))}
                    //   <option value="is not null">入力有りのデータのみ</option>
                    //   <option value="is null">入力無しのデータのみ</option>
                    // </select> */}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${
                            isNullNotNullFiscal === null && inputFiscalArray.length === 0 ? `hidden` : `flex`
                          }`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleResetArray("fiscal_end_month")}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() =>
                              handleClickAdditionalAreaBtn(index, setIsNullNotNullFiscal, "fiscal_end_month")
                            }
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* 予算申請月1・予算申請月2 🌟自社専用会社のみ表示 一旦無し　実装は後で、 */}
            {isOwnCompany && (
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className={`group relative flex h-full w-1/2 flex-col pr-[20px]`}>
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} ${fieldEditTitle("budget_request_month1")}`}>予算申請月1</span>
                    {/* <span className={`${styles.title}`}>会員専用</span> */}
                    {/* ディスプレイ */}
                    {!searchMode && isEditModeField !== "budget_request_month1" && (
                      <span
                        className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          handleDoubleClickField({
                            e,
                            field: "budget_request_month1",
                            dispatch: setInputBudgetRequestMonth1,
                          });
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataCompany?.budget_request_month1
                          ? selectedRowDataCompany?.budget_request_month1
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード inputタグ */}
                    {!searchMode && isEditModeField === "budget_request_month1" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputBudgetRequestMonth1}
                          onChange={(e) => {
                            // setInputEmployeesClass(e.target.value);
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "budget_request_month1",
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
                        {/* <input
                          type="text"
                          placeholder=""
                          autoFocus
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                          value={inputBudgetRequestMonth1}
                          onChange={(e) => setInputBudgetRequestMonth1(e.target.value)}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          onKeyDown={(e) =>
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "budget_request_month1",
                              value: toHalfWidthAndSpace(inputBudgetRequestMonth1.trim()),
                              id: selectedRowDataCompany?.id,
                              required: false,
                            })
                          }
                        />
                        {!updateClientCompanyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn
                            inputState={inputBudgetRequestMonth1}
                            setInputState={setInputBudgetRequestMonth1}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "budget_request_month1",
                                value: toHalfWidthAndSpace(inputBudgetRequestMonth1.trim()),
                                id: selectedRowDataCompany?.id,
                                required: false,
                              })
                            }
                            required={false}
                            isDisplayClose={false}
                          />
                        )}
                        {updateClientCompanyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )} */}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "budget_request_month1" && (
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
                {/* 予算申請月2 */}
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} ${fieldEditTitle("budget_request_month2")}`}>予算申請月2</span>
                    {/* ディスプレイ */}
                    {!searchMode && isEditModeField !== "budget_request_month2" && (
                      <span
                        className={`${styles.value} ${isOwnCompany ? `cursor-pointer` : `cursor-not-allowed`}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          handleDoubleClickField({
                            e,
                            field: "budget_request_month2",
                            dispatch: setInputBudgetRequestMonth1,
                          });
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataCompany?.budget_request_month2
                          ? selectedRowDataCompany?.budget_request_month2
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード inputタグ */}
                    {!searchMode && isEditModeField === "budget_request_month2" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputBudgetRequestMonth2}
                          onChange={(e) => {
                            // setInputEmployeesClass(e.target.value);
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "budget_request_month2",
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
                        {/* <select
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
                          {optionsNumberOfEmployeesClass.map((option) => (
                            <option key={option} value={option}>
                              {getNumberOfEmployeesClass(option)}
                            </option>
                          ))}
                        </select> */}
                        {/* {updateClientCompanyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )} */}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "budget_request_month2" && (
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
              </div>
            )}

            {/* 主要取引先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
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
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                    <>
                      {["is null", "is not null"].includes(inputClient) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputClient]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputClient]}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputClient}
                          onChange={(e) => setInputClient(e.target.value)}
                        />
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputClient ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputClient)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputClient)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* 主要仕入先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
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
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                    <>
                      {["is null", "is not null"].includes(inputSupplier) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputSupplier]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputSupplier]}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputSupplier}
                          onChange={(e) => setInputSupplier(e.target.value)}
                        />
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputSupplier ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputSupplier)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputSupplier)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* 設備 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full ${styles.title_box_lg}`}>
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
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
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
                    <>
                      {["is null", "is not null"].includes(inputFacility) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputFacility]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputFacility]}</span>
                        </div>
                      ) : (
                        <textarea
                          cols={30}
                          // rows={10}
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                          value={inputFacility}
                          onChange={(e) => setInputFacility(e.target.value)}
                        ></textarea>
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div
                      className={`additional_search_area_under_input one_line fade05_forward hidden group-hover:flex`}
                    >
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputFacility ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputFacility)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputFacility)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* 事業拠点・海外拠点 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
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
                    <>
                      {["is null", "is not null"].includes(inputBusinessSite) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputBusinessSite]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputBusinessSite]}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputBusinessSite}
                          onChange={(e) => setInputBusinessSite(e.target.value)}
                        />
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputBusinessSite ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputBusinessSite)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputBusinessSite)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
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
                    <>
                      {["is null", "is not null"].includes(inputOverseas) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputOverseas]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputOverseas]}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputOverseas}
                          onChange={(e) => setInputOverseas(e.target.value)}
                        />
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputOverseas ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputOverseas)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputOverseas)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* グループ会社 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
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
                        const el = e.currentTarget;
                        if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
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
                    <>
                      {["is null", "is not null"].includes(inputGroup) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputGroup]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputGroup]}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputGroup}
                          onChange={(e) => setInputGroup(e.target.value)}
                        />
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputGroup ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputGroup)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputGroup)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
            </div>

            {/* 法人番号・ID */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                    <>
                      {["is null", "is not null"].includes(inputCorporateNum) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputCorporateNum]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputCorporateNum]}</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputCorporateNum}
                          onChange={(e) => setInputCorporateNum(e.target.value)}
                        />
                      )}
                    </>
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
                {/* input下追加ボタンエリア */}
                {searchMode && (
                  <>
                    <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                      <div className={`line_first space-x-[6px]`}>
                        <button
                          type="button"
                          className={`icon_btn_red ${!inputCorporateNum ? `hidden` : `flex`}`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => handleClickResetInput(setInputCorporateNum)}
                        >
                          <MdClose className="pointer-events-none text-[14px]" />
                        </button>
                        {firstLineComponents.map((element, index) => (
                          <div
                            key={`additional_search_area_under_input_btn_f_${index}`}
                            className={`btn_f space-x-[3px]`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickAdditionalAreaBtn(index, setInputCorporateNum)}
                          >
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
                {/* input下追加ボタンエリア ここまで */}
              </div>
              {/* ID */}
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {["is null", "is not null"].includes(inputRepresentativeName) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputRepresentativeName]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputRepresentativeName]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputRepresentativeName}
                              onChange={(e) => setInputRepresentativeName(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputRepresentativeName ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputRepresentativeName)}
                            >
                              <MdClose className="pointer-events-none text-[14px]" />
                            </button>
                            {firstLineComponents.map((element, index) => (
                              <div
                                key={`additional_search_area_under_input_btn_f_${index}`}
                                className={`btn_f space-x-[3px]`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputRepresentativeName)}
                              >
                                {element}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {/* input下追加ボタンエリア ここまで */}
                  </div>
                  {/* 会長 サーチ */}
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>会長</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataCompany?.chairperson ? selectedRowDataCompany?.chairperson : ""}
                        </span>
                      )}
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputZipcode) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputZipcode]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputZipcode]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputChairperson}
                              onChange={(e) => setInputChairperson(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputChairperson ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputChairperson)}
                            >
                              <MdClose className="pointer-events-none text-[14px]" />
                            </button>
                            {firstLineComponents.map((element, index) => (
                              <div
                                key={`additional_search_area_under_input_btn_f_${index}`}
                                className={`btn_f space-x-[3px]`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputChairperson)}
                              >
                                {element}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {/* input下追加ボタンエリア ここまで */}
                  </div>
                </div>

                {/* 副社長・専務取締役 サーチモード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {["is null", "is not null"].includes(inputSeniorVicePresident) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputSeniorVicePresident]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputSeniorVicePresident]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputSeniorVicePresident}
                              onChange={(e) => setInputSeniorVicePresident(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputSeniorVicePresident ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputSeniorVicePresident)}
                            >
                              <MdClose className="pointer-events-none text-[14px]" />
                            </button>
                            {firstLineComponents.map((element, index) => (
                              <div
                                key={`additional_search_area_under_input_btn_f_${index}`}
                                className={`btn_f space-x-[3px]`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputSeniorVicePresident)}
                              >
                                {element}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {/* input下追加ボタンエリア ここまで */}
                  </div>
                  {/* 専務取締役 サーチ */}
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {["is null", "is not null"].includes(inputZipcode) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputZipcode]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputZipcode]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputSeniorManagingDirector}
                              onChange={(e) => setInputSeniorManagingDirector(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputSeniorManagingDirector ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputSeniorManagingDirector)}
                            >
                              <MdClose className="pointer-events-none text-[14px]" />
                            </button>
                            {firstLineComponents.map((element, index) => (
                              <div
                                key={`additional_search_area_under_input_btn_f_${index}`}
                                className={`btn_f space-x-[3px]`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputSeniorManagingDirector)}
                              >
                                {element}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {/* input下追加ボタンエリア ここまで */}
                  </div>
                </div>

                {/* 常務取締役・取締役 サーチモード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {["is null", "is not null"].includes(inputManagingDirector) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputManagingDirector]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputManagingDirector]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputManagingDirector}
                              onChange={(e) => setInputManagingDirector(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputManagingDirector ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputManagingDirector)}
                            >
                              <MdClose className="pointer-events-none text-[14px]" />
                            </button>
                            {firstLineComponents.map((element, index) => (
                              <div
                                key={`additional_search_area_under_input_btn_f_${index}`}
                                className={`btn_f space-x-[3px]`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputManagingDirector)}
                              >
                                {element}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {/* input下追加ボタンエリア ここまで */}
                  </div>
                  {/* 取締役 サーチ */}
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {["is null", "is not null"].includes(inputDirector) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputDirector]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputDirector]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputDirector}
                              onChange={(e) => setInputDirector(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputDirector ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputDirector)}
                            >
                              <MdClose className="pointer-events-none text-[14px]" />
                            </button>
                            {firstLineComponents.map((element, index) => (
                              <div
                                key={`additional_search_area_under_input_btn_f_${index}`}
                                className={`btn_f space-x-[3px]`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputDirector)}
                              >
                                {element}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {/* input下追加ボタンエリア ここまで */}
                  </div>
                </div>

                {/* 役員・監査役 サーチモード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {["is null", "is not null"].includes(inputBoardMember) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputBoardMember]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputBoardMember]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputBoardMember}
                              onChange={(e) => setInputBoardMember(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputBoardMember ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputBoardMember)}
                            >
                              <MdClose className="pointer-events-none text-[14px]" />
                            </button>
                            {firstLineComponents.map((element, index) => (
                              <div
                                key={`additional_search_area_under_input_btn_f_${index}`}
                                className={`btn_f space-x-[3px]`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputBoardMember)}
                              >
                                {element}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {/* input下追加ボタンエリア ここまで */}
                  </div>
                  {/* 監査役 サーチ */}
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {["is null", "is not null"].includes(inputAuditor) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputAuditor]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputAuditor]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputAuditor}
                              onChange={(e) => setInputAuditor(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputAuditor ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputAuditor)}
                            >
                              <MdClose className="pointer-events-none text-[14px]" />
                            </button>
                            {firstLineComponents.map((element, index) => (
                              <div
                                key={`additional_search_area_under_input_btn_f_${index}`}
                                className={`btn_f space-x-[3px]`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputAuditor)}
                              >
                                {element}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {/* input下追加ボタンエリア ここまで */}
                  </div>
                </div>

                {/* 部長・担当者 サーチモード */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {["is null", "is not null"].includes(inputManager) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputManager]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputManager]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputManager}
                              onChange={(e) => setInputManager(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputManager ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputManager)}
                            >
                              <MdClose className="pointer-events-none text-[14px]" />
                            </button>
                            {firstLineComponents.map((element, index) => (
                              <div
                                key={`additional_search_area_under_input_btn_f_${index}`}
                                className={`btn_f space-x-[3px]`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputManager)}
                              >
                                {element}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {/* input下追加ボタンエリア ここまで */}
                  </div>
                  {/* 担当者サーチ */}
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {["is null", "is not null"].includes(inputMember) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputMember]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputMember]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputMember}
                              onChange={(e) => setInputMember(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputMember ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputMember)}
                            >
                              <MdClose className="pointer-events-none text-[14px]" />
                            </button>
                            {firstLineComponents.map((element, index) => (
                              <div
                                key={`additional_search_area_under_input_btn_f_${index}`}
                                className={`btn_f space-x-[3px]`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputMember)}
                              >
                                {element}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                    {/* input下追加ボタンエリア ここまで */}
                  </div>
                </div>
              </>
            )}

            <div className={`${styles.row_area} flex min-h-[70px] w-full items-center`}></div>

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
                  <UnderRightActivityLog isHoverableBorder={true} />
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
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
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○検索したい条件を入力してください。（必要な項目のみ入力してください）
                </div>
                {searchType === "manual" && (
                  <>
                    <div className="flex  min-h-[30px] items-center">
                      <span className="h-full w-[15px]"></span>
                      例えば、「&quot;東京都大田区&quot;」の会社で「ホームページ」が存在する会社を検索する場合は、「●住所」に「東京都大田区※」と入力し、「HP」の入力欄にマウスをホバーしてから「データ無し」ボタンを押してHPに「空欄のデータ」がセットされた状態で右側の「検索」ボタンを押してください。
                    </div>
                    <div className="mt-[5px] flex  min-h-[30px] items-center whitespace-pre-wrap">
                      {`○現在の検索タイプは「マニュアル検索」です。`}
                    </div>
                    <div className="flex items-center">
                      <span className="h-full w-[15px]"></span>
                      {`「＊」を付けずに検索した場合は完全一致する値を、「＊工業」で「〜工業」で終わる値を、「合同会社＊」で「合同会社〜」から始まる値を、「＊電気＊」で「〜電気〜」を含む値を抽出可能です。\n検索タイプをオート検索に切り替えるには「戻る」を押して「モード設定」ボタンから切り替えが可能です。`}
                    </div>
                    <div className="flex items-center">
                      <span className="h-full w-[15px]"></span>
                      例えば、会社名に「&quot;工業&quot;」と付く会社を検索したい場合に、「※工業※」、「&quot;精機&quot;」と付く会社は「※精機※」と検索することで、指定した文字が付くデータを検索可能です
                    </div>
                    <div className="mt-[5px] flex  min-h-[30px] items-center">
                      ○「※ アスタリスク」は、「前方一致・後方一致・部分一致」を表します
                    </div>
                  </>
                )}
                {searchType === "partial_match" && (
                  <>
                    <div className="flex  min-h-[30px] items-center">
                      <span className="h-full w-[15px]"></span>
                      例えば、「&quot;東京都大田区&quot;」の会社で「ホームページ」が存在する会社を検索する場合は、「●住所」に「東京都大田区」と入力し、「HP」の入力欄にマウスをホバーしてから「データ無し」ボタンを押してHPに「空欄のデータ」がセットされた状態で右側の「検索」ボタンを押してください。
                    </div>
                    <div className="mt-[5px] flex  min-h-[30px] items-center whitespace-pre-wrap">
                      {`○現在の検索タイプは「オート検索」です。入力された値を含むデータを全て抽出します。`}
                    </div>
                    <div className="flex items-center">
                      <span className="h-full w-[15px]"></span>
                      {`検索タイプをマニュアル検索に切り替えるには「戻る」を押して「モード設定」ボタンから切り替えが可能です。`}
                    </div>
                  </>
                )}
                {/* <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「is not null」は「&quot;空欄でない&quot;データ」を抽出します
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「is null」は「&quot;空欄の&quot;データ」を抽出します
                </div> */}
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○項目を空欄のまま検索した場合は、その項目の「全てのデータ」を抽出します
                </div>
                {/* <div className="mt-[10px] flex h-[30px] w-full items-center justify-between"> */}
                <div
                  className={`mt-[15px] flex ${
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

                      // スクロールコンテナを最上部に戻す
                      if (scrollContainerRef.current) {
                        scrollContainerRef.current.scrollTo({ top: 0, behavior: "auto" });
                      }
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
                  {/* <button
                    type="button"
                    className={`${styles.btn} transition-base02 ${
                      isOpenSidebar ? "min-h-[30px] text-[14px]" : `min-h-[38px] text-[15px]`
                    }`}
                    onClick={async () => {
                      try {
                        console.log("テスト実行🔥🔥🔥🔥", "inputName", inputName);
                        const { data, error } = await supabase.rpc("test_function", { _name: inputName });
                        if (error) throw error;
                        console.log("data", data, "error", error);
                        toast.success(`成功🌲`);
                      } catch (error: any) {
                        console.error("error", error);
                        toast.error(`エラー🙇‍♀️`);
                      }
                    }}
                  >
                    テスト
                  </button> */}
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
