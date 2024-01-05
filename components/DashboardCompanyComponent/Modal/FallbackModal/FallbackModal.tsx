import { BsChevronLeft } from "react-icons/bs";
import styles from "./FallbackModal.module.css";
import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";

export const FallbackModal = () => {
  return (
    <>
      <div className={`${styles.overlay}`}>{/* <SpinnerComet h="56px" w="56px" /> */}</div>
      {/* <div className={`${styles.container}`}> */}
      <div className={`${styles.container} fade03`}>
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
          <div className="relative min-w-[150px] text-start font-semibold">
            <div className="flex max-w-max cursor-pointer select-none items-center hover:text-[#aaa]">
              <div className="h-full min-w-[20px]"></div>
              <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" />
              <span>戻る</span>
            </div>
          </div>
          {/* <div className="min-w-[150px] select-none font-bold">面談予定 新規作成</div> */}
          <SkeletonLoadingLineCustom h="27px" w="240px" rounded="6px" />

          <div
            className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
          >
            保存
          </div>
        </div>

        <div className="min-h-[2px] w-full bg-[var(--color-bg-brand-f)]"></div>

        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {Array(2)
            .fill(null)
            .map((_, index) => (
              <div key={index} className={`${styles.full_contents_wrapper} flex w-full`}>
                {/* --------- 左ラッパー --------- */}
                <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        {/* 60*30 */}
                        {/* <span className={`${styles.title} !min-w-[140px]`}>●面談日</span> */}
                        <div className="flex min-w-[140px] justify-start">
                          <SkeletonLoadingLineCustom h="30px" w="30px" rounded="50%" />
                        </div>
                        {/* 375*32 */}
                        {/* <input type="number" min="0" className={`${styles.input_box}`} placeholder="" value={""} /> */}
                        <SkeletonLoadingLineCustom h="30px" w="375px" rounded="6px" />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>
                </div>
                {/* --------- 右ラッパー --------- */}
                <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        {/* <span className={`${styles.title} !min-w-[140px]`}>●面談日</span> */}
                        <div className="flex min-w-[140px] justify-start">
                          <SkeletonLoadingLineCustom h="30px" w="78px" rounded="6px" />
                        </div>
                        {/* <input type="number" min="0" className={`${styles.input_box}`} placeholder="" value={""} /> */}
                        <SkeletonLoadingLineCustom h="30px" w="375px" rounded="6px" />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {Array(1)
            .fill(null)
            .map((_, index) => (
              <div key={index} className={`${styles.full_contents_wrapper} flex w-full`}>
                {/* --------- 左ラッパー --------- */}
                <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        {/* 60*30 */}
                        {/* <span className={`${styles.title} !min-w-[140px]`}>●面談日</span> */}
                        <div className="flex min-w-[140px] justify-start">
                          <SkeletonLoadingLineCustom h="30px" w="30px" rounded="50%" />
                        </div>
                        {/* 375*32 */}
                        {/* <input type="number" min="0" className={`${styles.input_box}`} placeholder="" value={""} /> */}
                        <SkeletonLoadingLineCustom h="30px" w="375px" rounded="6px" />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>
                </div>
                {/* --------- 右ラッパー --------- */}
                <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    {/* <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <div className="flex min-w-[140px] justify-start">
                          <SkeletonLoadingLineCustom h="30px" w="78px" rounded="6px" />
                        </div>
                        <SkeletonLoadingLineCustom h="30px" w="375px" rounded="6px" />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          {Array(1)
            .fill(null)
            .map((_, index) => (
              <div key={index} className={`${styles.full_contents_wrapper} flex w-full`}>
                {/* --------- 左ラッパー --------- */}
                <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}></div>
                {/* --------- 右ラッパー --------- */}
                <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    {/* <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <div className="flex min-w-[140px] justify-start">
                          <SkeletonLoadingLineCustom h="30px" w="78px" rounded="6px" />
                        </div>
                        <SkeletonLoadingLineCustom h="30px" w="375px" rounded="6px" />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          {Array(1)
            .fill(null)
            .map((_, index) => (
              <div key={index} className={`${styles.full_contents_wrapper} flex w-full`}>
                {/* --------- 左ラッパー --------- */}
                <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        {/* 60*30 */}
                        {/* <span className={`${styles.title} !min-w-[140px]`}>●面談日</span> */}
                        <div className="flex min-w-[140px] justify-start">
                          <SkeletonLoadingLineCustom h="30px" w="30px" rounded="50%" />
                        </div>
                        {/* 375*32 */}
                        {/* <input type="number" min="0" className={`${styles.input_box}`} placeholder="" value={""} /> */}
                        <SkeletonLoadingLineCustom h="30px" w="375px" rounded="6px" />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>
                </div>
                {/* --------- 右ラッパー --------- */}
                <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        {/* <span className={`${styles.title} !min-w-[140px]`}>●面談日</span> */}
                        <div className="flex min-w-[140px] justify-start">
                          <SkeletonLoadingLineCustom h="30px" w="78px" rounded="6px" />
                        </div>
                        {/* <input type="number" min="0" className={`${styles.input_box}`} placeholder="" value={""} /> */}
                        <SkeletonLoadingLineCustom h="30px" w="375px" rounded="6px" />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          {Array(1)
            .fill(null)
            .map((_, index) => (
              <div key={index} className={`${styles.full_contents_wrapper} flex w-full`}>
                {/* --------- 左ラッパー --------- */}
                <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        {/* 60*30 */}
                        {/* <span className={`${styles.title} !min-w-[140px]`}>●面談日</span> */}
                        <div className="flex min-w-[140px] justify-start">
                          <SkeletonLoadingLineCustom h="30px" w="30px" rounded="50%" />
                        </div>
                        {/* 375*32 */}
                        {/* <input type="number" min="0" className={`${styles.input_box}`} placeholder="" value={""} /> */}
                        <SkeletonLoadingLineCustom h="30px" w="375px" rounded="6px" />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>
                </div>
                {/* --------- 右ラッパー --------- */}
                <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    {/* <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center `}>
                        <div className="flex min-w-[140px] justify-start">
                          <SkeletonLoadingLineCustom h="30px" w="78px" rounded="6px" />
                        </div>
                        <SkeletonLoadingLineCustom h="30px" w="375px" rounded="6px" />
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </>
  );
};
