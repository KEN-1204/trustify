import { Suspense, memo, useEffect, useState } from "react";
import styles from "./QuotationPreviewModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { MdLocalPrintshop } from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import { IoChevronForward } from "react-icons/io5";
import { format } from "date-fns";
import useStore from "@/store";
import axios from "axios";
import { toast } from "react-toastify";
import NextImage from "next/image";
// import NextImage from "next/legacy/image";
import { jsPDF } from "jspdf";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";

const FallbackPreview = () => {
  return <SpinnerComet w="56px" h="56px" s="5px" />;
};

const QuotationPreviewModalMemo = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const isOpenQuotationPreviewModal = useDashboardStore((state) => state.isOpenQuotationPreviewModal);
  const setIsOpenQuotationPreviewModal = useDashboardStore((state) => state.setIsOpenQuotationPreviewModal);
  const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);

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

  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [pdfURL, setPdfURL] = useState<string | null>(null);

  // 会社ロゴのフルURLを取得
  // const { fullUrl: logoUrl, isLoading: isLoadingLogoImg } = useDownloadUrl(
  //   userProfileState?.logo_url,
  //   "customer_company_logos"
  // );

  // // 初回マウント時にpdfデータをフェッチ
  useEffect(() => {
    if (!selectedRowDataQuotation) return;
    if (pdfURL) return;
    // 見積もりデータが取得された後にpdfを生成する
    const loadPDF = async () => {
      if (!selectedRowDataQuotation) return;
      setIsLoadingPDF(true);
      try {
        const quotation = selectedRowDataQuotation;

        console.log("🌟useEffect axios.post実行");

        const response = await axios.post(`/api/documents/fonts/encode-font`, {}, {});

        if (!response.data) throw new Error("日本語フォントの読み込みに失敗しました。");

        // フォントファイルのバイナリデータをBase64文字列形式にエンコードしたフォントデータを取得
        const { base64RegularFont, base64SemiBoldFont, base64BoldFont } = response.data;

        // クライアントサイドでPDFのインスタンスを作成
        const doc = new jsPDF();

        // VFSにフォントファイルを追加
        // APIから受け取ったbase64文字列型式のフォントデータをjsPDFのVFSに追加
        doc.addFileToVFS("NotoSerifJP-Regular.otf", base64RegularFont);
        doc.addFileToVFS("NotoSerifJP-SemiBold.otf", base64SemiBoldFont);
        doc.addFileToVFS("NotoSerifJP-Bold.otf", base64BoldFont);

        // フォントを登録
        doc.addFont('"NotoSerifJP-Regular.otf', '"NotoSerifJP', "normal");
        doc.addFont('"NotoSerifJP-SemiBold.otf', '"NotoSerifJP', "semibold");
        doc.addFont('"NotoSerifJP-Bold.otf', '"NotoSerifJP', "bold");

        // 使用するフォントを設定
        doc.setFont('"NotoSerifJP', "normal");

        // PDFの作成
        // ヘッダーの追加
        doc.setFontSize(16);
        doc.text(quotation.quotation_title ?? "", 20, 20);
        doc.setFontSize(12);
        doc.text(
          `見積日付: ${quotation.quotation_date ? format(new Date(quotation.quotation_date), "yyyy年MM月dd日") : ""}`,
          20,
          30
        );
        if (quotation.quotation_no_custom) {
          doc.text(`見積番号: ${quotation.quotation_no_custom ?? ""}`, 20, 40);
        } else {
          doc.text(`見積番号: ${quotation.quotation_no_system ?? ""}`, 20, 40);
        }
        doc.text(`相手先: ${quotation.company_name ?? ""}`, 20, 50);

        // ロゴ画像 axiosを使用してロゴ画像データをblob形式で取得
        // try {
        //   let blobLogo: Blob | null = null;
        //   if (logoUrl) {
        //     const responseLogo = await axios.get(logoUrl, { responseType: "blob" });
        //     blobLogo = responseLogo.data ?? null;
        //   }

        //   // BlobをBase64エンコードされた文字列に変換
        //   if (!!blobLogo) {
        //     const logo = await new Promise((resolve) => {
        //       const reader = new FileReader();
        //       // FileReaderのonloadendイベントハンドラの設定 FileReaderがデータの読み込みを完了したときに発火し、resolve関数を呼び出してPromiseを解決する。reader.resultには読み込まれたデータの内容(今回はBase64エンコードされた画像データ)が含まれている
        //       reader.onloadend = () => resolve(reader.result);
        //       reader.readAsDataURL(blobLogo as Blob);
        //     });
        //     if (!logo) throw new Error("ロゴ画像の読み込みに失敗しました。");

        //     // ロゴ画像の描画 *1
        //     doc.addImage(logo as string, "PNG", 20, 20, 50, 50);
        //   }
        // } catch (errorLogo: any) {
        //   console.error("画像の取得に失敗しました。", errorLogo);
        //   throw new Error("ロゴ画像の取得に失敗しました。");
        // }

        // 商品リストの配置
        let startY = 60;
        doc.text("商品リスト", 20, startY);
        startY += 10;
        if (quotation?.quotation_products_details && quotation.quotation_products_details.length > 0) {
          quotation.quotation_products_details.forEach((item, index) => {
            doc.text(`${item.quotation_product_name}`, 20, startY + index * 10);
            // doc.text(`${item.quotation_product_outside_short_name}`, 60, startY + index * 10);
            // doc.text(`${item.unitPrice}円`, 90, startY + index * 10);
            // doc.text(`${item.quantity}個`, 120, startY + index * 10);
            // doc.text(`${item.totalPrice}円`, 150, startY + index * 10);
            // doc.line(20, startY + index * 10 + 2, 180, startY + index * 10 + 2); // 商品毎の線
            doc.text(`${item.quotation_product_unit_price ?? 0}円`, 60, startY + index * 10);
            doc.text(`${item.quotation_product_quantity ?? 0}個`, 100, startY + index * 10);
            doc.text(
              `${(item.quotation_product_unit_price ?? 0) * (item.quotation_product_quantity ?? 0)}円`,
              140,
              startY + index * 10
            );
            doc.line(20, startY + index * 10 + 2, 180, startY + index * 10 + 2); // 商品毎の線
          });
        }

        // 合計金額と有効期限
        startY += quotation.quotation_products_details.length * 10 + 10;
        doc.text(`合計金額: ${quotation.total_amount}円`, 20, startY);
        doc.text(
          `有効期限: ${quotation.expiration_date ? format(new Date(quotation.expiration_date), "yyyy年MM月dd日") : ""}`,
          20,
          startY + 10
        );

        // 備考欄
        doc.text("備考:", 20, startY + 20);
        doc.text(quotation.quotation_notes ?? "", 20, startY + 30);

        // PDFの保存（ダウンロードや表示に使用）
        const pdfOutput = doc.output("blob");

        // 一時的な URL を生成
        const _pdfUrl = URL.createObjectURL(pdfOutput);
        console.log("🌟一時的なURL _pdfUrl", _pdfUrl);

        setPdfURL(_pdfUrl);

        // setPdfURL(fileURL);
      } catch (error: any) {
        console.error("PDFの取得に失敗しました:", error);
        toast.error(`PDFの取得エラー：${error.message}`);
      }
      setIsLoadingPDF(false);
    };

    loadPDF();

    // Blob URLのクリーンアップ
    return () => {
      if (pdfURL) {
        console.log("🌠クリーンアップ URL.revokeObjectURL()実行して解放");
        URL.revokeObjectURL(pdfURL);
      }
    };
  }, [selectedRowDataQuotation, setPdfURL, setIsLoadingPDF, pdfURL]);

  // モーダルを閉じる
  const handleClosePreviewModal = () => {
    if (pdfURL) {
      URL.revokeObjectURL(pdfURL);
    }
    setIsOpenQuotationPreviewModal(false);
  };

  // window.open(fileURL, '_blank')

  // PDFファイルのダウンロード
  const handleDownloadPDF = () => {
    if (!selectedRowDataQuotation) return;
    if (!pdfURL) return alert("prfファイルが取得できませんでした。");
    const title = selectedRowDataQuotation?.quotation_title;
    const companyName = selectedRowDataQuotation.company_name;
    const currentDate = format(new Date(), "yyMMddHHmmss");
    const fileName = title ? `${title}.pdf` : `見積書_${companyName}_${currentDate}.pdf`;
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

  const handlePrint = () => {
    setIsLoadingPDF(true);

    setTimeout(() => {
      setIsLoadingPDF(false);
    }, 1500);
  };

  // Webページ上で直接プリントアウト window.print()

  console.log("🌠PDFプレビューモーダル レンダリング pdfURL", pdfURL);

  return (
    <>
      {/* オーバーレイ */}
      <div className={`${styles.overlay} fade03`} onClick={handleClosePreviewModal}></div>
      {/* Suspenseとfallbackとローディングを使用する */}
      {/* プレビューモーダルエリア */}
      <div className={`${styles.preview_modal_area}`}>
        {/* プレビューモーダル */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackPreview />}>
            <div
              className={`${styles.preview_modal_iframe} ${isLoadingPDF || !pdfURL ? `${styles.loading_pdf}` : ``} `}
            >
              {/* ---------------------- iframe PDFプレビューエリア ---------------------- */}
              {!isLoadingPDF && pdfURL && <iframe id="pdf-iframe" src={pdfURL || ""} className={`h-full w-full `} />}
              {isLoadingPDF && !pdfURL && <SpinnerComet w="56px" h="56px" s="5px" />}
              {/* ---------------------- iframe PDFプレビューエリア ここまで ---------------------- */}
              {/* ---------------------- ボタンエリア ---------------------- */}
              {/* 閉じるボタン */}
              <div
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
                onClick={handleClosePreviewModal}
              >
                <IoChevronForward className={`pointer-events-none text-[20px] text-[#fff]`} />
              </div>
              {/* ダウンロードボタン */}
              <div
                className={`flex-center transition-bg01 fixed right-[-56px] top-[55px] z-[3000] ${styles.btn}`}
                onClick={handleDownloadPDF}
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
                className={`flex-center transition-bg01 fixed right-[-56px] top-[105px] z-[3000] ${styles.btn}`}
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
              {/* ---------------------- ボタンエリア ここまで ---------------------- */}
            </div>
          </Suspense>
        </ErrorBoundary>
        {/* <FallbackPreview /> */}
      </div>
    </>
  );
};

export const QuotationPreviewModal = memo(QuotationPreviewModalMemo);

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
