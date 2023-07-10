import useStore from "@/store";
import Head from "next/head";
import React, { FC, ReactNode, useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import styles from "@/styles/DashboardLayout.module.css";
import { Tooltip } from "./Parts/Tooltip/Tooltip";
import { DashboardHeader } from "./DashboardHeader/DashboardHeader";
import { DashboardSidebar } from "./DashboardSidebar/DashboardSidebar";
import { useEffectOnce } from "react-use";
import { TooltipBlur } from "./Parts/Tooltip/TooltipBlur";
import useDashboardStore from "@/store/useDashboardStore";
import { EditModal } from "./EditModal/EditModal";
import { EditColumns } from "./GridTable/EditColumns/EditColumns";

type Prop = {
  title?: string;
  children: ReactNode;
};

// 各ページをラップして、各ページ毎にCSSクラスやタイトル、ヘッダーなどを柔軟に設定する
// 各ページのJSXの一番外側に配置
export const DashboardLayout: FC<Prop> = ({ children, title = "TRUSTiFY" }) => {
  const theme = useStore((state) => state.theme);
  const setTheme = useStore((state) => state.setTheme);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);

  const router = useRouter();
  const supabase = useSupabaseClient();

  // テーマカラーチェンジ関数
  const changeTheme = () => {
    if (theme === "light") setTheme("dark");
    if (theme === "dark") setTheme("light");
  };

  // モーダルが開いている時はbodyにoverflow: hiddenを設定する
  const isOpenEditModal = useDashboardStore((state) => state.isOpenEditModal);
  const openLangTab = useStore((state) => state.openLangTab);
  useEffect(() => {
    if (isOpenEditModal || openLangTab) {
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
  }, [isOpenEditModal, openLangTab]);

  // マウント時にbodyタグにoverflow: hiddenを設定して、ネイティブアプリケーションのようにする
  useEffectOnce(() => {
    // document.body.style.overflow = "hidden";
    // if (theme === "light") {
    //   document.body.style.backgroundColor = "#fff";
    // } else {
    //   document.body.style.backgroundColor = "#121212";
    // }
    document.body.style.overflow = "hidden";
  });

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
  const hoveredItemPosHorizon = useStore((state) => state.hoveredItemPosHorizon);

  // テーブルカラム編集モーダル
  const isOpenEditColumns = useDashboardStore((state) => state.isOpenEditColumns);
  const setIsOpenEditColumns = useDashboardStore((state) => state.setIsOpenEditColumns);

  return (
    <div className={`${styles.trustify_app} relative`}>
      <Head>
        <title>{title}</title>
      </Head>

      {/* ============================ メインコンテンツ ============================ */}
      {/* ヘッダー */}
      <DashboardHeader />
      {/* サイドバー */}
      <DashboardSidebar />
      {/* メイン */}
      <main>{children}</main>
      {/* <main className="relative flex h-full min-h-screen flex-col items-center">{children}</main> */}
      {/* フッター */}
      {/* <footer></footer> */}
      {/* ============================ メインコンテンツ ============================ */}

      {/* ============================ 共通UIコンポーネント ============================ */}
      {/* カラム入れ替え編集モーダルボタン */}
      {activeMenuTab !== "HOME" && (
        <div className="flex-center fixed bottom-[2%] right-[13%] z-[1000] h-[50px] w-[50px] cursor-pointer">
          <div
            className="h-[50px] w-[50px] rounded-full bg-[var(--color-bg-brand)]"
            onClick={() => setIsOpenEditColumns(true)}
          ></div>
        </div>
      )}
      {/* サインアウトボタン */}
      <div className="flex-center fixed bottom-[2%] right-[8%] z-[1000] h-[50px] w-[50px] cursor-pointer">
        <div className="h-[50px] w-[50px] rounded-full bg-[red]" onClick={handleSignOut}></div>
      </div>
      {/* テーマ切り替えボタン */}
      <div className="flex-center fixed bottom-[2%] right-[3%] z-[1000] h-[50px] w-[50px] ">
        <div
          className={`h-[50px] w-[50px] cursor-pointer rounded-full ${
            theme === "dark" ? "bg-[--color-bg-brand05]" : "bg-[#00000080]"
          }`}
          onClick={changeTheme}
        ></div>
      </div>

      {/* ============================ 共通UIコンポーネント ============================ */}
      {/* モーダル */}
      {isOpenEditModal && <EditModal />}

      {/* ツールチップ */}
      {hoveredItemPos && <Tooltip />}
      {hoveredItemPosHorizon && <TooltipBlur />}

      {/* カラム編集モーダル */}
      {isOpenEditColumns && <EditColumns />}
    </div>
  );
};
