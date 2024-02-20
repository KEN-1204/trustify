export const calculateCurrentFiscalYear = (fiscalYearEnd: string | Date | null) => {
  let fiscalYearEndDate;
  if (typeof fiscalYearEnd === "string") {
    fiscalYearEndDate = new Date(fiscalYearEnd);
  } else {
    fiscalYearEndDate = fiscalYearEnd;
  }

  let fiscalYear;

  if (fiscalYearEndDate) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const fiscalYearEndMonth = fiscalYearEndDate.getMonth();
    const fiscalYearEndDay = fiscalYearEndDate.getDate();
    // 現在の年で月と日付は決算日のDateオブジェクトを生成
    // const currentFiscalYearEndDateThisYear = new Date(currentYear, fiscalYearEndMonth, fiscalYearEndDay);
    const currentFiscalYearEndDateThisYear = new Date(
      currentYear,
      fiscalYearEndMonth,
      fiscalYearEndDay,
      23,
      59,
      59,
      999
    );
    // 12月末日決算の場合のみ特別なチェック*1
    // const fiscalYearEndDateDec = new Date(currentYear, 0, 0);
    const isDecemberYearEnd = fiscalYearEndDate.getMonth() === 11 && fiscalYearEndDate.getDate() === 31;

    // 現在の日付より決算日が先にある場合(つまり現在2月で3月決算の場合)、
    // 現在は前の会計年度にいるため-1をする 12月決算の場合は現在がどの日付でも前年度の12月末になるので、-1する
    fiscalYear =
      currentDate.getTime() <= currentFiscalYearEndDateThisYear.getTime() && isDecemberYearEnd
        ? currentYear - 1
        : currentYear;
    // console.log(
    //   "現在の年度チェック",
    //   "fiscalYearEnd",
    //   fiscalYearEnd,
    //   "currentFiscalYearEndDateThisYear",
    //   currentFiscalYearEndDateThisYear,
    //   "currentDate",
    //   currentDate
    // );
  } else {
    // fiscalYear = null; // 未登録の場合はnullまたはデフォルト値
    fiscalYear = new Date().getFullYear(); // 未登録の場合はnullまたはデフォルト値
  }

  return fiscalYear;
};

/**
 * *1
12月末日が決算日だった場合に関して、「fiscalYear = currentDate < currentFiscalYearEndDateThisYear ? currentYear - 1 : currentYear;」のコードだと、仮に現在が2023年12月30日で、12月31日が決算日だった場合、顧客の会計期間は2023年1月1日から2023年12月31日のはずが、「currentDate < currentFiscalYearEndDateThisYear」の部分がtrueとなり、「currentYear - 1」が実行され、取得される年が2022になってしまうため
 */

// const fiscalYear = calculateFiscalYear(userProfileState);
// console.log(fiscalYear);
