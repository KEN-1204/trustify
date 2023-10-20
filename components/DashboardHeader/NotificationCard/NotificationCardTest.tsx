import React, { FC } from "react";
import styles from "../DashboardHeader.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import Image from "next/image";

type Props = {
  activeNotificationTab: string;
  handleOpenTooltipModal: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, payload: string) => void;
  handleCloseTooltipModal: () => void;
  getInitial: (payload: string) => string;
  avatarUrl: string | null;
};

export const NotificationCardTest: FC<Props> = ({
  activeNotificationTab,
  handleOpenTooltipModal,
  avatarUrl,
  getInitial,
  handleCloseTooltipModal,
}) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  if (activeNotificationTab === "ToDo")
    return (
      <div
        className={`flex min-h-[96px] max-w-[400px] cursor-pointer ${
          activeNotificationTab === "ToDo"
            ? `transition-base-opacity1 opacity-100`
            : `transition-base-opacity04 opacity-0`
        }`}
      >
        <div className={`transition-base-color03 flex h-full w-full py-[16px] hover:bg-[var(--color-bg-sub-re)]`}>
          <div className="flex-center relative mx-[10px] my-[16px] max-h-[24px] max-w-[24px]">
            <div role="gridcell" className={styles.grid_cell}>
              <div
                className={`${styles.grid_select_cell_header}`}
                data-text="完了済みとしてマーク"
                onMouseEnter={(e) => handleOpenTooltipModal(e, "top")}
                onMouseLeave={handleCloseTooltipModal}
              >
                <input
                  type="checkbox"
                  onClick={() => {
                    console.log("チェックボックスクリック");
                    console.log("チェックボックスクリック2");
                    console.log("チェックボックスクリック3");
                  }}
                  className={`${styles.grid_select_cell_header_input}`}
                />
                <svg viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className={`mr-[16px] mt-[2px] flex min-h-[48px] min-w-[48px] justify-center`}>
            {!avatarUrl && (
              <div
                data-text={`${userProfileState?.profile_name}`}
                className={`flex-center h-[48px] w-[48px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
              >
                <span className={`pointer-events-none text-[22px]`}>
                  {userProfileState?.profile_name
                    ? getInitial(userProfileState.profile_name)
                    : `${getInitial("NoName")}`}
                </span>
              </div>
            )}
            {avatarUrl && (
              <div
                data-text={`${userProfileState?.profile_name}`}
                className={`flex-center h-[48px] w-[48px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
              >
                <Image
                  src={avatarUrl}
                  alt="Avatar"
                  className={`pointer-events-none h-full w-full object-cover text-[#fff]`}
                  width={75}
                  height={75}
                />
              </div>
            )}
          </div>
          <div className={`mr-[16px] flex h-auto w-full flex-col text-[var(--color-text-title)]`}>
            <div className={`text-[13px]`}>
              <p>
                <span className="font-bold">Ken</span>さんが
                <span className="font-bold">Kenta Itoさんのチーム</span>
                の所有者として代わりにあなたを任命しました。確認してください。
              </p>
            </div>
            <div className="flex items-center text-[12px]">
              <span className="pl-[0px] pt-[4px]">昨日、15:26</span>
              <div className="pl-[8px] pt-[4px]">
                <div className="min-h-[20px] rounded-full bg-[var(--color-red-tk)] px-[10px] text-[#fff]">
                  <span>New</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div
      className={`flex min-h-[96px] max-w-[400px] cursor-pointer ${
        activeNotificationTab !== "ToDo"
          ? `transition-base-opacity1 opacity-100`
          : `transition-base-opacity04 opacity-0`
      }`}
    >
      <div className={`transition-base-color03 flex h-full w-full py-[16px] hover:bg-[var(--color-bg-sub-re)]`}>
        <div className="flex-center relative mx-[10px] my-[16px] max-h-[24px] max-w-[24px]">
          <div role="gridcell" className={styles.grid_cell}>
            <div
              className={`${styles.grid_select_cell_header}`}
              data-text="完了済みとしてマーク"
              onMouseEnter={(e) => handleOpenTooltipModal(e, "top")}
              onMouseLeave={handleCloseTooltipModal}
            >
              <input
                type="checkbox"
                onClick={() => {
                  console.log("チェックボックスクリック");
                  console.log("チェックボックスクリック2");
                  console.log("チェックボックスクリック3");
                }}
                className={`${styles.grid_select_cell_header_input}`}
              />
              <svg viewBox="0 0 18 18" fill="white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className={`mr-[16px] mt-[2px] flex min-h-[48px] min-w-[48px] justify-center`}>
          {!avatarUrl && (
            <div
              data-text={`${userProfileState?.profile_name}`}
              className={`flex-center h-[48px] w-[48px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip}`}
            >
              <span className={`pointer-events-none text-[22px]`}>
                {userProfileState?.profile_name ? getInitial(userProfileState.profile_name) : `${getInitial("NoName")}`}
              </span>
            </div>
          )}
          {avatarUrl && (
            <div
              data-text={`${userProfileState?.profile_name}`}
              className={`flex-center h-[48px] w-[48px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
            >
              <Image
                src={avatarUrl}
                alt="Avatar"
                className={`pointer-events-none h-full w-full object-cover text-[#fff]`}
                width={75}
                height={75}
              />
            </div>
          )}
        </div>
        <div className={`mr-[16px] flex h-auto w-full flex-col text-[var(--color-text-title)]`}>
          <div className={`text-[13px]`}>
            <p>
              <span className="font-bold">Ken</span>さんが
              <span className="font-bold">Kenta Itoさんのチーム</span>
              の所有者として代わりにあなたを任命しました。確認してください。
            </p>
          </div>
          <div className="flex items-center text-[12px]">
            <span className="pl-[0px] pt-[4px]">昨日、15:26</span>
            <div className="pl-[8px] pt-[4px]">
              <div className="min-h-[20px] rounded-full bg-[var(--color-red-tk)] px-[10px] text-[#fff]">
                <span>New</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
