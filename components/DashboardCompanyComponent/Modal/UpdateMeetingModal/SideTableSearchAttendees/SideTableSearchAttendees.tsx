import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { neonSearchIcon } from "@/components/assets";
import { Dispatch, FormEvent, SetStateAction, memo, useCallback, useEffect, useRef, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { MdOutlineDataSaverOff } from "react-icons/md";
import styles from "../UpdateMeetingModal.module.css";
import { Contact_row_data } from "@/types";
import { useMedia } from "react-use";

type Props = {
  isOpenSearchAttendeesSideTable: boolean;
  setIsOpenSearchAttendeesSideTable: Dispatch<SetStateAction<boolean>>;
  // searchAttendeeFields: {
  //   title: string;
  //   inputValue: string;
  //   setInputValue: React.Dispatch<React.SetStateAction<string>>;
  // }[];
  selectedSearchAttendeesArray: Contact_row_data[];
};

export const SideTableSearchAttendeesMemo = ({
  isOpenSearchAttendeesSideTable,
  setIsOpenSearchAttendeesSideTable,
  // searchAttendeeFields,
  selectedSearchAttendeesArray,
}: Props) => {
  // メディアクエリState
  // デスクトップモニター
  const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  useEffect(() => {
    setIsDesktopGTE1600(isDesktopGTE1600Media);
  }, [isDesktopGTE1600Media]);

  // 同席者検索フィールド用input
  const [searchInputCompany, setSearchInputCompany] = useState(""); //会社名
  const [searchInputDepartment, setSearchInputDepartment] = useState(""); //部署名
  const [searchInputContact, setSearchInputContact] = useState(""); //担当者名
  const [searchInputPositionName, setSearchInputPositionName] = useState(""); //役職名
  const [searchInputTel, setSearchInputTel] = useState(""); //代表TEL
  const [searchInputDirectLine, setSearchInputDirectLine] = useState(""); //直通TEL
  const [searchInputCompanyCellPhone, setSearchInputCompanyCellPhone] = useState(""); //社用携帯
  const [searchInputEmail, setSearchInputEmail] = useState(""); //Email
  const [searchInputAddress, setSearchInputAddress] = useState(""); //住所
  // 選択中の同席者オブジェクトを保持するstate
  // const [selectedSearchAttendeesArray, setSelectedSearchAttendeesArray] = useState<Contact_row_data[]>([]);

  const searchAttendeeFields = [
    {
      title: "会社名",
      inputValue: searchInputCompany,
      setInputValue: setSearchInputCompany,
    },
    {
      title: "部署名",
      inputValue: searchInputDepartment,
      setInputValue: setSearchInputDepartment,
    },
    {
      title: "担当者名",
      inputValue: searchInputContact,
      setInputValue: setSearchInputContact,
    },
    {
      title: "役職名",
      inputValue: searchInputPositionName,
      setInputValue: setSearchInputPositionName,
    },
    {
      title: "代表TEL",
      inputValue: searchInputTel,
      setInputValue: setSearchInputTel,
    },
    {
      title: "直通TEL",
      inputValue: searchInputDirectLine,
      setInputValue: setSearchInputDirectLine,
    },
    {
      title: "社用携帯",
      inputValue: searchInputCompanyCellPhone,
      setInputValue: setSearchInputCompanyCellPhone,
    },
    {
      title: "Email",
      inputValue: searchInputEmail,
      setInputValue: setSearchInputEmail,
    },
    {
      title: "住所",
      inputValue: searchInputAddress,
      setInputValue: setSearchInputAddress,
    },
  ];

  // サイドテーブルの同席者一覧エリアのスクロールアイテムRef
  const sideTableScrollHeaderRef = useRef<HTMLDivElement | null>(null);
  const sideTableScrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sideTableScrollItemRef = useRef<HTMLDivElement | null>(null);
  const originalY = useRef<number | null>(null);

  // サイドテーブル スクロール監視イベント
  const handleScrollEvent = useCallback(() => {
    if (!sideTableScrollItemRef.current || !sideTableScrollHeaderRef.current || !originalY.current) return;
    const currentScrollY = sideTableScrollItemRef.current.getBoundingClientRect().y;
    // const currentScrollY = sideTableScrollItemRef.current.offsetTop;
    console.log("scrollイベント発火🔥 現在のscrollY, originalY.current", currentScrollY, originalY.current);
    if (originalY.current !== currentScrollY) {
      if (sideTableScrollHeaderRef.current.classList.contains(`${styles.active}`)) return;
      sideTableScrollHeaderRef.current.classList.add(`${styles.active}`);
      console.log("✅useEffect add");
    } else {
      if (!sideTableScrollHeaderRef.current.classList.contains(`${styles.active}`)) return;
      sideTableScrollHeaderRef.current.classList.remove(`${styles.active}`);
      console.log("✅useEffect remove");
    }
  }, []);
  useEffect(() => {
    if (!sideTableScrollContainerRef.current || !sideTableScrollItemRef.current) return;
    // 初期Y位置取得
    if (!originalY.current) {
      originalY.current = sideTableScrollItemRef.current.getBoundingClientRect().y;
    }
    sideTableScrollContainerRef.current.addEventListener(`scroll`, handleScrollEvent);
    console.log("✅useEffectスクロール開始");

    return () => {
      if (!sideTableScrollContainerRef.current)
        return console.log("❌useEffectクリーンアップ sideTableScrollContainerRef.currentは既に存在せず リターン");
      sideTableScrollContainerRef.current?.removeEventListener(`scroll`, handleScrollEvent);
      console.log("✅useEffectスクロール終了 リターン");
    };
  }, [handleScrollEvent]);

  // -------------------------- 🌟同席者条件検索🌟 --------------------------
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    console.log("🔥onnSubmit発火");
    e.preventDefault();
  };
  // -------------------------- ✅同席者条件検索✅ --------------------------

  return (
    <>
      {/* オーバーレイ */}
      {isOpenSearchAttendeesSideTable && (
        <div
          // className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00800030]`}
          className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00000000]`}
          onClick={() => setIsOpenSearchAttendeesSideTable(false)}
        ></div>
      )}
      {/* サイドテーブル */}
      <div
        className={`${styles.side_table} z-[1200] pt-[30px] ${
          isOpenSearchAttendeesSideTable
            ? `${styles.active} transition-transform02 !delay-[0.1s]`
            : `transition-transform01`
        }`}
      >
        {/* タイトルエリア */}
        <div className="flex h-auto w-full flex-col px-[30px] 2xl:px-[30px]">
          <div className={`relative flex h-full w-full items-center justify-between`}>
            <h3 className="space-y-[1px] text-[22px] font-bold">
              <div className={`flex items-start space-x-[9px]`}>
                <span>同席者を検索</span>
                <span>{neonSearchIcon("30px")}</span>
              </div>
              <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]"></div>
              {/* <div className="brand-gradient-underline-light min-h-[1px] w-full"></div> */}
            </h3>
            <div
              // className={`flex-center h-[36px] w-[36px] cursor-pointer rounded-full hover:bg-[#666]`}
              className={`z-1 flex-center absolute right-[-10px] top-[50%]  h-[36px] w-[36px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[#666]`}
              onClick={() => setIsOpenSearchAttendeesSideTable(false)}
            >
              {/* <BsChevronRight className="z-1 absolute left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" /> */}
              <BsChevronRight className="text-[24px]" />
            </div>
          </div>
          {/* <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]"></div> */}
        </div>
        {/* 条件入力エリア */}
        <form
          className="mt-[20px] h-full max-h-[33vh] w-full overflow-y-scroll bg-[#ffffff00] pb-[90px]"
          onSubmit={handleSubmit}
          // onSubmit={(e) => console.log(e)}
        >
          {/* <div
          className="mt-[20px] h-full max-h-[33vh] w-full overflow-y-scroll bg-[#ffffff00] pb-[90px]"
          // onSubmit={(e) => console.log(e)}
        > */}
          <div className="flex h-auto w-full flex-col">
            {/* <div className={`sticky top-0 min-h-[60px] w-full`}></div> */}
            <div className={`flex min-h-[30px] items-end justify-between px-[30px]`}>
              <h3 className="flex min-h-[30px] max-w-max items-end space-y-[1px] text-[14px] font-bold ">
                <span>条件を入力して同席者を検索</span>
                {/* <div className="min-h-[1px] w-auto bg-[#999]"></div> */}
                {/* <RippleButton
                    title={`検索`}
                    bgColor="var(--color-bg-brand-f50)"
                    bgColorHover="var(--color-btn-brand-f-hover)"
                    classText={`select-none`}
                    clickEventHandler={() => {
                      // setIsOpenSettingInvitationModal(true);
                    }}
                  /> */}
              </h3>
              <div className="flex pr-[0px]">
                <RippleButton
                  title={`検索`}
                  minHeight="30px"
                  minWidth="78px"
                  fontSize="13px"
                  bgColor="var(--color-bg-brand-f50)"
                  bgColorHover="var(--color-btn-brand-f-hover)"
                  border="var(--color-bg-brand-f)"
                  borderRadius="6px"
                  classText={`select-none`}
                  // clickEventHandler={() => {
                  //   // setIsOpenSettingInvitationModal(true);
                  //   console.log("ボタンクリック");
                  // }}
                  buttonType="submit"
                />
              </div>
            </div>
            {/* <ul className={`flex flex-col px-[1px] text-[13px] text-[var(--color-text-title)]`}>
                <li className="px-[30px]"></li>
              </ul> */}
            <ul className={`mt-[20px] flex flex-col text-[13px] text-[var(--color-text-title)]`}>
              {searchAttendeeFields.map((item, index) => (
                <li
                  key={item.title + index.toString()}
                  className={`relative flex h-[56px] w-full min-w-max items-center justify-between px-[30px] py-[6px] text-[#fff] ${styles.side_table_search_list}`}
                >
                  <div className={`${styles.list_title_area} flex min-w-[120px] items-center`}>
                    <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                    <div className="flex select-none items-center space-x-[2px]">
                      <span className={`${styles.list_title}`}>{item.title}</span>
                      <span className={``}>：</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder=""
                    className={`${styles.input_box}`}
                    value={item.inputValue}
                    onChange={(e) => item.setInputValue(e.target.value)}
                    onBlur={() => item.setInputValue(item.inputValue.trim())}
                  />
                </li>
              ))}
            </ul>
            {/* {Array(20)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className={`${index % 2 === 1 ? `bg-red-100` : `bg-blue-100`} min-h-[60px] w-full`}
                  ></div>
                ))} */}
          </div>
        </form>
        {/* 条件入力エリア ここまで */}

        <hr className="my-[0px] min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />

        {/* 担当者一覧エリア */}
        {/* <div className="h-[40vh] w-full bg-[#ffffff90] px-[30px] 2xl:px-[30px]"></div> */}
        <div
          ref={sideTableScrollContainerRef}
          className="flex h-full max-h-[calc(100vh-(30px+36px+20px+33vh+1px+0px))] w-full flex-col overflow-y-scroll bg-[#ffffff00] pb-[90px]"
        >
          <div ref={sideTableScrollItemRef} className="flex h-auto w-full flex-col">
            <div
              ref={sideTableScrollHeaderRef}
              className={`sticky top-0 flex min-h-[30px] items-end justify-between px-[30px] pb-[18px] pt-[18px] ${styles.side_table_attendees_header}`}
              // className={`sticky top-0 flex min-h-[30px] items-end justify-between bg-[var(--color-bg-brand-f-deep)] px-[30px] pb-[12px] pt-[12px]`}
            >
              <h3 className="flex min-h-[30px] max-w-max items-center space-y-[1px] text-[14px] font-bold">
                <span>同席者を選択して追加</span>
                {/* <div className="min-h-[1px] w-auto bg-[#999]"></div> */}
              </h3>
              <div className="flex">
                <RippleButton
                  title={`追加`}
                  minHeight="30px"
                  minWidth="78px"
                  fontSize="13px"
                  textColor={`${selectedSearchAttendeesArray?.length > 0 ? `#fff` : `#666`}`}
                  bgColor={`${selectedSearchAttendeesArray?.length > 0 ? `var(--color-bg-brand50)` : `#33333390`}`}
                  bgColorHover={`${selectedSearchAttendeesArray?.length > 0 ? `var(--color-bg-brand)` : `#33333390`}`}
                  border={`${
                    selectedSearchAttendeesArray?.length > 0 ? `var(--color-bg-brand)` : `var(--color-bg-brandc0)`
                  }`}
                  borderRadius="6px"
                  classText={`select-none ${
                    selectedSearchAttendeesArray?.length > 0 ? `` : `hover:cursor-not-allowed`
                  }`}
                  clickEventHandler={() => {
                    // setIsOpenSettingInvitationModal(true);
                  }}
                />
              </div>
            </div>
            {/* 担当者一覧エリア */}
            <ul className={`flex h-auto w-full flex-col`}>
              {Array(12)
                .fill(null)
                .map((_, index) => (
                  <li
                    key={index}
                    className={`${styles.attendees_list} flex min-h-[44px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--color-bg-brand-f30)]`}
                    // onClick={() => {
                    // }}
                  >
                    <div
                      // data-text="ユーザー名"
                      className={`${styles.attendees_list_item_Icon} flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                      // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                      // onMouseLeave={handleCloseTooltip}
                    >
                      {/* <span className={`text-[20px]`}>
                          {getInitial(member.profile_name ? member.profile_name : "")}
                        </span> */}
                      <span className={`text-[20px]`}>伊</span>
                    </div>
                    <div
                      className={`${styles.attendees_list_item_lines_group} flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}
                    >
                      {/* 会社・部署 */}
                      <div className={`${styles.attendees_list_item_line} flex space-x-[4px] text-[13px]`}>
                        {/* <span>{member.profile_name ? member.profile_name : ""}</span> */}
                        <span>株式会社トラスティファイ</span>
                        <span>代表取締役</span>
                      </div>
                      {/* <div className={`text-[var(--color-text-sub)]`}>{member.email ? member.email : ""}</div> */}
                      {/* 役職・名前 */}
                      <div className={`${styles.attendees_list_item_line} flex space-x-[4px]`}>
                        <span>CEO</span>
                        <span className="!ml-[10px]">伊藤 謙太</span>
                      </div>
                      <div className={`${styles.attendees_list_item_line} flex space-x-[10px]`}>
                        <div className="flex space-x-[4px] text-[#ccc]">
                          {/* <span>住所：</span> */}
                          <span>東京都港区芝浦4-20-2 ローズスクエア12F</span>
                        </div>
                        <span>/</span>
                        {isDesktopGTE1600 && (
                          <>
                            <div className="flex space-x-[4px] text-[#ccc]">
                              <span>01-4567-8900</span>
                            </div>
                            <span>/</span>
                          </>
                        )}
                        <div className={`text-[#ccc]`}>cieletoile.1204@gmail.com</div>
                      </div>
                    </div>
                  </li>
                ))}
            </ul>

            {/* {Array(20)
                .fill(null)
                .map((_, index) => (
                  <div
                    key={index}
                    className={`${index % 2 === 1 ? `bg-red-100` : `bg-blue-100`} min-h-[60px] w-full`}
                  ></div>
                ))} */}
          </div>
        </div>
        {/* 担当者一覧エリア ここまで */}
      </div>
    </>
  );
};

export const SideTableSearchAttendees = memo(SideTableSearchAttendeesMemo);
