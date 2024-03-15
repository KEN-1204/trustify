import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { Suspense, memo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import styles from "./SalesTargetsContainer.module.css";
import { SalesTargetGridTable } from "./SalesTargetGridTable/SalesTargetGridTable";

const SalesTargetsContainerMemo = () => {
  const FallbackScrollContainer = () => {
    return (
      <div className={`flex h-full max-h-[102px] min-h-[102px] w-full justify-center pt-[30px]`}>
        <SpinnerX />
      </div>
    );
  };
  return (
    <>
      <div className={`${styles.contents_area}`}>
        {/* ---------- */}
        <div className={`${styles.grid_row} ${styles.col3}`}>
          <div className={`${styles.grid_content_card}`}>
            {/* タイトルエリア */}
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>全社売上目標</span>
              </div>
            </div>
            {/* コンテンツエリア */}
          </div>
          <div className={`${styles.grid_content_card}`}>
            {/* タイトルエリア */}
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>売上目標シェア</span>
              </div>
            </div>
            {/* コンテンツエリア */}
          </div>
          <div className={`${styles.grid_content_card}`}>
            {/* タイトルエリア */}
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>スローガン・重点方針</span>
              </div>
            </div>
            {/* コンテンツエリア */}
          </div>
        </div>
        {/* ---------- */}
        {/* ---------- */}
        <div className={`${styles.grid_row} ${styles.col1}`}>
          <div className={`${styles.grid_content_card}`}>
            {/* タイトルエリア */}
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>全社</span>
              </div>
            </div>
            {/* コンテンツエリア */}
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense fallback={<FallbackScrollContainer />}>
                <SalesTargetGridTable entityType="company" fiscalYear={2023} />
              </Suspense>
            </ErrorBoundary>
            {/* <FallbackScrollContainer /> */}
          </div>
        </div>
        {/* ---------- */}
        <div className={`${styles.grid_row} ${styles.col1}`}>
          <div className={`${styles.grid_content_card}`}>
            {/* タイトルエリア */}
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>事業部</span>
              </div>
            </div>
            {/* コンテンツエリア */}
          </div>
        </div>
        {/* ---------- */}
      </div>
    </>
  );
};

export const SalesTargetsContainer = memo(SalesTargetsContainerMemo);
