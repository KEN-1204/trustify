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

const FallbackPreview = () => {
  return <SpinnerComet w="56px" h="56px" s="5px" />;
};

const QuotationPreviewModalMemo = () => {
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

  // 初回マウント時にpdfデータをフェッチ
  useEffect(() => {
    if (!selectedRowDataQuotation) return;
    if (pdfURL) return;
    // 見積もりデータが取得された後にpdfを生成する
    const loadPDF = async () => {
      setIsLoadingPDF(true);
      try {
        const axiosPayload = {
          selectedQuotation: selectedRowDataQuotation,
        };

        console.log("🌟useEffect axios.post実行 axiosPayload", axiosPayload);

        const response = await axios.post(`/api/documents/pdf/create-pdf-quotation`, axiosPayload, {
          responseType: "blob", // PDFデータをBlobとして受け取る
        });
        // const response = await axios.post(`/api/documents/pdf/test`, axiosPayload, {
        //   responseType: "blob", // PDFデータをBlobとして受け取る
        // });

        console.log("🌟axios.post成功 response", response);

        const blob = new Blob([response.data], { type: "application/pdf" });
        console.log("🌟blob", blob);
        const fileURL = URL.createObjectURL(blob);
        console.log("🌟fileURL", fileURL);
        setPdfURL(fileURL);
      } catch (error: any) {
        console.error("PDFの取得に失敗しました:", error);
        toast.error("PDFの取得に失敗しました...🙇‍♀️");
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
            <div className={`${styles.preview_modal} ${isLoadingPDF ? `${styles.loading_pdf}` : ``} `}>
              {/* ---------------------- iframe PDFプレビューエリア ---------------------- */}
              {/* {!isLoadingPDF && pdfURL && <iframe id="pdf-iframe" src={pdfURL || ""} className={`h-full w-full `} />} */}
              {!isLoadingPDF && pdfURL && (
                <NextImage
                  src={pdfURL}
                  alt="PDF"
                  // blurDataURL={bgImagePlaceholder()}
                  // placeholder="blur"
                  fill
                  sizes="100%"
                  // className="z-[0] h-full w-5/12 object-cover"
                  className="z-[0] h-full w-full object-cover"
                />
              )}
              {isLoadingPDF && <SpinnerComet w="56px" h="56px" s="5px" />}
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
