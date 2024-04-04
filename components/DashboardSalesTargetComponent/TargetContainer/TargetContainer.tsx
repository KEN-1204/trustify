import styles from "../DashboardSalesTargetComponent.module.css";
import { CSSProperties, FC, Suspense, useEffect, useMemo, useRef, useState } from "react";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { FallbackContainerSalesTarget } from "./SalesTargetsContainer/FallbackContainerSalesTarget";
import { SalesTargetsContainer } from "./SalesTargetsContainer/SalesTargetsContainer";
import { FiPlus } from "react-icons/fi";
import {
  Department,
  MemberAccounts,
  MemberObj,
  Office,
  PopupDescMenuParams,
  Section,
  SectionMenuParams,
  Unit,
  UserProfileCompanySubscription,
} from "@/types";
import { MdOutlineDataSaverOff } from "react-icons/md";
import { FaExchangeAlt } from "react-icons/fa";
import { calculateCurrentFiscalYear } from "@/utils/Helpers/calculateCurrentFiscalYear";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { calculateCurrentFiscalYearEndDate } from "@/utils/Helpers/calcurateCurrentFiscalYearEndDate";
import { format, isWithinInterval, subMonths } from "date-fns";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQuerySections } from "@/hooks/useQuerySections";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { RxDot } from "react-icons/rx";
import { mappingDescriptions, mappingPopupTitle } from "./dataTarget";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { calculateFiscalYearMonths } from "@/utils/Helpers/CalendarHelpers/calculateFiscalMonths";
import { mappingEntityName } from "@/utils/mappings";
import { BsCheck2 } from "react-icons/bs";
import { FallbackSideTableSearchMember } from "@/components/DashboardCompanyComponent/Modal/UpdateMeetingModal/SideTableSearchMember/FallbackSideTableSearchMember";
import { SideTableSearchMember } from "@/components/DashboardCompanyComponent/Modal/UpdateMeetingModal/SideTableSearchMember/SideTableSearchMember";
import { UpsertTarget } from "./UpsertTarget/UpsertTarget";
import { FallbackTargetContainer } from "./FallbackTargetContainer";
import { UpsertTargetEntity } from "./UpsertTargetEntity/UpsertTargetEntity";
import { useQueryFiscalYears } from "@/hooks/useQueryFiscalYears";

export const TargetContainer = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // ハーフとallの時はheight指定を無しにして、コンテンツ全体を表示できるようにする
  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  // 目標設定モード
  const upsertTargetMode = useDashboardStore((state) => state.upsertTargetMode);
  const setUpsertTargetMode = useDashboardStore((state) => state.setUpsertTargetMode);
  // 目標設定時の年度・エンティティオブジェクト
  const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  const setUpsertTargetObj = useDashboardStore((state) => state.setUpsertTargetObj);
  // 目標設定時の上位エンティティと紐づく設定対象の下位エンティティ配列・年度オブジェクト
  const upsertSettingEntitiesObj = useDashboardStore((state) => state.upsertSettingEntitiesObj);
  const setUpsertSettingEntitiesObj = useDashboardStore((state) => state.setUpsertSettingEntitiesObj);

  // 自社担当検索サイドテーブル開閉
  const [isOpenSearchMemberSideTableBefore, setIsOpenSearchMemberSideTableBefore] = useState(false);
  const [isOpenSearchMemberSideTable, setIsOpenSearchMemberSideTable] = useState(false);
  // 担当者検索サイドテーブルに渡すオブジェクトを切り替える関数
  const [sideTableState, setSideTableState] = useState("member");
  const getMemberObj = (title: string) => {
    switch (title) {
      case "member":
        return {
          memberObj: selectedMemberObj,
          setMemberObj: setSelectedMemberObj,
          prevMemberObj: selectedMemberObj,
          setPrevMemberObj: setPrevSelectedMemberObj,
        };
        break;

      default:
        return {
          memberObj: selectedMemberObj,
          setMemberObj: setSelectedMemberObj,
          prevMemberObj: selectedMemberObj,
          setPrevMemberObj: setPrevSelectedMemberObj,
        };
        break;
    }
  };

  if (!userProfileState) return;
  if (!userProfileState.company_id) return;

  // ================================ 🌟設定済み年度useQuery🌟 ================================
  const {
    data: targetFiscalYears,
    isLoading: isLoadingQueryFiscalYears,
    isError: isErrorQueryFiscalYear,
  } = useQueryFiscalYears(userProfileState?.company_id, "sales_target", true);
  // key: 年度、value: オブジェクトのMapオブジェクト
  const targetFiscalYearsMap = useMemo(() => {
    if (!targetFiscalYears || targetFiscalYears?.length === 0) return null;
    return new Map(targetFiscalYears.map((obj) => [obj.fiscal_year, obj]));
  }, [targetFiscalYears]);
  // console.log("🌃🌃🌃🌃🌃🌃targetFiscalYearsMap", targetFiscalYearsMap, "targetFiscalYears", targetFiscalYears);

  // ================================ 🌟設定済み年度useQuery🌟 ================================

  // ================================ 🌟事業部リスト取得useQuery🌟 ================================
  const {
    data: departmentDataArray,
    isLoading: isLoadingQueryDepartment,
    refetch: refetchQUeryDepartments,
  } = useQueryDepartments(userProfileState?.company_id, true);

  // 事業部のMapオブジェクト
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟課・セクションリスト取得useQuery🌟 ================================
  const {
    data: sectionDataArray,
    isLoading: isLoadingQuerySection,
    refetch: refetchQUerySections,
  } = useQuerySections(userProfileState?.company_id, true);
  // console.log("unitDataArray", unitDataArray);

  // useMutation
  // const { createUnitMutation, updateUnitFieldMutation, updateMultipleUnitFieldsMutation, deleteUnitMutation } =
  // useMutateUnit();
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

  // 「事業部」「課・セクション」「係・チーム」「事業所」のid to objectオブジェクトマップ生成
  // 事業部マップ {id: 事業部オブジェクト}
  const departmentIdToObjMap = useMemo(() => {
    if (!departmentDataArray?.length) return null;
    const departmentMap = new Map(departmentDataArray.map((obj) => [obj.id, obj]));
    return departmentMap;
  }, [departmentDataArray]);
  // 課・セクションマップ {id: 課・セクションオブジェクト}
  const sectionIdToObjMap = useMemo(() => {
    if (!sectionDataArray?.length) return null;
    const sectionMap = new Map(sectionDataArray.map((obj) => [obj.id, obj]));
    return sectionMap;
  }, [sectionDataArray]);
  // 係マップ {id: 係オブジェクト}
  const unitIdToObjMap = useMemo(() => {
    if (!unitDataArray?.length) return null;
    const unitMap = new Map(unitDataArray.map((obj) => [obj.id, obj]));
    return unitMap;
  }, [unitDataArray]);
  // 事業所マップ {id: 事業所オブジェクト}
  const officeIdToObjMap = useMemo(() => {
    if (!officeDataArray?.length) return null;
    const officeMap = new Map(officeDataArray.map((obj) => [obj.id, obj]));
    return officeMap;
  }, [officeDataArray]);

  // 事業部~事業所までは変更する際に、エンティティ名を選択した後にactiveDisplayTabsを更新するため一旦ローカルでエンティティタイプを保持するためのstate
  const [activeEntityLocal, setActiveEntityLocal] = useState<{
    entityLevel: string;
    entityName: string;
    entityId: string;
  } | null>(null);

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const initialMemberObj = {
    memberId: userProfileState?.id ? userProfileState?.id : null,
    memberName: userProfileState?.profile_name ? userProfileState?.profile_name : null,
    departmentId: userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null,
    sectionId: userProfileState?.assigned_section_id ? userProfileState?.assigned_section_id : null,
    unitId: userProfileState?.assigned_unit_id ? userProfileState?.assigned_unit_id : null,
    officeId: userProfileState?.assigned_office_id ? userProfileState?.assigned_office_id : null,
    signature_stamp_id: userProfileState?.assigned_signature_stamp_id
      ? userProfileState?.assigned_signature_stamp_id
      : null,
    signature_stamp_url: userProfileState?.assigned_signature_stamp_url
      ? userProfileState?.assigned_signature_stamp_url
      : null,
  } as MemberObj;
  const [selectedMemberObj, setSelectedMemberObj] = useState<MemberObj>(initialMemberObj);
  const [prevSelectedMemberObj, setPrevSelectedMemberObj] = useState<MemberObj>(initialMemberObj);

  // サイドテーブルでメンバーが選択・変更された時にactiveEntityLocalにセットするuseEffect
  useEffect(() => {
    if (!selectedMemberObj.memberId || !selectedMemberObj.memberName) return;
    // メンバーが保持されてる状態で変更を検知した場合はsetActiveEntityLocalでstateを変更する
    setActiveEntityLocal({
      entityLevel: "member",
      entityId: selectedMemberObj.memberId,
      entityName: selectedMemberObj.memberName,
    });
  }, [selectedMemberObj]);

  // ======================= 🌟現在の選択した事業部で課・セクションを絞り込むuseEffect🌟 =======================
  const [filteredSectionBySelectedDepartment, setFilteredSectionBySelectedDepartment] = useState<Section[]>([]);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================
  // ======================= 🌟現在の選択した事業部で課・セクションを絞り込むuseEffect🌟 =======================
  // const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Unit[]>([]);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // 🔹メイン目標のエンティティ
  const mainEntityTarget = useDashboardStore((state) => state.mainEntityTarget);
  const setMainEntityTarget = useDashboardStore((state) => state.setMainEntityTarget);
  // 🔹表示中の会計年度
  const selectedFiscalYearTarget = useDashboardStore((state) => state.selectedFiscalYearTarget);
  const setSelectedFiscalYearTarget = useDashboardStore((state) => state.setSelectedFiscalYearTarget);
  // 🔹売上目標・プロセス目標
  const [activeTargetTab, setActiveTargetTab] = useState("Sales");

  // ---------------------- 変数 ----------------------
  // 🔹ユーザーが作成したエンティティのみのセクションリストを再生成
  const entityLevelList: {
    title: string;
    name: {
      [key: string]: string;
    };
  }[] = useMemo(() => {
    let newEntityList = [{ title: "company", name: { ja: "全社", en: "Company" } }];
    if (departmentDataArray && departmentDataArray.length > 0) {
      newEntityList.push({ title: "department", name: { ja: "事業部", en: "Department" } });
    }
    if (sectionDataArray && sectionDataArray.length > 0) {
      newEntityList.push({ title: "section", name: { ja: "課・セクション", en: "Section" } });
    }
    if (unitDataArray && unitDataArray.length > 0) {
      newEntityList.push({ title: "unit", name: { ja: "係・チーム", en: "Unit" } });
    }
    // メンバーは必ず追加
    newEntityList.push({ title: "member", name: { ja: "メンバー", en: "Member" } });
    if (officeDataArray && officeDataArray.length > 0) {
      newEntityList.push({ title: "office", name: { ja: "事業所", en: "Office" } });
    }
    return newEntityList;
  }, [departmentDataArray, sectionDataArray, unitDataArray, officeDataArray]);

  // メンバーエンティティの直属の親エンティティ 組織の末端のエンティティを特定
  // 🌟ユーザーが作成したエンティティリストに合わせてUpsert時の「年度・半期」と「四半期・月度」の目標入力条件を変更する
  // メンバーエンティティの親のエンティティを特定して、メンバーエンティティと親のエンティティが「四半期・月度」を入力する
  // つまり、メンバーを除くエンティティの中で末端のエンティティを特定する
  // 事業所が末端になるのは、事業部も課も係も存在しなかった場合のみに限る => 一旦事業所は独立させる
  const endEntity = useMemo(() => {
    const entityList = entityLevelList.map((entity) => entity.title);
    let endEntityLevel = "company";
    if (entityList.includes("department")) endEntityLevel = "department";
    if (entityList.includes("section")) endEntityLevel = "section";
    if (entityList.includes("unit")) endEntityLevel = "unit";
    // department, section, unitが作成されずに事業所エンティティのみ作成されている場合はofficeを割り当てる
    if (!["department", "section", "unit"].includes(endEntityLevel) && entityList.includes("office")) {
      endEntityLevel = "office";
    }
    return endEntityLevel;
  }, [entityLevelList]);

  // 🔹現在の会計年度
  const currentFiscalYear = useMemo(
    () =>
      calculateCurrentFiscalYear({
        fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
        fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? null,
      }),
    []
  );

  // 🔹決算日Date(現在の会計年度の決算日Date) 決算日を取得して変数に格納
  const fiscalYearEndDate = useMemo(() => {
    return (
      calculateCurrentFiscalYearEndDate({
        fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
        selectedYear: selectedFiscalYearTarget ?? currentFiscalYear,
      }) ?? new Date(new Date().getFullYear(), 2, 31)
    );
  }, [userProfileState?.customer_fiscal_end_month, selectedFiscalYearTarget]);

  // 🔹現在の会計年度の期首(現在の日付からユーザーの会計年度を取得)
  const currentFiscalYearDateObj = useMemo(() => {
    return (
      calculateFiscalYearStart({
        fiscalYearEnd: fiscalYearEndDate,
        fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis",
        selectedYear: selectedFiscalYearTarget ?? currentFiscalYear,
      }) ?? new Date()
    );
  }, [fiscalYearEndDate, userProfileState?.customer_fiscal_year_basis]);

  // 🔹ユーザーの会計年度の期首と期末の年月(カレンダー年月)
  const fiscalYearStartEndDate = useDashboardStore((state) => state.fiscalYearStartEndDate);
  const setFiscalYearStartEndDate = useDashboardStore((state) => state.setFiscalYearStartEndDate);
  // 🔹現在の顧客の会計年月度 202303
  const currentFiscalStartYearMonth = useDashboardStore((state) => state.currentFiscalStartYearMonth);
  const setCurrentFiscalStartYearMonth = useDashboardStore((state) => state.setCurrentFiscalStartYearMonth);
  // 🔹売上目標・前年度売上フェッチ時の年月度の12ヶ月分の配列
  const annualFiscalMonths = useDashboardStore((state) => state.annualFiscalMonths);
  const setAnnualFiscalMonths = useDashboardStore((state) => state.setAnnualFiscalMonths);
  const setLastAnnualFiscalMonths = useDashboardStore((state) => state.setLastAnnualFiscalMonths);

  // 🌟Zustandにセット 顧客の期首と期末のDateオブジェクト + 顧客の開始年月度 + 会計年度をセット🌟
  useEffect(() => {
    // 🔹🔹ユーザーの会計年度の期首と期末の年月がまだ未セットか、現在の会計年度が変更されたら
    if (
      fiscalYearStartEndDate === null ||
      currentFiscalYearDateObj.getTime() !== fiscalYearStartEndDate.startDate.getTime()
    ) {
      // 🔸顧客の期首と期末のDateオブジェクトをセット
      setFiscalYearStartEndDate({ startDate: currentFiscalYearDateObj, endDate: fiscalYearEndDate });

      // 🔸会計年度をセット
      setSelectedFiscalYearTarget(currentFiscalYearDateObj.getFullYear());

      // 🔸顧客の選択している会計年度の開始年月度
      const newStartYearMonth = calculateDateToYearMonth(currentFiscalYearDateObj, fiscalYearEndDate.getDate());
      setCurrentFiscalStartYearMonth(newStartYearMonth);

      // 🔸年度初めから12ヶ月分の年月度の配列
      const fiscalMonths = calculateFiscalYearMonths(newStartYearMonth);
      setAnnualFiscalMonths(fiscalMonths);
      // 🔸前年度の年度初めから12ヶ月分の年月度の配列
      const lastStartYearMonth = newStartYearMonth - 100;
      const lastFiscalMonths = calculateFiscalYearMonths(lastStartYearMonth);
      setLastAnnualFiscalMonths(lastFiscalMonths);

      console.log(
        "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 ",
        "🔹現在の会計年度の期首(現在の日付からユーザーの会計年度を取得)start",
        format(currentFiscalYearDateObj, "yyy/MM/dd HH:mm:ss"),
        "🔹決算日Date(現在の会計年度の決算日Date)end",
        format(fiscalYearEndDate, "yyy/MM/dd HH:mm:ss"),
        "決算日年月",
        fiscalYearEndDate.getFullYear() * 100 + fiscalYearEndDate.getMonth() + 1,
        "顧客の選択している会計年度の開始年月度 newStartYearMonth",
        newStartYearMonth,
        "1年分の年月度 fiscalMonths",
        fiscalMonths,
        "前年度の1年分の年月度 lastStartYearMonth",
        lastStartYearMonth,
        "前年度の12ヶ月分",
        lastFiscalMonths
      );
    }
  }, [currentFiscalYearDateObj]);

  // 選択年オプション(現在の年から3年遡る, 1年後は決算日まで３ヶ月を切った場合は選択肢に入れる)
  // const [optionsFiscalYear, setOptionsFiscalYear] = useState<{ label: string; value: number }[]>([]);
  const optionsFiscalYear = useDashboardStore((state) => state.optionsFiscalYear);
  const setOptionsFiscalYear = useDashboardStore((state) => state.setOptionsFiscalYear);

  // 選択中の会計年度ローカルstate
  const [selectedFiscalYearLocal, setSelectedFiscalYearLocal] = useState(currentFiscalYearDateObj.getFullYear());

  // -------------------------- 🌟年度の選択肢を作成🌟 --------------------------
  useEffect(() => {
    if (!fiscalYearEndDate || !userProfileState) {
      return;
    }
    // const currentYear = selectedFiscalYearSetting;
    // const currentYear = getYear(new Date());
    // 現在の会計年度を取得
    const currentYear = calculateCurrentFiscalYear({
      fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
      fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? null,
      // selectedYear: selectedFiscalYearSetting,
    });
    // // 2020年度から現在+翌年度までの選択肢を生成
    let y = 2020;
    let years = [];
    while (y <= currentYear) {
      years.push(y);
      y += 1;
    }
    // let years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];
    const currentFiscalYearEndDate = calculateCurrentFiscalYearEndDate({
      fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
    });
    if (!currentFiscalYearEndDate) {
      // 年度を選択肢として指定
      // const yearOptions = years.map((year) => ({
      //   label: `${year}年度`,
      //   value: year,
      // }));

      // console.log("yearOptions", yearOptions);

      // stateにオプションを追加
      // setOptionsFiscalYear(yearOptions);
      setOptionsFiscalYear(years);
      return;
    }

    // 現在の日付が決算日から３ヶ月以内かどうかをチェック subMonths: 特定のDateから3ヶ月前の日付を計算
    const threeMonthsBeforeFiscalEnd = subMonths(currentFiscalYearEndDate, 3);

    // isWithinInterval: 第一引数に指定された日付が、第二引数に指定された期間内にあるかどうかを真偽値で返す
    const isWithin3Months = isWithinInterval(new Date(), {
      start: threeMonthsBeforeFiscalEnd,
      end: currentFiscalYearEndDate,
    });

    console.log(
      "subMonths結果 isWithin3Months",
      isWithin3Months,
      "threeMonthsBeforeFiscalEnd",
      format(threeMonthsBeforeFiscalEnd, "yyyy-MM-dd HH:mm:ss"),
      "currentFiscalYearEndDate",
      format(currentFiscalYearEndDate, "yyyy-MM-dd HH:mm:ss")
    );

    if (isWithin3Months) {
      // ３ヶ月以内であれば翌年度も追加
      years.push(currentYear + 1);
    }

    // 年度を選択肢として指定
    // const yearOptions = years.map((year) => ({
    //   label: `${year}年度`,
    //   value: year,
    // }));

    // console.log("yearOptions", yearOptions);

    // stateにオプションを追加
    // setOptionsFiscalYear(yearOptions);
    setOptionsFiscalYear(years);
  }, []);
  // -------------------------- ✅年度の選択肢を作成✅ --------------------------

  // -------------------------- Zustandメイン目標をセット --------------------------
  useEffect(() => {
    if (mainEntityTarget !== null) return;
    if (!userProfileState) return;
    if (!userProfileState.company_id) return;
    if (!userProfileState.customer_name) return;
    setMainEntityTarget({
      entityId: userProfileState.company_id,
      entityName: userProfileState.customer_name,
      entityLevel: "company",
    });
  }, []);
  // -------------------------- Zustandメイン目標をセット ここまで --------------------------
  // ---------------------- 変数 ここまで ----------------------

  // --------------------- ポップアップメニュー関連 ---------------------
  const sectionMenuRef = useRef<HTMLDivElement | null>(null);

  // ---------------------🔹ポップアップメニュー
  const [openSectionMenu, setOpenSectionMenu] = useState<{
    x?: number;
    y: number;
    title?: string;
    displayX?: string;
    maxWidth?: number;
    minWidth?: number;
    fadeType?: string;
  } | null>(null);
  // 適用、戻るメニュー
  const [openSubMenu, setOpenSubMenu] = useState<{
    display: string;
    fadeType: string;
    sectionMenuWidth?: number;
  } | null>(null);

  const handleOpenSectionMenu = ({ e, title, displayX, maxWidth, minWidth, fadeType }: SectionMenuParams) => {
    if (!displayX || displayX === "center") {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      const positionY = y + height + 6;
      let positionX = x;
      if (displayX === "center") positionX = x + width / 2;
      console.log("クリック", y, x, positionX);
      setOpenSectionMenu({
        y: positionY,
        x: positionX,
        title: title,
        displayX: displayX,
        fadeType: fadeType,
        maxWidth: maxWidth,
        minWidth: minWidth,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      let positionY = y;
      if (displayX === "right") {
        positionX = -18 - 50 - (maxWidth ?? 400);
      } else if (displayX === "left") {
        positionX = window.innerWidth - x;
      } else if (displayX === "bottom_left") {
        positionX = window.innerWidth - x - width;
        positionY = y + height + 6;
      }
      // positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      // positionX = displayX === "left" ? window.innerWidth - x : 0;
      // positionX = displayX === "bottom_left" ? window.innerWidth - x - width : 0;
      // positionY = displayX === "bottom_left" ? y + height : y;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenSectionMenu({
        x: positionX,
        y: positionY,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        minWidth: minWidth,
        fadeType: fadeType,
      });
    }
  };
  // メニューを閉じる
  const handleCloseSectionMenu = () => {
    if (openSectionMenu?.title === "settingSalesTarget") {
      setOpenPopupMenu(null);
      setOpenSubMenu(null);
      setActiveEntityLocal(null);
    }

    setOpenSectionMenu(null);
  };

  // ---------------------🔹説明メニュー
  // 説明メニュー(onClickイベントで開いてホバー可能な状態はisHoverableをtrueにする)
  const [openPopupMenu, setOpenPopupMenu] = useState<{
    x?: number;
    y: number;
    title: string;
    displayX?: string;
    maxWidth?: number;
    minWidth?: number;
    fadeType?: string;
    isHoverable?: boolean;
    sectionMenuWidth?: number;
  } | null>(null);

  const handleOpenPopupMenu = ({
    e,
    title,
    displayX,
    maxWidth,
    minWidth,
    fadeType,
    isHoverable,
    sectionMenuWidth,
  }: PopupDescMenuParams) => {
    if (!displayX) {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      const positionY = y + height + 6;
      const positionCenter = x;
      console.log("クリック", y);
      setOpenPopupMenu({
        y: positionY,
        x: positionCenter,
        title: title,
        fadeType: fadeType,
        isHoverable: isHoverable,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      let positionY = y;
      if (displayX === "right") {
        positionX = -18 - 50 - (maxWidth ?? 400);
      } else if (displayX === "left") {
        positionX = window.innerWidth - x + 6;
      } else if (displayX === "bottom_left" && sectionMenuWidth) {
        positionX = window.innerWidth - x - width + sectionMenuWidth + 6;
        positionY = y + height + 6;
      }
      // positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      // positionX = displayX === "left" ? window.innerWidth - x : 0;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenPopupMenu({
        x: positionX,
        y: positionY,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        minWidth: minWidth,
        fadeType: fadeType,
        isHoverable: isHoverable,
      });
    }
  };

  // メニューを閉じる
  const handleClosePopupMenu = () => {
    setOpenPopupMenu(null);
  };
  // --------------------- ポップアップメニュー関連 ここまで ---------------------
  // --------------------- メニュー liコンテンツ挿入用 ---------------------
  type DescriptionProps = { title?: string; content: string; content2?: string; withDiv?: boolean };
  const DescriptionList = ({ title, content, content2, withDiv = true }: DescriptionProps) => {
    return (
      <>
        {title && (
          <li className={`${styles.description_section_title} flex min-h-max w-full font-bold`}>
            <div className="flex max-w-max flex-col">
              <span>{title}</span>
              <div className={`${styles.underline} w-full`} />
            </div>
          </li>
        )}
        <li className={`${styles.description_list_item} flex  w-full flex-col space-y-1 `}>
          <p className="select-none whitespace-pre-wrap text-[12px] leading-[20px]">{content}</p>
          {content2 && <p className="select-none whitespace-pre-wrap text-[12px] leading-[20px]">{content2}</p>}
        </li>

        {withDiv && <hr className="min-h-[1px] w-full bg-[#999]" />}
      </>
    );
  };
  // --------------------- メニュー liコンテンツ挿入用 ここまで ---------------------

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    marginTop = 0,
    itemsPosition = "center",
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);

    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content,
      content2: content2,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPos) setHoveredItemPos(null);
  };
  // ==================================================================================

  // ---------------------- 関数 ----------------------
  // 売上目標とプロセス目標のアクティブ時のアンダーラインの位置
  const getUnderline = (tab: string): CSSProperties => {
    if (tab === "Sales") return { left: 0, width: `52px` };
    if (tab === "Process") return { left: 72, width: `78px` };
    return { left: 0, width: `52px` };
  };

  // ポップアップのフェードタイプ
  const getFadeTypeClass = (fadeType: string) => {
    if (fadeType === "fade_down") return styles.fade_down;
    if (fadeType === "fade_up") return styles.fade_up;
    if (fadeType === "fade") return styles.fade;
  };

  // 目標設定モード開始(作成・編集ボタンクリック)❌一旦中止
  const handleStartUpsertMode = () => {
    if (!activeEntityLocal) return alert("エラー：グループデータが見つかりませんでした。");
    // セクション・サブメニュー閉じる
    handleCloseSectionMenu();

    // 設定するエンティティの子エンティティタイプを特定してセット(Upsertコンポーネント側で子エンティティの配列を取得)
    let _childEntityLevel = "member";
    if (endEntity === activeEntityLocal.entityLevel) {
      _childEntityLevel = "member";
    } else {
      if (activeEntityLocal.entityLevel === "company" && departmentDataArray && departmentDataArray.length > 0) {
        _childEntityLevel = "department";
      } else if (activeEntityLocal.entityLevel === "company" && officeDataArray && officeDataArray.length > 0) {
        _childEntityLevel = "office";
      } else if (activeEntityLocal.entityLevel === "department" && sectionDataArray && sectionDataArray.length > 0) {
        _childEntityLevel = "section";
      } else if (activeEntityLocal.entityLevel === "section" && unitDataArray && unitDataArray.length > 0) {
        _childEntityLevel = "unit";
      } else {
        _childEntityLevel = "member";
      }
    }

    setUpsertTargetObj({
      fiscalYear: selectedFiscalYearLocal,
      entityLevel: activeEntityLocal.entityLevel,
      entityId: activeEntityLocal.entityId,
      entityName: activeEntityLocal.entityName,
      childEntityLevel: _childEntityLevel,
    });

    // setUpsertTargetMode(true);
    setUpsertTargetMode("settingTarget");
  };

  // 目標設定モード開始 エンティティレベルとエンティティの追加から ✅こちらを使用
  const handleStartUpsertEntityMode = () => {
    // セクション・サブメニュー閉じる
    handleCloseSectionMenu();

    setUpsertTargetObj({
      fiscalYear: selectedFiscalYearLocal,
      entityLevel: "",
      entityId: "",
      entityName: "",
      childEntityLevel: "",
    });
    setUpsertSettingEntitiesObj({
      fiscalYear: selectedFiscalYearLocal,
      periodType: "",
      entityLevel: "",
      entities: [],
      parentEntityLevel: "",
      parentEntityId: "",
      parentEntityName: "",
    });
    setUpsertTargetMode("settingEntity");
  };

  // 目標設定モードを終了
  const handleCancelUpsert = () => {
    // setUpsertTargetMode(false);
    setUpsertTargetMode(null);
    setUpsertTargetObj(null);
    setUpsertSettingEntitiesObj(null);
  };

  // ---------------------変数---------------------
  const isConfirmedSelectedFY =
    targetFiscalYearsMap &&
    targetFiscalYearsMap.has(selectedFiscalYearLocal) &&
    (targetFiscalYearsMap.get(selectedFiscalYearLocal)?.is_confirmed_first_half_details ||
      targetFiscalYearsMap.get(selectedFiscalYearLocal)?.is_confirmed_second_half_details);

  // ---------------------変数 ここまで---------------------

  console.log(
    "TargetContainerコンポーネントレンダリング",
    "entityLevelList",
    entityLevelList,
    "決算日",
    format(fiscalYearEndDate, "yyyy/MM/dd HH:mm:ss"),
    "現在の会計年度Date",
    format(currentFiscalYearDateObj, "yyyy/MM/dd HH:mm:ss"),
    "現在選択中の会計年度",
    selectedFiscalYearTarget
  );

  return (
    <>
      {/* ===================== 通常時スクロールコンテナ ここから ===================== */}
      {upsertTargetMode === null && (
        <div className={`${styles.main_contents_container}`}>
          {/* ----------------- １画面目 上画面 ----------------- */}
          <section
            // className={`${styles.company_screen} space-y-[20px] ${
            className={`${styles.company_table_screen} ${
              tableContainerSize === "half" ? `${styles.company_table_screen_pr}` : ``
            } ${tableContainerSize === "all" ? `${styles.company_table_screen_pr}` : ``}`}
          >
            <div className={`${styles.title_area} flex w-full justify-between`}>
              <h1 className={`${styles.title}`}>
                <span>目標</span>
              </h1>
              <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
                <div className={`${styles.btn} ${styles.basic}`}>
                  <span>編集</span>
                </div>
                <div
                  className={`${styles.btn} ${styles.brand} space-x-[3px]`}
                  onClick={(e) => {
                    if (typeof userProfileState.company_id !== "string") return;
                    // 目標設定はマネージャー以上の役職のユーザーのみ設定可能にする
                    if (
                      !["company_owner", "company_admin", "company_manager"].includes(
                        userProfileState?.account_company_role ?? ""
                      )
                    )
                      return alert("マネージャー以上の権限を持つユーザーのみ目標設定が可能です。");
                    setActiveEntityLocal({
                      entityLevel: "company",
                      entityName: mappingEntityName["company"][language],
                      entityId: userProfileState.company_id,
                    });

                    const sectionWidth = 330;
                    handleOpenSectionMenu({
                      e,
                      title: "settingSalesTargetEntity",
                      displayX: "bottom_left",
                      fadeType: "fade_down",
                      maxWidth: sectionWidth,
                      minWidth: sectionWidth,
                    });
                    setOpenSubMenu({ display: "left", fadeType: "fade_down", sectionMenuWidth: sectionWidth });
                    // handleOpenSectionMenu({
                    //   e,
                    //   title: "settingSalesTarget",
                    //   displayX: "bottom_left",
                    //   fadeType: "fade_down",
                    //   maxWidth: sectionWidth,
                    //   minWidth: sectionWidth,
                    // });
                    // setOpenSubMenu({ display: "left", fadeType: "fade_down", sectionMenuWidth: sectionWidth });
                  }}
                >
                  <FiPlus className={`stroke-[3] text-[12px] text-[#fff]`} />
                  <span>目標設定</span>
                </div>
              </div>
            </div>

            <div className={`${styles.tab_area}`}>
              <h2 className={`flex flex-col  font-bold`}>
                <div className="mb-[6px] flex gap-[20px]">
                  <div
                    className={`${styles.title_wrapper} ${activeTargetTab === "Sales" ? `${styles.active}` : ``}`}
                    onClick={() => {
                      if (activeTargetTab !== "Sales") {
                        setActiveTargetTab("Sales");
                      }
                    }}
                  >
                    <span className={``}>売上目標</span>
                  </div>
                  <div
                    className={`${styles.title_wrapper} ${activeTargetTab === "Process" ? `${styles.active}` : ``}`}
                    onClick={() => {
                      if (activeTargetTab !== "Process") {
                        setActiveTargetTab("Process");
                      }
                    }}
                  >
                    <span className={``}>プロセス目標</span>
                  </div>
                </div>
                <div className={`${styles.section_title_underline_bg} relative min-h-[2px] w-full`}>
                  <div
                    className={`${styles.section_title_underline} absolute left-0 top-0 min-h-[2px] w-[60px] bg-[var(--color-bg-brand-f)]`}
                    style={{ ...(activeTargetTab && getUnderline(activeTargetTab)) }}
                  />
                </div>
              </h2>
            </div>

            {/* <div className={`${styles.entity_tab_area}`}>
            <div className={`${styles.entity_tab_container_left} space-x-[12px]`}>
              <div className={`${styles.entity_tab} ${styles.active}`}>
                <span>全社</span>
              </div>
              <div className={`${styles.entity_tab}`}>
                <span>事業部</span>
              </div>
              <div className={`${styles.entity_tab}`}>
                <span>課・セクション</span>
              </div>
              <div className={`${styles.entity_tab}`}>
                <span>係・チーム</span>
              </div>
              <div className={`${styles.entity_tab}`}>
                <span>事業所</span>
              </div>
            </div>
          </div> */}
          </section>
          {/* ----------------- １画面目 上画面 ここまで ----------------- */}

          {/* ----------------- ２画面目 下画面 ----------------- */}

          {/* 選択年がまだセットされていない場合はローディングを表示 */}
          {!selectedFiscalYearTarget && <FallbackContainerSalesTarget />}

          {activeTargetTab === "Sales" && selectedFiscalYearTarget && (
            <section className={`${styles.main_section_area} fade08_forward`}>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackContainerSalesTarget />}>
                  <SalesTargetsContainer />
                </Suspense>
              </ErrorBoundary>
            </section>
          )}

          {activeTargetTab === "Process" && selectedFiscalYearTarget && (
            <section className={`${styles.main_section_area} fade08_forward`}>
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackContainerSalesTarget />}>
                  <SalesTargetsContainer />
                </Suspense>
              </ErrorBoundary>
            </section>
          )}
          {/* ----------------- ２画面目 下画面 ここまで ----------------- */}
        </div>
      )}
      {/* ===================== 通常時スクロールコンテナ ここまで ===================== */}
      {/* ===================== Upsert目標設定時スクロールコンテナ ここから ===================== */}
      {upsertTargetMode === "settingEntity" && upsertSettingEntitiesObj && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackTargetContainer isUpsert={true} />}>
            <UpsertTargetEntity />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* ===================== Upsert目標設定時スクロールコンテナ ここまで ===================== */}
      {/* ===================== Upsert目標設定時スクロールコンテナ ここから ===================== */}
      {upsertTargetMode === "settingTarget" && upsertTargetObj && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackTargetContainer isUpsert={true} />}>
            <UpsertTarget endEntity={endEntity} />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* ===================== Upsert目標設定時スクロールコンテナ ここまで ===================== */}
      {/* ---------------------------- 🌟セッティングメニュー🌟 ---------------------------- */}
      {/* クリック時のオーバーレイ */}
      {openSectionMenu && <div className={`${styles.menu_overlay}`} onClick={handleCloseSectionMenu}></div>}
      {openSectionMenu && (
        <div
          ref={sectionMenuRef}
          className={`${styles.settings_menu} fixed z-[3000] h-auto rounded-[6px] ${
            openSectionMenu.fadeType ? getFadeTypeClass(openSectionMenu.fadeType) : ``
          }`}
          style={{
            top: `${openSectionMenu.y}px`,
            ...(openSectionMenu.minWidth && { minWidth: `${openSectionMenu.minWidth}px` }),
            ...(openSectionMenu.maxWidth && { maxWidth: `${openSectionMenu.maxWidth}px` }),
            ...((openSectionMenu.displayX === "center" || !openSectionMenu.displayX) && {
              left: `${openSectionMenu.x}px`,
            }),
            ...(openSectionMenu.displayX === "right" && {
              right: `${openSectionMenu.x}px`,
            }),
            ...(openSectionMenu.displayX === "left" && {
              right: `${openSectionMenu.x}px`,
            }),
            ...(openSectionMenu.displayX === "bottom_left" && {
              right: `${openSectionMenu.x}px`,
            }),
          }}
        >
          {/* ------------------------ エンティティ選択メニュー ------------------------ */}
          {/* ------------- 売上目標 年度のみ選択 ------------- */}
          {openSectionMenu.title === "settingSalesTargetEntity" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>目標設定メニュー</span>
                  <div className={`${styles.section_underline} w-full`} />
                </div>
              </h3>
              <DescriptionList content={`目標設定を行う会計年度を選択してください。`} />
              {/* ------------------------------------ */}
              <li
                className={`${styles.list} ${styles.not_hoverable}`}
                onMouseEnter={(e) => {
                  handleOpenPopupMenu({ e, title: "settingSalesTargetEntity", displayX: "left" });
                }}
                onMouseLeave={() => {
                  if (openPopupMenu) handleClosePopupMenu();
                }}
              >
                {/* <div className="pointer-events-none flex min-w-[130px] items-center"> */}
                <div className="pointer-events-none flex min-w-[90px] items-center">
                  {/* <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" /> */}
                  <div className="flex select-none items-center space-x-[2px]">
                    <span className={`${styles.list_title}`}>会計年度</span>
                    <span className={``}>：</span>
                  </div>
                </div>
                <select
                  className={`${styles.select_box} truncate`}
                  value={selectedFiscalYearLocal}
                  onChange={(e) => {
                    setSelectedFiscalYearLocal(Number(e.target.value));
                    // if (openPopupMenu) handleClosePopupMenu();
                  }}
                >
                  {optionsFiscalYear.map((year) => (
                    <option key={year} value={year}>
                      {language === "en" ? `FY ` : ``}
                      {year}
                      {language === "ja" ? `年度` : ``}
                    </option>
                  ))}
                </select>
                <div className={`ml-[16px] flex items-center space-x-[3px] whitespace-nowrap`}>
                  {isConfirmedSelectedFY && (
                    <>
                      <span className={`text-[#00d436]`}>設定済み</span>
                      <BsCheck2 className="pointer-events-none min-h-[18px] min-w-[18px] stroke-1 text-[18px] text-[#00d436]" />
                    </>
                  )}
                  {!isConfirmedSelectedFY && <span className={`text-[var(--main-color-tk)]`}>未設定</span>}
                </div>
              </li>
              {/* ------------------------------------ */}
              <hr className="min-h-[1px] w-full bg-[#999]" />
              {/* ------------------------ 適用・戻る ------------------------ */}
              <li className={`${styles.list} ${styles.btn_area} space-x-[20px]`}>
                <div
                  className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${styles.active}`}
                  onClick={() => {
                    handleStartUpsertEntityMode();
                  }}
                >
                  <span>作成・編集</span>
                </div>
                <div
                  className={`transition-bg02 ${styles.edit_btn} ${styles.cancel}`}
                  onClick={() => {
                    handleCloseSectionMenu();
                  }}
                >
                  <span>戻る</span>
                </div>
              </li>
              {/* ------------------------ 適用・戻る ここまで ------------------------ */}
            </>
          )}
          {/* ------------- 売上目標 年度のみ選択 ここまで ------------- */}

          {/* ------------- 売上目標 年度とエンティティレベルとエンティティ選択 ------------- */}
          {openSectionMenu.title === "settingSalesTarget" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>目標設定メニュー</span>
                  <div className={`${styles.section_underline} w-full`} />
                </div>
              </h3>

              {/* ------------------------------------ */}
              {/* <li className={`${styles.section_title} min-h-max w-full font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>会計年度</span>
                  <div className={`${styles.underline} w-full`} />
                </div>
              </li> */}
              <li
                className={`${styles.list} ${styles.not_hoverable}`}
                // onMouseEnter={(e) => {
                //   handleOpenPopupMenu({ e, title: "displayFiscalYear", displayX: "right" });
                // }}
                // onMouseLeave={() => {
                //   if (openPopupMenu) handleClosePopupMenu();
                // }}
              >
                <div className="pointer-events-none flex min-w-[130px] items-center">
                  <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                  <div className="flex select-none items-center space-x-[2px]">
                    <span className={`${styles.list_title}`}>会計年度</span>
                    <span className={``}>：</span>
                  </div>
                </div>
                <select
                  className={`${styles.select_box} truncate`}
                  value={selectedFiscalYearLocal}
                  onChange={(e) => {
                    setSelectedFiscalYearLocal(Number(e.target.value));
                    // if (openPopupMenu) handleClosePopupMenu();
                  }}
                >
                  {optionsFiscalYear.map((year) => (
                    <option key={year} value={year}>
                      {language === "en" ? `FY ` : ``}
                      {year}
                      {language === "ja" ? `年度` : ``}
                    </option>
                  ))}
                </select>
              </li>
              {/* ------------------------------------ */}

              <hr className="min-h-[1px] w-full bg-[#999]" />
              {/* <p className={`w-full whitespace-pre-wrap px-[20px] pb-[12px] pt-[10px] text-[11px] leading-[18px]`}>
                {`下記メニューから「全社・事業部・課/セクション・係/チーム・メンバー個人・事業所」を選択して、各フェーズに応じた目標設定が可能です。\n目標設定は、各フェーズ毎に親のフェーズの目標が確定している状態で設定が可能となるため、最上位フェーズから設定してください。`}
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" /> */}

              {/* <hr className="mt-[12px] min-h-[1px] w-full bg-[#999]" /> */}

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={` flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  {entityLevelList.map((obj, index) => {
                    const isActive = obj.title === activeEntityLocal?.entityLevel;
                    return (
                      <li
                        key={obj.title}
                        className={`${styles.list} ${styles.select_list} ${isActive ? styles.active : ``}`}
                        onClick={(e) => {
                          if (!userProfileState.company_id) return;
                          if (isActive) return console.log("リターン ", isActive, obj);
                          // 全社の場合は、そのまま区分を変更
                          if (obj.title === "company") {
                            // // setActiveDisplayTabs({ ...activeDisplayTabs, entity: obj.title });
                            // setMainEntityTarget({ ...mainEntityTarget, entityLevel: obj.title });
                            // setActiveEntityLocal(null);
                            // setOpenSectionMenu(null);
                            setActiveEntityLocal({
                              entityLevel: obj.title,
                              entityName: obj.name[language],
                              entityId: userProfileState.company_id,
                            });
                          }
                          // 事業部~事業所までは、エンティティ区分タイプ+表示するエンティティ名が必要なため、一旦ローカルstateに区分タイプを保存して、右側の選択エリアでエンティティ名をセレクトで選択してもらう
                          else if (obj.title === "department") {
                            if (!departmentDataArray || departmentDataArray?.length === 0) {
                              alert("事業部リストがありません。先に「会社・チーム」から事業部を作成してください。");
                              return;
                            }
                            const departmentId = departmentDataArray ? departmentDataArray[0].id : "";
                            const newDepartment = departmentIdToObjMap?.get(departmentId);
                            setSelectedDepartment(newDepartment ?? null);
                            setActiveEntityLocal({
                              entityLevel: obj.title,
                              entityName: newDepartment?.department_name ?? "",
                              entityId: newDepartment?.id ?? "",
                            });
                          } else if (obj.title === "section") {
                            if (!departmentDataArray || departmentDataArray?.length === 0) {
                              alert("事業部リストがありません。先に「会社・チーム」から事業部を作成してください。");
                              return;
                            }
                            if (!sectionDataArray || sectionDataArray?.length === 0) {
                              alert(
                                "課・セクションリストがありません。先に「会社・チーム」から課・セクションを作成してください。"
                              );
                              return;
                            }
                            const departmentId = departmentDataArray ? departmentDataArray[0].id : "";
                            setSelectedDepartment(departmentIdToObjMap?.get(departmentId) ?? null);
                            // departmentIdに一致するセクションのみ絞り込んで選択肢リストを作成
                            // 🔹事業部リスト１番目の事業部に紐づく課・セクションリストの選択肢の１番目をstateにセット
                            const filteredSectionList = sectionDataArray.filter(
                              (unit) => unit.created_by_department_id === departmentId
                            );
                            // 選択肢を１番目の事業部のidで絞り込み
                            setFilteredSectionBySelectedDepartment(filteredSectionList);
                            if (!filteredSectionList || filteredSectionList?.length === 0) {
                              alert(
                                "課・セクションリストがありません。先に「会社・チーム」から課・セクションを作成してください。"
                              );
                              setSelectedSection(null);
                              return;
                            }
                            const firstSectionObj = [...filteredSectionList].sort((a, b) => {
                              if (a.section_name === null) return 1; // null値をリストの最後に移動
                              if (b.section_name === null) return -1;
                              return a.section_name?.localeCompare(b.section_name, language === "ja" ? "ja" : "en");
                            })[0];
                            setSelectedSection(firstSectionObj);
                            setActiveEntityLocal({
                              entityLevel: obj.title,
                              entityName: firstSectionObj?.section_name ?? "",
                              entityId: firstSectionObj?.id ?? "",
                            });
                            // const sectionId = sectionDataArray ? sectionDataArray[0].id : "";
                            // setSelectedSection(sectionIdToObjMap?.get(sectionId) ?? null);
                          } else if (obj.title === "unit") {
                            if (!departmentDataArray || departmentDataArray?.length === 0) {
                              alert("事業部リストがありません。先に「会社・チーム」から事業部を作成してください。");
                              return;
                            }
                            if (!sectionDataArray || sectionDataArray?.length === 0) {
                              alert(
                                "課・セクションリストがありません。先に「会社・チーム」から課・セクションを作成してください。"
                              );
                              return;
                            }
                            if (!unitDataArray || unitDataArray?.length === 0) {
                              alert(
                                "係・チームリストがありません。先に「会社・チーム」から係・チームを作成してください。"
                              );
                              return;
                            }
                            const departmentId = departmentDataArray ? departmentDataArray[0].id : "";
                            setSelectedDepartment(departmentIdToObjMap?.get(departmentId) ?? null);
                            // departmentIdに一致するセクションのみ絞り込んで選択肢リストを作成
                            // 🔹事業部リスト１番目の事業部に紐づく課・セクションリストの選択肢の１番目をstateにセット
                            const filteredSectionList = sectionDataArray.filter(
                              (unit) => unit.created_by_department_id === departmentId
                            );
                            // 選択肢を１番目の事業部のidで絞り込み
                            setFilteredSectionBySelectedDepartment(filteredSectionList);
                            if (!filteredSectionList || filteredSectionList?.length === 0) {
                              alert(
                                "課・セクションリストがありません。先に「会社・チーム」から課・セクションを作成してください。"
                              );
                              setSelectedSection(null);
                              return;
                            }
                            const firstSectionObj = [...filteredSectionList].sort((a, b) => {
                              if (a.section_name === null) return 1; // null値をリストの最後に移動
                              if (b.section_name === null) return -1;
                              return a.section_name?.localeCompare(b.section_name, language === "ja" ? "ja" : "en");
                            })[0];
                            setSelectedSection(firstSectionObj);

                            // 🔹事業部リスト１番目の事業部に紐づく課・セクションリストの選択肢の１番目の課に紐づく係リストの１番目をstateにセット
                            const filteredUnitList = unitDataArray.filter(
                              (unit) => unit.created_by_section_id === firstSectionObj.id
                            );
                            setFilteredUnitBySelectedSection(filteredUnitList);
                            //
                            if (!filteredUnitList || filteredUnitList?.length === 0) {
                              alert(
                                "係・チームリストがありません。先に「会社・チーム」から係・チームを作成してください。"
                              );
                              return;
                            }
                            const firstUnitObj = [...filteredUnitList].sort((a, b) => {
                              if (a.unit_name === null) return 1; // null値をリストの最後に移動
                              if (b.unit_name === null) return -1;
                              return a.unit_name?.localeCompare(b.unit_name, language === "ja" ? "ja" : "en");
                            })[0];
                            setSelectedUnit(firstUnitObj);
                            setActiveEntityLocal({
                              entityLevel: obj.title,
                              entityName: firstUnitObj?.unit_name ?? "",
                              entityId: firstUnitObj?.id ?? "",
                            });
                            // setIsOpenConfirmUpsertModal("unit");

                            // const unitId = unitDataArray ? unitDataArray[0].id : "";
                            // setSelectedUnit(unitIdToObjMap?.get(unitId) ?? null);
                          } else if (obj.title === "office") {
                            if (!officeDataArray || officeDataArray?.length === 0) {
                              alert("事業所リストがありません。先に「会社・チーム」から事業所を作成してください。");
                              return;
                            }
                            const officeId = officeDataArray ? officeDataArray[0].id : "";
                            const newOffice = officeIdToObjMap?.get(officeId);
                            setSelectedOffice(newOffice ?? null);
                            setActiveEntityLocal({
                              entityLevel: obj.title,
                              entityName: newOffice?.office_name ?? "",
                              entityId: newOffice?.id ?? "",
                            });
                          } else if (obj.title === "member") {
                            setActiveEntityLocal({
                              entityLevel: obj.title,
                              entityName: selectedMemberObj.memberName ?? "",
                              entityId: selectedMemberObj.memberId ?? "",
                            });
                          }
                        }}
                      >
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff
                            className={`${styles.list_icon} mr-[16px] min-h-[20px] min-w-[20px] text-[20px]`}
                          />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.select_item}`}>{obj.name[language]}</span>
                            {/* <span className={``}>：</span> */}
                          </div>
                        </div>
                        {isActive && (
                          <div className={`${styles.icon_container}`}>
                            <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                          </div>
                        )}
                      </li>
                    );
                  })}
                  {/* ------------------------------------ */}
                </ul>
              </div>
              {/* ------------------ 🌟サイドエンティティ詳細メニュー🌟 適用・戻るエリア */}
              {openSubMenu && (
                <div
                  className={`${styles.settings_menu} ${
                    styles.edit_mode
                  }  z-[3000] h-auto w-[330px] overflow-hidden rounded-[6px] ${
                    openSubMenu.display === "fade_up" ? styles.fade_up : `${styles.fade_down}`
                  }`}
                  style={{
                    position: "absolute",
                    ...(openSectionMenu.maxWidth && { maxWidth: `${openSectionMenu.maxWidth}px` }),
                    ...(openSectionMenu.minWidth && { minWidth: `${openSectionMenu.minWidth}px` }),
                    ...(openSubMenu.display === "bottom" && { bottom: "-150px", left: 0 }),
                    ...(openSubMenu.display === "right" && {
                      top: "0px",
                      left: (openSubMenu.sectionMenuWidth ?? 0) + 10,
                    }),
                    ...(openSubMenu.display === "left" && {
                      top: "0px",
                      right: (openSubMenu.sectionMenuWidth ?? 0) + 10,
                    }),
                    animationDelay: `0.2s`,
                    animationDuration: `0.5s`,
                  }}
                >
                  {/* ------------------------------------ */}
                  {/* <li className={`${styles.section_title} flex min-h-max w-full font-bold`}>
                    <div className="flex max-w-max flex-col">
                      <span>{mappingSectionName[activeSectionSDB][language]}</span>
                      <div className={`${styles.underline} w-full`} />
                    </div>
                  </li> */}
                  {/* ------------------------------------ */}
                  {/* ------------------------------------ */}
                  <DescriptionList
                    title="売上目標"
                    // content={`下記メニューから「全社・事業部・課/セクション・係/チーム・メンバー個人・事業所」を選択して、各グループに応じた目標設定が可能です。\n目標設定は、各グループ毎に親のグループの目標が確定している状態で設定が可能となるため、最上位グループから設定してください。`}
                    content={`下記メニューから「全社・事業部・課/セクション・係/チーム・メンバー個人・事業所」を選択して、各グループに応じた目標設定が可能です。`}
                    content2={`目標設定は、各グループ毎に親のグループの目標が確定している状態で設定が可能となるため、最上位グループから設定してください。`}
                  />
                  {/* ------------------------------------ */}
                  {/* ------------------------ 全社 ------------------------ */}
                  {activeEntityLocal && activeEntityLocal.entityLevel === "company" && (
                    <li
                      className={`${styles.list}`}
                      onMouseEnter={(e) => {
                        // handleOpenPopupMenu({ e, title: "compressionRatio" });
                      }}
                      onMouseLeave={handleClosePopupMenu}
                    >
                      <div className="pointer-events-none flex min-w-[70px] items-center">
                        {/* <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" /> */}
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>選択中</span>
                          <span className={``}>：</span>
                        </div>
                      </div>

                      <div className="flex w-full items-center justify-end">
                        <div className="mb-[-1px] flex min-w-max  flex-col space-y-[3px]">
                          <div className="flex max-w-[160px] items-center px-[12px]">
                            <span
                              className="truncate text-[14px]"
                              onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                if (el.offsetWidth < el.scrollWidth) {
                                  const tooltipContent = mappingEntityName["company"][language];
                                  handleOpenTooltip({
                                    e: e,
                                    display: "top",
                                    content: tooltipContent,
                                    marginTop: 12,
                                    itemsPosition: "center",
                                    // whiteSpace: "nowrap",
                                  });
                                }
                              }}
                              onMouseLeave={() => {
                                if (hoveredItemPos) handleCloseTooltip();
                              }}
                            >
                              {mappingEntityName["company"][language]}
                            </span>
                          </div>
                          <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />
                        </div>
                      </div>
                    </li>
                  )}
                  {/* ------------------------ 全社 ここまで ------------------------ */}
                  {/* ------------------------ 事業部 ------------------------ */}
                  {activeEntityLocal && ["department", "section", "unit"].includes(activeEntityLocal.entityLevel) && (
                    <li
                      className={`${styles.list}`}
                      // className={`relative flex  w-full items-center justify-between px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                    >
                      <div className={`${styles.list_title_wrapper}`}>
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>事業部</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      <div className={`${styles.list_item_content}`}>
                        {(!selectedDepartment || !departmentIdToObjMap) && (
                          <span className={`${styles.empty_text}`}>事業部が見つかりません</span>
                        )}
                        {selectedDepartment && departmentIdToObjMap && (
                          <select
                            className={`h-full ${styles.select_box} truncate`}
                            value={selectedDepartment.id}
                            onChange={(e) => {
                              const departmentId = e.target.value;
                              const newDepartment = departmentIdToObjMap.has(departmentId)
                                ? departmentIdToObjMap.get(departmentId)
                                : null;
                              setSelectedDepartment(newDepartment ?? null);

                              if (activeEntityLocal.entityLevel === "department") {
                                setActiveEntityLocal({
                                  ...activeEntityLocal,
                                  entityId: departmentId,
                                  entityName: newDepartment?.department_name ?? "",
                                });
                              }

                              // 課・セクションの場合は、課をリセット
                              if (["section", "unit"].includes(activeEntityLocal.entityLevel)) {
                                if (!sectionDataArray || sectionDataArray?.length === 0) {
                                  alert(
                                    "課・セクションリストがありません。先に「会社・チーム」から課・セクションを作成してください。"
                                  );
                                  return;
                                }
                                // 全ての課から新たに選択した事業部に含まれる課のみの選択肢を生成して、1番目を選択中の課にセット
                                const filteredSectionList = sectionDataArray.filter(
                                  (unit) => unit.created_by_department_id === departmentId
                                );

                                const sortedSectionList = [...filteredSectionList].sort((a, b) => {
                                  if (a.section_name === null) return 1; // null値をリストの最後に移動
                                  if (b.section_name === null) return -1;
                                  return a.section_name.localeCompare(b.section_name, language === "ja" ? "ja" : "en");
                                });
                                setFilteredSectionBySelectedDepartment(sortedSectionList);

                                const firstSectionObj = sortedSectionList?.length >= 1 ? sortedSectionList[0] : null;
                                setSelectedSection(firstSectionObj);
                                if (activeEntityLocal.entityLevel === "section") {
                                  setActiveEntityLocal({
                                    ...activeEntityLocal,
                                    entityId: firstSectionObj?.id ?? "",
                                    entityName: firstSectionObj?.section_name ?? "",
                                  });
                                }

                                if (activeEntityLocal.entityLevel === "unit") {
                                  if (!unitDataArray || unitDataArray?.length === 0) {
                                    alert(
                                      "係・チームリストがありません。先に「会社・チーム」から係・チームを作成してください。"
                                    );
                                    return;
                                  }
                                  if (!firstSectionObj) {
                                    setSelectedUnit(null);
                                    return;
                                  }
                                  // 全ての課から新たに選択した事業部に含まれる課のみの選択肢を生成して、1番目を選択中の課にセット
                                  const filteredUnitList = unitDataArray.filter(
                                    (unit) => unit.created_by_section_id === firstSectionObj.id
                                  );

                                  const sortedUnitList = [...filteredUnitList].sort((a, b) => {
                                    if (a.unit_name === null) return 1; // null値をリストの最後に移動
                                    if (b.unit_name === null) return -1;
                                    return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en");
                                  });
                                  setFilteredUnitBySelectedSection(sortedUnitList);

                                  const firstUnitObj = sortedUnitList?.length >= 1 ? sortedUnitList[0] : null;
                                  setSelectedUnit(firstUnitObj);
                                  if (activeEntityLocal.entityLevel === "unit") {
                                    setActiveEntityLocal({
                                      ...activeEntityLocal,
                                      entityId: firstUnitObj?.id ?? "",
                                      entityName: firstUnitObj?.unit_name ?? "",
                                    });
                                  }
                                }
                              }
                            }}
                          >
                            {!!departmentDataArray?.length &&
                              departmentDataArray.map(
                                (department, index) =>
                                  !!department &&
                                  department.department_name && (
                                    <option key={department.id} value={department.id}>
                                      {department.department_name}
                                    </option>
                                  )
                              )}
                          </select>
                        )}
                      </div>
                    </li>
                  )}
                  {/* ------------------------ 事業部 ここまで ------------------------ */}
                  {/* ------------------------ 課・セクション ------------------------ */}
                  {activeEntityLocal && ["section", "unit"].includes(activeEntityLocal.entityLevel) && (
                    <li
                      className={`${styles.list}`}
                      // className={`relative flex  w-full items-center justify-between px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                    >
                      <div className={`${styles.list_title_wrapper}`}>
                        <div className="flex min-w-max select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>課・セクション</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      <div className={`${styles.list_item_content}`}>
                        {!selectedSection && (
                          <span className={`${styles.empty_text}`}>課・セクションが見つかりません</span>
                        )}
                        {selectedSection && sectionIdToObjMap && (
                          <select
                            className={` ${styles.select_box} truncate`}
                            value={selectedSection.id}
                            onChange={(e) => {
                              const sectionId = e.target.value;
                              const newSection = sectionIdToObjMap.has(sectionId)
                                ? sectionIdToObjMap.get(sectionId)
                                : null;
                              setSelectedSection(newSection ?? null);

                              if (activeEntityLocal.entityLevel === "section") {
                                setActiveEntityLocal({
                                  ...activeEntityLocal,
                                  entityId: sectionId,
                                  entityName: newSection?.section_name ?? "",
                                });
                              }

                              if (activeEntityLocal.entityLevel === "unit") {
                                if (!unitDataArray || unitDataArray?.length === 0) {
                                  alert(
                                    "係・チームリストがありません。先に「会社・チーム」から係・チームを作成してください。"
                                  );
                                  return;
                                }
                                // 全ての課から新たに選択した事業部に含まれる課のみの選択肢を生成して、1番目を選択中の課にセット
                                const filteredUnitList = unitDataArray.filter(
                                  (unit) => unit.created_by_section_id === sectionId
                                );

                                const sortedUnitList = [...filteredUnitList].sort((a, b) => {
                                  if (a.unit_name === null) return 1; // null値をリストの最後に移動
                                  if (b.unit_name === null) return -1;
                                  return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en");
                                });
                                setFilteredUnitBySelectedSection(sortedUnitList);

                                const firstUnitObj = sortedUnitList?.length >= 1 ? sortedUnitList[0] : null;
                                setSelectedUnit(firstUnitObj);
                                if (activeEntityLocal.entityLevel === "unit") {
                                  setActiveEntityLocal({
                                    ...activeEntityLocal,
                                    entityId: firstUnitObj?.id ?? "",
                                    entityName: firstUnitObj?.unit_name ?? "",
                                  });
                                }
                              }
                            }}
                          >
                            {!!filteredSectionBySelectedDepartment?.length &&
                              filteredSectionBySelectedDepartment.map(
                                (section, index) =>
                                  !!section &&
                                  section.section_name && (
                                    <option key={section.id} value={section.id}>
                                      {section.section_name}
                                    </option>
                                  )
                              )}
                          </select>
                        )}
                      </div>
                    </li>
                  )}
                  {/* ------------------------ 課・セクション ------------------------ */}
                  {/* ------------------------ 係・チーム ------------------------ */}
                  {activeEntityLocal && activeEntityLocal.entityLevel === "unit" && (
                    <li
                      className={`${styles.list}`}
                      // className={`relative flex  w-full items-center justify-between px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                    >
                      <div className={`${styles.list_title_wrapper}`}>
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>係・チーム</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      <div className={`${styles.list_item_content}`}>
                        {!selectedUnit && <span className={`${styles.empty_text}`}>係・チームが見つかりません</span>}
                        {selectedUnit && unitIdToObjMap && (
                          <select
                            className={`${styles.select_box} truncate`}
                            value={selectedUnit.id}
                            onChange={(e) => {
                              const unitId = e.target.value;
                              const newUnit = unitIdToObjMap.has(unitId) ? unitIdToObjMap.get(unitId) : null;
                              setSelectedUnit(newUnit ?? null);

                              setActiveEntityLocal({
                                ...activeEntityLocal,
                                entityId: unitId,
                                entityName: newUnit?.unit_name ?? "",
                              });
                            }}
                          >
                            {!!filteredUnitBySelectedSection?.length &&
                              filteredUnitBySelectedSection.map(
                                (unit, index) =>
                                  !!unit &&
                                  unit.unit_name && (
                                    <option key={unit.id} value={unit.id}>
                                      {unit.unit_name}
                                    </option>
                                  )
                              )}
                          </select>
                        )}
                      </div>
                    </li>
                  )}
                  {/* ------------------------ 係・チーム ------------------------ */}
                  {/* ------------------------ 事業所 ------------------------ */}
                  {activeEntityLocal && activeEntityLocal.entityLevel === "office" && (
                    <li
                      className={`${styles.list}`}
                      // className={`relative flex  w-full items-center justify-between px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                    >
                      <div className={`${styles.list_title_wrapper}`}>
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>事業所</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      <div className={`${styles.list_item_content}`}>
                        {!selectedOffice && <span className={`${styles.empty_text}`}>事業所が見つかりません</span>}
                        {selectedOffice && officeIdToObjMap && (
                          <select
                            className={` ${styles.select_box} truncate`}
                            value={selectedOffice.id}
                            onChange={(e) => {
                              const officeId = e.target.value;
                              const newOffice = officeIdToObjMap.has(officeId) ? officeIdToObjMap.get(officeId) : null;
                              setSelectedOffice(newOffice ?? null);

                              setActiveEntityLocal({
                                ...activeEntityLocal,
                                entityId: officeId,
                                entityName: newOffice?.office_name ?? "",
                              });
                            }}
                          >
                            {!!officeDataArray?.length &&
                              officeDataArray.map(
                                (office, index) =>
                                  !!office &&
                                  office.office_name && (
                                    <option key={office.id} value={office.id}>
                                      {office.office_name}
                                    </option>
                                  )
                              )}
                          </select>
                        )}
                      </div>
                    </li>
                  )}
                  {/* ------------------------ 事業所 ------------------------ */}
                  {/* ------------------------ メンバー ------------------------ */}
                  {activeEntityLocal && activeEntityLocal.entityLevel === "member" && (
                    <li
                      className={`${styles.list}`}
                      onMouseEnter={(e) => {
                        // handleOpenPopupMenu({ e, title: "compressionRatio" });
                      }}
                      onMouseLeave={handleClosePopupMenu}
                    >
                      <div className="pointer-events-none flex min-w-[70px] items-center">
                        {/* <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" /> */}
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>メンバー</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      {/* <select
                      className={`${styles.select_box} truncate`}
                      value={compressionRatio}
                      onChange={(e) => setCompressionRatio(e.target.value as CompressionRatio)}
                    >
                      {optionsCompressionRatio.map((value) => (
                        <option key={value} value={value}>
                          {getCompressionRatio(value, language)}
                        </option>
                      ))}
                    </select> */}

                      <div className="flex w-full items-center justify-end">
                        <div className="mb-[-1px] flex min-w-max  flex-col space-y-[3px]">
                          <div className="flex max-w-[160px] items-center px-[12px]">
                            <span
                              className="truncate text-[14px]"
                              onMouseEnter={(e) => {
                                const el = e.currentTarget;
                                if (el.offsetWidth < el.scrollWidth) {
                                  const tooltipContent = selectedMemberObj.memberName ?? "未設定";
                                  handleOpenTooltip({
                                    e: e,
                                    display: "top",
                                    content: tooltipContent,
                                    marginTop: 12,
                                    itemsPosition: "center",
                                    // whiteSpace: "nowrap",
                                  });
                                }
                              }}
                              onMouseLeave={() => {
                                if (hoveredItemPos) handleCloseTooltip();
                              }}
                            >
                              {selectedMemberObj.memberName ?? "未設定"}
                            </span>
                          </div>
                          <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />
                        </div>
                        <div
                          className={`${styles.icon_path_stroke} ${styles.icon_btn} flex-center transition-bg03 ml-[13px]`}
                          onMouseEnter={(e) => {
                            const tooltipContent = "メンバーを変更";
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: tooltipContent,
                              marginTop: 12,
                              itemsPosition: "center",
                              // whiteSpace: "nowrap",
                            });
                          }}
                          onMouseLeave={() => {
                            handleCloseTooltip();
                          }}
                          onClick={() => {
                            setIsOpenSearchMemberSideTableBefore(true);
                            setTimeout(() => {
                              setIsOpenSearchMemberSideTable(true);
                            }, 100);
                            setSideTableState("member");

                            const _memberObj = {
                              memberId: selectedMemberObj.memberId ?? null,
                              memberName: selectedMemberObj.memberName ?? null,
                              departmentId: selectedMemberObj.departmentId ?? null,
                              sectionId: selectedMemberObj.sectionId ?? null,
                              unitId: selectedMemberObj.unitId ?? null,
                              officeId: selectedMemberObj.officeId ?? null,
                              signature_stamp_id: selectedMemberObj.signature_stamp_id ?? null,
                              signature_stamp_url: selectedMemberObj.signature_stamp_url ?? null,
                            } as MemberObj;
                            setSelectedMemberObj(_memberObj);
                            setPrevSelectedMemberObj(_memberObj);

                            handleCloseTooltip();
                          }}
                        >
                          <FaExchangeAlt className="text-[13px]" />
                        </div>
                      </div>
                    </li>
                  )}
                  {/* ------------------------ メンバー ここまで ------------------------ */}
                  <hr className="min-h-[1px] w-full bg-[#999]" />
                  {/* ------------------------ 適用・戻る ------------------------ */}
                  <li className={`${styles.list} ${styles.btn_area} space-x-[20px]`}>
                    <div
                      className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${styles.active}`}
                      onClick={() => {
                        if (openSectionMenu.title === "settingSalesTarget") handleStartUpsertMode();
                      }}
                    >
                      {openSectionMenu.title !== "settingSalesTarget" && <span>適用</span>}
                      {openSectionMenu.title === "settingSalesTarget" && <span>作成・編集</span>}
                    </div>
                    <div
                      className={`transition-bg02 ${styles.edit_btn} ${styles.cancel}`}
                      onClick={() => {
                        handleCloseSectionMenu();
                      }}
                    >
                      <span>戻る</span>
                    </div>
                  </li>
                  {/* ------------------------ 適用・戻る ここまで ------------------------ */}
                </div>
              )}
              {/* ------------------------ 右サイドエンティティ詳細メニュー 適用・戻るエリア ------------------------ */}
            </>
          )}
          {/* ------------------------ エンティティ選択メニュー ------------------------ */}
        </div>
      )}
      {/* ---------------------------- 🌟セッティングメニュー🌟 ここまで ---------------------------- */}

      {/* ---------------------------- 🌟説明ポップアップ🌟 ---------------------------- */}
      {openPopupMenu && (
        <div
          className={`${styles.description_menu} shadow-all-md border-real-with-shadow pointer-events-none fixed z-[3500] flex min-h-max flex-col rounded-[6px]`}
          style={{
            top: `${openPopupMenu.y}px`,
            ...(openPopupMenu.maxWidth && { maxWidth: `${openPopupMenu.maxWidth}px` }),
            ...(openPopupMenu.minWidth && { minWidth: `${openPopupMenu.minWidth}px` }),
            ...(openPopupMenu?.displayX === "right" && {
              left: `${openPopupMenu.x}px`,
            }),
            ...(openPopupMenu?.displayX === "left" && {
              right: `${openPopupMenu.x}px`,
            }),
            ...(openPopupMenu?.displayX === "bottom_left" && {
              right: `${openPopupMenu.x}px`,
            }),
            ...(["settingSalesTarget"].includes(openSectionMenu?.title ?? "") && {
              animationDelay: `0.2s`,
              animationDuration: `0.5s`,
            }),
          }}
        >
          <div className={`min-h-max w-full font-bold ${styles.title}`}>
            <div className="flex max-w-max flex-col">
              <span>{mappingPopupTitle[openPopupMenu.title][language]}</span>
              <div className={`${styles.underline} w-full`} />
            </div>
          </div>

          <ul className={`flex flex-col rounded-[6px] ${styles.u_list}`}>
            {["guide"].includes(openPopupMenu.title) &&
              mappingDescriptions[openPopupMenu.title].map((item, index) => (
                <li
                  key={item.title + index.toString()}
                  className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}
                  style={{ ...(openPopupMenu.title === "printTips" && { padding: "3px 14px" }) }}
                >
                  <div className="flex min-w-max items-center space-x-[3px]">
                    <RxDot className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                    <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                      {item.title}
                    </span>
                  </div>
                  <p className="select-none text-[12px]" style={{ whiteSpace: "pre-wrap" }}>
                    {item.content}
                  </p>
                </li>
              ))}
            {!["guide"].includes(openPopupMenu.title) && (
              <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
                <p className="select-none whitespace-pre-wrap text-[12px] leading-[20px]">
                  {openPopupMenu.title === "settingSalesTargetEntity" &&
                    "選択中の会計年度の目標を表示します。\n会計年度は2020年から現在まで選択可能で、翌年度はお客様の決算日から現在の日付が3ヶ月を切ると表示、設定、編集が可能となります。"}
                  {openPopupMenu.title === "settingSalesTarget" &&
                    "下記メニューから「全社・事業部・課/セクション・係/チーム・メンバー個人・事業所」を選択して、各グループに応じた目標設定が可能です。\n目標設定は、各グループ毎に親のグループの目標が確定している状態で設定が可能となるため、最上位グループから設定してください。"}
                  {openPopupMenu.title === "edit_mode" &&
                    "定休日を適用後、個別に日付を「営業日から休日へ」または「休日から営業日へ」変更が可能です。"}
                  {openPopupMenu.title === "displayFiscalYear" &&
                    `選択中の会計年度の営業カレンダーを表示します。\n会計年度は2020年から当年度まで選択可能で、翌年度のカレンダーはお客様の決算日から現在の日付が3ヶ月を切ると表示、設定、編集が可能となります。`}
                  {openPopupMenu.title === "working_to_closing" &&
                    `「営業日 → 休日」を選択後、カレンダーから会計期間内の営業日を選択して下の適用ボタンをクリックすることで休日へ変更できます。\n日付は複数選択して一括で更新が可能です。`}
                </p>
              </li>
            )}
            {openPopupMenu.title === "print" && <hr className="mb-[6px] min-h-[1px] w-full bg-[#666]" />}
            {/* {openPopupMenu.title === "print" &&
              descriptionPrintTips.map((obj, index) => (
                <li key={obj.title} className={`flex w-full space-x-[3px] px-[14px] py-[3px] text-[12px]`}>
                  <span className="min-w-[80px] max-w-[80px] font-bold">・{obj.title}：</span>
                  <p className="whitespace-pre-wrap">{obj.content}</p>
                </li>
              ))} */}
          </ul>
        </div>
      )}
      {/* ---------------------------- 🌟説明ポップアップ🌟 ここまで ---------------------------- */}

      {/* 「自社担当」「印鑑データ」変更サイドテーブル */}
      {isOpenSearchMemberSideTableBefore && selectedMemberObj && (
        <div
          className={`fixed inset-0 z-[10000] bg-[#00000000] ${
            isOpenSearchMemberSideTable ? `` : `pointer-events-none`
          }`}
        >
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div
                  className={`pointer-events-none fixed inset-0 z-[10000]  ${
                    sideTableState !== "author" ? `bg-[#00000039]` : ``
                  }`}
                >
                  <FallbackSideTableSearchMember
                    isOpenSearchMemberSideTable={isOpenSearchMemberSideTable}
                    searchSignatureStamp={false}
                  />
                </div>
              }
            >
              <SideTableSearchMember
                isOpenSearchMemberSideTable={isOpenSearchMemberSideTable}
                setIsOpenSearchMemberSideTable={setIsOpenSearchMemberSideTable}
                isOpenSearchMemberSideTableBefore={isOpenSearchMemberSideTableBefore}
                setIsOpenSearchMemberSideTableBefore={setIsOpenSearchMemberSideTableBefore}
                prevMemberObj={getMemberObj(sideTableState).prevMemberObj}
                setPrevMemberObj={getMemberObj(sideTableState).setPrevMemberObj}
                memberObj={getMemberObj(sideTableState).memberObj}
                setMemberObj={getMemberObj(sideTableState).setMemberObj}
                searchSignatureStamp={false}
                // prevMemberObj={prevMemberObj}
                // setPrevMemberObj={setPrevMemberObj}
                // memberObj={memberObj}
                // setMemberObj={setMemberObj}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )}
      {upsertTargetMode !== null && (
        <>
          <div className={`fixed left-0 top-0 z-[2000] h-[56px] w-full bg-[red]/[0]`} onClick={handleCancelUpsert} />
          <div className={`fixed left-0 top-0 z-[2000] h-full w-[72px] bg-[red]/[0]`} onClick={handleCancelUpsert} />
        </>
      )}
    </>
  );
};
