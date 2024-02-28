import { getInitial } from "@/utils/Helpers/getInitial";
import { memo } from "react";

type Props = {
  size: number;
  name: string;
  textSize?: number;
  imgUrl?: string;
  bgColor?: string;
  withCircle?: boolean;
  hoverEffect?: boolean;
};

const AvatarIconMemo = ({
  size,
  name,
  textSize = 15,
  imgUrl,
  bgColor,
  withCircle = false,
  hoverEffect = true,
}: Props) => {
  const innerBlank = size - 4;
  const innerSize = innerBlank - 3;
  return (
    <>
      {!imgUrl && !withCircle && (
        <div
          className={`flex-center h-[33px] w-[33px] rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] ${
            hoverEffect ? `cursor-pointer hover:bg-[var(--color-bg-brand-sub-hover)]` : `select-none`
          }`}
          style={{ height: `${size}px`, width: `${size}px`, ...(bgColor && { backgroundColor: `${bgColor}` }) }}
        >
          <span className={`text-[15px]`}>{getInitial(name)}</span>
        </div>
      )}
      {!imgUrl && withCircle && (
        <div
          className={`flex-center bg-brand-gradient-light h-[33px] w-[33px] rounded-full text-[#fff] ${
            hoverEffect ? `cursor-pointer hover:bg-[var(--color-bg-brand-sub-hover)]` : `select-none`
          }`}
          style={{ height: `${size}px`, width: `${size}px` }}
        >
          <div
            className="flex-center h-[29px] w-[29px] rounded-full bg-[var(--color-bg-base)]"
            style={{
              height: `${innerBlank}px`,
              width: `${innerBlank}px`,
            }}
          >
            <div
              className="flex-center relative h-[26px] w-[26px] rounded-full bg-[var(--color-bg-brand-sub)]"
              style={{
                height: `${innerSize}px`,
                width: `${innerSize}px`,
                ...(bgColor && { backgroundColor: `${bgColor}` }),
              }}
            >
              <div className="absolute left-0 top-0 z-[10] h-full w-full rounded-full hover:bg-[#00000020]" />
              <span
                className={`pointer-events-none text-[16px]`}
                style={{ fontSize: `${textSize}px`, lineHeight: `${textSize}px` }}
              >
                {getInitial(name)}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const AvatarIcon = memo(AvatarIconMemo);
