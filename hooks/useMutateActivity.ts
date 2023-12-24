import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import { Activity, Activity_row_data } from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export const useMutateActivity = () => {
  const theme = useThemeStore((state) => state.theme);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const setIsOpenInsertNewActivityModal = useDashboardStore((state) => state.setIsOpenInsertNewActivityModal);
  const setIsOpenUpdateActivityModal = useDashboardStore((state) => state.setIsOpenUpdateActivityModal);
  // 選択中の行をクリック通知してselectedRowDataActivityを最新状態にアップデートする
  const setIsUpdateRequiredForLatestSelectedRowDataActivity = useDashboardStore(
    (state) => state.setIsUpdateRequiredForLatestSelectedRowDataActivity
  );

  // 選択中の行データと更新関数
  const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
  const setSelectedRowDataActivity = useDashboardStore((state) => state.setSelectedRowDataActivity);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  // 【Activity新規作成INSERT用createActivityMutation関数】
  const createActivityMutation = useMutation(
    async (newActivity: Omit<Activity, "id" | "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("activities").insert(newActivity);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["activities"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenInsertNewActivityModal(false);
        toast.success("活動の作成が完了しました🌟", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });

        // setTimeout(() => {
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   setIsOpenInsertNewActivityModal(false);
        //   toast.success("活動の作成に完了しました!", {
        //     position: "top-right",
        //     autoClose: 3000,
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
        // setIsOpenInsertNewActivityModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("活動の作成に失敗しました!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: `${theme === "light" ? "light" : "dark"}`,
        });
        // setTimeout(() => {
        //   if (loadingGlobalState) setLoadingGlobalState(false);
        //   // setIsOpenInsertNewActivityModal(false);
        //   alert(err.message);
        //   console.log("INSERTエラー", err.message);
        //   toast.error("活動の作成に失敗しました!", {
        //     position: "top-right",
        //     autoClose: 3000,
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

  // 【Activity一括編集UPDATE用updateActivityMutation関数】
  const updateActivityMutation = useMutation(
    async (newActivity: Omit<Activity, "created_at" | "updated_at">) => {
      // setLoadingGlobalState(true);
      const { error } = await supabase.from("activities").update(newActivity).eq("id", newActivity.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: async () => {
        // キャッシュのデータを再取得
        await queryClient.invalidateQueries({ queryKey: ["activities"] });
        // TanStack Queryでデータの変更に合わせて別のデータを再取得する
        // https://zenn.dev/masatakaitoh/articles/3c2f8602d2bb9d

        // 再度テーブルの選択セルのDOMをクリックしてselectedRowDataActivityを最新状態にする
        setIsUpdateRequiredForLatestSelectedRowDataActivity(true);

        if (loadingGlobalState) setLoadingGlobalState(false);
        setIsOpenUpdateActivityModal(false);
        toast.success("活動の更新が完了しました🌟", {
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
        //   setIsOpenUpdateActivityModal(false);
        //   toast.success("活動の更新完了しました!", {
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
        // setIsOpenUpdateActivityModal(false);
        alert(err.message);
        console.log("INSERTエラー", err.message);
        toast.error("活動の更新に失敗しました!", {
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
        //   // setIsOpenUpdateActivityModal(false);
        //   alert(err.message);
        //   console.log("INSERTエラー", err.message);
        //   toast.error("活動の更新に失敗しました!", {
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

  // 【Activityの個別フィールド毎に編集UPDATE用updateActivityFieldMutation関数】
  // MainContainerからダブルクリックでフィールドエディットモードに移行し、個別にフィールド入力、更新した時に使用 受け取る引数は一つのプロパティのみ
  type ExcludeKeys = "company_id" | "contact_id" | "activity_id"; // 除外するキー idはUPDATEすることは無いため
  type ActivityFieldNamesForSelectedRowData = Exclude<keyof Activity_row_data, ExcludeKeys>; // Contact_row_dataタイプのプロパティ名のみのデータ型を取得
  const updateActivityFieldMutation = useMutation(
    async (fieldData: {
      fieldName: string;
      fieldNameForSelectedRowData: ActivityFieldNamesForSelectedRowData;
      newValue: any;
      id: string;
    }) => {
      console.log("updateActivityFieldMutation実行 引数", fieldData);
      const { fieldName, fieldNameForSelectedRowData, newValue, id } = fieldData;
      const { data, error } = await supabase
        .from("activities")
        .update({ [fieldName]: newValue })
        .eq("id", id)
        .select();

      if (error) throw error;

      console.log("updateActivityFieldMutation実行完了 mutate data", data);

      return { data, fieldNameForSelectedRowData, newValue };
    },
    {
      onSuccess: async (response) => {
        const { fieldNameForSelectedRowData, newValue } = response;

        console.log(
          "updateActivityFieldMutation実行完了 キャッシュを更新して選択中のセルを再度クリックして更新 onSuccess data[0]",
          fieldNameForSelectedRowData,
          "newValue",
          newValue
        );

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["activities"] });

        if (!selectedRowDataActivity) return;
        // キャッシュ更新後ににZustandのsetSelectedRowDataActivityをupdateで取得したデータで更新する
        const newRowDataActivity = { ...selectedRowDataActivity, [fieldNameForSelectedRowData]: newValue };
        setSelectedRowDataActivity(newRowDataActivity);

        // 再度テーブルの選択セルのDOMをクリックしてsetSelectedRowDataActivityを最新状態にする
        // setIsUpdateRequiredForLatestsetSelectedRowDataActivity(true);

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

  return { createActivityMutation, updateActivityMutation, updateActivityFieldMutation };
};
