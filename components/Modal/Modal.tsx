import useStore from "@/store";
import React, { FC, FormEvent, useEffect, useRef, useState } from "react";
import styles from "./Modal.module.css";
import { MdClose } from "react-icons/md";
import { googleIcon } from "../assets";
import { useMutateAuth } from "@/hooks/useMutateAuth";
import { CheckBtn } from "../Parts/CheckBtn/CheckBtn";
import Link from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import Spinner from "../Parts/Spinner/Spinner";
import SpinnerD from "../Parts/SpinnerD/SpinnerD";
import { useUpdateEffect } from "react-use";
import { SpinnerX } from "../Parts/SpinnerX/SpinnerX";
import { Spinner78 } from "../Parts/Spinner78/Spinner78";
import { SpinnerBrand } from "../Parts/SpinnerBrand/SpinnerBrand";

export const Modal: FC = () => {
  console.log("Modalコンポーネントレンダリング");
  // Supabaseクライアント
  const supabaseClient = useSupabaseClient();

  // ZustandのグローバルState
  const isOpenModal = useStore((state) => state.isOpenModal);
  const setIsOpenModal = useStore((state) => state.setIsOpenModal);
  // const closeModal = useStore((state) => state.closeModal);
  // const modalContent = useStore((state) => state.modalContent);
  const language = useStore((state) => state.language);
  const isLogin = useStore((state) => state.isLogin);
  const setIsLogin = useStore((state) => state.setIsLogin);
  const alreadyRequestedOtp = useStore((state) => state.alreadyRequestedOtp);

  const {
    email,
    setEmail,
    errorMsg,
    loginCode,
    setLoginCode,
    isLoading,
    otpLoginRequestMutation,
    otpLoginMutation,
    otpRegisterRequestMutation,
    otpRegisterMutation,
    googleLoginMutation,
  } = useMutateAuth();

  // メールアドレスを入力して「今すぐ始める」ボタンをクリックしたフロー
  const emailRef = useRef<HTMLFormElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [checkedEmail, setCheckedEmail] = useState("");
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);

  const regex = /^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

  // useEffect(() => {
  // useUpdateEffect(() => {
  //   if (email === "") {
  //     console.log("🔥");
  //     emailRef.current?.classList.remove(`${styles.success}`);
  //     emailRef.current?.classList.remove(`${styles.error}`);
  //     setCheckedEmail("");
  //     return;
  //   }
  //   console.log("email", email);
  //   console.log("regex.test(email)", regex.test(email));
  //   if (regex.test(email)) {
  //     emailRef.current?.classList.add(`${styles.success}`);
  //     emailRef.current?.classList.remove(`${styles.error}`);
  //     setCheckedEmail("Valid");
  //   } else {
  //     emailRef.current?.classList.add(`${styles.error}`);
  //     emailRef.current?.classList.remove(`${styles.success}`);
  //     setCheckedEmail("Invalid");
  //   }
  // }, [email]);

  // Emailチェック関数
  const handleCheckEmail = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Submit時にemailRefのクラスを初期化
    // emailRef.current[index]?.classList.remove(`${styles.success}`);
    // emailRef.current[index]?.classList.remove(`${styles.error}`);
    emailRef.current?.classList.remove(`${styles.success}`);
    emailRef.current?.classList.remove(`${styles.error}`);

    const emailInput = e.target.value;

    // ====== メールアドレスチェック ======
    if (emailInput === "") {
      console.log("Modal handleSubmitメールアドレスチェック メール空");
      emailRef.current?.classList.remove(`${styles.success}`);
      emailRef.current?.classList.remove(`${styles.error}`);
      setCheckedEmail("");
      return console.log("メール空のためリターン");
    }
    console.log("emailInput", emailInput);
    console.log("regex.test(emailInput)", regex.test(emailInput));
    // 有効なメールルート
    if (regex.test(emailInput)) {
      emailRef.current?.classList.add(`${styles.success}`);
      emailRef.current?.classList.remove(`${styles.error}`);
      setCheckedEmail("Valid");
    }
    // 無効なメールルート
    else {
      emailRef.current?.classList.add(`${styles.error}`);
      emailRef.current?.classList.remove(`${styles.success}`);
      setCheckedEmail("Invalid");
      return console.log("メールが有効では無いためリターン");
    }
  };

  // ====================== Submit関数 ======================
  // OTPが6桁か確認する関数
  const isValidOTP = (value: number | string) => {
    // 6桁の数字であることを確認する正規表現
    const regexOTP = /^\d{6}$/;
    // 値をstringに変換
    const stringValue = String(value);
    return regexOTP.test(stringValue);
  };
  // メンテナンス中用
  const handleSubmitTest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSubmit実行");
    if (checkedEmail === "Invalid") return console.log("Invalidのためリターン");

    // Submit時にemailRefのクラスを初期化
    emailRef.current?.classList.remove(`${styles.success}`);
    emailRef.current?.classList.remove(`${styles.error}`);

    // ====== メールアドレスチェック ======
    if (email === "") {
      console.log("Modal handleSubmitメールアドレスチェック メール空");
      emailRef.current?.classList.remove(`${styles.success}`);
      emailRef.current?.classList.remove(`${styles.error}`);
      setCheckedEmail("");
      return console.log("メール空のためリターン");
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
      return console.log("メールが有効では無いためリターン");
    }
    // =================================

    // OTPリクエスト or OTPサインアップ、サインイン

    try {
      // otpリクエスト前
      if (!alreadyRequestedOtp) {
        console.log("OTPリクエスト送信");
        // ログインモード
        if (isLogin) {
          otpLoginRequestMutation.mutate();
        }
        // サインアップ(新規作成)モード
        else {
          otpRegisterRequestMutation.mutate();
        }
      }
      // otpリクエスト後
      else {
        if (!isValidOTP(loginCode)) return alert("有効なログインコードを入力してください");
        console.log("OTP認証送信");
        // ログインモード
        if (isLogin) {
          otpLoginMutation.mutate();
        }
        // サインアップ(新規作成)モード
        else {
          otpRegisterMutation.mutate();
        }
      }
    } catch (error) {
      console.log("try/catch文error", error);
    }
  };

  // ====================== Google認証 ======================
  const handleGoogleAuth = () => {
    console.log("handleGoogleAuth実行");
    googleLoginMutation.mutate();
  };

  if (!isOpenModal) return null;

  console.log("🌟checkedEmail", checkedEmail);

  return (
    <>
      {/* オーバーレイ */}
      <div className={`flex-center ${styles.overlay}`} onClick={() => setIsOpenModal(false)}>
        {/* バーチャルビデオ背景 ここから */}
        <div className={`h-screen w-screen`}>
          <video
            autoPlay={true}
            muted={true}
            playsInline={true}
            loop={true}
            // className={`h-[100%] w-[100%] object-cover opacity-90`}
            className={`fade05-op09 h-[100%] w-[100%] object-cover opacity-90`}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* <source src="/assets/videos/Root/top-bg-virtual-trimmed.mp4" type="video/mp4" /> */}
            {/* <source src="/assets/videos/Root/virtual_resized_compressed.mp4" type="video/mp4" /> */}
            <source src="/assets/videos/Root/star_bg2_trimmed.mp4" type="video/mp4" />
          </video>
          {/* 暗くするオーバーレイ */}
          {/* <div className="absolute inset-0 z-[1] bg-[#00000010]"></div> */}
          {/* シャドウグラデーション */}
          <div className="shadow-gradient-tb-xs pointer-events-none absolute inset-0 z-[1] h-full w-full select-none"></div>
        </div>
        {/* バーチャルビデオ背景 ここまで */}
      </div>
      {/* モーダル */}
      <div className={`${styles.auth_container} transition-base fade05`}>
        {/* <div className={`${styles.modal_container} transition-base fade05`}> */}
        {/* ローディングオーバーレイ */}
        {isLoading && (
          <div className={`${styles.loading_overlay} flex-center fixed inset-0 z-[10000] bg-[#00000090]`}>
            <SpinnerBrand withBorder withShadow />
          </div>
        )}
        <div className="mb-[12px] flex h-[38px] w-full items-center justify-end pr-3">
          <button onClick={() => setIsOpenModal(false)} className="cursor-pointer">
            <MdClose className="fill-[#777] text-[24px]" />
          </button>
        </div>
        {/* <form className={`${styles.auth_form}`} onSubmit={handleSubmit}> */}
        <div className={`${styles.auth_area}`}>
          {/* エラーメッセージ */}
          <div className={`${styles.auth_error} ${errorMsg ? "block" : "hidden"}`}>
            {errorMsg === "Token has expired or is invalid" && language === "ja"
              ? "ログインコードが有効ではありません"
              : `${errorMsg}`}
            {errorMsg !== "Token has expired or is invalid" && `${errorMsg}`}
          </div>
          {/* Googleボタン */}
          <button
            type="submit"
            className={`${styles.auth_block} ${styles.auth_google} text-[#000]`}
            onClick={handleGoogleAuth}
          >
            <div className="flex-center space-x-4">
              <span className="h-[24px] w-[24px]">{googleIcon}</span>
              <div className={`${styles.google_text}`}>
                {language === "ja" && "Googleでログイン"}
                {language === "en" && "Sign in with Google"}
              </div>
            </div>
          </button>

          <span className={styles.sign_in_and_up_orBlock}>
            {language === "ja" && "または"}
            {language === "en" && "or"}
          </span>

          {/* メール */}
          {/* <input
            type="email"
            id="email"
            required
            autoComplete="username"
            autoCapitalize="off"
            placeholder={`${language === "ja" ? "メールアドレスを入力" : "Email"}`}
            className={`${styles.form_input} ${styles.auth_block} placeholder:text-[18px]`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          /> */}
          {/* ================== formエリア ================== */}
          <form
            className={`${styles.auth_form} ${styles.email_signUp_area}`}
            // onSubmit={handleSubmitTest}
            onSubmit={handleSubmit}
            ref={emailRef}
          >
            {/* <form className={`${styles.auth_form} ${styles.email_signUp_area}`} onSubmit={handleSubmit} ref={emailRef}> */}
            {/* ========= メールアドレス入力エリア ========= */}
            <div className={`${styles.input_group} ${styles.email_box} relative`}>
              {/* <label htmlFor="email">
              {language === "ja" && "メール"}
              {language === "en" && "Email"}
            </label> */}
              <input
                type="email"
                name="email"
                id="email"
                required
                // placeholder={`${language === "ja" ? "メールアドレスを入力" : "Email"}`}
                autoFocus
                value={email}
                // onChange={(e) => {
                //   setEmail(e.target.value);
                // }}
                onChange={(e) => {
                  // Emailチェック+input入力値変更
                  if (checkedEmail === "Invalid") {
                    handleCheckEmail(e);
                    setEmail(e.target.value);
                  } else {
                    setEmail(e.target.value);
                  }

                  // 初回入力時のみサブミットをtrueに
                  if (checkedEmail !== "Invalid" && checkedEmail !== "Valid" && email !== "" && !isReadyToSubmit) {
                    console.log("初回input入力のためボタンに色をつけるために発火🔥", checkedEmail);
                    setIsReadyToSubmit(true);
                  }
                }}
                onBlur={(e) => handleCheckEmail(e)}
                className={`${alreadyRequestedOtp ? `${styles.submittedEmailInput}` : ""} ${styles.email_input_area}`}
              />
              <span className={`${email !== "" ? `${styles.entered_email}` : ``} pointer-events-none select-none`}>
                {language === "ja" ? "メールアドレスを入力" : "Email"}
              </span>
            </div>
            {/* {checkedEmail === "Valid" && <span className={styles.msg}>有効なメールアドレスです</span>} */}
            {checkedEmail === "Invalid" && <span className={styles.msg}>有効なメールアドレスを入力してください</span>}
            {/* ========= メールアドレス入力エリア ========= */}

            {/* メールでOTPリクエスト送信後に表示するメッセージ */}
            {alreadyRequestedOtp && (
              <div className={`${styles.sub_text} flex-col-center mt-[12px] text-[14px]`}>
                <span>一時的なログインコードをお送りしました。</span>
                <span>受信トレイをご確認ください。</span>
              </div>
            )}

            <div className="h-[16px]"></div>

            {/* ========= ログインコード入力エリア ========= */}
            {alreadyRequestedOtp && (
              <>
                <div className={`${styles.input_group} ${styles.login_code_box}`}>
                  {/* <label htmlFor="email">
                  {language === "ja" && "ログインコード"}
                  {language === "en" && "Email"}
                </label> */}
                  <input
                    type="text"
                    name="login_code"
                    id="login_code"
                    // placeholder={`${language === "ja" ? "ログインコードを入力" : "Login code"}`}
                    value={loginCode}
                    onChange={(e) => {
                      setLoginCode(e.target.value);
                    }}
                    className={`${styles.login_code_area}`}
                  />
                  <span
                    className={`${
                      loginCode !== "" ? `${styles.entered_login_code}` : ``
                    } pointer-events-none select-none`}
                  >
                    {language === "ja" ? "ログインコードを入力" : "Login code"}
                  </span>
                </div>
                <div className="h-[16px]"></div>
              </>
            )}

            {/* ログインボタン */}
            <button type="submit" className={`${styles.auth_block} ${styles.auth_button}`}>
              {/* Reflection */}
              <span className={styles.re}></span>
              {isLoading ? (
                <div className="flex-center h-full w-full">
                  {/* <Spinner w="28px" h="28px" s="3px" /> */}
                  {/* <SpinnerX w="w-[28px]" h="h-[28px]" fill="fill-[var(--color-bg-brand)]" bgColor="text-[#ccc]" /> */}
                  <Spinner78 c="#02e7f5" />
                </div>
              ) : isLogin ? (
                <>
                  {language === "ja" && "メールアドレスでログイン"}
                  {/* {language === "ja" && "準備中"} */}
                  {language === "en" && "Log in"}
                </>
              ) : alreadyRequestedOtp ? (
                <>
                  {language === "ja" && "ログインコードで続ける"}
                  {language === "en" && "Create account"}
                </>
              ) : (
                <>
                  {/* {language === "ja" && "メールアドレスでアカウントを作成"} */}
                  {language === "ja" && "メールアドレスでログイン"}
                  {/* {language === "ja" && "準備中"} */}
                  {language === "en" && "Create account"}
                </>
              )}
            </button>
          </form>

          <div className="h-[16px]"></div>
          <div className="h-[8px]"></div>

          {isLogin ? (
            <>
              {/* シングルサインオンエリア */}
              {/* <div className={`${styles.signIn_with_saml_area} flex-center`}>
                <Link href="#" prefetch={false}>
                  {language === "ja" && "シングルサインオンを使用"}
                  {language === "en" && "Use single sign-on"}
                </Link>
              </div> */}

              {/* <div className="h-[16px]"></div>
              <div className="h-[8px]"></div> */}

              {/* ログインに切り替えエリア */}
              <div className={`${styles.sign_in_and_up_switch_area} flex-center`}>
                {language === "ja" && (
                  <div className={styles.switch_form_text}>
                    アカウントを持っていませんか?{" "}
                    <span className={styles.switch_link} onClick={() => setIsLogin(false)}>
                      作成する
                    </span>
                  </div>
                )}
                {language === "en" && (
                  <div className={styles.switch_form_text}>
                    No account?{" "}
                    <span className={styles.switch_link} onClick={() => setIsLogin(false)}>
                      Create one
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* チェックボックスエリア */}
              {/* <div className={`${styles.checkbox_area}`}>
                <CheckBtn htmlFor="opt_in_email_checkbox" checkBtnColor="var(--color-btn-brand)" />
                <label htmlFor="opt_in_email_checkbox" className={styles.checkbox_label}>
                  {language === "ja" && "キャンペーン案内メールを希望する"}
                  {language === "en" && "I agree to join TRUSTiFY's mailing list"}
                </label>
              </div> */}

              {/* <div className="h-[16px]"></div> */}
              <div className="h-[8px]"></div>

              {/* シングルサインオンエリア */}
              {/* <div className={`${styles.signIn_with_saml_area} flex-center`}>
                <Link href="#" prefetch={false}>
                  {language === "ja" && "シングルサインオンを使用"}
                  {language === "en" && "Use single sign-on"}
                </Link>
              </div> */}

              {/* <div className="h-[16px]"></div>
              <div className="h-[8px]"></div> */}

              {/* ログインに切り替えエリア */}
              <div className={`${styles.sign_in_and_up_switch_area} flex-center`}>
                {language === "ja" && (
                  <div className={styles.switch_form_text}>
                    アカウントをお持ちですか?{" "}
                    <span className={styles.switch_link} onClick={() => setIsLogin(true)}>
                      ログイン
                    </span>
                  </div>
                )}
                {language === "en" && (
                  <div className={styles.switch_form_text}>
                    Already have an account?{" "}
                    <span className={styles.switch_link} onClick={() => setIsLogin(true)}>
                      Log in
                    </span>
                  </div>
                )}
              </div>

              <div className="h-[16px]"></div>
              <div className="h-[16px]"></div>

              {/* 利用規約・プライバシーポリシーエリア */}
              <div className={styles.term_wrapper}>
                <span>
                  {language === "ja" && (
                    <>
                      「メールアドレスでログイン」と「Googleでログイン」をクリックすることで、TRUSTiFYの
                      <Link href="#" prefetch={false}>
                        利用規約
                      </Link>
                      と
                      <Link href="#" prefetch={false}>
                        プライバシーポリシー
                      </Link>
                      に同意したものとみなされます。
                    </>
                  )}
                  {language === "en" && (
                    <>
                      By clicking &apos;Create account&apos; or &apos;Continue with Google&apos;, you agree to{" "}
                      <Link href="#" prefetch={false}>
                        the Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="#" prefetch={false}>
                        Privacy Policy.
                      </Link>
                    </>
                  )}
                </span>
              </div>
            </>
          )}

          {/* <input
            type="password"
            id="current-password"
            required
            placeholder={`${language === "ja" ? "パスワード" : "Password"}`}
            autoCapitalize="off"
            autoComplete="current-password"
            className={`${styles.form_input} ${styles.auth_block} placeholder:text-[18px]`}
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
          />
          <div className="h-[16px]"></div> */}
          <div className="flex cursor-pointer items-start justify-center "></div>
        </div>

        {/* {modalContent} */}
      </div>
    </>
  );
};
