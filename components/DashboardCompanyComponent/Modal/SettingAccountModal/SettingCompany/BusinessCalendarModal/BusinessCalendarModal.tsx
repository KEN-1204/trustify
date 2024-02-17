import { Suspense, memo, useEffect, useRef, useState } from "react";
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
import { format } from "date-fns";
import { toast } from "react-toastify";
import { FiDownload } from "react-icons/fi";
import { LuSettings2 } from "react-icons/lu";
import { MdEdit, MdLocalPrintshop } from "react-icons/md";

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

const BusinessCalendarModalMemo = () => {
  //   const [modalLeftPos, setModalLeftPos] = useState(0);

  //   useEffect(() => {
  //     if (!previewModalTwinAreaRef.current) return;

  //     setModalLeftPos(previewModalTwinAreaRef.current.getBoundingClientRect().x);
  //   }, []);

  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setIsOpenBusinessCalendarSettingModal = useDashboardStore(
    (state) => state.setIsOpenBusinessCalendarSettingModal
  );
  const language = useStore((state) => state.language);
  // 選択中の会計年度
  const selectedFiscalYearSetting = useDashboardStore((state) => state.selectedFiscalYearSetting);

  if (!userProfileState) return null;

  // ローカルstate関連
  const [pdfURL, setPdfURL] = useState<string | null>(null);
  const [imageURL, setImageURL] = useState<string | null>(null); // アンマウント時画像URLリソース解放用のstate
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState<string[]>([]); // エディットモード
  const [isOpenSettings, setIsOpenSettings] = useState(false); // セッティングメニュー
  const [compressionRatio, setCompressionRatio] = useState<CompressionRatio>("FAST"); // 画像をPDF化する際の圧縮率3段階を指定

  // useRef関連
  const previewModalTwinAreaRef = useRef<HTMLDivElement | null>(null);
  const pdfTargetRef = useRef<HTMLDivElement | null>(null);

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
        format: "a4", // PDFのページフォーマット a4:A4サイズ
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
      doc.addImage(image, "PNG", 0, 0, 210, 0, "", compressionRatio); // デフォルトの圧縮率はFASTの中間

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
    footnotes: { en: "Footnotes", ja: "脚注" },
    print: { en: "Print Tips", ja: "印刷Tips" },
    pdf: { en: "PDF Download", ja: "PDFダウンロード" },
    settings: { en: "Settings", ja: "各種設定メニュー" },
    edit: { en: "Edit Mode", ja: "編集モード" },
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
      const positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : -18;
      // -18 - 35 - openPopupMenu.width
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
        y: y - height / 2,
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
                <div className={`${styles.left_margin} h-full w-full min-w-[4%] max-w-[4%]`}></div>
                {/* ---------------- 左マージン ---------------- */}
                {/* ---------------- 真ん中 ---------------- */}
                <div className={`${styles.pdf_main_container} flex h-full w-full flex-col`}>
                  {/* エディットモードオーバーレイ z-[3500] */}
                  {isEditMode.length > 0 && <EditModeOverlay />}
                  <div className={`${styles.top_margin} w-full bg-[red]/[0]`}></div>
                  {/* <div className={`${styles.header_area} flex-center relative h-[6%] w-full bg-[aqua]/[0]`}></div> */}
                  <div className={`${styles.bottom_margin} w-full bg-[red]/[0]`}></div>
                </div>
                {/* ---------------- 真ん中 ---------------- */}
                {/* ---------------- 右マージン ---------------- */}
                <div className={`${styles.right_margin}  h-full w-full min-w-[4%] max-w-[4%]`}></div>
                {/* ---------------- 右マージン ---------------- */}
              </div>
            </Suspense>
          </ErrorBoundary>
          {/* ----------------------------- ✅カレンダーPDFコンポーネント✅ ----------------------------- */}

          {/* ------------------------ボタンエリア------------------------ */}
          {/* <div
        className={`flex-center transition-bg01 fixed right-[30px] top-[4%] z-[5500] h-[35px] w-[35px] cursor-pointer rounded-full bg-[var(--color-sign-out-bg)] ${styles.btn}`}
        onClick={handleCloseSettingModal}
      >
        <IoClose className={`pointer-events-none text-[22px] text-[#fff]`} />
      </div> */}
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
              handleOpenTooltip({
                e: e,
                display: "top",
                content: `ダウンロード`,
                // marginTop: 28,
                itemsPosition: "center",
              });
              handleOpenPopupMenu({ e, title: "pdf", displayX: "right", maxWidth: 360 });
            }}
            onMouseLeave={() => {
              if (hoveredItemPos) handleCloseTooltip();
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
              handleOpenTooltip({
                e: e,
                display: "top",
                content: `印刷`,
                // marginTop: 28,
                itemsPosition: "center",
              });
              handleOpenPopupMenu({ e, title: "print", displayX: "right", maxWidth: 360 });
            }}
            onMouseLeave={() => {
              if (hoveredItemPos) handleCloseTooltip();
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
              handleOpenTooltip({
                e: e,
                display: "top",
                content: `各種設定メニュー`,
                // marginTop: 28,
                itemsPosition: "center",
              });
              handleOpenPopupMenu({ e, title: "settings", displayX: "right", maxWidth: 360 });
            }}
            onMouseLeave={() => {
              if (hoveredItemPos) handleCloseTooltip();
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
              handleOpenTooltip({
                e: e,
                display: "top",
                content: isEditMode.length > 0 ? `編集モード終了` : `編集モード`,
                // marginTop: 28,
                itemsPosition: "center",
              });
              if (isEditMode.length !== 0) return;
              handleOpenPopupMenu({ e, title: "edit", displayX: "right", maxWidth: 360 });
            }}
            onMouseLeave={() => {
              if (hoveredItemPos) handleCloseTooltip();
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
          {/* 説明ポップアップ */}
          {openPopupMenu && (
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
                {/* {openPopupMenu.title === "compressionRatio" &&
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
              ))} */}
                {!["compressionRatio"].includes(openPopupMenu.title) && (
                  <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
                    <p className="select-none whitespace-pre-wrap text-[12px]">
                      {openPopupMenu.title === "footnotes" &&
                        "見積書末尾に記載される脚注を自由に編集が可能です。デフォルトテキストで保存したデータはブラウザを更新しても内容が保存されるため、自チームで常に使用している脚注がある場合は一度設定することでそれ以降の入力不要となります。"}
                    </p>
                  </li>
                )}
              </ul>
            </div>
          )}
          {/* 説明ポップアップ */}
          {/* ---------------------- セッティングメニュー関連ここまで ---------------------- */}
        </div>
      </div>
      {/* ------------------------プレビューモーダルエリア------------------------ */}
    </>
  );
};

export const BusinessCalendarModal = memo(BusinessCalendarModalMemo);
