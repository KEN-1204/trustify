import { pageNotFoundIllustration, questionsIllustration } from "@/components/assets";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Image from "next/image";
import React, { FC } from "react";
import { toast } from "react-toastify";

export const BlockModal = () => {
  const supabase = useSupabaseClient();
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const logoSrc =
    theme === "light" ? "/assets/images/Trustify_logo_white1.png" : "/assets/images/Trustify_logo_black.png";

  // ログアウト関数
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("サインアウトに失敗しました", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: `${theme === "light" ? "light" : "dark"}`,
      });
    }
  };
  return (
    <div className="transition-base03 fixed inset-0 z-[3000] flex h-screen w-screen flex-col items-center justify-center bg-[var(--color-bg-base)] text-[var(--color-text-title)]">
      {/* <div className="mt-[-50px]">{pageNotFoundIllustration}</div> */}
      <div className="mt-[-50px]">{questionsIllustration}</div>

      <h1 className="text-center text-[32px] font-bold">403 - Forbidden</h1>
      <p className="mb-[6px] mt-[20px] max-w-[600px]">申し訳ございません。</p>
      <p className="mb-[20px] ">お客様のアカウントは現在制限されておりお探しのページにアクセスできません。</p>
      <span
        className="cursor-pointer text-[var(--color-text-brand-f)] underline hover:text-[var(--color-text-brand-f-hover)]"
        onClick={handleSignOut}
      >
        ホームに戻る
      </span>
      <div className="absolute bottom-[3%] left-[50%] flex h-[100px] w-[245px] translate-x-[-50%] items-center justify-center">
        <Image src={logoSrc} alt="" className="h-full w-[90%] object-contain" fill priority={true} sizes="10vw" />
      </div>
    </div>
  );
};
