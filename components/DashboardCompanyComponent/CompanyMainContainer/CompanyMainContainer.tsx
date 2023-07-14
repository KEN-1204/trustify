import React, { FC, memo } from "react";
import styles from "../CompanyDetail/CompanyDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import useStore from "@/store";

const CompanyMainContainerMemo: FC = () => {
  const searchMode = useDashboardStore((state) => state.searchMode);
  console.log("🔥 CompanyMainContainerレンダリング searchMode", searchMode);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);

  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
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
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPosWrap(null);
  };
  return (
    <div className={`${styles.main_container} w-full `}>
      {/* ------------------------- スクロールコンテナ ------------------------- */}
      <div className={`${styles.scroll_container} relative flex w-full overflow-y-auto px-[10px] `}>
        {/* ------------------------- 左コンテナ ------------------------- */}
        <div className={`${styles.left_container} h-full w-[calc(50vw-var(--sidebar-mini-width))] pb-[35px] pt-[10px]`}>
          {/* --------- ラッパー --------- */}
          <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
            {/* 法人番号・ID */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>○法人番号</span>
                  {!searchMode && <span className={`${styles.value}`}>01234567890</span>}
                  {searchMode && <input type="number" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title_min}`}>ID</span>
                  {!searchMode && <span className={`${styles.value}`}>01234567890</span>}
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
                    <input type="text" placeholder="株式会社○○" autoFocus className={`${styles.input_box}`} />
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
                  {searchMode && <input type="text" placeholder="○○事業部" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 代表TEL・代表Fax */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>○代表TEL</span>
                  {!searchMode && <span className={`${styles.value}`}>0312345678</span>}
                  {searchMode && <input type="tel" placeholder="0312341234" className={`${styles.input_box}`} />}
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

            {/* 郵便番号・地区CD */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>郵便番号</span>
                  {!searchMode && <span className={`${styles.value}`}>3070012</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>地区CD</span>
                  {!searchMode && <span className={`${styles.value}`}>3070012</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
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
                    <>
                      {/* <span className={`${styles.textarea_value} h-[45px]`}>
                        東京都港区芝浦4-20-2
                        芝浦アイランドブルームタワー602号室あああああああああああああああああああああああああああああ芝浦アイランドブルームタワー602号室222あああああああああああああああああああああああああああああ
                      </span> */}
                      <span className={`${styles.textarea_value} h-[45px]`}>
                        東京都港区芝浦4-20-2 芝浦アイランドブルームタワー
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
                <div className={`${styles.underline} `}></div>
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

            {/* 主要取引先 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>主要取引先</span>
                  {/* {!searchMode && <span className={`${styles.value}`}>株式会社キーエンス</span>} */}
                  {/* {!searchMode && (
                    <span
                      data-text="株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス"
                      className={`${styles.value}`}
                      onMouseEnter={(e) => handleOpenTooltip(e)}
                      onMouseLeave={handleCloseTooltip}
                    >
                      株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス、株式会社キーエンス
                    </span>
                  )} */}
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

            {/* グループ会社・子会社 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>グループ会社</span>
                  {!searchMode && (
                    <span
                      data-text="株式会社キーエンスエンジニアリング"
                      className={`${styles.value}`}
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
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>子会社</span>
                  {!searchMode && (
                    <span
                      data-text="株式会社キーエンスエンジニアリング"
                      className={`${styles.value}`}
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

            {/* 設備 */}
            <div className={`${styles.row_area} flex h-[50px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] ">
                <div className={`${styles.title_box}  flex h-full`}>
                  <span className={`${styles.title}`}>検査設備</span>
                  {!searchMode && (
                    <>
                      {/* <span className={`${styles.textarea_value} h-[45px]`}>
                        東京都港区芝浦4-20-2
                        芝浦アイランドブルームタワー602号室あああああああああああああああああああああああああああああ芝浦アイランドブルームタワー602号室222あああああああああああああああああああああああああああああ
                      </span> */}
                      <span
                        data-text=""
                        className={`${styles.textarea_value} h-[45px]`}
                        onMouseEnter={(e) => handleOpenTooltip(e)}
                        onMouseLeave={handleCloseTooltip}
                      ></span>
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

            {/* --------- ラッパーここまで --------- */}
          </div>
        </div>
        {/* ---------------- 右コンテナ サーチモードではない通常モード 活動テーブル ---------------- */}
        {!searchMode && (
          <div className={`${styles.right_container} h-full grow bg-[aqua]/[0] pb-[35px] pt-[20px]`}>
            <div className={`${styles.right_contents_wrapper} h-full w-full bg-[#000]/[0.3]`}></div>
          </div>
        )}
        {/* ---------------- 右コンテナ input時はstickyにしてnullやis nullなどのボタンや説明を配置 ---------------- */}
        {searchMode && (
          <div className={`${styles.right_sticky_container} sticky top-0 h-full grow bg-[aqua]/[0] pt-[20px]`}>
            <div className={`${styles.right_sticky_contents_wrapper} h-[350px] w-full bg-[#000]/[0.3]`}></div>
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
