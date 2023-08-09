// //【Contactsテーブル監視用Subscribeカスタムフック】

// import { Contact } from "@/types";
// import { useSupabaseClient } from "@supabase/auth-helpers-react";
// import { useQueryClient } from "@tanstack/react-query";
// import { useEffect } from "react";
// //RealtimePayloadのデータ型

// export const useSubscribePosts = () => {
//   // queryClientを作成
//   const queryClient = useQueryClient();
// // supabaseクライアント作成
//   const supabase = useSupabaseClient()

//   useEffect(() => {
//     const channel = supabase
//     .channel('table-db-changes')
//     .on(
//         'postgres_changes',
//         {
//             event: 'INSERT',
//             scheme: 'public',
//             table: 'contacts',
//         },
//         (payload) => {
//             console.log("🌟Supabase contactsテーブルリアルタイム実行 payload", payload);
//             let previousContacts = queryClient.getQueryData<Contact[]>(['contacts'])
//         }
//     )
//   }, [])

//   useEffect(() => {
//     //【マウント時にsubscribe()を実行】監視停止removeSubscription用にsubscribe実行結果を変数に格納
//     const subsc = supabase
//       .from("posts") // 変更を監視するテーブルを指定
//       //【INSERTイベントが実行された時の処理】
//       .on("INSERT", (payload: SupabaseRealtimePayload<Post>) => {
//         let previousPosts = queryClient.getQueryData<Post[]>(["posts"]);
//         if (!previousPosts) {
//           previousPosts = [];
//         }
//         queryClient.setQueryData(
//           ["posts"], // 更新するキャッシュを指定
//           [
//             {
//               id: payload.new.id,
//               created_at: payload.new.created_at,
//               title: payload.new.title,
//               post_url: payload.new.post_url,
//               user_id: payload.new.user_id,
//               username: payload.new.username,
//               account_name: payload.new.account_name,
//             },
//             ...previousPosts,
//           ] // キャッシュに新たに作成したアイテムを追加する際に、キャッシュ配列の先頭に新たに生成するオブジェクトを配置した場合には、ブラウザ上ではアイテムを投稿した際にアイテムリスト一覧の一番上に投稿が追加される
//         );
//       })
//       //【UPDATEイベントが実行された時の処理】
//       .on("UPDATE", (payload: SupabaseRealtimePayload<Post>) => {
//         let previousPosts = queryClient.getQueryData<Post[]>(["posts"]);
//         if (!previousPosts) {
//           previousPosts = [];
//         }
//         queryClient.setQueryData(
//           ["posts"], // 更新するキャッシュを指定
//           previousPosts.map((post) =>
//             post.id === payload.new.id
//               ? {
//                   id: payload.new.id,
//                   created_at: payload.new.created_at,
//                   title: payload.new.title,
//                   post_url: payload.new.post_url,
//                   user_id: payload.new.user_id,
//                   username: payload.new.username,
//                   account_name: payload.new.account_name,
//                 }
//               : post
//           )
//         );
//       })
//       //【DELETEイベントが実行された時の処理】
//       .on("DELETE", (payload: SupabaseRealtimePayload<Post>) => {
//         let previousPosts = queryClient.getQueryData<Post[]>(["posts"]);
//         if (!previousPosts) {
//           previousPosts = [];
//         }
//         queryClient.setQueryData(
//           ["posts"], // 更新するキャッシュを指定
//           previousPosts.filter((post) => post.id !== payload.old.id)
//         );
//       })
//       .subscribe(); //【subscribe実行でマウント時にテーブル変化の監視を開始】

//     //subscribe()の変数をremoveSubscriptionに渡して監視を停止する関数を定義
//     const removeSubscription = async () => {
//       await supabase.removeSubscription(subsc);
//     };
//     // アンマウント時のクリーンアップ処理：removeSubscription関数を実行して監視を停止
//     return () => {
//       removeSubscription();
//     };
//   }, [queryClient]);
// };
