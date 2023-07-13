import { DashboardCompanyComponent } from "@/components/DashboardCompanyComponent/DashboardCompanyComponent";
import { DashboardLayout } from "@/components/DashboardLayout";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import React, { useEffect } from "react";

const DashboardCompany = () => {
  console.log("🔥 Companyページ レンダリング");
  const language = useStore((state) => state.language);
  //   const setTheme = useThemeStore((state) => state.setTheme);
  // const setTheme = useStore((state) => state.setTheme);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const setActiveMenuTab = useDashboardStore((state) => state.setActiveMenuTab);

  // 言語別タイトル
  let langTitle;
  switch (language) {
    case "Ja":
      langTitle = "会社 - TRUSTiFY";
      break;
    case "En":
      langTitle = "Company - TRUSTiFY";
      break;
    default:
      langTitle = "Company - TRUSTiFY";
      break;
  }

  // /companyページにいて、アクティブメニュータブがCompanyでない場合にはCompanyに変更する
  useEffect(() => {
    // setTheme("light");
    if (window.history.state.url === "/company" && activeMenuTab !== "Company") {
      setActiveMenuTab("Company");
      console.log("companyページ アクティブタブをCompanyに変更");
    }
  }, [activeMenuTab]);

  return (
    <DashboardLayout title={langTitle}>
      <DashboardCompanyComponent />
    </DashboardLayout>
  );
};

export default DashboardCompany;
