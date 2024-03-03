import { Suspense, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { FaLongArrowAltRight, FaRegDotCircle } from "react-icons/fa";
import { RxDot, RxDotFilled } from "react-icons/rx";
import { calculateCurrentFiscalYear } from "@/utils/Helpers/calculateCurrentFiscalYear";
import { calculateCurrentFiscalYearEndDate } from "@/utils/Helpers/calcurateCurrentFiscalYearEndDate";
import { splitArrayIntoChunks } from "@/utils/Helpers/splitArrayIntoChunks";
import { CustomerBusinessCalendars, StatusClosingDays } from "@/types";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { formatDateToYYYYMMDD } from "@/utils/Helpers/formatDateLocalToYYYYMMDD";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmationModal } from "../ConfirmationModal/ConfirmationModal";
import { BsCheck2 } from "react-icons/bs";
import { GrPowerReset } from "react-icons/gr";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";

// 解像度
type CompressionRatio = "NONE" | "FAST" | "SLOW";
const optionsCompressionRatio: CompressionRatio[] = ["NONE", "SLOW", "FAST"];
const getCompressionRatio = (value: string, language: string) => {
  switch (value) {
    case "NONE":
      return language === "ja" ? `高解像度 / 重` : `High resolution`;
      break;
    case "SLOW":
      return language === "ja" ? `中解像度 / 中` : `Middle resolution`;
      break;
    case "FAST":
      return language === "ja" ? `低解像度 / 軽` : `Low resolution`;
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
// 印刷サイズ
type PrintSize = "A4" | "A5" | "A6" | "A7";
const optionsPrintSize: PrintSize[] = ["A4", "A5", "A6", "A7"];
// 印刷位置
type PrintPosition = "center" | "flex-start";
const optionsPrintPosition: PrintPosition[] = ["center", "flex-start"];
const getPrintPositionName = (value: string, language: string) => {
  switch (value) {
    case "center":
      return language === "ja" ? `中央` : `Center`;
    case "flex-start":
      return language === "ja" ? `左上` : `Upper left`;

    default:
      return language === "ja" ? `中央` : `Center`;
      break;
  }
};

const descriptionGuide = [
  {
    title: "正確なデータ分析と評価",
    content:
      "営業稼働日と休業日を設定しておくことで、年度・月度ごとの稼働日に基づいた適切な面談・デモ件数、TELPR件数の目標設定と各プロセスの結果に基づく正確な評価・分析が可能となります。\nまた、稼働日を年度ごとに設定することで、各営業テリトリーの過去比較を行う際に稼働日も考慮した正確な分析が可能です。",
  },
  {
    title: "PDFダウンロード",
    content:
      "登録した営業カレンダーは右側のダウンロードアイコンからPDF形式でダウンロードが可能です。\nサイズはA4〜A7サイズの範囲で変更が可能です。",
  },
  {
    title: "印刷",
    content:
      "営業カレンダーを印刷して各メンバーの手帳に入れておくことで、お客様との商談で自社の営業締日ベースでのスケジュールの擦り合わせなどで活用頂けます。\nサイズはA4〜A7サイズの範囲で変更が可能です。",
  },
];

const descriptionSteps = [
  {
    title: "ステップ1：定休日を適用",
    content:
      "「会社・チーム」画面で設定した定休日を表示中の会計年度に一括で適用します。\n各年度ごとに定休日は1ヶ月に1回のみ一括変更が可能です。",
  },
  {
    title: "ステップ2：会社独自の休業日を個別登録",
    content:
      "定休日以外の休業日はお客様ごとに異なるため、カレンダーの日付を複数選択して「営業日を休日に」または「休日を営業日に」登録・変更しましょう。",
  },
  {
    title: "ステップ3：印刷・PDFダウンロード",
    content:
      "自社専用の営業カレンダーが完成したら、設定メニューの「印刷サイズ」と「解像度」を確認し、右側のアイコンから印刷・PDFをダウンロードが可能です。",
  },
  // {
  //   title: "",
  //   content: "より高い圧縮率でファイルサイズを最小限に軽量化できますが、画質が劣化する可能性があります。",
  // },
];
const descriptionPrintTips = [
  // {
  //   title: "Tips",
  //   content:
  //     "印刷ボタンクリック後に印刷ダイアログが開かれた後、「詳細設定」の「余白」を「なし」に切り替えることで綺麗に印刷ができます。また、「用紙サイズ」のそれぞれの選択肢については下記の通りです。",
  // },
  {
    title: "A4",
    content: "国際標準の紙のサイズ(210x297mm)",
  },
  {
    title: "A5",
    content: "A4サイズの半分の大きさ(148x210mm)で、ノートや小冊子によく使用されます。",
  },
  {
    title: "3.5x5インチ(L判)",
    content: "写真プリントでよく使用されるサイズ(L判)",
  },
  {
    title: "4x6インチ",
    content: "写真プリントの標準的なサイズ(KG判に近いサイズ)",
  },
  {
    title: "5x5インチ",
    content: "正方形の写真プリントに使用されるサイズで、アルバムやデザインに適しています。",
  },
  {
    title: "5x7インチ",
    content: "カードやポートレートに適したサイズ",
  },
  {
    title: "JIS B5",
    content: "日本工業規格(JIS)に基づいたBシリーズの紙サイズ(182x257mm)。学校の教科書などで使用されます。",
  },
  {
    title: "Legal",
    content: "契約書や法的文書に使用されます。約8.5x14インチ(216x356mm)",
  },
  {
    title: "Letter",
    content: "日常の文書印刷に広く使用されます。約8.5x11インチ(216x279mm)",
  },
  {
    title: "はがき",
    content: "日本の郵便はがきに使用されるサイズ(100x148mm)で、年賀状や招待状などに適しています。",
  },
];

const mappingDescriptions: { [key: string]: { [key: string]: string }[] } = {
  guide: descriptionGuide,
  step: descriptionSteps,
  compressionRatio: descriptionCompressionRatio,
  printTips: descriptionPrintTips,
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
const getClosingDaysNameString = (closingDaysList: number[] | null) => {
  if (!closingDaysList?.length) return null;
  const nameList = closingDaysList?.map((num) => dayFullNamesJa[num]);
  return nameList;
};

// 月の始まりの1日の曜日に応じて１ヶ月の配列の先頭にnullを追加する関数
// const addNullMonthArray = (dayOfWeek: number, array: any[]): (CustomerBusinessCalendars | null)[] => {
const addNullMonthArray = (
  dayOfWeek: number,
  array: any[]
): ({
  date: string;
  datePadZero: string;
  day_of_week: number;
  status: string | null;
  timestamp: number;
  isFiscalMonthEnd: boolean;
  isOutOfFiscalYear: boolean;
  closedDateId: string | null;
} | null)[] => {
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
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const [isEditMode, setIsEditMode] = useState<string[]>([]); // エディットモード
  const [isOpenSettings, setIsOpenSettings] = useState(false); // セッティングメニュー
  const [printSize, setPrintSize] = useState<string>("A7"); // A4, A5, A6, A7
  // A4以外を印刷する際に印刷位置を左上か中央揃えかを選択
  const [printPosition, setPrintPosition] = useState("center");
  const [compressionRatio, setCompressionRatio] = useState<CompressionRatio>("FAST"); // 画像をPDF化する際の圧縮率3段階を指定

  // 編集モードポップアップ開閉
  const [isOpenEditModePopup, setIsOpenEditModePopup] = useState(false);
  // 休日=>営業日編集用 休日を保持する配列 idを保持
  const [editClosingDaysArray, setEditClosingDaysArray] = useState<string[]>([]);
  // 営業日=>休日編集用 営業日を保持する配列 datePadZeroを保持 YYYY-MM-DD形式 Mapオブジェクトで保持してJSX内で検索を高速にできるようにする keyがdatePadZeroで、valueが日付オブジェクト本体
  type InsertDateInfo = { date: string; day_of_week: number };
  // const [editWorkingDaysArray, setEditWorkingDaysArray] = useState<{date:string, day_of_week: number}[]>([]);
  const [editWorkingDaysMapObj, setEditWorkingDaysMapObj] = useState<Map<string, InsertDateInfo>>(new Map());
  // SQL標準および多くのデータベースシステムでは、DATE型の値をYYYY-MM-DD形式で扱います。この形式はISO 8601日付形式に準拠しており、月や日が1桁の場合には0で詰めるのが一般的です。したがって、2024-4-1の代わりに2024-04-01の形式を使用することを推奨します。

  // 🔹useRef関連
  const previewModalTwinAreaRef = useRef<HTMLDivElement | null>(null);
  const pdfTargetRef = useRef<HTMLDivElement | null>(null);
  // 説明アイコン
  const infoIconSettingMenuRef = useRef<HTMLDivElement | null>(null);
  const infoIconStepRef = useRef<HTMLDivElement | null>(null);

  // 🔹変数定義関連

  // 現在の会計年度初期値
  const initialCurrentFiscalYearRef = useRef<number>(selectedFiscalYearSetting);
  // 決算日Date
  const fiscalYearEndDate = useMemo(() => {
    return calculateCurrentFiscalYearEndDate({
      fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
      selectedYear: selectedFiscalYearSetting,
    });
  }, [userProfileState?.customer_fiscal_end_month, selectedFiscalYearSetting]);
  // 期首Date
  // const fiscalYearStartDate = calculateFiscalYearStart({
  //   fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
  //   selectedYear: selectedFiscalYearSetting,
  // });
  // 選択年オプション(現在の年から3年遡る, 1年後は決算日まで３ヶ月を切った場合は選択肢に入れる)
  const [optionsFiscalYear, setOptionsFiscalYear] = useState<{ label: string; value: number }[]>([]);
  // 年度別の定休日適用ステータス配列
  // type StatusClosingDays = { fiscal_year: number; applied_closing_days: number[]; updated_at: number | null };
  // const [statusAnnualClosingDaysArray, setStatusAnnualClosingDaysArray] = useState<StatusClosingDays[] | null>(null);
  // const [statusAnnualClosingDaysArray, setStatusAnnualClosingDaysArray] = useState<StatusClosingDays[] | null>(() => {
  //   const localStatus = localStorage.getItem("status_annual_closing_days");
  //   const parsedStatus = localStatus ? JSON.parse(localStatus) : null;
  //   return parsedStatus;
  // });
  const statusAnnualClosingDaysArray = useDashboardStore((state) => state.statusAnnualClosingDaysArray);
  const setStatusAnnualClosingDaysArray = useDashboardStore((state) => state.setStatusAnnualClosingDaysArray);

  // 現在選択している会計年度が定休日を適用したかと、している場合１ヶ月前かどうか確認
  const statusClosingDaysSelectedYear = statusAnnualClosingDaysArray?.find(
    (obj) => obj.fiscal_year === selectedFiscalYearSetting
  );

  // 設定済みの定休日の曜日名の配列
  const customerClosingDaysNameArray = useMemo(() => {
    return getClosingDaysNameString(statusClosingDaysSelectedYear?.applied_closing_days ?? null);
  }, [statusClosingDaysSelectedYear?.applied_closing_days]);
  // 現在customer_closing_daysに設定されている定休日
  const customerCurrentClosingDaysNameArray = useMemo(() => {
    return getClosingDaysNameString(userProfileState.customer_closing_days ?? null);
  }, [userProfileState?.customer_closing_days]);

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
  // 現在の会計年度で適用されている定休日があれば曜日の配列のみ変数に格納
  const closingDaysArraySelectedYear = statusClosingDaysSelectedYear?.applied_closing_days ?? [];

  useEffect(() => {
    if (!fiscalYearEndDate || !selectedFiscalYearSetting || !userProfileState) {
      setIsOpenBusinessCalendarSettingModal(false);
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
  });

  // // 一度取得した年間の休業日リストを保持しておき、変更されたかチェックできるようにする
  // const [prevFetchTimeAnnualClosing, setPrevFetchTimeAnnualClosing] = useState<number | null>(
  //   () => annualMonthlyClosingDays?.getTime ?? null
  // );

  // useEffect(() => {
  //   if (!annualMonthlyClosingDays?.getTime) return;
  //   if (!prevFetchTimeAnnualClosing && annualMonthlyClosingDays?.getTime) {
  //     setPrevFetchTimeAnnualClosing(annualMonthlyClosingDays.getTime);
  //     return;
  //   }
  //   if (prevFetchTimeAnnualClosing === annualMonthlyClosingDays?.getTime) return;
  //   console.log(
  //     "💡💡💡💡💡💡年間休日リストの再フェッチを確認",
  //     "prevFetchTimeAnnualClosing",
  //     prevFetchTimeAnnualClosing,
  //     "annualMonthlyClosingDays?.getTime",
  //     annualMonthlyClosingDays?.getTime
  //   );

  //   // フェッチした時間を更新
  //   console.log("🔥🔥🔥🔥🔥営業カレンダーを再生成");
  //   setPrevFetchTimeAnnualClosing(annualMonthlyClosingDays.getTime);

  //   // 年間休日数が変更されると営業稼働日数が変わるのでfiscal_baseのみinvalidate
  //   const resetQueryCalendars = async () => {
  //     // await queryClient.invalidateQueries({ queryKey: ["calendar_for_calendar_base"] });
  //     // await queryClient.invalidateQueries({ queryKey: ["calendar_for_fiscal_base"] });
  //   };
  //   resetQueryCalendars();
  // }, [annualMonthlyClosingDays?.getTime]);

  const getAppliedAtOfSelectedYear = () => {
    const status = localStorage.getItem("status_annual_closing_days");
    if (status) {
      const parsedStatus: StatusClosingDays[] | null = JSON.parse(status);
      const appliedAt = parsedStatus?.find((obj) => obj.fiscal_year === selectedFiscalYearSetting)?.updated_at;
      console.log("ローカルストレージからappliedAt取得", appliedAt);
      return appliedAt ?? null;
    } else {
      return null;
    }
  };

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
    getTime: annualMonthlyClosingDays ? annualMonthlyClosingDays.getTime : null,
    isReady: !isLoadingAnnualMonthlyClosingDays && !!annualMonthlyClosingDays,
    appliedAtOfSelectedYear: statusClosingDaysSelectedYear?.updated_at ?? getAppliedAtOfSelectedYear() ?? null, // 選択中の年度の定休日の適用日(queryKey用)
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
    getTime: annualMonthlyClosingDays ? annualMonthlyClosingDays.getTime : null,
    isReady: !isLoadingAnnualMonthlyClosingDays && !!annualMonthlyClosingDays,
    appliedAtOfSelectedYear: statusClosingDaysSelectedYear?.updated_at ?? getAppliedAtOfSelectedYear() ?? null, // 選択中の年度の定休日の適用日(queryKey用)
  });

  // 年間休業日日数
  const annualClosingDaysCount = annualMonthlyClosingDays?.annual_closing_days_obj?.annual_closing_days_count ?? 0;
  // 年間営業稼働日数
  const annualWorkingDaysCount =
    calendarForFiscalBase?.workingDaysCountInYear ??
    getDaysInYear(selectedFiscalYearSetting ?? new Date().getFullYear());

  // カレンダーリストを3つの要素をもつ4つの配列に分割する 4行3列
  type SplitMonthsArrayCB =
    | {
        fiscalYearMonth: string;
        monthlyDays: {
          date: string;
          datePadZero: string;
          day_of_week: number;
          status: string | null;
          timestamp: number;
          isFiscalMonthEnd: boolean;
          isOutOfFiscalYear: boolean;
          closedDateId: string | null;
        }[];
      }[][]
    | null;
  type SplitMonthsArrayFB =
    | {
        fiscalYearMonth: string;
        monthlyDays: CustomerBusinessCalendars[];
        monthlyWorkingDaysCount: number;
      }[][]
    | null;
  const splitMonthsArrayForCB: SplitMonthsArrayCB = useMemo(() => {
    const newSplitArray = !!calendarForCalendarBase?.completeAnnualFiscalCalendar?.length
      ? splitArrayIntoChunks(calendarForCalendarBase?.completeAnnualFiscalCalendar, 3)
      : null;
    return newSplitArray;
  }, [calendarForCalendarBase?.completeAnnualFiscalCalendar, userProfileState?.customer_fiscal_end_month]);

  const splitMonthsArrayForFB: SplitMonthsArrayFB = useMemo(() => {
    if (!calendarForFiscalBase?.completeAnnualFiscalCalendar?.length) return null;
    if (!calendarForCalendarBase) return null;

    // 12個の配列を15個に変換
    let newArray15: ({
      fiscalYearMonth: string;
      monthlyDays: CustomerBusinessCalendars[];
      monthlyWorkingDaysCount: number;
    } | null)[] = [...calendarForFiscalBase?.completeAnnualFiscalCalendar];
    // 会計期間の開始月とカレンダー上の開始月が一致しているか
    if (calendarForCalendarBase.isSameStartMonthFiscalAndCalendar) {
      // 一致している場合は末尾に３つnullを追加
      newArray15 = [...newArray15, null, null, null];
    } else {
      // 一致していない場合は、先頭に1つnullと、末尾に２つnullを追加
      newArray15 = [null, ...newArray15, null, null];
    }
    // 5行3列
    const newSplitArray53 = splitArrayIntoChunks(newArray15, 3);

    return newSplitArray53;
  }, [calendarForFiscalBase?.completeAnnualFiscalCalendar, userProfileState?.customer_fiscal_end_month]);

  // 年が切り替わるインデックス(切り替わらない場合はnull)
  // const switchYearIndex =
  //   calendarForCalendarBase?.completeAnnualFiscalCalendar.findIndex(
  //     (obj) => obj.fiscalYearMonth?.split("-")[0] !== selectedFiscalYearSetting.toString()
  //   ) ?? null;
  const rowIndexOfSwitchYear = useMemo(() => {
    // インデックス取得一つのみ
    // const index = splitMonthsArrayForCB?.findIndex((chunk) =>
    //   chunk.some((element) => {
    //     if (element === null) return false;
    //     const year = parseInt(element.fiscalYearMonth.split("-")[0]); // 年を取得
    //     return year !== selectedFiscalYearSetting;
    //   })
    // );
    // return index !== -1 ? index : null;
    // 11月12月始まりだと2回年の切り替わりがあるため、複数のインデックスを取得できるように配列に格納
    const indexesArray: number[] | null = !!splitMonthsArrayForCB?.length
      ? (splitMonthsArrayForCB
          ?.map((chunk, rowIndex) =>
            chunk.some((element, colIndex) => {
              if (!element) return false;
              const colFirstYear = parseInt(chunk[0].fiscalYearMonth.split("-")[0], 10); // 列先頭年を取得
              const targetYear = parseInt(element.fiscalYearMonth.split("-")[0], 10); // チェック対象年を取得
              const prevRowLastColYear =
                rowIndex !== 0
                  ? parseInt(splitMonthsArrayForCB[rowIndex - 1][2].fiscalYearMonth.split("-")[0], 10)
                  : null; // 前の行の最終列の年を取得 => これと現在の行の年が切り替わっているかも確認
              // return year !== selectedFiscalYearSetting;
              return (
                targetYear !== colFirstYear ||
                (typeof prevRowLastColYear === "number" && targetYear !== prevRowLastColYear)
              );
            })
              ? rowIndex
              : null
          )
          .filter((index) => index !== null) as number[])
      : null;

    return indexesArray && indexesArray?.length > 0 ? indexesArray : null;
  }, [splitMonthsArrayForCB, userProfileState?.customer_fiscal_end_month]);

  // splitMonthsArrayForCB[0][0].fiscalYearMonth.split
  const firstYear = splitMonthsArrayForCB
    ? parseInt(splitMonthsArrayForCB[0][0].fiscalYearMonth.split("-")[0], 10)
    : selectedFiscalYearSetting;
  // 1行目の２番目 2023-2024の2024
  const firstRowSecondYear =
    rowIndexOfSwitchYear && rowIndexOfSwitchYear.includes(0) && splitMonthsArrayForCB
      ? parseInt(splitMonthsArrayForCB[0][2].fiscalYearMonth.split("-")[0], 10)
      : null;
  // 年が2回切り替わりあるパターンの３番目の年、最後の行
  const thirdYear =
    rowIndexOfSwitchYear &&
    rowIndexOfSwitchYear.length === 2 &&
    rowIndexOfSwitchYear.includes(4) &&
    splitMonthsArrayForCB
      ? parseInt(splitMonthsArrayForCB[4][2].fiscalYearMonth.split("-")[0], 10)
      : null;
  const secondYear =
    rowIndexOfSwitchYear && rowIndexOfSwitchYear.length === 1 && splitMonthsArrayForCB
      ? parseInt(splitMonthsArrayForCB[4][2].fiscalYearMonth.split("-")[0], 10)
      : null;

  // 年が切り替わるインデックスがチャンクの先頭、かつ、rowIndexが最初の行でない場合はtrue
  const isSwitchYearColFirst = useMemo(() => {
    if (rowIndexOfSwitchYear && rowIndexOfSwitchYear.length === 1 && splitMonthsArrayForCB) {
      const index = splitMonthsArrayForCB[rowIndexOfSwitchYear[0]]?.findIndex((element) => {
        if (element === null) return false;
        const year = parseInt(element.fiscalYearMonth.split("-")[0]);
        // 2023-12から2024-1に年が切り替わり、かつ３列の先頭の位置だった場合はtrue
        if (year !== selectedFiscalYearSetting && rowIndexOfSwitchYear[0] !== 0) {
          return true;
        } else {
          return false;
        }
      });
      return index === 0 ? true : false;
    } else {
      return false;
    }
  }, [rowIndexOfSwitchYear, userProfileState?.customer_fiscal_end_month]);

  // 月度ごとの締日の日付を4行3列で作成 => 5行3列
  // const fiscalEndDateArray: (number | null | undefined)[][] | null = useMemo(() => {
  //   if (!splitMonthsArrayForFB || !calendarForCalendarBase) return null;
  //   const array53 = splitMonthsArrayForFB.map((row) => {
  //     return row.map((col) => {
  //       if (!col) return null;
  //       if (!!col.monthlyDays.length) {
  //         const value = col.monthlyDays[col.monthlyDays.length - 1].date?.split("-")[2] ?? null;
  //         return value ? Number(value) : null;
  //       }
  //     });
  //   });
  //   return array53;
  // }, [splitMonthsArrayForFB, userProfileState?.customer_fiscal_end_month]);

  console.log(
    "BusinessCalendarコンポーネント再レンダリング",
    "userProfileState.customer_fiscal_end_month",
    userProfileState.customer_fiscal_end_month,
    "selectedFiscalYearSetting",
    selectedFiscalYearSetting,
    "annualMonthlyClosingDays",
    annualMonthlyClosingDays,
    "calendarForCalendarBase",
    calendarForCalendarBase,
    "calendarForFiscalBase",
    calendarForFiscalBase,
    "splitMonthsArrayForCB",
    splitMonthsArrayForCB,
    "splitMonthsArrayForFB",
    splitMonthsArrayForFB,
    "rowIndexOfSwitchYear",
    rowIndexOfSwitchYear,
    "isSwitchYearColFirst",
    isSwitchYearColFirst
    // "fiscalEndDateArray",
    // fiscalEndDateArray,
  );
  // -------------------------- ✅useQuery✅ --------------------------

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

    // 選択年を現在の会計年度に戻す
    setSelectedFiscalYearSetting(initialCurrentFiscalYearRef?.current);
    console.log("会計年度を戻す", initialCurrentFiscalYearRef?.current);

    setIsOpenBusinessCalendarSettingModal(false);
    if (hoveredItemPos) handleCloseTooltip();
  };
  // -------------------------- ✅モーダルを閉じる関数✅ --------------------------

  // // -------------------------- 🌟セッティングメニュー開閉🌟 --------------------------
  // const handleOpenSettings = () => {
  //   setIsOpenSettings(true);
  //   if (hoveredItemPos) handleCloseTooltip();
  //   if (openPopupMenu) handleClosePopupMenu();
  // };
  // const handleCloseSettings = () => {
  //   // セッティングメニューを閉じる
  //   setIsOpenSettings(false);
  // };
  // // -------------------------- ✅セッティングメニュー開閉✅ --------------------------

  // -------------------------- 🌟PDFファイルのダウンロード html => pdf🌟 --------------------------

  const handleSaveImageToPdf = async () => {
    if (!pdfTargetRef.current) return alert("pdfデータの取得に失敗しました。");

    setIsLoadingSkeleton(true);

    if (hoveredItemPos) handleCloseTooltip();
    if (openPopupMenu) handleClosePopupMenu();

    console.log("pdfTargetRef.current", pdfTargetRef.current);
    console.log("ここまで0");

    await new Promise((resolve) => setTimeout(resolve, 100));

    console.log("ここまで1 scale変更");

    // pdfファイル名の取得関数
    const getPdfFileName = () => {
      const title = `${selectedFiscalYearSetting}年度_カレンダー`;
      // const currentDate = format(new Date(), "yyMMddHHmmss");
      const fileName = `${title}.pdf`;
      return fileName;
    };
    const getFormatSize = (formatSize: string) => {
      switch (formatSize) {
        case "A7":
          return "a7";
        case "A6":
          return "a6";
        case "A5":
          return "a5";
        case "A4":
          return "a4";
        default:
          return "a7";
          break;
      }
    };

    const getToPngDetails = () => {
      // quality: 1.0, // 0から1の範囲で品質を指定 最高レベル○13.15
      // pixelRatio: 2, // 画像のピクセル密度を指定
      // quality: 0.8, // 画質と処理時間のバランスを取るために少し下げる ○12.23
      // pixelRatio: 1.5, // 高品質ながらも処理の負荷を考慮
      // quality: 0.5, // 画質と処理時間のバランスを取るために少し下げる ○10.09
      // pixelRatio: 1.5, // 高品質ながらも処理の負荷を考慮
      // quality: 0.5, // 画質と処理時間のバランスを取るために少し下げる 11.54 バツ
      // pixelRatio: 1, // デフォルト値
      // quality: 0.5, // 画質と処理時間のバランスを取るために少し下げる 9.23 バツ
      // pixelRatio: 1.2, // デフォルト値
      if (compressionRatio === "FAST") return { quality: 0.5, pixelRatio: 1.5 };
      if (compressionRatio === "SLOW") return { quality: 1, pixelRatio: 2 };
      if (compressionRatio === "NONE") return { quality: 1, pixelRatio: 2 };
      return { quality: 1, pixelRatio: 2 };
    };

    try {
      // スケールを1に戻す
      if (scalePdf > 1) {
        pdfTargetRef.current.style.transform = `scale(1)`;
      }

      console.log("ここまで2 new jsPDFインスタンス作成");

      // 3. jsPDFインスタンスjの生成
      const doc = new jsPDF({
        orientation: "p", // p:縦向き, l:横向き
        unit: "mm", // mm: ミリメートル, 他には, cm,in,px,pc,em,ex, pxで指定する場合、optionのhotfixesを指定
        // format: "a4", // PDFのページフォーマット a4:A4サイズ
        format: getFormatSize(printSize), // PDFのページフォーマット a4:A4サイズ
      });
      // const pdf = new jsPDF()

      console.log("ここまで3 toPng実行");

      // DOM要素をpng画像に変換
      // const image = await toPng(pdfTargetRef.current); // 成功
      const image = await toPng(pdfTargetRef.current, {
        quality: getToPngDetails().quality, // FAST以外は1
        pixelRatio: getToPngDetails().pixelRatio, // FAST以外は2
      });

      console.log("ここまで4 setImageURLのstateを更新");

      // 保険で画像URLのリソース解放できなかった時のためのアンマウント時にURLリソース解放用に画像URLをstateに格納
      setImageURL(image);

      // イメージをPDFに追加*2 元々の素材となるDOM要素のレイアウト比を保った状態で画像に変換 もし素材の縦幅がA4の縦横比よりも短い場合は変換後のPDFの下側が空白となる。
      // doc.addImage(image, "PNG", 0, 0, 210, 0, "", "FAST"); // 成功
      // 第八引数の圧縮レベルは下記3つ選択 高品質を保ちたい場合はNONEかFAST、メールなどの送信でのサイズ容量を少なくする場合はSLOWを指定
      // ・FAST: 低圧縮 => 143KB
      // ・SLOW: 高圧縮 => 161KB
      // ・NONE: 圧縮なし => 6MB
      console.log("ここまで5 addImage実行");

      /* A4サイズは210mm * 297mm で 縦横比は1:1.41 */
      // doc.addImage(image, "PNG", 0, 0, 210, 0, "", compressionRatio); // デフォルトの圧縮率はFASTの中間
      /* A7サイズは74mm * 105mm で 縦横比は1:1.41 */
      // doc.addImage(image, "PNG", 0, 0, 74, 0, "", compressionRatio); // デフォルトの圧縮率はFASTの中間
      // printSizeごとにaddImageの第五引数の横幅の指定を対応するサイズに変換
      if (printSize === "A7") doc.addImage(image, "PNG", 0, 0, 74, 0, "", compressionRatio);
      if (printSize === "A6") doc.addImage(image, "PNG", 0, 0, 105, 0, "", compressionRatio);
      if (printSize === "A5") doc.addImage(image, "PNG", 0, 0, 148, 0, "", compressionRatio);
      if (printSize === "A4") doc.addImage(image, "PNG", 0, 0, 210, 0, "", compressionRatio);

      console.log("ここまで6 doc.save実行");

      // 5. PDFを保存
      doc.save(getPdfFileName());

      console.log("ここまで7 revokeURL実行");

      URL.revokeObjectURL(image); // 画像URLを解放
      setImageURL(null);

      console.log("ここまで8 ✅関数実行完了");
    } catch (error: any) {
      console.error("PDFの取得に失敗しました: ", error);
      toast.error("PDFの取得に失敗しました...🙇‍♀️");
    }

    // スケールを現在のwindowのサイズに戻す
    if (scalePdf > 1) {
      pdfTargetRef.current.style.transform = `scale(${scalePdf})`;
    }

    setIsLoadingSkeleton(false);
  };
  // -------------------------- ✅PDFファイルのダウンロード html => pdf✅ --------------------------

  // -------------------------- 🌟プリントアウト関数🌟 --------------------------

  const handlePrint = async () => {
    if (hoveredItemPos) handleCloseTooltip();
    if (openPopupMenu) handleClosePopupMenu();

    if (!pdfTargetRef.current) return alert("pdfデータの取得に失敗しました。");

    console.log("pdfTargetRef.current", pdfTargetRef.current);

    setIsLoadingSkeleton(true);

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      // スケールを1に戻す
      if (scalePdf > 1) {
        pdfTargetRef.current.style.transform = `scale(1)`;
      }

      const getToPngDetails = () => {
        if (compressionRatio === "FAST") return { quality: 0.5, pixelRatio: 1.5 };
        if (compressionRatio === "SLOW") return { quality: 1, pixelRatio: 2 };
        if (compressionRatio === "NONE") return { quality: 1, pixelRatio: 2 };
        return { quality: 1, pixelRatio: 2 };
      };

      // DOM要素をpng画像に変換
      const image = await toPng(pdfTargetRef.current, {
        quality: getToPngDetails().quality, // FAST以外は1
        pixelRatio: getToPngDetails().pixelRatio, // FAST以外は2
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

      /*
      🔹DPI 350 dpiで計算した場合(印刷用途) *13.7795
      A4サイズ
      横: 210mm x (350 / 25.4) ≈ 2894 ピクセル
      縦: 297mm x (350 / 25.4) ≈ 4093 ピクセル
      A5サイズ
      横: 148mm x (350 / 25.4) ≈ 2039 ピクセル
      縦: 210mm x (350 / 25.4) ≈ 2894 ピクセル
      A6サイズ
      横: 105mm x (350 / 25.4) ≈ 1449 ピクセル
      縦: 148mm x (350 / 25.4) ≈ 2039 ピクセル
      A7サイズ
      横: 74mm x (350 / 25.4) ≈ 1020 ピクセル
      縦: 105mm x (350 / 25.4) ≈ 1449 ピクセル
      */
      /*
      🔹DPI 96 dpiで計算した場合(画面表示用)
      ウェブページを印刷する際には、通常、印刷物の解像度（dpi）ではなく、画面表示用の解像度（概ね96dpiが一般的）を基準にサイズを指定します。A4用紙のサイズをピクセルで指定する場合、約96dpiを基準にして計算すると、A4（210mm x 297mm）は概ねwidth: 794px; height: 1123px;に相当します。
      A4サイズ
      横: 210mm x (96 / 25.4) ≈ 794 ピクセル
      縦: 297mm x (96 / 25.4) ≈ 1123 ピクセル
      A5サイズ
      横: 148mm x (96 / 25.4) ≈ 559 ピクセル
      縦: 210mm x (96 / 25.4) ≈ 794 ピクセル
      A6サイズ
      横: 105mm x (96 / 25.4) ≈ 397 ピクセル
      縦: 148mm x (96 / 25.4) ≈ 559 ピクセル
      A7サイズ
      横: 74mm x (96 / 25.4) ≈ 280 ピクセル
      縦: 105mm x (96 / 25.4) ≈ 397 ピクセル
      */
      // *1 width: 794px; height: 1123px;

      const getPixels = () => {
        // dpi 350 印刷用途 ブラウザからの印刷の場合は実際の用紙サイズに合わせたスタイリングが必要なためバツ
        // if (printSize === "A4") return { width: 2894, height: 4093 };
        // if (printSize === "A5") return { width: 2039, height: 2894 };
        // if (printSize === "A6") return { width: 1449, height: 2039 };
        // if (printSize === "A7") return { width: 1020, height: 1449 };
        // 実際のサイズ
        if (printSize === "A4") return { width: 794, height: 1123 };
        if (printSize === "A5") return { width: 559, height: 794 };
        if (printSize === "A6") return { width: 397, height: 559 };
        if (printSize === "A7") return { width: 280, height: 397 };
        return { width: 794, height: 1123 }; // dpi 96
      };

      // width: 297px; /* A7の幅、約105mmをpxに換算 */
      // height: 419px; /* A7の高さ、約74mmをpxに換算 */

      const printWidth = getPixels().width;
      const printHeight = getPixels().height;

      // HTMLコンテンツを生成してiframeに挿入
      iframeDoc.open();
      // iframeDoc.write(
      //   `<html>
      //   <head>
      //   <style>
      //   @media print {
      //     @page { size: A4; margin: 0; }
      //     html, body { margin: 0; padding: 0; box-sizing: border-box; width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center;
      //     }
      //     .print-content {
      //       width: 280px;
      //       height: 397px;
      //       background-color: red;
      //       display: flex;
      //       align-items: center;
      //       justify-content: center;
      //     }
      //   }
      //   </style>
      //   </head>
      //   <body>
      //     <div class="print-content">
      //       <img src="${image}" style="background-color: white; padding: 0; margin: 0; object-fit: cover; width: 100%; height: 100%;">
      //     </div>
      //   </body>
      //   </html>`
      // );
      iframeDoc.write(
        `<html>
        <head>
        <style>
        @media print { 
          html, body { margin: 0; padding: 0; box-sizing: border-box; width: 100%; height: 100%; position: relative; display: flex; align-items: ${printPosition}; justify-content: ${printPosition};
          }
          .print-content {
            width: ${printWidth}px;
            height: ${printHeight}px;
            background-color: red;
            display: flex;
            align-items: ${printPosition};
            justify-content: ${printPosition};
          }
        }
        </style>
        </head>
        <body>
          <div class="print-content">
            <img src="${image}" style="background-color: white; padding: 0; margin: 0; object-fit: cover; width: 100%; height: 100%;">
          </div>
        </body>
        </html>`
      );
      // iframeDoc.write(
      //   `<html><head><style>@media print { html, body { margin: 0; padding: 0; box-sizing: border-box; width: 100%; height: 100%; }}</style></head><body style="background-color: red; padding: 0; margin: 0; border: 0; position: relative; width: ${printWidth}px; height: ${printHeight}px; position: relative; display: flex; align-items: center; justify-content: center;"><img src="${image}" style="background-color: white; padding: 0; margin: 0; object-fit: cover; width: 100%; height: 100%;"></body></html>`
      // );
      // iframeDoc.write(
      //   `<html><head><style>@media print { html, body { margin: 0; padding: 0; box-sizing: border-box; width: 100%; height: 100%; }}</style></head><body style="background-color: red; padding: 0; margin: 0; border: 0; position: relative; width: 794px; height: 1123px; position: relative; display: flex; align-items: center; justify-content: center;"><img src="${image}" style="background-color: white; padding: 0; margin: 0; object-fit: cover; width: 100%; height: 100%;"></body></html>`
      // );
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

    setIsLoadingSkeleton(false);
  };
  // *1
  /**
🔹DPI 350 dpiで計算した場合(印刷用途) *13.7795
A4サイズ
横: 210mm x (350 / 25.4) ≈ 2894 ピクセル
縦: 297mm x (350 / 25.4) ≈ 4093 ピクセル
A5サイズ
横: 148mm x (350 / 25.4) ≈ 2039 ピクセル
縦: 210mm x (350 / 25.4) ≈ 2894 ピクセル
A6サイズ
横: 105mm x (350 / 25.4) ≈ 1449 ピクセル
縦: 148mm x (350 / 25.4) ≈ 2039 ピクセル
A7サイズ
横: 74mm x (350 / 25.4) ≈ 1020 ピクセル
縦: 105mm x (350 / 25.4) ≈ 1449 ピクセル

🔹DPI 96 dpiで計算した場合(Webスクリーン用途)
A4サイズ
横: 210mm x (96 / 25.4) ≈ 794 ピクセル
縦: 297mm x (96 / 25.4) ≈ 1123 ピクセル
A5サイズ
横: 148mm x (96 / 25.4) ≈ 558 ピクセル
縦: 210mm x (96 / 25.4) ≈ 794 ピクセル
A6サイズ
横: 105mm x (96 / 25.4) ≈ 397 ピクセル
縦: 148mm x (96 / 25.4) ≈ 558 ピクセル
A7サイズ
横: 74mm x (96 / 25.4) ≈ 279 ピクセル
縦: 105mm x (96 / 25.4) ≈ 397 ピクセル
   */
  // 画像のstyle属性でwidthとheightを指定していますが、これをA4サイズのピクセルまたはmm単位で具体的に指定することで、より正確にサイズを制御できます。A4サイズのピクセル数は解像度によって異なりますが、一般的にはWebスクリーン用途では96DPIの場合、約794x1123ピクセル（約210mm x 297mm）です。印刷用途では350dpi（300～400dpi）
  // 画像のDPI（ドット・パー・インチ）を調整して、印刷時のサイズを変更することも検討してください。HTMLやCSSで直接DPIを指定することはできませんが、画像を生成する際にDPIを考慮することで、印刷時のサイズ感を調整できます。
  // -------------------------- ✅プリントアウト関数✅ --------------------------

  // 定休日の日付リストを生成する関数
  const generateClosedDaysList = ({
    fiscalYearStartDate,
    closedDaysIndexes,
  }: {
    fiscalYearStartDate: Date;
    closedDaysIndexes: number[];
  }) => {
    if (!userProfileState) return;
    if (!fiscalYearStartDate) return;
    console.time("generateClosedDaysList関数");
    // 期首の日付を起点としたwhileループ用のDateオブジェクトを作成
    let currentDateForLoop = fiscalYearStartDate;
    // 期首のちょうど1年後の次年度、来期の期首用のDateオブジェクトを作成
    const nextFiscalYearStartDate = new Date(fiscalYearStartDate);
    nextFiscalYearStartDate.setFullYear(nextFiscalYearStartDate.getFullYear() + 1);

    // customer_business_calendarsテーブルのバルクインサート用の定休日日付リスト
    const closedDays = [] as {
      date: string;
      day_of_week: number;
    }[];

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
    if (!userProfileState.company_id) return alert("会社データが見つかりませんでした。");
    // 決算日の翌日の期首のDateオブジェクトを生成
    const fiscalYearStartDate = calculateFiscalYearStart({
      fiscalYearEnd: userProfileState.customer_fiscal_end_month,
      selectedYear: selectedFiscalYearSetting,
      fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? null,
    });
    if (!fiscalYearStartDate) return alert("先に決算日を登録してください。");
    if (!userProfileState?.customer_closing_days?.length) return alert("定休日が設定されていません。");
    if (!selectedFiscalYearSetting) return alert("定休日を反映する会計年度を選択してください。");

    // companiesテーブルのcustomer_closing_daysフィールドに定休日の配列をINSERTして、
    // customer_business_calendarsテーブル現在の会計年度 １年間INSERTした後の1年後に再度自動的にINSERTするようにスケジュールが必要
    if (showConfirmApplyClosingDayModal === "Insert") {
      setIsLoadingApply(true);
      // 期首から来期の期首の前日までの定休日となる日付リストを生成(バルクインサート用) DATE[]
      const closedDaysArrayForBulkInsert = generateClosedDaysList({
        fiscalYearStartDate: fiscalYearStartDate,
        closedDaysIndexes: userProfileState?.customer_closing_days,
      });

      if (!closedDaysArrayForBulkInsert) return alert("定休日データが取得できませんでした。");

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

        console.log("✅定休日を営業カレンダーテーブルへバルクインサート成功");

        // 営業カレンダーのuseQueryのキャッシュをinvalidate
        // queryKeyを詳細に指定して選択している会計年度のキャッシュのみを再フェッチ
        const fiscalEndMonthKey = userProfileState?.customer_fiscal_end_month
          ? format(new Date(userProfileState?.customer_fiscal_end_month), "yyyy-MM-dd")
          : null;
        const queryKey = ["annual_fiscal_month_closing_days", fiscalEndMonthKey, selectedFiscalYearSetting];
        await queryClient.invalidateQueries({ queryKey: queryKey });

        // ローカルストレージの年度別定休日ステータスを更新する
        if (statusAnnualClosingDaysArray) {
          const newStatusClosingDaysArray = [...statusAnnualClosingDaysArray];
          const newClosingDays = userProfileState.customer_closing_days;
          const newStatusClosingDaysObj = {
            fiscal_year: selectedFiscalYearSetting,
            applied_closing_days: newClosingDays,
            updated_at: new Date().getTime(),
          } as StatusClosingDays;
          const replaceAtIndex = newStatusClosingDaysArray.findIndex(
            (obj) => obj.fiscal_year === selectedFiscalYearSetting
          );
          if (replaceAtIndex !== -1) {
            // 置き換えるオブジェクトが見つかった場合のみ実行
            newStatusClosingDaysArray.splice(replaceAtIndex, 1, newStatusClosingDaysObj);
            // ローカルストレージとローカルstateを更新
            localStorage.setItem("status_annual_closing_days", JSON.stringify(newStatusClosingDaysArray));
            setStatusAnnualClosingDaysArray(newStatusClosingDaysArray);
          }
        }

        // await queryClient.invalidateQueries({ queryKey: ["calendar_for_calendar_base"] });
        // await queryClient.invalidateQueries({ queryKey: ["calendar_for_fiscal_base"] });
      } catch (error: any) {
        console.error("Bulk create エラー: ", error);
        toast.error("定休日の追加に失敗しました...🙇‍♀️");
      }
      setIsLoadingApply(false);
      setShowConfirmApplyClosingDayModal(null);
    }
    // Update
    else if (showConfirmApplyClosingDayModal === "Update") {
      // 1. ローカルストレージの適用済みの定休日の曜日と現在の定休日の曜日と比較
      // 1-1. 現在の曜日にない定休日の曜日を取得
      // 1-2. 現在の曜日にのみ存在する定休日の曜日を取得
      // 2. 現在の曜日に無い既存定休日の曜日は「休日 => 営業日」でバルクデリート
      // 3. 現在の曜日にのみ存在する定休日の曜日は「営業日 => 休日」にバルクアップサート(既に存在する曜日はDO NOTHING)

      // 1-1. 現在の曜日にない定休日の曜日を取得
      if (!statusClosingDaysSelectedYear || !statusClosingDaysSelectedYear?.applied_closing_days.length)
        return alert("定休日の更新に失敗しました。");

      try {
        const fiscalYearStartDate = calculateFiscalYearStart({
          fiscalYearEnd: userProfileState?.customer_fiscal_end_month ?? null,
          selectedYear: selectedFiscalYearSetting,
          fiscalYearBasis: userProfileState?.customer_fiscal_year_basis ?? null,
        });

        if (!fiscalYearStartDate) throw new Error("期首データが見つかりませんでした。");

        setIsLoadingApply(true);

        // 前回適用した定休日の曜日の配列からSetオブジェクトを作成
        const prevAppliedClosingDaysOfWeekSetObj = new Set(statusClosingDaysSelectedYear?.applied_closing_days);
        // 新たな(現在の)定休日の配列からSetオブジェクトを作成 => 前回の配列の全ての要素にhasを使って含まれていない曜日を削除対象にする
        const newAppliedClosingDaysOfWeekSetObj = new Set(userProfileState.customer_closing_days);

        // 前回の配列にのみ存在する曜日を保持する配列を生成してから、それをSetオブジェクトに変換 => 検索用、削除対象の曜日
        const onlyPrevAppliedClosingDaysOfWeekSet = new Set(
          Array.from(prevAppliedClosingDaysOfWeekSetObj).filter((day) => !newAppliedClosingDaysOfWeekSetObj.has(day))
        );

        // forEachループで1年間の日付から以下の２パターンの条件に合致する要素を抽出して配列を作成
        // 1. statusがclosedの要素で、かつ、削除対象Setオブジェクト(曜日)に含まれている要素のid
        // 2. statusがclosedの要素で、かつ、INSERT対象Setオブジェクトに含まれている要素(既に休日となっている要素,つまりINSERT不要な要素)
        const notInsertDateArray = [] as string[];
        const deleteDateIdsArray = [] as string[];
        // 1年分(12ヶ月分)の12個の配列の、それぞれ1ヶ月分の休日を保持する配列をflatMapで全て１つの配列にまとめる
        const annualClosingDaysArray = annualMonthlyClosingDays?.annual_closing_days_obj?.annual_closing_days ?? [];
        const allClosingDaysArray = annualClosingDaysArray.flatMap((obj) =>
          obj?.closing_days?.map((closingDay) => closingDay)
        );
        allClosingDaysArray.forEach((obj) => {
          // 削除対象かチェック 削除対象ならidを配列に追加
          if (obj.day_of_week && onlyPrevAppliedClosingDaysOfWeekSet.has(obj.day_of_week)) {
            deleteDateIdsArray.push(obj.id);
          }
          // INSERT対象の曜日で既に休日(closed)として追加されている日付のDATE型のdateの値を配列に格納(INSERT不要)
          if (obj.day_of_week && newAppliedClosingDaysOfWeekSetObj.has(obj.day_of_week) && obj.date) {
            notInsertDateArray.push(obj.date);
          }
        });
        // 既にINSERTされていてINSERT不要な休日のdate配列をSetオブジェクトに変換
        const notInsertDateSetObj = new Set(notInsertDateArray);

        // customer_business_calendarsテーブルのバルクインサート用の定休日日付リスト
        const insertClosedDays = [] as {
          date: string;
          day_of_week: number;
        }[];

        // 期首の日付を起点としたwhileループ用のDateオブジェクトを作成
        let currentDateForLoop = fiscalYearStartDate;
        // 期首のちょうど1年後の次年度、来期の期首用のDateオブジェクトを作成
        const nextFiscalYearStartDate = new Date(fiscalYearStartDate);
        nextFiscalYearStartDate.setFullYear(nextFiscalYearStartDate.getFullYear() + 1);

        console.log(
          "適用する定休日の曜日リスト",
          newAppliedClosingDaysOfWeekSetObj,
          "前回の定休日",
          statusClosingDaysSelectedYear?.applied_closing_days
        );

        // whileループで期首から来期の期首未満(期末まで)の新たに定休日となる日付を配列に格納
        while (currentDateForLoop.getTime() < nextFiscalYearStartDate.getTime()) {
          const dayOfWeek = currentDateForLoop.getDay();
          console.log("whileループ処理 現在の曜日", dayOfWeek, "日付", format(currentDateForLoop, "yyyy/MM/dd"));
          // 現在の日付の曜日が定休日インデックスリストの曜日に含まれていれば次のチェック
          if (newAppliedClosingDaysOfWeekSetObj.has(dayOfWeek)) {
            const formattedDatePadZero = formatDateToYYYYMMDD(currentDateForLoop, true); // 1桁左0詰めあり
            // 現在取り出している日付が既に休日リストに含まれいる日付でなければ定休日リストに格納
            if (!notInsertDateSetObj.has(formattedDatePadZero)) {
              insertClosedDays.push({
                date: formattedDatePadZero, // 時間情報を除いた日付情報のみセット
                day_of_week: dayOfWeek,
              });
            }
          }
          // 次の定休日までの日数を計算(スキップする日数を算出)
          let daysUntilNextClosingDay = Array.from(newAppliedClosingDaysOfWeekSetObj)
            .map((closingDay) => (closingDay - dayOfWeek + 7) % 7)
            .filter((days) => days > 0) // 現在の曜日より後の曜日のみを対象とする
            .sort((a, b) => a - b)[0]; // 最も近い未来の定休日までの日数を取得する

          // もし今日が定休日の場合、または次の定休日までの日数が計算できない場合は、次の日をチェックする
          if (daysUntilNextClosingDay === undefined || daysUntilNextClosingDay === 0) {
            daysUntilNextClosingDay = 1;
          }

          // 処理中の日付を次の定休日まで進める
          currentDateForLoop.setDate(currentDateForLoop.getDate() + daysUntilNextClosingDay);
        }

        // バルクデリート対象idの配列:deleteDateIdsArray, バルクインサート対象の配列: insertClosedDays
        const payload = {
          _customer_id: userProfileState.company_id,
          _delete_closed_date_ids: deleteDateIdsArray,
          _insert_closed_dates: insertClosedDays,
        };

        console.log("🔥バルクデリート&インサート実行 payload", payload);
        // 1と2を一つのFUNCTIONで実行
        const { error } = await supabase.rpc("bulk_delete_and_insert_closing_days", payload);

        if (error) throw error;

        console.log("✅営業カレンダーテーブル定休日の更新成功");

        // 🔹営業カレンダーのuseQueryのキャッシュをinvalidate
        // queryKeyを詳細に指定して選択している会計年度のキャッシュのみを再フェッチ
        const fiscalEndMonthKey = userProfileState?.customer_fiscal_end_month
          ? format(new Date(userProfileState?.customer_fiscal_end_month), "yyyy-MM-dd")
          : null;
        const queryKey = ["annual_fiscal_month_closing_days", fiscalEndMonthKey, selectedFiscalYearSetting];
        await queryClient.invalidateQueries({ queryKey: queryKey });

        // 🔹ローカルストレージの年度別定休日ステータスを更新する
        if (statusAnnualClosingDaysArray) {
          const newStatusClosingDaysArray = [...statusAnnualClosingDaysArray];
          const newClosingDays = userProfileState.customer_closing_days;
          const newStatusClosingDaysObj = {
            fiscal_year: selectedFiscalYearSetting,
            applied_closing_days: newClosingDays,
            updated_at: new Date().getTime(),
          } as StatusClosingDays;
          const replaceAtIndex = newStatusClosingDaysArray.findIndex(
            (obj) => obj.fiscal_year === selectedFiscalYearSetting
          );
          if (replaceAtIndex !== -1) {
            // 置き換えるオブジェクトが見つかった場合のみ実行
            newStatusClosingDaysArray.splice(replaceAtIndex, 1, newStatusClosingDaysObj);
            // ローカルストレージとローカルstateを更新
            localStorage.setItem("status_annual_closing_days", JSON.stringify(newStatusClosingDaysArray));
            setStatusAnnualClosingDaysArray(newStatusClosingDaysArray);
          }
        }

        toast.success("定休日の更新が完了しました!🌟");
      } catch (error: any) {
        console.error("エラー: ", error);
        toast.error("定休日の更新に失敗しました...🙇‍♀️");
      }

      setIsLoadingApply(false);
      setShowConfirmApplyClosingDayModal(null);
    }
  };
  // ===================== ✅定休日のUPSERT✅ =====================

  // -------------------------- 🌟エディットモードポップアップメニュー開閉🌟 --------------------------
  const handleCloseEditModePopup = () => {
    if (openPopupMenu) handleClosePopupMenu();
    if (hoveredItemPos) handleCloseTooltip();
    setIsOpenEditModePopup(false);
    if (isEditMode.length > 0) setIsEditMode([]);
    // if (editWorkingDaysArray.length > 0) setEditWorkingDaysArray([]);
    if (editWorkingDaysMapObj.size > 0) setEditWorkingDaysMapObj(new Map());
    if (editClosingDaysArray.length > 0) setEditClosingDaysArray([]);
  };
  // -------------------------- ✅エディットモードポップアップメニュー開閉✅ --------------------------

  // -------------------------- 🌟エディットモード終了🌟 --------------------------
  const handleFinishEdit = () => {
    if (isEditMode.length > 0) setIsEditMode([]);
    if (openPopupMenu) handleClosePopupMenu();
    if (hoveredItemPos) handleCloseTooltip();
  };
  // -------------------------- ✅エディットモード終了✅ --------------------------
  // -------------------------- 🌟全てのフィールドを編集モードに変更🌟 --------------------------
  const handleSwitchEditMode = () => {
    // if (openPopupMenu) handleClosePopupMenu();

    if (isEditMode.length === 0) {
      // const allEdit = ["working_to_closing", "closing_to_working"];
      // setIsEditMode(allEdit);
      setIsOpenEditModePopup(true);
    } else {
      // handleFinishEdit();
      // handleCloseEditModePopup();
      handleFinishEdit();
    }
    // if (hoveredItemPos) handleCloseTooltip();
  };
  // -------------------------- ✅全てのフィールドを編集モードに変更✅ --------------------------

  // -------------------------- 🌟日付クリック🌟 --------------------------
  type DateCellProps = {
    dateObj: {
      date: string;
      datePadZero: string;
      day_of_week: number;
      status: string | null;
      timestamp: number;
      isFiscalMonthEnd: boolean;
      isOutOfFiscalYear: boolean;
      closedDateId: string | null;
    };
  };
  // 全てそれぞれの配列に格納
  // 1. 編集モード 営業日->休日 working_to_closing datePadZeroを格納(ISO8601日付形式/YYYY-MM-DD形式)
  // 2. 編集モード 休日->営業日 closing_to_working idを格納
  // 3. 通常モード時にクリックで編集モード起動 営業日->休日 working_to_closing
  // 4. 通常モード時にクリックで編集モード起動 休日->営業日 closing_to_working
  const addDateWorkingToClosing = ({ dateObj }: DateCellProps) => {
    // 🔹最初からMapオブジェクトで保持するパターン

    // Mapの現在のstateをコピーして不変性を担保
    const updatedMap = new Map(editWorkingDaysMapObj);

    if (updatedMap.has(dateObj.datePadZero)) {
      // 既に選択されている場合は削除 キーを指定して削除
      updatedMap.delete(dateObj.datePadZero);
    } else {
      // 選択されていない場合は追加
      updatedMap.set(dateObj.datePadZero, { date: dateObj.datePadZero, day_of_week: dateObj.day_of_week });
    }
    // Mapのstateの更新
    setEditWorkingDaysMapObj(updatedMap);

    // // 🔹配列からMapに変換パターン:既に選択済みの場合は選択を解除 Mapオブジェクトに変換して高速にチェック
    // // Mapオブジェクトの初期化、editWorkingDaysArrayからMapを生成
    // const editWorkingDaysMapObj = new Map(editWorkingDaysArray.map(obj => [obj.date, obj]));

    // // キーに割り当てたdateの値をもつキーのオブジェクトが存在するかチェック
    // if (editWorkingDaysMapObj.has(dateObj.datePadZero)) {
    //   // 存在する場合は削除
    //   editWorkingDaysMapObj.delete(dateObj.datePadZero);
    // } else {
    //   // 存在しない場合は追加 第一引数にキー: date, 第二引数に値: dateとday_of_weekを持つオブジェクト
    //   editWorkingDaysMapObj.set(dateObj.datePadZero, {
    //     date: dateObj.datePadZero,
    //     day_of_week: dateObj.day_of_week
    //   });
    // }

    // // Mapオブジェクトから新い配列を生成してstateを更新
    // // *Mapオブジェクトのvalues()のイテレータから配列を作成(スプレッド, Array.from)はどちらでもOK
    // // const newArray = Array.from(editWorkingDaysMapObj.values());
    // const newArray = [...editWorkingDaysMapObj.values()];
    // setEditWorkingDaysArray(newArray)
  };
  const addDateClosingToWorking = ({ dateObj }: DateCellProps) => {
    if (!dateObj.closedDateId) return;
    // 既に選択済みの場合は選択を解除
    if (editClosingDaysArray.includes(dateObj.closedDateId)) {
      const filteredArray = editClosingDaysArray.filter((id) => id !== dateObj.closedDateId);
      setEditClosingDaysArray(filteredArray);
    } else {
      const newArray = [...editClosingDaysArray, dateObj.closedDateId];
      setEditClosingDaysArray(newArray);
    }
  };
  const handleClickDateCell = ({ dateObj }: DateCellProps) => {
    // 🔹1. 編集モード 営業日->休日 working_to_closing datePadZeroを格納(ISO8601日付形式/YYYY-MM-DD形式)
    if (isEditMode.includes("working_to_closing")) {
      addDateWorkingToClosing({ dateObj });
    }
    // 🔹2. 編集モード 休日->営業日 closing_to_working idを格納
    if (isEditMode.includes("closing_to_working")) {
      addDateClosingToWorking({ dateObj });
    }
  };
  console.log("editWorkingDaysMapObj", editWorkingDaysMapObj, "editClosingDaysArray", editClosingDaysArray);
  // -------------------------- ✅日付クリック✅ --------------------------

  // -------------------------- 🌟営業日 休日 一括更新(バルクインサート or バルクデリート)🌟 --------------------------
  const handleUpdateDaysStatus = async () => {
    if (!userProfileState.company_id) return alert("会社データが見つかりませんでした。");
    console.log(
      "handleUpdateDaysStatus関数実行 isEditMode",
      isEditMode,
      "editWorkingDaysMapObj",
      editWorkingDaysMapObj,
      "editClosingDaysArray",
      editClosingDaysArray
    );
    // 🔹営業日->休日 DATE型のdateの値を使用してバルクインサート
    if (isEditMode.includes("working_to_closing") && editWorkingDaysMapObj.size > 0) {
      try {
        // Mapオブジェクトを配列に変換
        const workingDaysArray = [...editWorkingDaysMapObj.values()];
        // Mapオブジェクトのサイズと変換後の配列の要素数が一致しているか確認
        if (editWorkingDaysMapObj.size !== workingDaysArray.length)
          throw new Error("営業日から休日への変更処理にエラーが発生しました。");

        setIsLoading(true);

        const bulkInsertPayload = {
          _customer_id: userProfileState.company_id,
          _closed_days: workingDaysArray,
        };

        console.log(
          "🔥バルクインサート実行 bulkInsertPayload",
          bulkInsertPayload,
          "editWorkingDaysMapObj",
          editWorkingDaysMapObj
        );

        const { error } = await supabase.rpc("bulk_insert_closing_days", bulkInsertPayload);

        if (error) throw error;

        console.log("✅営業日を休日へバルクインサート成功");

        // 営業カレンダーのuseQueryのキャッシュをinvalidate
        // queryKeyを詳細に指定して選択している会計年度のキャッシュのみを再フェッチ
        const fiscalEndMonthKey = userProfileState?.customer_fiscal_end_month
          ? format(new Date(userProfileState?.customer_fiscal_end_month), "yyyy-MM-dd")
          : null;
        const queryKey = ["annual_fiscal_month_closing_days", fiscalEndMonthKey, selectedFiscalYearSetting];
        // 営業カレンダーのuseQueryのキャッシュをinvalidate
        await queryClient.invalidateQueries({ queryKey: queryKey });
        // await queryClient.invalidateQueries({ queryKey: ["annual_fiscal_month_closing_days"] });

        toast.success("営業日から休日への更新が完了しました!🌟");
      } catch (error: any) {
        console.error("Bulk insert エラー: ", error);
        toast.error("営業日から休日への変更に失敗しました...🙇‍♀️");
      }
    }
    // 🔹休日->営業日 idを使用してバルクデリート
    if (isEditMode.includes("closing_to_working") && editClosingDaysArray.length > 0) {
      setIsLoading(true);

      try {
        const bulkDeletePayload = {
          _customer_id: userProfileState.company_id,
          _closed_day_ids: editClosingDaysArray,
        };

        console.log("🔥バルクデリート実行 bulkDeletePayload", bulkDeletePayload);

        const { error } = await supabase.rpc("bulk_delete_closing_days", bulkDeletePayload);

        if (error) throw error;

        console.log("✅休日のバルクデリート成功");

        // queryKeyを詳細に指定して選択している会計年度のキャッシュのみを再フェッチ
        const fiscalEndMonthKey = userProfileState?.customer_fiscal_end_month
          ? format(new Date(userProfileState?.customer_fiscal_end_month), "yyyy-MM-dd")
          : null;
        const queryKey = ["annual_fiscal_month_closing_days", fiscalEndMonthKey, selectedFiscalYearSetting];
        // 営業カレンダーのuseQueryのキャッシュをinvalidate
        await queryClient.invalidateQueries({ queryKey: queryKey });
        // const queryKeyCB = [
        //   "calendar_for_calendar_base",
        //   fiscalEndMonthKey,
        //   selectedFiscalYearSetting,
        //   statusClosingDaysSelectedYear?.updated_at ?? getAppliedAtOfSelectedYear() ?? null,
        // ];
        // await queryClient.invalidateQueries({ queryKey: queryKeyCB });
        // const queryKeyFB = [
        //   "calendar_for_fiscal_base",
        //   fiscalEndMonthKey,
        //   selectedFiscalYearSetting,
        //   statusClosingDaysSelectedYear?.updated_at ?? getAppliedAtOfSelectedYear() ?? null,
        // ];
        // await queryClient.invalidateQueries({ queryKey: queryKeyFB });

        toast.success("休日から営業日への更新が完了しました!🌟");
      } catch (error: any) {
        console.error("Bulk delete エラー: ", error);
        toast.error("休日から営業日への変更に失敗しました...🙇‍♀️");
      }
    }

    setIsLoading(false); // ローディングh数量
    handleCloseEditModePopup(); // 全てを閉じる
  };
  // -------------------------- ✅営業日 休日 一括更新(バルクインサート or バルクデリート)✅ --------------------------

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
    printTips: { en: "Print Tips", ja: "印刷Tips" },
    printSize: { en: "Print Size", ja: "印刷・PDFサイズ" },
    pdf: { en: "PDF Download", ja: "PDFダウンロード" },
    settings: { en: "Settings", ja: "各種設定メニュー" },
    edit_mode: { en: "Edit mode", ja: "編集モード" },
    applyClosingDays: { en: "Apply Closing Days", ja: "定休日一括設定" },
    displayFiscalYear: { en: "Display fiscal year", ja: "会計年度" },
    working_to_closing: { en: "Working days to Closing days", ja: "営業日 → 休日" },
    closing_to_working: { en: "Closing days to Working days", ja: "休日 → 営業日" },
  };
  type PopupMenuParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    title: string;
    displayX?: string;
    maxWidth?: number;
    context?: string;
  };
  const handleOpenPopupMenu = ({ e, title, displayX, maxWidth, context }: PopupMenuParams) => {
    if (!displayX) {
      const { y, height } = e.currentTarget.getBoundingClientRect();
      setOpenPopupMenu({
        y: y - height / 2,
        title: title,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      // モーダル外に配置した場合
      const positionX = displayX === "right" ? x + width + 9 : window.innerWidth - x + 9;
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
        y: y,
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
        <SkeletonLoadingLineCustom h="100%" w="100%" rounded="0px" waveBg="var(--color-skeleton-bg-wave-light)" />
      </div>
    );
  };
  // -------------------------- ✅フォールバック✅ --------------------------

  // ----------------- 🌟編集モードオーバーレイコンポーネント🌟 -----------------
  const EditModeOverlay = () => {
    return (
      <div
        // className={`absolute left-[-50vw] top-[-50vh] z-[3500] h-[150vh] w-[150vw] bg-[#00000030]`}
        className={`absolute left-[-50vw] top-[-50vh] z-[3700] h-[150vh] w-[150vw] bg-[#00000030]`}
        // style={{ backgroundColor: "#ff0000c0" }}
        onClick={handleFinishEdit}
      ></div>
    );
  };
  // ----------------- ✅編集モードオーバーレイコンポーネント✅ -----------------
  // ----------------- 🌟年切り替わりコンポーネント🌟 -----------------
  const YearSection = ({ year }: { year: number }) => {
    return (
      <div className={`${styles.year_section} w-full bg-[aqua]/[0]`}>
        <div className={`flex h-full w-[1%] bg-[green]/[0]`}></div>
        {/* <div className={`flex h-full w-[3px] bg-[green]/[0]`}></div> */}
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
        {/* <div className={`flex h-full w-[3px] bg-[green]/[0]`}></div> */}
        <div
          className={`flex h-full w-[26%] items-center space-x-[2px] bg-[red]/[0] text-[20px] font-bold leading-[22px]`}
        >
          <span className={``}>{year}</span>
          <span className={`h-[2px] w-[10px] bg-[var(--color-text-title)]`}></span>
          <span className={``}>{nextYear}</span>
        </div>
        <div className={`flex h-full w-[74%] flex-col justify-end`}>
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
  // ----------------- ✅年切り替わりコンポーネント✅ -----------------

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
                      // fiscalYearStartDate &&
                      calendarForFiscalBase &&
                      calendarForFiscalBase.completeAnnualFiscalCalendar?.length > 0
                    ) {
                      displayValue =
                        calendarForFiscalBase.completeAnnualFiscalCalendar[index - 1].fiscalYearMonth.split("-")[1];
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
                    if (calendarForFiscalBase) {
                      monthDaysCount = calendarForFiscalBase.completeAnnualFiscalCalendar[index - 1].monthlyDays.length;
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

      {/* ローディングオーバーレイ */}
      {(isLoading || isLoadingSkeleton) && (
        <div className={`${styles.loading_overlay}`}>
          {/* <div className={`${styles.loading_spinner_outside} flex-center bg-[#fff]`}>
            <SpinnerComet w="56px" h="56px" s="6px" />
          </div> */}
          <SpinnerBrand withBorder withShadow />
        </div>
      )}
      {/* ローディングオーバーレイ ここまで */}
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
          {/* ----------------------------- ローディングフォールバック ----------------------------- */}
          {(isLoadingAnnualMonthlyClosingDays ||
            isLoadingCalendarForFiscalBase ||
            isLoadingCalendarForCalendarBase) && (
            <div
              className={`${styles.pdf} ${styles.loading}`}
              style={{ transform: `scale(${scalePdf})`, padding: "0px", backgroundColor: "#aaa" }}
            >
              <SkeletonLoadingLineCustom h="100%" w="100%" rounded="0px" waveBg="var(--color-skeleton-bg-wave-light)" />
            </div>
          )}
          {/* スケールが1以上で、ダウンロード、印刷時に上から覆うオーバーレイ */}
          {/* {isLoading && scalePdf > 1 && (
            <div className={`${styles.pdf} ${styles.loading}`} style={{ padding: "0px", backgroundColor: "#aaa" }}>
              <SkeletonLoadingLineCustom h="100%" w="100%" rounded="0px" />
            </div>
          )} */}
          {isLoadingSkeleton && (
            <div className={`${styles.pdf} ${styles.loading}`} style={{ padding: "0px", backgroundColor: "#aaa" }}>
              <SkeletonLoadingLineCustom h="100%" w="100%" rounded="0px" waveBg="var(--color-skeleton-bg-wave-light)" />
            </div>
          )}
          {/* ----------------------------- ローディングフォールバック ----------------------------- */}
          {/* ----------------------------- 🌟カレンダーPDFコンポーネント🌟 ----------------------------- */}
          {!isLoadingAnnualMonthlyClosingDays &&
            !isLoadingCalendarForFiscalBase &&
            !isLoadingCalendarForCalendarBase && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackBusinessCalendar />}>
                  <div
                    ref={pdfTargetRef}
                    className={`${styles.pdf} quotation`}
                    style={{ transform: `scale(${scalePdf})` }}
                  >
                    {/* ---------------- 左マージン ---------------- */}
                    <div className={`${styles.left_margin}`}></div>
                    {/* ---------------- 左マージン ---------------- */}
                    {/* ---------------- 真ん中 ---------------- */}
                    <div className={`${styles.pdf_main_container} flex h-full w-full flex-col`}>
                      {/* エディットモードオーバーレイ z-[3500] */}
                      {isEditMode.length > 0 && !isLoading && <EditModeOverlay />}

                      <div className={`${styles.top_margin} w-full bg-[red]/[0]`}></div>

                      {/* {isSwitchYearColFirst && <YearSection year={2023} />} */}
                      {/* 会計年度が2年に跨る場合 */}
                      {/* {isSwitchYearColFirst && <YearSection year={selectedFiscalYearSetting} />} */}
                      {/* 会計年度が単一の年のみ */}
                      {/* {!isSwitchYearColFirst && (
                    <YearSectionDouble year={selectedFiscalYearSetting} nextYear={selectedFiscalYearSetting + 1} />
                  )} */}
                      {/* {rowIndexOfSwitchYear !== 0 && <YearSection year={selectedFiscalYearSetting} />}
                  {rowIndexOfSwitchYear === 0 && (
                    <YearSectionDouble year={selectedFiscalYearSetting} nextYear={selectedFiscalYearSetting + 1} />
                  )} */}
                      {rowIndexOfSwitchYear && !rowIndexOfSwitchYear.includes(0) && <YearSection year={firstYear} />}
                      {rowIndexOfSwitchYear && rowIndexOfSwitchYear.includes(0) && (
                        <YearSectionDouble year={firstYear} nextYear={firstRowSecondYear ?? 0} />
                      )}

                      {/* <MonthlyRow monthlyRowKey="monthly_row_first" /> */}

                      {/* -------- 12ヶ月分の4行 + 年度区切り行(2年に跨がれば) -------- */}
                      {/* {Array(5) */}
                      {Array(6)
                        .fill(null)
                        .map((_, rowIndex) => {
                          const monthlyRowKey = "monthly_row" + rowIndex.toString();

                          if (!splitMonthsArrayForCB) return;

                          let monthRowIndex = rowIndex;

                          // 切り替わり1回ルート 先頭列に年の切り替わりがあり、先頭列にない場合は単一の年を返す
                          if (
                            isSwitchYearColFirst &&
                            rowIndexOfSwitchYear?.length === 1 &&
                            rowIndexOfSwitchYear[0] === rowIndex &&
                            rowIndexOfSwitchYear[0] !== 0
                          ) {
                            return <YearSection key={monthlyRowKey} year={secondYear ?? 0} />;
                          }
                          // 切り替わり1回ルート
                          if (
                            isSwitchYearColFirst &&
                            rowIndexOfSwitchYear &&
                            rowIndexOfSwitchYear?.length === 1 &&
                            rowIndex > rowIndexOfSwitchYear[0]
                          ) {
                            monthRowIndex -= 1;
                          }

                          // 切り替わり1回ルート 先頭列以外で年が切り替わる場合はダブル(先頭行に切り替わりがない場合)
                          if (
                            !isSwitchYearColFirst &&
                            rowIndexOfSwitchYear &&
                            rowIndexOfSwitchYear?.length === 1 &&
                            rowIndex === rowIndexOfSwitchYear[0]
                          ) {
                            return (
                              <YearSectionDouble key={monthlyRowKey} year={firstYear} nextYear={secondYear ?? 0} />
                            );
                          }
                          // 切り替わり1回ルート
                          if (
                            !isSwitchYearColFirst &&
                            rowIndexOfSwitchYear &&
                            rowIndexOfSwitchYear?.length === 1 &&
                            rowIndex > rowIndexOfSwitchYear[0]
                          ) {
                            // return <YearSectionBlank />;
                            monthRowIndex -= 1;
                          }
                          // 切り替わり1回ルート 最初の行に年の切り替わりがある場合は最後の行はundefinedになるのでblankを渡す
                          if (rowIndexOfSwitchYear?.length === 1 && rowIndexOfSwitchYear[0] === 0 && rowIndex === 5) {
                            return <YearSectionBlank key={monthlyRowKey} />;
                          }

                          // 切り替わり2回ルート 11月、12月のどちらかが開始月で年の切り替わりが2回、年が3つ出現する場合
                          if (
                            !isSwitchYearColFirst &&
                            rowIndexOfSwitchYear &&
                            rowIndexOfSwitchYear?.length === 2 &&
                            rowIndexOfSwitchYear.includes(4) &&
                            rowIndex === 4
                          ) {
                            return (
                              <YearSectionDouble
                                key={monthlyRowKey}
                                year={firstRowSecondYear ?? 0}
                                nextYear={thirdYear ?? 0}
                              />
                            );
                          }
                          // 切り替わり2回ルート
                          if (
                            !isSwitchYearColFirst &&
                            rowIndexOfSwitchYear &&
                            rowIndexOfSwitchYear?.length === 2 &&
                            rowIndex > rowIndexOfSwitchYear[1]
                          ) {
                            // return <YearSectionBlank />;
                            monthRowIndex -= 1;
                          }
                          // 最初の行に年の切り替わりがある場合は最後の行はundefinedになるのでblankを渡す
                          // if (rowIndexOfSwitchYear?.length === 2 && rowIndexOfSwitchYear[1] === 4 && rowIndex === 5) {
                          //   return <YearSectionBlank key={monthlyRowKey} />;
                          // }

                          // if (!isSwitchYearColFirst && rowIndexOfSwitchYear && rowIndex === 5) {
                          //   // monthRowIndex -= 1;
                          //   return;
                          // }
                          console.log(
                            "isSwitchYearColFirst",
                            isSwitchYearColFirst,
                            "rowIndex",
                            rowIndex,
                            "monthRowIndex",
                            monthRowIndex,
                            "splitMonthsArrayForCB",
                            splitMonthsArrayForCB,
                            "splitMonthsArrayForCB[monthRowIndex]",
                            splitMonthsArrayForCB[monthRowIndex]
                          );

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
                                          // 会計期間外
                                          let isOutOfFiscalYear = false;
                                          if (dateObj !== null) {
                                            if (!dateObj?.date) return;

                                            const date = parseInt(dateObj.date.split("-")[2], 10);
                                            if (!isValidNumber(date)) return;

                                            displayValue = date;

                                            // 締め日かどうかチェック
                                            if (dateObj.isFiscalMonthEnd) {
                                              isFiscalEndDay = true;
                                            }
                                            // 会計期間かどうかチェック
                                            if (dateObj.isOutOfFiscalYear) {
                                              isOutOfFiscalYear = true;
                                            }

                                            // 休日かどうかチェック
                                            if (isValidNumber(dateObj.day_of_week)) {
                                              // 休日 現在選択中の定休日の曜日リストに含まれているかどうか
                                              // isClosed = [0, 6].includes(dateObj.day_of_week!);
                                              // isClosed = closingDaysArraySelectedYear.includes(dateObj.day_of_week!);
                                              isClosed = dateObj.status! === "closed";
                                              // const isClosed = monthCellIndex % 5 === 0 || monthCellIndex % 6 === 0;
                                            }
                                            // 会計期間かどうかチェック
                                            // if (fiscalStartDateTime && dateObj?.timestamp && fiscalEndDateTime) {
                                            //   if (
                                            //     dateObj.timestamp < fiscalStartDateTime ||
                                            //     fiscalEndDateTime < dateObj.timestamp
                                            //   ) {
                                            //     isOutOfFiscalYear = true;
                                            //   } else {
                                            //     // 締め日かどうかチェック
                                            //     // if (dateObj.)
                                            //     // if (fiscalEndDateArray) {
                                            //     //   try {
                                            //     //     // const fiscalEndDate = fiscalEndDateArray[monthRowIndex][colIndex];
                                            //     //     // if (fiscalEndDate && displayValue && fiscalEndDate === displayValue) {
                                            //     //     //   isFiscalEndDay = true;
                                            //     //     // }
                                            //     //   } catch (error: any) {
                                            //     //     console.log("❌締日取得エラー");
                                            //     //   }
                                            //     // }
                                            //   }
                                            // }
                                          }

                                          return (
                                            <div
                                              role="gridcell"
                                              key={monthCellIndexKey}
                                              className={`${styles.month_grid_cell} ${
                                                displayValue === null ? `` : `${styles.date}`
                                              } ${isClosed ? `${styles.is_closed}` : ``} ${
                                                isOutOfFiscalYear ? `${styles.out_of_fiscal_year}` : ``
                                              } ${
                                                (isEditMode.includes("working_to_closing") && !isClosed) ||
                                                (isEditMode.includes("closing_to_working") && isClosed)
                                                  ? `${styles.edit_mode}`
                                                  : ``
                                              } ${
                                                !isClosed &&
                                                dateObj?.datePadZero &&
                                                editWorkingDaysMapObj.has(dateObj.datePadZero)
                                                  ? `${styles.active}`
                                                  : ``
                                              } ${
                                                isClosed &&
                                                dateObj?.closedDateId &&
                                                editClosingDaysArray.includes(dateObj.closedDateId)
                                                  ? `${styles.active}`
                                                  : ``
                                              } flex-center`}
                                              style={{
                                                ...(displayValue === null && {
                                                  cursor: "default",
                                                }),
                                                ...(isFiscalEndDay && {
                                                  borderRadius: "3px",
                                                  border: "1px solid #37352f",
                                                }),
                                              }}
                                              onClick={() => {
                                                if (!dateObj) return;
                                                // 編集モードでない時にクリックした場合はポップアップを開く
                                                if (!isOpenEditModePopup) {
                                                  setIsOpenEditModePopup(true);
                                                  // 営業日をクリックした場合は「営業日→休日」モードに
                                                  if (!isClosed) {
                                                    setIsEditMode(["working_to_closing"]);
                                                    addDateWorkingToClosing({ dateObj });
                                                  }
                                                  // 休日をクリックした場合は「休日→営業日」モードに
                                                  if (isClosed) {
                                                    setIsEditMode(["closing_to_working"]);
                                                    addDateClosingToWorking({ dateObj });
                                                  }
                                                } else {
                                                  // クリックした日付を配列に格納して選択中の状態に変更
                                                  handleClickDateCell({ dateObj: dateObj });
                                                }
                                              }}
                                            >
                                              <span
                                                style={{
                                                  ...(isFiscalEndDay && {
                                                    textAlign: "center",
                                                    display: "inline-block",
                                                  }),
                                                }}
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

                      {/* <TestCalendar /> */}

                      {/* {!isSwitchYearColFirst && <YearSectionBlank />} */}

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
            )}
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
              // handleOpenPopupMenu({ e, title: "print", displayX: "right", maxWidth: 360 });
              handleOpenPopupMenu({ e, title: "print", displayX: "right" });
              // handleOpenPopupMenu({ e, title: "printTips", displayX: "right" });
            }}
            onMouseLeave={() => {
              if (openPopupMenu) handleClosePopupMenu();
            }}
          >
            <MdLocalPrintshop className={`pointer-events-none text-[21px] text-[#fff]`} />
          </div>
          {/* 印刷ボタンここまで */}
          {/* セッティングメニューボタン */}
          {/* <div
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
            <LuSettings2 className={`pointer-events-none text-[21px] text-[#fff]`} />
          </div> */}
          {/* セッティングメニューボタンここまで */}
          {/* 編集ボタン */}
          <div
            className={`flex-center transition-bg01 fixed right-[-56px] z-[3000] ${styles.btn} ${
              isEditMode.length > 0 ? `top-[5px]` : `top-[155px]`
            }`}
            onClick={() => {
              handleSwitchEditMode();
              // handleFinishEdit();
              if (openPopupMenu) handleClosePopupMenu();
              if (hoveredItemPos) handleCloseTooltip();
            }}
            onMouseEnter={(e) => {
              if (isEditMode.length !== 0) {
                handleOpenTooltip({
                  e: e,
                  display: "bottom",
                  content: `編集モード終了`,
                  // marginTop: 28,
                  itemsPosition: "center",
                });
                return;
              }
              handleOpenPopupMenu({ e, title: "edit_mode", displayX: "right", maxWidth: 360 });
            }}
            onMouseLeave={() => {
              if (openPopupMenu) handleClosePopupMenu();
              if (hoveredItemPos) handleCloseTooltip();
            }}
          >
            {isEditMode.length === 0 && <MdEdit className={`pointer-events-none text-[20px] text-[#fff]`} />}
            {isEditMode.length > 0 && <IoClose className={`pointer-events-none text-[22px] text-[#fff]`} />}
          </div>
          {/* 編集ボタンここまで */}
          {/* リセットボタン */}
          {isOpenEditModePopup &&
            ((isEditMode.includes("working_to_closing") && editWorkingDaysMapObj.size > 0) ||
              (isEditMode.includes("closing_to_working") && editClosingDaysArray.length > 0)) && (
              <div
                className={`flex-center fixed right-[-56px] z-[3000] ${styles.btn} ${styles.initial} top-[55px]`}
                onClick={() => {
                  if (isEditMode.includes("working_to_closing")) {
                    setEditWorkingDaysMapObj(new Map());
                  }
                  if (isEditMode.includes("closing_to_working")) {
                    setEditClosingDaysArray([]);
                  }
                  if (hoveredItemPos) handleCloseTooltip();
                }}
                onMouseEnter={(e) => {
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `選択中の日付をリセット`,
                    // marginTop: 28,
                    itemsPosition: "center",
                  });
                }}
                onMouseLeave={() => {
                  if (hoveredItemPos) handleCloseTooltip();
                }}
              >
                <GrPowerReset className={`pointer-events-none text-[20px] ${styles.icon}`} />
              </div>
            )}
          {/* リセットボタンここまで */}
          {/* ---------------------- ボタンエリア ここまで ---------------------- */}

          {/* ---------------------- セッティングメニュー関連 ---------------------- */}
          {/* メニューオーバーレイ */}
          {/* {isOpenSettings && <div className={`${styles.menu_overlay}`} onClick={handleCloseSettings}></div>} */}
          {isOpenEditModePopup &&
            !isEditMode.includes("working_to_closing") &&
            !isEditMode.includes("closing_to_working") && (
              <div className={`${styles.menu_overlay} ${styles.edit_mode}`} onClick={handleCloseEditModePopup}></div>
            )}

          {/* 説明ポップアップ */}
          {/* {openPopupMenu && ["working_to_closing", "closing_to_working"].includes(openPopupMenu.title) && (
            <div
              className={`${styles.description_menu} shadow-all-md border-real-with-shadow fixed right-[-18px] z-[3500] flex min-h-max flex-col rounded-[6px]`}
              style={{
                top: `${openPopupMenu.y}px`,
                ...(openPopupMenu?.displayX === "right" && {
                  right: `${openPopupMenu.x}px`,
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
                {openPopupMenu.title === "compressionRatio" &&
                  descriptionCompressionRatio.map((item, index) => (
                    <li
                      key={item.title + index.toString()}
                      className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}
                    >
                      <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                        {item.title}
                      </span>
                      <p className="select-none text-[12px]">{item.content}</p>
                    </li>
                  ))}
                {!["compressionRatio"].includes(openPopupMenu.title) && (
                  <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
                    <p className="select-none whitespace-pre-wrap text-[12px]">
                      {openPopupMenu.title === "working_to_closing" &&
                        "見積書末尾に記載される脚注を自由に編集が可能です。デフォルトテキストで保存したデータはブラウザを更新しても内容が保存されるため、自チームで常に使用している脚注がある場合は一度設定することでそれ以降の入力不要となります。"}
                      {openPopupMenu.title === "closing_to_working" &&
                        "見積書末尾に記載される脚注を自由に編集が可能です。デフォルトテキストで保存したデータはブラウザを更新しても内容が保存されるため、自チームで常に使用している脚注がある場合は一度設定することでそれ以降の入力不要となります。"}
                      {openPopupMenu.title === "print" &&
                        "印刷ボタンクリック後に印刷ダイアログが開かれた後、「詳細設定」の「余白」を「なし」に切り替えることで綺麗に印刷ができます。"}
                      {openPopupMenu.title === "pdf" &&
                        "現在プレビューで表示されている見積書をPDFファイル形式でダウンロードします。"}
                      {openPopupMenu.title === "settings" &&
                        "設定メニューから、印鑑や枠線、各取引条件の表示有無や、会社名のサイズ調整、脚注のデフォルトテキストの編集など、各種設定が可能です。"}
                      {openPopupMenu.title === "edit" &&
                        "編集モードでは、各取引条件や、見積備考、脚注、事業部や事業所名の編集が可能です。\nまた、各項目は表示されている見積書から直接ダブルクリックすることでも編集が可能です。\n商品名と型式の順番は直接ドラッグ&ドロップで順番の入れ替え可能です。"}
                    </p>
                  </li>
                )}
              </ul>
            </div>
          )} */}
          {/* 説明ポップアップ */}

          {/* ---------------------------- セッティングメニュー ---------------------------- */}
          <div
            className={`${
              styles.settings_menu
            } fixed right-[calc(100%+21px)] top-[0px] z-[3000] h-auto w-[330px] rounded-[6px] ${
              isOpenEditModePopup ? `pointer-events-none` : ``
            }`}
            onClick={() => {
              if (isOpenEditModePopup) {
                handleCloseEditModePopup();
                return;
              }
            }}
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
                  onMouseLeave={() => {
                    if (openPopupMenu) handleClosePopupMenu();
                  }}
                >
                  <div className="pointer-events-none flex min-w-[130px] items-center">
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>表示中</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  <select
                    className={`${styles.select_box} truncate`}
                    value={selectedFiscalYearSetting}
                    onChange={(e) => {
                      setSelectedFiscalYearSetting(Number(e.target.value));
                      if (openPopupMenu) handleClosePopupMenu();
                    }}
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
                  {!isAvailableApplyClosingDays && statusClosingDaysSelectedYear?.updated_at && <div>適用済み</div>}
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
                  onMouseLeave={() => {
                    if (openPopupMenu) handleClosePopupMenu();
                  }}
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
                        if (openPopupMenu) handleClosePopupMenu();
                      }}
                    >
                      <span>適用</span>
                    </div>
                  )}
                  {!(isAvailableApplyClosingDays || !statusClosingDaysSelectedYear?.updated_at) && (
                    <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                  )}
                  {/* <div
                    className={`transition-bg02 rounded-[8px] ${styles.edit_btn} ${styles.brand}`}
                    onClick={() => {
                      if (!selectedFiscalYearSetting) return alert("会計年度が選択されていません。");
                      if (!userProfileState.customer_closing_days) return alert("定休日が設定されていません。");
                      if (statusClosingDaysSelectedYear?.updated_at) {
                        setShowConfirmApplyClosingDayModal("Update");
                      } else {
                        setShowConfirmApplyClosingDayModal("Insert");
                      }
                      if (openPopupMenu) handleClosePopupMenu();
                    }}
                  >
                    <span>適用</span>
                  </div> */}
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
                    handleOpenPopupMenu({ e, title: "printSize", displayX: "right" });
                  }}
                  onMouseLeave={() => {
                    if (openPopupMenu) handleClosePopupMenu();
                  }}
                >
                  <div className="pointer-events-none flex min-w-[130px] items-center">
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>サイズ</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  <select
                    className={`${styles.select_box} truncate`}
                    value={printSize}
                    onChange={(e) => setPrintSize(e.target.value as PrintSize)}
                  >
                    {optionsPrintSize.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </li>

                <hr className="min-h-[3px] w-full" />

                <li
                  className={`${styles.list}`}
                  // onMouseEnter={(e) => {
                  //   handleOpenPopupMenu({ e, title: "printSize", displayX: "right" });
                  // }}
                  // onMouseLeave={() => {
                  //   if (openPopupMenu) handleClosePopupMenu();
                  // }}
                >
                  <div className="pointer-events-none flex min-w-[130px] items-center">
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>印刷位置</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  <select
                    className={`${styles.select_box} truncate`}
                    value={printPosition}
                    onChange={(e) => setPrintPosition(e.target.value as PrintPosition)}
                  >
                    {optionsPrintPosition.map((value) => (
                      <option key={value} value={value}>
                        {getPrintPositionName(value, language)}
                      </option>
                    ))}
                  </select>
                </li>

                <hr className="min-h-[3px] w-full" />

                <li
                  className={`${styles.list}`}
                  onMouseEnter={(e) => {
                    handleOpenPopupMenu({ e, title: "compressionRatio", displayX: "right" });
                  }}
                  onMouseLeave={handleClosePopupMenu}
                >
                  <div className="pointer-events-none flex min-w-[130px] items-center">
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

          {/* ---------------------- 営業日休日変更ポップアップ ---------------------- */}
          {/* 休日 => 営業日 or 営業日 => 休日  */}
          {isOpenEditModePopup && (
            <div
              className={`${styles.settings_menu} ${styles.edit_mode} ${styles.fade_up} fixed right-[calc(-330px-18px)] top-[205px] z-[3000] h-auto w-[330px] rounded-[6px]`}
              // className={`${styles.description_menu} shadow-all-md border-real-with-shadow pointer-events-none fixed z-[3500] flex min-h-max flex-col rounded-[6px]`}
              // style={{
              //   top: `${openPopupMenu.y}px`,
              //   ...(openPopupMenu?.displayX === "right" && {
              //     left: `${openPopupMenu.x}px`,
              //     maxWidth: `${openPopupMenu.maxWidth}px`,
              //   }),
              //   ...(openPopupMenu?.displayX === "left" && {
              //     right: `${openPopupMenu.x}px`,
              //     maxWidth: `${openPopupMenu.maxWidth}px`,
              //   }),
              // }}
            >
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <span className="mr-[24px]">編集モード</span>
                {isEditMode.includes("working_to_closing") && editWorkingDaysMapObj.size > 0 && (
                  <span className={`text-[var(--color-text-brand-f)]`}>{editWorkingDaysMapObj.size}件選択中</span>
                )}
                {isEditMode.includes("closing_to_working") && editClosingDaysArray.length > 0 && (
                  <span className={`text-[var(--color-text-brand-f)]`}>{editClosingDaysArray.length}件選択中</span>
                )}
              </h3>

              <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                以下の２つの編集モードを選択後、営業カレンダーから日付を選択して適用することで「営業日から休日へ」または「休日から営業日へ」個別に変更が可能です。
              </p>

              <hr className="min-h-[1px] w-full bg-[#999]" />

              {/* ---------------------------- メニューコンテンツエリア ---------------------------- */}
              <div className={`${styles.scroll_container} flex max-h-[240px] w-full flex-col overflow-y-auto`}>
                <ul className={`flex h-full w-full flex-col`}>
                  {/* ------------------------------------ */}
                  <li
                    className={`${styles.list} ${styles.edit_mode} ${
                      isEditMode.includes("working_to_closing") ? `${styles.active}` : ``
                    }`}
                    onMouseEnter={(e) => {
                      // if (infoIconStepRef.current && infoIconStepRef.current.classList.contains(styles.animate_ping)) {
                      //   infoIconStepRef.current.classList.remove(styles.animate_ping);
                      // }
                      handleOpenPopupMenu({ e, title: "working_to_closing", displayX: "left" });
                    }}
                    onMouseLeave={() => {
                      if (openPopupMenu) handleClosePopupMenu();
                    }}
                    onClick={() => {
                      if (isEditMode.includes("working_to_closing")) {
                        setIsEditMode([]);
                      } else {
                        setIsEditMode(["working_to_closing"]);
                      }
                      if (openPopupMenu) handleClosePopupMenu();
                    }}
                  >
                    <div className="pointer-events-none flex w-full min-w-[110px] items-center justify-start">
                      <MdOutlineDataSaverOff className="mr-[36px] min-h-[20px] min-w-[20px] text-[20px]" />
                      <div className="flex w-full select-none items-center justify-start space-x-[39px] text-[16px] font-bold">
                        <span className={`${styles.working_day}`}>営業日</span>
                        <FaLongArrowAltRight
                          className={`${styles.arrow_icon} pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px]`}
                        />
                        <span className={`${styles.closing_day}`}>休日</span>
                      </div>
                    </div>
                  </li>
                  {/* ------------------------------------ */}

                  <hr className="min-h-[1px] w-full bg-[#666]" />

                  {/* ------------------------------------ */}
                  <li
                    className={`${styles.list} ${styles.edit_mode} rounded-b-[6px] ${
                      isEditMode.includes("closing_to_working") ? `${styles.active}` : ``
                    }`}
                    onMouseEnter={(e) => {
                      // if (infoIconStepRef.current && infoIconStepRef.current.classList.contains(styles.animate_ping)) {
                      //   infoIconStepRef.current.classList.remove(styles.animate_ping);
                      // }
                      handleOpenPopupMenu({ e, title: "closing_to_working", displayX: "left" });
                    }}
                    onMouseLeave={() => {
                      if (openPopupMenu) handleClosePopupMenu();
                    }}
                    onClick={() => {
                      if (isEditMode.includes("closing_to_working")) {
                        setIsEditMode([]);
                      } else {
                        setIsEditMode(["closing_to_working"]);
                      }
                      if (openPopupMenu) handleClosePopupMenu();
                    }}
                  >
                    <div className="pointer-events-none flex w-full min-w-[110px] items-center justify-start">
                      <MdOutlineDataSaverOff className="mr-[36px] min-h-[20px] min-w-[20px] text-[20px]" />
                      <div className="flex w-full select-none items-center justify-start space-x-[39px] text-[16px] font-bold">
                        <span className={`${styles.closing_day}`}>休日</span>
                        <FaLongArrowAltRight
                          className={`${styles.arrow_icon} pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px]`}
                        />
                        <span className={`${styles.working_day}`}>営業日</span>
                      </div>
                    </div>
                  </li>
                  {/* ------------------------------------ */}
                </ul>
              </div>
              <div
                className={`${styles.settings_menu} ${styles.edit_mode} ${styles.fade_up} z-[3000] h-auto w-[330px] overflow-hidden rounded-[6px]`}
                style={{ position: "absolute", bottom: "-70px", left: 0 }}
              >
                <li className={`${styles.list} ${styles.btn_area} space-x-[20px]`}>
                  <div
                    className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${
                      ((isEditMode.includes("working_to_closing") && editWorkingDaysMapObj.size > 0) ||
                        (isEditMode.includes("closing_to_working") && editClosingDaysArray.length > 0)) &&
                      styles.active
                    }`}
                    onClick={() => {
                      handleUpdateDaysStatus();
                    }}
                  >
                    <span>適用</span>
                  </div>
                  <div
                    className={`transition-bg02 ${styles.edit_btn} ${styles.cancel}`}
                    onClick={() => {
                      // handleCloseEditModePopup();
                      if (
                        isOpenEditModePopup &&
                        !isEditMode.includes("working_to_closing") &&
                        !isEditMode.includes("closing_to_working")
                      ) {
                        handleCloseEditModePopup();
                      } else {
                        handleFinishEdit();
                      }
                    }}
                  >
                    {isOpenEditModePopup &&
                      !isEditMode.includes("working_to_closing") &&
                      !isEditMode.includes("closing_to_working") && <span>終了</span>}
                    {isOpenEditModePopup &&
                      (isEditMode.includes("working_to_closing") || isEditMode.includes("closing_to_working")) && (
                        <span>戻る</span>
                      )}
                  </div>
                </li>
              </div>
            </div>
          )}
          {/* 休日 => 営業日 or 営業日 => 休日 */}
          {/* ---------------------- 営業日休日変更ポップアップ ここまで ---------------------- */}
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
            {["guide", "step", "compressionRatio", "printTips"].includes(openPopupMenu.title) &&
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
            {!["guide", "step", "compressionRatio", "printTips"].includes(openPopupMenu.title) && (
              <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
                <p className="select-none whitespace-pre-wrap text-[12px]">
                  {openPopupMenu.title === "edit_mode" &&
                    "定休日を適用後、個別に日付を「営業日から休日へ」または「休日から営業日へ」変更が可能です。"}
                  {openPopupMenu.title === "applyClosingDays" &&
                    !!selectedFiscalYearSetting &&
                    !!statusClosingDaysSelectedYear?.updated_at &&
                    !!customerClosingDaysNameArray?.length &&
                    `${selectedFiscalYearSetting}年度の定休日は「${customerClosingDaysNameArray.join(
                      ", "
                    )}」で適用済みです。\n定休日は各会計年度で1ヶ月に1回のみ追加・変更が可能です。`}
                  {openPopupMenu.title === "applyClosingDays" &&
                    !!selectedFiscalYearSetting &&
                    !statusClosingDaysSelectedYear?.updated_at &&
                    !!customerCurrentClosingDaysNameArray?.length &&
                    `お客様の定休日は「${customerCurrentClosingDaysNameArray.join(
                      ", "
                    )}」で登録されています。これらを${selectedFiscalYearSetting}年度のカレンダーに休日として一括で適用します。\n定休日は各会計年度で1ヶ月に1回のみ追加・変更が可能です。`}
                  {openPopupMenu.title === "applyClosingDays" &&
                    !customerCurrentClosingDaysNameArray?.length &&
                    `先に「会社・チーム」画面から定休日を登録しておくことで、選択中の会計年度のカレンダーに休日として一括で適用できます。`}
                  {openPopupMenu.title === "displayFiscalYear" &&
                    `選択中の会計年度の営業カレンダーを表示します。\n会計年度は2020年から当年度まで選択可能で、翌年度のカレンダーはお客様の決算日から現在の日付が3ヶ月を切ると表示、設定、編集が可能となります。`}
                  {openPopupMenu.title === "working_to_closing" &&
                    `「営業日 → 休日」を選択後、カレンダーから会計期間内の営業日を選択して下の適用ボタンをクリックすることで休日へ変更できます。\n日付は複数選択して一括で更新が可能です。`}
                  {openPopupMenu.title === "closing_to_working" &&
                    `「休日 → 営業日」を選択後、カレンダーから会計期間内の休日を選択して下の適用ボタンをクリックすることで営業日へ変更できます。\n日付は複数選択して一括で更新が可能です。`}
                  {openPopupMenu.title === "pdf" &&
                    "現在プレビューで表示されている見積書をPDFファイル形式でダウンロードします。ダウンロードに十数秒程度の時間がかかります。"}
                  {openPopupMenu.title === "printSize" &&
                    "印刷・PDFサイズを「A4〜A7」の範囲で変更が可能です。それぞれサイズに応じた使用用途は下記の通りです。\n\n・A4：公的文書、ビジネスに用いられる資料、契約書（210 × 297 mm）\n・A5：雑誌、ノート（148 × 210 mm）\n・A6：文庫本、手帳（105 × 148 mm）\n・A7：ワイシャツの胸ポケットに入る小型のメモ帳・手帳の中に入れるカレンダー（74 × 105 mm）"}
                  {openPopupMenu.title === "print" &&
                    "印刷ボタンクリック後に印刷ダイアログが開かれた後、「詳細設定」の「余白」を「なし」に切り替えることで綺麗に印刷ができます。また、「用紙サイズ」のそれぞれの選択肢については下記の通りです。"}
                </p>
              </li>
            )}
            {openPopupMenu.title === "print" && <hr className="mb-[6px] min-h-[1px] w-full bg-[#666]" />}
            {openPopupMenu.title === "print" &&
              descriptionPrintTips.map((obj, index) => (
                <li key={obj.title} className={`flex w-full space-x-[3px] px-[14px] py-[3px] text-[12px]`}>
                  <span className="min-w-[80px] max-w-[80px] font-bold">・{obj.title}：</span>
                  <p className="whitespace-pre-wrap">{obj.content}</p>
                </li>
              ))}
            {/* {openPopupMenu.title === "print" && (
              <>
                <li className={`flex w-full space-x-[3px] px-[14px] py-[3px] text-[12px]`}>
                  <span>・A4：</span>
                  <p className="whitespace-pre-wrap">国際標準の紙のサイズ(210x297mm)</p>
                </li>
                <li className={`flex w-full space-x-[3px] px-[14px] py-[3px] text-[12px]`}>
                  <span className="min-w-max">・A4：</span>
                  <p className="whitespace-pre-wrap">
                    A4サイズの半分の大きさ(148x210mm)で、ノートや小冊子によく使用されます。
                  </p>
                </li>
              </>
            )} */}
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
          sectionP1={
            showConfirmApplyClosingDayModal === "Update"
              ? `${
                  customerCurrentClosingDaysNameArray?.length
                    ? `定休日を「${customerCurrentClosingDaysNameArray?.join(", ")}」に更新します。`
                    : ``
                }設定した休日に基づいてお客様の年間の営業稼働日数が算出され、年度・半期・四半期・月度ごとの各プロセスの正確なデータ分析が可能になります。`
              : `${
                  customerCurrentClosingDaysNameArray?.length
                    ? `「${customerCurrentClosingDaysNameArray?.join(", ")}」を休日に追加します。`
                    : ``
                }設定した休日に基づいてお客様の年間の営業稼働日数が算出され、年度・半期・四半期・月度ごとの各プロセスの正確なデータ分析が可能になります。`
          }
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
