import { Suspense, memo, useEffect, useRef, useState } from "react";
import styles from "./QuotationPreviewModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { MdEdit, MdLocalPrintshop, MdOutlineDataSaverOff } from "react-icons/md";
import { LuSettings, LuSettings2 } from "react-icons/lu";
import { FiDownload } from "react-icons/fi";
import { IoChevronForward, IoClose } from "react-icons/io5";
import { format } from "date-fns";
import useStore from "@/store";
import axios from "axios";
import { toast } from "react-toastify";
import NextImage from "next/image";
// import NextImage from "next/legacy/image";
import { jsPDF } from "jspdf";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { PDFComponent } from "./PDFComponent";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { Quotation_row_data } from "@/types";
import html2canvas from "html2canvas";
import { toPng, toSvg } from "html-to-image";
import { ToggleSwitch } from "@/components/Parts/ToggleSwitch/ToggleSwitch";
import { CiEdit } from "react-icons/ci";

const amountTitleArray = ["合", "計", "金", "額"];

const dealDisplayContent = (columnName: string, obj: Quotation_row_data & { [key: string]: any }) => {
  switch (columnName) {
    case "deadline":
      return productsArray[columnName];
      break;
    case "delivery_place":
      return productsArray[columnName];
      break;
    case "payment_terms":
      return productsArray[columnName];
      break;
    case "expiration_date":
      return productsArray[columnName];
      break;

    default:
      return obj[columnName];
      break;
  }
};

const logoSrc = "/assets/images/Trustify_logo_white1.png";
const hankoSrc = "/assets/images/icons/saito.png";
// const logoSrc =
//   theme === "light" ? "/assets/images/Trustify_logo_white1.png" : "/assets/images/Trustify_logo_black.png";

const columnHeaderTitleArray = ["product_name", "unit_quantity", "unit_price", "amount"];

const productsArray: { [key: string]: any } = [
  {
    id: "1-1",
    product_name: "画像測定器",
    outside_name: "IX-9000/9030T",
    unit_quantity: 1,
    unit_price: 6295000,
    amount: 6295000,
  },
  {
    id: "2-1",
    product_name: "IXエディタソフト",
    outside_name: "IX-H1E",
    unit_quantity: 1,
    unit_price: 200000,
    amount: 200000,
  },
  {
    id: "3-1",
    product_name: "データ転送ソフト",
    outside_name: "IX-H1T",
    unit_quantity: 1,
    unit_price: 150000,
    amount: 150000,
  },
  {
    id: "4-1",
    product_name: "強化ステージガラス",
    outside_name: "IX-SG2",
    unit_quantity: 1,
    unit_price: 150000,
    amount: 150000,
  },
];

const displayValue = (columnName: string, obj: Quotation_row_data & { [key: string]: any }) => {
  switch (columnName) {
    case "product_name":
      return productsArray[columnName];
      break;
    case "unit_quantity":
      return productsArray[columnName];
      break;
    case "unit_price":
      return productsArray[columnName];
      break;
    case "amount":
      return productsArray[columnName];
      break;

    default:
      return obj[columnName];
      break;
  }
};

const formatDisplayPrice = (price: number | string, language: string = "ja"): string => {
  switch (language) {
    case "ja":
      const priceNum = typeof price === "number" ? price : Number(price);
      // return formatToJapaneseYen(priceNum, true, false);
      return priceNum.toLocaleString();
      break;
    default:
      return typeof price === "number" ? price.toString() : price;
      break;
  }
};

const getScale = (currentHeight: number) => {
  if (currentHeight > 788) {
    return currentHeight / 788;
  } else {
    return 1;
  }
};

type CorporateSealObj = { url: string | null; isPrint: boolean };
type StampObj = { url: string | null; isPrint: boolean; isFrame: boolean };
type CompressionRatio = "NONE" | "FAST" | "SLOW";

const initialShippingRemarksText = `※当日出荷は弊社営業稼働日の14時までにご発注いただいた場合に対応させていただきます。`;
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

// 見積もり設定メニュー関連
// const descriptionCompressionRatio = [
//   <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
//     <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>高解像度 / 重</span>
//     <p className="select-none text-[12px]">
//       圧縮を行わずにPDFに変換するため、画像を最高品質の状態でPDFに保存、印刷が可能ですが、ファイルサイズが大きいのが特徴です。
//     </p>
//   </li>,
//   <li className={`${styles.dropdown_list_item} flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 `}>
//     <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>中解像度 / 中</span>
//     <p className="select-none text-[12px]">
//       画像を高品質に保った状態でファイルサイズも小さくします。印刷やPDFデータの送受信などどちらでもバランスよく活用できます。
//     </p>
//   </li>,
//   <li className={`${styles.dropdown_list_item} flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 `}>
//     <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>低解像度 / 軽</span>
//     <p className="select-none text-[12px]">
//       より高い圧縮率でファイルサイズを最小限に軽量化できますが、画質が劣化する可能性があります。
//     </p>
//   </li>,
// ];
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

const FallbackPreview = () => {
  return <SpinnerComet w="56px" h="56px" s="5px" />;
};

const QuotationPreviewModalMemo = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const isOpenQuotationPreviewModal = useDashboardStore((state) => state.isOpenQuotationPreviewModal);
  const setIsOpenQuotationPreviewModal = useDashboardStore((state) => state.setIsOpenQuotationPreviewModal);
  const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);

  // gridテーブルのrefオブジェクト
  const gridTableRef = useRef<HTMLDivElement | null>(null);
  // pdfのrefオブジェクト
  // const pdfRef = useRef<jsPDF>(new jsPDF());
  const pdfTargetRef = useRef<HTMLDivElement | null>(null);
  // const [isLoadingPDF, setIsLoadingPDF] = useState(true);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pdfURL, setPdfURL] = useState<string | null>(null);

  const [tableRowCount, setTableRowCount] = useState<number>(2);
  const [isDiscount, setIsDiscount] = useState(true);

  // 見積もり備考欄サンプルテキスト
  const noteTextSample = `見積No. 123456789012をご発注いただいた場合に限り適用となります。\n※上記は2021年9月15日までのご発注、16日までに商品を出荷させていただけた場合に限る今回限りの貴社向け特別価格となります。`;

  // -------------------- 🌟各種設定項目State (圧縮率, 末尾備考欄のテキスト、角印の表示有無など)🌟 --------------------
  // セッティングメニュー
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  // エディットモード 見積備考、末尾の出荷に関する説明欄
  const [isEditMode, setIsEditMode] = useState<string[]>([]);
  // 画像をPDF化する際の圧縮率3段階を指定
  const [compressionRatio, setCompressionRatio] = useState<CompressionRatio>("FAST");
  // 法人印の表示有無
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(userProfileState?.logo_url || null);
  const [isPrintCompanyLogo, setIsPrintCompanyLogo] = useState<boolean>(userProfileState?.logo_url ? true : false);
  // 法人印の表示有無
  const [corporateSealUrl, setCorporateSealUrl] = useState<string | null>(userProfileState?.customer_seal_url || null);
  const [isPrintCorporateSeal, setIsPrintCorporateSeal] = useState<boolean>(
    selectedRowDataQuotation?.use_corporate_seal ?? false
  );

  // 担当印鑑
  const [isPrintInChargeStamp, setIsPrintInChargeStamp] = useState<boolean>(
    selectedRowDataQuotation?.in_charge_stamp_flag ? true : false
  );
  const [isFrameInChargeStamp, setIsFrameInChargeStamp] = useState<boolean>(
    selectedRowDataQuotation?.in_charge_stamp_flag ? true : false
  );
  // 上長印1
  const [isPrintSupervisorStamp1, setIsPrintSupervisorStamp1] = useState<boolean>(
    selectedRowDataQuotation?.supervisor1_stamp_flag ? true : false
  );
  const [isFrameSupervisorStamp1, setIsFrameSupervisorStamp1] = useState<boolean>(
    selectedRowDataQuotation?.supervisor1_stamp_flag ? true : false
  );
  // 上長印2
  const [isPrintSupervisorStamp2, setIsPrintSupervisorStamp2] = useState<boolean>(
    selectedRowDataQuotation?.supervisor2_stamp_flag ? true : false
  );
  const [isFrameSupervisorStamp2, setIsFrameSupervisorStamp2] = useState<boolean>(
    selectedRowDataQuotation?.supervisor2_stamp_flag ? true : false
  );
  // 末尾の出荷に関する説明欄
  const [shippingRemarks, setShippingRemarks] = useState<string>(initialShippingRemarksText);
  // 見積備考
  // const [notesText, setNotesText] = useState(selectedRowDataQuotation?.quotation_notes || "");
  const [notesText, setNotesText] = useState(noteTextSample);
  // 納期
  // const [deadlineText, setDeadlineText] = useState(selectedRowDataQuotation?.deadline || "");
  const [deadlineText, setDeadlineText] = useState("当日出荷");
  // 受取場所
  // const [deliveryPlaceText, setDeliveryPlaceText] = useState(selectedRowDataQuotation?.delivery_place || "");
  const [deliveryPlaceText, setDeliveryPlaceText] = useState("貴社指定場所");
  // 受取場所
  // const [paymentTermsText, setPaymentTermsText] = useState(selectedRowDataQuotation?.payment_terms || "");
  const [paymentTermsText, setPaymentTermsText] = useState("従来通り");
  // 有効期限
  // const [expireDateText, setExpireDateText] = useState(
  //   selectedRowDataQuotation?.expiration_date
  //     ? format(new Date(selectedRowDataQuotation?.expiration_date), "yyyy年MM月dd日")
  //     : ""
  // );
  const [expireDateText, setExpireDateText] = useState("2021年9月15日");

  // 納期、受取場所、取引方法、有効期限
  const dealTitleArray = [
    {
      title: "deadline",
      jpTitle: "納期",
      titleLetterArray: ["納", "期"],
      state: deadlineText,
      dispatch: setDeadlineText,
    },
    {
      title: "delivery_place",
      jpTitle: "受渡場所",
      titleLetterArray: ["受", "渡", "場", "所"],
      state: deliveryPlaceText,
      dispatch: setDeliveryPlaceText,
    },
    {
      title: "payment_terms",
      jpTitle: "取引方法",
      titleLetterArray: ["取", "引", "方", "法"],
      state: paymentTermsText,
      dispatch: setPaymentTermsText,
    },
    {
      title: "expiration_date",
      jpTitle: "有効期限",
      titleLetterArray: ["有", "効", "期", "限"],
      state: expireDateText,
      dispatch: setExpireDateText,
    },
  ];

  // 🌟印鑑データ配列
  const stampsArray = [
    // { title: "in_charge", url: selectedRowDataQuotation?.in_charge_stamp_image_url ?? null, isPrint: isPrintInChargeStamp, isFrame: isFrameInChargeStamp },
    { title: "in_charge", url: hankoSrc, isPrint: isPrintInChargeStamp, isFrame: isFrameInChargeStamp },
    {
      title: "supervisor1",
      url: selectedRowDataQuotation?.supervisor1_stamp_image_url ?? null,
      isPrint: isPrintSupervisorStamp1,
      isFrame: isFrameSupervisorStamp1,
    },
    {
      title: "supervisor2",
      url: selectedRowDataQuotation?.supervisor2_stamp_image_url ?? null,
      isPrint: isPrintSupervisorStamp2,
      isFrame: isFrameSupervisorStamp2,
    },
  ];

  // -------------------------- 🌟印鑑データ関連useEffect🌟 --------------------------
  useEffect(() => {
    // 担当印がfalseになったら、担当印以上の上長印1と2をfalseに変更する
    if (!isFrameInChargeStamp) {
      if (isFrameSupervisorStamp1) setIsFrameSupervisorStamp1(false);
      if (isFrameSupervisorStamp2) setIsFrameSupervisorStamp2(false);
    }
    if (!isFrameSupervisorStamp1) {
      if (isFrameSupervisorStamp2) setIsFrameSupervisorStamp2(false);
    }
  }, [isFrameInChargeStamp, isFrameSupervisorStamp1]);
  // -------------------------- ✅印鑑データ関連useEffect✅ --------------------------

  const stampFrameDisplayCount = stampsArray.filter((obj) => obj.isFrame).length;
  console.log("🔥stampFrameDisplayCount", stampFrameDisplayCount);

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
  // -------------------------- 🌟ポップアップメニュー🌟 --------------------------
  const [openPopupMenu, setOpenPopupMenu] = useState<{ y: number; title: string } | null>(null);
  const mappingPopupTitle: { [key: string]: { [key: string]: string } } = {
    compressionRatio: { en: "Compression Ratio", ja: "解像度" },
  };
  type PopupMenuParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    title: string;
  };
  const handleOpenPopupMenu = ({ e, title }: PopupMenuParams) => {
    const { y, height } = e.currentTarget.getBoundingClientRect();
    setOpenPopupMenu({
      y: y - height / 2,
      title: title,
    });
  };
  const handleClosePopupMenu = () => {
    setOpenPopupMenu(null);
  };
  // -------------------------- ✅ポップアップメニュー✅ --------------------------

  // 会社ロゴのフルURLを取得
  // const { fullUrl: logoUrl, isLoading: isLoadingLogoImg } = useDownloadUrl(
  //   userProfileState?.logo_url,
  //   "customer_company_logos"
  // );

  // -------------------------- 🌟初回マウント時🌟 --------------------------
  // useEffect(() => {
  //   if (!isLoadingPDF) return;
  //   console.log("useEffect実行");
  //   setTimeout(() => {
  //     setIsLoadingPDF(false);
  //     if (pdfTargetRef.current) {
  //       pdfTargetRef.current.classList.add(styles.mounted);
  //       console.log("タイマー関数 mounted追加");
  //     }
  //   }, 1500);
  // }, []);

  // pdfファイル名の取得関数
  const getPdfFileName = () => {
    const title = selectedRowDataQuotation?.quotation_title ?? "";
    const companyName = selectedRowDataQuotation?.company_name ? `_${selectedRowDataQuotation?.company_name}` : "";
    const currentDate = format(new Date(), "yyMMddHHmmss");
    const fileName = title ? `${title}.pdf` : `見積書${companyName}_${currentDate}.pdf`;
    return fileName;
  };

  // -------------------------- 🌟PDFファイルのダウンロード🌟 --------------------------
  const handleDownloadPDF = () => {
    if (!selectedRowDataQuotation) return;
    if (!pdfURL) return alert("prfファイルが取得できませんでした。");
    const title = selectedRowDataQuotation?.quotation_title;
    const companyName = selectedRowDataQuotation.company_name;
    const currentDate = format(new Date(), "yyMMddHHmmss");
    const fileName = title ? `${title}.pdf` : `御見積書_${companyName}_${currentDate}.pdf`;
    console.log("currentDate", currentDate, "fileName", fileName);
    // return;

    // 新しい a タグを作成
    const link = document.createElement("a");
    link.href = pdfURL;
    link.download = fileName;

    // body に追加してクリックイベントを発火
    document.body.appendChild(link);
    link.click();

    // 不要になった a タグを削除
    document.body.removeChild(link);
  };
  // -------------------------- ✅PDFファイルのダウンロード✅ --------------------------

  // -------------------------- 🌟PDFファイルのダウンロード html => pdf🌟 --------------------------
  const handleSaveImageToPdf = async () => {
    if (!pdfTargetRef.current) return alert("pdfデータの取得に失敗しました。");

    console.log("pdfTargetRef.current", pdfTargetRef.current);

    setIsLoading(true);

    try {
      // スケールを1に戻す
      if (scalePdf > 1) {
        pdfTargetRef.current.style.transform = `scale(1)`;
      }

      // 3. jsPDFインスタンスjの生成
      const doc = new jsPDF({
        orientation: "p", // p:縦向き, l:横向き
        unit: "mm", // mm: ミリメートル, 他には, cm,in,px,pc,em,ex, pxで指定する場合、optionのhotfixesを指定
        format: "a4", // PDFのページフォーマット a4:A4サイズ
      });
      // const pdf = new jsPDF()

      // DOM要素をpng画像に変換
      // const image = await toPng(pdfTargetRef.current); // 成功
      const image = await toPng(pdfTargetRef.current, {
        quality: 1.0, // 0から1のはんいで品質を指定
        pixelRatio: 2, // 画像のピクセル密度を指定
      });

      // イメージをPDFに追加*2 元々の素材となるDOM要素のレイアウト比を保った状態で画像に変換 もし素材の縦幅がA4の縦横比よりも短い場合は変換後のPDFの下側が空白となる。
      // doc.addImage(image, "PNG", 0, 0, 210, 0, "", "FAST"); // 成功
      // 第八引数の圧縮レベルは下記3つ選択 高品質を保ちたい場合はNONEかFAST、メールなどの送信でのサイズ容量を少なくする場合はSLOWを指定
      // ・FAST: 低圧縮 => 143KB
      // ・SLOW: 高圧縮 => 161KB
      // ・NONE: 圧縮なし => 6MB
      doc.addImage(image, "PNG", 0, 0, 210, 0, "", compressionRatio); // デフォルトの圧縮率はFASTの中間

      // 5. PDFを保存
      doc.save(getPdfFileName());
    } catch (error: any) {
      console.error("PDFの取得に失敗しました: ", error);
      toast.error("PDFの取得に失敗しました...🙇‍♀️");
    }

    // スケールを現在のwindowのサイズに戻す
    if (scalePdf > 1) {
      pdfTargetRef.current.style.transform = `scale(${scalePdf})`;
    }

    setIsLoading(false);

    /*
    *2
    ここでの210は、PDF内でのイメージの幅をミリメートル(mm)単位で指定しており、X,Y座標（この場合は0, 0で左上の角）から右方向に210mmの幅でイメージを配置することを意味します。この幅は、変換されるDOM要素の実際のサイズやアスペクト比に基づいて、イメージが拡大・縮小されることを意味するものであり、特定のエリアを変換するというよりは、イメージ全体をこの幅に合わせて配置することを意味します。
    
    高さを0に指定することで、指定された幅に対してオリジナルのアスペクト比を保持した状態でイメージを自動的にスケーリングし、適切な高さを自動計算します。したがって、210, 0とすることで、イメージは幅210mm、高さはアスペクト比に基づいて自動的に設定されます。

    doc.addImage(image, 'PNG', 0, 0, 210, 0, '', 'FAST')で指定された場合、第6引数に0を指定しているため、イメージの高さは自動的に計算され、変換前の素材（DOM要素）のアスペクト比が保持されます。その結果、変換前の素材の縦横比がA4サイズの縦横比より短い場合、PDF内でイメージは指定された横幅（この場合は210mm）に合わせてスケールされ、高さは自動的にアスペクト比を保持する形で調整されます。このとき、変換後のPDFの縦幅に合わせて素材のDOM要素の縦幅が伸びることはありません。

    したがって、「変換後のPDFの足りない下側が空白になる」という結果になります。つまり、変換前の素材の縦横比によっては、PDFのページ内の一部分が空白として残る可能性があります。これは、変換されたイメージがPDFページの横幅を満たしても、縦幅を完全には占めないためです。この空白部分は、変換前の素材のアスペクト比に依存します。
    */
  };
  // -------------------------- ✅PDFファイルのダウンロード html => pdf✅ --------------------------
  // // -------------------------- 🌟PDFファイルのダウンロード html => pdf🌟 --------------------------
  // const handleSavePdf = async () => {
  //   if (!pdfTargetRef.current) return alert("pdfデータの取得に失敗しました。");

  //   setIsLoading(true);

  //   pdfTargetRef.current.style.transform = `scale(1)`;

  //   // 1. html2canvasを使用してDOMをcanvasに変換
  //   const canvas = await html2canvas(pdfTargetRef.current, { scale: 2 });
  //   // 2. canvasから画像データを取得(canvasをpng画像の形式でエンコードしたBase64エンコーディング文字列を生成)
  //   const imgData = canvas.toDataURL("image/png");
  //   // 3. jsPDFインスタンスjの生成
  //   const pdf = new jsPDF({
  //     orientation: "p", // p:縦向き, l:横向き
  //     unit: "mm", // mm: ミリメートル, 他には, cm,in,px,pc,em,ex, pxで指定する場合、optionのhotfixesを指定
  //     format: "a4", // PDFのページフォーマット a4:A4サイズ
  //   });
  //   // const pdf = new jsPDF()
  //   // 4. 画像データをPDFに追加
  //   // 4-1. 画像データから幅と高さのプロパティを取得
  //   // const imgProps = pdf.getImageProperties(imgData);
  //   // 4-2. PDFのページ幅を取得
  //   const pdfWidth = pdf.internal.pageSize.getWidth();
  //   // 4-3. 画像の縦横比を維持しつつ、PDFの幅に合わせて画像の高さを計算
  //   // const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  //   // 4-4. pdf.getImageProperties()で取得した画像データをaddImage()でPDFに追加
  //   // addImageの引数指定は、画像データ, データの形式, 画像の位置(左上のx,y座標)とサイズ(幅、高さ)を指定
  //   // pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  //   pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, 0);
  //   // 5. PDFを保存
  //   pdf.save(getPdfFileName());

  //   setIsLoading(false);

  //   // pdf.html(pdfTargetRef.current, {
  //   //   filename: getPdfFileName(),
  //   //   callback: (doc) => {
  //   //     doc.save();
  //   //   },
  //   // });
  // };
  // // -------------------------- ✅PDFファイルのダウンロード html => pdf✅ --------------------------

  // -------------------------- 🌟モーダルを閉じる関数🌟 --------------------------
  const handleClosePreviewModal = () => {
    if (pdfURL) {
      URL.revokeObjectURL(pdfURL);
    }
    setIsOpenQuotationPreviewModal(false);
    if (hoveredItemPos) handleCloseTooltip();
  };
  // -------------------------- ✅モーダルを閉じる関数✅ --------------------------

  // window.open(fileURL, '_blank')

  // -------------------------- 🌟プリントアウト関数🌟 --------------------------
  const handlePrint = () => {
    setIsLoadingPDF(true);

    setTimeout(() => {
      setIsLoadingPDF(false);
    }, 1500);
  };
  // -------------------------- ✅プリントアウト関数✅ --------------------------
  // -------------------------- 🌟全てのフィールドを編集モードに変更🌟 --------------------------
  const handleAllEdit = () => {
    if (isEditMode.length === 0) {
      const allEdit = [
        "quotation_notes",
        "shipping_remarks",
        "deadline",
        "delivery_place",
        "payment_terms",
        "expiration_date",
      ];
      setIsEditMode(allEdit);
    } else {
      setIsEditMode([]);
    }
    if (hoveredItemPos) handleCloseTooltip();
  };
  // -------------------------- ✅全てのフィールドを編集モードに変更✅ --------------------------

  // -------------------------- 🌟セッティングメニュー開閉🌟 --------------------------
  const handleOpenSettings = () => {
    setIsOpenSettings(true);
  };
  const handleCloseSettings = () => {
    setIsOpenSettings(false);
  };
  // -------------------------- ✅セッティングメニュー開閉✅ --------------------------

  // -------------------------- 🌟pdfのスケールリサイズイベント🌟 --------------------------
  const [scalePdf, setScalePdf] = useState(window.innerHeight / 788);
  useEffect(() => {
    const handleResize = () => {
      setScalePdf(getScale(window.innerHeight));
    };

    window.addEventListener("resize", handleResize);

    // コンポーネントのアンマウント時にイベントリスナーを削除
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // -------------------------- ✅pdfのスケールリサイズイベント✅ --------------------------

  const isEditingHidden = { ...(isEditMode.length > 0 && { display: "none" }) };

  // Webページ上で直接プリントアウト window.print()
  console.log("🌠PDFプレビューモーダル レンダリング pdfURL", pdfURL);

  return (
    <>
      {/* オーバーレイ */}
      <div className={`${styles.overlay} fade03`} onClick={handleClosePreviewModal}></div>

      {isLoading && (
        <div className={`${styles.loading_overlay}`}>
          <div className={`${styles.loading_pdf} flex-center bg-[#fff]`}>
            <SpinnerComet w="56px" h="56px" s="5px" />
          </div>
        </div>
      )}
      {/* Suspenseとfallbackとローディングを使用する */}
      {/* プレビューモーダルエリア */}
      <div className={`${styles.preview_modal_area}`}>
        {/* プレビューモーダル */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackPreview />}>
            <div
              // className={`${styles.preview_modal_iframe} ${isLoadingPDF || !pdfURL ? `${styles.loading_pdf}` : ``} `}
              // className={`${styles.preview_modal} ${isLoadingPDF || !pdfURL ? `${styles.loading_pdf}` : ``} `}
              className={`${styles.preview_modal} ${isLoadingPDF ? `${styles.loading_pdf}` : ``} `}
            >
              {/* ---------------------- iframe PDFプレビューエリア ---------------------- */}
              {/* {!isLoadingPDF && pdfURL && <iframe id="pdf-iframe" src={pdfURL || ""} className={`h-full w-full `} />} */}
              {/* {!isLoadingPDF && pdfURL && <PDFComponent />} */}
              <div
                ref={pdfTargetRef}
                // className={`${styles.pdf} ${isLoading ? `opacity-0` : ``}`}
                className={`${styles.pdf}`}
                style={{ transform: `scale(${scalePdf})` }}
              >
                <div className={`${styles.top_margin} w-full bg-[red]/[0]`}></div>
                <div className={`${styles.header_area} flex-center relative h-[6%] w-full bg-[aqua]/[0]`}>
                  <h1 className={`${styles.header} font-semibold`}>御見積書</h1>
                  <div
                    className={`${styles.header_right} absolute right-0 top-0 flex h-full flex-col items-end justify-end bg-[yellow]/[0] text-[8px]`}
                  >
                    <span>No. 123456789012</span>
                    <span>2021年9月6日</span>
                  </div>
                </div>

                <div className={`${styles.detail_area} flex bg-[#dddddd00]`}>
                  <div className={`${styles.detail_left_area} flex flex-col `}>
                    <div className={`${styles.company_name_area} flex flex-col justify-end bg-[red]/[0]`}>
                      <h3 className={`${styles.company_name} space-x-[6px] text-[9px] font-medium`}>
                        <span>株式会社ジーエンス</span>
                        <span>御中</span>
                      </h3>
                      <div className={`${styles.section_underline}`} />
                    </div>

                    <div className={`${styles.deal_detail_area} bg-[white]/[0]`}>
                      <p className={`${styles.description} bg-[white]/[0]`}>御照会の件下記の通りお見積り申し上げます</p>
                      <div className={`${styles.row_group_container} bg-[white]/[0]`}>
                        {dealTitleArray.map((obj, index) => (
                          <div key={obj.jpTitle} className={`${styles.row_area} flex items-end`}>
                            <div className={`${styles.title} flex justify-between`}>
                              {obj.titleLetterArray.map((letter) => (
                                <span key={letter}>{letter}</span>
                              ))}
                            </div>
                            {!isEditMode.includes(obj.title) && (
                              <div className={`${styles.deal_content} truncate`}>
                                {/* {obj.title === "deadline" && <span>当日出荷</span>}
                              {obj.title === "delivery_place" && <span>貴社指定場所</span>}
                              {obj.title === "payment_terms" && <span>従来通り</span>}
                              {obj.title === "expiration_date" && <span>2021年9月15日</span>} */}
                                <span>{obj.state}</span>
                              </div>
                            )}
                            {isEditMode.includes(obj.title) && (
                              <div className={`${styles.deal_content}`}>
                                <input
                                  className={`${styles.input_box} ${styles.deal_content} truncate`}
                                  value={obj.state}
                                  onChange={(e) => obj.dispatch(e.target.value)}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className={`${styles.total_amount_area} flex flex-col justify-end bg-[yellow]/[0]`}>
                      <div className={`flex h-full w-full items-end`}>
                        <div className={`text-[13px] ${styles.amount_title}`}>
                          {amountTitleArray.map((letter) => (
                            <span key={letter}>{letter}</span>
                          ))}
                        </div>
                        <div className={`text-[13px] ${styles.amount_content} flex items-end`}>
                          <span>￥6,000,000-</span>
                        </div>
                      </div>
                      <div className={`${styles.section_underline}`} />
                    </div>
                  </div>

                  <div className={`${styles.detail_right_area} flex flex-col bg-[#02f929]/[0]`}>
                    <div className={`${styles.customer_detail_area} bg-[yellow]/[0]`}>
                      <div className={`${styles.customer_info_area} flex flex-col`}>
                        {isPrintCompanyLogo && companyLogoUrl && (
                          <div className={`${styles.company_logo_area} flex items-end justify-start bg-[white]/[0]`}>
                            <div
                              // className={`relative flex h-[90%] w-[50%] items-end justify-start bg-[yellow]/[0] ${styles.logo_container}`}
                              className={`relative flex h-[100%] w-[56%] items-end justify-start bg-[yellow]/[0] ${styles.logo_container}`}
                            >
                              {/* <NextImage
                                src={logoSrc}
                                alt=""
                                className="h-full w-full object-contain object-bottom"
                                // width={}
                                fill
                                sizes="100px"
                              /> */}
                              <div className={`${styles.logo_img}`}></div>
                            </div>
                          </div>
                        )}
                        {!isPrintCompanyLogo && <div className="h-[10%] w-full"></div>}
                        <div className={`${styles.company_name_area}`}>
                          <span className={`${styles.company_name} flex items-center`}>
                            <span className="mr-[1%] pt-[0.5%] text-[9px]">株式会社</span>
                            <span className="text-[12px]">トラスティファイ</span>
                          </span>
                        </div>
                        <div className={`${styles.user_info_area} flex flex-col`}>
                          <div className={`${styles.row_area}  flex items-end`}>
                            <span>マイクロスコープ事業部</span>
                          </div>
                          <div className={`${styles.row_area} flex items-center`}>
                            <div className={`min-w-[50%]`}>
                              <span className={``}>東京営業所</span>
                            </div>
                            <div className={`min-w-[50%]`}>
                              <span className={``}>斎藤礼司</span>
                            </div>
                          </div>
                          <div className={`${styles.address_area} flex`}>
                            <span className={`min-w-max`}>〒123-0024</span>
                            <div className={`flex flex-col pl-[5%]`}>
                              <span>東京都港区芝浦0-0-0</span>
                              <span>シーバンスX館</span>
                            </div>
                          </div>
                          <div className={`${styles.row_area} flex items-center`}>
                            <div className="flex h-full w-[50%] items-center">
                              <span>TEL</span>
                              <span className="pl-[6%]">03-6866-1611</span>
                            </div>
                            <div className={`flex h-full w-[50%] items-center`}>
                              <span>FAX</span>
                              <span className="pl-[6%]">03-6866-1611</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* <div
                        className={`${styles.corporate_seal} absolute right-[6%] top-0 z-[0] rounded-md bg-[red]/[0.7]`}
                      ></div> */}
                      {isPrintCorporateSeal && (
                        <div
                          className={`${styles.corporate_seal_sample}  absolute right-[6%] top-0 z-[0] rounded-[4px] border-[2px] border-solid border-[red]/[0.7]`}
                        >
                          <div className={`${styles.text1}`}>株式会社</div>
                          <div className={`${styles.text2}`}>トラステ</div>
                          <div className={`${styles.text3}`}>ィファイ</div>
                        </div>
                      )}
                    </div>

                    <div className={`${styles.stamps_area} flex flex-row-reverse bg-[blue]/[0]`}>
                      <div
                        className={`${styles.stamps_outside_box} flex flex-row-reverse`}
                        style={{
                          ...(stampFrameDisplayCount > 0 && {
                            width: `${(100 * stampFrameDisplayCount) / 3}%`,
                          }),
                          ...(stampFrameDisplayCount === 0 && { display: "none" }),
                        }}
                      >
                        {stampsArray.map((obj, index) => {
                          if (!obj.isFrame) return;
                          return (
                            <div
                              key={obj.title + index.toString()}
                              className={`h-full w-full ${styles.stamp_box} flex-center`}
                            >
                              {obj.isPrint && obj.url && (
                                <div className="relative flex h-[25px] w-[25px] items-center justify-center rounded-full">
                                  <NextImage
                                    src={obj.url}
                                    alt=""
                                    className="h-full w-full object-contain"
                                    // width={}
                                    fill
                                    sizes="25px"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* <div className={`${styles.stamps_area} flex flex-row-reverse bg-[blue]/[0]`}>
                      <div
                        className={`${styles.stamps_outside_box} flex flex-row-reverse`}
                        style={{ ...(Array(2).length > 0 && { width: `${(100 * Array(2).length) / 3}%` }) }}
                      >
                       
                        {Array(2)
                          .fill(null)
                          .map((_, index) => (
                            <div key={index} className={`h-full w-full ${styles.stamp_box} flex-center`}>
                              {index === 0 && (
                                <div className="relative flex h-[25px] w-[25px] items-center justify-center rounded-full">
                                  <NextImage
                                    src={hankoSrc}
                                    alt=""
                                    className="h-full w-full object-contain"
                                    // width={}
                                    fill
                                    sizes="25px"
                                  />
                                </div>
                              )}
                              {index === 1 && (
                                <div className="flex h-[25px] w-[25px] flex-col items-center justify-center rounded-full border border-solid border-[red] py-[10%] text-[8px] text-[red]">
                                  <div className="flex flex-col items-center leading-[1.3]">
                                    <span>伊</span>
                                    <span>藤</span>
                                  </div>
                                </div>
                              )}

                              {index === 1 && (
                                <div className="flex h-[25px] w-[25px] flex-col items-center justify-center rounded-full py-[10%] text-[8px]"></div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div> */}
                  </div>
                </div>

                <div
                  role="grid"
                  // style={{ display: "grid", gridTemplateRows: "3.3% 0.7% auto 1fr 3.3% 10%" }}
                  ref={gridTableRef}
                  className={`${styles.table_area} bg-[red]/[0]`}
                >
                  <div
                    role="row"
                    className={`${styles.table_header_row} flex bg-[red]/[0]`}
                    // style={{ gridTemplateColumns: "65% 5% 12% 18%" }}
                  >
                    {Array(4)
                      .fill(null)
                      .map((_, index) => (
                        <div
                          role="columnheader"
                          key={index}
                          className={`${styles.column_header} flex-center`}
                          style={{ gridColumnStart: index + 1 }}
                        >
                          {index === 0 && (
                            <div className={`flex h-full w-[24%] items-center justify-between`}>
                              <span>品</span>
                              <span>名</span>
                            </div>
                          )}
                          {index === 1 && (
                            <div className={`flex-center h-full w-full`}>
                              <span>数量</span>
                            </div>
                          )}
                          {index === 2 && (
                            <div className={`flex-center h-full w-full`}>
                              <span>単価 (円)</span>
                            </div>
                          )}
                          {index === 3 && (
                            <div className={`flex-center h-full w-full`}>
                              <span>金額 (円)</span>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  <div role="row" className={`${styles.top_margin_row} `}>
                    {/* {Object.keys(productsArray).map((key, index) => ( */}
                    {columnHeaderTitleArray.map((key, index) => (
                      <div
                        key={key + index.toString() + "blank"}
                        role="gridcell"
                        className={`${styles.grid_cell} flex items-center `}
                      ></div>
                    ))}
                  </div>

                  <div
                    role="rowgroup"
                    className={`${styles.row_group_products_area} bg-[red]/[0]`}
                    style={{
                      ...(productsArray?.length > 0 && {
                        // borderBottom: "0.6px solid #37352f",
                        borderBottom: "0.1px solid #37352f",
                        // minHeight: `${3.3 * productsArray.length + 1}%`,
                        // minHeight: `${3.3 * productsArray.length}%`,
                        // minHeight: `${3.5 * productsArray.length}%`,
                        minHeight: `${3.9 * productsArray.length}%`,
                        display: "grid",
                        gridTemplateRows: "repeat(1fr)",

                        // gridTemplateRows: `0.1fr repeat(1fr)`,
                      }),
                    }}
                  >
                    {productsArray?.length > 0 &&
                      productsArray.map((obj: any, index: number) => {
                        return (
                          <div
                            role="row"
                            key={obj.id}
                            style={{ gridRowStart: index + 1 }}
                            className={`${styles.row} flex items-center justify-between`}
                          >
                            {Object.keys(productsArray).map((key, index) => (
                              <div
                                role="gridcell"
                                key={key + index.toString()}
                                className={`${styles.grid_cell} ${
                                  index === 0 ? `${styles.product_name_area}` : `${styles.qua_area}`
                                }`}
                              >
                                {index === 0 && (
                                  <>
                                    <div className={`${styles.product_name} w-[52%]`}>
                                      <span>{obj.product_name}</span>
                                      {/* {obj.product_name} */}
                                    </div>
                                    <div className={`${styles.outside_name} w-[48%]`}>
                                      {obj.outside_name && <span>{obj.outside_name}</span>}
                                    </div>
                                  </>
                                )}
                                {index === 1 && <span>{obj.unit_quantity}</span>}
                                {index === 2 && <span>{formatDisplayPrice(obj.unit_price)}</span>}
                                {index === 3 && <span>{formatDisplayPrice(obj.amount)}</span>}
                              </div>
                            ))}
                          </div>
                        );
                      })}
                  </div>

                  <div role="row" style={{ minHeight: `${3.9}%` }} className={`${styles.row_result}`}>
                    {columnHeaderTitleArray.map((key, index) => (
                      <div
                        key={key + index.toString() + "amount"}
                        role="gridcell"
                        className={`${styles.grid_cell} flex items-center ${
                          index === 0 ? `${styles.first}` : `${styles.end}`
                        }`}
                      >
                        {index === 0 && <span>本体合計</span>}
                        {index === 3 && <span>{formatDisplayPrice(6795000)}</span>}
                      </div>
                    ))}
                  </div>

                  {isDiscount && (
                    <div role="row" style={{ minHeight: `${3.9}%` }} className={`${styles.row_result}`}>
                      {columnHeaderTitleArray.map((key, index) => (
                        <div
                          key={key + index.toString() + "discount"}
                          role="gridcell"
                          className={`${styles.grid_cell} flex items-center ${
                            index === 0 ? `${styles.first}` : `${styles.end}`
                          }`}
                        >
                          {index === 0 && <span>出精値引</span>}
                          {index === 3 && <span>-{formatDisplayPrice(795000)}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                  <div
                    role="row"
                    style={{
                      height: `calc(${100 - 3.3 - 0.7 - 3.9 * productsArray.length - 3.9 - (isDiscount ? 3.9 : 0)}%)`,
                    }}
                    className={`${styles.row_result} ${styles.row_margin_bottom}`}
                  >
                    {columnHeaderTitleArray.map((key, index) => (
                      <div
                        key={key + index.toString() + "margin-bottom"}
                        role="gridcell"
                        className={`${styles.grid_cell} flex ${
                          index === 0 ? `items-start justify-center pt-[5%]` : `items-center`
                        }`}
                      >
                        {index === 0 && <span>以下余白</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div role="row" className={`${styles.row_amount} w-full bg-[#09ff0000]`}>
                  {columnHeaderTitleArray.map((key, index) => (
                    <div
                      key={key + index.toString() + "total-amount"}
                      role="gridcell"
                      className={`${styles.grid_cell} flex items-center ${
                        index === 0 ? `${styles.first}` : `${styles.end}`
                      }`}
                    >
                      {index === 0 && (
                        <div className={`flex h-full w-[24%] items-center justify-between`}>
                          <span>合</span>
                          <span>計</span>
                        </div>
                      )}
                      {index === 3 && <span>{formatDisplayPrice(6000000)}</span>}
                    </div>
                  ))}
                </div>

                <div className={`${styles.notes_area} w-full bg-[#00eeff00]`}>
                  {/* <p className={`${styles.notes_content}`} dangerouslySetInnerHTML={{ __html: noteTextSample }}></p> */}
                  {!isEditMode.includes("quotation_notes") && (
                    <p className={`${styles.notes_content}`} dangerouslySetInnerHTML={{ __html: notesText }}></p>
                  )}
                  {isEditMode.includes("quotation_notes") && (
                    <textarea
                      cols={30}
                      value={notesText}
                      onChange={(e) => setNotesText(e.target.value)}
                      className={`${styles.notes_content} ${styles.textarea_box}`}
                    ></textarea>
                  )}
                  {isEditMode.length > 0 && (
                    <div
                      className={`absolute left-[-50vw] top-[-50vh] z-[3500] h-[150vh] w-[150vw] bg-[#00000030]`}
                      onClick={() => setIsEditMode([])}
                    ></div>
                  )}
                </div>

                <div className={`${styles.remarks_area} flex flex-col justify-start bg-[green]/[0]`}>
                  <p className={`${styles.remarks}`}>※記載価格には消費税等は含まれておりません。</p>
                  {!isEditMode.includes("shipping_remarks") && (
                    <p className={`${styles.remarks} ${styles.hover_text} truncate`}>{shippingRemarks}</p>
                  )}
                  {isEditMode.includes("shipping_remarks") && (
                    <input
                      className={`${styles.remarks} ${styles.input_box} truncate`}
                      value={shippingRemarks}
                      onChange={(e) => setShippingRemarks(e.target.value)}
                    />
                  )}
                  <div className={`${styles.page} flex-center`}>
                    <div className={`flex h-full w-[5%] items-center justify-between`}>
                      <span>1</span>
                      <span>/</span>
                      <span>1</span>
                    </div>
                  </div>
                </div>

                <div className={`${styles.bottom_margin} w-full bg-[red]/[0]`}></div>
              </div>

              {isLoadingPDF && !pdfURL && <SpinnerComet w="56px" h="56px" s="5px" />}
              {/* ---------------------- iframe PDFプレビューエリア ここまで ---------------------- */}
              {/* ---------------------- ボタンエリア ---------------------- */}
              {/* 閉じるボタン */}
              <div
                className={`flex-center transition-bg01 fixed right-[-56px] top-[5px] z-[3000] ${styles.btn} ${
                  isLoadingPDF ? `` : `${styles.mounted}`
                }`}
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
                onClick={handleClosePreviewModal}
              >
                <IoChevronForward className={`pointer-events-none text-[20px] text-[#fff]`} />
              </div>
              {/* ダウンロードボタン */}
              <div
                style={isEditingHidden}
                className={`flex-center transition-bg01 fixed right-[-56px] top-[55px] z-[3000] ${styles.btn} ${
                  isLoadingPDF ? `` : `${styles.mounted}`
                }`}
                // onClick={handleDownloadPDF}
                onClick={handleSaveImageToPdf}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `ダウンロード`,
                    // marginTop: 28,
                    itemsPosition: "center",
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
                <FiDownload className={`pointer-events-none text-[19px] text-[#fff]`} />
                {/* <a href={pdfURL} download={`見積書.pdf`}>ダウンロード</a> */}
              </div>
              {/* プリントボタン */}
              <div
                style={isEditingHidden}
                className={`flex-center transition-bg01 fixed right-[-56px] top-[105px] z-[3000] ${styles.btn} ${
                  isLoadingPDF ? `` : `${styles.mounted}`
                }`}
                onClick={handlePrint}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `印刷`,
                    // marginTop: 28,
                    itemsPosition: "center",
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
                <MdLocalPrintshop className={`pointer-events-none text-[21px] text-[#fff]`} />
              </div>
              {/* セッティングメニューボタン */}
              <div
                style={isEditingHidden}
                className={`flex-center transition-bg01 fixed right-[-56px] top-[155px] z-[3000] ${styles.btn} ${
                  isLoadingPDF ? `` : `${styles.mounted}`
                }`}
                onClick={handleOpenSettings}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `各種設定メニュー`,
                    // marginTop: 28,
                    itemsPosition: "center",
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
                {/* <LuSettings className={`pointer-events-none text-[21px] text-[#fff]`} /> */}
                <LuSettings2 className={`pointer-events-none text-[21px] text-[#fff]`} />
              </div>
              {/* セッティングメニューボタン */}
              <div
                className={`flex-center transition-bg01 fixed right-[-56px] z-[3000] ${styles.btn} ${
                  isLoadingPDF ? `` : `${styles.mounted}`
                } ${isEditMode.length > 0 ? `top-[55px]` : `top-[205px]`}`}
                onClick={handleAllEdit}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: isEditMode.length > 0 ? `編集モード終了` : `編集モード`,
                    // marginTop: 28,
                    itemsPosition: "center",
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
                {isEditMode.length === 0 && <MdEdit className={`pointer-events-none text-[20px] text-[#fff]`} />}
                {isEditMode.length > 0 && <IoClose className={`pointer-events-none text-[22px] text-[#fff]`} />}
              </div>
              {/* ---------------------- ボタンエリア ここまで ---------------------- */}

              {/* ---------------------- セッティングメニュー ---------------------- */}
              {isOpenSettings && <div className={`${styles.menu_overlay}`} onClick={handleCloseSettings}></div>}
              {openPopupMenu && (
                <div
                  className={`${styles.description_menu} shadow-all-md border-real-with-shadow fixed right-[-18px] z-[3500] flex min-h-max flex-col rounded-[6px]`}
                  style={{ top: `${openPopupMenu.y}px` }}
                >
                  <div className={`min-h-max w-full font-bold ${styles.title}`}>
                    <div className="flex max-w-max flex-col">
                      <span>{mappingPopupTitle[openPopupMenu.title][language]}</span>
                      <div className={`${styles.underline} w-full`} />
                    </div>
                  </div>

                  <ul className={`flex flex-col rounded-[6px] ${styles.u_list}`}>
                    {openPopupMenu.title === "compressionRatio" &&
                      descriptionCompressionRatio.map((item) => (
                        <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
                          <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                            {item.title}
                          </span>
                          <p className="select-none text-[12px]">{item.content}</p>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
              {isOpenSettings && (
                <div
                  className={`${styles.settings_menu} fixed left-[calc(100%+21px)] top-[205px] z-[3000] h-auto w-[330px] rounded-[6px]`}
                >
                  <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>見積設定メニュー</h3>

                  <p className={`w-full px-[20px] pb-[12px] pt-[10px] text-[11px]`}>
                    見積書の解像度や印鑑の表示有無、備考欄のテキスト内容などの編集、設定が可能です。
                  </p>

                  <hr className="min-h-[1px] w-full bg-[#999]" />

                  <div className="flex max-h-[240px] w-full flex-col overflow-y-auto">
                    <ul className={`flex h-full w-full flex-col`}>
                      <li
                        className={`${styles.list}`}
                        onMouseEnter={(e) => {
                          handleOpenPopupMenu({ e, title: "compressionRatio" });
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
                      <li className={`${styles.list}`}>
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>ロゴ画像</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        <ToggleSwitch state={isPrintCompanyLogo} dispatch={setIsPrintCompanyLogo} />
                      </li>
                      <li className={`${styles.list}`}>
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>法人印・角印</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        <ToggleSwitch state={isPrintCorporateSeal} dispatch={setIsPrintCorporateSeal} />
                      </li>
                      {/*  */}
                      <li className={`${styles.section_title} min-h-max w-full font-bold`}>
                        <div className="flex max-w-max flex-col">
                          <span>担当者印</span>
                          <div className={`${styles.underline} w-full`} />
                        </div>
                      </li>
                      <li className={`${styles.list}`}>
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>枠線</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        <ToggleSwitch state={isFrameInChargeStamp} dispatch={setIsFrameInChargeStamp} />
                      </li>

                      <li className={`${styles.list}`}>
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>印字</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        {/* {isFrameInChargeStamp && selectedRowDataQuotation?.in_charge_stamp_image_url && (
                          <ToggleSwitch state={isPrintInChargeStamp} dispatch={setIsPrintInChargeStamp} />
                        )} */}
                        {isFrameInChargeStamp && hankoSrc && (
                          <ToggleSwitch state={isPrintInChargeStamp} dispatch={setIsPrintInChargeStamp} />
                        )}
                        {/* {isFrameInChargeStamp && !selectedRowDataQuotation?.in_charge_stamp_image_url && (
                          <div>担当印なし</div>
                        )} */}
                        {isFrameInChargeStamp && !hankoSrc && <div>担当印なし</div>}
                      </li>

                      {/*  */}
                      <li className={`${styles.section_title} min-h-max w-full font-bold`}>
                        <div className="flex max-w-max flex-col">
                          <span>上長印1</span>
                          <div className={`${styles.underline} w-full`} />
                        </div>
                      </li>
                      <li className={`${styles.list}`}>
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>枠線</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        {isFrameInChargeStamp && (
                          <ToggleSwitch state={isFrameSupervisorStamp1} dispatch={setIsFrameSupervisorStamp1} />
                        )}
                      </li>

                      <li className={`${styles.list}`}>
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>印字</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        {isFrameInChargeStamp &&
                          isFrameSupervisorStamp1 &&
                          selectedRowDataQuotation?.supervisor1_stamp_image_url && (
                            <ToggleSwitch state={isPrintSupervisorStamp1} dispatch={setIsPrintSupervisorStamp1} />
                          )}
                        {isFrameInChargeStamp &&
                          isFrameSupervisorStamp1 &&
                          !selectedRowDataQuotation?.supervisor1_stamp_image_url && <div>上長印1なし</div>}
                      </li>

                      {/*  */}
                      <li className={`${styles.section_title} min-h-max w-full font-bold`}>
                        <div className="flex max-w-max flex-col">
                          <span>上長印2</span>
                          <div className={`${styles.underline} w-full`} />
                        </div>
                      </li>
                      <li className={`${styles.list}`}>
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>枠線</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        {isFrameInChargeStamp && isFrameSupervisorStamp1 && (
                          <ToggleSwitch state={isFrameSupervisorStamp2} dispatch={setIsFrameSupervisorStamp2} />
                        )}
                      </li>

                      <li className={`${styles.list}`}>
                        <div className="pointer-events-none flex min-w-[110px] items-center">
                          <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                          <div className="flex select-none items-center space-x-[2px]">
                            <span className={`${styles.list_title}`}>印字</span>
                            <span className={``}>：</span>
                          </div>
                        </div>
                        {isFrameInChargeStamp &&
                          isFrameSupervisorStamp1 &&
                          isFrameSupervisorStamp2 &&
                          selectedRowDataQuotation?.supervisor2_stamp_image_url && (
                            <ToggleSwitch state={isPrintSupervisorStamp2} dispatch={setIsPrintSupervisorStamp2} />
                          )}
                        {isFrameInChargeStamp &&
                          isFrameSupervisorStamp1 &&
                          isFrameSupervisorStamp2 &&
                          !selectedRowDataQuotation?.supervisor2_stamp_image_url && <div>上長印2なし</div>}
                      </li>
                      {/* {Array(3)
                        .fill(null)
                        .map((_, index) => (
                          <li key={index.toString() + "test_"} className={`${styles.list} ${styles.test}`}></li>
                        ))} */}
                    </ul>
                  </div>
                </div>
              )}
              {/* ---------------------- セッティングメニューここまで ---------------------- */}
            </div>
          </Suspense>
        </ErrorBoundary>
        {/* <FallbackPreview /> */}
      </div>
    </>
  );
};

export const QuotationPreviewModal = memo(QuotationPreviewModalMemo);

// -------------------------------- jsPDFの実装 --------------------------------
// // 初回マウント時にpdfデータをフェッチ
// useEffect(() => {
//   if (!selectedRowDataQuotation) return;
//   if (pdfURL) return;
//   // 見積もりデータが取得された後にpdfを生成する
//   const loadPDF = async () => {
//     if (!selectedRowDataQuotation) return;
//     setIsLoadingPDF(true);
//     try {
//       const quotation = selectedRowDataQuotation;

//       console.log("🌟useEffect axios.post実行");

//       const response = await axios.post(`/api/documents/fonts/encode-font`, {}, {});

//       if (!response.data) throw new Error("日本語フォントの読み込みに失敗しました。");

//       // フォントファイルのバイナリデータをBase64文字列形式にエンコードしたフォントデータを取得
//       // const { base64RegularFont, base64SemiBoldFont, base64BoldFont } = response.data;
//       const { base64SemiBoldFont } = response.data;

//       // クライアントサイドでPDFのインスタンスを作成
//       const doc = new jsPDF();

//       console.log("response.data", response.data);

//       // VFSにフォントファイルを追加
//       // APIから受け取ったbase64文字列型式のフォントデータをjsPDFのVFSに追加
//       // doc.addFileToVFS("NotoSerifJP-Regular.otf", base64RegularFont);
//       // doc.addFileToVFS("NotoSerifJP-SemiBold.otf", base64SemiBoldFont);
//       // doc.addFileToVFS("NotoSerifJP-Bold.otf", base64BoldFont);
//       doc.addFileToVFS("NotoSansJP-Regular.ttf.ttf", base64SemiBoldFont);

//       // console.log("doc.getFileFromVFS()", doc.getFileFromVFS("NotoSerifJP-SemiBold.otf"));
//       console.log("doc", doc);
//       // console.log("doc.vfs", doc.vfs);

//       // // フォントを登録
//       // doc.addFont("NotoSerifJP-Regular.otf", "NotoSerifJP", "normal");
//       doc.addFont("NotoSerifJP-SemiBold.otf", "NotoSerifJP", "semibold");
//       // doc.addFont("NotoSerifJP-Bold.otf", "NotoSerifJP", "bold");

//       console.log("doc.getFont()", doc.getFont());
//       console.log("doc.getFontList()", doc.getFontList());

//       // console.log("doc.getFileFromVFS()", doc.getFileFromVFS("NotoSerifJP-SemiBold.otf"));

//       // // 使用するフォントを設定
//       doc.setFont("NotoSerifJP", "semibold");

//       // PDFの作成
//       // ヘッダーの追加
//       // doc.setFontSize(16);
//       // doc.text(quotation.quotation_title ?? "見積もりタイトル", 20, 20);
//       // doc.setFontSize(12);
//       // doc.text(
//       //   `見積日付: ${
//       //     quotation.quotation_date ? format(new Date(quotation.quotation_date), "yyyy年MM月dd日") : "見積日付"
//       //   }`,
//       //   20,
//       //   30
//       // );
//       // if (quotation.quotation_no_custom) {
//       //   doc.text(`見積番号: ${quotation.quotation_no_custom ?? "見積番号"}`, 20, 40);
//       // } else {
//       //   doc.text(`見積番号: ${quotation.quotation_no_system ?? "見積番号"}`, 20, 40);
//       // }
//       // doc.text(`相手先: ${quotation.company_name ?? "相手先"}`, 20, 50);

//       // // ロゴ画像 axiosを使用してロゴ画像データをblob形式で取得
//       // // try {
//       // //   let blobLogo: Blob | null = null;
//       // //   if (logoUrl) {
//       // //     const responseLogo = await axios.get(logoUrl, { responseType: "blob" });
//       // //     blobLogo = responseLogo.data ?? null;
//       // //   }

//       // //   // BlobをBase64エンコードされた文字列に変換
//       // //   if (!!blobLogo) {
//       // //     const logo = await new Promise((resolve) => {
//       // //       const reader = new FileReader();
//       // //       // FileReaderのonloadendイベントハンドラの設定 FileReaderがデータの読み込みを完了したときに発火し、resolve関数を呼び出してPromiseを解決する。reader.resultには読み込まれたデータの内容(今回はBase64エンコードされた画像データ)が含まれている
//       // //       reader.onloadend = () => resolve(reader.result);
//       // //       reader.readAsDataURL(blobLogo as Blob);
//       // //     });
//       // //     if (!logo) throw new Error("ロゴ画像の読み込みに失敗しました。");

//       // //     // ロゴ画像の描画 *1
//       // //     doc.addImage(logo as string, "PNG", 20, 20, 50, 50);
//       // //   }
//       // // } catch (errorLogo: any) {
//       // //   console.error("画像の取得に失敗しました。", errorLogo);
//       // //   throw new Error("ロゴ画像の取得に失敗しました。");
//       // // }

//       // // 商品リストの配置
//       // let startY = 60;
//       // doc.text("商品リスト", 20, startY);
//       // startY += 10;
//       // if (quotation?.quotation_products_details && quotation.quotation_products_details.length > 0) {
//       //   quotation.quotation_products_details.forEach((item, index) => {
//       //     doc.text(`${item.quotation_product_name ?? "商品名"}`, 20, startY + index * 10);
//       //     // doc.text(`${item.quotation_product_outside_short_name}`, 60, startY + index * 10);
//       //     // doc.text(`${item.unitPrice}円`, 90, startY + index * 10);
//       //     // doc.text(`${item.quantity}個`, 120, startY + index * 10);
//       //     // doc.text(`${item.totalPrice}円`, 150, startY + index * 10);
//       //     // doc.line(20, startY + index * 10 + 2, 180, startY + index * 10 + 2); // 商品毎の線
//       //     doc.text(`${item.quotation_product_unit_price ?? 0}円`, 60, startY + index * 10);
//       //     doc.text(`${item.quotation_product_quantity ?? 0}個`, 100, startY + index * 10);
//       //     doc.text(
//       //       `${(item.quotation_product_unit_price ?? 0) * (item.quotation_product_quantity ?? 0)}円`,
//       //       140,
//       //       startY + index * 10
//       //     );
//       //     doc.line(20, startY + index * 10 + 2, 180, startY + index * 10 + 2); // 商品毎の線
//       //   });
//       // }

//       // // 合計金額と有効期限
//       // startY += quotation.quotation_products_details.length * 10 + 10;
//       // doc.text(`合計金額: ${quotation.total_amount}円`, 20, startY);
//       // doc.text(
//       //   `有効期限: ${
//       //     quotation.expiration_date ? format(new Date(quotation.expiration_date), "yyyy年MM月dd日") : "有効期限"
//       //   }`,
//       //   20,
//       //   startY + 10
//       // );

//       // // 備考欄
//       // doc.text("備考:", 20, startY + 20);
//       // doc.text(quotation.quotation_notes ?? "備考", 20, startY + 30);

//       // シンプルなテキストを追加
//       // doc.text("こんにちは、これはテストのPDFです。", 10, 10);

//       // ユーザーにPDFをダウンロードさせる
//       // doc.save("test.pdf");

//       // // PDFの保存（ダウンロードや表示に使用）
//       // const pdfOutput = doc.output("blob");

//       // console.log("pdfOutput", pdfOutput);

//       // // 一時的な URL を生成
//       // const _pdfUrl = URL.createObjectURL(pdfOutput);
//       // console.log("🌟一時的なURL _pdfUrl", _pdfUrl);

//       // setPdfURL(_pdfUrl);

//       // setPdfURL(fileURL);
//     } catch (error: any) {
//       console.error("PDFの取得に失敗しました:", error);
//       toast.error(`PDFの取得エラー：${error.message}`);
//     }
//     setIsLoadingPDF(false);
//   };

//   loadPDF();

//   // Blob URLのクリーンアップ
//   return () => {
//     if (pdfURL) {
//       console.log("🌠クリーンアップ URL.revokeObjectURL()実行して解放");
//       URL.revokeObjectURL(pdfURL);
//     }
//   };
// }, [selectedRowDataQuotation, setPdfURL, setIsLoadingPDF, pdfURL]);
// -------------------------------- jsPDFの実装 ここまで --------------------------------

// -------------------------------- pdf-libの実装 --------------------------------

// useEffect(() => {
//   if (!selectedRowDataQuotation) return;
//   if (pdfURL) return;
//   // 見積もりデータが取得された後にpdfを生成する
//   const loadPDF = async () => {
//     setIsLoadingPDF(true);
//     try {
//       const axiosPayload = {
//         selectedQuotation: selectedRowDataQuotation,
//       };

//       console.log("🌟useEffect axios.post実行 axiosPayload", axiosPayload);

//       const response = await axios.post(`/api/documents/pdf/create-pdf-quotation`, axiosPayload, {
//         responseType: "blob", // PDFデータをBlobとして受け取る
//       });

//       console.log("🌟axios.post成功 response", response);

//       const blob = new Blob([response.data], { type: "application/pdf" });
//       console.log("🌟blob", blob);
//       const fileURL = URL.createObjectURL(blob);
//       console.log("🌟fileURL", fileURL);
//       setPdfURL(fileURL);
//     } catch (error: any) {
//       console.error("PDFの取得に失敗しました:", error);
//       toast.error("PDFの取得に失敗しました...🙇‍♀️");
//     }
//     setIsLoadingPDF(false);
//   };

//   loadPDF();

//   // Blob URLのクリーンアップ
//   return () => {
//     if (pdfURL) {
//       console.log("🌠クリーンアップ URL.revokeObjectURL()実行して解放");
//       URL.revokeObjectURL(pdfURL);
//     }
//   };
// }, [selectedRowDataQuotation, setPdfURL, setIsLoadingPDF, pdfURL]);

/*
*1
imageData：画像のデータ。これはBase64エンコードされた文字列、URL、HTMLの<canvas>要素、またはUint8Array形式のバイナリデータであることができます。
format：画像のフォーマット。一般的なフォーマットには'PNG'、'JPG'、'JPEG'などがあります。
x、y：画像を配置するPDFページ上のx座標とy座標（通常はポイント単位）。
width、height：画像の幅と高さ。指定しない場合は画像の元のサイズが使用されますが、指定することで画像のサイズを調整できます。
*/
