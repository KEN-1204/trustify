// ------------------------------ 🔸GridTable用🔸 ------------------------------
// queryKeyにセットする際にオブジェクトを文字列に変換する関数と変換が必要なカラムのSetオブジェクト
// (範囲検索でparamsに{min: ~, max: ~}のオブジェクトがセットされるため)
// 範囲検索オブジェクトカラム
// 🔹会社 GridTableAll
export const searchObjectColumnsSetCompany = new Set(["capital", "number_of_employees"]);
// 🔹担当者 ContactGridTableAll
export const searchObjectColumnsSetContact = new Set(["capital", "number_of_employees", "approval_amount"]);
// 🔹活動 ActivityGridTableAll
export const searchObjectColumnsSetActivity = new Set([
  "capital",
  "number_of_employees",
  "approval_amount",
  // 活動
  "scheduled_follow_up_date",
  "activity_date",
]);
// 🔹面談 MeetingGridTableAll
export const searchObjectColumnsSetMeeting = new Set([
  "capital",
  "number_of_employees",
  "approval_amount",
  // 面談
  "planned_date", // 面談日(予定)
  "planned_start_time", // 面談開始(予定)
  "result_date", // 面談日(結果)
  "result_start_time", // 面談開始(結果)
  "result_end_time", // 面談終了(結果)
  "result_duration", // 面談時間(結果)
  "result_number_of_meeting_participants", // 同席人数(結果)
]);

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
