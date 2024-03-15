import useStore from "@/store";
import { CSSProperties, FC, Suspense, useRef, useState } from "react";
import styles from "./DashboardSalesTargetComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "../ErrorFallback/ErrorFallback";
import { FiPlus } from "react-icons/fi";
import { SalesTargetsContainer } from "./SalesTargetsContainer/SalesTargetsContainer";

export const DashboardSalesTargetComponent: FC = () => {
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setIsOpenSidebar = useDashboardStore((state) => state.setIsOpenSidebar);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const isOpenChangeSizeMenu = useDashboardStore((state) => state.isOpenChangeSizeMenu);
  const setIsOpenChangeSizeMenu = useDashboardStore((state) => state.setIsOpenChangeSizeMenu);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);

  const appMainContainerRef = useRef<HTMLDivElement | null>(null);

  // ハーフとallの時はheight指定を無しにして、コンテンツ全体を表示できるようにする
  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);

  // 売上目標・プロセス目標
  const [activeTargetTab, setActiveTargetTab] = useState(0);
  const [activeTargetTabBefore, setActiveTargetTabBefore] = useState(0);
  const [fadeDirection, setFadeDirection] = useState("");

  // 売上目標とプロセス目標のアクティブ時のアンダーラインの位置
  const getUnderline = (tab: number): CSSProperties => {
    if (tab === 0) return { left: 0, width: `52px` };
    if (tab === 1) return { left: 72, width: `78px` };
    return { left: 0, width: `52px` };
  };
  // 売上目標とプロセス目標のアクティブ時のアンダーラインの位置
  const getSlideStyle = (tab: string): CSSProperties => {
    if (tab === "Left") return { transform: `translateX(-20%)`, opacity: `0` };
    if (tab === "Right") return { transform: `translateX(20%)`, opacity: `0` };
    return {};
    // return { transform: `translateX(0)`, opacity: `1` };
  };

  // Upsert用ローディング
  console.log("🔥 DashboardSalesTargetComponentレンダリング レンダリング activeMenuTab", activeMenuTab);

  return (
    <div
      ref={appMainContainerRef}
      className={`flex-center ${styles.app_main_container} relative ${
        isOpenSidebar ? `${styles.open}` : `${styles.close}`
      }`}
    >
      {/* サイドバー表示時オーバーレイ */}
      {isOpenSidebar && <div className={`${styles.sidebar_overlay}`} onClick={() => setIsOpenSidebar(false)}></div>}
      {/* 見積Upsert用ローディング */}
      {/* {isLoadingUpsertGlobal && (
        <div className="flex-center fixed left-0 top-0 z-[10000] h-full w-full bg-[var(--overlay-loading-modal-inside)]">
          <SpinnerBrand withBorder withShadow />
        </div>
      )} */}
      {/* サイズメニュー切り替えタブ表示時中のオーバーレイ */}
      {isOpenChangeSizeMenu && (
        <div
          className={styles.overlay}
          onClick={() => {
            console.log("DashboardSalesTargetComponent オーバーレイクリック");
            setClickedItemPos(null);
            // setClickedItemPosOver(null);
            setIsOpenChangeSizeMenu(false);
          }}
        />
      )}

      {/* 左サイドバーサイズ分のスペーサー */}
      <div className={`${styles.spacer_left} ${isOpenSidebar ? `transition-base02` : `transition-base01`}`}></div>
      <div className={`${styles.main_contents_wrapper} `}>
        {/* 上ヘッダーサイズ分のスペーサー */}
        <div className={`${styles.spacer_top}`}></div>
        {/* ===================== スクロールコンテナ ここから ===================== */}
        <div className={`${styles.main_contents_container}`}>
          {/* １画面目 上画面 */}
          <section
            // className={`${styles.company_screen} space-y-[20px] ${
            className={`${styles.company_table_screen} ${
              tableContainerSize === "half" ? `${styles.company_table_screen_pr}` : ``
            } ${tableContainerSize === "all" ? `${styles.company_table_screen_pr}` : ``}`}
          >
            <div className={`${styles.title_area} flex w-full justify-between`}>
              <h1 className={`${styles.title}`}>
                <span>目標</span>
              </h1>
              <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
                <div className={`${styles.btn} ${styles.basic}`}>編集</div>
                <div className={`${styles.btn} ${styles.brand} space-x-[3px]`}>
                  <FiPlus className={`stroke-[3] text-[12px] text-[#fff]`} />
                  <span>目標追加</span>
                </div>
              </div>
            </div>

            <div className={`${styles.tab_area}`}>
              <h2 className={`flex flex-col  font-bold`}>
                <div className="mb-[6px] flex gap-[20px]">
                  <div
                    className={`${styles.title_wrapper} ${activeTargetTabBefore === 0 ? `${styles.active}` : ``}`}
                    onClick={() => {
                      if (activeTargetTab !== 0) {
                        setFadeDirection("Left");
                        setActiveTargetTabBefore(0);
                        setTimeout(() => {
                          setFadeDirection("");
                          setActiveTargetTab(0);
                        }, 500);
                      }
                    }}
                  >
                    <span className={``}>売上目標</span>
                  </div>
                  <div
                    className={`${styles.title_wrapper} ${activeTargetTabBefore === 1 ? `${styles.active}` : ``}`}
                    onClick={() => {
                      if (activeTargetTab !== 1) {
                        setFadeDirection("Right");
                        setActiveTargetTabBefore(1);
                        setTimeout(() => {
                          setFadeDirection("");
                          setActiveTargetTab(1);
                        }, 500);
                      }
                    }}
                  >
                    <span className={``}>プロセス目標</span>
                  </div>
                </div>
                <div className={`${styles.section_title_underline_bg} relative min-h-[2px] w-full`}>
                  <div
                    className={`${styles.section_title_underline} absolute left-0 top-0 min-h-[2px] w-[60px] bg-[var(--color-bg-brand-f)]`}
                    style={{ ...(activeTargetTabBefore && getUnderline(activeTargetTabBefore)) }}
                  />
                </div>
              </h2>
            </div>
          </section>

          {/* ２画面目 下画面 */}
          {activeTargetTab === 0 && (
            <section
              // className={`${styles.main_section_area} ${
              //   activeTargetTab === 0 ? (fadeDirection === "Left" ? `${styles.fade_left}` : ``) : ``
              // }`}
              className={`${styles.main_section_area} ${
                activeTargetTab === 0 ? (fadeDirection === "Left" ? `` : ``) : ``
              }`}
              style={getSlideStyle(activeTargetTabBefore !== 0 ? `Left` : ``)}
            >
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<div>Loading</div>}>
                  <SalesTargetsContainer />
                </Suspense>
              </ErrorBoundary>
            </section>
          )}
          {activeTargetTab === 1 && (
            <section
              className={`${styles.main_section_area} ${
                activeTargetTab === 1
                  ? fadeDirection === "Left"
                    ? `${styles.fade_left}`
                    : fadeDirection === "Right"
                    ? `${styles.fade_right}`
                    : ``
                  : ``
              }`}
              style={getSlideStyle(activeTargetTabBefore !== 1 ? (activeTargetTab > 1 ? `Left` : `Right`) : ``)}
            >
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<div>Loading</div>}>
                  <SalesTargetsContainer />
                </Suspense>
              </ErrorBoundary>
            </section>
          )}
        </div>
        {/* ===================== スクロールコンテナ ここまで ===================== */}
      </div>
    </div>
  );
};
