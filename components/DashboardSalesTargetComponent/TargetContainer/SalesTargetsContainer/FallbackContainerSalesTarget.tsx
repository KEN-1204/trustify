import { SpinnerBrand } from "../../../Parts/SpinnerBrand/SpinnerBrand";

export const FallbackContainerSalesTarget = () => {
  return (
    <div className="flex-center h-full w-[calc(100vw-72px)] space-x-5">
      <SpinnerBrand bgColor="var(--color-bg-dashboard)" />
    </div>
  );
};
