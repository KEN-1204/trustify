import styles from "./BusinessCalendarModal.module.css";
import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";

export const FallbackBusinessCalendarModal = () => {
  // useRef関連
  //   const pdfTargetRef = useRef<HTMLDivElement | null>(null);

  // -------------------------- 🌟pdfのスケールリサイズイベント🌟 --------------------------
  //   const [scalePdf, setScalePdf] = useState(window.innerHeight / 788);
  const getScale = (currentHeight: number) => {
    if (currentHeight > 788) {
      return currentHeight / 788;
    } else {
      return 1;
    }
  };
  //   useEffect(() => {
  //     const handleResize = () => {
  //       setScalePdf(getScale(window.innerHeight));
  //       // if (!pdfTargetRef.current) return;
  //       // pdfTargetRef.current.style.transform = `scale(${getScale(window.innerHeight)})`;
  //     };

  //     window.addEventListener("resize", handleResize);

  //     // コンポーネントのアンマウント時にイベントリスナーを削除
  //     return () => window.removeEventListener("resize", handleResize);
  //   }, []);

  return (
    <>
      {/* オーバーレイ z-index: 1000; */}
      <div className={`${styles.overlay}`}></div>
      {/* ------------------------プレビューモーダルエリア------------------------ */}
      <div className={`${styles.preview_modal_area_twin} space-x-[6vw]`}>
        <div className={`${styles.preview_modal}`}>
          {/* ----------------------------- 🌟カレンダーPDFコンポーネント🌟 ----------------------------- */}
          <div
            className={`${styles.pdf} ${styles.loading}`}
            style={{ transform: `scale(${getScale(window.innerHeight)})`, padding: "0px", backgroundColor: "#aaa" }}
          >
            <SkeletonLoadingLineCustom h="100%" w="100%" rounded="0px" />
          </div>
          {/* ----------------------------- ✅カレンダーPDFコンポーネント✅ ----------------------------- */}
        </div>
      </div>
      {/* ------------------------プレビューモーダルエリア------------------------ */}
    </>
  );
};
