import { FallbackTargetContainer } from "../../FallbackTargetContainer";
import styles from "../../../DashboardSalesTargetComponent.module.css";
import { FiPlus } from "react-icons/fi";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { mappingEntityName } from "@/utils/mappings";
import { MdSaveAlt } from "react-icons/md";

type Props = {
  isUpsertSalesTargetTable?: boolean;
  fiscalYear: number;
  currentLevel: string;
  step: number;
  language: string;
  getActiveSteps: (
    num: number
  ) =>
    | "border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]"
    | "border-[var(--color-border-light)] bg-[var(--color-edit-bg-solid)] text-[var(--color-text-sub)]";
};

export const FallbackUpsertSettingTargetEntityGroup = ({
  isUpsertSalesTargetTable = true,
  fiscalYear,
  currentLevel,
  step,
  language,
  getActiveSteps,
}: Props) => {
  return (
    <div className={`setting_target_container fixed left-0 top-0 z-[80] h-[100vh] w-[100vw] bg-[red]/[0]`}>
      <div className={`${styles.upsert_setting_container} relative flex h-full w-full`}>
        <div className={`${styles.main_container_setting} z-[1200] flex h-full w-full bg-[yellow]/[0]`}>
          <div className={`${styles.spacer_left}`}></div>
          <div className={`${styles.main_contents_wrapper} `}>
            <div className={`${styles.spacer_top}`}></div>
            {/* <FallbackTargetContainer isUpsert={true} /> */}
            {/* -------------------------------------- */}
            <div className={`${styles.main_contents_container}`}>
              {isUpsertSalesTargetTable && (
                <section className={`${styles.company_table_screen}`}>
                  <div className={`${styles.title_area} ${styles.upsert} flex w-full justify-between`}>
                    <h1 className={`${styles.title} ${styles.upsert}`}>
                      <span>目標設定</span>
                    </h1>
                    <div className={`${styles.btn_area} flex items-center space-x-[12px]`}>
                      <div className={`${styles.btn} ${styles.basic}`}>
                        <span>戻る</span>
                      </div>
                      <div className={`${styles.btn} ${styles.brand} space-x-[3px]`}>
                        <MdSaveAlt className={`text-[14px] text-[#fff]`} />
                        <span>保存</span>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {!isUpsertSalesTargetTable && (
                <section
                  // className={`${styles.company_screen} space-y-[20px] ${
                  className={`${styles.company_table_screen}`}
                >
                  <div className={`${styles.title_area} flex w-full justify-between`}>
                    <h1 className={`${styles.title} ${styles.upsert} flex items-center space-x-[24px]`}>
                      <div className={`flex items-center space-x-[12px]`}>
                        {(step === 1 || currentLevel === "") && (
                          <>
                            <span className="min-w-max">{fiscalYear}年度</span>
                            <span className="min-w-max">目標設定</span>
                          </>
                        )}
                        {[2, 3].includes(step) && currentLevel !== "" && (
                          <>
                            <span className="min-w-max">{fiscalYear}年度</span>
                            <span className="min-w-max">{mappingEntityName[currentLevel][language]}</span>
                            <span className="min-w-max">目標設定</span>
                          </>
                        )}
                      </div>
                      {/* ----プログレスエリア---- */}
                      <div className="relative flex h-[25px] w-full items-center">
                        {/* プログレスライン */}
                        <div className="absolute left-0 top-[50%] z-[0] h-[1px] w-[145px] bg-[var(--color-progress-bg)]"></div>
                        {/* ○1 */}
                        <div
                          className={`flex-center z-[1] mr-[15px] h-[25px] w-[25px] cursor-pointer rounded-full border border-solid ${getActiveSteps(
                            1
                          )}`}
                        >
                          <span className={`text-[12px] font-bold`}>1</span>
                        </div>
                        {/* ○2 */}
                        <div
                          className={`flex-center  z-[1] mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid ${getActiveSteps(
                            2
                          )}`}
                        >
                          <span className={`text-[12px] font-bold`}>2</span>
                        </div>
                        {/* ○3 */}
                        <div
                          className={`flex-center  z-[1] mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid ${getActiveSteps(
                            3
                          )}`}
                        >
                          <span className={`text-[12px] font-bold`}>3</span>
                        </div>
                        {/* ○4 */}
                        <div
                          className={`flex-center  z-[1] mr-[15px] h-[25px] w-[25px] cursor-not-allowed rounded-full border border-solid ${getActiveSteps(
                            4
                          )}`}
                        >
                          <span className={`text-[12px] font-bold`}>4</span>
                        </div>
                      </div>
                      {/* ----プログレスエリア ここまで---- */}
                    </h1>
                  </div>
                </section>
              )}

              <section
                className={`${styles.main_section_area} flex-center`}
                style={{ minHeight: `calc(100vh - 56px - 100px)` }}
              >
                <SpinnerBrand bgColor="var(--color-bg-dashboard)" />
              </section>
            </div>
            {/* -------------------------------------- */}
          </div>
        </div>
      </div>
    </div>
  );
};
