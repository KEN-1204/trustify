import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Client_company } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";

export const useMutateClientCompany = () => {
  const theme = useThemeStore((state) => state.theme);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const setIsOpenInsertNewClientCompanyModal = useDashboardStore((state) => state.setIsOpenInsertNewClientCompanyModal);
  const setIsOpenUpdateClientCompanyModal = useDashboardStore((state) => state.setIsOpenUpdateClientCompanyModal);
  // 選択中の行をクリック通知してselectedRowDataCompanyを最新状態にアップデートする
  const setIsUpdateRequiredForLatestSelectedRowDataCompany = useDashboardStore(
    (state) => state.setIsUpdateRequiredForLatestSelectedRowDataCompany
  );
  // 選択中の行データと更新関数
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const setSelectedRowDataCompany = useDashboardStore((state) => state.setSelectedRowDataCompany);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【ClientCompany新規作成INSERT用createClientCompanyMutation関数】
  const createClientCompanyMutation = useMutation(
    async (newClientCompany: Omit<Client_company, "id" | "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("client_companies").insert(newClientCompany);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["companies"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        if (loadingGlobalState) setLoadingGlobalState(false);

        // 行が追加されて選択行と順番が変わるため選択行をリセット
        setSelectedRowDataCompany(null);

        // モーダルを閉じる
        setIsOpenInsertNewClientCompanyModal(false);

        toast.success("会社の作成が完了しました🌟", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });

        // setTimeout(() => {
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   setIsOpenInsertNewClientCompanyModal(false);
        //   toast.success("会社の作成に完了しました!", {
        //     position: "top-right",
        //     autoClose: 2000,
        //     hideProgressBar: false,
        //     closeOnClick: true,
        //     pauseOnHover: true,
        //     draggable: true,
        //     progress: undefined,
        //     theme: `${theme === "light" ? "light" : "dark"}`,
        //   });
        // }, 500);
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenInsertNewClientCompanyModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("会社の作成に失敗しました!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
        // setTimeout(() => {
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   setIsOpenInsertNewClientCompanyModal(false);
        //   alert(err.message);
        //   console.log("INSERTエラー", err.message);
        //   toast.error("会社の作成に失敗しました!", {
        //     position: "top-right",
        //     autoClose: 2000,
        //     hideProgressBar: false,
        //     closeOnClick: true,
        //     pauseOnHover: true,
        //     draggable: true,
        //     progress: undefined,
        //     theme: `${theme === "light" ? "light" : "dark"}`,
        //   });
        // }, 500);
      },
    }
  );

  // 【ClientCompany一括編集UPDATE用updateClientCompanyMutation関数】
  const updateClientCompanyMutation = useMutation(
    async (newClientCompany: Omit<Client_company, "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("client_companies").update(newClientCompany).eq("id", newClientCompany.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["companies"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataCompanyを最新状態にする
        setIsUpdateRequiredForLatestSelectedRowDataCompany(true);

        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenUpdateClientCompanyModal(false);
        toast.success("会社の更新が完了しました🌟", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
        // setTimeout(() => {
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   setIsOpenUpdateClientCompanyModal(false);
        //   toast.success("会社の更新完了しました!", {
        //     position: "top-right",
        //     autoClose: 1500,
        //     hideProgressBar: false,
        //     closeOnClick: true,
        //     pauseOnHover: true,
        //     draggable: true,
        //     progress: undefined,
        //     theme: `${theme === "light" ? "light" : "dark"}`,
        //   });
        // }, 500);
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenUpdateClientCompanyModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("会社の更新に失敗しました!", {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
        // setTimeout(() => {
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   setIsOpenUpdateClientCompanyModal(false);
        //   alert(err.message);
        //   console.log("INSERTエラー", err.message);
        //   toast.error("会社の更新に失敗しました!", {
        //     position: "top-right",
        //     autoClose: 1500,
        //     hideProgressBar: false,
        //     closeOnClick: true,
        //     pauseOnHover: true,
        //     draggable: true,
        //     progress: undefined,
        //     theme: `${theme === "light" ? "light" : "dark"}`,
        //   });
        // }, 500);
      },
    }
  );

  // 【ClientCompanyの個別フィールド毎に編集UPDATE用updateClientCompanyFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  const updateClientCompanyFieldMutation = useMutation(
    async (fieldData: { fieldName: string; value: any; id: string }) => {
      const { fieldName, value, id } = fieldData;
      const { data, error } = await supabase
        .from("client_companies")
        .update({ [fieldName]: value })
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log("updateClientCompanyFieldMutation実行完了 mutate data", data);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateClientCompanyFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        setSelectedRowDataCompany(data[0]);

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["companies"] });

        // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataCompanyを最新状態にする
        // setIsUpdateRequiredForLatestSelectedRowDataCompany(true);

        // if (loadingGlobalState) setLoadingGlobalState(false);
        // toast.success("会社の更新が完了しました🌟", {
        //   position: "top-right",
        //   autoClose: 1500
        // });
      },
      onError: (err: any) => {
        // if (loadingGlobalState) setLoadingGlobalState(false);
        console.error("フィールドエディットモード updateエラー", err);
        console.error(`Update failed client_companies field` + err.message);
        toast.error("アップデートに失敗しました...", {
          position: "top-right",
          autoClose: 1500,
        });
      },
    }
  );

  // 【ClientCompanyの複数フィールドを編集UPDATE用updateMultipleClientCompanyFields関数】
  // 製品分類(大分類)を変更した際に、同時に製品分類(中分類)をnullに更新する関数
  type UpdateObject = { [key: string]: any };
  const updateMultipleClientCompanyFields = useMutation(
    async (fieldData: { updateObject: UpdateObject; id: string }) => {
      const { updateObject, id } = fieldData;
      const { data, error } = await supabase.from("client_companies").update(updateObject).eq("id", id).select();

      if (error) throw error;

      console.log("updateMultipleClientCompanyFields実行完了 mutate data", data);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateMultipleClientCompanyFields実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        setSelectedRowDataCompany(data[0]);

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["companies"] });

        // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataCompanyを最新状態にする
        // setIsUpdateRequiredForLatestSelectedRowDataCompany(true);

        // if (loadingGlobalState) setLoadingGlobalState(false);
        // toast.success("会社の更新が完了しました🌟", {
        //   position: "top-right",
        //   autoClose: 1500
        // });
      },
      onError: (err: any) => {
        // if (loadingGlobalState) setLoadingGlobalState(false);
        console.error("フィールドエディットモード updateエラー", err);
        console.error(`Update failed client_companies field` + err.message);
        toast.error("アップデートに失敗しました...", {
          position: "top-right",
          autoClose: 1500,
        });
      },
    }
  );

  return {
    createClientCompanyMutation,
    updateClientCompanyMutation,
    updateClientCompanyFieldMutation,
    updateMultipleClientCompanyFields,
  };
};
