// ------------------------------ 🔸GridTable用🔸 ------------------------------
// queryKeyにセットする際にオブジェクトを文字列に変換する関数と変換が必要なカラムのSetオブジェクト
export const searchObjectColumnsSetCompany = new Set(["capital", "number_of_employees"]);

export const convertObjToText = (column: string, obj: Object | null) => {
  if (!obj) return `${column}:null`;

  if (obj === "ISNOTNULL" || obj === "ISNULL") {
    return `${column}:${obj}`;
  }

  let objText = ``;
  Object.entries(obj).forEach(([key, value], index) => {
    objText += `${key}:${value === null ? `null` : `${value}`}`;
  });
  return `${column}:${objText}`;
};
// ------------------------------ 🔸GridTable用🔸 ------------------------------ ここまで

// ------------------------------ 🔸サーチモード用🔸 ------------------------------
// 範囲検索用 上限、下限全て入力されていないかどうかチェック
export const isEmptyInputRange = (
  input:
    | {
        min: string;
        max: string;
      }
    | "is null"
    | "is not null"
) => {
  return input !== "is null" && input !== "is not null" && input.min === "" && input.max === "";
};

// ------------------------------ 🔸サーチモード用🔸 ------------------------------ ここまで
