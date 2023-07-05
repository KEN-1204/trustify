import useStore from "@/store";
import Head from "next/head";
import React, { FC, ReactNode, useEffect } from "react";
import { Modal } from "./Modal/Modal";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import styles from "@/styles/DashboardLayout.module.css";
import { Tooltip } from "./Parts/Tooltip/Tooltip";

type Prop = {
  title?: string;
  children: ReactNode;
};

// 各ページをラップして、各ページ毎にCSSクラスやタイトル、ヘッダーなどを柔軟に設定する
// 各ページのJSXの一番外側に配置
export const DashboardLayout: FC<Prop> = ({ children, title = "TRUSTiFY" }) => {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);

  const router = useRouter();
  const supabase = useSupabaseClient();

  // テーマカラーチェンジ関数
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

  // ツールチップ
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);

  return (
    <div className={`${styles.trustify_app}`}>
      <Head>
        <title>{title}</title>
      </Head>
      {/* <header></header> */}
      {/* <main className="">{children}</main> */}
      <div className="relative flex h-full min-h-screen flex-col items-center">{children}</div>
      {/* <footer></footer> */}

      {/* サインアウトボタン */}
      <div className="flex-center fixed bottom-[2%] right-[8%] h-[50px] w-[50px] cursor-pointer">
        <div className="h-[50px] w-[50px] rounded-full bg-[red]" onClick={handleSignOut}></div>
      </div>
      {/* テーマ切り替えボタン */}
      <div className="flex-center fixed bottom-[2%] right-[3%] h-[50px] w-[50px] ">
        <div
          className={`h-[50px] w-[50px] cursor-pointer rounded-full ${
            theme === "dark" ? "bg-[--color-bg-brand05]" : "bg-[#00000080]"
          }`}
          onClick={changeTheme}
        ></div>
      </div>

      {/* モーダル */}
      {/* <Modal /> */}

      {/* ツールチップ */}
      {hoveredItemPos && <Tooltip />}
    </div>
  );
};
