import React, { Dispatch, FC, SetStateAction, memo, useEffect } from "react";
import styles from "../CompanyDetail/CompanyDetail.module.css";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import useDashboardStore from "@/store/useDashboardStore";
import { SlSizeActual, SlSizeFullscreen } from "react-icons/sl";
import useStore from "@/store";

const CompanyFunctionHeaderMemo: FC = () => {
  const searchMode = useDashboardStore((state) => state.searchMode);
  const setSearchMode = useDashboardStore((state) => state.setSearchMode);
  const setEditSearchMode = useDashboardStore((state) => state.setEditSearchMode);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);
  const setUnderDisplayFullScreen = useDashboardStore((state) => state.setUnderDisplayFullScreen);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const setIsOpenInsertNewContactModal = useDashboardStore((state) => state.setIsOpenInsertNewContactModal);
  const setIsOpenInsertNewClientCompanyModal = useDashboardStore((state) => state.setIsOpenInsertNewClientCompanyModal);
  const setIsOpenUpdateClientCompanyModal = useDashboardStore((state) => state.setIsOpenUpdateClientCompanyModal);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // 新規サーチで使用した条件params
  const newSearchCompanyParams = useDashboardStore((state) => state.newSearchCompanyParams);

  // 上画面の選択中の列データ会社
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);

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
      <div className={`flex max-h-[26px] w-full items-center justify-start space-x-[6px]`}>
        <RippleButton
          title={`${searchMode ? `サーチ中止` : `新規サーチ`}`}
          // bgColor="var(--color-btn-brand-f-re)"
          classText={`select-none`}
          clickEventHandler={() => {
            // console.log("CompanyFunctionHeader 新規サーチ クリック");
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
          classText={`select-none ${searchMode || !newSearchCompanyParams ? `cursor-not-allowed` : ``}`}
          clickEventHandler={() => {
            if (searchMode) return;
            if (!newSearchCompanyParams) return alert("新規サーチから検索を行なってください。");
            // console.log("サーチ編集 クリック");
            // 編集モードとして開く
            if (loadingGlobalState) setLoadingGlobalState(false);
            setEditSearchMode(true);
            setSearchMode(true);
          }}
        />
        <div className="flex space-x-[6px] pl-10">
          <RippleButton
            title={`会社_作成`}
            classText="select-none"
            clickEventHandler={() => {
              if (searchMode) return;
              console.log("会社作成 クリック");
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsOpenInsertNewClientCompanyModal(true);
            }}
          />
          <RippleButton
            title={`会社_編集`}
            classText={`select-none ${searchMode || !selectedRowDataCompany ? `cursor-not-allowed` : ``}`}
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataCompany) return alert("会社を選択してください");
              if (
                (selectedRowDataCompany.created_by_company_id === null &&
                  selectedRowDataCompany.created_by_user_id !== userProfileState?.id) ||
                selectedRowDataCompany.created_by_company_id !== userProfileState?.company_id
              )
                return alert("自社で作成した会社のみ編集可能です");
              // console.log("会社編集 クリック");
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsOpenUpdateClientCompanyModal(true);
            }}
          />
          <RippleButton
            title={`担当者_作成`}
            classText={`select-none ${searchMode ? `cursor-not-allowed` : ``}`}
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataCompany) return alert("会社を選択してください");
              // console.log("担当者作成 クリック");
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsOpenInsertNewContactModal(true);
            }}
          />
        </div>
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
            if (tableContainerSize === "one_third") return;
            setUnderDisplayFullScreen(!underDisplayFullScreen);
          }}
          // onMouseEnter={(e) => handleOpenTooltip(e, "right")}
          onMouseEnter={(e) => handleOpenTooltip(e, "right-top")}
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
          classText="select-none"
          clickEventHandler={() => console.log("ホバーモード クリック")}
        /> */}
      </div>
    </div>
  );
};

export const CompanyFunctionHeader = memo(CompanyFunctionHeaderMemo);

/*

*/
