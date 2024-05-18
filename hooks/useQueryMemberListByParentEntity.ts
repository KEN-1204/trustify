import useDashboardStore from "@/store/useDashboardStore";
import { MemberAccounts } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  entityIds: string[] | null;
  parentEntityLevel: string | null;
  parentEntityId: string | null;
  isReady: boolean;
};

// 上位エンティティidに紐づくエンティティを全て抽出
export const useQueryMemberListByParentEntity = ({
  entityIds,
  parentEntityLevel,
  parentEntityId,
  isReady = true,
}: Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const supabase = useSupabaseClient();

  const getMemberGroupsByParentEntity = async () => {
    // setLoadingGlobalState(true);
    if (!entityIds || !parentEntityLevel || !parentEntityId) return null;
    if (!userProfileState) return null;

    let rows: (MemberAccounts & { company_id: string; company_name: string })[] = [];

    const payload = {
      _subscription_id: userProfileState.subscription_id,
      _company_id: userProfileState.company_id,
      _parent_entity_level: parentEntityLevel,
      _parent_entity_id: parentEntityId,
      _entity_ids: entityIds,
    };
    console.log(
      "🔥useQueryMemberListByParentEntityカスタムフック getMemberGroupsByParentEntity関数実行 payload",
      payload
    );

    const { data: memberRows, error } = await supabase.rpc("get_members_filtered_by_entity_ids", payload);

    if (error) {
      console.log("getMemberGroupsByParentEntityエラー発生", error.message);
      throw new Error(error.message);
    }

    console.log(
      "✅useQueryMemberListByParentEntityカスタムフック getMemberGroupsByParentEntity関数実行成功 data",
      memberRows
    );

    rows = memberRows;

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 800));

    return rows as (MemberAccounts & { company_id: string; company_name: string })[];
  };

  return useQuery({
    queryKey: ["member_accounts", "sdb", parentEntityId],
    queryFn: getMemberGroupsByParentEntity,
    staleTime: Infinity,
    onError: (error: any) => {
      alert(error.message);
      console.error("useQueryMemberListByParentEntityカスタムフック error:", error);
      return [];
    },
    enabled: !!entityIds && !!parentEntityLevel && !!parentEntityId && isReady,
  });
};
