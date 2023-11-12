import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import styles from "./Root.module.css";
import useStore from "@/store";
import Image from "next/image";
import Link from "next/link";
import { MdOutlineLanguage } from "react-icons/md";
import { AiFillCaretDown } from "react-icons/ai";
import Typed from "typed.js";
import { Auth } from "../Auth/Auth";
import { useUpdateEffect } from "react-use";
import { LangMenuOver } from "../Parts/LangMenuOver/LangMenuOver";
import { LangMenu } from "../Parts/LangMenu/LangMenu";
import { FeatureParagraph } from "./Features/FeatureParagraph";
import { FeatureParagraph2 } from "./Features/FeatureParagraph2";
import { FeatureParagraph3 } from "./Features/FeatureParagraph3";
import { FeatureParagraph4 } from "./Features/FeatureParagraph4";
import { toast } from "react-toastify";
import { Zoom } from "@/utils/Helpers/toastHelpers";

export const Root: FC = () => {
  console.log("Rootコンポーネントレンダリング");
  // 言語
  const language = useStore((state) => state.language);
  const openLangTab = useStore((state) => state.openLangTab);
  const setOpenLangTab = useStore((state) => state.setOpenLangTab);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);
  const setClickedItemPosOver = useStore((state) => state.setClickedItemPosOver);
  const isOpenModal = useStore((state) => state.isOpenModal);
  const setIsOpenModal = useStore((state) => state.setIsOpenModal);
  const setIsLogin = useStore((state) => state.setIsLogin);
  const getStartWithEmail = useStore((state) => state.getStartWithEmail);
  const setGetStartWithEmail = useStore((state) => state.setGetStartWithEmail);
  const setInputEmail = useStore((state) => state.setInputEmail);

  // 画像ホバー有無
  const [hoveredFeature1, setHoveredFeature1] = useState(false);
  const [hoveredFeature2, setHoveredFeature2] = useState(false);
  const [hoveredFeature3, setHoveredFeature3] = useState(false);
  const [hoveredFeature4, setHoveredFeature4] = useState(false);
  // Featureのタイトルh2タグのrefオブジェクト タイトルホバーでも動画を再生させる
  const FeatureDivRef1 = useRef<HTMLDivElement | null>(null);
  const FeatureDivRef2 = useRef<HTMLDivElement | null>(null);
  const FeatureDivRef3 = useRef<HTMLDivElement | null>(null);
  const FeatureDivRef4 = useRef<HTMLDivElement | null>(null);

  // 言語ドロップダウンメニュー
  const clickedItemPos = useStore((state) => state.clickedItemPos);
  const clickedItemPosOver = useStore((state) => state.clickedItemPosOver);

  // ============ ヘッダー 下スクロール時に非表示、上スクロール時に表示 ============
  const setIsHeaderShown = useStore((state) => state.setIsHeaderShown);
  const currentY = useRef(0);
  const setIsHeaderTop = useStore((state) => state.setIsHeaderTop);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleScrollEvent = useCallback(() => {
    if (!scrollRef.current) return; // Null check for scrollRef
    const currentScrollY = -scrollRef.current!.getBoundingClientRect().y;
    console.log("scrollイベント発火🔥 現在のscrollY, currentY", currentScrollY, currentY);
    // headerの高さ100px、scrollYが100以下か上にスクロールした場合はheaderを表示
    if (currentScrollY < 100 || currentScrollY < currentY.current) {
      setIsHeaderShown(true);
    } else {
      setIsHeaderShown(false);
    }
    currentY.current = currentScrollY;

    if (currentScrollY > 200) {
      setIsHeaderTop(false);
    } else {
      setIsHeaderTop(true);
    }
  }, []);

  useEffect(() => {
    if (!mainRef.current) return; // Null check for mainRef
    console.log("scrollRef.current", -scrollRef.current!.getBoundingClientRect().y);
    mainRef.current.addEventListener(`scroll`, handleScrollEvent);

    return () => {
      if (!mainRef.current) return; // Null check for mainRef
      mainRef.current.removeEventListener("scroll", handleScrollEvent);
    };
  }, [handleScrollEvent]);
  // =======================================================================
  // =======================================================================
  // 【タイピングアニメーション】
  const typingRef = useRef<HTMLDivElement | null>(null);
  const typed = useRef<any>(null);
  const [typedNode, setTypedNode] = useState<NodeListOf<ChildNode> | null>(null);
  useEffect(() => {
    typed.current = new Typed(typingRef.current, {
      strings: [
        `<span id='red' className="text_gradient_red text-[70px]">キーエンス</span> で培われた</span><br /><span className="whitespace-nowrap leading-normal">強力なデータベースを <span id='one' className="text_gradient">980円</span> で`,
      ],
      loop: false,
      typeSpeed: 80,
      // backSpeed: 30,
      // backDelay: 1000,
      onComplete: (self) => {
        console.log("🌟self", self);
        // self.cursor.remove();
        // ===============================================
        const redNode = document.querySelector("#red");
        const oneNode = document.querySelector("#one");
        console.log("redNode, oneNode", redNode, oneNode);
        if (!redNode || !oneNode) return;
        redNode?.classList.add(`${styles.text_gradient_red}`);
        oneNode?.classList.add(`${styles.text_gradient}`);
        // ===============================================
        // const children = typingRef.current?.innerHTML;
        // console.log(children);
        // if (typeof children === 'undefined') return
        // setTypedNode(children);
      },
    });
    // カーソルのスタイル変更はglobal.cssで.typed-cursorのクラスに当てて変更
    // .typed-cursor {color: #2196f3 !important;}

    // クリーンナップ関数
    return () => {
      // Destroy Typed instance during cleanup to stop animation
      typed.current.destroy();
    };
  }, []);

  // 英語へ言語切り替え時に日本語のタイピングテキストのカーソルを透明にして、
  // 日本語の時にはカーソルを表示させる
  useEffect(() => {
    if (language === "En") {
      if (!typed.current) return;
      typed.current.cursor.style.opacity = "0";
    }
    if (language === "Ja") {
      if (!typed.current) return;
      typed.current.cursor.style.opacity = "1";
    }
  }, [language]);
  // =======================================================================

  // メールアドレスを入力して「今すぐ始める」ボタンをクリックしたフロー
  const emailRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [email, setEmail] = useState("");
  const [checkedEmail, setCheckedEmail] = useState("");

  const regex = /^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

  // useEffect(() => {
  useUpdateEffect(() => {
    if (email === "") {
      console.log("🔥");
      emailRef.current?.classList.remove(`${styles.success}`);
      emailRef.current?.classList.remove(`${styles.error}`);
      setCheckedEmail("");
      return;
    }
    console.log("email", email);
    console.log("regex.test(email)", regex.test(email));
    if (regex.test(email)) {
      emailRef.current?.classList.add(`${styles.success}`);
      emailRef.current?.classList.remove(`${styles.error}`);
      setCheckedEmail("Valid");
    } else {
      emailRef.current?.classList.add(`${styles.error}`);
      emailRef.current?.classList.remove(`${styles.success}`);
      setCheckedEmail("Invalid");
    }
  }, [email]);

  return (
    <main className={`relative h-full w-full text-[--color-text] ${styles.main_container}`} ref={mainRef}>
      {/* 言語切り替えタブ表示時中のオーバーレイ */}
      {openLangTab && (
        <div
          className={styles.overlay}
          onClick={() => {
            setClickedItemPos(null);
            setClickedItemPosOver(null);
            setOpenLangTab(false);
          }}
        />
      )}
      {/* ======================== Heroセクション ======================== */}
      <div
        className={`transition-base-color h-[100dvh] w-[100vw]   ${styles.scroll_slides} ${styles.main}`}
        ref={scrollRef}
      >
        <div className="absolute left-0 top-0 -z-[0] h-[100dvh] w-[100dvw] overflow-hidden">
          <video
            autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            controlsList="nodownload"
            className={`h-[100%] w-[100%] scale-[1.02] object-cover`}
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src="/assets/videos/Root/top-bg3.mp4" type="video/mp4" />
          </video>
          {/* <video
            autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            className={`h-[100%] w-[100%] scale-[1.02]`}
          >
            <source src="/assets/videos/Root/top-bg3.mp4" type="video/mp4" />
          </video> */}
          {/* 画像背景 */}
          {/* <Image
            src={`/assets/images/hero/bg_slide_black1x_compressed.png`}
            alt=""
            blurDataURL={`/assets/images/hero/placeholder/bg_slide_black1x_resize_compressed.png`}
            placeholder="blur"
            fill
            sizes="100vw"
            className={`z-[0] h-full w-full select-none object-cover`}
          />
          <div className="shadow-gradient-tb-lg pointer-events-none absolute z-10 h-full w-full select-none"></div> */}
          {/* 画像背景 ここまで */}
        </div>
        {/* <div className="absolute left-0 top-0  z-0 h-[100dvh] w-[100dvw] bg-[#00000010]"></div> */}
        {/* <div className={`${styles.hero_overlay}`}></div> */}
        <div className={styles.hero}>
          <h1 className={`${language === "En" && "!max-w-full "}`}>
            {/* ========== タイピングアニメーション ========== */}
            <span
              className={`select-none truncate leading-normal ${language === "Ja" ? "" : "hidden"}`}
              ref={typingRef}
            ></span>
            {/* ========== タイピングアニメーション ========== */}
            {/* <span className="leading-normal">
              <span className={`${styles.text_gradient_red}`}> キーエンス</span> で培われた
            </span>
            <br />
            <span className="whitespace-nowrap leading-normal">
              強力なデータベースを <span className={`${styles.text_gradient} `}>ワンコイン</span> で
            </span> */}
            {/* {language === "En" && "Unlimited movies, TV shows and more."} */}
            {language === "En" && "Access the powerful database encapsulating the essence of KEYENCE for just $7."}
          </h1>
          <h3>
            {/* {language === "Ja" && "映画やドラマをもっと自由に。いつでもキャンセルOK。"} */}
            {language === "Ja" && "売上を上げ続ける仕組みを誰にでも。いつでもキャンセルOK。"}
            {/* {language === "En" && "Watch anywhere. Cancel anytime."} */}
            {language === "En" && "Raise sales to anyone. Cancel anytime."}
          </h3>
          <p>
            {language === "Ja" &&
              // "まもなくご視聴いただけます! メールアドレスを入力してメンバーシップを開始、または再開してください。"}
              "まもなくご利用いただけます! メールアドレスを入力してメンバーシップを開始してください。"}
            {/* {language === "En" && "Ready to watch? Enter your email to create or restart your membership."} */}
            {language === "En" && "Ready to use? Enter your email to create your membership."}
          </p>
          {/* ============= メールで始める ============= */}
          {/* <form className={`${styles.email_signUp}`}> */}
          {/* <button type="submit"> */}
          {/* <div className={`${styles.email_signUp}`}>
            {language === "Ja" && <input type="email" placeholder="メールアドレス" required />}
            {language === "En" && <input type="email" placeholder="Email Address" required />}

            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                setIsOpenModal(true);
              }}
            >
              {language === "Ja" && "今すぐ始める"}
              {language === "En" && "Get Started"}
            </button>
          </div> */}
          {/* </form> */}
          {/* ============= メールで始める ここまで ============= */}
          {/* ============= 始めるボタンでModal表示 Only ============= */}
          <div className={`${styles.btn_box}`}>
            <button
              onClick={() => {
                setIsLogin(false);
                setIsOpenModal(true); // メンテナンス完了後は表示
              }}
              className={`${styles.cta_btn}`}
            >
              {/* {language === "Ja" && "無料で始める"} */}
              {language === "Ja" && "今すぐ始める"}
              {/* {language === "Ja" && "メンテナンス中"} */}
              {/* {language === "En" && "Get Started for free"} */}
              {language === "En" && "Get Started"}
              {/* {language === "Ja" && "無料で始める"}
            {language === "En" && "Get Started for free"} */}
            </button>
          </div>
          {/* ============= 始めるボタンでModal表示 ここまで ============= */}
        </div>
      </div>

      <hr className={styles.horizon} />

      {/* バーチャルビデオ背景 ここから */}
      {/* {isOpenModal && (
        <div className={`fade fixed left-0 top-0 z-10 h-screen w-screen ${styles.virtual}`}>
          <video
            autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            className={`fade h-[100%] w-[100%] object-cover opacity-90`}
          >
            <source src="/assets/videos/Root/top-bg-virtual.mp4" type="video/mp4" />
          </video>
        </div>
      )} */}
      {/* バーチャルビデオ背景 ここまで */}

      {/* ======================== Featuresセクション ======================== */}
      {/* ======================== Feature1 ======================== */}
      <section
        id="product"
        className={`transition-base-color bg-[--color-bg-hp-main] ${styles.scroll_slides_row} relative`}
      >
        {/* バーチャルビデオ背景 ここから */}
        {/* {hoveredFeature1 && (
          <div className={`absolute left-0 top-0  h-full w-full`}>
            <video
              autoPlay={true}
              muted={true}
              playsInline={true}
              loop={true}
              className={`fade04 h-[100%] w-[100%] object-cover`}
            >
              <source src="/assets/videos/Root/top-bg-virtual.mp4" type="video/mp4" />
            </video>
          </div>
        )} */}
        <div
          className={`transition-base absolute left-0 top-0 h-full w-full ${
            hoveredFeature1 ? `opacity-100` : `pointer-events-none opacity-0`
            // hoveredFeature1 ? `opacity-0` : `pointer-events-none opacity-100`
          }`}
        >
          <video
            autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            className={`pointer-events-none h-[100%] w-[100%] select-none object-cover`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* <source src="/assets/videos/Root/top-bg-virtual.mp4" type="video/mp4" /> */}
            <source src="/assets/videos/Root/top-bg-virtual-compressed.mp4" type="video/mp4" />
          </video>
        </div>
        {/* バーチャルビデオ背景1 ここまで */}
        <div className={`${styles.text_col}`}>
          <h2
            className={`${styles.section_title} ${hoveredFeature1 ? `${styles.section_title_brand}` : ``} `}
            onMouseEnter={() => {
              FeatureDivRef1.current?.classList.add(`${styles.hover}`);
              setHoveredFeature1(true);
            }}
            onMouseLeave={() => {
              FeatureDivRef1.current?.classList.remove(`${styles.hover}`);
              setHoveredFeature1(false);
            }}
          >
            {/* {language === "Ja" && "最小の資本と人で、最大の経済効果を上げる"} */}
            {/* {language === "Ja" && "営業を科学する"} */}
            {language === "Ja" && "誰でも売れる組織へ"}
            {language === "En" && "To an organization where anyone can sell."}
            {/* {language === "Ja" && "大画面で楽しめる"}
            {language === "En" && "Enjoy on your TV."} */}
            <span className={`${styles.title_before}`}>
              {language === "Ja" && "誰でも売れる組織へ"}
              {language === "En" && "To an organization where anyone can sell."}
            </span>
          </h2>
          {/* <p className={`relative z-0 ${hoveredFeature1 ? `transition-base text-[#fff]` : ``}`}>
            {language === "Ja" &&
              "属人的になりがちな営業を「リスト作成、架電、アポ取り、商談、クロージング、サポート」の全てのプロセスをデータ化し、「売れる営業先・売れる営業手法・満足度を最大化するサポート手法」を可視化することで、どんな営業マンでも高い売上を上げ、「最小の資本と人で最大の経済効果を上げる」組織を実現します。"}
            {language === "En" &&
              "By datafying all the processes of sales, which tends to be personalized, such as 'list creation, cold calling, appointment setting, negotiation, closing, and support', and visualizing 'sales-boosting customers, sales-boosting methods, and support methods to maximize satisfaction', we realize an organization where any salesperson can generate high sales and 'maximize economic effects with the least amount of capital and people'."}
          </p> */}
          <FeatureParagraph hoveredFeature={hoveredFeature1} featureSection={1} />
        </div>
        <div className={`${styles.img_col} flex items-center`}>
          <div className={`${styles.light_back}`}>
            <div
              ref={FeatureDivRef1}
              className={`${styles.wrap}`}
              onMouseEnter={() => setHoveredFeature1(true)}
              onMouseLeave={() => setHoveredFeature1(false)}
            >
              <Image
                src="/assets/images/root2/feature01.png"
                // src="/assets/images/root/feature1.png"
                // src="/assets/images/feature-1.png"
                alt=""
                // placeholder="blur"
                // blurDataURL="/assets/images/feature-1-small.png"
                width={800}
                height={600}
                className={`${styles.img}`}
                onContextMenu={(e) => e.preventDefault()}
              />
              <video
                autoPlay={true}
                loop={true}
                playsInline={true}
                muted={true}
                onContextMenu={(e) => e.preventDefault()}
              >
                <source src="/assets/videos/dash-company-feature01.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
        {/* <div className={`${styles.img_col}`}>
          <Image
            // src="/assets/images/root2/feature1.png"
            src="/assets/images/root/feature1.png"
            // src="/assets/images/feature-1.png"
            alt=""
            placeholder="blur"
            blurDataURL="/assets/images/feature-1-small.png"
            width={800}
            height={600}
            className=""
          />
        </div> */}
      </section>

      <hr className={styles.horizon} />

      {/* ======================== Feature2 ======================== */}
      <section
        className={`transition-base-color bg-[--color-bg-hp-main] ${styles.scroll_slides_row} relative flex-row-reverse`}
      >
        {/* バーチャルビデオ背景2 ここから */}
        {/* {hoveredFeature2 && (
          <div className={`absolute left-0 top-0  h-full w-full`}>
            <video
              autoPlay={true}
              muted={true}
              playsInline={true}
              loop={true}
              className={`fade04 h-[100%] w-[100%] object-cover`}
            >
              <source src="/assets/videos/geographic-bg.mp4" type="video/mp4" />
            </video>
          </div>
        )} */}
        <div
          className={`transition-base absolute left-0 top-0 h-full w-full ${
            hoveredFeature2 ? `opacity-100` : `pointer-events-none opacity-0`
            // hoveredFeature2 ? `opacity-0` : `pointer-events-none opacity-100`
          }`}
        >
          <video
            autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            className={`h-[100%] w-[100%] object-cover`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* <source src="/assets/videos/geographic-bg.mp4" type="video/mp4" /> */}
            <source src="/assets/videos/geographic-compressed.mp4" type="video/mp4" />
          </video>
        </div>
        {/* バーチャルビデオ背景 ここまで */}
        <div className={`${styles.text_col}`}>
          {/* <h2>
            
            {language === "Ja" && `"今" 売れる営業先がすぐ見つかる`}
            {language === "En" && "Find 'current' sales prospects immediately"}
          </h2> */}
          <h2
            className={`${styles.section_title} ${hoveredFeature2 ? `${styles.section_title_brand}` : ``} `}
            onMouseEnter={() => {
              FeatureDivRef2.current?.classList.add(`${styles.hover}`);
              setHoveredFeature2(true);
            }}
            onMouseLeave={() => {
              FeatureDivRef2.current?.classList.remove(`${styles.hover}`);
              setHoveredFeature2(false);
            }}
          >
            {language === "Ja" && `"今" 売れる営業先がすぐ見つかる`}
            {language === "En" && "Find 'current' sales prospects immediately"}
            <span className={`${styles.title_before}`}>
              {language === "Ja" && `"今" 売れる営業先がすぐ見つかる`}
              {language === "En" && "Find 'current' sales prospects immediately"}
            </span>
          </h2>
          {/* <p className={`relative z-0 ${hoveredFeature2 ? `transition-base text-[#fff]` : ``}`}>
            {language === "Ja" &&
              `データベースから未知の客先にアポを組み、600万円の商品をその場でご注文いただくなど "今" 売れる営業を何度も経験してきました。 `}
            {language === "En" &&
              "I've had repeated experiences with 'current' successful sales, such as arranging appointments with unknown clients from the database and receiving on-the-spot orders for products worth around 55,000 USD."}
          </p>
          <p className={`relative z-0 ${hoveredFeature2 ? `transition-base text-[#fff]` : ``}`}>
            {language === "Ja" &&
              `Excelだとフリーズしてしまうような98万社もの膨大な会社データから自社の狙い先となり得る会社を、「業界、取引先、規模、今までの活動履歴」などの様々な条件から簡単、瞬時に抽出が可能です。 自社のサービスが解決する課題を持つ会社を瞬時に見つけ、競合よりも早く売ることができます。`}
            {language === "En" &&
              "You can easily and instantly extract potential target companies from our database, which holds data from 980,000 companies, based on various criteria such as 'industry, clients, scale, and past activities'. You can quickly find companies that have the problems your service solves, allowing you to sell faster than your competitors."}
          </p> */}
          <FeatureParagraph2 hoveredFeature={hoveredFeature2} featureSection={2} />
        </div>
        <div className={`${styles.img_col} flex items-center`}>
          <div className={`${styles.light_back}`}>
            <div
              ref={FeatureDivRef2}
              className={`${styles.wrap}`}
              onMouseEnter={() => setHoveredFeature2(true)}
              onMouseLeave={() => setHoveredFeature2(false)}
            >
              <Image
                src="/assets/images/root2/feature05.png"
                // src="/assets/images/root/feature2.png"
                // src="/assets/images/feature-4.png"
                alt=""
                // placeholder="blur"
                // blurDataURL="/assets/images/feature-4-small.png"
                // loading="lazy"
                width={800}
                height={600}
                className={`${styles.img}`}
                onContextMenu={(e) => e.preventDefault()}
              />
              <video
                autoPlay={true}
                loop={true}
                playsInline={true}
                muted={true}
                onContextMenu={(e) => e.preventDefault()}
              >
                <source src="/assets/videos/trustify-company-movie2-up.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
        {/* <div className={styles.img_col}>
          <Image
            // src="/assets/images/root2/feature2.png"
            src="/assets/images/root/feature2.png"
            // src="/assets/images/feature-4.png"
            alt=""
            placeholder="blur"
            blurDataURL="/assets/images/feature-4-small.png"
            // loading="lazy"
            width={800}
            height={600}
          />
        </div> */}
      </section>

      <hr className={styles.horizon} />

      {/* ======================== Feature3 ======================== */}
      <section className={`transition-base-color bg-[--color-bg-hp-main] ${styles.scroll_slides_row} relative`}>
        {/* バーチャルビデオ背景 ここから */}
        {/* {hoveredFeature3 && (
          <div className={`absolute left-0 top-0  h-full w-full`}>
            <video
              autoPlay={true}
              muted={true}
              playsInline={true}
              loop={true}
              className={`fade04 h-[100%] w-[100%] object-cover`}
            >
              <source src="/assets/videos/Root/top-bg-virtual.mp4" type="video/mp4" />
            </video>
          </div>
        )} */}
        <div
          className={`transition-base absolute left-0 top-0 h-full w-full ${
            hoveredFeature3 ? `opacity-100` : `pointer-events-none opacity-0`
          }`}
        >
          <video
            autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            className={`h-[100%] w-[100%] object-cover`}
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src="/assets/videos/Root/top-bg-virtual-compressed.mp4" type="video/mp4" />
          </video>
        </div>
        {/* バーチャルビデオ背景 ここまで */}
        <div className={`${styles.text_col}`}>
          {/* <h2>
            {language === "Ja" && "リスト作成時間を大幅に短縮し工数削減"}
            {language === "En" && "Significantly reduce list creation time and workload."}
            
          </h2> */}
          <h2
            className={`${styles.section_title} ${hoveredFeature3 ? `${styles.section_title_brand}` : ``} `}
            onMouseEnter={() => {
              FeatureDivRef3.current?.classList.add(`${styles.hover}`);
              setHoveredFeature3(true);
            }}
            onMouseLeave={() => {
              FeatureDivRef3.current?.classList.remove(`${styles.hover}`);
              setHoveredFeature3(false);
            }}
          >
            {language === "Ja" && "リスト作成時間を大幅に短縮し工数削減"}
            {language === "En" && "Significantly reduce list creation time and workload."}
            <span className={`${styles.title_before}`}>
              {language === "Ja" && "リスト作成時間を大幅に短縮し工数削減"}
              {language === "En" && "Significantly reduce list creation time and workload."}
            </span>
          </h2>
          {/* <p className={`relative z-0 ${hoveredFeature3 ? `transition-base text-[#fff]` : ``}`}>
            {language === "Ja" &&
              "キーエンスではリスト作成・架電・準備・営業・入金確認・サポートを全て一人で行います。そのため最小の時間で最大の売上を上げられるよう限られた時間で売れる営業先のリストを多くピックしなければなりません。"}
            {language === "En" &&
              "At Keyence, we handle everything from list creation, cold calling, preparation, sales, payment confirmation, to support all by ourselves. Therefore, in order to maximize sales in the shortest time possible, we must pick a large number of prospective clients from our lists in the limited time we have."}
          </p>
          <p className={`relative z-0 ${hoveredFeature3 ? `transition-base text-[#fff]` : ``}`}>
            {language === "Ja" &&
              "日々のリスト作成時間を1日30分短縮することで、20日稼働で月10時間の短縮、年間120時間の短縮となり、人件費1人当たり26万8680円/年、10人で260万円/年の導入効果に繋がります。(*人件費は中央値430万円/年で計算)"}
            {language === "En" &&
              "By reducing the daily list creation time by 30 minutes, you save 10 hours per month based on 20 working days, resulting in an annual reduction of 120 hours. This leads to a personnel cost saving of approximately $2,380 per person per year and $23,800 per year for a team of 10 people. (*Personnel costs are calculated based on the median annual income of $38,790)."}
          </p> */}
          <FeatureParagraph3 hoveredFeature={hoveredFeature3} featureSection={3} />
        </div>
        <div className={`${styles.img_col} flex items-center`}>
          <div className={`${styles.light_back}`}>
            <div
              ref={FeatureDivRef3}
              className={`${styles.wrap}`}
              onMouseEnter={() => setHoveredFeature3(true)}
              onMouseLeave={() => setHoveredFeature3(false)}
            >
              <Image
                src="/assets/images/root2/feature02.png"
                // src="/assets/images/root/feature3.png"
                // src="/assets/images/feature-3.png"
                alt=""
                // placeholder="blur"
                // blurDataURL="/assets/images/feature-3-small.png"
                // loading="lazy"
                width={800}
                height={600}
                className={`${styles.img}`}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </div>
        {/* <div className={`${styles.img_col}`}>
          <Image
            // src="/assets/images/root2/feature3.png"
            src="/assets/images/root/feature3.png"
            // src="/assets/images/feature-3.png"
            alt=""
            placeholder="blur"
            blurDataURL="/assets/images/feature-3-small.png"
            // loading="lazy"
            width={800}
            height={600}
          />
        </div> */}
      </section>

      <hr className={styles.horizon} />

      {/* ======================== Feature4 ======================== */}
      <section
        className={`transition-base-color bg-[--color-bg-hp-main] ${styles.scroll_slides_row} relative flex-row-reverse`}
      >
        {/* バーチャルビデオ背景 ここから */}
        {/* {hoveredFeature4 && (
          <div className={`absolute left-0 top-0  h-full w-full`}>
            <video
              autoPlay={true}
              muted={true}
              playsInline={true}
              loop={true}
              className={`fade04 h-[100%] w-[100%] object-cover`}
            >
              <source src="/assets/videos/geographic-bg.mp4" type="video/mp4" />
            </video>
          </div>
        )} */}
        <div
          className={`transition-base absolute left-0 top-0 h-full w-full ${
            hoveredFeature4 ? `opacity-100` : `pointer-events-none opacity-0`
          }`}
        >
          <video
            autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            className={`h-[100%] w-[100%] object-cover`}
            onContextMenu={(e) => e.preventDefault()}
          >
            <source src="/assets/videos/geographic-compressed.mp4" type="video/mp4" />
          </video>
        </div>
        {/* バーチャルビデオ背景 ここまで */}
        <div className={`${styles.text_col}`}>
          <h2
            className={`${styles.section_title} ${language === "En" ? "break-words !text-[40px]" : ""} ${
              hoveredFeature4 ? `${styles.section_title_brand}` : ``
            }`}
            onMouseEnter={() => {
              FeatureDivRef4.current?.classList.add(`${styles.hover}`);
              setHoveredFeature4(true);
            }}
            onMouseLeave={() => {
              FeatureDivRef4.current?.classList.remove(`${styles.hover}`);
              setHoveredFeature4(false);
            }}
          >
            {language === "Ja" && "顧客に刺さる商品開発へ"}
            {language === "En" && "Towards Product Development that Resonates with Customers"}
            <span className={`${styles.title_before}`}>
              {language === "Ja" && "顧客に刺さる商品開発へ"}
              {language === "En" && "Towards Product Development that Resonates with Customers"}
            </span>
          </h2>
          {/* <p className={`relative z-0 ${hoveredFeature4 ? `transition-base text-[#fff]` : ``}`}>
            {language === "Ja" &&
              "売れ先、売れなかった行き先のデータを常に収集することで、日々の営業データから次なる潜在ニーズを発掘し、顧客から欲しいと言われる前に潜在ニーズを満たす商品を開発しリリース、他社よりも先手を打つ提案でまた新たな営業データを収集、売上を上げ続ける仕組みを構築します。"}

            {language === "En" &&
              "By continuously collecting data on successful and unsuccessful sales prospects, we uncover potential needs from daily sales data, develop products that take the initiative over competitors, and establish a cycle of sales data collection and sales success."}
          </p> */}
          <FeatureParagraph4 hoveredFeature={hoveredFeature4} featureSection={4} />
          {/* {language === "Ja" &&
              "売れ先、売れなかった行き先のデータを常に収集することで、日々の営業データから次なる潜在ニーズを発掘し、顧客が気づく前に、他社よりも先手を打つ商品を開発しリリース、そしてまた営業データを収集、売上を上げ続ける仕組みを構築します。"} */}
          {/* {language === "Ja" && "日々の営業データから次なる潜在ニーズを発掘し、広告なしのプランでのみご利用いただけます。"} */}
        </div>
        <div className={`${styles.img_col} flex items-center`}>
          <div className={`${styles.light_back}`}>
            <div
              ref={FeatureDivRef4}
              className={`${styles.wrap}`}
              onMouseEnter={() => setHoveredFeature4(true)}
              onMouseLeave={() => setHoveredFeature4(false)}
            >
              <Image
                src="/assets/images/root2/feature06.png"
                // src="/assets/images/root/feature4.png"
                // src="/assets/images/feature-2.png"
                alt=""
                // placeholder="blur"
                // blurDataURL="/assets/images/feature-2-small.png"
                // loading="lazy"
                width={800}
                height={600}
                className={`${styles.img}`}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
          {/* <Image
            // src="/assets/images/root2/feature4.png"
            src="/assets/images/root/feature4.png"
            // src="/assets/images/feature-2.png"
            alt=""
            placeholder="blur"
            blurDataURL="/assets/images/feature-2-small.png"
            // loading="lazy"
            width={800}
            height={600}
          /> */}
        </div>
      </section>

      <hr className={styles.horizon} />

      {/* ======================== FAQ ======================== */}
      <section id="faq" className={styles.faq}>
        {/* <section id="faq" className={styles.faq} style={{ fontFamily: "var(--font-family-discord)" }}> */}
        <h2>
          {language === "Ja" && "よくある質問"}
          {language === "En" && "Frequently Asked Questions"}
        </h2>
        {/* <ul id="price" className={styles.accordion}> */}
        <ul id="price" className={styles.accordion} style={{ fontFamily: "var(--font-family-discord)" }}>
          <li>
            <input type="radio" name="accordion" id="first" />
            <label htmlFor="first">
              {language === "Ja" && "TRUSTiFYとは？"}
              {language === "En" && "What is TRUSTiFY?"}
            </label>
            <div className={styles.content}>
              <p className="relative z-0">
                {/* {language === "Ja" &&
                  "Netflixは、受賞歴のあるドラマ、映画、アニメ、ドキュメンタリーなどの幅広いコンテンツを配信するストリーミングサービスで、メンバーはあらゆるインターネット接続デバイスで視聴することができます。定額、低価格で、いつでもどこでも、好きなだけ視聴することができます。映画やドラマは毎週追加されるので、いつでも新しい作品が見つかります。"} */}
                {language === "Ja" &&
                  "TRUSTiFYは、キーエンスで培われた組織全員が誰でも売上を上げる仕組みの根幹となるデータベースで、メンバーはこのデータベースを活用することで「営業全員が高い売上を上げる組織」を実現することができます。キーエンスで営業１人が年間約４億円を売り上げることができるのはデータベースがあるからです。"}
                {language === "En" &&
                  "TRUSTiFY is a database that forms the core of the mechanism developed at Keyence that enables every member of the organization to increase sales. By utilizing this database, members can realize an organization where 'every salesperson achieves high sales'. The reason why a single salesperson at Keyence can generate approximately 4 billion yen in annual sales is because of this database."}
              </p>
              <p>
                {language === "Ja" &&
                  "引合・リードによる受動的な顧客を確実に売り、さらに能動営業で大きな上乗せができるようになることで、例年のリード数に依存せずに高い目標の達成、伸びを出し続けることを可能にします。日々の営業データは売上を生む新たな商品開発に繋がり、また営業データを収集する、貴社に売上を上げ続ける好循環をもたらします。"}
                {language === "En" &&
                  "By reliably selling to passive customers through inquiries and leads, and further increasing sales with proactive sales, you can achieve high targets and continue to grow without depending on the number of leads each year. Daily sales data leads to the development of new products that generate sales, and the collection of sales data brings a positive cycle that continues to increase your company's sales."}
              </p>
            </div>
          </li>
          <li>
            <input type="radio" name="accordion" id="second" />
            <label htmlFor="second">
              {language === "Ja" && "TRUSTiFYの利用料金は？"}
              {language === "En" && "How much does TRUSTiFY cost?"}
            </label>
            <div className={styles.content}>
              <p>
                {/* {language === "Ja" &&
                  "TRUSTiFYを定額でお使いいただけます。プランは1人あたり月額￥980（ビジネスプラン）から￥1,980（サポータープラン）まで。追加料金や長期契約はありません。"} */}
                {language === "Ja" &&
                  "TRUSTiFYを定額でお使いいただけます。プランは1人あたり月額￥980（ビジネスプラン）と￥19,800（プレミアムプラン）の2つのみ。追加料金や長期契約はありません。"}
                {/* {language === "Ja" &&
                  "スマホ、タブレット、スマートテレビ、パソコン、ストリーミングデバイスなどから、Netflixを定額でお楽しみいただけます。プランは月額￥790から￥1,980まで。追加料金や長期契約はありません。"} */}
                {language === "En" &&
                  "You can use TRUSTiFY at a flat rate. We offer only two plans: the Business Plan at $8.70 per person per month, and the Premium Plan at $176 per person per month. There are no additional charges or long-term contracts."}
                {/* {language === "En" &&
                  "You can use TRUSTiFY for a flat rate. Our plans range from $7 to $14 per person per month. There are no additional charges or long-term contracts."} */}
                {/* {language === "En" &&
                  "Watch Netflix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from JPY790 to JPY1,980 a month. No extra costs, no contracts."} */}
              </p>
            </div>
          </li>
          <li>
            <input type="radio" name="accordion" id="third" />
            <label htmlFor="third">
              {/* {language === "Ja" && "広告つきプランと通常のプランとの違いは何ですか？"} */}
              {language === "Ja" && "ビジネスプランとプレミアムプランとの違いは何ですか？"}
              {/* {language === "En" && "What's different on an ad-supported plan?"} */}
              {language === "En" && "What is the difference between the Business Plan and the Premium Plan?"}
            </label>
            <div className={`${styles.content}`}>
              <p>
                {/* {language === "Ja" &&
                  "広告つきプランでは、低価格で映画やドラマをお楽しみいただけます。様々な作品をご視聴いただけますが、再生中に広告が流れることがあります (場所やデバイスによっては一部制限があります)。ダウンロードはご利用いただけません。また、一部の映画やドラマは、ライセンスの関係でご覧いただけません。詳しくはこちら。"} */}
                {/* {language === "Ja" &&
                  "ビジネスプランでは、無料プランでは利用制限のかかるコンテンツを無制限にご利用いただけます。"} */}
                {language === "Ja" && "ビジネスプランのメンバーは全てのコンテンツを無制限にご利用いただけます。"}
                {language === "En" &&
                  "With the Business Plan, you can enjoy unlimited access to content that is subject to usage restrictions in the Free Plan. "}
                {/* {language === "En" &&
                  "An ad-supported plan is a great way to enjoy movies and TV shows at a lower price. You can stream your favorites with limited ad breaks (some location and device restrictions apply). Downloads are not supported and a limited number of movies and TV shows are not available due to licensing restrictions. Learn more."} */}
              </p>
              <p>
                {language === "Ja" &&
                  "プレミアムプランに関しては、電話、Web会議にてサポートを受けることが受けることが可能になっております。また、使い勝手や要望をTRUSTiFY開発チームに直接伝えることで自社にフィットした追加機能の開発、サービスの改善に役立てることも可能です。まだTRUSTiFYはベータ版であり、少数精鋭のTRUSTiFYチームが直接お客様のご要望を伺いながらすぐに改善し、低価格で最大の経済効果を上げられるサービスへと共に育てていっていただける「支援者」を募集しております。ご満足いただけるサービスにできるよう何卒よろしくお願い申し上げます。"}
                {language === "En" &&
                  "With the Premium Plan, you have access to support via phone and web conferencing. Moreover, you can directly communicate your feedback and requests to the TRUSTiFY development team, facilitating the development of additional features tailored to your company and improving our service. As TRUSTiFY is still in its beta phase, our elite, compact team is actively seeking supporters through this plan, eager to promptly refine the platform based on your feedback. Our goal is to nurture TRUSTiFY into a cost-effective service that maximizes economic benefits. We earnestly strive to meet your expectations and appreciate your support."}
              </p>
            </div>
          </li>
          {/* <li>
            <input type="radio" name="accordion" id="fourth" />
            <label htmlFor="fourth">
              {language === "Ja" && "どこで視聴できますか？"}
              {language === "En" && "Where can I watch?"}
            </label>
            <div className={styles.content}>
              <p>
                {language === "Ja" &&
                  "どこにいても、お好きなときに視聴をお楽しみいただけます。パソコンからnetflix.comで、またはスマートテレビ、スマホ、タブレット、ストリーミングメディアプレーヤー、ゲーム機など、Netflixアプリが使用可能なインターネット接続デバイスでアカウントにログインして瞬時にお楽しみいただけます。また、iOS、Android、Windows 10で、お気に入りの作品をダウンロードすることができます。ダウンロードすれば、外出先でもインターネット接続なしで視聴できます。どこでもNetflixをお楽しみください。"}
                {language === "En" &&
                  "Watch anywhere, anytime. Sign in with your Netflix account to watch instantly on the web at netflix.com from your personal computer or on any internet-connected device that offers the Netflix app, including smart TVs, smartphones, tablets, streaming media players and game consoles. You can also download your favorite shows with the iOS, Android, or Windows 10 app. Use downloads to watch while you're on the go and without an internet connection. Take Netflix with you anywhere."}
              </p>
            </div>
          </li> */}
          <li>
            <input type="radio" name="accordion" id="fifth" />
            <label htmlFor="fifth">
              {language === "Ja" && "キャンセルするには？"}
              {language === "En" && "How do I cancel?"}
            </label>
            <div className={styles.content}>
              <p>
                {language === "Ja" &&
                  "TRUSTiFYの手続きはとっても簡単。面倒な契約や拘束は一切ありません。たった数回のクリックで、オンラインで簡単にキャンセルできます。キャンセル料金は一切なく、アカウントの開始やキャンセルはいつでも可能です。"}
                {language === "En" &&
                  "TRUSTiFY is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime."}
              </p>
            </div>
          </li>
          {/* <li>
            <input type="radio" name="accordion" id="sixth" />
            <label htmlFor="sixth">
              {language === "Ja" && "TRUSTiFYで何が視聴できますか？"}
              {language === "En" && "What can I watch on TRUSTiFY?"}
            </label>
            <div className={styles.content}>
              <p>
                {language === "Ja" &&
                  "Netflixでは、長編映画、ドキュメンタリー、ドラマ、アニメや受賞歴のあるNetflixオリジナル作品など、豊富なラインナップをご用意しています。いつでもお好きなだけ視聴できます。"}
                {language === "En" &&
                  "Netflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Netflix originals, and more. Watch as much as you want, anytime you want."}
              </p>
            </div>
          </li> */}
          {/* <li>
            <input type="radio" name="accordion" id="seventh" />
            <label htmlFor="seventh">
              {language === "Ja" && "Netflixは子供も安心して楽しめますか？"}
              {language === "En" && "Is Netflix good for kids?"}
            </label>
            <div className={styles.content}>
              <p>
                {language === "Ja" &&
                  "ご両親がお子様の視聴を管理できるように、メンバーシップにはキッズ専用プロフィールが含まれています。お子様は、キッズプロフィールから家族みんなで楽しめる作品をご覧いただけます。キッズプロフィールは暗証番号で保護されたペアレンタルコントロール機能で管理することができ、お子様が視聴できる作品の年齢制限の設定や、お子様の目に触れてほしくない特定の作品のブロックが可能です。"}
                {language === "En" &&
                  "The Netflix Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies in their own space. Kids profiles come with PIN-protected parental controls that let you restrict the maturity rating of content kids can watch and block specific titles you don't want kids to see."}
              </p>
            </div>
          </li> */}
        </ul>
      </section>

      <hr className={styles.horizon} />

      <section className={styles.start}>
        <small className="">
          {language === "Ja" &&
            "まもなくご利用いただけます! メールアドレスを入力してメンバーシップを開始してください。"}
          {language === "En" && "Ready to use? Enter your email to create or restart your membership."}
        </small>
        {/* Netflixメールエリア */}
        <div className={`${styles.email_signUp_area}`} ref={emailRef}>
          <div className={`${styles.email_auth}`}>
            <div className={styles.input_box}>
              <input
                type="email"
                // placeholder={`${language === "Ja" ? "メールアドレス" : "Email"}`}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                // onFocus={() => {
                //   emailRef.current?.classList.add(`${styles.input_focus}`);
                // }}
                // onBlur={() => {
                //   emailRef.current?.classList.remove(`${styles.input_focus}`);
                // }}
                ref={inputRef}
                className={`${email !== "" ? styles.is_entered : ""}`}
              />
              <label>
                {language === "Ja" && "メールアドレス"}
                {language === "En" && "Email"}
              </label>
            </div>
            <button
              onClick={() => {
                if (email === "") {
                  inputRef.current?.focus();
                  emailRef.current?.classList.add(`${styles.error}`);
                  setCheckedEmail("Invalid");
                  return;
                }
                if (checkedEmail === "Invalid") {
                  emailRef.current?.classList.add(`${styles.auth_notice}`);
                  setTimeout(() => {
                    emailRef.current?.classList.remove(`${styles.auth_notice}`);
                  }, 1000);
                  return console.log(checkedEmail);
                }
                console.log(checkedEmail);
                setInputEmail(email);
                setGetStartWithEmail(true); // メンテナンス完了後は表示
                setIsLogin(false);
              }}
            >
              {language === "Ja" && "今すぐ始める"}
              {language === "En" && "Get Started"}
            </button>
          </div>
          {/* {checkedEmail === "Valid" && <span className={styles.msg}>有効なメールアドレスです</span>} */}
          {checkedEmail === "Invalid" && (
            <span className={styles.msg}>
              有効なメールアドレスを入力してください<span className={styles.msg_underline}></span>
            </span>
          )}
        </div>

        {/* ログインエリア */}
        {getStartWithEmail && (
          <>
            <div
              className={`flex-center cursor-grab ${styles.email_signUp_area_overlay}`}
              // className={`flex-center fixed inset-0 z-10 h-[100dvh] w-full bg-[#00000030] backdrop-blur-sm`}
              onClick={() => {
                setGetStartWithEmail(false);
                setInputEmail("");
                // setEmail("");
              }}
            ></div>
            <Auth />
          </>
        )}
        {/* <div className="flex-center mt-[60px] h-auto w-full">
          <Auth />
        </div> */}
      </section>

      <hr className={styles.horizon} />

      {/* ======================== Footer ======================== */}
      <section className={styles.footer}>
        <h2>
          {/* {language === "Ja" && "ご質問ですか？お問合せはこちらまで: 0120-000-000"} */}
          {language === "Ja" && `ご質問ですか？お問合せはこちらまで: `}
          {language === "En" && "Questions? Email: "}
          <span
            className={`cursor-pointer select-none hover:text-[var(--color-text-brand-f)] hover:underline`}
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
            info@thetrustify.com
          </span>
        </h2>

        <div className={styles.row}>
          <div className={styles.col}>
            <Link href="#faq" scroll={false} prefetch={false}>
              {language === "Ja" && "よくあるご質問"}
              {language === "En" && "FAQ"}
            </Link>
            <Link href="#" prefetch={false}>
              {language === "Ja" && "お知らせ"}
              {language === "En" && ""}
            </Link>
            {/* <Link href="#" prefetch={false}>
              {language === "Ja" && "お知らせ"}
              {language === "En" && ""}
            </Link> */}
            {/* <Link href="/" prefetch={false}>
              {language === "Ja" && "投資家情報"}
              {language === "En" && "Investor Relations"}
            </Link>
           
            <Link href="/" prefetch={false}>
              {language === "Ja" && "スピードテスト"}
              {language === "En" && "Speed Test"}
            </Link> */}
          </div>
          <div className={styles.col}>
            {/* <Link href="/" prefetch={false}>
              {language === "Ja" && "ヘルプセンター"}
              {language === "En" && "Help Center"}
            </Link> */}
            <Link href="#" prefetch={false}>
              {language === "Ja" && "利用規約"}
              {language === "En" && "Terms of Use"}
            </Link>
            {/* <Link href="#" prefetch={false}>
              {language === "Ja" && "プライバシーポリシー"}
              {language === "En" && "Privacy"}
            </Link> */}
            {/* <Link href="/" prefetch={false}>
              {language === "Ja" && "採用情報"}
              {language === "En" && "Jobs"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "Cookieの設定"}
              {language === "En" && "Cookies Preferences"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "法的事項"}
              {language === "En" && "Legal Notices"}
            </Link> */}
          </div>
          <div className={styles.col}>
            {/* <Link href="/" prefetch={false}>
              {language === "Ja" && "アカウント"}
              {language === "En" && "Account"}
            </Link> */}
            {/* <Link href="/" prefetch={false}>
              {language === "Ja" && "視聴デバイス"}
              {language === "En" && "ways to watch"}
            </Link> */}
            {/* <Link href="#" prefetch={false}>
              {language === "Ja" && "企業情報"}
              {language === "En" && "Corporate Information"}
            </Link> */}
            <Link href="#" prefetch={false}>
              {language === "Ja" && "プライバシーポリシー"}
              {language === "En" && "Privacy"}
            </Link>
            {/* <Link href="/" prefetch={false}>
              {language === "Ja" && "Netflix独占配信"}
              {language === "En" && "Only on Netflix"}
            </Link> */}
          </div>
          <div className={styles.col}>
            {/* <Link href="/" prefetch={false}>
              {language === "Ja" && "メディアセンター"}
              {language === "En" && "Media Centre"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "利用規約"}
              {language === "En" && "Terms of Use"}
            </Link> */}
            {/* <Link href="#" prefetch={false}>
              {language === "Ja" && "お問い合せ"}
              {language === "En" && "Contact Us"}
            </Link> */}
            {/* <Link href="#" prefetch={false}>
              {language === "Ja" && "お知らせ"}
              {language === "En" && ""}
            </Link> */}
            <Link href="/about" prefetch={false}>
              {language === "Ja" && "企業情報"}
              {language === "En" && "Corporate Information"}
            </Link>
          </div>
        </div>
        <div className="z-100 relative w-fit">
          {clickedItemPosOver && <LangMenuOver />}
          {/* {clickedItemPos && <LangMenu />} */}
          <button
            className={`${styles.language_btn} transition-base03`}
            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              if (openLangTab) {
                setOpenLangTab(false);
                setClickedItemPosOver(null);
                return;
              }
              setOpenLangTab(true);
              // クリック位置をStateに格納
              const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
              setClickedItemPosOver({ x: x, y: y, itemWidth: width, itemHeight: height });
            }}
          >
            <MdOutlineLanguage className="mr-[5px] mt-[-1px] text-[20px]" />
            {language === "Ja" && "日本語"}
            {language === "En" && "English"}
            <AiFillCaretDown />
          </button>
        </div>
        <p className={styles.copyright_txt}>
          {language === "Ja" && "TRUSTiFY"}
          {language === "En" && "TRUSTiFY"}
        </p>
      </section>
    </main>
  );
};
