import { ClickedItemPos, hoveredItemPos, hoveredItemPosHorizon } from "@/types";
import { Session } from "@supabase/supabase-js";
import { ReactNode } from "react";
import { create } from "zustand";

type State = {
  // =================== マウス ===================
  // クリック位置
  clickedItemPos: ClickedItemPos;
  setClickedItemPos: (payload: ClickedItemPos) => void;
  clickedItemPosOver: ClickedItemPos;
  setClickedItemPosOver: (payload: ClickedItemPos) => void;

  // ツールチップ ホバー位置 上下
  hoveredItemPos: hoveredItemPos;
  setHoveredItemPos: (payload: hoveredItemPos) => void;
  // ツールチップ ホバー位置 左右
  hoveredItemPosHorizon: hoveredItemPosHorizon;
  setHoveredItemPosHorizon: (payload: hoveredItemPosHorizon) => void;

  // =================== 認証関連 ===================
  // セッション情報
  sessionState: Session | null;
  setSessionState: (payload: Session | null) => void;

  // ユーザーのログイン有無
  isLogin: boolean;
  setIsLogin: (payload: boolean) => void;

  // ユーザーのメールアドレスの入力値を保持
  inputEmail: string;
  setInputEmail: (payload: string) => void;

  // ユーザーの「今すぐ始める」ボタン押下でAuthモーダル表示
  getStartWithEmail: boolean;
  setGetStartWithEmail: (payload: boolean) => void;

  // OTPリクエスト前と後のState
  // 初回はemailのみで送信、ユーザーがメールでログインコード(OTP)を確認後、
  // フォームは「ログインコードの入力」inputと「ログインコードを送信」ボタンを表示する
  alreadyRequestedOtp: boolean;
  setAlreadyRequestedOtp: (payload: boolean) => void;

  // =================== 共通 ===================
  // 言語切り替え
  language: string;
  setLanguage: (payload: string) => void;

  // 言語切り替えタブ開閉状態
  openLangTab: boolean;
  setOpenLangTab: (payload: boolean) => void;

  // テーマ(Light & Dark)
  theme: string;
  setTheme: (payload: string) => void;

  // モーダル
  isOpenModal: boolean;
  setIsOpenModal: (payload: boolean) => void;
  // modalContent: ReactNode;
  // openModal: (content: ReactNode) => void;
  // closeModal: () => void;

  // HPヘッダー関連
  isHeaderShown: boolean;
  setIsHeaderShown: (payload: boolean) => void;
  isHeaderTop: boolean;
  setIsHeaderTop: (payload: boolean) => void;

  // チェックボタン チェック有無
  isChecked: boolean;
  setIsChecked: (payload: boolean) => void;

  // =================== Profile関連 ===================
};

const useStore = create<State>((set) => ({
  // =================== マウス ===================
  // クリックしたアイテムのポジションを取得
  clickedItemPos: null,
  setClickedItemPos: (payload) => set({ clickedItemPos: payload }),
  // クリックしたアイテムのポジションを取得して、上側にメニューを表示
  clickedItemPosOver: null,
  setClickedItemPosOver: (payload) => set({ clickedItemPosOver: payload }),

  // 【ホバーしたアイテムのポジションを取得 下側にツールチップを表示】
  hoveredItemPos: null,
  setHoveredItemPos: (payload) => set({ hoveredItemPos: payload }),
  // 【ツールチップ ホバー位置 左右】
  hoveredItemPosHorizon: null,
  setHoveredItemPosHorizon: (payload) => set({ hoveredItemPosHorizon: payload }),

  // =================== 認証関連 ===================
  // 【セッション情報】
  sessionState: null,
  setSessionState: (payload) => set({ sessionState: payload }),

  // 【ユーザーのログイン有無】
  isLogin: false,
  setIsLogin: (payload) => set({ isLogin: payload }),

  // 【ユーザーのメールアドレスの入力値を保持】
  inputEmail: "",
  setInputEmail: (payload) => set({ inputEmail: payload }),

  // 【ユーザーの「今すぐ始める」ボタン押下でAuthモーダル表示】
  getStartWithEmail: false,
  setGetStartWithEmail: (payload) => set({ getStartWithEmail: payload }),

  // OTPリクエスト前と後のState
  // 初回はemailのみで送信、ユーザーがメールでログインコード(OTP)を確認後、
  // フォームは「ログインコードの入力」inputと「ログインコードを送信」ボタンを表示する
  alreadyRequestedOtp: false,
  setAlreadyRequestedOtp: (payload) => set({ alreadyRequestedOtp: payload }),

  // =================== 共通 ===================
  // 【言語切り替え】 Ja日本, En英語, Ko韓国語, Zh中国語,
  language: "Ja",
  setLanguage: (payload) => set({ language: payload }),

  // 【言語切り替えタブ開閉状態】
  openLangTab: false,
  setOpenLangTab: (payload) => set({ openLangTab: payload }),

  // 【テーマ切り替え】
  theme: "dark",
  setTheme: (payload) => set({ theme: payload }),

  // 【モーダル開閉】
  isOpenModal: false,
  modalContent: null,
  setIsOpenModal: (payload) => set({ isOpenModal: payload }),

  // 【HPヘッダー関連】
  isHeaderShown: true,
  setIsHeaderShown: (payload) => set({ isHeaderShown: payload }),
  isHeaderTop: true,
  setIsHeaderTop: (payload) => set({ isHeaderTop: payload }),

  // 【チェックボタン チェック有無】
  isChecked: true,
  setIsChecked: (payload) => set({ isChecked: payload }),
}));

export default useStore;
