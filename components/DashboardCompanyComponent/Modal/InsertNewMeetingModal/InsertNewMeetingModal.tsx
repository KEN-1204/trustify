import React, { CSSProperties, FocusEventHandler, KeyboardEvent, Suspense, useEffect, useRef, useState } from "react";
import styles from "./InsertNewMeetingModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateMeeting } from "@/hooks/useMutateMeeting";
import productCategoriesM from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { MdClose } from "react-icons/md";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { BsChevronLeft } from "react-icons/bs";
import { ImInfo } from "react-icons/im";
import useStore from "@/store";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { Department, Office, Section, Unit } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import NextImage from "next/image";
import { DropDownMenuFilterProducts } from "../SettingAccountModal/SettingMemberAccounts/DropdownMenuFilterProducts/DropdownMenuFilterProducts";
import { GoChevronDown } from "react-icons/go";
import { HiChevronDown } from "react-icons/hi2";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { ConfirmationModal } from "../SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { ErrorBoundary } from "react-error-boundary";
import { FallbackSideTableSearchMember } from "../UpdateMeetingModal/SideTableSearchMember/FallbackSideTableSearchMember";
import { SideTableSearchMember } from "../UpdateMeetingModal/SideTableSearchMember/SideTableSearchMember";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import {
  getMeetingType,
  getPlannedPurpose,
  getWebTool,
  optionsMeetingType,
  optionsPlannedPurpose,
  optionsWebTool,
} from "@/utils/selectOptions";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { useQuerySections } from "@/hooks/useQuerySections";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { calculateCurrentFiscalYear } from "@/utils/Helpers/calculateCurrentFiscalYear";
import { calculateCurrentFiscalYearEndDate } from "@/utils/Helpers/calcurateCurrentFiscalYearEndDate";
import { calculateFiscalYearMonths } from "@/utils/Helpers/CalendarHelpers/calculateFiscalMonths";
import { getFiscalYear } from "@/utils/Helpers/getFiscalYear";

export const InsertNewMeetingModal = () => {
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const setIsOpenInsertNewMeetingModal = useDashboardStore((state) => state.setIsOpenInsertNewMeetingModal);
  // const [isLoading, setIsLoading] = useState(false);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // 確認モーダル(自社担当名、データ所有者変更確認)
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState<string | null>(null);
  // 自社担当検索サイドテーブル開閉
  const [isOpenSearchMemberSideTableBefore, setIsOpenSearchMemberSideTableBefore] = useState(false);
  const [isOpenSearchMemberSideTable, setIsOpenSearchMemberSideTable] = useState(false);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // 事業部別製品編集ドロップダウンメニュー
  const [isOpenDropdownMenuFilterProducts, setIsOpenDropdownMenuFilterProducts] = useState(false);
  type ClickedItemPos = { displayPos: "up" | "center" | "down"; clickedItemWidth: number | null };
  const [clickedItemPosition, setClickedItemPosition] = useState<ClickedItemPos>({
    displayPos: "down",
    clickedItemWidth: null,
  });

  const initialDate = new Date();
  initialDate.setHours(0, 0, 0, 0);
  const year = initialDate.getFullYear(); // 例: 2023
  const month = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
  const meetingYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
  // const [MeetingDate, setMeetingDate] = useState<Date | null>(new Date());
  // const [meetingType, setMeetingType] = useState("訪問"); //面談タイプ
  const [meetingType, setMeetingType] = useState("Visit"); //面談タイプ
  const [webTool, setWebTool] = useState(""); //webツール
  const [plannedDate, setPlannedDate] = useState<Date | null>(initialDate); //面談日付(予定)
  const [plannedStartTime, setPlannedStartTime] = useState<string>(""); //面談開始時刻(予定)
  const [plannedStartTimeHour, setPlannedStartTimeHour] = useState<string>("");
  const [plannedStartTimeMinute, setPlannedStartTimeMinute] = useState<string>("");
  const [plannedPurpose, setPlannedPurpose] = useState(""); //面談目的
  const [plannedDuration, setPlannedDuration] = useState<number | null>(null); //面談予定時間
  const [plannedAppointCheckFlag, setPlannedAppointCheckFlag] = useState(false); //アポ有無フラグ
  const [plannedProduct1, setPlannedProduct1] = useState(""); //実施予定１
  const [plannedProduct1InputName, setPlannedProduct1InputName] = useState(""); //実施予定１の名前
  const [plannedProduct2, setPlannedProduct2] = useState(""); //実施予定２
  const [plannedProduct2InputName, setPlannedProduct2InputName] = useState(""); //実施予定２
  const [plannedComment, setPlannedComment] = useState(""); //事前コメント
  const [resultDate, setResultDate] = useState<Date | null>(null);
  const [resultStartTime, setResultStartTime] = useState<string>("");
  const [resultStartTimeHour, setResultStartTimeHour] = useState<string>("");
  const [resultStartTimeMinute, setResultStartTimeMinute] = useState<string>("");
  const [resultEndTime, setResultEndTime] = useState<string>("");
  const [resultEndTimeHour, setResultEndTimeHour] = useState<string>("");
  const [resultEndTimeMinute, setResultEndTimeMinute] = useState<string>("");
  const [resultDuration, setResultDuration] = useState<number | null>(null);
  const [resultNumberOfMeetingParticipants, setResultNumberOfMeetingParticipants] = useState<number | null>(null);
  const [resultPresentationProduct1, setResultPresentationProduct1] = useState("");
  const [resultPresentationProduct2, setResultPresentationProduct2] = useState("");
  const [resultPresentationProduct3, setResultPresentationProduct3] = useState("");
  const [resultPresentationProduct4, setResultPresentationProduct4] = useState("");
  const [resultPresentationProduct5, setResultPresentationProduct5] = useState("");
  const [resultCategory, setResultCategory] = useState("");
  const [resultSummary, setResultSummary] = useState("");
  const [resultNegotiateDecisionMaker, setResultNegotiateDecisionMaker] = useState("");
  const [resultTopPositionClass, setResultTopPositionClass] = useState("");
  const [preMeetingParticipationRequest, setPreMeetingParticipationRequest] = useState(""); //事前同席依頼
  const [meetingParticipationRequest, setMeetingParticipationRequest] = useState("");
  // //事業部名
  // const [departmentId, setDepartmentId] = useState<Department["id"] | null>(
  //   userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null
  // );
  // // 係
  // const [unitId, setUnitId] = useState<Unit["id"] | null>(
  //   userProfileState?.assigned_unit_id ? userProfileState?.assigned_unit_id : null
  // );
  // // 所属事業所
  // const [officeId, setOfficeId] = useState<Office["id"] | null>(
  //   userProfileState?.assigned_office_id ? userProfileState?.assigned_office_id : null
  // );
  // // 自社担当名
  // const [meetingMemberName, setMeetingMemberName] = useState(
  //   userProfileState?.profile_name ? userProfileState?.profile_name : ""
  // );
  // =========営業担当データ
  type MemberDetail = {
    memberId: string | null;
    memberName: string | null;
    departmentId: string | null;
    sectionId: string | null;
    unitId: string | null;
    officeId: string | null;
  };
  // 作成したユーザーのidと名前が初期値
  const initialMemberObj = {
    memberId: userProfileState?.id ? userProfileState?.id : null,
    memberName: userProfileState?.profile_name ? userProfileState?.profile_name : null,
    departmentId: userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null,
    sectionId: userProfileState?.assigned_section_id ? userProfileState?.assigned_section_id : null,
    unitId: userProfileState?.assigned_unit_id ? userProfileState?.assigned_unit_id : null,
    officeId: userProfileState?.assigned_office_id ? userProfileState?.assigned_office_id : null,
  };
  const [prevMemberObj, setPrevMemberObj] = useState<MemberDetail>(initialMemberObj);
  const [memberObj, setMemberObj] = useState<MemberDetail>(initialMemberObj);
  // =========営業担当データここまで
  const [meetingYearMonth, setMeetingYearMonth] = useState<number | null>(Number(meetingYearMonthInitialValue)); //面談年月度
  // ユーザーの決算月と締め日を取得
  const fiscalEndMonthObjRef = useRef<Date | null>(null);
  const closingDayRef = useRef<number | null>(null);

  const queryClient = useQueryClient();
  const { createMeetingMutation } = useMutateMeeting();

  // ============================= 🌟事業部、係、事業所リスト取得useQuery🌟 =============================
  // const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  // const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  // const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ============================= ✅事業部、係、事業所リスト取得useQuery✅ =============================
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
  // ================================ 🌟商品リスト取得useQuery🌟 ================================
  type FilterCondition = {
    department_id: Department["id"] | null;
    section_id: Section["id"] | null;
    unit_id: Unit["id"] | null;
    office_id: Office["id"] | null;
    //   employee_id_name: Employee_id["id"];
  };
  // useQueryで事業部・課・係・事業所を絞ったフェッチをするかどうか(初回マウント時は自事業部のみで取得)
  const [filterCondition, setFilterCondition] = useState<FilterCondition>({
    department_id: userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null,
    section_id: null,
    unit_id: null,
    office_id: null,
  });
  const { data: productDataArray, isLoading: isLoadingQueryProduct } = useQueryProducts({
    company_id: userProfileState?.company_id ? userProfileState?.company_id : null,
    departmentId: filterCondition.department_id,
    sectionId: filterCondition.section_id,
    unitId: filterCondition.unit_id,
    officeId: filterCondition.office_id,
    isReady: true,
  });
  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅商品リスト取得useQuery✅ ================================
  // ========= 🌟入力予測提案用に取得した商品リストの名前のみの配列を生成(name, inner, outerを/で繋げる)🌟 =========
  // const [suggestedProductIdNameArray, setSuggestedProductIdNameArray] = useState<string[]>([]);
  // const [suggestedProductIdNameArray, setSuggestedProductIdNameArray] = useState<{ [key: string]: string }[]>([]);
  // 紹介予定inputタグからfocus、blurで予測メニューをhidden切り替え
  const resultRefs = useRef<(HTMLDivElement | null)[]>(Array(2).fill(null));
  const inputBoxProducts = useRef<(HTMLInputElement | null)[]>(Array(2).fill(null));
  // const selectBoxProducts = useRef<(HTMLSelectElement | null)[]>(Array(2).fill(null));
  type SuggestedProductObj = { id: string; fullName: string };
  // {id: '376..', fullName: '画像寸法測定機 IM7500/7020 IM2'}を持つ配列
  const [suggestedProductIdNameArray, setSuggestedProductIdNameArray] = useState<SuggestedProductObj[]>([]);
  // 入力値を含む{id: '376..', fullName: '画像寸法測定機 IM7500/7020 IM2'}を持つ配列
  // const [suggestedProductName, setSuggestedProductName] = useState<SuggestedProductObj[]>([]);
  const [suggestedProductName, setSuggestedProductName] = useState<SuggestedProductObj[][]>(Array(2).fill([]));
  useEffect(() => {
    // 最初にオブジェクトマップを作成
    // const productNameToIdMap = productDataArray.reduce((map, item) => {
    //   map[item.name] = item.id;
    //   return map;
    // }, {});
    // 初回マウント時、２回目以降で商品リストの変化に応じて新たに商品名リストに追加、Setで重複は排除

    if (productDataArray && productDataArray.length > 0) {
      const newProductArray = productDataArray.map((product) => ({
        id: product.id,
        fullName:
          (product.inside_short_name ? product.inside_short_name + " " : "") +
          product.product_name +
          (product.outside_short_name ? " " + product.outside_short_name : ""),
      }));

      // 同じオブジェクトの重複を排除(同じidを排除)して配列を統合する方法
      let combinedArray: SuggestedProductObj[] = [];
      if (suggestedProductIdNameArray.length > 0) {
        combinedArray = [...suggestedProductIdNameArray, ...newProductArray];
      } else if (!!process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID) {
        // IM他の選択肢
        const otherOption = { id: process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID, fullName: "他" };
        combinedArray = [...suggestedProductIdNameArray, ...newProductArray, otherOption];
        // combinedArray = [...suggestedProductIdNameArray, ...newProductArray];
      }
      const uniqueArray = combinedArray.reduce((acc: SuggestedProductObj[], current: SuggestedProductObj) => {
        const x = acc.find((obj) => obj.id === current.id);
        // idが一致しているなら重複しているためスプレッドで統合しない
        if (!x) {
          return [...acc, current];
        } else {
          return acc;
        }
      }, []);

      setSuggestedProductIdNameArray(uniqueArray);

      // 文字列などのプリミティブ値で重複排除で配列を統合する方法
      // setSuggestedProductIdNameArray((prevProductNames) => {
      //   return [...new Set([...prevProductNames, ...newProductNames])];
      // });
    }
  }, [productDataArray]);

  // 紹介予定商品の入力値を商品リストから生成した予測変換リストから絞り込んで提案する
  const handleSuggestedProduct = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    let filteredResult = [];

    // 入力されていない場合
    if (!e.currentTarget.value.length) {
      console.log("🌟入力されていない e.currentTarget.value", e.currentTarget.value);
      const newSuggestions = [...suggestedProductName];
      newSuggestions[index] = [];
      return setSuggestedProductName(newSuggestions);
      // return setSuggestedProductName([]);
    }
    // 入力値が存在する場合は、入力値に一致するavailableKeywordsをフィルター
    if (e.currentTarget.value.length) {
      filteredResult = suggestedProductIdNameArray.filter((obj) => {
        return obj.fullName.toLowerCase().includes(e.currentTarget.value.toLowerCase());
      });
      console.log("🌟filteredResult", filteredResult, "🌟入力あり", e.currentTarget.value);
      const newSuggestions = [...suggestedProductName];
      newSuggestions[index] = filteredResult;
      setSuggestedProductName(newSuggestions);
      // setSuggestedProductName(filteredResult);
    }
  };
  const handleFocusSuggestedProduct = (currentInputState: string | null, index: number) => {
    if (!currentInputState) return;
    let filteredResult = [];

    // 入力されていない場合
    if (!currentInputState.length) {
      console.log("🌟入力されていない currentInputState", currentInputState);
      const newSuggestions = [...suggestedProductName];
      newSuggestions[index] = [];
      return setSuggestedProductName(newSuggestions);
      // return setSuggestedProductName([]);
    }
    // 入力値が存在する場合は、入力値に一致するavailableKeywordsをフィルター
    if (currentInputState.length) {
      filteredResult = suggestedProductIdNameArray.filter((obj) => {
        return obj.fullName.toLowerCase().includes(currentInputState.toLowerCase());
      });
      console.log("🌟filteredResult", filteredResult, "🌟入力あり", currentInputState);
      const newSuggestions = [...suggestedProductName];
      newSuggestions[index] = filteredResult;
      setSuggestedProductName(newSuggestions);
      // setSuggestedProductName(filteredResult);
    }
  };

  console.log("🌠🌠🌠🌠🌠🌠suggestedProductIdNameArray: ", suggestedProductIdNameArray);
  console.log(
    "🌠suggestedProductName[0]: ",
    suggestedProductName[0],
    "🌠plannedProduct1: ",
    plannedProduct1,
    "🌠plannedProduct1InputName: ",
    plannedProduct1InputName
    // "🌠isFocusInputProducts",
    // isFocusInputProducts
  );
  console.log(
    "🌠suggestedProductName[1]: ",
    suggestedProductName[1],
    "🌠plannedProduct2: ",
    plannedProduct2,
    "🌠plannedProduct2InputName: ",
    plannedProduct2InputName
    // "🌠isFocusInputProducts",
    // isFocusInputProducts
  );
  // ========= ✅入力予測提案用に取得した商品リストの名前のみの配列を生成(name, inner, outerを/で繋げる)✅ =========

  //   useEffect(() => {
  //     if (!userProfileState) return;
  //     setMeetingMemberName(userProfileState.profile_name ? userProfileState.profile_name : "");
  //     setMeetingBusinessOffice(userProfileState.office ? userProfileState.office : "");
  //     setMeetingDepartment(userProfileState.department ? userProfileState.department : "");
  //   }, []);

  // 予定面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    // const formattedTime = `${plannedStartTimeHour}:${plannedStartTimeMinute}`;
    // setPlannedStartTime(formattedTime);
    if (plannedStartTimeHour && plannedStartTimeMinute) {
      const formattedTime = `${plannedStartTimeHour}:${plannedStartTimeMinute}`;
      setPlannedStartTime(formattedTime);
    } else {
      setPlannedStartTime(""); // or setResultStartTime('');
    }
  }, [plannedStartTimeHour, plannedStartTimeMinute]);
  // 結果面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    // const formattedTime = `${resultStartTimeHour}:${resultStartTimeMinute}`;
    // setResultStartTime(formattedTime);
    if (resultStartTimeHour && resultStartTimeMinute) {
      const formattedTime = `${resultStartTimeHour}:${resultStartTimeMinute}`;
      setResultStartTime(formattedTime);
    } else {
      setResultStartTime(""); // or setResultStartTime('');
    }
  }, [resultStartTimeHour, resultStartTimeMinute]);
  // 結果面談終了時間、時間、分、結合用useEffect
  useEffect(() => {
    // const formattedTime = `${resultEndTimeHour}:${resultEndTimeMinute}`;
    // setResultEndTime(formattedTime);
    if (resultEndTimeHour && resultEndTimeMinute) {
      const formattedTime = `${resultEndTimeHour}:${resultEndTimeMinute}`;
      setResultEndTime(formattedTime);
    } else {
      setResultEndTime(""); // or setResultStartTime('');
    }
  }, [resultEndTimeHour, resultEndTimeMinute]);

  // 🌟ユーザーの決算月の締め日を初回マウント時に取得
  useEffect(() => {
    // ユーザーの決算月から締め日を取得、決算つきが未設定の場合は現在の年と3月31日を設定
    const fiscalEndMonth = userProfileState?.customer_fiscal_end_month
      ? new Date(userProfileState.customer_fiscal_end_month)
      : new Date(new Date().getFullYear(), 2, 31); // 決算日が未設定なら3月31日に自動設定
    const closingDay = fiscalEndMonth.getDate(); //ユーザーの締め日
    fiscalEndMonthObjRef.current = fiscalEndMonth; //refに格納
    closingDayRef.current = closingDay; //refに格納
  }, []);

  // ---------------------------- 🌟面談年月度・面談四半期🌟 ----------------------------
  // 🌟面談日を更新したら面談年月度をユーザーの締め日に応じて更新するuseEffect
  // ユーザーの財務サイクルに合わせて面談年月度を自動的に取得する関数(決算月の締め日の翌日を新たな月度の開始日とする)
  useEffect(() => {
    if (!plannedDate || !closingDayRef.current) {
      setMeetingYearMonth(null);
      return;
    }
    // // 面談予定日の年と日を取得
    // let year = plannedDate.getFullYear(); // 例: 2023
    // let month = plannedDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整

    // // 面談日が締め日の翌日以降の場合、次の月度とみなす
    // if (plannedDate.getDate() > closingDayRef.current) {
    //   month += 1;
    //   if (month > 12) {
    //     month = 1;
    //     year += 1;
    //   }
    // }
    // // 年月度を6桁の数値で表現
    // const fiscalYearMonth = year * 100 + month;
    const fiscalYearMonth = calculateDateToYearMonth(plannedDate, closingDayRef.current);
    console.log("fiscalYearMonth", fiscalYearMonth);
    setMeetingYearMonth(fiscalYearMonth);
    // const meetingYearMonthUpdatedValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
    // setMeetingYearMonth(Number(meetingYearMonthUpdatedValue));
  }, [plannedDate]);
  // ---------------------------- 🌟面談年月度・面談四半期🌟 ここまで ----------------------------

  // 🌟キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenInsertNewMeetingModal(false);
  };
  // ✅

  // 🌟活動画面から面談を作成 活動画面で選択したRowデータを使用する
  const handleSaveAndClose = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!MeetingType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataActivity?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataActivity?.contact_id) return alert("担当者情報が存在しません");
    if (plannedPurpose === "") return alert("面談目的を選択してください");
    if (plannedStartTimeHour === "") return alert("面談開始 時間を選択してください");
    if (plannedStartTimeMinute === "") return alert("面談開始 分を選択してください");
    if (!meetingYearMonth) return alert("面談年月度を入力してください");
    // if (meetingMemberName === "") return alert("自社担当を入力してください");
    if (memberObj.memberName === "") return alert("自社担当を入力してください");

    // 紹介予定商品メイン、サブの選択されているidが現在現在入力されてるnameのidと一致しているかを確認
    const currentId1 = suggestedProductIdNameArray.find((obj) => obj.fullName === plannedProduct1InputName)?.id;
    if (!currentId1) return alert("「紹介予定商品メイン」の商品が有効ではありません。正しい商品を選択してください。");
    const checkResult1 = currentId1 === plannedProduct1;
    if (!checkResult1) return alert("「紹介予定商品メイン」の商品が有効ではありません。正しい商品を選択してください。");
    // 商品サブは任意でOK 入力されてる場合はチェック
    if (plannedProduct2InputName) {
      const currentId2 = suggestedProductIdNameArray.find((obj) => obj.fullName === plannedProduct2InputName)?.id;
      if (!currentId2) return alert("「紹介予定商品サブ」の商品が有効ではありません。正しい商品を選択してください。");
      const checkResult2 = currentId2 === plannedProduct2;
      if (!checkResult2) return alert("「紹介予定商品サブ」の商品が有効ではありません。正しい商品を選択してください。");
    }

    // 作成したユーザーと自社担当の入力値が異なる場合は「

    // return alert("成功");

    setLoadingGlobalState(true);

    const departmentName =
      departmentDataArray &&
      memberObj.departmentId &&
      departmentDataArray.find((obj) => obj.id === memberObj.departmentId)?.department_name;
    const officeName =
      officeDataArray &&
      memberObj.officeId &&
      officeDataArray.find((obj) => obj.id === memberObj.officeId)?.office_name;

    // ------------------ 年月度から年度・半期・四半期を算出 ------------------
    if (plannedDate === null) return alert("面談日付(予定)が未入力です。");
    if (fiscalEndMonthObjRef.current === null) return alert("決算日データが見つかりませんでした。");

    // // 現在の会計年度
    // const currentFiscalYear = calculateCurrentFiscalYear({
    //   fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
    //   fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? null,
    //   selectedYear:
    // });
    // 現在の年度を取得
    const selectedFiscalYear = getFiscalYear(
      plannedDate,
      fiscalEndMonthObjRef.current.getMonth() + 1,
      fiscalEndMonthObjRef.current.getDate(),
      userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis"
    );
    // 期首を取得
    const fiscalYearStartDate = calculateFiscalYearStart({
      fiscalYearEnd: userProfileState.customer_fiscal_end_month,
      fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis",
      selectedYear: selectedFiscalYear,
    });
    if (!fiscalYearStartDate) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM01");
    }
    // 期末を取得
    const fiscalYearEndDate =
      calculateCurrentFiscalYearEndDate({
        fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
        selectedYear: selectedFiscalYear,
      }) ?? new Date(new Date().getFullYear(), 2, 31, 23, 59, 59, 999);
    // 🔸現在の会計年度の開始年月度 期首の年月度を6桁の数値で取得 202404
    const newStartYearMonth = calculateDateToYearMonth(fiscalYearStartDate, fiscalYearEndDate.getDate());
    // 🔸年度初めから12ヶ月分の年月度の配列
    const fiscalMonths = calculateFiscalYearMonths(newStartYearMonth);
    // 上期と下期どちらを選択中か更新
    const firstHalfDetailSet = new Set([
      String(fiscalMonths.month_01).substring(4),
      String(fiscalMonths.month_02).substring(4),
      String(fiscalMonths.month_03).substring(4),
      String(fiscalMonths.month_04).substring(4),
      String(fiscalMonths.month_05).substring(4),
      String(fiscalMonths.month_06).substring(4),
    ]);
    const _meetingMonth = String(meetingYearMonth).substring(4);
    const halfDetailValue = firstHalfDetailSet.has(_meetingMonth) ? 1 : 2;
    const meetingHalfYear = selectedFiscalYear * 10 + halfDetailValue;
    let meetingQuarter = 0;
    // 上期ルート
    if (halfDetailValue === 1) {
      // Q1とQ2どちらを選択中か更新
      const firstQuarterSet = new Set([
        String(fiscalMonths.month_01).substring(4),
        String(fiscalMonths.month_02).substring(4),
        String(fiscalMonths.month_03).substring(4),
      ]);
      const quarterValue = firstQuarterSet.has(_meetingMonth) ? 1 : 2;
      meetingQuarter = selectedFiscalYear * 10 + quarterValue;
    }
    // 下期ルート
    else {
      // Q3とQ4どちらを選択中か更新
      const thirdQuarterSet = new Set([
        String(fiscalMonths.month_07).substring(4),
        String(fiscalMonths.month_08).substring(4),
        String(fiscalMonths.month_09).substring(4),
      ]);
      const quarterValue = thirdQuarterSet.has(_meetingMonth) ? 3 : 4;
      meetingQuarter = selectedFiscalYear * 10 + quarterValue;
    }

    if (meetingQuarter === 0) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM02");
    }
    if (String(meetingHalfYear).length !== 5 || String(meetingQuarter).length !== 5) {
      setLoadingGlobalState(false);
      if (String(meetingHalfYear).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM03");
      if (String(meetingQuarter).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM04");
    }
    // ------------------ 年月度から年度・半期・四半期を算出 ここまで ------------------

    // 新規作成するデータをオブジェクトにまとめる
    const newMeeting = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      // 営業担当データ
      created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
      created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
      created_by_section_of_user: memberObj.sectionId ? memberObj.sectionId : null,
      created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
      created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
      // 営業担当データここまで
      // created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: departmentId ? departmentId : null,
      // created_by_unit_of_user: unitId ? unitId : null,
      // created_by_office_of_user: officeId ? officeId : null,
      client_contact_id: selectedRowDataActivity.contact_id,
      client_company_id: selectedRowDataActivity.company_id,
      meeting_type: meetingType ? meetingType : null,
      web_tool: webTool ? webTool : null,
      planned_date: plannedDate ? plannedDate.toISOString() : null,
      // planned_start_time: plannedStartTime === ":" ? null : plannedStartTime,
      planned_start_time: plannedStartTime === "" ? null : plannedStartTime,
      planned_purpose: plannedPurpose ? plannedPurpose : null,
      planned_duration: plannedDuration ? plannedDuration : null,
      planned_appoint_check_flag: plannedAppointCheckFlag,
      planned_product1: plannedProduct1 ? plannedProduct1 : null,
      planned_product2: plannedProduct2 ? plannedProduct2 : null,
      planned_comment: plannedComment ? plannedComment : null,
      result_date: resultDate ? resultDate.toISOString() : null,
      result_start_time: resultStartTime === "" ? null : resultStartTime,
      result_end_time: resultEndTime === "" ? null : resultEndTime,
      // result_start_time: resultStartTime === ":" ? null : resultStartTime,
      // result_end_time: resultEndTime === ":" ? null : resultEndTime,
      result_duration: resultDuration ? resultDuration : null,
      result_number_of_meeting_participants: resultNumberOfMeetingParticipants
        ? resultNumberOfMeetingParticipants
        : null,
      result_presentation_product1: resultPresentationProduct1 ? resultPresentationProduct1 : null,
      result_presentation_product2: resultPresentationProduct2 ? resultPresentationProduct2 : null,
      result_presentation_product3: resultPresentationProduct3 ? resultPresentationProduct3 : null,
      result_presentation_product4: resultPresentationProduct4 ? resultPresentationProduct4 : null,
      result_presentation_product5: resultPresentationProduct5 ? resultPresentationProduct5 : null,
      result_category: resultCategory ? resultCategory : null,
      result_summary: resultSummary ? resultSummary : null,
      result_negotiate_decision_maker: resultNegotiateDecisionMaker ? resultNegotiateDecisionMaker : null,
      result_top_position_class: resultTopPositionClass ? parseInt(resultTopPositionClass, 10) : null,
      pre_meeting_participation_request: preMeetingParticipationRequest ? preMeetingParticipationRequest : null,
      meeting_participation_request: meetingParticipationRequest ? meetingParticipationRequest : null,
      // meeting_business_office: meetingBusinessOffice ? meetingBusinessOffice : null,
      // meeting_department: meetingDepartment ? meetingDepartment : null,
      meeting_department: departmentName ? departmentName : null,
      meeting_business_office: officeName ? officeName : null,
      // meeting_member_name: meetingMemberName ? meetingMemberName : null,
      meeting_member_name: memberObj.memberName ? memberObj.memberName : null,
      // 年度~年月度
      meeting_year_month: meetingYearMonth ? meetingYearMonth : null,
      meeting_quarter: meetingQuarter ? meetingQuarter : null,
      meeting_half_year: meetingHalfYear ? meetingHalfYear : null,
      meeting_fiscal_year: selectedFiscalYear ? selectedFiscalYear : null,
    };

    console.log("面談予定 新規作成 newMeeting", newMeeting);
    console.log("面談予定 新規作成 newMeeting.planned_start_time", newMeeting.planned_start_time);
    console.log(
      "面談予定 新規作成 newMeeting.planned_start_time 一致するか",
      newMeeting.planned_start_time === "08:30"
    );

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createMeetingMutation.mutate(newMeeting);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewMeetingModal(false);
  };

  // 🌟訪問・面談画面から面談を作成 訪問・面談画面で選択したRowデータを使用する
  const handleSaveAndCloseFromMeeting = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!MeetingType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataMeeting?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataMeeting?.contact_id) return alert("担当者情報が存在しません");
    if (plannedPurpose === "") return alert("面談目的を選択してください");
    if (plannedStartTimeHour === "") return alert("面談開始 時間を選択してください");
    if (plannedStartTimeMinute === "") return alert("面談開始 分を選択してください");
    if (!meetingYearMonth) return alert("面談年月度を入力してください");
    // if (meetingMemberName === "") return alert("自社担当を入力してください");
    if (memberObj.memberName === "") return alert("自社担当を入力してください");

    // 紹介予定商品メイン、サブの選択されているidが現在現在入力されてるnameのidと一致しているかを確認
    const currentId1 = suggestedProductIdNameArray.find((obj) => obj.fullName === plannedProduct1InputName)?.id;
    if (!currentId1) return alert("「紹介予定商品メイン」の商品が有効ではありません。正しい商品を選択してください。");
    const checkResult1 = currentId1 === plannedProduct1;
    if (!checkResult1) return alert("「紹介予定商品メイン」の商品が有効ではありません。正しい商品を選択してください。");
    // 商品サブは任意でOK 入力されてる場合はチェック
    if (plannedProduct2InputName) {
      const currentId2 = suggestedProductIdNameArray.find((obj) => obj.fullName === plannedProduct2InputName)?.id;
      if (!currentId2) return alert("「紹介予定商品サブ」の商品が有効ではありません。正しい商品を選択してください。");
      const checkResult2 = currentId2 === plannedProduct2;
      if (!checkResult2) return alert("「紹介予定商品サブ」の商品が有効ではありません。正しい商品を選択してください。");
    }

    // return alert("成功");

    setLoadingGlobalState(true);

    const departmentName =
      departmentDataArray &&
      memberObj.departmentId &&
      departmentDataArray.find((obj) => obj.id === memberObj.departmentId)?.department_name;
    const officeName =
      officeDataArray &&
      memberObj.officeId &&
      officeDataArray.find((obj) => obj.id === memberObj.officeId)?.office_name;

    // ------------------ 年月度から年度・半期・四半期を算出 ------------------
    if (plannedDate === null) return alert("面談日付(予定)が未入力です。");
    if (fiscalEndMonthObjRef.current === null) return alert("決算日データが見つかりませんでした。");

    // // 現在の会計年度
    // const currentFiscalYear = calculateCurrentFiscalYear({
    //   fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
    //   fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? null,
    //   selectedYear:
    // });
    // 現在の年度を取得
    const selectedFiscalYear = getFiscalYear(
      plannedDate,
      fiscalEndMonthObjRef.current.getMonth() + 1,
      fiscalEndMonthObjRef.current.getDate(),
      userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis"
    );
    // 期首を取得
    const fiscalYearStartDate = calculateFiscalYearStart({
      fiscalYearEnd: userProfileState.customer_fiscal_end_month,
      fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis",
      selectedYear: selectedFiscalYear,
    });
    if (!fiscalYearStartDate) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM01");
    }
    // 期末を取得
    const fiscalYearEndDate =
      calculateCurrentFiscalYearEndDate({
        fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
        selectedYear: selectedFiscalYear,
      }) ?? new Date(new Date().getFullYear(), 2, 31);
    // 🔸現在の会計年度の開始年月度 期首の年月度を6桁の数値で取得 202404
    const newStartYearMonth = calculateDateToYearMonth(fiscalYearStartDate, fiscalYearEndDate.getDate());
    // 🔸年度初めから12ヶ月分の年月度の配列
    const fiscalMonths = calculateFiscalYearMonths(newStartYearMonth);
    // 上期と下期どちらを選択中か更新
    const firstHalfDetailSet = new Set([
      String(fiscalMonths.month_01).substring(4),
      String(fiscalMonths.month_02).substring(4),
      String(fiscalMonths.month_03).substring(4),
      String(fiscalMonths.month_04).substring(4),
      String(fiscalMonths.month_05).substring(4),
      String(fiscalMonths.month_06).substring(4),
    ]);
    const _meetingMonth = String(meetingYearMonth).substring(4);
    const halfDetailValue = firstHalfDetailSet.has(_meetingMonth) ? 1 : 2;
    const meetingHalfYear = selectedFiscalYear * 10 + halfDetailValue;
    let meetingQuarter = 0;
    // 上期ルート
    if (halfDetailValue === 1) {
      // Q1とQ2どちらを選択中か更新
      const firstQuarterSet = new Set([
        String(fiscalMonths.month_01).substring(4),
        String(fiscalMonths.month_02).substring(4),
        String(fiscalMonths.month_03).substring(4),
      ]);
      const quarterValue = firstQuarterSet.has(_meetingMonth) ? 1 : 2;
      meetingQuarter = selectedFiscalYear * 10 + quarterValue;
    }
    // 下期ルート
    else {
      // Q3とQ4どちらを選択中か更新
      const thirdQuarterSet = new Set([
        String(fiscalMonths.month_07).substring(4),
        String(fiscalMonths.month_08).substring(4),
        String(fiscalMonths.month_09).substring(4),
      ]);
      const quarterValue = thirdQuarterSet.has(_meetingMonth) ? 3 : 4;
      meetingQuarter = selectedFiscalYear * 10 + quarterValue;
    }

    if (meetingQuarter === 0) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM02");
    }
    if (String(meetingHalfYear).length !== 5 || String(meetingQuarter).length !== 5) {
      setLoadingGlobalState(false);
      if (String(meetingHalfYear).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM03");
      if (String(meetingQuarter).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM04");
    }
    // ------------------ 年月度から年度・半期・四半期を算出 ここまで ------------------

    // 新規作成するデータをオブジェクトにまとめる
    const newMeeting = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      // 営業担当データ
      created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
      created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
      created_by_section_of_user: memberObj.sectionId ? memberObj.sectionId : null,
      created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
      created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
      // 営業担当データここまで
      // created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: departmentId ? departmentId : null,
      // created_by_unit_of_user: unitId ? unitId : null,
      // created_by_office_of_user: officeId ? officeId : null,
      client_contact_id: selectedRowDataMeeting.contact_id,
      client_company_id: selectedRowDataMeeting.company_id,
      meeting_type: meetingType ? meetingType : null,
      web_tool: webTool ? webTool : null,
      planned_date: plannedDate ? plannedDate.toISOString() : null,
      // planned_start_time: plannedStartTime === ":" ? null : plannedStartTime,
      planned_start_time: plannedStartTime === "" ? null : plannedStartTime,
      planned_purpose: plannedPurpose ? plannedPurpose : null,
      planned_duration: plannedDuration ? plannedDuration : null,
      planned_appoint_check_flag: plannedAppointCheckFlag,
      planned_product1: plannedProduct1 ? plannedProduct1 : null,
      planned_product2: plannedProduct2 ? plannedProduct2 : null,
      planned_comment: plannedComment ? plannedComment : null,
      result_date: resultDate ? resultDate.toISOString() : null,
      result_start_time: resultStartTime === "" ? null : resultStartTime,
      result_end_time: resultEndTime === "" ? null : resultEndTime,
      // result_start_time: resultStartTime === ":" ? null : resultStartTime,
      // result_end_time: resultEndTime === ":" ? null : resultEndTime,
      result_duration: resultDuration ? resultDuration : null,
      result_number_of_meeting_participants: resultNumberOfMeetingParticipants
        ? resultNumberOfMeetingParticipants
        : null,
      result_presentation_product1: resultPresentationProduct1 ? resultPresentationProduct1 : null,
      result_presentation_product2: resultPresentationProduct2 ? resultPresentationProduct2 : null,
      result_presentation_product3: resultPresentationProduct3 ? resultPresentationProduct3 : null,
      result_presentation_product4: resultPresentationProduct4 ? resultPresentationProduct4 : null,
      result_presentation_product5: resultPresentationProduct5 ? resultPresentationProduct5 : null,
      result_category: resultCategory ? resultCategory : null,
      result_summary: resultSummary ? resultSummary : null,
      result_negotiate_decision_maker: resultNegotiateDecisionMaker ? resultNegotiateDecisionMaker : null,
      result_top_position_class: resultTopPositionClass ? parseInt(resultTopPositionClass, 10) : null,
      pre_meeting_participation_request: preMeetingParticipationRequest ? preMeetingParticipationRequest : null,
      meeting_participation_request: meetingParticipationRequest ? meetingParticipationRequest : null,
      // meeting_business_office: meetingBusinessOffice ? meetingBusinessOffice : null,
      // meeting_department: meetingDepartment ? meetingDepartment : null,
      meeting_department: departmentName ? departmentName : null,
      meeting_business_office: officeName ? officeName : null,
      // meeting_member_name: meetingMemberName ? meetingMemberName : null,
      meeting_member_name: memberObj.memberName ? memberObj.memberName : null,
      // 年度~年月度
      meeting_year_month: meetingYearMonth ? meetingYearMonth : null,
      meeting_quarter: meetingQuarter ? meetingQuarter : null,
      meeting_half_year: meetingHalfYear ? meetingHalfYear : null,
      meeting_fiscal_year: selectedFiscalYear ? selectedFiscalYear : null,
    };

    console.log("面談予定 新規作成 newMeeting", newMeeting);
    console.log("面談予定 新規作成 newMeeting.planned_start_time", newMeeting.planned_start_time);
    console.log(
      "面談予定 新規作成 newMeeting.planned_start_time 一致するか",
      newMeeting.planned_start_time === "08:30"
    );

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createMeetingMutation.mutate(newMeeting);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewMeetingModal(false);
  };

  // 🌟担当者画面から面談を作成 担当者画面で選択したRowデータを使用する
  const handleSaveAndCloseFromContacts = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!MeetingType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataContact?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataContact?.contact_id) return alert("担当者情報が存在しません");
    if (plannedPurpose === "") return alert("面談目的を選択してください");
    if (plannedStartTimeHour === "") return alert("面談開始 時間を選択してください");
    if (plannedStartTimeMinute === "") return alert("面談開始 分を選択してください");
    if (!meetingYearMonth) return alert("面談年月度を入力してください");
    // if (meetingMemberName === "") return alert("自社担当を入力してください");
    if (memberObj.memberName === "") return alert("自社担当を入力してください");

    // 紹介予定商品メイン、サブの選択されているidが現在現在入力されてるnameのidと一致しているかを確認
    const currentId1 = suggestedProductIdNameArray.find((obj) => obj.fullName === plannedProduct1InputName)?.id;
    if (!currentId1) return alert("「紹介予定商品メイン」の商品が有効ではありません。正しい商品を選択してください。");
    const checkResult1 = currentId1 === plannedProduct1;
    if (!checkResult1) return alert("「紹介予定商品メイン」の商品が有効ではありません。正しい商品を選択してください。");
    // 商品サブは任意でOK 入力されてる場合はチェック
    if (plannedProduct2InputName) {
      const currentId2 = suggestedProductIdNameArray.find((obj) => obj.fullName === plannedProduct2InputName)?.id;
      if (!currentId2) return alert("「紹介予定商品サブ」の商品が有効ではありません。正しい商品を選択してください。");
      const checkResult2 = currentId2 === plannedProduct2;
      if (!checkResult2) return alert("「紹介予定商品サブ」の商品が有効ではありません。正しい商品を選択してください。");
    }

    // return alert("成功");

    setLoadingGlobalState(true);

    const departmentName =
      departmentDataArray &&
      memberObj.departmentId &&
      departmentDataArray.find((obj) => obj.id === memberObj.departmentId)?.department_name;
    const officeName =
      officeDataArray &&
      memberObj.officeId &&
      officeDataArray.find((obj) => obj.id === memberObj.officeId)?.office_name;

    // ------------------ 年月度から年度・半期・四半期を算出 ------------------
    if (plannedDate === null) return alert("面談日付(予定)が未入力です。");
    if (fiscalEndMonthObjRef.current === null) return alert("決算日データが見つかりませんでした。");

    // // 現在の会計年度
    // const currentFiscalYear = calculateCurrentFiscalYear({
    //   fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
    //   fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? null,
    //   selectedYear:
    // });
    // 現在の年度を取得
    const selectedFiscalYear = getFiscalYear(
      plannedDate,
      fiscalEndMonthObjRef.current.getMonth() + 1,
      fiscalEndMonthObjRef.current.getDate(),
      userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis"
    );
    // 期首を取得
    const fiscalYearStartDate = calculateFiscalYearStart({
      fiscalYearEnd: userProfileState.customer_fiscal_end_month,
      fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis",
      selectedYear: selectedFiscalYear,
    });
    if (!fiscalYearStartDate) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM01");
    }
    // 期末を取得
    const fiscalYearEndDate =
      calculateCurrentFiscalYearEndDate({
        fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
        selectedYear: selectedFiscalYear,
      }) ?? new Date(new Date().getFullYear(), 2, 31);
    // 🔸現在の会計年度の開始年月度 期首の年月度を6桁の数値で取得 202404
    const newStartYearMonth = calculateDateToYearMonth(fiscalYearStartDate, fiscalYearEndDate.getDate());
    // 🔸年度初めから12ヶ月分の年月度の配列
    const fiscalMonths = calculateFiscalYearMonths(newStartYearMonth);
    // 上期と下期どちらを選択中か更新
    const firstHalfDetailSet = new Set([
      String(fiscalMonths.month_01).substring(4),
      String(fiscalMonths.month_02).substring(4),
      String(fiscalMonths.month_03).substring(4),
      String(fiscalMonths.month_04).substring(4),
      String(fiscalMonths.month_05).substring(4),
      String(fiscalMonths.month_06).substring(4),
    ]);
    const _meetingMonth = String(meetingYearMonth).substring(4);
    const halfDetailValue = firstHalfDetailSet.has(_meetingMonth) ? 1 : 2;
    const meetingHalfYear = selectedFiscalYear * 10 + halfDetailValue;
    let meetingQuarter = 0;
    // 上期ルート
    if (halfDetailValue === 1) {
      // Q1とQ2どちらを選択中か更新
      const firstQuarterSet = new Set([
        String(fiscalMonths.month_01).substring(4),
        String(fiscalMonths.month_02).substring(4),
        String(fiscalMonths.month_03).substring(4),
      ]);
      const quarterValue = firstQuarterSet.has(_meetingMonth) ? 1 : 2;
      meetingQuarter = selectedFiscalYear * 10 + quarterValue;
    }
    // 下期ルート
    else {
      // Q3とQ4どちらを選択中か更新
      const thirdQuarterSet = new Set([
        String(fiscalMonths.month_07).substring(4),
        String(fiscalMonths.month_08).substring(4),
        String(fiscalMonths.month_09).substring(4),
      ]);
      const quarterValue = thirdQuarterSet.has(_meetingMonth) ? 3 : 4;
      meetingQuarter = selectedFiscalYear * 10 + quarterValue;
    }

    if (meetingQuarter === 0) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM02");
    }
    if (String(meetingHalfYear).length !== 5 || String(meetingQuarter).length !== 5) {
      setLoadingGlobalState(false);
      if (String(meetingHalfYear).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM03");
      if (String(meetingQuarter).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM04");
    }
    // ------------------ 年月度から年度・半期・四半期を算出 ここまで ------------------

    // 新規作成するデータをオブジェクトにまとめる
    const newMeeting = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      // 営業担当データ
      created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
      created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
      created_by_section_of_user: memberObj.sectionId ? memberObj.sectionId : null,
      created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
      created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
      // 営業担当データここまで
      // created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: departmentId ? departmentId : null,
      // created_by_unit_of_user: unitId ? unitId : null,
      // created_by_office_of_user: officeId ? officeId : null,
      client_contact_id: selectedRowDataContact.contact_id,
      client_company_id: selectedRowDataContact.company_id,
      meeting_type: meetingType ? meetingType : null,
      web_tool: webTool ? webTool : null,
      planned_date: plannedDate ? plannedDate.toISOString() : null,
      // planned_start_time: plannedStartTime === ":" ? null : plannedStartTime,
      planned_start_time: plannedStartTime === "" ? null : plannedStartTime,
      planned_purpose: plannedPurpose ? plannedPurpose : null,
      planned_duration: plannedDuration ? plannedDuration : null,
      planned_appoint_check_flag: plannedAppointCheckFlag,
      planned_product1: plannedProduct1 ? plannedProduct1 : null,
      planned_product2: plannedProduct2 ? plannedProduct2 : null,
      planned_comment: plannedComment ? plannedComment : null,
      result_date: resultDate ? resultDate.toISOString() : null,
      result_start_time: resultStartTime === "" ? null : resultStartTime,
      result_end_time: resultEndTime === "" ? null : resultEndTime,
      // result_start_time: resultStartTime === ":" ? null : resultStartTime,
      // result_end_time: resultEndTime === ":" ? null : resultEndTime,
      result_duration: resultDuration ? resultDuration : null,
      result_number_of_meeting_participants: resultNumberOfMeetingParticipants
        ? resultNumberOfMeetingParticipants
        : null,
      result_presentation_product1: resultPresentationProduct1 ? resultPresentationProduct1 : null,
      result_presentation_product2: resultPresentationProduct2 ? resultPresentationProduct2 : null,
      result_presentation_product3: resultPresentationProduct3 ? resultPresentationProduct3 : null,
      result_presentation_product4: resultPresentationProduct4 ? resultPresentationProduct4 : null,
      result_presentation_product5: resultPresentationProduct5 ? resultPresentationProduct5 : null,
      result_category: resultCategory ? resultCategory : null,
      result_summary: resultSummary ? resultSummary : null,
      result_negotiate_decision_maker: resultNegotiateDecisionMaker ? resultNegotiateDecisionMaker : null,
      result_top_position_class: resultTopPositionClass ? parseInt(resultTopPositionClass, 10) : null,
      pre_meeting_participation_request: preMeetingParticipationRequest ? preMeetingParticipationRequest : null,
      meeting_participation_request: meetingParticipationRequest ? meetingParticipationRequest : null,
      // meeting_department: meetingDepartment ? meetingDepartment : null,
      // meeting_business_office: meetingBusinessOffice ? meetingBusinessOffice : null,
      meeting_department: departmentName ? departmentName : null,
      meeting_business_office: officeName ? officeName : null,
      // meeting_member_name: meetingMemberName ? meetingMemberName : null,
      meeting_member_name: memberObj.memberName ? memberObj.memberName : null,
      // 年度~年月度
      meeting_year_month: meetingYearMonth ? meetingYearMonth : null,
      meeting_quarter: meetingQuarter ? meetingQuarter : null,
      meeting_half_year: meetingHalfYear ? meetingHalfYear : null,
      meeting_fiscal_year: selectedFiscalYear ? selectedFiscalYear : null,
    };

    console.log("面談予定 新規作成 newMeeting", newMeeting);
    console.log("面談予定 新規作成 newMeeting.planned_start_time", newMeeting.planned_start_time);
    console.log(
      "面談予定 新規作成 newMeeting.planned_start_time 一致するか",
      newMeeting.planned_start_time === "08:30"
    );

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createMeetingMutation.mutate(newMeeting);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewMeetingModal(false);
  };

  // 🌟案件画面から面談を作成 案件画面で選択したRowデータを使用する
  const handleSaveAndCloseFromProperty = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!MeetingType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataProperty?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataProperty?.contact_id) return alert("担当者情報が存在しません");
    if (plannedPurpose === "") return alert("面談目的を選択してください");
    if (plannedStartTimeHour === "") return alert("面談開始 時間を選択してください");
    if (plannedStartTimeMinute === "") return alert("面談開始 分を選択してください");
    if (!meetingYearMonth) return alert("面談年月度を入力してください");
    // if (meetingMemberName === "") return alert("自社担当を入力してください");
    if (memberObj.memberName === "") return alert("自社担当を入力してください");

    // 紹介予定商品メイン、サブの選択されているidが現在現在入力されてるnameのidと一致しているかを確認
    const currentId1 = suggestedProductIdNameArray.find((obj) => obj.fullName === plannedProduct1InputName)?.id;
    if (!currentId1) return alert("「紹介予定商品メイン」の商品が有効ではありません。正しい商品を選択してください。");
    const checkResult1 = currentId1 === plannedProduct1;
    if (!checkResult1) return alert("「紹介予定商品メイン」の商品が有効ではありません。正しい商品を選択してください。");
    // 商品サブは任意でOK 入力されてる場合はチェック
    if (plannedProduct2InputName) {
      const currentId2 = suggestedProductIdNameArray.find((obj) => obj.fullName === plannedProduct2InputName)?.id;
      if (!currentId2) return alert("「紹介予定商品サブ」の商品が有効ではありません。正しい商品を選択してください。");
      const checkResult2 = currentId2 === plannedProduct2;
      if (!checkResult2) return alert("「紹介予定商品サブ」の商品が有効ではありません。正しい商品を選択してください。");
    }

    // return alert("成功");

    setLoadingGlobalState(true);

    const departmentName =
      departmentDataArray &&
      memberObj.departmentId &&
      departmentDataArray.find((obj) => obj.id === memberObj.departmentId)?.department_name;
    const officeName =
      officeDataArray &&
      memberObj.officeId &&
      officeDataArray.find((obj) => obj.id === memberObj.officeId)?.office_name;

    // ------------------ 年月度から年度・半期・四半期を算出 ------------------
    if (plannedDate === null) return alert("面談日付(予定)が未入力です。");
    if (fiscalEndMonthObjRef.current === null) return alert("決算日データが見つかりませんでした。");

    // // 現在の会計年度
    // const currentFiscalYear = calculateCurrentFiscalYear({
    //   fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
    //   fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? null,
    //   selectedYear:
    // });
    // 現在の年度を取得
    const selectedFiscalYear = getFiscalYear(
      plannedDate,
      fiscalEndMonthObjRef.current.getMonth() + 1,
      fiscalEndMonthObjRef.current.getDate(),
      userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis"
    );
    // 期首を取得
    const fiscalYearStartDate = calculateFiscalYearStart({
      fiscalYearEnd: userProfileState.customer_fiscal_end_month,
      fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis",
      selectedYear: selectedFiscalYear,
    });
    if (!fiscalYearStartDate) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM01");
    }
    // 期末を取得
    const fiscalYearEndDate =
      calculateCurrentFiscalYearEndDate({
        fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
        selectedYear: selectedFiscalYear,
      }) ?? new Date(new Date().getFullYear(), 2, 31);
    // 🔸現在の会計年度の開始年月度 期首の年月度を6桁の数値で取得 202404
    const newStartYearMonth = calculateDateToYearMonth(fiscalYearStartDate, fiscalYearEndDate.getDate());
    // 🔸年度初めから12ヶ月分の年月度の配列
    const fiscalMonths = calculateFiscalYearMonths(newStartYearMonth);
    // 上期と下期どちらを選択中か更新
    const firstHalfDetailSet = new Set([
      String(fiscalMonths.month_01).substring(4),
      String(fiscalMonths.month_02).substring(4),
      String(fiscalMonths.month_03).substring(4),
      String(fiscalMonths.month_04).substring(4),
      String(fiscalMonths.month_05).substring(4),
      String(fiscalMonths.month_06).substring(4),
    ]);
    const _meetingMonth = String(meetingYearMonth).substring(4);
    const halfDetailValue = firstHalfDetailSet.has(_meetingMonth) ? 1 : 2;
    const meetingHalfYear = selectedFiscalYear * 10 + halfDetailValue;
    let meetingQuarter = 0;
    // 上期ルート
    if (halfDetailValue === 1) {
      // Q1とQ2どちらを選択中か更新
      const firstQuarterSet = new Set([
        String(fiscalMonths.month_01).substring(4),
        String(fiscalMonths.month_02).substring(4),
        String(fiscalMonths.month_03).substring(4),
      ]);
      const quarterValue = firstQuarterSet.has(_meetingMonth) ? 1 : 2;
      meetingQuarter = selectedFiscalYear * 10 + quarterValue;
    }
    // 下期ルート
    else {
      // Q3とQ4どちらを選択中か更新
      const thirdQuarterSet = new Set([
        String(fiscalMonths.month_07).substring(4),
        String(fiscalMonths.month_08).substring(4),
        String(fiscalMonths.month_09).substring(4),
      ]);
      const quarterValue = thirdQuarterSet.has(_meetingMonth) ? 3 : 4;
      meetingQuarter = selectedFiscalYear * 10 + quarterValue;
    }

    if (meetingQuarter === 0) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM02");
    }
    if (String(meetingHalfYear).length !== 5 || String(meetingQuarter).length !== 5) {
      setLoadingGlobalState(false);
      if (String(meetingHalfYear).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM03");
      if (String(meetingQuarter).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM04");
    }
    // ------------------ 年月度から年度・半期・四半期を算出 ここまで ------------------

    // 新規作成するデータをオブジェクトにまとめる
    const newMeeting = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      // 営業担当データ
      created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
      created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
      created_by_section_of_user: memberObj.sectionId ? memberObj.sectionId : null,
      created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
      created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
      // 営業担当データここまで
      // created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: departmentId ? departmentId : null,
      // created_by_unit_of_user: unitId ? unitId : null,
      // created_by_office_of_user: officeId ? officeId : null,
      client_contact_id: selectedRowDataProperty.contact_id,
      client_company_id: selectedRowDataProperty.company_id,
      meeting_type: meetingType ? meetingType : null,
      web_tool: webTool ? webTool : null,
      planned_date: plannedDate ? plannedDate.toISOString() : null,
      // planned_start_time: plannedStartTime === ":" ? null : plannedStartTime,
      planned_start_time: plannedStartTime === "" ? null : plannedStartTime,
      planned_purpose: plannedPurpose ? plannedPurpose : null,
      planned_duration: plannedDuration ? plannedDuration : null,
      planned_appoint_check_flag: plannedAppointCheckFlag,
      planned_product1: plannedProduct1 ? plannedProduct1 : null,
      planned_product2: plannedProduct2 ? plannedProduct2 : null,
      planned_comment: plannedComment ? plannedComment : null,
      result_date: resultDate ? resultDate.toISOString() : null,
      result_start_time: resultStartTime === "" ? null : resultStartTime,
      result_end_time: resultEndTime === "" ? null : resultEndTime,
      // result_start_time: resultStartTime === ":" ? null : resultStartTime,
      // result_end_time: resultEndTime === ":" ? null : resultEndTime,
      result_duration: resultDuration ? resultDuration : null,
      result_number_of_meeting_participants: resultNumberOfMeetingParticipants
        ? resultNumberOfMeetingParticipants
        : null,
      result_presentation_product1: resultPresentationProduct1 ? resultPresentationProduct1 : null,
      result_presentation_product2: resultPresentationProduct2 ? resultPresentationProduct2 : null,
      result_presentation_product3: resultPresentationProduct3 ? resultPresentationProduct3 : null,
      result_presentation_product4: resultPresentationProduct4 ? resultPresentationProduct4 : null,
      result_presentation_product5: resultPresentationProduct5 ? resultPresentationProduct5 : null,
      result_category: resultCategory ? resultCategory : null,
      result_summary: resultSummary ? resultSummary : null,
      result_negotiate_decision_maker: resultNegotiateDecisionMaker ? resultNegotiateDecisionMaker : null,
      result_top_position_class: resultTopPositionClass ? parseInt(resultTopPositionClass, 10) : null,
      pre_meeting_participation_request: preMeetingParticipationRequest ? preMeetingParticipationRequest : null,
      meeting_participation_request: meetingParticipationRequest ? meetingParticipationRequest : null,
      // meeting_department: meetingDepartment ? meetingDepartment : null,
      // meeting_business_office: meetingBusinessOffice ? meetingBusinessOffice : null,
      meeting_department: departmentName ? departmentName : null,
      meeting_business_office: officeName ? officeName : null,
      // meeting_member_name: meetingMemberName ? meetingMemberName : null,
      meeting_member_name: memberObj.memberName ? memberObj.memberName : null,
      // 年度~年月度
      meeting_year_month: meetingYearMonth ? meetingYearMonth : null,
      meeting_quarter: meetingQuarter ? meetingQuarter : null,
      meeting_half_year: meetingHalfYear ? meetingHalfYear : null,
      meeting_fiscal_year: selectedFiscalYear ? selectedFiscalYear : null,
    };

    console.log("面談予定 新規作成 newMeeting", newMeeting);
    console.log("面談予定 新規作成 newMeeting.planned_start_time", newMeeting.planned_start_time);
    console.log(
      "面談予定 新規作成 newMeeting.planned_start_time 一致するか",
      newMeeting.planned_start_time === "08:30"
    );

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createMeetingMutation.mutate(newMeeting);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewMeetingModal(false);
  };

  // 全角文字を半角に変換する関数
  const toHalfWidth = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal.replace(/[！-～]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
    });
    // .replace(/　/g, " "); // 全角スペースを半角スペースに
  };
  const toHalfWidthAndSpace = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal
      .replace(/[！-～]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
      })
      .replace(/　/g, " "); // 全角スペースを半角スペースに
  };

  // 昭和や平成、令和の元号を西暦に変換する
  // const convertJapaneseEraToWesternYear = (value: string) => {
  //   const eraPatterns = [
  //     { era: "昭和", startYear: 1925 },
  //     { era: "平成", startYear: 1988 },
  //     { era: "令和", startYear: 2018 },
  //   ];

  //   for (let pattern of eraPatterns) {
  //     if (value.includes(pattern.era)) {
  //       const year = parseInt(value.replace(pattern.era, ""), 10);
  //       if (!isNaN(year)) {
  //         return pattern.startYear + year;
  //       }
  //     }
  //   }
  //   return value;
  // };

  type Era = "昭和" | "平成" | "令和";
  const eras = {
    昭和: 1925, // 昭和の開始年 - 1
    平成: 1988, // 平成の開始年 - 1
    令和: 2018, // 令和の開始年 - 1
  };
  // 昭和や平成、令和の元号を西暦に変換する 例："平成4年12月" を "1992年12月" に変換
  function matchEraToYear(value: string): string {
    const pattern = /(?<era>昭和|平成|令和)(?<year>\d+)(?:年)?(?<month>\d+)?/;
    const match = pattern.exec(value);

    if (!match) return value; // 元号の形式でなければ元の文字列をそのまま返す

    const era: Era = match.groups?.era as Era;
    const year = eras[era] + parseInt(match.groups?.year || "0", 10);
    const month = match.groups?.month ? `${match.groups?.month}月` : "";

    return `${year}年${month}`;
  }

  // 全角を半角に変換する関数
  function zenkakuToHankaku(str: string) {
    const zen = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
    const han = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    for (let i = 0; i < zen.length; i++) {
      const regex = new RegExp(zen[i], "g");
      str = str.replace(regex, han[i]);
    }

    return str;
  }

  // 資本金 100万円の場合は100、18億9,190万円は189190、12,500,000円は1250、のように変換する方法
  function convertToNumber(inputString: string) {
    // 全角数字を半角に変換
    inputString = zenkakuToHankaku(inputString);

    // 「億」「万」「円」がすべて含まれていなければ変換をスキップ
    if (
      !inputString.includes("億") &&
      !inputString.includes("万") &&
      !inputString.includes("円") &&
      !inputString.includes(",")
    ) {
      return inputString;
    }

    // 億、万、円で分けてそれぞれの数値を取得
    const billion = (inputString.includes("億") ? parseInt(inputString.split("億")[0].replace(/,/g, ""), 10) : 0) || 0;
    const million =
      (inputString.includes("万") && !inputString.includes("億")
        ? parseInt(inputString.split("万")[0].replace(/,/g, ""), 10)
        : inputString.includes("億") && inputString.includes("万")
        ? parseInt(inputString.split("億")[1].split("万")[0].replace(/,/g, ""), 10)
        : 0) || 0;
    const thousand =
      (!inputString.includes("万") && !inputString.includes("億")
        ? Math.floor(parseInt(inputString.replace(/,/g, "").replace("円", ""), 10) / 10000)
        : 0) || 0;

    // 最終的な数値を計算
    const total = billion * 10000 + million + thousand;

    return total;
  }

  const hours = Array.from({ length: 24 }, (_, index) => (index < 10 ? "0" + index : "" + index));
  const minutes5 = Array.from({ length: 12 }, (_, index) => (index * 5 < 10 ? "0" + index * 5 : "" + index * 5));
  const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? "0" + i : "" + i));

  // ================================ ツールチップ ================================
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
  };
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  // const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    content3,
    marginTop,
    itemsPosition = "center",
    whiteSpace,
  }: TooltipParams) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text2 as string)
    //   : "";
    // const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text3 as string)
    //   : "";
    setHoveredItemPosModal({
      x: x - containerLeft,
      y: y - containerTop,
      itemWidth: width,
      itemHeight: height,
      content: content,
      content2: content2,
      content3: content3,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
      whiteSpace: whiteSpace,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    setHoveredItemPosModal(null);
  };
  // ============================================================================================

  console.log(
    "面談予定作成モーダル selectedRowDataActivity",
    selectedRowDataActivity,
    "selectedRowDataMeeting",
    selectedRowDataMeeting,
    "plannedStartTime",
    plannedStartTime,
    "suggestedProductName[0].length",
    suggestedProductName[0]?.length,
    "suggestedProductName[1].length",
    suggestedProductName[1]?.length
    // suggestedProductName &&
    //   suggestedProductName.length > 1 &&
    //   (suggestedProductName[0].length > 0 || suggestedProductName[1].length > 0)
  );

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )} */}
      {/* 製品リスト編集ドロップダウンメニュー オーバーレイ */}
      {/* {isOpenDropdownMenuFilterProducts && (
        <div
          className="fixed left-[-100vw] top-[-50%] z-[2000] h-[200vh] w-[300vw] bg-[#00000090]"
          onClick={() => {
            setIsOpenDropdownMenuFilterProducts(false);
          }}
        ></div>
      )} */}
      <div className={`${styles.container} fade03`} ref={modalContainerRef}>
        {/* ツールチップ */}
        {hoveredItemPosModal && <TooltipModal />}
        {/* ローディングオーバーレイ */}
        {loadingGlobalState && (
          <div className={`${styles.loading_overlay_modal_outside} `}>
            {/* <SpinnerComet w="48px" h="48px" s="5px" /> */}
            <div className={`${styles.loading_overlay_modal_inside}`}>
              <SpinnerBrand withBorder withShadow />
            </div>
          </div>
        )}
        {/* 製品リスト編集ドロップダウンメニュー オーバーレイ */}
        {isOpenDropdownMenuFilterProducts && (
          <div
            // className="fixed left-[-100vw] top-[-50%] z-[12] h-[200vh] w-[300vw] bg-[#4d080890]"
            className="fixed left-[-100vw] top-[-50%] z-[12] h-[200vh] w-[300vw]"
            onClick={() => {
              setIsOpenDropdownMenuFilterProducts(false);
            }}
          ></div>
        )}
        {/* 検索予測リストメニュー オーバーレイ */}
        {suggestedProductName &&
          suggestedProductName.length > 0 &&
          ((suggestedProductName[0] && suggestedProductName[0]?.length > 0) ||
            (suggestedProductName[1] && suggestedProductName[1]?.length > 0)) && (
            <div
              // className="fixed left-[-100vw] top-[-50%] z-[10] h-[200vh] w-[300vw] bg-[#00000090]"
              className="fixed left-[-100vw] top-[-50%] z-[10] h-[200vh] w-[300vw]"
              onClick={() => {
                setSuggestedProductName([]);
              }}
            ></div>
          )}
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
          {/* <div
            className="min-w-[150px] cursor-pointer select-none text-start font-semibold hover:text-[#aaa]"
            onClick={handleCancelAndReset}
          >
            キャンセル
          </div> */}
          <div className="relative min-w-[150px] text-start font-semibold">
            <div
              className="flex max-w-max cursor-pointer select-none items-center hover:text-[#aaa]"
              onClick={handleCancelAndReset}
            >
              <div className="h-full min-w-[20px]"></div>
              <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" />
              <span>戻る</span>
            </div>
          </div>
          <div className="min-w-[150px] select-none font-bold">面談予定 作成</div>

          {selectedRowDataContact && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromContacts}
            >
              保存
            </div>
          )}
          {selectedRowDataActivity && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
              onClick={handleSaveAndClose}
            >
              保存
            </div>
          )}
          {selectedRowDataMeeting && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromMeeting}
            >
              保存
            </div>
          )}
          {selectedRowDataProperty && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromProperty}
            >
              保存
            </div>
          )}
        </div>

        <div className="min-h-[2px] w-full bg-[var(--color-bg-brand-f)]"></div>

        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* ●面談日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談日</span>
                    <DatePickerCustomInput
                      startDate={plannedDate}
                      setStartDate={setPlannedDate}
                      fontSize="text-[14px]"
                      placeholderText="placeholder:text-[15px]"
                      py="py-[6px]"
                      minHeight="min-h-[32px]"
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* ●面談タイプ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談タイプ</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={meetingType}
                      onChange={(e) => {
                        setMeetingType(e.target.value);
                      }}
                    >
                      {/* <option value=""></option> */}
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

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 面談開始 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談開始</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="時"
                      value={plannedStartTimeHour}
                      onChange={(e) => setPlannedStartTimeHour(e.target.value === "" ? "" : e.target.value)}
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
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="分"
                      value={plannedStartTimeMinute}
                      onChange={(e) => setPlannedStartTimeMinute(e.target.value === "" ? "" : e.target.value)}
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
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* WEBツール */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>WEBツール</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={webTool}
                      onChange={(e) => {
                        setWebTool(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsWebTool.map((option) => (
                        <option key={option} value={option}>
                          {getWebTool(option)}
                        </option>
                      ))}
                      {/* <option value="Zoom">Zoom</option>
                      <option value="Teams">Teams</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Webex">Webex</option>
                      <option value="Skype">Skype</option>
                      <option value="bellFace">bellFace</option>
                      <option value="その他">その他</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 同席依頼 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>事前同席依頼</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={preMeetingParticipationRequest}
                      onChange={(e) => {
                        if (e.target.value === "") return alert("活動タイプを選択してください");
                        setPreMeetingParticipationRequest(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="同席依頼無し">同席依頼無し</option>
                      <option value="同席依頼済み">同席依頼済み</option>
                      {/* <option value="同席依頼済み 承諾無し">同席依頼済み 承諾無し</option> */}
                      {/* <option value="同席依頼済み 承諾有り">同席依頼済み 承諾有り</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 面談時間(分) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談時間(分)</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={plannedDuration === null ? "" : plannedDuration}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setPlannedDuration(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setPlannedDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setPlannedDuration(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {plannedDuration !== null && plannedDuration !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setPlannedDuration(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* ●面談目的 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談目的</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={plannedPurpose}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("面談目的を選択してください");
                        setPlannedPurpose(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsPlannedPurpose.map((option) => (
                        <option key={option} value={option}>
                          {getPlannedPurpose(option)}
                        </option>
                      ))}
                      {/* <option value="新規会社(過去面談無し)/能動">新規会社(過去面談無し)/能動</option>
                      <option value="被り会社(過去面談有り)/能動">被り会社(過去面談有り)/能動</option>
                      <option value="社内ID/能動">社内ID/能動</option>
                      <option value="社外･客先ID/能動">社外･客先ID/能動</option>
                      <option value="営業メール/受動">営業メール/能動</option>
                      <option value="見･聞引合/受動">見･聞引合/受動</option>
                      <option value="DM/受動">DM/受動</option>
                      <option value="メール/受動">メール/受動</option>
                      <option value="ホームページ/受動">ホームページ/受動</option>
                      <option value="ウェビナー/受動">ウェビナー/受動</option>
                      <option value="展示会/受動">展示会/受動</option>
                      <option value="他(売前ﾌｫﾛｰ)">他(売前ﾌｫﾛｰ)</option>
                      <option value="他(納品説明)">他(納品説明)</option>
                      <option value="他(客先要望サポート)">他(客先要望サポート)</option>
                      <option value="その他">その他</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* アポ有 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title} !min-w-[140px]`}>アポ有</span>
                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        className={`${styles.grid_select_cell_header_input}`}
                        checked={plannedAppointCheckFlag}
                        onChange={() => setPlannedAppointCheckFlag(!plannedAppointCheckFlag)}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>
            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 紹介予定商品メイン */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>紹介商品ﾒｲﾝ</span> */}
                    <div
                      className={`relative z-[1000] flex !min-w-[140px] items-center ${
                        styles.title
                      } cursor-pointer hover:text-[var(--color-text-brand-f)] ${
                        isOpenDropdownMenuFilterProducts ? `!text-[var(--color-text-brand-f)]` : ``
                      }`}
                      onMouseEnter={(e) => {
                        if (isOpenDropdownMenuFilterProducts) return;
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "選択する商品を全て、事業部、係・チーム、事業所ごとに",
                          content2: "フィルターの切り替えが可能です。",
                          // marginTop: 57,
                          // marginTop: 38,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        });
                      }}
                      onMouseLeave={() => {
                        if (!isOpenDropdownMenuFilterProducts || hoveredItemPosModal) handleCloseTooltip();
                      }}
                      onClick={(e) => {
                        // 事業部、係、事業所をフィルターするか しない場合3つをnullにして全て取得する
                        if (isOpenDropdownMenuFilterProducts) return;
                        if (!modalContainerRef.current) return;
                        const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
                        const {
                          top: _modalTop,
                          height: _modalHeight,
                          bottom: _modalBottom,
                        } = modalContainerRef.current.getBoundingClientRect();

                        // ---------------- 🔹課ありパターン ----------------
                        const clickedPositionPlusItemHeight = y + 412 + 5; // 412はメニューの最低高さ 40はmargin分 -10pxは微調整
                        const clickedPositionMinusItemHeight = y - 412 + height - 25; // 412はメニューの最低高さ 40はmargin分 -10pxは微調整 heightは名前エリア高さ分メニューを下げているため
                        const modalHeight = _modalHeight ?? window.innerHeight * 0.9;
                        const halfBlankSpaceWithoutModal = (window.innerHeight - modalHeight) / 2;
                        const modalBottomPosition = _modalBottom ?? window.innerHeight - halfBlankSpaceWithoutModal;
                        const modalTopPosition = _modalTop ?? halfBlankSpaceWithoutModal;
                        if (
                          modalBottomPosition < clickedPositionPlusItemHeight &&
                          modalTopPosition < clickedPositionMinusItemHeight
                        ) {
                          setClickedItemPosition({ displayPos: "up", clickedItemWidth: width });
                        } else if (
                          modalTopPosition > clickedPositionMinusItemHeight &&
                          modalBottomPosition < clickedPositionPlusItemHeight
                        ) {
                          setClickedItemPosition({ displayPos: "center", clickedItemWidth: width });
                        } else {
                          setClickedItemPosition({ displayPos: "down", clickedItemWidth: width });
                        }
                        // setClickedItemPosition({ displayPos: "down", clickedItemWidth: width });
                        setIsOpenDropdownMenuFilterProducts(true);
                        handleCloseTooltip();

                        // // ---------------- 🔹課なしパターン ----------------
                        // setClickedItemPosition({ displayPos: "down", clickedItemWidth: width });
                        // setIsOpenDropdownMenuFilterProducts(true);
                        // handleCloseTooltip();
                      }}
                    >
                      {/* <span className={`mr-[9px]`}>紹介商品ﾒｲﾝ</span> */}
                      <div className={`mr-[15px] flex flex-col text-[15px]`}>
                        <span>紹介予定</span>
                        <span>商品メイン</span>
                      </div>
                      {/* <div className={`mr-[8px] flex flex-col text-[15px]`}>
                        <span className={``}>型式・名称</span>
                        <span className={``}>(顧客向け)</span>
                      </div> */}
                      {/* <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} /> */}
                      {/* <NextImage width={24} height={24} src={`/assets/images/icons/icons8-job-94.png`} alt="setting" /> */}
                      <NextImage
                        width={24}
                        height={24}
                        src={`/assets/images/icons/business/icons8-process-94.png`}
                        alt="setting"
                      />
                      {/* メンバーデータ編集ドロップダウンメニュー */}
                      {isOpenDropdownMenuFilterProducts && (
                        <DropDownMenuFilterProducts
                          setIsOpenDropdownMenu={setIsOpenDropdownMenuFilterProducts}
                          clickedItemPosition={clickedItemPosition}
                          filterCondition={filterCondition}
                          setFilterCondition={setFilterCondition}
                          // setIsLoadingUpsertMember={setIsLoadingUpsertMember}
                        />
                      )}
                      {/* メンバーデータ編集ドロップダウンメニューここまで */}
                    </div>
                    {/* <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={plannedProduct1 ? plannedProduct1 : ""}
                      onChange={(e) => setPlannedProduct1(e.target.value)}
                    >
                      <option value=""></option>
                      {productDataArray &&
                        productDataArray.length >= 1 &&
                        productDataArray.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.inside_short_name && product.inside_short_name}
                            {!product.inside_short_name && product.product_name + " " + product.outside_short_name}
                          </option>
                        ))}
                    </select> */}

                    <div className={`input_container relative z-[100] flex h-[32px] w-full items-start`}>
                      <input
                        ref={(el) => (inputBoxProducts.current[0] = el)}
                        type="text"
                        placeholder="キーワード入力後、商品を選択してください。"
                        required
                        className={`${styles.input_box}`}
                        value={plannedProduct1InputName}
                        onChange={(e) => setPlannedProduct1InputName(e.target.value)}
                        onKeyUp={(e) => handleSuggestedProduct(e, 0)}
                        onFocus={(e) => {
                          handleFocusSuggestedProduct(plannedProduct1InputName, 0);
                          if (!!resultRefs.current[0]) resultRefs.current[0].style.opacity = "1";
                          // handleFocusSuggestedProduct(plannedProduct1InputName);
                          // if (!!resultRefs.current) resultRefs.current.style.opacity = "1";
                        }}
                        onBlur={() => {
                          // setPlannedProduct1(toHalfWidth(plannedProduct1.trim()));
                          if (!!resultRefs.current[0]) resultRefs.current[0].style.opacity = "0";
                          // Blur時に候補が１つのみならその候補のidとNameをセット
                          if (suggestedProductName[0].length === 1) {
                            const matchProduct = suggestedProductName[0][0];
                            setPlannedProduct1InputName(matchProduct.fullName);
                            setPlannedProduct1(matchProduct.id);
                            // 候補をリセット
                            const newSuggestedProductName = [...suggestedProductName];
                            newSuggestedProductName[0] = [];
                            setSuggestedProductName(newSuggestedProductName);
                          }
                        }}
                      />
                      {/* 予測変換結果 */}
                      {suggestedProductName && suggestedProductName[0] && suggestedProductName[0]?.length > 0 && (
                        <div
                          ref={(el) => (resultRefs.current[0] = el)}
                          className={`${styles.result_box}`}
                          style={
                            {
                              "--color-border-custom": "#ccc",
                              // ...(!isFocusInputProducts[0] && { opacity: 0 }),
                            } as CSSProperties
                          }
                        >
                          {suggestedProductName && suggestedProductName[0] && suggestedProductName[0]?.length > 0 && (
                            <div className="sticky top-0 flex min-h-[5px] w-full flex-col items-center justify-end">
                              <hr className={`min-h-[4px] w-full bg-[var(--color-bg-under-input)]`} />
                              <hr className={`min-h-[1px] w-[93%] bg-[#ccc]`} />
                            </div>
                          )}
                          <ul>
                            {suggestedProductName[0]?.map((productIdName, index) => (
                              <li
                                key={index}
                                onClick={(e) => {
                                  // console.log("🌟innerText", e.currentTarget.innerText);
                                  const productName = productIdName.fullName;
                                  const productId = productIdName.id;
                                  // setPlannedProduct1(e.currentTarget.innerText);
                                  setPlannedProduct1InputName(productName);
                                  setPlannedProduct1(productId);
                                  const newSuggestedProductName = [...suggestedProductName];
                                  newSuggestedProductName[0] = [];
                                  setSuggestedProductName(newSuggestedProductName);
                                  // setSuggestedProductName([]);
                                }}
                              >
                                {productIdName.fullName}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* 予測変換結果 */}
                      <div
                        className={`flex-center absolute right-[3px] top-[50%] min-h-[20px] min-w-[20px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-icon)]`}
                        onMouseEnter={(e) => {
                          if (isOpenDropdownMenuFilterProducts) return;
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: "フィルターされた商品リストを表示します。",
                            content2: "アイコンをクリックしてフィルターの切り替えが可能です。",
                            content3: "商品紹介が無い面談の場合は「他」を選択してください。",
                            // marginTop: 57,
                            // marginTop: 38,
                            marginTop: 12,
                            itemsPosition: "center",
                            whiteSpace: "nowrap",
                          });
                        }}
                        onMouseLeave={() => {
                          if (!isOpenDropdownMenuFilterProducts || hoveredItemPosModal) handleCloseTooltip();
                        }}
                        onClick={() => {
                          // if (selectBoxProducts.current[0]) {
                          //   selectBoxProducts.current[0].click();
                          //   selectBoxProducts.current[0].style.opacity = "1";
                          //   selectBoxProducts.current[0].style.pointerEvents = "normal";
                          // }
                          if (inputBoxProducts.current[0]) {
                            inputBoxProducts.current[0].focus();
                            // 矢印クリック 全商品をリストで表示

                            if (
                              !suggestedProductName[0]?.length ||
                              (suggestedProductName[0] &&
                                suggestedProductName[0]?.length !== suggestedProductIdNameArray.length)
                            ) {
                              const newSuggestions = [...suggestedProductName];
                              newSuggestions[0] = [...suggestedProductIdNameArray];
                              setSuggestedProductName(newSuggestions);
                              // if (suggestedProductName.length !== suggestedProductIdNameArray.length)
                              //   setSuggestedProductName([...suggestedProductIdNameArray]);
                            }
                          }
                          if (!isOpenDropdownMenuFilterProducts || hoveredItemPosModal) handleCloseTooltip();
                        }}
                      >
                        {/* <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-sub)]" /> */}
                        <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-brand-f)]" />
                      </div>
                    </div>
                    {/* 予測変換input セレクトと組み合わせ ここまで */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 紹介予定サブ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>紹介予定サブ</span> */}
                    <div className={`${styles.title} !min-w-[140px]`}>
                      <div className={`mr-[15px] flex flex-col text-[15px]`}>
                        <span>紹介予定</span>
                        <span>商品サブ</span>
                      </div>
                    </div>
                    {/* <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={plannedProduct2 ? plannedProduct2 : ""}
                      onChange={(e) => setPlannedProduct2(e.target.value)}
                    >
                      <option value=""></option>
                      {productDataArray &&
                        productDataArray.length >= 1 &&
                        productDataArray.map((product) => (
                          <option key={product.id} value={product.id}>
                            {product.inside_short_name && product.inside_short_name}
                            {!product.inside_short_name && product.product_name + " " + product.outside_short_name}
                          </option>
                        ))}
                    </select> */}
                    <div className={`input_container relative z-[100] flex h-[32px] w-full items-start`}>
                      <input
                        ref={(el) => (inputBoxProducts.current[1] = el)}
                        type="text"
                        placeholder="キーワード入力後、商品を選択してください。"
                        required
                        className={`${styles.input_box}`}
                        value={plannedProduct2InputName}
                        onChange={(e) => setPlannedProduct2InputName(e.target.value)}
                        onKeyUp={(e) => handleSuggestedProduct(e, 1)}
                        onFocus={(e) => {
                          handleFocusSuggestedProduct(plannedProduct2InputName, 1);
                          if (!!resultRefs.current[1]) resultRefs.current[1].style.opacity = "1";
                          // handleFocusSuggestedProduct(plannedProduct2InputName);
                          // if (!!resultRefs.current) resultRefs.current.style.opacity = "1";
                        }}
                        onBlur={() => {
                          // setPlannedProduct2(toHalfWidth(plannedProduct1.trim()));
                          if (!!resultRefs.current[1]) resultRefs.current[1].style.opacity = "0";
                          // Blur時に候補が１つのみならその候補のidとNameをセット
                          if (suggestedProductName[1].length === 1) {
                            const matchProduct = suggestedProductName[1][0];
                            setPlannedProduct2InputName(matchProduct.fullName);
                            setPlannedProduct2(matchProduct.id);
                            // 候補をリセット
                            const newSuggestedProductName = [...suggestedProductName];
                            newSuggestedProductName[1] = [];
                            setSuggestedProductName(newSuggestedProductName);
                          }
                        }}
                      />
                      {/* 予測変換結果 */}
                      {suggestedProductName && suggestedProductName[1] && suggestedProductName[1]?.length > 0 && (
                        <div
                          ref={(el) => (resultRefs.current[1] = el)}
                          className={`${styles.result_box}`}
                          style={
                            {
                              "--color-border-custom": "#ccc",
                              // ...(!isFocusInputProducts[1] && { opacity: 0 }),
                            } as CSSProperties
                          }
                        >
                          {suggestedProductName && suggestedProductName[1] && suggestedProductName[1]?.length > 0 && (
                            <div className="sticky top-0 flex min-h-[3px] w-full flex-col items-center justify-end">
                              <hr className={`min-h-[1px] w-[93%] bg-[#ccc]`} />
                            </div>
                          )}
                          <ul>
                            {suggestedProductName[1]?.map((productIdName, index) => (
                              <li
                                key={index}
                                onClick={(e) => {
                                  // console.log("🌟innerText", e.currentTarget.innerText);
                                  const productName = productIdName.fullName;
                                  const productId = productIdName.id;
                                  // setPlannedProduct2(e.currentTarget.innerText);
                                  setPlannedProduct2InputName(productName);
                                  setPlannedProduct2(productId);
                                  const newSuggestions = [...suggestedProductName];
                                  newSuggestions[1] = [];
                                  setSuggestedProductName(newSuggestions);
                                  // setSuggestedProductName([]);
                                }}
                              >
                                {productIdName.fullName}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {/* 予測変換結果 */}
                      <div
                        className={`flex-center absolute right-[3px] top-[50%] min-h-[20px] min-w-[20px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[var(--color-bg-sub-icon)]`}
                        onMouseEnter={(e) => {
                          if (isOpenDropdownMenuFilterProducts) return;
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: "フィルターされた商品リストを表示します。",
                            content2: "アイコンをクリックしてフィルターの切り替えが可能です。",
                            content3: "商品紹介が無い面談の場合は「他」を選択してください。",
                            // marginTop: 57,
                            // marginTop: 38,
                            marginTop: 12,
                            itemsPosition: "center",
                            whiteSpace: "nowrap",
                          });
                        }}
                        onMouseLeave={() => {
                          if (!isOpenDropdownMenuFilterProducts || hoveredItemPosModal) handleCloseTooltip();
                        }}
                        onClick={() => {
                          // if (selectBoxProducts.current[1]) {
                          //   selectBoxProducts.current[1].click();
                          //   selectBoxProducts.current[1].style.opacity = "1";
                          //   selectBoxProducts.current[1].style.pointerEvents = "normal";
                          // }
                          if (inputBoxProducts.current[1]) {
                            inputBoxProducts.current[1].focus();

                            // if (suggestedProductName[1].length !== suggestedProductIdNameArray.length) {
                            if (
                              !suggestedProductName[1]?.length ||
                              (suggestedProductName[1] &&
                                suggestedProductName[1]?.length !== suggestedProductIdNameArray.length)
                            ) {
                              const newSuggestions = [...suggestedProductName];
                              newSuggestions[1] = [...suggestedProductIdNameArray];
                              setSuggestedProductName(newSuggestions);
                            }

                            // if (suggestedProductName.length !== suggestedProductIdNameArray.length)
                            //   setSuggestedProductName([...suggestedProductIdNameArray]);
                          }
                        }}
                      >
                        {/* <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-sub)]" /> */}
                        <HiChevronDown className="stroke-[1] text-[13px] text-[var(--color-text-brand-f)]" />
                      </div>
                    </div>
                    {/* 予測変換input セレクトと組み合わせ ここまで */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>
            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 事前コメント */}
            <div className={`${styles.row_area} ${styles.text_area_xl} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} !min-w-[140px]`}>事前コメント</span>
                  <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={plannedComment}
                    onChange={(e) => setPlannedComment(e.target.value)}
                  ></textarea>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 事業部名 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>事業部名</span>
                    {/* <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={departmentName}
                      onChange={(e) => setDepartmentName(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    /> */}
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // value={departmentId ? departmentId : ""}
                      // onChange={(e) => setDepartmentId(e.target.value)}
                      // value={departmentId ? departmentId : ""}
                      // onChange={(e) => setDepartmentId(e.target.value)}
                      value={memberObj.departmentId ? memberObj.departmentId : ""}
                      onChange={(e) => {
                        setMemberObj({ ...memberObj, departmentId: e.target.value });
                        setIsOpenConfirmationModal("change_member");
                      }}
                    >
                      <option value=""></option>
                      {departmentDataArray &&
                        departmentDataArray.length >= 1 &&
                        departmentDataArray.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.department_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 所属事業所 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>所属事業所</span>
                    {/* <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={businessOffice}
                      onChange={(e) => setBusinessOffice(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                    /> */}
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // value={officeId ? officeId : ""}
                      // onChange={(e) => setOfficeId(e.target.value)}
                      value={memberObj.officeId ? memberObj.officeId : ""}
                      onChange={(e) => {
                        setMemberObj({ ...memberObj, officeId: e.target.value });
                        setIsOpenConfirmationModal("change_member");
                      }}
                    >
                      <option value=""></option>
                      {officeDataArray &&
                        officeDataArray.length >= 1 &&
                        officeDataArray.map((office) => (
                          <option key={office.id} value={office.id}>
                            {office.office_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>

            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 課・セクション */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>課・セクション</span>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={memberObj.sectionId ? memberObj.sectionId : ""}
                      onChange={(e) => {
                        setMemberObj({ ...memberObj, sectionId: e.target.value });
                        setIsOpenConfirmationModal("change_member");
                      }}
                    >
                      <option value=""></option>
                      {sectionDataArray &&
                        sectionDataArray.length >= 1 &&
                        sectionDataArray.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.section_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 自社担当 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>自社担当</span>
                    <input
                      type="text"
                      placeholder="*入力必須"
                      required
                      className={`${styles.input_box}`}
                      // value={memberName}
                      // onChange={(e) => setMemberName(e.target.value)}
                      // onBlur={() => setDepartmentName(toHalfWidth(departmentName.trim()))}
                      value={memberObj.memberName ? memberObj.memberName : ""}
                      onChange={(e) => {
                        setMemberObj({ ...memberObj, memberName: e.target.value });
                      }}
                      onKeyUp={() => {
                        if (prevMemberObj.memberName !== memberObj.memberName) {
                          setIsOpenConfirmationModal("change_member");
                          return;
                        }
                      }}
                      onBlur={() => {
                        if (!memberObj.memberName) return;
                        setMemberObj({ ...memberObj, memberName: toHalfWidthAndSpace(memberObj.memberName.trim()) });
                      }}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 係・チーム */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} `}>係・チーム</span>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box} ${styles.min}`}
                      // value={unitId ? unitId : ""}
                      // onChange={(e) => setUnitId(e.target.value)}
                      value={memberObj.unitId ? memberObj.unitId : ""}
                      onChange={(e) => {
                        setMemberObj({ ...memberObj, unitId: e.target.value });
                        setIsOpenConfirmationModal("change_member");
                      }}
                    >
                      <option value=""></option>
                      {unitDataArray &&
                        unitDataArray.length >= 1 &&
                        unitDataArray.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.unit_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* ●面談年月度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談年月度</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title}  ${styles.required_title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "面談年月度は決算日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: !!fiscalEndMonthObjRef.current
                            ? `面談日を選択することで面談年月度は自動計算されるため入力は不要です。`
                            : `決算日が未設定の場合は、デフォルトで3月31日が決算日として設定されます。`,
                          content3:
                            "決算日の変更はダッシュボード右上のアカウント設定の「会社・チーム」から変更可能です。",
                          // marginTop: 57,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[9px]`}>●面談年月度</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <div className={`flex min-h-[35px] items-center`}>
                      <p className={`pl-[5px] text-[14px] text-[var(--color-text-under-input)]`}>{meetingYearMonth}</p>
                    </div>
                    {/* <input
                      type="number"
                      min="0"
                      className={`${styles.input_box} pointer-events-none`}
                      // placeholder='"202109" や "202312" などを入力'
                      placeholder="面談日付を選択してください"
                      value={meetingYearMonth === null ? "" : meetingYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setMeetingYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setMeetingYearMonth(0);
                          } else {
                            setMeetingYearMonth(numValue);
                          }
                        }
                      }}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>

      {/* 「自社担当」変更確認モーダル */}
      {isOpenConfirmationModal === "change_member" && (
        <ConfirmationModal
          clickEventClose={() => {
            // setMeetingMemberName(selectedRowDataMeeting?.meeting_member_name ?? "");
            setMemberObj(prevMemberObj);
            setIsOpenConfirmationModal(null);
          }}
          // titleText="面談データの自社担当を変更してもよろしいですか？"
          titleText={`データの所有者を変更してもよろしいですか？`}
          // titleText2={`データの所有者を変更しますか？`}
          sectionP1="「自社担当」「事業部」「係・チーム」「事業所」を変更すると面談データの所有者が変更されます。"
          sectionP2="注：データの所有者を変更すると、この面談結果は変更先のメンバーの集計結果に移行され、分析結果が変更されます。"
          cancelText="戻る"
          submitText="変更する"
          clickEventSubmit={() => {
            // setMemberObj(prevMemberObj);
            setIsOpenConfirmationModal(null);
            // setIsOpenSearchMemberSideTable(true);
            // モーダルを開く
            // setIsOpenSearchMemberSideTable(true);
            setIsOpenSearchMemberSideTableBefore(true);
            setTimeout(() => {
              setIsOpenSearchMemberSideTable(true);
            }, 100);
          }}
        />
      )}

      {/* 「自社担当」変更サイドテーブル */}
      {isOpenSearchMemberSideTableBefore && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense
            fallback={<FallbackSideTableSearchMember isOpenSearchMemberSideTable={isOpenSearchMemberSideTable} />}
          >
            <SideTableSearchMember
              isOpenSearchMemberSideTable={isOpenSearchMemberSideTable}
              setIsOpenSearchMemberSideTable={setIsOpenSearchMemberSideTable}
              isOpenSearchMemberSideTableBefore={isOpenSearchMemberSideTableBefore}
              setIsOpenSearchMemberSideTableBefore={setIsOpenSearchMemberSideTableBefore}
              // currentMemberId={selectedRowDataMeeting?.meeting_created_by_user_id ?? ""}
              // currentMemberName={selectedRowDataMeeting?.meeting_member_name ?? ""}
              // currentMemberDepartmentId={selectedRowDataMeeting?.meeting_created_by_department_of_user ?? null}
              // setChangedMemberObj={setChangedMemberObj}
              // currentMemberId={memberObj.memberId ?? ""}
              // currentMemberName={memberObj.memberName ?? ""}
              // currentMemberDepartmentId={memberObj.departmentId ?? null}
              prevMemberObj={prevMemberObj}
              setPrevMemberObj={setPrevMemberObj}
              memberObj={memberObj}
              setMemberObj={setMemberObj}
              // setMeetingMemberName={setMeetingMemberName}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
};
