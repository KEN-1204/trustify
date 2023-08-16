import styles from "./DatePickerCustomInput.module.css";
import DatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ja from "date-fns/locale/ja";
import enUS from "date-fns/locale/en-US";
import { CustomCalendarHeader } from "./CustomCalendarHeader";
import { getYear, subYears } from "date-fns";
import React, { Dispatch, FC, SetStateAction, useState } from "react";
import useStore from "@/store";
import { range } from "lodash";
import { MdClose } from "react-icons/md";
import { AiTwotoneCalendar } from "react-icons/ai";

type Props = {
  startDate: Date | null;
  //   setStartDate: (date: Date) => void;
  setStartDate: Dispatch<SetStateAction<Date | null>>;
  required?: boolean;
};

export const DatePickerCustomInput: FC<Props> = ({ startDate, setStartDate, required = true }) => {
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
      {startDate && (
        <div className={`${styles.close_btn} text-[var(--setting-side-bg-select)]`} onClick={() => setStartDate(null)}>
          <MdClose className="text-[20px] " />
        </div>
      )}
      {!startDate && (
        <div className={`${styles.calendar_btn} `}>
          <AiTwotoneCalendar className="text-[20px] " />
        </div>
      )}
      {language === "Ja" ? (
        <DatePicker
          className={`rounded border-gray-100 p-1.5 text-base outline-0 ${styles.input_box}`}
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
          className={`rounded border-gray-100 p-1.5 text-base outline-0`}
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
