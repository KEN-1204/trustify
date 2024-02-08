import React, { Dispatch, FC, SetStateAction, memo, useEffect } from "react";
import styles from "../QuotationDetail.module.css";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import useDashboardStore from "@/store/useDashboardStore";
import { SlSizeActual, SlSizeFullscreen } from "react-icons/sl";
import useStore from "@/store";

const QuotationFunctionHeaderMemo: FC = () => {
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  const setUnderDisplayFullScreen = useDashboardStore((state) => state.setUnderDisplayFullScreen);
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const newSearchQuotation_Contact_CompanyParams = useDashboardStore(
    (state) => state.newSearchQuotation_Contact_CompanyParams
  );

  // 活動編集と「活動、面談、案件」の作成モーダル開閉state
  const setIsOpenUpdateQuotationModal = useDashboardStore((state) => state.setIsOpenUpdateQuotationModal);
  const setIsOpenInsertNewActivityModal = useDashboardStore((state) => state.setIsOpenInsertNewActivityModal);
  const setIsOpenInsertNewMeetingModal = useDashboardStore((state) => state.setIsOpenInsertNewMeetingModal);
  const setIsOpenInsertNewPropertyModal = useDashboardStore((state) => state.setIsOpenInsertNewPropertyModal);
  const setIsOpenInsertNewQuotationModal = useDashboardStore((state) => state.setIsOpenInsertNewQuotationModal);
  // 見積新規作成、編集モード
  const isInsertModeQuotation = useDashboardStore((state) => state.isInsertModeQuotation);
  const isUpdateModeQuotation = useDashboardStore((state) => state.isUpdateModeQuotation);
  const setIsInsertModeQuotation = useDashboardStore((state) => state.setIsInsertModeQuotation);
  const setIsUpdateModeQuotation = useDashboardStore((state) => state.setIsUpdateModeQuotation);
  // 見積書プレビューモーダル関連
  const setIsOpenQuotationPreviewModal = useDashboardStore((state) => state.setIsOpenQuotationPreviewModal);

  // 上画面の選択中の列データ会社
  const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);

  // モーダルを開く際に他画面の選択中のRowデータをリセットする => これをしないと「保存」が複数表示される(他画面で選択してる行の会社idと担当者idを渡すため)
  const setSelectedRowDataContact = useDashboardStore((state) => state.setSelectedRowDataContact);
  const setSelectedRowDataActivity = useDashboardStore((state) => state.setSelectedRowDataActivity);
  const setSelectedRowDataMeeting = useDashboardStore((state) => state.setSelectedRowDataMeeting);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  //   const setSelectedRowDataQuotation = useDashboardStore((state) => state.setSelectedRowDataQuotation);

  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
    textLength?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };

  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    content3,
    textLength,
    marginTop = 0,
    // itemsPosition = "start",
    itemsPosition = "center",
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    // const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text2 as string)
    //   : "";
    // const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text3 as string)
    //   : "";
    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      // content: (e.target as HTMLDivElement).dataset.text as string,
      content: content,
      content2: content2,
      content3: content3,
      display: display,
      // textLength: ((e.target as HTMLDivElement).dataset.text as string).length,
      textLength: textLength ? textLength.length : 0,
      marginTop: marginTop,
      itemsPosition: "center",
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

  return (
    <div className={`${styles.grid_function_header} h-[40px] w-full bg-[var(--color-bg-under-function-header)]`}>
      {/* 新規作成・編集モード用オーバーレイ */}
      {(isInsertModeQuotation || isUpdateModeQuotation) && (
        <div
          className={`absolute left-0 top-0 z-[1000] h-[62px] w-full bg-[#00000000]`}
          onClick={() => {
            if (isInsertModeQuotation) setIsInsertModeQuotation(false);
            if (isUpdateModeQuotation) setIsUpdateModeQuotation(false);
          }}
        ></div>
      )}
      <div className={`flex max-h-[26px] w-full items-center justify-start space-x-[6px]`}>
        <RippleButton
          title={`${searchMode ? `サーチ中止` : `新規サーチ`}`}
          // bgColor="var(--color-btn-brand-f-re)"

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
            searchMode && !newSearchQuotation_Contact_CompanyParams ? `cursor-not-allowed` : ``
          }`}
          clickEventHandler={() => {
            if (searchMode) return;
            if (!newSearchQuotation_Contact_CompanyParams) return alert("新規サーチから検索を行なってください。");
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
            classText={`select-none ${searchMode || !selectedRowDataQuotation ? `cursor-not-allowed` : ``}`}
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataQuotation) return alert("担当者を選択してください");
              console.log("活動作成 クリック");
              // 他画面の選択行データはリセット
              setSelectedRowDataContact(null);
              setSelectedRowDataActivity(null);
              setSelectedRowDataMeeting(null);
              setSelectedRowDataProperty(null);
              // setSelectedRowDataQuotation(null);
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsOpenInsertNewActivityModal(true);
            }}
          />
          <RippleButton
            title={`面談_作成`}
            classText={`select-none ${searchMode || !selectedRowDataQuotation ? `cursor-not-allowed` : ``}`}
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataQuotation) return alert("担当者を選択してください");
              console.log("面談作成 クリック");
              // 他画面の選択行データはリセット
              setSelectedRowDataContact(null);
              setSelectedRowDataActivity(null);
              setSelectedRowDataMeeting(null);
              setSelectedRowDataProperty(null);
              // setSelectedRowDataQuotation(null);
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsOpenInsertNewMeetingModal(true);
            }}
          />
          <RippleButton
            title={`案件_作成`}
            classText={`select-none ${searchMode || !selectedRowDataQuotation ? `cursor-not-allowed` : ``}`}
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataQuotation) return alert("担当者を選択してください");
              console.log("案件_作成 クリック");
              // 他画面の選択行データはリセット
              setSelectedRowDataContact(null);
              setSelectedRowDataActivity(null);
              setSelectedRowDataMeeting(null);
              setSelectedRowDataProperty(null);
              // setSelectedRowDataQuotation(null);
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsOpenInsertNewPropertyModal(true);
            }}
          />
          <RippleButton
            title={`見積_作成`}
            classText={`select-none ${searchMode || !selectedRowDataQuotation ? `cursor-not-allowed` : ``}`}
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataQuotation) return alert("担当者を選択してください");
              console.log("見積_作成 クリック");
              // 他画面の選択行データはリセット
              setSelectedRowDataContact(null);
              setSelectedRowDataActivity(null);
              setSelectedRowDataMeeting(null);
              setSelectedRowDataProperty(null);
              // setSelectedRowDataQuotation(null);
              if (loadingGlobalState) setLoadingGlobalState(false);
              // setIsOpenInsertNewQuotationModal(true);
              setIsInsertModeQuotation(true);
            }}
          />
          <RippleButton
            title={`見積_編集`}
            classText={`select-none ${searchMode || !selectedRowDataQuotation ? `cursor-not-allowed` : ``}`}
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataQuotation) return alert("見積データを選択してください");
              console.log("見積編集 クリック");
              // 他画面の選択行データはリセット
              setSelectedRowDataContact(null);
              setSelectedRowDataActivity(null);
              setSelectedRowDataMeeting(null);
              setSelectedRowDataProperty(null);
              // setSelectedRowDataQuotation(null);
              if (loadingGlobalState) setLoadingGlobalState(false);
              // setIsOpenUpdateQuotationModal(true);
              setIsUpdateModeQuotation(true);
            }}
          />
          {/* <RippleButton
            title={`印刷`}
            classText={`select-none ${searchMode || !selectedRowDataQuotation ? `cursor-not-allowed` : ``}`}
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataQuotation) return alert("見積データを選択してください");
            }}
          /> */}
          <RippleButton
            title={`見積書ﾌﾟﾚﾋﾞｭｰ・印刷`}
            classText={`select-none ${searchMode || !selectedRowDataQuotation ? `cursor-not-allowed` : ``}`}
            clickEventHandler={() => {
              if (hoveredItemPos) handleCloseTooltip();
              if (searchMode) return;
              if (!selectedRowDataQuotation) {
                alert("見積データを選択してください");
                return;
              }
              if (selectedRowDataQuotation.submission_class === "B internal") {
                alert("提出区分が社内用の見積書を印刷・PDF化はできません。");
                return;
              }
              setIsOpenQuotationPreviewModal(true);
            }}
            onMouseEnterHandler={(e) =>
              handleOpenTooltip({
                e: e,
                display: "top",
                content: `見積書をプレビュー画面で確認、`,
                content2: `PDFファイルのダウンロード、印刷、各種設定が可能です。`,
                // content3: ``,
                // marginTop: 48,
                marginTop: 28,
                // marginTop: 9,
              })
            }
            onMouseLeaveHandler={() => {
              if (hoveredItemPos) handleCloseTooltip();
            }}
          />
        </div>
      </div>

      <div className={`flex max-h-[26px] w-full  items-center justify-between space-x-[6px] `}>
        <div className="flex space-x-[6px]"></div>
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
        <div className="flex">
          <button
            // data-text={`${underDisplayFullScreen ? "デフォルト表示" : "全画面表示"}`}
            className={`flex-center transition-base03   !mr-[10px] h-[26px] min-w-[26px]  space-x-2 rounded-[4px] text-[16px]   ${
              tableContainerSize === "one_third"
                ? `cursor-not-allowed  text-[#b9b9b9]`
                : `text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} cursor-pointer`
            }`}
            onClick={() => {
              if (tableContainerSize === "one_third")
                return alert(
                  "「サイズ切り替え」でラージ、ミディアムのサイズを選択すると全画面表示に切り替え可能です。"
                );
              setUnderDisplayFullScreen(!underDisplayFullScreen);
            }}
            // onMouseEnter={(e) => handleOpenTooltip(e, "right")}
            // onMouseLeave={handleCloseTooltip}
            onMouseEnter={(e) =>
              handleOpenTooltip({
                e: e,
                display: "right-top",
                // display: "top",
                content: `${underDisplayFullScreen ? "デフォルト表示" : "全画面表示"}`,
                textLength: `${underDisplayFullScreen ? "デフォルト表示" : "全画面表示"}`,
              })
            }
            onMouseLeave={handleCloseTooltip}
          >
            {underDisplayFullScreen ? (
              <SlSizeActual className="pointer-events-none" />
            ) : (
              <SlSizeFullscreen className="pointer-events-none" />
            )}
          </button>
        </div>
        {/* <RippleButton
          title={`HP検索`}
          
          classText="select-none"
          clickEventHandler={() => console.log("ホバーモード クリック")}
        /> */}
      </div>
    </div>
  );
};

export const QuotationFunctionHeader = memo(QuotationFunctionHeaderMemo);

/*

*/
