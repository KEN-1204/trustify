import { Layout } from "@/components/Layout";
import useStore from "@/store";
import useThemeStore from "@/store/useThemeStore";
import React from "react";
import { useEffectOnce } from "react-use";
import { AiOutlineArrowLeft, AiOutlineArrowRight } from "react-icons/ai";
import { useRouter } from "next/router";

const About = () => {
  const language = useStore((state) => state.language);
  const setTheme = useThemeStore((state) => state.setTheme);
  // const setTheme = useStore((state) => state.setTheme);

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

  // ログイン時にテーマをライトに設定する
  useEffectOnce(() => {
    setTheme("light");
    // setTheme("light");
  });
  return (
    <Layout title={langTitle}>
      <div className="flex h-screen w-full flex-col items-center px-[10%] py-[5%] text-[var(--color-text)]">
        <div className="relative h-[3px] w-full rounded-full bg-[var(--color-border)]">
          <div className="absolute z-10 h-[3px] w-[30px] rounded-full bg-[var(--color-bg-brand)]"></div>
        </div>

        <div className="my-[50px] flex  w-full flex-col ">
          <h1 className="text-[40px] font-bold">会社概要</h1>
          <span className="mt-[5px] text-[12px] text-[var(--color-bg-brand)]">Overview</span>
        </div>

        <div className="my-[30px] flex  w-full flex-col">
          <div className="h-[3px] w-full bg-[var(--color-border)]"></div>
          <div className="flex">
            <div className="flex w-1/2 flex-col pr-[50px]">
              <div className="flex h-full items-center py-[35px] font-semibold">
                <div className="mr-[80px] w-[64px] ">社名</div>
                <div>株式会社トラスティファイ</div>
              </div>
              <div className="h-[3px] w-full bg-[var(--color-border)]"></div>
            </div>
            <div className="flex w-1/2 flex-col pr-[10px]">
              <div className="flex h-full items-center py-[35px] font-semibold">
                <div className="mr-[80px] w-[64px]">所在地</div>
                <div>東京都港区北青山1-3-1 アールキューブ3F</div>
              </div>
              <div className="h-[3px] w-full bg-[var(--color-border)]"></div>
            </div>
          </div>
          <div className="flex">
            <div className="flex w-1/2 flex-col pr-[50px]">
              <div className="flex h-full items-center py-[35px] font-semibold">
                <div className="mr-[80px] w-[64px]">代表者</div>
                <div>伊藤 謙太</div>
              </div>
              <div className="h-[3px] w-full bg-[var(--color-border)]"></div>
            </div>
            <div className="flex w-1/2 flex-col pr-[10px]">
              <div className="flex h-full items-center py-[35px] font-semibold">
                <div className="mr-[80px] w-[64px]">連絡先</div>
                <div>info@thetrustify.com</div>
              </div>
              <div className="h-[3px] w-full bg-[var(--color-border)]"></div>
            </div>
          </div>
          <div className="flex">
            <div className="flex w-full flex-col pr-[50px]">
              <div className="flex h-full items-center py-[35px] font-semibold">
                <div className="mr-[80px] w-[64px]">事業内容</div>
                <div>クラウドアプリケーションの開発、運営、セールスコンサルティング事業</div>
              </div>
              <div className="h-[3px] w-full bg-[var(--color-border)]"></div>
            </div>
          </div>
        </div>
        <div className="mt-[30px] flex h-[30px] w-full cursor-pointer" onClick={() => router.push("/")}>
          <div className="flex-center h-[30px] w-[30px] rounded-full">
            <AiOutlineArrowLeft className="text-[20px]" />
          </div>
          <div className="flex-center ml-[10px] h-[30px] font-bold">戻る</div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
