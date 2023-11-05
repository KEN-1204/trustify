import { useSubscribeSubscribedAccount } from "@/hooks/useSubscribeSubscribedAccount";
import { useSubscribeSubscription } from "@/hooks/useSubscribeSubscription";
import useStore from "@/store";
import useRootStore from "@/store/useRootStore";
import useThemeStore from "@/store/useThemeStore";
import React, { FC, ReactNode, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import { Modal } from "./Modal/Modal";

type Prop = {
  children: ReactNode;
};

// _appの<Component {...pageProps} />をラップする
// プロジェクト全体に共有するグローバルテーマ(ライト$ダークやカラーテーマ)などを設定
// 【共有するもの】
// テーマカラー
// トースト ☆トーストはテキストを渡すだけで用途は変わらないので、RootLayoutに配置する
// モーダル ※モーダルはページのLayoutコンポーネントに配置して、個別の用途毎にモーダルを使用する

export const RootLayout: FC<Prop> = ({ children }) => {
  // const theme = useThemeStore((state) => state.theme);
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  // const theme = useStore((state) => state.theme);

  // // 新規サブスク登録とサブスク内容の変更を監視
  // useSubscribeSubscription();
  // // メンバーが自身のアカウントの紐付け、解除の変更やチームでの役割の変更を監視 うまくいかず
  // useSubscribeSubscribedAccount();

  useEffect(() => {
    if (theme === "light") {
      document.body.classList.remove("theme_dark");
      document.body.classList.add("theme_light");
      document.body.style.colorScheme = "light";
    } else {
      document.body.classList.remove("theme_light");
      document.body.classList.add("theme_dark");
      document.body.style.colorScheme = "dark";
    }
  }, [theme]);

  return (
    <div className={`theme_${theme}`}>
      {children}
      <ToastContainer
        position="top-left"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        // theme={`${theme === "light" ? "dark" : "light"}`}
        theme={`${theme === "light" ? "light" : "dark"}`}
      />
    </div>
  );
};

// const theme = useStore((state) => state.theme)
