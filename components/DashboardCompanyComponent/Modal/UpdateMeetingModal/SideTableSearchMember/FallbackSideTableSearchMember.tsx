import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { neonCycleIcon, neonSearchIcon, neonSearchIconFallback } from "@/components/assets";
import { Dispatch, SetStateAction, memo, useCallback, useEffect, useRef, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { MdOutlineDataSaverOff } from "react-icons/md";
import styles from "../UpdateMeetingModal.module.css";
import { Contact_row_data } from "@/types";
import { useMedia } from "react-use";
import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";
import { ImInfo } from "react-icons/im";

type Props = {
  isOpenSearchMemberSideTable: boolean;
  searchSignatureStamp?: boolean;
};

export const FallbackSideTableSearchMember = ({ isOpenSearchMemberSideTable, searchSignatureStamp = false }: Props) => {
  const searchAttendeeFields = [
    {
      title: "社員名",
    },
    {
      title: "社員番号・ID",
    },
    {
      title: "事業部",
    },
    {
      title: "係・チーム",
    },
    {
      title: "事業所・営業所",
    },
  ];

  return (
    <>
      {/* オーバーレイ */}
      <div
        // className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00800030]`}
        className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00000000]`}
        //   onClick={() => setIsOpenSearchAttendeesSideTable(false)}
      ></div>
      {/* サイドテーブル */}
      <div
        className={`${styles.side_table} ${styles.change_member} z-[1300] pt-[30px] ${
          isOpenSearchMemberSideTable ? `${styles.active}` : ``
        }`}
        // className={`${styles.side_table} z-[1200] pt-[30px] ${
        //   !isOpenSearchAttendeesSideTable ? `${styles.active}` : ``
        // }`}
      >
        {/* タイトルエリア */}
        <div className="flex h-auto w-full flex-col px-[30px] 2xl:px-[30px]">
          <div className={`relative flex h-full w-full items-center justify-between`}>
            <h3 className="space-y-[1px] text-[22px] font-bold">
              <div className={`flex items-start space-x-[9px]`}>
                {!searchSignatureStamp && <span>メンバー検索</span>}
                {searchSignatureStamp && <span>印鑑データ設定</span>}
                <span>{neonSearchIcon("30")}</span>
                {/* <span>{neonCycleIcon("30")}</span> */}
              </div>
              <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]"></div>
            </h3>
            <div
              className={`z-1 flex-center absolute right-[-10px] top-[50%]  h-[36px] w-[36px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[#666]`}
              //   onClick={() => setIsOpenSearchAttendeesSideTable(false)}
            >
              <BsChevronRight className="text-[24px]" />
            </div>
          </div>
        </div>
        {/* 条件入力エリア */}
        <div className="mt-[20px] h-full max-h-[33vh] w-full overflow-y-scroll bg-[#ffffff00] pb-[90px]">
          <div className="flex h-auto w-full flex-col">
            <div className={`flex min-h-[30px] items-end justify-between px-[30px]`}>
              <h3 className="flex min-h-[30px] max-w-max items-end space-y-[1px] text-[14px] font-bold ">
                <div className="flex items-end space-x-[10px]">
                  {!searchSignatureStamp && <span>条件を入力してメンバーを検索</span>}
                  {searchSignatureStamp && <span>条件を入力して自身の印鑑データを検索</span>}
                  <div className="pointer-events-none flex min-h-[30px] items-end pb-[2px]">
                    <ImInfo className={`min-h-[18px] min-w-[18px] text-[var(--color-bg-brand-f)]`} />
                  </div>
                </div>
              </h3>
              <div className="flex pr-[0px]">
                <RippleButton
                  title={`検索`}
                  minHeight="30px"
                  minWidth="78px"
                  fontSize="13px"
                  bgColor="var(--color-bg-brand-f50)"
                  bgColorHover="var(--color-btn-brand-f-hover)"
                  border="var(--color-bg-brand-f)"
                  borderRadius="6px"
                  classText={`select-none`}
                  clickEventHandler={() => {
                    // setIsOpenSettingInvitationModal(true);
                  }}
                />
              </div>
            </div>
            <ul className={`mt-[20px] flex flex-col text-[13px] text-[var(--color-text-title)]`}>
              {searchAttendeeFields.map((item, index) => (
                <li
                  key={item.title + index.toString()}
                  className={`relative flex h-[56px] w-full min-w-max items-center justify-between px-[30px] py-[6px] text-[#fff] ${styles.side_table_search_list}`}
                >
                  <div className={`${styles.list_title_area} flex min-w-[120px] items-center`}>
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>{item.title}</span>
                      {/* <span className={``}>：</span> */}
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                    value={""}
                    // onChange={(e) => item.setInputValue(e.target.value)}
                    // onBlur={() => item.setInputValue(item.inputValue.trim())}
                    readOnly
                  />
                </li>
              ))}
            </ul>
            {/* {Array(20)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className={`${index % 2 === 1 ? `bg-red-100` : `bg-blue-100`} min-h-[60px] w-full`}
                  ></div>
                ))} */}
          </div>
        </div>

        <hr className="my-[0px] min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />

        {/* 担当者一覧エリア */}
        {/* <div className="h-[40vh] w-full bg-[#ffffff90] px-[30px] 2xl:px-[30px]"></div> */}
        <div
          //   ref={sideTableScrollContainerRef}
          className="flex h-full max-h-[calc(100vh-(30px+36px+20px+33vh+1px+0px))] w-full flex-col overflow-y-scroll bg-[#ffffff00] pb-[90px]"
        >
          <div
            //   ref={sideTableScrollItemRef}
            className="flex h-auto w-full flex-col"
          >
            <div
              //   ref={sideTableScrollHeaderRef}
              className={`sticky top-0 flex min-h-[30px] items-end justify-between px-[30px] pb-[18px] pt-[18px] ${styles.side_table_attendees_header}`}
            >
              <h3 className="flex min-h-[30px] max-w-max items-center space-y-[1px] text-[14px] font-bold">
                {!searchSignatureStamp && <span>メンバーを選択してデータの所有者を変更</span>}
                {searchSignatureStamp && <span>自分のデータを選択して見積にデータ印を設定</span>}
              </h3>
              <div className="flex">
                <RippleButton
                  title={`追加`}
                  minHeight="30px"
                  minWidth="78px"
                  fontSize="13px"
                  textColor={`#666`}
                  bgColor={`#33333390`}
                  bgColorHover={`#33333390`}
                  border={`var(--color-bg-brandc0)`}
                  borderRadius="6px"
                  classText={`select-none hover:cursor-not-allowed`}
                  //   clickEventHandler={() => {
                  //     // setIsOpenSettingInvitationModal(true);
                  //   }}
                />
              </div>
            </div>
            {/* 担当者一覧エリア */}
            <ul className={`flex h-auto w-full flex-col`}>
              {Array(5)
                .fill(null)
                .map((_, index) => (
                  <li
                    key={index}
                    className={`${styles.attendees_list} flex min-h-[44px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--color-bg-brand-f30)]`}
                  >
                    {/* <div
                      className={`${styles.attendees_list_item_Icon} flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                    >
                      <span className={`text-[20px]`}>伊</span>
                    </div> */}
                    <div className={`mr-[15px] min-h-[48px] min-w-[48px] rounded-full`}>
                      <SkeletonLoadingLineCustom rounded="50%" h="48px" w="48px" />
                    </div>
                    <div
                      className={`${styles.attendees_list_item_lines_group} flex h-full w-full flex-col justify-center space-y-[10px] pl-[5px] pr-[30px] text-[12px]`}
                    >
                      {/* 会社・部署 */}
                      <div className={`${styles.attendees_list_item_line} flex space-x-[4px] text-[13px]`}>
                        {/* <span>株式会社トラスティファイ</span>
                        <span>代表取締役</span> */}
                        {/* <SkeletonLoadingLineCustom w="410px" h="14px" rounded="12px" /> */}
                        <SkeletonLoadingLineCustom w="93%" h="14px" rounded="12px" />
                      </div>
                      {/* 役職・名前 */}
                      <div className={`${styles.attendees_list_item_line} flex space-x-[4px]`}>
                        {/* <span>CEO</span>
                        <span className="!ml-[10px]">伊藤 謙太</span> */}
                        {/* <SkeletonLoadingLineCustom w="320px" h="14px" rounded="12px" /> */}
                        <SkeletonLoadingLineCustom w="68%" h="14px" rounded="12px" />
                      </div>
                      <div className={`${styles.attendees_list_item_line} flex space-x-[10px]`}>
                        {/* <div className="flex space-x-[4px] text-[#ccc]">
                          <span>東京都港区芝浦4-20-2 ローズスクエア12F</span>
                        </div>
                        <span>/</span>
                        <div className={`text-[#ccc]`}>cieletoile.1204@gmail.com</div> */}
                        {/* <SkeletonLoadingLineCustom w="180px" h="14px" rounded="12px" /> */}
                        <SkeletonLoadingLineCustom w="40%" h="14px" rounded="12px" />
                      </div>
                    </div>
                  </li>
                ))}
            </ul>

            {/* {Array(20)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className={`${index % 2 === 1 ? `bg-red-100` : `bg-blue-100`} min-h-[60px] w-full`}
                  ></div>
                ))} */}
          </div>
        </div>
      </div>
    </>
  );
};
