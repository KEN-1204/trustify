import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

// ユーザーが単月度の営業稼働日数を取得する際に実行するuseQuery fiscalMonth: 月度 2024-04など
export const useQueryWorkingDaysMonthly = (
  customerId: string | null | undefined,
  period: string,
  fiscalMonth: string,
  fiscalYearEnd: string
) => {
  const supabase = useSupabaseClient();

  const getWorkingDaysMonthly = async () => {
    // fiscalMonth: 2024-04 を2024と04に分割
    const startYear = Number(fiscalMonth.split("-")[0]);
    const startMonth = Number(fiscalMonth.split("-")[1]) - 1; // new Dateでは1月は0からのため-1

    // 決算日の日付を取得し、その翌日を月初として指定した年月度の期間の開始日とする
    const fiscalDate = new Date(fiscalYearEnd);
    const startDate = new Date(startYear, startMonth, fiscalDate.getDate() + 1);

    // 【終了日の計算】開始日の翌月の0日を使って月末日を求める
    const endDate = new Date(startYear, startMonth + 1, 0); // 翌月の0日は前月(求めたい月)の最後の日になる

    // 期間内の全日数を計算
    const totalDays = endDate.getDate() - startDate.getDate() + 1; // 日付の差を取り、期間の両端を含むために+1

    // 顧客の指定した単月度の休業日の日数を取得
    const { count: holidaysCount, error } = await supabase
      .from("customer_business_calendars")
      .select("*", { count: "exact" })
      .eq("customer_id", customerId)
      .gte("date", startDate.toISOString().split("T")[0]) // *2 時間情報を除く日付情報のみを渡す
      .lte("date", endDate.toISOString().split("T")[0])
      .eq("status", "休業日");

    if (error) {
      console.log("❌getWorkingDaysMonthlyエラー発生", error.message);
      throw error;
    }

    // 営業稼働日数を計算
    const workingDays = typeof holidaysCount === "number" ? totalDays - holidaysCount : null;

    return { fiscalMonth: fiscalMonth, workingDays: workingDays } as {
      fiscalMonth: string;
      workingDays: number;
    } | null;
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["working_days", fiscalMonth],
    queryFn: getWorkingDaysMonthly,
    staleTime: Infinity,
    // ユーザーが選択している期間が単月でない場合はフェッチを拒否
    enabled: !!customerId && period === "monthly",
  });

  return { data, isLoading, isError, error };
};

// const startDate = new Date(startYear, startMonth, fiscalDate.getDate());
// startDate.setDate(startDate.getDate() + 1);

// // 開始日の翌月の同日を終了日とし、1日引くことで期間を閉じる
// const endDate = new Date(startDate);
// endDate.setMonth(endDate.getMonth() + 1);
// endDate.setDate(endDate.getDate() - 1);

// // 期間内の全日数を計算(ミリ秒単位を日単位に変換して +1 で期間の両橋を含める*1)
// const totalDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24) + 1;

// const sessionState = useStore((state) => state.sessionState);
//  APIルートのサーバーサイドでフェッチ、計算をする場合
// const payload = {
//   customer_id: customer_id,
// };

// const { data } = await axios.post(`/api/get-working-days`, payload, {
//   headers: {
//     Authorization: `Bearer ${sessionState.access_token}`,
//   },
// });

/**
*1 期間内の全日数の計算の解説
const totalDays = (endDate.getTime() - startDate.getTime() / (1000 * 60 * 60 * 24) + 1)

日付の差分計算: endDate - startDateは、終了日と開始日の差分をミリ秒単位で計算します。
日単位への変換: 差分のミリ秒を日単位に変換するために、(1000 * 60 * 60 * 24)で割ります。ここで、1000は1秒のミリ秒、60は1分の秒数、60は1時間の分数、24は1日の時間数です。
期間の両端を含める: 最後に+1をすることで、期間の開始日と終了日を両方含めた日数に調整します。例えば、3月21日から3月22日までの期間を計算すると、差分は1日ですが、この2日間は実際には2日間に相当するため、+1が必要になります。


*2 startDate.toISOString().split('T')[0] の意味合い
startDate.toISOString()は、JavaScriptのDateオブジェクトをISO 8601形式の文字列に変換します。この形式はYYYY-MM-DDTHH:MM:SS.sssZの形をしており、日付と時間の情報が含まれています。
.split('T')[0]は、このISO形式の文字列を'T'で分割し、日付部分（YYYY-MM-DD）のみを取得するためのものです。分割後の配列の0番目の要素が日付部分に相当します。
この処理は、DATE型のフィールドに日付データを適切に挿入するために必要です。TIMESTAMPTZやTIMESTAMP型ではなく、DATE型を想定しているため、時間情報は不要であり、日付のみを抽出して使用します。


*3 setQueryDataの使い方
・queryClient.setQueryData(queryKey, updater)
・setQueryData(queryKey, newData)
https://tanstack.com/query/v4/docs/reference/QueryClient#queryclientsetquerydata
 */
