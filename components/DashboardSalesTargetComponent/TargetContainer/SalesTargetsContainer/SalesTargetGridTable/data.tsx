export const testRowData = (
  entityType: "company" | "department" | "section" | "unit" | "member" | "office",
  quantity: number = 1
) => {
  const companyArray = ["全社"];
  const departmentArray = ["マイクロスコープ事業部", "メトロロジ事業部", "センサ事業部", "アプリセンサ事業部"];
  const sectionArray = ["IMエリア", "XMエリア", "WMエリア", "VLエリア"];
  const unitArray = ["IMTK1", "IMTK2", "IMUW1", "IMUW2", "IMOS1", "IMOS2"];
  const memberArray = ["佐藤大地", "藤原竜也", "大空光", "一陸斗", "加藤幹也", "高橋礼司"];
  return Array(quantity)
    .fill(null)
    .map((_, index) => {
      let entityName = companyArray[index % companyArray.length];
      console.log("companyArray[index % companyArray.length]", companyArray[index % companyArray.length]);
      switch (entityType) {
        case "company":
          entityName = companyArray[index % companyArray.length];
          break;
        case "department":
          entityName = departmentArray[index % departmentArray.length];
          break;
        case "section":
          entityName = sectionArray[index % sectionArray.length];
          break;
        case "unit":
          entityName = unitArray[index % unitArray.length];
          break;
        case "member":
          entityName = memberArray[index % memberArray.length];
          break;

        default:
          break;
      }
      return {
        entity_id: `${index}_sales_target`,
        entity_name: `${entityName}`,
        // 当年度売上目標
        fiscal_year_sales_target: null,
        first_half_sales_target: null,
        second_half_sales_target: null,
        first_quarter_sales_target: null,
        second_quarter_sales_target: null,
        third_quarter_sales_target: null,
        fourth_quarter_sales_target: null,
        January_sales_target: null,
        February_sales_target: null,
        March_sales_target: null,
        April_sales_target: null,
        May_sales_target: null,
        June_sales_target: null,
        July_sales_target: null,
        August_sales_target: null,
        September_sales_target: null,
        October_sales_target: null,
        November_sales_target: null,
        December_sales_target: null,
        // 昨年実績と前年比
        fiscal_year_last_year_sales: null,
        fiscal_year_yoy_comparison: null,
        fiscal_year_Yo2Y_sales_growth: null,
        first_half_last_year_sales: null,
        first_half_yoy_comparison: null,
        first_half_Yo2Y_sales_growth: null,
        second_half_last_year_sales: null,
        second_half_yoy_comparison: null,
        second_half_Yo2Y_sales_growth: null,
        first_quarter_last_year_sales: null,
        first_quarter_yoy_comparison: null,
        first_quarter_Yo2Y_sales_growth: null,
        second_quarter_last_year_sales: null,
        second_quarter_yoy_comparison: null,
        second_quarter_Yo2Y_sales_growth: null,
        third_quarter_last_year_sales: null,
        third_quarter_yoy_comparison: null,
        third_quarter_Yo2Y_sales_growth: null,
        fourth_quarter_last_year_sales: null,
        fourth_quarter_yoy_comparison: null,
        fourth_quarter_Yo2Y_sales_growth: null,
        January_last_year_sales: null,
        January_yoy_comparison: null,
        January_Yo2Y_sales_growth: null,
        February_last_year_sales: null,
        February_yoy_comparison: null,
        February_Yo2Y_sales_growth: null,
        March_last_year_sales: null,
        March_yoy_comparison: null,
        March_Yo2Y_sales_growth: null,
        April_last_year_sales: null,
        April_yoy_comparison: null,
        April_Yo2Y_sales_growth: null,
        May_last_year_sales: null,
        May_yoy_comparison: null,
        May_Yo2Y_sales_growth: null,
        June_last_year_sales: null,
        June_yoy_comparison: null,
        June_Yo2Y_sales_growth: null,
        July_last_year_sales: null,
        July_yoy_comparison: null,
        July_Yo2Y_sales_growth: null,
        August_last_year_sales: null,
        August_yoy_comparison: null,
        August_Yo2Y_sales_growth: null,
        September_last_year_sales: null,
        September_yoy_comparison: null,
        September_Yo2Y_sales_growth: null,
        October_last_year_sales: null,
        October_yoy_comparison: null,
        October_Yo2Y_sales_growth: null,
        November_last_year_sales: null,
        November_yoy_comparison: null,
        November_Yo2Y_sales_growth: null,
        December_last_year_sales: null,
        December_yoy_comparison: null,
        December_Yo2Y_sales_growth: null,
      };
    });
};
