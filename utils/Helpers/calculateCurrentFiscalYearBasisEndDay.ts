type Props = {
  fiscalYearEnd: string | Date | null;
  selectedYear?: number | null;
  fiscalYearBasis?: string | null;
};

// export const calculateCurrentFiscalYear = (fiscalYearEnd: string | Date | null) => {
export const calculateCurrentFiscalYearBasisEndDay = ({ fiscalYearEnd, selectedYear, fiscalYearBasis }: Props) => {
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
      console.log("calculateCurrentFiscalYearBasisEndDay🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟 currentYear + 1", currentYear + 1);
      return currentYear + 1;
    } else {
      // 2のルート 現在が決算日の前なので現在の年を返す
      console.log("calculateCurrentFiscalYearBasisEndDay🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥 currentYear", currentYear);
      return currentYear;
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
      return currentYear + 1;
    } else {
      // 2のルート 現在が決算日の前なので現在の年を返す
      return currentYear;
    }
  }
};

/**
 * *1
12月末日が決算日だった場合に関して、「fiscalYear = currentDate < currentFiscalYearEndDateThisYear ? currentYear - 1 : currentYear;」のコードだと、仮に現在が2023年12月30日で、12月31日が決算日だった場合、顧客の会計期間は2023年1月1日から2023年12月31日のはずが、「currentDate < currentFiscalYearEndDateThisYear」の部分がtrueとなり、「currentYear - 1」が実行され、取得される年が2022になってしまうため
 */

/**
*2
会計年度の日本と英語圏での慣習の違い

・日本の慣習
日本では、会計年度は期首のカレンダー年を指す。
例えば、会計年度が2023年4月1日〜2024年3月31日までの場合、会計年度を「2023年度」と呼ぶことが一般的。

・英語圏の慣習
英語圏では、会計年度は決算日のカレンダー年で表される。
つまり、会計年度が2023年4月1日〜2024年3月31日までの場合、会計年度を「Fiscal Year 2024」や「FY 2024」と呼ぶことが一般的。
 */
