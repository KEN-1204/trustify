import styles from "./DatePickerCustomInput.module.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ja from "date-fns/locale/ja";
import enUS from "date-fns/locale/en-US";
import { getYear, subYears } from "date-fns";
import React, { Dispatch, FC, MouseEventHandler, SetStateAction, useRef, useState } from "react";
import useStore from "@/store";
import { range } from "lodash";
import { MdClose, MdDoNotDisturb, MdOutlineTurnedInNot } from "react-icons/md";
import { AiTwotoneCalendar } from "react-icons/ai";
import { IoIosSend } from "react-icons/io";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { CustomCalendarHeaderOnlyMonth } from "./CustomCalendarHeaderOnlyMonth";

type Props = {
  startDate: Date | null;
  //   setStartDate: (date: Date) => void;
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  required?: boolean;
  onClickSendEvent?: MouseEventHandler<HTMLDivElement>;
  btnAreaPosition?: string;
  isLoadingSendEvent?: boolean;
  handleOpenTooltip?: (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    display?: "top" | "right" | "bottom" | "left" | ""
  ) => void;
  handleCloseTooltip?: () => void;
  tooltipDataText?: string;
  fontSize?: string;
  minHeight?: string;
  px?: string;
  py?: string;
  placeholderText?: string;
};

export const DatePickerCustomInputForSettings: FC<Props> = ({
  startDate,
  setStartDate,
  required = true,
  btnAreaPosition,
  onClickSendEvent,
  isLoadingSendEvent = false,
  handleOpenTooltip,
  handleCloseTooltip,
  tooltipDataText,
  fontSize = "!text-[12px]",
  minHeight = "",
  px = "px-[8px]",
  py = "py-[4px]",
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

  return (
    <>
      {/* 🌟バツボタン */}
      {startDate && !btnAreaPosition && (
        <div className={`${styles.close_btn} `} onClick={() => setStartDate(null)}>
          <MdClose className="pointer-event-none text-[20px]" />
        </div>
      )}
      {/* 🌟カレンダーボタン アイコンクリックで日付ピッカーを表示 */}
      {!startDate && !btnAreaPosition && (
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

      {/* ========== 🌟フィールドエディットモード専用エリア 入力ボックスの右下に配置 ========== */}
      {btnAreaPosition && (
        <div
          className={`${styles.field_edit_mode_btn_area} ${
            btnAreaPosition === "right" && !isLoadingSendEvent ? styles.right_position : styles.right_position_loading
          } ${btnAreaPosition === "under_right" && styles.under_right_position} space-x-[6px]`}
        >
          {/* 送信ボタン フィールドエディットモード専用 */}
          {!isLoadingSendEvent && (
            <div
              className={`flex-center transition-bg03 group min-h-[26px] min-w-[26px] rounded-full border border-solid border-transparent ${
                required && startDate === null
                  ? `cursor-not-allowed text-[#999]`
                  : `border-[var(--color-bg-brand-f) cursor-pointer hover:bg-[var(--color-bg-brand-f)] hover:shadow-lg`
              }`}
              onClick={onClickSendEvent}
            >
              <IoIosSend
                className={`text-[20px] ${
                  required && startDate === null
                    ? `text-[#999] group-hover:text-[#999]`
                    : `text-[var(--color-bg-brand-f)] group-hover:text-[#fff]`
                }`}
              />
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

      {language === "ja" ? (
        <DatePicker
          className={`rounded border-gray-100 ${px} ${py} date_input_flag truncate text-base outline-0  ${placeholderText} ${minHeight} ${fontSize} ${styles.input_box}`}
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
          required={required}
          data-testid="commentDateInput"
          dropdownMode="select"
          //   disabled={editStatus}
          locale="ja"
          //   dateFormat="yyyy/MM/dd"
          dateFormat="M月dd日"
          renderCustomHeader={({
            date,
            // changeYear,
            changeMonth,
            decreaseMonth,
            increaseMonth,
            prevMonthButtonDisabled,
            nextMonthButtonDisabled,
          }) => (
            <CustomCalendarHeaderOnlyMonth
              date={date}
              //   changeYear={changeYear}
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
          className={`rounded border-gray-100 p-1.5 text-base outline-0 ${btnAreaPosition ? `z-[2100]` : ``}`}
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
          //   dateFormat="MM/dd/yyyy"
          dateFormat="MM/dd"
          minDate={subYears(new Date(), 10)}
        />
      )}
    </>
  );
};
