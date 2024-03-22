// ドル通貨にフォーマット

export function formatDollar(value: number) {
  // アメリカのロケールを使用してドルのフォーマットを作成
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return formatter.format(value);
}

// // コンポーネント内での使用例
// const MyComponent = () => {
//   const value = 1234567.89; // この値をフォーマット

//   return <div>{formatDollar(value)}</div>;
// };
