import React, { FC, memo } from "react";
import styles from "../CompanyDetail/CompanyDetail.module.css";
import useDashboardStore from "@/store/useDashboardStore";

const CompanyMainContainerMemo: FC = () => {
  const searchMode = useDashboardStore((state) => state.searchMode);
  console.log("🔥 CompanyMainContainerレンダリング searchMode", searchMode);
  return (
    <div className={`${styles.main_container} w-full `}>
      {/* ------------------------- スクロールコンテナ ------------------------- */}
      <div className={`${styles.scroll_container} flex h-[300px] w-full overflow-y-auto px-[10px] pb-[20px]`}>
        {/* ------------------------- 左コンテナ ------------------------- */}
        <div className={`${styles.left_container} h-full w-[calc(50vw-var(--sidebar-mini-width))] `}>
          {/* --------- ラッパー --------- */}
          <div className={`${styles.left_wrapper} flex h-screen w-full flex-col`}>
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
                  {!searchMode && <span className={`${styles.value}`}>株式会社キーエンス</span>}
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
                  {!searchMode && <span className={`${styles.value}`}>メトロロジ事業部</span>}
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
            {/* <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>○住所</span>
                  {!searchMode && (
                    <span>
                      東京都港区芝浦4-20-2 芝浦アイランドブルームタワー602号室 あああああああああああああああああああ
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div> */}

            {/* 住所 */}
            <div className={`${styles.row_area} flex h-[60px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px] pt-[5px]">
                <div className={`${styles.title_box} flex h-full`}>
                  <span className={`${styles.title}`}>○住所</span>
                  {!searchMode && (
                    <>
                      {/* <span className={`${styles.textarea_value}  line-clamp-2  max-w-[535px]`}>
                        東京都港区芝浦4-20-2 芝浦アイランドブルームタワー602号室
                        aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa
                      </span> */}
                      {/* <span className={`${styles.textarea_value} line-clamp-2`}>
                        東京都港区芝浦4-20-2 芝浦アイランドブルームタワー602号室
                        あああああああああああああああああああああああああああああああああああああああああああああああああああああああああ
                      </span> */}
                      <span className={`${styles.value}`}>
                        東京都港区芝浦4-20-2 芝浦アイランドブルームタワー602号室
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
                  {!searchMode && <span className={`${styles.value}`}>専務太郎</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 常務取締役・役員 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>常務取締役</span>
                  {!searchMode && <span className={`${styles.value}`}>常務太郎</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>役員</span>
                  {!searchMode && (
                    <span className={`${styles.value} truncate`}>
                      役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎・役員太郎
                    </span>
                  )}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* 監査役・部長 */}
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.title}`}>監査役</span>
                  {!searchMode && <span className={`${styles.value}`}>監査太郎</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
              <div className="flex h-full w-1/2 flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center`}>
                  <span className={`${styles.title}`}>部長</span>
                  {!searchMode && <span className={`${styles.value}`}>部長太郎</span>}
                  {searchMode && <input type="text" className={`${styles.input_box}`} />}
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>

            {/* --------- ラッパーここまで --------- */}
          </div>
        </div>
        {/* ------------------------- 右コンテナ ------------------------- */}
        <div className={`${styles.right_container} h-full grow bg-[aqua]/[0]`}>
          <div className="h-screen w-full bg-[#fff]/[0]"></div>
        </div>
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
