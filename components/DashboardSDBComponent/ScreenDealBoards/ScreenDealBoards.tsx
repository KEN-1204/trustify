import { Dispatch, DragEvent, FormEvent, MouseEvent, SetStateAction, memo, useEffect, useState } from "react";
import styles from "./ScreenDealBoards.module.css";
import { DealBoard } from "./DealBoard/DealBoard";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";

const ScreenDealBoardsMemo = () => {
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
