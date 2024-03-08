// import useDashboardStore from "@/store/useDashboardStore";
// import useThemeStore from "@/store/useThemeStore";
// import { Property, Property_row_data } from "@/types";
// import { useSupabaseClient } from "@supabase/auth-helpers-react";
// import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { toast } from "react-toastify";

// export const useMutateProperty = () => {
//   const theme = useThemeStore((state) => state.theme);
//   const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
//   const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
//   const setIsOpenInsertNewPropertyModal = useDashboardStore((state) => state.setIsOpenInsertNewPropertyModal);
//   const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);
//   // 選択中の行をクリック通知してselectedRowDataPropertyを最新状態にアップデートする
//   const setIsUpdateRequiredForLatestSelectedRowDataProperty = useDashboardStore(
//     (state) => state.setIsUpdateRequiredForLatestSelectedRowDataProperty
//   );

//   // 選択中の行データと更新関数
//   const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
//   const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);

//   // -------------------------- ネタ表からの売上入力用 --------------------------
//   const isRequiredInputSoldProduct = useDashboardStore((state) => state.isRequiredInputSoldProduct);
//   const setIsRequiredInputSoldProduct = useDashboardStore((state) => state.setIsRequiredInputSoldProduct);
//   // ネタ表のクエリキー
//   const activePeriodSDB = useDashboardStore((state) => state.activePeriodSDB);
//   // -------------------------- ネタ表からの売上入力用 ここまで --------------------------

//   const supabase = useSupabaseClient();
//   const queryClient = useQueryClient();

//   // 【Propertyの個別フィールド毎に編集UPDATE用updatePropertyFieldMutation関数】
//   // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
//   type ExcludeKeys = "company_id" | "contact_id" | "property_id"; // 除外するキー idはUPDATEすることは無いため
//   type PropertyFieldNamesForSelectedRowData = Exclude<keyof Property_row_data, ExcludeKeys>;
//   const updatePropertyFieldMutation = useMutation(
//     // async (fieldData: { fieldName: string; value: any; id: string }) => {
//     async (fieldData: {
//       fieldName: string;
//       fieldNameForSelectedRowData: PropertyFieldNamesForSelectedRowData;
//       newValue: any;
//       id: string;
//       yearMonth?: number | null;
//       yearQuarter?: number | null;
//       yearHalf?: number | null;
//       fiscalYear?: number | null;
//       discountRate?: string | null;
//     }) => {
//       // const { fieldName, value, id } = fieldData;
//       const {
//         fieldName,
//         fieldNameForSelectedRowData,
//         newValue,
//         id,
//         yearMonth,
//         yearQuarter,
//         yearHalf,
//         fiscalYear,
//         discountRate,
//       } = fieldData;

//       console.log("updatePropertyFieldMutation受信 fieldData", fieldData);

//       // 🔹rpcでpropertiesとactivitiesテーブルを同時に更新
//       if (["property_summary", "property_date"].includes(fieldName)) {
//         // 🔹property_date meetingsテーブル案件年月度、activitiesのactivity_dateとactivity_year_monthも更新
//         if (fieldName === "property_date" && !!yearMonth) {
//           const jsonValue = { value: newValue };
//           const updatePayload = {
//             _property_id: id,
//             _column_name: fieldName,
//             _json_value: jsonValue,
//             _property_year_month: yearMonth,
//             _property_quarter: yearQuarter,
//             _property_half_year: yearHalf,
//             _property_fiscal_year: fiscalYear,
//           };

//           console.log(
//             "updatePropertyFieldMutation rpc実行 meetingsテーブル案件年月度、activitiesのactivity_dateとactivity_year_monthも更新",
//             "カラム名",
//             fieldName,
//             "updatePayload",
//             updatePayload
//           );

//           const { error } = await supabase.rpc("update_properties_field", updatePayload);

//           if (error) throw error;
//         }
//         // 🔹property_summaryカラムの更新 同時にactivitiesも更新
//         else if (fieldName === "property_summary") {
//           const jsonValue = { value: newValue };
//           const updatePayload = {
//             _property_id: id,
//             _column_name: fieldName,
//             _json_value: jsonValue,
//           };

//           console.log("updatePropertyFieldMutation rpc実行 ", "カラム名", fieldName, "updatePayload", updatePayload);

//           const { error } = await supabase.rpc("update_properties_field", updatePayload);

//           if (error) throw error;
//         }
//       }
//       // 🔹meetingsテーブルのみ expansion_dateとsales_dateは同時に四半期と年月度も同時に更新
//       else if (fieldName === "expansion_date") {
//         const updatePayload = {
//           expansion_date: newValue,
//           expansion_quarter: yearQuarter,
//           expansion_year_month: yearMonth,
//           expansion_half_year: yearHalf,
//           expansion_fiscal_year: fiscalYear,
//         };
//         console.log(
//           "updatePropertyFieldMutation rpc実行 expansion_date四半期と年月度も同時に更新",
//           "カラム名",
//           fieldName,
//           "updatePayload",
//           updatePayload
//         );
//         const { error } = await supabase.from("properties").update(updatePayload).eq("id", id);

//         if (error) throw error;
//       }
//       // 🔹sales_date
//       else if (fieldName === "sales_date") {
//         const updatePayload = {
//           sales_date: newValue,
//           sales_quarter: yearQuarter,
//           sales_year_month: yearMonth,
//           sales_half_year: yearHalf,
//           sales_fiscal_year: fiscalYear,
//         };
//         console.log(
//           "updatePropertyFieldMutation rpc実行 🔹sales_date四半期と年月度も同時に更新",
//           "カラム名",
//           fieldName,
//           "updatePayload",
//           updatePayload
//         );
//         const { error } = await supabase.from("properties").update(updatePayload).eq("id", id);

//         if (error) throw error;
//       }
//       // 🔹expected_order_date
//       else if (fieldName === "expected_order_date") {
//         const updatePayload = {
//           expected_order_date: newValue,
//           expected_order_quarter: yearQuarter,
//           expected_order_year_month: yearMonth,
//           expected_order_half_year: yearHalf,
//           expected_order_fiscal_year: fiscalYear,
//         };
//         console.log(
//           "updatePropertyFieldMutation rpc実行 🔹expected_order_date四半期と年月度も同時に更新",
//           "カラム名",
//           fieldName,
//           "updatePayload",
//           updatePayload
//         );
//         const { error } = await supabase.from("properties").update(updatePayload).eq("id", id);

//         if (error) throw error;
//       }
//       // 🔹それ以外 meetingsテーブルのみ
//       else {
//         console.log(
//           "updatePropertyFieldMutation rpc実行 meetingsテーブルのみ、１フィールドのみ更新",
//           "カラム名",
//           fieldName,
//           "newValue",
//           newValue,
//           "discountRate",
//           discountRate
//         );

//         // 売上金額 or 売上台数 or 値引価格 と 値引率を同時に更新
//         if (["sales_price", "unit_sales", "discounted_price"].includes(fieldName)) {
//           // 売上価格0の場合、リセット
//           if (fieldName === "sales_price" && ["0", "０"].includes(newValue)) {
//             const { data: newPropertyArray, error } = await supabase
//               .from("properties")
//               .update({ sales_price: 0, discounted_price: 0, discount_rate: 0 })
//               .eq("id", id)
//               .select();

//             if (error) throw error;
//             console.log("UPDATEに成功したdata", newPropertyArray[0]);
//           }
//           // 台数0の場合、リセット
//           else if (fieldName === "unit_sales" && ["0", "０", 0].includes(newValue)) {
//             const { data: newPropertyArray, error } = await supabase
//               .from("properties")
//               .update({ unit_sales: null, discount_rate: null })
//               .eq("id", id)
//               .select();

//             if (error) throw error;
//             console.log("UPDATEに成功したdata", newPropertyArray[0]);
//           }
//           // それ以外は値引率と合わせて更新
//           else {
//             const { data: newPropertyArray, error } = await supabase
//               .from("properties")
//               .update({ [fieldName]: newValue, discount_rate: discountRate })
//               .eq("id", id)
//               .select();

//             if (error) throw error;
//             console.log("UPDATEに成功したdata", newPropertyArray[0]);
//           }
//         }
//         // それ以外 meetingsテーブルのみ、１フィールドのみ更新
//         else {
//           const { data: newPropertyArray, error } = await supabase
//             .from("properties")
//             .update({ [fieldName]: newValue })
//             .eq("id", id)
//             .select();

//           if (error) throw error;
//           console.log("UPDATEに成功したdata", newPropertyArray[0]);
//         }
//       }

//       return {
//         fieldName,
//         fieldNameForSelectedRowData,
//         newValue,
//         yearMonth,
//         yearQuarter,
//         yearHalf,
//         fiscalYear,
//         discountRate,
//       };

//       // 活動履歴で面談タイプ 訪問・面談を作成
//       // const newPropertyData = {
//       //   summary: newPropertyArray[0].property_summary,
//       //   // department: newPropertyArray[0].property_department,
//       //   // business_office: newPropertyArray[0].property_business_office,
//       //   // member_name: newPropertyArray[0].property_member_name,
//       //   activity_date: newPropertyArray[0].property_date,
//       //   activity_year_month: newPropertyArray[0].property_year_month,
//       // };

//       // 更新されたPropertyデータをactivitiesテーブルにも反映UPDATE
//       // const { error: errorProperty } = await supabase
//       //   .from("activities")
//       //   .update(newPropertyData)
//       //   .eq("property_id", newPropertyArray[0].id);
//       // if (errorProperty) throw new Error(errorProperty.message);

//       // return newPropertyArray[0];
//     },
//     {
//       onSuccess: async (data) => {
//         const {
//           fieldName,
//           fieldNameForSelectedRowData,
//           newValue,
//           yearMonth,
//           yearQuarter,
//           yearHalf,
//           fiscalYear,
//           discountRate,
//         } = data;
//         console.log(
//           "✅✅✅✅✅✅✅updateMeetingFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess ",
//           "data",
//           data
//         );
//         // activitiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
//         await queryClient.invalidateQueries({ queryKey: ["properties"] });
//         await queryClient.invalidateQueries({ queryKey: ["activities"] });

//         // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
//         // setSelectedRowDataProperty(data[0]);

//         const fieldNameYearMonth = (field: string) => {
//           switch (field) {
//             case "property_date":
//               return "property_year_month";
//             case "expansion_date":
//               return "expansion_year_month";
//             case "sales_date":
//               return "sales_year_month";
//             case "expected_order_date":
//               return "expected_order_year_month";
//             default:
//               return "";
//               break;
//           }
//         };
//         const fieldNameQuarter = (field: string) => {
//           switch (field) {
//             case "property_date":
//               return "property_quarter";
//             case "expansion_date":
//               return "expansion_quarter";
//             case "sales_date":
//               return "sales_quarter";
//             case "expected_order_date":
//               return "expected_order_quarter";
//             default:
//               return "";
//               break;
//           }
//         };
//         const fieldNameHalfYear = (field: string) => {
//           switch (field) {
//             case "property_date":
//               return "property_half_year";
//             case "expansion_date":
//               return "expansion_half_year";
//             case "sales_date":
//               return "sales_half_year";
//             case "expected_order_date":
//               return "expected_order_half_year";
//             default:
//               return "";
//               break;
//           }
//         };
//         const fieldNameFiscalYear = (field: string) => {
//           switch (field) {
//             case "property_date":
//               return "property_fiscal_year";
//             case "expansion_date":
//               return "expansion_fiscal_year";
//             case "sales_date":
//               return "sales_fiscal_year";
//             case "expected_order_date":
//               return "expected_order_fiscal_year";
//             default:
//               return "";
//               break;
//           }
//         };

//         // 年月度も同時にZustandを更新する
//         if (!selectedRowDataProperty) return;
//         if (["property_date", "expansion_date", "sales_date"].includes(fieldName) && !!yearMonth) {
//           if (fieldName === "expansion_date" || fieldName === "sales_date") {
//             const newRowDataProperty = {
//               ...selectedRowDataProperty,
//               [fieldNameForSelectedRowData]: newValue,
//               [fieldNameYearMonth(fieldName)]: yearMonth,
//               [fieldNameQuarter(fieldName)]: yearQuarter,
//               [fieldNameHalfYear(fieldName)]: yearHalf,
//               [fieldNameFiscalYear(fieldName)]: fiscalYear,
//             };

//             setSelectedRowDataProperty(newRowDataProperty);
//           }
//           // // property_dateは順番が入れ替わるためnullにリセット
//           else if (fieldName === "property_date") {
//             const newRowDataProperty = {
//               ...selectedRowDataProperty,
//               [fieldNameForSelectedRowData]: newValue,
//               [fieldNameYearMonth(fieldName)]: yearMonth,
//               [fieldNameQuarter(fieldName)]: yearQuarter,
//               [fieldNameHalfYear(fieldName)]: yearHalf,
//               [fieldNameFiscalYear(fieldName)]: fiscalYear,
//             };

//             setSelectedRowDataProperty(newRowDataProperty);

//             // 活動日を更新すると順番が入れ替わり、選択中の行がメインテーブルの内容と異なるためリセット
//             // console.log("プロパティにproperty_dateが含まれているため選択中の行をリセット");
//             // setSelectedRowDataProperty(null);
//           }
//         }
//         // それ以外は普通にZustandを更新
//         else {
//           // 値引率も同時更新
//           if (["sales_price", "unit_sales", "discounted_price"].includes(fieldName)) {
//             // 売上価格0の場合、リセット
//             if (fieldName === "sales_price" && ["0", "０"].includes(newValue)) {
//               const newRowDataProperty = {
//                 ...selectedRowDataProperty,
//                 sales_price: "0",
//                 discounted_price: "0",
//                 discount_rate: "0",
//               };
//               setSelectedRowDataProperty(newRowDataProperty);
//             }
//             // 台数0の場合、リセット
//             else if (fieldName === "unit_sales" && ["0", "０", 0, null].includes(newValue)) {
//               const newRowDataProperty = {
//                 ...selectedRowDataProperty,
//                 unit_sales: null,
//                 discount_rate: null,
//               };
//               setSelectedRowDataProperty(newRowDataProperty);
//             }
//             // それ以外は値引率と合わせて更新
//             else if (discountRate) {
//               const newRowDataProperty = {
//                 ...selectedRowDataProperty,
//                 [fieldNameForSelectedRowData]: newValue,
//                 discount_rate: discountRate,
//               };
//               setSelectedRowDataProperty(newRowDataProperty);
//             }
//           } else if (fieldName === "expected_order_date") {
//             // 獲得予定日を更新すると順番が入れ替わり、選択中の行がメインテーブルの内容と異なるためリセット
//             console.log("プロパティにexpected_order_dateが含まれているため選択中の行をリセット");
//             setSelectedRowDataProperty(null);
//           }
//           // それ以外は単一のカラムを更新
//           else {
//             const newRowDataProperty = { ...selectedRowDataProperty, [fieldNameForSelectedRowData]: newValue };
//             setSelectedRowDataProperty(newRowDataProperty);
//           }
//         }

//         // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataCompanyを最新状態にする
//         // setIsUpdateRequiredForLatestSelectedRowDataCompany(true);

//         // if (loadingGlobalState) setLoadingGlobalState(false);
//         // toast.success("会社の更新が完了しました🌟", {
//         //   position: "top-right",
//         //   autoClose: 1500
//         // });
//       },
//       onError: (err: any) => {
//         // if (loadingGlobalState) setLoadingGlobalState(false);
//         console.error("フィールドエディットモード updateエラー", err);
//         console.error(`Update failed properties field` + err.message);
//         toast.error("アップデートに失敗しました...🙇‍♀️", {
//           position: "top-right",
//           autoClose: 1500,
//         });
//       },
//     }
//   );

//   return { updatePropertyFieldMutation };
// }
