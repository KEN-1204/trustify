import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import { Fragment, memo } from "react";
import { BsChevronLeft } from "react-icons/bs";
import { RxDot } from "react-icons/rx";

const DescriptionActionsModalMemo = () => {
  const language = useStore((state) => state.language);
  const setIsOpenModalSDB = useDashboardStore((state) => state.setIsOpenModalSDB);

  // 戻る・オーバーレイクリック
  const handleCancel = () => {
    setIsOpenModalSDB(null);
  };

  const columnHeaderList: { key: string; value: { [key: string]: string } }[] = [
    { key: "action_item", value: { ja: `アクション項目`, en: `Action Item` } },
    { key: "filter_condition", value: { ja: `フィルター条件`, en: `Filter Condition` } },
    { key: "aim", value: { ja: `狙い・意味合い`, en: `Reason` } },
  ];

  const rowHeaderList: { key: string; value: { [key: string]: string } }[] = [
    { key: "call_pr", value: { ja: `TEL PR`, en: `Call PR` } },
    { key: "call_all", value: { ja: `TEL All`, en: `Call All` } },
    { key: "meeting_new", value: { ja: `新規面談`, en: `New Meeting` } },
    { key: "meeting_all", value: { ja: `面談All`, en: `All Meeting` } },
    { key: "expansion_all", value: { ja: `展開数`, en: `Deal Development` } },
    { key: "expansion_rate", value: { ja: `展開率`, en: `Deal Development Rate` } },
    { key: "f_expansion", value: { ja: `展開F`, en: `Deal F Development` } },
    { key: "f_expansion_rate", value: { ja: `展開F率`, en: `Deal F Development Rate` } },
    { key: "award", value: { ja: `A数`, en: `Award` } },
    { key: "half_year_f_expansion_award", value: { ja: `F獲得数（半期）`, en: `Half Year Deal F Award` } },
    { key: "half_year_f_expansion_award_rate", value: { ja: `F獲得率（半期）`, en: `Half Year Deal F Award Rate` } },
  ];

  console.log("DescriptionActionsModalレンダリング");

  return (
    <>
      {/* モーダルオーバーレイ */}
      <div className={`modal_overlay`} onClick={handleCancel} />

      {/* モーダルコンテナ */}
      <div className={`modal_container fade03`}>
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
          <div className="relative min-w-[150px] text-start font-semibold">
            <div
              className="flex max-w-max cursor-pointer select-none items-center hover:text-[#aaa]"
              onClick={handleCancel}
            >
              <div className="h-full min-w-[20px]"></div>
              <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" />
              <span>戻る</span>
            </div>
          </div>
          <div className="min-w-[150px] select-none font-bold">営業プロセス アクション項目概要</div>

          <div
            className={`min-w-[150px] cursor-pointer select-none text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)]`}
            //   onClick={handleSaveAndCloseFromProperty}
          >
            {/* 保存 */}
          </div>
        </div>

        {/* <div className="min-h-[1px] w-full bg-[var(--color-border-base)]"></div> */}

        {/* メインコンテンツ コンテナ */}
        <div className={`modal_main_contents_container mt-[15px]`} style={{ overflowY: `hidden` }}>
          <div role="grid" className={`relative grid h-full w-full overflow-y-auto`}>
            {/* gridヘッダー */}
            <div
              role="row"
              aria-rowindex={1}
              //   className={`sticky top-0 z-10 grid h-[30px] w-full bg-[#f7f9fb]`}
              className={`sticky top-0 z-10 grid h-[30px] w-full bg-[var(--color-modal-solid-bg)]`}
              style={{ borderBottom: `1px solid var(--color-border-light)`, gridTemplateColumns: `12% 44% 44%` }}
            >
              {columnHeaderList.map((obj, index) => {
                return (
                  <div
                    key={obj.key}
                    role="columnheader"
                    className={`flex items-center text-[13px] font-semibold text-[var(--color-text-sub)]`}
                  >
                    {obj.value[language]}
                  </div>
                );
              })}
            </div>

            {/* rowgroup */}
            {rowHeaderList.map((rowObj, rowIndex) => {
              return (
                <div
                  key={`row_${rowObj.key}`}
                  role="row"
                  aria-rowindex={rowIndex + 1}
                  className={`grid h-max min-h-[100px] w-full`}
                  style={{
                    // borderBottom: `1px solid var(--color-border)`,
                    borderBottom: `1px solid var(--color-border-chart)`,
                    gridTemplateColumns: `12% 44% 44%`,
                  }}
                >
                  {columnHeaderList.map((colObj, colIndex) => {
                    return (
                      <Fragment key={`row_${rowObj.key}_col_${colObj.key}`}>
                        {colIndex === 0 && (
                          <div role="gridcell" className={`flex items-center justify-start text-[13px] font-bold`}>
                            <div className="flex items-center">
                              <RxDot className={`mr-[3px] min-h-[18px] min-w-[18px] text-[var(--color-bg-brand-f)]`} />
                              <span>{rowObj.value[language]}</span>
                            </div>
                          </div>
                        )}
                        {colIndex !== 0 && (
                          <div
                            role="gridcell"
                            className={`flex items-center justify-start py-[15px] pr-[20px] text-[12px]`}
                          >
                            {colObj.key === "filter_condition" && (
                              <>
                                {rowObj.key === "call_pr" && (
                                  <div className={`flex flex-col`}>
                                    <p>【TELPR件数】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する活動データの件数（活動画面で作成する活動データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▽</span>活動タイプ
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      「TEL発信（能動）」「TEL発信（受動）」「TEL発信（展示会）」「TEL発信（案件介入）」
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "call_all" && (
                                  <div className={`flex flex-col`}>
                                    <p>【総電話件数件数】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する活動データの件数（活動画面で作成する活動データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▽</span>活動タイプ
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      「TEL発信（不在）」「TEL発信（能動）」「TEL発信（受動）」「TEL発信（展示会）」「TEL発信（案件介入）」「TEL発信（売前ﾌｫﾛｰ）」「TEL発信（売後ﾌｫﾛｰ）」「TEL発信（ｱﾎﾟ組み）」「TEL発信（その他）」
                                    </p>
                                  </div>
                                )}
                                {rowObj.key === "meeting_new" && (
                                  <div className={`flex flex-col`}>
                                    <p>【新規面談件数】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する面談データの件数（面談画面で作成する面談データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▽</span>面談目的
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      「TEL発信（不在）」「TEL発信（能動）」「TEL発信（受動）」「TEL発信（展示会）」「TEL発信（案件介入）」「TEL発信（売前ﾌｫﾛｰ）」「TEL発信（売後ﾌｫﾛｰ）」「TEL発信（ｱﾎﾟ組み）」「TEL発信（その他）」
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                            {colObj.key === "aim" && (
                              <>
                                {rowObj.key === "call_pr" && (
                                  <div className={`flex flex-col`}>
                                    <p>【TELPR件数】</p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      下記条件に該当する活動データの件数（活動画面で作成する活動データ）
                                    </p>
                                    <p className={`mt-[12px]`}>
                                      <span className={`text-[var(--main-color-f)]`}>▽</span>活動タイプ
                                    </p>
                                    <p className={`mt-[6px] whitespace-pre-wrap`}>
                                      「TEL発信（能動）」「TEL発信（受動）」「TEL発信（展示会）」「TEL発信（案件介入）」
                                    </p>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export const DescriptionActionsModal = memo(DescriptionActionsModalMemo);
