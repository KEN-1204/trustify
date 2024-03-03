import useDashboardStore from "@/store/useDashboardStore";
import { Section } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useMutateSection = () => {
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Section新規作成INSERT用createSectionMutation関数】
  const createSectionMutation = useMutation(
    async (newSection: Omit<Section, "id" | "created_at">) => {
      setLoadingGlobalState(true);
      const { error } = await supabase.from("sections").insert(newSection);
      if (error) throw error;
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["sections"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d
        // https://zenn.dev/maro12/articles/ff825d35e8f776

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenInsertNewSectionModal(false);
        toast.success("課・セクションの作成が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenInsertNewSectionModal(false);
        console.error("INSERTエラー", err);
        toast.error("課・セクションの作成に失敗しました!");
      },
    }
  );

  // 【Section一括編集UPDATE用updateSectionMutation関数】
  const updateSectionMutation = useMutation(
    async (newSection: Omit<Section, "created_at">) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("sections").update(newSection).eq("id", newSection.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["sections"] });

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateSectionModal(false);
        toast.success("課・セクションの更新が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateSectionModal(false);
        console.error("INSERTエラー", err.message);
        toast.error("課・セクションの更新に失敗しました!");
      },
    }
  );

  // 【Sectionの個別フィールド毎に編集UPDATE用updateSectionFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  const updateSectionFieldMutation = useMutation(
    async (fieldData: { fieldName: string; value: any; id: string }) => {
      const { fieldName, value, id } = fieldData;
      const { data, error } = await supabase
        .from("sections")
        .update({ [fieldName]: value })
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log("updateSectionFieldMutation実行完了 mutate data", data);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateSectionFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        // setSelectedRowDataCompany(data[0]);

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["sections"] });
        if (loadingGlobalState) setLoadingGlobalState(false);
        toast.success("課・セクションの更新が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        console.error("フィールドエディットモード updateエラー", err);
        console.error(`Update failed sections field` + err.message);
        toast.error("アップデートに失敗しました...");
      },
    }
  );

  // 【sectionの複数フィールドを編集UPDATE用updateMultipleSectionFields関数】
  type UpdateObject = { [key: string]: any };
  const updateMultipleSectionFieldsMutation = useMutation(
    async (fieldData: { updateObject: UpdateObject; id: string }) => {
      const { updateObject, id } = fieldData;
      const { data, error } = await supabase.from("sections").update(updateObject).eq("id", id).select();

      if (error) throw error;

      console.log("updateMultipleSectionFields実行完了 mutate data", data);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateMultipleSectionFields実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );

        // sectionsに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["sections"] });
        if (loadingGlobalState) setLoadingGlobalState(false);
        toast.success("課・セクションの更新が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        console.error("フィールドエディットモード updateエラー", err);
        console.error(`Update failed section field` + err.message);
        toast.error("アップデートに失敗しました...");
      },
    }
  );

  // 【Section削除DELETE用deleteSectionMutation関数】
  const deleteSectionMutation = useMutation(
    async (sectionId: string) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("sections").delete().match({ id: sectionId });
      if (error) throw error;
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["sections"] });

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateProductModal(false);
        toast.success("課・セクションの削除が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateProductModal(false);
        console.log("DELETEエラー", err);
        toast.error("課・セクションの削除に失敗しました🙇‍♀️");
      },
    }
  );

  return {
    createSectionMutation,
    // updateSectionMutation,
    updateSectionFieldMutation,
    updateMultipleSectionFieldsMutation,
    deleteSectionMutation,
  };
};
