import { create } from "zustand";
import { persist } from "zustand/middleware";

type State = {
  // =================== 共通 ===================
  // テーマ(Light & Dark)
  theme: string;
  setTheme: (payload: string) => void;
};

// ============================= 🌟useThemeStore ローカルストレージ保管🌟 =============================
const useThemeStore = create<State>()(
  persist(
    (set, get) => ({
      // 【テーマ切り替え】
      theme: "dark",
      setTheme: (payload) => set({ theme: payload }),
    }),
    {
      name: "theme-storage",
      // skipHydration: true,
    }
  )
);

export default useThemeStore;
