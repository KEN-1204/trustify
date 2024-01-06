import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { useMutateProduct } from "@/hooks/useMutateProduct";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Department, Office, Product, Unit } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { FC, memo, useEffect, useState } from "react";
import styles from "./SettingProducts.module.css";
import NextImage from "next/image";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { officeTagIcons } from "../SettingCompany/data";

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
  // const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  // const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  // const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ================================ ✅事業部、係、事業所リスト取得useQuery✅ ================================
  // ================================ 🌟事業部リスト取得useQuery🌟 ================================
  const {
    data: departmentDataArray,
    isLoading: isLoadingQueryDepartment,
    refetch: refetchQUeryDepartments,
  } = useQueryDepartments(userProfileState?.company_id, true);

  // useMutation
  // const { createDepartmentMutation, updateDepartmentFieldMutation, deleteDepartmentMutation } = useMutateDepartment();
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟係・チームリスト取得useQuery🌟 ================================
  const {
    data: unitDataArray,
    isLoading: isLoadingQueryUnit,
    refetch: refetchQUeryUnits,
  } = useQueryUnits(userProfileState?.company_id, true);

  // useMutation
  // const { createUnitMutation, updateUnitFieldMutation, updateMultipleUnitFieldsMutation, deleteUnitMutation } =
  // useMutateUnit();
  // ================================ ✅係・チームリスト取得useQuery✅ ================================
  // ================================ 🌟事業所・営業所リスト取得useQuery🌟 ================================
  const {
    data: officeDataArray,
    isLoading: isLoadingQueryOffice,
    refetch: refetchQUeryOffices,
  } = useQueryOffices(userProfileState?.company_id, true);

  // useMutation
  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅事業所・営業所リスト取得useQuery✅ ================================

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

  // const [departmentSpecificProducts, setDepartmentSpecificProducts] = useState<({ [x: string]: Product[] } | null)[]>(
  const [unitIdToNameMap, setUnitIdToNameMap] = useState<{ [key: string]: string } | null>(null);
  const [officeIdToNameMap, setOfficeIdToNameMap] = useState<{ [key: string]: string } | null>(null);
  // const [departmentSpecificProducts, setDepartmentSpecificProducts] = useState<DepartmentProducts>();
  const [departmentSpecificProducts, setDepartmentSpecificProducts] = useState<[string, Product[]][]>([]);
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
    // 事業所マップ {事業所id: 事業所名}
    const departmentMap = departmentDataArray.reduce((acc, department: Department) => {
      // nullでないことを確認し、nullの場合はUnknownを使用
      const key: string = department.id === null ? "All" : department.id;
      acc[key] = department.department_name || "Unknown";

      return acc;
    }, {} as { [key: string]: string });

    const groupedByDepartment = productsDataArray.reduce((acc: DepartmentProducts, obj: Product) => {
      // 部署idから部署名にアクセスしてkeyに設定
      const departmentId = obj.created_by_department_of_user || "null";
      const departmentName = departmentMap[departmentId] || "All";
      if (!acc[departmentName]) {
        acc[departmentName] = [];
      }
      acc[departmentName].push(obj);
      return acc;
    }, {} as DepartmentProducts); //初期値をDepartmentProducts型として明示

    console.log("✅groupedByDepartment", groupedByDepartment);
    // console.log("✅arrayFormat", arrayFormat);
    // const arrayFormat = Object.keys(groupedByDepartment).map((key) => ({ [key]: groupedByDepartment[key] }));
    const sortedDepartments = Object.entries(groupedByDepartment).sort((a, b) => {
      // a = [string, Product[]] = [Metro, Product[]]
      return a[0].localeCompare(b[0]);
    });

    setDepartmentSpecificProducts(sortedDepartments);
    // setDepartmentSpecificProducts(groupedByDepartment);
  }, [departmentDataArray, productsDataArray]);

  // 係・チームと事業所のid to nameオブジェクトマップ生成
  useEffect(() => {
    if (unitDataArray && unitDataArray.length >= 1) {
      // 事業所マップ {事業所id: 事業所名}
      const unitMap = unitDataArray.reduce((acc, unit: Unit) => {
        // nullでないことを確認し、nullの場合はUnknownを使用
        const key: string = unit.id === null ? "All" : unit.id;
        acc[key] = unit.unit_name || "Unknown";

        return acc;
      }, {} as { [key: string]: string });
      setUnitIdToNameMap(unitMap);
    } else {
      setUnitIdToNameMap(null);
    }
    if (officeDataArray && officeDataArray.length >= 1) {
      const officeMap = officeDataArray.reduce((acc, office: Office) => {
        // nullでないことを確認し、nullの場合はUnknownを使用
        const key: string = office.id === null ? "All" : office.id;
        acc[key] = office.office_name || "Unknown";

        return acc;
      }, {} as { [key: string]: string });
      setOfficeIdToNameMap(officeMap);
    } else {
      setOfficeIdToNameMap(null);
    }
  }, [unitDataArray, officeDataArray]);

  console.log(
    "✅departmentSpecificProducts",
    departmentSpecificProducts,
    "✅unitIdToNameMap",
    unitIdToNameMap,
    "✅officeIdToNameMap",
    officeIdToNameMap
  );

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
        <div
          className={`flex h-full w-full flex-col overflow-x-hidden overflow-y-scroll px-[20px] pb-[20px] pr-[80px]`}
        >
          <h2
            className={`sticky left-0 top-0 z-10 flex items-start justify-between bg-[var(--color-edit-bg-solid)] pb-[10px] pt-[20px]`}
          >
            <div className={`max-h-[27px] text-[18px] font-bold !text-[var(--color-text-title)]`}>サービス・商品</div>
            <div
              className={`transition-base01 flex-center min-w-[78px] cursor-pointer space-x-1 rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold !text-[var(--color-text-title)]  hover:bg-[var(--setting-side-bg-select-hover)] hover:text-[var(--color-bg-brand-f)]`}
              onClick={() => setIsOpenInsertNewProductModal(true)}
            >
              <span>＋</span>
              <span>商品追加</span>
            </div>
          </h2>

          <ul className="mt-[10px]">
            {/* {departmentSpecificProducts &&
              Object.entries(departmentSpecificProducts).map(([departmentName, productsArray], index) => ( */}
            {departmentSpecificProducts &&
              departmentSpecificProducts.map(([departmentName, productsArray], index) => (
                <li key={departmentName + index} className={`${styles.list_item_department}`}>
                  <h3 className={`mb-[20px] flex items-center space-x-[10px] font-bold text-[var(--color-text-title)]`}>
                    <NextImage
                      width={24}
                      height={24}
                      src={`/assets/images/icons/business/icons8-process-94.png`}
                      alt="setting"
                      className={`${styles.title_icon} mb-[2px]`}
                    />
                    <span>{departmentName}</span>
                  </h3>
                  <ul>
                    {productsArray &&
                      productsArray.length >= 1 &&
                      productsArray?.map((item, index) => (
                        <li key={item.id} className={`${styles.list_item_product}`}>
                          <div key={item.id} className={`flex w-full flex-col`}>
                            <h4 className={`text-[13px] font-bold !text-[var(--color-text-title)]`}>商品{index + 1}</h4>

                            <div className={`flex h-full min-h-[74px] w-full items-center justify-between`}>
                              <div className="flex items-center">
                                <div className="text-[16px] font-semibold !text-[var(--color-text-title)]">
                                  {item.product_name ? item.product_name : "商品名無し"}
                                </div>
                                <div className="ml-[10px] text-[16px] font-semibold !text-[var(--color-text-title)]">
                                  {item.outside_short_name ? item.outside_short_name : ""}
                                </div>
                                {unitDataArray &&
                                  unitDataArray.length >= 1 &&
                                  unitIdToNameMap &&
                                  item.created_by_unit_of_user && (
                                    <div
                                      // className={`transition-bg03 flex h-[35px] min-h-[35px] min-w-max max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] text-[14px] hover:border-[var(--color-bg-brand-f)] ${
                                      //   selectedOffice?.id === officeData.id
                                      //     ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                                      //     : `text-[var(--color-text-title)]`
                                      // }`}
                                      className={`transition-bg03 text-[var(--color-text-title)]} ml-[10px] flex min-h-[33px] max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] text-[14px] hover:border-[var(--color-bg-brand-f)]`}
                                    >
                                      {/* <NextImage
                                        src={officeTagIcons[0].iconURL}
                                        alt="tag"
                                        className="ml-[-4px] w-[22px]"
                                        width={22}
                                        height={22}
                                      /> */}
                                      <span className="truncate text-[13px]">
                                        {unitIdToNameMap[item.created_by_unit_of_user]}
                                      </span>
                                    </div>
                                  )}
                                {officeDataArray &&
                                  officeDataArray.length >= 1 &&
                                  officeIdToNameMap &&
                                  item.created_by_office_of_user && (
                                    <div
                                      // className={`transition-bg03 flex min-h-[33px] max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] text-[14px] hover:border-[var(--color-bg-brand-f)] ${
                                      //   selectedOffice?.id === officeData.id
                                      //     ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-f)] text-[#fff]`
                                      //     : `text-[var(--color-text-title)]`
                                      // }`}
                                      className={`transition-bg03 text-[var(--color-text-title)]} ml-[10px] flex min-h-[33px] max-w-[150px] cursor-pointer select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[18px] text-[14px] hover:border-[var(--color-bg-brand-f)]`}
                                    >
                                      <NextImage
                                        // src="/assets/images/icons/business/icons8-businesswoman-94.png"
                                        src={officeTagIcons[0].iconURL}
                                        alt="tag"
                                        className="ml-[-4px] w-[22px]"
                                        width={22}
                                        height={22}
                                      />
                                      <span className="truncate text-[13px]">
                                        {officeIdToNameMap[item.created_by_office_of_user] ?? ""}
                                      </span>
                                    </div>
                                  )}
                              </div>
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
                                        created_by_company_id: item.created_by_company_id
                                          ? item.created_by_company_id
                                          : "",
                                        created_by_user_id: item.created_by_user_id ? item.created_by_user_id : "",
                                        created_by_department_of_user: item.created_by_department_of_user
                                          ? item.created_by_department_of_user
                                          : "",
                                        created_by_unit_of_user: item.created_by_unit_of_user
                                          ? item.created_by_unit_of_user
                                          : "",
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
                            </div>
                          </div>
                          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>
                        </li>
                      ))}
                  </ul>
                </li>
              ))}
          </ul>
          {/* {productsDataArray?.map((item, index) => (
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
                </div>
              </div>
              <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>
            </React.Fragment>
          ))} */}

          {isLoading && (
            <div className={`flex-center mt-[20px] flex min-h-[95px] w-[calc(100%+73px)]`}>
              <SpinnerIDS scale={"scale-[0.5]"} />
            </div>
          )}

          <div className={`flex-center mt-[20px] min-h-[55px] w-[calc(100%+73px)]`}>
            <div
              className={`transition-base01 flex-center min-w-[78px] cursor-pointer space-x-1 rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold  !text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)] hover:text-[var(--color-bg-brand-f)]`}
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
