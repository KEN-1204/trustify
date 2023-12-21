// 決算月に使用 全角を半角、1~12月までを許容

export const validateAndFormatOnlyMonth = (month: string) => {
  // 1~12までを許容 全角は半角へ、12月の月は除去するフォーマット
  let formattedMonth;
  formattedMonth = month.replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0));

  // 「月」が含まれている場合は削除
  formattedMonth = formattedMonth.replace(/(\d+)(月)($)/g, "$1");

  // 1~12までの値のどれかに一致しているかをチェック
  const isValid =
    /^(1[0-2]|[1-9])$/.test(formattedMonth) && parseInt(formattedMonth, 10) >= 1 && parseInt(formattedMonth, 10) <= 12;

  // isValidとformattedMonthをリターン
  return { isValid, formattedMonth };
};
