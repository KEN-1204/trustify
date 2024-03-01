import { Dispatch, DragEvent, FormEvent, SetStateAction, useEffect, useState } from "react";
import styles from "./ScreenDealBoards.module.css";
import { FaFire, FaSortDown } from "react-icons/fa";
import { FiPlus, FiTrash } from "react-icons/fi";
import { DealBoardTest } from "./DealBoard/DealBoardTest";
import { DealBoard } from "./DealBoard/DealBoard";
import { getInitial } from "@/utils/Helpers/getInitial";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";
import useDashboardStore from "@/store/useDashboardStore";

export const ScreenDealBoards = () => {
  // // Deal Status
  return (
    <>
      {/* <section className={`${styles.company_table_screen} h-screen w-full bg-neutral-900 text-neutral-50`}> */}
      <section className={`${styles.sdb_table_screen} transition-bg05 w-full`}>
        {/* ------------------- タイトル・追加ボタン ------------------- */}
        <div className={`${styles.section_container} bg-[green]/[0]`}>
          <div className={`${styles.section_wrapper}`}>
            <div className={`${styles.section_title} flex-center gap-[6px]`}>
              <span className={`text-[15px]`}>今月ネタ</span>
              <div className={`flex-center h-[24px]`}>
                <FaSortDown className={`text-[18px]`} />
              </div>
            </div>
          </div>
        </div>
        {/* ------------------- タイトル・追加ボタンここまで ------------------- */}

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
        {/* <DealBoard /> */}
        {/* <DealBoard /> */}
        {/* ------------------- ネタ表ボードここまで ------------------- */}
      </section>
    </>
  );
};
