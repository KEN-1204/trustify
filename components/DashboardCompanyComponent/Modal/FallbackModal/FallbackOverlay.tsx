import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import styles from "./FallbackModal.module.css";

export const FallbackOverlay = () => {
  return (
    <div className={`${styles.overlay}`}>
      <SpinnerComet h="56px" w="56px" />
    </div>
  );
};
