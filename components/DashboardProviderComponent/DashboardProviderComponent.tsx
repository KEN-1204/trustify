import useDashboardStore from "@/store/useDashboardStore";
import styles from "../DashboardCompanyComponent/DashboardCompanyComponent.module.css";

export const DashboardProviderComponent = () => {
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setIsOpenProviderImportModal = useDashboardStore((state) => state.setIsOpenProviderImportModal);

  const handleOpenImport = () => {
    setIsOpenProviderImportModal(true);
  };
  return (
    <div
      className={`flex-center ${styles.app_main_container} relative ${
        isOpenSidebar ? `${styles.open}` : `${styles.close}`
      }`}
    >
      {/* 左サイドバーサイズ分のスペーサー */}
      <div className={`${styles.spacer_left} ${isOpenSidebar ? `transition-base02` : `transition-base01`}`}></div>

      <div className={`${styles.main_contents_wrapper} `}>
        {/* 上ヘッダーサイズ分のスペーサー */}
        <div className={`${styles.spacer_top}`}></div>
        {/* ===================== スクロールコンテナ ここから ===================== */}
        <div className={`${styles.main_contents_container}`}>
          {/* 水玉グラデーション */}
          <div className="pointer-events-none absolute inset-0 z-[10] overflow-hidden"></div>
          <section className={`${styles.company_table_screen} py-[20px] pl-[20px]`}>
            <div className="flex-center h-full w-full bg-[red]/[0.1]">
              <div className="brand_btn_active px-[10px] py-[3px]" onClick={handleOpenImport}>
                インポート
              </div>
            </div>
          </section>
        </div>
        {/* ===================== スクロールコンテナ ここまで ===================== */}
      </div>
    </div>
  );
};
