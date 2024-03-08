import { memo } from "react";
import styles from "./GradientModal.module.css";
import { winnersIllustration } from "@/components/assets";
import { FaStar } from "react-icons/fa";

const _contentText = `受注済みの案件に「売上商品・売上価格・売上日付」を記録することでダッシュボード上に売上実績と達成率が反映されます。`;

type Props = {
  handleClickActive: () => void;
  handleClickCancel: () => void;
  title1: string;
  title2?: string;
  tagText?: string;
  contentText: string;
  btnActiveText: string;
  btnCancelText: string;
  illustText?: string;
};

const GradientModalMemo = ({
  handleClickActive,
  handleClickCancel,
  title1 = "受注おめでとう🎉",
  title2 = "ダッシュボードに売上を反映させましょう！",
  tagText = "受注",
  contentText = _contentText,
  btnActiveText = "反映する",
  btnCancelText = "閉じる",
  illustText = "受注おめでとうございます！",
}: Props) => {
  return (
    <>
      {/* オーバーレイ */}
      <div className={`${styles.modal_overlay}`} onClick={handleClickCancel}></div>
      <div className={`${styles.card} fade1 flex h-[400px] w-[660px] flex-col items-center justify-start`}>
        {/* <div className=" z-2 flex h-[400px] w-[660px] items-center justify-center"></div> */}
        {/* <div className=" z-2 h-[400px] w-[660px] overflow-hidden"></div> */}
        <div className={`${styles.card_after} overflow-hidden `}>
          <div
            // className="  flex h-[80px] max-h-[80px]  w-[660px] flex-col items-center justify-center bg-[#333333]/[0.5] "
            className="flex h-[80px] max-h-[80px]  w-[660px] flex-col items-center justify-center bg-[var(--color-gradient-modal-header-bg)] text-[18px] font-[800] text-[var(--color-text-title)]"
          >
            <div>
              <span className="">{title1}</span>
            </div>
            {title2 && (
              <div>
                <span className="">{title2}</span>
              </div>
            )}
            <div className={`${styles.star_icon_wrapper} flex-center`}>
              <FaStar className={`${styles.star_icon} `} />
            </div>
          </div>
          <div
            //   className="h-[400px] w-[660px]  overflow-hidden bg-[#121212] "
            className="flex h-[308px] w-[660px] overflow-hidden bg-[var(--color-gradient-modal-bg)] "
            //   onClick={togglePlay}
          >
            <div
              // className={`relative flex h-full min-h-[450px] max-w-[400px] flex-col items-center justify-center ${
              //   activeNotificationTab === "ToDo"
              //     ? `transition-base-opacity1 opacity-100`
              //     : `transition-base-opacity04 opacity-0`
              // }`}
              className={`transition-base-opacity1 relative flex h-full w-[50%] flex-col items-center justify-center opacity-100`}
            >
              <div
                className={`${styles.circle} z-1 absolute left-[48%] top-[46%] h-[210px] w-[210px] translate-x-[-50%] translate-y-[-50%] rounded-full bg-[var(--color-bg-brand-f90)]`}
              ></div>
              <div className="z-10 mb-[25px] mt-[-10px]">{winnersIllustration("180")}</div>
              {illustText && (
                <div className={`flex-center z-0 max-w-[300px] text-[14px] text-[var(--color-text-title)]`}>
                  <p className="w-full text-center">{illustText}</p>
                </div>
              )}
            </div>
            <div className={`flex-center relative flex h-full w-[50%] text-[var(--color-text-title)]`}>
              <div className="flex h-full w-full flex-col justify-between pb-[20px] pr-[33px] pt-[50px]">
                <div className="flex w-full flex-col">
                  {tagText && (
                    <div
                      className={`beta_icon flex-center relative  h-[24px] w-[52px] rounded-full px-[16px] py-[4px]`}
                    >
                      <span className="whitespace-nowrap text-[12px] font-bold text-[#efefef]">{tagText}</span>
                      <span className="absolute -bottom-[0px] left-[10px] h-[1.5px] w-[32px] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
                    </div>
                  )}
                  <div className="mt-[10px] flex flex-col bg-[red]/[0] text-[13px] leading-[24px]">
                    <p>{contentText}</p>
                  </div>
                </div>
                <div className={`${styles.btn_area} mb-[40px] flex w-full space-x-[20px] bg-[red]/[0]`}>
                  <div
                    className={`transition-bg02 ${styles.edit_btn} ${styles.brand} ${styles.active}`}
                    onClick={handleClickActive}
                  >
                    <span>{btnActiveText}</span>
                  </div>
                  <div className={`transition-bg02 ${styles.edit_btn} ${styles.cancel}`} onClick={handleClickCancel}>
                    <span>{btnCancelText}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* <video
                      src={downloadURLVideo}
                      className="h-full w-full bg-[#000] object-contain"
                      //   className="w-full h-full object-cover"
                      //   preload="auto"
                      playsInline
                      loop
                      muted
                      autoPlay
                      controls={false}
                      // ref={postedVideoRef}
                      id="postedVideo"
                    ></video> */}
          </div>
        </div>
      </div>
    </>
  );
};

export const GradientModal = memo(GradientModalMemo);
