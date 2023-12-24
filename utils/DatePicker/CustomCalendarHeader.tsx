import React, { ChangeEvent } from "react";
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from "react-icons/md";
import "react-datepicker/dist/react-datepicker.css";

interface CustomCalendarHeaderProps {
  date: Date;
  changeYear: (year: number) => void;
  changeMonth: (month: number) => void;
  decreaseMonth: () => void;
  increaseMonth: () => void;
  prevMonthButtonDisabled: boolean;
  nextMonthButtonDisabled: boolean;
}

const YEARS_FOR_DROPDOWN = 10;

export const CustomCalendarHeader: React.FC<CustomCalendarHeaderProps> = ({
  date,
  changeYear,
  changeMonth,
  decreaseMonth,
  increaseMonth,
  prevMonthButtonDisabled,
  nextMonthButtonDisabled,
}) => {
  const years = [...Array(YEARS_FOR_DROPDOWN)].map((_, i) => new Date().getFullYear() - i);

  return (
    <div className="react-datepicker__header">
      <div className="" style={{ marginBottom: "5px" }}>
        {/* <button */}
        <button
          type="button"
          className="react-datepicker__navigation react-datepicker__navigation--previous"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
        >
          <MdKeyboardDoubleArrowLeft />
        </button>
        <div className="mx-2" style={{ fontSize: "16px", marginTop: "-5px" }}>
          {date.toLocaleDateString("ja-JP", { year: "numeric", month: "long" })}
        </div>
        <button
          type="button"
          className="react-datepicker__navigation react-datepicker__navigation--next"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
        >
          <MdKeyboardDoubleArrowRight />
        </button>
      </div>

      <div className={`w-full `}>
        <button
          type="button"
          className="react-datepicker__navigation react-datepicker__navigation--previous"
          onClick={decreaseMonth}
          disabled={prevMonthButtonDisabled}
        />
        <div className="w-full space-x-4">
          <select
            value={date.getFullYear()}
            onChange={({ target: { value } }: ChangeEvent<HTMLSelectElement>) => changeYear(Number(value))}
            className="react-datepicker__year-select mr-2 mt-2"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={date.getMonth()}
            onChange={({ target: { value } }: ChangeEvent<HTMLSelectElement>) => changeMonth(Number(value))}
            className="react-datepicker__month-select"
          >
            {Array.from({ length: 12 }, (_, index) =>
              new Date(date.getFullYear(), index).toLocaleDateString("ja-JP", { month: "long" })
            ).map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="react-datepicker__navigation react-datepicker__navigation--next"
          onClick={increaseMonth}
          disabled={nextMonthButtonDisabled}
        />
      </div>
    </div>
  );
};
