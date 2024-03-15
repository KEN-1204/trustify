import { ColumnHeaderItemList } from "@/types";

interface Obj {
  [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
}
// https://zawatech.com/?p=344

// 🌠当年度のみの売上目標 (前年度実績と前年比、前年実績を含めた売上目標はなし)
const salesTargetColumnHeaderItemListArray: Obj[] = [
  {
    columnName: "entity_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
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
    columnName: "fiscal_year_Yo2Y_sales_growth",
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
    columnName: "first_half_Yo2Y_sales_growth",
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
    columnName: "second_half_Yo2Y_sales_growth",
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
    columnName: "first_quarter_Yo2Y_sales_growth",
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
    columnName: "second_quarter_Yo2Y_sales_growth",
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
    columnName: "third_quarter_Yo2Y_sales_growth",
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
    columnName: "fourth_quarter_Yo2Y_sales_growth",
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
    columnName: "January_Yo2Y_sales_growth",
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
    columnName: "February_Yo2Y_sales_growth",
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
    columnName: "March_Yo2Y_sales_growth",
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
    columnName: "April_Yo2Y_sales_growth",
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
    columnName: "May_Yo2Y_sales_growth",
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
    columnName: "June_Yo2Y_sales_growth",
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
    columnName: "July_Yo2Y_sales_growth",
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
    columnName: "August_Yo2Y_sales_growth",
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
    columnName: "September_Yo2Y_sales_growth",
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
    columnName: "October_Yo2Y_sales_growth",
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
    columnName: "November_Yo2Y_sales_growth",
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
    columnName: "December_Yo2Y_sales_growth",
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
