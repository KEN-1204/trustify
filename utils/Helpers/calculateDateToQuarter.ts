// // 展開日付からユーザーの財務サイクルに応じた展開四半期を取得
// // 「20231」「20232」「20233」「20234」の数値で取得して範囲検索を容易にし、ブラウザ表示ではQを末尾につける
// // 例: 面談日2023年6月20日(第一四半期) 決算月日3月20日
// const calculateDateToQuarter = (inputDateObj: Date, fiscalEndMonth: number, fiscalEndDay: number): Date => {
//   // 決算月日のDateオブジェクトを作成(今年の決算月日)
//   let inputDateYear = inputDateObj.getFullYear(); // 入力された面談日の年 2023
//   //   let currentFiscalYear: number; //ユーザーの決算年度
//   let fiscalEndDate = new Date(inputDateYear, fiscalEndMonth - 1, fiscalEndDay); // 2023/3/20

//   // 決算日が面談日より前の場合、決算日を1年後に設定 その年度の決算を過ぎることはないため
//   if (fiscalEndDate.getTime() < inputDateObj.getTime()) {
//     fiscalEndDate.setFullYear(fiscalEndDate.getFullYear() + 1);
//   }

//   // 四半期の開始日を決算月日の翌日に設定
//   const startOfFirstQuarter = new Date(fiscalEndDate);
//   // 3月20日が決算月日なら21日を四半期開始日にセット
//   startOfFirstQuarter.setDate(fiscalEndDate.getDate() + 1); //四半期開始日2023/3/21
//   startOfFirstQuarter.setHours(0, 0, 0, 0); // 時刻情報は開始日なので0時0分0秒0ミリ秒をセット

//   // 四半期ごとの終了日を計算 (年度は全て同じ)
//   const quarters = [0, 3, 6, 9].map((offset, i) => {
//     const endOfQuarter = new Date(startOfFirstQuarter);
//     let quarterMonth = startOfFirstQuarter.getMonth() + offset;
//     // 12月
//     // 🔹1回目：12 + 0 => 12(12/20) 第四四半期
//     // 🔹2回目：12 + 3 => 15 - 12 = 3(12/21~3/20)第一四半期
//     // 🔹3回目：12 + 6 => 18 - 12 = 6(6/20)第二四半期
//     // 🔹4回目：12 + 9 => 21 - 12 = 9(9/20)第三四半期

//     // 月が12以上の四半期は、年を翌年にする 四半期の開始日は締め日翌日なので、12月が四半期開始日に当たる場合、年は切り替わる
//     // それ以外の四半期は入力の面談日と同じ年
//     if (quarterMonth >= 12) {
//       quarterMonth -= 12; // 月を15 - 12 = 3に変換
//     }

//     // 四半期の開始年月日の月を起点に３が月ごとに区切って四半期の月を決定 四半期開始日3月21日 => 3月, 6月, 9月, 12月
//     endOfQuarter.setMonth(startOfFirstQuarter.getMonth() + offset);
//     // 各四半期の終了日を四半期開始日の前日に設定 四半期開始日3月21日 => 20日, 20日, 20日, 20日
//     endOfQuarter.setDate(endOfQuarter.getDate() - 1);
//     // 各四半期の終了時間をその日の終わりにセット(ミリ秒まで設定し空白の時間を作らないようにする)
//     endOfQuarter.setHours(23, 59, 59, 999);
//     // 最終的に各四半期を2023/3/20 23:59:59:999, 2023/6/20 23:59:59:999, 2023/6/20..., 2023/9/20...の配列で返す
//     return endOfQuarter;
//   });

//   // 面談日がどの四半期に含まれるかを判断
//   // input: 6月20日 => ~3/20✖️ ~6/20○ => return 6
//   // input: 6月21日 => ~3/20✖️ ~6/20✖️ ~9/20○ => return 9
//   const targetDateQuarter = quarters.findIndex((endOfQuarter) => dateObj <= endOfQuarter);
// }
