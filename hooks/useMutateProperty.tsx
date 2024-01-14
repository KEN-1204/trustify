import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Property, Client_company, Property_row_data } from "@/types";
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

  // 選択中の行データと更新関数
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);

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
        created_by_office_of_user: newProperty.created_by_office_of_user,
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

  // 【Property一括編集UPDATE用updatePropertyMutation関数】
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
        created_by_office_of_user: newProperty.created_by_office_of_user,
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

      // 更新されたPropertyデータをactivitiesテーブルにも反映UPDATE
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

  // 【Propertyの個別フィールド毎に編集UPDATE用updatePropertyFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  type ExcludeKeys = "company_id" | "contact_id" | "property_id"; // 除外するキー idはUPDATEすることは無いため
  type PropertyFieldNamesForSelectedRowData = Exclude<keyof Property_row_data, ExcludeKeys>;
  const updatePropertyFieldMutation = useMutation(
    // async (fieldData: { fieldName: string; value: any; id: string }) => {
    async (fieldData: {
      fieldName: string;
      fieldNameForSelectedRowData: PropertyFieldNamesForSelectedRowData;
      newValue: any;
      id: string;
      yearMonth?: number | null;
      yearQuarter?: number | null;
    }) => {
      // const { fieldName, value, id } = fieldData;
      const { fieldName, fieldNameForSelectedRowData, newValue, id, yearMonth, yearQuarter } = fieldData;

      const isRequireUpdateActivityFieldArray = ["property_summary", "property_date"];

      // 🔹rpcでpropertiesとactivitiesテーブルを同時に更新
      if (isRequireUpdateActivityFieldArray.includes(fieldName)) {
        // 🔹property_date meetingsテーブル案件年月度、activitiesのactivity_dateとactivity_year_monthも更新
        if (fieldName === "property_date" && !!yearMonth) {
          const jsonValue = { value: newValue };
          const updatePayload = {
            _property_id: id,
            _column_name: fieldName,
            _json_value: jsonValue,
            _property_year_month: yearMonth,
            _property_quarter: yearQuarter,
          };

          console.log("updatePropertyFieldMutation rpc実行 ", "カラム名", fieldName, "updatePayload", updatePayload);

          const { error } = await supabase.rpc("update_properties_field", updatePayload);

          if (error) throw error;
        }
        // 🔹property_summaryカラムの更新 同時にactivitiesも更新
        else if (fieldName === "property_summary") {
          const jsonValue = { value: newValue };
          const updatePayload = {
            _property_id: id,
            _column_name: fieldName,
            _json_value: jsonValue,
          };

          console.log("updatePropertyFieldMutation rpc実行 ", "カラム名", fieldName, "updatePayload", updatePayload);

          const { error } = await supabase.rpc("update_properties_field", updatePayload);

          if (error) throw error;
        }
      }
      // 🔹meetingsテーブルのみ expansion_dateとsales_dateは同時に四半期と年月度も同時に更新
      else if (fieldName === "expansion_date") {
        const updatePayload = {
          expansion_date: newValue,
          expansion_quarter: yearQuarter,
          expansion_year_month: yearMonth,
        };
        console.log("updatePropertyFieldMutation rpc実行 ", "カラム名", fieldName, "updatePayload", updatePayload);
        const { data: newPropertyArray, error } = await supabase
          .from("properties")
          .update(updatePayload)
          .eq("id", id)
          .select();

        if (error) throw error;
      }
      // 🔹sales_date
      else if (fieldName === "sales_date") {
        const updatePayload = {
          sales_date: newValue,
          sales_quarter: yearQuarter,
          sales_year_month: yearMonth,
        };
        console.log("updatePropertyFieldMutation rpc実行 ", "カラム名", fieldName, "updatePayload", updatePayload);
        const { data: newPropertyArray, error } = await supabase
          .from("properties")
          .update(updatePayload)
          .eq("id", id)
          .select();

        if (error) throw error;
      }
      // 🔹それ以外 meetingsテーブルのみ、１フィールドのみ更新
      else {
        console.log("updatePropertyFieldMutation rpc実行 ", "カラム名", fieldName, "newValue", newValue);
        const { data: newPropertyArray, error } = await supabase
          .from("properties")
          .update({ [fieldName]: newValue })
          .eq("id", id)
          .select();

        if (error) throw error;
        console.log("UPDATEに成功したdata", newPropertyArray[0]);
      }

      return { fieldName, fieldNameForSelectedRowData, newValue, yearMonth, yearQuarter };

      // 活動履歴で面談タイプ 訪問・面談を作成
      // const newPropertyData = {
      //   summary: newPropertyArray[0].property_summary,
      //   // department: newPropertyArray[0].property_department,
      //   // business_office: newPropertyArray[0].property_business_office,
      //   // member_name: newPropertyArray[0].property_member_name,
      //   activity_date: newPropertyArray[0].property_date,
      //   activity_year_month: newPropertyArray[0].property_year_month,
      // };

      // 更新されたPropertyデータをactivitiesテーブルにも反映UPDATE
      // const { error: errorProperty } = await supabase
      //   .from("activities")
      //   .update(newPropertyData)
      //   .eq("property_id", newPropertyArray[0].id);
      // if (errorProperty) throw new Error(errorProperty.message);

      // return newPropertyArray[0];
    },
    {
      onSuccess: async (data) => {
        const { fieldName, fieldNameForSelectedRowData, newValue, yearMonth, yearQuarter } = data;
        console.log(
          "✅✅✅✅✅✅✅updateMeetingFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess ",
          "data",
          data
        );
        // activitiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["properties"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });

        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        // setSelectedRowDataProperty(data[0]);

        const fieldNameYearMonth = (field: string) => {
          switch (field) {
            case "property_date":
              return "property_year_month";
            case "expansion_date":
              return "expansion_year_month";
            case "sales_date":
              return "sales_year_month";
            default:
              return "";
              break;
          }
        };
        const fieldNameQuarter = (field: string) => {
          switch (field) {
            case "expansion_date":
              return "expansion_quarter";
            case "sales_date":
              return "sales_quarter";
            default:
              return "";
              break;
          }
        };

        // 年月度も同時にZustandを更新する
        const updateWithYearMonth = ["property_date", "expansion_date", "sales_date"];
        if (!selectedRowDataProperty) return;
        if (updateWithYearMonth.includes(fieldName) && !!yearMonth) {
          if (fieldName === "expansion_date" || fieldName === "sales_date") {
            const newRowDataProperty = {
              ...selectedRowDataProperty,
              [fieldNameForSelectedRowData]: newValue,
              [fieldNameYearMonth(fieldName)]: yearMonth,
              [fieldNameQuarter(fieldName)]: yearQuarter,
            };
          }
          // property_dateは順番が入れ替わるためnullにリセット
          if (fieldName === "property_date") {
            // 活動日を更新すると順番が入れ替わり、選択中の行がメインテーブルの内容と異なるためリセット
            console.log("プロパティにproperty_dateが含まれているため選択中の行をリセット");
            setSelectedRowDataProperty(null);
          }
        }
        // それ以外は普通にZustandを更新
        else {
          const newRowDataProperty = { ...selectedRowDataProperty, [fieldNameForSelectedRowData]: newValue };
          setSelectedRowDataProperty(newRowDataProperty);
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
        console.error(`Update failed properties field` + err.message);
        toast.error("アップデートに失敗しました...", {
          position: "top-right",
          autoClose: 1500,
        });
      },
    }
  );

  return { createPropertyMutation, updatePropertyMutation, updatePropertyFieldMutation };
};
