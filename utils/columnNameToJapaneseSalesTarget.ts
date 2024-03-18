// lastFiscalYear：下２桁
export const columnNameToJapaneseSalesTarget = (
  columnName: string,
  entityType: string = "company",
  fiscalYear: string | number,
  lastFiscalYear: string | number,
  lastFiscalYear2Digits: string | number,
  lastLastFiscalYear: string | number,
  lastLastFiscalYear2Digits: string | number
) => {
  switch (columnName) {
    case "id":
      return "ID";
      break;
    case "created_at":
      return "作成日時";
      break;
    case "updated_at":
      return "更新日時";
      break;
    case "entity_name":
      if (entityType === "company") return "区分";
      if (entityType === "department") return "事業部";
      if (entityType === "section") return "課・セクション";
      if (entityType === "unit") return "係・チーム";
      if (entityType === "member") return "メンバー";
      if (entityType === "office") return "事業所";
      return "";
      break;
    case "dataset_type":
      return `データ種別`;
      break;
    case "fiscal_year":
      return `年度`;
      break;
    case "first_half":
      return "上期";
      break;
    case "second_half":
      return "下期";
      break;
    case "first_quarter":
      return "第1四半期";
      break;
    case "second_quarter":
      return "第2四半期";
      break;
    case "third_quarter":
      return "第3四半期";
      break;
    case "fourth_quarter":
      return "第4四半期";
      break;
    case "January":
      return "1月度";
      break;
    case "February":
      return "2月度";
      break;
    case "March":
      return "3月度";
      break;
    case "April":
      return "4月度";
      break;
    case "May":
      return "5月度";
      break;
    case "June":
      return "6月度";
      break;
    case "July":
      return "7月度";
      break;
    case "August":
      return "8月度";
      break;
    case "September":
      return "9月度";
      break;
    case "October":
      return "10月度";
      break;
    case "November":
      return "11月度";
      break;
    case "December":
      return "12月度";
      break;
    // // 前年売上、前年比、前年伸び実績
    // // 前年売上
    // case "fiscal_year_last_year_sales":
    //   return `${lastFiscalYear}年度`;
    //   break;
    // case "first_half_last_year_sales":
    //   return `${lastFiscalYear2Digits}H1`;
    //   break;
    // case "second_half_last_year_sales":
    //   return `${lastFiscalYear2Digits}H2`;
    //   break;
    // case "first_quarter_last_year_sales":
    //   return `${lastFiscalYear2Digits}Q1`;
    //   break;
    // case "second_quarter_last_year_sales":
    //   return `${lastFiscalYear2Digits}Q2`;
    //   break;
    // case "third_quarter_last_year_sales":
    //   return `${lastFiscalYear2Digits}Q3`;
    //   break;
    // case "fourth_quarter_last_year_sales":
    //   return `${lastFiscalYear2Digits}Q4`;
    //   break;
    // case "January_last_year_sales":
    //   return `${lastFiscalYear2Digits}/1月度`;
    //   break;
    // case "February_last_year_sales":
    //   return `${lastFiscalYear2Digits}/2月度`;
    //   break;
    // case "March_last_year_sales":
    //   return `${lastFiscalYear2Digits}/3月度`;
    //   break;
    // case "April_last_year_sales":
    //   return `${lastFiscalYear2Digits}/4月度`;
    //   break;
    // case "May_last_year_sales":
    //   return `${lastFiscalYear2Digits}/5月度`;
    //   break;
    // case "June_last_year_sales":
    //   return `${lastFiscalYear2Digits}/6月度`;
    //   break;
    // case "July_last_year_sales":
    //   return `${lastFiscalYear2Digits}/7月度`;
    //   break;
    // case "August_last_year_sales":
    //   return `${lastFiscalYear2Digits}/8月度`;
    //   break;
    // case "September_last_year_sales":
    //   return `${lastFiscalYear2Digits}/9月度`;
    //   break;
    // case "October_last_year_sales":
    //   return `${lastFiscalYear2Digits}/10月度`;
    //   break;
    // case "November_last_year_sales":
    //   return `${lastFiscalYear2Digits}/11月度`;
    //   break;
    // case "December_last_year_sales":
    //   return `${lastFiscalYear2Digits}/12月度`;
    //   break;
    // // 2年前売上
    // case "fiscal_year_2last_year_sales":
    //   return `${lastLastFiscalYear}年度`;
    //   break;
    // case "first_half_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}H1`;
    //   break;
    // case "second_half_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}H2`;
    //   break;
    // case "first_quarter_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}Q1`;
    //   break;
    // case "second_quarter_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}Q2`;
    //   break;
    // case "third_quarter_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}Q3`;
    //   break;
    // case "fourth_quarter_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}Q4`;
    //   break;
    // case "January_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/1月度`;
    //   break;
    // case "February_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/2月度`;
    //   break;
    // case "March_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/3月度`;
    //   break;
    // case "April_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/4月度`;
    //   break;
    // case "May_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/5月度`;
    //   break;
    // case "June_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/6月度`;
    //   break;
    // case "July_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/7月度`;
    //   break;
    // case "August_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/8月度`;
    //   break;
    // case "September_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/9月度`;
    //   break;
    // case "October_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/10月度`;
    //   break;
    // case "November_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/11月度`;
    //   break;
    // case "December_2last_year_sales":
    //   return `${lastLastFiscalYear2Digits}/12月度`;
    //   break;
    // // 前年比、前年伸び
    // case "fiscal_year_yoy_comparison":
    //   return `前年比/年度`;
    //   break;
    // case "first_half_yoy_comparison":
    //   return `前年比/H1`;
    //   break;
    // case "second_half_yoy_comparison":
    //   return `前年比/H2`;
    //   break;
    // case "first_quarter_yoy_comparison":
    //   return `前年比/Q1`;
    //   break;
    // case "second_quarter_yoy_comparison":
    //   return `前年比/Q2`;
    //   break;
    // case "third_quarter_yoy_comparison":
    //   return `前年比/Q3`;
    //   break;
    // case "fourth_quarter_yoy_comparison":
    //   return `前年比/Q4`;
    //   break;
    // case "January_yoy_comparison":
    //   return `前年比//1月度`;
    //   break;
    // case "February_yoy_comparison":
    //   return `前年比/2月度`;
    //   break;
    // case "March_yoy_comparison":
    //   return `前年比/3月度`;
    //   break;
    // case "April_yoy_comparison":
    //   return `前年比/4月度`;
    //   break;
    // case "May_yoy_comparison":
    //   return `前年比/5月度`;
    //   break;
    // case "June_yoy_comparison":
    //   return `前年比/6月度`;
    //   break;
    // case "July_yoy_comparison":
    //   return `前年比/7月度`;
    //   break;
    // case "August_yoy_comparison":
    //   return `前年比/8月度`;
    //   break;
    // case "September_yoy_comparison":
    //   return `前年比/9月度`;
    //   break;
    // case "October_yoy_comparison":
    //   return `前年比/10月度`;
    //   break;
    // case "November_yoy_comparison":
    //   return `前年比/11月度`;
    //   break;
    // case "December_yoy_comparison":
    //   return `前年比/12月度`;
    //   break;
    // // 前年伸び実績
    // case "fiscal_year_yo2y_sales_growth":
    //   return `前年伸び実績/年度`;
    //   break;
    // case "first_half_yo2y_sales_growth":
    //   return `前年伸び実績/H1`;
    //   break;
    // case "second_half_yo2y_sales_growth":
    //   return `前年伸び実績/H2`;
    //   break;
    // case "first_quarter_yo2y_sales_growth":
    //   return `前年伸び実績/Q1`;
    //   break;
    // case "second_quarter_yo2y_sales_growth":
    //   return `前年伸び実績/Q2`;
    //   break;
    // case "third_quarter_yo2y_sales_growth":
    //   return `前年伸び実績/Q3`;
    //   break;
    // case "fourth_quarter_yo2y_sales_growth":
    //   return `前年伸び実績/Q4`;
    //   break;
    // case "January_yo2y_sales_growth":
    //   return `前年伸び実績/1月度`;
    //   break;
    // case "February_yo2y_sales_growth":
    //   return `前年伸び実績/2月度`;
    //   break;
    // case "March_yo2y_sales_growth":
    //   return `前年伸び実績/3月度`;
    //   break;
    // case "April_yo2y_sales_growth":
    //   return `前年伸び実績/4月度`;
    //   break;
    // case "May_yo2y_sales_growth":
    //   return `前年伸び実績/5月度`;
    //   break;
    // case "June_yo2y_sales_growth":
    //   return `前年伸び実績/6月度`;
    //   break;
    // case "July_yo2y_sales_growth":
    //   return `前年伸び実績/7月度`;
    //   break;
    // case "August_yo2y_sales_growth":
    //   return `前年伸び実績/8月度`;
    //   break;
    // case "September_yo2y_sales_growth":
    //   return `前年伸び実績/9月度`;
    //   break;
    // case "October_yo2y_sales_growth":
    //   return `前年伸び実績/10月度`;
    //   break;
    // case "November_yo2y_sales_growth":
    //   return `前年伸び実績/11月度`;
    //   break;
    // case "December_yo2y_sales_growth":
    //   return `前年伸び実績/12月度`;
    //   break;
    default:
      return "";
      break;
  }
};
