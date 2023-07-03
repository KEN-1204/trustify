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

export const Root: FC = () => {
  console.log("Rootコンポーネントレンダリング");
  // 言語
  const language = useStore((state) => state.language);
  const openLangTab = useStore((state) => state.openLangTab);
  const setOpenLangTab = useStore((state) => state.setOpenLangTab);
  const setClickedItemPos = useStore((state) => state.setClickedItemPos);
  const setClickedItemPosOver = useStore((state) => state.setClickedItemPosOver);
  const openModal = useStore((state) => state.setIsOpenModal);
  const setIsLogin = useStore((state) => state.setIsLogin);
  const getStartWithEmail = useStore((state) => state.getStartWithEmail);
  const setGetStartWithEmail = useStore((state) => state.setGetStartWithEmail);
  const setInputEmail = useStore((state) => state.setInputEmail);
  const authData = useStore((state) => state.authData);
  console.log("🌟authData", authData);

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
        `<span id='red' className="text_gradient_red text-[70px]">キーエンス</span> で培われた</span><br /><span className="whitespace-nowrap leading-normal">強力なデータベースを <span id='one' className="text_gradient">ワンコイン</span> で`,
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
        className={`transition-base-color h-[100dvh] w-[100vw] ${styles.scroll_slides} ${styles.main}`}
        ref={scrollRef}
      >
        <div className={styles.hero}>
          <h1 className={`${language === "En" && "!max-w-full "}`}>
            {/* ========== タイピングアニメーション ========== */}
            <span className={`truncate leading-normal ${language === "Ja" ? "" : "hidden"}`} ref={typingRef}></span>
            {/* ========== タイピングアニメーション ========== */}
            {/* <span className="leading-normal">
              <span className={`${styles.text_gradient_red}`}> キーエンス</span> で培われた
            </span>
            <br />
            <span className="whitespace-nowrap leading-normal">
              強力なデータベースを <span className={`${styles.text_gradient} `}>ワンコイン</span> で
            </span> */}
            {language === "En" && "Unlimited movies, TV shows and more."}
          </h1>
          <h3>
            {language === "Ja" && "映画やドラマをもっと自由に。いつでもキャンセルOK。"}
            {language === "En" && "Watch anywhere. Cancel anytime."}
          </h3>
          <p>
            {language === "Ja" &&
              "まもなくご視聴いただけます! メールアドレスを入力してメンバーシップを開始、または再開してください。"}
            {language === "En" && "Ready to watch? Enter your email to create or restart your membership."}
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
                openModal(true);
              }}
            >
              {language === "Ja" && "今すぐ始める"}
              {language === "En" && "Get Started"}
            </button>
          </div> */}
          {/* </form> */}
          {/* ============= メールで始める ここまで ============= */}
          {/* ============= 始めるボタンでModal表示 Only ============= */}
          <button
            onClick={() => {
              setIsLogin(false);
              openModal(true);
            }}
            className={`${styles.cta_btn}`}
          >
            {language === "Ja" && "無料で始める"}
            {language === "En" && "Get Started for free"}
          </button>
          {/* ============= 始めるボタンでModal表示 ここまで ============= */}
        </div>
      </div>

      <hr className={styles.horizon} />

      {/* ======================== Featuresセクション ======================== */}
      {/* ======================== Feature1 ======================== */}
      <section className={`transition-base-color bg-[--color-bg-hp-main] ${styles.scroll_slides_row}`}>
        <div className={`${styles.text_col}`}>
          <h2>
            {language === "Ja" && "大画面で楽しめる"}
            {language === "En" && "Enjoy on your TV."}
          </h2>
          <p>
            {language === "Ja" &&
              "スマートテレビやApple TVはもちろん、PlayStationやXboxなどのゲーム機、Chromecastなどのストリーミングデバイス、ブルーレイプレーヤーを使えば、お持ちのテレビで簡単に観られます。"}
            {language === "En" &&
              "Watch on Smart TVs, Playstation, Xbox, Chromecast, Apple TV, Blu-ray players, and more."}
          </p>
        </div>
        <div className={`${styles.img_col}`}>
          <Image
            src="/assets/images/feature-1.png"
            alt=""
            placeholder="blur"
            blurDataURL="/assets/images/feature-1-small.png"
            width={800}
            height={600}
          />
        </div>
      </section>

      <hr className={styles.horizon} />

      {/* ======================== Feature2 ======================== */}
      <section className={`transition-base-color bg-[--color-bg-hp-main] ${styles.scroll_slides_row} flex-row-reverse`}>
        <div className={`${styles.text_col}`}>
          <h2>
            {language === "Ja" && "どこでも観られる"}
            {language === "En" && "Watch everywhere."}
          </h2>
          <p>
            {language === "Ja" &&
              "スマートフォンやタブレット、パソコンやテレビなど、たくさんの機器でたくさんの映画やTV番組をお楽しみください。"}
            {language === "En" &&
              "Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV without paying more."}
          </p>
        </div>
        <div className={styles.img_col}>
          <Image
            src="/assets/images/feature-4.png"
            alt=""
            placeholder="blur"
            blurDataURL="/assets/images/feature-4-small.png"
            loading="lazy"
            width={800}
            height={600}
          />
        </div>
      </section>

      <hr className={styles.horizon} />

      {/* ======================== Feature3 ======================== */}
      <section className={`transition-base-color bg-[--color-bg-hp-main] ${styles.scroll_slides_row}`}>
        <div className={`${styles.text_col}`}>
          <h2>
            {language === "Ja" && "お子様用のプロフィールを作成できます。"}
            {language === "En" && "Create profiles for kids."}
          </h2>
          <p>
            {language === "Ja" &&
              "お子様専用のプロフィールから視聴すれば、お子様はお気に入りのキャラクターと冒険をしている気分に。プロフィールは無料でご利用いただけます。"}
            {language === "En" &&
              "Send kids on adventures with their favorite characters in a space made just for them—free with your membership."}
          </p>
        </div>
        <div className={`${styles.img_col}`}>
          <Image
            src="/assets/images/feature-3.png"
            alt=""
            placeholder="blur"
            blurDataURL="/assets/images/feature-3-small.png"
            loading="lazy"
            width={800}
            height={600}
          />
        </div>
      </section>

      <hr className={styles.horizon} />

      <section className={`transition-base-color bg-[--color-bg-hp-main] ${styles.scroll_slides_row} flex-row-reverse`}>
        <div className={`${styles.text_col}`}>
          <h2>
            {language === "Ja" && "ダウンロードしてオフラインで視聴"}
            {language === "En" && "Download your shows to watch offline."}
          </h2>
          <p>
            {language === "Ja" && "広告なしのプランでのみご利用いただけます。"}
            {language === "En" && "Only available on ad-free plans."}
          </p>
        </div>
        <div className={styles.img_col}>
          <Image
            src="/assets/images/feature-2.png"
            alt=""
            placeholder="blur"
            blurDataURL="/assets/images/feature-2-small.png"
            loading="lazy"
            width={800}
            height={600}
          />
        </div>
      </section>

      <hr className={styles.horizon} />

      {/* ======================== FAQ ======================== */}
      <section className={styles.faq}>
        <h2>
          {language === "Ja" && "よくある質問"}
          {language === "En" && "Frequently Asked Questions"}
        </h2>
        <ul className={styles.accordion}>
          <li>
            <input type="radio" name="accordion" id="first" />
            <label htmlFor="first">
              {language === "Ja" && "Netflixとは？"}
              {language === "En" && "What is Netflix?"}
            </label>
            <div className={styles.content}>
              <p>
                {language === "Ja" &&
                  "Netflixは、受賞歴のあるドラマ、映画、アニメ、ドキュメンタリーなどの幅広いコンテンツを配信するストリーミングサービスで、メンバーはあらゆるインターネット接続デバイスで視聴することができます。定額、低価格で、いつでもどこでも、好きなだけ視聴することができます。映画やドラマは毎週追加されるので、いつでも新しい作品が見つかります。"}
                {language === "En" &&
                  "Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries, and more on thousands of internet-connected devices. You can watch as much as you want, whenever you want – all for one low monthly price. There's always something new to discover and new TV shows and movies are added every week!"}
              </p>
            </div>
          </li>
          <li>
            <input type="radio" name="accordion" id="second" />
            <label htmlFor="second">
              {language === "Ja" && "Netflix利用料金は？"}
              {language === "En" && "How much does Netflix cost?"}
            </label>
            <div className={styles.content}>
              <p>
                {language === "Ja" &&
                  "スマホ、タブレット、スマートテレビ、パソコン、ストリーミングデバイスなどから、Netflixを定額でお楽しみいただけます。プランは月額￥790から￥1,980まで。追加料金や長期契約はありません。"}
                {language === "En" &&
                  "Watch Netflix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from JPY790 to JPY1,980 a month. No extra costs, no contracts."}
              </p>
            </div>
          </li>
          <li>
            <input type="radio" name="accordion" id="third" />
            <label htmlFor="third">
              {language === "Ja" && "広告つきプランと通常のプランとの違いは何ですか？"}
              {language === "En" && "What's different on an ad-supported plan?"}
            </label>
            <div className={styles.content}>
              <p>
                {language === "Ja" &&
                  "広告つきプランでは、低価格で映画やドラマをお楽しみいただけます。様々な作品をご視聴いただけますが、再生中に広告が流れることがあります (場所やデバイスによっては一部制限があります)。ダウンロードはご利用いただけません。また、一部の映画やドラマは、ライセンスの関係でご覧いただけません。詳しくはこちら。"}
                {language === "En" &&
                  "An ad-supported plan is a great way to enjoy movies and TV shows at a lower price. You can stream your favorites with limited ad breaks (some location and device restrictions apply). Downloads are not supported and a limited number of movies and TV shows are not available due to licensing restrictions. Learn more."}
              </p>
            </div>
          </li>
          <li>
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
          </li>
          <li>
            <input type="radio" name="accordion" id="fifth" />
            <label htmlFor="fifth">
              {language === "Ja" && "キャンセルするには？"}
              {language === "En" && "How do I cancel?"}
            </label>
            <div className={styles.content}>
              <p>
                {language === "Ja" &&
                  "Netflixの手続きはとっても簡単。面倒な契約や拘束は一切ありません。たった数回のクリックで、オンラインで簡単にキャンセルできます。キャンセル料金は一切なく、アカウントの開始やキャンセルはいつでも可能です。"}
                {language === "En" &&
                  "Netflix is flexible. There are no pesky contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees – start or stop your account anytime."}
              </p>
            </div>
          </li>
          <li>
            <input type="radio" name="accordion" id="sixth" />
            <label htmlFor="sixth">
              {language === "Ja" && "Netflixで何が視聴できますか？"}
              {language === "En" && "What can I watch on Netflix?"}
            </label>
            <div className={styles.content}>
              <p>
                {language === "Ja" &&
                  "Netflixでは、長編映画、ドキュメンタリー、ドラマ、アニメや受賞歴のあるNetflixオリジナル作品など、豊富なラインナップをご用意しています。いつでもお好きなだけ視聴できます。"}
                {language === "En" &&
                  "Netflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Netflix originals, and more. Watch as much as you want, anytime you want."}
              </p>
            </div>
          </li>
          <li>
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
          </li>
        </ul>
      </section>

      <hr className={styles.horizon} />

      <section className={styles.start}>
        <small className="">
          {language === "Ja" &&
            "まもなくご視聴いただけます! メールアドレスを入力してメンバーシップを開始、または再開してください。"}
          {language === "En" && "Ready to watch? Enter your email to create or restart your membership."}
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
                setGetStartWithEmail(true);
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
          {language === "Ja" && "ご質問ですか？お問合せはこちらまで: 0120-000-000"}
          {language === "En" && "Questions? Call 0120-996-012"}
        </h2>

        <div className={styles.row}>
          <div className={styles.col}>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "よくあるご質問"}
              {language === "En" && "FAQ"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "投資家情報"}
              {language === "En" && "Investor Relations"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "プライバシー"}
              {language === "En" && "Privacy"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "スピードテスト"}
              {language === "En" && "Speed Test"}
            </Link>
          </div>
          <div className={styles.col}>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "ヘルプセンター"}
              {language === "En" && "Help Center"}
            </Link>
            <Link href="/" prefetch={false}>
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
            </Link>
          </div>
          <div className={styles.col}>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "アカウント"}
              {language === "En" && "Account"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "視聴デバイス"}
              {language === "En" && "ways to watch"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "企業情報"}
              {language === "En" && "Corporate Information"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "Netflix独占配信"}
              {language === "En" && "Only on Netflix"}
            </Link>
          </div>
          <div className={styles.col}>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "メディアセンター"}
              {language === "En" && "Media Centre"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "利用規約"}
              {language === "En" && "Terms of Use"}
            </Link>
            <Link href="/" prefetch={false}>
              {language === "Ja" && "お問い合せ"}
              {language === "En" && "Contact Us"}
            </Link>
          </div>
        </div>
        <button
          className={styles.language_btn}
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
        <p className={styles.copyright_txt}>
          {language === "Ja" && "Netflix 日本"}
          {language === "En" && "Netflix"}
        </p>
      </section>
    </main>
  );
};
