import useDashboardStore from "@/store/useDashboardStore";
import { Dispatch, SetStateAction } from "react";
import styles from "./DropDownMenuFilter.module.css";
import { MdOutlineDataSaverOff } from "react-icons/md";
import NextImage from "next/image";
import { Department, Employee_id, Office, Section, Unit } from "@/types";
import useStore from "@/store";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";

type FilterCondition = {
  department: Department["department_name"] | null;
  section: Section["section_name"] | null;
  unit: Unit["unit_name"] | null;
  office: Office["office_name"] | null;
  employee_id: Employee_id["employee_id_name"] | null;
};

type Props = {
  setIsOpenDropdownMenuFilter: Dispatch<SetStateAction<boolean>>;
  departmentDataArray: Department[] | undefined;
  sectionDataArray: Section[] | undefined;
  unitDataArray: Unit[] | undefined;
  officeDataArray: Office[] | undefined;
  filterCondition: FilterCondition;
  setFilterCondition: Dispatch<React.SetStateAction<FilterCondition>>;
  setIsComposing: Dispatch<React.SetStateAction<boolean>>;
};

export const DropDownMenuFilter = ({
  setIsOpenDropdownMenuFilter,
  departmentDataArray,
  sectionDataArray,
  unitDataArray,
  officeDataArray,
  filterCondition,
  setFilterCondition,
  setIsComposing,
}: Props) => {
  const language = useStore((state) => state.language);
  //   const isFetchAllCompanies = useDashboardStore((state) => state.isFetchAllCompanies);
  //   const setIsFetchAllCompanies = useDashboardStore((state) => state.setIsFetchAllCompanies);
  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed left-[-100vw] top-[-50%] z-[1000] h-[200vh] w-[300vw] bg-[#00000000]"
        onClick={() => {
          setIsOpenDropdownMenuFilter(false);
        }}
      ></div>
      {/* モーダル */}
      <div
        className={`shadow-all-md border-real-with-shadow fade03 absolute left-[0px] top-[33px] z-[20000] flex h-auto w-fit min-w-[276px] flex-col rounded-[4px] bg-[var(--color-edit-bg-solid)]`}
      >
        {/* 説明エリア */}
        <div className={`relative flex h-auto w-full flex-col items-start space-y-[6px] px-[24px] py-[16px]`}>
          <h2 className="flex items-center space-x-[12px] text-[16px] font-bold text-[var(--color-text-title)]">
            <span>フィルター設定</span>
            <span>
              <NextImage width={24} height={24} src={`/assets/images/icons/icons8-job-94.png`} alt="setting" />
            </span>
          </h2>
          <p className="text-start text-[12px] text-[var(--color-text-title)]">
            各セクション毎に条件を決めて表示するメンバーのフィルター検索が可能です。
          </p>
        </div>

        {/* <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" /> */}
        <hr className="min-h-[1px] w-full bg-[var(--color-border-light)]" />

        {/* テーマ・アカウント設定エリア */}
        <div className="flex w-full flex-col">
          <ul className={`flex flex-col px-[1px] pb-[1px] text-[13px] text-[var(--color-text-title)]`}>
            {/* ------------------------ 事業部 ------------------------ */}
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
                  value={filterCondition.department ? filterCondition.department : ""}
                  onChange={(e) => {
                    // setIsOpenDropdownMenuFilter(false);
                    // setIsFetchAllCompanies(e.target.value === "All");
                    const newCondition = { ...filterCondition, department: e.target.value };
                    setFilterCondition(newCondition);
                  }}
                >
                  {/* <option value="">すべての事業部</option> */}
                  <option value="">すべての事業部</option>
                  {!!departmentDataArray &&
                    [...departmentDataArray]
                      .sort((a, b) => {
                        if (a.department_name === null || b.department_name === null) return 0;
                        return a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en") ?? 0;
                      })
                      .map(
                        (department, index) =>
                          !!department &&
                          department.department_name && (
                            <option key={department.id} value={department.department_name}>
                              {department.department_name}
                            </option>
                          )
                      )}
                </select>
              </div>
            </li>
            {/* ------------------------ 事業部 ------------------------ */}

            {/* <hr className={`min-h-[1px] w-full bg-[var(--color-border-light)]`} /> */}

            {/* ------------------------ 課・セクション ------------------------ */}
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
                <select
                  className={` ml-auto h-full w-full ${styles.select_box}`}
                  value={filterCondition.section ? filterCondition.section : ""}
                  onChange={(e) => {
                    const newCondition = { ...filterCondition, section: e.target.value };
                    setFilterCondition(newCondition);
                  }}
                >
                  <option value="">すべての課・セクション</option>
                  {!!sectionDataArray &&
                    [...sectionDataArray]
                      .sort((a, b) => {
                        if (a.section_name === null || b.section_name === null) return 0;
                        return a.section_name.localeCompare(b.section_name, language === "ja" ? "ja" : "en") ?? 0;
                      })
                      .map(
                        (section, index) =>
                          !!section &&
                          section.section_name && (
                            <option key={section.id} value={section.section_name}>
                              {section.section_name}
                            </option>
                          )
                      )}
                </select>
              </div>
            </li>
            {/* ------------------------ 課・セクション ------------------------ */}

            {/* ------------------------ 係・チーム ------------------------ */}
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
                <select
                  className={` ml-auto h-full w-full ${styles.select_box}`}
                  value={filterCondition.unit ? filterCondition.unit : ""}
                  onChange={(e) => {
                    // setIsOpenDropdownMenuFilter(false);
                    // setIsFetchAllCompanies(e.target.value === "All");
                    const newCondition = { ...filterCondition, unit: e.target.value };
                    setFilterCondition(newCondition);
                  }}
                >
                  <option value="">すべての係・チーム</option>
                  {!!unitDataArray &&
                    [...unitDataArray]
                      .sort((a, b) => {
                        if (a.unit_name === null || b.unit_name === null) return 0;
                        return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en") ?? 0;
                      })
                      .map(
                        (unit, index) =>
                          !!unit &&
                          unit.unit_name && (
                            <option key={unit.id} value={unit.unit_name}>
                              {unit.unit_name}
                            </option>
                          )
                      )}
                </select>
              </div>
            </li>
            {/* ------------------------ 係・チーム ------------------------ */}

            {/* <hr className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`} /> */}

            {/* ------------------------ 事業所・営業所 ------------------------ */}
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
                  value={filterCondition.office ? filterCondition.office : ""}
                  onChange={(e) => {
                    // setIsOpenDropdownMenuFilter(false);
                    // setIsFetchAllCompanies(e.target.value === "All");
                    const newCondition = { ...filterCondition, office: e.target.value };
                    setFilterCondition(newCondition);
                  }}
                >
                  <option value="">すべての事業所・営業所</option>
                  {!!officeDataArray &&
                    [...officeDataArray]
                      .sort((a, b) => {
                        if (a.office_name === null || b.office_name === null) return 0;
                        return a.office_name.localeCompare(b.office_name, language === "ja" ? "ja" : "en") ?? 0;
                      })
                      .map(
                        (office, index) =>
                          !!office &&
                          office.office_name && (
                            <option key={office.id} value={office.office_name}>
                              {office.office_name}
                            </option>
                          )
                      )}
                </select>
              </div>
            </li>
            {/* ------------------------ 事業所・営業所 ------------------------ */}

            {/* ------------------------ 社員番号・ID ------------------------ */}
            <li
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
                  value={filterCondition.employee_id ? filterCondition.employee_id : ""}
                  onChange={(e) => setFilterCondition({ ...filterCondition, employee_id: e.target.value })}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  onBlur={() => {
                    if (!filterCondition.employee_id) return;
                    const newCondition = toHalfWidthAndSpace(filterCondition.employee_id.trim());
                    setFilterCondition({ ...filterCondition, employee_id: newCondition });
                  }}
                />
              </div>
            </li>
            {/* ------------------------ 社員番号・ID ------------------------ */}
          </ul>
        </div>
      </div>
    </>
  );
};
