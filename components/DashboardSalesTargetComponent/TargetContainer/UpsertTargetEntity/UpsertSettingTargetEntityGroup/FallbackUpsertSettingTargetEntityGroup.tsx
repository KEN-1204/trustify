import { FallbackTargetContainer } from "../../FallbackTargetContainer";
import styles from "../../../DashboardSalesTargetComponent.module.css";

export const FallbackUpsertSettingTargetEntityGroup = () => {
  return (
    <div className={`setting_target_container fixed left-0 top-0 z-[80] h-[100vh] w-[100vw] bg-[red]/[0]`}>
      <div className={`${styles.upsert_setting_container} relative flex h-full w-full`}>
        <div className={`${styles.main_container_setting} z-[1200] flex h-full w-full bg-[yellow]/[0]`}>
          <div className={`${styles.spacer_left}`}></div>
          <div className={`${styles.main_contents_wrapper} `}>
            <div className={`${styles.spacer_top}`}></div>
            <FallbackTargetContainer isUpsert={true} />
          </div>
        </div>
      </div>
    </div>
  );
};
