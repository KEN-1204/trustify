import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { useMutateProduct } from "@/hooks/useMutateProduct";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Department, Office, Product, Section, Unit } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { FC, Fragment, memo, useEffect, useState } from "react";
import styles from "./SettingSalesTargets.module.css";
import NextImage from "next/image";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { officeTagIcons, unitTagIcons } from "../SettingCompany/data";
import { useQuerySections } from "@/hooks/useQuerySections";
import { dataIllustration, winnersIllustration } from "@/components/assets";
import { RxDot } from "react-icons/rx";

const SettingSalesTargetsMemo: FC = () => {
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

  // ================================ 🌟事業部リスト取得useQuery🌟 ================================
  const {
    data: departmentDataArray,
    isLoading: isLoadingQueryDepartment,
    refetch: refetchQUeryDepartments,
  } = useQueryDepartments(userProfileState?.company_id, true);

  // useMutation
  // const { createDepartmentMutation, updateDepartmentFieldMutation, deleteDepartmentMutation } = useMutateDepartment();
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟課・セクションリスト取得useQuery🌟 ================================
  const {
    data: sectionDataArray,
    isLoading: isLoadingQuerySection,
    refetch: refetchQUerySections,
  } = useQuerySections(userProfileState?.company_id, true);
  // console.log("unitDataArray", unitDataArray);

  // useMutation
  // const { createUnitMutation, updateUnitFieldMutation, updateMultipleUnitFieldsMutation, deleteUnitMutation } =
  // useMutateUnit();
  // ================================ ✅課・セクションリスト取得useQuery✅ ================================
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

  // const [departmentSpecificProducts, setDepartmentSpecificProducts] = useState<({ [x: string]: Product[] } | null)[]>(
  const [sectionIdToNameMap, setSectionIdToNameMap] = useState<{ [key: string]: string } | null>(null);
  const [unitIdToNameMap, setUnitIdToNameMap] = useState<{ [key: string]: string } | null>(null);
  const [officeIdToNameMap, setOfficeIdToNameMap] = useState<{ [key: string]: string } | null>(null);

  // 「課・セクション」「係・チーム」「事業所」のid to nameオブジェクトマップ生成
  useEffect(() => {
    // 🔹section
    if (sectionDataArray && sectionDataArray.length >= 1) {
      // 課・セクションマップ {課・セクションid: 課・セクション名}
      const sectionMap = sectionDataArray.reduce((acc, section: Section) => {
        // nullでないことを確認し、nullの場合はUnknownを使用
        const key: string = section.id === null ? "All" : section.id;
        acc[key] = section.section_name || "Unknown";

        return acc;
      }, {} as { [key: string]: string });
      setSectionIdToNameMap(sectionMap);
    } else {
      setSectionIdToNameMap(null);
    }
    // 🔹unit
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
    // 🔹office
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
    "SettingSalesTargetsコンポーネントレンダリング",
    "✅sectionIdToNameMap",
    sectionIdToNameMap,
    "✅unitIdToNameMap",
    unitIdToNameMap,
    "✅officeIdToNameMap",
    officeIdToNameMap
  );

  type TagProps = {
    entityName: string | null;
    withImg?: boolean;
    imgUrl?: string;
  };
  const EntityTag = ({ entityName, withImg = false, imgUrl }: TagProps) => {
    if (!entityName) return null;
    if (withImg && !imgUrl) return null;
    return (
      <div
        className={`transition-bg03 text-[var(--color-text-title)]} ml-[10px] flex min-h-[29px] max-w-[220px] select-none items-center justify-center space-x-2 rounded-full border border-solid border-[#d6dbe0] px-[13px] hover:border-[var(--color-bg-brand-f)]`}
      >
        {withImg && imgUrl && (
          <NextImage src={imgUrl} alt="tag" className="ml-[-4px] w-[16px]" width={16} height={16} />
        )}
        <span className="truncate text-[12px] font-normal">{entityName ?? ""}</span>
      </div>
    );
  };

  return (
    <>
      {/* 右側メインエリア プロフィール */}
      {selectedSettingAccountMenu === "SalesTargets" && (
        <div
          className={`flex h-full w-full flex-col overflow-x-hidden overflow-y-scroll px-[20px] pb-[20px] pr-[80px]`}
        >
          <h2 className={`mt-[20px] text-[18px] font-bold`}>売上目標</h2>

          <div className="mt-[15px] flex min-h-[168px] w-full items-center justify-between overflow-hidden rounded-[8px] bg-[var(--setting-bg-sub)]">
            <div className="flex flex-col space-y-3 p-[24px] pr-[0px]">
              <h4 className="font-bold">最小の資本と人で、最大の経済効果(付加価値)を上げる</h4>
              <p className="max-w-[524px] text-[13px]">
                <span>
                  現在の限界より少し高い目標を設定し、常に負荷をかけ自社・自己の成長と顧客の満足度を追求しましょう
                </span>
              </p>
              <div className="w-full">
                <button
                  //   className={`transition-base01 flex-center max-h-[41px] w-[138px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff]  ${
                  //     loading ? `` : `hover:bg-[var(--color-bg-brand-f-deep)]`
                  //   } mt-[10px]`}
                  className={`transition-base01 flex-center mt-[10px] max-h-[41px] w-[138px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                  //   onClick={() => setIsOpenSettingInvitationModal(true)}
                >
                  <span>メンバーを招待</span>
                  {/* {loading && <SpinnerIDS scale={"scale-[0.4]"} />} */}
                </button>
              </div>
            </div>

            <div className={`flex h-full w-[30%] items-center`}>
              <div className="ml-[10px] mt-[-30px]">{winnersIllustration("180")}</div>
            </div>
          </div>

          <ul className="mt-[10px]">
            <li className={`${styles.list_item_department}`}>
              <h3 className={`mb-[20px] flex items-center font-bold text-[var(--color-text-title)]`}>
                <div className="flex min-w-max flex-col space-y-[3px]">
                  <div className="flex min-w-max items-center space-x-[10px]">
                    <NextImage
                      width={24}
                      height={24}
                      src={`/assets/images/icons/business/icons8-process-94.png`}
                      alt="setting"
                      className={`${styles.title_icon} mb-[2px]`}
                    />
                    <span className="pr-[9px]">全社</span>
                  </div>
                  <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />
                </div>
              </h3>
              <ul></ul>
            </li>
            {departmentDataArray &&
              departmentDataArray.map((obj, index) => {
                return (
                  <Fragment key={obj.id}>
                    {index === 0 && (
                      <div className="relative flex h-[30px] min-h-[30px] w-full pl-[12px]">
                        <div
                          className={`${styles.vertical_line} absolute left-[12px] top-[-13px] h-[calc(100%+13px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                          style={{ animationDelay: `0.6s` }}
                        ></div>
                      </div>
                    )}
                    <li className="relative flex flex-col">
                      {/* <div className="relative flex h-[30px] min-h-[30px] w-full pl-[12px]">
                      <div
                        className={`absolute left-[12px] top-[-13px] h-[calc(100%+13px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                      ></div>
                    </div> */}
                      {/* <div
                      className={`absolute left-[12px] top-[calc(-50%-3px)] h-[calc(100%-9px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                    ></div> */}
                      <div className={`${styles.list_item_department}`}>
                        <h3
                          className={`${styles.list_title} mb-[0px] flex items-center font-bold text-[var(--color-text-title)]`}
                          style={{ animationDelay: `${0.3 * index + 1}s` }}
                        >
                          <div className="flex min-w-max flex-col space-y-[3px]">
                            <div className="flex min-w-max items-center">
                              {/* <NextImage
                              width={24}
                              height={24}
                              src={`/assets/images/icons/business/icons8-process-94.png`}
                              alt="setting"
                              className={`${styles.title_icon} mb-[2px]`}
                            /> */}
                              <div className={`flex-center mb-[2px] min-h-[24px] min-w-[24px]`}>
                                <RxDot className="text-[22px] text-[var(--color-bg-brand-f)]" />
                              </div>
                              <div className="relative mr-[5px] h-full w-[15px] min-w-[15px]">
                                <div className="absolute left-[0px] top-[50%] min-h-[1px] w-[calc(100%)] translate-y-[-50%] bg-[var(--color-bg-brand-f)]"></div>
                              </div>
                              <div className="relative flex h-full min-w-max flex-col">
                                <div className="flex min-w-max items-center px-[3px]">
                                  <NextImage
                                    width={24}
                                    height={24}
                                    src={`/assets/images/icons/business/icons8-process-94.png`}
                                    alt="setting"
                                    className={`${styles.title_icon} mb-[2px] mr-[10px]`}
                                  />
                                  <span className="">{obj.department_name}</span>
                                </div>
                                {/* <span className="px-[3px]">{obj.department_name}</span> */}
                                <div className="absolute bottom-[-2px] left-[-2px] min-h-[1px] w-[calc(100%+6px)] bg-[var(--color-bg-brand-f)]" />
                              </div>
                            </div>
                          </div>
                        </h3>
                        <div className="relative flex h-[30px] min-h-[30px] w-full pl-[12px]">
                          {departmentDataArray.length - 1 !== index && (
                            <div
                              className={`${styles.vertical_line} ${styles.under} absolute left-[12px] top-[-1px] h-[calc(100%+1px)] min-w-[1px] bg-[var(--color-bg-brand-f)]`}
                              style={{ animationDelay: `${0.3 * index + 1}s` }}
                            ></div>
                          )}
                        </div>
                        {/* <ul>
                        <li className="pl-[48px]">
                          <p>
                            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Porro ea neque sapiente et!
                            Reiciendis distinctio repellendus animi provident voluptate nobis, iste vel sequi veniam
                            alias ipsam, magnam pariatur architecto enim!
                          </p>
                        </li>
                      </ul> */}
                      </div>
                    </li>
                  </Fragment>
                );
              })}
          </ul>

          {isLoadingQueryDepartment && (
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

export const SettingSalesTargets = memo(SettingSalesTargetsMemo);
