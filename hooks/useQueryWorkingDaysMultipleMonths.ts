import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "react-toastify";

// startFiscalMonth: 月度 2024-04など
export const useQueryWorkingDaysMultipleMonths = (
  customerId: string | null | undefined,
  period: string,
  startFiscalMonth: string,
  fiscalYearEnd: string
  //   endFiscalMonth: string,
) => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  const getWorkingDaysMultipleMonths = async (): Promise<
    | {
        fiscalMonth: string;
        workingDays: number | null;
      }[]
    | null
  > => {
    // startFiscalMonth: 2024-04 を2024と04に分割
    let startYear = Number(startFiscalMonth.split("-")[0]);
    let startMonth = Number(startFiscalMonth.split("-")[1]) - 1; // new Dateでは1月は0からのため-1
    // let endYear = Number(endFiscalMonth.split("-")[0]);
    // let endMonth = Number(endFiscalMonth.split("-")[1]) - 1; // new Dateでは1月は0からのため+1

    const getLoopCount = (period: string) => {
      switch (period) {
        case "Annual":
          return 12;
        case "Half":
          return 6;
        case "Quarter":
          return 3;
        default:
          return null;
          break;
      }
    };

    const loopCount = getLoopCount(period);

    if (!loopCount) return null;

    // 決算日の日付を取得し、その翌日を期間の開始日とする
    const fiscalDate = new Date(fiscalYearEnd);

    let fiscalYearMonthsArray = [];
    let yearMonthObj = { year: startYear, month: startMonth, fiscalMonth: startFiscalMonth };
    for (let _month = 0; _month < loopCount; _month++) {
      let newYear = yearMonthObj.year;
      let newMonth = yearMonthObj.month + _month;

      // 【月跨ぎの処理】12月を超えていればyearを+1, newMonthを0(1月にする)
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }

      // 【会計月度の開始日を計算】決算日の日付を取得し、その翌日を月初として指定した年月度の期間の開始日とする
      const startDate = new Date(newYear, newMonth, fiscalDate.getDate() + 1);

      // 【終了日の計算】開始日の翌月の0日を使って月末日を求める
      const endDate = new Date(newYear, newMonth + 1, 0); // 翌月の0日は前月(求めたい月)の最後の日になる
      // 引数がアンダーフローする場合は、上位の引数を「桁借り」します。例えば、new Date(2020, 5, 0) は、 2020 年 5 月 31 日を返します

      // 期間内の全日数を計算
      const _totalDays = endDate.getDate() - startDate.getDate() + 1; // 日付の差を取り、期間の両端を含むために+1

      // fiscalMonthはブラウザで表示する会計月度の2024-04の形に戻して格納する
      const newFiscalMonth = `${newYear}-${String(newMonth + 1).padStart(2, "0")}`; // 月が一桁の場合は0でパディング*4

      fiscalYearMonthsArray.push({
        start_date: startDate.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
        fiscal_month: newFiscalMonth,
        total_days: _totalDays,
      });
    }

    try {
      // 顧客の各月度ごとに休業日の日数を取得
      const payload = { _fiscal_months_array: fiscalYearMonthsArray, _customer_id: customerId };
      const { data: holidaysArray, error } = await supabase.rpc("get_holidays_multiple_months", payload);

      if (error) {
        console.log("❌getWorkingDaysMultipleMonthsエラー発生", error.message);
        throw error;
      }

      // 各月度ごとに営業稼働日数を計算
      const workingDaysArray = fiscalYearMonthsArray.map((obj, index) => {
        if (typeof holidaysArray[index] !== "number") throw new Error("休業日がnumber型ではありません。");
        const workingDays = obj.total_days - holidaysArray[index];
        return { fiscalMonth: obj.fiscal_month, workingDays: workingDays };
      });

      return workingDaysArray;
    } catch (error: any) {
      console.error("エラー：", error);
      toast.error("営業稼働日の取得に失敗しました...🙇‍♀️");
      return null;
    }
  };

  const { data, status, isLoading, isError, error } = useQuery({
    queryKey: ["working_days", period, startFiscalMonth],
    queryFn: getWorkingDaysMultipleMonths,
    staleTime: Infinity,
    // ユーザーが選択している期間が単月の場合はフェッチを拒否
    enabled: !!customerId && period !== "monthly",
  });

  useEffect(() => {
    // useQueryのqueryFnの取得が成功して、かつ、dataがnullでないなら各単月の営業稼働日数をキャッシュに保存
    if (status === "success" && !!data) {
      Object.entries(data).forEach(([fiscalMonth, workingDays]) => {
        const _queryKey = ["working_days", fiscalMonth];
        // 既にキャッシュにその月度のキャッシュが存在しているか確認、存在していなければキャッシュに営業日数を歩人
        if (!queryClient.getQueryData(_queryKey)) {
          // 新たなキャッシュ queryKey: ['working_days', 4],
          queryClient.setQueryData(_queryKey, workingDays); // *3
        }
      });
    }
  }, [data, status, queryClient]);

  return { data, isLoading, isError, error };
};

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

*4 padStart
padStart() メソッドは、結果の文字列が指定した長さになるように、現在の文字列を他の文字列で（必要に応じて繰り返して）延長します。延長は、現在の文字列の先頭から適用されます。
const str1 = '5';

console.log(str1.padStart(2, '0'));
// Expected output: "05"

const fullNumber = '2034399002125581';
const last4Digits = fullNumber.slice(-4);
const maskedNumber = last4Digits.padStart(fullNumber.length, '*');

console.log(maskedNumber);
// Expected output: "************5581"

 */
