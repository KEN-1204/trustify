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
import styles from "../PropertyDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
// import { UnderRightPropertyLog } from "./UnderRightPropertyLog/UnderRightPropertyLog";
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
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import {
  CompetitionStateType,
  CurrentStatusType,
  DecisionMakerNegotiationType,
  MonthType,
  NumberOfEmployeesClassType,
  OccupationType,
  OrderCertaintyStartOfMonthType,
  PositionClassType,
  ReasonClassType,
  SalesClassType,
  SalesContributionCategoryType,
  getCompetitionState,
  getCurrentStatus,
  getDecisionMakerNegotiation,
  getLeaseDivision,
  getNumberOfEmployeesClass,
  getOccupationName,
  getOrderCertaintyStartOfMonth,
  getPositionClassName,
  getReasonClass,
  getSalesClass,
  getSalesContributionCategory,
  getSubscriptionInterval,
  getTermDivision,
  mappingCompetitionState,
  mappingCurrentStatus,
  mappingDecisionMakerNegotiation,
  mappingIndustryType,
  mappingMonth,
  mappingNumberOfEmployeesClass,
  mappingOrderCertaintyStartOfMonth,
  mappingPositionsClassName,
  mappingProductL,
  mappingReasonClass,
  mappingSalesClass,
  mappingSalesContributionCategory,
  optionsCompetitionState,
  optionsCurrentStatus,
  optionsDecisionMakerNegotiation,
  optionsFiscalHalf,
  optionsFiscalMonth,
  optionsFiscalQuarter,
  optionsIndustryType,
  optionsLeaseDivision,
  optionsMonth,
  optionsNumberOfEmployeesClass,
  optionsOccupation,
  optionsOrderCertaintyStartOfMonth,
  optionsPositionsClass,
  optionsProductL,
  optionsProductLNameOnly,
  optionsProductLNameOnlySet,
  optionsReasonClass,
  optionsSalesClass,
  optionsSalesContributionCategory,
  optionsSubscriptionInterval,
  optionsTermDivision,
} from "@/utils/selectOptions";
import { generateYearQuarters } from "@/utils/Helpers/generateYearQuarters";
import {
  Department,
  Office,
  ProductCategoriesLarge,
  ProductCategoriesMedium,
  Property,
  Property_row_data,
  Section,
  Unit,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useMedia } from "react-use";
import { mappingOccupation, mappingPositionClass } from "@/utils/mappings";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { useMutateProperty } from "@/hooks/useMutateProperty";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { isSameDateLocal } from "@/utils/Helpers/isSameDateLocal";
import { getFiscalYear } from "@/utils/Helpers/getFiscalYear";
import { getFiscalQuarterTest } from "@/utils/Helpers/getFiscalQuarterTest";
import { InputSendAndCloseBtn } from "@/components/DashboardCompanyComponent/CompanyMainContainer/InputSendAndCloseBtn/InputSendAndCloseBtn";
import { convertToYen } from "@/utils/Helpers/convertToYen";
import { normalizeDiscountRate } from "@/utils/Helpers/normalizeDiscountRate";
import { checkNotFalsyExcludeZero } from "@/utils/Helpers/checkNotFalsyExcludeZero";
import { calculateDiscountRate } from "@/utils/Helpers/calculateDiscountRate";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { UnderRightActivityLogCustom } from "./UnderRightActivityLogCustom/UnderRightActivityLogCustom";
import { FallbackUnderRightActivityLogCustom } from "./UnderRightActivityLogCustom/FallbackUnderRightActivityLogCustom";
import { useQuerySections } from "@/hooks/useQuerySections";
import { splitYearAndPeriod } from "@/utils/Helpers/CalendarHelpers/splitYearAndPeriod";
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
import { DatePickerCustomInputForSearch } from "@/utils/DatePicker/DatePickerCustomInputForSearch";
import { zenkakuToHankaku } from "@/utils/Helpers/zenkakuToHankaku";
import { toHalfWidthAndRemoveSpace } from "@/utils/Helpers/toHalfWidthAndRemoveSpace";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import {
  adjustFieldRangeInteger,
  adjustFieldRangeNumeric,
  adjustFieldRangePrice,
  adjustFieldRangeTIMESTAMPTZ,
  adjustIsNNN,
  beforeAdjustFieldRangeDate,
  beforeAdjustFieldRangeInteger,
  beforeAdjustFieldRangeNumeric,
  beforeAdjustIsNNN,
  copyInputRange,
  isCopyableInputRange,
  isEmptyInputRange,
  setArrayParam,
} from "@/utils/Helpers/MainContainer/commonHelper";
import { DatePickerCustomInputRange } from "@/utils/DatePicker/DatePickerCustomInputRange";
import { LuCopyPlus } from "react-icons/lu";

// https://nextjs-ja-translation-docs.vercel.app/docs/advanced-features/dynamic-import
// デフォルトエクスポートの場合のダイナミックインポート
// const DynamicComponent = dynamic(() => import('../components/hello'));
// 名前付きエクスポートの場合のダイナミックインポート
// const ContactUnderRightPropertyLog = dynamic(
//   () =>
//     import("./ContactUnderRightPropertyLog/ContactUnderRightPropertyLog").then(
//       (mod) => mod.ContactUnderRightPropertyLog
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

const PropertyMainContainerOneThirdMemo: FC = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  console.log("🔥 PropertyMainContainerレンダリング searchMode", searchMode);
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const newSearchProperty_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchProperty_Contact_CompanyParams
  );
  const setNewSearchProperty_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchProperty_Contact_CompanyParams
  );
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  // 上画面の選択中の列データ会社
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  // チェックボックスクリックで案件編集モーダルオープン
  const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);

  // 各フィールドの編集モード => ダブルクリックで各フィールド名をstateに格納し、各フィールドをエディットモードへ
  const isEditModeField = useDashboardStore((state) => state.isEditModeField);
  const setIsEditModeField = useDashboardStore((state) => state.setIsEditModeField);
  const [isComposing, setIsComposing] = useState(false); // 日本語のように変換、確定が存在する言語入力の場合の日本語入力の変換中を保持するstate、日本語入力開始でtrue, エンターキーで変換確定した時にfalse

  // 会社詳細モーダル
  const setIsOpenClientCompanyDetailModal = useDashboardStore((state) => state.setIsOpenClientCompanyDetailModal);
  // 担当者詳細モーダル
  const setIsOpenContactDetailModal = useDashboardStore((state) => state.setIsOpenContactDetailModal);

  const queryClient = useQueryClient();

  const { updatePropertyFieldMutation } = useMutateProperty();

  if (!userProfileState) {
    alert("エラー：ユーザーデータが見つかりませんでした...🙇‍♀️ EQM01");
    return;
  }

  // メディアクエリState
  // デスクトップモニター
  // const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  // const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  // useEffect(() => {
  //   setIsDesktopGTE1600(isDesktopGTE1600Media);
  // }, [isDesktopGTE1600Media]);

  // 🌟サブミット
  const [inputCompanyName, setInputCompanyName] = useState("");
  const [inputDepartmentName, setInputDepartmentName] = useState("");
  const [inputTel, setInputTel] = useState("");
  const [inputFax, setInputFax] = useState("");
  const [inputZipcode, setInputZipcode] = useState("");
  const [inputAddress, setInputAddress] = useState("");
  // ----------------------- サーチ配列 規模(ランク) -----------------------
  // const [inputEmployeesClass, setInputEmployeesClass] = useState("");
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
  // ここまで
  // ----------------------- 範囲検索 資本金 -----------------------
  // const [inputCapital, setInputCapital] = useState("");
  const [inputCapitalSearch, setInputCapitalSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ここまで
  const [inputFound, setInputFound] = useState("");
  const [inputContent, setInputContent] = useState("");
  const [inputHP, setInputHP] = useState("");
  const [inputCompanyEmail, setInputCompanyEmail] = useState("");
  // ----------------------- サーチ配列 業種(number) -----------------------
  // const [inputIndustryType, setInputIndustryType] = useState("");
  const [inputIndustryTypeArray, setInputIndustryTypeArray] = useState<number[]>([]);
  const [isNullNotNullIndustryType, setIsNullNotNullIndustryType] = useState<"is null" | "is not null" | null>(null);
  const selectedIndustryTypeArraySet = useMemo(() => {
    return new Set([...inputIndustryTypeArray]);
  }, [inputIndustryTypeArray]);
  const getIndustryTypeNameSearch = (option: number) => {
    return mappingIndustryType[option][language];
  };
  // ここまで
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
    if (!selectedRowDataProperty || !selectedRowDataProperty.product_categories_large_array?.length) return "";
    return selectedRowDataProperty.product_categories_large_array
      .map((name) =>
        optionsProductLNameOnlySet.has(name) ? `#${mappingProductL[name as ProductCategoriesLarge][language]}` : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataProperty?.product_categories_large_array]);

  // 中分類
  const formattedProductCategoriesMedium = useMemo(() => {
    if (!selectedRowDataProperty || !selectedRowDataProperty.product_categories_medium_array?.length) return "";
    return selectedRowDataProperty.product_categories_medium_array
      .map((name) =>
        productCategoriesMediumNameOnlySet.has(name)
          ? `#${mappingProductCategoriesMedium[name as ProductCategoriesMedium][language]}`
          : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataProperty?.product_categories_medium_array]);

  // 小分類
  const formattedProductCategoriesSmall = useMemo(() => {
    if (!selectedRowDataProperty || !selectedRowDataProperty.product_categories_small_array?.length) return "";
    return selectedRowDataProperty.product_categories_small_array
      .map((name) =>
        productCategoriesSmallNameOnlySet.has(name)
          ? `#${mappingProductCategoriesSmall[name as ProductCategoriesSmall][language]}`
          : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataProperty?.product_categories_small_array]);

  // ----------------------- 🌟製品分類関連🌟 ここまで -----------------------

  // const [inputFiscal, setInputFiscal] = useState("");
  // ----------------------- サーチ配列 決算月 -----------------------
  const [inputFiscalArray, setInputFiscalArray] = useState<MonthType[]>([]);
  const [isNullNotNullFiscal, setIsNullNotNullFiscal] = useState<"is null" | "is not null" | null>(null);
  const selectedFiscalArraySet = useMemo(() => {
    return new Set([...inputFiscalArray]);
  }, [inputFiscalArray]);
  const getMonthNameSearch = (option: MonthType) => {
    return mappingMonth[option][language];
  };
  // ここまで
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
  // ここまで
  // ----------------------- サーチ配列 予算申請月2 -----------------------
  const [inputBudgetRequestMonth2Array, setInputBudgetRequestMonth2Array] = useState<MonthType[]>([]);
  const [isNullNotNullBudgetRequestMonth2, setIsNullNotNullBudgetRequestMonth2] = useState<
    "is null" | "is not null" | null
  >(null);
  const selectedBudgetRequestMonth2ArraySet = useMemo(() => {
    return new Set([...inputBudgetRequestMonth2Array]);
  }, [inputBudgetRequestMonth2Array]);
  // ここまで
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
  // ここまで
  // 🔹contactsテーブル
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
  // ここまで
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
  // ここまで
  // const [inputApprovalAmount, setInputApprovalAmount] = useState("");
  // ----------------------- 範囲検索 決裁金額 ----------------------- ここまで
  const [inputApprovalAmountSearch, setInputApprovalAmountSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ここまで
  const [inputContactCreatedByCompanyId, setInputContactCreatedByCompanyId] = useState("");
  const [inputContactCreatedByUserId, setInputContactCreatedByUserId] = useState("");
  // 🔹Propertiesテーブル
  const [inputPropertyCreatedByCompanyId, setInputPropertyCreatedByCompanyId] = useState("");
  const [inputPropertyCreatedByUserId, setInputPropertyCreatedByUserId] = useState("");
  const [inputPropertyCreatedByDepartmentOfUser, setInputPropertyCreatedByDepartmentOfUser] = useState("");
  const [inputPropertyCreatedBySectionOfUser, setInputPropertyCreatedBySectionOfUser] = useState("");
  const [inputPropertyCreatedByUnitOfUser, setInputPropertyCreatedByUnitOfUser] = useState("");
  const [inputPropertyCreatedByOfficeOfUser, setInputPropertyCreatedByOfficeOfUser] = useState("");
  // ----------------------- サーチ配列 現ステータス -----------------------
  const [inputCurrentStatus, setInputCurrentStatus] = useState("");
  const [inputCurrentStatusArray, setInputCurrentStatusArray] = useState<CurrentStatusType[]>([]);
  const [isNullNotNullCurrentStatus, setIsNullNotNullCurrentStatus] = useState<"is null" | "is not null" | null>(null);
  const selectedCurrentStatusArraySet = useMemo(() => {
    return new Set([...inputCurrentStatusArray]);
  }, [inputCurrentStatusArray]);
  const getCurrentStatusNameSearch = (option: CurrentStatusType) => {
    return mappingCurrentStatus[option][language];
  };
  // ここまで
  const [inputPropertyName, setInputPropertyName] = useState("");
  const [inputPropertySummary, setInputPropertySummary] = useState("");
  const [inputPendingFlag, setInputPendingFlag] = useState<boolean | null>(null);
  const [inputRejectedFlag, setInputRejectedFlag] = useState<boolean | null>(null);
  const [inputProductName, setInputProductName] = useState(""); // 商品
  // ----------------------- 範囲検索 予定売上台数(number) -----------------------
  const [inputProductSales, setInputProductSales] = useState<number | null | "is null" | "is not null">(null);
  const [inputProductSalesSearch, setInputProductSalesSearch] = useState<
    { min: number | null; max: number | null } | "is null" | "is not null"
  >({
    min: null,
    max: null,
  });
  // ここまで
  // const [inputExpectedSalesPrice, setInputExpectedSalesPrice] = useState<number | null>(null); // 予定売上合計
  // ----------------------- 範囲検索 予定売上合計(string Numeric) -----------------------
  const [inputExpectedSalesPrice, setInputExpectedSalesPrice] = useState<string>(""); // 予定売上合計
  const [inputExpectedSalesPriceSearch, setInputExpectedSalesPriceSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ここまで
  const [inputTermDivision, setInputTermDivision] = useState(""); // 今・来期
  const [inputSoldProductName, setInputSoldProductName] = useState(""); // 売上商品
  // ----------------------- 範囲検索 売上台数(number) -----------------------
  const [inputUnitSales, setInputUnitSales] = useState<number | null | "is null" | "is not null">(null);
  const [inputUnitSalesSearch, setInputUnitSalesSearch] = useState<
    { min: number | null; max: number | null } | "is null" | "is not null"
  >({
    min: null,
    max: null,
  });
  // ここまで
  // ----------------------- サーチ配列 売上貢献区分 -----------------------
  const [inputSalesContributionCategory, setInputSalesContributionCategory] = useState(""); // 売上貢献区分
  const [inputSalesContributionCategoryArray, setInputSalesContributionCategoryArray] = useState<
    SalesContributionCategoryType[]
  >([]);
  const [isNullNotNullSalesContributionCategory, setIsNullNotNullSalesContributionCategory] = useState<
    "is null" | "is not null" | null
  >(null);
  const selectedSalesContributionCategoryArraySet = useMemo(() => {
    return new Set([...inputSalesContributionCategoryArray]);
  }, [inputSalesContributionCategoryArray]);
  // optionsMonth
  const getSalesContributionCategoryNameSearch = (option: SalesContributionCategoryType) => {
    return mappingSalesContributionCategory[option][language];
  };
  // ここまで
  // const [inputSalesPrice, setInputSalesPrice] = useState<number | null>(null); // 売上合計
  // const [inputDiscountedPrice, setInputDiscountedPrice] = useState<number | null>(null); // 値引価格
  // const [inputDiscountRate, setInputDiscountRate] = useState<number | null>(null);
  // ----------------------- 範囲検索 売上合計(string Numeric) -----------------------
  const [inputSalesPrice, setInputSalesPrice] = useState<string>(""); // 売上合計
  const [inputSalesPriceSearch, setInputSalesPriceSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ここまで
  // ----------------------- 範囲検索 値引価格(string Numeric) -----------------------
  const [inputDiscountedPrice, setInputDiscountedPrice] = useState<string>(""); // 値引価格
  const [inputDiscountedPriceSearch, setInputDiscountedPriceSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ここまで
  // ----------------------- 範囲検索 値引率(string Numeric) -----------------------
  const [inputDiscountRate, setInputDiscountRate] = useState<string>(""); // 値引率
  const [inputDiscountRateSearch, setInputDiscountRateSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ここまで
  // ----------------------- サーチ配列 導入分類 -----------------------
  const [inputSalesClass, setInputSalesClass] = useState(""); // 導入分類
  const [inputSalesClassArray, setInputSalesClassArray] = useState<SalesClassType[]>([]);
  const [isNullNotNullSalesClass, setIsNullNotNullSalesClass] = useState<"is null" | "is not null" | null>(null);
  const selectedSalesClassArraySet = useMemo(() => {
    return new Set([...inputSalesClassArray]);
  }, [inputSalesClassArray]);
  // optionsMonth
  const getSalesClassNameSearch = (option: SalesClassType) => {
    return mappingSalesClass[option][language];
  };
  // ここまで
  // const [inputExpansionQuarter, setInputExpansionQuarter] = useState("");
  // const [inputSalesQuarter, setInputSalesQuarter] = useState("");
  // ----------------------- 範囲検索 サブスク開始日 -----------------------
  const [inputSubscriptionStartDate, setInputSubscriptionStartDate] = useState<Date | null | "is null" | "is not null">(
    null
  );
  const [inputSubscriptionStartDateSearch, setInputSubscriptionStartDateSearch] = useState<
    { min: Date | null; max: Date | null } | "is not null" | "is null"
  >({ min: null, max: null });
  // ここまで
  // ----------------------- 範囲検索 サブスク終了日 -----------------------
  const [inputSubscriptionCanceledAt, setInputSubscriptionCanceledAt] = useState<
    Date | null | "is null" | "is not null"
  >(null);
  const [inputSubscriptionCanceledAtSearch, setInputSubscriptionCanceledAtSearch] = useState<
    { min: Date | null; max: Date | null } | "is not null" | "is null"
  >({ min: null, max: null });
  // ここまで
  const [inputLeasingCompany, setInputLeasingCompany] = useState("");
  const [inputLeaseDivision, setInputLeaseDivision] = useState("");
  // ----------------------- 範囲検索 リース完了予定日 -----------------------
  const [inputLeaseExpirationDate, setInputLeaseExpirationDate] = useState<Date | null | "is null" | "is not null">(
    null
  );
  const [inputLeaseExpirationDateSearch, setInputLeaseExpirationDateSearch] = useState<
    { min: Date | null; max: Date | null } | "is not null" | "is null"
  >({ min: null, max: null });
  // ここまで
  const [inputStepInFlag, setInputStepInFlag] = useState<boolean | null>(null);
  const [inputRepeatFlag, setInputRepeatFlag] = useState<boolean | null>(null);
  // ----------------------- サーチ配列 月初確度(number) -----------------------
  const [inputOrderCertaintyStartOfMonth, setInputOrderCertaintyStartOfMonth] = useState("");
  const [inputOrderCertaintyStartOfMonthArray, setInputOrderCertaintyStartOfMonthArray] = useState<
    OrderCertaintyStartOfMonthType[]
  >([]);
  const [isNullNotNullOrderCertaintyStartOfMonth, setIsNullNotNullOrderCertaintyStartOfMonth] = useState<
    "is null" | "is not null" | null
  >(null);
  const selectedOrderCertaintyStartOfMonthArraySet = useMemo(() => {
    return new Set([...inputOrderCertaintyStartOfMonthArray]);
  }, [inputOrderCertaintyStartOfMonthArray]);
  const getOrderCertaintyStartOfMonthNameSearch = (option: OrderCertaintyStartOfMonthType) => {
    return mappingOrderCertaintyStartOfMonth[option][language];
  };
  // ここまで
  // ----------------------- サーチ配列 中間見直確度(number) -----------------------
  const [inputReviewOrderCertainty, setInputReviewOrderCertainty] = useState("");
  const [inputReviewOrderCertaintyArray, setInputReviewOrderCertaintyArray] = useState<
    OrderCertaintyStartOfMonthType[]
  >([]);
  const [isNullNotNullReviewOrderCertainty, setIsNullNotNullReviewOrderCertainty] = useState<
    "is null" | "is not null" | null
  >(null);
  const selectedReviewOrderCertaintyArraySet = useMemo(() => {
    return new Set([...inputReviewOrderCertaintyArray]);
  }, [inputReviewOrderCertaintyArray]);
  const getReviewOrderCertaintyNameSearch = (option: OrderCertaintyStartOfMonthType) => {
    return mappingOrderCertaintyStartOfMonth[option][language];
  };
  // ここまで
  // ----------------------- 範囲検索 競合発生日 -----------------------
  const [inputCompetitorAppearanceDate, setInputCompetitorAppearanceDate] = useState<
    Date | null | "is null" | "is not null"
  >(null);
  const [inputCompetitorAppearanceDateSearch, setInputCompetitorAppearanceDateSearch] = useState<
    { min: Date | null; max: Date | null } | "is not null" | "is null"
  >({ min: null, max: null });
  // ここまで
  const [inputCompetitor, setInputCompetitor] = useState(""); // 競合会社
  const [inputCompetitorProduct, setInputCompetitorProduct] = useState(""); // 競合商品
  // ----------------------- サーチ配列 案件発生動機 -----------------------
  const [inputReasonClass, setInputReasonClass] = useState(""); // 案件発生動機
  const [inputReasonClassArray, setInputReasonClassArray] = useState<ReasonClassType[]>([]);
  const [isNullNotNullReasonClass, setIsNullNotNullReasonClass] = useState<"is null" | "is not null" | null>(null);
  const selectedReasonClassArraySet = useMemo(() => {
    return new Set([...inputReasonClassArray]);
  }, [inputReasonClassArray]);
  // optionsMonth
  const getReasonClassNameSearch = (option: ReasonClassType) => {
    return mappingReasonClass[option][language];
  };
  // ここまで
  const [inputReasonDetail, setInputReasonDetail] = useState(""); // 案件発生動機
  // const [inputCustomerBudget, setInputCustomerBudget] = useState<number | null>(null);
  // ----------------------- 範囲検索 客先予算(string Numeric) -----------------------
  const [inputCustomerBudget, setInputCustomerBudget] = useState<string>(""); // 客先予算
  const [inputCustomerBudgetSearch, setInputCustomerBudgetSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ここまで
  // ----------------------- サーチ配列 決裁者商談有無 -----------------------
  const [inputDecisionMakerNegotiation, setInputDecisionMakerNegotiation] = useState(""); // 決裁者商談有無
  const [inputDecisionMakerNegotiationArray, setInputDecisionMakerNegotiationArray] = useState<
    DecisionMakerNegotiationType[]
  >([]);
  const [isNullNotNullDecisionMakerNegotiation, setIsNullNotNullDecisionMakerNegotiation] = useState<
    "is null" | "is not null" | null
  >(null);
  const selectedDecisionMakerNegotiationArraySet = useMemo(() => {
    return new Set([...inputDecisionMakerNegotiationArray]);
  }, [inputDecisionMakerNegotiationArray]);
  // optionsMonth
  const getDecisionMakerNegotiationNameSearch = (option: DecisionMakerNegotiationType) => {
    return mappingDecisionMakerNegotiation[option][language];
  };
  // ここまで
  const [inputSubscriptionInterval, setInputSubscriptionInterval] = useState(""); // サブスク期間タイプ
  // ----------------------- サーチ配列 競合状況 -----------------------
  const [inputCompetitionState, setInputCompetitionState] = useState(""); // 競合状況
  const [inputCompetitionStateArray, setInputCompetitionStateArray] = useState<CompetitionStateType[]>([]);
  const [isNullNotNullCompetitionState, setIsNullNotNullCompetitionState] = useState<"is null" | "is not null" | null>(
    null
  );
  const selectedCompetitionStateArraySet = useMemo(() => {
    return new Set([...inputCompetitionStateArray]);
  }, [inputCompetitionStateArray]);
  // optionsMonth
  const getCompetitionStateNameSearch = (option: CompetitionStateType) => {
    return mappingCompetitionState[option][language];
  };
  // ここまで
  const [inputPropertyDepartment, setInputPropertyDepartment] = useState("");
  const [inputPropertyBusinessOffice, setInputPropertyBusinessOffice] = useState("");
  const [inputPropertyMemberName, setInputPropertyMemberName] = useState("");
  // 🌠追加 案件四半期・半期(案件、展開、売上)・会計年度(案件、展開、売上)
  // 会計年度

  // 🔹案件発生関連
  // ----------------------- 範囲検索 案件発生日付 -----------------------
  // 案件発生日付
  const [inputPropertyDate, setInputPropertyDate] = useState<Date | null | "is not null" | "is null">(null);
  const [inputPropertyDateSearch, setInputPropertyDateSearch] = useState<
    { min: Date | null; max: Date | null } | "is not null" | "is null"
  >({ min: null, max: null });
  // ここまで
  // 案件発生年度
  const [inputPropertyFiscalYear, setInputPropertyFiscalYear] = useState<number | null>(null);
  // 案件発生半期 年・H
  // const [inputPropertyHalfYear, setInputPropertyHalfYear] = useState<number | null>(null);
  const [selectedPropertyYearForHalf, setSelectedPropertyYearForHalf] = useState<string>("");
  const [selectedPropertyHalf, setSelectedPropertyHalf] = useState<string>("");
  // 案件発生四半期 年・Q
  // const [inputPropertyQuarter, setInputPropertyQuarter] = useState<number | null>(null);
  const [selectedPropertyYearForQuarter, setSelectedPropertyYearForQuarter] = useState<string>("");
  const [selectedPropertyQuarter, setSelectedPropertyQuarter] = useState<string>("");
  // 案件発生年月度 年・月
  // const [inputPropertyYearMonth, setInputPropertyYearMonth] = useState<number | null>(null);
  const [selectedPropertyYearForMonth, setSelectedPropertyYearForMonth] = useState<string>("");
  const [selectedPropertyMonth, setSelectedPropertyMonth] = useState<string>("");

  // 🔹展開関連
  // ----------------------- 範囲検索 展開日付 -----------------------
  // 展開日付
  const [inputExpansionDate, setInputExpansionDate] = useState<Date | null | "is not null" | "is null">(null);
  const [inputExpansionDateSearch, setInputExpansionDateSearch] = useState<
    { min: Date | null; max: Date | null } | "is not null" | "is null"
  >({ min: null, max: null });
  // ここまで
  // 展開年度
  const [inputExpansionFiscalYear, setInputExpansionFiscalYear] = useState<number | null>(null);
  // 展開半期 年・H
  // const [inputExpansionHalfYear, setInputExpansionHalfYear] = useState<number | null>(null);
  const [selectedExpansionYearForHalf, setSelectedExpansionYearForHalf] = useState<string>("");
  const [selectedExpansionHalf, setSelectedExpansionHalf] = useState<string>("");
  // 展開四半期 年・Q
  // const [inputExpansionQuarter, setInputExpansionQuarter] = useState<number | null>(null);
  const [selectedExpansionYearForQuarter, setSelectedExpansionYearForQuarter] = useState<string>("");
  const [selectedExpansionQuarter, setSelectedExpansionQuarter] = useState<string>("");
  // 展開年月度 年・月
  // const [inputExpansionYearMonth, setInputExpansionYearMonth] = useState<number | null>(null);
  const [selectedExpansionYearForMonth, setSelectedExpansionYearForMonth] = useState<string>("");
  const [selectedExpansionMonth, setSelectedExpansionMonth] = useState<string>("");

  // 🔹売上関連
  // ----------------------- 範囲検索 売上日付 -----------------------
  // 売上日付
  const [inputSalesDate, setInputSalesDate] = useState<Date | null | "is not null" | "is null">(null);
  const [inputSalesDateSearch, setInputSalesDateSearch] = useState<
    { min: Date | null; max: Date | null } | "is not null" | "is null"
  >({ min: null, max: null });
  // ここまで
  // 売上年度
  const [inputSalesFiscalYear, setInputSalesFiscalYear] = useState<number | null>(null);
  // 売上半期 年・H
  // const [inputSalesHalfYear, setInputSalesHalfYear] = useState<number | null>(null);
  const [selectedSalesYearForHalf, setSelectedSalesYearForHalf] = useState<string>("");
  const [selectedSalesHalf, setSelectedSalesHalf] = useState<string>("");
  // 売上四半期 年・Q
  // const [inputSalesQuarter, setInputSalesQuarter] = useState<number | null>(null);
  const [selectedSalesYearForQuarter, setSelectedSalesYearForQuarter] = useState<string>("");
  const [selectedSalesQuarter, setSelectedSalesQuarter] = useState<string>("");
  // 売上年月度 年・月
  // const [inputSalesYearMonth, setInputSalesYearMonth] = useState<number | null>(null);
  const [selectedSalesYearForMonth, setSelectedSalesYearForMonth] = useState<string>("");
  const [selectedSalesMonth, setSelectedSalesMonth] = useState<string>("");

  // 🔹獲得予定関連 年度 半期 四半期 月度 それぞれの期間選択用 stringから最終的に結合してnumber型に変換する
  // ----------------------- 範囲検索 獲得予定日付 -----------------------
  // 獲得予定日付
  const [inputExpectedOrderDate, setInputExpectedOrderDate] = useState<Date | null | "is not null" | "is null">(null);
  const [inputExpectedOrderDateSearch, setInputExpectedOrderDateSearch] = useState<
    { min: Date | null; max: Date | null } | "is not null" | "is null"
  >({ min: null, max: null });
  // ここまで
  // 獲得予定年度
  const [inputExpectedOrderFiscalYear, setInputExpectedOrderFiscalYear] = useState<number | null>(null);
  // 獲得予定半期 年・H
  // const [inputExpectedOrderHalfYear, setInputExpectedOrderHalfYear] = useState<number | null>(null);
  const [selectedExpectedOrderYearForHalf, setSelectedExpectedOrderYearForHalf] = useState<string>("");
  const [selectedExpectedOrderHalf, setSelectedExpectedOrderHalf] = useState<string>("");
  // 獲得予定四半期 年・Q
  // const [inputExpectedOrderQuarter, setInputExpectedOrderQuarter] = useState<number | null>(null);
  const [selectedExpectedOrderYearForQuarter, setSelectedExpectedOrderYearForQuarter] = useState<string>("");
  const [selectedExpectedOrderQuarter, setSelectedExpectedOrderQuarter] = useState<string>("");
  // 獲得予定年月度 年・月
  // const [inputExpectedOrderYearMonth, setInputExpectedOrderYearMonth] = useState<number | null>(null);
  const [selectedExpectedOrderYearForMonth, setSelectedExpectedOrderYearForMonth] = useState<string>("");
  const [selectedExpectedOrderMonth, setSelectedExpectedOrderMonth] = useState<string>("");

  // 年度のselectタグの選択肢 獲得予定時期は再来期など先の年度も含むため現在から2年後までを選択肢で表示
  const optionsFiscalYear = useMemo((): string[] => {
    const startYear = 2010; // 2010年から現在の年の2年後まで
    const endYear = new Date().getFullYear() + 2;

    let years: string[] = [];

    for (let year = startYear; year <= endYear; year++) {
      // const yearQuarter = parseInt(`${year}`, 10);
      const yearStr = String(year);
      years.push(yearStr);
    }
    const sortedYears = years.reverse();
    return sortedYears;
  }, []);

  // ================================ 🌟フィールドエディットモード関連state🌟 ================================
  const [inputExpectedOrderDateForFieldEditMode, setInputExpectedOrderDateForFieldEditMode] = useState<Date | null>(
    null
  );
  // フラグ関連 フィールドエディット用 初期はfalseにしておき、useEffectでselectedRowDataのフラグを反映する
  const [checkRepeatFlagForFieldEdit, setCheckRepeatFlagForFieldEdit] = useState(false);
  const [checkStepInFlagForFieldEdit, setCheckStepInFlagForFieldEdit] = useState(false);
  const [checkPendingFlagForFieldEdit, setCheckPendingFlagForFieldEdit] = useState(false);
  const [checkRejectedFlagForFieldEdit, setCheckRejectedFlagForFieldEdit] = useState(false);
  // const [checkboxPlannedAppointCheckFlagForFieldEdit, setCheckboxPlannedAppointCheckFlagForFieldEdit] = useState(false); // アポ有りフラグ フィールドエディット用

  // フラグの初期値を更新 リピート
  useEffect(() => {
    setCheckRepeatFlagForFieldEdit(selectedRowDataProperty?.repeat_flag ? selectedRowDataProperty?.repeat_flag : false);
  }, [selectedRowDataProperty?.repeat_flag]);
  // フラグの初期値を更新 案件介入
  useEffect(() => {
    setCheckStepInFlagForFieldEdit(
      selectedRowDataProperty?.step_in_flag ? selectedRowDataProperty?.step_in_flag : false
    );
  }, [selectedRowDataProperty?.step_in_flag]);
  // フラグの初期値を更新 ペンディング
  useEffect(() => {
    setCheckPendingFlagForFieldEdit(
      selectedRowDataProperty?.pending_flag ? selectedRowDataProperty?.pending_flag : false
    );
  }, [selectedRowDataProperty?.pending_flag]);
  // フラグの初期値を更新 案件没
  useEffect(() => {
    setCheckRejectedFlagForFieldEdit(
      selectedRowDataProperty?.rejected_flag ? selectedRowDataProperty?.rejected_flag : false
    );
  }, [selectedRowDataProperty?.rejected_flag]);
  // ================================ ✅フィールドエディットモード関連state✅ ================================

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
    if (!sectionDataArray || sectionDataArray?.length === 0 || !inputPropertyCreatedByDepartmentOfUser)
      return setFilteredSectionBySelectedDepartment([]);

    // 選択中の事業部が変化するか、sectionDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (sectionDataArray && sectionDataArray.length >= 1 && inputPropertyCreatedByDepartmentOfUser) {
      const filteredSectionArray = sectionDataArray.filter(
        (section) => section.created_by_department_id === inputPropertyCreatedByDepartmentOfUser
      );
      setFilteredSectionBySelectedDepartment(filteredSectionArray);
    }
  }, [sectionDataArray, inputPropertyCreatedByDepartmentOfUser]);
  // ======================= ✅現在の選択した事業部で課を絞り込むuseEffect✅ =======================

  // 課ありパターン
  // ======================= 🌟現在の選択した課で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Unit[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!unitDataArray || unitDataArray?.length === 0 || !inputPropertyCreatedBySectionOfUser)
      return setFilteredUnitBySelectedSection([]);

    // 選択中の課が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (unitDataArray && unitDataArray.length >= 1 && inputPropertyCreatedBySectionOfUser) {
      const filteredUnitArray = unitDataArray.filter(
        (unit) => unit.created_by_section_id === inputPropertyCreatedBySectionOfUser
      );
      setFilteredUnitBySelectedSection(filteredUnitArray);
    }
  }, [unitDataArray, inputPropertyCreatedBySectionOfUser]);
  // ======================= ✅現在の選択した課で係・チームを絞り込むuseEffect✅ =======================

  // 課なしパターン
  // // ======================= 🌟現在の選択した事業部で係・チームを絞り込むuseEffect🌟 =======================
  // const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  // useEffect(() => {
  //   // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
  //   if (!unitDataArray || unitDataArray?.length === 0 || !inputPropertyCreatedByDepartmentOfUser)
  //     return setFilteredUnitBySelectedDepartment([]);

  //   // 選択中の事業部が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
  //   if (unitDataArray && unitDataArray.length >= 1 && inputPropertyCreatedByDepartmentOfUser) {
  //     const filteredUnitArray = unitDataArray.filter(
  //       (unit) => unit.created_by_department_id === inputPropertyCreatedByDepartmentOfUser
  //     );
  //     setFilteredUnitBySelectedDepartment(filteredUnitArray);
  //   }
  // }, [unitDataArray, inputPropertyCreatedByDepartmentOfUser]);
  // // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // 検索タイプ
  const searchType = useDashboardStore((state) => state.searchType);

  // 数値型のフィールド用
  function adjustFieldValueNumber(value: number | null) {
    if (value === null) return null; // 全てのデータ
    return value;
  }

  // 編集モードtrueの場合、サーチ条件をinputタグのvalueに格納
  // 新規サーチの場合には、サーチ条件を空にする
  useEffect(() => {
    // if (newSearchProperty_Contact_CompanyParams === null) return;

    if (editSearchMode && searchMode) {
      if (newSearchProperty_Contact_CompanyParams === null) return;

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

      // 🔸範囲検索用の変換 string
      const beforeAdjustFieldRangeValue = (
        value: { min: string | null; max: string | null } | "ISNULL" | "ISNOTNULL",
        type: "" | "price" | "rate" = ""
      ): { min: string; max: string } | "is null" | "is not null" => {
        if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
        if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
        const { min, max } = value;

        const adjustedMin = beforeAdjustFieldValue(min);
        const adjustedMax = beforeAdjustFieldValue(max);

        if (type === "price") {
          const minPrice = isValidNumber(adjustedMin) ? Number(adjustedMin).toLocaleString() : "";
          const maxPrice = isValidNumber(adjustedMax) ? Number(adjustedMax).toLocaleString() : "";
          return { min: minPrice, max: maxPrice };
        }
        if (type === "rate") {
          const minRate = !!adjustedMin ? normalizeDiscountRate(adjustedMin, true) : "";
          const maxRate = !!adjustedMax ? normalizeDiscountRate(adjustedMax, true) : "";
          return { min: minRate, max: maxRate };
        }

        return { min: adjustedMin, max: adjustedMax };
      };

      // // 🔸範囲検索用の変換 数値型(Numeric Type) 資本金、従業員数、価格など 下限値「~以上」, 上限値 「~以下」
      // const beforeAdjustFieldRangeNumeric = (
      //   value: { min: number | null; max: number | null } | "ISNULL" | "ISNOTNULL",
      //   type: "" | "price" | "integer" = ""
      // ): { min: string; max: string } | "is null" | "is not null" => {
      //   if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
      //   if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
      //   const { min, max } = value;

      //   if (min !== null && max !== null) {
      //     // if (type === "price") return { min: formatDisplayPrice(min), max: formatDisplayPrice(max) };
      //     if (type === "price") return { min: min.toLocaleString(), max: max.toLocaleString() };
      //     if (type === "integer") return { min: parseInt(String(min), 10).toFixed(0), max: max.toFixed(0) };
      //     return { min: String(min), max: String(max) };
      //   } else if (min !== null && max === null) {
      //     if (type === "price") return { min: min.toLocaleString(), max: "" };
      //     if (type === "integer") return { min: min.toFixed(0), max: "" };
      //     return { min: String(min), max: "" };
      //   } else if (min === null && max !== null) {
      //     if (type === "price") return { min: "", max: max.toLocaleString() };
      //     if (type === "integer") return { min: "", max: max.toFixed(0) };
      //     return { min: "", max: String(max) };
      //   }
      //   return { min: "", max: "" };
      // };

      // // 🔸範囲検索用の変換 INTEGER型 数量・面談時間など
      // const beforeAdjustFieldRangeInteger = (
      //   value: { min: number | null; max: number | null } | "ISNULL" | "ISNOTNULL"
      // ): { min: number | null; max: number | null } | "is null" | "is not null" => {
      //   if (value === "ISNULL") return "is null"; // ISNULLパラメータを送信
      //   if (value === "ISNOTNULL") return "is not null"; // ISNOTNULLパラメータを送信
      //   const { min, max } = value;

      //   return { min: min, max: max };
      // };

      // // 🔸範囲検索用の変換 Date型
      // const beforeAdjustFieldRangeDate = (
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
        "🔥Propertyメインコンテナー useEffect 編集モード inputにnewSearchActivity_Contact_CompanyParamsを格納",
        newSearchProperty_Contact_CompanyParams
      );
      //   setInputCompanyName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.company_name));
      setInputCompanyName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["client_companies.name"]));
      setInputDepartmentName(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["client_companies.department_name"])
      );
      //   setInputContactName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["contacts.name"]));
      setInputTel(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.zipcode));
      // サーチ配列 規模 ------------------------
      // setInputEmployeesClass(
      //   beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.number_of_employees_class)
      // );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams?.number_of_employees_class,
        setInputEmployeesClassArray,
        setIsNullNotNullEmployeesClass
      );
      // サーチ配列 規模 ------------------------ここまで
      setInputAddress(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.address));
      // 範囲検索 資本金・従業員数 ------------------------
      // setInputCapital(
      //   beforeAdjustFieldValue(
      //     newSearchProperty_Contact_CompanyParams?.capital
      //       ? newSearchProperty_Contact_CompanyParams?.capital.toString()
      //       : ""
      //   )
      // );
      setInputCapitalSearch(beforeAdjustFieldRangeNumeric(newSearchProperty_Contact_CompanyParams?.capital, "price"));
      setInputNumberOfEmployeesSearch(
        beforeAdjustFieldRangeNumeric(newSearchProperty_Contact_CompanyParams?.number_of_employees)
      );
      // 範囲検索 資本金・従業員数 ------------------------ここまで
      setInputFound(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.established_in));
      setInputContent(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams?.business_content));
      setInputHP(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.website_url));
      //   setInputCompanyEmail(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.company_email));
      setInputCompanyEmail(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["client_companies.email"]));
      // サーチ配列 業種 ------------------------
      // setInputIndustryType(
      //   beforeAdjustFieldValue(
      //     newSearchProperty_Contact_CompanyParams.industry_type_id
      //       ? newSearchProperty_Contact_CompanyParams.industry_type_id.toString()
      //       : ""
      //   )
      // );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams?.industry_type_id,
        setInputIndustryTypeArray,
        setIsNullNotNullIndustryType
      );
      // サーチ配列 業種 ------------------------ここまで
      // ------------------------ 製品分類関連 ------------------------
      // 編集モードはidからnameへ変換
      // setInputProductL(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.product_category_large));
      // setInputProductM(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.product_category_medium));
      // setInputProductS(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.product_category_small));
      // 🔸大分類
      let productCategoryLargeNamesArray: ProductCategoriesLarge[] = [];
      const largeIds = newSearchProperty_Contact_CompanyParams.product_category_large_ids;
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
      const mediumIds = newSearchProperty_Contact_CompanyParams.product_category_medium_ids;
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
      const smallIds = newSearchProperty_Contact_CompanyParams.product_category_small_ids;
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

      // ------------------------ 製品分類関連 ------------------------ ここまで

      // サーチ配列 決算月 予算申請月1, 2 ------------------------
      // setInputFiscal(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.fiscal_end_month));
      // setInputBudgetRequestMonth1(
      //   beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.budget_request_month1)
      // );
      // setInputBudgetRequestMonth2(
      //   beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.budget_request_month2)
      // );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams?.fiscal_end_month,
        setInputFiscalArray,
        setIsNullNotNullFiscal
      );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams?.budget_request_month1,
        setInputBudgetRequestMonth1Array,
        setIsNullNotNullBudgetRequestMonth1
      );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams?.budget_request_month2,
        setInputBudgetRequestMonth2Array,
        setIsNullNotNullBudgetRequestMonth2
      );
      // サーチ配列 決算月 予算申請月1, 2 ------------------------ここまで
      setInputClient(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.clients));
      setInputSupplier(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.supplier));
      setInputFacility(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.facility));
      setInputBusinessSite(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.business_sites));
      setInputOverseas(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.overseas_bases));
      setInputGroup(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.group_company));
      setInputCorporateNum(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.corporate_number));

      // contactsテーブル
      //   setInputContactName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["contacts.name"]));
      setInputDirectLine(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.direct_line));
      setInputDirectFax(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.direct_fax));
      setInputExtension(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.extension));
      setInputCompanyCellPhone(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.company_cell_phone));
      setInputPersonalCellPhone(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.personal_cell_phone));
      //   setInputContactEmail(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.contact_email));
      setInputContactEmail(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["contacts.email"]));
      setInputPositionName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.position_name));
      // setInputPositionClass(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.position_class));
      // setInputOccupation(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.occupation));
      // サーチ配列 職位 ------------------------
      // setInputPositionClass(
      //   newSearchProperty_Contact_CompanyParams.position_class
      //     ? newSearchProperty_Contact_CompanyParams.position_class.toString()
      //     : ""
      // );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams.position_class,
        setInputPositionClassArray,
        setIsNullNotNullPositionClass
      );
      // サーチ配列 職位 ------------------------ここまで
      // サーチ配列 担当職種 ------------------------
      // setInputOccupation(
      //   newSearchProperty_Contact_CompanyParams.occupation
      //     ? newSearchProperty_Contact_CompanyParams.occupation.toString()
      //     : ""
      // );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams.occupation,
        setInputOccupationArray,
        setIsNullNotNullOccupation
      );
      // サーチ配列 担当職種 ------------------------ここまで
      // 範囲検索 決裁金額 ------------------------
      // setInputApprovalAmount(
      //   beforeAdjustFieldValue(
      //     newSearchProperty_Contact_CompanyParams.approval_amount
      //       ? newSearchProperty_Contact_CompanyParams.approval_amount.toString()
      //       : ""
      //   )
      // );
      setInputApprovalAmountSearch(
        beforeAdjustFieldRangeNumeric(newSearchProperty_Contact_CompanyParams?.approval_amount, "price")
      );
      // 範囲検索 決裁金額 ------------------------ここまで
      setInputContactCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["contacts.created_by_company_id"])
      );
      setInputContactCreatedByUserId(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["contacts.created_by_user_id"])
      );

      // 🔹Propertiesテーブル
      setInputPropertyCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["properties.created_by_company_id"])
      );
      setInputPropertyCreatedByUserId(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["properties.created_by_user_id"])
      );
      setInputPropertyCreatedByDepartmentOfUser(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["properties.created_by_department_of_user"])
      );
      setInputPropertyCreatedBySectionOfUser(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["properties.created_by_section_of_user"])
      );
      setInputPropertyCreatedByUnitOfUser(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["properties.created_by_unit_of_user"])
      );
      setInputPropertyCreatedByOfficeOfUser(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams["properties.created_by_office_of_user"])
      );
      // サーチ配列 現ステータス ------------------------
      // setInputCurrentStatus(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.current_status));
      setArrayParam(
        newSearchProperty_Contact_CompanyParams.current_status,
        setInputCurrentStatusArray,
        setIsNullNotNullCurrentStatus
      );
      // ここまで
      // setInputScheduledFollowUpDate(
      //   beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.scheduled_follow_up_date)
      // );
      // setInputScheduledFollowUpDate(newSearchProperty_Contact_CompanyParams.scheduled_follow_up_date);
      setInputPropertyName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.property_name));
      setInputPropertySummary(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.property_summary));
      setInputPendingFlag(newSearchProperty_Contact_CompanyParams.pending_flag);
      setInputRejectedFlag(newSearchProperty_Contact_CompanyParams.rejected_flag);
      // setInputProductName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.product_name));
      setInputProductName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.expected_product));
      // 範囲検索 予定台数 ------------------------
      // setInputProductSales(beforeAdjustFieldValueInteger(newSearchProperty_Contact_CompanyParams.product_sales));
      setInputProductSalesSearch(beforeAdjustFieldRangeInteger(newSearchProperty_Contact_CompanyParams.product_sales));
      // ここまで
      // 範囲検索 予定売上合計 ------------------------
      // setInputExpectedSalesPrice(newSearchProperty_Contact_CompanyParams.expected_sales_price);
      // setInputExpectedSalesPrice(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.expected_sales_price));
      setInputExpectedSalesPriceSearch(
        beforeAdjustFieldRangeValue(newSearchProperty_Contact_CompanyParams.expected_sales_price, "price")
      );
      // ここまで

      setInputTermDivision(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.term_division));
      // setInputSoldProductName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.sold_product));
      setInputSoldProductName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.sold_product));
      // 範囲検索 売上台数 ------------------------
      // setInputUnitSales(beforeAdjustFieldValueInteger(newSearchProperty_Contact_CompanyParams.unit_sales));
      setInputUnitSalesSearch(beforeAdjustFieldRangeInteger(newSearchProperty_Contact_CompanyParams.unit_sales));
      // ここまで
      // サーチ配列 売上貢献区分 ------------------------
      // setInputSalesContributionCategory(
      //   beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.sales_contribution_category)
      // );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams.sales_contribution_category,
        setInputSalesContributionCategoryArray,
        setIsNullNotNullSalesContributionCategory
      );
      // ここまで
      // setInputSalesPrice(newSearchProperty_Contact_CompanyParams.sales_price);
      // 範囲検索 売上合計 ------------------------
      // setInputSalesPrice(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.sales_price));
      setInputSalesPriceSearch(
        beforeAdjustFieldRangeValue(newSearchProperty_Contact_CompanyParams.sales_price, "price")
      );
      // ここまで
      // setInputDiscountedPrice(newSearchProperty_Contact_CompanyParams.discounted_price);
      // 範囲検索 値引価格 ------------------------
      // setInputDiscountedPrice(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.discounted_price));
      setInputDiscountedPriceSearch(
        beforeAdjustFieldRangeValue(newSearchProperty_Contact_CompanyParams.discounted_price, "price")
      );
      // ここまで
      // setInputDiscountRate(newSearchProperty_Contact_CompanyParams.discount_rate);
      // 範囲検索 値引率 ------------------------
      // setInputDiscountRate(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.discount_rate));
      setInputDiscountRateSearch(
        beforeAdjustFieldRangeValue(newSearchProperty_Contact_CompanyParams.discount_rate, "rate")
      );
      // ここまで
      // サーチ配列 導入分類 ------------------------
      // setInputSalesClass(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.sales_class));
      setArrayParam(
        newSearchProperty_Contact_CompanyParams.sales_class,
        setInputSalesClassArray,
        setIsNullNotNullSalesClass
      );
      // ここまで
      // setInputExpansionQuarter(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.expansion_quarter));
      // setInputSalesQuarter(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.sales_quarter));
      // setInputSubscriptionStartDate(
      //   newSearchProperty_Contact_CompanyParams.subscription_start_date
      //     ? new Date(newSearchProperty_Contact_CompanyParams.subscription_start_date)
      //     : null
      // );
      // 範囲検索 サブスク開始日 -----------------------
      // setInputSubscriptionStartDate(
      //   beforeAdjustFieldValueDate(newSearchProperty_Contact_CompanyParams.subscription_start_date)
      // );
      setInputSubscriptionStartDateSearch(
        beforeAdjustFieldRangeDate(newSearchProperty_Contact_CompanyParams.subscription_start_date)
      );
      // ここまで
      // setInputSubscriptionCanceledAt(
      //   newSearchProperty_Contact_CompanyParams.subscription_canceled_at
      //     ? new Date(newSearchProperty_Contact_CompanyParams.subscription_canceled_at)
      //     : null
      // );
      // 範囲検索 サブスク終了日 -----------------------
      // setInputSubscriptionCanceledAt(
      //   beforeAdjustFieldValueDate(newSearchProperty_Contact_CompanyParams.subscription_canceled_at)
      // );
      setInputSubscriptionCanceledAtSearch(
        beforeAdjustFieldRangeDate(newSearchProperty_Contact_CompanyParams.subscription_canceled_at)
      );
      // ここまで
      setInputLeasingCompany(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.leasing_company));
      setInputLeaseDivision(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.lease_division));
      // setInputLeaseExpirationDate(
      //   newSearchProperty_Contact_CompanyParams.lease_expiration_date
      //     ? new Date(newSearchProperty_Contact_CompanyParams.lease_expiration_date)
      //     : null
      // );
      // 範囲検索 リース完了予定日 -----------------------
      // setInputLeaseExpirationDate(
      //   beforeAdjustFieldValueDate(newSearchProperty_Contact_CompanyParams.lease_expiration_date)
      // );
      setInputLeaseExpirationDateSearch(
        beforeAdjustFieldRangeDate(newSearchProperty_Contact_CompanyParams.lease_expiration_date)
      );
      // ここまで
      setInputStepInFlag(newSearchProperty_Contact_CompanyParams.step_in_flag);
      setInputRepeatFlag(newSearchProperty_Contact_CompanyParams.repeat_flag);
      // setInputOrderCertaintyStartOfMonth(
      //   beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.order_certainty_start_of_month)
      // );
      // setInputReviewOrderCertainty(
      //   beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.review_order_certainty)
      // );
      // サーチ配列 月初確度 ------------------------
      // setInputOrderCertaintyStartOfMonth(
      //   newSearchProperty_Contact_CompanyParams.order_certainty_start_of_month
      //     ? newSearchProperty_Contact_CompanyParams.order_certainty_start_of_month.toString()
      //     : ""
      // );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams.order_certainty_start_of_month,
        setInputOrderCertaintyStartOfMonthArray,
        setIsNullNotNullOrderCertaintyStartOfMonth
      );
      // ここまで
      // サーチ配列 中間見直確度 ------------------------
      // setInputReviewOrderCertainty(
      //   newSearchProperty_Contact_CompanyParams.review_order_certainty
      //     ? newSearchProperty_Contact_CompanyParams.review_order_certainty.toString()
      //     : ""
      // );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams.review_order_certainty,
        setInputReviewOrderCertaintyArray,
        setIsNullNotNullReviewOrderCertainty
      );
      // ここまで
      // setInputCompetitorAppearanceDate(
      //   newSearchProperty_Contact_CompanyParams.competitor_appearance_date
      //     ? new Date(newSearchProperty_Contact_CompanyParams.competitor_appearance_date)
      //     : null
      // );
      // 範囲検索 競合発生日 -----------------------
      // setInputCompetitorAppearanceDate(
      //   beforeAdjustFieldValueDate(newSearchProperty_Contact_CompanyParams.competitor_appearance_date)
      // );
      setInputCompetitorAppearanceDateSearch(
        beforeAdjustFieldRangeDate(newSearchProperty_Contact_CompanyParams.competitor_appearance_date)
      );
      // ここまで
      setInputCompetitor(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.competitor));
      setInputCompetitorProduct(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.competitor_product));
      // サーチ配列 動機詳細 ------------------------
      // setInputReasonClass(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.reason_class));
      setArrayParam(
        newSearchProperty_Contact_CompanyParams.reason_class,
        setInputReasonClassArray,
        setIsNullNotNullReasonClass
      );
      // ここまで
      setInputReasonDetail(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.reason_detail));
      // 範囲検索 客先予算 ------------------------
      // setInputCustomerBudget(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.customer_budget));
      setInputCustomerBudgetSearch(
        beforeAdjustFieldRangeValue(newSearchProperty_Contact_CompanyParams.customer_budget)
      );
      // ここまで
      // サーチ配列 決裁者商談有無 ------------------------
      // setInputDecisionMakerNegotiation(
      //   beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.decision_maker_negotiation)
      // );
      setArrayParam(
        newSearchProperty_Contact_CompanyParams.decision_maker_negotiation,
        setInputDecisionMakerNegotiationArray,
        setIsNullNotNullDecisionMakerNegotiation
      );
      // ここまで
      setInputSubscriptionInterval(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.subscription_interval)
      );
      // サーチ配列 競合状況 ------------------------
      // setInputCompetitionState(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.competition_state));
      setArrayParam(
        newSearchProperty_Contact_CompanyParams.competition_state,
        setInputCompetitionStateArray,
        setIsNullNotNullCompetitionState
      );
      // ここまで
      setInputPropertyBusinessOffice(
        beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.property_business_office)
      );
      setInputPropertyDepartment(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.property_department));
      setInputPropertyMemberName(beforeAdjustFieldValue(newSearchProperty_Contact_CompanyParams.property_member_name));
      // 🌠追加 案件四半期・半期(案件、展開、売上)・会計年度(案件、展開、売上)

      // ------------------------------ 案件発生関連 ------------------------------
      // 案件発生日付
      // setInputPropertyDate(
      //   newSearchProperty_Contact_CompanyParams.property_date
      //     ? new Date(newSearchProperty_Contact_CompanyParams.property_date)
      //     : null
      // );
      // 範囲検索 案件発生日付 -----------------------
      // setInputPropertyDate(beforeAdjustFieldValueDate(newSearchProperty_Contact_CompanyParams.property_date));
      setInputPropertyDateSearch(beforeAdjustFieldRangeDate(newSearchProperty_Contact_CompanyParams.property_date));
      // 案件発生年度
      setInputPropertyFiscalYear(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.property_fiscal_year));
      // 案件発生半期
      // setInputPropertyHalfYear(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.property_half_year));
      const [_propertyYearForHalf, _propertyHalf] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.property_half_year
      );
      setSelectedPropertyYearForHalf(_propertyYearForHalf);
      setSelectedPropertyHalf(_propertyYearForHalf);
      // 案件発生四半期
      // setInputPropertyQuarter(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.property_quarter));
      const [_propertyYearForQuarter, _propertyQuarter] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.property_quarter
      );
      setSelectedPropertyYearForQuarter(_propertyYearForQuarter);
      setSelectedPropertyQuarter(_propertyQuarter);
      // 案件発生年月度
      // setInputPropertyYearMonth(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.property_year_month));
      const [_propertyYearForMonth, _propertyMonth] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.property_year_month
      );
      setSelectedPropertyYearForMonth(_propertyYearForMonth);
      setSelectedPropertyMonth(_propertyMonth);
      // ------------------------------ 案件発生関連 ここまで ------------------------------
      // ------------------------------ 展開関連 ------------------------------
      // 展開日付
      // setInputExpansionDate(
      //   newSearchProperty_Contact_CompanyParams.expansion_date
      //     ? new Date(newSearchProperty_Contact_CompanyParams.expansion_date)
      //     : null
      // );
      // 範囲検索 展開日付 -----------------------
      // setInputExpansionDate(beforeAdjustFieldValueDate(newSearchProperty_Contact_CompanyParams.expansion_date));
      setInputExpansionDateSearch(beforeAdjustFieldRangeDate(newSearchProperty_Contact_CompanyParams.expansion_date));
      // 展開年度
      setInputExpansionFiscalYear(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.expansion_half_year));
      // 展開半期
      // setInputExpansionHalfYear(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.expansion_half_year));
      const [_expansionYearForHalf, _expansionHalf] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.expansion_half_year
      );
      setSelectedExpansionYearForHalf(_expansionYearForHalf);
      setSelectedExpansionHalf(_expansionYearForHalf);
      // 展開四半期
      // setInputExpansionQuarter(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.expansion_quarter));
      const [_expansionYearForQuarter, _expansionQuarter] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.expansion_quarter
      );
      setSelectedExpansionYearForQuarter(_expansionYearForQuarter);
      setSelectedExpansionQuarter(_expansionQuarter);
      // 展開年月度
      // setInputExpansionYearMonth(newSearchProperty_Contact_CompanyParams.expansion_year_month);
      const [_expansionYearForMonth, _expansionMonth] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.expansion_year_month
      );
      setSelectedExpansionYearForMonth(_expansionYearForMonth);
      setSelectedExpansionMonth(_expansionMonth);
      // ------------------------------ 展開関連 ここまで ------------------------------
      // ------------------------------ 売上関連 ------------------------------
      // 売上日付
      // setInputSalesDate(
      //   newSearchProperty_Contact_CompanyParams.sales_date
      //     ? new Date(newSearchProperty_Contact_CompanyParams.sales_date)
      //     : null
      // );
      // 範囲検索 売上日付 -----------------------
      // setInputSalesDate(beforeAdjustFieldValueDate(newSearchProperty_Contact_CompanyParams.sales_date));
      setInputSalesDateSearch(beforeAdjustFieldRangeDate(newSearchProperty_Contact_CompanyParams.sales_date));
      // 売上年度
      setInputSalesFiscalYear(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.sales_half_year));
      // 売上半期
      // setInputSalesHalfYear(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.sales_half_year));
      const [_salesYearForHalf, _salesHalf] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.sales_half_year
      );
      setSelectedSalesYearForHalf(_salesYearForHalf);
      setSelectedSalesHalf(_salesYearForHalf);
      // 売上四半期
      // setInputSalesQuarter(adjustFieldValueNumber(newSearchProperty_Contact_CompanyParams.sales_quarter));
      const [_salesYearForQuarter, _salesQuarter] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.sales_quarter
      );
      setSelectedSalesYearForQuarter(_salesYearForQuarter);
      setSelectedSalesQuarter(_salesQuarter);
      // 売上年月度
      // setInputSalesYearMonth(newSearchProperty_Contact_CompanyParams.sales_year_month);
      const [_salesYearForMonth, _salesMonth] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.sales_year_month
      );
      setSelectedSalesYearForMonth(_salesYearForMonth);
      setSelectedSalesMonth(_salesMonth);
      // ------------------------------ 売上関連 ここまで ------------------------------

      // ------------------------------ 獲得予定関連 ------------------------------
      // 獲得予定日付
      // setInputExpectedOrderDate(
      //   newSearchProperty_Contact_CompanyParams.expected_order_date
      //     ? new Date(newSearchProperty_Contact_CompanyParams.expected_order_date)
      //     : null
      // );
      // 範囲検索 獲得予定日付 -----------------------
      // setInputExpectedOrderDate(
      //   beforeAdjustFieldValueDate(newSearchProperty_Contact_CompanyParams.expected_order_date)
      // );
      setInputExpectedOrderDateSearch(
        beforeAdjustFieldRangeDate(newSearchProperty_Contact_CompanyParams.expected_order_date)
      );
      // 獲得予定年度
      setInputExpectedOrderFiscalYear(newSearchProperty_Contact_CompanyParams.expected_order_fiscal_year);
      // 獲得予定半期
      // setInputExpectedOrderHalfYear(newSearchProperty_Contact_CompanyParams.expected_order_half_year);
      const [_expectedOrderYearForHalf, _expectedOrderHalf] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.expected_order_half_year
      );
      setSelectedExpectedOrderYearForHalf(_expectedOrderYearForHalf);
      setSelectedExpectedOrderHalf(_expectedOrderYearForHalf);
      // 獲得予定四半期
      // setInputExpectedOrderQuarter(newSearchProperty_Contact_CompanyParams.expected_order_quarter);
      const [_expectedOrderYearForQuarter, _expectedOrderQuarter] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.expected_order_quarter
      );
      setSelectedExpectedOrderYearForQuarter(_expectedOrderYearForQuarter);
      setSelectedExpectedOrderQuarter(_expectedOrderQuarter);
      // 獲得予定年月度
      // setInputExpectedOrderYearMonth(newSearchProperty_Contact_CompanyParams.expected_order_year_month);
      const [_expectedOrderYearForMonth, _expectedOrderMonth] = splitYearAndPeriod(
        newSearchProperty_Contact_CompanyParams.expected_order_year_month
      );
      setSelectedExpectedOrderYearForMonth(_expectedOrderYearForMonth);
      setSelectedExpectedOrderMonth(_expectedOrderMonth);
      // ------------------------------ 獲得予定関連 ここまで ------------------------------
    } else if (!editSearchMode && searchMode) {
      console.log(
        "🔥Meetingメインコンテナー useEffect 新規サーチモード inputを初期化",
        newSearchProperty_Contact_CompanyParams
      );
      if (!!inputCompanyName) setInputCompanyName("");
      // if (!!inputContactName) setInputContactName("");
      if (!!inputDepartmentName) setInputDepartmentName("");
      if (!!inputTel) setInputTel("");
      if (!!inputFax) setInputFax("");
      if (!!inputZipcode) setInputZipcode("");
      // サーチ配列 規模ランク-----------------------
      // if (!!inputEmployeesClass) setInputEmployeesClass("");
      if (!!inputEmployeesClassArray.length) setInputEmployeesClassArray([]);
      if (isNullNotNullEmployeesClass !== null) setIsNullNotNullEmployeesClass(null);
      // サーチ配列 規模ランク-----------------------ここまで
      if (!!inputAddress) setInputAddress("");
      // 範囲検索 資本金・従業員数 -----------------------
      // if (!!inputCapital) setInputCapital("");
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

      // サーチ配列 決算月 -----------------------
      // if (!!inputFiscal) setInputFiscal("");
      if (!!inputFiscalArray.length) setInputFiscalArray([]);
      if (isNullNotNullFiscal !== null) setIsNullNotNullFiscal(null);

      // サーチ配列 予算申請月 -----------------------
      // if (!!inputBudgetRequestMonth1) setInputBudgetRequestMonth1("");
      // if (!!inputBudgetRequestMonth2) setInputBudgetRequestMonth2("");
      if (!!inputBudgetRequestMonth1Array.length) setInputBudgetRequestMonth1Array([]);
      if (isNullNotNullBudgetRequestMonth1 !== null) setIsNullNotNullBudgetRequestMonth1(null);
      if (!!inputBudgetRequestMonth2Array.length) setInputBudgetRequestMonth2Array([]);
      if (isNullNotNullBudgetRequestMonth2 !== null) setIsNullNotNullBudgetRequestMonth2(null);

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
      // サーチ配列 担当職種 -----------------------
      // if (!!inputOccupation) setInputOccupation("");
      if (!!inputOccupationArray.length) setInputOccupationArray([]);
      if (isNullNotNullOccupation !== null) setIsNullNotNullOccupation(null);
      // 範囲検索 決裁金額 -----------------------
      // if (!!inputApprovalAmount) setInputApprovalAmount("");
      setInputApprovalAmountSearch({ min: "", max: "" });
      if (!!inputContactCreatedByCompanyId) setInputContactCreatedByCompanyId("");
      if (!!inputContactCreatedByUserId) setInputContactCreatedByUserId("");

      // Propertysテーブル
      if (!!inputPropertyCreatedByCompanyId) setInputPropertyCreatedByCompanyId("");
      if (!!inputPropertyCreatedByUserId) setInputPropertyCreatedByUserId("");
      if (!!inputPropertyCreatedByDepartmentOfUser) setInputPropertyCreatedByDepartmentOfUser("");
      if (!!inputPropertyCreatedBySectionOfUser) setInputPropertyCreatedBySectionOfUser("");
      if (!!inputPropertyCreatedByUnitOfUser) setInputPropertyCreatedByUnitOfUser("");
      if (!!inputPropertyCreatedByOfficeOfUser) setInputPropertyCreatedByOfficeOfUser("");
      // サーチ配列 現ステータス -----------------------
      // if (!!inputCurrentStatus) setInputCurrentStatus("");
      if (!!inputCurrentStatusArray.length) setInputCurrentStatusArray([]);
      if (isNullNotNullCurrentStatus !== null) setIsNullNotNullCurrentStatus(null);

      if (!!inputPropertyName) setInputPropertyName("");
      if (!!inputPropertySummary) setInputPropertySummary("");
      if (inputPendingFlag !== null) setInputPendingFlag(null);
      if (inputRejectedFlag !== null) setInputRejectedFlag(null);
      if (!!inputProductName) setInputProductName("");
      // 範囲検索 予定売上台数 -----------------------
      // if (inputProductSales !== null) setInputProductSales(null);
      setInputProductSalesSearch({ min: null, max: null });

      // if (!!inputExpectedSalesPrice) setInputExpectedSalesPrice(null);
      // 範囲検索 予定売上合計 -----------------------
      // if (!!inputExpectedSalesPrice) setInputExpectedSalesPrice("");
      setInputExpectedSalesPriceSearch({ min: "", max: "" });

      if (!!inputTermDivision) setInputTermDivision("");
      if (!!inputSoldProductName) setInputSoldProductName("");
      // 範囲検索 売上台数 -----------------------
      // if (inputUnitSales !== null) setInputUnitSales(null);
      setInputUnitSalesSearch({ min: null, max: null });

      // サーチ配列 現ステータス -----------------------
      // if (!!inputSalesContributionCategory) setInputSalesContributionCategory("");
      if (!!inputSalesContributionCategoryArray.length) setInputSalesContributionCategoryArray([]);
      if (isNullNotNullSalesContributionCategory !== null) setIsNullNotNullSalesContributionCategory(null);

      // if (!!inputSalesPrice) setInputSalesPrice(null);
      // if (!!inputDiscountedPrice) setInputDiscountedPrice(null);
      // if (!!inputDiscountRate) setInputDiscountRate(null);

      // 範囲検索 売上合計 -----------------------
      // if (!!inputSalesPrice) setInputSalesPrice("");
      setInputSalesPriceSearch({ min: "", max: "" });

      // 範囲検索 値引価格 -----------------------
      // if (!!inputDiscountedPrice) setInputDiscountedPrice("");
      setInputDiscountedPriceSearch({ min: "", max: "" });

      // 範囲検索 値引率 -----------------------
      // if (!!inputDiscountRate) setInputDiscountRate("");
      setInputDiscountRateSearch({ min: "", max: "" });

      // サーチ配列 導入分類 -----------------------
      // if (!!inputSalesClass) setInputSalesClass("");
      if (!!inputSalesClassArray.length) setInputSalesClassArray([]);
      if (isNullNotNullSalesClass !== null) setIsNullNotNullSalesClass(null);

      // if (!!inputExpansionQuarter) setInputExpansionQuarter("");
      // if (!!inputSalesQuarter) setInputSalesQuarter("");

      // 範囲検索 サブスク開始日 -----------------------
      // if (!!inputSubscriptionStartDate) setInputSubscriptionStartDate(null);
      setInputSubscriptionStartDateSearch({ min: null, max: null });

      // 範囲検索 サブスク終了日 -----------------------
      // if (!!inputSubscriptionCanceledAt) setInputSubscriptionCanceledAt(null);
      setInputSubscriptionCanceledAtSearch({ min: null, max: null });

      if (!!inputLeasingCompany) setInputLeasingCompany("");
      if (!!inputLeaseDivision) setInputLeaseDivision("");
      // 範囲検索 リース完了予定日 -----------------------
      if (!!inputLeaseExpirationDate) setInputLeaseExpirationDate(null);
      setInputLeaseExpirationDateSearch({ min: null, max: null });

      if (inputStepInFlag !== null) setInputStepInFlag(null);
      if (inputRepeatFlag !== null) setInputRepeatFlag(null);

      // サーチ配列 月初確度 -----------------------
      // if (!!inputOrderCertaintyStartOfMonth) setInputOrderCertaintyStartOfMonth("");
      if (!!inputOrderCertaintyStartOfMonthArray.length) setInputOrderCertaintyStartOfMonthArray([]);
      if (isNullNotNullOrderCertaintyStartOfMonth !== null) setIsNullNotNullOrderCertaintyStartOfMonth(null);

      // サーチ配列 中間見直確度 -----------------------
      // if (!!inputReviewOrderCertainty) setInputReviewOrderCertainty("");
      if (!!inputReviewOrderCertaintyArray.length) setInputReviewOrderCertaintyArray([]);
      if (isNullNotNullReviewOrderCertainty !== null) setIsNullNotNullReviewOrderCertainty(null);

      // 範囲検索 競合発生日 -----------------------
      // if (!!inputCompetitorAppearanceDate) setInputCompetitorAppearanceDate(null);
      setInputCompetitorAppearanceDateSearch({ min: null, max: null });

      if (!!inputCompetitor) setInputCompetitor("");
      if (!!inputCompetitorProduct) setInputCompetitorProduct("");

      // サーチ配列 動機詳細 -----------------------
      // if (!!inputReasonClass) setInputReasonClass("");
      if (!!inputReasonClassArray.length) setInputReasonClassArray([]);
      if (isNullNotNullReasonClass !== null) setIsNullNotNullReasonClass(null);

      if (!!inputReasonDetail) setInputReasonDetail("");
      // if (!!inputCustomerBudget) setInputCustomerBudget(null);

      // 範囲検索 客先予算 -----------------------
      // if (!!inputCustomerBudget) setInputCustomerBudget("");
      setInputCustomerBudgetSearch({ min: "", max: "" });

      // サーチ配列 決裁者商談有無 -----------------------
      // if (!!inputDecisionMakerNegotiation) setInputDecisionMakerNegotiation("");
      if (!!inputDecisionMakerNegotiationArray.length) setInputDecisionMakerNegotiationArray([]);
      if (isNullNotNullDecisionMakerNegotiation !== null) setIsNullNotNullDecisionMakerNegotiation(null);

      if (!!inputSubscriptionInterval) setInputSubscriptionInterval("");
      // サーチ配列 競合状況 -----------------------
      // if (!!inputCompetitionState) setInputCompetitionState("");
      if (!!inputCompetitionStateArray.length) setInputCompetitionStateArray([]);
      if (isNullNotNullCompetitionState !== null) setIsNullNotNullCompetitionState(null);

      if (!!inputPropertyDepartment) setInputPropertyDepartment("");
      if (!!inputPropertyBusinessOffice) setInputPropertyBusinessOffice("");
      if (!!inputPropertyMemberName) setInputPropertyMemberName("");
      // 🌠追加 案件四半期・半期(案件、展開、売上)・会計年度(案件、展開、売上)

      // -------------------- 案件発生関連 --------------------
      // 範囲検索 案件発生日付 -----------------------
      // if (!!inputPropertyDate) setInputPropertyDate(null);
      setInputPropertyDateSearch({ min: null, max: null });
      // 案件発生年度
      if (!!inputPropertyFiscalYear) setInputPropertyFiscalYear(null);
      // 案件発生半期
      // if (!!inputPropertyHalfYear) setInputPropertyHalfYear(null);
      if (!!selectedPropertyYearForHalf) setSelectedPropertyYearForHalf("");
      if (!!selectedPropertyHalf) setSelectedPropertyHalf("");
      // 案件発生四半期
      // if (!!inputPropertyQuarter) setInputPropertyQuarter(null);
      if (!!selectedPropertyYearForQuarter) setSelectedPropertyYearForQuarter("");
      if (!!selectedPropertyQuarter) setSelectedPropertyQuarter("");
      // 案件発生年月度
      // if (!!inputPropertyYearMonth) setInputPropertyYearMonth(null);
      if (!!selectedPropertyYearForMonth) setSelectedPropertyYearForMonth("");
      if (!!selectedPropertyMonth) setSelectedPropertyMonth("");
      // -------------------- 案件発生関連 ここまで --------------------

      // -------------------- 展開関連 --------------------
      // 範囲検索 展開日付 -----------------------
      // if (!!inputExpansionDate) setInputExpansionDate(null);
      setInputExpansionDateSearch({ min: null, max: null });
      // 展開年度
      if (!!inputExpansionFiscalYear) setInputExpansionFiscalYear(null);
      // 展開半期
      // if (!!inputExpansionHalfYear) setInputExpansionHalfYear(null);
      if (!!selectedExpansionYearForHalf) setSelectedExpansionYearForHalf("");
      if (!!selectedExpansionHalf) setSelectedExpansionHalf("");
      // 展開四半期
      // if (!!inputExpansionQuarter) setInputExpansionQuarter(null);
      if (!!selectedExpansionYearForQuarter) setSelectedExpansionYearForQuarter("");
      if (!!selectedExpansionQuarter) setSelectedExpansionQuarter("");
      // 展開年月度
      // if (!!inputExpansionYearMonth) setInputExpansionYearMonth(null);
      if (!!selectedExpansionYearForMonth) setSelectedExpansionYearForMonth("");
      if (!!selectedExpansionMonth) setSelectedExpansionMonth("");
      // -------------------- 展開関連 ここまで --------------------

      // -------------------- 売上関連 --------------------
      // 範囲検索 売上日付 -----------------------
      // if (!!inputSalesDate) setInputSalesDate(null);
      setInputSalesDateSearch({ min: null, max: null });
      // 売上年度
      if (!!inputSalesFiscalYear) setInputSalesFiscalYear(null);
      // 売上半期
      // if (!!inputSalesHalfYear) setInputSalesHalfYear(null);
      if (!!selectedSalesYearForHalf) setSelectedSalesYearForHalf("");
      if (!!selectedSalesHalf) setSelectedSalesHalf("");
      // 売上四半期
      // if (!!inputSalesQuarter) setInputSalesQuarter(null);
      if (!!selectedSalesYearForQuarter) setSelectedSalesYearForQuarter("");
      if (!!selectedSalesQuarter) setSelectedSalesQuarter("");
      // 売上年月度
      // if (!!inputSalesYearMonth) setInputSalesYearMonth(null);
      if (!!selectedSalesYearForMonth) setSelectedSalesYearForMonth("");
      if (!!selectedSalesMonth) setSelectedSalesMonth("");
      // -------------------- 売上関連 ここまで --------------------

      // -------------------- 獲得予定関連 --------------------
      // 範囲検索 獲得予定日付 -----------------------
      // if (!!inputExpectedOrderDate) setInputExpectedOrderDate(null);
      setInputExpectedOrderDateSearch({ min: null, max: null });
      // 獲得予定年度
      if (!!inputExpectedOrderFiscalYear) setInputExpectedOrderFiscalYear(null);
      // 獲得予定半期
      // if (!!inputExpectedOrderHalfYear) setInputExpectedOrderHalfYear(null);
      if (!!selectedExpectedOrderYearForHalf) setSelectedExpectedOrderYearForHalf("");
      if (!!selectedExpectedOrderHalf) setSelectedExpectedOrderHalf("");
      // 獲得予定四半期
      // if (!!inputExpectedOrderQuarter) setInputExpectedOrderQuarter(null);
      if (!!selectedExpectedOrderYearForQuarter) setSelectedExpectedOrderYearForQuarter("");
      if (!!selectedExpectedOrderQuarter) setSelectedExpectedOrderQuarter("");
      // 獲得予定年月度
      // if (!!inputExpectedOrderYearMonth) setInputExpectedOrderYearMonth(null);
      if (!!selectedExpectedOrderYearForMonth) setSelectedExpectedOrderYearForMonth("");
      if (!!selectedExpectedOrderMonth) setSelectedExpectedOrderMonth("");
      // -------------------- 獲得予定関連 ここまで --------------------
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
      // if (searchType === "manual" && value.includes("%")) value = value.replace(/%/g, "\\%");
      // if (searchType === "manual" && value.includes("％")) value = value.replace(/％/g, "\\%");
      // if (searchType === "manual" && value.includes("_")) value = value.replace(/_/g, "\\_");
      // if (searchType === "manual" && value.includes("＿")) value = value.replace(/＿/g, "\\_");
      // if (value.includes("*")) value = value.replace(/\*/g, "%");
      // if (value.includes("＊")) value = value.replace(/\＊/g, "%");

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
      // 🔹contactsテーブル
      let _contact_name = adjustFieldValue(inputContactName);
      let _direct_line = adjustFieldValue(inputDirectLine);
      let _direct_fax = adjustFieldValue(inputDirectFax);
      let _extension = adjustFieldValue(inputExtension);
      let _company_cell_phone = adjustFieldValue(inputCompanyCellPhone);
      let _personal_cell_phone = adjustFieldValue(inputPersonalCellPhone);
      let _contact_email = adjustFieldValue(inputContactEmail);
      let _position_name = adjustFieldValue(inputPositionName);
      // let _position_class = adjustFieldValue(inputPositionClass) ? parseInt(inputPositionClass, 10) : null;
      // let _occupation = adjustFieldValue(inputOccupation) ? parseInt(inputOccupation, 10) : null;
      // サーチ配列 職位・担当職種 number[] ------------
      // let _position_class = adjustFieldValueInteger(inputPositionClass);
      // let _occupation = adjustFieldValueInteger(inputOccupation);
      let _position_class = inputPositionClassArray;
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
      // 🔹Propertiesテーブル
      let _property_created_by_company_id = userProfileState.company_id;
      let _property_created_by_user_id = adjustFieldValue(inputPropertyCreatedByUserId);
      let _property_created_by_department_of_user = adjustFieldValue(inputPropertyCreatedByDepartmentOfUser);
      let _property_created_by_section_of_user = adjustFieldValue(inputPropertyCreatedBySectionOfUser);
      let _property_created_by_unit_of_user = adjustFieldValue(inputPropertyCreatedByUnitOfUser);
      let _property_created_by_office_of_user = adjustFieldValue(inputPropertyCreatedByOfficeOfUser);
      // サーチ配列 現ステータス TEXT[] ------------
      // let _current_status = adjustFieldValue(inputCurrentStatus);
      let _current_status = inputCurrentStatusArray;
      // サーチ配列 現ステータス TEXT[] ------------ここまで
      let _property_name = adjustFieldValue(inputPropertyName);
      let _property_summary = adjustFieldValue(inputPropertySummary);
      let _pending_flag = inputPendingFlag;
      let _rejected_flag = inputRejectedFlag;
      // let _product_name = adjustFieldValue(inputProductName);
      let _expected_product = adjustFieldValue(inputProductName);
      // let _product_sales = adjustFieldValueNumber(inputProductSales);
      // 範囲検索 予定売上台数 -----------
      // let _product_sales = adjustFieldValueInteger(inputProductSales); // 台数
      let _product_sales = adjustFieldRangeInteger(inputProductSalesSearch); // 台数
      // 範囲検索 予定売上台数 -----------ここまで
      // let _expected_sales_price = adjustFieldValueNumber(inputExpectedSalesPrice);
      // let _expected_sales_price = adjustFieldValue(
      //   inputExpectedSalesPrice ? inputExpectedSalesPrice.replace(/,/g, "") : ""
      // );
      // 範囲検索 予定売上合計 NUMERIC -----------
      // let _expected_sales_price = adjustFieldValuePrice(
      //   inputExpectedSalesPrice ? inputExpectedSalesPrice.replace(/,/g, "") : ""
      // );
      // let _expected_sales_price = adjustFieldRangePrice(inputExpectedSalesPriceSearch);
      let _expected_sales_price = adjustFieldRangePrice(inputExpectedSalesPriceSearch);
      // 範囲検索 予定売上合計 NUMERIC -----------ここまで
      let _term_division = adjustFieldValue(inputTermDivision);
      // let _sold_product_name = adjustFieldValue(inputSoldProductName);
      let _sold_product = adjustFieldValue(inputSoldProductName);
      // let _unit_sales = adjustFieldValueNumber(inputUnitSales);
      // 範囲検索 予定売上台数 -----------
      // let _unit_sales = adjustFieldValueInteger(inputUnitSales);
      let _unit_sales = adjustFieldRangeInteger(inputUnitSalesSearch);
      // 範囲検索 予定売上台数 -----------ここまで
      // サーチ配列 売上貢献区分 TEXT[] ------------
      // let _sales_contribution_category = adjustFieldValue(inputSalesContributionCategory);
      let _sales_contribution_category = inputSalesContributionCategoryArray;
      // サーチ配列 売上貢献区分 TEXT[] ------------ここまで
      // let _sales_price = adjustFieldValueNumber(inputSalesPrice);
      // let _discounted_price = adjustFieldValueNumber(inputDiscountedPrice);
      // let _discount_rate = adjustFieldValueNumber(inputDiscountRate);
      // let _sales_price = adjustFieldValue(inputSalesPrice ? inputSalesPrice.replace(/,/g, "") : "");
      // 範囲検索 売上合計 NUMERIC -----------
      // let _sales_price = adjustFieldValuePrice(inputSalesPrice ? inputSalesPrice.replace(/,/g, "") : "");
      let _sales_price = adjustFieldRangePrice(inputSalesPriceSearch);
      // 範囲検索 売上合計 NUMERIC -----------ここまで
      // let _discounted_price = adjustFieldValue(inputDiscountedPrice ? inputDiscountedPrice.replace(/,/g, "") : "");
      // 範囲検索 値引価格 NUMERIC -----------
      // let _discounted_price = adjustFieldValuePrice(inputDiscountedPrice ? inputDiscountedPrice.replace(/,/g, "") : "");
      let _discounted_price = adjustFieldRangePrice(inputDiscountedPriceSearch);
      // 範囲検索 値引価格 NUMERIC -----------ここまで
      // let _discount_rate = adjustFieldValue(inputDiscountRate ? inputDiscountRate.replace(/,/g, "") : "");
      // 範囲検索 値引率 NUMERIC -----------
      // let _discount_rate = adjustFieldValuePrice(inputDiscountRate ? inputDiscountRate.replace(/,/g, "") : "");
      let _discount_rate = adjustFieldRangePrice(inputDiscountRateSearch, "rate");
      // 範囲検索 値引率 NUMERIC -----------ここまで
      // サーチ配列 導入分類 TEXT[] ------------
      // let _sales_class = adjustFieldValue(inputSalesClass);
      let _sales_class = inputSalesClassArray;
      // サーチ配列 導入分類 TEXT[] ------------ここまで
      // let _expansion_quarter = adjustFieldValue(inputExpansionQuarter);
      // let _sales_quarter = adjustFieldValue(inputSalesQuarter);
      // let _subscription_start_date = inputSubscriptionStartDate ? inputSubscriptionStartDate.toISOString() : null;
      // 範囲検索 サブスク開始日 -----------
      // let _subscription_start_date = adjustFieldValueDate(inputSubscriptionStartDate);
      let _subscription_start_date = adjustFieldRangeTIMESTAMPTZ(inputSubscriptionStartDateSearch);
      // 範囲検索 サブスク開始日 -----------ここまで
      // let _subscription_canceled_at = inputSubscriptionCanceledAt ? inputSubscriptionCanceledAt.toISOString() : null;
      // 範囲検索 サブスク終了日 -----------
      // let _subscription_canceled_at = adjustFieldValueDate(inputSubscriptionCanceledAt);
      let _subscription_canceled_at = adjustFieldRangeTIMESTAMPTZ(inputSubscriptionCanceledAtSearch);
      // 範囲検索 サブスク終了日 -----------ここまで
      let _leasing_company = adjustFieldValue(inputLeasingCompany);
      let _lease_division = adjustFieldValue(inputLeaseDivision);
      // let _lease_expiration_date = inputLeaseExpirationDate ? inputLeaseExpirationDate.toISOString() : null;
      // 範囲検索 リース完了予定日 -----------
      // let _lease_expiration_date = adjustFieldValueDate(inputLeaseExpirationDate);
      let _lease_expiration_date = adjustFieldRangeTIMESTAMPTZ(inputLeaseExpirationDateSearch);
      // 範囲検索 リース完了予定日 -----------ここまで
      let _step_in_flag = inputStepInFlag;
      let _repeat_flag = inputRepeatFlag;
      // let _order_certainty_start_of_month = adjustFieldValue(inputOrderCertaintyStartOfMonth);
      // let _review_order_certainty = adjustFieldValue(inputReviewOrderCertainty);
      // let _order_certainty_start_of_month = isNaN(parseInt(inputOrderCertaintyStartOfMonth, 10))
      //   ? null
      //   : parseInt(inputOrderCertaintyStartOfMonth, 10);
      // サーチ配列 月初確度 number[] ------------
      // let _order_certainty_start_of_month = adjustFieldValueInteger(inputOrderCertaintyStartOfMonth);
      let _order_certainty_start_of_month = inputOrderCertaintyStartOfMonthArray;
      // サーチ配列 月初確度 number[] ------------ここまで
      // let _review_order_certainty = isNaN(parseInt(inputReviewOrderCertainty, 10))
      //   ? null
      //   : parseInt(inputReviewOrderCertainty, 10);
      // サーチ配列 中間見直確度 number[] ------------
      // let _review_order_certainty = adjustFieldValueInteger(inputReviewOrderCertainty);
      let _review_order_certainty = inputReviewOrderCertaintyArray;
      // サーチ配列 中間見直確度 number[] ------------ここまで
      // let _competitor_appearance_date = inputCompetitorAppearanceDate
      //   ? inputCompetitorAppearanceDate.toISOString()
      //   : null;
      // 範囲検索 競合発生日 -----------
      // let _competitor_appearance_date = adjustFieldValueDate(inputCompetitorAppearanceDate);
      let _competitor_appearance_date = adjustFieldRangeTIMESTAMPTZ(inputCompetitorAppearanceDateSearch);
      // 範囲検索 競合発生日 -----------ここまで
      let _competitor = adjustFieldValue(inputCompetitor);
      let _competitor_product = adjustFieldValue(inputCompetitorProduct);
      // サーチ配列 動機詳細 TEXT[] ------------
      // let _reason_class = adjustFieldValue(inputReasonClass);
      let _reason_class = inputReasonClassArray;
      // サーチ配列 動機詳細 TEXT[] ------------ここまで
      let _reason_detail = adjustFieldValue(inputReasonDetail);
      // let _customer_budget = adjustFieldValueNumber(inputCustomerBudget ? inputCustomerBudget.replace(/,/g, "") : '');
      // let _customer_budget = adjustFieldValue(inputCustomerBudget ? inputCustomerBudget.replace(/,/g, "") : "");
      // 範囲検索 客先予算 NUMERIC -----------ここまで
      // let _customer_budget = adjustFieldValuePrice(inputCustomerBudget.replace(/,/g, ""));
      let _customer_budget = adjustFieldRangePrice(inputCustomerBudgetSearch);
      // 範囲検索 客先予算 NUMERIC -----------ここまで
      // サーチ配列 決裁者商談有無 TEXT[] ------------
      // let _decision_maker_negotiation = adjustFieldValue(inputDecisionMakerNegotiation);
      let _decision_maker_negotiation = inputDecisionMakerNegotiationArray;
      // サーチ配列 決裁者商談有無 TEXT[] ------------ここまで
      let _subscription_interval = adjustFieldValue(inputSubscriptionInterval);
      // サーチ配列 競合状況 TEXT[] ------------
      // let _competition_state = adjustFieldValue(inputCompetitionState);
      let _competition_state = inputCompetitionStateArray;
      // サーチ配列 競合状況 TEXT[] ------------ここまで
      let _property_department = adjustFieldValue(inputPropertyDepartment);
      let _property_business_office = adjustFieldValue(inputPropertyBusinessOffice);
      let _property_member_name = adjustFieldValue(inputPropertyMemberName);

      // 🌠追加 案件四半期・半期(案件、展開、売上)・会計年度(案件、展開、売上)
      // -------------------------- 案件発生関連 --------------------------
      // let _property_date = inputPropertyDate ? inputPropertyDate.toISOString() : null;
      // 範囲検索 案件日 -----------
      // let _property_date = adjustFieldValueDate(inputPropertyDate);
      let _property_date = adjustFieldRangeTIMESTAMPTZ(inputPropertyDateSearch);
      // 範囲検索 案件日 -----------ここまで
      let _property_fiscal_year = adjustFieldValueNumber(inputPropertyFiscalYear);
      // 案件発生半期
      // let _property_half_year = adjustFieldValueNumber(inputPropertyHalfYear);
      let _property_half_year = null;
      if (!!selectedPropertyYearForHalf && !!selectedPropertyHalf) {
        const parsedHalfYear = parseInt(`${selectedPropertyYearForHalf}${selectedPropertyHalf}`, 10) ?? null;
        _property_half_year = isNaN(parsedHalfYear) ? null : parsedHalfYear;
      }
      _property_half_year = adjustFieldValueNumber(_property_half_year);
      // 案件発生四半期
      // let _property_quarter = adjustFieldValueNumber(inputPropertyQuarter);
      let _property_quarter = null;
      if (!!selectedPropertyYearForQuarter && !!selectedPropertyQuarter) {
        const parsedQuarter = parseInt(`${selectedPropertyYearForQuarter}${selectedPropertyQuarter}`, 10) ?? null;
        _property_quarter = isNaN(parsedQuarter) ? null : parsedQuarter;
      }
      _property_quarter = adjustFieldValueNumber(_property_quarter);
      // 案件発生年月度
      // let _property_year_month = adjustFieldValueNumber(inputPropertyYearMonth);
      let _property_year_month = null;
      if (!!selectedPropertyYearForMonth && !!selectedPropertyMonth) {
        const parsedYearMonth = parseInt(`${selectedPropertyYearForMonth}${selectedPropertyMonth}`, 10) ?? null;
        _property_year_month = isNaN(parsedYearMonth) ? null : parsedYearMonth;
      }
      _property_year_month = adjustFieldValueNumber(_property_year_month);
      // -------------------------- 案件発生関連 ここまで --------------------------

      // -------------------------- 展開関連 --------------------------
      // 範囲検索 展開日 -----------
      // let _expansion_date = inputExpansionDate ? (inputExpansionDate as Date).toISOString() : null;
      let _expansion_date = adjustFieldRangeTIMESTAMPTZ(inputExpansionDateSearch);
      // 範囲検索 展開日 -----------ここまで
      let _expansion_fiscal_year = adjustFieldValueNumber(inputExpansionFiscalYear);
      // 展開半期
      // let _expansion_half_year = adjustFieldValueNumber(inputExpansionHalfYear);
      let _expansion_half_year = null;
      if (!!selectedExpansionYearForHalf && !!selectedExpansionHalf) {
        const parsedHalfYear = parseInt(`${selectedExpansionYearForHalf}${selectedExpansionHalf}`, 10) ?? null;
        _expansion_half_year = isNaN(parsedHalfYear) ? null : parsedHalfYear;
      }
      _expansion_half_year = adjustFieldValueNumber(_expansion_half_year);
      // 展開四半期
      // let _expansion_quarter = adjustFieldValueNumber(inputExpansionQuarter);
      let _expansion_quarter = null;
      if (!!selectedExpansionYearForQuarter && !!selectedExpansionQuarter) {
        const parsedQuarter = parseInt(`${selectedExpansionYearForQuarter}${selectedExpansionQuarter}`, 10) ?? null;
        _expansion_quarter = isNaN(parsedQuarter) ? null : parsedQuarter;
      }
      _expansion_quarter = adjustFieldValueNumber(_expansion_quarter);
      // 展開年月度
      // let _expansion_year_month = adjustFieldValueNumber(inputExpansionYearMonth);
      let _expansion_year_month = null;
      if (!!selectedExpansionYearForMonth && !!selectedExpansionMonth) {
        const parsedYearMonth = parseInt(`${selectedExpansionYearForMonth}${selectedExpansionMonth}`, 10) ?? null;
        _expansion_year_month = isNaN(parsedYearMonth) ? null : parsedYearMonth;
      }
      _expansion_year_month = adjustFieldValueNumber(_expansion_year_month);
      // -------------------------- 展開関連 ここまで --------------------------

      // -------------------------- 売上関連 --------------------------
      // 範囲検索 売上日 -----------
      // let _sales_date = inputSalesDate ? (inputSalesDate as Date).toISOString() : null;
      let _sales_date = adjustFieldRangeTIMESTAMPTZ(inputSalesDateSearch);
      // 範囲検索 売上日 -----------ここまで
      let _sales_fiscal_year = adjustFieldValueNumber(inputSalesFiscalYear);
      // 売上半期
      // let _sales_half_year = adjustFieldValueNumber(inputSalesHalfYear);
      let _sales_half_year = null;
      if (!!selectedSalesYearForHalf && !!selectedSalesHalf) {
        const parsedHalfYear = parseInt(`${selectedSalesYearForHalf}${selectedSalesHalf}`, 10) ?? null;
        _sales_half_year = isNaN(parsedHalfYear) ? null : parsedHalfYear;
      }
      _sales_half_year = adjustFieldValueNumber(_sales_half_year);
      // 売上四半期
      // let _sales_quarter = adjustFieldValueNumber(inputSalesQuarter);
      let _sales_quarter = null;
      if (!!selectedSalesYearForQuarter && !!selectedSalesQuarter) {
        const parsedQuarter = parseInt(`${selectedSalesYearForQuarter}${selectedSalesQuarter}`, 10) ?? null;
        _sales_quarter = isNaN(parsedQuarter) ? null : parsedQuarter;
      }
      _sales_quarter = adjustFieldValueNumber(_sales_quarter);
      // 売上年月度
      // let _sales_year_month = adjustFieldValueNumber(inputSalesYearMonth);
      let _sales_year_month = null;
      if (!!selectedSalesYearForMonth && !!selectedSalesMonth) {
        const parsedYearMonth = parseInt(`${selectedSalesYearForMonth}${selectedSalesMonth}`, 10) ?? null;
        _sales_year_month = isNaN(parsedYearMonth) ? null : parsedYearMonth;
      }
      _sales_year_month = adjustFieldValueNumber(_sales_year_month);
      // -------------------------- 売上関連 ここまで --------------------------

      // -------------------------- 獲得予定関連 --------------------------
      // let _expected_order_date = inputExpectedOrderDate ? inputExpectedOrderDate.toISOString() : null;
      // 範囲検索 獲得予定日付 -----------
      // let _expected_order_date = adjustFieldValueDate(inputExpectedOrderDate);
      let _expected_order_date = adjustFieldRangeTIMESTAMPTZ(inputExpectedOrderDateSearch);
      // 範囲検索 獲得予定日付 -----------ここまで
      // 獲得予定年度
      let _expected_order_fiscal_year = adjustFieldValueNumber(inputExpectedOrderFiscalYear);
      // 獲得予定半期
      // let _expected_order_half_year = adjustFieldValueNumber(inputExpectedOrderHalfYear);
      let _expected_order_half_year = null;
      if (!!selectedExpectedOrderYearForHalf && !!selectedExpectedOrderHalf) {
        const parsedHalfYear = parseInt(`${selectedExpectedOrderYearForHalf}${selectedExpectedOrderHalf}`, 10) ?? null;
        _expected_order_half_year = isNaN(parsedHalfYear) ? null : parsedHalfYear;
      }
      _expected_order_half_year = adjustFieldValueNumber(_expected_order_half_year);
      // 獲得予定四半期
      // let _expected_order_quarter = adjustFieldValueNumber(inputExpectedOrderQuarter);
      let _expected_order_quarter = null;
      if (!!selectedExpectedOrderYearForQuarter && !!selectedExpectedOrderQuarter) {
        const parsedQuarter =
          parseInt(`${selectedExpectedOrderYearForQuarter}${selectedExpectedOrderQuarter}`, 10) ?? null;
        _expected_order_quarter = isNaN(parsedQuarter) ? null : parsedQuarter;
      }
      _expected_order_quarter = adjustFieldValueNumber(_expected_order_quarter);
      // 獲得予定年月度
      // let _expected_order_year_month = adjustFieldValueNumber(inputExpectedOrderYearMonth);
      let _expected_order_year_month = null;
      if (!!selectedExpectedOrderYearForMonth && !!selectedExpectedOrderMonth) {
        const parsedYearMonth =
          parseInt(`${selectedExpectedOrderYearForMonth}${selectedExpectedOrderMonth}`, 10) ?? null;
        _expected_order_year_month = isNaN(parsedYearMonth) ? null : parsedYearMonth;
      }
      _expected_order_year_month = adjustFieldValueNumber(_expected_order_year_month);
      // -------------------------- 獲得予定関連 ここまで --------------------------

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
        // budget_request_month1: _budget_request_month1,
        // budget_request_month2: _budget_request_month2,
        fiscal_end_month: isNullNotNullFiscal === null ? _fiscal_end_month : adjustIsNNN(isNullNotNullFiscal),
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
        // occupation: _occupation,
        position_class: isNullNotNullPositionClass === null ? _position_class : adjustIsNNN(isNullNotNullPositionClass),
        occupation: isNullNotNullOccupation === null ? _occupation : adjustIsNNN(isNullNotNullOccupation),
        // サーチ配列 TEXT[] 職位・担当職種 ------------ここまで
        // 範囲検索 決裁金額 ------------
        approval_amount: _approval_amount,
        // 範囲検索 決裁金額 ------------ここまで
        "contacts.created_by_company_id": _contact_created_by_company_id,
        "contacts.created_by_user_id": _contact_created_by_user_id,
        // propertiesテーブル
        // "properties.created_by_company_id": _property_created_by_company_id,
        "properties.created_by_company_id": _property_created_by_company_id,
        "properties.created_by_user_id": _property_created_by_user_id,
        "properties.created_by_department_of_user": _property_created_by_department_of_user,
        "properties.created_by_section_of_user": _property_created_by_section_of_user,
        "properties.created_by_unit_of_user": _property_created_by_unit_of_user,
        "properties.created_by_office_of_user": _property_created_by_office_of_user,

        // サーチ配列 TEXT[] 現ステータス ------------
        // current_status: _current_status,
        current_status: isNullNotNullCurrentStatus === null ? _current_status : adjustIsNNN(isNullNotNullCurrentStatus),

        property_name: _property_name,
        property_summary: _property_summary,
        pending_flag: _pending_flag,
        rejected_flag: _rejected_flag,
        // product_name: _product_name,
        // expected_product_id: _expected_product_id,
        expected_product: _expected_product,
        // 範囲検索 予定売上台数 ------------
        product_sales: _product_sales,

        // 範囲検索 獲得予定日 ------------
        expected_order_date: _expected_order_date,

        // 範囲検索 予定売上合計 ------------
        expected_sales_price: _expected_sales_price,

        term_division: _term_division,
        // sold_product_name: _sold_product_name,
        sold_product: _sold_product,
        // 範囲検索 売上台数 ------------
        unit_sales: _unit_sales,

        // サーチ配列 TEXT[] 売上貢献区分 ------------
        // sales_contribution_category: _sales_contribution_category,
        sales_contribution_category:
          isNullNotNullSalesContributionCategory === null
            ? _sales_contribution_category
            : adjustIsNNN(isNullNotNullSalesContributionCategory),

        // 範囲検索 売上合計 ------------
        sales_price: _sales_price,

        // 範囲検索 値引額 ------------
        discounted_price: _discounted_price,

        // 範囲検索 値引率 ------------
        discount_rate: _discount_rate,

        // サーチ配列 TEXT[] 導入分類 ------------
        // sales_class: _sales_class,
        sales_class: isNullNotNullSalesClass === null ? _sales_class : adjustIsNNN(isNullNotNullSalesClass),

        // 範囲検索 展開日 ------------
        expansion_date: _expansion_date,

        // 範囲検索 売上日 ------------
        sales_date: _sales_date,

        expansion_quarter: _expansion_quarter,
        sales_quarter: _sales_quarter,

        // 範囲検索 サブスク開始日 ------------
        subscription_start_date: _subscription_start_date,

        // 範囲検索 サブスク終了日 ------------
        subscription_canceled_at: _subscription_canceled_at,

        leasing_company: _leasing_company,
        lease_division: _lease_division,
        // 範囲検索 リース完了予定日 ------------
        lease_expiration_date: _lease_expiration_date,

        step_in_flag: _step_in_flag,
        repeat_flag: _repeat_flag,
        // サーチ配列 number[] 月初確度 ------------
        // order_certainty_start_of_month: _order_certainty_start_of_month,
        order_certainty_start_of_month:
          isNullNotNullOrderCertaintyStartOfMonth === null
            ? _order_certainty_start_of_month
            : adjustIsNNN(isNullNotNullOrderCertaintyStartOfMonth),

        // サーチ配列 number[] 中間見直確度 ------------
        // review_order_certainty: _review_order_certainty,
        review_order_certainty:
          isNullNotNullReviewOrderCertainty === null
            ? _review_order_certainty
            : adjustIsNNN(isNullNotNullReviewOrderCertainty),

        // 範囲検索 競合発生日 ------------
        competitor_appearance_date: _competitor_appearance_date,

        competitor: _competitor,
        competitor_product: _competitor_product,

        // サーチ配列 TEXT[] 案件発生動機 ------------
        // reason_class: _reason_class,
        reason_class: isNullNotNullReasonClass === null ? _reason_class : adjustIsNNN(isNullNotNullReasonClass),

        reason_detail: _reason_detail,
        // 範囲検索 客先予算 ------------
        customer_budget: _customer_budget,

        decision_maker_negotiation: _decision_maker_negotiation,
        expansion_year_month: _expansion_year_month,
        sales_year_month: _sales_year_month,
        subscription_interval: _subscription_interval,
        // サーチ配列 TEXT[] 競合状況 ------------
        // competition_state: _competition_state,
        competition_state:
          isNullNotNullCompetitionState === null ? _competition_state : adjustIsNNN(isNullNotNullCompetitionState),

        property_year_month: _property_year_month,
        property_department: _property_department,
        property_business_office: _property_business_office,
        property_member_name: _property_member_name,
        property_date: _property_date,
        // 🌠追加 案件四半期・半期(案件、展開、売上)・会計年度(案件、展開、売上)
        property_quarter: _property_quarter,
        property_half_year: _property_half_year,
        expansion_half_year: _expansion_half_year,
        sales_half_year: _sales_half_year,
        property_fiscal_year: _property_fiscal_year,
        expansion_fiscal_year: _expansion_fiscal_year,
        sales_fiscal_year: _sales_fiscal_year,
        // 🔹獲得予定関連
        expected_order_fiscal_year: _expected_order_fiscal_year,
        expected_order_half_year: _expected_order_half_year,
        expected_order_quarter: _expected_order_quarter,
        expected_order_year_month: _expected_order_year_month,
      };

      // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
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
      // setInputBudgetRequestMonth1("");
      // setInputBudgetRequestMonth2("");
      setInputFiscalArray([]);
      if (isNullNotNullFiscal !== null) setIsNullNotNullFiscal(null);
      setInputBudgetRequestMonth1Array([]);
      if (isNullNotNullBudgetRequestMonth1 !== null) setIsNullNotNullBudgetRequestMonth1(null);
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
      // setInputOccupation("");
      setInputPositionClassArray([]);
      if (isNullNotNullPositionClass !== null) setIsNullNotNullPositionClass(null);
      setInputOccupationArray([]);
      if (isNullNotNullOccupation !== null) setIsNullNotNullOccupation(null);
      // サーチ配列 職位・担当職種 ----------------------- ここまで
      // 範囲検索 決裁金額 ----------------
      // setInputApprovalAmount("");
      setInputApprovalAmountSearch({ min: "", max: "" });
      // 範囲検索 決裁金額 ----------------ここまで
      setInputContactCreatedByCompanyId("");
      setInputContactCreatedByUserId("");
      // Propertysテーブル
      setInputPropertyCreatedByCompanyId("");
      setInputPropertyCreatedByUserId("");
      setInputPropertyCreatedByDepartmentOfUser("");
      setInputPropertyCreatedBySectionOfUser("");
      setInputPropertyCreatedByUnitOfUser("");
      setInputPropertyCreatedByOfficeOfUser("");
      // サーチ配列 現ステータス -----------------------
      // setInputCurrentStatus("");
      setInputCurrentStatusArray([]);
      if (isNullNotNullCurrentStatus !== null) setIsNullNotNullCurrentStatus(null);
      //
      setInputPropertyName("");
      setInputPropertySummary("");
      setInputPendingFlag(null);
      setInputRejectedFlag(null);
      setInputProductName("");
      // 範囲検索 予定売上台数 ----------------
      // setInputProductSales(null);
      setInputProductSalesSearch({ min: null, max: null });
      //
      // setInputExpectedSalesPrice(null);
      // 範囲検索 予定売上合計 ----------------
      // setInputExpectedSalesPrice("");
      setInputExpectedSalesPriceSearch({ min: "", max: "" });

      setInputTermDivision("");
      setInputSoldProductName("");
      // 範囲検索 予定売上台数 ----------------
      // setInputUnitSales(null);
      setInputUnitSalesSearch({ min: null, max: null });

      // サーチ配列 売上貢献区分 -----------------------
      // setInputSalesContributionCategory("");
      setInputSalesContributionCategoryArray([]);
      if (isNullNotNullSalesContributionCategory !== null) setIsNullNotNullSalesContributionCategory(null);

      // setInputSalesPrice(null);
      // setInputDiscountedPrice(null);
      // setInputDiscountRate(null);
      // 範囲検索 売上合計 ----------------
      // setInputSalesPrice("");
      setInputSalesPriceSearch({ min: "", max: "" });

      // 範囲検索 値引価格 ----------------
      // setInputDiscountedPrice("");
      setInputDiscountedPriceSearch({ min: "", max: "" });

      // 範囲検索 値引率 ----------------
      // setInputDiscountRate("");
      setInputDiscountRateSearch({ min: "", max: "" });

      // サーチ配列 導入分類 -----------------------
      // setInputSalesClass("");
      setInputSalesClassArray([]);
      if (isNullNotNullSalesClass !== null) setIsNullNotNullSalesClass(null);

      // setInputExpansionQuarter("");
      // setInputSalesQuarter("");
      // 範囲検索 サブスク開始日 ----------------
      // setInputSubscriptionStartDate(null);
      setInputSubscriptionStartDateSearch({ min: null, max: null });

      // 範囲検索 サブスク終了日 ----------------
      // setInputSubscriptionCanceledAt(null);
      setInputSubscriptionCanceledAtSearch({ min: null, max: null });

      setInputLeasingCompany("");
      setInputLeaseDivision("");
      // 範囲検索 リース満了予定日 ----------------
      // setInputLeaseExpirationDate(null);
      setInputLeaseExpirationDateSearch({ min: null, max: null });

      setInputStepInFlag(null);
      setInputRepeatFlag(null);
      // サーチ配列 月初確度 -----------------------
      // setInputOrderCertaintyStartOfMonth("");
      setInputOrderCertaintyStartOfMonthArray([]);
      if (isNullNotNullOrderCertaintyStartOfMonth !== null) setIsNullNotNullOrderCertaintyStartOfMonth(null);

      // サーチ配列 中間見直確度 -----------------------
      // setInputReviewOrderCertainty("");
      setInputReviewOrderCertaintyArray([]);
      if (isNullNotNullReviewOrderCertainty !== null) setIsNullNotNullReviewOrderCertainty(null);

      // 範囲検索 競合発生日 ----------------
      // setInputCompetitorAppearanceDate(null);
      setInputCompetitorAppearanceDateSearch({ min: null, max: null });

      setInputCompetitor("");
      setInputCompetitorProduct("");
      // サーチ配列 案件発生動機 -----------------------
      // setInputReasonClass("");
      setInputReasonClassArray([]);
      if (isNullNotNullReasonClass !== null) setIsNullNotNullReasonClass(null);

      setInputReasonDetail("");
      // setInputCustomerBudget(null);
      // 範囲検索 客先予算 ----------------
      // setInputCustomerBudget("");
      setInputCustomerBudgetSearch({ min: "", max: "" });

      // サーチ配列 決裁者商談有無 -----------------------
      // setInputDecisionMakerNegotiation("");
      setInputDecisionMakerNegotiationArray([]);
      if (isNullNotNullDecisionMakerNegotiation !== null) setIsNullNotNullDecisionMakerNegotiation(null);

      setInputSubscriptionInterval("");
      // サーチ配列 競合状況 -----------------------
      // setInputCompetitionState("");
      setInputCompetitionStateArray([]);
      if (isNullNotNullCompetitionState !== null) setIsNullNotNullCompetitionState(null);

      setInputPropertyDepartment("");
      setInputPropertyBusinessOffice("");
      setInputPropertyMemberName("");
      // 🌠追加 案件四半期・半期(案件、展開、売上)・会計年度(案件、展開、売上)

      // -------------------------- 案件発生関連 --------------------------
      // 範囲検索 案件発生日付 ----------------
      // setInputPropertyDate(null);
      setInputPropertyDateSearch({ min: null, max: null });
      // 案件発生年度
      setInputPropertyFiscalYear(null);
      // 案件発生半期
      // setInputPropertyHalfYear(null);
      if (!!selectedPropertyYearForHalf) setSelectedPropertyYearForHalf("");
      if (!!selectedPropertyHalf) setSelectedPropertyHalf("");
      // 案件発生四半期
      // setInputPropertyQuarter(null);
      if (!!selectedPropertyYearForQuarter) setSelectedPropertyYearForQuarter("");
      if (!!selectedPropertyQuarter) setSelectedPropertyQuarter("");
      // 案件発生年月度
      // setInputPropertyYearMonth(null);
      if (!!selectedPropertyYearForMonth) setSelectedPropertyYearForMonth("");
      if (!!selectedPropertyMonth) setSelectedPropertyMonth("");
      // -------------------------- 案件発生関連 ここまで --------------------------

      // -------------------------- 展開関連 --------------------------
      // 範囲検索 展開日付 ----------------
      // setInputExpansionDate(null);
      setInputExpansionDateSearch({ min: null, max: null });
      // 展開年度
      setInputExpansionFiscalYear(null);
      // 展開半期
      // setInputExpansionHalfYear(null);
      if (!!selectedExpansionYearForHalf) setSelectedExpansionYearForHalf("");
      if (!!selectedExpansionHalf) setSelectedExpansionHalf("");
      // 展開四半期
      // setInputExpansionQuarter(null);
      if (!!selectedExpansionYearForQuarter) setSelectedExpansionYearForQuarter("");
      if (!!selectedExpansionQuarter) setSelectedExpansionQuarter("");
      // 展開年月度
      // setInputExpansionYearMonth(null);
      if (!!selectedExpansionYearForMonth) setSelectedExpansionYearForMonth("");
      if (!!selectedExpansionMonth) setSelectedExpansionMonth("");
      // -------------------------- 展開関連 ここまで --------------------------

      // -------------------------- 売上関連 --------------------------
      // 範囲検索 売上日付 ----------------
      // setInputSalesDate(null);
      setInputSalesDateSearch({ min: null, max: null });
      // 売上年度
      setInputSalesFiscalYear(null);
      // 売上半期
      // setInputSalesHalfYear(null);
      if (!!selectedSalesYearForHalf) setSelectedSalesYearForHalf("");
      if (!!selectedSalesHalf) setSelectedSalesHalf("");
      // 売上四半期
      // setInputSalesQuarter(null);
      if (!!selectedSalesYearForQuarter) setSelectedSalesYearForQuarter("");
      if (!!selectedSalesQuarter) setSelectedSalesQuarter("");
      // 売上年月度
      // setInputSalesYearMonth(null);
      if (!!selectedSalesYearForMonth) setSelectedSalesYearForMonth("");
      if (!!selectedSalesMonth) setSelectedSalesMonth("");
      // -------------------------- 売上関連 ここまで --------------------------

      // -------------------------- 獲得予定関連 --------------------------
      // 範囲検索 獲得予定日付 ----------------
      // setInputExpectedOrderDate(null);
      setInputExpectedOrderDateSearch({ min: null, max: null });
      // 獲得予定年度
      setInputExpectedOrderFiscalYear(null);
      // 獲得予定半期
      // setInputExpectedOrderHalfYear(null);
      if (!!selectedExpectedOrderYearForHalf) setSelectedExpectedOrderYearForHalf("");
      if (!!selectedExpectedOrderHalf) setSelectedExpectedOrderHalf("");
      // 獲得予定四半期
      // setInputExpectedOrderQuarter(null);
      if (!!selectedExpectedOrderYearForQuarter) setSelectedExpectedOrderYearForQuarter("");
      if (!!selectedExpectedOrderQuarter) setSelectedExpectedOrderQuarter("");
      // 獲得予定年月度
      // setInputExpectedOrderYearMonth(null);
      if (!!selectedExpectedOrderYearForMonth) setSelectedExpectedOrderYearForMonth("");
      if (!!selectedExpectedOrderMonth) setSelectedExpectedOrderMonth("");
      // -------------------------- 獲得予定関連 ここまで --------------------------

      // サーチモードオフ
      setSearchMode(false);
      setEditSearchMode(false);

      // Zustandに検索条件を格納
      setNewSearchProperty_Contact_CompanyParams(params);

      // 選択中の列データをリセット
      setSelectedRowDataProperty(null);

      console.log("✅ 条件 params", params);
      // const { data, error } = await supabase.rpc("search_companies", { params });
      // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
      // const { data, error } = await supabase.rpc("search_activities_and_companies_and_contacts", { params });
      // const { data, error } = await supabase.rpc("search_properties_and_companies_and_contacts", { params });

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

  // ================== 🌟ユーザーの決算月の締め日を初回マウント時に取得🌟 ==================
  const fiscalEndMonthObjRef = useRef<Date | null>(null);
  const closingDayRef = useRef<number | null>(null);
  useEffect(() => {
    // ユーザーの決算月から締め日を取得、決算つきが未設定の場合は現在の年と3月31日を設定
    const fiscalEndMonth = userProfileState?.customer_fiscal_end_month
      ? new Date(userProfileState.customer_fiscal_end_month)
      : new Date(new Date().getFullYear(), 2, 31); // 決算日が未設定なら3月31日に自動設定
    const closingDay = fiscalEndMonth.getDate(); //ユーザーの締め日
    fiscalEndMonthObjRef.current = fiscalEndMonth; //refに格納
    closingDayRef.current = closingDay; //refに格納
  }, []);
  // ================== ✅ユーザーの決算月の締め日を初回マウント時に取得✅ ==================

  // ==================================== 🌟ツールチップ🌟 ====================================
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
    content?: string;
    content2?: string;
    content3?: string;
  };
  const handleOpenTooltip = ({
    e,
    display = "top",
    marginTop,
    itemsPosition,
    whiteSpace,
    content,
    content2,
    content3,
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
      content: !!content ? content : ((e.target as HTMLDivElement).dataset.text as string),
      content2: !!content2 ? content2 : content2Text,
      content3: !!content3 ? content3 : content3Text,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
      whiteSpace: whiteSpace,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPosWrap) setHoveredItemPosWrap(null);
  };
  // ==================================== ✅ツールチップ✅ ====================================

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
  const isMatchDepartment =
    !!userProfileState?.assigned_department_id &&
    !!selectedRowDataProperty?.property_created_by_department_of_user &&
    selectedRowDataProperty.property_created_by_department_of_user === userProfileState?.assigned_department_id;

  // シングルクリック => 何もアクションなし
  const handleSingleClickField = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!selectedRowDataProperty) return;
      // 自社で作成した会社でない場合はそのままリターン
      // if (!isMatchDepartment) return;
      if (setTimeoutRef.current !== null) return;

      setTimeoutRef.current = setTimeout(() => {
        setTimeoutRef.current = null;
        // シングルクリック時に実行したい処理
        // 0.2秒後に実行されてしまうためここには書かない
      }, 200);
      console.log("シングルクリック");
    },
    [selectedRowDataProperty]
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
      if (!selectedRowDataProperty) return;
      // 自社で作成した会社でない場合はそのままリターン
      // if (!isOurActivity) return;

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

        // if (["planned_start_time", "result_start_time", "result_end_time"].includes(field)) {
        //   const formattedTime = formatTime(text);
        //   originalValueFieldEdit.current = formattedTime;
        //   const timeParts = splitTime(text);
        //   console.log("formattedTime", formattedTime);
        //   if (field === "planned_start_time") {
        //     setInputPlannedStartTimeHour(timeParts?.hours ?? "");
        //     setInputPlannedStartTimeMinute(timeParts?.minutes ?? "");
        //   } else if (field === "result_start_time") {
        //     setInputResultStartTimeHour(timeParts?.hours ?? "");
        //     setInputResultStartTimeMinute(timeParts?.minutes ?? "");
        //   } else if (field === "result_end_time") {
        //     setInputResultEndTimeHour(timeParts?.hours ?? "");
        //     setInputResultEndTimeMinute(timeParts?.minutes ?? "");
        //   }
        //   dispatch(formattedTime); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
        //   setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
        //   return;
        // }
        // 🔹価格の区切り文字を編集時は取り除く
        if (["expected_sales_price", "sales_price", "discounted_price", "customer_budget"].includes(field)) {
          // text = text.replace(/,円/g, "");
          text = text.replace(/[,円]/g, "");
          console.log("text", text);
        }
        if (field === "fiscal_end_month") {
          text = text.replace(/月/g, ""); // 決算月の場合は、1月の月を削除してstateに格納 optionタグのvalueと一致させるため
        }
        // // 🔹「活動日付」「次回フォロー予定日」はinnerHTMLではなく元々の値を格納
        if (
          [
            "expected_order_date",
            "expansion_date",
            "sales_date",
            "property_date",
            "subscription_start_date",
            "subscription_canceled_at",
            "lease_expiration_date",
            "competitor_appearance_date",
          ].includes(field)
        ) {
          const originalDate = dateValue ? new Date(dateValue) : null;
          console.log("ダブルクリック 日付格納", dateValue);
          // originalValueFieldEdit.current = originalDate;
          dispatch(originalDate); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
          setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
          return;
        }
        if (field === "result_top_position_class") {
          dispatch(selectedRowDataValue); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
          setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
          return;
        }
        //
        if (["order_certainty_start_of_month", "review_order_certainty"].includes(field)) {
          // const numValue = getInvertOrderCertaintyStartOfMonth(selectedRowDataValue);
          originalValueFieldEdit.current = selectedRowDataValue;
          dispatch(selectedRowDataValue);
          setIsEditModeField(field);
          return;
        }
        originalValueFieldEdit.current = text;
        dispatch(text); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
        setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
        // if (isSelectChangeEvent) originalOptionRef.current = e.currentTarget.innerText; // selectタグ同じ選択肢選択時の編集モード終了用
      }
    },
    [setIsEditModeField, selectedRowDataProperty]
    // [isOurActivity, setIsEditModeField]
  );
  // ================== ✅シングルクリック、ダブルクリックイベント✅ ==================

  // プロパティ名のユニオン型の作成
  // Property_row_data型の全てのプロパティ名をリテラル型のユニオンとして展開
  // type ActivityFieldNames = keyof Property_row_data;
  type PropertyFieldNames = keyof Property;
  type ExcludeKeys = "company_id" | "contact_id" | "property_id"; // 除外するキー
  type PropertyFieldNamesForSelectedRowData = Exclude<keyof Property_row_data, ExcludeKeys>; // Property_row_dataタイプのプロパティ名のみのデータ型を取得
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
    fieldName: PropertyFieldNames;
    fieldNameForSelectedRowData: PropertyFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
  }) => {
    // 日本語入力変換中はtrueで変換確定のエンターキーではUPDATEクエリが実行されないようにする
    // 英語などの入力変換が存在しない言語ではisCompositionStartは発火しないため常にfalse
    if (e.key === "Enter" && !isComposing) {
      if (required && (newValue === "" || newValue === null)) return toast.info(`この項目は入力が必須です。`);

      // if (fieldName === "customer_budget") {
      //   console.log("newValue", newValue);
      //   return;
      // }

      // 先にアンダーラインが残らないようにremoveしておく
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

      if (!id || !selectedRowDataProperty) {
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

      // 売上台数unit_sales, 売上合計sales_price, 値引価格discount_priceを変更する場合で
      // かつ値引率も同時に変更する
      if (
        ["unit_sales", "sales_price", "discounted_price"].includes(fieldName) &&
        selectedRowDataProperty &&
        checkNotFalsyExcludeZero(selectedRowDataProperty.sales_price) &&
        checkNotFalsyExcludeZero(selectedRowDataProperty.unit_sales) &&
        checkNotFalsyExcludeZero(selectedRowDataProperty.discounted_price)
      ) {
        // 売上台数、売上合計、値引価格のどれかがnullなら値引率をnullにする
        if (newValue === null) {
          const updatePayload = {
            fieldName: fieldName,
            fieldNameForSelectedRowData: fieldNameForSelectedRowData,
            newValue: newValue,
            id: id,
            discountRate: null,
          };
          // 入力変換確定状態でエンターキーが押された場合の処理
          console.log(
            "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 null 値引率もnullで更新 updatePayload",
            updatePayload
          );

          await updatePropertyFieldMutation.mutateAsync(updatePayload);
        }
        // 売上台数、売上合計が0円の場合
        else if (["unit_sales", "sales_price"].includes(fieldName) && ["0", "０", 0].includes(newValue)) {
          const updatePayload = {
            fieldName: fieldName,
            fieldNameForSelectedRowData: fieldNameForSelectedRowData,
            newValue: newValue,
            id: id,
            discountRate: null,
          };
          // 入力変換確定状態でエンターキーが押された場合の処理
          console.log(
            "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 0 値引率nullで更新 updatePayload",
            updatePayload
          );

          await updatePropertyFieldMutation.mutateAsync(updatePayload);
        }
        // それ以外
        else if (checkNotFalsyExcludeZero(newValue)) {
          // 値引率を再計算
          const _salesPriceStr =
            fieldName === "sales_price" ? newValue : selectedRowDataProperty.sales_price!.toString().replace(/,/g, "");
          const _discountPriceStr =
            fieldName === "discounted_price"
              ? newValue
              : selectedRowDataProperty.discounted_price!.toString().replace(/,/g, "");
          const _salesQuantityStr =
            fieldName === "unit_sales" ? newValue.toString() : selectedRowDataProperty.unit_sales!.toString();

          const payload = {
            salesPriceStr: _salesPriceStr,
            discountPriceStr: _discountPriceStr,
            // salesQuantityStr: unitSales.toString(),
            salesQuantityStr: _salesQuantityStr,
          };

          console.log("値引率のpayload", payload);
          const result = calculateDiscountRate(payload);
          const _discountRate = result.discountRate;
          if (!_discountRate || result.error) return console.log("値引率取得エラー リターン：", result.error);

          const updatePayload = {
            fieldName: fieldName,
            fieldNameForSelectedRowData: fieldNameForSelectedRowData,
            newValue: newValue,
            id: id,
            discountRate: _discountRate.replace(/%/g, ""),
          };
          // 入力変換確定状態でエンターキーが押された場合の処理
          console.log(
            "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 値引率も同時更新 updatePayload",
            updatePayload,
            "selectedRowDataProperty.sales_price",
            selectedRowDataProperty.sales_price,
            "selectedRowDataProperty.unit_sales",
            selectedRowDataProperty.unit_sales,
            "selectedRowDataProperty.discounted_price",
            selectedRowDataProperty.discounted_price
          );
          await updatePropertyFieldMutation.mutateAsync(updatePayload);
        }

        originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
        setIsEditModeField(null); // エディットモードを終了
        return;
      }

      // 通常ルート

      const updatePayload = {
        fieldName: fieldName,
        fieldNameForSelectedRowData: fieldNameForSelectedRowData,
        newValue: newValue,
        id: id,
      };
      // 入力変換確定状態でエンターキーが押された場合の処理
      console.log("onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 updatePayload", updatePayload);
      await updatePropertyFieldMutation.mutateAsync(updatePayload);
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
    newDateObj,
  }: {
    e: React.MouseEvent<HTMLDivElement, MouseEvent>;
    // fieldName: string;
    fieldName: PropertyFieldNames;
    fieldNameForSelectedRowData: PropertyFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
    newDateObj?: Date;
  }) => {
    if (required && (newValue === "" || newValue === null)) return toast.info(`この項目は入力が必須です。`);

    // if (["planned_comment"].includes(fieldName)) {
    //   console.log("e.currentTarget.parentElement", e.currentTarget.parentElement);
    //   console.log("e.currentTarget.parentElement?.parentElement", e.currentTarget.parentElement?.parentElement);
    //   return;
    // }
    if (["planned_start_time", "result_start_time", "result_end_time", "planned_comment"].includes(fieldName)) {
      e.currentTarget.parentElement?.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
      // console.log("originalValue === newValue", originalValue === newValue);
      // return;
    } else {
      e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
    }

    if (!id || !selectedRowDataProperty) {
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

    // 🔹日付関連
    if (
      [
        "expected_order_date",
        "expansion_date",
        "sales_date",
        "property_date",
        "lease_expiration_date",
        "subscription_start_date",
        "subscription_canceled_at",
        "competitor_appearance_date",
      ].includes(fieldName)
    ) {
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
      }
      // 日付変化しているかチェックOK 異なる日付のためUPDATE
      else {
        console.log("日付チェック 新たな日付のためこのまま更新 newValue", newValue);
        // フィールドがproperty_date（案件日）は年月度も, expansion_date, sales_dateの場合は四半期と年月度も同時に更新
        if (
          fieldName === "property_date" ||
          fieldName === "expansion_date" ||
          fieldName === "sales_date" ||
          fieldName === "expected_order_date"
        ) {
          if (!(newDateObj instanceof Date)) return console.log("Dateオブジェクトでないためリターン");
          if (!closingDayRef.current)
            return toast.error("決算日データが確認できないため、活動を更新できませんでした...🙇‍♀️");
          // if (!(newValue instanceof Date)) return toast.error("エラー：無効な日付です。");
          type ExcludeKeys = "company_id" | "contact_id" | "property_id"; // 除外するキー idはUPDATEすることは無いため
          type PropertyFieldNamesForSelectedRowData = Exclude<keyof Property_row_data, ExcludeKeys>;
          type UpdateObject = {
            fieldName: string;
            fieldNameForSelectedRowData: PropertyFieldNamesForSelectedRowData;
            newValue: any;
            id: string;
            yearMonth?: number | null;
            yearQuarter?: number | null;
            yearHalf?: number | null;
            fiscalYear?: number | null;
          };

          // const fiscalYearMonth = calculateDateToYearMonth(new Date(newValue), closingDayRef.current);
          // 年月度を取得
          const fiscalYearMonth = calculateDateToYearMonth(newDateObj, closingDayRef.current);
          console.log("新たに生成された年月度", fiscalYearMonth, "fieldName", fieldName, "newValue", newValue);

          // ----------------- テスト -----------------
          const fiscalBasis = userProfileState?.customer_fiscal_year_basis
            ? userProfileState?.customer_fiscal_year_basis
            : "firstDayBasis";
          const fiscalEndDateObj = fiscalEndMonthObjRef.current;
          if (!fiscalEndDateObj) return alert("エラー：決算日データが見つかりませんでした。");
          const fiscalYear = getFiscalYear(
            // newValue,
            newDateObj,
            fiscalEndDateObj.getMonth() + 1,
            fiscalEndDateObj.getDate(),
            fiscalBasis
          );

          const fiscalQuarter = getFiscalQuarterTest(fiscalEndDateObj, newDateObj);
          const fiscalYearQuarter = fiscalYear * 10 + fiscalQuarter; // 2024年Q3 => 20243

          // 四半期の20243から、年と四半期をそれぞれ取得して、半期の算出と年度を格納する
          // const fiscalYearOnly = Number(fiscalYearQuarter.toString().slice(0, 4)); // 2024
          const fiscalQuarterOnly = Number(fiscalYearQuarter.toString().slice(-1)); // 3
          // 半期を算出
          const fiscalHalf = [1, 2].includes(fiscalQuarterOnly) ? 1 : [3, 4].includes(fiscalQuarterOnly) ? 2 : null;
          const fiscalHalfYear = Number(`${fiscalYear}${fiscalHalf}`);
          // ----------------- テスト -----------------

          if (!fiscalYearMonth) return toast.error("日付の更新に失敗しました。");

          if (fieldName === "property_date") {
            const updatePayload: UpdateObject = {
              fieldName: fieldName,
              fieldNameForSelectedRowData: fieldNameForSelectedRowData,
              newValue: !!newValue ? newValue : null,
              id: id,
              yearMonth: fiscalYearMonth,
              yearQuarter: fiscalYearQuarter,
              yearHalf: fiscalHalfYear,
              fiscalYear: fiscalYear,
            };
            // 入力変換確定状態でエンターキーが押された場合の処理
            console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
            await updatePropertyFieldMutation.mutateAsync(updatePayload);
          }
          // 展開日付と売上日付は四半期と年月度も同時にUPDATEする
          else if (
            fieldName === "expansion_date" ||
            fieldName === "sales_date" ||
            fieldName === "expected_order_date"
          ) {
            // if (!(newDateObj instanceof Date)) return console.log("Dateオブジェクトでないためリターン");
            // const fiscalEndDateObj = fiscalEndMonthObjRef.current;
            // if (!fiscalEndDateObj) return alert("エラー：決算日データが見つかりませんでした。");
            // const fiscalYear = getFiscalYear(
            //   // newValue,
            //   newDateObj,
            //   fiscalEndDateObj.getMonth() + 1,
            //   fiscalEndDateObj.getDate(),
            //   fiscalBasis
            // );

            // const fiscalQuarter = getFiscalQuarterTest(fiscalEndDateObj, newDateObj);
            // const fiscalYearQuarter = fiscalYear * 10 + fiscalQuarter;

            const updatePayload: UpdateObject = {
              fieldName: fieldName,
              fieldNameForSelectedRowData: fieldNameForSelectedRowData,
              newValue: !!newValue ? newValue : null,
              id: id,
              yearMonth: fiscalYearMonth,
              yearQuarter: fiscalYearQuarter,
              yearHalf: fiscalHalfYear,
              fiscalYear: fiscalYear,
            };
            // 入力変換確定状態でエンターキーが押された場合の処理
            console.log(
              "selectタグでUPDATE実行 updatePayload",
              updatePayload,
              "fiscalQuarter",
              fiscalQuarter,
              "fiscalYear",
              fiscalYear
            );
            await updatePropertyFieldMutation.mutateAsync(updatePayload);
          }
          originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
          setIsEditModeField(null); // エディットモードを終了
          return;
        }
      }
    }
    // 🔹日付以外
    // 入力値が現在のvalueと同じであれば更新は不要なため閉じてリターン null = null ''とnullもリターン textareaはnullの場合表示は空文字で表示されているため
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

    // 🔹売上台数、売上合計、値引価格の値引率同時更新ルート
    if (
      ["unit_sales", "sales_price", "discounted_price"].includes(fieldName) &&
      selectedRowDataProperty &&
      checkNotFalsyExcludeZero(selectedRowDataProperty.sales_price) &&
      checkNotFalsyExcludeZero(selectedRowDataProperty.unit_sales) &&
      checkNotFalsyExcludeZero(selectedRowDataProperty.discounted_price)
    ) {
      // 売上台数、売上合計、値引価格のどれかがnullなら値引率をnullにする
      if (newValue === null) {
        const updatePayload = {
          fieldName: fieldName,
          fieldNameForSelectedRowData: fieldNameForSelectedRowData,
          newValue: newValue,
          id: id,
          discountRate: null,
        };
        // 入力変換確定状態でエンターキーが押された場合の処理
        console.log(
          "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 null 値引率もnullで更新 updatePayload",
          updatePayload
        );

        await updatePropertyFieldMutation.mutateAsync(updatePayload);
      }
      // 売上台数、売上合計が0円の場合
      else if (["unit_sales", "sales_price"].includes(fieldName) && ["0", "０", 0].includes(newValue)) {
        const updatePayload = {
          fieldName: fieldName,
          fieldNameForSelectedRowData: fieldNameForSelectedRowData,
          newValue: newValue,
          id: id,
          discountRate: null,
        };
        // 入力変換確定状態でエンターキーが押された場合の処理
        console.log(
          "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 0 値引率nullで更新 updatePayload",
          updatePayload
        );

        await updatePropertyFieldMutation.mutateAsync(updatePayload);
      }
      // それ以外
      else if (checkNotFalsyExcludeZero(newValue)) {
        // 値引率を再計算
        const _salesPriceStr =
          fieldName === "sales_price" ? newValue : selectedRowDataProperty.sales_price!.toString().replace(/,/g, "");
        const _discountPriceStr =
          fieldName === "discounted_price"
            ? newValue
            : selectedRowDataProperty.discounted_price!.toString().replace(/,/g, "");
        const _salesQuantityStr =
          fieldName === "unit_sales" ? newValue.toString() : selectedRowDataProperty.unit_sales!.toString();

        const payload = {
          salesPriceStr: _salesPriceStr,
          discountPriceStr: _discountPriceStr,
          // salesQuantityStr: unitSales.toString(),
          salesQuantityStr: _salesQuantityStr,
        };

        console.log("値引率のpayload", payload);
        const result = calculateDiscountRate(payload);
        const _discountRate = result.discountRate;
        if (!_discountRate || result.error) return console.log("値引率取得エラー リターン：", result.error);

        const updatePayload = {
          fieldName: fieldName,
          fieldNameForSelectedRowData: fieldNameForSelectedRowData,
          newValue: newValue,
          id: id,
          discountRate: _discountRate.replace(/%/g, ""),
        };
        // 入力変換確定状態でエンターキーが押された場合の処理
        console.log(
          "onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 値引率も同時更新 updatePayload",
          updatePayload,
          "selectedRowDataProperty.sales_price",
          selectedRowDataProperty.sales_price,
          "selectedRowDataProperty.unit_sales",
          selectedRowDataProperty.unit_sales,
          "selectedRowDataProperty.discounted_price",
          selectedRowDataProperty.discounted_price
        );
        await updatePropertyFieldMutation.mutateAsync(updatePayload);
      }

      originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
      setIsEditModeField(null); // エディットモードを終了
      return;
    }

    // 通常ルート

    // requiredがfalseで入力必須ではないので、newValueがnullや空文字、0は許容(空文字や0をnullにするかどうかは各フィールドごとに個別で管理する)

    const updatePayload = {
      fieldName: fieldName,
      fieldNameForSelectedRowData: fieldNameForSelectedRowData,
      newValue: newValue,
      id: id,
    };
    // 入力変換確定状態でエンターキーが押された場合の処理
    console.log("sendアイコンクリックでUPDATE実行 updatePayload", updatePayload);
    await updatePropertyFieldMutation.mutateAsync(updatePayload);
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
    fieldName: PropertyFieldNames;
    fieldNameForSelectedRowData: PropertyFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
  }) => {
    e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

    if (!id || !selectedRowDataProperty) {
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
    await updatePropertyFieldMutation.mutateAsync(updatePayload);
    originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
    setIsEditModeField(null); // エディットモードを終了
  };
  // ================== ✅セレクトボックスで個別フィールドをアップデート ==================

  const handlePendingCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputPendingFlag(true);
        break;
      case "チェック無し":
        setInputPendingFlag(false);
        break;
      default:
        setInputPendingFlag(null);
    }
  };
  const handleRejectedCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputRejectedFlag(true);
        break;
      case "チェック無し":
        setInputRejectedFlag(false);
        break;
      default:
        setInputRejectedFlag(null);
    }
  };
  const handleStepInCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputStepInFlag(true);
        break;
      case "チェック無し":
        setInputStepInFlag(false);
        break;
      default:
        setInputStepInFlag(null);
    }
  };
  const handleRepeatCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputRepeatFlag(true);
        break;
      case "チェック無し":
        setInputRepeatFlag(false);
        break;
      default:
        setInputRepeatFlag(null);
    }
  };

  // const hours = Array.from({ length: 24 }, (_, index) => (index < 10 ? "0" + index : "" + index));
  // const minutes5 = Array.from({ length: 12 }, (_, index) => (index * 5 < 10 ? "0" + index * 5 : "" + index * 5));
  // const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? "0" + i : "" + i));

  // time型のplanned_start_time、result_start_time、result_end_timeを時間と分のみに変換する関数
  // function formatTime(timeStr: string) {
  //   const [hour, minute] = timeStr.split(":");
  //   return `${hour}:${minute}`;
  // }

  // 四半期のselectタグの選択肢 20211, 20214
  // const optionsYearQuarter = useMemo((): number[] => {
  //   const startYear = 2010;
  //   const endYear = new Date().getFullYear();

  //   let yearQuarters: number[] = [];

  //   for (let year = startYear; year <= endYear; year++) {
  //     for (let i = 1; i <= 4; i++) {
  //       const yearQuarter = parseInt(`${year}${i}`, 10); // 20201, 20203
  //       yearQuarters.push(yearQuarter);
  //     }
  //   }
  //   const sortedYearQuarters = yearQuarters.reverse();
  //   return sortedYearQuarters;
  // }, []);

  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);

  // フィールドエディットタイトル
  const fieldEditTitle = (title: string) => (isEditModeField === title ? `${styles.field_edit}` : ``);

  // -------------------------- 🌠サーチモード input下の追加エリア関連🌠 --------------------------
  // ツールチップ
  const additionalInputTooltipText = (index: number) =>
    index === 0 ? `空欄以外のデータのみ抽出` : `空欄のデータのみ抽出`;

  // 🔸「入力値をリセット」をクリック
  const handleClickResetInput = (
    dispatch: Dispatch<SetStateAction<any>>,
    inputType: "string" | "range_string" | "range_date" | "range_number" | "array" = "string"
  ) => {
    handleCloseTooltip();

    if (inputType === "array") {
      dispatch([]);
    } else if (inputType === "range_string") {
      dispatch({ min: "", max: "" });
    } else if (inputType === "range_date" || inputType === "range_number") {
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
      | "position_class" // contactsテーブル
      | "occupation"
      | "current_status" // propertiesテーブル
      | "sales_contribution_category"
      | "sales_class"
      | "order_certainty_start_of_month"
      | "review_order_certainty"
      | "reason_class"
      | "decision_maker_negotiation"
      | "competition_state"
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
    // propertiesテーブル
    if (fieldName === "current_status") {
      if (isNullNotNullCurrentStatus !== null) setIsNullNotNullCurrentStatus(null);
      if (0 < inputCurrentStatusArray.length) setInputCurrentStatusArray([]);
    }
    if (fieldName === "sales_contribution_category") {
      if (isNullNotNullSalesContributionCategory !== null) setIsNullNotNullSalesContributionCategory(null);
      if (0 < inputSalesContributionCategoryArray.length) setInputSalesContributionCategoryArray([]);
    }
    if (fieldName === "sales_class") {
      if (isNullNotNullSalesClass !== null) setIsNullNotNullSalesClass(null);
      if (0 < inputSalesClassArray.length) setInputSalesClassArray([]);
    }
    if (fieldName === "order_certainty_start_of_month") {
      if (isNullNotNullOrderCertaintyStartOfMonth !== null) setIsNullNotNullOrderCertaintyStartOfMonth(null);
      if (0 < inputOrderCertaintyStartOfMonthArray.length) setInputOrderCertaintyStartOfMonthArray([]);
    }
    if (fieldName === "review_order_certainty") {
      if (isNullNotNullReviewOrderCertainty !== null) setIsNullNotNullReviewOrderCertainty(null);
      if (0 < inputReviewOrderCertaintyArray.length) setInputReviewOrderCertaintyArray([]);
    }
    if (fieldName === "reason_class") {
      if (isNullNotNullReasonClass !== null) setIsNullNotNullReasonClass(null);
      if (0 < inputReasonClassArray.length) setInputReasonClassArray([]);
    }
    if (fieldName === "decision_maker_negotiation") {
      if (isNullNotNullDecisionMakerNegotiation !== null) setIsNullNotNullDecisionMakerNegotiation(null);
      if (0 < inputDecisionMakerNegotiationArray.length) setInputDecisionMakerNegotiationArray([]);
    }
    if (fieldName === "competition_state") {
      if (isNullNotNullCompetitionState !== null) setIsNullNotNullCompetitionState(null);
      if (0 < inputCompetitionStateArray.length) setInputCompetitionStateArray([]);
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
      | "position_class" // contactsテーブル
      | "occupation"
      | "current_status" // propertiesテーブル
      | "sales_contribution_category"
      | "sales_class"
      | "order_certainty_start_of_month"
      | "review_order_certainty"
      | "reason_class"
      | "decision_maker_negotiation"
      | "competition_state" = ""
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
    if (type === "current_status") setInputCurrentStatusArray([]);
    if (type === "sales_contribution_category") setInputSalesContributionCategoryArray([]);
    if (type === "sales_class") setInputSalesClassArray([]);
    if (type === "order_certainty_start_of_month") setInputOrderCertaintyStartOfMonthArray([]);
    if (type === "review_order_certainty") setInputReviewOrderCertaintyArray([]);
    if (type === "reason_class") setInputReasonClassArray([]);
    if (type === "decision_maker_negotiation") setInputDecisionMakerNegotiationArray([]);
    if (type === "competition_state") setInputCompetitionStateArray([]);

    if (index === 0) dispatch("is not null");
    if (index === 1) dispatch("is null");

    handleCloseTooltip();
  };

  type IsNullNotNullText = "is not null" | "is null";
  const nullNotNullIconMap: { [key: string | IsNullNotNullText]: React.JSX.Element } = {
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

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  console.log(
    "PropertyMainContainerOneThirdコンポーネントレンダリング",
    "inputDiscountedPriceSearch",
    inputDiscountedPriceSearch
  );

  return (
    <form
      className={`${styles.main_container} w-full ${!!isEditModeField ? `${styles.is_edit_mode}` : ``}`}
      onSubmit={handleSearchSubmit}
    >
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
        {/* ---------------- 通常モード 左コンテナ ---------------- */}
        {!searchMode && (
          <div
            // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
            className={`${styles.left_container} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full  pb-[35px] pt-[0px] ${
              tableContainerSize === "one_third"
                ? `min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)]`
                : `min-w-[calc((100vw-var(--sidebar-width))/3-14px)] max-w-[calc((100vw-var(--sidebar-width))/3-14px)]`
            }`} // ラージ、ミディアムは右paddingに10px追加されるため10pxを３等分で割り振る(右のみ+1)
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* 予定 通常 */}
              {/* 現ステータス */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center ${styles.section_title_box}`}>
                    <span className={`${styles.section_title} ${fieldEditTitle("current_status")}`}>現ｽﾃｰﾀｽ</span>
                    {!searchMode && isEditModeField !== "current_status" && (
                      <span
                        className={`${styles.value} ${styles.editable_field} ${styles.value_highlight} ${styles.text_start} !pl-[0px]`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataMeeting?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataMeeting.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "current_status",
                            dispatch: setInputCurrentStatus,
                            selectedRowDataValue: selectedRowDataProperty?.current_status
                              ? selectedRowDataProperty.current_status
                              : "",
                          });
                        }}
                      >
                        {selectedRowDataProperty?.current_status
                          ? getCurrentStatus(selectedRowDataProperty?.current_status)
                          : ""}
                      </span>
                    )}
                    {/* <span className={`${styles.value} ${styles.value_highlight} ${styles.text_start} !pl-[0px]`}>
                      {selectedRowDataProperty?.current_status ? selectedRowDataProperty?.current_status : ""}
                    </span> */}

                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "current_status" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputCurrentStatus}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "current_status",
                              fieldNameForSelectedRowData: "current_status",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                          // onChange={(e) => {
                          //   setInputActivityType(e.target.value);
                          // }}
                        >
                          {/* <option value=""></option> */}
                          {optionsCurrentStatus.map((option) => (
                            <option key={option} value={option}>
                              {getCurrentStatus(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "current_status" && (
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
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>

              {/* 案件名 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${fieldEditTitle("property_name")}`}>●案件名</span>
                    {!searchMode && isEditModeField !== "property_name" && (
                      <span
                        className={`${styles.value} ${styles.value_highlight} ${styles.text_start} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.property_name) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.property_name))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.property_name));
                          handleDoubleClickField({
                            e,
                            field: "property_name",
                            dispatch: setInputPropertyName,
                          });
                          handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.property_name ? selectedRowDataProperty?.property_name : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.property_name ? selectedRowDataProperty?.property_name : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "property_name" && (
                      <>
                        <input
                          type="text"
                          placeholder=""
                          autoFocus
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                          value={inputPropertyName}
                          // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                          onChange={(e) => setInputPropertyName(e.target.value)}
                          // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          onKeyDown={async (e) => {
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "property_name",
                              fieldNameForSelectedRowData: "property_name",
                              newValue: inputPropertyName.trim(),
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                              required: true,
                            });
                          }}
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn
                            inputState={inputPropertyName}
                            setInputState={setInputPropertyName}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "property_name",
                                fieldNameForSelectedRowData: "property_name",
                                newValue: inputPropertyName.trim(),
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              })
                            }
                            required={true}
                          />
                        )}
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div className={`${styles.field_edit_mode_loading_area}`}>
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "property_name" && (
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

              {/* 案件概要 通常 */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span
                      className={`${styles.title} ${styles.title_sm} ${styles.min} ${fieldEditTitle(
                        "property_summary"
                      )}`}
                    >
                      案件概要
                    </span>
                    {!searchMode && isEditModeField !== "property_summary" && (
                      <div
                        className={`${styles.textarea_box} ${
                          selectedRowDataProperty ? `${styles.editable_field}` : `${styles.uneditable_field}`
                        }`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          handleCloseTooltip();
                          handleDoubleClickField({
                            e,
                            field: "property_summary",
                            dispatch: setInputPropertySummary,
                            selectedRowDataValue: selectedRowDataProperty?.property_summary
                              ? selectedRowDataProperty?.property_summary
                              : "",
                          });
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataProperty?.property_summary
                            ? selectedRowDataProperty?.property_summary.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></div>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード inputタグ */}
                    {!searchMode && isEditModeField === "property_summary" && (
                      <>
                        <textarea
                          cols={30}
                          // rows={10}
                          autoFocus
                          placeholder=""
                          style={{ whiteSpace: "pre-wrap" }}
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                          value={inputPropertySummary}
                          onChange={(e) => setInputPropertySummary(e.target.value)}
                        ></textarea>
                        {/* 送信ボタンとクローズボタン */}
                        <InputSendAndCloseBtn
                          inputState={inputPropertySummary}
                          setInputState={setInputPropertySummary}
                          onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                            handleClickSendUpdateField({
                              e,
                              fieldName: "property_summary",
                              fieldNameForSelectedRowData: "property_summary",
                              originalValue: originalValueFieldEdit.current,
                              newValue: inputPropertySummary ? inputPropertySummary.trim() : null,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            })
                          }
                          required={false}
                          // isDisplayClose={true}
                          // btnPositionY="bottom-[8px]"
                          isOutside={true}
                          outsidePosition="under_right"
                          isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                        />
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "property_summary" && (
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

              {/* 商品・予定台数 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>商品</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.expected_product ? selectedRowDataProperty?.expected_product : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {/* {selectedRowDataProperty?.product_name ? selectedRowDataProperty?.product_name : ""} */}
                        {selectedRowDataProperty?.expected_product ? selectedRowDataProperty?.expected_product : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px] ${fieldEditTitle("product_sales")}`}>予定台数</span>
                    {!searchMode && isEditModeField !== "product_sales" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.product_sales) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.product_sales))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.product_sales));
                          handleDoubleClickField({
                            e,
                            field: "product_sales",
                            dispatch: setInputProductSales,
                          });
                          handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.product_sales ? selectedRowDataProperty?.product_sales : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.product_sales ? selectedRowDataProperty?.product_sales : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "product_sales" && (
                      <>
                        <input
                          type="number"
                          min="0"
                          autoFocus
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          placeholder=""
                          value={inputProductSales === null ? "" : inputProductSales}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setInputProductSales(null);
                            } else {
                              const numValue = Number(val);

                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputProductSales(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                              } else {
                                setInputProductSales(numValue);
                              }
                            }
                          }}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          onKeyDown={(e) =>
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "product_sales",
                              fieldNameForSelectedRowData: "product_sales",
                              originalValue: originalValueFieldEdit.current,
                              newValue: inputProductSales,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            })
                          }
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<number | null>
                            inputState={inputProductSales as number | null}
                            setInputState={setInputProductSales as Dispatch<SetStateAction<number | null>>}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "product_sales",
                                fieldNameForSelectedRowData: "product_sales",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputProductSales,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={true}
                            isDisplayClose={false}
                          />
                        )}
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "product_sales" && (
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

              {/* 獲得予定時期・合計 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title}`}>予定時期</span> */}
                    <div
                      className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                        "expected_order_date"
                      )}`}
                    >
                      <span>獲得予定</span>
                      <span>時期</span>
                    </div>
                    {!searchMode && isEditModeField !== "expected_order_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "expected_order_date",
                            dispatch: setInputExpectedOrderDateForFieldEditMode,
                            dateValue: selectedRowDataProperty?.expected_order_date
                              ? selectedRowDataProperty.expected_order_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.expected_order_date
                            ? format(new Date(selectedRowDataProperty.expected_order_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || isOpenSidebar)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          if (hoveredItemPosWrap || isOpenSidebar) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.expected_order_date
                          ? format(new Date(selectedRowDataProperty.expected_order_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {!searchMode && isEditModeField === "expected_order_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputExpectedOrderDateForFieldEditMode as Date | null}
                            setStartDate={
                              setInputExpectedOrderDateForFieldEditMode as Dispatch<SetStateAction<Date | null>>
                            }
                            required={true}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputExpectedOrderDateForFieldEditMode) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.expected_order_date
                                ? selectedRowDataProperty.expected_order_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputExpectedOrderDateForFieldEditMode
                                ? (inputExpectedOrderDateForFieldEditMode as Date).toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputExpectedOrderDateForFieldEditMode,
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
                                fieldName: "expected_order_date",
                                fieldNameForSelectedRowData: "expected_order_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                                newDateObj: inputExpectedOrderDateForFieldEditMode as Date,
                              });
                            }}
                            fontSize={`!text-[13px]`}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "expected_order_date" && (
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
                    {/* <span className={`${styles.title}`}>予定売上合計</span> */}
                    <div
                      className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                        "expected_sales_price"
                      )}`}
                    >
                      <span>予定売上</span>
                      <span>合計</span>
                    </div>
                    {!searchMode && isEditModeField !== "expected_sales_price" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.expected_sales_price) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.expected_sales_price))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.expected_sales_price));
                          handleDoubleClickField({
                            e,
                            field: "expected_sales_price",
                            dispatch: setInputExpectedSalesPrice,
                          });
                          handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.expected_sales_price
                            ? selectedRowDataProperty?.expected_sales_price
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.expected_sales_price
                          ? Number(selectedRowDataProperty?.expected_sales_price).toLocaleString() + "円"
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "expected_sales_price" && (
                      <>
                        <input
                          type="text"
                          autoFocus
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          value={!!inputExpectedSalesPrice ? inputExpectedSalesPrice : ""}
                          onChange={(e) => setInputExpectedSalesPrice(e.target.value)}
                          onKeyDown={(e) =>
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "expected_sales_price",
                              fieldNameForSelectedRowData: "expected_sales_price",
                              originalValue: originalValueFieldEdit.current,
                              newValue: inputExpectedSalesPrice
                                ? (convertToYen(inputExpectedSalesPrice.trim()) as number).toString()
                                : null,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            })
                          }
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<string>
                            inputState={inputExpectedSalesPrice}
                            setInputState={setInputExpectedSalesPrice}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "expected_sales_price",
                                fieldNameForSelectedRowData: "expected_sales_price",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputExpectedSalesPrice
                                  ? (convertToYen(inputExpectedSalesPrice.trim()) as number).toString()
                                  : null,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={false}
                            isDisplayClose={false}
                          />
                        )}
                        {/* <input
                          type="number"
                          min="0"
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          placeholder=""
                          value={inputExpectedSalesPrice === null ? "" : inputExpectedSalesPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setInputExpectedSalesPrice(null);
                            } else {
                              const numValue = Number(val);

                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputExpectedSalesPrice(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                              } else {
                                setInputExpectedSalesPrice(numValue);
                              }
                            }
                          }}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          onKeyDown={(e) =>
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "expected_sales_price",
                              fieldNameForSelectedRowData: "expected_sales_price",
                              originalValue: originalValueFieldEdit.current,
                              newValue: inputExpectedSalesPrice,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            })
                          }
                        /> */}
                        {/* {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<number | null>
                            inputState={inputExpectedSalesPrice}
                            setInputState={setInputExpectedSalesPrice}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "expected_sales_price",
                                fieldNameForSelectedRowData: "expected_sales_price",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputExpectedSalesPrice,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={true}
                            isDisplayClose={false}
                          />
                        )} */}

                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "expected_sales_price" && (
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

              {/* 今期・来期 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px] ${fieldEditTitle("term_division")}`}>今・来期</span>
                    {!searchMode && isEditModeField !== "term_division" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.term_division) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.term_division))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.term_division));
                          handleDoubleClickField({
                            e,
                            field: "term_division",
                            dispatch: setInputTermDivision,
                            selectedRowDataValue: selectedRowDataProperty?.term_division ?? "",
                          });
                          handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.term_division
                            ? getTermDivision(selectedRowDataProperty?.term_division)
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.term_division
                          ? getTermDivision(selectedRowDataProperty?.term_division)
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "term_division" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputTermDivision}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "term_division",
                              fieldNameForSelectedRowData: "term_division",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                          // onChange={(e) => {
                          //   setInputActivityType(e.target.value);
                          // }}
                        >
                          {/* <option value=""></option> */}
                          {optionsTermDivision.map((option) => (
                            <option key={option} value={option}>
                              {getTermDivision(option)}
                              {/* {option === "今期" && `今期 (今期に獲得予定)`}
                              {option === "来期" && `来期 (来期に獲得予定)`} */}
                            </option>
                          ))}
                          {/* <option value="今期">今期</option>
                          <option value="来期">来期</option> */}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "term_division" && (
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                      >
                        {selectedRowDataProperty?.product_sales ? selectedRowDataProperty?.product_sales : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 売上商品・売上台数 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>売上商品</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.sold_product ? selectedRowDataProperty?.sold_product : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {/* {selectedRowDataProperty?.sold_product_name ? selectedRowDataProperty?.sold_product_name : ""} */}
                        {selectedRowDataProperty?.sold_product ? selectedRowDataProperty?.sold_product : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px] ${fieldEditTitle("unit_sales")}`}>売上台数</span>
                    {!searchMode && isEditModeField !== "unit_sales" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.unit_sales) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.unit_sales))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.unit_sales));
                          handleDoubleClickField({
                            e,
                            field: "unit_sales",
                            dispatch: setInputUnitSales,
                          });
                          handleCloseTooltip();
                        }}
                        data-text={`${selectedRowDataProperty?.unit_sales ? selectedRowDataProperty?.unit_sales : ""}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.unit_sales ? selectedRowDataProperty?.unit_sales : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "unit_sales" && (
                      <>
                        <input
                          type="number"
                          min="0"
                          autoFocus
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          placeholder=""
                          value={inputUnitSales === null ? "" : inputUnitSales}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "" || val === "0" || val === "０") {
                              setInputUnitSales(null);
                            } else {
                              const numValue = Number(val);

                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputUnitSales(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                              } else {
                                setInputUnitSales(numValue);
                              }
                            }
                          }}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          onKeyDown={(e) =>
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "unit_sales",
                              fieldNameForSelectedRowData: "unit_sales",
                              originalValue: originalValueFieldEdit.current,
                              newValue:
                                inputUnitSales && inputUnitSales.toString().trim()
                                  ? inputUnitSales.toString().trim()
                                  : null,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            })
                          }
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<number | null>
                            inputState={inputUnitSales as number | null}
                            setInputState={setInputUnitSales as Dispatch<SetStateAction<number | null>>}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "unit_sales",
                                fieldNameForSelectedRowData: "unit_sales",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputUnitSales ? inputUnitSales.toString() : null,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={true}
                            isDisplayClose={false}
                          />
                        )}
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "unit_sales" && (
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

              {/* 売上貢献区分・売上合計 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div
                      className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                        "sales_contribution_category"
                      )}`}
                    >
                      <span>売上貢献</span>
                      <span>区分</span>
                    </div>
                    {!searchMode && isEditModeField !== "sales_contribution_category" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.sales_contribution_category) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.sales_contribution_category))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.sales_contribution_category));
                          handleDoubleClickField({
                            e,
                            field: "sales_contribution_category",
                            dispatch: setInputSalesContributionCategory,
                            selectedRowDataValue: selectedRowDataProperty?.sales_contribution_category ?? "",
                          });
                          handleCloseTooltip();
                        }}
                        data-text={
                          selectedRowDataProperty?.sales_contribution_category
                            ? getSalesContributionCategory(selectedRowDataProperty?.sales_contribution_category)
                            : ""
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.sales_contribution_category
                          ? getSalesContributionCategory(selectedRowDataProperty?.sales_contribution_category)
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "sales_contribution_category" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputSalesContributionCategory}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "sales_contribution_category",
                              fieldNameForSelectedRowData: "sales_contribution_category",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                        >
                          {optionsSalesContributionCategory.map((option) => (
                            <option key={option} value={option}>
                              {getSalesContributionCategory(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "sales_contribution_category" && (
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
                    <span className={`${styles.title} text-[12px] ${fieldEditTitle("sales_price")}`}>売上合計</span>
                    {!searchMode && isEditModeField !== "sales_price" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!checkNotFalsyExcludeZero(selectedRowDataProperty?.sales_price)) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.sales_price))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.sales_price));
                          handleDoubleClickField({
                            e,
                            field: "sales_price",
                            dispatch: setInputSalesPrice,
                          });
                          handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.sales_price ? selectedRowDataProperty?.sales_price : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {checkNotFalsyExcludeZero(selectedRowDataProperty?.sales_price)
                          ? Number(selectedRowDataProperty?.sales_price).toLocaleString() + "円"
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "sales_price" && (
                      <>
                        <input
                          type="text"
                          autoFocus
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          value={checkNotFalsyExcludeZero(inputSalesPrice) ? inputSalesPrice : ""}
                          onChange={(e) => {
                            if (e.target.value === "0" || e.target.value === "０") {
                              setInputSalesPrice("0");
                            }
                            setInputSalesPrice(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "sales_price",
                              fieldNameForSelectedRowData: "sales_price",
                              originalValue: originalValueFieldEdit.current,
                              newValue: !!inputSalesPrice
                                ? (convertToYen(inputSalesPrice.trim()) as number).toString()
                                : null,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            });
                          }}
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<string>
                            inputState={inputSalesPrice}
                            setInputState={setInputSalesPrice}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "sales_price",
                                fieldNameForSelectedRowData: "sales_price",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputSalesPrice
                                  ? (convertToYen(inputSalesPrice.trim()) as number).toString()
                                  : null,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={false}
                            isDisplayClose={false}
                          />
                        )}

                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "sales_price" && (
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

              {/* 値引価格・値引率 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px] ${fieldEditTitle("discounted_price")}`}>
                      値引価格
                    </span>
                    {!searchMode && isEditModeField !== "discounted_price" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!checkNotFalsyExcludeZero(selectedRowDataProperty?.discounted_price)) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.discounted_price))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.discounted_price));
                          handleDoubleClickField({
                            e,
                            field: "discounted_price",
                            dispatch: setInputDiscountedPrice,
                          });
                          handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.discounted_price ? selectedRowDataProperty?.discounted_price : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {checkNotFalsyExcludeZero(selectedRowDataProperty?.discounted_price)
                          ? Number(selectedRowDataProperty?.discounted_price).toLocaleString() + "円"
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "discounted_price" && (
                      <>
                        <input
                          type="text"
                          autoFocus
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          value={checkNotFalsyExcludeZero(inputDiscountedPrice) ? inputDiscountedPrice : ""}
                          onChange={(e) => setInputDiscountedPrice(e.target.value)}
                          onKeyDown={(e) => {
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "discounted_price",
                              fieldNameForSelectedRowData: "discounted_price",
                              originalValue: originalValueFieldEdit.current,
                              newValue: !!inputDiscountedPrice
                                ? (convertToYen(inputDiscountedPrice.trim()) as number).toString()
                                : null,
                              id: selectedRowDataProperty?.property_id,
                              required: false,
                            });
                          }}
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<string>
                            inputState={inputDiscountedPrice}
                            setInputState={setInputDiscountedPrice}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "discounted_price",
                                fieldNameForSelectedRowData: "discounted_price",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputDiscountedPrice
                                  ? (convertToYen(inputDiscountedPrice.trim()) as number).toString()
                                  : null,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={false}
                            isDisplayClose={false}
                          />
                        )}

                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "discounted_price" && (
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
                    <span className={`${styles.title} text-[12px]`}>値引率</span>
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
                        {checkNotFalsyExcludeZero(selectedRowDataProperty?.discount_rate)
                          ? normalizeDiscountRate(selectedRowDataProperty!.discount_rate!.toString())
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 導入分類 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px] ${fieldEditTitle("sales_class")}`}>導入分類</span>
                    {!searchMode && isEditModeField !== "sales_class" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.sales_class) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.sales_class))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.sales_class));
                          handleDoubleClickField({
                            e,
                            field: "sales_class",
                            dispatch: setInputSalesClass,
                            selectedRowDataValue: selectedRowDataProperty?.sales_class ?? "",
                          });
                          handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.sales_class
                            ? getSalesClass(selectedRowDataProperty?.sales_class)
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.sales_class
                          ? getSalesClass(selectedRowDataProperty?.sales_class)
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "sales_class" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputSalesClass}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "sales_class",
                              fieldNameForSelectedRowData: "sales_class",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                          // onChange={(e) => {
                          //   setInputActivityType(e.target.value);
                          // }}
                        >
                          {/* <option value=""></option> */}
                          {optionsSalesClass.map((option) => (
                            <option key={option} value={option}>
                              {getSalesClass(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "sales_class" && (
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.sales_price ? selectedRowDataProperty?.sales_price : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* サブスク分類 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} text-[12px]`}>サブスク分類</span> */}
                    <div
                      className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                        "subscription_interval"
                      )}`}
                    >
                      <span>サブスク</span>
                      <span>分類</span>
                    </div>
                    {!searchMode && isEditModeField !== "subscription_interval" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.subscription_interval) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.subscription_interval))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.subscription_interval));
                          handleDoubleClickField({
                            e,
                            field: "subscription_interval",
                            dispatch: setInputSubscriptionInterval,
                            selectedRowDataValue: selectedRowDataProperty?.subscription_interval ?? "",
                          });
                          handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.subscription_interval
                            ? getSubscriptionInterval(selectedRowDataProperty?.subscription_interval)
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.subscription_interval
                          ? getSubscriptionInterval(selectedRowDataProperty?.subscription_interval)
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "subscription_interval" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputSubscriptionInterval}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "subscription_interval",
                              fieldNameForSelectedRowData: "subscription_interval",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                          // onChange={(e) => {
                          //   setInputActivityType(e.target.value);
                          // }}
                        >
                          <option value=""></option>
                          {optionsSubscriptionInterval.map((option) => (
                            <option key={option} value={option}>
                              {getSubscriptionInterval(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "subscription_interval" && (
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.discount_rate ? selectedRowDataProperty?.discount_rate : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* サブスク開始日・サブスク解約日 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div
                      className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                        "subscription_start_date"
                      )}`}
                    >
                      <span>サブスク</span>
                      <span>開始日</span>
                    </div>
                    {!searchMode && isEditModeField !== "subscription_start_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "subscription_start_date",
                            dispatch: setInputSubscriptionStartDate,
                            dateValue: selectedRowDataProperty?.subscription_start_date
                              ? selectedRowDataProperty.subscription_start_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.subscription_start_date
                            ? format(new Date(selectedRowDataProperty.subscription_start_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || isOpenSidebar)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.subscription_start_date
                          ? format(new Date(selectedRowDataProperty.subscription_start_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {!searchMode && isEditModeField === "subscription_start_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputSubscriptionStartDate as Date | null}
                            setStartDate={setInputSubscriptionStartDate as Dispatch<SetStateAction<Date | null>>}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputSubscriptionStartDate) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.subscription_start_date
                                ? selectedRowDataProperty.subscription_start_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputSubscriptionStartDate
                                ? (inputSubscriptionStartDate as Date).toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputSubscriptionStartDate,
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
                                fieldName: "subscription_start_date",
                                fieldNameForSelectedRowData: "subscription_start_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "subscription_start_date" && (
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
                    <div
                      className={`${styles.title} flex flex-col ${styles.double_text}  ${fieldEditTitle(
                        "subscription_canceled_at"
                      )}`}
                    >
                      <span>サブスク</span>
                      <span>解約日</span>
                    </div>
                    {!searchMode && isEditModeField !== "subscription_canceled_at" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "subscription_canceled_at",
                            dispatch: setInputSubscriptionCanceledAt,
                            dateValue: selectedRowDataProperty?.subscription_canceled_at
                              ? selectedRowDataProperty.subscription_canceled_at
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.subscription_canceled_at
                            ? format(new Date(selectedRowDataProperty.subscription_canceled_at), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || isOpenSidebar)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.subscription_canceled_at
                          ? format(new Date(selectedRowDataProperty.subscription_canceled_at), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {!searchMode && isEditModeField === "subscription_canceled_at" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputSubscriptionCanceledAt as Date | null}
                            setStartDate={setInputSubscriptionCanceledAt as Dispatch<SetStateAction<Date | null>>}
                            required={true}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputSubscriptionCanceledAt) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.subscription_canceled_at
                                ? selectedRowDataProperty.subscription_canceled_at
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputSubscriptionCanceledAt
                                ? (inputSubscriptionCanceledAt as Date).toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputSubscriptionCanceledAt,
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
                                fieldName: "subscription_canceled_at",
                                fieldNameForSelectedRowData: "subscription_canceled_at",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              });
                            }}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "subscription_canceled_at" && (
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

              {/* リース分類 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px] ${fieldEditTitle("lease_division")}`}>ﾘｰｽ分類</span>
                    {!searchMode && isEditModeField !== "lease_division" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.lease_division) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.lease_division))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.lease_division));
                          handleDoubleClickField({
                            e,
                            field: "lease_division",
                            dispatch: setInputLeaseDivision,
                            selectedRowDataValue: selectedRowDataProperty?.lease_division ?? "",
                          });
                          handleCloseTooltip();
                        }}
                        data-text={
                          selectedRowDataProperty?.lease_division
                            ? getLeaseDivision(selectedRowDataProperty?.lease_division)
                            : ""
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.lease_division
                          ? getLeaseDivision(selectedRowDataProperty?.lease_division)
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "lease_division" && (
                      <>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputLeaseDivision}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "lease_division",
                              fieldNameForSelectedRowData: "lease_division",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                            });
                          }}
                        >
                          <option value=""></option>
                          {optionsLeaseDivision.map((option) => (
                            <option key={option} value={option}>
                              {getLeaseDivision(option)}
                            </option>
                          ))}
                        </select>
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div
                            className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                          >
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "lease_division" && (
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.discount_rate ? selectedRowDataProperty?.discount_rate : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* リース会社・リース完了予定日 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px] ${fieldEditTitle("leasing_company")}`}>ﾘｰｽ会社</span>
                    {!searchMode && isEditModeField !== "leasing_company" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          if (!selectedRowDataProperty?.leasing_company) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.leasing_company))
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.leasing_company));
                          handleDoubleClickField({
                            e,
                            field: "leasing_company",
                            dispatch: setInputLeasingCompany,
                          });
                          handleCloseTooltip();
                        }}
                        data-text={`${
                          selectedRowDataProperty?.leasing_company ? selectedRowDataProperty?.leasing_company : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.leasing_company ? selectedRowDataProperty.leasing_company : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード selectタグ  */}
                    {!searchMode && isEditModeField === "leasing_company" && (
                      <>
                        <input
                          type="text"
                          placeholder=""
                          autoFocus
                          className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                          value={inputLeasingCompany}
                          // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                          onChange={(e) => setInputLeasingCompany(e.target.value)}
                          // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                          onCompositionStart={() => setIsComposing(true)}
                          onCompositionEnd={() => setIsComposing(false)}
                          onKeyDown={async (e) => {
                            handleKeyDownUpdateField({
                              e,
                              fieldName: "leasing_company",
                              fieldNameForSelectedRowData: "leasing_company",
                              newValue: inputLeasingCompany.trim(),
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataProperty?.property_id,
                              required: true,
                            });
                          }}
                        />
                        {/* 送信ボタンとクローズボタン */}
                        {!updatePropertyFieldMutation.isLoading && (
                          <InputSendAndCloseBtn<string>
                            inputState={inputLeasingCompany}
                            setInputState={setInputLeasingCompany}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "leasing_company",
                                fieldNameForSelectedRowData: "leasing_company",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputLeasingCompany,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              })
                            }
                            required={true}
                            isDisplayClose={false}
                          />
                        )}
                        {/* エディットフィールド送信中ローディングスピナー */}
                        {updatePropertyFieldMutation.isLoading && (
                          <div className={`${styles.field_edit_mode_loading_area}`}>
                            <SpinnerComet w="22px" h="22px" s="3px" />
                          </div>
                        )}
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "leasing_company" && (
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
                    <div
                      className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                        "lease_expiration_date"
                      )}`}
                    >
                      <span>ﾘｰｽ完了</span>
                      <span>予定日</span>
                    </div>
                    {!searchMode && isEditModeField !== "lease_expiration_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "lease_expiration_date",
                            dispatch: setInputLeaseExpirationDate,
                            dateValue: selectedRowDataProperty?.lease_expiration_date
                              ? selectedRowDataProperty.lease_expiration_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.lease_expiration_date
                            ? format(new Date(selectedRowDataProperty.lease_expiration_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || isOpenSidebar)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.lease_expiration_date
                          ? format(new Date(selectedRowDataProperty.lease_expiration_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {!searchMode && isEditModeField === "lease_expiration_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputLeaseExpirationDate as Date | null}
                            setStartDate={setInputLeaseExpirationDate as Dispatch<SetStateAction<Date | null>>}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputLeaseExpirationDate) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.lease_expiration_date
                                ? selectedRowDataProperty.lease_expiration_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputLeaseExpirationDate
                                ? (inputLeaseExpirationDate as Date).toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputLeaseExpirationDate,
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
                                fieldName: "lease_expiration_date",
                                fieldNameForSelectedRowData: "lease_expiration_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              });
                            }}
                            fontSize={`!text-[13px]`}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "lease_expiration_date" && (
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

              {/* 展開日付・売上日付 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px] ${fieldEditTitle("expansion_date")}`}>展開日付</span>
                    {!searchMode && isEditModeField !== "expansion_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "expansion_date",
                            dispatch: setInputExpansionDate,
                            dateValue: selectedRowDataProperty?.expansion_date
                              ? selectedRowDataProperty.expansion_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.expansion_date
                            ? format(new Date(selectedRowDataProperty.expansion_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || isOpenSidebar)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.expansion_date
                          ? format(new Date(selectedRowDataProperty.expansion_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {!searchMode && isEditModeField === "expansion_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputExpansionDate as Date | null}
                            setStartDate={setInputExpansionDate as Dispatch<SetStateAction<Date | null>>}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputExpansionDate) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.expansion_date
                                ? selectedRowDataProperty.expansion_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = (inputExpansionDate as Date | null)
                                ? (inputExpansionDate as Date).toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputExpansionDate,
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
                                fieldName: "expansion_date",
                                fieldNameForSelectedRowData: "expansion_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                                newDateObj: inputExpansionDate as Date,
                              });
                            }}
                            fontSize={`!text-[13px]`}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "expansion_date" && (
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
                    <span className={`${styles.title} text-[12px] ${fieldEditTitle("sales_date")}`}>売上日付</span>
                    {!searchMode && isEditModeField !== "sales_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "sales_date",
                            dispatch: setInputSalesDate,
                            dateValue: selectedRowDataProperty?.sales_date ? selectedRowDataProperty.sales_date : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.sales_date
                            ? format(new Date(selectedRowDataProperty.sales_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || isOpenSidebar)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.sales_date
                          ? format(new Date(selectedRowDataProperty.sales_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {!searchMode && isEditModeField === "sales_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputSalesDate as Date | null}
                            setStartDate={setInputSalesDate as Dispatch<SetStateAction<Date | null>>}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputSalesDate) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.sales_date
                                ? selectedRowDataProperty.sales_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputSalesDate ? (inputSalesDate as Date).toISOString() : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputSalesDate,
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
                                fieldName: "sales_date",
                                fieldNameForSelectedRowData: "sales_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                                newDateObj: inputSalesDate as Date,
                              });
                            }}
                            fontSize={`!text-[13px]`}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "sales_date" && (
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
              {/* 展開年月度・売上年月度 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>展開年月度</span>
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
                        {selectedRowDataProperty?.expansion_year_month
                          ? selectedRowDataProperty?.expansion_year_month
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上年月度</span>
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
                        {selectedRowDataProperty?.sales_year_month ? selectedRowDataProperty?.sales_year_month : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 展開四半期・売上四半期 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>展開四半期</span>
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
                        {/* {selectedRowDataProperty?.expansion_quarter ? selectedRowDataProperty?.expansion_quarter : ""} */}
                        {selectedRowDataProperty?.expansion_quarter
                          ? `${selectedRowDataProperty.expansion_quarter}Q`
                          : null}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上四半期</span>
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
                        {/* {selectedRowDataProperty?.sales_quarter ? selectedRowDataProperty?.sales_quarter : ""} */}
                        {selectedRowDataProperty?.sales_quarter ? `${selectedRowDataProperty.sales_quarter}Q` : null}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 展開半期・売上半期 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>展開半期</span>
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
                        {selectedRowDataProperty?.expansion_half_year
                          ? `${selectedRowDataProperty.expansion_half_year}H`
                          : null}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上半期</span>
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
                        {selectedRowDataProperty?.sales_half_year
                          ? `${selectedRowDataProperty.sales_half_year}H`
                          : null}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 案件発生日付・案件年月度 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} text-[12px]`}>案件発生日付</span> */}
                    <div
                      className={`${styles.title} flex flex-col ${styles.double_text}  ${fieldEditTitle(
                        "property_date"
                      )}`}
                    >
                      <span>案件</span>
                      <span>発生日付</span>
                    </div>
                    {!searchMode && isEditModeField !== "property_date" && (
                      <span
                        className={`${styles.value} ${styles.editable_field}`}
                        onClick={handleSingleClickField}
                        onDoubleClick={(e) => {
                          // if (!selectedRowDataProperty?.activity_type) return;
                          // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                          //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                          // }
                          handleDoubleClickField({
                            e,
                            field: "property_date",
                            dispatch: setInputPropertyDate,
                            dateValue: selectedRowDataProperty?.property_date
                              ? selectedRowDataProperty.property_date
                              : null,
                          });
                        }}
                        data-text={`${
                          selectedRowDataProperty?.property_date
                            ? format(new Date(selectedRowDataProperty.property_date), "yyyy/MM/dd")
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || isOpenSidebar)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              // marginTop: 57,
                              // marginTop: 38,
                              // marginTop: 12,
                              // itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.property_date
                          ? format(new Date(selectedRowDataProperty.property_date), "yyyy/MM/dd")
                          : ""}
                      </span>
                    )}
                    {/* ============= フィールドエディットモード関連 ============= */}
                    {/* フィールドエディットモード Date-picker  */}
                    {!searchMode && isEditModeField === "property_date" && (
                      <>
                        <div className="z-[2000] w-full">
                          <DatePickerCustomInput
                            startDate={inputPropertyDate as Date | null}
                            setStartDate={setInputPropertyDate as Dispatch<SetStateAction<Date | null>>}
                            required={false}
                            isFieldEditMode={true}
                            fieldEditModeBtnAreaPosition="right"
                            isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                              if (!inputPropertyDate) return alert("このデータは入力が必須です。");
                              const originalDateUTCString = selectedRowDataProperty?.property_date
                                ? selectedRowDataProperty.property_date
                                : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                              const newDateUTCString = inputPropertyDate
                                ? (inputPropertyDate as Date).toISOString()
                                : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                              // const result = isSameDateLocal(originalDateString, newDateString);
                              console.log(
                                "日付送信クリック",
                                "オリジナル(UTC)",
                                originalDateUTCString,
                                "新たな値(Dateオブジェクト)",
                                inputPropertyDate,
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
                                fieldName: "property_date",
                                fieldNameForSelectedRowData: "property_date",
                                // originalValue: originalValueFieldEdit.current,
                                originalValue: originalDateUTCString,
                                newValue: newDateUTCString,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                                newDateObj: inputPropertyDate as Date,
                              });
                            }}
                            fontSize={`!text-[13px]`}
                          />
                        </div>
                      </>
                    )}
                    {/* フィールドエディットモードオーバーレイ */}
                    {!searchMode && isEditModeField === "property_date" && (
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
                    <span className={`${styles.title} text-[12px]`}>案件年月度</span>
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
                        {selectedRowDataProperty?.property_year_month
                          ? selectedRowDataProperty?.property_year_month
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* --------- ラッパーここまで --------- */}
            </div>
          </div>
        )}
        {/* ---------------- 通常モード 左コンテナここまで ---------------- */}

        {/* ---------------- 通常モード 真ん中コンテナ 結果エリア ---------------- */}
        {!searchMode && (
          <div
            className={`${styles.right_container} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full grow bg-[aqua]/[0] pb-[35px] pt-[0px] ${
              tableContainerSize === "one_third"
                ? `min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)]`
                : `min-w-[calc((100vw-var(--sidebar-width))/3-14px)] max-w-[calc((100vw-var(--sidebar-width))/3-14px)]`
            }`}
          >
            <div className={`${styles.right_contents_wrapper} flex h-full w-full flex-col bg-[#000]/[0]`}>
              {/* 下エリア 禁止フラグなど */}
              <div
                className={`${styles.right_under_container} h-screen w-full  bg-[#f0f0f0]/[0] ${
                  isOpenSidebar ? `transition-base02` : `transition-base01`
                }`}
              >
                {/* 月初確度・中間見直確度 通常 */}
                <div className={`${styles.row_area} flex max-h-[26px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center ${styles.section_title_box}`}>
                      <span className={`${styles.section_title} ${fieldEditTitle("order_certainty_start_of_month")}`}>
                        月初確度
                      </span>
                      {!searchMode && isEditModeField !== "order_certainty_start_of_month" && (
                        <span
                          className={`${styles.value} ${styles.value_highlight} ${styles.editable_field}`}
                          data-text={
                            selectedRowDataProperty?.order_certainty_start_of_month
                              ? getOrderCertaintyStartOfMonth(selectedRowDataProperty?.order_certainty_start_of_month)
                              : ""
                          }
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // if (!selectedRowDataMeeting?.activity_type) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.activity_type)) {
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.activity_type));
                            // }
                            handleDoubleClickField({
                              e,
                              field: "order_certainty_start_of_month",
                              dispatch: setInputOrderCertaintyStartOfMonth,
                              selectedRowDataValue: selectedRowDataProperty?.order_certainty_start_of_month ?? "",
                            });
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.order_certainty_start_of_month
                            ? getOrderCertaintyStartOfMonth(selectedRowDataProperty?.order_certainty_start_of_month)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "order_certainty_start_of_month" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputOrderCertaintyStartOfMonth}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "order_certainty_start_of_month",
                                fieldNameForSelectedRowData: "order_certainty_start_of_month",
                                newValue: isValidNumber(e.target.value) ? parseInt(e.target.value, 10) : null,
                                originalValue: isValidNumber(originalValueFieldEdit?.current)
                                  ? parseInt(originalValueFieldEdit.current!, 10)
                                  : null,
                                id: selectedRowDataProperty?.property_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            <option value=""></option>
                            {optionsOrderCertaintyStartOfMonth.map((option) => (
                              <option key={option} value={option}>
                                {getOrderCertaintyStartOfMonth(option)}
                              </option>
                            ))}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "order_certainty_start_of_month" && (
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
                    {/* <div className={`${styles.section_underline}`}></div> */}
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center  ${styles.section_title_box}`}>
                      <div
                        className={`${styles.section_title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                          "review_order_certainty"
                        )}`}
                      >
                        <span>中間見直</span>
                        <span>確度</span>
                      </div>

                      {!searchMode && isEditModeField !== "review_order_certainty" && (
                        <span
                          className={`${styles.value} ${styles.value_highlight} ${styles.editable_field}`}
                          data-text={
                            selectedRowDataProperty?.review_order_certainty
                              ? getOrderCertaintyStartOfMonth(selectedRowDataProperty?.review_order_certainty)
                              : ""
                          }
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // if (!selectedRowDataMeeting?.activity_type) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.activity_type)) {
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.activity_type));
                            // }
                            handleDoubleClickField({
                              e,
                              field: "review_order_certainty",
                              dispatch: setInputReviewOrderCertainty,
                              selectedRowDataValue: selectedRowDataProperty?.review_order_certainty ?? "",
                            });
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.review_order_certainty
                            ? getOrderCertaintyStartOfMonth(selectedRowDataProperty?.review_order_certainty)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "review_order_certainty" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputReviewOrderCertainty}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "review_order_certainty",
                                fieldNameForSelectedRowData: "review_order_certainty",
                                newValue: isValidNumber(e.target.value) ? parseInt(e.target.value, 10) : null,
                                originalValue: isValidNumber(originalValueFieldEdit?.current)
                                  ? parseInt(originalValueFieldEdit.current!, 10)
                                  : null,
                                id: selectedRowDataProperty?.property_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            <option value=""></option>
                            {optionsOrderCertaintyStartOfMonth.map((option) => (
                              <option key={option} value={option}>
                                {getOrderCertaintyStartOfMonth(option)}
                              </option>
                            ))}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "review_order_certainty" && (
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
                    {/* <div className={`${styles.section_underline}`}></div> */}
                  </div>
                </div>
                <div className={`${styles.section_underline2} `}></div>

                {/* リピート・案件介入(責任者) 通常 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <div className={`${styles.title} !mr-[15px] flex flex-col`}>
                        <span className={``}>リピート</span>
                      </div> */}
                      <span className={`${styles.check_title}`}>リピート</span>
                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          // checked={!!selectedRowDataProperty?.repeat_flag}
                          // onChange={() => {
                          //   setLoadingGlobalState(false);
                          //   setIsOpenUpdatePropertyModal(true);
                          // }}
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataProperty ? `pointer-events-none cursor-not-allowed` : ``
                          }`}
                          checked={checkRepeatFlagForFieldEdit}
                          onChange={async (e) => {
                            if (!selectedRowDataProperty) return;
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataProperty?.property_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);

                            console.log(
                              "チェック 新しい値",
                              !checkRepeatFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataProperty?.repeat_flag
                            );
                            if (!checkRepeatFlagForFieldEdit === selectedRowDataProperty?.repeat_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "repeat_flag",
                              fieldNameForSelectedRowData: "repeat_flag" as "repeat_flag",
                              newValue: !checkRepeatFlagForFieldEdit,
                              id: selectedRowDataProperty.property_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updatePropertyFieldMutation.mutate(updatePayload);
                            setCheckRepeatFlagForFieldEdit(!checkRepeatFlagForFieldEdit);
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
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      {/* <div className={`${styles.title} flex flex-col ${styles.double_text}`}> */}
                      <div className={`${styles.check_title} flex flex-col ${styles.double_text}`}>
                        <span>案件介入</span>
                        <span>(責任者)</span>
                      </div>

                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          // checked={!!selectedRowDataProperty?.step_in_flag}
                          // onChange={() => {
                          //   setLoadingGlobalState(false);
                          //   setIsOpenUpdatePropertyModal(true);
                          // }}
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataProperty ? `pointer-events-none cursor-not-allowed` : ``
                          }`}
                          checked={checkStepInFlagForFieldEdit}
                          onChange={async (e) => {
                            if (!selectedRowDataProperty) return;
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataProperty?.property_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);

                            console.log(
                              "チェック 新しい値",
                              !checkStepInFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataProperty?.step_in_flag
                            );
                            if (!checkStepInFlagForFieldEdit === selectedRowDataProperty?.step_in_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "step_in_flag",
                              fieldNameForSelectedRowData: "step_in_flag" as "step_in_flag",
                              newValue: !checkStepInFlagForFieldEdit,
                              id: selectedRowDataProperty.property_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updatePropertyFieldMutation.mutate(updatePayload);
                            setCheckStepInFlagForFieldEdit(!checkStepInFlagForFieldEdit);
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
                {/* ペンディング・案件没 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <div className={`${styles.title} !mr-[15px] flex flex-col`}>
                        <span className={``}>ペンディング</span>
                      </div> */}
                      <span className={`${styles.check_title}`}>ペンディング</span>
                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          // checked={!!selectedRowDataProperty?.pending_flag}
                          // onChange={() => {
                          //   setLoadingGlobalState(false);
                          //   setIsOpenUpdatePropertyModal(true);
                          // }}
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataProperty ? `pointer-events-none cursor-not-allowed` : ``
                          }`}
                          checked={checkPendingFlagForFieldEdit}
                          onChange={async (e) => {
                            if (!selectedRowDataProperty) return;
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataProperty?.property_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);

                            console.log(
                              "チェック 新しい値",
                              !checkPendingFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataProperty?.pending_flag
                            );
                            if (!checkPendingFlagForFieldEdit === selectedRowDataProperty?.pending_flag) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "pending_flag",
                              fieldNameForSelectedRowData: "pending_flag" as "pending_flag",
                              newValue: !checkPendingFlagForFieldEdit,
                              id: selectedRowDataProperty.property_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updatePropertyFieldMutation.mutate(updatePayload);
                            setCheckPendingFlagForFieldEdit(!checkPendingFlagForFieldEdit);
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
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>案件没</span>

                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataProperty) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          // checked={!!selectedRowDataProperty?.rejected_flag}
                          // onChange={() => {
                          //   setLoadingGlobalState(false);
                          //   setIsOpenUpdatePropertyModal(true);
                          // }}
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataProperty ? `pointer-events-none cursor-not-allowed` : ``
                          }`}
                          checked={checkRejectedFlagForFieldEdit}
                          onChange={async (e) => {
                            if (!selectedRowDataProperty) return;
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataProperty?.property_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);

                            console.log(
                              "チェック 新しい値",
                              !checkRejectedFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataProperty?.rejected_flag
                            );
                            if (!checkRejectedFlagForFieldEdit === selectedRowDataProperty?.rejected_flag) {
                              toast.error(`アップデートに失敗しました🙇‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "rejected_flag",
                              fieldNameForSelectedRowData: "rejected_flag" as "rejected_flag",
                              newValue: !checkRejectedFlagForFieldEdit,
                              id: selectedRowDataProperty.property_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updatePropertyFieldMutation.mutate(updatePayload);
                            setCheckRejectedFlagForFieldEdit(!checkRejectedFlagForFieldEdit);
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

                {/* 競合発生日・競合状況 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title} ${fieldEditTitle("competitor_appearance_date")}`}>
                        競合発生日
                      </span>
                      {!searchMode && isEditModeField !== "competitor_appearance_date" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // if (!selectedRowDataProperty?.activity_type) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.activity_type)) {
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.activity_type));
                            // }
                            handleDoubleClickField({
                              e,
                              field: "competitor_appearance_date",
                              dispatch: setInputCompetitorAppearanceDate,
                              dateValue: selectedRowDataProperty?.competitor_appearance_date
                                ? selectedRowDataProperty.competitor_appearance_date
                                : null,
                            });
                          }}
                          data-text={`${
                            selectedRowDataProperty?.competitor_appearance_date
                              ? format(new Date(selectedRowDataProperty.competitor_appearance_date), "yyyy/MM/dd")
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth || isOpenSidebar)
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                // marginTop: 57,
                                // marginTop: 38,
                                // marginTop: 12,
                                // itemsPosition: "center",
                                // whiteSpace: "nowrap",
                              });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.competitor_appearance_date
                            ? format(new Date(selectedRowDataProperty.competitor_appearance_date), "yyyy/MM/dd")
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード Date-picker  */}
                      {!searchMode && isEditModeField === "competitor_appearance_date" && (
                        <>
                          <div className="z-[2000] w-full">
                            <DatePickerCustomInput
                              startDate={inputCompetitorAppearanceDate as Date | null}
                              setStartDate={setInputCompetitorAppearanceDate as Dispatch<SetStateAction<Date | null>>}
                              required={false}
                              isFieldEditMode={true}
                              fieldEditModeBtnAreaPosition="right"
                              isLoadingSendEvent={updatePropertyFieldMutation.isLoading}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                if (!inputCompetitorAppearanceDate) return alert("このデータは入力が必須です。");
                                const originalDateUTCString = selectedRowDataProperty?.competitor_appearance_date
                                  ? selectedRowDataProperty.competitor_appearance_date
                                  : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                                const newDateUTCString = inputCompetitorAppearanceDate
                                  ? (inputCompetitorAppearanceDate as Date).toISOString()
                                  : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                                // const result = isSameDateLocal(originalDateString, newDateString);
                                console.log(
                                  "日付送信クリック",
                                  "オリジナル(UTC)",
                                  originalDateUTCString,
                                  "新たな値(Dateオブジェクト)",
                                  inputCompetitorAppearanceDate,
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
                                  fieldName: "competitor_appearance_date",
                                  fieldNameForSelectedRowData: "competitor_appearance_date",
                                  // originalValue: originalValueFieldEdit.current,
                                  originalValue: originalDateUTCString,
                                  newValue: newDateUTCString,
                                  id: selectedRowDataProperty?.property_id,
                                  required: false,
                                });
                              }}
                              fontSize={`!text-[13px]`}
                            />
                          </div>
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "competitor_appearance_date" && (
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
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} ${fieldEditTitle("competition_state")}`}>競合状況</span>
                      {!searchMode && isEditModeField !== "competition_state" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.competition_state) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.competition_state))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.competition_state));
                            handleDoubleClickField({
                              e,
                              field: "competition_state",
                              dispatch: setInputCompetitionState,
                              selectedRowDataValue: selectedRowDataProperty?.competition_state ?? "",
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.competition_state
                              ? getCompetitionState(selectedRowDataProperty?.competition_state)
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth)
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                // marginTop: 57,
                                // marginTop: 38,
                                // marginTop: 12,
                                // itemsPosition: "center",
                                // whiteSpace: "nowrap",
                              });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.competition_state
                            ? getCompetitionState(selectedRowDataProperty?.competition_state)
                            : null}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "competition_state" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputCompetitionState}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "competition_state",
                                fieldNameForSelectedRowData: "competition_state",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            <option value=""></option>
                            {optionsCompetitionState.map((option) => (
                              <option key={option} value={option}>
                                {getCompetitionState(option)}
                              </option>
                            ))}
                            {/* <option value="今期">今期</option>
                          <option value="来期">来期</option> */}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "competition_state" && (
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

                {/* 競合会社 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} ${fieldEditTitle("competitor")}`}>競合会社</span>
                      {!searchMode && isEditModeField !== "competitor" && (
                        <div
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.competitor) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.competitor))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.competitor));
                            handleDoubleClickField({
                              e,
                              field: "competitor",
                              dispatch: setInputCompetitor,
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.competitor ? selectedRowDataProperty?.competitor : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataProperty?.competitor
                              ? selectedRowDataProperty?.competitor.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "competitor" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                            value={inputCompetitor}
                            // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                            onChange={(e) => setInputCompetitor(e.target.value)}
                            // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={async (e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "competitor",
                                fieldNameForSelectedRowData: "competitor",
                                newValue: inputCompetitor.trim(),
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updatePropertyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputCompetitor}
                              setInputState={setInputCompetitor}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "competitor",
                                  fieldNameForSelectedRowData: "competitor",
                                  newValue: inputPropertyName.trim(),
                                  originalValue: originalValueFieldEdit.current,
                                  id: selectedRowDataProperty?.property_id,
                                  required: true,
                                })
                              }
                              required={true}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "competitor" && (
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

                {/* 競合商品 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} ${fieldEditTitle("competitor_product")}`}>競合商品</span>
                      {!searchMode && isEditModeField !== "competitor_product" && (
                        <div
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.competitor_product) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.competitor_product))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.competitor_product));
                            handleDoubleClickField({
                              e,
                              field: "competitor_product",
                              dispatch: setInputCompetitorProduct,
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.competitor_product
                              ? selectedRowDataProperty?.competitor_product
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataProperty?.competitor_product
                              ? selectedRowDataProperty?.competitor_product.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "competitor_product" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box_with_close}`}
                            value={inputCompetitorProduct}
                            // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                            onChange={(e) => setInputCompetitorProduct(e.target.value)}
                            // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={async (e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "competitor_product",
                                fieldNameForSelectedRowData: "competitor_product",
                                newValue: inputCompetitorProduct.trim(),
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updatePropertyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputCompetitorProduct}
                              setInputState={setInputCompetitorProduct}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "competitor_product",
                                  fieldNameForSelectedRowData: "competitor_product",
                                  newValue: inputCompetitorProduct.trim(),
                                  originalValue: originalValueFieldEdit.current,
                                  id: selectedRowDataProperty?.property_id,
                                  required: true,
                                })
                              }
                              required={true}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "competitor_product" && (
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

                {/* 案件発生動機・動機詳細 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div
                        className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                          "reason_class"
                        )}`}
                      >
                        <span>案件発生</span>
                        <span>動機</span>
                      </div>
                      {!searchMode && isEditModeField !== "reason_class" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.reason_class) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.reason_class))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.reason_class));
                            handleDoubleClickField({
                              e,
                              field: "reason_class",
                              dispatch: setInputReasonClass,
                              selectedRowDataValue: selectedRowDataProperty?.reason_class ?? "",
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.reason_class
                              ? getReasonClass(selectedRowDataProperty?.reason_class)
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.reason_class
                            ? getReasonClass(selectedRowDataProperty?.reason_class)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "reason_class" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputReasonClass}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "reason_class",
                                fieldNameForSelectedRowData: "reason_class",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            <option value=""></option>
                            {optionsReasonClass.map((option) => (
                              <option key={option} value={option}>
                                {getReasonClass(option)}
                              </option>
                            ))}
                            {/* <option value="今期">今期</option>
                          <option value="来期">来期</option> */}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "reason_class" && (
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
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} ${fieldEditTitle("reason_detail")}`}>動機詳細</span>
                      {!searchMode && isEditModeField !== "reason_detail" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.reason_detail) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.reason_detail))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.reason_detail));
                            handleDoubleClickField({
                              e,
                              field: "reason_detail",
                              dispatch: setInputReasonDetail,
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.reason_detail ? selectedRowDataProperty?.reason_detail : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.reason_detail ? selectedRowDataProperty?.reason_detail : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "reason_detail" && (
                        <>
                          <input
                            type="text"
                            placeholder=""
                            autoFocus
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            value={inputReasonDetail}
                            // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
                            onChange={(e) => setInputReasonDetail(e.target.value)}
                            // onBlur={() => setInputName(toHalfWidthAndSpace(inputName.trim()))}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={async (e) => {
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "reason_detail",
                                fieldNameForSelectedRowData: "reason_detail",
                                newValue: inputReasonDetail.trim(),
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                                required: true,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updatePropertyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn
                              inputState={inputReasonDetail}
                              setInputState={setInputReasonDetail}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "reason_detail",
                                  fieldNameForSelectedRowData: "reason_detail",
                                  newValue: inputPropertyName.trim(),
                                  originalValue: originalValueFieldEdit.current,
                                  id: selectedRowDataProperty?.property_id,
                                  required: true,
                                })
                              }
                              required={true}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "reason_detail" && (
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

                {/* 客先予算・決裁者商談有無 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title} ${fieldEditTitle("customer_budget")}`}>客先予算</span>
                      {!searchMode && isEditModeField !== "customer_budget" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // if (!selectedRowDataProperty?.customer_budget) return;
                            if (!checkNotFalsyExcludeZero(selectedRowDataProperty?.customer_budget)) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.customer_budget))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.customer_budget));
                            handleDoubleClickField({
                              e,
                              field: "customer_budget",
                              dispatch: setInputCustomerBudget,
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataProperty?.customer_budget ? selectedRowDataProperty?.customer_budget : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {checkNotFalsyExcludeZero(selectedRowDataProperty?.customer_budget)
                            ? Number(selectedRowDataProperty?.customer_budget).toLocaleString()
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "customer_budget" && (
                        <>
                          <input
                            type="text"
                            autoFocus
                            // placeholder="例：600万円 → 6000000　※半角で入力"
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            value={checkNotFalsyExcludeZero(inputCustomerBudget) ? inputCustomerBudget : ""}
                            onChange={(e) => setInputCustomerBudget(e.target.value)}
                            onKeyDown={(e) => {
                              const _convertValue = convertToYen(inputCustomerBudget.trim());
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "customer_budget",
                                fieldNameForSelectedRowData: "customer_budget",
                                originalValue: originalValueFieldEdit.current,
                                newValue:
                                  checkNotFalsyExcludeZero(inputCustomerBudget) &&
                                  checkNotFalsyExcludeZero(convertToYen(inputCustomerBudget.trim()))
                                    ? (convertToYen(inputCustomerBudget.trim()) as number).toString()
                                    : null,
                                id: selectedRowDataProperty?.property_id,
                                required: false,
                              });
                            }}
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updatePropertyFieldMutation.isLoading && (
                            <InputSendAndCloseBtn<string>
                              inputState={inputCustomerBudget}
                              setInputState={setInputCustomerBudget}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                const convertedValue = convertToYen(inputCustomerBudget.trim());
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "customer_budget",
                                  fieldNameForSelectedRowData: "customer_budget",
                                  originalValue: originalValueFieldEdit.current,
                                  newValue:
                                    inputCustomerBudget && checkNotFalsyExcludeZero(convertedValue)
                                      ? (convertedValue as number).toString()
                                      : null,
                                  id: selectedRowDataProperty?.property_id,
                                  required: false,
                                });
                              }}
                              required={false}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "customer_budget" && (
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
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <div
                        className={`${styles.title} flex flex-col ${styles.double_text} ${fieldEditTitle(
                          "decision_maker_negotiation"
                        )}`}
                      >
                        <span>決裁者</span>
                        <span>商談有無</span>
                      </div>
                      {!searchMode && isEditModeField !== "decision_maker_negotiation" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataProperty?.decision_maker_negotiation) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataProperty.decision_maker_negotiation))
                            //   return alert(returnMessageNotActivity(selectedRowDataProperty.decision_maker_negotiation));
                            handleDoubleClickField({
                              e,
                              field: "decision_maker_negotiation",
                              dispatch: setInputDecisionMakerNegotiation,
                              selectedRowDataValue: selectedRowDataProperty?.decision_maker_negotiation ?? "",
                            });
                            handleCloseTooltip();
                          }}
                          data-text={
                            selectedRowDataProperty?.decision_maker_negotiation
                              ? getDecisionMakerNegotiation(selectedRowDataProperty?.decision_maker_negotiation)
                              : ""
                          }
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.decision_maker_negotiation
                            ? getDecisionMakerNegotiation(selectedRowDataProperty?.decision_maker_negotiation)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "decision_maker_negotiation" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputDecisionMakerNegotiation}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "decision_maker_negotiation",
                                fieldNameForSelectedRowData: "decision_maker_negotiation",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataProperty?.property_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            <option value=""></option>
                            {optionsDecisionMakerNegotiation.map((option) => (
                              <option key={option} value={option}>
                                {getDecisionMakerNegotiation(option)}
                              </option>
                            ))}
                            {/* <option value="今期">今期</option>
                          <option value="来期">来期</option> */}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updatePropertyFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "decision_maker_negotiation" && (
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

                {/* 事業部名 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業部名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataProperty?.assigned_department_name
                              ? selectedRowDataProperty?.assigned_department_name
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.assigned_department_name
                            ? selectedRowDataProperty?.assigned_department_name
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} ${styles.min}`}>係・ﾁｰﾑ</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataProperty?.assigned_unit_name
                              ? selectedRowDataProperty?.assigned_unit_name
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.assigned_unit_name
                            ? selectedRowDataProperty?.assigned_unit_name
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 課セクション・自社担当 通常 */}
                <div className={`${styles.row_area} flex h-[30px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title} ${styles.min}`}>課・ｾｸｼｮﾝ</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataProperty?.assigned_section_name
                              ? selectedRowDataProperty?.assigned_section_name
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.assigned_section_name
                            ? selectedRowDataProperty?.assigned_section_name
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
                          data-text={`${
                            selectedRowDataProperty?.property_member_name
                              ? selectedRowDataProperty?.property_member_name
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.property_member_name
                            ? selectedRowDataProperty?.property_member_name
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業所・自社担当 通常 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業所</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataProperty?.assigned_office_name
                              ? selectedRowDataProperty?.assigned_office_name
                              : ""
                          }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataProperty?.assigned_office_name
                            ? selectedRowDataProperty?.assigned_office_name
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    {/* <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>自社担当</span>
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
                          {selectedRowDataProperty?.property_member_name
                            ? selectedRowDataProperty?.property_member_name
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>

                {/* 結果エリアここまで */}
              </div>
            </div>
          </div>
        )}
        {/* ---------------- 通常モード 真ん中コンテナここまで ---------------- */}

        {/* ---------------- 通常モード 右コンテナ ---------------- */}
        {!searchMode && (
          <div
            // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
            className={`${styles.left_container} ${
              isOpenSidebar ? `transition-base02` : `transition-base01`
            } h-full pb-[35px] pt-[0px] ${
              tableContainerSize === "one_third"
                ? `min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)]`
                : `min-w-[calc((100vw-var(--sidebar-width))/3-15px)] max-w-[calc((100vw-var(--sidebar-width))/3-15px)]`
            }`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* アクティビティ セクションタイトル 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title}`}>活動</span>
                  </div>
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>

              <div className={`${styles.spacer} h-[5px] w-full`}></div>

              {/* 活動履歴 */}
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackUnderRightActivityLogCustom />}>
                  <UnderRightActivityLogCustom isHoverableBorder={true} />
                </Suspense>
              </ErrorBoundary>
              {/* <FallbackUnderRightActivityLogCustom /> */}

              {/* 会社情報 セクションタイトル 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title} !text-[15px]`}>会社情報</span>

                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataProperty?.company_name ? selectedRowDataProperty?.company_name : ""}
                      </span> */}
                  </div>
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>

              {/* 会社名 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●会社名</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.value_highlight} ${styles.text_start} ${styles.editable_field} hover:text-[var(--color-bg-brand-f)]`}
                        data-text={`${
                          selectedRowDataProperty?.company_name ? selectedRowDataProperty?.company_name : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                        onClick={() => setIsOpenClientCompanyDetailModal(true)}
                      >
                        {selectedRowDataProperty?.company_name ? selectedRowDataProperty?.company_name : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 部署名 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>●部署名</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.text_start}`}
                        data-text={`${
                          selectedRowDataProperty?.company_department_name
                            ? selectedRowDataProperty?.company_department_name
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {/* {selectedRowDataProperty?.department_name ? selectedRowDataProperty?.department_name : ""} */}
                        {selectedRowDataProperty?.company_department_name
                          ? selectedRowDataProperty?.company_department_name
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当者名・直通TEL 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当者名</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.editable_field} hover:text-[var(--color-bg-brand-f)]`}
                        data-text={`${
                          selectedRowDataProperty?.contact_name ? selectedRowDataProperty?.contact_name : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                        onClick={() => setIsOpenContactDetailModal(true)}
                      >
                        {selectedRowDataProperty?.contact_name ? selectedRowDataProperty?.contact_name : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>直通TEL</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={selectedRowDataProperty?.direct_line ? selectedRowDataProperty?.direct_line : ""}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.direct_line ? selectedRowDataProperty?.direct_line : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 内線TEL・代表TEL 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>内線TEL</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={selectedRowDataProperty?.extension ? selectedRowDataProperty?.extension : ""}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.extension ? selectedRowDataProperty?.extension : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>代表TEL</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={
                          selectedRowDataProperty?.main_phone_number ? selectedRowDataProperty?.main_phone_number : ""
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.main_phone_number ? selectedRowDataProperty?.main_phone_number : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 直通FAX・代表FAX 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>直通FAX</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={selectedRowDataProperty?.direct_fax ? selectedRowDataProperty?.direct_fax : ""}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.direct_fax ? selectedRowDataProperty?.direct_fax : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className={`flex h-full w-1/2 flex-col pr-[20px]`}>
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>代表FAX</span>
                    {/* <span className={`${styles.title}`}>会員専用</span> */}
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={selectedRowDataProperty?.main_fax ? selectedRowDataProperty?.main_fax : ""}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.main_fax ? selectedRowDataProperty?.main_fax : ""}
                      </span>
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

              {/* 社用携帯・私用携帯 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>社用携帯</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={
                          selectedRowDataProperty?.company_cell_phone ? selectedRowDataProperty?.company_cell_phone : ""
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.company_cell_phone ? selectedRowDataProperty?.company_cell_phone : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>私用携帯</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={
                          selectedRowDataProperty?.personal_cell_phone
                            ? selectedRowDataProperty?.personal_cell_phone
                            : ""
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.personal_cell_phone
                          ? selectedRowDataProperty?.personal_cell_phone
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* Email 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>E-mail</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.contact_email ? selectedRowDataProperty?.contact_email : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.contact_email ? selectedRowDataProperty?.contact_email : ""}
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

              {/* 郵便番号・ 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>郵便番号</span>
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
                        {selectedRowDataProperty?.zipcode ? selectedRowDataProperty?.zipcode : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}></span>
                  </div>
                  {/* <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 住所 通常 */}
              <div className={`${styles.row_area_lg_box} flex h-[50px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box} flex h-full`}>
                    <span className={`${styles.title}`}>○住所</span>
                    {!searchMode && (
                      <span
                        className={`${styles.full_value} h-[45px] !overflow-visible !whitespace-normal`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.address ? selectedRowDataProperty?.address : ""}
                      </span>
                    )}
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
                  </div>
                  <div className={`${styles.underline} `}></div>
                </div>
              </div>

              {/* 役職名・職位 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>役職名</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={selectedRowDataProperty?.position_name ? selectedRowDataProperty?.position_name : ""}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.position_name ? selectedRowDataProperty?.position_name : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>職位</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.position_class &&
                          mappingPositionClass[selectedRowDataProperty.position_class]?.[language]
                            ? mappingPositionClass[selectedRowDataProperty.position_class]?.[language]
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {/* {selectedRowDataProperty?.position_class ? selectedRowDataProperty?.position_class : ""} */}
                        {selectedRowDataProperty &&
                        selectedRowDataProperty?.position_class &&
                        mappingPositionClass[selectedRowDataProperty.position_class]?.[language]
                          ? mappingPositionClass[selectedRowDataProperty.position_class]?.[language]
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 担当職種・決裁金額 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>担当職種</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.occupation &&
                          mappingOccupation[selectedRowDataProperty.occupation]?.[language]
                            ? mappingOccupation[selectedRowDataProperty.occupation]?.[language]
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {/* {selectedRowDataProperty?.occupation ? selectedRowDataProperty?.occupation : ""} */}
                        {selectedRowDataProperty &&
                        selectedRowDataProperty?.occupation &&
                        mappingOccupation[selectedRowDataProperty.occupation]?.[language]
                          ? mappingOccupation[selectedRowDataProperty.occupation]?.[language]
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title} !mr-[15px] flex flex-col ${styles.double_text}`}>
                      <span className={``}>決裁金額</span>
                      <span className={``}>(万円)</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.approval_amount ? selectedRowDataProperty?.approval_amount : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.approval_amount ? selectedRowDataProperty?.approval_amount : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 規模（ランク）・決算月 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.number_of_employees_class
                            ? getNumberOfEmployeesClass(selectedRowDataProperty?.number_of_employees_class)
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                            handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.number_of_employees_class
                          ? getNumberOfEmployeesClass(selectedRowDataProperty?.number_of_employees_class)
                          : ""}
                      </span>
                    )}
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
                          // handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          // handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.fiscal_end_month
                          ? `${selectedRowDataProperty?.fiscal_end_month}月`
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 予算申請月1・予算申請月2 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} text-[12px]`}>予算申請月1</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          // handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          // handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.budget_request_month1
                          ? selectedRowDataProperty?.budget_request_month1
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>予算申請月2</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          // handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          // handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.budget_request_month2
                          ? selectedRowDataProperty?.budget_request_month2
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 資本金・設立 通常モード テスト 通常 */}
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
                          selectedRowDataProperty?.capital
                            ? convertToJapaneseCurrencyFormat(selectedRowDataProperty.capital)
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                        {selectedRowDataProperty?.capital
                          ? convertToJapaneseCurrencyFormat(selectedRowDataProperty.capital)
                          : ""}
                      </span>
                    )}
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
                          // handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          // handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.established_in ? selectedRowDataProperty?.established_in : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業内容 通常 */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>事業内容</span>
                    {!searchMode && (
                      <span
                        className={`${styles.textarea_value} `}
                        data-text={`${
                          selectedRowDataProperty?.business_content ? selectedRowDataProperty?.business_content : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                            handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                        dangerouslySetInnerHTML={{
                          __html: selectedRowDataProperty?.business_content
                            ? selectedRowDataProperty?.business_content.replace(/\n/g, "<br>")
                            : "",
                        }}
                      ></span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要取引先 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>主要取引先</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={selectedRowDataProperty?.clients ? selectedRowDataProperty?.clients : ""}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.clients ? selectedRowDataProperty?.clients : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 主要仕入先 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>主要仕入先</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${selectedRowDataProperty?.supplier ? selectedRowDataProperty?.supplier : ""}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.supplier ? selectedRowDataProperty?.supplier : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 設備 通常 */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title}`}>設備</span>
                    {!searchMode && (
                      <>
                        <span
                          className={`${styles.textarea_value}`}
                          data-text={`${selectedRowDataProperty?.facility ? selectedRowDataProperty?.facility : ""}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                              handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataProperty?.facility
                              ? selectedRowDataProperty?.facility.replace(/\n/g, "<br>")
                              : "",
                          }}
                        >
                          {/* {selectedRowDataProperty?.facility ? selectedRowDataProperty?.facility : ""} */}
                        </span>
                      </>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業拠点・海外拠点 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>事業拠点</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.business_sites ? selectedRowDataProperty?.business_sites : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.business_sites ? selectedRowDataProperty?.business_sites : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title}`}>海外拠点</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.overseas_bases ? selectedRowDataProperty?.overseas_bases : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.overseas_bases ? selectedRowDataProperty?.overseas_bases : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* グループ会社 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>ｸﾞﾙｰﾌﾟ会社</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.group_company ? selectedRowDataProperty?.group_company : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.group_company ? selectedRowDataProperty?.group_company : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* HP 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>HP</span>
                    {/* {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.website_url ? selectedRowDataProperty?.website_url : ""}
                      </span>
                    )} */}
                    {!searchMode && !!selectedRowDataProperty?.website_url ? (
                      <a
                        href={selectedRowDataProperty.website_url}
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
                        {selectedRowDataProperty.website_url}
                      </a>
                    ) : (
                      <span></span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 会社Email 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>会社Email</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.email_value}`}
                        onClick={async () => {
                          if (!selectedRowDataProperty?.company_email) return;
                          try {
                            await navigator.clipboard.writeText(selectedRowDataProperty.company_email);
                            toast.success(`コピーしました!`, {
                              autoClose: 1000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                            });
                          } catch (e: any) {
                            toast.error(`コピーできませんでした!`, {
                              autoClose: 1000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                            });
                          }
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        {selectedRowDataProperty?.company_email ? selectedRowDataProperty?.company_email : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 業種 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>○業種</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={`${
                          selectedRowDataProperty?.industry_type_id
                            ? mappingIndustryType[selectedRowDataProperty?.industry_type_id][language]
                            : ""
                        }`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.industry_type_id
                          ? mappingIndustryType[selectedRowDataProperty?.industry_type_id][language]
                          : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 製品分類(大分類) 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
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
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
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
              {/* 製品分類(中分類) 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(中分類)</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.hashtag} ${styles.uneditable_field}`}
                        data-text={`${formattedProductCategoriesMedium}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
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
              {/* 製品分類(小分類) 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(小分類)</span>
                    </div>
                    {!searchMode && (
                      <span
                        className={`${styles.value} ${styles.hashtag} ${styles.uneditable_field}`}
                        data-text={`${formattedProductCategoriesSmall}`}
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
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

              {/* 法人番号・ID 通常 */}
              <div className={`${styles.row_area} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>○法人番号</span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                        data-text={
                          selectedRowDataProperty?.corporate_number ? selectedRowDataProperty?.corporate_number : ""
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        {selectedRowDataProperty?.corporate_number ? selectedRowDataProperty?.corporate_number : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_min}`}>会社ID</span>
                    {!searchMode && (
                      <span className={`${styles.value} truncate`}>
                        {selectedRowDataProperty?.company_id ? selectedRowDataProperty?.company_id : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* --------- ラッパーここまで --------- */}
            </div>
          </div>
        )}
        {/* ---------------- 通常モード 右コンテナここまで ---------------- */}

        {/* ---------------- サーチモード 左コンテナ input時はstickyにしてnullやis nullなどのボタンや説明を配置 ---------------- */}
        {searchMode && (
          <div
            // className={`${styles.left_container} h-full min-w-[calc((100vw-var(--sidebar-width))/3)] pb-[35px] pt-[10px]`}
            className={`${styles.left_container} h-full min-w-[calc(50vw-var(--sidebar-mini-width))] max-w-[calc(50vw-var(--sidebar-mini-width))] pb-[35px] pt-[0px]`}
          >
            {/* --------- ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* ============= 予定エリアここから============= */}
              {/* 予定 サーチ */}
              {/* 現ステータス サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative  flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box}  flex h-full items-center `}>
                    <span className={`${styles.section_title_search_mode}`}>現ｽﾃｰﾀｽ</span>

                    {isNullNotNullCurrentStatus === "is null" || isNullNotNullCurrentStatus === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[isNullNotNullCurrentStatus]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullCurrentStatus]}</span>
                      </div>
                    ) : (
                      <CustomSelectMultiple
                        stateArray={inputCurrentStatusArray}
                        dispatch={setInputCurrentStatusArray}
                        selectedSetObj={selectedCurrentStatusArraySet}
                        options={optionsCurrentStatus}
                        getOptionName={getCurrentStatusNameSearch}
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
                      value={inputCurrentStatus}
                      onChange={(e) => {
                        setInputCurrentStatus(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsCurrentStatus.map((option) => (
                        <option key={option} value={option}>
                          {getCurrentStatus(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                    </select> */}
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
                              isNullNotNullCurrentStatus === null && inputCurrentStatusArray.length === 0
                                ? `hidden`
                                : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleResetArray("current_status")}
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
                                handleClickAdditionalAreaBtn(index, setIsNullNotNullCurrentStatus, "current_status")
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

              {/* 案件名 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>●案件名</span>
                    {["is null", "is not null"].includes(inputPropertyName) ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputPropertyName]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputPropertyName]}</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          className={`${styles.input_box} truncate`}
                          placeholder=""
                          value={inputPropertyName}
                          onChange={(e) => setInputPropertyName(e.target.value)}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            if (el.offsetWidth < el.scrollWidth) handleOpenTooltip({ e, content: inputPropertyName });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        />
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
                            className={`icon_btn_red ${inputPropertyName === "" ? `hidden` : `flex`}`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputPropertyName)}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputPropertyName)}
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

              {/* 案件概要 サーチ */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode} `}>案件概要</span>
                    {searchMode && (
                      <>
                        {["is null", "is not null"].includes(inputPropertySummary) ? (
                          <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                            {nullNotNullIconMap[inputPropertySummary]}
                            <span className={`text-[13px]`}>{nullNotNullTextMap[inputPropertySummary]}</span>
                          </div>
                        ) : (
                          <textarea
                            cols={30}
                            // rows={10}
                            className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                            value={inputPropertySummary}
                            onChange={(e) => setInputPropertySummary(e.target.value)}
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
                            className={`icon_btn_red ${inputPropertySummary === "" ? `hidden` : `flex`}`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputPropertySummary)}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputPropertySummary)}
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

              {/* 商品・予定台数 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>商品</span>
                    {["is null", "is not null"].includes(inputProductName) ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputProductName]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputProductName]}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder=""
                        value={inputProductName}
                        onChange={(e) => setInputProductName(e.target.value)}
                      />
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
                            className={`icon_btn_red ${inputProductName === "" ? `hidden` : `flex`}`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputProductName)}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputProductName)}
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
                    <span className={`${styles.title_search_mode} text-[12px]`}>予定台数</span>

                    {inputProductSalesSearch === "is null" || inputProductSalesSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputProductSalesSearch as IsNullNotNullText]}
                        <span className={`text-[13px]`}>
                          {nullNotNullTextMap[inputProductSalesSearch as IsNullNotNullText]}
                        </span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="number"
                          min="0"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputProductSalesSearch.min === null ? "" : inputProductSalesSearch.min}
                          onChange={(e) => {
                            const val = e.target.value;
                            const numValue = Number(val);
                            if (val === "" || isNaN(numValue)) {
                              setInputProductSalesSearch({
                                min: null,
                                max: inputProductSalesSearch.max,
                              });
                            } else {
                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputProductSalesSearch({
                                  min: 0,
                                  max: inputProductSalesSearch.max,
                                });
                              } else {
                                setInputProductSalesSearch({
                                  min: numValue,
                                  max: inputProductSalesSearch.max,
                                });
                              }
                            }
                          }}
                          onBlur={() => {
                            if (isNaN(parseInt(String(inputProductSalesSearch.min), 10)))
                              setInputProductSalesSearch({
                                min: null,
                                max: inputProductSalesSearch.max,
                              });
                          }}
                        />

                        <span className="mx-[10px]">〜</span>

                        <input
                          type="number"
                          min="0"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputProductSalesSearch.max === null ? "" : inputProductSalesSearch.max}
                          onChange={(e) => {
                            const val = e.target.value;
                            const numValue = Number(val);
                            if (val === "" || isNaN(numValue)) {
                              setInputProductSalesSearch({
                                min: inputProductSalesSearch.min,
                                max: null,
                              });
                            } else {
                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputProductSalesSearch({
                                  min: inputProductSalesSearch.min,
                                  max: 0,
                                });
                              } else {
                                setInputProductSalesSearch({
                                  min: inputProductSalesSearch.min,
                                  max: numValue,
                                });
                              }
                            }
                          }}
                          onBlur={() => {
                            if (isNaN(parseInt(String(inputProductSalesSearch.max), 10)))
                              setInputProductSalesSearch({
                                min: inputProductSalesSearch.min,
                                max: null,
                              });
                          }}
                        />
                      </>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                  {/* input下追加ボタンエリア */}
                  {searchMode && (
                    <>
                      <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                        <div className={`line_first space-x-[6px]`}>
                          {isCopyableInputRange(inputProductSalesSearch, "number") && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputProductSalesSearch, "number");
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputProductSalesSearch, "number") ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputProductSalesSearch, "range_number")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputProductSalesSearch)}
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

              {/* 獲得予定時期・予定売上合計 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title_search_mode}`}>獲得予定時期</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>獲得予定</span>
                      <span>日付</span>
                    </div>
                    {/* <DatePickerCustomInput
                      startDate={inputExpectedOrderDate}
                      setStartDate={setInputExpectedOrderDate}
                      required={false}
                    /> */}
                    {/* <DatePickerCustomInputForSearch
                      startDate={inputExpectedOrderDate}
                      setStartDate={setInputExpectedOrderDate}
                      required={false}
                      isNotNullForSearch={true}
                      handleOpenTooltip={handleOpenTooltip}
                      handleCloseTooltip={handleCloseTooltip}
                      tooltipDataText="獲得予定日"
                      isNotNullText="獲得予定日有りのデータのみ"
                      isNullText="獲得予定日無しのデータのみ"
                      minHeight="!min-h-[30px]"
                    /> */}
                    {inputExpectedOrderDateSearch === "is null" || inputExpectedOrderDateSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputExpectedOrderDateSearch]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputExpectedOrderDateSearch]}</span>
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
                          startDate={inputExpectedOrderDateSearch}
                          setStartDate={setInputExpectedOrderDateSearch}
                          required={false}
                          handleOpenTooltip={handleOpenTooltip}
                          handleCloseTooltip={handleCloseTooltip}
                        />

                        <span className="mx-[10px]">〜</span>

                        <DatePickerCustomInputRange
                          minmax="max"
                          startDate={inputExpectedOrderDateSearch}
                          setStartDate={setInputExpectedOrderDateSearch}
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
                          {isCopyableInputRange(inputExpectedOrderDateSearch, "date") && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputExpectedOrderDateSearch, "date");
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputExpectedOrderDateSearch, "date") ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputExpectedOrderDateSearch, "range_date")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputExpectedOrderDateSearch)}
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
                    {/* <span className={`${styles.title_search_mode}`}>予定売上合計</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>予定売上</span>
                      <span>合計</span>
                    </div>

                    {inputExpectedSalesPriceSearch === "is null" || inputExpectedSalesPriceSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputExpectedSalesPriceSearch as IsNullNotNullText]}
                        <span className={`text-[13px]`}>
                          {nullNotNullTextMap[inputExpectedSalesPriceSearch as IsNullNotNullText]}
                        </span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} truncate`}
                          value={!!inputExpectedSalesPriceSearch.min ? inputExpectedSalesPriceSearch.min : ""}
                          onChange={(e) =>
                            setInputExpectedSalesPriceSearch({ ...inputExpectedSalesPriceSearch, min: e.target.value })
                          }
                          onBlur={() => {
                            let newPrice = "";
                            if (!!inputExpectedSalesPriceSearch.min) {
                              const convertedPrice = convertToYen(inputExpectedSalesPriceSearch.min.trim());
                              if (convertedPrice !== null) newPrice = convertedPrice.toLocaleString();
                            }
                            setInputExpectedSalesPriceSearch({
                              ...inputExpectedSalesPriceSearch,
                              min: newPrice,
                            });
                          }}
                          onFocus={() =>
                            !!inputExpectedSalesPriceSearch.min &&
                            setInputExpectedSalesPriceSearch({
                              ...inputExpectedSalesPriceSearch,
                              min: inputExpectedSalesPriceSearch.min.replace(/[^\d.]/g, ""),
                            })
                          }
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            if (el.offsetWidth < el.scrollWidth)
                              handleOpenTooltip({ e, content: inputExpectedSalesPriceSearch.min });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        />

                        <span className="mx-[10px]">〜</span>

                        <input
                          type="text"
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} truncate`}
                          value={!!inputExpectedSalesPriceSearch.max ? inputExpectedSalesPriceSearch.max : ""}
                          onChange={(e) =>
                            setInputExpectedSalesPriceSearch({ ...inputExpectedSalesPriceSearch, max: e.target.value })
                          }
                          onBlur={() => {
                            let newPrice = "";
                            if (!!inputExpectedSalesPriceSearch.max) {
                              const convertedPrice = convertToYen(inputExpectedSalesPriceSearch.max.trim());
                              if (convertedPrice !== null) newPrice = convertedPrice.toLocaleString();
                            }
                            setInputExpectedSalesPriceSearch({
                              ...inputExpectedSalesPriceSearch,
                              max: newPrice,
                            });
                          }}
                          onFocus={() =>
                            !!inputExpectedSalesPriceSearch.max &&
                            setInputExpectedSalesPriceSearch({
                              ...inputExpectedSalesPriceSearch,
                              max: inputExpectedSalesPriceSearch.max.replace(/[^\d.]/g, ""),
                            })
                          }
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            if (el.offsetWidth < el.scrollWidth)
                              handleOpenTooltip({ e, content: inputExpectedSalesPriceSearch.max });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        />
                      </>
                    )}
                    {/* {["is null", "is not null"].includes(inputExpectedSalesPrice) ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputExpectedSalesPrice]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputExpectedSalesPrice]}</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box}`}
                          value={!!inputExpectedSalesPrice ? inputExpectedSalesPrice : ""}
                          onChange={(e) => setInputExpectedSalesPrice(e.target.value)}
                          onBlur={() => {
                            setInputExpectedSalesPrice(
                              !!inputExpectedSalesPrice &&
                                inputExpectedSalesPrice !== "" &&
                                convertToYen(inputExpectedSalesPrice.trim()) !== null
                                ? (convertToYen(inputExpectedSalesPrice.trim()) as number).toLocaleString()
                                : ""
                            );
                          }}
                        />
                        {inputExpectedSalesPrice !== "" && (
                          <div className={`${styles.close_btn_number}`} onClick={() => setInputExpectedSalesPrice("")}>
                            <MdClose className="text-[20px] " />
                          </div>
                        )}
                      </>
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                  {/* input下追加ボタンエリア */}
                  {searchMode && (
                    <>
                      <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                        <div className={`line_first space-x-[6px]`}>
                          {isCopyableInputRange(inputExpectedSalesPriceSearch) && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputExpectedSalesPriceSearch);
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputExpectedSalesPriceSearch) ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputExpectedSalesPriceSearch, "range_string")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputExpectedSalesPriceSearch)}
                            >
                              {element}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {/* input下追加ボタンエリア */}
                </div>
              </div>
              {/* ------------------------------------------------ */}

              {/* 獲得予定年度・獲得予定半期 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title_search_mode}`}>獲得予定年度</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>獲得予定</span>
                      <span>年度</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      // placeholder="時"
                      value={inputExpectedOrderFiscalYear === null ? "" : inputExpectedOrderFiscalYear}
                      onChange={(e) => {
                        setInputExpectedOrderFiscalYear(e.target.value === "" ? null : Number(e.target.value));
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_year_expected`} value={year}>
                          {language === "ja" ? `${year}年度` : `FY ${year}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    {/* <span className={`${styles.title_search_mode}`}>獲得予定半期</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>獲得予定</span>
                      <span>半期</span>
                    </div>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      // data-text={`〜時台のデータを検索する場合は時間のみ、`}
                      // data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                      // onMouseEnter={(e) => {
                      //   handleOpenTooltip({ e, display: "top" });
                      // }}
                      // onMouseLeave={(e) => {
                      //   handleCloseTooltip();
                      // }}
                      // placeholder="時"
                      value={selectedExpectedOrderYearForHalf}
                      onChange={(e) => {
                        setSelectedExpectedOrderYearForHalf(e.target.value);
                        // handleCloseTooltip();
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_half_expected`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>
                    {/* <span className="mx-[10px]">年度</span> */}

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      // data-text={`〜時台のデータを検索する場合は時間のみ、`}
                      // data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                      // onMouseEnter={(e) => {
                      //   handleOpenTooltip({ e, display: "top" });
                      // }}
                      // onMouseLeave={(e) => {
                      //   handleCloseTooltip();
                      // }}
                      // placeholder="分"
                      value={selectedExpectedOrderHalf}
                      onChange={(e) => {
                        setSelectedExpectedOrderHalf(e.target.value);
                        // handleCloseTooltip();
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalHalf.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.key}
                        </option>
                      ))}
                    </select>
                    {/* <span className="mx-[10px]">分</span> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ------------------------------------------------ */}

              {/* 獲得予定四半期・獲得予定年月度 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title_search_mode}`}>獲得予定四半期</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>獲得予定</span>
                      <span>四半期</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      // data-text={`〜時台のデータを検索する場合は時間のみ、`}
                      // data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                      // onMouseEnter={(e) => {
                      //   handleOpenTooltip({ e, display: "top" });
                      // }}
                      // onMouseLeave={(e) => {
                      //   handleCloseTooltip();
                      // }}
                      // placeholder="時"
                      value={selectedExpectedOrderYearForQuarter}
                      onChange={(e) => {
                        setSelectedExpectedOrderYearForQuarter(e.target.value);
                        // handleCloseTooltip();
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_quarter_expected`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      // data-text={`〜時台のデータを検索する場合は時間のみ、`}
                      // data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                      // onMouseEnter={(e) => {
                      //   handleOpenTooltip({ e, display: "top" });
                      // }}
                      // onMouseLeave={(e) => {
                      //   handleCloseTooltip();
                      // }}
                      // placeholder="分"
                      value={selectedExpectedOrderQuarter}
                      onChange={(e) => {
                        setSelectedExpectedOrderQuarter(e.target.value);
                        // handleCloseTooltip();
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalQuarter.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.key}
                        </option>
                      ))}
                    </select>
                    {/* <span className="mx-[10px]">分</span> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    {/* <span className={`${styles.title_search_mode}`}>獲得予定年月度</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>獲得予定</span>
                      <span>年月度</span>
                    </div>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      // data-text={`〜時台のデータを検索する場合は時間のみ、`}
                      // data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                      // onMouseEnter={(e) => {
                      //   handleOpenTooltip({ e, display: "top" });
                      // }}
                      // onMouseLeave={(e) => {
                      //   handleCloseTooltip();
                      // }}
                      // placeholder="時"
                      value={selectedExpectedOrderYearForMonth}
                      onChange={(e) => {
                        setSelectedExpectedOrderYearForMonth(e.target.value);
                        // handleCloseTooltip();
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_month_expected`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      // data-text={`〜時台のデータを検索する場合は時間のみ、`}
                      // data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                      // onMouseEnter={(e) => {
                      //   handleOpenTooltip({ e, display: "top" });
                      // }}
                      // onMouseLeave={(e) => {
                      //   handleCloseTooltip();
                      // }}
                      // placeholder="分"
                      value={selectedExpectedOrderMonth}
                      onChange={(e) => {
                        setSelectedExpectedOrderMonth(e.target.value);
                        // handleCloseTooltip();
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalMonth.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.name[language]}
                        </option>
                      ))}
                    </select>
                    {/* <span className="mx-[10px]">分</span> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ------------------------------------------------ */}

              {/*  */}

              {/* 今・来期 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>今・来期</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputTermDivision}
                      onChange={(e) => {
                        setInputTermDivision(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsTermDivision.map((option) => (
                        <option key={option} value={option}>
                          {getTermDivision(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span
                        className={`${styles.value}`}
                      >
                        {selectedRowDataProperty?.product_sales ? selectedRowDataProperty?.product_sales : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 売上商品・売上台数 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上商品</span>
                    {["is null", "is not null"].includes(inputSoldProductName) ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputSoldProductName]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputSoldProductName]}</span>
                      </div>
                    ) : (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder=""
                        value={inputSoldProductName}
                        onChange={(e) => setInputSoldProductName(e.target.value)}
                      />
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
                            className={`icon_btn_red ${inputSoldProductName === "" ? `hidden` : `flex`}`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputSoldProductName)}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputSoldProductName)}
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
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上台数</span>

                    {inputUnitSalesSearch === "is null" || inputUnitSalesSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputUnitSalesSearch as IsNullNotNullText]}
                        <span className={`text-[13px]`}>
                          {nullNotNullTextMap[inputUnitSalesSearch as IsNullNotNullText]}
                        </span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="number"
                          min="0"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputUnitSalesSearch.min === null ? "" : inputUnitSalesSearch.min}
                          onChange={(e) => {
                            const val = e.target.value;
                            const numValue = Number(val);
                            if (val === "" || isNaN(numValue)) {
                              setInputUnitSalesSearch({
                                min: null,
                                max: inputUnitSalesSearch.max,
                              });
                            } else {
                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputUnitSalesSearch({
                                  min: 0,
                                  max: inputUnitSalesSearch.max,
                                });
                              } else {
                                setInputUnitSalesSearch({
                                  min: numValue,
                                  max: inputUnitSalesSearch.max,
                                });
                              }
                            }
                          }}
                        />

                        <span className="mx-[10px]">〜</span>

                        <input
                          type="number"
                          min="0"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputUnitSalesSearch.max === null ? "" : inputUnitSalesSearch.max}
                          onChange={(e) => {
                            const val = e.target.value;
                            const numValue = Number(val);
                            if (val === "" || isNaN(numValue)) {
                              setInputUnitSalesSearch({
                                min: inputUnitSalesSearch.min,
                                max: null,
                              });
                            } else {
                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputUnitSalesSearch({
                                  min: inputUnitSalesSearch.min,
                                  max: 0,
                                });
                              } else {
                                setInputUnitSalesSearch({
                                  min: inputUnitSalesSearch.min,
                                  max: numValue,
                                });
                              }
                            }
                          }}
                        />
                      </>
                    )}
                    {/* {["is null", "is not null"].includes(inputUnitSales as IsNullNotNullText) ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputUnitSales as IsNullNotNullText]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputUnitSales as IsNullNotNullText]}</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="number"
                          min="0"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={inputUnitSales === null ? "" : inputUnitSales}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setInputUnitSales(null);
                            } else {
                              const numValue = Number(val);

                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputUnitSales(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                              } else {
                                setInputUnitSales(numValue);
                              }
                            }
                          }}
                        />
                        {!!inputUnitSales && (
                          <div className={`${styles.close_btn_number}`} onClick={() => setInputUnitSales(null)}>
                            <MdClose className="text-[20px] " />
                          </div>
                        )}
                      </>
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                  {/* input下追加ボタンエリア */}
                  {searchMode && (
                    <>
                      <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                        <div className={`line_first space-x-[6px]`}>
                          {isCopyableInputRange(inputUnitSalesSearch, "number") && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputUnitSalesSearch, "number");
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputUnitSalesSearch, "number") ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputUnitSalesSearch, "range_number")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputUnitSalesSearch)}
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

              {/* 売上貢献区分・売上合計 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>売上貢献</span>
                      <span>区分</span>
                    </div>

                    {isNullNotNullSalesContributionCategory === "is null" ||
                    isNullNotNullSalesContributionCategory === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[isNullNotNullSalesContributionCategory]}
                        <span className={`text-[13px]`}>
                          {nullNotNullTextMap[isNullNotNullSalesContributionCategory]}
                        </span>
                      </div>
                    ) : (
                      <CustomSelectMultiple
                        stateArray={inputSalesContributionCategoryArray}
                        dispatch={setInputSalesContributionCategoryArray}
                        selectedSetObj={selectedSalesContributionCategoryArraySet}
                        options={optionsSalesContributionCategory}
                        getOptionName={getSalesContributionCategoryNameSearch}
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
                      value={inputSalesContributionCategory}
                      onChange={(e) => {
                        setInputSalesContributionCategory(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsSalesContributionCategory.map((option) => (
                        <option key={option} value={option}>
                          {getSalesContributionCategory(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                    </select> */}
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
                              isNullNotNullSalesContributionCategory === null &&
                              inputSalesContributionCategoryArray.length === 0
                                ? `hidden`
                                : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleResetArray("sales_contribution_category")}
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
                                  setIsNullNotNullSalesContributionCategory,
                                  "sales_contribution_category"
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
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上合計</span>

                    {inputSalesPriceSearch === "is null" || inputSalesPriceSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputSalesPriceSearch as IsNullNotNullText]}
                        <span className={`text-[13px]`}>
                          {nullNotNullTextMap[inputSalesPriceSearch as IsNullNotNullText]}
                        </span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} truncate`}
                          value={!!inputSalesPriceSearch.min ? inputSalesPriceSearch.min : ""}
                          onChange={(e) => setInputSalesPriceSearch({ ...inputSalesPriceSearch, min: e.target.value })}
                          onBlur={() => {
                            let newPrice = "";
                            if (!!inputSalesPriceSearch.min) {
                              const convertedPrice = convertToYen(inputSalesPriceSearch.min.trim());
                              if (convertedPrice !== null) newPrice = convertedPrice.toLocaleString();
                            }
                            setInputSalesPriceSearch({
                              ...inputSalesPriceSearch,
                              min: newPrice,
                            });
                          }}
                          onFocus={() =>
                            !!inputSalesPriceSearch.min &&
                            setInputSalesPriceSearch({
                              ...inputSalesPriceSearch,
                              min: inputSalesPriceSearch.min.replace(/[^\d.]/g, ""),
                            })
                          }
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            if (el.offsetWidth < el.scrollWidth)
                              handleOpenTooltip({ e, content: inputSalesPriceSearch.min });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        />

                        <span className="mx-[10px]">〜</span>

                        <input
                          type="text"
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} truncate`}
                          value={!!inputSalesPriceSearch.max ? inputSalesPriceSearch.max : ""}
                          onChange={(e) => setInputSalesPriceSearch({ ...inputSalesPriceSearch, max: e.target.value })}
                          onBlur={() => {
                            let newPrice = "";
                            if (!!inputSalesPriceSearch.max) {
                              const convertedPrice = convertToYen(inputSalesPriceSearch.max.trim());
                              if (convertedPrice !== null) newPrice = convertedPrice.toLocaleString();
                            }
                            setInputSalesPriceSearch({
                              ...inputSalesPriceSearch,
                              max: newPrice,
                            });
                          }}
                          onFocus={() =>
                            !!inputSalesPriceSearch.max &&
                            setInputSalesPriceSearch({
                              ...inputSalesPriceSearch,
                              max: inputSalesPriceSearch.max.replace(/[^\d.]/g, ""),
                            })
                          }
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            if (el.offsetWidth < el.scrollWidth)
                              handleOpenTooltip({ e, content: inputSalesPriceSearch.max });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        />
                      </>
                    )}
                    {/* {["is null", "is not null"].includes(inputSalesPrice) ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputSalesPrice]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputSalesPrice]}</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box}`}
                          value={!!inputSalesPrice ? inputSalesPrice : ""}
                          onChange={(e) => setInputSalesPrice(e.target.value)}
                          onBlur={() => {
                            if (!inputSalesPrice || inputSalesPrice === "") return setInputSalesPrice("");
                            const converted = convertToYen(inputSalesPrice.trim());
                            if (converted === null) return setInputSalesPrice("");
                            setInputSalesPrice(converted.toLocaleString());
                          }}
                        />
                        {inputSalesPrice !== "" && (
                          <div className={`${styles.close_btn_number}`} onClick={() => setInputSalesPrice("")}>
                            <MdClose className="text-[20px] " />
                          </div>
                        )}
                      </>
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                  {/* input下追加ボタンエリア */}
                  {searchMode && (
                    <>
                      <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                        <div className={`line_first space-x-[6px]`}>
                          {isCopyableInputRange(inputSalesPriceSearch) && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputSalesPriceSearch);
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${isEmptyInputRange(inputSalesPriceSearch) ? `hidden` : `flex`}`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputSalesPriceSearch, "range_string")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputSalesPriceSearch)}
                            >
                              {element}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {/* ------------------------------------------------ */}
              {/* </div>
              </div> */}

              {/* 値引価格・値引率 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>値引価格</span>

                    {inputDiscountedPriceSearch === "is null" || inputDiscountedPriceSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputDiscountedPriceSearch as IsNullNotNullText]}
                        <span className={`text-[13px]`}>
                          {nullNotNullTextMap[inputDiscountedPriceSearch as IsNullNotNullText]}
                        </span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} truncate`}
                          value={!!inputDiscountedPriceSearch.min ? inputDiscountedPriceSearch.min : ""}
                          onChange={(e) =>
                            setInputDiscountedPriceSearch({ ...inputDiscountedPriceSearch, min: e.target.value })
                          }
                          onBlur={() => {
                            let newPrice = "";
                            if (!!inputDiscountedPriceSearch.min) {
                              const convertedPrice = convertToYen(inputDiscountedPriceSearch.min.trim());
                              if (convertedPrice !== null) newPrice = convertedPrice.toLocaleString();
                            }
                            setInputDiscountedPriceSearch({
                              ...inputDiscountedPriceSearch,
                              min: newPrice,
                            });
                          }}
                          onFocus={() =>
                            !!inputDiscountedPriceSearch.min &&
                            setInputDiscountedPriceSearch({
                              ...inputDiscountedPriceSearch,
                              min: inputDiscountedPriceSearch.min.replace(/[^\d.]/g, ""),
                            })
                          }
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            if (el.offsetWidth < el.scrollWidth)
                              handleOpenTooltip({ e, content: inputDiscountedPriceSearch.min });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        />

                        <span className="mx-[10px]">〜</span>

                        <input
                          type="text"
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box} truncate`}
                          value={!!inputDiscountedPriceSearch.max ? inputDiscountedPriceSearch.max : ""}
                          onChange={(e) =>
                            setInputDiscountedPriceSearch({ ...inputDiscountedPriceSearch, max: e.target.value })
                          }
                          onBlur={() => {
                            let newPrice = "";
                            if (!!inputDiscountedPriceSearch.max) {
                              const convertedPrice = convertToYen(inputDiscountedPriceSearch.max.trim());
                              if (convertedPrice !== null) newPrice = convertedPrice.toLocaleString();
                            }
                            setInputDiscountedPriceSearch({
                              ...inputDiscountedPriceSearch,
                              max: newPrice,
                            });
                          }}
                          onFocus={() =>
                            !!inputDiscountedPriceSearch.max &&
                            setInputDiscountedPriceSearch({
                              ...inputDiscountedPriceSearch,
                              max: inputDiscountedPriceSearch.max.replace(/[^\d.]/g, ""),
                            })
                          }
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            if (el.offsetWidth < el.scrollWidth)
                              handleOpenTooltip({ e, content: inputDiscountedPriceSearch.max });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        />
                      </>
                    )}
                    {/* {["is null", "is not null"].includes(inputDiscountedPrice) ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputDiscountedPrice]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputDiscountedPrice]}</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          // placeholder="例：600万円 → 6000000　※半角で入力"
                          className={`${styles.input_box}`}
                          value={!!inputDiscountedPrice ? inputDiscountedPrice : ""}
                          onChange={(e) => setInputDiscountedPrice(e.target.value)}
                          onBlur={() => {
                            if (!inputDiscountedPrice || inputDiscountedPrice === "")
                              return setInputDiscountedPrice("");
                            const converted = convertToYen(inputDiscountedPrice.trim());
                            if (converted === null) return setInputDiscountedPrice("");
                            setInputDiscountedPrice(converted.toLocaleString());
                            // setInputDiscountedPrice(
                            //   !!inputDiscountedPrice && inputDiscountedPrice !== "" && convertToYen(inputDiscountedPrice.trim()) !== null
                            //     ? (convertToYen(inputDiscountedPrice.trim()) as number).toLocaleString()
                            //     : ""
                            // );
                          }}
                        />
                        {inputDiscountedPrice !== "" && (
                          <div className={`${styles.close_btn_number}`} onClick={() => setInputDiscountedPrice("")}>
                            <MdClose className="text-[20px] " />
                          </div>
                        )}
                      </>
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                  {/* input下追加ボタンエリア */}
                  {searchMode && (
                    <>
                      <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                        <div className={`line_first space-x-[6px]`}>
                          {isCopyableInputRange(inputDiscountedPriceSearch) && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputDiscountedPriceSearch);
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputDiscountedPriceSearch) ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputDiscountedPriceSearch, "range_string")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputDiscountedPriceSearch)}
                            >
                              {element}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {/* input下追加ボタンエリア */}
                </div>

                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>値引率</span>

                    {inputDiscountRateSearch === "is null" || inputDiscountRateSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputDiscountRateSearch as IsNullNotNullText]}
                        <span className={`text-[13px]`}>
                          {nullNotNullTextMap[inputDiscountRateSearch as IsNullNotNullText]}
                        </span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          // placeholder="例：3.9%の値引き → 3.9 or 3.9%　※半角で入力"
                          className={`${styles.input_box}`}
                          value={!!inputDiscountRateSearch.min ? `${inputDiscountRateSearch.min}` : ""}
                          onChange={(e) =>
                            setInputDiscountRateSearch({ ...inputDiscountRateSearch, min: e.target.value })
                          }
                          onBlur={() => {
                            const tempDiscountedRate = inputDiscountRateSearch.min.trim();
                            const newRate = normalizeDiscountRate(tempDiscountedRate, true);
                            setInputDiscountRateSearch({ ...inputDiscountRateSearch, min: !!newRate ? newRate : "" });
                          }}
                          onFocus={() =>
                            !!inputDiscountRateSearch.min &&
                            setInputDiscountRateSearch({
                              ...inputDiscountRateSearch,
                              min: inputDiscountRateSearch.min.replace(/[^\d.]/g, ""),
                            })
                          }
                        />

                        <span className="mx-[10px]">〜</span>

                        <input
                          type="text"
                          // placeholder="例：3.9%の値引き → 3.9 or 3.9%　※半角で入力"
                          className={`${styles.input_box}`}
                          value={!!inputDiscountRateSearch.max ? `${inputDiscountRateSearch.max}` : ""}
                          onChange={(e) =>
                            setInputDiscountRateSearch({ ...inputDiscountRateSearch, max: e.target.value })
                          }
                          onBlur={() => {
                            const tempDiscountedRate = inputDiscountRateSearch.max.trim();
                            const newRate = normalizeDiscountRate(tempDiscountedRate, true);
                            setInputDiscountRateSearch({ ...inputDiscountRateSearch, max: !!newRate ? newRate : "" });
                          }}
                          onFocus={() =>
                            !!inputDiscountRateSearch.max &&
                            setInputDiscountRateSearch({
                              ...inputDiscountRateSearch,
                              max: inputDiscountRateSearch.max.replace(/[^\d.]/g, ""),
                            })
                          }
                        />
                      </>
                    )}
                    {/* {["is null", "is not null"].includes(inputDiscountRate) ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputDiscountRate]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputDiscountRate]}</span>
                      </div>
                    ) : (
                      <>
                        <input
                          type="text"
                          // placeholder="例：3.9%の値引き → 3.9 or 3.9%　※半角で入力"
                          className={`${styles.input_box}`}
                          value={!!inputDiscountRate ? `${inputDiscountRate}` : ""}
                          onChange={(e) => setInputDiscountRate(e.target.value)}
                          onBlur={() => {
                            if (!inputDiscountRate || inputDiscountRate === "") return;
                            const tempDiscountedRate = inputDiscountRate.trim();
                            // const newRate = normalizeDiscountRate(tempDiscountedRate);
                            setInputDiscountRate(!!tempDiscountedRate ? tempDiscountedRate : "");
                          }}
                        />
                        {inputDiscountRate !== "" && (
                          <div className={`${styles.close_btn_number}`} onClick={() => setInputDiscountRate("")}>
                            <MdClose className="text-[20px] " />
                          </div>
                        )}
                      </>
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                  {/* input下追加ボタンエリア */}
                  {searchMode && (
                    <>
                      <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                        <div className={`line_first space-x-[6px]`}>
                          {isCopyableInputRange(inputDiscountRateSearch) && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputDiscountRateSearch);
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${isEmptyInputRange(inputDiscountRateSearch) ? `hidden` : `flex`}`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputDiscountRateSearch, "range_string")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputDiscountRateSearch)}
                            >
                              {element}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {/* input下追加ボタンエリア */}
                </div>
              </div>

              {/* 導入分類 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>導入分類</span>

                    {isNullNotNullSalesClass === "is null" || isNullNotNullSalesClass === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[isNullNotNullSalesClass]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullSalesClass]}</span>
                      </div>
                    ) : (
                      <CustomSelectMultiple
                        stateArray={inputSalesClassArray}
                        dispatch={setInputSalesClassArray}
                        selectedSetObj={selectedSalesClassArraySet}
                        options={optionsSalesClass}
                        getOptionName={getSalesClassNameSearch}
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
                      value={inputSalesClass}
                      onChange={(e) => {
                        setInputSalesClass(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsSalesClass.map((option) => (
                        <option key={option} value={option}>
                          {getSalesClass(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                    </select> */}
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
                              isNullNotNullSalesClass === null && inputSalesClassArray.length === 0 ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleResetArray("sales_class")}
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
                                handleClickAdditionalAreaBtn(index, setIsNullNotNullSalesClass, "sales_class")
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
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}>売上合計</span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.sales_price ? selectedRowDataProperty?.sales_price : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* サブスク分類 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title_search_mode} text-[12px]`}>サブスク分類</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>分類</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputSubscriptionInterval}
                      onChange={(e) => {
                        setInputSubscriptionInterval(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsSubscriptionInterval.map((option) => (
                        <option key={option} value={option}>
                          {getSubscriptionInterval(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                      {/* <option value="月額">月額</option>
                      <option value="年額">年額</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.discount_rate ? selectedRowDataProperty?.discount_rate : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* サブスク開始日・サブスク解約日 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>開始日</span>
                    </div>
                    {/* <DatePickerCustomInput
                      startDate={inputSubscriptionStartDate}
                      setStartDate={setInputSubscriptionStartDate}
                      required={false}
                    /> */}
                    {/* <DatePickerCustomInputForSearch
                      startDate={inputSubscriptionStartDate}
                      setStartDate={setInputSubscriptionStartDate}
                      required={false}
                      isNotNullForSearch={true}
                      handleOpenTooltip={handleOpenTooltip}
                      handleCloseTooltip={handleCloseTooltip}
                      tooltipDataText="サブスク開始日"
                      isNotNullText="サブスク開始日有りのデータのみ"
                      isNullText="サブスク開始日無しのデータのみ"
                      minHeight="!min-h-[30px]"
                    /> */}
                    {inputSubscriptionStartDateSearch === "is null" ||
                    inputSubscriptionStartDateSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputSubscriptionStartDateSearch]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputSubscriptionStartDateSearch]}</span>
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
                          startDate={inputSubscriptionStartDateSearch}
                          setStartDate={setInputSubscriptionStartDateSearch}
                          required={false}
                          handleOpenTooltip={handleOpenTooltip}
                          handleCloseTooltip={handleCloseTooltip}
                        />

                        <span className="mx-[10px]">〜</span>

                        <DatePickerCustomInputRange
                          minmax="max"
                          startDate={inputSubscriptionStartDateSearch}
                          setStartDate={setInputSubscriptionStartDateSearch}
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
                          {isCopyableInputRange(inputSubscriptionStartDateSearch, "date") && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputSubscriptionStartDateSearch, "date");
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputSubscriptionStartDateSearch, "date") ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputSubscriptionStartDateSearch, "range_date")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputSubscriptionStartDateSearch)}
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
                    {/* <span className={`${styles.title_search_mode} text-[12px]`}>サブスク解約日</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>サブスク</span>
                      <span>解約日</span>
                    </div>
                    {/* <DatePickerCustomInput
                      startDate={inputSubscriptionCanceledAt}
                      setStartDate={setInputSubscriptionCanceledAt}
                      required={false}
                    /> */}
                    {/* <DatePickerCustomInputForSearch
                      startDate={inputSubscriptionCanceledAt}
                      setStartDate={setInputSubscriptionCanceledAt}
                      required={false}
                      isNotNullForSearch={true}
                      handleOpenTooltip={handleOpenTooltip}
                      handleCloseTooltip={handleCloseTooltip}
                      tooltipDataText="サブスク解約日"
                      isNotNullText="サブスク解約日有りのデータのみ"
                      isNullText="サブスク解約日無しのデータのみ"
                      minHeight="!min-h-[30px]"
                    /> */}
                    {inputSubscriptionCanceledAtSearch === "is null" ||
                    inputSubscriptionCanceledAtSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputSubscriptionCanceledAtSearch]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputSubscriptionCanceledAtSearch]}</span>
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
                          startDate={inputSubscriptionCanceledAtSearch}
                          setStartDate={setInputSubscriptionCanceledAtSearch}
                          required={false}
                          handleOpenTooltip={handleOpenTooltip}
                          handleCloseTooltip={handleCloseTooltip}
                        />

                        <span className="mx-[10px]">〜</span>

                        <DatePickerCustomInputRange
                          minmax="max"
                          startDate={inputSubscriptionCanceledAtSearch}
                          setStartDate={setInputSubscriptionCanceledAtSearch}
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
                          {isCopyableInputRange(inputSubscriptionCanceledAtSearch, "date") && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputSubscriptionCanceledAtSearch, "date");
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputSubscriptionCanceledAtSearch, "date") ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputSubscriptionCanceledAtSearch, "range_date")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputSubscriptionCanceledAtSearch)}
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

              {/* リース分類 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>リース分類</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputLeaseDivision}
                      onChange={(e) => {
                        setInputLeaseDivision(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsLeaseDivision.map((option) => (
                        <option key={option} value={option}>
                          {getLeaseDivision(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                      {/* <option value="ファイナンスリース">ファイナンスリース</option>
                      <option value="オペレーティングリース">オペレーティングリース</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} text-[12px]`}></span>
                    {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataProperty?.discount_rate ? selectedRowDataProperty?.discount_rate : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* リース会社・リース完了予定日 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>リース会社</span>
                    {searchMode && (
                      <>
                        {["is null", "is not null"].includes(inputLeasingCompany) ? (
                          <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                            {nullNotNullIconMap[inputLeasingCompany]}
                            <span className={`text-[13px]`}>{nullNotNullTextMap[inputLeasingCompany]}</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputLeasingCompany}
                            onChange={(e) => setInputLeasingCompany(e.target.value)}
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
                            className={`icon_btn_red ${inputLeasingCompany === "" ? `hidden` : `flex`}`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputLeasingCompany)}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputLeasingCompany)}
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
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>リース完了</span>
                      <span>予定日</span>
                    </div>
                    {/* <DatePickerCustomInput
                      startDate={inputLeaseExpirationDate}
                      setStartDate={setInputLeaseExpirationDate}
                      required={false}
                    /> */}
                    {/* <DatePickerCustomInputForSearch
                      startDate={inputLeaseExpirationDate}
                      setStartDate={setInputLeaseExpirationDate}
                      required={false}
                      isNotNullForSearch={true}
                      handleOpenTooltip={handleOpenTooltip}
                      handleCloseTooltip={handleCloseTooltip}
                      tooltipDataText="リース完了予定日"
                      isNotNullText="リース完了予定日有りのデータのみ"
                      isNullText="リース完了予定日無しのデータのみ"
                      minHeight="!min-h-[30px]"
                    /> */}
                    {inputLeaseExpirationDateSearch === "is null" ||
                    inputLeaseExpirationDateSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputLeaseExpirationDateSearch]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputLeaseExpirationDateSearch]}</span>
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
                          startDate={inputLeaseExpirationDateSearch}
                          setStartDate={setInputLeaseExpirationDateSearch}
                          required={false}
                          handleOpenTooltip={handleOpenTooltip}
                          handleCloseTooltip={handleCloseTooltip}
                        />

                        <span className="mx-[10px]">〜</span>

                        <DatePickerCustomInputRange
                          minmax="max"
                          startDate={inputLeaseExpirationDateSearch}
                          setStartDate={setInputLeaseExpirationDateSearch}
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
                          {isCopyableInputRange(inputLeaseExpirationDateSearch, "date") && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputLeaseExpirationDateSearch, "date");
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputLeaseExpirationDateSearch, "date") ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputLeaseExpirationDateSearch, "range_date")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputLeaseExpirationDateSearch)}
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

              {/* 展開日付・売上日付 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>展開日付</span>
                    {/* <DatePickerCustomInput
                      startDate={inputExpansionDate}
                      setStartDate={setInputExpansionDate}
                      required={false}
                    /> */}
                    {/* <DatePickerCustomInputForSearch
                      startDate={inputExpansionDate}
                      setStartDate={setInputExpansionDate}
                      required={false}
                      isNotNullForSearch={true}
                      handleOpenTooltip={handleOpenTooltip}
                      handleCloseTooltip={handleCloseTooltip}
                      tooltipDataText="展開日付"
                      isNotNullText="展開日付有りのデータのみ"
                      isNullText="展開日付無しのデータのみ"
                      minHeight="!min-h-[30px]"
                    /> */}
                    {inputExpansionDateSearch === "is null" || inputExpansionDateSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputExpansionDateSearch]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputExpansionDateSearch]}</span>
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
                          startDate={inputExpansionDateSearch}
                          setStartDate={setInputExpansionDateSearch}
                          required={false}
                          handleOpenTooltip={handleOpenTooltip}
                          handleCloseTooltip={handleCloseTooltip}
                        />

                        <span className="mx-[10px]">〜</span>

                        <DatePickerCustomInputRange
                          minmax="max"
                          startDate={inputExpansionDateSearch}
                          setStartDate={setInputExpansionDateSearch}
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
                          {isCopyableInputRange(inputExpansionDateSearch, "date") && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputExpansionDateSearch, "date");
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputExpansionDateSearch, "date") ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputExpansionDateSearch, "range_date")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputExpansionDateSearch)}
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
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上日付</span>
                    {/* <DatePickerCustomInput
                      startDate={inputSalesDate}
                      setStartDate={setInputSalesDate}
                      required={false}
                    /> */}
                    {/* <DatePickerCustomInputForSearch
                      startDate={inputSalesDate}
                      setStartDate={setInputSalesDate}
                      required={false}
                      isNotNullForSearch={true}
                      handleOpenTooltip={handleOpenTooltip}
                      handleCloseTooltip={handleCloseTooltip}
                      tooltipDataText="売上日付"
                      isNotNullText="売上日付有りのデータのみ"
                      isNullText="売上日付無しのデータのみ"
                      minHeight="!min-h-[30px]"
                    /> */}
                    {inputSalesDateSearch === "is null" || inputSalesDateSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputSalesDateSearch]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputSalesDateSearch]}</span>
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
                          startDate={inputSalesDateSearch}
                          setStartDate={setInputSalesDateSearch}
                          required={false}
                          handleOpenTooltip={handleOpenTooltip}
                          handleCloseTooltip={handleCloseTooltip}
                        />

                        <span className="mx-[10px]">〜</span>

                        <DatePickerCustomInputRange
                          minmax="max"
                          startDate={inputSalesDateSearch}
                          setStartDate={setInputSalesDateSearch}
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
                          {isCopyableInputRange(inputSalesDateSearch, "date") && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputSalesDateSearch, "date");
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputSalesDateSearch, "date") ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputSalesDateSearch, "range_date")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputSalesDateSearch)}
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
              {/* ------------------------------------------------ */}

              {/* 展開年月度・売上年月度 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>展開年月度</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedExpansionYearForMonth}
                      onChange={(e) => {
                        setSelectedExpansionYearForMonth(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_month_expansion`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedExpansionMonth}
                      onChange={(e) => {
                        setSelectedExpansionMonth(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalMonth.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.name[language]}
                        </option>
                      ))}
                    </select>
                    {/* <span className="mx-[10px]">分</span> */}
                    {/* <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputExpansionYearMonth === null ? "" : inputExpansionYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputExpansionYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputExpansionYearMonth(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputExpansionYearMonth(numValue);
                          }
                        }
                      }}
                    />
                    {!!inputExpansionYearMonth && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputExpansionYearMonth(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上年月度</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedSalesYearForMonth}
                      onChange={(e) => {
                        setSelectedSalesYearForMonth(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_month_sales`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedSalesMonth}
                      onChange={(e) => {
                        setSelectedSalesMonth(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalMonth.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.name[language]}
                        </option>
                      ))}
                    </select>
                    {/* <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputSalesYearMonth === null ? "" : inputSalesYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputSalesYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setInputSalesYearMonth(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setInputSalesYearMonth(numValue);
                          }
                        }
                      }}
                    />
                    {!!inputSalesYearMonth && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputSalesYearMonth(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )} */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ------------------------------------------------ */}

              {/* 展開四半期・売上四半期 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>展開四半期</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedExpansionYearForQuarter}
                      onChange={(e) => {
                        setSelectedExpansionYearForQuarter(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_quarter_expansion`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedExpansionQuarter}
                      onChange={(e) => {
                        setSelectedExpansionQuarter(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalQuarter.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.key}
                        </option>
                      ))}
                    </select>
                    {/* <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      value={inputExpansionQuarter === null ? "" : inputExpansionQuarter.toString()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputExpansionQuarter(null);
                        } else {
                          setInputExpansionQuarter(Number(val));
                        }
                      }}
                    >
                      <option value=""></option>
                      {optionsYearQuarter.map((option) => (
                        <option key={option} value={option.toString()}>
                          {option}Q
                        </option>
                      ))}
                    </select> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上四半期</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedSalesYearForQuarter}
                      onChange={(e) => {
                        setSelectedSalesYearForQuarter(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_quarter_sales`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedSalesQuarter}
                      onChange={(e) => {
                        setSelectedSalesQuarter(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalQuarter.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.key}
                        </option>
                      ))}
                    </select>
                    {/* <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      value={inputSalesQuarter === null ? "" : inputSalesQuarter.toString()}
                      // onChange={(e) => setInputSalesQuarter(Number(e.target.value))}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setInputSalesQuarter(null);
                        } else {
                          setInputSalesQuarter(Number(val));
                        }
                      }}
                    >
                      <option value=""></option>
                      {optionsYearQuarter.map((option) => (
                        <option key={option} value={option.toString()}>
                          {option}Q
                        </option>
                      ))}
                    </select> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ------------------------------------------------ */}

              {/* 展開半期・売上半期 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>展開半期</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedExpansionYearForHalf}
                      onChange={(e) => {
                        setSelectedExpansionYearForHalf(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_half_expansion`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedExpansionHalf}
                      onChange={(e) => {
                        setSelectedExpansionHalf(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalHalf.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.key}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上半期</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedSalesYearForHalf}
                      onChange={(e) => {
                        setSelectedSalesYearForHalf(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_half_sales`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedSalesHalf}
                      onChange={(e) => {
                        setSelectedSalesHalf(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalHalf.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.key}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ------------------------------------------------ */}

              {/* 展開年度・売上年度 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>展開年度</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputExpansionFiscalYear === null ? "" : inputExpansionFiscalYear}
                      onChange={(e) => {
                        setInputExpansionFiscalYear(e.target.value === "" ? null : Number(e.target.value));
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_year_expansion`} value={year}>
                          {language === "ja" ? `${year}年度` : `FY ${year}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>売上年度</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputSalesFiscalYear === null ? "" : inputSalesFiscalYear}
                      onChange={(e) => {
                        setInputSalesFiscalYear(e.target.value === "" ? null : Number(e.target.value));
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_year_sales`} value={year}>
                          {language === "ja" ? `${year}年度` : `FY ${year}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ------------------------------------------------ */}

              {/* 案件発生年度・案件発生半期 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>案件発生</span>
                      <span>年度</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={inputPropertyFiscalYear === null ? "" : inputPropertyFiscalYear}
                      onChange={(e) => {
                        setInputPropertyFiscalYear(e.target.value === "" ? null : Number(e.target.value));
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_year_property`} value={year}>
                          {language === "ja" ? `${year}年度` : `FY ${year}`}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>案件発生</span>
                      <span>半期</span>
                    </div>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedPropertyYearForHalf}
                      onChange={(e) => {
                        setSelectedPropertyYearForHalf(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_half_property`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedPropertyHalf}
                      onChange={(e) => {
                        setSelectedPropertyHalf(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalHalf.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.key}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ------------------------------------------------ */}

              {/* 案件発生四半期・案件発生年月度 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>案件発生</span>
                      <span>四半期</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedPropertyYearForQuarter}
                      onChange={(e) => {
                        setSelectedPropertyYearForQuarter(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_quarter_property`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedPropertyQuarter}
                      onChange={(e) => {
                        setSelectedPropertyQuarter(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalQuarter.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.key}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>案件発生</span>
                      <span>年月度</span>
                    </div>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedPropertyYearForMonth}
                      onChange={(e) => {
                        setSelectedPropertyYearForMonth(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalYear.map((year) => (
                        <option key={`${year}_month_property`} value={year}>
                          {year}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">年</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                      value={selectedPropertyMonth}
                      onChange={(e) => {
                        setSelectedPropertyMonth(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsFiscalMonth.map((obj) => (
                        <option key={obj.key} value={obj.value}>
                          {obj.name[language]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ------------------------------------------------ */}

              {/* 事業部名 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>事業部名</span>
                    {searchMode && (
                      <select
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputPropertyCreatedByDepartmentOfUser}
                        // onChange={(e) => setInputPropertyCreatedByDepartmentOfUser(e.target.value)}
                        onChange={(e) => {
                          setInputPropertyCreatedByDepartmentOfUser(e.target.value);
                          // 課と係をリセットする
                          setInputPropertyCreatedBySectionOfUser("");
                          setInputPropertyCreatedByUnitOfUser("");
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
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>係・ﾁｰﾑ</span>
                    {searchMode && filteredUnitBySelectedSection && filteredUnitBySelectedSection.length >= 1 && (
                      <select
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputPropertyCreatedByUnitOfUser}
                        onChange={(e) => setInputPropertyCreatedByUnitOfUser(e.target.value)}
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
                    <span className={`${styles.title_search_mode}`}>課・ｾｸｼｮﾝ</span>

                    {searchMode &&
                      filteredSectionBySelectedDepartment &&
                      filteredSectionBySelectedDepartment.length >= 1 && (
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputPropertyCreatedBySectionOfUser}
                          onChange={(e) => {
                            setInputPropertyCreatedBySectionOfUser(e.target.value);
                            // 係をリセットする
                            setInputPropertyCreatedByUnitOfUser("");
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
                    <span className={`${styles.title_search_mode}`}>自社担当</span>
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder=""
                        value={inputPropertyMemberName}
                        onChange={(e) => setInputPropertyMemberName(e.target.value)}
                      />
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 事業所・自社担当 */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>事業所</span>
                    {searchMode && (
                      <select
                        className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                        value={inputPropertyCreatedByOfficeOfUser}
                        onChange={(e) => setInputPropertyCreatedByOfficeOfUser(e.target.value)}
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
                    <span className={`${styles.title_search_mode}`}>自社担当</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputPropertyMemberName}
                      onChange={(e) => setInputPropertyMemberName(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* ============= 予定エリアここまで ============= */}

              {/* ============= 結果エリアここから ============= */}

              {/* 月初確度・中間見直確度 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} !mt-[20px] flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title_search_mode}`}>月初確度</span>

                    {isNullNotNullOrderCertaintyStartOfMonth === "is null" ||
                    isNullNotNullOrderCertaintyStartOfMonth === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[isNullNotNullOrderCertaintyStartOfMonth]}
                        <span className={`text-[13px]`}>
                          {nullNotNullTextMap[isNullNotNullOrderCertaintyStartOfMonth]}
                        </span>
                      </div>
                    ) : (
                      <CustomSelectMultiple
                        stateArray={inputOrderCertaintyStartOfMonthArray}
                        dispatch={setInputOrderCertaintyStartOfMonthArray}
                        selectedSetObj={selectedOrderCertaintyStartOfMonthArraySet}
                        options={optionsOrderCertaintyStartOfMonth}
                        getOptionName={getOrderCertaintyStartOfMonthNameSearch}
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
                      value={inputOrderCertaintyStartOfMonth}
                      onChange={(e) => {
                        setInputOrderCertaintyStartOfMonth(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsOrderCertaintyStartOfMonth.map((option) => (
                        <option key={option} value={`${option}`}>
                          {getOrderCertaintyStartOfMonth(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                    </select> */}
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
                              isNullNotNullOrderCertaintyStartOfMonth === null &&
                              inputOrderCertaintyStartOfMonthArray.length === 0
                                ? `hidden`
                                : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleResetArray("order_certainty_start_of_month")}
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
                                  setIsNullNotNullOrderCertaintyStartOfMonth,
                                  "order_certainty_start_of_month"
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
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title_search_mode}`}>中間見直確度</span>

                    {isNullNotNullReviewOrderCertainty === "is null" ||
                    isNullNotNullReviewOrderCertainty === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[isNullNotNullReviewOrderCertainty]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullReviewOrderCertainty]}</span>
                      </div>
                    ) : (
                      <CustomSelectMultiple
                        stateArray={inputReviewOrderCertaintyArray}
                        dispatch={setInputReviewOrderCertaintyArray}
                        selectedSetObj={selectedReviewOrderCertaintyArraySet}
                        options={optionsOrderCertaintyStartOfMonth}
                        getOptionName={getReviewOrderCertaintyNameSearch}
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
                      value={inputReviewOrderCertainty}
                      onChange={(e) => {
                        setInputReviewOrderCertainty(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsOrderCertaintyStartOfMonth.map((option) => (
                        <option key={option} value={`${option}`}>
                          {getOrderCertaintyStartOfMonth(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                    </select> */}
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
                              isNullNotNullReviewOrderCertainty === null && inputReviewOrderCertaintyArray.length === 0
                                ? `hidden`
                                : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleResetArray("review_order_certainty")}
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
                                  setIsNullNotNullReviewOrderCertainty,
                                  "review_order_certainty"
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

              {/* リピート・案件介入(責任者) サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode}`}>
                      <span className={``}>リピート</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      // value={inputClaimFlag}
                      // onChange={(e) => setInputClaimFlag(e.target.value)}
                      value={
                        inputRepeatFlag === null
                          ? // ? "指定なし"
                            ""
                          : inputRepeatFlag
                          ? "チェック有り"
                          : "チェック無し"
                      }
                      onChange={handleRepeatCheckChangeSelectTagValue}
                    >
                      {/* <option value="指定なし">指定なし</option> */}
                      <option value=""></option>
                      <option value="チェック無し">チェック無し</option>
                      <option value="チェック有り">チェック有り</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>

                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>案件介入</span>
                      <span>(責任者)</span>
                    </div>

                    <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      // value={inputClaimFlag}
                      // onChange={(e) => setInputClaimFlag(e.target.value)}
                      value={
                        inputStepInFlag === null
                          ? // ? "指定なし"
                            ""
                          : inputStepInFlag
                          ? "チェック有り"
                          : "チェック無し"
                      }
                      onChange={handleStepInCheckChangeSelectTagValue}
                    >
                      {/* <option value="指定なし">指定なし</option> */}
                      <option value=""></option>
                      <option value="チェック無し">チェック無し</option>
                      <option value="チェック有り">チェック有り</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* ペンディング・案件没 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode}`}>
                      <span className={``}>ペンディング</span>
                    </div>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      // value={inputClaimFlag}
                      // onChange={(e) => setInputClaimFlag(e.target.value)}
                      value={
                        inputPendingFlag === null
                          ? // ? "指定なし"
                            ""
                          : inputPendingFlag
                          ? "チェック有り"
                          : "チェック無し"
                      }
                      onChange={handlePendingCheckChangeSelectTagValue}
                    >
                      {/* <option value="指定なし">指定なし</option> */}
                      <option value=""></option>
                      <option value="チェック無し">チェック無し</option>
                      <option value="チェック有り">チェック有り</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>

                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                    <span className={`${styles.check_title_search_mode}`}>案件没</span>

                    <select
                      className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                      // value={inputClaimFlag}
                      // onChange={(e) => setInputClaimFlag(e.target.value)}
                      value={
                        inputRejectedFlag === null
                          ? // ? "指定なし"
                            ""
                          : inputRejectedFlag
                          ? "チェック有り"
                          : "チェック無し"
                      }
                      onChange={handleRejectedCheckChangeSelectTagValue}
                    >
                      {/* <option value="指定なし">指定なし</option> */}
                      <option value=""></option>
                      <option value="チェック無し">チェック無し</option>
                      <option value="チェック有り">チェック有り</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 競合発生日・競合状況 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>競合発生日</span>
                    {/* <DatePickerCustomInput
                      startDate={inputCompetitorAppearanceDate}
                      setStartDate={setInputCompetitorAppearanceDate}
                      required={false}
                    /> */}
                    {/* <DatePickerCustomInputForSearch
                      startDate={inputCompetitorAppearanceDate}
                      setStartDate={setInputCompetitorAppearanceDate}
                      required={false}
                      isNotNullForSearch={true}
                      handleOpenTooltip={handleOpenTooltip}
                      handleCloseTooltip={handleCloseTooltip}
                      tooltipDataText="競合発生日"
                      isNotNullText="競合発生日有りのデータのみ"
                      isNullText="競合発生日無しのデータのみ"
                      minHeight="!min-h-[30px]"
                    /> */}
                    {inputCompetitorAppearanceDateSearch === "is null" ||
                    inputCompetitorAppearanceDateSearch === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[inputCompetitorAppearanceDateSearch]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[inputCompetitorAppearanceDateSearch]}</span>
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
                          startDate={inputCompetitorAppearanceDateSearch}
                          setStartDate={setInputCompetitorAppearanceDateSearch}
                          required={false}
                          handleOpenTooltip={handleOpenTooltip}
                          handleCloseTooltip={handleCloseTooltip}
                        />

                        <span className="mx-[10px]">〜</span>

                        <DatePickerCustomInputRange
                          minmax="max"
                          startDate={inputCompetitorAppearanceDateSearch}
                          setStartDate={setInputCompetitorAppearanceDateSearch}
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
                          {isCopyableInputRange(inputCompetitorAppearanceDateSearch, "date") && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputCompetitorAppearanceDateSearch, "date");
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputCompetitorAppearanceDateSearch, "date") ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputCompetitorAppearanceDateSearch, "range_date")}
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
                                handleClickAdditionalAreaBtn(index, setInputCompetitorAppearanceDateSearch)
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
                    <span className={`${styles.title_search_mode}`}>競合状況</span>

                    {isNullNotNullCompetitionState === "is null" || isNullNotNullCompetitionState === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[isNullNotNullCompetitionState]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullCompetitionState]}</span>
                      </div>
                    ) : (
                      <CustomSelectMultiple
                        stateArray={inputCompetitionStateArray}
                        dispatch={setInputCompetitionStateArray}
                        selectedSetObj={selectedCompetitionStateArraySet}
                        options={optionsCompetitionState}
                        getOptionName={getCompetitionStateNameSearch}
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
                      value={inputCompetitionState}
                      onChange={(e) => {
                        setInputCompetitionState(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsOrderCertaintyStartOfMonth.map((option) => (
                        <option key={option} value={option}>
                          {getOrderCertaintyStartOfMonth(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                    </select> */}
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
                              isNullNotNullCompetitionState === null && inputCompetitionStateArray.length === 0
                                ? `hidden`
                                : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleResetArray("competition_state")}
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
                                  setIsNullNotNullCompetitionState,
                                  "competition_state"
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

              {/* 競合会社 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[70px] w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode}`}>競合会社</span>
                    {searchMode && (
                      <>
                        {["is null", "is not null"].includes(inputCompetitor) ? (
                          <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                            {nullNotNullIconMap[inputCompetitor]}
                            <span className={`text-[13px]`}>{nullNotNullTextMap[inputCompetitor]}</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputCompetitor}
                            onChange={(e) => setInputCompetitor(e.target.value)}
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
                            className={`icon_btn_red ${inputCompetitor === "" ? `hidden` : `flex`}`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputCompetitor)}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputCompetitor)}
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

              {/* 競合商品 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[70px] w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode}`}>競合商品</span>
                    {searchMode && (
                      <>
                        {["is null", "is not null"].includes(inputCompetitorProduct) ? (
                          <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                            {nullNotNullIconMap[inputCompetitorProduct]}
                            <span className={`text-[13px]`}>{nullNotNullTextMap[inputCompetitorProduct]}</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            className={`${styles.input_box}`}
                            placeholder=""
                            value={inputCompetitorProduct}
                            onChange={(e) => setInputCompetitorProduct(e.target.value)}
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
                            className={`icon_btn_red ${inputCompetitorProduct === "" ? `hidden` : `flex`}`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputCompetitorProduct)}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputCompetitorProduct)}
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

              {/* 案件発生動機・動機詳細 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span>案件発生</span>
                      <span>動機</span>
                    </div>

                    {isNullNotNullReasonClass === "is null" || isNullNotNullReasonClass === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[isNullNotNullReasonClass]}
                        <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullReasonClass]}</span>
                      </div>
                    ) : (
                      <CustomSelectMultiple
                        stateArray={inputReasonClassArray}
                        dispatch={setInputReasonClassArray}
                        selectedSetObj={selectedReasonClassArraySet}
                        options={optionsReasonClass}
                        getOptionName={getReasonClassNameSearch}
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
                      value={inputReasonClass}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("訪問目的を選択してください");
                        setInputReasonClass(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsReasonClass.map((option) => (
                        <option key={option} value={option}>
                          {getReasonClass(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                    </select> */}
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
                              isNullNotNullReasonClass === null && inputReasonClassArray.length === 0
                                ? `hidden`
                                : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleResetArray("reason_class")}
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
                                handleClickAdditionalAreaBtn(index, setIsNullNotNullReasonClass, "reason_class")
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
                    <span className={`${styles.title_search_mode}`}>動機詳細</span>
                    {searchMode && (
                      <>
                        {["is null", "is not null"].includes(inputReasonDetail) ? (
                          <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                            {nullNotNullIconMap[inputReasonDetail]}
                            <span className={`text-[13px]`}>{nullNotNullTextMap[inputReasonDetail]}</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            className={`${styles.input_box} truncate`}
                            placeholder=""
                            value={inputReasonDetail}
                            onChange={(e) => setInputReasonDetail(e.target.value)}
                            onMouseEnter={(e) => {
                              const el = e.currentTarget;
                              if (el.offsetWidth < el.scrollWidth) handleOpenTooltip({ e, content: inputReasonDetail });
                            }}
                            onMouseLeave={handleCloseTooltip}
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
                            className={`icon_btn_red ${inputReasonDetail === "" ? `hidden` : `flex`}`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputReasonDetail)}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputReasonDetail)}
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

              {/* 客先予算・決裁者商談有無 */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>客先予算</span>
                    {searchMode && (
                      <>
                        {inputCustomerBudgetSearch === "is null" || inputCustomerBudgetSearch === "is not null" ? (
                          <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                            {nullNotNullIconMap[inputCustomerBudgetSearch as IsNullNotNullText]}
                            <span className={`text-[13px]`}>
                              {nullNotNullTextMap[inputCustomerBudgetSearch as IsNullNotNullText]}
                            </span>
                          </div>
                        ) : (
                          <>
                            <input
                              type="text"
                              // placeholder="例：600万円 → 6000000　※半角で入力"
                              className={`${styles.input_box} truncate`}
                              value={!!inputCustomerBudgetSearch.min ? inputCustomerBudgetSearch.min : ""}
                              onChange={(e) =>
                                setInputCustomerBudgetSearch({ ...inputCustomerBudgetSearch, min: e.target.value })
                              }
                              onBlur={() => {
                                let newPrice = "";
                                if (!!inputCustomerBudgetSearch.min) {
                                  const convertedPrice = convertToYen(inputCustomerBudgetSearch.min.trim());
                                  if (convertedPrice !== null) newPrice = convertedPrice.toLocaleString();
                                }
                                setInputCustomerBudgetSearch({
                                  ...inputCustomerBudgetSearch,
                                  min: newPrice,
                                });
                              }}
                              onFocus={() =>
                                !!inputCustomerBudgetSearch.min &&
                                setInputCustomerBudgetSearch({
                                  ...inputCustomerBudgetSearch,
                                  min: inputCustomerBudgetSearch.min.replace(/[^\d.]/g, ""),
                                })
                              }
                              onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                if (el.offsetWidth < el.scrollWidth)
                                  handleOpenTooltip({ e, content: inputCustomerBudgetSearch.min });
                              }}
                              onMouseLeave={handleCloseTooltip}
                            />

                            <span className="mx-[10px]">〜</span>

                            <input
                              type="text"
                              // placeholder="例：600万円 → 6000000　※半角で入力"
                              className={`${styles.input_box} truncate`}
                              value={!!inputCustomerBudgetSearch.max ? inputCustomerBudgetSearch.max : ""}
                              onChange={(e) =>
                                setInputCustomerBudgetSearch({ ...inputCustomerBudgetSearch, max: e.target.value })
                              }
                              onBlur={() => {
                                let newPrice = "";
                                if (!!inputCustomerBudgetSearch.max) {
                                  const convertedPrice = convertToYen(inputCustomerBudgetSearch.max.trim());
                                  if (convertedPrice !== null) newPrice = convertedPrice.toLocaleString();
                                }
                                setInputCustomerBudgetSearch({
                                  ...inputCustomerBudgetSearch,
                                  max: newPrice,
                                });
                              }}
                              onFocus={() =>
                                !!inputCustomerBudgetSearch.max &&
                                setInputCustomerBudgetSearch({
                                  ...inputCustomerBudgetSearch,
                                  max: inputCustomerBudgetSearch.max.replace(/[^\d.]/g, ""),
                                })
                              }
                              onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                if (el.offsetWidth < el.scrollWidth)
                                  handleOpenTooltip({ e, content: inputCustomerBudgetSearch.max });
                              }}
                              onMouseLeave={handleCloseTooltip}
                            />
                          </>
                        )}
                        {/* {["is null", "is not null"].includes(inputCustomerBudget) ? (
                          <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                            {nullNotNullIconMap[inputCustomerBudget]}
                            <span className={`text-[13px]`}>{nullNotNullTextMap[inputCustomerBudget]}</span>
                          </div>
                        ) : (
                          <>
                            <input
                              type="text"
                              // placeholder="例：600万円 → 6000000　※半角で入力"
                              className={`${styles.input_box}`}
                              value={!!inputCustomerBudget ? inputCustomerBudget : ""}
                              onChange={(e) => setInputCustomerBudget(e.target.value)}
                              onBlur={() => {
                                setInputCustomerBudget(
                                  !!inputCustomerBudget &&
                                    inputCustomerBudget !== "" &&
                                    convertToYen(inputCustomerBudget.trim()) !== null
                                    ? (convertToYen(inputCustomerBudget.trim()) as number).toLocaleString()
                                    : ""
                                );
                              }}
                            />
                            {inputCustomerBudget !== "" && (
                              <div className={`${styles.close_btn_number}`} onClick={() => setInputCustomerBudget("")}>
                                <MdClose className="text-[20px] " />
                              </div>
                            )}
                          </>
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
                          {isCopyableInputRange(inputCustomerBudgetSearch) && (
                            <button
                              type="button"
                              className={`icon_btn_green flex`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => {
                                copyInputRange(setInputCustomerBudgetSearch);
                                handleCloseTooltip();
                              }}
                            >
                              <LuCopyPlus className="pointer-events-none text-[14px]" />
                            </button>
                          )}
                          <button
                            type="button"
                            className={`icon_btn_red ${
                              isEmptyInputRange(inputCustomerBudgetSearch) ? `hidden` : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleClickResetInput(setInputCustomerBudgetSearch, "range_string")}
                          >
                            <MdClose className="pointer-events-none text-[14px]" />
                          </button>
                          {firstLineComponents.map((element, index) => (
                            <div
                              key={`additional_search_area_under_input_btn_f_${index}`}
                              className={`btn_f space-x-[3px]`}
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
                              onMouseLeave={handleCloseTooltip}
                              onClick={() => handleClickAdditionalAreaBtn(index, setInputCustomerBudgetSearch)}
                            >
                              {element}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {/* input下追加ボタンエリア */}
                </div>

                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <div className={`${styles.title_search_mode} ${styles.double_text} flex flex-col`}>
                      <span>決裁者</span>
                      <span>商談有無</span>
                    </div>

                    {isNullNotNullDecisionMakerNegotiation === "is null" ||
                    isNullNotNullDecisionMakerNegotiation === "is not null" ? (
                      <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                        {nullNotNullIconMap[isNullNotNullDecisionMakerNegotiation]}
                        <span className={`text-[13px]`}>
                          {nullNotNullTextMap[isNullNotNullDecisionMakerNegotiation]}
                        </span>
                      </div>
                    ) : (
                      <CustomSelectMultiple
                        stateArray={inputDecisionMakerNegotiationArray}
                        dispatch={setInputDecisionMakerNegotiationArray}
                        selectedSetObj={selectedDecisionMakerNegotiationArraySet}
                        options={optionsDecisionMakerNegotiation}
                        getOptionName={getDecisionMakerNegotiationNameSearch}
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
                      value={inputDecisionMakerNegotiation}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("活動タイプを選択してください");
                        setInputDecisionMakerNegotiation(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsDecisionMakerNegotiation.map((option) => (
                        <option key={option} value={option}>
                          {getDecisionMakerNegotiation(option)}
                        </option>
                      ))}
                      <option value="is not null">入力有りのデータのみ</option>
                      <option value="is null">入力無しのデータのみ</option>
                    </select> */}
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
                              isNullNotNullDecisionMakerNegotiation === null &&
                              inputDecisionMakerNegotiationArray.length === 0
                                ? `hidden`
                                : `flex`
                            }`}
                            onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をリセット` })}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => handleResetArray("decision_maker_negotiation")}
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
                                  setIsNullNotNullDecisionMakerNegotiation,
                                  "decision_maker_negotiation"
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

              {/* ============= 結果エリアここまで ============= */}

              {/* ============= 会社情報エリアここから ============= */}
              {/* 会社情報 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} !mt-[20px] flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.section_title}`}>会社情報</span>

                    {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataProperty?.company_name ? selectedRowDataProperty?.company_name : ""}
                      </span> */}
                  </div>
                  <div className={`${styles.section_underline}`}></div>
                </div>
              </div>
              {/* ●会社名 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>●会社名</span>
                    {searchMode && (
                      <input
                        type="text"
                        placeholder="株式会社○○"
                        // autoFocus
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
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>●部署名</span>
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
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>担当者名</span>
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
                    <span className={`${styles.title_search_mode}`}>直通TEL</span>
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
                            className={`icon_btn_red ${inputDirectLine === "" ? `hidden` : `flex`}`}
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>内線TEL</span>
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
                            className={`icon_btn_red ${inputExtension === "" ? `hidden` : `flex`}`}
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
                    <span className={`${styles.title_search_mode}`}>代表TEL</span>
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
                  {/* input下追加ボタンエリア */}
                  {searchMode && (
                    <>
                      <div className={`additional_search_area_under_input fade05_forward hidden group-hover:flex`}>
                        <div className={`line_first space-x-[6px]`}>
                          <button
                            type="button"
                            className={`icon_btn_red ${inputTel === "" ? `hidden` : `flex`}`}
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>直通FAX</span>
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
                            className={`icon_btn_red ${inputDirectFax === "" ? `hidden` : `flex`}`}
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
                    <span className={`${styles.title_search_mode}`}>代表FAX</span>
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
                            className={`icon_btn_red ${inputFax === "" ? `hidden` : `flex`}`}
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
                      </div>
                    </>
                  )}
                  {/* input下追加ボタンエリア ここまで */}
                </div>
              </div>

              {/* 社用携帯・私用携帯 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>社用携帯</span>
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
                            className={`icon_btn_red ${inputCompanyCellPhone === "" ? `hidden` : `flex`}`}
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
                    <span className={`${styles.title_search_mode}`}>私用携帯</span>
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
                            className={`icon_btn_red ${inputPersonalCellPhone === "" ? `hidden` : `flex`}`}
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>E-mail</span>
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
                            className={`icon_btn_red ${inputContactEmail === "" ? `hidden` : `flex`}`}
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>郵便番号</span>
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
                            className={`icon_btn_red ${inputZipcode === "" ? `hidden` : `flex`}`}
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
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}></span>
                    {/* {!searchMode && (
                    <span className={`${styles.value}`}>
                      {selectedRowDataProperty?.established_in ? selectedRowDataProperty?.established_in : ""}
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
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box} flex h-full `}>
                    <span className={`${styles.title_search_mode}`}>○住所</span>
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
                  </div>
                  <div className={`${styles.underline} `}></div>
                </div>
              </div>

              {/* 役職名・職位 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>役職名</span>
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
                            className={`icon_btn_red ${inputPositionName === "" ? `hidden` : `flex`}`}
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
                    <span className={`${styles.title_search_mode}`}>職位</span>

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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>担当職種</span>

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
                              isNullNotNullOccupation === null && inputOccupationArray.length === 0 ? `hidden` : `flex`
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
                    <div className={`${styles.title_search_mode} flex flex-col text-[12px]`}>
                      <span className={``}>決裁金額</span>
                      <span className={``}>(万円)</span>
                    </div>
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
                              className={`${styles.input_box} truncate`}
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
                              className={`${styles.input_box} truncate`}
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: `入力値をコピーして完全一致検索` })}
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>規模(ﾗﾝｸ)</span>
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

                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>決算月</span>

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

                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}></div>
                  {/* <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              {/* 予算申請月1・予算申請月2 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode} text-[12px]`}>予算申請月1</span>

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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
                    <span className={`${styles.title_search_mode} text-[12px]`}>予算申請月2</span>

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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[35px] w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title_search_mode}`}>資本金(万円)</span> */}
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span className={``}>資本金</span>
                      <span className={``}>(万円)</span>
                    </div>
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
                              className={`${styles.input_box} truncate`}
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
                              className={`${styles.input_box} truncate`}
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
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>設立</span>
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

              {/* 事業内容 サーチ */}
              <div className={`${styles.row_area_lg_box} flex  w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title_search_mode}`}>事業内容</span>
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

              {/* 主要取引先 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>主要取引先</span>
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

              {/* 主要仕入先 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>主要仕入先</span>
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

              {/* 設備 サーチ */}
              <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px] ">
                  <div className={`${styles.title_box}  flex h-full`}>
                    <span className={`${styles.title_search_mode}`}>設備</span>
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

              {/* 事業拠点・海外拠点 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>事業拠点</span>
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
                    <span className={`${styles.title_search_mode}`}>海外拠点</span>
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

              {/* グループ会社 サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>ｸﾞﾙｰﾌﾟ会社</span>
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

              {/* HP サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>HP</span>
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

              {/* 会社Email サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>会社Email</span>
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
                              onMouseEnter={(e) => handleOpenTooltip({ e, content: additionalInputTooltipText(index) })}
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
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>○業種</span>
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
                          <option key={option} value={option}>
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

              {/* 製品分類(大分類) サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
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
              {/* 製品分類(中分類) サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(中分類)</span>
                    </div>
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
              {/* 製品分類(小分類) サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                      <span className={``}>製品分類</span>
                      <span className={``}>(小分類)</span>
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

              {/* 法人番号・ID サーチ */}
              <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>○法人番号</span>
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
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  {/* <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_min}`}>会社ID</span>
                    {!searchMode && (
                      <span className={`${styles.value} truncate`}>
                        {selectedRowDataProperty?.company_id ? selectedRowDataProperty?.company_id : ""}
                      </span>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                </div>
              </div>

              <div className={`${styles.row_area} flex min-h-[70px] w-full items-center`}></div>

              {/* --------- ラッパーここまで --------- */}
            </div>
          </div>
        )}
        {/* ---------------- サーチモード 右コンテナ input時はstickyにしてnullやis nullなどのボタンや説明を配置 ---------------- */}
        {searchMode && (
          <div
            className={`${styles.right_sticky_container} sticky top-0 h-full grow bg-[aqua]/[0] pt-[10px] text-[var(--color-text)] `}
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
      </div>
    </form>
  );
};

export const PropertyMainContainerOneThird = memo(PropertyMainContainerOneThirdMemo);

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
