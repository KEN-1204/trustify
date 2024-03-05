import { Dispatch, DragEvent, FormEvent, MouseEvent, SetStateAction, memo, useEffect, useState } from "react";
import styles from "./ScreenDealBoards.module.css";
import { DealBoard } from "./DealBoard/DealBoard";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";

// 🌠各メンバーのネタ表を一覧で表示するコンポーネント
const ScreenDealBoardsMemo = () => {
  // SalesProgressで選択されたエンティティのidを取得する
  // 🔹事業部、課の場合
  //  ・SalesProgress: 全体と個別メンバー選択 選択されたメンバーのid配列をuseQueryで取得
  //  ・ScreenDealBoards: useQueryのキャッシュからid配列を取得して、id数分のDealBoardをidをPropsで渡してmapで展開
  //  ・DealBoard: 各DealBoardコンポーネント内でPropsで受け取ったidを使ってuseQueryで個別メンバーのネタ表を取得
  // 🔹係の場合
  //  ・人数が少ないので、デフォルトで全てのメンバーにチェックが初めからついている形にする
  // 🔹メンバーの場合
  //  ・サイドテーブルでメンバーを取得して表示

  return (
    <>
      {/* <section className={`${styles.company_table_screen} h-screen w-full bg-neutral-900 text-neutral-50`}> */}
      <section className={`${styles.screen_deal_boards} transition-bg05 w-full`}>
        {/* ------------------- ネタ表ボード ------------------- */}
        {Array(3)
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
                    {/* <div className={`flex flex-col justify-end `}>
                      <div className={`${styles.sub_info} pt-[0px]`}>216088</div>
                      <div className={`${styles.sub_info} pt-[0px]`}>代表取締役</div>
                    </div> */}
                  </div>
                </div>
              </div>
              <DealBoard />
            </div>
          ))}
        {/* ------------------- ネタ表ボードここまで ------------------- */}
      </section>
    </>
  );
};

export const ScreenDealBoards = memo(ScreenDealBoardsMemo);
