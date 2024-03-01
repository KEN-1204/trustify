import { calculateCurrentFiscalYearBasisEndDay } from "./calculateCurrentFiscalYearBasisEndDay";

type Props = {
  fiscalYearEnd: string | Date | null;
  selectedYear?: number | null;
  fiscalYearBasis?: string | null;
};

// export const calculateCurrentFiscalYear = (fiscalYearEnd: string | Date | null) => {
export const calculateCurrentFiscalYear = ({ fiscalYearEnd, selectedYear, fiscalYearBasis }: Props) => {
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

  // 🔹【日本用】fiscalYearBasisがfirstDayBasisで会計年度が期首のカレンダー年を指す場合、もしくはfiscalYearBasisが渡されていない場合は、デフォルトで期首のカレンダー年を会計年度として返す *2
  if (!fiscalYearBasis || fiscalYearBasis === "firstDayBasis") {
    if (!selectedYear) {
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
        // 渡された決算日が去年の12月31日なら
        const isDecemberYearEnd = fiscalYearEndDate.getMonth() === 11 && fiscalYearEndDate.getDate() === 31;

        // 現在の日付より決算日が先にある場合(つまり現在2月で3月決算の場合)、
        // 現在は前の会計年度にいるため-1をする 12月末決算の場合、現在の年度を取得したいので12月末決算がまだ到達していない先の決算月として現在の年を返す
        fiscalYear =
          currentDate.getTime() <= currentFiscalYearEndDateThisYear.getTime() && !isDecemberYearEnd
            ? currentYear - 1
            : currentYear;

        // 通常は、期首の年度を会計年度とします。
        // 23/4/1～24/3/31 なら、23年度です。
        // 23/12/30～24/12/29 ・・２３年度です。
      } else {
        // fiscalYear = null; // 未登録の場合はnullまたはデフォルト値
        fiscalYear = new Date().getFullYear(); // 未登録の場合はnullまたはデフォルト値
      }
    } else {
      // selectedYearありルート
      if (fiscalYearEndDate) {
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

        // 12月末日決算の場合のみ特別なチェック*1
        // const fiscalYearEndDateDec = new Date(currentYear, 0, 0);
        const isDecemberYearEnd = fiscalYearEndDate.getMonth() === 11 && fiscalYearEndDate.getDate() === 31;

        // 指定された年の会計年度を取得する場合、12月31日決算以外、必ず前年度から期首が始まるので、12月末のみ指定された年を返し、それ以外は指定された年から1引いた年を会計年度として返す
        fiscalYear = isDecemberYearEnd ? selectedYear : selectedYear - 1;
      } else {
        // fiscalYear = null; // 未登録の場合はnullまたはデフォルト値
        fiscalYear = new Date().getFullYear(); // 未登録の場合はnullまたはデフォルト値
      }
    }

    return fiscalYear;
  } else {
    return calculateCurrentFiscalYearBasisEndDay({
      fiscalYearEnd: fiscalYearEnd,
      selectedYear: selectedYear,
      fiscalYearBasis: fiscalYearBasis,
    });
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
