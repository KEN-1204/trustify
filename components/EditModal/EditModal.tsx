import React from "react";
import styles from "./EditModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";

export const EditModal = () => {
  const textareaInput = useDashboardStore((state) => state.textareaInput);
  const setTextareaInput = useDashboardStore((state) => state.setTextareaInput);
  const setIsOpenEditModal = useDashboardStore((state) => state.setIsOpenEditModal);
  const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);

  const handleClickOverlay = () => {
    setTextareaInput("");
    setIsOpenEditModal(false);
  };

  console.log("🔥EditModalレンダリング textareaInput", textareaInput, "selectedRowDataContact", selectedRowDataContact);

  const handleSave = () => {
    if (activeMenuTab === "Company") {
    }
    if (activeMenuTab === "Contacts") {
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      <div className={`flex-center ${styles.overlay}`} onClick={handleClickOverlay}></div>
      {/* モーダル */}
      <div className={`${styles.modal_container} transition-base fade02`} onClick={handleClickOverlay}>
        <div className={`${styles.contents} group relative !h-full w-full !bg-transparent`}>
          {/* <div className={`${styles.contents} group relative !h-full min-w-[70vw] !bg-transparent`}> */}
          {/* 保存キャンセルエリア */}
          <div className="flex w-full  items-center justify-between py-[10px] text-center text-[18px]">
            <div className="w-[54px] cursor-pointer hover:text-[#aaa]" onClick={handleClickOverlay}>
              {/* キャンセル */}
            </div>
            {/* <div className="font-bold">編集</div> */}
            <div className="flex-center mx-auto w-[54px] select-none font-bold">
              <span>詳細</span>
            </div>
            <div
              className={`w-[54px] cursor-pointer font-bold text-[#0D99FF] ${styles.save_text} select-none`}
              onClick={() => console.log("クリック")}
            >
              {/* 保存 */}
              {/* 閉じる */}
            </div>
          </div>
          {/* Divider、区切り線 */}
          <div className="flex h-[3px] w-full items-center justify-center">
            <div className={`h-[1px] w-[100%] bg-[#5e5e5e]/[0.3] ${styles.divider}`}></div>
          </div>
          {/* テキストエリア */}
          {/* <textarea
            // name=""
            // id=""
            // value={textareaInput}
            value={textareaInput.replace(/\n/g, "<br>")}
            cols={30}
            rows={10}
            autoCapitalize="none"
            wrap="hard"
            onChange={(e) => setTextareaInput(e.target.value)}
            autoFocus
            readOnly // 自身の作成したレコードでない場合はreadOnlyに設定して編集できないようにする
            // className="w-full h-full outline-none border-none bg-transparent text-white"
            className={`input-selection mt-[10px] h-full w-full resize-none border-none !bg-transparent outline-none selection:bg-[#0D99FF] selection:text-[#ECECEC] placeholder:text-[16px] placeholder:text-[#ECECEC]/[0.5] placeholder:focus:text-[#ECECEC]/[0.7] ${styles.textarea} pointer-events-none`}
          ></textarea> */}
          <div className={`${styles.textarea_scroll_container}`}>
            <div
              className={`input-selection h-full w-full resize-none border-none !bg-transparent outline-none selection:bg-[#0D99FF] selection:text-[#ECECEC] placeholder:text-[16px] placeholder:text-[#ECECEC]/[0.5] placeholder:focus:text-[#ECECEC]/[0.7] ${styles.textarea_read_only} pointer-events-none`}
              dangerouslySetInnerHTML={{
                __html: textareaInput ? textareaInput.replace(/\n/g, "<br>") : "",
              }}
            ></div>
          </div>
          {/* inputアンダーライン 中央から左右に広がるアニメーション テキストエリア編集用 */}
          {/* <div
            className={`absolute bottom-[20px] left-0 z-[1] h-[1px] w-[100%] bg-[#5e5e5e]/[0.8] ${styles.underline}`}
          ></div> */}
          {/* <div
            className={`input-underline-transition absolute bottom-[20px] left-[50%] z-[2] h-[1px] w-[0%] bg-[#0D99FF] group-focus-within:left-0 group-focus-within:w-[100%] ${styles.underline_active}`}
          ></div> */}
          {/* inputアンダーライン 中央から左右に広がるアニメーション テキストエリア編集用ここまで */}
          {/* inputアンダーライン 中央から左右に広がるアニメーション テキストエリアread_only用 */}
          <div
            className={`absolute bottom-[0] left-0 z-[1] h-[1px] w-[100%] bg-[#5e5e5e]/[0.8] ${styles.underline}`}
          ></div>
          <div
            className={`input-underline-transition absolute bottom-[0] left-[50%] z-[2] h-[1px] w-[0%] bg-[#0D99FF] group-focus-within:left-0 group-focus-within:w-[100%] ${styles.underline_active_appearance_animation}`}
          ></div>
          {/* inputアンダーライン 中央から左右に広がるアニメーション テキストエリアread_only用ここまで */}
        </div>
      </div>
    </>
  );
};
