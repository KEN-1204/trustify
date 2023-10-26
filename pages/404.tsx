import { pageNotFoundIllustration } from "@/components/assets";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import Image from "next/image";
import Link from "next/link";
import React, { FC } from "react";

const Custom404: FC = () => {
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const logoSrc =
    theme === "light" ? "/assets/images/Trustify_logo_white1.png" : "/assets/images/Trustify_logo_black.png";
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center text-[var(--color-text-title)]">
      <div className="mt-[-50px]">{pageNotFoundIllustration}</div>

      <h1 className="text-center text-[32px] font-bold">404 - Page Not Found</h1>
      <p className="mb-[20px] mt-[20px]">申し訳ございません。お探しのページが見つかりませんでした。</p>
      <Link href="/home" className="text-[var(--color-text-brand-f)] underline">
        ホームに戻る
      </Link>
      <div className="absolute bottom-[3%] left-[50%] flex h-[100px] w-[245px] translate-x-[-50%] items-center justify-center">
        <Image src={logoSrc} alt="" className="h-full w-[90%] object-contain" fill priority={true} sizes="10vw" />
      </div>
    </div>
  );
};

export default Custom404;
