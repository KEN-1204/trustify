import { ActiveMenuTab } from "@/types";
import { Session } from "@supabase/supabase-js";
import { ReactNode } from "react";
import { create } from "zustand";

type State = {
  // =================== メニュー ===================
  // 【アクティブメニュータブ】
  activeMenuTab: ActiveMenuTab;
  setActiveMenuTab: (payload: ActiveMenuTab) => void;
};

const useDashboardStore = create<State>((set) => ({
  // =================== マウス ===================
  // クリックしたアイテムのポジションを取得
  activeMenuTab: "HOME",
  setActiveMenuTab: (payload) => set({ activeMenuTab: payload }),
}));

export default useDashboardStore;
