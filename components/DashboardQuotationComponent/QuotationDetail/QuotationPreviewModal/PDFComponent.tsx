import { memo, useEffect, useState } from "react";
import styles from "./QuotationPreviewModal.module.css";
import NextImage from "next/image";
import useStore from "@/store";

const PDFComponentMemo = () => {
  const language = useStore((state) => state.language);

  const dealTitleArray = [
    { title: "deadline", jpTitle: "納期", titleLetterArray: ["納", "期"] },
    { title: "delivery_place", jpTitle: "受渡場所", titleLetterArray: ["受", "渡", "場", "所"] },
    { title: "payment_terms", jpTitle: "取引方法", titleLetterArray: ["取", "引", "方", "法"] },
    { title: "expiration_date", jpTitle: "有効期限", titleLetterArray: ["有", "効", "期", "限"] },
  ];

  const amountTitleArray = ["合", "計", "金", "額"];

  const logoSrc = "/assets/images/Trustify_logo_white1.png";
  const hankoSrc = "/assets/images/icons/saito.png";
  const columnHeaderTitleArray = ["product_name", "unit_quantity", "unit_price", "amount"];

  const productsArray: { [key: string]: any } = [
    {
      id: "1-1",
      product_name: "画像寸法測定器",
      outside_name: "IX-9000/9030T",
      unit_quantity: 1,
      unit_price: 6295000,
      amount: 6295000,
    },
    {
      id: "2-1",
      product_name: "IXエディタソフト",
      outside_name: "IX-H1E",
      unit_quantity: 1,
      unit_price: 200000,
      amount: 200000,
    },
    {
      id: "3-1",
      product_name: "データ転送ソフト",
      outside_name: "IX-H1T",
      unit_quantity: 1,
      unit_price: 150000,
      amount: 150000,
    },
    {
      id: "4-1",
      product_name: "強化ステージガラス",
      outside_name: "IX-SG2",
      unit_quantity: 1,
      unit_price: 150000,
      amount: 150000,
    },
  ];

  const getScale = (currentHeight: number) => {
    if (currentHeight > 788) {
      return currentHeight / 788;
    } else {
      return 1;
    }
  };

  const formatDisplayPrice = (price: number | string): string => {
    switch (language) {
      case "ja":
        const priceNum = typeof price === "number" ? price : Number(price);
        // return formatToJapaneseYen(priceNum, true, false);
        return priceNum.toLocaleString();
        break;
      default:
        return typeof price === "number" ? price.toString() : price;
        break;
    }
  };

  const [scalePdf, setScalePdf] = useState(window.innerHeight / 788);

  useEffect(() => {
    const handleResize = () => {
      setScalePdf(getScale(window.innerHeight));
    };

    window.addEventListener("resize", handleResize);

    // コンポーネントのアンマウント時にイベントリスナーを削除
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const noteText = `見積No. 123456789012をご発注いただいた場合に限り適用となります。\n※上記は2021年9月15日までのご発注、16日までに商品を出荷させていただけた場合に限る今回限りの貴社向け特別価格となります。`;

  return (
    <>
      <div className={`${styles.pdf}`} style={{ transform: `scale(${scalePdf})` }}>
        <div className={`${styles.top_margin} w-full bg-[red]/[0]`}></div>
        <div className={`${styles.header_area} flex-center relative h-[6%] w-full bg-[aqua]/[0]`}>
          <h1 className={`${styles.header} font-semibold`}>御見積書</h1>
          <div
            className={`${styles.header_right} absolute right-0 top-0 flex h-full flex-col items-end justify-end bg-[yellow]/[0] text-[8px]`}
          >
            <span>No. 123456789012</span>
            <span>2021年9月6日</span>
          </div>
        </div>

        <div className={`${styles.detail_area} flex bg-[#dddddd00]`}>
          <div className={`${styles.detail_left_area} flex flex-col `}>
            <div className={`${styles.company_name_area} flex flex-col justify-end bg-[red]/[0]`}>
              <h3 className={`${styles.company_name} space-x-[6px] text-[9px] font-medium`}>
                <span>株式会社ジーエンス</span>
                <span>御中</span>
              </h3>
              <div className={`${styles.section_underline}`} />
            </div>

            <div className={`${styles.deal_detail_area} bg-[white]/[0]`}>
              <p className={`${styles.description} bg-[white]/[0]`}>御照会の件下記の通りお見積り申し上げます</p>
              <div className={`${styles.row_group_container} bg-[white]/[0]`}>
                {dealTitleArray.map((obj, index) => (
                  <div key={obj.jpTitle} className={`${styles.row_area} flex items-end`}>
                    <div className={`${styles.title} flex justify-between`}>
                      {obj.titleLetterArray.map((letter) => (
                        <span key={letter}>{letter}</span>
                      ))}
                    </div>
                    <div className={`${styles.deal_content}`}>
                      {obj.title === "deadline" && <span>当日出荷</span>}
                      {obj.title === "delivery_place" && <span>貴社指定場所</span>}
                      {obj.title === "payment_terms" && <span>従来通り</span>}
                      {obj.title === "expiration_date" && <span>2021年9月15日</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className={`${styles.total_amount_area} flex flex-col justify-end bg-[yellow]/[0]`}>
              <div className={`flex h-full w-full items-end`}>
                <div className={`text-[13px] ${styles.amount_title}`}>
                  {amountTitleArray.map((letter) => (
                    <span key={letter}>{letter}</span>
                  ))}
                </div>
                <div className={`text-[13px] ${styles.amount_content} flex items-end`}>
                  <span>￥6,000,000-</span>
                </div>
              </div>
              <div className={`${styles.section_underline}`} />
            </div>
          </div>

          <div className={`${styles.detail_right_area} flex flex-col bg-[#02f929]/[0]`}>
            <div className={`${styles.customer_detail_area} bg-[yellow]/[0]`}>
              <div className={`${styles.customer_info_area} flex flex-col`}>
                {logoSrc && (
                  <div className={`${styles.company_logo_area} flex items-end justify-start bg-[white]/[0]`}>
                    <div
                      className={`relative flex h-[90%] w-[50%] items-end justify-start bg-[yellow]/[0] ${styles.logo_container}`}
                    >
                      {/* <NextImage
                                src={logoSrc}
                                alt=""
                                className="h-full w-full object-contain object-bottom"
                                // width={}
                                fill
                                sizes="100px"
                              /> */}
                      <div className={`${styles.logo_img}`}></div>
                    </div>
                  </div>
                )}
                {!logoSrc && <div className="h-[10%] w-full"></div>}
                <div className={`${styles.company_name_area}`}>
                  <span className={`${styles.company_name} flex items-center`}>
                    <span className="mr-[1%] pt-[0.5%] text-[9px]">株式会社</span>
                    <span className="text-[12px]">トラスティファイ</span>
                  </span>
                </div>
                <div className={`${styles.user_info_area} flex flex-col`}>
                  <div className={`${styles.row_area}  flex items-end`}>
                    <span>マイクロスコープ事業部</span>
                  </div>
                  <div className={`${styles.row_area} flex items-center`}>
                    <div className={`min-w-[50%]`}>
                      <span className={``}>東京営業所</span>
                    </div>
                    <div className={`min-w-[50%]`}>
                      <span className={``}>斎藤礼司</span>
                    </div>
                  </div>
                  <div className={`${styles.address_area} flex`}>
                    <span className={`min-w-max`}>〒123-0024</span>
                    <div className={`flex flex-col pl-[5%]`}>
                      <span>東京都港区芝浦0-0-0</span>
                      <span>シーバンスX館</span>
                    </div>
                  </div>
                  <div className={`${styles.row_area} flex items-center`}>
                    <div className="flex h-full w-[50%] items-center">
                      <span>TEL</span>
                      <span className="pl-[6%]">03-6866-1611</span>
                    </div>
                    <div className={`flex h-full w-[50%] items-center`}>
                      <span>FAX</span>
                      <span className="pl-[6%]">03-6866-1611</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* <div
                className={`${styles.corporate_seal} absolute right-[6%] top-0 z-[0] rounded-md bg-[red]/[0.7]`}
              ></div> */}
              <div
                className={`${styles.corporate_seal_sample}  absolute right-[6%] top-0 z-[0] rounded-[4px] border-[2px] border-solid border-[red]/[0.7]`}
              >
                <div className={`${styles.text1}`}>株式会社</div>
                <div className={`${styles.text2}`}>トラステ</div>
                <div className={`${styles.text3}`}>ィファイ</div>
              </div>
            </div>

            <div className={`${styles.stamps_area} flex flex-row-reverse bg-[blue]/[0]`}>
              <div
                className={`${styles.stamps_outside_box} flex flex-row-reverse`}
                style={{ ...(Array(2).length > 0 && { width: `${(100 * Array(2).length) / 3}%` }) }}
              >
                {Array(2)
                  .fill(null)
                  .map((_, index) => (
                    <div key={index} className={`h-full w-full ${styles.stamp_box} flex-center`}>
                      {index === 0 && (
                        <div className="relative flex h-[25px] w-[25px] items-center justify-center rounded-full">
                          <NextImage
                            src={hankoSrc}
                            alt=""
                            className="h-full w-full object-contain"
                            // width={}
                            fill
                            sizes="25px"
                          />
                        </div>
                      )}
                      {/* {index === 1 && (
                                <div className="flex h-[25px] w-[25px] flex-col items-center justify-center rounded-full border border-solid border-[red] py-[10%] text-[8px] text-[red]">
                                  <div className="flex flex-col items-center leading-[1.3]">
                                    <span>伊</span>
                                    <span>藤</span>
                                  </div>
                                </div>
                              )} */}

                      {index === 1 && (
                        <div className="flex h-[25px] w-[25px] flex-col items-center justify-center rounded-full py-[10%] text-[8px]"></div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div role="grid" className={`${styles.table_area} bg-[red]/[0]`}>
          <div
            role="row"
            className={`${styles.table_header_row} flex bg-[red]/[0]`}
            // style={{ gridTemplateColumns: "65% 5% 12% 18%" }}
          >
            {Array(4)
              .fill(null)
              .map((_, index) => (
                <div
                  role="columnheader"
                  key={index}
                  className={`${styles.column_header} flex-center`}
                  style={{ gridColumnStart: index + 1 }}
                >
                  {index === 0 && (
                    <div className={`flex h-full w-[24%] items-center justify-between`}>
                      <span>品</span>
                      <span>名</span>
                    </div>
                  )}
                  {index === 1 && (
                    <div className={`flex-center h-full w-full`}>
                      <span>数量</span>
                    </div>
                  )}
                  {index === 2 && (
                    <div className={`flex-center h-full w-full`}>
                      <span>単価 (円)</span>
                    </div>
                  )}
                  {index === 3 && (
                    <div className={`flex-center h-full w-full`}>
                      <span>金額 (円)</span>
                    </div>
                  )}
                </div>
              ))}
          </div>

          <div role="row" className={`${styles.top_margin_row} `}>
            {/* {Object.keys(productsArray).map((key, index) => ( */}
            {columnHeaderTitleArray.map((key, index) => (
              <div
                key={key + index.toString() + "blank"}
                role="gridcell"
                className={`${styles.grid_cell} flex items-center `}
              ></div>
            ))}
          </div>

          <div
            role="rowgroup"
            className={`${styles.row_group_products_area} bg-[red]/[0]`}
            style={{
              ...(productsArray?.length > 0 && {
                // borderBottom: "0.6px solid #37352f",
                borderBottom: "0.1px solid #37352f",
                // minHeight: `${3.3 * productsArray.length + 1}%`,
                // minHeight: `${3.3 * productsArray.length}%`,
                // minHeight: `${3.5 * productsArray.length}%`,
                minHeight: `${3.9 * productsArray.length}%`,
                display: "grid",
                gridTemplateRows: "repeat(1fr)",

                // gridTemplateRows: `0.1fr repeat(1fr)`,
              }),
            }}
          >
            {productsArray?.length > 0 &&
              productsArray.map((obj: any, index: number) => {
                return (
                  <div
                    role="row"
                    key={obj.id}
                    style={{ gridRowStart: index + 1 }}
                    className={`${styles.row} flex items-center justify-between`}
                  >
                    {Object.keys(productsArray).map((key, index) => (
                      <div
                        role="gridcell"
                        key={key + index.toString()}
                        className={`${styles.grid_cell} ${
                          index === 0 ? `${styles.product_name_area}` : `${styles.qua_area}`
                        }`}
                      >
                        {index === 0 && (
                          <>
                            <div className={`${styles.product_name} w-[52%]`}>
                              <span>{obj.product_name}</span>
                              {/* {obj.product_name} */}
                            </div>
                            <div className={`${styles.outside_name} w-[48%]`}>
                              {obj.outside_name && <span>{obj.outside_name}</span>}
                            </div>
                          </>
                        )}
                        {index === 1 && <span>{obj.unit_quantity}</span>}
                        {index === 2 && <span>{formatDisplayPrice(obj.unit_price)}</span>}
                        {index === 3 && <span>{formatDisplayPrice(obj.amount)}</span>}
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>

          <div role="row" style={{ minHeight: `${3.9}%` }} className={`${styles.row_result}`}>
            {columnHeaderTitleArray.map((key, index) => (
              <div
                key={key + index.toString() + "amount"}
                role="gridcell"
                className={`${styles.grid_cell} flex items-center ${index === 0 ? `${styles.first}` : `${styles.end}`}`}
              >
                {index === 0 && <span>本体合計</span>}
                {index === 3 && <span>{formatDisplayPrice(6795000)}</span>}
              </div>
            ))}
          </div>

          <div role="row" style={{ minHeight: `${3.9}%` }} className={`${styles.row_result}`}>
            {columnHeaderTitleArray.map((key, index) => (
              <div
                key={key + index.toString() + "discount"}
                role="gridcell"
                className={`${styles.grid_cell} flex items-center ${index === 0 ? `${styles.first}` : `${styles.end}`}`}
              >
                {index === 0 && <span>出精値引</span>}
                {index === 3 && <span>-{formatDisplayPrice(795000)}</span>}
              </div>
            ))}
          </div>
          <div
            role="row"
            style={{
              height: `calc(${100 - 3.3 - 0.7 - 3.9 * productsArray.length - 3.9 - 3.9}%)`,
            }}
            className={`${styles.row_result} ${styles.row_margin_bottom}`}
          >
            {columnHeaderTitleArray.map((key, index) => (
              <div
                key={key + index.toString() + "margin-bottom"}
                role="gridcell"
                className={`${styles.grid_cell} flex ${
                  index === 0 ? `items-start justify-center pt-[5%]` : `items-center`
                }`}
              >
                {index === 0 && <span>以下余白</span>}
              </div>
            ))}
          </div>
        </div>

        <div role="row" className={`${styles.row_amount} w-full bg-[#09ff0000]`}>
          {columnHeaderTitleArray.map((key, index) => (
            <div
              key={key + index.toString() + "total-amount"}
              role="gridcell"
              className={`${styles.grid_cell} flex items-center ${index === 0 ? `${styles.first}` : `${styles.end}`}`}
            >
              {index === 0 && (
                <div className={`flex h-full w-[24%] items-center justify-between`}>
                  <span>合</span>
                  <span>計</span>
                </div>
              )}
              {index === 3 && <span>{formatDisplayPrice(6000000)}</span>}
            </div>
          ))}
        </div>

        <div className={`${styles.notes_area} w-full bg-[#00eeff00]`}>
          <p className={`${styles.notes_content}`} dangerouslySetInnerHTML={{ __html: noteText }}></p>
        </div>

        <div className={`${styles.remarks_area} bg-[green]/[0]`}>
          <p className={`${styles.remarks}`}>※記載価格には消費税等は含まれておりません。</p>
          <p className={`${styles.remarks}`}>
            ※当日出荷は弊社営業稼働日の14時までにご発注いただいた場合に対応させていただきます。
          </p>
          <div className={`${styles.page} flex-center`}>
            <div className={`flex h-full w-[5%] items-center justify-between`}>
              <span>1</span>
              <span>/</span>
              <span>1</span>
            </div>
          </div>
        </div>

        <div className={`${styles.bottom_margin} w-full bg-[red]/[0]`}></div>
      </div>
    </>
  );
};

export const PDFComponent = memo(PDFComponentMemo);
