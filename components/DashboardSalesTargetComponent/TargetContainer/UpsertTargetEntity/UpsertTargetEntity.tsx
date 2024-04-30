import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { Fragment, Suspense, memo, useEffect, useMemo, useRef, useState } from "react";
import styles from "../../DashboardSalesTargetComponent.module.css";
import { MdSaveAlt } from "react-icons/md";
import useDashboardStore from "@/store/useDashboardStore";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";
import useStore from "@/store";
import { addTaskIllustration, dataIllustration, winnersIllustration } from "@/components/assets";
import { BsCheck2, BsChevronLeft } from "react-icons/bs";
import NextImage from "next/image";
import { useQueryEntityLevels } from "@/hooks/useQueryEntityLevels";
import { useQueryEntities } from "@/hooks/useQueryEntities";
import {
  Department,
  EntitiesHierarchy,
  Entity,
  EntityGroupByParent,
  EntityLevelNames,
  EntityLevels,
  MemberAccounts,
  Office,
  PopupDescMenuParams,
  Section,
  SectionMenuParams,
  Unit,
  UpsertSettingEntitiesObj,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { mappingEntityName } from "@/utils/mappings";
import { cloneDeep } from "lodash";
import { ImInfo } from "react-icons/im";
import { UpsertSettingTargetEntityGroup } from "./UpsertSettingTargetEntityGroup/UpsertSettingTargetEntityGroup";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { FallbackTargetContainer } from "../FallbackTargetContainer";
import { FiPlus } from "react-icons/fi";
import { IoChevronDownOutline, IoTriangleOutline } from "react-icons/io5";
import { RxDot } from "react-icons/rx";
import { mappingPopupTitle } from "./dataSettingTarget";
import { FallbackUpsertSettingTargetEntityGroup } from "./UpsertSettingTargetEntityGroup/FallbackUpsertSettingTargetEntityGroup";
import { useQueryMemberAccountsFilteredByEntity } from "@/hooks/useQueryMemberAccountsFilteredByEntity";
import { useQueryMemberGroupsByParentEntities } from "@/hooks/useQueryMemberGroupsByParentEntities";
import { toast } from "react-toastify";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { useQueryFiscalYears } from "@/hooks/useQueryFiscalYears";
import { useQueryFiscalYear } from "@/hooks/useQueryFiscalYear";
import { GrPowerReset } from "react-icons/gr";
import { FaExchangeAlt } from "react-icons/fa";
import { CgArrowsExchange } from "react-icons/cg";
import { useQueryAddedEntitiesMemberCount } from "@/hooks/useQueryAddedEntitiesMemberCount";
import { FallbackEntityLevelColumn } from "./EntityLevelColumn/FallbackEntityLevelColumn";
import { EntityLevelColumn } from "./EntityLevelColumn/EntityLevelColumn";
import { mappingHalfDetails } from "@/utils/selectOptions";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { calculateFiscalYearMonths } from "@/utils/Helpers/CalendarHelpers/calculateFiscalMonths";
import { runFireworks } from "@/utils/confetti";
import { ConfirmationModal } from "@/components/DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";

/*
🌠上位エンティティグループに対して紐付ける方法のメリットとデメリット
メリット
データの整合性: 上位エンティティの目標を100%として、下位エンティティの目標シェアが整合性を保つことができます。これにより、組織全体での目標達成に対する明確な視覚化と追跡が可能になります。
組織構造の明確化: 各エンティティがどのように上位エンティティに紐付いているかが明確になり、組織全体の構造理解が深まります。
デメリット
柔軟性の欠如: 全てのエンティティが上位エンティティに紐付けられるため、特定のエンティティだけの独立した目標設定が難しくなります。これは特に小規模なチームやプロジェクト特有の目標設定において制限がかかります。

🌠単一のエンティティごとに個別で売上目標設定を可能にする方法のメリットとデメリット
メリット
柔軟性: 各エンティティが独立して目標を設定できるため、変化するビジネス環境や特定のプロジェクトニーズに柔軟に対応できます。
ユーザーエクスペリエンスの向上: ユーザーは自分たちのニーズに合わせて自由に目標設定ができるため、ツールの使用に対する満足度が高まります。
デメリット
データの整合性: 上位エンティティの目標と下位エンティティの目標が合計して100%にならない可能性があります。これにより、組織全体の目標達成状況の追跡が難しくなる可能性があります。
管理の複雑化: 各エンティティが独立して目標を設定する場合、目標の追跡と管理が複雑になり、全体の目標達成状況の可視化が困難になる場合があります。
結論
どちらの実装がユーザーにとって最適かは、ユーザーが抱える問題やニーズ、組織の規模や構造によって異なります。例えば、組織が大きく、階層的な構造を持つ場合は、上位エンティティに紐付ける方法が整合性と組織理解の点で有利かもしれません。一方で、スタートアップやフラットな組織構造の会社では、個々のエンティティが柔軟に目標を設定できる方がユーザーエクスペリエンスを向上させる可能性があります。

最終的な選択は、ユーザー調査やフィードバックを通じてユーザーのニーズを理解し、それに基づいて柔軟性と整合性のバランスを取ることが鍵となります。また、システムが成熟してきたら、両方のアプローチの要素を組み合わせるハイブリッドな方法を検討することも一つの解となり得ます。
*/

// 🌠上位エンティティグループに対して紐付ける方法

const UpsertTargetEntityMemo = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  // const setUpsertTargetObj = useDashboardStore((state) => state.setUpsertTargetObj);
  // 目標設定時の上位エンティティと紐づく設定対象の下位エンティティ配列・年度オブジェクト
  const upsertSettingEntitiesObj = useDashboardStore((state) => state.upsertSettingEntitiesObj);
  const setUpsertSettingEntitiesObj = useDashboardStore((state) => state.setUpsertSettingEntitiesObj);

  // 個別エンティティグループ目標設定モード
  const setUpsertTargetMode = useDashboardStore((state) => state.setUpsertTargetMode);

  // ユーザーの会計年度の期首と期末のDateオブジェクト
  const fiscalYearStartEndDate = useDashboardStore((state) => state.fiscalYearStartEndDate);
  // ユーザーの年月度の12ヶ月分の配列
  // const annualFiscalMonths = useDashboardStore((state) => state.annualFiscalMonths);

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  // 目標設定を行う上位エンティティグループ()
  const [isSettingTargetMode, setIsSettingTargetMode] = useState(false);
  // メンバーレベル時の上期、下期の期間state デフォルトでは上期を選択中にする
  // メンバーレベル目標設定時専用 「上期詳細」「下期詳細」切り替えstate "first_half_details" | "second_half_details"
  const selectedPeriodTypeForMemberLevel = useDashboardStore((state) => state.selectedPeriodTypeForMemberLevel);
  const setSelectedPeriodTypeForMemberLevel = useDashboardStore((state) => state.setSelectedPeriodTypeForMemberLevel);
  // const [selectedHalfYearForMemberLevel, setSelectedHalfYearForMemberLevel] = useState('first_year_detail')
  // メンバーレベル時の「目標設定」クリックした選択中のメンバーエンティティと上期、下期どちらを選択しているか => ❌一旦使用なし
  const [selectedMemberAndPeriodType, setSelectedMemberAndPeriodType] = useState<{
    memberGroupObjByParent: EntityGroupByParent;
    periodType: string;
    isConfirmFirstHalf: boolean;
    isConfirmSecondHalf: boolean;
  } | null>(null);
  // sticky
  const [isStickySidebar, setIsStickySidebar] = useState(false);
  const [isStickyHeader, setIsStickyHeader] = useState(false);

  const handleErrorReturn = () => {
    setUpsertSettingEntitiesObj(null);
    setUpsertTargetMode(null);
    return null;
  };

  if (!userProfileState) return handleErrorReturn();
  if (!userProfileState.company_id) return handleErrorReturn();
  // if (!upsertTargetObj) return handleErrorReturn();
  // if (!upsertTargetObj.fiscalYear) return handleErrorReturn();
  if (!upsertSettingEntitiesObj) return handleErrorReturn();
  if (!upsertSettingEntitiesObj.fiscalYear) return handleErrorReturn();
  if (!fiscalYearStartEndDate) return handleErrorReturn();

  // ref
  // 説明アイコン
  const infoIconStepRef = useRef<HTMLDivElement | null>(null);
  const infoIconTitleRef = useRef<HTMLDivElement | null>(null);
  // スクロールエリア
  const scrollContentsAreaRef = useRef<HTMLDivElement | null>(null);

  // // 選択中の会計年度ローカルstate
  // const [selectedFiscalYearLocal, setSelectedFiscalYearLocal] = useState(upsertTargetObj.fiscalYear);
  // // 年度オプション選択肢
  // const optionsFiscalYear = useDashboardStore((state) => state.optionsFiscalYear);
  // const setOptionsFiscalYear = useDashboardStore((state) => state.setOptionsFiscalYear);

  // ================================ 🌟設定済み年度useQuery🌟 ================================
  // const fiscalYearsQueryData = queryClient.getQueriesData(["fiscal_years", "sales_target"]);
  const {
    data: fiscalYearQueryData,
    isLoading: isLoadingQueryFiscalYear,
    isError: isErrorQueryFiscalYear,
  } = useQueryFiscalYear(userProfileState?.company_id, "sales_target", upsertSettingEntitiesObj.fiscalYear, true);

  // ================================ 🌟設定済み年度useQuery🌟 ================================

  // ===================== 🌠エンティティレベルuseQuery🌠 =====================
  const {
    data: addedEntityLevelsListQueryData,
    isLoading: isLoadingQueryLevel,
    isError: isErrorQueryLevel,
    isSuccess: isSuccessQueryLevel,
  } = useQueryEntityLevels(userProfileState.company_id, upsertSettingEntitiesObj.fiscalYear, "sales_target", true);
  // ===================== 🌠エンティティレベルuseQuery🌠 =====================

  // ===================== 🌠エンティティuseQuery🌠 =====================
  // エンティティレベルのidのみで配列を作成(エンティティuseQuery用)
  const entityLevelIds = useMemo(() => {
    if (!addedEntityLevelsListQueryData) return [];
    return addedEntityLevelsListQueryData.map((obj) => obj.id);
  }, [addedEntityLevelsListQueryData]);

  // const triggerQueryEntities = useDashboardStore((state) => state.triggerQueryEntities);
  // useEffect(() => {
  //   if (!triggerQueryEntities) return;
  //   if (triggerQueryEntities && isSuccessQueryLevel) {
  //     const invalidateQueryEntities = async () => {
  //       await queryClient.invalidateQueries(["entities", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
  //     };
  //     invalidateQueryEntities();
  //   }
  // }, [triggerQueryEntities, isSuccessQueryLevel]);

  // 現在追加済みの全てのレベルidに紐づくそれぞれのエンティティ
  const {
    data: entitiesHierarchyQueryData,
    isLoading: isLoadingQueryEntities,
    isError: isErrorQueryEntities,
  } = useQueryEntities(
    userProfileState.company_id,
    upsertSettingEntitiesObj.fiscalYear,
    "sales_target",
    entityLevelIds,
    isSuccessQueryLevel
  );
  // ===================== 🌠エンティティuseQuery🌠 =====================

  // 🌟✅エンティティレベルとエンティティをローカルstateで管理し、追加編集をローカルで行い最終確定時にDBとキャッシュを更新
  const [addedEntityLevelsListLocal, setAddedEntityLevelsListLocal] = useState(addedEntityLevelsListQueryData ?? []);
  // ✅エンティティレベルごとにentitiesHierarchyQueryDataを振り分ける
  // // {"company": [ ... ], "department": [ ... ], "section": [ ... ], ...}
  const [entitiesHierarchyLocal, setEntitiesHierarchyLocal] = useState<EntitiesHierarchy>({
    company: [],
    department: [],
    section: [],
    unit: [],
    member: [],
    office: [],
  });

  // 🌟エンティティレベルを取得した後に必ずstateにセットするためのuseEffect 新たにエンティティレベルが追加された時にも自動的にuseQueryの内容を反映
  useEffect(() => {
    setAddedEntityLevelsListLocal(addedEntityLevelsListQueryData ?? []);
  }, [addedEntityLevelsListQueryData]);

  // ✅【初回マウント時】🌟レベルごとのエンティティリストを取得した後に必ずセットするためのuseEffect
  const [isSetCompleteEntitiesHierarchy, setIsSetCompleteEntitiesHierarchy] = useState(false);
  useEffect(() => {
    if (entitiesHierarchyQueryData) {
      let initialState: EntitiesHierarchy = {
        company: [],
        department: [],
        section: [],
        unit: [],
        member: [],
        office: [],
      };

      // 存在するエンティティレベルのキーを取得
      const existingKeys = Object.keys(entitiesHierarchyQueryData);

      // 存在するキーに対してのみ値をセット
      existingKeys.forEach((key) => {
        initialState[key as EntityLevelNames] = entitiesHierarchyQueryData[key as EntityLevelNames];
      });
      console.log(
        "🌟レベルごとのエンティティリストを取得した後に必ずセットするためのuseEffect",
        "entitiesHierarchyQueryData",
        entitiesHierarchyQueryData,
        "existingKeys",
        existingKeys,
        "initialState",
        initialState
      );

      setEntitiesHierarchyLocal(initialState);
      setIsSetCompleteEntitiesHierarchy(true); // ローカルstateにエンティティのセットが完了を通知 同じ初回マウント時のメンバーレベルで直上の親エンティティに紐づく各メンバー取得するuseQueryが完了したタイミングでentitiesHierarchyLocalにセットする際に、こちらのentitiesHierarchyLocalがセットされていない状態だと全てのレベルが空の配列でsetEntitiesHierarchyLocalが実行されてしまうため、この完了通知の後に再度メンバーもセットする
      if (currentLevel === "member" && existingKeys.includes("member")) {
        // エンティティレベルカラムが3つ以上で画面右端を超える場合にはヘッダーとサイドバーを固定してから右端にスクロールする
        if (addedEntityLevelsListLocal.length > 3) {
          // 0.1秒遅延して右端にスクロールさせる
          setTimeout(() => {
            if (scrollContentsAreaRef.current) {
              if (isStickyHeader === false) setIsStickyHeader(true); // ヘッダー固定
              if (isStickySidebar === false) setIsStickySidebar(true); // サイドバー固定
              const scrollArea = scrollContentsAreaRef.current;
              const { width } = scrollArea.getBoundingClientRect();
              scrollArea.scrollTo({ top: 0, left: width, behavior: "smooth" });
            }
          }, 100);
        }
      }
    }
  }, [entitiesHierarchyQueryData]);

  // ✅エンティティレベルMap key: レベル名, value: オブジェクトのMapオブジェクトを生成
  const addedEntityLevelsMapLocal = useMemo(() => {
    if (!addedEntityLevelsListLocal || addedEntityLevelsListLocal?.length === 0) return null;
    return new Map(addedEntityLevelsListLocal.map((obj) => [obj.entity_level, obj]));
  }, [addedEntityLevelsListLocal]);
  // const addedEntityLevelsMapLocal = useMemo(() => {
  //   if (!addedEntityLevelsListQueryData || addedEntityLevelsListQueryData?.length === 0) return null;
  //   return new Map(addedEntityLevelsListQueryData.map((obj) => [obj.entity_level, obj]));
  // }, [addedEntityLevelsListQueryData]);

  // ✅現在のレベル ステップ1でレベルを選択して変更
  // const [currentLevel, setCurrentLevel] = useState<EntityLevelNames | "">("");
  const [currentLevel, setCurrentLevel] = useState<EntityLevelNames | "">(() => {
    if (!addedEntityLevelsMapLocal || addedEntityLevelsMapLocal.size === 0) return "";
    if (addedEntityLevelsMapLocal.has("member")) return "member";
    if (addedEntityLevelsMapLocal.has("unit")) return "unit";
    if (addedEntityLevelsMapLocal.has("section")) return "section";
    if (addedEntityLevelsMapLocal.has("department")) return "department";
    if (addedEntityLevelsMapLocal.has("company")) return "company";
    return "";
  });

  // ステップ1で選択中のレベル
  const [selectedNextLevel, setSelectedNextLevel] = useState<EntityLevelNames>("company");

  // ✅現在のレベルの上位エンティティレベル
  const parentEntityLevel = useMemo(() => {
    if (currentLevel === "company") return "root";
    if (currentLevel === "department") return "company";
    if (currentLevel === "section") return "department";
    if (currentLevel === "unit") return "section";
    if (currentLevel === "member" && addedEntityLevelsMapLocal) {
      if (addedEntityLevelsMapLocal.has("unit")) return "unit";
      if (addedEntityLevelsMapLocal.has("section")) return "section";
      if (addedEntityLevelsMapLocal.has("department")) return "department";
      if (addedEntityLevelsMapLocal.has("company")) return "company";
      return "company";
    } else {
      return "company";
    }
  }, [currentLevel]);

  // ===================== 🔸追加した各エンティティ内にメンバーがいるかどうか人数をcountで確認useQuery🔸 =====================
  // currentLevelのエンティティレベル内でentitiesHierarchyに格納されたエンティティに対してqueryを行う
  // const {
  //   data: addedEntitiesMemberCountQueryData,
  //   isLoading: isLoadingQueryAddedEntitiesMemberCount,
  //   isError: isErrorQueryAddedEntitiesMemberCount,
  // } = useQueryAddedEntitiesMemberCount({
  //   company_id: userProfileState.company_id,
  //   currentLevel,
  //   entitiesHierarchyLocal,
  //   targetType: "sales_target",
  //   isReady: step === 2 && currentLevel !== "" && currentLevel !== "company" && currentLevel !== "member", // レベル内に追加した事業部~係の各エンティティにメンバーが所属しているか確認、メンバーがいないエンティティがstep2で入っている場合は「構成を確定」がクリックできないようにする
  // });
  // ===================== 🔸追加した各エンティティ内にメンバーがいるかどうか人数をcountで確認useQuery🔸 =====================

  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  // ========================= 🌟メンバーリスト取得useQuery キャッシュ🌟 =========================
  const currentParentEntitiesForMember = useMemo(() => {
    if (currentLevel !== "member" || !entitiesHierarchyQueryData || parentEntityLevel === "root") return [];
    // メンバーレベルで、かつ、既にstep2でメンバーエンティティが追加されていて、entitiesHierarchyQueryDataでメンバーエンティティを取得できている場合はリターン step2でレベルとエンティティが同時にINSERTされるので、「entitiesHierarchyQueryData["member"].length >= 1」のチェックで1以上レベル内に上位エンティティグループが含まれている場合はメンバーエンティティが追加されている状態のため「entitiesHierarchyQueryData["member"].length >= 1」のチェックでOK
    // if (
    //   currentLevel === "member" &&
    //   Object.keys(entitiesHierarchyQueryData).includes("member") &&
    //   entitiesHierarchyQueryData["member"].length >= 1
    // )
    //   return [];

    return entitiesHierarchyQueryData[parentEntityLevel]
      .map((entityGroup) => {
        return entityGroup.entities.map((entity) => ({
          // parent_entity_level_id: entity.parent_entity_level_id,
          // parent_entity_level: entity.parent_entity_level,
          // parent_entity_id: entity.parent_entity_id,
          // parent_entity_name: entity.parent_entity_name,
          entity_level: parentEntityLevel,
          entity_id: entity.entity_id,
          entity_name: entity.entity_name,
        }));
      })
      .flatMap((array) => array);
  }, [currentLevel, parentEntityLevel]);

  // メンバーアカウント メンバーレベルの直上レベル内の追加済みの全てのエンティティに紐づくメンバーを取得する
  // 既にメンバーエンティティを追加済みの場合にはuseQueryのentitiesHierarchyQueryDataでmemberも取得できているためuseQueryMemberGroupsByParentEntitiesは不要 あくまでstep1でメンバーレベルを追加した後に直上のレベルのエンティティidに紐づくメンバーのみを取得するために実行するuseQuery
  const {
    data: queryDataMemberGroupsByParentEntities,
    error: useQueryError,
    isLoading: useQueryIsLoading,
    refetch: refetchMemberAccounts,
  } = useQueryMemberGroupsByParentEntities({
    parent_entity_level: parentEntityLevel,
    parentEntities: currentParentEntitiesForMember, // メンバーレベルの直上レベル内の追加済みの全てのエンティティ
    isReady: currentLevel === "member" && currentParentEntitiesForMember.length > 0, // メンバーレベルになったらフェッチ 既にメンバーエンティティがINSERT済みでメンバーレベル内の構成が確定していても、構成の変更を許可する可能性があるためフェッチしておく
  });

  // ✅メンバーレベルでメンバーグループを取得した後にuseEffectで取得したメンバーグループをsetEntitiesHierarchyLocalで更新する
  useEffect(() => {
    if (currentLevel !== "member") return;
    if (!queryDataMemberGroupsByParentEntities) return;
    if (!userProfileState.company_id) return;

    // エンティティヒエラルキーがセットされていない場合はセットが完了した後に再度処理を行う
    if (!isSetCompleteEntitiesHierarchy) return;

    // 既にメンバーエンティティ追加済みで、entitiesHierarchyQueryDataでメンバーを取得済みで、かつ、entitiesHierarchyLocalに既にmemberレベルとメンバーがセットされていて構成が確定している状態の場合には新たに直上のエンティティに紐づく全メンバーのセットは不要のためリターン
    if (
      entitiesHierarchyQueryData &&
      Object.keys(entitiesHierarchyQueryData).includes("member") &&
      entitiesHierarchyQueryData["member"].length >= 1
    ) {
      return;
    }

    if (Object.keys(queryDataMemberGroupsByParentEntities).length === 0) return;

    let newEntityHierarchy: EntitiesHierarchy = cloneDeep(entitiesHierarchyLocal);
    let newEntityGroupByParent = [] as EntityGroupByParent[];

    try {
      if (parentEntityLevel === "company") {
        const companyEntityLevelId = addedEntityLevelsListLocal.find((level) => level.entity_level === "company")?.id;
        if (!companyEntityLevelId) return alert("予期せぬエラーが発生しました。");
        const companyEntities = entitiesHierarchyLocal["company"];
        newEntityGroupByParent = companyEntities
          .map((root) => {
            return root.entities.map((company) => {
              if (!Object.keys(queryDataMemberGroupsByParentEntities).includes(company.entity_id))
                throw new Error("会社データが見つかりませんでした。");
              const membersByCompany = queryDataMemberGroupsByParentEntities[company.entity_id];
              return {
                parent_entity_id: membersByCompany.parent_entity_id,
                parent_entity_name: membersByCompany.parent_entity_name,
                entities: membersByCompany.member_group.map(
                  (member) =>
                    ({
                      id: "", // INSERT時に作成
                      created_at: "", // INSERT時に作成
                      updated_at: "", // INSERT時に作成
                      fiscal_year_id: "", // INSERT時に作成
                      entity_level_id: "", // INSERT時に作成
                      parent_entity_level_id: companyEntityLevelId,
                      target_type: "sales_target",
                      entity_id: member.id,
                      parent_entity_id: membersByCompany.parent_entity_id,
                      is_confirmed_annual_half: false,
                      is_confirmed_first_half_details: false,
                      is_confirmed_second_half_details: false,
                      entity_name: member.profile_name,
                      parent_entity_name: member.company_name,
                      fiscal_year: upsertSettingEntitiesObj.fiscalYear,
                      entity_level: "member",
                      parent_entity_level: "company",
                    } as Entity)
                ),
              } as EntityGroupByParent;
            });
          })
          .flatMap((array) => array);
      }
      if (parentEntityLevel === "department") {
        const departmentEntityLevelId = addedEntityLevelsListLocal.find(
          (level) => level.entity_level === "department"
        )?.id;
        if (!departmentEntityLevelId || !userProfileState.assigned_department_id)
          return alert("予期せぬエラーが発生しました。");
        const departmentEntities = entitiesHierarchyLocal["department"];
        newEntityGroupByParent = departmentEntities
          .map((company) => {
            return company.entities.map((department) => {
              if (!Object.keys(queryDataMemberGroupsByParentEntities).includes(department.entity_id))
                throw new Error("事業部データが見つかりませんでした。");
              const membersByDepartment = queryDataMemberGroupsByParentEntities[department.entity_id];
              return {
                parent_entity_id: membersByDepartment.parent_entity_id,
                parent_entity_name: membersByDepartment.parent_entity_name,
                entities: membersByDepartment.member_group.map(
                  (member) =>
                    ({
                      id: "", // INSERT時に作成
                      created_at: "", // INSERT時に作成
                      updated_at: "", // INSERT時に作成
                      fiscal_year_id: "", // INSERT時に作成
                      entity_level_id: "", // INSERT時に作成
                      parent_entity_level_id: departmentEntityLevelId,
                      target_type: "sales_target",
                      entity_id: member.id,
                      parent_entity_id: membersByDepartment.parent_entity_id,
                      is_confirmed_annual_half: false,
                      is_confirmed_first_half_details: false,
                      is_confirmed_second_half_details: false,
                      entity_name: member.profile_name,
                      parent_entity_name: member.assigned_department_name,
                      fiscal_year: upsertSettingEntitiesObj.fiscalYear,
                      entity_level: "member",
                      parent_entity_level: "department",
                    } as Entity)
                ),
              } as EntityGroupByParent;
            });
          })
          .flatMap((array) => array);
      }
      if (parentEntityLevel === "section") {
        const sectionEntityLevelId = addedEntityLevelsListLocal.find((level) => level.entity_level === "section")?.id;
        if (!sectionEntityLevelId || !userProfileState.assigned_section_id)
          return alert("予期せぬエラーが発生しました。");
        const sectionEntities = entitiesHierarchyLocal["section"];
        newEntityGroupByParent = sectionEntities
          .map((department) => {
            return department.entities.map((section) => {
              if (!Object.keys(queryDataMemberGroupsByParentEntities).includes(section.entity_id))
                throw new Error("課・セクションデータが見つかりませんでした。");
              const membersBySection = queryDataMemberGroupsByParentEntities[section.entity_id];
              return {
                parent_entity_id: membersBySection.parent_entity_id,
                parent_entity_name: membersBySection.parent_entity_name,
                entities: membersBySection.member_group.map(
                  (member) =>
                    ({
                      id: "", // INSERT時に作成
                      created_at: "", // INSERT時に作成
                      updated_at: "", // INSERT時に作成
                      fiscal_year_id: "", // INSERT時に作成
                      entity_level_id: "", // INSERT時に作成
                      parent_entity_level_id: sectionEntityLevelId,
                      target_type: "sales_target",
                      entity_id: member.id,
                      parent_entity_id: membersBySection.parent_entity_id,
                      is_confirmed_annual_half: false,
                      is_confirmed_first_half_details: false,
                      is_confirmed_second_half_details: false,
                      entity_name: member.profile_name,
                      parent_entity_name: member.assigned_section_name,
                      fiscal_year: upsertSettingEntitiesObj.fiscalYear,
                      entity_level: "member",
                      parent_entity_level: "section",
                    } as Entity)
                ),
              } as EntityGroupByParent;
            });
          })
          .flatMap((array) => array);
      }
      if (parentEntityLevel === "unit") {
        const unitEntityLevelId = addedEntityLevelsListLocal.find((level) => level.entity_level === "unit")?.id;
        if (!unitEntityLevelId || !userProfileState.assigned_unit_id) return alert("予期せぬエラーが発生しました。");
        const unitEntities = entitiesHierarchyLocal["unit"];
        newEntityGroupByParent = unitEntities
          .map((section) => {
            return section.entities.map((unit) => {
              if (!Object.keys(queryDataMemberGroupsByParentEntities).includes(unit.entity_id))
                throw new Error("係データが見つかりませんでした。");
              const membersByUnit = queryDataMemberGroupsByParentEntities[unit.entity_id];
              return {
                parent_entity_id: membersByUnit.parent_entity_id,
                parent_entity_name: membersByUnit.parent_entity_name,
                entities: membersByUnit.member_group.map(
                  (member) =>
                    ({
                      id: "", // INSERT時に作成
                      created_at: "", // INSERT時に作成
                      updated_at: "", // INSERT時に作成
                      fiscal_year_id: "", // INSERT時に作成
                      entity_level_id: "", // INSERT時に作成
                      parent_entity_level_id: unitEntityLevelId,
                      target_type: "sales_target",
                      entity_id: member.id,
                      parent_entity_id: membersByUnit.parent_entity_id,
                      is_confirmed_annual_half: false,
                      is_confirmed_first_half_details: false,
                      is_confirmed_second_half_details: false,
                      entity_name: member.profile_name,
                      parent_entity_name: member.assigned_unit_name,
                      fiscal_year: upsertSettingEntitiesObj.fiscalYear,
                      entity_level: "member",
                      parent_entity_level: "unit",
                    } as Entity)
                ),
              } as EntityGroupByParent;
            });
          })
          .flatMap((array) => array);
      }

      newEntityHierarchy = { ...newEntityHierarchy, member: newEntityGroupByParent };

      // メンバーレベル内に各上位エンティティグループに紐づくメンバーを追加した状態でエンティティローカルstateを更新
      setEntitiesHierarchyLocal(newEntityHierarchy);

      // 0.1秒遅延して右端にスクロールさせる
      setTimeout(() => {
        if (scrollContentsAreaRef.current) {
          // エンティティレベルカラムが3つ以上で画面右端を超える場合にはヘッダーとサイドバーを固定してから右端にスクロールする
          if (addedEntityLevelsListLocal.length > 3) {
            if (isStickyHeader === false) setIsStickyHeader(true); // ヘッダー固定
            if (isStickySidebar === false) setIsStickySidebar(true); // サイドバー固定
          }
          const scrollArea = scrollContentsAreaRef.current;
          const { width } = scrollArea.getBoundingClientRect();
          scrollArea.scrollTo({ top: 0, left: width, behavior: "smooth" });
        }
      }, 100);
    } catch (error: any) {
      console.error("エラー：", error);
    }
  }, [queryDataMemberGroupsByParentEntities, isSetCompleteEntitiesHierarchy]);
  // ========================= 🌟メンバーリスト取得useQuery キャッシュ🌟 =========================

  // 「事業部」「課・セクション」「係・チーム」「事業所」のid to objectオブジェクトマップ生成
  // 事業部マップ {id: 事業部オブジェクト}
  const departmentIdToObjMap = useMemo(() => {
    if (!departmentDataArray?.length) return null;
    const departmentMap = new Map(departmentDataArray.map((obj) => [obj.id, obj]));
    return departmentMap;
  }, [departmentDataArray]);
  // 課・セクションマップ {id: 課・セクションオブジェクト}
  const sectionIdToObjMap = useMemo(() => {
    if (!sectionDataArray?.length) return null;
    const sectionMap = new Map(sectionDataArray.map((obj) => [obj.id, obj]));
    return sectionMap;
  }, [sectionDataArray]);
  // 係マップ {id: 係オブジェクト}
  const unitIdToObjMap = useMemo(() => {
    if (!unitDataArray?.length) return null;
    const unitMap = new Map(unitDataArray.map((obj) => [obj.id, obj]));
    return unitMap;
  }, [unitDataArray]);
  // 事業所マップ {id: 事業所オブジェクト}
  const officeIdToObjMap = useMemo(() => {
    if (!officeDataArray?.length) return null;
    const officeMap = new Map(officeDataArray.map((obj) => [obj.id, obj]));
    return officeMap;
  }, [officeDataArray]);

  // ===================== 🌟ユーザーが作成したエンティティのみでレベル選択肢リストを再生成🌟 =====================
  // ✅ステップ1の選択肢で追加
  const [optionsEntityLevelList, setOptionsEntityLevelList] = useState<
    {
      // title: string;
      title: EntityLevelNames;
      name: {
        [key: string]: string;
      };
    }[]
  >(
    (): {
      title: EntityLevelNames;
      name: {
        [key: string]: string;
      };
    }[] => {
      let newEntityList: {
        title: EntityLevelNames;
        name: {
          [key: string]: string;
        };
      }[] = [{ title: "company", name: { ja: "全社", en: "Company" } }];
      if (departmentDataArray && departmentDataArray.length > 0) {
        newEntityList.push({ title: "department", name: { ja: "事業部", en: "Department" } });
      }
      if (sectionDataArray && sectionDataArray.length > 0) {
        newEntityList.push({ title: "section", name: { ja: "課・セクション", en: "Section" } });
      }
      if (unitDataArray && unitDataArray.length > 0) {
        newEntityList.push({ title: "unit", name: { ja: "係・チーム", en: "Unit" } });
      }
      // メンバーは必ず追加
      newEntityList.push({ title: "member", name: { ja: "メンバー", en: "Member" } });
      // 事業所は一旦見合わせ
      // if (officeDataArray && officeDataArray.length > 0) {
      //   newEntityList.push({ title: "office", name: { ja: "事業所", en: "Office" } });
      // }

      return newEntityList;

      // // まだ一つもレベルが追加されていない場合は全てのレベルの選択肢を返す
      // if (!addedEntityLevelsMapLocal || addedEntityLevelsMapLocal.size === 0) return newEntityList;

      // // 既に指定年度の売上目標を構成するレベルが追加されている場合、追加済みの末端レベルの下位レベルに当たるレベル以降を選択肢としてフィルターして返す
      // if (addedEntityLevelsMapLocal.has("member")) return [];
      // if (addedEntityLevelsMapLocal.has("unit")) return [{ title: "member", name: { ja: "メンバー", en: "Member" } }];
      // if (addedEntityLevelsMapLocal.has("section")) {
      //   return newEntityList.filter((obj) => ["unit", "member"].includes(obj.title));
      // }
      // if (addedEntityLevelsMapLocal.has("department")) {
      //   // 事業部->課->係->メンバーで、事業部->係と飛ばすことがないようにunitは選択肢から省く
      //   return newEntityList.filter((obj) => ["section", "member"].includes(obj.title));
      //   // return newEntityList.filter((obj) => ["section", "unit", "member"].includes(obj.title));
      // }
      // if (addedEntityLevelsMapLocal.has("company")) {
      //   // 会社->事業部->課->係->メンバーで、会社->課、会社->係のように飛ばすことがないようにsection, unitは選択肢から省く
      //   return newEntityList.filter((obj) => ["department", "member"].includes(obj.title));
      // }
      // return [];
    }
  );
  // ===================== 🌟ユーザーが作成したエンティティのみでレベル選択肢リストを再生成🌟 ここまで=====================

  // 🌟✅現在のエンティティレベル内の全てのエンティティが設定済みかどうかを判別するstate
  const [isAlreadySetState, setIsAlreadySetState] = useState(false);
  // ✅初回マウント時、エンティティレベル変更時、エンティティグループ追加、変更時に全て設定済みか再算出
  // const entityLevelIdsStr = entityLevelIds?.length > 0 ? entityLevelIds.join(", ") : "";
  // エンティティレベル, エンティティ追加
  // => addedEntityLevelsListQueryDataがinvalidateで更新
  // => useMemoでエンティティレベルidの配列が再生成
  // => entitiesHierarchyQueryDataのqueryKeyのentityLevelIdsStrが新しいidの追加によりqueryKeyが変化しエンティティ再フェッチ
  // => 追加したエンティティもentitiesHierarchyQueryDataに加わる
  // => entitiesHierarchyQueryDataの変化によりuseEffectでエンティティレベルごとにエンティティが振り分けられるentitiesHierarchyLocalが新しく更新される
  // => entitiesHierarchyLocalの変化によりuseEffectでentitiesHierarchyLocalの中で現在選択中のレベル(currentLevel)内の全てのエンティティのisConfirmを確認
  // => 全社~係レベルまではis_confirmed_annual_halfがcurrentLevel内のエンティティ全てtrueになっていればisAlreadySetStateがtrueに変化し、ステップ3の「目標を確定」ボタンをクリック可能にする(メンバーの場合はfirst_half_detailsかsecond_half_detailsのどちらか)
  useEffect(() => {
    if (currentLevel === "") {
      if (isAlreadySetState) setIsAlreadySetState(false);
      return;
    }
    // 現在のレベル内の上位エンティティごとのエンティティグループ
    const entityGroups = entitiesHierarchyLocal[currentLevel];

    // エンティティレベル内の全ての上位エンティティグループ内の全てのエンティティが設定済みかどうかをチェックする関数
    const checkAllEntitiesSet = (entityGroups: EntityGroupByParent[], currentLevel: EntityLevelNames) => {
      if (!entityGroups || entityGroups.length === 0) return false;
      // 「年度〜半期」の目標設定が全て完了しているならtrueに
      return entityGroups.every((entityGroup) => {
        const entities = entityGroup.entities;
        // 会社レベル〜係レベル
        if (currentLevel !== "member") {
          return entities.every((entity) => entity.is_confirmed_annual_half === true);
        }
        // メンバーレベル
        else {
          const isFirstHalf = selectedPeriodTypeForMemberLevel === "first_half_details";
          return entities.every((entity) => {
            if (isFirstHalf) {
              return entity.is_confirmed_first_half_details === true;
            } else {
              return entity.is_confirmed_second_half_details === true;
            }
          });
        }
      });
    };

    const isConfirm = checkAllEntitiesSet(entityGroups, currentLevel);

    setIsAlreadySetState(isConfirm);
  }, [entitiesHierarchyLocal, currentLevel, selectedPeriodTypeForMemberLevel]);

  // ===================== 🌟ユーザーが作成したエンティティのみのセクションリストを再生成🌟 =====================

  // ===================== 関数 =====================
  // 🌟目標設定モードを終了
  const handleCancelUpsert = () => {
    // setUpsertTargetMode(false);
    setUpsertTargetMode(null);
    setUpsertSettingEntitiesObj(null);
    // setUpsertTargetObj(null);
  };

  // ----------------------------- 🌟ステップ1 レベル「追加」をクリック🌟 -----------------------------
  // ステップ1, 「追加」クリック => レイヤー(レベル)を追加 ローカルstate
  const handleAddLevel = () => {
    // 選択中のレベルが既にMapに存在するならリターン
    if (addedEntityLevelsMapLocal && addedEntityLevelsMapLocal.has(selectedNextLevel)) return;

    // 現在のレベルから選択中の追加予定のレベルが飛び級をしていた場合にはリターン
    if (currentLevel === "" && selectedNextLevel !== "company")
      return alert("組織レイヤーは「全社」から追加してください。");
    if (currentLevel === "company" && !["department", "member"].includes(selectedNextLevel))
      return alert("全社レイヤーの下の階層は「事業部」か「メンバー」を追加してください。");
    if (currentLevel === "department" && !["section", "member"].includes(selectedNextLevel))
      return alert("事業部レイヤーの下の階層は「課・セクション」か「メンバー」を追加してください。");
    if (currentLevel === "section" && !["unit", "member"].includes(selectedNextLevel))
      return alert("課・セクションレイヤーの下の階層は「係・チーム」か「メンバー」を追加してください。");
    if (currentLevel === "unit" && !["member"].includes(selectedNextLevel))
      return alert("係・チームレイヤーの下の階層は「メンバー」を追加してください。");

    // if (addedEntityLevelsMapLocal && addedEntityLevelsMapLocal.has(currentLevel)) return;
    // 新たに追加するレベルオブジェクト
    const newLevel = {
      id: "",
      created_at: "",
      updated_at: null,
      fiscal_year_id: "",
      created_by_company_id: userProfileState.company_id,
      entity_level: selectedNextLevel,
      // entity_level: currentLevel,
      is_confirmed_annual_half: false,
      is_confirmed_first_half_details: false,
      is_confirmed_second_half_details: false,
      target_type: "sales_target",
      fiscal_year: upsertSettingEntitiesObj.fiscalYear,
    } as EntityLevels;

    const newAddedEntityLevelListLocal = [...addedEntityLevelsListLocal, newLevel];

    setAddedEntityLevelsListLocal(newAddedEntityLevelListLocal);

    // ✅追加したレベル内に先に全てのエンティティを追加しておき、ユーザーに追加の手間を省く(削除をしてもらう)
    // 新たに追加したレベルの上位エンティティごと(parent_entity_id)のエンティティグループ(entities)に最初は上位エンティティに紐づく全てのエンティティを追加する。(ユーザーには追加ではなく、ここから不要なエンティティを削除するアクションをステップ2で行ってもらう)
    let newEntityHierarchy: EntitiesHierarchy = cloneDeep(entitiesHierarchyLocal);
    let newEntityGroupByParent;
    if (selectedNextLevel === "company") {
      // if (currentLevel === "company") {
      newEntityGroupByParent = [
        {
          // parent_entity_id: "root",
          parent_entity_id: null,
          parent_entity_name: "root",
          entities: [
            {
              id: "",
              created_at: "",
              updated_at: "",
              fiscal_year_id: "",
              entity_level_id: "",
              parent_entity_level_id: "",
              target_type: "sales_target",
              entity_id: userProfileState.company_id,
              // parent_entity_id: "root",
              parent_entity_id: null,
              is_confirmed_annual_half: false,
              is_confirmed_first_half_details: false,
              is_confirmed_second_half_details: false,
              entity_name: userProfileState.customer_name,
              parent_entity_name: "root",
              // fiscal_yearsテーブル
              fiscal_year: upsertSettingEntitiesObj.fiscalYear,
              // entity_level_structuresテーブル
              entity_level: "company",
              parent_entity_level: "root",
            } as Entity,
          ],
        } as EntityGroupByParent,
      ];

      newEntityHierarchy = { ...newEntityHierarchy, company: newEntityGroupByParent };

      // 現在のレベルをcompanyにする
      setCurrentLevel("company");
    } else if (selectedNextLevel === "department") {
      // } else if (currentLevel === "department") {
      // 現在のレベルがdepartmentであればcompanyレベルは追加済みのため、必ずcompannyレベルのidは取得可能
      const companyEntityLevelId = addedEntityLevelsListLocal.find((level) => level.entity_level === "company")?.id;
      if (!companyEntityLevelId) return alert("予期せぬエラーが発生しました。");
      newEntityGroupByParent = [
        {
          parent_entity_id: userProfileState.company_id,
          parent_entity_name: userProfileState.customer_name,
          entities:
            departmentDataArray?.map(
              (obj) =>
                ({
                  id: "",
                  created_at: "",
                  updated_at: "",
                  fiscal_year_id: fiscalYearQueryData?.id ?? "", // companyレベル以外はfiscal_year_idはINSERT済み
                  entity_level_id: "",
                  parent_entity_level_id: companyEntityLevelId,
                  target_type: "sales_target",
                  entity_id: obj.id,
                  parent_entity_id: userProfileState.company_id,
                  is_confirmed_annual_half: false,
                  is_confirmed_first_half_details: false,
                  is_confirmed_second_half_details: false,
                  entity_name: obj.department_name,
                  parent_entity_name: userProfileState.customer_name,
                  // fiscal_yearsテーブル
                  fiscal_year: upsertSettingEntitiesObj.fiscalYear,
                  // entity_level_structuresテーブル
                  entity_level: "department",
                  parent_entity_level: "company",
                } as Entity)
            ) ?? [],
        } as EntityGroupByParent,
      ];

      newEntityHierarchy = { ...newEntityHierarchy, department: newEntityGroupByParent };

      // 現在のレベルを department にする
      setCurrentLevel("department");
    }
    // sectionを追加した場合は、確実に事業部を追加済みのためentitiesHierarchyLocalで追加した事業部のみのsectionを追加する
    else if (
      selectedNextLevel === "section" &&
      // currentLevel === "section" &&
      entitiesHierarchyLocal &&
      !!entitiesHierarchyLocal["department"]?.length &&
      sectionDataArray
    ) {
      // 現在のレベルがsectionであればdepartmentレベルは追加済みのため、必ずdepartmentレベルのidは取得可能
      const departmentEntityLevelId = addedEntityLevelsListLocal.find(
        (level) => level.entity_level === "department"
      )?.id;
      if (!departmentEntityLevelId) return alert("予期せぬエラーが発生しました。");
      // sectionエンティティを作成するために、上位レベルに追加されているdepartmentエンティティを全てflatMapで展開して、そのdepartment一つずつに対して紐づくsectionをentitiesにグループ化してセットする
      newEntityGroupByParent = entitiesHierarchyLocal["department"]
        .map((departmentGroupByCompany) => {
          return departmentGroupByCompany.entities.map((entityDepartment) => {
            // 上位エンティティとなる事業部idに一致するセクションを抽出してentitiesにセット
            const sections = sectionDataArray.filter(
              (section) => section.created_by_department_id === entityDepartment.entity_id
            );

            return {
              parent_entity_id: entityDepartment.entity_id,
              parent_entity_name: entityDepartment.entity_name,
              entities: sections.map((section) => {
                return {
                  id: "",
                  created_at: "",
                  updated_at: "",
                  fiscal_year_id: fiscalYearQueryData?.id ?? "",
                  entity_level_id: "",
                  parent_entity_level_id: departmentEntityLevelId,
                  target_type: "sales_target",
                  entity_id: section.id,
                  parent_entity_id: section.created_by_department_id,
                  is_confirmed_annual_half: false,
                  is_confirmed_first_half_details: false,
                  is_confirmed_second_half_details: false,
                  entity_name: section.section_name,
                  parent_entity_name:
                    departmentIdToObjMap?.get(section.created_by_department_id ?? "")?.department_name ?? "",
                  // fiscal_yearsテーブル
                  fiscal_year: upsertSettingEntitiesObj.fiscalYear,
                  // entity_level_structuresテーブル
                  entity_level: "section",
                  parent_entity_level: "department",
                } as Entity;
              }),
            };
          });
        })
        .flatMap((array) => array);

      newEntityHierarchy = { ...newEntityHierarchy, section: newEntityGroupByParent };
      // 現在のレベルを section にする
      setCurrentLevel("section");
    }
    // unitを追加した場合は、確実に事業部を追加済みのためentitiesHierarchyLocalで追加した事業部のみのunitを追加する
    else if (
      selectedNextLevel === "unit" &&
      // currentLevel === "unit" &&
      entitiesHierarchyLocal &&
      !!entitiesHierarchyLocal["section"]?.length &&
      unitDataArray
    ) {
      // 現在のレベルがunitであればsectionレベルは追加済みのため、必ずsectionレベルのidは取得可能
      const sectionEntityLevelId = addedEntityLevelsListLocal.find((level) => level.entity_level === "section")?.id;
      if (!sectionEntityLevelId) return alert("予期せぬエラーが発生しました。");

      // unitの直上のレベルで既に追加済みのsectionに紐づくunitをsectionIdごとにグループ化してentityHierarchyにセット
      newEntityGroupByParent = entitiesHierarchyLocal["section"]
        .map((sectionGroupByDepartment) => {
          return sectionGroupByDepartment.entities.map((entitySection) => {
            // 上位エンティティとなる事業部idに一致するセクションを抽出してentitiesにセット
            const units = unitDataArray.filter((unit) => unit.created_by_section_id === entitySection.entity_id);

            return {
              parent_entity_id: entitySection.entity_id,
              parent_entity_name: entitySection.entity_name,
              entities: units.map((unit) => {
                return {
                  id: "",
                  created_at: "",
                  updated_at: "",
                  fiscal_year_id: fiscalYearQueryData?.id ?? "",
                  entity_level_id: "",
                  parent_entity_level_id: sectionEntityLevelId,
                  target_type: "sales_target",
                  entity_id: unit.id,
                  parent_entity_id: unit.created_by_section_id,
                  is_confirmed_annual_half: false,
                  is_confirmed_first_half_details: false,
                  is_confirmed_second_half_details: false,
                  entity_name: unit.unit_name,
                  parent_entity_name: sectionIdToObjMap?.get(unit.created_by_section_id ?? "")?.section_name ?? "",
                  // fiscal_yearsテーブル
                  fiscal_year: upsertSettingEntitiesObj.fiscalYear,
                  // entity_level_structuresテーブル
                  entity_level: "unit",
                  parent_entity_level: "section",
                } as Entity;
              }),
            };
          });
        })
        .flatMap((array) => array);

      newEntityHierarchy = { ...newEntityHierarchy, unit: newEntityGroupByParent };
      // 現在のレベルを unit にする
      setCurrentLevel("unit");
      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥unitセット newEntityHierarchy", newEntityHierarchy, newEntityGroupByParent);
    } else if (selectedNextLevel === "member") {
      // } else if (currentLevel === "member") {
      // ✅メンバーの場合は、どのレベルから取得するかが、全社、事業部、課、係の中で不明のため、
      //

      // 現在のレベルを member にする
      setCurrentLevel("member");
    }

    if (newEntityGroupByParent) {
      // エンティティグループを更新
      setEntitiesHierarchyLocal(newEntityHierarchy);
      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥newEntityGroupByParent更新", newEntityGroupByParent);
    }

    // 追加したレベルは選択肢リストから取り除く
    const newLevelList = [...optionsEntityLevelList];
    const filteredList = newLevelList.filter((obj) => obj.title !== selectedNextLevel);
    // const filteredList = newLevelList.filter((obj) => obj.title !== currentLevel);

    // 選択中のレベルを次のレベルに移す メンバーレベルを追加していた場合はfilteredListはlengthが0になるので、この場合はmemberをセット
    setSelectedNextLevel(filteredList.length > 0 ? filteredList[0].title : "member");

    // 追加したレベルを除去したレベルリストで更新
    console.log("filteredList", filteredList, "newLevelList", newLevelList);
    setOptionsEntityLevelList(filteredList);

    console.log(
      "🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥newLevelList",
      newLevelList,
      "filteredList",
      filteredList,
      "newEntityGroupByParent",
      newEntityGroupByParent,
      "selectedNextLevel",
      selectedNextLevel,
      "unitDataArray",
      unitDataArray,
      "entitiesHierarchyLocal['section']",
      entitiesHierarchyLocal["section"]
    );

    // ステップを2に更新 次はレベル内にエンティティを追加、削除してレイヤー内の構成を確定させる
    setStep(2);

    // 0.1秒遅延して右端にスクロールさせる
    setTimeout(() => {
      if (scrollContentsAreaRef.current) {
        // エンティティレベルカラムが3つ以上で画面右端を超える場合にはヘッダーとサイドバーを固定してから右端にスクロールする
        if (newAddedEntityLevelListLocal.length > 3) {
          if (isStickyHeader === false) setIsStickyHeader(true); // ヘッダー固定
          if (isStickySidebar === false) setIsStickySidebar(true); // サイドバー固定
        }
        const scrollArea = scrollContentsAreaRef.current;
        const { width } = scrollArea.getBoundingClientRect();
        scrollArea.scrollTo({ top: 0, left: width, behavior: "smooth" });
      }
    }, 100);
  };
  // ----------------------------- 🌟ステップ1 レベル「追加」をクリック🌟 ここまで -----------------------------

  const [isLoadingSave, setIsLoadingSave] = useState(false);

  // ----------------------------- 🌟ステップ2 UPSERT「構成を確定」をクリック🌟 -----------------------------
  // 現在のレベルに追加したエンティティ構成をentity_structuresにINSERTして構成を確定する
  const handleSaveEntities = async () => {
    if (currentLevel === "") return alert("エラー：レイヤーが見つかりませんでした。先にレイヤーを追加してください。");
    // 既に会社レベルが存在する状態(fiscal_yearsテーブルへのINSERTが済んでいる状態)かを確認
    if (["department", "section", "unit", "member", "office"].includes(currentLevel)) {
      if (!fiscalYearQueryData) return alert("エラー：会計年度データが見つかりませんでした。");
    }

    const alertEntityName = mappingEntityName[currentLevel][language];

    // レベルが事業部〜係の場合は、メンバー所属なしのエンティティが構成に含まれている場合にはリターンして、リストから削除してもらうように要求
    if (["department", "section", "unit"].includes(currentLevel)) {
      // メンバー所属ありのエンティティが1つも存在しない場合にはリターンしてアラート
      if (entityIdsWithMembersSetObj === null) {
        return alert(
          `メンバーが所属する${alertEntityName}がありません。売上目標を設定するにはメンバーが所属する${alertEntityName}を1つ以上追加してください。`
        );
      }
      // 今回INSERTするエンティティのidのみの配列を作成し、メンバー所属なしエンティティが入っていないか確認
      if (isIncludeEntityWithoutMembers) {
        return alert(
          `メンバーが所属していない${alertEntityName}が含まれています。メンバーが1人以上所属している${alertEntityName}のみ残し、それ以外は目標リストから削除してください。`
        );
      }
    }

    // エンティティ INSERT用 entitiesHierarchyLocalから現在のエンティティレベルに対応するエンティティグループを取得してINSERTするエンティティグループにセットする
    // entitiesHierarchyLocal: {company: [], department: []. section: [], ...}
    if (!entitiesHierarchyLocal || !Object.keys(entitiesHierarchyLocal).includes(currentLevel))
      return alert("レイヤー内の部門データが見つかりませんでした。");

    const entityGroupsByParentArray = entitiesHierarchyLocal[currentLevel];

    setIsLoadingSave(true);
    try {
      // 下記3つのテーブルにINSERT
      // ・fiscal_yearsテーブル
      // ・entity_level_structuresテーブル
      // ・entity_structuresテーブル

      // fiscal_yearsテーブル INSERT用
      const periodStart = fiscalYearStartEndDate.startDate;
      const periodEnd = fiscalYearStartEndDate.endDate;

      // 現在のレベルの直上のレベルのidを取得 現在がcompanyレベルの場合は上位エンティティレベルidは存在しないためnull
      let parentEntityLevelId = null;
      if (currentLevel !== "company" && !!addedEntityLevelsListQueryData) {
        parentEntityLevelId =
          addedEntityLevelsListQueryData.find((levelObj) => levelObj.entity_level === parentEntityLevel)?.id ?? null;
      }

      if (!entityGroupsByParentArray) throw new Error("レイヤー内のデータが見つかりませんでした。");

      const entitiesDataArray = entityGroupsByParentArray
        .map((parent) => {
          return parent.entities.map((entityObj) => {
            const entityId = entityObj.entity_id;
            const parentEntityId = entityObj.parent_entity_id;

            let createdByCompanyId = userProfileState.company_id;
            let createdByDepartmentId = null;
            let createdBySectionId = null;
            let createdByUnitId = null;
            let createdByUserId = null;
            let createdByOfficeId = null;
            let parentCreatedByCompanyId = null;
            let parentCreatedByDepartmentId = null;
            let parentCreatedBySectionId = null;
            let parentCreatedByUnitId = null;
            let parentCreatedByUserId = null;
            let parentCreatedByOfficeId = null;

            if (currentLevel === "company") {
              // companyレベルの場合は、親は存在しないのでnullのまま
              createdByCompanyId = userProfileState.company_id;
            }
            if (currentLevel === "department") {
              parentCreatedByCompanyId = parentEntityId;
              createdByCompanyId = userProfileState.company_id;
              createdByDepartmentId = entityId;
            }
            if (currentLevel === "section") {
              parentCreatedByDepartmentId = parentEntityId;
              createdByCompanyId = userProfileState.company_id;
              createdByDepartmentId = sectionIdToObjMap?.get(entityId)?.created_by_department_id ?? null;
              createdBySectionId = entityId;
            }
            if (currentLevel === "unit") {
              parentCreatedBySectionId = parentEntityId;
              createdByCompanyId = userProfileState.company_id;
              createdByDepartmentId = unitIdToObjMap?.get(entityId)?.created_by_department_id ?? null;
              createdBySectionId = unitIdToObjMap?.get(entityId)?.created_by_section_id ?? null;
              createdByUnitId = entityId;
            }
            if (currentLevel === "member") {
              if (!parentEntityId) throw new Error("予期せぬエラーが発生しました。");
              if (parentEntityLevel === "company") {
                parentCreatedByCompanyId = parentEntityId;
              }
              if (parentEntityLevel === "department") {
                parentCreatedByDepartmentId = parentEntityId;
              }
              if (parentEntityLevel === "section") {
                parentCreatedBySectionId = parentEntityId;
              }
              if (parentEntityLevel === "unit") {
                parentCreatedByUnitId = parentEntityId;
              }
              const memberGroup =
                queryDataMemberGroupsByParentEntities &&
                Object.keys(queryDataMemberGroupsByParentEntities).includes(parentEntityId)
                  ? queryDataMemberGroupsByParentEntities[parentEntityId].member_group
                  : null;
              if (!memberGroup) throw new Error("メンバーデータが見つかりませんでした。");
              const memberObj = memberGroup.find((member) => member.id === entityId);
              if (!memberObj) throw new Error("メンバーデータが見つかりませんでした。");
              createdByDepartmentId = memberObj.assigned_department_id ?? null;
              createdBySectionId = memberObj.assigned_section_id ?? null;
              createdByUnitId = memberObj.assigned_unit_id ?? null;
              createdByUserId = memberObj.id;
            }
            if (currentLevel === "office") {
              parentCreatedByCompanyId = parentEntityId;
              createdByOfficeId = entityId;
            }

            return {
              created_by_company_id: createdByCompanyId,
              created_by_department_id: createdByDepartmentId,
              created_by_section_id: createdBySectionId,
              created_by_unit_id: createdByUnitId,
              created_by_user_id: createdByUserId,
              created_by_office_id: createdByOfficeId,
              parent_created_by_company_id: parentCreatedByCompanyId,
              parent_created_by_department_id: parentCreatedByDepartmentId,
              parent_created_by_section_id: parentCreatedBySectionId,
              parent_created_by_unit_id: parentCreatedByUnitId,
              parent_created_by_user_id: parentCreatedByUserId, // nullしかないが一応セットしておく
              parent_created_by_office_id: parentCreatedByOfficeId,
              is_confirmed_annual_half: false,
              is_confirmed_first_half_details: false,
              is_confirmed_second_half_details: false,
              entity_name: entityObj.entity_name,
              parent_entity_name: entityObj.parent_entity_name,
            };
          });
        })
        .flatMap((array) => array);

      // 現在のレベルがcompanyレベルではない場合で、上位エンティティレベルidが存在しない場合にはエラーを投げる
      if (currentLevel !== "company" && !parentEntityLevelId)
        throw new Error("上位レイヤーのデータが見つかりませんでした。");

      // 🔹fiscal_yearsテーブルにまだ年度を一度もINSERTしていないルート
      if (!fiscalYearQueryData) {
        const payload = {
          _company_id: userProfileState.company_id,
          _fiscal_year: upsertSettingEntitiesObj.fiscalYear, // fiscal_yearsテーブル用
          _period_start: periodStart, // fiscal_yearsテーブル用
          _period_end: periodEnd, // fiscal_yearsテーブル用
          _target_type: "sales_target",
          _entity_level: currentLevel, // entity_level_structuresテーブル用
          _parent_entity_level_id: parentEntityLevelId ?? null,
          _entity_groups_by_parent_entity: entitiesDataArray, // 上位エンティティに紐づく各エンティティグループ
        };

        console.log("🔥upsert_sales_target_year_level_entities 実行 payload", payload);

        // 年度、レベル、エンティティを全てUPSERT 初回INSERTルート
        const { error } = await supabase.rpc("upsert_sales_target_year_level_entities", payload);

        if (error) throw error;

        console.log("✅rpc upsert_sales_target_year_level_entities関数実行成功✅");

        // fiscal_years, entity_level_structures, entity_structuresテーブルのuseQueryキャッシュをinvalidate
        await queryClient.invalidateQueries(["fiscal_year", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
        await queryClient.invalidateQueries(["entity_levels", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
        // entity_structuresのキャッシュはentity_levelsキャッシュの再フェッチで新たにentityLevelIdsが生成され新たなqueryKeyが生成されるためinvalidate不要
        await new Promise((resolve) => setTimeout(resolve, 300));
        await queryClient.invalidateQueries(["entities", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
      }
      // 🔹既にfiscal_yearsテーブルに年度をINSERT済みで今回はレベルとエンティティのみINSERTルート(会社レベル以外のルート)
      else {
        const payload = {
          _company_id: userProfileState.company_id,
          _fiscal_year_id: fiscalYearQueryData.id, // 既に取得済みのfiscal_yearsテーブルのid
          _fiscal_year: fiscalYearQueryData.fiscal_year, // 既に取得済みのfiscal_yearsテーブルのid
          _target_type: "sales_target",
          _entity_level: currentLevel, // entity_level_structuresテーブル用
          _parent_entity_level_id: parentEntityLevelId ?? null,
          _entity_groups_by_parent_entity: entitiesDataArray, // 上位エンティティに紐づく各エンティティグループ
        };

        console.log("🔥upsert_sales_target_level_entities 実行 payload", payload);

        // レベルとエンティティのみUPSERT INSERT2回目ルート
        const { error } = await supabase.rpc("upsert_sales_target_level_entities", payload);

        if (error) throw error;

        console.log("✅rpc upsert_sales_target_level_entities関数実行成功✅");

        // entity_level_structuresテーブルのuseQueryキャッシュをinvalidate
        // await queryClient.invalidateQueries(["fiscal_year", "sales_target", upsertSettingEntitiesObj.fiscalYear]); fiscal_yearsテーブルにはUPSERTしていないためinvalidateは不要
        await queryClient.invalidateQueries(["entity_levels", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await queryClient.invalidateQueries(["entities", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
      }

      // レベル内のエンティティ構成が確定したら、ステップを3に移行
      setStep(3);
    } catch (error: any) {
      console.error("エラー：", error);
      toast.error("組織構成の保存に失敗しました...🙇‍♀️");
    }
    setIsLoadingSave(false);
  };
  // ----------------------- 🌟ステップ2 UPSERT「構成を確定」をクリック🌟 ここまで -----------------------
  // ----------------------- 🌟ステップ4 UPSERT「集計」をクリック🌟 -----------------------
  const handleAggregateQuarterMonth = async () => {
    if (!fiscalYearQueryData) return alert("売上目標年度データが見つかりませんでした。");
    if (!addedEntityLevelsListQueryData) return alert("レイヤーデータが見つかりませんでした。");
    // メンバー以外の現在取得されている
    // ・レベルごとに
    // ・上位エンティティidに紐づくエンティティグループごとに
    // 各エンティティidを渡して
    // 各エンティティidごとにエンティティidに紐づく下位エンティティ(最初はメンバーエンティティ)の
    // 上期or下期のQ1/Q2と月次の集計値をそのエンティティののQ1/Q2、月次目標に設定UPSERTする
    // これを全てのレベル、グループ、エンティティごとに行う

    // 事前に定義したレベルの順序をマッピング
    // メンバーレベルの直上レベルからUPSERTを行うため、memberレベルを除く末端レベルから並び替え
    const levelOrder = {
      unit: 1,
      section: 2,
      department: 3,
      company: 4,
    };

    try {
      setIsLoading(true); // ローディング開始

      // 🔹【会社〜係レベル】memberとofficeを除いたエンティティレベルのみの配列を作成
      const entityGroupsWithoutMember = Object.keys(entitiesHierarchyLocal)
        .filter((key): key is "company" | "department" | "section" | "unit" => key !== "member" && key !== "office")
        .sort((a, b) => levelOrder[a] - levelOrder[b]) // カスタム順序に基づいてソート
        .map((key) => {
          // 上位エンティティごとにグループ化されたエンティティグループ群
          const parentEntityGroup = entitiesHierarchyLocal[key];
          // 上位エンティティごとにグループ化されているエンティティを全て平坦化して「Entity[]」の形で返す
          const flattenEntities = parentEntityGroup.flatMap((group) => group.entities);
          const entityIds = flattenEntities.map((entity) => entity.entity_id);
          // idのみ
          // sales_targetsテーブルへのINSERT用にプロパティ内容を整形
          const formattedEntities = flattenEntities.map((entity) => {
            const entityId = entity.entity_id;
            let createdByCompanyId = userProfileState.company_id;
            let createdByDepartmentId = null;
            let createdBySectionId = null;
            let createdByUnitId = null;
            let createdByUserId = null;
            let createdByOfficeId = null;

            if (entity.entity_level === "company") {
            }
            if (entity.entity_level === "department") {
              createdByDepartmentId = entityId;
            }
            if (entity.entity_level === "section") {
              createdByDepartmentId = sectionIdToObjMap?.get(entityId)?.created_by_department_id ?? null;
              createdBySectionId = entityId;
            }
            if (entity.entity_level === "unit") {
              createdByDepartmentId = unitIdToObjMap?.get(entityId)?.created_by_department_id ?? null;
              createdBySectionId = unitIdToObjMap?.get(entityId)?.created_by_section_id ?? null;
              createdByUnitId = entityId;
            }
            // メンバーレベルの売上目標のINSERTは無いためmemberレベルの処理は無し
            if (entity.entity_level === "office") {
              createdByOfficeId = entityId;
            }

            // 半期詳細のis_confirmに関しては、今回の設定が「上期詳細」「下期詳細」に応じて動的に変更する
            let isConfirmedFirstHalf = false;
            let isConfirmedSecondHalf = false;

            if (selectedPeriodTypeForMemberLevel === "first_half_details") {
              isConfirmedFirstHalf = true;
              isConfirmedSecondHalf = entity.is_confirmed_second_half_details; // 現在のまま 既にtrueの場合はtrueをセット
            } else if (selectedPeriodTypeForMemberLevel === "second_half_details") {
              isConfirmedFirstHalf = entity.is_confirmed_first_half_details; // 現在のまま 既にtrueの場合はtrueをセット
              isConfirmedSecondHalf = true;
            }

            // sales_targets_arrayはFUNCTION内でSELECTクエリで集約する
            const salesTargetPayload = {
              entity_id: entity.entity_id,
              entity_level_id: entity.entity_level_id,
              entity_structure_id: entity.id,
              entity_name: entity.entity_name,
              parent_entity_name: entity.parent_entity_name,
              created_by_company_id: createdByCompanyId,
              created_by_department_id: createdByDepartmentId,
              created_by_section_id: createdBySectionId,
              created_by_unit_id: createdByUnitId,
              created_by_user_id: null, // 会社〜係レベルのINSERTのためnull
              created_by_office_id: null, // 会社〜係レベルのINSERTでは事業所に紐づくことはないのでnull
              is_confirmed_annual_half: entity.is_confirmed_annual_half, // 会社〜係レベルは既に「年度~半期」目標はINSERT済みのためそのまま
              is_confirmed_first_half_details: isConfirmedFirstHalf,
              is_confirmed_second_half_details: isConfirmedSecondHalf,
              // sales_targets_array: salesTargetObj.sales_targets, // FUNCTION内で集約して追加
            };
            /** salesTargetObj.sales_targets: inputSalesData[]
             * export type inputSalesData = {
                period_type: string;
                period: number; // 2024, 20241, 202401
                sales_target: number;
              };
             */
            return salesTargetPayload;
          });

          const entityLevelObj = addedEntityLevelsListQueryData.find((level) => level.entity_level === key);

          if (!entityLevelObj) throw new Error("レイヤーデータが見つかりませんでした。E01");

          // entity_level_structures用 半期詳細の今回の設定が「上期詳細」「下期詳細」に応じて動的に変更する
          let isConfirmedLevelFirstHalf = false;
          let isConfirmedLevelSecondHalf = false;

          if (selectedPeriodTypeForMemberLevel === "first_half_details") {
            isConfirmedLevelFirstHalf = true;
            isConfirmedLevelSecondHalf = entityLevelObj.is_confirmed_second_half_details; // 現在のまま 既にtrueの場合はtrueをセット
          } else if (selectedPeriodTypeForMemberLevel === "second_half_details") {
            isConfirmedLevelFirstHalf = entityLevelObj.is_confirmed_first_half_details; // 現在のまま 既にtrueの場合はtrueをセット
            isConfirmedLevelSecondHalf = true;
          }

          return {
            entity_level: key, // "company" | "department" | "section" | "unit"
            entity_level_id: entityLevelObj.id, // レベルid
            is_confirmed_annual_half: true, // 必ずtrue
            is_confirmed_first_half_details: isConfirmedLevelFirstHalf,
            is_confirmed_second_half_details: isConfirmedLevelSecondHalf,
            entities_data: formattedEntities,
            entity_ids: entityIds,
          };
        });

      /*
      Entity[][]: ユーザーがINSERTしたエンティティレベルごとにEntity[]を格納
      => [
        [係レベル内の全てのエンティティ],
        [課レベル内の全てのエンティティ],
        [事業部レベル内の全てのエンティティ],
        [全社レベル内の全てのエンティティ]
      ]
      */

      // 🔸UPSERT内容
      // 1. memberレベルに紐づくレベルを起点として全てのエンティティの「Q1/Q2 or Q3/Q4」と「月次」をUPSERT
      // 2. レベルごとのFOREACHループ内の各エンティティごとのFOREACHループの各イテレーションでsales_targetsテーブルに取り出した単一エンティティの各期間の売上目標のUPSERTが完了したら、entity_structuresテーブルのis_confirmed_xxx_half_detailsをtrueに更新する
      // 3. 各レベルごとに全てのエンティティの「上期詳細」or「下期詳細」のUPSERTが成功したら、entity_level_structuresテーブルのis_confirm_xxx_half_detailsカラムをtrueに更新する
      // 4. ユーザーが追加している年度の全てのレベルのis_confirm_xxx_half_detailsカラムがtrueに変更されていることが確認できたら
      //    fiscal_yearsテーブルのis_confirm_xxx_half_detailsをtrueに変更して、その年度の「上期詳細」or「下期詳細」を完成とする

      /*
      -- 🔹1. sales_targetsテーブルに各レベルのエンティティの「上期詳細 or 下期詳細」をUPSERT
      --      memberレベルに紐づくレベルを起点として全てのエンティティの「Q1/Q2 or Q3/Q4」と「月次」をUPSERT
      -- 🔹2. entity_structuresテーブルのis_confirmed_xxx_half_detailsをtrueに更新
      -- 🔹3. entity_level_structuresテーブルのis_confirm_xxx_half_detailsをtrueに更新
      -- 🔹4. fiscal_yearsテーブルのis_confirm_xxx_half_detailsをtrueに更新
      --      ユーザーが追加している年度の全てのレベルのis_confirm_xxx_half_detailsカラムがtrueに変更されていることが確認できたら
      --      fiscal_yearsテーブルのis_confirm_xxx_half_detailsをtrueに変更して、その年度の「上期詳細」or「下期詳細」を完成とする
      */
      /**   period_start_year_month: , // 会計年月
            period_end_year_month: , */

      // 上期詳細 or 下期詳細の開始年月と終了年月を算出してpayloadにセット
      const _settingFiscalYearDateObj = calculateFiscalYearStart({
        fiscalYearEnd: fiscalYearStartEndDate.endDate,
        fiscalYearBasis: userProfileState.customer_fiscal_year_basis ?? "firstDayBasis",
        selectedYear: upsertSettingEntitiesObj.fiscalYear,
      });

      if (!_settingFiscalYearDateObj) throw new Error("売上目標を追加する際に会計年度データを取得できませんでした。");

      const _fiscalStartYearMonth = calculateDateToYearMonth(
        _settingFiscalYearDateObj,
        fiscalYearStartEndDate.endDate.getDate()
      );

      const fiscalMonths = calculateFiscalYearMonths(_fiscalStartYearMonth);

      // 半期詳細の開始年月
      const periodStartYearMonth =
        selectedPeriodTypeForMemberLevel === "first_half_details" ? fiscalMonths.month_01 : fiscalMonths.month_07;
      // 半期詳細の終了年月
      const periodEndYearMonth =
        selectedPeriodTypeForMemberLevel === "first_half_details" ? fiscalMonths.month_06 : fiscalMonths.month_12;

      // fiscal_years用 半期詳細の今回の設定が「上期詳細」「下期詳細」に応じて動的に変更する
      let isConfirmedFiscalYearFirstHalf = false;
      let isConfirmedFiscalYearSecondHalf = false;

      if (selectedPeriodTypeForMemberLevel === "first_half_details") {
        isConfirmedFiscalYearFirstHalf = true;
        isConfirmedFiscalYearSecondHalf = fiscalYearQueryData.is_confirmed_second_half_details; // 現在のまま
      } else if (selectedPeriodTypeForMemberLevel === "second_half_details") {
        isConfirmedFiscalYearFirstHalf = fiscalYearQueryData.is_confirmed_first_half_details; // 現在のまま
        isConfirmedFiscalYearSecondHalf = true;
      }

      const payload = {
        _company_id: userProfileState.company_id,
        _fiscal_year: fiscalYearQueryData.fiscal_year,
        _fiscal_year_id: fiscalYearQueryData.id,
        _is_confirmed_first_half_details_fy: isConfirmedFiscalYearFirstHalf,
        _is_confirmed_second_half_details_fy: isConfirmedFiscalYearSecondHalf,
        _target_type: "sales_target",
        _half_detail_type: selectedPeriodTypeForMemberLevel,
        _period_start_year_month: periodStartYearMonth, // month_01 (下期詳細の場合の実際の値はmonth_07)
        _period_end_year_month: periodEndYearMonth, // month_06 (下期詳細の場合の実際の値はmonth_12)
        _upsert_entity_levels_array: entityGroupsWithoutMember,
      };

      console.log("🔥🔥🔥🔥🔥upsert_sales_target_half_details_all_entities関数実行 payload", payload);

      const { error } = await supabase.rpc("upsert_sales_target_half_details_all_entities", payload);

      // 0.3秒後に解決するPromiseの非同期処理を入れて明示的にローディングを入れる
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (error) {
        console.log("❌upsert_sales_target_half_details_all_entities関数実行失敗");
        throw error;
      }

      console.log("✅FUNCTION upsert_sales_target_half_details_all_entities関数実行成功 キャッシュを更新");

      // fiscal_years, entity_level_structures, entity_structuresのキャッシュを更新
      await queryClient.invalidateQueries(["fiscal_year", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
      // 全ての年度の売上目標設定状況を保持するキャッシュも更新する
      await queryClient.invalidateQueries(["fiscal_years", "sales_target"]);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await queryClient.invalidateQueries(["entity_levels", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
      await new Promise((resolve) => setTimeout(resolve, 300));
      await queryClient.invalidateQueries(["entities", "sales_target", upsertSettingEntitiesObj.fiscalYear]);

      setIsLoading(false); // ローディング終了
      toast.success(
        `全レイヤーの${
          selectedPeriodTypeForMemberLevel === "first_half_details" ? `上期` : `下期`
        }の売上目標の設定が完了しました！🌟`
      );

      // 🔹ステップ5の完了画面に移行 UPSERT後のクライアントサイドの処理
      // 1. ステップ5に移行して、ユーザーに「完成した半期詳細の内容を確認させる or リセットして改めて目標を設定させる」か、「残りの半期詳細を設定するためにstep3に移行させるか」を選択させる画面を表示する
      setStep(5);
      runFireworks();
    } catch (error: any) {
      console.error("エラー：", error);
      toast.error(`売上目標の集計と全レイヤーへの反映に失敗しました...🙇‍♀️`);
      setIsLoading(false); // ローディング終了
    }
  };
  // ----------------------- 🌟ステップ4 UPSERT「集計」をクリック🌟 ここまで -----------------------

  const [resetTargetType, setResetTargetType] = useState<"half_detail" | "fiscal_year">("half_detail");
  const mappingResetType: { [K in "half_detail" | "fiscal_year"]: { [key: string]: string } } = {
    half_detail: {
      ja: `${selectedPeriodTypeForMemberLevel === "first_half_details" ? `上期詳細` : `下期詳細`}`,
      en: `${selectedPeriodTypeForMemberLevel === "first_half_details" ? `First Half` : `Second Half`}`,
    },
    fiscal_year: {
      ja: `${upsertSettingEntitiesObj.fiscalYear}年度`,
      en: `${upsertSettingEntitiesObj.fiscalYear}`,
    },
  };
  const [isOpenResetTargetModal, setIsOpenResetTargetModal] = useState(false);
  // ----------------------- 🌟ステップ3で設定したメンバーレベルの目標のみリセット🌟 ここまで -----------------------
  // ステップ3のメンバーレベルで半期詳細の売上目標のみ設定している状態、ステップ4の全レイヤーの半期詳細を集計していない状態(fiscal_yearsテーブルのis_confirmed_xxx_half_detailsがfalseの状態)
  // ----------------------- 🌟ステップ3で設定したメンバーレベルの目標のみリセット🌟 -----------------------

  // ----------------------- 🌟ステップ5 半期詳細をリセット(メンバーレベルからやり直し)🌟 ここまで -----------------------

  // ----------------------- 🌟ステップ5 半期詳細をリセット(メンバーレベルからやり直し)🌟 -----------------------

  // ----------------------- 🌟ステップ5 半期詳細をリセット(メンバーレベルからやり直し)🌟 ここまで -----------------------

  // ----------------------- 🌟ステップ5 半期詳細をリセット(メンバーレベルからやり直し)🌟 -----------------------

  // ----------------------- 🌟エンティティ目標設定モード終了🌟 -----------------------
  const handleCloseSettingEntitiesTarget = () => {
    // return console.log("リターン");
    setUpsertSettingEntitiesObj({
      ...upsertSettingEntitiesObj,
      parentEntityLevelId: "",
      parentEntityLevel: "",
      parentEntityId: "",
      parentEntityName: "",
      entityLevel: "",
      entities: [],
    });
    setIsSettingTargetMode(false);
  };
  // ----------------------- 🌟エンティティ目標設定モード終了🌟 -----------------------

  //
  const getEntityTargetTitle = (
    entityLevel: string,
    obj: Department | Section | Unit | Office | (MemberAccounts & { company_id: string; company_name: string })
  ) => {
    switch (entityLevel) {
      case "department":
        return (obj as Department).department_name ?? "-";
      case "section":
        return (obj as Section).section_name ?? "-";
      case "unit":
        return (obj as Unit).unit_name ?? "-";
      case "office":
        return (obj as Office).office_name ?? "-";
      case "member":
        return (obj as MemberAccounts).profile_name ?? "-";

      default:
        return "-";
        break;
    }
  };

  // エンティティリスト編集モード
  const [isOpenEditEntityListByParentModal, setIsOpenEditEntityListByParentModal] = useState(false);
  // 現在編集中の上位エンティティ
  const [editParentEntity, setEditParentEntity] = useState<{ id: string; name: string } | null>(null);
  // エンティティリスト編集 グループ内の全てのリスト
  const [editAllEntityListByParent, setEditAllEntityListByParent] = useState<
    (MemberAccounts & { company_id: string; company_name: string })[] | Department[] | Section[] | Unit[] | Office[]
  >([]);
  // 選択中のアクティブなエンティティ
  const [selectedActiveItemIdsMap, setSelectedActiveItemIdsMap] = useState<
    Map<string, Department | Section | Unit | Office | (MemberAccounts & { company_id: string; company_name: string })>
  >(new Map());
  // 選択中の非アクティブなエンティティ
  const [selectedInactiveItemIdsMap, setSelectedInactiveItemIdsMap] = useState<
    Map<string, Department | Section | Unit | Office | (MemberAccounts & { company_id: string; company_name: string })>
  >(new Map());
  // 現在表示中のエンティティリストMap
  const [editCurrentDisplayEntityMapInParentGroup, setEditCurrentDisplayEntityMapInParentGroup] = useState<
    Map<string, Entity>
  >(new Map());

  // ----------------------- 🌟エンティティリスト編集モーダルを開く🌟 -----------------------
  const handleOpenEditEntityListByParentModal = ({ parentEntityId }: { parentEntityId: string }) => {
    if (currentLevel === "") return alert("有効なレイヤーが見つかりませんでした。");
    const getEntityListArray = (parentEntityId: string) => {
      let currentEntityListAll:
        | (MemberAccounts & { company_id: string; company_name: string })[]
        | Department[]
        | Section[]
        | Unit[]
        | Office[] = [];
      let filteredEntityListByParent:
        | (MemberAccounts & { company_id: string; company_name: string })[]
        | Department[]
        | Section[]
        | Unit[]
        | Office[] = [];
      switch (currentLevel) {
        case "department":
          currentEntityListAll = departmentDataArray ? [...departmentDataArray] : [];
          filteredEntityListByParent = currentEntityListAll.filter(
            (department) => department.created_by_company_id === parentEntityId
          );
          return filteredEntityListByParent;
        case "section":
          currentEntityListAll = sectionDataArray ? [...sectionDataArray] : [];
          filteredEntityListByParent = currentEntityListAll.filter(
            (section) => section.created_by_department_id === parentEntityId
          );
          return filteredEntityListByParent;
        case "unit":
          currentEntityListAll = unitDataArray ? [...unitDataArray] : [];
          filteredEntityListByParent = currentEntityListAll.filter(
            (unit) => unit.created_by_section_id === parentEntityId
          );
          return filteredEntityListByParent;
        case "office":
          currentEntityListAll = officeDataArray ? [...officeDataArray] : [];
          filteredEntityListByParent = currentEntityListAll.filter(
            (office) => office.created_by_company_id === parentEntityId
          );
          return filteredEntityListByParent;
        case "member":
          if (!queryDataMemberGroupsByParentEntities) return [];
          const memberGroupByParentEntity = queryDataMemberGroupsByParentEntities[parentEntityId].member_group;
          currentEntityListAll = [...memberGroupByParentEntity] ?? [];
          if (parentEntityLevel === "company") {
            filteredEntityListByParent = currentEntityListAll.filter((member) => member.company_id === parentEntityId);
          }
          if (parentEntityLevel === "department") {
            filteredEntityListByParent = currentEntityListAll.filter(
              (member) => member.assigned_department_id === parentEntityId
            );
          }
          if (parentEntityLevel === "section") {
            filteredEntityListByParent = currentEntityListAll.filter(
              (member) => member.assigned_section_id === parentEntityId
            );
          }
          if (parentEntityLevel === "unit") {
            filteredEntityListByParent = currentEntityListAll.filter(
              (member) => member.assigned_unit_id === parentEntityId
            );
          }
          return filteredEntityListByParent;
        default:
          return [];
          break;
      }
    };

    // モーダルで表示する編集を行うエンティティグループの全てのエンティティリスト
    const allEntityListByCurrentParent = getEntityListArray(parentEntityId) as
      | (MemberAccounts & { company_id: string; company_name: string })[]
      | Department[]
      | Section[]
      | Unit[]
      | Office[];
    setEditAllEntityListByParent(allEntityListByCurrentParent);

    // 現在グループ内に表示中のエンティティリストをMapで保持
    const currentDisplayEntityGroup = entitiesHierarchyLocal[currentLevel].find(
      (group) => group.parent_entity_id === parentEntityId
    );
    if (!currentDisplayEntityGroup) return alert("リストデータが見つかりませんでした。");
    if (!currentDisplayEntityGroup.parent_entity_id) return alert("上位のリスト元データが見つかりませんでした。");
    const currentDisplayEntityMapInParentGroup = new Map(
      currentDisplayEntityGroup.entities.map((entity) => [entity.entity_id, entity])
    );
    setEditCurrentDisplayEntityMapInParentGroup(currentDisplayEntityMapInParentGroup);

    // 編集中の親エンティティ
    setEditParentEntity({
      id: currentDisplayEntityGroup.parent_entity_id,
      name: currentDisplayEntityGroup.parent_entity_name,
    });

    // リスト編集モーダルを開く
    setIsOpenEditEntityListByParentModal(true);
  };
  // ----------------------- 🌟エンティティリスト編集モーダルを開く🌟 -----------------------

  // ----------------------- 🌟step2の構成を確定時メンバー所属有無確認用🌟 -----------------------
  const entityIdsWithMembersSetObj = useDashboardStore((state) => state.entityIdsWithMembersSetObj);
  // EntityLevelColumnコンポーネント(各エンティティレベルごとのカラム)内で
  // const setEntityIdsWithMembersSetObj = useDashboardStore((state) => state.setEntityIdsWithMembersSetObj);

  // step2のエンティティ構成確定時のメンバー所属なしエンティティがリスト含まれている場合に、確定ボタンを非アクティブにしてクリック時にはリターンさせる
  // 🌟現在のエンティティレベルの各上位レベルのエンティティグループに紐づく全てのエンティティのidを作成
  const entityIdsForInsert = useMemo(() => {
    // ステップ2の構成を確定の時のみ作成
    if (currentLevel === "") return null;
    if (step !== 2) return null;
    if (!entitiesHierarchyLocal) return null;
    if (!Object.keys(entitiesHierarchyLocal).includes(currentLevel)) return null;
    const entityGroupsByParentArray = entitiesHierarchyLocal[currentLevel];
    // 現在のレベルの全てエンティティidをまとめた配列を生成
    const newEntityIdsForInsert = entityGroupsByParentArray
      .map((group) => group.entities.map((entity) => entity.entity_id))
      .flatMap((array) => array);
    return newEntityIdsForInsert;
  }, [currentLevel, entitiesHierarchyLocal, step]);

  // 🌟メンバーが所属していないエンティティが含まれているか否か 1つでも含まれている場合はtrueを返す
  const isIncludeEntityWithoutMembers = useMemo(() => {
    if (step !== 2) return true;
    if (!entityIdsForInsert) return true;
    if (entityIdsWithMembersSetObj === null) return true;

    // 1つでもメンバー所属ありのid群に含まれていないidがINSERT用のid配列に含まれているならtrueを返す
    return entityIdsForInsert.some((id) => !entityIdsWithMembersSetObj.has(id));
  }, [entityIdsForInsert, entityIdsWithMembersSetObj]);
  // ----------------------- 🌟step2の構成を確定時メンバー所属有無確認用🌟 -----------------------

  // ----------------------- 🌟エンティティリスト編集モーダルを閉じる🌟 -----------------------

  const handleCloseEditEntityListByParentModal = () => {
    // メンバー所属なしのエンティティが残っている場合は、リストから削除を要求する
    // 編集中のエンティティグループ内での表示中のエンティティの配列
    const editingCurrentDisplayEntitiesIds = Array.from(editCurrentDisplayEntityMapInParentGroup.keys());
    if (
      currentLevel !== "member" &&
      editingCurrentDisplayEntitiesIds.some(
        (id) => !(entityIdsWithMembersSetObj !== null && entityIdsWithMembersSetObj.has(id))
      )
    ) {
      const alertEntityName = currentLevel !== "" ? mappingEntityName[currentLevel][language] : `部門`;
      return alert(
        `メンバーが所属していない${alertEntityName}が含まれています。メンバーが1人以上所属している${alertEntityName}のみ残し、それ以外は目標リストから削除してください。`
      );
    }

    setEditParentEntity(null);
    setEditAllEntityListByParent([]);
    if (selectedActiveItemIdsMap.size > 0) setSelectedActiveItemIdsMap(new Map());
    if (selectedInactiveItemIdsMap.size > 0) setSelectedInactiveItemIdsMap(new Map());
    setEditCurrentDisplayEntityMapInParentGroup(new Map());
    setIsOpenEditEntityListByParentModal(false);
    // メンバー所属ありエンティティidSetオブジェクトのZustandをリセット => リセットせずにそのまま保持しておく
    // if (entityIdsWithMembersSetObj !== null) setEntityIdsWithMembersSetObj(null);
  };
  // ----------------------- 🌟エンティティリスト編集モーダルを閉じる🌟 -----------------------

  // ----------------------- 🌟エンティティリスト編集モーダル 追加・削除🌟 -----------------------
  const handleUpdateEntityList = async (updateType: "add" | "remove") => {
    if (currentLevel === "") return alert("有効なレイヤーが見つかりませんでした。");
    if (!editParentEntity) return alert("上位レイヤーデータが見つかりませんでした。");

    // 全てのエンティティグループを削除しようとしている場合はリターンさせる
    if (updateType === "remove") {
      if (editCurrentDisplayEntityMapInParentGroup.size === selectedActiveItemIdsMap.size)
        return alert(
          "リストから全ての部門を削除はできません。リスト内には売上目標に関わる1つ以上の部門を追加してください。"
        );
    }

    setIsLoading(true); // ローディング開始

    try {
      console.log(
        "selectedInactiveItemIdsMap",
        selectedInactiveItemIdsMap,
        "selectedActiveItemIdsMap",
        selectedActiveItemIdsMap
      );

      if (updateType === "add") {
        // 親レベルテーブルのid
        const parentLevel = addedEntityLevelsListQueryData?.find((level) => level.entity_level === parentEntityLevel);

        // Mapのstateをシャローコピー
        const newDisplayEntityGroupMap = new Map(editCurrentDisplayEntityMapInParentGroup);

        // 非表示中のエンティティを追加、セットする
        [...selectedInactiveItemIdsMap.values()].forEach((item) => {
          if (!newDisplayEntityGroupMap.has(item.id)) {
            newDisplayEntityGroupMap.set(item.id, {
              id: "",
              created_at: "",
              updated_at: "",
              fiscal_year_id: fiscalYearQueryData?.id ?? "",
              entity_level_id: "", // step2の確定ボタンでINSERT
              parent_entity_level_id: parentLevel?.id,
              target_type: "sales_target",
              entity_id: item.id,
              parent_entity_id: editParentEntity.id,
              is_confirmed_annual_half: false,
              is_confirmed_first_half_details: false,
              is_confirmed_second_half_details: false,
              entity_name: getEntityTargetTitle(currentLevel, item),
              parent_entity_name: editParentEntity.name,
              // fiscal_yearsテーブル
              fiscal_year: fiscalYearQueryData?.fiscal_year,
              // entity_level_structuresテーブル
              entity_level: currentLevel,
              parent_entity_level: parentEntityLevel,
            } as Entity);
          }
        });

        const newEntities = [...newDisplayEntityGroupMap.values()];

        const newEntityGroupByParent = {
          parent_entity_id: editParentEntity.id,
          parent_entity_name: editParentEntity.name,
          entities: newEntities,
        } as EntityGroupByParent;

        // エンティティヒエラルキーを更新
        const copiedEntitiesHierarchy = cloneDeep(entitiesHierarchyLocal);
        // 現在リスト編集中の上位エンティティグループのみ新たなnewEntityGroupByParentをセットする
        copiedEntitiesHierarchy[currentLevel] = copiedEntitiesHierarchy[currentLevel].map((group) => {
          if (group.parent_entity_id !== editParentEntity.id) return group;
          return newEntityGroupByParent;
        });

        // 実際のリストを更新
        setEntitiesHierarchyLocal(copiedEntitiesHierarchy);

        // モーダル内のリストも更新
        // 現在表示中のリストのMapのstateを更新
        setEditCurrentDisplayEntityMapInParentGroup(newDisplayEntityGroupMap);
        // 選択中の非表示エンティティをリセット
        setSelectedInactiveItemIdsMap(new Map());
      }
      // リストから削除
      else if (updateType === "remove") {
        // Mapのstateをシャローコピー
        const newDisplayEntityGroupMap = new Map(editCurrentDisplayEntityMapInParentGroup);
        // 現在表示中で選択中のエンティティを削除する
        [...selectedActiveItemIdsMap.values()].forEach((item) => {
          if (newDisplayEntityGroupMap.has(item.id)) {
            newDisplayEntityGroupMap.delete(item.id);
          }

          const newEntities = [...newDisplayEntityGroupMap.values()];

          const newEntityGroupByParent = {
            parent_entity_id: editParentEntity.id,
            parent_entity_name: editParentEntity.name,
            entities: newEntities,
          } as EntityGroupByParent;

          // エンティティヒエラルキーを更新
          const copiedEntitiesHierarchy = cloneDeep(entitiesHierarchyLocal);
          // 現在リスト編集中の上位エンティティグループのみ新たなnewEntityGroupByParentをセットする
          copiedEntitiesHierarchy[currentLevel] = copiedEntitiesHierarchy[currentLevel].map((group) => {
            if (group.parent_entity_id !== editParentEntity.id) return group;
            return newEntityGroupByParent;
          });

          // 実際のリストを更新
          setEntitiesHierarchyLocal(copiedEntitiesHierarchy);

          // モーダル内のリストも更新
          // 現在表示中のリストのMapのstateを更新
          setEditCurrentDisplayEntityMapInParentGroup(newDisplayEntityGroupMap);
          // 選択中の非表示エンティティをリセット
          setSelectedActiveItemIdsMap(new Map());
        });
      }

      toast.success(updateType === "add" ? `目標リストに追加しました🌟` : `目標リストから削除しました🌟`);
    } catch (error: any) {
      console.error("エラー：", error);
      toast.error(
        updateType === "add" ? `目標リストへの追加に失敗しました...🙇‍♀️` : "目標リストからの削除に失敗しました...🙇‍♀️"
      );
    }
    setIsLoading(false); // ローディング終了

    // const { error } = await supabase.from(updatedTable).update(updatedPayload).in("id", updatedEntityIds);

    // if (error) throw error;

    // // キャッシュの部門からsales_targetをnullに更新する
    // let queryKey = "departments";
    // if (currentLevel === "department") queryKey = "departments";
    // if (currentLevel === "section") queryKey = "sections";
    // if (currentLevel === "unit") queryKey = "units";
    // if (currentLevel === "office") queryKey = "offices";
    // if (currentLevel === "member") queryKey = "member_accounts";
    // const prevCache = queryClient.getQueryData([queryKey]) as
    //   | Department[]
    //   | Section[]
    //   | Unit[]
    //   | Office[]
    //   | MemberAccounts[];
    // let newCache = [...prevCache]; // キャッシュのシャローコピーを作成
    // // 更新対象のオブジェクトのtarget_typeをsales_target or nullに変更
    // newCache = newCache.map((obj) =>
    //   updatedEntityIdsMap.has(obj.id) ? { ...obj, target_type: newTargetType } : obj
    // );
    // console.log("キャッシュを更新 newCache", newCache);
    // queryClient.setQueryData([queryKey], newCache); // キャッシュを更新

    // if (updateType === "remove") {
    //   // 固定していた場合は固定を解除
    //   if (!!stickyRow && updatedEntityIdsMap.has(stickyRow)) {
    //     setStickyRow(null);
    //   }
    // }

    // サブ目標リストを更新
    // const newList = newCache.filter((obj) => obj.target_type === "sales_target") as
    //   | Department[]
    //   | Section[]
    //   | Unit[]
    //   | Office[]
    //   | MemberAccounts[];
    // setSubTargetList(newList);

    // モーダル内のリストを更新
    // setEditSubList(newCache as MemberAccounts[] | Department[] | Section[] | Unit[] | Office[]);
  };
  // ----------------------- 🌟エンティティリスト編集モーダル 追加・削除🌟 -----------------------

  // ===================== 関数 =====================

  // --------------------- ポップアップメニュー関連 ---------------------
  const sectionMenuRef = useRef<HTMLDivElement | null>(null);

  // ---------------------🔹ポップアップメニュー
  const [openSectionMenu, setOpenSectionMenu] = useState<{
    x?: number;
    y: number;
    title?: string;
    displayX?: string;
    maxWidth?: number;
    minWidth?: number;
    fadeType?: string;
  } | null>(null);
  // 適用、戻るメニュー
  const [openSubMenu, setOpenSubMenu] = useState<{
    display: string;
    fadeType: string;
    sectionMenuWidth?: number;
  } | null>(null);

  const handleOpenSectionMenu = ({ e, title, displayX, maxWidth, minWidth, fadeType }: SectionMenuParams) => {
    if (!displayX || displayX === "center") {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      const positionY = y + height + 6;
      let positionX = x;
      if (displayX === "center") positionX = x + width / 2;
      console.log("クリック", y, x, positionX);
      setOpenSectionMenu({
        y: positionY,
        x: positionX,
        title: title,
        displayX: displayX,
        fadeType: fadeType,
        maxWidth: maxWidth,
        minWidth: minWidth,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      let positionY = y;
      if (displayX === "right") {
        positionX = -18 - 50 - (maxWidth ?? 400);
      } else if (displayX === "left") {
        positionX = window.innerWidth - x;
      } else if (displayX === "bottom_left") {
        positionX = window.innerWidth - x - width;
        positionY = y + height + 6;
      }
      // positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      // positionX = displayX === "left" ? window.innerWidth - x : 0;
      // positionX = displayX === "bottom_left" ? window.innerWidth - x - width : 0;
      // positionY = displayX === "bottom_left" ? y + height : y;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenSectionMenu({
        x: positionX,
        y: positionY,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        minWidth: minWidth,
        fadeType: fadeType,
      });
    }
  };
  // メニューを閉じる
  const handleCloseSectionMenu = () => {
    if (openSectionMenu?.title === "settingSalesTarget") {
      setOpenPopupMenu(null);
      setOpenSubMenu(null);
      // setActiveEntityLocal(null);
    }

    setOpenSectionMenu(null);
  };

  // ---------------------🔹説明メニュー
  // 説明メニュー(onClickイベントで開いてホバー可能な状態はisHoverableをtrueにする)
  const [openPopupMenu, setOpenPopupMenu] = useState<{
    x?: number;
    y: number;
    title: string;
    displayX?: string;
    maxWidth?: number;
    minWidth?: number;
    fadeType?: string;
    isHoverable?: boolean;
    sectionMenuWidth?: number;
  } | null>(null);

  const handleOpenPopupMenu = ({
    e,
    title,
    displayX,
    maxWidth,
    minWidth,
    fadeType,
    isHoverable,
    sectionMenuWidth,
  }: PopupDescMenuParams) => {
    if (!displayX) {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      const positionY = y + height + 6;
      const positionCenter = x;
      console.log("クリック", y);
      setOpenPopupMenu({
        y: positionY,
        x: positionCenter,
        title: title,
        fadeType: fadeType,
        isHoverable: isHoverable,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      let positionX = 0;
      let positionY = y;
      if (displayX === "right") {
        positionX = x + width + 6;
        // positionX = -18 - 50 - (maxWidth ?? 400);
      } else if (displayX === "left") {
        positionX = window.innerWidth - x + 6;
      } else if (displayX === "bottom_left" && sectionMenuWidth) {
        positionX = window.innerWidth - x - width + sectionMenuWidth + 6;
        positionY = y + height + 6;
      }
      // positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 0;
      // positionX = displayX === "left" ? window.innerWidth - x : 0;
      console.log("クリック", displayX, e, x, y, width, height);

      setOpenPopupMenu({
        x: positionX,
        y: positionY,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
        minWidth: minWidth,
        fadeType: fadeType,
        isHoverable: isHoverable,
      });
    }
  };

  // メニューを閉じる
  const handleClosePopupMenu = () => {
    setOpenPopupMenu(null);
  };

  // ポップアップのフェードタイプ
  const getFadeTypeClass = (fadeType: string) => {
    if (fadeType === "fade_down") return styles.fade_down;
    if (fadeType === "fade_up") return styles.fade_up;
    if (fadeType === "fade") return styles.fade;
  };
  // --------------------- ポップアップメニュー関連 ここまで ---------------------
  // --------------------- メニュー liコンテンツ挿入用 ---------------------
  type DescriptionProps = { title?: string; content: string; content2?: string; withDiv?: boolean };
  const DescriptionList = ({ title, content, content2, withDiv = true }: DescriptionProps) => {
    return (
      <>
        {title && (
          <li className={`${styles.description_section_title} flex min-h-max w-full font-bold`}>
            <div className="flex max-w-max flex-col">
              <span>{title}</span>
              <div className={`${styles.underline} w-full`} />
            </div>
          </li>
        )}
        <li className={`${styles.description_list_item} flex  w-full flex-col space-y-1 `}>
          <p className="select-none whitespace-pre-wrap text-[12px] leading-[20px]">{content}</p>
          {content2 && <p className="select-none whitespace-pre-wrap text-[12px] leading-[20px]">{content2}</p>}
        </li>

        {withDiv && <hr className="min-h-[1px] w-full bg-[#999]" />}
      </>
    );
  };
  // --------------------- メニュー liコンテンツ挿入用 ここまで ---------------------

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content?: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    marginTop = 0,
    itemsPosition = "center",
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);

    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: ((e.target as HTMLDivElement).dataset.text as string) || (content ?? ""),
      content2: content2,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPos) setHoveredItemPos(null);
  };
  // ==================================================================================

  // 手順の説明文
  const descriptionStep = [
    {
      title: "売上目標に関わる組織構成を決める",
      content: `手順のステップ1~3を繰り返す形で、${upsertSettingEntitiesObj.fiscalYear}年度の売上目標に関わるレイヤーを「全社とメンバー」レイヤー間の「事業部・課/セクション・係/チーム」はお客様の独自の組織構成に合わせて上位階層からレイヤーを追加していき、売上目標を段階的に設定しましょう！`,
    },
    {
      title: "売上目標の設定",
      content:
        "全社から係までのレイヤーでは「年度・半期」の売上目標を上位階層から設定していきます。\nメンバーレイヤーでは各メンバーの「上期内の半期から月次」もしくは「下期内の半期から月次」までの売上目標をメンバーの案件状況や受注見込みを考慮して設定しましょう。",
    },
    {
      title: "四半期・月次目標を上位レイヤーに反映",
      content: `メンバーレイヤーの半期から月次の売上目標の設定が完了した後、ステップ4で全てのメンバーの四半期・月次の売上目標を集計し、全社までの上位レイヤーの四半期・月次の売上目標に反映することで${upsertSettingEntitiesObj.fiscalYear}年度の売上目標が完成となります！`,
    },
  ];

  const mappingDescriptions: { [key: string]: { [key: string]: string }[] } = {
    step: descriptionStep,
  };

  // インラインスタイル
  // 上部のステップライン
  const getActiveSteps = (num: number) =>
    step === num
      ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
      : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-sub)]`;
  // 手順のステップ
  const getActiveStep = (num: number) =>
    step === num
      ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
      : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-disabled)]`;
  // 手順の説明文
  const getActiveDesc = (num: number) =>
    step === num ? `text-[var(--color-text-title)]` : `text-[var(--color-text-disabled)]`;
  // ステップヘッダーの次へボタン アクティブか非アクティブか
  const styleStepNextBtn = () => {
    // const activeStyle = `bg-[var(--color-bg-brand-f)] cursor-pointer hover:bg-[var(--color-bg-brand-f-deep)] text-[#fff] brand_btn_active`;
    const activeStyle = `brand_btn_active`;
    const inactiveStyle = `bg-[var(--color-bg-brand-f-disabled)] cursor-not-allowed text-[var(--color-text-disabled-on-brand)]`;
    if (step === 2) {
      if (currentLevel === "company") return activeStyle;
      // エンティティレベル内の上位エンティティごとのエンティティリストが１つ以上、かつ、全てのエンティティがメンバー所属ありならアクティブ、エンティティが0、または、メンバー未所属のエンティティが含まれている場合は非アクティブ
      if (
        currentLevel === "department" &&
        (entitiesHierarchyLocal["department"].length === 0 || isIncludeEntityWithoutMembers)
      )
        return inactiveStyle;
      if (
        currentLevel === "section" &&
        (entitiesHierarchyLocal["section"].length === 0 || isIncludeEntityWithoutMembers)
      )
        return inactiveStyle;
      if (currentLevel === "unit" && (entitiesHierarchyLocal["unit"].length === 0 || isIncludeEntityWithoutMembers))
        return inactiveStyle;
      // メンバーレベルでは、メンバー所属有無は関係なし
      if (currentLevel === "member" && entitiesHierarchyLocal["member"].length === 0) return inactiveStyle;
      if (currentLevel === "office" && (entitiesHierarchyLocal["office"].length === 0 || isIncludeEntityWithoutMembers))
        return inactiveStyle;
    }
    // レイヤー内の全てのエンティティの目標が設定済みかどうかを判別する
    if (step === 3) {
      if (isAlreadySetState) return activeStyle;
      return inactiveStyle;
    }
    return activeStyle;
  };

  // ステップ3のアラートテキスト
  const alertTextNextBtn3 = () => {
    if (currentLevel === "company") {
      return `会社・チームの目標がまだ設定されていません。「目標設定」ボタンから会社・チームの目標設定が完了した後に「次へ」から次のステップに進んでください。`;
    }
    if (currentLevel !== "") {
      const currentEntitLevelyName = mappingEntityName[currentLevel][language];
      return `${currentEntitLevelyName}レイヤー内に目標が未設定の${currentEntitLevelyName}が存在します。「目標設定」ボタンから全ての${currentEntitLevelyName}の売上目標を設定した後、「次へ」から次のステップに進んでください。`;
    }
    return "未完了です。";
  };

  // ステップヘッダーの説明文
  // ステップ2
  const getTextStep2 = () => {
    if (currentLevel === "company")
      return `追加したレイヤー内で売上目標に直接関わる部門やメンバーを追加してください。\n全社レイヤーには既に貴社を追加しております。「確定」から次のステップに進んでください！`;
    // if (selectedEntityLevel === "member")
    if (currentLevel === "member")
      return `追加したレイヤー内で売上目標に直接関わる部門やメンバーを追加してください。\n売上目標に関わるメンバーを追加しましょう！レイヤーの構成が確定したら「次へ」から次のステップに進んでください。`;
    const currentEntitLevelName = mappingEntityName[currentLevel][language];
    return `追加した${currentEntitLevelName}レイヤー内で売上目標に直接関わる${currentEntitLevelName}を下の「リスト編集」から追加・削除し、構成を決めてください。レイヤーの構成が決まったら「構成を確定」から現在のリスト内容を保存し次のステップに進んでください！`;
  };
  // ステップ3タイトル
  const getStep3Title = () => {
    if (currentLevel === "company") return `全社の売上目標を設定`;
    if (currentLevel === "department") return `各事業部の売上目標を設定`;
    if (currentLevel === "section") return `各課・セクションの売上目標を設定`;
    if (currentLevel === "unit") return `各係・チームの売上目標を設定`;
    if (currentLevel === "member") return `各メンバーの売上目標を設定`;
    return `各部門・各メンバーの売上目標を設定`;
  };
  // ステップ4タイトル
  const getStep4Title = () => {
    const halfTitle = selectedPeriodTypeForMemberLevel === "first_half_details" ? `上半期` : `下半期`;
    return `全レイヤーの四半期・月次目標を設定して${halfTitle}の売上目標を完成させる`;
  };
  // ステップ5タイトル
  const getStep5Title = () => {
    const isFirstHalf = selectedPeriodTypeForMemberLevel === "first_half_details";
    const isCompleteFirstHalfFY = fiscalYearQueryData?.is_confirmed_first_half_details;
    const isCompleteSecondHalfFY = fiscalYearQueryData?.is_confirmed_second_half_details;
    const settingFiscalYear = fiscalYearQueryData?.fiscal_year;
    if (isCompleteFirstHalfFY && isCompleteSecondHalfFY) {
      return `${settingFiscalYear}年度 売上目標の設定が完了しました！`;
    }
    if (isFirstHalf) {
      if (isCompleteFirstHalfFY) {
        return `${settingFiscalYear}年度 上半期詳細の売上目標の設定が完了しました！`;
      } else {
        return `${settingFiscalYear}年度の上半期詳細の売上目標を設定する`;
      }
    }
    if (!isFirstHalf) {
      if (isCompleteSecondHalfFY) {
        return `${settingFiscalYear}年度 下半期詳細の売上目標の設定が完了しました！`;
      } else {
        return `${settingFiscalYear}年度の下半期詳細の売上目標を設定する`;
      }
    }
    return ``;
  };
  // ステップ3 説明文
  const getTextStep3 = () => {
    if (currentLevel === "company")
      return `まずは全社の「目標設定」から「年度・半期」の全社売上目標を設定してください。\n目標設定が完了したら「次へ」を押して次のレイヤーの目標設定に進んでください。`;
    if (currentLevel === "department")
      return `下記の「目標設定」から追加した事業部の売上目標を設定してください。\nリストに追加した全ての事業部の目標設定が完了したら「次へ」から次のレイヤーの目標設定に進んでください。`;
    if (currentLevel === "section")
      return `下記の「目標設定」から追加した課・セクションの売上目標を設定してください。\nリストに追加した全ての課・セクションの目標設定が完了したら「次へ」から次のレイヤーの目標設定に進んでください。`;
    if (currentLevel === "unit")
      return `下記の「目標設定」から追加した係・チームの売上目標を設定してください。\nリストに追加した全ての係・チームの目標設定が完了したら「次へ」からメンバーレイヤーの目標設定に進んでください。`;
    // if (selectedEntityLevel === "member")
    if (currentLevel === "member")
      return `メンバーの目標設定する期間を「上期詳細（上期・Q1/Q2・月次）」「下期詳細（下期・Q3/Q4・月次）」から選択後、\n下記の「目標設定」から追加した各メンバーの売上目標を設定してください。\nリストに追加した全てのメンバーの目標設定が完了したら「次へ」から次のステップに進んでください。`;
    return `追加したレイヤー内で売上目標に直接関わる部門やメンバーを追加してください。\n次は売上目標に関わる部門を追加しましょう！レイヤーの構成が確定したら「次へ」から次のステップに進んでください。`;
  };
  // ステップ4 説明文
  const getTextStep4 = () => {
    const halfTitle = selectedPeriodTypeForMemberLevel === "first_half_details" ? `上半期` : `下半期`;
    return `下記の「集計」から全メンバーの四半期・月次目標を集計し、集計結果を全レイヤーの四半期・月次目標に反映して、\n${upsertSettingEntitiesObj.fiscalYear}年度${halfTitle}の売上目標を完成させましょう。`;
  };
  // ステップ5 説明文
  const getTextStep5 = () => {
    const isFirstHalf = selectedPeriodTypeForMemberLevel === "first_half_details";
    const isCompleteFirstHalfFY = fiscalYearQueryData?.is_confirmed_first_half_details;
    const isCompleteSecondHalfFY = fiscalYearQueryData?.is_confirmed_second_half_details;
    const settingFiscalYear = fiscalYearQueryData?.fiscal_year;
    if (isCompleteFirstHalfFY && isCompleteSecondHalfFY) {
      return `${settingFiscalYear}年度の売上目標の設定は全て完了しました！お疲れ様でした！🌟\nもし売上目標の設定をやり直す場合は、下記の「リセット」から${settingFiscalYear}年度の売上目標データをリセットしてください。`;
    }
    if (isFirstHalf) {
      if (isCompleteFirstHalfFY) {
        return `${settingFiscalYear}年度の上半期詳細の売上目標の設定が全て完了しました！お疲れ様でした！🌟\n下期詳細の売上目標を設定する場合は、下記の選択ボックスを「下期詳細」に変更してください。`;
      } else {
        return `下記の「上期詳細目標を設定する」からステップ3に移行し、${settingFiscalYear}年度の上半期詳細の売上目標を設定します。`;
      }
    }
    if (!isFirstHalf) {
      if (isCompleteSecondHalfFY) {
        return `${settingFiscalYear}年度の下半期詳細の売上目標の設定が全て完了しました！お疲れ様でした！🌟\n上期詳細の売上目標を設定する場合は、下記の選択ボックスを「上期詳細」に変更してください。`;
      } else {
        return `下記の「下期詳細目標を設定する」からステップ3に移行し、${settingFiscalYear}年度の下半期詳細の売上目標を設定します。`;
      }
    }
    return ``;
  };

  // ステップヘッダーのボタンテキスト
  // ステップ3
  const tooltipBtnText = () => {
    if (step === 3) {
      if (currentLevel === "company")
        return { text: "全社レイヤーの売上目標の設定内容を保存します。", isMultiLines: false };
      if (currentLevel !== "") {
        const currentEntitLevelName = mappingEntityName[currentLevel][language];
        if (isAlreadySetState) {
          if (currentLevel === "member") return { text: `次のステップに進んでください。`, isMultiLines: false };
          if (optionsEntityLevelList.length > 1)
            return {
              text: `再度ステップ1~3で新たに売上目標に直結する\n貴社の組織構成に合わせたレイヤーを追加し売上目標を設定してください。`,
              isMultiLines: true,
            };
          if (optionsEntityLevelList.length === 1)
            return {
              text: `最後にメンバーレイヤーを追加し${currentEntitLevelName}の売上目標を構成する\n各メンバーの売上目標を設定してください。`,
              isMultiLines: true,
            };
        } else {
          return {
            text: `${currentEntitLevelName}レイヤー内に追加した全ての${currentEntitLevelName}の\n売上目標を設定してください。`,
            isMultiLines: true,
          };
        }
      }
    }
    return { text: "", isMultiLines: false };
  };

  // infoアイコン ステップヘッダー
  const infoIconTextStep = () => {
    if (step === 3) {
      if (currentLevel === "member") {
        return `メンバーレイヤーでは、「上期詳細（上期・Q1/Q2・月次）」と「下期詳細（下期・Q3/Q4・月次）」のそれぞれ半期ごとに目標を設定します。\n各メンバーの案件状況から売上見込みを考慮して来期の売上目標を設定していきます。\nまずは、「上期詳細 / 下期詳細」から期間を選択してメンバーレイヤー内の全てのメンバーの売上目標を設定してください。\n全てのメンバーの目標設定が完了した後「次へ」から最後のステップに進んでください。`;
      }
      let levelNamesStr = ``;
      if (!!departmentDataArray?.length) levelNamesStr = `事業部`;
      if (!!sectionDataArray?.length) levelNamesStr = `事業部・課/セクション`;
      if (!!unitDataArray?.length) levelNamesStr = `事業部・課/セクション・係/チーム`;
      if (levelNamesStr !== "") {
        const currentEntitLevelName = mappingEntityName[currentLevel][language];
        if (currentLevel === "company")
          if (levelNamesStr !== "") {
            return `全社の売上目標を設定してください。全社の目標設定が完了した後、「次へ」から再度ステップ1に戻り、\n貴社の組織構成に合わせて\n「${levelNamesStr}」から売上目標に必要なレイヤーを追加、目標設定のステップ1~3を繰り返し、\n最後にメンバーレイヤーを追加後、各メンバーの売上目標を設定してください。`;
          } else {
            return `全社の売上目標を設定してください。目標設定が完了した後、\n「次へ」から再度ステップ1に戻りメンバーレイヤーを追加、各メンバーの売上目標を設定してください。`;
          }
        if (currentLevel === "department") {
          levelNamesStr = "";
          if (!!sectionDataArray?.length) levelNamesStr = `課/セクション`;
          if (!!unitDataArray?.length) levelNamesStr = `課/セクション・係/チーム`;
          if (levelNamesStr !== "") {
            return `事業部レイヤー内の全ての事業部の売上目標を設定してください。目標設定が完了した後「次へ」から再度ステップ1に戻り、\n貴社の組織構成に合わせて\n「${levelNamesStr}」から売上目標に必要なレイヤーを追加、目標設定のステップ1~3を繰り返し、\n最後にメンバーレイヤーを追加後、各メンバーの売上目標を設定してください。`;
          } else {
            return `事業部レイヤー内の全ての事業部の売上目標を設定してください。目標設定が完了した後、\n「次へ」から再度ステップ1に戻りメンバーレイヤーを追加、各メンバーの売上目標を設定してください。`;
          }
        }
        if (currentLevel === "section") {
          levelNamesStr = "";
          if (!!unitDataArray?.length) levelNamesStr = `係/チーム`;
          if (levelNamesStr !== "") {
            return `課/セクションレイヤー内の全ての課/セクションの売上目標を設定してください。目標設定が完了した後「次へ」から再度ステップ1に戻り、\n貴社の組織構成に合わせて「${levelNamesStr}」から売上目標に必要なレイヤーを追加、目標設定のステップ1~3を繰り返し、\n最後にメンバーレイヤーを追加後、各メンバーの売上目標を設定してください。`;
          } else {
            return `課/セクションレイヤー内の全ての事業部の売上目標を設定してください。目標設定が完了した後、\n「次へ」から再度ステップ1に戻りメンバーレイヤーを追加、各メンバーの売上目標を設定してください。`;
          }
        }
      } else {
        return `レイヤー内の全ての部門の売上目標を設定してください。現在のレイヤーの目標設定が完了した後、\n再度ステップ1でメンバーレイヤーを追加し、各メンバーの売上目標を設定してください。`;
      }
    }
    return "";
  };

  const getTextStep1 = () => {
    let levelNamesStr = ``;
    if (!!departmentDataArray?.length) levelNamesStr = `全社/事業部`;
    if (!!sectionDataArray?.length) levelNamesStr = `全社/事業部・課/セクション`;
    if (!!unitDataArray?.length) levelNamesStr = `全社/事業部・課/セクション・係/チーム`;

    if (!!departmentDataArray?.length) {
      return `貴社で作成された${levelNamesStr}から売上目標に関わるレイヤーを追加してください。\n始めに全社レイヤーを追加し、中間レイヤーは貴社独自で必要なレイヤーを追加し、最後はメンバーレイヤーを追加してください。`;
    } else {
      return `売上目標に関わるレイヤーを追加してください。\n始めに全社レイヤーを追加し、最後はメンバーレイヤーを追加してください。`;
    }
  };

  // step別期間タイトル
  // const mappingPeriodTitle = {
  //   1:
  // }

  // ------------------------------------------- ✅初回マウント時✅ -------------------------------------------
  // --------------------------- ✅step, currentLevel, selectedNextLevel, optionsEntityLevelListのセットアップ✅
  // 初回マウント時にユーザーが選択した年度の中で、既にレイヤーがINSERTされており、
  // かつ、既存レイヤーの中でまだ売上目標が未設定のレイヤーが存在する場合はstepを3にして、既存レイヤーのエンティティの売上目標設定から始める
  useEffect(() => {
    // 🔹年度
    // 年度が存在しない場合は、ステップ1からcurrentLevelは空文字
    if (!fiscalYearQueryData || !addedEntityLevelsListQueryData || addedEntityLevelsListQueryData.length === 0) {
      if (step !== 1) setStep(1);
      if (currentLevel !== "") setCurrentLevel("");
      if (selectedNextLevel !== "company") setSelectedNextLevel("company");
      return;
    }

    // 追加したレベルは選択肢リストから取り除く
    let newOptionsLevelList = [...optionsEntityLevelList];
    let selectedLevel = "company";

    // 🔹全て完了済みの場合は、確認画面とリセットして再度登録するかどうかの画面へ
    if (fiscalYearQueryData.is_confirmed_first_half_details && fiscalYearQueryData.is_confirmed_second_half_details) {
      setStep(5); // 完了済み画面へ
      setCurrentLevel("member");
      newOptionsLevelList = []; // メンバー追加は必要ないため空の配列をセット
      selectedLevel = "member";
    }
    // 🔹上半期、下半期どちらか1つのみ完了しているならメンバーレベルが存在しているため、
    // ステップ3の目標設定画面で残りの半期目標設定へ
    // => ではなく、ステップ5で半期詳細選択画面で、完了済みの半期詳細は「設定完了 リセットしてやり直す」、未完了の半期詳細は「目標を設定する」
    else if (
      fiscalYearQueryData.is_confirmed_first_half_details ||
      fiscalYearQueryData.is_confirmed_second_half_details
    ) {
      // setStep(3);
      setStep(5);
      setCurrentLevel("member");
      newOptionsLevelList = [];
      selectedLevel = "member";
    }

    // 🔹エンティティレベル 年度が存在してるなら全社レベルがINSERT済みのため必ず1つ以上レベルが存在するルート
    else if (addedEntityLevelsListQueryData && addedEntityLevelsListQueryData.length > 0) {
      const addedLevelsMap = new Map(addedEntityLevelsListQueryData.map((level) => [level.entity_level, level]));
      // 🔸🔸レベルが１つ以上で、メンバーレベルが存在するルート
      // is_confirmed_first_half_detailsとis_confirmed_second_half_detailsがどちらもtrueの場合はstep4で全エンティティを集計
      // is_confirmed_first_half_detailsとis_confirmed_second_half_detailsのどちらか１つでもfalseの場合はstep3
      if (addedLevelsMap.has("member")) {
        setCurrentLevel("member"); // メンバーレベルに変更 parentEntityLevelはcurrentLevel変更に合わせてuseMemoで最新に更新される
        newOptionsLevelList = [];
        if (
          // 全てのレベルの上期、下期の目標が設定済みならステップ4へ、
          addedEntityLevelsListQueryData.every(
            (level) => level.is_confirmed_first_half_details && level.is_confirmed_second_half_details
          )
        ) {
          setStep(5); // 上期、下期、両方完了済みのためステップ5の確認、リセット画面へ
        }
        // 全てのレベル内で上期、下期のどちらかが未設定があり、かつ、メンバーレベルは上期、下期どちらも設定済みならstep4へ
        else if (
          addedLevelsMap.get("member")?.is_confirmed_first_half_details &&
          addedLevelsMap.get("member")?.is_confirmed_second_half_details
        ) {
          // setStep(4); // 集計ステップへ
          setStep(3); // 一旦ステップ3で上期、下期の切り替えができるステップでユーザーにどちらの集計をさせるか選択させてからステップ4に進んでもらう
        }
        // メンバーレベルで上期、下期どちらか一つでも未設定があるならstep3へ
        else {
          setStep(3); // 売上設定ステップへ
        }
      }
      // 🔸🔸レベルが１つ以上で、メンバーレベルが存在しないルート
      else {
        // is_confirmed_annual_halfが全てtrueならstep1で次のレイヤーを追加
        // is_confirmed_annual_halfが１つ以上falseが存在するならstep3、
        if (addedEntityLevelsListQueryData.every((level) => level.is_confirmed_annual_half)) {
          setStep(1);
          // レベルはstep1で追加したレベルにセットするためcurrentLevelは現在の最後のレベルをセット
        } else {
          setStep(3);
          // is_confirmed_annual_halfがfalseのレベルをcurrentLevelにセット
        }

        // 追加済みの末端レベルの下位レベルに当たるレベル以降を選択肢としてフィルターして返す
        // 係レベルまで追加済み 残りのメンバーレベルのみセット
        if (addedLevelsMap.has("unit")) {
          newOptionsLevelList = [{ title: "member", name: { ja: "メンバー", en: "Member" } }];
        }
        // 課レベルまで追加済み 係レベル以下を残す
        else if (addedLevelsMap.has("section")) {
          newOptionsLevelList = newOptionsLevelList.filter((obj) => ["unit", "member"].includes(obj.title));
        }
        // 事業部レベルまで追加済み 課レベル以下を残す
        else if (addedLevelsMap.has("department")) {
          // 事業部->課->係->メンバーで、事業部->係と飛ばすことがないようにunitは選択肢から省く
          newOptionsLevelList = newOptionsLevelList.filter((obj) => ["section", "unit", "member"].includes(obj.title));
        }
        // 会社レベルまで追加済み 事業部レベル以下を残す
        else if (addedLevelsMap.has("company")) {
          // 会社->事業部->課->係->メンバーで、会社->課、会社->係のように飛ばすことがないようにsection, unitは選択肢から省く
          newOptionsLevelList = newOptionsLevelList.filter((obj) =>
            ["department", "section", "unit", "member"].includes(obj.title)
          );
        }

        // 現在追加済みの選択肢から先頭のレベルを現在のセンタ中のレベルにセットする(useQueryのFUNCTIONでレベルごとに並び替え済み)
        selectedLevel = newOptionsLevelList[0].title;
        // const selectedLevel = newOptionsLevelList[0].title;
        // setSelectedNextLevel(selectedLevel);
        // setCurrentLevel(addedLastLevel);
      }
    }
    setSelectedNextLevel(selectedLevel as EntityLevelNames);
    // フィルター後のレベル選択肢で更新
    setOptionsEntityLevelList(newOptionsLevelList);
  }, []);
  // --------------------------- ✅step, currentLevel, selectedNextLevel, optionsEntityLevelListのセットアップ✅
  // ------------------------------------------- ✅初回マウント時✅ -------------------------------------------

  console.log(
    "UpsertTargetEntityコンポーネントレンダリング",
    // "upsertSettingEntitiesObj",
    // upsertSettingEntitiesObj,
    // "目標年度fiscalYearQueryData",
    // fiscalYearQueryData,
    "step",
    step,
    "レベル選択肢optionsEntityLevelList",
    optionsEntityLevelList,
    // selectedEntityLevel,
    "現在のレベルcurrentLevel",
    currentLevel,
    "次の選択中のレベルselectedNextLevel",
    selectedNextLevel,
    "親のレベルparentEntityLevel",
    parentEntityLevel,
    // "レベル構成クエリデータaddedEntityLevelsListQueryData",
    // addedEntityLevelsListQueryData,
    "追加済みのレベルローカルデータaddedEntityLevelsListLocal",
    addedEntityLevelsListLocal,
    // "レベル別エンティティ構成クエリデータentitiesHierarchyQueryData",
    // entitiesHierarchyQueryData,
    "レベル別エンティティ構成ローカルデータentitiesHierarchyLocal",
    entitiesHierarchyLocal,
    // "リスト編集用メンバー所属ありエンティティSetオブジェクトentityIdsWithMembersSetObj",
    // entityIdsWithMembersSetObj,
    "entitiesHierarchyQueryData",
    entitiesHierarchyQueryData,
    "年度fiscalYearQueryData",
    fiscalYearQueryData
    // "追加したエンティティ内のメンバー人数addedEntitiesMemberCountQueryData",
    // addedEntitiesMemberCountQueryData
  );
  return (
    <>
      {/* ローディング */}
      {isLoading && (
        <div
          className={`flex-center fixed left-0 top-0 z-[5000] h-full w-full bg-[var(--overlay-loading-modal-inside)]`}
        >
          <SpinnerBrand withBorder withShadow />
        </div>
      )}

      {isSettingTargetMode && upsertSettingEntitiesObj?.entities && upsertSettingEntitiesObj.entities.length > 0 && (
        <>
          {/* オーバーレイ */}
          <div
            className={`spacer-left-overlay fixed left-0 top-0 z-[4500] h-[100vh] min-w-[72px] bg-[red]/[0]`}
            onClick={handleCloseSettingEntitiesTarget}
          ></div>
          <div
            className={`spacer-top-overlay fixed left-0 top-0 z-[4500] min-h-[56px] w-[100vw] bg-[green]/[0]`}
            onClick={handleCloseSettingEntitiesTarget}
          ></div>

          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={
                <FallbackUpsertSettingTargetEntityGroup
                  isUpsertSalesTargetTable={true}
                  fiscalYear={upsertSettingEntitiesObj.fiscalYear}
                  currentLevel={currentLevel}
                  step={step}
                  language={language}
                  getActiveSteps={getActiveSteps}
                />
              }
            >
              <UpsertSettingTargetEntityGroup
                settingEntityLevel={currentLevel}
                setIsSettingTargetMode={setIsSettingTargetMode}
                setStep={setStep}
                currentParentEntitiesForMember={currentParentEntitiesForMember}
              />
            </Suspense>
          </ErrorBoundary>
          {/* <FallbackUpsertSettingTargetEntityGroup
            isUpsertSalesTargetTable={true}
            fiscalYear={upsertSettingEntitiesObj.fiscalYear}
            currentLevel={currentLevel}
            step={step}
            language={language}
            getActiveSteps={getActiveSteps}
          /> */}
          {/* <div className={`setting_target_container fixed left-0 top-0 z-[80] h-[100vh] w-[100vw] bg-[red]/[0]`}>
            <div className={`${styles.upsert_setting_container} relative flex h-full w-full`}>
              <div className={`${styles.main_container_setting} z-[1200] flex h-full w-full bg-[yellow]/[0]`}>
                <div className={`${styles.spacer_left}`}></div>
                <div className={`${styles.main_contents_wrapper} `}>
                  <div className={`${styles.spacer_top}`}></div>
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Suspense fallback={<FallbackTargetContainer isUpsert={true} />}>
                      <UpsertSettingTargetEntityGroup
                        settingEntityLevel={currentLevel}
                        setIsSettingTargetMode={setIsSettingTargetMode}
                      />
                    </Suspense>
                  </ErrorBoundary>
                </div>
              </div>
            </div>
          </div> */}
        </>
      )}

      {/* ===================== スクロールコンテナ ここから ===================== */}
      <div className={`${styles.main_container_entity} fade08_forward`}>
        <div className={`${styles.title_area}`}>
          <h1 className={`${styles.title} ${styles.upsert} space-x-[24px]`}>
            <div className={`flex items-center space-x-[12px]`}>
              {(step === 1 || currentLevel === "") && (
                <>
                  <span className="min-w-max">{upsertSettingEntitiesObj.fiscalYear}年度</span>
                  <span className="min-w-max">目標設定</span>
                </>
              )}
              {[2, 3].includes(step) && currentLevel !== "" && (
                <>
                  <span className="min-w-max">{upsertSettingEntitiesObj.fiscalYear}年度</span>
                  <span className="min-w-max">{mappingEntityName[currentLevel][language]}</span>
                  <span className="min-w-max">目標設定</span>
                  {step === 3 && currentLevel === "member" && (
                    <span className="min-w-max">
                      {mappingHalfDetails[`${selectedPeriodTypeForMemberLevel}`][language]}
                    </span>
                  )}
                </>
              )}
              {[4, 5].includes(step) && (
                <>
                  <span className="min-w-max">{upsertSettingEntitiesObj.fiscalYear}年度</span>
                  <span className="min-w-max">目標設定</span>
                  <span className="min-w-max">
                    {mappingHalfDetails[`${selectedPeriodTypeForMemberLevel}`][language]}
                  </span>
                  {step === 4 && <span className="min-w-max">四半期・月次目標 集計</span>}
                </>
              )}
            </div>
            {/* ----プログレスエリア---- */}
            <div className="relative flex h-[25px] w-full items-center">
              {/* プログレスライン */}
              <div className="absolute left-0 top-[50%] z-[0] h-[1px] w-[145px] bg-[var(--color-progress-bg)]"></div>
              {/* ○1 */}
              <div
                className={`flex-center z-[1] mr-[15px] h-[25px] w-[25px] rounded-full border border-solid ${getActiveSteps(
                  1
                )}`}
                // onClick={() => setStep(1)}
              >
                <span className={`text-[12px] font-bold`}>1</span>
              </div>
              {/* ○2 */}
              <div
                className={`flex-center  z-[1] mr-[15px] h-[25px] w-[25px] rounded-full border border-solid ${getActiveSteps(
                  2
                )}`}
                // onClick={() => setStep(2)}
              >
                <span className={`text-[12px] font-bold`}>2</span>
              </div>
              {/* ○3 */}
              <div
                className={`flex-center  z-[1] mr-[15px] h-[25px] w-[25px] rounded-full border border-solid ${getActiveSteps(
                  3
                )}`}
                // onClick={() => setStep(3)}
              >
                <span className={`text-[12px] font-bold`}>3</span>
              </div>
              {/* ○4 */}
              <div
                className={`flex-center  z-[1] mr-[15px] h-[25px] w-[25px] rounded-full border border-solid ${getActiveSteps(
                  4
                )}`}
                // onClick={() => setStep(4)}
              >
                <span className={`text-[12px] font-bold`}>4</span>
              </div>
              {/* ○5 */}
              {/* <div
                className={`flex-center  z-[1] mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid ${getActiveSteps(
                  5
                )}`}
                onClick={() => setStep(5)}
              >
                <span className={`text-[12px] font-bold`}>5</span>
              </div> */}
            </div>
            {/* ----プログレスエリア ここまで---- */}
          </h1>
          <div className={`${styles.btn_area} flex items-start space-x-[12px]`}>
            <div className={`${styles.btn} ${styles.basic}`} onClick={handleCancelUpsert}>
              <span>戻る</span>
            </div>
            <div
              className={`${styles.btn} ${styles.brand} ${step === 5 ? `` : `${styles.inactive}`} space-x-[3px]`}
              onClick={(e) => {
                if (step !== 5) {
                  alert(
                    "売上目標が全て完了していません。左記の手順に沿って全てのレイヤーの売上目標が設定できたら保存を押して設定を保存してください。"
                  );
                  return;
                }
                handleCancelUpsert();
              }}
            >
              {/* <RiSave3Fill className={`stroke-[3] text-[12px] text-[#fff]`} /> */}
              <MdSaveAlt className={`text-[14px] text-[#fff]`} />
              <span>保存</span>
            </div>
          </div>
        </div>

        {/* -------------------------------- コンテンツエリア -------------------------------- */}
        <div ref={scrollContentsAreaRef} className={`${styles.contents_area_entity}`}>
          {/* -------------------------------- 左コンテナ手順 -------------------------------- */}
          <div className={`${styles.left_container} bg-[red]/[0] ${isStickySidebar ? `${styles.sticky_side}` : ``}`}>
            <div className={`${styles.step_container} space-y-[12px]`}>
              <div className={`flex w-full justify-between`}>
                <h4
                  className={`flex w-full max-w-max items-center text-[18px] font-bold`}
                  onMouseEnter={(e) => {
                    const icon = infoIconStepRef.current;
                    if (icon && icon.classList.contains(styles.animate_ping)) {
                      icon.classList.remove(styles.animate_ping);
                    }
                    handleOpenPopupMenu({ e, title: "step", displayX: "right", maxWidth: 360 });
                  }}
                  onMouseLeave={handleClosePopupMenu}
                >
                  <span>手順</span>
                  <div className="flex-center relative ml-[12px] h-[16px] w-[16px] rounded-full">
                    <div
                      ref={infoIconStepRef}
                      className={`flex-center absolute left-0 top-0 h-[16px] w-[16px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                    ></div>
                    <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                  </div>
                </h4>

                <div
                  className={`${styles.btn} ${styles.basic} space-x-[4px] whitespace-nowrap`}
                  onMouseEnter={(e) => {
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: isStickySidebar ? `固定を解除` : `画面内に固定`,
                      marginTop: 9,
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                  onClick={() => {
                    setIsStickySidebar(!isStickySidebar);
                    handleCloseTooltip();
                  }}
                >
                  {isStickySidebar && <TbSnowflakeOff />}
                  {!isStickySidebar && <TbSnowflake />}
                  {isStickySidebar && <span>解除</span>}
                  {!isStickySidebar && <span>固定</span>}
                </div>
              </div>

              {/* ------------- */}
              <li className={`flex h-max w-full flex-col`}>
                <div className={`flex w-full items-center space-x-[9px] text-[14px] font-bold ${getActiveDesc(1)}`}>
                  <div className="flex h-full min-w-max items-center">
                    <div
                      className={`flex-center z-[1] min-h-[22px] min-w-[22px] rounded-full border border-solid ${getActiveStep(
                        1
                      )}`}
                    >
                      <span className={`text-[12px] font-bold`}>1</span>
                    </div>
                  </div>
                  <span>組織を構成するレイヤーを追加</span>
                </div>
                <div className={`${styles.description} w-full text-[12px] ${step === 1 ? `${styles.open}` : ``}`}>
                  <p>{`売上目標に関わる組織レイヤーをお客様が作成された「全社、事業部、課、係、メンバー」から追加してください。`}</p>
                </div>
              </li>
              {/* ------------- */}
              {/* ------------- */}
              <li className={`flex h-max w-full flex-col`}>
                <div className={`flex w-full items-center space-x-[9px] text-[14px] font-bold ${getActiveDesc(2)}`}>
                  <div className="flex h-full min-w-max items-center">
                    <div
                      className={`flex-center z-[1] min-h-[22px] min-w-[22px] rounded-full border border-solid ${getActiveStep(
                        2
                      )}`}
                    >
                      <span className={`text-[12px] font-bold`}>2</span>
                    </div>
                  </div>
                  <span>レイヤーに部門・人を追加して組織構成を決める</span>
                </div>
                <div className={`${styles.description} w-full text-[12px] ${step === 2 ? `${styles.open}` : ``}`}>
                  <p>{`追加したレイヤー内で売上目標に直接関わる部門や人を追加してください。`}</p>
                </div>
              </li>
              {/* ------------- */}
              {/* ------------- */}
              <li className={`flex h-max w-full flex-col`}>
                <div className={`flex w-full items-center space-x-[9px] text-[14px] font-bold ${getActiveDesc(3)}`}>
                  <div className="flex h-full min-w-max items-center">
                    <div
                      className={`flex-center z-[1] min-h-[22px] min-w-[22px] rounded-full border border-solid ${getActiveStep(
                        3
                      )}`}
                    >
                      <span className={`text-[12px] font-bold`}>3</span>
                    </div>
                  </div>
                  <span>売上目標を設定・保存</span>
                </div>
                <div className={`${styles.description} w-full text-[12px] ${step === 3 ? `${styles.open}` : ``}`}>
                  <p>{`「全社〜係」レイヤーは「年度・半期」の売上目標を設定し、\n各メンバーは一つ上のレイヤーで決めた半期目標を総合目標として、各メンバーで現在の保有している案件と来期の売上見込みを基に「半期〜月次」の目標を設定してください。`}</p>
                </div>
              </li>
              {/* ------------- */}
              {/* ------------- */}
              <li className={`flex h-max w-full flex-col`}>
                <div className={`flex w-full items-center space-x-[9px] text-[14px] font-bold ${getActiveDesc(4)}`}>
                  <div className="flex h-full min-w-max items-center">
                    <div
                      className={`flex-center z-[1] min-h-[22px] min-w-[22px] rounded-full border border-solid ${getActiveStep(
                        4
                      )}`}
                    >
                      <span className={`text-[12px] font-bold`}>4</span>
                    </div>
                  </div>
                  {/* <span>ステップ1~3を繰り返し、目標に関わる全メンバーの目標を設定する</span> */}
                  <span>全レイヤーの四半期・月次の売上目標を「集計」で完成させる</span>
                </div>
                <div className={`${styles.description} w-full text-[12px] ${step === 4 ? `${styles.open}` : ``}`}>
                  <p>{`全てのメンバーの四半期・月次目標の設定が完了したら、全メンバーの四半期・月次売上目標を集約して全てのレイヤーの四半期・月次売上目標に反映して${
                    upsertSettingEntitiesObj.fiscalYear
                  }年度${
                    selectedPeriodTypeForMemberLevel === "first_half_details" ? `上半期` : `下半期`
                  }の売上目標を完成させる`}</p>
                </div>
              </li>
              {/* ------------- */}
              {/* ------------- */}
              {/* <li className={`flex h-max w-full flex-col`}>
                <div className={`flex w-full items-center space-x-[9px] text-[14px] font-bold ${getActiveDesc(5)}`}>
                  <div className="flex h-full min-w-max items-center">
                    <div
                      className={`flex-center z-[1] min-h-[22px] min-w-[22px] rounded-full border border-solid ${getActiveStep(
                        5
                      )}`}
                    >
                      <span className={`text-[12px] font-bold`}>5</span>
                    </div>
                  </div>
                  <span>
                    全レイヤーの四半期・月次の売上目標を「集計」で完成させる
                  </span>
                </div>
                <div className={`${styles.description} w-full text-[12px] ${step === 5 ? `${styles.open}` : ``}`}>
                  <p>{`全てのメンバーの四半期、月次目標の設定が完了したら、全メンバーの売上目標を集約して全てのレイヤーの四半期・月次売上目標を完成させる`}</p>
                </div>
              </li> */}
              {/* ------------- */}
            </div>
          </div>
          {/* -------------------------------- 左コンテナ手順 ここまで -------------------------------- */}
          {/* -------------------------------- 右コンテナ -------------------------------- */}
          <div className={`${styles.right_container} bg-[green]/[0]`}>
            {/* ------------------------ 右コンテナ 上ステップヘッダー ------------------------ */}
            <div
              className={`${styles.step_header_wrapper} fade08_forward flex w-full ${
                isStickyHeader ? `sticky top-[8px] z-[100]` : ``
              }`}
            >
              <div
                className={`${styles.step_header} ${
                  isStickyHeader ? (isStickySidebar ? `${styles.sticky_with_side}` : `${styles.sticky_header}`) : ``
                }`}
              >
                <div className={`flex w-full justify-between`}>
                  <div className={`${styles.left_wrapper} flex w-[69%] flex-col`}>
                    <div className={`flex flex-col`}>
                      <h4 className={`flex min-h-[30px] font-bold`}>
                        {step === 1 && <span>組織を構成するレイヤーを追加</span>}
                        {step === 2 && currentLevel === "company" && (
                          <span>レイヤーごとに会社・部門・メンバーを追加して、組織構成を決める</span>
                        )}
                        {step === 2 && currentLevel !== "company" && (
                          <span>レイヤーごとに部門・メンバーを追加して、組織構成を決める</span>
                        )}
                        {step === 3 && <span>{getStep3Title()}</span>}
                        {step === 4 && <span>{getStep4Title()}</span>}
                        {step === 5 && <span>{getStep5Title()}</span>}
                        {/* {step === 4 && <span>組織を構成するレイヤーを追加</span>} */}
                        {step === 3 && (
                          <div className={`flex h-full items-start pt-[4px]`}>
                            <div
                              className="flex-center relative !ml-[15px] h-[16px] w-[16px] rounded-full"
                              onMouseEnter={(e) => {
                                const icon = infoIconTitleRef.current;
                                if (icon && icon.classList.contains(styles.animate_ping)) {
                                  icon.classList.remove(styles.animate_ping);
                                }
                                handleOpenTooltip({
                                  e: e,
                                  display: "top",
                                  content: infoIconTextStep(),
                                  marginTop: currentLevel === "member" ? 78 : 56,
                                });
                              }}
                              onMouseLeave={handleCloseTooltip}
                            >
                              <div
                                ref={infoIconTitleRef}
                                className={`flex-center absolute left-0 top-0 h-[16px] w-[16px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                              ></div>
                              <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                            </div>
                          </div>
                        )}
                      </h4>
                      <div className={`mt-[3px] text-[12px]`}>
                        <p className={`whitespace-pre-wrap leading-[20px]`}>
                          {step === 1 && getTextStep1()}
                          {step === 2 && getTextStep2()}
                          {step === 3 && getTextStep3()}
                          {step === 4 && getTextStep4()}
                          {step === 5 && getTextStep5()}
                          {/* 2で追加した「全社〜係」までは「年度・半期」の売上目標を設定し、
                          各メンバーは一つ上のレイヤーで決めた売上目標と半期の売上目標シェアを割り振り、現在の保有している案件と来期の売上見込みを基に「半期〜月次」の売上目標を設定してください。 */}
                        </p>
                      </div>
                      <div
                        className={`flex items-center ${
                          [3].includes(step)
                            ? currentLevel === "member"
                              ? `mt-[10px]`
                              : `mt-[20px]`
                            : step === 2
                            ? `mt-[15px]`
                            : `mt-[20px]`
                        }`}
                      >
                        {step === 1 && (
                          <select
                            className={`${styles.select_box} ${styles.both} mr-[20px] truncate`}
                            style={{ maxWidth: `150px` }}
                            // value={selectedEntityLevel}
                            value={selectedNextLevel}
                            onChange={(e) => {
                              setSelectedNextLevel(e.target.value as EntityLevelNames);
                              // setCurrentLevel(e.target.value as EntityLevelNames);
                              // if (openPopupMenu) handleClosePopupMenu();
                            }}
                          >
                            {optionsEntityLevelList.map((obj) => (
                              <option key={obj.title} value={obj.title}>
                                {obj.name[language]}
                              </option>
                            ))}
                          </select>
                        )}
                        {/* メンバーレベル設定時の「上期詳細」「下期詳細」を選択 */}
                        {[3, 5].includes(step) && currentLevel === "member" && (
                          <select
                            className={`${styles.select_box} ${styles.both} mr-[20px] truncate`}
                            style={{ maxWidth: `max-content` }}
                            value={selectedPeriodTypeForMemberLevel}
                            onChange={(e) => {
                              setSelectedPeriodTypeForMemberLevel(
                                e.target.value as "first_half_details" | "second_half_details"
                              );
                              // ステップ3で変更した先の半期詳細の売上目標が全て設定完了している場合には、stepを5に移行する
                              if (
                                (e.target.value === "first_half_details" &&
                                  fiscalYearQueryData?.is_confirmed_first_half_details) ||
                                (e.target.value === "second_half_details" &&
                                  fiscalYearQueryData?.is_confirmed_second_half_details)
                              ) {
                                setStep(5);
                              }
                            }}
                          >
                            <option value={"first_half_details"}>
                              {mappingHalfDetails["first_half_details"][language]}
                            </option>
                            <option value={"second_half_details"}>
                              {mappingHalfDetails["second_half_details"][language]}
                            </option>
                          </select>
                        )}
                        {isLoadingSave && (
                          <div className={`flex-center min-h-[36px] min-w-[95px]`}>
                            <SpinnerX h="h-[27px]" w="w-[27px]" />
                          </div>
                        )}
                        {!isLoadingSave && (
                          <button
                            className={`transition-bg01 flex-center max-h-[34px] max-w-max rounded-[8px] px-[15px] py-[10px] text-[13px] font-bold ${styleStepNextBtn()}`}
                            style={{
                              ...(fiscalYearQueryData &&
                                ((selectedPeriodTypeForMemberLevel === "first_half_details" &&
                                  fiscalYearQueryData.is_confirmed_first_half_details) ||
                                  (selectedPeriodTypeForMemberLevel === "second_half_details" &&
                                    fiscalYearQueryData.is_confirmed_second_half_details)) && { display: `hidden` }),
                            }}
                            onMouseEnter={(e) => {
                              // if (step === 4) return;
                              let content1 = ``;
                              let isMultiLines = false;

                              const step1Content1 = `${upsertSettingEntitiesObj.fiscalYear}年度の売上目標の組織構成に`;
                              const step1Content2 = `${mappingEntityName[selectedNextLevel][language]}レイヤーを追加する`;

                              if (step === 1) {
                                content1 = step1Content1;
                                isMultiLines = true;
                              }
                              if (step === 2) {
                                if (currentLevel === "company") return;
                                if (currentLevel !== "") {
                                  content1 = `${mappingEntityName[currentLevel][language]}レイヤーの目標リストを確定・保存する`;
                                }
                              }
                              if (step === 3) {
                                const { text, isMultiLines: _isMultiLines } = tooltipBtnText();
                                content1 = text;
                                isMultiLines = _isMultiLines;
                              }
                              if (step === 4) {
                                content1 = `全メンバーの四半期・月次売上目標を全レイヤーに反映させる`;
                              }
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                content: content1,
                                content2: step === 1 ? step1Content2 : undefined,
                                marginTop: isMultiLines ? 24 : 0,
                              });
                            }}
                            onMouseLeave={handleCloseTooltip}
                            onClick={() => {
                              handleCloseTooltip();
                              if (step === 1) {
                                handleAddLevel();
                              }
                              if (step === 2) handleSaveEntities();
                              if (step === 3) {
                                if (!isAlreadySetState) {
                                  alert(alertTextNextBtn3());
                                  return;
                                }
                                if (currentLevel !== "member") {
                                  setStep(1);
                                } else if (currentLevel === "member") {
                                  setStep(4);
                                }
                              }
                              if (step === 4) {
                                handleAggregateQuarterMonth();
                              }
                              if (step === 5) {
                                const isFirstHalf = selectedPeriodTypeForMemberLevel === "first_half_details";
                                const isCompleteFirstHalfFY = fiscalYearQueryData?.is_confirmed_first_half_details;
                                const isCompleteSecondHalfFY = fiscalYearQueryData?.is_confirmed_second_half_details;
                                if (
                                  (isFirstHalf && isCompleteFirstHalfFY) ||
                                  (!isFirstHalf && isCompleteSecondHalfFY)
                                ) {
                                  // 終了
                                  handleCancelUpsert();
                                }
                                if (
                                  (isFirstHalf && !isCompleteFirstHalfFY) ||
                                  (!isFirstHalf && !isCompleteSecondHalfFY)
                                ) {
                                  setStep(3); // 残りの半期詳細の目標設定画面へ
                                }
                              }
                            }}
                          >
                            <span className="select-none">
                              {step === 1 && `レイヤーを追加`}
                              {step === 2 && `構成を確定`}
                              {step === 3 && fiscalYearQueryData && (
                                <>
                                  {((selectedPeriodTypeForMemberLevel === "first_half_details" &&
                                    !fiscalYearQueryData.is_confirmed_first_half_details) ||
                                    (selectedPeriodTypeForMemberLevel === "second_half_details" &&
                                      !fiscalYearQueryData.is_confirmed_second_half_details)) &&
                                    `次へ`}
                                </>
                              )}
                              {step === 4 && (
                                <>
                                  {selectedPeriodTypeForMemberLevel === "first_half_details" && `Q1/Q2・月次目標を集計`}
                                  {selectedPeriodTypeForMemberLevel === "second_half_details" &&
                                    `Q3/Q4・月次目標を集計`}
                                </>
                              )}
                              {step === 5 && (
                                <>
                                  {((selectedPeriodTypeForMemberLevel === "first_half_details" &&
                                    fiscalYearQueryData?.is_confirmed_first_half_details) ||
                                    (selectedPeriodTypeForMemberLevel === "second_half_details" &&
                                      fiscalYearQueryData?.is_confirmed_second_half_details)) &&
                                    `保存して終了`}
                                  {selectedPeriodTypeForMemberLevel === "first_half_details" &&
                                    !fiscalYearQueryData?.is_confirmed_first_half_details &&
                                    `上期詳細目標を設定する`}
                                  {selectedPeriodTypeForMemberLevel === "second_half_details" &&
                                    !fiscalYearQueryData?.is_confirmed_second_half_details &&
                                    `下期詳細目標を設定する`}
                                </>
                              )}
                            </span>
                          </button>
                        )}
                        {/* 半期詳細 or 年度全てをリセット方法を選択 */}
                        {/* {step === 5 && currentLevel === "member" && (
                          <select
                            className={`${styles.select_box} ${styles.both} mx-[20px] truncate`}
                            style={{ maxWidth: `max-content` }}
                            value={resetTargetType}
                            onChange={(e) => {
                              setResetTargetType(e.target.value as "half_detail" | "fiscal_year");
                            }}
                          >
                            <option value={"half_detail"}>{mappingResetType["half_detail"][language]}</option>
                            <option value={"fiscal_year"}>{mappingResetType["fiscal_year"][language]}</option>
                          </select>
                        )} */}
                        {step === 5 &&
                          fiscalYearQueryData &&
                          ((selectedPeriodTypeForMemberLevel === "first_half_details" &&
                            fiscalYearQueryData.is_confirmed_first_half_details) ||
                            (selectedPeriodTypeForMemberLevel === "second_half_details" &&
                              fiscalYearQueryData.is_confirmed_second_half_details)) && (
                            <>
                              <div className="ml-[20px] flex items-center justify-start">
                                {/* <div
                                  className={`flex-center ml-[6px] rounded-full border border-solid border-[var(--bright-green)] bg-[var(--bright-green)] px-[12px] py-[3px] text-[12px] text-[#fff]`}
                                >
                                  <span className="ml-[2px]">設定完了</span>
                                  <BsCheck2 className="pointer-events-none ml-[6px] min-h-[18px] min-w-[18px] stroke-1 text-[18px] text-[#fff]" />
                                </div> */}
                                <button
                                  className={`transition-bg01 flex-center max-h-[36px] max-w-max cursor-pointer rounded-[8px] ${styles.cancel_btn} px-[15px] py-[10px] text-[13px] font-bold`}
                                  onMouseEnter={(e) => {
                                    // `メンバーレイヤーの${mappingHalfDetails[selectedPeriodTypeForMemberLevel][language]}の売上目標を全てリセットして`
                                    handleOpenTooltip({
                                      e: e,
                                      display: "top",
                                      content: `リセットタイプ選択画面を表示する\n「${upsertSettingEntitiesObj.fiscalYear}年度の売上目標を全てリセット、または、メンバーレイヤーの${mappingHalfDetails[selectedPeriodTypeForMemberLevel][language]}の売上目標をリセット」から\nリセットタイプを選択して新しく売上目標を設定します。`,
                                      marginTop: 39,
                                      itemsPosition: `left`,
                                    });
                                  }}
                                  onMouseLeave={handleCloseTooltip}
                                  onClick={() => {
                                    setIsOpenResetTargetModal(true);
                                    handleCloseTooltip();
                                  }}
                                >
                                  リセット
                                </button>
                              </div>
                            </>
                          )}
                        {/* <button
                          className={`transition-bg01 flex-center max-h-[36px] max-w-max cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[13px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                          onClick={() => {
                            if (!scrollContentsAreaRef.current) return;
                            console.log("クリックscrollContentsAreaRef");
                            const scroll = scrollContentsAreaRef.current;
                            const { width } = scroll.getBoundingClientRect();
                            scroll.scrollTo({ top: 0, left: width, behavior: "smooth" });
                          }}
                        >
                          スクロール
                        </button> */}
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.right_wrapper} relative flex w-[31%] flex-col`}>
                    <div
                      className={`${styles.btn_area} absolute right-0 top-0 flex min-h-[30px] w-full items-center justify-end space-x-[12px]`}
                    >
                      <div
                        className={`${styles.btn} ${styles.basic} space-x-[4px]`}
                        onMouseEnter={(e) => {
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: isStickyHeader ? `固定を解除` : `画面内に固定`,
                            marginTop: 9,
                          });
                        }}
                        onMouseLeave={handleCloseTooltip}
                        onClick={() => {
                          setIsStickyHeader(!isStickyHeader);
                          handleCloseTooltip();
                        }}
                      >
                        {isStickyHeader && <TbSnowflakeOff />}
                        {!isStickyHeader && <TbSnowflake />}
                        {isStickyHeader && <span>解除</span>}
                        {!isStickyHeader && <span>固定</span>}
                      </div>
                    </div>
                    <div className={`flex w-full justify-end`}>
                      {step !== 5 && <div className="mr-[84px] mt-[-20px]">{dataIllustration}</div>}
                      {step === 5 && <div className="mr-[84px] mt-[-35px]">{winnersIllustration("180")}</div>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* ------------------------ 右コンテナ 上ステップヘッダー ここまで ------------------------ */}
            {/* ------------------------ 右コンテナ 下エンティティレベルコンテナ ------------------------ */}
            <div className={`${styles.contents_container_rb} flex h-full w-full`}>
              {!addedEntityLevelsListLocal?.length && (
                <div
                  className={`flex-col-center h-[calc(100vh-56px-66px-168px-32px)] w-[calc(100vw-72px-260px-32px)]  p-[16px] text-[13px]`}
                >
                  <div className={`flex-col-center relative mt-[-56px]`}>
                    {addTaskIllustration()}

                    <div className={`flex-col-center absolute bottom-[0] z-10`}>
                      <p>データがありません。</p>
                      <p>レイヤーを追加してください。</p>
                    </div>
                  </div>
                </div>
              )}
              {/* {true && (
                <div className={`${styles.col} fade08_forward`} style={{ background: `unset`, boxShadow: `unset` }}>
                  <div
                    className={`flex-center w-full`}
                    style={{
                      maxHeight: `calc(100vh - 56px - 66px - 168px - 32px)`,
                      minHeight: `calc(100vh - 56px - 66px - 168px - 32px)`,
                    }}
                  >
                    <SpinnerX h="h-[33px]" w="w-[33px]" />
                  </div>
                </div>
              )} */}
              {!!addedEntityLevelsListLocal?.length &&
                addedEntityLevelsListLocal.map((levelObj) => {
                  if (!upsertSettingEntitiesObj) return;
                  const entityLevel = levelObj.entity_level;

                  const isConfirmLevelAH = levelObj.is_confirmed_annual_half;
                  const isConfirmLevelFH = levelObj.is_confirmed_first_half_details;
                  const isConfirmLevelSH = levelObj.is_confirmed_second_half_details;

                  // エンティティが設定済みかどうか
                  let settingLevelState = "notSet";
                  // 全て設定済み
                  if (isConfirmLevelAH && isConfirmLevelFH && isConfirmLevelSH) {
                    settingLevelState = "setAll";
                  }
                  // 年度のみ
                  else if (isConfirmLevelAH && !isConfirmLevelFH && !isConfirmLevelSH) {
                    settingLevelState = "setAnnualHalfOnly";
                  }
                  // 上半期まで
                  // else if (isConfirmLevelAH && isConfirmLevelFH && !isConfirmLevelSH) {
                  else if (isConfirmLevelFH && !isConfirmLevelSH) {
                    settingLevelState = "setFirstHalf";
                  }
                  // 下半期まで
                  // else if (isConfirmLevelAH && !isConfirmLevelFH && isConfirmLevelSH) {
                  else if (!isConfirmLevelFH && isConfirmLevelSH) {
                    settingLevelState = "setSecondHalf";
                  }

                  const entityGroupListByParent =
                    entitiesHierarchyLocal && Object.keys(entitiesHierarchyLocal).includes(entityLevel)
                      ? entitiesHierarchyLocal[entityLevel as EntityLevelNames]
                      : null;

                  return (
                    <Fragment key={`column_${levelObj.entity_level}`}>
                      <ErrorBoundary FallbackComponent={ErrorFallback}>
                        <Suspense fallback={<FallbackEntityLevelColumn />}>
                          <EntityLevelColumn
                            levelObj={levelObj}
                            settingLevelState={settingLevelState}
                            language={language}
                            entityGroupListByParent={entityGroupListByParent}
                            handleOpenTooltip={handleOpenTooltip}
                            handleCloseTooltip={handleCloseTooltip}
                            isLoadingSave={isLoadingSave}
                            hoveredItemPos={hoveredItemPos}
                            step={step}
                            currentLevel={currentLevel}
                            parentEntityLevel={parentEntityLevel}
                            handleOpenEditEntityListByParentModal={handleOpenEditEntityListByParentModal}
                            setIsSettingTargetMode={setIsSettingTargetMode}
                            entitiesHierarchyLocal={entitiesHierarchyLocal}
                            // setSelectedMemberAndPeriodType={setSelectedMemberAndPeriodType}
                            handleOpenSectionMenu={handleOpenSectionMenu}
                          />
                        </Suspense>
                      </ErrorBoundary>
                      {/* <div key={`column_${levelObj.entity_level}`} className={`${styles.col} fade08_forward`}>
                        <div className={`flex w-full justify-between`}>
                          <h4 className={`text-[19px] font-bold`}>{mappingEntityName[entityLevel][language]}</h4>
                          <div className={`flex items-center text-[13px]`}>
                            {settingLevelState === "notSet" && (
                              <span className={`text-[var(--main-color-tk)]`}>未設定</span>
                            )}
                            {settingLevelState !== "notSet" && (
                              <div className={`flex items-center space-x-[6px]`}>
                                {settingLevelState === "setAnnualHalfOnly" && (
                                  <div
                                    // className={`flex-center rounded-full border border-solid border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] px-[12px] py-[3px] text-[var(--color-text-sub)]`}
                                    className={`flex-center text-[var(--color-text-brand-f)]`}
                                  >
                                    <span className={`text-[13px]`}>設定完了</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        <ul className={`flex w-full flex-col`}>
                          {!entityGroupListByParent && (
                            <div className={`flex-col-center h-full w-full`}>
                              <div className={`flex-col-center relative`}>
                                {addTaskIllustration()}
                                <div className={`flex-col-center absolute bottom-[0] z-10 text-[13px]`}>
                                  <p>データがありません。</p>
                                  {entityLevel === "company" && <p>会社を追加してください。</p>}
                                  {entityLevel === "department" && <p>事業部を追加してください。</p>}
                                  {entityLevel === "section" && <p>課・セクションを追加してください。</p>}
                                  {entityLevel === "unit" && <p>係・チームを追加してください。</p>}
                                  {entityLevel === "member" && <p>メンバーを追加してください。</p>}
                                </div>
                              </div>
                            </div>
                          )}
                          {entityGroupListByParent &&
                            entityGroupListByParent.map((entityGroupObj, rowGroupIndex) => {
                              return (
                                <li
                                  key={`section_${levelObj.entity_level}_${entityGroupObj.parent_entity_id}_${rowGroupIndex}`}
                                  className="mb-[6px] mt-[16px] flex w-full flex-col"
                                >
                                  <h3 className={`mb-[0px] flex min-h-[30px] items-center justify-between font-bold`}>
                                    <div className="flex min-w-max flex-col space-y-[3px]">
                                      <div className="flex min-w-max items-center space-x-[6px] pr-[9px] text-[15px]">
                                        <NextImage
                                          width={21}
                                          height={21}
                                          src={`/assets/images/icons/business/icons8-process-94.png`}
                                          alt="setting"
                                          className={`${styles.title_icon} mb-[2px]`}
                                        />
                                        <span
                                          className="max-w-[270px] truncate"
                                          data-text={`${entityGroupObj.parent_entity_name}`}
                                          onMouseEnter={(e) => {
                                            const el = e.currentTarget;
                                            if (el.scrollWidth > el.offsetWidth)
                                              handleOpenTooltip({ e, display: "top", marginTop: 9 });
                                          }}
                                          onMouseLeave={(e) => {
                                            if (hoveredItemPos) handleCloseTooltip();
                                          }}
                                        >
                                          {entityLevel !== "company" && entityGroupObj.parent_entity_name}
                                          {entityLevel === "company" && entityGroupObj.parent_entity_name === "root"
                                            ? language === "ja"
                                              ? "会社・チーム"
                                              : "Company"
                                            : ""}
                                        </span>
                                      </div>
                                      <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />
                                    </div>
                                    {!isLoadingSave && (
                                      <div
                                        className={`${styles.btn} ${styles.brand} flex items-center truncate font-normal`}
                                        style={{
                                          ...((step === 1 ||
                                            (entityLevel === "company" && step === 2) ||
                                            currentLevel !== entityLevel ||
                                            (step === 3 &&
                                              currentLevel === entityLevel &&
                                              currentLevel !== "member" &&
                                              levelObj.is_confirmed_annual_half)) && {
                                            display: `none`,
                                          }),
                                        }}
                                        onMouseEnter={(e) => {
                                          if (step === 2 || step === 3) {
                                            let step2Text = ``;
                                            let step2Text2 = `開発部門や総務部門などの売上目標に直接関わらない部門は目標リストから削除し、\n営業部門などの売上に直結する部門を残す形でリストを編集してください。`;
                                            let step3Text = ``;
                                            if (currentLevel !== "" && parentEntityLevel !== "root") {
                                              step2Text = `${parentEntityLevel === "company" ? `` : `この`}${
                                                mappingEntityName[parentEntityLevel][language]
                                              }内で売上目標に関わる${
                                                mappingEntityName[currentLevel][language]
                                              }リストを編集する`;
                                              step3Text = `${
                                                parentEntityLevel === "company"
                                                  ? ``
                                                  : `この${mappingEntityName[parentEntityLevel][language]}内の`
                                              }各${mappingEntityName[currentLevel][language]}の売上目標を設定する`;
                                            }
                                            if (currentLevel === "company") {
                                              step3Text = `全社の売上目標を設定する`;
                                              step2Text2 = ``;
                                            }
                                            if (currentLevel === "member") {
                                              step2Text2 = `開発部門や総務部門などの売上目標に直接関わらないメンバーは目標リストから削除し、\n営業部門などの売上に直結するメンバーを残す形でリストを編集してください。`;
                                            }

                                            handleOpenTooltip({
                                              e: e,
                                              display: "top",
                                              content: step === 2 ? step2Text : step === 3 ? step3Text : ``,
                                              content2: step2Text2 ? step2Text2 : undefined,
                                              marginTop: step2Text2 ? 48 : 9,
                                              itemsPosition: step2Text2 ? "left" : "center",
                                            });
                                          }
                                        }}
                                        onMouseLeave={handleCloseTooltip}
                                        onClick={(e) => {
                                          // ------------------- 🔹step2🔹 -------------------
                                          if (step === 2) {
                                            if (!entityGroupObj.parent_entity_id)
                                              return alert(
                                                `${
                                                  entityGroupObj.parent_entity_name
                                                    ? `${entityGroupObj.parent_entity_name}の`
                                                    : ``
                                                }データが見つかりませんでした。`
                                              );
                                            levelObj;
                                            entityGroupObj;
                                            // 現在のレベルの親レベルを特定して引数に渡す

                                            handleOpenEditEntityListByParentModal({
                                              parentEntityId: entityGroupObj.parent_entity_id,
                                            });
                                          }
                                          // ------------------- 🔹step2🔹 ここまで -------------------
                                          // ------------------- 🔹step3🔹 -------------------
                                          if (step === 3) {
                                            if (!entityGroupObj.entities?.length)
                                              return alert("グループ内に１つ以上の部門・メンバーを追加してください。");

                                            // 全社〜係レベルまでは年度
                                            if (currentLevel !== "member") {
                                              // 上位エンティティ内の全てのエンティティ配列をグローバルstateに追加する
                                              const newParentEntityGroup = {
                                                fiscalYear: upsertSettingEntitiesObj.fiscalYear,
                                                periodType: "year_half", // レベルに合わせた目標の期間タイプ、売上推移用
                                                parentEntityLevelId: levelObj.id,
                                                parentEntityLevel: parentEntityLevel,
                                                parentEntityId: entityGroupObj.parent_entity_id,
                                                parentEntityName: entityGroupObj.parent_entity_name,
                                                entityLevel: currentLevel,
                                                entities: entityGroupObj.entities,
                                              } as UpsertSettingEntitiesObj;

                                              setUpsertSettingEntitiesObj(newParentEntityGroup);
                                              setIsSettingTargetMode(true);
                                            }
                                            // メンバーレベルは上期か下期どちらを設定するか選択
                                            else {
                                              // 上半期と下半期それぞれでグループ内のエンティティ全てのis_confirmがtrueかチェック
                                              const isConfirmFirstHalf = entityGroupObj.entities.every(
                                                (entity) => entity.is_confirmed_first_half_details
                                              );
                                              const isConfirmSecondHalf = entityGroupObj.entities.every(
                                                (entity) => entity.is_confirmed_second_half_details
                                              );
                                              setSelectedMemberAndPeriodType({
                                                memberGroupObjByParent: entityGroupObj,
                                                periodType: "first_half_details", // 上期~月度
                                                isConfirmFirstHalf: isConfirmFirstHalf,
                                                isConfirmSecondHalf: isConfirmSecondHalf,
                                              });

                                              const sectionWidth = 330;
                                              handleOpenSectionMenu({
                                                e,
                                                title: "selectTargetPeriodTypeForMember",
                                                displayX: "bottom_left",
                                                fadeType: "fade_down",
                                                maxWidth: sectionWidth,
                                                minWidth: sectionWidth,
                                              });
                                              // setOpenSubMenu({
                                              //   display: "left",
                                              //   fadeType: "fade_down",
                                              //   sectionMenuWidth: sectionWidth,
                                              // });
                                            }
                                          }
                                          // ------------------- 🔹step3🔹 -------------------
                                        }}
                                      >
                                        {step === 2 && `リスト編集`}
                                        {step === 3 && (
                                          <FiPlus className={`mr-[3px] stroke-[3] text-[12px] text-[#fff]`} />
                                        )}
                                        {step === 3 && `目標設定`}
                                      </div>
                                    )}
                                    {isLoadingSave && currentLevel === entityLevel && (
                                      <div className={`flex min-h-[30px] min-w-[83px] items-center justify-end`}>
                                        <SpinnerX h="h-[24px]" w="w-[24px]" />
                                      </div>
                                    )}
                                  </h3>
                                  <ul className={`w-full`}>
                                    {!!entityGroupObj.entities?.length &&
                                      entityGroupObj.entities.map((entityObj, rowEntityIndex) => {
                                        const isConfirmAH = entityObj.is_confirmed_annual_half;
                                        const isConfirmFH = entityObj.is_confirmed_first_half_details;
                                        const isConfirmSH = entityObj.is_confirmed_second_half_details;
                                        // エンティティが設定済みかどうか
                                        let settingState = "notSet";
                                        // 全て設定済み
                                        if (isConfirmAH && isConfirmFH && isConfirmSH) {
                                          settingState = "setAll";
                                        }
                                        // 年度のみ
                                        else if (isConfirmAH && !isConfirmFH && !isConfirmSH) {
                                          settingState = "setAnnualHalfOnly";
                                        }
                                        // 上半期まで
                                        else if (isConfirmAH && isConfirmFH && !isConfirmSH) {
                                          settingState = "setFirstHalf";
                                        }
                                        // 下半期まで
                                        else if (isConfirmAH && !isConfirmFH && isConfirmSH) {
                                          settingState = "setSecondHalf";
                                        }

                                        // 現在設定中のレベルのみに適用 追加した各エンティティ内にメンバーがいるかどうか人数をcountで確認 エンティティidをキーとして値を取得
                                        let isNoMember = false;
                                        if (entityLevel === currentLevel && step === 2) {
                                          if (addedEntitiesMemberCountQueryData) {
                                            try {
                                              if (entityObj.entity_id in addedEntitiesMemberCountQueryData) {
                                                const addedEntityMemberCountObj =
                                                  addedEntitiesMemberCountQueryData[entityObj.entity_id];
                                                isNoMember = addedEntityMemberCountObj.member_count > 0 ? false : true;
                                              } else {
                                                isNoMember = true;
                                              }
                                              console.log("🔥🔥🔥🔥🔥🔥 isNoMember", isNoMember, entityObj.entity_name);
                                            } catch (error: any) {
                                              console.error(`❌エラー：`, error);
                                            }
                                          }
                                        }

                                        return (
                                          <li
                                            key={`list_${levelObj.entity_level}_${entityGroupObj.parent_entity_id}_${entityObj.entity_name}_${entityObj.entity_id}_${rowEntityIndex}`}
                                            className={`flex w-full items-center justify-between border-b border-solid border-[var(--color-border-light)] pb-[9px] pt-[12px]`}
                                            style={{ ...(rowEntityIndex === 0 && { paddingTop: `15px` }) }}
                                          >
                                            <div className={`flex max-w-[290px] items-center`}>
                                              <div className={`max-w-[290px] truncate text-[14px] font-bold`}>
                                                {entityObj.entity_name}
                                              </div>
                                            </div>
                                            <div className={`flex min-h-[30px] items-center`}>
                                              {isNoMember && (
                                                <>
                                                  <span className="text-[13px] text-[var(--main-color-tk)]">
                                                    メンバー所属なし
                                                  </span>
                                                </>
                                              )}
                                              {!isNoMember && (
                                                <>
                                                  {settingState === "notSet" && (
                                                    <span className="text-[13px] text-[var(--color-text-sub)]">
                                                      未設定
                                                    </span>
                                                  )}
                                                  {settingState !== "notSet" && (
                                                    <div className={`flex items-center space-x-[6px]`}>
                                                      {settingState === "setAll" && (
                                                        <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                                                      )}
                                                      {settingState !== "setAll" && (
                                                        <>
                                                          <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                                                        </>
                                                      )}
                                                    </div>
                                                  )}
                                                </>
                                              )}
                                            </div>
                                          </li>
                                        );
                                      })}
                                  </ul>
                                </li>
                              );
                            })}
                        </ul>
                      </div> */}
                    </Fragment>
                  );
                })}
            </div>
            {/* ------------------------ 右コンテナ 下エンティティレベルコンテナ ここまで ------------------------ */}
          </div>
          {/* -------------------------------- 右コンテナ ここまで -------------------------------- */}
        </div>
        {/* -------------------------------- コンテンツエリア ここまで -------------------------------- */}
      </div>
      {/* ===================== スクロールコンテナ ここまで ===================== */}

      {/* ---------------------------- 🌟セッティングメニュー🌟 ---------------------------- */}
      {/* クリック時のオーバーレイ */}
      {openSectionMenu && <div className={`${styles.menu_overlay}`} onClick={handleCloseSectionMenu}></div>}
      {openSectionMenu && (
        <div
          ref={sectionMenuRef}
          className={`${styles.settings_menu} fixed z-[3000] h-auto rounded-[6px] ${
            openSectionMenu.fadeType ? getFadeTypeClass(openSectionMenu.fadeType) : ``
          }`}
          style={{
            top: `${openSectionMenu.y}px`,
            ...(openSectionMenu.minWidth && { minWidth: `${openSectionMenu.minWidth}px` }),
            ...(openSectionMenu.maxWidth && { maxWidth: `${openSectionMenu.maxWidth}px` }),
            ...((openSectionMenu.displayX === "center" || !openSectionMenu.displayX) && {
              left: `${openSectionMenu.x}px`,
            }),
            ...(openSectionMenu.displayX === "right" && {
              right: `${openSectionMenu.x}px`,
            }),
            ...(openSectionMenu.displayX === "left" && {
              right: `${openSectionMenu.x}px`,
            }),
            ...(openSectionMenu.displayX === "bottom_left" && {
              right: `${openSectionMenu.x}px`,
            }),
          }}
        >
          {/* ------------------------ 選択メニュー ------------------------ */}
          {/* ------------- メンバーレベル時 目標の期間タイプ選択 ------------- */}
          {openSectionMenu.title === "selectTargetPeriodTypeForMember" && !!selectedMemberAndPeriodType && (
            <>
              <h3 className={`w-full px-[20px] pt-[20px] text-[15px] font-bold`}>
                <div className="flex max-w-max flex-col">
                  <span>目標設定メニュー</span>
                  <div className={`${styles.section_underline} w-full`} />
                </div>
              </h3>
              <DescriptionList content={`目標設定を行う期間を選択してください。`} />
              {/* ------------------------------------ */}
              <li
                className={`${styles.list} ${styles.not_hoverable}`}
                onMouseEnter={(e) => {
                  handleOpenPopupMenu({ e, title: "settingSalesTargetEntity", displayX: "left" });
                }}
                onMouseLeave={() => {
                  if (openPopupMenu) handleClosePopupMenu();
                }}
              >
                {/* <div className="pointer-events-none flex min-w-[130px] items-center"> */}
                <div className="pointer-events-none flex min-w-[90px] items-center">
                  {/* <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" /> */}
                  <div className="flex select-none items-center space-x-[2px]">
                    <span className={`${styles.list_title}`}>期間</span>
                    <span className={``}>：</span>
                  </div>
                </div>
                <select
                  className={`${styles.select_box} truncate`}
                  value={selectedMemberAndPeriodType.periodType}
                  onChange={(e) => {
                    setSelectedMemberAndPeriodType({ ...selectedMemberAndPeriodType, periodType: e.target.value });
                    // if (openPopupMenu) handleClosePopupMenu();
                  }}
                >
                  <option value={`first_half`}>上半期〜月次</option>
                  <option value={`second_half`}>下半期〜月次</option>
                </select>
                <div className={`ml-[16px] flex items-center space-x-[3px] whitespace-nowrap`}>
                  {((selectedMemberAndPeriodType.periodType === "first_half" &&
                    selectedMemberAndPeriodType.isConfirmFirstHalf) ||
                    (selectedMemberAndPeriodType.periodType === "second_half" &&
                      selectedMemberAndPeriodType.isConfirmSecondHalf)) && (
                    <>
                      <span className={`text-[#00d436]`}>設定済み</span>
                      <BsCheck2 className="pointer-events-none min-h-[18px] min-w-[18px] stroke-1 text-[18px] text-[#00d436]" />
                    </>
                  )}
                  {!(
                    (selectedMemberAndPeriodType.periodType === "first_half" &&
                      selectedMemberAndPeriodType.isConfirmFirstHalf) ||
                    (selectedMemberAndPeriodType.periodType === "second_half" &&
                      selectedMemberAndPeriodType.isConfirmSecondHalf)
                  ) && <span className={`text-[var(--main-color-tk)]`}>未設定</span>}
                </div>
              </li>
              {/* ------------------------------------ */}
              <hr className="min-h-[1px] w-full bg-[#999]" />
              {/* ------------------------ 適用・戻る ------------------------ */}
              <li className={`${styles.list} ${styles.btn_area} space-x-[20px]`}>
                <div
                  className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${styles.active}`}
                  onClick={() => {
                    // 上位エンティティ内の全てのエンティティ配列をグローバルstateに追加する
                    const newParentEntityGroup = {
                      fiscalYear: upsertSettingEntitiesObj.fiscalYear,
                      periodType: selectedMemberAndPeriodType.periodType, // レベルに合わせた目標の期間タイプ、売上推移用
                      parentEntityLevel: parentEntityLevel,
                      parentEntityId: selectedMemberAndPeriodType.memberGroupObjByParent.parent_entity_id,
                      parentEntityName: selectedMemberAndPeriodType.memberGroupObjByParent.parent_entity_name,
                      entityLevel: currentLevel,
                      entities: selectedMemberAndPeriodType.memberGroupObjByParent.entities,
                    } as UpsertSettingEntitiesObj;

                    setUpsertSettingEntitiesObj(newParentEntityGroup);
                    setIsSettingTargetMode(true);
                  }}
                >
                  <span>作成・編集</span>
                </div>
                <div
                  className={`transition-bg02 ${styles.edit_btn} ${styles.cancel}`}
                  onClick={() => {
                    setSelectedMemberAndPeriodType(null);
                    handleCloseSectionMenu();
                  }}
                >
                  <span>戻る</span>
                </div>
              </li>
              {/* ------------------------ 適用・戻る ここまで ------------------------ */}
            </>
          )}
          {/* ------------- メンバーレベル時 目標の期間タイプ選択 ここまで ------------- */}
          {/* ------------------------ 選択メニュー ------------------------ */}
        </div>
      )}
      {/* ---------------------------- 🌟セッティングメニュー🌟 ここまで ---------------------------- */}

      {/* ---------------------------- 🌟説明ポップアップ🌟 ---------------------------- */}
      {openPopupMenu && (
        <div
          className={`${styles.description_menu} shadow-all-md border-real-with-shadow pointer-events-none fixed z-[3500] flex min-h-max flex-col rounded-[6px]`}
          style={{
            top: `${openPopupMenu.y}px`,
            ...(openPopupMenu.maxWidth && { maxWidth: `${openPopupMenu.maxWidth}px` }),
            ...(openPopupMenu.minWidth && { minWidth: `${openPopupMenu.minWidth}px` }),
            ...(openPopupMenu?.displayX === "right" && {
              left: `${openPopupMenu.x}px`,
            }),
            ...(openPopupMenu?.displayX === "left" && {
              right: `${openPopupMenu.x}px`,
            }),
            ...(openPopupMenu?.displayX === "bottom_left" && {
              right: `${openPopupMenu.x}px`,
            }),
            ...(["settingSalesTarget"].includes(openSectionMenu?.title ?? "") && {
              animationDelay: `0.2s`,
              animationDuration: `0.5s`,
            }),
          }}
        >
          <div className={`min-h-max w-full font-bold ${styles.title}`}>
            <div className="flex max-w-max flex-col">
              <span>{mappingPopupTitle[openPopupMenu.title][language]}</span>
              <div className={`${styles.underline} w-full`} />
            </div>
          </div>

          <ul className={`flex flex-col rounded-[6px] ${styles.u_list}`}>
            {["step"].includes(openPopupMenu.title) &&
              mappingDescriptions[openPopupMenu.title].map((item, index) => (
                <li
                  key={item.title + index.toString()}
                  className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}
                  style={{ ...(openPopupMenu.title === "printTips" && { padding: "3px 14px" }) }}
                >
                  <div className="flex min-w-max items-center space-x-[3px]">
                    <RxDot className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                    <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                      {item.title}
                    </span>
                  </div>
                  <p className="select-none text-[12px]" style={{ whiteSpace: "pre-wrap" }}>
                    {item.content}
                  </p>
                </li>
              ))}
            {!["step"].includes(openPopupMenu.title) && (
              <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
                <p className="select-none whitespace-pre-wrap text-[12px] leading-[20px]">
                  {openPopupMenu.title === "settingSalesTargetEntity" &&
                    "選択中の会計年度の目標を表示します。\n会計年度は2020年から現在まで選択可能で、翌年度はお客様の決算日から現在の日付が3ヶ月を切ると表示、設定、編集が可能となります。"}
                  {/* {openPopupMenu.title === "step" &&
                    `以下のステップ1~3を繰り返し、${upsertSettingEntitiesObj.fiscalYear}年度の売上目標に関わるレイヤーを「全社からメンバーまで」それぞれ上位階層から追加していき、売上目標を段階的に設定しましょう！`} */}
                </p>
                {/* {openPopupMenu.title === "step" && (
                  <>
                    <p className="!mt-[12px] select-none whitespace-pre-wrap text-[12px] leading-[20px]">
                      {`全社から係までのレイヤーでは「年度・半期」の売上目標を設定し、メンバーレイヤーでは各メンバーの「上期内の半期から月次」もしくは「下期内の半期から月次」までの売上目標を設定します。`}
                    </p>
                    <p className="!mt-[12px] select-none whitespace-pre-wrap text-[12px] leading-[20px]">
                      {`メンバーレイヤーの半期から月次の目標設定の設定が完了した後、ステップ4で全てのメンバーの四半期・月次の売上目標を集計し、全社までの上位レイヤーの四半期・月次の売上目標を反映することで${upsertSettingEntitiesObj.fiscalYear}年度の売上目標が完成となります！`}
                    </p>
                  </>
                )} */}
              </li>
            )}
            {/* {openPopupMenu.title === "step" && <hr className="mb-[6px] min-h-[1px] w-full bg-[#666]" />} */}
            {/* {openPopupMenu.title === "step" &&
              descriptionPrintTips.map((obj, index) => (
                <li key={obj.title} className={`flex w-full space-x-[3px] px-[14px] py-[3px] text-[12px]`}>
                  <span className="min-w-[80px] max-w-[80px] font-bold">・{obj.title}：</span>
                  <p className="whitespace-pre-wrap">{obj.content}</p>
                </li>
              ))} */}
          </ul>
        </div>
      )}
      {/* ---------------------------- 🌟説明ポップアップ🌟 ここまで ---------------------------- */}

      {/* ---------------------------- エンティティリスト編集モーダル ---------------------------- */}
      {isOpenEditEntityListByParentModal && editParentEntity && (
        <>
          <div
            className={`fade03_forward fixed left-0 top-0 z-[100] h-[100vh] w-[100vw] bg-[#00000056] backdrop-blur-[6px]`}
            onClick={handleCloseEditEntityListByParentModal}
          ></div>
          <div className={`${styles.switch_container} fade05_forward`}>
            {/* 保存キャンセルエリア */}
            <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[30px] text-center text-[18px]">
              <div
                className="relative flex min-w-[125px] cursor-pointer select-none items-center pl-[10px] text-start font-semibold hover:text-[#aaa]"
                onClick={handleCloseEditEntityListByParentModal}
              >
                {/* <span>キャンセル</span> */}
                <BsChevronLeft className="z-1 absolute  left-[-25px] top-[50%] translate-y-[-50%] text-[24px]" />
                <span>戻る</span>
              </div>
              <div className="flex select-none items-center space-x-[6px] font-bold">
                <span className="max-w-[330px] truncate">{editParentEntity.name}</span>
                <span>リスト編集</span>
              </div>
              {/* <div className="-translate-x-[25px] font-bold">カラム並び替え・追加/削除</div> */}
              <div
                className={`min-w-[125px] cursor-pointer select-none text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${
                  styles.save_text
                } ${
                  selectedActiveItemIdsMap.size === 0 && selectedInactiveItemIdsMap.size === 0
                    ? `!text-[color-text-sub]`
                    : ``
                } ${selectedInactiveItemIdsMap.size > 0 ? `!text-[var(--bright-green)]` : ``} ${
                  selectedActiveItemIdsMap.size > 0
                    ? `!text-[var(--main-color-tk)] hover:!text-[var(--main-color-tkc0)]`
                    : ``
                }`}
                onClick={async () => {
                  if (selectedActiveItemIdsMap.size === 0 && selectedInactiveItemIdsMap.size === 0) return;
                  // 売上目標に追加
                  if (selectedInactiveItemIdsMap.size > 0 && selectedActiveItemIdsMap.size === 0) {
                    handleUpdateEntityList("add");
                  }
                  // 売上目標から削除
                  if (selectedActiveItemIdsMap.size > 0 && selectedInactiveItemIdsMap.size === 0) {
                    handleUpdateEntityList("remove");
                  }
                }}
              >
                <span
                  onMouseEnter={(e) => {
                    if (selectedActiveItemIdsMap.size === 0 && selectedInactiveItemIdsMap.size === 0) return;
                    const text =
                      selectedInactiveItemIdsMap.size > 0
                        ? `選択したアイテムをリストに追加`
                        : selectedActiveItemIdsMap.size > 0
                        ? `選択したアイテムをリストから削除`
                        : ``;
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: text,
                      marginTop: 12,
                    });
                  }}
                  onMouseLeave={handleCloseTooltip}
                >
                  {selectedInactiveItemIdsMap.size > 0 && selectedActiveItemIdsMap.size === 0 && `追加`}
                  {selectedActiveItemIdsMap.size > 0 && selectedInactiveItemIdsMap.size === 0 && `削除`}
                </span>
              </div>
            </div>
            {/* メインコンテンツ コンテナ */}
            <div className={`${styles.edit_contents_container}`}>
              {/* 右コンテンツボックス */}
              <div className={`flex h-full  basis-5/12 flex-col items-center ${styles.content_box}`}>
                {/* タイトルエリア */}
                <div className={`${styles.title} w-full space-x-[12px] text-[var(--color-edit-arrow-disable-color)]`}>
                  <div
                    className={`flex-center h-[30px] cursor-not-allowed rounded-[9px] px-[12px] ${styles.icon_button} ${
                      selectedActiveItemIdsMap.size > 0 ? `${styles.inactive}` : ``
                    } ${selectedInactiveItemIdsMap.size > 0 ? `${styles.add}` : ``}`}
                    onMouseEnter={(e) => {
                      const text =
                        selectedInactiveItemIdsMap.size > 0
                          ? `選択したアイテムをリストに追加`
                          : `目標リストに追加するアイテムを選択してください`;
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: text,
                        marginTop: 6,
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                    onClick={async () => {
                      if (selectedActiveItemIdsMap.size > 0) return;
                      // 売上目標に追加
                      if (selectedInactiveItemIdsMap.size > 0) {
                        handleUpdateEntityList("add");
                      }
                    }}
                  >
                    <span className="text-[12px]">追加</span>
                  </div>
                  <div
                    className={`flex-center h-[30px] cursor-not-allowed rounded-[9px] px-[12px] ${styles.icon_button} ${
                      selectedActiveItemIdsMap.size > 0 ? `${styles.remove}` : ``
                    } ${selectedInactiveItemIdsMap.size > 0 ? `${styles.inactive}` : ``}`}
                    onMouseEnter={(e) => {
                      const text =
                        selectedActiveItemIdsMap.size > 0
                          ? `選択したアイテムをリストから削除`
                          : `目標リストから削除するアイテムを選択してください`;
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: text,
                        marginTop: 6,
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                    onClick={() => {
                      if (selectedInactiveItemIdsMap.size > 0) return;
                      if (selectedActiveItemIdsMap.size > 0) {
                        handleUpdateEntityList("remove");
                      }
                    }}
                  >
                    <span className="text-[12px]">削除</span>
                  </div>

                  <div
                    // ref={resetRightRef}
                    className={`flex-center h-[30px] w-[30px] cursor-not-allowed rounded-full  ${styles.icon_button} ${
                      !!selectedActiveItemIdsMap.size || !!selectedInactiveItemIdsMap.size
                        ? `${styles.arrow_right_reset_active}`
                        : ``
                    }`}
                    onMouseEnter={(e) => {
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: `リセット`,
                        marginTop: 6,
                      });
                    }}
                    onMouseLeave={handleCloseTooltip}
                    onClick={() => {
                      if (selectedActiveItemIdsMap.size > 0) setSelectedActiveItemIdsMap(new Map());
                      if (selectedInactiveItemIdsMap.size > 0) setSelectedInactiveItemIdsMap(new Map());
                    }}
                  >
                    <GrPowerReset className="pointer-events-none text-[16px]" />
                  </div>
                  {(!!selectedActiveItemIdsMap.size || !!selectedInactiveItemIdsMap.size) && (
                    <div className="ml-auto flex h-full w-fit flex-1 items-center justify-end">
                      {selectedActiveItemIdsMap.size > 0 && (
                        <span className={`text-[14px] text-[var(--color-text-brand-f)]`}>
                          {selectedActiveItemIdsMap.size}件選択中
                        </span>
                      )}
                      {selectedInactiveItemIdsMap.size > 0 && (
                        <span className={`text-[14px] text-[var(--color-text-brand-f)]`}>
                          {selectedInactiveItemIdsMap.size}件選択中
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {/* カラムリストエリア */}
                <ul className={`${styles.sortable_list}`}>
                  {editAllEntityListByParent.map((item, index) => {
                    const isDisplay = editCurrentDisplayEntityMapInParentGroup.has(item.id);
                    return (
                      <li
                        key={`right_${item.id}_${item.target_type}`}
                        className={`${styles.item} ${styles.item_right} ${!isDisplay ? `${styles.inactive}` : ``} ${
                          selectedActiveItemIdsMap.has(item.id) ? `${styles.remove}` : ``
                        } ${selectedInactiveItemIdsMap.has(item.id) ? `${styles.add}` : ``}`}
                        onClick={() => {
                          // 表示中のitemをクリック
                          if (isDisplay) {
                            if (selectedInactiveItemIdsMap.size > 0) setSelectedInactiveItemIdsMap(new Map()); // 非表示選択リストはリセット

                            const newMap = new Map(selectedActiveItemIdsMap); // 現在のMapのシャローコピーを作成

                            if (newMap.has(item.id)) {
                              // 既に入っている場合は取り除く
                              newMap.delete(item.id);
                            } else {
                              // 含まれていない場合は追加する
                              newMap.set(item.id, item);
                            }

                            setSelectedActiveItemIdsMap(newMap);
                          }
                          // 非表示のitem
                          else {
                            if (selectedActiveItemIdsMap.size > 0) setSelectedActiveItemIdsMap(new Map()); // 表示中選択リストはリセット

                            const newMap = new Map(selectedInactiveItemIdsMap);

                            if (newMap.has(item.id)) {
                              // 既に入っている場合は取り除く
                              newMap.delete(item.id);
                            } else {
                              // 含まれていない場合は追加する
                              newMap.set(item.id, item);
                            }
                            setSelectedInactiveItemIdsMap(newMap);
                          }
                        }}
                      >
                        <div className={styles.details}>
                          <span className="truncate">{getEntityTargetTitle(currentLevel, item)}</span>
                          {/* <MdOutlineDragIndicator className="fill-[var(--color-text)]" /> */}
                        </div>
                        {currentLevel === "member" && (
                          <>
                            {isDisplay && (
                              <div className={`flex min-w-[115px] items-center justify-end`}>
                                <span className="min-w-max text-[10px] text-[var(--color-text-brand-f)]">表示中</span>
                              </div>
                            )}
                            {!isDisplay && <div className={`flex items-center justify-end`}></div>}
                          </>
                        )}
                        {currentLevel !== "member" && (
                          <>
                            {isDisplay && (
                              <div className={`flex min-w-[115px] items-center justify-end`}>
                                {!(entityIdsWithMembersSetObj && entityIdsWithMembersSetObj.has(item.id)) && (
                                  <span className="mr-[6px] min-w-max text-[10px] text-[var(--main-color-tk)]">
                                    メンバー所属なし
                                  </span>
                                )}
                                <span className="min-w-max text-[10px] text-[var(--color-text-brand-f)]">表示中</span>
                              </div>
                            )}
                            {!isDisplay && !(entityIdsWithMembersSetObj && entityIdsWithMembersSetObj.has(item.id)) && (
                              <div className={`flex items-center justify-end`}>
                                {!(entityIdsWithMembersSetObj && entityIdsWithMembersSetObj.has(item.id)) && (
                                  <span className="min-w-max text-[10px] text-[var(--color-text-disabled)]">
                                    メンバー所属なし
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}

                        {/* {item.target_type === "sales_target" && (
                        <span className="min-w-max text-[10px] text-[var(--color-text-brand-f)]">表示中</span>
                      )} */}
                      </li>
                    );
                  })}
                </ul>
                {/* <span ref={scrollBottomRef}></span> */}
              </div>
            </div>
            {/* {hoveredItemPosModal && <TooltipModal />} */}
          </div>
        </>
      )}
      {/* ---------------------------- エンティティリスト編集モーダル ここまで ---------------------------- */}

      {/* ---------------------- 売上目標リセットタイプ選択 リセットモーダル ---------------------- */}
      {isOpenResetTargetModal && (
        <ConfirmationModal
          titleText={`売上目標をリセットしてもよろしいですか？`}
          sectionP1={`確定することで${
            resetTargetType === `fiscal_year`
              ? `${upsertSettingEntitiesObj.fiscalYear}年度の売上目標を全てリセットして、最初から目標設定を始めます。`
              : `${
                  selectedPeriodTypeForMemberLevel === "first_half_details" ? `上期詳細` : `下期詳細`
                }の売上目標をリセットしてメンバーレイヤーから目標設定を始めます。`
          }この操作は確定後、取り消すことができません。`}
          cancelText="戻る"
          submitText="リセットを確定"
          buttonColor="red"
          zIndex="6000px"
          zIndexOverlay="5800px"
          withAnnotation={true}
          annotationText="注：この操作は少し時間がかかります。画面を閉じずにお待ちください。"
          clickEventClose={() => {
            setIsOpenResetTargetModal(false);
            // setSaveTriggerSalesTarget(false); //トリガーをリセット
            // setInputSalesTargetsIdToDataMap({}); // 収集したデータをリセット
            // setIsOpenConfirmDialog(false); // ダイアログを閉じる
          }}
          clickEventSubmit={() => console.log("クリック")}
          withSelect={true}
          optionsSelect={[
            { value: "half_detail", displayValue: `${mappingResetType["half_detail"][language]}の売上目標をリセット` },
            {
              value: "fiscal_year",
              displayValue: `${mappingResetType["fiscal_year"][language]}の全ての売上目標をリセット`,
            },
          ]}
          selectState={resetTargetType}
          onChangeEventSelect={(e) => {
            setResetTargetType(e.target.value as "half_detail" | "fiscal_year");
          }}
        />
      )}
      {/* ---------------------- 売上目標リセットタイプ選択 リセットモーダル ここまで ---------------------- */}
    </>
  );
};

export const UpsertTargetEntity = memo(UpsertTargetEntityMemo);
