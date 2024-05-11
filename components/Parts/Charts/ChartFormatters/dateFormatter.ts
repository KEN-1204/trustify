import { format, parseISO } from "date-fns";

type DateProps = {
  value: string | number;
  labelType?: string;
  periodType?: string | undefined;
  fyFullName?: boolean;
  isSalesTarget?: boolean;
};

// X軸 日付時のフォーマット関数 Feb, 7 May, 21 など 7日刻み
export const xAxisDateFormatter = ({ value, labelType, periodType, fyFullName, isSalesTarget = false }: DateProps) => {
  const str = typeof value === "number" ? value.toString() : value;
  if (labelType === "sales_period") {
    if (!periodType) {
      if (isSalesTarget) return `${str} 売上目標`;
      return str;
    }
    if (periodType === "fiscal_year") {
      if (isSalesTarget) return fyFullName ? `${str}年度 売上目標` : `${str}年 売上目標`;
      return fyFullName ? `${str}年度` : `${str}年`;
    } else if (["half_year", "quarter", "year_month"].includes(periodType)) {
      const year = str.substring(0, 4); // 1文字目から4文字目
      const period = str.substring(4); // 5文字目以降
      if (periodType === "half_year") {
        if (isSalesTarget) return `${year}H${period} 売上目標`;
        return `${year}H${period}`;
      }
      if (periodType === "quarter") {
        if (isSalesTarget) return `${year}Q${period} 売上目標`;
        return `${year}Q${period}`;
      }
      if (periodType === "year_month") {
        if (isSalesTarget) return `${Number(period)}月, ${year} 売上目標`;
        return `${Number(period)}月, ${year}`;
      }
      if (isSalesTarget) return `${str} 売上目標`;
      return str;
    } else {
      if (isSalesTarget) return `${str} 売上目標`;
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
