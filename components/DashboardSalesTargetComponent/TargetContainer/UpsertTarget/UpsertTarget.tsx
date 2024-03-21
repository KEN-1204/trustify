import useStore from "@/store";
import styles from "../../DashboardSalesTargetComponent.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { CSSProperties, memo, useEffect, useState } from "react";
import { FaSave } from "react-icons/fa";
import { IoIosSave } from "react-icons/io";
import { MdSaveAlt } from "react-icons/md";
import { RiSave3Fill } from "react-icons/ri";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { Department, Office, Section, Unit } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { SparkChart } from "@/components/Parts/Charts/SparkChart/SparkChart";

const columnHeaderListTarget = [
  "period_type",
  "sales_target",
  "share",
  "yoy_growth",
  "yo2y_growth",
  "ly_sales",
  "lly_sales",
  "llly_sales",
  "sales_trend",
];
const formatColumnName = (column: string, year: number): { ja: string; en: string; [key: string]: string } => {
  switch (column) {
    case "period_type":
      return { ja: "期間", en: "Period" };
    case "sales_target":
      return { ja: `${year}年度 売上目標`, en: `FY${year} Sales Target` };
    case "share":
      return { ja: "シェア", en: "Share" };
    case "yoy_growth":
      return { ja: "前年比", en: "YoY Growth" };
    case "yo2y_growth":
      return { ja: "前年度前年伸び率実績", en: "Yo2Y Growth" };
    case "ly_sales":
      return { ja: `${year - 1}年度`, en: `FY${year - 1}` };
    case "lly_sales":
      return { ja: `${year - 2}年度`, en: `FY${year - 2}` };
    case "llly_sales":
      return { ja: `${year - 3}年度`, en: `FY${year - 3}` };
    case "sales_trend":
      return { ja: `売上推移`, en: `Sales Trend` };

    default:
      return { ja: column, en: column };
      break;
  }
};

type Props = {
  endEntity: string; // メンバーエンティティの直属の親エンティティ
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

const UpsertTargetMemo = ({ endEntity }: Props) => {
  const queryClient = useQueryClient();
  const language = useStore((state) => state.language);
  const setIsUpsertTargetMode = useDashboardStore((state) => state.setIsUpsertTargetMode);
  const upsertTargetObj = useDashboardStore((state) => state.upsertTargetObj);
  const setUpsertTargetObj = useDashboardStore((state) => state.setUpsertTargetObj);

  if (!upsertTargetObj) return null;

  const isEndEntity = endEntity === upsertTargetObj.entityType;

  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const sectionDataArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ========================= 🌟事業部・課・係・事業所リスト取得useQuery キャッシュ🌟 =========================

  // -------------------------- 関数 --------------------------
  // 目標設定モードを終了
  const handleCancelUpsert = () => {
    setIsUpsertTargetMode(false);
    setUpsertTargetObj(null);
  };

  // チャート マウントを0.6s遅らせる
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    if (isMounted) return;
    setTimeout(() => {
      setIsMounted(true);
    }, 600);
  }, []);

  console.log(
    "UpsertTargetコンポーネントレンダリング isEndEntity",
    isEndEntity,
    "endEntity",
    endEntity,
    upsertTargetObj
  );

  return (
    <>
      {/* ===================== スクロールコンテナ ここから ===================== */}
      <div className={`${styles.main_contents_container}`}>
        {/* ----------------- １画面目 上画面 ----------------- */}
        <section
          // className={`${styles.company_screen} space-y-[20px] ${
          className={`${styles.company_table_screen}`}
        >
          <div className={`${styles.title_area} flex w-full justify-between`}>
            <h1 className={`${styles.title}`}>
              <span>目標設定</span>
            </h1>
            <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
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
        </section>
        {/* ----------------- ２画面目 下画面 ----------------- */}
        <section className={`${styles.main_section_area} fade08_forward`}>
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
                                <span className={`${styles.grid_column_header_inner_name} pointer-events-none`}>
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
                      {Array(3)
                        .fill(null)
                        .map((_, rowIndex) => (
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
                                  {colIndex === 0 && <span>年度</span>}
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
                                      10兆5256億2430万2100円
                                    </div>
                                  )}
                                  {colIndex === 6 && (
                                    <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                      5256億2430万2100円
                                    </div>
                                  )}
                                  {colIndex === 7 && (
                                    <div className="flex h-full w-full items-center whitespace-pre-wrap">
                                      556億2430万2100円
                                    </div>
                                  )}
                                  {colIndex === 8 && (
                                    <SparkChart id={`${colIndex}${rowIndex}`} height={48} width={270} delay={600} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
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
        </section>
        {/* ----------------- ２画面目 下画面 ここまで ----------------- */}
      </div>
      {/* ===================== スクロールコンテナ ここまで ===================== */}
    </>
  );
};

export const UpsertTarget = memo(UpsertTargetMemo);
