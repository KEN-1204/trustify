import { Layout } from "@/components/Layout";
import { Root } from "@/components/Root/Root";
import { Header } from "@/components/Header/Header";
import useStore from "@/store";
import { LangMenu } from "@/components/Parts/LangMenu/LangMenu";
import { LangMenuOver } from "@/components/Parts/LangMenuOver/LangMenuOver";

export default function Home() {
  const titleL = "TRUSTiFY | Get the best";

  // 言語ドロップダウンメニュー
  const clickedItemPos = useStore((state) => state.clickedItemPos);
  const clickedItemPosOver = useStore((state) => state.clickedItemPosOver);

  return (
    <Layout title={titleL}>
      <Header
        logoSrc="/assets/images/Trustify_logo_white1.png"
        blurDataURL="/assets/images/Trustify_logo_white1_blur.png"
        logoSrcDark="/assets/images/Trustify_logo_black.png"
        blurDataURLDark="/assets/images/Trustify_logo_black_blur.png"
      />
      <Root />
      {clickedItemPos && <LangMenu />}
      {clickedItemPosOver && <LangMenuOver />}
    </Layout>
  );
}
