import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import Image from "next/image";
import React, { memo } from "react";

const ResumeMembershipAfterCancelMemo = () => {
  const theme = useRootStore(useThemeStore, (state) => state.theme);

  //   const bgImageUrl =
  //     theme === "dark" ? `/assets/images/hero/slide_black_all_1x.png` : `/assets/images/hero/slide_white_all1x.png`;
  //   const blurBgImageUrl =
  //     theme === "dark"
  //       ? `/assets/images/hero/slide_black_all_placeholder.png`
  //       : `/assets/images/hero/slide_white_all1x_compressed.png`;

  console.log("ResumeMembershipAfterCancelレンダリング");
  return (
    <div className="fixed inset-0 z-[2000]">
      {/* <Image
        src={bgImageUrl}
        alt=""
        blurDataURL={blurBgImageUrl}
        placeholder="blur"
        fill
        sizes="100vw"
        className="z-[-1] h-full w-full object-cover"
      /> */}
      <Image
        src={`/assets/images/hero/slide_black_all_1x.png`}
        // src={`/assets/images/hero/slide_black_all_placeholder.png`}
        alt=""
        blurDataURL={`/assets/images/hero/slide_black_all_placeholder.png`}
        placeholder="blur"
        fill
        sizes="100vw"
        className={`transition-base z-[2] h-full w-full object-cover ${
          theme === "light" ? `opacity-0` : `opacity-100`
        }`}
      />
      <Image
        src={`/assets/images/hero/slide_white_all1x.png`}
        alt=""
        blurDataURL={`/assets/images/hero/slide_white_all1x_compressed.png`}
        placeholder="blur"
        fill
        sizes="100vw"
        className={`z-[1] h-full w-full object-cover`}
      />
      {/* シャドウグラデーション */}
      <div className="shadow-gradient-tb pointer-events-none absolute z-10 h-full w-full"></div>

      {/* モーダル */}
      <div
        className={`shadow-all-md absolute left-[50%] top-[45%] z-20 flex h-auto w-[380px] translate-x-[-50%] translate-y-[-50%] flex-col rounded-[8px] bg-[var(--color-bg-light)] px-[32px] py-[24px] text-[#37352f]`}
      >
        <h2 className="h-auto w-full text-[24px] font-bold">おかえりなさい。</h2>

        <div className={`mt-[10px] w-full text-[15px]`}>
          <p>メンバーシップを再開しますか？</p>
        </div>
      </div>
    </div>
  );
};

export const ResumeMembershipAfterCancel = memo(ResumeMembershipAfterCancelMemo);
