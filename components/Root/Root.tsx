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
import { neonMailIcon, neonMessageIcon, neonMessageIconBg } from "../assets";
import { FeatureParagraph5 } from "./Features/FeatureParagraph5";

export const Root: FC = () => {
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

  // FAQのラジオボタンの選択中state
  const [selectedFAQ, setSelectedFAQ] = useState<string | null>(null);

  // 画像ホバー有無
  const [hoveredFeature1, setHoveredFeature1] = useState(false);
  const [hoveredFeature2, setHoveredFeature2] = useState(false);
  const [hoveredFeature3, setHoveredFeature3] = useState(false);
  const [hoveredFeature4, setHoveredFeature4] = useState(false);
  const [hoveredFeature5, setHoveredFeature5] = useState(false);
  // Featureのタイトルh2タグのrefオブジェクト タイトルホバーでも動画を再生させる
  const FeatureDivRef1 = useRef<HTMLDivElement | null>(null);
  const FeatureDivRef2 = useRef<HTMLDivElement | null>(null);
  const FeatureDivRef3 = useRef<HTMLDivElement | null>(null);
  const FeatureDivRef4 = useRef<HTMLDivElement | null>(null);
  const FeatureDivRef5 = useRef<HTMLDivElement | null>(null);
  // 🌟スナップスクロールありの場合
  const setStartAnimationFeature1 = useStore((state) => state.setStartAnimationFeature1);
  const setStartAnimationFeature2 = useStore((state) => state.setStartAnimationFeature2);
  const setStartAnimationFeature3 = useStore((state) => state.setStartAnimationFeature3);
  const setStartAnimationFeature4 = useStore((state) => state.setStartAnimationFeature4);
  const setStartAnimationFeature5 = useStore((state) => state.setStartAnimationFeature5);
  const lightTextBorderLine = useStore((state) => state.lightTextBorderLine);
  const setLightTextBorderLine = useStore((state) => state.setLightTextBorderLine);
  // ✅スナップスクロールありの場合
  // 言語ドロップダウンメニュー
  const clickedItemPos = useStore((state) => state.clickedItemPos);
  const clickedItemPosOver = useStore((state) => state.clickedItemPosOver);
  // 動画の遅延読み込み
  const heroBgVideoRef1 = useRef<HTMLVideoElement | null>(null);
  const featureBgVideoRef1 = useRef<HTMLVideoElement | null>(null);
  const featureBgVideoRef2 = useRef<HTMLVideoElement | null>(null);
  const featureBgVideoRef3 = useRef<HTMLVideoElement | null>(null);
  const featureBgVideoRef4 = useRef<HTMLVideoElement | null>(null);
  const featureBgVideoRef5 = useRef<HTMLVideoElement | null>(null);
  const featureContentVideoRef1 = useRef<HTMLVideoElement | null>(null);
  const featureContentVideoRef2 = useRef<HTMLVideoElement | null>(null);

  // 動画の遅延読み込み
  useEffect(() => {
    // ページが完全にロードされた後に動画の読み込みを開始
    console.log("ページロード完了✅ 動画読み込み開始");
    if (featureBgVideoRef1.current) featureBgVideoRef1.current.load();
    if (featureBgVideoRef2.current) featureBgVideoRef2.current.load();
    if (featureBgVideoRef3.current) featureBgVideoRef3.current.load();
    if (featureBgVideoRef4.current) featureBgVideoRef4.current.load();
    if (featureBgVideoRef5.current) featureBgVideoRef5.current.load();
    if (featureContentVideoRef1.current) featureContentVideoRef1.current.load();
    if (featureContentVideoRef2.current) featureContentVideoRef2.current.load();
  }, []);

  // ============ 🌟ヘッダー 下スクロール時に非表示、上スクロール時に表示 スナップスクロールあり ============
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

    // ============ 🌟スナップスクロールありの場合 ============
    // 🌟テスト タイプライター Feature
    if (580 < currentY.current) {
      setStartAnimationFeature1(true);
    }
    if (1300 < currentY.current) {
      setStartAnimationFeature2(true);
    }
    if (1990 < currentY.current) {
      setStartAnimationFeature3(true);
    }
    if (2680 < currentY.current) {
      setStartAnimationFeature4(true);
    }
    if (3360 < currentY.current) {
      setStartAnimationFeature5(true);
    }

    // }, [currentY.current, isHeaderShown, isHeaderTop]);
    // テーマがライトでwindowが830を超えたらヘッダーの文字色を黒にする
    if (800 < currentY.current) {
      if (lightTextBorderLine === true) return;
      setLightTextBorderLine(true);
      console.log("ヘッダー文字色を黒に変更");
    } else {
      if (lightTextBorderLine === false) return;
      console.log("ヘッダー文字色を白に変更");
      setLightTextBorderLine(false);
    }
  }, [currentY.current]);
  // ============ ✅スナップスクロールありの場合 ============
  // }, []);

  useEffect(() => {
    if (!mainRef.current) return; // Null check for mainRef
    console.log(
      "scrollRef.current.getBoundingClientRect().y",
      -scrollRef.current!.getBoundingClientRect().y,
      "lightTextBorderLine",
      lightTextBorderLine
    );
    mainRef.current.addEventListener(`scroll`, handleScrollEvent);

    return () => {
      if (!mainRef.current) return; // Null check for mainRef
      mainRef.current.removeEventListener("scroll", handleScrollEvent);
    };
  }, [handleScrollEvent]);
  // ============ ✅ヘッダー 下スクロール時に非表示、上スクロール時に表示 スナップスクロールあり ============
  // =======================================================================
  // 【タイピングアニメーション】
  const typingRef = useRef<HTMLDivElement | null>(null);
  const typed = useRef<any>(null);
  const [typedNode, setTypedNode] = useState<NodeListOf<ChildNode> | null>(null);
  const typedText =
    language === "ja"
      ? `<span id='red' className="text_gradient_red text-[70px]">キーエンス</span> で培われた</span><br /><span className="whitespace-nowrap leading-normal">強力なデータベースを <span id='one' className="text_gradient">980円</span> で`
      : `Access the powerful database<br /> encapsulating the essence of<br /> <span id='red' className="text_gradient_red_en text-[70px]">KEYENCE</span> for <span id='one' className="text_gradient_en">just $9</span>.`;
  useEffect(() => {
    typed.current = new Typed(typingRef.current, {
      strings: [typedText],
      // strings: [
      //   `<span id='red' className="text_gradient_red text-[70px]">キーエンス</span> で培われた</span><br /><span className="whitespace-nowrap leading-normal">強力なデータベースを <span id='one' className="text_gradient">980円</span> で`,
      // ],
      loop: false,
      typeSpeed: language === "ja" ? 80 : 50,
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
        // redNode?.classList.add(`${styles.text_gradient_red}`);
        // oneNode?.classList.add(`${styles.text_gradient}`);
        if (language === "ja") {
          redNode?.classList.add(`${styles.text_gradient_red}`);
          oneNode?.classList.add(`${styles.text_gradient}`);
        } else {
          redNode?.classList.add(`${styles.text_gradient_red_en}`);
          oneNode?.classList.add(`${styles.text_gradient_en}`);
        }
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
    // }, []);
  }, [language]);

  // 英語へ言語切り替え時に日本語のタイピングテキストのカーソルを透明にして、
  // 日本語の時にはカーソルを表示させる
  // useEffect(() => {
  //   if (language === "en") {
  //     if (!typed.current) return;
  //     typed.current.cursor.style.opacity = "0";
  //   }
  //   if (language === "ja") {
  //     if (!typed.current) return;
  //     typed.current.cursor.style.opacity = "1";
  //   }
  // }, [language]);
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

  // ラジオボタン チェック済みをクリックでチェックを外す関数
  const handleRadioChange = (e: React.MouseEvent<HTMLLabelElement>, value: string) => {
    e.stopPropagation();
    console.log(value);
    // すでに選択されているアイテムを再クリックした場合、選択を解除する
    if (value === selectedFAQ) {
      setSelectedFAQ(null);
    } else {
      setSelectedFAQ(value);
    }
  };

  console.log("Rootコンポーネントレンダリング", selectedFAQ);

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
        id="hero"
        className={`transition-base-color h-[100dvh] w-[100vw]   ${styles.scroll_slides} ${styles.main}`}
        ref={scrollRef}
      >
        <div className="absolute left-0 top-0 -z-[0] h-[100dvh] w-[100dvw] overflow-hidden">
          <video
            ref={heroBgVideoRef1}
            autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            // preload="none"
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
          <h1 className={`${language === "en" && "!max-w-full "}`}>
            {/* ========== タイピングアニメーション ========== */}
            <span
              // className={`select-none truncate leading-normal ${language === "ja" ? "" : "hidden"}`}
              className={`select-none truncate leading-normal ${language === "ja" ? "" : ""}`}
              ref={typingRef}
            ></span>
            {/* ========== タイピングアニメーション ========== */}
            {/* {language === "en" && "Access the powerful database encapsulating the essence of KEYENCE for just $7."} */}
            {/* <span className="leading-normal">
              <span className={`${styles.text_gradient_red}`}> キーエンス</span> で培われた
            </span>
            <br />
            <span className="whitespace-nowrap leading-normal">
              強力なデータベースを <span className={`${styles.text_gradient} `}>ワンコイン</span> で
            </span> */}
          </h1>
          <h3>
            {/* {language === "ja" && "映画やドラマをもっと自由に。いつでもキャンセルOK。"} */}
            {language === "ja" && "売上を上げ続ける仕組みを誰にでも。いつでもキャンセルOK。"}
            {/* {language === "en" && "Watch anywhere. Cancel anytime."} */}
            {language === "en" && "Raise sales to anyone. Cancel anytime."}
          </h3>
          <p>
            {language === "ja" &&
              // "まもなくご視聴いただけます! メールアドレスを入力してメンバーシップを開始、または再開してください。"}
              "まもなくご利用いただけます! メールアドレスを入力してメンバーシップを開始してください。"}
            {/* {language === "en" && "Ready to watch? Enter your email to create or restart your membership."} */}
            {language === "en" && "Ready to use? Enter your email to create your membership."}
          </p>
          {/* ============= メールで始める ============= */}
          {/* <form className={`${styles.email_signUp}`}> */}
          {/* <button type="submit"> */}
          {/* <div className={`${styles.email_signUp}`}>
            {language === "ja" && <input type="email" placeholder="メールアドレス" required />}
            {language === "en" && <input type="email" placeholder="Email Address" required />}

            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault();
                setIsOpenModal(true);
              }}
            >
              {language === "ja" && "今すぐ始める"}
              {language === "en" && "Get Started"}
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
              {language === "ja" && "今すぐ始める"}
              {/* {language === "ja" && "メンテナンス中"} */}
              {/* {language === "en" && "Get Started for free"} */}
              {language === "en" && "Get Started"}
              {/* {language === "ja" && "無料で始める"}
            {language === "en" && "Get Started for free"} */}
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
        className={`transition-base-color bg-[--color-bg-hp-main] ${styles.scroll_slides_row} relative overflow-hidden`}
      >
        {/* <div className={`absolute left-[-180px] top-[-50px] z-[0] rotate-[-12deg]`}>{neonMessageIconBg}</div> */}
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
            ref={featureBgVideoRef1}
            // autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            preload="none"
            className={`pointer-events-none h-[100%] w-[100%] select-none object-cover`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* <source src="/assets/videos/Root/top-bg-virtual-trimmed.mp4" type="video/mp4" /> */}
            <source src="/assets/videos/Root/virtual_resized_compressed.mp4" type="video/mp4" />
            {/* <source src="/assets/videos/Root/art_white1_compressed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/light_bg_trimmed2_compressed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/nature_snow_compressed_trimmed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/starlight_trimmed.mp4" type="video/mp4" /> */}
          </video>
        </div>
        {/* バーチャルビデオ背景1 ここまで */}
        <div className={`${styles.text_col}`}>
          <h2
            className={`${styles.section_title} ${hoveredFeature1 ? `${styles.section_title_brand}` : ``} `}
            // onMouseEnter={() => {
            //   FeatureDivRef1.current?.classList.add(`${styles.hover}`);
            //   setHoveredFeature1(true);
            // }}
            // onMouseLeave={() => {
            //   FeatureDivRef1.current?.classList.remove(`${styles.hover}`);
            //   setHoveredFeature1(false);
            // }}
          >
            {/* {language === "ja" && "最小の資本と人で、最大の経済効果を上げる"} */}
            {/* {language === "ja" && "営業を科学する"} */}
            {language === "ja" && "誰でも売れる組織へ"}
            {language === "en" && "To an organization where anyone can sell."}
            {/* {language === "ja" && "大画面で楽しめる"}
            {language === "en" && "Enjoy on your TV."} */}
            <span className={`${styles.title_before}`}>
              {language === "ja" && "誰でも売れる組織へ"}
              {language === "en" && "To an organization where anyone can sell."}
            </span>
          </h2>
          {/* <p className={`relative z-0 ${hoveredFeature1 ? `transition-base text-[#fff]` : ``}`}>
            {language === "ja" &&
              "属人的になりがちな営業を「リスト作成、架電、アポ取り、商談、クロージング、サポート」の全てのプロセスをデータ化し、「売れる営業先・売れる営業手法・満足度を最大化するサポート手法」を可視化することで、どんな営業マンでも高い売上を上げ、「最小の資本と人で最大の経済効果を上げる」組織を実現します。"}
            {language === "en" &&
              "By datafying all the processes of sales, which tends to be personalized, such as 'list creation, cold calling, appointment setting, negotiation, closing, and support', and visualizing 'sales-boosting customers, sales-boosting methods, and support methods to maximize satisfaction', we realize an organization where any salesperson can generate high sales and 'maximize economic effects with the least amount of capital and people'."}
          </p> */}
          <FeatureParagraph hoveredFeature={hoveredFeature1} featureSection={1} />
        </div>
        <div className={`${styles.img_col} flex items-center`}>
          <div className={`${styles.light_back}`}>
            <div
              ref={FeatureDivRef1}
              className={`${styles.wrap}`}
              onMouseEnter={() => {
                setHoveredFeature1(true);
                if (featureContentVideoRef1.current) featureContentVideoRef1.current.play();
                if (featureBgVideoRef1.current) featureBgVideoRef1.current.play();
              }}
              onMouseLeave={() => {
                setHoveredFeature1(false);
                if (featureContentVideoRef1.current) featureContentVideoRef1.current.pause();
                if (featureBgVideoRef1.current) featureBgVideoRef1.current.pause();
              }}
            >
              <div className="absolute left-0 top-0 z-[-1] h-full w-full bg-[var(--color-bg-base)]" />
              <Image
                src="/assets/images/root2/feature01_resized_compressed.png"
                // src="/assets/images/root2/feature05_resized_compressed.png"
                // src="/assets/images/root2/feature01_resized.png"
                // src="/assets/images/root/feature1.png"
                // src="/assets/images/feature-1.png"
                alt=""
                placeholder="blur"
                blurDataURL="/assets/images/root2/placeholders/feature01_placeholder.png"
                width={800}
                height={600}
                className={`${styles.img}`}
                onContextMenu={(e) => e.preventDefault()}
              />
              <video
                ref={featureContentVideoRef1}
                // autoPlay={true}
                loop={true}
                playsInline={true}
                muted={true}
                preload="none"
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
            ref={featureBgVideoRef2}
            // autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            preload="none"
            className={`h-[100%] w-[100%] object-cover`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* <source src="/assets/videos/geographic-compressed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/art_white1_compressed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/light_bg_trimmed2_compressed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/nature_snow_compressed_trimmed.mp4" type="video/mp4" /> */}
            <source src="/assets/videos/Root/starlight_trimmed.mp4" type="video/mp4" />
            {/* <source src="/assets/videos/Root/star_bg2_trimmed.mp4" type="video/mp4" /> */}
          </video>
          {/* 暗くするオーバーレイ */}
          {/* <div className="absolute inset-0 z-[0] bg-[#00000030]"></div> */}
          {/* シャドウグラデーション */}
          {/* <div className="shadow-gradient-tb-2xs pointer-events-none absolute inset-0 z-[0] h-full w-full select-none"></div> */}
        </div>
        {/* バーチャルビデオ背景 ここまで */}
        <div className={`${styles.text_col}`}>
          {/* <h2>
            
            {language === "ja" && `"今" 売れる営業先がすぐ見つかる`}
            {language === "en" && "Find 'current' sales prospects immediately"}
          </h2> */}
          <h2
            className={`${styles.section_title} ${hoveredFeature2 ? `${styles.section_title_brand}` : ``} `}
            // onMouseEnter={() => {
            //   FeatureDivRef2.current?.classList.add(`${styles.hover}`);
            //   setHoveredFeature2(true);
            // }}
            // onMouseLeave={() => {
            //   FeatureDivRef2.current?.classList.remove(`${styles.hover}`);
            //   setHoveredFeature2(false);
            // }}
          >
            {language === "ja" && `"今" 売れる営業先がすぐ見つかる`}
            {language === "en" && "Find 'current' sales prospects immediately"}
            <span className={`${styles.title_before}`}>
              {language === "ja" && `"今" 売れる営業先がすぐ見つかる`}
              {language === "en" && "Find 'current' sales prospects immediately"}
            </span>
          </h2>
          {/* <p className={`relative z-0 ${hoveredFeature2 ? `transition-base text-[#fff]` : ``}`}>
            {language === "ja" &&
              `データベースから未知の客先にアポを組み、600万円の商品をその場でご注文いただくなど "今" 売れる営業を何度も経験してきました。 `}
            {language === "en" &&
              "I've had repeated experiences with 'current' successful sales, such as arranging appointments with unknown clients from the database and receiving on-the-spot orders for products worth around 55,000 USD."}
          </p>
          <p className={`relative z-0 ${hoveredFeature2 ? `transition-base text-[#fff]` : ``}`}>
            {language === "ja" &&
              `Excelだとフリーズしてしまうような98万社もの膨大な会社データから自社の狙い先となり得る会社を、「業界、取引先、規模、今までの活動履歴」などの様々な条件から簡単、瞬時に抽出が可能です。 自社のサービスが解決する課題を持つ会社を瞬時に見つけ、競合よりも早く売ることができます。`}
            {language === "en" &&
              "You can easily and instantly extract potential target companies from our database, which holds data from 980,000 companies, based on various criteria such as 'industry, clients, scale, and past activities'. You can quickly find companies that have the problems your service solves, allowing you to sell faster than your competitors."}
          </p> */}
          <FeatureParagraph2 hoveredFeature={hoveredFeature2} featureSection={2} />
        </div>
        <div className={`${styles.img_col} flex items-center`}>
          <div className={`${styles.light_back}`}>
            <div
              ref={FeatureDivRef2}
              className={`${styles.wrap}`}
              onMouseEnter={() => {
                setHoveredFeature2(true);
                if (featureContentVideoRef2.current) featureContentVideoRef2.current.play();
                if (featureBgVideoRef2.current) featureBgVideoRef2.current.play();
              }}
              onMouseLeave={() => {
                setHoveredFeature2(false);
                if (featureContentVideoRef2.current) featureContentVideoRef2.current.pause();
                if (featureBgVideoRef2.current) featureBgVideoRef2.current.pause();
              }}
            >
              <div className="absolute left-0 top-0 z-[-1] h-full w-full bg-[var(--color-bg-base)]" />
              <Image
                src="/assets/images/root2/feature05_resized_compressed.png"
                // src="/assets/images/root/feature2.png"
                // src="/assets/images/feature-4.png"
                alt=""
                placeholder="blur"
                blurDataURL="/assets/images/root2/placeholders/feature05_placeholder.png"
                // loading="lazy"
                width={800}
                height={600}
                className={`${styles.img}`}
                onContextMenu={(e) => e.preventDefault()}
              />
              <video
                ref={featureContentVideoRef2}
                // autoPlay={true}
                loop={true}
                playsInline={true}
                muted={true}
                preload="none"
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
            ref={featureBgVideoRef3}
            // autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            preload="none"
            className={`h-[100%] w-[100%] object-cover`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* <source src="/assets/videos/Root/top-bg-virtual-trimmed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/virtual_resized_compressed.mp4" type="video/mp4" /> */}
            <source src="/assets/videos/Root/art_white1_compressed.mp4" type="video/mp4" />
            {/* <source src="/assets/videos/Root/light_bg_trimmed2_compressed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/star_bg2_trimmed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/nature_snow_compressed_trimmed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/starlight_trimmed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/star_bg2_trimmed.mp4" type="video/mp4" /> */}
          </video>
          {/* 暗くするオーバーレイ */}
          {/* <div className="absolute inset-0 z-[0] bg-[#00000030]"></div> */}
          {/* シャドウグラデーション */}
          {/* <div className="shadow-gradient-tb-sm pointer-events-none absolute inset-0 z-[0] h-full w-full select-none"></div> */}
        </div>
        {/* バーチャルビデオ背景 ここまで */}
        <div className={`${styles.text_col}`}>
          {/* <h2>
            {language === "ja" && "リスト作成時間を大幅に短縮し工数削減"}
            {language === "en" && "Significantly reduce list creation time and workload."}
            
          </h2> */}
          <h2
            className={`${styles.section_title} ${hoveredFeature3 ? `${styles.section_title_brand}` : ``} `}
            // onMouseEnter={() => {
            //   FeatureDivRef3.current?.classList.add(`${styles.hover}`);
            //   setHoveredFeature3(true);
            // }}
            // onMouseLeave={() => {
            //   FeatureDivRef3.current?.classList.remove(`${styles.hover}`);
            //   setHoveredFeature3(false);
            // }}
            // style={{ whiteSpace: "pre-line" }}
          >
            {language === "ja" && "リスト作成・準備時間を大幅に短縮し工数削減"}
            {language === "en" && "Significantly reduce list creation time and workload."}
            <span className={`${styles.title_before}`}>
              {language === "ja" && "リスト作成・準備時間を大幅に短縮し工数削減"}
              {language === "en" && "Significantly reduce list creation time and workload."}
            </span>
          </h2>
          {/* <p className={`relative z-0 ${hoveredFeature3 ? `transition-base text-[#fff]` : ``}`}>
            {language === "ja" &&
              "キーエンスではリスト作成・架電・準備・営業・入金確認・サポートを全て一人で行います。そのため最小の時間で最大の売上を上げられるよう限られた時間で売れる営業先のリストを多くピックしなければなりません。"}
            {language === "en" &&
              "At Keyence, we handle everything from list creation, cold calling, preparation, sales, payment confirmation, to support all by ourselves. Therefore, in order to maximize sales in the shortest time possible, we must pick a large number of prospective clients from our lists in the limited time we have."}
          </p>
          <p className={`relative z-0 ${hoveredFeature3 ? `transition-base text-[#fff]` : ``}`}>
            {language === "ja" &&
              "日々のリスト作成時間を1日30分短縮することで、20日稼働で月10時間の短縮、年間120時間の短縮となり、人件費1人当たり26万8680円/年、10人で260万円/年の導入効果に繋がります。(*人件費は中央値430万円/年で計算)"}
            {language === "en" &&
              "By reducing the daily list creation time by 30 minutes, you save 10 hours per month based on 20 working days, resulting in an annual reduction of 120 hours. This leads to a personnel cost saving of approximately $2,380 per person per year and $23,800 per year for a team of 10 people. (*Personnel costs are calculated based on the median annual income of $38,790)."}
          </p> */}
          <FeatureParagraph3 hoveredFeature={hoveredFeature3} featureSection={3} />
        </div>
        <div className={`${styles.img_col} flex items-center`}>
          <div className={`${styles.light_back}`}>
            <div
              ref={FeatureDivRef3}
              className={`${styles.wrap}`}
              onMouseEnter={() => {
                setHoveredFeature3(true);
                // if (featureContentVideoRef3.current) featureContentVideoRef3.current.play();
                if (featureBgVideoRef3.current) featureBgVideoRef3.current.play();
              }}
              onMouseLeave={() => {
                setHoveredFeature3(false);
                // if (featureContentVideoRef3.current) featureContentVideoRef3.current.pause();
                if (featureBgVideoRef3.current) featureBgVideoRef3.current.pause();
              }}
            >
              <div className="absolute left-0 top-0 z-[-1] h-full w-full bg-[var(--color-bg-base)]" />
              <Image
                src="/assets/images/root2/feature02_resized_compressed.png"
                // src="/assets/images/root/feature3.png"
                // src="/assets/images/feature-3.png"
                alt=""
                placeholder="blur"
                blurDataURL="/assets/images/root2/placeholders/feature02_placeholder.png"
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
            ref={featureBgVideoRef4}
            // autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            preload="none"
            className={`h-[100%] w-[100%] object-cover`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* <source src="/assets/videos/geographic-compressed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/art_white1_compressed.mp4" type="video/mp4" /> */}
            <source src="/assets/videos/Root/nature_snow_compressed_trimmed.mp4" type="video/mp4" />
            {/* <source src="/assets/videos/Root/light_bg_trimmed2_compressed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/starlight_trimmed.mp4" type="video/mp4" /> */}
          </video>
          {/* シャドウグラデーション */}
          {/* <div className="shadow-gradient-tb-sm pointer-events-none absolute inset-0 z-[0] h-full w-full select-none"></div> */}
        </div>
        {/* バーチャルビデオ背景 ここまで */}
        <div className={`${styles.text_col}`}>
          <h2
            className={`${styles.section_title} ${language === "en" ? "break-words !text-[40px]" : ""} ${
              hoveredFeature4 ? `${styles.section_title_brand}` : ``
            }`}
            // onMouseEnter={() => {
            //   FeatureDivRef4.current?.classList.add(`${styles.hover}`);
            //   setHoveredFeature4(true);
            // }}
            // onMouseLeave={() => {
            //   FeatureDivRef4.current?.classList.remove(`${styles.hover}`);
            //   setHoveredFeature4(false);
            // }}
          >
            {language === "ja" && "顧客に刺さる商品開発へ"}
            {language === "en" && "Towards Product Development that Resonates with Customers"}
            <span className={`${styles.title_before}`}>
              {language === "ja" && "顧客に刺さる商品開発へ"}
              {language === "en" && "Towards Product Development that Resonates with Customers"}
            </span>
          </h2>
          {/* <p className={`relative z-0 ${hoveredFeature4 ? `transition-base text-[#fff]` : ``}`}>
            {language === "ja" &&
              "売れ先、売れなかった行き先のデータを常に収集することで、日々の営業データから次なる潜在ニーズを発掘し、顧客から欲しいと言われる前に潜在ニーズを満たす商品を開発しリリース、他社よりも先手を打つ提案でまた新たな営業データを収集、売上を上げ続ける仕組みを構築します。"}

            {language === "en" &&
              "By continuously collecting data on successful and unsuccessful sales prospects, we uncover potential needs from daily sales data, develop products that take the initiative over competitors, and establish a cycle of sales data collection and sales success."}
          </p> */}
          <FeatureParagraph4 hoveredFeature={hoveredFeature4} featureSection={4} />
          {/* {language === "ja" &&
              "売れ先、売れなかった行き先のデータを常に収集することで、日々の営業データから次なる潜在ニーズを発掘し、顧客が気づく前に、他社よりも先手を打つ商品を開発しリリース、そしてまた営業データを収集、売上を上げ続ける仕組みを構築します。"} */}
          {/* {language === "ja" && "日々の営業データから次なる潜在ニーズを発掘し、広告なしのプランでのみご利用いただけます。"} */}
        </div>
        <div className={`${styles.img_col} flex items-center`}>
          <div className={`${styles.light_back}`}>
            <div
              ref={FeatureDivRef4}
              className={`${styles.wrap}`}
              onMouseEnter={() => {
                setHoveredFeature4(true);
                // if (featureContentVideoRef4.current) featureContentVideoRef4.current.play();
                if (featureBgVideoRef4.current) featureBgVideoRef4.current.play();
              }}
              onMouseLeave={() => {
                setHoveredFeature4(false);
                // if (featureContentVideoRef4.current) featureContentVideoRef4.current.pause();
                if (featureBgVideoRef4.current) featureBgVideoRef4.current.pause();
              }}
            >
              <div className="absolute left-0 top-0 z-[-1] h-full w-full bg-[var(--color-bg-base)]" />
              <Image
                src="/assets/images/root2/Home_white_resize.png"
                // src="/assets/images/root2/placeholders/Home_white_resize_placeholder.png"
                // src="/assets/images/root/feature4.png"
                // src="/assets/images/feature-2.png"
                alt=""
                placeholder="blur"
                blurDataURL="/assets/images/root2/placeholders/Home_white_resize_placeholder.png"
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

      {/* ======================== Feature5 ======================== */}
      <section className={`transition-base-color bg-[--color-bg-hp-main] ${styles.scroll_slides_row} relative`}>
        {/* バーチャルビデオ背景 ここから */}
        <div
          className={`transition-base absolute left-0 top-0 h-full w-full ${
            hoveredFeature5 ? `opacity-100` : `pointer-events-none opacity-0`
          }`}
        >
          <video
            ref={featureBgVideoRef5}
            // autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            preload="none"
            className={`h-[100%] w-[100%] object-cover`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* <source src="/assets/videos/geographic-compressed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/top-bg-virtual-trimmed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/virtual_resized_compressed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/art_white1_compressed.mp4" type="video/mp4" /> */}
            <source src="/assets/videos/Root/light_bg_trimmed2_compressed.mp4" type="video/mp4" />
            {/* <source src="/assets/videos/Root/star_bg2_trimmed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/nature_snow_compressed_trimmed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/starlight_trimmed.mp4" type="video/mp4" /> */}
          </video>
          {/* 暗くするオーバーレイ */}
          {/* <div className="absolute inset-0 z-[0] bg-[#00000030]"></div> */}
          {/* シャドウグラデーション */}
          {/* <div className="shadow-gradient-tb-sm pointer-events-none absolute inset-0 z-[0] h-full w-full select-none"></div> */}
        </div>
        {/* バーチャルビデオ背景 ここまで */}
        <div className={`${styles.text_col}`}>
          <h2
            className={`${styles.section_title} ${styles.section_title_sm} ${
              hoveredFeature5 ? `${styles.section_title_brand}` : ``
            } `}
            // onMouseEnter={() => {
          >
            {language === "ja" && "即日出荷体制を実現して、顧客の「すぐ買いたい」を惹き付ける"}
            {language === "en" && "Significantly reduce list creation time and workload."}
            <span className={`${styles.title_before}`}>
              {language === "ja" && "即日出荷体制を実現して、顧客の「すぐ買いたい」を惹き付ける"}
              {language === "en" && "Significantly reduce list creation time and workload."}
            </span>
          </h2>
          <FeatureParagraph5 hoveredFeature={hoveredFeature5} featureSection={5} />
        </div>
        <div className={`${styles.img_col} flex items-center`}>
          <div className={`${styles.light_back}`}>
            <div
              ref={FeatureDivRef5}
              className={`${styles.wrap}`}
              onMouseEnter={() => {
                setHoveredFeature5(true);
                // if (featureContentVideoRef5.current) featureContentVideoRef5.current.play();
                if (featureBgVideoRef5.current) featureBgVideoRef5.current.play();
              }}
              onMouseLeave={() => {
                setHoveredFeature5(false);
                // if (featureContentVideoRef5.current) featureContentVideoRef5.current.pause();
                if (featureBgVideoRef5.current) featureBgVideoRef5.current.pause();
              }}
            >
              <div className="absolute left-0 top-0 z-[-1] h-full w-full bg-[var(--color-bg-base)]" />
              <Image
                src="/assets/images/root2/feature02_resized_compressed.png"
                // src="/assets/images/root/feature3.png"
                // src="/assets/images/feature-3.png"
                alt=""
                placeholder="blur"
                blurDataURL="/assets/images/root2/placeholders/feature02_placeholder.png"
                // loading="lazy"
                width={800}
                height={600}
                className={`${styles.img}`}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.horizon} />

      {/* ======================== FAQ ======================== */}
      <section id="faq" className={`${styles.faq} max-w-[100vw] overflow-hidden`}>
        <div className={styles.back_icon}>{neonMessageIconBg}</div>
        {/* <section id="faq" className={styles.faq} style={{ fontFamily: "var(--font-family-discord)" }}> */}
        <h2 className="z-1 space-x-4">
          {/* <span className="flex-center inline-block min-h-[60px]" onContextMenu={(e) => e.preventDefault()}>
            {neonMessageIcon}
          </span> */}
          <span>
            {language === "ja" && "よくある質問"}
            {language === "en" && "Frequently Asked Questions"}
          </span>
        </h2>
        {/* <ul id="price" className={styles.accordion}> */}
        <ul id="price" className={styles.accordion} style={{ fontFamily: "var(--font-family-discord)" }}>
          <li>
            <input type="radio" name="accordion" id="first" value="about" checked={selectedFAQ === "about"} readOnly />
            <label htmlFor="first" onClick={(e) => handleRadioChange(e, "about")}>
              {language === "ja" && "TRUSTiFYとは？"}
              {language === "en" && "What is TRUSTiFY?"}
            </label>
            <div className={`${styles.content}`}>
              <p className={`relative z-0 ${language === "en" ? `!tracking-[0.5px]` : ``}`}>
                {/* {language === "ja" &&
                  "Netflixは、受賞歴のあるドラマ、映画、アニメ、ドキュメンタリーなどの幅広いコンテンツを配信するストリーミングサービスで、メンバーはあらゆるインターネット接続デバイスで視聴することができます。定額、低価格で、いつでもどこでも、好きなだけ視聴することができます。映画やドラマは毎週追加されるので、いつでも新しい作品が見つかります。"} */}
                {language === "ja" &&
                  "TRUSTiFYは、キーエンスで培われた組織全員が誰でも売上を上げる仕組みの根幹となるデータベースで、メンバーはこのデータベースを活用することで「営業全員が高い売上を上げる組織」を実現することができます。キーエンスで営業１人が年間約４億円を売り上げることができるのはデータベースがあるからです。"}
                {language === "en" &&
                  "TRUSTiFY is a database that forms the core of the mechanism developed at Keyence that enables every member of the organization to increase sales. By utilizing this database, members can realize an organization where 'every salesperson achieves high sales'. The reason why a single salesperson at Keyence can generate approximately 4 billion yen in annual sales is because of this database."}
              </p>
              <p className={`${language === "en" ? `!tracking-[0.5px]` : ``}`}>
                {language === "ja" &&
                  "引合・リードによる受動的な顧客を確実に売り、さらに能動営業で大きな上乗せができるようになることで、例年のリード数に依存せずに高い目標の達成、伸びを出し続けることを可能にします。日々の営業データは売上を生む新たな商品開発に繋がり、また営業データを収集する、貴社に売上を上げ続ける好循環をもたらします。"}
                {language === "en" &&
                  "By reliably selling to passive customers through inquiries and leads, and further increasing sales with proactive sales, you can achieve high targets and continue to grow without depending on the number of leads each year. Daily sales data leads to the development of new products that generate sales, and the collection of sales data brings a positive cycle that continues to increase your company's sales."}
              </p>
            </div>
          </li>
          <li>
            <input type="radio" name="accordion" id="second" value="price" checked={selectedFAQ === "price"} readOnly />
            <label htmlFor="second" onClick={(e) => handleRadioChange(e, "price")}>
              {language === "ja" && "TRUSTiFYの利用料金は？"}
              {language === "en" && "How much does TRUSTiFY cost?"}
            </label>
            <div className={`${styles.content}`}>
              <p className={`${language === "en" ? `!tracking-[0.5px]` : ``}`}>
                {/* {language === "ja" &&
                  "TRUSTiFYを定額でお使いいただけます。プランは1人あたり月額￥980（ビジネスプラン）から￥1,980（サポータープラン）まで。追加料金や長期契約はありません。"} */}
                {language === "ja" &&
                  "TRUSTiFYを定額でお使いいただけます。プランは1人あたり月額￥980（ビジネスプラン）と￥19,800（プレミアムプラン）の2つのみ。追加料金や長期契約はありません。"}
                {/* {language === "ja" &&
                  "スマホ、タブレット、スマートテレビ、パソコン、ストリーミングデバイスなどから、Netflixを定額でお楽しみいただけます。プランは月額￥790から￥1,980まで。追加料金や長期契約はありません。"} */}
                {language === "en" &&
                  "You can use TRUSTiFY at a flat rate. We offer only two plans: the Business Plan at $8.70 per person per month, and the Premium Plan at $176 per person per month. There are no additional charges or long-term contracts."}
                {/* {language === "en" &&
                  "You can use TRUSTiFY for a flat rate. Our plans range from $7 to $14 per person per month. There are no additional charges or long-term contracts."} */}
                {/* {language === "en" &&
                  "Watch Netflix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from JPY790 to JPY1,980 a month. No extra costs, no contracts."} */}
              </p>
            </div>
          </li>
          <li>
            <input
              type="radio"
              name="accordion"
              id="third"
              value="difference"
              checked={selectedFAQ === "difference"}
              readOnly
            />
            <label htmlFor="third" onClick={(e) => handleRadioChange(e, "difference")}>
              {/* {language === "ja" && "広告つきプランと通常のプランとの違いは何ですか？"} */}
              {language === "ja" && "ビジネスプランとプレミアムプランとの違いは何ですか？"}
              {/* {language === "en" && "What's different on an ad-supported plan?"} */}
              {language === "en" && "What is the difference between the Business Plan and the Premium Plan?"}
            </label>
            <div className={`${styles.content}`}>
              <p className={`${language === "en" ? `!tracking-[0.5px]` : ``}`}>
                {/* {language === "ja" &&
                  "広告つきプランでは、低価格で映画やドラマをお楽しみいただけます。様々な作品をご視聴いただけますが、再生中に広告が流れることがあります (場所やデバイスによっては一部制限があります)。ダウンロードはご利用いただけません。また、一部の映画やドラマは、ライセンスの関係でご覧いただけません。詳しくはこちら。"} */}
                {/* {language === "ja" &&
                  "ビジネスプランでは、無料プランでは利用制限のかかるコンテンツを無制限にご利用いただけます。"} */}
                {language === "ja" && "ビジネスプランのメンバーは全てのコンテンツを無制限にご利用いただけます。"}
                {language === "en" &&
                  "With the Business Plan, you can enjoy unlimited access to content that is subject to usage restrictions in the Free Plan. "}
                {/* {language === "en" &&
                  "An ad-supported plan is a great way to enjoy movies and TV shows at a lower price. You can stream your favorites with limited ad breaks (some location and device restrictions apply). Downloads are not supported and a limited number of movies and TV shows are not available due to licensing restrictions. Learn more."} */}
              </p>
              <p className={`${language === "en" ? `!tracking-[0.5px]` : ``}`}>
                {language === "ja" &&
                  "プレミアムプランに関しては、電話、Web会議にてサポートを受けることが受けることが可能になっております。また、使い勝手や要望をTRUSTiFY開発チームに直接伝えることで自社にフィットした追加機能の開発、サービスの改善に役立てることも可能です。まだTRUSTiFYはベータ版であり、少数精鋭のTRUSTiFYチームが直接お客様のご要望を伺いながらすぐに改善し、低価格で最大の経済効果を上げられるサービスへと共に育てていっていただける「支援者」を募集しております。ご満足いただけるサービスにできるよう何卒よろしくお願い申し上げます。"}
                {language === "en" &&
                  "With the Premium Plan, you have access to support via phone and web conferencing. Moreover, you can directly communicate your feedback and requests to the TRUSTiFY development team, facilitating the development of additional features tailored to your company and improving our service. As TRUSTiFY is still in its beta phase, our elite, compact team is actively seeking supporters through this plan, eager to promptly refine the platform based on your feedback. Our goal is to nurture TRUSTiFY into a cost-effective service that maximizes economic benefits. We earnestly strive to meet your expectations and appreciate your support."}
              </p>
            </div>
          </li>
          {/* <li>
            <input type="radio" name="accordion" id="fourth" />
            <label htmlFor="fourth">
              {language === "ja" && "どこで視聴できますか？"}
              {language === "en" && "Where can I watch?"}
            </label>
            <div className={`${styles.content} ${language === 'en' ? `!tracking-[0.5px]` : ``}`}>
              <p>
                {language === "ja" &&
                  "どこにいても、お好きなときに視聴をお楽しみいただけます。パソコンからnetflix.comで、またはスマートテレビ、スマホ、タブレット、ストリーミングメディアプレーヤー、ゲーム機など、Netflixアプリが使用可能なインターネット接続デバイスでアカウントにログインして瞬時にお楽しみいただけます。また、iOS、Android、Windows 10で、お気に入りの作品をダウンロードすることができます。ダウンロードすれば、外出先でもインターネット接続なしで視聴できます。どこでもNetflixをお楽しみください。"}
                {language === "en" &&
                  "Watch anywhere, anytime. Sign in with your Netflix account to watch instantly on the web at netflix.com from your personal computer or on any internet-connected device that offers the Netflix app, including smart TVs, smartphones, tablets, streaming media players and game consoles. You can also download your favorite shows with the iOS, Android, or Windows 10 app. Use downloads to watch while you're on the go and without an internet connection. Take Netflix with you anywhere."}
              </p>
            </div>
          </li> */}
          <li>
            <input
              type="radio"
              name="accordion"
              id="fifth"
              value="cancel"
              checked={selectedFAQ === "cancel"}
              readOnly
            />
            <label htmlFor="fifth" onClick={(e) => handleRadioChange(e, "cancel")}>
              {language === "ja" && "キャンセルするには？"}
              {language === "en" && "How do I cancel?"}
            </label>
            <div className={`${styles.content}`}>
              <p className={`${language === "en" ? `!tracking-[0.5px]` : ``}`}>
                {language === "ja" &&
                  "TRUSTiFYの手続きはとっても簡単。面倒な契約や拘束は一切ありません。たった数回のクリックで、オンラインで簡単にキャンセルできます。キャンセル料金は一切なく、アカウントの開始やキャンセルはいつでも可能です。"}
                {language === "en" &&
                  "TRUSTiFY is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime."}
              </p>
            </div>
          </li>
          {/* <li>
            <input type="radio" name="accordion" id="sixth" />
            <label htmlFor="sixth">
              {language === "ja" && "TRUSTiFYで何が視聴できますか？"}
              {language === "en" && "What can I watch on TRUSTiFY?"}
            </label>
            <div className={`${styles.content} ${language === 'en' ? `!tracking-[0.5px]` : ``}`}>
              <p>
                {language === "ja" &&
                  "Netflixでは、長編映画、ドキュメンタリー、ドラマ、アニメや受賞歴のあるNetflixオリジナル作品など、豊富なラインナップをご用意しています。いつでもお好きなだけ視聴できます。"}
                {language === "en" &&
                  "Netflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Netflix originals, and more. Watch as much as you want, anytime you want."}
              </p>
            </div>
          </li> */}
          {/* <li>
            <input type="radio" name="accordion" id="seventh" />
            <label htmlFor="seventh">
              {language === "ja" && "Netflixは子供も安心して楽しめますか？"}
              {language === "en" && "Is Netflix good for kids?"}
            </label>
            <div className={`${styles.content} ${language === 'en' ? `!tracking-[0.5px]` : ``}`}>
              <p>
                {language === "ja" &&
                  "ご両親がお子様の視聴を管理できるように、メンバーシップにはキッズ専用プロフィールが含まれています。お子様は、キッズプロフィールから家族みんなで楽しめる作品をご覧いただけます。キッズプロフィールは暗証番号で保護されたペアレンタルコントロール機能で管理することができ、お子様が視聴できる作品の年齢制限の設定や、お子様の目に触れてほしくない特定の作品のブロックが可能です。"}
                {language === "en" &&
                  "The Netflix Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and movies in their own space. Kids profiles come with PIN-protected parental controls that let you restrict the maturity rating of content kids can watch and block specific titles you don't want kids to see."}
              </p>
            </div>
          </li> */}
        </ul>
      </section>

      <hr className={styles.horizon} />

      <section className={styles.start}>
        <small className="">
          {language === "ja" &&
            "まもなくご利用いただけます! メールアドレスを入力してメンバーシップを開始してください。"}
          {language === "en" && "Ready to use? Enter your email to create or restart your membership."}
        </small>
        {/* Netflixメールエリア */}
        <div className={`${styles.email_signUp_area}`} ref={emailRef}>
          <div className={`${styles.email_auth}`}>
            <div className={styles.input_box}>
              <input
                type="email"
                // placeholder={`${language === "ja" ? "メールアドレス" : "Email"}`}
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
                {language === "ja" && "メールアドレス"}
                {language === "en" && "Email"}
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
              {language === "ja" && "今すぐ始める"}
              {language === "en" && "Get Started"}
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
        <h2 className="flex items-center">
          <span className="mr-[7px] inline-block">{neonMailIcon("32")}</span>
          <span className="mr-[8px]">
            {language === "ja" && `ご質問ですか？お問合せはこちらまで: `}
            {language === "en" && "Questions? Email: "}
          </span>

          <span
            className={`cursor-copy select-none hover:text-[var(--color-text-brand-f)] hover:underline`}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText("info@thetrustify.com");
                toast.success(`コピーしました!`, {
                  autoClose: 1500,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                });
              } catch (e: any) {
                toast.error(`コピーできませんでした!`, {
                  position: "top-right",
                  autoClose: 1500,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
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
              {language === "ja" && "よくあるご質問"}
              {language === "en" && "FAQ"}
            </Link>
            <Link href="#" prefetch={false}>
              {language === "ja" && "お知らせ"}
              {language === "en" && ""}
            </Link>
            {/* <Link href="#" prefetch={false}>
              {language === "ja" && "お知らせ"}
              {language === "en" && ""}
            </Link> */}
            {/* <Link href="/" prefetch={false}>
              {language === "ja" && "投資家情報"}
              {language === "en" && "Investor Relations"}
            </Link>
           
            <Link href="/" prefetch={false}>
              {language === "ja" && "スピードテスト"}
              {language === "en" && "Speed Test"}
            </Link> */}
          </div>
          <div className={styles.col}>
            {/* <Link href="/" prefetch={false}>
              {language === "ja" && "ヘルプセンター"}
              {language === "en" && "Help Center"}
            </Link> */}
            <Link href="#" prefetch={false}>
              {language === "ja" && "利用規約"}
              {language === "en" && "Terms of Use"}
            </Link>
            {/* <Link href="#" prefetch={false}>
              {language === "ja" && "プライバシーポリシー"}
              {language === "en" && "Privacy"}
            </Link> */}
            {/* <Link href="/" prefetch={false}>
              {language === "ja" && "採用情報"}
              {language === "en" && "Jobs"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "ja" && "Cookieの設定"}
              {language === "en" && "Cookies Preferences"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "ja" && "法的事項"}
              {language === "en" && "Legal Notices"}
            </Link> */}
          </div>
          <div className={styles.col}>
            {/* <Link href="/" prefetch={false}>
              {language === "ja" && "アカウント"}
              {language === "en" && "Account"}
            </Link> */}
            {/* <Link href="/" prefetch={false}>
              {language === "ja" && "視聴デバイス"}
              {language === "en" && "ways to watch"}
            </Link> */}
            {/* <Link href="#" prefetch={false}>
              {language === "ja" && "企業情報"}
              {language === "en" && "Corporate Information"}
            </Link> */}
            <Link href="#" prefetch={false}>
              {language === "ja" && "プライバシーポリシー"}
              {language === "en" && "Privacy"}
            </Link>
            {/* <Link href="/" prefetch={false}>
              {language === "ja" && "Netflix独占配信"}
              {language === "en" && "Only on Netflix"}
            </Link> */}
          </div>
          <div className={styles.col}>
            {/* <Link href="/" prefetch={false}>
              {language === "ja" && "メディアセンター"}
              {language === "en" && "Media Centre"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "ja" && "利用規約"}
              {language === "en" && "Terms of Use"}
            </Link> */}
            {/* <Link href="#" prefetch={false}>
              {language === "ja" && "お問い合せ"}
              {language === "en" && "Contact Us"}
            </Link> */}
            {/* <Link href="#" prefetch={false}>
              {language === "ja" && "お知らせ"}
              {language === "en" && ""}
            </Link> */}
            <Link href="/about" prefetch={false}>
              {language === "ja" && "企業情報"}
              {language === "en" && "Corporate Information"}
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
            {language === "ja" && "日本語"}
            {language === "en" && "English"}
            <AiFillCaretDown />
          </button>
        </div>
        <p className={styles.copyright_txt}>
          {language === "ja" && "TRUSTiFY"}
          {language === "en" && "TRUSTiFY"}
        </p>
      </section>
    </main>
  );
};
