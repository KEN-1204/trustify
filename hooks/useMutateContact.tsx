import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Contact, EditedContact } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import { ContainerInstance } from "react-toastify/dist/hooks";

export const useMutateContact = () => {
  const theme = useThemeStore((state) => state.theme);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const setIsOpenInsertNewContactModal = useDashboardStore((state) => state.setIsOpenInsertNewContactModal);
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Contact新規作成INSERT用createContactMutation関数】
  const createContactMutation = useMutation(
    async (newContact: Omit<Contact, "id" | "created_at" | "updated_at">) => {
      setLoadingGlobalState(true);
      const { error } = await supabase.from("contacts").insert(newContact);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["contacts"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        setTimeout(() => {
          // ローディングを終了する
          setLoadingGlobalState(false);
          //  モーダルを閉じる
          setIsOpenInsertNewContactModal(false);
          toast.success("担当者の作成に完了しました!", {
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
      onError: (err: any) => {
        setTimeout(() => {
          // ローディングを終了する
          setLoadingGlobalState(false);
          //  モーダルを閉じる
          setIsOpenInsertNewContactModal(false);
          alert(err.message);
          console.log("INSERTエラー", err.message);
          toast.error("担当者の作成に失敗しました!", {
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

  // 【Contact編集UPDATE用updateContactMutation関数】
  const updateContactMutation = useMutation(
    async (newContact: EditedContact) => {
      setLoadingGlobalState(true);
      const { error } = await supabase.from("contacts").update(newContact).eq("id", newContact.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["contacts"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        setTimeout(() => {
          // ローディングを終了する
          setLoadingGlobalState(false);
          //  モーダルを閉じる
          setIsOpenInsertNewContactModal(false);
          toast.success("担当者の更新完了しました!", {
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
      onError: (err: any) => {
        setTimeout(() => {
          // ローディングを終了する
          setLoadingGlobalState(false);
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
        }, 500);
      },
    }
  );

  return { createContactMutation, updateContactMutation };
};
