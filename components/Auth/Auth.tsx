import useStore from "@/store";
import React, { FC, FormEvent, useEffect, useRef, useState } from "react";
import styles from "./Auth.module.css";
import { MdClose } from "react-icons/md";
import { googleIcon } from "../assets";
import { useMutateAuth } from "@/hooks/useMutateAuth";
import { CheckBtn } from "../Parts/CheckBtn/CheckBtn";
import Link from "next/link";
import Spinner from "../Parts/Spinner/Spinner";

export const Auth: FC = () => {
  console.log("Authコンポーネントレンダリング");
  // ZustandのグローバルState
  const language = useStore((state) => state.language);
  const inputEmail = useStore((state) => state.inputEmail);
  const setInputEmail = useStore((state) => state.setInputEmail);
  const setGetStartWithEmail = useStore((state) => state.setGetStartWithEmail);
  const emailRef = useRef<HTMLDivElement | null>(null);
  const [checkedEmail, setCheckedEmail] = useState("");

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
  const isLogin = useStore((state) => state.isLogin);
  const setIsLogin = useStore((state) => state.setIsLogin);
  const alreadyRequestedOtp = useStore((state) => state.alreadyRequestedOtp);

  // メンテナンス中用
  const handleSubmitTest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  };
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("handleSubmit実行");
    try {
      // otpリクエスト前
      if (!alreadyRequestedOtp) {
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

  // Google認証
  const handleGoogleAuth = () => {
    console.log("handleGoogleAuth実行");
    googleLoginMutation.mutate();
  };

  useEffect(() => {
    setEmail(inputEmail);
  }, []);

  //   const signInWithGoogle = async (e: FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();
  //     if (isLogin) {
  //     } else {
  //       const { data, error } = await supabase.auth.signInWithOAuth({
  //         provider: "google",
  //         options: {
  //           queryParams: {
  //             access_type: "offline",
  //             prompt: "consent",
  //             hd: "domain.com", // google will also allow OAuth logins to be restricted to a specified domain using the 'hd' parameter
  //           },
  //         },
  //       });
  //     }
  //   };

  return (
    <div className={`${styles.auth_container} `}>
      <div className="mb-[12px] flex h-[38px] w-full items-center justify-end pr-3">
        <button
          className="cursor-pointer"
          onClick={() => {
            setInputEmail("");
            setGetStartWithEmail(false);
          }}
        >
          <MdClose className="fill-[#777] text-[24px]" />
        </button>
      </div>
      <form className={` ${styles.auth_form}`} onSubmit={handleSubmit}>
        {/* <form className={` ${styles.auth_form}`} onSubmit={handleSubmitTest}> */}
        <div className={`${styles.auth_error} ${errorMsg ? "block" : "hidden"}`}>{errorMsg}</div>
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

        {/* ============================ メール ============================ */}
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
        <div className={`${styles.input_group}`} ref={emailRef}>
          {/* <label htmlFor="email">
              {language === "ja" && "メール"}
              {language === "en" && "Email"}
            </label> */}
          <input
            type="email"
            name="email"
            id="email"
            placeholder={`${language === "ja" ? "メールアドレスを入力" : "Email"}`}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          />
          {checkedEmail === "Valid" && <span className={styles.msg}>有効なメールアドレスです</span>}
          {checkedEmail === "Invalid" && <span className={styles.msg}>有効なメールアドレスを入力してください</span>}
        </div>

        {/* ========= メールでOTPリクエスト送信後に表示するメッセージ ========= */}
        {alreadyRequestedOtp && (
          <div className="flex-col-center mt-[8px] text-[14px] text-[--color-placeholder-text-light]">
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
              <span className={`${loginCode !== "" ? `${styles.entered_login_code}` : ``}`}>
                {language === "ja" ? "ログインコードを入力" : "Login code"}
              </span>
            </div>
            <div className="h-[16px]"></div>
          </>
        )}

        <div className="h-[16px]"></div>

        {/* ========= ログインボタン ========= */}
        <button type="submit" className={`${styles.auth_block} ${styles.auth_button}`}>
          {/* Reflection */}
          <span className={styles.re}></span>
          {isLoading ? (
            <div className="flex-center h-full w-full">
              <Spinner w="28px" h="28px" s="3px" />
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
            </div>

            <div className="h-[16px]"></div>
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
            </div>

            <div className="h-[16px]"></div>
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
      </form>
    </div>
  );
};
