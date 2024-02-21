import { format } from "date-fns";
import { calculateCurrentFiscalYear } from "./calculateCurrentFiscalYear";

// 期首の日付を決算日から計算する関数
type Props = {
  fiscalYearEnd: Date | string | null;
  selectedYear?: number | null;
};
export const calculateFiscalYearStart = ({ fiscalYearEnd, selectedYear }: Props) => {
  if (!fiscalYearEnd) return null;
  // 決算日を設定するときにクライアントサイドで「fiscalEndDate.setHours(23, 59, 59, 999);」のようにミリ秒単位で決算日の終わりを設定してからtoISOStringでUTC時間文字列に変換してデータベースに保存しているため、
  // Supabaseデータベースから取得した決算日のUTC時間文字列を使って翌日の期首のDateオブジェクトを生成するときには、時間情報は全て0にリセットして期首のDateオブジェクトを生成する
  // まずはUTC文字列からDateオブジェクトを生成
  const fiscalYearEndDateObj = new Date(fiscalYearEnd);

  let currentFiscalYear = fiscalYearEndDateObj.getFullYear();

  if (!selectedYear) {
    // 現在の会計年度を取得(selectedYearが存在する場合は、その当時の会計年度を取得)
    currentFiscalYear = calculateCurrentFiscalYear({
      fiscalYearEnd: fiscalYearEnd,
      // selectedYear: selectedYear ?? null,
    });
  } else {
    // selectedYearありルート
    // 🔹1. 現在2024年2/21 12/20決算 会計年度2023年 (期首の年が会計年度)
    // 決算月が現在よりも先にある場合は会計年度は現在の年よりも-1
    // パターン1. 選択年が2023年なら: 2023/12/21-2024/12-20を返す

    // 🔹2. 3/20決算 現在2024年6/21 会計年度2024年
    // 決算月が現在よりも前にある場合は会計年度は現在の年と同じ
    // パターン2. 選択年が2023年なら: 2023/03/21-2024/03-20を返す

    // 🌠どちらのパターンも選択年が会計年度となるので選択年の期首起算の１年間を返す

    currentFiscalYear = selectedYear;

    const isDecemberYearEnd = fiscalYearEndDateObj.getMonth() === 11 && fiscalYearEndDateObj.getDate() === 31;
    // 選択年2023年で 12/31決算なら: 2023/01/01-2023/12/31を返すので、
    // 2022/12/31にしてDateを+1することで2023/01/01を期首に設定できるため、selectedYearを代入したyearを-1する
    if (isDecemberYearEnd) currentFiscalYear -= 1;
    console.log(
      "calculateFiscalYearStart関数 selectedYearありルート selectedYear",
      selectedYear,
      "12月末かどうか isDecemberYearEnd",
      isDecemberYearEnd,
      "引数で渡された決算日fiscalYearEnd",
      fiscalYearEnd,
      "決算日Date fiscalYearEndDateObj",
      format(fiscalYearEndDateObj, "yyyy-MM-dd HH:mm:ss"),
      "currentFiscalYear",
      currentFiscalYear
    );
  }

  // 23:59:59:999の時間情報を0:0:0:000にリセット
  const fiscalYearEndDateOnly = new Date(
    // fiscalYearEndDateObj.getFullYear(),
    currentFiscalYear,
    fiscalYearEndDateObj.getMonth(),
    fiscalYearEndDateObj.getDate()
  );
  // 期末から翌日に進めることで期首のDateオブジェクトを生成(時間情報はミリ秒単位で全て0)
  fiscalYearEndDateOnly.setDate(fiscalYearEndDateOnly.getDate() + 1);

  // console.log("🌠fiscalYearEnd", fiscalYearEnd, "fiscalYearEndDateOnly", fiscalYearEndDateOnly);

  // 月末が決算日だった場合は次の月の1日が期首になる
  return fiscalYearEndDateOnly;
};
