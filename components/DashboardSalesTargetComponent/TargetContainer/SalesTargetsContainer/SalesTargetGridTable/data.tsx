import { LastYearSalesRowData, SalesTargetFYRowData, YoYGrowthRowData } from "@/types";

export const testRowData = (entityType: string | null, quantity: number = 1): SalesTargetFYRowData[] => {
  const companyArray = ["全社"];
  const departmentArray = ["マイクロスコープ事業部", "メトロロジ事業部", "センサ事業部", "アプリセンサ事業部"];
  const sectionArray = ["IMエリア", "XMエリア", "WMエリア", "VLエリア"];
  const unitArray = ["IMTK1", "IMTK2", "IMUW1", "IMUW2", "IMOS1", "IMOS2"];
  const memberArray = ["佐藤大地", "藤原竜也", "大空光", "一陸斗", "加藤幹也", "高橋礼司"];
  return Array(quantity)
    .fill(null)
    .map((_, index) => {
      let entityName = companyArray[index % companyArray.length];
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
        share: null,
        dataset_type: `sales_targets`,
        entity_id: `${index}_sales_targets`,
        entity_name: entityName ?? null,
        entity_type: entityType,
        // 紐付け関連
        created_by_company_id: null,
        created_by_department_id: null,
        created_by_section_id: null,
        created_by_unit_id: null,
        created_by_user_id: null,
        created_by_office_id: null,
        // 当年度売上目標
        fiscal_year: null,
        first_half: null,
        second_half: null,
        first_quarter: null,
        second_quarter: null,
        third_quarter: null,
        fourth_quarter: null,
        January: null,
        February: null,
        March: null,
        April: null,
        May: null,
        June: null,
        July: null,
        August: null,
        September: null,
        October: null,
        November: null,
        December: null,
      } as SalesTargetFYRowData;
      // return {
      //   dataset_type: `sales_target`,
      //   entity_id: `${index}_sales_target`,
      //   entity_name: `${entityName}`,
      //   entity_type: entityType,
      //   // 紐付け関連
      //   created_by_company_id: null,
      //   created_by_department_id: null,
      //   created_by_section_id: null,
      //   created_by_unit_id: null,
      //   created_by_user_id: null,
      //   created_by_office_id: null,
      //   // 当年度売上目標
      //   fiscal_year: null,
      //   first_half: null,
      //   second_half: null,
      //   first_quarter: null,
      //   second_quarter: null,
      //   third_quarter: null,
      //   fourth_quarter: null,
      //   January: null,
      //   February: null,
      //   March: null,
      //   April: null,
      //   May: null,
      //   June: null,
      //   July: null,
      //   August: null,
      //   September: null,
      //   October: null,
      //   November: null,
      //   December: null,
      // };
    });
};
export const testRowDataLastYear = (
  // entityType: "company" | "department" | "section" | "unit" | "member" | "office",
  entityType: string | null,
  quantity: number = 1
): SalesTargetFYRowData[] => {
  const companyArray = ["全社"];
  const departmentArray = ["マイクロスコープ事業部", "メトロロジ事業部", "センサ事業部", "アプリセンサ事業部"];
  const sectionArray = ["IMエリア", "XMエリア", "WMエリア", "VLエリア"];
  const unitArray = ["IMTK1", "IMTK2", "IMUW1", "IMUW2", "IMOS1", "IMOS2"];
  const memberArray = ["佐藤大地", "藤原竜也", "大空光", "一陸斗", "加藤幹也", "高橋礼司"];
  return Array(quantity)
    .fill(null)
    .map((_, index) => {
      let entityName = companyArray[index % companyArray.length];
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
        share: null,
        dataset_type: `last_year_sales`,
        entity_id: `${index}_last_year_sales`,
        entity_name: entityName ?? null,
        entity_type: entityType,
        // 紐付け関連
        created_by_company_id: null,
        created_by_department_id: null,
        created_by_section_id: null,
        created_by_unit_id: null,
        created_by_user_id: null,
        created_by_office_id: null,
        // 当年度売上目標
        fiscal_year: null,
        first_half: null,
        second_half: null,
        first_quarter: null,
        second_quarter: null,
        third_quarter: null,
        fourth_quarter: null,
        January: null,
        February: null,
        March: null,
        April: null,
        May: null,
        June: null,
        July: null,
        August: null,
        September: null,
        October: null,
        November: null,
        December: null,
      };
    });
};
export const testRowDataPercent = (entityType: string | null, quantity: number = 1): SalesTargetFYRowData[] => {
  const companyArray = ["全社"];
  const departmentArray = ["マイクロスコープ事業部", "メトロロジ事業部", "センサ事業部", "アプリセンサ事業部"];
  const sectionArray = ["IMエリア", "XMエリア", "WMエリア", "VLエリア"];
  const unitArray = ["IMTK1", "IMTK2", "IMUW1", "IMUW2", "IMOS1", "IMOS2"];
  const memberArray = ["佐藤大地", "藤原竜也", "大空光", "一陸斗", "加藤幹也", "高橋礼司"];
  return Array(quantity)
    .fill(null)
    .map((_, index) => {
      let entityName = companyArray[index % companyArray.length];
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
        share: null,
        dataset_type: `yoy_growth`,
        entity_id: `${index}_yoy_growth`,
        entity_name: entityName ?? null,
        entity_type: entityType,
        // 紐付け関連
        created_by_company_id: null,
        created_by_department_id: null,
        created_by_section_id: null,
        created_by_unit_id: null,
        created_by_user_id: null,
        created_by_office_id: null,
        // 当年度売上目標
        fiscal_year: null,
        first_half: null,
        second_half: null,
        first_quarter: null,
        second_quarter: null,
        third_quarter: null,
        fourth_quarter: null,
        January: null,
        February: null,
        March: null,
        April: null,
        May: null,
        June: null,
        July: null,
        August: null,
        September: null,
        October: null,
        November: null,
        December: null,
      };
    });
};
