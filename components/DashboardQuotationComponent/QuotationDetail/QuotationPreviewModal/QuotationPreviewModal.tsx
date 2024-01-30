import { Suspense, memo, useEffect, useState } from "react";
import styles from "./QuotationPreviewModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { LuDownload } from "react-icons/lu";
import { MdOutlineClose, MdOutlineFileDownload } from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import { IoChevronForward } from "react-icons/io5";
import { format } from "date-fns";
import useStore from "@/store";

const FallbackPreview = () => {
  return <SpinnerComet w="56px" h="56px" s="5px" />;
};

const QuotationPreviewModalMemo = () => {
  const isOpenQuotationPreviewModal = useDashboardStore((state) => state.isOpenQuotationPreviewModal);
  const setIsOpenQuotationPreviewModal = useDashboardStore((state) => state.setIsOpenQuotationPreviewModal);
  const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);

  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [pdfURL, setPdfURL] = useState<string | null>(null);

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

  const handleClosePreviewModal = () => {
    setIsOpenQuotationPreviewModal(false);
  };

  // pdfを取得する関数
  const getPdfData = async () => {};

  // 初回マウント時にpdfデータをフェッチ
  useEffect(() => {
    const loadPDF = async () => {
      const pdfData = await getPdfData();
      const blob = new Blob([pdfData as any], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(blob);
      setPdfURL(fileURL);

      // Blob URLのクリーンアップ
      return () => {
        URL.revokeObjectURL(fileURL);
      };
    };

    loadPDF();
  }, []);

  // window.open(fileURL, '_blank')

  // PDFファイルのダウンロード
  const handleDownloadPDF = () => {
    if (!selectedRowDataQuotation) return;
    if (!pdfURL) return alert("prfファイルが取得できませんでした。");
    const title = selectedRowDataQuotation?.quotation_title;
    const companyName = selectedRowDataQuotation.company_name;
    const currentDate = format(new Date(), "yyMMdd");
    const fileName = title ? `${title}.pdf` : `見積書_${companyName}_${currentDate}.pdf`;

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
              >
                <IoChevronForward className={`pointer-events-none text-[20px] text-[#fff]`} />
              </div>
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
                <FiDownload className={`pointer-events-none text-[18px] text-[#fff]`} />
              </div>
            </div>
          </Suspense>
        </ErrorBoundary>
        {/* <FallbackPreview /> */}
      </div>
    </>
  );
};

export const QuotationPreviewModal = memo(QuotationPreviewModalMemo);
