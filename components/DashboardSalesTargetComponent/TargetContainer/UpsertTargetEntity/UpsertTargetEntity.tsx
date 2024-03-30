import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { memo, useMemo, useState } from "react";
import styles from "../../DashboardSalesTargetComponent.module.css";
import { MdOutlineDataSaverOff, MdSaveAlt } from "react-icons/md";
import useDashboardStore from "@/store/useDashboardStore";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";
import useStore from "@/store";
import { addTaskIllustration, dataIllustration } from "@/components/assets";
import { BsCheck2 } from "react-icons/bs";
import NextImage from "next/image";
import { useQueryEntityLevels } from "@/hooks/useQueryEntityLevels";
import { useQueryEntities } from "@/hooks/useQueryEntities";
import { Department, Office, Section, Unit } from "@/types";
import { useQueryClient } from "@tanstack/react-query";

const UpsertTargetEntityMemo = () => {
  const queryClient = useQueryClient();
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  const setUpsertTargetObj = useDashboardStore((state) => state.setUpsertTargetObj);
  const setUpsertTargetMode = useDashboardStore((state) => state.setUpsertTargetMode);

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  // sticky
  const [isStickySidebar, setIsStickySidebar] = useState(false);
  const [isStickyHeader, setIsStickyHeader] = useState(false);

  if (!userProfileState) return null;
  if (!userProfileState.company_id) return null;
  if (!upsertTargetObj) return null;
  if (!upsertTargetObj.fiscalYear) return null;

  // // 選択中の会計年度ローカルstate
  // const [selectedFiscalYearLocal, setSelectedFiscalYearLocal] = useState(upsertTargetObj.fiscalYear);
  // // 年度オプション選択肢
  // const optionsFiscalYear = useDashboardStore((state) => state.optionsFiscalYear);
  // const setOptionsFiscalYear = useDashboardStore((state) => state.setOptionsFiscalYear);

  // ===================== 🌠エンティティレベルuseQuery🌠 =====================
  const {
    data: entityLevelsQueryData,
    isLoading: isLoadingQueryLevel,
    isError: isErrorQueryLevel,
  } = useQueryEntityLevels(userProfileState.company_id, upsertTargetObj.fiscalYear, "sales_target", true);
  // ===================== 🌠エンティティレベルuseQuery🌠 =====================

  // ===================== 🌠エンティティuseQuery🌠 =====================
  // エンティティレベルのidのみで配列を作成(エンティティuseQuery用)
  const entityLevelIds = useMemo(() => {
    if (!entityLevelsQueryData) return [];
    return entityLevelsQueryData.map((obj) => obj.id);
  }, [entityLevelsQueryData]);

  const {
    data: entitiesQueryData,
    isLoading: isLoadingQueryEntities,
    isError: isErrorQueryEntities,
  } = useQueryEntities(userProfileState.company_id, upsertTargetObj.fiscalYear, "sales_target", entityLevelIds, true);
  // ===================== 🌠エンティティuseQuery🌠 =====================

  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================

  // エンティティレベルMap key: レベル名, value: オブジェクトのMapオブジェクトを生成
  const entityLevelsMap = useMemo(() => {
    if (!entityLevelsQueryData || entityLevelsQueryData?.length === 0) return null;
    return new Map(entityLevelsQueryData.map((obj) => [obj.entity_level, obj]));
  }, [entityLevelsQueryData]);

  // ===================== 🌟ユーザーが作成したエンティティのみのセクションリストを再生成🌟 =====================
  const entityLevelList: {
    title: string;
    name: {
      [key: string]: string;
    };
  }[] = useMemo(() => {
    let newEntityList = [{ title: "company", name: { ja: "全社", en: "Company" } }];
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

    // まだ一つもレベルが追加されていない場合は全てのレベルの選択肢を返す
    if (!entityLevelsMap || entityLevelsMap.size === 0) return newEntityList;

    // 既に指定年度の売上目標を構成するレベルが追加されている場合、追加済みの末端レベルの下位レベルに当たるレベル以降を選択肢としてフィルターして返す
    if (entityLevelsMap.has("member")) return [];
    if (entityLevelsMap.has("unit")) return [{ title: "member", name: { ja: "メンバー", en: "Member" } }];
    if (entityLevelsMap.has("section")) {
      return newEntityList.filter((obj) => ["unit", "member"].includes(obj.title));
    }
    if (entityLevelsMap.has("department")) {
      return newEntityList.filter((obj) => ["section", "unit", "member"].includes(obj.title));
    }
    if (entityLevelsMap.has("company")) {
      return newEntityList.filter((obj) => ["department", "section", "unit", "member"].includes(obj.title));
    }
    return [];
  }, [departmentDataArray, sectionDataArray, unitDataArray, officeDataArray]);
  // ===================== 🌟ユーザーが作成したエンティティのみのセクションリストを再生成🌟 =====================

  // =====================初回のエンティティレベルの選択肢=====================
  const [selectedEntityLevel, setSelectedEntityLevel] = useState(() => {
    // 既に追加済みのレベルの下位レベルを選択済みにする
    if (!entityLevelsMap || entityLevelsMap.size === 0) return "company";
    if (entityLevelsMap.has("member")) return "";
    if (entityLevelsMap.has("unit")) return "member";
    if (entityLevelsMap.has("section")) return entityLevelsMap.has("unit") ? "unit" : "member";
    if (entityLevelsMap.has("department")) {
      if (entityLevelsMap.has("section")) entityLevelsMap.has("unit") ? "unit" : "member";
      return "member";
    }
    return "company";
  });

  // ===================== 関数 =====================
  // 🌟目標設定モードを終了
  const handleCancelUpsert = () => {
    // setUpsertTargetMode(false);
    setUpsertTargetMode(null);
    setUpsertTargetObj(null);
  };
  // ===================== 関数 =====================

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

  // インラインスタイル
  const getActiveSteps = (num: number) =>
    step === num
      ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
      : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-sub)]`;
  const getActiveStep = (num: number) =>
    step === num
      ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
      : `border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-disabled)]`;
  const getActiveDesc = (num: number) =>
    step === num ? `text-[var(--color-text-title)]` : `text-[var(--color-text-disabled)]`;

  console.log(
    "UpsertTargetEntityコンポーネントレンダリング",
    "upsertTargetObj",
    upsertTargetObj,
    "entityLevelsQueryData",
    entityLevelsQueryData,
    "entityLevelIds",
    entityLevelIds,
    "entitiesQueryData",
    entitiesQueryData
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
      {/* ===================== スクロールコンテナ ここから ===================== */}
      <div className={`${styles.main_container_entity} fade08_forward`}>
        <div className={`${styles.title_area}`}>
          <h1 className={`${styles.title} ${styles.upsert} space-x-[24px]`}>
            <span className="min-w-max">{upsertTargetObj.fiscalYear}年度 目標設定</span>
            {/* ----プログレスエリア---- */}
            <div className="relative flex h-[25px] w-full items-center">
              {/* プログレスライン */}
              <div className="absolute left-0 top-[50%] z-[0] h-[1px] w-[145px] bg-[var(--color-progress-bg)]"></div>
              {/* ○ */}
              <div
                className={`flex-center z-[1] mr-[15px] h-[25px] w-[25px] cursor-pointer rounded-full border border-solid ${getActiveSteps(
                  1
                )}`}
                onClick={() => setStep(1)}
              >
                <span className={`text-[12px] font-bold`}>1</span>
              </div>
              {/* ○ */}
              <div
                className={`flex-center  z-[1] mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid ${getActiveSteps(
                  2
                )}`}
                onClick={() => setStep(2)}
              >
                <span className={`text-[12px] font-bold`}>2</span>
              </div>
              {/* ○ */}
              <div
                className={`flex-center  z-[1] mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid ${getActiveSteps(
                  3
                )}`}
                onClick={() => setStep(3)}
              >
                <span className={`text-[12px] font-bold`}>3</span>
              </div>
              {/* ○ */}
              <div
                className={`flex-center  z-[1] mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid ${getActiveSteps(
                  4
                )}`}
                onClick={() => setStep(4)}
              >
                <span className={`text-[12px] font-bold`}>4</span>
              </div>
            </div>
            {/* ----プログレスエリア ここまで---- */}
          </h1>
          <div className={`${styles.btn_area} flex items-start space-x-[12px]`}>
            <div className={`${styles.btn} ${styles.basic}`} onClick={handleCancelUpsert}>
              <span>戻る</span>
            </div>
            <div
              className={`${styles.btn} ${styles.brand} space-x-[3px]`}
              onClick={(e) => {
                console.log("クリック");
              }}
            >
              {/* <RiSave3Fill className={`stroke-[3] text-[12px] text-[#fff]`} /> */}
              <MdSaveAlt className={`text-[14px] text-[#fff]`} />
              <span>保存</span>
            </div>
          </div>
        </div>
        <div className={`${styles.contents_area_entity}`}>
          <div className={`${styles.left_container} bg-[red]/[0] ${isStickySidebar ? `${styles.sticky_side}` : ``}`}>
            <div className={`${styles.step_container} space-y-[12px]`}>
              <div className={`flex w-full justify-between`}>
                <h4 className={`w-full text-[18px] font-bold`}>
                  <span>手順</span>
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
                  <span>各レイヤー内で部門・人を追加</span>
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
                  <p>{`2で追加した「全社〜係」までは「年度・半期」の売上目標を設定し、\n各メンバーは一つ上のレイヤーで決めた売上目標と半期の売上目標シェアを割り振り、現在の保有している案件と来期の売上見込みを基に「半期〜月次」の売上目標を設定してください。`}</p>
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
                  <span>全レイヤーの年度〜月次の売上目標を完成させる</span>
                </div>
                <div className={`${styles.description} w-full text-[12px] ${step === 4 ? `${styles.open}` : ``}`}>
                  <p>{`全てのメンバーの四半期、月次目標の設定が完了したら、全メンバーの売上目標を集約して全てのレイヤーの四半期・月次売上目標を完成させる`}</p>
                </div>
              </li>
              {/* ------------- */}
            </div>
          </div>
          <div className={`${styles.right_container} bg-[green]/[0]`}>
            <div className={`${styles.step_header_wrapper} flex w-full ${isStickyHeader ? `sticky top-[8px]` : ``}`}>
              <div
                className={`${styles.step_header} ${
                  isStickyHeader ? (isStickySidebar ? `${styles.sticky_with_side}` : `${styles.sticky_header}`) : ``
                }`}
              >
                <div className={`flex w-full justify-between`}>
                  <div className={`${styles.left_wrapper} flex w-4/6 flex-col`}>
                    <div className={`flex flex-col`}>
                      <h4 className={`min-h-[30px] font-bold`}>
                        <span>組織を構成するレイヤーを追加</span>
                      </h4>
                      <div className={`mt-[6px] text-[12px]`}>
                        <p className={`whitespace-pre-wrap`}>
                          {`売上目標に関わる組織レイヤーをお客様が作成された「全社、事業部、課、係、メンバー」から追加してください。\n始めに全社レイヤーを追加し、最後はメンバーレイヤーを追加してください。`}
                          {/* 2で追加した「全社〜係」までは「年度・半期」の売上目標を設定し、
                          各メンバーは一つ上のレイヤーで決めた売上目標と半期の売上目標シェアを割り振り、現在の保有している案件と来期の売上見込みを基に「半期〜月次」の売上目標を設定してください。 */}
                        </p>
                      </div>
                      <div className={`mt-[20px] flex items-center`}>
                        {selectedEntityLevel !== "" && (
                          <select
                            className={`${styles.select_box} ${styles.both} mr-[20px] truncate`}
                            style={{ maxWidth: `150px` }}
                            value={selectedEntityLevel}
                            onChange={(e) => {
                              setSelectedEntityLevel(e.target.value);
                              // if (openPopupMenu) handleClosePopupMenu();
                            }}
                          >
                            {entityLevelList.map((obj) => (
                              <option key={obj.title} value={obj.title}>
                                {obj.name[language]}
                              </option>
                            ))}
                          </select>
                        )}
                        <button
                          className={`transition-bg01 flex-center max-w-max cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[13px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-hover)]`}
                          // onClick={() => setIsOpenSettingInvitationModal(true)}
                        >
                          <span>レイヤーを追加</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className={`${styles.right_wrapper} relative flex w-2/6 flex-col`}>
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
                      <div className="mr-[84px] mt-[-20px]">{dataIllustration}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={`${styles.contents_container_rb} flex h-full w-full`}>
              {/* <div className={`${styles.col}`}>
                <div className={`flex w-full justify-between`}>
                  <h4 className={`text-[19px] font-bold`}>会社</h4>
                </div>
                <ul className={`w-full`}>
                  <li
                    className={`flex w-full items-center justify-between border-b border-solid border-[var(--color-border-light)] pb-[10px] pt-[16px]`}
                  >
                    <div className={`flex max-w-[270px] items-center`}>
                      <div className={`max-w-[270px] truncate text-[14px] font-bold`}>株式会社TRUSTiFY</div>
                    </div>
                    <div className={`flex min-h-[30px] items-center`}>
                      <span className="text-[14px] text-[var(--color-text-brand-f)]">未設定</span>
                    </div>
                  </li>
                </ul>
              </div> */}
              {!entityLevelsQueryData?.length && (
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
              {!!entityLevelsQueryData?.length &&
                entityLevelsQueryData.map((obj) => {
                  return (
                    <div key={`column_${obj.id}`} className={`${styles.col}`}>
                      <div className={`flex w-full justify-between`}>
                        <h4 className={`text-[19px] font-bold`}>課・セクション</h4>
                      </div>
                      <ul className={`flex w-full flex-col`}>
                        {Array(2)
                          .fill(null)
                          .map((_, index) => (
                            <li key={`section_${index}`} className="mb-[6px] mt-[16px] flex w-full flex-col">
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
                                    <span className="max-w-[270px] truncate">マイクロスコープ事業部</span>
                                    {/* <BsCheck2 className="pointer-events-none min-h-[20px] min-w-[20px] stroke-1 text-[20px] text-[#00d436]" /> */}
                                  </div>
                                  <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />
                                </div>
                                <div
                                  className={`${styles.btn} ${styles.brand} truncate font-normal`}
                                  onClick={() => {
                                    console.log("item.unit_price");
                                  }}
                                >
                                  {/* 編集 */}
                                  設定
                                </div>
                              </h3>
                              <ul className={`w-full`}>
                                {Array(3)
                                  .fill(null)
                                  .map((_, index) => (
                                    <li
                                      key={`list_${index}`}
                                      className={`flex w-full items-center justify-between border-b border-solid border-[var(--color-border-light)] pb-[10px] pt-[16px]`}
                                    >
                                      <div className={`flex max-w-[290px] items-center`}>
                                        {/* <div className={`mr-[6px] min-w-max`}>
                                    <MdOutlineDataSaverOff
                                      className={`${styles.list_icon} min-h-[18px] min-w-[18px] text-[18px]`}
                                    />
                                  </div> */}
                                        <div className={`max-w-[290px] truncate text-[14px] font-bold`}>
                                          マイクロスコープ事業部
                                        </div>
                                      </div>
                                      <div className={`flex min-h-[30px] items-center`}>
                                        <span className="text-[14px] text-[var(--color-text-sub)]">未設定</span>
                                        {/* <div className={`flex items-center space-x-[6px]`}>
                                    <BsCheck2 className="pointer-events-none min-h-[22px] min-w-[22px] stroke-1 text-[22px] text-[#00d436]" />
                                    <span className="text-[14px] text-[var(--color-text-brand-f)]">設定済み</span>
                                  </div> */}
                                      </div>
                                    </li>
                                  ))}
                              </ul>
                            </li>
                          ))}
                      </ul>
                    </div>
                  );
                })}
              {/* <div className={`${styles.col}`}></div>
              <div className={`${styles.col}`}></div>
              <div className={`${styles.col}`}></div>
              <div className={`${styles.col}`}></div> */}
            </div>
          </div>
        </div>
      </div>
      {/* ===================== スクロールコンテナ ここまで ===================== */}
    </>
  );
};

export const UpsertTargetEntity = memo(UpsertTargetEntityMemo);
