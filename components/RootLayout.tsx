import useStore from "@/store";
import React, { FC, ReactNode } from "react";
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
  const theme = useStore((state) => state.theme);

  return (
    <div className={`theme_${theme} `}>
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
        theme={`${theme === "light" ? "light" : "dark"}`}
      />
    </div>
  );
};

// const theme = useStore((state) => state.theme)
