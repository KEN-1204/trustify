import {
  Dispatch,
  DragEvent,
  FormEvent,
  Fragment,
  MouseEvent,
  SetStateAction,
  Suspense,
  memo,
  useEffect,
  useState,
} from "react";
import styles from "./ScreenDealBoards.module.css";
import { DealBoard } from "./DealBoard/DealBoard";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";
import { MemberAccounts } from "@/types";
import useDashboardStore from "@/store/useDashboardStore";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { ProgressCircle } from "@/components/Parts/Charts/ProgressCircle/ProgressCircle";
import { ProgressNumber } from "@/components/Parts/Charts/ProgressNumber/ProgressNumber";
import { GradientModal } from "@/components/Parts/GradientModal/GradientModal";
import { EditModalDealCard } from "./EditModalDealCard/EditModalDealCard";
import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";

type Props = {
  memberList: MemberAccounts[];
  periodType: string;
  period: number;
};

// 🌠各メンバーのネタ表を一覧で表示するコンポーネント
const ScreenDealBoardsMemo = ({ memberList, periodType, period }: Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const isOpenCongratulationsModal = useDashboardStore((state) => state.isOpenCongratulationsModal);
  const setIsOpenCongratulationsModal = useDashboardStore((state) => state.setIsOpenCongratulationsModal);
  const setIsRequiredInputSoldProduct = useDashboardStore((state) => state.setIsRequiredInputSoldProduct);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);
  // 選択中のネタカード
  const selectedDealCard = useDashboardStore((state) => state.selectedDealCard);
  // ネタカードクリック時に表示する概要モーダル
  const isOpenDealCardModal = useDashboardStore((state) => state.isOpenDealCardModal);

  if (!userProfileState || !userProfileState?.company_id) return null;

  if (!periodType || !period) {
    return (
      <div className="flex-center h-[80dvh] w-[100vw]">
        {/* <SpinnerBrand bgColor="var(--color-sdb-bg)" /> */}
        <span></span>
      </div>
    );
  }

  // SalesProgressで選択されたエンティティのidを取得する
  // 🔸個別メンバーのネタ表は最大表示数を10人までにする(個別に選択して負荷を少なくする)
  // 🔹全社の場合
  //  ・個別のメンバーのネタ表追加はなし 全体のデータのみ
  // 🔹事業部、課の場合
  //  ・SalesProgress: 全体と個別メンバー選択 選択されたメンバーのid配列をuseQueryで取得
  //  ・ScreenDealBoards: useQueryのキャッシュからid配列を取得して、id数分のDealBoardをidをPropsで渡してmapで展開
  //  ・DealBoard: 各DealBoardコンポーネント内でPropsで受け取ったidを使ってuseQueryで個別メンバーのネタ表を取得
  // 🔹係の場合
  //  ・人数が少ないので、デフォルトで全てのメンバーにチェックが初めからついている形にする
  // 🔹メンバーの場合
  //  ・サイドテーブルでメンバーを取得して表示

  // 全てのボードがマウントした後にProgressCircleをマウントさせる
  const [isRenderProgress, setIsRenderProgress] = useState(false);

  useEffect(() => {
    if (periodType && period) {
      setTimeout(() => {
        setIsRenderProgress(true);
        console.log("ProgressCircleレンダリング");
      }, 1500);
    }
  }, []);

  // 選択されたメンバーのidをDealBoardにpropsで渡す
  const activeThemeColor = useDashboardStore((state) => state.activeThemeColor);

  const FallbackDealBoard = () => {
    return (
      <div className="flex-center h-[50dvh] w-[100vw]">
        <SpinnerBrand
          bgColor="var(--color-sdb-bg)"
          bgTransition={`${activeThemeColor !== "theme-black-gradient" ? `transition-bg05` : ``}`}
        />
      </div>
    );
  };

  // 受注済みに変更後に表示するモーダルの「反映する」ボタンクリック時に実行される関数
  const handleClickActiveSoldModal = () => {
    setIsOpenUpdatePropertyModal(true); // 案件編集モーダルを開く
    setIsRequiredInputSoldProduct(true); // 案件編集モーダルに受注後売上入力ステータスを渡す
    setIsOpenCongratulationsModal(false); // お祝いモーダルを閉じる
  };
  // 受注済みに変更後に表示するモーダルの「反映する」ボタンクリック時に実行される関数
  const handleClickCancelSoldModal = () => {
    setSelectedRowDataProperty(null); // 選択中のRowDataをリセット
    setIsOpenCongratulationsModal(false); // お祝いモーダルを閉じる
  };

  return (
    <>
      {/* <section className={`${styles.company_table_screen} h-screen w-full bg-neutral-900 text-neutral-50`}> */}
      <section className={`${styles.screen_deal_boards} transition-bg05 w-full`}>
        {/* ------------------- ネタ表ボード ------------------- */}
        {memberList.map((memberObj, index) => {
          return (
            <Fragment key={`${index}_board`}>
              <div
                // className={`${styles.entity_board_container} bg-[red]/[0]`}
                className={`${styles.entity_board_container} bg-[red]/[0] ${
                  isRenderProgress ? `${styles.fade_bg}` : ``
                }`}
              >
                <div className={`${styles.entity_detail_container} bg-[green]/[0]`}>
                  <div className={`${styles.entity_detail_wrapper}`}>
                    <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
                      <AvatarIcon
                        // size={33}
                        size={36}
                        name={memberObj.profile_name ?? "未設定"}
                        withCircle={false}
                        hoverEffect={false}
                        textSize={16}
                        // imgUrl={memberObj.avatar_url ?? null}
                      />
                      <div className={`${styles.entity_name} text-[19px] font-bold`}>
                        <span>{memberObj.profile_name}</span>
                      </div>
                      <div className={`${styles.sub_info} pt-[6px]`}>{memberObj.position_name ?? "役職未設定"}</div>
                      <div className={`${styles.sub_info} pt-[6px]`}>{memberObj.assigned_employee_id_name ?? ""}</div>
                      {/* <div className={`flex flex-col justify-end `}>
                      <div className={`${styles.sub_info} pt-[0px]`}>216088</div>
                      <div className={`${styles.sub_info} pt-[0px]`}>代表取締役</div>
                    </div> */}
                      {/* {isRenderProgress && (
                      <div className={`fade05 relative h-[33px] w-[33px]`} style={{ marginLeft: `24px` }}>
                        <div className="absolute bottom-[-4px] left-0">
                          <ProgressCircle
                            circleId="1"
                            textId="1"
                            progress={78}
                            size={56}
                            strokeWidth={6}
                            fontSize={12}
                            // textVerticalDirReverse={true}
                            textColor="var(--color-text-title)"
                          />
                        </div>
                      </div>
                    )} */}
                      <div
                        className={`relative !ml-[24px] !mr-[12px] flex h-full min-h-[56px] w-auto items-end bg-[red]/[0]`}
                      >
                        <div className="flex h-full min-w-[150px] items-end justify-end">
                          {/* <span className="mb-[-3px] text-[27px]">12,000,000,000</span> */}
                          <ProgressNumber
                            // targetNumber={12000000000}
                            targetNumber={6200000}
                            // targetNumber={0}
                            // startNumber={Math.round(68000 / 2)}
                            // startNumber={Number((68000 * 0.1).toFixed(0))}
                            startNumber={0}
                            duration={4000}
                            // easeFn="Quartic"
                            easeFn="Quintic"
                            fontSize={27}
                            margin="0 0 -3px 0"
                            isReady={isRenderProgress}
                            fade={`fade08_forward`}
                            // fade={`fade10_forward`}
                          />
                        </div>
                        <div className="relative h-full min-w-[33px]">
                          <div className="absolute left-[66%] top-[68%] min-h-[2px] w-[30px] translate-x-[-50%] translate-y-[-50%] rotate-[120deg] bg-[var(--color-text-title)]"></div>
                        </div>
                        <div className="mr-[12px] flex h-full min-w-max items-end justify-start">
                          <span className="text-[16px]">9,000,000</span>
                          {/* <span className="text-[16px]">12,000,000,000</span> */}
                        </div>
                      </div>
                      <div className={`relative h-[56px] w-[66px]`} style={{ margin: `0` }}>
                        <div className="absolute bottom-[-6px] right-0">
                          <ProgressCircle
                            circleId="1"
                            textId="1"
                            progress={78}
                            // progress={0}
                            duration={4000}
                            easeFn="Quartic"
                            size={66}
                            strokeWidth={7}
                            fontSize={14}
                            textColor="var(--color-text-title)"
                            isReady={isRenderProgress}
                            fade={`fade08_forward`}
                            // fade={`fade10_forward`}
                          />
                        </div>
                      </div>
                      {/* {isRenderProgress && (
                      <div
                        className={`${styles.progress_circle} relative h-[56px] w-[66px]`}
                        // style={{ marginLeft: `24px` }}
                      >
                        <div className="absolute bottom-[-6px] right-0">
                          <ProgressCircle
                            circleId="1"
                            textId="1"
                            progress={78}
                            duration={4000}
                            easeFn="Quartic"
                            size={66}
                            strokeWidth={7}
                            fontSize={14}
                            // progress={78}
                            // size={56}
                            // strokeWidth={6}
                            // fontSize={12}
                            // textVerticalDirReverse={true}
                            textColor="var(--color-text-title)"
                            isReady={isRenderProgress}
                            fade={`fade08-forward`}
                          />
                        </div>
                      </div>
                    )} */}
                    </div>
                  </div>
                  <div className={`${styles.status_col_wrapper}`}>
                    <div className={`${styles.status_flex_wrapper}`}>
                      {/* <div className={`relative mr-[12px] flex h-full w-auto items-end bg-[red]/[0]`}>
                      <span
                        className={`absolute left-[30%] top-[36%] translate-x-[-50%] translate-y-[-50%] text-[27px] `}
                      >
                        6,800,000
                      </span>
                      <span className="text-[27px] opacity-0">6,800,000</span>
                      <div className="h-full min-w-[39px] opacity-0"></div>
                      <div className="absolute left-[62%] top-[50%]  min-h-[2px] w-[56px] translate-x-[-50%] translate-y-[-50%] rotate-[139deg] bg-[white]"></div>
                      <span className={`absolute right-[0%] top-[70%] translate-y-[-50%] text-[16px] `}>
                        12,000,000
                      </span>
                      <span className="text-[16px] opacity-0">12,000,000</span>
                    </div> */}
                      {/* <div className={`relative mr-[24px] flex h-full w-auto items-end bg-[red]/[0]`}>
                      <span className="mb-[-3px] text-[27px] ">6,800,000</span>
                      <div className="h-full min-w-[33px] opacity-0"></div>
                      <div className="absolute left-[60%] top-[68%]  min-h-[2px] w-[33px] translate-x-[-50%] translate-y-[-50%] rotate-[120deg] bg-[white]"></div>
                      <span className="text-[16px] ">12,000,000</span>
                    </div>
                    {isRenderProgress && (
                      <div
                        className={`fade05 relative h-[56px] w-[66px]`}
                        // style={{ marginLeft: `24px` }}
                      >
                        <div className="absolute bottom-[-6px] right-0">
                          <ProgressCircle
                            circleId="1"
                            textId="1"
                            progress={78}
                            size={66}
                            strokeWidth={7}
                            fontSize={14}
                            // progress={78}
                            // size={56}
                            // strokeWidth={6}
                            // fontSize={12}
                            // textVerticalDirReverse={true}
                            textColor="var(--color-text-title)"
                          />
                        </div>
                      </div>
                    )} */}
                      <div className={`${styles.right_spacer}`}></div>
                    </div>
                  </div>
                </div>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                  <Suspense fallback={<FallbackDealBoard />}>
                    <DealBoard
                      companyId={userProfileState.company_id!}
                      userId={memberObj.id}
                      periodType={periodType}
                      period={period}
                    />
                  </Suspense>
                </ErrorBoundary>
              </div>
              {/* {isRenderProgress && (
                <div className="flex-center fade08_forward my-[12px] w-full px-[24px]">
                  <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" />
                </div>
              )} */}
            </Fragment>
          );
        })}

        {/* ------------------- ネタ表ボードここまで ------------------- */}

        {/* ------------------- テスト ------------------- */}
        {/* {Array(3)
          .fill(null)
          .map((_, index) => (
            <div key={`${index}_board`} className={`${styles.entity_board_container} bg-[red]/[0]`}>
              <div className={`${styles.entity_detail_container} bg-[green]/[0]`}>
                <div className={`${styles.entity_detail_wrapper}`}>
                  <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
                    <AvatarIcon size={33} name="伊藤謙太" withCircle={false} hoverEffect={false} />
                    <div className={`${styles.entity_name} text-[19px] font-bold`}>
                      <span>伊藤 謙太</span>
                    </div>
                    <div className={`${styles.sub_info} pt-[6px]`}>代表取締役</div>
                    <div className={`${styles.sub_info} pt-[6px]`}>216088</div>
                  </div>
                </div>
              </div>
              <DealBoard />
            </div>
          ))} */}
        {/* ------------------- テストここまで ------------------- */}
      </section>
      {/* ------------------- ネタ表 詳細・編集モーダル ------------------- */}
      {isOpenDealCardModal && selectedDealCard && <EditModalDealCard />}
      {/* ------------------- ネタ表 詳細・編集モーダル ここまで ------------------- */}
      {/* ------------------- 受注済みに変更後の売上入力モーダル ------------------- */}
      {isOpenCongratulationsModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<FallbackDealBoard />}>
            <GradientModal
              title1="受注おめでとう🎉"
              title2="ダッシュボードに売上を反映させましょう！"
              tagText="受注"
              contentText="受注済みの案件に「売上商品・売上価格・売上日付」を記録することでダッシュボード上に売上実績と達成率が反映されます。"
              btnActiveText="反映する"
              btnCancelText="閉じる"
              illustText="受注おめでとうございます！"
              handleClickActive={handleClickActiveSoldModal}
              handleClickCancel={handleClickCancelSoldModal}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* ------------------- 受注済みに変更後の売上入力モーダル ここまで ------------------- */}
    </>
  );
};

export const ScreenDealBoards = memo(ScreenDealBoardsMemo);
