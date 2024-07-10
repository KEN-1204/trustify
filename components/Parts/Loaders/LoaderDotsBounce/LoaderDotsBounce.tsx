import { CSSProperties } from "react";
import styles from "./LoaderDotsBounce.module.css";

type Props = {
  centerX?: string;
  positionX?: string;
  width?: string;
  height?: string;
  size?: string;
  scale?: string;
  shadow?: string;
};
export const DotsLoaderBounceF = ({
  centerX = "45%",
  positionX = "20%",
  width = "200px",
  height = "60px",
  size = "20px",
  scale = `scale(0.6)`,
  shadow = `0px 0px 13px 2px #ffffff40, 0px 0px 20px 3px #0d99ff90`,
}: Props) => {
  return (
    <>
      <div
        className={`${styles.wrapper}`}
        style={
          {
            width: width,
            height: height,
            transform: scale,
            "--shadow": shadow,
            "--circle-size": size,
            "--positionX": positionX,
            "--centerX": centerX,
          } as CSSProperties
        }
      >
        <div className={`${styles.circle} ${styles.theme_f}`}></div>
        <div className={`${styles.circle} ${styles.theme_f}`}></div>
        <div className={`${styles.circle} ${styles.theme_f}`}></div>
        <div className={`${styles.shadow} ${styles.theme_f}`}></div>
        <div className={`${styles.shadow} ${styles.theme_f}`}></div>
        <div className={`${styles.shadow} ${styles.theme_f}`}></div>
      </div>
    </>
  );
};
