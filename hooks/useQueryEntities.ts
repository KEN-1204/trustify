import { EntitiesHierarchy, EntityLevelStructures } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

// 設定済みの売上目標の年度を取得するuseQuery
export const useQueryEntities = (
  company_id: string | null | undefined,
  fiscalYear: number | null | undefined,
  targetType: string | null | undefined,
  entityLevelIds: string[],
  isReady: boolean = true
) => {
  const supabase = useSupabaseClient();

  const entityLevelIdsStr = entityLevelIds?.length > 0 ? entityLevelIds.join(", ") : "";

  const getEntities = async () => {
    if (!company_id) return [];
    if (!fiscalYear) return [];
    if (!targetType) return [];
    if (!entityLevelIds || entityLevelIds?.length === 0) return [];
    if (targetType !== "sales_target") return [];

    const payload = {
      _company_id: company_id,
      _fiscal_year: fiscalYear,
      _target_type: targetType,
      _entity_level_ids: entityLevelIds,
    };
    console.log("🔥useQueryEntities実行 payload: ", payload);
    const { data, error } = await supabase.rpc("get_entities_by_level_and_year", payload);

    if (error) {
      console.log("❌getEntitiesエラー発生", error.message);
      throw error;
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return data as EntitiesHierarchy;
  };

  return useQuery({
    queryKey: ["entities", targetType, fiscalYear, entityLevelIdsStr],
    queryFn: getEntities,
    staleTime: Infinity,
    onError: (error) => {
      console.error("❌useQueryEntities error:", error);
    },
    enabled: !!company_id && !!fiscalYear && !!targetType && !!entityLevelIds && entityLevelIds.length > 0 && isReady,
  });
};

// const entityStructuresResponse = {
//   会社レベルid: [{上位エンティティId1: [
//     {id: エンティティID, entity_name: エンティティ名, ...}
//   ]}],
//   事業部レベルid: [{上位エンティティId1: [
//     {id: エンティティID, entity_name: エンティティ名, ...},
//     {id: エンティティID, entity_name: エンティティ名, ...}
//   ]}],
//   課レベルid: [
//         {上位エンティティId1: [
//           {id: エンティティID, entity_name: エンティティ名, ...},
//           {id: エンティティID, entity_name: エンティティ名, ...}
//         ]},
//         {上位エンティティId2: [
//           {id: エンティティID, entity_name: エンティティ名, ...},
//           {id: エンティティID, entity_name: エンティティ名, ...}
//         ]},
//     ],
//   係レベルid: [...]
//   },
