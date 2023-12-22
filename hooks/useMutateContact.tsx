import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Contact, Contact_row_data, EditedContact } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import { ContainerInstance } from "react-toastify/dist/hooks";

export const useMutateContact = () => {
  const theme = useThemeStore((state) => state.theme);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const setIsOpenInsertNewContactModal = useDashboardStore((state) => state.setIsOpenInsertNewContactModal);
  const setIsOpenUpdateContactModal = useDashboardStore((state) => state.setIsOpenUpdateContactModal);
  // 選択中の行をクリック通知してselectedRowDataContactを最新状態にアップデートする
  const setIsUpdateRequiredForLatestSelectedRowDataContact = useDashboardStore(
    (state) => state.setIsUpdateRequiredForLatestSelectedRowDataContact
  );
  // 選択中の行データと更新関数
  const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const setSelectedRowDataContact = useDashboardStore((state) => state.setSelectedRowDataContact);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Contact新規作成INSERT用createContactMutation関数】
  const createContactMutation = useMutation(
    async (newContact: Omit<Contact, "id" | "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("contacts").insert(newContact);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["contacts"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        // ローディングを終了する
        if (loadingGlobalState) setLoadingGlobalState(false);
        //  モーダルを閉じる
        setIsOpenInsertNewContactModal(false);
        toast.success("担当者の作成が完了しました🌟", {
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
        //   // ローディングを終了する
        //   if (loadingGlobalState) if (loadingGlobalState) setLoadingGlobalState(false);
        //   //  モーダルを閉じる
        //   setIsOpenInsertNewContactModal(false);
        //   toast.success("担当者の作成に完了しました!", {
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
        // ローディングを終了する
        if (loadingGlobalState) setLoadingGlobalState(false);
        //  モーダルを閉じる
        setIsOpenInsertNewContactModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("担当者の作成に失敗しました!", {
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
        //   // ローディングを終了する
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   //  モーダルを閉じる
        //   setIsOpenInsertNewContactModal(false);
        //   alert(err.message);
        //   console.log("INSERTエラー", err.message);
        //   toast.error("担当者の作成に失敗しました!", {
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

  // 【Contact一括編集UPDATE用updateContactMutation関数】
  const updateContactMutation = useMutation(
    async (newContact: EditedContact) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("contacts").update(newContact).eq("id", newContact.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["contacts"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataContactを最新状態にする
        setIsUpdateRequiredForLatestSelectedRowDataContact(true);

        // ローディングを終了する
        if (loadingGlobalState) setLoadingGlobalState(false);
        //  モーダルを閉じる
        setIsOpenUpdateContactModal(false);
        toast.success("担当者の更新が完了しました🌟", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
        // setTimeout(() => {
        //   // ローディングを終了する
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   //  モーダルを閉じる
        //   setIsOpenInsertNewContactModal(false);
        //   toast.success("担当者の更新完了しました!", {
        //     position: "top-right",
        //     autoClose: 3000,
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
        // ローディングを終了する
        if (loadingGlobalState) setLoadingGlobalState(false);
        //  モーダルを閉じる
        setIsOpenInsertNewContactModal(false);
        alert(err.message);
        console.log("UPDATEエラー", err.message);
        toast.error("担当者の更新に失敗しました!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
        // setTimeout(() => {
        //   // ローディングを終了する
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   //  モーダルを閉じる
        //   setIsOpenInsertNewContactModal(false);
        //   alert(err.message);
        //   console.log("UPDATEエラー", err.message);
        //   toast.error("担当者の更新に失敗しました!", {
        //     position: "top-right",
        //     autoClose: 3000,
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

  // 【Contactの個別フィールド毎に編集UPDATE用updateContactFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  type ExcludeKeys = "company_id" | "contact_id"; // 除外するキー
  type ContactFieldNamesForSelectedRowData = Exclude<keyof Contact_row_data, ExcludeKeys>; // Contact_row_dataタイプのプロパティ名のみのデータ型を取得
  const updateContactFieldMutation = useMutation(
    async (fieldData: {
      fieldName: string;
      fieldNameForSelectedRowData: ContactFieldNamesForSelectedRowData;
      newValue: any;
      id: string;
    }) => {
      console.log("updateContactFieldMutation実行 引数", fieldData);
      const { fieldName, fieldNameForSelectedRowData, newValue, id } = fieldData;
      const { data, error } = await supabase
        .from("contacts")
        .update({ [fieldName]: newValue })
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log("updateContactFieldMutation実行完了 mutate data", data);

      return { data, fieldNameForSelectedRowData, newValue };
    },
    {
      onSuccess: async (response) => {
        const { fieldNameForSelectedRowData, newValue } = response;
        console.log(
          "updateContactFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess fieldNameForSelectedRowData",
          fieldNameForSelectedRowData,
          "newValue",
          newValue
        );

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["contacts"] });

        if (!selectedRowDataContact) return;
        // キャッシュ更新より先にZustandのSelectedRowDataContactをupdateで取得したデータで更新する
        const newRowDataContact = { ...selectedRowDataContact, [fieldNameForSelectedRowData]: newValue };
        setSelectedRowDataContact(newRowDataContact);

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
        console.error(`Update failed contacts field` + err.message);
        toast.error("アップデートに失敗しました...", {
          position: "top-right",
          autoClose: 1500,
        });
      },
    }
  );

  return { createContactMutation, updateContactMutation, updateContactFieldMutation };
};
