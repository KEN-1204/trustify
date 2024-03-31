import { EntityLevelStructures, EntityLevels } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

// 設定済みの売上目標の年度を取得するuseQuery
export const useQueryEntityLevels = (
  company_id: string | null | undefined,
  fiscalYear: number | null | undefined,
  targetType: string | null | undefined,
  isReady: boolean = true
) => {
  const supabase = useSupabaseClient();

  const getEntityLevels = async () => {
    if (!company_id) return [];
    if (!fiscalYear) return [];
    if (!targetType) return [];
    if (targetType !== "sales_target") return [];

    const payload = {
      _company_id: company_id,
      _fiscal_year: fiscalYear,
      _target_type: targetType,
    };
    console.log("🔥useQueryEntityLevels実行 payload: ", payload);
    const { data, error } = await supabase.rpc("get_entity_levels_by_company_and_fiscal_year", payload);

    if (error) {
      console.log("❌getEntityLevelsエラー発生", error.message);
      throw error;
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    // return data as (EntityLevelStructures & { fiscal_year: number })[];
    return data as EntityLevels[];
  };

  return useQuery({
    queryKey: ["entity_levels", targetType, fiscalYear],
    queryFn: getEntityLevels,
    staleTime: Infinity,
    onError: (error) => {
      console.error("❌useQueryEntityLevels error:", error);
    },
    enabled: !!company_id && !!fiscalYear && !!targetType && isReady,
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
