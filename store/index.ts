import {
  ClickedItemPos,
  hoveredItemPos,
  hoveredItemPosHorizon,
  hoveredItemPosModal,
  hoveredItemPosWrap,
} from "@/types";
// @ts-ignore
import { Session } from "@supabase/supabase-js";
import { ReactNode } from "react";
import { create } from "zustand";

type State = {
  // HP画面 Root or About
  activePage: string;
  setActivePage: (payload: string) => void;

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
  // ツールチップ ホバー位置 カラム編集モーダル
  hoveredItemPosModal: hoveredItemPosModal;
  setHoveredItemPosModal: (payload: hoveredItemPosModal) => void;
  // ツールチップ ホバー位置 カラム編集モーダル
  hoveredItemPosSideTable: hoveredItemPosModal;
  setHoveredItemPosSideTable: (payload: hoveredItemPosModal) => void;
  // 【ホバーしたアイテムのポジションを取得 折り返し有り MouseEnterした位置で動的に上下にツールチップを表示】
  hoveredItemPosWrap: hoveredItemPosWrap;
  setHoveredItemPosWrap: (payload: hoveredItemPosWrap) => void;

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
  // theme: string;
  // setTheme: (payload: string) => void;

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
  lightTextBorderLine: boolean;
  setLightTextBorderLine: (payload: boolean) => void;

  // Feature1ライプライターアニメーション起動
  startAnimationFeature1: boolean;
  setStartAnimationFeature1: (payload: boolean) => void;
  startAnimationFeature2: boolean;
  setStartAnimationFeature2: (payload: boolean) => void;
  startAnimationFeature3: boolean;
  setStartAnimationFeature3: (payload: boolean) => void;
  startAnimationFeature4: boolean;
  setStartAnimationFeature4: (payload: boolean) => void;
  startAnimationFeature5: boolean;
  setStartAnimationFeature5: (payload: boolean) => void;

  // チェックボタン チェック有無
  isChecked: boolean;
  setIsChecked: (payload: boolean) => void;

  // =================== Profile関連 ===================
};

// ============================= 🌟useThemeStore ローカルストレージ保管🌟 =============================

// ================================= 🌟useStore🌟 =================================
const useStore = create<State>((set) => ({
  // HP画面 Root or About
  activePage: "Root",
  setActivePage: (payload) => set({ activePage: payload }),

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
  // 【ツールチップ カラム編集モーダル内で使用】
  hoveredItemPosModal: null,
  setHoveredItemPosModal: (payload) => set({ hoveredItemPosModal: payload }),
  // 【ツールチップ サイドテーブル内で使用】
  hoveredItemPosSideTable: null,
  setHoveredItemPosSideTable: (payload) => set({ hoveredItemPosSideTable: payload }),
  // 【ホバーしたアイテムのポジションを取得 折り返し有り MouseEnterした位置で動的に上下にツールチップを表示】
  hoveredItemPosWrap: null,
  setHoveredItemPosWrap: (payload) => set({ hoveredItemPosWrap: payload }),

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
  language: "ja",
  setLanguage: (payload) => set({ language: payload }),

  // 【言語切り替えタブ開閉状態】
  openLangTab: false,
  setOpenLangTab: (payload) => set({ openLangTab: payload }),

  // 【テーマ切り替え】
  // theme: "dark",
  // setTheme: (payload) => set({ theme: payload }),

  // 【モーダル開閉】
  isOpenModal: false,
  modalContent: null,
  setIsOpenModal: (payload) => set({ isOpenModal: payload }),

  // 【HPヘッダー関連】
  isHeaderShown: true,
  setIsHeaderShown: (payload) => set({ isHeaderShown: payload }),
  isHeaderTop: true,
  setIsHeaderTop: (payload) => set({ isHeaderTop: payload }),
  lightTextBorderLine: false,
  setLightTextBorderLine: (payload) => set({ lightTextBorderLine: payload }),

  // Feature1ライプライターアニメーション起動
  startAnimationFeature1: false,
  setStartAnimationFeature1: (payload) => set({ startAnimationFeature1: payload }),
  startAnimationFeature2: false,
  setStartAnimationFeature2: (payload) => set({ startAnimationFeature2: payload }),
  startAnimationFeature3: false,
  setStartAnimationFeature3: (payload) => set({ startAnimationFeature3: payload }),
  startAnimationFeature4: false,
  setStartAnimationFeature4: (payload) => set({ startAnimationFeature4: payload }),
  startAnimationFeature5: false,
  setStartAnimationFeature5: (payload) => set({ startAnimationFeature5: payload }),

  // 【チェックボタン チェック有無】
  isChecked: true,
  setIsChecked: (payload) => set({ isChecked: payload }),
}));

export default useStore;
