import useDashboardStore from "@/store/useDashboardStore";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import styles from "../DropdownMenuUpdateMember/DropdownMenuUpdateMember.module.css";
import { MdOutlineDataSaverOff } from "react-icons/md";
import NextImage from "next/image";
import {
  Department,
  Employee_id,
  MemberAccounts,
  Office,
  Section,
  Unit,
  UserProfileCompanySubscription,
} from "@/types";
import useStore from "@/store";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import { getValueOrNull } from "@/utils/Helpers/getValueOrNull";

type FilterCondition = {
  // department_id: Department["id"] | null;
  // unit_id: Unit["id"] | null;
  // office_id: Office["id"] | null;
  // employee_id_name: Employee_id["id"] | null;
  department_id: Department["id"] | null;
  section_id: Section["id"] | null;
  unit_id: Unit["id"] | null;
  office_id: Office["id"] | null;
  //   employee_id_name: Employee_id["id"];
};
type ClickedItemPos = { displayPos: "up" | "center" | "down"; clickedItemWidth: number | null };

type Props = {
  // memberAccount: MemberAccounts;
  setIsOpenDropdownMenu?: Dispatch<SetStateAction<boolean>>;
  //   setIsLoading: Dispatch<SetStateAction<boolean>>;
  clickedItemPosition: ClickedItemPos;
  filterCondition: FilterCondition;
  setFilterCondition: Dispatch<React.SetStateAction<FilterCondition>>;
  // setIsComposing: Dispatch<React.SetStateAction<boolean>>;
  handleSubmit?: () => void;
  isMultiple?: boolean;
  arrayIndex?: number;
  isOpenDropdownMenuArray?: boolean[];
  setIsOpenDropdownMenuArray?: Dispatch<SetStateAction<boolean[]>>;
};

export const DropDownMenuFilterProducts = ({
  // memberAccount,
  setIsOpenDropdownMenu,
  //   setIsLoading,
  clickedItemPosition,
  filterCondition,
  setFilterCondition,
  handleSubmit,
  isMultiple,
  arrayIndex,
  isOpenDropdownMenuArray,
  setIsOpenDropdownMenuArray,
}: // setIsComposing,
Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const language = useStore((state) => state.language);

  //   const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [editedFilterCondition, setEditedFilterCondition] = useState<FilterCondition>({
    department_id: filterCondition.department_id,
    section_id: filterCondition.section_id,
    unit_id: filterCondition.unit_id,
    office_id: filterCondition.office_id,
    // employee_id_name: memberAccount.assigned_employee_id_name ? memberAccount.assigned_employee_id_name : "",
  });

  const cacheDepartmentsArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const cacheSectionsArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const cacheUnitsArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const cacheOfficesArray: Office[] | undefined = queryClient.getQueryData(["offices"]);

  // メニュー高さに合わせてtop、クリックアイテムの横幅に合わせてleftを変更
  useEffect(() => {
    if (menuRef.current) {
      const menuHeight = menuRef.current.getBoundingClientRect().height;
      // menuRef.current.style.left = `${(clickedItemPosition.clickedItemWidth ?? 135) + 10}px`;
      menuRef.current.style.left = `${clickedItemPosition.clickedItemWidth ?? 135}px`;
      if (clickedItemPosition.displayPos === "up") {
        menuRef.current.style.top = `${-menuHeight + 36}px`;
        // if (memberAccount.profile_name) {
        //   // menuRef.current.style.top = `${-36 - menuHeight}px`;
        //   menuRef.current.style.top = `${-menuHeight + 36}px`;
        // } else {
        //   // menuRef.current.style.top = `${-36 - menuHeight - 40}px`;
        //   menuRef.current.style.top = `${-menuHeight - 40}px`;
        // }
      } else if (clickedItemPosition.displayPos === "center") {
        menuRef.current.style.top = `${-menuHeight / 2}px`;
      } else {
        // menuRef.current.style.top = `${36 + 10}px`;
        menuRef.current.style.top = `${0}px`;
      }
    }
  }, []);

  // 課ありパターン
  // ======================= 🌟現在の選択した事業部で課を絞り込むuseEffect🌟 =======================
  const [filteredSectionBySelectedDepartment, setFilteredSectionBySelectedDepartment] = useState<Section[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!cacheSectionsArray || cacheSectionsArray?.length === 0 || !editedFilterCondition.department_id)
      return setFilteredSectionBySelectedDepartment([]);

    // 選択中の事業部が変化するか、cacheSectionsArrayの内容に変更があったら新たに絞り込んで更新する
    if (cacheSectionsArray && cacheSectionsArray.length >= 1 && editedFilterCondition.department_id) {
      const filteredSectionArray = cacheSectionsArray.filter(
        (section) => section.created_by_department_id === editedFilterCondition.department_id
      );
      setFilteredSectionBySelectedDepartment(filteredSectionArray);
    }
  }, [cacheSectionsArray, editedFilterCondition.department_id]);
  // ======================= ✅現在の選択した事業部で課を絞り込むuseEffect✅ =======================

  // 課ありパターン
  // ======================= 🌟現在の選択した課で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Unit[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!cacheUnitsArray || cacheUnitsArray?.length === 0 || !editedFilterCondition.section_id)
      return setFilteredUnitBySelectedSection([]);

    // 選択中の課が変化するか、cacheUnitsArrayの内容に変更があったら新たに絞り込んで更新する
    if (cacheUnitsArray && cacheUnitsArray.length >= 1 && editedFilterCondition.section_id) {
      const filteredUnitArray = cacheUnitsArray.filter(
        (unit) => unit.created_by_section_id === editedFilterCondition.section_id
      );
      setFilteredUnitBySelectedSection(filteredUnitArray);
    }
  }, [cacheUnitsArray, editedFilterCondition.section_id]);
  // ======================= ✅現在の選択した課で係・チームを絞り込むuseEffect✅ =======================

  // // 課なしパターン
  // // ======================= 🌟現在の選択した事業部でチームを絞り込むuseEffect🌟 =======================
  // const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  // useEffect(() => {
  //   // 選択中の事業部が変化するか、cacheUnitsArrayの内容に変更があったら新たに絞り込んで更新する
  //   if (cacheUnitsArray && cacheUnitsArray?.length >= 1 && !!editedFilterCondition.department_id) {
  //     const filteredUnitArray = cacheUnitsArray.filter(
  //       (unit) => unit.created_by_department_id === editedFilterCondition.department_id
  //     );
  //     setFilteredUnitBySelectedDepartment(filteredUnitArray);
  //   }
  // }, [cacheUnitsArray, editedFilterCondition.department_id]);
  // // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================
  console.log(
    "フィルター",
    "filteredSectionBySelectedDepartment",
    filteredSectionBySelectedDepartment,
    "filteredUnitBySelectedSection",
    filteredUnitBySelectedSection,
    "cacheDepartmentsArray",
    cacheDepartmentsArray,
    "cacheUnitsArray",
    cacheUnitsArray,
    "cacheOfficesArray",
    cacheOfficesArray,
    "editedFilterCondition",
    editedFilterCondition
  );

  const handleLocalSubmit = () => {
    const newCondition = {
      department_id: editedFilterCondition.department_id,
      section_id: editedFilterCondition.section_id,
      unit_id: editedFilterCondition.unit_id,
      office_id: editedFilterCondition.office_id,
    };
    setFilterCondition(newCondition);
    if (!isMultiple && setIsOpenDropdownMenu) {
      setIsOpenDropdownMenu(false);
    } else if (isOpenDropdownMenuArray && setIsOpenDropdownMenuArray) {
      const resetArray = Array.from({ length: isOpenDropdownMenuArray.length }, () => false);
      setIsOpenDropdownMenuArray(resetArray);
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      {/* <div
        className="fixed left-[-100vw] top-[-50%] z-[1000] h-[200vh] w-[300vw] bg-[#0000000]"
        onClick={() => {
          setIsOpenDropdownMenu(false);
        }}
      ></div> */}
      {/* 製品リスト編集ドロップダウンメニュー オーバーレイ */}
      {/* <div
        className="fixed left-[-100vw] top-[-50%] z-[2000] h-[200vh] w-[300vw] bg-[#00000090]"
        onClick={() => {
          setIsOpenDropdownMenu(false);
        }}
      ></div> */}
      {/* モーダル */}
      <div
        ref={menuRef}
        // className={`shadow-all-md border-real-with-shadow fade03 absolute left-[0px] z-[20000] flex h-auto w-fit min-w-[276px] max-w-[400px] cursor-default flex-col whitespace-normal rounded-[4px] bg-[var(--color-edit-bg-solid)] font-normal ${
        //   clickedItemPosition.displayPos === "down" ? `top-[60px]` : "top-[-210px]"
        // }`}
        className={`shadow-all-md border-real-with-shadow fade03 absolute left-[0px] z-[20000] flex h-auto w-fit min-w-[276px] cursor-default flex-col whitespace-normal rounded-[4px] bg-[var(--color-edit-bg-solid)] font-normal ${
          clickedItemPosition.displayPos === "down" ? `top-[60px]` : "top-[-210px]"
        }`}
      >
        {/* 説明エリア */}
        <div className={`relative flex h-auto w-full flex-col items-start space-y-[6px] px-[24px] py-[16px]`}>
          <h2 className="flex items-center space-x-[12px] text-[16px] font-bold text-[var(--color-text-title)]">
            <span>商品リスト編集</span>
            <span>
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
            商品リストを「事業部」「係・チーム」「事業所・営業所」からフィルターが可能です。全て未設定にして保存した場合は全ての商品リストを取得します。
          </p>
        </div>

        {/* <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" /> */}
        <hr className="min-h-[1px] w-full bg-[var(--color-border-light)]" />

        {/* テーマ・アカウント設定エリア */}
        <div className="flex w-full flex-col">
          <ul className={`flex flex-col px-[1px] pb-[1px] text-[13px] text-[var(--color-text-title)]`}>
            {/* 事業部 */}
            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
              //   onMouseEnter={() => setHoveredThemeMenu(true)}
              //   onMouseLeave={() => setHoveredThemeMenu(false)}
            >
              <div className="flex min-w-[145px] items-center ">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>事業部</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div>
                <select
                  className={` ml-auto h-full w-full ${styles.select_box} truncate`}
                  // value={isFetchAllCompanies ? `All` : `Own`}
                  value={editedFilterCondition.department_id ? editedFilterCondition.department_id : ""}
                  onChange={(e) => {
                    // --------------------- 🔹課ありパターン ---------------------
                    let newCondition: FilterCondition;
                    // 1. section_idが選択されてる状態で事業部が変更されたら、section_idを初期値に設定する(事業部に合致する選択肢の1番目)
                    // 2. unit_idが選択されてる状態で事業部が変更されたら、unit_idを初期値に設定する(事業部に合致する選択肢の1番目)

                    // 1. section_idが選択されてる状態で事業部が変更されたら、section_idを初期値に設定する
                    let firstSectionData: Section | null = null;
                    if (editedFilterCondition.section_id) {
                      if (cacheSectionsArray && cacheSectionsArray?.length >= 1) {
                        firstSectionData =
                          cacheSectionsArray.find((section) => section.created_by_department_id === e.target.value) ??
                          null;
                        console.log("フィルターfirstSectionData", firstSectionData);
                        // sectionsキャッシュに要素が1つ以上存在するならキャッシュの１番目を初期値として格納
                        newCondition = {
                          ...editedFilterCondition,
                          department_id: e.target.value,
                          section_id: firstSectionData?.id ?? "",
                        };
                      } else {
                        // sectionsキャッシュに要素がundefinedか空なら、section_idに初期値の空文字をセットする
                        newCondition = {
                          ...editedFilterCondition,
                          department_id: e.target.value,
                          section_id: "",
                        };
                      }
                    } else {
                      newCondition = { ...editedFilterCondition, department_id: e.target.value };
                    }

                    // 2. unit_idが選択されてる状態で事業部が変更されたら、unit_idを初期値に設定する
                    if (editedFilterCondition.unit_id) {
                      if (cacheUnitsArray && cacheUnitsArray?.length >= 1) {
                        const firstUnitData = cacheUnitsArray.find(
                          (unit) => unit.created_by_section_id === firstSectionData?.id
                        );
                        console.log("フィルターfirstUnitData", firstUnitData);
                        // unitsキャッシュに要素が1つ以上存在するならキャッシュの１番目を初期値として格納
                        newCondition = {
                          ...newCondition,
                          department_id: e.target.value,
                          unit_id: firstUnitData?.id ?? "",
                        };
                      } else {
                        // unitsキャッシュに要素がundefinedか空なら、unit_idに初期値の空文字をセットする
                        newCondition = {
                          ...newCondition,
                          department_id: e.target.value,
                          unit_id: "",
                        };
                      }
                    } else {
                      newCondition = { ...newCondition, department_id: e.target.value };
                    }

                    console.log("事業部更新 newCondition", newCondition);
                    setEditedFilterCondition(newCondition);

                    // // --------------------- 🔹課なしパターン ---------------------
                    // let newCondition: FilterCondition;
                    // // unit_idが選択されてる状態で事業部が変更されたら、user_idを初期値に設定する
                    // if (editedFilterCondition.unit_id) {
                    //   if (cacheUnitsArray && cacheUnitsArray?.length >= 1) {
                    //     const firstUnitData = cacheUnitsArray.find(
                    //       (unit) => unit.created_by_department_id === e.target.value
                    //     );
                    //     console.log("フィルターfirstUnitData", firstUnitData);
                    //     // unitsキャッシュに要素が1つ以上存在するならキャッシュの１番目を初期値として格納
                    //     newCondition = {
                    //       ...editedFilterCondition,
                    //       department_id: e.target.value,
                    //       unit_id: firstUnitData?.id ?? "",
                    //     };
                    //   } else {
                    //     // unitsキャッシュに要素がundefinedか空なら、unit_idに初期値の空文字をセットする
                    //     newCondition = {
                    //       ...editedFilterCondition,
                    //       department_id: e.target.value,
                    //       unit_id: "",
                    //     };
                    //   }
                    // } else {
                    //   newCondition = { ...editedFilterCondition, department_id: e.target.value };
                    // }

                    // setEditedFilterCondition(newCondition);
                  }}
                >
                  {/* <option value="">すべての事業部</option> */}
                  {/* {!memberAccount.assigned_department_id && <option value="">未設定</option>} */}
                  <option value="">未設定</option>
                  {!!cacheDepartmentsArray &&
                    [...cacheDepartmentsArray]
                      .sort((a, b) => {
                        if (a.department_name === null || b.department_name === null) return 0;
                        return a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en") ?? 0;
                      })
                      .map(
                        (department, index) =>
                          !!department &&
                          department.department_name && (
                            <option key={department.id} value={department.id}>
                              {department.department_name}
                            </option>
                          )
                      )}
                </select>
              </div>
            </li>

            {/* 課・セクション */}
            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
            >
              <div className="flex min-w-[145px] items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>課・セクション</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div className={`${styles.list_right_area}`}>
                {!editedFilterCondition.department_id && (
                  <div className={`ml-auto h-full w-full min-w-[185px]`}>
                    <p className={`text-[12px]`}>先に事業部を選択してください</p>
                  </div>
                )}
                {!!editedFilterCondition.department_id && filteredSectionBySelectedDepartment?.length === 0 && (
                  <div className={`ml-auto h-full w-full min-w-[185px]`}>
                    <p className={`text-[12px]`}>課・セクションがありません</p>
                  </div>
                )}
                {!!editedFilterCondition.department_id && filteredSectionBySelectedDepartment?.length >= 1 && (
                  <select
                    className={` ml-auto h-full w-full ${styles.select_box}`}
                    value={editedFilterCondition.section_id ? editedFilterCondition.section_id : ""}
                    onChange={(e) => {
                      // --------------------- 🔹課ありパターン ---------------------
                      let newCondition: FilterCondition;
                      // 1. unit_idが選択されてる状態で課・セクションが変更されたら、unit_idを初期値に設定する(課・セクションに合致する選択肢の1番目)

                      // 1. unit_idが選択されてる状態で課・セクションが変更されたら、unit_idを初期値に設定する
                      if (editedFilterCondition.unit_id) {
                        if (cacheUnitsArray && cacheUnitsArray?.length >= 1) {
                          const firstUnitData = cacheUnitsArray.find(
                            (unit) => unit.created_by_section_id === e.target.value
                          );
                          console.log("フィルターfirstUnitData", firstUnitData);
                          // unitsキャッシュに要素が1つ以上存在するならキャッシュの１番目を初期値として格納
                          newCondition = {
                            ...editedFilterCondition,
                            section_id: e.target.value,
                            unit_id: firstUnitData?.id ?? "",
                          };
                        } else {
                          // unitsキャッシュに要素がundefinedか空なら、unit_idに初期値の空文字をセットする
                          newCondition = {
                            ...editedFilterCondition,
                            section_id: e.target.value,
                            unit_id: "",
                          };
                        }
                      } else {
                        newCondition = { ...editedFilterCondition, section_id: e.target.value };
                      }

                      setEditedFilterCondition(newCondition);

                      // // --------------------- 🔹課なしパターン ---------------------
                      // const newCondition = { ...editedFilterCondition, section_id: e.target.value };
                      // setEditedFilterCondition(newCondition);
                    }}
                  >
                    {/* <option value="">すべての係・チーム</option> */}
                    {/* {!memberAccount.assigned_section_id && <option value="">未設定</option>} */}
                    <option value="">未設定</option>
                    {!!filteredSectionBySelectedDepartment &&
                      [...filteredSectionBySelectedDepartment]
                        .sort((a, b) => {
                          if (a.section_name === null || b.section_name === null) return 0;
                          return a.section_name.localeCompare(b.section_name, language === "ja" ? "ja" : "en") ?? 0;
                        })
                        .map(
                          (section, index) =>
                            !!section &&
                            section.section_name && (
                              <option key={section.id} value={section.id}>
                                {section.section_name}
                              </option>
                            )
                        )}
                  </select>
                )}
              </div>
            </li>

            {/* 係・チーム */}
            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
            >
              <div className="flex min-w-[145px] items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>係・チーム</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div className={`${styles.list_right_area}`}>
                {!editedFilterCondition.section_id && (
                  <div className={`ml-auto h-full w-full min-w-[185px]`}>
                    <p className={`text-[12px]`}>先に課・セクションを選択してください</p>
                  </div>
                )}
                {!!editedFilterCondition.section_id && filteredUnitBySelectedSection?.length === 0 && (
                  <div className={`ml-auto h-full w-full min-w-[185px]`}>
                    <p className={`text-[12px]`}>係・チームがありません</p>
                  </div>
                )}
                {!!editedFilterCondition.section_id && filteredUnitBySelectedSection?.length >= 1 && (
                  <select
                    className={` ml-auto h-full w-full ${styles.select_box}`}
                    value={editedFilterCondition.unit_id ? editedFilterCondition.unit_id : ""}
                    onChange={(e) => {
                      const newCondition = { ...editedFilterCondition, unit_id: e.target.value };
                      setEditedFilterCondition(newCondition);
                    }}
                  >
                    <option value="">未設定</option>
                    {!!filteredUnitBySelectedSection &&
                      [...filteredUnitBySelectedSection]
                        .sort((a, b) => {
                          if (a.unit_name === null || b.unit_name === null) return 0;
                          return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en") ?? 0;
                        })
                        .map(
                          (unit, index) =>
                            !!unit &&
                            unit.unit_name && (
                              <option key={unit.id} value={unit.id}>
                                {unit.unit_name}
                              </option>
                            )
                        )}
                  </select>
                )}
              </div>
            </li>

            {/* <hr className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`} /> */}

            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
            >
              <div className="flex min-w-[145px] items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>事業所・営業所</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div className={`${styles.list_right_area}`}>
                <select
                  className={` ml-auto h-full w-full ${styles.select_box}`}
                  value={editedFilterCondition.office_id ? editedFilterCondition.office_id : ""}
                  onChange={(e) => {
                    // setIsOpenDropdownMenu(false);
                    // setIsFetchAllCompanies(e.target.value === "All");
                    const newCondition = { ...editedFilterCondition, office_id: e.target.value };
                    setEditedFilterCondition(newCondition);
                  }}
                >
                  {/* <option value="">すべての事業所・営業所</option> */}
                  {/* {!memberAccount.assigned_office_id && <option value="">未設定</option>} */}
                  <option value="">未設定</option>
                  {!!cacheOfficesArray &&
                    [...cacheOfficesArray]
                      .sort((a, b) => {
                        if (a.office_name === null || b.office_name === null) return 0;
                        return a.office_name.localeCompare(b.office_name, language === "ja" ? "ja" : "en") ?? 0;
                      })
                      .map(
                        (office, index) =>
                          !!office &&
                          office.office_name && (
                            <option key={office.id} value={office.id}>
                              {office.office_name}
                            </option>
                          )
                      )}
                </select>
              </div>
            </li>

            {/* <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
            >
              <div className="flex min-w-[145px] items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>社員番号・ID</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div className={`${styles.list_right_area}`}>
                <input
                  type="text"
                  placeholder="社員番号・IDを入力"
                  className={`${styles.input_box}`}
                  value={editedFilterCondition.employee_id_name ? editedFilterCondition.employee_id_name : ""}
                  onChange={(e) => setEditedFilterCondition({ ...editedFilterCondition, employee_id_name: e.target.value })}
                  // onCompositionStart={() => setIsComposing(true)}
                  // onCompositionEnd={() => setIsComposing(false)}
                  onBlur={() => {
                    if (!editedFilterCondition.employee_id_name) return;
                    const newCondition = toHalfWidthAndSpace(editedFilterCondition.employee_id_name.trim());
                    setEditedFilterCondition({ ...editedFilterCondition, employee_id_name: newCondition });
                  }}
                />
              </div>
            </li> */}
          </ul>
        </div>
        {/* ボタンエリア */}
        <div
          className={`flex min-h-[58px] w-full items-center justify-center space-x-[12px] px-[24px] pb-[24px] pt-[22px] text-[13px]`}
        >
          <button
            className="min-h-[32px] w-full rounded-[6px] bg-[var(--color-bg-sub)] py-[6px]  text-[var(--color-text-sub)] hover:bg-[var(--color-bg-sub-hover)]"
            // onClick={() => setIsOpenDropdownMenu(false)}
            onClick={() => {
              if (!isMultiple && setIsOpenDropdownMenu) {
                setIsOpenDropdownMenu(false);
              } else if (isOpenDropdownMenuArray && setIsOpenDropdownMenuArray) {
                const resetArray = Array.from({ length: isOpenDropdownMenuArray.length }, () => false);
                setIsOpenDropdownMenuArray(resetArray);
              }
            }}
          >
            戻る
          </button>
          <button
            className="min-h-[32px] w-full rounded-[6px] bg-[var(--color-bg-brand-f)] py-[6px] text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
            onClick={() => {
              if (handleSubmit) {
                handleSubmit();
                return;
              } else {
                handleLocalSubmit();
              }
            }}
          >
            変更を保存
          </button>
        </div>
      </div>
    </>
  );
};
