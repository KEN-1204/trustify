import useDashboardStore from "@/store/useDashboardStore";
import { CustomerBusinessCalendars } from "@/types";
import { fillWorkingDaysForEachFiscalMonth } from "@/utils/Helpers/fillWorkingDaysForEachFiscalMonth";
import { UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type Props = {
  selectedFiscalYear: number | null;
  annualMonthlyClosingDays:
    | {
        fiscal_year_month: string;
        start_date: string;
        // end_date: string;
        next_month_start_date: string;
        closing_days: CustomerBusinessCalendars[];
      }[]
    | null
    | undefined;
  // annualMonthlyClosingDays:
  //   | {
  //       getTime: number;
  //       annual_closing_days_obj: {
  //         annual_closing_days_count: number;
  //         annual_closing_days: {
  //           fiscal_year_month: string; // 2024-4
  //           start_date: string; // 2024-4-1(年月度の開始日)営業日を追加する時に使用
  //           end_date: string; // 2024-5-1(翌月度の月初)営業日を追加する時に使用
  //           closing_days: CustomerBusinessCalendars[]; // 休業日の日付オブジェクトの配列
  //           closing_days_count: number; // 各月度ごとの休業日の数
  //         }[];
  //       };
  //     }
  //   | null
  //   | undefined;
  isReady: boolean;
};

type QueryResponse =
  | {
      fiscalYearMonth: string;
      allDays: CustomerBusinessCalendars[];
    }[]
  | null
  | unknown;

export const useQueryCalendarForFiscalBase = ({
  selectedFiscalYear,
  annualMonthlyClosingDays,
  isReady = true,
}: Props) => {
  // }: Props): UseQueryResult<QueryResponse> => {
  // const queryClient = useQueryClient();
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  // const { data, status, isLoading, isError, error } = useQuery({
  const queryResult = useQuery({
    queryKey: ["calendar_for_fiscal_base", userProfileState?.customer_fiscal_end_month, selectedFiscalYear],
    queryFn: () => {
      if (!selectedFiscalYear) return null;
      if (!annualMonthlyClosingDays) return null;
      if (!userProfileState?.company_id) return null;
      if (!userProfileState?.customer_fiscal_end_month) return null;
      console.log("🔥useQueryCalendarForFiscalBase queryFn実行");
      const newCalendarForFiscalBase = fillWorkingDaysForEachFiscalMonth(
        annualMonthlyClosingDays,
        userProfileState.company_id
      );
      return newCalendarForFiscalBase;
    },
    staleTime: Infinity,
    // ユーザーが選択している期間が単月の場合はフェッチを拒否
    enabled: !!selectedFiscalYear && !!annualMonthlyClosingDays && !!userProfileState?.company_id && isReady,
  });

  // const { data, status } = queryResult;

  // useEffect(() => {
  //   // useQueryのqueryFnの取得が成功して、かつ、dataがnullでないなら各単月の営業稼働日数をキャッシュに保存
  //   if (status === "success" && !!data && data.length > 0) {
  //     Object.entries(data).forEach(([fiscalYearMonth, allDays]) => {
  //       const _queryKey = ["monthly_calendar_for_fiscal_base", fiscalYearMonth];
  //       // 既にキャッシュにその月度のキャッシュが存在しているか確認、存在していなければキャッシュに営業日数を歩人
  //       if (!queryClient.getQueryData(_queryKey)) {
  //         queryClient.setQueryData(_queryKey, allDays);
  //       }
  //     });
  //   }
  // }, [data, status, queryClient]);

  // return { data, isLoading, isError, error };
  return queryResult;
};
