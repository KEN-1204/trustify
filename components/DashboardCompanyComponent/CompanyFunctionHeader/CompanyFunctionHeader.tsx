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
  const hoveredItemPos = useStore((state) => state.hoveredItemPos);
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const setIsOpenInsertNewContactModal = useDashboardStore((state) => state.setIsOpenInsertNewContactModal);
  const setIsOpenInsertNewClientCompanyModal = useDashboardStore((state) => state.setIsOpenInsertNewClientCompanyModal);
  const setIsDuplicateCompany = useDashboardStore((state) => state.setIsDuplicateCompany);
  const setIsOpenUpdateClientCompanyModal = useDashboardStore((state) => state.setIsOpenUpdateClientCompanyModal);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // 新規サーチで使用した条件params
  const newSearchCompanyParams = useDashboardStore((state) => state.newSearchCompanyParams);

  // 上画面の選択中の列データ会社
  const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);

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
            if (hoveredItemPos) handleCloseTooltip();
          }}
          onMouseEnterHandler={(e) =>
            handleOpenTooltip({
              e: e,
              display: "top",
              content: `現在の好調業界や決算が近い会社で税制優遇や余り予算を狙える会社、`,
              content2: `直近売れ先の仕入れ先や、売れ先と同じ取引先を持つ同業他社で導入実績が響く会社など`,
              content3: `会社名、住所、規模、業種、決算月、取引先など複数の項目を組み合わせて売れる会社の検索が可能です。`,
              marginTop: 48,
              // marginTop: 28,
              // marginTop: 9,
            })
          }
          onMouseLeaveHandler={() => {
            if (hoveredItemPos) handleCloseTooltip();
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
              if (hoveredItemPos) handleCloseTooltip();
            }}
            onMouseEnterHandler={(e) =>
              handleOpenTooltip({
                e: e,
                display: "top",
                content: `新たに自社専用会社として`,
                content2: `会社・部署の作成を行います`,
                // marginTop: 48,
                marginTop: 28,
                // marginTop: 9,
              })
            }
            onMouseLeaveHandler={() => {
              if (hoveredItemPos) handleCloseTooltip();
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
            title={`会社_複製`}
            classText={`select-none ${searchMode || !selectedRowDataCompany ? `cursor-not-allowed` : ``}`}
            clickEventHandler={() => {
              if (searchMode) return;
              if (!selectedRowDataCompany) return alert("会社を選択してください");
              // if (
              //   (selectedRowDataCompany.created_by_company_id === null &&
              //     selectedRowDataCompany.created_by_user_id !== userProfileState?.id) ||
              //   selectedRowDataCompany.created_by_company_id !== userProfileState?.company_id
              // )
              //   return alert("自社で作成した会社のみ編集可能です");
              // console.log("会社編集 クリック");
              if (loadingGlobalState) setLoadingGlobalState(false);
              setIsDuplicateCompany(true);
              setIsOpenInsertNewClientCompanyModal(true);
              if (hoveredItemPos) handleCloseTooltip();
            }}
            // dataText={`既存の会社を複製して、部署や予算申請月など編集可能な自社専用会社として新たに作成します。`}
            onMouseEnterHandler={(e) =>
              handleOpenTooltip({
                e: e,
                display: "top",
                content: `既存の会社を複製して、部署や予算申請月など`,
                content2: `編集可能な自社専用会社として新たに作成します`,
                marginTop: 28,
                // marginTop: 9,
              })
            }
            onMouseLeaveHandler={() => {
              if (hoveredItemPos) handleCloseTooltip();
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
              if (hoveredItemPos) handleCloseTooltip();
            }}
            onMouseEnterHandler={(e) =>
              handleOpenTooltip({
                e: e,
                display: "top",
                content: `選択した会社・部署に紐づく担当者を作成します`,
                // marginTop: 48,
                // marginTop: 28,
                marginTop: 9,
              })
            }
            onMouseLeaveHandler={() => {
              if (hoveredItemPos) handleCloseTooltip();
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
        {/* <RippleButton
          title={`インポート`}
          classText="select-none mr-[12px]"
          clickEventHandler={() => {
            if (searchMode) return;
            console.log("会社インポート クリック");
            if (loadingGlobalState) setLoadingGlobalState(false);
            // setIsOpenInsertNewClientCompanyModal(true);
            // if (hoveredItemPos) handleCloseTooltip();
          }}
          onMouseEnterHandler={(e) =>
            handleOpenTooltip({
              e: e,
              display: "top",
              content: `CSVデータから会社データをインポートする`,
              // content2: `会社・部署の作成を行います`,
              // marginTop: 48,
              // marginTop: 28,
              marginTop: 9,
            })
          }
          onMouseLeaveHandler={() => {
            if (hoveredItemPos) handleCloseTooltip();
          }}
        /> */}

        <button
          className={`flex-center transition-base03   !mr-[10px] h-[26px] min-w-[26px]  space-x-2 rounded-[4px] text-[16px]   ${
            tableContainerSize === "one_third"
              ? `cursor-not-allowed  text-[#b9b9b9]`
              : `text-[var(--color-bg-brand-f)] ${styles.fh_text_btn} cursor-pointer`
          }`}
          onClick={() => {
            if (tableContainerSize === "one_third")
              return alert("「サイズ切り替え」でラージ、ミディアムのサイズを選択すると全画面表示に切り替え可能です。");
            setUnderDisplayFullScreen(!underDisplayFullScreen);
          }}
          // data-text={`${underDisplayFullScreen ? "デフォルト表示" : "全画面表示"}`}
          // onMouseEnter={(e) => handleOpenTooltip(e, "right")}
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
