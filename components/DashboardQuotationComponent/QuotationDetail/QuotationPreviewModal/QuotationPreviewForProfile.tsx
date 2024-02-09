import { Suspense, memo, useEffect, useRef, useState } from "react";
import styles from "./QuotationPreviewModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { Fallback } from "@/components/Fallback/Fallback";
import { PDFComponent } from "./PDFComponent";
import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";
import { IoClose } from "react-icons/io5";

const QuotationPreviewForProfileMemo = () => {
  const previewModalTwinAreaRef = useRef<HTMLDivElement | null>(null);
  const [modalLeftPos, setModalLeftPos] = useState(0);

  useEffect(() => {
    if (!previewModalTwinAreaRef.current) return;

    setModalLeftPos(previewModalTwinAreaRef.current.getBoundingClientRect().x);
  }, []);

  const setIsOpenQuotationPreviewForProfile = useDashboardStore((state) => state.setIsOpenQuotationPreviewForProfile);
  // -------------------------- 🌟モーダルを閉じる関数🌟 --------------------------
  const handleClosePreviewModal = () => {
    setIsOpenQuotationPreviewForProfile(false);
  };
  // -------------------------- ✅モーダルを閉じる関数✅ --------------------------
  return (
    <>
      {/* オーバーレイ */}
      <div className={`${styles.overlay} fade03`} onClick={handleClosePreviewModal}></div>
      <div ref={previewModalTwinAreaRef} className={`${styles.preview_modal_area_twin} space-x-[6vw]`}>
        <div className={`${styles.preview_modal}`}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}>
              <PDFComponent isSample={true} />
            </Suspense>
          </ErrorBoundary>
        </div>
        <div className={`${styles.preview_modal}`}>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={
                <div className={`${styles.pdf} ${styles.loading}`} style={{ padding: "0px", backgroundColor: "#aaa" }}>
                  <SkeletonLoadingLineCustom h="100%" w="100%" rounded="0px" />
                </div>
              }
            >
              <PDFComponent isSample={false} modalPosLeft={modalLeftPos ?? 0} />
            </Suspense>
          </ErrorBoundary>
        </div>
        {/* <div className={`${styles.preview_modal}`}>
          <div className={`${styles.pdf} ${styles.loading}`} style={{ padding: "0px", backgroundColor: "#aaa" }}>
            <SkeletonLoadingLineCustom h="100%" w="100%" rounded="0px" />
          </div>
        </div> */}
      </div>
      <div
        className={`flex-center transition-bg01 fixed right-[30px] top-[4%] z-[5500] h-[35px] w-[35px] cursor-pointer rounded-full bg-[var(--color-sign-out-bg)] ${styles.btn}`}
        onClick={handleClosePreviewModal}
      >
        <IoClose className={`pointer-events-none text-[22px] text-[#fff]`} />
      </div>
    </>
  );
};

export const QuotationPreviewForProfile = memo(QuotationPreviewForProfileMemo);
