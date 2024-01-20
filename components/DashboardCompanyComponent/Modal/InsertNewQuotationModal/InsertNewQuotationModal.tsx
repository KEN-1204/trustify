// import { useMutateQuotation } from "@/hooks/useMutateQuotation";
// import { useQueryDepartments } from "@/hooks/useQueryDepartments";
// import { useQueryOffices } from "@/hooks/useQueryOffices";
// import { useQueryProducts } from "@/hooks/useQueryProducts";
// import { useQueryUnits } from "@/hooks/useQueryUnits";
// import useDashboardStore from "@/store/useDashboardStore";
// import { Department, Office, Unit } from "@/types";
// import { useQueryClient } from "@tanstack/react-query";
// import React, { KeyboardEvent, useEffect, useRef, useState } from "react";
// import styles from "./InsertNewQuotationModal.module.css";
// import useStore from "@/store";
// import { BsChevronLeft } from "react-icons/bs";
// import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";

// export const InsertNewQuotationModal = () => {
//   const userProfileState = useDashboardStore((state) => state.userProfileState);

//   const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
//   const selectedRowDataActivity = useDashboardStore((state) => state.selectedRowDataActivity);
//   const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
//   const selectedRowDataProperty = useDashboardStore((state) => state.selectedRowDataProperty);
//   const selectedRowDataQuotation = useDashboardStore((state) => state.selectedRowDataQuotation);
//   const setIsOpenInsertNewQuotationModal = useDashboardStore((state) => state.setIsOpenInsertNewQuotationModal);

//   const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
//   const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);

//   // 確認モーダル(自社担当名、データ所有者変更確認)
//   const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState<string | null>(null);
//   // 自社担当検索サイドテーブル開閉
//   const [isOpenSearchMemberSideTable, setIsOpenSearchMemberSideTable] = useState(false);
//   // 事業部別製品編集ドロップダウンメニュー
//   const [isOpenDropdownMenuFilterProducts, setIsOpenDropdownMenuFilterProducts] = useState(false);
//   type ClickedItemPos = { displayPos: "up" | "center" | "down"; clickedItemWidth: number | null };
//   const [clickedItemPosition, setClickedItemPosition] = useState<ClickedItemPos>({
//     displayPos: "down",
//     clickedItemWidth: null,
//   });

//   const initialDate = new Date();
//   initialDate.setHours(0, 0, 0, 0);
//   const year = initialDate.getFullYear(); // 例: 2023
//   const month = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
//   const currentYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
//   // --------------------------------- 🌟input関連🌟 ---------------------------------
//   const [submissionClass, setSubmissionClass] = useState(""); // 提出区分
//   const [quotationDate, setQuotationDate] = useState<Date | null>(initialDate); //見積日付
//   const [expirationDate, setExpirationDate] = useState(null); // 有効期限
//   const [deadline, setDeadline] = useState(""); // 納期
//   const [deliveryPlace, setDeliveryPlace] = useState(""); // 納入場所
//   const [paymentTerms, setPaymentTerms] = useState(""); // 取引方法
//   const [quotationDivision, setQuotationDivision] = useState(""); // 見積区分
//   const [sendingMethod, setSendingMethod] = useState(""); // 送付方法
//   const [useCorporateSeal, setUseCorporateSeal] = useState(false); // 角印印刷
//   const [quotationNotes, setQuotationNotes] = useState(""); // 見積備考
//   const [salesTaxClass, setSalesTaxClass] = useState(""); // 消費税区分
//   const [salesTaxRate, setSalesTaxRate] = useState(""); // 消費税率
//   const [totalPrice, setTotalPrice] = useState("");
//   const [discountAmount, setDiscountAmount] = useState("");
//   const [discountRate, setDiscountRate] = useState("");
//   const [discountTitle, setDiscountTitle] = useState("");
//   const [totalAmount, setTotalAmount] = useState("");
//   const [quotationRemarks, setQuotationRemarks] = useState("");
//   const [setItemCount, setSetItemCount] = useState("");
//   const [setUnitName, setSetUnitName] = useState("");
//   //   const [submissionClass, setSubmissionClass] = useState("");
//   //   const [submissionClass, setSubmissionClass] = useState("");

//   // =========営業担当データ
//   type MemberDetail = {
//     memberId: string | null;
//     memberName: string | null;
//     departmentId: string | null;
//     unitId: string | null;
//     officeId: string | null;
//   };
//   // 作成したユーザーのidと名前が初期値
//   const initialMemberObj = {
//     memberId: userProfileState?.id ? userProfileState?.id : null,
//     memberName: userProfileState?.profile_name ? userProfileState?.profile_name : null,
//     departmentId: userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null,
//     unitId: userProfileState?.assigned_unit_id ? userProfileState?.assigned_unit_id : null,
//     officeId: userProfileState?.assigned_office_id ? userProfileState?.assigned_office_id : null,
//   };
//   const [prevMemberObj, setPrevMemberObj] = useState<MemberDetail>(initialMemberObj);
//   const [memberObj, setMemberObj] = useState<MemberDetail>(initialMemberObj);
//   // =========営業担当データここまで
//   const [meetingYearMonth, setMeetingYearMonth] = useState<number | null>(Number(currentYearMonthInitialValue)); //面談年月度
//   // --------------------------------- ✅input関連✅ ---------------------------------

//   // ユーザーの決算月と締め日を取得
//   const fiscalEndMonthObjRef = useRef<Date | null>(null);
//   const closingDayRef = useRef<number | null>(null);

//   const queryClient = useQueryClient();
//   const { createQuotationMutation } = useMutateQuotation();

//   // ================================ 🌟事業部リスト取得useQuery🌟 ================================
//   const {
//     data: departmentDataArray,
//     isLoading: isLoadingQueryDepartment,
//     refetch: refetchQUeryDepartments,
//   } = useQueryDepartments(userProfileState?.company_id, true);

//   // ================================ ✅事業部リスト取得useQuery✅ ================================
//   // ================================ 🌟係・チームリスト取得useQuery🌟 ================================
//   const {
//     data: unitDataArray,
//     isLoading: isLoadingQueryUnit,
//     refetch: refetchQUeryUnits,
//   } = useQueryUnits(userProfileState?.company_id, true);

//   // ================================ ✅係・チームリスト取得useQuery✅ ================================
//   // ================================ 🌟事業所・営業所リスト取得useQuery🌟 ================================
//   const {
//     data: officeDataArray,
//     isLoading: isLoadingQueryOffice,
//     refetch: refetchQUeryOffices,
//   } = useQueryOffices(userProfileState?.company_id, true);

//   // ================================ ✅事業所・営業所リスト取得useQuery✅ ================================

//   // ================================ 🌟商品リスト取得useQuery🌟 ================================
//   type FilterCondition = {
//     department_id: Department["id"] | null;
//     unit_id: Unit["id"] | null;
//     office_id: Office["id"] | null;
//     //   employee_id_name: Employee_id["id"];
//   };
//   // useQueryで事業部・係・事業所を絞ったフェッチをするかどうか(初回マウント時は自事業部のみで取得)
//   const [filterCondition, setFilterCondition] = useState<FilterCondition>({
//     department_id: userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null,
//     unit_id: null,
//     office_id: null,
//   });
//   const { data: productDataArray, isLoading: isLoadingQueryProduct } = useQueryProducts({
//     company_id: userProfileState?.company_id ? userProfileState?.company_id : null,
//     departmentId: filterCondition.department_id,
//     unitId: filterCondition.unit_id,
//     officeId: filterCondition.office_id,
//     isReady: true,
//   });
//   // ================================ ✅商品リスト取得useQuery✅ ================================

//   // 🌟キャンセルでモーダルを閉じる
//   const handleCancelAndReset = () => {
//     if (loadingGlobalState) return;
//     setIsOpenInsertNewQuotationModal(false);
//   };
//   // ✅キャンセルでモーダルを閉じる

//   // ================================ ツールチップ ================================
//   type TooltipParams = {
//     e: React.MouseEvent<HTMLElement, MouseEvent>;
//     display: string;
//     content: string;
//     content2?: string | undefined | null;
//     content3?: string | undefined | null;
//     marginTop?: number;
//     itemsPosition?: string;
//     whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
//   };
//   const modalContainerRef = useRef<HTMLDivElement | null>(null);
//   const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
//   const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
//   // const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
//   const handleOpenTooltip = ({
//     e,
//     display,
//     content,
//     content2,
//     content3,
//     marginTop,
//     itemsPosition = "center",
//     whiteSpace,
//   }: TooltipParams) => {
//     // モーダルコンテナのleftを取得する
//     if (!modalContainerRef.current) return;
//     const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
//     const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
//     // ホバーしたアイテムにツールチップを表示
//     const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
//     // const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
//     //   ? ((e.target as HTMLDivElement).dataset.text2 as string)
//     //   : "";
//     // const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
//     //   ? ((e.target as HTMLDivElement).dataset.text3 as string)
//     //   : "";
//     setHoveredItemPosModal({
//       x: x - containerLeft,
//       y: y - containerTop,
//       itemWidth: width,
//       itemHeight: height,
//       content: content,
//       content2: content2,
//       content3: content3,
//       display: display,
//       marginTop: marginTop,
//       itemsPosition: itemsPosition,
//       whiteSpace: whiteSpace,
//     });
//   };
//   // ============================================================================================
//   // ================================ ツールチップを非表示 ================================
//   const handleCloseTooltip = () => {
//     setHoveredItemPosModal(null);
//   };
//   // ============================================================================================

//   return (
//     <>
//       <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />

//       <div className={`${styles.container} fade03`} ref={modalContainerRef}>
//         {/* 保存・タイトル・キャンセルエリア */}
//         <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
//           {/* <div
//             className="min-w-[150px] cursor-pointer select-none text-start font-semibold hover:text-[#aaa]"
//             onClick={handleCancelAndReset}
//           >
//             キャンセル
//           </div> */}
//           <div className="relative min-w-[150px] text-start font-semibold">
//             <div
//               className="flex max-w-max cursor-pointer select-none items-center hover:text-[#aaa]"
//               onClick={handleCancelAndReset}
//             >
//               <div className="h-full min-w-[20px]"></div>
//               <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" />
//               <span>戻る</span>
//             </div>
//           </div>
//           <div className="min-w-[150px] select-none font-bold">見積 作成</div>

//           {selectedRowDataContact && (
//             <div
//               className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
//               //   onClick={handleSaveAndCloseFromContacts}
//             >
//               保存
//             </div>
//           )}
//           {selectedRowDataActivity && (
//             <div
//               className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
//               //   onClick={handleSaveAndCloseFromActivity}
//             >
//               保存
//             </div>
//           )}
//           {selectedRowDataMeeting && (
//             <div
//               className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
//               //   onClick={handleSaveAndCloseFromMeeting}
//             >
//               保存
//             </div>
//           )}
//           {selectedRowDataProperty && (
//             <div
//               className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
//               //   onClick={handleSaveAndCloseFromProperty}
//             >
//               保存
//             </div>
//           )}
//           {selectedRowDataQuotation && (
//             <div
//               className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
//               //   onClick={handleSaveAndClose}
//             >
//               保存
//             </div>
//           )}
//         </div>

//         <div className="min-h-[2px] w-full bg-[var(--color-bg-brand-f)]"></div>

//         {/* メインコンテンツ コンテナ */}
//         <div className={`${styles.main_contents_container}`}>
//           {/* --------- 横幅全体ラッパー --------- */}
//           <div className={`${styles.full_contents_wrapper} flex w-full`}>
//             {/* --------- 左ラッパー --------- */}
//             <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
//               {/* ●面談日 */}
//               <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
//                 <div className="flex h-full w-full flex-col pr-[20px]">
//                   <div className={`${styles.title_box} flex h-full items-center `}>
//                     <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談日</span>
//                     <DatePickerCustomInput
//                       startDate={plannedDate}
//                       setStartDate={setPlannedDate}
//                       fontSize="text-[14px]"
//                       placeholderText="placeholder:text-[15px]"
//                       py="py-[6px]"
//                       minHeight="min-h-[32px]"
//                     />
//                   </div>
//                   <div className={`${styles.underline}`}></div>
//                 </div>
//               </div>

//               {/* 左ラッパーここまで */}
//             </div>

//             {/* --------- 右ラッパー --------- */}
//             <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
//               {/* ●面談タイプ */}
//               <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
//                 <div className="flex h-full w-full flex-col pr-[20px]">
//                   <div className={`${styles.title_box} flex h-full items-center `}>
//                     <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談タイプ</span>
//                     <select
//                       className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
//                       value={meetingType}
//                       onChange={(e) => {
//                         setMeetingType(e.target.value);
//                       }}
//                     >
//                       {/* <option value=""></option> */}
//                       <option value="訪問">訪問</option>
//                       <option value="WEB">WEB</option>
//                     </select>
//                   </div>
//                   <div className={`${styles.underline}`}></div>
//                 </div>
//               </div>

//               {/* 右ラッパーここまで */}
//             </div>
//           </div>
//           {/* --------- 横幅全体ラッパーここまで --------- */}
//         </div>
//       </div>
//     </>
//   );
// };
