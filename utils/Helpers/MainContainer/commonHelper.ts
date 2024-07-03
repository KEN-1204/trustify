// ------------------------------ 🔸GridTable用🔸 ------------------------------
// queryKeyにセットする際にオブジェクトを文字列に変換する関数と変換が必要なカラムのSetオブジェクト
// (範囲検索でparamsに{min: ~, max: ~}のオブジェクトがセットされるため)

import { convertToMillions } from "../convertToMillions";
import { convertToYen } from "../convertToYen";
import { isPlainObject } from "../isObjectPlain";
import { isValidNumber } from "../isValidNumber";
import { normalizeDiscountRate } from "../normalizeDiscountRate";
import { toHalfWidthAndRemoveSpace } from "../toHalfWidthAndRemoveSpace";

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
  "planned_duration", // 面談時間(予定)
  "result_date", // 面談日(結果)
  "result_start_time", // 面談開始(結果)
  "result_end_time", // 面談終了(結果)
  "result_duration", // 面談時間(結果)
  "result_number_of_meeting_participants", // 同席人数(結果)
]);
// 🔹案件 PropertyGridTableAll
export const searchObjectColumnsSetProperty = new Set([
  "capital",
  "number_of_employees",
  "approval_amount",
  // 案件
  "product_sales", // 予定台数
  "expected_sales_price", // 予定売上合計
  "unit_sales", // 売上台数
  "sales_price", // 売上合計
  "discounted_price", // 値引価格
  "discount_rate", // 値引率
  "property_date", // 案件発生日
  "expansion_date", // 展開日
  "sales_date", // 売上日
  "expected_order_date", // 獲得予定日
  "subscription_start_date", // サブスク開始日
  "subscription_canceled_at", // サブスク終了日
  "lease_expiration_date", // リース完了予定日
  "competitor_appearance_date", // 競合発生日
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

export const convertObjToTextNest = (column: string, obj: Object | null) => {
  if (!obj) return `${column}:null`;

  if (obj === "ISNOTNULL" || obj === "ISNULL") {
    return `${column}:${obj}`;
  }

  let objText = ``;
  Object.entries(obj).forEach(([key, value], index) => {
    if (key === "time_value") {
      if (isPlainObject(value)) {
        const { min, max } = value as { min: string | null; max: string | null };
        objText += `${index === 1 ? `-` : ``}${key}:${min === null ? `null` : `${min}`}-${
          max === null ? `null` : `${max}`
        }`;
        return;
      }
    }
    objText += `${index === 1 ? `-` : ``}${key}:${value === null ? `null` : `${value}`}`;
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
    | {
        min: Date | null;
        max: Date | null;
      }
    | {
        min: number | null;
        max: number | null;
      }
    | "is null"
    | "is not null",
  type: "" | "date" | "number" = ""
) => {
  if (type === "") return input !== "is null" && input !== "is not null" && input.min === "" && input.max === "";
  if (type === "date" || type === "number")
    return input !== "is null" && input !== "is not null" && input.min === null && input.max === null;
};

export const isCopyableInputRange = (
  input:
    | {
        min: string;
        max: string;
      }
    | {
        min: Date | null;
        max: Date | null;
      }
    | {
        min: number | null;
        max: number | null;
      }
    | "is null"
    | "is not null",
  type: "" | "date" | "number" = ""
) => {
  if (type === "")
    return (
      input !== "is null" &&
      input !== "is not null" &&
      ((input.min !== "" && input.max === "") || (input.min === "" && input.max !== ""))
    );
  if (type === "date" || type === "number")
    return (
      input !== "is null" &&
      input !== "is not null" &&
      ((input.min !== null && input.max === null) || (input.min === null && input.max !== null))
    );
};

export const copyInputRange = (
  dispatchRange:
    | React.Dispatch<
        React.SetStateAction<
          | {
              min: string;
              max: string;
            }
          | "is null"
          | "is not null"
        >
      >
    | React.Dispatch<
        React.SetStateAction<
          | {
              min: Date | null;
              max: Date | null;
            }
          | "is null"
          | "is not null"
        >
      >
    | React.Dispatch<
        React.SetStateAction<
          | {
              min: number | null;
              max: number | null;
            }
          | "is null"
          | "is not null"
        >
      >,
  type: "" | "date" | "number" = ""
) => {
  dispatchRange((prev: any) => {
    if (prev === "is null" || prev === "is not null") return prev;
    const { min, max } = prev;

    if (type === "") {
      if (min === "") {
        return { min: max as string, max: max as string };
      } else {
        return { min: min as string, max: min as string };
      }
    } else if (type === "date") {
      if (min === null) {
        return { min: max as Date, max: max as Date };
      } else {
        return { min: min as Date, max: min as Date };
      }
    } else {
      if (min === null) {
        return { min: max as number, max: max as number };
      } else {
        return { min: min as number, max: min as number };
      }
    }
  });
};

// ----------------------------------- 🔸サブミット前処理🔸 -----------------------------------

// 🔸TEXT型以外もIS NULL, IS NOT NULLの条件を追加
export const adjustFieldValueInteger = (value: string | number | null): number | "ISNULL" | "ISNOTNULL" | null => {
  if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
  if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
  if (typeof value === "string") {
    if (isValidNumber(value) && !isNaN(parseInt(value!, 10))) {
      return parseInt(value!, 10);
    } else {
      return null;
    }
  }
  // number型
  else {
    if (value === null) return null; // 全てのデータ
    return value;
  }
};

// 🔸Date型
export const adjustFieldValueDate = (value: Date | string | null): string | null => {
  if (value instanceof Date) return value.toISOString();
  // "is null"か"is not null"の文字列は変換
  if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
  if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
  return null;
  // if (typeof inputScheduledFollowUpDate === "string") return adjustFieldValue(inputScheduledFollowUpDate);
};

// 🔸Price関連 NUMERIC "6000000" "4.08" に変換
export const adjustFieldValuePrice = (value: string | null): string | "ISNULL" | "ISNOTNULL" | null => {
  if (value === "is null") return "ISNULL"; // ISNULLパラメータを送信
  if (value === "is not null") return "ISNOTNULL"; // ISNOTNULLパラメータを送信
  if (typeof value === "string") {
    // 値引率などの小数点も許可するためにparseFloatでチェック
    if (isValidNumber(value)) {
      return value;
    } else {
      return null;
    }
  }
  return null;
};

// 🔸範囲検索用の変換 数値型(Numeric Type) 資本金、従業員数、価格など 下限値「~以上」, 上限値 「~以下」
export const adjustFieldRangeNumeric = (
  value: { min: string; max: string } | "is null" | "is not null",
  formatType: "" | "integer" | "millions" = ""
): { min: number | null; max: number | null } | "ISNULL" | "ISNOTNULL" => {
  if (value === "is null") return "ISNULL";
  if (value === "is not null") return "ISNOTNULL";
  let { min, max } = value;

  // 資本金、決裁金額(万円単位)前処理
  if (formatType === "millions") {
    if (!!min && !/^\d+(\.\d+)?$|^\d{1,3}(,\d{3})*$/.test(min)) {
      const convertedPrice = convertToMillions(min.trim());
      if (convertedPrice !== null && !isNaN(convertedPrice)) {
        min = convertedPrice.toLocaleString();
      } else {
        min = "";
      }
    }
    if (!!max && !/^\d+(\.\d+)?$|^\d{1,3}(,\d{3})*$/.test(max)) {
      const convertedPrice = convertToMillions(max.trim());
      if (convertedPrice !== null && !isNaN(convertedPrice)) {
        max = convertedPrice.toLocaleString();
      } else {
        max = "";
      }
    }
  }

  const halfMin =
    formatType === "millions"
      ? toHalfWidthAndRemoveSpace(min).trim().replace(/,/g, "")
      : toHalfWidthAndRemoveSpace(min).trim();
  const halfMax =
    formatType === "millions"
      ? toHalfWidthAndRemoveSpace(max).trim().replace(/,/g, "")
      : toHalfWidthAndRemoveSpace(max).trim();

  const minValid = isValidNumber(halfMin);
  const maxValid = isValidNumber(halfMax);

  const minNum = formatType === "integer" ? parseInt(halfMin, 10) : Number(halfMin!);
  const maxNum = formatType === "integer" ? parseInt(halfMax, 10) : Number(halfMax!);

  console.log("value", value, min, halfMin, minNum, minValid, max, halfMax, maxNum, maxValid);

  if (minValid && maxValid) {
    if (isNaN(minNum) || isNaN(maxNum)) throw new Error(`数値が適切ではありません。適切な数値を入力してください。`);
    if (minNum! <= maxNum!) {
      return { min: minNum, max: maxNum };
    } else {
      const errorMsg = "数値の下限値が上限値を上回っています。上限値を下限値と同じかそれ以上に設定してください。";
      throw new Error(errorMsg);
    }
  } else if (minValid && !maxValid) {
    if (isNaN(minNum)) throw new Error(`数値が適切ではありません。適切な数値を入力してください。`);
    return { min: minNum, max: null };
  } else if (!minValid && maxValid) {
    if (isNaN(maxNum)) throw new Error(`数値が適切ではありません。適切な数値を入力してください。`);
    return { min: null, max: maxNum };
  }

  return { min: null, max: null };
};

// 🔸範囲検索用の変換 数値型(INTEGER Type) 時間、数量
export const adjustFieldRangeInteger = (
  value: { min: number | null; max: number | null } | "is null" | "is not null"
): { min: number | null; max: number | null } | "ISNULL" | "ISNOTNULL" => {
  if (value === "is null") return "ISNULL";
  if (value === "is not null") return "ISNOTNULL";
  const { min, max } = value;

  const minValid = min !== null && Number.isInteger(min);
  const maxValid = max !== null && Number.isInteger(max);

  if (minValid && maxValid) {
    if (min! <= max!) {
      return { min: min, max: max };
    } else {
      const errorMsg = "数値の下限値が上限値を上回っています。上限値を下限値と同じかそれ以上に設定してください。";
      throw new Error(errorMsg);
    }
  } else if (minValid && !maxValid) {
    return { min: min, max: null };
  } else if (!minValid && maxValid) {
    return { min: null, max: max };
  }

  return { min: null, max: null };
};

// 🔸範囲検索用の変換 TIMESTAMPTZ型(Dateオブジェクト ISO文字列) 活動日、面談日
export const adjustFieldRangeTIMESTAMPTZ = (
  value: { min: Date | null; max: Date | null } | "is null" | "is not null"
): { min: string | null; max: string | null } | "ISNULL" | "ISNOTNULL" => {
  if (value === "is null") return "ISNULL";
  if (value === "is not null") return "ISNOTNULL";
  const { min, max } = value;

  if (min instanceof Date && max instanceof Date) {
    if (min.getTime() <= max.getTime()) {
      return {
        min: min.toISOString(),
        max: max.toISOString(),
      };
    } else {
      const errorMsg = "日付の下限値が上限値を上回っています。上限値を下限値と同じかそれ以上に設定してください。";
      throw new Error(errorMsg);
    }
  } else if (min instanceof Date && max === null) {
    return {
      min: min.toISOString(),
      max: null,
    };
  } else if (min === null && max instanceof Date) {
    return {
      min: null,
      max: max.toISOString(),
    };
  }

  return { min: null, max: null };
};

// 🔸範囲検索用の変換 数値型(Numeric Type) 資本金、従業員数、価格など 下限値「~以上」, 上限値 「~以下」
export const adjustFieldRangePrice = (
  value: { min: string; max: string } | "is null" | "is not null",
  formatType: "" | "integer" | "rate" = ""
): { min: string | null; max: string | null } | "ISNULL" | "ISNOTNULL" => {
  if (value === "is null") return "ISNULL";
  if (value === "is not null") return "ISNOTNULL";
  let { min, max } = value;

  // /^\d+(\.\d+)?$|^\d{1,3}(,\d{3})*$/
  /**
       ^\d+(\.\d+)?$ : これは「10.2」のようなパターンにマッチします。ここで \d+ は1回以上の数字を表し、(\.\d+)? はドットとそれに続く1回以上の数字が0回または1回現れることを許可します。
        | : 「または」を意味します。
        ^\d{1,3}(,\d{3})*$ : これは「1,000,000」のようなカンマで区切られた数字のパターンにマッチします。ここで \d{1,3} は1から3桁の数字を表し、(,\d{3})* はカンマとそれに続くちょうど3桁の数字が0回以上繰り返されることを許可します。
       */

  // 値引率ルート 「.3」でそのままエンターで送信された際に「0.3%」にフォーマットして後続に送る
  // ・「10.2」の先頭が数字、ドットと後続に数字のパターン、こちらはドットは1つのみ
  if (formatType === "rate") {
    if (!!min && !/^\d+(\.\d+)?$/.test(min)) {
      min = normalizeDiscountRate(min.trim(), true);
    }
    if (!!max && !/^\d+(\.\d+)?$/.test(max)) {
      max = normalizeDiscountRate(max.trim(), true);
    }
  }
  // 金額ルート 「100万円」でそのままエンターで送信された際に「1,000,000」にフォーマットして後続に送る
  // ・「10.2」の先頭が数字、ドットと後続に数字のパターン、こちらはドットは1つのみ
  // ・「1,000,000」の先頭が数字と「,」と後続に数字のパターン、こちらは「,」は複数使用可だが、「,」が先頭と末尾には使用できない
  if (formatType !== "rate") {
    if (!!min && !/^\d+(\.\d+)?$|^\d{1,3}(,\d{3})*$/.test(min)) {
      const convertedPrice = convertToYen(min.trim());
      if (convertedPrice !== null && !isNaN(convertedPrice)) {
        min = convertedPrice.toLocaleString();
      } else {
        min = "";
      }
    }
    if (!!max && !/^\d+(\.\d+)?$|^\d{1,3}(,\d{3})*$/.test(max)) {
      const convertedPrice = convertToYen(max.trim());
      if (convertedPrice !== null && !isNaN(convertedPrice)) {
        max = convertedPrice.toLocaleString();
      } else {
        max = "";
      }
    }
  }

  const halfMin = !!min
    ? formatType === "rate"
      ? toHalfWidthAndRemoveSpace(min)
          .trim()
          .replace(/[^\d.]/g, "")
      : toHalfWidthAndRemoveSpace(min).trim().replace(/,/g, "")
    : "";
  const halfMax = !!max
    ? formatType === "rate"
      ? toHalfWidthAndRemoveSpace(max)
          .trim()
          .replace(/[^\d.]/g, "")
      : toHalfWidthAndRemoveSpace(max).trim().replace(/,/g, "")
    : "";

  const minValid = isValidNumber(halfMin);
  const maxValid = isValidNumber(halfMax);

  const minNum = formatType === "integer" ? parseInt(halfMin, 10) : Number(halfMin!);
  const maxNum = formatType === "integer" ? parseInt(halfMax, 10) : Number(halfMax!);

  console.log("value", value, min, halfMin, minNum, minValid, max, halfMax, maxNum, maxValid);

  if (minValid && maxValid) {
    if (isNaN(minNum) || isNaN(maxNum)) throw new Error(`数値が適切ではありません。適切な数値を入力してください。`);
    if (minNum! <= maxNum!) {
      if (formatType === "integer") return { min: minNum.toFixed(0), max: maxNum.toFixed(0) };
      return { min: halfMin, max: halfMax };
    } else {
      const errorMsg = "数値の下限値が上限値を上回っています。上限値を下限値と同じかそれ以上に設定してください。";
      throw new Error(errorMsg);
    }
  } else if (minValid && !maxValid) {
    if (isNaN(minNum)) throw new Error(`数値が適切ではありません。適切な数値を入力してください。`);
    if (formatType === "integer") return { min: minNum.toFixed(0), max: null };
    return { min: halfMin, max: null };
  } else if (!minValid && maxValid) {
    if (isNaN(maxNum)) throw new Error(`数値が適切ではありません。適切な数値を入力してください。`);
    if (formatType === "integer") return { min: null, max: maxNum.toFixed(0) };
    return { min: null, max: halfMax };
  }

  return { min: null, max: null };
};

// 🔸製品分類用 is null, is not nullをIS NULL, IS NOT NULLに変換
export const adjustIsNNN = (value: "is null" | "is not null"): "ISNULL" | "ISNOTNULL" =>
  value === "is null" ? "ISNULL" : "ISNOTNULL";

// ----------------------------------- 🔸サブミット前処理🔸 -----------------------------------ここまで

// ------------------------------ 🔸サーチモード用🔸 ------------------------------ ここまで
