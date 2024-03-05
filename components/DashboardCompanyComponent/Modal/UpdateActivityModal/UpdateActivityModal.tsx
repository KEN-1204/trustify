import React, { Suspense, useEffect, useRef, useState } from "react";
import styles from "./UpdateActivityModal.module.css";
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
import { Department, Office, Section, Unit } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationModal } from "../SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { ErrorBoundary } from "react-error-boundary";
import { FallbackSideTableSearchMember } from "../UpdateMeetingModal/SideTableSearchMember/FallbackSideTableSearchMember";
import { SideTableSearchMember } from "../UpdateMeetingModal/SideTableSearchMember/SideTableSearchMember";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import useStore from "@/store";
import { ImInfo } from "react-icons/im";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { getActivityType, getPriorityName, optionsActivityType, optionsPriority } from "@/utils/selectOptions";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";

export const UpdateActivityModal = () => {
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const setIsOpenUpdateActivityModal = useDashboardStore((state) => state.setIsOpenUpdateActivityModal);
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

  const initialDate = new Date();
  initialDate.setHours(0, 0, 0, 0);
  const year = initialDate.getFullYear(); // 例: 2023
  const month = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
  const activityYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
  // const [activityDate, setActivityDate] = useState<Date | null>(new Date());
  // const [activityDate, setActivityDate] = useState<Date | null>(initialDate);
  const [activityDate, setActivityDate] = useState<Date | null>(
    selectedRowDataActivity && selectedRowDataActivity.activity_date
      ? new Date(selectedRowDataActivity.activity_date)
      : null
  );
  const [summary, setSummary] = useState("");
  const [scheduledFollowUpDate, setScheduledFollowUpDate] = useState<Date | null>(null);
  const [followUpFlag, setFollowUpFlag] = useState(false);
  const [documentURL, setDocumentURL] = useState("");
  const [activityType, setActivityType] = useState("");
  const [claimFlag, setClaimFlag] = useState(false);
  const [productIntroduction1, setProductIntroduction1] = useState("");
  const [productIntroduction2, setProductIntroduction2] = useState("");
  const [productIntroduction3, setProductIntroduction3] = useState("");
  const [productIntroduction4, setProductIntroduction4] = useState("");
  const [productIntroduction5, setProductIntroduction5] = useState("");
  // const [departmentName, setDepartmentName] = useState(
  //   userProfileState?.department ? userProfileState?.department : ""
  // );
  // const [businessOffice, setBusinessOffice] = useState("");
  // const [departmentId, setDepartmentId] = useState<Department["id"] | null>(
  //   selectedRowDataActivity?.activity_created_by_department_of_user
  //     ? selectedRowDataActivity?.activity_created_by_department_of_user
  //     : null
  // );
  // const [unitId, setUnitId] = useState<Unit["id"] | null>(
  //   selectedRowDataActivity?.activity_created_by_unit_of_user
  //     ? selectedRowDataActivity?.activity_created_by_unit_of_user
  //     : null
  // );
  // const [officeId, setOfficeId] = useState<Office["id"] | null>(
  //   selectedRowDataActivity?.activity_created_by_office_of_user
  //     ? selectedRowDataActivity?.activity_created_by_office_of_user
  //     : null
  // );
  // const [memberName, setMemberName] = useState(
  //   selectedRowDataActivity?.member_name ? selectedRowDataActivity?.member_name : ""
  // );
  // =======営業担当データ
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
    memberName: selectedRowDataActivity?.member_name ? selectedRowDataActivity?.member_name : null,
    memberId: selectedRowDataActivity?.activity_created_by_user_id
      ? selectedRowDataActivity?.activity_created_by_user_id
      : null,
    departmentId: selectedRowDataActivity?.activity_created_by_department_of_user
      ? selectedRowDataActivity?.activity_created_by_department_of_user
      : null,
    sectionId: selectedRowDataActivity?.activity_created_by_section_of_user
      ? selectedRowDataActivity?.activity_created_by_section_of_user
      : null,
    unitId: selectedRowDataActivity?.activity_created_by_unit_of_user
      ? selectedRowDataActivity?.activity_created_by_unit_of_user
      : null,
    officeId: selectedRowDataActivity?.activity_created_by_office_of_user
      ? selectedRowDataActivity?.activity_created_by_office_of_user
      : null,
  };
  const [prevMemberObj, setPrevMemberObj] = useState<MemberDetail>(initialMemberObj);
  const [memberObj, setMemberObj] = useState<MemberDetail>(initialMemberObj);
  // =======営業担当データここまで
  const [priority, setPriority] = useState("");
  const [activityYearMonth, setActivityYearMonth] = useState<number | null>(Number(activityYearMonthInitialValue));
  // ユーザーの決算月と締め日を取得
  const fiscalEndMonthObjRef = useRef<Date | null>(null);
  const closingDayRef = useRef<number | null>(null);

  // const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const { updateActivityMutation } = useMutateActivity();

  // ================================ 🌟事業部、係、事業所リスト取得useQuery🌟 ================================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ================================ ✅事業部、係、事業所リスト取得useQuery✅ ================================

  // 初回マウント時に選択中の担当者&会社の列データの情報をStateに格納
  useEffect(() => {
    if (!selectedRowDataActivity) return;

    let _activity_created_by_user_id = selectedRowDataActivity.activity_created_by_user_id
      ? selectedRowDataActivity.activity_created_by_user_id
      : null;
    let _activity_created_by_department_of_user = selectedRowDataActivity.activity_created_by_department_of_user
      ? selectedRowDataActivity.activity_created_by_department_of_user
      : null;
    let _activity_created_by_section_of_user = selectedRowDataActivity.activity_created_by_section_of_user
      ? selectedRowDataActivity.activity_created_by_section_of_user
      : null;
    let _activity_created_by_unit_of_user = selectedRowDataActivity.activity_created_by_unit_of_user
      ? selectedRowDataActivity.activity_created_by_unit_of_user
      : null;
    let _activity_created_by_office_of_user = selectedRowDataActivity.activity_created_by_office_of_user
      ? selectedRowDataActivity.activity_created_by_office_of_user
      : null;
    const selectedInitialActivityDate = selectedRowDataActivity.activity_date
      ? new Date(selectedRowDataActivity.activity_date)
      : null;
    const selectedYear = initialDate.getFullYear(); // 例: 2023
    const selectedMonth = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
    const selectedYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
    let _activity_date = selectedInitialActivityDate;
    // let _activity_date = selectedRowDataActivity.activity_date ? new Date(selectedRowDataActivity.activity_date) : null;
    let _summary = selectedRowDataActivity.summary ? selectedRowDataActivity.summary : "";
    let _scheduled_follow_up_date = selectedRowDataActivity.scheduled_follow_up_date
      ? new Date(selectedRowDataActivity.scheduled_follow_up_date)
      : null;
    let _follow_up_flag = selectedRowDataActivity.follow_up_flag ? selectedRowDataActivity.follow_up_flag : false;
    let _document_url = selectedRowDataActivity.document_url ? selectedRowDataActivity.document_url : "";
    let _activity_type = selectedRowDataActivity.activity_type ? selectedRowDataActivity.activity_type : "";
    let _claim_flag = selectedRowDataActivity.claim_flag ? selectedRowDataActivity.claim_flag : false;
    let _product_introduction1 = selectedRowDataActivity.product_introduction1
      ? selectedRowDataActivity.product_introduction1
      : "";
    let _product_introduction2 = selectedRowDataActivity.product_introduction2
      ? selectedRowDataActivity.product_introduction2
      : "";
    let _product_introduction3 = selectedRowDataActivity.product_introduction3
      ? selectedRowDataActivity.product_introduction3
      : "";
    let _product_introduction4 = selectedRowDataActivity.product_introduction4
      ? selectedRowDataActivity.product_introduction4
      : "";
    let _product_introduction5 = selectedRowDataActivity.product_introduction5
      ? selectedRowDataActivity.product_introduction5
      : "";
    // let _department = selectedRowDataActivity.department ? selectedRowDataActivity.department : "";
    // let _business_office = selectedRowDataActivity.business_office ? selectedRowDataActivity.business_office : "";
    let _department = selectedRowDataActivity.activity_created_by_department_of_user
      ? selectedRowDataActivity.activity_created_by_department_of_user
      : "";
    let _section = selectedRowDataActivity.activity_created_by_section_of_user
      ? selectedRowDataActivity.activity_created_by_section_of_user
      : "";
    let _unit = selectedRowDataActivity.activity_created_by_unit_of_user
      ? selectedRowDataActivity.activity_created_by_unit_of_user
      : "";
    let _business_office = selectedRowDataActivity.activity_created_by_office_of_user
      ? selectedRowDataActivity.activity_created_by_office_of_user
      : "";
    let _member_name = selectedRowDataActivity.member_name ? selectedRowDataActivity.member_name : "";
    let _priority = selectedRowDataActivity.priority ? selectedRowDataActivity.priority : "";
    let _activity_year_month = selectedRowDataActivity.activity_year_month
      ? selectedRowDataActivity.activity_year_month
      : Number(selectedYearMonthInitialValue);
    setActivityDate(_activity_date);
    setSummary(_summary);
    setScheduledFollowUpDate(_scheduled_follow_up_date);
    setFollowUpFlag(_follow_up_flag);
    setDocumentURL(_document_url);
    setActivityType(_activity_type);
    setClaimFlag(_claim_flag);
    setProductIntroduction1(_product_introduction1);
    setProductIntroduction2(_product_introduction2);
    setProductIntroduction3(_product_introduction3);
    setProductIntroduction4(_product_introduction4);
    setProductIntroduction5(_product_introduction5);
    // setDepartmentId(_department);
    // setUnitId(_unit);
    // setOfficeId(_business_office);
    // setMemberName(_member_name);
    const memberDetail = {
      memberId: _activity_created_by_user_id,
      memberName: _member_name,
      departmentId: _activity_created_by_department_of_user,
      sectionId: _activity_created_by_section_of_user,
      unitId: _activity_created_by_unit_of_user,
      officeId: _activity_created_by_office_of_user,
    };
    setMemberObj(memberDetail);
    setPrevMemberObj(memberDetail);
    setPriority(_priority);
    setActivityYearMonth(_activity_year_month);
  }, []);

  // 🌟ユーザーの決算月の締め日を初回マウント時に取得
  useEffect(() => {
    // ユーザーの決算月から締め日を取得、決算つきが未設定の場合は現在の年と3月31日を設定
    const fiscalEndMonth = userProfileState?.customer_fiscal_end_month
      ? new Date(userProfileState.customer_fiscal_end_month)
      : new Date(new Date().getFullYear(), 2, 31);
    const closingDay = fiscalEndMonth.getDate(); //ユーザーの締め日
    fiscalEndMonthObjRef.current = fiscalEndMonth; //refに格納
    closingDayRef.current = closingDay; //refに格納
  }, []);

  // ----------------------------- 🌟年月度自動計算🌟 -----------------------------
  // 🌟結果面談日を更新したら面談年月度をユーザーの締め日に応じて更新するuseEffect
  // ユーザーの財務サイクルに合わせて面談年月度を自動的に取得する関数(決算月の締め日の翌日を新たな月度の開始日とする)
  useEffect(() => {
    // 更新はresultDateの面談日(結果)で計算を行う
    if (!activityDate || !closingDayRef.current) {
      // setMeetingYearMonth(null);
      setActivityYearMonth(
        selectedRowDataActivity?.activity_year_month ? selectedRowDataActivity?.activity_year_month : null
      );
      return;
    }
    // 面談予定日の年と日を取得
    let year = activityDate.getFullYear(); // 例: 2023
    let month = activityDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整

    console.log("決算月", fiscalEndMonthObjRef.current);
    console.log("締め日", closingDayRef.current);
    console.log("activityDate", activityDate);
    console.log("year", year);
    console.log("month", month);

    // 面談日の締め日の翌日以降の場合、次の月度とみなす
    if (activityDate.getDate() > closingDayRef.current) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    // 年月度を6桁の数値で表現
    const fiscalYearMonth = year * 100 + month;
    console.log("fiscalYearMonth", fiscalYearMonth);
    setActivityYearMonth(fiscalYearMonth);
  }, [activityDate]);
  // ----------------------------- ✅年月度自動計算✅ -----------------------------

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenUpdateActivityModal(false);
  };
  // ------------------------ 🌟更新実行🌟 ------------------------
  const handleSaveAndClose = async () => {
    if (!summary) return alert("活動概要を入力してください");
    if (!activityType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataActivity?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataActivity?.contact_id) return alert("担当者情報が存在しません");

    setLoadingGlobalState(true);

    // 部署名と事業所名を取得
    const departmentName =
      departmentDataArray &&
      memberObj.memberId &&
      departmentDataArray.find((obj) => obj.id === memberObj.memberId)?.department_name;
    const officeName =
      officeDataArray &&
      memberObj.officeId &&
      officeDataArray.find((obj) => obj.id === memberObj.officeId)?.office_name;

    // 新規作成するデータをオブジェクトにまとめる
    const newActivity = {
      id: selectedRowDataActivity.activity_id,
      created_by_company_id: selectedRowDataActivity?.activity_created_by_company_id
        ? selectedRowDataActivity.activity_created_by_company_id
        : null,
      // created_by_department_of_user: selectedRowDataActivity.activity_created_by_department_of_user
      //   ? selectedRowDataActivity.activity_created_by_department_of_user
      //   : null,
      // created_by_unit_of_user: selectedRowDataActivity?.activity_created_by_unit_of_user
      //   ? selectedRowDataActivity.activity_created_by_unit_of_user
      //   : null,

      created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
      created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
      created_by_section_of_user: memberObj.sectionId ? memberObj.sectionId : null,
      created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
      created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
      //   created_by_user_id: selectedRowDataActivity?.activity_created_by_user_id
      //     ? selectedRowDataActivity.activity_created_by_user_id
      //     : null,
      // created_by_department_of_user: departmentId ? departmentId : null,
      // created_by_unit_of_user: unitId ? unitId : null,
      // created_by_office_of_user: officeId ? officeId : null,
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
      // department: departmentName ? departmentName : null,
      // business_office: businessOffice ? businessOffice : null,
      department: departmentName ? departmentName : null,
      business_office: officeName ? officeName : null,
      // member_name: memberName ? memberName : null,
      member_name: memberObj?.memberName ? memberObj?.memberName : null,
      priority: priority ? priority : null,
      activity_date: activityDate ? activityDate.toISOString() : null,
      activity_year_month: activityYearMonth ? activityYearMonth : null,
      meeting_id: selectedRowDataActivity.meeting_id ? selectedRowDataActivity.meeting_id : null,
      property_id: selectedRowDataActivity.property_id ? selectedRowDataActivity.property_id : null,
      quotation_id: selectedRowDataActivity.quotation_id ? selectedRowDataActivity.quotation_id : null,
    };

    // supabaseにUPDATE
    updateActivityMutation.mutate(newActivity);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenUpdateActivityModal(false);
  };
  // ------------------------ ✅更新実行✅ ------------------------

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

  console.log("活動作成モーダル selectedRowDataActivity", selectedRowDataActivity);

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
          <div className="min-w-[150px] select-none font-bold">活動 編集</div>
          <div
            className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
            onClick={handleSaveAndClose}
          >
            保存
          </div>
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
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={activityType}
                      onChange={(e) => {
                        if (e.target.value === "") return alert("活動タイプを選択してください");
                        setActivityType(e.target.value);
                      }}
                    >
                      <option value=""></option>
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
                      {/* <option value="面談・訪問">面談・訪問</option>
                      <option value="見積">見積</option>
                      <option value="案件発生">案件発生</option> */}
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

          {/* 事業部・課・係・事業所・担当者名・活動年月度 */}
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
          {/* 事業部・課・係・事業所・担当者名・活動年月度ここまで */}

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
              prevMemberObj={prevMemberObj}
              setPrevMemberObj={setPrevMemberObj}
              memberObj={memberObj}
              setMemberObj={setMemberObj}
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </>
  );
};
