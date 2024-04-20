import {
  EntitiesHierarchy,
  EntityGroupByParent,
  EntityLevelNames,
  EntityLevels,
  SectionMenuParams,
  UpsertSettingEntitiesObj,
  hoveredItemPos,
} from "@/types";
import styles from "../../../DashboardSalesTargetComponent.module.css";
import { mappingEntityName } from "@/utils/mappings";
import { addTaskIllustration } from "@/components/assets";
import NextImage from "next/image";
import useDashboardStore from "@/store/useDashboardStore";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { FiPlus } from "react-icons/fi";
import { useQueryAddedEntitiesMemberCount } from "@/hooks/useQueryAddedEntitiesMemberCount";
import { BsCheck2 } from "react-icons/bs";

type TooltipParams = {
  e: React.MouseEvent<HTMLElement, MouseEvent>;
  display: string;
  content?: string;
  content2?: string | undefined | null;
  marginTop?: number;
  itemsPosition?: string;
};

type Props = {
  levelObj: EntityLevels;
  settingLevelState: string;
  language: string;
  entityGroupListByParent: EntityGroupByParent[] | null;
  handleOpenTooltip: ({ e, display, content, content2, marginTop, itemsPosition }: TooltipParams) => void;
  handleCloseTooltip: () => void;
  isLoadingSave: boolean;
  hoveredItemPos: hoveredItemPos;
  step: number;
  currentLevel: "" | EntityLevelNames;
  parentEntityLevel: "root" | "company" | "department" | "section" | "unit";
  handleOpenEditEntityListByParentModal: ({ parentEntityId }: { parentEntityId: string }) => void;
  setIsSettingTargetMode: (value: SetStateAction<boolean>) => void;
  entitiesHierarchyLocal: EntitiesHierarchy;
  // setSelectedMemberAndPeriodType: Dispatch<
  //   SetStateAction<{
  //     memberGroupObjByParent: EntityGroupByParent;
  //     periodType: string;
  //     isConfirmFirstHalf: boolean;
  //     isConfirmSecondHalf: boolean;
  //   } | null>
  // >;
  handleOpenSectionMenu: ({ e, title, displayX, maxWidth, minWidth, fadeType }: SectionMenuParams) => void;
};

export const EntityLevelColumn = ({
  levelObj,
  settingLevelState,
  language,
  entityGroupListByParent,
  handleOpenTooltip,
  handleCloseTooltip,
  isLoadingSave,
  hoveredItemPos,
  step,
  currentLevel,
  parentEntityLevel,
  handleOpenEditEntityListByParentModal,
  setIsSettingTargetMode,
  entitiesHierarchyLocal,
  // setSelectedMemberAndPeriodType,
  handleOpenSectionMenu,
}: Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const upsertSettingEntitiesObj = useDashboardStore((state) => state.upsertSettingEntitiesObj);
  const setUpsertSettingEntitiesObj = useDashboardStore((state) => state.setUpsertSettingEntitiesObj);

  // メンバーレベル目標設定時専用 「上期詳細」「下期詳細」切り替えstate "first_half_details" | "second_half_details"
  const selectedPeriodTypeForMemberLevel = useDashboardStore((state) => state.selectedPeriodTypeForMemberLevel);
  const setSelectedPeriodTypeForMemberLevel = useDashboardStore((state) => state.setSelectedPeriodTypeForMemberLevel);

  const entityLevel = levelObj.entity_level;

  if (!upsertSettingEntitiesObj || !userProfileState) return;

  // ===================== 🔸追加した各エンティティ内にメンバーがいるかどうか人数をcountで確認useQuery🔸 =====================
  // currentLevelのエンティティレベル内でentitiesHierarchyに格納されたエンティティに対してqueryを行う
  const {
    data: addedEntitiesMemberCountQueryData,
    isLoading: isLoadingQueryAddedEntitiesMemberCount,
    isError: isErrorQueryAddedEntitiesMemberCount,
  } = useQueryAddedEntitiesMemberCount({
    company_id: userProfileState.company_id,
    currentLevel,
    entitiesHierarchyLocal,
    targetType: "sales_target",
    levelObj: levelObj,
    isReady: step === 2 && currentLevel !== "" && currentLevel !== "company" && currentLevel !== "member", // レベル内に追加した事業部~係の各エンティティにメンバーが所属しているか確認、メンバーがいないエンティティがstep2で入っている場合は「構成を確定」がクリックできないようにする
  });
  // ===================== 🔸追加した各エンティティ内にメンバーがいるかどうか人数をcountで確認useQuery🔸 =====================

  // リスト編集時にレベル内のエンティティからメンバーが所属しているエンティティのidをSetオブジェクトで保持し、リスト編集モーダル内でメンバー所属ありのエンティティのみを残せるようにする
  const entityIdsWithMembersSetObj = useDashboardStore((state) => state.entityIdsWithMembersSetObj);
  const setEntityIdsWithMembersSetObj = useDashboardStore((state) => state.setEntityIdsWithMembersSetObj);

  const addedEntityMemberCountSetObj = useMemo(() => {
    if (!addedEntitiesMemberCountQueryData) return null;
    const addedEntityMemberCountArray = Object.values(addedEntitiesMemberCountQueryData);

    if (addedEntityMemberCountArray.length === 0) return null;

    const newAddedEntityMemberCountSetObj = new Set(
      addedEntityMemberCountArray.filter((obj) => obj.member_count && obj.member_count > 0).map((obj) => obj.entity_id)
    );
    return newAddedEntityMemberCountSetObj;
  }, [addedEntitiesMemberCountQueryData]);

  // リスト編集時にメンバー所属なしのエンティティを即時判別できるようにcurrentLevelと同じレベルのカラムには
  // メンバーが1人以上いたエンティティのSetオブジェクトを生成して、Zustandにセットし、リスト編集モーダルで使用する
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (currentLevel !== levelObj.entity_level) return;
    if (!addedEntitiesMemberCountQueryData) return;
    // 既にマウント済みで、かつ既にZustandに格納されている状態ならリターン
    if (isMounted && entityIdsWithMembersSetObj !== null) return;
    // 初回マウントで、かつ、まだZustandに格納されていない場合はZustandに格納

    setEntityIdsWithMembersSetObj(addedEntityMemberCountSetObj);
    setIsMounted(true);
    // if (addedEntityMemberCountSetObj !== null) {
    //   setEntityIdsWithMembersSetObj(addedEntityMemberCountSetObj);
    // }
  }, [addedEntitiesMemberCountQueryData]);

  // ---------------------- 🌠各上位エンティティグループごとの設定完了状況を取得🌠 ----------------------
  const completeSettingMapInGroup = useMemo(() => {
    // 現在設定対象のレベル以外は不要のためリターン
    if (currentLevel !== levelObj.entity_level) return null;
    if (!entityGroupListByParent) return null;
    // 一旦メンバーレベル以外で設定 あとで編集🌠🌠🌠🌠🌠🌠🌠
    const newStatusArray = entityGroupListByParent.map((group) => {
      const isConfirmedAllEntities = group.entities.every((entity) =>
        currentLevel !== "member"
          ? entity.is_confirmed_annual_half
          : selectedPeriodTypeForMemberLevel === "first_half_details"
          ? entity.is_confirmed_first_half_details
          : entity.is_confirmed_second_half_details
      );
      return {
        parent_entity_id: group.parent_entity_id ?? "",
        parent_entity_name: group.parent_entity_name,
        isCompleteAllEntities: isConfirmedAllEntities,
      };
    });
    return new Map(newStatusArray.map((group) => [group.parent_entity_id, group]));
  }, [entityGroupListByParent, currentLevel, selectedPeriodTypeForMemberLevel]);

  console.log(
    `🔸${levelObj.entity_level}レベルコンポーネント`,
    "追加済みエンティティのメンバー所属有無状況クエリ結果",
    addedEntitiesMemberCountQueryData,
    `${levelObj.entity_level}レベル内上位エンティティグループごとの目標設定状況`,
    completeSettingMapInGroup
  );

  return (
    <>
      {/* <div key={`column_${levelObj.entity_level}`} className={`${styles.col} fade08_forward`}> */}
      <div className={`${styles.col} fade08_forward`}>
        <div className={`flex w-full justify-between`}>
          <h4 className={`text-[19px] font-bold`}>{mappingEntityName[entityLevel][language]}</h4>
          <div className={`flex items-center text-[13px]`}>
            {currentLevel !== "member" && (
              <>
                {settingLevelState === "notSet" && <span className={`text-[var(--main-color-tk)]`}>未設定</span>}
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
              </>
            )}

            {currentLevel === "member" && (
              <>
                {(selectedPeriodTypeForMemberLevel === "first_half_details" &&
                  ["setAll", "setFirstHalf"].includes(settingLevelState)) ||
                (selectedPeriodTypeForMemberLevel === "second_half_details" &&
                  ["setAll", "setSecondHalf"].includes(settingLevelState)) ? (
                  <div className={`flex-center text-[var(--color-text-brand-f)]`}>
                    <span className={`text-[13px]`}>設定完了</span>
                  </div>
                ) : (
                  <span className={`text-[var(--main-color-tk)]`}>未設定</span>
                )}
              </>
            )}
            {/* メンバーレベルに達した時に「上期詳細」「下期詳細」を切り替えて目標設定状態を確認できるようにする */}
            {/* <div className={`${styles.select_btn_wrapper} relative flex items-center text-[var(--color-text-title-g)]`}>
              <select
                className={`z-10 min-h-[30px] cursor-pointer select-none  appearance-none truncate rounded-[6px] py-[4px] pl-[8px] pr-[24px] text-[13px]`}
                value={currentLevel !== "member" ? `fiscal_year` : settingPeriodTypeForMemberLevel}
                onChange={(e) => {
                  setSettingPeriodTypeForMemberLevel(e.target.value);
                }}
              >
                {currentLevel !== "member" && <option value={`fiscal_year`}>年度・半期</option>}
                {currentLevel === "member" && (
                  <>
                    <option value={`first_half_details`}>上期詳細</option>
                    <option value={`second_half_details`}>下期詳細</option>
                  </>
                )}
              </select>
              <div className={`${styles.select_arrow}`}>
                <IoChevronDownOutline className={`text-[12px]`} />
              </div>
            </div> */}
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
              // 上位エンティティグループごとの各エンティティの目標設定完了状況を取得
              const parentId = entityGroupObj.parent_entity_id;
              const settingStatusObj =
                completeSettingMapInGroup && parentId && (completeSettingMapInGroup.get(parentId) ?? null);
              const isCompleteAllEntitiesInGroup = settingStatusObj ? settingStatusObj.isCompleteAllEntities : false;
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
                        {/* <span className="max-w-[270px] truncate">マイクロスコープ事業部</span> */}
                        <span
                          className="max-w-[270px] truncate"
                          data-text={`${entityGroupObj.parent_entity_name}`}
                          onMouseEnter={(e) => {
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth) handleOpenTooltip({ e, display: "top", marginTop: 9 });
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
                        {/* <BsCheck2 className="pointer-events-none min-h-[20px] min-w-[20px] stroke-1 text-[20px] text-[#00d436]" /> */}
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
                              (levelObj.is_confirmed_annual_half || isCompleteAllEntitiesInGroup))) && {
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
                              }内で売上目標に関わる${mappingEntityName[currentLevel][language]}リストを編集する`;
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
                                  entityGroupObj.parent_entity_name ? `${entityGroupObj.parent_entity_name}の` : ``
                                }データが見つかりませんでした。`
                              );
                            // levelObj;
                            // entityGroupObj;
                            // 現在のレベルの親レベルを特定して引数に渡す

                            // リスト編集モーダルを開く前に、メンバー所属ありエンティティidSetオブジェクトをZustandに格納する
                            if (addedEntityMemberCountSetObj !== null) {
                              setEntityIdsWithMembersSetObj(addedEntityMemberCountSetObj);
                            }
                            // リスト編集モーダルを開く
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
                              // 上位エンティティ内の全てのエンティティ配列をグローバルstateに追加する
                              const newParentEntityGroup = {
                                fiscalYear: upsertSettingEntitiesObj.fiscalYear,
                                periodType: selectedPeriodTypeForMemberLevel, // "first_half_details" | "second_half_details"のどちらか
                                parentEntityLevelId: levelObj.id,
                                parentEntityLevel: parentEntityLevel,
                                parentEntityId: entityGroupObj.parent_entity_id,
                                parentEntityName: entityGroupObj.parent_entity_name,
                                entityLevel: currentLevel,
                                entities: entityGroupObj.entities,
                              } as UpsertSettingEntitiesObj;

                              setUpsertSettingEntitiesObj(newParentEntityGroup);
                              setIsSettingTargetMode(true);

                              // setSelectedMemberAndPeriodType({
                              //   memberGroupObjByParent: entityGroupObj,
                              //   periodType: "first_half_details", // 上期~月度
                              //   isConfirmFirstHalf: isConfirmFirstHalf,
                              //   isConfirmSecondHalf: isConfirmSecondHalf,
                              // });

                              // const sectionWidth = 330;
                              // handleOpenSectionMenu({
                              //   e,
                              //   title: "selectTargetPeriodTypeForMember",
                              //   displayX: "bottom_left",
                              //   fadeType: "fade_down",
                              //   maxWidth: sectionWidth,
                              //   minWidth: sectionWidth,
                              // });
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
                        {/* {step === 2 && <CgArrowsExchange className={`mr-[3px] text-[18px] text-[#fff]`} />} */}
                        {step === 2 && `リスト編集`}
                        {step === 3 && <FiPlus className={`mr-[3px] stroke-[3] text-[12px] text-[#fff]`} />}
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
                                {/* マイクロスコープ事業部 */}
                                {entityObj.entity_name}
                              </div>
                            </div>
                            <div className={`flex min-h-[30px] items-center`}>
                              {isNoMember && (
                                <>
                                  <span className="text-[13px] text-[var(--main-color-tk)]">メンバー所属なし</span>
                                </>
                              )}
                              {!isNoMember && (
                                <>
                                  {settingState === "notSet" && (
                                    <span className="text-[13px] text-[var(--color-text-sub)]">未設定</span>
                                  )}
                                  {settingState !== "notSet" && (
                                    <div className={`flex items-center space-x-[6px]`}>
                                      {settingState === "setAll" && (
                                        <>
                                          <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                                          {/* <IoTriangleOutline className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" /> */}
                                        </>
                                      )}
                                      {settingState !== "setAll" && (
                                        <>
                                          <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                                          {/* <IoTriangleOutline className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" /> */}
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
      </div>
    </>
  );
};
