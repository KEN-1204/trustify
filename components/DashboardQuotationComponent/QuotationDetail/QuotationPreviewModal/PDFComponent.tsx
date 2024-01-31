import { memo } from "react";

const PDFComponentMemo = () => {
  return <div>PDFComponent</div>;
};

export const PDFComponent = memo(PDFComponentMemo);
