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

        // 行が追加されて選択行と順番が変わるため選択行をリセット
        setSelectedRowDataActivity(null);

        // モーダルを閉じる
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
  type ActivityFieldNamesForSelectedRowData = Exclude<keyof Activity_row_data, ExcludeKeys>; // Activity_row_dataタイプのプロパティ名のみのデータ型を取得
  const updateActivityFieldMutation = useMutation(
    async (fieldData: {
      fieldName: string;
      fieldNameForSelectedRowData: ActivityFieldNamesForSelectedRowData;
      newValue: any;
      id: string;
    }) => {
      console.log("updateActivityFieldMutation実行 引数", fieldData);

      const { fieldName, fieldNameForSelectedRowData, newValue, id } = fieldData;

      // // フィールド名がactivity_dateの場合には同時に年月度・四半期・半期・年度も同時に更新する
      // if (fieldName === 'activity_date') {
      // } else {
      // }

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

  // 【Activityの複数フィールドを編集UPDATE用updateActivityFieldMutation関数】
  // 活動日を編集の際に同時に活動年月度・四半期・半期・年度も編集する

  // type UpdateObject = { [key: string]: any };
  type UpdateObject = {
    fieldName: string;
    fieldNameForSelectedRowData: ActivityFieldNamesForSelectedRowData;
    newValue: any;
  };
  const updateActivityMultipleFieldMutation = useMutation(
    async (fieldData: { updateArray: UpdateObject[]; id: string }) => {
      console.log("updateActivityMultipleFieldMutation実行 引数", fieldData);
      const { updateArray, id } = fieldData;
      // テーブルの正式なフィールド名でのオブジェクトのみの配列にしてからreduceで全てのkey, valueを一つのオブジェクトにまとめる
      const newActualKeyValueArray = updateArray.map((obj) => ({ [obj.fieldName]: obj.newValue }));
      const updatePayload = newActualKeyValueArray.reduce((acc, obj) => ({ ...acc, ...obj }), {});

      console.log(
        "🔥updateActivityFieldMutation実行 更新実行 updatePayload",
        updatePayload,
        "変換前配列",
        newActualKeyValueArray,
        "引数 updateArray",
        updateArray
      );
      const { data, error } = await supabase.from("activities").update(updatePayload).eq("id", id).select();

      if (error) throw error;

      // SelectedRowData用のkey, valueのオブジェクトを一つのオブジェクトにまとめる「[{id: 1}, {name: ken}…]」の配列から「{id: 1, name: ken}」のオブジェクトに変換
      const newDisplayKeyValueArray = updateArray.map((obj) => ({ [obj.fieldNameForSelectedRowData]: obj.newValue }));
      const updateKeyValueArrayForSelectedRowData = newDisplayKeyValueArray.reduce(
        (acc, obj) => ({ ...acc, ...obj }),
        {}
      );

      console.log("✅updateActivityFieldMutation実行完了 data", data);

      return { data, updateKeyValueArrayForSelectedRowData };
    },
    {
      onSuccess: async (response) => {
        const { updateKeyValueArrayForSelectedRowData } = response;

        console.log(
          "updateActivityFieldMutation実行完了 キャッシュを更新して選択中のState用の更新オブジェクト onSuccess updateKeyValueArrayForSelectedRowData",
          updateKeyValueArrayForSelectedRowData
        );

        // companiesに関わるキャッシュのデータを再取得 => これをしないと既に取得済みのキャッシュは古い状態で表示されてしまう
        await queryClient.invalidateQueries({ queryKey: ["activities"] });

        if (!selectedRowDataActivity) return;
        if ("activity_date" in updateKeyValueArrayForSelectedRowData) {
          // 活動日を更新すると順番が入れ替わり、選択中の行がメインテーブルの内容と異なるためリセット
          console.log("プロパティにactivity_dateが含まれているため選択中の行をリセット");
          setSelectedRowDataActivity(null);
        } else {
          // キャッシュ更新後ににZustandのsetSelectedRowDataActivityをupdateで取得したデータで更新する
          const newRowDataActivity = { ...selectedRowDataActivity, ...updateKeyValueArrayForSelectedRowData };
          setSelectedRowDataActivity(newRowDataActivity);
        }
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

  return {
    createActivityMutation,
    updateActivityMutation,
    updateActivityFieldMutation,
    updateActivityMultipleFieldMutation,
  };
};
