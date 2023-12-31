import styles from "./SkeletonLoading.module.css";

type Props = {
  size?: number;
};

export const SkeletonLoadingRound = ({ size = 40 }: Props) => {
  return (
    <div
      className={`flex-center min-h-[40px] min-w-[40px] rounded-full text-[#fff] ${styles.tooltip} ${styles.skeleton}`}
      style={{ ...(size && { minWidth: `${size}px` }), ...(size && { minHeight: `${size}px` }) }}
    ></div>
  );
};
