import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import styles from "../../../DashboardSalesTargetComponent.module.css";

export const FallbackEntityLevelColumn = () => {
  return (
    <div className={`${styles.col} fade08_forward`} style={{ background: `unset`, boxShadow: `unset` }}>
      <div
        className={`flex-center w-full`}
        style={{
          maxHeight: `calc(100vh - 56px - 66px - 168px - 32px)`,
          minHeight: `calc(100vh - 56px - 66px - 168px - 32px)`,
        }}
      >
        <SpinnerX h="h-[33px]" w="w-[33px]" />
      </div>
    </div>
  );
};
