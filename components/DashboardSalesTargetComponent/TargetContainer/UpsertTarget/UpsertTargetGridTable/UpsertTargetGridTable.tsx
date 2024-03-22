import { CSSProperties, Dispatch, SetStateAction, memo, useEffect, useState } from "react";
import styles from "../../../DashboardSalesTargetComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import {
  columnHeaderListTarget,
  formatColumnName,
  formatRowName,
  formatRowNameShort,
  rowHeaderListTarget,
} from "../UpsertTarget";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { SparkChart } from "@/components/Parts/Charts/SparkChart/SparkChart";
import useStore from "@/store";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import { isValidNumber } from "@/utils/Helpers/isValidNumber";
import { checkNotFalsyExcludeZero } from "@/utils/Helpers/checkNotFalsyExcludeZero";
import { convertToYen } from "@/utils/Helpers/convertToYen";
import { calculateYearOverYear } from "@/utils/Helpers/PercentHelpers/calculateYearOverYear";
import { TbSnowflake, TbSnowflakeOff } from "react-icons/tb";

/**
 *   "period_type",
  "sales_target",
  "share",
  "yoy_growth",
  "yo2y_growth",
  "ly_sales",
  "lly_sales",
  "llly_sales",
  "sales_trend",
 */

type Props = {
  entityNameTitle: string;
  entityId: string;
  stickyRow: string | null;
  setStickyRow: Dispatch<SetStateAction<string | null>>;
};

const UpsertTargetGridTableMemo = ({ entityNameTitle, entityId, stickyRow, setStickyRow }: Props) => {
  const language = useStore((state) => state.language);
  const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  if (!upsertTargetObj) return;

  // ---------------- useQuery ----------------
  // 前年度売上

  // ---------------- ローカルstate ----------------
  // 売上目標input 「年度・上半期・下半期」
  const [inputSalesTargetYear, setInputSalesTargetYear] = useState("");
  const [inputSalesTargetFirstHalf, setInputSalesTargetFirstHalf] = useState("");
  const [inputSalesTargetSecondHalf, setInputSalesTargetSecondHalf] = useState("");
  // 上半期のシェア
  const [shareFirstHalf, setShareFirstHalf] = useState<number>(0);
  // 下半期のシェア
  const [shareSecondHalf, setShareSecondHalf] = useState<number>(0);

  const inputSalesTargetsList = [
    {
      key: "fiscal_year",
      title: { ja: "年度", en: "Fiscal Year" },
      inputValue: inputSalesTargetYear,
      setInputValue: setInputSalesTargetYear,
    },
    {
      key: "first_half",
      title: { ja: "上半期", en: "H1" },
      inputValue: inputSalesTargetFirstHalf,
      setInputValue: setInputSalesTargetFirstHalf,
    },
    {
      key: "second_half",
      title: { ja: "下半期", en: "H2" },
      inputValue: inputSalesTargetSecondHalf,
      setInputValue: setInputSalesTargetSecondHalf,
    },
  ];

  // ---------------- 変数 ----------------

  // ---------------- 関数 ----------------
  // rowの値に応じて適切なシェアを返す関数
  const getShare = (row: string) => {
    switch (row) {
      case "fiscal_year":
        return 100;
      case "first_half":
        return shareFirstHalf;
      case "second_half":
        return shareSecondHalf;
      default:
        return 0;
        break;
    }
  };

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

  // チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, 600);
  }, []);

  return (
    <>
      <div className={`${styles.grid_row} ${styles.col1}`}>
        <div className={`${styles.grid_content_card}`}>
          <div className={`${styles.card_title_area}`}>
            {/* <div className={`${styles.card_title_wrapper} space-x-[24px]`}>
                <div className={`${styles.card_title}`}>
                  <span>総合目標</span>
                </div>
                <div className={`${styles.card_title} pb-[1px]`}>
                  <span>{upsertTargetObj.entityName}</span>
                  <div className={`absolute bottom-0 left-0 min-h-[2px] w-full bg-[var(--color-bg-brand-f)]`} />
                </div>
              </div> */}
            <div className={`${styles.card_title}`}>
              <span>{entityNameTitle}</span>
            </div>

            <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
              <div
                className={`${styles.btn} ${styles.basic} space-x-[4px]`}
                onMouseEnter={(e) => {
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: stickyRow === entityId ? `固定を解除` : `画面上部に固定`,
                    marginTop: 9,
                  });
                }}
                onMouseLeave={handleCloseTooltip}
                onClick={() => {
                  if (entityId === stickyRow) {
                    setStickyRow(null);
                  } else {
                    setStickyRow(entityId);
                  }
                  handleCloseTooltip();
                }}
              >
                {stickyRow === entityId && <TbSnowflakeOff />}
                {stickyRow !== entityId && <TbSnowflake />}
                {stickyRow === entityId && <span>解除</span>}
                {stickyRow !== entityId && <span>固定</span>}
              </div>
            </div>
          </div>
          {/* ------------------ メインコンテナ ------------------ */}
          <div className={`${styles.main_container}`}>
            {/* ------------------ Gridコンテナ ------------------ */}
            <div
              role="grid"
              className={`${styles.grid_scroll_container}`}
              style={
                {
                  "--template-columns": `80px 240px 48px repeat(2, 100px) repeat(3, 150px) minmax(180px, 1fr)`,
                  "--header-row-height": `35px`,
                  "--grid-row-height": `56px`,
                  "--row-width": `100%`,
                } as CSSProperties
              }
            >
              {/* ----------- ヘッダー ----------- */}
              <div
                role="row"
                tabIndex={-1}
                aria-rowindex={1}
                aria-selected={false}
                className={`${styles.grid_header_row}`}
              >
                {columnHeaderListTarget.map((column, colIndex) => {
                  let displayValue = formatColumnName(column, upsertTargetObj.fiscalYear)[language];
                  return (
                    <div
                      key={colIndex}
                      role="columnheader"
                      aria-colindex={colIndex + 1}
                      aria-selected={false}
                      tabIndex={-1}
                      className={`${styles.grid_column_header_all}`}
                      style={{ gridColumnStart: colIndex + 1, ...(column === "share" && { padding: `0px` }) }}
                    >
                      <div className={`${styles.grid_column_header_inner} pointer-events-none`}>
                        {!(column === "yo2y_growth" && language === "ja") && (
                          <span
                            className={`${styles.grid_column_header_inner_name} pointer-events-none ${
                              column === "sales_target" && `${styles.sales_target}`
                            }`}
                          >
                            {displayValue}
                          </span>
                        )}
                        {column === "yo2y_growth" && language === "ja" && (
                          <>
                            <span className={`${styles.grid_column_header_inner_name} pointer-events-none`}>
                              前年度
                            </span>
                            <span className={`${styles.grid_column_header_inner_name} pointer-events-none`}>
                              前年伸び率実績
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* ----------- ヘッダー ここまで ----------- */}
              {/* ----------- rowgroup ----------- */}
              <div role="rowgroup">
                {/* ----------- Row 年度・半期リスト ----------- */}
                {rowHeaderListTarget.map((row, rowIndex) => {
                  const rowHeaderName = formatRowName(row, upsertTargetObj.fiscalYear)[language];
                  return (
                    <div key={`grid_row_${rowIndex}`} role="row" className={`${styles.row}`}>
                      {columnHeaderListTarget.map((column, colIndex) => {
                        // let displayValue = formatRowCell(column, upsertTargetObj.fiscalYear)[language];
                        const inputSalesTarget = inputSalesTargetsList[rowIndex].inputValue;
                        const setInputSalesTarget = inputSalesTargetsList[rowIndex].setInputValue;
                        return (
                          <div
                            key={colIndex}
                            role="gridcell"
                            aria-colindex={colIndex + 1}
                            aria-selected={false}
                            tabIndex={-1}
                            className={`${styles.grid_cell}`}
                            style={{
                              gridColumnStart: colIndex + 1,
                              ...(column === "share" && { padding: `0px` }),
                            }}
                          >
                            {column === "period_type" && <span>{rowHeaderName}</span>}
                            {column === "sales_target" && row !== "second_half" && (
                              <input
                                type="text"
                                // placeholder="例：600万円 → 6000000　※半角で入力"
                                className={`${styles.input_box} ${styles.upsert}`}
                                // value={inputDiscountAmountEdit ? inputDiscountAmountEdit : ""}
                                value={inputSalesTarget ? inputSalesTarget : ""}
                                onChange={(e) => {
                                  setInputSalesTarget(e.target.value);
                                }}
                                onFocus={() => {
                                  // 売上目標が0以外のfalsyならリターン
                                  if (!isValidNumber(inputSalesTarget.replace(/[^\d.]/g, ""))) {
                                    console.log(
                                      "リターンinputSalesTarget",
                                      inputSalesTarget,
                                      !isValidNumber(inputSalesTarget)
                                    );
                                    return;
                                  }
                                  console.log("こここinputSalesTarget", inputSalesTarget);
                                  // フォーカス時は数字と小数点以外除去
                                  setInputSalesTarget(inputSalesTarget.replace(/[^\d.]/g, ""));
                                }}
                                // onBlur={() => {
                                //   // 現在の売上目標金額
                                //   const replacedTotalPrice = inputSalesTarget.replace(/[^\d.]/g, "");
                                //   // 商品リストが存在しない場合、価格合計が空文字の場合はリターンする
                                //   if (!checkNotFalsyExcludeZero(replacedTotalPrice)) {
                                //     return;
                                //   }
                                //   // フォーマット後の目標金額
                                //   const convertedDiscountPrice = checkNotFalsyExcludeZero(inputSalesTarget)
                                //     ? convertToYen(inputSalesTarget.trim())
                                //     : null;
                                //   const newFormatDiscountAmount = formatDisplayPrice(convertedDiscountPrice || 0);
                                //   setInputSalesTarget(newFormatDiscountAmount);
                                //   // 上半期、下半期のシェアを再計算してstateを更新
                                //   const result = calculateYearOverYear(inputSalesTarget);
                                //   const result = calculateDiscountRate({
                                //     salesPriceStr: inputTotalPriceEdit,
                                //     discountPriceStr: (convertedDiscountPrice || 0).toString(),
                                //     salesQuantityStr: "1",
                                //     showPercentSign: false,
                                //     decimalPlace: 2,
                                //   });
                                //   if (result.error) {
                                //     toast.error(`エラー：${result.error}🙇‍♀️`);
                                //     console.error("エラー：値引率の取得に失敗", result.error);
                                //     setInputDiscountRateEdit("");
                                //   } else if (result.discountRate) {
                                //     const newDiscountRate = result.discountRate;
                                //     setInputDiscountRateEdit(newDiscountRate);
                                //   }
                                // }}
                              />
                            )}
                            {column === "sales_target" && row !== "second_half" && (
                              <span>{inputSalesTargetSecondHalf ?? ""}</span>
                            )}
                            {column === "share" && (
                              <>
                                <div
                                  className={`${styles.grid_header_cell_share} flex-center relative h-full w-full pb-[12px]`}
                                >
                                  {isMounted && (
                                    <>
                                      <ProgressCircle
                                        circleId="3"
                                        textId="3"
                                        progress={getShare(row)}
                                        // progress={0}
                                        duration={5000}
                                        easeFn="Quartic"
                                        size={24}
                                        strokeWidth={3}
                                        hiddenCenterText={true}
                                        oneColor="var(--main-color-f)"
                                        notGrad={true}
                                        isReady={true}
                                        withShadow={false}
                                        fade={`fade03_forward`}
                                      />
                                      <ProgressNumber
                                        targetNumber={getShare(row)}
                                        // startNumber={Math.round(68000 / 2)}
                                        // startNumber={Number((68000 * 0.1).toFixed(0))}
                                        startNumber={0}
                                        duration={5000}
                                        // easeFn="Quartic"
                                        easeFn="Quartic"
                                        fontSize={9}
                                        margin="0 0 0 0"
                                        isReady={true}
                                        isPrice={false}
                                        isPercent={true}
                                        fade={`fade03_forward`}
                                        customClass={`absolute bottom-[7px] left-[50%] translate-x-[-50%] text-[5px]`}
                                        textColor={`var(--color-text-sub)`}
                                      />
                                    </>
                                  )}
                                </div>
                              </>
                            )}
                            {["yoy_growth", "yo2y_growth"].includes(column) && (
                              <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                {column === "yoy_growth" && <span>23.5%</span>}
                                {column === "yo2y_growth" && <span>18.2%</span>}
                              </div>
                            )}
                            {["ly_sales", "lly_sales", "llly_sales"].includes(column) && (
                              <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                {/* 10兆5256億2430万2100円 */}
                                {column === "ly_sales" && formatDisplayPrice(1525624302100)}
                                {column === "lly_sales" && formatDisplayPrice(1525624302100)}
                                {column === "llly_sales" && formatDisplayPrice(1525624302100)}
                              </div>
                            )}
                            {column === "sales_trend" && (
                              <SparkChart
                                id={`${colIndex}${rowIndex}`}
                                title={formatRowNameShort(row, upsertTargetObj.fiscalYear)[language]}
                                // title={`${upsertTargetObj.fiscalYear - rowIndex}年度`}
                                height={48}
                                width={270}
                                delay={600}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {/* ----------- Row 年度・半期リスト ここまで ----------- */}
              </div>
              {/* ----------- rowgroup ここまで ----------- */}
            </div>
            {/* ------------------ Gridコンテナ ここまで ------------------ */}
          </div>
          {/* ------------------ メインコンテナ ここまで ------------------ */}
        </div>
      </div>
    </>
  );
};

export const UpsertTargetGridTable = memo(UpsertTargetGridTableMemo);
