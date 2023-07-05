import useStore from "@/store";
import React from "react";
import styles from "./DashboardHomeComponent.module.css";

export const DashboardHomeComponent = () => {
  const theme = useStore((state) => state.theme);
  console.log("DashboardHomeComponentレンダリング theme", theme);
  return (
    <div
      className={`flex-center transition-base h-screen w-full  ${
        theme === "light" ? "bg-[--color-bg-base] text-black" : "bg-[--color-bg-base] text-white"
      }`}
    >
      HomeDashboard
    </div>
  );
};
