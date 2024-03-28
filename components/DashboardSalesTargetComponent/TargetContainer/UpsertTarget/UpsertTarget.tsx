import useStore from "@/store";
import styles from "../../DashboardSalesTargetComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { CSSProperties, Fragment, Suspense, memo, useEffect, useMemo, useState } from "react";
import { FaSave } from "react-icons/fa";
import { IoIosSave } from "react-icons/io";
import { MdSaveAlt } from "react-icons/md";
import { RiSave3Fill } from "react-icons/ri";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { Department, MemberAccounts, Office, Section, Unit } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { SparkChart } from "@/components/Parts/Charts/SparkChart/SparkChart";
import { ErrorBoundary } from "react-error-boundary";
import { FallbackScrollContainer } from "../SalesTargetsContainer/SalesTargetGridTable/FallbackScrollContainer";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { UpsertTargetGridTable } from "./UpsertTargetGridTable/UpsertTargetGridTable";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { toast } from "react-toastify";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { calculateFiscalYearMonths } from "@/utils/Helpers/CalendarHelpers/calculateFiscalMonths";
import { useQueryMemberAccountsFilteredByEntity } from "@/hooks/useQueryMemberAccountsFilteredByEntity";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { FallbackTargetTable } from "./UpsertTargetGridTable/FallbackTargetTable";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { GrPowerReset } from "react-icons/gr";
import { BsChevronLeft } from "react-icons/bs";
import { IoAddOutline } from "react-icons/io5";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export const columnHeaderListTarget = [
  "period_type",
  "sales_target",
  "share", // 「年度に対する上期・下期のシェア」、「半期に対する各月度のシェア」
  "yoy_growth", // 前年度の売上に対する売上目標の成長率
  "yo2y_growth", // 前年度前年伸び率実績(2年前から1年前の成長率)
  "last_year_sales",
  "two_years_ago_sales",
  "three_years_ago_sales",
  "sales_trend", // 売上推移(スパークチャート)
];
export const formatColumnName = (column: string, year: number): { ja: string; en: string; [key: string]: string } => {
  switch (column) {
    case "period_type":
      return { ja: "期間", en: "Period" };
    case "sales_target":
      return { ja: `売上目標 ${year}年度`, en: `FY${year} Sales Target` };
    case "share":
      return { ja: "シェア", en: "Share" };
    case "yoy_growth":
      return { ja: "前年比", en: "YoY Growth" };
    case "yo2y_growth":
      return { ja: "前年度前年伸び率実績", en: "Yo2Y Growth" };
    case "last_year_sales":
      return { ja: `${year - 1}年度`, en: `FY${year - 1}` };
    case "two_years_ago_sales":
      return { ja: `${year - 2}年度`, en: `FY${year - 2}` };
    case "three_years_ago_sales":
      return { ja: `${year - 3}年度`, en: `FY${year - 3}` };
    case "sales_trend":
      return { ja: `売上推移`, en: `Sales Trend` };

    default:
      return { ja: column, en: column };
      break;
  }
};

// Rowリスト 年度・上半期・下半期
export const rowHeaderListTarget = ["fiscal_year", "first_half", "second_half"];
// Rowリスト 上半期・Q1~Q2・01~06 isEndEntityの場合のみ使用 「末端エンティティ + メンバーエンティティ」
export const rowHeaderListTargetFirstHalf = [
  "first_half",
  "first_quarter",
  "second_quarter",
  "month_01",
  "month_02",
  "month_03",
  "month_04",
  "month_05",
  "month_06",
];
// Rowリスト 下半期・Q3~Q4・07~12 isEndEntityの場合のみ使用 「末端エンティティ + メンバーエンティティ」
export const rowHeaderListTargetSecondHalf = [
  "second_half",
  "third_quarter",
  "fourth_quarter",
  "month_07",
  "month_08",
  "month_09",
  "month_10",
  "month_11",
  "month_12",
];
export const formatRowName = (row: string, year: number): { ja: string; en: string; [key: string]: string } => {
  switch (row) {
    case "fiscal_year":
      // return { ja: `${year}年度`, en: `FY${year}` };
      return { ja: `年度`, en: `FY${year}` };
    case "first_half":
      return { ja: `上半期`, en: `${year}H1` };
    case "second_half":
      return { ja: `下半期`, en: `${year}H2` };

    default:
      return { ja: row, en: row };
      break;
  }
};
export const formatRowNameShort = (row: string, year: number): { ja: string; en: string; [key: string]: string } => {
  switch (row) {
    case "fiscal_year":
      return { ja: `FY${year}`, en: `FY${year}` };
    case "first_half":
      return { ja: `${year}H1`, en: `${year}H1` };
    case "second_half":
      return { ja: `${year}H2`, en: `${year}H2` };

    default:
      return { ja: row, en: row };
      break;
  }
};

export const getSubTargetTitle = (
  // entityLevel: 'department' | 'section' | 'unit' | 'office' | 'member',
  entityLevel: string,
  obj: Department | Section | Unit | Office | MemberAccounts
) => {
  switch (entityLevel) {
    case "department":
      return (obj as Department).department_name ?? "-";
    case "section":
      return (obj as Section).section_name ?? "-";
    case "unit":
      return (obj as Unit).unit_name ?? "-";
    case "office":
      return (obj as Office).office_name ?? "-";
    case "member":
      return (obj as MemberAccounts).profile_name ?? "-";

    default:
      return "-";
      break;
  }
};

type Props = {
  endEntity: string; // メンバーエンティティの直属の親エンティティ
};

// メンバーの直属の親エンティティでないメイン目標の場合は、「年度・半期」の入力
// メンバーの直属の親エンティティがメイン目標の場合は、「四半期・月度」の入力

/*
1.まず、ユーザーの会社のエンティティリストを取得して、どのエンティティまで作成されているかを把握
2.ユーザーのエンティティリストの中から、メンバーエンティティの直属の親エンティティを把握して変数に格納
3.例として、今回ユーザーの会社が「全社・事業部・課・係・メンバー」のエンティティを作成していた場合
  まず、「全社・事業部」で全社エンティティの「年度・上半期・下半期」の売上目標と「事業部」の中のそれぞれの事業部が全社の売上目標の総和からどう配分されるかシェアの振り分けをして、事業部エンティティの「年度・上半期・下半期」の売上目標を決定
4.次に「事業部・課」ですでに決定している事業部の「年度・上半期・下半期」の売上目標から
  課エンティティのそれぞれの課の「年度・上半期・下半期」の売上目標の配分を決定
5.同様に「課・係」ですでに決定している課の「年度・上半期・下半期」の売上目標から
  係エンティティのそれぞれの係の「年度・上半期・下半期」の売上目標の配分を決定
6.メンバーエンティティ以外のすべてエンティティの「年度・上半期・下半期」の売上目標が決まった後に
  「係・メンバー」の「上期・Q1・Q2・上期内の月度」の売上目標をそれぞれのメンバーの現在の新たにくる上期の案件状況や受注見込みなどを鑑みて、それぞれの係が各メンバー個人の「上期・Q1・Q2・上期内の月度」の売上目標を係の売上目標内でシェアを振り分けて決定し、同時に全ての係の「上期・Q1・Q2・上期内の月度」の売上目標が決定
7.係の「上期・Q1・Q2・上期内の月度」の売上目標が決定したことで、全ての係の積み上げから
  課・事業部・全社の「上期・Q1・Q2・上期内の月度」が決定
8.「下期・Q3・Q4・下期内の月度」の売上目標は各メンバーの下期の案件状況や受注見込み状況の見通しが見えた段階（下期の2,3ヶ月前など）で
  「下期・Q3・Q4・下期内の月度」の売上目標を6の手順で同様に目標設定する
*/

const UpsertTargetMemo = ({ endEntity }: Props) => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUpsertTargetMode = useDashboardStore((state) => state.setUpsertTargetMode);
  // メイン目標設定対象
  const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  const setUpsertTargetObj = useDashboardStore((state) => state.setUpsertTargetObj);
  // ユーザーの会計年度の期首と期末のDateオブジェクト
  const fiscalYearStartEndDate = useDashboardStore((state) => state.fiscalYearStartEndDate);

  // サブ目標リスト編集モード
  const [isOpenEditSubListModal, setIsOpenEditSubListModal] = useState(false);
  // サブ目標リスト編集 表示リスト
  const [editSubList, setEditSubList] = useState<MemberAccounts[] | Department[] | Section[] | Unit[] | Office[]>([]);
  // const [editSelectMode, setEditSelectMode] = useState<boolean | null>(null)
  // const [selectedActiveItemIds, setSelectedActiveItemIds] = useState<string[]>([]);
  // const [selectedInactiveItemIds, setSelectedInactiveItemIds] = useState<string[]>([]);
  const [selectedActiveItemIdsMap, setSelectedActiveItemIdsMap] = useState<
    Map<string, Department | Section | Unit | Office | MemberAccounts>
  >(new Map());
  const [selectedInactiveItemIdsMap, setSelectedInactiveItemIdsMap] = useState<
    Map<string, Department | Section | Unit | Office | MemberAccounts>
  >(new Map());

  // ローディング
  const [isLoading, setIsLoading] = useState(false);

  // 目標設定モードを終了
  const handleCancelUpsert = () => {
    // setUpsertTargetMode(false);
    setUpsertTargetMode(null);
    setUpsertTargetObj(null);
  };

  if (!userProfileState || !upsertTargetObj || !fiscalYearStartEndDate) {
    handleCancelUpsert();
    toast.error("エラー：会計年度データの取得に失敗しました...🙇‍♀️");
    return null;
  }

  // -------------------------- state関連 --------------------------
  // stickyを付与するrow
  const [stickyRow, setStickyRow] = useState<string | null>(null);

  const isEndEntity = endEntity === upsertTargetObj.entityLevel;

  // isEndEntityの場合の上期か下期か
  const [isFirstHalf, setIsFirstHalf] = useState(isEndEntity ? true : undefined);

  // -------------------------- 変数関連 --------------------------
  // 🔸ユーザーが選択した会計年度の期首
  const currentFiscalYearDateObj = useMemo(() => {
    return calculateFiscalYearStart({
      fiscalYearEnd: fiscalYearStartEndDate.endDate,
      fiscalYearBasis: userProfileState.customer_fiscal_year_basis ?? "firstDayBasis",
      selectedYear: upsertTargetObj.fiscalYear,
    });
  }, [fiscalYearStartEndDate.endDate, userProfileState.customer_fiscal_year_basis]);

  if (!currentFiscalYearDateObj) {
    handleCancelUpsert();
    toast.error("エラー：会計年度データの取得に失敗しました...🙇‍♀️");
    return null;
  }

  // 🔸ユーザーの選択中の会計年度の開始年月度
  const fiscalStartYearMonth = useMemo(
    () => calculateDateToYearMonth(currentFiscalYearDateObj, fiscalYearStartEndDate.endDate.getDate()),
    [currentFiscalYearDateObj]
  );

  // 🔸ユーザーが選択した売上目標の会計年度の前年度12ヶ月分の年月度の配列(isEndEntityでない場合はスルー)
  const annualFiscalMonthsUpsert = useMemo(() => {
    // 末端のエンティティでない場合は、月度の目標入力は不要のためリターン
    if (!isEndEntity) return null;
    // ユーザーが選択した会計月度基準で過去3年分の年月度を生成
    const fiscalMonths = calculateFiscalYearMonths(fiscalStartYearMonth);

    return fiscalMonths;
  }, [fiscalStartYearMonth]);

  // ユーザーが選択した売上目標の会計年度を基準にした前年度から過去3年分の年月度の配列(isEndEntityでない場合はスルー)
  // const fiscalYearMonthsForThreeYear = useMemo(() => {
  //   // 末端のエンティティでない場合は、月度の目標入力は不要のためリターン
  //   if (!isEndEntity) return null;
  //   // ユーザーが選択した会計月度基準で過去3年分の年月度を生成
  //   const fiscalMonthsLastYear = calculateFiscalYearMonths(fiscalStartYearMonth - 100);
  //   const fiscalMonthsTwoYearsAgo = calculateFiscalYearMonths(fiscalStartYearMonth - 200);
  //   const fiscalMonthsThreeYearsAgo = calculateFiscalYearMonths(fiscalStartYearMonth - 300);

  //   return {
  //     lastYear: fiscalMonthsLastYear,
  //     twoYearsAgo: fiscalMonthsTwoYearsAgo,
  //     threeYearsAgo: fiscalMonthsThreeYearsAgo,
  //   };
  // }, []);

  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================

  // ========================= 🌟メンバーリスト取得useQuery キャッシュ🌟 =========================
  const {
    data: memberDataArray,
    error: memberDataError,
    isLoading: isLoadingMember,
  } = useQueryMemberAccountsFilteredByEntity({
    entityLevel: upsertTargetObj.entityLevel,
    entityId: upsertTargetObj.entityId,
    isReady: upsertTargetObj.entityLevel === "member", // memberの時のみフェッチを許可
  });
  // ========================= 🌟メンバーリスト取得useQuery キャッシュ🌟 =========================

  // -------------------------- 部門別目標の配列 --------------------------
  // 初期値は子エンティティの全てのリストを追加し、後から不要な事業部などは外してもらう(売上目標に不要な開発や業務系の事業部など)
  const [subTargetList, setSubTargetList] = useState(() => {
    switch (upsertTargetObj.childEntityLevel) {
      case "department":
        const filteredDepartment = departmentDataArray
          ? departmentDataArray.filter((obj) => obj.target_type === "sales_target")
          : [];
        return filteredDepartment;
      case "section":
        const filteredSection = sectionDataArray
          ? sectionDataArray.filter((obj) => obj.target_type === "sales_target")
          : [];
        return filteredSection;
      case "unit":
        const filteredUnit = unitDataArray ? unitDataArray.filter((obj) => obj.target_type === "sales_target") : [];
        return filteredUnit;
      case "office":
        const filteredOffice = officeDataArray
          ? officeDataArray.filter((obj) => obj.target_type === "sales_target")
          : [];
        return filteredOffice;
      case "member":
        const filteredMember = memberDataArray
          ? memberDataArray.filter((obj) => obj.target_type === "sales_target")
          : [];
        return filteredMember;
      default:
        return [];
        break;
    }
  });
  // -------------------------- 部門別目標の配列 ここまで --------------------------

  // 部門別の名称
  const getDivName = () => {
    switch (upsertTargetObj.childEntityLevel) {
      case "department":
        return language === "ja" ? `事業部別` : `Departments`;
      case "section":
        return language === "ja" ? `課・セクション別` : `Sections`;
      case "unit":
        return language === "ja" ? `係・チーム別` : `Units`;
      case "office":
        return language === "ja" ? `事業所別` : `Offices`;
      case "member":
        return language === "ja" ? `メンバー別` : `Members`;
      default:
        return language === "ja" ? `部門別` : `Division`;
        break;
    }
  };

  // 子コンポーネントを順番にフェッチさせる
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0); // 順番にフェッチを許可
  const [allFetched, setAllFetched] = useState(false); // サブ目標コンポーネントのフェッチが全て完了したらtrueに変更

  // 全子コンポーネントがフェッチ完了したかを監視
  useEffect(() => {
    // サブ目標リストよりactiveIndexが大きくなった場合、全てフェッチが完了
    if (currentActiveIndex >= subTargetList.length) {
      setAllFetched(true);
    }
  }, [currentActiveIndex]);

  // 各サブ目標コンポーネントでフェッチ完了通知を受け取る関数
  const onFetchComplete = (tableIndex: number) => {
    // 既に現在のテーブルのindexよりcurrentActiveIndexが大きければリターン
    if (tableIndex < currentActiveIndex || allFetched) return;
    console.log(
      "onFetchComplete関数実行 tableIndex",
      tableIndex,
      "currentActiveIndex",
      currentActiveIndex,
      tableIndex < currentActiveIndex
    );
    setCurrentActiveIndex((prevIndex) => prevIndex + 1); // activeIndexを+1して次のコンポーネントのフェッチを許可
  };

  // サブ目標リスト編集モーダルを開く
  const handleOpenEditSubListModal = () => {
    const getSubListArray = () => {
      switch (upsertTargetObj.childEntityLevel) {
        case "department":
          return departmentDataArray ? [...departmentDataArray] : [];
        case "section":
          return sectionDataArray ? [...sectionDataArray] : [];
        case "unit":
          return unitDataArray ? [...unitDataArray] : [];
        case "office":
          return officeDataArray ? [...officeDataArray] : [];
        case "member":
          return memberDataArray ? [...memberDataArray] : [];
        default:
          return [];
          break;
      }
    };
    setEditSubList(getSubListArray() as MemberAccounts[] | Department[] | Section[] | Unit[] | Office[]);
    setIsOpenEditSubListModal(true);
  };

  // サブ目標リスト編集モーダルを閉じる
  const handleCloseEditSubListModal = () => {
    setEditSubList([]);
    if (selectedActiveItemIdsMap.size > 0) setSelectedActiveItemIdsMap(new Map());
    if (selectedInactiveItemIdsMap.size > 0) setSelectedInactiveItemIdsMap(new Map());
    setIsOpenEditSubListModal(false);
  };

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

  const handleUpdateSubList = async (updateType: "add" | "remove") => {
    // エンティティタイプからupdateするテーブルを確定
    const entityLevel = upsertTargetObj.childEntityLevel;
    let updatedTable = "";
    if (entityLevel === "department") updatedTable = "departments";
    if (entityLevel === "section") updatedTable = "sections";
    if (entityLevel === "unit") updatedTable = "units";
    if (entityLevel === "office") updatedTable = "offices";
    if (entityLevel === "member") updatedTable = "profiles";
    if (entityLevel === "") return alert("部門データが見つかりませんでした。");

    const newTargetType = updateType === "add" ? "sales_target" : null;
    const updatedPayload = { target_type: newTargetType };
    // idのみの配列を生成
    const updatedEntityIds =
      updateType === "add" ? [...selectedInactiveItemIdsMap.keys()] : [...selectedActiveItemIdsMap.keys()];
    // 今回更新するMapオブジェクトを代入
    const updatedEntityIdsMap = updateType === "add" ? selectedInactiveItemIdsMap : selectedActiveItemIdsMap;

    setIsLoading(true); // ローディング開始

    try {
      console.log(
        "削除実行🔥 updatedTable",
        updatedTable,
        updatedPayload,
        "updatedEntityIds",
        updatedEntityIds,
        "selectedInactiveItemIdsMap",
        selectedInactiveItemIdsMap,
        "selectedActiveItemIdsMap",
        selectedActiveItemIdsMap
      );
      const { error } = await supabase.from(updatedTable).update(updatedPayload).in("id", updatedEntityIds);

      if (error) throw error;

      // キャッシュの部門からsales_targetをnullに更新する
      let queryKey = "departments";
      if (entityLevel === "department") queryKey = "departments";
      if (entityLevel === "section") queryKey = "sections";
      if (entityLevel === "unit") queryKey = "units";
      if (entityLevel === "office") queryKey = "offices";
      if (entityLevel === "member") queryKey = "member_accounts";
      const prevCache = queryClient.getQueryData([queryKey]) as
        | Department[]
        | Section[]
        | Unit[]
        | Office[]
        | MemberAccounts[];
      let newCache = [...prevCache]; // キャッシュのシャローコピーを作成
      // 更新対象のオブジェクトのtarget_typeをsales_target or nullに変更
      newCache = newCache.map((obj) =>
        updatedEntityIdsMap.has(obj.id) ? { ...obj, target_type: newTargetType } : obj
      );
      console.log("キャッシュを更新 newCache", newCache);
      queryClient.setQueryData([queryKey], newCache); // キャッシュを更新

      if (updateType === "remove") {
        // 固定していた場合は固定を解除
        if (!!stickyRow && updatedEntityIdsMap.has(stickyRow)) {
          setStickyRow(null);
        }
      }

      setIsLoading(false); // ローディング終了

      // サブ目標リストを更新
      const newList = newCache.filter((obj) => obj.target_type === "sales_target") as
        | Department[]
        | Section[]
        | Unit[]
        | Office[]
        | MemberAccounts[];
      setSubTargetList(newList);

      // モーダル内のリストを更新
      setEditSubList(newCache as MemberAccounts[] | Department[] | Section[] | Unit[] | Office[]);

      const successMsg = updateType === "add" ? `目標リストに追加しました🌟` : `目標リストから削除しました🌟`;
      toast.success(successMsg);

      // リセット
      if (updateType === "add") {
        setSelectedInactiveItemIdsMap(new Map());
      } else {
        setSelectedActiveItemIdsMap(new Map());
      }
    } catch (error: any) {
      console.error("エラー：", error);
      const errorMsg =
        updateType === "add" ? `目標リストへの追加に失敗しました...🙇‍♀️` : "目標リストからの削除に失敗しました...🙇‍♀️";
      toast.error(errorMsg);
    }
  };

  console.log(
    "UpsertTargetコンポーネントレンダリング isEndEntity",
    isEndEntity,
    "endEntity",
    endEntity,
    upsertTargetObj,
    "サブ目標リスト",
    subTargetList,
    "memberDataArray",
    memberDataArray,
    "editSubList",
    editSubList
  );

  return (
    <>
      {/* ローディング */}
      {isLoading && (
        <div
          className={`flex-center fixed left-0 top-0 z-[5000] h-full w-full bg-[var(--overlay-loading-modal-inside)]`}
        >
          <SpinnerBrand withBorder withShadow />
        </div>
      )}
      {/* ===================== スクロールコンテナ ここから ===================== */}
      <div className={`${styles.main_contents_container}`}>
        {/* ----------------- １画面目 上画面 ----------------- */}
        <section
          // className={`${styles.company_screen} space-y-[20px] ${
          className={`${styles.company_table_screen}`}
        >
          <div className={`${styles.title_area} ${styles.upsert} flex w-full justify-between`}>
            <h1 className={`${styles.title} ${styles.upsert}`}>
              <span>目標設定</span>
            </h1>
            <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
              <div className={`${styles.btn} ${styles.basic}`} onClick={handleCancelUpsert}>
                <span>戻る</span>
              </div>
              <div
                className={`${styles.btn} ${styles.brand} space-x-[3px]`}
                onClick={(e) => {
                  console.log("クリック");
                }}
              >
                {/* <RiSave3Fill className={`stroke-[3] text-[12px] text-[#fff]`} /> */}
                <MdSaveAlt className={`text-[14px] text-[#fff]`} />
                <span>保存</span>
              </div>
            </div>
          </div>
        </section>
        {/* ----------------- ２画面目 下画面 ----------------- */}
        <section className={`${styles.main_section_area} fade08_forward`}>
          {/* ------------------ コンテンツエリア ------------------ */}
          <div className={`${styles.contents_area} ${styles.upsert}`}>
            {/* ---------- 総合目標 ---------- */}
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense
                fallback={
                  <FallbackTargetTable
                    title={upsertTargetObj.entityName}
                    isSettingYearHalf={!isEndEntity}
                    hiddenBg={true}
                    hiddenTitle={true}
                  />
                }
              >
                <div
                  className={`${styles.row_container} ${
                    stickyRow === upsertTargetObj.entityId ? styles.sticky_row : ``
                  }`}
                >
                  <UpsertTargetGridTable
                    isEndEntity={isEndEntity}
                    entityLevel={upsertTargetObj.entityLevel}
                    entityId={upsertTargetObj.entityId}
                    entityNameTitle={upsertTargetObj.entityName}
                    stickyRow={stickyRow}
                    setStickyRow={setStickyRow}
                    annualFiscalMonths={annualFiscalMonthsUpsert}
                    isFirstHalf={isFirstHalf}
                    isMainTarget={true}
                  />
                </div>
              </Suspense>
            </ErrorBoundary>
            {/* <FallbackTargetTable
              title={upsertTargetObj.entityName}
              isSettingYearHalf={!isEndEntity}
              hiddenBg={true}
              hiddenTitle={true}
            /> */}
            {/* ---------- 総合目標 ここまで ---------- */}

            {/* ----------- タイトルエリア ----------- */}
            <div className={`${styles.section_title_area} flex w-full items-end justify-between`}>
              <h1 className={`${styles.title} ${styles.upsert}`}>
                {/* <span>部門別</span> */}
                <span>{getDivName()}</span>
              </h1>

              <div className={`${styles.btn_area} flex h-full items-center space-x-[12px]`}>
                <div className={`${styles.btn} ${styles.basic} space-x-[6px]`} onClick={handleOpenEditSubListModal}>
                  <HiOutlineSwitchHorizontal className={`text-[14px] `} />
                  <span>部門リスト編集</span>
                </div>
                {/* <div
                  className={`${styles.btn} ${styles.brand} space-x-[3px]`}
                  onClick={(e) => {
                    console.log("クリック");
                  }}
                >
                  <MdSaveAlt className={`text-[14px] text-[#fff]`} />
                  <span>保存</span>
                </div> */}
              </div>
            </div>
            {/* ----------- タイトルエリア ここまで ----------- */}

            {/* ----------- 部門別シェア ３列エリア ----------- */}
            {!allFetched && (
              <div className={`flex-center fade08_forward h-full max-h-[225px] min-h-[225px] w-full`}>
                <SpinnerX />
              </div>
            )}
            {allFetched && (
              <div className={`${styles.grid_row} ${styles.col3} fade08_forward`}>
                <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                  <div className={`${styles.card_title_area}`}>
                    <div className={`${styles.card_title}`}>
                      <span>売上目標シェア {upsertTargetObj.fiscalYear}年度</span>
                    </div>
                  </div>
                  <div className={`${styles.main_container}`}></div>
                </div>
                <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                  <div className={`${styles.card_title_area}`}>
                    <div className={`${styles.card_title}`}>
                      <span>売上シェア {upsertTargetObj.fiscalYear - 1}年度</span>
                    </div>
                  </div>
                  <div className={`${styles.main_container}`}></div>
                </div>
                <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                  <div className={`${styles.card_title_area}`}>
                    <div className={`${styles.card_title}`}>
                      <span>売上シェア {upsertTargetObj.fiscalYear - 2}年度</span>
                    </div>
                  </div>
                  <div className={`${styles.main_container}`}></div>
                </div>
              </div>
            )}
            {/* ----------- 部門別シェア ３列エリア ここまで ----------- */}

            {/* ---------- 部門別目標 ---------- */}
            {subTargetList &&
              subTargetList.length > 0 &&
              subTargetList.map((obj, tableIndex) => {
                const childEntityLevel = upsertTargetObj.childEntityLevel;
                const targetTitle = getSubTargetTitle(childEntityLevel, obj);
                // currentActiveIndexより大きいindexのテーブルはローディングを表示しておく
                if (tableIndex > currentActiveIndex) {
                  // console.log(
                  //   "部門別目標 ローディング中🙇 tableIndex",
                  //   tableIndex,
                  //   "currentActiveIndex",
                  //   currentActiveIndex,
                  //   "targetTitle",
                  //   targetTitle
                  // );
                  return (
                    <Fragment key={`${obj.id}_${childEntityLevel}_${targetTitle}_fallback`}>
                      <FallbackTargetTable
                        title={upsertTargetObj.entityName}
                        isSettingYearHalf={!isEndEntity}
                        hiddenBg={true}
                        hiddenTitle={true}
                      />
                    </Fragment>
                  );
                }
                // console.log(
                //   "部門別目標 アクティブマウント🔥 tableIndex",
                //   tableIndex,
                //   "currentActiveIndex",
                //   currentActiveIndex,
                //   "targetTitle",
                //   targetTitle
                // );

                return (
                  <Fragment key={`${obj.id}_${childEntityLevel}_${targetTitle}`}>
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Suspense fallback={<FallbackTargetTable title={targetTitle} />}>
                        <div className={`${styles.row_container} ${stickyRow === obj.id ? styles.sticky_row : ``}`}>
                          <UpsertTargetGridTable
                            isEndEntity={isEndEntity}
                            entityLevel={childEntityLevel}
                            entityId={obj.id}
                            entityNameTitle={targetTitle}
                            stickyRow={stickyRow}
                            setStickyRow={setStickyRow}
                            annualFiscalMonths={annualFiscalMonthsUpsert}
                            isFirstHalf={isFirstHalf}
                            isMainTarget={false}
                            fetchEnabled={tableIndex === currentActiveIndex || allFetched} // インデックスが一致しているか、全てフェッチが完了している時のみフェッチを許可
                            onFetchComplete={() => onFetchComplete(tableIndex)}
                            subTargetList={subTargetList}
                            setSubTargetList={setSubTargetList}
                          />
                        </div>
                      </Suspense>
                    </ErrorBoundary>
                  </Fragment>
                );
              })}
            {/* ---------- 部門別目標 ここまで ---------- */}
          </div>
          {/* ------------------ コンテンツエリア ここまで ------------------ */}
        </section>

        {/* ----------------- ２画面目 下画面 ここまで ----------------- */}
      </div>
      {/* ===================== スクロールコンテナ ここまで ===================== */}

      {isOpenEditSubListModal && (
        <>
          <div
            className={`fade03_forward fixed left-0 top-0 z-[100] h-[100vh] w-[100vw] bg-[#00000030] backdrop-blur-[6px]`}
            onClick={handleCloseEditSubListModal}
          ></div>
          <div className={`${styles.switch_container} fade05_forward`}>
            {/* 保存キャンセルエリア */}
            <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[30px] text-center text-[18px]">
              <div
                className="relative flex min-w-[125px] cursor-pointer select-none items-center pl-[10px] text-start font-semibold hover:text-[#aaa]"
                onClick={handleCloseEditSubListModal}
              >
                {/* <span>キャンセル</span> */}
                <BsChevronLeft className="z-1 absolute  left-[-25px] top-[50%] translate-y-[-50%] text-[24px]" />
                <span>戻る</span>
              </div>
              <div className="select-none font-bold">目標リスト編集</div>
              {/* <div className="-translate-x-[25px] font-bold">カラム並び替え・追加/削除</div> */}
              <div
                className={`min-w-[125px] cursor-pointer select-none text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${
                  styles.save_text
                } ${
                  selectedActiveItemIdsMap.size === 0 && selectedInactiveItemIdsMap.size === 0
                    ? `!text-[color-text-sub]`
                    : ``
                } ${selectedInactiveItemIdsMap.size > 0 ? `!text-[var(--bright-green)]` : ``} ${
                  selectedActiveItemIdsMap.size > 0 ? `!text-[var(--main-color-tk)]` : ``
                }`}
                onClick={async () => {
                  if (selectedActiveItemIdsMap.size === 0 && selectedInactiveItemIdsMap.size === 0) return;
                  // 売上目標に追加
                  if (selectedInactiveItemIdsMap.size > 0 && selectedActiveItemIdsMap.size === 0) {
                    handleUpdateSubList("add");
                  }
                  // 売上目標から削除
                  if (selectedActiveItemIdsMap.size > 0 && selectedInactiveItemIdsMap.size === 0) {
                    handleUpdateSubList("remove");
                  }
                }}
              >
                <span
                  onMouseEnter={(e) => {
                    if (selectedActiveItemIdsMap.size === 0 && selectedInactiveItemIdsMap.size === 0) return;
                    const text =
                      selectedInactiveItemIdsMap.size > 0
                        ? `選択したアイテムをリストに追加`
                        : selectedActiveItemIdsMap.size > 0
                        ? `選択したアイテムをリストから削除`
                        : ``;
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: text,
                      marginTop: 12,
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  {selectedInactiveItemIdsMap.size > 0 && selectedActiveItemIdsMap.size === 0 && `追加`}
                  {selectedActiveItemIdsMap.size > 0 && selectedInactiveItemIdsMap.size === 0 && `削除`}
                </span>
              </div>
            </div>
            {/* メインコンテンツ コンテナ */}
            <div className={`${styles.edit_contents_container}`}>
              {/* 右コンテンツボックス */}
              <div className={`flex h-full  basis-5/12 flex-col items-center ${styles.content_box}`}>
                {/* タイトルエリア */}
                <div className={`${styles.title} w-full space-x-[12px] text-[var(--color-edit-arrow-disable-color)]`}>
                  <div
                    className={`flex-center h-[30px] cursor-not-allowed rounded-[9px] px-[12px] ${styles.icon_button} ${
                      selectedActiveItemIdsMap.size > 0 ? `${styles.inactive}` : ``
                    } ${selectedInactiveItemIdsMap.size > 0 ? `${styles.add}` : ``}`}
                    onMouseEnter={(e) => {
                      const text =
                        selectedInactiveItemIdsMap.size > 0
                          ? `選択したアイテムをリストに追加`
                          : `目標リストに追加するアイテムを選択してください`;
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: text,
                        marginTop: 6,
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                    onClick={async () => {
                      if (selectedActiveItemIdsMap.size > 0) return;
                      // 売上目標に追加
                      if (selectedInactiveItemIdsMap.size > 0) {
                        handleUpdateSubList("add");
                      }
                    }}
                  >
                    <span className="text-[12px]">追加</span>
                  </div>
                  <div
                    className={`flex-center h-[30px] cursor-not-allowed rounded-[9px] px-[12px] ${styles.icon_button} ${
                      selectedActiveItemIdsMap.size > 0 ? `${styles.remove}` : ``
                    } ${selectedInactiveItemIdsMap.size > 0 ? `${styles.inactive}` : ``}`}
                    onMouseEnter={(e) => {
                      const text =
                        selectedActiveItemIdsMap.size > 0
                          ? `選択したアイテムをリストから削除`
                          : `目標リストから削除するアイテムを選択してください`;
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: text,
                        marginTop: 6,
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                    onClick={() => {
                      if (selectedInactiveItemIdsMap.size > 0) return;
                      if (selectedActiveItemIdsMap.size > 0) {
                        handleUpdateSubList("remove");
                      }
                    }}
                  >
                    <span className="text-[12px]">削除</span>
                  </div>

                  <div
                    // ref={resetRightRef}
                    className={`flex-center h-[30px] w-[30px] cursor-not-allowed rounded-full  ${styles.icon_button} ${
                      !!selectedActiveItemIdsMap.size || !!selectedInactiveItemIdsMap.size
                        ? `${styles.arrow_right_reset_active}`
                        : ``
                    }`}
                    onMouseEnter={(e) => {
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: `リセット`,
                        marginTop: 6,
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                    onClick={() => {
                      if (selectedActiveItemIdsMap.size > 0) setSelectedActiveItemIdsMap(new Map());
                      if (selectedInactiveItemIdsMap.size > 0) setSelectedInactiveItemIdsMap(new Map());
                    }}
                  >
                    <GrPowerReset className="pointer-events-none text-[16px]" />
                  </div>
                  {(!!selectedActiveItemIdsMap.size || !!selectedInactiveItemIdsMap.size) && (
                    <div className="ml-auto flex h-full w-fit flex-1 items-center justify-end">
                      {selectedActiveItemIdsMap.size > 0 && (
                        <span className={`text-[14px] text-[var(--color-text-brand-f)]`}>
                          {selectedActiveItemIdsMap.size}件選択中
                        </span>
                      )}
                      {selectedInactiveItemIdsMap.size > 0 && (
                        <span className={`text-[14px] text-[var(--color-text-brand-f)]`}>
                          {selectedInactiveItemIdsMap.size}件選択中
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {/* カラムリストエリア */}
                <ul className={`${styles.sortable_list}`}>
                  {editSubList.map((item, index) => (
                    <li
                      key={`right_${item.id}_${item.target_type}`}
                      className={`${styles.item} ${styles.item_right} ${
                        item.target_type !== "sales_target" ? `${styles.inactive}` : ``
                      } ${selectedActiveItemIdsMap.has(item.id) ? `${styles.remove}` : ``} ${
                        selectedInactiveItemIdsMap.has(item.id) ? `${styles.add}` : ``
                      }`}
                      onClick={() => {
                        // 表示中のitemをクリック
                        if (item.target_type === "sales_target") {
                          if (selectedInactiveItemIdsMap.size > 0) setSelectedInactiveItemIdsMap(new Map()); // 非表示選択リストはリセット

                          const newMap = new Map(selectedActiveItemIdsMap); // 現在のMapのシャローコピーを作成

                          if (newMap.has(item.id)) {
                            // 既に入っている場合は取り除く
                            newMap.delete(item.id);
                          } else {
                            // 含まれていない場合は追加する
                            newMap.set(item.id, item);
                          }

                          setSelectedActiveItemIdsMap(newMap);
                        }
                        // 非表示のitem
                        else {
                          if (selectedActiveItemIdsMap.size > 0) setSelectedActiveItemIdsMap(new Map()); // 表示中選択リストはリセット

                          const newMap = new Map(selectedInactiveItemIdsMap);

                          if (newMap.has(item.id)) {
                            // 既に入っている場合は取り除く
                            newMap.delete(item.id);
                          } else {
                            // 含まれていない場合は追加する
                            newMap.set(item.id, item);
                          }
                          setSelectedInactiveItemIdsMap(newMap);
                        }
                      }}
                    >
                      <div className={styles.details}>
                        <span className="truncate">{getSubTargetTitle(upsertTargetObj.childEntityLevel, item)}</span>
                        {/* <MdOutlineDragIndicator className="fill-[var(--color-text)]" /> */}
                      </div>
                      {item.target_type === "sales_target" && (
                        <span className="min-w-max text-[10px] text-[var(--color-text-brand-f)]">表示中</span>
                      )}
                    </li>
                  ))}
                </ul>
                {/* <span ref={scrollBottomRef}></span> */}
              </div>
            </div>
            {/* {hoveredItemPosModal && <TooltipModal />} */}
          </div>
        </>
      )}
    </>
  );
};

export const UpsertTarget = memo(UpsertTargetMemo);
