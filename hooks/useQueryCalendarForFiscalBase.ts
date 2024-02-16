import { CustomerBusinessCalendars } from "@/types";
import { fillWorkingDaysForEachFiscalMonth } from "@/utils/Helpers/fillWorkingDaysForEachFiscalMonth";
import { UseQueryResult, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

type Props = {
  selectedFiscalYear: string | null;
  annualMonthlyClosingDays:
    | {
        fiscal_year_month: string;
        start_date: string;
        end_date: string;
        closing_days: CustomerBusinessCalendars[];
      }[]
    | null
    | undefined;
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
}: Props): UseQueryResult<QueryResponse> => {
  // const queryClient = useQueryClient();

  // const { data, status, isLoading, isError, error } = useQuery({
  const queryResult = useQuery({
    queryKey: ["calendar_for_fiscal_base", selectedFiscalYear],
    queryFn: () => {
      if (!selectedFiscalYear) return null;
      if (!annualMonthlyClosingDays) return null;
      console.log("🔥useQueryCalendarForFiscalBase queryFn実行");
      const newCalendarForFiscalBase = fillWorkingDaysForEachFiscalMonth(annualMonthlyClosingDays);
      return newCalendarForFiscalBase;
    },
    staleTime: Infinity,
    // ユーザーが選択している期間が単月の場合はフェッチを拒否
    enabled: !!selectedFiscalYear && !!annualMonthlyClosingDays,
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
