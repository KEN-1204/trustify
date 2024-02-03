import React, { Suspense, useEffect, useRef, useState } from "react";
import styles from "./SettingAccountModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useThemeStore from "@/store/useThemeStore";
import { MdClose, MdOutlinePayment } from "react-icons/md";
import { VscAccount } from "react-icons/vsc";
import { AiOutlineTeam } from "react-icons/ai";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import Image from "next/image";
import { IoSettingsOutline } from "react-icons/io5";
import { SettingProducts } from "./SettingMenus/SettingProducts";
import { ErrorBoundary } from "react-error-boundary";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { SettingPaymentAndPlan } from "./SettingPaymentAndPlan/SettingPaymentAndPlan";
import { SettingMemberAccounts } from "./SettingMemberAccounts/SettingMemberAccounts";
import { HiOutlineBuildingOffice2 } from "react-icons/hi2";
import { SettingCompany } from "./SettingCompany/SettingCompany";
import { FallbackSettingPaymentAndPlan } from "./SettingPaymentAndPlan/FallbackSettingPaymentAndPlan";
import { FallbackSettingMemberAccounts } from "./SettingMemberAccounts/FallbackSettingMemberAccounts";
import { SettingProfile } from "./SettingProfile/SettingProfile";
import { FallbackSettingProfile } from "./SettingProfile/FallbackSettingProfile";

export const SettingAccountModal = () => {
  const theme = useThemeStore((state) => state.theme);
  const setIsOpenSettingAccountModal = useDashboardStore((state) => state.setIsOpenSettingAccountModal);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  // const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const settingModalProperties = useDashboardStore((state) => state.settingModalProperties);
  const setSettingModalProperties = useDashboardStore((state) => state.setSettingModalProperties);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const { fullUrl: avatarUrl, isLoading } = useDownloadUrl(userProfileState?.avatar_url, "avatars");
  // モーダルのbottom, topなどの位置特定用ref => 特にmodalのbottomはメンバー役割クリック時に必要
  const settingModalRef = useRef<HTMLDivElement | null>(null);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenSettingAccountModal(false);
  };

  // 頭文字のみ抽出
  const getInitial = (name: string) => name[0];

  // モーダルの動的に変化する画面からのx, yとモーダルのwidth, heightを取得
  useEffect(() => {
    if (settingModalRef.current === null) return console.log("❌無し");
    const rect = settingModalRef.current.getBoundingClientRect();
    if (settingModalProperties !== null && settingModalProperties.left === rect.left)
      return console.log("✅モーダル位置サイズ格納済み", settingModalProperties);

    const left = rect.left;
    const top = rect.top;
    const right = rect.right;
    const bottom = rect.bottom;
    const width = rect.width;
    const height = rect.height;

    const payload = { left: left, top: top, right: right, bottom: bottom, width: width, height: height };
    console.log("🔥モーダル位置サイズ格納", payload);
    setSettingModalProperties(payload);
  }, [settingModalRef.current]);

  console.log("SettingAccountModalコンポーネント再レンダリング", settingModalProperties, userProfileState);

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* {!loadingGlobalState && (
        <div className={`${styles.loading_overlay_modal_outside}`}>
          <div className={`${styles.loading_overlay_modal_inside}`}>
            <SpinnerIDS scale={"scale-[0.5]"} />
          </div>
        </div>
      )} */}
      <div className={`${styles.container} fade02`} ref={settingModalRef}>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* =============================== 左側エリア =============================== */}
          <div className={`${styles.left_container} h-full w-3/12 `}>
            <div className={`mb-[10px] truncate px-[10px] pb-[6px] pt-0`}>
              <div className={`w-full ${styles.section_title}`}>アカウント設定</div>
            </div>
            <div className={`mb-[12px] flex h-[44px] w-full items-center truncate pl-[4px]`}>
              {!avatarUrl && (
                <div
                  // data-text="ユーザー名"
                  className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                  // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                  // onMouseLeave={handleCloseTooltip}
                >
                  {/* <span>K</span> */}
                  <span className={`text-[20px]`}>
                    {userProfileState?.profile_name
                      ? getInitial(userProfileState.profile_name)
                      : `${getInitial("NoName")}`}
                  </span>
                </div>
              )}
              {avatarUrl && (
                <div
                  className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
                >
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    className={`h-full w-full object-cover text-[#fff]`}
                    width={75}
                    height={75}
                  />
                </div>
              )}
              <div className={`flex h-full flex-col pt-[4px] text-[12px]`}>
                <div className={`font-bold`}>
                  <span>{userProfileState?.profile_name ? userProfileState.profile_name : "未設定"}</span>
                  {/* <span> Ito</span> */}
                </div>
                <div className={`text-[var(--color-text-sub)]`}>
                  {userProfileState?.email ? userProfileState.email : "未設定"}
                </div>
              </div>
            </div>
            <div
              className={`rounded-[4px]] mb-[3px] flex h-[40px] w-full cursor-pointer select-none items-center truncate rounded-[4px] px-[10px] py-[6px] font-bold hover:bg-[var(--setting-side-bg-select)] ${
                selectedSettingAccountMenu === "Profile" ? `bg-[var(--setting-side-bg-select)]` : ``
              }`}
              onClick={() => setSelectedSettingAccountMenu("Profile")}
            >
              <div className="flex-center mr-[15px] h-[24px] w-[24px]">
                <VscAccount className="text-[22px]" />
              </div>
              <span>プロフィール</span>
            </div>
            <div
              className={`rounded-[4px]] mb-[3px] flex h-[40px] w-full cursor-pointer select-none items-center truncate rounded-[4px] px-[10px] py-[6px] font-bold hover:bg-[var(--setting-side-bg-select)] ${
                selectedSettingAccountMenu === "Company" ? `bg-[var(--setting-side-bg-select)]` : ``
              }`}
              onClick={async () => {
                if (
                  userProfileState?.account_company_role !== "company_admin" &&
                  userProfileState?.account_company_role !== "company_owner"
                ) {
                  return alert("管理者権限を持つユーザーのみアクセス可能です");
                }
                // await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
                setSelectedSettingAccountMenu("Company");
              }}
            >
              <div className="flex-center mr-[15px] h-[24px] w-[24px]">
                <HiOutlineBuildingOffice2 className="text-[22px]" />
              </div>
              <span>会社・チーム</span>
            </div>
            <div
              className={`rounded-[4px]] mb-[3px] flex h-[40px] w-full cursor-pointer select-none items-center truncate rounded-[4px] px-[10px] py-[6px] font-bold hover:bg-[var(--setting-side-bg-select)] ${
                selectedSettingAccountMenu === "Member" ? `bg-[var(--setting-side-bg-select)]` : ``
              }`}
              onClick={() => {
                if (
                  userProfileState?.account_company_role !== "company_admin" &&
                  userProfileState?.account_company_role !== "company_owner"
                ) {
                  return alert("管理者権限を持つユーザーのみアクセス可能です");
                }
                setSelectedSettingAccountMenu("Member");
              }}
            >
              <div className="flex-center mr-[15px] h-[24px] w-[24px]">
                <AiOutlineTeam className="text-[22px]" />
              </div>
              <span>メンバー</span>
            </div>
            <div
              className={`rounded-[4px]] mb-[3px] flex h-[40px] w-full cursor-pointer select-none items-center truncate rounded-[4px] px-[10px] py-[6px] font-bold hover:bg-[var(--setting-side-bg-select)] ${
                selectedSettingAccountMenu === "Products" ? `bg-[var(--setting-side-bg-select)]` : ``
              }`}
              onClick={() => {
                if (
                  userProfileState?.account_company_role === "company_member" ||
                  userProfileState?.account_company_role === "guest"
                ) {
                  return alert("マネージャー以上の権限を持つユーザーのみアクセス可能です");
                }
                setSelectedSettingAccountMenu("Products");
              }}
            >
              <div className="flex-center mr-[15px] h-[24px] w-[24px]">
                <IoSettingsOutline className="text-[22px]" />
              </div>
              <span>サービス・商品</span>
            </div>
            <div
              className={`rounded-[4px]] mb-[3px] flex h-[40px] w-full cursor-pointer select-none items-center truncate rounded-[4px] px-[10px] py-[6px] font-bold hover:bg-[var(--setting-side-bg-select)] ${
                selectedSettingAccountMenu === "PaymentAndPlan" ? `bg-[var(--setting-side-bg-select)]` : ``
              }`}
              onClick={() => {
                if (
                  // userProfileState?.account_company_role !== "company_admin" &&
                  userProfileState?.account_company_role !== "company_owner"
                ) {
                  // return alert("管理者権限を持つユーザーのみアクセス可能です");
                  return alert("チーム所有者権限を持つユーザーのみアクセス可能です");
                }
                setSelectedSettingAccountMenu("PaymentAndPlan");
              }}
            >
              <div className="flex-center mr-[15px] h-[24px] w-[24px]">
                <MdOutlinePayment className="text-[22px]" />
              </div>
              <span>支払いとプラン</span>
            </div>
          </div>
          {/* =============================== 左側エリア ここまで =============================== */}
          {/* =============================== 右側エリア =============================== */}
          <div className={`${styles.right_container} flex h-full w-9/12 bg-[var(--color-edit-bg-solid)]`}>
            {/* 右側メインエリア プロフィール */}
            {selectedSettingAccountMenu === "Profile" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackSettingProfile title="プロフィール" />}>
                  <SettingProfile />
                </Suspense>
              </ErrorBoundary>
            )}
            {/* {selectedSettingAccountMenu === "Profile" && <FallbackSettingProfile title="プロフィール" />} */}
            {/* {selectedSettingAccountMenu === "Profile" && (
              <Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />
            )} */}
            {/* 右側メインエリア プロフィール ここまで */}

            {/* 右側メインエリア サービス・製品 */}
            {/* {selectedSettingAccountMenu === "Products" && <SettingProducts />} */}
            {selectedSettingAccountMenu === "Products" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                {/* <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}> */}
                <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}>
                  <SettingProducts />
                </Suspense>
              </ErrorBoundary>
            )}

            {/* 右側メインエリア 会社・チーム */}
            {/* {selectedSettingAccountMenu === "Company" && <SettingCompany />} */}
            {/* {selectedSettingAccountMenu === "Company" && <FallbackSettingProfile title="会社・チーム" />} */}
            {selectedSettingAccountMenu === "Company" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackSettingProfile title="会社・チーム" />}>
                  <SettingCompany />
                </Suspense>
              </ErrorBoundary>
            )}
            {/* 右側メインエリア 支払い・プラン */}
            {selectedSettingAccountMenu === "PaymentAndPlan" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackSettingPaymentAndPlan />}>
                  <SettingPaymentAndPlan />
                </Suspense>
              </ErrorBoundary>
            )}
            {/* {selectedSettingAccountMenu === "PaymentAndPlan" && <FallbackSettingPaymentAndPlan />} */}
            {/* <Suspense fallback={<Fallback className="min-h-[calc(100vh/3-var(--header-height)/3)]" />}> */}
            {/* 右側メインエリア メンバー */}
            {selectedSettingAccountMenu === "Member" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackSettingMemberAccounts />}>
                  <div className="relative flex h-full w-full flex-col">
                    <SettingMemberAccounts />
                  </div>
                </Suspense>
              </ErrorBoundary>
            )}
            {/* {selectedSettingAccountMenu === "Member" && <FallbackSettingMemberAccounts />} */}

            {/* 右側サブエリア 閉じるボタンエリア w-[80px] */}
            <div className={`relative z-[0] flex h-full w-[0px] flex-col items-center`}>
              <div
                className={`flex-center group absolute right-[20px] top-[20px] z-[0] h-[36px] w-[36px] cursor-pointer rounded-full border-2 border-solid border-[var(--color-text-title)] hover:border-[var(--color-text-hover)]`}
                onClick={handleCancelAndReset}
              >
                <MdClose className="text-[24px] text-[var(--color-text-title)] group-hover:text-[var(--color-text-hover)]" />
              </div>
            </div>
            {/* 右側サブエリア 閉じるボタンエリア ここまで */}
          </div>
          {/* 右側ここまで */}
          {/* <div className={`${styles.right_container} h-full w-1/12 bg-red-100`}></div> */}
        </div>
        {/* メインコンテンツ コンテナ ここまで */}
      </div>
    </>
  );
};
