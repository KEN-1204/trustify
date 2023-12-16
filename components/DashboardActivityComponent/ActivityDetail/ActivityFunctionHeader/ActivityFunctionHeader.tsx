import React, { Dispatch, FC, SetStateAction, memo, useEffect } from "react";
import styles from "../ActivityDetail.module.css";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import useDashboardStore from "@/store/useDashboardStore";
import { SlSizeActual, SlSizeFullscreen } from "react-icons/sl";
import useStore from "@/store";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

const ActivityFunctionHeaderMemo: FC = () => {
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  const setUnderDisplayFullScreen = useDashboardStore((state) => state.setUnderDisplayFullScreen);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const newSearchActivity_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchActivity_Contact_CompanyParams
  );
  //   const setIsOpenInsertNewActivityModal = useDashboardStore((state) => state.setIsOpenInsertNewActivityModal);
  const setIsOpenUpdateActivityModal = useDashboardStore((state) => state.setIsOpenUpdateActivityModal);
  const setIsOpenInsertNewActivityModal = useDashboardStore((state) => state.setIsOpenInsertNewActivityModal);
  const setIsOpenInsertNewMeetingModal = useDashboardStore((state) => state.setIsOpenInsertNewMeetingModal);
  const setIsOpenInsertNewPropertyModal = useDashboardStore((state) => state.setIsOpenInsertNewPropertyModal);

  // 上画面の選択中の列データ会社
  //   const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const setSelectedRowDataContact = useDashboardStore((state) => state.setSelectedRowDataContact);
  const setSelectedRowDataMeeting = useDashboardStore((state) => state.setSelectedRowDataMeeting);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);

  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: (e.target as HTMLDivElement).dataset.text as string,
      content2: content2,
      content3: content3,
      display: display,
      textLength: ((e.target as HTMLDivElement).dataset.text as string).length,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPos(null);
  };

  // 上画面が1/3で、下画面がフルスクリーンになっているなら、下画面をフルからデフォルトに変更
  useEffect(() => {
    if (tableContainerSize === "one_third" && underDisplayFullScreen) {
      setUnderDisplayFullScreen(false);
    }
  }, [tableContainerSize]);

  // テスト
  const supabase = useSupabaseClient();
  const insertData = async () => {
    try {
      const { data, error } = await supabase.from("interview_schedule").insert([
        { planned_start_time: "08:30" }, // ここが問題の箇所かもしれません
      ]);

      if (error) {
        throw error;
      }

      console.log("Insert succeeded!", data);
    } catch (error: any) {
      alert(error.message);
      console.error("Insert failed:", error.message);
    }
  };
  // テスト

  return (
    <div className={`${styles.grid_function_header} h-[40px] w-full bg-[var(--color-bg-under-function-header)]`}>
      <div className={`flex max-h-[26px] w-full items-center justify-start space-x-[6px]`}>
        <RippleButton
          title={`${searchMode ? `サーチ中止` : `新規サーチ`}`}
          // bgColor="var(--color-btn-brand-f-re)"
          // border="var(--color-btn-brand-f-re-hover)"
          borderRadius="2px"
          classText={`select-none`}
          clickEventHandler={() => {
            console.log("新規サーチ クリック");
            if (searchMode) {
              // SELECTメソッド
              setSearchMode(false);
              if (loadingGlobalState) setLoadingGlobalState(false);
              // 編集モード中止
              setEditSearchMode(false);
            } else {
              // 新規サーチクリック
              if (loadingGlobalState) setLoadingGlobalState(false);
              setSearchMode(true);
            }
          }}
        />
        <RippleButton
          title={`${searchMode ? `サーチ編集` : `サーチ編集`}`}
          classText={`select-none ${
            searchMode || !newSearchActivity_Contact_CompanyParams ? `cursor-not-allowed` : ``
          }`}
          borderRadius="2px"
          clickEventHandler={() => {
            if (searchMode) return;
            if (!newSearchActivity_Contact_CompanyParams) return alert("新規サーチから検索を行なってください。");
            console.log("サーチ編集 クリック");
            // 編集モードとして開く
            if (loadingGlobalState) setLoadingGlobalState(false);
            setEditSearchMode(true);
            setSearchMode(true);
          }}
        />
        <div className="flex space-x-[6px] pl-10">
          <RippleButton
            title={`活動_作成`}
            classText={`select-none ${searchMode || !selectedRowDataActivity ? `cursor-not-allowed` : ``}`}
            borderRadius="2px"
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataActivity) return alert("担当者を選択してください");
              console.log("活動作成 クリック");
              // 担当者ページの選択列をリセット
              setSelectedRowDataContact(null);
              // setSelectedRowDataActivity(null);
              setSelectedRowDataMeeting(null);
              setSelectedRowDataProperty(null);
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsOpenInsertNewActivityModal(true);
            }}
          />
          <RippleButton
            title={`活動_編集`}
            classText={`select-none ${searchMode || !selectedRowDataActivity ? `cursor-not-allowed` : ``}`}
            borderRadius="2px"
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataActivity) return alert("活動を選択してください");
              console.log("活動編集 クリック");
              setSelectedRowDataContact(null);
              // setSelectedRowDataActivity(null);
              setSelectedRowDataMeeting(null);
              setSelectedRowDataProperty(null);
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsOpenUpdateActivityModal(true);
            }}
          />
          <RippleButton
            title={`面談_作成`}
            classText={`select-none ${searchMode || !selectedRowDataActivity ? `cursor-not-allowed` : ``}`}
            borderRadius="2px"
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataActivity) return alert("担当者を選択してください");
              console.log("面談作成 クリック");
              setSelectedRowDataContact(null);
              // setSelectedRowDataActivity(null);
              setSelectedRowDataMeeting(null);
              setSelectedRowDataProperty(null);
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsOpenInsertNewMeetingModal(true);
            }}
          />
          <RippleButton
            title={`案件_作成`}
            classText={`select-none ${searchMode || !selectedRowDataActivity ? `cursor-not-allowed` : ``}`}
            borderRadius="2px"
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataActivity) return alert("担当者を選択してください");
              console.log("案件_作成 クリック");
              setSelectedRowDataContact(null);
              // setSelectedRowDataActivity(null);
              setSelectedRowDataMeeting(null);
              setSelectedRowDataProperty(null);
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsOpenInsertNewPropertyModal(true);
            }}
          />
        </div>
        {/* <RippleButton
          title={`テスト`}
          classText={`select-none ${searchMode || !selectedRowDataActivity ? `cursor-not-allowed` : ``}`}
          borderRadius="2px"
          clickEventHandler={() => {
            if (searchMode) return;
            insertData();
            // if (!selectedRowDataActivity) return alert("担当者を選択してください");
            // console.log("面談作成 クリック");
            // setLoadingGlobalState(false);
            // setIsOpenInsertNewMeetingModal(true);
          }}
        /> */}
      </div>

      <div className={`flex max-h-[26px] w-full  items-center justify-end space-x-[6px]`}>
        {/* <button
          className={`flex-center transition-base03 mr-[10px]  h-[26px] w-[70px]  cursor-pointer space-x-2 rounded-[4px]  text-[12px] text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} `}
        >
          <span>HP検索</span>
        </button> */}
        {/* <button
          className={`flex-center transition-base03 h-[26px]  min-w-[70px] cursor-pointer  space-x-2 rounded-[4px] text-[12px]  text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} `}
        >
          <span>MAP</span>
        </button> */}
        <button
          data-text={`${underDisplayFullScreen ? "デフォルト表示" : "全画面表示"}`}
          className={`flex-center transition-base03   !mr-[10px] h-[26px] min-w-[26px]  space-x-2 rounded-[4px] text-[16px]   ${
            tableContainerSize === "one_third"
              ? `cursor-not-allowed  text-[#b9b9b9]`
              : `text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} cursor-pointer`
          }`}
          onClick={() => {
            setUnderDisplayFullScreen(!underDisplayFullScreen);
          }}
          onMouseEnter={(e) => handleOpenTooltip(e, "right")}
          onMouseLeave={handleCloseTooltip}
        >
          {underDisplayFullScreen ? (
            <SlSizeActual className="pointer-events-none" />
          ) : (
            <SlSizeFullscreen className="pointer-events-none" />
          )}
        </button>
        {/* <RippleButton
          title={`HP検索`}
          borderRadius="2px"
          classText="select-none"
          clickEventHandler={() => console.log("ホバーモード クリック")}
        /> */}
      </div>
    </div>
  );
};

export const ActivityFunctionHeader = memo(ActivityFunctionHeaderMemo);

/*

*/
