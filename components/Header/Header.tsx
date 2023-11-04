import useStore from "@/store";
import Image, { StaticImageData } from "next/image";
import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import styles from "./Header.module.css";
import Link from "next/link";
import { toast } from "react-toastify";
import { LangBtn } from "../Parts/LangBtn/LangBtn";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import useThemeStore from "@/store/useThemeStore";
import useRootStore from "@/store/useRootStore";
import { LangMenu } from "../Parts/LangMenu/LangMenu";

type Props = {
  lightModeColor?: string; // bgカラー(ライトモード)
  lightModeTextColor?: string; // textカラー(ライトモード)
  darkModeColor?: string; // bgカラー(ダークモード)
  darkModeTextColor?: string; //textカラー(ダークモード)
  logoSrc?: string; // ロゴ なければMeteor
  blurDataURL?: string; // ロゴ なければMeteor
  logoSrcDark?: string; // ロゴ なければMeteor
  blurDataURLDark?: string; // ロゴ なければMeteor
};

export const Header: FC<Props> = ({
  lightModeColor = "bg-[#fff]/[0]",
  darkModeColor = "bg-[#000]/[0]",
  lightModeTextColor = "text-[#000]",
  darkModeTextColor = "text-[#fff]",
  logoSrc = "",
  blurDataURL = "",
  logoSrcDark = "",
  blurDataURLDark = "",
}) => {
  console.log("Headerコンポーネントレンダリング");
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  // const theme = useThemeStore((state) => state.theme);
  // const theme = useStore((state) => state.theme);
  const setIsOpenModal = useStore((state) => state.setIsOpenModal);
  const openLangTab = useStore((state) => state.openLangTab);
  const setOpenLangTab = useStore((state) => state.setOpenLangTab);
  const [isHoveringHeader, setIsHoveringHeader] = useState(false);
  const setIsLogin = useStore((state) => state.setIsLogin);
  const language = useStore((state) => state.language);
  const sessionState = useStore((state) => state.sessionState);

  // 言語ドロップダウンメニュー
  const clickedItemPos = useStore((state) => state.clickedItemPos);

  // モバイルメニュードロップダウン開閉用state
  const [isOpenMobileMenu, setIsOpenMobileMenu] = useState(false);
  const menuRef = useRef<HTMLUListElement | null>(null);

  // Zustandでヘッダーが200を超えたかどうかを保持
  // const isHeaderShown = useStore((state) => state.isHeaderShown);
  // const isHeaderTop = useStore((state) => state.isHeaderTop);

  // ============ ヘッダー 下スクロール時に非表示、上スクロール時に表示 ============
  const [isHeaderShown, setIsHeaderShown] = useState(true);
  const [isHeaderTop, setIsHeaderTop] = useState(true);
  const [currentY, setCurrentY] = useState(0);
  const [lightTextBorderLine, setLightTextBorderLine] = useState(false);

  const handleScrollEvent = useCallback(() => {
    console.log("scrollイベント発火🔥 現在のscrollY, currentY", scrollY, currentY);

    // headerの高さ100px、scrollYが100以下か上にスクロールした場合はheaderを表示
    if (window.scrollY < 100 || window.scrollY < currentY) {
      setIsHeaderShown(true);
    } else {
      setIsHeaderShown(false);
    }
    setCurrentY(window.scrollY);

    // 画面が最上部の時はヘッダーを透明にする
    // if (window.scrollY > 0) {
    //   setIsHeaderTop(false);
    // } else {
    //   setIsHeaderTop(true);
    // }
    if (window.scrollY > 200) {
      setIsHeaderTop(false);
    } else {
      setIsHeaderTop(true);
    }
    // }, [currentY, isHeaderShown, isHeaderTop]);
    // テーマがライトでwindowが830を超えたらヘッダーの文字色を黒にする
    if (800 < currentY) {
      if (lightTextBorderLine === true) return;
      setLightTextBorderLine(true);
      console.log("ヘッダー文字色を黒に変更");
    } else {
      if (lightTextBorderLine === false) return;
      console.log("ヘッダー文字色を白に変更");
      setLightTextBorderLine(false);
    }
  }, [currentY]);

  useEffect(() => {
    console.log("window", window.scrollY, lightTextBorderLine);
    window.addEventListener(`scroll`, handleScrollEvent);

    return () => {
      window.removeEventListener("scroll", handleScrollEvent);
    };
  }, [handleScrollEvent]);
  // =======================================================================

  // 仮コード🌟
  const supabase = useSupabaseClient();
  async function deleteUser() {
    const { data, error } = await supabase.from("users").delete().match({ id: "7c2f2aa0-040f-4ff1-acb0-09fc08364e46" });

    if (error) {
      console.error("Error deleting user: ", error);
    } else {
      console.log("User deleted: ", data);
      toast.success("Success!", {
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
  }

  const handleAuthLoginLogout = async () => {
    if (!sessionState) {
      setIsLogin(true);
      setIsOpenModal(true);
    } else {
      const { error } = await supabase.auth.signOut();
      console.log("error", error);
      if (error) alert(error);
    }
  };

  const switchLightTextColor = `${
    theme === "light" ? `${lightTextBorderLine ? `${styles.navbarTextBlack}` : `${styles.navbarTextWhite}`}` : ``
  }`;

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-[80] flex h-[100px] w-[100%] items-center justify-between  px-[22px] py-[30px] md:px-[10%]  ${
          theme === "dark" ? darkModeColor : lightModeColor
        } ${isHeaderShown ? " opacity-100 " : "opacity-0"}  ${
          isHeaderTop ? "transition-base08" : "transition-base border-shadow backdrop-blur-md"
        } ${isHoveringHeader ? "transition-base01 border-shadow backdrop-blur-[6px]" : ""}`}
        onMouseEnter={() => {
          if (!isHeaderTop) return;
          console.log("マウスEnter");
          setIsHoveringHeader(true);
        }}
        onMouseLeave={() => {
          if (!isHeaderTop) return;
          console.log("マウスLeave");
          setIsHoveringHeader(false);
        }}
      >
        <Link
          href="#"
          scroll={true}
          prefetch={false}
          className="relative flex h-full w-auto cursor-pointer select-none items-center justify-center"
        >
          {/* <div className="relative flex h-full w-auto cursor-pointer select-none items-center justify-center"> */}
          {logoSrc ? (
            <Image
              src={theme === "dark" ? logoSrcDark : lightTextBorderLine ? logoSrc : logoSrcDark}
              alt=""
              fill
              sizes="10vw"
              placeholder="blur"
              blurDataURL={theme === "dark" ? blurDataURLDark : blurDataURL}
              className="!relative !h-[60px] !w-[200px] object-cover"
            />
          ) : (
            <span
              className={`ml-[-45px] text-[30px] font-[600] ${
                theme === "dark" ? `${darkModeTextColor}` : `${lightModeTextColor}`
              } `}
            >
              TRUSTiFY
            </span>
          )}
          {/* </div> */}
        </Link>
        <nav>
          <ul
            className={`hidden h-full w-auto items-center justify-around text-[16px] font-[500] text-[--navColor] md:flex `}
          >
            <li className={`${styles.navList} ${switchLightTextColor}`}>
              <Link href="#product" scroll={false} prefetch={false} className={`${styles.navbarItem}`}>
                <span>
                  {language === "Ja" && "製品"}
                  {language === "En" && "Products"}
                </span>
                <div className={`${styles.underline}`} />
              </Link>
            </li>
            <li className={`${styles.navList} ${switchLightTextColor}`}>
              <Link href="#price" scroll={false} prefetch={false} className={`${styles.navbarItem}`}>
                <span>
                  {language === "Ja" && "料金"}
                  {language === "En" && "Pricing"}
                </span>
                <div className={`${styles.underline}`} />
              </Link>
            </li>
            <li className={`${styles.navList} ${switchLightTextColor}`}>
              <Link href="/about" prefetch={false} className={`${styles.navbarItem}`}>
                <span>
                  {language === "Ja" && "企業"}
                  {language === "En" && "About"}
                </span>
                <div className={`${styles.underline}`} />
              </Link>
            </li>
            <li className={`${styles.navList} ${switchLightTextColor}`}>
              <button className={`${styles.navbarItem}`} onClick={handleAuthLoginLogout}>
                {sessionState ? (
                  <span>
                    {language === "Ja" && "ログアウト"}
                    {language === "En" && "Log out"}
                  </span>
                ) : (
                  <span>
                    {language === "Ja" && "ログイン"}
                    {language === "En" && "Log in"}
                  </span>
                )}
                <div className={`${styles.underline}`} />
              </button>
            </li>
            <li className={`${styles.navList}`}>
              <LangBtn />
              {clickedItemPos && <LangMenu />}
            </li>
            <li className={`${styles.navList}`}>
              <button
                className={`${styles.navbarButton}`}
                onClick={() => {
                  setIsLogin(false);
                  setIsOpenModal(true);
                }}
              >
                <span>
                  {language === "Ja" && "始める"}
                  {/* {language === "En" && "Get started for free"} */}
                  {language === "En" && "Get started"}
                </span>
                {/* <div className={`${styles.underline}`} /> */}
              </button>
            </li>
          </ul>
        </nav>
        {/* モバイルメニュー */}
        <div
          className={`relative z-0 flex cursor-pointer text-[20px] font-[500] md:hidden ${
            theme === "dark" ? `${darkModeTextColor}` : `${lightModeTextColor} `
          }`}
          onClick={() => {
            // menuRef.current?.classList.toggle(`${styles.isOpenMobileMenu}`);
            setIsOpenMobileMenu(!isOpenMobileMenu);
          }}
        >
          <span>MENU</span>
          <ul
            className={`${isOpenMobileMenu && `${styles.isOpenMobileMenu}`} ${styles.dropDown_ul} ${
              theme === "dark" ? `${darkModeColor}` : `${lightModeColor} border border-[#999]`
            } `}
            ref={menuRef}
          >
            <li className={`${styles.dropDown_li} hover:bg-[#b3b3b3]/[0.3]`}>
              {/* <PencilAltIcon
                className={`h-5 w-5 cursor-pointer ${isDarkMode ? `${darkModeTextColor}` : `${lightModeTextColor}`}`}
              /> */}
              <Link href="/" prefetch={false}>
                Home
              </Link>
            </li>
            <li className={`${styles.dropDown_li} hover:bg-[#b3b3b3]/[0.3]`}>
              {/* <PencilAltIcon
                className={`h-5 w-5 cursor-pointer ${isDarkMode ? `${darkModeTextColor}` : `${lightModeTextColor}`}`}
              /> */}
              <Link href="/" prefetch={false}>
                About
              </Link>
            </li>
            <li className={`${styles.dropDown_li} hover:bg-[#b3b3b3]/[0.3]`}>
              {/* <PencilAltIcon
                className={`h-5 w-5 cursor-pointer ${isDarkMode ? `${darkModeTextColor}` : `${lightModeTextColor}`}`}
              /> */}
              <Link href="/" prefetch={false}>
                Work
              </Link>
            </li>
            <li className={`${styles.dropDown_li} hover:bg-[#b3b3b3]/[0.3]`}>
              {/* <PencilAltIcon
                className={`h-5 w-5 cursor-pointer ${isDarkMode ? `${darkModeTextColor}` : `${lightModeTextColor}`}`}
              /> */}
              <Link href="/" prefetch={false}>
                Contact
              </Link>
            </li>
          </ul>
        </div>
      </header>
      {/* モバイルオーバーレイ */}
      <div
        className={`${isOpenMobileMenu ? "fixed inset-0 z-[10] bg-[#00000099]" : "hidden"}`}
        onClick={() => {
          // menuRef.current?.classList.toggle(`${styles.isOpenMobileMenu}`);
          setIsOpenMobileMenu(false);
        }}
      />
    </>
  );
};
