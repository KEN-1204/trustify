import useStore from "@/store";
import React, { FC, Suspense, useEffect, useRef, useState } from "react";
import styles from "./DashboardHomeComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";

import { ErrorBoundary } from "react-error-boundary";

import { ErrorFallback } from "../ErrorFallback/ErrorFallback";

import { Fallback } from "../Fallback/Fallback";

import { GridTableSmallAll } from "../GridTable/GridTableSmallAll/GridTableSmallAll";
import { GridTableAll } from "../GridTable/GridTableAll/GridTableAll";

import { BsChevronRight } from "react-icons/bs";
import { home_cards } from "./data";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import { toast } from "react-toastify";
import { useQueryNotifications } from "@/hooks/useQueryNotifications";
import { FallbackDashboardHomeComponent } from "./FallbackDashboardHomeComponent";
import {
  neonCycleIcon,
  neonIconsSettingsGear,
  neonMailIcon,
  neonMessageIconBg,
  neonPieChart,
  neonSearchIcon,
} from "../assets";

// export const DashboardHomeComponent = ({ user_id }: { user_id: string }) => {
export const DashboardHomeComponent = () => {
  console.log("DashboardHomeComponentレンダリング");
  // const theme = useThemeStore((state) => state.theme);
  // const theme = useStore((state) => state.theme);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const isOpenChangeSizeMenu = useDashboardStore((state) => state.isOpenChangeSizeMenu);
  const setIsOpenChangeSizeMenu = useDashboardStore((state) => state.setIsOpenChangeSizeMenu);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const setIsOpenSettingAccountModal = useDashboardStore((state) => state.setIsOpenSettingAccountModal);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);

  // お知らせ notificationsテーブルから自分のidに一致するお知らせデータを全て取得
  // const { data: notificationData, error: notificationError, status } = useQueryNotifications(user_id);

  const openSettingAccounts = () => {
    setLoadingGlobalState(false);
    setIsOpenSettingAccountModal(true);
    setSelectedSettingAccountMenu("Profile");
  };
  const openSettingInvitation = () => {
    if (userProfileState?.account_company_role !== ("company_owner" || "company_admin"))
      return alert("管理者権限が必要です。");
    setLoadingGlobalState(false);
    setIsOpenSettingAccountModal(true);
    setSelectedSettingAccountMenu("Member");
  };

  const handleActions = (name: string) => {
    switch (name) {
      case "setting":
        return openSettingAccounts();
        break;
      case "invitation":
        return openSettingInvitation();
      case "search":
        // チュートリアル動画流す
        return;
      case "record":
        // チュートリアル動画流す
        return;
      case "dev":
        // チュートリアル動画流す
        return;
      default:
        break;
    }
  };

  const homeContainerRef = useRef<HTMLDivElement | null>(null);
  const backIconsRef = useRef<(HTMLDivElement | null)[]>([]);
  // console.log("🔥🌟HOMEコンポー円んと　backIconsRef", backIconsRef);
  const handleHoverCard = (name: string) => {
    if (!homeContainerRef?.current) return;
    if (!backIconsRef?.current) return;
    homeContainerRef.current.classList.add(`${styles.hovered}`);
    switch (name) {
      case "setting":
        backIconsRef?.current[0]?.classList.add(`${styles.setting}`);
        break;
      case "invitation":
        backIconsRef?.current[1]?.classList.add(`${styles.invitation}`);
        break;
      case "search":
        backIconsRef?.current[2]?.classList.add(`${styles.search}`);
        break;
      case "record":
        backIconsRef?.current[3]?.classList.add(`${styles.record}`);
        break;
      case "dev":
        backIconsRef?.current[4]?.classList.add(`${styles.dev}`);
        break;

      default:
        break;
    }
  };
  const handleBlurCard = (name: string) => {
    if (!homeContainerRef?.current) return;
    if (!backIconsRef?.current) return;
    // homeContainerRef.current.classList.remove(`${styles.hovered}`);
    switch (name) {
      case "setting":
        backIconsRef?.current[0]?.classList.remove(`${styles.setting}`);
        break;
      case "invitation":
        backIconsRef?.current[1]?.classList.remove(`${styles.invitation}`);
        break;
      case "search":
        backIconsRef?.current[2]?.classList.remove(`${styles.search}`);
        break;
      case "record":
        backIconsRef?.current[3]?.classList.remove(`${styles.record}`);
        break;
      case "dev":
        backIconsRef?.current[4]?.classList.remove(`${styles.dev}`);
        break;

      default:
        break;
    }
  };

  // =========================== 🌟画面のサイズに応じて動的にアイコンサイズを変化させる🌟 ===========================
  // // 画面サイズに応じて背景アイコンのサイズを動的に決定する
  // const resizedIconSizeRef = useRef<number>(0);
  const [resizedIconSize, setResizedIconSize] = useState(0);
  // // const iconRef = useRef<HTMLOrSVGElement | null>(null);
  // const lastResizeTime = useRef(0); // 最後にリサイズが行われた時刻を記録するref

  // // リサイズイベントのハンドル関数
  // const handleResize = (entries: ResizeObserverEntry[]) => {
  //   const now = performance.now();

  //   // 最後のリサイズから一定時間が経過しているかチェック 16msは約1/60秒で一般的なディスプレイのリフレッシュレートが秒間60フレーム(つまり、１フレームあたり16.67ms)のため
  //   if (now - lastResizeTime.current > 16) {
  //     // 現在の時間を更新
  //     lastResizeTime.current = now;

  //     // 実際のリサイズ処理
  //     for (let entry of entries) {
  //       const newIconSize = Math.floor(entry.contentRect.width * 0.28);
  //       console.log("リサイズ実行 entry.contentRect.width", entry.contentRect.width, "newIconSize", newIconSize);
  //       // if (iconRef.current) {
  //       //   iconRef.current?.style.width = `${newIconSize}px`;
  //       //   iconRef.current?.style.height = `${newIconSize}px`;
  //       // }
  //       resizedIconSizeRef.current = newIconSize;
  //       setResizedIconSize(newIconSize);
  //     }
  //   } else {
  //     console.log("リサイズ次回実行");
  //     // 一定時間内であれば、次のアニメーションフレームで再試行
  //     requestAnimationFrame(() => handleResize(entries));
  //   }
  // };

  // useEffect(() => {
  //   // ResizeObserverのセットアップ
  //   const resizeObserver = new ResizeObserver((entries) => {
  //     // requestAnimationFrameを使用してリサイズ処理を行う
  //     requestAnimationFrame(() => handleResize(entries));
  //   });
  //   // document.bodyを監視対象に追加
  //   resizeObserver.observe(document.body);

  //   // コンポーネントのアンマウント時にオブザーバーを解除
  //   return () => {
  //     resizeObserver.disconnect();
  //   };
  // }, []); // 空の依存配列を指定して、マウント時のみ実行

  // 初回マウント時の画面サイズでアイコンサイズを決定
  useEffect(() => {
    const newSize = Math.floor(window.innerWidth * 0.3);
    setResizedIconSize(newSize);
  }, []);
  // =========================== ✅画面のサイズに応じて動的にアイコンサイズを変化させる✅ ===========================

  return (
    <div
      className={`flex-center ${styles.app_main_container} relative ${
        isOpenSidebar ? `${styles.open}` : `${styles.close}`
      }`}
    >
      {/* 言語切り替えタブ表示時中のオーバーレイ */}
      {isOpenChangeSizeMenu && (
        <div
          className={styles.overlay}
          onClick={() => {
            console.log("DashboardHomeComponent オーバーレイクリック");
            setClickedItemPos(null);
            // setClickedItemPosOver(null);
            setIsOpenChangeSizeMenu(false);
          }}
        />
      )}
      {/* 左サイドバーサイズ分のスペーサー */}
      <div className={`${styles.spacer_left} ${isOpenSidebar ? `transition-base02` : `transition-base01`}`}></div>
      <div className={`${styles.main_contents_wrapper}`}>
        {/* 上ヘッダーサイズ分のスペーサー */}
        <div className={`${styles.spacer_top}`}></div>
        {/* ===================== スクロールコンテナ ここから ===================== */}
        <div className={`${styles.main_contents_container}`}>
          {/* １画面目 */}
          {/* メッセージコンテナ */}

          <section
            // className={`${styles.home_screen} space-y-[20px] ${
            className={`${styles.home_screen} ${activeMenuTab !== "HOME" ? `transition-bg03` : `transition-bg05`} ${
              activeMenuTab === "HOME" ||
              activeMenuTab == "Contacts000" ||
              activeMenuTab === "Activity" ||
              activeMenuTab === "Meeting0000"
                ? `${styles.all_container} space-y-0 !px-0 !py-0`
                : "py-[20px] pl-[20px]"
            }`}
          >
            {activeMenuTab === "HOME" && (
              <div className={`flex-col-center h-full w-full ${styles.home_container}`} ref={homeContainerRef}>
                {/* 水玉 */}
                {/* <div className="pointer-events-none absolute inset-0 z-[0] overflow-hidden">
                  <div className="bg-gradient-brand1 z-1 absolute bottom-[-300px] left-[-400px] h-[500px] w-[500px] rounded-full"></div>
                  <div className="bg-gradient-brand2 z-1 absolute left-[39%] top-[-900px] h-[1120px] w-[1120px] rounded-full"></div>
                  <div className="bg-gradient-brand3 z-1 absolute bottom-[-200px] right-[-100px] h-[300px] w-[300px] rounded-full"></div>
                </div> */}
                {/* 背景アイコンエリア */}
                {home_cards.map((item, index) => {
                  // const className = `styles.${item.name}`;

                  return (
                    <div
                      key={item.name}
                      ref={(ref) => (backIconsRef.current[index] = ref)}
                      className={`${styles.back_icon}`}
                    >
                      {/* {index === 0 && neonIconsSettingsGear("500")}
                      {index === 1 && neonMailIcon("500")}
                      {index === 2 && neonSearchIcon("500")}
                      {index === 3 && neonPieChart("500")}
                      {index === 4 && neonCycleIcon("500")} */}
                      {index === 0 && neonIconsSettingsGear(resizedIconSize.toString())}
                      {index === 1 && neonMailIcon(resizedIconSize.toString())}
                      {index === 2 && neonSearchIcon(resizedIconSize.toString())}
                      {index === 3 && neonPieChart(resizedIconSize.toString())}
                      {index === 4 && neonCycleIcon(resizedIconSize.toString())}
                      {/* {index === 4 && neonMessageIconBg} */}
                    </div>
                  );
                })}
                {/* 背景アイコンエリアここまで */}
                <div className="flex h-[70dvh] w-[40%] flex-col items-center rounded-[4px] ">
                  {/* <div className="flex h-[calc(100dvh-var(--header-height))] w-[40%] flex-col items-center justify-center rounded-[4px]"> */}
                  {/* <div className={`${styles.title_area} flex-col-center mt-[-6vh] w-full`}> */}
                  <div className={`${styles.title_area} flex-col-center w-full`}>
                    <h3
                      className={`flex-center relative h-[70px] w-full max-w-[400px] select-none text-[32px] font-bold ${styles.text_brand_f_gradient} ${styles.text_brand_shadow}`}
                    >
                      TRUSTiFYへようこそ
                      {/* <span className="absolute left-[155px] top-[21px] min-h-[6px] min-w-[6px] truncate rounded-full bg-[red]"></span> */}
                    </h3>
                    <div
                      className={`h-[54px] w-full max-w-[400px] select-none text-[14px] text-[var(--color-text-third)]`}
                    >
                      ここはあなたのデータベースです。ご紹介するステップで、最初の一歩を踏み出しましょう！
                    </div>
                  </div>
                  {/* <div className={`${styles.contents_area} h-fit w-full max-w-[400px]`}> */}
                  <div className={`${styles.contents_area} h-full w-full max-w-[400px]`}>
                    {home_cards.map((item, index) => (
                      <div
                        key={item.name}
                        className={`${styles.content_card} transition-base02 mt-[10px] flex h-[72px] w-full max-w-[400px] items-center rounded-[8px] bg-[var(--color-bg-base-sub)] p-[16px] text-[14px] font-bold`}
                        onClick={() => {
                          if (item.name === "invitation") {
                            if (
                              userProfileState?.account_company_role !== "company_admin" &&
                              userProfileState?.account_company_role !== "company_owner"
                            ) {
                              alert("管理者権限を持つユーザーのみアクセス可能です");
                              return;
                            }
                          }
                          handleActions(item.name);
                        }}
                        onMouseEnter={() => handleHoverCard(item.name)}
                        onMouseLeave={() => handleBlurCard(item.name)}
                      >
                        <div className={`h-[40px] w-[40px] ${styles.animate_icon} pointer-events-none`}>
                          {item.icon}
                        </div>
                        <div className="pointer-events-none mx-[16px] flex flex-grow select-none flex-col">
                          <span>{item.title}</span>
                          {/* {item.title2 && <span>{item.title2}</span>} */}
                        </div>
                        <div>
                          <BsChevronRight
                            className={`transition-base03 pointer-events-none text-[var(--color-text)] ${styles.right_arrow}`}
                          />
                        </div>
                      </div>
                    ))}
                    {/* <div
                      className={`${styles.content_card} transition-base02 mt-[8px] flex h-[72px] w-full max-w-[400px] items-center rounded-[8px] bg-[var(--color-bg-base-sub)] p-[16px] font-bold`}
                    >
                      <div className="h-[40px] w-[40px]">{animatedSettingIcon}</div>
                      <div className="mx-[16px] flex flex-grow">プロフィールを設定する</div>
                      <div>
                        <BsChevronRight className="text-[var(--color-text)]" />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>
            )}
            {/* {activeMenuTab === "Company" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback />}>
                  <GridTableHome title="メッセージ" />
                </Suspense>
              </ErrorBoundary>
            )} */}
            {/* {activeMenuTab === "Contacts" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback />}>
                  <GridTableAll title="GridTableAll" />
                </Suspense>
              </ErrorBoundary>
            )} */}
            {/* {activeMenuTab === "Meeting" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<Fallback />}>
                  <GridTableSmallAll title="GridTableSmallAll" />
                </Suspense>
              </ErrorBoundary>
            )} */}
          </section>
          {/* <section className={`${styles.home_screen} space-y-[15px]`}>
            <GridTableHome title="メッセージ" />
          </section> */}
          {/* <div className={`${styles.screen1} bg-[--color-bg-base]`}></div> */}
          {/* ２画面目 */}

          {/* <div className={`${styles.screen1} flex-center bg-[--color-bg-base]`}>
            <SpinnerComet />
          </div> */}
          {/* <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-base]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-base]`}></div>
          <div className={`${styles.screen1} bg-[--color-bg-secondary]`}></div> */}
        </div>
        {/* ===================== スクロールコンテナ ここまで ===================== */}
      </div>
    </div>
  );
};
