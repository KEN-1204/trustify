import useDashboardStore from "@/store/useDashboardStore";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import styles from "./DropDownMenuSearchModeDetail.module.css";
import { MdOutlineDataSaverOff } from "react-icons/md";
import NextImage from "next/image";
import { FiRefreshCw } from "react-icons/fi";

type Props = {
  setIsOpenDropdownMenuSearchMode: Dispatch<SetStateAction<boolean>>;
  language?: string;
  setSelectedRowData: (payload: any | null) => void; // 自社のみ全ての切り替え時のリセット用
};

export const DropDownMenuSearchModeDetail = ({
  setIsOpenDropdownMenuSearchMode,
  language = "ja",
  setSelectedRowData,
}: Props) => {
  const isFetchAllDepartments = useDashboardStore((state) => state.isFetchAllDepartments);
  const setIsFetchAllDepartments = useDashboardStore((state) => state.setIsFetchAllDepartments);
  const isFetchAllSections = useDashboardStore((state) => state.isFetchAllSections);
  const setIsFetchAllSections = useDashboardStore((state) => state.setIsFetchAllSections);
  const isFetchAllUnits = useDashboardStore((state) => state.isFetchAllUnits);
  const setIsFetchAllUnits = useDashboardStore((state) => state.setIsFetchAllUnits);
  const isFetchAllOffices = useDashboardStore((state) => state.isFetchAllOffices);
  const setIsFetchAllOffices = useDashboardStore((state) => state.setIsFetchAllOffices);
  const isFetchAllMembers = useDashboardStore((state) => state.isFetchAllMembers);
  const setIsFetchAllMembers = useDashboardStore((state) => state.setIsFetchAllMembers);

  // ローカルstate
  const [isAllDepartmentLocal, setIsAllDepartmentLocal] = useState(isFetchAllDepartments);
  const [isAllSectionLocal, setIsAllSectionLocal] = useState(isFetchAllSections);
  const [isAllUnitLocal, setIsAllUnitLocal] = useState(isFetchAllUnits);
  const [isAllOfficeLocal, setIsAllOfficeLocal] = useState(isFetchAllOffices);
  const [isAllMemberLocal, setIsAllMemberLocal] = useState(isFetchAllMembers);

  console.log(
    "isFetchAllDepartments",
    isFetchAllDepartments,
    "isFetchAllSections",
    isFetchAllSections,
    "isFetchAllUnits",
    isFetchAllUnits,
    "isFetchAllOffices",
    isFetchAllOffices,
    "isFetchAllMembers",
    isFetchAllMembers
  );
  console.log(
    "isAllDepartmentLocal",
    isAllDepartmentLocal,
    "isAllSectionLocal",
    isAllSectionLocal,
    "isAllUnitLocal",
    isAllUnitLocal,
    "isAllOfficeLocal",
    isAllOfficeLocal,
    "isAllMemberLocal",
    isAllMemberLocal
  );

  // 初回マウント時に現在のstateを反映
  useEffect(() => {
    setIsAllDepartmentLocal(isFetchAllDepartments);
    setIsAllSectionLocal(isFetchAllSections);
    setIsAllUnitLocal(isFetchAllUnits);
    setIsAllOfficeLocal(isFetchAllOffices);
    setIsAllMemberLocal(isFetchAllMembers);
  }, []);

  // 変更を保存
  const handleUpdateSubmit = () => {
    if (isFetchAllDepartments !== isAllDepartmentLocal) setIsFetchAllDepartments(isAllDepartmentLocal);
    if (isFetchAllSections !== isAllSectionLocal) setIsFetchAllSections(isAllSectionLocal);
    if (isFetchAllUnits !== isAllUnitLocal) setIsFetchAllUnits(isAllUnitLocal);
    if (isFetchAllOffices !== isAllOfficeLocal) setIsFetchAllOffices(isAllOfficeLocal);
    if (isFetchAllMembers !== isAllMemberLocal) setIsFetchAllMembers(isAllMemberLocal);

    // 選択行をリセット
    if (setSelectedRowData) setSelectedRowData(null);

    setIsOpenDropdownMenuSearchMode(false);
  };

  const detailArray = [
    {
      key: "department",
      title_ja: "事業部",
      title_en: "Department",
      state: isAllDepartmentLocal,
      dispatch: setIsAllDepartmentLocal,
    },
    {
      key: "section",
      title_ja: "課・セクション",
      title_en: "Section",
      state: isAllSectionLocal,
      dispatch: setIsAllSectionLocal,
    },
    { key: "unit", title_ja: "係・チーム", title_en: "Unit", state: isAllUnitLocal, dispatch: setIsAllUnitLocal },
    {
      key: "office",
      title_ja: "事業所・営業所",
      title_en: "Office",
      state: isAllOfficeLocal,
      dispatch: setIsAllOfficeLocal,
    },
    { key: "member", title_ja: "メンバー", title_en: "Member", state: isAllMemberLocal, dispatch: setIsAllMemberLocal },
  ];

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
        <div className={`relative flex h-auto w-full flex-col items-start space-y-[6px] px-[24px] pt-[16px]`}>
          <h2 className="flex items-center space-x-[12px] text-[16px] font-bold text-[var(--color-text-title)]">
            <span>フィルター設定</span>
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
            「事業部」「課・セクション」「係・チーム」「事業所・営業所」「メンバー」の各項目で検索条件の切り替えが可能です。
          </p>
        </div>

        <div className={`relative flex h-auto w-full items-start justify-start  px-[24px] pb-[8px] pt-[8px]`}>
          <div
            className={`flex-center transition-bg03 relative  h-[26px] min-w-[90px]  cursor-pointer space-x-1  rounded-[4px] border border-solid border-transparent px-[6px] text-[12px] text-[var(--color-text-sub)] hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--setting-bg-sub)] hover:text-[var(--color-text)] ${styles.fh_text_btn}`}
            onClick={() => {
              if (!isAllDepartmentLocal) setIsAllDepartmentLocal(true);
              if (!isAllSectionLocal) setIsAllSectionLocal(true);
              if (!isAllUnitLocal) setIsAllUnitLocal(true);
              if (!isAllOfficeLocal) setIsAllOfficeLocal(true);
              if (!isAllMemberLocal) setIsAllMemberLocal(true);
            }}
          >
            <div className="flex-center mr-[2px]">
              <FiRefreshCw />
            </div>
            <span className="whitespace-nowrap">リセット</span>
          </div>
        </div>

        <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" />

        {/* テーマ・アカウント設定エリア */}
        <div className="flex w-full flex-col">
          <ul className={`flex flex-col px-[1px] pb-[1px] text-[13px] text-[var(--color-text-title)]`}>
            {detailArray &&
              detailArray.length > 0 &&
              detailArray.map((obj, index) => (
                <li
                  key={index}
                  className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                  //   onMouseEnter={() => setHoveredThemeMenu(true)}
                  //   onMouseLeave={() => setHoveredThemeMenu(false)}
                >
                  <div className="flex min-w-[145px] items-center">
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      {/* <span className={`${styles.list_title}`}>検索タイプ</span> */}
                      {language === "ja" && <span className={`${styles.list_title}`}>{obj.title_ja}</span>}
                      {language === "en" && <span className={`${styles.list_title}`}>{obj.title_en}</span>}
                      <span className={``}>：</span>
                    </div>
                  </div>
                  <div>
                    {!isAllMemberLocal && obj.key !== "member" && (
                      <div className={`ml-auto h-full w-full min-w-[185px]`}>
                        <p className={`text-[12px]`}>全メンバーの時のみ変更可能</p>
                      </div>
                    )}
                    {!isAllMemberLocal && obj.title_ja === "メンバー" && (
                      <select
                        className={`ml-auto h-full w-full min-w-[185px] ${styles.select_box}`}
                        value={obj.state ? `All` : `Own`}
                        onChange={(e) => {
                          if (obj.key === "member" && e.target.value === "All") {
                            setIsAllMemberLocal(true);
                            setIsAllDepartmentLocal(true);
                            setIsAllSectionLocal(true);
                            setIsAllUnitLocal(true);
                            setIsAllOfficeLocal(true);
                          }
                          // setIsOpenDropdownMenuSearchMode(true);
                          // Allならtrue、Ownならfalseをクエリキーに渡す
                          // obj.dispatch(e.target.value === "All");
                        }}
                      >
                        {language === "ja" && (
                          <>
                            <option value="All">{`全${obj.title_ja}`}</option>
                            {obj.key === "member" && <option value="Own">{`自身のデータ`}</option>}
                          </>
                        )}
                        {language === "en" && (
                          <>
                            <option value="All">{`All ${obj.title_en}`}</option>
                            {obj.key === "member" && <option value="Own">{`My data`}</option>}
                          </>
                        )}
                      </select>
                    )}
                    {isAllMemberLocal && (
                      <select
                        className={`ml-auto h-full w-full min-w-[185px] ${styles.select_box}`}
                        value={obj.state ? `All` : `Own`}
                        onChange={(e) => {
                          if (obj.key === "member" && e.target.value === "Own") {
                            setIsAllMemberLocal(false);
                            if (isAllDepartmentLocal) setIsAllDepartmentLocal(false);
                            if (isAllSectionLocal) setIsAllSectionLocal(false);
                            if (isAllUnitLocal) setIsAllUnitLocal(false);
                            if (isAllOfficeLocal) setIsAllOfficeLocal(false);
                            return;
                          }
                          // 事業部が自事業部から全事業部に変更 => 課・係をALLに変更
                          if (obj.key === "department" && e.target.value === "All") {
                            // 課をtrue(全て)に変更
                            if (!isAllSectionLocal) setIsAllSectionLocal(true);
                            // 係をtrue(全て)に変更
                            if (!isAllUnitLocal) setIsAllUnitLocal(true);
                            obj.dispatch(e.target.value === "All");
                          }
                          // 課・セクションがfalse(Own)からtrue(All)に変更 => 係をAllに変更
                          else if (obj.key === "section" && e.target.value === "All") {
                            // 係をtrue(全て)に変更
                            if (!isAllUnitLocal) setIsAllUnitLocal(true);
                            obj.dispatch(e.target.value === "All");
                          } else {
                            // Allならtrue、Ownならfalseをクエリキーに渡す
                            obj.dispatch(e.target.value === "All");
                          }
                        }}
                      >
                        {language === "ja" && (
                          <>
                            <option value="All">{`全${obj.title_ja}`}</option>
                            {obj.key === "department" && <option value="Own">{`自${obj.title_ja}`}</option>}
                            {obj.key === "section" && !isAllDepartmentLocal && (
                              <option value="Own">{`自${obj.title_ja}`}</option>
                            )}
                            {obj.key === "unit" && !isAllSectionLocal && (
                              <option value="Own">{`自${obj.title_ja}`}</option>
                            )}
                            {/* {obj.key === "unit" && !isAllDepartmentLocal && (
                              <option value="Own">{`自${obj.title_ja}`}</option>
                            )} */}
                            {obj.key === "office" && <option value="Own">{`自${obj.title_ja}`}</option>}
                            {obj.key === "member" && <option value="Own">{`自身のデータのみ`}</option>}
                          </>
                        )}
                        {language === "en" && (
                          <>
                            <option value="All">{`All ${obj.title_en}`}</option>
                            {obj.key === "department" && <option value="Own">{`Own ${obj.title_en}`}</option>}
                            {obj.key === "section" && !isAllDepartmentLocal && (
                              <option value="Own">{`Own ${obj.title_en}`}</option>
                            )}
                            {obj.key === "unit" && !isAllSectionLocal && (
                              <option value="Own">{`Own ${obj.title_en}`}</option>
                            )}
                            {/* {obj.key === "unit" && !isAllDepartmentLocal && (
                              <option value="Own">{`Own ${obj.title_en}`}</option>
                            )} */}
                            {obj.key === "office" && <option value="Own">{`Own ${obj.title_en}`}</option>}
                            {obj.key === "member" && <option value="Own">{`My data`}</option>}
                          </>
                        )}
                      </select>
                    )}
                  </div>
                </li>
              ))}
          </ul>
        </div>
        {/* ボタンエリア */}
        <div
          className={`flex min-h-[58px] w-full items-center justify-center space-x-[12px] px-[24px] pb-[24px] pt-[12px]`}
        >
          <div
            className="min-h-[32px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-sub)]  py-[6px] text-[var(--color-text-sub)] hover:bg-[var(--color-bg-sub-hover)]"
            onClick={() => setIsOpenDropdownMenuSearchMode(false)}
          >
            戻る
          </div>
          <div
            className="min-h-[32px] w-full cursor-pointer rounded-[6px] bg-[var(--color-bg-brand-f)] py-[6px] text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
            onClick={handleUpdateSubmit}
          >
            変更を保存
          </div>
        </div>
      </div>
    </>
  );
};
