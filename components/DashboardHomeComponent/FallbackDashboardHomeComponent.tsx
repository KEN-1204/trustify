import React from "react";
import styles from "./DashboardHomeComponent.module.css";

export const FallbackDashboardHomeComponent = () => {
  return (
    <div className={`flex-center ${styles.app_main_container} relative ${styles.open}`}>
      {/* 左サイドバーサイズ分のスペーサー */}
      <div className={`${styles.spacer_left}`}></div>
      <div className={`${styles.main_contents_wrapper}`}>
        {/* 上ヘッダーサイズ分のスペーサー */}
        <div className={`${styles.spacer_top}`}></div>
        {/* ===================== スクロールコンテナ ここから ===================== */}
        <div className={`${styles.main_contents_container}`}>
          <section className={`${styles.home_screen} ${styles.all_container} space-y-0 !px-0 !py-0`}>
            <div className={`flex-col-center h-full w-full  ${styles.home_container}`}>
              <div className="flex h-[70dvh] w-[40%] flex-col items-center rounded-[4px] ">
                <div className={`${styles.title_area} flex-col-center w-full `}>
                  <h3 className="flex-center h-[70px] w-full max-w-[400px] text-[32px] font-bold text-[var(--color-text-brand-f)]">
                    TRUSTiFYへようこそ
                  </h3>
                  <div className={`h-[54px] w-full max-w-[400px] text-[14px] text-[var(--color-text-third)]`}>
                    ここはあなたのデータベースです。ご紹介するステップで、最初の一歩を踏み出しましょう！
                  </div>
                </div>
                <div className={`${styles.contents_area} h-full w-full max-w-[400px]`}>
                  {/* {home_cards.map((item, index) => (
                      <div
                        key={item.name}
                        className={`${styles.content_card} transition-base02 mt-[10px] flex h-[72px] w-full max-w-[400px] items-center rounded-[8px] bg-[var(--color-bg-base-sub)] p-[16px] text-[14px] font-bold`}
                        onClick={() => {
                          if (item.name === "invitation") {
                            if (userProfileState?.account_company_role !== "company_admin") {
                              alert("管理者権限を持つユーザーのみアクセス可能です");
                              return;
                            }
                          }
                          handleActions(item.name);
                        }}
                      >
                        <div className={`h-[40px] w-[40px] ${styles.animate_icon}`}>{item.icon}</div>
                        <div className="mx-[16px] flex flex-grow flex-col">
                          <span>{item.title}</span>
                        </div>
                        <div>
                          <BsChevronRight
                            className={`transition-base03 text-[var(--color-text)] ${styles.right_arrow}`}
                          />
                        </div>
                      </div>
                    ))} */}
                  {/* ============= */}
                  <div
                    className={`${styles.content_card} transition-base02 mt-[10px] flex h-[72px] w-full max-w-[400px] items-center rounded-[8px] bg-[var(--color-bg-base-sub)] p-[16px] text-[14px] font-bold ${styles.skeleton}`}
                  >
                    <div className={`h-[40px] w-[40px] ${styles.animate_icon}`}></div>
                    <div className="mx-[16px] flex flex-grow flex-col">
                      <span></span>
                    </div>
                    <div></div>
                  </div>
                  {/* ============= */}
                  <div
                    className={`${styles.content_card} transition-base02 mt-[10px] flex h-[72px] w-full max-w-[400px] items-center rounded-[8px] bg-[var(--color-bg-base-sub)] p-[16px] text-[14px] font-bold ${styles.skeleton}`}
                  >
                    <div className={`h-[40px] w-[40px] ${styles.animate_icon}`}></div>
                    <div className="mx-[16px] flex flex-grow flex-col">
                      <span></span>
                    </div>
                    <div></div>
                  </div>
                  {/* ============= */}
                  <div
                    className={`${styles.content_card} transition-base02 mt-[10px] flex h-[72px] w-full max-w-[400px] items-center rounded-[8px] bg-[var(--color-bg-base-sub)] p-[16px] text-[14px] font-bold ${styles.skeleton}`}
                  >
                    <div className={`h-[40px] w-[40px] ${styles.animate_icon}`}></div>
                    <div className="mx-[16px] flex flex-grow flex-col">
                      <span></span>
                    </div>
                    <div></div>
                  </div>
                  {/* ============= */}
                  <div
                    className={`${styles.content_card} transition-base02 mt-[10px] flex h-[72px] w-full max-w-[400px] items-center rounded-[8px] bg-[var(--color-bg-base-sub)] p-[16px] text-[14px] font-bold ${styles.skeleton}`}
                  >
                    <div className={`h-[40px] w-[40px] ${styles.animate_icon}`}></div>
                    <div className="mx-[16px] flex flex-grow flex-col">
                      <span></span>
                    </div>
                    <div></div>
                  </div>
                  {/* ============= */}
                  <div
                    className={`${styles.content_card} transition-base02 mt-[10px] flex h-[72px] w-full max-w-[400px] items-center rounded-[8px] bg-[var(--color-bg-base-sub)] p-[16px] text-[14px] font-bold ${styles.skeleton}`}
                  >
                    <div className={`h-[40px] w-[40px] ${styles.animate_icon}`}></div>
                    <div className="mx-[16px] flex flex-grow flex-col">
                      <span></span>
                    </div>
                    <div></div>
                  </div>
                  {/* ============= */}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
