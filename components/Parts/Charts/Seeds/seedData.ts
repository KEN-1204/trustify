import { subDays } from "date-fns";

// カレンダー用テストデータ
export const getMonthData = () => {
  const monthData = [];

  for (let num = 30; num >= 0; num--) {
    monthData.push({
      date: subDays(new Date(), num).toISOString().substring(0, 10),
      value: 1 + Math.random(),
    });
  }
};

export const dataPie = [
  { name: "マイクロスコープ事業部", value: 100000000 },
  { name: "メトロロジ事業部", value: 154200000 },
  { name: "事業推進部", value: 60000000 },
  { name: "販売促進グループ", value: 30000000 },
  { name: "開発本部", value: 25000000 },
];

/**
 * background-color: #d946ef;
  background-color: rgb(217 70 239);
  background-color: rgb(6 182 212);
  background-color: #06b6d4;
  background-color: #06b6d4;
  background-color: rgb(59 130 246);
  background-color: #3b82f6;
 */

// エリアチャート用
export const colorsHEXTrend = [
  "var(--main-color-f)", // stripe
  "#14b8a6", // teal
  "#625afa", // stripe
  //   "rgba(98, 90, 250)", // stripe
  "#d946ef",
  "#f43f5e",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#a855f7",
  "#0ea5e9",
  "#ec4899",
  "#8b5cf6",
  "#f97316",
  "#22c55e",
  "#ef4444",
  "#84cc16",
];

// パイチャート用
export const colorsArrayHEX = [
  "#f43f5e",
  "#10b981",
  "#3b82f6",
  "#6366f1",
  "#d946ef",
  "#f59e0b",
  "#ec4899",
  "#0ea5e9",
  "#8b5cf6",
  "#a855f7",
  "#84cc16",
  "#f97316",
  "#ef4444",
  "#22c55e",
];

export const colorsArray = [
  "bg-blue-500", // #3b82f6
  "bg-fuchsia-500", // #d946ef
  "bg-purple-500", // #a855f7
  "bg-indigo-500", // #6366f1
  "bg-sky-500", // #0ea5e9
  "bg-cyan-500", // #0ea5e9
  "bg-rose-500", // #f43f5e
  "bg-emerald-500", // #10b981
  "bg-amber-500", // #f59e0b
  "bg-pink-500", // #ec4899
  "bg-violet-500", // #8b5cf6
  "bg-lime-500", // #84cc16
  "bg-orange-500", // #f97316
  "bg-green-500", // #22c55e
  "bg-red-500", // #ef4444
];

// const COLORS_SHEER = ["#f43f5e90", "#10b98190", "#3d82f690", "#6366f190", "#d946ef90"];
export const COLORS_SHEER = [
  "var(--color-chart-fill-blue-sheer)",
  "var(--color-chart-fill-fuchsia-sheer)",
  "var(--color-chart-fill-purple-sheer)",
  "var(--color-chart-fill-indigo-sheer)",
  "var(--color-chart-fill-sky-sheer)",
  "var(--color-chart-fill-cyan-sheer)",
  "var(--color-chart-fill-rose-sheer)",
  "var(--color-chart-fill-emerald-sheer)",
  "var(--color-chart-fill-amber-sheer)",
  "var(--color-chart-fill-pink-sheer)",
  "var(--color-chart-fill-violet-sheer)",
  "var(--color-chart-fill-lime-sheer)",
  "var(--color-chart-fill-orange-sheer)",
  "var(--color-chart-fill-green-sheer)",
  "var(--color-chart-fill-red-sheer)",
];

// const COLORS = ["#f43f5e", "#10b981", "#3d82f6", "#6366f1", "#d946ef"];
export const COLORS = [
  "var(--color-chart-fill-blue)",
  "var(--color-chart-fill-fuchsia)",
  "var(--color-chart-fill-purple)",
  "var(--color-chart-fill-indigo)",
  "var(--color-chart-fill-sky)",
  "var(--color-chart-fill-cyan)",
  "var(--color-chart-fill-rose)",
  "var(--color-chart-fill-emerald)",
  "var(--color-chart-fill-amber)",
  "var(--color-chart-fill-pink)",
  "var(--color-chart-fill-violet)",
  "var(--color-chart-fill-lime)",
  "var(--color-chart-fill-orange)",
  "var(--color-chart-fill-green)",
  "var(--color-chart-fill-red)",
];
