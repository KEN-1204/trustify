import { CustomerBusinessCalendars } from "@/types";
import { formatDateToYYYYMMDD } from "./formatDateLocalToYYYYMMDD";
import { isDateWithinPeriod } from "./isDateWithinPeriod";
import { format } from "date-fns";

// 🔹ユーザーの会計年度に基づいた１年間のカレンダーベースのカレンダーを生成(全ての月を1日から末日まで)
export function generateFiscalYearCalendar(
  closingDaysData: {
    fiscal_year_month: string;
    start_date: string;
    // end_date: string;
    next_month_start_date: string;
    closing_days: CustomerBusinessCalendars[];
  }[]
  // closingDaysData: {
  //   fiscal_year_month: string; // 2024-4
  //   start_date: string; // 2024-4-1(年月度の開始日)営業日を追加する時に使用
  //   end_date: string; // 2024-5-1(翌月度の月初)営業日を追加する時に使用
  //   closing_days: CustomerBusinessCalendars[]; // 休業日の日付オブジェクトの配列
  //   closing_days_count: number; // 各月度ごとの休業日の数
  // }[]
): {
  daysCountInYear: number;
  completeAnnualFiscalCalendar: {
    fiscalYearMonth: string;
    monthlyDays: {
      date: string;
      day_of_week: number;
      status: string | null;
      timestamp: number;
      isFiscalMonthEnd: boolean;
      isOutOfFiscalYear: boolean;
    }[];
  }[];
  isSameStartMonthFiscalAndCalendar: boolean;
  fiscalYearStartDate: Date;
  fiscalYearEndDate: Date;
} | null {
  // console.time("generateFiscalYearCalendar関数");

  // 年間日数計算用
  let daysCountInYear = 0;
  // 会計期間の初日 2023-10-21
  const fiscalYearStartDate = new Date(closingDaysData[0].start_date);
  const nextFiscalYearStartDate = new Date(closingDaysData[closingDaysData.length - 1].next_month_start_date);
  // 会計期間の決算日 2024-10-20
  const fiscalYearEndDate = new Date(
    nextFiscalYearStartDate.getFullYear(),
    nextFiscalYearStartDate.getMonth(),
    nextFiscalYearStartDate.getDate() - 1,
    23,
    59,
    59,
    999
  );

  // 12ヶ月分の各配列から休業日の配列をflatMapで並列に展開して一つの配列にまとめ、
  // さらにnew SetでSetオブジェクトに変換してからhasメソッドで各日付データがSetオブジェクトないに含まれているかを高速でチェックする
  const allClosingDaysSetObj = new Set(
    closingDaysData.flatMap((data) => data.closing_days.map((closingDay) => closingDay.date))
  );

  console.log(
    "チェック nextFiscalYearStartDate",
    nextFiscalYearStartDate,
    format(nextFiscalYearStartDate, "yyyy-MM-dd HH:mm:ss"),
    "fiscalYearEndDate",
    fiscalYearEndDate,
    format(fiscalYearEndDate, "yyyy-MM-dd HH:mm:ss"),
    "fiscalYearStartDate",
    fiscalYearStartDate,
    format(fiscalYearStartDate, "yyyy-MM-dd HH:mm:ss"),
    "１年間の休業日Setオブジェクト",
    allClosingDaysSetObj
  );

  const completeAnnualFiscalCalendar = closingDaysData.map((monthData, monthIndex) => {
    // const { fiscal_year_month, closing_days, end_date } = monthData;
    const { fiscal_year_month, closing_days, next_month_start_date } = monthData;

    // 月度の開始日と終了日を取得 fiscal_year_month: 2024-4
    const year = parseInt(fiscal_year_month.split("-")[0], 10); // 2024
    const month = parseInt(fiscal_year_month.split("-")[1], 10) - 1; // 3 月は0から始まる
    // カレンダーベース 会計月度の1日から末日まで
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0); // 翌月の0日は当月の最終日なので <= 以下でループ処理
    // 会計月度の末日
    const nextMonthStartDate = new Date(next_month_start_date);
    const currentMonthEndDate = new Date(
      nextMonthStartDate.getFullYear(),
      nextMonthStartDate.getMonth(),
      nextMonthStartDate.getDate() - 1
    );

    // 月度内の全ての日付リスト
    const monthlyDays: {
      date: string;
      day_of_week: number;
      status: string | null;
      timestamp: number;
      isFiscalMonthEnd: boolean;
      isOutOfFiscalYear: boolean;
    }[] = [];
    let d = new Date(startDate);
    while (d <= endDate) {
      // const formattedDate = d.toISOString().split("T")[0]; // 日付情報のみ取得
      const formattedDateNotZeroPad = formatDateToYYYYMMDD(d); // 日付情報のみ取得
      const formattedDate = formatDateToYYYYMMDD(d, true); // 0詰め日付情報のみ取得
      const dayOfWeek = d.getDay(); //曜日
      const timestamp = d.getTime();
      // const timestamp = new Date(formattedDateNotZeroPad).getTime();
      // const isClosed = closing_days.some((cd) => cd.date === formattedDate); // 休業日かどうか
      const isClosed = allClosingDaysSetObj.has(formattedDate);
      // 月度末日かどうか
      const isFiscalMonthEnd = currentMonthEndDate.getDate() === d.getDate();
      // 会計期間内かどうか 初月と最終月のみチェック
      let isOutOfFiscalYear = false;
      if (monthIndex === 0 || monthIndex === closingDaysData.length - 1) {
        if (!isDateWithinPeriod({ targetDate: d, startDate: fiscalYearStartDate, endDate: fiscalYearEndDate }))
          isOutOfFiscalYear = true;
      }
      console.log(`🔥generateFiscalYearCalendar関数 whileループ ${fiscal_year_month} - ${d.getDate()}`);

      monthlyDays.push({
        date: formattedDateNotZeroPad,
        day_of_week: dayOfWeek,
        status: isClosed ? "closed" : null,
        timestamp: timestamp,
        isFiscalMonthEnd: isFiscalMonthEnd,
        isOutOfFiscalYear: isOutOfFiscalYear,
      }); // リスト末尾に追加
      d.setDate(d.getDate() + 1); // 翌日に更新
    }

    // 年間日数変数にmonthlyDaysの要素数を加算する
    daysCountInYear += monthlyDays.length;

    return { fiscalYearMonth: fiscal_year_month, monthlyDays: monthlyDays };
  });

  // -------------------- 先頭と後ろに合計3ヶ月分の配列を追加し15ヶ月分に変換
  // 3月20日が決算日、3月21日が期首の2024-4月度の場合、4月1日から4月30日までが生成されるので、
  // 生成された配列の先頭のfiscalYearMonth:"2023-4"の値と、closing_daysの配列の先頭のstart_dateの"2023-03-21"の値の
  // 月の部分を比較して、生成された月が元のstart_dateよりも大きい場合は、1ヶ月遡って月を生成してshiftで先頭に追加する
  // ここで遡って先頭に追加した場合、後ろに２ヶ月分を生成して追加
  // ここで先頭に追加しなかった場合には、後ろに３ヶ月分のカレンダーを追加する
  // 🔹まずは、先頭の月同士を比較する 元々のstart_dateの"2023-03-21"と、生成したfiscalYearMonth:"2023-4"を年月のみのタイムスタンプで比較
  // const fiscalStartMonth = parseInt(closingDaysData[0].start_date.split("-")[1], 10);
  // 期首の月初のカレンダー月 2023-03-21 => 03 => 3 (3/21-4/20はカレンダー3月始まり)
  const fiscalStartYearCalendar = parseInt(closingDaysData[0].start_date.split("-")[0], 10);
  const fiscalStartMonthCalendar = parseInt(closingDaysData[0].start_date.split("-")[1], 10);
  // const fiscalStartMonthDateOnly = new Date(fiscalStartYearCalendar,fiscalStartMonthCalendar, 1)
  // 2023-04 => 4 (3/21-4/20は月度は4月始まり)
  const addedFirstFiscalYear = parseInt(completeAnnualFiscalCalendar[0].fiscalYearMonth.split("-")[0], 10);
  const addedFirstFiscalMonth = parseInt(completeAnnualFiscalCalendar[0].fiscalYearMonth.split("-")[1], 10);
  // const addedFirstFiscalMonthDateOnly = new Date(addedFirstFiscalYear,addedFirstFiscalMonth, 1)
  // 会計期間の開始月とカレンダー上の開始月が一致しているか
  let isSameStartMonthFiscalAndCalendar = true;
  // if (fiscalStartMonthCalendar < fiscalFirstMonth) {
  if (!(fiscalStartYearCalendar === addedFirstFiscalYear && fiscalStartMonthCalendar === addedFirstFiscalMonth)) {
    // 🔹不一致ルート
    isSameStartMonthFiscalAndCalendar = false;
    console.log(
      "分岐 🔹生成したカレンダーの月と期首の月初日のカレンダー月が一致せず 先頭に月を追加して後ろに2ヶ月間分追加する"
    );
    // 🔹先頭に期首の月初日の月間カレンダーを追加 // カレンダーベース 会計月度の1日から末日まで
    const fiscalStartYear = parseInt(closingDaysData[0].start_date.split("-")[0], 10);
    const firstAddYearMonth0 = `${fiscalStartYear}-${fiscalStartMonthCalendar}`;
    const startDate0 = new Date(fiscalStartYear, fiscalStartMonthCalendar - 1, 1); // 月は -1
    const endDate0 = new Date(fiscalStartYear, fiscalStartMonthCalendar, 0); // 月末
    const monthlyDays0: {
      date: string;
      day_of_week: number;
      status: string | null;
      timestamp: number;
      isFiscalMonthEnd: boolean;
      isOutOfFiscalYear: boolean;
    }[] = [];
    const addObj0 = {
      addYearMonth: firstAddYearMonth0,
      startDate: startDate0,
      endDate: endDate0,
      monthlyDays: monthlyDays0,
    };
    // 🔹先頭に追加したので、残り２ヶ月分を後ろに追加
    let secondAddYear; // 末尾に追加用
    let secondAddMonth;
    let thirdAddYear;
    let thirdAddMonth;
    const lastYearMonth = completeAnnualFiscalCalendar[completeAnnualFiscalCalendar.length - 1].fiscalYearMonth;
    const lastYear = parseInt(lastYearMonth.split("-")[0], 10);
    const lastMonth = parseInt(lastYearMonth.split("-")[1], 10);
    if (lastMonth === 11) {
      secondAddYear = lastYear; // 同年
      secondAddMonth = 12; // 12月
      thirdAddYear = lastYear + 1; // 翌年
      thirdAddMonth = 1; // 1月
    } else if (lastMonth === 12) {
      secondAddYear = lastYear + 1; // 翌年
      secondAddMonth = 1; // 1月
      thirdAddYear = lastYear + 1; // 翌年
      thirdAddMonth = 2; // 2月
    } else {
      secondAddYear = lastYear; // 配列最後と同じ年
      secondAddMonth = lastMonth + 1; // 配列最後の月に+1
      thirdAddYear = lastYear;
      thirdAddMonth = lastMonth + 2;
    }

    // 末尾追加 ---------------------------------------
    // 2つ目
    const secondAddYearMonth13 = `${secondAddYear}-${secondAddMonth}`;
    const startDate13 = new Date(secondAddYear, secondAddMonth - 1, 1); // 月は -1
    const endDate13 = new Date(secondAddYear, secondAddMonth, 0); // 月末
    const monthlyDays13: {
      date: string;
      day_of_week: number;
      status: string | null;
      timestamp: number;
      isFiscalMonthEnd: boolean;
      isOutOfFiscalYear: boolean;
    }[] = [];
    const addObj13 = {
      addYearMonth: secondAddYearMonth13,
      startDate: startDate13,
      endDate: endDate13,
      monthlyDays: monthlyDays13,
    };
    // 3つ目
    const thirdAddYearMonth14 = `${thirdAddYear}-${thirdAddMonth}`;
    const startDate14 = new Date(secondAddYear, secondAddMonth - 1, 1); // 月は -1
    const endDate14 = new Date(secondAddYear, secondAddMonth, 0); // 月末
    const monthlyDays14: {
      date: string;
      day_of_week: number;
      status: string | null;
      timestamp: number;
      isFiscalMonthEnd: boolean;
      isOutOfFiscalYear: boolean;
    }[] = [];
    const addObj14 = {
      addYearMonth: thirdAddYearMonth14,
      startDate: startDate14,
      endDate: endDate14,
      monthlyDays: monthlyDays14,
    };

    const addYearMonths = [addObj0, addObj13, addObj14];

    console.log(
      "分岐ルート 🔹生成したカレンダーの月と期首の月初日のカレンダー月が一致せず 先頭に月を追加して後ろに2ヶ月間分追加する",
      "lastYearMonth",
      lastYearMonth,

      addYearMonths
    );

    // 先頭と末尾に2個追加
    addYearMonths.forEach((obj, index) => {
      const _addYearMonth = obj.addYearMonth;
      const _startDate = obj.startDate;
      const _endDate = obj.endDate;
      const _monthlyDays = obj.monthlyDays;
      let _d = new Date(_startDate);
      while (_d <= _endDate) {
        console.log(`🔥generateFiscalYearCalendar関数 先頭に追加 whileループ ${_addYearMonth} - ${_d.getDate()}`);
        // const formattedDate = d.toISOString().split("T")[0]; // 日付情報のみ取得
        const _formattedDateNotZeroPad = formatDateToYYYYMMDD(_d); // 日付情報のみ取得
        const _formattedDate = formatDateToYYYYMMDD(_d, true); // 0詰め日付情報のみ取得
        const _dayOfWeek = _d.getDay();
        const _timestamp = _d.getTime();
        const _isClosed = closingDaysData[0].closing_days.some((cd) => cd.date === _formattedDate);

        let isOutOfFiscalYear = true;
        if (index === 0) {
          // 会計期間内かどうか
          if (isDateWithinPeriod({ targetDate: _d, startDate: fiscalYearStartDate, endDate: fiscalYearEndDate })) {
            isOutOfFiscalYear = false;
          }
        }

        _monthlyDays.push({
          date: _formattedDateNotZeroPad,
          day_of_week: _dayOfWeek,
          status: _isClosed ? "closed" : null,
          timestamp: _timestamp,
          isFiscalMonthEnd: false,
          isOutOfFiscalYear: isOutOfFiscalYear,
        }); // リスト末尾に追加
        _d.setDate(_d.getDate() + 1); // 翌日に更新
        isOutOfFiscalYear = true;
      }

      const _addMonthObj = {
        fiscalYearMonth: _addYearMonth,
        monthlyDays: _monthlyDays,
      };

      if (index === 0) {
        // 先頭に開始日と同じ月の月間カレンダーを追加
        completeAnnualFiscalCalendar.unshift(_addMonthObj);
        console.log(`🔥generateFiscalYearCalendar関数 2つ目追加完了 ${_addYearMonth}`, _monthlyDays);
        // 初月追加のみ1年間の日数を加算する 年間日数変数にmonthlyDaysの要素数を加算する
        // daysCountInYear += _monthlyDays.length;
      } else {
        // 末尾にに13ヶ月目, 14ヶ月目の月間カレンダーを追加
        completeAnnualFiscalCalendar.push(_addMonthObj);

        console.log(`🔥generateFiscalYearCalendar関数 追加完了 ${_addYearMonth}`, _monthlyDays);
      }
    });
  }
  // 🔹生成したカレンダーの月と期首の月初日のカレンダー月が一致していて先頭に月を追加しなかった場合は後ろに３ヶ月間分追加する
  else {
    // 🔹一致ルート
    isSameStartMonthFiscalAndCalendar = true;

    let addYear13; // 末尾に追加用
    let addMonth13;
    let addYear14;
    let addMonth14;
    let addYear15;
    let addMonth15;
    const lastYearMonth = completeAnnualFiscalCalendar[completeAnnualFiscalCalendar.length - 1].fiscalYearMonth;
    const lastYear = parseInt(lastYearMonth.split("-")[0], 10); // 2023
    const lastMonth = parseInt(lastYearMonth.split("-")[1], 10); // 03 => 3

    console.log(
      "分岐 🔹生成したカレンダーの月と期首の月初日のカレンダー月が一致していて先頭に月を追加しなかった場合は後ろに３ヶ月間分追加する",
      "lastYearMonth",
      lastYearMonth
    );
    if (lastMonth === 10) {
      console.log("ここ通る10", lastMonth);
      addYear13 = lastYear; // 同年
      addMonth13 = 11; // 11月
      addYear14 = lastYear; // 同年
      addMonth14 = 12; // 12月
      addYear15 = lastYear + 1; // 翌年
      addMonth15 = 1; // 1月
    } else if (lastMonth === 11) {
      console.log("ここ通る11", lastMonth);
      addYear13 = lastYear; // 同年
      addMonth13 = 12; // 12月
      addYear14 = lastYear + 1; // 翌年
      addMonth14 = 1; // 1月
      addYear15 = lastYear + 1; // 翌年
      addMonth15 = 2; // 2月
    } else if (lastMonth === 12) {
      console.log("ここ通る12", lastMonth);
      addYear13 = lastYear + 1; // 翌年
      addMonth13 = 1; // 1月
      addYear14 = lastYear + 1; // 翌年
      addMonth14 = 2; // 2月
      addYear15 = lastYear + 1; // 翌年
      addMonth15 = 3; // 3月
    } else {
      console.log("ここ通るそれ以外", lastMonth);
      addYear13 = lastYear; // 配列最後と同じ年
      addMonth13 = lastMonth + 1; // 配列最後の月に+1
      addYear14 = lastYear;
      addMonth14 = lastMonth + 2;
      addYear15 = lastYear;
      addMonth15 = lastMonth + 3;
    }
    // 末尾追加 ---------------------------------------
    // 1つ目
    const addYearMonth13 = `${addYear13}-${addMonth13}`;
    const startDate13 = new Date(addYear13, addMonth13 - 1, 1); // 月は -1
    const endDate13 = new Date(addYear13, addMonth13, 0); // 月末
    const monthlyDays13: {
      date: string;
      day_of_week: number;
      status: string | null;
      timestamp: number;
      isFiscalMonthEnd: boolean;
      isOutOfFiscalYear: boolean;
    }[] = [];
    const addObj13 = {
      addYearMonth: addYearMonth13,
      startDate: startDate13,
      endDate: endDate13,
      monthlyDays: monthlyDays13,
    };
    // 2つ目
    const addYearMonth14 = `${addYear14}-${addMonth14}`;
    const startDate14 = new Date(addYear14, addMonth14 - 1, 1); // 月は -1
    const endDate14 = new Date(addYear14, addMonth14, 0); // 月末
    const monthlyDays14: {
      date: string;
      day_of_week: number;
      status: string | null;
      timestamp: number;
      isFiscalMonthEnd: boolean;
      isOutOfFiscalYear: boolean;
    }[] = [];
    const addObj14 = {
      addYearMonth: addYearMonth14,
      startDate: startDate14,
      endDate: endDate14,
      monthlyDays: monthlyDays14,
    };
    // 3つ目
    const addYearMonth15 = `${addYear15}-${addMonth15}`;
    const startDate15 = new Date(addYear15, addMonth15 - 1, 1); // 月は -1
    const endDate15 = new Date(addYear15, addMonth15, 0); // 月末
    const monthlyDays15: {
      date: string;
      day_of_week: number;
      status: string | null;
      timestamp: number;
      isFiscalMonthEnd: boolean;
      isOutOfFiscalYear: boolean;
    }[] = [];
    const addObj15 = {
      addYearMonth: addYearMonth15,
      startDate: startDate15,
      endDate: endDate15,
      monthlyDays: monthlyDays15,
    };

    const addYearMonths = [addObj13, addObj14, addObj15];

    console.log(
      "分岐ルート 🔹生成したカレンダーの月と期首の月初日のカレンダー月が一致していて先頭に月を追加しなかった場合は後ろに３ヶ月間分追加する",
      "lastYearMonth",
      lastYearMonth,

      addYearMonths
    );

    // 13,14,15個目追加
    addYearMonths.forEach((obj, index) => {
      const _addYearMonth = obj.addYearMonth;
      const _startDate = obj.startDate;
      const _endDate = obj.endDate;
      const _monthlyDays = obj.monthlyDays;
      let _d = new Date(_startDate);
      while (_d <= _endDate) {
        console.log(`🔥generateFiscalYearCalendar関数 先頭に追加 whileループ ${_addYearMonth} - ${_d.getDate()}`);
        // const formattedDate = d.toISOString().split("T")[0]; // 日付情報のみ取得
        const _formattedDateNotZeroPad = formatDateToYYYYMMDD(_d); // 日付情報のみ取得
        const _formattedDate = formatDateToYYYYMMDD(_d, true); // 0詰め日付情報のみ取得
        const _dayOfWeek = _d.getDay();
        const _timestamp = _d.getTime();
        const _isClosed = closingDaysData[0].closing_days.some((cd) => cd.date === _formattedDate);

        _monthlyDays.push({
          date: _formattedDateNotZeroPad,
          day_of_week: _dayOfWeek,
          status: _isClosed ? "closed" : null,
          timestamp: _timestamp,
          isFiscalMonthEnd: false,
          isOutOfFiscalYear: true,
        }); // リスト末尾に追加
        _d.setDate(_d.getDate() + 1); // 翌日に更新
      }

      const _pushMonthObj = {
        fiscalYearMonth: _addYearMonth,
        monthlyDays: _monthlyDays,
      };

      // 先頭に開始日と同じ月の月間カレンダーを追加
      completeAnnualFiscalCalendar.push(_pushMonthObj);

      console.log(`🔥generateFiscalYearCalendar関数 追加完了 ${_addYearMonth} - ${_monthlyDays}`);
    });
  }
  // --------------------

  const completeAnnualFiscalCalendarObj = {
    daysCountInYear: daysCountInYear,
    completeAnnualFiscalCalendar: completeAnnualFiscalCalendar,
    isSameStartMonthFiscalAndCalendar: isSameStartMonthFiscalAndCalendar,
    fiscalYearStartDate: fiscalYearStartDate,
    fiscalYearEndDate: fiscalYearEndDate,
  };

  // console.timeEnd("generateFiscalYearCalendar関数");
  return completeAnnualFiscalCalendarObj;
}
