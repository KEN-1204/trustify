import useStore from "@/store";
import React from "react";
import styles from "./DashboardHeader.module.css";
import { HiOutlineBars3 } from "react-icons/hi2";
import Image from "next/image";

export const DashboardHeader = () => {
  const theme = useStore((state) => state.theme);
  const logoSrc =
    theme === "light" ? "/assets/images/Trustify_logo_white1.png" : "/assets/images/Trustify_logo_black.png";

  return (
    <div className={`${styles.app_header}`}>
      <div className="relative flex h-full  items-center justify-start ">
        <div className="flex-center transition-base03 min-h-[40px] min-w-[40px] cursor-pointer rounded-full hover:bg-[--color-bg-sub]">
          <HiOutlineBars3 className="text-[24px] text-[--color-text] " />
        </div>
        <div className="relative flex h-full w-[145px] cursor-pointer select-none items-center justify-center">
          <Image
            src={logoSrc}
            alt=""
            className="h-full w-[90%] object-contain"
            fill
            // sizes="10vw"
            // placeholder="blur"
            // blurDataURL={theme === "dark" ? blurDataURLDark : blurDataURL}
            // className="!relative !h-[60px] !w-[200px] object-cover"
          />
        </div>
      </div>
      <div className="h-full w-[100px] bg-black"></div>
    </div>
  );
};
