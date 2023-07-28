import React, { FC } from "react";
import { SpinnerComet } from "../Parts/SpinnerComet/SpinnerComet";
import SpinnerIDS from "../Parts/SpinnerIDS/SpinnerIDS";

type Props = {
  className?: string;
};

export const Fallback: FC<Props> = ({ className = "min-h-[calc(100vh-56px)]" }) => {
  return (
    <div className={`flex-center h-full w-full ${className}`}>
      {/* <SpinnerComet /> */}
      <SpinnerIDS />
    </div>
  );
};
