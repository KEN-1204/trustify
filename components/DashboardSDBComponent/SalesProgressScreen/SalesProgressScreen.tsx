import {
  Dispatch,
  DragEvent,
  FormEvent,
  MouseEvent,
  SetStateAction,
  memo,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./SalesProgressScreen.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { IoCaretDownOutline } from "react-icons/io5";
import { MdOutlineDataSaverOff } from "react-icons/md";
import { BsCheck2 } from "react-icons/bs";
import useStore from "@/store";
import {
  PeriodOption,
  getOptionsCalendarYear,
  getOptionsFiscalYear,
  mappingSdbTabName,
  mappingSectionName,
  optionsFiscalHalf,
  optionsFiscalMonth,
  optionsFiscalQuarter,
  periodList,
  sdbTabsList,
  sectionList,
} from "@/utils/selectOptions";
import { ScreenDealBoards } from "../ScreenDealBoards/ScreenDealBoards";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { MemberAccounts, PeriodSDB } from "@/types";
import { ImInfo } from "react-icons/im";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { FaExchangeAlt } from "react-icons/fa";

type SectionMenuParams = {
  // e: React.MouseEvent<HTMLElement, MouseEvent>;
  e: React.MouseEvent<HTMLElement, globalThis.MouseEvent | MouseEvent>;
  title: string;
  displayX?: string;
  maxWidth?: number;
  fadeType?: string;
};
type PopupDescMenuParams = {
  // e: React.MouseEvent<HTMLElement, MouseEvent>;
  e: React.MouseEvent<HTMLElement, globalThis.MouseEvent | MouseEvent>;
  title: string;
  displayX?: string;
  maxWidth?: number;
  fadeType?: string;
  isHoverable?: boolean;
};

const SalesProgressScreenMemo = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // ダッシュボード
  const activeTabSDB = useDashboardStore((state) => state.activeTabSDB);
  const setActiveTabSDB = useDashboardStore((state) => state.setActiveTabSDB);
  // エンティティセクション
  const activeSectionSDB = useDashboardStore((state) => state.activeSectionSDB);
  const setActiveSectionSDB = useDashboardStore((state) => state.setActiveSectionSDB);
  // 期間
  const activePeriodSDB = useDashboardStore((state) => state.activePeriodSDB);
  const setActivePeriodSDB = useDashboardStore((state) => state.setActivePeriodSDB);
  const [activePeriodSDBLocal, setActivePeriodSDBLocal] = useState<{ periodType: string; period: number } | null>(null);
  // エンティティ選択中コンテンツ
  // メンバーエンティティ
  const selectedObjSectionSDBMember = useDashboardStore((state) => state.selectedObjSectionSDBMember);
  const setSelectedObjSectionSDBMember = useDashboardStore((state) => state.setSelectedObjSectionSDBMember);

  // infoアイコン
  const infoIconProgressRef = useRef<HTMLDivElement | null>(null);

  // --------------------------- 変数定義 ---------------------------

  // ネタ表ボードに渡すid配列に変換
  const memberListSectionMember: MemberAccounts[] = useMemo(() => {
    if (!selectedObjSectionSDBMember) return [];
    const newIdList = [selectedObjSectionSDBMember];
    return newIdList;
  }, [selectedObjSectionSDBMember]);

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

  // 月度用カレンダー年の選択年
  const [selectedCalendarYear, setSelectedCalendarYear] = useState<number>(new Date().getFullYear());
  // 四半期、半期用の会計年度の選択年
  const [selectedFiscalYear, setSelectedFiscalYear] = useState<number>(currentFiscalYearDateObj.getFullYear());

  // ユーザーの会計基準の現在の月度を初期値にセットする
  useEffect(() => {
    // 現在の日付からユーザーの財務サイクルに応じた年月度を取得(年月度の年はカレンダー年)
    const currentFiscalYearMonth = calculateDateToYearMonth(new Date(), fiscalYearEndDate.getDate());
    const newCurrentPeriod = { periodType: "monthly", period: currentFiscalYearMonth } as PeriodSDB;
    console.log("✅newCurrentPeriod", newCurrentPeriod, "決算日Date", fiscalYearEndDate);
    setActivePeriodSDB(newCurrentPeriod);
  }, []);

  // 会計年度の選択肢
  const optionsFiscalYear = useMemo(() => {
    if (!userProfileState?.customer_fiscal_end_month) return [];
    return getOptionsFiscalYear({
      fiscalYearEnd: userProfileState.customer_fiscal_end_month,
      fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? "firstDayBasis",
    });
  }, [userProfileState?.customer_fiscal_end_month, userProfileState?.customer_fiscal_year_basis]);

  // カレンダー年の選択肢
  const optionsCalendarYear = useMemo(() => {
    return getOptionsCalendarYear({ currentDate: new Date() });
  }, []);

  // メンバーエンティティの選択中のメンバーの初期値をユーザー自身にセットする
  useEffect(() => {
    // 既にセット済みでnullでない場合はリターン
    if (!selectedObjSectionSDBMember) return;
    if (!userProfileState) return;
    // ユーザー自身を初期値にセット
    const u = userProfileState;
    const initialMemberObj = {
      id: u.id,
      created_at: u.created_at,
      updated_at: u.updated_at,
      avatar_url: u.avatar_url,
      is_subscriber: u.is_subscriber,
      company_role: u.company_role,
      role: u.role,
      stripe_customer_id: u.stripe_customer_id,
      last_name: u.last_name,
      first_name: u.first_name,
      email: u.email,
      department: u.department,
      position_name: u.position_name,
      position_class: u.position_class,
      direct_line: u.direct_line,
      company_cell_phone: u.company_cell_phone,
      personal_cell_phone: u.personal_cell_phone,
      occupation: u.occupation,
      direct_fax: u.direct_fax,
      signature_stamp_id: u.signature_stamp_id,
      employee_id: u.employee_id,
      is_active: u.is_active,
      profile_name: u.profile_name,
      accept_notification: u.accept_notification,
      first_time_login: u.first_time_login,
      office: u.office,
      section: u.section,
      unit: u.unit,
      usage: u.usage,
      purpose_of_use: u.purpose_of_use,
      subscribed_account_id: u.subscribed_account_id,
      account_created_at: u.account_created_at,
      account_company_role: u.account_company_role,
      account_state: u.account_state,
      account_invited_email: null,
      assigned_department_id: u.assigned_department_id,
      assigned_department_name: u.assigned_department_name,
      assigned_section_id: u.assigned_section_id,
      assigned_section_name: u.assigned_section_name,
      assigned_unit_id: u.assigned_unit_id,
      assigned_unit_name: u.assigned_unit_name,
      assigned_office_id: u.assigned_office_id,
      assigned_office_name: u.assigned_office_name,
      assigned_employee_id: u.assigned_employee_id,
      assigned_employee_id_name: u.assigned_employee_id_name,
      assigned_signature_stamp_id: u.assigned_signature_stamp_id,
      assigned_signature_stamp_url: u.assigned_signature_stamp_url,
    } as MemberAccounts;
    setSelectedObjSectionSDBMember(initialMemberObj);
  }, []);

  // 期間選択メニューの選択肢を期間タイプに応じて取得する関数
  const getPeriodTimeValue = (period: string): PeriodOption[] => {
    switch (period) {
      case "fiscalYear":
        return optionsFiscalYear;
      case "half":
        return optionsFiscalHalf;
      case "quarter":
        return optionsFiscalQuarter;
      case "monthly":
        return optionsFiscalMonth;

      default:
        return [];
        break;
    }
  };

  // --------------------------- 変数定義 ここまで ---------------------------
  // --------------------------------- useQuery ---------------------------------
  // -------------- 🌟エンティティのデータを取得🌟 => 係の場合は係のメンバー一覧、メンバーなら選択されたメンバー
  // 1. D&Dボードは、係・メンバーの時のみだと、事業部のみ登録した中小企業にフィットしないため、初期はメンバーの自分を表示する(初期表示で事業部以上はメンバー数が多くなりすぎるため)
  // -------------- ✅エンティティのデータを取得✅

  // --------------------------------- useQuery ここまで ---------------------------------

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

  // -------------------------- 🌟セクションメニュー🌟 --------------------------
  const handleOpenSectionMenu = ({ e, title, displayX, maxWidth, fadeType }: SectionMenuParams) => {
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
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      positionX = displayX === "left" ? window.innerWidth - x : 0;
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
    }
  }, [openSectionMenu?.displayX]);

  // メニューを閉じる
  const handleCloseSectionMenu = () => {
    setOpenSectionMenu(null);
  };
  // -------------------------- ✅セクションメニュー✅ --------------------------
  // -------------------------- 🌟説明ポップアップメニュー🌟 --------------------------
  const handleOpenPopupMenu = ({ e, title, displayX, maxWidth, fadeType, isHoverable }: PopupDescMenuParams) => {
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
      positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      positionX = displayX === "left" ? window.innerWidth - x : 0;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenPopupMenu({
        x: positionX,
        y: y,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        fadeType: fadeType,
        isHoverable: isHoverable,
      });
    }
  };

  // メニューを閉じる
  const handleClosePopupMenu = () => {
    setOpenPopupMenu(null);
  };
  // -------------------------- ✅説明ポップアップメニュー✅ --------------------------

  // ==================================== 🌟ツールチップ🌟 ====================================
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent | globalThis.MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
    content?: string;
    content2?: string;
    content3?: string;
    content4?: string;
  };
  const handleOpenTooltip = ({
    e,
    display = "",
    marginTop,
    itemsPosition,
    whiteSpace,
    content,
    content2,
    content3,
    content4,
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const dataText2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const dataText3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    const dataText4 = ((e.target as HTMLDivElement).dataset.text4 as string)
      ? ((e.target as HTMLDivElement).dataset.text4 as string)
      : "";
    setHoveredItemPosWrap({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: ((e.target as HTMLDivElement).dataset.text as string) || (content ?? ""),
      content2: dataText2 || content2 || "",
      content3: dataText3 || content3 || "",
      content4: dataText4 || content4 || "",
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
  // ==================================== ✅ツールチップ✅ ====================================

  // ポップアップのフェードタイプ
  const getFadeTypeClass = (fadeType: string) => {
    if (fadeType === "fade_down") return styles.fade_down;
    if (fadeType === "fade_up") return styles.fade_up;
    if (fadeType === "fade") return styles.fade;
  };

  // 期間をメニューから適用ボタンで変更する関数
  const handleChangePeriod = () => {
    if (!activePeriodSDBLocal) return;
    if (
      activePeriodSDB.periodType === activePeriodSDBLocal.periodType &&
      activePeriodSDB.period === activePeriodSDBLocal.period
    )
      return;
    const newPeriod = { periodType: activePeriodSDBLocal.periodType, period: activePeriodSDBLocal.period };
    setActivePeriodSDB(newPeriod);
  };

  const handleEnterInfoIcon = (
    e: MouseEvent<HTMLDivElement, MouseEvent | globalThis.MouseEvent>,
    infoIconRef: HTMLDivElement | null
  ) => {
    if (infoIconProgressRef.current && infoIconProgressRef.current.classList.contains(styles.animate_ping)) {
      infoIconProgressRef.current.classList.remove(styles.animate_ping);
    }
  };

  // 年月度の年と月を分けて取得する(ディスプレイ用)
  const displayYearMonth = useMemo(() => {
    const periodStr = activePeriodSDB.period.toString();
    const year = periodStr.length >= 4 ? periodStr.slice(0, 4) : "-"; // 1文字目~4文字目
    const month = periodStr.length >= 4 ? parseInt(periodStr.slice(4, 6), 10).toString() : "-"; // 5文字目~6文字目
    return { year: year, month: month };
  }, [activePeriodSDB.period]);

  console.log(
    "SalesProgressScreenコンポーネントレンダリング",
    "ユーザーの現在の期首Dateオブジェクト",
    currentFiscalYearDateObj,
    "選択中のカレンダー年",
    selectedCalendarYear,
    "選択中の会計年度の年",
    selectedFiscalYear,
    "activeTabSDB",
    activeTabSDB,
    "activeSectionSDB",
    activeSectionSDB,
    "activePeriodSDB",
    activePeriodSDB,
    "activePeriodSDBLocal",
    activePeriodSDBLocal,
    "mappingSdbTabName",
    mappingSdbTabName,
    "optionsFiscalYear",
    optionsFiscalYear,
    "optionsFiscalHalf",
    optionsFiscalHalf,
    "optionsFiscalQuarter",
    optionsFiscalQuarter,
    "optionsFiscalMonth",
    optionsFiscalMonth,
    "activePeriodSDB.period.toString().slice(0, 4)",
    activePeriodSDB?.period?.toString()?.slice(0, 4),
    "activePeriodSDBLocal.period.toString().slice(4)",
    activePeriodSDBLocal?.period?.toString()?.slice(4),
    "選択中のメンバー selectedObjSectionSDBMember",
    selectedObjSectionSDBMember
  );
  return (
    <>
      {/* <div className={`${styles.menu_overlay} flex-center`}>
        <SpinnerBrand bgColor="#fff" />
      </div> */}
      {/* -------------------------------- 売上進捗スクリーン -------------------------------- */}
      <div className={`${styles.sales_progress_screen}`}>
        {/* ------------------- セクションタイトル ------------------- */}

        <div className={`${styles.section_container} bg-[green]/[0]`}>
          <div className={`${styles.section_wrapper}`}>
            <div className={`${styles.left_wrapper} flex items-end`}>
              <div
                className={`${styles.section_title}`}
                onClick={(e) => {
                  handleOpenSectionMenu({ e, title: "dashboard", fadeType: "fade_down", maxWidth: 310 });
                  handleCloseTooltip();
                }}
                onMouseEnter={(e) => {
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `売上進捗・営業指数・プロセス・期間ごとの案件一覧・エリア毎の売上マップなど`,
                    content2: `各用途毎のダッシュボードの表示切り替えが可能です。`,
                    marginTop: 28,
                    itemsPosition: "left",
                  });
                }}
                onMouseLeave={handleCloseTooltip}
              >
                <div className={`${styles.div_wrapper} flex-center gap-[6px]`}>
                  <span className={``}>{mappingSdbTabName[activeTabSDB][language]}</span>
                  <div className={`${styles.down_icon} flex-center`}>
                    <IoCaretDownOutline className={``} />
                  </div>
                </div>
              </div>

              <div className={`${styles.entity_type} ${openSectionMenu?.title === "entity" ? `${styles.active}` : ``}`}>
                <div
                  className={`underline_area mb-[-1px] flex cursor-pointer flex-col hover:text-[var(--color-bg-brand-f)]`}
                  onClick={(e) => {
                    handleOpenSectionMenu({
                      e,
                      title: "entity",
                      displayX: "center",
                      fadeType: "fade_down",
                      maxWidth: 310,
                    });
                    handleCloseTooltip();
                  }}
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: `「全社・事業部・係/チーム・メンバー個人」を変更することで`,
                      content2: `各セクション毎にダッシュボードを確認が可能です。`,
                      marginTop: 28,
                      itemsPosition: "left",
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  <span>{mappingSectionName[activeSectionSDB][language]}</span>
                  <div className={`flow_underline brand_light one_px w-full`} />
                </div>
              </div>
              <div className={`${styles.period_type} ${openSectionMenu?.title === "period" ? `${styles.active}` : ``}`}>
                <div
                  className={`underline_area mb-[-1px] flex cursor-pointer flex-col hover:text-[var(--color-bg-brand-f)]`}
                  onClick={(e) => {
                    console.log(
                      "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 activePeriodSDB.period.toString().slice(0, 4)",
                      activePeriodSDB.period.toString().slice(0, 4),
                      activePeriodSDB
                    );
                    if (activePeriodSDB.periodType === "monthly" && activePeriodSDB.period) {
                      setSelectedCalendarYear(Number(activePeriodSDB.period.toString().slice(0, 4)));
                    }
                    setActivePeriodSDBLocal({
                      periodType: activePeriodSDB.periodType,
                      period: activePeriodSDB.period,
                    });
                    handleOpenSectionMenu({
                      e,
                      title: "period",
                      displayX: "center",
                      fadeType: "fade_down",
                      maxWidth: 330,
                    });
                    handleCloseTooltip();
                  }}
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: `期間を「月次・四半期・半期・年度」のタイプと期間を選択することで`,
                      content2: `その期間内でフィルターしたデータをダッシュボードに反映します。`,
                      marginTop: 28,
                      itemsPosition: "left",
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  {activePeriodSDB.periodType === "monthly" && activePeriodSDB.period !== 0 && (
                    <span>
                      {displayYearMonth.year} - {displayYearMonth.month}月度
                    </span>
                  )}
                  <div className={`flow_underline brand_light one_px w-full`} />
                </div>
              </div>
              <div className={`${styles.info_area} flex-center min-h-[36px] px-[6px] py-[6px]`}>
                <div
                  className="flex-center relative h-[18px] w-[18px] rounded-full"
                  onMouseEnter={(e) => handleEnterInfoIcon(e, infoIconProgressRef.current)}
                  onMouseLeave={handleCloseTooltip}
                >
                  <div
                    ref={infoIconProgressRef}
                    className={`flex-center absolute left-0 top-0 h-[18px] w-[18px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                  ></div>
                  <ImInfo className={`min-h-[18px] min-w-[18px] text-[var(--color-bg-brand-f)]`} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ------------------- セクションタイトル ここまで ------------------- */}

        {/* ------------------- 売上目標+現売実績ホワイトボード ------------------- */}

        {/* ------------------- 売上目標+現売実績ホワイトボード ここまで ------------------- */}

        {/* ------------------- ネタ表ボードスクリーン ------------------- */}
        {activeTabSDB === "salesProgress" && activePeriodSDB.period !== 0 && (
          <ScreenDealBoards
            memberList={memberListSectionMember}
            periodType={activePeriodSDB.periodType}
            period={activePeriodSDB.period}
          />
        )}
        {/* ------------------- ネタ表ボードスクリーン ここまで ------------------- */}
      </div>
      {/* -------------------------------- 売上進捗スクリーン ここまで -------------------------------- */}

      {/* ---------------------------- セッティングメニュー ---------------------------- */}
      {/* エディット時のメニュー上オーバーレイ */}
      {/* {isOpenPopupOverlay && (
        <div
        className={`${styles.menu_overlay} ${styles.above_setting_menu} bg-[#ffffff00]`}
        onClick={handleCloseClickPopup}
        ></div>
        )} */}
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
          {openSectionMenu.title === "dashboard" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>ダッシュボードメニュー</span>
                  <div className={`${styles.section_underline} w-full`} />
                </div>
              </h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューから選択したダッシュボードを表示します。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  {sdbTabsList.map((obj, index) => {
                    const isActive = obj.title === activeTabSDB;
                    return (
                      <li
                        key={obj.title}
                        className={`${styles.list} ${styles.select_list} ${isActive ? styles.active : ``}`}
                        onClick={(e) => {
                          if (isActive) return;
                          setActiveTabSDB(obj.title);
                          handleClosePopupMenu();
                        }}
                        // onMouseEnter={(e) => {
                        //   handleOpenPopupMenu({ e, title: "deals_status", displayX: "right", maxWidth: 360 });
                        // }}
                        // onMouseLeave={handleClosePopupMenu}
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
            </>
          )}

          {/* ------------------------ エンティティ選択メニュー ------------------------ */}
          {openSectionMenu.title === "entity" && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>セクションメニュー</span>
                  <div className={`${styles.section_underline} w-full`} />
                </div>
              </h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューから「全社・事業部・係/チーム・メンバー個人」を変更することで、各セクションに応じたデータを反映します。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  {sectionList.map((obj, index) => {
                    const isActive = obj.title === activeSectionSDB;
                    return (
                      <li
                        key={obj.title}
                        className={`${styles.list} ${styles.select_list} ${isActive ? styles.active : ``}`}
                        onClick={(e) => {
                          if (isActive) return;
                          setActiveSectionSDB(obj.title);
                          handleClosePopupMenu();
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
              {/* 右サイドエンティティ詳細メニュー 適用・戻るエリア */}
              <div
                className={`${styles.settings_menu} ${styles.edit_mode}  z-[3000] h-auto w-[330px] overflow-hidden rounded-[6px] ${styles.fade_up}`}
                style={{
                  // position: "absolute",
                  // bottom: "-168px",
                  // left: 0,
                  position: "absolute",
                  // ...(sectionMenuRef.current?.offsetWidth
                  //   ? { bottom: "0px", left: sectionMenuRef.current?.offsetWidth + 10 }
                  //   : { bottom: "-168px", left: 0 }),
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
                    <span>{mappingSectionName[activeSectionSDB][language]}</span>
                    <div className={`${styles.underline} w-full`} />
                  </div>
                </li>
                {/* ------------------------------------ */}
                {/* ------------------------------------ */}
                <li
                  className={`${styles.list}`}
                  onMouseEnter={(e) => {
                    handleOpenPopupMenu({ e, title: "compressionRatio" });
                  }}
                  onMouseLeave={handleClosePopupMenu}
                >
                  <div className="pointer-events-none flex min-w-[70px] items-center">
                    {/* <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" /> */}
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>表示中</span>
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
                              const tooltipContent = "伊藤 謙太";
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
                            if (hoveredItemPosWrap) handleCloseTooltip();
                          }}
                        >
                          伊藤 謙太
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
                        if (hoveredItemPosWrap) handleCloseTooltip();
                      }}
                      // onClick={() => {
                      //   setSelectedMemberObj(null);
                      //   if (hoveredItemPosSideTable) handleCloseTooltip();
                      // }}
                    >
                      <FaExchangeAlt className="text-[13px]" />
                    </div>
                  </div>
                </li>
                {/* ------------------------------------ */}
                <hr className="min-h-[1px] w-full bg-[#999]" />
                {/* ------------------------------------ */}
                <li className={`${styles.list} ${styles.btn_area} space-x-[20px]`}>
                  <div
                    className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${styles.active}`}
                    onClick={handleChangePeriod}
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
              {/* 右サイドエンティティ詳細メニュー 適用・戻るエリア */}
            </>
          )}
          {/* ------------------------ エンティティ選択メニュー ------------------------ */}

          {/* ------------------------ 期間選択メニュー ------------------------ */}
          {openSectionMenu.title === "period" && activePeriodSDBLocal && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>期間選択メニュー</span>
                  <div className={`${styles.section_underline} w-full`} />
                </div>
              </h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                下記メニューの期間から「月次・四半期・半期・年度」のいずれかを選択してから、後に表示される各期間ごとの選択肢を選択することで、各期間に応じたデータをダッシュボードに反映します。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* -------- メニューコンテンツエリア -------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  <li className={`${styles.section_title} flex min-h-max w-full font-bold`}>
                    <div className="flex max-w-max flex-col">
                      <span>会計年度</span>
                      <div className={`${styles.underline} w-full`} />
                    </div>
                    {/* <div className="pointer-events-none flex min-w-[130px] items-center">
                      <div className="flex max-w-max flex-col">
                        <span>会計年度</span>
                        <div className={`${styles.underline} w-full`} />
                      </div>
                    </div> */}
                    {/* <div className="flex items-center">
                      <span>{activePeriodSDBLocal.period}</span>
                    </div> */}
                  </li>
                  {/* ------------------------------------ */}
                  <li
                    className={`${styles.list}`}
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
                        <span className={`${styles.list_title}`}>期間</span>
                        <span className={``}>：</span>
                      </div>
                    </div>
                    <select
                      className={`${styles.select_box} truncate`}
                      value={activePeriodSDBLocal.periodType}
                      onChange={(e) => {
                        if (e.target.value === "monthly") {
                          const newPeriod = Number(`${selectedCalendarYear}${new Date().getMonth() + 1}`);
                          setActivePeriodSDBLocal({ periodType: e.target.value, period: newPeriod });
                        } else if (e.target.value === "fiscalYear") {
                          setActivePeriodSDBLocal({ periodType: e.target.value, period: selectedFiscalYear });
                        } else {
                          // 四半期と半期は両方1をセットして、1QとH1を初期値として更新する
                          const newPeriod = Number(`${selectedFiscalYear}1`);
                          setActivePeriodSDBLocal({ periodType: e.target.value, period: newPeriod });
                        }
                      }}
                    >
                      {periodList.map((option) => (
                        <option key={option.title} value={option.title}>
                          {option.name[language]}
                        </option>
                      ))}
                    </select>
                  </li>
                  {/* ------------------------------------ */}
                  {/* ------------------------------------ 年度以外は年を選択 */}
                  {activePeriodSDBLocal.periodType !== "fiscalYear" && (
                    <li className={`${styles.list}`}>
                      <div className="pointer-events-none flex min-w-[130px] items-center">
                        <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                        <div className="flex select-none items-center space-x-[2px]">
                          <span className={`${styles.list_title}`}>年</span>
                          <span className={``}>：</span>
                        </div>
                      </div>
                      {activePeriodSDBLocal.periodType === "monthly" && (
                        <select
                          className={`${styles.select_box} truncate`}
                          value={selectedCalendarYear.toString()}
                          onChange={(e) => {
                            setSelectedCalendarYear(Number(e.target.value));
                            // 月度は202403の6桁なので-2
                            const valueWithoutYear = activePeriodSDBLocal.period.toString().slice(-2);
                            // 年と現在の月度か四半期か半期の値を結合して数値型に変換
                            const newPeriod = Number(`${e.target.value}${valueWithoutYear}`);
                            console.log("newPeriod", newPeriod, "valueWithoutYear", valueWithoutYear);
                            setActivePeriodSDBLocal({ ...activePeriodSDBLocal, period: newPeriod });
                          }}
                        >
                          {optionsCalendarYear.map((option) => (
                            <option key={option.key} value={option.value}>
                              {option.name[language]}
                            </option>
                          ))}
                        </select>
                      )}
                      {["half", "quarter"].includes(activePeriodSDBLocal.periodType) && (
                        <select
                          className={`${styles.select_box} truncate`}
                          value={selectedFiscalYear.toString()}
                          onChange={(e) => {
                            setSelectedFiscalYear(Number(e.target.value));
                            // 四半期、半期は20243や20241の5桁なので-1
                            const valueWithoutYear = activePeriodSDBLocal.period.toString().slice(-1);
                            // 年と現在の月度か四半期か半期の値を結合して数値型に変換
                            const newPeriod = Number(`${e.target.value}${valueWithoutYear}`);
                            console.log("newPeriod", newPeriod, "valueWithoutYear", valueWithoutYear);
                            setActivePeriodSDBLocal({ ...activePeriodSDBLocal, period: newPeriod });
                          }}
                        >
                          {optionsFiscalYear.map((option) => (
                            <option key={option.key} value={option.value}>
                              {option.name[language]}
                            </option>
                          ))}
                        </select>
                      )}
                    </li>
                  )}
                  {/* ------------------------------------ */}
                  {/* ------------------------------------ */}
                  <li
                    className={`${styles.list}`}
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
                        <span className={`${styles.list_title}`}>
                          {activePeriodSDBLocal.periodType === "fiscalYear" && "年度"}
                          {activePeriodSDBLocal.periodType === "half" && "半期"}
                          {activePeriodSDBLocal.periodType === "quarter" && "四半期"}
                          {activePeriodSDBLocal.periodType === "monthly" && "月度"}
                        </span>
                        <span className={``}>：</span>
                      </div>
                    </div>
                    <select
                      className={`${styles.select_box} truncate`}
                      value={
                        activePeriodSDBLocal.periodType === "fiscalYear"
                          ? activePeriodSDBLocal.period.toString().slice(0, 4)
                          : activePeriodSDBLocal.period.toString().slice(4)
                      }
                      onChange={(e) => {
                        if (activePeriodSDBLocal.periodType === "fiscalYear") {
                          setActivePeriodSDBLocal({ ...activePeriodSDBLocal, period: Number(e.target.value) });
                        } else {
                          // 月度、四半期、半期は年と結合してstateを更新
                          // 月度はカレンダー年の選択年と結合
                          if (activePeriodSDBLocal.periodType === "monthly") {
                            // 年と現在の月度の値を結合して数値型に変換
                            const newPeriod = Number(`${selectedCalendarYear}${e.target.value}`);
                            console.log("newPeriod", newPeriod, "e.target.value", e.target.value);
                            setActivePeriodSDBLocal({ ...activePeriodSDBLocal, period: newPeriod });
                          } else {
                            // 年と現在の四半期or半期の値を結合して数値型に変換
                            const newPeriod = Number(`${selectedFiscalYear}${e.target.value}`);
                            console.log("newPeriod", newPeriod, "e.target.value", e.target.value);
                            setActivePeriodSDBLocal({ ...activePeriodSDBLocal, period: newPeriod });
                          }
                        }
                      }}
                    >
                      {getPeriodTimeValue(activePeriodSDBLocal.periodType).map((option) => (
                        <option key={option.key} value={option.value}>
                          {option.name[language]}
                        </option>
                      ))}
                    </select>
                  </li>
                  {/* ------------------------------------ */}
                </ul>
              </div>
              {/* 適用・戻るエリア(期間メニュー) */}
              <div
                className={`${styles.settings_menu} ${styles.edit_mode}  z-[3000] h-auto w-[330px] overflow-hidden rounded-[6px] ${styles.fade_up}`}
                style={{
                  position: "absolute",
                  bottom: "-70px",
                  left: 0,
                  animationDelay: `0.2s`,
                  animationDuration: `0.5s`,
                  ...(openSectionMenu.maxWidth && { maxWidth: `${openSectionMenu.maxWidth}px` }),
                }}
              >
                {/* ------------------------------------ */}
                <li className={`${styles.list} ${styles.btn_area} space-x-[20px]`}>
                  <div
                    className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${styles.active}`}
                    onClick={handleChangePeriod}
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
              {/* 適用・戻るエリア(期間メニュー) */}
            </>
          )}
          {/* ------------------------ 期間選択メニュー ------------------------ */}
        </div>
      )}
      {/* ---------------------------- セッティングメニュー ここまで ---------------------------- */}
    </>
  );
};

export const SalesProgressScreen = memo(SalesProgressScreenMemo);
