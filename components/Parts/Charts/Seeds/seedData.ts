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
  { name: "マイクロスコープ事業部", value: 170000000 },
  { name: "メトロロジ事業部", value: 104200000 },
  { name: "事業推進部", value: 50000000 },
  { name: "販売促進グループ", value: 30000000 },
  { name: "開発本部", value: 25000000 },
];

export const colorsArrayHEX = [
  "#f43f5e",
  "#10b981",
  "#3d82f6",
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
  "bg-rose-500", // #f43f5e
  "bg-emerald-500", // #10b981
  "bg-blue-500", // #3d82f6
  "bg-indigo-500", // #6366f1
  "bg-fuchsia-500", // #d946ef
  "bg-amber-500", // #f59e0b
  "bg-pink-500", // #ec4899
  "bg-sky-500", // #0ea5e9
  "bg-violet-500", // #8b5cf6
  "bg-purple-500", // #a855f7
  "bg-lime-500", // #84cc16
  "bg-orange-500", // #f97316
  "bg-green-500", // #22c55e
  "bg-red-500", // #ef4444
];
