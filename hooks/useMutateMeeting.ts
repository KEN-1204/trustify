import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Meeting, Client_company, Activity } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import { ContainerInstance } from "react-toastify/dist/hooks";

export const useMutateMeeting = () => {
  const theme = useThemeStore((state) => state.theme);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const setIsOpenInsertNewMeetingModal = useDashboardStore((state) => state.setIsOpenInsertNewMeetingModal);
  const setIsOpenUpdateMeetingModal = useDashboardStore((state) => state.setIsOpenUpdateMeetingModal);
  // 選択中の行をクリック通知してselectedRowDataPropertyを最新状態にアップデートする
  const setIsUpdateRequiredForLatestSelectedRowDataMeeting = useDashboardStore(
    (state) => state.setIsUpdateRequiredForLatestSelectedRowDataMeeting
  );
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Meeting新規作成INSERT用createMeetingMutation関数】
  const createMeetingMutation = useMutation(
    async (newMeeting: Omit<Meeting, "id" | "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      // console.log(newMeeting.planned_start_time);
      const { data, error } = await supabase.from("meetings").insert(newMeeting).select().single();
      if (error) throw new Error(error.message);

      console.log("INSERTに成功したdata", data);
      // 活動履歴で面談タイプ 訪問・面談を作成
      const newActivity = {
        created_by_company_id: newMeeting.created_by_company_id,
        created_by_user_id: newMeeting.created_by_user_id,
        created_by_department_of_user: newMeeting.created_by_department_of_user,
        created_by_unit_of_user: newMeeting.created_by_unit_of_user,
        client_contact_id: newMeeting.client_contact_id,
        client_company_id: newMeeting.client_company_id,
        summary: newMeeting.result_summary,
        scheduled_follow_up_date: null,
        // follow_up_flag: followUpFlag ? followUpFlag : null,
        follow_up_flag: false,
        document_url: null,
        activity_type: "面談・訪問",
        // claim_flag: claimFlag ? claimFlag : null,
        claim_flag: false,
        product_introduction1: newMeeting.result_presentation_product1,
        product_introduction2: newMeeting.result_presentation_product2,
        product_introduction3: newMeeting.result_presentation_product3,
        product_introduction4: newMeeting.result_presentation_product4,
        product_introduction5: newMeeting.result_presentation_product5,
        department: newMeeting.meeting_department,
        business_office: newMeeting.meeting_business_office,
        member_name: newMeeting.meeting_member_name,
        priority: null,
        activity_date: newMeeting.planned_date,
        activity_year_month: newMeeting.meeting_year_month,
        meeting_id: (data as Activity).id ? (data as Activity).id : null,
        property_id: null,
        quotation_id: null,
      };

      // supabaseにINSERT
      const { error: errorActivity } = await supabase.from("activities").insert(newActivity);
      if (errorActivity) throw new Error(errorActivity.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["meetings"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d
        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenInsertNewMeetingModal(false);
        toast.success("面談予定の作成が完了しました🌟", {
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
        //   setIsOpenInsertNewMeetingModal(false);
        //   toast.success("面談予定の作成に完了しました!", {
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
        // setIsOpenInsertNewMeetingModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("面談予定の作成に失敗しました!", {
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
        //   // setIsOpenInsertNewMeetingModal(false);
        //   alert(err.message);
        //   console.log("INSERTエラー", err.message);
        //   toast.error("面談予定の作成に失敗しました!", {
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

  // 【Meeting編集UPDATE用updateMeetingMutation関数】
  const updateMeetingMutation = useMutation(
    async (newMeeting: Omit<Meeting, "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      const { data: meetingData, error } = await supabase
        .from("meetings")
        .update(newMeeting)
        .eq("id", newMeeting.id)
        .select()
        .single();
      if (error) throw new Error(error.message);

      console.log("UPDATEに成功したdata", meetingData);
      // 活動履歴で面談タイプ 訪問・面談を作成
      const newMeetingData = {
        created_by_company_id: newMeeting.created_by_company_id,
        created_by_user_id: newMeeting.created_by_user_id,
        created_by_department_of_user: newMeeting.created_by_department_of_user,
        created_by_unit_of_user: newMeeting.created_by_unit_of_user,
        client_contact_id: newMeeting.client_contact_id,
        client_company_id: newMeeting.client_company_id,
        summary: newMeeting.result_summary,
        // scheduled_follow_up_date: null,
        // follow_up_flag: false,
        // document_url: null,
        // activity_type: "面談・訪問",
        // claim_flag: false,
        product_introduction1: newMeeting.result_presentation_product1,
        product_introduction2: newMeeting.result_presentation_product2,
        product_introduction3: newMeeting.result_presentation_product3,
        product_introduction4: newMeeting.result_presentation_product4,
        product_introduction5: newMeeting.result_presentation_product5,
        department: newMeeting.meeting_department,
        business_office: newMeeting.meeting_business_office,
        member_name: newMeeting.meeting_member_name,
        // priority: null,
        activity_date: newMeeting.planned_date,
        activity_year_month: newMeeting.meeting_year_month,
        meeting_id: newMeeting.id,
        // property_id: null,
        // quotation_id: null,
      };

      // supabaseの活動にUPDATE
      const { error: errorActivity } = await supabase
        .from("activities")
        .update(newMeetingData)
        .eq("meeting_id", newMeeting.id);
      if (errorActivity) throw new Error(errorActivity.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["meetings"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataMeetingを最新状態にする
        setIsUpdateRequiredForLatestSelectedRowDataMeeting(true);

        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenUpdateMeetingModal(false);
        toast.success("面談の更新が完了しました🌟", {
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
        //   setIsOpenUpdateMeetingModal(false);
        //   toast.success("面談の更新完了しました!", {
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
        // setIsOpenUpdateMeetingModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("面談の更新に失敗しました!", {
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
        //   // setIsOpenUpdateMeetingModal(false);
        //   alert(err.message);
        //   console.log("INSERTエラー", err.message);
        //   toast.error("面談の更新に失敗しました!", {
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

  return { createMeetingMutation, updateMeetingMutation };
};
