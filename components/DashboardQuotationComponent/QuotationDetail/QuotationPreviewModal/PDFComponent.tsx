import { memo, useEffect, useRef, useState } from "react";
import styles from "./QuotationPreviewForProfile.module.css";
import NextImage from "next/image";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";
import { splitCompanyNameWithPosition } from "@/utils/Helpers/splitCompanyName";
import { ImInfo } from "react-icons/im";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";

type Props = {
  isSample: boolean;
  modalPosLeft?: number | undefined;
};

const PDFComponentMemo = ({ isSample = true, modalPosLeft }: Props) => {
  const language = useStore((state) => state.language);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  const infoIconRef = useRef<HTMLDivElement | null>(null);

  const _logoUrl = !isSample ? userProfileState?.logo_url ?? null : null;
  const userStampUrl = !isSample ? userProfileState?.assigned_signature_stamp_url ?? null : null;
  const _corporateSealUrl = !isSample ? userProfileState?.customer_seal_url ?? null : null;
  const departmentName = userProfileState?.assigned_department_name ?? null;
  const officeName = userProfileState?.assigned_office_name ?? null;

  // const { fullUrl: logoUrl, isLoading: isLoadingLogo } = useDownloadUrl(_logoUrl, "customer_company_logos");
  // const { fullUrl: stampUrl, isLoading: isLoadingStamp } = useDownloadUrl(userStampUrl, "signature_stamps");
  // const { fullUrl: corporateSealUrl, isLoading: isLoadingCorporateSeal } = useDownloadUrl(
  //   _corporateSealUrl,
  //   "company_seals"
  // );
  // 🔹会社ロゴ画像URL まだオブジェクトURLが格納されていない場合はisEnabledがtrueになり、既に存在する場合はfalseでフェッチをしない
  const companyLogoImgURL = useDashboardStore((state) => state.companyLogoImgURL);
  const setCompanyLogoImgURL = useDashboardStore((state) => state.setCompanyLogoImgURL);
  const { isLoading: isLoadingLogo } = useDownloadUrl(_logoUrl, "customer_company_logos");
  // 🔹印鑑データ画像URL 印鑑データの画像オブジェクトURLはプロフィール画面で生成してZustandに格納ずみなのでdownloadは不要
  const myStampImgURL = useDashboardStore((state) => state.myStampImgURL);
  const setMyStampImgURL = useDashboardStore((state) => state.setMyStampImgURL);
  const { isLoading: isLoadingStamp } = useDownloadUrl(userStampUrl, "signature_stamps");
  // 🔹角印画像URL
  const companySealImgURL = useDashboardStore((state) => state.companySealImgURL);
  const setCompanySealImgURL = useDashboardStore((state) => state.setCompanySealImgURL);
  // const { fullUrl: stampUrl, isLoading: isLoadingStamp } = useDownloadUrl(userStampUrl, "signature_stamps");
  const { isLoading: isLoadingCorporateSeal } = useDownloadUrl(_corporateSealUrl, "company_seals");

  // 見積書プレビューアンマウント時にリソースを解放
  // useEffect(() => {
  //   return () => {
  //     // 印鑑データ
  //     if (myStampImgURL) {
  //       URL.revokeObjectURL(myStampImgURL);
  //       setMyStampImgURL(null);
  //     }
  //     // 会社ロゴ
  //     if (companyLogoImgURL) {
  //       URL.revokeObjectURL(companyLogoImgURL);
  //       setCompanyLogoImgURL(null);
  //     }
  //     // 角印・社印
  //     if (companySealImgURL) {
  //       URL.revokeObjectURL(companySealImgURL);
  //       setCompanySealImgURL(null);
  //     }
  //   };
  // }, []);

  console.log(
    "PDFComponent",
    PDFComponent,
    "companyLogoImgURL",
    companyLogoImgURL,
    "myStampImgURL",
    myStampImgURL,
    "companySealImgURL",
    companySealImgURL
  );

  // アンマウント時にObjectURLをリソース解放 会社ロゴ画像と角印画像URLはプロフィール画面で使用しないため、ここでリソース解放
  // アカウント設定モーダルのアンマウント時にリソースを解放
  // useEffect(() => {
  //   return () => {
  //     // 会社ロゴ画像と角印はここでリソース解放
  //     if (companyLogoImgURL) {
  //       URL.revokeObjectURL(companyLogoImgURL);
  //       setCompanyLogoImgURL(null);
  //     }
  //     if (companySealImgURL) {
  //       URL.revokeObjectURL(companySealImgURL);
  //       setCompanySealImgURL(null);
  //     }
  //   };
  // }, []);

  const notesText = `上記は2021年9月15日の午前中までにご発注いただいた場合に限る貴社向け今回限り特別価格となります。\n御値引きの口外は厳禁にてお願い申し上げます。`;

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

  const initialAddress = userProfileState?.customer_address ?? "";
  const [address, setAddress] = useState(initialAddress.split(" ")[0] ?? "");

  // 初回マウント時に住所を建物名の前に空白か\nを付けてaddressに格納する
  const addressLineRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (isSample) return;
    if (!address) return;
    if (!addressLineRef.current) return;

    console.log("変更前address", address);
    const addressEl = addressLineRef.current;

    // const splitAddressArray = sampleAddress.split(" ");
    const splitAddressArray = initialAddress.split(" ");

    // 建物名が存在しない場合はpre-wrapに変更してリターン
    if (!splitAddressArray[1]) {
      addressEl.style.whiteSpace = "pre-wrap";
      return;
    }

    let addressWithBuilding;
    // 建物なしの住所がaddress_lineクラスのdivタグの表示可能領域を超えている場合は、
    // white-spaceをpre-wrapに変更して「空白+建物名」で住所に結合
    if (addressEl.scrollWidth > addressEl.offsetWidth) {
      addressWithBuilding = `${address} ${splitAddressArray[1]}`;
    }
    // 表示可能領域を超えていなければ、「\n+建物名」で住所に結合
    else {
      addressWithBuilding = `${address}\n${splitAddressArray[1]}`;
    }
    // pre-wrapに変更して新住所をstateに格納
    addressEl.style.whiteSpace = "pre-wrap";
    setAddress(addressWithBuilding);
  }, []);

  // 顧客の会社名 株式会社と会社名 scrollWidthがoffsetWidthを上回る文字数ならfontSizeを小さくする
  const customerNameRef = useRef<HTMLDivElement | null>(null);
  const companyNameRef = useRef<HTMLSpanElement | null>(null);
  const companyTypeRef = useRef<HTMLSpanElement | null>(null);
  // 顧客の会社名(株式会社の会社種類名と会社名で分割)
  const [customerNameObj, setCustomerNameObj] = useState<{
    companyType: string;
    company_name: string;
    typePosition: string;
  }>(
    userProfileState?.customer_name
      ? splitCompanyNameWithPosition(userProfileState.customer_name)
      : { companyType: "", company_name: userProfileState?.customer_name ?? "", typePosition: "" }
  );

  const productsArray: { [key: string]: any } = [
    {
      id: "1-1",
      product_name: "画像測定器",
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

  // -------------------------- 🌟ポップアップメニュー🌟 --------------------------
  const [openPopupMenu, setOpenPopupMenu] = useState<{
    x?: number;
    y: number;
    title: string;
    displayX?: string;
    maxWidth?: number;
  } | null>(null);
  const mappingPopupTitle: { [key: string]: { [key: string]: string } } = {
    notes: { en: "Notes", ja: "説明" },
  };
  type PopupMenuParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    title: string;
    displayX?: string;
    maxWidth?: number;
  };
  const handleOpenPopupMenu = ({ e, title, displayX, maxWidth }: PopupMenuParams) => {
    if (!displayX) {
      const { y, height } = e.currentTarget.getBoundingClientRect();
      setOpenPopupMenu({
        y: y - height / 2,
        title: title,
      });
    } else {
      const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
      // right: 見積書の右端から-18px, アイコンサイズ35px, ポップアップメニュー400px
      // const positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : 106 + 30;

      const positionX = displayX === "right" ? -18 - 50 - (maxWidth ?? 400) : x - (modalPosLeft ?? 0) + width + 10;
      // -18 - 35 - openPopupMenu.width
      console.log(
        "title",
        title,
        "displayX",
        displayX,
        "positionX",
        positionX,
        "x",
        x,
        "width",
        width,
        "y",
        y,
        "height",
        height
      );
      setOpenPopupMenu({
        x: positionX,
        y: y - height * 2,
        title: title,
        displayX: displayX,
        maxWidth: maxWidth,
      });
    }
  };
  const handleClosePopupMenu = () => {
    setOpenPopupMenu(null);
  };
  // -------------------------- ✅ポップアップメニュー✅ --------------------------

  return (
    <>
      {(isLoadingLogo || isLoadingStamp || isLoadingCorporateSeal) && (
        <div className={`${styles.pdf} ${styles.loading}`} style={{ padding: "0px", backgroundColor: "#aaa" }}>
          <SkeletonLoadingLineCustom h="100%" w="100%" rounded="0px" />
        </div>
      )}
      {/* 説明ポップアップ */}
      {openPopupMenu && (
        <div
          className={`${styles.description_menu} shadow-all-md border-real-with-shadow pointer-events-none fixed right-[-18px] z-[3500] flex min-h-max flex-col rounded-[6px]`}
          style={{
            top: `${openPopupMenu.y}px`,
            ...(openPopupMenu?.displayX === "right" && {
              right: `${openPopupMenu.x}px`,
              maxWidth: `${openPopupMenu.maxWidth}px`,
            }),
            ...(openPopupMenu?.displayX === "left" && {
              left: `${openPopupMenu.x}px`,
              maxWidth: `${openPopupMenu.maxWidth}px`,
            }),
          }}
        >
          <div className={`min-h-max w-full font-bold ${styles.title}`}>
            <div className="flex max-w-max flex-col">
              <span>{mappingPopupTitle[openPopupMenu.title][language]}</span>
              <div className={`${styles.underline} w-full`} />
            </div>
          </div>

          <ul className={`flex flex-col rounded-[6px] ${styles.u_list}`}>
            <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
              <p className="select-none whitespace-pre-wrap text-[12px]">
                {openPopupMenu.title === "notes" &&
                  "プロフィール設定、会社・チーム設定画面での入力内容が「会社名、事業部、事業所、住所、電話番号、携帯、会社ロゴ、印鑑データ、法人印」に反映されます。\n会社名のサイズや脚注の内容などは実際の見積画面から編集が可能です。"}
              </p>
            </li>
          </ul>
        </div>
      )}
      {/* 説明ポップアップ */}
      {/* -------------------------------------------------------------------- */}
      {!isLoadingLogo && !isLoadingStamp && !isLoadingCorporateSeal && (
        <div
          // className={`${styles.pdf} ${isLoading ? `opacity-0` : ``}`}
          className={`${styles.pdf} quotation`}
          style={{ transform: `scale(${scalePdf})` }}
        >
          <div className={`${styles.left_margin} h-full w-full min-w-[4%] max-w-[4%]`}></div>
          <div className={`${styles.pdf_main_container} flex h-full w-full flex-col`}>
            {/* 見本スタンプ */}
            {isSample && (
              <div
                className={`flex-col-center absolute left-[20px] top-[15px] z-[50] h-[48px] w-[48px] rounded-[50%] border-[2px] border-solid border-[red]/[0.7] text-[13px] text-[red]/[0.7]`}
              >
                <div className={`${styles.text1}`}>見</div>
                <div className={`${styles.text2}`}>本</div>
              </div>
            )}
            {!isSample && (
              <div
                className={`flex-center absolute left-[20px] top-[20px] z-[50] rounded-[4px] border-[2px] border-solid border-[var(--color-bg-brand-f)] px-[10px] py-[6px] text-[13px] text-[var(--color-bg-brand-f)]`}
              >
                {/* <div className={`${styles.text1}`}>お客様用</div> */}
                <div className={`${styles.text1}`}>貴社専用</div>
                {/* <div className={`${styles.text2}`}>本</div> */}
              </div>
            )}
            {!isSample && (
              <div
                className={`flex-center absolute left-[106px] top-[30px] z-[50]`}
                onMouseEnter={(e) => {
                  if (infoIconRef.current && infoIconRef.current.classList.contains(styles.animate_ping)) {
                    infoIconRef.current.classList.remove(styles.animate_ping);
                  }
                  // handleOpenTooltip({
                  //   e: e,
                  //   display: "top",
                  //   content: `ダウンロード`,
                  //   // marginTop: 28,
                  //   itemsPosition: "center",
                  // });
                  handleOpenPopupMenu({ e, title: "notes", displayX: "left", maxWidth: 360 });
                }}
                onMouseLeave={() => {
                  // if (hoveredItemPos) handleCloseTooltip();
                  if (openPopupMenu) handleClosePopupMenu();
                }}
              >
                <div className="flex-center relative h-[16px] w-[16px] rounded-full">
                  <div
                    ref={infoIconRef}
                    className={`flex-center absolute left-0 top-0 h-[16px] w-[16px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                  ></div>
                  <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                </div>
              </div>
            )}
            {/* 説明ポップアップ */}
            {/* {openPopupMenu && (
              <div
                className={`${styles.description_menu} shadow-all-md border-real-with-shadow fixed right-[-18px] z-[3500] flex min-h-max flex-col rounded-[6px]`}
                style={{
                  top: `${openPopupMenu.y}px`,
                  ...(openPopupMenu?.displayX === "right" && {
                    right: `${openPopupMenu.x}px`,
                    maxWidth: `${openPopupMenu.maxWidth}px`,
                  }),
                  ...(openPopupMenu?.displayX === "left" && {
                    left: `${openPopupMenu.x}px`,
                    maxWidth: `${openPopupMenu.maxWidth}px`,
                  }),
                }}
              >
                <div className={`min-h-max w-full font-bold ${styles.title}`}>
                  <div className="flex max-w-max flex-col">
                    <span>{mappingPopupTitle[openPopupMenu.title][language]}</span>
                    <div className={`${styles.underline} w-full`} />
                  </div>
                </div>

                <ul className={`flex flex-col rounded-[6px] ${styles.u_list}`}>
                  <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1 `}>
                    <p className="select-none whitespace-pre-wrap text-[12px]">
                      {openPopupMenu.title === "notes" &&
                        "プロフィール設定、会社・チーム設定画面での入力内容が「会社名、事業部、事業所、住所、電話番号、携帯、会社ロゴ、印鑑データ、法人印」に反映されます。\n会社名のサイズや脚注の内容などは実際の見積画面から編集が可能です。"}
                    </p>
                  </li>
                </ul>
              </div>
            )} */}
            {/* 説明ポップアップ */}
            <div className={`${styles.top_margin} w-full bg-[red]/[0]`}></div>
            <div className={`${styles.header_area} flex-center relative h-[6%] w-full bg-[aqua]/[0]`}>
              <h1 className={`${styles.header} font-semibold`}>御見積書</h1>
              <div
                className={`${styles.header_right} absolute right-0 top-0 flex h-full flex-col items-end justify-end bg-[yellow]/[0] text-[8px]`}
              >
                <span>No. 123456789012</span>
                {/* {quotationNo && <span>No. {quotationNo}</span>} */}
                {/* {!quotationNo && <span className="min-w-[73px]">No. </span>} */}
                {/* {quotationNo ? <span>{quotationNo}</span> : <span className="min-h-[12px] w-full"></span>} */}
                <span>2021年9月6日</span>
                {/* {quotationDate && <span>{quotationDate}</span>} */}
                {/* {!quotationDate && <span className="min-h-[12px] w-full"></span>} */}
                {/* {quotationDate ? <span>{quotationDate}</span> : <span className="min-h-[12px] w-full"></span>} */}
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
                    {dealTitleArray.map((obj, index) => {
                      return (
                        <div key={obj.jpTitle} className={`${styles.row_area} flex items-end`}>
                          <div className={`${styles.title} flex justify-between`}>
                            {obj.titleLetterArray.map((letter) => (
                              <span key={letter}>{letter}</span>
                            ))}
                          </div>
                          <div className={`${styles.deal_content} truncate`}>
                            {obj.title === "deadline" && <span>当日出荷</span>}
                            {obj.title === "delivery_place" && <span>貴社指定場所</span>}
                            {obj.title === "payment_terms" && <span>従来通り</span>}
                            {obj.title === "expiration_date" && <span>2021年9月15日</span>}
                            {/* <span
                          >
                            {obj.state}
                          </span> */}
                          </div>
                        </div>
                      );
                    })}
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
                      {/* <span>￥6,000,000-</span> */}
                      {/* <span>{formatDisplayPrice(6645200)}-</span> */}
                      {/* <span>{formatDisplayPrice(6646800)}-</span> */}
                      {/* <span>¥{formatDisplayPrice(6636900)}-</span> */}
                      <span>{formatToJapaneseYen(6636900)}−</span>
                    </div>
                  </div>
                  <div className={`${styles.section_underline}`} />
                </div>
              </div>

              <div className={`${styles.detail_right_area} flex flex-col bg-[#02f929]/[0]`}>
                {/* ------------------------ customer_detail_area ------------------------ */}
                <div className={`${styles.customer_detail_area} bg-[yellow]/[0]`}>
                  {/* ------------ customer_info_area ------------ */}
                  <div className={`${styles.customer_info_area} flex flex-col`}>
                    <div className={`${styles.company_logo_area} flex items-end justify-start bg-[white]/[0]`}>
                      <div
                        // className={`relative flex h-[90%] w-[50%] items-end justify-start bg-[yellow]/[0] ${styles.logo_container}`}
                        className={`relative flex h-[100%] w-[56%] items-end justify-start bg-[yellow]/[0] ${styles.logo_container}`}
                      >
                        {/* <NextImage
                                src={logoSrc}
                                alt=""
                                className="h-full w-full object-contain object-bottom"
                                // width={}
                                fill
                                sizes="100px"
                              /> */}
                        {!isSample && companyLogoImgURL && (
                          <div
                            style={{ backgroundImage: `url(${companyLogoImgURL})` }}
                            className={`${styles.logo_img}`}
                          ></div>
                        )}
                        {isSample && <div className={`${styles.logo_img}`}></div>}
                      </div>
                    </div>
                    {/* {(!isPrintCompanyLogo || !companyLogoUrl) && <div className="h-[10%] w-full"></div>} */}
                    <div className={`${styles.company_name_area}`}>
                      <div
                        ref={customerNameRef}
                        className={`${styles.company_name} ${styles.resize} flex items-center`}
                      >
                        {isSample && (
                          <>
                            <span className={`mr-[1%] whitespace-nowrap pt-[0.5%] text-[9px]`}>株式会社</span>
                            <span className={`whitespace-nowrap text-[12px]`}>トラスティファイ</span>
                          </>
                        )}
                        {!isSample && customerNameObj && customerNameObj.typePosition === "pre" && (
                          <>
                            <span
                              ref={companyTypeRef}
                              className="mr-[1%] inline-block whitespace-nowrap pt-[0px] text-[9px]"
                            >
                              {customerNameObj.companyType}
                            </span>
                            <span ref={companyNameRef} className="inline-block whitespace-nowrap text-[12px]">
                              {customerNameObj.company_name}
                            </span>
                          </>
                        )}
                        {!isSample && customerNameObj && customerNameObj.typePosition === "post" && (
                          <>
                            <span ref={companyNameRef} className="whitespace-nowrap text-[12px]">
                              {customerNameObj.company_name}
                            </span>
                            <span ref={companyTypeRef} className="ml-[1%] whitespace-nowrap pt-[0px] text-[9px]">
                              {customerNameObj.companyType}
                            </span>
                          </>
                        )}
                        {/* <span ref={companyNameRef} className="text-[12px]">
                              トラスティファイ
                            </span>
                            <span ref={companyTypeRef} className="ml-[1%] text-[9px]">
                              株式会社
                            </span> */}
                      </div>
                    </div>
                    {/* ------------ user_info_area ------------ */}
                    <div className={`${styles.user_info_area} flex flex-col`}>
                      <div className={`${styles.row_area} ${styles.department_area}  flex items-end`}>
                        {isSample && <span className={``}>マイクロスコープ事業部</span>}
                        {!isSample && <span className={``}>{userProfileState?.assigned_department_name ?? ""}</span>}
                      </div>

                      <div className={`${styles.row_area} ${styles.office_name_area} flex items-center`}>
                        <div className={`min-w-[50%] max-w-[50%] truncate`}>
                          {isSample && <span className={``}>東京営業所</span>}
                          {!isSample && <span className={``}>{userProfileState?.assigned_office_name ?? ""}</span>}
                        </div>
                        <div className={`min-w-[50%]`}>
                          {isSample && <span className={``}>斎藤礼司</span>}
                          {!isSample && <span className={``}>{userProfileState?.profile_name ?? ""}</span>}
                        </div>
                      </div>
                      <div className={`${styles.address_area} flex`}>
                        {/* <span className={`min-w-max ${styles.zip_code}`}>〒123-0024</span> */}
                        {isSample && <span className={`max-w-[24%] ${styles.zip_code}`}>〒123-0024</span>}
                        {!isSample && (
                          <span className={`max-w-[24%] ${styles.zip_code}`}>
                            〒{userProfileState?.customer_zipcode ?? ""}
                          </span>
                        )}
                        <div
                          ref={addressLineRef}
                          style={{
                            ...(isSample && { whiteSpace: "pre-wrap", overflow: "hidden" }),
                            ...(!isSample && { whiteSpace: "nowrap", overflow: "hidden" }),
                          }}
                          className={`flex flex-col pl-[5%] ${styles.address_line}`}
                        >
                          {/* <span>{`東京都港区芝浦港区芝浦港区芝浦0-0-0 シーバンスX館`}</span> */}
                          {isSample && <span>{`東京都港区芝浦港区0-0-0\nシーバンスX館`}</span>}
                          {!isSample && <span>{address}</span>}
                          {/* <span>{address}</span> */}
                          {/* <span style={{ whiteSpace: "nowrap" }}>{sampleAddress}</span> */}
                          {/* {address} */}
                          {/* {sampleAddress} */}
                        </div>
                      </div>
                      <div className={`${styles.row_area} ${styles.contact_area} flex items-center`}>
                        <div className={`${styles.contact_item} flex w-[50%] items-center`}>
                          <span>TEL</span>
                          {isSample && <span className="pl-[6%]">03-1234-5678</span>}
                          {!isSample && <span className="pl-[6%]">{userProfileState?.direct_line ?? ""}</span>}
                        </div>
                        <div className={`${styles.contact_item} flex w-[50%] items-center`}>
                          <span>携帯</span>
                          {isSample && <span className="pl-[6%]">080-2345-6789</span>}
                          {!isSample && <span className="pl-[6%]">{userProfileState?.company_cell_phone ?? ""}</span>}
                        </div>
                      </div>
                      <div className={`${styles.under_margin}`}></div>
                    </div>
                    {/* ------------ user_info_areaここまで ------------ */}
                  </div>
                  {/* ------------ customer_info_areaここまで ------------ */}

                  {/* 角印・社印 */}
                  {isSample && (
                    <div
                      className={`${styles.corporate_seal_sample}  absolute right-[6%] top-0 z-[0] rounded-[4px] border-[2px] border-solid border-[red]/[0.7]`}
                    >
                      <div className={`${styles.text1}`}>株式会社</div>
                      <div className={`${styles.text2}`}>トラステ</div>
                      <div className={`${styles.text3}`}>ィファイ</div>
                    </div>
                  )}
                  {!isSample && companySealImgURL && (
                    <div className={`${styles.corporate_seal} absolute right-[6%] top-0 z-[0] rounded-[4px]`}>
                      <NextImage
                        src={companySealImgURL}
                        alt=""
                        className="h-full w-full object-contain"
                        // width={}
                        fill
                        sizes="25px"
                      />
                    </div>
                  )}
                  {/* 角印・社印 ここまで */}
                </div>

                {/* <div className={`${styles.stamps_area} flex flex-row-reverse bg-[blue]/[0]`}>
                <div
                  className={`${styles.stamps_outside_box} flex flex-row-reverse`}
                  style={{
                    ...(stampFrameDisplayCount > 0 && {
                      width: `${(100 * stampFrameDisplayCount) / 3}%`,
                    }),
                    ...(stampFrameDisplayCount === 0 && { display: "none" }),
                  }}
                >
                  {stampsArray.map((obj, index) => {
                    if (!obj.isFrame) return;
                    return (
                      <div
                        key={obj.title + index.toString()}
                        className={`h-full w-full ${styles.stamp_box} flex-center`}
                        // style={styleStampBox(index, stampFrameLength)}
                        // style={{ ...(scalePdf !== 1 && styleStampBox(index, stampFrameDisplayCount)) }}
                        style={{ ...(scalePdf === 1 && styleStampBox(index, stampFrameDisplayCount)) }}
                      >
                        {obj.isPrint && obj.url && (
                          <div className="relative flex h-[25px] w-[25px] items-center justify-center rounded-full">
                            <NextImage
                              src={obj.url}
                              alt=""
                              className="h-full w-full object-contain"
                              // width={}
                              fill
                              sizes="25px"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div> */}
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
                              {!isSample && myStampImgURL && (
                                <NextImage
                                  src={myStampImgURL}
                                  alt=""
                                  className="h-full w-full object-contain"
                                  // width={}
                                  fill
                                  sizes="25px"
                                />
                              )}
                              {isSample && (
                                <NextImage
                                  src={hankoSrc}
                                  alt=""
                                  className="h-full w-full object-contain"
                                  // width={}
                                  fill
                                  sizes="25px"
                                />
                              )}
                            </div>
                          )}

                          {index === 1 && (
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

                          {/* {index === 1 && (
                          <div className="flex h-[25px] w-[25px] flex-col items-center justify-center rounded-full py-[10%] text-[8px]"></div>
                        )} */}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
              {/* ------------------------ customer_detail_area ここまで ------------------------ */}
            </div>

            <div
              role="grid"
              // ref={gridTableRef}
              className={`${styles.table_area} bg-[red]/[0]`}
            >
              <div role="row" className={`${styles.table_header_row} flex bg-[red]/[0]`}>
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

              {productsArray?.length > 0 && (
                <div role="row" className={`${styles.top_margin_row} `}>
                  {columnHeaderTitleArray.map((key, index) => (
                    <div
                      key={key + index.toString() + "blank"}
                      role="gridcell"
                      className={`${styles.grid_cell} flex items-center `}
                    ></div>
                  ))}
                </div>
              )}

              {productsArray?.length > 0 && (
                <div
                  role="rowgroup"
                  className={`${styles.row_group_products_area} bg-[red]/[0]`}
                  style={{
                    ...(productsArray?.length > 0 && {
                      display: "grid",
                    }),
                  }}
                >
                  {productsArray?.length > 0 &&
                    productsArray.map((obj: { [key: string]: any }, rowIndex: number) => {
                      return (
                        <div
                          role="row"
                          key={obj.product_id + rowIndex.toString()}
                          style={{ gridRowStart: rowIndex + 1 }}
                          className={`${styles.row} flex items-center justify-between`}
                        >
                          {columnHeaderTitleArray.map((key, colIndex) => {
                            return (
                              <div
                                role="gridcell"
                                key={key + obj.product_id + colIndex.toString()}
                                className={`${styles.grid_cell} ${
                                  colIndex === 0 ? `${styles.product_name_area}` : `${styles.qua_area}`
                                }`}
                              >
                                {colIndex === 0 && (
                                  <>
                                    {/* {!!productNameArray.length &&
                                    productNameArray[rowIndex]?.map((value, nameIndex) => {
                                      console.log("value", value, "rowIndex", rowIndex);
                                      return (
                                        <div
                                          key={value + rowIndex.toString() + colIndex.toString() + nameIndex.toString()}
                                          className={`${
                                            value === "quotation_product_name" ? `${styles.product_name} ` : ``
                                          } ${
                                            value === "quotation_product_outside_short_name" ? styles.outside_name : ``
                                          } ${styles.draggable_item} ${
                                            nameIndex === 0 ? `w-[52%] pl-[8px]` : `w-[48%] pr-[8px]`
                                          }`}
                                        >
                                          {value === "quotation_product_name" && (
                                            <span>{obj.quotation_product_name}</span>
                                          )}
                                          {value === "quotation_product_outside_short_name" &&
                                            obj.quotation_product_outside_short_name && (
                                              <span>{obj.quotation_product_outside_short_name}</span>
                                            )}
                                          {value === "quotation_product_outside_short_name" &&
                                            !obj.quotation_product_outside_short_name && (
                                              <span className="inline-block min-h-[5px] min-w-[55px]"></span>
                                            )}
                                        </div>
                                      );
                                    })} */}

                                    <div className={`${styles.product_name} ${styles.draggable_item} w-[52%] pl-[8px]`}>
                                      <span>{obj.product_name}</span>
                                    </div>
                                    <div
                                      draggable
                                      className={`${styles.outside_name} ${styles.draggable_item} w-[48%] pr-[8px]`}
                                    >
                                      <span>{obj.outside_name}</span>
                                      {/* {!obj.quotation_product_outside_short_name && (
                                      <span className="inline-block min-h-[5px] min-w-[55px]"></span>
                                    )} */}
                                    </div>
                                  </>
                                )}
                                {colIndex === 1 && <span>{obj.unit_quantity}</span>}
                                {colIndex === 2 && <span>{formatDisplayPrice(obj.unit_price)}</span>}
                                {colIndex === 3 && <span>{formatDisplayPrice(obj.amount)}</span>}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  {/* {productsArray?.length > 0 &&
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
                        })} */}
                </div>
              )}

              {/* 本体合計 */}
              <div
                role="row"
                // style={{ minHeight: `${3.9}%` }}
                className={`${styles.row_result} ${styles.total}`}
              >
                {columnHeaderTitleArray.map((key, index) => (
                  <div
                    key={key + index.toString() + "amount"}
                    role="gridcell"
                    className={`${styles.grid_cell} flex items-center ${
                      index === 0 ? `${styles.first}` : `${styles.end}`
                    }`}
                  >
                    {index === 0 && <span>本体合計</span>}
                    {index === 3 && <span>{formatDisplayPrice(6795000)}</span>}
                  </div>
                ))}
              </div>

              {/* 出精値引 標準見積でのみ表示 */}
              {/* {isDiscount && ( */}
              <div role="row" style={{ minHeight: `${3.9}%` }} className={`${styles.row_result}`}>
                {columnHeaderTitleArray.map((key, index) => (
                  <div
                    key={key + index.toString() + "discount"}
                    role="gridcell"
                    className={`${styles.grid_cell} flex items-center ${
                      index === 0 ? `${styles.first}` : `${styles.end}`
                    }`}
                  >
                    {index === 0 && <span>出精値引</span>}
                    {/* {index === 3 && <span>-{formatDisplayPrice(149800)}</span>} */}
                    {/* {index === 3 && <span>-{formatDisplayPrice(149200)}</span>} */}
                    {index === 3 && <span>-{formatDisplayPrice(158100)}</span>}
                  </div>
                ))}
              </div>
              {/* 出精値引 標準見積でのみ表示 ここまで */}

              {/* 以下余白 標準見積ではここで表示 */}
              <div
                role="row"
                style={{
                  height: `calc(${100 - 3.3 - 0.7 - 3.9 * productsArray.length - 3.9 - 3.9}%)`,
                  // height: `calc(${100 - 3.3 - 0.7 - 3.9 * productsArray.length - 3.9 - (isDiscount ? 3.9 : 0)}%)`,
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
              {/* 以下余白 標準見積ではここで表示 ここまで */}
            </div>

            <div role="row" className={`${styles.row_amount} w-full bg-[#09ff0000]`}>
              {columnHeaderTitleArray.map((key, index) => (
                <div
                  key={key + index.toString() + "total-amount"}
                  role="gridcell"
                  className={`${styles.grid_cell} flex items-center ${
                    index === 0 ? `${styles.first}` : `${styles.end}`
                  }`}
                >
                  {/* 合計 */}
                  {index === 0 && (
                    <div className={`flex h-full w-[24%] items-center justify-between`}>
                      <span>合</span>
                      <span>計</span>
                    </div>
                  )}
                  {/* {index === 3 && <span>{formatDisplayPrice(6645200)}</span>} */}
                  {/* {index === 3 && <span>{formatDisplayPrice(6646800)}</span>} */}
                  {index === 3 && <span>{formatDisplayPrice(6636900)}</span>}
                </div>
              ))}
            </div>

            <div className={`${styles.notes_area} w-full bg-[#00eeff00]`}>
              <p
                className={`${styles.notes_content}`}
                style={{ whiteSpace: "pre-wrap", overflow: "hidden" }}
                dangerouslySetInnerHTML={{ __html: notesText }}
              ></p>
            </div>

            <div className={`${styles.remarks_area} flex flex-col justify-start bg-[green]/[0]`}>
              <p className={`${styles.remarks}`}>※記載価格には消費税等は含まれておりません。</p>
              <p className={`${styles.remarks} ${styles.footnotes} truncate`}>
                <span>※当日出荷は弊社営業稼働日の14時までにご発注いただいた場合に対応させていただきます。</span>
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
          <div className={`${styles.right_margin}  h-full w-full min-w-[4%] max-w-[4%]`}></div>
        </div>
      )}
    </>
  );
};

export const PDFComponent = memo(PDFComponentMemo);
