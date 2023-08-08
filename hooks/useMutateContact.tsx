import useThemeStore from "@/store/useThemeStore";
import { Contact, EditedContact } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import { ContainerInstance } from "react-toastify/dist/hooks";

export const useMutateContact = () => {
  const theme = useThemeStore((state) => state.theme);
  const supabase = useSupabaseClient();

  // 【Contact新規作成INSERT用createContactMutation関数】
  const createContactMutation = useMutation(
    async (newContact: Omit<Contact, "id" | "created_at" | "updated_at">) => {
      const { error } = await supabase.from("contacts").insert(newContact);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: () => {
        toast.success("担当者の作成に完了しました!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
      },
      onError: (err: any) => {
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("担当者の作成に失敗しました!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
      },
    }
  );

  // 【Contact編集UPDATE用updateContactMutation関数】
  const updateContactMutation = useMutation(
    async (newContact: EditedContact) => {
      const { error } = await supabase.from("contacts").update(newContact).eq("id", newContact.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: () => {
        toast.success("担当者の作成に完了しました!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
      },
      onError: (err: any) => {
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("担当者の作成に失敗しました!", {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
      },
    }
  );

  return { createContactMutation, updateContactMutation };
};
