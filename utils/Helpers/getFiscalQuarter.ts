// Dateオブジェクト(Date文字列)から決算月日に応じた四半期を返す関数

import { format } from "date-fns";

type DateInput = string | Date;

// 決算月がその月の最終日であるかどうかをチェックする関数
const isLastDayOfMonth = (date: Date): boolean => {
  // 渡されたDateオブジェクトを新たにテスト用Dateオブジェクトを作成
  const testDate = new Date(date);
  // Dateオブジェクトの日付に+1を加算する
  testDate.setDate(testDate.getDate() + 1);
  // もし決算月の末日に+1して1ならそのままセットし、2日などDateオブジェクトの翌月の繰越の計算が1日にならなかった場合には、
  // falseを返して、直接1をDateにセットする
  return testDate.getDate() === 1;
};

export const getFiscalQuarter = (fiscalYearEnd: DateInput, date: DateInput): number => {
  const end = new Date(fiscalYearEnd);
  const checkDate = new Date(date);

  // 決算日が面談日を過ぎているかどうかをチェックし、適切に年を調整
  // const fiscalYear = checkDate > end ? end.getFullYear() + 1 : end.getFullYear();

  // 四半期の開始日を計算
  const quarterStartDates = [];
  for (let i = 0; i < 4; i++) {
    // const quarterStartDate = new Date(end); // 各四半期の開始日を表すために使用
    // end.getMonth()で決算月を返し、「3 * 1」を引くことで各四半期の開始月を計算
    // iが0の場合は、決算月そのものになる。iが1の場合、その四半期の開始月は決算月は３ヶ月前になる
    // quarterStartDate.setMonth(end.getMonth() - 3 * i); //第2引数（オプション）: 設定する月の日（1 から 31 までの数値）
    // quarterStartDate.setDate(end.getDate() + 1); //決算日の翌日を四半期開始日に設定
    // const quarterStartDate = new Date(fiscalYear, end.getMonth() - 3 * i, end.getDate() + 1);

    const yearAdjustment = checkDate > end ? 1 : 0;
    const quarterStartDate = new Date(end.getFullYear() + yearAdjustment, end.getMonth() - 3 * i, end.getDate() + 1);
    // 決算月の
    if (!isLastDayOfMonth(quarterStartDate)) {
    }
    // quarterStartDate.setHours(0, 0, 0, 0); //開始日の時刻を0に更新
    quarterStartDates.unshift(quarterStartDate); // 最新の四半期から配列に追加(先頭に追加)
    // quarterStartDates.push(quarterStartDate);
  }

  // 面談日がどの四半期に属するか判定
  // このループは、四半期の開始日のリスト（quarterStartDates）を順にチェックして、面談日がどの四半期に属するかを確認します。リストは最も最近の四半期の開始日から順に並んでいます（例: 12月1日、9月1日、6月1日、3月1日）。
  // for (let i = 0; i < 4; i++) {
  for (let i = 0; i < quarterStartDates.length; i++) {
    console.log(`チェック ${i}番目`);
    console.log(
      "checkDate < quarterStartDates[i]",
      format(checkDate, "yyyy年MM月dd HH:mm:ss"),
      "<",
      format(quarterStartDates[i], "yyyy年MM月dd HH:mm:ss")
    );
    if (checkDate.getTime() < quarterStartDates[i].getTime()) {
      console.log(`チェック通過 ${i}番目 第${4 - i}四半期`, format(quarterStartDates[i], "yyyy年MM月dd HH:mm:ss"));
      // return 4 - i;
      return i + 1;
    }
  }
  console.log(`チェック通らず デフォルトの1を返す`);
  return 1; // デフォルトで1Qを返す(面談日が最新の四半期以内にある場合)
};

// 使用例
// console.log(getFiscalQuarter('March 20, 2023', 'June 21, 2023')); // 1 (2Q)
// console.log(getFiscalQuarter('December 31, 2023', 'January 1, 2023')); // 1 (1Q)

/**
setMonth メソッド: setMonth メソッドは、Date オブジェクトの月を設定します。このメソッドは2つの引数を取ることができます。

第1引数: 設定する月（0 から 11 までの数値で、0 は1月、11 は12月を意味します）。
第2引数（オプション）: 設定する月の日（1 から 31 までの数値）。
 */

/**
 * 
 // 面談日がどの四半期に属するか判定
  for (let i = 0; i < 4; i++) {
    if (checkDate >= quarterStartDates[i]) {
      return 4 - i;
    }
  }
for ループ: for (let i = 0; i < 4; i++) { ... }

このループは、四半期の開始日のリスト（quarterStartDates）を順にチェックして、面談日がどの四半期に属するかを確認します。リストは最も最近の四半期の開始日から順に並んでいます（例: 12月1日、9月1日、6月1日、3月1日）。
面談日の四半期の判定: if (checkDate >= quarterStartDates[i]) { ... }

ここで、checkDate（面談日）が、ループ中の特定の四半期の開始日（quarterStartDates[i]）よりも同じかそれ以降であるかを確認します。
面談日が四半期の開始日と同じかそれ以降であれば、その四半期に属すると判断されます。
四半期の番号の返却: return 4 - i;

面談日が特定の四半期の範囲に含まれると判断された場合、その四半期の番号（1, 2, 3, 4）を返します。
四半期のリストは最新の四半期から始まるため、4 - i で四半期の番号を計算します。例えば、i = 0 の場合は最新の四半期（4Q）、i = 1 の場合はその前の四半期（3Q）というように計算されます。
このロジックにより、任意の日付が与えられた決算日の基準でどの四半期に属するかを正確に判断することができます。
 */

/**

*3
このコードの目的は、四半期の開始日が決算日より後になる場合（つまり、翌年にまたがる場合）、四半期の開始日の年を1年減らすことです。

具体例
決算日が12月31日の場合:

決算日（end）は「12月31日」です。
第1四半期の開始日を計算するとき（i = 0）、四半期の開始日（quarterStartDate）は「1月1日」に設定されます。
この場合、「1月1日」は「12月31日」より後になります（翌年の1月1日となる）。
したがって、quarterStartDate の年を1年減らす必要があります（例: 2024年1月1日を2023年1月1日に変更）。
決算日が6月20日の場合:

決算日（end）は「6月20日」です。
第1四半期の開始日を計算するとき（i = 0）、四半期の開始日（quarterStartDate）は「6月21日」に設定されます。
この場合、「6月21日」は「6月20日」より後になりますが、同じ年です。
したがって、年の調整は必要ありません。
このように、このコードは四半期の開始日が決算日より後の日付になる場合にのみ年を調整します。これにより、四半期の開始日が正確に決算日の翌日から始まるように保証されます。この調整により、四半期の開始日が常に決算日の翌日に設定され、適切な年で計算されることを確実にします。

 */

/**

*4
// 四半期の開始日の年を面談日の年に合わせる
quarterStartDates.forEach((quarterStartDate) => {
  if (quarterStartDate.getFullYear() < checkDate.getFullYear()) {
    quarterStartDate.setFullYear(checkDate.getFullYear());
  }
});

このコードは、各四半期の開始日の年が面談日の年よりも前の場合、四半期の開始日の年を面談日の年に更新します。これにより、面談日が所属する正確な四半期を判定できます。

具体例
決算日が12月31日で、面談日が翌年の2月15日の場合:

決算日（end）: 12月31日（例: 2023年）
面談日（checkDate）: 翌年の2月15日（例: 2024年）
四半期の開始日（quarterStartDates）の一つは、前年の12月31日の翌日、つまり1月1日（例: 2023年1月1日）になります。
しかし、面談日は2024年なので、この四半期の開始日は2023年ではなく2024年であるべきです。
そのため、quarterStartDate.setFullYear(checkDate.getFullYear()) を使って、四半期の開始日の年を面談日の年（2024年）に更新します。
決算日が6月20日で、面談日が同じ年の7月10日の場合:

決算日（end）: 6月20日（例: 2023年）
面談日（checkDate）: 同じ年の7月10日（例: 2023年）
この場合、四半期の開始日の一つは6月21日（例: 2023年6月21日）です。
面談日と四半期の開始日は同じ年なので、年の更新は必要ありません。
この処理により、四半期の開始日が常に面談日の年と一致するように調整され、四半期の計算が正確に行われます。

 */
