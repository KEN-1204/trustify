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
import styles from "../ContactDetail.module.css";
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
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";
import { FallbackUnderRightActivityLog } from "@/components/DashboardCompanyComponent/CompanyMainContainer/UnderRightActivityLog/FallbackUnderRightActivityLog";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import { useMutateContact } from "@/hooks/useMutateContact";
import { Contact, Contact_row_data, ProductCategoriesLarge, ProductCategoriesMedium } from "@/types";
import { CiEdit } from "react-icons/ci";
import {
  MdClose,
  MdDoNotDisturbAlt,
  MdEdit,
  MdOutlineDone,
  MdOutlineEdit,
  MdOutlineModeEditOutline,
} from "react-icons/md";
import { RiEdit2Fill } from "react-icons/ri";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { InputSendAndCloseBtn } from "@/components/DashboardCompanyComponent/CompanyMainContainer/InputSendAndCloseBtn/InputSendAndCloseBtn";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { validateAndFormatPhoneNumber } from "@/utils/Helpers/validateAndFormatPhoneNumber";
import {
  MonthType,
  NumberOfEmployeesClassType,
  OccupationType,
  PositionClassType,
  getNumberOfEmployeesClass,
  getOccupationName,
  getPositionClassName,
  mappingIndustryType,
  mappingMonth,
  mappingNumberOfEmployeesClass,
  mappingPositionsClassName,
  mappingProductL,
  optionsIndustryType,
  optionsMonth,
  optionsNumberOfEmployeesClass,
  optionsOccupation,
  optionsPositionsClass,
  optionsProductL,
  optionsProductLNameOnly,
  optionsProductLNameOnlySet,
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
import { BsCheck2 } from "react-icons/bs";
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
import { toHalfWidthAndRemoveSpace } from "@/utils/Helpers/toHalfWidthAndRemoveSpace";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import { LuCopyPlus } from "react-icons/lu";
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
  // console.log("🔥 ContactMainContainerレンダリング searchMode", searchMode);
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
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
  // ----------------------- 範囲検索 資本金 -----------------------
  // const [inputCapital, setInputCapital] = useState("");
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
  const [inputIndustryType, setInputIndustryType] = useState("");
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
    if (!selectedRowDataContact || !selectedRowDataContact.product_categories_large_array?.length) return "";
    return selectedRowDataContact.product_categories_large_array
      .map((name) =>
        optionsProductLNameOnlySet.has(name) ? `#${mappingProductL[name as ProductCategoriesLarge][language]}` : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataContact?.product_categories_large_array]);

  // 中分類
  const formattedProductCategoriesMedium = useMemo(() => {
    if (!selectedRowDataContact || !selectedRowDataContact.product_categories_medium_array?.length) return "";
    return selectedRowDataContact.product_categories_medium_array
      .map((name) =>
        productCategoriesMediumNameOnlySet.has(name)
          ? `#${mappingProductCategoriesMedium[name as ProductCategoriesMedium][language]}`
          : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataContact?.product_categories_medium_array]);

  // 小分類
  const formattedProductCategoriesSmall = useMemo(() => {
    if (!selectedRowDataContact || !selectedRowDataContact.product_categories_small_array?.length) return "";
    return selectedRowDataContact.product_categories_small_array
      .map((name) =>
        productCategoriesSmallNameOnlySet.has(name)
          ? `#${mappingProductCategoriesSmall[name as ProductCategoriesSmall][language]}`
          : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataContact?.product_categories_small_array]);

  // ----------------------- 🌟製品分類関連🌟 ここまで -----------------------

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
  const [inputContactName, setInputContactName] = useState(""); // 担当者名
  const [inputDirectLine, setInputDirectLine] = useState(""); // 直通TEL
  const [inputDirectFax, setInputDirectFax] = useState(""); // 直通Fax
  const [inputExtension, setInputExtension] = useState(""); // 内線TEL
  const [inputCompanyCellPhone, setInputCompanyCellPhone] = useState(""); // 社用携帯
  const [inputPersonalCellPhone, setInputPersonalCellPhone] = useState(""); // 私用携帯
  const [inputContactEmail, setInputContactEmail] = useState(""); // Email(担当者)
  const [inputPositionName, setInputPositionName] = useState(""); // 役職名
  const [inputPositionClass, setInputPositionClass] = useState(""); // 職位
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
  const [inputOccupation, setInputOccupation] = useState(""); // 担当職種
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
  // ----------------------- 範囲検索 決裁金額 -----------------------
  const [inputApprovalAmount, setInputApprovalAmount] = useState(""); // 決裁金額 stringで入力してnumberに変換 ユーザーの入力が楽になるため(フォーマットもstringならしやすい)
  const [inputApprovalAmountSearch, setInputApprovalAmountSearch] = useState<
    { min: string; max: string } | "is null" | "is not null"
  >({
    min: "",
    max: "",
  });
  // ----------------------- 範囲検索 決裁金額 ----------------------- ここまで
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

  // 検索タイプ
  const searchType = useDashboardStore((state) => state.searchType);

  // 編集モードtrueの場合、サーチ条件をinputタグのvalueに格納
  // 新規サーチの場合には、サーチ条件を空にする
  useEffect(() => {
    // if (newSearchContact_CompanyParams === null) return;

    if (editSearchMode && searchMode) {
      if (newSearchContact_CompanyParams === null) return;
      // サーチ編集モードでリプレイス前の値に復元する関数
      const beforeAdjustFieldValue = (value: string | null) => {
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
      //   dispatch: Dispatch<SetStateAction<any[]>>,
      //   dispatchNNN: Dispatch<SetStateAction<"is null" | "is not null" | null>>
      // ) => {
      //   if (param === "ISNULL" || param === "ISNOTNULL") {
      //     dispatchNNN(beforeAdjustIsNNN(param));
      //   } else {
      //     dispatch(!!param.length ? param : []);
      //   }
      // };

      console.log("🔥メインコンテナーnewSearchContact_CompanyParams編集モード", newSearchContact_CompanyParams);
      //   setInputCompanyName(beforeAdjustFieldValue(newSearchContact_CompanyParams.company_name));
      setInputCompanyName(beforeAdjustFieldValue(newSearchContact_CompanyParams["client_companies.name"]));
      // setInputDepartment(beforeAdjustFieldValue(newSearchContact_CompanyParams.department_name));
      setInputDepartment(beforeAdjustFieldValue(newSearchContact_CompanyParams["client_companies.department_name"]));
      //   setInputContactName(beforeAdjustFieldValue(newSearchContact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchContact_CompanyParams["contacts.name"]));
      setInputTel(beforeAdjustFieldValue(newSearchContact_CompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchContact_CompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchContact_CompanyParams?.zipcode));
      // サーチ配列 ------------------------
      // setInputEmployeesClass(beforeAdjustFieldValue(newSearchContact_CompanyParams?.number_of_employees_class));
      setArrayParam(
        newSearchContact_CompanyParams?.number_of_employees_class,
        setInputEmployeesClassArray,
        setIsNullNotNullEmployeesClass
      );
      // サーチ配列 ------------------------ ここまで
      setInputAddress(beforeAdjustFieldValue(newSearchContact_CompanyParams?.address));
      // 範囲検索 ------------------------
      // setInputCapital(
      //   beforeAdjustFieldValue(
      //     newSearchContact_CompanyParams?.capital ? newSearchContact_CompanyParams.capital.toString() : ""
      //   )
      // );
      setInputCapitalSearch(beforeAdjustFieldRangeNumeric(newSearchContact_CompanyParams?.capital, "price"));
      setInputNumberOfEmployeesSearch(
        beforeAdjustFieldRangeNumeric(newSearchContact_CompanyParams?.number_of_employees)
      );
      // 範囲検索 ------------------------ ここまで
      setInputFound(beforeAdjustFieldValue(newSearchContact_CompanyParams?.established_in));
      setInputContent(beforeAdjustFieldValue(newSearchContact_CompanyParams?.business_content));
      setInputHP(beforeAdjustFieldValue(newSearchContact_CompanyParams.website_url));
      //   setInputCompanyEmail(beforeAdjustFieldValue(newSearchContact_CompanyParams.company_email));
      setInputCompanyEmail(beforeAdjustFieldValue(newSearchContact_CompanyParams["client_companies.email"]));
      // サーチ配列 ------------------------
      // setInputIndustryType(
      //   beforeAdjustFieldValue(
      //     newSearchContact_CompanyParams.industry_type_id
      //       ? newSearchContact_CompanyParams.industry_type_id.toString()
      //       : ""
      //   )
      // );
      setArrayParam(
        newSearchContact_CompanyParams?.industry_type_id,
        setInputIndustryTypeArray,
        setIsNullNotNullIndustryType
      );
      // サーチ配列 ------------------------ ここまで
      // ------------------------ 製品分類関連 ------------------------
      // 編集モードはidからnameへ変換
      // setInputProductL(beforeAdjustFieldValue(newSearchContact_CompanyParams.product_category_large));
      // setInputProductM(beforeAdjustFieldValue(newSearchContact_CompanyParams.product_category_medium));
      // setInputProductS(beforeAdjustFieldValue(newSearchContact_CompanyParams.product_category_small));

      // 🔸大分類
      let productCategoryLargeNamesArray: ProductCategoriesLarge[] = [];
      const largeIds = newSearchContact_CompanyParams.product_category_large_ids;
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
      const mediumIds = newSearchContact_CompanyParams.product_category_medium_ids;
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
      const smallIds = newSearchContact_CompanyParams.product_category_small_ids;
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

      // ------------------------ 製品分類関連 ここまで ------------------------

      // サーチ配列 決算月 予算申請月1, 2 ------------------------
      // setInputFiscal(beforeAdjustFieldValue(newSearchContact_CompanyParams.fiscal_end_month));
      setArrayParam(newSearchContact_CompanyParams?.fiscal_end_month, setInputFiscalArray, setIsNullNotNullFiscal);
      // setInputBudgetRequestMonth1(beforeAdjustFieldValue(newSearchContact_CompanyParams.budget_request_month1));
      setArrayParam(
        newSearchContact_CompanyParams?.budget_request_month1,
        setInputBudgetRequestMonth1Array,
        setIsNullNotNullBudgetRequestMonth1
      );
      // setInputBudgetRequestMonth2(beforeAdjustFieldValue(newSearchContact_CompanyParams.budget_request_month2));
      setArrayParam(
        newSearchContact_CompanyParams?.budget_request_month2,
        setInputBudgetRequestMonth2Array,
        setIsNullNotNullBudgetRequestMonth2
      );
      // サーチ配列 決算月 予算申請月1, 2 ------------------------ ここまで
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
      // サーチ配列 ------------------------
      // setInputPositionClass(
      //   beforeAdjustFieldValue(
      //     newSearchContact_CompanyParams.position_class ? newSearchContact_CompanyParams.position_class.toString() : ""
      //   )
      // );
      setArrayParam(
        newSearchContact_CompanyParams.position_class,
        setInputPositionClassArray,
        setIsNullNotNullPositionClass
      );
      // サーチ配列 ------------------------ ここまで
      // サーチ配列 ------------------------
      // setInputOccupation(
      //   beforeAdjustFieldValue(
      //     newSearchContact_CompanyParams.occupation ? newSearchContact_CompanyParams.occupation.toString() : ""
      //   )
      // );
      setArrayParam(newSearchContact_CompanyParams.occupation, setInputOccupationArray, setIsNullNotNullOccupation);
      // サーチ配列 ------------------------ ここまで
      // 範囲検索 ------------------------
      // setInputApprovalAmount(
      //   beforeAdjustFieldValue(
      //     newSearchContact_CompanyParams.approval_amount
      //       ? newSearchContact_CompanyParams.approval_amount.toString()
      //       : ""
      //   )
      // );
      setInputApprovalAmountSearch(
        beforeAdjustFieldRangeNumeric(newSearchContact_CompanyParams?.approval_amount, "price")
      );
      // 範囲検索 ------------------------ ここまで
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
      // サーチ配列 規模ランク-----------------------
      // if (!!inputEmployeesClass) setInputEmployeesClass("");
      if (!!inputEmployeesClassArray.length) setInputEmployeesClassArray([]);
      if (isNullNotNullEmployeesClass !== null) setIsNullNotNullEmployeesClass(null);
      // サーチ配列 規模ランク-----------------------ここまで
      if (!!inputAddress) setInputAddress("");
      // if (!!inputCapital) setInputCapital("");
      // 範囲検索 -----------------------
      setInputCapitalSearch({ min: "", max: "" });
      setInputNumberOfEmployeesSearch({ min: "", max: "" });
      // 範囲検索 ----------------------- ここまで
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
      // 範囲検索 -----------------------
      // if (!!inputApprovalAmount) setInputApprovalAmount("");
      setInputApprovalAmountSearch({ min: "", max: "" });
      // 範囲検索 ----------------------- ここまで
      if (!!inputCreatedByCompanyId) setInputCreatedByCompanyId("");
      if (!!inputCreatedByUserId) setInputCreatedByUserId("");
    }
  }, [editSearchMode, searchMode]);

  // サーチ関数実行
  const handleSearchSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    handleCloseTooltip();

    // フィールド編集モードがtrueならサブミットせずにリターン
    if (isEditModeField) return console.log("サブミット フィールドエディットモードのためリターン");

    if (!userProfileState || !userProfileState.company_id) return alert("エラー：ユーザー情報が見つかりませんでした。");

    // // Asterisks to percent signs for PostgreSQL's LIKE operator
    function adjustFieldValue(value: string | null) {
      if (value === "") return null; // 全てのデータ
      if (value === null) return null; // 全てのデータ
      // 特殊記号%, _をリテラル文字に置換
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

    // // 🔸製品分類用 is null, is not nullをIS NULL, IS NOT NULLに変換
    // const adjustIsNNN = (value: "is null" | "is not null"): "ISNULL" | "ISNOTNULL" =>
    //   value === "is null" ? "ISNULL" : "ISNOTNULL";

    setLoadingGlobalState(true);

    try {
      let _company_name = adjustFieldValue(inputCompanyName);
      let _department_name = adjustFieldValue(inputDepartment);
      let _main_phone_number = adjustFieldValue(inputTel);
      let _main_fax = adjustFieldValue(inputFax);
      let _zipcode = adjustFieldValue(inputZipcode);
      // サーチ配列 TEXT[] ------------
      // let _number_of_employees_class = adjustFieldValue(inputEmployeesClass);
      let _number_of_employees_class = inputEmployeesClassArray;
      // サーチ配列 TEXT[] ------------ここまで
      let _address = adjustFieldValue(inputAddress);
      // 範囲検索 -----------
      // let _capital = adjustFieldValue(inputCapital) ? parseInt(inputCapital, 10) : null;
      // let _capital = adjustFieldValueInteger(inputCapital);
      // let _capital = adjustFieldRangeNumeric(inputCapitalSearch);
      let _capital = adjustFieldRangeNumeric(inputCapitalSearch, "millions");
      let _number_of_employees = adjustFieldRangeNumeric(inputNumberOfEmployeesSearch);
      // 範囲検索 -----------ここまで
      let _established_in = adjustFieldValue(inputFound);
      let _business_content = adjustFieldValue(inputContent);
      let _website_url = adjustFieldValue(inputHP);
      let _company_email = adjustFieldValue(inputCompanyEmail);
      // let _industry_type_id = isValidNumber(inputIndustryType) ? parseInt(inputIndustryType, 10) : null;
      // サーチ配列 number[] -----------
      // let _industry_type_id = adjustFieldValueInteger(inputIndustryType);
      let _industry_type_id = inputIndustryTypeArray;
      // サーチ配列 number[] -----------ここまで
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
      // サーチ配列 number[] ------------
      // let _position_class = adjustFieldValue(inputPositionClass) ? parseInt(inputPositionClass, 10) : null;
      // let _position_class = adjustFieldValueInteger(inputPositionClass);
      let _position_class = inputPositionClassArray;
      // let _occupation = adjustFieldValue(inputOccupation) ? parseInt(inputOccupation, 10) : null;
      // let _occupation = adjustFieldValueInteger(inputOccupation);
      let _occupation = inputOccupationArray;
      // サーチ配列 number[] ------------ここまで
      // let _approval_amount = adjustFieldValue(inputApprovalAmount) ? parseInt(inputApprovalAmount, 10) : null;
      // let _approval_amount = adjustFieldValueInteger(inputApprovalAmount);
      // 範囲検索 -----------
      // let _approval_amount = adjustFieldRangeNumeric(inputApprovalAmountSearch);
      let _approval_amount = adjustFieldRangeNumeric(inputApprovalAmountSearch, "millions");
      // 範囲検索 -----------ここまで
      let _created_by_company_id = userProfileState.company_id;
      let _created_by_user_id = adjustFieldValue(inputCreatedByUserId);

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

      // 製品分類の処理ここまで ----------------------------------------------

      const params = {
        "client_companies.name": _company_name,
        //   company_name: _company_name,
        "client_companies.department_name": _department_name,
        main_phone_number: _main_phone_number,
        main_fax: _main_fax,
        zipcode: _zipcode,
        address: _address,
        // サーチ配列 TEXT[] ------------
        // number_of_employees_class: _number_of_employees_class,
        number_of_employees_class:
          isNullNotNullEmployeesClass === null ? _number_of_employees_class : adjustIsNNN(isNullNotNullEmployeesClass),
        // サーチ配列 TEXT[] ------------ここまで
        // 範囲検索 ------------
        capital: _capital,
        number_of_employees: _number_of_employees,
        // 範囲検索 ------------ここまで
        established_in: _established_in,
        business_content: _business_content,
        website_url: _website_url,
        //   company_email: _company_email,
        "client_companies.email": _company_email,
        // サーチ配列 number[] ------------
        // industry_type_id: _industry_type_id,
        industry_type_id:
          isNullNotNullIndustryType === null ? _industry_type_id : adjustIsNNN(isNullNotNullIndustryType),
        // サーチ配列 number[] ------------ここまで
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
        // サーチ配列 TEXT[] ------------
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
        // サーチ配列 TEXT[] ------------ここまで
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
        // 範囲検索 ------------
        approval_amount: _approval_amount,
        // 範囲検索 ------------ここまで
        // created_by_company_id: _created_by_company_id,
        "contacts.created_by_company_id": _created_by_company_id,
        created_by_user_id: _created_by_user_id,
      };

      // const { data, error } = await supabase.rpc("", { params });
      // const { data, error } = await supabase.rpc("search_companies", { params });

      setInputCompanyName("");
      setInputDepartment("");
      setInputTel("");
      setInputFax("");
      setInputZipcode("");
      // サーチ配列 ----------------
      // setInputEmployeesClass("");
      setInputEmployeesClassArray([]);
      if (isNullNotNullEmployeesClass !== null) setIsNullNotNullEmployeesClass(null);
      // サーチ配列 ----------------ここまで
      setInputAddress("");
      // 範囲検索 ----------------
      // setInputCapital("");
      setInputCapitalSearch({ min: "", max: "" });
      setInputNumberOfEmployeesSearch({ min: "", max: "" });
      // 範囲検索 ----------------ここまで
      setInputFound("");
      setInputContent("");
      setInputHP("");
      setInputCompanyEmail("");
      // サーチ配列 ----------------
      // setInputIndustryType("");
      setInputIndustryTypeArray([]);
      if (isNullNotNullIndustryType !== null) setIsNullNotNullIndustryType(null);
      // サーチ配列 ----------------ここまで
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
      // サーチ配列 決算月・予算申請月 ----------------------- ここまで
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
      // 範囲検索 ----------------
      // setInputApprovalAmount("");
      setInputApprovalAmountSearch({ min: "", max: "" });
      // 範囲検索 ----------------ここまで
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
      // const { data, error } = await supabase.rpc("", { params });

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
            // newErrMsg = "";
            break;

          default:
            break;
        }
        alert(newErrMsg);
      }
    }
  };

  // ================== 🌟ツールチップ🌟 ==================
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
  // const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string = "center") => {
  // const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string = "top", content = "") => {
  const handleOpenTooltip = ({
    e,
    display = "top",
    marginTop = 0,
    itemsPosition = "center",
    whiteSpace = undefined,
    content = "",
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
      // content: (e.target as HTMLDivElement).dataset.text as string,
      content: content !== "" ? content : ((e.target as HTMLDivElement).dataset.text as string),
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

        if (["position_class", "occupation"].includes(field)) {
          // const numValue = getInvertOrderCertaintyStartOfMonth(selectedRowDataValue);
          originalValueFieldEdit.current = selectedRowDataValue;
          dispatch(selectedRowDataValue);
          setIsEditModeField(field);
          return;
        }

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
    // inputType: "" | "category_large" | "category_medium" | "category_small" = ""
  ) => {
    // if (inputType === "category_large") resetProductCategories("lms");
    // if (inputType === "category_medium") resetProductCategories("ms");
    // if (inputType === "category_small") resetProductCategories("s");
    return dispatch("is not null");
  };

  // 🔸「入力無し」をクリック
  const handleClickIsNull = (
    dispatch: Dispatch<SetStateAction<any>>
    // inputType: "" | "category_large" | "category_medium" | "category_small" = ""
  ) => {
    // if (inputType === "category_large") resetProductCategories("lms");
    // if (inputType === "category_medium") resetProductCategories("ms");
    // if (inputType === "category_small") resetProductCategories("s");
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
      | "occupation" = ""
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

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  console.log(
    "🔥ContactMainContainerレンダリング ",
    "selectedRowDataContact",
    selectedRowDataContact,
    "inputEmployeesClassArray",
    inputEmployeesClassArray,
    "selectedEmployeesClassArraySet",
    selectedEmployeesClassArraySet,
    "isNullNotNullEmployeesClass",
    isNullNotNullEmployeesClass,
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
    isNullNotNullFiscal,
    "inputOccupationArray",
    inputOccupationArray,
    "selectedOccupationArraySet",
    selectedOccupationArraySet,
    "isNullNotNullOccupation",
    isNullNotNullOccupation,
    "inputPositionClassArray",
    inputPositionClassArray,
    "selectedPositionClassArraySet",
    selectedPositionClassArraySet,
    "isNullNotNullPositionClass",
    isNullNotNullPositionClass,
    "inputApprovalAmountSearch",
    inputApprovalAmountSearch,
    "inputCapitalSearch",
    inputCapitalSearch
  );

  return (
    <form className={`${styles.main_container} w-full `} onSubmit={handleSearchSubmit}>
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
                      data-text={selectedRowDataContact?.company_name ? selectedRowDataContact?.company_name : ""}
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
                      data-text={
                        selectedRowDataContact?.company_department_name
                          ? selectedRowDataContact?.company_department_name
                          : ""
                      }
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
                      {selectedRowDataContact?.company_department_name
                        ? selectedRowDataContact?.company_department_name
                        : ""}
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
                  <span className={`${styles.title} ${fieldEditTitle("name")}`}>●担当者名</span>
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
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title} ${fieldEditTitle("direct_line")}`}>直通TEL</span>
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
                                { autoClose: false }
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
                                { autoClose: false }
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

            {/* 内線TEL・代表TEL */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${fieldEditTitle("extension")}`}>内線TEL</span>
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
                                { autoClose: false }
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
                                { autoClose: false }
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
                {/* setInputExtension */}
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

            {/* 直通FAX・代表FAX */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${fieldEditTitle("direct_fax")}`}>直通FAX</span>
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
                                autoClose: false,
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
                                autoClose: false,
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
                {/* setInputDirectFax */}
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

            {/* 社用携帯・私用携帯 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${fieldEditTitle("company_cell_phone")}`}>社用携帯</span>
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
                    <>
                      {["is null", "is not null"].includes(inputCompanyCellPhone) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputCompanyCellPhone]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputCompanyCellPhone]}</span>
                        </div>
                      ) : (
                        <input
                          type="tel"
                          className={`${styles.input_box}`}
                          value={inputCompanyCellPhone}
                          onChange={(e) => setInputCompanyCellPhone(e.target.value)}
                        />
                      )}
                    </>
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
                                autoClose: false,
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
                                autoClose: false,
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
                  <span className={`${styles.title} ${fieldEditTitle("personal_cell_phone")}`}>私用携帯</span>
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
                    <>
                      {["is null", "is not null"].includes(inputPersonalCellPhone) ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[inputPersonalCellPhone]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[inputPersonalCellPhone]}</span>
                        </div>
                      ) : (
                        <input
                          type="tel"
                          className={`${styles.input_box}`}
                          value={inputPersonalCellPhone}
                          onChange={(e) => setInputPersonalCellPhone(e.target.value)}
                        />
                      )}
                    </>
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
                                autoClose: false,
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
                                autoClose: false,
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
                {/* setInputPersonalCellPhone */}
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

            {/* 担当者Email */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${fieldEditTitle("contact_email")}`}>E-mail</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={async () => {
                        if (!selectedRowDataContact?.contact_email) return;
                        try {
                          await navigator.clipboard.writeText(selectedRowDataContact.contact_email);
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
                    >
                      {selectedRowDataContact?.contact_email ? selectedRowDataContact.contact_email : ""}
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
                          type="email"
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

            {/* 郵便番号・ */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                <div className={`${styles.title_box} flex h-full ${styles.title_box_lg}`}>
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
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${fieldEditTitle("position_name")}`}>役職名</span>
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
                      data-text={selectedRowDataContact?.position_name ? selectedRowDataContact?.position_name : ""}
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
                      {selectedRowDataContact?.position_name ? selectedRowDataContact?.position_name : ""}
                    </span>
                  )}
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
                {/* setInputPositionName */}
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
                  <span className={`${styles.title} ${fieldEditTitle("position_class")}`}>職位</span>
                  {!searchMode && isEditModeField !== "position_class" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "position_class",
                          dispatch: setInputPositionClass,
                          selectedRowDataValue: selectedRowDataContact?.position_class ?? "",
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
                          maxWidth={`calc(100% - 95px)`}
                          maxHeight={30}
                          // zIndexSelectBox={2000}
                          hideOptionAfterSelect={true}
                        />
                      )}
                      {/* <select
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
                        <option value="is not null">入力有りのデータのみ</option>
                        <option value="is null">入力無しのデータのみ</option>
                      </select> */}
                    </>
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
                            newValue: isValidNumber(e.target.value) ? parseInt(e.target.value, 10) : null,
                            originalValue: isValidNumber(originalValueFieldEdit.current)
                              ? parseInt(originalValueFieldEdit.current, 10)
                              : null,
                            id: selectedRowDataContact?.contact_id,
                          });
                        }}
                      >
                        {optionsPositionsClass.map((option) => (
                          <option key={option} value={option}>
                            {getPositionClassName(option, language)}
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

            {/* 担当職種・決裁金額 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title} ${fieldEditTitle("occupation")}`}>担当職種</span>
                  {!searchMode && isEditModeField !== "occupation" && (
                    <span
                      className={`${styles.value} ${isOurContact ? styles.editable_field : styles.uneditable_field}`}
                      onClick={handleSingleClickField}
                      onDoubleClick={(e) => {
                        handleDoubleClickField({
                          e,
                          field: "occupation",
                          dispatch: setInputOccupation,
                          selectedRowDataValue: selectedRowDataContact?.occupation ?? "",
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
                          maxWidth={`calc(100% - 95px)`}
                          maxHeight={30}
                          // zIndexSelectBox={2000}
                          hideOptionAfterSelect={true}
                        />
                      )}
                      {/* <select
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
                        <option value="is not null">入力有りのデータのみ</option>
                        <option value="is null">入力無しのデータのみ</option>
                      </select> */}
                    </>
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
                            newValue: isValidNumber(e.target.value) ? parseInt(e.target.value, 10) : null,
                            originalValue: isValidNumber(originalValueFieldEdit.current)
                              ? parseInt(originalValueFieldEdit.current, 10)
                              : null,
                            id: selectedRowDataContact?.contact_id,
                          });
                        }}
                      >
                        {optionsOccupation.map((option) => (
                          <option key={option} value={option}>
                            {getOccupationName(option)}
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
                  {/* <span className={`${styles.title} !mr-[12px]`}>決裁金額(万円)</span> */}
                  <div
                    className={`${styles.title} ${styles.double_text} flex flex-col ${fieldEditTitle(
                      "approval_amount"
                    )}`}
                  >
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
                              setInputApprovalAmountSearch({ min: e.target.value, max: inputApprovalAmountSearch.max })
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
                              setInputApprovalAmountSearch({ min: inputApprovalAmountSearch.min, max: e.target.value })
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
                {/* setInputApprovalAmount */}
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
                          className={`icon_btn_red ${isEmptyInputRange(inputApprovalAmountSearch) ? `hidden` : `flex`}`}
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

            {/* 規模（ランク）・決算月 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        ? getNumberOfEmployeesClass(selectedRowDataContact?.number_of_employees_class)
                        : ""}
                    </span>
                  )}
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
                          getOptionName={getMonthNameSearch}
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

            {/* 予算申請月1・予算申請月2 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                        ? selectedRowDataContact?.budget_request_month1 + `月`
                        : ""}
                    </span>
                  )}
                  {searchMode && (
                    <>
                      {isNullNotNullBudgetRequestMonth1 === "is null" ||
                      isNullNotNullBudgetRequestMonth1 === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[isNullNotNullBudgetRequestMonth1]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullBudgetRequestMonth1]}</span>
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
                          maxWidth={`calc(100% - 95px)`}
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
                        ? selectedRowDataContact?.budget_request_month2 + "月"
                        : ""}
                    </span>
                  )}
                  {searchMode && (
                    <>
                      {isNullNotNullBudgetRequestMonth2 === "is null" ||
                      isNullNotNullBudgetRequestMonth2 === "is not null" ? (
                        <div className={`flex min-h-[30px] items-center text-[var(--color-text-brand-f)]`}>
                          {nullNotNullIconMap[isNullNotNullBudgetRequestMonth2]}
                          <span className={`text-[13px]`}>{nullNotNullTextMap[isNullNotNullBudgetRequestMonth2]}</span>
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
                          maxWidth={`calc(100% - 95px)`}
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

            {/* 資本金・設立 テスト */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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

            {/* 従業員数 テスト */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                      {selectedRowDataContact?.number_of_employees ? selectedRowDataContact?.number_of_employees : ""}
                    </span>
                  )}
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
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 事業概要 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full ${styles.title_box_lg}`}>
                  <span className={`${styles.title}`}>事業概要</span>
                  {!searchMode && (
                    <>
                      <span
                        className={`${styles.textarea_value} h-[45px] ${styles.uneditable_field}`}
                        data-text={`${
                          selectedRowDataContact?.business_content ? selectedRowDataContact?.business_content : ""
                        }`}
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
                          className={`${styles.textarea_box} ${styles.textarea_box_bg} ${styles.textarea_box_search_mode}`}
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

            {/* 主要取引先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要取引先</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      data-text={`${selectedRowDataContact?.clients ? selectedRowDataContact?.clients : ""}`}
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
                      {selectedRowDataContact?.clients ? selectedRowDataContact?.clients : ""}
                    </span>
                  )}
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

            {/* 主要仕入先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要仕入先</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      data-text={`${selectedRowDataContact?.supplier ? selectedRowDataContact?.supplier : ""}`}
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
                      {selectedRowDataContact?.supplier ? selectedRowDataContact?.supplier : ""}
                    </span>
                  )}
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

            {/* 設備 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full ${styles.title_box_lg}`}>
                  <span className={`${styles.title}`}>設備</span>
                  {!searchMode && (
                    <>
                      <span
                        className={`${styles.textarea_value} h-[45px] ${styles.uneditable_field}`}
                        data-text={`${selectedRowDataContact?.facility ? selectedRowDataContact?.facility : ""}`}
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
                          className={`${styles.textarea_box} ${styles.textarea_box_bg} ${styles.textarea_box_search_mode}`}
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

            {/* 事業拠点・海外拠点 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>事業拠点</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      data-text={`${
                        selectedRowDataContact?.business_sites ? selectedRowDataContact?.business_sites : ""
                      }`}
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
                      {selectedRowDataContact?.business_sites ? selectedRowDataContact?.business_sites : ""}
                    </span>
                  )}
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
                  <span className={`${styles.title}`}>海外拠点</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      data-text={`${
                        selectedRowDataContact?.overseas_bases ? selectedRowDataContact?.overseas_bases : ""
                      }`}
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
                      {selectedRowDataContact?.overseas_bases ? selectedRowDataContact?.overseas_bases : ""}
                    </span>
                  )}
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

            {/* グループ会社 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>グループ会社</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value} ${styles.uneditable_field}`}
                      data-text={`${
                        selectedRowDataContact?.group_company ? selectedRowDataContact?.group_company : ""
                      }`}
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
                      {selectedRowDataContact?.group_company ? selectedRowDataContact?.group_company : ""}
                    </span>
                  )}
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

            {/* HP */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
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

            {/* 会社Email */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
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
                    >
                      {selectedRowDataContact?.company_email ? selectedRowDataContact?.company_email : ""}
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

            {/* 業種 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
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
                      {isValidNumber(selectedRowDataContact?.industry_type_id)
                        ? mappingIndustryType[selectedRowDataContact?.industry_type_id!][language]
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

            {/* 製品分類(大分類) */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  {/* <span className={`${styles.title} !mr-[15px]`}>製品分類（大分類）</span> */}
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
                      {/* {selectedRowDataContact?.product_category_large
                        ? selectedRowDataContact?.product_category_large
                        : ""} */}
                    </span>
                  )}
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
                  {/* <span className={`${styles.title} !mr-[15px]`}>製品分類（中分類）</span> */}
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
                  {/* <span className={`${styles.title} !mr-[15px]`}>製品分類（中分類）</span> */}
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

            {/* 法人番号・ID */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
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
                      {selectedRowDataContact?.company_id ? selectedRowDataContact?.company_id : ""}
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
                  <ContactUnderRightActivityLog isHoverableBorder={true} />
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
                          onMouseEnter={(e) => handleOpenTooltip({e})}
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
                          onMouseEnter={(e) => handleOpenTooltip({e})}
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
                          onMouseEnter={(e) => handleOpenTooltip({e})}
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
                          onMouseEnter={(e) => handleOpenTooltip({e})}
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
                          onMouseEnter={(e) => handleOpenTooltip({e})}
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
                          onMouseEnter={(e) => handleOpenTooltip({e})}
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
                          onMouseEnter={(e) => handleOpenTooltip({e})}
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
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataContact ? `pointer-events-none` : ``
                          }`}
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                              handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
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
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataContact ? `pointer-events-none` : ``
                          }`}
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
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataContact ? `pointer-events-none` : ``
                          }`}
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
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataContact ? `pointer-events-none` : ``
                          }`}
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
                    <div className={`${styles.title_box} flex h-full  ${styles.title_box_lg}`}>
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
                          // onMouseEnter={(e) => handleOpenTooltip({e})}
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
                            // handleOpenTooltip({e});
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
                            className={`${styles.textarea_box} ${styles.field_edit_mode_textarea} ${styles.xl}`}
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
                    <div className={`${styles.title_box} flex h-full ${styles.title_box_lg}`}>
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
                          // onMouseEnter={(e) => handleOpenTooltip({e})}
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
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
                              handleOpenTooltip({ e });
                          }}
                          onMouseLeave={(e) => {
                            if (!selectedRowDataContact?.ban_reason) return;
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
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
                              className={`${styles.textarea_box} ${styles.field_edit_mode_textarea} ${styles.xl}`}
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
                            {/* {updateContactFieldMutation.isLoading && (
                              <div className={`${styles.field_edit_mode_loading_area} ${styles.under_right}`}>
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )} */}
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
                  not null」と入力してください。
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
