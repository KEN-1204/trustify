import { CSSProperties } from "react";
import styles from "./SpinnerBrand.module.css";

type Props = {
  bgColor?: string;
  containerSize?: string;
  size?: string;
  isLarge?: boolean;
  withShadow?: boolean;
  withBorder?: boolean;
};

export const SpinnerBrand = ({
  bgColor = `#151515`,
  containerSize = "156px",
  size = "80px",
  isLarge = false,
  withShadow = false,
  withBorder = false,
}: Props) => {
  return (
    <div
      className={`${styles.container} ${isLarge ? styles.is_large : ``} ${withShadow ? styles.with_shadow : ``} ${
        withBorder ? styles.with_border : ``
      } flex-center`}
      style={
        {
          ...(bgColor && { backgroundColor: `${bgColor}`, "--bg-color": `${bgColor}` }),
          ...(containerSize && { width: `${containerSize}`, height: `${containerSize}` }),
          ...(size && { "--spinner-size": `${size}` }),
        } as CSSProperties
      }
    >
      <div className={`${styles.loader}`}>
        <span></span>
      </div>
      <div className={`${styles.loader}`}>
        <span></span>
      </div>
      <div className={`${styles.loader}`}>
        <i></i>
      </div>
      <div className={`${styles.loader}`}>
        <i></i>
      </div>
    </div>
  );
};
