import useDashboardStore from "@/store/useDashboardStore";
import { Product, Property_row_data } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  companyId: string | null | undefined;
  userId: string | null;
  periodType: string | null; // 年度、半期、四半期、月度
  period: number | null; // 年度: 2024, 半期: 20241(上期), 四半期: 20243(3Q), 月度: 202401(1月度)
  isReady?: boolean;
};

export const useQueryDealCards = ({ companyId, userId, periodType, period, isReady = true }: Props) => {
  const supabase = useSupabaseClient();

  const getDealCards = async () => {
    if (!companyId) return;

    // periodType: monthly(月度), quarter(四半期), half(半期), fiscalYear(年度)

    // paramsを期間タイプごとに生成
    let params;
    if (periodType === "monthly") {
      params = {
        "properties.created_by_company_id": companyId,
        "properties.created_by_user_id": userId,
        expected_order_year_month: period,
      };
    }
    if (periodType === "quarter") {
      params = {
        "properties.created_by_company_id": companyId,
        "properties.created_by_user_id": userId,
        expected_order_quarter: period,
      };
    }
    if (periodType === "half") {
      params = {
        "properties.created_by_company_id": companyId,
        "properties.created_by_user_id": userId,
        expected_order_year_month: period,
      };
    }
    if (periodType === "fiscalYear") {
      params = {
        "properties.created_by_company_id": companyId,
        "properties.created_by_user_id": userId,
        expected_order_fiscal_year: period,
      };
    }

    const { data, error } = await supabase
      .rpc("search_properties_and_companies_and_contacts", { params })
      .eq("property_created_by_company_id", companyId)
      .eq("created_by_user_id", userId)
      .order("order_certainty_start_of_month", { ascending: true }); // ボードで並び替えるため不要かも
    // const { data, error, count } = await supabase
    //   .rpc("search_properties_and_companies_and_contacts", { params }, { count: "exact" })
    //   .eq("property_created_by_company_id", companyId)
    //   .eq("created_by_user_id", userId)
    //   .order("order_certainty_start_of_month", { ascending: true }); // ボードで並び替えるため不要かも

    // .order("expected_order_date", { ascending: false }) //獲得予定時期
    // .order("property_created_at", { ascending: false }); //案件作成日時

    if (error) {
      console.error("useQueryDealCardsフェッチエラー", error);
      throw error;
    }

    // // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    // await new Promise((resolve) => setTimeout(resolve, 800));

    return data as Property_row_data[];
    // return data as Product[];
  };

  return useQuery({
    queryKey: ["deals", userId, periodType, period], // ユーザーID, 期間タイプ, 期間
    queryFn: getDealCards,
    staleTime: Infinity,
    onError: (error) => {
      console.error("error:", error);
    },
    enabled: !!companyId && !!userId && isReady,
  });
};
