// import { summary } from '@/components/GridTable/data';
// import { useInfiniteQuery } from '@tanstack/react-query';
// import React, { useEffect } from 'react'

// type TableDataType = {
//   id: number;
//   // id: string;
//   rowIndex: string;
//   name: string;
//   gender: string;
//   dob: string;
//   country: string;
//   summary: string;
// };

// export const useInfiniteQueryTestData = () => {

//     useEffect(() => {
//       // ================== 🌟疑似的なサーバーデータフェッチ用の関数🌟 ==================
//       const fetchServerPage = async (
//         limit: number,
//         offset: number = 0
//       ): Promise<{ rows: TableDataType[]; nextOffset: number }> => {
//         // useInfiniteQueryのクエリ関数で渡すlimitの個数分でIndex番号を付けたRowの配列を生成
//         const rows = new Array(limit).fill(0).map((e, index) => {
//           const newData: TableDataType = {
//             // id: uuidv4(), // indexが0から始めるので+1でidを1から始める
//             id: index + offset * limit, // indexが0から始めるので+1でidを1から始める
//             rowIndex: `${index + 2 + offset * limit}st Line`,
//             name: "John",
//             gender: "Male",
//             dob: "15-Aug-1990",
//             country: "India",
//             summary: summary,
//           };
//           return newData;
//         });

//         // 0.5秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
//         await new Promise((resolve) => setTimeout(resolve, 1000));

//         // 取得したrowsを返す（nextOffsetは、queryFnのctx.pageParamsが初回フェッチはundefinedで2回目が1のため+1でページ数と合わせる）
//         return { rows, nextOffset: offset + 1 };
//       };

//       // ================== 🌟useInfiniteQueryフック🌟 ==================
//       const { status, data, error, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
//         queryKey: ["projects"],
//         queryFn: (ctx) => {
//           console.log("ctx", ctx);
//           return fetchServerPage(35, ctx.pageParam); // 35個ずつ取得
//         },
//         getNextPageParam: (_lastGroup, groups) => groups.length,
//         staleTime: Infinity,
//       });

//       console.log("🌟useInfiniteQuery data", data);
//     }, [])

//   return {}
// }
