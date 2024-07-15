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
import styles from "../ActivityDetail.module.css";
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
  productCategoriesMediumNameOnlySet,
  productCategoryLargeToMappingMediumMap,
  productCategoryLargeToOptionsMediumMap,
  productCategoryLargeToOptionsMediumObjMap,
} from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { format } from "date-fns";
import { MdClose, MdDoNotDisturbAlt, MdOutlineDone } from "react-icons/md";
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import {
  ActivityType,
  MonthType,
  NumberOfEmployeesClassType,
  OccupationType,
  PositionClassType,
  getActivityType,
  getNumberOfEmployeesClass,
  getOccupationName,
  getPositionClassName,
  getPriorityName,
  mappingActivityType,
  mappingIndustryType,
  mappingMonth,
  mappingNumberOfEmployeesClass,
  mappingPositionsClassName,
  mappingProductL,
  optionsActivityType,
  optionsIndustryType,
  optionsMonth,
  optionsNumberOfEmployeesClass,
  optionsOccupation,
  optionsPositionsClass,
  optionsPriority,
  optionsProductL,
  optionsProductLNameOnly,
  optionsProductLNameOnlySet,
  optionsSearchEmployeesClass,
} from "@/utils/selectOptions";
import { useMutateActivity } from "@/hooks/useMutateActivity";
import {
  Activity,
  Activity_row_data,
  Department,
  Office,
  ProductCategoriesLarge,
  ProductCategoriesMedium,
  Section,
  Unit,
} from "@/types";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { isSameDateLocal } from "@/utils/Helpers/isSameDateLocal";
// import { optionsActivityType, optionsPriority } from "./selectOptionsActivity";
import { AiTwotoneCalendar } from "react-icons/ai";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { InputSendAndCloseBtn } from "@/components/DashboardCompanyComponent/CompanyMainContainer/InputSendAndCloseBtn/InputSendAndCloseBtn";
import { useMedia } from "react-use";
// import { DatePickerCustomInputForSearch } from "@/utils/DatePicker/DatePickerCustomInputForSearch";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { useQueryClient } from "@tanstack/react-query";
import { mappingOccupation, mappingPositionClass } from "@/utils/mappings";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { useQuerySections } from "@/hooks/useQuerySections";
import { getFiscalYear } from "@/utils/Helpers/getFiscalYear";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { calculateFiscalYearMonths } from "@/utils/Helpers/CalendarHelpers/calculateFiscalMonths";
import {
  ProductCategoriesSmall,
  mappingProductCategoriesSmall,
  productCategoriesSmallNameOnlySet,
  productCategoryMediumToMappingSmallMap,
  productCategoryMediumToOptionsSmallMap_All,
  productCategoryMediumToOptionsSmallMap_All_obj,
} from "@/utils/productCategoryS";
import { CustomSelectMultiple } from "@/components/Parts/CustomSelectMultiple/CustomSelectMultiple";
import { BsCheck2 } from "react-icons/bs";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import { toHalfWidthAndRemoveSpace } from "@/utils/Helpers/toHalfWidthAndRemoveSpace";
import { DatePickerCustomInputRange } from "@/utils/DatePicker/DatePickerCustomInputRange";
import {
  adjustFieldRangeNumeric,
  adjustFieldRangeTIMESTAMPTZ,
  adjustIsNNN,
  beforeAdjustFieldRangeDate,
  beforeAdjustFieldRangeNumeric,
  beforeAdjustIsNNN,
  copyInputRange,
  isCopyableInputRange,
  isEmptyInputRange,
  setArrayParam,
} from "@/utils/Helpers/MainContainer/commonHelper";
import { LuCopyPlus } from "react-icons/lu";

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
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // サーチモード
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  // 編集サーチモード
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  // ツールチップ
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
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

  // 会社詳細モーダル
  const setIsOpenClientCompanyDetailModal = useDashboardStore((state) => state.setIsOpenClientCompanyDetailModal);
  // 担当者詳細モーダル
  const setIsOpenContactDetailModal = useDashboardStore((state) => state.setIsOpenContactDetailModal);

  const queryClient = useQueryClient();
  // useMutation
  const { updateActivityFieldMutation, updateActivityMultipleFieldMutation } = useMutateActivity();

  // メディアクエリState
  // デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);
  // 横幅1600px以下で、かつ、サイドバーが開いている場合はツールチップを必要とする変数
  // const isRequireTooltipOpenSidebar = !isDesktopGTE1600 && isOpenSidebar;

  // 🌟サブミット用state
  const [inputCompanyName, setInputCompanyName] = useState("");
  const [inputDepartmentName, setInputDepartmentName] = useState(""); // 部署名
  const [inputTel, setInputTel] = useState("");
  const [inputFax, setInputFax] = useState("");
  const [inputZipcode, setInputZipcode] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  // const [inputEmployeesClass, setInputEmployeesClass] = useState("");
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
  // const [inputCapital, setInputCapital] = useState<string>("");
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
  const [inputCompanyEmail, setInputCompanyEmail] = useState("");
  // const [inputIndustryType, setInputIndustryType] = useState("");
  // ----------------------- サーチ配列 業種(number) -----------------------
  const [inputIndustryTypeArray, setInputIndustryTypeArray] = useState<number[]>([]);
  const [isNullNotNullIndustryType, setIsNullNotNullIndustryType] = useState<"is null" | "is not null" | null>(null);
  const selectedIndustryTypeArraySet = useMemo(() => {
    return new Set([...inputIndustryTypeArray]);
  }, [inputIndustryTypeArray]);
  const getIndustryTypeNameSearch = (option: number) => {
    return mappingIndustryType[option][language];
  };
  // optionsIndustryType
  // ----------------------- サーチ配列 業種(number) -----------------------ここまで
  // ----------------------- 🌟製品分類関連🌟 -----------------------
  // const [inputProductL, setInputProductL] = useState("");
  // const [inputProductM, setInputProductM] = useState("");
  // const [inputProductS, setInputProductS] = useState("");
  // 製品分類に「データあり(ISNOTNULL)」「データなし(ISNULL)」がセットされた場合に使用
  const [isNullNotNullCategoryLarge, setIsNullNotNullCategoryLarge] = useState<"is null" | "is not null" | null>(null);
  const [isNullNotNullCategoryMedium, setIsNullNotNullCategoryMedium] = useState<"is null" | "is not null" | null>(
    null
  );
  const [isNullNotNullCategorySmall, setIsNullNotNullCategorySmall] = useState<"is null" | "is not null" | null>(null);
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
    if (!selectedRowDataActivity || !selectedRowDataActivity.product_categories_large_array?.length) return "";
    return selectedRowDataActivity.product_categories_large_array
      .map((name) =>
        optionsProductLNameOnlySet.has(name) ? `#${mappingProductL[name as ProductCategoriesLarge][language]}` : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataActivity?.product_categories_large_array]);

  // 中分類
  const formattedProductCategoriesMedium = useMemo(() => {
    if (!selectedRowDataActivity || !selectedRowDataActivity.product_categories_medium_array?.length) return "";
    return selectedRowDataActivity.product_categories_medium_array
      .map((name) =>
        productCategoriesMediumNameOnlySet.has(name)
          ? `#${mappingProductCategoriesMedium[name as ProductCategoriesMedium][language]}`
          : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataActivity?.product_categories_medium_array]);

  // 小分類
  const formattedProductCategoriesSmall = useMemo(() => {
    if (!selectedRowDataActivity || !selectedRowDataActivity.product_categories_small_array?.length) return "";
    return selectedRowDataActivity.product_categories_small_array
      .map((name) =>
        productCategoriesSmallNameOnlySet.has(name)
          ? `#${mappingProductCategoriesSmall[name as ProductCategoriesSmall][language]}`
          : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataActivity?.product_categories_small_array]);

  // ----------------------- 🌟製品分類関連🌟 ----------------------- ここまで
  // const [inputFiscal, setInputFiscal] = useState("");
  // ----------------------- サーチ配列 決算月 -----------------------
  const [inputFiscalArray, setInputFiscalArray] = useState<MonthType[]>([]);
  const [isNullNotNullFiscal, setIsNullNotNullFiscal] = useState<"is null" | "is not null" | null>(null);
  const selectedFiscalArraySet = useMemo(() => {
    return new Set([...inputFiscalArray]);
  }, [inputFiscalArray]);
  // optionsMonth
  const getMonthNameSearch = (option: MonthType) => {
    return mappingMonth[option][language];
  };
  // ----------------------- サーチ配列 決算月 ----------------------- ここまで
  // const [inputBudgetRequestMonth1, setInputBudgetRequestMonth1] = useState("");
  // const [inputBudgetRequestMonth2, setInputBudgetRequestMonth2] = useState("");
  // ----------------------- サーチ配列 予算申請月1 -----------------------
  const [inputBudgetRequestMonth1Array, setInputBudgetRequestMonth1Array] = useState<MonthType[]>([]);
  const [isNullNotNullBudgetRequestMonth1, setIsNullNotNullBudgetRequestMonth1] = useState<
    "is null" | "is not null" | null
  >(null);
  const selectedBudgetRequestMonth1ArraySet = useMemo(() => {
    return new Set([...inputBudgetRequestMonth1Array]);
  }, [inputBudgetRequestMonth1Array]);
  // getMonthName
  // ----------------------- サーチ配列 予算申請月1 ----------------------- ここまで
  // ----------------------- サーチ配列 予算申請月2 -----------------------
  const [inputBudgetRequestMonth2Array, setInputBudgetRequestMonth2Array] = useState<MonthType[]>([]);
  const [isNullNotNullBudgetRequestMonth2, setIsNullNotNullBudgetRequestMonth2] = useState<
    "is null" | "is not null" | null
  >(null);
  const selectedBudgetRequestMonth2ArraySet = useMemo(() => {
    return new Set([...inputBudgetRequestMonth2Array]);
  }, [inputBudgetRequestMonth2Array]);
  // getMonthName
  // ----------------------- サーチ配列 予算申請月2 ----------------------- ここまで
  const [inputClient, setInputClient] = useState("");
  const [inputSupplier, setInputSupplier] = useState("");
  const [inputFacility, setInputFacility] = useState("");
  const [inputBusinessSite, setInputBusinessSite] = useState("");
  const [inputOverseas, setInputOverseas] = useState("");
  const [inputGroup, setInputGroup] = useState("");
  const [inputCorporateNum, setInputCorporateNum] = useState("");
  // ----------------------- 範囲検索 従業員数 -----------------------
  // 従業員数サーチ用
  const [inputNumberOfEmployeesSearch, setInputNumberOfEmployeesSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ----------------------- 範囲検索 従業員数 ----------------------- ここまで
  // contactsテーブル
  const [inputContactName, setInputContactName] = useState("");
  const [inputDirectLine, setInputDirectLine] = useState("");
  const [inputDirectFax, setInputDirectFax] = useState("");
  const [inputExtension, setInputExtension] = useState("");
  const [inputCompanyCellPhone, setInputCompanyCellPhone] = useState("");
  const [inputPersonalCellPhone, setInputPersonalCellPhone] = useState("");
  const [inputContactEmail, setInputContactEmail] = useState("");
  const [inputPositionName, setInputPositionName] = useState("");
  // const [inputPositionClass, setInputPositionClass] = useState("");
  // ----------------------- サーチ配列 職位 -----------------------
  const [inputPositionClassArray, setInputPositionClassArray] = useState<PositionClassType[]>([]); // 職位
  const [isNullNotNullPositionClass, setIsNullNotNullPositionClass] = useState<"is null" | "is not null" | null>(null);
  const selectedPositionClassArraySet = useMemo(() => {
    return new Set([...inputPositionClassArray]);
  }, [inputPositionClassArray]);
  const getPositionClassNameSearch = (option: PositionClassType) => {
    return mappingPositionsClassName[option][language];
  };
  // ----------------------- サーチ配列 職位 ----------------------- ここまで
  // const [inputOccupation, setInputOccupation] = useState("");
  // ----------------------- サーチ配列 担当職種 -----------------------
  const [inputOccupationArray, setInputOccupationArray] = useState<OccupationType[]>([]); // 担当職種
  const [isNullNotNullOccupation, setIsNullNotNullOccupation] = useState<"is null" | "is not null" | null>(null);
  const selectedOccupationArraySet = useMemo(() => {
    return new Set([...inputOccupationArray]);
  }, [inputOccupationArray]);
  const getOccupationNameSearch = (option: OccupationType) => {
    return mappingOccupation[option][language];
  };
  // ----------------------- サーチ配列 担当職種 ----------------------- ここまで
  // const [inputApprovalAmount, setInputApprovalAmount] = useState("");
  // ----------------------- 範囲検索 決裁金額 -----------------------
  const [inputApprovalAmountSearch, setInputApprovalAmountSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ----------------------- 範囲検索 決裁金額 ----------------------- ここまで
  const [inputContactCreatedByCompanyId, setInputContactCreatedByCompanyId] = useState("");
  const [inputContactCreatedByUserId, setInputContactCreatedByUserId] = useState("");
  // 🔹activitiesテーブル
  const [inputActivityCreatedByCompanyId, setInputActivityCreatedByCompanyId] = useState("");
  const [inputActivityCreatedByUserId, setInputActivityCreatedByUserId] = useState("");
  const [inputActivityCreatedByDepartmentOfUser, setInputActivityCreatedByDepartmentOfUser] = useState("");
  const [inputActivityCreatedBySectionOfUser, setInputActivityCreatedBySectionOfUser] = useState("");
  const [inputActivityCreatedByUnitOfUser, setInputActivityCreatedByUnitOfUser] = useState("");
  const [inputActivityCreatedByOfficeOfUser, setInputActivityCreatedByOfficeOfUser] = useState("");
  const [inputSummary, setInputSummary] = useState(""); //概要
  // ----------------------- 範囲検索 次回フォロー予定日 -----------------------
  const [inputScheduledFollowUpDate, setInputScheduledFollowUpDate] = useState<Date | null | "is not null" | "is null">(
    null
  ); //次回フォロー予定日
  const [inputScheduledFollowUpDateSearch, setInputScheduledFollowUpDateSearch] = useState<
    { min: Date | null; max: Date | null } | "is not null" | "is null"
  >({ min: null, max: null }); //次回フォロー予定日
  // ----------------------- 範囲検索 次回フォロー予定日 -----------------------ここまで
  const [inputScheduledFollowUpDateForFieldEditMode, setInputScheduledFollowUpDateForFieldEditMode] =
    useState<Date | null>(null); //次回フォロー予定日
  const [inputFollowUpFlag, setInputFollowUpFlag] = useState<boolean | null>(null); //フォロー完了フラグ
  const [inputDocumentUrl, setInputDocumentUrl] = useState(""); //資料、画像ファイル
  // ----------------------- サーチ配列 活動タイプ -----------------------
  const [inputActivityType, setInputActivityType] = useState(""); //活動タイプ
  const [inputActivityTypeArray, setInputActivityTypeArray] = useState<ActivityType[]>([]); //活動タイプ
  const [isNullNotNullActivityType, setIsNullNotNullActivityType] = useState<"is null" | "is not null" | null>(null);
  const selectedActivityTypeArraySet = useMemo(() => {
    return new Set([...inputActivityTypeArray]);
  }, [inputActivityTypeArray]);
  const getActivityTypeNameSearch = (option: ActivityType) => {
    return mappingActivityType[option][language];
  };
  // ----------------------- サーチ配列 活動タイプ ----------------------- ここまで
  const [inputClaimFlag, setInputClaimFlag] = useState<boolean | null>(null); //クレームフラグ
  const [inputProductIntroduction1, setInputProductIntroduction1] = useState(""); //実施1
  const [inputProductIntroduction2, setInputProductIntroduction2] = useState(""); //実施2
  const [inputProductIntroduction3, setInputProductIntroduction3] = useState(""); //実施3
  const [inputProductIntroduction4, setInputProductIntroduction4] = useState(""); //実施4
  const [inputProductIntroduction5, setInputProductIntroduction5] = useState(""); //実施5
  const [inputBusinessOffice, setInputBusinessOffice] = useState(""); //事業所
  const [inputMemberName, setInputMemberName] = useState(""); //自社担当
  const [inputPriority, setInputPriority] = useState(""); //優先度
  // ----------------------- 範囲検索 活動日 -----------------------
  const [inputActivityDate, setInputActivityDate] = useState<Date | null | "is not null" | "is null">(null); //活動日
  const [inputActivityDateSearch, setInputActivityDateSearch] = useState<
    { min: Date | null; max: Date | null } | "is not null" | "is null"
  >({ min: null, max: null }); //活動日
  // ----------------------- 範囲検索 活動日 -----------------------ここまで
  const [inputActivityDateForFieldEditMode, setInputActivityDateForFieldEditMode] = useState<Date | null>(null); //活動日
  const [inputDepartment, setInputDepartment] = useState(""); // 事業部名
  // 年月度〜年度
  const [inputActivityYearMonth, setInputActivityYearMonth] = useState<string>(""); //活動年月度
  const [inputActivityQuarter, setInputActivityQuarter] = useState<string>("");
  const [inputActivityHalfYear, setInputActivityHalfYear] = useState<string>("");
  const [inputActivityFiscalYear, setInputActivityFiscalYear] = useState<string>("");

  // フラグ関連 フィールドエディット用 初期はfalseにしておき、useEffectでselectedRowDataのフラグを反映する
  const [checkboxClaimFlagForFieldEdit, setCheckboxClaimFlagForFieldEdit] = useState(false); // クレームフラグ フィールドエディット用
  const [checkboxFollowUpFlagForFieldEdit, setCheckboxFollowUpFlagForFieldEdit] = useState(false); //フォロー完了フラグ

  // フラグの初期値を更新
  // クレームフラグ
  useEffect(() => {
    setCheckboxClaimFlagForFieldEdit(selectedRowDataActivity?.claim_flag ? selectedRowDataActivity?.claim_flag : false);
  }, [selectedRowDataActivity?.claim_flag]);
  // フォロー完了フラグ
  useEffect(() => {
    setCheckboxFollowUpFlagForFieldEdit(
      selectedRowDataActivity?.follow_up_flag ? selectedRowDataActivity?.follow_up_flag : false
    );
  }, [selectedRowDataActivity?.follow_up_flag]);

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
  const {
    data: departmentDataArray,
    isLoading: isLoadingQueryDepartment,
    refetch: refetchQUeryDepartments,
  } = useQueryDepartments(userProfileState?.company_id, true);

  // useMutation
  // const { createDepartmentMutation, updateDepartmentFieldMutation, deleteDepartmentMutation } = useMutateDepartment();
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟課・セクションリスト取得useQuery🌟 ================================
  const {
    data: sectionDataArray,
    isLoading: isLoadingQuerySection,
    refetch: refetchQUerySections,
  } = useQuerySections(userProfileState?.company_id, true);

  // useMutation
  // const { createSectionMutation, updateSectionFieldMutation, updateMultipleSectionFieldsMutation, deleteSectionMutation } =
  // useMutateSection();
  // ================================ ✅課・セクションリスト取得useQuery✅ ================================
  // ================================ 🌟係・チームリスト取得useQuery🌟 ================================
  const {
    data: unitDataArray,
    isLoading: isLoadingQueryUnit,
    refetch: refetchQUeryUnits,
  } = useQueryUnits(userProfileState?.company_id, true);

  // useMutation
  // const { createUnitMutation, updateUnitFieldMutation, updateMultipleUnitFieldsMutation, deleteUnitMutation } =
  // useMutateUnit();
  // ================================ ✅係・チームリスト取得useQuery✅ ================================
  // ================================ 🌟事業所・営業所リスト取得useQuery🌟 ================================
  const {
    data: officeDataArray,
    isLoading: isLoadingQueryOffice,
    refetch: refetchQUeryOffices,
  } = useQueryOffices(userProfileState?.company_id, true);

  // useMutation
  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅事業所・営業所リスト取得useQuery✅ ================================

  // 課ありパターン
  // ======================= 🌟現在の選択した事業部で課を絞り込むuseEffect🌟 =======================
  const [filteredSectionBySelectedDepartment, setFilteredSectionBySelectedDepartment] = useState<Section[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!sectionDataArray || sectionDataArray?.length === 0 || !inputActivityCreatedByDepartmentOfUser)
      return setFilteredSectionBySelectedDepartment([]);

    // 選択中の事業部が変化するか、sectionDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (sectionDataArray && sectionDataArray.length >= 1 && inputActivityCreatedByDepartmentOfUser) {
      const filteredSectionArray = sectionDataArray.filter(
        (unit) => unit.created_by_department_id === inputActivityCreatedByDepartmentOfUser
      );
      setFilteredSectionBySelectedDepartment(filteredSectionArray);
    }
  }, [sectionDataArray, inputActivityCreatedByDepartmentOfUser]);
  // ======================= ✅現在の選択した事業部で課を絞り込むuseEffect✅ =======================

  // 課ありパターン
  // ======================= 🌟現在の選択した課で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Unit[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!unitDataArray || unitDataArray?.length === 0 || !inputActivityCreatedBySectionOfUser)
      return setFilteredUnitBySelectedSection([]);

    // 選択中の課が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (unitDataArray && unitDataArray.length >= 1 && inputActivityCreatedBySectionOfUser) {
      const filteredUnitArray = unitDataArray.filter(
        (unit) => unit.created_by_section_id === inputActivityCreatedBySectionOfUser
      );
      setFilteredUnitBySelectedSection(filteredUnitArray);
    }
  }, [unitDataArray, inputActivityCreatedBySectionOfUser]);
  // ======================= ✅現在の選択した課で係・チームを絞り込むuseEffect✅ =======================

  // 課なしパターン
  // // ======================= 🌟現在の選択した事業部で係・チームを絞り込むuseEffect🌟 =======================
  // const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  // useEffect(() => {
  //   // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
  //   if (!unitDataArray || unitDataArray?.length === 0 || !inputActivityCreatedByDepartmentOfUser)
  //     return setFilteredUnitBySelectedDepartment([]);

  //   // 選択中の事業部が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
  //   if (unitDataArray && unitDataArray.length >= 1 && inputActivityCreatedByDepartmentOfUser) {
  //     const filteredUnitArray = unitDataArray.filter(
  //       (unit) => unit.created_by_department_id === inputActivityCreatedByDepartmentOfUser
  //     );
  //     setFilteredUnitBySelectedDepartment(filteredUnitArray);
  //   }
  // }, [unitDataArray, inputActivityCreatedByDepartmentOfUser]);
  // // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // 検索タイプ
  const searchType = useDashboardStore((state) => state.searchType);

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

      // サーチ編集モードでリプレイス前の値に復元する関数
      const beforeAdjustFieldValue = (value: string | null) => {
        if (typeof value === "boolean") return value; // Booleanの場合、そのままの値を返す
        if (value === "") return ""; // 全てのデータ
        if (value === null) return ""; // 全てのデータ
        // \%を%に戻す
        if (searchType === "manual" && value.includes("\\%")) value = value.replace(/\\%/g, "%");
        if (searchType === "manual" && value.includes("\\_")) value = value.replace(/\\_/g, "_");
        if (value.includes("%")) value = value.replace(/\%/g, "＊");
        if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
        if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
        return value;
      };

      // // 復元Number専用
      // const beforeAdjustFieldValueInteger = (value: number | "ISNULL" | "ISNOTNULL" | null) => {
      //   if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
      //   if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
      //   if (value === null) return null;
      //   return value;
      // };
      // // 復元Date専用
      // const beforeAdjustFieldValueDate = (value: string | "ISNULL" | "ISNOTNULL" | null) => {
      //   if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
      //   if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
      //   if (value === null) return null;
      //   return new Date(value);
      // };

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
      // // 🔸範囲検索用の変換 Date型
      // const adjustFieldRangeDate = (
      //   value: { min: string | null; max: string | null } | "ISNULL" | "ISNOTNULL",
      //   type: "" = ""
      // ): { min: Date | null; max: Date | null } | "is null" | "is not null" => {
      //   if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
      //   if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
      //   const { min, max } = value;

      //   if (min !== null && max !== null) {
      //     return { min: new Date(min), max: new Date(max) };
      //   } else if (min !== null && max === null) {
      //     return { min: new Date(min), max: null };
      //   } else if (min === null && max !== null) {
      //     return { min: null, max: new Date(max) };
      //   }
      //   return { min: null, max: null };
      // };

      // // 🔸string配列のパラメータをstateにセットする関数
      // const setArrayParam = (
      //   param: string[] | number[] | "ISNULL" | "ISNOTNULL",
      //   dispatch: Dispatch<SetStateAction<any[]>>,
      //   dispatchNNN: Dispatch<SetStateAction<"is null" | "is not null" | null>>
      // ) => {
      //   if (param === "ISNULL" || param === "ISNOTNULL") {
      //     dispatchNNN(beforeAdjustIsNNN(param));
      //   } else {
      //     dispatch(!!param.length ? param : []);
      //   }
      // };

      // const beforeAdjustIsNNN = (value: "ISNULL" | "ISNOTNULL"): "is null" | "is not null" =>
      //   value === "ISNULL" ? "is null" : "is not null";

      console.log(
        "🔥Activityメインコンテナー useEffect 編集モード inputにnewSearchActivity_Contact_CompanyParamsを格納",
        newSearchActivity_Contact_CompanyParams
      );
      //   setInputCompanyName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.company_name));
      setInputCompanyName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["client_companies.name"]));
      // setInputDepartmentName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.department_name));
      setInputDepartmentName(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["client_companies.department_name"])
      );
      //   setInputContactName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["contacts.name"]));
      setInputTel(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.zipcode));
      // サーチ配列 規模 ------------------------
      // setInputEmployeesClass(
      //   beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.number_of_employees_class)
      // );
      setArrayParam(
        newSearchActivity_Contact_CompanyParams?.number_of_employees_class,
        setInputEmployeesClassArray,
        setIsNullNotNullEmployeesClass
      );
      // サーチ配列 規模 ------------------------ここまで
      setInputAddress(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.address));
      // 範囲検索 資本金・従業員数 ------------------------
      // setInputCapital(
      //   beforeAdjustFieldValue(
      //     newSearchActivity_Contact_CompanyParams?.capital
      //       ? newSearchActivity_Contact_CompanyParams.capital.toString()
      //       : ""
      //   )
      // );
      setInputCapitalSearch(beforeAdjustFieldRangeNumeric(newSearchActivity_Contact_CompanyParams?.capital, "price"));
      setInputNumberOfEmployeesSearch(
        beforeAdjustFieldRangeNumeric(newSearchActivity_Contact_CompanyParams?.number_of_employees)
      );
      // 範囲検索 資本金・従業員数 ------------------------ここまで
      setInputFound(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.established_in));
      setInputContent(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams?.business_content));
      setInputHP(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.website_url));
      //   setInputCompanyEmail(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.company_email));
      setInputCompanyEmail(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["client_companies.email"]));
      // サーチ配列 業種 ------------------------
      // setInputIndustryType(
      //   beforeAdjustFieldValue(
      //     newSearchActivity_Contact_CompanyParams.industry_type_id
      //       ? newSearchActivity_Contact_CompanyParams.industry_type_id.toString()
      //       : ""
      //   )
      // );
      setArrayParam(
        newSearchActivity_Contact_CompanyParams?.industry_type_id,
        setInputIndustryTypeArray,
        setIsNullNotNullIndustryType
      );
      // サーチ配列 業種 ------------------------ここまで
      // ------------------------ 製品分類関連 ------------------------
      // 編集モードはidからnameへ変換
      // setInputProductL(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_category_large));
      // setInputProductM(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_category_medium));
      // setInputProductS(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.product_category_small));

      // 🔸大分類
      let productCategoryLargeNamesArray: ProductCategoriesLarge[] = [];
      const largeIds = newSearchActivity_Contact_CompanyParams.product_category_large_ids;
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
      const mediumIds = newSearchActivity_Contact_CompanyParams.product_category_medium_ids;
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
      const smallIds = newSearchActivity_Contact_CompanyParams.product_category_small_ids;
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

      // ------------------------ 製品分類関連 ------------------------

      // サーチ配列 決算月 予算申請月1, 2 ------------------------
      // setInputFiscal(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.fiscal_end_month));
      setArrayParam(
        newSearchActivity_Contact_CompanyParams?.fiscal_end_month,
        setInputFiscalArray,
        setIsNullNotNullFiscal
      );
      // setInputBudgetRequestMonth1(
      //   beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.budget_request_month1)
      // );
      setArrayParam(
        newSearchActivity_Contact_CompanyParams?.budget_request_month1,
        setInputBudgetRequestMonth1Array,
        setIsNullNotNullBudgetRequestMonth1
      );
      // setInputBudgetRequestMonth2(
      //   beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.budget_request_month2)
      // );
      setArrayParam(
        newSearchActivity_Contact_CompanyParams?.budget_request_month2,
        setInputBudgetRequestMonth2Array,
        setIsNullNotNullBudgetRequestMonth2
      );
      // サーチ配列 決算月 予算申請月1, 2 ------------------------ ここまで
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
      // setInputPositionClass(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.position_class));
      // setInputOccupation(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.occupation));
      // サーチ配列 職位 ------------------------
      // setInputPositionClass(
      //   newSearchActivity_Contact_CompanyParams.position_class
      //     ? newSearchActivity_Contact_CompanyParams.position_class.toString()
      //     : ""
      // );
      setArrayParam(
        newSearchActivity_Contact_CompanyParams.position_class,
        setInputPositionClassArray,
        setIsNullNotNullPositionClass
      );
      // サーチ配列 職位 ------------------------ここまで
      // サーチ配列 担当職位 ------------------------
      // setInputOccupation(
      //   newSearchActivity_Contact_CompanyParams.occupation
      //     ? newSearchActivity_Contact_CompanyParams.occupation.toString()
      //     : ""
      // );
      setArrayParam(
        newSearchActivity_Contact_CompanyParams.occupation,
        setInputOccupationArray,
        setIsNullNotNullOccupation
      );
      // サーチ配列 担当職位 ------------------------ここまで
      // 範囲検索 決裁金額 ------------------------
      // setInputApprovalAmount(
      //   beforeAdjustFieldValue(
      //     newSearchActivity_Contact_CompanyParams.approval_amount
      //       ? newSearchActivity_Contact_CompanyParams.approval_amount.toString()
      //       : ""
      //   )
      // );
      setInputApprovalAmountSearch(
        beforeAdjustFieldRangeNumeric(newSearchActivity_Contact_CompanyParams?.approval_amount, "price")
      );
      // 範囲検索 決裁金額 ------------------------ここまで
      setInputContactCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["contacts.created_by_company_id"])
      );
      setInputContactCreatedByUserId(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["contacts.created_by_user_id"])
      );

      // 🔹activitiesテーブル
      setInputActivityCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["activities.created_by_company_id"])
      );
      setInputActivityCreatedByUserId(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["activities.created_by_user_id"])
      );
      setInputActivityCreatedByDepartmentOfUser(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["activities.created_by_department_of_user"])
      );
      setInputActivityCreatedBySectionOfUser(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["activities.created_by_section_of_user"])
      );
      setInputActivityCreatedByUnitOfUser(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["activities.created_by_unit_of_user"])
      );
      setInputActivityCreatedByOfficeOfUser(
        beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams["activities.created_by_office_of_user"])
      );
      setInputSummary(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.summary));
      // setInputScheduledFollowUpDate(
      //   beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.scheduled_follow_up_date)
      // );
      // setInputScheduledFollowUpDate(newSearchActivity_Contact_CompanyParams.scheduled_follow_up_date);
      // setInputScheduledFollowUpDate(
      //   newSearchActivity_Contact_CompanyParams.scheduled_follow_up_date
      //     ? new Date(newSearchActivity_Contact_CompanyParams.scheduled_follow_up_date)
      //     : null
      // );
      // 範囲検索 次回フォロー予定日 -----------------------
      // setInputScheduledFollowUpDate(
      //   beforeAdjustFieldValueDate(newSearchActivity_Contact_CompanyParams.scheduled_follow_up_date)
      //   );
      setInputScheduledFollowUpDateSearch(
        beforeAdjustFieldRangeDate(newSearchActivity_Contact_CompanyParams.scheduled_follow_up_date)
      );
      // 範囲検索 次回フォロー予定日 -----------------------ここまで
      setInputFollowUpFlag(newSearchActivity_Contact_CompanyParams.follow_up_flag ?? null);
      setInputDocumentUrl(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.document_url));
      // サーチ配列 活動タイプ ------------------------
      // setInputActivityType(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.activity_type));
      setArrayParam(
        newSearchActivity_Contact_CompanyParams.activity_type,
        setInputActivityTypeArray,
        setIsNullNotNullActivityType
      );
      // サーチ配列 活動タイプ ------------------------ここまで
      setInputClaimFlag(newSearchActivity_Contact_CompanyParams.claim_flag ?? null);
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
      // setInputActivityDate(
      //   newSearchActivity_Contact_CompanyParams.activity_date
      //     ? new Date(newSearchActivity_Contact_CompanyParams.activity_date)
      //     : null
      // );
      // 範囲検索 活動日 -----------------------
      // setInputActivityDate(beforeAdjustFieldValueDate(newSearchActivity_Contact_CompanyParams.activity_date));
      setInputActivityDateSearch(beforeAdjustFieldRangeDate(newSearchActivity_Contact_CompanyParams.activity_date));
      // 範囲検索 活動日 -----------------------ここまで
      setInputDepartment(beforeAdjustFieldValue(newSearchActivity_Contact_CompanyParams.department));
      // 年月度〜年度
      // setInputActivityYearMonth(adjustFieldValueNumber(newSearchActivity_Contact_CompanyParams.activity_year_month));
      setInputActivityYearMonth(
        newSearchActivity_Contact_CompanyParams.activity_year_month !== null
          ? String(newSearchActivity_Contact_CompanyParams.activity_year_month)
          : ""
      );
      setInputActivityQuarter(
        newSearchActivity_Contact_CompanyParams.activity_quarter !== null
          ? String(newSearchActivity_Contact_CompanyParams.activity_quarter)
          : ""
      );
      setInputActivityHalfYear(
        newSearchActivity_Contact_CompanyParams.activity_half_year !== null
          ? String(newSearchActivity_Contact_CompanyParams.activity_half_year)
          : ""
      );
      setInputActivityFiscalYear(
        newSearchActivity_Contact_CompanyParams.activity_fiscal_year !== null
          ? String(newSearchActivity_Contact_CompanyParams.activity_fiscal_year)
          : ""
      );
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
      // サーチ配列 規模ランク-----------------------
      // if (!!inputEmployeesClass) setInputEmployeesClass("");
      if (!!inputEmployeesClassArray.length) setInputEmployeesClassArray([]);
      if (isNullNotNullEmployeesClass !== null) setIsNullNotNullEmployeesClass(null);
      // サーチ配列 規模ランク-----------------------ここまで
      if (!!inputAddress) setInputAddress("");
      // if (!!inputCapital) setInputCapital("");
      // 範囲検索 資本金・従業員数 -----------------------
      setInputCapitalSearch({ min: "", max: "" });
      setInputNumberOfEmployeesSearch({ min: "", max: "" });
      // 範囲検索 資本金・従業員数 ----------------------- ここまで
      if (!!inputFound) setInputFound("");
      if (!!inputContent) setInputContent("");
      if (!!inputHP) setInputHP("");
      if (!!inputCompanyEmail) setInputCompanyEmail("");
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
      // サーチ配列 決算月 -----------------------
      // if (!!inputFiscal) setInputFiscal("");
      if (!!inputFiscalArray.length) setInputFiscalArray([]);
      if (isNullNotNullFiscal !== null) setIsNullNotNullFiscal(null);
      // サーチ配列 決算月 -----------------------ここまで
      // サーチ配列 予算申請月 -----------------------
      // if (!!inputBudgetRequestMonth1) setInputBudgetRequestMonth1("");
      // if (!!inputBudgetRequestMonth2) setInputBudgetRequestMonth2("");
      if (!!inputBudgetRequestMonth1Array.length) setInputBudgetRequestMonth1Array([]);
      if (isNullNotNullBudgetRequestMonth1 !== null) setIsNullNotNullBudgetRequestMonth1(null);
      if (!!inputBudgetRequestMonth2Array.length) setInputBudgetRequestMonth2Array([]);
      if (isNullNotNullBudgetRequestMonth2 !== null) setIsNullNotNullBudgetRequestMonth2(null);
      // サーチ配列 予算申請月 -----------------------ここまで
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
      // サーチ配列 職位 -----------------------
      // if (!!inputPositionClass) setInputPositionClass("");
      if (!!inputPositionClassArray.length) setInputPositionClassArray([]);
      if (isNullNotNullPositionClass !== null) setIsNullNotNullPositionClass(null);
      // サーチ配列 職位 -----------------------ここまで
      // サーチ配列 担当職種 -----------------------
      // if (!!inputOccupation) setInputOccupation("");
      if (!!inputOccupationArray.length) setInputOccupationArray([]);
      if (isNullNotNullOccupation !== null) setIsNullNotNullOccupation(null);
      // サーチ配列 担当職種 -----------------------ここまで
      // 範囲検索 決裁金額 -----------------------
      // if (!!inputApprovalAmount) setInputApprovalAmount("");
      setInputApprovalAmountSearch({ min: "", max: "" });
      // 範囲検索 決裁金額 ----------------------- ここまで
      if (!!inputContactCreatedByCompanyId) setInputContactCreatedByCompanyId("");
      if (!!inputContactCreatedByUserId) setInputContactCreatedByUserId("");

      // activitiesテーブル
      if (!!inputActivityCreatedByCompanyId) setInputActivityCreatedByCompanyId("");
      if (!!inputActivityCreatedByUserId) setInputActivityCreatedByUserId("");
      if (!!inputActivityCreatedByDepartmentOfUser) setInputActivityCreatedByDepartmentOfUser("");
      if (!!inputActivityCreatedBySectionOfUser) setInputActivityCreatedBySectionOfUser("");
      if (!!inputActivityCreatedByUnitOfUser) setInputActivityCreatedByUnitOfUser("");
      if (!!inputActivityCreatedByOfficeOfUser) setInputActivityCreatedByOfficeOfUser("");
      if (!!inputSummary) setInputSummary("");
      // 範囲検索 次回フォロー予定日 -----------------------
      // if (!!inputScheduledFollowUpDate) setInputScheduledFollowUpDate(null);
      setInputScheduledFollowUpDateSearch({ min: null, max: null });
      // 範囲検索 次回フォロー予定日 -----------------------ここまで
      if (!!inputFollowUpFlag) setInputFollowUpFlag(null);
      if (!!inputDocumentUrl) setInputDocumentUrl("");
      // サーチ配列 活動タイプ -----------------------
      // if (!!inputActivityType) setInputActivityType("");
      if (!!inputActivityTypeArray.length) setInputActivityTypeArray([]);
      if (isNullNotNullActivityType !== null) setIsNullNotNullActivityType(null);
      // サーチ配列 活動タイプ -----------------------ここまで
      if (!!inputClaimFlag) setInputClaimFlag(null);
      if (!!inputProductIntroduction1) setInputProductIntroduction1("");
      if (!!inputProductIntroduction2) setInputProductIntroduction2("");
      if (!!inputProductIntroduction3) setInputProductIntroduction3("");
      if (!!inputProductIntroduction4) setInputProductIntroduction4("");
      if (!!inputProductIntroduction5) setInputProductIntroduction5("");
      if (!!inputBusinessOffice) setInputBusinessOffice("");
      if (!!inputMemberName) setInputMemberName("");
      if (!!inputPriority) setInputPriority("");
      // 範囲検索 活動日 -----------------------
      // if (!!inputActivityDate) setInputActivityDate(null);
      setInputActivityDateSearch({ min: null, max: null });
      // 範囲検索 活動日 -----------------------ここまで
      if (!!inputDepartment) setInputDepartment(""); // 事業部名(自社)
      // 年月度〜年度
      // if (!!inputActivityYearMonth) setInputActivityYearMonth(null);
      if (!!inputActivityYearMonth) setInputActivityYearMonth("");
      if (!!inputActivityQuarter) setInputActivityQuarter("");
      if (!!inputActivityHalfYear) setInputActivityHalfYear("");
      if (!!inputActivityFiscalYear) setInputActivityFiscalYear("");
    }
  }, [editSearchMode, searchMode]);

  // サーチ関数実行
  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    handleCloseTooltip();

    // フィールド編集モードがtrueならサブミットせずにリターン
    if (isEditModeField) return console.log("サブミット フィールドエディットモードのためリターン");

    if (!userProfileState || !userProfileState.company_id) return alert("エラー：ユーザー情報が見つかりませんでした。");

    // // 🔸Asterisks to percent signs for PostgreSQL's LIKE operator
    function adjustFieldValue(value: string | null) {
      // if (typeof value === "boolean") return value; // Booleanの場合、そのままの値を返す
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

    // // 🔸Date型
    // const adjustFieldValueDate = (value: Date | string | null): string | null => {
    //   if (value instanceof Date) return value.toISOString();
    //   // "is null"か"is not null"の文字列は変換
    //   if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
    //   if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
    //   return null;
    //   // if (typeof inputScheduledFollowUpDate === "string") return adjustFieldValue(inputScheduledFollowUpDate);
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

    // // 🔸範囲検索用の変換 TIMESTAMPTZ型(Dateオブジェクト ISO文字列) 活動日、面談日
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

    // // 🔸製品分類用 is null, is not nullをIS NULL, IS NOT NULLに変換
    // const adjustIsNNN = (value: "is null" | "is not null"): "ISNULL" | "ISNOTNULL" =>
    //   value === "is null" ? "ISNULL" : "ISNOTNULL";

    setLoadingGlobalState(true);

    try {
      let _company_name = adjustFieldValue(inputCompanyName);
      let _department_name = adjustFieldValue(inputDepartmentName);
      let _main_phone_number = adjustFieldValue(inputTel);
      let _main_fax = adjustFieldValue(inputFax);
      let _zipcode = adjustFieldValue(inputZipcode);
      // サーチ配列 規模 TEXT[] ------------
      // let _number_of_employees_class = adjustFieldValue(inputEmployeesClass);
      let _number_of_employees_class = inputEmployeesClassArray;
      // サーチ配列 規模 TEXT[] ------------ここまで
      let _address = adjustFieldValue(inputAddress);
      // let _capital = adjustFieldValue(inputCapital) ? parseInt(inputCapital, 10) : null;
      // 範囲検索 資本金・従業員数 -----------
      // let _capital = adjustFieldValueInteger(inputCapital);
      // let _capital = adjustFieldRangeNumeric(inputCapitalSearch);
      let _capital = adjustFieldRangeNumeric(inputCapitalSearch, "millions");
      let _number_of_employees = adjustFieldRangeNumeric(inputNumberOfEmployeesSearch);
      // 範囲検索 資本金・従業員数 -----------ここまで
      let _established_in = adjustFieldValue(inputFound);
      let _business_content = adjustFieldValue(inputContent);
      let _website_url = adjustFieldValue(inputHP);
      let _company_email = adjustFieldValue(inputCompanyEmail);
      // let _industry_type = adjustFieldValue(inputIndustryType);
      // let _industry_type_id = isValidNumber(inputIndustryType) ? parseInt(inputIndustryType, 10) : null;
      // サーチ配列 業種 number[] -----------
      // let _industry_type_id = adjustFieldValueInteger(inputIndustryType);
      let _industry_type_id = inputIndustryTypeArray;
      // サーチ配列 業種 number[] -----------ここまで
      // // 🔸製品分類の配列内のnameをidに変換してから大中小を全て１つの配列にまとめてセットする
      // let _product_category_large = adjustFieldValue(inputProductL);
      // let _product_category_medium = adjustFieldValue(inputProductM);
      // let _product_category_small = adjustFieldValue(inputProductS);
      // サーチ配列 決算日・予算申請月1, 2 TEXT[] ------------
      // let _fiscal_end_month = adjustFieldValue(inputFiscal);
      // let _budget_request_month1 = adjustFieldValue(inputBudgetRequestMonth1);
      // let _budget_request_month2 = adjustFieldValue(inputBudgetRequestMonth2);
      let _fiscal_end_month = inputFiscalArray;
      let _budget_request_month1 = inputBudgetRequestMonth1Array;
      let _budget_request_month2 = inputBudgetRequestMonth2Array;
      // サーチ配列 決算日・予算申請月1, 2 TEXT[] ------------ここまで
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
      // let _position_class = adjustFieldValue(inputPositionClass) ? parseInt(inputPositionClass, 10) : null;
      // サーチ配列 職位・担当職種 number[] ------------
      // let _position_class = adjustFieldValueInteger(inputPositionClass);
      let _position_class = inputPositionClassArray;
      // let _occupation = adjustFieldValue(inputOccupation) ? parseInt(inputOccupation, 10) : null;
      // let _occupation = adjustFieldValueInteger(inputOccupation);
      let _occupation = inputOccupationArray;
      // サーチ配列 職位・担当職種 number[] ------------ここまで
      // let _approval_amount = adjustFieldValue(inputApprovalAmount);
      // let _approval_amount = adjustFieldValue(inputApprovalAmount) ? parseInt(inputApprovalAmount, 10) : null;
      // 範囲検索 決裁金額 -----------
      // let _approval_amount = adjustFieldValueInteger(inputApprovalAmount);
      // let _approval_amount = adjustFieldRangeNumeric(inputApprovalAmountSearch);
      let _approval_amount = adjustFieldRangeNumeric(inputApprovalAmountSearch, "millions");
      // 範囲検索 決裁金額 -----------ここまで
      let _contact_created_by_company_id = adjustFieldValue(inputContactCreatedByCompanyId);
      let _contact_created_by_user_id = adjustFieldValue(inputContactCreatedByUserId);
      // activitiesテーブル
      let _activity_created_by_company_id = userProfileState.company_id;
      let _activity_created_by_user_id = adjustFieldValue(inputActivityCreatedByUserId);
      let _activity_created_by_department_of_user = adjustFieldValue(inputActivityCreatedByDepartmentOfUser);
      let _activity_created_by_section_of_user = adjustFieldValue(inputActivityCreatedBySectionOfUser);
      let _activity_created_by_unit_of_user = adjustFieldValue(inputActivityCreatedByUnitOfUser);
      let _activity_created_by_office_of_user = adjustFieldValue(inputActivityCreatedByOfficeOfUser);
      let _summary = adjustFieldValue(inputSummary);
      // let _scheduled_follow_up_date = adjustFieldValue(inputScheduledFollowUpDate);
      // let _scheduled_follow_up_date =
      //   inputScheduledFollowUpDate instanceof Date
      //     ? inputScheduledFollowUpDate.toISOString()
      //     : typeof inputScheduledFollowUpDate === "string" // "is null"か"is not null"の文字列は変換
      //     ? adjustFieldValue(inputScheduledFollowUpDate)
      //     : null;
      // 範囲検索 次回フォロー予定日 -----------
      // let _scheduled_follow_up_date = adjustFieldValueDate(inputScheduledFollowUpDate);
      let _scheduled_follow_up_date = adjustFieldRangeTIMESTAMPTZ(inputScheduledFollowUpDateSearch);
      // 範囲検索 次回フォロー予定日 -----------ここまで
      let _follow_up_flag = inputFollowUpFlag;
      let _document_url = adjustFieldValue(inputDocumentUrl);
      // サーチ配列 活動タイプ TEXT[] ------------
      // let _activity_type = adjustFieldValue(inputActivityType);
      let _activity_type = inputActivityTypeArray;
      // サーチ配列 活動タイプ TEXT[] ------------ここまで
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
      // let _activity_date = inputActivityDate ? inputActivityDate.toISOString() : null;
      // let _activity_date =
      //   inputActivityDate instanceof Date
      //     ? inputActivityDate.toISOString()
      //     : typeof inputActivityDate === "string"
      //     ? adjustFieldValue(inputActivityDate)
      //     : null;
      // 範囲検索 活動日 -----------
      // let _activity_date = adjustFieldValueDate(inputActivityDate);
      let _activity_date = adjustFieldRangeTIMESTAMPTZ(inputActivityDateSearch);
      // 範囲検索 活動日 -----------ここまで
      let _department = adjustFieldValue(inputDepartment);
      // 年月度〜年度
      // let _activity_year_month = adjustFieldValueNumber(inputActivityYearMonth);
      const parsedActivityYearMonth = parseInt(inputActivityYearMonth, 10);
      let _activity_year_month =
        !isNaN(parsedActivityYearMonth) && inputActivityYearMonth === parsedActivityYearMonth.toString()
          ? parsedActivityYearMonth
          : null;
      const parsedActivityQuarter = parseInt(inputActivityQuarter, 10);
      let _activity_quarter =
        !isNaN(parsedActivityQuarter) && inputActivityQuarter === parsedActivityQuarter.toString()
          ? parsedActivityQuarter
          : null;
      const parsedActivityHalfYear = parseInt(inputActivityHalfYear, 10);
      let _activity_half_year =
        !isNaN(parsedActivityHalfYear) && inputActivityHalfYear === parsedActivityHalfYear.toString()
          ? parsedActivityHalfYear
          : null;
      const parsedActivityFiscalYear = parseInt(inputActivityFiscalYear, 10);
      let _activity_fiscal_year =
        !isNaN(parsedActivityFiscalYear) && inputActivityFiscalYear === parsedActivityFiscalYear.toString()
          ? parsedActivityFiscalYear
          : null;

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

      // 製品分類の処理ここまで ----------------------------------------------

      const params = {
        "client_companies.name": _company_name,
        //   company_name: _company_name,
        "client_companies.department_name": _department_name,
        main_phone_number: _main_phone_number,
        main_fax: _main_fax,
        zipcode: _zipcode,
        address: _address,
        // サーチ配列 規模 TEXT[] ------------
        // number_of_employees_class: _number_of_employees_class,
        number_of_employees_class:
          isNullNotNullEmployeesClass === null ? _number_of_employees_class : adjustIsNNN(isNullNotNullEmployeesClass),
        // サーチ配列 規模 TEXT[] ------------ここまで
        // 範囲検索 資本金・従業員数 ------------
        capital: _capital,
        number_of_employees: _number_of_employees,
        // 範囲検索 資本金・従業員数 ------------ここまで
        established_in: _established_in,
        business_content: _business_content,
        website_url: _website_url,
        //   company_email: _company_email,
        "client_companies.email": _company_email,
        // サーチ配列 業種 number[] ------------
        // industry_type_id: _industry_type_id,
        industry_type_id:
          isNullNotNullIndustryType === null ? _industry_type_id : adjustIsNNN(isNullNotNullIndustryType),
        // サーチ配列 業種 number[] ------------ここまで
        // 製品分類 ----------------
        // product_category_large: _product_category_large,
        // product_category_medium: _product_category_medium,
        // product_category_small: _product_category_small,
        // product_category_large_ids: productCategoryLargeIdsArray,
        // product_category_medium_ids: productCategoryMediumIdsArray,
        // product_category_small_ids: productCategorySmallIdsArray,
        product_category_large_ids:
          isNullNotNullCategoryLarge === null ? productCategoryLargeIdsArray : adjustIsNNN(isNullNotNullCategoryLarge),
        product_category_medium_ids:
          isNullNotNullCategoryMedium === null
            ? productCategoryMediumIdsArray
            : adjustIsNNN(isNullNotNullCategoryMedium),
        product_category_small_ids:
          isNullNotNullCategorySmall === null ? productCategorySmallIdsArray : adjustIsNNN(isNullNotNullCategorySmall),
        // 製品分類 ---------------- ここまで
        // サーチ配列 決算月・予算申請月1, 2 TEXT[] ------------
        // fiscal_end_month: _fiscal_end_month,
        fiscal_end_month: isNullNotNullFiscal === null ? _fiscal_end_month : adjustIsNNN(isNullNotNullFiscal),
        // budget_request_month1: _budget_request_month1,
        // budget_request_month2: _budget_request_month2,
        budget_request_month1:
          isNullNotNullBudgetRequestMonth1 === null
            ? _budget_request_month1
            : adjustIsNNN(isNullNotNullBudgetRequestMonth1),
        budget_request_month2:
          isNullNotNullBudgetRequestMonth2 === null
            ? _budget_request_month2
            : adjustIsNNN(isNullNotNullBudgetRequestMonth2),
        // サーチ配列 決算月・予算申請月1, 2 TEXT[] ------------ここまで
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
        // サーチ配列 TEXT[] 職位・担当職種 ------------
        // position_class: _position_class,
        position_class: isNullNotNullPositionClass === null ? _position_class : adjustIsNNN(isNullNotNullPositionClass),
        // occupation: _occupation,
        occupation: isNullNotNullOccupation === null ? _occupation : adjustIsNNN(isNullNotNullOccupation),
        // サーチ配列 TEXT[] 職位・担当職種 ------------ここまで
        // 範囲検索 決裁金額 ------------
        approval_amount: _approval_amount,
        // 範囲検索 決裁金額 ------------ここまで
        "contacts.created_by_company_id": _contact_created_by_company_id,
        "contacts.created_by_user_id": _contact_created_by_user_id,
        // activitiesテーブル
        // "activities.created_by_company_id": _activity_created_by_company_id,
        "activities.created_by_company_id": _activity_created_by_company_id,
        "activities.created_by_user_id": _activity_created_by_user_id,
        "activities.created_by_department_of_user": _activity_created_by_department_of_user,
        "activities.created_by_section_of_user": _activity_created_by_section_of_user,
        "activities.created_by_unit_of_user": _activity_created_by_unit_of_user,
        "activities.created_by_office_of_user": _activity_created_by_office_of_user,
        summary: _summary,
        // 範囲検索 次回フォロー予定日 ------------
        scheduled_follow_up_date: _scheduled_follow_up_date,
        // 範囲検索 次回フォロー予定日 ------------ここまで
        follow_up_flag: _follow_up_flag,
        document_url: _document_url,
        // サーチ配列 TEXT[] 活動タイプ ------------
        // activity_type: _activity_type,
        activity_type: isNullNotNullActivityType === null ? _activity_type : adjustIsNNN(isNullNotNullActivityType),
        // サーチ配列 TEXT[] 活動タイプ ------------ここまで
        claim_flag: _claim_flag,
        product_introduction1: _product_introduction1,
        product_introduction2: _product_introduction2,
        product_introduction3: _product_introduction3,
        product_introduction4: _product_introduction4,
        product_introduction5: _product_introduction5,
        business_office: _business_office,
        member_name: _member_name,
        priority: _priority,
        // 範囲検索 活動日 ------------
        activity_date: _activity_date,
        // 範囲検索 活動日 ------------ここまで
        department: _department,
        // 年月度〜年度
        activity_year_month: _activity_year_month,
        activity_quarter: _activity_quarter,
        activity_half_year: _activity_half_year,
        activity_fiscal_year: _activity_fiscal_year,
      };

      // const { data, error } = await supabase.rpc("", { params });
      // const { data, error } = await supabase.rpc("search_companies", { params });

      setInputCompanyName("");
      setInputDepartmentName("");
      setInputTel("");
      setInputFax("");
      setInputZipcode("");
      // サーチ配列 規模 ----------------
      // setInputEmployeesClass("");
      setInputEmployeesClassArray([]);
      if (isNullNotNullEmployeesClass !== null) setIsNullNotNullEmployeesClass(null);
      // サーチ配列 規模 ----------------ここまで
      setInputAddress("");
      // 範囲検索 資本金・従業員数 ----------------
      // setInputCapital("");
      setInputCapitalSearch({ min: "", max: "" });
      setInputNumberOfEmployeesSearch({ min: "", max: "" });
      // 範囲検索 資本金・従業員数 ----------------ここまで
      // 範囲検索 ----------------
      setInputFound("");
      setInputContent("");
      setInputHP("");
      setInputCompanyEmail("");
      // サーチ配列 業種 ----------------
      // setInputIndustryType("");
      setInputIndustryTypeArray([]);
      if (isNullNotNullIndustryType !== null) setIsNullNotNullIndustryType(null);
      // サーチ配列 業種 ----------------ここまで
      // 製品分類 ----------------
      // setInputProductL("");
      // setInputProductM("");
      // setInputProductS("");
      setInputProductArrayLarge([]);
      setInputProductArrayMedium([]);
      setInputProductArraySmall([]);
      if (isNullNotNullCategoryLarge !== null) setIsNullNotNullCategoryLarge(null);
      if (isNullNotNullCategoryMedium !== null) setIsNullNotNullCategoryMedium(null);
      if (isNullNotNullCategorySmall !== null) setIsNullNotNullCategorySmall(null);
      // 製品分類 ----------------ここまで
      // サーチ配列 決算月・予算申請月 -----------------------
      // setInputFiscal("");
      setInputFiscalArray([]);
      if (isNullNotNullFiscal !== null) setIsNullNotNullFiscal(null);
      // setInputBudgetRequestMonth1("");
      setInputBudgetRequestMonth1Array([]);
      if (isNullNotNullBudgetRequestMonth1 !== null) setIsNullNotNullBudgetRequestMonth1(null);
      // setInputBudgetRequestMonth2("");
      setInputBudgetRequestMonth2Array([]);
      if (isNullNotNullBudgetRequestMonth2 !== null) setIsNullNotNullBudgetRequestMonth2(null);
      // サーチ配列 決算月・予算申請月 -----------------------ここまで
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
      // サーチ配列 職位・担当職種 -----------------------
      // setInputPositionClass("");
      setInputPositionClassArray([]);
      if (isNullNotNullPositionClass !== null) setIsNullNotNullPositionClass(null);
      // setInputOccupation("");
      setInputOccupationArray([]);
      if (isNullNotNullOccupation !== null) setIsNullNotNullOccupation(null);
      // サーチ配列 職位・担当職種 ----------------------- ここまで
      // 範囲検索 決裁金額 ----------------
      // setInputApprovalAmount("");
      setInputApprovalAmountSearch({ min: "", max: "" });
      // 範囲検索 決裁金額 ----------------ここまで
      setInputContactCreatedByCompanyId("");
      setInputContactCreatedByUserId("");
      // activitiesテーブル
      setInputActivityCreatedByCompanyId("");
      setInputActivityCreatedByUserId("");
      setInputActivityCreatedByDepartmentOfUser("");
      setInputActivityCreatedBySectionOfUser("");
      setInputActivityCreatedByUnitOfUser("");
      setInputActivityCreatedByOfficeOfUser("");
      setInputSummary("");
      // 範囲検索 次回フォロー予定日 ----------------
      // setInputScheduledFollowUpDate(null);
      setInputScheduledFollowUpDateSearch({ min: null, max: null });
      // 範囲検索 次回フォロー予定日 ----------------ここまで
      setInputFollowUpFlag(null);
      setInputDocumentUrl("");
      // サーチ配列 活動タイプ -----------------------
      // setInputActivityType("");
      setInputActivityTypeArray([]);
      if (isNullNotNullActivityType !== null) setIsNullNotNullActivityType(null);
      // サーチ配列 活動タイプ ----------------------- ここまで
      setInputClaimFlag(null);
      setInputProductIntroduction1("");
      setInputProductIntroduction2("");
      setInputProductIntroduction3("");
      setInputProductIntroduction4("");
      setInputProductIntroduction5("");
      setInputBusinessOffice("");
      setInputMemberName("");
      setInputPriority("");
      // 範囲検索 活動日 ----------------
      // setInputActivityDate(null);
      setInputActivityDateSearch({ min: null, max: null });
      // 範囲検索 活動日 ----------------ここまで
      setInputDepartment("");
      // 年月度〜年度
      // setInputActivityYearMonth(null);
      setInputActivityYearMonth("");
      setInputActivityQuarter("");
      setInputActivityHalfYear("");
      setInputActivityFiscalYear("");

      setSearchMode(false);
      setEditSearchMode(false);

      // Zustandに検索条件を格納
      setNewSearchActivity_Contact_CompanyParams(params);

      // 選択中の行データをリセット
      setSelectedRowDataActivity(null);

      console.log("✅ 条件 params", params);
      // const { data, error } = await supabase.rpc("search_companies", { params });
      // const { data, error } = await supabase.rpc("", { params });
      // const { data, error } = await supabase.rpc("search_activities_and_companies_and_contacts", { params });

      // 会社IDがnull、つまりまだ有料アカウントを持っていないユーザー
      // const { data, error } = await supabase
      //   .rpc("", { params })
      //   .is("created_by_company_id", null)
      //   .range(0, 20);

      // ユーザーIDが自身のIDと一致するデータのみ 成功
      // const { data, error } = await supabase
      //   .rpc("", { params })
      //   .eq("created_by_user_id", `${userProfileState?.id}`)
      //   .range(0, 20);

      // if (error) return alert(error.message);
      // console.log("✅ 検索結果データ取得 data", data);

      // setLoadingGlobalState(false);

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
            newErrMsg = "";
            break;

          default:
            break;
        }
        alert(newErrMsg);
      }
    }
  };

  // ==================================== 🌟ツールチップ🌟 ====================================
  // const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string = "center") => {
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
    content?: string;
    content2?: string;
    content3?: string;
    content4?: string;
  };
  // const handleOpenTooltip = (
  //   e: React.MouseEvent<HTMLElement, MouseEvent>,
  //   display: "top" | "right" | "bottom" | "left" | "" = "top",
  //   marginTop: number = 0,
  //   itemsPosition: string = "center",
  //   whiteSpace: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined = undefined,
  //   content: string = ""
  // ) => {
  const handleOpenTooltip = ({
    e,
    display = "top",
    marginTop = 0,
    itemsPosition = "center",
    whiteSpace = undefined,
    content = "",
    content2,
    content3,
    content4,
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
      content: !!content ? content : ((e.target as HTMLDivElement).dataset.text as string),
      content2: !!content2 ? content2 : content2Text,
      content3: !!content3 ? content3 : content3Text,
      display: display,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (!!hoveredItemPosWrap) setHoveredItemPosWrap(null);
  };
  // ==================================== ✅ツールチップ✅ ====================================

  // ================== 🌟ユーザーの決算月の締め日を初回マウント時に取得🌟 ==================
  const fiscalEndMonthObjRef = useRef<Date | null>(null);
  const closingDayRef = useRef<number | null>(null);
  useEffect(() => {
    // ユーザーの決算月から締め日を取得、決算つきが未設定の場合は現在の年と3月31日を設定
    const fiscalEndMonth = userProfileState?.customer_fiscal_end_month
      ? new Date(userProfileState.customer_fiscal_end_month)
      : new Date(new Date().getFullYear(), 2, 31, 23, 59, 59, 999); // 決算日が未設定なら3月31日に自動設定
    const closingDay = fiscalEndMonth.getDate(); //ユーザーの締め日
    fiscalEndMonthObjRef.current = fiscalEndMonth; //refに格納
    closingDayRef.current = closingDay; //refに格納
  }, []);

  // 🔹現在の会計年度の12ヶ月間
  const annualFiscalMonths = useMemo(() => {
    if (!fiscalEndMonthObjRef.current) return null;
    if (!closingDayRef.current) return null;
    if (!userProfileState) return null;

    const currentFiscalYear = getFiscalYear(
      new Date(), // 会計年度順の12ヶ月間の月のみ取得できれば良いので、new Date()でOK
      fiscalEndMonthObjRef.current.getMonth() + 1,
      fiscalEndMonthObjRef.current.getDate(),
      userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis"
    );
    // 期首を取得
    const currentFiscalYearStartDate = calculateFiscalYearStart({
      fiscalYearEnd: fiscalEndMonthObjRef.current ?? userProfileState.customer_fiscal_end_month,
      fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis",
      selectedYear: currentFiscalYear,
    });

    if (!currentFiscalYearStartDate) return null;

    // 🔸現在の会計年度の開始年月度 期首の年月度を6桁の数値で取得 202404
    const newStartYearMonth = calculateDateToYearMonth(currentFiscalYearStartDate, closingDayRef.current);
    // 🔸年度初めから12ヶ月分の年月度の配列
    const fiscalMonths = calculateFiscalYearMonths(newStartYearMonth);

    return fiscalMonths;
  }, [fiscalEndMonthObjRef.current, closingDayRef.current]);

  // 上期の月のSetオブジェクト
  const firstHalfDetailSet = useMemo(() => {
    if (!annualFiscalMonths) return null;
    return new Set([
      String(annualFiscalMonths.month_01).substring(4),
      String(annualFiscalMonths.month_02).substring(4),
      String(annualFiscalMonths.month_03).substring(4),
      String(annualFiscalMonths.month_04).substring(4),
      String(annualFiscalMonths.month_05).substring(4),
      String(annualFiscalMonths.month_06).substring(4),
    ]);
  }, [annualFiscalMonths]);

  // 四半期のQ1とQ3の月のSetオブジェクト
  const quarterDetailsSet = useMemo(() => {
    if (!annualFiscalMonths) return null;
    return {
      firstQuarterMonthSet: new Set([
        String(annualFiscalMonths.month_01).substring(4),
        String(annualFiscalMonths.month_02).substring(4),
        String(annualFiscalMonths.month_03).substring(4),
      ]),
      thirdQuarterMonthSet: new Set([
        String(annualFiscalMonths.month_07).substring(4),
        String(annualFiscalMonths.month_08).substring(4),
        String(annualFiscalMonths.month_09).substring(4),
      ]),
    };
  }, [annualFiscalMonths]);
  // ================== ✅ユーザーの決算月の締め日を初回マウント時に取得✅ ==================

  // ================== 🌟シングルクリック、ダブルクリックイベント🌟 ==================
  // ダブルクリックで各フィールドごとに個別で編集
  const setTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // コンポーネントのクリーンアップで既存のタイマーがあればクリアする
  useEffect(() => {
    return () => {
      if (setTimeoutRef.current !== null) {
        clearTimeout(setTimeoutRef.current);
      }
    };
  }, []);
  // 選択行データが自社専用の会社データかどうか
  const isOurActivity =
    !!userProfileState?.company_id &&
    !!selectedRowDataActivity?.activity_created_by_company_id &&
    selectedRowDataActivity.activity_created_by_company_id === userProfileState.company_id;
  // 活動タイプが活動テーブルのものであるか => 面談・訪問、案件発生、見積は除外
  // const isNotActivityTypeArray: string[] = ["面談・訪問", "案件発生", "見積"];
  const isNotActivityTypeArray: string[] = ["meeting", "property", "quotation"];
  const isOurActivityAndIsTypeActivity =
    isOurActivity &&
    selectedRowDataActivity?.activity_type &&
    !isNotActivityTypeArray.includes(selectedRowDataActivity.activity_type);
  const returnMessageNotActivity = (type: string) => {
    switch (type) {
      // case "面談・訪問":
      case "meeting":
        return `活動タイプ「面談・訪問」のデータを活動画面から編集できるのは「次回フォロー予定日、フォロー完了フラグ、クレーム」のみです。それ以外はタブから「面談・訪問」をクリックして面談・訪問画面から編集してください。`;
        break;
      // case "案件発生":
      case "property":
        return `活動タイプ「案件発生」のデータを活動画面から編集できるのは「次回フォロー予定日、フォロー完了フラグ、クレーム」のみです。それ以外はタブから「案件」をクリックして案件画面から編集してください。`;
        break;
      // case "見積":
      case "quotation":
        return `活動タイプ「見積」のデータを活動画面から編集できるのは「次回フォロー予定日、フォロー完了フラグ、クレーム」のみです。それ以外タブから「見積」をクリックして見積画面から編集してください。`;
        break;

      default:
        return `このデータは活動画面から編集できません。`;
        break;
    }
  };

  // シングルクリック => 何もアクションなし
  const handleSingleClickField = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      // 自社で作成した会社でない場合はそのままリターン
      if (!isOurActivity) return;
      if (setTimeoutRef.current !== null) return;

      setTimeoutRef.current = setTimeout(() => {
        setTimeoutRef.current = null;
        // シングルクリック時に実行したい処理
        // 0.2秒後に実行されてしまうためここには書かない
      }, 200);
      console.log("シングルクリック");
    },
    [isOurActivity]
  );

  // const originalOptionRef = useRef(""); // 同じ選択肢選択時にエディットモード終了用
  // 編集前のダブルクリック時の値を保持 => 変更されたかどうかを確認
  const originalValueFieldEdit = useRef<string | null>("");
  type DoubleClickProps = {
    e: React.MouseEvent<HTMLSpanElement>;
    field: string;
    dispatch: React.Dispatch<React.SetStateAction<any>>;
    // isSelectChangeEvent?: boolean;
    dateValue?: string | null;
    selectedRowDataValue?: any;
  };
  // ダブルクリック => ダブルクリックしたフィールドを編集モードに変更
  const handleDoubleClickField = useCallback(
    ({ e, field, dispatch, dateValue, selectedRowDataValue }: DoubleClickProps) => {
      // 自社で作成した会社でない場合はそのままリターン
      if (!isOurActivity) return;

      console.log(
        "ダブルクリック",
        "field",
        field,
        "e.currentTarget.innerText",
        e.currentTarget.innerText,
        "e.currentTarget.innerHTML",
        e.currentTarget.innerHTML,
        "selectedRowDataValue",
        selectedRowDataValue && selectedRowDataValue
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
        // // 「活動日付」「次回フォロー予定日」はinnerHTMLではなく元々の値を格納
        if (["activity_date", "scheduled_follow_up_date"].includes(field)) {
          const originalDate = dateValue ? new Date(dateValue) : null;
          console.log("ダブルクリック 日付格納", dateValue);
          // originalValueFieldEdit.current = originalDate;
          dispatch(originalDate); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
          setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
          return;
        }
        originalValueFieldEdit.current = text;
        dispatch(text); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
        setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
        // if (isSelectChangeEvent) originalOptionRef.current = e.currentTarget.innerText; // selectタグ同じ選択肢選択時の編集モード終了用
      }
    },
    [isOurActivity, setIsEditModeField]
  );
  // ================== ✅シングルクリック、ダブルクリックイベント✅ ==================

  // プロパティ名のユニオン型の作成
  // Activity_row_data型の全てのプロパティ名をリテラル型のユニオンとして展開
  // type ActivityFieldNames = keyof Activity_row_data;
  type ActivityFieldNames = keyof Activity;
  type ExcludeKeys = "company_id" | "contact_id" | "activity_id"; // 除外するキー
  type ActivityFieldNamesForSelectedRowData = Exclude<keyof Activity_row_data, ExcludeKeys>; // Activity_row_dataタイプのプロパティ名のみのデータ型を取得
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
    fieldName: ActivityFieldNames;
    fieldNameForSelectedRowData: ActivityFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
  }) => {
    // 日本語入力変換中はtrueで変換確定のエンターキーではUPDATEクエリが実行されないようにする
    // 英語などの入力変換が存在しない言語ではisCompositionStartは発火しないため常にfalse
    if (e.key === "Enter" && !isComposing) {
      if (required && (newValue === "" || newValue === null)) return toast.info(`この項目は入力が必須です。`);

      // 先にアンダーラインが残らないようにremoveしておく
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

      if (!id || !selectedRowDataActivity) {
        toast.error(`エラー：データが見つかりませんでした。`);
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
          toast.error(`エラー：有効なデータではありません。`);
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
      await updateActivityFieldMutation.mutateAsync(updatePayload);
      originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
      setIsEditModeField(null); // エディットモードを終了
    }
  };
  // ================== ✅エンターキーで個別フィールドをアップデート inputタグ✅ ==================
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
    fieldName: ActivityFieldNames;
    fieldNameForSelectedRowData: ActivityFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
  }) => {
    if (required && (newValue === "" || newValue === null)) return toast.info(`この項目は入力が必須です。`);

    if (["summary"].includes(fieldName)) {
      e.currentTarget.parentElement?.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
    } else {
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
    }

    if (!id || !selectedRowDataActivity) {
      toast.error(`エラー：データが見つかりませんでした。`);
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
        toast.error(`エラー：有効なデータではありません。`);
        return console.log("決裁金額が数値を含まないエラー リターン");
      }
    }
    // 「活動日付」「次回フォロー予定日」はどちらもUTC時間の文字列「2023-12-26T15:00:00+00:00」で取得しているためそのまま同じかチェック
    else if (["activity_date", "scheduled_follow_up_date"].includes(fieldName)) {
      console.log("フィールドアップデート 日付チェック オリジナル", originalValue, "変換前 新たな値", newValue);
      // 前回と今回も両方nullの場合はアップデート無しなので、リターンする
      if (originalValue === null && newValue === null) {
        console.log("日付チェック 前回も今回もnullのためリターン");
        setIsEditModeField(null); // エディットモードを終了
        return;
      }
      // 年月日のみで同じ日付か比較
      const result = isSameDateLocal(originalValue, newValue);
      if (result) {
        console.log("日付チェック 同じためリターン");
        setIsEditModeField(null); // エディットモードを終了
        return;
      } else {
        console.log("日付チェック 新たな日付のためこのまま更新 newValue", newValue);
        // フィールドがactivity_date（活動日）の場合は活動年月度も同時に更新
        if (fieldName === "activity_date") {
          if (!closingDayRef.current || !fiscalEndMonthObjRef.current) {
            alert("決算日データが取得できませんでした。エラー：AMC02");
            return toast.error("決算日データが確認できないため、活動を更新できませんでした...🙇‍♀️");
          }
          if (!firstHalfDetailSet || !quarterDetailsSet) {
            alert("会計年度データが取得できませんでした。エラー：AMC03");
            return toast.error("会計年度データが確認できないため、活動を更新できませんでした...🙇‍♀️");
          }
          // if (!(newValue instanceof Date)) return toast.error("エラー：無効な日付です。");
          type ExcludeKeys = "company_id" | "contact_id" | "activity_id"; // 除外するキー idはUPDATEすることは無いため
          type ActivityFieldNamesForSelectedRowData = Exclude<keyof Activity_row_data, ExcludeKeys>;
          type UpdateObject = {
            fieldName: string;
            fieldNameForSelectedRowData: ActivityFieldNamesForSelectedRowData;
            newValue: any;
          };

          const fiscalYearMonth = calculateDateToYearMonth(new Date(newValue), closingDayRef.current);
          console.log("新たに生成された年月度", fiscalYearMonth);

          if (!fiscalYearMonth) return toast.error("日付の更新に失敗しました。");

          // -------- 面談年度~四半期を算出 --------
          // 選択した日付の会計年度
          const selectedFiscalYear = getFiscalYear(
            new Date(newValue),
            fiscalEndMonthObjRef.current.getMonth() + 1,
            fiscalEndMonthObjRef.current.getDate(),
            userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis"
          );

          // 上期と下期どちらを選択中か更新
          const _activityMonth = String(fiscalYearMonth).substring(4);
          const halfDetailValue = firstHalfDetailSet.has(_activityMonth) ? 1 : 2;

          // 半期
          const activityHalfYear = selectedFiscalYear * 10 + halfDetailValue;

          // 四半期
          let activityQuarter = 0;
          // 上期ルート
          if (halfDetailValue === 1) {
            // Q1とQ2どちらを選択中か更新
            const firstQuarterSet = quarterDetailsSet.firstQuarterMonthSet;
            const quarterValue = firstQuarterSet.has(_activityMonth) ? 1 : 2;
            activityQuarter = selectedFiscalYear * 10 + quarterValue;
          }
          // 下期ルート
          else {
            // Q3とQ4どちらを選択中か更新
            const thirdQuarterSet = quarterDetailsSet.thirdQuarterMonthSet;
            const quarterValue = thirdQuarterSet.has(_activityMonth) ? 3 : 4;
            activityQuarter = selectedFiscalYear * 10 + quarterValue;
          }

          if (activityQuarter === 0) {
            return alert("会計年度データが取得できませんでした。エラー: AMC04");
          }
          if (String(activityHalfYear).length !== 5 || String(activityQuarter).length !== 5) {
            if (String(activityHalfYear).length !== 5)
              return alert("会計年度データが取得できませんでした。エラー: AMC05");
            if (String(activityQuarter).length !== 5)
              return alert("会計年度データが取得できませんでした。エラー: AMC06");
          }
          // -------- 面談年度~四半期を算出 --------

          const updatePayload = {
            updateArray: [
              {
                fieldName: fieldName,
                fieldNameForSelectedRowData: fieldNameForSelectedRowData,
                newValue: !!newValue ? newValue : null,
              },
              {
                fieldName: "activity_year_month",
                fieldNameForSelectedRowData: "activity_year_month",
                newValue: !!fiscalYearMonth ? fiscalYearMonth : null,
              },
              {
                fieldName: "activity_quarter",
                fieldNameForSelectedRowData: "activity_quarter",
                newValue: !!activityQuarter ? activityQuarter : null,
              },
              {
                fieldName: "activity_half_year",
                fieldNameForSelectedRowData: "activity_half_year",
                newValue: !!activityHalfYear ? activityHalfYear : null,
              },
              {
                fieldName: "activity_fiscal_year",
                fieldNameForSelectedRowData: "activity_fiscal_year",
                newValue: !!selectedFiscalYear ? selectedFiscalYear : null,
              },
            ] as UpdateObject[],
            id: id,
          };

          // 入力変換確定状態でエンターキーが押された場合の処理
          console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
          await updateActivityMultipleFieldMutation.mutateAsync(updatePayload);
          originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
          setIsEditModeField(null); // エディットモードを終了
          return;
        }
      }
    }
    // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン null = null ''とnullもリターン textareaはnullの場合表示は空文字でされているため
    else if ((!required && originalValue === newValue) || (!originalValue && !newValue)) {
      console.log(
        "決裁金額、日付以外でチェック 同じためリターン",
        "originalValue",
        originalValue,
        "newValue",
        newValue
      );
      setIsEditModeField(null); // エディットモードを終了
      return;
    }

    // requiredがfalseで入力必須ではないので、newValueがnullや空文字、0は許容(空文字や0をnullにするかどうかは各フィールドごとに個別で管理する)

    const updatePayload = {
      fieldName: fieldName,
      fieldNameForSelectedRowData: fieldNameForSelectedRowData,
      newValue: newValue,
      id: id,
    };
    // 入力変換確定状態でエンターキーが押された場合の処理
    console.log("sendアイコンクリックでUPDATE実行 updatePayload", updatePayload);
    await updateActivityFieldMutation.mutateAsync(updatePayload);
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
    fieldName: ActivityFieldNames;
    fieldNameForSelectedRowData: ActivityFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
  }) => {
    e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

    if (!id || !selectedRowDataActivity) {
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
      newValue: newValue !== "" ? newValue : null,
      id: id,
    };
    // 入力変換確定状態でエンターキーが押された場合の処理
    console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
    await updateActivityFieldMutation.mutateAsync(updatePayload);
    originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
    setIsEditModeField(null); // エディットモードを終了
  };
  // ================== ✅セレクトボックスで個別フィールドをアップデート ==================

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

  // フィールドエディットタイトル
  const fieldEditTitle = (title: string) => (isEditModeField === title ? `${styles.field_edit}` : ``);

  // -------------------------- 🌠サーチモード input下の追加エリア関連🌠 --------------------------
  // ツールチップ
  const additionalInputTooltipText = (index: number) =>
    index === 0 ? `空欄以外のデータのみ抽出` : `空欄のデータのみ抽出`;

  // 🔸「入力値をリセット」をクリック
  const handleClickResetInput = (
    dispatch: Dispatch<SetStateAction<any>>,
    inputType: "string" | "range_string" | "range_date" | "array" = "string"
  ) => {
    handleCloseTooltip();

    if (inputType === "array") {
      dispatch([]);
    } else if (inputType === "range_string") {
      dispatch({ min: "", max: "" });
    } else if (inputType === "range_date") {
      dispatch({ min: null, max: null });
    } else if (inputType === "string") {
      dispatch("");
    }
  };

  // 🔸製品分類用「入力値をリセット」
  const handleResetArray = (
    fieldName:
      | "category_large"
      | "category_medium"
      | "category_small"
      | "number_of_employees_class"
      | "industry_type_id"
      | "fiscal_end_month"
      | "budget_request_month1"
      | "budget_request_month2"
      | "position_class"
      | "occupation"
      | "activity_type"
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
    if (fieldName === "budget_request_month1") {
      if (isNullNotNullBudgetRequestMonth1 !== null) setIsNullNotNullBudgetRequestMonth1(null);
      if (0 < inputBudgetRequestMonth1Array.length) setInputBudgetRequestMonth1Array([]);
    }
    if (fieldName === "budget_request_month2") {
      if (isNullNotNullBudgetRequestMonth2 !== null) setIsNullNotNullBudgetRequestMonth2(null);
      if (0 < inputBudgetRequestMonth2Array.length) setInputBudgetRequestMonth2Array([]);
    }
    if (fieldName === "position_class") {
      if (isNullNotNullPositionClass !== null) setIsNullNotNullPositionClass(null);
      if (0 < inputPositionClassArray.length) setInputPositionClassArray([]);
    }
    if (fieldName === "occupation") {
      if (isNullNotNullOccupation !== null) setIsNullNotNullOccupation(null);
      if (0 < inputOccupationArray.length) setInputOccupationArray([]);
    }
    if (fieldName === "activity_type") {
      if (isNullNotNullActivityType !== null) setIsNullNotNullActivityType(null);
      if (0 < inputActivityTypeArray.length) setInputActivityTypeArray([]);
    }
  };

  // 🔸製品分類全てリセット
  const resetProductCategories = (type: "lms" | "ms" | "s") => {
    if (type === "lms" && 0 < inputProductArrayLarge.length) setInputProductArrayLarge([]);
    if (["lms", "ms"].includes(type) && 0 < inputProductArrayMedium.length) setInputProductArrayMedium([]);
    if (["lms", "ms", "s"].includes(type) && 0 < inputProductArraySmall.length) setInputProductArraySmall([]);
  };

  // 🔸「入力有り」をクリック
  const handleClickIsNotNull = (dispatch: Dispatch<SetStateAction<any>>) => {
    return dispatch("is not null");
  };

  // 🔸「入力無し」をクリック
  const handleClickIsNull = (dispatch: Dispatch<SetStateAction<any>>) => {
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
      | "industry_type_id"
      | "fiscal_end_month"
      | "budget_request_month1"
      | "budget_request_month2"
      | "position_class"
      | "occupation"
      | "activity_type" = ""
  ) => {
    if (type === "category_large") resetProductCategories("lms");
    if (type === "category_medium") resetProductCategories("ms");
    if (type === "category_small") resetProductCategories("s");
    if (type === "number_of_employees_class") setInputEmployeesClassArray([]);
    if (type === "industry_type_id") setInputIndustryTypeArray([]);
    if (type === "fiscal_end_month") setInputFiscalArray([]);
    if (type === "budget_request_month1") setInputBudgetRequestMonth1Array([]);
    if (type === "budget_request_month2") setInputBudgetRequestMonth2Array([]);
    if (type === "position_class") setInputPositionClassArray([]);
    if (type === "occupation") setInputOccupationArray([]);
    if (type === "activity_type") setInputActivityTypeArray([]);

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
    "🔥 ActivityMainContainerレンダリング searchMode",
    "selectedRowDataActivity",
    selectedRowDataActivity,
    // "inputEmployeesClassArray",
    // inputEmployeesClassArray,
    // "selectedEmployeesClassArraySet",
    // selectedEmployeesClassArraySet,
    // "isNullNotNullEmployeesClass",
    // isNullNotNullEmployeesClass,
    // "inputIndustryTypeArray",
    // inputIndustryTypeArray,
    // "selectedIndustryTypeArraySet",
    // selectedIndustryTypeArraySet,
    // "isNullNotNullIndustryType",
    // isNullNotNullIndustryType,
    // "inputFiscalArray",
    // inputFiscalArray,
    // "selectedFiscalArraySet",
    // selectedFiscalArraySet,
    // "isNullNotNullFiscal",
    // isNullNotNullFiscal,
    // "inputOccupationArray",
    // inputOccupationArray,
    // "selectedOccupationArraySet",
    // selectedOccupationArraySet,
    // "isNullNotNullOccupation",
    // isNullNotNullOccupation,
    // "inputPositionClassArray",
    // inputPositionClassArray,
    // "selectedPositionClassArraySet",
    // selectedPositionClassArraySet,
    // "isNullNotNullPositionClass",
    // isNullNotNullPositionClass,
    // "inputApprovalAmountSearch",
    // inputApprovalAmountSearch,
    // "inputCapitalSearch",
    // inputCapitalSearch,
    "inputActivityTypeArray",
    inputActivityTypeArray,
    "selectedActivityTypeArraySet",
    selectedActivityTypeArraySet,
    "isNullNotNullActivityType",
    isNullNotNullActivityType,
    "inputActivityDateSearch",
    inputActivityDateSearch,
    "inputScheduledFollowUpDateSearch",
    inputScheduledFollowUpDateSearch
    // searchMode,
    // "useMedia isDesktopGTE1600",
    // isDesktopGTE1600,
    // "事業部useQuery",
    // departmentDataArray,
    // "課useQuery",
    // sectionDataArray,
    // "係useQuery",
    // unitDataArray,
    // "事業所useQuery",
    // officeDataArray,
    // "selectedRowDataActivity",
    // selectedRowDataActivity
    // "selectedRowDataActivity.scheduled_follow_up_date",
    // selectedRowDataActivity?.scheduled_follow_up_date,
    // selectedRowDataActivity?.scheduled_follow_up_date &&
    //   (selectedRowDataActivity.scheduled_follow_up_date as any) instanceof Date,
    // typeof selectedRowDataActivity?.scheduled_follow_up_date === "string",
  );

  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  return (
    <form
      className={`${styles.main_container} w-full ${!!isEditModeField ? `${styles.is_edit_mode}` : ``} ${
        isEditModeField ? styles.field_edit_mode : ``
      }`}
      onSubmit={handleSearchSubmit}
    >
      {/* ------------------------- スクロールコンテナ ------------------------- */}
      <div
        ref={scrollContainerRef}
        className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${
          tableContainerSize === "half" && underDisplayFullScreen ? `${styles.height_all}` : ``
        } ${tableContainerSize === "all" && underDisplayFullScreen ? `${styles.height_all}` : ``} ${
          searchMode ? `${styles.is_search_mode}` : ``
        }`}
      >
        {/* ---------------- 通常モード 左コンテナ ---------------- */}
        {!searchMode && (
          <div
            // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
            className={`${styles.left_container} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full  pb-[35px] pt-[5px] ${
              tableContainerSize === "one_third"
                ? `min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)]`
                : `min-w-[calc((100vw-var(--sidebar-width))/3-14px)] max-w-[calc((100vw-var(--sidebar-width))/3-14px)]`
            }`} // ラージ、ミディアムは右paddingに10px追加されるため10pxを３等分で割り振る
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* 左エリア 活動~クレームまで */}
              {/* 活動日・クレーム 通常 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.min} ${fieldEditTitle("activity_date")}`}>活動日</span>
                    {!searchMode && isEditModeField !== "activity_date" && (
                      <span
                        className={`${styles.value} ${isOurActivity ? styles.editable_field : styles.uneditable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataActivity?.activity_type) return;
                          if (isNotActivityTypeArray.includes(selectedRowDataActivity.activity_type)) {
                            return alert(returnMessageNotActivity(selectedRowDataActivity.activity_type));
                          }
                          handleDoubleClickField({
                            e,
                            field: "activity_date",
                            dispatch: setInputActivityDateForFieldEditMode,
                            dateValue: selectedRowDataActivity?.activity_date
                              ? selectedRowDataActivity.activity_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataActivity?.activity_date
                            ? format(new Date(selectedRowDataActivity.activity_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || isOpenSidebar) handleOpenTooltip({ e });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataActivity?.activity_date
                          ? format(new Date(selectedRowDataActivity.activity_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {!searchMode && isEditModeField === "activity_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputActivityDateForFieldEditMode}
                            setStartDate={setInputActivityDateForFieldEditMode}
                            required={true}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updateActivityMultipleFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputActivityDateForFieldEditMode) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataActivity?.activity_date
                                ? selectedRowDataActivity.activity_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputActivityDateForFieldEditMode
                                ? inputActivityDateForFieldEditMode.toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputActivityDateForFieldEditMode,
                                "新たな値(Dateオブジェクト).toISOString()",
                                newDateUTCString
                                // "同じかチェック結果",
                                // result
                              );
                              if (e.currentTarget.parentElement?.parentElement?.parentElement)
                                e.currentTarget.parentElement.parentElement.parentElement.classList.remove(
                                  `${styles.active}`
                                );
                              // オリジナルはUTC、新たな値はDateオブジェクト(ローカルタイムゾーン)なのでISOString()でUTCに変換
                              handleClickSendUpdateField({
                                e,
                                fieldName: "activity_date",
                                fieldNameForSelectedRowData: "activity_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataActivity?.activity_id,
                                required: true,
                              });
                            }}
                            fontSize={`!text-[13px]`}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "activity_date" && (
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
                    <span className={`${styles.check_title}`}>クレーム</span>
                    {!searchMode && (
                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataActivity) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataActivity) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataActivity ? `pointer-events-none cursor-not-allowed` : ``
                          }`}
                          // checked={!!selectedRowDataActivity?.claim_flag}
                          // onChange={() => {
                          //   // setLoadingGlobalState(false);
                          //   setIsOpenUpdateActivityModal(true);
                          // }}
                          // 個別にチェックボックスを更新するルート
                          checked={checkboxClaimFlagForFieldEdit}
                          onChange={async (e) => {
                            if (!selectedRowDataActivity) return;
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataActivity?.activity_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);

                            console.log(
                              "チェック 新しい値",
                              !checkboxClaimFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataActivity?.claim_flag
                            );
                            if (!checkboxClaimFlagForFieldEdit === selectedRowDataActivity?.claim_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "claim_flag",
                              fieldNameForSelectedRowData: "claim_flag" as "claim_flag",
                              newValue: !checkboxClaimFlagForFieldEdit,
                              id: selectedRowDataActivity.activity_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updateActivityFieldMutation.mutate(updatePayload);
                            setCheckboxClaimFlagForFieldEdit(!checkboxClaimFlagForFieldEdit);
                          }}
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
                    {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 活動タイプ・優先度 通常 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.min} ${fieldEditTitle("activity_type")}`}>活動ﾀｲﾌﾟ</span>
                    {!searchMode && isEditModeField !== "activity_type" && (
                      <span
                        className={`${styles.value} ${
                          isOurActivityAndIsTypeActivity ? styles.editable_field : styles.uneditable_field
                        }`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataActivity?.activity_type) return;
                          if (isNotActivityTypeArray.includes(selectedRowDataActivity.activity_type))
                            return alert(returnMessageNotActivity(selectedRowDataActivity.activity_type));
                          handleDoubleClickField({
                            e,
                            field: "activity_type",
                            dispatch: setInputActivityType,
                            selectedRowDataValue: selectedRowDataActivity?.activity_type ?? "",
                          });
                          if (hoveredItemPosWrap) handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataActivity?.activity_type
                            ? getActivityType(selectedRowDataActivity?.activity_type)
                            : ""
                        }`}
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
                        {selectedRowDataActivity?.activity_type
                          ? getActivityType(selectedRowDataActivity?.activity_type)
                          : ""}
                      </span>
                    )}

                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "activity_type" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputActivityType}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "activity_type",
                              fieldNameForSelectedRowData: "activity_type",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataActivity?.activity_id,
                            });
                          }}
                          // onChange={(e) => {
                          //   setInputActivityType(e.target.value);
                          // }}
                        >
                          {/* <option value=""></option> */}
                          {optionsActivityType.map((option) => (
                            <option key={option} value={option}>
                              {getActivityType(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updateActivityFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "activity_type" && (
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
                    <span className={`${styles.check_title}`}>優先度</span>
                    {!searchMode && isEditModeField !== "priority" && (
                      <span
                        className={`${styles.value} !w-full text-center ${
                          isOurActivityAndIsTypeActivity ? styles.editable_field : styles.uneditable_field
                        }`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataActivity?.activity_type) return;
                          if (isNotActivityTypeArray.includes(selectedRowDataActivity.activity_type))
                            return alert(returnMessageNotActivity(selectedRowDataActivity.activity_type));
                          handleDoubleClickField({
                            e,
                            field: "priority",
                            dispatch: setInputPriority,
                          });
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.priority ? getPriorityName(selectedRowDataActivity?.priority) : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "priority" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputPriority}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "priority",
                              fieldNameForSelectedRowData: "priority",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataActivity?.activity_id,
                            });
                          }}
                        >
                          <option value=""></option>
                          {optionsPriority.map((option) => (
                            <option key={option} value={option}>
                              {getPriorityName(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updateActivityFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "priority" && (
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

              {/* 次回フォロー予定日・フォロー完了 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div
                      className={`${styles.title} ${styles.min} flex flex-col ${fieldEditTitle(
                        "scheduled_follow_up_date"
                      )}`}
                    >
                      <span>次回ﾌｫﾛｰ</span>
                      <span>予定日</span>
                    </div>
                    {!searchMode && isEditModeField !== "scheduled_follow_up_date" && (
                      <span
                        className={`${styles.value} ${isOurActivity ? styles.editable_field : styles.uneditable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          handleDoubleClickField({
                            e,
                            field: "scheduled_follow_up_date",
                            dispatch: setInputScheduledFollowUpDateForFieldEditMode,
                            dateValue: selectedRowDataActivity?.scheduled_follow_up_date
                              ? selectedRowDataActivity.scheduled_follow_up_date
                              : null,
                          });
                        }}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataActivity) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataActivity) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.scheduled_follow_up_date ? (
                          format(new Date(selectedRowDataActivity.scheduled_follow_up_date), "yyyy/MM/dd")
                        ) : !!selectedRowDataActivity ? (
                          <AiTwotoneCalendar
                            className={`text-[20px] ${isOurActivity ? `hover:text-[var(--color-bg-brand-f)]` : ``}`}
                          />
                        ) : (
                          ""
                        )}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {!searchMode && isEditModeField === "scheduled_follow_up_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputScheduledFollowUpDateForFieldEditMode}
                            setStartDate={setInputScheduledFollowUpDateForFieldEditMode}
                            // required={true}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updateActivityFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              const originalDateUTCString = selectedRowDataActivity?.scheduled_follow_up_date
                                ? selectedRowDataActivity.scheduled_follow_up_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputScheduledFollowUpDateForFieldEditMode
                                ? inputScheduledFollowUpDateForFieldEditMode.toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputScheduledFollowUpDateForFieldEditMode,
                                "新たな値.toISO(UTC)",
                                newDateUTCString
                                // "同じかチェック結果",
                                // result
                              );
                              if (e.currentTarget.parentElement?.parentElement?.parentElement)
                                e.currentTarget.parentElement.parentElement.parentElement.classList.remove(
                                  `${styles.active}`
                                );
                              // オリジナルはUTC、新たな値はDateオブジェクト(ローカルタイムゾーン)なのでISOString()でUTCに変換
                              handleClickSendUpdateField({
                                e,
                                fieldName: "scheduled_follow_up_date",
                                fieldNameForSelectedRowData: "scheduled_follow_up_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataActivity?.activity_id,
                                required: false,
                              });
                            }}
                            fontSize={`!text-[13px]`}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "scheduled_follow_up_date" && (
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
                {selectedRowDataActivity?.scheduled_follow_up_date && (
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.check_title}`}>フォロー完了</span>
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
                          // checked={!!selectedRowDataActivity?.follow_up_flag}
                          // onChange={() => {
                          //   setLoadingGlobalState(false);
                          //   setIsOpenUpdateActivityModal(true);
                          // }}
                          // 個別にチェックボックスを更新するルート
                          checked={checkboxFollowUpFlagForFieldEdit}
                          onChange={async (e) => {
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataActivity?.activity_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);
                            console.log(
                              "チェック 新しい値",
                              !checkboxFollowUpFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataActivity?.follow_up_flag
                            );
                            if (!checkboxFollowUpFlagForFieldEdit === selectedRowDataActivity?.follow_up_flag) {
                              console.log(
                                `selectedRowDataActivity?.follow_up_flag`,
                                selectedRowDataActivity?.follow_up_flag,
                                "checkboxFollowUpFlagForFieldEdit",
                                checkboxFollowUpFlagForFieldEdit,
                                "selectedRowDataActivity",
                                selectedRowDataActivity
                              );
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "follow_up_flag",
                              fieldNameForSelectedRowData: "follow_up_flag" as "follow_up_flag",
                              newValue: !checkboxFollowUpFlagForFieldEdit,
                              id: selectedRowDataActivity.activity_id,
                            };
                            // 直感的にするためにmutateAsyncではなくmutateにして非同期処理のまま更新関数でローカルのチェックボックスを更新する
                            updateActivityFieldMutation.mutate(updatePayload);
                            setCheckboxFollowUpFlagForFieldEdit(!checkboxFollowUpFlagForFieldEdit);
                          }}
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

              {/* 概要 通常 */}
              {/* <div className={`${styles.row_area} flex h-[90px] w-full items-center`}> */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title} ${styles.title_sm}`}>概要</span>
                    {!searchMode && isEditModeField !== "summary" && (
                      <div
                        // data-text={`${selectedRowDataActivity?.summary ? selectedRowDataActivity?.summary : ""}`}
                        className={`${styles.textarea_box} ${
                          isOurActivityAndIsTypeActivity ? styles.editable_field : styles.uneditable_field
                        } ${
                          !isNotActivityTypeArray.includes(selectedRowDataActivity?.activity_type ?? "")
                            ? `${styles.active}`
                            : ``
                        }`}
                        // style={{ whiteSpace: "pre-wrap" }}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataActivity?.activity_type) return;
                          if (isNotActivityTypeArray.includes(selectedRowDataActivity.activity_type))
                            return alert(returnMessageNotActivity(selectedRowDataActivity.activity_type));
                          handleCloseTooltip();
                          handleDoubleClickField({
                            e,
                            field: "summary",
                            dispatch: setInputSummary,
                            selectedRowDataValue: selectedRowDataActivity?.summary
                              ? selectedRowDataActivity?.summary
                              : null,
                          });
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          // if (!selectedRowDataActivity?.activity_type) return;
                          // if (
                          //   isNotActivityTypeArray.includes(selectedRowDataActivity.activity_type) ||
                          //   !selectedRowDataActivity?.summary
                          // ) {
                          //   return;
                          // }
                          // handleOpenTooltip({e});
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          // if (!selectedRowDataActivity?.activity_type) return;
                          // if (
                          //   isNotActivityTypeArray.includes(selectedRowDataActivity.activity_type) ||
                          //   !selectedRowDataActivity?.summary
                          // ) {
                          //   return;
                          // }
                          // handleCloseTooltip();
                        }}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataActivity?.summary
                            ? selectedRowDataActivity?.summary.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></div>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード inputタグ */}
                    {!searchMode && isEditModeField === "summary" && (
                      <>
                        <textarea
                          cols={30}
                          // rows={10}
                          placeholder=""
                          style={{ whiteSpace: "pre-wrap" }}
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                          value={inputSummary}
                          onChange={(e) => setInputSummary(e.target.value)}
                        ></textarea>
                        {/* 送信ボタンとクローズボタン */}
                        <InputSendAndCloseBtn
                          inputState={inputSummary}
                          setInputState={setInputSummary}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "summary",
                              fieldNameForSelectedRowData: "summary",
                              originalValue: originalValueFieldEdit.current,
                              newValue: inputSummary ? inputSummary.trim() : null,
                              id: selectedRowDataActivity?.activity_id,
                              required: false,
                            })
                          }
                          required={false}
                          // isDisplayClose={true}
                          // btnPositionY="bottom-[8px]"
                          isOutside={true}
                          outsidePosition="under_right"
                          isLoadingSendEvent={updateActivityFieldMutation.isLoading}
                        />
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "summary" && (
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

              {/* 事業部名 通常 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.min}`}>事業部名</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity?.assigned_department_name
                            ? selectedRowDataActivity?.assigned_department_name
                            : ""
                        }`}
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
                        {selectedRowDataActivity?.assigned_department_name
                          ? selectedRowDataActivity?.assigned_department_name
                          : ""}
                        {/* {selectedRowDataActivity?.department ? selectedRowDataActivity?.department : ""} */}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                {/* 係・チーム 通常 */}
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} ${styles.min}`}>係・ﾁｰﾑ</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity?.assigned_unit_name ? selectedRowDataActivity?.assigned_unit_name : ""
                        }`}
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
                        {selectedRowDataActivity?.assigned_unit_name ? selectedRowDataActivity?.assigned_unit_name : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 課セクション・自社担当 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.min}`}>課・ｾｸｼｮﾝ</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.assigned_section_name
                          ? selectedRowDataActivity?.assigned_section_name
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} ${styles.min}`}>自社担当</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.member_name ? selectedRowDataActivity?.member_name : ""}
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
                    <span className={`${styles.title} ${styles.min}`}>事業所</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.assigned_office_name
                          ? selectedRowDataActivity?.assigned_office_name
                          : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} ${styles.min}`}>自社担当</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.member_name ? selectedRowDataActivity?.member_name : ""}
                      </span>
                    )}
                    {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 実施1・実施2 */}
              <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.min}`}>実施1</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
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
                    <span className={`${styles.title} ${styles.min}`}>実施2</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
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
                    <span className={`${styles.title} ${styles.min}`}>実施3</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
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
                    <span className={`${styles.title} ${styles.min}`}>実施4</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
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
                    <span className={`${styles.title} ${styles.min}`}>実施5</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
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
                          onMouseEnter={(e) => handleOpenTooltip({e})}
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
                        checked={!!selectedRowDataActivity?.call_careful_flag}
                        readOnly
                        // onChange={() => {}}
                        onClick={() => alert("「TEL要注意フラグ」は担当者画面から編集可能です。")}
                        className={`${styles.grid_select_cell_header_input} ${
                          !selectedRowDataActivity ? `pointer-events-none` : ``
                        }`}
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
                    <span className={`${styles.title} ${styles.min}`}>注意理由</span>
                    {!searchMode && (
                      <span
                        data-text={`${
                          selectedRowDataActivity?.call_careful_reason
                            ? selectedRowDataActivity?.call_careful_reason
                            : ""
                        }`}
                        className={`${styles.value} ${
                          selectedRowDataActivity?.call_careful_reason ? `${styles.uneditable_field}` : ``
                        }`}
                        // onMouseEnter={(e) => handleOpenTooltip(e, "right")}
                        // onMouseLeave={handleCloseTooltip}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataActivity) return;
                          alert("「注意理由」は担当者画面から編集可能です。");
                        }}
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
                        checked={!!selectedRowDataActivity?.email_ban_flag}
                        readOnly
                        onClick={() => alert("「メール禁止フラグ」は担当者画面から編集可能です。")}
                        className={`${styles.grid_select_cell_header_input} ${
                          !selectedRowDataActivity ? `pointer-events-none` : ``
                        }`}
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
                        checked={!!selectedRowDataActivity?.sending_materials_ban_flag}
                        readOnly
                        onClick={() => alert("「資料禁止フラグ」は担当者画面から編集可能です。")}
                        className={`${styles.grid_select_cell_header_input} ${
                          !selectedRowDataActivity ? `pointer-events-none` : ``
                        }`}
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
                        checked={!!selectedRowDataActivity?.fax_dm_ban_flag}
                        readOnly
                        onClick={() => alert("「FAX・DM禁止フラグ」は担当者画面から編集可能です。")}
                        className={`${styles.grid_select_cell_header_input} ${
                          !selectedRowDataActivity ? `pointer-events-none` : ``
                        }`}
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
              {/* <div className={`${styles.row_area} flex h-[70px] w-full items-center`}> */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title}`}>禁止理由</span>
                    {!searchMode && (
                      <div
                        // data-text={`${selectedRowDataActivity?.ban_reason ? selectedRowDataActivity?.ban_reason : ""}`}
                        // className={`${styles.value} h-[65px]`}
                        className={`${styles.value} ${
                          !!selectedRowDataActivity?.ban_reason
                            ? `${styles.textarea_box} ${styles.one_third}`
                            : styles.textarea_value
                        } ${!!selectedRowDataActivity?.ban_reason ? `${styles.uneditable_field}` : ``}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataActivity) return;
                          alert("「禁止理由」は担当者画面から編集可能です。");
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
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
              {/* <div className={`${styles.row_area} flex h-[70px] w-full items-center`}> */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full  `}>
                    <span className={`${styles.title}`}>クレーム</span>
                    {!searchMode && (
                      <div
                        data-text={`${selectedRowDataActivity?.claim ? selectedRowDataActivity?.claim : ""}`}
                        // className={`${styles.value} h-[65px]`}
                        className={`${styles.value} ${
                          !!selectedRowDataActivity?.claim
                            ? `${styles.textarea_box} ${styles.one_third}`
                            : styles.textarea_value
                        } ${selectedRowDataActivity?.claim ? `${styles.uneditable_field}` : ``}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataActivity) return;
                          alert("「クレーム内容」は担当者画面から編集可能です。");
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
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
            } h-full  grow bg-[aqua]/[0] pb-[35px] pt-[5px] ${
              tableContainerSize === "one_third"
                ? `min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)]`
                : `min-w-[calc((100vw-var(--sidebar-width))/3-14px)] max-w-[calc((100vw-var(--sidebar-width))/3-14px)]`
            }`}
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
                      <span className={`${styles.title} ${styles.min}`}>●会社名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value} ${styles.value_highlight} ${styles.editable_field} hover:text-[var(--color-bg-brand-f)]`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                          onClick={() => setIsOpenClientCompanyDetailModal(true)}
                        >
                          {selectedRowDataActivity?.company_name ? selectedRowDataActivity?.company_name : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <input
                          type="text"
                          placeholder="株式会社○○"
                          autoFocus
                          className={`${styles.input_box}`}
                          value={inputCompanyName}
                          onChange={(e) => setInputCompanyName(e.target.value)}
                        />
                      )} */}
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
                      <span className={`${styles.title} ${styles.min}`}>●部署名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {/* {selectedRowDataActivity?.department_name ? selectedRowDataActivity?.department_name : ""} */}
                          {selectedRowDataActivity?.company_department_name
                            ? selectedRowDataActivity?.company_department_name
                            : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <input
                          type="text"
                          placeholder="「代表取締役＊」や「＊製造部＊」「＊品質＊」など"
                          className={`${styles.input_box}`}
                          value={inputDepartmentName}
                          onChange={(e) => setInputDepartmentName(e.target.value)}
                        />
                      )} */}
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
                      <span className={`${styles.title} ${styles.min}`}>担当者名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value} ${styles.editable_field} hover:text-[var(--color-bg-brand-f)]`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                          onClick={() => setIsOpenContactDetailModal(true)}
                        >
                          {selectedRowDataActivity?.contact_name ? selectedRowDataActivity?.contact_name : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <input
                          type="tel"
                          placeholder=""
                          className={`${styles.input_box}`}
                          value={inputContactName}
                          onChange={(e) => setInputContactName(e.target.value)}
                        />
                      )} */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} ${styles.min}`}>直通TEL</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataActivity?.direct_line ? selectedRowDataActivity?.direct_line : ""
                          }`}
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
                          {selectedRowDataActivity?.direct_line ? selectedRowDataActivity?.direct_line : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <input
                          type="tel"
                          className={`${styles.input_box}`}
                          value={inputDirectLine}
                          onChange={(e) => setInputDirectLine(e.target.value)}
                        />
                      )} */}
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
                      <span className={`${styles.title} ${styles.min}`}>内線TEL</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${selectedRowDataActivity?.extension ? selectedRowDataActivity?.extension : ""}`}
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
                          {selectedRowDataActivity?.extension ? selectedRowDataActivity?.extension : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <input
                          type="tel"
                          placeholder=""
                          className={`${styles.input_box}`}
                          value={inputExtension}
                          onChange={(e) => setInputExtension(e.target.value)}
                        />
                      )} */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} ${styles.min}`}>代表TEL</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataActivity?.main_phone_number ? selectedRowDataActivity?.main_phone_number : ""
                          }`}
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
                          {selectedRowDataActivity?.main_phone_number ? selectedRowDataActivity?.main_phone_number : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <input
                          type="tel"
                          className={`${styles.input_box}`}
                          value={inputTel}
                          onChange={(e) => setInputTel(e.target.value)}
                        />
                      )} */}
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
                      <span className={`${styles.title} ${styles.min}`}>直通FAX</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataActivity?.direct_fax ? selectedRowDataActivity?.direct_fax : ""
                          }`}
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
                          {selectedRowDataActivity?.direct_fax ? selectedRowDataActivity?.direct_fax : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputDirectFax}
                          onChange={(e) => setInputDirectFax(e.target.value)}
                        />
                      )} */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className={`flex h-full w-1/2 flex-col pr-[20px]`}>
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} ${styles.min}`}>代表FAX</span>
                      {/* <span className={`${styles.title} ${styles.min}`}>会員専用</span> */}
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${selectedRowDataActivity?.main_fax ? selectedRowDataActivity?.main_fax : ""}`}
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
                          {selectedRowDataActivity?.main_fax ? selectedRowDataActivity?.main_fax : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputFax}
                          onChange={(e) => setInputFax(e.target.value)}
                        />
                      )} */}
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
                      <span className={`${styles.title} ${styles.min}`}>社用携帯</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataActivity?.company_cell_phone
                              ? selectedRowDataActivity?.company_cell_phone
                              : ""
                          }`}
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
                      <span className={`${styles.title} ${styles.min}`}>私用携帯</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataActivity?.personal_cell_phone
                              ? selectedRowDataActivity?.personal_cell_phone
                              : ""
                          }`}
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
                      <span className={`${styles.title} ${styles.min}`}>E-mail</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataActivity?.contact_email ? selectedRowDataActivity?.contact_email : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputContactEmail}
                          onChange={(e) => setInputContactEmail(e.target.value)}
                        />
                      )} */}
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
                      <span className={`${styles.title} ${styles.min}`}>郵便番号</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataActivity?.zipcode ? selectedRowDataActivity?.zipcode : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputZipcode}
                          onChange={(e) => setInputZipcode(e.target.value)}
                        />
                      )} */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} ${styles.min}`}></span>
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
                      <span className={`${styles.title} ${styles.min}`}>○住所</span>
                      {!searchMode && (
                        <span
                          className={`${styles.textarea_value} h-[45px]`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {selectedRowDataActivity?.address ? selectedRowDataActivity?.address : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                        <textarea
                          cols={30}
                          // rows={10}
                          placeholder="「神奈川県＊」や「＊大田区＊」など"
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                          value={inputAddress}
                          onChange={(e) => setInputAddress(e.target.value)}
                        ></textarea>
                      )} */}
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
            } h-full pb-[35px] pt-[5px] ${
              tableContainerSize === "one_third"
                ? `min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)]`
                : `min-w-[calc((100vw-var(--sidebar-width))/3-15px)] max-w-[calc((100vw-var(--sidebar-width))/3-15px)]`
            }`} // ラージ、ミディアムは右paddingに10px追加されるため10pxを３等分で割り振る(右のみ1px+)
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
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity?.position_name ? selectedRowDataActivity?.position_name : ""
                        }`}
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
                        {selectedRowDataActivity?.position_name ? selectedRowDataActivity?.position_name : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputPositionName}
                        onChange={(e) => setInputPositionName(e.target.value)}
                      />
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>職位</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity &&
                          selectedRowDataActivity?.position_class &&
                          mappingPositionClass[selectedRowDataActivity.position_class]?.[language]
                            ? mappingPositionClass[selectedRowDataActivity.position_class]?.[language]
                            : ""
                        }`}
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
                        {/* {selectedRowDataActivity?.position_class ? selectedRowDataActivity?.position_class : ""} */}
                        {selectedRowDataActivity &&
                        selectedRowDataActivity?.position_class &&
                        mappingPositionClass[selectedRowDataActivity.position_class]?.[language]
                          ? mappingPositionClass[selectedRowDataActivity.position_class]?.[language]
                          : ""}
                      </span>
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
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当職種</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity &&
                          selectedRowDataActivity?.occupation &&
                          mappingOccupation[selectedRowDataActivity.occupation]?.[language]
                            ? mappingOccupation[selectedRowDataActivity.occupation]?.[language]
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          console.log(
                            "🔥🔥🔥🔥🔥🔥🔥🔥🔥 el.scrollWidth > el.offsetWidth",
                            el.scrollWidth > el.offsetWidth,
                            "el.scrollWidth",
                            el.scrollWidth,
                            "el.offsetWidth",
                            el.offsetWidth
                          );
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {/* {selectedRowDataActivity?.occupation ? selectedRowDataActivity?.occupation : ""} */}
                        {selectedRowDataActivity &&
                        selectedRowDataActivity?.occupation &&
                        mappingOccupation[selectedRowDataActivity.occupation]?.[language]
                          ? mappingOccupation[selectedRowDataActivity.occupation]?.[language]
                          : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <select
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
                    )} */}
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
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity?.approval_amount ? selectedRowDataActivity?.approval_amount : ""
                        }`}
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
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity?.number_of_employees_class
                            ? getNumberOfEmployeesClass(selectedRowDataActivity?.number_of_employees_class)
                            : ""
                        }`}
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
                        {selectedRowDataActivity?.number_of_employees_class
                          ? getNumberOfEmployeesClass(selectedRowDataActivity?.number_of_employees_class)
                          : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <select
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
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>決算月</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.fiscal_end_month
                          ? selectedRowDataActivity?.fiscal_end_month + language === "ja"
                            ? `月`
                            : ``
                          : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputFiscal}
                        onChange={(e) => setInputFiscal(e.target.value)}
                      />
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 従業員数 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>従業員数</span>
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
                        {selectedRowDataActivity?.number_of_employees
                          ? selectedRowDataActivity?.number_of_employees
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}></div>
                  {/* <div className={`${styles.underline}`}></div> */}
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
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.budget_request_month1
                          ? selectedRowDataActivity?.budget_request_month1 + language === "ja"
                            ? `月`
                            : ``
                          : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBudgetRequestMonth1}
                        onChange={(e) => setInputBudgetRequestMonth1(e.target.value)}
                      />
                    )} */}
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
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.budget_request_month2
                          ? selectedRowDataActivity?.budget_request_month2 + language === "ja"
                            ? `月`
                            : ``
                          : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBudgetRequestMonth2}
                        onChange={(e) => setInputBudgetRequestMonth2(e.target.value)}
                      />
                    )} */}
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
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity?.capital
                            ? convertToJapaneseCurrencyFormat(selectedRowDataActivity.capital)
                            : ""
                        }`}
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
                        {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                        {selectedRowDataActivity?.capital
                          ? convertToJapaneseCurrencyFormat(selectedRowDataActivity.capital)
                          : ""}
                      </span>
                    )}
                    {/* {searchMode && (
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
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>設立</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.established_in ? selectedRowDataActivity?.established_in : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputFound}
                        onChange={(e) => setInputFound(e.target.value)}
                      />
                    )} */}
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
                        <span
                          data-text={`${
                            selectedRowDataActivity?.business_content ? selectedRowDataActivity?.business_content : ""
                          }`}
                          className={`${styles.textarea_value} h-[45px]`}
                          // onMouseEnter={(e) => handleOpenTooltip({e})}
                          // onMouseLeave={handleCloseTooltip}
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
                            __html: selectedRowDataActivity?.business_content
                              ? selectedRowDataActivity?.business_content.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataActivity?.business_content ? selectedRowDataActivity?.business_content : ""} */}
                        </span>
                      </>
                    )}
                    {/* {searchMode && (
                      <textarea
                        cols={30}
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                        value={inputContent}
                        onChange={(e) => setInputContent(e.target.value)}
                      ></textarea>
                    )} */}
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
                        // onMouseEnter={(e) => handleOpenTooltip({e})}
                        // onMouseLeave={handleCloseTooltip}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.clients ? selectedRowDataActivity?.clients : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputClient}
                        onChange={(e) => setInputClient(e.target.value)}
                      />
                    )} */}
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
                        // onMouseEnter={(e) => handleOpenTooltip({e})}
                        // onMouseLeave={handleCloseTooltip}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.supplier ? selectedRowDataActivity?.supplier : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputSupplier}
                        onChange={(e) => setInputSupplier(e.target.value)}
                      />
                    )} */}
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
                          className={`${styles.textarea_value} h-[45px]`}
                          // onMouseEnter={(e) => handleOpenTooltip({e})}
                          // onMouseLeave={handleCloseTooltip}
                          data-text={`${selectedRowDataActivity?.facility ? selectedRowDataActivity?.facility : ""}`}
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
                            __html: selectedRowDataActivity?.facility
                              ? selectedRowDataActivity?.facility.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataActivity?.facility ? selectedRowDataActivity?.facility : ""} */}
                        </span>
                      </>
                    )}
                    {/* {searchMode && (
                      <textarea
                        cols={30}
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                        value={inputFacility}
                        onChange={(e) => setInputFacility(e.target.value)}
                      ></textarea>
                    )} */}
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
                        // onMouseEnter={(e) => handleOpenTooltip({e})}
                        // onMouseLeave={handleCloseTooltip}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.business_sites ? selectedRowDataActivity?.business_sites : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputBusinessSite}
                        onChange={(e) => setInputBusinessSite(e.target.value)}
                      />
                    )} */}
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
                        // onMouseEnter={(e) => handleOpenTooltip({e})}
                        // onMouseLeave={handleCloseTooltip}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.overseas_bases ? selectedRowDataActivity?.overseas_bases : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputOverseas}
                        onChange={(e) => setInputOverseas(e.target.value)}
                      />
                    )} */}
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
                        // onMouseEnter={(e) => handleOpenTooltip({e})}
                        // onMouseLeave={handleCloseTooltip}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e });
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.group_company ? selectedRowDataActivity?.group_company : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputGroup}
                        onChange={(e) => setInputGroup(e.target.value)}
                      />
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* HP 通常 */}
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
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity.website_url}
                      </a>
                    ) : (
                      <span></span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="「is not null」でHP有りのデータのみ抽出"
                        value={inputHP}
                        onChange={(e) => setInputHP(e.target.value)}
                      />
                    )} */}
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
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                        onClick={async () => {
                          if (!selectedRowDataActivity?.company_email) return;
                          try {
                            await navigator.clipboard.writeText(selectedRowDataActivity.company_email);
                            toast.success(`コピーしました!`, {
                              // position: "bottom-center",
                              autoClose: 1000,
                              // hideProgressBar: false,
                              // closeOnClick: true,
                              // pauseOnHover: true,
                              // draggable: true,
                              // progress: undefined,
                              // transition: Zoom,
                            });
                          } catch (e: any) {
                            toast.error(`コピーできませんでした!`, {
                              // position: "bottom-center",
                              autoClose: 1000,
                              // hideProgressBar: false,
                              // closeOnClick: true,
                              // pauseOnHover: true,
                              // draggable: true,
                              // progress: undefined,
                              // transition: Zoom,
                            });
                          }
                        }}
                      >
                        {selectedRowDataActivity?.company_email ? selectedRowDataActivity?.company_email : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder="「is not null」でHP有りのデータのみ抽出"
                        value={inputCompanyEmail}
                        onChange={(e) => setInputCompanyEmail(e.target.value)}
                      />
                    )} */}
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
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataActivity?.industry_type_id
                          ? mappingIndustryType[selectedRowDataActivity?.industry_type_id][language]
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類(大分類) 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>製品分類</span>
                      <span>(大分類)</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.hashtag} ${styles.uneditable_field}`}
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
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類(中分類) 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>製品分類</span>
                      <span>(中分類)</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.hashtag} ${styles.uneditable_field}`}
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
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類(小分類) 通常モード */}
              <div
                className={`${styles.row_area} ${
                  searchMode ? `${styles.row_area_search_mode}` : ``
                } flex h-[30px] w-full items-center`}
              >
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                      <span>製品分類</span>
                      <span>(小分類)</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.hashtag} ${styles.uneditable_field}`}
                        data-text={`${formattedProductCategoriesSmall}`}
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
                        {formattedProductCategoriesSmall}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

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
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataActivity?.corporate_number ? selectedRowDataActivity?.corporate_number : ""
                        }`}
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
                        {selectedRowDataActivity?.corporate_number ? selectedRowDataActivity?.corporate_number : ""}
                      </span>
                    )}
                    {/* {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        value={inputCorporateNum}
                        onChange={(e) => setInputCorporateNum(e.target.value)}
                      />
                    )} */}
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
                  {/* <div className={`${styles.underline}`}></div> */}
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
                          {/* {selectedRowDataActivity?.department_name ? selectedRowDataActivity?.department_name : ""} */}
                          {selectedRowDataActivity?.company_department_name
                            ? selectedRowDataActivity?.company_department_name
                            : ""}
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
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>直通TEL</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.direct_line ? selectedRowDataActivity?.direct_line : ""}
                        </span>
                      )}
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputDirectLine) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputDirectLine]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputDirectLine]}</span>
                            </div>
                          ) : (
                            <input
                              type="tel"
                              className={`${styles.input_box}`}
                              value={inputDirectLine}
                              onChange={(e) => setInputDirectLine(e.target.value)}
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
                              className={`icon_btn_red ${!inputDirectLine ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputDirectLine)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputDirectLine)}
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

                {/* 内線TEL・代表TEL サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>内線TEL</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.extension ? selectedRowDataActivity?.extension : ""}
                        </span>
                      )}
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputExtension) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputExtension]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputExtension]}</span>
                            </div>
                          ) : (
                            <input
                              type="tel"
                              placeholder=""
                              className={`${styles.input_box}`}
                              value={inputExtension}
                              onChange={(e) => setInputExtension(e.target.value)}
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
                              className={`icon_btn_red ${!inputExtension ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputExtension)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputExtension)}
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
                      <span className={`${styles.title}`}>代表TEL</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.main_phone_number ? selectedRowDataActivity?.main_phone_number : ""}
                        </span>
                      )}
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputTel) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputTel]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputTel]}</span>
                            </div>
                          ) : (
                            <input
                              type="tel"
                              className={`${styles.input_box}`}
                              value={inputTel}
                              onChange={(e) => setInputTel(e.target.value)}
                            />
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>

                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            <button
                              type="button"
                              className={`icon_btn_red ${!inputTel ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputTel)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputTel)}
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

                {/* 直通FAX・代表FAX サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>直通FAX</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.direct_fax ? selectedRowDataActivity?.direct_fax : ""}
                        </span>
                      )}
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputDirectFax) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputDirectFax]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputDirectFax]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputDirectFax}
                              onChange={(e) => setInputDirectFax(e.target.value)}
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
                              className={`icon_btn_red ${!inputDirectFax ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputDirectFax)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputDirectFax)}
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
                  <div className={`group relative flex h-full w-1/2 flex-col pr-[20px]`}>
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>代表FAX</span>
                      {/* <span className={`${styles.title}`}>会員専用</span> */}
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.main_fax ? selectedRowDataActivity?.main_fax : ""}
                        </span>
                      )}
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputFax) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputFax]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputFax]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputFax}
                              onChange={(e) => setInputFax(e.target.value)}
                            />
                          )}
                        </>
                      )}
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputFax)}
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

                {/* 社用携帯・私用携帯 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {["is null", "is not null"].includes(inputCompanyCellPhone) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputCompanyCellPhone]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputCompanyCellPhone]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputCompanyCellPhone}
                              onChange={(e) => setInputCompanyCellPhone(e.target.value)}
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
                              className={`icon_btn_red ${!inputCompanyCellPhone ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputCompanyCellPhone)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputCompanyCellPhone)}
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
                      <span className={`${styles.title}`}>私用携帯</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.personal_cell_phone
                            ? selectedRowDataActivity?.personal_cell_phone
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputPersonalCellPhone) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputPersonalCellPhone]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputPersonalCellPhone]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputPersonalCellPhone}
                              onChange={(e) => setInputPersonalCellPhone(e.target.value)}
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
                              className={`icon_btn_red ${!inputPersonalCellPhone ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputPersonalCellPhone)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputPersonalCellPhone)}
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

                {/* Email サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>E-mail</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.contact_email ? selectedRowDataActivity?.contact_email : ""}
                        </span>
                      )}
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputContactEmail) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputContactEmail]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputContactEmail]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputContactEmail}
                              onChange={(e) => setInputContactEmail(e.target.value)}
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
                              className={`icon_btn_red ${!inputContactEmail ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputContactEmail)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputContactEmail)}
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

                {/* 郵便番号 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>郵便番号</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.zipcode ? selectedRowDataActivity?.zipcode : ""}
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
                              value={inputZipcode}
                              onChange={(e) => setInputZipcode(e.target.value)}
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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
                          cols={30}
                          // rows={10}
                          placeholder="「神奈川県＊」や「＊大田区＊」など"
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.address}`}
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
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>役職名</span>
                      {/* {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.position_name ? selectedRowDataActivity?.position_name : ""}
                        </span>
                      )} */}
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputPositionName) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputPositionName]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputPositionName]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={inputPositionName}
                              onChange={(e) => setInputPositionName(e.target.value)}
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
                              className={`icon_btn_red ${!inputPositionName ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputPositionName)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputPositionName)}
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
                      <span className={`${styles.title}`}>職位</span>

                      {searchMode && (
                        <>
                          {isNullNotNullPositionClass === "is null" || isNullNotNullPositionClass === "is not null" ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[isNullNotNullPositionClass]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullPositionClass]}</span>
                            </div>
                          ) : (
                            <CustomSelectMultiple
                              stateArray={inputPositionClassArray}
                              dispatch={setInputPositionClassArray}
                              selectedSetObj={selectedPositionClassArraySet}
                              options={optionsPositionsClass}
                              getOptionName={getPositionClassNameSearch}
                              withBorder={true}
                              // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                              customClass="font-normal"
                              bgDark={false}
                              maxWidth={`calc(100% - var(--title-width))`}
                              maxHeight={30}
                              // zIndexSelectBox={2000}
                              hideOptionAfterSelect={true}
                            />
                          )}
                          {/* <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputPositionClass}
                          onChange={(e) => setInputPositionClass(e.target.value)}
                        >
                          <option value=""></option>
                          {optionsPositionsClass.map((classNum) => (
                            <option key={classNum} value={`${classNum}`}>
                              {getPositionClassName(classNum, language)}
                            </option>
                          ))}
                          <option value="is not null">入力有りのデータのみ</option>
                          <option value="is null">入力無しのデータのみ</option>
                        </select> */}
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
                              className={`icon_btn_red ${
                                isNullNotNullPositionClass === null && inputPositionClassArray.length === 0
                                  ? `hidden`
                                  : `flex`
                              }`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleResetArray("position_class")}
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
                                onClick={() =>
                                  handleClickAdditionalAreaBtn(index, setIsNullNotNullPositionClass, "position_class")
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

                {/* 担当職種・決裁金額 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>担当職種</span>
                      {searchMode && (
                        <>
                          {isNullNotNullOccupation === "is null" || isNullNotNullOccupation === "is not null" ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[isNullNotNullOccupation]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullOccupation]}</span>
                            </div>
                          ) : (
                            <CustomSelectMultiple
                              stateArray={inputOccupationArray}
                              dispatch={setInputOccupationArray}
                              selectedSetObj={selectedOccupationArraySet}
                              options={optionsOccupation}
                              getOptionName={getOccupationNameSearch}
                              withBorder={true}
                              // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                              customClass="font-normal"
                              bgDark={false}
                              maxWidth={`calc(100% - var(--title-width))`}
                              maxHeight={30}
                              // zIndexSelectBox={2000}
                              hideOptionAfterSelect={true}
                            />
                          )}
                          {/* <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputOccupation}
                          onChange={(e) => setInputOccupation(e.target.value)}
                        >
                          <option value=""></option>
                          {optionsOccupation.map((num) => (
                            <option key={num} value={`${num}`}>
                              {getOccupationName(num, language)}
                            </option>
                          ))}
                          <option value="is not null">入力有りのデータのみ</option>
                          <option value="is null">入力無しのデータのみ</option>
                        </select> */}
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
                              className={`icon_btn_red ${
                                isNullNotNullOccupation === null && inputOccupationArray.length === 0
                                  ? `hidden`
                                  : `flex`
                              }`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleResetArray("occupation")}
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
                                onClick={() =>
                                  handleClickAdditionalAreaBtn(index, setIsNullNotNullOccupation, "occupation")
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

                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        <>
                          {inputApprovalAmountSearch === "is null" || inputApprovalAmountSearch === "is not null" ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputApprovalAmountSearch]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputApprovalAmountSearch]}</span>
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
                                value={inputApprovalAmountSearch.min}
                                onChange={(e) =>
                                  setInputApprovalAmountSearch({
                                    min: e.target.value,
                                    max: inputApprovalAmountSearch.max,
                                  })
                                }
                                onBlur={() => {
                                  const formatHalfInput = toHalfWidthAndRemoveSpace(inputApprovalAmountSearch.min);
                                  const convertedPrice = convertToMillions(formatHalfInput.trim());
                                  if (convertedPrice !== null && !isNaN(convertedPrice)) {
                                    setInputApprovalAmountSearch({
                                      // min: String(convertedPrice),
                                      min: convertedPrice.toLocaleString(),
                                      max: inputApprovalAmountSearch.max,
                                    });
                                  } else {
                                    setInputApprovalAmountSearch({ min: "", max: inputApprovalAmountSearch.max });
                                  }
                                }}
                                onFocus={() =>
                                  !!inputApprovalAmountSearch.min &&
                                  setInputApprovalAmountSearch({
                                    ...inputApprovalAmountSearch,
                                    min: inputApprovalAmountSearch.min.replace(/[^\d.]/g, ""),
                                  })
                                }
                                onMouseEnter={(e) => {
                                  const el = e.currentTarget;
                                  if (el.offsetWidth < el.scrollWidth)
                                    handleOpenTooltip({ e, content: inputApprovalAmountSearch.min });
                                }}
                                onMouseLeave={handleCloseTooltip}
                              />

                              <span className="mx-[10px]">〜</span>

                              <input
                                type="text"
                                className={`${styles.input_box}`}
                                value={inputApprovalAmountSearch.max}
                                onChange={(e) =>
                                  setInputApprovalAmountSearch({
                                    min: inputApprovalAmountSearch.min,
                                    max: e.target.value,
                                  })
                                }
                                onBlur={() => {
                                  const formatHalfInput = toHalfWidthAndRemoveSpace(inputApprovalAmountSearch.max);
                                  const convertedPrice = convertToMillions(formatHalfInput.trim());

                                  if (convertedPrice !== null && !isNaN(convertedPrice)) {
                                    setInputApprovalAmountSearch({
                                      min: inputApprovalAmountSearch.min,
                                      // max: String(convertedPrice),
                                      max: convertedPrice.toLocaleString(),
                                    });
                                  } else {
                                    setInputApprovalAmountSearch({ min: inputApprovalAmountSearch.min, max: "" });
                                  }
                                }}
                                onFocus={() =>
                                  !!inputApprovalAmountSearch.max &&
                                  setInputApprovalAmountSearch({
                                    ...inputApprovalAmountSearch,
                                    max: inputApprovalAmountSearch.max.replace(/[^\d.]/g, ""),
                                  })
                                }
                                onMouseEnter={(e) => {
                                  const el = e.currentTarget;
                                  if (el.offsetWidth < el.scrollWidth)
                                    handleOpenTooltip({ e, content: inputApprovalAmountSearch.max });
                                }}
                                onMouseLeave={handleCloseTooltip}
                              />
                            </div>
                          )}
                          {/* {["is null", "is not null"].includes(inputApprovalAmount) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputApprovalAmount]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputApprovalAmount]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              // value={inputApprovalAmount}
                              // onChange={(e) => setInputApprovalAmount(e.target.value)}
                              value={!!inputApprovalAmount ? inputApprovalAmount : ""}
                              onChange={(e) => setInputApprovalAmount(e.target.value)}
                              onBlur={() => {
                                const convertedPrice = convertToMillions(inputApprovalAmount.trim());
                                if (convertedPrice !== null && !isNaN(parseFloat(String(convertedPrice)))) {
                                  setInputApprovalAmount(String(convertedPrice));
                                } else {
                                  setInputApprovalAmount("");
                                }
                              }}
                            />
                          )} */}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            {isCopyableInputRange(inputApprovalAmountSearch) && (
                              <button
                                type="button"
                                className={`icon_btn_green flex`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => {
                                  copyInputRange(setInputApprovalAmountSearch);
                                  handleCloseTooltip();
                                }}
                              >
                                <LuCopyPlus className="pointer-events-none text-[14px]" />
                              </button>
                            )}
                            <button
                              type="button"
                              className={`icon_btn_red ${
                                isEmptyInputRange(inputApprovalAmountSearch) ? `hidden` : `flex`
                              }`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputApprovalAmountSearch, "range_string")}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputApprovalAmountSearch)}
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

                {/* 規模（ランク）・決算月 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.number_of_employees_class
                            ? getNumberOfEmployeesClass(selectedRowDataActivity?.number_of_employees_class)
                            : ""}
                        </span>
                      )}
                      {searchMode && (
                        <>
                          {isNullNotNullEmployeesClass === "is null" ||
                          isNullNotNullEmployeesClass === "is not null" ? (
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
                              maxWidth={`calc(100% - var(--title-width))`}
                              maxHeight={30}
                              // zIndexSelectBox={2000}
                              hideOptionAfterSelect={true}
                            />
                          )}
                          {/* <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>決算月</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.fiscal_end_month ? selectedRowDataActivity?.fiscal_end_month : ""}
                        </span>
                      )}
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
                              getOptionName={getMonthNameSearch}
                              withBorder={true}
                              // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                              customClass="font-normal"
                              bgDark={false}
                              maxWidth={`calc(100% - var(--title-width))`}
                              maxHeight={30}
                              // zIndexSelectBox={2000}
                              hideOptionAfterSelect={true}
                            />
                          )}
                          {/* <select
                          className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                          value={inputFiscal}
                          onChange={(e) => setInputFiscal(e.target.value)}
                        >
                          <option value=""></option>
                          {optionsMonth.map((option) => (
                            <option key={option} value={option}>
                              {option}月
                            </option>
                          ))}
                          <option value="is not null">入力有りのデータのみ</option>
                          <option value="is null">入力無しのデータのみ</option>
                        </select> */}
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* 従業員数 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>従業員数</span>

                      {searchMode && (
                        <>
                          {inputNumberOfEmployeesSearch === "is null" ||
                          inputNumberOfEmployeesSearch === "is not null" ? (
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })
                                }
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}></div>
                    {/* <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>

                {/* 予算申請月1・予算申請月2 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <span className={`${styles.title}`}>予算申請月1</span> */}
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>予算</span>
                        <span>申請月1</span>
                      </div>

                      {searchMode && (
                        <>
                          {isNullNotNullBudgetRequestMonth1 === "is null" ||
                          isNullNotNullBudgetRequestMonth1 === "is not null" ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[isNullNotNullBudgetRequestMonth1]}
                              <span className={`text-[13px]`}>
                                {nullNotNullTextMap[isNullNotNullBudgetRequestMonth1]}
                              </span>
                            </div>
                          ) : (
                            <CustomSelectMultiple
                              stateArray={inputBudgetRequestMonth1Array}
                              dispatch={setInputBudgetRequestMonth1Array}
                              selectedSetObj={selectedBudgetRequestMonth1ArraySet}
                              options={optionsMonth}
                              getOptionName={getMonthNameSearch}
                              withBorder={true}
                              // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                              customClass="font-normal"
                              bgDark={false}
                              maxWidth={`calc(100% - var(--title-width))`}
                              maxHeight={30}
                              // zIndexSelectBox={2000}
                              hideOptionAfterSelect={true}
                            />
                          )}
                          {/* <select
                          className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                          value={inputBudgetRequestMonth1}
                          onChange={(e) => setInputBudgetRequestMonth1(e.target.value)}
                        >
                          <option value=""></option>
                          {optionsMonth.map((option) => (
                            <option key={option} value={option + `*`}>
                              {`${option}月`}
                            </option>
                          ))}
                          <option value="is not null">入力有りのデータのみ</option>
                          <option value="is null">入力無しのデータのみ</option>
                        </select> */}
                        </>
                      )}
                      {/* {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          value={inputBudgetRequestMonth1}
                          onChange={(e) => setInputBudgetRequestMonth1(e.target.value)}
                        />
                      )} */}
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
                                isNullNotNullBudgetRequestMonth1 === null && inputBudgetRequestMonth1Array.length === 0
                                  ? `hidden`
                                  : `flex`
                              }`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleResetArray("budget_request_month1")}
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
                                onClick={() =>
                                  handleClickAdditionalAreaBtn(
                                    index,
                                    setIsNullNotNullBudgetRequestMonth1,
                                    "budget_request_month1"
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

                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      {/* <span className={`${styles.title}`}>予算申請月2</span> */}
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>予算</span>
                        <span>申請月2</span>
                      </div>

                      {searchMode && (
                        <>
                          {isNullNotNullBudgetRequestMonth2 === "is null" ||
                          isNullNotNullBudgetRequestMonth2 === "is not null" ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[isNullNotNullBudgetRequestMonth2]}
                              <span className={`text-[13px]`}>
                                {nullNotNullTextMap[isNullNotNullBudgetRequestMonth2]}
                              </span>
                            </div>
                          ) : (
                            <CustomSelectMultiple
                              stateArray={inputBudgetRequestMonth2Array}
                              dispatch={setInputBudgetRequestMonth2Array}
                              selectedSetObj={selectedBudgetRequestMonth2ArraySet}
                              options={optionsMonth}
                              getOptionName={getMonthNameSearch}
                              withBorder={true}
                              // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                              customClass="font-normal"
                              bgDark={false}
                              maxWidth={`calc(100% - var(--title-width))`}
                              maxHeight={30}
                              // zIndexSelectBox={2000}
                              hideOptionAfterSelect={true}
                            />
                          )}
                          {/* <select
                          className={`ml-auto h-full w-full cursor-pointer ${styles.select_box}`}
                          value={inputBudgetRequestMonth2}
                          onChange={(e) => setInputBudgetRequestMonth2(e.target.value)}
                        >
                          <option value=""></option>
                          {optionsMonth.map((option) => (
                            <option key={option} value={option + `*`}>
                              {`${option}月`}
                            </option>
                          ))}
                          <option value="is not null">入力有りのデータのみ</option>
                          <option value="is null">入力無しのデータのみ</option>
                        </select> */}
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
                              className={`icon_btn_red ${
                                isNullNotNullBudgetRequestMonth2 === null && inputBudgetRequestMonth2Array.length === 0
                                  ? `hidden`
                                  : `flex`
                              }`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleResetArray("budget_request_month2")}
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
                                onClick={() =>
                                  handleClickAdditionalAreaBtn(
                                    index,
                                    setIsNullNotNullBudgetRequestMonth2,
                                    "budget_request_month2"
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

                {/* 資本金・設立 サーチ テスト */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                                      // max: String(convertedPrice)
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
                          {/* {["is null", "is not null"].includes(inputCapital) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputCapital]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputCapital]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              value={!!inputCapital ? inputCapital : ""}
                              onChange={(e) => setInputCapital(e.target.value)}
                              onBlur={() => {
                                const convertedPrice = convertToMillions(inputCapital.trim());
                                if (convertedPrice !== null && !isNaN(parseFloat(String(convertedPrice)))) {
                                  setInputCapital(String(convertedPrice));
                                } else {
                                  setInputCapital("");
                                }
                              }}
                            />
                          )} */}
                        </>
                      )}
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })
                                }
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>設立</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.established_in ? selectedRowDataActivity?.established_in : ""}
                        </span>
                      )}
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* 事業内容 サーチ */}
                <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                  <div className="group relative flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box}  flex h-full`}>
                      <span className={`${styles.title}`}>事業内容</span>
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
                              className={`icon_btn_red ${inputContent === "" ? `hidden` : `flex`}`}
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* 主要取引先 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>主要取引先</span>
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* 主要仕入先 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>主要仕入先</span>
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* 設備 サーチ */}
                <div
                  className={`${
                    searchMode ? `${styles.row_area_lg_box}` : `${styles.row_area}`
                  } flex w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box}  flex h-full`}>
                      <span className={`${styles.title}`}>設備</span>
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* 事業拠点・海外拠点 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業拠点</span>
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* グループ会社 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>ｸﾞﾙｰﾌﾟ会社</span>
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* HP サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* 会社Email サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
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
                                autoClose: 1000,
                              });
                            } catch (e: any) {
                              toast.error(`コピーできませんでした!`, {
                                autoClose: 1000,
                              });
                            }
                          }}
                        >
                          {selectedRowDataActivity?.company_email ? selectedRowDataActivity?.company_email : ""}
                        </span>
                      )}
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputCompanyEmail) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputCompanyEmail]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputCompanyEmail]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              // placeholder="「is not null」でHP有りのデータのみ抽出"
                              value={inputCompanyEmail}
                              onChange={(e) => setInputCompanyEmail(e.target.value)}
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
                              className={`icon_btn_red ${!inputCompanyEmail ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputCompanyEmail)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputCompanyEmail)}
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

                {/* 業種 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>○業種</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.industry_type_id
                            ? mappingIndustryType[selectedRowDataActivity?.industry_type_id][language]
                            : ""}
                        </span>
                      )}
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
                              getOptionName={getIndustryTypeNameSearch}
                              withBorder={true}
                              // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                              customClass="font-normal"
                              bgDark={false}
                              maxWidth={`calc(100% - var(--title-width))`}
                              maxHeight={30}
                              // zIndexSelectBox={2000}
                              hideOptionAfterSelect={true}
                            />
                          )}
                          {/* <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
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
                              onClick={() => handleResetArray("industry_type_id")}
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

                {/* 製品分類(大分類) サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>製品分類</span>
                        <span>(大分類)</span>
                      </div>
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
                              // maxWidth={`calc(100% - 88px)`}
                              maxWidth={`calc(100% - var(--title-width))`}
                              maxHeight={30}
                              // zIndexSelectBox={2000}
                              hideOptionAfterSelect={true}
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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
                {/* 製品分類(中分類) サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>製品分類</span>
                        <span>(中分類)</span>
                      </div>
                      {searchMode && (
                        <>
                          {isNullNotNullCategoryMedium === "is null" ||
                          isNullNotNullCategoryMedium === "is not null" ? (
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
                                // maxWidth={`calc(100% - 88px)`}
                                maxWidth={`calc(100% - var(--title-width))`}
                                maxHeight={30}
                                // zIndexSelectBox={2000}
                                hideOptionAfterSelect={true}
                              />
                            )
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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
                {/* 製品分類(小分類) サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>製品分類</span>
                        <span>(小分類)</span>
                      </div>
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
                                // maxWidth={`calc(100% - 88px)`}
                                maxWidth={`calc(100% - var(--title-width))`}
                                maxHeight={30}
                                // zIndexSelectBox={2000}
                                hideOptionAfterSelect={true}
                              />
                            )
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* 法人番号・ID サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } mb-[10px] flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>○法人番号</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataActivity?.corporate_number ? selectedRowDataActivity?.corporate_number : ""}
                        </span>
                      )}
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
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: additionalInputTooltipText(index) })
                                }
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

                {/* 活動年度・活動半期 サーチ */}
                <div
                  className={`${styles.row_area} ${searchMode ? `${styles.row_area_search_mode}` : ``} ${
                    styles.row_area_search_mode
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>活動年度</span>
                      {searchMode && (
                        <>
                          <input
                            type="text"
                            // placeholder="例) 2024 など"
                            data-text={`「2024」や「2023」などフィルターしたい年度を入力してください`}
                            onMouseEnter={(e) => {
                              handleOpenTooltip({ e });
                            }}
                            onMouseLeave={handleCloseTooltip}
                            className={`${styles.input_box}`}
                            value={inputActivityFiscalYear}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInputActivityFiscalYear(val);
                            }}
                          />
                          {!!inputActivityFiscalYear && (
                            <div
                              className={`${styles.close_btn_number}`}
                              onClick={() => setInputActivityFiscalYear("")}
                            >
                              <MdClose className="text-[20px] " />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>活動半期</span>
                      {searchMode && (
                        <>
                          <input
                            type="text"
                            // placeholder="例) 2024 など"
                            data-text={`「20241」や「20242」など「年度」+「1か2」を入力してください。\n上期(H1)は1、下期(H2)は2\n例) 2024年上期は「20241」 2024年下期は「20242」`}
                            // onMouseEnter={(e) => handleOpenTooltip(e, "top", 24, "left", "pre-wrap")}
                            onMouseEnter={(e) =>
                              handleOpenTooltip({ e, marginTop: 24, itemsPosition: "left", whiteSpace: "pre-wrap" })
                            }
                            onMouseLeave={handleCloseTooltip}
                            className={`${styles.input_box}`}
                            value={inputActivityHalfYear}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInputActivityHalfYear(val);
                            }}
                          />
                          {!!inputActivityHalfYear && (
                            <div className={`${styles.close_btn_number}`} onClick={() => setInputActivityHalfYear("")}>
                              <MdClose className="text-[20px] " />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* 活動四半期・活動年月度 サーチ */}
                <div
                  className={`${styles.row_area} ${searchMode ? `${styles.row_area_search_mode}` : ``} ${
                    styles.row_area_search_mode
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>活動四半期</span>
                      {searchMode && (
                        <>
                          <input
                            type="text"
                            // placeholder="例) 2024 など"
                            data-text={`「20241」や「20242」など「年度」+「1~4」を入力してください。\n第一四半期(Q1)は1、第二四半期(Q2)は2、第三四半期(Q3)は3、第四四半期(Q4)は4\n例) 2024年Q1は「20241」 2024年Q4は「20244」`}
                            // onMouseEnter={(e) => handleOpenTooltip(e, "top", 24, "left", "pre-wrap")}
                            onMouseEnter={(e) =>
                              handleOpenTooltip({ e, marginTop: 24, itemsPosition: "left", whiteSpace: "pre-wrap" })
                            }
                            onMouseLeave={handleCloseTooltip}
                            className={`${styles.input_box}`}
                            value={inputActivityQuarter}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInputActivityQuarter(val);
                            }}
                          />
                          {!!inputActivityQuarter && (
                            <div className={`${styles.close_btn_number}`} onClick={() => setInputActivityQuarter("")}>
                              <MdClose className="text-[20px] " />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>活動年月度</span>
                      {searchMode && (
                        <>
                          <input
                            type="text"
                            // placeholder="例) 2024 など"
                            data-text={`「202312」や「202304」など「年度」+「01~12」を入力してください。\n1月は「01」、2月は「02」...12月は「12」\n例) 2024年1月度は「202401」 2024年12月度は「202412」`}
                            // onMouseEnter={(e) => handleOpenTooltip(e, "top", 24, "left", "pre-wrap")}
                            onMouseEnter={(e) =>
                              handleOpenTooltip({ e, marginTop: 24, itemsPosition: "left", whiteSpace: "pre-wrap" })
                            }
                            onMouseLeave={handleCloseTooltip}
                            className={`${styles.input_box}`}
                            value={inputActivityYearMonth}
                            onChange={(e) => {
                              const val = e.target.value;
                              setInputActivityYearMonth(val);
                            }}
                          />
                          {!!inputActivityYearMonth && (
                            <div className={`${styles.close_btn_number}`} onClick={() => setInputActivityYearMonth("")}>
                              <MdClose className="text-[20px] " />
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* 活動日・クレームフラグ サーチ */}
                <div
                  className={`${styles.row_area} ${searchMode ? `${styles.row_area_search_mode}` : ``} ${
                    styles.row_area_search_mode
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>活動日</span>
                      {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      {/* <DatePickerCustomInputForSearch
                        startDate={inputActivityDate}
                        setStartDate={setInputActivityDate}
                        required={false}
                      /> */}
                      {/* <DatePickerCustomInputForSearch
                        startDate={inputActivityDate}
                        setStartDate={setInputActivityDate}
                        required={false}
                        isNotNullForSearch={true}
                        handleOpenTooltip={handleOpenTooltip}
                        handleCloseTooltip={handleCloseTooltip}
                        tooltipDataText="活動日"
                        isNotNullText="活動日有りのデータのみ"
                        isNullText="活動日無しのデータのみ"
                      /> */}
                      {inputActivityDateSearch === "is null" || inputActivityDateSearch === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputActivityDateSearch]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputActivityDateSearch]}</span>
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
                          <DatePickerCustomInputRange
                            minmax="min"
                            startDate={inputActivityDateSearch}
                            setStartDate={setInputActivityDateSearch}
                            required={false}
                            handleOpenTooltip={handleOpenTooltip}
                            handleCloseTooltip={handleCloseTooltip}
                          />

                          <span className="mx-[10px]">〜</span>

                          <DatePickerCustomInputRange
                            minmax="max"
                            startDate={inputActivityDateSearch}
                            setStartDate={setInputActivityDateSearch}
                            required={false}
                            handleOpenTooltip={handleOpenTooltip}
                            handleCloseTooltip={handleCloseTooltip}
                          />
                        </div>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            {isCopyableInputRange(inputActivityDateSearch, "date") && (
                              <button
                                type="button"
                                className={`icon_btn_green flex`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => {
                                  copyInputRange(setInputActivityDateSearch, "date");
                                  handleCloseTooltip();
                                }}
                              >
                                <LuCopyPlus className="pointer-events-none text-[14px]" />
                              </button>
                            )}
                            <button
                              type="button"
                              className={`icon_btn_red ${
                                isEmptyInputRange(inputActivityDateSearch, "date") ? `hidden` : `flex`
                              }`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputActivityDateSearch, "range_date")}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputActivityDateSearch)}
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
                {/*  */}

                {/* 活動タイプ・優先度 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>活動ﾀｲﾌﾟ</span>
                      {searchMode && (
                        <>
                          {isNullNotNullActivityType === "is null" || isNullNotNullActivityType === "is not null" ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[isNullNotNullActivityType]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullActivityType]}</span>
                            </div>
                          ) : (
                            <CustomSelectMultiple
                              stateArray={inputActivityTypeArray}
                              dispatch={setInputActivityTypeArray}
                              selectedSetObj={selectedActivityTypeArraySet}
                              options={optionsActivityType}
                              getOptionName={getActivityTypeNameSearch}
                              withBorder={true}
                              // modalPosition={{ x: modalPosition?.x ?? 0, y: modalPosition?.y ?? 0 }}
                              customClass="font-normal"
                              bgDark={false}
                              maxWidth={`calc(100% - var(--title-width))`}
                              maxHeight={30}
                              // zIndexSelectBox={2000}
                              hideOptionAfterSelect={true}
                            />
                          )}
                          {/* <select
                          className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                          value={inputActivityType}
                          onChange={(e) => {
                            setInputActivityType(e.target.value);
                          }}
                        >
                          <option value=""></option>
                          {optionsActivityType.map((option) => (
                            <option key={option} value={option}>
                              {getActivityType(option)}
                            </option>
                          ))}
                          <option value="is not null">入力有りのデータのみ</option>
                          <option value="is null">入力無しのデータのみ</option>
                        </select> */}
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
                              className={`icon_btn_red ${
                                isNullNotNullActivityType === null && inputActivityTypeArray.length === 0
                                  ? `hidden`
                                  : `flex`
                              }`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleResetArray("activity_type")}
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
                                onClick={() =>
                                  handleClickAdditionalAreaBtn(index, setIsNullNotNullActivityType, "activity_type")
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

                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>優先度</span>
                      {searchMode && (
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputPriority}
                          onChange={(e) => setInputPriority(e.target.value)}
                        >
                          <option value=""></option>
                          {optionsPriority.map((option) => (
                            <option key={option} value={option}>
                              {getPriorityName(option)}
                            </option>
                          ))}
                          {/* <option value="高">高</option>
                          <option value="中">中</option>
                          <option value="低">低</option> */}
                          <option value="is not null">入力有りのデータのみ</option>
                          <option value="is null">入力無しのデータのみ</option>
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 次回フォロー予定日・フォロー完了 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} flex flex-col`}>
                        <span>次回ﾌｫﾛｰ</span>
                        <span>予定日</span>
                      </div>
                      {/* <span className={`${styles.title} !mr-[15px]`}>次回ﾌｫﾛｰ予定日</span> */}
                      {/* <DatePickerCustomInputForSearch
                        startDate={inputScheduledFollowUpDate}
                        setStartDate={setInputScheduledFollowUpDate}
                        required={false}
                        isNotNullForSearch={true}
                        handleOpenTooltip={handleOpenTooltip}
                        handleCloseTooltip={handleCloseTooltip}
                        tooltipDataText="次回フォロー予定日"
                        isNotNullText="予定日有りのデータのみ"
                        isNullText="予定日無しのデータのみ"
                      /> */}
                      {inputScheduledFollowUpDateSearch === "is null" ||
                      inputScheduledFollowUpDateSearch === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputScheduledFollowUpDateSearch]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputScheduledFollowUpDateSearch]}</span>
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
                          <DatePickerCustomInputRange
                            minmax="min"
                            startDate={inputScheduledFollowUpDateSearch}
                            setStartDate={setInputScheduledFollowUpDateSearch}
                            required={false}
                            handleOpenTooltip={handleOpenTooltip}
                            handleCloseTooltip={handleCloseTooltip}
                          />

                          <span className="mx-[10px]">〜</span>

                          <DatePickerCustomInputRange
                            minmax="max"
                            startDate={inputScheduledFollowUpDateSearch}
                            setStartDate={setInputScheduledFollowUpDateSearch}
                            required={false}
                            handleOpenTooltip={handleOpenTooltip}
                            handleCloseTooltip={handleCloseTooltip}
                          />
                        </div>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                    {/* input下追加ボタンエリア */}
                    {searchMode && (
                      <>
                        <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                          <div className={`line_first space-x-[6px]`}>
                            {isCopyableInputRange(inputScheduledFollowUpDateSearch, "date") && (
                              <button
                                type="button"
                                className={`icon_btn_green flex`}
                                onMouseEnter={(e) =>
                                  handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })
                                }
                                onMouseLeave={handleCloseTooltip}
                                onClick={() => {
                                  copyInputRange(setInputScheduledFollowUpDateSearch, "date");
                                  handleCloseTooltip();
                                }}
                              >
                                <LuCopyPlus className="pointer-events-none text-[14px]" />
                              </button>
                            )}
                            <button
                              type="button"
                              className={`icon_btn_red ${
                                isEmptyInputRange(inputScheduledFollowUpDateSearch, "date") ? `hidden` : `flex`
                              }`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputScheduledFollowUpDateSearch, "range_date")}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputScheduledFollowUpDateSearch)}
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
                <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                  <div className="group relative flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title}`}>概要</span>
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputSummary) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputSummary]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputSummary]}</span>
                            </div>
                          ) : (
                            <textarea
                              cols={30}
                              // rows={10}
                              className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                              value={inputSummary}
                              onChange={(e) => setInputSummary(e.target.value)}
                            ></textarea>
                          )}
                        </>
                      )}
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
                              className={`icon_btn_red ${!inputSummary ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputSummary)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputSummary)}
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

                {/* 事業部名 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業部名</span>
                      {/* {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          // value={inputDepartment}
                          // onChange={(e) => setInputDepartment(e.target.value)}
                          value={inputActivityCreatedByDepartmentOfUser}
                          onChange={(e) => setInputActivityCreatedByDepartmentOfUser(e.target.value)}
                        />
                      )} */}
                      {searchMode && (
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputActivityCreatedByDepartmentOfUser}
                          onChange={(e) => {
                            setInputActivityCreatedByDepartmentOfUser(e.target.value);
                            // 課と係をリセットする
                            setInputActivityCreatedBySectionOfUser("");
                            setInputActivityCreatedByUnitOfUser("");
                          }}
                        >
                          <option value=""></option>
                          {departmentDataArray &&
                            departmentDataArray.map((department, index) => (
                              <option key={department.id} value={department.id}>
                                {department.department_name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  {/* 係・チーム サーチ */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>係・ﾁｰﾑ</span>
                      {/* <div className={`${styles.title} ${styles.double_text} flex flex-col`}>
                        <span>活動</span>
                        <span>年月度</span>
                      </div> */}
                      {/* {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputDepartment}
                          onChange={(e) => setInputDepartment(e.target.value)}
                        />
                      )} */}
                      {searchMode && filteredUnitBySelectedSection && filteredUnitBySelectedSection.length >= 1 && (
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputActivityCreatedByUnitOfUser}
                          onChange={(e) => setInputActivityCreatedByUnitOfUser(e.target.value)}
                        >
                          <option value=""></option>
                          {filteredUnitBySelectedSection &&
                            filteredUnitBySelectedSection.map((unit, index) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.unit_name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 課セクション・自社担当 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>課・ｾｸｼｮﾝ</span>

                      {searchMode &&
                        filteredSectionBySelectedDepartment &&
                        filteredSectionBySelectedDepartment.length >= 1 && (
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                            value={inputActivityCreatedBySectionOfUser}
                            onChange={(e) => {
                              setInputActivityCreatedBySectionOfUser(e.target.value);
                              // 係をリセットする
                              setInputActivityCreatedByUnitOfUser("");
                            }}
                          >
                            <option value=""></option>
                            {filteredSectionBySelectedDepartment &&
                              filteredSectionBySelectedDepartment.map((section, index) => (
                                <option key={section.id} value={section.id}>
                                  {section.section_name}
                                </option>
                              ))}
                          </select>
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

                {/* 事業所 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業所</span>
                      {/* {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputBusinessOffice}
                          onChange={(e) => setInputBusinessOffice(e.target.value)}
                        />
                      )} */}
                      {searchMode && (
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputActivityCreatedByOfficeOfUser}
                          onChange={(e) => setInputActivityCreatedByOfficeOfUser(e.target.value)}
                        >
                          <option value=""></option>
                          {officeDataArray &&
                            officeDataArray.map((office, index) => (
                              <option key={office.id} value={office.id}>
                                {office.office_name}
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    {/* <div className={`${styles.title_box} flex h-full items-center`}>
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
                    <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>

                {/* 実施1・実施2 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施1</span>
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputProductIntroduction1) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputProductIntroduction1]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputProductIntroduction1]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              placeholder=""
                              value={inputProductIntroduction1}
                              onChange={(e) => setInputProductIntroduction1(e.target.value)}
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
                              className={`icon_btn_red ${!inputProductIntroduction1 ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputProductIntroduction1)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputProductIntroduction1)}
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
                      <span className={`${styles.title}`}>実施2</span>
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputProductIntroduction2) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputProductIntroduction2]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputProductIntroduction2]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              placeholder=""
                              value={inputProductIntroduction2}
                              onChange={(e) => setInputProductIntroduction2(e.target.value)}
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
                              className={`icon_btn_red ${!inputProductIntroduction2 ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputProductIntroduction2)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputProductIntroduction2)}
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

                {/* 実施3・実施4 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施3</span>
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputProductIntroduction3) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputProductIntroduction3]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputProductIntroduction3]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              placeholder=""
                              value={inputProductIntroduction3}
                              onChange={(e) => setInputProductIntroduction3(e.target.value)}
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
                              className={`icon_btn_red ${!inputProductIntroduction3 ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputProductIntroduction3)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputProductIntroduction3)}
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
                      <span className={`${styles.title}`}>実施4</span>
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputProductIntroduction4) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputProductIntroduction4]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputProductIntroduction4]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              placeholder=""
                              value={inputProductIntroduction4}
                              onChange={(e) => setInputProductIntroduction4(e.target.value)}
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
                              className={`icon_btn_red ${!inputProductIntroduction4 ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputProductIntroduction4)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputProductIntroduction4)}
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

                {/* 実施5 サーチ */}
                <div
                  className={`${styles.row_area} ${
                    searchMode ? `${styles.row_area_search_mode}` : ``
                  } flex h-[30px] w-full items-center`}
                >
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>実施5</span>
                      {searchMode && (
                        <>
                          {["is null", "is not null"].includes(inputProductIntroduction5) ? (
                            <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                              {nullNotNullIconMap[inputProductIntroduction5]}
                              <span className={`text-[13px]`}>{nullNotNullTextMap[inputProductIntroduction5]}</span>
                            </div>
                          ) : (
                            <input
                              type="text"
                              className={`${styles.input_box}`}
                              placeholder=""
                              value={inputProductIntroduction5}
                              onChange={(e) => setInputProductIntroduction5(e.target.value)}
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
                              className={`icon_btn_red ${!inputProductIntroduction5 ? `hidden` : `flex`}`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickResetInput(setInputProductIntroduction5)}
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
                                onClick={() => handleClickAdditionalAreaBtn(index, setInputProductIntroduction5)}
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
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    {/* <div className={`${styles.title_box} flex h-full items-center`}>
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
                      {!!inputActivityYearMonth && (
                        <div className={`${styles.close_btn_number}`} onClick={() => setInputActivityYearMonth(null)}>
                          <MdClose className="text-[20px] " />
                        </div>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>
              </>
              {/* コンテンツ row_area 活動日~実施5まで サーチモード ここまで */}
              {/* ============= 活動情報エリアここまで ============= */}

              <div className={`${styles.row_area} flex min-h-[70px] w-full items-center`}></div>
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
                  ○検索したい条件を入力してください。（必要な項目のみ入力してください。）
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
                {/* <div className="flex  min-h-[30px] items-center">
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
                </div> */}
                {/* <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「is not null」は「&quot;空欄でない&quot;データ」を抽出します
                </div>
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○「is null」は「&quot;空欄の&quot;データ」を抽出します
                </div> */}
                <div className="mt-[5px] flex  min-h-[30px] items-center">
                  ○項目を空欄のまま検索した場合は、その項目の「全てのデータ」を抽出します
                </div>
                {/* <div className="mt-[10px] flex h-[30px] w-full items-center">
                  <button type="submit" className={`${styles.btn}`}>
                    検索
                  </button>
                </div> */}
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
