import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Meeting, Activity, Meeting_row_data, ResultMeetingWithProductsAttendees } from "@/types";
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
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
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
        _result_top_position_class: newMeeting.result_top_position_class,
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
    // async (newMeeting: Omit<Meeting, "created_at" | "updated_at">) => {
    async (newMeeting: Omit<ResultMeetingWithProductsAttendees, "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      // const { data: meetingData, error } = await supabase
      //   .from("meetings")
      //   .update(newMeeting)
      //   .eq("id", newMeeting.id)
      //   .select()
      //   .single();
      // if (error) throw new Error(error.message);

      // console.log("UPDATEに成功したdata", meetingData);
      // // 活動履歴で面談タイプ 訪問・面談を作成
      // const newMeetingData = {
      //   created_by_company_id: newMeeting.created_by_company_id,
      //   created_by_user_id: newMeeting.created_by_user_id,
      //   created_by_department_of_user: newMeeting.created_by_department_of_user,
      //   created_by_unit_of_user: newMeeting.created_by_unit_of_user,
      //   created_by_office_of_user: newMeeting.created_by_office_of_user,
      //   client_contact_id: newMeeting.client_contact_id,
      //   client_company_id: newMeeting.client_company_id,
      //   summary: newMeeting.result_summary,
      //   // scheduled_follow_up_date: null,
      //   // follow_up_flag: false,
      //   // document_url: null,
      //   // activity_type: "面談・訪問",
      //   // claim_flag: false,
      //   product_introduction1: newMeeting.result_presentation_product1,
      //   product_introduction2: newMeeting.result_presentation_product2,
      //   product_introduction3: newMeeting.result_presentation_product3,
      //   product_introduction4: newMeeting.result_presentation_product4,
      //   product_introduction5: newMeeting.result_presentation_product5,
      //   department: newMeeting.meeting_department,
      //   business_office: newMeeting.meeting_business_office,
      //   member_name: newMeeting.meeting_member_name,
      //   // priority: null,
      //   activity_date: newMeeting.planned_date,
      //   activity_year_month: newMeeting.meeting_year_month,
      //   meeting_id: newMeeting.id,
      //   // property_id: null,
      //   // quotation_id: null,
      // };

      // // supabaseの活動に面談データをUPDATE
      // const { error: errorActivity } = await supabase
      //   .from("activities")
      //   .update(newMeetingData)
      //   .eq("meeting_id", newMeeting.id);
      // if (errorActivity) throw new Error(errorActivity.message);

      //

      const updateMeetingPayload = {
        // 🌠面談テーブル
        _meeting_id: newMeeting.id,
        // _created_by_company_id: newMeeting.created_by_company_id,
        _created_by_user_id: newMeeting.created_by_user_id,
        _created_by_department_of_user: newMeeting.created_by_department_of_user,
        _created_by_unit_of_user: newMeeting.created_by_unit_of_user,
        _created_by_office_of_user: newMeeting.created_by_office_of_user,
        // _client_contact_id: newMeeting.client_contact_id,
        // _client_company_id: newMeeting.client_company_id,
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
        // --🌠面談結果関連
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
        _result_top_position_class: newMeeting.result_top_position_class,
        _pre_meeting_participation_request: newMeeting.pre_meeting_participation_request,
        _meeting_participation_request: newMeeting.meeting_participation_request,
        _meeting_department: newMeeting.meeting_department,
        _meeting_business_office: newMeeting.meeting_business_office,
        _meeting_member_name: newMeeting.meeting_member_name,
        _meeting_year_month: newMeeting.meeting_year_month,
        // -- 🌠活動テーブル用
        // created_by_company_id: newMeeting.created_by_company_id,
        // _created_by_user_id: newMeeting.created_by_user_id,
        // _created_by_department_of_user: newMeeting.created_by_department_of_user,
        // _created_by_unit_of_user: newMeeting.created_by_unit_of_user,
        // _created_by_office_of_user: newMeeting.created_by_office_of_user,
        _summary: newMeeting.result_summary,
        // scheduled_follow_up_date: null,
        // follow_up_flag: false,
        // document_url: null,
        // activity_type: "面談・訪問",
        // claim_flag: false,
        _product_introduction1: newMeeting.result_presentation_product1,
        _product_introduction2: newMeeting.result_presentation_product2,
        _product_introduction3: newMeeting.result_presentation_product3,
        _product_introduction4: newMeeting.result_presentation_product4,
        _product_introduction5: newMeeting.result_presentation_product5,
        _department: newMeeting.meeting_department,
        _business_office: newMeeting.meeting_business_office,
        _member_name: newMeeting.meeting_member_name,
        // priority: null,
        _activity_date: newMeeting.planned_date,
        _activity_year_month: newMeeting.meeting_year_month,
        // _meeting_id: newMeeting.id,
        // property_id: null,
        // quotation_id: null,
        // --🌠実施商品テーブル
        _product_ids: newMeeting.product_ids,
        _attendee_ids: newMeeting.attendee_ids,
        _delete_product_count: newMeeting.delete_product_count,
        _delete_attendee_count: newMeeting.delete_attendee_count,
      };

      console.log("🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠rpc実行 updateMeetingPayload", updateMeetingPayload);

      const { error } = await supabase.rpc("update_meeting_with_products_and_attendees", updateMeetingPayload);

      if (error) throw error;

      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥rpc成功");
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["meetings"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataMeetingを最新状態にする(一括更新の場合UPDATEされた行データを現在選択中のZustandのstateにスプレッドで割り当てようとしても結合してエイリアスを複数使っているのと、実施済み商品と同席者の複数テーブルへのクエリなのでinvalidateQueryのよってstaleにして新たに再フェッチしたデータをクリックしてメインテーブルにデータを反映させる)
        setIsUpdateRequiredForLatestSelectedRowDataMeeting(true);

        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenUpdateMeetingModal(false);
        toast.success("面談の更新が完了しました🌟", {
          position: "top-right",
          // autoClose: 1500,
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
        console.error("UPDATEエラー", err);
        toast.error("面談の更新に失敗しました...🙇‍♀️", {
          position: "top-right",
          // autoClose: 1500,
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
      meetingYearMonth?: number | null;
    }) => {
      console.log("updateActivityFieldMutation 引数取得", fieldData);
      const { fieldName, fieldNameForSelectedRowData, newValue, id, meetingYearMonth } = fieldData;

      const isRequireUpdateActivityFieldArray = ["result_summary", "result_date", "planned_date"];

      // 🔹rpcでmeetingsとactivitiesテーブルを同時に更新
      if (isRequireUpdateActivityFieldArray.includes(fieldName)) {
        // result_dateの場合は面談年月度も同時にmeetingsテーブルに更新
        if (fieldName === "result_date" && !!meetingYearMonth) {
          const jsonValue = { value: newValue };
          const updatePayload = {
            _meeting_id: id,
            _column_name: fieldName,
            _json_value: jsonValue,
            _meeting_year_month: meetingYearMonth,
          };

          console.log("updateActivityFieldMutation rpc実行 ", "カラム名", fieldName, "updatePayload", updatePayload);

          const { error } = await supabase.rpc("update_meetings_field", updatePayload);

          if (error) throw error;
        }
        // 🔹result_summaryとplanned_dateカラムの更新 同時にactivitiesも更新
        else {
          const jsonValue = { value: newValue };
          const updatePayload = {
            _meeting_id: id,
            _column_name: fieldName,
            _json_value: jsonValue,
          };

          console.log("updateActivityFieldMutation rpc実行 ", "カラム名", fieldName, "updatePayload", updatePayload);

          const { error } = await supabase.rpc("update_meetings_field", updatePayload);

          if (error) throw error;
        }
      }
      // 🔹meetingsテーブルのみ更新
      else {
        const { data, error } = await supabase
          .from("meetings")
          .update({ [fieldName]: newValue })
          .eq("id", id)
          .select();

        if (error) throw error;

        console.log("updateMeetingFieldMutation実行完了 mutate data", data);
        // return data;
      }

      return { fieldNameForSelectedRowData, newValue, meetingYearMonth };
      // 活動履歴で面談タイプ 訪問・面談を更新 実施商品は一旦一括編集のみにする
      // activity_dateは面談結果の面談日が存在する場合には、result_dateで更新し、面談予定の面談日しか存在しなければplanned_dateで更新する
      // const newMeetingData = {
      //   summary: data[0].result_summary, //結果コメント
      //   // product_introduction1: data[0].result_presentation_product1, //実施1
      //   // product_introduction2: data[0].result_presentation_product2, //実施2
      //   // product_introduction3: data[0].result_presentation_product3, //実施3
      //   // product_introduction4: data[0].result_presentation_product4, //実施4
      //   // product_introduction5: data[0].result_presentation_product5, //実施5
      //   // department: data[0].meeting_department, //事業部(自社)
      //   // business_office: data[0].meeting_business_office, //事業所(自社)
      //   // member_name: data[0].meeting_member_name, //営業担当(自社)
      //   activity_date: data[0].planned_date, //訪問予定日
      //   activity_year_month: data[0].meeting_year_month, //面談年月度
      // };

      // // supabaseの活動にUPDATE
      // const { error: errorActivity } = await supabase
      //   .from("activities")
      //   .update(newMeetingData)
      //   .eq("meeting_id", data[0].id);
      // if (errorActivity) throw new Error(errorActivity.message);
    },
    {
      onSuccess: async (data) => {
        const { fieldNameForSelectedRowData, newValue, meetingYearMonth } = data;
        console.log(
          "✅✅✅✅✅✅✅updateMeetingFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess ",
          "fieldNameForSelectedRowData",
          fieldNameForSelectedRowData,
          "newValue",
          newValue
        );

        // activitiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["meetings"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });

        if (!selectedRowDataMeeting) return;
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        // setSelectedRowDataMeeting(data[0]);
        if (fieldNameForSelectedRowData === "result_date" && !!meetingYearMonth) {
          const newRowDataMeeting = {
            ...selectedRowDataMeeting,
            [fieldNameForSelectedRowData]: newValue,
            meeting_year_month: meetingYearMonth,
          };
          setSelectedRowDataMeeting(newRowDataMeeting);
        } else {
          const newRowDataMeeting = { ...selectedRowDataMeeting, [fieldNameForSelectedRowData]: newValue };
          setSelectedRowDataMeeting(newRowDataMeeting);
        }

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
