import { MdClose } from "react-icons/md";
import styles from "./ConfirmationMappingModal.module.css";
import { ChangeEvent, Dispatch, SetStateAction, useRef } from "react";
import { BsCheck2, BsFiletypeCsv } from "react-icons/bs";
import { HiChevronDown, HiMinus } from "react-icons/hi";
import { SpinnerBrand } from "@/components/Parts/SpinnerBrand/SpinnerBrand";
import { IoIosArrowRoundForward } from "react-icons/io";

type TooltipParams = {
  e: React.MouseEvent<HTMLElement, MouseEvent>;
  display?: "top" | "right" | "bottom" | "left" | "";
  content: string;
  content2?: string | undefined | null;
  marginTop?: number;
  itemsPosition?: string;
};

type Props = {
  clickEventClose: () => void;
  isLoadingState?: boolean;
  titleText?: string;
  titleText2?: string;
  sectionP1?: string;
  sectionP2?: string;
  marginTopP1?: string;
  cancelText: string;
  submitText: string;
  clickEventSubmit: () => void;
  buttonColor?: "brand" | "red" | "green";
  zIndexOverlay?: string;
  zIndexModal?: string;
  withAnnotation?: boolean;
  annotationText?: string;
  withSelect?: boolean;
  onChangeEventSelect?: (e: ChangeEvent<HTMLSelectElement>) => void;
  optionsSelect?: { [K in "value" | "displayValue"]: any }[];
  selectState?: any;
  background?: string;
  isOverlayBgBlack?: boolean;
  // wrap
  handleOpenTooltip: ({ e, display, content, content2, marginTop, itemsPosition }: TooltipParams) => void;
  handleCloseTooltip: () => void;
  // CSVデータ関連
  uploadedColumnFields: string[];
  selectedColumnFieldsArray: string[];
  alreadySelectColumnsSetObj: Set<string>;
  skipCount: number;
  formattedUploadedRowCount: string;
  getInsertColumnNames: (column: string) => string;
  detailsTransform: {
    capital: "default" | "million";
  };
  setDetailsTransform: Dispatch<
    SetStateAction<{
      capital: "default" | "million";
    }>
  >;
};

export const ConfirmationMappingModal = ({
  clickEventClose,
  isLoadingState,
  titleText,
  titleText2,
  sectionP1,
  sectionP2,
  marginTopP1 = "20px",
  cancelText = "戻る",
  submitText = "削除する",
  clickEventSubmit,
  buttonColor = "red",
  zIndexOverlay,
  zIndexModal,
  withAnnotation = false,
  annotationText = `この操作は少し時間がかかります。画面を閉じずにお待ちください。`,
  withSelect = false,
  onChangeEventSelect,
  optionsSelect,
  selectState,
  background = `var(--color-bg-notification-modal)`,
  isOverlayBgBlack = true,
  handleOpenTooltip,
  handleCloseTooltip,
  uploadedColumnFields,
  selectedColumnFieldsArray,
  alreadySelectColumnsSetObj,
  skipCount,
  formattedUploadedRowCount,
  getInsertColumnNames,
  detailsTransform,
  setDetailsTransform,
}: Props) => {
  const modalRef = useRef<HTMLDivElement | null>(null);

  //   const uploadedColumnsArray = new Array(20).fill(null);

  // モーダル高さ
  const modalHeight = modalRef.current?.offsetHeight ?? 610;

  console.log("ConfirmationMappingModalレンダリング");
  return (
    <>
      {/* オーバーレイ */}
      <div
        className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay-light)] backdrop-blur-sm"
        style={{
          ...(zIndexOverlay && { zIndex: zIndexOverlay }),
          ...(isOverlayBgBlack && { background: `var(--color-overlay-black-sm)` }),
        }}
        onClick={clickEventClose}
      ></div>
      <div
        ref={modalRef}
        className={`${styles.modal} fade05_forward fixed left-[50%] top-[50%] z-[2000] flex h-auto max-h-max w-[40vw] max-w-[580px] translate-x-[-50%] translate-y-[-50%] select-none`}
        style={{ ...(zIndexModal && { zIndex: zIndexModal }), ...(background && { background: background }) }}
      >
        {isLoadingState && (
          <div className={`${styles.loading_overlay}`}>
            <SpinnerBrand withBorder withShadow />
          </div>
        )}
        {/* クローズボタン */}
        <button
          className={`modal_outside_btn flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full`}
          onClick={clickEventClose}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button>

        {/* 左コンテナ */}
        <div className={`${styles.left_container} relative flex h-full w-[42%] flex-col items-center`}>
          <div className={`${styles.left_wrapper} relative flex h-full w-full flex-col text-[16px]`}>
            <div className="relative w-full overflow-y-auto px-[30px] pb-[20px] pt-[24px]">
              <div className={`${styles.title_area} flex w-full flex-col text-[22px] font-bold`}>
                <h2>CSVとデータベースの紐付けを確定してよろしいですか？</h2>
              </div>

              <div
                className={`${styles.description_area} flex w-full flex-col space-y-[2px] pb-[15px] pt-[15px] text-[12px] text-[var(--color-text-sub)]`}
              >
                <p>{`設定した紐付け内容に間違いないか確認してください。`}</p>
                <p>{`「紐付けを確定し次へ」ボタンを押すことで、紐付けされた項目の全データを自動でデータベースへ保存可能なデータ形式へと変換する作業に移行します。`}</p>
              </div>

              <ul className={`${styles.confirmation_list} flex h-auto w-full flex-col`}>
                <li
                  className={`${styles.list_item} flex max-h-[35px] min-h-[35px] w-full items-center justify-between text-[15px]`}
                >
                  <h4 className="relative flex space-x-3">
                    {/* <FaFileCsv className="min-h-[24px] min-w-[24px] text-[24px] text-[#00d436]" /> */}
                    <BsFiletypeCsv className="min-h-[24px] min-w-[24px] text-[24px] text-[#00d436]" />
                    <span>CSVの項目数：</span>
                    <div className="absolute left-[18px] top-[100%] flex whitespace-nowrap text-[9px] text-[var(--color-text-sub)]">
                      （アップロードしたCSVの列ヘッダーの項目数）
                    </div>
                  </h4>
                  <div className="flex items-center justify-end space-x-[6px] text-[13px] font-bold">
                    <span className="">{selectedColumnFieldsArray?.length ?? "−"}</span>
                    <span className="">列</span>
                  </div>
                </li>
                <li
                  className={`${styles.list_item} flex max-h-[35px] min-h-[35px] w-full items-center justify-between text-[15px]`}
                >
                  <h4 className="relative flex space-x-3">
                    <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                    <span>保存する項目数：</span>
                    <div className="absolute left-[18px] top-[100%] flex whitespace-nowrap text-[9px] text-[var(--color-text-sub)]">
                      （紐付けした項目数）
                    </div>
                  </h4>
                  <div className="flex items-center justify-end space-x-[6px] text-[13px] font-bold">
                    <span className="">{alreadySelectColumnsSetObj.size ?? "−"}</span>
                    <span className="">列</span>
                  </div>
                </li>
                <li
                  className={`${styles.list_item} flex max-h-[35px] min-h-[35px] w-full items-center justify-between text-[15px]`}
                >
                  <h4 className="relative flex space-x-3">
                    <HiMinus className="min-h-[24px] min-w-[24px] stroke-[1.5] text-[24px] text-[var(--bright-red)]" />
                    <span>保存しない項目数：</span>
                    <div className="absolute left-[18px] top-[100%] flex whitespace-nowrap text-[9px] text-[var(--color-text-sub)]">
                      （スキップを指定した項目数）
                    </div>
                  </h4>
                  <div className="flex items-center justify-end space-x-[6px] text-[13px] font-bold">
                    <span className="">{skipCount}</span>
                    <span className="">列</span>
                  </div>
                </li>
              </ul>
            </div>

            {/* 変更の確定を送信するボタンエリア */}
            <div className="shadow-top-md-dark absolute bottom-0 left-0 w-full space-y-4 rounded-bl-[8px] bg-[var(--color-edit-bg-solid)] px-[30px] pb-[13px] pt-[18px]">
              <div className="flex w-full flex-col  text-[13px] text-[var(--color-text-title)]">
                <div className="flex flex-col space-y-3">
                  <div className="flex w-full items-start justify-between font-bold">
                    <span>一括インポートするデータ件数</span>
                    <div className={`flex items-center justify-end space-x-[6px]`}>
                      <span>{formattedUploadedRowCount}</span>
                      <span>件</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`flex w-full items-center justify-around space-x-5`}>
                <button
                  className={`transition-bg02 w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={clickEventClose}
                >
                  {cancelText}
                </button>
                <button
                  // className={`flex-center h-[40px] w-full rounded-[6px] font-bold text-[#fff]  ${
                  //   false
                  //     ? `cursor-pointer bg-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f-deep)]`
                  //     : `cursor-not-allowed bg-[var(--setting-side-bg-select)] text-[var(--setting-side-bg-select-hover)]`
                  // }`}
                  // className={`transition-bg02 w-[50%] cursor-pointer rounded-[8px] px-[15px] py-[10px] text-[14px] font-bold text-[#fff]  ${
                  //   buttonColor === "red" && `bg-[var(--color-red-tk)] hover:bg-[var(--color-red-tk-hover-deep)]`
                  // } ${
                  //   buttonColor === "brand" && `bg-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f-hover)]`
                  // }`}
                  className={`transition-bg02 w-[50%] cursor-pointer rounded-[8px] px-[15px] py-[10px] text-[14px] font-bold text-[#fff]  ${
                    buttonColor === "red" && `bg-[var(--color-red-tk)] hover:bg-[var(--color-red-tk-hover-deep)]`
                  } ${buttonColor === "brand" && `brand_btn_active_light`}`}
                  // disabled={true}
                  onClick={clickEventSubmit}
                >
                  <span>紐付けを確定し次へ</span>
                </button>
              </div>
              <div className={`flex w-full text-[11px] text-[var(--color-text-sub)]`} style={{ marginTop: `13px` }}>
                <p
                  className={`whitespace-pre-wrap`}
                >{`※変換処理はアップロードサイズに応じて時間がかかります。\n変換作業が終わるまでミニサイズボタンから引き続きデータベースの使用は可能です。`}</p>
              </div>
            </div>
          </div>
        </div>
        {/* 左コンテナここまで */}
        {/* 右コンテナ */}
        <div
          className={`${styles.right_container} relative flex h-full w-[58%] flex-col items-center justify-start px-[30px] pt-[40px]`}
        >
          <div className={`${styles.title_area} flex h-[40px] w-full items-start text-[18px] font-bold`}>
            紐付け項目一覧
          </div>
          <div
            className={`${styles.scroll_container} relative flex h-full w-full flex-col items-center rounded-[9px]`}
            // モーダル高さ - pt - タイトル高さ - モーダルボーダー
            style={{ maxHeight: `490px` }}
            // style={{ maxHeight: `${modalHeight - 40 - 40 - 2}px` }}
          >
            <div
              className={`${styles.scroll_wrapper} flex h-full w-full flex-col items-center overflow-y-auto pb-[24px]`}
            >
              <div
                className={`${styles.mapping_list_header} sticky left-0 top-0 flex min-h-[40px] w-full items-center justify-between font-bold`}
              >
                <div className={`flex-center h-full w-[45%] text-[12px]`}>
                  <span>CSV項目</span>
                </div>
                <div className={`flex-center h-full w-[10%]`}>
                  <IoIosArrowRoundForward className={`stroke-[13px] text-[18px] text-[var(--color-text-sub)]`} />
                </div>
                <div className={`flex-center h-full w-[45%] text-[12px]`}>
                  <span>データベース項目</span>
                </div>
              </div>
              {uploadedColumnFields.map((column, index) => {
                const selectedField = selectedColumnFieldsArray[index];
                const selectedFieldName = selectedField === "" ? "−" : getInsertColumnNames(selectedField);
                return (
                  <div
                    key={`mapping_list_item_${index}`}
                    className={`${styles.mapping_list_item} flex min-h-[42px] w-full items-center justify-between ${
                      index % 2 === 0 ? `` : ``
                    } ${index === 0 ? styles.first : ``} ${
                      index === uploadedColumnFields.length - 1 ? styles.last : ``
                    }`}
                  >
                    <div
                      className={`${styles.item_card} flex-center h-full w-[45%] rounded-[9px] bg-[#fff] text-[12px]`}
                    >
                      {/* <span className={`max-w-[180px] truncate`}>CSV項目{index}</span> */}
                      <span
                        className={`max-w-[180px] truncate`}
                        onMouseEnter={(e) => {
                          if (!column) return;
                          const el = e.currentTarget;
                          if (el.scrollWidth > el.offsetWidth)
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: column,
                              itemsPosition: "left",
                            });
                        }}
                        onMouseLeave={handleCloseTooltip}
                      >
                        {column}
                      </span>
                    </div>
                    <div className={`flex-center h-full w-[10%]`}>
                      <IoIosArrowRoundForward className={`stroke-[13px] text-[18px] text-[var(--color-text-sub)]`} />
                    </div>
                    {/* 資本金 */}
                    {selectedField === "capital" && (
                      <div
                        className={`${styles.item_card} ${styles.selectable} flex-center h-full w-[45%] rounded-[9px] bg-[#fff] text-[12px]`}
                      >
                        <>
                          <div className={`flex-center group relative h-max w-max truncate`}>
                            <select
                              className={`select_arrow_none relative z-0 max-w-[180px] cursor-pointer items-center truncate bg-transparent pr-[24px]`}
                              onMouseEnter={(e) => {
                                if (!selectedFieldName) return; // スキップ以外
                                handleOpenTooltip({
                                  e: e,
                                  display: "top",
                                  content: `アップロードしたCSVデータの会社リストに入力されている\n資本金の単位を選択してください。`,
                                  itemsPosition: "left",
                                });
                              }}
                              onMouseLeave={handleCloseTooltip}
                              value={detailsTransform.capital}
                              onChange={(e) =>
                                setDetailsTransform({
                                  ...detailsTransform,
                                  capital: e.target.value as "default" | "million",
                                })
                              }
                            >
                              <option value="default">資本金(円単位)</option>
                              <option value="million">資本金(万円単位)</option>
                            </select>
                            <div
                              className={`flex-center pointer-events-none absolute right-0 top-[50%] z-[10] min-h-[20px] min-w-[20px] translate-y-[-50%] rounded-full group-hover:bg-[var(--color-bg-sub-icon)]`}
                            >
                              <HiChevronDown
                                className="stroke-[1] text-[13px] text-[var(--color-text-brand-f)]"
                                style={{
                                  color: `var(--main-color-f)`,
                                }}
                              />
                            </div>
                          </div>
                        </>
                      </div>
                    )}
                    {/* 資本金 ここまで */}
                    {/* 通常 */}
                    {selectedField !== "capital" && (
                      <div
                        className={`${styles.item_card} flex-center h-full w-[45%] rounded-[9px] bg-[#fff] text-[12px]`}
                      >
                        <span
                          className={`max-w-[180px] truncate`}
                          onMouseEnter={(e) => {
                            if (selectedField === "") return; // スキップ
                            if (!selectedFieldName) return; // スキップ以外
                            const el = e.currentTarget;
                            if (el.scrollWidth > el.offsetWidth)
                              handleOpenTooltip({
                                e: e,
                                display: "top",
                                content: column,
                                itemsPosition: "left",
                              });
                          }}
                          onMouseLeave={handleCloseTooltip}
                        >
                          {selectedFieldName}
                        </span>
                      </div>
                    )}
                    {/* 通常 ここまで */}
                  </div>
                );
              })}
            </div>

            {/* スクロールコンテナ下のshadow padding-bottom: 24px; */}
            <div
              className={`absolute bottom-0 left-0 z-[100] min-h-[20px] w-full rounded-b-[9px]`}
              //   style={{ background: `var(--color-dashboard-table-under-shadow)` }}
              //   style={{ background: `linear-gradient(to top, var(--color-edit-bg-solid) 27%, transparent)` }}
              style={{ background: `linear-gradient(to top, var(--color-modal-solid-bg-second) 15%, transparent)` }}
            />
            {/* スクロールコンテナ下のshadow padding-bottom: 24px; */}
          </div>
        </div>
        {/* 右コンテナここまで */}
      </div>
    </>
  );
};
