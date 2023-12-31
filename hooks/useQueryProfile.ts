//自分のプロフィールを取得するカスタムフック
//supabaseからselectでプロフィールデータを取得
//まだプロフィールを持っていないユーザーには、初期設定としてデフォルトの値でプロフィールを自動生成させる

//supabaseにログインしてるユーザーのprofileを取得しに行った時にまだプロフィールが存在しない場合にエラーstatusとして406番が返ってくるので、もし406番が返ってきたら、自動的に新しいプロフィールをデフォルトの値で生成する処理を実装する
//if文の条件で、supabaseにクエリを投げたときに、errorかつstatusが406番の場合（supabaseにプロフィールが存在しなかった場合）に、カスタムフックのプロフィール新規作成関数createProfileMutationのmutateを使ってデフォルトの値で、プロフィールを自動的に生成する処理

//stateTimeをinfinity：
//取得したprofileデータを常に最新のものと見なすようにして、一度プロフィールを作成してキャッシュにプロフィールのデータが存在するかぎり再度フェッチが行われることがなくなる。infinityにする理由は、プロフィールのデータはRLSでログインしてるユーザー自身しか更新できない仕様になっていて、さらに、自分でプロフィールを更新した場合は、useMutateProfileのupdateProfileMutationのmutateを実行した後処理のonSuccessでキャッシュの内容は常に自動で最新の状態に更新されるようにフックで設定しているので、staleTimeでinfinityにして再度プロフィールデータをフェッチをしない設定にしても、ブラウザの方に最新の情報が常に表示されているので時間設定でフェッチをする必要がない

import useStore from "@/store";
import React from "react";

export const useQueryProfile = () => {
  const sessionState = useStore((state) => state.sessionState);
};
