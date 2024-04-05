import { format, parseISO } from "date-fns";

type DateProps = {
  value: string | number;
  labelType?: string;
  periodType?: string | undefined;
  fyFullName?: boolean;
};

// X軸 日付時のフォーマット関数 Feb, 7 May, 21 など 7日刻み
export const xAxisDateFormatter = ({ value, labelType, periodType, fyFullName }: DateProps) => {
  const str = typeof value === "number" ? value.toString() : value;
  if (labelType === "sales_period") {
    if (!periodType) return str;
    if (periodType === "fiscal_year") {
      return fyFullName ? `${str}年度` : `${str}年`;
    } else if (["half_year", "quarter", "year_month"].includes(periodType)) {
      const year = str.substring(0, 4); // 1文字目から4文字目
      const period = str.substring(4); // 5文字目以降
      if (periodType === "half_year") return `${year}H${period}`;
      if (periodType === "quarter") return `${year}Q${period}`;
      if (periodType === "year_month") return `${Number(period)}月, ${year}`;
      return str;
    } else {
      return str;
    }
  } else {
    const date = parseISO(str);
    // console.log("date", date, "date.getDate()", date.getDate(), 'format(date, "MMM, d")', format(date, "MMM, d"));
    // console.log(date.getDate() % 7 === 0 ? format(date, "MMM, d") : ``);
    if (date.getDate() % 7 === 0) {
      return format(date, "MMM, d");
    }
    return format(date, "MMM, d");
  }
};
