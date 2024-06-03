import { Dispatch, Fragment, SetStateAction, memo, useEffect, useRef, useState } from "react";
import styles from "./EditModalDealCard.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { FiLayout, FiTrash } from "react-icons/fi";
import { MdMoreTime, MdOutlineClose, MdOutlineMoreTime } from "react-icons/md";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { GrTime } from "react-icons/gr";
import { RxDot, RxReset } from "react-icons/rx";
import { getCompetitionState, getCurrentStatus, mappingOrderCertaintyStartOfMonthToast } from "@/utils/selectOptions";
import useStore from "@/store";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import { Property_row_data } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { format } from "date-fns";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";

// const EditModalDealCardMemo = ({ setIsOpenEditModal }: Props) => {
const EditModalDealCardMemo = () => {
  const language = useStore((state) => state.language);
  // 選択中のネタカード
  const selectedDealCard = useDashboardStore((state) => state.selectedDealCard);
  const setSelectedDealCard = useDashboardStore((state) => state.setSelectedDealCard);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  // ネタ確認モーダル
  const setIsOpenDealCardModal = useDashboardStore((state) => state.setIsOpenDealCardModal);
  // 案件詳細モーダル
  const setIsOpenPropertyDetailModal = useDashboardStore((state) => state.setIsOpenPropertyDetailModal);
  // ローカルcardsを更新するトリガー
  const setIsRequiredRefreshDealCards = useDashboardStore((state) => state.setIsRequiredRefreshDealCards);

  // ローカルstate
  const [isLoading, setIsLoading] = useState(false);
  const [isEditText, setIsEditText] = useState(false);
  const [text, setText] = useState("");
  const [isOverDetailContents, setIsOverContents] = useState(false);

  // ref
  const detailContainerRef = useRef<HTMLDivElement | null>(null);

  // インスタンス
  const queryClient = useQueryClient();
  const supabase = useSupabaseClient();

  // 閉じる
  const handleClose = () => {
    setSelectedDealCard(null); // 選択を解除
    setIsOpenDealCardModal(false); // モーダルを閉じる
  };
  // キャッシュのクエリキー
  const activePeriodSDB = useDashboardStore((state) => state.activePeriodSDB);

  if (!selectedDealCard || !selectedDealCard?.dealCard || !activePeriodSDB) {
    handleClose();
    return;
  }

  const currentQueryKey = ["deals", selectedDealCard.ownerId, activePeriodSDB.periodType, activePeriodSDB.period];

  useEffect(() => {
    if (!detailContainerRef.current) return;

    const detail = detailContainerRef.current;

    if (detail.offsetHeight < detail.scrollHeight) setIsOverContents(true);
    console.log(detail.offsetHeight, detail.scrollHeight, detail.offsetHeight < detail.scrollHeight);
  }, []);

  const isRejected = selectedDealCard.dealCard.rejected_flag;
  const isPending = selectedDealCard.dealCard.pending_flag;

  type UpdateProps = {
    fieldName: string;
    updatePayload: { [key: string]: any };
    successMessage: string;
    errorMessage: string;
  };
  const updateProperty = async ({ fieldName, updatePayload, successMessage, errorMessage }: UpdateProps) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from("properties")
        .update(updatePayload)
        .eq("id", selectedDealCard.dealCard.property_id);

      if (error) throw error;

      // キャッシュの更新
      const prevCacheProperty: Property_row_data[] | undefined = queryClient.getQueryData(currentQueryKey);
      // キャッシュの配列から今回更新した案件idのオブジェクトのみ更新してキャッシュを更新
      if (!!prevCacheProperty?.length) {
        const newCacheProperty = prevCacheProperty.map((obj) => {
          if (obj.property_id === selectedDealCard.dealCard.property_id) {
            const newProperty = { ...obj, ...updatePayload };
            console.log("新たな案件", newProperty);
            return newProperty;
          } else {
            console.log("既存案件", obj);
            return obj;
          }
        });
        console.log("キャッシュを更新", newCacheProperty, "前のキャッシュ", prevCacheProperty);
        queryClient.setQueryData(currentQueryKey, newCacheProperty);
      } else {
        console.log(
          "❌キャッシュなし prevCacheProperty",
          prevCacheProperty,
          "クエリキー",
          currentQueryKey,
          "activePeriodSDB",
          activePeriodSDB
        );
      }

      // Zustandの選択中のカードも更新して、UIに反映
      console.log("🔥Zustandも更新 { ...selectedDealCard.dealCard, ...updatePayload }", {
        ...selectedDealCard.dealCard,
        ...updatePayload,
      });
      setSelectedDealCard({
        ...selectedDealCard,
        dealCard: { ...selectedDealCard.dealCard, ...updatePayload },
      });

      // ローカルstateを更新するためのトリガーをON ボード内のcardsから選択中のカードの
      // rejected_flag, pending_flag, property_summaryカラムの更新内容を反映
      // setIsRequiredRefreshDealCards(true);
      setIsRequiredRefreshDealCards(selectedDealCard.ownerId);

      toast.success(successMessage);
    } catch (error: any) {
      console.error("エラー：", error);
      toast.error(errorMessage);
    }

    setIsLoading(false);
  };

  // 🌟案件没
  const handleClickRejected = async () => {
    // 受注済みの場合にはリターン
    if (selectedDealCard.dealCard.column_title_num === 1) return;
    // まだ案件没ではない場合は案件没に変更
    if (!isRejected) {
      updateProperty({
        fieldName: "rejected_flag",
        updatePayload: { rejected_flag: true },
        successMessage: "案件を没に変更しました🌟",
        errorMessage: "案件没へ変更できませんでした...🙇‍♀️",
      });
    }
    // 案件没を解除
    else {
      updateProperty({
        fieldName: "rejected_flag",
        updatePayload: { rejected_flag: false },
        successMessage: "案件没を解除しました🌟",
        errorMessage: "案件没の解除に失敗しました...🙇‍♀️",
      });
    }
  };

  // 🌟ペンディング
  const handleClickPending = async () => {
    // 受注済みの場合にはリターン
    if (selectedDealCard.dealCard.column_title_num === 1) return;
    // まだペンディングではない場合はペンディングに変更
    if (!isPending) {
      updateProperty({
        fieldName: "pending_flag",
        updatePayload: { pending_flag: true },
        successMessage: "案件をペンディングに変更しました🌟",
        errorMessage: "ペンディングへ変更できませんでした...🙇‍♀️",
      });
    }
    // ペンディングを解除
    else {
      updateProperty({
        fieldName: "pending_flag",
        updatePayload: { pending_flag: false },
        successMessage: "ペンディングを解除しました🌟",
        errorMessage: "ペンディングの解除に失敗しました...🙇‍♀️",
      });
    }
  };

  // 案件概要を保存
  const handleSaveSummary = async () => {
    updateProperty({
      fieldName: "property_summary",
      updatePayload: { property_summary: text },
      successMessage: "案件概要を更新しました🌟",
      errorMessage: "案件概要の更新に失敗できませんでした...🙇‍♀️",
    });
    setText("");
    setIsEditText(false);
  };

  // 詳細を確認 => 案件詳細モーダルを開く
  const handleOpenDetailModalProperty = () => {
    // 分割代入
    const { column_title_num, ..._selectedRowDataProperty } = selectedDealCard.dealCard;

    setSelectedRowDataProperty(_selectedRowDataProperty);

    setIsOpenPropertyDetailModal(true);
  };

  const dealCard = selectedDealCard.dealCard;
  // 案件詳細アクティビティ
  const detailArray = [
    { field: `○現ｽﾃｰﾀｽ：`, value: dealCard.current_status ? `${getCurrentStatus(dealCard.current_status)}` : "" },
    { field: `○商品：`, value: dealCard.expected_product ? `${dealCard.expected_product}` : "" },
    {
      field: `○予定売上：`,
      value: dealCard.expected_sales_price ? `${formatDisplayPrice(dealCard.expected_sales_price, language)}` : "",
    },
    { field: `○予定台数：`, value: dealCard.product_sales ? `${dealCard.product_sales}` : "" },
    {
      field: `○獲得予定時期：`,
      value: dealCard.expected_order_date ? `${format(new Date(dealCard.expected_order_date), "yyyy年MM月dd日")}` : "",
    },
    {
      field: `○展開日付：`,
      value: dealCard.expansion_date ? `${format(new Date(dealCard.expansion_date), "yyyy年MM月dd日")}〜` : "",
    },
    {
      field: `○売上日付：`,
      value: dealCard.sales_date ? `〜${format(new Date(dealCard.sales_date), "yyyy年MM月dd日")}` : "",
    },
    {
      field: `○競合状況：`,
      value: dealCard.competition_state ? `${getCompetitionState(dealCard.competition_state)}` : "",
    },
    {
      field: `○案件名：`,
      value: dealCard.property_name ? `${dealCard.property_name}` : "",
    },
  ];
  const detailArrayForSold = [
    { field: `○現ｽﾃｰﾀｽ：`, value: dealCard.current_status ? `${getCurrentStatus(dealCard.current_status)}` : "" },
    { field: `○売上商品：`, value: dealCard.sold_product ? `${dealCard.sold_product}` : "" },
    {
      field: `○売上合計：`,
      value: dealCard.sales_price ? `${formatDisplayPrice(dealCard.sales_price)}` : "",
    },
    { field: `○売上台数：`, value: dealCard.unit_sales ? `${dealCard.unit_sales}` : "" },
    {
      field: `○売上日付：`,
      value: dealCard.sales_date ? `〜${format(new Date(dealCard.sales_date), "yyyy年MM月dd日")}` : "",
    },
    {
      field: `○展開日付：`,
      value: dealCard.expansion_date ? `${format(new Date(dealCard.expansion_date), "yyyy年MM月dd日")}〜` : "",
    },
    {
      field: `○競合状況：`,
      value: dealCard.competition_state ? `${getCompetitionState(dealCard.competition_state)}` : "",
    },
    {
      field: `○案件名：`,
      value: dealCard.property_name ? `${dealCard.property_name}` : "",
    },
  ];

  console.log(
    "EditModalDealCardレンダリング selectedDealCard",
    selectedDealCard,
    "クエリキー",
    currentQueryKey,
    "activePeriodSDB",
    activePeriodSDB
  );
  return (
    <>
      <div className={`${styles.edit_modal_overlay} fade05`} onClick={handleClose}></div>
      {/* ローディングオーバーレイ */}
      {isLoading && (
        <div className={`${styles.loading_overlay_modal_outside} `}>
          {/* <SpinnerComet w="48px" h="48px" s="5px" /> */}
          <div className={`${styles.loading_overlay_modal_inside}`}>
            <SpinnerBrand withBorder withShadow />
          </div>
        </div>
      )}
      <div
        className={`${styles.edit_modal} fade05`}
        style={{ ...(!isEditText && { maxHeight: `369px`, maxWidth: `699px` }) }}
      >
        <div className={`${styles.container}`}>
          {/* ----------------- 会社名 ----------------- */}
          <div
            // className={`${styles.title_area} h-[90px] bg-[green]/[0]`}
            className={`${styles.title_area} h-[80px] bg-[green]/[0]`}
          >
            <div className={`${styles.icon_area} min-w-[39px] bg-[red]/[0]`}>
              <div className={`flex h-[36px] w-full items-center`}>
                <FiLayout className={`text-[24px]`} />
              </div>
            </div>
            <div className={`${styles.contents_area} min-w-[600px] bg-[aqua]/[0]`}>
              <h2 className={`${styles.title} text-[22px] font-bold`}>{selectedDealCard.dealCard.company_name}</h2>
              <div className={`${styles.sub_title} flex items-center space-x-[6px] text-[13px] `}>
                <span>確度:</span>
                <span className={`${styles.list_name}`}>
                  {mappingOrderCertaintyStartOfMonthToast[selectedDealCard.dealCard.column_title_num][language]}
                </span>
              </div>
            </div>
          </div>
          {/* ----------------- 会社名 ----------------- */}

          {/* ----------------- 概要・アクション ----------------- */}
          <div className={`${styles.description_area} h-[120px] bg-[aqua]/[0]`}>
            <div className={`${styles.title_area} h-ful bg-[green]/[0]`}>
              <div className={`${styles.icon_area} min-w-[39px] bg-[red]/[0]`}>
                <div className={`flex h-[36px] w-full items-center`}>
                  <HiOutlineMenuAlt1 className={`text-[24px]`} />
                </div>
              </div>
              <div className={`${styles.contents_area} min-w-[450px] bg-[aqua]/[0]`}>
                <h2 className={`${styles.section_title}`}>案件概要</h2>
                {!isEditText && (
                  <div
                    className={`${styles.edit_textarea}`}
                    onClick={() => {
                      setText(selectedDealCard.dealCard.property_summary ?? "");
                      setIsEditText(true);
                    }}
                  >
                    {selectedDealCard.dealCard.property_summary ?? ""}
                    {/* <span>
                      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Id, aspernatur fugit. Reiciendis
                      praesentium dolorum dolor tempore officia ullam blanditiis numquam eius obcaecati, quos ipsum
                      fugiat assumenda eligendi cum dicta! Similique!
                    </span> */}
                  </div>
                )}
                {isEditText && (
                  <textarea
                    autoFocus
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onBlur={() => setText(text.trim())}
                    className={`${styles.edit_textarea} ${styles.active}`}
                  ></textarea>
                )}
              </div>
              <div className={`${styles.action_area} min-w-[150px] bg-[red]/[0]`}>
                <h3 className={`${styles.sub_title}`}>アクション</h3>
                <div className={`${styles.btn_area} flex flex-col`}>
                  <div
                    className={`${styles.action_btn} flex items-center space-x-[6px] ${
                      selectedDealCard.dealCard.column_title_num === 1 ? `${styles.disabled}` : ``
                    }`}
                    onClick={handleClickRejected}
                  >
                    {isRejected && (
                      <>
                        <div className="flex-center h-[22px] w-[18px]">
                          <RxReset className="stroke-[0.6] text-[16px]" />
                        </div>
                        <span>今月ネタに戻す</span>
                      </>
                    )}
                    {!isRejected && (
                      <>
                        <div className="flex-center h-[22px] w-[18px]">
                          <FiTrash className="stroke-[2.5] text-[16px]" />
                        </div>
                        <span>案件没</span>
                      </>
                    )}
                  </div>
                  <div
                    className={`${styles.action_btn} flex items-center space-x-[6px] ${
                      selectedDealCard.dealCard.column_title_num === 1 ? `${styles.disabled}` : ``
                    }`}
                    onClick={handleClickPending}
                  >
                    {isPending && (
                      <>
                        <div className="flex-center h-[22px] w-[18px]">
                          <RxReset className="stroke-[0.6] text-[16px]" />
                        </div>
                        <span>ペンディング解除</span>
                      </>
                    )}
                    {!isPending && (
                      <>
                        <div className="flex-center h-[22px] w-[18px]">
                          <MdOutlineMoreTime className="text-[18px]" />
                        </div>
                        <span>ペンディング</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ----------------- 概要・アクション ----------------- */}

          {/* ----------------- 保存・キャンセル ----------------- */}
          {isEditText && (
            <div className={`mt-[9px] flex h-[39px] w-full items-center pl-[39px]`}>
              <div className="flex h-full items-center gap-[6px]">
                <button className={`${styles.save_btn}`} onClick={handleSaveSummary}>
                  保存
                </button>
                <button className={`${styles.cancel_btn}`} onClick={() => setIsEditText(false)}>
                  キャンセル
                </button>
              </div>
            </div>
          )}
          {/* ----------------- 保存・キャンセルここまで ----------------- */}

          {/* ----------------- アクティビティ・案件詳細 ----------------- */}
          <div className={`${styles.detail_area} mt-[20px] h-auto bg-[green]/[0]`}>
            <div className={`${styles.icon_area} min-w-[39px] bg-[red]/[0]`}>
              <div className={`flex h-[36px] w-full items-center`}>
                <GrTime className="text-[22px]" />
              </div>
            </div>
            <div className={`${styles.contents_area} bg-[aqua]/[0]`}>
              <h2 className={`${styles.section_title} text-[22px] font-bold`}>案件詳細・アクティビティ</h2>
              <div className="flex w-full max-w-[633px]">
                <div className={`${styles.tag_list_wrapper}`}>
                  <div
                    ref={detailContainerRef}
                    className={`${styles.tag_list_container} flex items-center text-[13px]`}
                    style={{ maxHeight: `44px` }}
                  >
                    {isOverDetailContents && (
                      <div className={`${styles.show_more_btn_wrapper}`}>
                        <button className={`${styles.btn_expand}`} onClick={handleOpenDetailModalProperty}>
                          詳細を確認
                        </button>
                      </div>
                    )}
                    <div className={`${styles.div_container}`}>
                      {dealCard.column_title_num !== 1 &&
                        detailArray.map((obj, index) => {
                          if (!obj.value) return;
                          return (
                            <Fragment key={index.toString() + "list_"}>
                              <div className={`${styles.span_text}`}>
                                {/* <RxDot className={`min-h-[21px] min-w-[21px] text-[var(--color-bg-brand-f)]`} /> */}
                                <strong className="text-[#393939]">{obj.field}</strong>
                                <strong>{obj.value}</strong>
                                {/* <strong>#画像寸法測定器 IM-7000</strong> */}
                              </div>
                            </Fragment>
                          );
                        })}
                      {dealCard.column_title_num === 1 &&
                        detailArrayForSold.map((obj, index) => {
                          if (!obj.value) return;
                          return (
                            <Fragment key={index.toString() + "list_"}>
                              <div className={`${styles.span_text}`}>
                                {/* <RxDot className={`min-h-[21px] min-w-[21px] text-[var(--color-bg-brand-f)]`} /> */}
                                <strong className="text-[#393939]">{obj.field}</strong>
                                <strong>{obj.value}</strong>
                                {/* <strong>#画像寸法測定器 IM-7000</strong> */}
                              </div>
                            </Fragment>
                          );
                        })}
                    </div>
                  </div>
                </div>
              </div>
              {!isOverDetailContents && (
                <div className={`mt-[6px] flex w-full items-center justify-end`}>
                  <button className={`${styles.btn_detail}`} onClick={handleOpenDetailModalProperty}>
                    詳細を確認
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* ----------------- アクティビティ・案件詳細 ----------------- */}

          {/* <GrTime className="h-[22px] stroke-[2.5] text-[16px]" /> */}

          {/* バツボタン */}
          <div className={`${styles.close_btn} flex-center`} onClick={handleClose}>
            <MdOutlineClose className={`text-[24px]`} />
          </div>
        </div>
      </div>
    </>
  );
};

export const EditModalDealCard = memo(EditModalDealCardMemo);
