import React, { Suspense, useEffect, useRef, useState } from "react";
import styles from "./InsertNewActivityModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateActivity } from "@/hooks/useMutateActivity";
import productCategoriesM from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { BsChevronLeft } from "react-icons/bs";
import { useQueryClient } from "@tanstack/react-query";
import { Department, Office, Unit } from "@/types";
import { ConfirmationModal } from "../SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { ErrorBoundary } from "react-error-boundary";
import { FallbackSideTableSearchMember } from "../UpdateMeetingModal/SideTableSearchMember/FallbackSideTableSearchMember";
import { SideTableSearchMember } from "../UpdateMeetingModal/SideTableSearchMember/SideTableSearchMember";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQuerySections } from "@/hooks/useQuerySections";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { ImInfo } from "react-icons/im";
import useStore from "@/store";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { getActivityType, getPriorityName, optionsActivityType, optionsPriority } from "@/utils/selectOptions";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { getFiscalYear } from "@/utils/Helpers/getFiscalYear";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { calculateCurrentFiscalYearEndDate } from "@/utils/Helpers/calcurateCurrentFiscalYearEndDate";
import { calculateFiscalYearMonths } from "@/utils/Helpers/CalendarHelpers/calculateFiscalMonths";

// type ModalProperties = {
//   left: number;
//   top: number;
//   right: number;
//   bottom: number;
//   width: number;
//   height: number;
// };

export const InsertNewActivityModal = () => {
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const setIsOpenInsertNewActivityModal = useDashboardStore((state) => state.setIsOpenInsertNewActivityModal);
  // const [isLoading, setIsLoading] = useState(false);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // 確認モーダル(自社担当名、データ所有者変更確認)
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState<string | null>(null);
  // 自社担当検索サイドテーブル開閉
  const [isOpenSearchMemberSideTableBefore, setIsOpenSearchMemberSideTableBefore] = useState(false);
  const [isOpenSearchMemberSideTable, setIsOpenSearchMemberSideTable] = useState(false);
  // 紹介予定商品、実施商品選択時のドロップダウンメニュー用
  // const [modalProperties, setModalProperties] = useState<ModalProperties>();
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  const initialDate = new Date();
  initialDate.setHours(0, 0, 0, 0);
  const year = initialDate.getFullYear(); // 例: 2023
  const month = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
  const activityYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
  // const [activityDate, setActivityDate] = useState<Date | null>(new Date());
  const [activityDate, setActivityDate] = useState<Date | null>(initialDate);
  const [summary, setSummary] = useState("");
  const [scheduledFollowUpDate, setScheduledFollowUpDate] = useState<Date | null>(null);
  const [followUpFlag, setFollowUpFlag] = useState(false);
  const [documentURL, setDocumentURL] = useState("");
  const [activityType, setActivityType] = useState("");
  const [claimFlag, setClaimFlag] = useState(false);
  const [productIntroduction1, setProductIntroduction1] = useState(null); //面談、案件、見積用
  const [productIntroduction2, setProductIntroduction2] = useState(null); //面談、案件、見積用
  const [productIntroduction3, setProductIntroduction3] = useState(null); //面談、案件、見積用
  const [productIntroduction4, setProductIntroduction4] = useState(null); //面談、案件、見積用
  const [productIntroduction5, setProductIntroduction5] = useState(null); //面談、案件、見積用
  // const [departmentName, setDepartmentName] = useState(
  //   userProfileState?.department ? userProfileState?.department : ""
  // );
  // const [businessOffice, setBusinessOffice] = useState("");
  // const [departmentId, setDepartmentId] = useState<Department["id"] | null>(
  //   userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null
  // );
  // const [unitId, setUnitId] = useState<Unit["id"] | null>(
  //   userProfileState?.assigned_unit_id ? userProfileState?.assigned_unit_id : null
  // );
  // const [officeId, setOfficeId] = useState<Office["id"] | null>(
  //   userProfileState?.assigned_office_id ? userProfileState?.assigned_office_id : null
  // );
  // const [memberName, setMemberName] = useState(userProfileState?.profile_name ? userProfileState?.profile_name : "");
  // 営業担当データ
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
  // 営業担当データここまで
  const [priority, setPriority] = useState("");
  const [activityYearMonth, setActivityYearMonth] = useState<number | null>(Number(activityYearMonthInitialValue));
  // ユーザーの決算月と締め日を取得
  const fiscalEndMonthObjRef = useRef<Date | null>(null);
  const closingDayRef = useRef<number | null>(null);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const { createActivityMutation } = useMutateActivity();

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

  // ---------------------------- 🌟決算日と年月度取得🌟 ----------------------------
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

  // 🌟面談日を更新したら面談年月度をユーザーの締め日に応じて更新するuseEffect
  // ユーザーの財務サイクルに合わせて面談年月度を自動的に取得する関数(決算月の締め日の翌日を新たな月度の開始日とする)
  useEffect(() => {
    if (!activityDate || !closingDayRef.current) {
      setActivityYearMonth(null);
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
    const fiscalYearMonth = calculateDateToYearMonth(activityDate, closingDayRef.current);
    console.log("fiscalYearMonth", fiscalYearMonth);
    setActivityYearMonth(fiscalYearMonth);
    // const meetingYearMonthUpdatedValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
    // setMeetingYearMonth(Number(meetingYearMonthUpdatedValue));
  }, [activityDate]);
  // ---------------------------- ✅決算日と年月度取得✅ ----------------------------

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenInsertNewActivityModal(false);
  };

  // 🌟担当者画面から活動を作成 担当者画面で選択したRowデータを使用する
  const handleSaveAndCloseFromContact = async () => {
    if (!summary) return alert("活動概要を入力してください");
    if (!activityType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataContact?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataContact?.contact_id) return alert("担当者情報が存在しません");
    if (!activityDate) return alert("活動日を入力してください");
    if (!activityYearMonth) return alert("活動年月度を入力してください");

    setLoadingGlobalState(true);

    // const departmentName =
    //   departmentDataArray &&
    //   departmentId &&
    //   departmentDataArray.find((obj) => obj.id === departmentId)?.department_name;
    // const officeName = officeDataArray && officeId && officeDataArray.find((obj) => obj.id === officeId)?.office_name;
    const departmentName =
      departmentDataArray &&
      memberObj.departmentId &&
      departmentDataArray.find((obj) => obj.id === memberObj.departmentId)?.department_name;
    const officeName =
      officeDataArray &&
      memberObj.officeId &&
      officeDataArray.find((obj) => obj.id === memberObj.officeId)?.office_name;

    // ------------------ 年月度から年度・半期・四半期を算出 ------------------
    if (fiscalEndMonthObjRef.current === null) return alert("決算日データが見つかりませんでした。");

    // 現在の年度を取得
    const selectedFiscalYear = getFiscalYear(
      activityDate,
      fiscalEndMonthObjRef.current.getMonth() + 1,
      fiscalEndMonthObjRef.current.getDate(),
      userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis"
    );
    // 期首を取得
    const fiscalYearStartDate = calculateFiscalYearStart({
      fiscalYearEnd:
        userProfileState.customer_fiscal_end_month ?? new Date(new Date().getFullYear(), 2, 31, 23, 59, 59, 999),
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
        fiscalYearEnd:
          userProfileState?.customer_fiscal_end_month ?? new Date(new Date().getFullYear(), 2, 31, 23, 59, 59, 999),
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
    const _activityMonth = String(activityYearMonth).substring(4);
    const halfDetailValue = firstHalfDetailSet.has(_activityMonth) ? 1 : 2;
    const activityHalfYear = selectedFiscalYear * 10 + halfDetailValue;
    let activityQuarter = 0;
    // 上期ルート
    if (halfDetailValue === 1) {
      // Q1とQ2どちらを選択中か更新
      const firstQuarterSet = new Set([
        String(fiscalMonths.month_01).substring(4),
        String(fiscalMonths.month_02).substring(4),
        String(fiscalMonths.month_03).substring(4),
      ]);
      const quarterValue = firstQuarterSet.has(_activityMonth) ? 1 : 2;
      activityQuarter = selectedFiscalYear * 10 + quarterValue;
    }
    // 下期ルート
    else {
      // Q3とQ4どちらを選択中か更新
      const thirdQuarterSet = new Set([
        String(fiscalMonths.month_07).substring(4),
        String(fiscalMonths.month_08).substring(4),
        String(fiscalMonths.month_09).substring(4),
      ]);
      const quarterValue = thirdQuarterSet.has(_activityMonth) ? 3 : 4;
      activityQuarter = selectedFiscalYear * 10 + quarterValue;
    }

    if (activityQuarter === 0) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM02");
    }
    if (String(activityHalfYear).length !== 5 || String(activityQuarter).length !== 5) {
      setLoadingGlobalState(false);
      if (String(activityHalfYear).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM03");
      if (String(activityQuarter).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM04");
    }
    // ------------------ 年月度から年度・半期・四半期を算出 ここまで ------------------

    // 新規作成するデータをオブジェクトにまとめる
    const newActivity = {
      // created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // 営業担当データ
      created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
      created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
      created_by_section_of_user: memberObj.sectionId ? memberObj.sectionId : null,
      created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
      created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
      // 営業担当データここまで
      client_contact_id: selectedRowDataContact.contact_id,
      client_company_id: selectedRowDataContact.company_id,
      summary: summary,
      scheduled_follow_up_date: scheduledFollowUpDate ? scheduledFollowUpDate.toISOString() : null,
      // follow_up_flag: followUpFlag ? followUpFlag : null,
      follow_up_flag: followUpFlag,
      document_url: null,
      activity_type: activityType ? activityType : null,
      // claim_flag: claimFlag ? claimFlag : null,
      claim_flag: claimFlag,
      product_introduction1: productIntroduction1 ? productIntroduction1 : null,
      product_introduction2: productIntroduction2 ? productIntroduction2 : null,
      product_introduction3: productIntroduction3 ? productIntroduction3 : null,
      product_introduction4: productIntroduction4 ? productIntroduction4 : null,
      product_introduction5: productIntroduction5 ? productIntroduction5 : null,
      // department: departmentName ? departmentName : null,
      // business_office: businessOffice ? businessOffice : null,
      department: departmentName ? departmentName : null,
      business_office: officeName ? officeName : null,
      // member_name: memberName ? memberName : null,
      member_name: memberObj.memberName ? memberObj.memberName : null,
      priority: priority ? priority : null,
      activity_date: activityDate ? activityDate.toISOString() : null,
      activity_year_month: activityYearMonth ? activityYearMonth : null,
      // 年度〜四半期
      activity_quarter: activityQuarter ? activityQuarter : null,
      activity_half_year: activityHalfYear ? activityHalfYear : null,
      activity_fiscal_year: selectedFiscalYear ? selectedFiscalYear : null,
      meeting_id: null,
      property_id: null,
      quotation_id: null,
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createActivityMutation.mutate(newActivity);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewActivityModal(false);
  };

  // 🌟活動画面から活動を作成 活動画面で選択したRowデータを使用する
  const handleSaveAndCloseFromActivity = async () => {
    if (!summary) return alert("活動概要を入力してください");
    if (!activityType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataActivity?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataActivity?.contact_id) return alert("担当者情報が存在しません");
    if (!activityDate) return alert("活動日を入力してください");
    if (!activityYearMonth) return alert("活動年月度を入力してください");

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
    if (fiscalEndMonthObjRef.current === null) return alert("決算日データが見つかりませんでした。");

    // 現在の年度を取得
    const selectedFiscalYear = getFiscalYear(
      activityDate,
      fiscalEndMonthObjRef.current.getMonth() + 1,
      fiscalEndMonthObjRef.current.getDate(),
      userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis"
    );
    // 期首を取得
    const fiscalYearStartDate = calculateFiscalYearStart({
      fiscalYearEnd:
        userProfileState.customer_fiscal_end_month ?? new Date(new Date().getFullYear(), 2, 31, 23, 59, 59, 999),
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
        fiscalYearEnd:
          userProfileState?.customer_fiscal_end_month ?? new Date(new Date().getFullYear(), 2, 31, 23, 59, 59, 999),
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
    const _activityMonth = String(activityYearMonth).substring(4);
    const halfDetailValue = firstHalfDetailSet.has(_activityMonth) ? 1 : 2;
    const activityHalfYear = selectedFiscalYear * 10 + halfDetailValue;
    let activityQuarter = 0;
    // 上期ルート
    if (halfDetailValue === 1) {
      // Q1とQ2どちらを選択中か更新
      const firstQuarterSet = new Set([
        String(fiscalMonths.month_01).substring(4),
        String(fiscalMonths.month_02).substring(4),
        String(fiscalMonths.month_03).substring(4),
      ]);
      const quarterValue = firstQuarterSet.has(_activityMonth) ? 1 : 2;
      activityQuarter = selectedFiscalYear * 10 + quarterValue;
    }
    // 下期ルート
    else {
      // Q3とQ4どちらを選択中か更新
      const thirdQuarterSet = new Set([
        String(fiscalMonths.month_07).substring(4),
        String(fiscalMonths.month_08).substring(4),
        String(fiscalMonths.month_09).substring(4),
      ]);
      const quarterValue = thirdQuarterSet.has(_activityMonth) ? 3 : 4;
      activityQuarter = selectedFiscalYear * 10 + quarterValue;
    }

    if (activityQuarter === 0) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM02");
    }
    if (String(activityHalfYear).length !== 5 || String(activityQuarter).length !== 5) {
      setLoadingGlobalState(false);
      if (String(activityHalfYear).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM03");
      if (String(activityQuarter).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM04");
    }
    // ------------------ 年月度から年度・半期・四半期を算出 ここまで ------------------

    // 新規作成するデータをオブジェクトにまとめる
    const newActivity = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      // created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: departmentId ? departmentId : null,
      // created_by_unit_of_user: unitId ? unitId : null,
      // created_by_office_of_user: officeId ? officeId : null,
      // 営業担当データ
      created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
      created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
      created_by_section_of_user: memberObj.sectionId ? memberObj.sectionId : null,
      created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
      created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
      // 営業担当データここまで
      client_contact_id: selectedRowDataActivity.contact_id,
      client_company_id: selectedRowDataActivity.company_id,
      summary: summary ? summary : null,
      scheduled_follow_up_date: scheduledFollowUpDate ? scheduledFollowUpDate.toISOString() : null,
      // follow_up_flag: followUpFlag ? followUpFlag : null,
      follow_up_flag: followUpFlag,
      document_url: null,
      activity_type: activityType ? activityType : null,
      // claim_flag: claimFlag ? claimFlag : null,
      claim_flag: claimFlag,
      product_introduction1: productIntroduction1 ? productIntroduction1 : null,
      product_introduction2: productIntroduction2 ? productIntroduction2 : null,
      product_introduction3: productIntroduction3 ? productIntroduction3 : null,
      product_introduction4: productIntroduction4 ? productIntroduction4 : null,
      product_introduction5: productIntroduction5 ? productIntroduction5 : null,
      department: departmentName ? departmentName : null,
      business_office: officeName ? officeName : null,
      member_name: memberObj.memberName ? memberObj.memberName : null,
      priority: priority ? priority : null,
      activity_date: activityDate ? activityDate.toISOString() : null,
      activity_year_month: activityYearMonth ? activityYearMonth : null,
      // 年度〜四半期
      activity_quarter: activityQuarter ? activityQuarter : null,
      activity_half_year: activityHalfYear ? activityHalfYear : null,
      activity_fiscal_year: selectedFiscalYear ? selectedFiscalYear : null,
      meeting_id: null, //面談作成時用
      property_id: null, //案件作成時用
      quotation_id: null, //見積作成時用
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createActivityMutation.mutate(newActivity);

    // setLoadingGlobalState(false);
  };

  // 🌟面談画面から活動を作成 面談画面で選択したRowデータを使用する
  const handleSaveAndCloseFromMeeting = async () => {
    if (!summary) return alert("活動概要を入力してください");
    if (!activityType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataMeeting?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataMeeting?.contact_id) return alert("担当者情報が存在しません");
    if (!activityDate) return alert("活動日を入力してください");
    if (!activityYearMonth) return alert("活動年月度を入力してください");

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
    if (fiscalEndMonthObjRef.current === null) return alert("決算日データが見つかりませんでした。");

    // 現在の年度を取得
    const selectedFiscalYear = getFiscalYear(
      activityDate,
      fiscalEndMonthObjRef.current.getMonth() + 1,
      fiscalEndMonthObjRef.current.getDate(),
      userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis"
    );
    // 期首を取得
    const fiscalYearStartDate = calculateFiscalYearStart({
      fiscalYearEnd:
        userProfileState.customer_fiscal_end_month ?? new Date(new Date().getFullYear(), 2, 31, 23, 59, 59, 999),
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
        fiscalYearEnd:
          userProfileState?.customer_fiscal_end_month ?? new Date(new Date().getFullYear(), 2, 31, 23, 59, 59, 999),
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
    const _activityMonth = String(activityYearMonth).substring(4);
    const halfDetailValue = firstHalfDetailSet.has(_activityMonth) ? 1 : 2;
    const activityHalfYear = selectedFiscalYear * 10 + halfDetailValue;
    let activityQuarter = 0;
    // 上期ルート
    if (halfDetailValue === 1) {
      // Q1とQ2どちらを選択中か更新
      const firstQuarterSet = new Set([
        String(fiscalMonths.month_01).substring(4),
        String(fiscalMonths.month_02).substring(4),
        String(fiscalMonths.month_03).substring(4),
      ]);
      const quarterValue = firstQuarterSet.has(_activityMonth) ? 1 : 2;
      activityQuarter = selectedFiscalYear * 10 + quarterValue;
    }
    // 下期ルート
    else {
      // Q3とQ4どちらを選択中か更新
      const thirdQuarterSet = new Set([
        String(fiscalMonths.month_07).substring(4),
        String(fiscalMonths.month_08).substring(4),
        String(fiscalMonths.month_09).substring(4),
      ]);
      const quarterValue = thirdQuarterSet.has(_activityMonth) ? 3 : 4;
      activityQuarter = selectedFiscalYear * 10 + quarterValue;
    }

    if (activityQuarter === 0) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM02");
    }
    if (String(activityHalfYear).length !== 5 || String(activityQuarter).length !== 5) {
      setLoadingGlobalState(false);
      if (String(activityHalfYear).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM03");
      if (String(activityQuarter).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM04");
    }
    // ------------------ 年月度から年度・半期・四半期を算出 ここまで ------------------

    // 新規作成するデータをオブジェクトにまとめる
    const newActivity = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      // created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: departmentId ? departmentId : null,
      // created_by_unit_of_user: unitId ? unitId : null,
      // created_by_office_of_user: officeId ? officeId : null,
      // 営業担当データ
      created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
      created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
      created_by_section_of_user: memberObj.sectionId ? memberObj.sectionId : null,
      created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
      created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
      // 営業担当データここまで
      client_contact_id: selectedRowDataMeeting.contact_id,
      client_company_id: selectedRowDataMeeting.company_id,
      summary: summary ? summary : null,
      scheduled_follow_up_date: scheduledFollowUpDate ? scheduledFollowUpDate.toISOString() : null,
      // follow_up_flag: followUpFlag ? followUpFlag : null,
      follow_up_flag: followUpFlag,
      document_url: null,
      activity_type: activityType ? activityType : null,
      // claim_flag: claimFlag ? claimFlag : null,
      claim_flag: claimFlag,
      product_introduction1: productIntroduction1 ? productIntroduction1 : null,
      product_introduction2: productIntroduction2 ? productIntroduction2 : null,
      product_introduction3: productIntroduction3 ? productIntroduction3 : null,
      product_introduction4: productIntroduction4 ? productIntroduction4 : null,
      product_introduction5: productIntroduction5 ? productIntroduction5 : null,
      department: departmentName ? departmentName : null,
      business_office: officeName ? officeName : null,
      member_name: memberObj.memberName ? memberObj.memberName : null,
      priority: priority ? priority : null,
      activity_date: activityDate ? activityDate.toISOString() : null,
      activity_year_month: activityYearMonth ? activityYearMonth : null,
      // 年度〜四半期
      activity_quarter: activityQuarter ? activityQuarter : null,
      activity_half_year: activityHalfYear ? activityHalfYear : null,
      activity_fiscal_year: selectedFiscalYear ? selectedFiscalYear : null,
      meeting_id: null, //面談作成時用
      property_id: null, //案件作成時用
      quotation_id: null, //見積作成時用
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createActivityMutation.mutate(newActivity);

    // setLoadingGlobalState(false);
  };

  // 🌟案件画面から活動を作成 案件画面で選択したRowデータを使用する
  const handleSaveAndCloseFromProperty = async () => {
    if (!summary) return alert("活動概要を入力してください");
    if (!activityType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataProperty?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataProperty?.contact_id) return alert("担当者情報が存在しません");
    if (!activityDate) return alert("活動日を入力してください");
    if (!activityYearMonth) return alert("活動年月度を入力してください");

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
    if (fiscalEndMonthObjRef.current === null) return alert("決算日データが見つかりませんでした。");

    // 現在の年度を取得
    const selectedFiscalYear = getFiscalYear(
      activityDate,
      fiscalEndMonthObjRef.current.getMonth() + 1,
      fiscalEndMonthObjRef.current.getDate(),
      userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis"
    );
    // 期首を取得
    const fiscalYearStartDate = calculateFiscalYearStart({
      fiscalYearEnd:
        userProfileState.customer_fiscal_end_month ?? new Date(new Date().getFullYear(), 2, 31, 23, 59, 59, 999),
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
        fiscalYearEnd:
          userProfileState?.customer_fiscal_end_month ?? new Date(new Date().getFullYear(), 2, 31, 23, 59, 59, 999),
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
    const _activityMonth = String(activityYearMonth).substring(4);
    const halfDetailValue = firstHalfDetailSet.has(_activityMonth) ? 1 : 2;
    const activityHalfYear = selectedFiscalYear * 10 + halfDetailValue;
    let activityQuarter = 0;
    // 上期ルート
    if (halfDetailValue === 1) {
      // Q1とQ2どちらを選択中か更新
      const firstQuarterSet = new Set([
        String(fiscalMonths.month_01).substring(4),
        String(fiscalMonths.month_02).substring(4),
        String(fiscalMonths.month_03).substring(4),
      ]);
      const quarterValue = firstQuarterSet.has(_activityMonth) ? 1 : 2;
      activityQuarter = selectedFiscalYear * 10 + quarterValue;
    }
    // 下期ルート
    else {
      // Q3とQ4どちらを選択中か更新
      const thirdQuarterSet = new Set([
        String(fiscalMonths.month_07).substring(4),
        String(fiscalMonths.month_08).substring(4),
        String(fiscalMonths.month_09).substring(4),
      ]);
      const quarterValue = thirdQuarterSet.has(_activityMonth) ? 3 : 4;
      activityQuarter = selectedFiscalYear * 10 + quarterValue;
    }

    if (activityQuarter === 0) {
      setLoadingGlobalState(false);
      return alert("会計年度データが取得できませんでした。エラー: INM02");
    }
    if (String(activityHalfYear).length !== 5 || String(activityQuarter).length !== 5) {
      setLoadingGlobalState(false);
      if (String(activityHalfYear).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM03");
      if (String(activityQuarter).length !== 5) return alert("会計年度データが取得できませんでした。エラー: INM04");
    }
    // ------------------ 年月度から年度・半期・四半期を算出 ここまで ------------------

    // 新規作成するデータをオブジェクトにまとめる
    const newActivity = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      // created_by_department_of_user: userProfileState.department ? userProfileState.department : null,
      // created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      // created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      // created_by_department_of_user: departmentId ? departmentId : null,
      // created_by_unit_of_user: unitId ? unitId : null,
      // created_by_office_of_user: officeId ? officeId : null,
      // 営業担当データ
      created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
      created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
      created_by_section_of_user: memberObj.sectionId ? memberObj.sectionId : null,
      created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
      created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
      // 営業担当データここまで
      client_contact_id: selectedRowDataProperty.contact_id,
      client_company_id: selectedRowDataProperty.company_id,
      summary: summary ? summary : null,
      scheduled_follow_up_date: scheduledFollowUpDate ? scheduledFollowUpDate.toISOString() : null,
      // follow_up_flag: followUpFlag ? followUpFlag : null,
      follow_up_flag: followUpFlag,
      document_url: null,
      activity_type: activityType ? activityType : null,
      // claim_flag: claimFlag ? claimFlag : null,
      claim_flag: claimFlag,
      product_introduction1: productIntroduction1 ? productIntroduction1 : null,
      product_introduction2: productIntroduction2 ? productIntroduction2 : null,
      product_introduction3: productIntroduction3 ? productIntroduction3 : null,
      product_introduction4: productIntroduction4 ? productIntroduction4 : null,
      product_introduction5: productIntroduction5 ? productIntroduction5 : null,
      department: departmentName ? departmentName : null,
      business_office: officeName ? officeName : null,
      member_name: memberObj.memberName ? memberObj.memberName : null,
      priority: priority ? priority : null,
      activity_date: activityDate ? activityDate.toISOString() : null,
      activity_year_month: activityYearMonth ? activityYearMonth : null,
      // 年度〜四半期
      activity_quarter: activityQuarter ? activityQuarter : null,
      activity_half_year: activityHalfYear ? activityHalfYear : null,
      activity_fiscal_year: selectedFiscalYear ? selectedFiscalYear : null,
      meeting_id: null, //面談作成時用
      property_id: null, //案件作成時用
      quotation_id: null, //見積作成時用
    };

    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    createActivityMutation.mutate(newActivity);

    // setLoadingGlobalState(false);
  };

  // // 全角文字を半角に変換する関数
  // const toHalfWidth = (strVal: string) => {
  //   // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
  //   return strVal.replace(/[！-～]/g, (match) => {
  //     return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
  //   });
  //   // .replace(/　/g, " "); // 全角スペースを半角スペースに
  // };
  // const toHalfWidthAndSpace = (strVal: string) => {
  //   // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
  //   return strVal
  //     .replace(/[！-～]/g, (match) => {
  //       return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
  //     })
  //     .replace(/　/g, " "); // 全角スペースを半角スペースに
  // };

  // // 昭和や平成、令和の元号を西暦に変換する
  // // const convertJapaneseEraToWesternYear = (value: string) => {
  // //   const eraPatterns = [
  // //     { era: "昭和", startYear: 1925 },
  // //     { era: "平成", startYear: 1988 },
  // //     { era: "令和", startYear: 2018 },
  // //   ];

  // //   for (let pattern of eraPatterns) {
  // //     if (value.includes(pattern.era)) {
  // //       const year = parseInt(value.replace(pattern.era, ""), 10);
  // //       if (!isNaN(year)) {
  // //         return pattern.startYear + year;
  // //       }
  // //     }
  // //   }
  // //   return value;
  // // };

  // type Era = "昭和" | "平成" | "令和";
  // const eras = {
  //   昭和: 1925, // 昭和の開始年 - 1
  //   平成: 1988, // 平成の開始年 - 1
  //   令和: 2018, // 令和の開始年 - 1
  // };
  // // 昭和や平成、令和の元号を西暦に変換する 例："平成4年12月" を "1992年12月" に変換
  // function matchEraToYear(value: string): string {
  //   const pattern = /(?<era>昭和|平成|令和)(?<year>\d+)(?:年)?(?<month>\d+)?/;
  //   const match = pattern.exec(value);

  //   if (!match) return value; // 元号の形式でなければ元の文字列をそのまま返す

  //   const era: Era = match.groups?.era as Era;
  //   const year = eras[era] + parseInt(match.groups?.year || "0", 10);
  //   const month = match.groups?.month ? `${match.groups?.month}月` : "";

  //   return `${year}年${month}`;
  // }

  // // 全角を半角に変換する関数
  // function zenkakuToHankaku(str: string) {
  //   const zen = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
  //   const han = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  //   for (let i = 0; i < zen.length; i++) {
  //     const regex = new RegExp(zen[i], "g");
  //     str = str.replace(regex, han[i]);
  //   }

  //   return str;
  // }

  // // 資本金 100万円の場合は100、18億9,190万円は189190、12,500,000円は1250、のように変換する方法
  // function convertToNumber(inputString: string) {
  //   // 全角数字を半角に変換
  //   inputString = zenkakuToHankaku(inputString);

  //   // 「億」「万」「円」がすべて含まれていなければ変換をスキップ
  //   if (
  //     !inputString.includes("億") &&
  //     !inputString.includes("万") &&
  //     !inputString.includes("円") &&
  //     !inputString.includes(",")
  //   ) {
  //     return inputString;
  //   }

  //   // 億、万、円で分けてそれぞれの数値を取得
  //   const billion = (inputString.includes("億") ? parseInt(inputString.split("億")[0].replace(/,/g, ""), 10) : 0) || 0;
  //   const million =
  //     (inputString.includes("万") && !inputString.includes("億")
  //       ? parseInt(inputString.split("万")[0].replace(/,/g, ""), 10)
  //       : inputString.includes("億") && inputString.includes("万")
  //       ? parseInt(inputString.split("億")[1].split("万")[0].replace(/,/g, ""), 10)
  //       : 0) || 0;
  //   const thousand =
  //     (!inputString.includes("万") && !inputString.includes("億")
  //       ? Math.floor(parseInt(inputString.replace(/,/g, "").replace("円", ""), 10) / 10000)
  //       : 0) || 0;

  //   // 最終的な数値を計算
  //   const total = billion * 10000 + million + thousand;

  //   return total;
  // }

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
    "活動作成モーダル selectedRowDataContact",
    selectedRowDataContact,
    "selectedRowDataActivity",
    selectedRowDataActivity
  );

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
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
          <div className="min-w-[150px] select-none font-bold">活動 作成</div>
          {selectedRowDataContact && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromContact}
            >
              保存
            </div>
          )}
          {selectedRowDataActivity && (
            <div
              className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)]  ${styles.save_text} select-none`}
              onClick={handleSaveAndCloseFromActivity}
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
              {/* 活動日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●活動日</span>
                    <DatePickerCustomInput
                      startDate={activityDate}
                      setStartDate={setActivityDate}
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
              {/* クレーム */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>クレーム</span>

                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        className={`${styles.grid_select_cell_header_input}`}
                        checked={claimFlag}
                        onChange={() => setClaimFlag(!claimFlag)}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
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
              {/* 活動タイプ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●活動タイプ</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box} ${
                        !activityType ? `text-[#9ca3af]` : ``
                      }`}
                      value={activityType}
                      onChange={(e) => {
                        if (e.target.value === "") return alert("活動タイプを選択してください");
                        setActivityType(e.target.value);
                      }}
                    >
                      <option value="">※選択必須　選択してください</option>
                      {optionsActivityType.map((option) => (
                        <option key={option} value={option}>
                          {getActivityType(option)}
                        </option>
                      ))}
                      {/* <option value="TEL発信(不在)">TEL発信(不在)</option>
                      <option value="TEL発信(能動)">TEL発信(能動)</option>
                      <option value="TEL発信(受動)">TEL発信(受動)</option>
                      <option value="TEL発信(売前ﾌｫﾛｰ)">TEL発信(売前ﾌｫﾛｰ)</option>
                      <option value="TEL発信(売後ﾌｫﾛｰ)">TEL発信(売後ﾌｫﾛｰ)</option>
                      <option value="TEL発信(ｱﾎﾟ組み)">TEL発信(ｱﾎﾟ組み)</option>
                      <option value="TEL発信(その他)">TEL発信(その他)</option>
                      <option value="TEL受信(受動)">TEL受信(受動)</option>
                      <option value="TEL受信(問合せ)">TEL受信(問合せ)</option>
                      <option value="Email受信">Email受信</option>
                      <option value="Email送信">Email送信</option>
                      <option value="その他">その他</option>
                      <option value="引継ぎ">引継ぎ</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 優先度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title}`}>優先度</span>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
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
              {/* 次回フォロー予定日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[172px]`}>次回フォロー予定日</span>
                    <DatePickerCustomInput
                      startDate={scheduledFollowUpDate}
                      setStartDate={setScheduledFollowUpDate}
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
              {/* フォロー完了フラグ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title}`}>フォロー完了フラグ</span>

                    {scheduledFollowUpDate && (
                      <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          className={`${styles.grid_select_cell_header_input}`}
                          checked={followUpFlag}
                          onChange={() => setFollowUpFlag(!followUpFlag)}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    )}
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
            {/* 活動概要 */}
            <div className={`${styles.row_area} ${styles.text_area_xl} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} !min-w-[140px]`}>活動概要</span>
                  <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
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
                    <span className={`${styles.title}`}>自社担当</span>
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
              {/* 活動年月度 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>活動年月度</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title}  ${styles.required_title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "活動年月度は決算日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: !!fiscalEndMonthObjRef.current
                            ? `活動日を選択することで活動年月度は自動計算されるため入力は不要です。`
                            : `決算日が未設定の場合は、デフォルトで3月31日が決算日として設定されます。`,
                          content3:
                            "決算日の変更はダッシュボード右上のアカウント設定の「会社・チーム」から変更可能です。",
                          // marginTop: 57,
                          // marginTop: 9,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[9px]`}>●活動年月度</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <div className={`flex min-h-[35px] items-center`}>
                      <p className={`pl-[5px] text-[14px] text-[var(--color-text-under-input)]`}>{activityYearMonth}</p>
                    </div>
                    {/* <input
                      type="number"
                      min="0"
                      className={`${styles.input_box} pointer-events-none`}
                      placeholder='"202109" や "202312" などを入力'
                      value={activityYearMonth === null ? "" : activityYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setActivityYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setActivityYearMonth(0);
                          } else {
                            setActivityYearMonth(numValue);
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
          sectionP1="「自社担当」「事業部」「課・セクション」「係・チーム」「事業所」を変更すると活動データの所有者が変更されます。"
          sectionP2="注：データの所有者を変更すると、この活動結果は変更先のメンバーの集計結果に移行され、分析結果が変更されます。"
          cancelText="戻る"
          submitText="変更する"
          clickEventSubmit={() => {
            // setMemberObj(prevMemberObj);
            setIsOpenConfirmationModal(null);
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
