import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { UserProfile } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation } from "@tanstack/react-query";
import React, { ChangeEvent } from "react";
import { toast } from "react-toastify";

export const useUploadAvatarImg = () => {
  const theme = useThemeStore((state) => state.theme);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const supabase = useSupabaseClient();

  const useMutateUploadAvatarImg = useMutation(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files || e.target.files.length === 0) {
        alert("画像を選択してください");
        throw new Error("Please select the image file");
      }
      console.log("画像アップロード ", e.target.files);

      setLoadingGlobalState(true);

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

      // supabaseのデータベースに保存
      const { error: errorDB } = await supabase
        .from("profiles")
        .update({ avatar_url: filePath })
        .eq("id", userProfileState?.id);
      // .select()
      // .single();

      if (errorDB) throw new Error(errorDB.message);

      return newProfile;
    },
    {
      onSuccess: (data) => {
        setTimeout(() => {
          // Zustandを更新
          setUserProfileState(data);
          setLoadingGlobalState(false);
          toast.success("プロフィール画像の更新が完了しました!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: `${theme === "light" ? "light" : "dark"}`,
          });
        }, 500);
      },
      onError: (error: any) => {
        setTimeout(() => {
          setLoadingGlobalState(false);
          alert(error.message);
          toast.error("プロフィール画像の更新に失敗しました!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: `${theme === "light" ? "light" : "dark"}`,
          });
        }, 500);
      },
    }
  );
  const useMutateDeleteAvatarImg = useMutation(
    async (avatarUrl: string) => {
      setLoadingGlobalState(true);

      // supabaseのストレージに画像を登録する非同期処理
      const { error } = await supabase.storage.from("avatars").remove([avatarUrl]);

      if (error) throw new Error(error.message);

      // supabaseのデータベースに保存
      const { data: newProfile, error: errorDB } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", userProfileState?.id)
        .select()
        .single();

      if (errorDB) throw new Error(errorDB.message);

      return newProfile;
    },
    {
      onSuccess: (data) => {
        setTimeout(() => {
          // Zustandを更新
          setUserProfileState(data);
          setLoadingGlobalState(false);
          toast.success("プロフィール画像の削除が完了しました!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: `${theme === "light" ? "light" : "dark"}`,
          });
        }, 500);
      },
      onError: (error: any) => {
        setTimeout(() => {
          setLoadingGlobalState(false);
          alert(error.message);
          toast.error("プロフィール画像の削除に失敗しました!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: `${theme === "light" ? "light" : "dark"}`,
          });
        }, 500);
      },
    }
  );
  return { useMutateUploadAvatarImg, useMutateDeleteAvatarImg };
};
