import styles from "./SettingSalesTargets.module.css";

export const SalesTargetTree = () => {
  return (
    <ul className={`pl-[22px] ${styles.list_container}`} style={{ animationDelay: `0.6s` }}>
      <li className="flex h-[28px] text-[12px]">
        <div className={`flex flex-col`}>
          <div className={`${styles.col_item} ${styles.col_header} flex justify-center`}>
            <span>年度</span>
          </div>
          <div className="min-h-[2px] w-full bg-[var(--color-border-base)]" />
        </div>

        <div className="relative mx-[6px] h-full min-w-[25px]"></div>

        <div className={`flex flex-col`}>
          <div className={`${styles.col_item} ${styles.col_header} flex justify-center`}>
            <span>半期</span>
          </div>
          <div className="min-h-[2px] w-full bg-[var(--color-border-base)]" />
        </div>

        <div className="relative mx-[6px] h-full min-w-[25px]"></div>

        <div className={`flex flex-col`}>
          <div className={`${styles.col_item} ${styles.col_header} ${styles.quarter} flex justify-center`}>
            <span>四半期</span>
          </div>
          <div className="min-h-[2px] w-full bg-[var(--color-border-base)]" />
        </div>

        <div className="relative mx-[6px] h-full min-w-[25px]"></div>

        <div className={`flex flex-col`}>
          <div className={`${styles.col_item} ${styles.col_header} flex justify-center`} style={{ width: `288px` }}>
            <span>月度</span>
          </div>
          <div className="min-h-[2px] w-full bg-[var(--color-border-base)]" />
        </div>
      </li>
      <li className={`${styles.list_row_target} flex text-[12px]`}>
        {/* 上位4桁まで表示 602.4億 or 1.502億 2500万 502.2万 など表示桁数を制限する */}
        <div className={`flex h-full flex-col`}>
          <div className={`${styles.col_item} space-x-[6px]`}>
            {/* <span>年度: </span>
                        <span>630.4億</span> */}
            {/* <span>630.4億/2024</span> */}
            <span className={`${styles.target_value}`}>630.4億</span>
            {/* <span className="text-[12px] text-[var(--color-text-sub)]">/ 2024</span> */}
          </div>
          <div className={`${styles.col_item} ${styles.period} flex justify-end space-x-[6px]`}>
            <span className="text-[12px] text-[var(--color-text-sub)]">/ 2024</span>
          </div>
        </div>

        {/* <hr className={`mx-[12px] h-full w-[1px] min-w-[1px] bg-[var(--color-border-base)]`} /> */}
        <div className="relative mx-[6px] h-full min-w-[25px]">
          <div
            className={`${styles.connect_line} ${styles.first} absolute left-[50%] top-[13px] h-[60px] min-w-[1px] translate-x-[-50%]`}
          />
          <div className={`${styles.connect_line} ${styles.first} absolute left-[0] top-[13px] min-h-[1px] w-full`} />

          <div
            className={`${styles.connect_line} ${styles.third} absolute left-[50%] top-[73px] min-h-[1px] w-[50%]`}
          />
        </div>

        <div className={`flex h-full flex-col`}>
          <div className={`${styles.col_item} space-x-[6px]`}>
            {/* <span>H1: </span> */}
            {/* <span>310.4億 / H1</span> */}
            <span className={`${styles.target_value}`}>310.4億</span>
            {/* <span className="text-[12px] text-[var(--color-text-sub)]">/ H1</span> */}
          </div>
          <div className={`${styles.col_item} ${styles.period} flex justify-end space-x-[6px]`}>
            <span className="text-[12px] text-[var(--color-text-sub)]">/ H1</span>
          </div>
          <div className={`${styles.col_item} space-x-[6px]`}>
            {/* <span>H2: </span>
                        <span>320億</span> */}
            <span className={`${styles.target_value}`}>320.0億</span>
            {/* <span className="text-[12px] text-[var(--color-text-sub)]">/ H2</span> */}
          </div>
          <div className={`${styles.col_item} ${styles.period} flex justify-end space-x-[6px]`}>
            <span className="text-[12px] text-[var(--color-text-sub)]">/ H2</span>
          </div>
        </div>

        {/* <hr className={`mx-[12px] h-full w-[1px] min-w-[1px] bg-[var(--color-border-base)]`} /> */}
        <div className="relative mx-[6px] h-full min-w-[25px]">
          <div
            className={`${styles.connect_line} ${styles.first} absolute left-[50%] h-[30px] min-w-[1px] translate-x-[-50%]`}
          />
          <div className={`${styles.connect_line} ${styles.first} absolute left-[0] min-h-[1px] w-full`} />
          <div className={`${styles.connect_line} ${styles.second} absolute left-[50%] min-h-[1px] w-[50%]`} />
          <div
            className={`${styles.connect_line} ${styles.third} absolute left-[50%] h-[30px] min-w-[1px] translate-x-[-50%]`}
          />
          <div className={`${styles.connect_line} ${styles.third} absolute left-[0] min-h-[1px] w-full`} />
          <div className={`${styles.connect_line} ${styles.fourth} absolute left-[50%] min-h-[1px] w-[50%]`} />
        </div>

        <div className={`flex h-full flex-col`}>
          <div className={`${styles.col_item} ${styles.quarter} space-x-[6px]`}>
            {/* <span>Q1: </span> */}
            {/* <span>155.2億</span> */}
            {/* <span>155.2億 / Q1</span> */}
            <span className={`${styles.target_value}`}>155.2億</span>
            <span className="text-[12px] text-[var(--color-text-sub)]">/ Q1</span>
          </div>
          <div className={`${styles.col_item} ${styles.quarter} space-x-[6px]`}>
            {/* <span>Q2: </span>
                        <span>155.2億</span> */}
            {/* <span>155.2億 / Q2</span> */}
            <span className={`${styles.target_value}`}>155.2億</span>
            <span className="text-[12px] text-[var(--color-text-sub)]">/ Q2</span>
          </div>
          <div className={`${styles.col_item} ${styles.quarter} space-x-[6px]`}>
            {/* <span>Q3: </span>
                        <span>160億</span> */}
            {/* <span>155.2億 / Q3</span> */}
            <span className={`${styles.target_value}`}>160.0億</span>
            <span className="text-[12px] text-[var(--color-text-sub)]">/ Q3</span>
          </div>
          <div className={`${styles.col_item} ${styles.quarter} space-x-[6px]`}>
            {/* <span>Q4: </span>
                        <span>160億</span> */}
            {/* <span>155.2億 / Q4</span> */}
            <span className={`${styles.target_value}`}>160.0億</span>
            <span className="text-[12px] text-[var(--color-text-sub)]">/ Q4</span>
          </div>
        </div>

        <div className="relative mx-[6px] h-full min-w-[25px]">
          <div className={`${styles.connect_line} ${styles.first} absolute left-[0] top-[13px] min-h-[1px] w-full`} />
          <div className={`${styles.connect_line} ${styles.second} absolute left-[0] top-[38px] min-h-[1px] w-full`} />
          <div className={`${styles.connect_line} ${styles.third} absolute left-[0] top-[63px] min-h-[1px] w-full`} />
          <div className={`${styles.connect_line} ${styles.fourth} absolute left-[0] top-[88px] min-h-[1px] w-full`} />
        </div>

        <div className={`flex h-full flex-col`}>
          <div className="flex space-x-[9px]">
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 4月</span>
            </div>
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 5月</span>
            </div>
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 6月</span>
            </div>
          </div>
          <div className="flex space-x-[9px]">
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 7月</span>
            </div>
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 8月</span>
            </div>
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 9月</span>
            </div>
          </div>
          <div className="flex space-x-[9px]">
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 10月</span>
            </div>
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 11月</span>
            </div>
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 12月</span>
            </div>
          </div>

          <div className="flex space-x-[9px]">
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 1月</span>
            </div>
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 2月</span>
            </div>
            <div className={`${styles.col_item} ${styles.month}`}>
              <span className={`${styles.target_value}`}>51.7億</span>
              <span className="text-[12px] text-[var(--color-text-sub)]">/ 3月</span>
            </div>
          </div>
        </div>
      </li>
    </ul>
  );
};
