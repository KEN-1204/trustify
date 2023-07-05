//Authコンポーネントの中で認証を行うためのカスタムフックのファイル

//新規登録とログインの役割を担う認証カスタムフックのuseMutationでは、supabaseAPIにログイン情報、新規登録情報を送るのみでsupabaseAPIからdataはレスポンスされないので、ここではレスポンスされたdataをキャッシュに保存する処理は必要無いためonSuccessは無し

import useStore from "@/store";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation } from "@tanstack/react-query";
import { features } from "process";
import { useState } from "react";

export const useMutateAuth = () => {
  const supabaseClient = useSupabaseClient();
  const [email, setEmail] = useState("");
  const [loginCode, setLoginCode] = useState(""); // OTP(ワンタイムパスワード)
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const setAlreadyRequestedOtp = useStore((state) => state.setAlreadyRequestedOtp);
  const setSessionState = useStore((state) => state.setSessionState);
  const setIsOpenModal = useStore((state) => state.setIsOpenModal);
  const setGetStartWithEmail = useStore((state) => state.setGetStartWithEmail);

  const googleLoginMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(""); // 前回のエラーメッセージを初期化
      setIsLoading(true);
      // const { data, error } = await supabaseClient.auth.signInWithOAuth({
      const data = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: {
          queryParams: {
            access_type: "offline",
            // prompt: "consent",
            prompt: "select_account",
            // hd: "domain.com", // google will also allow OAuth logins to be restricted to a specified domain using the 'hd' parameter
          },
          // skipBrowserRedirect: true,
          // redirectTo: process.env.CLIENT_URL, //テスト
        },
      });

      // 自作でポップアップウィンドウを立ち上げる
      // const displayX = window.innerWidth / 2 - 250;
      // const displayY = window.innerHeight / 2 - 350;
      // if (data.data.url) window.open(data.data.url, undefined, `left=${displayX},top=${displayY},width=500,height=700`);

      console.log("Google認証結果signInWithOAuth()の返り値 data, error", data, data.error);
      // 認証エラーが発生したらエラーを投げてonErrorに移行させる
      if (data.error) throw new Error(data.error.message);

      return data;
    },
    onSuccess(data, variables, context) {
      console.log("otpLoginRequestMutation onSuccess data", data);
      console.log("otpLoginRequestMutation onSuccess variables", variables);
      console.log("otpLoginRequestMutation onSuccess context", context);

      setEmail("");
      setIsOpenModal(false);
      setGetStartWithEmail(false);
      setIsLoading(false);
    },
    onError(error: any, variables, context) {
      console.log("otpLoginRequestMutation onSuccess data", error);
      console.log("otpLoginRequestMutation onSuccess variables", variables);
      console.log("otpLoginRequestMutation onSuccess context", context);
      // alert(error.message);
      setErrorMsg(error.message);
      setEmail("");
      setIsLoading(false);
    },
  });

  // ログインotpリクエスト
  const otpLoginRequestMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(""); // 前回のエラーメッセージを初期化
      // const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      setIsLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithOtp({
        email: email,
      });
      console.log("signInWithOtpワンタイムパスワードリクエスト送信後のdata, error", data, error);
      // 認証エラーが発生したらエラーを投げてonErrorに移行させる
      if (error) throw new Error(error.message);
    },
    onSuccess: (data, variables, context) => {
      console.log("otpLoginRequestMutation onSuccess data", data);
      console.log("otpLoginRequestMutation onSuccess variables", variables);
      console.log("otpLoginRequestMutation onSuccess context", context);
      // otpメール送信完了したためOTP入力フォームに変更
      setAlreadyRequestedOtp(true);
      setIsLoading(false);
    },
    onError: (error: any, variables, context) => {
      // alert(error.message);
      setErrorMsg(error.message);
      setEmail("");
      setIsLoading(false);
    },
  });
  // ログインotpコードでログイン認証
  const otpLoginMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(""); // 前回のエラーメッセージを初期化
      // const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      setIsLoading(true);
      const { data, error } = await supabaseClient.auth.verifyOtp({
        email: email,
        token: loginCode,
        type: "email",
      });
      console.log("verifyOtpワンタイムパスワード送信後のdata, error", data, error);
      // 認証エラーが発生したらエラーを投げてonErrorに移行させる
      if (error) throw new Error(error.message);

      return data;
    },
    onSuccess: (data, variables, context) => {
      console.log("otpLoginMutation onSuccess data", data);
      console.log("otpLoginMutation onSuccess variables", variables);
      console.log("otpLoginMutation onSuccess context", context);

      setEmail("");
      setIsOpenModal(false);
      setGetStartWithEmail(false);
      // ログイン完了したためフォームを通常モードに戻す
      setAlreadyRequestedOtp(false);
      setIsLoading(false);
    },
    onError: (error: any, variables, context) => {
      // alert(error.message);
      setErrorMsg(error.message);
      setEmail("");
      setLoginCode("");
      // エラーとなったため通常モードに戻す
      setAlreadyRequestedOtp(false);
      setIsLoading(false);
    },
  });

  // Emailを送信してOTPメールを受信するためのリクエスト
  const otpRegisterRequestMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(""); // 前回のエラーメッセージを初期化
      // const { error } = await supabaseClient.auth.signUp({ email, password });
      // if (error) throw new Error(error.message);
      localStorage.setItem("email", email);
      setIsLoading(true);
      const { data, error } = await supabaseClient.auth.signInWithOtp({
        email: email,
      });
      console.log("signInWithOtpワンタイムパスワードリクエスト送信後のdata, error", data, error);
      // 認証エラーが発生したらエラーを投げてonErrorに移行させる
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess(data, variables, context) {
      console.log("otpRegisterRequestMutation onSuccess data", data);
      console.log("otpRegisterRequestMutation onSuccess variables", variables);
      console.log("otpRegisterRequestMutation onSuccess context", context);
      // otpメール送信完了したためOTP入力フォームに変更
      setAlreadyRequestedOtp(true);
      setIsLoading(false);
    },
    onError: (error: any) => {
      // alert(error.message);
      setErrorMsg(error.message);
      setEmail("");
      localStorage.removeItem("email");
      setIsLoading(false);
    },
  });
  // ログインコード(OTP)を送信して認証、新規登録
  const otpRegisterMutation = useMutation({
    mutationFn: async () => {
      setErrorMsg(""); // 前回のエラーメッセージを初期化
      // const { error } = await supabaseClient.auth.signUp({ email, password });
      // if (error) throw new Error(error.message);
      setIsLoading(true);
      const { data, error } = await supabaseClient.auth.verifyOtp({
        email: email,
        token: loginCode,
        type: "email",
      });
      console.log("verifyOtpワンタイムパスワード送信後のdata, error", data, error);
      // 認証エラーが発生したらエラーを投げてonErrorに移行させる
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess(data, variables, context) {
      console.log("otpRegisterMutation onSuccess data", data);
      console.log("otpRegisterMutation onSuccess variables", variables);
      console.log("otpRegisterMutation onSuccess context", context);

      // セッション情報をZustandに格納
      setSessionState(data.session);
      setEmail("");
      setIsOpenModal(false);
      setGetStartWithEmail(false);
      // サインアップ完了したためフォームを通常モードに戻す
      setAlreadyRequestedOtp(false);
      setIsLoading(false);
    },
    onError: (error: any) => {
      // alert(error.message);
      setErrorMsg(error.message);
      setEmail("");
      setLoginCode("");
      // エラーとなったため通常モードに戻す
      setAlreadyRequestedOtp(false);
      setIsLoading(false);
    },
  });

  return {
    email,
    setEmail,
    loginCode,
    setLoginCode,
    errorMsg,
    googleLoginMutation,
    otpLoginRequestMutation,
    otpLoginMutation,
    otpRegisterRequestMutation,
    otpRegisterMutation,
    isLoading,
  };
};
