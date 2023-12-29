import useDashboardStore from "@/store/useDashboardStore";
import { Department } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

type insertPayload = {
  _company_id_arg: string;
  _department_name_arg: string;
};

export const useMutateDepartment = () => {
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  //   const setIsOpenInsertNewDepartmentModal = useDashboardStore((state) => state.setIsOpenInsertNewDepartmentModal);
  //   const setIsOpenUpdateDepartmentModal = useDashboardStore((state) => state.setIsOpenUpdateDepartmentModal);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Department新規作成INSERT用createDepartmentMutation関数】
  const createDepartmentMutation = useMutation(
    async (newDepartment: Omit<Department, "id" | "created_at">) => {
      // async (newDepartment: insertPayload) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("departments").insert(newDepartment);
      // const { error } = await supabase.rpc(`insert_department`, newDepartment);
      if (error) throw error;
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["departments"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d
        // https://zenn.dev/maro12/articles/ff825d35e8f776

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenInsertNewDepartmentModal(false);
        toast.success("事業部の作成が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenInsertNewDepartmentModal(false);
        console.error("INSERTエラー", err);
        toast.error("事業部の作成に失敗しました!");
      },
    }
  );

  // 【Department一括編集UPDATE用updateDepartmentMutation関数】
  // const updateDepartmentMutation = useMutation(
  //   async (newDepartment: Omit<Department, "created_at">) => {
  //     // setLoadingGlobalState(true);
  //     const { error } = await supabase.from("departments").update(newDepartment).eq("id", newDepartment.id);
  //     if (error) throw new Error(error.message);
  //   },
  //   {
  //     onSuccess: async () => {
  //       // キャッシュのデータを再取得
  //       await queryClient.invalidateQueries({ queryKey: ["departments"] });

  //       if (loadingGlobalState) setLoadingGlobalState(false);
  //       // setIsOpenUpdateDepartmentModal(false);
  //       toast.success("事業部の更新が完了しました🌟");
  //     },
  //     onError: (err: any) => {
  //       if (loadingGlobalState) setLoadingGlobalState(false);
  //       // setIsOpenUpdateDepartmentModal(false);
  //       console.error("INSERTエラー", err.message);
  //       toast.error("事業部の更新に失敗しました!");
  //     },
  //   }
  // );

  // 【Departmentの個別フィールド毎に編集UPDATE用updateDepartmentFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  const updateDepartmentFieldMutation = useMutation(
    async (fieldData: { fieldName: string; value: any; id: string }) => {
      const { fieldName, value, id } = fieldData;
      const { data, error } = await supabase
        .from("departments")
        .update({ [fieldName]: value })
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log("updateDepartmentFieldMutation実行完了 mutate data", data);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateDepartmentFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        // setSelectedRowDataCompany(data[0]);

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["departments"] });
        if (loadingGlobalState) setLoadingGlobalState(false);
        toast.success("事業部の更新が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        console.error("フィールドエディットモード updateエラー", err);
        console.error(`Update failed departments field` + err.message);
        toast.error("アップデートに失敗しました...");
      },
    }
  );

  // 【Department削除DELETE用deleteDepartmentMutation関数】
  const deleteDepartmentMutation = useMutation(
    async (departmentId: string) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("departments").delete().match({ id: departmentId });
      if (error) throw error;
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["departments"] });

        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateProductModal(false);
        toast.success("事業部の削除が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        // setIsOpenUpdateProductModal(false);
        console.log("DELETEエラー", err);
        toast.error("事業部の削除に失敗しました🙇‍♀️");
      },
    }
  );

  return {
    createDepartmentMutation,
    // updateDepartmentMutation,
    updateDepartmentFieldMutation,
    deleteDepartmentMutation,
  };
};
