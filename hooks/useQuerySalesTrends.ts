import { formatRowNameShort } from "@/components/DashboardSalesTargetComponent/TargetContainer/UpsertTarget/UpsertTarget";
import useStore from "@/store";
import {
  AreaChartObj,
  FiscalYearMonthObjForTarget,
  LabelValue,
  LabelValueGroupByPeriod,
  LegendNameId,
  SalesSummaryYearHalf,
  SalesTrendResponse,
  SalesTrendYearHalf,
  SparkChartObj,
} from "@/types";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";

type Props = {
  companyId: string;
  entityLevel: string;
  entityIdsArray: string[];
  entityIdsStrKey: string; // キャッシュ用エンティティidをstringに
  // periodType: string;
  periodType: "fiscal_year" | "half_year" | "quarter" | "year_month";
  basePeriod: number;
  yearsBack: number;
  fetchEnabled?: boolean;
};

// 過去3年分の売上実績と前年度の伸び率実績を取得するuseQuery
export const useQuerySalesTrends = ({
  companyId,
  entityLevel,
  entityIdsArray,
  entityIdsStrKey,
  periodType, // 期間タイプ fiscal_year, half_year, quarter, year_month
  basePeriod, // 起点となる時点
  yearsBack, // 遡る年数
  fetchEnabled = true,
}: Props) => {
  const supabase = useSupabaseClient();

  const getSalesTrends = async (): Promise<SalesTrendYearHalf | null> => {
    // FUNCTIONの返り値
    let responseData = null;

    // 指定した期間タイプ(年度、半期、四半期、月度)の、
    // 指定した各エンティティの、
    // 指定した年度から指定した年数分遡った期間の
    // 「現年度売上、前年度売上、成長率、エンティティid、エンティティ名」を渡したエンティティの数分取得する

    // yearsBackの遡る年数を売上推移の場合は期間タイプに応じて桁を対応する形に変換する
    let formattedYearsBack = yearsBack;
    switch (periodType) {
      case "fiscal_year":
        formattedYearsBack = yearsBack;
        break;
      case "half_year":
      case "quarter":
        formattedYearsBack = yearsBack * 10;
        break;
      case "year_month":
        formattedYearsBack = yearsBack * 100;
      default:
        break;
    }

    const payload = {
      _company_id: companyId, // 会社id
      _entity_ids: entityIdsArray, // エンティティid
      _entity_level: entityLevel, // エンティティレベルの割り当て
      _base_period: basePeriod, // 起点となる時点
      _years_back: formattedYearsBack, // 遡る年数
      _period_type: periodType, // 期間タイプ
    };

    console.log("🔥useQuerySalesTrends rpc get_sales_summary_and_growth_year_and_half関数実行 payload", payload);

    const { data, error } = await supabase
      // .rpc("get_sales_summary_and_growth_year_and_half", { payload })
      .rpc("get_sales_trends_by_entities", payload);
    // .eq("created_by_company_id", companyId);

    if (error) {
      console.error("❌getSalesTrendsエラー発生", error);
      throw error;
    }

    responseData = data as SalesTrendResponse[];

    // queryの返り値
    let salesTrendsObj: SalesTrendYearHalf | null = null;

    // 🔹エリアチャート用のdataとlegend用のLabelValueの配列に整形
    // エリアチャート用の配列を作成 {date: 期間, value1: エンティティAの値, value2: エンティティBの値, ...}[]
    if (Array.isArray(responseData) && responseData.length !== 0) {
      // 🔸期間ごとにデータをグループ化
      const groupedByPeriod = responseData.reduce(
        (acc: { [key: number | string]: SalesTrendResponse[] }, item: SalesTrendResponse) => {
          if (!acc[item.period]) {
            acc[item.period] = [];
          }
          acc[item.period].push(item);
          return acc;
        },
        {}
      );

      // 🔸全てのエンティティを一意にしてから、エンティティIDをvalueXXでマッピング
      const entityIdSet = new Set(Object.values(groupedByPeriod)[0].map((obj) => obj.entity_id));
      let entityIdToNameMapping: { [key: string]: string } = {};
      Array.from(entityIdSet).forEach((id, index) => {
        entityIdToNameMapping[id] = `value${index + 1}`; // value1から
      });

      // 🔸各期間ごとにエンティティごとのデータを整形
      const chartData = Object.keys(groupedByPeriod).map((period) => {
        // 一つの期間のみフィルタリングされたレスポンスデータ
        const entriesForPeriod: SalesTrendResponse[] = groupedByPeriod[period];
        const periodEntry = { date: period } as AreaChartObj; // dateプロパティを追加

        // レスポンスデータ内の全てのエンティティの個数分プロパティ「valueXX: sales」を追加
        entriesForPeriod.forEach((entry, index) => {
          const valueName = entityIdToNameMapping[entry.entity_id];
          periodEntry[valueName] = entry.current_sales;
        });
        return periodEntry;
      });

      // 🔸Legendラベル用配列を作成
      const newLabelValueGroupByPeriod = Object.entries(groupedByPeriod).map(([period, rows], index) => {
        return {
          date: period,
          label_list: rows.map(
            (row, index) =>
              ({
                id: row.entity_id,
                label: row.entity_name,
                value: row.current_sales,
                growth_rate: row.growth_rate,
                prev_value: row.previous_sales,
              } as LabelValue)
          ),
        } as LabelValueGroupByPeriod;
      });

      // 🔸Legend用配列
      const newLegendList = Object.values(groupedByPeriod)[0].map(
        (obj) =>
          ({
            entity_id: obj.entity_id,
            entity_name: obj.entity_name,
          } as LegendNameId)
      );

      salesTrendsObj = {
        chartData: chartData,
        labelValueGroupByPeriod: newLabelValueGroupByPeriod,
        salesTrends: responseData,
        legendList: newLegendList,
        groupedByPeriod: groupedByPeriod,
        labelType: "sales_period", // dateのフォーマット用
        periodType: periodType,
        entityLevel: entityLevel,
      };
    }

    // 0.8秒後に解決するPromiseの非同期処理を入れて疑似的にサーバーにフェッチする動作を入れる
    await new Promise((resolve) => setTimeout(resolve, 500));

    console.log("✅✅✅ useQuery getSalesTrends関数成功 salesTrendsObj", salesTrendsObj, "data", data);

    return salesTrendsObj;
  };

  return useQuery({
    queryKey: ["sales_trends", entityLevel, entityIdsStrKey, periodType, basePeriod, yearsBack],
    queryFn: getSalesTrends,
    staleTime: Infinity,
    onError: (error) => {
      console.error("useQueryDepartments error:", error);
    },
    enabled:
      !!companyId && !!entityLevel && !!entityIdsStrKey && !!periodType && !!basePeriod && !!yearsBack && fetchEnabled,
  });
};

// chartDataArray = responseData.reduce((acc: AreaChartObj[], item: SalesTrendResponse) => {
//   // 既にその期間dateのデータがあれば取得 ex) {date: 202304, value1: 1200}
//   let periodEntry = acc.find((entry) => entry.date === item.period);

//   // この期間のエントリーがまだ追加されていなければ追加
//   if (!periodEntry) {
//     // 新しいオブジェクトを作成する際に、AreaChartObj型として明示的にキャストして追加
//     periodEntry = { date: item.period } as AreaChartObj;
//     acc.push(periodEntry); // ex) { date: 202304 }
//   }

//   // エンティティIDに対応する名前を取得し新たなキーとしてセットし、値に売上データをセット
//   const entityName = entityIdToNameMapping[item.entity_id];
//   // ex) { date: 202304, value1: 1200 } or { date: 2024, value1: 1200, value2: 2400, ... }
//   periodEntry[entityName] = item.current_sales;
//   // periodEntry = { ...periodEntry, [entityName]: item.current_sales };

//   console.log();

//   return acc;
// }, [] as AreaChartObj[]);
