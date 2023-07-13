export const columnNameToJapanese = (columnName: string) => {
  switch (columnName) {
    case "id":
      return "ID";
      break;
    case "rowIndex":
      return "行数";
      break;
    case "name":
      return "名前";
      break;
    case "dob":
      return "誕生日";
      break;
    case "country":
      return "国";
      break;
    case "gender":
      return "性別";
      break;
    case "summary":
      return "概要";
      break;

    default:
      break;
  }
};
