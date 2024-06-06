import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";
import { useQuerySalesProbabilityWithSalesTarget } from "@/hooks/useQuerySalesProbabilityWithSalesTarget";
import { Dispatch, SetStateAction, memo, useEffect, useRef, useState } from "react";
import styles from "../DealBoard/DealBoard.module.css";
import { FiscalYearAllKeys } from "@/types";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import useStore from "@/store";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";
import useDashboardStore from "@/store/useDashboardStore";
import { DonutChartCustomComponent } from "@/components/Parts/Charts/DonutChart/DonutChartCustom";
import { COLORS_DEAL_SDB } from "@/components/Parts/Charts/Seeds/seedData";
import { mappingSalesProbablyShort } from "@/utils/selectOptions";
import { useMedia } from "react-use";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { ImInfo } from "react-icons/im";

type Props = {
  companyId: string;
  entityId: string;
  entityLevel: string;
  periodTypeForProperty: "fiscal_year" | "half_year" | "quarter" | "year_month";
  periodTypeForTarget: FiscalYearAllKeys | null;
  period: number;
  stickyRow: string | null;
  setStickyRow: Dispatch<SetStateAction<string | null>>;
  // periodType: string;
  // period: number;
  onFetchComplete?: () => void;
  fetchEnabled?: boolean; // trueに変更されたらフェッチを許可する
  isRenderProgress?: boolean; // ProgressCircleレンダリングを許可
  entityName: string;
  position_name?: string; // memberレベルの場合に使用
  assigned_employee_id_name?: string; // memberレベルの場合に使用
  fiscalYearId: string | null;
  entityLevelId: string | null;
  entityStructureId: string | null;
  periodTitle: string;
};

// 確度別のネタ件数と平均単価と確率込み売上予測
const DealBoardSalesForecastMemo = ({
  companyId,
  entityId,
  entityLevel,
  periodTypeForProperty,
  periodTypeForTarget,
  period,
  stickyRow,
  setStickyRow,
  onFetchComplete,
  fetchEnabled,
  isRenderProgress,
  entityName,
  position_name,
  assigned_employee_id_name,
  fiscalYearId,
  entityLevelId,
  entityStructureId,
  periodTitle,
}: Props) => {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const language = useStore((state) => state.language);

  // デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  // 期間変更時のローディング
  const isLoadingSDB = useDashboardStore((state) => state.isLoadingSDB);

  // 🔸確度別の件数と売上予想を取得
  const {
    data,
    isLoading: isLoadingQuery,
    isSuccess: isSuccessQuery,
    isError: isErrorQuery,
  } = useQuerySalesProbabilityWithSalesTarget({
    companyId,
    entityId,
    entityLevel,
    period,
    periodTypeForProperty,
    periodTypeForTarget,
    fetchEnabled,
    fiscalYearId,
    entityLevelId,
    entityStructureId,
  });

  const [isMountedQuery, setIsMountedQuery] = useState(false);
  // 🌟ローカルstateに格納
  useEffect(() => {
    if (isMountedQuery) return; // 既にマウント済みの場合はリターン

    // 期間変更中はリターン
    if (isLoadingSDB) return;
    if (isLoadingQuery) return;

    if (isSuccessQuery) {
      // クエリを完了
      setIsMountedQuery(true);

      // フェッチ完了を通知して次のネタ表ボードのフェッチを許可する
      console.log("売上予測テーブル フェッチ完了を通知");
      if (onFetchComplete) onFetchComplete();
    }
  }, [isSuccessQuery, data, isLoadingSDB, isLoadingQuery]);

  // 🔸マウント時のアニメーション
  const [animate, setAnimate] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (!isMountedQuery) return; // まだクエリ後のcardsセットが終わってない場合はリターン
    // コンポーネントがマウントされたらアニメーションを開始
    setAnimate(true);

    // 2秒後にはフェードアニメーションを削除
    setTimeout(() => {
      setIsMounted(true);
      setAnimate(false);
    }, 2000);
  }, [isMountedQuery]);

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

  // 選択されたメンバーのidをDealBoardにpropsで渡す
  const activeThemeColor = useDashboardStore((state) => state.activeThemeColor);

  const getStyleTheme = () => {
    switch (activeThemeColor) {
      case "theme-brand-f":
        return ``;
      case "theme-brand-f-gradient":
        return `${styles.theme_f_gradient}`;
      case "theme-black-gradient":
        return `${styles.theme_black}`;
      case "theme-simple17":
        return `${styles.theme_simple17}`;
      case "theme-simple12":
        return `${styles.theme_simple12}`;
        break;
      default:
        return ``;
        break;
    }
  };

  // ホバー中のセクター
  const [activeIndex, setActiveIndex] = useState(1000);

  const chartData = data ? data.chartData : [];
  const totalAmount = data ? data.total_amount : 0;
  const donutLabelData = data ? data.labelListSalesProbabilities : [];

  console.log("DealBoardSalesForecastレンダリング", "data", data);

  return (
    <>
      {/* ------------------------ タイトルエリア ------------------------ */}
      <div className={`${styles.entity_detail_container} bg-[green]/[0]`}>
        <div className={`${styles.entity_detail_wrapper}`}>
          <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
            <AvatarIcon
              // size={33}
              size={36}
              name={entityName ?? "未設定"}
              withCircle={false}
              hoverEffect={false}
              textSize={16}
              // imgUrl={memberObj.avatar_url ?? null}
            />
            <div className={`${styles.entity_name} text-[19px] font-bold`}>
              <span>{entityName}</span>
            </div>
            {position_name && <div className={`${styles.sub_info} pt-[6px]`}>{position_name ?? "役職未設定"}</div>}
            {assigned_employee_id_name && (
              <div className={`${styles.sub_info} pt-[6px]`}>{assigned_employee_id_name ?? ""}</div>
            )}
            <div
              // className={`relative !ml-[24px] !mr-[12px] flex h-full min-h-[56px] w-auto items-end bg-[red]/[0]`}
              className={`relative !ml-[24px] !mr-[12px] flex h-full min-h-[56px] w-auto items-end bg-[red]/[0]`}
            >
              <div className="flex h-full min-w-[150px] items-end justify-end">
                {data ? (
                  <ProgressNumber
                    // targetNumber={memberObj.current_sales_amount}
                    targetNumber={data.current_sales_amount}
                    // targetNumber={6200000}
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
                ) : (
                  <span
                    style={{
                      fontSize: `27px`,
                      fontWeight: 500,
                      color: `var(--color-text-title)`,
                      margin: "0 0 -3px 0",
                    }}
                    className={`${!isRenderProgress ? `opacity-0` : ``} ${isRenderProgress ? `fade08_forward` : ``}`}
                  >
                    {formatToJapaneseYen(0, true)}
                  </span>
                )}
              </div>
              <div className="relative h-full min-w-[33px]">
                <div className="absolute left-[66%] top-[68%] min-h-[2px] w-[30px] translate-x-[-50%] translate-y-[-50%] rotate-[120deg] bg-[var(--color-text-title)]"></div>
              </div>
              <div
                // className="mr-[12px] flex h-full min-w-max items-end justify-start"
                className="mr-[9px] flex h-full min-w-max items-end justify-start"
              >
                <span className="ml-[6px] text-[16px]">
                  {data && data.current_sales_target !== null
                    ? `${formatToJapaneseYen(data.current_sales_target, false)}`
                    : `-`}
                </span>
                {/* <span className="ml-[6px] text-[16px]">9,000,000</span> */}
                {/* <span className="ml-[0px] text-[16px]">-</span> */}
                {/* <span className="ml-[12px] text-[16px]">-</span> */}
              </div>
            </div>
            <div className={`relative h-[56px] w-[56px]`} style={{ margin: `0` }}>
              <div className="absolute bottom-[-6px] right-0">
                <ProgressCircle
                  circleId={`${entityId}_board`}
                  textId={`${entityId}_board`}
                  // progress={
                  //   memberObj.current_achievement_rate !== null
                  //     ? 100 <= memberObj.current_achievement_rate
                  //       ? 100
                  //       : Number(memberObj.current_achievement_rate.toFixed(0))
                  //     : 0
                  // }
                  progress={
                    data && data.current_achievement_rate !== null
                      ? 100 <= data.current_achievement_rate
                        ? 100
                        : data.current_achievement_rate
                      : 0
                  }
                  // progress={24}
                  // progress={100}
                  // progress={0}
                  duration={5000}
                  easeFn="Quartic"
                  size={56}
                  strokeWidth={6}
                  // fontSize={11}
                  fontSize={13}
                  fontWeight={500}
                  fontFamily="var(--font-family-str)"
                  textColor="var(--color-text-title)"
                  isReady={isRenderProgress}
                  fade={`fade08_forward`}
                  // fade={`fade10_forward`}
                  withShadow={false}
                  // withShadow={true}
                  // boxShadow={`var(--color-progress-chart-shadow-white)`}
                  // boxShadow={`0 0 1px 1px #ffffff90, 0 0 3px 2px #ffffff36, 0 0 3px 3px #ffffff15`}
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
                if (`deal_board_${entityId}` === stickyRow) {
                  setStickyRow(null);
                } else {
                  setStickyRow(`deal_board_${entityId}`);
                }
                handleCloseTooltip();
              }}
            >
              {stickyRow === `deal_board_${entityId}` && <TbSnowflakeOff />}
              {stickyRow !== `deal_board_${entityId}` && <TbSnowflake />}
              {stickyRow === `deal_board_${entityId}` && <span>解除</span>}
              {stickyRow !== `deal_board_${entityId}` && <span>固定</span>}
            </div>
          </div>
        </div>
      </div>
      {/* ------------------------ タイトルエリア h-[48px] 全体で336px ------------------------ */}
      {/* ------------------------ ボード h-[288px] px 24px py 12px ------------------------ */}
      <div
        ref={boardRef}
        className={`${styles.board} flex min-h-[288px] w-full text-[var(--color-text-title)] ${getStyleTheme()}`}
      >
        {/* --------- 確度別データ一覧 w: 70% --------- */}
        <div className={`fade08_forward flex min-h-full w-[73%] flex-col`}>
          <div className={`w-full`}>
            <h4 className={`flex min-h-[22px] items-center space-x-[12px] text-[15px]`}>
              <span>案件状況</span>
              <span>{periodTitle}</span>
              <div className={`${styles.info_area} flex-center min-h-[22px]`}>
                <div
                  className="flex-center relative h-[16px] w-[16px] rounded-full"
                  onMouseEnter={(e) => {
                    // handleEnterInfoIcon(e, infoIconProgressRef.current);
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      // content: `「A（受注済み）」は「月初確度」か「中間見直確度」が「A (受注済み)」で、売上金額が入力済みの`,
                      content: `獲得予定日が選択中の期間内にあり、「案件没・ペンディング」でない案件を確度別に集計しています。\n各案件の合計金額は「A（受注済み）」が「売上金額」、それ以外は「獲得予定金額」の合計値に対して、\nそれぞれの案件の受注確度を乗算した金額を算出しています。`,
                      marginTop: 56,
                      // marginTop: 39,
                      itemsPosition: "left",
                    });
                  }}
                  onMouseLeave={(e) => {
                    handleCloseTooltip();
                  }}
                >
                  {/* <div
                          // ref={infoIconProgressRef}
                          className={`flex-center absolute left-0 top-0 h-[18px] w-[18px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                        ></div> */}
                  <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                </div>
              </div>
            </h4>
          </div>
          <div className={`mt-[15px] flex w-full justify-between text-[13px] text-[var(--color-text-sub)]`}>
            <div>
              <span>受注確度別ネタ</span>
            </div>
            <div className={`flex space-x-[6px]`}>
              <span>平均単価</span>
              <span>/</span>
              <span>件数</span>
              <span>/</span>
              <span>確度</span>
              <span>/</span>
              <span>合計（確度込み）</span>
            </div>
          </div>
          <ul className={`flex w-full flex-col`}>
            {donutLabelData.map((deal, index) => {
              return (
                <li
                  key={`deal_status_${index}`}
                  //   className={`flex w-full justify-between border-b border-solid border-[var(--color-border-base)] pb-[9px] pt-[12px]`}
                  className={`w-full border-b border-solid border-[var(--color-border-base)] pb-[9px] pt-[12px] ${
                    styles.deal_list
                  } ${activeIndex === 1000 || activeIndex === index ? `` : `${styles.inactive}`}`}
                  style={{ display: `grid`, gridTemplateColumns: `max-content 1fr` }}
                >
                  <div className={`flex items-center`}>
                    <div
                      className={`mr-[9px] min-h-[9px] min-w-[9px] rounded-[12px]`}
                      style={{
                        background:
                          activeIndex === 1000 || activeIndex === index
                            ? `${COLORS_DEAL_SDB[index]}`
                            : `var(--color-text-disabled)`,
                      }}
                    />
                    <div
                      className="text-[15px]"
                      style={{
                        fontFamily: `sans-serif`,
                        color:
                          activeIndex === 1000 || activeIndex === index
                            ? `${COLORS_DEAL_SDB[index]}`
                            : `var(--color-text-disabled)`,
                      }}
                    >
                      {/* <span>A</span> */}
                      {/* <span>⚪️</span> */}
                      <span>
                        {mappingSalesProbablyShort[chartData[index].name as number][language]}
                        {/* {index !== 0 ? `ネタ` : ``} */}
                      </span>
                    </div>
                  </div>
                  <div
                    className={`flex items-center justify-end text-[15px]`}
                    style={{ display: `grid`, gridTemplateColumns: `repeat(4, max-content)`, columnGap: `12px` }}
                    // style={{ ...(!isDesktopGTE1600 && { maxWidth: `312px` }) }}
                    // style={{
                    //   display: `grid`,
                    //   gridTemplateColumns: isDesktopGTE1600 ? `repeat(4, max-content)` : `97px 54px 47px 114px`,
                    //   //   gridTemplateColumns: `repeat(4, max-content)`,
                    // }}
                  >
                    {/* <div className={`flex justify-end  ${isDesktopGTE1600 ? `pl-[15px]` : ` pl-[12px]`}`}> */}
                    <div className={`flex justify-end `}>
                      {/* <span className={`${isDesktopGTE1600 ? `` : `max-w-[85px]`} min-w-[85px] truncate text-end`}> */}
                      <span className={`min-w-[85px] truncate text-end`}>
                        {isValidNumber(deal.average_price) ? formatToJapaneseYen(deal.average_price) : `¥ -`}
                      </span>
                    </div>
                    <div className={`flex justify-end`}>
                      {/* <span className={`${isDesktopGTE1600 ? `` : `max-w-[42px]`} min-w-[42px] truncate text-end`}> */}
                      <span className={`min-w-[42px] truncate text-end`}>{deal.quantity}件</span>
                    </div>
                    <div className={`flex justify-end`}>
                      {/* <span className={`${isDesktopGTE1600 ? `` : `max-w-[35px]`} min-w-[35px] truncate text-end`}> */}
                      <span className={`min-w-[42px] truncate text-end`}>{deal.probability}%</span>
                    </div>
                    <div className={`flex justify-end`}>
                      {/* <span className={`${isDesktopGTE1600 ? `` : `max-w-[102px]`} min-w-[102px] truncate text-end`}> */}
                      <span className={`min-w-[102px] truncate text-end`}>{formatToJapaneseYen(deal.amount)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
            <li className={`flex w-full justify-between pb-[9px] pt-[12px]`}>
              <div className={`flex items-center`}>
                <div
                  className={`mr-[9px] min-h-[9px] min-w-[9px] rounded-[12px]`}
                  // style={{ background: `${COLORS_DEAL[index]}` }}
                />
                <div className="text-[14px] font-bold text-[var(--color-text-title)]">
                  <span>残ネタ獲得 合計予測</span>
                </div>
              </div>
              <div className={`flex items-center space-x-[12px] text-[15px] text-[var(--color-text-title)]`}>
                {/* <div className={``}>
                <span>¥ 3,240,000</span>
              </div> */}
                {/* <div className={``}>
                <span>12件</span>
              </div> */}
                <div className={`font-bold`}>
                  <span>{formatToJapaneseYen(totalAmount, true)}</span>
                </div>
              </div>
            </li>
          </ul>
        </div>
        {/* --------- 確度別データ一覧 ここまで --------- */}
        {/* --------- ドーナツチャート w: 30% --------- */}
        <div className={`flex h-full w-[27%] flex-col`}>
          <div
            className={`flex-center relative h-full`}
            style={{
              minWidth: 224,
            }}
          >
            <div
              // className={`absolute left-0 top-0 flex h-full w-[448px] items-center bg-[blue]/[0]`}
              className={`absolute left-0 top-0 flex h-full w-full items-center bg-[blue]/[0]`}
              // style={{ maxWidth: `100%` }}
            >
              <DonutChartCustomComponent
                colors={COLORS_DEAL_SDB}
                colorsSheer={COLORS_DEAL_SDB}
                chartHeight={286}
                // chartCenterX={112}
                chartCenterX={180}
                chartData={chartData}
                labelListSalesProbability={donutLabelData}
                mainEntityId={entityId}
                totalAmount={totalAmount}
                periodType={periodTypeForProperty}
                labelType={"sales_probability"}
                fallbackHeight={"288px"}
                fallbackPadding={`0px 6px 8px 24px`}
                activeIndexParent={activeIndex}
                setActiveIndexParent={setActiveIndex}
                customPaddingAngle={0}
                innerRadius={70}
                outerRadius={88}
                centerTextFontSize={18}
              />
            </div>
          </div>
        </div>
        {/* --------- ドーナツチャート ここまで --------- */}
      </div>
    </>
  );
};

export const DealBoardSalesForecast = memo(DealBoardSalesForecastMemo);
