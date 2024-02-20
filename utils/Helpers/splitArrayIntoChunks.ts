// 引数の配列内の要素を指定した数分取り出して小さな配列に分割する

// 15ヶ月分の要素数を持つ配列から３ヶ月分の要素数を持つ5つの配列に分割する
export function splitArrayIntoChunks(array: any[], chunkSize: number) {
  let result = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    let chunk = array.slice(i, i + chunkSize);
    result.push(chunk);
  }
  return result;
  // // 12ヶ月分の要素数を持つ配列から３ヶ月分の要素数を持つ4つの配列に分割する
  // export function splitArrayIntoChunks(array: any[], chunkSize: number) {
  //   let result = [];
  //   for (let i = 0; i < array.length; i += chunkSize) {
  //     let chunk = array.slice(i, i + chunkSize);
  //     result.push(chunk);
  //   }
  //   return result;
}

/**
// 12個の要素を持つ配列
const originalArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// 配列を3つの要素を持つ4つの配列に分割
const chunkedArray = splitArrayIntoChunks(originalArray, 3);

console.log(chunkedArray);

[
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [10, 11, 12]
]

 */
