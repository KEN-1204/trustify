import { Suspense, memo, useEffect, useMemo, useRef, useState } from "react";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { Fallback } from "@/components/Fallback/Fallback";
import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";
import { IoClose } from "react-icons/io5";

import styles from "./BusinessCalendarModal.module.css";
import { BusinessCalendarComponent } from "./BusinessCalendarComponent/BusinessCalendarComponent";
import useStore from "@/store";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { format, getDaysInYear, getYear, isWithinInterval, subMonths } from "date-fns";
import { toast } from "react-toastify";
import { FiDownload } from "react-icons/fi";
import { LuSettings2 } from "react-icons/lu";
import { MdEdit, MdLocalPrintshop, MdOutlineDataSaverOff } from "react-icons/md";
import { useQueryAnnualFiscalMonthClosingDays } from "@/hooks/useQueryAnnualFiscalMonthClosingDays";
import { useQueryCalendarForFiscalBase } from "@/hooks/useQueryCalendarForFiscalBase";
import { useQueryCalendarForCalendarBase } from "@/hooks/useQueryCalendarForCalendarBase";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { ImInfo } from "react-icons/im";
import { FaRegDotCircle } from "react-icons/fa";
import { RxDot, RxDotFilled } from "react-icons/rx";
import { calculateCurrentFiscalYear } from "@/utils/Helpers/calculateCurrentFiscalYear";
import { calculateCurrentFiscalYearEndDate } from "@/utils/Helpers/calcurateCurrentFiscalYearEndDate";
import { splitArrayIntoChunks } from "@/utils/Helpers/splitArrayIntoChunks";
import { CustomerBusinessCalendars } from "@/types";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { formatDateToYYYYMMDD } from "@/utils/Helpers/formatDateLocalToYYYYMMDD";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationModal } from "../ConfirmationModal/ConfirmationModal";

type CompressionRatio = "NONE" | "FAST" | "SLOW";
const optionsCompressionRatio: CompressionRatio[] = ["NONE", "FAST", "SLOW"];
const getCompressionRatio = (value: string, language: string) => {
  switch (value) {
    case "NONE":
      return language === "ja" ? `高解像度 / 重` : `High Quality`;
      break;
    case "FAST":
      return language === "ja" ? `中解像度 / 中` : `Middle Quality`;
      break;
    case "SLOW":
      return language === "ja" ? `低解像度 / 軽` : `High Quality`;
      break;

    default:
      return value;
      break;
  }
};

const descriptionCompressionRatio = [
  {
    title: "高解像度 / 重",
    content:
      "圧縮を行わずにPDFに変換するため、画像を最高品質の状態でPDFに保存、印刷が可能ですが、ファイルサイズが大きいのが特徴です。",
  },
  {
    title: "中解像度 / 中",
    content:
      "画像を高品質に保った状態でファイルサイズも小さくします。印刷やPDFデータの送受信などどちらでもバランスよく活用できます。",
  },
  {
    title: "低解像度 / 軽",
    content: "より高い圧縮率でファイルサイズを最小限に軽量化できますが、画質が劣化する可能性があります。",
  },
];

const descriptionGuide = [
  {
    title: "正確なデータ分析と評価",
    content:
      "営業稼働日と休業日を設定しておくことで、年度・月度ごとの稼働日に基づいた適切な面談・デモ件数、TELPR件数の目標設定と各プロセスの結果に基づく正確な評価・分析が可能となります。\nまた、稼働日を年度ごとに設定することで、各営業テリトリーの過去比較を行う際に稼働日も考慮した正確な分析が可能です。",
  },
  {
    title: "PDFダウンロード",
    content: "登録した営業カレンダーは右側のダウンロードアイコンからPDF形式でダウンロードが可能です。",
  },
  {
    title: "印刷",
    content:
      "A7サイズでの印刷が可能なため、印刷して各メンバーの手帳に入れておくことで、お客様との商談で自社の営業締日ベースでのスケジュールの擦り合わせなどで活用頂けます。",
  },
];

const descriptionSteps = [
  {
    title: "ステップ1：定休日を適用",
    content:
      "会計年度を選択してから、「会社・チーム」画面で設定した定休日を一括で適用します。\n各年度ごとに定休日は1ヶ月に1回のみ一括変更が可能です。",
  },
  {
    title: "ステップ2：会社独自の休業日を個別登録",
    content:
      "定休日以外の休業日はお客様ごとに異なるため、「休業日の個別編集」からカレンダーの日付を複数選択して登録・変更します。",
  },
  // {
  //   title: "",
  //   content: "より高い圧縮率でファイルサイズを最小限に軽量化できますが、画質が劣化する可能性があります。",
  // },
];

const mappingDescriptions: { [key: string]: { [key: string]: string }[] } = {
  guide: descriptionGuide,
  step: descriptionSteps,
  compressionRatio: descriptionCompressionRatio,
};

const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dayNamesJa = ["日", "月", "火", "水", "木", "金", "土"];
const dayFullNamesEn = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const dayFullNamesJa = ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
const sortedDaysPlaceholder = Array(7)
  .fill(null)
  .map((_, index) => index)
  .sort((a, b) => {
    // 日曜日(0)を最後にするためのソート関数 日曜日(0)を最大値として扱うための変換
    const adjustedA = a === 0 ? 7 : a;
    const adjustedB = b === 0 ? 7 : b;
    return adjustedA - adjustedB;
  });
// 定休日リストの数値から定休日の曜日の一覧を取得する関数
const getClosingDaysNameString = (closingDaysList: number[]) => {
  if (!closingDaysList.length) return null;
  const nameList = closingDaysList.map((num) => dayFullNamesJa[num]);
  return nameList;
};

// 月の始まりの1日の曜日に応じて１ヶ月の配列の先頭にnullを追加する関数
const addNullMonthArray = (dayOfWeek: number, array: any[]): (CustomerBusinessCalendars | null)[] => {
  //  日曜日の場合、6このnullを追加(月曜始まりのカレンダー)
  // それ以外の場合、dayOfWeek - 1 個のnullを追加 (月曜日は追加しない実装になってる)
  const nullCount = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  return [...Array(nullCount).fill(null), ...array];
};

const BusinessCalendarModalMemo = () => {
  //   const [modalLeftPos, setModalLeftPos] = useState(0);

  //   useEffect(() => {
  //     if (!previewModalTwinAreaRef.current) return;

  //     setModalLeftPos(previewModalTwinAreaRef.current.getBoundingClientRect().x);
  //   }, []);

  // 🔹グローバルstate関連
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setIsOpenBusinessCalendarSettingModal = useDashboardStore(
    (state) => state.setIsOpenBusinessCalendarSettingModal
  );
  const language = useStore((state) => state.language);
  // 選択中の会計年度
  const selectedFiscalYearSetting = useDashboardStore((state) => state.selectedFiscalYearSetting);
  const setSelectedFiscalYearSetting = useDashboardStore((state) => state.setSelectedFiscalYearSetting);
  // 決算日が28~30までで末日でない決算日の場合の各月度の開始日、終了日カスタムinput
  const fiscalMonthStartEndInputArray = useDashboardStore((state) => state.fiscalMonthStartEndInputArray);
  const setFiscalMonthStartEndInputArray = useDashboardStore((state) => state.setFiscalMonthStartEndInputArray);

  if (!selectedFiscalYearSetting) return null;
  if (!userProfileState) return null;

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 🔹ローカルstate関連
  const [pdfURL, setPdfURL] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null); // アンマウント時画像URLリソース解放用のstate
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState<string[]>([]); // エディットモード
  const [isOpenSettings, setIsOpenSettings] = useState(false); // セッティングメニュー
  const [compressionRatio, setCompressionRatio] = useState<CompressionRatio>("FAST"); // 画像をPDF化する際の圧縮率3段階を指定

  // 🔹useRef関連
  const previewModalTwinAreaRef = useRef<HTMLDivElement | null>(null);
  const pdfTargetRef = useRef<HTMLDivElement | null>(null);
  // 説明アイコン
  const infoIconSettingMenuRef = useRef<HTMLDivElement | null>(null);
  const infoIconStepRef = useRef<HTMLDivElement | null>(null);

  // 🔹変数定義関連
  // 設定済みの定休日の曜日名の配列
  const customerClosingDaysNameArray = getClosingDaysNameString(userProfileState.customer_closing_days);
  // 決算日Date
  const fiscalYearEndDate = calculateCurrentFiscalYearEndDate(userProfileState?.customer_fiscal_end_month ?? null);
  // 期首Date
  const fiscalYearStartDate = calculateFiscalYearStart(userProfileState?.customer_fiscal_end_month ?? null);
  // 選択年オプション(現在の年から3年遡る, 1年後は決算日まで３ヶ月を切った場合は選択肢に入れる)
  const [optionsFiscalYear, setOptionsFiscalYear] = useState<{ label: string; value: number }[]>([]);
  // 年度別の定休日適用ステータス配列
  type StatusClosingDays = { fiscal_year: number; applied_closing_days: number[]; updated_at: number | null };
  const [statusAnnualClosingDaysArray, setStatusAnnualClosingDaysArray] = useState<StatusClosingDays[] | null>(null);
  // 現在選択している会計年度が定休日を適用したかと、している場合１ヶ月前かどうか確認
  const statusClosingDaysSelectedYear = statusAnnualClosingDaysArray?.find(
    (obj) => obj.fiscal_year === selectedFiscalYearSetting
  );
  // 現在選択している会計年度の定休日が適用できるかどうか(1ヶ月以内なら適用不可)
  const isAvailableApplyClosingDays = useMemo(() => {
    if (!statusClosingDaysSelectedYear?.updated_at) return true;
    const currentDate = new Date();
    const oneMonthAgo = subMonths(currentDate, 1);
    const isWithinOneMonth = isWithinInterval(new Date(statusClosingDaysSelectedYear.updated_at), {
      start: oneMonthAgo,
      end: currentDate,
    });
    if (isWithinOneMonth) {
      return false;
    } else {
      return true;
    }
  }, [statusClosingDaysSelectedYear, selectedFiscalYearSetting]);
  // 現在の会計年度ので適用されている定休日があれば曜日の配列のみ変数に格納
  const closingDaysArraySelectedYear = statusClosingDaysSelectedYear?.applied_closing_days ?? [];

  useEffect(() => {
    if (!fiscalYearEndDate || !selectedFiscalYearSetting || !userProfileState) {
      setIsOpenBusinessCalendarSettingModal(false);
      return;
    }
    // const currentYear = selectedFiscalYearSetting;
    // const currentYear = getYear(new Date());
    // 現在の会計年度を取得
    const currentYear = calculateCurrentFiscalYear(userProfileState?.customer_fiscal_end_month ?? null);
    // // 2020年度から現在+翌年度までの選択肢を生成
    let y = 2020;
    let years = [];
    while (y <= currentYear) {
      years.push(y);
      y += 1;
    }
    // let years = [currentYear - 3, currentYear - 2, currentYear - 1, currentYear];

    // 現在の日付が決算日から３ヶ月以内かどうかをチェック subMonths: 特定のDateから3ヶ月前の日付を計算
    const threeMonthsBeforeFiscalEnd = subMonths(fiscalYearEndDate, 3);
    // isWithinInterval: 第一引数に指定された日付が、第二引数に指定された期間内にあるかどうかを真偽値で返す
    const isWithin3Months = isWithinInterval(new Date(), { start: threeMonthsBeforeFiscalEnd, end: fiscalYearEndDate });
    if (isWithin3Months) {
      // ３ヶ月以内であれば翌年度も追加
      years.push(currentYear + 1);
    }

    // 年度を選択肢として指定
    const yearOptions = years.map((year) => ({
      label: `${year}年度`,
      value: year,
    }));

    console.log(
      "fiscalYearEndDate",
      fiscalYearEndDate,
      "threeMonthsBeforeFiscalEnd",
      threeMonthsBeforeFiscalEnd,
      "yearOptions",
      yearOptions,
      "selectedFiscalYearSetting",
      selectedFiscalYearSetting
    );

    // stateにオプションを追加
    setOptionsFiscalYear(yearOptions);

    // ローカルストレージから各年度の定休日の更新日時を取得する 存在しなければ取得した各年度を配列でローカルストレージに格納する
    const statusAnnualClosingDays = localStorage.getItem("status_annual_closing_days");
    console.log("ローカルストレージ statusAnnualClosingDays", statusAnnualClosingDays);
    if (statusAnnualClosingDays) {
      const parsedStatusArray: StatusClosingDays[] = JSON.parse(statusAnnualClosingDays);
      let newArray = parsedStatusArray;
      console.log("ローカルストレージ存在ルート parsedStatusArray", parsedStatusArray);

      if (isWithin3Months && newArray.every((obj) => obj.fiscal_year !== currentYear + 1)) {
        newArray.push({ fiscal_year: currentYear + 1, applied_closing_days: [], updated_at: null });
        const newValue = JSON.stringify(newArray);
        console.log("ローカルストレージ存在ルート 3ヶ月以内 newValue", newValue);
        localStorage.setItem("status_annual_closing_days", newValue);
      }
      setStatusAnnualClosingDaysArray(newArray);
    } else {
      const newStatusArray = years.map((year) => {
        return { fiscal_year: year, applied_closing_days: [], updated_at: null };
      });
      localStorage.setItem("status_annual_closing_days", JSON.stringify(newStatusArray));
      setStatusAnnualClosingDaysArray(newStatusArray);
    }
  }, []);

  // 決算日が28~30までで末日でない決算月かどうか確認
  const isRequiredInputFiscalStartEndDate =
    fiscalYearEndDate &&
    fiscalYearEndDate.getDate() !==
      new Date(fiscalYearEndDate.getFullYear(), fiscalYearEndDate.getMonth() + 1, 0).getDate() &&
    27 < fiscalYearEndDate.getDate() &&
    fiscalYearEndDate.getDate() <= 31
      ? true
      : false;
  // ②ならisReadyをfalseにして、12個分の開始終了日の要素の配列が完成した時にtrueにする
  const [isReadyClosingDays, setIsReadyClosingDays] = useState(
    isRequiredInputFiscalStartEndDate ? (fiscalMonthStartEndInputArray ? true : false) : true
  );

  // -------------------------- 🌟useQuery🌟 --------------------------
  // 🌟useQuery 選択した年度の休業日を取得する🌟
  const {
    data: annualMonthlyClosingDays,
    isLoading: isLoadingAnnualMonthlyClosingDays,
    isError: isErrorAnnualMonthlyClosingDay,
    error: errorAnnualClosingDays,
  } = useQueryAnnualFiscalMonthClosingDays({
    customerId: userProfileState?.company_id ?? null,
    selectedYear: selectedFiscalYearSetting,
    fiscalYearEnd: userProfileState?.customer_fiscal_end_month,
    isRequiredInputFiscalStartEndDate: isRequiredInputFiscalStartEndDate ?? false,
    customInputArray: isRequiredInputFiscalStartEndDate ? fiscalMonthStartEndInputArray : null,
    isReady: isReadyClosingDays,
  });

  // 一度取得した年間の休業日リストを保持しておき、変更されたかチェックできるようにする
  const [prevFetchTimeAnnualClosing, setPrevFetchTimeAnnualClosing] = useState<number | null>(null);
  // 年間の休業日が変更されたら、両カレンダーをisReadyをtrueにしてinvalidateにしてから再度新しく生成する
  const isReadyCalendarForFBRef = useRef(true);
  const isReadyCalendarForCBRef = useRef(true);

  useEffect(() => {
    if (!annualMonthlyClosingDays?.getTime) return;
    console.log("💡💡💡💡💡💡年間休日リストの再フェッチを確認");
    if (prevFetchTimeAnnualClosing === (annualMonthlyClosingDays?.getTime ?? null)) return;
    // 取得したタイムスタンプが変更されたら各カレンダーuseQueryのisReadyをtrueに変更する
    isReadyCalendarForFBRef.current = true;
    isReadyCalendarForCBRef.current = true;
    // フェッチした時間を更新
    console.log("🔥🔥🔥🔥🔥営業カレンダーを再生成");
    setPrevFetchTimeAnnualClosing(annualMonthlyClosingDays?.getTime ?? null);

    // 年間休日数が変更されると営業稼働日数が変わるのでfiscal_baseのみinvalidate
    const resetQueryCalendars = async () => {
      await queryClient.invalidateQueries({ queryKey: ["calendar_for_fiscal_base"] });
      // await queryClient.invalidateQueries({ queryKey: ["calendar_for_calendar_base"] });
    };
    resetQueryCalendars();
  }, [annualMonthlyClosingDays?.getTime]);

  // 🌟useQuery 顧客の会計月度ごとの営業日も追加した会計年度カレンダーの完全リスト🌟
  const {
    data: calendarForFiscalBase,
    isLoading: isLoadingCalendarForFiscalBase,
    isError: isErrorCalendarForFiscalBase,
    error: errorCalendarForFiscalBase,
  } = useQueryCalendarForFiscalBase({
    selectedFiscalYear: selectedFiscalYearSetting,
    annualMonthlyClosingDays: annualMonthlyClosingDays
      ? annualMonthlyClosingDays.annual_closing_days_obj.annual_closing_days
      : null,
    // annualMonthlyClosingDays: annualMonthlyClosingDays ? annualMonthlyClosingDays : null,
    isReady: isReadyCalendarForFBRef.current && !isLoadingAnnualMonthlyClosingDays,
  });

  // 🌟useQuery カレンダーベースの営業日も追加した完全リスト🌟
  const {
    data: calendarForCalendarBase,
    isLoading: isLoadingCalendarForCalendarBase,
    isError: isErrorCalendarForCalendarBase,
    error: errorCalendarForCalendarBase,
  } = useQueryCalendarForCalendarBase({
    selectedFiscalYear: selectedFiscalYearSetting,
    annualMonthlyClosingDays: annualMonthlyClosingDays
      ? annualMonthlyClosingDays.annual_closing_days_obj.annual_closing_days
      : null,
    // annualMonthlyClosingDays: annualMonthlyClosingDays ? annualMonthlyClosingDays : null,
    isReady: isReadyCalendarForCBRef.current && !isLoadingAnnualMonthlyClosingDays,
  });

  // 年間休業日日数
  const annualClosingDaysCount = annualMonthlyClosingDays?.annual_closing_days_obj?.annual_closing_days_count ?? 0;
  // 年間営業稼働日数
  const annualWorkingDaysCount =
    calendarForFiscalBase?.daysCountInYear ?? getDaysInYear(selectedFiscalYearSetting ?? new Date().getFullYear());

  // カレンダーリストを3つの要素をもつ4つの配列に分割する
  type SplitMonthsArray =
    | {
        fiscalYearMonth: string;
        monthlyDays: CustomerBusinessCalendars[];
        monthlyWorkingDaysCount: number;
      }[][]
    | null;
  const splitMonthsArrayForCB: SplitMonthsArray = useMemo(
    () =>
      !!calendarForCalendarBase?.completeAnnualFiscalCalendar?.length
        ? splitArrayIntoChunks(calendarForCalendarBase?.completeAnnualFiscalCalendar, 3)
        : null,
    [calendarForCalendarBase?.completeAnnualFiscalCalendar]
  );
  const splitMonthsArrayForFB: SplitMonthsArray = useMemo(
    () =>
      !!calendarForFiscalBase?.completeAnnualFiscalCalendar?.length
        ? splitArrayIntoChunks(calendarForFiscalBase?.completeAnnualFiscalCalendar, 3)
        : null,
    [calendarForFiscalBase?.completeAnnualFiscalCalendar]
  );

  // 年が切り替わるインデックス(切り替わらない場合はnull)
  // const switchYearIndex =
  //   calendarForCalendarBase?.completeAnnualFiscalCalendar.findIndex(
  //     (obj) => obj.fiscalYearMonth?.split("-")[0] !== selectedFiscalYearSetting.toString()
  //   ) ?? null;
  const rowIndexOfSwitchYear = useMemo(() => {
    const index = splitMonthsArrayForFB?.findIndex((chunk) =>
      chunk.some((element) => {
        const year = parseInt(element.fiscalYearMonth.split("-")[0]); // 年を取得
        return year !== selectedFiscalYearSetting;
      })
    );
    return index !== -1 ? index : null;
  }, [splitMonthsArrayForFB]);

  // 年が切り替わるインデックスがチャンクの先頭、かつ、rowIndexが最初の行でない場合はtrue
  const isSwitchYear = useMemo(() => {
    if (rowIndexOfSwitchYear && splitMonthsArrayForFB) {
      const index = splitMonthsArrayForFB[rowIndexOfSwitchYear].findIndex((element) => {
        const year = parseInt(element.fiscalYearMonth.split("-")[0]);
        if (year !== selectedFiscalYearSetting && rowIndexOfSwitchYear !== 0) {
          return true;
        } else {
          return false;
        }
      });
      return index === 0 ? true : false;
    } else {
      return false;
    }
  }, [rowIndexOfSwitchYear]);

  // 月度ごとの締日の日付を4行3列で作成
  const fiscalEndDateArray: (number | null | undefined)[][] | null = useMemo(() => {
    if (!splitMonthsArrayForFB) return null;
    return splitMonthsArrayForFB.map((row) => {
      return row.map((col) => {
        if (!!col.monthlyDays.length) {
          const value = col.monthlyDays[col.monthlyDays.length - 1].date?.split("-")[2] ?? null;
          return value ? Number(value) : null;
        }
      });
    });
  }, [splitMonthsArrayForFB]);

  console.log(
    "BusinessCalendarコンポーネント再レンダリング",
    "annualMonthlyClosingDays",
    annualMonthlyClosingDays,
    "splitMonthsArrayForCB",
    splitMonthsArrayForCB,
    "splitMonthsArrayForFB",
    splitMonthsArrayForFB,
    "rowIndexOfSwitchYear",
    rowIndexOfSwitchYear,
    "isSwitchYear",
    isSwitchYear,
    "fiscalEndDateArray",
    fiscalEndDateArray
  );
  // -------------------------- ✅useQuery✅ --------------------------

  // -------------------------- 🌟エディットモード終了🌟 --------------------------
  const handleFinishEdit = () => setIsEditMode([]);
  // -------------------------- ✅エディットモード終了✅ --------------------------
  // -------------------------- 🌟全てのフィールドを編集モードに変更🌟 --------------------------
  const handleAllEdit = () => {
    if (hoveredItemPos) handleCloseTooltip();
    if (openPopupMenu) handleClosePopupMenu();

    if (isEditMode.length === 0) {
      const allEdit = [
        "quotation_notes",
        "footnotes",
        "deadline",
        "delivery_place",
        "payment_terms",
        "expiration_date",
        "assigned_department_name",
        "assigned_office_name",
        "lease_period",
      ];
      setIsEditMode(allEdit);
    } else {
      handleFinishEdit();
    }
    if (hoveredItemPos) handleCloseTooltip();
  };
  // -------------------------- ✅全てのフィールドを編集モードに変更✅ --------------------------

  // -------------------------- 🌟pdfのスケールリサイズイベント🌟 --------------------------
  const [scalePdf, setScalePdf] = useState(window.innerHeight / 788);
  const getScale = (currentHeight: number) => {
    if (currentHeight > 788) {
      return currentHeight / 788;
    } else {
      return 1;
    }
  };
  useEffect(() => {
    const handleResize = () => {
      setScalePdf(getScale(window.innerHeight));
      // if (!pdfTargetRef.current) return;
      // pdfTargetRef.current.style.transform = `scale(${getScale(window.innerHeight)})`;
    };

    window.addEventListener("resize", handleResize);

    // コンポーネントのアンマウント時にイベントリスナーを削除
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // -------------------------- 🌟モーダルを閉じる関数🌟 --------------------------
  const handleCloseSettingModal = () => {
    if (pdfURL) {
      URL.revokeObjectURL(pdfURL);
    }
    setIsOpenBusinessCalendarSettingModal(false);
    if (hoveredItemPos) handleCloseTooltip();
  };
  // -------------------------- ✅モーダルを閉じる関数✅ --------------------------

  // -------------------------- 🌟セッティングメニュー開閉🌟 --------------------------
  const handleOpenSettings = () => {
    setIsOpenSettings(true);
    if (hoveredItemPos) handleCloseTooltip();
    if (openPopupMenu) handleClosePopupMenu();
  };
  const handleCloseSettings = () => {
    // セッティングメニューを閉じる
    setIsOpenSettings(false);
  };
  // -------------------------- ✅セッティングメニュー開閉✅ --------------------------

  // -------------------------- 🌟PDFファイルのダウンロード html => pdf🌟 --------------------------
  // pdfファイル名の取得関数
  const getPdfFileName = () => {
    const title = `${selectedFiscalYearSetting}年度_カレンダー`;
    // const currentDate = format(new Date(), "yyMMddHHmmss");
    const fileName = `${title}.pdf`;
    return fileName;
  };

  const handleSaveImageToPdf = async () => {
    if (!pdfTargetRef.current) return alert("pdfデータの取得に失敗しました。");

    if (hoveredItemPos) handleCloseTooltip();
    if (openPopupMenu) handleClosePopupMenu();

    console.log("pdfTargetRef.current", pdfTargetRef.current);

    setIsLoading(true);

    try {
      // スケールを1に戻す
      // if (scalePdf > 1) {
      //   pdfTargetRef.current.style.transform = `scale(1)`;
      // }
      if (scalePdf > 1) {
        pdfTargetRef.current.style.transform = `scale(1)`;
      }

      // 3. jsPDFインスタンスjの生成
      const doc = new jsPDF({
        orientation: "p", // p:縦向き, l:横向き
        unit: "mm", // mm: ミリメートル, 他には, cm,in,px,pc,em,ex, pxで指定する場合、optionのhotfixesを指定
        // format: "a4", // PDFのページフォーマット a4:A4サイズ
        format: "a7", // PDFのページフォーマット a4:A4サイズ
      });
      // const pdf = new jsPDF()

      // DOM要素をpng画像に変換
      // const image = await toPng(pdfTargetRef.current); // 成功
      const image = await toPng(pdfTargetRef.current, {
        quality: 1.0, // 0から1の範囲で品質を指定
        pixelRatio: 2, // 画像のピクセル密度を指定
      });

      // 保険で画像URLのリソース解放できなかった時のためのアンマウント時にURLリソース解放用に画像URLをstateに格納
      setImageURL(image);

      // イメージをPDFに追加*2 元々の素材となるDOM要素のレイアウト比を保った状態で画像に変換 もし素材の縦幅がA4の縦横比よりも短い場合は変換後のPDFの下側が空白となる。
      // doc.addImage(image, "PNG", 0, 0, 210, 0, "", "FAST"); // 成功
      // 第八引数の圧縮レベルは下記3つ選択 高品質を保ちたい場合はNONEかFAST、メールなどの送信でのサイズ容量を少なくする場合はSLOWを指定
      // ・FAST: 低圧縮 => 143KB
      // ・SLOW: 高圧縮 => 161KB
      // ・NONE: 圧縮なし => 6MB

      /* A4サイズは210mm * 297mm で 縦横比は1:1.41 */
      // doc.addImage(image, "PNG", 0, 0, 210, 0, "", compressionRatio); // デフォルトの圧縮率はFASTの中間
      /* A7サイズは74mm * 105mm で 縦横比は1:1.41 */
      doc.addImage(image, "PNG", 0, 0, 105, 0, "", compressionRatio); // デフォルトの圧縮率はFASTの中間

      // 5. PDFを保存
      doc.save(getPdfFileName());

      URL.revokeObjectURL(image); // 画像URLを解放
      setImageURL(null);
    } catch (error: any) {
      console.error("PDFの取得に失敗しました: ", error);
      toast.error("PDFの取得に失敗しました...🙇‍♀️");
    }

    // スケールを現在のwindowのサイズに戻す
    if (scalePdf > 1) {
      pdfTargetRef.current.style.transform = `scale(${scalePdf})`;
    }

    setIsLoading(false);
  };
  // -------------------------- ✅PDFファイルのダウンロード html => pdf✅ --------------------------

  // -------------------------- 🌟プリントアウト関数🌟 --------------------------

  const handlePrint = async () => {
    if (hoveredItemPos) handleCloseTooltip();
    if (openPopupMenu) handleClosePopupMenu();

    if (!pdfTargetRef.current) return alert("pdfデータの取得に失敗しました。");

    console.log("pdfTargetRef.current", pdfTargetRef.current);

    setIsLoading(true);

    try {
      // スケールを1に戻す
      if (scalePdf > 1) {
        pdfTargetRef.current.style.transform = `scale(1)`;
      }

      // DOM要素をpng画像に変換
      // const image = await toPng(pdfTargetRef.current); // 成功
      const image = await toPng(pdfTargetRef.current, {
        quality: 1.0, // 0から1の範囲で品質を指定
        pixelRatio: 2, // 画像のピクセル密度を指定
      });

      // 保険で画像URLのリソース解放できなかった時のためのアンマウント時にURLリソース解放用に画像URLをstateに格納
      setImageURL(image);

      // iframeにHTMLコンテンツを動的に生成して挿入する
      // iframeを生成
      let iframe = document.createElement("iframe");
      iframe.style.visibility = "hidden"; // iframeを画面に表示しない
      iframe.style.padding = "0";
      iframe.style.margin = "0";
      document.body.appendChild(iframe);

      // iframeのdocumentにアクセス
      let iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;

      if (!iframeDoc) throw new Error("印刷に失敗しました");

      /* A4サイズは210mm * 297mm で 縦横比は1:1.41 */
      /* A7サイズは74mm * 105mm で 縦横比は1:1.41 */

      // HTMLコンテンツを生成してiframeに挿入
      iframeDoc.open();
      iframeDoc.write(
        `<html><head><style>@media print { html, body { margin: 0; padding: 0; box-sizing: border-box; width: 100%; height: 100%; }}</style></head><body style="background-color: red; padding: 0; margin: 0; border: 0; position: relative; width: 794px; height: 1123px; position: relative; display: flex; align-items: center; justify-content: center;"><img src="${image}" style="background-color: white; padding: 0; margin: 0; object-fit: cover; width: 100%; height: 100%;"></body></html>`
      );
      iframeDoc.close();

      // iframeのコンテンツが完全に読み込まれた後に印刷プレビューを開く
      iframe.onload = function () {
        if (iframe.contentWindow) {
          iframe.contentWindow.print();
        }
        URL.revokeObjectURL(image); // 画像URLを解放
        document.body.removeChild(iframe); // 印刷後、iframeを削除
        setImageURL(null);
      };
    } catch (error: any) {
      console.error("エラー: ", error);
      toast.error("印刷に失敗しました...🙇‍♀️");
    }

    // スケールを現在のwindowのサイズに戻す
    if (scalePdf > 1) {
      pdfTargetRef.current.style.transform = `scale(${scalePdf})`;
    }

    setIsLoading(false);
  };

  // 画像のstyle属性でwidthとheightを指定していますが、これをA4サイズのピクセルまたはmm単位で具体的に指定することで、より正確にサイズを制御できます。A4サイズのピクセル数は解像度によって異なりますが、一般的には96DPIの場合、約794x1123ピクセル（約210mm x 297mm）です。
  // 画像のDPI（ドット・パー・インチ）を調整して、印刷時のサイズを変更することも検討してください。HTMLやCSSで直接DPIを指定することはできませんが、画像を生成する際にDPIを考慮することで、印刷時のサイズ感を調整できます。
  // -------------------------- ✅プリントアウト関数✅ --------------------------

  // 定休日の日付リストを生成する関数
  const generateClosedDaysList = (fiscalYearStartDate: Date | null, closedDaysIndexes: number[]) => {
    if (!userProfileState) return;
    if (!fiscalYearStartDate) return;
    console.time("generateClosedDaysList関数");
    // 期首の日付を起点としたwhileループ用のDateオブジェクトを作成
    let currentDateForLoop = fiscalYearStartDate;
    // 期首のちょうど1年後の次年度、来期の期首用のDateオブジェクトを作成
    const nextFiscalYearStartDate = new Date(fiscalYearStartDate);
    nextFiscalYearStartDate.setFullYear(nextFiscalYearStartDate.getFullYear() + 1);

    // customer_business_calendarsテーブルのバルクインサート用の定休日日付リスト
    const closedDays = [];

    // 来期の期首未満(期末まで)の定休日となる日付を変数に格納
    while (currentDateForLoop.getTime() < nextFiscalYearStartDate.getTime()) {
      const dayOfWeek = currentDateForLoop.getDay();
      // 現在の日付の曜日が定休日インデックスリストの曜日に含まれていれば定休日日付リストに格納
      if (closedDaysIndexes.includes(dayOfWeek)) {
        closedDays.push({
          // customer_id: userProfileState.company_id,
          // date: currentDateForLoop.toISOString().split("T")[0], // 時間情報を除いた日付情報のみセット
          date: formatDateToYYYYMMDD(currentDateForLoop, true), // 時間情報を除いた日付情報のみセット DATE型で挿入するので一桁台の月、日付は0を左に詰めるためtrueを第二引数に渡す
          day_of_week: dayOfWeek,
          // status: "closed",
          // working_hours: 0,
        });
      }
      currentDateForLoop.setDate(currentDateForLoop.getDate() + 1); // 次の日に進める
    }

    console.timeEnd("generateClosedDaysList関数");
    return closedDays;
  };
  // ===================== 🌟営業カレンダーに定休日を反映🌟 =====================
  // 選択した会計年度の営業カレンダーに定休日反映確認モーダル
  const [showConfirmApplyClosingDayModal, setShowConfirmApplyClosingDayModal] = useState<string | null>(null);
  const [isLoadingApply, setIsLoadingApply] = useState(false);

  const handleApplyClosingDaysCalendar = async () => {
    if (isLoadingApply) return;
    if (!userProfileState?.customer_fiscal_end_month) return alert("先に決算日を登録してください。");
    if (!fiscalYearStartDate) return alert("先に決算日を登録してください。");
    if (!userProfileState?.customer_closing_days) return alert("定休日が設定されていません。");
    if (!selectedFiscalYearSetting) return alert("定休日を反映する会計年度を選択してください。");

    setIsLoadingApply(true);

    // companiesテーブルのcustomer_closing_daysフィールドに定休日の配列をINSERTして、
    // customer_business_calendarsテーブル現在の会計年度 １年間INSERTした後の1年後に再度自動的にINSERTするようにスケジュールが必要
    if (showConfirmApplyClosingDayModal === "Insert") {
      // 決算日の翌日の期首のDateオブジェクトを生成
      const fiscalYearStartDate = calculateFiscalYearStart(userProfileState.customer_fiscal_end_month);
      // 期首から来期の期首の前日までの定休日となる日付リストを生成(バルクインサート用) DATE[]
      const closedDaysArrayForBulkInsert = generateClosedDaysList(
        fiscalYearStartDate,
        userProfileState?.customer_closing_days
      );

      // 1. customer_business_calendarsテーブルへの定休日リストをバルクインサート
      // 2. companiesテーブルのcustomer_closing_daysフィールドをUPDATE
      try {
        const insertPayload = {
          _customer_id: userProfileState.company_id,
          _closed_days: closedDaysArrayForBulkInsert, // 営業カレンダーテーブル用配列
          // _closing_days: editedClosingDays, // companiesのcustomer_closing_daysフィールド用配列
        };
        console.log("🔥バルクインサート実行 insertPayload", insertPayload);
        // 1と2を一つのFUNCTIONで実行
        const { error } = await supabase.rpc("bulk_insert_closing_days", insertPayload);

        if (error) throw error;

        console.log("✅営業カレンダーのバルクインサートと会社テーブルの定休日リストのUPDATE成功");

        // 先に営業カレンダーのFB, CB共にisReadyをfalseにして再フェッチを防ぐ
        isReadyCalendarForFBRef.current = false;
        isReadyCalendarForCBRef.current = false;

        // 営業カレンダーのuseQueryのキャッシュをinvalidate
        await queryClient.invalidateQueries({ queryKey: ["annual_fiscal_month_closing_days"] });

        // ローカルストレージの年度別定休日ステータスを更新する
        if (statusAnnualClosingDaysArray) {
          const newArray = [...statusAnnualClosingDaysArray];
          const newClosingDays = userProfileState.customer_closing_days;
          const newStatusClosingDaysObj = {
            fiscal_year: selectedFiscalYearSetting,
            applied_closing_days: newClosingDays,
            updated_at: Date.now(),
          } as StatusClosingDays;
          const replaceAtIndex = newArray.findIndex((obj) => obj.fiscal_year === selectedFiscalYearSetting);
          if (replaceAtIndex !== -1) {
            // 置き換えるオブジェクトが見つかった場合のみ実行
            newArray.splice(replaceAtIndex, 1, newStatusClosingDaysObj);
            // ローカルストレージとローカルstateを更新
            localStorage.setItem("status_annual_closing_days", JSON.stringify(newArray));
            setStatusAnnualClosingDaysArray(newArray);
          }
        }
      } catch (error: any) {
        console.error("Bulk create エラー: ", error);
        toast.error("定休日の追加に失敗しました...🙇‍♀️");
      }
    }
    // Update
    else {
    }
    // setEditedClosingDays([]);
    // setShowConfirmApplyClosingDayModal(null);
    setIsLoadingApply(false);
  };
  // ===================== ✅定休日のUPSERT✅ =====================

  // -------------------------- 🌟インラインスタイル関連🌟 --------------------------
  // エディットモードの時には「閉じる」と「終了」ボタン以外は非表示にするstyle
  const isEditingHidden = { ...(isEditMode.length > 0 && { display: "none" }) };
  // -------------------------- ✅インラインスタイル関連✅ --------------------------

  // -------------------------- 🌟ツールチップ🌟 --------------------------
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
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
    setHoveredItemPos(null);
  };
  // -------------------------- ✅ツールチップ✅ --------------------------

  // -------------------------- 🌟ポップアップメッセージ🌟 --------------------------
  const alertPopupRef = useRef<HTMLDivElement | null>(null);
  const hideTimeoutIdRef = useRef<number | null>(null);

  // 文字数制限を超えた際にポップアップアラートメッセージを表示する
  const showAlertPopup = (type: "length" | "lines" | "both") => {
    const alertPopup = alertPopupRef.current;
    if (!alertPopup) return;

    // 表示するメッセージを格納する変数
    let message = "";
    switch (type) {
      case "length":
        message = "文字数制限を超えています";
        break;
      case "lines":
        message = "行数制限を超えています";
        break;
      case "both":
        message = "文字数・行数制限を超えています";
        break;
      default:
        message = "制限を超えています"; // デフォルトのメッセージ
        break;
    }

    // 既存のタイマーをクリアする
    if (hideTimeoutIdRef.current !== null) {
      clearTimeout(hideTimeoutIdRef.current); // 既存の非表示タイマーをキャンセル
      hideTimeoutIdRef.current = null;
    }

    // ポップアップの内容を更新
    alertPopup.innerHTML = `<span>${message}</span>`; // innerHTMLを使用してメッセージを設定

    // ポップアップを即時表示するためのスタイルを設定
    alertPopup.style.display = "flex"; // ポップアップを表示
    alertPopup.style.animation = "popupShow 0.1s ease forwards"; // 表示アニメーション

    // 3秒後に非表示アニメーションを適用
    // 新たに非表示にするためのタイマーを設定(windowオブジェクトのsetTimeoutの結果はnumber型 clearTimeoutで使用)
    hideTimeoutIdRef.current = window.setTimeout(() => {
      alertPopup.style.animation = "popupHide 0.2s ease forwards"; // 非表示アニメーション

      // アニメーションが完了した後に要素を非表示にする
      setTimeout(() => {
        alertPopup.style.display = "none";
      }, 200); // 非表示アニメーションの時間に合わせる

      // タイマーIDをリセット
      hideTimeoutIdRef.current = null;
    }, 3000); // 表示される時間
  };

  // コンポーネントのクリーンアップで既存のタイマーがあればクリアする
  useEffect(() => {
    return () => {
      // タイマーのクリア
      if (hideTimeoutIdRef.current !== null) {
        clearTimeout(hideTimeoutIdRef.current);
      }
    };
  }, []);
  // -------------------------- ✅ポップアップメッセージ✅ --------------------------

  // -------------------------- 🌟ポップアップメニュー🌟 --------------------------
  const [openPopupMenu, setOpenPopupMenu] = useState<{
    x?: number;
    y: number;
    title: string;
    displayX?: string;
    maxWidth?: number;
  } | null>(null);
  const mappingPopupTitle: { [key: string]: { [key: string]: string } } = {
    compressionRatio: { en: "Compression Ratio", ja: "解像度" },
    guide: { en: "Guide", ja: "使い方 Tips" },
    step: { en: "Step", ja: "カレンダー設定手順" },
    print: { en: "Print Tips", ja: "印刷Tips" },
    pdf: { en: "PDF Download", ja: "PDFダウンロード" },
    settings: { en: "Settings", ja: "各種設定メニュー" },
    edit: { en: "Edit Mode", ja: "編集モード" },
    applyClosingDays: { en: "Apply Closing Days", ja: "定休日一括設定" },
    displayFiscalYear: { en: "Display fiscal year", ja: "会計年度" },
  };
  type PopupMenuParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    title: string;
    displayX?: string;
    maxWidth?: number;
  };
  const handleOpenPopupMenu = ({ e, title, displayX, maxWidth }: PopupMenuParams) => {
    if (!displayX) {
      const { y, height } = e.currentTarget.getBoundingClientRect();
      setOpenPopupMenu({
        y: y - height / 2,
        title: title,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      // right: 見積書の右端から-18px, アイコンサイズ35px, ポップアップメニュー400px
      // const positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : -18;
      // const positionX = displayX === "right" ? 0 : -18;

      // モーダル外に配置した場合
      const positionX = displayX === "right" ? x + width + 9 : x - 9;
      console.log(
        "title",
        title,
        "displayX",
        displayX,
        "positionX",
        positionX,
        "x",
        x,
        "width",
        width,
        "y",
        y,
        "height",
        height
      );
      setOpenPopupMenu({
        x: positionX,
        // y: y - height / 2,
        y: y,
        // y: y + 18,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
      });
    }
  };
  const handleClosePopupMenu = () => {
    setOpenPopupMenu(null);
  };

  // -------------------------- ✅ポップアップメニュー✅ --------------------------

  // -------------------------- 🌟フォールバック🌟 --------------------------
  const FallbackBusinessCalendar = () => {
    return (
      <div className={`${styles.pdf} ${styles.loading}`} style={{ padding: "0px", backgroundColor: "#aaa" }}>
        <SkeletonLoadingLineCustom h="100%" w="100%" rounded="0px" />
      </div>
    );
  };
  // -------------------------- ✅フォールバック✅ --------------------------

  // ----------------- 🌟編集モードオーバーレイコンポーネント🌟 -----------------
  const EditModeOverlay = () => {
    return (
      <div
        className={`absolute left-[-50vw] top-[-50vh] z-[3500] h-[150vh] w-[150vw] bg-[#00000030]`}
        onClick={handleFinishEdit}
      ></div>
    );
  };
  // ----------------- ✅編集モードオーバーレイコンポーネント✅ -----------------
  // ----------------- 🌟編集モードオーバーレイコンポーネント🌟 -----------------
  const YearSection = ({ year }: { year: number }) => {
    return (
      <div className={`${styles.year_section} w-full bg-[aqua]/[0]`}>
        <div className={`flex h-full w-[1%] bg-[green]/[0]`}></div>
        {/* <div className={`flex h-full w-[13%] items-center bg-[red]/[0] text-[22px] font-bold leading-[22px]`}> */}
        <div className={`flex h-full w-[12%] items-center bg-[red]/[0] text-[20px] font-bold leading-[22px]`}>
          <span className={``}>{year}</span>
        </div>
        <div className={`flex h-full w-[86%] flex-col justify-end`}>
          <div className="h-[1px] w-full rounded-[6px] bg-[#37352f]"></div>
          <div className="h-[10px] w-full"></div>
        </div>
        <div className={`flex h-full w-[1%] bg-[green]/[0]`}></div>
      </div>
    );
  };

  const YearSectionDouble = ({ year, nextYear }: { year: number; nextYear: number }) => {
    return (
      <div className={`${styles.year_section} w-full bg-[aqua]/[0]`}>
        <div className={`flex h-full w-[1%] bg-[green]/[0]`}></div>
        <div
          className={`flex h-full w-[28%] items-center space-x-[2px] bg-[red]/[0] text-[22px] font-bold leading-[22px]`}
        >
          <span className={``}>{year}</span>
          {/* <span className={``}>-</span> */}
          <span className={`h-[2px] w-[10px] bg-[var(--color-text-title)]`}></span>
          <span className={``}>{nextYear}</span>
        </div>
        <div className={`flex h-full w-[72%] flex-col justify-end`}>
          <div className="h-[1px] w-full rounded-[6px] bg-[#37352f]"></div>
          <div className="h-[10px] w-full"></div>
        </div>
        <div className={`flex h-full w-[1%] bg-[green]/[0]`}></div>
      </div>
    );
  };
  const YearSectionBlank = () => {
    return (
      <div className={`${styles.year_section} w-full bg-[aqua]/[0]`}>
        <div className={`flex h-full w-[1%] bg-[green]/[0]`}></div>
        <div className={`flex h-full w-[12%] items-center bg-[red]/[0] text-[22px] font-bold leading-[22px]`}>
          <span className={``}></span>
        </div>
        <div className={`flex h-full w-[86%] flex-col justify-end`}>
          {/* <div className="h-[1px] w-full rounded-[6px] bg-[#37352f]"></div> */}
          <div className="h-[10px] w-full"></div>
        </div>
        <div className={`flex h-full w-[1%] bg-[green]/[0]`}></div>
      </div>
    );
  };
  // ----------------- ✅編集モードオーバーレイコンポーネント✅ -----------------

  // ----------------- 🌟営業稼働日数リスト🌟 -----------------
  const AnnualMonthlyWorkingDaysRow = () => {
    return (
      <>
        <div className={`flex h-full w-full items-center justify-between text-[11px] font-bold`}>
          <div className="h-full min-w-[9px] bg-[white]/[0.9]"></div>
          <div
            className={`flex h-full w-[24%] flex-col items-start justify-center bg-[yellow]/[0] pl-[6px] !text-[11px]`}
          >
            <div className={`flex h-[17px] w-full items-center`}>
              <div className={`flex min-w-[80px] items-center`}>
                <div className={`flex-between min-w-[70px]`}>
                  {"営業稼働日".split("").map((letter, index) => (
                    <span key={`summary_title_first` + index.toString()}>{letter}</span>
                  ))}
                </div>
              </div>
              <span className="text-[11px]">{annualWorkingDaysCount}</span>
            </div>
            <div className={`flex h-[17px] w-full items-center`}>
              <div className={`flex min-w-[80px] items-center`}>
                <div className={`flex-between min-w-[70px]`}>
                  {"休日".split("").map((letter, index) => (
                    <span key={`summary_title_second` + index.toString()}>{letter}</span>
                  ))}
                </div>
              </div>
              <span className="text-[11px]">{annualClosingDaysCount}</span>
            </div>
          </div>

          <div className={`h-full min-w-[4%]`}></div>

          {/* 月度別 gridコンテナ */}
          <div
            role="grid"
            // className={`grid h-full w-[77%] rounded-[3px]`}
            className={`grid h-[38px] w-[72%] rounded-[3px]`}
            // className={`grid w-[72%] rounded-[3px] h-[34px]`}
            // style={{ gridTemplateRows: `repeat(2, 1fr)`, border: `2px solid var(--color-border-black)` }}
            style={{ gridTemplateRows: `repeat(2, 1fr)`, border: `2px solid #37352f` }}
          >
            <div
              role="row"
              // className={`grid h-full w-full items-center bg-[var(--color-bg-sub)]`}
              className={`grid h-[17px] w-full items-center`}
              style={{
                gridRowStart: 1,
                gridTemplateColumns: `99px repeat(12, 1fr)`,
                borderBottom: `1px solid #37352f`,
              }}
            >
              {Array(13)
                .fill(null)
                .map((_, index) => {
                  let displayValue = index.toString();
                  if (index !== 0) {
                    if (
                      fiscalYearStartDate &&
                      calendarForCalendarBase &&
                      calendarForCalendarBase.completeAnnualFiscalCalendar?.length > 0
                    ) {
                      displayValue =
                        calendarForCalendarBase.completeAnnualFiscalCalendar[index - 1].fiscalYearMonth.split("-")[1];
                    }
                  }
                  return (
                    <div
                      role="gridcell"
                      key={index.toString() + `calendar_row1`}
                      className={`h-full ${index === 0 ? `flex items-center justify-between px-[3px]` : `flex-center`}`}
                      style={{
                        gridColumnStart: index + 1,
                        ...(index !== 12 && { borderRight: `1px solid #37352f` }),
                      }}
                    >
                      {index === 0 &&
                        "月度"
                          .split("")
                          .map((letter, index) => <span key={`fiscal_month` + index.toString()}>{letter}</span>)}
                      {index !== 0 && <span>{displayValue}</span>}
                    </div>
                  );
                })}
            </div>
            <div
              role="row"
              className={`grid h-[17px] w-full items-center`}
              style={{ gridRowStart: 2, gridTemplateColumns: `99px repeat(12, 1fr)` }}
            >
              {Array(13)
                .fill(null)
                .map((_, index) => {
                  let workingDays = index;
                  let monthDaysCount = 0;
                  if (index !== 0) {
                    if (calendarForCalendarBase) {
                      monthDaysCount =
                        calendarForCalendarBase.completeAnnualFiscalCalendar[index - 1].monthlyDays.length;
                    }
                    if (calendarForFiscalBase) {
                      workingDays =
                        calendarForFiscalBase.completeAnnualFiscalCalendar[index - 1].monthlyWorkingDaysCount;
                    } else {
                      workingDays = monthDaysCount;
                    }
                  }
                  return (
                    <div
                      role="gridcell"
                      key={index.toString() + `calendar_row2`}
                      className={`h-full ${index === 0 ? `flex items-center justify-between px-[3px]` : `flex-center`}`}
                      style={{
                        gridColumnStart: index + 1,
                        ...(index !== 12 && { borderRight: `1px solid #37352f` }),
                      }}
                    >
                      {index === 0 &&
                        "営業稼働日数"
                          .split("")
                          .map((letter, index) => <span key={`fiscal_month` + index.toString()}>{letter}</span>)}
                      {!!workingDays && index !== 0 && <span className="">{workingDays}</span>}
                      {!workingDays && index !== 0 && <span className="">-</span>}
                    </div>
                  );
                })}
            </div>
          </div>
          <div className="h-full min-w-[6px] bg-[white]/[0.9]"></div>
        </div>
      </>
    );
  };
  // ----------------- ✅営業稼働日数リスト✅ -----------------
  // ----------------- テスト -----------------
  const TestCalendar = () => {
    return (
      <>
        {Array(1)
          .fill(null)
          .map((_, rowIndex) => {
            const monthlyRowKey = "monthly_row" + rowIndex.toString();

            if (!splitMonthsArrayForCB) return;

            let monthRowIndex = rowIndex;

            return (
              <div key={monthlyRowKey} className={`${styles.monthly_row_section} w-full bg-[pink]/[0]`}>
                {Array(3)
                  .fill(null)
                  .map((monthObj, colIndex) => {
                    const monthKey = "month" + rowIndex.toString() + colIndex.toString();
                    const getRow = (rowIndex: number): number => {
                      if (rowIndex === 0) return 1;
                      if (rowIndex === 1) return 4;
                      if (rowIndex === 2) return 7;
                      // if (rowIndex === 3) return 10;
                      if (rowIndex === 4) return 10;
                      return rowIndex;
                    };
                    const titleValue = getRow(rowIndex) + colIndex;
                    return (
                      <div key={monthKey} className={`${styles.month} w-1/3 bg-[white]/[0]`}>
                        {/* <div className={`h-full w-[16%] bg-[red]/[0.1] ${styles.month_title}`}> */}
                        <div className={`h-full w-[22%] bg-[red]/[0] ${styles.month_title}`}>
                          <span>{titleValue}</span>
                        </div>
                        <div
                          role="grid"
                          // className={`h-full w-[84%] bg-[yellow]/[0] ${styles.month_grid_container}`}
                          className={`h-full w-[78%] bg-[yellow]/[0] ${styles.month_grid_container}`}
                        >
                          <div role="columnheader" className={`${styles.month_row}`}>
                            {sortedDaysPlaceholder.map((day, monthColHeaderIndex) => {
                              const monthColumnHeaderIndexKey =
                                "month_grid_columnheader_day" +
                                rowIndex.toString() +
                                colIndex.toString() +
                                monthColHeaderIndex.toString();
                              const dayNames = language === "ja" ? dayNamesJa : dayNamesEn;
                              const dayName = dayNames[day % 7];
                              let isClosed = false;
                              return (
                                <div
                                  role="gridcell"
                                  key={monthColumnHeaderIndexKey}
                                  className={`${styles.month_grid_cell} ${styles.day_header} ${
                                    isClosed ? `${styles.is_closed}` : ``
                                  } flex-center`}
                                >
                                  <span>{dayName}</span>
                                </div>
                              );
                            })}
                          </div>
                          <div role="grid" className={`${styles.month_date_container}`}>
                            {Array(31)
                              .fill(null)
                              .map((dateObj, monthCellIndex) => {
                                const monthCellIndexKey =
                                  "month_grid_cell_date" +
                                  rowIndex.toString() +
                                  colIndex.toString() +
                                  monthCellIndex.toString();
                                let displayValue;
                                if (!displayValue) displayValue = monthCellIndex + 1;
                                if (typeof displayValue === "number" && displayValue > 31) displayValue = null;
                                // 締日
                                let isFiscalEndDay = false;
                                // 休日
                                let isClosed = false;

                                return (
                                  <div
                                    role="gridcell"
                                    key={monthCellIndexKey}
                                    className={`${styles.month_grid_cell} ${
                                      displayValue === null ? `` : `${styles.date}`
                                    } ${isClosed ? `${styles.is_closed}` : ``} flex-center`}
                                    style={{
                                      ...(displayValue === null && {
                                        cursor: "default",
                                      }),
                                    }}
                                  >
                                    <span>{displayValue}</span>
                                  </div>
                                );
                              })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </>
    );
  };
  // ----------------- テスト -----------------
  return (
    <>
      {/* オーバーレイ z-index: 1000; */}
      <div className={`${styles.overlay} fade03`} onClick={handleCloseSettingModal}></div>
      {/* アラートポップアップ */}
      <div ref={alertPopupRef} className={`flex-center alert_popup h-[50px] w-[300px] bg-[#555] text-[#fff]`}></div>
      {/* アラートポップアップ ここまで */}
      {/* ------------------------プレビューモーダルエリア------------------------ */}
      <div ref={previewModalTwinAreaRef} className={`${styles.preview_modal_area_twin} space-x-[6vw]`}>
        {/* <div className={`${styles.preview_modal}`}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}>
              <PDFComponent isSample={true} />
            </Suspense>
          </ErrorBoundary>
        </div> */}
        <div className={`${styles.preview_modal}`}>
          {/* ----------------------------- 🌟カレンダーPDFコンポーネント🌟 ----------------------------- */}
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<FallbackBusinessCalendar />}>
              <div ref={pdfTargetRef} className={`${styles.pdf} quotation`} style={{ transform: `scale(${scalePdf})` }}>
                {/* ---------------- 左マージン ---------------- */}
                <div className={`${styles.left_margin}`}></div>
                {/* ---------------- 左マージン ---------------- */}
                {/* ---------------- 真ん中 ---------------- */}
                <div className={`${styles.pdf_main_container} flex h-full w-full flex-col`}>
                  {/* エディットモードオーバーレイ z-[3500] */}
                  {isEditMode.length > 0 && <EditModeOverlay />}

                  <div className={`${styles.top_margin} w-full bg-[red]/[0]`}></div>

                  {/* {isSwitchYear && <YearSection year={2023} />} */}
                  {/* 会計年度が2年に跨る場合 */}
                  {isSwitchYear && <YearSection year={selectedFiscalYearSetting} />}
                  {/* 会計年度が単一の年のみ */}
                  {!isSwitchYear && (
                    <YearSectionDouble year={selectedFiscalYearSetting} nextYear={selectedFiscalYearSetting + 1} />
                  )}

                  {/* <MonthlyRow monthlyRowKey="monthly_row_first" /> */}

                  {/* -------- 12ヶ月分の4行 + 年度区切り行(2年に跨がれば) -------- */}
                  {Array(5)
                    .fill(null)
                    .map((_, rowIndex) => {
                      const monthlyRowKey = "monthly_row" + rowIndex.toString();

                      if (!splitMonthsArrayForCB) return;

                      let monthRowIndex = rowIndex;

                      if (isSwitchYear && rowIndex === rowIndexOfSwitchYear) {
                        return <YearSection year={selectedFiscalYearSetting + 1} key={monthlyRowKey} />;
                      }
                      if (isSwitchYear && rowIndexOfSwitchYear && rowIndex > rowIndexOfSwitchYear) {
                        monthRowIndex -= 1;
                      }

                      // console.log(
                      //   "isSwitchYear",
                      //   isSwitchYear,
                      //   "rowIndex",
                      //   rowIndex,
                      //   "monthRowIndex",
                      //   monthRowIndex,
                      //   "splitMonthsArrayForCB[monthRowIndex]",
                      //   splitMonthsArrayForCB[monthRowIndex]
                      // );

                      {
                        /* -------- ３ヶ月分の１行 -------- */
                      }
                      return (
                        <div key={monthlyRowKey} className={`${styles.monthly_row_section} w-full bg-[pink]/[0]`}>
                          {/* {Array(3)
                            .fill(null) */}
                          {splitMonthsArrayForCB[monthRowIndex].map((monthObj, colIndex) => {
                            const monthKey = "month" + rowIndex.toString() + colIndex.toString();
                            // const getRow = (rowIndex: number): number => {
                            //   if (rowIndex === 0) return 1;
                            //   if (rowIndex === 1) return 4;
                            //   if (rowIndex === 2) return 7;
                            //   // if (rowIndex === 3) return 10;
                            //   if (rowIndex === 4) return 10;
                            //   return rowIndex;
                            // };
                            // const titleValue = getRow(rowIndex) + colIndex;
                            const titleValue = monthObj.fiscalYearMonth.split("-")[1];
                            const daysArray = monthObj.monthlyDays;
                            if (!isValidNumber(daysArray[0].day_of_week)) return;
                            // 1日が月曜日以外なら曜日と一致するようにnullを先頭に追加する
                            // 0は7にソートしてるので曜日の始まりは1の月曜日
                            const formattedDaysArray = addNullMonthArray(daysArray[0].day_of_week!, daysArray);
                            // console.log(
                            //   "月🌠obj",
                            //   obj,
                            //   "titleValue",
                            //   titleValue,
                            //   "daysArray[0].day_of_week",
                            //   daysArray[0].day_of_week,
                            //   "formattedDaysArray",
                            //   formattedDaysArray
                            // );
                            return (
                              <div key={monthKey} className={`${styles.month} w-1/3 bg-[white]/[0]`}>
                                {/* <div className={`h-full w-[16%] bg-[red]/[0.1] ${styles.month_title}`}> */}
                                <div className={`h-full w-[22%] bg-[red]/[0] ${styles.month_title}`}>
                                  <span>{titleValue}</span>
                                </div>
                                <div
                                  role="grid"
                                  // className={`h-full w-[84%] bg-[yellow]/[0] ${styles.month_grid_container}`}
                                  className={`h-full w-[78%] bg-[yellow]/[0] ${styles.month_grid_container}`}
                                >
                                  <div role="columnheader" className={`${styles.month_row}`}>
                                    {sortedDaysPlaceholder.map((day, monthColHeaderIndex) => {
                                      const monthColumnHeaderIndexKey =
                                        "month_grid_columnheader_day" +
                                        rowIndex.toString() +
                                        colIndex.toString() +
                                        monthColHeaderIndex.toString();
                                      const dayNames = language === "ja" ? dayNamesJa : dayNamesEn;
                                      const dayName = dayNames[day % 7];
                                      // 休日
                                      // console.log(
                                      //   "userProfileState.customer_closing_days",
                                      //   userProfileState.customer_closing_days,
                                      //   "day",
                                      //   day,
                                      //   "day % 7",
                                      //   day % 7
                                      // );
                                      let isClosed = false;
                                      if (
                                        !!closingDaysArraySelectedYear.length &&
                                        closingDaysArraySelectedYear.includes(day % 7)
                                      ) {
                                        isClosed = true;
                                      }
                                      return (
                                        <div
                                          role="gridcell"
                                          key={monthColumnHeaderIndexKey}
                                          className={`${styles.month_grid_cell} ${styles.day_header} ${
                                            isClosed ? `${styles.is_closed}` : ``
                                          } flex-center`}
                                        >
                                          <span>{dayName}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  {/* -------- １ヶ月間の日付 -------- */}
                                  <div role="grid" className={`${styles.month_date_container}`}>
                                    {/* {Array(31)
                                      .fill(null) */}
                                    {formattedDaysArray.map((dateObj, monthCellIndex) => {
                                      const monthCellIndexKey =
                                        "month_grid_cell_date" +
                                        rowIndex.toString() +
                                        colIndex.toString() +
                                        monthCellIndex.toString();
                                      // let displayValue;
                                      // if (!displayValue) displayValue = monthCellIndex + 1;
                                      // if (typeof displayValue === "number" && displayValue > 31) displayValue = null;
                                      let displayValue = null;
                                      // 締日
                                      let isFiscalEndDay = false;
                                      // 休日
                                      let isClosed = false;
                                      if (dateObj !== null) {
                                        if (!dateObj?.date) return;

                                        const date = parseInt(dateObj.date.split("-")[2], 10);
                                        if (!isValidNumber(date)) return;

                                        displayValue = date;

                                        if (fiscalEndDateArray) {
                                          try {
                                            const fiscalEndDate = fiscalEndDateArray[monthRowIndex][colIndex];
                                            if (fiscalEndDate && displayValue && fiscalEndDate === displayValue) {
                                              isFiscalEndDay = true;
                                            }
                                          } catch (error: any) {
                                            console.log("❌締日取得エラー");
                                          }
                                        }
                                        if (isValidNumber(dateObj.day_of_week)) {
                                          // 休日 現在選択中の定休日の曜日リストに含まれているかどうか
                                          // isClosed = [0, 6].includes(dateObj.day_of_week!);
                                          // isClosed = closingDaysArraySelectedYear.includes(dateObj.day_of_week!);
                                          isClosed = dateObj.status! === "closed";
                                          // const isClosed = monthCellIndex % 5 === 0 || monthCellIndex % 6 === 0;
                                        }
                                      }

                                      return (
                                        <div
                                          role="gridcell"
                                          key={monthCellIndexKey}
                                          className={`${styles.month_grid_cell} ${
                                            displayValue === null ? `` : `${styles.date}`
                                          } ${isClosed ? `${styles.is_closed}` : ``} flex-center`}
                                          style={{
                                            ...(displayValue === null && {
                                              cursor: "default",
                                            }),
                                            // ...(isFiscalEndDay && {
                                            //   width: "18px",
                                            //   height: "18px",
                                            //   maxWidth: "18px",
                                            //   maxHeight: "18px",
                                            //   minWidth: "18px",
                                            //   minHeight: "18px",
                                            //   borderRadius: "3px",
                                            //   border: "1px solid #37352f",
                                            // }),
                                          }}
                                        >
                                          <span
                                          // style={{
                                          //   ...(isFiscalEndDay && {
                                          //     width: "18px",
                                          //     height: "18px",
                                          //     maxWidth: "18px",
                                          //     maxHeight: "18px",
                                          //     minWidth: "18px",
                                          //     minHeight: "18px",
                                          //     lineHeight: "18px",
                                          //     textAlign: "center",
                                          //     display: "inline-block",
                                          //   }),
                                          // }}
                                          >
                                            {displayValue}
                                          </span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}

                  <TestCalendar />

                  {!isSwitchYear && <YearSectionBlank />}

                  <div className={`${styles.summary_section} w-full bg-[yellow]/[0]`}>
                    {/* <div className={`min-h-[6px] w-full bg-[green]/[0.3]`}></div> */}
                    {/* <div className={`min-h-[3px] w-full bg-[red]/[0.3]`}></div> */}
                    {/* <div className={`flex-between min-h-[22px] w-full bg-[blue]/[0.3]`}>
                      <div className="h-full min-w-[9px] bg-[white]/[0]"></div>
                      <div className={`flex h-full w-[23%] items-center text-[16px] font-bold`}>
                        <span>2023年度</span>
                      </div>
                      <div className={`flex h-full w-[77%] items-center text-[12px]`}></div>
                      <div className="h-full min-w-[6px] bg-[white]/[0]"></div>
                    </div> */}
                    {/* <div className={`min-h-[1px] w-full bg-[red]/[0]`}></div> */}
                    <div className={`h-full w-full bg-[white]/[0.3]`}>
                      <AnnualMonthlyWorkingDaysRow />
                    </div>
                  </div>
                  <div className={`${styles.remarks_section} w-full bg-[green]/[0] font-bold`}>
                    {/* <div className={`min-h-[1px] w-full bg-[red]/[0.3]`}></div> */}
                    <div className={`flex-between h-[18px] w-full bg-[aqua]/[0]`}>
                      <div className="h-full min-w-[9px] bg-[white]/[0]"></div>
                      <div className={`flex h-full w-[24%] items-center pl-[6px] text-[10px]`}>
                        <div
                          className={`h-[14px] min-w-[14px] rounded-[3px] border-[1px] border-solid border-[#37352f]`}
                        ></div>
                        <div className={`h-full min-w-[2px]`}></div>
                        <span>決算上の締日</span>
                      </div>

                      <div className={`h-full min-w-[4%]`}></div>

                      <div className={`flex h-full w-[72%] items-center text-[10px] font-bold tracking-[1px]`}>
                        <p>※営業稼働日数は決算上の締日を基準とした稼働日数</p>
                      </div>
                      <div className="h-full min-w-[6px] bg-[white]/[0]"></div>
                    </div>
                    {/* <div className={`h-[18px] w-full bg-[yellow]/[0]`}></div> */}
                    {/* <div className={`min-h-[12px] w-full bg-[green]/[0.3]`}></div> */}
                  </div>
                  <div className={`${styles.bottom_margin} w-full bg-[red]/[0]`}></div>
                </div>
                {/* ---------------- 真ん中 ---------------- */}
                {/* ---------------- 右マージン ---------------- */}
                <div className={`${styles.right_margin}`}></div>
                {/* ---------------- 右マージン ---------------- */}
              </div>
            </Suspense>
          </ErrorBoundary>
          {/* ----------------------------- ✅カレンダーPDFコンポーネント✅ ----------------------------- */}

          {/* ------------------------ボタンエリア------------------------ */}

          {/* ------------------------ボタンエリア------------------------ */}
          {/* 閉じるボタン */}
          <div
            style={isEditingHidden}
            className={`flex-center transition-bg01 fixed right-[-56px] top-[5px] z-[3000] ${styles.btn}`}
            onMouseEnter={(e) =>
              handleOpenTooltip({
                e: e,
                display: "bottom",
                content: `閉じる`,
                // marginTop: 28,
                itemsPosition: "center",
              })
            }
            onMouseLeave={handleCloseTooltip}
            onClick={handleCloseSettingModal}
          >
            {/* <IoChevronForward className={`pointer-events-none text-[20px] text-[#fff]`} /> */}
            <IoClose className={`pointer-events-none text-[22px] text-[#fff]`} />
          </div>
          {/* ダウンロードボタン */}
          <div
            style={isEditingHidden}
            className={`flex-center transition-bg01 fixed right-[-56px] top-[55px] z-[3000] ${styles.btn}`}
            // onClick={handleDownloadPDF}
            onClick={handleSaveImageToPdf}
            onMouseEnter={(e) => {
              handleOpenPopupMenu({ e, title: "pdf", displayX: "right", maxWidth: 360 });
            }}
            onMouseLeave={() => {
              if (openPopupMenu) handleClosePopupMenu();
            }}
          >
            <FiDownload className={`pointer-events-none text-[19px] text-[#fff]`} />
            {/* <a href={pdfURL} download={`見積書.pdf`}>ダウンロード</a> */}
          </div>
          {/* 印刷ボタン */}
          <div
            style={isEditingHidden}
            className={`flex-center transition-bg01 fixed right-[-56px] top-[105px] z-[3000] ${styles.btn}`}
            onClick={handlePrint}
            onMouseEnter={(e) => {
              handleOpenPopupMenu({ e, title: "print", displayX: "right", maxWidth: 360 });
            }}
            onMouseLeave={() => {
              if (openPopupMenu) handleClosePopupMenu();
            }}
          >
            <MdLocalPrintshop className={`pointer-events-none text-[21px] text-[#fff]`} />
          </div>
          {/* 印刷ボタンここまで */}
          {/* セッティングメニューボタン */}
          <div
            style={isEditingHidden}
            className={`flex-center transition-bg01 fixed right-[-56px] top-[155px] z-[3000] ${styles.btn}`}
            onClick={handleOpenSettings}
            onMouseEnter={(e) => {
              handleOpenPopupMenu({ e, title: "settings", displayX: "right", maxWidth: 360 });
            }}
            onMouseLeave={() => {
              if (openPopupMenu) handleClosePopupMenu();
            }}
          >
            {/* <LuSettings className={`pointer-events-none text-[21px] text-[#fff]`} /> */}
            <LuSettings2 className={`pointer-events-none text-[21px] text-[#fff]`} />
          </div>
          {/* セッティングメニューボタンここまで */}
          {/* 編集ボタン */}
          <div
            className={`flex-center transition-bg01 fixed right-[-56px] z-[3000] ${styles.btn} ${
              isEditMode.length > 0 ? `top-[5px]` : `top-[205px]`
            }`}
            onClick={handleAllEdit}
            onMouseEnter={(e) => {
              if (isEditMode.length !== 0) return;
              handleOpenPopupMenu({ e, title: "edit", displayX: "right", maxWidth: 360 });
            }}
            onMouseLeave={() => {
              if (openPopupMenu) handleClosePopupMenu();
            }}
          >
            {isEditMode.length === 0 && <MdEdit className={`pointer-events-none text-[20px] text-[#fff]`} />}
            {isEditMode.length > 0 && <IoClose className={`pointer-events-none text-[22px] text-[#fff]`} />}
          </div>
          {/* 編集ボタンここまで */}
          {/* ---------------------- ボタンエリア ここまで ---------------------- */}

          {/* ---------------------- セッティングメニュー関連 ---------------------- */}
          {/* メニューオーバーレイ */}
          {isOpenSettings && <div className={`${styles.menu_overlay}`} onClick={handleCloseSettings}></div>}

          {/* ---------------------------- セッティングメニュー ---------------------------- */}
          <div
            className={`${styles.settings_menu} fixed right-[calc(100%+21px)] top-[0px] z-[3000] h-auto w-[330px] rounded-[6px]`}
          >
            <h3
              className={`flex w-full items-center space-x-[9px] px-[20px] pt-[20px] text-[15px] font-bold`}
              onMouseEnter={(e) => {
                if (
                  infoIconSettingMenuRef.current &&
                  infoIconSettingMenuRef.current.classList.contains(styles.animate_ping)
                ) {
                  infoIconSettingMenuRef.current.classList.remove(styles.animate_ping);
                }
                handleOpenPopupMenu({ e, title: "guide", displayX: "right" });
              }}
              onMouseLeave={() => {
                if (openPopupMenu) handleClosePopupMenu();
              }}
            >
              <span>営業カレンダー設定メニュー</span>
              <div className="flex-center relative h-[16px] w-[16px] rounded-full">
                <div
                  ref={infoIconSettingMenuRef}
                  className={`flex-center absolute left-0 top-0 h-[16px] w-[16px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                ></div>
                <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
              </div>
            </h3>

            <p className={`w-full px-[20px] pb-[10px] pt-[10px] text-[11px]`}>
              ここでは設定した定休日の適用や、会計年度ごとに自社独自の休業日、営業日をカスタマイズが可能です。
            </p>
            {/* <p className={`w-full px-[20px] pb-[12px] pt-[0px] text-[11px]`}>
              また、営業カレンダーをPDFでダウンロードや、印刷してメンバーに配布し、お客様との商談でスケジュールの擦り合わせなどにお使いください。
            </p> */}

            <hr className="min-h-[1px] w-full bg-[#999]" />

            {/* ---------------------------- メニューコンテンツエリア ---------------------------- */}
            <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
              <ul className={`flex h-full w-full flex-col`}>
                {/* ------------------------------------ */}
                <li
                  className={`${styles.list}`}
                  onMouseEnter={(e) => {
                    if (infoIconStepRef.current && infoIconStepRef.current.classList.contains(styles.animate_ping)) {
                      infoIconStepRef.current.classList.remove(styles.animate_ping);
                    }
                    handleOpenPopupMenu({ e, title: "step", displayX: "right" });
                  }}
                  onMouseLeave={handleClosePopupMenu}
                >
                  <div className="pointer-events-none flex min-w-[110px] items-center">
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>手順</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-end pr-[9px]">
                    <div className="flex-center relative h-[18px] w-[18px] rounded-full">
                      <div
                        ref={infoIconStepRef}
                        className={`flex-center absolute left-0 top-0 h-[18px] w-[18px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                      ></div>
                      <ImInfo className={`min-h-[18px] min-w-[18px] text-[var(--color-bg-brand-f)]`} />
                    </div>
                  </div>
                </li>
                {/* ------------------------------------ */}
                {/* ------------------------------------ */}
                <li className={`${styles.section_title} min-h-max w-full font-bold`}>
                  <div className="flex max-w-max flex-col">
                    <span>会計年度</span>
                    <div className={`${styles.underline} w-full`} />
                  </div>
                </li>
                <li
                  className={`${styles.list}`}
                  onMouseEnter={(e) => {
                    handleOpenPopupMenu({ e, title: "displayFiscalYear", displayX: "right" });
                  }}
                  onMouseLeave={handleClosePopupMenu}
                >
                  <div className="pointer-events-none flex min-w-[110px] items-center">
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>表示中</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  <select
                    className={`${styles.select_box} truncate`}
                    value={selectedFiscalYearSetting}
                    onChange={(e) => setSelectedFiscalYearSetting(Number(e.target.value))}
                  >
                    {optionsFiscalYear.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </li>
                {/* ------------------------------------ */}
                <li className={`${styles.list}`}>
                  <div className="pointer-events-none flex min-w-[110px] items-center">
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>定休日適用ステータス</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  {/* {isFrameInChargeStamp && hankoSrc && (
                    <ToggleSwitch state={isPrintInChargeStamp} dispatch={setIsPrintInChargeStamp} />
                  )} */}
                  {/* {isFrameInChargeStamp && !hankoSrc && <div>担当印なし</div>} */}
                  {!statusClosingDaysSelectedYear?.updated_at && <div>未適用</div>}
                  {isAvailableApplyClosingDays && statusClosingDaysSelectedYear?.updated_at && <div>適用可</div>}
                  {!isAvailableApplyClosingDays && statusClosingDaysSelectedYear?.updated_at && <div>適用不可</div>}
                </li>
                {/* ------------------------------------ */}
                {/* ------------------------------------ */}
                {/* <li className={`${styles.section_title} min-h-max w-full font-bold`}>
                  <div className="flex max-w-max flex-col">
                    <span>脚注</span>
                    <div className={`${styles.underline} w-full`} />
                  </div>
                </li> */}
                <li
                  className={`${styles.list}`}
                  onMouseEnter={(e) => {
                    handleOpenPopupMenu({ e, title: "applyClosingDays", displayX: "right" });
                  }}
                  onMouseLeave={handleClosePopupMenu}
                >
                  <div className="pointer-events-none flex min-w-[110px] items-center">
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>定休日一括設定</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  {(isAvailableApplyClosingDays || !statusClosingDaysSelectedYear?.updated_at) && (
                    <div
                      className={`transition-bg02 rounded-[8px] ${styles.edit_btn} ${styles.brand}`}
                      onClick={() => {
                        if (!selectedFiscalYearSetting) return alert("会計年度が選択されていません。");
                        if (!userProfileState.customer_closing_days) return alert("定休日が設定されていません。");
                        setShowConfirmApplyClosingDayModal("Insert");
                      }}
                    >
                      <span>適用</span>
                    </div>
                  )}
                </li>
                {/* ------------------------------------ */}
                {/* ------------------------------------ */}
                <li className={`${styles.section_title} min-h-max w-full font-bold`}>
                  <div className="flex max-w-max flex-col">
                    <span>PDF・印刷</span>
                    <div className={`${styles.underline} w-full`} />
                  </div>
                </li>
                <li
                  className={`${styles.list}`}
                  onMouseEnter={(e) => {
                    handleOpenPopupMenu({ e, title: "compressionRatio", displayX: "right" });
                  }}
                  onMouseLeave={handleClosePopupMenu}
                >
                  <div className="pointer-events-none flex min-w-[110px] items-center">
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>解像度</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  <select
                    className={`${styles.select_box} truncate`}
                    value={compressionRatio}
                    onChange={(e) => setCompressionRatio(e.target.value as CompressionRatio)}
                  >
                    {optionsCompressionRatio.map((value) => (
                      <option key={value} value={value}>
                        {getCompressionRatio(value, language)}
                      </option>
                    ))}
                  </select>
                </li>
                {/* ------------------------------------ */}
              </ul>
            </div>
          </div>
          {/* ---------------------- セッティングメニュー関連ここまで ---------------------- */}
        </div>
      </div>
      {/* 説明ポップアップ */}
      {openPopupMenu && (
        <div
          // className={`${styles.description_menu} shadow-all-md border-real-with-shadow fixed right-[-18px] z-[3500] flex min-h-max flex-col rounded-[6px]`}
          className={`${styles.description_menu} shadow-all-md border-real-with-shadow pointer-events-none fixed z-[3500] flex min-h-max flex-col rounded-[6px]`}
          style={{
            top: `${openPopupMenu.y}px`,
            ...(openPopupMenu?.displayX === "right" && {
              left: `${openPopupMenu.x}px`,
              maxWidth: `${openPopupMenu.maxWidth}px`,
            }),
            ...(openPopupMenu?.displayX === "left" && {
              right: `${openPopupMenu.x}px`,
              maxWidth: `${openPopupMenu.maxWidth}px`,
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
            {["guide", "step", "compressionRatio"].includes(openPopupMenu.title) &&
              mappingDescriptions[openPopupMenu.title].map((item, index) => (
                <li
                  key={item.title + index.toString()}
                  className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}
                >
                  <div className="flex min-w-max items-center space-x-[3px]">
                    {/* <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} /> */}
                    {/* <FaRegDotCircle className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} /> */}
                    <RxDot className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                    {/* <RxDotFilled className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} /> */}
                    <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                      {item.title}
                    </span>
                  </div>
                  <p className="select-none text-[12px]" style={{ whiteSpace: "pre-wrap" }}>
                    {item.content}
                  </p>
                </li>
              ))}
            {!["guide", "step", "compressionRatio"].includes(openPopupMenu.title) && (
              <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
                <p className="select-none whitespace-pre-wrap text-[12px]">
                  {openPopupMenu.title === "footnotes" &&
                    "見積書末尾に記載される脚注を自由に編集が可能です。デフォルトテキストで保存したデータはブラウザを更新しても内容が保存されるため、自チームで常に使用している脚注がある場合は一度設定することでそれ以降の入力不要となります。"}
                  {openPopupMenu.title === "applyClosingDays" &&
                    !!customerClosingDaysNameArray?.length &&
                    `定休日は「${customerClosingDaysNameArray.join(
                      ", "
                    )}」で登録されています。これらを${selectedFiscalYearSetting}年度のカレンダーに休日として一括で適用します。`}
                  {openPopupMenu.title === "applyClosingDays" &&
                    !customerClosingDaysNameArray?.length &&
                    `先に「会社・チーム」画面から定休日を登録しておくことで、選択中の会計年度のカレンダーに休日として一括で適用できます。`}
                  {openPopupMenu.title === "displayFiscalYear" &&
                    `選択中の会計年度の営業カレンダーを表示します。\n会計年度は2020年から当年度まで選択可能で、翌年度のカレンダーはお客様の決算日から現在の日付が3ヶ月を切ると表示、設定、編集が可能となります。`}
                </p>
              </li>
            )}
          </ul>
        </div>
      )}
      {/* 説明ポップアップ */}

      {/* ============================== 定休日の適用の確認モーダル ============================== */}
      {!!showConfirmApplyClosingDayModal && (
        <ConfirmationModal
          titleText={
            showConfirmApplyClosingDayModal === "Update"
              ? `定休日を変更してもよろしいですか？`
              : `定休日を年間休日に追加してもよろしいですか？`
          }
          sectionP1="設定した休日に基づいてお客様の年間の営業稼働日数が算出され、年度・半期・四半期・月度ごとの各プロセスの正確なデータ分析が可能になります。"
          sectionP2="※定休日は各会計年度で1ヶ月に1回のみ追加・変更可です。"
          cancelText="戻る"
          submitText={showConfirmApplyClosingDayModal === "Update" ? `変更する` : `追加する`}
          clickEventClose={() => {
            if (isLoadingApply) return;
            setShowConfirmApplyClosingDayModal(null);
          }}
          clickEventSubmit={() => {
            if (isLoadingApply) return;
            handleApplyClosingDaysCalendar();
          }}
          isLoadingState={isLoadingApply}
          buttonColor="brand"
          zIndexOverlay="5000"
          zIndex="5500"
        />
      )}
      {/* ============================== 定休日の適用の確認モーダルここまで ============================== */}
    </>
  );
};

export const BusinessCalendarModal = memo(BusinessCalendarModalMemo);
