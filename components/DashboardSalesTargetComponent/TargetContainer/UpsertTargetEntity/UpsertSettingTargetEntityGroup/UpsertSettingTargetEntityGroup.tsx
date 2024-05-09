import styles from "../../../DashboardSalesTargetComponent.module.css";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import {
  CSSProperties,
  Dispatch,
  Fragment,
  SetStateAction,
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { FaSave } from "react-icons/fa";
import { IoIosSave } from "react-icons/io";
import { MdSaveAlt } from "react-icons/md";
import { RiSave3Fill } from "react-icons/ri";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import {
  Department,
  EntitiesHierarchy,
  EntityLevelNames,
  EntityLevels,
  FiscalYearMonthObjForTarget,
  KeysSalesTargetsHalfDetails,
  KeysSalesTargetsYearHalf,
  MemberAccounts,
  MemberGroupsByParentEntity,
  Office,
  SalesTargetsHalfDetails,
  SalesTargetsYearHalf,
  Section,
  TotalSalesTargetsHalfDetails,
  TotalSalesTargetsHalfDetailsObj,
  TotalSalesTargetsYearHalfObj,
  Unit,
  UpsertSettingEntitiesObj,
} from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { SparkChart } from "@/components/Parts/Charts/SparkChart/SparkChart";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { calculateFiscalYearStart } from "@/utils/Helpers/calculateFiscalYearStart";
import { toast } from "react-toastify";
import { calculateDateToYearMonth } from "@/utils/Helpers/calculateDateToYearMonth";
import { calculateFiscalYearMonths } from "@/utils/Helpers/CalendarHelpers/calculateFiscalMonths";
import { useQueryMemberAccountsFilteredByEntity } from "@/hooks/useQueryMemberAccountsFilteredByEntity";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { HiOutlineSelector, HiOutlineSwitchHorizontal } from "react-icons/hi";
import { GrPowerReset } from "react-icons/gr";
import { BsCheck2, BsChevronLeft } from "react-icons/bs";
import { IoAddOutline, IoChevronDownOutline } from "react-icons/io5";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { FallbackTargetTable } from "../../UpsertTarget/UpsertTargetGridTable/FallbackTargetTable";
import { UpsertSettingTargetGridTable } from "./UpsertSettingTargetGridTable/UpsertSettingTargetGridTable";
import { mappingEntityName } from "@/utils/mappings";
import { AreaChartTrend } from "./AreaChartTrend/AreaChartTrend";
import { DonutChartDeals } from "./DonutChartDeals/DonutChartDeals";
import { ConfirmationModal } from "@/components/DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { UpsertSettingTargetGridTableForMemberLevel } from "./UpsertSettingTargetGridTable/UpsertSettingTargetGridTableForMemberLevel";
import { MainTargetTableDisplayOnly } from "./UpsertSettingTargetGridTable/MainTargetTableDisplayOnly";
import { ImInfo } from "react-icons/im";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { useQuerySalesTargetsMain } from "@/hooks/useQuerySalesTargetsMain";
import Decimal from "decimal.js";
import { useQuerySalesTargetsMainHalfDetails } from "@/hooks/useQuerySalesTargetsMainHalfDetails";

export const columnHeaderListTarget = [
  "period_type",
  "sales_target",
  "share", // 「年度に対する上期・下期のシェア」、「半期に対する各月度のシェア」
  "yoy_growth", // 前年度の売上に対する売上目標の成長率
  "yo2y_growth", // 前年度前年伸び率実績(2年前から1年前の成長率)
  "last_year_sales",
  "two_years_ago_sales",
  "three_years_ago_sales",
  "sales_trend", // 売上推移(スパークチャート)
];
export const formatColumnName = (column: string, year: number): { ja: string; en: string; [key: string]: string } => {
  switch (column) {
    case "period_type":
      return { ja: "期間", en: "Period" };
    case "sales_target":
      return { ja: `売上目標 ${year}年度`, en: `FY${year} Sales Target` };
    case "share":
      return { ja: "シェア", en: "Share" };
    case "yoy_growth":
      return { ja: "前年比", en: "YoY Growth" };
    case "yo2y_growth":
      return { ja: "前年度前年伸び率実績", en: "Yo2Y Growth" };
    case "last_year_sales":
      return { ja: `${year - 1}年度`, en: `FY${year - 1}` };
    case "two_years_ago_sales":
      return { ja: `${year - 2}年度`, en: `FY${year - 2}` };
    case "three_years_ago_sales":
      return { ja: `${year - 3}年度`, en: `FY${year - 3}` };
    case "sales_trend":
      return { ja: `売上推移`, en: `Sales Trend` };

    default:
      return { ja: column, en: column };
      break;
  }
};

// Rowリスト 年度・上半期・下半期
export const rowHeaderListTarget = ["fiscal_year", "first_half", "second_half"];
// Rowリスト 上半期・Q1~Q2・01~06 isEndEntityの場合のみ使用 「末端エンティティ + メンバーエンティティ」
export const rowHeaderListTargetFirstHalf = [
  "first_half",
  "first_quarter",
  "second_quarter",
  "month_01",
  "month_02",
  "month_03",
  "month_04",
  "month_05",
  "month_06",
];
// Rowリスト 下半期・Q3~Q4・07~12 isEndEntityの場合のみ使用 「末端エンティティ + メンバーエンティティ」
export const rowHeaderListTargetSecondHalf = [
  "second_half",
  "third_quarter",
  "fourth_quarter",
  "month_07",
  "month_08",
  "month_09",
  "month_10",
  "month_11",
  "month_12",
];
export const formatRowName = (row: string, year: number): { ja: string; en: string; [key: string]: string } => {
  switch (row) {
    case "fiscal_year":
      // return { ja: `${year}年度`, en: `FY${year}` };
      return { ja: `年度`, en: `FY${year}` };
    case "first_half":
      return { ja: `上半期`, en: `${year}H1` };
    case "second_half":
      return { ja: `下半期`, en: `${year}H2` };

    default:
      return { ja: row, en: row };
      break;
  }
};
export const formatRowNameHalfDetails = (
  row: string,
  year: number,
  halfType: "first_half_details" | "second_half_details",
  annualFiscalMonths: FiscalYearMonthObjForTarget
): { ja: string; en: string; [key: string]: string } => {
  switch (row) {
    case "half_year":
      return halfType === "first_half_details" ? { ja: `上半期`, en: `H1` } : { ja: `下半期`, en: `H2` };
    case "first_quarter":
      return halfType === "first_half_details" ? { ja: `Q1`, en: `Q1` } : { ja: `Q3`, en: `Q3` };
    case "second_quarter":
      return halfType === "first_half_details" ? { ja: `Q2`, en: `Q2` } : { ja: `Q4`, en: `Q4` };
    case "month_01":
      return halfType === "first_half_details" ? { ja: ``, en: `Q2` } : { ja: `Q4`, en: `Q4` };

    default:
      return halfType === "first_half_details" ? { ja: `-`, en: `-` } : { ja: `-`, en: `-` };
      break;
  }
};
export const formatRowNameShort = (row: string, year: number): { ja: string; en: string; [key: string]: string } => {
  switch (row) {
    case "fiscal_year":
      return { ja: `FY${year}`, en: `FY${year}` };
    case "first_half":
      return { ja: `${year}H1`, en: `${year}H1` };
    case "second_half":
      return { ja: `${year}H2`, en: `${year}H2` };

    default:
      return { ja: row, en: row };
      break;
  }
};

export const getSubTargetTitle = (
  // entityLevel: 'department' | 'section' | 'unit' | 'office' | 'member',
  entityLevel: string,
  obj: Department | Section | Unit | Office | MemberAccounts
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

type Props = {
  settingEntityLevel: string;
  setIsSettingTargetMode: Dispatch<SetStateAction<boolean>>;
  setStep: Dispatch<SetStateAction<number>>;
  currentParentEntitiesForMember: {
    entity_level: string;
    entity_id: string;
    entity_name: string;
  }[];
};

// メンバーの直属の親エンティティでないメイン目標の場合は、「年度・半期」の入力
// メンバーの直属の親エンティティがメイン目標の場合は、「四半期・月度」の入力

/*
1.まず、ユーザーの会社のエンティティリストを取得して、どのエンティティまで作成されているかを把握
2.ユーザーのエンティティリストの中から、メンバーエンティティの直属の親エンティティを把握して変数に格納
3.例として、今回ユーザーの会社が「全社・事業部・課・係・メンバー」のエンティティを作成していた場合
  まず、「全社・事業部」で全社エンティティの「年度・上半期・下半期」の売上目標と「事業部」の中のそれぞれの事業部が全社の売上目標の総和からどう配分されるかシェアの振り分けをして、事業部エンティティの「年度・上半期・下半期」の売上目標を決定
4.次に「事業部・課」ですでに決定している事業部の「年度・上半期・下半期」の売上目標から
  課エンティティのそれぞれの課の「年度・上半期・下半期」の売上目標の配分を決定
5.同様に「課・係」ですでに決定している課の「年度・上半期・下半期」の売上目標から
  係エンティティのそれぞれの係の「年度・上半期・下半期」の売上目標の配分を決定
6.メンバーエンティティ以外のすべてエンティティの「年度・上半期・下半期」の売上目標が決まった後に
  「係・メンバー」の「上期・Q1・Q2・上期内の月度」の売上目標をそれぞれのメンバーの現在の新たにくる上期の案件状況や受注見込みなどを鑑みて、それぞれの係が各メンバー個人の「上期・Q1・Q2・上期内の月度」の売上目標を係の売上目標内でシェアを振り分けて決定し、同時に全ての係の「上期・Q1・Q2・上期内の月度」の売上目標が決定
7.係の「上期・Q1・Q2・上期内の月度」の売上目標が決定したことで、全ての係の積み上げから
  課・事業部・全社の「上期・Q1・Q2・上期内の月度」が決定
8.「下期・Q3・Q4・下期内の月度」の売上目標は各メンバーの下期の案件状況や受注見込み状況の見通しが見えた段階（下期の2,3ヶ月前など）で
  「下期・Q3・Q4・下期内の月度」の売上目標を6の手順で同様に目標設定する
*/

const UpsertSettingTargetEntityGroupMemo = ({
  settingEntityLevel,
  setIsSettingTargetMode,
  setStep,
  currentParentEntitiesForMember,
}: Props) => {
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUpsertTargetMode = useDashboardStore((state) => state.setUpsertTargetMode);
  // メイン目標設定対象
  // const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  // const setUpsertTargetObj = useDashboardStore((state) => state.setUpsertTargetObj);
  // 目標設定時の上位エンティティと紐づく設定対象の下位エンティティ配列・年度オブジェクト
  const upsertSettingEntitiesObj = useDashboardStore((state) => state.upsertSettingEntitiesObj);
  const setUpsertSettingEntitiesObj = useDashboardStore((state) => state.setUpsertSettingEntitiesObj);
  // ユーザーの会計年度の期首と期末のDateオブジェクト
  const fiscalYearStartEndDate = useDashboardStore((state) => state.fiscalYearStartEndDate);

  // メンバーレベル目標設定時 上期詳細、下期詳細
  const selectedPeriodTypeForMemberLevel = useDashboardStore((state) => state.selectedPeriodTypeForMemberLevel);

  // サブ目標リスト編集モード
  const [isOpenEditSubListModal, setIsOpenEditSubListModal] = useState(false);
  // サブ目標リスト編集 表示リスト
  const [editSubList, setEditSubList] = useState<MemberAccounts[] | Department[] | Section[] | Unit[] | Office[]>([]);
  // const [editSelectMode, setEditSelectMode] = useState<boolean | null>(null)
  // const [selectedActiveItemIds, setSelectedActiveItemIds] = useState<string[]>([]);
  // const [selectedInactiveItemIds, setSelectedInactiveItemIds] = useState<string[]>([]);
  const [selectedActiveItemIdsMap, setSelectedActiveItemIdsMap] = useState<
    Map<string, Department | Section | Unit | Office | MemberAccounts>
  >(new Map());
  const [selectedInactiveItemIdsMap, setSelectedInactiveItemIdsMap] = useState<
    Map<string, Department | Section | Unit | Office | MemberAccounts>
  >(new Map());

  // ローディング
  const [isLoading, setIsLoading] = useState(false);

  const handleReturn = () => {
    setUpsertSettingEntitiesObj({
      fiscalYear: upsertSettingEntitiesObj?.fiscalYear ?? "",
      periodType: "", // メンバーレベル以外は年度〜半期(fiscal_year), メンバーレベルなら半期詳細(details)
      parentEntityLevelId: "",
      parentEntityLevel: "",
      parentEntityId: "",
      parentEntityName: "",
      entityLevel: "",
      entities: [],
    } as UpsertSettingEntitiesObj);
    setIsSettingTargetMode(false);
    toast.error("エラー：会計年度データの取得に失敗しました...🙇‍♀️");
  };

  if (upsertSettingEntitiesObj?.entities?.length === 0) {
    setUpsertSettingEntitiesObj({
      fiscalYear: upsertSettingEntitiesObj?.fiscalYear ?? "",
      periodType: "", // メンバーレベル以外は年度〜半期(fiscal_year), メンバーレベルなら半期詳細(details)
      parentEntityLevelId: "",
      parentEntityLevel: "",
      parentEntityId: "",
      parentEntityName: "",
      entityLevel: "",
      entities: [],
    } as UpsertSettingEntitiesObj);
    setIsSettingTargetMode(false);
  }

  if (!userProfileState || !userProfileState.company_id || !upsertSettingEntitiesObj || !fiscalYearStartEndDate) {
    handleReturn();
    return null;
  }

  if (!userProfileState.customer_fiscal_end_month) {
    alert("お客様の決算日データが見つかりませんでした。");
    handleReturn();
    return null;
  }

  // -------------------------- 🌠useQuery現在のエンティティレベル🌠 --------------------------
  const addedEntityLevelsListQueryData: EntityLevels[] | undefined = queryClient.getQueryData([
    "entity_levels",
    "sales_target",
    upsertSettingEntitiesObj.fiscalYear,
  ]);
  // 現在のエンティティレベルid
  const currentLevelObj = useMemo(() => {
    if (!addedEntityLevelsListQueryData) return null;
    return addedEntityLevelsListQueryData.find((level) => level.entity_level === upsertSettingEntitiesObj.entityLevel);
  }, [addedEntityLevelsListQueryData]);
  // エンティティレベルのidのみで配列を作成(エンティティuseQuery用)
  const entityLevelIdsStr = useMemo(() => {
    if (!addedEntityLevelsListQueryData) return "";
    const entityLevelIds = addedEntityLevelsListQueryData.map((obj) => obj.id);
    return entityLevelIds?.length > 0 ? entityLevelIds.join(", ") : "";
  }, [addedEntityLevelsListQueryData]);
  // -------------------------- 🌠useQuery現在のエンティティレベル🌠 --------------------------
  // -------------------------- 🌠useQuery同じレベル内の全エンティティ🌠 --------------------------
  const entitiesHierarchyQueryData: EntitiesHierarchy | undefined = queryClient.getQueryData([
    "entities",
    "sales_target",
    upsertSettingEntitiesObj.fiscalYear,
    entityLevelIdsStr,
  ]);

  // 全てのレベルごとのエンティティから、現在のレベルのエンティティのみに絞り込む
  const queryDataAllEntitiesByCurrentLevel = useMemo(() => {
    if (!entitiesHierarchyQueryData) return [];
    const currentLevelEntityGroupByParent = Object.keys(entitiesHierarchyQueryData).includes(
      upsertSettingEntitiesObj.entityLevel
    )
      ? entitiesHierarchyQueryData[upsertSettingEntitiesObj.entityLevel as EntityLevelNames]
      : null;
    if (!currentLevelEntityGroupByParent) return [];
    // 各上位エンティティごとにグループ化されている各エンティティをflatMapでそれぞれの上位エンティティ別に分けずにフラットに現在のエンティティレベル内に存在する確定済みのエンティティを全て配列にまとめる => 売上目標を確定する際に全てのエンティティがis_confirmになっているか確認する
    const allEntitiesByCurrentLevel = currentLevelEntityGroupByParent
      .map((group) => group.entities.map((entity) => entity))
      .flatMap((array) => array);
    return allEntitiesByCurrentLevel;
  }, [entitiesHierarchyQueryData]);
  // -------------------------- 🌠useQuery同じレベル内の全エンティティ🌠 --------------------------

  // 🌟目標設定対象のエンティティ配列からエンティティidのみ取り出しSetオブジェクトに変換
  const targetEntityIdsSet = useMemo(
    () => new Set(upsertSettingEntitiesObj.entities.map((obj) => obj.entity_id)),
    [upsertSettingEntitiesObj.entities]
  );
  // Mapオブジェクト エンティティid => エンティティオブジェクト
  const targetEntityIdToObjMap = useMemo(
    () => new Map(upsertSettingEntitiesObj.entities.map((obj) => [obj.entity_id, obj])),
    [upsertSettingEntitiesObj.entities]
  );

  // 案件状況(ドーナツチャート)で表示するエンティティを切り替えるためのセレクトボックスに渡す選択肢のリストをメモ化
  const optionsEntity = useMemo(() => {
    return Array.from(targetEntityIdsSet).map((id) => ({
      id,
      entityName: targetEntityIdToObjMap.get(id)?.entity_name ?? "-",
    }));
  }, [targetEntityIdsSet, targetEntityIdToObjMap]);

  // 売上推移、案件状況を表示するレベル 親エンティティか子エンティティか companyレベルの場合は不要

  // ドーナツチャートで残ネタ・売上予測を表示するエンティティ
  const [selectedEntityIdForDonut, setSelectedEntityIdForDonut] = useState(
    upsertSettingEntitiesObj.entities[0].entity_id
  );

  // -------------------------- state関連 --------------------------
  // stickyを付与するrow
  const [stickyRow, setStickyRow] = useState<string | null>(null);

  // 🌠目標を保存
  // companyレベルの場合：総合目標テーブルのinputのみ集めてINSERT => 年度~半期
  // department~memberレベルの場合：各部門テーブルのinputを全て集めてINSERT => memberレベルのみ半期~月次
  // 各テーブルの入力値を格納するZustandのグローバルstate

  // 子コンポーネントからデータを収集する関数を保持するステート
  const inputSalesTargetsIdToDataMap = useDashboardStore((state) => state.inputSalesTargetsIdToDataMap);
  const setInputSalesTargetsIdToDataMap = useDashboardStore((state) => state.setInputSalesTargetsIdToDataMap);
  // 親から子へデータを収集を伝えるためのトリガー
  const saveTriggerSalesTarget = useDashboardStore((state) => state.saveTriggerSalesTarget);
  const setSaveTriggerSalesTarget = useDashboardStore((state) => state.setSaveTriggerSalesTarget);

  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);

  // 🌠目標を保存【companyレベル】
  // companyレベルの場合：総合目標テーブルのinputのみ集めてINSERT => 年度~半期

  // 🌠目標を保存【department~memberレベル】
  // ------------------------ 🌠保存ボタンクリック 全ての子コンポーネント内の目標を収集🌠 ここから ------------------------
  // 1. 保存ボタンクリック -> 子コンポーネントの各テーブルに目標をZustandに格納するようトリガーを発火
  const handleCollectInputTargets = () => {
    // 🔸会社レベル以外の総合目標の振り分けで目標設定するルート
    // 全ての期間の全ての部門の合計売上目標が総合目標と一致していない(allCompleteTargetsYearHalfがfalse)の場合にはアラートを出しリターン
    if (
      upsertSettingEntitiesObj.entityLevel !== "company" &&
      upsertSettingEntitiesObj.entityLevel !== "member" &&
      !allCompleteTargetsYearHalf
    ) {
      let alertMessage = `売上目標が未設定の${getDivName()}が存在します。`;
      // isNegativeが存在する場合にはアラートをnegative用で表示する
      if (salesTargetsYearHalfStatus && salesTargetsYearHalfStatus.some((targetPeriod) => targetPeriod.isNegative)) {
        const negativePeriodTarget = salesTargetsYearHalfStatus.find((target) => target.isNegative);
        const negativePeriod = negativePeriodTarget ? negativePeriodTarget.title[language] : ``;
        alertMessage = `${getDivName()}の${negativePeriod}売上目標の合計値が総合目標の売上目標と一致していません。`;
      }
      return alert(
        `${alertMessage}全ての${getDivName()}の売上目標の合計値が総合目標の${
          mappingDivName[upsertSettingEntitiesObj.parentEntityLevel as EntityLevelNames][language]
        }の売上目標と一致するように目標金額を振り分けてください。`
      );
    }

    // 🔸メンバーレベルのルート
    if (
      upsertSettingEntitiesObj.entityLevel === "member" &&
      (!allCompleteTargetsHalfDetails || !isAllCompleteMonthTargetsForMember)
    ) {
      if (!allCompleteTargetsHalfDetails) {
        let alertMessageHalf = `半期売上目標が未設定の${getDivName()}が存在します。`;
        // isNegativeが存在する場合にはアラートをnegative用で表示する
        if (
          salesTargetsHalfDetailsStatus &&
          salesTargetsHalfDetailsStatus.some((targetPeriod) => targetPeriod.isNegative)
        ) {
          const negativePeriodTarget = salesTargetsHalfDetailsStatus.find((target) => target.isNegative);
          const negativePeriod = negativePeriodTarget ? negativePeriodTarget.title[language] : ``;
          alertMessageHalf = `${getDivName()}の${negativePeriod}売上目標の合計値が総合目標の売上目標と一致していません。`;
        }
        return alert(
          `${alertMessageHalf}全ての${getDivName()}の半期売上目標の合計値が総合目標の${
            mappingDivName[upsertSettingEntitiesObj.parentEntityLevel as EntityLevelNames][language]
          }の半期売上目標と一致するように目標金額を振り分けてください。`
        );
      }
      if (!isAllCompleteMonthTargetsForMember) {
        let alertMessageMonthQuarter = `売上目標が未設定の${getDivName()}が存在します。`;
        // isCompleteAllMonthTargetsがfalseのメンバーを特定しアラートする
        if (
          monthTargetStatusMapForAllMembers &&
          Array.from(monthTargetStatusMapForAllMembers.values()).some((member) => !member.isCompleteAllMonthTargets)
        ) {
          const isNotCompleteMember = Array.from(monthTargetStatusMapForAllMembers.values()).find(
            (member) => !member.isCompleteAllMonthTargets
          );
          alertMessageMonthQuarter = isNotCompleteMember
            ? `${isNotCompleteMember.member_name}の売上目標が未入力です。`
            : `売上目標が未入力のメンバーがいます。`;
        }
        return alert(
          `${alertMessageMonthQuarter}全ての${getDivName()}の月次売上目標の合計値が各四半期の売上目標と一致するように目標金額を振り分けてください。`
        );
      }
    }

    // 保存ボタンクリックで、各コンポーネントに対して入力値をZustandに格納するようにトリガーを発火
    setSaveTriggerSalesTarget(true);
    console.log("✅✅✅ 親コンポーネント 保存ボタンクリック");

    // ローディング開始
    setIsLoading(true);
  };

  // 2. トリガーがtrueになってから全てのエンティティのデータが収集できたかをuseEffectで検知
  // 3-1. 今回の設定対象となるentitiesのlengthと売上目標の要素が一致し、全て完了したらダイアログを開く
  // 3-2. エラーが起きたらエラーメッセージを表示
  useEffect(() => {
    if (!saveTriggerSalesTarget) {
      if (isLoading) setIsLoading(false);
      return;
    }
    console.log(
      "✅✅✅ 親コンポーネント データ収集 全て収集できたか確認",
      Object.keys(inputSalesTargetsIdToDataMap).length,
      upsertSettingEntitiesObj.entities.length,
      inputSalesTargetsIdToDataMap,
      upsertSettingEntitiesObj.entities
    );
    if (Object.keys(inputSalesTargetsIdToDataMap).length !== upsertSettingEntitiesObj.entities.length) {
      console.log(
        "❌ 親コンポーネント データ収集 未収集のデータがあるためリターン",
        Object.keys(inputSalesTargetsIdToDataMap).length,
        upsertSettingEntitiesObj.entities.length,
        inputSalesTargetsIdToDataMap,
        upsertSettingEntitiesObj.entities
      );
      return;
    }
    const isCollectedAll =
      Object.values(inputSalesTargetsIdToDataMap).every((obj) => obj.isCollected) &&
      Object.keys(inputSalesTargetsIdToDataMap).every((id) => targetEntityIdsSet.has(id)) &&
      targetEntityIdsSet.size === Object.keys(inputSalesTargetsIdToDataMap).length;
    const hasError = Object.values(inputSalesTargetsIdToDataMap).some((obj) => obj.error !== null);

    console.log(
      "✅✅✅✅✅✅✅✅✅ 親コンポーネントuseEffect 全てデータ収集完了",
      "inputSalesTargetsIdToDataMap",
      inputSalesTargetsIdToDataMap,
      "isCollectedAll",
      isCollectedAll,
      "hasError",
      hasError
    );

    if (hasError || !isCollectedAll) {
      setIsLoading(false); // ローディング終了
      const errorEntityName =
        Object.values(inputSalesTargetsIdToDataMap).find((obj) => obj.error !== null)?.data.entity_name ?? "";
      alert(
        `${
          errorEntityName ? `「${errorEntityName}」の` : ``
        }売上目標の入力値に有効ではないデータが含まれているため、保存ができませんでした。 再度入力内容を確認してください。🙇‍♀️`
      );
      setSaveTriggerSalesTarget(false); //トリガーをリセット
      setInputSalesTargetsIdToDataMap({}); // 収集したデータをリセット
      if (isLoading) setIsLoading(false); // ローディング終了
      // save関連のstateをリセット
      setCurrentActiveIndexSave(0);
      setAllSaved(false);
      return;
    }

    if (isCollectedAll) {
      if (isLoading) setIsLoading(false); // ローディング終了
      // 全ての収集が完了したらダイアログを表示
      setIsOpenConfirmDialog(true);
      setSaveTriggerSalesTarget(false); //トリガーをリセット
    }
  }, [saveTriggerSalesTarget, inputSalesTargetsIdToDataMap]);
  // ------------------------ 🌠保存ボタンクリック 全ての子コンポーネント内の目標を収集🌠 ここまで ------------------------

  // ----------------------------- 🌠目標を確定クリック sales_targetsテーブルUPSERT🌠 -----------------------------
  const setTriggerQueryEntities = useDashboardStore((state) => state.setTriggerQueryEntities);
  // 売上目標確定ダイアログで「確定する」ボタンをクリックで発火
  const handleSaveTarget = async () => {
    if (!currentLevelObj) return alert("レイヤー情報が見つかりませんでした。");
    setIsLoading(true); // ローディングを開始

    // ----------------------- 🔹sales_targetsテーブルUPSERTのみルート🔹 -----------------------
    // inputSalesTargetsIdToDataMap;
    try {
      // 1. sales_targetsテーブル 売上目標テーブルにUPSERT
      // 2-1. 今回「年度~半期」の設定が完了したエンティティのis_confirmをtrueにする(全社~係)
      // 2-2. 今回「上期詳細 or 下期詳細」の設定が完了したメンバーエンティティのis_confirmをtrueにする(メンバー)
      // 3-1. レベル内の全てのエンティティの目標の設定が完了したら、エンティティレベルのis_confirmをtrueにする(全社~係)
      // 3-2. レベル内の全てのエンティティの目標の設定が完了したら、エンティティレベルのis_confirmをtrueにする(メンバー)
      if (upsertSettingEntitiesObj.entityLevel !== "member") {
        // 🔹sales_targetsテーブルへのpayloadを作成
        // step2の組織レイヤー設定で確定した上位エンティティに紐づくエンティティグループ群の中で、
        // 今回のstep3で一つの上位エンティティのエンティティグループを選択肢、売上目標設定を設定する形で、
        // 1. 目標設定対象の全てのエンティティ群のentitiesから一つずつobjでエンティティを取り出し、
        // 2. obj.entity_idで取り出したエンティティidで入力した売上目標が入ったdataをsalesTargetObjに格納
        // 3. 取り出したエンティティの売上目標の年度、上期、下期の入力値が全てnumber型に適法しているかチェック
        // 4. sales_targetsテーブルへのUPSERTパラメータ用に各エンティティの売上目標をまとめる

        /*
          // {
            entity_id1: {
              isCollected: ~,
              error: ~,
              data: {
                entity_id: ~, 
                entity_name: ~, 
                sales_targets: {
                  period_type: ~,
                  period: ~,
                  sales_target:~
                }[]
              },
            entity_id2: {...},
            entity_id3: {...},
            }
          }
          */
        const insertEntitySet = new Set(upsertSettingEntitiesObj.entities.map((entity) => entity.entity_id));

        // 1.
        const entitiesSalesTargetsArray = upsertSettingEntitiesObj.entities.map((obj) => {
          // 2.
          const salesTargetObj = inputSalesTargetsIdToDataMap[obj.entity_id].data;

          // 3. 全ての売上目標入力値(sales_target)がnumber型に適合しているかUPSERT前にチェック
          const isValidAllNumber = salesTargetObj.sales_targets.every((obj) => isValidNumber(obj.sales_target));

          if (!isValidAllNumber)
            throw new Error(`${obj.entity_name ? `${obj.entity_name}の` : ``}売上目標の値が有効ではありません。`);

          // 売上目標設定では一つの上位エンティティグループごとの設定のため、全てのエンティティのparent_entity_idは一緒
          const entityId = obj.entity_id;
          const parentEntityId = obj.parent_entity_id;

          let createdByCompanyId = userProfileState.company_id;
          let createdByDepartmentId = null;
          let createdBySectionId = null;
          let createdByUnitId = null;
          let createdByUserId = null;
          let createdByOfficeId = null;

          if (upsertSettingEntitiesObj.entityLevel === "company") {
            // companyレベルの場合は、親は存在しないのでnullのまま
          }
          if (upsertSettingEntitiesObj.entityLevel === "department") {
            createdByDepartmentId = entityId;
          }
          if (upsertSettingEntitiesObj.entityLevel === "section") {
            createdByDepartmentId = sectionIdToObjMap?.get(entityId)?.created_by_department_id ?? null;
            createdBySectionId = entityId;
          }
          if (upsertSettingEntitiesObj.entityLevel === "unit") {
            createdByDepartmentId = unitIdToObjMap?.get(entityId)?.created_by_department_id ?? null;
            createdBySectionId = unitIdToObjMap?.get(entityId)?.created_by_section_id ?? null;
            createdByUnitId = entityId;
          }
          if (upsertSettingEntitiesObj.entityLevel === "office") {
            createdByOfficeId = entityId;
          }

          const salesTargetPayload = {
            entity_structure_id: obj.id,
            entity_name: obj.entity_name,
            parent_entity_name: obj.parent_entity_name,
            created_by_company_id: createdByCompanyId,
            created_by_department_id: createdByDepartmentId,
            created_by_section_id: createdBySectionId,
            created_by_unit_id: createdByUnitId,
            created_by_user_id: null, // memberレベル以外のルートのため必ずnull
            created_by_office_id: createdByOfficeId,
            is_confirmed_annual_half: true, // memberレベル以外のルートのため必ず「年度~半期」の目標設定なのでtrue
            is_confirmed_first_half_details: obj.is_confirmed_first_half_details,
            is_confirmed_second_half_details: obj.is_confirmed_second_half_details,
            sales_targets_array: salesTargetObj.sales_targets,
          };

          return salesTargetPayload;
        });

        // レベル内の全エンティティの売上目標の設定が完了しているかチェック(今回INSERTするエンティティを除いた全てのエンティティ)
        const allEntitiesExcludeInsertEntities = queryDataAllEntitiesByCurrentLevel.filter(
          (entity) => !insertEntitySet.has(entity.entity_id)
        );
        // -> 完了している場合はUPSERT時にentity_levels_structuresテーブルのis_confirmをtrueに変更する
        const isAllConfirmAnnual =
          allEntitiesExcludeInsertEntities.length === 0 ||
          allEntitiesExcludeInsertEntities.every((entity) => entity.is_confirmed_annual_half);

        const payload = {
          _company_id: userProfileState.company_id,
          _fiscal_year_id: currentLevelObj.fiscal_year_id,
          _target_type: "sales_target",
          _entity_level_id: currentLevelObj.id,
          _parent_entity_level_id: upsertSettingEntitiesObj.parentEntityId ?? null,
          _entities_data: entitiesSalesTargetsArray,
          _is_confirmed_annual_all_entities: isAllConfirmAnnual, // 今回のインサートが成功した場合に全てis_confirmがtrueになるかどうか
          _is_confirmed_first_half_all_entities: false, // メンバーレベル以外のレベルで上下期詳細がtrueになるのはメンバーレベルの集計クリック時なのでfalse
          _is_confirmed_second_half_all_entities: false, // メンバーレベル以外のレベルで上下期詳細がtrueになるのはメンバーレベルの集計クリック時なのでfalse
          _entity_level: upsertSettingEntitiesObj.entityLevel, // UPSERTするエンティティレベル
        };

        console.log(
          "🔥🔹「全社〜係」レベルのルート FUNCTION upsert_sales_target_current_level_entities関数実行 payload",
          payload,
          "queryDataAllEntitiesByCurrentLevel",
          queryDataAllEntitiesByCurrentLevel,
          "allEntitiesExcludeInsertEntities",
          allEntitiesExcludeInsertEntities
        );

        const { error } = await supabase.rpc("upsert_sales_target_current_level_entities", payload);
        // const { data, error } = await supabase.rpc("upsert_sales_target_current_level_entities_test", payload);

        // 0.5秒後に解決するPromiseの非同期処理を入れて明示的にローディングを入れる
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (error) throw error;

        console.log(
          "✅「全社〜係」レベルのルート FUNCTION upsert_sales_target_current_level_entities関数実行成功 キャッシュを更新"
        );

        toast.success("目標設定が完了しました！🌟");

        // エンティティレベルのUPDATEが実行されていたらエンティティレベルテーブルへのキャッシュも更新する
        // if (isAllConfirmAnnual) {
        //   // レベルとエンティティテーブル両方invalidateで更新する
        //   await queryClient.invalidateQueries(["entity_levels", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
        //   await new Promise((resolve) => setTimeout(resolve, 100));
        //   await queryClient.invalidateQueries(["entities", "sales_targets", upsertSettingEntitiesObj.fiscalYear]);
        // } else {
        //   // レベルのUPDATEが行われていない場合は、エンティティテーブルのみキャッシュを更新する(sales_targetsテーブルへのinvalidateは特にしなくてOK)
        //   // await new Promise((resolve) => setTimeout(resolve, 100));
        //   await queryClient.invalidateQueries(["entities", "sales_targets", upsertSettingEntitiesObj.fiscalYear]);
        // }
        // レベルとエンティティテーブル両方invalidateで更新する
        await queryClient.invalidateQueries(["entity_levels", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await queryClient.invalidateQueries(["entities", "sales_target", upsertSettingEntitiesObj.fiscalYear]);

        // addedEntityLevelListLocalに関しては、エンティティレベルのinvalidateでentityLevelsQueryDataが新しく生成され、useEffectで「setAddedEntityLevelListLocal(addedEntityLevelListLocal ?? []);」が実行されるため、特にstateの変更はこちらでは不要

        // 売上設定UPSERTデータをリセット
        const newUpsertSettingEntitiesObj = {
          fiscalYear: upsertSettingEntitiesObj.fiscalYear,
          periodType: "", // メンバーレベル以外は年度〜半期(fiscal_year), メンバーレベルなら半期詳細(details)
          parentEntityLevelId: "",
          parentEntityLevel: "",
          parentEntityId: "",
          parentEntityName: "",
          entityLevel: "",
          entities: [],
        } as UpsertSettingEntitiesObj;

        // step3の「目標設定を確定」ボタンでstepを先に進める
        if (isAllConfirmAnnual) {
          // setStep(1); // ステップ1のエンティティレベル選択画面に戻す
        } else {
          // setStep(3); // まだ現在のエンティティレベル内に未設定のエンティティが存在しているためstep3のまま
        }

        setIsLoading(false); // ローディングを終了
        setInputSalesTargetsIdToDataMap({}); // 収集したデータをリセット
        setIsOpenConfirmDialog(false); // ダイアログを閉じる
        setUpsertSettingEntitiesObj(newUpsertSettingEntitiesObj); // 売上設定UPSERTデータをリセット
        setIsSettingTargetMode(false); // 売上設定画面をエンティティ選択画面に戻す
      }
      // 🔹メンバーレベルのルート
      else {
        const insertEntitySet = new Set(upsertSettingEntitiesObj.entities.map((entity) => entity.entity_id));

        // 1. 設定対象のメンバー全員の売上目標の入力値をpayloadとしてまとめる
        const entitiesSalesTargetsArray = upsertSettingEntitiesObj.entities.map((obj) => {
          // 2.
          const salesTargetObj = inputSalesTargetsIdToDataMap[obj.entity_id].data;

          // 3. 全ての売上目標入力値(sales_target)がnumber型に適合しているかUPSERT前にチェック
          const isValidAllNumber = salesTargetObj.sales_targets.every((obj) => isValidNumber(obj.sales_target));

          if (!isValidAllNumber)
            throw new Error(`${obj.entity_name ? `${obj.entity_name}の` : ``}売上目標の値が有効ではありません。`);

          // 一旦メンバーレベルに関しては、created_by_user_id以外のレベルのエンティティidはnullをセットする => それぞれのエンティティidもセットする
          // 売上目標設定では一つの上位エンティティグループごとの設定のため、全てのエンティティのparent_entity_idは一緒
          const entityId = obj.entity_id;
          // const parentEntityId = obj.parent_entity_id;

          let createdByCompanyId = userProfileState.company_id;
          let createdByDepartmentId = null;
          let createdBySectionId = null;
          let createdByUnitId = null;
          let createdByUserId = null;
          let createdByOfficeId = null;

          if (upsertSettingEntitiesObj.entityLevel === "member") {
            createdByDepartmentId = memberIdToObjMap?.get(entityId)?.assigned_department_id ?? null;
            createdBySectionId = memberIdToObjMap?.get(entityId)?.assigned_section_id ?? null;
            createdByUnitId = memberIdToObjMap?.get(entityId)?.assigned_unit_id ?? null;
            createdByUserId = entityId;
            createdByOfficeId = memberIdToObjMap?.get(entityId)?.assigned_office_id ?? null;
          }

          // メンバーレベルのis_confirmに関しては、今回の設定が「上期詳細」「下期詳細」に応じて動的に変更する
          let isConfirmedFirstHalf = false;
          let isConfirmedSecondHalf = false;

          if (selectedPeriodTypeForMemberLevel === "first_half_details") {
            isConfirmedFirstHalf = true;
            isConfirmedSecondHalf = obj.is_confirmed_second_half_details; // 現在のまま 既にtrueの場合はtrueをセット
          } else if (selectedPeriodTypeForMemberLevel === "second_half_details") {
            isConfirmedFirstHalf = obj.is_confirmed_first_half_details; // 現在のまま 既にtrueの場合はtrueをセット
            isConfirmedSecondHalf = true;
          }

          const salesTargetPayload = {
            entity_structure_id: obj.id,
            entity_name: obj.entity_name,
            parent_entity_name: obj.parent_entity_name,
            created_by_company_id: userProfileState.company_id,
            // created_by_department_id: null,
            // created_by_section_id: null,
            // created_by_unit_id: null,
            created_by_department_id: createdByDepartmentId,
            created_by_section_id: createdBySectionId,
            created_by_unit_id: createdByUnitId,
            created_by_user_id: obj.entity_id,
            // created_by_office_id: null,
            created_by_office_id: createdByOfficeId,
            is_confirmed_annual_half: true, // メンバーレベルでは年度の目標設定は存在しないので、最初からtrueをセット
            is_confirmed_first_half_details: isConfirmedFirstHalf,
            is_confirmed_second_half_details: isConfirmedSecondHalf,
            sales_targets_array: salesTargetObj.sales_targets,
          };

          return salesTargetPayload;
        });

        // レベル内の全エンティティの売上目標の設定が完了しているかチェック(今回INSERTするエンティティを除いた全てのエンティティ)
        const allEntitiesExcludeInsertEntities = queryDataAllEntitiesByCurrentLevel.filter(
          (entity) => !insertEntitySet.has(entity.entity_id)
        );
        // -> 完了している場合はUPSERT時にentity_levels_structuresテーブルのis_confirmをtrueに変更する
        // 年度(メンバーレベルの場合には年度は意味をなさないが一応)
        const isAllConfirmAnnual = allEntitiesExcludeInsertEntities.every((entity) => entity.is_confirmed_annual_half);
        // 上期詳細(今回の設定が上期詳細でない場合には、INSERT対象も含めた全メンバーの上期詳細のis_confirmedをチェック)
        const isAllConfirmedFirstHalfDetails =
          selectedPeriodTypeForMemberLevel === "first_half_details"
            ? allEntitiesExcludeInsertEntities.every((entity) => entity.is_confirmed_first_half_details)
            : queryDataAllEntitiesByCurrentLevel.every((entity) => entity.is_confirmed_first_half_details);
        // 下期詳細(今回の設定が下期詳細でない場合には、INSERT対象も含めた全メンバーの下期詳細のis_confirmedをチェック)
        const isAllConfirmedSecondHalfDetails =
          selectedPeriodTypeForMemberLevel === "second_half_details"
            ? allEntitiesExcludeInsertEntities.every((entity) => entity.is_confirmed_second_half_details)
            : queryDataAllEntitiesByCurrentLevel.every((entity) => entity.is_confirmed_second_half_details);

        const payload = {
          _company_id: userProfileState.company_id,
          _fiscal_year_id: currentLevelObj.fiscal_year_id,
          _target_type: "sales_target",
          _entity_level_id: currentLevelObj.id,
          _parent_entity_level_id: upsertSettingEntitiesObj.parentEntityId ?? null,
          _entities_data: entitiesSalesTargetsArray,
          _is_confirmed_annual_all_entities: isAllConfirmAnnual, // 今回のインサートが成功した場合に全てis_confirmがtrueになるかどうか
          _is_confirmed_first_half_all_entities: isAllConfirmedFirstHalfDetails,
          _is_confirmed_second_half_all_entities: isAllConfirmedSecondHalfDetails,
          _entity_level: upsertSettingEntitiesObj.entityLevel, // UPSERTするエンティティレベル
        };

        console.log(
          "🔥🔹メンバーレベルのルート FUNCTION upsert_sales_target_current_level_entities関数実行 payload",
          payload
        );
        const { error } = await supabase.rpc("upsert_sales_target_current_level_entities", payload);

        // 0.5秒後に解決するPromiseの非同期処理を入れて明示的にローディングを入れる
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (error) throw error;

        console.log(
          "✅メンバーレベルのルート FUNCTION upsert_sales_target_current_level_entities関数実行成功 キャッシュを更新"
        );

        // エンティティレベルのUPDATEが実行されていたらエンティティレベルテーブルへのキャッシュも更新する
        // if (isAllConfirmAnnual || isAllConfirmedFirstHalfDetails || isAllConfirmedSecondHalfDetails) {
        //   // レベルとエンティティテーブル両方invalidateで更新する
        //   await queryClient.invalidateQueries(["entity_levels", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
        //   await queryClient.invalidateQueries(["entities", "sales_targets", upsertSettingEntitiesObj.fiscalYear]);
        // } else {
        //   // レベルのUPDATEが行われていない場合は、エンティティテーブルのみキャッシュを更新する(sales_targetsテーブルへのinvalidateは特にしなくてOK)
        //   await queryClient.invalidateQueries(["entities", "sales_targets", upsertSettingEntitiesObj.fiscalYear]);
        // }
        // レベルとエンティティテーブル両方invalidateで更新する
        await queryClient.invalidateQueries(["entity_levels", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
        await new Promise((resolve) => setTimeout(resolve, 300));
        await queryClient.invalidateQueries(["entities", "sales_target", upsertSettingEntitiesObj.fiscalYear]);

        toast.success("目標設定が完了しました！🌟");

        // 既にメンバーレベルの場合は、これ以上レベル追加はないため、
        // メンバーレベル内の全てのエンティティ(メンバー)のis_confirmがtrueになっていたらステップ4で、
        // まだ売上目標が設定されていないメンバーがいるならステップ3
        const newUpsertSettingEntitiesObj = {
          fiscalYear: upsertSettingEntitiesObj.fiscalYear,
          periodType: "", // メンバーレベル以外は年度〜半期(fiscal_year), メンバーレベルなら半期詳細(details)
          parentEntityLevelId: "",
          parentEntityLevel: "",
          parentEntityId: "",
          parentEntityName: "",
          entityLevel: "",
          entities: [],
        } as UpsertSettingEntitiesObj;

        // 上期詳細 or 下期詳細が全てtrueになったらstep4 step3の「目標設定を確定」ボタンでstepを先に進める
        if (isAllConfirmedFirstHalfDetails || isAllConfirmedSecondHalfDetails) {
          // setStep(4); // 全てのレベル、エンティティの年度〜半期の売上目標とメンバーの半期詳細の目標設定が完了したため、次の集計ステップ4に移行する
        } else {
          // setStep(3); // まだ未設定のメンバーが残っているため、step3の目標設定ステップのままにする
        }

        setIsLoading(false); // ローディングを終了
        setInputSalesTargetsIdToDataMap({}); // 収集したデータをリセット
        setIsOpenConfirmDialog(false); // ダイアログを閉じる
        setUpsertSettingEntitiesObj(newUpsertSettingEntitiesObj); // 売上設定UPSERTデータをリセット
        setIsSettingTargetMode(false); // 売上設定画面をエンティティ選択画面に戻す
      }
    } catch (error: any) {
      setIsLoading(false); // ローディングを終了
      setInputSalesTargetsIdToDataMap({}); // 収集したデータをリセット
      setIsOpenConfirmDialog(false); // ダイアログを閉じる
      console.error("エラー：", error);
      toast.error("売上目標の保存に失敗しました...🙇‍♀️");
    }

    // ----------------------- 🔹sales_targetsテーブルUPSERTのみルート🔹 -----------------------

    // // 年度テーブル、エンティティレベルテーブル、エンティティテーブル、売上目標テーブルにUPSERT
    // try {
    //   // fiscal_yearsテーブルに存在しない場合はINSERT、存在する場合はUPDATE

    //   // inputSalesTargetsIdToDataMap;
    //   // 下記4つのテーブルにUPSERT
    //   // ・fiscal_yearsテーブル
    //   // ・entity_level_structuresテーブル
    //   // ・entity_structuresテーブル
    //   // ・sales_targetsテーブル

    //   if (upsertSettingEntitiesObj.entityLevel !== "member") {
    //     const entityDataArray = upsertSettingEntitiesObj.entities.map((obj) => {
    //       const salesTargetObj = inputSalesTargetsIdToDataMap[obj.entity_id].data;

    //       const isValidAllNumber = salesTargetObj.sales_targets.every((obj) => isValidNumber(obj.sales_target));

    //       const entityId = obj.entity_id;
    //       const parentEntityId = obj.parent_entity_id;

    //       let createdByCompanyId = userProfileState.company_id;
    //       let createdByDepartmentId = null;
    //       let createdBySectionId = null;
    //       let createdByUnitId = null;
    //       // let createdByUserId = null;
    //       let createdByOfficeId = null;
    //       let parentCreatedByCompanyId = null;
    //       let parentCreatedByDepartmentId = null;
    //       let parentCreatedBySectionId = null;
    //       let parentCreatedByUnitId = null;
    //       let parentCreatedByUserId = null;
    //       let parentCreatedByOfficeId = null;

    //       if (upsertSettingEntitiesObj.entityLevel === "company") {
    //         // companyレベルの場合は、親は存在しないのでnullのまま
    //       }
    //       if (upsertSettingEntitiesObj.entityLevel === "department") {
    //         parentCreatedByCompanyId = parentEntityId;
    //         createdByDepartmentId = entityId;
    //       }
    //       if (upsertSettingEntitiesObj.entityLevel === "section") {
    //         parentCreatedByDepartmentId = parentEntityId;
    //         createdByDepartmentId = sectionIdToObjMap?.get(entityId)?.created_by_department_id ?? null;
    //         createdBySectionId = entityId;
    //       }
    //       if (upsertSettingEntitiesObj.entityLevel === "unit") {
    //         parentCreatedBySectionId = parentEntityId;
    //         createdByDepartmentId = unitIdToObjMap?.get(entityId)?.created_by_department_id ?? null;
    //         createdBySectionId = unitIdToObjMap?.get(entityId)?.created_by_section_id ?? null;
    //         createdByUnitId = entityId;
    //       }
    //       if (upsertSettingEntitiesObj.entityLevel === "office") {
    //         parentCreatedByCompanyId = parentEntityId;
    //         createdByOfficeId = entityId;
    //       }

    //       if (isValidAllNumber) {
    //         return {
    //           created_by_company_id: createdByCompanyId,
    //           created_by_department_id: createdByDepartmentId,
    //           created_by_section_id: createdBySectionId,
    //           created_by_unit_id: createdByUnitId,
    //           created_by_user_id: null, // memberレベル以外のルートのため必ずnull
    //           created_by_office_id: createdByOfficeId,
    //           parent_created_by_company_id: parentCreatedByCompanyId,
    //           parent_created_by_department_id: parentCreatedByDepartmentId,
    //           parent_created_by_section_id: parentCreatedBySectionId,
    //           parent_created_by_unit_id: parentCreatedByUnitId,
    //           parent_created_by_user_id: parentCreatedByUserId, // nullしかないが一応セットしておく
    //           parent_created_by_office_id: parentCreatedByOfficeId,
    //           is_confirmed_annual_half: true,
    //           is_confirmed_first_half_details: false,
    //           is_confirmed_second_half_details: false,
    //           entity_name: obj.entity_name,
    //           parent_entity_name: obj.parent_entity_name,
    //           sales_targets_array: salesTargetObj.sales_targets,
    //         };
    //         /** salesTargetObj.sales_targets:
    //            * {
    //               period_type: string;
    //               period: number; // 2024, 20241, 202401
    //               sales_target: number;
    //             }
    //            */
    //       } else {
    //         throw new Error("売上目標の値が有効ではありません。");
    //       }
    //     });

    //     const payload = {
    //       _company_id: userProfileState.company_id,
    //       _fiscal_year: upsertSettingEntitiesObj.fiscalYear,
    //       _period_start: periodStart,
    //       _period_end: periodEnd,
    //       _target_type: "sales_target",
    //       _entity_level: upsertSettingEntitiesObj.entityLevel,
    //       _parent_entity_level_id: upsertSettingEntitiesObj.parentEntityId ?? null,
    //       _entities_data: entityDataArray,
    //       // _period_type: upsertSettingEntitiesObj.periodType, // 期間タイプ(fiscal_year, first_half_details, second_half_details)
    //     };

    //     const { error } = supabase.rpc("upsert_sales_target_entities", payload);

    //     if (error) throw error;

    //     // 正常に全てのエンティティの目標のUPSERTが完了したら、
    //     // useQueryのエンティティレベルとエンティティをinvalidateして再度INSERT後のデータを取得してステップを次に進める
    //     // fiscal_yearsテーブル、entity_structuresテーブル、entity_structuresテーブル、sales_targetsテーブル
    //     await queryClient.invalidateQueries(["entity_levels", "sales_target", upsertSettingEntitiesObj.fiscalYear]);
    //     // entitiesキャッシュはqueryKeyに渡しているentityLevelIdsが先ほど追加したidが加わり別のentityLevelIdsに変更されるためinvalidateQuery不要

    //     // addedEntityLevelListLocalに関しては、エンティティレベルのinvalidateでentityLevelsQueryDataが新しく生成され、useEffectで「setAddedEntityLevelListLocal(addedEntityLevelListLocal ?? []);」が実行されるため、特にstateの変更はこちらでは不要

    //     // 現在のレベルがメンバーレベル以外ならレベル追加ステップ1に戻す
    //     if (upsertSettingEntitiesObj.entityLevel !== "member") {
    //       const newParentEntityGroup = {
    //         fiscalYear: upsertSettingEntitiesObj.fiscalYear,
    //         periodType: "fiscal_year", // レベルに合わせた目標の期間タイプ、売上推移用
    //         parentEntityLevelId: "",
    //         parentEntityLevel: "",
    //         parentEntityId: "",
    //         parentEntityName: "",
    //         entityLevel: "",
    //         entities: entityGroupObj.entities,
    //       } as UpsertSettingEntitiesObj;

    //       setUpsertSettingEntitiesObj(newParentEntityGroup);
    //       setIsSettingTargetMode(true);

    //       setStep(1); // ステップ1のエンティティレベル選択画面に戻す
    //     }
    //   } else {
    //     // 既にメンバーレベルの場合は、これ以上レベル追加はないため、ステップ
    //   }
    // } catch (error: any) {
    //   console.error("エラー：", error);
    //   toast.error("売上目標の保存に失敗しました...🙇‍♀️");
    // }
    // setIsLoading(false); // ローディングを終了
    // setInputSalesTargetsIdToDataMap({}); // 収集したデータをリセット
    // setIsOpenConfirmDialog(false); // ダイアログを閉じる
  };
  // --------------------------- 🌠目標を確定クリック sales_targetsテーブルUPSERT🌠 ここまで ---------------------------

  // --------------------------- 🌠目標設定モードを終了🌠 ---------------------------
  const handleCancelUpsert = () => {
    setIsSettingTargetMode(false);
    setUpsertSettingEntitiesObj({
      ...upsertSettingEntitiesObj,
      entityLevel: "",
      entities: [],
      parentEntityId: "",
      parentEntityLevel: "",
      parentEntityName: "",
    });
    if (saveTriggerSalesTarget) setSaveTriggerSalesTarget(false); //トリガーをリセット
    setInputSalesTargetsIdToDataMap({}); // 収集したデータをリセット
  };
  // --------------------------- 🌠目標設定モードを終了🌠 ここまで ---------------------------

  // -------------------------- 変数関連 --------------------------
  // 🔸ユーザーが選択した会計年度の期首
  const currentFiscalYearDateObj = useMemo(() => {
    return calculateFiscalYearStart({
      fiscalYearEnd: fiscalYearStartEndDate.endDate,
      fiscalYearBasis: userProfileState.customer_fiscal_year_basis ?? "firstDayBasis",
      selectedYear: upsertSettingEntitiesObj.fiscalYear,
    });
  }, [fiscalYearStartEndDate.endDate, userProfileState.customer_fiscal_year_basis]);

  if (!currentFiscalYearDateObj) {
    handleCancelUpsert();
    toast.error("エラー：会計年度データの取得に失敗しました...🙇‍♀️");
    return null;
  }

  // 🔸ユーザーの選択中の会計年度の開始年月度
  const fiscalStartYearMonth = useMemo(
    () => calculateDateToYearMonth(currentFiscalYearDateObj, fiscalYearStartEndDate.endDate.getDate()),
    [currentFiscalYearDateObj]
  );

  // 🔸ユーザーが選択した売上目標の会計年度の前年度12ヶ月分の年月度の配列(メンバーレベルでない場合はスルー)
  const annualFiscalMonthsUpsert = useMemo(() => {
    // メンバーレベルでない場合は、月度の目標入力は不要のためリターン
    if (upsertSettingEntitiesObj.entityLevel !== "member") return null;
    // ユーザーが選択した会計月度基準で過去3年分の年月度を生成
    const fiscalMonths = calculateFiscalYearMonths(fiscalStartYearMonth);

    return fiscalMonths;
  }, [fiscalStartYearMonth]);

  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // メンバー
  const memberDataArray:
    | (MemberAccounts & {
        company_id: string;
        company_name: string;
      })[]
    | undefined = useMemo(() => {
    if (upsertSettingEntitiesObj.entityLevel !== "member") return [];

    const parentEntityIdsSet = new Set(currentParentEntitiesForMember.map((entity) => entity.entity_id));
    const parentEntityIdsStr = Array.from(parentEntityIdsSet).join(", ");
    const newMemberDataArray: MemberGroupsByParentEntity | undefined = queryClient.getQueryData([
      "member_accounts",
      upsertSettingEntitiesObj.parentEntityLevel, // parent_entity_level,
      parentEntityIdsStr,
    ]);

    const flattedMemberDataArray = newMemberDataArray
      ? Object.values(newMemberDataArray)
          .map((obj) => obj.member_group)
          .flatMap((array) => array)
      : [];

    console.log(
      "メンバーデータnewMemberDataArray",
      newMemberDataArray,
      "currentParentEntitiesForMember",
      currentParentEntitiesForMember,
      "flattedMemberDataArray",
      flattedMemberDataArray
    );
    return flattedMemberDataArray;
  }, [currentParentEntitiesForMember]);
  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
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
  // メンバーマップ {id: メンバーオブジェクト}
  const memberIdToObjMap = useMemo(() => {
    if (!memberDataArray?.length) return null;
    const memberMap = new Map(memberDataArray.map((obj) => [obj.id, obj]));
    return memberMap;
  }, [memberDataArray]);

  // ========================= 🌟メンバーリスト取得useQuery キャッシュ🌟 =========================

  // // メンバーエンティティのidを並び替え
  // const sortedEntityIdsStr = useMemo(() => {
  //   const entityIds = Array.from(targetEntityIdsSet);
  //   const str =
  //     entityIds && entityIds.length > 0 ? entityIds.sort(([keyA], [keyB]) => keyA.localeCompare(keyB)).join(", ") : "";
  //   return str ?? "";
  // }, [targetEntityIdsSet]);

  // const {
  //   data: memberDataArray,
  //   error: memberDataError,
  //   isLoading: isLoadingMember,
  // } = useQueryMemberAccountsFilteredByEntity({
  //   entityLevel: upsertSettingEntitiesObj.entityLevel,
  //   entityIds: Array.from(targetEntityIdsSet),
  //   entityIdsStr: sortedEntityIdsStr,
  //   isReady: upsertSettingEntitiesObj.entityLevel === "member", // memberの時のみフェッチを許可
  // });
  // ========================= 🌟メンバーリスト取得useQuery キャッシュ🌟 =========================

  // -------------------------- 部門別目標の配列 --------------------------
  // エンティティid配列に含まれるエンティティのみを取得
  const [subTargetList, setSubTargetList] = useState(() => {
    switch (upsertSettingEntitiesObj.entityLevel) {
      case "department":
        const filteredDepartment = departmentDataArray
          ? departmentDataArray.filter((obj) => targetEntityIdsSet.has(obj.id))
          : [];
        return filteredDepartment;
      case "section":
        const filteredSection = sectionDataArray
          ? sectionDataArray.filter((obj) => targetEntityIdsSet.has(obj.id))
          : [];
        return filteredSection;
      case "unit":
        const filteredUnit = unitDataArray ? unitDataArray.filter((obj) => targetEntityIdsSet.has(obj.id)) : [];
        return filteredUnit;
      case "office":
        const filteredOffice = officeDataArray ? officeDataArray.filter((obj) => targetEntityIdsSet.has(obj.id)) : [];
        return filteredOffice;
      case "member":
        console.log("メンバーmemberDataArray", memberDataArray);
        const filteredMember = memberDataArray ? memberDataArray.filter((obj) => targetEntityIdsSet.has(obj.id)) : [];
        return filteredMember;
      default:
        return [];
        break;
    }
  });
  // -------------------------- 部門別目標の配列 ここまで --------------------------

  // 部門別の名称
  const getDivName = () => {
    switch (upsertSettingEntitiesObj.entityLevel) {
      case "company":
        return language === "ja" ? `全社` : `Company`;
      // return language === "ja" ? `全社 - 部門別` : `Company - Sections`;
      case "department":
        return language === "ja" ? `事業部` : `Departments`;
      case "section":
        return language === "ja" ? `課・セクション` : `Sections`;
      case "unit":
        return language === "ja" ? `係・チーム` : `Units`;
      case "office":
        return language === "ja" ? `事業所` : `Offices`;
      case "member":
        return language === "ja" ? `メンバー` : `Members`;
      default:
        return language === "ja" ? `部門` : `Division`;
        break;
    }
  };

  const mappingDivName: { [K in EntityLevelNames]: { [key: string]: string } } = {
    company: { ja: "全社", en: "Company" },
    department: { ja: "事業部", en: "Department" },
    section: { ja: "課・セクション", en: "Section" },
    unit: { ja: "係・チーム", en: "Unit" },
    member: { ja: "メンバー", en: "Member" },
    office: { ja: "事業所", en: "Office" },
  };

  // --------------------------- 🌠子コンポーネントを順番にフェッチさせる🌠 ---------------------------
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0); // 順番にフェッチを許可
  const [allFetched, setAllFetched] = useState(false); // サブ目標コンポーネントのフェッチが全て完了したらtrueに変更

  // 全子コンポーネントがフェッチ完了したかを監視
  useEffect(() => {
    // サブ目標リストよりactiveIndexが大きくなった場合、全てフェッチが完了
    if (currentActiveIndex >= subTargetList.length) {
      setAllFetched(true);
    }
    if (upsertSettingEntitiesObj.entityLevel === "company") {
      if (currentActiveIndex >= upsertSettingEntitiesObj.entities.length) {
        setAllFetched(true);
      }
    }
  }, [currentActiveIndex]);

  // 各サブ目標コンポーネントでフェッチ完了通知を受け取る関数
  const onFetchComplete = (tableIndex: number) => {
    // 既に現在のテーブルのindexよりcurrentActiveIndexが大きければリターン
    if (tableIndex < currentActiveIndex || allFetched) return;
    console.log(
      "onFetchComplete関数実行 tableIndex",
      tableIndex,
      "currentActiveIndex",
      currentActiveIndex,
      tableIndex < currentActiveIndex
    );
    setCurrentActiveIndex((prevIndex) => prevIndex + 1); // activeIndexを+1して次のコンポーネントのフェッチを許可
  };
  // --------------------------- 🌠子コンポーネントを順番にフェッチさせる🌠 ---------------------------
  // --------------------------- 🌠子コンポーネントに順番にデータ収集させる🌠 ---------------------------
  const [currentActiveIndexSave, setCurrentActiveIndexSave] = useState(0); // 順番にフェッチを許可
  const [allSaved, setAllSaved] = useState(false); // サブ目標コンポーネントのフェッチが全て完了したらtrueに変更

  // 全子コンポーネントがフェッチ完了したかを監視
  useEffect(() => {
    if (upsertSettingEntitiesObj.entityLevel === "company") {
      // 会社レベルはメイン目標1つのみなので、1になったらallSavedをtrueに
      if (currentActiveIndexSave >= 1) {
        setAllSaved(true);
      }
    } else {
      // サブ目標リストよりactiveIndexが大きくなった場合、全てフェッチが完了
      if (currentActiveIndexSave >= subTargetList.length) {
        setAllSaved(true);
      }
    }
  }, [currentActiveIndexSave]);

  // 各サブ目標コンポーネントでフェッチ完了通知を受け取る関数
  const onSaveComplete = (tableIndex: number) => {
    // 既に現在のテーブルのindexよりcurrentActiveIndexが大きければリターン
    if (tableIndex < currentActiveIndexSave || allSaved) return;
    console.log(
      "onFetchComplete関数実行 tableIndex",
      tableIndex,
      "currentActiveIndexSave",
      currentActiveIndexSave,
      tableIndex < currentActiveIndexSave
    );
    setCurrentActiveIndexSave((prevIndex) => prevIndex + 1); // activeIndexを+1して次のコンポーネントのフェッチを許可
  };
  // --------------------------- 🌠子コンポーネントに順番にデータ収集させる🌠 ---------------------------

  // サブ目標リスト編集モーダルを開く
  // const handleOpenEditSubListModal = () => {
  //   const getSubListArray = () => {
  //     switch (upsertSettingEntitiesObj.entityLevel) {
  //       case "department":
  //         return departmentDataArray ? [...departmentDataArray] : [];
  //       case "section":
  //         return sectionDataArray ? [...sectionDataArray] : [];
  //       case "unit":
  //         return unitDataArray ? [...unitDataArray] : [];
  //       case "office":
  //         return officeDataArray ? [...officeDataArray] : [];
  //       case "member":
  //         return memberDataArray ? [...memberDataArray] : [];
  //       default:
  //         return [];
  //         break;
  //     }
  //   };
  //   setEditSubList(getSubListArray() as MemberAccounts[] | Department[] | Section[] | Unit[] | Office[]);
  //   setIsOpenEditSubListModal(true);
  // };

  // サブ目標リスト編集モーダルを閉じる
  const handleCloseEditSubListModal = () => {
    setEditSubList([]);
    if (selectedActiveItemIdsMap.size > 0) setSelectedActiveItemIdsMap(new Map());
    if (selectedInactiveItemIdsMap.size > 0) setSelectedInactiveItemIdsMap(new Map());
    setIsOpenEditSubListModal(false);
  };

  // -------------------------- 売上推移 部門別 --------------------------
  // 🌟売上推移で表示するperiodType
  // 遡る年数
  const [yearsBack, setYearsBack] = useState(2);
  // デフォルト：(期間タイプ: fiscal_year, half_year, quarter, year_month),
  // エリアチャートに渡す期間タイプ (半期、四半期、月次)
  const [periodTypeTrend, setPeriodTypeTrend] = useState<"fiscal_year" | "half_year" | "quarter" | "year_month">(() => {
    // UpsertTargetEntity側では半期を上期と下期で分けるが、ここではselectedPeriodDetailTrendの識別用として上下を使い、periodTypeは年度、半期、四半期、月次のみで区別する
    if (upsertSettingEntitiesObj.periodType === "year_half") {
      return "fiscal_year";
    } else if (["first_half_details", "second_half_details"].includes(upsertSettingEntitiesObj.periodType)) {
      return "half_year";
    } else return "fiscal_year";
  });
  // 🔹エリアチャートに渡す期間 セレクトボックス選択中
  const [selectedPeriodDetailTrend, setSelectedPeriodDetailTrend] = useState<{
    period: "fiscal_year" | "half_year" | "quarter" | "year_month";
    value: number;
  }>(() => {
    if (upsertSettingEntitiesObj.entityLevel !== "member") {
      // 🔸メンバーレベルでない場合は年度を初期表示にする -1で来期目標の1年前から遡って表示する
      return {
        period: "fiscal_year",
        value: upsertSettingEntitiesObj.fiscalYear - 1,
      };
    } else {
      // 🔸メンバーレベルの場合は選択肢した半期（上期か下期）を表示する
      if (upsertSettingEntitiesObj.periodType === "first_half_details") {
        //
        return {
          // period: "first_half",
          period: "half_year",
          value: (upsertSettingEntitiesObj.fiscalYear - 1) * 10 + 1,
        }; // 1が上期、2が下期
      } else {
        return {
          // period: "second_half",
          period: "half_year",
          value: (upsertSettingEntitiesObj.fiscalYear - 1) * 10 + 2,
        }; // 1が上期、2が下期
      }
    }
  });
  // 🔹ドーナツチャートに渡す期間 セレクトボックス選択中
  const [selectedPeriodDetailProbability, setSelectedPeriodDetailProbability] = useState<{
    period: string;
    value: number;
  }>(() => {
    if (upsertSettingEntitiesObj.entityLevel !== "member") {
      // 🔸メンバーレベルでない場合は年度を初期表示にする -1で来期目標の1年前から遡って表示する
      return {
        period: "fiscal_year",
        value: upsertSettingEntitiesObj.fiscalYear,
      };
    } else {
      // 🔸メンバーレベルの場合は選択肢した半期（上期か下期）を表示する
      if (upsertSettingEntitiesObj.periodType === "first_half_details") {
        //
        return {
          period: "first_half",
          value: upsertSettingEntitiesObj.fiscalYear * 10 + 1,
        }; // 1が上期、2が下期
      } else {
        return {
          period: "second_half",
          value: upsertSettingEntitiesObj.fiscalYear * 10 + 2,
        }; // 1が上期、2が下期
      }
    }
  });

  // 🔹売上推移の「2021H1 ~ 2023H1」表示用
  const trendPeriodTitle = useMemo(() => {
    if (periodTypeTrend === "fiscal_year") {
      return {
        periodStart: `${selectedPeriodDetailTrend.value - yearsBack}年度`,
        periodEnd: `${selectedPeriodDetailTrend.value}年度`,
      };
    } else {
      const year = Number(selectedPeriodDetailTrend.value.toString().substring(0, 4));
      const period = selectedPeriodDetailTrend.value.toString().substring(4);
      const back = yearsBack;
      return {
        periodStart:
          periodTypeTrend === "half_year"
            ? `${year - back}H${period}`
            : periodTypeTrend === "quarter"
            ? `${year - back}Q${period}`
            : periodTypeTrend === "year_month"
            ? `${year - back}年${period}月度`
            : `${selectedPeriodDetailTrend.value - yearsBack}年度`,
        periodEnd:
          periodTypeTrend === "half_year"
            ? `${year}H${period}`
            : periodTypeTrend === "quarter"
            ? `${year}Q${period}`
            : periodTypeTrend === "year_month"
            ? `${year}年${period}月度`
            : `${selectedPeriodDetailTrend.value}年度`,
      };
    }
  }, [selectedPeriodDetailTrend, yearsBack]);

  // 案件状況の「2021H1」表示用
  const salesProbabilityPeriodTitle = useMemo(() => {
    if (periodTypeTrend === "fiscal_year") {
      return `${selectedPeriodDetailProbability.value}年度`;
    } else {
      const year = Number(selectedPeriodDetailProbability.value.toString().substring(0, 4));
      const period = selectedPeriodDetailProbability.value.toString().substring(4);
      return periodTypeTrend === "half_year"
        ? `${year}H${period}`
        : periodTypeTrend === "quarter"
        ? `${year}Q${period}`
        : periodTypeTrend === "year_month"
        ? `${year}年${period}月度`
        : `${selectedPeriodDetailProbability.value}年度`;
    }
  }, [selectedPeriodDetailProbability]);

  // -------------------------- 売上推移 部門別 ここまで --------------------------
  // -------------------------- 案件状況 --------------------------
  const dealStatusPeriodTitle = useMemo(() => {
    const year = upsertSettingEntitiesObj.fiscalYear;
    if (periodTypeTrend === "fiscal_year") {
      return `${year}年度`;
    } else {
      const period = selectedPeriodDetailTrend.value.toString().substring(4);
      return periodTypeTrend === "half_year"
        ? `${year}H${period}`
        : periodTypeTrend === "quarter"
        ? `${year}Q${period}`
        : periodTypeTrend === "year_month"
        ? `${year}年${period}月度`
        : `${selectedPeriodDetailTrend.value}年度`;
    }
  }, []);
  // -------------------------- 案件状況 ここまで --------------------------

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
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
      content: content,
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

  // const handleUpdateSubList = async (updateType: "add" | "remove") => {
  //   // エンティティタイプからupdateするテーブルを確定
  //   const entityLevel = upsertSettingEntitiesObj.entityLevel;
  //   let updatedTable = "";
  //   if (entityLevel === "department") updatedTable = "departments";
  //   if (entityLevel === "section") updatedTable = "sections";
  //   if (entityLevel === "unit") updatedTable = "units";
  //   if (entityLevel === "office") updatedTable = "offices";
  //   if (entityLevel === "member") updatedTable = "profiles";
  //   if (entityLevel === "") return alert("部門データが見つかりませんでした。");

  //   const newTargetType = updateType === "add" ? "sales_target" : null;
  //   const updatedPayload = { target_type: newTargetType };
  //   // idのみの配列を生成
  //   const updatedEntityIds =
  //     updateType === "add" ? [...selectedInactiveItemIdsMap.keys()] : [...selectedActiveItemIdsMap.keys()];
  //   // 今回更新するMapオブジェクトを代入
  //   const updatedEntityIdsMap = updateType === "add" ? selectedInactiveItemIdsMap : selectedActiveItemIdsMap;

  //   setIsLoading(true); // ローディング開始

  //   try {
  //     console.log(
  //       "削除実行🔥 updatedTable",
  //       updatedTable,
  //       updatedPayload,
  //       "updatedEntityIds",
  //       updatedEntityIds,
  //       "selectedInactiveItemIdsMap",
  //       selectedInactiveItemIdsMap,
  //       "selectedActiveItemIdsMap",
  //       selectedActiveItemIdsMap
  //     );
  //     const { error } = await supabase.from(updatedTable).update(updatedPayload).in("id", updatedEntityIds);

  //     if (error) throw error;

  //     // キャッシュの部門からsales_targetをnullに更新する
  //     let queryKey = "departments";
  //     if (entityLevel === "department") queryKey = "departments";
  //     if (entityLevel === "section") queryKey = "sections";
  //     if (entityLevel === "unit") queryKey = "units";
  //     if (entityLevel === "office") queryKey = "offices";
  //     if (entityLevel === "member") queryKey = "member_accounts";
  //     const prevCache = queryClient.getQueryData([queryKey]) as
  //       | Department[]
  //       | Section[]
  //       | Unit[]
  //       | Office[]
  //       | MemberAccounts[];
  //     let newCache = [...prevCache]; // キャッシュのシャローコピーを作成
  //     // 更新対象のオブジェクトのtarget_typeをsales_target or nullに変更
  //     newCache = newCache.map((obj) =>
  //       updatedEntityIdsMap.has(obj.id) ? { ...obj, target_type: newTargetType } : obj
  //     );
  //     console.log("キャッシュを更新 newCache", newCache);
  //     queryClient.setQueryData([queryKey], newCache); // キャッシュを更新

  //     if (updateType === "remove") {
  //       // 固定していた場合は固定を解除
  //       if (!!stickyRow && updatedEntityIdsMap.has(stickyRow)) {
  //         setStickyRow(null);
  //       }
  //     }

  //     setIsLoading(false); // ローディング終了

  //     // サブ目標リストを更新
  //     const newList = newCache.filter((obj) => obj.target_type === "sales_target") as
  //       | Department[]
  //       | Section[]
  //       | Unit[]
  //       | Office[]
  //       | MemberAccounts[];
  //     setSubTargetList(newList);

  //     // モーダル内のリストを更新
  //     setEditSubList(newCache as MemberAccounts[] | Department[] | Section[] | Unit[] | Office[]);

  //     const successMsg = updateType === "add" ? `目標リストに追加しました🌟` : `目標リストから削除しました🌟`;
  //     toast.success(successMsg);

  //     // リセット
  //     if (updateType === "add") {
  //       setSelectedInactiveItemIdsMap(new Map());
  //     } else {
  //       setSelectedActiveItemIdsMap(new Map());
  //     }
  //   } catch (error: any) {
  //     console.error("エラー：", error);
  //     const errorMsg =
  //       updateType === "add" ? `目標リストへの追加に失敗しました...🙇‍♀️` : "目標リストからの削除に失敗しました...🙇‍♀️";
  //     toast.error(errorMsg);
  //   }
  // };

  // years_backをperiodTypeTrendに応じて変更
  // const yearsBack = useMemo(() => {
  //   let backNum = 2;
  //   switch (periodTypeTrend) {
  //     case "fiscal_year":
  //       backNum = 2;
  //       break;
  //     case "half_year":
  //     case "quarter":
  //       backNum = 20;
  //       break;
  //     case "year_month":
  //       backNum = 200;
  //     default:
  //       break;
  //   }
  //   return backNum;
  // }, [periodTypeTrend]);

  // --------------------- 🌟メイン目標の売上目標を取得するuseQuery🌟 ---------------------
  // ---------------------------------- 🌠【事業部〜係レベル用】
  const {
    data: salesTargetsYearHalf,
    error: salesTargetsYearHalfError,
    isLoading: isLoadingSalesTargetsYearHalf,
    isError: isErrorSalesTargetsYearHalf,
  } = useQuerySalesTargetsMain({
    companyId: userProfileState.company_id,
    entityLevel: upsertSettingEntitiesObj.parentEntityLevel,
    entityId: upsertSettingEntitiesObj.parentEntityId,
    periodType: "year_half",
    fiscalYear: upsertSettingEntitiesObj.fiscalYear,
    // fetchEnabled: upsertSettingEntitiesObj.entityLevel !== "company" && upsertSettingEntitiesObj.entityLevel !== "", // 事業部〜メンバーレベルまで メンバーレベルの目標設定における上位エンティティの売上目標は「年度・半期」となるため
    fetchEnabled:
      ["department", "section", "unit"].includes(upsertSettingEntitiesObj.entityLevel) &&
      upsertSettingEntitiesObj.periodType === "year_half", // 【事業部〜係レベル用】
  });
  // ---------------------------------- 🌠【メンバーレベル用】
  const {
    data: salesTargetsHalfDetails,
    error: salesTargetsHalfDetailsError,
    isLoading: isLoadingSalesTargetsHalfDetails,
    isError: isErrorSalesTargetsHalfDetails,
  } = useQuerySalesTargetsMainHalfDetails({
    companyId: userProfileState.company_id,
    entityLevel: upsertSettingEntitiesObj.parentEntityLevel,
    entityId: upsertSettingEntitiesObj.parentEntityId,
    periodType: upsertSettingEntitiesObj.periodType, // "first_half_details" | "second_half_details"
    fiscalYear: upsertSettingEntitiesObj.fiscalYear,
    // fetchEnabled: upsertSettingEntitiesObj.entityLevel !== "company" && upsertSettingEntitiesObj.entityLevel !== "", // 事業部〜メンバーレベルまで メンバーレベルの目標設定における上位エンティティの売上目標は「年度・半期」となるため
    fetchEnabled:
      upsertSettingEntitiesObj.entityLevel === "member" &&
      ["first_half_details", "second_half_details"].includes(upsertSettingEntitiesObj.periodType), // 【メンバーレベル用】
  });
  // --------------------- 🌟メイン目標の売上目標を取得するuseQuery🌟 ---------------------

  // ---------------------------------- 🌠【事業部〜係レベル用】
  // 部門別の「年度・半期」のそれぞれの目標金額の合計値を保持するstate
  const totalInputSalesTargetsYearHalf = useDashboardStore((state) => state.totalInputSalesTargetsYearHalf);
  const setTotalInputSalesTargetsYearHalf = useDashboardStore((state) => state.setTotalInputSalesTargetsYearHalf);
  // ---------------------------------- 🌠【メンバーレベル用】
  // 部門別の「年度・半期」のそれぞれの目標金額の合計値を保持するstate
  const totalInputSalesTargetsHalfDetails = useDashboardStore((state) => state.totalInputSalesTargetsHalfDetails);
  const setTotalInputSalesTargetsHalfDetails = useDashboardStore((state) => state.setTotalInputSalesTargetsHalfDetails);

  // ---------------------------------- ✅初回マウント時✅ ----------------------------------
  // 初回マウント時に部門別の「年度・半期」 or メンバー別の「半期詳細」のそれぞれの目標金額の合計値を保持するstateのinput_targets_arrayに設定対象のエンティティの数量分の初期値をセットする
  useEffect(() => {
    // 会社レベルの場合は、総合目標が存在しないため、総合目標に対する残り目標金額の算出が不要なためリターン
    if (upsertSettingEntitiesObj.entityLevel === "company") return;
    if (upsertSettingEntitiesObj.entityLevel === "") return;

    // 🔸【事業部〜係レベルルート】年度・半期の売上目標のstateをセット --------------------
    if (upsertSettingEntitiesObj.entityLevel !== "member") {
      if (upsertSettingEntitiesObj.periodType === "year_half") {
        const inputSalesTargetsArray = upsertSettingEntitiesObj.entities.map((entity) => {
          return {
            entity_id: entity.entity_id,
            entity_name: entity.entity_name,
            input_targets: {
              sales_target_year: 0,
              sales_target_first_half: 0,
              sales_target_second_half: 0,
            },
          };
        }) as { entity_id: string; entity_name: string; input_targets: SalesTargetsYearHalf }[];

        const initialTotalSalesTargetsYearHalf = {
          total_targets: {
            sales_target_year: 0,
            sales_target_first_half: 0,
            sales_target_second_half: 0,
          },
          input_targets_array: inputSalesTargetsArray,
        } as TotalSalesTargetsYearHalfObj;

        // 初回stateをセット
        setTotalInputSalesTargetsYearHalf(initialTotalSalesTargetsYearHalf);
      }
    }
    // 🔸【メンバーレベルルート】半期詳細の売上目標のstateをセット --------------------
    else {
      // 初期値自体は上半期、下半期ともに同じプロパティのZustandのstateを使用する
      if (["first_half_details", "second_half_details"].includes(upsertSettingEntitiesObj.periodType)) {
        const inputSalesTargetsArray = upsertSettingEntitiesObj.entities.map((entity) => {
          return {
            entity_id: entity.entity_id,
            entity_name: entity.entity_name,
            input_targets: {
              sales_target_half: 0,
              // sales_target_first_quarter: 0,
              // sales_target_second_quarter: 0,
              // sales_target_month_01: 0,
              // sales_target_month_02: 0,
              // sales_target_month_03: 0,
              // sales_target_month_04: 0,
              // sales_target_month_05: 0,
              // sales_target_month_06: 0,
            } as SalesTargetsHalfDetails,
          };
        }) as { entity_id: string; entity_name: string; input_targets: SalesTargetsHalfDetails }[];

        const initialTotalSalesTargetsHalfDetails: TotalSalesTargetsHalfDetailsObj = {
          total_targets: {
            sales_target_half: 0,
            // sales_target_first_quarter: 0,
            // sales_target_second_quarter: 0,
            // sales_target_month_01: 0,
            // sales_target_month_02: 0,
            // sales_target_month_03: 0,
            // sales_target_month_04: 0,
            // sales_target_month_05: 0,
            // sales_target_month_06: 0,
          } as TotalSalesTargetsHalfDetails,
          input_targets_array: inputSalesTargetsArray,
        };

        // 初回stateをセット
        setTotalInputSalesTargetsHalfDetails(initialTotalSalesTargetsHalfDetails);
      }
    }
  }, []);
  // ---------------------------------- ✅初回マウント時✅ ----------------------------------

  // --------------------🔸【事業部〜係レベルルート】部門別残り目標金額/総合目標 用の配列 --------------------
  const salesTargetsYearHalfStatus = useMemo(() => {
    if (!salesTargetsYearHalf) return null;
    // 会社レベルの場合は、総合目標は存在しないためnullをリターン
    if (upsertSettingEntitiesObj.entityLevel === "company") return null;
    if (upsertSettingEntitiesObj.entityLevel === "member") return null;
    console.log(
      "🔹【事業部〜係レベルルート】部門別残り目標金額/総合目標 用の配列 作成",
      "upsertSettingEntitiesObj",
      upsertSettingEntitiesObj,
      "メイン目標キャッシュsalesTargetsYearHalf",
      salesTargetsYearHalf
    );
    try {
      const newStatus = Object.entries(salesTargetsYearHalf).map(([key, value], index) => {
        let title: { [key: string]: string } = { ja: `年度`, en: `Fiscal Year` };
        if (key === "sales_target_first_half") title = { ja: `上半期`, en: `First Half Year` };
        if (key === "sales_target_second_half") title = { ja: `下半期`, en: `Second Half Year` };
        const totalInput = totalInputSalesTargetsYearHalf.total_targets[key as KeysSalesTargetsYearHalf];
        const mainTargetDecimal = new Decimal(value);
        const totalInputDecimal = new Decimal(totalInput);
        // 残り目標額
        const restSalesTarget = mainTargetDecimal.minus(totalInputDecimal).toNumber();
        const isNegative = restSalesTarget < 0;
        const isComplete = restSalesTarget === 0;
        return {
          key: key,
          sales_target: formatToJapaneseYen(value),
          // sales_target: value,
          title: title,
          // restTarget: formatToJapaneseYen(restSalesTarget, true, true),
          restTarget: restSalesTarget,
          isNegative: isNegative,
          isComplete: isComplete,
        };
      });
      return newStatus;
    } catch (error: any) {
      console.error("❌エラー：🔹【事業部〜係レベルルート】部門別残り目標金額/総合目標 用の配列 作成 無効な値");
      return null;
    }
  }, [salesTargetsYearHalf, totalInputSalesTargetsYearHalf]);

  // 部門別残り目標金額/総合目標の部門の残り目標金額が全ての期間で0となり、全ての期間がisCompleteとなったらtrueにする
  const allCompleteTargetsYearHalf = useMemo(() => {
    if (!salesTargetsYearHalfStatus) return null;
    // 会社レベルの場合は、総合目標は存在しないためnullをリターン
    if (upsertSettingEntitiesObj.entityLevel === "company") return null;
    if (upsertSettingEntitiesObj.entityLevel === "member") return null;
    return salesTargetsYearHalfStatus.every((targetPeriod) => targetPeriod.isComplete);
  }, [salesTargetsYearHalfStatus]);
  // --------------------🔸【事業部〜係レベルルート】部門別残り目標金額/総合目標 用の配列 --------------------

  // --------------------🔸【メンバーレベルルート】部門別残り目標金額/総合目標 用の配列 --------------------
  const salesTargetsHalfDetailsStatus = useMemo(() => {
    if (!salesTargetsHalfDetails) return null;
    if (salesTargetsHalfDetails === null || salesTargetsHalfDetails === undefined) return null;
    // 会社レベルの場合は、総合目標は存在しないためnullをリターン
    if (upsertSettingEntitiesObj.entityLevel !== "member") return null;
    try {
      console.log(
        "🔹【メンバーレベルルート】部門別残り目標金額/総合目標 用の配列 作成",
        "upsertSettingEntitiesObj",
        upsertSettingEntitiesObj,
        "メイン目標キャッシュsalesTargetsHalfDetails",
        salesTargetsHalfDetails
      );
      const newStatus = Object.entries(salesTargetsHalfDetails).map(([key, value], index) => {
        let title: { [key: string]: string } = { ja: `年度`, en: `Fiscal Year` };
        if (key === "sales_target_half" && upsertSettingEntitiesObj.periodType === "first_half_details")
          title = { ja: `上半期`, en: `First Half Year` };
        if (key === "sales_target_half" && upsertSettingEntitiesObj.periodType === "second_half_details")
          title = { ja: `下半期`, en: `Second Half Year` };
        const totalInput = totalInputSalesTargetsHalfDetails.total_targets[key as KeysSalesTargetsHalfDetails];
        const mainTargetDecimal = new Decimal(value);
        const totalInputDecimal = new Decimal(totalInput);
        // 残り目標額
        const restSalesTarget = mainTargetDecimal.minus(totalInputDecimal).toNumber();
        const isNegative = restSalesTarget < 0;
        const isComplete = restSalesTarget === 0;
        return {
          key: key,
          sales_target: formatToJapaneseYen(value),
          // sales_target: value,
          title: title,
          // restTarget: formatToJapaneseYen(restSalesTarget, true, true),
          restTarget: restSalesTarget,
          isNegative: isNegative,
          isComplete: isComplete,
        };
      });
      return newStatus;
    } catch (error: any) {
      console.error("❌エラー：🔹【メンバーレベルルート】部門別残り目標金額/総合目標 用の配列 作成 無効な値");
      return null;
    }
  }, [salesTargetsHalfDetails, totalInputSalesTargetsHalfDetails]);

  // 部門別残り目標金額/総合目標の部門の残り目標金額が全ての期間で0となり、全ての期間がisCompleteとなったらtrueにする
  const allCompleteTargetsHalfDetails = useMemo(() => {
    if (!salesTargetsHalfDetailsStatus) return null;
    if (salesTargetsHalfDetailsStatus === null) return null;
    // 会社レベルの場合は、総合目標は存在しないためnullをリターン
    if (upsertSettingEntitiesObj.entityLevel !== "member") return null;
    return salesTargetsHalfDetailsStatus.every((targetPeriod) => targetPeriod.isComplete);
  }, [salesTargetsHalfDetailsStatus]);

  // 各メンバーの「月度残り金額/Q」が全て一致して全ての月度の入力が完了したか それぞれのメンバー分の設定状況を管理
  // id/objでmapで管理
  // const [monthTargetStatusMapForAllMembers, setMonthTargetStatusMapForAllMembers] = useState(() => {
  //   if (upsertSettingEntitiesObj.entityLevel !== 'member') return null
  //     const newMap = new Map(
  //       upsertSettingEntitiesObj.entities.map((member) => [
  //         member.entity_id,
  //         {
  //           member_id: member.entity_id,
  //           member_name: member.entity_name,
  //           isCompleteAllMonthTargets: false,
  //         },
  //       ])
  //     );
  //   return newMap;
  // })

  const monthTargetStatusMapForAllMembers = useDashboardStore((state) => state.monthTargetStatusMapForAllMembers);
  const setMonthTargetStatusMapForAllMembers = useDashboardStore((state) => state.setMonthTargetStatusMapForAllMembers);

  // ✅初回マウント時 monthTargetStatusMapForAllMembersに初期値をセット
  useEffect(() => {
    if (upsertSettingEntitiesObj.entityLevel !== "member") return;

    const initialMonthTargetStatusMapForAllMembers = new Map(
      upsertSettingEntitiesObj.entities.map((member) => [
        member.entity_id,
        {
          member_id: member.entity_id,
          member_name: member.entity_name,
          isCompleteAllMonthTargets: false,
        },
      ])
    );
    setMonthTargetStatusMapForAllMembers(initialMonthTargetStatusMapForAllMembers);
  }, []);

  // 全てのメンバーの月度目標が入力済みで、かつ、月度目標の合計値がQ1, Q2の総合目標の値と一致している場合true
  const isAllCompleteMonthTargetsForMember = useMemo(() => {
    if (upsertSettingEntitiesObj.entityLevel !== "member") return false;
    if (!monthTargetStatusMapForAllMembers) return false;
    const completeResult = Array.from(monthTargetStatusMapForAllMembers.values()).every(
      (member) => member.isCompleteAllMonthTargets
    );
    return completeResult;
  }, [monthTargetStatusMapForAllMembers]);

  // --------------------🔸【メンバーレベルルート】部門別残り目標金額/総合目標 用の配列 --------------------

  const infoIconInputStatusRef = useRef<HTMLDivElement | null>(null);

  console.log(
    "🌠🌠🌠UpsertSettingTargetEntityGroupコンポーネントレンダリング",
    "upsertSettingEntitiesObj",
    upsertSettingEntitiesObj,
    "メイン目標キャッシュsalesTargetsYearHalf",
    salesTargetsYearHalf,
    "半期詳細ステータスsalesTargetsHalfDetailsStatus",
    salesTargetsHalfDetailsStatus,
    "合計目標と個別エンティティ目標totalInputSalesTargetsYearHalf",
    totalInputSalesTargetsYearHalf,
    "収集したデータinputSalesTargetsIdToDataMap",
    inputSalesTargetsIdToDataMap,
    "monthTargetStatusMapForAllMembers",
    monthTargetStatusMapForAllMembers,
    "isAllCompleteMonthTargetsForMember",
    isAllCompleteMonthTargetsForMember
    // "memberDataArray",
    // memberDataArray,
    // "settingEntityLevel",
    // settingEntityLevel,
    // "selectedPeriodDetailTrend",
    // selectedPeriodDetailTrend,
    // "サブ目標リスト",
    // subTargetList,
    // "memberDataArray",
    // memberDataArray,
    // "editSubList",
    // editSubList,
  );
  return (
    <>
      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div
          className={`flex-center fixed left-0 top-0 z-[7000] h-full w-full bg-[var(--overlay-loading-modal-inside)]`}
        >
          <SpinnerBrand withBorder withShadow />
        </div>
      )}
      {/* ===================== setting_target_container ここから ===================== */}
      <div className={`setting_target_container fixed left-0 top-0 z-[80] h-[100vh] w-[100vw] bg-[red]/[0]`}>
        <div className={`${styles.upsert_setting_container} relative flex h-full w-full`}>
          <div className={`${styles.main_container_setting} z-[1200] flex h-full w-full bg-[yellow]/[0]`}>
            <div className={`${styles.spacer_left}`}></div>
            <div className={`${styles.main_contents_wrapper} `}>
              <div className={`${styles.spacer_top}`}></div>
              {/* ===================== スクロールコンテナ ここから ===================== */}
              <div className={`${styles.main_contents_container}`}>
                {/* ----------------- １画面目 上画面 ----------------- */}
                <section
                  // className={`${styles.company_screen} space-y-[20px] ${
                  className={`${styles.company_table_screen}`}
                >
                  <div className={`${styles.title_area} ${styles.upsert} flex w-full justify-between`}>
                    <h1 className={`${styles.title} ${styles.upsert}`}>
                      <span>目標設定</span>
                    </h1>
                    <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
                      <div className={`${styles.btn} ${styles.basic}`} onClick={handleCancelUpsert}>
                        <span>戻る</span>
                      </div>
                      <div
                        className={`${styles.btn} ${styles.brand} space-x-[3px] ${
                          (upsertSettingEntitiesObj.entityLevel !== "company" &&
                            upsertSettingEntitiesObj.entityLevel !== "member" &&
                            !allCompleteTargetsYearHalf) ||
                          (upsertSettingEntitiesObj.entityLevel === "member" &&
                            (!allCompleteTargetsHalfDetails || !isAllCompleteMonthTargetsForMember))
                            ? `${styles.inactive} relative`
                            : `relative`
                        }`}
                        onMouseEnter={(e) => {
                          if (
                            upsertSettingEntitiesObj.entityLevel !== "company" &&
                            upsertSettingEntitiesObj.entityLevel !== "member" &&
                            !allCompleteTargetsYearHalf
                          ) {
                            return;
                          }
                          if (
                            upsertSettingEntitiesObj.entityLevel === "member" &&
                            (!allCompleteTargetsHalfDetails || !isAllCompleteMonthTargetsForMember)
                          ) {
                            return;
                          }
                          handleOpenTooltip({
                            e: e,
                            display: "top",
                            content: `${getDivName()}の売上目標を確定・保存します`,
                            marginTop: 9,
                            itemsPosition: `left`,
                          });
                        }}
                        onMouseLeave={handleCloseTooltip}
                        onClick={(e) => {
                          handleCollectInputTargets();
                          // if (upsertSettingEntitiesObj.entityLevel === "company") {
                          //   handleSaveTargetCompany();
                          // } else {
                          //   handleCollectInputTargets();
                          // }
                        }}
                      >
                        {upsertSettingEntitiesObj.entityLevel !== "company" &&
                          upsertSettingEntitiesObj.entityLevel !== "member" &&
                          allCompleteTargetsYearHalf && (
                            <div
                              className={`absolute left-0 top-0 z-[0] h-full w-full rounded-[6px] border-[2px] border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f60)] ${styles.animate_ping14}`}
                              style={{ animationDuration: `1.2s` }}
                            ></div>
                          )}
                        {upsertSettingEntitiesObj.entityLevel === "member" &&
                          allCompleteTargetsHalfDetails &&
                          isAllCompleteMonthTargetsForMember && (
                            <div
                              className={`absolute left-0 top-0 z-[0] h-full w-full rounded-[6px] border-[2px] border-solid border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f60)] ${styles.animate_ping14}`}
                              style={{ animationDuration: `1.2s` }}
                            ></div>
                          )}
                        {/* <RiSave3Fill className={`stroke-[3] text-[12px] text-[#fff]`} /> */}
                        <MdSaveAlt className={`z-[10] text-[14px] text-[#fff]`} />
                        <span className={`z-[10]`}>保存</span>
                      </div>
                    </div>
                  </div>
                </section>
                {/* ----------------- ２画面目 下画面 ----------------- */}
                <section className={`${styles.main_section_area} fade08_forward`}>
                  {/* ------------------ コンテンツエリア ------------------ */}
                  <div className={`${styles.contents_area} ${styles.upsert}`}>
                    {/* ---------- 総合目標 ---------- */}
                    <ErrorBoundary FallbackComponent={ErrorFallback}>
                      <Suspense
                        fallback={
                          <FallbackTargetTable
                            title={upsertSettingEntitiesObj.parentEntityName}
                            // isSettingYearHalf={!isEndEntity}
                            isSettingYearHalf={true}
                            hiddenBg={true}
                            hiddenTitle={true}
                          />
                        }
                      >
                        <div
                          className={`${styles.row_container} ${
                            upsertSettingEntitiesObj.entityLevel !== "company" &&
                            stickyRow === upsertSettingEntitiesObj.parentEntityId
                              ? styles.sticky_row
                              : ``
                          } ${
                            upsertSettingEntitiesObj.entityLevel === "company" &&
                            stickyRow === upsertSettingEntitiesObj.entities[0].entity_id
                              ? styles.sticky_row
                              : ``
                          }`}
                        >
                          {upsertSettingEntitiesObj.entityLevel === "company" && (
                            <UpsertSettingTargetGridTable
                              entityLevel={upsertSettingEntitiesObj.entityLevel}
                              entityId={upsertSettingEntitiesObj.entities[0].entity_id}
                              entityNameTitle={upsertSettingEntitiesObj.entities[0].entity_name}
                              stickyRow={stickyRow}
                              setStickyRow={setStickyRow}
                              annualFiscalMonths={annualFiscalMonthsUpsert}
                              isMainTarget={true}
                              saveEnabled={saveTriggerSalesTarget}
                              onSaveComplete={() => onSaveComplete(0)}
                              allSaved={allSaved}
                            />
                          )}
                          {upsertSettingEntitiesObj.entityLevel !== "company" && (
                            <MainTargetTableDisplayOnly
                              entityLevel={upsertSettingEntitiesObj.parentEntityLevel}
                              entityId={upsertSettingEntitiesObj.parentEntityId}
                              entityNameTitle={upsertSettingEntitiesObj.parentEntityName}
                              stickyRow={stickyRow}
                              setStickyRow={setStickyRow}
                              annualFiscalMonths={annualFiscalMonthsUpsert}
                              // salesTargetsYearHalf={}
                            />
                          )}
                          {/* {upsertSettingEntitiesObj.entityLevel !== "company" && (
                            <UpsertSettingTargetGridTable
                              // isEndEntity={isEndEntity}
                              entityLevel={upsertSettingEntitiesObj.parentEntityLevel}
                              entityId={upsertSettingEntitiesObj.parentEntityId}
                              entityNameTitle={upsertSettingEntitiesObj.parentEntityName}
                              stickyRow={stickyRow}
                              setStickyRow={setStickyRow}
                              annualFiscalMonths={annualFiscalMonthsUpsert}
                              // isFirstHalf={isFirstHalf}
                              isMainTarget={true}
                            />
                          )} */}
                        </div>
                      </Suspense>
                    </ErrorBoundary>
                    {/* ---------- 総合目標 ここまで ---------- */}

                    {/* ----------- タイトルエリア ----------- */}
                    <div className={`${styles.section_title_area} flex w-full items-end justify-between`}>
                      <h1 className={`${styles.title} ${styles.upsert}`}>
                        {/* <span>部門別</span> */}
                        <span>
                          {getDivName()}
                          {upsertSettingEntitiesObj.entityLevel !== "company" ? `別` : ``}
                        </span>

                        {upsertSettingEntitiesObj.entityLevel === "member" && (
                          <>
                            {upsertSettingEntitiesObj.periodType === "first_half_details" && (
                              <span className="ml-[12px]">上期詳細目標</span>
                            )}
                            {upsertSettingEntitiesObj.periodType === "second_half_details" && (
                              <span className="ml-[12px]">下期詳細目標</span>
                            )}
                          </>
                        )}
                      </h1>

                      <div className={`${styles.btn_area} flex h-full items-center space-x-[12px]`}>
                        {/* {upsertSettingEntitiesObj.entityLevel !== "company" && (
                          <div
                            className={`${styles.btn} ${styles.basic} space-x-[6px]`}
                            onClick={handleOpenEditSubListModal}
                          >
                            <HiOutlineSwitchHorizontal className={`text-[14px] `} />
                            <span>
                              {mappingDivName[upsertSettingEntitiesObj.entityLevel as EntityLevelNames][language]}
                              リスト編集
                            </span>
                          </div>
                        )} */}
                        {upsertSettingEntitiesObj.entityLevel && allFetched && (
                          <div
                            className={`${styles.select_btn_wrapper} fade08_forward relative flex items-center text-[var(--color-text-title-g)]`}
                            onMouseEnter={(e) => {
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                content: `チャートの表示期間を変更`,
                                marginTop: 6,
                              });
                            }}
                            onMouseLeave={handleCloseTooltip}
                          >
                            <select
                              className={`z-10 min-h-[30px] cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px] text-[14px] font-bold`}
                              // value={selectedPeriodDetailTrend.period}
                              value={selectedPeriodDetailProbability.period}
                              onChange={(e) => {
                                const periodDetail = e.target.value;
                                let periodForTrend: "fiscal_year" | "half_year" | "quarter" | "year_month" =
                                  "fiscal_year";
                                let currPeriodValue = upsertSettingEntitiesObj.fiscalYear; // 今年度
                                let periodValue = upsertSettingEntitiesObj.fiscalYear - 1; // 前年度
                                if (periodDetail === "first_half") {
                                  periodForTrend = "half_year";
                                  currPeriodValue = upsertSettingEntitiesObj.fiscalYear * 10 + 1; // 上期
                                  periodValue = (upsertSettingEntitiesObj.fiscalYear - 1) * 10 + 1; // 上期
                                }
                                if (periodDetail === "second_half") {
                                  periodForTrend = "half_year";
                                  currPeriodValue = upsertSettingEntitiesObj.fiscalYear * 10 + 2; // 下期
                                  periodValue = (upsertSettingEntitiesObj.fiscalYear - 1) * 10 + 2; // 下期
                                }

                                if (upsertSettingEntitiesObj.entityLevel === "member") {
                                  if (periodDetail === "first_quarter") {
                                    periodForTrend = "quarter";
                                    currPeriodValue = upsertSettingEntitiesObj.fiscalYear * 10 + 1; // Q1
                                    periodValue = (upsertSettingEntitiesObj.fiscalYear - 1) * 10 + 1; // Q1
                                  }
                                  if (periodDetail === "second_quarter") {
                                    periodForTrend = "quarter";
                                    currPeriodValue = upsertSettingEntitiesObj.fiscalYear * 10 + 2; // Q2
                                    periodValue = (upsertSettingEntitiesObj.fiscalYear - 1) * 10 + 2; // Q2
                                  }
                                  if (periodDetail === "third_quarter") {
                                    periodForTrend = "quarter";
                                    currPeriodValue = upsertSettingEntitiesObj.fiscalYear * 10 + 3; // Q3
                                    periodValue = (upsertSettingEntitiesObj.fiscalYear - 1) * 10 + 3; // Q3
                                  }
                                  if (periodDetail === "fourth_quarter") {
                                    periodForTrend = "quarter";
                                    currPeriodValue = upsertSettingEntitiesObj.fiscalYear * 10 + 4; // Q4
                                    periodValue = (upsertSettingEntitiesObj.fiscalYear - 1) * 10 + 4; // Q4
                                  }
                                }
                                // 売上推移用 目標年度の1年前をbasePeriodとしてセット
                                setSelectedPeriodDetailTrend({
                                  // period: periodDetail,
                                  period: periodForTrend,
                                  value: periodValue,
                                });
                                // 案件状況 目標年度と同じ年度をbasePeriodとしてセット
                                setSelectedPeriodDetailProbability({
                                  period: periodDetail,
                                  value: currPeriodValue,
                                });
                                // エリアチャート用の期間タイプも同時に更新
                                if (periodDetail === "fiscal_year") {
                                  if (periodTypeTrend !== "fiscal_year") setPeriodTypeTrend("fiscal_year");
                                }
                                if (["first_half", "second_half"].includes(periodDetail)) {
                                  if (periodTypeTrend !== "half_year") setPeriodTypeTrend("half_year");
                                }
                                if (
                                  ["first_quarter", "second_quarter", "third_quarter", "fourth_quarter"].includes(
                                    periodDetail
                                  )
                                ) {
                                  if (periodTypeTrend !== "quarter") setPeriodTypeTrend("quarter");
                                }
                                handleCloseTooltip();
                              }}
                            >
                              {/* メンバーレベル以外 */}
                              {upsertSettingEntitiesObj.entityLevel !== "member" && (
                                <>
                                  <option value="fiscal_year">年度</option>
                                  <option value="first_half">上期</option>
                                  <option value="second_half">下期</option>
                                </>
                              )}
                              {upsertSettingEntitiesObj.entityLevel === "member" && (
                                <>
                                  {upsertSettingEntitiesObj.periodType === "first_half_details" && (
                                    <>
                                      <option value="first_half">上期</option>
                                      <option value="first_quarter">Q1</option>
                                      <option value="second_quarter">Q2</option>
                                    </>
                                  )}
                                  {upsertSettingEntitiesObj.periodType === "second_half_details" && (
                                    <>
                                      <option value="second_half">下期</option>
                                      <option value="third_quarter">Q3</option>
                                      <option value="fourth_quarter">Q4</option>
                                    </>
                                  )}
                                </>
                              )}
                            </select>
                            {/* 上下矢印アイコン */}
                            <div className={`${styles.select_arrow}`}>
                              <HiOutlineSelector className="stroke-[2] text-[16px]" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* ----------- タイトルエリア ここまで ----------- */}

                    {/* ----------- 部門別シェア ３列エリア ----------- */}
                    {!allFetched && (
                      <div className={`flex-center fade08_forward h-full max-h-[225px] min-h-[225px] w-full`}>
                        <SpinnerX />
                      </div>
                    )}
                    {/* 🌟全社レベル🌟 */}
                    {allFetched && upsertSettingEntitiesObj.entityLevel === "company" && (
                      <div className={`${styles.grid_row} ${styles.col2} fade08_forward`}>
                        <div className={`${styles.grid_content_card}`} style={{ minHeight: `369px` }}>
                          <div className={`${styles.card_title_area}`}>
                            <div className={`${styles.card_title}`}>
                              <div className={`flex flex-col`}>
                                <span>売上推移 全社</span>
                                <span className={`text-[12px] text-[var(--color-text-sub)]`}>
                                  {trendPeriodTitle.periodStart} ~ {trendPeriodTitle.periodEnd}
                                </span>
                              </div>
                            </div>
                          </div>

                          <ErrorBoundary FallbackComponent={ErrorFallback}>
                            <Suspense
                              fallback={
                                <div
                                  className={`flex-center w-full`}
                                  style={{ minHeight: `302px`, padding: `0px 0px 6px` }}
                                >
                                  <SpinnerX />
                                </div>
                              }
                            >
                              <AreaChartTrend
                                companyId={userProfileState.company_id}
                                entityLevel={upsertSettingEntitiesObj.entityLevel}
                                entityIdsArray={Array.from(targetEntityIdsSet)}
                                periodType={periodTypeTrend}
                                basePeriod={selectedPeriodDetailTrend.value}
                                yearsBack={yearsBack} // デフォルトはbasePeriodの年から2年遡って過去3年分を表示する
                                fetchEnabled={true}
                              />
                            </Suspense>
                          </ErrorBoundary>
                        </div>
                        <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                          <div className={`${styles.card_title_area} !items-start`}>
                            <div className={`${styles.card_title}`}>
                              <div className={`flex flex-col`}>
                                <span>案件状況 全社</span>
                                <span className={`text-[12px] text-[var(--color-text-sub)]`}>
                                  {salesProbabilityPeriodTitle}
                                </span>
                              </div>
                            </div>
                            <div className={`flex h-full items-start justify-end pt-[3px]`}>
                              <div
                                className={`${styles.select_btn_wrapper} relative flex items-center text-[var(--color-text-title-g)]`}
                                // onMouseEnter={(e) => {
                                //   handleOpenTooltip({
                                //     e: e,
                                //     display: "top",
                                //     content: stickyRow === entityId ? `固定を解除` : `画面内に固定`,
                                //     marginTop: 9,
                                //   });
                                // }}
                                // onMouseLeave={handleCloseTooltip}
                              >
                                <select
                                  className={`z-10 min-h-[30px] cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px] text-[13px]`}
                                  // style={{ boxShadow: `0 0 0 1px var(--color-border-base)` }}
                                  value={selectedEntityIdForDonut}
                                  onChange={(e) => {
                                    setSelectedEntityIdForDonut(e.target.value);
                                  }}
                                >
                                  {optionsEntity.map((obj, index) => (
                                    <option key={`option_${obj.id}`} value={obj.id}>
                                      {obj.entityName}
                                    </option>
                                  ))}
                                </select>
                                {/* 上下矢印アイコン */}
                                <div className={`${styles.select_arrow}`}>
                                  {/* <HiOutlineSelector className="stroke-[2] text-[16px]" /> */}
                                  <IoChevronDownOutline className={`text-[12px]`} />
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* <div className={`${styles.main_container}`}></div> */}
                          <ErrorBoundary FallbackComponent={ErrorFallback}>
                            <Suspense
                              fallback={
                                <div
                                  className={`flex-center w-full`}
                                  style={{ minHeight: `302px`, padding: `0px 0px 6px` }}
                                >
                                  <SpinnerX />
                                </div>
                              }
                            >
                              <DonutChartDeals
                                companyId={userProfileState.company_id}
                                entityLevel={upsertSettingEntitiesObj.entityLevel}
                                entityId={selectedEntityIdForDonut}
                                periodTitle={dealStatusPeriodTitle}
                                periodType={periodTypeTrend} // 案件状況はpropertiesテーブルから取得するためTrendと同じ期間タイプでOK "fiscal_year" | "half_year" | "quarter" | "year_month"
                                basePeriod={selectedPeriodDetailProbability.value}
                                fetchEnabled={true}
                              />
                            </Suspense>
                          </ErrorBoundary>
                        </div>
                      </div>
                    )}
                    {/* 🌟全社レベル🌟 */}
                    {/* 🌟事業部〜メンバーレベル🌟 */}
                    {allFetched && upsertSettingEntitiesObj.entityLevel !== "company" && (
                      <div className={`${styles.grid_row} ${styles.col2} fade08_forward`}>
                        <div className={`${styles.grid_content_card}`} style={{ minHeight: `369px` }}>
                          <div className={`${styles.card_title_area}`}>
                            <div className={`${styles.card_title}`}>
                              <div className={`flex flex-col`}>
                                <div className={`flex items-center`}>
                                  <span>売上推移</span>
                                  <span className={`ml-[12px]`}>
                                    {getDivName()}
                                    {upsertSettingEntitiesObj.entityLevel !== "company" ? `別` : ``}
                                  </span>
                                </div>
                                <span className={`text-[12px] text-[var(--color-text-sub)]`}>
                                  {trendPeriodTitle.periodStart} ~ {trendPeriodTitle.periodEnd}
                                </span>
                              </div>
                            </div>
                          </div>

                          <ErrorBoundary FallbackComponent={ErrorFallback}>
                            <Suspense
                              fallback={
                                <div
                                  className={`flex-center w-full`}
                                  style={{ minHeight: `302px`, padding: `0px 0px 6px` }}
                                >
                                  <SpinnerX />
                                </div>
                              }
                            >
                              <AreaChartTrend
                                companyId={userProfileState.company_id}
                                entityLevel={upsertSettingEntitiesObj.entityLevel}
                                entityIdsArray={Array.from(targetEntityIdsSet)}
                                periodType={periodTypeTrend}
                                basePeriod={selectedPeriodDetailTrend.value}
                                yearsBack={yearsBack} // デフォルトはbasePeriodの年から2年遡って過去3年分を表示する
                                fetchEnabled={true}
                              />
                            </Suspense>
                          </ErrorBoundary>
                        </div>
                        <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                          <div className={`${styles.card_title_area} !items-start`}>
                            <div className={`${styles.card_title}`}>
                              <div className={`flex flex-col`}>
                                {/* <span>案件状況 全社</span> */}
                                <div className={`flex items-center`}>
                                  <span>案件状況</span>
                                  <span className={`ml-[12px]`}>
                                    {targetEntityIdToObjMap.get(selectedEntityIdForDonut)?.entity_name ?? getDivName()}
                                  </span>
                                </div>
                                <span className={`text-[12px] text-[var(--color-text-sub)]`}>
                                  {salesProbabilityPeriodTitle}
                                </span>
                              </div>
                            </div>
                            <div className={`flex h-full items-start justify-end pt-[3px]`}>
                              <div
                                className={`${styles.select_btn_wrapper} relative flex items-center text-[var(--color-text-title-g)]`}
                                // onMouseEnter={(e) => {
                                //   handleOpenTooltip({
                                //     e: e,
                                //     display: "top",
                                //     content: stickyRow === entityId ? `固定を解除` : `画面内に固定`,
                                //     marginTop: 9,
                                //   });
                                // }}
                                // onMouseLeave={handleCloseTooltip}
                              >
                                <select
                                  className={`z-10 min-h-[30px] cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px] text-[13px]`}
                                  // style={{ boxShadow: `0 0 0 1px var(--color-border-base)` }}
                                  value={selectedEntityIdForDonut}
                                  onChange={(e) => {
                                    setSelectedEntityIdForDonut(e.target.value);
                                  }}
                                >
                                  {optionsEntity.map((obj, index) => (
                                    <option key={`option_${obj.id}`} value={obj.id}>
                                      {obj.entityName}
                                    </option>
                                  ))}
                                </select>
                                {/* 上下矢印アイコン */}
                                <div className={`${styles.select_arrow}`}>
                                  {/* <HiOutlineSelector className="stroke-[2] text-[16px]" /> */}
                                  <IoChevronDownOutline className={`text-[12px]`} />
                                </div>
                              </div>
                            </div>
                          </div>
                          {/* <div className={`${styles.main_container}`}></div> */}
                          <ErrorBoundary FallbackComponent={ErrorFallback}>
                            <Suspense
                              fallback={
                                <div
                                  className={`flex-center w-full`}
                                  style={{ minHeight: `302px`, padding: `0px 0px 6px` }}
                                >
                                  <SpinnerX />
                                </div>
                              }
                            >
                              <DonutChartDeals
                                companyId={userProfileState.company_id}
                                entityLevel={upsertSettingEntitiesObj.entityLevel}
                                entityId={selectedEntityIdForDonut}
                                periodTitle={dealStatusPeriodTitle}
                                periodType={periodTypeTrend}
                                basePeriod={selectedPeriodDetailProbability.value}
                                fetchEnabled={true}
                              />
                            </Suspense>
                          </ErrorBoundary>
                        </div>
                      </div>
                    )}
                    {/* 🌟事業〜メンバーレベル🌟 */}
                    {/*  */}
                    {/* <div className={`${styles.grid_row} ${styles.col2} fade08_forward`}>
                      <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                        <div className={`${styles.card_title_area}`}>
                          <div className={`${styles.card_title}`}>
                            <span>売上目標シェア {upsertSettingEntitiesObj.fiscalYear}年度</span>
                          </div>
                        </div>
                        <div className={`${styles.main_container}`}></div>
                      </div>
                      <div className={`${styles.grid_content_card}`} style={{ minHeight: `300px` }}>
                        <div className={`${styles.card_title_area}`}>
                          <div className={`${styles.card_title}`}>
                            <span>
                              売上推移 {upsertSettingEntitiesObj.fiscalYear - 3} ~{" "}
                              {upsertSettingEntitiesObj.fiscalYear - 1}
                              年度
                            </span>
                          </div>
                        </div>
                        <div className={`${styles.main_container}`}></div>
                      </div>
                    </div> */}
                    {/*  */}
                    {/* ----------- 部門別シェア ３列エリア ここまで ----------- */}

                    {/* ----------- 残り/総合目標 入力状況確認テーブル ----------- */}
                    {upsertSettingEntitiesObj.entityLevel !== "company" && !!salesTargetsYearHalf && allFetched && (
                      <div
                        className={`${styles.row_container} ${stickyRow === `input_status` ? styles.sticky_row : ``}`}
                      >
                        <div className={`${styles.grid_row} ${styles.col1} fade08_forward`}>
                          <div className={`${styles.grid_content_card} relative`}>
                            {/* ------------------ タイトルエリア ------------------ */}
                            <div className={`${styles.card_title_area}`}>
                              <div className={`${styles.card_title} flex items-center`}>
                                <span>{getDivName()}残り目標金額 / 総合目標</span>
                                <div className={`ml-[12px] flex h-full items-center`}>
                                  <div
                                    className="flex-center relative h-[16px] w-[16px] rounded-full"
                                    onMouseEnter={(e) => {
                                      const icon = infoIconInputStatusRef.current;
                                      if (icon && icon.classList.contains(styles.animate_ping)) {
                                        icon.classList.remove(styles.animate_ping);
                                      }
                                      handleOpenTooltip({
                                        e: e,
                                        display: "top",
                                        content: `全ての${getDivName()}の売上目標の合計値が総合目標となる${
                                          mappingDivName[
                                            upsertSettingEntitiesObj.parentEntityLevel as EntityLevelNames
                                          ][language]
                                        }の売上目標と\n一致するように目標金額を振り分けてください。`,
                                        marginTop: 39,
                                        itemsPosition: `left`,
                                      });
                                    }}
                                    onMouseLeave={handleCloseTooltip}
                                  >
                                    <div
                                      ref={infoIconInputStatusRef}
                                      className={`flex-center absolute left-0 top-0 h-[16px] w-[16px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                                    ></div>
                                    <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                                  </div>
                                </div>
                                {upsertSettingEntitiesObj.entityLevel !== "member" && (
                                  <>
                                    {!allCompleteTargetsYearHalf && (
                                      <div
                                        className={`flex-center ml-[18px] h-full pb-[2px] text-[13px] font-normal text-[var(--main-color-tk)]`}
                                      >
                                        <span className="">未完了</span>
                                      </div>
                                    )}
                                    {allCompleteTargetsYearHalf && (
                                      <div
                                        className={`flex-center ml-[18px] rounded-full border border-solid border-[var(--bright-green)] bg-[var(--bright-green)] px-[12px] py-[3px] text-[12px] text-[#fff]`}
                                        onMouseEnter={(e) => {
                                          handleOpenTooltip({
                                            e: e,
                                            display: "top",
                                            content: `全ての${getDivName()}の売上目標の設定が完了しました！\n保存ボタンをクリックして売上目標を確定・保存してください。`,
                                            marginTop: 30,
                                            itemsPosition: `left`,
                                          });
                                        }}
                                        onMouseLeave={handleCloseTooltip}
                                      >
                                        <span className="ml-[2px]">設定完了</span>
                                        <BsCheck2 className="pointer-events-none ml-[6px] min-h-[18px] min-w-[18px] stroke-1 text-[18px] text-[#fff]" />
                                      </div>
                                    )}
                                  </>
                                )}
                                {upsertSettingEntitiesObj.entityLevel === "member" && (
                                  <>
                                    {!allCompleteTargetsHalfDetails && (
                                      <div
                                        className={`flex-center ml-[18px] h-full pb-[2px] text-[13px] font-normal text-[var(--main-color-tk)]`}
                                      >
                                        <span className="">未完了</span>
                                      </div>
                                    )}
                                    {allCompleteTargetsHalfDetails && (
                                      <div
                                        className={`flex-center ml-[18px] rounded-full border border-solid border-[var(--bright-green)] bg-[var(--bright-green)] px-[12px] py-[3px] text-[12px] text-[#fff]`}
                                        onMouseEnter={(e) => {
                                          handleOpenTooltip({
                                            e: e,
                                            display: "top",
                                            content: `全ての${getDivName()}の売上目標の設定が完了しました！\n保存ボタンをクリックして売上目標を確定・保存してください。`,
                                            marginTop: 30,
                                            itemsPosition: `left`,
                                          });
                                        }}
                                        onMouseLeave={handleCloseTooltip}
                                      >
                                        <span className="ml-[2px]">設定完了</span>
                                        <BsCheck2 className="pointer-events-none ml-[6px] min-h-[18px] min-w-[18px] stroke-1 text-[18px] text-[#fff]" />
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                              <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
                                <div
                                  className={`${styles.btn} ${styles.basic} space-x-[4px]`}
                                  onMouseEnter={(e) => {
                                    handleOpenTooltip({
                                      e: e,
                                      display: "top",
                                      content: stickyRow === "input_status" ? `固定を解除` : `画面内に固定`,
                                      marginTop: 9,
                                    });
                                  }}
                                  onMouseLeave={handleCloseTooltip}
                                  onClick={() => {
                                    if ("input_status" === stickyRow) {
                                      setStickyRow(null);
                                    } else {
                                      setStickyRow("input_status");
                                    }
                                    handleCloseTooltip();
                                  }}
                                >
                                  {stickyRow === "input_status" && <TbSnowflakeOff />}
                                  {stickyRow !== "input_status" && <TbSnowflake />}
                                  {stickyRow === "input_status" && <span>解除</span>}
                                  {stickyRow !== "input_status" && <span>固定</span>}
                                </div>
                              </div>
                            </div>
                            {/* ------------------ タイトルエリア ここまで ------------------ */}
                            {/* ------------------ メインコンテナ ------------------ */}
                            <div
                              className={`${styles.main_container}`}
                              // style={{ paddingTop: `10px`, paddingBottom: `15px`, padding: `10px 24px 15px` }}
                              style={{ padding: `10px 24px 15px` }}
                            >
                              <div className={`flex w-full items-center justify-between`}>
                                {upsertSettingEntitiesObj.entityLevel !== "member" &&
                                  !!salesTargetsYearHalfStatus &&
                                  salesTargetsYearHalfStatus.map((obj) => {
                                    // const totalInputSalesTarget =
                                    //   totalInputSalesTargetsYearHalf[obj.key as KeysSalesTargetsYearHalf];
                                    return (
                                      <div key={`${obj.key}`} className={`flex w-1/3 items-center justify-start`}>
                                        <div
                                          className={` flex items-center ${obj.isComplete ? `mr-[12px]` : `mr-[15px]`}`}
                                        >
                                          <div
                                            className={`flex-center min-w-max whitespace-nowrap rounded-full border border-solid border-[var(--color-border-light)] px-[12px] py-[3px] text-[12px] text-[var(--color-text-title)]`}
                                          >
                                            <span>{obj.title[language]}</span>
                                          </div>
                                          {obj.isComplete && (
                                            <BsCheck2 className="pointer-events-none ml-[12px] min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                                          )}
                                        </div>
                                        <div className={`flex flex-wrap items-end space-x-[12px]`}>
                                          <div
                                            className={`flex items-end text-[19px] font-bold ${
                                              obj.isNegative
                                                ? `text-[var(--main-color-tk)]`
                                                : obj.isComplete
                                                ? `text-[var(--color-text-title)]`
                                                : `text-[var(--color-text-title)]`
                                            }`}
                                          >
                                            <div className="mr-[6px] flex items-end pb-[3px]">
                                              <span className={`text-[11px] font-normal`}>残り</span>
                                            </div>
                                            {/* <span>{obj.restTarget}</span> */}
                                            <ProgressNumber
                                              targetNumber={obj.restTarget}
                                              // startNumber={Math.round(68000 / 2)}
                                              // startNumber={Number((68000 * 0.1).toFixed(0))}
                                              startNumber={0}
                                              duration={3000}
                                              easeFn="Quintic"
                                              fontSize={19}
                                              // margin="0 0 -3px 0"
                                              margin="0 0 0 0"
                                              isReady={true}
                                              fade={`fade08_forward`}
                                              isPrice={true}
                                              isPercent={false}
                                              includeCurrencySymbol={obj.isComplete ? false : true}
                                              showNegativeSign={true}
                                              textColor={`${
                                                obj.isNegative
                                                  ? `var(--main-color-tk)`
                                                  : obj.isComplete
                                                  ? `var(--bright-green)`
                                                  : `var(--color-text-title)`
                                              }`}
                                            />
                                          </div>
                                          <div className={`flex items-center space-x-[6px]`}>
                                            <div className={``}>
                                              <span>/</span>
                                            </div>
                                            <div className={`text-[14px]`}>
                                              <span>{obj.sales_target}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                {upsertSettingEntitiesObj.entityLevel === "member" &&
                                  !!salesTargetsHalfDetailsStatus &&
                                  salesTargetsHalfDetailsStatus.map((obj) => {
                                    // const totalInputSalesTarget =
                                    //   totalInputSalesTargetsYearHalf[obj.key as KeysSalesTargetsYearHalf];
                                    return (
                                      <div key={`${obj.key}`} className={`flex w-1/3 items-center justify-start`}>
                                        <div
                                          className={` flex items-center ${obj.isComplete ? `mr-[12px]` : `mr-[15px]`}`}
                                        >
                                          <div
                                            className={`flex-center min-w-max whitespace-nowrap rounded-full border border-solid border-[var(--color-border-light)] px-[12px] py-[3px] text-[12px] text-[var(--color-text-title)]`}
                                          >
                                            <span>{obj.title[language]}</span>
                                          </div>
                                          {obj.isComplete && (
                                            <BsCheck2 className="pointer-events-none ml-[12px] min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                                          )}
                                        </div>
                                        <div className={`flex flex-wrap items-end space-x-[12px]`}>
                                          <div
                                            className={`flex items-end text-[19px] font-bold ${
                                              obj.isNegative
                                                ? `text-[var(--main-color-tk)]`
                                                : obj.isComplete
                                                ? `text-[var(--color-text-title)]`
                                                : `text-[var(--color-text-title)]`
                                            }`}
                                          >
                                            <div className="mr-[6px] flex items-end pb-[3px]">
                                              <span className={`text-[11px] font-normal`}>残り</span>
                                            </div>
                                            {/* <span>{obj.restTarget}</span> */}
                                            <ProgressNumber
                                              targetNumber={obj.restTarget}
                                              // startNumber={Math.round(68000 / 2)}
                                              // startNumber={Number((68000 * 0.1).toFixed(0))}
                                              startNumber={0}
                                              duration={3000}
                                              easeFn="Quintic"
                                              fontSize={19}
                                              // margin="0 0 -3px 0"
                                              margin="0 0 0 0"
                                              isReady={true}
                                              fade={`fade08_forward`}
                                              isPrice={true}
                                              isPercent={false}
                                              includeCurrencySymbol={obj.isComplete ? false : true}
                                              showNegativeSign={true}
                                              textColor={`${
                                                obj.isNegative
                                                  ? `var(--main-color-tk)`
                                                  : obj.isComplete
                                                  ? `var(--bright-green)`
                                                  : `var(--color-text-title)`
                                              }`}
                                            />
                                          </div>
                                          <div className={`flex items-center space-x-[6px]`}>
                                            <div className={``}>
                                              <span>/</span>
                                            </div>
                                            <div className={`text-[14px]`}>
                                              <span>{obj.sales_target}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                            {/* ------------------ メインコンテナ ここまで ------------------ */}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* ----------- 残り/総合目標 入力状況確認テーブル ここまで ----------- */}

                    {/* ---------- 部門別目標 ---------- */}
                    {!!salesTargetsYearHalf &&
                      upsertSettingEntitiesObj.entityLevel !== "company" &&
                      subTargetList &&
                      subTargetList.length > 0 &&
                      subTargetList.map((obj, tableIndex) => {
                        const targetEntityLevel = upsertSettingEntitiesObj.entityLevel;
                        const targetTitle = getSubTargetTitle(targetEntityLevel, obj);
                        const entityLevelName = mappingEntityName[targetEntityLevel][language];
                        // currentActiveIndexより大きいindexのテーブルはローディングを表示しておく
                        if (tableIndex > currentActiveIndex) {
                          // console.log(
                          //   "部門別目標 ローディング中🙇 tableIndex",
                          //   tableIndex,
                          //   "currentActiveIndex",
                          //   currentActiveIndex,
                          //   "targetTitle",
                          //   targetTitle
                          // );
                          return (
                            <Fragment key={`${obj.id}_${targetEntityLevel}_${targetTitle}_fallback`}>
                              <FallbackTargetTable
                                title={entityLevelName}
                                isSettingYearHalf={targetEntityLevel !== "member"}
                                hiddenBg={true}
                                hiddenTitle={true}
                              />
                            </Fragment>
                          );
                        }
                        // console.log(
                        //   "部門別目標 アクティブマウント🔥 tableIndex",
                        //   tableIndex,
                        //   "currentActiveIndex",
                        //   currentActiveIndex,
                        //   "targetTitle",
                        //   targetTitle
                        // );

                        return (
                          <Fragment key={`${obj.id}_${targetEntityLevel}_${targetTitle}`}>
                            <ErrorBoundary FallbackComponent={ErrorFallback}>
                              <Suspense fallback={<FallbackTargetTable title={targetTitle} />}>
                                <div
                                  className={`${styles.row_container} ${stickyRow === obj.id ? styles.sticky_row : ``}`}
                                >
                                  {upsertSettingEntitiesObj.entityLevel !== "member" && (
                                    <UpsertSettingTargetGridTable
                                      // isEndEntity={upsertSettingEntitiesObj.entityLevel === "member"}
                                      entityLevel={targetEntityLevel}
                                      entityNameTitle={targetTitle}
                                      entityId={obj.id}
                                      parentEntityLevel={upsertSettingEntitiesObj.parentEntityLevel}
                                      parentEntityId={upsertSettingEntitiesObj.parentEntityId}
                                      parentEntityNameTitle={upsertSettingEntitiesObj.parentEntityName}
                                      stickyRow={stickyRow}
                                      setStickyRow={setStickyRow}
                                      annualFiscalMonths={annualFiscalMonthsUpsert}
                                      // isFirstHalf={isFirstHalf}
                                      isMainTarget={false}
                                      // fetchEnabled={
                                      //   !!salesTargetsYearHalf && (tableIndex === currentActiveIndex || allFetched)
                                      // }
                                      fetchEnabled={tableIndex === currentActiveIndex || allFetched} // インデックスが一致しているか、全てフェッチが完了している時のみフェッチを許可
                                      onFetchComplete={() => onFetchComplete(tableIndex)}
                                      saveEnabled={saveTriggerSalesTarget && tableIndex === currentActiveIndexSave}
                                      onSaveComplete={() => onSaveComplete(tableIndex)}
                                      allSaved={allSaved}
                                    />
                                  )}
                                  {upsertSettingEntitiesObj.entityLevel === "member" && (
                                    <UpsertSettingTargetGridTableForMemberLevel
                                      // isEndEntity={upsertSettingEntitiesObj.entityLevel === "member"}
                                      entityLevel={targetEntityLevel}
                                      entityNameTitle={targetTitle}
                                      entityId={obj.id}
                                      parentEntityLevel={upsertSettingEntitiesObj.parentEntityLevel}
                                      parentEntityId={upsertSettingEntitiesObj.parentEntityId}
                                      parentEntityNameTitle={upsertSettingEntitiesObj.parentEntityName}
                                      stickyRow={stickyRow}
                                      setStickyRow={setStickyRow}
                                      annualFiscalMonths={annualFiscalMonthsUpsert}
                                      fetchEnabled={tableIndex === currentActiveIndex || allFetched} // インデックスが一致しているか、全てフェッチが完了している時のみフェッチを許可
                                      onFetchComplete={() => onFetchComplete(tableIndex)}
                                      saveEnabled={saveTriggerSalesTarget && tableIndex === currentActiveIndexSave}
                                      onSaveComplete={() => onSaveComplete(tableIndex)}
                                      allSaved={allSaved}
                                    />
                                  )}
                                </div>
                              </Suspense>
                            </ErrorBoundary>
                          </Fragment>
                        );
                      })}
                    {/* ---------- 部門別目標 ここまで ---------- */}
                  </div>
                  {/* ------------------ コンテンツエリア ここまで ------------------ */}
                </section>

                {/* ----------------- ２画面目 下画面 ここまで ----------------- */}
              </div>
              {/* ===================== スクロールコンテナ ここまで ===================== */}
            </div>
          </div>
        </div>
      </div>
      {/* ===================== setting_target_container ここまで ===================== */}

      {/* ---------------------- 売上目標を保存・確定 ---------------------- */}
      {/* top left スペーサー z-[4500] */}
      {isOpenConfirmDialog && (
        <ConfirmationModal
          titleText={`売上目標を保存・確定してもよろしいですか？`}
          sectionP1={`確定することで入力した売上目標が${
            mappingEntityName[upsertSettingEntitiesObj.entityLevel][language]
          }レイヤーの${upsertSettingEntitiesObj.fiscalYear}年度の売上目標として設定されます。`}
          cancelText="戻る"
          submitText="確定する"
          buttonColor="brand"
          zIndex="6000px"
          zIndexOverlay="5800px"
          withAnnotation={true}
          annotationText="注：この操作は少し時間がかかります。画面を閉じずにお待ちください。"
          clickEventClose={() => {
            setSaveTriggerSalesTarget(false); //トリガーをリセット
            setInputSalesTargetsIdToDataMap({}); // 収集したデータをリセット
            setIsOpenConfirmDialog(false); // ダイアログを閉じる
          }}
          clickEventSubmit={handleSaveTarget}
        />
      )}
      {/* ---------------------- 売上目標を保存・確定 ここまで ---------------------- */}
    </>
  );
};

export const UpsertSettingTargetEntityGroup = memo(UpsertSettingTargetEntityGroupMemo);
