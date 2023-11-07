import Image from "next/image";
import React from "react";
import styles from "./ResumeMembershipAfterCancel.module.css";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import SpinnerD from "@/components/Parts/SpinnerD/SpinnerD";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import SpinnerIDS2 from "@/components/Parts/SpinnerIDS/SpinnerIDS2";
import Spinner from "@/components/Parts/Spinner/Spinner";

export const FallbackResumeMembershipAfterCancel = () => {
  return (
    <div className={`fixed inset-0 z-[2000] ${styles.bg_image}`}>
      <Image
        src={`/assets/images/hero/bg_slide_black1x_compressed.png`}
        alt=""
        blurDataURL={`/assets/images/hero/placeholder/bg_slide_black1x_placeholder.png`}
        placeholder="blur"
        fill
        sizes="100vw"
        className={`transition-base z-[0] h-full w-full select-none object-cover`}
      />
      {/* シャドウグラデーション */}
      <div className="shadow-gradient-tb-md pointer-events-none absolute z-10 h-full w-full select-none"></div>
      {/* モーダル */}
      <div
        className={`shadow-all-md transition-base03 flex-center absolute left-[50%] top-[45%] z-20 h-auto min-h-[343.5px] w-[380px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-light)] px-[32px] py-[24px] text-[#37352f]`}
      >
        {/* <Spinner w="50px" h="50px" s="4px" /> */}
        <SpinnerComet h="55px" w="55px" s="5px" />
        {/* <SpinnerIDS scale="scale-[0.6]" /> */}
      </div>
    </div>
  );
};
