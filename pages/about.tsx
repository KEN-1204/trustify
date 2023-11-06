import { Layout } from "@/components/Layout";
import useStore from "@/store";
import useThemeStore from "@/store/useThemeStore";
import React, { useEffect } from "react";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { useRouter } from "next/router";
import Image from "next/image";
import useRootStore from "@/store/useRootStore";

const About = () => {
  const language = useStore((state) => state.language);
  const theme = useRootStore(useThemeStore, (state) => state.theme);
  const setTheme = useThemeStore((state) => state.setTheme);

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
      ? `/assets/images/hero/slide_transparent_shadow_white3x_55.png`
      : `/assets/images/hero/slide_transparent3x.png`;

  // ページ遷移時にテーマをライトに設定する
  useEffect(() => {
    setTheme("light");
  }, []);
  return (
    <Layout title={langTitle}>
      <div
        className="relative flex h-screen w-full flex-col items-center px-[10%] py-[5%] text-[var(--color-text)]"
        style={{ fontFamily: "var(--font-family-discord)" }}
      >
        {/* 背景画像 */}
        {/* <div className="absolute inset-0 z-[0] mr-[-150px]">
          <Image src={bgImageUrl} alt="" fill sizes="100vw" className="h-full w-full object-cover" />
        </div> */}
        <div className={`pointer-events-none absolute inset-0 z-[2]`}>
          <Image
            // src={`/assets/images/hero/slide_transparent3x.png`}
            src={bgImageUrl}
            alt=""
            // blurDataURL="/assets/images/hero/slide_transparent3_placeholder.png"
            blurDataURL="/assets/images/hero/slide_transparent3x_resize_compressed.png"
            placeholder="blur"
            fill
            sizes="100vw"
            className="z-[-1] h-full w-full object-cover"
          />
        </div>
        <div className="z-1 relative mr-auto min-h-[3px] w-full rounded-full bg-[var(--color-border)]">
          <div className="absolute z-10 min-h-[3px] w-[30px] rounded-full bg-[var(--color-bg-brand)]"></div>
        </div>

        <div className="z-1 relative my-[20px] flex  w-full flex-col ">
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
          <div className="flex w-[50%] flex-col">
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
                <div>trustify@thetrustify.com</div>
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
