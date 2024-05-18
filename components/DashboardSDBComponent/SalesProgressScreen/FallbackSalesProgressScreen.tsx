import { IoCaretDownOutline } from "react-icons/io5";
import styles from "../DashboardSDBComponent.module.css";
import { mappingSdbTabName } from "@/utils/selectOptions";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";

type Props = {
  errorMsg?: string | undefined;
};

export const FallbackSalesProgressScreen = ({ errorMsg }: Props) => {
  const language = useStore((state) => state.language);
  const activeTabSDB = useDashboardStore((state) => state.activeTabSDB);
  return (
    <>
      <div className={`${styles.sales_progress_screen}`}>
        <div className={`${styles.section_container}`}>
          <div className={`${styles.section_wrapper}`}>
            <div className={`${styles.left_wrapper} flex items-end`}>
              <div className={`${styles.section_title}`}>
                <div className={`${styles.div_wrapper} flex-center gap-[6px]`}>
                  <span className={``}>{mappingSdbTabName[activeTabSDB][language]}</span>
                  <div className={`${styles.down_icon} flex-center`}>
                    <IoCaretDownOutline className={``} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`flex-center w-full`} style={{ minHeight: `calc(732px - 87px)`, paddingBottom: `87px` }}>
          {!errorMsg ? (
            <SpinnerBrand withBorder withShadow />
          ) : (
            <>
              <p className={`whitespace-pre-wrap`}>{errorMsg}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};
