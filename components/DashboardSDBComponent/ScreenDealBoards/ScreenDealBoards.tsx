import { Dispatch, DragEvent, FormEvent, SetStateAction, useEffect, useState } from "react";
import styles from "./ScreenDealBoards.module.css";
import { FaFire } from "react-icons/fa";
import { FiPlus, FiTrash } from "react-icons/fi";
import { DealBoardTest } from "./DealBoard/DealBoardTest";
import { DealBoard } from "./DealBoard/DealBoard";
import { getInitial } from "@/utils/Helpers/getInitial";
import { AvatarIcon } from "@/components/Parts/AvatarIcon/AvatarIcon";

export const ScreenDealBoards = () => {
  return (
    <>
      {/* <section className={`${styles.company_table_screen} h-screen w-full bg-neutral-900 text-neutral-50`}> */}
      <section className={`${styles.company_table_screen} transition-bg05 w-full `}>
        <div className={`${styles.board_container}`}>
          <div className={`${styles.section_title_area}`}>
            <div className={`${styles.entity_detail_wrapper}`}>
              {/* <div
                className={`flex min-h-[44px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] pl-[0px] hover:bg-[var(--setting-side-bg-select)]`}
              >
                <div
                  className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                >
                  <span className={`text-[20px]`}>{getInitial("伊藤")}</span>
                </div>
                <div className={`flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}>
                  <div className={`text-[13px]`}>
                    <span>伊藤謙太</span>
                  </div>
                  <div className={`text-[var(--color-text-sub)]`}>代表取締役</div>
                </div>
              </div> */}
              <div className={`flex h-[48px] items-center space-x-[12px] text-[12px]`}>
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
        <DealBoard />
        <DealBoard />
      </section>
    </>
  );
};
