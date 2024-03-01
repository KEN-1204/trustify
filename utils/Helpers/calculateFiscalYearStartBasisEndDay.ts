type Props = {
  fiscalYearEnd: string | Date | null;
  selectedYear?: number | null;
  fiscalYearBasis?: string | null;
};

// 期末を会計基準とした時の会計年度の始まりのカレンダー年
// 2023/4/1 ~ 2024/3/31 => FY 2024 期首: 2023 となるので、この2023を返す
export const calculateFiscalYearStartBasisEndDay = ({ fiscalYearEnd, selectedYear, fiscalYearBasis }: Props) => {
  let fiscalYearEndDate;
  if (typeof fiscalYearEnd === "string") {
    fiscalYearEndDate = new Date(fiscalYearEnd);
  } else if (fiscalYearEnd instanceof Date) {
    fiscalYearEndDate = fiscalYearEnd;
  } else {
    // 決算日が未指定の場合、現在の年をデフォルトとする
    return new Date().getFullYear();
  }

  let fiscalYear;

  // 🔹【英語圏用】fiscalYearBasisがendDayBasisで決算日のカレンダー年を会計年度の基準とする場合、決算日のカレンダー年を返す
  // 選択中の年が存在しない場合
  if (!selectedYear) {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();

    // 決算日を現在の年の同じ月日で設定
    const currentFiscalYearEndDateThisYear = new Date(
      currentYear,
      fiscalYearEndDate.getMonth(),
      fiscalYearEndDate.getDate(),
      23,
      59,
      59,
      999
    );

    // 現在の日付がこの年の決算日を過ぎている場合、会計年度は現在のカレンダー年
    // 例）1. 現在の日付が決算日を過ぎている場合は、例えば、決算日が2023/3/31で、現在が2023/4/20だった場合FY 2024が会計年度で現在のカレンダー年に+1する
    //    2. 反対に、決算日が2023/3/31で、現在が2023/3/20だった場合、FY 2023となるため現在のカレンダー年を返す
    // 🌟決算日を超えている場合は、1のルートのため現在の年に+1した年を会計年度として返す
    if (currentFiscalYearEndDateThisYear.getTime() < currentDate.getTime()) {
      console.log(
        "calculateFiscalYearStartBasisEndDay🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 期末が会計年度の基準の時の期首を返す 2023/4/1 ~ 2024/3/31 => FY 2024 期首: 2023 現在2024/5/20 で決算日を超えているタイミングではその時のカレンダー年が期首なのでそのまま返す currentYear",
        currentYear + 1
      );
      return currentYear;
    } else {
      // 2のルート 現在が決算日の前なので現在の年を返す
      console.log(
        "calculateFiscalYearStartBasisEndDay🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥期末が会計年度の基準の時の期首を返す 2023/4/1 ~ 2024/3/31 => FY 2024 期首: 2023 現在2024/5/20 で決算日を超えていない、先にあるタイミングではその時の年の前年のカレンダー年が期首なので-1して返す currentYear - 1",
        currentYear
      );
      return currentYear - 1;
    }
  } else {
    // 🔹selectedYearありルート(英語圏用 決算日のカレンダー年が会計年度)
    let currentDate = new Date();

    currentDate = new Date(
      selectedYear,
      currentDate.getMonth(),
      currentDate.getDate(),
      currentDate.getHours(),
      currentDate.getMinutes(),
      currentDate.getSeconds(),
      currentDate.getMilliseconds()
    );

    const currentYear = currentDate.getFullYear();

    // 決算日を現在の年の同じ月日で設定
    const currentFiscalYearEndDateThisYear = new Date(
      currentYear,
      fiscalYearEndDate.getMonth(),
      fiscalYearEndDate.getDate(),
      23,
      59,
      59,
      999
    );

    // 現在の日付がこの年の決算日を過ぎている場合、会計年度は現在のカレンダー年
    // 例）1. 現在の日付が決算日を過ぎている場合は、例えば、決算日が2023/3/31で、現在が2023/4/20だった場合FY 2024が会計年度で現在のカレンダー年に+1する
    //    2. 反対に、決算日が2023/3/31で、現在が2023/3/20だった場合、FY 2023となるため現在のカレンダー年を返す
    // 🌟決算日を超えている場合は、1のルートのため現在の年に+1した年を会計年度として返す
    if (currentFiscalYearEndDateThisYear.getTime() < currentDate.getTime()) {
      return currentYear;
    } else {
      // 2のルート 現在が決算日の前なので現在の年を返す
      return currentYear - 1;
    }
  }
};
