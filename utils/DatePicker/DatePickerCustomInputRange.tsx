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

type TooltipParams = {
  e: React.MouseEvent<HTMLElement, MouseEvent>;
  display?: "top" | "right" | "bottom" | "left" | "";
  marginTop?: number;
  itemsPosition?: string;
  whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
  content?: string;
  content2?: string;
  content3?: string;
  content4?: string;
};

type Props = {
  minmax: "min" | "max";
  startDate: { min: Date | null; max: Date | null };
  setStartDate: Dispatch<SetStateAction<{ min: Date | null; max: Date | null } | "is not null" | "is null">>;
  required?: boolean;
  onClickSendEvent?: MouseEventHandler<HTMLDivElement>;
  handleOpenTooltip?: (TooltipParams: TooltipParams) => void;
  handleCloseTooltip?: () => void;
  fontSize?: string;
  minHeight?: string;
  sizeMin?: boolean;
  px?: string;
  py?: string;
  pr?: string;
  isShownCloseBtn?: boolean;
  placeholderText?: string;
};

export const DatePickerCustomInputRange: FC<Props> = ({
  minmax,
  startDate,
  setStartDate,
  required = true,
  onClickSendEvent,
  handleOpenTooltip,
  handleCloseTooltip,
  fontSize = "!text-[12px]",
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
    const targetParent = e.currentTarget.parentElement;
    const target = targetParent?.querySelector(`.date_input_flag`);
    (target as HTMLInputElement).focus(); // inputタグのためフォーカスで表示する

    !!handleCloseTooltip && handleCloseTooltip(); // ツールチップをクリック時に閉じる
  };

  return (
    <div className={`flex-center relative h-full w-full ${styles.date_range_container}`}>
      {/* 🌟バツボタン */}
      {minmax === "min" && startDate.min !== null && isShownCloseBtn && (
        <div className={`${styles.close_btn_area}`}>
          <div
            className={`${styles.close_btn_range}`}
            onClick={() => {
              const resetObj = {
                min: null,
                max: startDate.max,
              };
              setStartDate(resetObj);
              !!handleCloseTooltip && handleCloseTooltip();
            }}
            data-text={`日付をリセット`}
            onMouseEnter={(e) => !!handleOpenTooltip && handleOpenTooltip({ e })}
            onMouseLeave={(e) => !!handleCloseTooltip && handleCloseTooltip()}
          >
            <MdClose className="pointer-event-none text-[20px]" />
          </div>
        </div>
      )}
      {minmax === "max" && startDate.max !== null && isShownCloseBtn && (
        <div className={`${styles.close_btn_area}`}>
          <div
            className={`${styles.close_btn_range}`}
            onClick={() => {
              const resetObj = {
                min: startDate.min,
                max: null,
              };
              setStartDate(resetObj);
              !!handleCloseTooltip && handleCloseTooltip();
            }}
            data-text={`日付をリセット`}
            onMouseEnter={(e) => !!handleOpenTooltip && handleOpenTooltip({ e })}
            onMouseLeave={(e) => !!handleCloseTooltip && handleCloseTooltip()}
          >
            <MdClose className="pointer-event-none text-[20px]" />
          </div>
        </div>
      )}
      {/* 🌟カレンダーボタン アイコンクリックで日付ピッカーを表示 */}
      {!startDate && (
        <div
          className={`${styles.calendar_btn} `}
          onClick={handleOpenDatePicker}
          data-text={`カレンダーを表示して日付を選択`}
          onMouseEnter={(e) => !!handleOpenTooltip && handleOpenTooltip({ e })}
          onMouseLeave={(e) => !!handleCloseTooltip && handleCloseTooltip()}
        >
          <AiTwotoneCalendar className="pointer-event-none text-[20px]" />
        </div>
      )}

      {language === "ja" ? (
        <DatePicker
          className={`rounded border-gray-100 placeholder:text-[12px] ${px} ${py} ${pr} date_input_flag truncate text-base outline-0 ${placeholderText} ${minHeight} ${
            sizeMin ? styles.min : ``
          } ${fontSize} ${styles.input_box}`}
          wrapperClassName="react-datepicker__input-container"
          placeholderText={"日付を選択"}
          selected={minmax === "min" ? startDate.min : startDate.max}
          onChange={(date: Date) => {
            const newDate = {
              min: minmax === "min" ? date : startDate.min,
              max: minmax === "max" ? date : startDate.max,
            };
            setStartDate(newDate);
            !!handleCloseTooltip && handleCloseTooltip();
          }}
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
          selected={minmax === "min" ? startDate.min : startDate.max}
          onChange={(date: Date) => {
            const newDate = {
              min: minmax === "min" ? date : startDate.min,
              max: minmax === "max" ? date : startDate.max,
            };
            setStartDate(newDate);
            !!handleCloseTooltip && handleCloseTooltip();
          }}
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
    </div>
  );
};
