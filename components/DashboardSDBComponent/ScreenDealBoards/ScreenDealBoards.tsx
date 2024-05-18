import {
  Dispatch,
  DragEvent,
  FormEvent,
  Fragment,
  MouseEvent,
  SetStateAction,
  Suspense,
  memo,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./ScreenDealBoards.module.css";
import { DealBoard } from "./DealBoard/DealBoard";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";
import { EntityGroupByParent, FiscalYears, MemberAccounts } from "@/types";
import useDashboardStore from "@/store/useDashboardStore";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { GradientModal } from "@/components/Parts/GradientModal/GradientModal";
import { EditModalDealCard } from "./EditModalDealCard/EditModalDealCard";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import { SpinnerX } from "@/components/Parts/SpinnerX/SpinnerX";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";
import useStore from "@/store";
import { useQueryMemberListByParentEntity } from "@/hooks/useQueryMemberListByParentEntity";
import { useQueryClient } from "@tanstack/react-query";

type Props = {
  // memberList: Entity[];
  displayEntityGroup: (EntityGroupByParent & { parent_entity_level: string; parent_entity_level_id: string }) | null;
  // periodType: string;
  // period: number;
};

// 🌠各メンバーのネタ表を一覧で表示するコンポーネント
const ScreenDealBoardsMemo = ({ displayEntityGroup }: Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const isOpenCongratulationsModal = useDashboardStore((state) => state.isOpenCongratulationsModal);
  const setIsOpenCongratulationsModal = useDashboardStore((state) => state.setIsOpenCongratulationsModal);
  const setIsRequiredInputSoldProduct = useDashboardStore((state) => state.setIsRequiredInputSoldProduct);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);
  // 期間
  const activePeriodSDB = useDashboardStore((state) => state.activePeriodSDB);
  // 選択中のネタカード
  const selectedDealCard = useDashboardStore((state) => state.selectedDealCard);
  // ネタカードクリック時に表示する概要モーダル
  const isOpenDealCardModal = useDashboardStore((state) => state.isOpenDealCardModal);
  // 選択されたメンバーのidをDealBoardにpropsで渡す
  const activeThemeColor = useDashboardStore((state) => state.activeThemeColor);

  // stickyを付与するrow
  const [stickyRow, setStickyRow] = useState<string | null>(null);

  if (!userProfileState || !userProfileState?.company_id) return null;

  // if (!periodType || !period) {
  if (!activePeriodSDB) {
    return (
      <div className="flex-center h-[80dvh] w-[100vw]">
        {/* <SpinnerBrand bgColor="var(--color-sdb-bg)" /> */}
        <span></span>
      </div>
    );
  }

  const queryClient = useQueryClient();
  // 🔹表示中の会計年度(グローバル)
  const selectedFiscalYearTarget = useDashboardStore((state) => state.selectedFiscalYearTarget);

  if (selectedFiscalYearTarget === null) return null;

  const fiscalYearQueryData: FiscalYears | undefined = queryClient.getQueryData([
    "fiscal_year",
    "sales_target",
    selectedFiscalYearTarget,
  ]);

  const entityIds = useMemo(() => {
    if (!displayEntityGroup) return null;
    return displayEntityGroup.entities.map((entity) => entity.entity_id);
  }, []);

  // 🔹売上目標が設定されている場合にはエンティティグループ内の各エンティティのメンバーアカウントデータを取得
  const {
    data: queryDataMemberGroupByParentEntity,
    error: isErrorQueryMemberList,
    isLoading: IsLoadingQueryMemberList,
  } = useQueryMemberListByParentEntity({
    entityIds: entityIds,
    parentEntityLevel: displayEntityGroup?.parent_entity_level ?? null,
    parentEntityId: displayEntityGroup?.parent_entity_id ?? null,
    isReady: !!entityIds?.length,
  });

  // // メンバーエンティティ
  // const selectedObjSectionSDBMember = useDashboardStore((state) => state.selectedObjSectionSDBMember);
  // const setSelectedObjSectionSDBMember = useDashboardStore((state) => state.setSelectedObjSectionSDBMember);

  const [memberList, setMemberList] = useState<
    | (MemberAccounts & {
        company_id: string;
        company_name: string;
      })[]
    | null
  >(null);

  const displayMemberList = useMemo(() => {
    return queryDataMemberGroupByParentEntity ? queryDataMemberGroupByParentEntity : memberList ?? null;
  }, [queryDataMemberGroupByParentEntity, memberList]);

  // ネタ表ボードに渡すid配列に変換
  // const memberListSectionMember: MemberAccounts[] = useMemo(() => {
  //   if (!selectedObjSectionSDBMember) return [];
  //   const newIdList = [selectedObjSectionSDBMember];
  //   return newIdList;
  // }, [selectedObjSectionSDBMember]);

  // ------------------------- ✅初回マウント時✅ -------------------------
  // 売上目標と組織構成が未設定の場合には、自身のデータのみ表示する
  useEffect(() => {
    if (!userProfileState) return;
    // メンバーデータを取得できている場合はmemberListにセット
    if (queryDataMemberGroupByParentEntity) return;

    if (displayEntityGroup === null) {
      // 売上目標と組織構成が未設定の場合には、自身のデータのみ表示する
      // ユーザー自身を初期値にセット
      const u = userProfileState;
      const initialMemberObj = {
        id: u.id,
        created_at: u.created_at,
        updated_at: u.updated_at,
        avatar_url: u.avatar_url,
        is_subscriber: u.is_subscriber,
        company_role: u.company_role,
        role: u.role,
        stripe_customer_id: u.stripe_customer_id,
        last_name: u.last_name,
        first_name: u.first_name,
        email: u.email,
        department: u.department,
        position_name: u.position_name,
        position_class: u.position_class,
        direct_line: u.direct_line,
        company_cell_phone: u.company_cell_phone,
        personal_cell_phone: u.personal_cell_phone,
        occupation: u.occupation,
        direct_fax: u.direct_fax,
        signature_stamp_id: u.signature_stamp_id,
        employee_id: u.employee_id,
        is_active: u.is_active,
        profile_name: u.profile_name,
        accept_notification: u.accept_notification,
        first_time_login: u.first_time_login,
        office: u.office,
        section: u.section,
        unit: u.unit,
        usage: u.usage,
        purpose_of_use: u.purpose_of_use,
        subscribed_account_id: u.subscribed_account_id,
        account_created_at: u.account_created_at,
        account_company_role: u.account_company_role,
        account_state: u.account_state,
        account_invited_email: null,
        assigned_department_id: u.assigned_department_id,
        assigned_department_name: u.assigned_department_name,
        assigned_section_id: u.assigned_section_id,
        assigned_section_name: u.assigned_section_name,
        assigned_unit_id: u.assigned_unit_id,
        assigned_unit_name: u.assigned_unit_name,
        assigned_office_id: u.assigned_office_id,
        assigned_office_name: u.assigned_office_name,
        assigned_employee_id: u.assigned_employee_id,
        assigned_employee_id_name: u.assigned_employee_id_name,
        assigned_signature_stamp_id: u.assigned_signature_stamp_id,
        assigned_signature_stamp_url: u.assigned_signature_stamp_url,
        company_id: u.company_id,
        company_name: u.customer_name,
      } as MemberAccounts & {
        company_id: string;
        company_name: string;
      };
      setMemberList([initialMemberObj]);
    }
  }, [displayEntityGroup]);
  // ------------------------- ✅初回マウント時✅ -------------------------

  // useEffectでメンバーリストが取得できた状態でJSXをレンダリングする
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (isMounted) return;

    setIsMounted(true);
  }, []);

  // 全てのボードがマウントした後にProgressCircleをマウントさせる
  const [isRenderProgress, setIsRenderProgress] = useState(false);

  useEffect(() => {
    if (activePeriodSDB.periodType && activePeriodSDB.period) {
      setTimeout(() => {
        setIsRenderProgress(true);
        console.log("ProgressCircleレンダリング");
      }, 1500);
    }
  }, []);

  const FallbackDealBoard = () => {
    return (
      <div className={`flex-center h-[288px] w-[100vw] px-[24px] py-[12px]`}>
        {/* <SpinnerBrand
          // bgColor="var(--color-sdb-bg)"
          bgColor="#121212"
          withBorder
          withShadow
          bgTransition={`${activeThemeColor !== "theme-black-gradient" ? `transition-bg05` : ``}`}
        /> */}
        <SpinnerX />
      </div>
    );
  };

  // 受注済みに変更後に表示するモーダルの「反映する」ボタンクリック時に実行される関数
  const handleClickActiveSoldModal = () => {
    setIsOpenUpdatePropertyModal(true); // 案件編集モーダルを開く
    setIsRequiredInputSoldProduct(true); // 案件編集モーダルに受注後売上入力ステータスを渡す
    setIsOpenCongratulationsModal(false); // お祝いモーダルを閉じる
  };
  // 受注済みに変更後に表示するモーダルの「反映する」ボタンクリック時に実行される関数
  const handleClickCancelSoldModal = () => {
    setSelectedRowDataProperty(null); // 選択中のRowDataをリセット
    setIsOpenCongratulationsModal(false); // お祝いモーダルを閉じる
  };

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    // e: MouseEvent<HTMLDivElement, MouseEvent>;
    e: MouseEvent<HTMLDivElement | HTMLSpanElement, globalThis.MouseEvent>;
    // e: MouseEvent<HTMLElement, MouseEvent<Element, globalThis.MouseEvent>> | MouseEvent<HTMLDivElement, MouseEvent>;
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

  // --------------------------- 🌠子コンポーネントを順番にフェッチさせる🌠 ---------------------------
  const [currentActiveIndex, setCurrentActiveIndex] = useState(0); // 順番にフェッチを許可
  const [allFetched, setAllFetched] = useState(false); // サブ目標コンポーネントのフェッチが全て完了したらtrueに変更

  // 全子コンポーネントがフェッチ完了したかを監視
  useEffect(() => {
    if (!displayMemberList) return;
    // メンバーリストよりactiveIndexが大きくなった場合、全てフェッチが完了
    if (currentActiveIndex >= displayMemberList.length) {
      setAllFetched(true);
    }
  }, [currentActiveIndex]);

  // ネタ表を順番にフェッチ許可する
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

  if (!isMounted)
    return (
      <div className={`flex-center w-full`} style={{ minHeight: `calc(732px - 87px)`, paddingBottom: `87px` }}>
        <SpinnerBrand withBorder withShadow />
      </div>
    );

  return (
    <>
      {/* <section className={`${styles.company_table_screen} h-screen w-full bg-neutral-900 text-neutral-50`}> */}
      <section
        className={`${styles.screen_deal_boards} transition-bg05 w-full ${
          activeThemeColor === "theme-brand-f" ? `` : ``
        } ${activeThemeColor === "theme-brand-f-gradient" ? `${styles.theme_f_gradient}` : ``} 
                 ${activeThemeColor === "theme-black-gradient" ? `${styles.theme_black}` : ``} 
                ${activeThemeColor === "theme-simple17" ? `${styles.theme_simple17}` : ``} ${
          activeThemeColor === "theme-simple12" ? `${styles.theme_simple12}` : ``
        } ${stickyRow !== null ? `${styles.is_sticky}` : ``}`}
      >
        {/* ------------------- Row チャートエリア ------------------- */}
        {!allFetched && (
          <div className={`flex-center fade08_forward mb-[20px] max-h-[369px] min-h-[369px] w-full`}>
            <SpinnerX />
          </div>
        )}
        {allFetched && (
          <div
            className={`${styles.grid_row} ${styles.col2} fade15_forward mb-[20px] min-h-[369px] w-full ${
              stickyRow === "row_trend" ? `${styles.sticky_row}` : ``
            }`}
          >
            <div className={`${styles.grid_content_card}`}>
              <div className={`${styles.card_wrapper} fade08_forward`}>
                <div className={`${styles.card_title_area}`}>
                  <div className={`${styles.card_title}`}>
                    <span>売上推移</span>
                  </div>
                </div>
                <div className={`${styles.main_container} flex-center`}>
                  <div
                    className={`flex h-full w-full items-center justify-center text-[13px] text-[var(--color-text-sub)]`}
                  >
                    <span>売上目標が設定されていません。</span>
                  </div>
                </div>
              </div>
            </div>

            {displayEntityGroup !== null && !!queryDataMemberGroupByParentEntity?.length && (
              <div className={`${styles.grid_content_card}`}>
                <div className={`${styles.card_wrapper} fade08_forward`}>
                  <div className={`${styles.card_title_area}`}>
                    <div className={`${styles.card_title}`}>
                      <span>売上目標シェア</span>
                    </div>

                    <div
                      className={`${styles.btn} ${styles.basic} space-x-[4px]`}
                      onMouseEnter={(e) => {
                        // 売上目標が設定されていない状態ではエンティティidが存在せず、stickyが機能しなくなるので、main_entity_targetの文字列をセット
                        const entityId = "main_entity_target";
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: stickyRow === entityId ? `固定を解除` : `画面内に固定`,
                          marginTop: 9,
                        });
                      }}
                      onMouseLeave={handleCloseTooltip}
                      onClick={() => {
                        const entityId = "row_trend";
                        if (!entityId) return;
                        if (entityId === stickyRow) {
                          setStickyRow(null);
                        } else {
                          setStickyRow(entityId);
                        }
                        handleCloseTooltip();
                      }}
                    >
                      {stickyRow === "row_trend" && <TbSnowflakeOff />}
                      {stickyRow !== "row_trend" && <TbSnowflake />}
                      {stickyRow === "row_trend" && <span>解除</span>}
                      {stickyRow !== "row_trend" && <span>固定</span>}
                    </div>
                  </div>
                  <div className={`${styles.main_container} flex-center`}>
                    <div
                      className={`flex h-full w-full items-center justify-center text-[13px] text-[var(--color-text-sub)]`}
                    >
                      <span>売上目標が設定されていません。</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {displayEntityGroup === null && (
              <div className={`${styles.grid_content_card}`}>
                <div className={`${styles.card_wrapper} fade08_forward`}>
                  <div className={`${styles.card_title_area}`}>
                    <div className={`${styles.card_title}`}>
                      <span>売上目標シェア</span>
                    </div>

                    <div className={`${styles.btn} ${styles.basic} space-x-[4px]`}>
                      <span>固定</span>
                    </div>
                  </div>
                  <div className={`${styles.main_container} flex-center`}>
                    <div
                      className={`flex h-full w-full items-center justify-center text-[13px] text-[var(--color-text-sub)]`}
                    >
                      <span>売上目標が設定されていません。</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {/* ------------------- Row チャートエリア ------------------- */}

        {/* ------------------- ネタ表ボード ------------------- */}
        {displayMemberList &&
          displayMemberList.map((memberObj, tableIndex) => {
            return (
              <Fragment key={`${memberObj.id}_${tableIndex}_board`}>
                <div
                  // className={`${styles.entity_board_container} bg-[red]/[0]`}
                  className={`${styles.entity_board_container} fade15_forward bg-[red]/[0] ${
                    stickyRow === `deal_board_${memberObj.id}` ? `${styles.sticky_row}` : ``
                  }`}
                  // className={`${styles.entity_board_container} bg-[red]/[0] ${isRenderProgress ? `${styles.fade_bg}` : ``}
                  //  ${activeThemeColor === "theme-brand-f" ? `` : ``}
                  //  ${activeThemeColor === "theme-brand-f-gradient" ? `${styles.theme_f_gradient}` : ``}
                  //  ${activeThemeColor === "theme-black-gradient" ? `${styles.theme_black}` : ``}
                  // ${activeThemeColor === "theme-simple17" ? `${styles.theme_simple17}` : ``} ${
                  //   activeThemeColor === "theme-simple12" ? `${styles.theme_simple12}` : ``
                  // } ${stickyRow === `deal_board_${index}` ? `${styles.sticky_row}` : ``}`}
                >
                  {activeThemeColor === "theme-black-gradient" && <div className={`${styles.bg_black}`}></div>}
                  <div className={`${styles.entity_detail_container} fade08_forward bg-[green]/[0]`}>
                    <div className={`${styles.entity_detail_wrapper}`}>
                      <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
                        <AvatarIcon
                          // size={33}
                          size={36}
                          name={memberObj.profile_name ?? "未設定"}
                          withCircle={false}
                          hoverEffect={false}
                          textSize={16}
                          // imgUrl={memberObj.avatar_url ?? null}
                        />
                        <div className={`${styles.entity_name} text-[19px] font-bold`}>
                          <span>{memberObj.profile_name}</span>
                        </div>
                        <div className={`${styles.sub_info} pt-[6px]`}>{memberObj.position_name ?? "役職未設定"}</div>
                        <div className={`${styles.sub_info} pt-[6px]`}>{memberObj.assigned_employee_id_name ?? ""}</div>
                        <div
                          className={`relative !ml-[24px] !mr-[12px] flex h-full min-h-[56px] w-auto items-end bg-[red]/[0]`}
                        >
                          <div className="flex h-full min-w-[150px] items-end justify-end">
                            {/* <span className="mb-[-3px] text-[27px]">12,000,000,000</span> */}
                            <ProgressNumber
                              targetNumber={6200000}
                              // targetNumber={0}
                              // startNumber={Math.round(68000 / 2)}
                              // startNumber={Number((68000 * 0.1).toFixed(0))}
                              startNumber={0}
                              duration={3000}
                              easeFn="Quintic"
                              fontSize={27}
                              fontWeight={500}
                              margin="0 0 -3px 0"
                              isReady={isRenderProgress}
                              fade={`fade08_forward`}
                            />
                          </div>
                          <div className="relative h-full min-w-[33px]">
                            <div className="absolute left-[66%] top-[68%] min-h-[2px] w-[30px] translate-x-[-50%] translate-y-[-50%] rotate-[120deg] bg-[var(--color-text-title)]"></div>
                          </div>
                          <div className="mr-[12px] flex h-full min-w-max items-end justify-start">
                            <span className="text-[16px]">9,000,000</span>
                            {/* <span className="text-[16px]">12,000,000,000</span> */}
                          </div>
                        </div>
                        {/* <div className={`relative h-[56px] w-[66px]`} style={{ margin: `0` }}> */}
                        <div className={`relative h-[56px] w-[56px]`} style={{ margin: `0` }}>
                          <div className="absolute bottom-[-6px] right-0">
                            <ProgressCircle
                              circleId={`${memberObj.id}_${tableIndex}_board`}
                              textId={`${memberObj.id}_${tableIndex}_board`}
                              progress={78}
                              // progress={100}
                              // progress={0}
                              duration={5000}
                              easeFn="Quartic"
                              size={56}
                              strokeWidth={6}
                              fontSize={11}
                              textColor="var(--color-text-title)"
                              isReady={isRenderProgress}
                              fade={`fade08_forward`}
                              // fade={`fade10_forward`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`${styles.status_col_wrapper}`}>
                      <div className={`flex h-full items-start pt-[10px]`}>
                        <div
                          className={`${styles.btn} ${styles.basic} space-x-[4px]`}
                          onMouseEnter={(e) => {
                            // 売上目標が設定されていない状態ではエンティティidが存在せず、stickyが機能しなくなるので、main_entity_targetの文字列をセット
                            const entityId = "main_entity_target";
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: stickyRow === entityId ? `固定を解除` : `画面内に固定`,
                              marginTop: 9,
                            });
                          }}
                          onMouseLeave={handleCloseTooltip}
                          onClick={() => {
                            const entityId = `deal_board_${memberObj.id}`;
                            if (!entityId) return;
                            if (entityId === stickyRow) {
                              setStickyRow(null);
                            } else {
                              setStickyRow(entityId);
                            }
                            handleCloseTooltip();
                          }}
                        >
                          {stickyRow === `deal_board_${memberObj.id}` && <TbSnowflakeOff />}
                          {stickyRow !== `deal_board_${memberObj.id}` && <TbSnowflake />}
                          {stickyRow === `deal_board_${memberObj.id}` && <span>解除</span>}
                          {stickyRow !== `deal_board_${memberObj.id}` && <span>固定</span>}
                        </div>
                      </div>
                      {/* <div className={`${styles.status_flex_wrapper}`}>
                      <div className={`${styles.right_spacer}`}></div>
                    </div> */}
                    </div>
                  </div>
                  <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Suspense fallback={<FallbackDealBoard />}>
                      <DealBoard
                        companyId={userProfileState.company_id!}
                        userId={memberObj.id}
                        // periodType={activePeriodSDB.periodType}
                        // period={activePeriodSDB.period}
                        onFetchComplete={() => onFetchComplete(tableIndex)} // ネタ表ボードのindexを渡す
                        fetchEnabled={tableIndex === currentActiveIndex || allFetched} // インデックスが一致しているか、全てフェッチが完了している時のみフェッチを許可
                      />
                    </Suspense>
                  </ErrorBoundary>
                  {/* <FallbackDealBoard /> */}
                </div>
                {/* {isRenderProgress && (
                <div className="flex-center fade08_forward my-[12px] w-full px-[24px]">
                  <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" />
                </div>
              )} */}
              </Fragment>
            );
          })}

        {/* ------------------- ネタ表ボードここまで ------------------- */}

        {/* ------------------- テスト ------------------- */}
        {/* {Array(3)
          .fill(null)
          .map((_, index) => (
            <div key={`${index}_board`} className={`${styles.entity_board_container} bg-[red]/[0]`}>
              <div className={`${styles.entity_detail_container} bg-[green]/[0]`}>
                <div className={`${styles.entity_detail_wrapper}`}>
                  <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
                    <AvatarIcon size={33} name="伊藤謙太" withCircle={false} hoverEffect={false} />
                    <div className={`${styles.entity_name} text-[19px] font-bold`}>
                      <span>伊藤 謙太</span>
                    </div>
                    <div className={`${styles.sub_info} pt-[6px]`}>代表取締役</div>
                    <div className={`${styles.sub_info} pt-[6px]`}>216088</div>
                  </div>
                </div>
              </div>
              <DealBoard />
            </div>
          ))} */}
        {/* ------------------- テストここまで ------------------- */}
      </section>
      {/* ------------------- ネタ表 詳細・編集モーダル ------------------- */}
      {isOpenDealCardModal && selectedDealCard && <EditModalDealCard />}
      {/* ------------------- ネタ表 詳細・編集モーダル ここまで ------------------- */}
      {/* ------------------- 受注済みに変更後の売上入力モーダル ------------------- */}
      {isOpenCongratulationsModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackDealBoard />}>
            <GradientModal
              title1="受注おめでとう🎉"
              title2="ダッシュボードに売上を反映させましょう！"
              tagText="受注"
              contentText="受注済みの案件に「売上商品・売上価格・売上日付」を記録することでダッシュボード上に売上実績と達成率が反映されます。"
              btnActiveText="反映する"
              btnCancelText="閉じる"
              illustText="受注おめでとうございます！"
              handleClickActive={handleClickActiveSoldModal}
              handleClickCancel={handleClickCancelSoldModal}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* ------------------- 受注済みに変更後の売上入力モーダル ここまで ------------------- */}
    </>
  );
};

export const ScreenDealBoards = memo(ScreenDealBoardsMemo);
