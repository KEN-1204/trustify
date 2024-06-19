import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Client_company } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { toast } from "react-toastify";

export const useMutateClientCompany = () => {
  const theme = useThemeStore((state) => state.theme);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const setIsOpenInsertNewClientCompanyModal = useDashboardStore((state) => state.setIsOpenInsertNewClientCompanyModal);
  const setIsOpenUpdateClientCompanyModal = useDashboardStore((state) => state.setIsOpenUpdateClientCompanyModal);
  // 選択中の行をクリック通知してselectedRowDataCompanyを最新状態にアップデートする
  const setIsUpdateRequiredForLatestSelectedRowDataCompany = useDashboardStore(
    (state) => state.setIsUpdateRequiredForLatestSelectedRowDataCompany
  );
  // 選択中の行データと更新関数
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const setSelectedRowDataCompany = useDashboardStore((state) => state.setSelectedRowDataCompany);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // type InsertPayload = Omit<Client_company, "id" | "created_at" | "updated_at"> & {
  //   product_categories_large_ids: number[];
  //   product_categories_medium_ids: number[];
  //   product_categories_small_ids: number[];
  // };

  // 会社INSERT用ペイロード 同時に製品分類を追加
  type InsertPayloadClientCompanyAndProductCategories = Omit<Client_company, "id" | "created_at" | "updated_at"> & {
    product_categories_all_ids: number[];
    // product_categories_large_ids: number[];
    // product_categories_medium_ids: number[];
    // product_categories_small_ids: number[];
    // 実施商品テーブル用と、同席者テーブル用
    // product_ids: (string | null)[];
    // attendee_ids: (string | null)[];
    // 紹介済み商品配列と同席者配列で削除が必要な個数
    // delete_product_count: number | null;
    // delete_attendee_count: number | null;
  };

  // 【ClientCompany新規作成INSERT用createClientCompanyMutation関数(同時に製品分類中間テーブルINSERT)】
  const createClientCompanyWithProductCategoriesMutation = useMutation(
    async (newClientCompany: InsertPayloadClientCompanyAndProductCategories) => {
      const insertClientCompanyPayload = {
        _created_by_company_id: newClientCompany.created_by_company_id,
        _created_by_user_id: newClientCompany.created_by_user_id,
        _created_by_department_of_user: newClientCompany.created_by_department_of_user,
        _created_by_section_of_user: newClientCompany.created_by_section_of_user,
        _created_by_unit_of_user: newClientCompany.created_by_unit_of_user,
        _created_by_office_of_user: newClientCompany.created_by_office_of_user,
        _name: newClientCompany.name,
        _department_name: newClientCompany.department_name,
        _email: newClientCompany.email,
        _main_phone_number: newClientCompany.main_phone_number,
        _main_fax: newClientCompany.main_fax,
        _zipcode: newClientCompany.zipcode,
        _address: newClientCompany.address,
        _country_id: newClientCompany.country_id,
        _region_id: newClientCompany.region_id,
        _city_id: newClientCompany.city_id,
        _street_address: newClientCompany.street_address,
        _building_name: newClientCompany.building_name,
        _department_contacts: newClientCompany.department_contacts,
        _industry_large: newClientCompany.industry_large,
        _industry_small: newClientCompany.industry_small,
        _industry_type_id: newClientCompany.industry_type_id,
        _product_category_large: newClientCompany.product_category_large,
        _product_category_medium: newClientCompany.product_category_medium,
        _product_category_small: newClientCompany.product_category_small,
        _number_of_employees_class: newClientCompany.number_of_employees_class,
        _number_of_employees: newClientCompany.number_of_employees,
        _fiscal_end_month: newClientCompany.fiscal_end_month,
        _capital: newClientCompany.capital,
        _budget_request_month1: newClientCompany.budget_request_month1,
        _budget_request_month2: newClientCompany.budget_request_month2,
        _website_url: newClientCompany.website_url,
        _clients: newClientCompany.clients,
        _supplier: newClientCompany.supplier,
        _business_content: newClientCompany.business_content,
        _established_in: newClientCompany.established_in,
        _representative_name: newClientCompany.representative_name,
        _chairperson: newClientCompany.chairperson,
        _senior_vice_president: newClientCompany.senior_vice_president,
        _senior_managing_director: newClientCompany.senior_managing_director,
        _managing_director: newClientCompany.managing_director,
        _director: newClientCompany.director,
        _auditor: newClientCompany.auditor,
        _board_member: newClientCompany.board_member,
        _manager: newClientCompany.manager,
        _member: newClientCompany.member,
        _facility: newClientCompany.facility,
        _business_sites: newClientCompany.business_sites,
        _overseas_bases: newClientCompany.overseas_bases,
        _group_company: newClientCompany.group_company,
        _corporate_number: newClientCompany.corporate_number,
        // 製品分類(大中小全て)
        _product_categories_all_ids: newClientCompany.product_categories_all_ids,
        // _product_categories_large_ids: newClientCompany.product_categories_large_ids,
        // _product_categories_medium_ids: newClientCompany.product_categories_medium_ids,
        // _product_categories_small_ids: newClientCompany.product_categories_small_ids,
      };

      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥rpc実行 insertClientCompanyPayload", insertClientCompanyPayload);

      const { error } = await supabase.rpc("insert_client_company_with_categories", insertClientCompanyPayload);
      // const { error } = await supabase.from("client_companies").insert(newClientCompany);

      if (error) throw error;

      console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥rpc成功");
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["companies"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        if (loadingGlobalState) setLoadingGlobalState(false);

        // 行が追加されて選択行と順番が変わるため選択行をリセット
        setSelectedRowDataCompany(null);

        // モーダルを閉じる
        setIsOpenInsertNewClientCompanyModal(false);

        toast.success("会社の作成が完了しました🌟");
      },
      onError: (err: any) => {
        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenInsertNewClientCompanyModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("会社の作成に失敗しました!");
      },
    }
  );

  // 【ClientCompany新規作成INSERT用createClientCompanyMutation関数】
  const createClientCompanyMutation = useMutation(
    async (newClientCompany: Omit<Client_company, "id" | "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("client_companies").insert(newClientCompany);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["companies"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        if (loadingGlobalState) setLoadingGlobalState(false);

        // 行が追加されて選択行と順番が変わるため選択行をリセット
        setSelectedRowDataCompany(null);

        // モーダルを閉じる
        setIsOpenInsertNewClientCompanyModal(false);

        toast.success("会社の作成が完了しました🌟", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });

        // setTimeout(() => {
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   setIsOpenInsertNewClientCompanyModal(false);
        //   toast.success("会社の作成に完了しました!", {
        //     position: "top-right",
        //     autoClose: 2000,
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
        setIsOpenInsertNewClientCompanyModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("会社の作成に失敗しました!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
        // setTimeout(() => {
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   setIsOpenInsertNewClientCompanyModal(false);
        //   alert(err.message);
        //   console.log("INSERTエラー", err.message);
        //   toast.error("会社の作成に失敗しました!", {
        //     position: "top-right",
        //     autoClose: 2000,
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

  // 【ClientCompany一括編集UPDATE用updateClientCompanyMutation関数】
  const updateClientCompanyMutation = useMutation(
    async (newClientCompany: Omit<Client_company, "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("client_companies").update(newClientCompany).eq("id", newClientCompany.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["companies"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataCompanyを最新状態にする
        setIsUpdateRequiredForLatestSelectedRowDataCompany(true);

        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenUpdateClientCompanyModal(false);
        toast.success("会社の更新が完了しました🌟", {
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
        //   setIsOpenUpdateClientCompanyModal(false);
        //   toast.success("会社の更新完了しました!", {
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
        setIsOpenUpdateClientCompanyModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("会社の更新に失敗しました!", {
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
        //   setIsOpenUpdateClientCompanyModal(false);
        //   alert(err.message);
        //   console.log("INSERTエラー", err.message);
        //   toast.error("会社の更新に失敗しました!", {
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

  // 【ClientCompanyの個別フィールド毎に編集UPDATE用updateClientCompanyFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  const updateClientCompanyFieldMutation = useMutation(
    async (fieldData: { fieldName: string; value: any; id: string }) => {
      const { fieldName, value, id } = fieldData;
      const { data, error } = await supabase
        .from("client_companies")
        .update({ [fieldName]: value })
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log("updateClientCompanyFieldMutation実行完了 mutate data", data);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateClientCompanyFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        setSelectedRowDataCompany(data[0]);

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["companies"] });

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
        console.error(`Update failed client_companies field` + err.message);
        toast.error("アップデートに失敗しました...", {
          position: "top-right",
          autoClose: 1500,
        });
      },
    }
  );

  // 【ClientCompanyの複数フィールドを編集UPDATE用updateMultipleClientCompanyFields関数】
  // 製品分類(大分類)を変更した際に、同時に製品分類(中分類)をnullに更新する関数
  type UpdateObject = { [key: string]: any };
  const updateMultipleClientCompanyFields = useMutation(
    async (fieldData: { updateObject: UpdateObject; id: string }) => {
      const { updateObject, id } = fieldData;
      const { data, error } = await supabase.from("client_companies").update(updateObject).eq("id", id).select();

      if (error) throw error;

      console.log("updateMultipleClientCompanyFields実行完了 mutate data", data);

      return data;
    },
    {
      onSuccess: async (data) => {
        console.log(
          "updateMultipleClientCompanyFields実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          data[0]
        );
        // キャッシュ更新より先にZustandのSelectedRowDataCompanyをupdateで取得したデータで更新する
        setSelectedRowDataCompany(data[0]);

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["companies"] });

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
        console.error(`Update failed client_companies field` + err.message);
        toast.error("アップデートに失敗しました...", {
          position: "top-right",
          autoClose: 1500,
        });
      },
    }
  );

  return {
    createClientCompanyWithProductCategoriesMutation,
    createClientCompanyMutation,
    updateClientCompanyMutation,
    updateClientCompanyFieldMutation,
    updateMultipleClientCompanyFields,
  };
};
