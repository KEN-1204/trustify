import { SpinnerBrand } from "../../../Parts/SpinnerBrand/SpinnerBrand";

export const FallbackContainerSalesTarget = () => {
  return (
    <div className="flex-center h-full min-h-[calc(100vh-56px-99.5px)] min-w-[calc(100vw-72px)] space-x-5">
      <SpinnerBrand bgColor="var(--color-bg-dashboard)" />
    </div>
  );
};
