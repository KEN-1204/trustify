import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import React, { FC } from "react";
import { MdClose } from "react-icons/md";
import styles from "./ConfirmationModal.module.css";

type Props = {
  clickEventClose: () => void;
  isLoadingState?: boolean;
  titleText?: string;
  titleText2?: string;
  sectionP1?: string;
  sectionP2?: string;
  cancelText: string;
  submitText: string;
  clickEventSubmit: () => void;
  buttonColor?: "brand" | "red" | "green";
  zIndexOverlay?: string;
  zIndex?: string;
  withAnnotation?: boolean;
  annotationText?: string;
};

export const ConfirmationModal: FC<Props> = ({
  clickEventClose,
  isLoadingState,
  titleText,
  titleText2,
  sectionP1,
  sectionP2,
  cancelText = "戻る",
  submitText = "削除する",
  clickEventSubmit,
  buttonColor = "red",
  zIndexOverlay,
  zIndex,
  withAnnotation = false,
  annotationText = `この操作は少し時間がかかります。画面を閉じずにお待ちください。`,
}) => {
  return (
    <>
      {/* オーバーレイ */}
      <div
        // className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay)] backdrop-blur-sm"
        className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay-light)] backdrop-blur-sm"
        style={{ ...(zIndexOverlay && { zIndex: zIndexOverlay }) }}
        // onClick={() => {
        //   setShowConfirmCancelModal(null);
        // }}
        onClick={clickEventClose}
      ></div>
      <div
        // className="fade02 fixed left-[50%] top-[50%] z-[2000] h-auto max-h-[300px] w-[40vw] max-w-[580px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)] "
        className="fade02 fixed left-[50%] top-[50%] z-[2000] h-auto max-h-max w-[40vw] max-w-[580px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)] "
        style={{ ...(zIndex && { zIndex: zIndex }) }}
      >
        {/* {!isLoadingState && (
          <div className={`flex-center absolute left-0 top-0 z-[3000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}>
            <SpinnerIDS scale={"scale-[0.5]"} />
            <SpinnerComet w="56px" h="56px" s="6px" />
          </div>
        )} */}
        {isLoadingState && (
          <div className={`${styles.loading_overlay}`}>
            <div className={`${styles.loading_spinner_outside} flex-center bg-[#fff]`}>
              <SpinnerComet w="56px" h="56px" s="6px" />
            </div>
          </div>
        )}
        {/* クローズボタン */}
        <button
          className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          //   onClick={() => {
          onClick={clickEventClose}
          //     setShowConfirmCancelModal(null);
          //   }}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button>
        <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>{titleText}</h3>
        {titleText2 && <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>{titleText2}</h3>}
        {sectionP1 && (
          <section className={`mt-[20px] flex h-auto w-full flex-col space-y-2 text-[14px]`}>
            {/* <p>この操作を実行した後にキャンセルすることはできません。</p> */}
            {/* <p className="font-bold">
                  注：この操作により、該当ユーザーのデータは、他のチームメンバーと共有されていないものを含めて全てアクセスできなくなります。
                </p> */}
            <p>{sectionP1}</p>
            {sectionP2 && <p className="text-[13px] font-bold">{sectionP2}</p>}
          </section>
        )}
        <section className="flex w-full items-start justify-end">
          <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
            <button
              className={`transition-bg02 w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
              //   onClick={() => {
              //     setShowConfirmCancelModal(null);
              //   }}
              onClick={clickEventClose}
            >
              {cancelText}
            </button>
            <button
              className={`transition-bg02 w-[50%] cursor-pointer rounded-[8px] px-[15px] py-[10px] text-[14px] font-bold text-[#fff]  ${
                buttonColor === "red" && `bg-[var(--color-red-tk)] hover:bg-[var(--color-red-tk-hover)]`
              } ${buttonColor === "brand" && `bg-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f-hover)]`}`}
              // onClick={loadPortal}
              onClick={clickEventSubmit}
            >
              {submitText}
            </button>
          </div>
        </section>
        {withAnnotation && <p className="mt-[20px] text-[13px] font-bold">{annotationText}</p>}
      </div>
    </>
  );
};
