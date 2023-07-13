import {
  animatedChartIcon,
  animatedMailIcon,
  animatedSearchIcon,
  animatedSettingIcon,
  animatedTrendingIcon,
  animatedSendIcon,
  animatedCycleIcon,
} from "../assets";

export const home_cards = [
  {
    name: "setting",
    icon: animatedSettingIcon,
    title: "プロフィールを設定する",
  },
  {
    name: "invitation",
    // icon: animatedsendIcon,
    icon: animatedMailIcon,
    title: "チームの管理者はメンバーを招待する",
  },
  {
    name: "search",
    icon: animatedSearchIcon,
    title: "業界・製品・規模・取引先などの条件を指定したサーチで「売れる営業先」を抽出する",
  },
  {
    name: "record",
    icon: animatedChartIcon,
    // icon: animatedTrendingIcon,
    title: "架電・面談・受注・フォローの一貫した営業活動を記録・活用して、売れる仕組みを構築していく",
    // title2: "",
  },
  {
    name: "dev",
    icon: animatedCycleIcon,
    title: "営業の活動履歴や顧客の声から潜在ニーズを抽出し、売れる商品開発を創出する",
  },
];
