import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Meeting, Activity, Meeting_row_data } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

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

  // 選択中の行データと更新関数
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const setSelectedRowDataMeeting = useDashboardStore((state) => state.setSelectedRowDataMeeting);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Meeting新規作成INSERT用createMeetingMutation関数】
  const createMeetingMutation = useMutation(
    async (newMeeting: Omit<Meeting, "id" | "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      // console.log(newMeeting.planned_start_time);
      // const { data, error } = await supabase.from("meetings").insert(newMeeting).select().single();
      // if (error) throw new Error(error.message);

      // console.log("INSERTに成功したdata", data);
      // 活動履歴で面談タイプ 訪問・面談を作成
      // const newActivity = {
      //   created_by_company_id: newMeeting.created_by_company_id,
      //   created_by_user_id: newMeeting.created_by_user_id,
      //   created_by_department_of_user: newMeeting.created_by_department_of_user,
      //   created_by_unit_of_user: newMeeting.created_by_unit_of_user,
      //   created_by_office_of_user: newMeeting.created_by_office_of_user,
      //   client_contact_id: newMeeting.client_contact_id,
      //   client_company_id: newMeeting.client_company_id,
      //   summary: newMeeting.result_summary,
      //   scheduled_follow_up_date: null,
      //   // follow_up_flag: followUpFlag ? followUpFlag : null,
      //   follow_up_flag: false,
      //   document_url: null,
      //   activity_type: "面談・訪問",
      //   // claim_flag: claimFlag ? claimFlag : null,
      //   claim_flag: false,
      //   product_introduction1: newMeeting.result_presentation_product1,
      //   product_introduction2: newMeeting.result_presentation_product2,
      //   product_introduction3: newMeeting.result_presentation_product3,
      //   product_introduction4: newMeeting.result_presentation_product4,
      //   product_introduction5: newMeeting.result_presentation_product5,
      //   department: newMeeting.meeting_department,
      //   business_office: newMeeting.meeting_business_office,
      //   member_name: newMeeting.meeting_member_name,
      //   priority: null,
      //   activity_date: newMeeting.planned_date,
      //   activity_year_month: newMeeting.meeting_year_month,
      //   meeting_id: (data as Activity).id ? (data as Activity).id : null,
      //   property_id: null,
      //   quotation_id: null,
      // };

      // supabaseにINSERT
      // const { error: errorActivity } = await supabase.from("activities").insert(newActivity);
      // if (errorActivity) throw new Error(errorActivity.message);

      const newMeetingAndActivityPayload = {
        // 面談テーブル
        _created_by_company_id: newMeeting.created_by_company_id,
        _created_by_user_id: newMeeting.created_by_user_id,
        _created_by_department_of_user: newMeeting.created_by_department_of_user,
        _created_by_unit_of_user: newMeeting.created_by_unit_of_user,
        _created_by_office_of_user: newMeeting.created_by_office_of_user,
        _client_contact_id: newMeeting.client_contact_id,
        _client_company_id: newMeeting.client_company_id,
        _meeting_type: newMeeting.meeting_type,
        _web_tool: newMeeting.web_tool,
        _planned_date: newMeeting.planned_date,
        _planned_start_time: newMeeting.planned_start_time,
        _planned_purpose: newMeeting.planned_purpose,
        _planned_duration: newMeeting.planned_duration,
        _planned_appoint_check_flag: newMeeting.planned_appoint_check_flag,
        _planned_product1: newMeeting.planned_product1,
        _planned_product2: newMeeting.planned_product2,
        _planned_comment: newMeeting.planned_comment,
        _result_date: newMeeting.result_date,
        _result_start_time: newMeeting.result_start_time,
        _result_end_time: newMeeting.result_end_time,
        _result_duration: newMeeting.result_duration,
        _result_number_of_meeting_participants: newMeeting.result_number_of_meeting_participants,
        _result_presentation_product1: newMeeting.result_presentation_product1,
        _result_presentation_product2: newMeeting.result_presentation_product2,
        _result_presentation_product3: newMeeting.result_presentation_product3,
        _result_presentation_product4: newMeeting.result_presentation_product4,
        _result_presentation_product5: newMeeting.result_presentation_product5,
        _result_category: newMeeting.result_category,
        _result_summary: newMeeting.result_summary,
        _result_negotiate_decision_maker: newMeeting.result_negotiate_decision_maker,
        _pre_meeting_participation_request: newMeeting.pre_meeting_participation_request,
        _meeting_participation_request: newMeeting.meeting_participation_request,
        _meeting_department: newMeeting.meeting_department,
        _meeting_business_office: newMeeting.meeting_business_office,
        _meeting_member_name: newMeeting.meeting_member_name,
        _meeting_year_month: newMeeting.meeting_year_month,
        // -- 活動テーブル用
        _summary: newMeeting.result_summary,
        _scheduled_follow_up_date: null,
        _follow_up_flag: false,
        _document_url: null,
        _activity_type: "面談・訪問",
        _claim_flag: false,
        _product_introduction1: newMeeting.result_presentation_product1,
        _product_introduction2: newMeeting.result_presentation_product2,
        _product_introduction3: newMeeting.result_presentation_product3,
        _product_introduction4: newMeeting.result_presentation_product4,
        _product_introduction5: newMeeting.result_presentation_product5,
        _department: newMeeting.meeting_department,
        _business_office: newMeeting.meeting_business_office,
        _member_name: newMeeting.meeting_member_name,
        _priority: null,
        _activity_date: newMeeting.planned_date,
        _activity_year_month: newMeeting.meeting_year_month,
        // _meeting_id: ,
        _property_id: null,
        _quotation_id: null,
      };

      // insert_meeting_schedule_and_activity rpc

      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥rpc実行 newMeetingAndActivityPayload", newMeetingAndActivityPayload);

      const { error } = await supabase.rpc("insert_meeting_schedule_and_activity", newMeetingAndActivityPayload);

      if (error) throw error;
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
        // alert(err.message);
        console.log("INSERTエラー", err);
        console.error("INSERTエラー", err.message);
        toast.error("面談予定の作成に失敗しました!", {
          position: "top-right",
          autoClose: 1500,
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

  // 【Meeting一括編集UPDATE用updateMeetingMutation関数】
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
        created_by_office_of_user: newMeeting.created_by_office_of_user,
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

      // supabaseの活動に面談データをUPDATE
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

  // 【Meetingの個別フィールド毎に編集UPDATE用updateMeetingFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  type ExcludeKeys = "company_id" | "contact_id" | "meeting_id"; // 除外するキー idはUPDATEすることは無いため
  type MeetingFieldNamesForSelectedRowData = Exclude<keyof Meeting_row_data, ExcludeKeys>;
  const updateMeetingFieldMutation = useMutation(
    async (fieldData: {
      fieldName: string;
      fieldNameForSelectedRowData: MeetingFieldNamesForSelectedRowData;
      newValue: any;
      id: string;
    }) => {
      console.log("updateActivityFieldMutation実行 引数", fieldData);
      const { fieldName, fieldNameForSelectedRowData, newValue, id } = fieldData;
      const { data, error } = await supabase
        .from("meetings")
        .update({ [fieldName]: newValue })
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log("updateMeetingFieldMutation実行完了 mutate data", data);

      // 活動履歴で面談タイプ 訪問・面談を作成
      const newMeetingData = {
        // created_by_company_id: data[0].created_by_company_id,//どの会社が作成したか
        // created_by_user_id: data[0].created_by_user_id,//どのユーザーが作成したか
        // created_by_department_of_user: data[0].created_by_department_of_user,//どの事業部が作成したか
        // created_by_unit_of_user: data[0].created_by_unit_of_user,//どの係が作成したか
        // client_contact_id: data[0].client_contact_id, //担当者id(相手)
        // client_company_id: data[0].client_company_id, //会社id(相手)
        summary: data[0].result_summary, //結果コメント
        // scheduled_follow_up_date: null,
        // follow_up_flag: false,
        // document_url: null,
        // activity_type: "面談・訪問",
        // claim_flag: false,
        product_introduction1: data[0].result_presentation_product1, //実施1
        product_introduction2: data[0].result_presentation_product2, //実施2
        product_introduction3: data[0].result_presentation_product3, //実施3
        product_introduction4: data[0].result_presentation_product4, //実施4
        product_introduction5: data[0].result_presentation_product5, //実施5
        department: data[0].meeting_department, //事業部(自社)
        business_office: data[0].meeting_business_office, //事業所(自社)
        member_name: data[0].meeting_member_name, //営業担当(自社)
        // priority: null,
        activity_date: data[0].planned_date, //訪問予定日
        activity_year_month: data[0].meeting_year_month, //面談年月度
        // meeting_id: data[0].id,//面談
        // property_id: null,
        // quotation_id: null,
      };

      // supabaseの活動にUPDATE
      const { error: errorActivity } = await supabase
        .from("activities")
        .update(newMeetingData)
        .eq("meeting_id", data[0].id);
      if (errorActivity) throw new Error(errorActivity.message);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateMeetingFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        setSelectedRowDataMeeting(data[0]);

        // activitiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["meetings"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });

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
        console.error(`Update failed activities field` + err.message);
        toast.error("アップデートに失敗しました...", {
          position: "top-right",
          autoClose: 1500,
        });
      },
    }
  );

  return { createMeetingMutation, updateMeetingMutation, updateMeetingFieldMutation };
};
