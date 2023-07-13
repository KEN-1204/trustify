import React, { FC } from "react";
import { SpinnerComet } from "../Parts/SpinnerComet/SpinnerComet";

export const Fallback: FC = () => {
  return (
    <div className="flex-center h-full min-h-[calc(100vh-56px)] w-full">
      <SpinnerComet />
    </div>
  );
};
