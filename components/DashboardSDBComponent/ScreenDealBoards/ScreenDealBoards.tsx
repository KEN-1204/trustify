import { Dispatch, DragEvent, FormEvent, MouseEvent, SetStateAction, memo, useEffect, useState } from "react";
import styles from "./ScreenDealBoards.module.css";
import { DealBoard } from "./DealBoard/DealBoard";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";
import { MemberAccounts } from "@/types";
import useDashboardStore from "@/store/useDashboardStore";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";

type Props = {
  memberList: MemberAccounts[];
  periodType: string;
  period: number;
};

// 🌠各メンバーのネタ表を一覧で表示するコンポーネント
const ScreenDealBoardsMemo = ({ memberList, periodType, period }: Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  if (!userProfileState || !userProfileState?.company_id) return null;

  if (!periodType || !period) {
    return (
      <div className="flex-center h-[80dvh] w-[100vw]">
        <SpinnerBrand bgColor="var(--color-sdb-bg)" />
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

  // 選択されたメンバーのidをDealBoardにpropsで渡す

  return (
    <>
      {/* <section className={`${styles.company_table_screen} h-screen w-full bg-neutral-900 text-neutral-50`}> */}
      <section className={`${styles.screen_deal_boards} transition-bg05 w-full`}>
        {/* ------------------- ネタ表ボード ------------------- */}
        {memberList.map((memberObj, index) => {
          return (
            <div key={`${index}_board`} className={`${styles.entity_board_container} bg-[red]/[0]`}>
              <div className={`${styles.entity_detail_container} bg-[green]/[0]`}>
                <div className={`${styles.entity_detail_wrapper}`}>
                  <div className={`${styles.entity_detail} space-x-[12px] text-[12px]`}>
                    <AvatarIcon
                      size={33}
                      name={memberObj.profile_name ?? "未設定"}
                      withCircle={false}
                      hoverEffect={false}
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
                  </div>
                </div>
              </div>
              <DealBoard
                companyId={userProfileState.company_id!}
                userId={memberObj.id}
                periodType={periodType}
                period={period}
              />
            </div>
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
    </>
  );
};

export const ScreenDealBoards = memo(ScreenDealBoardsMemo);
