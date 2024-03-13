import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { useMutateProduct } from "@/hooks/useMutateProduct";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { CustomizedLabelProps, Department, Office, Product, Section, SectionMenuParams, Unit } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { CSSProperties, FC, Fragment, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { COLORS, COLORS_SHEER, colorsArray, dataPie } from "@/components/Parts/Charts/Seeds/seedData";
import { PieLabelRenderProps, PieSectorDataItem } from "recharts/types/polar/Pie";
import { formatSalesTarget } from "@/utils/Helpers/formatSalesTarget";
import { renderActiveShape } from "@/components/Parts/Charts/renderActiveShape/renderActiveShape";
import useStore from "@/store";
import { SVGTextTitle } from "@/components/Parts/Charts/ChartTooltip/SVGTextTitle";
import { RenderCustomizeLabel } from "@/components/Parts/Charts/RenderCustomizedLabel/RenderCustomizedLabel";
import { monthlySaleTargetDataFirstHalf, monthlySaleTargetDataLastHalf } from "./data";
import { calculateCurrentFiscalYear } from "@/utils/Helpers/calculateCurrentFiscalYear";
import { calculateCurrentFiscalYearEndDate } from "@/utils/Helpers/calcurateCurrentFiscalYearEndDate";
import { format, isWithinInterval, subMonths } from "date-fns";
import { mappingSectionName, sectionListForSalesTarget } from "@/utils/selectOptions";
import { MdOutlineDataSaverOff } from "react-icons/md";
import { BsCheck2 } from "react-icons/bs";
import { FaExchangeAlt } from "react-icons/fa";
import { RenderActiveShapeWithBg } from "@/components/Parts/Charts/renderActiveShape/renderActiveShapeWithBg";

const SettingSalesTargetsMemo: FC = () => {
  // const theme = useThemeStore((state) => state.theme);
  // const theme = useRootStore(useThemeStore, (state) => state.theme);
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setIsOpenSettingAccountModal = useDashboardStore((state) => state.setIsOpenSettingAccountModal);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  // const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  // const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // 上画面の選択中の列データ会社
  // const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);

  // ref関連
  const salesTargetContainerRef = useRef<HTMLDivElement | null>(null);

  // 売上目標・プロセス目標
  const [activeTargetTab, setActiveTargetTab] = useState("Sales");

  // 売上目標チャート中央テキスト ホバー時にクラスを外す
  const textSalesChartRef = useRef<SVGTextElement | null>(null);
  const [isMountedChart, setIsMountedChart] = useState(false);

  // インスタンス
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

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

  // 初回アクティブタブ
  const initialTabs = useMemo(() => {
    return {
      year: currentFiscalYearDateObj.getFullYear(),
      entity: "company",
      periodType: "fiscalYear",
      // periodType: "firstHalf",
      periodValue: 1, // 半期のみで使用 半期は1か2(上半期と下半期)
      entityName: null, // 表示するエンティティ名(事業部~事業所までで使用)
      entityId: null, // 表示するエンティティ名(事業部~事業所までで使用)
    };
  }, []);

  // 表示する会計年度
  // const [activeFiscalYear, setActiveFiscalYear] = useState(currentFiscalYearDateObj.getFullYear());
  // 表示する期間 + 表示する会計年度 + 表示するエンティティ 「年度」「半期+四半期+月度」で表示する期間切り替え
  const [activeDisplayTabs, setActiveDisplayTabs] = useState<{
    year: number;
    entity: string;
    periodType: string;
    periodValue: number;
    entityName: string | null;
    entityId: string | null;
  }>(initialTabs);
  // 事業部~事業所までは変更する際に、エンティティ名を選択した後にactiveDisplayTabsを更新するため一旦ローカルでエンティティタイプを保持するためのstate
  const [activeEntityLocal, setActiveEntityLocal] = useState<{
    entityType: string;
    entityName: string;
    entityId: string;
  } | null>(null);

  //
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);

  // 選択年オプション(現在の年から3年遡る, 1年後は決算日まで３ヶ月を切った場合は選択肢に入れる)
  const [optionsFiscalYear, setOptionsFiscalYear] = useState<{ label: string; value: number }[]>([]);

  // -------------------------- 🌟年度の選択肢を作成🌟 --------------------------
  useEffect(() => {
    if (!fiscalYearEndDate || !activeDisplayTabs.year || !userProfileState) {
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
      const yearOptions = years.map((year) => ({
        label: `${year}年度`,
        value: year,
      }));

      console.log("yearOptions", yearOptions);

      // stateにオプションを追加
      setOptionsFiscalYear(yearOptions);
      return;
    }

    // 現在の日付が決算日から３ヶ月以内かどうかをチェック subMonths: 特定のDateから3ヶ月前の日付を計算
    const threeMonthsBeforeFiscalEnd = subMonths(currentFiscalYearEndDate, 3);
    console.log(
      "subMonths結果",
      threeMonthsBeforeFiscalEnd,
      "currentFiscalYearEndDate",
      format(currentFiscalYearEndDate, "yyyy-MM-dd HH:mm:ss")
    );
    // isWithinInterval: 第一引数に指定された日付が、第二引数に指定された期間内にあるかどうかを真偽値で返す
    const isWithin3Months = isWithinInterval(new Date(), {
      start: threeMonthsBeforeFiscalEnd,
      end: currentFiscalYearEndDate,
    });
    if (isWithin3Months) {
      // ３ヶ月以内であれば翌年度も追加
      years.push(currentYear + 1);
    }

    // 年度を選択肢として指定
    const yearOptions = years.map((year) => ({
      label: `${year}年度`,
      value: year,
    }));

    console.log("yearOptions", yearOptions);

    // stateにオプションを追加
    setOptionsFiscalYear(yearOptions);
  }, []);
  // -------------------------- ✅年度の選択肢を作成✅ --------------------------

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

  // const [departmentSpecificProducts, setDepartmentSpecificProducts] = useState<({ [x: string]: Product[] } | null)[]>(
  // const [sectionIdToObjMap, setSectionIdToObjMap] = useState<{ [key: string]: string } | null>(null);
  // const [unitIdToObjMap, setUnitIdToObjMap] = useState<{ [key: string]: string } | null>(null);
  // const [officeIdToObjMap, setOfficeIdToObjMap] = useState<{ [key: string]: string } | null>(null);

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

  // パイチャート
  const dataChart = dataPie;

  console.log(
    "SettingSalesTargetsコンポーネントレンダリング",
    "✅departmentIdToObjMap",
    departmentIdToObjMap,
    "✅sectionIdToObjMap",
    sectionIdToObjMap,
    "✅unitIdToObjMap",
    unitIdToObjMap,
    "✅officeIdToObjMap",
    officeIdToObjMap,
    "タブ初期値",
    initialTabs,
    "アクティブタブ",
    activeDisplayTabs
  );

  // 売上目標とプロセス目標のアクティブ時のアンダーラインの位置
  const getUnderline = (tab: string): CSSProperties => {
    if (tab === "Sales") return { left: 0, width: `60px` };
    if (tab === "Process") return { left: 80, width: `90px` };
    return { left: 0, width: `60px` };
  };

  // アクティブエンティティ名 activeEntityTabs メンバーは係のサブツリーとして同時に表示
  const mappingEntityName: { [key: string]: { [key: string]: string } } = {
    company: { ja: "全社", en: "Company" },
    department: { ja: "事業部", en: "Department" },
    section: { ja: "課・セクション", en: "Section" },
    unit: { ja: "係・ユニット", en: "Unit" },
    office: { ja: "事業所", en: "Office" },
  };

  // エンティティ区分選択時にエンティティ名の初期値としてセットする関数
  const getFirstEntityOption = (entityType: string): { entityName: string | null; entityId: string | null } => {
    let newObj: { entityName: string | null; entityId: string | null } = { entityName: null, entityId: null };
    switch (entityType) {
      case "department":
        newObj = {
          entityName: departmentDataArray ? departmentDataArray[0].department_name : null,
          entityId: departmentDataArray ? departmentDataArray[0].id : null,
        };
        return newObj;
      case "section":
        newObj = {
          entityName: sectionDataArray ? sectionDataArray[0].section_name : null,
          entityId: sectionDataArray ? sectionDataArray[0].id : null,
        };
        return newObj;
      case "unit":
        newObj = {
          entityName: unitDataArray ? unitDataArray[0].unit_name : null,
          entityId: unitDataArray ? unitDataArray[0].id : null,
        };
        return newObj;
      case "office":
        newObj = {
          entityName: officeDataArray ? officeDataArray[0].office_name : null,
          entityId: officeDataArray ? officeDataArray[0].id : null,
        };
        return newObj;

      default:
        return newObj;
        break;
    }
  };

  // -------------------------- 🌟パイチャート関連🌟 --------------------------
  type CustomProps = { isHovering: boolean; labelName: string; fillColor: string };

  type LabelProps = {
    props: CustomizedLabelProps;
    customProps: CustomProps;
  };

  const renderCustomizeLabel = useCallback(({ props, customProps }: LabelProps) => {
    return <RenderCustomizeLabel props={props} customProps={customProps} />;
  }, []);

  type ShapeCustomProps = {
    mainEntity: string;
    mainSalesTarget: number;
    isHovering: boolean;
  };
  type ShapeProps = {
    props: PieSectorDataItem;
    customProps: ShapeCustomProps;
  };
  const renderActiveShapeWithBg = useCallback(({ props, customProps }: ShapeProps) => {
    return <RenderActiveShapeWithBg props={props} customProps={customProps} />;
  }, []);

  // const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeIndex, setActiveIndex] = useState<number>(100);

  const onPieEnter = (_: void, index: number) => {
    setActiveIndex(index);
    // 初回マウント時用のアニメーションを除去

    if (!isMountedChart) {
      setIsMountedChart(true);
    }
    // if (textSalesChartRef.current) {
    //   textSalesChartRef.current.classList.remove("fade_chart05_d2");
    // }
  };
  const onPieLeave = (_: void, index: number) => {
    setActiveIndex(100);
  };
  // -------------------------- ✅パイチャート関連✅ --------------------------

  // -------------------------- 🌟セクションメニュー🌟 --------------------------
  // モーダルのtop, left, width, height
  const settingModalProperties = useDashboardStore((state) => state.settingModalProperties);
  const [openSectionMenu, setOpenSectionMenu] = useState<{
    x?: number;
    y: number;
    title?: string;
    displayX?: string;
    maxWidth?: number;
    fadeType?: string;
  } | null>(null);

  // 説明メニュー(onClickイベントで開いてホバー可能な状態はisHoverableをtrueにする)
  const [openPopupMenu, setOpenPopupMenu] = useState<{
    x?: number;
    y: number;
    title: string;
    displayX?: string;
    maxWidth?: number;
    fadeType?: string;
    isHoverable?: boolean;
  } | null>(null);

  const sectionMenuRef = useRef<HTMLDivElement | null>(null);

  // centerで位置が調整された時用のopacity
  const [isAdjustedMenu, setIsAdjustedMenu] = useState(true);

  const handleOpenSectionMenu = ({ e, title, displayX, maxWidth, fadeType }: SectionMenuParams) => {
    if (!settingModalProperties) return;
    if (!displayX || displayX === "center") {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionY = y + height + 6;
      let positionX = x;
      if (displayX === "center") positionX = x + width / 2;

      // モーダルのtopとleftを考慮
      positionY -= settingModalProperties.top;
      positionX -= settingModalProperties.left;

      // centerの場合には位置の調整が入るため一旦透明にして調整後にopacityを1にする
      setIsAdjustedMenu(false);

      console.log("クリック", y, x, positionX);
      setOpenSectionMenu({
        y: positionY,
        x: positionX,
        title: title,
        displayX: displayX,
        fadeType: fadeType,
        maxWidth: maxWidth,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      positionX = displayX === "left" ? window.innerWidth - x : 0;

      let positionY = y - settingModalProperties.top;
      positionX -= settingModalProperties.left;
      //   positionX = displayX === "center" ? x + width / 2 : 0;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenSectionMenu({
        x: positionX,
        y: y,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        fadeType: fadeType,
      });
    }
  };

  useEffect(() => {
    if (!openSectionMenu?.displayX || openSectionMenu?.displayX !== "center") return;
    if (openSectionMenu?.displayX === "center" && sectionMenuRef.current && openSectionMenu.x) {
      const menuWith = sectionMenuRef.current.getBoundingClientRect().width;
      const newX = openSectionMenu.x - menuWith / 2;
      console.log("🔥newX", newX, menuWith, openSectionMenu.x);
      setOpenSectionMenu({ ...openSectionMenu, x: newX });

      // centerの場合には位置の調整が入るため一旦透明にして調整後にopacityを1にする
      setIsAdjustedMenu(true);
    }
  }, [openSectionMenu?.displayX]);

  // メニューを閉じる
  const handleCloseSectionMenu = () => {
    if (openSectionMenu && openSectionMenu.title === "entity") {
      setActiveEntityLocal(null);
    }

    setOpenSectionMenu(null);
    if (openSectionMenu) setOpenSectionMenu(null);
  };

  // ポップアップのフェードタイプ
  const getFadeTypeClass = (fadeType: string) => {
    if (fadeType === "fade_down") return styles.fade_down;
    if (fadeType === "fade_up") return styles.fade_up;
    if (fadeType === "fade") return styles.fade;
  };
  // -------------------------- ✅セクションメニュー✅ --------------------------
  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    content3,
    marginTop = 0,
    // itemsPosition = "start",
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
      content3: content3,
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

  return (
    <>
      {/* 右側メインエリア プロフィール */}
      {selectedSettingAccountMenu === "SalesTargets" && (
        <div
          ref={salesTargetContainerRef}
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
                <div
                  className={`flex pl-[1px] text-[15px]`}
                  onMouseEnter={(e) => {
                    const tooltipText = `選択中の会計年度の目標を表示します。\n会計年度は2020年から当年度まで選択可能で、翌年度はお客様の決算日から\n現在の日付が3ヶ月を切ると表示、設定、編集が可能となります。`;
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: tooltipText,
                      marginTop: 48,
                      // marginTop: 33,
                      // marginTop: 9,
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  {/* <span className="mr-[6px]">2024年度</span> */}
                  {/* {activeDisplayTabs.year && <span className="mr-[6px]">{activeDisplayTabs.year}年度</span>} */}
                  <select
                    className={`${styles.select_text} ${styles.arrow_none} mr-[6px] truncate`}
                    value={activeDisplayTabs.year}
                    onChange={(e) => {
                      setActiveDisplayTabs({ ...activeDisplayTabs, year: Number(e.target.value) });
                    }}
                    onClick={handleCloseTooltip}
                  >
                    {optionsFiscalYear.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
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
                <div
                  className={`flex pl-[1px] text-[15px]`}
                  onClick={(e) => {
                    setActiveEntityLocal({
                      entityType: activeDisplayTabs.entity,
                      entityName: activeDisplayTabs.entityName ?? "",
                      entityId: activeDisplayTabs.entityId ?? "",
                    });
                    handleOpenSectionMenu({
                      e,
                      title: "entity",
                      displayX: "center",
                      fadeType: "fade_up",
                      maxWidth: 310,
                    });
                    handleCloseTooltip();
                  }}
                  onMouseEnter={(e) => {
                    const tooltipText = `「全社・事業部・課(セクション)・係(チーム)」の中から表示を変更します。\n各メンバーの売上目標は「係(チーム)」から確認可能です。`;
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: tooltipText,
                      marginTop: 33,
                      itemsPosition: "left",
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span className="mr-[6px]">{mappingEntityName[activeDisplayTabs.entity][language]}</span>
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
                  {activeDisplayTabs.periodType === "fiscalYear" && <span className="mr-[6px]">年度</span>}
                  {activeDisplayTabs.periodType === "half" && <span className="mr-[6px]">半期〜月度</span>}
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

                  {/* 年度 */}
                  {["fiscalYear"].includes(activeDisplayTabs.periodType) && (
                    <SalesTargetGridContainer
                      periodType="fiscalYear"
                      periodValue={2024}
                      salesTargetValue={404200000}
                      // salesTargetValue={1234500}
                      yearOnYear={0.274}
                      growthResultLastYearOnLastYear={0.25}
                    />
                  )}

                  {/* 半期の場合は、「上半期・下半期」 */}
                  {["firstHalf", "lastHalf"].includes(activeDisplayTabs.periodType) && (
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
                          activeDisplayTabs.periodType === "firstHalf"
                            ? monthlySaleTargetDataFirstHalf()
                            : monthlySaleTargetDataLastHalf()
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
                className={`flex-center absolute bottom-[-40px] right-[-60px] z-[100] h-[210px] w-[360px] overflow-visible bg-[gray]/[0]`}
              >
                <div className={`flex-center h-[210px] w-[360px] overflow-visible bg-[red]/[0]`}>
                  {/* <div className={`h-[160px] w-[160px] rounded-full bg-pink-100`}></div> */}
                  <ResponsiveContainer style={{ overflow: `visible` }}>
                    <PieChart style={{ overflow: `visible` }}>
                      <Pie
                        data={dataChart}
                        // 四隅に5pxずつpaddingあり、サイズは160ではなく、150のため75が中心
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={60}
                        // fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label={(props: CustomizedLabelProps) => {
                          // console.log("らべる props", props);
                          return renderCustomizeLabel({
                            props,
                            customProps: {
                              isHovering: activeIndex !== 100,
                              fillColor: COLORS[props.index],
                              labelName:
                                departmentDataArray && departmentDataArray[props.index]?.department_name
                                  ? departmentDataArray[props.index].department_name ?? ""
                                  : "",
                            },
                          });
                          // renderCustomizedLabel(PieLabel, {
                          //   isHovering: activeIndex !== 100,
                          // })
                        }}
                        labelLine={false}
                        activeIndex={activeIndex}
                        activeShape={(props: PieSectorDataItem) =>
                          renderActiveShapeWithBg({
                            props: props,
                            customProps: {
                              mainEntity: activeDisplayTabs.entity,
                              mainSalesTarget: 404200000,
                              isHovering: activeIndex !== 100,
                            },
                          })
                        }
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                      >
                        {dataChart.map((entry, index) => (
                          <Cell
                            key={`cell_${index}`}
                            fill={
                              activeIndex === index
                                ? COLORS[index % COLORS.length]
                                : COLORS_SHEER[index % COLORS_SHEER.length]
                            }
                            stroke={COLORS[index % COLORS.length]}
                            // stroke={"#666"}
                            strokeWidth={`1px`}
                          />
                        ))}
                      </Pie>
                      {/* 中央にテキストを表示するためのカスタムSVG要素 */}
                      {activeIndex === 100 && (
                        <text
                          ref={textSalesChartRef}
                          x="50%"
                          y="50%"
                          fontSize="13px"
                          fontWeight={700}
                          textAnchor="middle"
                          dominantBaseline="central"
                          // fill={`var(--color-text-title)`}
                          fill={`var(--main-color-f)`}
                          className={`${isMountedChart ? `fade05` : `fade_chart05_d2`}`}
                        >
                          {`￥${formatSalesTarget(404200000)}`}
                        </text>
                      )}
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
          {/* {Array(5)
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
            })} */}
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

      {/* ---------------------------- 🌟セッティングメニュー🌟 ---------------------------- */}
      {/* クリック時のオーバーレイ */}
      {openSectionMenu && <div className={`${styles.menu_overlay}`} onClick={handleCloseSectionMenu}></div>}
      {openSectionMenu && (
        <div
          ref={sectionMenuRef}
          className={`${styles.settings_menu} fixed z-[3000] h-auto rounded-[6px] ${
            openSectionMenu.fadeType ? getFadeTypeClass(openSectionMenu.fadeType) : ``
          } ${!isAdjustedMenu ? `${styles.disappear}` : ``}`}
          style={{
            top: `${openSectionMenu.y}px`,
            ...((openSectionMenu.displayX === "center" || !openSectionMenu.displayX) && {
              left: `${openSectionMenu.x}px`,
              maxWidth: `${openSectionMenu.maxWidth}px`,
            }),
            ...(openSectionMenu.displayX === "right" && {
              right: `${openSectionMenu.x}px`,
              maxWidth: `${openSectionMenu.maxWidth}px`,
            }),
            ...(openSectionMenu.displayX === "left" && {
              right: `${openSectionMenu.x}px`,
              maxWidth: `${openSectionMenu.maxWidth}px`,
            }),
          }}
        >
          {/* ------------------------ エンティティ選択メニュー ------------------------ */}
          {openSectionMenu.title === "entity" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>表示区分設定メニュー</span>
                  <div className={`${styles.section_underline} w-full`} />
                </div>
              </h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューから「全社・事業部・課/セクション・係/チーム・事業所」を変更することで、各区分に応じた目標を表示します。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  {sectionListForSalesTarget.map((obj, index) => {
                    const isActive = obj.title === activeEntityLocal?.entityType;
                    return (
                      <li
                        key={obj.title}
                        className={`${styles.list} ${styles.select_list} ${isActive ? styles.active : ``}`}
                        onClick={(e) => {
                          if (isActive) return console.log("リターン ", isActive, obj);
                          // 全社の場合は、そのまま区分を変更
                          if (obj.title === "company") {
                            setActiveDisplayTabs({ ...activeDisplayTabs, entity: obj.title });
                            setActiveEntityLocal(null);
                            setOpenSectionMenu(null);
                          }
                          // 事業部~事業所までは、エンティティ区分タイプ+表示するエンティティ名が必要なため、一旦ローカルstateに区分タイプを保存して、右側の選択エリアでエンティティ名をセレクトで選択してもらう
                          else {
                            const { entityId, entityName } = getFirstEntityOption(obj.title);
                            setActiveEntityLocal({
                              entityType: obj.title,
                              entityName: entityName ?? "",
                              entityId: entityId ?? "",
                            });
                            if (obj.title === "department") {
                              const departmentId = departmentDataArray ? departmentDataArray[0].id : "";
                              setSelectedDepartment(departmentIdToObjMap?.get(departmentId) ?? null);
                            }
                            if (obj.title === "section") {
                              const departmentId = departmentDataArray ? departmentDataArray[0].id : "";
                              setSelectedDepartment(departmentIdToObjMap?.get(departmentId) ?? null);
                              const sectionId = sectionDataArray ? sectionDataArray[0].id : "";
                              setSelectedSection(sectionIdToObjMap?.get(sectionId) ?? null);
                            }
                            if (obj.title === "unit") {
                              const departmentId = departmentDataArray ? departmentDataArray[0].id : "";
                              setSelectedDepartment(departmentIdToObjMap?.get(departmentId) ?? null);
                              const sectionId = sectionDataArray ? sectionDataArray[0].id : "";
                              setSelectedSection(sectionIdToObjMap?.get(sectionId) ?? null);
                              const unitId = unitDataArray ? unitDataArray[0].id : "";
                              setSelectedUnit(unitIdToObjMap?.get(unitId) ?? null);
                            }
                            if (obj.title === "office") {
                              const officeId = officeDataArray ? officeDataArray[0].id : "";
                              setSelectedOffice(officeIdToObjMap?.get(officeId) ?? null);
                            }
                          }
                          // handleClosePopupMenu();
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
              {/* 右サイドエンティティ詳細メニュー 適用・戻るエリア 全社以外で表示 */}
              {activeEntityLocal && activeEntityLocal.entityType !== "company" && (
                <div
                  className={`${styles.settings_menu} ${styles.edit_mode} left-[320px] z-[3000] h-auto w-full min-w-[330px] max-w-max overflow-hidden rounded-[6px] ${styles.fade_up}`}
                  style={{
                    position: "absolute",
                    ...(sectionMenuRef.current?.offsetWidth
                      ? { top: "0px", left: sectionMenuRef.current?.offsetWidth + 10 }
                      : { bottom: "-168px", left: 0 }),
                    animationDelay: `0.2s`,
                    animationDuration: `0.5s`,
                    ...(openSectionMenu.maxWidth && { maxWidth: `${openSectionMenu.maxWidth}px` }),
                  }}
                >
                  {/* ------------------------------------ */}
                  <li className={`${styles.section_title} flex min-h-max w-full font-bold`}>
                    <div className="flex max-w-max flex-col">
                      <span>{mappingSectionName[activeEntityLocal.entityType][language]}</span>
                      <div className={`${styles.underline} w-full`} />
                    </div>
                  </li>
                  {/* ------------------------------------ */}
                  {/* ------------------------ 事業部 ------------------------ */}
                  {activeEntityLocal.entityType !== "office" && (
                    <li
                      className={`relative flex  w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                    >
                      <div className="pointer-events-none flex min-w-[70px] items-center">
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>事業部</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      <div>
                        {(!selectedDepartment || !departmentIdToObjMap) && <span>事業部が見つかりません</span>}
                        {selectedDepartment && departmentIdToObjMap && (
                          <select
                            className={` ml-auto h-full w-full ${styles.select_box} truncate`}
                            value={selectedDepartment.id}
                            onChange={(e) => {
                              const departmentId = e.target.value;
                              const newDepartment = departmentIdToObjMap.has(departmentId)
                                ? departmentIdToObjMap.get(departmentId)
                                : null;
                              setSelectedDepartment(newDepartment ?? null);
                            }}
                          >
                            {!!departmentDataArray &&
                              [...departmentDataArray]
                                .sort((a, b) => {
                                  if (a.department_name === null || b.department_name === null) return 0;
                                  return (
                                    a.department_name.localeCompare(
                                      b.department_name,
                                      language === "ja" ? "ja" : "en"
                                    ) ?? 0
                                  );
                                })
                                .map(
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
                  {/* ------------------------ 事業部 ------------------------ */}
                  {/* ------------------------ 課・セクション ------------------------ */}
                  {["section", "unit"].includes(activeEntityLocal.entityType) && (
                    <li
                      className={`relative flex  w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                    >
                      <div className="pointer-events-none flex min-w-[70px] items-center">
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>課・セクション</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      <div>
                        {!selectedSection && <span>課・セクションが見つかりません</span>}
                        {selectedSection && (
                          <select
                            className={` ml-auto h-full w-full ${styles.select_box} truncate`}
                            value={selectedSection.id}
                            onChange={(e) => {}}
                          >
                            {!!sectionDataArray &&
                              [...sectionDataArray]
                                .sort((a, b) => {
                                  if (a.section_name === null || b.section_name === null) return 0;
                                  return (
                                    a.section_name.localeCompare(b.section_name, language === "ja" ? "ja" : "en") ?? 0
                                  );
                                })
                                .map(
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
                  {["unit"].includes(activeEntityLocal.entityType) && (
                    <li
                      className={`relative flex  w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                    >
                      <div className="pointer-events-none flex min-w-[70px] items-center">
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>係・チーム</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      <div>
                        {!selectedUnit && <span>係・チームが見つかりません</span>}
                        {selectedUnit && (
                          <select
                            className={` ml-auto h-full w-full ${styles.select_box} truncate`}
                            value={selectedUnit.id}
                            onChange={(e) => {}}
                          >
                            {!!unitDataArray &&
                              [...unitDataArray]
                                .sort((a, b) => {
                                  if (a.unit_name === null || b.unit_name === null) return 0;
                                  return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en") ?? 0;
                                })
                                .map(
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
                  {activeEntityLocal.entityType === "office" && (
                    <li
                      className={`relative flex  w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                    >
                      <div className="pointer-events-none flex min-w-[70px] items-center">
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>事業所</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      <div>
                        {!selectedOffice && <span>事業所が見つかりません</span>}
                        {selectedOffice && (
                          <select
                            className={` ml-auto h-full w-full ${styles.select_box} truncate`}
                            value={selectedOffice.id}
                            onChange={(e) => {}}
                          >
                            {!!officeDataArray &&
                              [...officeDataArray]
                                .sort((a, b) => {
                                  if (a.office_name === null || b.office_name === null) return 0;
                                  return (
                                    a.office_name.localeCompare(b.office_name, language === "ja" ? "ja" : "en") ?? 0
                                  );
                                })
                                .map(
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
                  <hr className="mt-[3px] min-h-[1px] w-full bg-[#999]" />
                  {/* ------------------------------------ */}
                  <li className={`${styles.list} ${styles.btn_area} space-x-[20px]`}>
                    <div
                      className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${styles.active}`}
                      onClick={() => {
                        if (!activeEntityLocal) return;
                        setActiveDisplayTabs({
                          ...activeDisplayTabs,
                          entity: activeEntityLocal.entityType,
                          entityName: activeEntityLocal.entityName,
                          entityId: activeEntityLocal.entityId,
                        });
                        setOpenSectionMenu(null);
                      }}
                    >
                      <span>適用</span>
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
                  {/* ------------------------------------ */}
                </div>
              )}
              {/* 右サイドエンティティ詳細メニュー 適用・戻るエリア */}
            </>
          )}
          {/* ------------------------ エンティティ選択メニュー ------------------------ */}
        </div>
      )}
    </>
  );
};

export const SettingSalesTargets = memo(SettingSalesTargetsMemo);
