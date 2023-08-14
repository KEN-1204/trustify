import useDashboardStore from "@/store/useDashboardStore";
import { UserProfile } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation } from "@tanstack/react-query";
import React, { ChangeEvent } from "react";

export const useUploadAvatarImg = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const supabase = useSupabaseClient();

  const useMutateUploadAvatarImg = useMutation(async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      alert("画像を選択してください");
      throw new Error("Please select the image file");
    }
    const file = e.target.files[0];
    // ファイルの名前を.区切りでスプリットで分割して、一番最後の要素をpopで取り出す
    const fileExt = file.name.split(".").pop();
    // popで取り出した拡張子と前にランダムな値をつけた文字列でファイルパス名を生成
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    // supabaseのストレージに画像を登録する非同期処理
    const { error } = await supabase.storage.from("avatars").upload(filePath, file);

    if (error) throw new Error(error.message);

    const newProfile = { ...(userProfileState as UserProfile), avatar_url: filePath };
    setUserProfileState(newProfile);
  });
  return { useMutateUploadAvatarImg };
};
