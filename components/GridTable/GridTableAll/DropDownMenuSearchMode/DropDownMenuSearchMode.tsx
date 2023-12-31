import useDashboardStore from "@/store/useDashboardStore";
import React, { Dispatch, SetStateAction } from "react";
import styles from "./DropDownMenuSearchMode.module.css";
import { MdOutlineDataSaverOff } from "react-icons/md";
import NextImage from "next/image";

type Props = {
  setIsOpenDropdownMenuSearchMode: Dispatch<SetStateAction<boolean>>;
};

export const DropDownMenuSearchMode = ({ setIsOpenDropdownMenuSearchMode }: Props) => {
  const isFetchAllCompanies = useDashboardStore((state) => state.isFetchAllCompanies);
  const setIsFetchAllCompanies = useDashboardStore((state) => state.setIsFetchAllCompanies);
  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed left-[-50%] top-[-50%] z-[1000] h-[200vh] w-[200vw]"
        onClick={() => {
          setIsOpenDropdownMenuSearchMode(false);
        }}
      ></div>
      {/* モーダル */}
      <div
        className={`shadow-all-md border-real-with-shadow fade03 absolute right-[0px] top-[33px] z-[2000] flex h-auto w-fit min-w-[276px] flex-col rounded-[4px] bg-[var(--color-edit-bg-solid)]`}
      >
        {/* 説明エリア */}
        <div className={`relative flex h-auto w-full flex-col items-start space-y-[6px] px-[24px] py-[16px]`}>
          <h2 className="flex items-center space-x-[12px] text-[16px] font-bold text-[var(--color-text-title)]">
            <span>サーチモード設定</span>
            <span>
              {/* <img width="24" height="24" src="https://img.icons8.com/3d-fluency/24/job.png" alt="job" /> */}
              {/* <NextImage width={24} height={24} src={`https://img.icons8.com/3d-fluency/24/job.png`} alt="setting" /> */}
              {/* <NextImage width={24} height={24} src={`/assets/images/icons/icons8-job-94.png`} alt="setting" /> */}
              <NextImage
                width={24}
                height={24}
                src={`/assets/images/icons/business/icons8-process-94.png`}
                alt="setting"
                className={`${styles.title_icon}`}
              />
            </span>
          </h2>
          <p className="text-start text-[12px] text-[var(--color-text-title)]">
            検索タイプで「条件に一致する全ての会社を表示」、「条件に一致する自社で作成した会社のみを表示」を切り替えることが可能です。
          </p>
        </div>

        <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" />

        {/* テーマ・アカウント設定エリア */}
        <div className="flex w-full flex-col">
          <ul className={`flex flex-col space-y-[6px] pb-[8px] pt-[6px] text-[13px] text-[var(--color-text-title)]`}>
            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
              //   onMouseEnter={() => setHoveredThemeMenu(true)}
              //   onMouseLeave={() => setHoveredThemeMenu(false)}
            >
              <div className="flex items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>検索タイプ</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div>
                <select
                  className={` ml-auto h-full w-full ${styles.select_box}`}
                  value={isFetchAllCompanies ? `All` : `Own`}
                  onChange={(e) => {
                    setIsOpenDropdownMenuSearchMode(false);
                    setIsFetchAllCompanies(e.target.value === "All");
                  }}
                >
                  <option value="All">条件に一致する全ての会社</option>
                  <option value="Own">条件に一致する自社で作成した会社のみ</option>
                </select>
              </div>
            </li>
            {/* <li
              className={`flex h-[40px] w-full min-w-max cursor-pointer items-center space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] hover:underline ${styles.dropdown_list}`}
            >
              <div className="flex items-center">
                <VscSettings className="mr-[18px] min-h-[18px] min-w-[18px] stroke-[0.3] text-[18px]" />
                <span className="select-none">アカウント設定：</span>
              </div>
              <div>
                <select
                  className={`ml-auto h-full w-full ${styles.select_box}`}
                  value={isFetchAllCompanies ? `All` : `Own`}
                  onChange={(e) => setIsFetchAllCompanies(e.target.value === "All")}
                >
                  <option value="All">条件に一致する全ての会社</option>
                  <option value="Own">条件に一致する自社で作成した会社のみ</option>
                </select>
              </div>
            </li> */}
          </ul>
        </div>
      </div>
    </>
  );
};
