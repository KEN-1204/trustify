import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { useMutateProduct } from "@/hooks/useMutateProduct";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { FC, memo, useEffect, useState } from "react";

const SettingProductsMemo: FC = () => {
  const theme = useThemeStore((state) => state.theme);
  const setIsOpenSettingAccountModal = useDashboardStore((state) => state.setIsOpenSettingAccountModal);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // 上画面の選択中の列データ会社
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  // 製品追加・編集モーダル
  const setIsOpenInsertNewProductModal = useDashboardStore((state) => state.setIsOpenInsertNewProductModal);
  const setIsOpenUpdateProductModal = useDashboardStore((state) => state.setIsOpenUpdateProductModal);
  const supabase = useSupabaseClient();
  const { deleteProductMutation } = useMutateProduct();

  // useQueryProductsで製品テーブルからデータ一覧を取得
  console.log(
    "useQuery前 ",
    "userProfileState?.company_id",
    userProfileState?.company_id,
    "userProfileState?.id",
    userProfileState?.id
  );
  const {
    data: products,
    error,
    isError,
    isLoading,
  } = useQueryProducts(userProfileState?.company_id, userProfileState?.id);
  console.log("取得したproducts", products);

  // // キャンセルでモーダルを閉じる
  // const handleCancelAndReset = () => {
  //   setIsOpenSettingAccountModal(false);
  // };

  if (isError) {
    console.error("Error fetching products:", error);
  }

  return (
    <>
      {/* 右側メインエリア プロフィール */}
      {selectedSettingAccountMenu === "Products" && (
        <div className={`flex h-full w-full flex-col overflow-y-scroll px-[20px] py-[20px]`}>
          <div className={`text-[20px] font-bold`}>サービス・製品</div>
          {/* 製品1 */}
          {products?.map((item, index) => (
            <>
              <div key={item.id} className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
                <div className={`text-[14px] font-bold`}>製品{index + 1}</div>

                <div className={`flex h-full w-full items-center justify-between`}>
                  <div className="flex">
                    <div className="text-[16px] font-semibold">
                      {item.product_name ? item.product_name : "商品名無し"}
                    </div>
                    <div className="ml-[10px] text-[16px] font-semibold">
                      {item.outside_short_name ? item.outside_short_name : ""}
                    </div>
                  </div>
                  {/* <div>
                    <div
                      className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold hover:bg-[var(--setting-side-bg-select-hover)]`}
                    >
                      編集
                    </div>
                  </div> */}
                  {!loadingGlobalState && (
                    <div className="flex">
                      <div
                        className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] text-center text-[14px] font-bold hover:bg-[var(--setting-side-bg-select-hover)]`}
                        onClick={() => deleteProductMutation.mutate(item.id)}
                      >
                        削除
                      </div>
                      <div
                        className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                        onClick={() => setIsOpenUpdateProductModal(true)}
                      >
                        編集
                      </div>
                    </div>
                  )}
                  {/* {loadingGlobalState && (
                    <div className="flex-center h-[40px] min-w-[78px]">
                      <SpinnerIDS scale={"scale-[0.4]"} />
                    </div>
                  )} */}
                </div>
              </div>
              <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>
            </>
          ))}
          {/* 名前ここまで */}

          {isLoading && (
            <div className={`flex-center mt-[20px] flex min-h-[95px] w-[calc(100%+73px)]`}>
              <SpinnerIDS scale={"scale-[0.5]"} />
            </div>
          )}

          <div className={`flex-center mt-[20px] min-h-[55px] w-[calc(100%+73px)]`}>
            <div
              className={`transition-base01 flex-center min-w-[78px] cursor-pointer space-x-1 rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold  hover:text-[var(--color-bg-brand-f)]`}
              onClick={() => setIsOpenInsertNewProductModal(true)}
            >
              <span>＋</span>
              <span>製品追加</span>
            </div>
          </div>
        </div>
      )}
      {/* 右側メインエリア プロフィール ここまで */}
    </>
  );
};

export const SettingProducts = memo(SettingProductsMemo);
