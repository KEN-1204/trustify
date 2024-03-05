import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Quotation, QuotationProducts, Quotation_row_data } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dispatch, SetStateAction } from "react";
import { toast } from "react-toastify";

export const useMutateQuotation = () => {
  const theme = useThemeStore((state) => state.theme);
  // const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  // const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const isLoadingUpsertGlobal = useDashboardStore((state) => state.isLoadingUpsertGlobal);
  const setIsLoadingUpsertGlobal = useDashboardStore((state) => state.setIsLoadingUpsertGlobal);
  // const setIsOpenInsertNewQuotationModal = useDashboardStore((state) => state.setIsOpenInsertNewQuotationModal);
  // const setIsOpenUpdateQuotationModal = useDashboardStore((state) => state.setIsOpenUpdateQuotationModal);
  // 選択中の行をクリック通知してselectedRowDataPropertyを最新状態にアップデートする
  const setIsUpdateRequiredForLatestSelectedRowDataQuotation = useDashboardStore(
    (state) => state.setIsUpdateRequiredForLatestSelectedRowDataQuotation
  );

  // INSERTモード
  const setIsInsertModeQuotation = useDashboardStore((state) => state.setIsInsertModeQuotation);
  const setIsUpdateModeQuotation = useDashboardStore((state) => state.setIsUpdateModeQuotation);

  // 選択中の行データと更新関数
  const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);
  const setSelectedRowDataQuotation = useDashboardStore((state) => state.setSelectedRowDataQuotation);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // type CreateProps = {
  // newQuotation: Omit<Quotation, "id" | "created_at" | "updated_at"> & {
  //   quotation_products_array: Omit<QuotationProducts, "id" | "created_at" | "updated_at">[];
  // };
  //   isLoadingUpsert: boolean;
  //   setIsLoadingUpsert: Dispatch<SetStateAction<boolean>>;
  // };

  type InsertPayload = Omit<Quotation, "id" | "created_at" | "updated_at"> & {
    quotation_products_array: Omit<QuotationProducts, "id" | "created_at" | "updated_at">[];
  };

  // async ({ newQuotation, isLoadingUpsert, setIsLoadingUpsert }: CreateProps) => {

  // 【Quotation新規作成INSERT用createQuotationMutation関数】
  const createQuotationMutation = useMutation(
    async (newQuotation: InsertPayload) => {
      const newQuotationAndActivityPayload = {
        // 見積テーブル
        _submission_class: newQuotation.submission_class,
        _quotation_date: newQuotation.quotation_date,
        _expiration_date: newQuotation.expiration_date,
        _deadline: newQuotation.deadline,
        _delivery_place: newQuotation.delivery_place,
        _payment_terms: newQuotation.payment_terms,
        _quotation_division: newQuotation.quotation_division,
        _sending_method: newQuotation.sending_method,
        _use_corporate_seal: newQuotation.use_corporate_seal,
        _quotation_notes: newQuotation.quotation_notes,
        _sales_tax_class: newQuotation.sales_tax_class,
        _sales_tax_rate: newQuotation.sales_tax_rate,
        _total_price: newQuotation.total_price,
        _discount_amount: newQuotation.discount_amount,
        _discount_rate: newQuotation.discount_rate,
        _discount_title: newQuotation.discount_title,
        _total_amount: newQuotation.total_amount,
        _quotation_remarks: newQuotation.quotation_remarks,
        _set_item_count: newQuotation.set_item_count,
        _set_unit_name: newQuotation.set_unit_name,
        _set_price: newQuotation.set_price,
        _lease_period: newQuotation.lease_period,
        _lease_rate: newQuotation.lease_rate,
        _lease_monthly_fee: newQuotation.lease_monthly_fee,
        _created_by_company_id: newQuotation.created_by_company_id,
        _created_by_user_id: newQuotation.created_by_user_id,
        _created_by_department_of_user: newQuotation.created_by_department_of_user,
        _created_by_section_of_user: newQuotation.created_by_section_of_user,
        _created_by_unit_of_user: newQuotation.created_by_unit_of_user,
        _created_by_office_of_user: newQuotation.created_by_office_of_user,
        _client_company_id: newQuotation.client_company_id,
        _client_contact_id: newQuotation.client_contact_id,
        _destination_company_id: newQuotation.destination_company_id,
        _destination_contact_id: newQuotation.destination_contact_id,
        _in_charge_stamp_id: newQuotation.in_charge_stamp_id,
        _in_charge_user_id: newQuotation.in_charge_user_id,
        _supervisor1_stamp_id: newQuotation.supervisor1_stamp_id,
        _supervisor1_user_id: newQuotation.supervisor1_user_id,
        _supervisor2_stamp_id: newQuotation.supervisor2_stamp_id,
        _supervisor2_user_id: newQuotation.supervisor2_user_id,
        _quotation_no_custom: newQuotation.quotation_no_custom,
        _quotation_no_system: newQuotation.quotation_no_system,
        _quotation_member_name: newQuotation.quotation_member_name,
        _quotation_business_office: newQuotation.quotation_business_office,
        _quotation_department: newQuotation.quotation_department,
        _quotation_year_month: newQuotation.quotation_year_month,
        _quotation_title: newQuotation.quotation_title,
        _in_charge_stamp_flag: newQuotation.in_charge_stamp_flag,
        _supervisor1_stamp_flag: newQuotation.supervisor1_stamp_flag,
        _supervisor2_stamp_flag: newQuotation.supervisor2_stamp_flag,
        _in_charge_stamp_name: newQuotation.in_charge_stamp_name,
        _supervisor1_stamp_name: newQuotation.supervisor1_stamp_name,
        _supervisor2_stamp_name: newQuotation.supervisor2_stamp_name,
        // 見積商品リスト
        _quotation_products_array: newQuotation.quotation_products_array,
        // -- 活動テーブル用
        _summary: null,
        _scheduled_follow_up_date: null,
        _follow_up_flag: false,
        _document_url: null,
        _activity_type: "見積",
        _claim_flag: false,
        _product_introduction1: null,
        _product_introduction2: null,
        _product_introduction3: null,
        _product_introduction4: null,
        _product_introduction5: null,
        _department: newQuotation.quotation_department,
        _business_office: newQuotation.quotation_business_office,
        _member_name: newQuotation.quotation_member_name,
        _priority: null,
        _activity_date: newQuotation.quotation_date,
        _activity_year_month: newQuotation.quotation_year_month,
        _meeting_id: null,
        _property_id: null,
      };

      // insert_quotation_schedule_and_activity rpc

      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥rpc実行 newQuotationAndActivityPayload", newQuotationAndActivityPayload);

      // 見積・商品リスト・活動の3つのテーブルにINSERT
      const { error } = await supabase.rpc("insert_quotation_with_products", newQuotationAndActivityPayload);

      if (error) throw error;
    },
    {
      onSuccess: async (data, variables) => {
        // const { isLoadingUpsert, setIsLoadingUpsert } = variables;
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["quotations"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d
        // if (loadingGlobalState) setLoadingGlobalState(false);
        if (isLoadingUpsertGlobal) setIsLoadingUpsertGlobal(false);

        // console.log("選択中の行をリセット");
        // setSelectedRowDataQuotation(null);

        // setIsOpenInsertNewQuotationModal(false);
        setIsInsertModeQuotation(false);
        toast.success("見積の作成が完了しました🌟", {
          position: "top-right",
          autoClose: 3000,
        });
      },
      onError: (err: any, variables) => {
        // const { isLoadingUpsert, setIsLoadingUpsert } = variables;
        // if (loadingGlobalState) setLoadingGlobalState(false);
        if (isLoadingUpsertGlobal) setIsLoadingUpsertGlobal(false);
        // setIsOpenInsertNewQuotationModal(false);
        // alert(err.message);
        setIsInsertModeQuotation(false);
        console.error("見積INSERTエラー", err);
        toast.error("見積の作成に失敗しました...🙇‍♀️", {
          position: "top-right",
          autoClose: 3000,
        });
      },
    }
  );

  type UpdatePayload = Omit<Quotation, "created_at" | "updated_at"> & {
    quotation_products_array: Omit<QuotationProducts, "id" | "created_at" | "updated_at">[];
    new_quotation_product_ids: string[];
    delete_product_count: number;
  };

  // 【Quotation一括編集UPDATE用updateQuotationMutation関数】
  const updateQuotationMutation = useMutation(
    // async (newQuotation: Omit<Quotation, "created_at" | "updated_at">) => {
    async (newQuotation: UpdatePayload) => {
      const updateQuotationAndActivityPayload = {
        // 見積テーブル
        _quotation_id: newQuotation.id,
        _submission_class: newQuotation.submission_class,
        _quotation_date: newQuotation.quotation_date,
        _expiration_date: newQuotation.expiration_date,
        _deadline: newQuotation.deadline,
        _delivery_place: newQuotation.delivery_place,
        _payment_terms: newQuotation.payment_terms,
        _quotation_division: newQuotation.quotation_division,
        _sending_method: newQuotation.sending_method,
        _use_corporate_seal: newQuotation.use_corporate_seal,
        _quotation_notes: newQuotation.quotation_notes,
        _sales_tax_class: newQuotation.sales_tax_class,
        _sales_tax_rate: newQuotation.sales_tax_rate,
        _total_price: newQuotation.total_price,
        _discount_amount: newQuotation.discount_amount,
        _discount_rate: newQuotation.discount_rate,
        _discount_title: newQuotation.discount_title,
        _total_amount: newQuotation.total_amount,
        _quotation_remarks: newQuotation.quotation_remarks,
        _set_item_count: newQuotation.set_item_count,
        _set_unit_name: newQuotation.set_unit_name,
        _set_price: newQuotation.set_price,
        _lease_period: newQuotation.lease_period,
        _lease_rate: newQuotation.lease_rate,
        _lease_monthly_fee: newQuotation.lease_monthly_fee,
        _created_by_company_id: newQuotation.created_by_company_id,
        _created_by_user_id: newQuotation.created_by_user_id,
        _created_by_department_of_user: newQuotation.created_by_department_of_user,
        _created_by_section_of_user: newQuotation.created_by_section_of_user,
        _created_by_unit_of_user: newQuotation.created_by_unit_of_user,
        _created_by_office_of_user: newQuotation.created_by_office_of_user,
        _client_company_id: newQuotation.client_company_id,
        _client_contact_id: newQuotation.client_contact_id,
        _destination_company_id: newQuotation.destination_company_id,
        _destination_contact_id: newQuotation.destination_contact_id,
        _in_charge_stamp_id: newQuotation.in_charge_stamp_id,
        _in_charge_user_id: newQuotation.in_charge_user_id,
        _supervisor1_stamp_id: newQuotation.supervisor1_stamp_id,
        _supervisor1_user_id: newQuotation.supervisor1_user_id,
        _supervisor2_stamp_id: newQuotation.supervisor2_stamp_id,
        _supervisor2_user_id: newQuotation.supervisor2_user_id,
        _quotation_no_custom: newQuotation.quotation_no_custom,
        _quotation_no_system: newQuotation.quotation_no_system,
        _quotation_member_name: newQuotation.quotation_member_name,
        _quotation_business_office: newQuotation.quotation_business_office,
        _quotation_department: newQuotation.quotation_department,
        _quotation_year_month: newQuotation.quotation_year_month,
        _quotation_title: newQuotation.quotation_title,
        _in_charge_stamp_flag: newQuotation.in_charge_stamp_flag,
        _supervisor1_stamp_flag: newQuotation.supervisor1_stamp_flag,
        _supervisor2_stamp_flag: newQuotation.supervisor2_stamp_flag,
        _in_charge_stamp_name: newQuotation.in_charge_stamp_name,
        _supervisor1_stamp_name: newQuotation.supervisor1_stamp_name,
        _supervisor2_stamp_name: newQuotation.supervisor2_stamp_name,
        // 見積商品リスト
        _quotation_products_array: newQuotation.quotation_products_array,
        // 見積商品削除関連 NOT IN用の新たな商品id配列と、削除数
        _new_quotation_product_ids: newQuotation.new_quotation_product_ids,
        _delete_product_count: newQuotation.delete_product_count,
        // -- 活動テーブル用
        // _summary: null,
        // _scheduled_follow_up_date: null,
        // _follow_up_flag: false,
        // _document_url: null,
        // _activity_type: "見積",
        // _claim_flag: false,
        // _product_introduction1: null,
        // _product_introduction2: null,
        // _product_introduction3: null,
        // _product_introduction4: null,
        // _product_introduction5: null,
        _department: newQuotation.quotation_department,
        _business_office: newQuotation.quotation_business_office,
        _member_name: newQuotation.quotation_member_name,
        // _priority: null,
        _activity_date: newQuotation.quotation_date,
        _activity_year_month: newQuotation.quotation_year_month,
        // _meeting_id: null,
        // _property_id: null,
        // _quotation_id: null,
      };

      console.log("🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠🌠rpc実行 updateQuotationAndActivityPayload", updateQuotationAndActivityPayload);

      // 見積UPDATEと、商品リストのUPSERTとDELETE、活動UPDATE
      const { error } = await supabase.rpc("update_quotation_with_products", updateQuotationAndActivityPayload);

      if (error) throw error;

      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥rpc成功");
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["quotations"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        // if (loadingGlobalState) setLoadingGlobalState(false);
        if (isLoadingUpsertGlobal) setIsLoadingUpsertGlobal(false);
        // setIsOpenUpdateQuotationModal(false);
        setIsUpdateModeQuotation(false);
        toast.success("見積の更新が完了しました🌟", {
          position: "top-right",
          // autoClose: 1500,
        });

        // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataQuotationを最新状態にする(一括更新の場合UPDATEされた行データを現在選択中のZustandのstateにスプレッドで割り当てようとしても結合してエイリアスを複数使っているのと、実施済み商品と同席者の複数テーブルへのクエリなのでinvalidateQueryのよってstaleにして新たに再フェッチしたデータをクリックしてメインテーブルにデータを反映させる)
        setIsUpdateRequiredForLatestSelectedRowDataQuotation(true);
      },
      onError: (err: any) => {
        // if (loadingGlobalState) setLoadingGlobalState(false);
        if (isLoadingUpsertGlobal) setIsLoadingUpsertGlobal(false);
        // setIsOpenUpdateQuotationModal(false);
        setIsUpdateModeQuotation(false);
        console.error("見積UPDATEエラー", err);
        toast.error("見積の更新に失敗しました...🙇‍♀️", {
          position: "top-right",
          // autoClose: 1500,
        });
      },
    }
  );

  // 【Quotationの個別フィールド毎に編集UPDATE用updateQuotationFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  type ExcludeKeys = "company_id" | "contact_id" | "quotation_id"; // 除外するキー idはUPDATEすることは無いため
  type QuotationFieldNamesForSelectedRowData = Exclude<keyof Quotation_row_data, ExcludeKeys>;
  const updateQuotationFieldMutation = useMutation(
    async (fieldData: {
      fieldName: string;
      fieldNameForSelectedRowData: QuotationFieldNamesForSelectedRowData;
      newValue: any;
      id: string;
      quotationYearMonth?: number | null;
      leaseMonthlyFee?: string | null;
    }) => {
      console.log("updateQuotationFieldMutation 引数取得", fieldData);
      const { fieldName, fieldNameForSelectedRowData, newValue, id, quotationYearMonth, leaseMonthlyFee } = fieldData;

      // 🔹rpcでquotationsとactivitiesテーブルを同時に更新
      if (["quotation_date"].includes(fieldName)) {
        // quotation_dateの場合は見積年月度も同時にquotationsテーブルに更新 同時にactivitiesテーブルも更新
        if (fieldName === "quotation_date" && !!quotationYearMonth) {
          const jsonValue = { value: newValue };
          const updatePayload = {
            _quotation_id: id,
            _column_name: fieldName,
            _json_value: jsonValue,
            _quotation_year_month: quotationYearMonth,
          };

          console.log("updateQuotationFieldMutation rpc実行 ", "カラム名", fieldName, "updatePayload", updatePayload);

          const { error } = await supabase.rpc("update_quotations_field", updatePayload);

          if (error) throw error;
        }
      }
      // 🔹リース料率と月額リース料
      else if (["lease_rate"].includes(fieldName)) {
        const updatePayload = {
          lease_rate: newValue,
          lease_monthly_fee: leaseMonthlyFee,
        };
        const { data, error } = await supabase.from("quotations").update(updatePayload).eq("id", id).select();

        if (error) throw error;

        console.log("updateQuotationFieldMutation実行完了 mutate data", data);
      }
      // 🔹quotationsテーブルのみ更新
      else {
        const { data, error } = await supabase
          .from("quotations")
          .update({ [fieldName]: newValue })
          .eq("id", id)
          .select();

        if (error) throw error;

        console.log("updateQuotationFieldMutation実行完了 mutate data", data);
        // return data;
      }

      return { fieldNameForSelectedRowData, newValue, quotationYearMonth, leaseMonthlyFee };
    },
    {
      onSuccess: async (data) => {
        const { fieldNameForSelectedRowData, newValue, quotationYearMonth, leaseMonthlyFee } = data;
        console.log(
          "✅✅✅✅✅✅✅updateQuotationFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess ",
          "fieldNameForSelectedRowData",
          fieldNameForSelectedRowData,
          "newValue",
          newValue
        );

        // activitiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["quotations"] });
        await queryClient.invalidateQueries({ queryKey: ["activities"] });

        if (!selectedRowDataQuotation) return;
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        // setSelectedRowDataQuotation(data[0]);
        if (fieldNameForSelectedRowData === "quotation_date") {
          // 活動日を更新すると順番が入れ替わり、選択中の行がメインテーブルの内容と異なるためリセット
          console.log("プロパティにquotation_dateが含まれているため選択中の行をリセット");
          setSelectedRowDataQuotation(null);
        } else if (fieldNameForSelectedRowData === "lease_rate") {
          const newRowDataQuotation = {
            ...selectedRowDataQuotation,
            [fieldNameForSelectedRowData]: newValue,
            lease_monthly_fee: leaseMonthlyFee ?? "",
          };
          setSelectedRowDataQuotation(newRowDataQuotation);
        } else {
          const newRowDataQuotation = { ...selectedRowDataQuotation, [fieldNameForSelectedRowData]: newValue };
          setSelectedRowDataQuotation(newRowDataQuotation);
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
          autoClose: 3000,
        });
      },
    }
  );

  return { createQuotationMutation, updateQuotationMutation, updateQuotationFieldMutation };
};
