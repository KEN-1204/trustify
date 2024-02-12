import styles from "./DashboardSDBComponent.module.css";

export const DashboardSDBComponent = () => {
  return (
    <>
      <div className={`flex-center ${styles.app_main_container} relative`}>
        <div className={`${styles.main_contents_wrapper} `}>
          {/* 上ヘッダーサイズ分のスペーサー */}
          <div className={`${styles.spacer_top}`}></div>
          {/* ===================== スクロールコンテナ ここから ===================== */}
          <div className={`${styles.main_contents_container}`}>
            {/* １画面目 上画面 */}
            <section className={`${styles.company_table_screen}`}></section>
          </div>
        </div>
      </div>
    </>
  );
};
