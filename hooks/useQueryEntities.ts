import useDashboardStore from "@/store/useDashboardStore";
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
  // const triggerQueryEntities = useDashboardStore((state) => state.triggerQueryEntities);
  // const setTriggerQueryEntities = useDashboardStore((state) => state.setTriggerQueryEntities);

  const entityLevelIdsStr = entityLevelIds?.length > 0 ? entityLevelIds.join(", ") : "";

  const getEntities = async () => {
    // if (!company_id) return null;
    // if (!fiscalYear) return null;
    // if (!targetType) return null;
    // if (!entityLevelIds || entityLevelIds?.length === 0) return null;
    // if (targetType !== "sales_target") return null;

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

    console.log("✅useQueryEntities実行成功 data: ", data);

    // if (triggerQueryEntities) {
    //   setTriggerQueryEntities(false);
    // }
    // {"company": [ ... ], "department": [ ... ], "section": [ ... ], ...}
    return data as EntitiesHierarchy;
  };

  return useQuery({
    queryKey: ["entities", targetType, fiscalYear, entityLevelIdsStr],
    // queryKey: ["entities", targetType, fiscalYear],
    queryFn: getEntities,
    staleTime: Infinity,
    onError: (error) => {
      console.error("❌useQueryEntities error:", error);
    },
    enabled: !!company_id && !!fiscalYear && !!targetType && isReady,
    // enabled: !!company_id && !!fiscalYear && !!targetType && !!entityLevelIds && entityLevelIds.length > 0 && isReady,
  });
};

// const entityStructuresResponse = {
//   company: [{
//     parent_entity_name: 'root',
//     parent_entity_id: 'root',
//     entities: [
//     {id: エンティティID, entity_name: エンティティ名, ...},
//   ]},],
//   department: [{
//     parent_entity_name: 上位エンティティ名,
//     parent_entity_id: 上位エンティティId1,
//     entities: [
//     {id: エンティティID, entity_name: エンティティ名, ...},
//     {id: エンティティID, entity_name: エンティティ名, ...}
//   ]}],
//   section: [
//   {
//     parent_entity_name: 上位エンティティ名,
//     parent_entity_id: 上位エンティティId1,
//     entities: [
//     {id: エンティティID, entity_name: エンティティ名, ...},
//     {id: エンティティID, entity_name: エンティティ名, ...}
//   ]},
//   {
//     parent_entity_name: 上位エンティティ名,
//     parent_entity_id: 上位エンティティId2,
//     entities: [
//     {id: エンティティID, entity_name: エンティティ名, ...},
//     {id: エンティティID, entity_name: エンティティ名, ...}
//   ]}],
//   unit: [...]
// },
