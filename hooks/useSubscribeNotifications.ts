import useDashboardStore from "@/store/useDashboardStore";
import { Notification } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { toast } from "react-toastify";

export const useSubscribeNotifications = (user_id: string) => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const incompleteNotifications = useDashboardStore((state) => state.incompleteNotifications);
  const setIncompleteNotifications = useDashboardStore((state) => state.setIncompleteNotifications);

  useEffect(() => {
    if (!user_id) return console.log("リアルタイムnotifications ユーザー情報無し user_id", user_id);

    console.log("🌟リアルタイムnotifications 自分宛てのお知らせをサブスクライブ useEffect実行", user_id);

    const channel = supabase
      .channel("my_notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `to_user_id=eq.${user_id}`,
        },
        async (payload: any) => {
          // 自分宛のキャッシュを再度フェッチして最新状態に更新
          await queryClient.invalidateQueries({ queryKey: ["my_notifications"] });
          if (payload.new.type === "change_team_owner") {
            await queryClient.invalidateQueries({ queryKey: ["change_team_owner_notifications"] });
          }

          const newNoticeArray = [...incompleteNotifications];
          newNoticeArray.push(payload.new);

          setIncompleteNotifications(newNoticeArray);

          console.log(
            "リアルタイムnotifications INSERT検知 再度自分のお知らせをクエリ",
            payload,
            "新たなincompleteNotifications",
            newNoticeArray
          );

          toast.success("お知らせが届きました!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            // theme: `${theme === "light" ? "light" : "dark"}`,
          });
        }
      )
      //   .on("postgres_changes", {
      //     event: "UPDATE",
      //     schema: "public",
      //     table: "notifications",
      //     filter: `to_user_id=eq.${user_id}`,
      //   },
      //   async (payload: any) => {}
      //   )
      .subscribe();

    return () => {
      console.log("リアルタイムnotifications クリーンアップ channel", channel);
      supabase.removeChannel(channel);
    };
  }, [userProfileState, supabase, queryClient]);
};
