import { Suspense, memo, useEffect, useRef, useState } from "react";
import styles from "./QuotationPreviewModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { MdLocalPrintshop } from "react-icons/md";
import { FiDownload } from "react-icons/fi";
import { IoChevronForward } from "react-icons/io5";
import { format } from "date-fns";
import useStore from "@/store";
import axios from "axios";
import { toast } from "react-toastify";
import NextImage from "next/image";
// import NextImage from "next/legacy/image";
import { jsPDF } from "jspdf";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { PDFComponent } from "./PDFComponent";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";

const FallbackPreview = () => {
  return <SpinnerComet w="56px" h="56px" s="5px" />;
};

const QuotationPreviewModalMemo = () => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const isOpenQuotationPreviewModal = useDashboardStore((state) => state.isOpenQuotationPreviewModal);
  const setIsOpenQuotationPreviewModal = useDashboardStore((state) => state.setIsOpenQuotationPreviewModal);
  const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);

  const gridTableRef = useRef<HTMLDivElement | null>(null);

  // -------------------------- 🌟ツールチップ🌟 --------------------------
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    content3,
    marginTop = 0,
    // itemsPosition = "start",
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
      content3: content3,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPos(null);
  };
  // -------------------------- ✅ツールチップ✅ --------------------------

  const pdfTargetRef = useRef<HTMLDivElement | null>(null);
  // const [isLoadingPDF, setIsLoadingPDF] = useState(true);
  const [isLoadingPDF, setIsLoadingPDF] = useState(false);
  const [pdfURL, setPdfURL] = useState<string | null>(null);

  // 会社ロゴのフルURLを取得
  // const { fullUrl: logoUrl, isLoading: isLoadingLogoImg } = useDownloadUrl(
  //   userProfileState?.logo_url,
  //   "customer_company_logos"
  // );

  // -------------------------- 🌟初回マウント時🌟 --------------------------
  // useEffect(() => {
  //   if (!isLoadingPDF) return;
  //   console.log("useEffect実行");
  //   setTimeout(() => {
  //     setIsLoadingPDF(false);
  //     if (pdfTargetRef.current) {
  //       pdfTargetRef.current.classList.add(styles.mounted);
  //       console.log("タイマー関数 mounted追加");
  //     }
  //   }, 1500);
  // }, []);

  // -------------------------- 🌟モーダルを閉じる関数🌟 --------------------------
  const handleClosePreviewModal = () => {
    if (pdfURL) {
      URL.revokeObjectURL(pdfURL);
    }
    setIsOpenQuotationPreviewModal(false);
  };

  // window.open(fileURL, '_blank')

  // PDFファイルのダウンロード
  const handleDownloadPDF = () => {
    if (!selectedRowDataQuotation) return;
    if (!pdfURL) return alert("prfファイルが取得できませんでした。");
    const title = selectedRowDataQuotation?.quotation_title;
    const companyName = selectedRowDataQuotation.company_name;
    const currentDate = format(new Date(), "yyMMddHHmmss");
    const fileName = title ? `${title}.pdf` : `見積書_${companyName}_${currentDate}.pdf`;
    console.log("currentDate", currentDate, "fileName", fileName);
    // return;

    // 新しい a タグを作成
    const link = document.createElement("a");
    link.href = pdfURL;
    link.download = fileName;

    // body に追加してクリックイベントを発火
    document.body.appendChild(link);
    link.click();

    // 不要になった a タグを削除
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    setIsLoadingPDF(true);

    setTimeout(() => {
      setIsLoadingPDF(false);
    }, 1500);
  };

  // Webページ上で直接プリントアウト window.print()

  console.log("🌠PDFプレビューモーダル レンダリング pdfURL", pdfURL);

  const dealTitleArray = [
    { title: "納期", titleLetterArray: ["納", "期"] },
    { title: "受渡場所", titleLetterArray: ["受", "渡", "場", "所"] },
    { title: "取引方法", titleLetterArray: ["取", "引", "方", "法"] },
    { title: "有効期限", titleLetterArray: ["有", "効", "期", "限"] },
  ];

  const amountTitleArray = ["合", "計", "金", "額"];

  const logoSrc = "/assets/images/Trustify_logo_white1.png";
  // const logoSrc =
  //   theme === "light" ? "/assets/images/Trustify_logo_white1.png" : "/assets/images/Trustify_logo_black.png";

  const productsArray = [
    {
      id: "1-1",
      product_name: "画像寸法測定器",
      outside_name: "IM-8000/8030T",
      unit_quantity: 1,
      unit_price: 6295000,
      amount: 6295000,
    },
    {
      id: "2-1",
      product_name: "画像寸法測定器",
      outside_name: "IM-8000/8030T",
      unit_quantity: 1,
      unit_price: 6295000,
      amount: 6295000,
    },
    {
      id: "3-1",
      product_name: "画像寸法測定器",
      outside_name: "IM-8000/8030T",
      unit_quantity: 1,
      unit_price: 6295000,
      amount: 6295000,
    },
    {
      id: "4-1",
      product_name: "画像寸法測定器",
      outside_name: "IM-8000/8030T",
      unit_quantity: 1,
      unit_price: 6295000,
      amount: 6295000,
    },
  ];

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

  const getScale = (currentHeight: number) => {
    if (currentHeight > 788) {
      return currentHeight / 788;
    } else {
      return 1;
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

  return (
    <>
      {/* オーバーレイ */}
      <div className={`${styles.overlay} fade03`} onClick={handleClosePreviewModal}></div>
      {/* Suspenseとfallbackとローディングを使用する */}
      {/* プレビューモーダルエリア */}
      <div className={`${styles.preview_modal_area}`}>
        {/* プレビューモーダル */}
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackPreview />}>
            <div
              // className={`${styles.preview_modal_iframe} ${isLoadingPDF || !pdfURL ? `${styles.loading_pdf}` : ``} `}
              // className={`${styles.preview_modal} ${isLoadingPDF || !pdfURL ? `${styles.loading_pdf}` : ``} `}
              className={`${styles.preview_modal} ${isLoadingPDF ? `${styles.loading_pdf}` : ``} `}
            >
              {/* ---------------------- iframe PDFプレビューエリア ---------------------- */}
              {/* {!isLoadingPDF && pdfURL && <iframe id="pdf-iframe" src={pdfURL || ""} className={`h-full w-full `} />} */}
              {/* {!isLoadingPDF && pdfURL && <PDFComponent />} */}
              <div ref={pdfTargetRef} className={`${styles.pdf}`} style={{ transform: `scale(${scalePdf})` }}>
                <div className={`${styles.top_margin} w-full bg-[red]/[0.1]`}></div>
                <div className={`${styles.header_area} flex-center relative h-[6%] w-full bg-[aqua]/[0]`}>
                  <h1 className={`${styles.header} font-semibold`}>御見積書</h1>
                  <div
                    className={`${styles.header_right} absolute right-0 top-0 flex h-full flex-col items-end justify-end bg-[yellow]/[0] text-[8px]`}
                  >
                    <span>No. 123456789123</span>
                    <span>2021年9月6日</span>
                  </div>
                </div>

                <div className={`${styles.detail_area} flex bg-[#dddddd00]`}>
                  <div className={`${styles.detail_left_area} flex flex-col `}>
                    <div className={`${styles.company_name_area} flex flex-col justify-end bg-[red]/[0]`}>
                      <h3 className={`${styles.company_name} space-x-[6px] text-[9px] font-medium`}>
                        <span>岳石電気株式会社</span>
                        <span>御中</span>
                      </h3>
                      <div className={`${styles.section_underline}`} />
                    </div>

                    <div className={`${styles.deal_detail_area} bg-[white]/[0]`}>
                      <p className={`${styles.description} bg-[white]/[0]`}>御照会の件下記の通りお見積り申し上げます</p>
                      <div className={`${styles.row_group_container} bg-[white]/[0]`}>
                        {dealTitleArray.map((obj, index) => (
                          <div key={obj.title} className={`${styles.row_area} flex items-end`}>
                            <div className={`${styles.title} flex justify-between`}>
                              {obj.titleLetterArray.map((letter) => (
                                <span key={letter}>{letter}</span>
                              ))}
                            </div>
                            <div className={`${styles.deal_content}`}>
                              <span>当日出荷</span>
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
                              <NextImage
                                src={logoSrc}
                                alt=""
                                className="h-full w-full object-contain"
                                // width={}
                                fill
                                sizes="100px"
                              />
                            </div>
                          </div>
                        )}
                        {!logoSrc && <div className="h-[10%] w-full"></div>}
                        <div className={`${styles.company_name_area}`}>
                          <span className={`${styles.company_name} flex items-center`}>
                            <span className="mr-[1%] text-[9px]">株式会社</span>
                            <span className="text-[12px]">トラスティファイ</span>
                          </span>
                        </div>
                        <div className={`${styles.user_info_area} flex flex-col`}>
                          <div className={`${styles.row_area}  flex items-end`}>
                            <span>メトロロジ事業部</span>
                          </div>
                          <div className={`${styles.row_area} flex items-center`}>
                            <div className={`min-w-[50%]`}>
                              <span className={``}>東京営業所</span>
                            </div>
                            <div className={`min-w-[50%]`}>
                              <span className={``}>伊藤謙太</span>
                            </div>
                          </div>
                          <div className={`${styles.address_area} flex`}>
                            <span className={`min-w-max`}>〒105-0023</span>
                            <div className={`flex flex-col pl-[5%]`}>
                              <span>東京都港区芝浦1-2-1</span>
                              <span>シーバンスN館</span>
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
                      <div
                        className={`${styles.corporate_seal} absolute right-[6%] top-0 z-[0] rounded-md bg-[red]/[0.7]`}
                      ></div>
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
                                <div className="flex h-[25px] w-[25px] flex-col items-center justify-center rounded-full border border-solid border-[red] py-[10%] text-[8px] text-[red]">
                                  <div className="flex flex-col items-center leading-[1.3]">
                                    <span>伊</span>
                                    <span>藤</span>
                                  </div>
                                </div>
                              )}
                              {index === 1 && (
                                <div className="flex h-[25px] w-[25px] flex-col items-center justify-center rounded-full py-[10%] text-[8px] text-[red]"></div>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div role="grid" ref={gridTableRef} className={`${styles.table_area} bg-[red]/[0]`}>
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

                  <div role="row" className={`${styles.top_margin_row} flex items-center justify-between`}>
                    {Object.keys(productsArray).map((key, index) => (
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
                        borderBottom: "0.3px solid #37352f",
                        // minHeight: `${3.3 * productsArray.length + 1}%`,
                        minHeight: `${3.3 * productsArray.length}%`,
                        display: "grid",
                        gridTemplateRows: "repeat(1fr)",
                        // gridTemplateRows: `0.1fr repeat(1fr)`,
                      }),
                    }}
                  >
                    {/* <div
                      role="row"
                      style={{ gridRowStart: 1 }}
                      className={`${styles.row} ${styles.blank} flex items-center justify-between`}
                    >
                      {Object.keys(productsArray).map((key, index) => (
                        <div
                          key={key + index.toString() + "blank"}
                          role="gridcell"
                          className={`${styles.grid_cell} flex items-center `}
                        ></div>
                      ))}
                    </div> */}
                    {productsArray?.length > 0 &&
                      productsArray.map((obj, index) => {
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
                                className={`${styles.grid_cell} flex items-center ${
                                  index === 0 ? `${styles.product_name_area}` : `justify-end ${styles.qua_area}`
                                }`}
                              >
                                {index === 0 && (
                                  <>
                                    <div
                                      className={`${styles.product_name} ${
                                        obj.outside_name ? `w-[52%]` : `w-full`
                                      } flex items-center bg-[yellow]/[0]`}
                                    >
                                      {/* <span>{obj.product_name}</span> */}
                                      {obj.product_name}
                                    </div>
                                    {obj.outside_name && (
                                      <div
                                        className={`${styles.outside_name} flex w-[48%] items-center bg-[green]/[0]`}
                                      >
                                        {/* <span>{obj.outside_name}</span> */}
                                        {obj.outside_name}
                                      </div>
                                    )}
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
                </div>

                <div className={`${styles.remarks_area} bg-[green]/[0.1]`}></div>

                <div className={`${styles.bottom_margin} w-full bg-[red]/[0.1]`}></div>
              </div>
              {isLoadingPDF && !pdfURL && <SpinnerComet w="56px" h="56px" s="5px" />}
              {/* ---------------------- iframe PDFプレビューエリア ここまで ---------------------- */}
              {/* ---------------------- ボタンエリア ---------------------- */}
              {/* 閉じるボタン */}
              <div
                className={`flex-center transition-bg01 fixed right-[-56px] top-[5px] z-[3000] ${styles.btn} ${
                  isLoadingPDF ? `` : `${styles.mounted}`
                }`}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "bottom",
                    content: `閉じる`,
                    // marginTop: 28,
                    itemsPosition: "center",
                  })
                }
                onMouseLeave={handleCloseTooltip}
                onClick={handleClosePreviewModal}
              >
                <IoChevronForward className={`pointer-events-none text-[20px] text-[#fff]`} />
              </div>
              {/* ダウンロードボタン */}
              <div
                className={`flex-center transition-bg01 fixed right-[-56px] top-[55px] z-[3000] ${styles.btn} ${
                  isLoadingPDF ? `` : `${styles.mounted}`
                }`}
                onClick={handleDownloadPDF}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `ダウンロード`,
                    // marginTop: 28,
                    itemsPosition: "center",
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
                <FiDownload className={`pointer-events-none text-[19px] text-[#fff]`} />
                {/* <a href={pdfURL} download={`見積書.pdf`}>ダウンロード</a> */}
              </div>
              {/* プリントボタン */}
              <div
                className={`flex-center transition-bg01 fixed right-[-56px] top-[105px] z-[3000] ${styles.btn} ${
                  isLoadingPDF ? `` : `${styles.mounted}`
                }`}
                onClick={handlePrint}
                onMouseEnter={(e) =>
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: `印刷`,
                    // marginTop: 28,
                    itemsPosition: "center",
                  })
                }
                onMouseLeave={handleCloseTooltip}
              >
                <MdLocalPrintshop className={`pointer-events-none text-[21px] text-[#fff]`} />
              </div>
              {/* ---------------------- ボタンエリア ここまで ---------------------- */}
            </div>
          </Suspense>
        </ErrorBoundary>
        {/* <FallbackPreview /> */}
      </div>
    </>
  );
};

export const QuotationPreviewModal = memo(QuotationPreviewModalMemo);

// -------------------------------- jsPDFの実装 --------------------------------
// // 初回マウント時にpdfデータをフェッチ
// useEffect(() => {
//   if (!selectedRowDataQuotation) return;
//   if (pdfURL) return;
//   // 見積もりデータが取得された後にpdfを生成する
//   const loadPDF = async () => {
//     if (!selectedRowDataQuotation) return;
//     setIsLoadingPDF(true);
//     try {
//       const quotation = selectedRowDataQuotation;

//       console.log("🌟useEffect axios.post実行");

//       const response = await axios.post(`/api/documents/fonts/encode-font`, {}, {});

//       if (!response.data) throw new Error("日本語フォントの読み込みに失敗しました。");

//       // フォントファイルのバイナリデータをBase64文字列形式にエンコードしたフォントデータを取得
//       // const { base64RegularFont, base64SemiBoldFont, base64BoldFont } = response.data;
//       const { base64SemiBoldFont } = response.data;

//       // クライアントサイドでPDFのインスタンスを作成
//       const doc = new jsPDF();

//       console.log("response.data", response.data);

//       // VFSにフォントファイルを追加
//       // APIから受け取ったbase64文字列型式のフォントデータをjsPDFのVFSに追加
//       // doc.addFileToVFS("NotoSerifJP-Regular.otf", base64RegularFont);
//       // doc.addFileToVFS("NotoSerifJP-SemiBold.otf", base64SemiBoldFont);
//       // doc.addFileToVFS("NotoSerifJP-Bold.otf", base64BoldFont);
//       doc.addFileToVFS("NotoSansJP-Regular.ttf.ttf", base64SemiBoldFont);

//       // console.log("doc.getFileFromVFS()", doc.getFileFromVFS("NotoSerifJP-SemiBold.otf"));
//       console.log("doc", doc);
//       // console.log("doc.vfs", doc.vfs);

//       // // フォントを登録
//       // doc.addFont("NotoSerifJP-Regular.otf", "NotoSerifJP", "normal");
//       doc.addFont("NotoSerifJP-SemiBold.otf", "NotoSerifJP", "semibold");
//       // doc.addFont("NotoSerifJP-Bold.otf", "NotoSerifJP", "bold");

//       console.log("doc.getFont()", doc.getFont());
//       console.log("doc.getFontList()", doc.getFontList());

//       // console.log("doc.getFileFromVFS()", doc.getFileFromVFS("NotoSerifJP-SemiBold.otf"));

//       // // 使用するフォントを設定
//       doc.setFont("NotoSerifJP", "semibold");

//       // PDFの作成
//       // ヘッダーの追加
//       // doc.setFontSize(16);
//       // doc.text(quotation.quotation_title ?? "見積もりタイトル", 20, 20);
//       // doc.setFontSize(12);
//       // doc.text(
//       //   `見積日付: ${
//       //     quotation.quotation_date ? format(new Date(quotation.quotation_date), "yyyy年MM月dd日") : "見積日付"
//       //   }`,
//       //   20,
//       //   30
//       // );
//       // if (quotation.quotation_no_custom) {
//       //   doc.text(`見積番号: ${quotation.quotation_no_custom ?? "見積番号"}`, 20, 40);
//       // } else {
//       //   doc.text(`見積番号: ${quotation.quotation_no_system ?? "見積番号"}`, 20, 40);
//       // }
//       // doc.text(`相手先: ${quotation.company_name ?? "相手先"}`, 20, 50);

//       // // ロゴ画像 axiosを使用してロゴ画像データをblob形式で取得
//       // // try {
//       // //   let blobLogo: Blob | null = null;
//       // //   if (logoUrl) {
//       // //     const responseLogo = await axios.get(logoUrl, { responseType: "blob" });
//       // //     blobLogo = responseLogo.data ?? null;
//       // //   }

//       // //   // BlobをBase64エンコードされた文字列に変換
//       // //   if (!!blobLogo) {
//       // //     const logo = await new Promise((resolve) => {
//       // //       const reader = new FileReader();
//       // //       // FileReaderのonloadendイベントハンドラの設定 FileReaderがデータの読み込みを完了したときに発火し、resolve関数を呼び出してPromiseを解決する。reader.resultには読み込まれたデータの内容(今回はBase64エンコードされた画像データ)が含まれている
//       // //       reader.onloadend = () => resolve(reader.result);
//       // //       reader.readAsDataURL(blobLogo as Blob);
//       // //     });
//       // //     if (!logo) throw new Error("ロゴ画像の読み込みに失敗しました。");

//       // //     // ロゴ画像の描画 *1
//       // //     doc.addImage(logo as string, "PNG", 20, 20, 50, 50);
//       // //   }
//       // // } catch (errorLogo: any) {
//       // //   console.error("画像の取得に失敗しました。", errorLogo);
//       // //   throw new Error("ロゴ画像の取得に失敗しました。");
//       // // }

//       // // 商品リストの配置
//       // let startY = 60;
//       // doc.text("商品リスト", 20, startY);
//       // startY += 10;
//       // if (quotation?.quotation_products_details && quotation.quotation_products_details.length > 0) {
//       //   quotation.quotation_products_details.forEach((item, index) => {
//       //     doc.text(`${item.quotation_product_name ?? "商品名"}`, 20, startY + index * 10);
//       //     // doc.text(`${item.quotation_product_outside_short_name}`, 60, startY + index * 10);
//       //     // doc.text(`${item.unitPrice}円`, 90, startY + index * 10);
//       //     // doc.text(`${item.quantity}個`, 120, startY + index * 10);
//       //     // doc.text(`${item.totalPrice}円`, 150, startY + index * 10);
//       //     // doc.line(20, startY + index * 10 + 2, 180, startY + index * 10 + 2); // 商品毎の線
//       //     doc.text(`${item.quotation_product_unit_price ?? 0}円`, 60, startY + index * 10);
//       //     doc.text(`${item.quotation_product_quantity ?? 0}個`, 100, startY + index * 10);
//       //     doc.text(
//       //       `${(item.quotation_product_unit_price ?? 0) * (item.quotation_product_quantity ?? 0)}円`,
//       //       140,
//       //       startY + index * 10
//       //     );
//       //     doc.line(20, startY + index * 10 + 2, 180, startY + index * 10 + 2); // 商品毎の線
//       //   });
//       // }

//       // // 合計金額と有効期限
//       // startY += quotation.quotation_products_details.length * 10 + 10;
//       // doc.text(`合計金額: ${quotation.total_amount}円`, 20, startY);
//       // doc.text(
//       //   `有効期限: ${
//       //     quotation.expiration_date ? format(new Date(quotation.expiration_date), "yyyy年MM月dd日") : "有効期限"
//       //   }`,
//       //   20,
//       //   startY + 10
//       // );

//       // // 備考欄
//       // doc.text("備考:", 20, startY + 20);
//       // doc.text(quotation.quotation_notes ?? "備考", 20, startY + 30);

//       // シンプルなテキストを追加
//       // doc.text("こんにちは、これはテストのPDFです。", 10, 10);

//       // ユーザーにPDFをダウンロードさせる
//       // doc.save("test.pdf");

//       // // PDFの保存（ダウンロードや表示に使用）
//       // const pdfOutput = doc.output("blob");

//       // console.log("pdfOutput", pdfOutput);

//       // // 一時的な URL を生成
//       // const _pdfUrl = URL.createObjectURL(pdfOutput);
//       // console.log("🌟一時的なURL _pdfUrl", _pdfUrl);

//       // setPdfURL(_pdfUrl);

//       // setPdfURL(fileURL);
//     } catch (error: any) {
//       console.error("PDFの取得に失敗しました:", error);
//       toast.error(`PDFの取得エラー：${error.message}`);
//     }
//     setIsLoadingPDF(false);
//   };

//   loadPDF();

//   // Blob URLのクリーンアップ
//   return () => {
//     if (pdfURL) {
//       console.log("🌠クリーンアップ URL.revokeObjectURL()実行して解放");
//       URL.revokeObjectURL(pdfURL);
//     }
//   };
// }, [selectedRowDataQuotation, setPdfURL, setIsLoadingPDF, pdfURL]);
// -------------------------------- jsPDFの実装 ここまで --------------------------------

// -------------------------------- pdf-libの実装 --------------------------------

// useEffect(() => {
//   if (!selectedRowDataQuotation) return;
//   if (pdfURL) return;
//   // 見積もりデータが取得された後にpdfを生成する
//   const loadPDF = async () => {
//     setIsLoadingPDF(true);
//     try {
//       const axiosPayload = {
//         selectedQuotation: selectedRowDataQuotation,
//       };

//       console.log("🌟useEffect axios.post実行 axiosPayload", axiosPayload);

//       const response = await axios.post(`/api/documents/pdf/create-pdf-quotation`, axiosPayload, {
//         responseType: "blob", // PDFデータをBlobとして受け取る
//       });

//       console.log("🌟axios.post成功 response", response);

//       const blob = new Blob([response.data], { type: "application/pdf" });
//       console.log("🌟blob", blob);
//       const fileURL = URL.createObjectURL(blob);
//       console.log("🌟fileURL", fileURL);
//       setPdfURL(fileURL);
//     } catch (error: any) {
//       console.error("PDFの取得に失敗しました:", error);
//       toast.error("PDFの取得に失敗しました...🙇‍♀️");
//     }
//     setIsLoadingPDF(false);
//   };

//   loadPDF();

//   // Blob URLのクリーンアップ
//   return () => {
//     if (pdfURL) {
//       console.log("🌠クリーンアップ URL.revokeObjectURL()実行して解放");
//       URL.revokeObjectURL(pdfURL);
//     }
//   };
// }, [selectedRowDataQuotation, setPdfURL, setIsLoadingPDF, pdfURL]);

/*
*1
imageData：画像のデータ。これはBase64エンコードされた文字列、URL、HTMLの<canvas>要素、またはUint8Array形式のバイナリデータであることができます。
format：画像のフォーマット。一般的なフォーマットには'PNG'、'JPG'、'JPEG'などがあります。
x、y：画像を配置するPDFページ上のx座標とy座標（通常はポイント単位）。
width、height：画像の幅と高さ。指定しない場合は画像の元のサイズが使用されますが、指定することで画像のサイズを調整できます。
*/
