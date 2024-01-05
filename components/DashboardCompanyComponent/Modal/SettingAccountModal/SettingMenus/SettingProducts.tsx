import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { useMutateProduct } from "@/hooks/useMutateProduct";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Department, Product } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
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
  const setEditedProduct = useDashboardStore((state) => state.setEditedProduct);
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const { deleteProductMutation } = useMutateProduct();

  // ================================ 🌟事業部、係、事業所リスト取得useQuery🌟 ================================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  // const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  // const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ================================ ✅事業部、係、事業所リスト取得useQuery✅ ================================

  // useQueryProductsで製品テーブルからデータ一覧を取得
  console.log("departmentDataArray", departmentDataArray);
  const {
    data: productsDataArray,
    error,
    isError,
    isLoading,
  } = useQueryProducts({ company_id: userProfileState?.company_id ? userProfileState?.company_id : null });
  // const queryClient = useQueryClient();
  // const products = queryClient.getQueryData<Product[]>(["products"]);
  console.log("取得したproducts", productsDataArray);

  const [departmentSpecificProducts, setDepartmentSpecificProducts] = useState<Product[]>([]);
  // const [unitSpecificProducts, setUnitSpecificProducts] = useState<Product[]>([])

  type DepartmentProducts = {
    [key: string]: Product[];
  };

  useEffect(() => {
    // [{id: 1, name: ‘IM’, department: ‘Micro’}, {id: 2, name: ‘IM’, department: ‘Metro’}, {id: 3, name: ‘VH’, department: ‘Sensor’},  {id: 4, name: ‘XM’, department: ‘Metro’}]を
    // reduceで
    /**
     {
    "Micro": [{ "id": 1, "name": "IM", "department": "Micro" }],
    "Metro": [{ "id": 2, "name": "IM", "department": "Metro" }, { "id": 4, "name": "XM", "department": "Metro" }],
    "Sensor": [{ "id": 3, "name": "VH", "department": "Sensor" }]
    }
    に変換して、
    Object.keys()で
    [
    { "Micro": [{ "id": 1, "name": "IM", "department": "Micro" }] },
    { "Metro": [{ "id": 2, "name": "IM", "department": "Metro" }, { "id": 4, "name": "XM", "department": "Metro" }] },
    { "Sensor": [{ "id": 3, "name": "VH", "department": "Sensor" }] }
    ]
    に変換して、事業部ごとに事業部名がkeyでProductオブジェクトの配列がvalueの配列を生成
     */

    // 先に部署テーブルの配列をオブジェクトに変換することで、Productを事業部別の配列に生成するときにcreatedの部署idから直接部署名にアクセスできるようにする
    if (!productsDataArray || productsDataArray?.length === 0) return;
    if (!departmentDataArray || departmentDataArray?.length === 0) return;
    const departmentMap = departmentDataArray.reduce((acc, department: Department) => {
      // nullでないことを確認し、nullの場合はUnknownを使用
      const key: string = department.id === null ? "Unknown" : department.id;
      acc[key] = department.department_name || "全社";

      return acc;
    }, {} as { [key: string]: string });

    const groupedByDepartment = productsDataArray.reduce((acc: DepartmentProducts, obj: Product) => {
      const departmentId = obj.created_by_department_of_user ?? "Unknown";
      if (!acc[departmentId]) {
        acc[departmentId] = [];
      }
      acc[departmentId].push(obj);
      return acc;
    }, {} as DepartmentProducts); //初期値をDepartmentProducts型として明示

    const arrayFormat = Object.keys(groupedByDepartment).map((key) => ({ [key]: groupedByDepartment[key] }));
  });

  // // キャンセルでモーダルを閉じる
  // const handleCancelAndReset = () => {
  //   setIsOpenSettingAccountModal(false);
  // };

  // if (isError) {
  //   console.error("Error fetching products:", error);
  // }

  return (
    <>
      {/* 右側メインエリア プロフィール */}
      {selectedSettingAccountMenu === "Products" && (
        <div className={`flex h-full w-full flex-col overflow-y-scroll px-[20px] py-[20px] pr-[80px]`}>
          <div className={`text-[18px] font-bold !text-[var(--color-text-title)]`}>サービス・商品</div>
          {/* 製品1 */}
          {productsDataArray?.map((item, index) => (
            <React.Fragment key={item.id}>
              <div key={item.id} className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
                <div className={`text-[14px] font-bold !text-[var(--color-text-title)]`}>商品{index + 1}</div>

                <div className={`flex h-full w-full items-center justify-between`}>
                  <div className="flex">
                    <div className="text-[16px] font-semibold !text-[var(--color-text-title)]">
                      {item.product_name ? item.product_name : "商品名無し"}
                    </div>
                    <div className="ml-[10px] text-[16px] font-semibold !text-[var(--color-text-title)]">
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
                        className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] text-center text-[14px] font-bold !text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                        onClick={() => deleteProductMutation.mutate(item.id)}
                      >
                        削除
                      </div>
                      <div
                        className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                        onClick={() => {
                          console.log("item.unit_price", item.unit_price);
                          setEditedProduct({
                            id: item.id,
                            created_at: item.created_at,
                            created_by_company_id: item.created_by_company_id ? item.created_by_company_id : "",
                            created_by_user_id: item.created_by_user_id ? item.created_by_user_id : "",
                            created_by_department_of_user: item.created_by_department_of_user
                              ? item.created_by_department_of_user
                              : "",
                            created_by_unit_of_user: item.created_by_unit_of_user ? item.created_by_unit_of_user : "",
                            created_by_office_of_user: item.created_by_office_of_user
                              ? item.created_by_office_of_user
                              : "",
                            product_name: item.product_name ? item.product_name : "",
                            inside_short_name: item.inside_short_name ? item.inside_short_name : "",
                            outside_short_name: item.outside_short_name ? item.outside_short_name : "",
                            unit_price: item.unit_price ? item.unit_price.toLocaleString() : "",
                          });
                          setIsOpenUpdateProductModal(true);
                        }}
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
            </React.Fragment>
          ))}
          {/* 名前ここまで */}

          {isLoading && (
            <div className={`flex-center mt-[20px] flex min-h-[95px] w-[calc(100%+73px)]`}>
              <SpinnerIDS scale={"scale-[0.5]"} />
            </div>
          )}

          <div className={`flex-center mt-[20px] min-h-[55px] w-[calc(100%+73px)]`}>
            <div
              className={`transition-base01 flex-center min-w-[78px] cursor-pointer space-x-1 rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold  !text-[var(--color-text-title)] hover:text-[var(--color-bg-brand-f)]`}
              onClick={() => setIsOpenInsertNewProductModal(true)}
            >
              <span>＋</span>
              <span>商品追加</span>
            </div>
          </div>
        </div>
      )}
      {/* 右側メインエリア プロフィール ここまで */}
    </>
  );
};

export const SettingProducts = memo(SettingProductsMemo);
