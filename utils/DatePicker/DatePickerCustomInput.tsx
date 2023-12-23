import styles from "./DatePickerCustomInput.module.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ja from "date-fns/locale/ja";
import enUS from "date-fns/locale/en-US";
import { CustomCalendarHeader } from "./CustomCalendarHeader";
import { getYear, subYears } from "date-fns";
import React, { Dispatch, FC, MouseEventHandler, SetStateAction, useState } from "react";
import useStore from "@/store";
import { range } from "lodash";
import { MdClose } from "react-icons/md";
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
  fontSize?: string;
  minHeight?: string;
  px?: string;
  py?: string;
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
  fontSize = "!text-[12px]",
  minHeight = "",
  px = "px-[8px]",
  py = "py-[4px]",
  placeholderText = "placeholder:text-[12px]",
}) => {
  const language = useStore((state) => state.language);
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
  return (
    <>
      {/* バツボタン */}
      {startDate && !isFieldEditMode && (
        <div className={`${styles.close_btn} `} onClick={() => setStartDate(null)}>
          <MdClose className="text-[20px] " />
        </div>
      )}
      {/* カレンダーボタン */}
      {!startDate && (
        <div className={`${styles.calendar_btn} `}>
          <AiTwotoneCalendar className="text-[20px] " />
        </div>
      )}
      {/* フィールドエディットモード専用エリア 入力ボックスの右下に配置 */}
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
          className={`rounded border-gray-100 ${px} ${py}  truncate text-base outline-0 ${placeholderText}  ${minHeight} ${fontSize} ${styles.input_box}`}
          wrapperClassName="react-datepicker__input-container"
          placeholderText={"日付を選択"}
          selected={startDate}
          onChange={(date: Date) => setStartDate(date)}
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
          className={`rounded border-gray-100 p-1.5 text-base outline-0 ${isFieldEditMode ? `z-[2100]` : ``}`}
          placeholderText={"Please select date"}
          selected={startDate}
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
