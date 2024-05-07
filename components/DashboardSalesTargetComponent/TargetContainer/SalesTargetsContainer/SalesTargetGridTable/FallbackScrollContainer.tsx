import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import styles from "./SalesTargetGridTable.module.css";

type Props = {
  title: string;
};

export const FallbackScrollContainer = ({ title }: Props) => {
  return (
    <>
      {/* <div className={`${styles.grid_content_card}`} style={{ background: `unset`, boxShadow: `unset` }}>
        <div className={`${styles.card_title_area}`}>
          <div className={`${styles.card_title}`}>
            <span>{title}</span>
          </div>
        </div>
        <div className={`flex h-full max-h-[102px] min-h-[102px] w-full justify-center pt-[30px]`}>
          <SpinnerX />
        </div>
      </div> */}
      {/* タイトルエリア */}
      <div className={`${styles.card_title_area}`}>
        <div className={`${styles.card_title}`}>
          <span>{title}</span>
        </div>
      </div>
      {/* コンテンツエリア */}
      <div className={`flex h-full max-h-[102px] min-h-[102px] w-full justify-center pt-[30px]`}>
        <SpinnerX />
      </div>
    </>
  );
};
