import React, { FC } from "react";
import { SpinnerComet } from "../Parts/SpinnerComet/SpinnerComet";

export const Fallback: FC = () => {
  return (
    <div className="flex-center h-full w-full">
      <SpinnerComet />
    </div>
  );
};
