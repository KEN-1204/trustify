// import { InputSendAndCloseBtn } from "@/components/DashboardCompanyComponent/CompanyMainContainer/InputSendAndCloseBtn/InputSendAndCloseBtn";
// import useDashboardStore from "@/store/useDashboardStore";
// import { ChangeEvent, FC, memo } from "react"
// import styles from './DashboardMainContainerHalf.module.css'
// import { BsCheck2 } from "react-icons/bs";
// import { SpinnerComet } from "../../SpinnerComet/SpinnerComet";
// import { UseMutationResult } from "@tanstack/react-query";

// type Props = {
//   activeEditFieldName: string;
//   updateClientCompanyFieldMutation: UseMutationResult<
//     any,
//     any,
//     {
//       fieldName: string;
//       value: any;
//       id: string;
//     },
//     unknown
//   >;
//   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
// };

// const CompanyRowAreaFullMemo: FC<Props> = ({
//   activeEditFieldName,
//   updateClientCompanyFieldMutation,
// }) => {
//   // 上画面の選択中の列データ会社
//   const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
//   // サーチモード、編集モード
//   const searchMode = useDashboardStore((state) => state.searchMode);
//   const setSearchMode = useDashboardStore((state) => state.setSearchMode);
//   // 各フィールドの編集モード => ダブルクリックで各フィールド名をstateに格納し、各フィールドをエディットモードへ
//   const isEditModeField = useDashboardStore((state) => state.isEditModeField);
//   const setIsEditModeField = useDashboardStore((state) => state.setIsEditModeField);
//   return (
//     <>
//       {/* ============= フィールドエディットモード関連 ============= */}
//       {/* フィールドエディットモード inputタグ */}
//       {!searchMode && isEditModeField === activeEditFieldName && (
//         <>
//           <input
//             type="text"
//             placeholder="株式会社○○"
//             autoFocus
//             className={`${styles.input_box} z-[2000]`}
//             value={inputName}
//             // value={selectedRowDataCompany?.name ? selectedRowDataCompany?.name : ""}
//             onChange={(e) => setInputName(e.target.value)}
//             onBlur={() => setInputName(toHalfWidthAndSpaceAndHyphen(inputName.trim()))}
//             onCompositionStart={() => setIsComposing(true)}
//             onCompositionEnd={() => setIsComposing(false)}
//             onKeyDown={(e) =>
//               handleKeyDownUpdateField({
//                 e,
//                 fieldName: activeEditFieldName,
//                 value: inputName,
//                 id: selectedRowDataCompany?.id,
//                 required: true,
//               })
//             }
//           />
//           {/* 送信ボタンとクローズボタン */}
//           {!updateClientCompanyFieldMutation.isLoading && (
//             <InputSendAndCloseBtn
//               inputState={inputName}
//               setInputState={setInputName}
//               onClickSendEvent={(e: React.MouseEvent<HTMLDivElement, MouseEvent>) =>
//                 handleClickSendUpdateField({
//                   e,
//                   fieldName: activeEditFieldName,
//                   value: inputName,
//                   id: selectedRowDataCompany?.id,
//                   required: true,
//                 })
//               }
//               required={true}
//             />
//           )}
//           {/* エディットフィールド送信中ローディングスピナー */}
//           {updateClientCompanyFieldMutation.isLoading && (
//             <div className={`${styles.field_edit_mode_loading_area}`}>
//               <SpinnerComet w="22px" h="22px" s="3px" />
//             </div>
//           )}
//         </>
//       )}
//       {/* フィールドエディットモードオーバーレイ */}
//       {!searchMode && isEditModeField === activeEditFieldName && (
//         <div
//           className={`${styles.edit_mode_overlay}`}
//           onClick={(e) => {
//             e.currentTarget.parentElement?.classList.remove(`${styles.active}`); // アンダーラインをremove
//             setIsEditModeField(null); // エディットモードを終了
//           }}
//         />
//       )}
//       {/* ============= フィールドエディットモード関連ここまで ============= */}
//     </>
//   );
// };

// export const CompanyRowAreaFull = memo(CompanyRowAreaFullMemo);
