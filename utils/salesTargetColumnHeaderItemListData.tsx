import { ColumnHeaderItemList } from "@/types";

interface Obj {
  [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
}
// https://zawatech.com/?p=344

// 🌠当年度のみの売上目標 (前年度実績と前年比、前年実績を含めた売上目標はなし)
const salesTargetColumnHeaderItemListArray: Obj[] = [
  // シェア 売上目標シェア・前年度売上シェア(前年比では使用しない displayKeyがsalesTargets, lastYearSalesのみ)
  // {
  //   columnName: "share",
  //   columnWidth: "100px",
  //   isFrozen: false,
  //   isOverflow: false,
  // },
  // 事業部名・課名・係名・メンバー名など entity_typeがcompanyの場合は全社
  {
    columnName: "entity_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 表示しているデータセットの種類名 「売上目標・前年度売上・前年比」
  {
    columnName: "dataset_type",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 「売上目標・前年度売上・前年比」の全てのデータセット共通で使用するフィールド 年度・上期・下期・Q1~Q4・1月度~12月度
  {
    columnName: "fiscal_year",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "first_half",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "second_half",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "first_quarter",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "second_quarter",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "third_quarter",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "fourth_quarter",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "January",
    columnName: "month_01",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "February",
    columnName: "month_02",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "March",
    columnName: "month_03",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "April",
    columnName: "month_04",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "May",
    columnName: "month_05",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "June",
    columnName: "month_06",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "July",
    columnName: "month_07",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "August",
    columnName: "month_08",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "September",
    columnName: "month_09",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "October",
    columnName: "month_10",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "November",
    columnName: "month_11",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    // columnName: "December",
    columnName: "month_12",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
];

export const salesTargetColumnHeaderItemListData: ColumnHeaderItemList[] = salesTargetColumnHeaderItemListArray.map(
  (obj, index) => {
    //   obj.columnId = index;
    //   obj.columnIndex = index + 2;
    const item: ColumnHeaderItemList = {
      columnId: index,
      columnName: obj.columnName,
      columnIndex: index + 2,
      columnWidth: obj.columnWidth,
      isOverflow: obj.isOverflow,
      isFrozen: obj.isFrozen,
    };
    return item;
  }
);

// 🌠前年度実績と前年比、前年実績を含めた売上目標
const salesTargetWithYoYColumnHeaderItemListArray: Obj[] = [
  {
    columnName: "entity_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 当年度売上目標
  {
    columnName: "fiscal_year_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "first_half_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "second_half_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "first_quarter_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "second_quarter_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "third_quarter_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "fourth_quarter_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "January_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "February_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "March_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "April_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "May_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "June_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "July_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "August_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "September_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "October_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "November_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "December_sales_target",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 昨年実績と前年比

  {
    columnName: "fiscal_year_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "fiscal_year_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "first_half_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "first_half_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "second_half_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "second_half_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "first_quarter_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "first_quarter_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "second_quarter_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "second_quarter_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "third_quarter_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "third_quarter_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "fourth_quarter_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "fourth_quarter_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "January_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "January_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "February_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "February_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "March_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "March_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "April_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "April_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "May_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "May_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "June_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "June_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "July_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "July_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "August_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "August_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "September_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "September_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "October_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "October_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "November_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "November_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "December_yoy_comparison",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "December_yo2y_sales_growth",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 1年前売上実績
  {
    columnName: "fiscal_year_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "first_half_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "second_half_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "first_quarter_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "second_quarter_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "third_quarter_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "fourth_quarter_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "January_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "February_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "March_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "April_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "May_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "June_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "July_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "August_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "September_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "October_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "November_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "December_last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // 2年前売上実績
  {
    columnName: "fiscal_year_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "first_half_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "second_half_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "first_quarter_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "second_quarter_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "third_quarter_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "fourth_quarter_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "January_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "February_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "March_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "April_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "May_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "June_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "July_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "August_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "September_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "October_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "November_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "December_2last_year_sales",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
];

// 前年比、前年伸び実績、前年売上込み
export const salesTargetWithYoYColumnHeaderItemListData: ColumnHeaderItemList[] =
  salesTargetWithYoYColumnHeaderItemListArray.map((obj, index) => {
    //   obj.columnId = index;
    //   obj.columnIndex = index + 2;
    const item: ColumnHeaderItemList = {
      columnId: index,
      columnName: obj.columnName,
      columnIndex: index + 2,
      columnWidth: obj.columnWidth,
      isOverflow: obj.isOverflow,
      isFrozen: obj.isFrozen,
    };
    return item;
  });
