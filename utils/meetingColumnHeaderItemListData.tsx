import { ColumnHeaderItemList } from "@/types";

interface Obj {
  [prop: string]: any; // これを記述することで、どんなプロパティでも持てるようになる
}
// https://zawatech.com/?p=344

const meetingColumnHeaderItemListArray: Obj[] = [
  // ================================ 🌟面談エリア
  {
    columnName: "planned_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "planned_start_time",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_presentation_product1",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "meeting_department",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "meeting_member_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "planned_appoint_check_flag",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // ================================ ✅面談エリアここまで
  {
    columnName: "company_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "address",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "department_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "contact_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "position_class",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "position_name",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // ================================ 🌟面談エリア
  {
    columnName: "planned_purpose",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_summary",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_negotiate_decision_maker",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "pre_meeting_participation_request",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "meeting_participation_request",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "meeting_type",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "web_tool",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "planned_duration",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "planned_product1",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "planned_product2",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "planned_comment",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "meeting_year_month",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_date",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_start_time",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_end_time",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_duration",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_number_of_meeting_participants",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_presentation_product2",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_presentation_product3",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_presentation_product4",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "result_presentation_product5",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // ================================ ✅面談エリアここまで
  {
    columnName: "direct_line",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "main_phone_number",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "direct_fax",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "main_fax",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "email",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "extension",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "company_cell_phone",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "personal_cell_phone",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },

  {
    columnName: "occupation",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "approval_amount",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "budget_request_month1",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "budget_request_month2",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "fiscal_end_month",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "capital",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "established_in",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "supplier",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "clients",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "number_of_employees_class",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "business_content",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "business_sites",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "overseas_bases",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "group_company",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "industry_type",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "product_category_large",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "product_category_medium",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  //   {
  //     columnName: "product_category_small",
  //     columnWidth: "100px",
  //     isFrozen: false,
  //     isOverflow: false,
  //   },
  {
    columnName: "corporate_number",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // ================================ 🌟面談エリア
  {
    columnName: "meeting_created_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  {
    columnName: "meeting_updated_at",
    columnWidth: "100px",
    isFrozen: false,
    isOverflow: false,
  },
  // ================================ ✅面談エリアここまで
];

export const meetingColumnHeaderItemListData: ColumnHeaderItemList[] = meetingColumnHeaderItemListArray.map(
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
