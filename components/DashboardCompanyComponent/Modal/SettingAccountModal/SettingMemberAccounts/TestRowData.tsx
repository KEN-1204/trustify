import React, { FC, useState } from "react";
import styles from "./SettingMemberAccounts.module.css";
import { BsCheck2 } from "react-icons/bs";

export const TestRowData: FC = () => {
  // チェックボックス
  const [checked, setChecked] = useState(false);

  // 頭文字のみ抽出
  const getInitial = (name: string) => name[0];
  return (
    <div role="row" className={`${styles.grid_row}`}>
      <div role="gridcell" className={`${styles.grid_cell} flex items-center`}>
        <div
          className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff]  hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
        >
          <span className={`text-[20px]`}>{`${getInitial("NoName")}`}</span>
        </div>
        <span>伊藤 謙太</span>
      </div>
      <div role="gridcell" className={styles.grid_cell}>
        cieletoile.1204@gmail.com
      </div>
      <div role="gridcell" className={`${styles.grid_cell} relative`}>
        <span>所有者</span>
        {false && (
          <>
            {/* <div
              className="fixed left-[-50%] top-[-50%] z-[50] h-[200vh] w-[200vw]"
              // onClick={() => setIsOpenRoleMenu(false)}
            ></div> */}

            <div className="shadow-all-md absolute left-[0px] top-[60px] z-[100] h-[152px] w-[180px] rounded-[8px] bg-[var(--color-edit-bg-solid)]">
              <ul className={`flex flex-col py-[8px]`}>
                <li
                  className={`flex h-[40px] w-full cursor-pointer items-center justify-between px-[14px] py-[6px] pr-[18px] hover:bg-[var(--color-bg-sub)]`}
                  // onClick={() => {
                  //   if (memberAccount.account_company_role === "company_admin") {
                  //     setIsOpenRoleMenu(false);
                  //   }
                  //   handleChangeRole("company_admin");
                  //   setIsOpenRoleMenu(false);
                  // }}
                >
                  <span className="select-none">管理者</span>

                  <BsCheck2 className="min-h-[16px] min-w-[16px] stroke-[0.5] text-[16px]" />
                </li>
                <li
                  className={`flex h-[40px] w-full cursor-pointer items-center justify-between px-[14px] py-[6px] pr-[18px] hover:bg-[var(--color-bg-sub)]`}
                  // onClick={() => {
                  //   if (memberAccount.account_company_role === "company_member") {
                  //     setIsOpenRoleMenu(false);
                  //   }
                  //   handleChangeRole("company_member");
                  //   setIsOpenRoleMenu(false);
                  // }}
                >
                  <span className="select-none">メンバー</span>
                  {/* {memberAccount.account_company_role === "company_member" && (
                  <BsCheck2 className="min-h-[16px] min-w-[16px] stroke-[0.5] text-[16px]" />
                )} */}
                </li>
                <li className="flex-center h-[16px] w-full">
                  <hr className="w-full border-t border-solid border-[var(--color-border-table)]" />
                </li>
                <li
                  className={`flex h-[40px] w-full cursor-pointer items-center px-[14px] py-[6px] hover:bg-[var(--color-bg-sub)]`}
                  // onClick={() => {
                  //   setIsOpenRoleMenu(false);
                  // }}
                >
                  <span className="select-none">チームから削除</span>
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      <div role="gridcell" className={styles.grid_cell}>
        <div className={`${styles.grid_select_cell_header}`}>
          <input
            type="checkbox"
            checked={checked}
            onChange={() => setChecked(!checked)}
            className={`${styles.grid_select_cell_header_input}`}
          />
          <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
          </svg>
        </div>
      </div>
    </div>
  );
};
