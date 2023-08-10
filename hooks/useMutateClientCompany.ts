import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Client_company } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import { ContainerInstance } from "react-toastify/dist/hooks";

export const useMutateClientCompany = () => {
  const theme = useThemeStore((state) => state.theme);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【ClientCompany新規作成INSERT用createClientCompanyMutation関数】
  const createClientCompanyMutation = useMutation(
    async (newClientCompany: Omit<Client_company, "id" | "created_at" | "updated_at">) => {
      setLoadingGlobalState(true);
      const { error } = await supabase.from("contacts").insert(newClientCompany);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["contacts"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

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

        setLoadingGlobalState(false);
      },
      onError: (err: any) => {
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
        setLoadingGlobalState(false);
      },
    }
  );

  // 【ClientCompany編集UPDATE用updateClientCompanyMutation関数】
  const updateClientCompanyMutation = useMutation(
    async (newClientCompany: Omit<Client_company, "created_at" | "updated_at">) => {
      setLoadingGlobalState(true);
      const { error } = await supabase.from("contacts").update(newClientCompany).eq("id", newClientCompany.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["contacts"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

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

        setLoadingGlobalState(false);
      },
      onError: (err: any) => {
        alert(err.message);
        console.log("INSERTエラー", err.message);
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
        setLoadingGlobalState(false);
      },
    }
  );

  return { createClientCompanyMutation, updateClientCompanyMutation };
};
