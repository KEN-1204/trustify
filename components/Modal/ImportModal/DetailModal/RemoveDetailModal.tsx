import useStore from "@/store";
import { CSSProperties, Dispatch, SetStateAction, memo, useMemo } from "react";
import { BsSuitDiamondFill } from "react-icons/bs";
import { MdClose } from "react-icons/md";

type Props = {
  setIsOpenRemoveDetailModal: Dispatch<SetStateAction<boolean>>;
};

const RemoveDetailModalMemo = ({ setIsOpenRemoveDetailModal }: Props) => {
  const isDebugMode = process.env.NEXT_PUBLIC_DEBUG_MODE === "true";
  const language = useStore((state) => state.language);

  const columnHeaderList: { key: string; value: { [key: string]: string } }[] = [
    { key: "removed_csv_header", value: { ja: `CSVカラムヘッダー名`, en: `CSV Column Header Name` } },
    { key: "reason_for_removal", value: { ja: `削除理由`, en: `Reason for Removal` } },
    { key: "removed_rows_list", value: { ja: `削除された行番号`, en: `Removed Line Number` } },
  ];

  const rowListTest = {
    住所: {
      住所未入力: [1, 3, 6, 9],
      無効な都道府県: [100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900],
      無効な市区町村: [
        100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300,
        600, 900, 100, 300, 600,
      ],
      // 無効な市区町村: [
      //   100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300,
      //   600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900,
      //   100, 300, 600, 900, 100, 300, 600, 900,
      // ],
      無効な住所: [
        100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300,
        600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900,
        100, 300, 600, 900, 100, 300, 600, 900, 100, 300, 600, 900, 100,
      ],
    },
    会社名: { 無効な会社名: [2, 4, 7, 8] },
    電話Loremipsumdolorsitametconsecteturadipisicingdeserunt: { 電話未入力: [11, 33, 66, 99] },
  };

  const formattedRowListTest:
    | { csvHeader: string; reasons: { reason: string; lineNumbersArray: string[] }[] }[]
    | null = useMemo(() => {
    if (!rowListTest) return null;
    return Object.entries(rowListTest).map(([csvHeader, reasonObj]) => {
      return {
        csvHeader: csvHeader,
        reasons: Object.entries(reasonObj).map(([reason, rowsArray]) => ({
          reason: reason,
          lineNumbersArray: rowsArray.map((row) => (!isNaN(row) ? `${row}行目` : `-行目`)),
        })),
      };
    });
  }, [rowListTest]);

  // ================== 🌟ツールチップ ==================
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({ e, display = "top", content, content2, marginTop, itemsPosition }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2DataSet = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosWrap({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content ?? ((e.target as HTMLDivElement).dataset.text as string),
      content2: content2 ?? content2DataSet,
      content3: content3,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPosWrap) setHoveredItemPosWrap(null);
  };
  // ================== ✅ツールチップ ==================

  if (isDebugMode) console.log("RemoveDetailModalレンダリング", `formattedRowListTest: `, formattedRowListTest);

  return (
    <>
      {/* 除外詳細モーダルオーバーレイ z-index: 1500; */}
      <div className={`fixed inset-0 z-[1500]`} onClick={() => setIsOpenRemoveDetailModal(false)} />
      {/* 除外詳細モーダル z-index: 2000; */}
      <div className={`modal_container p1 fade03 text-[var(--color-text-title)]`} style={{ zIndex: 2000 }}>
        <button
          type="button"
          className={`flex-center absolute right-[24px] top-[22px] z-[100] h-[32px] w-[32px] cursor-pointer rounded-full text-[24px] hover:text-[#999]`}
          onClick={() => setIsOpenRemoveDetailModal(false)}
        >
          <MdClose className="pointer-events-none" />
        </button>

        {/* 保存・タイトル・キャンセルエリア */}
        <div className={`fade08_forward flex h-auto w-full flex-col rounded-t-[9px] p-[24px] pb-[12px]`}>
          <div className={`flex h-auto w-full min-w-max items-center`}>
            <div className={`mr-[20px] min-h-[36px] min-w-max text-[21px] font-bold`}>
              <span>インポート前変換処理 結果詳細（削除理由）</span>
            </div>
          </div>
        </div>

        {/* メインコンテンツ コンテナ */}
        <div className={`modal_main_contents_container`} style={{ overflowY: `hidden`, padding: `0 1px 10px` }}>
          <div className={`mb-[6px] flex h-[30px] w-full items-center px-[24px] text-[15px] font-bold`}>
            <div className={`flex-start flex w-[180px] items-center space-x-[6px]`}>
              <span className={``}>インポート準備完了</span>
              <span>：</span>
            </div>
            <div className={`space-x-[6px]`}>
              <span className={`text-[var(--color-text-brand-f)]`}>{(99997).toLocaleString()}行</span>
              <span>/</span>
              <span>{(1000000).toLocaleString()}行</span>
            </div>
          </div>
          <div className={`mb-[15px] flex h-[30px] w-full items-center px-[24px] text-[15px] font-bold`}>
            <div className={`flex-start flex w-[180px] items-center space-x-[6px]`}>
              <span>削除された行数</span>
              <span>：</span>
            </div>
            <div className={`space-x-[6px]`}>
              <span className={`text-[var(--main-color-tk)]`}>{(3).toLocaleString()}行</span>
            </div>
          </div>
          {/* 最下部のshadow */}
          <div
            className={`absolute bottom-[10px] left-[40px] z-[100] min-h-[30px] w-[calc(100%-80px)] rounded-b-[0px]`}
            style={{ background: `linear-gradient(to top, var(--color-modal-solid-bg), transparent)` }}
          />
          {/* 最下部のshadow ここまで */}
          <div
            role="grid"
            className={`modal_main_contents_scroll_container relative grid`}
            style={{ padding: `0 24px 30px` }}
          >
            {/* gridヘッダー */}
            <div
              role="row"
              aria-rowindex={1}
              className={`sticky top-0 z-10 grid h-[30px] w-full bg-[var(--color-modal-solid-bg)]`}
              // style={{ borderBottom: `1px solid var(--color-border-light)`, gridTemplateColumns: `12% 44% 44%` }}
              style={{ borderBottom: `1px solid var(--color-border-light)`, gridTemplateColumns: `24% 24% 52%` }}
            >
              {columnHeaderList.map((obj, index) => {
                return (
                  <div
                    key={`${obj.key}`}
                    role="columnheader"
                    className={`flex items-center text-[13px] font-semibold text-[var(--color-text-sub)]`}
                  >
                    {obj.value[language]}
                  </div>
                );
              })}
            </div>

            {/* rowgroup */}
            {formattedRowListTest &&
              formattedRowListTest.map((csvHeaders, rowIndex) => {
                const csvHeaderName = csvHeaders.csvHeader;
                const reasonsList = csvHeaders.reasons;
                return (
                  <div
                    key={`row_${csvHeaders.csvHeader}`}
                    role="row"
                    aria-rowindex={rowIndex + 1}
                    className={`grid h-max min-h-[100px] w-full`}
                    style={{
                      borderBottom: `1px solid var(--color-border-chart)`,
                      // gridTemplateColumns: `12% 44% 44%`,
                      // gridTemplateColumns: `24% 24% 52%`,
                      gridTemplateColumns: `24% 76%`,
                    }}
                  >
                    <div role="gridcell" className={`flex items-center justify-start text-[13px] font-bold`}>
                      <div className="flex items-center overflow-x-hidden">
                        <BsSuitDiamondFill
                          className={`mr-[5px] min-h-[14px] min-w-[14px] text-[var(--color-bg-brand-f)]`}
                        />
                        <span
                          className={`truncate`}
                          onMouseEnter={(e) => {
                            if (!csvHeaderName) return;
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth)
                              handleOpenTooltip({
                                e: e,
                                content: csvHeaderName,
                              });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {csvHeaderName}
                        </span>
                      </div>
                    </div>

                    <div className={`flex flex-col`}>
                      {reasonsList.map((reasons, colIndex) => {
                        const reasonName = reasons.reason;
                        const lineNumbersArray = reasons.lineNumbersArray;
                        return (
                          <div
                            key={`col23_row_${reasonName}`}
                            role="row"
                            aria-rowindex={rowIndex + 1}
                            className={`grid h-max min-h-[100px] w-full`}
                            style={{
                              ...(colIndex !== reasonsList.length - 1 && {
                                borderBottom: `1px solid var(--color-border-chart)`,
                              }),
                              gridTemplateColumns: `31.5% 68.5%`,
                            }}
                          >
                            <div
                              role="gridcell"
                              className={`flex items-center justify-start py-[15px] pr-[20px] text-[12px]`}
                            >
                              <div className="flex items-center overflow-x-hidden">
                                <BsSuitDiamondFill
                                  className={`mr-[5px] min-h-[14px] min-w-[14px] text-[var(--color-bg-brand-f)]`}
                                />
                                <span className={`truncate`}>{reasonName}</span>
                              </div>
                            </div>
                            <div
                              role="gridcell"
                              // className={`flex max-h-[150px] items-center justify-start whitespace-pre-wrap py-[15px] pr-[20px] text-[12px] leading-[2]`}
                              // className={`max-h-[160px] line_clamp line_5 whitespace-pre-wrap py-[15px] pr-[20px] text-[12px] leading-[2.2]`}
                              className={`relative h-full w-full`}
                            >
                              <div
                                className={`max-h-[161px] overflow-y-auto whitespace-pre-wrap py-[15px] pr-[20px] text-[12px] leading-[2.2]`}
                              >
                                <p>{lineNumbersArray.join(", ")}</p>
                              </div>
                              {/* エリア下部のshadow */}
                              <div
                                className={`absolute bottom-[0px] left-[0px] z-[100] min-h-[15px] w-[100%] rounded-b-[0px]`}
                                style={{
                                  background: `linear-gradient(to top, var(--color-modal-solid-bg), transparent)`,
                                }}
                              />
                              {/* エリア下部のshadow ここまで */}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </>
  );
};

export const RemoveDetailModal = memo(RemoveDetailModalMemo);
