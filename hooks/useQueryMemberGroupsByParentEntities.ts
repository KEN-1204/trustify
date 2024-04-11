import useDashboardStore from "@/store/useDashboardStore";
import { EntityGroupByParent, MemberAccounts, MemberGroupsByParentEntity, Product } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

type Props = {
  parent_entity_level: string;
  parentEntities: {
    // parent_entity_level_id: string;
    // parent_entity_level: string;
    // parent_entity_id: string | null;
    // parent_entity_name: string;
    entity_level: string;
    entity_id: string;
    entity_name: string;
  }[];
  //   entityIdsStr?: string;
  isReady: boolean;
};

// 上位エンティティidに紐づくエンティティを全て抽出
export const useQueryMemberGroupsByParentEntities = ({
  parent_entity_level,
  parentEntities,
  isReady = true,
}: Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const supabase = useSupabaseClient();

  const parentEntityIdsSet = useMemo(() => new Set(parentEntities.map((entity) => entity.entity_id)), [parentEntities]);
  const parentEntityIdsStr = useMemo(() => Array.from(parentEntityIdsSet).join(", "), [parentEntityIdsSet]);

  const getMemberGroupsByParentEntities = async () => {
    // setLoadingGlobalState(true);
    if (!userProfileState) return {};
    if (!(isReady && parentEntities.length > 0)) return {};
    console.log("useQueryMemberAccountsカスタムフック getMemberGroupsByParentEntities関数");

    let rows: (MemberAccounts & { company_id: string; company_name: string })[] = [];
    let memberGroupsObjByParentEntities = {};

    const { data: memberRows, error } = await supabase.rpc("get_members_filtered_by_parent_entity", {
      _subscription_id: userProfileState.subscription_id,
      _company_id: userProfileState.company_id,
      _parent_entity_level: parent_entity_level,
      _parent_entity_ids: Array.from(parentEntityIdsSet),
    });

    if (error) {
      console.log("getMemberGroupsByParentEntitiesエラー発生", error.message);
      throw new Error(error.message);
    }
    rows = memberRows;

    const getParentEntityId = (
      parent_entity_level: string,
      memberObj: MemberAccounts & { company_id: string; company_name: string }
    ) => {
      switch (parent_entity_level) {
        case "company":
          return memberObj.company_id;
          break;
        case "department":
          return memberObj.assigned_department_id;
          break;
        case "section":
          return memberObj.assigned_section_id;
          break;
        case "unit":
          return memberObj.assigned_unit_id;
          break;
        case "office":
          return memberObj.assigned_office_id;
          break;

        default:
          break;
      }
    };

    const membersParentIdToObjMap = new Map(
      rows.map((member) => [getParentEntityId(parent_entity_level, member), member])
    );

    memberGroupsObjByParentEntities = parentEntities.reduce(
      (acc, parentEntity) => {
        acc[parentEntity.entity_id] = {
          parent_entity_id: parentEntity.entity_id,
          parent_entity_name: parentEntity.entity_name,
          member_group: rows.filter(
            (member) => getParentEntityId(parent_entity_level, member) === parentEntity.entity_id
          ),
        };
        return acc;
      },
      {} as {
        [key: string]: {
          parent_entity_id: string;
          parent_entity_name: string;
          member_group: (MemberAccounts & { company_id: string; company_name: string })[];
        };
      }
    ); // {上位エンティティid: {EntityGroupByParent}}

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 800));

    // return rows as MemberAccounts[] | [];
    return memberGroupsObjByParentEntities as MemberGroupsByParentEntity;
  };

  return useQuery({
    queryKey: ["member_accounts", parent_entity_level, parentEntityIdsStr],
    queryFn: getMemberGroupsByParentEntities,
    staleTime: Infinity,
    onError: (error: any) => {
      alert(error.message);
      console.error("useQueryMemberAccountsカスタムフック error:", error);
      return [];
    },
    enabled: !!parent_entity_level ? isReady : true,
  });
};
