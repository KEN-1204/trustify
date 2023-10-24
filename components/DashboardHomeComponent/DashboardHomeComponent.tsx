import useStore from "@/store";
import React, { FC, Suspense } from "react";
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
            className={`${styles.home_screen} ${
              activeMenuTab === "HOME" ||
              activeMenuTab == "Contacts000" ||
              activeMenuTab === "Activity" ||
              activeMenuTab === "Meeting0000"
                ? `${styles.all_container} space-y-0 !px-0 !py-0`
                : "py-[20px] pl-[20px]"
            }`}
          >
            {activeMenuTab === "HOME" && (
              <div className={`flex-col-center h-full w-full  ${styles.home_container}`}>
                <div className="flex h-[70dvh] w-[40%] flex-col items-center rounded-[4px] ">
                  <div className={`${styles.title_area} flex-col-center w-full `}>
                    <h3
                      className={`flex-center relative h-[70px] w-full max-w-[400px] select-none text-[32px] font-bold ${styles.text_brand_f_gradient}`}
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
                      >
                        <div className={`h-[40px] w-[40px] ${styles.animate_icon}`}>{item.icon}</div>
                        <div className="mx-[16px] flex flex-grow flex-col">
                          <span>{item.title}</span>
                          {/* {item.title2 && <span>{item.title2}</span>} */}
                        </div>
                        <div>
                          <BsChevronRight
                            className={`transition-base03 text-[var(--color-text)] ${styles.right_arrow}`}
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
