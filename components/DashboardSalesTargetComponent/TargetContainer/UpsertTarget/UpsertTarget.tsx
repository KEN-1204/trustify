import useStore from "@/store";
import styles from "../../DashboardSalesTargetComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { CSSProperties, Suspense, memo, useEffect, useMemo, useState } from "react";
import { FaSave } from "react-icons/fa";
import { IoIosSave } from "react-icons/io";
import { MdSaveAlt } from "react-icons/md";
import { RiSave3Fill } from "react-icons/ri";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { Department, Office, Section, Unit } from "@/types";
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

export const columnHeaderListTarget = [
  "period_type",
  "sales_target",
  "share", // 「年度に対する上期・下期のシェア」、「半期に対する各月度のシェア」
  "yoy_growth", // 前年度の売上に対する売上目標の成長率
  "yo2y_growth", // 前年度前年伸び率実績(2年前から1年前の成長率)
  "last_year_sales",
  "two_years_ago_sales",
  "three_years_ago_sales",
  // "ly_sales",
  // "lly_sales",
  // "llly_sales",
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
    case "ly_sales":
      return { ja: `${year - 1}年度`, en: `FY${year - 1}` };
    case "lly_sales":
      return { ja: `${year - 2}年度`, en: `FY${year - 2}` };
    case "llly_sales":
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
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setIsUpsertTargetMode = useDashboardStore((state) => state.setIsUpsertTargetMode);
  // メイン目標設定対象
  const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  const setUpsertTargetObj = useDashboardStore((state) => state.setUpsertTargetObj);
  // ユーザーの会計年度の期首と期末のDateオブジェクト
  const fiscalYearStartEndDate = useDashboardStore((state) => state.fiscalYearStartEndDate);

  // 目標設定モードを終了
  const handleCancelUpsert = () => {
    setIsUpsertTargetMode(false);
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

  const isEndEntity = endEntity === upsertTargetObj.entityType;

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

  // -------------------------- 関数 --------------------------

  console.log(
    "UpsertTargetコンポーネントレンダリング isEndEntity",
    isEndEntity,
    "endEntity",
    endEntity,
    upsertTargetObj
  );

  return (
    <>
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
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense fallback={<FallbackScrollContainer title={upsertTargetObj.entityName} />}>
                <div className={`${stickyRow === upsertTargetObj.entityId ? styles.sticky_row : ``}`}>
                  <UpsertTargetGridTable
                    isEndEntity={isEndEntity}
                    entityType={upsertTargetObj.entityType}
                    entityId={upsertTargetObj.entityId}
                    entityNameTitle={upsertTargetObj.entityName}
                    stickyRow={stickyRow}
                    setStickyRow={setStickyRow}
                    annualFiscalMonths={annualFiscalMonthsUpsert}
                    // fiscalYearMonthsForThreeYear={fiscalYearMonthsForThreeYear}
                    isFirstHalf={isFirstHalf}
                    // startYearMonth={
                    //   fiscalYearMonthsForThreeYear && fiscalYearMonthsForThreeYear.threeYearsAgo?.month_01
                    //     ? fiscalYearMonthsForThreeYear.threeYearsAgo.month_01
                    //     : undefined
                    // }
                    // endYearMonth={
                    //   fiscalYearMonthsForThreeYear && fiscalYearMonthsForThreeYear.lastYear?.month_12
                    //     ? fiscalYearMonthsForThreeYear.lastYear.month_12
                    //     : undefined
                    // }
                  />
                </div>
              </Suspense>
            </ErrorBoundary>

            {/* ----------- 部門別シェア ３列エリア ----------- */}
            {/* タイトルエリア */}
            <div className={`${styles.section_title_area} flex w-full items-end justify-between`}>
              <h1 className={`${styles.title}`}>
                <span>部門別</span>
              </h1>

              <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
                {/* <div className={`${styles.btn} ${styles.basic}`}>
                  <span>戻る</span>
                </div> */}
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
            {/* タイトルエリア */}

            <div className={`${styles.grid_row} ${styles.col3}`}>
              <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                {/* タイトルエリア */}
                <div className={`${styles.card_title_area}`}>
                  <div className={`${styles.card_title}`}>
                    <span>売上目標シェア {upsertTargetObj.fiscalYear}年度</span>
                    {/* <span>売上目標・スローガン・重点方針</span> */}
                  </div>
                </div>
                {/* コンテンツエリア */}
                <div className={`${styles.main_container}`}></div>
              </div>
              <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                {/* タイトルエリア */}
                <div className={`${styles.card_title_area}`}>
                  <div className={`${styles.card_title}`}>
                    <span>売上シェア {upsertTargetObj.fiscalYear - 1}年度</span>
                  </div>
                </div>
                {/* コンテンツエリア */}
                <div className={`${styles.main_container}`}></div>
              </div>
              <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                {/* タイトルエリア */}
                <div className={`${styles.card_title_area}`}>
                  <div className={`${styles.card_title}`}>
                    {/* <span>スローガン・重点方針</span> */}
                    <span>売上シェア {upsertTargetObj.fiscalYear - 2}年度</span>
                  </div>
                </div>
                {/* コンテンツエリア */}
                <div className={`${styles.main_container}`}></div>
              </div>
            </div>
            {/* ----------- 部門別シェア ３列エリア ここまで ----------- */}
          </div>
          {/* ------------------ コンテンツエリア ここまで ------------------ */}
        </section>

        {/* ----------------- ２画面目 下画面 ここまで ----------------- */}
      </div>
      {/* ===================== スクロールコンテナ ここまで ===================== */}
    </>
  );
};

export const UpsertTarget = memo(UpsertTargetMemo);
