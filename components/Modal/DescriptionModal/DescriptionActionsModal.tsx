import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import { memo } from "react";
import { BsChevronLeft } from "react-icons/bs";

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
            保存
          </div>
        </div>

        {/* <div className="min-h-[1px] w-full bg-[var(--color-border-base)]"></div> */}

        {/* メインコンテンツ コンテナ */}
        <div className={`modal_main_contents_container`} style={{ overflowY: `hidden` }}>
          <div role="grid" className={`relative grid h-full w-full overflow-y-auto`}>
            {/* gridヘッダー */}
            <div
              role="row"
              aria-rowindex={1}
              //   className={`sticky top-0 z-10 grid h-[30px] w-full bg-[#f7f9fb]`}
              className={`sticky top-0 z-10 grid h-[30px] w-full bg-[var(--color-modal-solid-bg)]`}
              style={{ borderBottom: `1px solid var(--color-border-table-deep)`, gridTemplateColumns: `10% 45% 45%` }}
            >
              {columnHeaderList.map((obj, index) => {
                return (
                  <div key={obj.key} role="columnheader" className={`text-[13px] font-semibold`}>
                    {obj.value[language]}
                  </div>
                );
              })}
            </div>

            {/* rowgroup */}
            {Array(5)
              .fill(null)
              .map((_, rowIndex) => {
                return (
                  <div
                    key={`row_${rowIndex}`}
                    role="row"
                    aria-rowindex={rowIndex + 1}
                    className={`grid min-h-[300px] w-full`}
                    style={{
                      borderBottom: `1px solid var(--color-border)`,
                      gridTemplateColumns: `10% 45% 45%`,
                    }}
                  >
                    {Array(3)
                      .fill(null)
                      .map((_, colIndex) => {
                        return (
                          <div
                            key={`row_${rowIndex}_col_${colIndex}`}
                            role="gridcell"
                            className={`justifu-start flex items-center text-[12px]`}
                          >{`row_${rowIndex}_col_${colIndex}`}</div>
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
