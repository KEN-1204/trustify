import useDashboardStore from "@/store/useDashboardStore";
import styles from "./DashboardSDBComponent.module.css";
import { ScreenDealBoards } from "./ScreenDealBoards/ScreenDealBoards";
import { ScreenTaskBoards } from "./TaskBoard/ScreenTaskBoards";
import useThemeStore from "@/store/useThemeStore";
import { Suspense, useEffect, useState } from "react";
import { DotsGradient } from "../Parts/DotsGradient/DotsGradient";
import { EditModalDealCard } from "./ScreenDealBoards/EditModalDealCard/EditModalDealCard";
import { SalesProgressScreen } from "./SalesProgressScreen/SalesProgressScreen";
import { ErrorBoundary } from "react-error-boundary";
import { FallbackSalesProgressScreen } from "./SalesProgressScreen/FallbackSalesProgressScreen";
import { ErrorFallback } from "../ErrorFallback/ErrorFallback";
import { GradientModal } from "../Parts/GradientModal/GradientModal";
import { ConfirmationModal } from "../DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { DealCardType, Property_row_data } from "@/types";
import { toast } from "react-toastify";

export const DashboardSDBComponent = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const setTheme = useThemeStore((state) => state.setTheme);
  const isOpenSidebar = useDashboardStore((state) => state.isOpenSidebar);
  const setIsOpenSidebar = useDashboardStore((state) => state.setIsOpenSidebar);
  const activeTabSDB = useDashboardStore((state) => state.activeTabSDB);
  const activeThemeColor = useDashboardStore((state) => state.activeThemeColor);
  const setActiveThemeColor = useDashboardStore((state) => state.setActiveThemeColor);
  const selectedFiscalYearTargetSDB = useDashboardStore((state) => state.selectedFiscalYearTargetSDB);
  const activePeriodSDB = useDashboardStore((state) => state.activePeriodSDB);

  // 上期・下期割り当てをアンマウント時に上期に戻す
  // const selectedPeriodTypeForMemberLevel = useDashboardStore((state) => state.selectedPeriodTypeForMemberLevel);
  // const setSelectedPeriodTypeForMemberLevel = useDashboardStore((state) => state.setSelectedPeriodTypeForMemberLevel);

  // useEffect(() => {
  //   return () => {
  //     if (selectedPeriodTypeForMemberLevel === "second_half_details")
  //       setSelectedPeriodTypeForMemberLevel("first_half_details");
  //   };
  // }, []);

  useEffect(() => {
    // テーマカラーをローカルストレージから取得して反映
    const themeColor = localStorage.getItem("theme_color");
    console.log("DashboardSDBComponentコンポーネントローカルストレージから取得 themeColor", themeColor);
    if (
      !!themeColor &&
      activeThemeColor !== themeColor &&
      ["theme-brand-f", "theme-brand-f-gradient", "theme-black-gradient", "theme-simple12", "theme-simple17"].includes(
        themeColor
      )
    ) {
      setActiveThemeColor(
        themeColor as
          | "theme-brand-f"
          | "theme-brand-f-gradient"
          | "theme-black-gradient"
          | "theme-simple12"
          | "theme-simple17"
      ); // 既に存在する場合のみ反映
    }
    if (themeColor === null) {
      // テーマをdarkに変更
      setTheme("dark");
    }
  }, []);

  const getThemeBG = () => {
    switch (activeThemeColor) {
      case "theme-brand-f":
        return styles.brand_f;
      case "theme-brand-f-gradient":
        return styles.brand_f;
      case "theme-black-gradient":
        return styles.black_gradient;
      case "theme-simple12":
        return styles.simple12;
      case "theme-simple17":
        return styles.simple17;
      default:
        return styles.brand_f;
        break;
    }
  };

  // 選択中のネタカード
  const selectedDealCard = useDashboardStore((state) => state.selectedDealCard);
  const setSelectedDealCard = useDashboardStore((state) => state.setSelectedDealCard);
  // ネタカードクリック時に表示する概要モーダル
  const isOpenDealCardModal = useDashboardStore((state) => state.isOpenDealCardModal);

  // ------------------------------ お祝いモーダル関連 ------------------------------
  const isOpenCongratulationsModal = useDashboardStore((state) => state.isOpenCongratulationsModal);
  const setIsOpenCongratulationsModal = useDashboardStore((state) => state.setIsOpenCongratulationsModal);
  const setIsRequiredInputSoldProduct = useDashboardStore((state) => state.setIsRequiredInputSoldProduct);
  const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
  const setSelectedRowDataProperty = useDashboardStore((state) => state.setSelectedRowDataProperty);
  const setIsOpenUpdatePropertyModal = useDashboardStore((state) => state.setIsOpenUpdatePropertyModal);

  // 🔹受注済みに変更後に表示するモーダルの「反映する」ボタンクリック時に実行される関数
  const handleClickActiveSoldModal = () => {
    setIsOpenUpdatePropertyModal(true); // 案件編集モーダルを開く
    setIsRequiredInputSoldProduct(true); // 案件編集モーダルに受注後売上入力ステータスを渡す
    setIsOpenCongratulationsModal(false); // お祝いモーダルを閉じる
  };

  // 🔹受注済みに変更後に表示するモーダルの「閉じる」ボタンクリック時に実行される関数
  const handleClickCancelSoldModal = async () => {
    // --------------------------------- キャッシュinvalidate ---------------------------------
    // 「A 受注済み」に移動された案件が、既に「売上金額、売上商品」が入力済みで戻るボタンが押された場合には、
    // このタイミングで売上推移チャートと達成率チャートのキャッシュをinvalidateする
    // キャッシュのデータを再取得

    if (selectedDealCard) {
      const dealCard = selectedDealCard?.dealCard;
      if (
        dealCard &&
        !!dealCard.sales_price &&
        !!dealCard.sold_product &&
        !!dealCard.sold_product_id &&
        dealCard.current_status === "D Order Received"
      ) {
        // 🔹売上推移のキャッシュを更新 ---------------------------------
        const queryKeySalesTrend = ["sales_trends", selectedFiscalYearTargetSDB, "member", activePeriodSDB?.period, 3];

        await queryClient.invalidateQueries({ queryKey: queryKeySalesTrend });
        // 🔹売上推移のキャッシュを更新 ここまで ---------------------------------
        // 🔹達成率のキャッシュを更新 ---------------------------------
        const queryKeySalesProcesses = [
          "sales_processes_for_progress",
          selectedFiscalYearTargetSDB,
          activePeriodSDB?.periodType,
          activePeriodSDB?.period,
          // selectedDealCard.ownerId,
        ];

        await queryClient.invalidateQueries({ queryKey: queryKeySalesProcesses });
        // 🔹達成率のキャッシュを更新 ここまで ---------------------------------
      }

      // 売上金額と売上商品の入力有無に関係なくdealsのキャッシュは更新する dealsキャッシュはDealBoardsで更新時点でキャッシュも更新済み
      // // 🔹ネタ表ボードのキャッシュを更新 ---------------------------------
      // if (selectedRowDataProperty) {
      //   const currentQueryKey = [
      //     "deals",
      //     selectedDealCard?.ownerId,
      //     activePeriodSDB?.periodType,
      //     activePeriodSDB?.period,
      //   ];
      //   const prevCacheDeals: Property_row_data[] | undefined = queryClient.getQueryData(currentQueryKey);
      //   // キャッシュの配列から今回更新した案件idのオブジェクトのみ更新してキャッシュを更新
      //   if (!!prevCacheDeals?.length) {
      //     const newDeals = prevCacheDeals.map((obj) => {
      //       return obj.property_id === selectedRowDataProperty.property_id ? selectedRowDataProperty : obj;
      //     });
      //     console.log("キャッシュを更新", newDeals, "前のキャッシュ", prevCacheDeals);
      //     queryClient.setQueryData(currentQueryKey, newDeals);
      //   }
      // }

      // // Zustandの選択中のカードも更新して、ローカルstateのネタカードも同時更新してUIに反映
      // const updatedCard = {
      //   ownerId: selectedDealCard.ownerId,
      //   dealCard: { ...selectedDealCard.dealCard, ...selectedRowDataProperty },
      // };
      // console.log("🔥Zustandも更新 updatedCard", updatedCard);
      // setSelectedDealCard(updatedCard);

      // // ローカルstateを更新するためのトリガーをON
      // setIsRequiredRefreshDealCards(true);
      // // 🔹ネタ表ボードのキャッシュを更新 ここまで ---------------------------------
    }
    // --------------------------------- キャッシュinvalidate ここまで ---------------------------------

    setSelectedRowDataProperty(null); // 選択中のRowDataをリセット
    setIsOpenCongratulationsModal(false); // お祝いモーダルを閉じる
  };
  // ------------------------------ お祝いモーダル関連 ------------------------------
  // ------------------------------ 売上データリセット確認モーダル関連 ------------------------------
  const isOpenResetSalesConfirmationModal = useDashboardStore((state) => state.isOpenResetSalesConfirmationModal);
  const setIsOpenResetSalesConfirmationModal = useDashboardStore((state) => state.setIsOpenResetSalesConfirmationModal);
  const setIsRequiredRefreshDealCards = useDashboardStore((state) => state.setIsRequiredRefreshDealCards);
  // ------------------------------ 売上データリセット確認モーダル関連 ------------------------------

  const [isLoading, setIsLoading] = useState(false);

  console.log("DashboardSDBComponentレンダリング activeThemeColor", activeThemeColor);

  return (
    <>
      <div className={`flex-center ${styles.app_main_container} transition-bg05 relative ${getThemeBG()}`}>
        {["theme-brand-f", "theme-brand-f-gradient"].includes(activeThemeColor) && <DotsGradient />}
        {/* サイドバー表示時オーバーレイ */}
        {isOpenSidebar && <div className={`${styles.sidebar_overlay}`} onClick={() => setIsOpenSidebar(false)}></div>}
        <div className={`${styles.main_contents_wrapper} `}>
          {/* 上ヘッダーサイズ分のスペーサー */}
          <div
            // className={`${styles.spacer_top} ${
            //   activeThemeColor === "theme-simple12" ? `bg-[var(--color-sdb-header-white)]` : ``
            // }`}
            className={`${styles.spacer_top}`}
            style={{ display: `none` }}
          ></div>
          {/* ===================== スクロールコンテナ ここから ===================== */}
          <div
            className={`${styles.main_contents_container}`}
            style={{ height: `100vh`, paddingTop: `var(--header-height)` }}
          >
            {/* １画面目  */}
            {activeTabSDB === "sales_progress" && (
              <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Suspense fallback={<FallbackSalesProgressScreen />}>
                  <SalesProgressScreen />
                </Suspense>
              </ErrorBoundary>
            )}
          </div>
        </div>
      </div>
      {/* ------------------- ネタ表 詳細・編集モーダル ------------------- */}
      {isOpenDealCardModal && selectedDealCard && <EditModalDealCard />}
      {/* ------------------- ネタ表 詳細・編集モーダル ここまで ------------------- */}
      {/* ------------------- 受注済みに変更後の売上入力モーダル ------------------- */}
      {isOpenCongratulationsModal && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div></div>}>
            <GradientModal
              title1="受注おめでとう🎉"
              title2="ダッシュボードに売上を反映させましょう！"
              tagText="受注"
              contentText="受注済みの案件に「売上商品・売上価格・売上日付」を記録することでダッシュボード上に売上実績と達成率が反映されます。"
              btnActiveText="反映する"
              btnCancelText="閉じる"
              illustText="受注おめでとうございます！"
              handleClickActive={handleClickActiveSoldModal}
              handleClickCancel={handleClickCancelSoldModal}
            />
          </Suspense>
        </ErrorBoundary>
      )}
      {/* ------------------- 受注済みに変更後の売上入力モーダル ここまで ------------------- */}

      {/* -------------------------- 受注済みから他へ移動時の売上リセット確認モーダル -------------------------- */}
      {isOpenResetSalesConfirmationModal && selectedDealCard && selectedRowDataProperty && (
        <ConfirmationModal
          isLoadingState={isLoading}
          clickEventClose={() => {
            if (isLoading) return;
            setSelectedDealCard(null);
            setSelectedRowDataProperty(null);
            setIsOpenResetSalesConfirmationModal(false); // 確認モーダルを閉じる
          }}
          // titleText="面談データの自社担当を変更してもよろしいですか？"
          titleText={`この案件の売上データを取り消しますか？`}
          // titleText2={`データの所有者を変更しますか？`}
          sectionP1={`移動した案件の「売上商品や売上金額、売上日付」などの売上関連データをリセットします。`}
          // sectionP2="※閉じるを押した場合でも既に現ステータスは「受注」から「展開」に変更済みのため売上実績には反映されています。"
          withAnnotation
          annotationText="※閉じるを押した場合でも既に現ステータスは「受注」から「展開」に変更済みのため売上実績には反映されています。"
          cancelText="閉じる"
          submitText="削除する"
          clickEventSubmit={async () => {
            // ローディング開始
            setIsLoading(true);

            try {
              const updatePayload = {
                // current_status: "B Deal Development",
                sales_date: null,
                sales_year_month: null,
                sales_quarter: null,
                sales_half_year: null,
                sales_fiscal_year: null,
                sales_price: null,
                sold_product: null,
                sold_product_id: null,
                unit_sales: null,
                sales_contribution_category: null,
                discounted_price: null,
                discount_rate: null,
                sales_class: null,
              };

              console.log(
                "削除実行🔥 updatePayload",
                updatePayload,
                "selectedDealCard.dealCard.property_id",
                selectedDealCard.dealCard.property_id,
                "selectedDealCard",
                selectedDealCard
              );

              const { data, error } = await supabase
                .from("properties")
                .update(updatePayload)
                .eq("id", selectedDealCard.dealCard.property_id)
                .select();

              if (error) throw error;

              console.log("削除実行成功✅ data", data);

              // キャッシュを更新
              await queryClient.invalidateQueries({ queryKey: ["properties"] });
              // await queryClient.invalidateQueries({ queryKey: ["activities"] });

              // 売上進捗と達成率チャートはDealBoardコンポーネントでinvalidate(現ステータス変更のタイミングで売上実績が変更されるため)

              // 🔹ネタ表ボードのキャッシュを更新 ---------------------------------
              const currentQueryKey = [
                "deals",
                selectedDealCard.ownerId,
                activePeriodSDB?.periodType,
                activePeriodSDB?.period,
              ];
              const prevCacheDeals: Property_row_data[] | undefined = queryClient.getQueryData(currentQueryKey);
              // キャッシュの配列から今回更新した案件idのオブジェクトのみ更新してキャッシュを更新
              if (!!prevCacheDeals?.length) {
                const newDeals = prevCacheDeals.map((obj) => {
                  return obj.property_id === selectedRowDataProperty.property_id ? data[0] : obj;
                });
                console.log("キャッシュを更新", newDeals, "前のキャッシュ", prevCacheDeals);
                queryClient.setQueryData(currentQueryKey, newDeals);
              }

              // Zustandの選択中のカードも更新して、ローカルstateのネタカードも同時更新してUIに反映
              const updatedCard = {
                ownerId: selectedDealCard.ownerId,
                dealCard: { ...data[0], column_title_num: selectedDealCard.dealCard.column_title_num } as DealCardType,
              };
              console.log("🔥Zustandも更新 updatedCard", updatedCard);
              setSelectedDealCard(updatedCard);

              // ローカルstateを更新するためのトリガーをON
              setIsRequiredRefreshDealCards(true);
              // 🔹ネタ表ボードのキャッシュを更新 ここまで ---------------------------------

              toast.success(`削除に成功しました🌟`);

              // ローディング終了
              setIsLoading(false);
              // setSelectedDealCard(null); // Dealコンポーネントのネタ表ボードサイドで更新後に空にするためここではリセットせず
              setSelectedRowDataProperty(null);
              setIsOpenResetSalesConfirmationModal(false); // 確認モーダルを閉じる
            } catch (error: any) {
              console.error("エラー：", error);
              toast.error(`削除に失敗しました...🙇‍♀️`);
              // ローディング終了
              setIsLoading(false);
            }
          }}
        />
      )}
      {/* -------------------------- 受注済みから他へ移動時の売上リセット確認モーダル -------------------------- */}
    </>
  );
};
