import { memo, useEffect, useRef, useState } from "react";
import styles from "./BusinessCalendarComponent.module.css";
import useStore from "@/store";

const BusinessCalendarComponentMemo = () => {
  const language = useStore((state) => state.language);
  const pdfTargetRef = useRef<HTMLDivElement | null>(null);
  // エディットモード
  const [isEditMode, setIsEditMode] = useState<string[]>([]);
  // -------------------------- 🌟エディットモード終了🌟 --------------------------
  const handleFinishEdit = () => setIsEditMode([]);
  // -------------------------- ✅エディットモード終了✅ --------------------------

  // -------------------------- 🌟pdfのスケールリサイズイベント🌟 --------------------------
  // const [scalePdf, setScalePdf] = useState(window.innerHeight / 788);
  const getScale = (currentHeight: number) => {
    if (currentHeight > 788) {
      return currentHeight / 788;
    } else {
      return 1;
    }
  };
  useEffect(() => {
    const handleResize = () => {
      if (!pdfTargetRef.current) return;
      // setScalePdf(getScale(window.innerHeight));
      pdfTargetRef.current.style.transform = `scale(${getScale(window.innerHeight)})`;
    };

    window.addEventListener("resize", handleResize);

    // コンポーネントのアンマウント時にイベントリスナーを削除
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ----------------- 🌟編集モードオーバーレイコンポーネント🌟 -----------------
  const EditModeOverlay = () => {
    return (
      <div
        className={`absolute left-[-50vw] top-[-50vh] z-[3500] h-[150vh] w-[150vw] bg-[#00000030]`}
        onClick={handleFinishEdit}
      ></div>
    );
  };
  // ----------------- ✅編集モードオーバーレイコンポーネント✅ -----------------

  return (
    <>
      {/* ----------------- カレンダーPDFコンポーネント ----------------- */}
      <div
        ref={pdfTargetRef}
        className={`${styles.pdf} quotation`}
        // style={{ transform: `scale(${scalePdf})` }}
      >
        {/* ---------------- 左マージン ---------------- */}
        <div className={`${styles.left_margin} h-full w-full min-w-[4%] max-w-[4%]`}></div>
        {/* ---------------- 左マージン ---------------- */}
        {/* ---------------- 真ん中 ---------------- */}
        <div className={`${styles.pdf_main_container} flex h-full w-full flex-col`}>
          {/* エディットモードオーバーレイ */}
          {isEditMode.length > 0 && <EditModeOverlay />}
          <div className={`${styles.top_margin} w-full bg-[red]/[0]`}></div>
          {/* <div className={`${styles.header_area} flex-center relative h-[6%] w-full bg-[aqua]/[0]`}></div> */}
          <div className={`${styles.bottom_margin} w-full bg-[red]/[0]`}></div>
        </div>
        {/* ---------------- 真ん中 ---------------- */}
        {/* ---------------- 右マージン ---------------- */}
        <div className={`${styles.right_margin}  h-full w-full min-w-[4%] max-w-[4%]`}></div>
        {/* ---------------- 右マージン ---------------- */}
      </div>
      {/* ----------------- カレンダーPDFコンポーネント ----------------- */}
    </>
  );
};

export const BusinessCalendarComponent = memo(BusinessCalendarComponentMemo);
