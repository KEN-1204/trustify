import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Meeting, Client_company } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import { ContainerInstance } from "react-toastify/dist/hooks";

export const useMutateMeeting = () => {
  const theme = useThemeStore((state) => state.theme);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const setIsOpenInsertNewMeetingModal = useDashboardStore((state) => state.setIsOpenInsertNewMeetingModal);
  const setIsOpenUpdateMeetingModal = useDashboardStore((state) => state.setIsOpenUpdateMeetingModal);
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Meeting新規作成INSERT用createMeetingMutation関数】
  const createMeetingMutation = useMutation(
    async (newMeeting: Omit<Meeting, "id" | "created_at" | "updated_at">) => {
      setLoadingGlobalState(true);
      // console.log(newMeeting.planned_start_time);
      const { error } = await supabase.from("meetings").insert(newMeeting);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["meetings"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        setTimeout(() => {
          setLoadingGlobalState(false);
          setIsOpenInsertNewMeetingModal(false);
          toast.success("面談予定の作成に完了しました!", {
            position: "top-right",
            autoClose: 2000,
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
          setLoadingGlobalState(false);
          // setIsOpenInsertNewMeetingModal(false);
          alert(err.message);
          console.log("INSERTエラー", err.message);
          toast.error("面談予定の作成に失敗しました!", {
            position: "top-right",
            autoClose: 2000,
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

  // 【Meeting編集UPDATE用updateMeetingMutation関数】
  const updateMeetingMutation = useMutation(
    async (newMeeting: Omit<Meeting, "created_at" | "updated_at">) => {
      setLoadingGlobalState(true);
      const { error } = await supabase.from("meetings").update(newMeeting).eq("id", newMeeting.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["meetings"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d
        setTimeout(() => {
          setLoadingGlobalState(false);
          setIsOpenUpdateMeetingModal(false);
          toast.success("面談の更新完了しました!", {
            position: "top-right",
            autoClose: 2000,
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
          setLoadingGlobalState(false);
          // setIsOpenUpdateMeetingModal(false);
          alert(err.message);
          console.log("INSERTエラー", err.message);
          toast.error("面談の更新に失敗しました!", {
            position: "top-right",
            autoClose: 2000,
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

  return { createMeetingMutation, updateMeetingMutation };
};
