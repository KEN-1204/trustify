import useDashboardStore from "@/store/useDashboardStore";
import styles from "./DashboardSDBComponent.module.css";
import { ScreenDealBoards } from "./ScreenDealBoards/ScreenDealBoards";
import { ScreenTaskBoards } from "./TaskBoard/ScreenTaskBoards";
import useThemeStore from "@/store/useThemeStore";
import { Suspense, useEffect, useState } from "react";
import { DotsGradient } from "../Parts/DotsGradient/DotsGradient";
import { EditModalDealCard } from "./ScreenDealBoards/EditModalDealCard/EditModalDealCard";
import { ErrorBoundary } from "react-error-boundary";
import { FallbackSalesProgressScreen } from "./SalesProgressScreen/FallbackSalesProgressScreen";
import { ErrorFallback } from "../ErrorFallback/ErrorFallback";
import { GradientModal } from "../Parts/GradientModal/GradientModal";
import { ConfirmationModal } from "../DashboardCompanyComponent/Modal/SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { DealCardType, Property, Property_row_data } from "@/types";
import { toast } from "react-toastify";
import { DescriptionActionsModal } from "../Modal/DescriptionModal/DescriptionActionsModal";
import dynamic from "next/dynamic";

// import { SalesProgressScreen } from "./SalesProgressScreen/SalesProgressScreen";
const SalesProgressScreen = dynamic(
  () => import("./SalesProgressScreen/SalesProgressScreen").then((mod) => mod.SalesProgressScreen),
  {
    loading: (loadingProps) => <FallbackSalesProgressScreen />,
    ssr: false,
  }
);

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
  // ------------------------------ プロセス結果アクション項目説明モーダル関連 ------------------------------
  const isOpenModalSDB = useDashboardStore((state) => state.isOpenModalSDB);
  // ------------------------------ プロセス結果アクション項目説明モーダル関連 ------------------------------

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

              console.log("削除実行成功✅ data", data, "selectedRowDataProperty", selectedRowDataProperty);

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

              const _new = data[0] as Property;
              // Zustandの選択中のカードも更新して、ローカルstateのネタカードも同時更新してUIに反映
              const updatedCard = {
                ownerId: selectedDealCard.ownerId,
                // dealCard: { ...data[0], column_title_num: selectedDealCard.dealCard.column_title_num } as DealCardType,
                dealCard: {
                  ...selectedDealCard.dealCard,
                  current_status: _new.current_status,
                  property_name: _new.property_name,
                  property_summary: _new.property_summary,
                  pending_flag: _new.pending_flag,
                  rejected_flag: _new.rejected_flag,
                  expected_product_id: _new.expected_product_id,
                  expected_product: _new.expected_product,
                  product_sales: _new.product_sales,
                  expected_sales_price: _new.expected_sales_price,
                  term_division: _new.term_division,
                  sold_product_id: _new.sold_product_id,
                  sold_product: _new.sold_product,
                  unit_sales: _new.unit_sales,
                  sales_contribution_category: _new.sales_contribution_category,
                  sales_price: _new.sales_price,
                  discounted_price: _new.discounted_price,
                  discount_rate: _new.discount_rate,
                  sales_class: _new.sales_class,
                  property_date: _new.property_date,
                  expansion_date: _new.expansion_date,
                  sales_date: _new.sales_date,
                  expected_order_date: _new.expected_order_date,
                  property_year_month: _new.property_year_month,
                  expansion_year_month: _new.expansion_year_month,
                  sales_year_month: _new.sales_year_month,
                  expected_order_year_month: _new.expected_order_year_month,
                  property_quarter: _new.property_quarter,
                  expansion_quarter: _new.expansion_quarter,
                  sales_quarter: _new.sales_quarter,
                  expected_order_quarter: _new.expected_order_quarter,
                  property_half_year: _new.property_half_year,
                  expansion_half_year: _new.expansion_half_year,
                  sales_half_year: _new.sales_half_year,
                  expected_order_half_year: _new.expected_order_half_year,
                  property_fiscal_year: _new.property_fiscal_year,
                  expansion_fiscal_year: _new.expansion_fiscal_year,
                  sales_fiscal_year: _new.sales_fiscal_year,
                  expected_order_fiscal_year: _new.expected_order_fiscal_year,
                  subscription_start_date: _new.subscription_start_date,
                  subscription_canceled_at: _new.subscription_canceled_at,
                  leasing_company: _new.leasing_company,
                  lease_division: _new.lease_division,
                  lease_expiration_date: _new.lease_expiration_date,
                  step_in_flag: _new.step_in_flag,
                  repeat_flag: _new.repeat_flag,
                  order_certainty_start_of_month: _new.order_certainty_start_of_month,
                  review_order_certainty: _new.review_order_certainty,
                  competitor_appearance_date: _new.competitor_appearance_date,
                  competitor: _new.competitor,
                  competitor_product: _new.competitor_product,
                  reason_class: _new.reason_class,
                  reason_detail: _new.reason_detail,
                  customer_budget: _new.customer_budget,
                  decision_maker_negotiation: _new.decision_maker_negotiation,
                  subscription_interval: _new.subscription_interval,
                  competition_state: _new.competition_state,
                  property_department: _new.property_department,
                  property_business_office: _new.property_business_office,
                  property_member_name: _new.property_member_name,
                } as DealCardType,
              };
              console.log(
                "🔥Zustandも更新 updatedCard",
                updatedCard,
                "selectedDealCard.dealCard",
                selectedDealCard.dealCard,
                "data[0]",
                data[0]
              );
              setSelectedDealCard(updatedCard);

              // ローカルstateを更新するためのトリガーをON
              // setIsRequiredRefreshDealCards(true);
              setIsRequiredRefreshDealCards(selectedDealCard.ownerId);
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
      {/* -------------------------- 受注済みから他へ移動時の売上リセット確認モーダル ここまで -------------------------- */}
      {/* -------------------------- プロセス結果アクション項目説明モーダル -------------------------- */}
      {isOpenModalSDB && isOpenModalSDB === "process_actions" && (
        <>
          <DescriptionActionsModal />
        </>
      )}
      {/* -------------------------- プロセス結果アクション項目説明モーダル ここまで -------------------------- */}
    </>
  );
};
