type Props = {
  fiscalYearEnd: string | Date | null;
  selectedYear?: number | null;
};

export const calculateCurrentFiscalYearEndDate = ({ fiscalYearEnd: fiscalYearEnd, selectedYear }: Props) => {
  let fiscalYearEndDate;
  if (typeof fiscalYearEnd === "string") {
    fiscalYearEndDate = new Date(fiscalYearEnd);
  } else {
    fiscalYearEndDate = fiscalYearEnd;
  }

  let currentFiscalYearEndDate;
  let fiscalYear;

  if (fiscalYearEndDate) {
    const currentDate = new Date();
    let currentYear = currentDate.getFullYear();

    if (selectedYear) {
      const selectedYearSameDate = new Date(
        selectedYear,
        currentDate.getMonth(),
        currentDate.getDate(),
        currentDate.getHours(),
        currentDate.getMinutes(),
        currentDate.getSeconds(),
        currentDate.getMilliseconds()
      );
      currentYear = selectedYearSameDate.getFullYear();
    }

    const fiscalYearEndMonth = fiscalYearEndDate.getMonth();
    const fiscalYearEndDay = fiscalYearEndDate.getDate();
    // 現在の年で月と日付は決算日のDateオブジェクトを生成
    const fiscalYearEndDateThisYear = new Date(currentYear, fiscalYearEndMonth, fiscalYearEndDay);
    // 12月末日決算の場合のみ特別なチェック*1
    // const fiscalYearEndDateDec = new Date(currentYear, 0, 0);
    const isDecemberYearEnd = fiscalYearEndDate.getMonth() === 11 && fiscalYearEndDate.getDate() === 31;

    // 決算日が現在の日付より前にある場合(つまり現在4月で3月決算の場合)、かつ、決算日が12月末日でないなら、
    // 決算日は次の年にあるため+1をする
    // 反対に現在の日付が決算日より前にある場合(つまり現在1月で3月決算の場合)は決算日は現在の年にあるのでそのままの年をセットする
    fiscalYear =
      fiscalYearEndDateThisYear.getTime() <= currentDate.getTime() && !isDecemberYearEnd
        ? currentYear + 1
        : currentYear;

    currentFiscalYearEndDate = new Date(fiscalYear, fiscalYearEndMonth, fiscalYearEndDay);
    // console.log(
    //   "現在の年度チェック",
    //   "fiscalYearEnd",
    //   fiscalYearEnd,
    //   "fiscalYearEndDateThisYear",
    //   fiscalYearEndDateThisYear,
    //   "currentDate",
    //   currentDate
    // );
  } else {
    // fiscalYear = null; // 未登録の場合はnullまたはデフォルト値
    currentFiscalYearEndDate = null; // 未登録の場合はnullまたはデフォルト値
  }

  return currentFiscalYearEndDate;
};
