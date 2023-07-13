import React, { FC, memo } from "react";
import styles from "../CompanyDetail/CompanyDetail.module.css";

const CompanyFunctionHeaderMemo: FC = () => {
  return <div className="h-[40px] w-full bg-[var(--color-bg-under-function-header)]"></div>;
};

export const CompanyFunctionHeader = memo(CompanyFunctionHeaderMemo);
