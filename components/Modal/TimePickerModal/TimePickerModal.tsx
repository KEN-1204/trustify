import { Dispatch, KeyboardEvent, SetStateAction, UIEvent, memo, useMemo, useRef, useState } from "react";
import styles from "./TimePickerModal.module.css";
import { FiRefreshCw } from "react-icons/fi";
import { MdClose, MdOutlineDeleteOutline } from "react-icons/md";
import { zenkakuToHankaku } from "@/utils/Helpers/zenkakuToHankaku";

type Props = {
  incrementType: "all" | "5";
  hourState: string;
  setHourState: Dispatch<SetStateAction<string>>;
  minuteState: string;
  setMinuteState: Dispatch<SetStateAction<string>>;
  setIsOpenModal: Dispatch<SetStateAction<boolean>>;

  // スタイル
  zIndexModal?: number;
  zIndexOverlay?: number;
};

const TimePickerModalMemo = ({
  incrementType = "all",
  hourState,
  setHourState,
  minuteState,
  setMinuteState,
  setIsOpenModal,
  zIndexModal,
  zIndexOverlay,
}: Props) => {
  // 日本語のように変換、確定が存在する言語入力の場合の日本語入力の変換中を保持するstate、日本語入力開始でtrue, エンターキーで変換確定した時にfalse
  const [isComposing, setIsComposing] = useState(false);

  const optionsHour = useMemo(() => {
    let hours = [];
    for (let i = 0; i < 24; i++) {
      if (i < 10) {
        hours.push(`0${i}`);
      } else {
        hours.push(`${i}`);
      }
    }
    return hours;
  }, []);
  //   const optionsMinute = useMemo(() => {
  //     let minutes = [];
  //     for (let i = 0; i < 60; i++) {
  //       if (i < 10) {
  //         minutes.push(`0${i}`);
  //       } else {
  //         minutes.push(`${i}`);
  //       }
  //     }
  //     return minutes;
  //   }, []);

  const optionsMinute = useMemo(() => {
    let minutes = [];

    if (incrementType === "all") {
      for (let i = 0; i < 60; i++) {
        if (i < 10) {
          minutes.push(`0${i}`);
        } else {
          minutes.push(`${i}`);
        }
      }
    } else {
      for (let i = 0; i < 60; i += 5) {
        if (i < 10) {
          minutes.push(`0${i}`);
        } else {
          minutes.push(`${i}`);
        }
      }
    }

    return minutes;
  }, []);

  const hoursSet = useMemo(() => {
    return new Set([...optionsHour]);
  }, [optionsHour]);
  const minutesSet = useMemo(() => {
    return new Set([...optionsMinute]);
  }, [optionsMinute]);

  const hourRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollWrapperHourRef = useRef<HTMLDivElement | null>(null);
  const scrollWrapperMinuteRef = useRef<HTMLDivElement | null>(null);
  const inputHourRef = useRef<HTMLInputElement | null>(null);
  const inputMinuteRef = useRef<HTMLInputElement | null>(null);

  const scrollTimeoutRef = useRef<number | NodeJS.Timeout | null>(null);

  const initialHour = useMemo(() => {
    return optionsHour[0];
    // const _initialHour = parseInt(optionsHour[0], 10);
    // if (isNaN(_initialHour)) return 0;
    // return _initialHour;
  }, []);
  const initialMinute = useMemo(() => {
    return optionsMinute[0];
    // const _initialMinute = parseInt(optionsMinute[0], 10);
    // if (isNaN(_initialMinute)) return 0;
    // return _initialMinute;
  }, []);

  const [selectedHour, setSelectedHour] = useState(hourState !== "" ? hourState : initialHour);
  const [selectedMinute, setSelectedMinute] = useState(minuteState !== "" ? minuteState : initialMinute);

  // 入力前の値を保持
  // const originalHourRef = useRef(initialHour)
  // const originalMinuteRef = useRef(initialMinute)

  // 🌠スクロール終了時のみ処理を実行
  const handleScrollEnd = (e: UIEvent<HTMLDivElement, globalThis.UIEvent>, type: "hour" | "minute") => {
    // 既存のタイムアウトをクリア
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current as number | NodeJS.Timeout);
    }

    const scrollTopContainer = e.currentTarget.scrollTop;

    // スクロール停止後に発火する新しいタイムアウトを設定
    scrollTimeoutRef.current = setTimeout(() => {
      //   console.log("Scroll ended", scrollWrapperRef.current);
      const scrollWrapperRef = type === "hour" ? scrollWrapperHourRef : scrollWrapperMinuteRef;

      if (!!scrollWrapperRef.current)
        console.log("スクロールエンド", scrollWrapperRef.current.scrollTop, scrollWrapperRef.current.scrollTop % 50);

      scrollTimeoutRef.current = null; // タイマー終了後に参照をクリア

      // ここでスクロール終了時の処理を実行
      // スクロール位置が確実に50の剰余演算で余り0になる時のみ、ピッタリ中央に止まった時に処理を実行
      try {
        if (scrollWrapperRef.current && scrollWrapperRef.current.scrollTop % 50 === 0) {
          if (scrollWrapperRef.current.scrollTop === 0) {
            const targetOption = type === "hour" ? optionsHour[0] : optionsMinute[0];

            // const selectedOption = parseInt(targetOption, 10);
            // if (isNaN(selectedOption)) throw new Error(`エラー: 11 isNaN: ${selectedOption}`);

            console.log(
              "中央 最上部",
              scrollWrapperRef.current.scrollTop,
              scrollWrapperRef.current.scrollTop % 50,
              "選択",
              targetOption
              //   selectedOption,
            );

            if (type === "hour") setSelectedHour(targetOption);
            if (type === "minute") setSelectedMinute(targetOption);
          } else {
            const index = Math.round(scrollWrapperRef.current.scrollTop / 50);
            if (!Number.isInteger(index)) throw new Error(`エラー： 12 isIntegerがfalse: ${index}`);

            if (type === "hour" && !(index <= optionsHour.length - 1))
              throw new Error(`エラー： 112: ${index} ${optionsHour.length - 1}`);
            if (type === "minute" && !(index <= optionsMinute.length - 1))
              throw new Error(`エラー： 112: ${index} ${optionsMinute.length - 1}`);

            const targetOption = type === "hour" ? optionsHour[index] : optionsMinute[index];

            // const selectedOption = parseInt(targetOption, 10);
            // if (isNaN(selectedOption)) throw new Error(`エラー: 13 isNaN: ${selectedOption}`);

            console.log(
              "中央 index",
              scrollWrapperRef.current.scrollTop,
              scrollWrapperRef.current.scrollTop % 50,
              "index",
              index,
              "選択",
              targetOption
              //   selectedOption
            );

            if (type === "hour") setSelectedHour(targetOption);
            if (type === "minute") setSelectedMinute(targetOption);
          }
        }
      } catch (error: any) {
        console.error(error);
      }
    }, 150) as number | NodeJS.Timeout; // 150ミリ秒後にスクロールが終了したと判断
  };

  // 🌠最初の位置にスクロール
  const resetScrollTop = (scrollWrapper: HTMLDivElement | null, type: "hour" | "minute") => {
    if (!scrollWrapper) {
      if (type === "hour" && scrollWrapperHourRef.current)
        scrollWrapperHourRef.current.scrollTo({ top: 0, behavior: "smooth" });
      if (type === "minute" && scrollWrapperMinuteRef.current)
        scrollWrapperMinuteRef.current.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    scrollWrapper.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 🌠選択した値の位置にスクロール
  const updateScrollTop = (timeValue: string, scrollWrapper: HTMLDivElement | null, type: "hour" | "minute") => {
    if (!scrollWrapper) {
      if (type === "hour" && scrollWrapperHourRef.current) {
        alert("予期せぬエラーが発生しました。 E12");
        setSelectedHour(initialHour);
        scrollWrapperHourRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (type === "minute" && inputMinuteRef.current) {
        alert("予期せぬエラーが発生しました。 E13");
        setSelectedMinute(initialMinute);
        inputMinuteRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    const timeNum = parseInt(timeValue, 10);

    const targetTop = timeNum * 50;

    if (scrollWrapper.scrollTop === targetTop) {
      return console.log("スクロール位置同じためリターン targetTop", targetTop, type, "timeValue", timeValue);
    }
    console.log("スクロール targetTop", targetTop, type, "timeValue", timeValue);
    scrollWrapper.scrollTo({ top: targetTop, behavior: "smooth" });
  };

  // 🌠入力完了後のエンターボタンでblurを発火させて更新
  const handleKeyDownEnter = (e: KeyboardEvent<HTMLInputElement>, type: "hour" | "minute") => {
    if (e.key === "Enter" && !isComposing) {
      console.log("エンターでblur", type);
      if (type === "hour" && inputHourRef.current) {
        inputHourRef.current.blur();
      }
      if (type === "minute" && inputMinuteRef.current) {
        inputMinuteRef.current.blur();
      }
    }
  };

  // 🌠モーダルを閉じる
  const handleCloseModal = () => {
    setIsOpenModal(false);
  };

  console.log(selectedHour, selectedMinute, hourRefs, hoursSet);
  return (
    <>
      <div
        className={`${styles.overlay}`}
        style={{ ...(zIndexOverlay && { zIndex: zIndexOverlay }) }}
        onClick={handleCloseModal}
      />

      <div
        className={`${styles.select_time_modal} fade08_forward flex flex-col items-center justify-end rounded-[12px]`}
        style={{ ...(zIndexModal && { zIndex: zIndexModal }) }}
      >
        {/* クローズボタン */}
        <button
          className={`flex-center z-100 absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          onClick={handleCloseModal}
        >
          <MdClose className="pointer-events-none text-[20px] text-[#fff]" />
        </button>
        {/* クローズボタン ここまで */}
        <div className={`${styles.title_area} relative flex h-[50px] w-full items-start justify-between pt-[20px]`}>
          <div className={`h-full w-[40%]`}>
            <div className="flex  text-[22px] font-bold text-[#fff]">時間設定</div>
          </div>
          <div className={`flex h-full w-[60%] items-center justify-end space-x-[12px]`}>
            <button
              className={`flex-center transition-color03 relative max-h-[30px]  min-h-[30px] min-w-[30px] max-w-[30px] cursor-pointer space-x-1 rounded-full border border-solid border-[#666] bg-[#00000066] text-[12px] font-bold text-[#fff] hover:border-[#00d436] hover:bg-[#00d43656] active:bg-[#0d99ff]`}
              style={{ cursor: `pointer` }}
              onClick={() => {
                console.log("リフレッシュ クリック");
              }}
            >
              <FiRefreshCw className="pointer-events-none" />
            </button>

            <button
              className={`flex-center transition-color03 relative max-h-[30px]  min-h-[30px] min-w-[30px] max-w-[30px] cursor-pointer rounded-full border border-solid border-[#666] bg-[#00000066] text-[12px] font-bold text-[#fff] hover:border-[#ff3b5b] hover:bg-[#ff3b5b56] active:bg-[#0d99ff]`}
              style={{ cursor: `pointer` }}
              onClick={() => {
                console.log("リフレッシュ クリック");
              }}
            >
              {/* <MdClose className="pointer-events-none text-[18px]" /> */}
              <MdOutlineDeleteOutline className="pointer-events-none text-[16px]" />
            </button>

            <button
              className={`flex-center transition-color03 relative max-h-[30px]  min-h-[30px] cursor-pointer space-x-1  rounded-[6px] border border-solid border-[#0d99ff] bg-[#0d99ff56] px-[15px] text-[12px] font-bold text-[#fff] hover:bg-[#0d99ff] active:bg-[#0d99ff]`}
              style={{ cursor: `pointer` }}
              onClick={() => {
                console.log("リフレッシュ クリック");
              }}
            >
              <span className="pointer-events-none">保存</span>
            </button>
          </div>
        </div>

        <div
          // className={` w-full h-[95px] pt-[20px] flex items-start justify-between relative`}
          className={` relative flex h-[75px] w-full items-start justify-between pt-[0px]`}
        >
          <div className={`h-full w-[60%]`}>
            <div className="flex flex-col pt-[8px] font-bold text-[#fff]">
              {/* <span className="font-bold text-[18px]">時間設定</span> */}
              {/* <span className="min-h-[5px]"></span> */}
              <span className="mt-[6px] whitespace-pre-wrap text-[12px] text-[#bbb]">{`下記からスクロールして時間を選択するか\n右の入力ボックスから時間を入力してください`}</span>
            </div>
          </div>
          <div className={`flex h-full w-[40%] justify-end pb-[7px] pl-[0px] pt-[8px]`}>
            <div className={`${styles.input_time_container} flex h-[60px] w-[180px] p-[5px] text-[#fff]`}>
              <div className={`${styles.input_box} flex-center h-full w-[78px] rounded-[6px] bg-[#242424]`}>
                <input
                  className={`${styles.input_time}`}
                  ref={inputHourRef}
                  type="text"
                  autoFocus
                  value={selectedHour}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  onKeyDown={(e) => handleKeyDownEnter(e, "hour")}
                  onChange={(e) => {
                    const inputValue = e.target.value;

                    // 2文字以上はリターン
                    if (inputValue.length > 2) {
                      alert("2文字以上は入力できません。");
                      setSelectedHour(initialHour);
                      resetScrollTop(scrollWrapperHourRef.current, "hour");
                      return;
                    }

                    setSelectedHour(inputValue);
                  }}
                  onBlur={() => {
                    // 空文字の場合はそのまま初期値に戻す
                    if (selectedHour === "") {
                      setSelectedHour(initialHour);
                      resetScrollTop(scrollWrapperHourRef.current, "hour");
                      return;
                    }

                    const hankakuValue = zenkakuToHankaku(selectedHour);

                    const value = parseInt(hankakuValue, 10);

                    if (isNaN(value)) {
                      alert("入力可能な値は数字のみです。");
                      setSelectedHour(initialHour);
                      resetScrollTop(scrollWrapperHourRef.current, "hour");
                      return;
                    }

                    const formattedValue = value < 10 ? `0${value}` : `${value}`;

                    console.log("フォーマット", formattedValue, selectedHour);

                    if (!hoursSet.has(formattedValue)) {
                      alert("無効な値です。00時〜23時の中で入力してください。");
                      setSelectedHour(initialHour);
                      resetScrollTop(scrollWrapperHourRef.current, "hour");
                      return;
                    }

                    // フォーマット後の値で更新
                    setSelectedHour(formattedValue);

                    // 更新した時間の位置にスクロール
                    updateScrollTop(formattedValue, scrollWrapperHourRef.current, "hour");
                  }}
                />
              </div>
              <div className={`flex-center h-full w-[14px] font-bold`}>
                <span>:</span>
              </div>
              <div className={`${styles.input_box} flex-center h-full w-[78px] rounded-[6px]`}>
                <input
                  className={`${styles.input_time}`}
                  ref={inputMinuteRef}
                  type="text"
                  value={selectedMinute}
                  onCompositionStart={() => setIsComposing(true)}
                  onCompositionEnd={() => setIsComposing(false)}
                  onKeyDown={(e) => handleKeyDownEnter(e, "minute")}
                  onChange={(e) => {
                    const inputValue = e.target.value;

                    // 2文字以上はリターン
                    if (inputValue.length > 2) {
                      alert("2文字以上は入力できません。");
                      setSelectedMinute(initialMinute);
                      resetScrollTop(scrollWrapperMinuteRef.current, "minute");
                      return;
                    }

                    setSelectedMinute(inputValue);
                  }}
                  onBlur={() => {
                    // 空文字の場合はそのまま初期値に戻す
                    if (selectedMinute === "") {
                      setSelectedMinute(initialMinute);
                      resetScrollTop(scrollWrapperMinuteRef.current, "minute");
                      return;
                    }

                    const hankakuValue = zenkakuToHankaku(selectedMinute);

                    const value = parseInt(hankakuValue, 10);

                    if (isNaN(value)) {
                      alert("入力可能な値は数字のみです。");
                      setSelectedMinute(initialMinute);
                      resetScrollTop(scrollWrapperMinuteRef.current, "minute");
                      return;
                    }

                    const formattedValue = value < 10 ? `0${value}` : `${value}`;

                    console.log("フォーマット", formattedValue, selectedMinute);

                    if (!minutesSet.has(formattedValue)) {
                      alert("無効な値です。00時〜23時の中で入力してください。");
                      setSelectedMinute(initialMinute);
                      resetScrollTop(scrollWrapperMinuteRef.current, "minute");
                      return;
                    }

                    // フォーマット後の値で更新
                    setSelectedMinute(formattedValue);

                    // 更新した時間の位置にスクロール
                    updateScrollTop(formattedValue, scrollWrapperMinuteRef.current, "minute");
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div
          className={`${styles.select_time_container} flex-center relative h-[240px] w-full min-w-[450px] overflow-hidden rounded-[12px] py-[10px]`}
        >
          <div className={`${styles.shadow_top} absolute left-0 top-0 z-[100] h-[calc(50%-30px)] w-full`} />

          <div className={`relative flex h-full w-[240px] items-center justify-center`}>
            <div className={`${styles.time_scroll_container} flex h-full w-full max-w-[80px] justify-center`}>
              <div className={`${styles.shadow_top_col} absolute left-0 top-0 z-[100] h-[calc(50%-30px)] w-full`} />

              <div
                ref={scrollWrapperHourRef}
                className={`${styles.scroll_wrapper} itmes-center scrollbar-hidden flex h-full w-full snap-y snap-mandatory flex-col justify-start overflow-y-auto`}
                onScroll={(e) => {
                  handleScrollEnd(e, "hour");
                }}
              >
                {/* <div className={`w-full min-h-[35px]`}></div>
                <div className={`w-full min-h-[50px] snap-center`}></div> */}
                <div className={`min-h-[85px] w-full`}></div>
                {optionsHour.map((hour, index) => (
                  <div
                    key={`hour_${hour}`}
                    ref={(ref) => (hourRefs.current[index] = ref)}
                    className={`flex-center z-50 min-h-[50px] w-full snap-center text-[#fff]`}
                  >
                    <span>{hour}</span>
                  </div>
                ))}
                <div className={`min-h-[85px] w-full`}></div>
                {/* <div className={`w-full min-h-[50px] snap-center`}></div>
                <div className={`w-full min-h-[35px]`}></div> */}
              </div>

              <div
                className={`${styles.shadow_bottom_col} absolute bottom-0 left-0 z-[100] h-[calc(50%-30px)] w-full`}
              />
            </div>

            <div className={`flex-center h-full w-[20px] text-[#fff]`}>
              <span className="z-[100] font-bold">：</span>
            </div>

            <div className={`${styles.time_scroll_container} relative flex h-full w-full max-w-[80px] justify-center`}>
              <div className={`${styles.shadow_top_col} absolute left-0 top-0 z-[100] h-[calc(50%-30px)] w-full`} />

              <div
                ref={scrollWrapperMinuteRef}
                className={`itmes-center scrollbar-hidden flex h-full w-full snap-y snap-mandatory flex-col justify-start overflow-y-auto`}
                onScroll={(e) => {
                  handleScrollEnd(e, "minute");
                }}
              >
                {/* <div className={`w-full min-h-[35px]`}></div>
                <div className={`w-full min-h-[50px] snap-center`}></div> */}
                <div className={`min-h-[85px] w-full`}></div>
                {optionsMinute.map((minute) => (
                  <div
                    key={`minute_${minute}`}
                    className={`flex-center z-50 min-h-[50px] w-full snap-center text-[#fff]`}
                  >
                    <span>{minute}</span>
                  </div>
                ))}
                <div className={`min-h-[85px] w-full`}></div>
                {/* <div className={`w-full min-h-[50px] snap-center`}></div>
                <div className={`w-full min-h-[35px]`}></div> */}
              </div>

              <div
                className={`${styles.shadow_bottom_col} absolute bottom-0 left-0 z-[100] h-[calc(50%-30px)] w-full`}
              />
            </div>

            <div
              className={`absolute left-0 top-[50%] h-[60px] w-full translate-y-[-50%] rounded-[12px] border-[1px] border-solid border-[#0d99ff] bg-[#00000090]`}
            ></div>
          </div>

          <div className={`${styles.shadow_bottom} absolute bottom-0 left-0 z-[100] h-[calc(50%-30px)] w-full`} />
        </div>
      </div>
    </>
  );
};

export const TimePickerModal = memo(TimePickerModalMemo);
