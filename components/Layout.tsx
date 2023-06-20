import useStore from "@/store";
import Head from "next/head";
import React, { FC, ReactNode, useEffect } from "react";
import { Modal } from "./Modal/Modal";
import { useRouter } from "next/router";

type Prop = {
  title: string;
  children: ReactNode;
};

// 各ページをラップして、各ページ毎にCSSクラスやタイトル、ヘッダーなどを柔軟に設定する
// 各ページのJSXの一番外側に配置

export const Layout: FC<Prop> = ({ children, title = "TRUSTiFY | Trustify" }) => {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
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

  const router = useRouter();
  const root = router.pathname;
  console.log("root", root);
  console.log("root === '/'", root === "/");

  return (
    <div className={``}>
      <Head>
        <title>{title}</title>
      </Head>
      {/* <header></header> */}
      {/* <main className="">{children}</main> */}
      <div className="relative flex h-full min-h-screen flex-col items-center">{children}</div>
      {/* <footer></footer> */}

      {/* テーマ切り替えボタン */}
      <div className="flex-center fixed bottom-[2%] right-[1%] h-[10%] w-[10%]">
        <div
          className="h-[50px] w-[50px] cursor-pointer rounded-full bg-[--color-bg-brand05]"
          onClick={changeTheme}
        ></div>
      </div>

      {/* モーダル */}
      <Modal />
    </div>
  );
};

// <main className="flex min-h-screen w-screen flex-1 flex-col items-center justify-center">{children}</main>
