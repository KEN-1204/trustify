import useDashboardStore from "@/store/useDashboardStore";
import { UserProfileCompanySubscription } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation } from "@tanstack/react-query";
import { ChangeEvent } from "react";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";

export const useMutateCompanySeal = () => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const supabase = useSupabaseClient();

  // 作成
  const uploadCompanySealMutation = useMutation(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (!loadingGlobalState) setLoadingGlobalState(true);

      if (!userProfileState?.company_id) {
        throw new Error("エラー：会社データが見つかりませんでした...🙇‍♀️");
      }
      if (!e.target.files || e.target.files.length === 0) {
        // ファイル選択がキャンセルされた場合
        // setLoadingGlobalState(false);
        // return;
        alert("画像を選択してください");
        throw new Error("Please select the image file");
      }
      console.log("画像アップロード ", e.target.files);

      const file = e.target.files[0];
      // ファイルの名前を.区切りでスプリットで分割して、一番最後の要素をpopで取り出す
      const fileExt = file.name.split(".").pop();
      // popで取り出した拡張子と前にランダムな値をつけた文字列でファイルパス名を生成
      //   const fileName = `${Math.random()}.${fileExt}`;
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;

      // supabaseのストレージに画像を登録する非同期処理
      const { error } = await supabase.storage.from("company_seals").upload(filePath, file);

      if (error) throw new Error(error.message);

      const newProfile = { ...(userProfileState as UserProfileCompanySubscription), customer_seal_url: filePath };

      // supabaseのデータベースに保存
      const { error: errorDB } = await supabase
        .from("companies")
        .update({ customer_seal_url: filePath })
        .eq("id", userProfileState.company_id);

      if (errorDB) throw new Error(errorDB.message);

      return newProfile;
    },
    {
      onSuccess: (data) => {
        setTimeout(() => {
          setUserProfileState(data as UserProfileCompanySubscription);
          setLoadingGlobalState(false);
          toast.success("角印画像のアップロードが完了しました!");
        }, 500);
      },
      onError: (error: any) => {
        setTimeout(() => {
          setLoadingGlobalState(false);
          alert(error.message);
          toast.error("角印画像のアップロードに失敗しました!");
        }, 500);
      },
    }
  );

  // 削除
  const deleteCompanySealMutation = useMutation(
    async (logoUrl: string) => {
      setLoadingGlobalState(true);

      if (!userProfileState?.company_id) {
        throw new Error("エラー：会社データが見つかりませんでした...🙇‍♀️");
      }

      // supabaseのストレージに画像を登録する非同期処理
      const { error } = await supabase.storage.from("customer_company_logos").remove([logoUrl]);

      if (error) throw new Error(error.message);

      const { error: errorDB } = await supabase
        .from("companies")
        .update({ customer_seal_url: null })
        .eq("id", userProfileState.company_id);

      const newProfile = { ...(userProfileState as UserProfileCompanySubscription), customer_seal_url: null };

      if (errorDB) throw new Error(errorDB.message);

      // データベースからプロフィール、会社、サブスクデータを取得
      // const { data: newProfile, errorSelectDB } = await supabase
      //   .rpc("get_user_data", { _user_id: userProfileState?.id })
      //   .single();

      // if (errorSelectDB) throw new Error(errorSelectDB.message);

      return newProfile;
    },
    {
      onSuccess: (data) => {
        setTimeout(() => {
          setUserProfileState(data);
          setLoadingGlobalState(false);
          toast.success("角印画像の削除が完了しました!");
        }, 500);
      },
      onError: (error: any) => {
        setTimeout(() => {
          setLoadingGlobalState(false);
          alert(error.message);
          toast.error("角印画像の削除に失敗しました!");
        }, 500);
      },
    }
  );
  return { uploadCompanySealMutation, deleteCompanySealMutation };
};
