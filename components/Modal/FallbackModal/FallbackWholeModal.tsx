import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";

export const FallbackWholeModal = () => {
  return (
    <>
      {/* モーダルオーバーレイ */}
      <div className={`modal_overlay`} />
      {/* モーダルコンテナ */}
      <div className={`modal_container p1 fallback_bg fade03 text-[var(--color-text-title)]`}>
        <SkeletonLoadingLineCustom h="100%" w="100%" rounded="9px" />
      </div>
    </>
  );
};
