import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import styles from "../../../DashboardSalesTargetComponent.module.css";

type Props = {
  title: string;
  isSettingYearHalf?: boolean;
  hiddenTitle?: boolean;
  hiddenBg?: boolean;
};

export const FallbackTargetTable = ({
  title,
  isSettingYearHalf = true,
  hiddenTitle = false,
  hiddenBg = false,
}: Props) => {
  return (
    <div
      className={`${styles.grid_row} ${styles.col1} fade08_forward`}
      style={{ ...(isSettingYearHalf ? { minHeight: `275px` } : {}) }}
    >
      <div
        className={`${styles.grid_content_card}`}
        style={{ ...(hiddenBg && { background: `unset`, boxShadow: `unset` }) }}
      >
        {/* タイトルエリア */}
        <div className={`${styles.card_title_area}`}>
          <div className={`${styles.card_title}`}>{!hiddenTitle && <span>{title}</span>}</div>
        </div>
        {/* コンテンツエリア */}
        <div
          className={`flex-center h-full max-h-[225px] min-h-[225px] w-full`}
          style={{ ...(isSettingYearHalf ? { minHeight: `225px`, maxHeight: `225px` } : {}) }}
        >
          <SpinnerX />
        </div>
      </div>
    </div>
  );
};
