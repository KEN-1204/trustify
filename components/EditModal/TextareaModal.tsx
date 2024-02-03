import { Dispatch, SetStateAction, memo, useEffect, useRef, useState } from "react";
import styles from "./EditModal.module.css";
import { BsChevronLeft } from "react-icons/bs";

type Props = {
  setIsOpenModal: Dispatch<SetStateAction<string | null>>;
  state: string;
  dispatch: Dispatch<SetStateAction<string>> | null;
  inputTextarea?: "input" | "textarea";
  limitLength?: number | null;
  title?: string | null;
  notes?: string | null;
  customFunction?: () => void;
};

const TextareaModalMemo = ({
  setIsOpenModal,
  state,
  dispatch,
  inputTextarea = "textarea",
  limitLength,
  title = "詳細",
  notes,
  customFunction,
}: Props) => {
  if (!dispatch) return null;

  const alertPopupRef = useRef<HTMLDivElement | null>(null);
  const hideTimeoutIdRef = useRef<number | null>(null);
  const [prevState, setPrevState] = useState(state);

  // 文字数制限を超えた際にポップアップアラートメッセージを表示する
  const showAlertPopup = () => {
    const alertPopup = alertPopupRef.current;
    if (!alertPopup) return;

    // 既存のタイマーをクリアする
    if (hideTimeoutIdRef.current !== null) {
      clearTimeout(hideTimeoutIdRef.current); // 既存の非表示タイマーをキャンセル
      hideTimeoutIdRef.current = null;
    }

    // ポップアップを即時表示するためのスタイルを設定
    alertPopup.style.display = "flex"; // ポップアップを表示
    alertPopup.style.animation = "popupShow 0.1s ease forwards"; // 表示アニメーション

    // 一定時間（例: 3秒）後に非表示アニメーションを適用

    // 新たに非表示にするためのタイマーを設定(windowオブジェクトのsetTimeoutの結果はnumber型 clearTimeoutで使用)
    hideTimeoutIdRef.current = window.setTimeout(() => {
      alertPopup.style.animation = "popupHide 0.2s ease forwards"; // 非表示アニメーション

      // アニメーションが完了した後に要素を非表示にする
      setTimeout(() => {
        alertPopup.style.display = "none";
      }, 200); // 非表示アニメーションの時間に合わせる

      // タイマーIDをリセット
      hideTimeoutIdRef.current = null;
    }, 3000); // 表示される時間
  };

  // コンポーネントのクリーンアップで既存のタイマーがあればクリアする
  useEffect(() => {
    return () => {
      if (hideTimeoutIdRef.current !== null) {
        clearTimeout(hideTimeoutIdRef.current);
      }
    };
  }, []);

  // stateを元の値に戻して閉じる
  const handleCloseAndReset = () => {
    dispatch(prevState);
    setIsOpenModal(null);
  };

  // 保存ボタンクリック
  const handleSave = () => {
    if (prevState === state) {
      setIsOpenModal(null);
      return;
    }
    if (customFunction) {
      customFunction();
    }
    setIsOpenModal(null);
  };

  //  --------------------------- 🌟インラインスタイル・クラス関連🌟 ---------------------------
  const notesStyle = notes ? `mb-[0px] min-h-[220px]` : `min-h-[240px]`;

  const contentsClass = (value: string) => {
    switch (value) {
      case "textarea":
        return notes ? `min-h-[280px]` : `min-h-[280px]`;
        // return notes ? `min-h-[280px]` : `min-h-[300px]`;
        break;
      case "input":
        return notes ? `min-h-[100px]` : `min-h-[100px]`;
        break;
      default:
        break;
    }
  };

  const modalContainerStyle = (value: string) => {
    switch (value) {
      case "textarea":
        return { maxHeight: `367px`, minHeight: `367px` };
        break;
      case "input":
        return notes
          ? { maxHeight: `180px`, minHeight: `180px`, minWidth: "780px", maxWidth: "780px" }
          : { maxHeight: `160px`, minHeight: `160px`, minWidth: "780px", maxWidth: "780px" };
        break;
      default:
        break;
    }
  };
  //  --------------------------- ✅インラインスタイル・クラス関連✅ ---------------------------

  console.log(
    "state",
    state,
    "inputTextarea",
    inputTextarea,
    "limitLength",
    limitLength,
    "title",
    title,
    "notes",
    notes
  );

  return (
    <>
      {/* オーバーレイ */}
      <div className={`flex-center ${styles.textarea_overlay}`} onClick={handleCloseAndReset}></div>
      {/* アラートポップアップ */}
      {/* <div ref={alertAreaRef} className={`fixed inset-0 z-[20000] flex justify-center pt-[3vh]`}>
        
      </div> */}
      <div ref={alertPopupRef} className={`flex-center alert_popup h-[50px] w-[300px] bg-[#555] text-[#fff]`}>
        <span>文字数制限を超えています</span>
      </div>
      {/* モーダル */}
      <div
        style={modalContainerStyle(inputTextarea)}
        className={`${styles.modal_container} ${styles.textarea_container} transition-base flex flex-col`}
      >
        <div
          className={`${styles.contents} group relative mb-[6px] !h-full ${contentsClass(
            inputTextarea
          )} w-full !bg-transparent`}
        >
          {/* 保存キャンセルエリア */}
          <div className="flex w-full  items-center justify-between py-[10px] text-center text-[18px]">
            <div
              className="elect-none relative flex min-w-[100px] cursor-pointer items-center justify-start whitespace-nowrap text-[16px] hover:text-[#aaa]"
              onClick={handleCloseAndReset}
            >
              キャンセル
            </div>
            {/* <div className="relative flex min-w-[100px] max-w-max cursor-pointer select-none items-center justify-start hover:text-[#aaa]">
              <div className="h-full min-w-[24px]"></div>
              <BsChevronLeft className="z-1 absolute  left-[-10px] top-[50%] translate-y-[-50%] text-[24px]" />
              <span>戻る</span>
            </div> */}

            <div className="flex-center flex-center mx-auto min-h-[27px] min-w-[100px] select-none text-[16px] font-bold">
              <span>{title}</span>
            </div>
            <div
              className={`flex min-w-[100px] cursor-pointer items-center justify-end font-bold text-[#0D99FF] ${styles.save_text} select-none text-[16px]`}
              onClick={handleSave}
            >
              <span>保存</span>
              {/* 閉じる */}
            </div>
          </div>
          {/* Divider、区切り線 */}
          <div className="flex h-[3px] w-full items-center justify-center">
            <div className={`h-[1px] w-[100%] bg-[#5e5e5e]/[0.3] ${styles.divider}`}></div>
          </div>
          {inputTextarea === "input" && (
            <input
              type="text"
              autoFocus
              value={state}
              onChange={(e) => {
                const inputValue = e.target.value;
                if (limitLength && inputValue.length > limitLength) {
                  showAlertPopup();
                  // 0から99番目の文字までをstateに格納
                  dispatch(state.slice(0, limitLength));
                  return;
                } else {
                  dispatch(inputValue);
                }
              }}
              className={`${styles.input_box} input-selection mt-[20px] h-full w-full border-none !bg-[#ffffff00] outline-none  selection:text-[#ECECEC] placeholder:text-[16px] placeholder:text-[#ECECEC]/[0.5] placeholder:focus:text-[#ECECEC]/[0.7]`}
            />
          )}
          {/* テキストエリア */}
          {inputTextarea === "textarea" && (
            <textarea
              // name=""
              // id=""
              // value={textareaInput}
              // value={state.replace(/\n/g, "<br>")}
              value={state}
              // dangerouslySetInnerHTML={{
              //   __html: state ? state.replace(/\n/g, "<br>") : "",
              // }}
              cols={30}
              //   rows={10}
              autoCapitalize="none"
              wrap="hard"
              onChange={(e) => {
                const inputValue = e.target.value;
                if (limitLength && inputValue.length > limitLength) {
                  showAlertPopup();
                  // 0から99番目の文字までをstateに格納
                  dispatch(state.slice(0, limitLength));
                  return;
                } else {
                  dispatch(inputValue);
                }
              }}
              autoFocus
              // readOnly // 自身の作成したレコードでない場合はreadOnlyに設定して編集できないようにする
              // className="w-full h-full outline-none border-none bg-transparent text-white"
              className={`input-selection mt-[10px] h-full w-full resize-none border-none !bg-[#ffffff00] outline-none  selection:text-[#ECECEC] placeholder:text-[16px] placeholder:text-[#ECECEC]/[0.5] placeholder:focus:text-[#ECECEC]/[0.7] ${
                !!limitLength ? notesStyle : `mb-[30px] ${styles.lg}`
              } ${styles.textarea}`}
            ></textarea>
          )}
          {/* <div className="h-[60px] w-full bg-[#ffffff30]"></div> */}
          {/* <div className={`${styles.textarea_scroll_container}`}>
            <div
              className={`input-selection h-full w-full resize-none border-none !bg-transparent outline-none selection:bg-[#0D99FF] selection:text-[#ECECEC] placeholder:text-[16px] placeholder:text-[#ECECEC]/[0.5] placeholder:focus:text-[#ECECEC]/[0.7] ${styles.textarea_read_only} pointer-events-none`}
              dangerouslySetInnerHTML={{
                __html: textareaInput ? textareaInput.replace(/\n/g, "<br>") : "",
              }}
            ></div>
          </div> */}
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
            className={`absolute ${
              !!limitLength ? `bottom-[-3px]` : `bottom-[0]`
            } left-0 z-[1] h-[1px] w-[100%] bg-[#5e5e5e]/[0.8] ${styles.underline}`}
          ></div>
          <div
            className={`input-underline-transition absolute ${
              !!limitLength ? `bottom-[-3px]` : `bottom-[0]`
            } left-[50%] z-[2] h-[1px] w-[0%] bg-[#0D99FF] group-focus-within:left-0 group-focus-within:w-[100%] ${
              styles.underline_active_appearance_animation
            }`}
          ></div>
          {/* inputアンダーライン 中央から左右に広がるアニメーション テキストエリアread_only用ここまで */}
        </div>
        {limitLength && (
          <div
            className={`flex w-full flex-col space-y-[2px] bg-[#ffffff00] pt-[6px] text-[#999] ${
              notes ? `h-[50px]` : `h-[30px]`
            }`}
          >
            <div className="flex w-full space-x-[3px] text-[13px]">
              <span className={`text-[var(--color-bg-brand-f)]`}>{state.length}</span>
              <span>/</span>
              <span>{limitLength}</span>
            </div>
            {notes && (
              <div className="flex w-full text-[13px] text-[#999]">
                <span>{notes}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export const TextareaModal = memo(TextareaModalMemo);
