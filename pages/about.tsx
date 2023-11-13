import { Layout } from "@/components/Layout";
import useStore from "@/store";
import useThemeStore from "@/store/useThemeStore";
import React, { useEffect, useState } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useRouter } from "next/router";
import NextImage from "next/image";
import useRootStore from "@/store/useRootStore";
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";

const About = () => {
  const language = useStore((state) => state.language);
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);
  const [isBackgroundLoaded, setIsBackgroundLoaded] = useState(false);
  const router = useRouter();

  // 言語別タイトル
  let langTitle;
  switch (language) {
    case "Ja":
      langTitle = "会社概要 | TRUSTiFY";
      break;
    case "En":
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
    setTheme("light");
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
  return (
    <Layout title={langTitle}>
      <div
        className="relative flex h-screen w-full flex-col items-center px-[10%] py-[5%] text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-family-discord)" }}
      >
        <div className={`pointer-events-none absolute inset-0 z-[100]`}>
          {/* 背景画像 */}
          <div
            className={`${
              theme === "dark" ? `about-bg-dark` : `about-bg-light`
            } transition-base03 pointer-events-none absolute inset-0 z-50`}
            // style={{ opacity: isBackgroundLoaded ? 1 : 0 }}
          />
          {/* <NextImage
            src={`/assets/images/hero/placeholder/slide_tp_sdw_bk_b3x_last_placeholder300.png`}
            alt=""
            fill
            sizes="100vw"
            className={`z-[1] h-full w-full object-cover ${isBackgroundLoaded && "opacity-0"}`}
          /> */}
          {/* {!isBackgroundLoaded && (
            <NextImage
              src={bgImageUrl}
              alt=""
              fill
              sizes="100vw"
              className="z-[0] h-full w-full object-cover opacity-0"
              onLoadedData={() => setIsBackgroundLoaded(true)}
            />
          )} */}
          {!isBackgroundLoaded && (
            <NextImage
              src={`/assets/images/hero/placeholder/slide_tp_sdw_bk_b3x_last_placeholder300.png`}
              alt=""
              blurDataURL="/assets/images/hero/placeholder/slide_tp_sdw_bk_b3x_last_placeholder64.png"
              placeholder="blur"
              fill
              sizes="100vw"
              className="z-[1] h-full w-full object-cover"
            />
          )}
        </div>
        {/* <div className={`pointer-events-none absolute inset-0 z-[0]`}>
          <Image
            src={`/assets/images/hero/bg_slide_black1x_compressed.png`}
            alt=""
            blurDataURL="/assets/images/hero/slide_transparent3x_resize_compressed.png"
            placeholder="blur"
            fill
            sizes="100vw"
            className="z-[-1] h-full w-full object-cover"
          />
          <div className="shadow-gradient-tb-md pointer-events-none absolute z-10 h-full w-full"></div>
        </div> */}
        <div className="z-1 transition-base03 relative mr-auto min-h-[3px] w-full rounded-full bg-[var(--color-border)]">
          <div className="absolute z-10 min-h-[3px] w-[30px] rounded-full bg-[var(--color-bg-brand)]"></div>
        </div>

        <div className="z-1 transition-base03 relative my-[20px] flex w-full flex-col">
          <h1 className="text-[40px] font-bold">会社概要</h1>
          <span className="mt-[5px] text-[12px] text-[var(--color-bg-brand)]">Overview</span>
        </div>
        {/* 画面全体パターン */}
        {/* <div className="z-1 relative min-h-[3px] w-full rounded-full bg-[var(--color-border)]">
          <div className="absolute z-10 min-h-[3px] w-[30px] rounded-full bg-[var(--color-bg-brand)]"></div>
        </div>

        <div className="z-1 relative my-[20px] flex  w-full flex-col ">
          <h1 className="text-[40px] font-bold">会社概要</h1>
          <span className="mt-[5px] text-[12px] text-[var(--color-bg-brand)]">Overview</span>
        </div> */}
        {/* 画面全体パターン ここまで */}
        {/* 画面全体パターン */}
        {/* <div className="z-1 relative my-[50px] flex  w-full flex-col ">
          <h1 className="text-[40px] font-bold">会社概要</h1>
          <span className="mt-[5px] text-[12px] text-[var(--color-bg-brand)]">Overview</span>
        </div> */}
        {/* 画面全体パターン ここまで */}

        {/* 画面全体パターン */}
        {/* <div className="my-[30px] flex  w-full flex-col">
          <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
          <div className="flex">
            <div className="flex w-1/2 flex-col pr-[50px]">
              <div className="flex h-full items-center py-[35px] font-semibold">
                <div className="mr-[80px] w-[64px]">社名</div>
                <div>株式会社トラスティファイ / TRUSTiFY, Inc.</div>
              </div>
              <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            </div>
            <div className="flex w-1/2 flex-col pr-[10px]">
              <div className="flex h-full items-center py-[35px] font-semibold">
                <div className="mr-[80px] w-[64px]">所在地</div>
                <div>東京都港区北青山1-3-1 アールキューブ青山3F</div>
              </div>
              <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            </div>
          </div>
          <div className="flex">
            <div className="flex w-1/2 flex-col pr-[50px]">
              <div className="flex h-full items-center py-[35px] font-semibold">
                <div className="mr-[80px] w-[64px]">代表者</div>
                <div>伊藤 謙太</div>
              </div>
              <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            </div>
            <div className="flex w-1/2 flex-col pr-[10px]">
              <div className="flex h-full items-center py-[35px] font-semibold">
                <div className="mr-[80px] w-[64px]">連絡先</div>
                <div>info@thetrustify.com</div>
              </div>
              <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            </div>
          </div>
          <div className="flex">
            <div className="flex w-full flex-col pr-[50px]">
              <div className="flex h-full items-center py-[35px] font-semibold">
                <div className="mr-[80px] w-[64px]">事業内容</div>
                <div>クラウドアプリケーションの開発、運営、セールスコンサルティング事業</div>
              </div>
              <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            </div>
          </div>
        </div> */}
        {/* 画面全体パターン */}
        {/* 画面全体パターン */}
        {/* <div className="mt-[30px] flex h-[30px] w-full">
          <div
            className="transition-base03 flex cursor-pointer hover:text-[var(--color-text-brand)] hover:underline"
            onClick={() => router.push("/")}
          >
            <div className="flex-center h-[30px] w-[30px] rounded-full">
              <AiOutlineArrowLeft className="text-[20px]" />
            </div>
            <div className="flex-center ml-[10px] h-[30px] font-bold ">戻る</div>
          </div>
        </div> */}
        {/* 画面全体パターン ここまで */}
        {/* 画面左パターン */}
        <div className="z-1 relative mt-[20px] flex w-full">
          <div className="transition-base03 flex w-[50%] flex-col">
            <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            <div className="flex w-full flex-col">
              <div className="flex h-full items-center py-[30px] font-semibold">
                <div className="mr-[80px] min-w-[64px]">社名</div>
                <div>株式会社トラスティファイ / TRUSTiFY, Inc.</div>
              </div>
              <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            </div>
            <div className="flex w-full flex-col ">
              <div className="flex h-full items-center py-[30px] font-semibold">
                <div className="mr-[80px] min-w-[64px]">所在地</div>
                <div>東京都港区北青山1-3-1 アールキューブ青山3F</div>
              </div>
              <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            </div>
            <div className="flex w-full flex-col">
              <div className="flex h-full items-center py-[30px] font-semibold">
                <div className="mr-[80px] min-w-[64px]">代表者</div>
                <div>伊藤 謙太</div>
              </div>
              <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            </div>
            <div className="flex w-full flex-col ">
              <div className="flex h-full items-center py-[30px] font-semibold">
                <div className="mr-[80px] min-w-[64px]">連絡先</div>
                <div>
                  <span
                    className={`cursor-copy select-none hover:text-[var(--color-text-brand-f)] hover:underline`}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText("info@thetrustify.com");
                        toast.success(`コピーしました!`, {
                          position: "bottom-center",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          transition: Zoom,
                        });
                      } catch (e: any) {
                        toast.error(`コピーできませんでした!`, {
                          position: "top-right",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          transition: Zoom,
                        });
                      }
                    }}
                  >
                    trustify@thetrustify.com
                  </span>
                </div>
              </div>
              <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            </div>
            <div className="flex w-full flex-col">
              <div className="flex h-full items-center py-[30px] font-semibold">
                <div className="mr-[80px] min-w-[64px]">事業内容</div>
                <div className="w-[70%]">クラウドアプリケーションの開発、運営、セールスコンサルティング事業</div>
              </div>
              <div className="h-[2px] w-full bg-[var(--color-border)]"></div>
            </div>
          </div>
          <div className="flex w-[50%] flex-col"></div>
        </div>
        {/* 画面左パターン ここまで */}
        <div className="z-1 relative mt-[30px] flex h-[30px] w-full">
          <div
            className="transition-base03 flex cursor-pointer hover:text-[var(--color-text-brand)] hover:underline"
            onClick={() => router.push("/")}
          >
            <div className="flex-center h-[30px] w-[30px] rounded-full">
              <AiOutlineArrowLeft className="text-[20px]" />
            </div>
            <div className="flex-center ml-[10px] h-[30px] font-bold ">戻る</div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
