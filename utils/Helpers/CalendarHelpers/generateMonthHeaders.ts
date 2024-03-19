// 開始月を渡すと、開始月始まりの12ヶ月分の配列に変換して再生成する関数
export function generateMonthHeaders(startMonth: number) {
  console.log("🙇‍♀️startMonth", startMonth);
  const months: (
    | "January"
    | "February"
    | "March"
    | "April"
    | "May"
    | "June"
    | "July"
    | "August"
    | "September"
    | "October"
    | "November"
    | "December"
  )[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  let headers: (
    | "January"
    | "February"
    | "March"
    | "April"
    | "May"
    | "June"
    | "July"
    | "August"
    | "September"
    | "October"
    | "November"
    | "December"
  )[] = [];

  for (let i = 0; i < 12; i++) {
    let monthIndex = (startMonth - 1 + i) % 12;
    headers.push(months[monthIndex]);
  }

  return headers;
}

// 例: 会計年度が4月始まりの場合
// const headers = generateMonthHeaders(4);
// console.log(headers); // ["April", "May", ..., "March"]

/**
剰余演算子(%)は互いに正の値で被除数より除数が大きい場合にはそのまま被除数の値が結果として得られるため、(12 - 1 + 0) % 12は(11 + 0) % 12が11となり、11のインデックスがDecemberを指すため12月の12を渡した場合適切にDecember始まりになり、2回目のイテレーションでは(12 - 1 +1) % 12で12 % 12が0になるので、DecemberからJanuaryに移ってくれるということですか？　また、仮にJanuaryを渡した場合、初回イテレーションでは(1 - 1 + 0) % 12となり、0 % 12は0でJanuary始まりで、どの月を渡しても正確に1月から12月を周回するということでしょうか？
GPT
はい、まさにその通りです。剰余演算子（%）は、被除数が除数より小さい場合は被除数をそのまま結果として返します。これにより、% 12の使用は、月のインデックスを0から11の範囲内に収める効果があります。従って、startMonthにどの月（1から12のいずれか）を指定しても、適切にその月から始まる12ヶ月間のリストを生成できます。

12月始まりの場合
初回のイテレーションでは、(12 - 1 + 0) % 12 = 11となり、これは配列monthsのインデックスとして"December"を指します。
2回目のイテレーションでは、(12 - 1 + 1) % 12 = 0となり、これは"January"を指します。
これにより、正しく"December"から始まる月のリストが生成され、以降"January"へと続きます。
1月始まりの場合
初回のイテレーションでは、(1 - 1 + 0) % 12 = 0となり、これは"January"を指します。
これにより、"January"から始まる月のリストが生成されます。
この計算方法により、開始月が何であれ、正確にその月から開始して1年間（12ヶ月）を周回するリストを生成できます。この挙動はプログラミングにおいて日付や時間の計算を行う際に非常に役立ち、特に周期的なイベントや日付のリストを扱う際に有用です。

また、このアプローチはフレキシブルで汎用性が高いため、様々なシナリオでの日付計算に応用可能です。JavaScriptでの日付や時間の管理、特にグリッド表示やカレンダーなどのUIコンポーネントでの使用において、ユーザーの選択に基づいた動的な表示変更を簡単に実装することができます。
 */
