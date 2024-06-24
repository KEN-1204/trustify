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
import styles from "../MeetingDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
// import { UnderRightMeetingLog } from "./UnderRightMeetingLog/UnderRightMeetingLog";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import dynamic from "next/dynamic";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import productCategoriesM, {
  mappingAnalysisCategoryM,
  mappingBusinessSupportCategoryM,
  mappingControlEquipmentCategoryM,
  mappingDesignCategoryM,
  mappingITCategoryM,
  mappingImageProcessingCategoryM,
  mappingMachinePartsCategoryM,
  mappingMaterialCategoryM,
  mappingModuleCategoryM,
  mappingOfficeCategoryM,
  mappingOthersCategoryM,
  mappingProcessingMachineryCategoryM,
  mappingProductCategoriesMedium,
  mappingScienceCategoryM,
  mappingSkillUpCategoryM,
  mappingToolCategoryM,
  productCategoriesMediumNameOnlySet,
  productCategoryLargeToMappingMediumMap,
  productCategoryLargeToOptionsMediumMap,
  productCategoryLargeToOptionsMediumObjMap,
} from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { format } from "date-fns";
import { MdClose, MdDoNotDisturbAlt, MdMoreTime, MdOutlineDeleteOutline, MdOutlineDone } from "react-icons/md";
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";
import { convertToJapaneseCurrencyFormat } from "@/utils/Helpers/convertToJapaneseCurrencyFormat";
import { convertToMillions } from "@/utils/Helpers/convertToMillions";
import {
  getMeetingParticipationRequest,
  getMeetingType,
  getNumberOfEmployeesClass,
  getOccupationName,
  getPlannedPurpose,
  getPositionClassName,
  getResultCategory,
  getResultNegotiateDecisionMaker,
  getWebTool,
  mappingIndustryType,
  mappingProductL,
  optionsIndustryType,
  optionsMeetingParticipationRequest,
  optionsMeetingType,
  optionsMonth,
  optionsNumberOfEmployeesClass,
  optionsOccupation,
  optionsPlannedPurpose,
  optionsPositionsClass,
  optionsProductL,
  optionsProductLNameOnly,
  optionsProductLNameOnlySet,
  optionsResultCategory,
  optionsResultNegotiateDecisionMaker,
  optionsWebTool,
} from "@/utils/selectOptions";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import {
  AttendeeInfo,
  Department,
  IntroducedProductsNames,
  Meeting,
  Meeting_row_data,
  Office,
  ProductCategoriesLarge,
  ProductCategoriesMedium,
  Section,
  Unit,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { mappingOccupation, mappingPositionClass } from "@/utils/mappings";
import { getProductName } from "@/utils/Helpers/getProductName";
import { AttendeesListTable } from "./AttendeesListTable/AttendeesListTable";
import { useMedia } from "react-use";
import { useMutateMeeting } from "@/hooks/useMutateMeeting";
import { isSameDateLocal } from "@/utils/Helpers/isSameDateLocal";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { formatTime } from "@/utils/Helpers/formatTime";
import { splitTime } from "@/utils/Helpers/splitTime";
import { IoIosSend } from "react-icons/io";
import { InputSendAndCloseBtn } from "@/components/DashboardCompanyComponent/CompanyMainContainer/InputSendAndCloseBtn/InputSendAndCloseBtn";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { useQuerySections } from "@/hooks/useQuerySections";
import { getFiscalYear } from "@/utils/Helpers/getFiscalYear";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { calculateFiscalYearMonths } from "@/utils/Helpers/CalendarHelpers/calculateFiscalMonths";
import { TimePickerModal } from "@/components/Modal/TimePickerModal/TimePickerModal";
import {
  ProductCategoriesSmall,
  mappingProductCategoriesSmall,
  productCategoriesSmallNameOnlySet,
  productCategoryMediumToMappingSmallMap,
  productCategoryMediumToOptionsSmallMap_All,
  productCategoryMediumToOptionsSmallMap_All_obj,
} from "@/utils/productCategoryS";
import { CustomSelectMultiple } from "@/components/Parts/CustomSelectMultiple/CustomSelectMultiple";
import { DatePickerCustomInputForSearch } from "@/utils/DatePicker/DatePickerCustomInputForSearch";
import { BsCheck2 } from "react-icons/bs";

// https://nextjs-ja-translation-docs.vercel.app/docs/advanced-features/dynamic-import
// デフォルトエクスポートの場合のダイナミックインポート
// const DynamicComponent = dynamic(() => import('../components/hello'));
// 名前付きエクスポートの場合のダイナミックインポート
// const ContactUnderRightMeetingLog = dynamic(
//   () =>
//     import("./ContactUnderRightMeetingLog/ContactUnderRightMeetingLog").then(
//       (mod) => mod.ContactUnderRightMeetingLog
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

const MeetingMainContainerOneThirdMemo: FC = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  const editSearchMode = useDashboardStore((state) => state.editSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);

  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  // 上画面の選択中の列データ会社
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const setSelectedRowDataMeeting = useDashboardStore((state) => state.setSelectedRowDataMeeting);
  // 担当者編集モーダルオープン
  const setIsOpenUpdateMeetingModal = useDashboardStore((state) => state.setIsOpenUpdateMeetingModal);
  // rpc()サーチ用パラメータ
  const newSearchMeeting_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchMeeting_Contact_CompanyParams
  );
  const setNewSearchMeeting_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchMeeting_Contact_CompanyParams
  );
  // 各フィールドの編集モード => ダブルクリックで各フィールド名をstateに格納し、各フィールドをエディットモードへ
  const isEditModeField = useDashboardStore((state) => state.isEditModeField);
  const setIsEditModeField = useDashboardStore((state) => state.setIsEditModeField);
  const [isComposing, setIsComposing] = useState(false); // 日本語のように変換、確定が存在する言語入力の場合の日本語入力の変換中を保持するstate、日本語入力開始でtrue, エンターキーで変換確定した時にfalse

  // 会社詳細モーダル
  const setIsOpenClientCompanyDetailModal = useDashboardStore((state) => state.setIsOpenClientCompanyDetailModal);
  // 担当者詳細モーダル
  const setIsOpenContactDetailModal = useDashboardStore((state) => state.setIsOpenContactDetailModal);

  // const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  const { updateMeetingFieldMutation } = useMutateMeeting();

  // メディアクエリState デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  // 🌟サブミット
  const [inputCompanyName, setInputCompanyName] = useState("");
  const [inputDepartmentName, setInputDepartmentName] = useState("");
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
  // ----------------------- 🌟製品分類関連🌟 -----------------------
  // const [inputProductL, setInputProductL] = useState("");
  // const [inputProductM, setInputProductM] = useState("");
  // const [inputProductS, setInputProductS] = useState("");
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
    if (!selectedRowDataMeeting || !selectedRowDataMeeting.product_categories_large_array?.length) return "";
    return selectedRowDataMeeting.product_categories_large_array
      .map((name) =>
        optionsProductLNameOnlySet.has(name) ? `#${mappingProductL[name as ProductCategoriesLarge][language]}` : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataMeeting?.product_categories_large_array]);

  // 中分類
  const formattedProductCategoriesMedium = useMemo(() => {
    if (!selectedRowDataMeeting || !selectedRowDataMeeting.product_categories_medium_array?.length) return "";
    return selectedRowDataMeeting.product_categories_medium_array
      .map((name) =>
        productCategoriesMediumNameOnlySet.has(name)
          ? `#${mappingProductCategoriesMedium[name as ProductCategoriesMedium][language]}`
          : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataMeeting?.product_categories_medium_array]);

  // 小分類
  const formattedProductCategoriesSmall = useMemo(() => {
    if (!selectedRowDataMeeting || !selectedRowDataMeeting.product_categories_small_array?.length) return "";
    return selectedRowDataMeeting.product_categories_small_array
      .map((name) =>
        productCategoriesSmallNameOnlySet.has(name)
          ? `#${mappingProductCategoriesSmall[name as ProductCategoriesSmall][language]}`
          : `#-`
      )
      .join("　"); // #text1 #text2
  }, [selectedRowDataMeeting?.product_categories_small_array]);

  // ----------------------- 🌟製品分類関連🌟 ここまで -----------------------

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
  // Meetingテーブル
  const [inputMeetingCreatedByCompanyId, setInputMeetingCreatedByCompanyId] = useState("");
  const [inputMeetingCreatedByUserId, setInputMeetingCreatedByUserId] = useState("");
  const [inputMeetingCreatedByDepartmentOfUser, setInputMeetingCreatedByDepartmentOfUser] = useState("");
  const [inputMeetingCreatedBySectionOfUser, setInputMeetingCreatedBySectionOfUser] = useState("");
  const [inputMeetingCreatedByUnitOfUser, setInputMeetingCreatedByUnitOfUser] = useState("");
  const [inputMeetingCreatedByOfficeOfUser, setInputMeetingCreatedByOfficeOfUser] = useState("");
  const [inputMeetingType, setInputMeetingType] = useState("");
  const [inputWebTool, setInputWebTool] = useState("");
  const [inputPlannedDate, setInputPlannedDate] = useState<Date | null | "is not null" | "is null">(null);
  const [inputPlannedStartTime, setInputPlannedStartTime] = useState<string>("");
  const [inputPlannedStartTimeHour, setInputPlannedStartTimeHour] = useState<string>("");
  const [inputPlannedStartTimeMinute, setInputPlannedStartTimeMinute] = useState<string>("");
  const [inputPlannedPurpose, setInputPlannedPurpose] = useState("");
  const [inputPlannedDuration, setInputPlannedDuration] = useState<number | null | "is not null" | "is null">(null);
  const [inputPlannedAppointCheckFlag, setInputPlannedAppointCheckFlag] = useState<boolean | null>(null);
  const [inputPlannedProduct1, setInputPlannedProduct1] = useState("");
  const [inputPlannedProduct2, setInputPlannedProduct2] = useState("");
  const [inputPlannedComment, setInputPlannedComment] = useState("");
  const [inputResultDate, setInputResultDate] = useState<Date | null | "is not null" | "is null">(null);
  const [inputResultStartTime, setInputResultStartTime] = useState<string>("");
  const [inputResultStartTimeHour, setInputResultStartTimeHour] = useState<string>("");
  const [inputResultStartTimeMinute, setInputResultStartTimeMinute] = useState<string>("");
  const [inputResultEndTime, setInputResultEndTime] = useState<string>("");
  const [inputResultEndTimeHour, setInputResultEndTimeHour] = useState<string>("");
  const [inputResultEndTimeMinute, setInputResultEndTimeMinute] = useState<string>("");
  const [inputResultDuration, setInputResultDuration] = useState<number | null | "is not null" | "is null">(null);
  // const [inputResultNumberOfMeetingParticipants, setInputResultNumberOfMeetingParticipants] = useState<number | null>(
  //   null
  // );
  const [inputResultNumberOfMeetingParticipants, setInputResultNumberOfMeetingParticipants] = useState<
    number | null | "is not null" | "is null"
  >(null);
  const [inputResultPresentationProduct1, setInputResultPresentationProduct1] = useState("");
  const [inputResultPresentationProduct2, setInputResultPresentationProduct2] = useState("");
  const [inputResultPresentationProduct3, setInputResultPresentationProduct3] = useState("");
  const [inputResultPresentationProduct4, setInputResultPresentationProduct4] = useState("");
  const [inputResultPresentationProduct5, setInputResultPresentationProduct5] = useState("");
  const [inputResultCategory, setInputResultCategory] = useState("");
  const [inputResultSummary, setInputResultSummary] = useState("");
  const [inputResultNegotiateDecisionMaker, setInputResultNegotiateDecisionMaker] = useState("");
  const [inputResultTopPositionClass, setInputResultTopPositionClass] = useState("");
  const [inputPreMeetingParticipationRequest, setInputPreMeetingParticipationRequest] = useState("");
  const [inputMeetingParticipationRequest, setInputMeetingParticipationRequest] = useState("");
  const [inputMeetingBusinessOffice, setInputMeetingBusinessOffice] = useState("");
  const [inputMeetingDepartment, setInputMeetingDepartment] = useState("");
  const [inputMeetingMemberName, setInputMeetingMemberName] = useState("");
  // 年月度〜年度
  const [inputMeetingYearMonth, setInputMeetingYearMonth] = useState<string>("");
  const [inputMeetingQuarter, setInputMeetingQuarter] = useState<string>("");
  const [inputMeetingHalfYear, setInputMeetingHalfYear] = useState<string>("");
  const [inputMeetingFiscalYear, setInputMeetingFiscalYear] = useState<string>("");

  // ================================ 🌟フィールドエディットモード関連state🌟 ================================
  const [inputPlannedDateForFieldEditMode, setInputPlannedDateForFieldEditMode] = useState<Date | null>(null);
  const [inputResultDateForFieldEditMode, setInputResultDateForFieldEditMode] = useState<Date | null>(null);
  // フラグ関連 フィールドエディット用 初期はfalseにしておき、useEffectでselectedRowDataのフラグを反映する
  const [checkboxPlannedAppointCheckFlagForFieldEdit, setCheckboxPlannedAppointCheckFlagForFieldEdit] = useState(false); // アポ有りフラグ フィールドエディット用

  // フラグの初期値を更新
  useEffect(() => {
    setCheckboxPlannedAppointCheckFlagForFieldEdit(
      selectedRowDataMeeting?.planned_appoint_check_flag ? selectedRowDataMeeting?.planned_appoint_check_flag : false
    );
  }, [selectedRowDataMeeting?.planned_appoint_check_flag]);
  // ================================ ✅フィールドエディットモード関連state✅ ================================

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
    if (!sectionDataArray || sectionDataArray?.length === 0 || !inputMeetingCreatedByDepartmentOfUser)
      return setFilteredSectionBySelectedDepartment([]);

    // 選択中の事業部が変化するか、sectionDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (sectionDataArray && sectionDataArray.length >= 1 && inputMeetingCreatedByDepartmentOfUser) {
      const filteredSectionArray = sectionDataArray.filter(
        (section) => section.created_by_department_id === inputMeetingCreatedByDepartmentOfUser
      );
      setFilteredSectionBySelectedDepartment(filteredSectionArray);
    }
  }, [sectionDataArray, inputMeetingCreatedByDepartmentOfUser]);
  // ======================= ✅現在の選択した事業部で課を絞り込むuseEffect✅ =======================

  // 課ありパターン
  // ======================= 🌟現在の選択した課で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Unit[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!unitDataArray || unitDataArray?.length === 0 || !inputMeetingCreatedBySectionOfUser)
      return setFilteredUnitBySelectedSection([]);

    // 選択中の課が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (unitDataArray && unitDataArray.length >= 1 && inputMeetingCreatedBySectionOfUser) {
      const filteredUnitArray = unitDataArray.filter(
        (unit) => unit.created_by_section_id === inputMeetingCreatedBySectionOfUser
      );
      setFilteredUnitBySelectedSection(filteredUnitArray);
    }
  }, [unitDataArray, inputMeetingCreatedBySectionOfUser]);
  // ======================= ✅現在の選択した課で係・チームを絞り込むuseEffect✅ =======================

  // 課なしパターン
  // // ======================= 🌟現在の選択した事業部で係・チームを絞り込むuseEffect🌟 =======================
  // const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  // useEffect(() => {
  //   // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
  //   if (!unitDataArray || unitDataArray?.length === 0 || !inputMeetingCreatedByDepartmentOfUser)
  //     return setFilteredUnitBySelectedDepartment([]);

  //   // 選択中の事業部が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
  //   if (unitDataArray && unitDataArray.length >= 1 && inputMeetingCreatedByDepartmentOfUser) {
  //     const filteredUnitArray = unitDataArray.filter(
  //       (unit) => unit.created_by_department_id === inputMeetingCreatedByDepartmentOfUser
  //     );
  //     setFilteredUnitBySelectedDepartment(filteredUnitArray);
  //   }
  // }, [unitDataArray, inputMeetingCreatedByDepartmentOfUser]);
  // // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // 検索タイプ
  const searchType = useDashboardStore((state) => state.searchType);

  // サーチ編集モードでリプレイス前の値に復元する関数
  function beforeAdjustFieldValue(value: string | null) {
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
  }

  // 編集モードtrueの場合、サーチ条件をinputタグのvalueに格納
  // 新規サーチの場合には、サーチ条件を空にする
  useEffect(() => {
    // if (newSearchMeeting_Contact_CompanyParams === null) return;

    // 編集モード
    if (editSearchMode && searchMode) {
      if (newSearchMeeting_Contact_CompanyParams === null) return;
      console.log(
        "🔥Meetingメインコンテナー useEffect 編集モード inputにnewSearchMeeting_Contact_CompanyParamsを格納",
        newSearchMeeting_Contact_CompanyParams
      );
      //   setInputCompanyName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.company_name));
      setInputCompanyName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["client_companies.name"]));
      // setInputDepartmentName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.department_name));
      setInputDepartmentName(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["client_companies.department_name"])
      );
      //   setInputContactName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["contacts.name"]));
      setInputTel(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.main_phone_number));
      setInputFax(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.main_fax));
      setInputZipcode(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.zipcode));
      setInputEmployeesClass(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.number_of_employees_class));
      setInputAddress(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.address));
      setInputCapital(
        beforeAdjustFieldValue(
          newSearchMeeting_Contact_CompanyParams?.capital
            ? newSearchMeeting_Contact_CompanyParams?.capital.toString()
            : ""
        )
      );
      setInputFound(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.established_in));
      setInputContent(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams?.business_content));
      setInputHP(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.website_url));
      //   setInputCompanyEmail(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.company_email));
      setInputCompanyEmail(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["client_companies.email"]));
      setInputIndustryType(
        beforeAdjustFieldValue(
          newSearchMeeting_Contact_CompanyParams.industry_type_id
            ? newSearchMeeting_Contact_CompanyParams.industry_type_id.toString()
            : ""
        )
      );
      // ------------------------ 製品分類関連 ------------------------
      // 編集モードはidからnameへ変換
      // setInputProductL(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.product_category_large));
      // setInputProductM(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.product_category_medium));
      // setInputProductS(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.product_category_small));

      // 🔸大分類
      let productCategoryLargeNamesArray: ProductCategoriesLarge[] = [];
      if (0 < newSearchMeeting_Contact_CompanyParams.product_category_large_ids.length) {
        console.log(
          "============================ 大分類実行🔥",
          newSearchMeeting_Contact_CompanyParams.product_category_large_ids
        );
        // idからnameへ変換
        const largeIdToNameMap = new Map(optionsProductL.map((obj) => [obj.id, obj.name]));
        productCategoryLargeNamesArray = newSearchMeeting_Contact_CompanyParams.product_category_large_ids
          .map((id) => {
            return largeIdToNameMap.get(id);
          })
          .filter((name): name is ProductCategoriesLarge => name !== undefined && name !== null);
        setInputProductArrayLarge(productCategoryLargeNamesArray);
      }
      // 🔸中分類
      let productCategoryMediumNamesArray: ProductCategoriesMedium[] = [];
      if (
        0 < newSearchMeeting_Contact_CompanyParams.product_category_medium_ids.length &&
        0 < productCategoryLargeNamesArray.length
      ) {
        console.log(
          "============================ 中分類実行🔥",
          newSearchMeeting_Contact_CompanyParams.product_category_medium_ids,
          productCategoryLargeNamesArray
        );
        // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryLargeToOptionsMediumObjMap
        const optionsMediumObj = productCategoryLargeNamesArray
          .map((name) => productCategoryLargeToOptionsMediumObjMap[name])
          .flatMap((array) => array);
        const mediumIdToNameMap = new Map(optionsMediumObj.map((obj) => [obj.id, obj.name]));
        productCategoryMediumNamesArray = newSearchMeeting_Contact_CompanyParams.product_category_medium_ids
          .map((id) => {
            return mediumIdToNameMap.get(id);
          })
          .filter((name): name is ProductCategoriesMedium => name !== undefined && name !== null);
        setInputProductArrayMedium(productCategoryMediumNamesArray);
      }
      // 🔸小分類
      let productCategorySmallNamesArray: ProductCategoriesSmall[] = [];
      if (
        0 < newSearchMeeting_Contact_CompanyParams.product_category_small_ids.length &&
        0 < productCategoryMediumNamesArray.length
      ) {
        console.log("============================ 小分類実行🔥");
        // 選択中の大分類に紐づく全ての中分類のオブジェクトを取得 productCategoryMediumToOptionsSmallMap_All_obj
        const optionsSmallObj = productCategoryMediumNamesArray
          .map((name) => productCategoryMediumToOptionsSmallMap_All_obj[name])
          .flatMap((array) => array);
        const mediumIdToNameMap = new Map(optionsSmallObj.map((obj) => [obj.id, obj.name]));
        productCategorySmallNamesArray = newSearchMeeting_Contact_CompanyParams.product_category_small_ids
          .map((id) => {
            return mediumIdToNameMap.get(id);
          })
          .filter((name): name is ProductCategoriesSmall => name !== undefined && name !== null);
        setInputProductArraySmall(productCategorySmallNamesArray);
      }

      // ------------------------ 製品分類関連 ------------------------ ここまで
      setInputFiscal(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.fiscal_end_month));
      setInputBudgetRequestMonth1(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.budget_request_month1));
      setInputBudgetRequestMonth2(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.budget_request_month2));
      setInputClient(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.clients));
      setInputSupplier(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.supplier));
      setInputFacility(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.facility));
      setInputBusinessSite(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.business_sites));
      setInputOverseas(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.overseas_bases));
      setInputGroup(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.group_company));
      setInputCorporateNum(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.corporate_number));

      // contactsテーブル
      //   setInputContactName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.contact_name));
      setInputContactName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["contacts.name"]));
      setInputDirectLine(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.direct_line));
      setInputDirectFax(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.direct_fax));
      setInputExtension(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.extension));
      setInputCompanyCellPhone(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.company_cell_phone));
      setInputPersonalCellPhone(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.personal_cell_phone));
      //   setInputContactEmail(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.contact_email));
      setInputContactEmail(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["contacts.email"]));
      setInputPositionName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.position_name));
      // setInputPositionClass(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.position_class));
      // setInputOccupation(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.occupation));
      setInputPositionClass(
        newSearchMeeting_Contact_CompanyParams.position_class
          ? newSearchMeeting_Contact_CompanyParams.position_class.toString()
          : ""
      );
      setInputOccupation(
        newSearchMeeting_Contact_CompanyParams.occupation
          ? newSearchMeeting_Contact_CompanyParams.occupation.toString()
          : ""
      );
      setInputApprovalAmount(
        beforeAdjustFieldValue(
          newSearchMeeting_Contact_CompanyParams.approval_amount
            ? newSearchMeeting_Contact_CompanyParams.approval_amount.toString()
            : ""
        )
      );
      setInputContactCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["contacts.created_by_company_id"])
      );
      setInputContactCreatedByUserId(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["contacts.created_by_user_id"])
      );

      // meetingsテーブル
      setInputMeetingCreatedByCompanyId(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_company_id"])
      );
      setInputMeetingCreatedByUserId(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_user_id"])
      );
      setInputMeetingCreatedByDepartmentOfUser(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_department_of_user"])
      );
      setInputMeetingCreatedBySectionOfUser(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_section_of_user"])
      );
      setInputMeetingCreatedByUnitOfUser(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_unit_of_user"])
      );
      setInputMeetingCreatedByOfficeOfUser(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams["meetings.created_by_office_of_user"])
      );
      setInputMeetingType(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.meeting_type));
      // setInputScheduledFollowUpDate(
      //   beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.scheduled_follow_up_date)
      // );
      // setInputScheduledFollowUpDate(newSearchMeeting_Contact_CompanyParams.scheduled_follow_up_date);
      setInputWebTool("");
      setInputPlannedDate(
        newSearchMeeting_Contact_CompanyParams.planned_date
          ? new Date(newSearchMeeting_Contact_CompanyParams.planned_date)
          : null
      );
      // 時間、秒を分割して格納
      setInputPlannedStartTime(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.planned_start_time));
      const [plannedStartHour, plannedStartMinute] = newSearchMeeting_Contact_CompanyParams.planned_start_time
        ? newSearchMeeting_Contact_CompanyParams.planned_start_time.split(":")
        : ["", ""];
      setInputPlannedStartTimeHour(plannedStartHour);
      setInputPlannedStartTimeMinute(plannedStartMinute);
      setInputPlannedPurpose(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.planned_purpose));
      setInputPlannedAppointCheckFlag(newSearchMeeting_Contact_CompanyParams.planned_appoint_check_flag);
      setInputPlannedProduct1(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.planned_product1));
      setInputPlannedProduct2(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.planned_product2));
      setInputPlannedComment(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.planned_comment));
      setInputResultDate(
        newSearchMeeting_Contact_CompanyParams.result_date
          ? new Date(newSearchMeeting_Contact_CompanyParams.result_date)
          : null
      );
      // 時間、分を分割してそれぞれのstateに格納
      setInputResultStartTime(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_start_time));
      const [resultStartHour, resultStartMinute] = newSearchMeeting_Contact_CompanyParams.result_start_time
        ? newSearchMeeting_Contact_CompanyParams.result_start_time.split(":")
        : ["", ""];
      setInputResultStartTimeHour(resultStartHour);
      setInputResultStartTimeMinute(resultStartMinute);
      // 時間、分を分割してそれぞれのstateに格納
      setInputResultEndTime(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_end_time));
      const [resultEndHour, resultEndMinute] = newSearchMeeting_Contact_CompanyParams.result_end_time
        ? newSearchMeeting_Contact_CompanyParams.result_end_time.split(":")
        : ["", ""];
      setInputResultEndTimeHour(resultEndHour);
      setInputResultEndTimeMinute(resultEndMinute);
      setInputResultPresentationProduct1(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_presentation_product1)
      );
      setInputResultPresentationProduct2(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_presentation_product2)
      );
      setInputResultPresentationProduct3(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_presentation_product3)
      );
      setInputResultPresentationProduct4(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_presentation_product4)
      );
      setInputResultPresentationProduct5(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_presentation_product5)
      );
      setInputResultCategory(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_category));
      setInputResultSummary(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_summary));
      setInputResultNegotiateDecisionMaker(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.result_negotiate_decision_maker)
      );
      setInputResultTopPositionClass(
        newSearchMeeting_Contact_CompanyParams.result_top_position_class
          ? newSearchMeeting_Contact_CompanyParams.result_top_position_class.toString()
          : ""
      );
      setInputPreMeetingParticipationRequest(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.pre_meeting_participation_request)
      );
      setInputMeetingParticipationRequest(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.meeting_participation_request)
      );
      setInputMeetingBusinessOffice(
        beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.meeting_business_office)
      );
      setInputMeetingDepartment(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.meeting_department));
      setInputMeetingMemberName(beforeAdjustFieldValue(newSearchMeeting_Contact_CompanyParams.meeting_member_name));
      // 年月度 ~ 年度
      // setInputMeetingYearMonth(adjustFieldValueNumber(newSearchMeeting_Contact_CompanyParams.meeting_year_month));
      setInputMeetingYearMonth(
        newSearchMeeting_Contact_CompanyParams.meeting_year_month !== null
          ? String(newSearchMeeting_Contact_CompanyParams.meeting_year_month)
          : ""
      );
      setInputMeetingQuarter(
        newSearchMeeting_Contact_CompanyParams.meeting_quarter !== null
          ? String(newSearchMeeting_Contact_CompanyParams.meeting_quarter)
          : ""
      );
      setInputMeetingHalfYear(
        newSearchMeeting_Contact_CompanyParams.meeting_half_year !== null
          ? String(newSearchMeeting_Contact_CompanyParams.meeting_half_year)
          : ""
      );
      setInputMeetingFiscalYear(
        newSearchMeeting_Contact_CompanyParams.meeting_fiscal_year !== null
          ? String(newSearchMeeting_Contact_CompanyParams.meeting_fiscal_year)
          : ""
      );
    } else if (!editSearchMode && searchMode) {
      console.log(
        "🔥Meetingメインコンテナー useEffect 新規サーチモード inputを初期化",
        newSearchMeeting_Contact_CompanyParams
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
      // 製品分類の処理 ------------------------
      // if (!!inputProductL) setInputProductL("");
      // if (!!inputProductM) setInputProductM("");
      // if (!!inputProductS) setInputProductS("");
      if (!!inputProductArrayLarge.length) setInputProductArrayLarge([]);
      if (!!inputProductArrayMedium.length) setInputProductArrayMedium([]);
      if (!!inputProductArraySmall.length) setInputProductArraySmall([]);
      // 製品分類の処理 ------------------------ ここまで
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

      // meetingsテーブル
      if (!!inputMeetingCreatedByCompanyId) setInputMeetingCreatedByCompanyId("");
      if (!!inputMeetingCreatedByUserId) setInputMeetingCreatedByUserId("");
      if (!!inputMeetingCreatedByDepartmentOfUser) setInputMeetingCreatedByDepartmentOfUser("");
      if (!!inputMeetingCreatedBySectionOfUser) setInputMeetingCreatedBySectionOfUser("");
      if (!!inputMeetingCreatedByUnitOfUser) setInputMeetingCreatedByUnitOfUser("");
      if (!!inputMeetingCreatedByOfficeOfUser) setInputMeetingCreatedByOfficeOfUser("");
      if (!!inputMeetingType) setInputMeetingType("");
      if (!!inputWebTool) setInputWebTool("");
      if (!!inputPlannedDate) setInputPlannedDate(null);
      if (!!inputPlannedStartTime) setInputPlannedStartTime("");
      if (!!inputPlannedStartTimeHour) setInputPlannedStartTimeHour("");
      if (!!inputPlannedStartTimeMinute) setInputPlannedStartTimeMinute("");
      if (!!inputPlannedPurpose) setInputPlannedPurpose("");
      if (!!inputPlannedDuration) setInputPlannedDuration(null);
      if (!!inputPlannedAppointCheckFlag) setInputPlannedAppointCheckFlag(null);
      if (!!inputPlannedProduct1) setInputPlannedProduct1("");
      if (!!inputPlannedProduct2) setInputPlannedProduct2("");
      if (!!inputPlannedComment) setInputPlannedComment("");
      if (!!inputResultDate) setInputResultDate(null);
      if (!!inputResultStartTime) setInputResultStartTime("");
      if (!!inputResultStartTimeHour) setInputResultStartTimeHour("");
      if (!!inputResultStartTimeMinute) setInputResultStartTimeMinute("");
      if (!!inputResultEndTime) setInputResultEndTime("");
      if (!!inputResultEndTimeHour) setInputResultEndTimeHour("");
      if (!!inputResultEndTimeMinute) setInputResultEndTimeMinute("");
      if (!!inputResultPresentationProduct1) setInputResultPresentationProduct1("");
      if (!!inputResultPresentationProduct2) setInputResultPresentationProduct2("");
      if (!!inputResultPresentationProduct3) setInputResultPresentationProduct3("");
      if (!!inputResultPresentationProduct4) setInputResultPresentationProduct4("");
      if (!!inputResultPresentationProduct5) setInputResultPresentationProduct5("");
      if (!!inputResultCategory) setInputResultCategory("");
      if (!!inputResultSummary) setInputResultSummary("");
      if (!!inputResultNegotiateDecisionMaker) setInputResultNegotiateDecisionMaker("");
      if (!!inputResultTopPositionClass) setInputResultTopPositionClass("");
      if (!!inputPreMeetingParticipationRequest) setInputPreMeetingParticipationRequest("");
      if (!!inputMeetingParticipationRequest) setInputMeetingParticipationRequest("");
      if (!!inputMeetingBusinessOffice) setInputMeetingBusinessOffice("");
      if (!!inputMeetingDepartment) setInputMeetingDepartment("");
      if (!!inputMeetingMemberName) setInputMeetingMemberName("");
      // 年月度 ~ 年度
      // if (!!inputMeetingYearMonth) setInputMeetingYearMonth(null);
      if (!!inputMeetingYearMonth) setInputMeetingYearMonth("");
      if (!!inputMeetingQuarter) setInputMeetingQuarter("");
      if (!!inputMeetingHalfYear) setInputMeetingHalfYear("");
      if (!!inputMeetingFiscalYear) setInputMeetingFiscalYear("");
    }
  }, [editSearchMode, searchMode]);

  // // 予定面談開始時間、時間、分、結合用useEffect
  // useEffect(() => {
  //   const formattedTime = `${inputPlannedStartTimeHour}:${inputPlannedStartTimeMinute}`;
  //   setInputPlannedStartTime(formattedTime);
  // }, [inputPlannedStartTimeHour, inputPlannedStartTimeMinute]);
  // // 結果面談開始時間、時間、分、結合用useEffect
  // useEffect(() => {
  //   const formattedTime = `${inputResultStartTimeHour}:${inputResultStartTimeMinute}`;
  //   setInputResultStartTime(formattedTime);
  // }, [inputResultStartTimeHour, inputResultStartTimeMinute]);
  // // 結果面談終了時間、時間、分、結合用useEffect
  // useEffect(() => {
  //   const formattedTime = `${inputResultEndTimeHour}:${inputResultEndTimeMinute}`;
  //   setInputResultEndTime(formattedTime);
  // }, [inputResultEndTimeHour, inputResultEndTimeMinute]);

  // 予定面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    if (inputPlannedStartTimeHour && inputPlannedStartTimeMinute) {
      const formattedTime = `${inputPlannedStartTimeHour}:${inputPlannedStartTimeMinute}`;
      setInputPlannedStartTime(formattedTime);
    } else {
      // 時間のみなら前方一致、
      if (inputPlannedStartTimeHour && !inputPlannedStartTimeMinute) {
        const formattedTime = `${inputPlannedStartTimeHour}:*`;
        setInputPlannedStartTime(formattedTime);
      }
      // 分のみなら後方一致、
      else if (!inputPlannedStartTimeHour && inputPlannedStartTimeMinute) {
        const formattedTime = `*:${inputPlannedStartTimeMinute}`;
        setInputPlannedStartTime(formattedTime);
      }
      // 時間、分がなければ空文字
      else {
        setInputPlannedStartTime(""); // or setResultStartTime("");
      }
      // setInputPlannedStartTime(""); // or setResultStartTime("");
    }
  }, [inputPlannedStartTimeHour, inputPlannedStartTimeMinute]);
  // 結果面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    if (inputResultStartTimeHour && inputResultStartTimeMinute) {
      const formattedTime = `${inputResultStartTimeHour}:${inputResultStartTimeMinute}`;
      setInputResultStartTime(formattedTime);
    } else {
      // 時間のみなら前方一致、
      if (inputResultStartTimeHour && !inputResultStartTimeMinute) {
        const formattedTime = `${inputResultStartTimeHour}:*`;
        setInputResultStartTime(formattedTime);
      }
      // 分のみなら後方一致、
      else if (!inputResultStartTimeHour && inputResultStartTimeMinute) {
        const formattedTime = `*:${inputResultStartTimeMinute}`;
        setInputResultStartTime(formattedTime);
      }
      // 時間、分がなければ空文字
      else {
        setInputResultStartTime(""); // or setResultStartTime("");
      }
      // setInputResultStartTime(""); // or setResultStartTime("");
    }
  }, [inputResultStartTimeHour, inputResultStartTimeMinute]);
  // 結果面談終了時間、時間、分、結合用useEffect
  useEffect(() => {
    if (inputResultEndTimeHour && inputResultEndTimeMinute) {
      const formattedTime = `${inputResultEndTimeHour}:${inputResultEndTimeMinute}`;
      setInputResultEndTime(formattedTime);
    } else {
      // 時間のみなら前方一致、
      if (inputResultEndTimeHour && !inputResultEndTimeMinute) {
        const formattedTime = `${inputResultEndTimeHour}:*`;
        setInputResultEndTime(formattedTime);
      }
      // 分のみなら後方一致、
      else if (!inputResultEndTimeHour && inputResultEndTimeMinute) {
        const formattedTime = `*:${inputResultEndTimeMinute}`;
        setInputResultEndTime(formattedTime);
      }
      // 時間、分がなければ空文字
      else {
        setInputResultEndTime(""); // or setResultStartTime("");
      }
      // setInputResultEndTime(""); // or setResultStartTime("");
    }
  }, [inputResultEndTimeHour, inputResultEndTimeMinute]);

  // 数値型のフィールド用
  function adjustFieldValueNumber(value: number | null) {
    if (value === null) return null; // 全てのデータ
    return value;
  }

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

    // 🔸TEXT型以外もIS NULL, IS NOT NULLの条件を追加
    const adjustFieldValueInteger = (value: string | number | null): number | "ISNULL" | "ISNOTNULL" | null => {
      if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
      if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
      if (typeof value === "string") {
        if (isValidNumber(value) && !isNaN(parseInt(value!, 10))) {
          return parseInt(value!, 10);
        } else {
          return null;
        }
      }
      // number型
      else {
        if (value === null) return null; // 全てのデータ
        return value;
      }
    };

    // 🔸Date型
    const adjustFieldValueDate = (value: Date | string | null): string | null => {
      if (value instanceof Date) return value.toISOString();
      // "is null"か"is not null"の文字列は変換
      if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
      if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
      return null;
      // if (typeof inputScheduledFollowUpDate === "string") return adjustFieldValue(inputScheduledFollowUpDate);
    };

    setLoadingGlobalState(true);

    let _company_name = adjustFieldValue(inputCompanyName);
    let _department_name = adjustFieldValue(inputDepartmentName);
    let _main_phone_number = adjustFieldValue(inputTel);
    let _main_fax = adjustFieldValue(inputFax);
    let _zipcode = adjustFieldValue(inputZipcode);
    let _number_of_employees_class = adjustFieldValue(inputEmployeesClass);
    let _address = adjustFieldValue(inputAddress);
    // let _capital = adjustFieldValue(inputCapital) ? parseInt(inputCapital, 10) : null;
    let _capital = adjustFieldValueInteger(inputCapital);
    let _established_in = adjustFieldValue(inputFound);
    let _business_content = adjustFieldValue(inputContent);
    let _website_url = adjustFieldValue(inputHP);
    let _company_email = adjustFieldValue(inputCompanyEmail);
    // let _industry_type_id = isValidNumber(inputIndustryType) ? parseInt(inputIndustryType, 10) : null;
    let _industry_type_id = adjustFieldValueInteger(inputIndustryType);
    // // 🔸製品分類の配列内のnameをidに変換してから大中小を全て１つの配列にまとめてセットする
    // let _product_category_large = adjustFieldValue(inputProductL);
    // let _product_category_medium = adjustFieldValue(inputProductM);
    // let _product_category_small = adjustFieldValue(inputProductS);
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
    // let _position_class = adjustFieldValue(inputPositionClass) ? parseInt(inputPositionClass, 10) : null;
    let _position_class = adjustFieldValueInteger(inputPositionClass);
    // let _occupation = adjustFieldValue(inputOccupation) ? parseInt(inputOccupation, 10) : null;
    let _occupation = adjustFieldValueInteger(inputOccupation);
    // let _approval_amount = adjustFieldValue(inputApprovalAmount);
    // let _approval_amount = adjustFieldValue(inputApprovalAmount) ? parseInt(inputApprovalAmount, 10) : null;
    let _approval_amount = adjustFieldValueInteger(inputApprovalAmount);
    let _contact_created_by_company_id = adjustFieldValue(inputContactCreatedByCompanyId);
    let _contact_created_by_user_id = adjustFieldValue(inputContactCreatedByUserId);
    // meetingsテーブル
    let _meeting_created_by_company_id = userProfileState.company_id;
    let _meeting_created_by_user_id = adjustFieldValue(inputMeetingCreatedByUserId);
    let _meeting_created_by_department_of_user = adjustFieldValue(inputMeetingCreatedByDepartmentOfUser);
    let _meeting_created_by_section_of_user = adjustFieldValue(inputMeetingCreatedBySectionOfUser);
    let _meeting_created_by_unit_of_user = adjustFieldValue(inputMeetingCreatedByUnitOfUser);
    let _meeting_created_by_office_of_user = adjustFieldValue(inputMeetingCreatedByOfficeOfUser);
    let _meeting_type = adjustFieldValue(inputMeetingType);
    let _web_tool = adjustFieldValue(inputWebTool);
    // let _planned_date = inputPlannedDate ? inputPlannedDate.toISOString() : null;
    let _planned_date = adjustFieldValueDate(inputPlannedDate);
    let _planned_start_time = adjustFieldValue(inputPlannedStartTime);
    let _planned_purpose = adjustFieldValue(inputPlannedPurpose);
    // let _planned_duration = adjustFieldValueNumber(inputPlannedDuration);
    let _planned_duration = adjustFieldValueInteger(inputPlannedDuration);
    let _planned_appoint_check_flag = inputPlannedAppointCheckFlag;
    let _planned_product1 = adjustFieldValue(inputPlannedProduct1);
    let _planned_product2 = adjustFieldValue(inputPlannedProduct2);
    let _planned_comment = adjustFieldValue(inputPlannedComment);
    // let _result_date = inputResultDate ? inputResultDate.toISOString() : null;
    let _result_date = adjustFieldValueDate(inputResultDate);
    let _result_start_time = adjustFieldValue(inputResultStartTime);
    let _result_end_time = adjustFieldValue(inputResultEndTime);
    // let _result_duration = adjustFieldValueNumber(inputResultDuration);
    let _result_duration = adjustFieldValueInteger(inputResultDuration);
    // let _result_number_of_meeting_participants = adjustFieldValueNumber(inputResultNumberOfMeetingParticipants);
    let _result_number_of_meeting_participants = adjustFieldValueInteger(inputResultNumberOfMeetingParticipants);
    let _result_presentation_product1 = adjustFieldValue(inputResultPresentationProduct1);
    let _result_presentation_product2 = adjustFieldValue(inputResultPresentationProduct2);
    let _result_presentation_product3 = adjustFieldValue(inputResultPresentationProduct3);
    let _result_presentation_product4 = adjustFieldValue(inputResultPresentationProduct4);
    let _result_presentation_product5 = adjustFieldValue(inputResultPresentationProduct5);
    let _result_category = adjustFieldValue(inputResultCategory);
    let _result_summary = adjustFieldValue(inputResultSummary);
    let _result_negotiate_decision_maker = adjustFieldValue(inputResultNegotiateDecisionMaker);
    // let _result_top_position_class = adjustFieldValue(inputResultTopPositionClass)
    //   ? parseInt(inputResultTopPositionClass, 10)
    //   : null;
    let _result_top_position_class = adjustFieldValueInteger(inputResultTopPositionClass);
    let _pre_meeting_participation_request = adjustFieldValue(inputPreMeetingParticipationRequest);
    let _meeting_participation_request = adjustFieldValue(inputMeetingParticipationRequest);
    let _meeting_business_office = adjustFieldValue(inputMeetingBusinessOffice);
    let _meeting_department = adjustFieldValue(inputMeetingDepartment);
    let _meeting_member_name = adjustFieldValue(inputMeetingMemberName);
    // 年月度 ~ 年度
    // let _meeting_year_month = adjustFieldValueNumber(inputMeetingYearMonth);
    const parsedMeetingYearMonth = parseInt(inputMeetingYearMonth, 10);
    let _meeting_year_month =
      !isNaN(parsedMeetingYearMonth) && inputMeetingYearMonth === parsedMeetingYearMonth.toString()
        ? parsedMeetingYearMonth
        : null;
    const parsedMeetingQuarter = parseInt(inputMeetingQuarter, 10);
    let _meeting_quarter =
      !isNaN(parsedMeetingQuarter) && inputMeetingQuarter === parsedMeetingQuarter.toString()
        ? parsedMeetingQuarter
        : null;
    const parsedMeetingHalfYear = parseInt(inputMeetingHalfYear, 10);
    let _meeting_half_year =
      !isNaN(parsedMeetingHalfYear) && inputMeetingHalfYear === parsedMeetingHalfYear.toString()
        ? parsedMeetingHalfYear
        : null;
    const parsedMeetingFiscalYear = parseInt(inputMeetingFiscalYear, 10);
    let _meeting_fiscal_year =
      !isNaN(parsedMeetingFiscalYear) && inputMeetingFiscalYear === parsedMeetingFiscalYear.toString()
        ? parsedMeetingFiscalYear
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
      // department_name: _department_name,
      "client_companies.department_name": _department_name,
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
      industry_type_id: _industry_type_id,
      // 製品分類 ----------------
      // product_category_large: _product_category_large,
      // product_category_medium: _product_category_medium,
      // product_category_small: _product_category_small,
      product_category_large_ids: productCategoryLargeIdsArray,
      product_category_medium_ids: productCategoryMediumIdsArray,
      product_category_small_ids: productCategorySmallIdsArray,
      // 製品分類 ---------------- ここまで
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
      // "meetings.created_by_company_id": _meeting_created_by_company_id,
      "meetings.created_by_company_id": _meeting_created_by_company_id,
      "meetings.created_by_user_id": _meeting_created_by_user_id,
      "meetings.created_by_department_of_user": _meeting_created_by_department_of_user,
      "meetings.created_by_section_of_user": _meeting_created_by_section_of_user,
      "meetings.created_by_unit_of_user": _meeting_created_by_unit_of_user,
      "meetings.created_by_office_of_user": _meeting_created_by_office_of_user,
      meeting_type: _meeting_type,
      web_tool: _web_tool,
      planned_date: _planned_date,
      planned_start_time: _planned_start_time,
      planned_purpose: _planned_purpose,
      planned_duration: _planned_duration,
      planned_appoint_check_flag: _planned_appoint_check_flag,
      planned_product1: _planned_product1,
      planned_product2: _planned_product2,
      planned_comment: _planned_comment,
      result_date: _result_date,
      result_start_time: _result_start_time,
      result_end_time: _result_end_time,
      result_duration: _result_duration,
      result_number_of_meeting_participants: _result_number_of_meeting_participants,
      result_presentation_product1: _result_presentation_product1,
      result_presentation_product2: _result_presentation_product2,
      result_presentation_product3: _result_presentation_product3,
      result_presentation_product4: _result_presentation_product4,
      result_presentation_product5: _result_presentation_product5,
      result_category: _result_category,
      result_summary: _result_summary,
      result_negotiate_decision_maker: _result_negotiate_decision_maker,
      result_top_position_class: _result_top_position_class,
      pre_meeting_participation_request: _pre_meeting_participation_request,
      meeting_participation_request: _meeting_participation_request,
      meeting_business_office: _meeting_business_office,
      meeting_department: _meeting_department,
      meeting_member_name: _meeting_member_name,
      // 年月度〜年度
      meeting_year_month: _meeting_year_month,
      meeting_quarter: _meeting_quarter,
      meeting_half_year: _meeting_half_year,
      meeting_fiscal_year: _meeting_fiscal_year,
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
    // 製品分類 ----------------
    // setInputProductL("");
    // setInputProductM("");
    // setInputProductS("");
    setInputProductArrayLarge([]);
    setInputProductArrayMedium([]);
    setInputProductArraySmall([]);
    // 製品分類 ----------------ここまで
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
    // meetingsテーブル
    setInputMeetingCreatedByCompanyId("");
    setInputMeetingCreatedByUserId("");
    setInputMeetingCreatedByDepartmentOfUser("");
    setInputMeetingCreatedBySectionOfUser("");
    setInputMeetingCreatedByUnitOfUser("");
    setInputMeetingCreatedByOfficeOfUser("");
    setInputMeetingType("");
    setInputWebTool("");
    setInputPlannedDate(null);
    setInputPlannedStartTime("");
    setInputPlannedPurpose("");
    setInputPlannedAppointCheckFlag(null);
    setInputPlannedProduct1("");
    setInputPlannedProduct2("");
    setInputPlannedComment("");
    setInputResultDate(null);
    setInputResultStartTime("");
    setInputResultEndTime("");
    setInputResultPresentationProduct1("");
    setInputResultPresentationProduct2("");
    setInputResultPresentationProduct3("");
    setInputResultPresentationProduct4("");
    setInputResultPresentationProduct5("");
    setInputResultCategory("");
    setInputResultSummary("");
    setInputResultNegotiateDecisionMaker("");
    setInputResultTopPositionClass("");
    setInputPreMeetingParticipationRequest("");
    setInputMeetingParticipationRequest("");
    setInputMeetingBusinessOffice("");
    setInputMeetingDepartment("");
    setInputMeetingMemberName("");
    // 年月度〜年度
    // setInputMeetingYearMonth(null);
    setInputMeetingYearMonth("");
    setInputMeetingQuarter("");
    setInputMeetingHalfYear("");
    setInputMeetingFiscalYear("");

    // サーチモードオフ
    setSearchMode(false);
    setEditSearchMode(false);

    // Zustandに検索条件を格納
    setNewSearchMeeting_Contact_CompanyParams(params);

    // 選択中の列データをリセット
    setSelectedRowDataMeeting(null);

    console.log("✅ 条件 params", params);
    // const { data, error } = await supabase.rpc("search_companies", { params });
    // const { data, error } = await supabase.rpc("search_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_activities_and_companies_and_contacts", { params });
    // const { data, error } = await supabase.rpc("search_meetings_and_companies_and_contacts", { params });

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
  };

  // ==================================== 🌟ツールチップ🌟 ====================================
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
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

  // 🔹上期の月のSetオブジェクト
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

  // 🔹四半期のQ1とQ3の月のSetオブジェクト
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
  // 選択行データが自社専用の会社データかどうか
  const isMatchDepartment =
    !!userProfileState?.assigned_department_id &&
    !!selectedRowDataMeeting?.meeting_created_by_department_of_user &&
    selectedRowDataMeeting.meeting_created_by_department_of_user === userProfileState?.assigned_department_id;

  // シングルクリック => 何もアクションなし
  const handleSingleClickField = useCallback(
    (e: React.MouseEvent<HTMLSpanElement>) => {
      if (!selectedRowDataMeeting) return console.log("リターン");
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
    [selectedRowDataMeeting]
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
      if (!selectedRowDataMeeting) return;
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

        if (["planned_start_time", "result_start_time", "result_end_time"].includes(field)) {
          const formattedTime = formatTime(text);
          originalValueFieldEdit.current = formattedTime;
          const timeParts = splitTime(text);
          console.log("formattedTime", formattedTime);
          if (field === "planned_start_time") {
            setInputPlannedStartTimeHour(timeParts?.hours ?? "");
            setInputPlannedStartTimeMinute(timeParts?.minutes ?? "");
          } else if (field === "result_start_time") {
            setInputResultStartTimeHour(timeParts?.hours ?? "");
            setInputResultStartTimeMinute(timeParts?.minutes ?? "");
          } else if (field === "result_end_time") {
            setInputResultEndTimeHour(timeParts?.hours ?? "");
            setInputResultEndTimeMinute(timeParts?.minutes ?? "");
          }
          dispatch(formattedTime); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
          setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
          return;
        }
        if (field === "fiscal_end_month") {
          text = text.replace(/月/g, ""); // 決算月の場合は、1月の月を削除してstateに格納 optionタグのvalueと一致させるため
        }
        // // 「活動日付」「次回フォロー予定日」はinnerHTMLではなく元々の値を格納
        if (["planned_date", "result_date"].includes(field)) {
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
        originalValueFieldEdit.current = text;
        dispatch(text); // 編集モードでinputStateをクリックした要素のテキストを初期値に設定
        setIsEditModeField(field); // クリックされたフィールドの編集モードを開く
        // if (isSelectChangeEvent) originalOptionRef.current = e.currentTarget.innerText; // selectタグ同じ選択肢選択時の編集モード終了用
      }
    },
    [setIsEditModeField, selectedRowDataMeeting]
    // [isOurActivity, setIsEditModeField]
  );
  // ================== ✅シングルクリック、ダブルクリックイベント✅ ==================

  // プロパティ名のユニオン型の作成
  // Meeting_row_data型の全てのプロパティ名をリテラル型のユニオンとして展開
  // type ActivityFieldNames = keyof Meeting_row_data;
  type MeetingFieldNames = keyof Meeting;
  type ExcludeKeys = "company_id" | "contact_id" | "meeting_id"; // 除外するキー
  type MeetingFieldNamesForSelectedRowData = Exclude<keyof Meeting_row_data, ExcludeKeys>; // Meeting_row_dataタイプのプロパティ名のみのデータ型を取得
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
    fieldName: MeetingFieldNames;
    fieldNameForSelectedRowData: MeetingFieldNamesForSelectedRowData;
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

      if (!id || !selectedRowDataMeeting) {
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

      const updatePayload = {
        fieldName: fieldName,
        fieldNameForSelectedRowData: fieldNameForSelectedRowData,
        newValue: newValue,
        id: id,
      };
      // 入力変換確定状態でエンターキーが押された場合の処理
      console.log("onKeyDownイベント エンターキーが入力確定状態でクリック UPDATE実行 updatePayload", updatePayload);
      await updateMeetingFieldMutation.mutateAsync(updatePayload);
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
    fieldName: MeetingFieldNames;
    fieldNameForSelectedRowData: MeetingFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
    required: boolean;
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

    if (!id || !selectedRowDataMeeting) {
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

    if (["planned_date", "result_date"].includes(fieldName)) {
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
        if (fieldName === "planned_date" || fieldName === "result_date") {
          if (!closingDayRef.current || !fiscalEndMonthObjRef.current) {
            alert("決算日データが取得できませんでした。エラー：MMC02");
            return toast.error("決算日データが確認できないため、活動を更新できませんでした...🙇‍♀️");
          }
          if (!firstHalfDetailSet || !quarterDetailsSet) {
            alert("会計年度データが取得できませんでした。エラー：MMC03");
            return toast.error("会計年度データが確認できないため、活動を更新できませんでした...🙇‍♀️");
          }
          // if (!(newValue instanceof Date)) return toast.error("エラー：無効な日付です。");
          type ExcludeKeys = "company_id" | "contact_id" | "meeting_id"; // 除外するキー idはUPDATEすることは無いため
          type MeetingFieldNamesForSelectedRowData = Exclude<keyof Meeting_row_data, ExcludeKeys>;
          type UpdateObject = {
            fieldName: string;
            fieldNameForSelectedRowData: MeetingFieldNamesForSelectedRowData;
            newValue: any;
            id: string;
            meetingYearMonth?: number | null;
            meetingQuarter?: number | null;
            meetingHalfYear?: number | null;
            meetingFiscalYear?: number | null;
            requireUpdateActivityDate?: boolean | undefined;
          };

          // 🔹年月度
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
          const _meetingMonth = String(fiscalYearMonth).substring(4);
          const halfDetailValue = firstHalfDetailSet.has(_meetingMonth) ? 1 : 2;

          // 🔹半期
          const meetingHalfYear = selectedFiscalYear * 10 + halfDetailValue;

          // 🔹四半期
          let meetingQuarter = 0;
          // 上期ルート
          if (halfDetailValue === 1) {
            // Q1とQ2どちらを選択中か更新
            const firstQuarterSet = quarterDetailsSet.firstQuarterMonthSet;
            const quarterValue = firstQuarterSet.has(_meetingMonth) ? 1 : 2;
            meetingQuarter = selectedFiscalYear * 10 + quarterValue;
          }
          // 下期ルート
          else {
            // Q3とQ4どちらを選択中か更新
            const thirdQuarterSet = quarterDetailsSet.thirdQuarterMonthSet;
            const quarterValue = thirdQuarterSet.has(_meetingMonth) ? 3 : 4;
            meetingQuarter = selectedFiscalYear * 10 + quarterValue;
          }

          if (meetingQuarter === 0) {
            return alert("会計年度データが取得できませんでした。エラー: MMC02");
          }
          if (String(meetingHalfYear).length !== 5 || String(meetingQuarter).length !== 5) {
            if (String(meetingHalfYear).length !== 5)
              return alert("会計年度データが取得できませんでした。エラー: MMC03");
            if (String(meetingQuarter).length !== 5)
              return alert("会計年度データが取得できませんでした。エラー: MMC04");
          }
          // -------- 面談年度~四半期を算出 --------

          // 面談予定日付のみ存在している場合
          if (selectedRowDataMeeting.planned_date && !selectedRowDataMeeting.result_date) {
            if (fieldName === "result_date") {
              // selectedRowDataMeetingにresult_dateが存在していない状態でresult_dateフィールド編集は行われないため
              alert("面談日の更新に失敗しました。エラー：MMC99");
              return toast.error("日付の更新に失敗しました...🙇‍♀️");
            } else if (fieldName === "planned_date") {
              const updatePayload: UpdateObject = {
                fieldName: fieldName,
                fieldNameForSelectedRowData: fieldNameForSelectedRowData,
                newValue: !!newValue ? newValue : null,
                id: id,
                meetingYearMonth: fiscalYearMonth,
                meetingQuarter: meetingQuarter,
                meetingHalfYear: meetingHalfYear,
                meetingFiscalYear: selectedFiscalYear,
                requireUpdateActivityDate: true,
              };

              // 入力変換確定状態でエンターキーが押された場合の処理
              console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
              await updateMeetingFieldMutation.mutateAsync(updatePayload);
            }
          }
          // 面談予定日と面談日(結果)が両方存在している場合はresult_dateに基づいて、年月度と活動日を変更
          else if (selectedRowDataMeeting.planned_date && selectedRowDataMeeting.result_date) {
            if (fieldName === "result_date") {
              const updatePayload: UpdateObject = {
                fieldName: fieldName,
                fieldNameForSelectedRowData: fieldNameForSelectedRowData,
                newValue: !!newValue ? newValue : null,
                id: id,
                meetingYearMonth: fiscalYearMonth,
                meetingQuarter: meetingQuarter,
                meetingHalfYear: meetingHalfYear,
                meetingFiscalYear: selectedFiscalYear,
              };
              // 入力変換確定状態でエンターキーが押された場合の処理
              console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
              await updateMeetingFieldMutation.mutateAsync(updatePayload);
            } else if (fieldName === "planned_date") {
              const updatePayload: UpdateObject = {
                fieldName: fieldName,
                fieldNameForSelectedRowData: fieldNameForSelectedRowData,
                newValue: !!newValue ? newValue : null,
                id: id,
                requireUpdateActivityDate: false,
              };

              // 入力変換確定状態でエンターキーが押された場合の処理
              console.log("selectタグでUPDATE実行 updatePayload", updatePayload);
              await updateMeetingFieldMutation.mutateAsync(updatePayload);
            }
          }
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
    await updateMeetingFieldMutation.mutateAsync(updatePayload);
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
    fieldName: MeetingFieldNames;
    fieldNameForSelectedRowData: MeetingFieldNamesForSelectedRowData;
    originalValue: any;
    newValue: any;
    id: string | undefined;
  }) => {
    e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove

    if (!id || !selectedRowDataMeeting) {
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
    await updateMeetingFieldMutation.mutateAsync(updatePayload);
    originalValueFieldEdit.current = ""; // 元フィールドデータを空にする
    setIsEditModeField(null); // エディットモードを終了
  };
  // ================== ✅セレクトボックスで個別フィールドをアップデート ==================

  // 商品名を取得する関数
  const getCustomProductName = (
    productNamesArray: IntroducedProductsNames | null,
    index: number,
    alternativeName: string | null
  ) => {
    if (!productNamesArray) {
      return "";
    } else {
      if (
        productNamesArray.length > index + 1 &&
        !!getProductName(
          productNamesArray[index].introduced_product_name,
          productNamesArray[index].introduced_inside_short_name,
          productNamesArray[index].introduced_outside_short_name
        )
      ) {
        return getProductName(
          productNamesArray[index].introduced_product_name,
          productNamesArray[index].introduced_inside_short_name,
          productNamesArray[index].introduced_outside_short_name
        );
      } else {
        return alternativeName ? alternativeName : "";
      }
    }
  };
  // 実施商品ALLを構築する関数
  const getProductNamesAll = (productNamesArray: IntroducedProductsNames | null) => {
    if (!productNamesArray || productNamesArray?.length === 0) return "";
    const productNames = productNamesArray.map((product, index) => {
      if (
        !!getProductName(
          product.introduced_product_name,
          product.introduced_inside_short_name,
          product.introduced_outside_short_name
        )
      ) {
        return getProductName(
          product.introduced_product_name,
          product.introduced_inside_short_name,
          product.introduced_outside_short_name
        );
      } else {
        return;
      }
    });
    // const productNamesObj = { ...productNames };
    console.log("productNames", productNames, productNamesArray);
    return productNames.join(" / ");
  };

  const handleAppointCheckChangeSelectTagValue = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;

    switch (value) {
      case "チェック有り":
        setInputPlannedAppointCheckFlag(true);
        break;
      case "チェック無し":
        setInputPlannedAppointCheckFlag(false);
        break;
      default:
        setInputPlannedAppointCheckFlag(null);
    }
  };

  const hours = useMemo(() => {
    return Array.from({ length: 24 }, (_, index) => (index < 10 ? "0" + index : "" + index));
  }, []);
  const minutes5 = useMemo(() => {
    return Array.from({ length: 12 }, (_, index) => (index * 5 < 10 ? "0" + index * 5 : "" + index * 5));
  }, []);
  const minutes = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => (i < 10 ? "0" + i : "" + i));
  }, []);

  // 同席者リストから各同席者を「 / \n」で区切った一つの文字列に変換する関数
  // 形式は「佐藤(株式会社X・営業部・部長) / \n ...」
  const formatAttendees = (attendees: AttendeeInfo[] | undefined | null) => {
    if (!attendees || attendees?.length === 0) return "";
    const _formatAttendees = attendees
      .map((attendee) => {
        return `${attendee.attendee_name ?? ""}(${
          attendee.attendee_company ? attendee.attendee_company + (attendee.attendee_department_name && `・`) : ""
        }${
          attendee.attendee_department_name
            ? attendee.attendee_department_name + (attendee.attendee_position_name && `・`)
            : ""
        }${attendee.attendee_position_name ?? ""})`;
      })
      .join(` / \n`);

    return _formatAttendees;
  };

  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const [isOpenTimePicker, setIsOpenTimePicker] = useState(false);
  const timePickerTypeRef = useRef<"planned" | "result_start" | "result_end">("planned");
  const timePickerIncrementTypeRef = useRef<"all" | "5">("all");

  const presetTimes = [
    { time: "08:30", hour: "08", minute: "30" },
    { time: "10:30", hour: "10", minute: "30" },
    { time: "13:00", hour: "13", minute: "00" },
    { time: "15:00", hour: "15", minute: "00" },
    { time: "17:00", hour: "17", minute: "00" },
  ];

  // タイムピッカーに渡すstate
  const getTimePickerState = (type: "planned" | "result_start" | "result_end") => {
    switch (type) {
      case "planned":
        return {
          columnName: language === "ja" ? `面談開始（予定）` : ``,
          hourState: inputPlannedStartTimeHour,
          setHourState: setInputPlannedStartTimeHour,
          minuteState: inputPlannedStartTimeMinute,
          setMinuteState: setInputPlannedStartTimeMinute,
        };
        break;
      case "result_start":
        return {
          columnName: language === "ja" ? `面談開始（結果）` : ``,
          hourState: inputResultStartTimeHour,
          setHourState: setInputResultStartTimeHour,
          minuteState: inputResultStartTimeMinute,
          setMinuteState: setInputResultStartTimeMinute,
        };
        break;
      case "result_end":
        return {
          columnName: language === "ja" ? `面談開始（結果）` : ``,
          hourState: inputResultEndTimeHour,
          setHourState: setInputResultEndTimeHour,
          minuteState: inputResultEndTimeMinute,
          setMinuteState: setInputResultEndTimeMinute,
        };
        break;

      default:
        return {
          columnName: language === "ja" ? `面談開始（予定）` : ``,
          hourState: inputResultStartTimeHour,
          setHourState: setInputResultStartTimeHour,
          minuteState: inputResultStartTimeMinute,
          setMinuteState: setInputResultStartTimeMinute,
        };
        break;
    }
  };

  // -------------------------- 🌠サーチモード input下の追加エリア関連🌠 --------------------------
  // ツールチップ
  const additionalInputTooltipText = (index: number) =>
    index === 0 ? `空欄以外のデータのみ抽出` : `空欄のデータのみ抽出`;
  // 🔸「入力値をリセット」をクリック
  const handleClickResetInput = (dispatch: Dispatch<SetStateAction<any>>, inputType: "string" = "string") => {
    handleCloseTooltip();
    if (inputType === "string") {
      dispatch("");
    }
  };
  // 🔸「入力有り」をクリック
  const handleClickIsNotNull = (dispatch: Dispatch<SetStateAction<any>>, inputType: "string" = "string") => {
    return dispatch("is not null");
    // if (inputType === "string") {
    //   dispatch("is not null");
    // }
  };
  // 🔸「入力無し」をクリック
  const handleClickIsNull = (dispatch: Dispatch<SetStateAction<any>>, inputType: "string" = "string") => {
    return dispatch("is null");
    // if (inputType === "string") {
    //   dispatch("is null");
    // }
  };
  const handleClickAdditionalAreaBtn = (index: number, dispatch: Dispatch<SetStateAction<any>>) => {
    if (index === 0) handleClickIsNotNull(dispatch);
    if (index === 1) handleClickIsNull(dispatch);
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
    "MeetingMainContainerレンダリング"
    // "selectedRowDataMeeting",
    // selectedRowDataMeeting,
    // "newSearchMeeting_Contact_CompanyParams",
    // newSearchMeeting_Contact_CompanyParams,
    // "inputPlannedStartTime",
    // inputPlannedStartTime,
    // "inputPlannedStartTimeHour",
    // inputPlannedStartTimeHour,
    // "inputPlannedStartTimeMinute",
    // inputPlannedStartTimeMinute
    // "✅✅✅✅✅✅✅✅✅✅✅同席者リスト",
    // formatAttendees(selectedRowDataMeeting?.attendees_info)
  );

  return (
    <>
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
          {/* ---------------- 通常モード 左コンテナ ---------------- */}
          {!searchMode && (
            <div
              // className={`${styles.left_container1 h-full min-w-[calc((100vw-var(--sidebar-width))/3)1 pb-[35px] pt-[10px]`}
              className={`${styles.left_container} ${
                isOpenSidebar ? `transition-base02` : `transition-base01`
              } h-full pb-[35px] pt-[0px] ${
                tableContainerSize === "one_third"
                  ? `min-w-[calc((100vw-var(--sidebar-width))/3-11px)] max-w-[calc((100vw-var(--sidebar-width))/3-11px)]`
                  : `min-w-[calc((100vw-var(--sidebar-width))/3-14px)] max-w-[calc((100vw-var(--sidebar-width))/3-14px)]`
              }`}
            >
              {/* --------- ラッパー --------- */}
              <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
                {/* 予定 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.section_title}`}>予定</span>

                      {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                    </span> */}
                    </div>
                    <div className={`${styles.section_underline}`}></div>
                  </div>
                </div>

                {/* ●面談日・●面談ﾀｲﾌﾟ */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>●面談日</span>
                      {!searchMode && isEditModeField !== "planned_date" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // if (!selectedRowDataMeeting?.activity_type) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.activity_type)) {
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.activity_type));
                            // }
                            handleDoubleClickField({
                              e,
                              field: "planned_date",
                              dispatch: setInputPlannedDateForFieldEditMode,
                              dateValue: selectedRowDataMeeting?.planned_date
                                ? selectedRowDataMeeting.planned_date
                                : null,
                            });
                          }}
                          data-text={`${
                            selectedRowDataMeeting?.planned_date
                              ? format(new Date(selectedRowDataMeeting.planned_date), "yyyy/MM/dd")
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
                          {selectedRowDataMeeting?.planned_date
                            ? format(new Date(selectedRowDataMeeting.planned_date), "yyyy/MM/dd")
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード Date-picker  */}
                      {!searchMode && isEditModeField === "planned_date" && (
                        <>
                          <div className="z-[2000] w-full">
                            <DatePickerCustomInput
                              startDate={inputPlannedDateForFieldEditMode}
                              setStartDate={setInputPlannedDateForFieldEditMode}
                              required={true}
                              isFieldEditMode={true}
                              fieldEditModeBtnAreaPosition="right"
                              isLoadingSendEvent={updateMeetingFieldMutation.isLoading}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                if (!inputPlannedDateForFieldEditMode) return alert("このデータは入力が必須です。");
                                const originalDateUTCString = selectedRowDataMeeting?.planned_date
                                  ? selectedRowDataMeeting.planned_date
                                  : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                                const newDateUTCString = inputPlannedDateForFieldEditMode
                                  ? inputPlannedDateForFieldEditMode.toISOString()
                                  : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                                // const result = isSameDateLocal(originalDateString, newDateString);
                                console.log(
                                  "日付送信クリック",
                                  "オリジナル(UTC)",
                                  originalDateUTCString,
                                  "新たな値(Dateオブジェクト)",
                                  inputPlannedDateForFieldEditMode,
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
                                  fieldName: "planned_date",
                                  fieldNameForSelectedRowData: "planned_date",
                                  // originalValue: originalValueFieldEdit.current,
                                  originalValue: originalDateUTCString,
                                  newValue: newDateUTCString,
                                  id: selectedRowDataMeeting?.meeting_id,
                                  required: true,
                                });
                              }}
                            />
                          </div>
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "planned_date" && (
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
                  {/* 面談タイプ */}
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>●面談ﾀｲﾌﾟ</span>
                      {!searchMode && isEditModeField !== "meeting_type" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataMeeting?.meeting_type) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.meeting_type))
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.meeting_type));
                            handleDoubleClickField({
                              e,
                              field: "meeting_type",
                              dispatch: setInputMeetingType,
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataMeeting?.meeting_type
                              ? getMeetingType(selectedRowDataMeeting?.meeting_type)
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
                          {selectedRowDataMeeting?.meeting_type
                            ? getMeetingType(selectedRowDataMeeting?.meeting_type)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "meeting_type" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputMeetingType}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "meeting_type",
                                fieldNameForSelectedRowData: "meeting_type",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataMeeting?.meeting_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            {/* <option value=""></option> */}
                            {optionsMeetingType.map((option) => (
                              <option key={option} value={option}>
                                {getMeetingType(option)}
                              </option>
                            ))}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateMeetingFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "meeting_type" && (
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

                {/* 面談開始・WEBツール */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>面談開始</span>
                      {!searchMode && isEditModeField !== "planned_start_time" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataMeeting?.planned_start_time) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.meeting_type))
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.meeting_type));
                            handleDoubleClickField({
                              e,
                              field: "planned_start_time",
                              dispatch: setInputPlannedStartTime,
                              selectedRowDataValue: selectedRowDataMeeting.planned_start_time,
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataMeeting?.planned_start_time ? selectedRowDataMeeting?.planned_start_time : ""
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
                          {selectedRowDataMeeting?.planned_start_time
                            ? formatTime(selectedRowDataMeeting?.planned_start_time)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "planned_start_time" && (
                        <>
                          {/* <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                          value={inputPlannedStartTime}
                          onChange={(e) => {
                            handleChangeSelectUpdateField({
                              e,
                              fieldName: "planned_start_time",
                              fieldNameForSelectedRowData: "planned_start_time",
                              newValue: e.target.value,
                              originalValue: originalValueFieldEdit.current,
                              id: selectedRowDataMeeting?.meeting_id,
                            });
                          }}
                        >
                          {optionsMeetingType.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select> */}
                          <select
                            className={`ml-auto h-full w-[80%] cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            placeholder="時"
                            value={inputPlannedStartTimeHour}
                            onChange={(e) => setInputPlannedStartTimeHour(e.target.value === "" ? "" : e.target.value)}
                          >
                            <option value=""></option>
                            {hours.map((hour) => (
                              <option key={hour} value={hour}>
                                {hour}
                              </option>
                            ))}
                          </select>

                          <span className="pointer-events-none mx-[5px]">:</span>

                          <select
                            className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            placeholder="分"
                            value={inputPlannedStartTimeMinute}
                            onChange={(e) =>
                              setInputPlannedStartTimeMinute(e.target.value === "" ? "" : e.target.value)
                            }
                          >
                            <option value=""></option>
                            {minutes5.map((minute) => (
                              <option key={minute} value={minute}>
                                {minute}
                              </option>
                            ))}
                          </select>
                          {/* 送信、バツボタンエリア */}
                          {!updateMeetingFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_btn_area} ${
                                !updateMeetingFieldMutation.isLoading
                                  ? styles.right_position
                                  : styles.right_position_loading
                              }  space-x-[6px]`}
                            >
                              {/* 送信ボタン フィールドエディットモード専用 */}
                              {!updateMeetingFieldMutation.isLoading && (
                                <div
                                  className={`flex-center transition-bg03 group min-h-[26px] min-w-[26px] rounded-full border border-solid border-transparent ${
                                    !inputPlannedStartTimeHour ||
                                    !inputPlannedStartTimeMinute ||
                                    `${inputPlannedStartTimeHour}:${inputPlannedStartTimeMinute}` ===
                                      originalValueFieldEdit.current
                                      ? `cursor-not-allowed text-[#999]`
                                      : `border-[var(--color-bg-brand-f) cursor-pointer hover:bg-[var(--color-bg-brand-f)] hover:shadow-lg`
                                  }`}
                                  onClick={(e) => {
                                    if (!inputPlannedStartTimeHour || !inputPlannedStartTimeMinute) return;
                                    handleClickSendUpdateField({
                                      e,
                                      fieldName: "planned_start_time",
                                      fieldNameForSelectedRowData: "planned_start_time",
                                      newValue: `${inputPlannedStartTimeHour}:${inputPlannedStartTimeMinute}`,
                                      originalValue: originalValueFieldEdit.current,
                                      id: selectedRowDataMeeting?.meeting_id,
                                      required: true,
                                    });
                                  }}
                                >
                                  <IoIosSend
                                    className={`text-[20px] ${
                                      !inputPlannedStartTimeHour ||
                                      !inputPlannedStartTimeMinute ||
                                      `${inputPlannedStartTimeHour}:${inputPlannedStartTimeMinute}` ===
                                        originalValueFieldEdit.current
                                        ? `text-[#999] group-hover:text-[#999]`
                                        : `text-[var(--color-bg-brand-f)] group-hover:text-[#fff]`
                                    }`}
                                  />
                                </div>
                              )}
                              {/* バツボタン フィールドエディットモード専用 */}
                              {!updateMeetingFieldMutation.isLoading && (
                                <div
                                  className={`${
                                    inputPlannedStartTimeHour && inputPlannedStartTimeMinute
                                      ? `${styles.close_btn_field_edit_mode} hover:shadow-lg`
                                      : `${styles.close_btn_field_edit_mode_empty}`
                                  }`}
                                  onClick={() => {
                                    if (inputPlannedStartTimeHour === "08" && inputPlannedStartTimeMinute === "30")
                                      return;
                                    setInputPlannedStartTimeHour("08");
                                    setInputPlannedStartTimeMinute("30");
                                  }}
                                >
                                  <MdClose className="text-[20px] " />
                                </div>
                              )}
                              {/* ローディング フィールドエディットモード専用 */}
                              {/* {!updateMeetingFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )} */}
                            </div>
                          )}
                          {/* <span className="ml-[5px]">分</span> */}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateMeetingFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "planned_start_time" && (
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
                      <span className={`${styles.title}`}>WEBﾂｰﾙ</span>
                      {!searchMode && isEditModeField !== "web_tool" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataMeeting?.web_tool) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.meeting_type))
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.meeting_type));
                            handleDoubleClickField({
                              e,
                              field: "web_tool",
                              dispatch: setInputWebTool,
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataMeeting?.meeting_type ? getWebTool(selectedRowDataMeeting?.meeting_type) : ""
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
                          {selectedRowDataMeeting?.web_tool ? getWebTool(selectedRowDataMeeting?.web_tool) : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "web_tool" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputWebTool}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "web_tool",
                                fieldNameForSelectedRowData: "web_tool",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataMeeting?.meeting_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            {/* <option value=""></option> */}
                            {optionsWebTool.map((option) => (
                              <option key={option} value={option}>
                                {getWebTool(option)}
                              </option>
                            ))}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateMeetingFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "web_tool" && (
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

                {/* 面談時間(分) */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      {/* <span className={`${styles.title} text-[12px]`}>面談時間(分)</span> */}
                      <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                        <span className={``}>面談時間</span>
                        <span className={``}>(分)</span>
                      </div>
                      {!searchMode && isEditModeField !== "planned_duration" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            if (!selectedRowDataMeeting?.meeting_type) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.meeting_type))
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.meeting_type));
                            handleDoubleClickField({
                              e,
                              field: "planned_duration",
                              dispatch: setInputPlannedDuration,
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataMeeting?.meeting_type ? selectedRowDataMeeting?.meeting_type : ""
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
                          {selectedRowDataMeeting?.planned_duration ? selectedRowDataMeeting?.planned_duration : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "planned_duration" && (
                        <>
                          <input
                            type="number"
                            min="0"
                            className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                            placeholder=""
                            value={inputPlannedDuration === null ? "" : inputPlannedDuration}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "") {
                                setInputPlannedDuration(null);
                              } else {
                                const numValue = Number(val);

                                // 入力値がマイナスかチェック
                                if (numValue < 0) {
                                  setInputPlannedDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                                } else {
                                  setInputPlannedDuration(numValue);
                                }
                              }
                            }}
                            onCompositionStart={() => setIsComposing(true)}
                            onCompositionEnd={() => setIsComposing(false)}
                            onKeyDown={(e) =>
                              handleKeyDownUpdateField({
                                e,
                                fieldName: "planned_duration",
                                fieldNameForSelectedRowData: "planned_duration",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputPlannedDuration,
                                id: selectedRowDataMeeting?.meeting_id,
                                required: false,
                              })
                            }
                          />
                          {/* 送信ボタンとクローズボタン */}
                          {!updateMeetingFieldMutation.isLoading && (
                            <InputSendAndCloseBtn<number | null>
                              inputState={inputPlannedDuration as number | null}
                              setInputState={setInputPlannedDuration as Dispatch<SetStateAction<number | null>>}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "planned_duration",
                                  fieldNameForSelectedRowData: "planned_duration",
                                  originalValue: originalValueFieldEdit.current,
                                  newValue: inputPlannedDuration,
                                  id: selectedRowDataMeeting?.meeting_id,
                                  required: false,
                                })
                              }
                              required={true}
                              isDisplayClose={false}
                            />
                          )}
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateMeetingFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "planned_duration" && (
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
                    <div className={`${styles.title_box} flex h-full items-center`}></div>
                  </div>
                </div>

                {/* 面談目的(訪問目的)・アポ有 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} flex flex-col`}>
                        <span className={``}>面談目的</span>
                      </div>
                      {!searchMode && isEditModeField !== "planned_purpose" && (
                        <span
                          className={`${styles.value} ${styles.editable_field}`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            console.log("クリック");
                            if (!selectedRowDataMeeting?.planned_purpose) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.planned_purpose))
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.planned_purpose));
                            handleDoubleClickField({
                              e,
                              field: "planned_purpose",
                              dispatch: setInputPlannedPurpose,
                            });
                            handleCloseTooltip();
                          }}
                          data-text={`${
                            selectedRowDataMeeting?.planned_purpose
                              ? getPlannedPurpose(selectedRowDataMeeting?.planned_purpose)
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
                          {selectedRowDataMeeting?.planned_purpose
                            ? getPlannedPurpose(selectedRowDataMeeting.planned_purpose)
                            : ""}
                        </span>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード selectタグ  */}
                      {!searchMode && isEditModeField === "planned_purpose" && (
                        <>
                          <select
                            className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                            value={inputPlannedPurpose}
                            onChange={(e) => {
                              handleChangeSelectUpdateField({
                                e,
                                fieldName: "planned_purpose",
                                fieldNameForSelectedRowData: "planned_purpose",
                                newValue: e.target.value,
                                originalValue: originalValueFieldEdit.current,
                                id: selectedRowDataMeeting?.meeting_id,
                              });
                            }}
                            // onChange={(e) => {
                            //   setInputActivityType(e.target.value);
                            // }}
                          >
                            {/* <option value=""></option> */}
                            {optionsPlannedPurpose.map((option) => (
                              <option key={option} value={option}>
                                {getPlannedPurpose(option)}
                              </option>
                            ))}
                          </select>
                          {/* エディットフィールド送信中ローディングスピナー */}
                          {updateMeetingFieldMutation.isLoading && (
                            <div
                              className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                            >
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )}
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "planned_purpose" && (
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
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>アポ有</span>

                      <div
                        className={`${styles.grid_select_cell_header} `}
                        onMouseEnter={(e) => {
                          if (!selectedRowDataMeeting) return;
                          e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                        }}
                        onMouseLeave={(e) => {
                          if (!selectedRowDataMeeting) return;
                          e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                        }}
                      >
                        <input
                          type="checkbox"
                          // checked={!!selectedRowDataMeeting?.planned_appoint_check_flag}
                          // onChange={() => {
                          //   setLoadingGlobalState(false);
                          //   setIsOpenUpdateMeetingModal(true);
                          // }}
                          className={`${styles.grid_select_cell_header_input} ${
                            !selectedRowDataMeeting ? `pointer-events-none cursor-not-allowed` : ``
                          }`}
                          checked={checkboxPlannedAppointCheckFlagForFieldEdit}
                          onChange={async (e) => {
                            if (!selectedRowDataMeeting) return;
                            // 個別にチェックボックスを更新するルート
                            if (!selectedRowDataMeeting?.meeting_id)
                              return toast.error(`データが見つかりませんでした🙇‍♀️`);

                            console.log(
                              "チェック 新しい値",
                              !checkboxPlannedAppointCheckFlagForFieldEdit,
                              "オリジナル",
                              selectedRowDataMeeting?.planned_appoint_check_flag
                            );
                            if (
                              !checkboxPlannedAppointCheckFlagForFieldEdit ===
                              selectedRowDataMeeting?.planned_appoint_check_flag
                            ) {
                              toast.error(`アップデートに失敗しました🤦‍♀️`);
                              return;
                            }
                            const updatePayload = {
                              fieldName: "planned_appoint_check_flag",
                              fieldNameForSelectedRowData: "planned_appoint_check_flag" as "planned_appoint_check_flag",
                              newValue: !checkboxPlannedAppointCheckFlagForFieldEdit,
                              id: selectedRowDataMeeting.meeting_id,
                            };
                            // 直感的にするためにmutateにして非同期処理のまま後続のローカルのチェックボックスを更新する
                            updateMeetingFieldMutation.mutate(updatePayload);
                            setCheckboxPlannedAppointCheckFlagForFieldEdit(
                              !checkboxPlannedAppointCheckFlagForFieldEdit
                            );
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

                {/* 紹介予定ﾒｲﾝ・紹介予定ｻﾌﾞ */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title} text-[12px]`}>紹介予定ﾒｲﾝ</span>
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
                          {/* {selectedRowDataMeeting?.planned_product1 ? selectedRowDataMeeting?.planned_product1 : ""} */}
                          {!selectedRowDataMeeting?.planned_inside_short_name1 &&
                          selectedRowDataMeeting?.planned_product_name1
                            ? selectedRowDataMeeting?.planned_product_name1 +
                              " " +
                              selectedRowDataMeeting?.planned_outside_short_name1
                            : ""}
                          {selectedRowDataMeeting?.planned_inside_short_name1
                            ? selectedRowDataMeeting?.planned_inside_short_name1
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title} text-[12px]`}>紹介予定ｻﾌﾞ</span>
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
                          {/* {selectedRowDataMeeting?.planned_product2 ? selectedRowDataMeeting?.planned_product2 : ""} */}
                          {!selectedRowDataMeeting?.planned_inside_short_name2 &&
                          selectedRowDataMeeting?.planned_product_name2
                            ? selectedRowDataMeeting?.planned_product_name2 +
                              " " +
                              selectedRowDataMeeting?.planned_outside_short_name2
                            : ""}
                          {selectedRowDataMeeting?.planned_inside_short_name2
                            ? selectedRowDataMeeting?.planned_inside_short_name2
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事前コメント */}
                {/* <div className={`${styles.row_area} flex h-[90px] w-full items-center`}> */}
                <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title} ${styles.title_sm}`}>事前ｺﾒﾝﾄ</span>
                      {!searchMode && isEditModeField !== "planned_comment" && (
                        <div
                          className={`${styles.textarea_box} ${
                            selectedRowDataMeeting ? `${styles.editable_field}` : `${styles.uneditable_field}`
                          }`}
                          onClick={handleSingleClickField}
                          onDoubleClick={(e) => {
                            // if (!selectedRowDataMeeting?.activity_type) return;
                            // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.activity_type))
                            //   return alert(returnMessageNotActivity(selectedRowDataMeeting.activity_type));
                            handleCloseTooltip();
                            handleDoubleClickField({
                              e,
                              field: "planned_comment",
                              dispatch: setInputPlannedComment,
                              selectedRowDataValue: selectedRowDataMeeting?.planned_comment
                                ? selectedRowDataMeeting?.planned_comment
                                : null,
                            });
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.planned_comment
                              ? selectedRowDataMeeting?.planned_comment.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div>
                      )}
                      {/* ============= フィールドエディットモード関連 ============= */}
                      {/* フィールドエディットモード inputタグ */}
                      {!searchMode && isEditModeField === "planned_comment" && (
                        <>
                          <textarea
                            cols={30}
                            // rows={10}
                            placeholder=""
                            style={{ whiteSpace: "pre-wrap" }}
                            className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                            value={inputPlannedComment}
                            onChange={(e) => setInputPlannedComment(e.target.value)}
                          ></textarea>
                          {/* 送信ボタンとクローズボタン */}
                          <InputSendAndCloseBtn
                            inputState={inputPlannedComment}
                            setInputState={setInputPlannedComment}
                            onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                              handleClickSendUpdateField({
                                e,
                                fieldName: "planned_comment",
                                fieldNameForSelectedRowData: "planned_comment",
                                originalValue: originalValueFieldEdit.current,
                                newValue: inputPlannedComment ? inputPlannedComment.trim() : null,
                                id: selectedRowDataMeeting?.meeting_id,
                                required: false,
                              })
                            }
                            required={false}
                            // isDisplayClose={true}
                            // btnPositionY="bottom-[8px]"
                            isOutside={true}
                            outsidePosition="under_right"
                            isLoadingSendEvent={updateMeetingFieldMutation.isLoading}
                          />
                        </>
                      )}
                      {/* フィールドエディットモードオーバーレイ */}
                      {!searchMode && isEditModeField === "planned_comment" && (
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

                {/* 事業部名 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業部名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataMeeting?.assigned_department_name
                              ? selectedRowDataMeeting?.assigned_department_name
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
                          {selectedRowDataMeeting?.assigned_department_name
                            ? selectedRowDataMeeting?.assigned_department_name
                            : ""}
                        </span>
                      )}
                      {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
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
                            selectedRowDataMeeting?.assigned_unit_name ? selectedRowDataMeeting?.assigned_unit_name : ""
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
                          {selectedRowDataMeeting?.assigned_unit_name ? selectedRowDataMeeting?.assigned_unit_name : ""}
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
                          data-text={`${
                            selectedRowDataMeeting?.assigned_section_name
                              ? selectedRowDataMeeting?.assigned_section_name
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
                          {selectedRowDataMeeting?.assigned_section_name
                            ? selectedRowDataMeeting?.assigned_section_name
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
                            selectedRowDataMeeting?.meeting_member_name
                              ? selectedRowDataMeeting?.meeting_member_name
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
                          {selectedRowDataMeeting?.meeting_member_name
                            ? selectedRowDataMeeting?.meeting_member_name
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業所・自社担当 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業所</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataMeeting?.assigned_office_name
                              ? selectedRowDataMeeting?.assigned_office_name
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
                          {/* {selectedRowDataMeeting?.meeting_business_office
                          ? selectedRowDataMeeting?.meeting_business_office
                          : ""} */}
                          {selectedRowDataMeeting?.assigned_office_name
                            ? selectedRowDataMeeting?.assigned_office_name
                            : ""}
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
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
                        {selectedRowDataMeeting?.meeting_member_name ? selectedRowDataMeeting?.meeting_member_name : ""}
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
                  {/* 結果 */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.section_title}`}>結果</span>

                        {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                      </span> */}
                      </div>
                      <div className={`${styles.section_underline}`}></div>
                    </div>
                  </div>
                  {/* 面談日(結果)・面談年月度 */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>面談日</span>
                        {!searchMode && isEditModeField !== "result_date" && (
                          <span
                            className={`${styles.value} ${styles.editable_field}`}
                            onClick={handleSingleClickField}
                            onDoubleClick={(e) => {
                              // if (!selectedRowDataMeeting?.activity_type) return;
                              // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.activity_type)) {
                              //   return alert(returnMessageNotActivity(selectedRowDataMeeting.activity_type));
                              // }
                              handleDoubleClickField({
                                e,
                                field: "result_date",
                                dispatch: setInputResultDateForFieldEditMode,
                                dateValue: selectedRowDataMeeting?.result_date
                                  ? selectedRowDataMeeting.result_date
                                  : null,
                              });
                            }}
                            data-text={`${
                              selectedRowDataMeeting?.result_date
                                ? format(new Date(selectedRowDataMeeting.result_date), "yyyy/MM/dd")
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
                            {selectedRowDataMeeting?.result_date
                              ? format(new Date(selectedRowDataMeeting.result_date), "yyyy/MM/dd")
                              : ""}
                          </span>
                        )}
                        {/* ============= フィールドエディットモード関連 ============= */}
                        {/* フィールドエディットモード Date-picker  */}
                        {!searchMode && isEditModeField === "result_date" && (
                          <>
                            <div className="z-[2000] w-full">
                              <DatePickerCustomInput
                                startDate={inputResultDateForFieldEditMode}
                                setStartDate={setInputResultDateForFieldEditMode}
                                required={true}
                                isFieldEditMode={true}
                                fieldEditModeBtnAreaPosition="right"
                                isLoadingSendEvent={updateMeetingFieldMutation.isLoading}
                                onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
                                  if (!inputResultDateForFieldEditMode) return alert("このデータは入力が必須です。");
                                  const originalDateUTCString = selectedRowDataMeeting?.result_date
                                    ? selectedRowDataMeeting.result_date
                                    : null; // ISOString UTC時間 2023-12-26T15:00:00+00:00
                                  const newDateUTCString = inputResultDateForFieldEditMode
                                    ? inputResultDateForFieldEditMode.toISOString()
                                    : null; // Dateオブジェクト ローカルタイムゾーンに自動で変換済み Thu Dec 28 2023 00:00:00 GMT+0900 (日本標準時)
                                  // const result = isSameDateLocal(originalDateString, newDateString);
                                  console.log(
                                    "日付送信クリック",
                                    "オリジナル(UTC)",
                                    originalDateUTCString,
                                    "新たな値(Dateオブジェクト)",
                                    inputResultDateForFieldEditMode,
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
                                    fieldName: "result_date",
                                    fieldNameForSelectedRowData: "result_date",
                                    // originalValue: originalValueFieldEdit.current,
                                    originalValue: originalDateUTCString,
                                    newValue: newDateUTCString,
                                    id: selectedRowDataMeeting?.meeting_id,
                                    required: true,
                                  });
                                }}
                              />
                            </div>
                          </>
                        )}
                        {/* フィールドエディットモードオーバーレイ */}
                        {!searchMode && isEditModeField === "result_date" && (
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
                    {/* <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title}`}>面談年月度</span>
                      {!searchMode && (
                        <span
                          // data-text={`${
                          //   selectedRowDataMeeting?.senior_managing_director
                          //     ? selectedRowDataMeeting?.senior_managing_director
                          //     : ""
                          // }`}
                          className={`${styles.value}`}
                          // onMouseEnter={(e) => handleOpenTooltip({e})}
                          // onMouseLeave={handleCloseTooltip}
                        >
                          {selectedRowDataMeeting?.meeting_year_month
                            ? selectedRowDataMeeting?.meeting_year_month
                            : null}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div> */}
                  </div>

                  {/* 面談開始・面談終了 */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title} `}>面談開始</span>
                        {!searchMode && isEditModeField !== "result_start_time" && (
                          <span
                            className={`${styles.value} ${styles.editable_field}`}
                            onClick={handleSingleClickField}
                            onDoubleClick={(e) => {
                              if (!selectedRowDataMeeting?.result_start_time) return;
                              // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.meeting_type))
                              //   return alert(returnMessageNotActivity(selectedRowDataMeeting.meeting_type));
                              handleDoubleClickField({
                                e,
                                field: "result_start_time",
                                dispatch: setInputResultStartTime,
                                selectedRowDataValue: selectedRowDataMeeting.result_start_time,
                              });
                              handleCloseTooltip();
                            }}
                            data-text={`${
                              selectedRowDataMeeting?.result_start_time ? selectedRowDataMeeting?.result_start_time : ""
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
                            {selectedRowDataMeeting?.result_start_time
                              ? formatTime(selectedRowDataMeeting?.result_start_time)
                              : ""}
                          </span>
                        )}
                        {/* ============= フィールドエディットモード関連 ============= */}
                        {/* フィールドエディットモード selectタグ  */}
                        {!searchMode && isEditModeField === "result_start_time" && (
                          <>
                            <select
                              className={`ml-auto h-full w-[80%] cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                              placeholder="時"
                              value={inputResultStartTimeHour}
                              onChange={(e) => setInputResultStartTimeHour(e.target.value === "" ? "" : e.target.value)}
                            >
                              <option value=""></option>
                              {hours.map((hour) => (
                                <option key={hour} value={hour}>
                                  {hour}
                                </option>
                              ))}
                            </select>

                            <span className="pointer-events-none mx-[5px]">:</span>

                            <select
                              className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                              placeholder="分"
                              value={inputResultStartTimeMinute}
                              onChange={(e) =>
                                setInputResultStartTimeMinute(e.target.value === "" ? "" : e.target.value)
                              }
                            >
                              <option value=""></option>
                              {minutes.map((minute) => (
                                <option key={minute} value={minute}>
                                  {minute}
                                </option>
                              ))}
                            </select>
                            {/* 送信、バツボタンエリア */}
                            {!updateMeetingFieldMutation.isLoading && (
                              <div
                                className={`${styles.field_edit_mode_btn_area} ${
                                  !updateMeetingFieldMutation.isLoading
                                    ? styles.right_position
                                    : styles.right_position_loading
                                }  space-x-[6px]`}
                              >
                                {/* 送信ボタン フィールドエディットモード専用 */}
                                {!updateMeetingFieldMutation.isLoading && (
                                  <div
                                    className={`flex-center transition-bg03 group min-h-[26px] min-w-[26px] rounded-full border border-solid border-transparent ${
                                      !inputResultStartTimeHour ||
                                      !inputResultStartTimeMinute ||
                                      `${inputResultStartTimeHour}:${inputResultStartTimeMinute}` ===
                                        originalValueFieldEdit.current
                                        ? `cursor-not-allowed text-[#999]`
                                        : `border-[var(--color-bg-brand-f) cursor-pointer hover:bg-[var(--color-bg-brand-f)] hover:shadow-lg`
                                    }`}
                                    onClick={(e) => {
                                      if (!inputResultStartTimeHour || !inputResultStartTimeMinute) return;
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "result_start_time",
                                        fieldNameForSelectedRowData: "result_start_time",
                                        newValue: `${inputResultStartTimeHour}:${inputResultStartTimeMinute}`,
                                        originalValue: originalValueFieldEdit.current,
                                        id: selectedRowDataMeeting?.meeting_id,
                                        required: true,
                                      });
                                    }}
                                  >
                                    <IoIosSend
                                      className={`text-[20px] ${
                                        !inputResultStartTimeHour ||
                                        !inputResultStartTimeMinute ||
                                        `${inputResultStartTimeHour}:${inputResultStartTimeMinute}` ===
                                          originalValueFieldEdit.current
                                          ? `text-[#999] group-hover:text-[#999]`
                                          : `text-[var(--color-bg-brand-f)] group-hover:text-[#fff]`
                                      }`}
                                    />
                                  </div>
                                )}
                                {/* バツボタン フィールドエディットモード専用 */}
                                {!updateMeetingFieldMutation.isLoading && (
                                  <div
                                    className={`${
                                      inputResultStartTimeHour && inputResultStartTimeMinute
                                        ? `${styles.close_btn_field_edit_mode} hover:shadow-lg`
                                        : `${styles.close_btn_field_edit_mode_empty}`
                                    }`}
                                    onClick={() => {
                                      if (inputResultStartTimeHour === "08" && inputResultStartTimeMinute === "30")
                                        return;
                                      setInputResultStartTimeHour("08");
                                      setInputResultStartTimeMinute("30");
                                    }}
                                  >
                                    <MdClose className="text-[20px] " />
                                  </div>
                                )}
                                {/* ローディング フィールドエディットモード専用 */}
                                {/* {!updateMeetingFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )} */}
                              </div>
                            )}
                            {/* <span className="ml-[5px]">分</span> */}
                            {/* エディットフィールド送信中ローディングスピナー */}
                            {updateMeetingFieldMutation.isLoading && (
                              <div
                                className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                              >
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )}
                          </>
                        )}
                        {/* フィールドエディットモードオーバーレイ */}
                        {!searchMode && isEditModeField === "result_start_time" && (
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
                        <span className={`${styles.title}`}>面談終了</span>
                        {!searchMode && isEditModeField !== "result_end_time" && (
                          <span
                            className={`${styles.value} ${styles.editable_field}`}
                            onClick={handleSingleClickField}
                            onDoubleClick={(e) => {
                              if (!selectedRowDataMeeting?.result_end_time) return;
                              // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.meeting_type))
                              //   return alert(returnMessageNotActivity(selectedRowDataMeeting.meeting_type));
                              handleDoubleClickField({
                                e,
                                field: "result_end_time",
                                dispatch: setInputResultEndTime,
                                selectedRowDataValue: selectedRowDataMeeting.result_end_time,
                              });
                              handleCloseTooltip();
                            }}
                            data-text={`${
                              selectedRowDataMeeting?.result_end_time ? selectedRowDataMeeting?.result_end_time : ""
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
                            {selectedRowDataMeeting?.result_end_time
                              ? formatTime(selectedRowDataMeeting.result_end_time)
                              : ""}
                          </span>
                        )}
                        {/* ============= フィールドエディットモード関連 ============= */}
                        {/* フィールドエディットモード selectタグ  */}
                        {!searchMode && isEditModeField === "result_end_time" && (
                          <>
                            <select
                              className={`ml-auto h-full w-[80%] cursor-pointer ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                              placeholder="時"
                              value={inputResultEndTimeHour}
                              onChange={(e) => setInputResultEndTimeHour(e.target.value === "" ? "" : e.target.value)}
                            >
                              <option value=""></option>
                              {hours.map((hour) => (
                                <option key={hour} value={hour}>
                                  {hour}
                                </option>
                              ))}
                            </select>

                            <span className="pointer-events-none mx-[5px]">:</span>

                            <select
                              className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                              placeholder="分"
                              value={inputResultEndTimeMinute}
                              onChange={(e) => setInputResultEndTimeMinute(e.target.value === "" ? "" : e.target.value)}
                            >
                              <option value=""></option>
                              {minutes.map((minute) => (
                                <option key={minute} value={minute}>
                                  {minute}
                                </option>
                              ))}
                            </select>
                            {/* 送信、バツボタンエリア */}
                            {!updateMeetingFieldMutation.isLoading && (
                              <div
                                className={`${styles.field_edit_mode_btn_area} ${
                                  !updateMeetingFieldMutation.isLoading
                                    ? styles.right_position
                                    : styles.right_position_loading
                                }  space-x-[6px]`}
                              >
                                {/* 送信ボタン フィールドエディットモード専用 */}
                                {!updateMeetingFieldMutation.isLoading && (
                                  <div
                                    className={`flex-center transition-bg03 group min-h-[26px] min-w-[26px] rounded-full border border-solid border-transparent ${
                                      !inputResultEndTimeHour ||
                                      !inputResultEndTimeMinute ||
                                      `${inputResultEndTimeHour}:${inputResultEndTimeMinute}` ===
                                        originalValueFieldEdit.current
                                        ? `cursor-not-allowed text-[#999]`
                                        : `border-[var(--color-bg-brand-f) cursor-pointer hover:bg-[var(--color-bg-brand-f)] hover:shadow-lg`
                                    }`}
                                    onClick={(e) => {
                                      if (!inputResultEndTimeHour || !inputResultEndTimeMinute) return;
                                      handleClickSendUpdateField({
                                        e,
                                        fieldName: "result_end_time",
                                        fieldNameForSelectedRowData: "result_end_time",
                                        newValue: `${inputResultEndTimeHour}:${inputResultEndTimeMinute}`,
                                        originalValue: originalValueFieldEdit.current,
                                        id: selectedRowDataMeeting?.meeting_id,
                                        required: true,
                                      });
                                    }}
                                  >
                                    <IoIosSend
                                      className={`text-[20px] ${
                                        !inputResultEndTimeHour ||
                                        !inputResultEndTimeMinute ||
                                        `${inputResultEndTimeHour}:${inputResultEndTimeMinute}` ===
                                          originalValueFieldEdit.current
                                          ? `text-[#999] group-hover:text-[#999]`
                                          : `text-[var(--color-bg-brand-f)] group-hover:text-[#fff]`
                                      }`}
                                    />
                                  </div>
                                )}
                                {/* バツボタン フィールドエディットモード専用 */}
                                {!updateMeetingFieldMutation.isLoading && (
                                  <div
                                    className={`${
                                      inputResultEndTimeHour && inputResultEndTimeMinute
                                        ? `${styles.close_btn_field_edit_mode} hover:shadow-lg`
                                        : `${styles.close_btn_field_edit_mode_empty}`
                                    }`}
                                    onClick={() => {
                                      if (inputResultEndTimeHour === "08" && inputResultEndTimeMinute === "30") return;
                                      setInputResultEndTimeHour("08");
                                      setInputResultEndTimeMinute("30");
                                    }}
                                  >
                                    <MdClose className="text-[20px] " />
                                  </div>
                                )}
                                {/* ローディング フィールドエディットモード専用 */}
                                {/* {!updateMeetingFieldMutation.isLoading && (
                            <div className={`${styles.field_edit_mode_loading_area}`}>
                              <SpinnerComet w="22px" h="22px" s="3px" />
                            </div>
                          )} */}
                              </div>
                            )}
                            {/* <span className="ml-[5px]">分</span> */}
                            {/* エディットフィールド送信中ローディングスピナー */}
                            {updateMeetingFieldMutation.isLoading && (
                              <div
                                className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                              >
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )}
                          </>
                        )}
                        {/* フィールドエディットモードオーバーレイ */}
                        {!searchMode && isEditModeField === "result_end_time" && (
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

                  {/* 面談時間(分)・面談人数 */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        {/* <div className={`${styles.title} flex flex-col`}>
                        <span className={`text-[12px]`}>面談時間(分)</span>
                      </div> */}
                        <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                          <span className={``}>面談時間</span>
                          <span className={``}>(分)</span>
                        </div>
                        {!searchMode && isEditModeField !== "result_duration" && (
                          <span
                            className={`${styles.value} ${styles.editable_field}`}
                            onClick={handleSingleClickField}
                            onDoubleClick={(e) => {
                              if (!selectedRowDataMeeting?.result_duration) return;
                              // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.result_duration))
                              //   return alert(returnMessageNotActivity(selectedRowDataMeeting.result_duration));
                              handleDoubleClickField({
                                e,
                                field: "result_duration",
                                dispatch: setInputResultDuration,
                              });
                              handleCloseTooltip();
                            }}
                            data-text={`${
                              selectedRowDataMeeting?.result_duration ? selectedRowDataMeeting?.result_duration : ""
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
                            {selectedRowDataMeeting?.result_duration ? selectedRowDataMeeting?.result_duration : null}
                          </span>
                        )}
                        {/* ============= フィールドエディットモード関連 ============= */}
                        {/* フィールドエディットモード selectタグ  */}
                        {!searchMode && isEditModeField === "result_duration" && (
                          <>
                            <input
                              type="number"
                              min="0"
                              className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                              placeholder=""
                              value={inputResultDuration === null ? "" : inputResultDuration}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                  setInputResultDuration(null);
                                } else {
                                  const numValue = Number(val);

                                  // 入力値がマイナスかチェック
                                  if (numValue < 0) {
                                    setInputResultDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                                  } else {
                                    setInputResultDuration(numValue);
                                  }
                                }
                              }}
                              onCompositionStart={() => setIsComposing(true)}
                              onCompositionEnd={() => setIsComposing(false)}
                              onKeyDown={(e) =>
                                handleKeyDownUpdateField({
                                  e,
                                  fieldName: "result_duration",
                                  fieldNameForSelectedRowData: "result_duration",
                                  originalValue: originalValueFieldEdit.current,
                                  newValue: inputResultDuration,
                                  id: selectedRowDataMeeting?.meeting_id,
                                  required: false,
                                })
                              }
                            />
                            {/* 送信ボタンとクローズボタン */}
                            {!updateMeetingFieldMutation.isLoading && (
                              <InputSendAndCloseBtn<number | null>
                                inputState={inputResultDuration as number | null}
                                setInputState={setInputResultDuration as Dispatch<SetStateAction<number | null>>}
                                onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                  handleClickSendUpdateField({
                                    e,
                                    fieldName: "result_duration",
                                    fieldNameForSelectedRowData: "result_duration",
                                    originalValue: originalValueFieldEdit.current,
                                    newValue: inputResultDuration,
                                    id: selectedRowDataMeeting?.meeting_id,
                                    required: false,
                                  })
                                }
                                required={true}
                                isDisplayClose={false}
                              />
                            )}
                            {/* エディットフィールド送信中ローディングスピナー */}
                            {updateMeetingFieldMutation.isLoading && (
                              <div
                                className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                              >
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )}
                          </>
                        )}
                        {/* フィールドエディットモードオーバーレイ */}
                        {!searchMode && isEditModeField === "result_duration" && (
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
                      <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                        <span className={`${styles.title}`}>面談人数</span>
                        {!searchMode && isEditModeField !== "result_number_of_meeting_participants" && (
                          <span
                            className={`${styles.value} ${styles.editable_field}`}
                            onClick={handleSingleClickField}
                            onDoubleClick={(e) => {
                              if (!selectedRowDataMeeting?.result_number_of_meeting_participants) return;
                              // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.result_number_of_meeting_participants))
                              //   return alert(returnMessageNotActivity(selectedRowDataMeeting.result_number_of_meeting_participants));
                              handleDoubleClickField({
                                e,
                                field: "result_number_of_meeting_participants",
                                dispatch: setInputResultNumberOfMeetingParticipants,
                              });
                              handleCloseTooltip();
                            }}
                            data-text={`${
                              selectedRowDataMeeting?.result_number_of_meeting_participants
                                ? selectedRowDataMeeting?.result_number_of_meeting_participants
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
                            {selectedRowDataMeeting?.result_number_of_meeting_participants
                              ? selectedRowDataMeeting?.result_number_of_meeting_participants
                              : null}
                          </span>
                        )}
                        {/* ============= フィールドエディットモード関連 ============= */}
                        {/* フィールドエディットモード selectタグ  */}
                        {!searchMode && isEditModeField === "result_number_of_meeting_participants" && (
                          <>
                            <input
                              type="number"
                              min="0"
                              className={`${styles.input_box} ${styles.field_edit_mode_input_box}`}
                              placeholder=""
                              value={
                                inputResultNumberOfMeetingParticipants === null
                                  ? ""
                                  : inputResultNumberOfMeetingParticipants
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "") {
                                  setInputResultNumberOfMeetingParticipants(null);
                                } else {
                                  const numValue = Number(val);

                                  // 入力値がマイナスかチェック
                                  if (numValue < 0) {
                                    setInputResultNumberOfMeetingParticipants(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                                  } else {
                                    setInputResultNumberOfMeetingParticipants(numValue);
                                  }
                                }
                              }}
                              onCompositionStart={() => setIsComposing(true)}
                              onCompositionEnd={() => setIsComposing(false)}
                              onKeyDown={(e) =>
                                handleKeyDownUpdateField({
                                  e,
                                  fieldName: "result_number_of_meeting_participants",
                                  fieldNameForSelectedRowData: "result_number_of_meeting_participants",
                                  originalValue: originalValueFieldEdit.current,
                                  newValue: inputResultNumberOfMeetingParticipants,
                                  id: selectedRowDataMeeting?.meeting_id,
                                  required: false,
                                })
                              }
                            />
                            {/* 送信ボタンとクローズボタン */}
                            {!updateMeetingFieldMutation.isLoading && (
                              <InputSendAndCloseBtn<number | null>
                                inputState={inputResultNumberOfMeetingParticipants as number | null}
                                setInputState={
                                  setInputResultNumberOfMeetingParticipants as Dispatch<SetStateAction<number | null>>
                                }
                                onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                  handleClickSendUpdateField({
                                    e,
                                    fieldName: "result_number_of_meeting_participants",
                                    fieldNameForSelectedRowData: "result_number_of_meeting_participants",
                                    originalValue: originalValueFieldEdit.current,
                                    newValue: inputResultNumberOfMeetingParticipants,
                                    id: selectedRowDataMeeting?.meeting_id,
                                    required: false,
                                  })
                                }
                                required={true}
                                isDisplayClose={false}
                              />
                            )}
                            {/* エディットフィールド送信中ローディングスピナー */}
                            {updateMeetingFieldMutation.isLoading && (
                              <div
                                className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                              >
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )}
                          </>
                        )}
                        {/* フィールドエディットモードオーバーレイ */}
                        {!searchMode && isEditModeField === "result_number_of_meeting_participants" && (
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

                  {/* 実施1・実施2 */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>実施商品1</span>
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
                            {/* {selectedRowDataMeeting?.result_presentation_product1
                            ? selectedRowDataMeeting?.result_presentation_product1
                            : ""} */}
                            {selectedRowDataMeeting &&
                              getCustomProductName(
                                selectedRowDataMeeting.introduced_products_names,
                                0,
                                selectedRowDataMeeting?.result_presentation_product1
                              )}
                            {/* {selectedRowDataMeeting &&
                          selectedRowDataMeeting.introduced_products_names?.length > 1 &&
                          getProductName(
                            selectedRowDataMeeting.introduced_products_names[0].introduced_product_name,
                            selectedRowDataMeeting.introduced_products_names[0].introduced_inside_short_name,
                            selectedRowDataMeeting.introduced_products_names[0].introduced_outside_short_name
                          )
                            ? getProductName(
                                selectedRowDataMeeting.introduced_products_names[0].introduced_product_name,
                                selectedRowDataMeeting.introduced_products_names[0].introduced_inside_short_name,
                                selectedRowDataMeeting.introduced_products_names[0].introduced_outside_short_name
                              )
                            : selectedRowDataMeeting?.result_presentation_product1
                            ? selectedRowDataMeeting?.result_presentation_product1
                            : ""} */}
                          </span>
                        )}
                        {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        <span className={`${styles.title}`}>実施商品2</span>
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
                            {/* {selectedRowDataMeeting?.result_presentation_product2
                            ? selectedRowDataMeeting?.result_presentation_product2
                            : ""} */}
                            {selectedRowDataMeeting &&
                              getCustomProductName(
                                selectedRowDataMeeting.introduced_products_names,
                                1,
                                selectedRowDataMeeting?.result_presentation_product2
                              )}
                          </span>
                        )}
                        {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 実施3・実施4 */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>実施商品3</span>
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
                            {/* {selectedRowDataMeeting?.result_presentation_product3
                            ? selectedRowDataMeeting?.result_presentation_product3
                            : ""} */}
                            {selectedRowDataMeeting &&
                              getCustomProductName(
                                selectedRowDataMeeting.introduced_products_names,
                                2,
                                selectedRowDataMeeting?.result_presentation_product3
                              )}
                          </span>
                        )}
                        {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        <span className={`${styles.title}`}>実施商品4</span>
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
                            {/* {selectedRowDataMeeting?.result_presentation_product4
                            ? selectedRowDataMeeting?.result_presentation_product4
                            : ""} */}
                            {selectedRowDataMeeting &&
                              getCustomProductName(
                                selectedRowDataMeeting.introduced_products_names,
                                3,
                                selectedRowDataMeeting?.result_presentation_product4
                              )}
                          </span>
                        )}
                        {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 実施5・実施ALL */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>実施商品5</span>
                        {!searchMode && (
                          <span
                            className={`${styles.value}`}
                            data-text={
                              selectedRowDataMeeting
                                ? getCustomProductName(
                                    selectedRowDataMeeting.introduced_products_names,
                                    4,
                                    selectedRowDataMeeting?.result_presentation_product5
                                  )
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
                            {/* {selectedRowDataMeeting?.result_presentation_product5
                            ? selectedRowDataMeeting?.result_presentation_product5
                            : ""} */}
                            {selectedRowDataMeeting &&
                              getCustomProductName(
                                selectedRowDataMeeting.introduced_products_names,
                                4,
                                selectedRowDataMeeting?.result_presentation_product5
                              )}
                          </span>
                        )}
                        {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      {/* <div className={`${styles.title_box} flex h-full items-center`}></div> */}
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <span className={`${styles.title}`}>実施ALL</span>
                        {!searchMode && (
                          <span
                            className={`${styles.value}`}
                            data-text={
                              selectedRowDataMeeting &&
                              getProductNamesAll(selectedRowDataMeeting.introduced_products_names)
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
                            {/* {selectedRowDataMeeting?.result_presentation_product5
                            ? selectedRowDataMeeting?.result_presentation_product5
                            : ""} */}
                            {selectedRowDataMeeting &&
                              getProductNamesAll(selectedRowDataMeeting.introduced_products_names)}
                          </span>
                        )}
                        {/* {searchMode && <input type="text" className={`${styles.input_box}`} />} */}
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 結果コメント */}
                  {/* <div className={`${styles.row_area} flex h-[90px] w-full items-center`}> */}
                  <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full `}>
                        <span className={`${styles.title} ${styles.title_sm}`}>結果ｺﾒﾝﾄ</span>
                        {!searchMode && isEditModeField !== "result_summary" && (
                          <div
                            className={`${styles.textarea_box} ${
                              selectedRowDataMeeting ? `${styles.editable_field}` : `${styles.uneditable_field}`
                            }`}
                            onClick={handleSingleClickField}
                            onDoubleClick={(e) => {
                              // if (!selectedRowDataMeeting?.activity_type) return;
                              // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.activity_type))
                              //   return alert(returnMessageNotActivity(selectedRowDataMeeting.activity_type));
                              handleCloseTooltip();
                              handleDoubleClickField({
                                e,
                                field: "result_summary",
                                dispatch: setInputResultSummary,
                                selectedRowDataValue: selectedRowDataMeeting?.result_summary
                                  ? selectedRowDataMeeting?.result_summary
                                  : null,
                              });
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            }}
                            dangerouslySetInnerHTML={{
                              __html: selectedRowDataMeeting?.result_summary
                                ? selectedRowDataMeeting?.result_summary.replace(/\n/g, "<br>")
                                : "",
                            }}
                          ></div>
                        )}
                        {/* ============= フィールドエディットモード関連 ============= */}
                        {/* フィールドエディットモード inputタグ */}
                        {!searchMode && isEditModeField === "result_summary" && (
                          <>
                            <textarea
                              cols={30}
                              // rows={10}
                              placeholder=""
                              style={{ whiteSpace: "pre-wrap" }}
                              className={`${styles.textarea_box} ${styles.textarea_box_search_mode} ${styles.field_edit_mode_textarea} ${styles.xl}`}
                              value={inputResultSummary}
                              onChange={(e) => setInputResultSummary(e.target.value)}
                            ></textarea>
                            {/* 送信ボタンとクローズボタン */}
                            <InputSendAndCloseBtn
                              inputState={inputResultSummary}
                              setInputState={setInputResultSummary}
                              onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
                                handleClickSendUpdateField({
                                  e,
                                  fieldName: "result_summary",
                                  fieldNameForSelectedRowData: "result_summary",
                                  originalValue: originalValueFieldEdit.current,
                                  newValue: inputResultSummary ? inputResultSummary.trim() : null,
                                  id: selectedRowDataMeeting?.meeting_id,
                                  required: false,
                                })
                              }
                              required={false}
                              // isDisplayClose={true}
                              // btnPositionY="bottom-[8px]"
                              isOutside={true}
                              outsidePosition="under_right"
                              isLoadingSendEvent={updateMeetingFieldMutation.isLoading}
                            />
                          </>
                        )}
                        {/* フィールドエディットモードオーバーレイ */}
                        {!searchMode && isEditModeField === "result_summary" && (
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

                  {/* 面談結果 */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        <span className={`${styles.title}`}>面談結果</span>
                        {!searchMode && isEditModeField !== "result_category" && (
                          <div
                            className={`${styles.value} ${styles.editable_field}`}
                            onClick={handleSingleClickField}
                            onDoubleClick={(e) => {
                              if (!selectedRowDataMeeting?.result_category) return;
                              // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.result_category))
                              //   return alert(returnMessageNotActivity(selectedRowDataMeeting.result_category));
                              handleDoubleClickField({
                                e,
                                field: "result_category",
                                dispatch: setInputResultCategory,
                              });
                              handleCloseTooltip();
                            }}
                            data-text={`${
                              selectedRowDataMeeting?.result_category
                                ? getResultCategory(selectedRowDataMeeting?.result_category)
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
                            // dangerouslySetInnerHTML={{
                            //   __html: selectedRowDataMeeting?.result_category
                            //     ? selectedRowDataMeeting?.result_category.replace(/\n/g, "<br>")
                            //     : "",
                            // }}
                          >
                            {selectedRowDataMeeting?.result_category
                              ? getResultCategory(selectedRowDataMeeting?.result_category)
                              : ""}
                          </div>
                        )}
                        {/* ============= フィールドエディットモード関連 ============= */}
                        {/* フィールドエディットモード selectタグ  */}
                        {!searchMode && isEditModeField === "result_category" && (
                          <>
                            <select
                              className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                              value={inputResultCategory}
                              onChange={(e) => {
                                handleChangeSelectUpdateField({
                                  e,
                                  fieldName: "result_category",
                                  fieldNameForSelectedRowData: "result_category",
                                  newValue: e.target.value,
                                  originalValue: originalValueFieldEdit.current,
                                  id: selectedRowDataMeeting?.meeting_id,
                                });
                              }}
                              // onChange={(e) => {
                              //   setInputActivityType(e.target.value);
                              // }}
                            >
                              {/* <option value=""></option> */}
                              {optionsResultCategory.map((option) => (
                                <option key={option} value={option}>
                                  {getResultCategory(option)}
                                </option>
                              ))}
                            </select>
                            {/* エディットフィールド送信中ローディングスピナー */}
                            {updateMeetingFieldMutation.isLoading && (
                              <div
                                className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                              >
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )}
                          </>
                        )}
                        {/* フィールドエディットモードオーバーレイ */}
                        {!searchMode && isEditModeField === "result_category" && (
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

                  {/* 面談時_最上位職位 */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        {/* <span className={`${styles.title}`}>面談時_最上位職位</span> */}
                        <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                          <span className={``}>面談時_</span>
                          <span className={``}>最上位職位</span>
                        </div>
                        {!searchMode && isEditModeField !== "result_top_position_class" && (
                          <span
                            className={`${styles.value} ${styles.editable_field}`}
                            onClick={handleSingleClickField}
                            onDoubleClick={(e) => {
                              if (!selectedRowDataMeeting?.result_top_position_class) return;
                              // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.result_top_position_class))
                              //   return alert(returnMessageNotActivity(selectedRowDataMeeting.result_top_position_class));
                              handleDoubleClickField({
                                e,
                                field: "result_top_position_class",
                                dispatch: setInputResultTopPositionClass,
                                selectedRowDataValue: selectedRowDataMeeting.result_top_position_class,
                              });
                              handleCloseTooltip();
                            }}
                            // data-text={`${
                            //   selectedRowDataMeeting?.result_top_position_class
                            //     ? getPositionClassName(selectedRowDataMeeting?.result_top_position_class)
                            //     : ""
                            // }`}
                            onMouseEnter={(e) => {
                              e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                              // const el = e.currentTarget;
                              // if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({e});
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                              handleCloseTooltip();
                            }}
                          >
                            {selectedRowDataMeeting &&
                            selectedRowDataMeeting?.result_top_position_class &&
                            mappingPositionClass[selectedRowDataMeeting.result_top_position_class]?.[language]
                              ? mappingPositionClass[selectedRowDataMeeting.result_top_position_class]?.[language]
                              : ""}
                          </span>
                        )}
                        {/* ============= フィールドエディットモード関連 ============= */}
                        {/* フィールドエディットモード selectタグ  */}
                        {!searchMode && isEditModeField === "result_top_position_class" && (
                          <>
                            <select
                              className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                              value={inputResultTopPositionClass}
                              onChange={(e) => {
                                handleChangeSelectUpdateField({
                                  e,
                                  fieldName: "result_top_position_class",
                                  fieldNameForSelectedRowData: "result_top_position_class",
                                  newValue: e.target.value,
                                  originalValue: originalValueFieldEdit.current,
                                  id: selectedRowDataMeeting?.meeting_id,
                                });
                              }}
                              // onChange={(e) => {
                              //   setInputActivityType(e.target.value);
                              // }}
                            >
                              {/* <option value=""></option> */}
                              {optionsPositionsClass.map((classNum) => (
                                <option key={classNum} value={`${classNum}`}>
                                  {getPositionClassName(classNum)}
                                </option>
                              ))}
                            </select>
                            {/* エディットフィールド送信中ローディングスピナー */}
                            {updateMeetingFieldMutation.isLoading && (
                              <div
                                className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                              >
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )}
                          </>
                        )}
                        {/* フィールドエディットモードオーバーレイ */}
                        {!searchMode && isEditModeField === "result_top_position_class" && (
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
                    <div className="flex h-full w-1/2 flex-col pr-[20px]"></div>
                  </div>

                  {/* 面談時_決裁者商談有無・面談時_同席依頼 */}
                  <div className={`${styles.row_area} flex w-full items-center`}>
                    <div className="flex h-full w-1/2 flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        {/* <span className={`${styles.title}`}>面談時_決裁者商談有無</span> */}
                        <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                          <span className={``}>面談時_</span>
                          <span className={``}>決裁者商談有無</span>
                        </div>
                        {!searchMode && isEditModeField !== "result_negotiate_decision_maker" && (
                          <span
                            className={`${styles.value} ${styles.editable_field}`}
                            onClick={handleSingleClickField}
                            onDoubleClick={(e) => {
                              if (!selectedRowDataMeeting?.result_negotiate_decision_maker) return;
                              // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.result_negotiate_decision_maker))
                              //   return alert(returnMessageNotActivity(selectedRowDataMeeting.result_negotiate_decision_maker));
                              handleDoubleClickField({
                                e,
                                field: "result_negotiate_decision_maker",
                                dispatch: setInputResultNegotiateDecisionMaker,
                                selectedRowDataValue: selectedRowDataMeeting.result_negotiate_decision_maker,
                              });
                              handleCloseTooltip();
                            }}
                            data-text={`${
                              selectedRowDataMeeting?.result_negotiate_decision_maker
                                ? getResultNegotiateDecisionMaker(
                                    selectedRowDataMeeting?.result_negotiate_decision_maker
                                  )
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
                            {selectedRowDataMeeting?.result_negotiate_decision_maker
                              ? getResultNegotiateDecisionMaker(selectedRowDataMeeting?.result_negotiate_decision_maker)
                              : ""}
                          </span>
                        )}
                        {/* ============= フィールドエディットモード関連 ============= */}
                        {/* フィールドエディットモード selectタグ  */}
                        {!searchMode && isEditModeField === "result_negotiate_decision_maker" && (
                          <>
                            <select
                              className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                              value={inputResultNegotiateDecisionMaker}
                              onChange={(e) => {
                                handleChangeSelectUpdateField({
                                  e,
                                  fieldName: "result_negotiate_decision_maker",
                                  fieldNameForSelectedRowData: "result_negotiate_decision_maker",
                                  newValue: e.target.value,
                                  originalValue: originalValueFieldEdit.current,
                                  id: selectedRowDataMeeting?.meeting_id,
                                });
                              }}
                              // onChange={(e) => {
                              //   setInputActivityType(e.target.value);
                              // }}
                            >
                              {/* <option value=""></option> */}
                              {optionsResultNegotiateDecisionMaker.map((option) => (
                                <option key={option} value={`${option}`}>
                                  {getResultNegotiateDecisionMaker(option)}
                                </option>
                              ))}
                            </select>
                            {/* エディットフィールド送信中ローディングスピナー */}
                            {updateMeetingFieldMutation.isLoading && (
                              <div
                                className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                              >
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )}
                          </>
                        )}
                        {/* フィールドエディットモードオーバーレイ */}
                        {!searchMode && isEditModeField === "result_negotiate_decision_maker" && (
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
                      {/* <div className={`${styles.title_box} flex h-full items-center`}></div> */}
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        {/* <span className={`${styles.title}`}>面談時_同席依頼</span> */}
                        <div className={`${styles.title} flex flex-col ${styles.double_text}`}>
                          <span className={``}>面談時_</span>
                          <span className={``}>同席依頼</span>
                        </div>
                        {!searchMode && isEditModeField !== "meeting_participation_request" && (
                          <span
                            className={`${styles.value} ${styles.editable_field}`}
                            onClick={handleSingleClickField}
                            onDoubleClick={(e) => {
                              if (!selectedRowDataMeeting?.meeting_participation_request) return;
                              // if (isNotActivityTypeArray.includes(selectedRowDataMeeting.meeting_participation_request))
                              //   return alert(returnMessageNotActivity(selectedRowDataMeeting.meeting_participation_request));
                              handleDoubleClickField({
                                e,
                                field: "meeting_participation_request",
                                dispatch: setInputMeetingParticipationRequest,
                                selectedRowDataValue: selectedRowDataMeeting.meeting_participation_request,
                              });
                              handleCloseTooltip();
                            }}
                            data-text={`${
                              selectedRowDataMeeting?.meeting_participation_request
                                ? getMeetingParticipationRequest(selectedRowDataMeeting?.meeting_participation_request)
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
                            {selectedRowDataMeeting?.meeting_participation_request
                              ? getMeetingParticipationRequest(selectedRowDataMeeting?.meeting_participation_request)
                              : ""}
                          </span>
                        )}
                        {/* ============= フィールドエディットモード関連 ============= */}
                        {/* フィールドエディットモード selectタグ  */}
                        {!searchMode && isEditModeField === "meeting_participation_request" && (
                          <>
                            <select
                              className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box} ${styles.field_edit_mode_select_box}`}
                              value={inputMeetingParticipationRequest}
                              onChange={(e) => {
                                handleChangeSelectUpdateField({
                                  e,
                                  fieldName: "meeting_participation_request",
                                  fieldNameForSelectedRowData: "meeting_participation_request",
                                  newValue: e.target.value,
                                  originalValue: originalValueFieldEdit.current,
                                  id: selectedRowDataMeeting?.meeting_id,
                                });
                              }}
                              // onChange={(e) => {
                              //   setInputActivityType(e.target.value);
                              // }}
                            >
                              {/* <option value=""></option> */}
                              {optionsMeetingParticipationRequest.map((option) => (
                                <option key={option} value={`${option}`}>
                                  {getMeetingParticipationRequest(option)}
                                </option>
                              ))}
                            </select>
                            {/* エディットフィールド送信中ローディングスピナー */}
                            {updateMeetingFieldMutation.isLoading && (
                              <div
                                className={`${styles.field_edit_mode_loading_area_for_select_box} ${styles.right_position}`}
                              >
                                <SpinnerComet w="22px" h="22px" s="3px" />
                              </div>
                            )}
                          </>
                        )}
                        {/* フィールドエディットモードオーバーレイ */}
                        {!searchMode && isEditModeField === "meeting_participation_request" && (
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
                {/* 面談先詳細 */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.section_title}`}>面談先詳細</span>

                      {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                      </span> */}
                    </div>
                    <div className={`${styles.section_underline}`}></div>
                  </div>
                </div>
                {/* 会社名 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>●会社名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value} ${styles.value_highlight} ${styles.text_start} ${styles.editable_field} hover:text-[var(--color-bg-brand-f)]`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                          onClick={() => setIsOpenClientCompanyDetailModal(true)}
                        >
                          {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 部署名 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>●部署名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value} ${styles.text_start}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          }}
                        >
                          {/* {selectedRowDataMeeting?.department_name ? selectedRowDataMeeting?.department_name : ""} */}
                          {selectedRowDataMeeting?.company_department_name
                            ? selectedRowDataMeeting?.company_department_name
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 担当者名・直通TEL 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>担当者名</span>
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
                          {selectedRowDataMeeting?.contact_name ? selectedRowDataMeeting?.contact_name : ""}
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
                          data-text={`${
                            selectedRowDataMeeting?.direct_line ? selectedRowDataMeeting?.direct_line : ""
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
                          {selectedRowDataMeeting?.direct_line ? selectedRowDataMeeting?.direct_line : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 役職名・職位 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>役職名</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataMeeting?.position_name ? selectedRowDataMeeting?.position_name : ""
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
                          {selectedRowDataMeeting?.position_name ? selectedRowDataMeeting?.position_name : ""}
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
                            selectedRowDataMeeting &&
                            selectedRowDataMeeting?.position_class &&
                            mappingPositionClass[selectedRowDataMeeting.position_class]?.[language]
                              ? mappingPositionClass[selectedRowDataMeeting.position_class]?.[language]
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
                          {/* {selectedRowDataMeeting?.position_class ? selectedRowDataMeeting?.position_class : ""} */}
                          {selectedRowDataMeeting &&
                          selectedRowDataMeeting?.position_class &&
                          mappingPositionClass[selectedRowDataMeeting.position_class]?.[language]
                            ? mappingPositionClass[selectedRowDataMeeting.position_class]?.[language]
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 担当職種・決裁金額 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>担当職種</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataMeeting?.occupation
                              ? getOccupationName(selectedRowDataMeeting?.occupation)
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
                          {/* {selectedRowDataMeeting?.occupation ? selectedRowDataMeeting?.occupation : ""} */}
                          {selectedRowDataMeeting &&
                          selectedRowDataMeeting?.occupation &&
                          mappingOccupation[selectedRowDataMeeting.occupation]?.[language]
                            ? mappingOccupation[selectedRowDataMeeting.occupation]?.[language]
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <div className={`${styles.title} flex flex-col text-[12px]`}>
                        <span className={``}>決裁金額</span>
                        <span className={``}>(万円)</span>
                      </div>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          // data-text={`${selectedRowDataMeeting?.occupation ? selectedRowDataMeeting?.occupation : ""}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // if (!isDesktopGTE1600 && isOpenSidebar) {
                            //   handleOpenTooltip({e});
                            // }
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            // if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) {
                            //   handleCloseTooltip();
                            // }
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataMeeting?.approval_amount ? selectedRowDataMeeting?.approval_amount : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* Email 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span
                        className={`${styles.title}`}
                        data-text={`${
                          selectedRowDataMeeting?.contact_email ? selectedRowDataMeeting?.contact_email : ""
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
                        E-mail
                      </span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.contact_email ? selectedRowDataMeeting?.contact_email : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 同席者エリア */}
                {/* {selectedRowDataMeeting &&
                selectedRowDataMeeting.attendees_info &&
                selectedRowDataMeeting.attendees_info.length > 0 && (
                  <div className={`mt-[10px]`}>
                    <AttendeesListTable attendeesArray={selectedRowDataMeeting.attendees_info} />
                  </div>
                )} */}
                <div className={`mt-[10px]`}>
                  <AttendeesListTable
                    attendeesArray={
                      selectedRowDataMeeting?.attendees_info && selectedRowDataMeeting?.attendees_info.length > 0
                        ? selectedRowDataMeeting.attendees_info
                        : []
                    }
                    isSelected={!!selectedRowDataMeeting}
                  />
                </div>
                {/* 同席者エリアここまで */}

                {/* 内線TEL・代表TEL 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>内線TEL</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${selectedRowDataMeeting?.extension ? selectedRowDataMeeting?.extension : ""}`}
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
                          {selectedRowDataMeeting?.extension ? selectedRowDataMeeting?.extension : ""}
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
                          data-text={`${
                            selectedRowDataMeeting?.main_phone_number ? selectedRowDataMeeting?.main_phone_number : ""
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
                          {selectedRowDataMeeting?.main_phone_number ? selectedRowDataMeeting?.main_phone_number : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 直通FAX・代表FAX 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>直通FAX</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${selectedRowDataMeeting?.direct_fax ? selectedRowDataMeeting?.direct_fax : ""}`}
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
                          {selectedRowDataMeeting?.direct_fax ? selectedRowDataMeeting?.direct_fax : ""}
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
                          data-text={`${selectedRowDataMeeting?.main_fax ? selectedRowDataMeeting?.main_fax : ""}`}
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
                          {selectedRowDataMeeting?.main_fax ? selectedRowDataMeeting?.main_fax : ""}
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

                {/* 社用携帯・私用携帯 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>社用携帯</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataMeeting?.company_cell_phone ? selectedRowDataMeeting?.company_cell_phone : ""
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
                          {selectedRowDataMeeting?.company_cell_phone ? selectedRowDataMeeting?.company_cell_phone : ""}
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
                          data-text={`${
                            selectedRowDataMeeting?.personal_cell_phone
                              ? selectedRowDataMeeting?.personal_cell_phone
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
                          {selectedRowDataMeeting?.personal_cell_phone
                            ? selectedRowDataMeeting?.personal_cell_phone
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 郵便番号 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>郵便番号</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          // data-text={`${
                          //   selectedRowDataMeeting?.personal_cell_phone ? selectedRowDataMeeting?.personal_cell_phone : ""
                          // }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // const el = e.currentTarget;
                            // if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataMeeting?.zipcode ? selectedRowDataMeeting?.zipcode : ""}
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

                {/* 住所 通常モード */}
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
                          {selectedRowDataMeeting?.address ? selectedRowDataMeeting?.address : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline} `}></div>
                  </div>
                </div>

                {/* 規模（ランク）・決算月 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataMeeting?.number_of_employees_class
                              ? getNumberOfEmployeesClass(selectedRowDataMeeting?.number_of_employees_class)
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
                          {selectedRowDataMeeting?.number_of_employees_class
                            ? getNumberOfEmployeesClass(selectedRowDataMeeting?.number_of_employees_class)
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
                          // data-text={`${
                          //     selectedRowDataMeeting?.number_of_employees_class
                          //       ? selectedRowDataMeeting?.number_of_employees_class
                          //       : ""
                          //   }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // const el = e.currentTarget;
                            // if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataMeeting?.fiscal_end_month ? selectedRowDataMeeting?.fiscal_end_month : ""}
                        </span>
                      )}
                      {/* {searchMode && (
                      <select
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
                      </select>
                    )} */}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 予算申請月1・予算申請月2 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title} text-[12px]`}>予算申請月1</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          // data-text={`${
                          //     selectedRowDataMeeting?.number_of_employees_class
                          //       ? selectedRowDataMeeting?.number_of_employees_class
                          //       : ""
                          //   }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // if (!isDesktopGTE1600 && isOpenSidebar) {
                            //   handleOpenTooltip({e});
                            // }
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            // if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) {
                            //   handleCloseTooltip();
                            // }
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataMeeting?.budget_request_month1
                            ? selectedRowDataMeeting?.budget_request_month1
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
                          // data-text={`${
                          //     selectedRowDataMeeting?.number_of_employees_class
                          //       ? selectedRowDataMeeting?.number_of_employees_class
                          //       : ""
                          //   }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // if (!isDesktopGTE1600 && isOpenSidebar) {
                            //   handleOpenTooltip({e});
                            // }
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            // if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) {
                            //   handleCloseTooltip();
                            // }
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataMeeting?.budget_request_month2
                            ? selectedRowDataMeeting?.budget_request_month2
                            : ""}
                        </span>
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
                        <span
                          className={`${styles.value}`}
                          // data-text={`${
                          //     selectedRowDataMeeting?.number_of_employees_class
                          //       ? selectedRowDataMeeting?.number_of_employees_class
                          //       : ""
                          //   }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // if (!isDesktopGTE1600 && isOpenSidebar) {
                            //   handleOpenTooltip({e});
                            // }
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            // if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) {
                            //   handleCloseTooltip();
                            // }
                            handleCloseTooltip();
                          }}
                        >
                          {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                          {selectedRowDataMeeting?.capital
                            ? convertToJapaneseCurrencyFormat(selectedRowDataMeeting.capital)
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
                          // data-text={`${
                          //     selectedRowDataMeeting?.number_of_employees_class
                          //       ? selectedRowDataMeeting?.number_of_employees_class
                          //       : ""
                          //   }`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // if (!isDesktopGTE1600 && isOpenSidebar) {
                            //   handleOpenTooltip({e});
                            // }
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            // if ((!isDesktopGTE1600 && isOpenSidebar) || hoveredItemPosWrap) {
                            //   handleCloseTooltip();
                            // }
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataMeeting?.established_in ? selectedRowDataMeeting?.established_in : ""}
                        </span>
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
                          <span
                            data-text={`${
                              selectedRowDataMeeting?.business_content ? selectedRowDataMeeting?.business_content : ""
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
                            // onMouseEnter={(e) => handleOpenTooltip({e})}
                            // onMouseLeave={handleCloseTooltip}
                            className={`${styles.textarea_value} `}
                            dangerouslySetInnerHTML={{
                              __html: selectedRowDataMeeting?.business_content
                                ? selectedRowDataMeeting?.business_content.replace(/\n/g, "<br>")
                                : "",
                            }}
                          ></span>
                          {/* <div
                          className={`max-h-max min-h-[70px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                          // className={`${styles.value} h-[85px] ${styles.textarea_box} ${styles.textarea_box_bg}`}
                          // onMouseEnter={(e) => handleOpenTooltip({e})}
                          // onMouseLeave={handleCloseTooltip}
                          dangerouslySetInnerHTML={{
                            __html: selectedRowDataMeeting?.business_content
                              ? selectedRowDataMeeting?.business_content.replace(/\n/g, "<br>")
                              : "",
                          }}
                        ></div> */}
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 主要取引先 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>主要取引先</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataMeeting?.clients ? selectedRowDataMeeting?.clients : ""}`}
                          className={`${styles.value}`}
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
                          {selectedRowDataMeeting?.clients ? selectedRowDataMeeting?.clients : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 主要仕入先 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>主要仕入先</span>
                      {!searchMode && (
                        <span
                          data-text={`${selectedRowDataMeeting?.supplier ? selectedRowDataMeeting?.supplier : ""}`}
                          className={`${styles.value}`}
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
                          {selectedRowDataMeeting?.supplier ? selectedRowDataMeeting?.supplier : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 設備 通常モード */}
                <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box}  flex h-full`}>
                      <span className={`${styles.title}`}>設備</span>
                      {!searchMode && (
                        <>
                          <span
                            data-text={`${selectedRowDataMeeting?.facility ? selectedRowDataMeeting?.facility : ""}`}
                            className={`${styles.textarea_value}`}
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
                              __html: selectedRowDataMeeting?.facility
                                ? selectedRowDataMeeting?.facility.replace(/\n/g, "<br>")
                                : "",
                            }}
                          >
                            {/* {selectedRowDataMeeting?.facility ? selectedRowDataMeeting?.facility : ""} */}
                          </span>
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業拠点・海外拠点 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>事業拠点</span>
                      {!searchMode && (
                        <span
                          data-text={`${
                            selectedRowDataMeeting?.business_sites ? selectedRowDataMeeting?.business_sites : ""
                          }`}
                          className={`${styles.value}`}
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
                          {selectedRowDataMeeting?.business_sites ? selectedRowDataMeeting?.business_sites : ""}
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
                          data-text={`${
                            selectedRowDataMeeting?.overseas_bases ? selectedRowDataMeeting?.overseas_bases : ""
                          }`}
                          className={`${styles.value}`}
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
                          {selectedRowDataMeeting?.overseas_bases ? selectedRowDataMeeting?.overseas_bases : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* グループ会社 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>ｸﾞﾙｰﾌﾟ会社</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataMeeting?.group_company ? selectedRowDataMeeting?.group_company : ""
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
                          {selectedRowDataMeeting?.group_company ? selectedRowDataMeeting?.group_company : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* HP 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>HP</span>
                      {/* {!searchMode && (
                      <span className={`${styles.value}`}>
                        {selectedRowDataMeeting?.website_url ? selectedRowDataMeeting?.website_url : ""}
                      </span>
                    )} */}
                      {!searchMode && !!selectedRowDataMeeting?.website_url ? (
                        <a
                          href={selectedRowDataMeeting.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`${styles.value} ${styles.anchor}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                        >
                          {selectedRowDataMeeting.website_url}
                        </a>
                      ) : (
                        <span></span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 会社Email 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>会社Email</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value} ${styles.email_value}`}
                          onMouseEnter={(e) => {
                            e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                            // handleOpenTooltip({e});
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                            handleCloseTooltip();
                          }}
                          onClick={async () => {
                            if (!selectedRowDataMeeting?.company_email) return;
                            try {
                              await navigator.clipboard.writeText(selectedRowDataMeeting.company_email);
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
                          {selectedRowDataMeeting?.company_email ? selectedRowDataMeeting?.company_email : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 業種 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>○業種</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
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
                          {selectedRowDataMeeting?.industry_type_id
                            ? mappingIndustryType[selectedRowDataMeeting?.industry_type_id][language]
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/* 製品分類(大分類) 通常モード */}
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} flex flex-col text-[12px] ${styles.double_text}`}>
                        <span className={``}>製品分類</span>
                        <span className={``}>(大分類)</span>
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
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} flex flex-col text-[12px] ${styles.double_text}`}>
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
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title} flex flex-col text-[12px] ${styles.double_text}`}>
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
                <div className={`${styles.row_area} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>○法人番号</span>
                      {!searchMode && (
                        <span
                          className={`${styles.value}`}
                          data-text={`${
                            selectedRowDataMeeting?.corporate_number ? selectedRowDataMeeting?.corporate_number : ""
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
                          {selectedRowDataMeeting?.corporate_number ? selectedRowDataMeeting?.corporate_number : ""}
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
                        {selectedRowDataMeeting?.company_id ? selectedRowDataMeeting?.company_id : ""}
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.section_title}`}>予定</span>

                      {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                    </span> */}
                    </div>
                    <div className={`${styles.section_underline}`}></div>
                  </div>
                </div>

                {/* ●面談日・●面談ﾀｲﾌﾟ サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>●面談日</span>
                      {/* <DatePickerCustomInput
                        startDate={inputPlannedDate}
                        setStartDate={setInputPlannedDate}
                        required={false}
                      /> */}
                      <DatePickerCustomInputForSearch
                        startDate={inputPlannedDate}
                        setStartDate={setInputPlannedDate}
                        required={false}
                        isNotNullForSearch={true}
                        handleOpenTooltip={handleOpenTooltip}
                        handleCloseTooltip={handleCloseTooltip}
                        tooltipDataText="面談日"
                        isNotNullText="面談日有りのデータのみ"
                        isNullText="面談日無しのデータのみ"
                      />
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title_search_mode}`}>●面談ﾀｲﾌﾟ</span>
                      <select
                        className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                        value={inputMeetingType}
                        onChange={(e) => {
                          setInputMeetingType(e.target.value);
                        }}
                      >
                        <option value=""></option>
                        {optionsMeetingType.map((option) => (
                          <option key={option} value={option}>
                            {getMeetingType(option)}
                          </option>
                        ))}
                        {/* <option value="訪問">訪問</option>
                      <option value="WEB">WEB</option> */}
                      </select>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 面談開始・WEBツール サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span
                        className={`${styles.title_search_mode}`}
                        data-text={`〜時台のデータを検索する場合は時間のみ、`}
                        data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                        onMouseEnter={(e) => {
                          // e.currentTarget.parentElement?.classList.add(`${styles.active}`);
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          // e.currentTarget.parentElement?.classList.remove(`${styles.active}`);
                          handleCloseTooltip();
                        }}
                      >
                        面談開始
                      </span>
                      <select
                        className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                        data-text={`〜時台のデータを検索する場合は時間のみ、`}
                        data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                        }}
                        placeholder="時"
                        value={inputPlannedStartTimeHour}
                        onChange={(e) => {
                          setInputPlannedStartTimeHour(e.target.value === "" ? "" : e.target.value);
                          handleCloseTooltip();
                        }}
                      >
                        <option value=""></option>
                        {hours.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>

                      <span className="mx-[10px]">時</span>

                      <select
                        className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                        data-text={`〜時台のデータを検索する場合は時間のみ、`}
                        data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                        }}
                        placeholder="分"
                        value={inputPlannedStartTimeMinute}
                        onChange={(e) => {
                          setInputPlannedStartTimeMinute(e.target.value === "" ? "" : e.target.value);
                          handleCloseTooltip();
                        }}
                      >
                        <option value=""></option>
                        {minutes5.map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                      <span className="mx-[10px]">分</span>
                    </div>
                    <div className={`${styles.underline}`}></div>
                    <div
                      className={`fade05_forward absolute left-0 top-[100%] z-[10] hidden h-max min-h-full w-full flex-col items-end justify-start bg-[var(--color-bg-base)] pl-[10px] pr-[30px] group-hover:flex`}
                    >
                      <div className={`${styles.line_first} flex min-h-[35px] items-center justify-end space-x-[6px]`}>
                        {/* <div
                          className={`flex-center max-h-[25px] min-h-[25px] cursor-pointer space-x-[3px] rounded-[6px] border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-btn-brand-f)] px-[10px] text-[11px] text-[#fff] hover:bg-[var(--color-bg-brand-f)]`}
                        >
                          <MdMoreTime className={`text-[15px] text-[#fff]`} />
                          <span>プリセット</span>
                        </div> */}
                        <button
                          type="button"
                          className={`flex-center transition-color03 relative max-h-[25px]  min-h-[25px] min-w-[25px] max-w-[25px] cursor-pointer rounded-full border border-solid border-[#666] bg-[#00000066] text-[11px] font-bold text-[#fff] hover:border-[#ff3b5b] hover:bg-[var(--color-btn-bg-delete)] active:bg-[var(--color-btn-bg-delete-active)]`}
                          data-text={`設定した時間を削除`}
                          onMouseEnter={(e) => {
                            handleOpenTooltip({ e, display: "top" });
                          }}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => {
                            if (inputPlannedStartTimeHour !== "") setInputPlannedStartTimeHour("");
                            if (inputPlannedStartTimeMinute !== "") setInputPlannedStartTimeMinute("");
                            handleCloseTooltip();
                          }}
                        >
                          {/* <MdClose className="pointer-events-none text-[18px]" /> */}
                          <MdOutlineDeleteOutline className="pointer-events-none text-[16px]" />
                        </button>
                        <div
                          // className={`${styles.btn_brand} flex-center max-h-[25px] space-x-[3px] px-[10px] text-[11px]`}
                          className={`flex-center max-h-[25px] min-h-[25px] cursor-pointer space-x-[3px] rounded-[6px] border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-btn-brand-f)] px-[10px] text-[11px] text-[#fff] hover:bg-[var(--color-bg-brand-f)] active:bg-[var(--color-bg-brand-f-deep)]`}
                          onClick={() => {
                            setIsOpenTimePicker(true);
                            timePickerTypeRef.current = "planned";
                            timePickerIncrementTypeRef.current = "5";
                            handleCloseTooltip();
                          }}
                          onMouseEnter={(e) => handleOpenTooltip({ e, content: "時間設定画面を開く" })}
                          onMouseLeave={handleCloseTooltip}
                        >
                          <MdMoreTime className={`text-[15px] text-[#fff]`} />
                          <span>時間設定</span>
                        </div>
                      </div>
                      <div className={`${styles.line_second} flex min-h-[35px] flex-wrap items-start justify-end`}>
                        {presetTimes.map(({ time, hour, minute }, index) => (
                          <div
                            key={`${time}_${index}`}
                            className={`flex-center ml-[6px] max-h-[25px] min-h-[25px] min-w-[50px] cursor-pointer rounded-[6px] border-solid px-[8px] text-[11px] text-[var(--color-text-title)] hover:border hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f)] hover:text-[#fff] active:bg-[var(--color-bg-brand-f-deep)]`}
                            onClick={() => {
                              if (hour !== inputPlannedStartTimeHour) setInputPlannedStartTimeHour(hour);
                              if (minute !== inputPlannedStartTimeMinute) setInputPlannedStartTimeMinute(minute);
                            }}
                          >
                            <span>{time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title_search_mode}`}>WEBﾂｰﾙ</span>
                      <select
                        className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                        value={inputMeetingType}
                        onChange={(e) => {
                          setInputMeetingType(e.target.value);
                        }}
                      >
                        <option value=""></option>
                        {optionsWebTool.map((option) => (
                          <option key={option} value={option}>
                            {getWebTool(option)}
                          </option>
                        ))}
                        <option value="is not null">入力有りのデータのみ</option>
                        <option value="is null">入力無しのデータのみ</option>
                      </select>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 面談時間(分) サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>面談時間(分)</span>
                      <input
                        type="number"
                        min="0"
                        className={`${styles.input_box}`}
                        placeholder=""
                        value={inputPlannedDuration === null ? "" : inputPlannedDuration}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setInputPlannedDuration(null);
                          } else {
                            const numValue = Number(val);

                            // 入力値がマイナスかチェック
                            if (numValue < 0) {
                              setInputPlannedDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                            } else {
                              setInputPlannedDuration(numValue);
                            }
                          }
                        }}
                      />
                      {/* バツボタン */}
                      {!!inputPlannedDuration && (
                        <div className={`${styles.close_btn_number}`} onClick={() => setInputPlannedDuration(null)}>
                          <MdClose className="text-[20px] " />
                        </div>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}></div>
                  </div>
                </div>

                {/* 面談目的・アポ有 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title_search_mode} flex flex-col`}>
                        <span className={``}>面談目的</span>
                      </div>
                      <select
                        className={`ml-auto h-full w-[100%] cursor-pointer  ${styles.select_box}`}
                        value={inputPlannedPurpose}
                        onChange={(e) => {
                          setInputPlannedPurpose(e.target.value);
                        }}
                      >
                        <option value=""></option>
                        {optionsPlannedPurpose.map((option) => (
                          <option key={option} value={option}>
                            {getPlannedPurpose(option)}
                          </option>
                        ))}
                        {/* <option value="新規会社/能動">新規会社/能動</option>
                      <option value="被り会社/能動">被り会社/能動</option>
                      <option value="社内ID/能動">社内ID/能動</option>
                      <option value="社外･客先ID/能動">社外･客先ID/能動</option>
                      <option value="営業メール/受動">営業メール/能動</option>
                      <option value="見･聞引合/受動">見･聞引合/受動</option>
                      <option value="DM/受動">DM/受動</option>
                      <option value="メール/受動">メール/受動</option>
                      <option value="ホームページ/受動">ホームページ/受動</option>
                      <option value="展示会/受動">展示会/受動</option>
                      <option value="他(売前ﾌｫﾛｰ)">他(売前ﾌｫﾛｰ)</option>
                      <option value="他(納品説明)">他(納品説明)</option>
                      <option value="他(客先要望サポート)">他(客先要望サポート)</option>
                      <option value="その他">その他</option> */}
                      </select>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>

                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title_search_mode} `}>アポ有</span>

                      <div className={`${styles.grid_select_cell_header} `}>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          // value={inputClaimFlag}
                          // onChange={(e) => setInputClaimFlag(e.target.value)}
                          value={
                            inputPlannedAppointCheckFlag === null
                              ? // ? "指定なし"
                                ""
                              : inputPlannedAppointCheckFlag
                              ? "チェック有り"
                              : "チェック無し"
                          }
                          onChange={handleAppointCheckChangeSelectTagValue}
                        >
                          {/* <option value="指定なし">指定なし</option> */}
                          <option value=""></option>
                          <option value="チェック無し">チェック無し</option>
                          <option value="チェック有り">チェック有り</option>
                        </select>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 紹介予定ﾒｲﾝ・紹介予定ｻﾌﾞ サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode} text-[12px]`}>紹介予定ﾒｲﾝ</span>
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder=""
                        value={inputPlannedProduct1}
                        onChange={(e) => setInputPlannedProduct1(e.target.value)}
                      />
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title_search_mode}`}>紹介予定ｻﾌﾞ</span>
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder=""
                        value={inputPlannedProduct2}
                        onChange={(e) => setInputPlannedProduct2(e.target.value)}
                      />
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事前ｺﾒﾝﾄ サーチ */}
                {/* <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[90px] w-full items-center`}> */}
                <div className={`${styles.row_area_lg_box}  flex max-h-max w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title_search_mode}`}>事前ｺﾒﾝﾄ</span>
                      {searchMode && (
                        <textarea
                          cols={30}
                          // rows={10}
                          className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                          value={inputPlannedComment}
                          onChange={(e) => setInputPlannedComment(e.target.value)}
                        ></textarea>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業部名 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>事業部名</span>
                      {/* <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputMeetingDepartment}
                      onChange={(e) => setInputMeetingDepartment(e.target.value)}
                    /> */}
                      {searchMode && (
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputMeetingCreatedByDepartmentOfUser}
                          // onChange={(e) => setInputMeetingCreatedByDepartmentOfUser(e.target.value)}
                          onChange={(e) => {
                            setInputMeetingCreatedByDepartmentOfUser(e.target.value);
                            // 課と係をリセットする
                            setInputMeetingCreatedBySectionOfUser("");
                            setInputMeetingCreatedByUnitOfUser("");
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
                          value={inputMeetingCreatedByUnitOfUser}
                          onChange={(e) => setInputMeetingCreatedByUnitOfUser(e.target.value)}
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
                            value={inputMeetingCreatedBySectionOfUser}
                            onChange={(e) => {
                              setInputMeetingCreatedBySectionOfUser(e.target.value);
                              // 係をリセットする
                              setInputMeetingCreatedByUnitOfUser("");
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
                          value={inputMeetingMemberName}
                          onChange={(e) => setInputMeetingMemberName(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 事業所・自社担当 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>事業所</span>
                      {/* <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputMeetingBusinessOffice}
                      onChange={(e) => setInputMeetingBusinessOffice(e.target.value)}
                    /> */}
                      {searchMode && (
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputMeetingCreatedByOfficeOfUser}
                          onChange={(e) => setInputMeetingCreatedByOfficeOfUser(e.target.value)}
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
                      value={inputMeetingMemberName}
                      onChange={(e) => setInputMeetingMemberName(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>
                {/* ============= 予定エリアここまで ============= */}

                {/* ============= 結果エリアここから ============= */}
                {/* 結果 サーチ */}
                <div
                  className={`${styles.row_area} ${styles.row_area_search_mode} !mt-[20px] flex w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.section_title}`}>結果</span>

                      {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                      </span> */}
                    </div>
                    <div className={`${styles.section_underline}`}></div>
                  </div>
                </div>
                {/*  */}

                {/* 面談年度・面談半期 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>面談年度</span>
                      {searchMode && (
                        <input
                          type="text"
                          // placeholder="例) 2024 など"
                          data-text={`「2024」や「2023」などフィルターしたい年度を入力してください`}
                          onMouseEnter={(e) => handleOpenTooltip({ e })}
                          onMouseLeave={handleCloseTooltip}
                          className={`${styles.input_box}`}
                          value={inputMeetingFiscalYear}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInputMeetingFiscalYear(val);
                          }}
                        />
                      )}
                      {!!inputMeetingFiscalYear && (
                        <div className={`${styles.close_btn_number}`} onClick={() => setInputMeetingFiscalYear("")}>
                          <MdClose className="text-[20px] " />
                        </div>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title_search_mode}`}>面談半期</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          // placeholder="例) 20241 など"
                          data-text={`「20241」や「20242」など「年度」+「1か2」を入力してください。\n上期(H1)は1、下期(H2)は2\n例) 2024年上期は「20241」 2024年下期は「20242」`}
                          // onMouseEnter={(e) => handleOpenTooltip({{e,itemPosition:  "left", whiteSpace: "pre-wrap"}})}
                          onMouseEnter={(e) => handleOpenTooltip({ e, itemPosition: "left", whiteSpace: "pre-wrap" })}
                          onMouseLeave={handleCloseTooltip}
                          value={inputMeetingHalfYear}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInputMeetingHalfYear(val);
                          }}
                        />
                      )}
                      {!!inputMeetingHalfYear && (
                        <div className={`${styles.close_btn_number}`} onClick={() => setInputMeetingHalfYear("")}>
                          <MdClose className="text-[20px] " />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/*  */}

                {/* 面談四半期・面談年月度 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>面談四半期</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          // placeholder="年度と1~4(Q1~Q4)を入力 例) 20244 など"
                          data-text={`「20241」や「20242」など「年度」+「1~4」を入力してください。\n第一四半期(Q1)は1、第二四半期(Q2)は2、第三四半期(Q3)は3、第四四半期(Q4)は4\n例) 2024年Q1は「20241」 2024年Q4は「20244」`}
                          // onMouseEnter={(e) => handleOpenTooltip({e,itemPosition:  "left", whiteSpace: "pre-wrap"})}
                          onMouseEnter={(e) => handleOpenTooltip({ e, itemPosition: "left", whiteSpace: "pre-wrap" })}
                          onMouseLeave={handleCloseTooltip}
                          value={inputMeetingQuarter}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInputMeetingQuarter(val);
                          }}
                        />
                      )}
                      {!!inputMeetingQuarter && (
                        <div className={`${styles.close_btn_number}`} onClick={() => setInputMeetingQuarter("")}>
                          <MdClose className="text-[20px] " />
                        </div>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title_search_mode}`}>面談年月度</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          // placeholder="年月を入力 例) 202412 など"
                          data-text={`「202312」や「202304」など「年度」+「01~12」を入力してください。\n1月は「01」、2月は「02」...12月は「12」\n例) 2024年1月度は「202401」 2024年12月度は「202412」`}
                          onMouseEnter={(e) => handleOpenTooltip({ e, itemPosition: "left", whiteSpace: "pre-wrap" })}
                          onMouseLeave={handleCloseTooltip}
                          value={inputMeetingYearMonth}
                          onChange={(e) => {
                            const val = e.target.value;
                            setInputMeetingYearMonth(val);
                          }}
                        />
                      )}
                      {!!inputMeetingYearMonth && (
                        <div className={`${styles.close_btn_number}`} onClick={() => setInputMeetingYearMonth("")}>
                          <MdClose className="text-[20px] " />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {/*  */}

                {/* 面談日 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>面談日</span>
                      {/* <DatePickerCustomInput
                        startDate={inputResultDate}
                        setStartDate={setInputResultDate}
                        required={false}
                      /> */}
                      <DatePickerCustomInputForSearch
                        startDate={inputResultDate}
                        setStartDate={setInputResultDate}
                        required={false}
                        isNotNullForSearch={true}
                        handleOpenTooltip={handleOpenTooltip}
                        handleCloseTooltip={handleCloseTooltip}
                        tooltipDataText="面談日"
                        isNotNullText="面談日有りのデータのみ"
                        isNullText="面談日無しのデータのみ"
                      />
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      {/* <span className={`${styles.title_search_mode}`}>面談年月度</span>
                    {searchMode && (
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder='"202312" など年月を入力'
                        value={inputMeetingYearMonth}
                        onChange={(e) => {
                          const val = e.target.value;
                          setInputMeetingYearMonth(val);
                        }}
                      />
                    )}
                    {!!inputMeetingYearMonth && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputMeetingYearMonth("")}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )} */}
                      {/* {searchMode && (
                      <input
                        type="number"
                        min="0"
                        className={`${styles.input_box}`}
                        placeholder='"202312" など年月を入力'
                        value={inputMeetingYearMonth === null ? "" : inputMeetingYearMonth}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setInputMeetingYearMonth(null);
                          } else {
                            const numValue = Number(val);

                            // 入力値がマイナスかチェック
                            if (numValue < 0) {
                              setInputMeetingYearMonth(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                            } else {
                              setInputMeetingYearMonth(numValue);
                            }
                          }
                        }}
                      />
                    )}
                    {!!inputMeetingYearMonth && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setInputMeetingYearMonth(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )} */}
                    </div>
                  </div>
                </div>
                {/*  */}

                {/* 結果 面談開始・面談終了 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span
                        className={`${styles.title_search_mode}`}
                        data-text={`〜時台のデータを検索する場合は時間のみ、`}
                        data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                        }}
                      >
                        面談開始
                      </span>
                      <select
                        className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                        data-text={`〜時台のデータを検索する場合は時間のみ、`}
                        data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                        }}
                        placeholder="時"
                        value={inputResultStartTimeHour}
                        onChange={(e) => {
                          setInputResultStartTimeHour(e.target.value === "" ? "" : e.target.value);
                          handleCloseTooltip();
                        }}
                      >
                        <option value=""></option>
                        {hours.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>

                      <span className="mx-[10px]">時</span>

                      <select
                        className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                        data-text={`〜時台のデータを検索する場合は時間のみ、`}
                        data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                        }}
                        placeholder="分"
                        value={inputResultStartTimeMinute}
                        onChange={(e) => {
                          setInputResultStartTimeMinute(e.target.value === "" ? "" : e.target.value);
                          handleCloseTooltip();
                        }}
                      >
                        <option value=""></option>
                        {minutes.map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                      <span className="mx-[10px]">分</span>
                    </div>
                    <div className={`${styles.underline}`}></div>
                    <div
                      className={`fade05_forward absolute left-0 top-[100%] z-[10] hidden h-full w-full items-center justify-end space-x-[6px] bg-[var(--color-bg-base)] pl-[10px] pr-[30px] group-hover:flex`}
                    >
                      <button
                        type="button"
                        className={`flex-center transition-color03 relative max-h-[25px]  min-h-[25px] min-w-[25px] max-w-[25px] cursor-pointer rounded-full border border-solid border-[#666] bg-[#00000066] text-[11px] font-bold text-[#fff] hover:border-[#ff3b5b] hover:bg-[#ff3b5b56] active:bg-[#0d99ff]`}
                        data-text={`設定した時間を削除`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={handleCloseTooltip}
                        onClick={() => {
                          if (inputResultStartTimeHour !== "") setInputResultStartTimeHour("");
                          if (inputResultStartTimeMinute !== "") setInputResultStartTimeMinute("");
                          handleCloseTooltip();
                        }}
                      >
                        {/* <MdClose className="pointer-events-none text-[18px]" /> */}
                        <MdOutlineDeleteOutline className="pointer-events-none text-[16px]" />
                      </button>
                      <div
                        // className={`${styles.btn_brand} flex-center max-h-[25px] space-x-[3px] px-[10px] text-[11px]`}
                        className={`flex-center max-h-[25px] min-h-[25px] cursor-pointer space-x-[3px] rounded-[6px] border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-btn-brand-f)] px-[10px] text-[11px] text-[#fff] hover:bg-[var(--color-bg-brand-f)]`}
                        onClick={() => {
                          setIsOpenTimePicker(true);
                          timePickerTypeRef.current = "result_start";
                          timePickerIncrementTypeRef.current = "all";
                          handleCloseTooltip();
                        }}
                        onMouseEnter={(e) => handleOpenTooltip(e, "top", 0, "center", undefined, "時間設定画面を開く")}
                        onMouseLeave={handleCloseTooltip}
                      >
                        <MdMoreTime className={`text-[15px] text-[#fff]`} />
                        <span>時間設定</span>
                      </div>
                    </div>
                  </div>
                  <div className="group relative flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span
                        className={`${styles.title_search_mode}`}
                        data-text={`〜時台のデータを検索する場合は時間のみ、`}
                        data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                        }}
                      >
                        面談終了
                      </span>
                      <select
                        className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                        data-text={`〜時台のデータを検索する場合は時間のみ、`}
                        data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                        }}
                        placeholder="時"
                        value={inputResultEndTimeHour}
                        onChange={(e) => {
                          setInputResultEndTimeHour(e.target.value === "" ? "" : e.target.value);
                          handleCloseTooltip();
                        }}
                      >
                        <option value=""></option>
                        {hours.map((hour) => (
                          <option key={hour} value={hour}>
                            {hour}
                          </option>
                        ))}
                      </select>

                      <span className="mx-[10px]">時</span>

                      <select
                        className={`ml-auto h-full w-[80%] cursor-pointer  ${styles.select_box}`}
                        data-text={`〜時台のデータを検索する場合は時間のみ、`}
                        data-text2={`〜分のデータを検索する場合は分のみを指定してください。`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={(e) => {
                          handleCloseTooltip();
                        }}
                        placeholder="分"
                        value={inputResultEndTimeMinute}
                        onChange={(e) => {
                          setInputResultEndTimeMinute(e.target.value === "" ? "" : e.target.value);
                          handleCloseTooltip();
                        }}
                      >
                        <option value=""></option>
                        {minutes.map((minute) => (
                          <option key={minute} value={minute}>
                            {minute}
                          </option>
                        ))}
                      </select>
                      <span className="mx-[10px]">分</span>
                    </div>
                    <div className={`${styles.underline}`}></div>
                    <div
                      className={`fade05_forward absolute left-0 top-[100%] z-[10] hidden h-full w-full items-center justify-end space-x-[6px] bg-[var(--color-bg-base)] pl-[10px] pr-[30px] group-hover:flex`}
                    >
                      <button
                        type="button"
                        className={`flex-center transition-color03 relative max-h-[25px]  min-h-[25px] min-w-[25px] max-w-[25px] cursor-pointer rounded-full border border-solid border-[#666] bg-[#00000066] text-[11px] font-bold text-[#fff] hover:border-[#ff3b5b] hover:bg-[#ff3b5b56] active:bg-[#0d99ff]`}
                        data-text={`設定した時間を削除`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({ e, display: "top" });
                        }}
                        onMouseLeave={handleCloseTooltip}
                        onClick={() => {
                          if (inputResultEndTimeHour !== "") setInputResultEndTimeHour("");
                          if (inputResultEndTimeMinute !== "") setInputResultEndTimeMinute("");
                          handleCloseTooltip();
                        }}
                      >
                        {/* <MdClose className="pointer-events-none text-[18px]" /> */}
                        <MdOutlineDeleteOutline className="pointer-events-none text-[16px]" />
                      </button>
                      <div
                        // className={`${styles.btn_brand} flex-center max-h-[25px] space-x-[3px] px-[10px] text-[11px]`}
                        className={`flex-center max-h-[25px] min-h-[25px] cursor-pointer space-x-[3px] rounded-[6px] border border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-btn-brand-f)] px-[10px] text-[11px] text-[#fff] hover:bg-[var(--color-bg-brand-f)]`}
                        onClick={() => {
                          setIsOpenTimePicker(true);
                          timePickerTypeRef.current = "result_end";
                          timePickerIncrementTypeRef.current = "all";
                          handleCloseTooltip();
                        }}
                        onMouseEnter={(e) => handleOpenTooltip({ e, content: "時間設定画面を開く" })}
                        onMouseLeave={handleCloseTooltip}
                      >
                        <MdMoreTime className={`text-[15px] text-[#fff]`} />
                        <span>時間設定</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 面談時間(分)・面談人数 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title_search_mode} flex flex-col`}>
                        <span className={``}>面談時間</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        className={`${styles.input_box}`}
                        placeholder=""
                        value={inputResultDuration === null ? "" : inputResultDuration}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "") {
                            setInputResultDuration(null);
                          } else {
                            const numValue = Number(val);

                            // 入力値がマイナスかチェック
                            if (numValue < 0) {
                              setInputResultDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                            } else {
                              setInputResultDuration(numValue);
                            }
                          }
                        }}
                      />
                      {/* バツボタン */}
                      {!!inputResultDuration && (
                        <div className={`${styles.close_btn_number}`} onClick={() => setInputResultDuration(null)}>
                          <MdClose className="text-[20px] " />
                        </div>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>

                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title_search_mode}`}>面談人数</span>

                      <div className={`${styles.grid_select_cell_header} `}>
                        <input
                          type="number"
                          min="0"
                          className={`${styles.input_box}`}
                          placeholder=""
                          value={
                            inputResultNumberOfMeetingParticipants === null
                              ? ""
                              : inputResultNumberOfMeetingParticipants
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              setInputResultNumberOfMeetingParticipants(null);
                            } else {
                              const numValue = Number(val);

                              // 入力値がマイナスかチェック
                              if (numValue < 0) {
                                setInputResultNumberOfMeetingParticipants(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                              } else {
                                setInputResultNumberOfMeetingParticipants(numValue);
                              }
                            }
                          }}
                        />
                        {/* バツボタン */}
                        {!!inputResultNumberOfMeetingParticipants && (
                          <div
                            className={`${styles.close_btn_number}`}
                            onClick={() => setInputResultNumberOfMeetingParticipants(null)}
                          >
                            <MdClose className="text-[20px] " />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施1・実施2 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>実施商品1</span>
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder=""
                        value={inputResultPresentationProduct1}
                        onChange={(e) => setInputResultPresentationProduct1(e.target.value)}
                      />
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title_search_mode}`}>実施商品2</span>
                      <input
                        type="text"
                        className={`${styles.input_box}`}
                        placeholder=""
                        value={inputResultPresentationProduct2}
                        onChange={(e) => setInputResultPresentationProduct2(e.target.value)}
                      />
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 実施3・実施4 サーチ */}
                {/* <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>実施商品3</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputResultPresentationProduct3}
                      onChange={(e) => setInputResultPresentationProduct3(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title_search_mode}`}>実施商品4</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputResultPresentationProduct4}
                      onChange={(e) => setInputResultPresentationProduct4(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div> */}

                {/* 実施5 サーチ */}
                {/* <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title_search_mode}`}>実施商品5</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputResultPresentationProduct5}
                      onChange={(e) => setInputResultPresentationProduct5(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
                <div className="flex h-full w-1/2 flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}></div>
                </div>
              </div> */}

                {/* 結果ｺﾒﾝﾄ サーチ */}
                {/* <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[90px] w-full items-center`}> */}
                <div className={`${styles.row_area_lg_box}  flex max-h-max w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title_search_mode}`}>結果ｺﾒﾝﾄ</span>
                      <textarea
                        cols={30}
                        // rows={10}
                        className={`${styles.textarea_box} ${styles.textarea_box_search_mode}`}
                        value={inputResultSummary}
                        onChange={(e) => setInputResultSummary(e.target.value)}
                      ></textarea>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 訪問結果 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[70px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <span className={`${styles.title_search_mode}`}>訪問結果</span>
                      <select
                        className={`ml-auto h-full w-[100%] cursor-pointer  ${styles.select_box}`}
                        value={inputResultCategory}
                        onChange={(e) => {
                          setInputResultCategory(e.target.value);
                        }}
                      >
                        <option value=""></option>
                        {optionsResultCategory.map((option) => (
                          <option key={option} value={option}>
                            {getResultCategory(option)}
                          </option>
                        ))}
                        {/* <option value="展開F(当期中に導入の可能性あり)">展開F(当期中に導入の可能性あり)</option>
                      <option value="展開N(来期導入の可能性あり)">展開N(来期導入の可能性あり)</option>
                      <option value="展開継続">展開継続</option>
                      <option value="時期尚早">時期尚早</option>
                      <option value="頻度低い(ニーズあるが頻度低く導入には及ばず)">
                        頻度低い(ニーズあるが頻度低く導入には及ばず)
                      </option>
                      <option value="結果出ず(再度面談や検証が必要)">結果出ず(再度面談や検証が必要)</option>
                      <option value="担当者の推進力無し(ニーズあり、上長・キーマンにあたる必要有り)">
                        担当者の推進力無し(ニーズあり、上長・キーマンにあたる必要有り)
                      </option>
                      <option value="用途・ニーズなし">用途・ニーズなし</option>
                      <option value="他(立ち上げ、サポート)">他(立ち上げ、サポート)</option>
                      <option value="その他">その他</option> */}
                        <option value="is not null">入力有りのデータのみ</option>
                        <option value="is null">入力無しのデータのみ</option>
                      </select>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 面談時_最上位職位 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[70px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      {/* <span className={`${styles.title_search_mode}`}>面談時</span> */}
                      <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                        <span className={``}>面談時_</span>
                        <span className={``}>最上位職位</span>
                      </div>
                      <select
                        className={`mr-auto h-full w-[100%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputResultTopPositionClass}
                        onChange={(e) => {
                          // if (e.target.value === "") return alert("訪問目的を選択してください");
                          setInputResultTopPositionClass(e.target.value);
                        }}
                      >
                        <option value=""></option>
                        {optionsPositionsClass.map((classNum) => (
                          <option key={classNum} value={`${classNum}`}>
                            {getPositionClassName(classNum)}
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
                    <span className={`${styles.title_search_mode}`}>実施商品2</span>
                    <input
                      type="text"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={inputResultPresentationProduct2}
                      onChange={(e) => setInputResultPresentationProduct2(e.target.value)}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div> */}
                  </div>
                </div>
                {/* 面談時_決裁者商談有無・面談時_同席依頼 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[70px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full `}>
                      <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                        <span className={``}>面談時_</span>
                        <span className={``}>決裁者商談有無</span>
                      </div>
                      <select
                        className={`mr-auto h-full w-[100%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputResultNegotiateDecisionMaker}
                        onChange={(e) => {
                          setInputResultNegotiateDecisionMaker(e.target.value);
                        }}
                      >
                        {/* <option value="">選択してください</option> */}
                        <option value=""></option>
                        {optionsResultNegotiateDecisionMaker.map((option) => (
                          <option key={option} value={`${option}`}>
                            {getResultNegotiateDecisionMaker(option)}
                          </option>
                        ))}
                        {/* <option value="決裁者と未商談">決裁者と未商談</option>
                      <option value="決裁者と商談済み">決裁者と商談済み</option> */}
                        <option value="is not null">入力有りのデータのみ</option>
                        <option value="is null">入力無しのデータのみ</option>
                      </select>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <div className={`${styles.title_search_mode} flex flex-col ${styles.double_text}`}>
                        <span className={``}>面談時_</span>
                        <span className={``}>同席依頼</span>
                      </div>
                      <select
                        className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                        value={inputMeetingParticipationRequest}
                        onChange={(e) => {
                          // if (e.target.value === "") return alert("活動タイプを選択してください");
                          setInputMeetingParticipationRequest(e.target.value);
                        }}
                      >
                        <option value=""></option>
                        {optionsMeetingParticipationRequest.map((option) => (
                          <option key={option} value={`${option}`}>
                            {getMeetingParticipationRequest(option)}
                          </option>
                        ))}
                        {/* <option value="同席依頼無し">同席依頼無し</option>
                      <option value="同席依頼済み 同席OK">同席依頼済み 同席OK</option>
                      <option value="同席依頼済み 同席NG">同席依頼済み 同席NG</option> */}
                        <option value="is not null">入力有りのデータのみ</option>
                        <option value="is null">入力無しのデータのみ</option>
                      </select>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/* ============= 結果エリアここまで ============= */}

                {/* ============= 面談先詳細エリアここから ============= */}
                {/* 面談先詳細 サーチ */}
                <div
                  className={`${styles.row_area} ${styles.row_area_search_mode} !mt-[20px] flex w-full items-center`}
                >
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.section_title}`}>面談先詳細</span>

                      {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                        {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
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
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title_search_mode}`}>直通TEL</span>
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>内線TEL</span>
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
                      <span className={`${styles.title_search_mode}`}>代表TEL</span>
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>直通FAX</span>
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
                      <span className={`${styles.title_search_mode}`}>代表FAX</span>
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>社用携帯</span>
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
                      <span className={`${styles.title_search_mode}`}>私用携帯</span>
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>E-mail</span>
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>郵便番号</span>
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
                      <span className={`${styles.title_search_mode}`}></span>
                      {/* {!searchMode && (
                    <span className={`${styles.value}`}>
                      {selectedRowDataMeeting?.established_in ? selectedRowDataMeeting?.established_in : ""}
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
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>役職名</span>
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
                      <span className={`${styles.title_search_mode}`}>職位</span>
                      {searchMode && (
                        // <input
                        //   type="text"
                        //   className={`${styles.input_box} ml-[20px]`}
                        //   value={inputProductL}
                        //   onChange={(e) => setInputProductL(e.target.value)}
                        // />
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputPositionClass}
                          onChange={(e) => setInputPositionClass(e.target.value)}
                        >
                          <option value=""></option>
                          {optionsPositionsClass.map((option) => (
                            <option key={option} value={option}>
                              {getPositionClassName(option)}月
                            </option>
                          ))}
                          {/* <option value="1 代表者">1 代表者</option>
                        <option value="2 取締役/役員">2 取締役/役員</option>
                        <option value="3 部長">3 部長</option>
                        <option value="4 課長">4 課長</option>
                        <option value="5 課長未満">5 課長未満</option>
                        <option value="6 所長・工場長">6 所長・工場長</option>
                        <option value="7 不明">7 不明</option> */}
                          <option value="is not null">入力有りのデータのみ</option>
                          <option value="is null">入力無しのデータのみ</option>
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 担当職種・決裁金額 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>担当職種</span>
                      {searchMode && (
                        // <input
                        //   type="text"
                        //   className={`${styles.input_box} ml-[20px]`}
                        //   value={inputProductL}
                        //   onChange={(e) => setInputProductL(e.target.value)}
                        // />
                        <select
                          className={`ml-auto h-full w-full cursor-pointer  ${styles.select_box}`}
                          value={inputEmployeesClass}
                          onChange={(e) => setInputEmployeesClass(e.target.value)}
                        >
                          <option value=""></option>
                          {optionsOccupation.map((option) => (
                            <option key={option} value={option}>
                              {getOccupationName(option)}
                            </option>
                          ))}
                          <option value="is not null">入力有りのデータのみ</option>
                          <option value="is null">入力無しのデータのみ</option>
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <div className={`${styles.title_search_mode} flex flex-col text-[12px]`}>
                        <span className={``}>決裁金額</span>
                        <span className={``}>(万円)</span>
                      </div>
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>規模(ﾗﾝｸ)</span>
                      {searchMode && (
                        // <input
                        //   type="text"
                        //   className={`${styles.input_box} ml-[20px]`}
                        //   value={inputProductL}
                        //   onChange={(e) => setInputProductL(e.target.value)}
                        // />
                        <select
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
                          {/* <option value="A*">A 1000名以上</option>
                        <option value="B*">B 500~999名</option>
                        <option value="C*">C 300~499名</option>
                        <option value="D*">D 200~299名</option>
                        <option value="E*">E 100~199名</option>
                        <option value="F*">F 50~99名</option>
                        <option value="G*">G 1~49名</option> */}
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title_search_mode}`}>決算月</span>
                      {searchMode && (
                        <select
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
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 予算申請月1・予算申請月2 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode} text-[12px]`}>予算申請月1</span>
                      {searchMode && (
                        <select
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
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center`}>
                      <span className={`${styles.title_search_mode} text-[12px]`}>予算申請月2</span>
                      {searchMode && (
                        <select
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
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 資本金・設立 サーチ テスト */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>資本金(万円)</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {/* {selectedRowDataCompany?.capital ? selectedRowDataCompany?.capital : ""} */}
                          {selectedRowDataMeeting?.capital
                            ? convertToJapaneseCurrencyFormat(selectedRowDataMeeting.capital)
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
                      <span className={`${styles.title_search_mode}`}>設立</span>
                      {!searchMode && (
                        <span className={`${styles.value}`}>
                          {selectedRowDataMeeting?.established_in ? selectedRowDataMeeting?.established_in : ""}
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
                <div className={`${styles.row_area_lg_box} flex  w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box}  flex h-full`}>
                      <span className={`${styles.title_search_mode}`}>事業内容</span>
                      {searchMode && (
                        <textarea
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>主要取引先</span>
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>主要仕入先</span>
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
                <div className={`${styles.row_area_lg_box} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px] ">
                    <div className={`${styles.title_box}  flex h-full`}>
                      <span className={`${styles.title_search_mode}`}>設備</span>
                      {searchMode && (
                        <textarea
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>事業拠点</span>
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
                      <span className={`${styles.title_search_mode}`}>海外拠点</span>
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>ｸﾞﾙｰﾌﾟ会社</span>
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>HP</span>
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
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>会社Email</span>
                      {searchMode && (
                        <input
                          type="text"
                          className={`${styles.input_box}`}
                          placeholder="「is not null」で会社Email有りのデータのみ抽出"
                          value={inputCompanyEmail}
                          onChange={(e) => setInputCompanyEmail(e.target.value)}
                        />
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 業種 サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>○業種</span>
                      {searchMode && (
                        // <input
                        //   type="text"
                        //   className={`${styles.input_box}`}
                        //   value={inputIndustryType}
                        //   onChange={(e) => setInputIndustryType(e.target.value)}
                        // />
                        <select
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
                        </select>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/* 製品分類(大分類) サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title_search_mode} flex flex-col text-[12px]`}>
                        <span className={``}>製品分類</span>
                        <span className={``}>(大分類)</span>
                      </div>
                      {searchMode && (
                        <>
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
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/* 製品分類(中分類) サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title_search_mode} flex flex-col text-[12px]`}>
                        <span className={``}>製品分類</span>
                        <span className={``}>(中分類)</span>
                      </div>
                      {searchMode && !!inputProductArrayLarge.length && (
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
                            // maxWidth={`calc(100% - 88px)`}
                            maxWidth={`calc(100% - var(--title-width))`}
                            maxHeight={30}
                            // zIndexSelectBox={2000}
                            hideOptionAfterSelect={true}
                          />
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/* 製品分類(小分類) サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <div className={`${styles.title_search_mode} flex flex-col text-[12px]`}>
                        <span className={``}>製品分類</span>
                        <span className={``}>(小分類)</span>
                      </div>
                      {searchMode && !!inputProductArrayMedium.length && (
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
                            // maxWidth={`calc(100% - 88px)`}
                            maxWidth={`calc(100% - var(--title-width))`}
                            maxHeight={30}
                            // zIndexSelectBox={2000}
                            hideOptionAfterSelect={true}
                          />
                        </>
                      )}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* 法人番号・ID サーチ */}
                <div className={`${styles.row_area} ${styles.row_area_search_mode} flex w-full items-center`}>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title_search_mode}`}>○法人番号</span>
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
                        {selectedRowDataMeeting?.company_id ? selectedRowDataMeeting?.company_id : ""}
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
                {/* <div
                className={`flex-center h-[50px] w-[300px] bg-[var(--color-bg-brand-f)] mt-[30px] cursor-pointer`}
                onClick={() => {
                  if (scrollContainerRef.current) {
                    scrollContainerRef.current.scrollTo({ top: 0, behavior: "auto" });
                  }
                }}
              >
                スクロール
              </div> */}
              </div>
            </div>
          )}
        </div>
      </form>

      {isOpenTimePicker && (
        <TimePickerModal
          hourState={getTimePickerState(timePickerTypeRef.current).hourState}
          setHourState={getTimePickerState(timePickerTypeRef.current).setHourState}
          minuteState={getTimePickerState(timePickerTypeRef.current).minuteState}
          setMinuteState={getTimePickerState(timePickerTypeRef.current).setMinuteState}
          incrementType={timePickerIncrementTypeRef.current}
          setIsOpenModal={setIsOpenTimePicker}
          columnName={getTimePickerState(timePickerTypeRef.current).columnName}
        />
      )}
    </>
  );
};

export const MeetingMainContainerOneThird = memo(MeetingMainContainerOneThirdMemo);

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
