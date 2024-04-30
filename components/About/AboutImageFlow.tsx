import useStore from "@/store";
import useThemeStore from "@/store/useThemeStore";
import React, { useEffect, useRef, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useRouter } from "next/router";
import NextImage from "next/image";
import LegacyImage from "next/legacy/image";
import useRootStore from "@/store/useRootStore";
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";
import { SpinnerBrand } from "../Parts/SpinnerBrand/SpinnerBrand";
import styles from "./About.module.css";
import PersonImages from "@/assets/images/Person";

export const AboutImageFlowComponent = () => {
  const language = useStore((state) => state.language);
  const setActivePage = useStore((state) => state.setActivePage);
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 言語別タイトル
  let langTitle;
  switch (language) {
    case "ja":
      langTitle = "会社概要 | TRUSTiFY";
      break;
    case "en":
      langTitle = "About | TRUSTiFY";
      break;
    default:
      langTitle = "TRUSTiFY";
      break;
  }

  const bgImageUrl =
    theme === "dark"
      ? `/assets/images/hero/slide_transparent_shadow_white_55_b3x_last.png`
      : `/assets/images/hero/slide_transparent_shadow_black_b3x_last.png`;

  // メイン画像が読み込まれたら、placeholderの画像を非表示にする
  useEffect(() => {
    const bgImage = new Image();
    // bgImage.src = bgImageUrl; // メイン背景画像のパス
    bgImage.src = `/assets/images/hero/slide_transparent_shadow_white_55_b3x_last.png`; // メイン背景画像のパス
    // 背景画像の読み込みが完了したら、isBackgroundLoadedをtrueに設定
    bgImage.onload = () => {
      if (!isBackgroundLoaded) {
        setIsBackgroundLoaded(true);
      }
    };
  }, []);

  // ページ遷移時にテーマをライトに設定する
  useEffect(() => {
    // setTheme("light");
  }, []);

  // タイプライターアニメーションの各trueの値をfalseに戻す
  const setStartAnimationFeature1 = useStore((state) => state.setStartAnimationFeature1);
  const setStartAnimationFeature2 = useStore((state) => state.setStartAnimationFeature2);
  const setStartAnimationFeature3 = useStore((state) => state.setStartAnimationFeature3);
  const setStartAnimationFeature4 = useStore((state) => state.setStartAnimationFeature4);

  useEffect(() => {
    setStartAnimationFeature1(false);
    setStartAnimationFeature2(false);
    setStartAnimationFeature3(false);
    setStartAnimationFeature4(false);
  }, []);

  const polkaDotsBgsRef = useRef<HTMLDivElement | null>(null);
  const gradientBgRef = useRef<HTMLDivElement | null>(null);

  const imageRef1 = useRef<HTMLImageElement | null>(null);
  const imageRef2 = useRef<HTMLImageElement | null>(null);
  const imageRef3 = useRef<HTMLImageElement | null>(null);
  const imageRef4 = useRef<HTMLImageElement | null>(null);
  const imageRef5 = useRef<HTMLImageElement | null>(null);
  const imageRef6 = useRef<HTMLImageElement | null>(null);
  const imageRef7 = useRef<HTMLImageElement | null>(null);
  const imageRef8 = useRef<HTMLImageElement | null>(null);
  const imageRef9 = useRef<HTMLImageElement | null>(null);
  const imageRef10 = useRef<HTMLImageElement | null>(null);
  const imageRef11 = useRef<HTMLImageElement | null>(null);
  const imageRef12 = useRef<HTMLImageElement | null>(null);

  // ========================= シャドウカバーホバー用 =========================
  const shadowCoverRef = useRef<HTMLDivElement | null>(null);
  const handleToggleOpacity = () => {
    console.log("handleToggleOpacityイベント発火🔥");
    shadowCoverRef.current?.classList.toggle(`${styles.isOpacity0}`); //NextJS版
    // bannerRef.current?.classList.toggle("night"); //通常React版
  };
  // =======================================================================

  const images1 = [
    {
      key: `image1_1`,
      src: `/assets/images/root2/Home_white_resize.png`,
    },
    {
      key: `image1_2`,
      src: `/assets/images/root2/Home_white_resize.png`,
    },
    {
      key: `image1_3`,
      src: `/assets/images/root2/Home_white_resize.png`,
    },
    {
      key: `image1_4`,
      src: `/assets/images/root2/Home_white_resize.png`,
    },
    {
      key: `image1_5`,
      src: `/assets/images/root2/Home_white_resize.png`,
    },
    {
      key: `image1_6`,
      src: `/assets/images/root2/Home_white_resize.png`,
    },
  ];

  return (
    <>
      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div
          className={`flex-center fixed left-0 top-0 z-[5000] h-full w-full bg-[var(--overlay-loading-modal-inside99)]`}
          style={{}}
        >
          <SpinnerBrand withBorder withShadow />
        </div>
      )}

      {/* ---------------- メインフローアニメーション ---------------- */}
      {/* <div className={`${styles.container} mainContainer  z-[10]`}>
        <div className={`${styles.main} transition-base `}>
          <div className={`${styles.wrapper}`} onMouseEnter={handleToggleOpacity} onMouseLeave={handleToggleOpacity}>
            <div className={`${styles.imgScroll}`}>
              <div>
                <NextImage src={PersonImages.man01} alt="" className={`${styles.img} imageRef1 `}></NextImage>
                <NextImage src={PersonImages.man02} alt="" className={`${styles.img} imageRef2 `}></NextImage>
                <NextImage src={PersonImages.man03} alt="" className={`${styles.img} imageRef3 `}></NextImage>
                <NextImage src={PersonImages.man04} alt="" className={`${styles.img} imageRef4 `}></NextImage>
                <NextImage src={PersonImages.woman01} alt="" className={`${styles.img} imageRef5 `}></NextImage>
                <NextImage src={PersonImages.woman02} alt="" className={`${styles.img} imageRef6 `}></NextImage>
              </div>
              <div>
                <NextImage src={PersonImages.man01} alt="" className={`${styles.img} imageRef7 `}></NextImage>
                <NextImage src={PersonImages.man02} alt="" className={`${styles.img} imageRef8 `}></NextImage>
                <NextImage src={PersonImages.man03} alt="" className={`${styles.img} imageRef9 `}></NextImage>
                <NextImage src={PersonImages.man04} alt="" className={`${styles.img} imageRef10 `}></NextImage>
                <NextImage src={PersonImages.woman01} alt="" className={`${styles.img} imageRef11 `}></NextImage>
                <NextImage src={PersonImages.woman02} alt="" className={`${styles.img} imageRef12 `}></NextImage>
              </div>
            </div>
            <div className={`${styles.imgScroll2}`}>
              <div>
                <NextImage src={PersonImages.woman01} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman02} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman03} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman04} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman05} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.man01} alt="" className={`${styles.img}`}></NextImage>
              </div>
              <div>
                <NextImage src={PersonImages.woman01} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman02} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman03} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman04} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman05} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.man01} alt="" className={`${styles.img}`}></NextImage>
              </div>
            </div>
            <div className={`${styles.imgScroll3}`}>
              <div>
                <NextImage src={PersonImages.woman05} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman04} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman03} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman02} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman01} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.man04} alt="" className={`${styles.img}`}></NextImage>
              </div>
              <div>
                <NextImage src={PersonImages.woman05} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman04} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman03} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman02} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.woman01} alt="" className={`${styles.img}`}></NextImage>
                <NextImage src={PersonImages.man04} alt="" className={`${styles.img}`}></NextImage>
              </div>
            </div>
          </div>
        </div>
      </div> */}
      {/* ---------------- メインフローアニメーション ここまで ---------------- */}

      {/* ---------------- シャドウグラデーション ---------------- */}
      {/* <div
        id="shadow_cover"
        ref={shadowCoverRef}
        className={`transition-base03 pointer-events-none absolute left-0 top-0 z-[40] h-[100dvh] w-full  ${
          theme === "light" ? "bg-gradient-to-b-light" : ""
        }`}
        style={{
          background: `linear-gradient(to bottom, rgba(20, 20, 20, 0) 0, rgba(20, 20, 20, .0) 15%, rgba(20, 20, 20, .0) 29%, rgba(20, 20, 20, .30) 44%, rgba(20, 20, 20, .50) 68%, rgba(20, 20, 20, .90) 100%)`,
        }}
      ></div> */}
      {/* ---------------- シャドウグラデーション ここまで ---------------- */}

      {/* ---------------- 水玉グラデーション ---------------- */}
      <div ref={polkaDotsBgsRef} className="absolute inset-0 z-[0] overflow-hidden">
        {/* <div className="bg-gradient-brand1  z-1 absolute bottom-[-300px] left-[-400px] h-[500px] w-[500px] rounded-full"></div> */}
        <div className="bg-gradient-brand2  z-1 absolute left-[39%] top-[-900px] h-[1120px] w-[1120px] rounded-full"></div>
        <div className="bg-gradient-brand3  z-1 absolute bottom-[-200px] right-[-100px] h-[300px] w-[300px] rounded-full"></div>
      </div>
      {/* ---------------- 水玉グラデーション ここまで ---------------- */}

      <div
        className="relative z-[30] flex h-screen w-full flex-col items-start overflow-hidden px-[10%] py-[5%] text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-family-discord)" }}
      >
        {/* ------------------- 背景画像 ------------------- */}
        <div className={`pointer-events-none absolute inset-0 z-[100]`}>
          <div
            className={`transition-base03 pointer-events-none absolute inset-0 z-[-1]`}
            // className={`${
            //   theme === "dark" ? `about-bg-dark` : `about-bg-light`
            // } transition-base03 pointer-events-none absolute inset-0 z-50`}
            // style={{ opacity: isBackgroundLoaded ? 1 : 0 }}
          />
          {/* {!isBackgroundLoaded && (
            <NextImage
              src={`/assets/images/hero/placeholder/slide_tp_sdw_bk_b3x_last_placeholder300.png`}
              alt=""
              blurDataURL="/assets/images/hero/placeholder/slide_tp_sdw_bk_b3x_last_placeholder64.png"
              placeholder="blur"
              fill
              sizes="100vw"
              className="z-[1] h-full w-full object-cover"
            />
          )} */}
        </div>
        {/* ------------------- 背景画像 ここまで ------------------- */}

        {/* ---------------- 水玉グラデーション ---------------- */}
        <div ref={polkaDotsBgsRef} className="pointer-events-none absolute inset-0 z-[40] overflow-hidden">
          <div className="bg-gradient-brand1  z-1 absolute bottom-[-300px] left-[-400px] h-[500px] w-[500px] rounded-full"></div>
          {/* <div className="bg-gradient-brand2  z-1 absolute left-[39%] top-[-900px] h-[1120px] w-[1120px] rounded-full"></div> */}
          {/* <div className="bg-gradient-brand3  z-1 absolute bottom-[-200px] right-[-100px] h-[300px] w-[300px] rounded-full"></div> */}
        </div>
        {/* ---------------- 水玉グラデーション ここまで ---------------- */}
        {/* ------------------- 背景フローアニメーション ------------------- */}
        <div className={`${styles.container} mainContainer  z-[30]`}>
          <div className={`${styles.main} transition-base`}>
            <div className={`${styles.wrapper}`} onMouseEnter={handleToggleOpacity} onMouseLeave={handleToggleOpacity}>
              <div className={`${styles.imgScroll}`}>
                <div className={`${styles.scroll_container}`}>
                  {Array(6)
                    .fill(null)
                    .map((_, index) => (
                      <div key={`${index}_sss`} className={`${styles.image_box}`}>
                        <NextImage
                          // src={PersonImages.woman01}
                          src={PersonImages.woman01}
                          placeholder="blur"
                          blurDataURL={PersonImages.woman01.blurDataURL}
                          alt=""
                          className={`${styles.image}`}
                        ></NextImage>
                        <div
                          className={`${styles.image_blur}`}
                          style={{ backgroundImage: `url(${PersonImages.woman01.src})` }}
                        ></div>
                      </div>
                    ))}
                </div>
                <div className={`${styles.scroll_container}`}>
                  {Array(6)
                    .fill(null)
                    .map((_, index) => (
                      <div key={`${index}_ss`} className={`${styles.image_box}`}>
                        <NextImage
                          src={PersonImages.woman01}
                          placeholder="blur"
                          blurDataURL={PersonImages.woman01.blurDataURL}
                          alt=""
                          className={`${styles.image}`}
                        ></NextImage>
                        <div
                          className={`${styles.image_blur}`}
                          style={{ backgroundImage: `url(${PersonImages.woman01.src})` }}
                          // style={{ background: `#fff` }}
                        ></div>
                      </div>
                    ))}
                </div>
              </div>
              <div className={`${styles.imgScroll2}`}>
                <div className={`${styles.scroll_container}`}>
                  <NextImage src={PersonImages.woman01} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman02} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman03} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman04} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman05} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.man01} alt="" className={`${styles.img}`}></NextImage>
                </div>
                <div className={`${styles.scroll_container}`}>
                  <NextImage src={PersonImages.woman01} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman02} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman03} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman04} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman05} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.man01} alt="" className={`${styles.img}`}></NextImage>
                </div>
              </div>
              <div className={`${styles.imgScroll3}`}>
                <div className={`${styles.scroll_container}`}>
                  <NextImage src={PersonImages.woman05} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman04} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman03} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman02} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman01} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.man04} alt="" className={`${styles.img}`}></NextImage>
                </div>
                <div className={`${styles.scroll_container}`}>
                  <NextImage src={PersonImages.woman05} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman04} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman03} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman02} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.woman01} alt="" className={`${styles.img}`}></NextImage>
                  <NextImage src={PersonImages.man04} alt="" className={`${styles.img}`}></NextImage>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* ---------------- シャドウグラデーション ---------------- */}

        <div
          id="shadow_cover"
          ref={shadowCoverRef}
          className={`transition-base03 pointer-events-none absolute left-0 top-0 z-[30] h-[100dvh] w-full  ${
            theme === "light" ? "bg-gradient-to-b-light hidden" : ""
          }`}
          style={{
            background: `linear-gradient(to bottom, rgba(20, 20, 20, 0) 0, rgba(20, 20, 20, .0) 15%, rgba(20, 20, 20, .0) 29%, rgba(20, 20, 20, .30) 44%, rgba(20, 20, 20, .50) 68%, rgba(20, 20, 20, .90) 100%)`,
          }}
        ></div>
        {/* ---------------- シャドウグラデーション ここまで ---------------- */}
        {/* ------------------- 背景フローアニメーション ここまで ------------------- */}

        {/* 画面トップのボーダー */}
        <div className="transition-base03 z-1 relative mr-auto min-h-[3px] w-full rounded-full bg-[var(--color-border)]">
          <div className="absolute z-10 min-h-[3px] w-[30px] rounded-full bg-[var(--color-bg-brand-f)]"></div>
        </div>
        {/* 画面トップのボーダー ここまで */}

        <div className="transition-base03 relative z-[10] my-[20px] flex w-full flex-col">
          <h1 className="text-[40px] font-bold">
            {language === "ja" && `会社概要`}
            {language === "en" && `About us`}
          </h1>
          <span className="mt-[5px] text-[12px] text-[var(--color-bg-brand-f)]">Overview</span>
        </div>
        {/* 画面左パターン */}
        <div className="relative z-[30] mt-[20px] flex w-[50%]">
          <div className="transition-base03 pointer-events-none relative z-[0] flex min-h-[450px] w-[100%] flex-col"></div>
          <div className="transition-base03 absolute left-0 top-0 z-[50] flex w-[100%] flex-col">
            <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            <div className="underline_area flex w-full flex-col">
              <div
                className="flex h-full items-center py-[30px] font-semibold"
                // onMouseEnter={() => sectionRef1.current?.classList.add(`hover`)}
                // onMouseLeave={() => sectionRef1.current?.classList.remove(`hover`)}
              >
                <div className={`min-w-[150px]`}>
                  {/* <div className="mr-[80px] min-w-[64px]"> */}
                  {language === "ja" && `社名`}
                  {language === "en" && `Company`}
                </div>
                <div className="brand_text">
                  {language === "ja" && `株式会社トラスティファイ / TRUSTiFY, Inc.`}
                  {language === "en" && `TRUSTiFY, Inc.`}
                </div>
              </div>
              {/* アンダーライン */}
              <div className="flow_underline"></div>
              {/* <div className="flow_underline" ref={sectionRef1}></div> */}
              {/* <div className="h-[2px] w-full bg-[var(--color-border)]"></div> */}
            </div>
            <div className="underline_area flex w-full flex-col">
              <div className="flex h-full items-center py-[30px] font-semibold">
                <div className={`min-w-[150px]`}>
                  {/* <div className="mr-[80px] min-w-[64px]"> */}
                  {language === "ja" && `所在地`}
                  {language === "en" && `Address`}
                </div>
                <div className="brand_text">
                  {language === "ja" && `東京都港区北青山1-3-1 アールキューブ青山3F`}
                  {language === "en" && `R Cube Aoyama 3F, 1-3-1, Kitaaoyama, Minato-ku, Tokyo, Japan`}
                </div>
              </div>
              {/* <div className="h-[2px] w-full bg-[var(--color-border)]"></div> */}
              <div className="flow_underline"></div>
            </div>
            <div className="underline_area flex w-full flex-col">
              <div className="flex h-full items-center py-[30px] font-semibold">
                <div className={`min-w-[150px]`}>
                  {/* <div className="mr-[80px] min-w-[64px]"> */}
                  {language === "ja" && `代表者`}
                  {language === "en" && `CEO`}
                </div>
                <div className="brand_text">
                  {language === "ja" && `伊藤 謙太`}
                  {language === "en" && `Kenta Ito`}
                </div>
              </div>
              {/* <div className="h-[2px] w-full bg-[var(--color-border)]"></div> */}
              <div className="flow_underline"></div>
            </div>
            <div className="underline_area flex w-full flex-col ">
              <div className="flex h-full items-center py-[30px] font-semibold">
                <div className={`min-w-[150px]`}>
                  {/* <div className="mr-[80px] min-w-[64px]"> */}
                  {language === "ja" && `連絡先`}
                  {language === "en" && `Contact`}
                </div>
                <div className="brand_text">
                  <span
                    className={`cursor-copy select-none hover:text-[var(--color-text-brand-f)] hover:underline`}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText("info@thetrustify.com");
                        toast.success(`コピーしました!`, {
                          // position: "bottom-center",
                          autoClose: 1500,
                          // hideProgressBar: false,
                          // closeOnClick: true,
                          // pauseOnHover: true,
                          // draggable: true,
                          // progress: undefined,
                          // transition: Zoom,
                        });
                      } catch (e: any) {
                        toast.error(`コピーできませんでした!`, {
                          // position: "top-right",
                          autoClose: 1500,
                          // hideProgressBar: false,
                          // closeOnClick: true,
                          // pauseOnHover: true,
                          // draggable: true,
                          // progress: undefined,
                          // transition: Zoom,
                        });
                      }
                    }}
                  >
                    trustify@thetrustify.com
                  </span>
                </div>
              </div>
              {/* <div className="h-[2px] w-full bg-[var(--color-border)]"></div> */}
              <div className="flow_underline"></div>
            </div>
            <div className="underline_area flex w-full flex-col">
              <div
                className="flex h-full items-center py-[30px] font-semibold"
                // onMouseEnter={() => sectionRef5.current?.classList.add(`hover`)}
                // onMouseLeave={() => sectionRef5.current?.classList.remove(`hover`)}
              >
                <div className={`min-w-[150px]`}>
                  {/* <div className="mr-[80px] min-w-[64px]"> */}
                  {language === "ja" && `事業内容`}
                  {language === "en" && `Services`}
                </div>
                <div className="brand_text w-[70%]">
                  {language === "ja" && `クラウドアプリケーションの開発、運営、セールスコンサルティング事業`}
                  {language === "en" && `Development and Operation the crowd application`}
                </div>
              </div>
              {/* <div className="h-[2px] w-full bg-[var(--color-border)]"></div> */}
              <div className="flow_underline z-0"></div>
            </div>
          </div>
          {/* <div className="pointer-events-none z-0 flex w-[50%] flex-col"></div> */}
        </div>
        {/* 画面左パターン ここまで */}
        <div className="relative z-[50] mt-[30px] flex h-[30px] w-full">
          <div
            className="transition-base03 flex cursor-pointer hover:text-[var(--color-text-brand-f)] hover:underline"
            // onClick={() => router.push("/")}
            onClick={() => {
              setIsLoading(true);
              setTimeout(() => {
                setActivePage("Root");
              }, 500);
            }}
          >
            <div className="flex-center h-[30px] w-[30px] rounded-full">
              <AiOutlineArrowLeft className="text-[20px]" />
            </div>
            <div className="flex-center pointer-events-none ml-[10px] h-[30px] font-bold">
              {language === "ja" && `戻る`}
              {language === "en" && `Back`}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
