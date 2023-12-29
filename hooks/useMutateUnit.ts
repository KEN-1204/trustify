import useDashboardStore from "@/store/useDashboardStore";
import { Unit } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useMutateUnit = () => {
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  //   const setIsOpenInsertNewDepartmentModal = useDashboardStore((state) => state.setIsOpenInsertNewDepartmentModal);
  //   const setIsOpenUpdateDepartmentModal = useDashboardStore((state) => state.setIsOpenUpdateDepartmentModal);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Department新規作成INSERT用createUnitMutation関数】
  const createUnitMutation = useMutation(
    async (newUnit: Omit<Unit, "id" | "created_at">) => {
      setLoadingGlobalState(true);
      const { error } = await supabase.from("units").insert(newUnit);
      if (error) throw error;
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["units"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d
        // https://zenn.dev/maro12/articles/ff825d35e8f776

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenInsertNewUnitModal(false);
        toast.success("係・ユニットの作成が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenInsertNewUnitModal(false);
        console.error("INSERTエラー", err);
        toast.error("係・ユニットの作成に失敗しました!");
      },
    }
  );

  // 【Department一括編集UPDATE用updateUnitMutation関数】
  const updateUnitMutation = useMutation(
    async (newDepartment: Omit<Unit, "created_at">) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("units").update(newDepartment).eq("id", newDepartment.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["units"] });

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateDepartmentModal(false);
        toast.success("係・ユニットの更新が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateDepartmentModal(false);
        console.error("INSERTエラー", err.message);
        toast.error("係・ユニットの更新に失敗しました!");
      },
    }
  );

  // 【Unitの個別フィールド毎に編集UPDATE用updateUnitFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  const updateUnitFieldMutation = useMutation(
    async (fieldData: { fieldName: string; value: any; id: string }) => {
      const { fieldName, value, id } = fieldData;
      const { data, error } = await supabase
        .from("units")
        .update({ [fieldName]: value })
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log("updateUnitFieldMutation実行完了 mutate data", data);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateUnitFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        // setSelectedRowDataCompany(data[0]);

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["units"] });
        if (loadingGlobalState) setLoadingGlobalState(false);
        toast.success("係・ユニットの更新が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        console.error("フィールドエディットモード updateエラー", err);
        console.error(`Update failed units field` + err.message);
        toast.error("アップデートに失敗しました...");
      },
    }
  );

  // 【unitの複数フィールドを編集UPDATE用updateMultipleUnitFields関数】
  // 製品分類(大分類)を変更した際に、同時に製品分類(中分類)をnullに更新する関数
  type UpdateObject = { [key: string]: any };
  const updateMultipleUnitFieldsMutation = useMutation(
    async (fieldData: { updateObject: UpdateObject; id: string }) => {
      const { updateObject, id } = fieldData;
      const { data, error } = await supabase.from("units").update(updateObject).eq("id", id).select();

      if (error) throw error;

      console.log("updateMultipleUnitFields実行完了 mutate data", data);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateMultipleUnitFields実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );

        // unitsに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["units"] });
        if (loadingGlobalState) setLoadingGlobalState(false);
        toast.success("係・ユニットの更新が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        console.error("フィールドエディットモード updateエラー", err);
        console.error(`Update failed unit field` + err.message);
        toast.error("アップデートに失敗しました...");
      },
    }
  );

  // 【Department削除DELETE用deleteUnitMutation関数】
  const deleteUnitMutation = useMutation(
    async (unitId: string) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("units").delete().match({ id: unitId });
      if (error) throw error;
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["units"] });

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateProductModal(false);
        toast.success("係・ユニットの削除が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateProductModal(false);
        console.log("DELETEエラー", err);
        toast.error("係・ユニットの削除に失敗しました🙇‍♀️");
      },
    }
  );

  return {
    createUnitMutation,
    // updateUnitMutation,
    updateUnitFieldMutation,
    updateMultipleUnitFieldsMutation,
    deleteUnitMutation,
  };
};
