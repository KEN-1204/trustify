import useDashboardStore from "@/store/useDashboardStore";
import React, { Dispatch, SetStateAction, useRef, useState } from "react";
import styles from "./DropDownMenuSearchMode.module.css";
import { MdOutlineDataSaverOff } from "react-icons/md";
import NextImage from "next/image";
import useStore from "@/store";
import { useQueryClient } from "@tanstack/react-query";

const descriptionDisplayType = [
  {
    title: "全ての会社",
    content: "検索条件に一致する全ての会社を表示します。",
    titleEn: "Auto Search(Partial Search)",
    contentEn: "デフォルトで各検索条件に入力した文字を含む全てのデータを取得します。",
  },
  {
    title: "自社専用",
    content: "検索条件に一致する自社で作成した会社のみを表示します。",
    titleEn: "マニュアル検索(完全一致検索 + 部分一致検索)",
    contentEn:
      "各検索条件に入力した文字と同じデータを持つデータのみ取得します。\nまた、マニュアルで「＊(アスタリスク)」を使用することで部分一致・前方一致・後方一致の検索が可能です。",
  },
];
const descriptionSearchType = [
  {
    title: "オート検索（部分一致）",
    content: "デフォルトで各検索条件に入力した文字を含む全てのデータを取得します。",
    titleEn: "Auto Search(Partial Search)",
    contentEn: "デフォルトで各検索条件に入力した文字を含む全てのデータを取得します。",
  },
  {
    title: "マニュアル検索（完全一致 + 部分一致）",
    content:
      "各検索条件に入力した文字と同じデータを持つデータのみ取得します。\nまた、マニュアルで「＊(アスタリスク)」を使用することで部分一致・前方一致・後方一致の検索が可能です。",
    titleEn: "マニュアル検索(完全一致検索 + 部分一致検索)",
    contentEn:
      "各検索条件に入力した文字と同じデータを持つデータのみ取得します。\nまた、マニュアルで「＊(アスタリスク)」を使用することで部分一致・前方一致・後方一致の検索が可能です。",
  },
];

type SearchType = "partial_match" | "manual";
const optionsSearchType: SearchType[] = ["partial_match", "manual"];
const mappingSearchType: { [key: string]: { [key: string]: string } } = {
  // partial_match: { ja: "オート検索（部分一致）", en: "Partial Match Search" },
  // manual: { ja: "マニュアル検索（完全一致 + 部分一致）", en: "Manual Search" },
  partial_match: { ja: "オート検索", en: "Partial Match Search" },
  manual: { ja: "マニュアル検索", en: "Manual Search" },
};

type Props = {
  setIsOpenDropdownMenuSearchMode: Dispatch<SetStateAction<boolean>>;
  isFetchCompanyType?: boolean;
};

export const DropDownMenuSearchMode = ({ setIsOpenDropdownMenuSearchMode, isFetchCompanyType = true }: Props) => {
  const language = useStore((state) => state.language);
  const isFetchAllCompanies = useDashboardStore((state) => state.isFetchAllCompanies);
  const setIsFetchAllCompanies = useDashboardStore((state) => state.setIsFetchAllCompanies);
  const evenRowColorChange = useDashboardStore((state) => state.evenRowColorChange);
  const setEvenRowColorChange = useDashboardStore((state) => state.setEvenRowColorChange);
  const searchType = useDashboardStore((state) => state.searchType);
  const setSearchType = useDashboardStore((state) => state.setSearchType);
  // 各タブのクエリ条件を保持するグローバルState
  const newSearchCompanyParams = useDashboardStore((state) => state.newSearchCompanyParams);
  const setNewSearchCompanyParams = useDashboardStore((state) => state.setNewSearchCompanyParams);
  const newSearchContact_CompanyParams = useDashboardStore((state) => state.newSearchContact_CompanyParams);
  const setNewSearchContact_CompanyParams = useDashboardStore((state) => state.setNewSearchContact_CompanyParams);
  const newSearchActivity_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchActivity_Contact_CompanyParams
  );
  const setNewSearchActivity_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchActivity_Contact_CompanyParams
  );
  const newSearchMeeting_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchMeeting_Contact_CompanyParams
  );
  const setNewSearchMeeting_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchMeeting_Contact_CompanyParams
  );
  const newSearchProperty_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchProperty_Contact_CompanyParams
  );
  const setNewSearchProperty_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchProperty_Contact_CompanyParams
  );
  const newSearchQuotation_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchQuotation_Contact_CompanyParams
  );
  const setNewSearchQuotation_Contact_CompanyParams = useDashboardStore(
    (state) => state.setNewSearchQuotation_Contact_CompanyParams
  );
  // アクティブメニュータブ
  // const activeMenuTab = useDashboardStore((state) => state.activeMenuTab);

  const queryClient = useQueryClient();

  const modalRef = useRef<HTMLDivElement | null>(null);

  // -------------------------- 🌟説明ポップアップメニュー🌟 --------------------------
  const [openPopupMenu, setOpenPopupMenu] = useState<{ y: number; title: string } | null>(null);
  const mappingPopupTitle: { [key: string]: { [key: string]: string } } = {
    rowStyle: { en: "Row style", ja: "行スタイル" },
    searchType: { en: "Search type", ja: "検索タイプ" },
    displayType: { en: "Display Type", ja: "表示タイプ" },
  };
  type PopupMenuParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    title: string;
  };
  const handleOpenPopupMenu = ({ e, title }: PopupMenuParams) => {
    // const { y, height } = e.currentTarget.getBoundingClientRect();
    const y = e.currentTarget.offsetTop;
    const height = e.currentTarget.offsetHeight;
    setOpenPopupMenu({
      // y: y - height / 2,
      // y: 33,
      y: y + height,
      title: title,
    });
  };
  const handleClosePopupMenu = () => {
    setOpenPopupMenu(null);
  };
  // -------------------------- ✅説明ポップアップメニュー✅ --------------------------

  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed left-[-50%] top-[-50%] z-[1000] h-[200vh] w-[200vw]"
        onClick={() => {
          setIsOpenDropdownMenuSearchMode(false);
        }}
      ></div>
      {/* 説明ポップアップメニュー */}
      {openPopupMenu && (
        <div
          className={`${styles.description_menu} border-real-with-shadow-f absolute right-[-18px] z-[3500] flex min-h-max flex-col rounded-[6px]`}
          style={{
            top: `${openPopupMenu.y}px`,
            right: `${modalRef.current?.offsetWidth ?? 456}px`,
            ...(["rowStyle"].includes(openPopupMenu.title) && { minWidth: "max-content" }),
            ...(["displayType"].includes(openPopupMenu.title) && { minWidth: "max-content" }),
            ...(["searchType"].includes(openPopupMenu.title) && { minWidth: "400px" }),
          }}
        >
          <div className={`min-h-max w-full font-bold ${styles.title}`}>
            <div className="flex max-w-max flex-col">
              <span>{mappingPopupTitle[openPopupMenu.title][language]}</span>
              <div className={`${styles.underline} w-full`} />
            </div>
          </div>

          <ul className={`flex flex-col rounded-[6px] ${styles.u_list}`}>
            {openPopupMenu.title === "displayType" &&
              descriptionDisplayType.map((item, index) => (
                <li
                  key={item.title + index.toString()}
                  className={`${styles.dropdown_list_item} flex w-full cursor-pointer flex-col items-start space-y-1 `}
                >
                  <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                    {item.title}
                  </span>
                  <p style={{ whiteSpace: "pre-wrap" }} className="select-none text-start text-[12px]">
                    {item.content}
                  </p>
                </li>
              ))}
            {openPopupMenu.title === "searchType" &&
              descriptionSearchType.map((item, index) => (
                <li
                  key={item.title + index.toString()}
                  className={`${styles.dropdown_list_item} flex w-full cursor-pointer flex-col items-start space-y-1 `}
                >
                  <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                    {item.title}
                  </span>
                  <p style={{ whiteSpace: "pre-wrap" }} className="select-none text-start text-[12px]">
                    {item.content}
                  </p>
                </li>
              ))}
            {!["searchType", "displayType"].includes(openPopupMenu.title) && (
              <li className={`${styles.dropdown_list_item} flex  w-full cursor-pointer flex-col space-y-1`}>
                <p className="select-none">
                  {openPopupMenu.title === "rowStyle" && "テーブルの偶数行の色を変更します。"}
                </p>
              </li>
            )}
          </ul>
        </div>
      )}
      {/* 説明ポップアップメニューここまで */}
      {/* モーダル */}
      <div
        ref={modalRef}
        className={`${styles.modal_container} border-real-with-shadow fade03 absolute right-[0px] top-[33px] z-[2000] flex h-auto w-fit min-w-[276px] flex-col rounded-[4px] bg-[var(--color-edit-bg-solid)]`}
      >
        {/* 説明エリア */}
        <div className={`relative flex h-auto w-full flex-col items-start space-y-[6px] px-[24px] py-[16px]`}>
          <h2 className="flex items-center space-x-[12px] text-[16px] font-bold text-[var(--color-text-title)]">
            <span>モード設定</span>
            <span>
              {/* <img width="24" height="24" src="https://img.icons8.com/3d-fluency/24/job.png" alt="job" /> */}
              {/* <NextImage width={24} height={24} src={`https://img.icons8.com/3d-fluency/24/job.png`} alt="setting" /> */}
              {/* <NextImage width={24} height={24} src={`/assets/images/icons/icons8-job-94.png`} alt="setting" /> */}
              <NextImage
                width={24}
                height={24}
                src={`/assets/images/icons/business/icons8-process-94.png`}
                alt="setting"
                className={`${styles.title_icon}`}
              />
            </span>
          </h2>
          {isFetchCompanyType && (
            <p className="text-start text-[12px] text-[var(--color-text-title)]">
              表示タイプで「条件に一致する全ての会社を表示」、「条件に一致する自社で作成した会社のみを表示」を切り替えることが可能です。
            </p>
          )}
          {!isFetchCompanyType && (
            <p className="text-start text-[12px] text-[var(--color-text-title)]">
              検索タイプでオート検索による部分一致検索や、完全一致、部分一致を細かく設定可能なマニュアル検索、行のスタイルなどの切り替えが可能です。
            </p>
          )}
        </div>

        <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" />

        {/* テーマ・アカウント設定エリア */}
        <div className="flex w-full flex-col">
          <ul className={`flex flex-col space-y-[6px] pb-[8px] pt-[6px] text-[13px] text-[var(--color-text-title)]`}>
            {isFetchCompanyType && (
              <li
                className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
                //   onMouseEnter={() => setHoveredThemeMenu(true)}
                //   onMouseLeave={() => setHoveredThemeMenu(false)}
                onMouseEnter={(e) => {
                  handleOpenPopupMenu({ e, title: "displayType" });
                }}
                onMouseLeave={handleClosePopupMenu}
              >
                <div className="flex items-center">
                  <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                  <div className="flex select-none items-center space-x-[2px]">
                    <span className={`${styles.list_title}`}>表示タイプ</span>
                    <span className={``}>：</span>
                  </div>
                </div>
                <div>
                  <select
                    className={`ml-auto h-full w-full ${styles.select_box}`}
                    value={isFetchAllCompanies ? `All` : `Own`}
                    onChange={(e) => {
                      setIsOpenDropdownMenuSearchMode(false);
                      // Allならtrue、Ownならfalseをクエリキーに渡す
                      setIsFetchAllCompanies(e.target.value === "All");
                    }}
                  >
                    <option value="All">全ての会社</option>
                    <option value="Own">自社専用</option>
                    {/* <option value="All">条件に一致する全ての会社を表示</option>
                    <option value="Own">条件に一致する自社で作成した会社のみ表示</option> */}
                  </select>
                </div>
              </li>
            )}

            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
              onMouseEnter={(e) => {
                handleOpenPopupMenu({ e, title: "searchType" });
              }}
              onMouseLeave={handleClosePopupMenu}
            >
              <div className="flex items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>検索タイプ</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div>
                <select
                  className={`ml-auto h-full w-full ${styles.select_box}`}
                  // style={{ ...(!isFetchCompanyType && { minWidth: "max-content" }) }}
                  value={searchType}
                  onChange={async (e) => {
                    setIsOpenDropdownMenuSearchMode(false);
                    setSearchType(e.target.value);

                    // 各クエリ条件をリセットする(エスケープ特殊文字の取り扱いが検索タイプで異なるため)
                    if (!newSearchCompanyParams) setNewSearchCompanyParams(null);
                    if (!newSearchContact_CompanyParams) setNewSearchContact_CompanyParams(null);
                    if (!newSearchActivity_Contact_CompanyParams) setNewSearchActivity_Contact_CompanyParams(null);
                    if (!newSearchMeeting_Contact_CompanyParams) setNewSearchMeeting_Contact_CompanyParams(null);
                    if (!newSearchProperty_Contact_CompanyParams) setNewSearchProperty_Contact_CompanyParams(null);
                    if (!newSearchQuotation_Contact_CompanyParams) setNewSearchQuotation_Contact_CompanyParams(null);

                    // クエリキーにfunctionNameを指定して, 'partial_match'と'manual'がクエリキーに割り当てられるので、removeは不要
                    // 現在取得しているクエリのキャッシュを全て削除のみ、再取得は行わない
                    // await queryClient.removeQueries({ queryKey: ["companies"] });
                    // 現在取得しているクエリのキャッシュを全て削除し、再取得
                    // await queryClient.resetQueries({ queryKey: ["companies"] });
                  }}
                >
                  {optionsSearchType.map((option) => (
                    <option key={option} value={option}>
                      {mappingSearchType[option][language]}
                    </option>
                  ))}
                  {/* <option value="partial_match">部分一致検索(オート)</option>
                  <option value="manual">完全一致検索 + 部分一致検索(マニュアル)</option> */}
                </select>
              </div>
            </li>

            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
              onMouseEnter={(e) => {
                handleOpenPopupMenu({ e, title: "rowStyle" });
              }}
              onMouseLeave={handleClosePopupMenu}
            >
              <div className="flex items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>行スタイル</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div>
                <select
                  className={`ml-auto h-full w-full ${styles.select_box}`}
                  // style={{ ...(!isFetchCompanyType && { minWidth: "max-content" }) }}
                  value={evenRowColorChange ? `true` : `false`}
                  onChange={(e) => {
                    setIsOpenDropdownMenuSearchMode(false);
                    setEvenRowColorChange(e.target.value === "true");
                  }}
                >
                  <option value="true">偶数行のカラー変更あり</option>
                  <option value="false">偶数行のカラー変更なし</option>
                </select>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
};
