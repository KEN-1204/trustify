import useDashboardStore from "@/store/useDashboardStore";
import styles from "./FallbackDashboard.module.css";
import SpinnerIDS from "../Parts/SpinnerIDS/SpinnerIDS";

type Props = {
  hiddenLeftSpacer?: boolean;
  tabName?: string | null;
};

export const FallbackDashboard = ({ hiddenLeftSpacer, tabName }: Props) => {
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  //   if (true) return <div>FallbackDashboard</div>;

  return (
    <div
      className={`flex-center ${styles.app_main_container} relative ${
        isOpenSidebar ? `${styles.open}` : `${styles.close}`
      }`}
    >
      {/* サイズメニュー切り替えタブ表示時中のオーバーレイ */}
      {/* {isOpenChangeSizeMenu && (
        <div
          className={styles.overlay}
          onClick={() => {
            console.log("DashboardHomeComponent オーバーレイクリック");
            setClickedItemPos(null);
            // setClickedItemPosOver(null);
            setIsOpenChangeSizeMenu(false);
          }}
        />
      )} */}
      {/* 左サイドバーサイズ分のスペーサー */}
      {!hiddenLeftSpacer && (
        <div className={`${styles.spacer_left} ${isOpenSidebar ? `transition-base02` : `transition-base01`}`}></div>
      )}
      <div className={`${styles.main_contents_wrapper} `}>
        {/* 上ヘッダーサイズ分のスペーサー */}
        <div className={`${styles.spacer_top}`}></div>
        {/* ===================== スクロールコンテナ ここから ===================== */}
        <div className={`${styles.main_contents_container} flex-center h-full w-full`}>
          <SpinnerIDS />
        </div>
        {/* ===================== スクロールコンテナ ここまで ===================== */}
      </div>
    </div>
  );
};
