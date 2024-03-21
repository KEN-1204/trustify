import { CSSProperties, memo, useEffect, useState } from "react";
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

const UpsertTargetGridTableMemo = () => {
  const language = useStore((state) => state.language);
  const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  if (!upsertTargetObj) return;
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
      <div className={`${styles.contents_area} ${styles.upsert}`}>
        <div className={`${styles.grid_row} ${styles.col1}`}>
          <div className={`${styles.grid_content_card}`}>
            <div className={`${styles.card_title_area}`}>
              <div className={`${styles.card_title}`}>
                <span>{upsertTargetObj.entityName}</span>
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
                  {/* Row 年度 */}
                  {rowHeaderListTarget.map((row, rowIndex) => {
                    const rowHeaderName = formatRowName(row, upsertTargetObj.fiscalYear)[language];
                    return (
                      <div key={`grid_row_${rowIndex}`} role="row" className={`${styles.row}`}>
                        {columnHeaderListTarget.map((column, colIndex) => {
                          // let displayValue = formatRowCell(column, upsertTargetObj.fiscalYear)[language];
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
                              {colIndex === 0 && <span>{rowHeaderName}</span>}
                              {colIndex === 1 && (
                                <input
                                  type="text"
                                  // placeholder="例：600万円 → 6000000　※半角で入力"
                                  className={`${styles.input_box} ${styles.upsert}`}
                                  // value={inputDiscountAmountEdit ? inputDiscountAmountEdit : ""}
                                  value={""}
                                  onChange={(e) => {
                                    // // 商品リストが0の場合は先に商品を追加するように案内
                                    // if (selectedProductsArray?.length === 0) {
                                    //   return alert("先に見積商品を追加してください。");
                                    // }
                                    // setInputDiscountAmountEdit(e.target.value);
                                  }}
                                  onFocus={() => {
                                    // // 商品リストが存在しない、または、値引金額が0以外のfalsyならリターン
                                    // if (
                                    //   selectedProductsArray?.length === 0 ||
                                    //   !isValidNumber(inputDiscountAmountEdit.replace(/[^\d.]/g, ""))
                                    // ) {
                                    //   console.log(
                                    //     "リターンinputDiscountAmountEdit",
                                    //     inputDiscountAmountEdit,
                                    //     !isValidNumber(inputDiscountAmountEdit),
                                    //     // isNaN(inputDiscountAmountEdit),
                                    //     selectedProductsArray?.length
                                    //   );
                                    //   return;
                                    // }
                                    // console.log("こここinputDiscountAmountEdit", inputDiscountAmountEdit);
                                    // // フォーカス時は数字と小数点以外除去
                                    // setInputDiscountAmountEdit(inputDiscountAmountEdit.replace(/[^\d.]/g, ""));
                                  }}
                                  onBlur={() => {
                                    // // 現在の価格合計
                                    // const replacedTotalPrice = inputTotalPriceEdit.replace(/[^\d.]/g, "");
                                    // // 商品リストが存在しない場合、価格合計が空文字の場合はリターンする
                                    // if (
                                    //   selectedProductsArray?.length === 0 ||
                                    //   !checkNotFalsyExcludeZero(replacedTotalPrice)
                                    // ) {
                                    //   return;
                                    // }
                                    // // 新たな値引金額
                                    // const convertedDiscountPrice = checkNotFalsyExcludeZero(inputDiscountAmountEdit)
                                    //   ? convertToYen(inputDiscountAmountEdit.trim())
                                    //   : null;
                                    // // 値引金額が合計金額を超えてたら値引金額と値引率を0にして合計金額を価格合計に合わせる
                                    // if (Number(replacedTotalPrice || 0) < Number(convertedDiscountPrice || 0)) {
                                    //   setInputTotalAmountEdit(inputTotalPriceEdit);
                                    //   setInputDiscountAmountEdit("0");
                                    //   setInputDiscountRateEdit("0");
                                    //   return;
                                    // }
                                    // const newFormatDiscountAmount = formatDisplayPrice(convertedDiscountPrice || 0);
                                    // setInputDiscountAmountEdit(newFormatDiscountAmount);
                                    // // setInputDiscountAmountEdit(
                                    // //   convertedDiscountPrice ? convertedDiscountPrice.toLocaleString() : "0"
                                    // // );
                                    // // 合計金額を算出して更新
                                    // const newTotalAmount = calculateTotalAmount(
                                    //   Number(replacedTotalPrice),
                                    //   Number(convertedDiscountPrice) || 0,
                                    //   language === "ja" ? 0 : 2
                                    // );
                                    // setInputTotalAmountEdit(newTotalAmount);
                                    // // 値引率も同時に計算して更新する
                                    // const result = calculateDiscountRate({
                                    //   salesPriceStr: inputTotalPriceEdit,
                                    //   discountPriceStr: (convertedDiscountPrice || 0).toString(),
                                    //   salesQuantityStr: "1",
                                    //   showPercentSign: false,
                                    //   decimalPlace: 2,
                                    // });
                                    // if (result.error) {
                                    //   toast.error(`エラー：${result.error}🙇‍♀️`);
                                    //   console.error("エラー：値引率の取得に失敗", result.error);
                                    //   setInputDiscountRateEdit("");
                                    // } else if (result.discountRate) {
                                    //   const newDiscountRate = result.discountRate;
                                    //   setInputDiscountRateEdit(newDiscountRate);
                                    // }
                                  }}
                                />
                              )}
                              {colIndex === 2 && (
                                <>
                                  <div
                                    className={`${styles.grid_header_cell_share} flex-center relative h-full w-full pb-[12px]`}
                                  >
                                    {isMounted && (
                                      <>
                                        <ProgressCircle
                                          circleId="3"
                                          textId="3"
                                          progress={100}
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
                                          targetNumber={100}
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
                              {colIndex === 3 && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">23.5%</div>
                              )}
                              {colIndex === 4 && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">18.5%</div>
                              )}
                              {colIndex === 5 && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                  {/* 10兆5256億2430万2100円 */}
                                  {formatDisplayPrice(1525624302100)}
                                </div>
                              )}
                              {colIndex === 6 && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                  {formatDisplayPrice(525624302100)}
                                </div>
                              )}
                              {colIndex === 7 && (
                                <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                  {formatDisplayPrice(24302100)}
                                </div>
                              )}
                              {colIndex === 8 && (
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
                  {/* Row 年度 ここまで */}
                </div>
                {/* ----------- rowgroup ここまで ----------- */}
              </div>
              {/* ------------------ Gridコンテナ ここまで ------------------ */}
            </div>
            {/* ------------------ メインコンテナ ここまで ------------------ */}
          </div>
        </div>
      </div>
    </>
  );
};

export const UpsertTargetGridTable = memo(UpsertTargetGridTableMemo);
