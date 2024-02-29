import { Dispatch, Fragment, SetStateAction, memo, useEffect, useRef, useState } from "react";
import styles from "./EditModalDealCard.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { FiLayout, FiTrash } from "react-icons/fi";
import { MdMoreTime, MdOutlineClose, MdOutlineMoreTime } from "react-icons/md";
import { HiOutlineMenuAlt1 } from "react-icons/hi";
import { GrTime } from "react-icons/gr";
import { RxReset } from "react-icons/rx";
import { mappingOrderCertaintyStartOfMonthToast } from "@/utils/selectOptions";
import useStore from "@/store";

// const EditModalDealCardMemo = ({ setIsOpenEditModal }: Props) => {
const EditModalDealCardMemo = () => {
  const language = useStore((state) => state.language);
  const editedDealCard = useDashboardStore((state) => state.editedDealCard);
  const setEditedDealCard = useDashboardStore((state) => state.setEditedDealCard);
  const setIsOpenPropertyDetailModal = useDashboardStore((state) => state.setIsOpenPropertyDetailModal);
  const [isEditText, setIsEditText] = useState(false);
  const [text, setText] = useState("");
  const [isOverDetailContents, setIsOverContents] = useState(false);

  // ref
  const detailContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!detailContainerRef.current) return;

    const detail = detailContainerRef.current;

    if (detail.offsetHeight < detail.scrollHeight) setIsOverContents(true);
    console.log(detail.offsetHeight, detail.scrollHeight, detail.offsetHeight < detail.scrollHeight);
  }, []);

  if (!editedDealCard) return null;

  // 閉じる
  const handleClose = () => {
    setEditedDealCard(null);
  };

  const isRejected = editedDealCard.rejected_flag;
  const isPending = editedDealCard.pending_flag;

  const handleClickPending = () => {
    // まだペンディングではない場合はペンディングに変更
    if (isPending) {
    }
    // ペンディングを解除
    else {
    }
  };

  // 案件概要を保存
  const handleSaveSummary = async () => {};

  // 詳細を確認 => 案件詳細モーダルを開く
  const handleOpenDetailModalProperty = () => {
    setIsOpenPropertyDetailModal(true);
  };

  console.log("EditModalDealCardレンダリング editedDealCard", editedDealCard);
  return (
    <>
      <div className={`${styles.edit_modal_overlay} fade05`} onClick={handleClose}></div>
      <div
        className={`${styles.edit_modal} fade05`}
        style={{ ...(!isEditText && { maxHeight: `369px`, maxWidth: `699px` }) }}
      >
        <div className={`${styles.container}`}>
          {/* ----------------- 会社名 ----------------- */}
          <div className={`${styles.title_area} h-[90px] bg-[green]/[0]`}>
            <div className={`${styles.icon_area} min-w-[39px] bg-[red]/[0]`}>
              <div className={`flex h-[36px] w-full items-center`}>
                <FiLayout className={`text-[24px]`} />
              </div>
            </div>
            <div className={`${styles.contents_area} min-w-[600px] bg-[aqua]/[0]`}>
              <h2 className={`${styles.title} text-[22px] font-bold`}>{editedDealCard.company_name}</h2>
              <div className={`${styles.sub_title} flex items-center space-x-[6px] text-[13px] `}>
                <span>確度:</span>
                <span className={`${styles.list_name}`}>
                  {mappingOrderCertaintyStartOfMonthToast[editedDealCard.column_title_num][language]}
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
                      setText(editedDealCard.property_summary ?? "");
                      setIsEditText(true);
                    }}
                  >
                    {editedDealCard.property_summary ?? ""}
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
                  <div className={`${styles.action_btn} flex items-center space-x-[6px]`}>
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
                  <div className={`${styles.action_btn} flex items-center space-x-[6px]`} onClick={handleClickPending}>
                    {isPending && (
                      <>
                        <div className="flex-center h-[22px] w-[18px]">
                          <FiTrash className="stroke-[2.5] text-[16px]" />
                        </div>
                        <span>案件没</span>
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
                      {Array(8)
                        .fill(null)
                        .map((_, index) => {
                          return (
                            <Fragment key={index.toString() + "list_"}>
                              <div className={`${styles.span_text}`}>
                                <strong>#画像寸法測定器 IM-7000</strong>
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
