import useDashboardStore from "@/store/useDashboardStore";
import {
  AddedEntityMemberCount,
  EntitiesHierarchy,
  EntityGroupByParent,
  EntityLevelNames,
  EntityLevelStructures,
  EntityLevels,
} from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type Props = {
  company_id: string | null | undefined;
  currentLevel: "" | EntityLevelNames;
  entitiesHierarchyLocal: EntitiesHierarchy;
  targetType: string | null | undefined;
  levelObj: EntityLevels;
  isReady: boolean;
};

// 設定済みの売上目標の年度を取得するuseQuery
export const useQueryAddedEntitiesMemberCount = ({
  company_id,
  currentLevel,
  entitiesHierarchyLocal,
  targetType,
  levelObj,
  isReady,
}: Props) => {
  const supabase = useSupabaseClient();

  const entityIdsArray = useMemo(() => {
    if (currentLevel === "") return null;
    const entityGroup = entitiesHierarchyLocal[currentLevel];
    if (entityGroup.length === 0) return null;
    // if (entityGroup.some(group => group.entities.length === )) return null;

    const newEntityIdsArray = entityGroup
      .map((group) => {
        if (group.entities?.length > 0) {
          return group.entities.map((entity) => entity.entity_id);
        } else {
          return null;
        }
      })
      .filter((arrayOrNull): arrayOrNull is string[] => arrayOrNull !== null)
      .flatMap((array) => array);

    return newEntityIdsArray;
  }, [currentLevel, entitiesHierarchyLocal]);

  // メンバーの所属有無を確認するのは事業部、課、係のみで、これらの3つのエンティティは全てレベルを追加した時に初回で全ての上位レベルの追加ずみエンティティに紐づくエンティティを全てセットされた状態でマウントされるため、初回マウント時にこのレベルで取り得る全てのエンティティが追加されている状態でクエリを行うため、クエリキーにエンティティidを文字列にした値をセットしなくてもOK
  // const entityIdsStr = useMemo(() => (!!entityIdsArray?.length ? entityIdsArray.join(", ") : ""), [entityIdsArray]);

  const getAddedEntitiesMemberCount = async () => {
    if (["", "company", "member"].includes(currentLevel)) return null;
    if (levelObj.entity_level !== currentLevel) return null;
    if (!entityIdsArray) return null;
    if (entityIdsArray.length === 0) return null;

    const payload = {
      _company_id: company_id,
      _entity_level: currentLevel,
      _entity_ids: entityIdsArray,
    };

    console.log("🔥useQueryAddedEntitiesMemberCount実行 payload: ", payload);

    let queryData: AddedEntityMemberCount[] = [];

    let selectTable = "departments";
    if (currentLevel === "department") selectTable = "departments";
    if (currentLevel === "section") selectTable = "sections";
    if (currentLevel === "unit") selectTable = "units";

    const { data, error } = await supabase.rpc("get_added_entities_member_count", payload);
    // const { data, error } = await supabase
    //   .from(selectTable)
    //   .select("*", { count: "exact", head: true })
    //   .in("id", entityIdsArray);

    if (error) {
      console.log("❌getAddedEntitiesMemberCountエラー発生", error.message);
      throw error;
    }

    console.log("✅useQueryAddedEntitiesMemberCount取得成功 data: ", data);

    queryData = data;

    let responseData: {
      [key: string]: AddedEntityMemberCount;
    } = {}; // 初期値として空のオブジェクトを設定

    if (queryData.length > 0) {
      queryData.forEach((countObj) => {
        responseData[countObj.entity_id] = countObj;
      });
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    return (Object.keys(responseData)?.length > 0 ? responseData : null) as {
      [key: string]: AddedEntityMemberCount;
    } | null;
  };

  // メンバーの所属有無を確認するのは事業部、課、係のみで、これらの3つのエンティティは全てレベルを追加した時に初回で全ての上位レベルの追加ずみエンティティに紐づくエンティティを全てセットされた状態でマウントされるため、初回マウント時にこのレベルで取り得る全てのエンティティが追加されている状態でクエリを行うため、クエリキーにエンティティidを文字列にした値をセットしなくてもOK
  return useQuery({
    // queryKey: ["added_entities_member_count", targetType, levelObj.entity_level, currentLevel, entityIdsStr],
    queryKey: ["added_entities_member_count", targetType, levelObj.entity_level, currentLevel],
    // queryKey: ["entities", targetType, fiscalYear],
    queryFn: getAddedEntitiesMemberCount,
    staleTime: Infinity,
    onError: (error) => {
      console.error("❌useQueryAddedEntitiesMemberCount error:", error);
    },
    enabled:
      !!company_id &&
      !!currentLevel &&
      !!targetType &&
      isReady &&
      // !!entityIdsStr &&
      levelObj.entity_level === currentLevel,
  });
};
