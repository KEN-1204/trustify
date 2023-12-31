import styles from "./SkeletonLoading.module.css";

type Props = {
  rounded?: string;
  h?: string;
  w?: string;
};

export const SkeletonLoadingLineCustom = ({ rounded = "6px", h = "13px", w = "100%" }: Props) => {
  return (
    <div
      className={` ${styles.skeleton}`}
      style={{
        ...(rounded && { borderRadius: rounded }),
        ...(h && { minHeight: h, maxHeight: h }),
        ...(w && { minWidth: w, maxWidth: w }),
      }}
    ></div>
  );
};
