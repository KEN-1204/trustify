import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { useMutateProduct } from "@/hooks/useMutateProduct";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Department, Office, Product, Section, Unit } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { CSSProperties, FC, Fragment, memo, useEffect, useMemo, useState } from "react";
import styles from "./SettingSalesTargets.module.css";
import NextImage from "next/image";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { officeTagIcons, unitTagIcons } from "../SettingCompany/data";
import { useQuerySections } from "@/hooks/useQuerySections";
import { dataIllustration, winnersIllustration } from "@/components/assets";
import { RxDot } from "react-icons/rx";
import { IoCaretDownOutline } from "react-icons/io5";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { SalesTargetGridContainer, SalesTargetGridContainerForMonthly } from "./SalesTargetGridContainer";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { dataPie } from "@/components/Parts/Charts/Seeds/seedData";
import { PieSectorDataItem } from "recharts/types/polar/Pie";
import { formatSalesTarget } from "@/utils/Helpers/formatSalesTarget";
import { renderActiveShape } from "@/components/Parts/Charts/renderActiveShape/renderActiveShape";

const SettingSalesTargetsMemo: FC = () => {
  // const theme = useThemeStore((state) => state.theme);
  const setIsOpenSettingAccountModal = useDashboardStore((state) => state.setIsOpenSettingAccountModal);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  // const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  // const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // 上画面の選択中の列データ会社
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const [activeTargetTab, setActiveTargetTab] = useState("Sales");

  const colorsArray = [
    "bg-rose-500", // #f43f5e
    "bg-emerald-500", // #10b981
    "bg-blue-500", // #3d82f6
    "bg-indigo-500", // #6366f1
    "bg-fuchsia-500", // #d946ef
    "bg-amber-500", // #f59e0b
    "bg-pink-500", // #ec4899
    "bg-sky-500", // #0ea5e9
    "bg-violet-500", // #8b5cf6
    "bg-purple-500", // #a855f7
    "bg-lime-500", // #84cc16
    "bg-orange-500", // #f97316
    "bg-green-500", // #22c55e
    "bg-red-500", // #ef4444
  ];

  const COLORS = ["#f43f5e", "#10b981", "#3d82f6", "#6366f1", "#d946ef"];

  const monthlySaleTargetData = useMemo(() => {
    return Array(12)
      .fill(null)
      .map((_, index) => {
        let year = 2024;
        let month = index + 4; // 4月スタート
        let displayMonth = ``;
        // 9月まで
        if (month < 10) {
          displayMonth = `0${month}`;
        } else if (month > 12) {
          year += 1;
          displayMonth = `0${month - 12}`;
        } else {
          displayMonth = `${month}`;
        }

        console.log("year", year, "month", month, "displayMonth", displayMonth);

        const initialObj = {
          sales_target_period_value: Number(`${year}${displayMonth}`),
          sales_target: 123000000,
          sales_target_last_year: 113000000,
          sales_target_two_year_ago: 103000000,
        };
        return initialObj;
      });
  }, []);
  const monthlySaleTargetDataFirstHalf = useMemo(() => {
    return Array(6)
      .fill(null)
      .map((_, index) => {
        let year = 2024;
        let month = index + 4; // 4月スタート
        let displayMonth = ``;
        // 9月まで
        if (month < 10) {
          displayMonth = `0${month}`;
        } else if (month > 12) {
          year += 1;
          displayMonth = `0${month - 12}`;
        } else {
          displayMonth = `${month}`;
        }

        console.log("year", year, "month", month, "displayMonth", displayMonth);

        const initialObj = {
          sales_target_period_value: Number(`${year}${displayMonth}`),
          sales_target: 123000000,
          sales_target_last_year: 113000000,
          sales_target_two_year_ago: 103000000,
        };
        return initialObj;
      });
  }, []);
  const monthlySaleTargetDataLastHalf = useMemo(() => {
    return Array(6)
      .fill(null)
      .map((_, index) => {
        let year = 2024;
        let month = index + 10; // 4月スタート
        let displayMonth = ``;
        // 9月まで
        if (month < 10) {
          displayMonth = `0${month}`;
        } else if (month > 12) {
          year += 1;
          displayMonth = `0${month - 12}`;
        } else {
          displayMonth = `${month}`;
        }

        console.log("year", year, "month", month, "displayMonth", displayMonth);

        const initialObj = {
          sales_target_period_value: Number(`${year}${displayMonth}`),
          sales_target: 123000000,
          sales_target_last_year: 113000000,
          sales_target_two_year_ago: 103000000,
        };
        return initialObj;
      });
  }, []);

  // 決算日を取得して変数に格納
  const fiscalYearEndDate = useMemo(() => {
    return userProfileState?.customer_fiscal_end_month
      ? new Date(userProfileState.customer_fiscal_end_month)
      : new Date(new Date().getFullYear(), 2, 31);
  }, [userProfileState?.customer_fiscal_end_month]);

  // 現在の会計年度(現在の日付からユーザーの会計年度を取得)
  const currentFiscalYearDateObj = useMemo(() => {
    return (
      calculateFiscalYearStart({
        fiscalYearEnd: fiscalYearEndDate,
        fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis",
      }) ?? new Date()
    );
  }, [fiscalYearEndDate, userProfileState?.customer_fiscal_year_basis]);

  const initialTabs = useMemo(() => {
    return {
      year: fiscalYearEndDate,
      section: "company",
      periodType: "fiscalYear",
      // periodType: "firstHalf",
    };
  }, []);

  // 「年度」・「年度+半期」・「半期+四半期+月度」
  const [activeSectionTabs, setActiveSectionTabs] = useState(initialTabs);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

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

  // const [departmentSpecificProducts, setDepartmentSpecificProducts] = useState<({ [x: string]: Product[] } | null)[]>(
  const [sectionIdToNameMap, setSectionIdToNameMap] = useState<{ [key: string]: string } | null>(null);
  const [unitIdToNameMap, setUnitIdToNameMap] = useState<{ [key: string]: string } | null>(null);
  const [officeIdToNameMap, setOfficeIdToNameMap] = useState<{ [key: string]: string } | null>(null);

  // 「課・セクション」「係・チーム」「事業所」のid to nameオブジェクトマップ生成
  useEffect(() => {
    // 🔹section
    if (sectionDataArray && sectionDataArray.length >= 1) {
      // 課・セクションマップ {課・セクションid: 課・セクション名}
      const sectionMap = sectionDataArray.reduce((acc, section: Section) => {
        // nullでないことを確認し、nullの場合はUnknownを使用
        const key: string = section.id === null ? "All" : section.id;
        acc[key] = section.section_name || "Unknown";

        return acc;
      }, {} as { [key: string]: string });
      setSectionIdToNameMap(sectionMap);
    } else {
      setSectionIdToNameMap(null);
    }
    // 🔹unit
    if (unitDataArray && unitDataArray.length >= 1) {
      // 事業所マップ {事業所id: 事業所名}
      const unitMap = unitDataArray.reduce((acc, unit: Unit) => {
        // nullでないことを確認し、nullの場合はUnknownを使用
        const key: string = unit.id === null ? "All" : unit.id;
        acc[key] = unit.unit_name || "Unknown";

        return acc;
      }, {} as { [key: string]: string });
      setUnitIdToNameMap(unitMap);
    } else {
      setUnitIdToNameMap(null);
    }
    // 🔹office
    if (officeDataArray && officeDataArray.length >= 1) {
      const officeMap = officeDataArray.reduce((acc, office: Office) => {
        // nullでないことを確認し、nullの場合はUnknownを使用
        const key: string = office.id === null ? "All" : office.id;
        acc[key] = office.office_name || "Unknown";

        return acc;
      }, {} as { [key: string]: string });
      setOfficeIdToNameMap(officeMap);
    } else {
      setOfficeIdToNameMap(null);
    }
  }, [unitDataArray, officeDataArray]);

  // パイチャート
  const dataChart = dataPie;

  console.log(
    "SettingSalesTargetsコンポーネントレンダリング",
    "✅sectionIdToNameMap",
    sectionIdToNameMap,
    "✅unitIdToNameMap",
    unitIdToNameMap,
    "✅officeIdToNameMap",
    officeIdToNameMap,
    "タブ初期値",
    initialTabs,
    "アクティブタブ",
    activeSectionTabs
  );

  const getUnderline = (tab: string): CSSProperties => {
    if (tab === "Sales") return { left: 0, width: `60px` };
    if (tab === "Process") return { left: 80, width: `90px` };
    return { left: 0, width: `60px` };
  };

  type TagProps = {
    entityName: string | null;
    withImg?: boolean;
    imgUrl?: string;
  };
  const EntityTag = ({ entityName, withImg = false, imgUrl }: TagProps) => {
    if (!entityName) return null;
    if (withImg && !imgUrl) return null;
    return (
      <div
        className={`transition-bg03 text-[var(--color-text-title)]} ml-[10px] flex min-h-[29px] max-w-[220px] select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[13px] hover:border-[var(--color-bg-brand-f)]`}
      >
        {withImg && imgUrl && (
          <NextImage src={imgUrl} alt="tag" className="ml-[-4px] w-[16px]" width={16} height={16} />
        )}
        <span className="truncate text-[12px] font-normal">{entityName ?? ""}</span>
      </div>
    );
  };

  type CustomizedLabelProps = {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    index: number;
  };
  // パイチャート用カスタムラベル
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: CustomizedLabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // return (
    //   <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
    //     {`${(percent * 100).toFixed(0)}%`}
    //   </text>
    // );
    return (
      <text x={x} y={y} dy={15} fill="black" fontSize="10px" textAnchor={"middle"}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const [activeIndex, setActiveIndex] = useState<number>(0);

  const onPieEnter = (_: void, index: number) => {
    setActiveIndex(index);
  };

  return (
    <>
      {/* 右側メインエリア プロフィール */}
      {selectedSettingAccountMenu === "SalesTargets" && (
        <div
          className={`flex h-full w-full flex-col overflow-x-hidden overflow-y-scroll px-[20px] pb-[20px] pr-[80px] text-[var(--color-text-title)]`}
        >
          <h2 className={`mt-[20px] flex flex-col text-[15px] font-bold`}>
            <div className="mb-[6px] flex gap-[20px]">
              <div
                className={`relative flex w-max min-w-max flex-col items-center hover:text-[var(--color-text-title)] ${
                  activeTargetTab === "Sales"
                    ? `text-[var(--color-text-title)]`
                    : `cursor-pointer text-[var(--color-text-sub)]`
                }`}
                onClick={() => {
                  if (activeTargetTab !== "Sales") setActiveTargetTab("Sales");
                }}
              >
                <span className={``}>売上目標</span>
              </div>
              <div
                className={`relative flex w-max min-w-max flex-col items-center hover:text-[var(--color-text-title)] ${
                  activeTargetTab === "Process"
                    ? `text-[var(--color-text-title)]`
                    : `cursor-pointer text-[var(--color-text-sub)]`
                }`}
                onClick={() => {
                  if (activeTargetTab !== "Process") setActiveTargetTab("Process");
                }}
              >
                <span className={``}>プロセス目標</span>
              </div>
            </div>
            <div className="relative min-h-[2px] w-full bg-[var(--color-bg-sub)]">
              <div
                className={`${styles.section_title_underline} absolute left-0 top-0 min-h-[2px] w-[60px] bg-[var(--color-bg-brand-f)]`}
                style={{ ...(activeTargetTab && getUnderline(activeTargetTab)) }}
                // style={{ ...(activeTargetTab && { left: 80, width: `90px` }) }}
              />
            </div>
          </h2>

          <div className="mt-[15px] flex min-h-[168px] w-full items-center justify-between overflow-hidden rounded-[8px] bg-[var(--setting-bg-sub)]">
            <div className="flex flex-col space-y-3 p-[24px] pr-[0px]">
              <h4 className="font-bold">最小の資本と人で、最大の経済効果(付加価値)を上げる</h4>
              <p className="max-w-[524px] text-[13px]">
                <span>
                  現在の限界より少し高い目標を設定し、常に負荷をかけ自社・自己の成長と顧客の満足度を追求しましょう
                </span>
              </p>
              <div className="w-full">
                <button
                  //   className={`transition-base01 flex-center max-h-[41px] w-[138px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff]  ${
                  //     loading ? `` : `hover:bg-[var(--color-bg-brand-f-deep)]`
                  //   } mt-[10px]`}
                  className={`transition-bg02 flex-center mt-[10px] max-h-[41px] w-[138px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)] `}
                  //   onClick={() => setIsOpenSettingInvitationModal(true)}
                >
                  <span>目標を設定</span>
                  {/* {loading && <SpinnerIDS scale={"scale-[0.4]"} />} */}
                </button>
              </div>
            </div>

            <div className={`flex h-full w-[30%] items-center`}>
              <div className="ml-[10px] mt-[-30px]">{winnersIllustration("180")}</div>
            </div>
          </div>

          {/* ---------------------------- 年度切り替えヘッダー ---------------------------- */}
          <div
            className={`sticky top-0 z-[50] flex min-h-[49px] w-full justify-between bg-[var(--color-edit-bg-solid)] pb-[10px]`}
          >
            <div className={`flex h-auto items-end `}>
              <div className={`flex-center mr-[12px] flex h-[25px] pb-[1px] text-[13px] text-[var(--color-text-sub)]`}>
                <span>年度</span>
              </div>
              <div
                className={`transition-bg02 group mr-[12px] flex cursor-pointer flex-col text-[var(--color-text-title)] hover:text-[var(--color-text-brand-f)]`}
              >
                <div className={`flex pl-[1px] text-[15px]`}>
                  <span className="mr-[6px]">2024年度</span>
                  <div className={`flex-center h-[24px] text-[14px]`}>
                    <IoCaretDownOutline className={``} />
                  </div>
                </div>
                <div
                  className={`${styles.underline} transition-bg02 min-h-[1px] w-full bg-[var(--color-border-light)] group-hover:bg-[var(--color-bg-brand-f)]`}
                />
              </div>

              <div className={`flex-center mr-[12px] flex h-[25px] pb-[1px] text-[13px] text-[var(--color-text-sub)]`}>
                <span>区分</span>
              </div>

              <div
                className={`transition-bg02 group mr-[12px] flex cursor-pointer flex-col text-[var(--color-text-title)] hover:text-[var(--color-text-brand-f)]`}
              >
                <div className={`flex pl-[1px] text-[15px]`}>
                  <span className="mr-[6px]">全社</span>
                  {/* <span className="mr-[6px]">-</span>
                  <span className="mr-[6px]">事業部</span> */}
                  <div className={`flex-center h-[24px] text-[14px]`}>
                    <IoCaretDownOutline className={``} />
                  </div>
                </div>
                <div
                  className={`${styles.underline} transition-bg02 min-h-[1px] w-full bg-[var(--color-border-light)] group-hover:bg-[var(--color-bg-brand-f)]`}
                />
              </div>

              <div className={`flex-center mr-[12px] flex h-[25px] pb-[1px] text-[13px] text-[var(--color-text-sub)]`}>
                <span>期間区分</span>
              </div>

              <div
                className={`transition-bg02 group flex cursor-pointer flex-col text-[var(--color-text-title)] hover:text-[var(--color-text-brand-f)]`}
              >
                <div className={`flex pl-[1px] text-[15px]`}>
                  <span className="mr-[6px]">年度</span>
                  <div className={`flex-center h-[24px] text-[14px]`}>
                    <IoCaretDownOutline className={``} />
                  </div>
                </div>
                <div
                  className={`${styles.underline} transition-bg02 min-h-[1px] w-full bg-[var(--color-border-light)] group-hover:bg-[var(--color-bg-brand-f)]`}
                />
              </div>
            </div>
            <div className={`flex items-center justify-end`}></div>
          </div>
          {/* ---------------------------- 年度切り替えヘッダー ここまで ---------------------------- */}

          {/* ---------------------------- エンティティ別目標一覧 ---------------------------- */}
          <ul className="mt-[14px]">
            <li className={`${styles.list_section_container}`}>
              <h3 className={`mb-[0px] flex items-center font-bold text-[var(--color-text-title)]`}>
                <div className="flex min-w-max flex-col space-y-[3px]">
                  <div className="flex min-w-max items-center space-x-[10px]">
                    <NextImage
                      width={24}
                      height={24}
                      src={`/assets/images/icons/business/icons8-process-94.png`}
                      alt="setting"
                      className={`${styles.title_icon} mb-[2px]`}
                    />
                    <span className="pr-[9px]">全社</span>
                  </div>
                  <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />
                </div>
              </h3>
              <div className="relative flex h-auto min-h-[30px] w-full pl-[12px]">
                <div
                  className={`${styles.vertical_line} ${styles.main} absolute left-[12px] top-[7px] h-[calc(100%-7px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                  style={{ animationDelay: `0.6s` }}
                ></div>
                <div
                  className={`flex flex-col pb-[15px] pl-[22px] ${styles.list_container}`}
                  style={{ animationDelay: `0.6s` }}
                >
                  {/* <div role="grid" className={`w-full ${styles.grid_container_target}`}>
                    <div role="row" aria-rowindex={1} className={`${styles.row} w-full`}>
                      <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
                        年度
                      </div>
                      <div role="gridcell" aria-colindex={2} className={`${styles.col_title}`}>
                        2024
                      </div>
                    </div>
                    <div role="row" aria-rowindex={2} className={`${styles.row_contents} w-full`}>
                      <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
                        目標
                      </div>
                      <div role="gridcell" aria-colindex={2} className={`${styles.cell_value}`}>
                        404.2億
                      </div>
                      <div role="gridcell" aria-colindex={3} className={`${styles.row_title}`}>
                        前年比
                      </div>
                      <div role="gridcell" aria-colindex={4} className={`${styles.cell_value}`}>
                        24.7%
                      </div>
                      <div role="gridcell" aria-colindex={5} className={`${styles.row_title}`}>
                        前年伸び実績
                      </div>
                      <div role="gridcell" aria-colindex={6} className={`${styles.cell_value}`}>
                        25.0%
                      </div>
                    </div>
                  </div> */}

                  {["fiscalYear"].includes(activeSectionTabs.periodType) && (
                    <SalesTargetGridContainer
                      periodType="fiscalYear"
                      periodValue={2024}
                      // salesTargetValue={404200000}
                      salesTargetValue={1234500}
                      yearOnYear={0.274}
                      growthResultLastYearOnLastYear={0.25}
                    />
                  )}

                  {/* 半期の場合は、「上半期・ */}
                  {["firstHalf", "lastHalf"].includes(activeSectionTabs.periodType) && (
                    <>
                      <SalesTargetGridContainer
                        periodType="half"
                        periodValue={20241}
                        salesTargetValue={123000000000}
                        yearOnYear={0.274}
                        growthResultLastYearOnLastYear={0.25}
                      />
                      <SalesTargetGridContainer
                        periodType="quarter"
                        periodValue={20241}
                        salesTargetValue={123000000000 / 2}
                        yearOnYear={0.274}
                        growthResultLastYearOnLastYear={0.25}
                      />
                      <SalesTargetGridContainer
                        periodType="quarter"
                        periodValue={20242}
                        salesTargetValue={123000000000 / 2}
                        yearOnYear={0.274}
                        growthResultLastYearOnLastYear={0.25}
                      />

                      <div className={`mt-[10px] flex min-h-[25px] min-w-max max-w-max flex-col text-[13px]`}>
                        <span className={`mr-[9px]`}>月度</span>
                        <div className={`min-h-[1px] w-full bg-[var(--color-border-light)]`}></div>
                      </div>

                      <SalesTargetGridContainerForMonthly
                        periodType={"monthly"}
                        monthlySalesTargetsArray={
                          activeSectionTabs.periodType === "firstHalf"
                            ? monthlySaleTargetDataFirstHalf
                            : monthlySaleTargetDataLastHalf
                        }
                      />
                    </>
                  )}

                  {/* -------------------------- 月度 -------------------------- */}
                  {/* 月度タイトル 12ヶ月間 */}
                  {/* <div className={`mt-[10px] flex min-h-[25px] min-w-max max-w-max flex-col text-[13px]`}>
                    <span className={`mx-[6px]`}>月度</span>
                    <div className={`min-h-[2px] w-full bg-[var(--color-bg-brand-f)]`}></div>
                  </div>
                  
                  <div role="grid" className={`w-full ${styles.grid_container_target}`}>
                    <div role="row" aria-rowindex={2} className={`${styles.row_contents} w-full`}>
                      <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
                        4月
                      </div>
                      <div role="gridcell" aria-colindex={2} className={`${styles.cell_value}`}>
                        404.2億
                      </div>
                      <div role="gridcell" aria-colindex={3} className={`${styles.row_title}`}>
                        前年比
                      </div>
                      <div role="gridcell" aria-colindex={4} className={`${styles.cell_value}`}>
                        24.7%
                      </div>
                      <div role="gridcell" aria-colindex={5} className={`${styles.row_title}`}>
                        前年伸び実績
                      </div>
                      <div role="gridcell" aria-colindex={6} className={`${styles.cell_value}`}>
                        25.0%
                      </div>
                    </div>
                    <div role="row" aria-rowindex={2} className={`${styles.row_contents} w-full`}>
                      <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
                        5月
                      </div>
                      <div role="gridcell" aria-colindex={2} className={`${styles.cell_value}`}>
                        404.2億
                      </div>
                      <div role="gridcell" aria-colindex={3} className={`${styles.row_title}`}>
                        前年比
                      </div>
                      <div role="gridcell" aria-colindex={4} className={`${styles.cell_value}`}>
                        24.7%
                      </div>
                      <div role="gridcell" aria-colindex={5} className={`${styles.row_title}`}>
                        前年伸び実績
                      </div>
                      <div role="gridcell" aria-colindex={6} className={`${styles.cell_value}`}>
                        25.0%
                      </div>
                    </div>
                  </div> */}
                  {/* -------------------------- 月度 ここまで -------------------------- */}
                </div>
              </div>
              {/* -------------------------- パイチャート -------------------------- */}
              <div
                className={`flex-center absolute bottom-[-40px] right-0 z-[100] h-[210px] w-[300px] overflow-visible bg-[gray]/[0.3]`}
              >
                <div className={`flex-center h-[210px] w-[300px] overflow-visible bg-[red]/[0.2]`}>
                  {/* <div className={`h-[160px] w-[160px] rounded-full bg-pink-100`}></div> */}
                  <ResponsiveContainer style={{ overflow: `visible` }}>
                    <PieChart style={{ overflow: `visible` }}>
                      <Pie
                        data={dataChart}
                        // 四隅に5pxずつpaddingあり、サイズは160ではなく、150のため75が中心
                        // cx={75}
                        // cy={75}
                        // innerRadius={60}
                        // outerRadius={80}
                        // cx={110}
                        // cy={70}
                        cx={140}
                        cy={100}
                        innerRadius={45}
                        outerRadius={65}
                        // fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        // label
                        // label={renderCustomizedLabel}
                        // labelLine={false}
                        activeIndex={activeIndex}
                        activeShape={renderActiveShape}
                        onMouseEnter={onPieEnter}
                      >
                        {dataChart.map((entry, index) => (
                          <Cell key={`cell_${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* -------------------------- パイチャート ここまで -------------------------- */}
            </li>
            {departmentDataArray &&
              departmentDataArray.map((obj, index) => {
                return (
                  <Fragment key={obj.id}>
                    {/* {index === 0 && (
                      <div className="relative flex h-[30px] min-h-[30px] w-full pl-[12px]">
                        <div
                          className={`${styles.vertical_line} absolute left-[12px] top-[-13px] h-[calc(100%+13px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                          style={{ animationDelay: `0.6s` }}
                        ></div>
                      </div>
                    )} */}
                    <li className="relative flex flex-col">
                      {/* <div className="relative flex h-[30px] min-h-[30px] w-full pl-[12px]">
                      <div
                        className={`absolute left-[12px] top-[-13px] h-[calc(100%+13px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                      ></div>
                    </div> */}
                      {/* <div
                      className={`absolute left-[12px] top-[calc(-50%-3px)] h-[calc(100%-9px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                    ></div> */}
                      <div className={`${styles.list_section_container}`}>
                        <h3
                          className={`${styles.list_title_row} mb-[0px] flex items-center font-bold text-[var(--color-text-title)]`}
                          style={{ animationDelay: `${0.3 * index + 1}s` }}
                        >
                          <div className="flex min-w-max flex-col space-y-[3px]">
                            <div className="flex min-w-max items-center">
                              {/* <NextImage
                              width={24}
                              height={24}
                              src={`/assets/images/icons/business/icons8-process-94.png`}
                              alt="setting"
                              className={`${styles.title_icon} mb-[2px]`}
                            /> */}
                              <div className={`flex-center mb-[2px] min-h-[24px] min-w-[24px]`}>
                                <RxDot className="text-[22px] text-[var(--color-bg-brand-f)]" />
                              </div>
                              <div className="relative mr-[5px] h-full w-[15px] min-w-[15px]">
                                <div className="absolute left-[0px] top-[50%] min-h-[1px] w-[calc(100%)] translate-y-[-50%] bg-[var(--color-bg-brand-f)]"></div>
                              </div>
                              <div
                                className={`${styles.list_title} relative flex h-full min-w-max flex-col`}
                                style={{ animationDelay: `${0.5 * index + 1}s` }}
                              >
                                <div className="flex min-w-max items-center px-[0px]">
                                  {/* <NextImage
                                    width={24}
                                    height={24}
                                    src={`/assets/images/icons/business/icons8-process-94.png`}
                                    alt="setting"
                                    className={`${styles.title_icon} mb-[2px] mr-[10px]`}
                                  /> */}
                                  <div className="flex-center h-[24px] w-[24px]">
                                    <div
                                      className={`h-[10px] w-[10px] rounded-[4px] ${
                                        colorsArray[index % colorsArray.length]
                                      }`}
                                    ></div>
                                  </div>
                                  <span className="">{obj.department_name}</span>
                                </div>
                                {/* <span className="px-[3px]">{obj.department_name}</span> */}
                                {/* <div className="absolute bottom-[-2px] left-[-2px] min-h-[1px] w-[calc(100%+6px)] bg-[var(--color-bg-brand-f)]" /> */}
                                <div
                                  className={`absolute bottom-[-2px] left-[-2px] min-h-[1px] w-[calc(100%+6px)] ${
                                    colorsArray[index % colorsArray.length]
                                  }`}
                                />
                              </div>
                            </div>
                          </div>
                        </h3>
                        {/* <div className="relative flex h-auto min-h-[30px] w-full pl-[12px]"> */}
                        <div className="relative flex h-auto w-full pl-[12px]">
                          {departmentDataArray.length - 1 !== index && (
                            <div
                              className={`${styles.vertical_line} ${styles.under} absolute left-[12px] top-[-1px] h-[calc(100%+1px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                              style={{ animationDelay: `${0.3 * index + 1}s` }}
                            ></div>
                          )}
                          <div
                            // className={`pl-[27px] ${styles.list_container}`}
                            className={`pl-[40px] ${styles.list_container}`}
                            // className={`pl-[70px] ${styles.list_container}`}
                            style={{ animationDelay: `${0.5 * index + 1}s` }}
                          >
                            <div className="pb-[12px] pt-[5px] text-[12px]">
                              <div role="grid" className={`w-full ${styles.grid_container_target} ${styles.second}`}>
                                {/* <div role="row" aria-rowindex={1} className={`${styles.row} w-full`}>
                                  <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
                                    年度
                                  </div>
                                  <div role="gridcell" aria-colindex={2} className={`${styles.col_title}`}>
                                    2024
                                  </div>
                                </div> */}
                                <div
                                  role="row"
                                  aria-rowindex={2}
                                  className={`${styles.row_contents} ${styles.with_share} w-full`}
                                >
                                  <div role="rowheader" aria-colindex={1} className={`${styles.row_title}`}>
                                    目標
                                  </div>
                                  <div role="gridcell" aria-colindex={2} className={`${styles.cell_value}`}>
                                    404.2億
                                  </div>
                                  <div role="gridcell" aria-colindex={3} className={`${styles.row_title}`}>
                                    シェア
                                  </div>
                                  <div role="gridcell" aria-colindex={4} className={`${styles.cell_value}`}>
                                    25.0%
                                  </div>
                                  <div role="gridcell" aria-colindex={5} className={`${styles.row_title}`}>
                                    前年比
                                  </div>
                                  <div role="gridcell" aria-colindex={6} className={`${styles.cell_value}`}>
                                    24.7%
                                  </div>
                                  <div role="gridcell" aria-colindex={7} className={`${styles.row_title}`}>
                                    前年伸び実績
                                  </div>
                                  <div role="gridcell" aria-colindex={8} className={`${styles.cell_value}`}>
                                    25.0%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </Fragment>
                );
              })}
          </ul>

          {/* ---------------------------- エンティティ別目標一覧 ここまで ---------------------------- */}

          {/* テスト */}
          {Array(5)
            .fill(null)
            .map((_, index) => {
              return (
                <Fragment key={index.toString() + "テストデータ"}>
                  {index === 0 && (
                    <div className="relative flex h-[30px] min-h-[30px] w-full pl-[12px]">
                      <div
                        className={`${styles.vertical_line} absolute left-[12px] top-[-13px] h-[calc(100%+13px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                        style={{ animationDelay: `0.3s` }}
                      ></div>
                    </div>
                  )}
                  <li className="relative flex flex-col">
                    <div className={`${styles.list_section_container}`}>
                      <h3
                        className={`${styles.list_title_row} mb-[0px] flex items-center font-bold text-[var(--color-text-title)]`}
                        style={{ animationDelay: `${1 * index + 1}s` }}
                      >
                        <div className="flex min-w-max flex-col space-y-[3px]">
                          <div className="flex min-w-max items-center">
                            <div className={`flex-center mb-[2px] min-h-[24px] min-w-[24px]`}>
                              <RxDot className="text-[22px] text-[var(--color-bg-brand-f)]" />
                            </div>
                            <div className="relative mr-[5px] h-full w-[15px] min-w-[15px]">
                              <div className="absolute left-[0px] top-[50%] min-h-[1px] w-[calc(100%)] translate-y-[-50%] bg-[var(--color-bg-brand-f)]"></div>
                            </div>
                            <div className={`${styles.list_title} relative flex h-full min-w-max flex-col`}>
                              <div className="flex min-w-max items-center px-[3px]">
                                <NextImage
                                  width={24}
                                  height={24}
                                  src={`/assets/images/icons/business/icons8-process-94.png`}
                                  alt="setting"
                                  className={`${styles.title_icon} mb-[2px] mr-[10px]`}
                                />
                                <span className="">マイクロスコープ事業部</span>
                              </div>
                              <div className="absolute bottom-[-2px] left-[-2px] min-h-[1px] w-[calc(100%+6px)] bg-[var(--color-bg-brand-f)]" />
                            </div>
                          </div>
                        </div>
                      </h3>
                      <div className="relative flex h-[30px] min-h-[30px] w-full pl-[12px]">
                        {Array(5).fill(null).length - 1 !== index && (
                          <div
                            className={`${styles.vertical_line} ${styles.under} absolute left-[12px] top-[-1px] h-[calc(100%+1px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                            style={{ animationDelay: `${1 * index + 1}s` }}
                          ></div>
                        )}
                      </div>
                    </div>
                  </li>
                </Fragment>
              );
            })}
          {/* テスト */}

          {isLoadingQueryDepartment && (
            <div className={`flex-center mt-[20px] flex min-h-[95px] w-[calc(100%+73px)]`}>
              <SpinnerIDS scale={"scale-[0.5]"} />
            </div>
          )}

          <div className={`flex-center mt-[20px] min-h-[55px] w-[calc(100%+73px)]`}>
            <div
              className={`transition-base01 flex-center min-w-[78px] cursor-pointer space-x-1 rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold  !text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)] hover:text-[var(--color-bg-brand-f)]`}
              // onClick={() => setIsOpenInsertNewProductModal(true)}
            >
              <span>＋</span>
              <span>商品追加</span>
            </div>
          </div>
        </div>
      )}
      {/* 右側メインエリア プロフィール ここまで */}
    </>
  );
};

export const SettingSalesTargets = memo(SettingSalesTargetsMemo);
