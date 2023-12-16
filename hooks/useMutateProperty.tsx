import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Property, Client_company } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";
import { ContainerInstance } from "react-toastify/dist/hooks";

export const useMutateProperty = () => {
  const theme = useThemeStore((state) => state.theme);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const setIsOpenInsertNewPropertyModal = useDashboardStore((state) => state.setIsOpenInsertNewPropertyModal);
  const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);
  // 選択中の行をクリック通知してselectedRowDataPropertyを最新状態にアップデートする
  const setIsUpdateRequiredForLatestSelectedRowDataProperty = useDashboardStore(
    (state) => state.setIsUpdateRequiredForLatestSelectedRowDataProperty
  );

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Property新規作成INSERT用createPropertyMutation関数】
  const createPropertyMutation = useMutation(
    async (newProperty: Omit<Property, "id" | "created_at" | "updated_at">) => {
      if (!loadingGlobalState) setLoadingGlobalState(true);
      // console.log(newProperty.planned_start_time);
      const { data, error } = await supabase.from("properties").insert(newProperty).select().single();
      if (error) throw new Error(error.message);

      console.log("INSERTに成功したdata", data);
      // 活動履歴で面談タイプ 訪問・面談を作成
      const newActivity = {
        created_by_company_id: newProperty.created_by_company_id,
        created_by_user_id: newProperty.created_by_user_id,
        created_by_department_of_user: newProperty.created_by_department_of_user,
        created_by_unit_of_user: newProperty.created_by_unit_of_user,
        client_contact_id: newProperty.client_contact_id,
        client_company_id: newProperty.client_company_id,
        summary: newProperty.property_summary,
        scheduled_follow_up_date: null,
        // follow_up_flag: followUpFlag ? followUpFlag : null,
        follow_up_flag: false,
        document_url: null,
        activity_type: "案件発生",
        // claim_flag: claimFlag ? claimFlag : null,
        claim_flag: false,
        product_introduction1: null,
        product_introduction2: null,
        product_introduction3: null,
        product_introduction4: null,
        product_introduction5: null,
        department: newProperty.property_department,
        business_office: newProperty.property_business_office,
        member_name: newProperty.property_member_name,
        priority: null,
        activity_date: newProperty.property_date,
        activity_year_month: newProperty.property_year_month,
        meeting_id: null,
        property_id: (data as Property).id ? (data as Property).id : null,
        quotation_id: null,
      };

      // supabaseにINSERT
      const { error: errorActivity } = await supabase.from("activities").insert(newActivity);
      if (errorActivity) throw new Error(errorActivity.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["properties"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenInsertNewPropertyModal(false);
        toast.success("案件の作成が完了しました🌟", {
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
        //   setIsOpenInsertNewPropertyModal(false);
        //   toast.success("案件の作成に完了しました!", {
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
        // setIsOpenInsertNewPropertyModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("案件の作成に失敗しました!", {
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
        //   // setIsOpenInsertNewPropertyModal(false);
        //   alert(err.message);
        //   console.log("INSERTエラー", err.message);
        //   toast.error("案件の作成に失敗しました!", {
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

  // 【Property編集UPDATE用updatePropertyMutation関数】
  const updatePropertyMutation = useMutation(
    async (newProperty: Omit<Property, "created_at" | "updated_at">) => {
      if (!loadingGlobalState) setLoadingGlobalState(true);
      const { data: propertyData, error } = await supabase
        .from("properties")
        .update(newProperty)
        .eq("id", newProperty.id)
        .select()
        .single();
      if (error) throw new Error(error.message);

      console.log("UPDATEに成功したdata", propertyData);
      // 活動履歴で面談タイプ 訪問・面談を作成
      const newPropertyData = {
        created_by_company_id: newProperty.created_by_company_id,
        created_by_user_id: newProperty.created_by_user_id,
        created_by_department_of_user: newProperty.created_by_department_of_user,
        created_by_unit_of_user: newProperty.created_by_unit_of_user,
        client_contact_id: newProperty.client_contact_id,
        client_company_id: newProperty.client_company_id,
        summary: newProperty.property_summary,
        // scheduled_follow_up_date: null,
        // follow_up_flag: false,
        // document_url: null,
        // activity_type: "面談・訪問",
        // claim_flag: false,
        // product_introduction1: newProperty.result_presentation_product1,
        // product_introduction2: newProperty.result_presentation_product2,
        // product_introduction3: newProperty.result_presentation_product3,
        // product_introduction4: newProperty.result_presentation_product4,
        // product_introduction5: newProperty.result_presentation_product5,
        department: newProperty.property_department,
        business_office: newProperty.property_business_office,
        member_name: newProperty.property_member_name,
        // priority: null,
        activity_date: newProperty.property_date,
        activity_year_month: newProperty.property_year_month,
        // meeting_id: null,
        property_id: newProperty.id,
        // quotation_id: null,
      };

      // supabaseにINSERT
      const { error: errorProperty } = await supabase
        .from("activities")
        .update(newPropertyData)
        .eq("property_id", newProperty.id);
      if (errorProperty) throw new Error(errorProperty.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["properties"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataPropertyを最新状態にする
        setIsUpdateRequiredForLatestSelectedRowDataProperty(true);

        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenUpdatePropertyModal(false);
        toast.success("案件の更新が完了しました🌟", {
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
        //   setIsOpenUpdatePropertyModal(false);
        //   toast.success("案件の更新完了しました!", {
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
        // setIsOpenUpdatePropertyModal(false);
        alert(err.message);
        console.log("UPDATEエラー", err.message);
        toast.error("案件の更新に失敗しました!", {
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
        //   // setIsOpenUpdatePropertyModal(false);
        //   alert(err.message);
        //   console.log("UPDATEエラー", err.message);
        //   toast.error("案件の更新に失敗しました!", {
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

  return { createPropertyMutation, updatePropertyMutation };
};
