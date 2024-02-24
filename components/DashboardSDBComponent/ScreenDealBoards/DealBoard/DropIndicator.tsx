import { memo } from "react";

const DropIndicatorMemo = ({ beforeId, column }: { beforeId: string | null; column: string }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className={`my-0.5 h-0.5 w-full bg-violet-400 opacity-0`}
    />
  );
};

export const DropIndicator = memo(DropIndicatorMemo);
