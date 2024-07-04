import styles from "./DatePickerCustomInput.module.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ja from "date-fns/locale/ja";
import enUS from "date-fns/locale/en-US";
import { CustomCalendarHeader } from "./CustomCalendarHeader";
import { getYear, subYears } from "date-fns";
import React, { Dispatch, FC, MouseEventHandler, SetStateAction, useRef, useState } from "react";
import useStore from "@/store";
import { range } from "lodash";
import { MdClose, MdDoNotDisturb, MdOutlineTurnedInNot } from "react-icons/md";
import { AiTwotoneCalendar } from "react-icons/ai";
import { IoIosSend } from "react-icons/io";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";

type Props = {
  startDate: Date | null;
  //   setStartDate: (date: Date) => void;
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  required?: boolean;
  isFieldEditMode?: boolean;
  fieldEditModeBtnAreaPosition?: string;
  onClickSendEvent?: MouseEventHandler<HTMLDivElement>;
  isLoadingSendEvent?: boolean;
  isNotNullForSearch?: boolean;
  handleOpenTooltip?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    display?: "top" | "right" | "bottom" | "left" | ""
  ) => void;
  handleCloseTooltip?: () => void;
  tooltipDataText?: string;
  fontSize?: string;
  minHeight?: string;
  sizeMin?: boolean;
  px?: string;
  py?: string;
  pr?: string;
  isShownCloseBtn?: boolean;
  placeholderText?: string;
};

export const DatePickerCustomInput: FC<Props> = ({
  startDate,
  setStartDate,
  required = true,
  isFieldEditMode = false,
  fieldEditModeBtnAreaPosition = "right",
  onClickSendEvent,
  isLoadingSendEvent = false,
  isNotNullForSearch = false,
  handleOpenTooltip,
  handleCloseTooltip,
  tooltipDataText,
  // fontSize = "!text-[12px]",
  fontSize = "!text-[14px]",
  minHeight = "",
  sizeMin = false,
  px = "px-[8px]",
  py = "py-[4px]",
  pr,
  isShownCloseBtn = true,
  placeholderText = "placeholder:text-[12px]",
}) => {
  const language = useStore((state) => state.language);
  // const [isNullForSearch, setIsNullForSearch] = useState(false);
  //   const [startDate, setStartDate] = useState(new Date());
  const years = range(1990, getYear(new Date()) + 1, 1);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  registerLocale("ja", ja);
  registerLocale("en", enUS);

  // // プレイスホルダー文字
  // const getPlaceholderText = () => {
  //   if (startDate === "is not null") return "フォロー予定有りのみ";
  //   if (startDate === "is null") return "フォロー予定無しのみ";
  //   return `日付を選択`;
  // };

  // カレンダーアイコンをクリックして日付ピッカーを表示する関数(通常はinputタグをフォーカスして表示)
  const handleOpenDatePicker = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // const target = targetParent?.querySelector(`[data-testid="commentDateInput"]`);
    // const target = targetParent?.querySelector(`.react-datepicker__input-container`);
    const targetParent = e.currentTarget.parentElement;
    const target = targetParent?.querySelector(`.date_input_flag`);
    console.log(e);
    console.log(targetParent);
    console.log(target);
    // (target as HTMLElement).click(); // クリックイベントでも日付ピッカーは表示される
    (target as HTMLInputElement).focus(); // inputタグのためフォーカスで表示する

    // if (isNullForSearch) setIsNullForSearch(false); // is nullでは無いためfalseに切り替え
    !!handleCloseTooltip && handleCloseTooltip(); // ツールチップをクリック時に閉じる
  };
  // カレンダーアイコンをクリックして日付ピッカーを表示する関数(通常はinputタグをフォーカスして表示)
  const handleSetIsNotNull = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    // const target = targetParent?.querySelector(`[data-testid="commentDateInput"]`);
    // const target = targetParent?.querySelector(`.react-datepicker__input-container`);
    const targetParent = e.currentTarget.parentElement;
    const target = targetParent?.querySelector(`.date_input_flag`);
    console.log(e);
    console.log(targetParent);
    console.log(target);

    (target as HTMLInputElement).blur(); // inputタグのフォーカスを切る
    // setStartDate("is not null");
    // if (isNullForSearch) setIsNullForSearch(false); // is nullでは無いためfalseに切り替え
    !!handleCloseTooltip && handleCloseTooltip(); // ツールチップをクリック時に閉じる
  };

  // is null設定用関数 サーチ用
  const handleSetIsNullForSearch = () => {
    // setStartDate("is null");
    // setIsNullForSearch(true);
    !!handleCloseTooltip && handleCloseTooltip(); // ツールチップをクリック時に閉じる
  };
  return (
    <>
      {/* 🌟バツボタン */}
      {startDate && !isFieldEditMode && isShownCloseBtn && (
        <div className={`${styles.close_btn} `} onClick={() => setStartDate(null)}>
          <MdClose className="pointer-event-none text-[20px]" />
        </div>
      )}
      {/* 🌟カレンダーボタン アイコンクリックで日付ピッカーを表示 */}
      {!startDate && (
        <div
          className={`${styles.calendar_btn} `}
          // onClick={(e) => console.log(e)}
          onClick={handleOpenDatePicker}
          data-text={`特定の日付を選択して検索します。`}
          onMouseEnter={(e) => !!handleOpenTooltip && handleOpenTooltip(e)}
          onMouseLeave={(e) => !!handleCloseTooltip && handleCloseTooltip()}
        >
          <AiTwotoneCalendar className="pointer-event-none text-[20px]" />
        </div>
      )}
      {/* 🌟サーチ用「is not null」設定アイコン 次回フォロー予定日ありのデータのみサーチ */}
      {isNotNullForSearch && !startDate && !isFieldEditMode && (
        <div
          className={`${styles.is_not_null_for_search}`}
          onClick={handleSetIsNotNull}
          // data-text={`次回フォロー予定が`}
          data-text={`${
            tooltipDataText
              ? `${tooltipDataText}があるデータのみ検索します。`
              : `この項目が存在するデータのみ検索します。`
          }`}
          onMouseEnter={(e) => !!handleOpenTooltip && handleOpenTooltip(e)}
          onMouseLeave={(e) => !!handleCloseTooltip && handleCloseTooltip()}
        >
          <MdOutlineTurnedInNot className="pointer-event-none text-[20px]" />
        </div>
      )}
      {/* 🌟サーチ用「is null」設定アイコン 次回フォロー予定日なしのデータのみサーチ */}
      {isNotNullForSearch && !startDate && !isFieldEditMode && (
        <div
          className={`${styles.is_null_for_search}`}
          onClick={handleSetIsNullForSearch}
          data-text={`${
            tooltipDataText
              ? `${tooltipDataText}が無いデータのみ検索します。`
              : `この項目が存在しないデータのみ検索します。`
          }`}
          onMouseEnter={(e) => !!handleOpenTooltip && handleOpenTooltip(e)}
          onMouseLeave={(e) => !!handleCloseTooltip && handleCloseTooltip()}
        >
          <MdDoNotDisturb className="pointer-event-none text-[20px]" />
        </div>
      )}

      {/* ========== 🌟フィールドエディットモード専用エリア 入力ボックスの右下に配置 ========== */}
      {/* {startDate && isFieldEditMode && ( */}
      {isFieldEditMode && (
        <div
          className={`${styles.field_edit_mode_btn_area} ${
            fieldEditModeBtnAreaPosition === "right" && !isLoadingSendEvent
              ? styles.right_position
              : styles.right_position_loading
          } ${fieldEditModeBtnAreaPosition === "under_right" && styles.under_right_position} space-x-[6px]`}
        >
          {/* 送信ボタン フィールドエディットモード専用 */}
          {!isLoadingSendEvent && (
            <div
              className={`flex-center transition-bg03 group min-h-[26px] min-w-[26px] rounded-full border border-solid border-transparent ${
                required && startDate === null
                  ? `cursor-not-allowed text-[#999]`
                  : `border-[var(--color-bg-brand-f) cursor-pointer text-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f)] hover:text-[#fff] hover:shadow-lg`
              }`}
              onClick={onClickSendEvent}
            >
              <IoIosSend className={`text-[20px]`} />
            </div>
          )}
          {/* バツボタン フィールドエディットモード専用 */}
          {!isLoadingSendEvent && (
            <div
              className={`${
                startDate
                  ? `${styles.close_btn_field_edit_mode} hover:shadow-lg`
                  : `${styles.close_btn_field_edit_mode_empty}`
              }`}
              onClick={() => {
                if (!startDate) return;
                setStartDate(null);
              }}
            >
              <MdClose className="text-[20px] " />
            </div>
          )}
          {/* ローディング フィールドエディットモード専用 */}
          {isLoadingSendEvent && (
            <div className={`${styles.field_edit_mode_loading_area}`}>
              <SpinnerComet w="22px" h="22px" s="3px" />
            </div>
          )}
        </div>
      )}
      {/* バツボタン フィールドエディットモード専用 */}
      {/* {startDate && isFieldEditMode && (
        <div className={`${styles.close_btn} `} onClick={() => setStartDate(null)}>
          <MdClose className="text-[20px] " />
        </div>
      )} */}
      {/* 送信ボタン フィールドエディットモード専用 */}
      {/* {startDate && isFieldEditMode && (
        <div
          className={`flex-center transition-bg03 border-[var(--color-bg-brand-f) group absolute right-[36px] top-[calc(50%-2.5px)] z-[2100] min-h-[26px] min-w-[26px] translate-y-[-50%] cursor-pointer rounded-full border border-solid border-transparent hover:bg-[var(--color-bg-brand-f)] hover:shadow-lg`}
          onClick={onClickSendEvent}
        >
          <IoIosSend className={`text-[20px] text-[var(--color-bg-brand-f)] group-hover:text-[#fff] `} />
        </div>
      )} */}

      {language === "ja" ? (
        <DatePicker
          className={`rounded border-gray-100 ${px} ${py} ${pr} date_input_flag truncate text-base outline-0 ${placeholderText} ${minHeight} ${
            sizeMin ? styles.min : ``
          } ${fontSize} ${styles.input_box}`}
          wrapperClassName="react-datepicker__input-container"
          placeholderText={"日付を選択"}
          // placeholderText={`${startDate === "is not null" ? "フォロー予定有りのみ" : `日付を選択`}`}
          // placeholderText={getPlaceholderText()}
          selected={startDate}
          // selected={startDate instanceof Date ? startDate : null}
          onChange={(date: Date) => setStartDate(date)}
          // onChange={(date: Date) => {
          //   console.log(
          //     "date",
          //     date,
          //     'typeof date === "string"',
          //     typeof date === "string",
          //     "date instanceof Date",
          //     date instanceof Date
          //   );
          //   setStartDate(date);
          // }}
          //   selected={inputComment.date ? new Date(inputComment.date) : null}
          //   onChange={(date) =>
          //     setInputComment({
          //       ...inputComment,
          //       date: date ? date.toISOString().substring(0, 10) : null,
          //     })
          //   }
          required={required}
          data-testid="commentDateInput"
          dropdownMode="select"
          //   disabled={editStatus}
          locale="ja"
          dateFormat="yyyy/MM/dd"
          renderCustomHeader={({
            date,
            changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <CustomCalendarHeader
              date={date}
              changeYear={changeYear}
              changeMonth={changeMonth}
              decreaseMonth={decreaseMonth}
              increaseMonth={increaseMonth}
              prevMonthButtonDisabled={prevMonthButtonDisabled}
              nextMonthButtonDisabled={nextMonthButtonDisabled}
            />
          )}
        />
      ) : (
        <DatePicker
          // className={`rounded border-gray-100 p-1.5 text-base outline-0 ${isFieldEditMode ? `z-[2100]` : ``}`}
          className={`rounded border-gray-100 ${px} ${py} ${pr} date_input_flag truncate text-base outline-0 ${placeholderText} ${minHeight} ${fontSize} ${styles.input_box}`}
          placeholderText={"Please select date"}
          selected={startDate}
          // selected={startDate instanceof Date ? startDate : null}
          onChange={(date: Date) => setStartDate(date)}
          //   selected={inputComment.date ? new Date(inputComment.date) : null}
          //   onChange={(date) =>
          //     setInputComment({
          //       ...inputComment,
          //       date: date ? date.toISOString().substring(0, 10) : null,
          //     })
          //   }
          required
          data-testid="commentDateInput"
          peekNextMonth
          showMonthDropdown
          showYearDropdown
          dropdownMode="select"
          //   disabled={editStatus}
          locale="en"
          dateFormat="MM/dd/yyyy"
          minDate={subYears(new Date(), 10)}
        />
      )}
    </>
  );
};
