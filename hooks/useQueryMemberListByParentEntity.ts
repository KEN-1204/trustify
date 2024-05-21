import useDashboardStore from "@/store/useDashboardStore";
import { FiscalYearMonthKey, MemberAccounts, MemberAccountsDealBoard, PropertiesPeriodKey } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type Props = {
  entityIds: string[] | null;
  parentEntityLevelId: string | null;
  parentEntityLevel: string | null;
  parentEntityId: string | null;
  periodTypeForTarget: FiscalYearMonthKey | null;
  periodTypeForSales: PropertiesPeriodKey;
  period: number;
  fiscalYearId: string | null;
  isReady: boolean;
};

// 上位エンティティidに紐づくエンティティを全て抽出
export const useQueryMemberListByParentEntity = ({
  entityIds,
  parentEntityLevelId,
  parentEntityLevel,
  parentEntityId,
  periodTypeForTarget,
  periodTypeForSales,
  period,
  fiscalYearId,
  isReady = true,
}: Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const supabase = useSupabaseClient();

  const entityIdsStr = useMemo(() => {
    if (!entityIds) return null;
    return entityIds.join(", ");
  }, [entityIds]);

  const getMemberGroupsByParentEntity = async () => {
    // setLoadingGlobalState(true);
    if (!entityIds || !parentEntityLevel || !parentEntityId) return null;
    if (!userProfileState) return null;
    if (!periodTypeForTarget) return null;
    if (!fiscalYearId) return null;

    // let rows: (MemberAccounts & {
    //   company_id: string;
    //   company_name: string;
    //   current_sales_amount: number | null;
    //   current_sales_target: number | null;
    //   current_achievement_rate: number | null;
    // })[] = [];
    let responseObj: {
      members_sales_data: (MemberAccounts & {
        company_id: string;
        company_name: string;
        current_sales_amount: number; // COALESCEで0をセットしているため必ずnumber型で返却される
        current_sales_target: number | null;
        current_achievement_rate: number | null;
      })[];
      parent_entity_sales_data: {
        current_sales_amount: number; // COALESCEで0をセットしているため必ずnumber型で返却される
        current_sales_target: number | null;
        current_achievement_rate: number | null;
      };
    } = {} as {
      members_sales_data: (MemberAccounts & {
        company_id: string;
        company_name: string;
        current_sales_amount: number; // COALESCEで0をセットしているため必ずnumber型で返却される
        current_sales_target: number | null;
        current_achievement_rate: number | null;
      })[];
      parent_entity_sales_data: {
        current_sales_amount: number; // COALESCEで0をセットしているため必ずnumber型で返却される
        current_sales_target: number | null;
        current_achievement_rate: number | null;
      };
    };

    const payload = {
      _subscription_id: userProfileState.subscription_id,
      _company_id: userProfileState.company_id,
      _parent_entity_level_id: parentEntityLevelId,
      _parent_entity_level: parentEntityLevel,
      _parent_entity_id: parentEntityId,
      _entity_ids: entityIds,
      _period_type_for_target: periodTypeForTarget,
      _period_type_for_sales: periodTypeForSales,
      _period: period,
      _fiscal_year_id: fiscalYearId,
    };
    console.log(
      "🔥useQueryMemberListByParentEntityカスタムフック get_members_and_parent_with_sales_achievement_data関数実行 payload",
      payload
    );

    if (true) return null;

    // -- sales_dateはIS NOT NULLを指定しない 受注済みで出荷日がまだの案件も取得するため
    // get_members_and_parent_with_sales_achievement_data
    // get_members_filtered_by_entity_ids
    // const { data: memberRows, error } = await supabase.rpc(
    const { data, error } = await supabase.rpc("get_members_and_parent_with_sales_achievement_data", payload);

    if (error) {
      console.log("❌get_members_and_parent_with_sales_achievement_dataエラー発生", error.message);
      throw new Error(error.message);
    }

    console.log(
      "✅useQueryMemberListByParentEntityカスタムフック get_members_and_parent_with_sales_achievement_data関数実行成功 data",
      data
    );

    responseObj = data;
    // rows = memberRows;

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 800));

    return responseObj as {
      members_sales_data: (MemberAccountsDealBoard & {
        company_id: string;
        company_name: string;
        current_sales_amount: number; // COALESCEで0をセットしているため必ずnumber型で返却される
        current_sales_target: number | null;
        current_achievement_rate: number | null;
      })[];
      parent_entity_sales_data: {
        current_sales_amount: number; // COALESCEで0をセットしているため必ずnumber型で返却される
        current_sales_target: number | null;
        current_achievement_rate: number | null;
      };
    };
    // return rows as (MemberAccounts & {
    //   company_id: string;
    //   company_name: string;
    //   current_sales_amount: number | null;
    //   current_sales_target: number | null;
    //   current_achievement_rate: number | null;
    // })[];
  };

  return useQuery({
    queryKey: ["member_accounts", "sdb", parentEntityId, entityIdsStr],
    queryFn: getMemberGroupsByParentEntity,
    staleTime: Infinity,
    onError: (error: any) => {
      // alert(error.message);
      console.error("useQueryMemberListByParentEntityカスタムフック error:", error);
      return null;
    },
    enabled: !!entityIds && !!parentEntityLevel && !!parentEntityId && isReady,
  });
};
