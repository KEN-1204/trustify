import React, { FC, Suspense, memo } from "react";
import styles from "../CompanyDetail/CompanyDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";
// import { UnderRightActivityLog } from "./UnderRightActivityLog/UnderRightActivityLog";
import { FiLock } from "react-icons/fi";
import { AiFillLock } from "react-icons/ai";
import { FaLock } from "react-icons/fa";
import { BsFillLockFill } from "react-icons/bs";
import useRootStore from "@/store/useRootStore";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import dynamic from "next/dynamic";

// https://nextjs-ja-translation-docs.vercel.app/docs/advanced-features/dynamic-import
// デフォルトエクスポートの場合のダイナミックインポート
// const DynamicComponent = dynamic(() => import('../components/hello'));
// 名前付きエクスポートの場合のダイナミックインポート
const UnderRightActivityLog = dynamic(
  () => import("./UnderRightActivityLog/UnderRightActivityLog").then((mod) => mod.UnderRightActivityLog),
  {
    ssr: false,
  }
);
/**カスタムローディングコンポーネント オプションの loading コンポーネントを追加して、動的コンポーネントの読み込み中に読み込み状態をレンダリングできます
 * const DynamicComponentWithCustomLoading = dynamic(() => import('../components/hello'), {
  loading: () => <p>...</p>
});
 */
// SSRを使用しない場合
// 常にサーバー側にモジュールを含める必要はありません。たとえば、ブラウザのみで動作するライブラリがモジュールに含まれている場合です。

const CompanyMainContainerMemo: FC = () => {
  const searchMode = useDashboardStore((state) => state.searchMode);
  console.log("🔥 CompanyMainContainerレンダリング searchMode", searchMode);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);

  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string = "center") => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
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
      content: (e.target as HTMLDivElement).dataset.text as string,
      content2: content2,
      content3: content3,
      display: display,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPosWrap(null);
  };

  // セルダブルクリック モーダル表示
  // const handleDoubleClick = useCallback((e: React.MouseEvent<HTMLDivElement>, index: number, columnName: string) => {
  //   console.log("ダブルクリック index", index);
  //   if (columnName === "id") return console.log("ダブルクリック idのためリターン");
  //   // if (index === 0) return console.log("リターン");
  //   if (setTimeoutRef.current) {
  //     clearTimeout(setTimeoutRef.current);

  //     // console.log(e.detail);
  //     setTimeoutRef.current = null;
  //     // ダブルクリック時に実行したい処理
  //     console.log("ダブルクリック", e.currentTarget);
  //     // クリックした要素のテキストを格納
  //     const text = e.currentTarget.innerText;
  //     setTextareaInput(text);
  //     setIsOpenEditModal(true);
  //   }
  // }, []);

  const tableContainerSize = useDashboardStore((state) => state.tableContainerSize);
  const underDisplayFullScreen = useDashboardStore((state) => state.underDisplayFullScreen);

  // const tableContainerSize = useRootStore(useDashboardStore, (state) => state.tableContainerSize);
  return (
    <div className={`${styles.main_container} w-full `}>
      {/* ------------------------- スクロールコンテナ ------------------------- */}
      {/* <div className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] `}> */}
      <div
        className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${
          tableContainerSize === "half" && underDisplayFullScreen ? `${styles.height_all}` : ``
        } ${tableContainerSize === "all" && underDisplayFullScreen ? `${styles.height_all}` : ``}`}
      >
        {/* ------------------------- 左コンテナ ------------------------- */}
        <div
          className={`${styles.left_container} h-full min-w-[calc(50vw-var(--sidebar-mini-width))] pb-[35px] pt-[10px]`}
        >
          {/* --------- ラッパー --------- */}
          <form className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
            {/* 法人番号・ID */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>○法人番号</span>
                  {!searchMode && <span className={`${styles.value}`}>01234567890</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title_min}`}>ID</span>
                  {!searchMode && <span className={`${styles.value} truncate`}>01234567890</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 会社名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●会社名</span>
                  {!searchMode && (
                    <span className={`${styles.value} ${styles.value_highlight}`}>株式会社キーエンス</span>
                  )}
                  {searchMode && (
                    <input type="text" placeholder="株式会社○○" required autoFocus className={`${styles.input_box}`} />
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 部署名 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●部署名</span>
                  {!searchMode && <span className={`${styles.value}`}>代表取締役社長</span>}
                  {searchMode && (
                    <input
                      type="text"
                      placeholder="代表取締役 or ○○事業部など 不明の場合は.(ピリオド)を入力"
                      required
                      className={`${styles.input_box}`}
                    />
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 代表TEL・代表Fax */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>●代表TEL</span>
                  {!searchMode && <span className={`${styles.value}`}>0312345678</span>}
                  {searchMode && (
                    <input type="tel" placeholder="0312341234" required className={`${styles.input_box}`} />
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>代表Fax</span>
                  {!searchMode && <span className={`${styles.value}`}>098765432</span>}
                  {searchMode && <input type="tel" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 郵便番号・競合チェック */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>郵便番号</span>
                  {!searchMode && <span className={`${styles.value}`}>3070012</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className={`flex h-full w-1/2 flex-col pr-[20px]`}>
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>競合</span>
                  {/* <span className={`${styles.title}`}>会員専用</span> */}
                  {!searchMode && <span className={`${styles.value}`}>無し</span>}
                  {/* {!searchMode && <span className={`${styles.value}`}>有料会員様専用のフィールドです</span>} */}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                  {/* サブスク未加入者にはブラーを表示 */}
                  {/* <div className={`${styles.limited_lock_cover_half} flex-center`}>
                    <FaLock />
                  </div> */}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 住所 */}
            <div className={`${styles.row_area} flex h-[50px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title}`}>○住所</span>
                  {!searchMode && (
                    <span className={`${styles.textarea_value} h-[45px]`}>
                      東京都港区芝浦4-20-2 芝浦アイランドブルームタワー
                    </span>
                  )}
                  {searchMode && (
                    <textarea
                      name="address"
                      id="address"
                      cols={30}
                      rows={10}
                      className={`${styles.textarea_box} `}
                    ></textarea>
                  )}
                </div>
                <div className={`${styles.underline} `}></div>
              </div>
            </div>

            {/* 代表者・会長 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>代表者</span>
                  {!searchMode && <span className={`${styles.value}`}>代表太郎</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>会長</span>
                  {!searchMode && <span className={`${styles.value}`}>会長太郎</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 副社長・専務取締役 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>副社長</span>
                  {!searchMode && <span className={`${styles.value}`}>副社長太郎</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>専務取締役</span>
                  {!searchMode && (
                    <span
                      data-text="専務太郎"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      専務太郎
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 常務取締役・取締役 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>常務取締役</span>
                  {!searchMode && (
                    <span
                      data-text="常務太郎,常務太郎,常務太郎"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      常務太郎,常務太郎,常務太郎
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>取締役</span>
                  {!searchMode && (
                    <span
                      data-text="取締太郎、取締太郎、取締太郎、取締太郎、取締太郎"
                      className={`${styles.value} truncate`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      取締太郎、取締太郎、取締太郎、取締太郎、取締太郎、
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 役員・監査役 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>役員</span>
                  {!searchMode && (
                    <span
                      data-text="役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>監査役</span>
                  {!searchMode && (
                    <span
                      data-text="監査太郎"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      監査太郎
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 部長・担当者 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>部長</span>
                  {!searchMode && (
                    <span
                      data-text="部長"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      部長太郎
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>担当者</span>
                  {!searchMode && (
                    <span
                      data-text="担当太郎"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      担当太郎
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 業種 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>○業種</span>
                  {!searchMode && <span className={`${styles.value}`}></span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 製品 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>○製品</span>
                  {!searchMode && <span className={`${styles.value}`}></span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 規模（ランク）・決算月 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>規模(ﾗﾝｸ)</span>
                  {!searchMode && <span className={`${styles.value}`}>F100人以下</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>決算月</span>
                  {!searchMode && <span className={`${styles.value}`}>6月</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 資本金・設立 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>資本金</span>
                  {!searchMode && <span className={`${styles.value}`}>1000万円</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>設立</span>
                  {!searchMode && <span className={`${styles.value}`}>2000年12月</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 予算申請月1・予算申請月2 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>予算申請月1</span>
                  {!searchMode && <span className={`${styles.value}`}>11月</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>予算申請月2</span>
                  {!searchMode && <span className={`${styles.value}`}>5月</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 主要取引先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要取引先</span>
                  {!searchMode && (
                    <span
                      data-text="株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 主要仕入先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要仕入先</span>
                  {!searchMode && (
                    <span
                      data-text="株式会社Keyence"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      株式会社Keyence
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* HP */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>HP</span>
                  {!searchMode && <span className={`${styles.value}`}>http://localhost:3000/company</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* Email */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>Email</span>
                  {!searchMode && <span className={`${styles.value}`}>cieletoile.0000@gmail.com</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 事業内容 */}
            <div className={`${styles.row_area} flex h-[50px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full`}>
                  <span className={`${styles.title}`}>事業内容</span>
                  {!searchMode && (
                    <>
                      {/* <span className={`${styles.textarea_value} h-[45px]`}>
                        東京都港区芝浦4-20-2
                        芝浦アイランドブルームタワー602号室あああああああああああああああああああああああああああああ芝浦アイランドブルームタワー602号室222あああああああああああああああああああああああああああああ
                      </span> */}
                      <span
                        data-text="・放電加工機の電極・フィルター・周辺機器、機械・装置、電気接点の製造　１．放電加工周辺機器・工作機械販売事業　２．機械装置の設計製作事業　３．電気接点の製造事業　４．プレス金型の設計製作事業　５．合金開発製造事業（放電加工用電極、電気接点材料）　６．工作機械用フィルタの開発製造事業　７．樹脂加工事業"
                        className={`${styles.textarea_value} h-[45px]`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        ・放電加工機の電極・フィルター・周辺機器、機械・装置、電気接点の製造　１．放電加工周辺機器・工作機械販売事業　２．機械装置の設計製作事業　３．電気接点の製造事業　４．プレス金型の設計製作事業　５．合金開発製造事業（放電加工用電極、電気接点材料）　６．工作機械用フィルタの開発製造事業　７．樹脂加工事業
                      </span>
                    </>
                  )}
                  {searchMode && (
                    <textarea
                      name="address"
                      id="address"
                      cols={30}
                      rows={10}
                      className={`${styles.textarea_box} `}
                    ></textarea>
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 設備 */}
            <div className={`${styles.row_area} flex h-[50px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full`}>
                  <span className={`${styles.title}`}>設備</span>
                  {!searchMode && (
                    <>
                      {/* <span className={`${styles.textarea_value} h-[45px]`}>
                        東京都港区芝浦4-20-2
                        芝浦アイランドブルームタワー602号室あああああああああああああああああああああああああああああ芝浦アイランドブルームタワー602号室222あああああああああああああああああああああああああああああ
                      </span> */}
                      <span
                        data-text="・成形平面研削盤、平面研削盤、CNC成形平面研削盤、CNC治具研削盤、工具研削盤、高速加工マシニングセンター、マシニングセンター、NCフライス盤、フライス盤、NC電極加工機（銅、グラファイト）、NC放電加工機、WC放電加工機、NC細穴加工機、メッキ装置、ピーニング装置（クリーニング、ピーニング）、旋盤、ボール盤、直立ボール盤、鋸盤、レーザー彫刻機、汎用彫刻機、ブラスト機（プラ、ガラスビーズ）、トランスファー成形機、2D-CAM、3D-CAM、3D-CAD、2D-CAD、樹脂流動解析ソフト、構造解析ソフト"
                        className={`${styles.textarea_value} h-[45px]`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      >
                        ・成形平面研削盤、平面研削盤、CNC成形平面研削盤、CNC治具研削盤、工具研削盤、高速加工マシニングセンター、マシニングセンター、NCフライス盤、フライス盤、NC電極加工機（銅、グラファイト）、NC放電加工機、WC放電加工機、NC細穴加工機、メッキ装置、ピーニング装置（クリーニング、ピーニング）、旋盤、ボール盤、直立ボール盤、鋸盤、レーザー彫刻機、汎用彫刻機、ブラスト機（プラ、ガラスビーズ）、トランスファー成形機、2D-CAM、3D-CAM、3D-CAD、2D-CAD、樹脂流動解析ソフト、構造解析ソフト
                      </span>
                    </>
                  )}
                  {searchMode && (
                    <textarea
                      name="address"
                      id="address"
                      cols={30}
                      rows={10}
                      className={`${styles.textarea_box} `}
                    ></textarea>
                  )}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 事業拠点・海外拠点 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>事業拠点</span>
                  {!searchMode && (
                    <span
                      data-text="東京営業所、浦和営業所、厚木工場、群馬工場"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      東京営業所、浦和営業所、厚木工場、群馬工場
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>海外拠点</span>
                  {!searchMode && (
                    <span
                      data-text="中国、アメリカ"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      中国、アメリカ
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* グループ会社 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>グループ会社</span>
                  {!searchMode && (
                    <span
                      className={`${styles.value}`}
                      data-text="株式会社キーエンスエンジニアリング"
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      株式会社キーエンスエンジニアリング
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* --------- ラッパーここまで --------- */}
          </form>
        </div>
        {/* ---------------- 右コンテナ サーチモードではない通常モード 活動テーブル ---------------- */}
        {!searchMode && (
          <div className={`${styles.right_container} h-full grow bg-[aqua]/[0] pb-[35px] pt-[20px]`}>
            <div className={`${styles.right_contents_wrapper} flex h-full w-full flex-col bg-[#000]/[0]`}>
              {/* 活動履歴 */}
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense
                  fallback={<Fallback className="min-h-[calc(100vh-100vh/3-var(--header-height)/3--20px-22px-40px)]" />}
                >
                  <UnderRightActivityLog />
                </Suspense>
              </ErrorBoundary>
              {/* 下エリア 禁止フラグなど */}
              <div
                className={`${styles.right_under_container} h-screen w-full  bg-[#f0f0f0]/[0] ${
                  isOpenSidebar ? `transition-base02` : `transition-base01`
                }`}
              >
                {/* TEL要注意フラグ・TEL要注意理由 */}
                <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>TEL要注意</span>

                      <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          // checked={!!checkedColumnHeader} // 初期値
                          onChange={() => console.log("チェッククリック")}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="flex h-full w-1/2 flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.right_under_title}`}>注意理由</span>
                      {!searchMode && (
                        <span
                          data-text=" TEL要注意理由 吾輩は猫である。名前はまだ無い。"
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e, "right")}
                          onMouseLeave={handleCloseTooltip}
                          // onDoubleClick={(e) => handleDoubleClick(e, index, columnHeaderItemList[index].columnName)}
                        >
                          TEL要注意理由 吾輩は猫である。名前はまだ無い。
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* メール禁止フラグ・資料禁止フラグ */}
                <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>メール禁止フラグ</span>

                      <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          // checked={!!checkedColumnHeader} // 初期値
                          onChange={() => console.log("チェッククリック")}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>資料禁止フラグ</span>

                      <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          // checked={!!checkedColumnHeader} // 初期値
                          onChange={() => console.log("チェッククリック")}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>

                {/* FAX・DM禁止フラグ */}
                <div className={`${styles.right_row_area}  mt-[10px] flex h-[35px] w-full grow items-center`}>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}>
                      <span className={`${styles.check_title}`}>FAX・DM禁止フラグ</span>

                      <div className={`${styles.grid_select_cell_header}`}>
                        <input
                          type="checkbox"
                          // checked={!!checkedColumnHeader} // 初期値
                          onChange={() => console.log("チェッククリック")}
                          className={`${styles.grid_select_cell_header_input}`}
                        />
                        <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                  <div className="transition-base03 flex h-full w-1/2  flex-col pr-[20px]">
                    <div className={`${styles.title_box} transition-base03 flex h-full items-center `}></div>
                  </div>
                </div>

                {/* 禁止理由 */}
                <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>禁止理由</span>
                      {!searchMode && (
                        <span
                          data-text="吾輩は猫である。名前はまだ無い。"
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          吾輩は猫である。名前はまだ無い。
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div>
                {/* クレーム */}
                {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                  <div className="flex h-full w-full flex-col pr-[20px]">
                    <div className={`${styles.title_box} flex h-full items-center `}>
                      <span className={`${styles.title}`}>クレーム</span>
                      {!searchMode && (
                        <span
                          data-text="吾輩は猫である。名前はまだ無い。"
                          className={`${styles.value}`}
                          onMouseEnter={(e) => handleOpenTooltip(e)}
                          onMouseLeave={handleCloseTooltip}
                        >
                          吾輩は猫である。名前はまだ無い。
                        </span>
                      )}
                      {searchMode && <input type="text" className={`${styles.input_box}`} />}
                    </div>
                    <div className={`${styles.underline}`}></div>
                  </div>
                </div> */}

                {/*  */}
              </div>

              {/*  */}
            </div>
          </div>
        )}
        {/* ---------------- 右コンテナ input時はstickyにしてnullやis nullなどのボタンや説明を配置 ---------------- */}
        {searchMode && (
          <div
            className={`${styles.right_sticky_container} sticky top-0 h-full grow bg-[aqua]/[0] pt-[20px] text-[var(--color-text)] `}
          >
            <div
              className={`${styles.right_sticky_contents_wrapper} flex h-[350px] w-full flex-col rounded-[8px] bg-[var(--color-bg-brand-f10)] px-[20px] `}
            >
              <div className="flex-center h-[40px] w-full text-[18px] font-semibold ">会社 条件検索</div>
              <div className={`} text-[15px]`}>
                <div className="mt-[10px] flex  min-h-[30px] items-center">・検索したい条件を入力してください。</div>
                <div className="flex  min-h-[30px] items-center">
                  <span className="h-full w-[15px]"></span>
                  例えば、「東京都大田区」の会社で「海外拠点」が存在する会社を検索する場合は、「●住所」に「東京都大田区※」と入力し、「海外拠点」に「is
                  not null」と入力してください。
                </div>
                <div className="mt-[10px] flex  min-h-[30px] items-center">
                  ・「※ アスタリスク」は、「前方一致・後方一致・部分一致」を表します
                </div>
                <div className="flex items-center">
                  <span className="h-full w-[15px]"></span>
                  例えば、会社名に「〜工業」と付く会社を検索したい場合に、「※工業※」、「〜精機」の会社は「※精機※」と検索することで、部分一致で検索可能です
                </div>
                <div className="mt-[10px] flex  min-h-[30px] items-center">
                  ・「is not null」は「空白で無いデータ」を抽出します
                </div>
                <div className="mt-[10px] flex  min-h-[30px] items-center">
                  ・「is null」は「空白のデータ」を抽出します
                </div>
                <div className="mt-[10px] flex  min-h-[30px] items-center">
                  ・空白の項目のまま検索した場合は、その項目の「全てのデータ」を抽出します
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const CompanyMainContainer = memo(CompanyMainContainerMemo);

/* Divider、区切り線 */
//  <div className="flex h-full w-1/2 flex-col pr-[15px]">
//    <div className="flex h-full items-center">○法人番号</div>
//    <div className={`${styles.underline}`}></div>
//  </div>;

/**
 * 
 * <div
        className={`${styles.scroll_container} relative flex w-full overflow-y-auto pl-[10px] ${
          tableContainerSize === "half" ? `${styles.height_all}` : ``
        } ${tableContainerSize === "all" ? `${styles.height_all}` : ``}`}
      >
*/
