import useStore from "@/store";
import Head from "next/head";
import React, { FC, ReactNode, useEffect } from "react";
import { Modal } from "./Modal/Modal";
import { useRouter } from "next/router";
import useThemeStore from "@/store/useThemeStore";
import useRootStore from "@/store/useRootStore";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";

type Prop = {
  title: string;
  children: ReactNode;
};

// 各ページをラップして、各ページ毎にCSSクラスやタイトル、ヘッダーなどを柔軟に設定する
// 各ページのJSXの一番外側に配置

export const Layout: FC<Prop> = ({ children, title = "TRUSTiFY | Trustify" }) => {
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  // const theme = useThemeStore((state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  // const theme = useStore((state) => state.theme);
  // const setTheme = useStore((state) => state.setTheme);
  const changeTheme = () => {
    if (theme === "light") setTheme("dark");
    if (theme === "dark") setTheme("light");
  };
  // モーダルが開いている時はbodyにoverflow: hiddenを設定する
  const isOpenModal = useStore((state) => state.isOpenModal);
  const openLangTab = useStore((state) => state.openLangTab);
  useEffect(() => {
    if (isOpenModal || openLangTab) {
      // モーダルが開いているときに、bodyにoverflow: hiddenを設定
      document.body.style.overflow = "hidden";
    } else {
      // モーダルが閉じているときに、bodyのoverflowを初期状態に戻す
      document.body.style.overflow = "unset";
    }

    // useEffectのクリーンアップ関数で、コンポーネントのアンマウント時にも初期状態に戻す
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpenModal, openLangTab]);

  return (
    <div className={``}>
      <Head>
        <title>{title}</title>
      </Head>
      {/* <header></header> */}
      {/* <main className="">{children}</main> */}
      <div className="relative flex h-full min-h-screen max-w-[100vw] flex-col items-center ">{children}</div>
      {/* <footer></footer> */}

      {/* テーマ切り替えボタン */}
      {/* <div className="flex-center fixed bottom-[2%] right-[1%] h-[10%] w-[10%]">
        <div
          className="h-[50px] w-[50px] cursor-pointer rounded-full bg-[--color-bg-brand05]"
          onClick={changeTheme}
        ></div>
      </div> */}
      <div
        className={`flex-center transition-base01 fixed bottom-[2%] right-[2%] z-[1000] h-[35px] w-[35px] cursor-pointer rounded-full ${
          theme === "dark"
            ? "bg-[--color-bg-brand05] hover:bg-[--color-bg-brand-f]"
            : "bg-[var(--color-bg-brand-fc0)] hover:bg-[var(--color-bg-brand-f)]"
        }`}
        onClick={changeTheme}
      >
        {theme === "light" && <MdOutlineLightMode className="text-[20px] text-[#fff]" />}
        {theme === "dark" && <MdOutlineDarkMode className="text-[20px] text-[#fff]" />}
      </div>

      {/* モーダル */}
      {/* <Modal /> */}
      {isOpenModal && <Modal />}
    </div>
  );
};

// <main className="flex min-h-screen w-screen flex-1 flex-col items-center justify-center">{children}</main>
