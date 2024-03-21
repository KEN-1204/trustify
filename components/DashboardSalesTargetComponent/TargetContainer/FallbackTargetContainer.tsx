import { FiPlus } from "react-icons/fi";
import styles from "../DashboardSalesTargetComponent.module.css";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";

type Props = {
  isUpsert?: boolean;
};

export const FallbackTargetContainer = ({ isUpsert = false }: Props) => {
  return (
    <div className={`${styles.main_contents_container}`}>
      <section
        // className={`${styles.company_screen} space-y-[20px] ${
        className={`${styles.company_table_screen}`}
      >
        <div className={`${styles.title_area} flex w-full justify-between`}>
          <h1 className={`${styles.title}`}>
            {!isUpsert && <span>目標</span>}
            {isUpsert && <span>目標設定</span>}
          </h1>
          {!isUpsert && (
            <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
              <div className={`${styles.btn} ${styles.basic}`}>編集</div>
              <div className={`${styles.btn} ${styles.brand} space-x-[3px]`}>
                <FiPlus className={`stroke-[3] text-[12px] text-[#fff]`} />
                <span>目標設定</span>
              </div>
            </div>
          )}
        </div>

        {!isUpsert && (
          <div className={`${styles.tab_area}`}>
            <h2 className={`flex flex-col  font-bold`}>
              <div className="mb-[6px] flex gap-[20px]">
                <div className={`${styles.title_wrapper} ${styles.active}`}>
                  <span className={``}>売上目標</span>
                </div>
                <div className={`${styles.title_wrapper} `}>
                  <span className={``}>プロセス目標</span>
                </div>
              </div>
              <div className={`${styles.section_title_underline_bg} relative min-h-[2px] w-full`}>
                <div
                  className={`${styles.section_title_underline} absolute left-0 top-0 min-h-[2px] w-[60px] bg-[var(--color-bg-brand-f)]`}
                  style={{ left: 0, width: `52px` }}
                />
              </div>
            </h2>
          </div>
        )}
      </section>

      <section
        className={`${styles.main_section_area} flex-center`}
        style={{ minHeight: `calc(100vh - 56px - 100px)` }}
      >
        <SpinnerBrand bgColor="var(--color-bg-dashboard)" />
      </section>
    </div>
  );
};
