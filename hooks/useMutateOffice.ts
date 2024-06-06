import useDashboardStore from "@/store/useDashboardStore";
import { Office } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useMutateOffice = () => {
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  //   const setIsOpenInsertNewOfficeModal = useDashboardStore((state) => state.setIsOpenInsertNewOfficeModal);
  //   const setIsOpenUpdateOfficeModal = useDashboardStore((state) => state.setIsOpenUpdateOfficeModal);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Office新規作成INSERT用createOfficeMutation関数】
  const createOfficeMutation = useMutation(
    async (newOffice: Omit<Office, "id" | "created_at" | "target_type">) => {
      setLoadingGlobalState(true);
      const { error } = await supabase.from("offices").insert(newOffice);
      if (error) throw error;
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["offices"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d
        // https://zenn.dev/maro12/articles/ff825d35e8f776

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenInsertNewOfficeModal(false);
        toast.success("事業所・営業所の作成が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenInsertNewOfficeModal(false);
        console.error("INSERTエラー", err);
        toast.error("事業所・営業所の作成に失敗しました!");
      },
    }
  );

  // 【Office一括編集UPDATE用updateOfficeMutation関数】
  const updateOfficeMutation = useMutation(
    async (newOffice: Omit<Office, "created_at" | "target_type">) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("offices").update(newOffice).eq("id", newOffice.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["offices"] });

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateOfficeModal(false);
        toast.success("事業所・営業所の更新が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateOfficeModal(false);
        console.error("INSERTエラー", err.message);
        toast.error("事業所・営業所の更新に失敗しました!");
      },
    }
  );

  // 【Officeの個別フィールド毎に編集UPDATE用updateOfficeFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  const updateOfficeFieldMutation = useMutation(
    async (fieldData: { fieldName: string; value: any; id: string }) => {
      const { fieldName, value, id } = fieldData;
      const { data, error } = await supabase
        .from("offices")
        .update({ [fieldName]: value })
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log("updateOfficeFieldMutation実行完了 mutate data", data);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateOfficeFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        // setSelectedRowDataCompany(data[0]);

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["offices"] });
        if (loadingGlobalState) setLoadingGlobalState(false);
        toast.success("事業所・営業所の更新が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        console.error("フィールドエディットモード updateエラー", err);
        console.error(`Update failed Offices field` + err.message);
        toast.error("アップデートに失敗しました...");
      },
    }
  );

  // 【Office削除DELETE用deleteOfficeMutation関数】
  const deleteOfficeMutation = useMutation(
    async (officeId: string) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("offices").delete().match({ id: officeId });
      if (error) throw error;
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["offices"] });

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateProductModal(false);
        toast.success("事業所・営業所の削除が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateProductModal(false);
        console.log("DELETEエラー", err);
        toast.error("事業所・営業所の削除に失敗しました🙇‍♀️");
      },
    }
  );

  return {
    createOfficeMutation,
    // updateOfficeMutation,
    updateOfficeFieldMutation,
    deleteOfficeMutation,
  };
};
