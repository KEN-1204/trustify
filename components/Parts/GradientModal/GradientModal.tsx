import { memo } from "react";
import styles from "./GradientModal.module.css";

const GradientModalMemo = () => {
  return (
    <>
      <div className={`${styles.card}  relative z-0 flex h-[400px] w-[660px] flex-col items-center justify-start`}>
        <div className=" z-2 flex h-[400px] w-[660px] items-center justify-center"></div>
        <div className=" z-2 h-[400px] w-[660px] overflow-hidden"></div>
        <div className={`${styles.card_after} overflow-hidden `}>
          <div
            // className="  flex h-[80px] max-h-[80px]  w-[660px] flex-col items-center justify-center bg-[#333333]/[0.5] "
            className="  flex h-[80px] max-h-[80px]  w-[660px] flex-col items-center justify-center bg-[var(--color-gradient-modal-header-bg)]"
          >
            <div>
              <span className="text-[16px] font-[800]">受注おめでとう🎉</span>
            </div>
            <div>
              <span className="text-[16px] font-[800]">ダッシュボードに売上を反映させましょう！</span>
            </div>
          </div>
          <div
            //   className="h-[400px] w-[660px]  overflow-hidden bg-[#121212] "
            className="h-[400px] w-[660px]  overflow-hidden bg-[var(--color-gradient-modal-bg)] "
            //   onClick={togglePlay}
          >
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
