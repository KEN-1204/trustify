import { ActiveMenuTab } from "@/types";
import { Session } from "@supabase/supabase-js";
import { ReactNode } from "react";
import { create } from "zustand";

type State = {
  // =================== サイドバー ===================
  // 【アクティブメニュータブ】
  activeMenuTab: ActiveMenuTab;
  setActiveMenuTab: (payload: ActiveMenuTab) => void;
  // 【サイドバーメニュー開閉状態】
  isOpenSideBarMenu: boolean;
  setIsOpenSideBarMenu: (payload: boolean) => void;
  // 【サイドバーピックボックス開閉状態】
  isOpenSideBarPickBox: boolean;
  setIsOpenSideBarPickBox: (payload: boolean) => void;
  // 【サイドバーの拡大・縮小】
  isOpenSidebar: boolean;
  setIsOpenSidebar: (payload: boolean) => void;
  // =================== データ編集モーダル ===================
  // 【データ編集モーダル開閉状態】
  isOpenEditModal: boolean;
  setIsOpenEditModal: (payload: boolean) => void;
  // 【データ編集モーダル テキストエリア内容】
  textareaInput: string;
  setTextareaInput: (payload: string) => void;
  // =================== テーブルカラム編集モーダル ===================
  // 【テーブルカラム編集モーダル開閉状態】
  isOpenEditColumns: boolean;
  setIsOpenEditColumns: (payload: boolean) => void;
};

const useDashboardStore = create<State>((set) => ({
  // =================== サイドバー ===================
  // 【アクティブメニュータブ】
  activeMenuTab: "HOME",
  setActiveMenuTab: (payload) => set({ activeMenuTab: payload }),
  // 【サイドバーメニュー開閉状態】
  isOpenSideBarMenu: true,
  setIsOpenSideBarMenu: (payload) => set({ isOpenSideBarMenu: payload }),
  // 【サイドバーピックボックス開閉状態】
  isOpenSideBarPickBox: true,
  setIsOpenSideBarPickBox: (payload) => set({ isOpenSideBarPickBox: payload }),
  // 【サイドバーの拡大・縮小】
  isOpenSidebar: true,
  setIsOpenSidebar: (payload) => set({ isOpenSidebar: payload }),
  // =================== データ編集モーダル ===================
  // 【データ編集モーダル開閉状態】
  isOpenEditModal: false,
  setIsOpenEditModal: (payload) => set({ isOpenEditModal: payload }),
  // 【データ編集モーダル テキストエリア内容】
  textareaInput: "",
  setTextareaInput: (payload) => set({ textareaInput: payload }),
  // =================== テーブルカラム編集モーダル ===================
  // 【テーブルカラム編集モーダル開閉状態】
  isOpenEditColumns: false,
  setIsOpenEditColumns: (payload) => set({ isOpenEditColumns: payload }),
}));

export default useDashboardStore;
