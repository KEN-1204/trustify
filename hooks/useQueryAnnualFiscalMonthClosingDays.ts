// 会計年度の年間の休業日を月ごとに配列で取得する

import useDashboardStore from "@/store/useDashboardStore";
import { CustomerBusinessCalendars } from "@/types";
import { calculateCurrentFiscalYear } from "@/utils/Helpers/calculateCurrentFiscalYear";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { calculateCurrentFiscalYearEndDate } from "@/utils/Helpers/calcurateCurrentFiscalYearEndDate";
import { formatDateToYYYYMMDD } from "@/utils/Helpers/formatDateLocalToYYYYMMDD";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useEffect } from "react";
import { toast } from "react-toastify";

type CustomInputStartEndDate = {
  startDate: Date;
  endDate: Date;
};

type Props = {
  customerId: string | null | undefined;
  selectedYear: number;
  fiscalYearEnd: string | null | undefined;
  isRequiredInputFiscalStartEndDate?: boolean;
  customInputArray?: CustomInputStartEndDate[] | null | undefined;
  // isReady: boolean;
};

type QueryFnResponse = {
  getTime: number;
  annual_closing_days_obj: {
    annual_closing_days_count: number;
    annual_closing_days: {
      fiscal_year_month: string; // 2024-4
      start_date: string; // 2024-4-1(年月度の開始日)営業日を追加する時に使用
      // end_date: string; // 2024-5-1(翌月度の月初)営業日を追加する時に使用
      next_month_start_date: string; // 2024-5-1(翌月度の月初)営業日を追加する時に使用
      closing_days: CustomerBusinessCalendars[]; // 休業日の日付オブジェクトの配列
      closing_days_count: number; // 各月度ごとの休業日の数
    }[];
  };
};

export const useQueryAnnualFiscalMonthClosingDays = ({
  customerId,
  selectedYear,
  fiscalYearEnd,
  isRequiredInputFiscalStartEndDate = false,
  customInputArray,
}: // isReady,
Props) => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  const userProfileState = useDashboardStore((state) => state.userProfileState);

  // if (!userProfileState?.customer_fiscal_end_month) return

  // fiscalYearMonth: 2024-4, startDate: その年月度の開始日 2024-4-1 endDate: 終了日 2024-5-1(翌月度の月初)
  // const getAnnualFiscalMonthClosingDays = async (): Promise<
  //   | { fiscal_year_month: string; start_date: string; end_date: string; closing_days: CustomerBusinessCalendars[] }[]
  //   | null
  // > => {
  const getAnnualFiscalMonthClosingDays = async (): Promise<QueryFnResponse | null> => {
    if (!fiscalYearEnd) return null;
    // const fiscalYearEndDate = new Date(fiscalYearEnd);
    // 決算日の翌日の期首のDateオブジェクトを生成(時間情報は全て0にリセット済み)
    // const selectedFiscalYearEndDate = new Date(selectedYear, fiscalYearEndDate.getMonth(), fiscalYearEndDate.getDate(), 23,59,59,999);
    // const fiscalYear = calculateCurrentFiscalYear({ fiscalYearEnd: fiscalYearEnd, selectedYear: selectedYear });

    // 🔹1. 現在2024年2/21 12/20決算 会計年度2023年 (期首の年が会計年度)
    // 決算月が現在よりも先にある場合は会計年度は現在の年よりも-1
    // パターン1. 選択年が2023年なら: 2023/12/21-2024/12-20を返す

    // 🔹2. 3/20決算 現在2024年6/21 会計年度2024年
    // 決算月が現在よりも前にある場合は会計年度は現在の年と同じ
    // パターン2. 選択年が2023年なら: 2023/03/21-2024/03-20を返す

    // 🌠どちらのパターンも選択年が会計年度となるので選択年の期首起算で１年間を返す

    const fiscalYearStartDate = calculateFiscalYearStart({ fiscalYearEnd: fiscalYearEnd, selectedYear: selectedYear });
    if (!fiscalYearStartDate) return null;

    // 期首の日付を起点としたwhileループ用のDateオブジェクトを作成
    let currentDateForLoop = fiscalYearStartDate;
    // 期首のちょうど1年後の次年度、来期の期首のDateオブジェクトを作成
    const nextFiscalYearStartDate = new Date(fiscalYearStartDate);
    nextFiscalYearStartDate.setFullYear(nextFiscalYearStartDate.getFullYear() + 1);

    console.log(
      "休業日useQuery関数実行!!🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥",
      "クエリキー",
      `"annual_fiscal_month_closing_days ${fiscalEndMonthKey}, ${selectedYear}`,
      "selectedYear",
      selectedYear,
      "fiscalYearStartDate",
      fiscalYearStartDate,
      "fiscalYearEnd",
      fiscalYearEnd,
      "userProfileState?.customer_fiscal_end_month",
      userProfileState?.customer_fiscal_end_month,
      "currentDateForLoop",
      currentDateForLoop,
      "nextFiscalYearStartDate",
      nextFiscalYearStartDate
    );

    // =================== 顧客の年度の期首を始めとした各月度の開始日と終了日をまとめた配列を作成
    let annualFiscalMonths = [];
    // 🔹一般的なケース：決算日が1日から27日か、月の末日のユーザーの場合
    if (!isRequiredInputFiscalStartEndDate) {
      while (currentDateForLoop.getTime() < nextFiscalYearStartDate.getTime()) {
        // 翌月度の初日
        const nextMonthFirstDate = new Date(
          currentDateForLoop.getFullYear(),
          currentDateForLoop.getMonth() + 1,
          currentDateForLoop.getDate()
        );
        // 会計月度 翌月初日の1日前の各月度の締日
        // const fiscalMonthEndDate = new Date(currentDateForLoop.getFullYear(), currentDateForLoop.getMonth() + 1, 0);
        const fiscalMonthEndDate = new Date(
          nextMonthFirstDate.getFullYear(),
          nextMonthFirstDate.getMonth(),
          nextMonthFirstDate.getDate() - 1,
          23,
          59,
          59,
          999
        );
        // その月度の開始日と終了日をオブジェクトにまとめてpush(SQLの条件分で取得する休業日をその月度の範囲絞るため)
        // UTC時間文字列だと日本は9時間オフセットされるため開始日が前日でセットされてしまうためこれは不採用
        // const newFiscalMonth = {
        //   fiscal_year_month: `${currentDateForLoop.getFullYear()}-${currentDateForLoop.getMonth() + 1}`, // ブラウザ表示用に変換(1月は0を1に変換して2024-1をセット)
        //   start_date: currentDateForLoop.toISOString().split("T")[0], // 日付部分（YYYY-MM-DD）のみ
        //   end_date: nextMonthFirstDate.toISOString().split("T")[0],
        // };
        // ローカルエリアの時間でYYYY-MM-DDにフォーマット
        const newFiscalMonth = {
          // fiscal_year_month: `${currentDateForLoop.getFullYear()}-${currentDateForLoop.getMonth() + 1}`, // ブラウザ表示用に変換(1月は0を1に変換して2024-1をセット)
          fiscal_year_month: `${fiscalMonthEndDate.getFullYear()}-${fiscalMonthEndDate.getMonth() + 1}`, // ブラウザ表示用に変換(1月は0を1に変換して2024-1をセット) 月度は締日の月に合わせる 3/21-4-20は4月度, 4/1-4/30は4月度
          start_date: formatDateToYYYYMMDD(currentDateForLoop), // 日付部分（YYYY-MM-DD）のみ
          next_month_start_date: formatDateToYYYYMMDD(nextMonthFirstDate), // <演算子で範囲比較するので翌月初日0秒をセット
          // end_date: formatDateToYYYYMMDD(nextMonthFirstDate), // <演算子で範囲比較するので翌月初日0秒をセット
        };
        annualFiscalMonths.push(newFiscalMonth);

        currentDateForLoop.setMonth(currentDateForLoop.getMonth() + 1); // 次の月に進める
      }
    }

    // 🔹珍しいケース：※決算日が28日から30日で、かつその日にちがその月の決算日でない場合は開始、終了日はユーザー入力を取得
    else {
      // 🔹珍しいケース：開始、終了日はユーザー入力を取得が必要 なければnullを返す
      if (!customInputArray) return null;

      annualFiscalMonths = customInputArray?.map(({ startDate, endDate }, index) => {
        currentDateForLoop.setMonth(currentDateForLoop.getMonth() + index);
        // ユーザーが選択した終了日は時間情報が全て0なので、date < endDateの条件で最終日が入らなくなるため翌日の0時0分0秒でフォーマットする
        const formattedEndDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, endDate.getDate());
        return {
          fiscal_year_month: `${currentDateForLoop.getFullYear()}-${currentDateForLoop.getMonth() + 1}`, // ブラウザ表示用に変換(1月は0を1に変換して2024-1をセット)
          // start_date: startDate.toISOString().split("T")[0], // 日付部分（YYYY-MM-DD）のみ
          // end_date: formattedEndDate.toISOString().split("T")[0],
          start_date: formatDateToYYYYMMDD(startDate), // 日付部分（YYYY-MM-DD）のみ
          next_month_start_date: formatDateToYYYYMMDD(formattedEndDate),
        };
      });
    }
    // =================== ここまで

    try {
      // 顧客の会社idと各月度の配列とパラメータにセット
      const payload = { _customer_id_arg: customerId, _annual_fiscal_months_arg: annualFiscalMonths };
      console.log("🔥get_annual_fiscal_month_closing_days関数実行 payload", payload);
      // 期首を始めとした会計月度ごとの休業日の日付データを配列でまとめた12ヶ月分の配列を取得
      const { data: annualMonthlyClosingDays, error } = await supabase.rpc(
        "get_annual_fiscal_month_closing_days",
        payload
      );

      if (error) {
        console.log("❌getAnnualFiscalMonthClosingDaysエラー発生", error.message);
        throw error;
      }

      console.log("✅get_annual_fiscal_month_closing_days関数実行成功 結果", annualMonthlyClosingDays);

      return {
        getTime: Date.now(),
        annual_closing_days_obj: annualMonthlyClosingDays as {
          annual_closing_days_count: number;
          annual_closing_days: {
            fiscal_year_month: string; // 2024-4
            start_date: string; // 2024-4-1(年月度の開始日)営業日を追加する時に使用
            // end_date: string; // 2024-5-1(翌月度の月初)営業日を追加する時に使用
            next_month_start_date: string; // 2024-5-1(翌月度の月初)営業日を追加する時に使用
            closing_days: CustomerBusinessCalendars[]; // 休業日の日付オブジェクトの配列
            closing_days_count: number; // 各月度ごとの休業日の数
          }[];
        },
      };
    } catch (error: any) {
      console.error("エラー：", error);
      toast.error("営業稼働日の取得に失敗しました...🙇‍♀️");
      return null;
    }
  };

  const fiscalEndMonthKey = userProfileState?.customer_fiscal_end_month
    ? format(new Date(userProfileState?.customer_fiscal_end_month), "yyyy-MM-dd")
    : null;

  const { data, status, isLoading, isError, error } = useQuery({
    queryKey: ["annual_fiscal_month_closing_days", fiscalEndMonthKey, selectedYear],
    // queryKey: ["annual_fiscal_month_closing_days", fiscalEndMonthKey, selectedYear, appliedAtOfSelectedYear],
    queryFn: getAnnualFiscalMonthClosingDays,
    staleTime: Infinity,
    // ユーザーが選択している期間が単月の場合はフェッチを拒否
    enabled: !!customerId && !!selectedYear && !!fiscalYearEnd,
  });

  useEffect(() => {
    // useQueryのqueryFnの取得が成功して、かつ、dataがnullでないなら各会計月度ごとに単月のキャッシュを作成
    // if (status === "success" && !!data && !!data?.length) {
    if (status === "success" && !!data && !!data?.annual_closing_days_obj.annual_closing_days.length) {
      data.annual_closing_days_obj.annual_closing_days.forEach((obj) => {
        const _queryKey = ["fiscal_month_closing_days", obj.fiscal_year_month];
        // 既にキャッシュにその月度のキャッシュが存在しているか確認、存在していなければキャッシュに保存
        // if (!queryClient.getQueryData(_queryKey)) {
        //   // 単月の休業日の配列を新たなキャッシュに格納
        //   queryClient.setQueryData(_queryKey, obj);
        // }
        // キャッシュに保存されているかどうかに関わらず、最新の内容に更新
        queryClient.setQueryData(_queryKey, obj);
      });
    }
  }, [data, status, queryClient]);

  return { data, isLoading, isError, error };
};

/*
*2 startDate.toISOString().split('T')[0] の意味合い
startDate.toISOString()は、JavaScriptのDateオブジェクトをISO 8601形式の文字列に変換します。この形式はYYYY-MM-DDTHH:MM:SS.sssZの形をしており、日付と時間の情報が含まれています。
.split('T')[0]は、このISO形式の文字列を'T'で分割し、日付部分（YYYY-MM-DD）のみを取得するためのものです。分割後の配列の0番目の要素が日付部分に相当します。
この処理は、DATE型のフィールドに日付データを適切に挿入するために必要です。TIMESTAMPTZやTIMESTAMP型ではなく、DATE型を想定しているため、時間情報は不要であり、日付のみを抽出して使用します。
*/
