export const monthlySaleTargetData = () => {
  return Array(12)
    .fill(null)
    .map((_, index) => {
      let year = 2024;
      let month = index + 4; // 4月スタート
      let displayMonth = ``;
      // 9月まで
      if (month < 10) {
        displayMonth = `0${month}`;
      } else if (month > 12) {
        year += 1;
        displayMonth = `0${month - 12}`;
      } else {
        displayMonth = `${month}`;
      }

      console.log("year", year, "month", month, "displayMonth", displayMonth);

      const initialObj = {
        sales_target_period_value: Number(`${year}${displayMonth}`),
        sales_target: 123000000,
        sales_target_last_year: 113000000,
        sales_target_two_year_ago: 103000000,
      };
      return initialObj;
    });
};
export const monthlySaleTargetDataFirstHalf = () => {
  return Array(6)
    .fill(null)
    .map((_, index) => {
      let year = 2024;
      let month = index + 4; // 4月スタート
      let displayMonth = ``;
      // 9月まで
      if (month < 10) {
        displayMonth = `0${month}`;
      } else if (month > 12) {
        year += 1;
        displayMonth = `0${month - 12}`;
      } else {
        displayMonth = `${month}`;
      }

      console.log("year", year, "month", month, "displayMonth", displayMonth);

      const initialObj = {
        sales_target_period_value: Number(`${year}${displayMonth}`),
        sales_target: 123000000,
        sales_target_last_year: 113000000,
        sales_target_two_year_ago: 103000000,
      };
      return initialObj;
    });
};
export const monthlySaleTargetDataLastHalf = () => {
  return Array(6)
    .fill(null)
    .map((_, index) => {
      let year = 2024;
      let month = index + 10; // 4月スタート
      let displayMonth = ``;
      // 9月まで
      if (month < 10) {
        displayMonth = `0${month}`;
      } else if (month > 12) {
        year += 1;
        displayMonth = `0${month - 12}`;
      } else {
        displayMonth = `${month}`;
      }

      console.log("year", year, "month", month, "displayMonth", displayMonth);

      const initialObj = {
        sales_target_period_value: Number(`${year}${displayMonth}`),
        sales_target: 123000000,
        sales_target_last_year: 113000000,
        sales_target_two_year_ago: 103000000,
      };
      return initialObj;
    });
};
