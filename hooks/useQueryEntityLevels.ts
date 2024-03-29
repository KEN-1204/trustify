import { EntityLevelStructures } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

// 設定済みの売上目標の年度を取得するuseQuery
export const useQueryEntityLevels = (
  company_id: string | null | undefined,
  fiscalYear: number | null | undefined,
  targetType: string | null | undefined,
  isReady: boolean = true
): (EntityLevelStructures & { fiscal_year: number })[] => {
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
    const { data, error } = await supabase.rpc("get_entity_levels_by_company_and_fiscal_year", payload);
    // const { data, error } = await supabase
    //   .from("fiscal_years")
    //   .select("*")
    //   .eq("created_by_company_id", company_id)
    //   .eq("target_type", targetType)
    //   .order("fiscal_year", { ascending: false });

    if (error) {
      console.log("❌getEntityLevelsエラー発生", error.message);
      throw error;
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return data as (EntityLevelStructures & { fiscal_year: number })[];
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

// const entityStructuresResponse = [
//   { companyLevelId: [companyEntity1] },
//   { departmentLevelId: [{ companyEntityId: [departmentEntity1, departmentEntity2] }] },
//   {
//     sectionLevelId: [
//       {
//         departmentEntityId1: [sectionEntity1, sectionEntity2],
//         departmentEntityId2: [sectionEntity3, sectionEntity4],
//       },
//     ],
//   },
// ];
