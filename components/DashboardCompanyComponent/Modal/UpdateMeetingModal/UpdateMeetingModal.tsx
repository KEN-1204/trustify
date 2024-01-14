import React, { ChangeEvent, Suspense, useCallback, useEffect, useRef, useState } from "react";
import styles from "./UpdateMeetingModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateMeeting } from "@/hooks/useMutateMeeting";
import productCategoriesM from "@/utils/productCategoryM";
import { DatePickerCustomInput } from "@/utils/DatePicker/DatePickerCustomInput";
import { MdClose, MdOutlineDataSaverOff } from "react-icons/md";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { ImInfo } from "react-icons/im";
import useStore from "@/store";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { AiOutlinePlus, AiOutlineQuestionCircle } from "react-icons/ai";
import { AttendeeInfo, Contact_row_data, Department, IntroducedProductsName, Office, Product, Unit } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useQueryProducts } from "@/hooks/useQueryProducts";
import { DropDownMenuFilterProducts } from "../SettingAccountModal/SettingMemberAccounts/DropdownMenuFilterProducts/DropdownMenuFilterProducts";
import NextImage from "next/image";
import { useQueryProductSpecific } from "@/hooks/useQueryProductSpecific";
import { toHalfWidthAndSpaceAndHyphen } from "@/utils/Helpers/toHalfWidthAndSpaceAndHyphen";
import { toHalfWidth } from "@/utils/Helpers/toHalfWidth";
import { neonSearchIcon } from "@/components/assets";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import { getInitial } from "@/utils/Helpers/getInitial";
import { useMedia } from "react-use";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { Fallback } from "@/components/Fallback/Fallback";
import { SideTableSearchAttendees } from "./SideTableSearchAttendees/SideTableSearchAttendees";
import { FallbackSideTableSearchAttendees } from "./SideTableSearchAttendees/FallbackSideTableSearchAttendees";
import { getCompanyInitial } from "@/utils/Helpers/getInitialCompany";
import { invertFalsyExcludeZero } from "@/utils/Helpers/invertFalsyExcludeZero";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { ConfirmationModal } from "../SettingAccountModal/SettingCompany/ConfirmationModal/ConfirmationModal";
import { SideTableSearchMember } from "./SideTableSearchMember/SideTableSearchMember";
import { FallbackSideTableSearchMember } from "./SideTableSearchMember/FallbackSideTableSearchMember";
import {
  getPositionClassName,
  optionsMeetingParticipationRequest,
  optionsPlannedPurpose,
  optionsPositionsClass,
  optionsResultCategory,
  optionsResultNegotiateDecisionMaker,
} from "@/utils/selectOptions";

type ModalProperties = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

export const UpdateMeetingModal = () => {
  //   const selectedRowDataContact = useDashboardStore((state) => state.selectedRowDataContact);
  const selectedRowDataMeeting = useDashboardStore((state) => state.selectedRowDataMeeting);
  const setIsOpenUpdateMeetingModal = useDashboardStore((state) => state.setIsOpenUpdateMeetingModal);
  // const [isLoading, setIsLoading] = useState(false);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // const settingModalProperties = useDashboardStore((state) => state.settingModalProperties);
  // 確認モーダル(自社担当名、データ所有者変更確認)
  const [isOpenConfirmationModal, setIsOpenConfirmationModal] = useState<string | null>(null);
  // 自社担当検索サイドテーブル開閉
  const [isOpenSearchMemberSideTable, setIsOpenSearchMemberSideTable] = useState(false);
  // 紹介予定商品、実施商品選択時のドロップダウンメニュー用
  const [modalProperties, setModalProperties] = useState<ModalProperties>();
  // 事業部別製品編集ドロップダウンメニュー
  const [isOpenDropdownMenuFilterProducts, setIsOpenDropdownMenuFilterProducts] = useState(false);
  const [isOpenDropdownMenuFilterProductsArray, setIsOpenDropdownMenuFilterProductsArray] = useState(
    Array(1).fill(false)
  );
  // ドロップダウンメニューの表示位置
  type ClickedItemPos = { displayPos: "up" | "center" | "down"; clickedItemWidth: number | null };
  const [clickedItemPosition, setClickedItemPosition] = useState<ClickedItemPos>({
    displayPos: "down",
    clickedItemWidth: null,
  });
  // 同席者検索サイドテーブル
  const [isOpenSearchAttendeesSideTable, setIsOpenSearchAttendeesSideTable] = useState(false);

  // // メディアクエリState
  // // デスクトップモニター
  // const isDesktopGTE1600Media = useMedia("(min-width: 1600px)", false);
  // const [isDesktopGTE1600, setIsDesktopGTE1600] = useState(isDesktopGTE1600Media);
  // useEffect(() => {
  //   setIsDesktopGTE1600(isDesktopGTE1600Media);
  // }, [isDesktopGTE1600Media]);

  // const searchAttendeeFields = [
  //   {
  //     title: "会社名",
  //     inputValue: searchInputCompany,
  //     setInputValue: setSearchInputCompany,
  //   },
  //   {
  //     title: "部署名",
  //     inputValue: searchInputDepartment,
  //     setInputValue: setSearchInputDepartment,
  //   },
  //   {
  //     title: "担当者名",
  //     inputValue: searchInputContact,
  //     setInputValue: setSearchInputContact,
  //   },
  //   {
  //     title: "役職名",
  //     inputValue: searchInputPositionName,
  //     setInputValue: setSearchInputPositionName,
  //   },
  //   {
  //     title: "代表TEL",
  //     inputValue: searchInputTel,
  //     setInputValue: setSearchInputTel,
  //   },
  //   {
  //     title: "直通TEL",
  //     inputValue: searchInputDirectLine,
  //     setInputValue: setSearchInputDirectLine,
  //   },
  //   {
  //     title: "社用携帯",
  //     inputValue: searchInputCompanyCellPhone,
  //     setInputValue: setSearchInputCompanyCellPhone,
  //   },
  //   {
  //     title: "Email",
  //     inputValue: searchInputEmail,
  //     setInputValue: setSearchInputEmail,
  //   },
  //   {
  //     title: "住所",
  //     inputValue: searchInputAddress,
  //     setInputValue: setSearchInputAddress,
  //   },
  // ];

  // // サイドテーブルの同席者一覧エリアのスクロールアイテムRef
  // const sideTableScrollHeaderRef = useRef<HTMLDivElement | null>(null);
  // const sideTableScrollContainerRef = useRef<HTMLDivElement | null>(null);
  // const sideTableScrollItemRef = useRef<HTMLDivElement | null>(null);
  // const originalY = useRef<number | null>(null);

  // // サイドテーブル スクロール監視イベント
  // const handleScrollEvent = useCallback(() => {
  //   if (!sideTableScrollItemRef.current || !sideTableScrollHeaderRef.current || !originalY.current) return;
  //   const currentScrollY = sideTableScrollItemRef.current.getBoundingClientRect().y;
  //   // const currentScrollY = sideTableScrollItemRef.current.offsetTop;
  //   console.log("scrollイベント発火🔥 現在のscrollY, originalY.current", currentScrollY, originalY.current);
  //   if (originalY.current !== currentScrollY) {
  //     if (sideTableScrollHeaderRef.current.classList.contains(`${styles.active}`)) return;
  //     sideTableScrollHeaderRef.current.classList.add(`${styles.active}`);
  //     console.log("✅useEffect add");
  //   } else {
  //     if (!sideTableScrollHeaderRef.current.classList.contains(`${styles.active}`)) return;
  //     sideTableScrollHeaderRef.current.classList.remove(`${styles.active}`);
  //     console.log("✅useEffect remove");
  //   }
  // }, []);
  // useEffect(() => {
  //   if (!sideTableScrollContainerRef.current || !sideTableScrollItemRef.current) return;
  //   // 初期Y位置取得
  //   if (!originalY.current) {
  //     originalY.current = sideTableScrollItemRef.current.getBoundingClientRect().y;
  //   }
  //   sideTableScrollContainerRef.current.addEventListener(`scroll`, handleScrollEvent);
  //   console.log("✅useEffectスクロール開始");

  //   return () => {
  //     if (!sideTableScrollContainerRef.current)
  //       return console.log("❌useEffectクリーンアップ sideTableScrollContainerRef.currentは既に存在せず リターン");
  //     sideTableScrollContainerRef.current?.removeEventListener(`scroll`, handleScrollEvent);
  //     console.log("✅useEffectスクロール終了 リターン");
  //   };
  // }, [handleScrollEvent]);

  // サイドテーブルスクロール時にヘッダーがactiveな状態かどうか、かつ、同席者を選択中か否かでボタンの色とボーダーを変更
  // const getButtonProperties = (prop: string, isScrolling: boolean, active: boolean) => {
  //   switch (prop) {
  //     case "textColor":
  //       if (isScrolling && active) return "#fff";
  //       if (isScrolling && !active) return "#333";
  //       if (!isScrolling && active) return "#fff";
  //       if (!isScrolling && !active) return "#666";
  //       break;
  //     case "bgColor":
  //       if (isScrolling && active) return "#ccc";
  //       if (isScrolling && !active) return "#999";
  //       if (!isScrolling && active) return "var(--color-bg-brand-f50)";
  //       if (!isScrolling && !active) return "var(--color-bg-brand-f20)";
  //       break;
  //     case "bgColorHover":
  //       if (isScrolling && active) return "#ddd";
  //       if (isScrolling && !active) return "#999";
  //       if (!isScrolling && active) return "var(--color-btn-brand-f-hover)";
  //       if (!isScrolling && !active) return "var(--color-bg-brand-f20)";
  //       break;
  //     case "border":
  //       if (isScrolling && active) return "#fff";
  //       if (isScrolling && !active) return "#ccc";
  //       if (!isScrolling && active) return "var(--color-bg-brand-f)";
  //       if (!isScrolling && !active) return "var(--color-bg-brand-f60)";
  //       break;

  //     default:
  //       break;
  //   }
  // };

  // モーダルの動的に変化する画面からのx, yとモーダルのwidth, heightを取得
  useEffect(() => {
    if (modalContainerRef.current === null) return console.log("❌無し");
    const rect = modalContainerRef.current.getBoundingClientRect();
    // if (modalProperties !== null && modalProperties?.left === rect.left)
    //   return console.log("✅モーダル位置サイズ格納済み", modalProperties);

    const left = rect.left;
    const top = rect.top;
    const right = rect.right;
    const bottom = rect.bottom;
    const width = rect.width;
    const height = rect.height;

    const payload = { left: left, top: top, right: right, bottom: bottom, width: width, height: height };
    console.log("🔥モーダル位置サイズ格納", payload);
    setModalProperties(payload);
  }, []);

  const initialDate = new Date();
  initialDate.setHours(0, 0, 0, 0);
  const year = initialDate.getFullYear(); // 例: 2023
  const month = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
  const meetingYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
  // const [MeetingDate, setMeetingDate] = useState<Date | null>(new Date());
  const [meetingType, setMeetingType] = useState("訪問");
  const [webTool, setWebTool] = useState("");
  // const [plannedDate, setPlannedDate] = useState<Date | null>(initialDate);
  const [plannedDate, setPlannedDate] = useState<Date | null>(
    selectedRowDataMeeting && selectedRowDataMeeting.planned_date ? new Date(selectedRowDataMeeting.planned_date) : null
  );
  const [plannedStartTime, setPlannedStartTime] = useState<string>("");
  const [plannedStartTimeHour, setPlannedStartTimeHour] = useState<string>("");
  const [plannedStartTimeMinute, setPlannedStartTimeMinute] = useState<string>("");
  const [plannedPurpose, setPlannedPurpose] = useState("");
  const [plannedDuration, setPlannedDuration] = useState<number | null>(null);
  const [plannedAppointCheckFlag, setPlannedAppointCheckFlag] = useState(false);
  const [plannedProduct1, setPlannedProduct1] = useState("");
  const [plannedProduct2, setPlannedProduct2] = useState("");
  const [plannedComment, setPlannedComment] = useState("");
  const [resultDate, setResultDate] = useState<Date | null>(null);
  const [resultStartTime, setResultStartTime] = useState<string>("");
  const [resultStartTimeHour, setResultStartTimeHour] = useState<string>("");
  const [resultStartTimeMinute, setResultStartTimeMinute] = useState<string>("");
  const [resultEndTime, setResultEndTime] = useState<string>("");
  const [resultEndTimeHour, setResultEndTimeHour] = useState<string>("");
  const [resultEndTimeMinute, setResultEndTimeMinute] = useState<string>("");
  const [resultDuration, setResultDuration] = useState<number | null>(null);
  const [resultNumberOfMeetingParticipants, setResultNumberOfMeetingParticipants] = useState<number | null>(null);
  // const [resultPresentationProduct1, setResultPresentationProduct1] = useState("");
  // const [resultPresentationProduct2, setResultPresentationProduct2] = useState("");
  // const [resultPresentationProduct3, setResultPresentationProduct3] = useState("");
  // const [resultPresentationProduct4, setResultPresentationProduct4] = useState("");
  // const [resultPresentationProduct5, setResultPresentationProduct5] = useState("");
  const [resultCategory, setResultCategory] = useState("");
  const [resultSummary, setResultSummary] = useState("");
  const [resultNegotiateDecisionMaker, setResultNegotiateDecisionMaker] = useState("");
  const [resultTopPositionClass, setResultTopPositionClass] = useState("1 代表者");
  const [preMeetingParticipationRequest, setPreMeetingParticipationRequest] = useState("");
  const [meetingParticipationRequest, setMeetingParticipationRequest] = useState("");
  // 事業部
  // const [departmentId, setDepartmentId] = useState<Department["id"] | null>(
  //   selectedRowDataMeeting?.meeting_created_by_department_of_user
  //     ? selectedRowDataMeeting?.meeting_created_by_department_of_user
  //     : null
  // );
  // // 係
  // const [unitId, setUnitId] = useState<Unit["id"] | null>(
  //   selectedRowDataMeeting?.meeting_created_by_unit_of_user
  //     ? selectedRowDataMeeting?.meeting_created_by_unit_of_user
  //     : null
  // );
  // // 事業所
  // const [officeId, setOfficeId] = useState<Office["id"] | null>(
  //   selectedRowDataMeeting?.meeting_created_by_office_of_user
  //     ? selectedRowDataMeeting?.meeting_created_by_office_of_user
  //     : null
  // );
  // =======営業担当データ
  type MemberDetail = {
    memberId: string | null;
    memberName: string | null;
    departmentId: string | null;
    unitId: string | null;
    officeId: string | null;
  };
  // 作成したユーザーのidと名前が初期値
  const initialMemberObj = {
    memberName: selectedRowDataMeeting?.meeting_member_name ? selectedRowDataMeeting?.meeting_member_name : null,
    memberId: selectedRowDataMeeting?.meeting_created_by_user_id
      ? selectedRowDataMeeting?.meeting_created_by_user_id
      : null,
    departmentId: selectedRowDataMeeting?.meeting_created_by_department_of_user
      ? selectedRowDataMeeting?.meeting_created_by_department_of_user
      : null,
    unitId: selectedRowDataMeeting?.meeting_created_by_unit_of_user
      ? selectedRowDataMeeting?.meeting_created_by_unit_of_user
      : null,
    officeId: selectedRowDataMeeting?.meeting_created_by_office_of_user
      ? selectedRowDataMeeting?.meeting_created_by_office_of_user
      : null,
  };
  const [prevMemberObj, setPrevMemberObj] = useState<MemberDetail>(initialMemberObj);
  const [memberObj, setMemberObj] = useState<MemberDetail>(initialMemberObj);
  // =======営業担当データここまで
  // const [meetingMemberName, setMeetingMemberName] = useState(
  //   selectedRowDataMeeting?.meeting_member_name ? selectedRowDataMeeting?.meeting_member_name : ""
  // );
  // 面談年月度
  const [meetingYearMonth, setMeetingYearMonth] = useState<number | null>(Number(meetingYearMonthInitialValue));
  // 実施商品リスト配列
  const [resultPresentationProductsArray, setResultPresentationProductsArray] = useState<
    (IntroducedProductsName | null)[]
  >(
    !!selectedRowDataMeeting?.introduced_products_names?.length
      ? selectedRowDataMeeting.introduced_products_names
      : Array(2).fill(null)
  );
  // const [resultPresentationProductsArray, setResultPresentationProductsArray] = useState<(string | null)[]>(
  //   !!selectedRowDataMeeting?.introduced_products_names?.length
  //     ? selectedRowDataMeeting.introduced_products_names.map((product) => product.introduced_product_id)
  //     : Array(2).fill(null)
  // );
  // 選択中の同席者オブジェクトを保持する配列
  // const [selectedAttendeesArray, setSelectedAttendeesArray] = useState<Contact_row_data[]>([]);
  // const [selectedAttendeesArray, setSelectedAttendeesArray] = useState<AttendeeInfo[]>([]);
  const [selectedAttendeesArray, setSelectedAttendeesArray] = useState<AttendeeInfo[]>(
    selectedRowDataMeeting?.attendees_info ? selectedRowDataMeeting?.attendees_info : []
  );

  // ユーザーの決算月と締め日を取得
  const fiscalEndMonthObjRef = useRef<Date | null>(null);
  const closingDayRef = useRef<number | null>(null);

  const queryClient = useQueryClient();
  const { updateMeetingMutation } = useMutateMeeting();

  // 「実施商品を追加」ボタンを押下した場合の処理 selectボックスを2つ(１行)増やす
  // 行はresultProductRowsのstateで管理し、これをmapで展開し、実際のidを保持はresultPresentationProductsArrayで行う
  const [overstate, setOverState] = useState(false);
  // const [resultProductRows, setResultProductRows] = useState(Array(1).fill(null));
  const [resultProductRows, setResultProductRows] = useState(
    !!selectedRowDataMeeting?.introduced_products_names?.length
      ? Array(Math.ceil(selectedRowDataMeeting.introduced_products_names.length / 2)).fill(null)
      : Array(1).fill(null)
  );

  const addMoreResultProductRow = () => {
    if (resultPresentationProductsArray.length >= 20) {
      setOverState(true);
      alert("実施商品を追加できるのは20個までです。");
      return console.log(`上限オーバー`);
    }
    setResultPresentationProductsArray((prev) => [...prev, null, null]);
    setResultProductRows((prev) => [...prev, null]);
    // 実施商品用ドロップダウン開閉特定用
    setIsOpenDropdownMenuFilterProductsArray((prev) => [...prev, false]);
    // setCheckedEmail((prev) => [...prev, ""]);
    // setCheckedSameUserEmailArray((prev) => [...prev, false]);
  };

  // 実施商品グループの各商品idが変更されたときに実行する関数
  // const handleChangeSelectProductId = (index: number, e: ChangeEvent<HTMLSelectElement>) => {
  //   const newResultPresentationProducts = [...resultPresentationProductsArray];
  //   newResultPresentationProducts[index] = e.target.value;
  //   setResultPresentationProductsArray(newResultPresentationProducts);
  // };

  // ============================ 🌟事業部、係、事業所リスト取得useQuery🌟 ============================
  const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ============================ ✅事業部、係、事業所リスト取得useQuery✅ ============================

  // ================================ 🌟商品リスト取得useQuery🌟 ================================
  type FilterCondition = {
    department_id: Department["id"] | null;
    unit_id: Unit["id"] | null;
    office_id: Office["id"] | null;
    //   employee_id_name: Employee_id["id"];
  };
  // useQueryで事業部・係・事業所を絞ったフェッチをするかどうか
  const [filterCondition, setFilterCondition] = useState<FilterCondition>({
    department_id: userProfileState?.assigned_department_id ? userProfileState?.assigned_department_id : null,
    unit_id: null,
    office_id: null,
  });
  // 🌟初回はユーザー自身の事業部のみの商品リストを取得
  const { data: productDataArray, isLoading: isLoadingQueryProduct } = useQueryProducts({
    company_id: userProfileState?.company_id ? userProfileState?.company_id : null,
    departmentId: filterCondition.department_id,
    unitId: filterCondition.unit_id,
    officeId: filterCondition.office_id,
    isReady: true,
  });
  // 🌟紹介予定商品メインと、サブは既に保存されたidでユーザー自身の事業部の商品を紹介しているとは限らないので、
  // 両商品ごとに商品名を含む商品オブジェクトを取得する

  const { data: plannedProduct1QueryObj } = useQueryProductSpecific({
    productId: selectedRowDataMeeting?.planned_product1 ? selectedRowDataMeeting?.planned_product1 : null,
    company_id: userProfileState?.company_id ? userProfileState?.company_id : null,
  });
  const { data: plannedProduct2QueryObj } = useQueryProductSpecific({
    productId: selectedRowDataMeeting?.planned_product2 ? selectedRowDataMeeting?.planned_product2 : null,
    company_id: userProfileState?.company_id ? userProfileState?.company_id : null,
  });

  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅商品リスト取得useQuery✅ ================================
  // ============================ 🌟productのオブジェクトマップ(商品id: 商品名)🌟 ============================
  type ProductNameObj = {
    product_name: string | null;
    outside_short_name: string | null;
    inside_short_name: string | null;
  };
  type ProductMap = { [key: string]: ProductNameObj };
  // 商品idから商品名を取得するマップ
  // 商品id(9c3f05b3-): {product_name: '高精度画像寸法測定機', outside_short_name: 'LM-1000/1100', inside_short_name: 'LM1'}
  const [productIdToNameMap, setProductIdToNameMap] = useState<ProductMap>({});
  const createProductMap = (productDataArray: Product[] | undefined) => {
    if (!productDataArray || productDataArray?.length === 0) return {};
    return productDataArray?.reduce((acc, product) => {
      const key = !product.id ? "All" : product.id;
      acc[key] = {
        product_name: product.product_name,
        outside_short_name: product.outside_short_name,
        inside_short_name: product.inside_short_name,
      };
      return acc;
    }, {} as { [key: string]: ProductNameObj });
  };
  const updateProductMap = (newProductDataArray: Product[] | undefined) => {
    setProductIdToNameMap((prevProductMap) => {
      // 新たな商品データ配列
      const newProductMap = createProductMap(newProductDataArray);
      // 元々保持していた商品データ配列
      const updatedMap: ProductMap = { ...prevProductMap };
      // 既に存在している商品idは追加せずに、新たな商品idのみオブジェクトに追加
      Object.keys(newProductMap).forEach((key) => {
        if (!updatedMap.hasOwnProperty(key)) {
          updatedMap[key] = newProductMap[key];
        }
      });
      // 紹介予定商品メインと、サブが別事業部だった場合(自事業部の商品オブジェクトマップのkeyのidに含まれていない場合は
      // updatedMapに追加する)
      if (plannedProduct1QueryObj?.id && !updatedMap[plannedProduct1QueryObj.id]) {
        updatedMap[plannedProduct1QueryObj.id] = {
          product_name: plannedProduct1QueryObj.product_name ?? null,
          outside_short_name: plannedProduct1QueryObj.outside_short_name ?? null,
          inside_short_name: plannedProduct1QueryObj.inside_short_name ?? null,
        };
        console.log(
          "🔥メイン別事業部の商品なので新たにマップに追加",
          updatedMap,
          plannedProduct1QueryObj.outside_short_name
        );
      }
      if (plannedProduct2QueryObj?.id && !updatedMap[plannedProduct2QueryObj.id]) {
        updatedMap[plannedProduct2QueryObj.id] = {
          product_name: plannedProduct2QueryObj.product_name ?? null,
          outside_short_name: plannedProduct2QueryObj.outside_short_name ?? null,
          inside_short_name: plannedProduct2QueryObj.inside_short_name ?? null,
        };
        console.log(
          "🔥サブ別事業部の商品なので新たにマップに追加",
          updatedMap,
          plannedProduct2QueryObj.outside_short_name
        );
      }

      return updatedMap;
    });
  };
  useEffect(() => {
    // {商品id: 商品名}のオブジェクトマップを生成 重複しないようにhasOwnPropertyでチェック
    if (productDataArray && productDataArray?.length > 0) {
      updateProductMap(productDataArray);
    }
  }, [productDataArray]);
  // ============================ ✅productのオブジェクトマップ(商品id: 商品名)✅ ============================

  function formatTime(timeStr: string) {
    const [hour, minute] = timeStr.split(":");
    return `${hour}:${minute}`;
  }

  // 🌟初回マウント時に選択中の担当者&会社の列データの情報をStateに格納
  useEffect(() => {
    if (!selectedRowDataMeeting) return;
    const selectedInitialMeetingDate = selectedRowDataMeeting.planned_date
      ? new Date(selectedRowDataMeeting.planned_date)
      : null;
    const selectedYear = initialDate.getFullYear(); // 例: 2023
    const selectedMonth = initialDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整
    const selectedYearMonthInitialValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加

    // let _activity_date = selectedRowDataActivity.activity_date ? new Date(selectedRowDataActivity.activity_date) : null;
    let _meeting_created_by_user_id = selectedRowDataMeeting.meeting_created_by_user_id
      ? selectedRowDataMeeting.meeting_created_by_user_id
      : null;
    let _meeting_created_by_department_of_user = selectedRowDataMeeting.meeting_created_by_department_of_user
      ? selectedRowDataMeeting.meeting_created_by_department_of_user
      : null;
    let _meeting_created_by_unit_of_user = selectedRowDataMeeting.meeting_created_by_unit_of_user
      ? selectedRowDataMeeting.meeting_created_by_unit_of_user
      : null;
    let _meeting_created_by_office_of_user = selectedRowDataMeeting.meeting_created_by_office_of_user
      ? selectedRowDataMeeting.meeting_created_by_office_of_user
      : null;
    let _meeting_type = selectedRowDataMeeting.meeting_type ? selectedRowDataMeeting.meeting_type : "";
    let _web_tool = selectedRowDataMeeting.web_tool ? selectedRowDataMeeting.web_tool : "";
    let _planned_date = selectedInitialMeetingDate;
    let _planned_start_time = selectedRowDataMeeting.planned_start_time
      ? formatTime(selectedRowDataMeeting.planned_start_time)
      : "";
    let _planned_purpose = selectedRowDataMeeting.planned_purpose ? selectedRowDataMeeting.planned_purpose : "";
    let _planned_duration = selectedRowDataMeeting.planned_duration ? selectedRowDataMeeting.planned_duration : null;
    let _planned_appoint_check_flag = selectedRowDataMeeting.planned_appoint_check_flag
      ? selectedRowDataMeeting.planned_appoint_check_flag
      : false;
    let _planned_product1 = selectedRowDataMeeting.planned_product1 ? selectedRowDataMeeting.planned_product1 : "";
    let _planned_product2 = selectedRowDataMeeting.planned_product2 ? selectedRowDataMeeting.planned_product2 : "";
    let _planned_comment = selectedRowDataMeeting.planned_comment ? selectedRowDataMeeting.planned_comment : "";
    let _result_date = selectedRowDataMeeting.result_date ? new Date(selectedRowDataMeeting.result_date) : null;
    let _result_start_time = selectedRowDataMeeting.result_start_time
      ? formatTime(selectedRowDataMeeting.result_start_time)
      : "";
    let _result_end_time = selectedRowDataMeeting.result_end_time
      ? formatTime(selectedRowDataMeeting.result_end_time)
      : "";
    let _result_duration = selectedRowDataMeeting.result_duration ? selectedRowDataMeeting.result_duration : null;
    let _result_number_of_meeting_participants = selectedRowDataMeeting.result_number_of_meeting_participants
      ? selectedRowDataMeeting.result_number_of_meeting_participants
      : null;
    let _result_presentation_product1 = selectedRowDataMeeting.result_presentation_product1
      ? selectedRowDataMeeting.result_presentation_product1
      : "";
    let _result_presentation_product2 = selectedRowDataMeeting.result_presentation_product2
      ? selectedRowDataMeeting.result_presentation_product2
      : "";
    let _result_presentation_product3 = selectedRowDataMeeting.result_presentation_product3
      ? selectedRowDataMeeting.result_presentation_product3
      : "";
    let _result_presentation_product4 = selectedRowDataMeeting.result_presentation_product4
      ? selectedRowDataMeeting.result_presentation_product4
      : "";
    let _result_presentation_product5 = selectedRowDataMeeting.result_presentation_product5
      ? selectedRowDataMeeting.result_presentation_product5
      : "";
    let _result_category = selectedRowDataMeeting.result_category ? selectedRowDataMeeting.result_category : "";
    let _result_summary = selectedRowDataMeeting.result_summary ? selectedRowDataMeeting.result_summary : "";
    let _result_negotiate_decision_maker = selectedRowDataMeeting.result_negotiate_decision_maker
      ? selectedRowDataMeeting.result_negotiate_decision_maker
      : "";
    let _result_top_position_class = selectedRowDataMeeting.result_top_position_class
      ? selectedRowDataMeeting.result_top_position_class.toString()
      : "1";
    let _pre_meeting_participation_request = selectedRowDataMeeting.pre_meeting_participation_request
      ? selectedRowDataMeeting.pre_meeting_participation_request
      : "";
    let _meeting_participation_request = selectedRowDataMeeting.meeting_participation_request
      ? selectedRowDataMeeting.meeting_participation_request
      : "";
    let _meeting_department = selectedRowDataMeeting.meeting_created_by_department_of_user
      ? selectedRowDataMeeting.meeting_created_by_department_of_user
      : "";
    let _unit = selectedRowDataMeeting.meeting_created_by_unit_of_user
      ? selectedRowDataMeeting.meeting_created_by_unit_of_user
      : "";
    let _meeting_business_office = selectedRowDataMeeting.meeting_created_by_office_of_user
      ? selectedRowDataMeeting.meeting_created_by_office_of_user
      : "";
    let _meeting_member_name = selectedRowDataMeeting.meeting_member_name
      ? selectedRowDataMeeting.meeting_member_name
      : "";
    let _meeting_year_month = selectedRowDataMeeting.meeting_year_month
      ? selectedRowDataMeeting.meeting_year_month
      : Number(selectedYearMonthInitialValue);
    // let _introduced_products_names = !!selectedRowDataMeeting?.introduced_products_names?.length
    //   ? selectedRowDataMeeting.introduced_products_names.map((product) => product.introduced_product_id)
    //   : Array(2).fill(null);
    let _introduced_products_names = !!selectedRowDataMeeting?.introduced_products_names?.length
      ? selectedRowDataMeeting.introduced_products_names
      : Array(2).fill(null);
    let _attendees_info = selectedRowDataMeeting?.attendees_info ? selectedRowDataMeeting?.attendees_info : [];

    setMeetingType(_meeting_type);
    setWebTool(_web_tool);
    setPlannedDate(_planned_date);
    setPlannedStartTime(_planned_start_time);
    const [plannedStartHour, plannedStartMinute] = _planned_start_time ? _planned_start_time.split(":") : ["", ""];
    setPlannedStartTimeHour(plannedStartHour);
    setPlannedStartTimeMinute(plannedStartMinute);
    setPlannedPurpose(_planned_purpose);
    setPlannedDuration(_planned_duration);
    setPlannedAppointCheckFlag(_planned_appoint_check_flag);
    setPlannedProduct1(_planned_product1);
    setPlannedProduct2(_planned_product2);
    setPlannedComment(_planned_comment);
    setResultDate(_result_date);
    setResultStartTime(_result_start_time);
    const [resultStartHour, resultStartMinute] = _result_start_time ? _result_start_time.split(":") : ["", ""];
    setResultStartTimeHour(resultStartHour);
    setResultStartTimeMinute(resultStartMinute);
    setResultEndTime(_result_end_time);
    const [resultEndHour, resultEndMinute] = _result_end_time ? _result_end_time.split(":") : ["", ""];
    setResultEndTimeHour(resultEndHour);
    setResultEndTimeMinute(resultEndMinute);
    setResultDuration(_result_duration);
    setResultNumberOfMeetingParticipants(_result_number_of_meeting_participants);
    // setResultPresentationProduct1(_result_presentation_product1);
    // setResultPresentationProduct2(_result_presentation_product2);
    // setResultPresentationProduct3(_result_presentation_product3);
    // setResultPresentationProduct4(_result_presentation_product4);
    // setResultPresentationProduct5(_result_presentation_product5);
    setResultCategory(_result_category);
    setResultSummary(_result_summary);
    setResultNegotiateDecisionMaker(_result_negotiate_decision_maker);
    setResultTopPositionClass(_result_top_position_class);
    setPreMeetingParticipationRequest(_pre_meeting_participation_request);
    setMeetingParticipationRequest(_meeting_participation_request);
    // setDepartmentId(_meeting_department);
    // setUnitId(_unit);
    // setOfficeId(_meeting_business_office);
    // setMeetingMemberName(_meeting_member_name);
    const memberDetail = {
      memberId: _meeting_created_by_user_id,
      memberName: _meeting_member_name,
      departmentId: _meeting_created_by_department_of_user,
      unitId: _meeting_created_by_unit_of_user,
      officeId: _meeting_created_by_office_of_user,
    };
    setMemberObj(memberDetail);
    setPrevMemberObj(memberDetail);
    setMeetingYearMonth(_meeting_year_month);

    // 同席者リスト
    setSelectedAttendeesArray(_attendees_info);
    // 実施商品リスト
    setResultPresentationProductsArray(_introduced_products_names);
  }, []);

  //   useEffect(() => {
  //     if (!userProfileState) return;
  //     setMeetingMemberName(userProfileState.profile_name ? userProfileState.profile_name : "");
  //     setMeetingBusinessOffice(userProfileState.office ? userProfileState.office : "");
  //     setMeetingDepartment(userProfileState.department ? userProfileState.department : "");
  //   }, []);

  // 🌟面談開始から面談終了時間の間の面談時間を計算する関数
  function isCompleteTime(timeStr: string) {
    const [hour, minute] = timeStr.split(":");
    return hour && minute;
  }
  const calculateDuration = (startTimeStr: string, endTimeStr: string) => {
    // startTimeStr および endTimeStr が完全に設定されているかチェック
    if (!isCompleteTime(startTimeStr) || !isCompleteTime(endTimeStr)) {
      return null;
    }

    // 両方の時間が完全に設定されている場合のみ計算を実行
    const [startHour, startMinute] = startTimeStr.split(":").map(Number);
    const [endHour, endMinute] = endTimeStr.split(":").map(Number);

    const startDate = new Date(0, 0, 0, startHour, startMinute);
    const endDate = new Date(0, 0, 0, endHour, endMinute);

    const diffMs = endDate.getTime() - startDate.getTime();

    // ミリ秒から分に変換
    const diffMinutes = diffMs / (1000 * 60);
    return diffMinutes;
  };

  // 🌟予定面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    // const formattedTime = `${plannedStartTimeHour}:${plannedStartTimeMinute}`;
    // setPlannedStartTime(formattedTime);
    if (plannedStartTimeHour && plannedStartTimeMinute) {
      const formattedTime = `${plannedStartTimeHour}:${plannedStartTimeMinute}`;
      setPlannedStartTime(formattedTime);
    } else {
      setPlannedStartTime(""); // or setResultStartTime('');
    }
  }, [plannedStartTimeHour, plannedStartTimeMinute]);
  // 🌟結果面談開始時間、時間、分、結合用useEffect
  useEffect(() => {
    // const formattedTime = `${resultStartTimeHour}:${resultStartTimeMinute}`;
    // setResultStartTime(formattedTime);
    if (resultStartTimeHour && resultStartTimeMinute) {
      const formattedTime = `${resultStartTimeHour}:${resultStartTimeMinute}`;
      setResultStartTime(formattedTime);
    } else {
      setResultStartTime(""); // or setResultStartTime('');
    }
  }, [resultStartTimeHour, resultStartTimeMinute]);
  // 🌟結果面談終了時間、時間、分、結合用useEffect
  useEffect(() => {
    // const formattedTime = `${resultEndTimeHour}:${resultEndTimeMinute}`;
    // setResultEndTime(formattedTime);
    if (resultEndTimeHour && resultEndTimeMinute) {
      const formattedTime = `${resultEndTimeHour}:${resultEndTimeMinute}`;
      setResultEndTime(formattedTime);
    } else {
      setResultEndTime(""); // or setResultStartTime('');
    }
  }, [resultEndTimeHour, resultEndTimeMinute]);
  // 🌟面談時間計算用useEffect
  useEffect(() => {
    if (isCompleteTime(resultStartTime) && isCompleteTime(resultEndTime)) {
      const duration = calculateDuration(resultStartTime, resultEndTime);
      setResultDuration(duration);
    } else {
      setResultDuration(null);
    }
  }, [resultStartTime, resultEndTime]);

  // ----------------------------- 🌟年月度自動計算🌟 -----------------------------
  // 🌟ユーザーの決算月の締め日を初回マウント時に取得
  useEffect(() => {
    // ユーザーの決算月から締め日を取得、決算つきが未設定の場合は現在の年と3月31日を設定
    const fiscalEndMonth = userProfileState?.customer_fiscal_end_month
      ? new Date(userProfileState.customer_fiscal_end_month)
      : new Date(new Date().getFullYear(), 2, 31);
    const closingDay = fiscalEndMonth.getDate(); //ユーザーの締め日
    fiscalEndMonthObjRef.current = fiscalEndMonth; //refに格納
    closingDayRef.current = closingDay; //refに格納
  }, []);

  // 🌟結果面談日を更新したら面談年月度をユーザーの締め日に応じて更新するuseEffect
  // ユーザーの財務サイクルに合わせて面談年月度を自動的に取得する関数(決算月の締め日の翌日を新たな月度の開始日とする)
  useEffect(() => {
    // 更新はresultDateの面談日(結果)で計算を行う
    if (!resultDate || !closingDayRef.current) {
      // setMeetingYearMonth(null);
      setMeetingYearMonth(
        selectedRowDataMeeting?.meeting_year_month ? selectedRowDataMeeting?.meeting_year_month : null
      );
      return;
    }
    // 面談予定日の年と日を取得
    let year = resultDate.getFullYear(); // 例: 2023
    let month = resultDate.getMonth() + 1; // getMonth()は0から11で返されるため、+1して1から12に調整

    console.log("決算月", fiscalEndMonthObjRef.current);
    console.log("締め日", closingDayRef.current);
    console.log("resultDate", resultDate);
    console.log("year", year);
    console.log("month", month);

    // 面談日の締め日の翌日以降の場合、次の月度とみなす
    if (resultDate.getDate() > closingDayRef.current) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
    }
    // 年月度を6桁の数値で表現
    const fiscalYearMonth = year * 100 + month;
    console.log("fiscalYearMonth", fiscalYearMonth);
    setMeetingYearMonth(fiscalYearMonth);
    // const meetingYearMonthUpdatedValue = `${year}${month < 10 ? "0" + month : month}`; // 月が1桁の場合は先頭に0を追加
    // setMeetingYearMonth(Number(meetingYearMonthUpdatedValue));
  }, [resultDate]);
  // ----------------------------- ✅年月度自動計算✅ -----------------------------

  // 🌟キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    if (loadingGlobalState) return;
    setIsOpenUpdateMeetingModal(false);
  };

  // 🌟面談データの更新
  const handleSaveAndClose = async () => {
    // if (!summary) return alert("活動概要を入力してください");
    // if (!MeetingType) return alert("活動タイプを選択してください");
    if (!userProfileState?.id) return alert("ユーザー情報が存在しません");
    if (!selectedRowDataMeeting?.company_id) return alert("相手先の会社情報が存在しません");
    if (!selectedRowDataMeeting?.contact_id) return alert("担当者情報が存在しません");
    if (plannedPurpose === "") return alert("面談目的を選択してください");
    if (plannedStartTimeHour === "") return alert("予定面談開始 時間を選択してください");
    if (plannedStartTimeMinute === "") return alert("予定面談開始 分を選択してください");
    if (!plannedDate) return alert("予定面談日の入力は必須です");
    // if (resultStartTimeHour === "") return alert("結果面談開始 時間を選択してください");
    // if (resultStartTimeMinute === "") return alert("結果面談開始 分を選択してください");
    // if (resultEndTimeHour === "") return alert("結果面談終了 時間を選択してください");
    // if (resultEndTimeMinute === "") return alert("結果面談終了 分を選択してください");
    if (!meetingYearMonth) return alert("面談年月度を入力してください");
    // if (meetingMemberName === "") return alert("自社担当を入力してください");
    if (memberObj.memberName === "") return alert("自社担当を入力してください");

    // 自社担当変更確認モーダルが開いている場合はリターン
    // if (!!isOpenConfirmationModal) return toast.info("自社担当が変更されるかも");
    // return alert("OK");

    // 実施商品リストの配列からnullを除いたidの値のみの配列を生成 1つもなければ最低一つ選択するようにアラート
    // const resultProductsArrayExcludeNull: string[] = resultPresentationProductsArray.filter(
    //   (productId): productId is string =>
    //     productId !== null && productId !== "" && productId !== undefined && typeof productId === "string"
    // );
    const productIdArray = resultPresentationProductsArray.map(
      (productObj) => productObj?.introduced_product_id ?? null
    );
    const resultProductsArrayExcludeNull: string[] = productIdArray.filter(
      (productId): productId is string =>
        productId !== null && productId !== "" && productId !== undefined && typeof productId === "string"
    );

    if (!resultProductsArrayExcludeNull || resultProductsArrayExcludeNull.length === 0) {
      return alert("「実施商品を最低1つ入力してください。");
    }

    // 新たな紹介ずみ商品id配列に、元々の紹介ずみ商品配列の中で含まれていない商品idの数を取得し、削除が必要な数値をパラメータに渡す
    const resultProducts = new Set(resultProductsArrayExcludeNull);
    const _deleteProductCount = !!selectedRowDataMeeting.introduced_products_names?.length
      ? selectedRowDataMeeting.introduced_products_names.filter(
          (product) => !resultProducts.has(product.introduced_product_id)
        ).length
      : 0;

    // 実施1~5までを割り当てる用のnullを除いたproductオブジェクトの配列
    const resultProductObjArrayExcludeNull: IntroducedProductsName[] = resultPresentationProductsArray.filter(
      (obj): obj is IntroducedProductsName => obj !== null
    );

    // 同席者のcontact_idのみのuuidの配列を生成
    // const attendeeIdsArray = selectedAttendeesArray
    //   .map((attendee) => attendee.contact_id)
    //   .filter((id) => id !== null && id !== "" && id !== undefined && typeof id === "string");
    const attendeeIdsArray = selectedAttendeesArray
      .map((attendee) => attendee.attendee_id)
      .filter((id) => id !== null && id !== "" && id !== undefined && typeof id === "string");

    // 新たな紹介ずみ商品id配列に、元々の紹介ずみ商品配列の中で含まれていない商品idの数を取得し、削除が必要な数値をパラメータに渡す
    const attendees = new Set(attendeeIdsArray);
    const _deleteAttendeeCount = !!selectedRowDataMeeting.attendees_info?.length
      ? selectedRowDataMeeting.attendees_info.filter((attendee) => !attendees.has(attendee.attendee_id)).length
      : 0;

    // return console.log("リターン", resultProductsArrayExcludeNull);

    setLoadingGlobalState(true);

    // 部署名と事業所名を取得
    const departmentName =
      departmentDataArray &&
      memberObj.departmentId &&
      departmentDataArray.find((obj) => obj.id === memberObj.departmentId)?.department_name;
    const officeName =
      officeDataArray &&
      memberObj.officeId &&
      officeDataArray.find((obj) => obj.id === memberObj.officeId)?.office_name;
    // const departmentName =
    //   departmentDataArray &&
    //   departmentId &&
    //   departmentDataArray.find((obj) => obj.id === departmentId)?.department_name;
    // const officeName = officeDataArray && officeId && officeDataArray.find((obj) => obj.id === officeId)?.office_name;

    let newMeeting;
    try {
      // 更新するデータをオブジェクトにまとめる
      newMeeting = {
        id: selectedRowDataMeeting.meeting_id,
        created_by_company_id: selectedRowDataMeeting?.meeting_created_by_company_id
          ? selectedRowDataMeeting.meeting_created_by_company_id
          : null,
        // created_by_user_id: selectedRowDataMeeting?.meeting_created_by_user_id
        //   ? selectedRowDataMeeting?.meeting_created_by_user_id
        //   : null,
        // created_by_department_of_user: departmentId ? departmentId : null,
        // created_by_unit_of_user: unitId ? unitId : null,
        // created_by_office_of_user: officeId ? officeId : null,
        created_by_user_id: memberObj.memberId ? memberObj.memberId : null,
        created_by_department_of_user: memberObj.departmentId ? memberObj.departmentId : null,
        created_by_unit_of_user: memberObj.unitId ? memberObj.unitId : null,
        created_by_office_of_user: memberObj.officeId ? memberObj.officeId : null,
        client_contact_id: selectedRowDataMeeting.contact_id,
        client_company_id: selectedRowDataMeeting.company_id,
        meeting_type: meetingType ? meetingType : null,
        web_tool: webTool ? webTool : null,
        planned_date: plannedDate ? plannedDate.toISOString() : null,
        // planned_start_time: plannedStartTime === ":" ? null : plannedStartTime,
        planned_start_time: plannedStartTime === "" ? null : plannedStartTime,
        planned_purpose: plannedPurpose ? plannedPurpose : null,
        planned_duration: plannedDuration ? plannedDuration : null,
        planned_appoint_check_flag: plannedAppointCheckFlag,
        planned_product1: plannedProduct1 ? plannedProduct1 : null,
        planned_product2: plannedProduct2 ? plannedProduct2 : null,
        planned_comment: plannedComment ? plannedComment : null,
        result_date: resultDate ? resultDate.toISOString() : null,
        result_start_time: resultStartTime === "" ? null : resultStartTime,
        result_end_time: resultEndTime === "" ? null : resultEndTime,
        // result_start_time: resultStartTime === ":" ? null : resultStartTime,
        // result_end_time: resultEndTime === ":" ? null : resultEndTime,
        result_duration: resultDuration ? resultDuration : null,
        result_number_of_meeting_participants: resultNumberOfMeetingParticipants
          ? resultNumberOfMeetingParticipants
          : null,
        // result_presentation_product1: resultPresentationProduct1 ? resultPresentationProduct1 : null,
        // result_presentation_product2: resultPresentationProduct2 ? resultPresentationProduct2 : null,
        // result_presentation_product3: resultPresentationProduct3 ? resultPresentationProduct3 : null,
        // result_presentation_product4: resultPresentationProduct4 ? resultPresentationProduct4 : null,
        // result_presentation_product5: resultPresentationProduct5 ? resultPresentationProduct5 : null,
        // result_presentation_product1:
        //   resultProductsArrayExcludeNull.length >= 1 &&
        //   productIdToNameMap[resultProductsArrayExcludeNull[0]]?.inside_short_name
        //     ? productIdToNameMap[resultProductsArrayExcludeNull[0]]?.inside_short_name
        //     : (productIdToNameMap[resultProductsArrayExcludeNull[0]]?.product_name ?? "") +
        //       (productIdToNameMap[resultProductsArrayExcludeNull[0]]?.outside_short_name
        //         ? productIdToNameMap[resultProductsArrayExcludeNull[0]]?.outside_short_name
        //         : "")
        //     ? (productIdToNameMap[resultProductsArrayExcludeNull[0]]?.product_name ?? "") +
        //       (productIdToNameMap[resultProductsArrayExcludeNull[0]]?.outside_short_name
        //         ? productIdToNameMap[resultProductsArrayExcludeNull[0]]?.outside_short_name
        //         : "")
        //     : null,
        result_presentation_product1:
          resultProductObjArrayExcludeNull.length >= 1 &&
          resultProductObjArrayExcludeNull[0]?.introduced_inside_short_name
            ? resultProductObjArrayExcludeNull[0]?.introduced_inside_short_name
            : (resultProductObjArrayExcludeNull[0]?.introduced_product_name ?? "") +
              (resultProductObjArrayExcludeNull[0]?.introduced_outside_short_name
                ? resultProductObjArrayExcludeNull[0]?.introduced_outside_short_name
                : "")
            ? (resultProductObjArrayExcludeNull[0]?.introduced_product_name ?? "") +
              (resultProductObjArrayExcludeNull[0]?.introduced_outside_short_name
                ? resultProductObjArrayExcludeNull[0]?.introduced_outside_short_name
                : "")
            : null,
        result_presentation_product2:
          resultProductObjArrayExcludeNull.length >= 2 &&
          resultProductObjArrayExcludeNull[1]?.introduced_inside_short_name
            ? resultProductObjArrayExcludeNull[1]?.introduced_inside_short_name
            : (resultProductObjArrayExcludeNull[1]?.introduced_product_name ?? "") +
              (resultProductObjArrayExcludeNull[1]?.introduced_outside_short_name
                ? resultProductObjArrayExcludeNull[1]?.introduced_outside_short_name
                : "")
            ? (resultProductObjArrayExcludeNull[1]?.introduced_product_name ?? "") +
              (resultProductObjArrayExcludeNull[1]?.introduced_outside_short_name
                ? resultProductObjArrayExcludeNull[1]?.introduced_outside_short_name
                : "")
            : null,
        result_presentation_product3:
          resultProductObjArrayExcludeNull.length >= 3 &&
          resultProductObjArrayExcludeNull[2]?.introduced_inside_short_name
            ? resultProductObjArrayExcludeNull[2]?.introduced_inside_short_name
            : (resultProductObjArrayExcludeNull[2]?.introduced_product_name ?? "") +
              (resultProductObjArrayExcludeNull[2]?.introduced_outside_short_name
                ? resultProductObjArrayExcludeNull[2]?.introduced_outside_short_name
                : "")
            ? (resultProductObjArrayExcludeNull[2]?.introduced_product_name ?? "") +
              (resultProductObjArrayExcludeNull[2]?.introduced_outside_short_name
                ? resultProductObjArrayExcludeNull[2]?.introduced_outside_short_name
                : "")
            : null,
        result_presentation_product4:
          resultProductObjArrayExcludeNull.length >= 4 &&
          resultProductObjArrayExcludeNull[3]?.introduced_inside_short_name
            ? resultProductObjArrayExcludeNull[3]?.introduced_inside_short_name
            : (resultProductObjArrayExcludeNull[3]?.introduced_product_name ?? "") +
              (resultProductObjArrayExcludeNull[3]?.introduced_outside_short_name
                ? resultProductObjArrayExcludeNull[3]?.introduced_outside_short_name
                : "")
            ? (resultProductObjArrayExcludeNull[3]?.introduced_product_name ?? "") +
              (resultProductObjArrayExcludeNull[3]?.introduced_outside_short_name
                ? resultProductObjArrayExcludeNull[3]?.introduced_outside_short_name
                : "")
            : null,
        result_presentation_product5:
          resultProductObjArrayExcludeNull.length >= 5 &&
          resultProductObjArrayExcludeNull[4]?.introduced_inside_short_name
            ? resultProductObjArrayExcludeNull[4]?.introduced_inside_short_name
            : (resultProductObjArrayExcludeNull[4]?.introduced_product_name ?? "") +
              (resultProductObjArrayExcludeNull[4]?.introduced_outside_short_name
                ? resultProductObjArrayExcludeNull[4]?.introduced_outside_short_name
                : "")
            ? (resultProductObjArrayExcludeNull[4]?.introduced_product_name ?? "") +
              (resultProductObjArrayExcludeNull[4]?.introduced_outside_short_name
                ? resultProductObjArrayExcludeNull[4]?.introduced_outside_short_name
                : "")
            : null,
        result_category: !!resultCategory ? resultCategory : null,
        result_summary: resultSummary ? resultSummary : null,
        result_negotiate_decision_maker: resultNegotiateDecisionMaker ? resultNegotiateDecisionMaker : null,
        result_top_position_class: resultTopPositionClass ? parseInt(resultTopPositionClass, 10) : null,
        pre_meeting_participation_request: preMeetingParticipationRequest ? preMeetingParticipationRequest : null,
        meeting_participation_request: meetingParticipationRequest ? meetingParticipationRequest : null,
        meeting_department: departmentName ? departmentName : null,
        meeting_business_office: officeName ? officeName : null,
        // meeting_member_name:  meetingMemberName
        //   ? meetingMemberName
        //   : null,
        meeting_member_name: memberObj?.memberName ? memberObj?.memberName : null,
        meeting_year_month: meetingYearMonth ? meetingYearMonth : null,
        product_ids: resultProductsArrayExcludeNull,
        attendee_ids: attendeeIdsArray,
        delete_product_count: _deleteProductCount,
        delete_attendee_count: _deleteAttendeeCount,
      };
    } catch (e: any) {
      console.error("エラー", e);
      setLoadingGlobalState(false);
      toast.error("エラーが発生しました🙇‍♀️ サポートにご報告の上しばらく経ってからやり直してください。");
    }

    if (!newMeeting)
      return toast.error("エラーが発生しました🙇‍♀️ サポートにご報告の上しばらく経ってからやり直してください。");

    console.log("面談予定 新規作成 newMeeting", newMeeting);
    console.log("productIdToNameMap", productIdToNameMap);
    console.log("attendeeIdsArray", attendeeIdsArray);
    console.log("attendeeIdsArray", resultPresentationProductsArray);
    console.log(
      "productIdToNameMap[resultProductsArrayExcludeNull[0]]",
      productIdToNameMap[resultProductsArrayExcludeNull[0]]
    );
    // console.log("面談予定 新規作成 newMeeting.planned_start_time", newMeeting.planned_start_time);
    console.log(
      "面談予定 新規作成 newMeeting.planned_start_time 一致するか",
      newMeeting.planned_start_time === "08:30"
    );

    // setLoadingGlobalState(false);
    // return;
    // supabaseにINSERT,ローディング終了, モーダルを閉じる
    updateMeetingMutation.mutate(newMeeting);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewMeetingModal(false);
  };

  // 全角文字を半角に変換する関数
  // const toHalfWidth = (strVal: string) => {
  //   // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
  //   return strVal.replace(/[！-～]/g, (match) => {
  //     return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
  //   });
  //   // .replace(/　/g, " "); // 全角スペースを半角スペースに
  // };
  // const toHalfWidthAndSpace = (strVal: string) => {
  //   // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
  //   return strVal
  //     .replace(/[！-～]/g, (match) => {
  //       return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
  //     })
  //     .replace(/　/g, " "); // 全角スペースを半角スペースに
  // };

  // 昭和や平成、令和の元号を西暦に変換する
  // const convertJapaneseEraToWesternYear = (value: string) => {
  //   const eraPatterns = [
  //     { era: "昭和", startYear: 1925 },
  //     { era: "平成", startYear: 1988 },
  //     { era: "令和", startYear: 2018 },
  //   ];

  //   for (let pattern of eraPatterns) {
  //     if (value.includes(pattern.era)) {
  //       const year = parseInt(value.replace(pattern.era, ""), 10);
  //       if (!isNaN(year)) {
  //         return pattern.startYear + year;
  //       }
  //     }
  //   }
  //   return value;
  // };

  type Era = "昭和" | "平成" | "令和";
  const eras = {
    昭和: 1925, // 昭和の開始年 - 1
    平成: 1988, // 平成の開始年 - 1
    令和: 2018, // 令和の開始年 - 1
  };
  // 昭和や平成、令和の元号を西暦に変換する 例："平成4年12月" を "1992年12月" に変換
  function matchEraToYear(value: string): string {
    const pattern = /(?<era>昭和|平成|令和)(?<year>\d+)(?:年)?(?<month>\d+)?/;
    const match = pattern.exec(value);

    if (!match) return value; // 元号の形式でなければ元の文字列をそのまま返す

    const era: Era = match.groups?.era as Era;
    const year = eras[era] + parseInt(match.groups?.year || "0", 10);
    const month = match.groups?.month ? `${match.groups?.month}月` : "";

    return `${year}年${month}`;
  }

  // 全角を半角に変換する関数
  function zenkakuToHankaku(str: string) {
    const zen = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
    const han = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

    for (let i = 0; i < zen.length; i++) {
      const regex = new RegExp(zen[i], "g");
      str = str.replace(regex, han[i]);
    }

    return str;
  }

  // 資本金 100万円の場合は100、18億9,190万円は189190、12,500,000円は1250、のように変換する方法
  function convertToNumber(inputString: string) {
    // 全角数字を半角に変換
    inputString = zenkakuToHankaku(inputString);

    // 「億」「万」「円」がすべて含まれていなければ変換をスキップ
    if (
      !inputString.includes("億") &&
      !inputString.includes("万") &&
      !inputString.includes("円") &&
      !inputString.includes(",")
    ) {
      return inputString;
    }

    // 億、万、円で分けてそれぞれの数値を取得
    const billion = (inputString.includes("億") ? parseInt(inputString.split("億")[0].replace(/,/g, ""), 10) : 0) || 0;
    const million =
      (inputString.includes("万") && !inputString.includes("億")
        ? parseInt(inputString.split("万")[0].replace(/,/g, ""), 10)
        : inputString.includes("億") && inputString.includes("万")
        ? parseInt(inputString.split("億")[1].split("万")[0].replace(/,/g, ""), 10)
        : 0) || 0;
    const thousand =
      (!inputString.includes("万") && !inputString.includes("億")
        ? Math.floor(parseInt(inputString.replace(/,/g, "").replace("円", ""), 10) / 10000)
        : 0) || 0;

    // 最終的な数値を計算
    const total = billion * 10000 + million + thousand;

    return total;
  }

  const hours = Array.from({ length: 24 }, (_, index) => (index < 10 ? "0" + index : "" + index));
  const minutes5 = Array.from({ length: 12 }, (_, index) => (index * 5 < 10 ? "0" + index * 5 : "" + index * 5));
  const minutes = Array.from({ length: 60 }, (_, i) => (i < 10 ? "0" + i : "" + i));

  // ================================ ツールチップ ================================
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    content3?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
    whiteSpace?: "normal" | "pre" | "nowrap" | "pre-wrap" | "pre-line" | "break-spaces" | undefined;
  };
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  // const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    content3,
    marginTop,
    itemsPosition = "center",
    whiteSpace,
  }: TooltipParams) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text2 as string)
    //   : "";
    // const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
    //   ? ((e.target as HTMLDivElement).dataset.text3 as string)
    //   : "";
    setHoveredItemPosModal({
      x: x - containerLeft,
      y: y - containerTop,
      itemWidth: width,
      itemHeight: height,
      content: content,
      content2: content2,
      content3: content3,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
      whiteSpace: whiteSpace,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    setHoveredItemPosModal(null);
  };
  // ============================================================================================

  console.log(
    "面談予定作成モーダル ",
    "✅selectedRowDataMeeting",
    selectedRowDataMeeting,
    "plannedStartTime",
    plannedStartTime,
    "面談時間 result_duration",
    resultDuration,
    "plannedProduct1",
    plannedProduct1,
    "plannedProduct2",
    plannedProduct2,
    "resultPresentationProductsArray",
    resultPresentationProductsArray,
    "resultProductRows",
    resultProductRows,
    "overstate",
    overstate,
    "isOpenDropdownMenuFilterProductsArray",
    isOpenDropdownMenuFilterProductsArray,
    "productDataArray",
    productDataArray,
    "productIdToNameMap",
    productIdToNameMap,
    "plannedProduct1QueryObj",
    plannedProduct1QueryObj,
    "plannedProduct2QueryObj",
    plannedProduct2QueryObj,
    "selectedAttendeesArray",
    selectedAttendeesArray,
    "✅実施商品リストresultPresentationProductsArray",
    resultPresentationProductsArray,
    "✅同席者リストselectedAttendeesArray",
    selectedAttendeesArray
  );

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {/* {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )} */}
      <div className={`${styles.container} fade03`} ref={modalContainerRef}>
        {/* ツールチップ */}
        {hoveredItemPosModal && <TooltipModal />}
        {/* ローディングオーバーレイ */}
        {loadingGlobalState && (
          <div className={`${styles.loading_overlay_modal} `}>
            {/* <SpinnerIDS scale={"scale-[0.5]"} /> */}
            <SpinnerComet w="48px" h="48px" />
            {/* <SpinnerX w="w-[42px]" h="h-[42px]" /> */}
          </div>
        )}
        {/* 製品リスト編集ドロップダウンメニュー オーバーレイ */}
        {isOpenDropdownMenuFilterProducts && (
          <div
            className="fixed left-[-100vw] top-[-50%] z-[10] h-[200vh] w-[300vw] bg-[#00000000]"
            onClick={() => {
              setIsOpenDropdownMenuFilterProducts(false);
            }}
          ></div>
        )}
        {isOpenDropdownMenuFilterProductsArray.includes(true) && (
          <div
            className="fixed left-[-100vw] top-[-50%] z-[10] h-[200vh] w-[300vw] bg-[#00000000]"
            onClick={() => {
              // 配列のtrueを全てfalseにリセット
              const resetArray = Array.from({ length: isOpenDropdownMenuFilterProductsArray.length }, () => false);
              setIsOpenDropdownMenuFilterProductsArray(resetArray);
            }}
          ></div>
        )}
        {/* 保存・タイトル・キャンセルエリア */}
        <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[20px] text-center text-[18px]">
          {/* <div
            className="min-w-[150px] cursor-pointer select-none text-start font-semibold hover:text-[#aaa]"
            onClick={handleCancelAndReset}
          >
            キャンセル
          </div> */}
          <div className="relative min-w-[150px] text-start font-semibold">
            <div
              className="flex max-w-max cursor-pointer select-none items-center hover:text-[#aaa]"
              onClick={handleCancelAndReset}
            >
              <div className="h-full min-w-[20px]"></div>
              <BsChevronLeft className="z-1 absolute  left-[-15px] top-[50%] translate-y-[-50%] text-[24px]" />
              <span>戻る</span>
            </div>
          </div>
          <div className="min-w-[150px] select-none font-bold">面談 結果入力/編集</div>

          <div
            className={`min-w-[150px] cursor-pointer text-end font-bold text-[var(--color-text-brand-f)] hover:text-[var(--color-text-brand-f-hover)] ${styles.save_text} select-none`}
            onClick={handleSaveAndClose}
          >
            保存
          </div>
        </div>

        <div className="min-h-[2px] w-full bg-[var(--color-bg-brand-f)]"></div>

        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* 予定 */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.section_title}`}>予定</span>

                  {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                    </span> */}
                </div>
                <div className={`${styles.section_underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}
          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* ●面談日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談日</span>
                    <DatePickerCustomInput
                      startDate={plannedDate}
                      setStartDate={setPlannedDate}
                      fontSize="text-[15px]"
                      placeholderText="placeholder:text-[15px]"
                      py="py-[6px]"
                      minHeight="min-h-[32px]"
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* ●面談タイプ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談タイプ</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={meetingType}
                      onChange={(e) => {
                        setMeetingType(e.target.value);
                      }}
                    >
                      {/* <option value=""></option> */}
                      <option value="訪問">訪問</option>
                      <option value="WEB">WEB</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 面談開始 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談開始</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="時"
                      value={plannedStartTimeHour}
                      onChange={(e) => setPlannedStartTimeHour(e.target.value === "" ? "" : e.target.value)}
                    >
                      <option value=""></option>
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">時</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="分"
                      value={plannedStartTimeMinute}
                      onChange={(e) => setPlannedStartTimeMinute(e.target.value === "" ? "" : e.target.value)}
                    >
                      <option value=""></option>
                      {minutes5.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <span className="mx-[10px]">分</span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* WEBツール */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>WEBツール</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={webTool}
                      onChange={(e) => {
                        setWebTool(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="Zoom">Zoom</option>
                      <option value="Teams">Teams</option>
                      <option value="Google Meet">Google Meet</option>
                      <option value="Webex">Webex</option>
                      <option value="Skype">Skype</option>
                      <option value="bellFace">bellFace</option>
                      <option value="その他">その他</option>
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 同席依頼 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>事前同席依頼</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={preMeetingParticipationRequest}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("活動タイプを選択してください");
                        setPreMeetingParticipationRequest(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      <option value="同席依頼無し">同席依頼無し</option>
                      <option value="同席依頼済み">同席依頼済み</option>
                      {/* <option value="同席依頼済み 同席OK">同席依頼済み 同席OK</option>
                      <option value="同席依頼済み 同席NG">同席依頼済み 同席NG</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 面談時間(分) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] !text-[16px]`}>予定_面談時間(分)</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={plannedDuration === null ? "" : plannedDuration}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setPlannedDuration(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setPlannedDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setPlannedDuration(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {plannedDuration !== null && plannedDuration !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setPlannedDuration(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* ●面談目的 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●面談目的</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={plannedPurpose}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("面談目的を選択してください");
                        setPlannedPurpose(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsPlannedPurpose.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      {/* <option value="新規会社(過去面談無し)/能動">新規会社(過去面談無し)/能動</option>
                      <option value="被り会社(過去面談有り)/能動">被り会社(過去面談有り)/能動</option>
                      <option value="社内ID/能動">社内ID/能動</option>
                      <option value="社外･客先ID/能動">社外･客先ID/能動</option>
                      <option value="営業メール/受動">営業メール/能動</option>
                      <option value="見･聞引合/受動">見･聞引合/受動</option>
                      <option value="DM/受動">DM/受動</option>
                      <option value="メール/受動">メール/受動</option>
                      <option value="ホームページ/受動">ホームページ/受動</option>
                      <option value="展示会/受動">展示会/受動</option>
                      <option value="他(売前ﾌｫﾛｰ)">他(売前ﾌｫﾛｰ)</option>
                      <option value="他(納品説明)">他(納品説明)</option>
                      <option value="他(客先要望サポート)">他(客先要望サポート)</option>
                      <option value="その他">その他</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* アポ有 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} ${styles.check_title} !min-w-[140px]`}>アポ有</span>
                    <div className={`${styles.grid_select_cell_header}`}>
                      <input
                        type="checkbox"
                        className={`${styles.grid_select_cell_header_input}`}
                        checked={plannedAppointCheckFlag}
                        onChange={() => setPlannedAppointCheckFlag(!plannedAppointCheckFlag)}
                      />
                      <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>
            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 紹介予定商品メイン */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>紹介商品ﾒｲﾝ</span> */}
                    <div
                      className={`${
                        styles.title
                      } relative z-[100] !min-w-[140px] cursor-pointer items-center hover:text-[var(--color-text-brand-f)] ${
                        isOpenDropdownMenuFilterProducts ? `!text-[var(--color-text-brand-f)]` : ``
                      }`}
                      onMouseEnter={(e) => {
                        if (isOpenDropdownMenuFilterProducts) return;
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "選択する商品を全て、事業部、係・チーム、事業所ごとに",
                          content2: "フィルターの切り替えが可能です。",
                          // marginTop: 57,
                          // marginTop: 38,
                          marginTop: 12,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        });
                      }}
                      onMouseLeave={() => {
                        if (!isOpenDropdownMenuFilterProducts || hoveredItemPosModal) handleCloseTooltip();
                      }}
                      onClick={(e) => {
                        // 事業部、係、事業所をフィルターするか しない場合3つをnullにして全て取得する
                        if (isOpenDropdownMenuFilterProducts) return;
                        const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
                        const clickedPositionPlusItemHeight = y + 400 + 5; // 400はメニューの最低高さ 5はmargin
                        const clickedPositionMinusItemHeight = y - 400 + height - 25; // 400はメニューの最低高さ
                        const modalHeight = modalProperties?.height ?? window.innerHeight * 0.9;
                        const halfBlankSpaceWithoutModal = (window.innerHeight - modalHeight) / 2;
                        const modalBottomPosition =
                          modalProperties?.bottom ?? window.innerHeight - halfBlankSpaceWithoutModal;
                        const modalTopPosition = modalProperties?.top ?? halfBlankSpaceWithoutModal;
                        if (
                          modalBottomPosition < clickedPositionPlusItemHeight &&
                          modalTopPosition < clickedPositionMinusItemHeight
                        ) {
                          console.log("アップ");
                          setClickedItemPosition({ displayPos: "up", clickedItemWidth: width });
                        } else if (
                          modalTopPosition > clickedPositionMinusItemHeight &&
                          modalBottomPosition < clickedPositionPlusItemHeight
                        ) {
                          console.log("センター");
                          setClickedItemPosition({ displayPos: "center", clickedItemWidth: width });
                        } else {
                          console.log("ダウン");
                          setClickedItemPosition({ displayPos: "down", clickedItemWidth: width });
                        }

                        setIsOpenDropdownMenuFilterProducts(true);
                        handleCloseTooltip();
                      }}
                    >
                      <div className={`mr-[15px] flex flex-col text-[15px]`}>
                        <span>紹介予定</span>
                        <span>商品メイン</span>
                      </div>
                      <NextImage
                        width={24}
                        height={24}
                        src={`/assets/images/icons/business/icons8-process-94.png`}
                        alt="setting"
                      />
                      {/* メンバーデータ編集ドロップダウンメニュー */}
                      {isOpenDropdownMenuFilterProducts && (
                        <DropDownMenuFilterProducts
                          setIsOpenDropdownMenu={setIsOpenDropdownMenuFilterProducts}
                          clickedItemPosition={clickedItemPosition}
                          filterCondition={filterCondition}
                          setFilterCondition={setFilterCondition}
                          // setIsLoadingUpsertMember={setIsLoadingUpsertMember}
                        />
                      )}
                      {/* メンバーデータ編集ドロップダウンメニューここまで */}
                    </div>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={plannedProduct1 ? plannedProduct1 : ""}
                      onChange={(e) => setPlannedProduct1(e.target.value)}
                    >
                      {!plannedProduct1 && <option value=""></option>}
                      {/* 選択中が他でない場合は選択中の商品を一番上に表示 */}
                      {plannedProduct1 && process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID !== plannedProduct1 && (
                        <option value={plannedProduct1}>
                          {productIdToNameMap[plannedProduct1]?.inside_short_name
                            ? productIdToNameMap[plannedProduct1]?.inside_short_name
                            : productIdToNameMap[plannedProduct1]?.product_name +
                              " " +
                              productIdToNameMap[plannedProduct1]?.outside_short_name}
                        </option>
                      )}

                      {/* 選択中が他の場合は他を一番上に表示 */}
                      {plannedProduct1 &&
                        process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID &&
                        process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID === plannedProduct1 && (
                          <option value={`${process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID}`}>他</option>
                        )}

                      {productDataArray &&
                        productDataArray.length >= 1 &&
                        productDataArray.map((product) => {
                          // 現在選択しているidは除外する
                          if (product.id === plannedProduct1) return;
                          return (
                            <option key={product.id} value={product.id}>
                              {product?.inside_short_name && product.inside_short_name}
                              {!product?.inside_short_name && product.product_name + " " + product.outside_short_name}
                            </option>
                          );
                        })}

                      {((plannedProduct1 && process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID !== plannedProduct1) ||
                        !plannedProduct1) && (
                        <option value={process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID}>他</option>
                      )}
                      {/* 選択中の場合は空欄は一番下に表示 */}
                      {plannedProduct1 && <option value=""></option>}
                    </select>
                    {/* <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={plannedProduct1}
                      onChange={(e) => setPlannedProduct1(e.target.value)}
                      onBlur={() => setPlannedProduct1(toHalfWidth(plannedProduct1.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 紹介予定サブ */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>紹介予定サブ</span> */}
                    <div className={`${styles.title} !min-w-[140px]`}>
                      <div className={`mr-[15px] flex flex-col text-[15px]`}>
                        <span>紹介予定</span>
                        <span>商品サブ</span>
                      </div>
                    </div>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={plannedProduct2 ? plannedProduct2 : ""}
                      onChange={(e) => setPlannedProduct2(e.target.value)}
                    >
                      {/* <option value=""></option> */}
                      {!plannedProduct2 && <option value=""></option>}
                      {/* 選択中が他でない場合は選択中の商品を一番上に表示 */}
                      {plannedProduct2 && process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID !== plannedProduct2 && (
                        <option value={plannedProduct2}>
                          {productIdToNameMap[plannedProduct2]?.inside_short_name
                            ? productIdToNameMap[plannedProduct2]?.inside_short_name
                            : productIdToNameMap[plannedProduct2]?.product_name +
                              " " +
                              productIdToNameMap[plannedProduct2]?.outside_short_name}
                        </option>
                      )}

                      {/* 選択中が他の場合は他を一番上に表示 */}
                      {plannedProduct2 &&
                        process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID &&
                        process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID === plannedProduct2 && (
                          <option value={`${process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID}`}>他</option>
                        )}

                      {productDataArray &&
                        productDataArray.length >= 1 &&
                        productDataArray.map((product) => {
                          // 現在選択しているidは除外する
                          if (product.id === plannedProduct2) return;
                          return (
                            <option key={product.id} value={product.id}>
                              {product?.inside_short_name && product.inside_short_name}
                              {!product?.inside_short_name && product.product_name + " " + product.outside_short_name}
                            </option>
                          );
                        })}

                      {((plannedProduct2 && process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID !== plannedProduct2) ||
                        !plannedProduct2) && (
                        <option value={process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID}>他</option>
                      )}
                      {/* 選択中の場合は空欄は一番下に表示 */}
                      {plannedProduct2 && <option value=""></option>}
                    </select>
                    {/* <input
                      type="text"
                      placeholder=""
                      required
                      className={`${styles.input_box}`}
                      value={plannedProduct2}
                      onChange={(e) => setPlannedProduct2(e.target.value)}
                      onBlur={() => setPlannedProduct2(toHalfWidth(plannedProduct2.trim()))}
                    /> */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>
            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 事前コメント */}
            <div className={`${styles.row_area} ${styles.text_area_xl} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} !min-w-[140px]`}>事前コメント</span>
                  <textarea
                    cols={30}
                    rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={plannedComment}
                    onChange={(e) => setPlannedComment(e.target.value)}
                  ></textarea>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 事業部名 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>事業部名</span>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // value={departmentId ? departmentId : ""}
                      // onChange={(e) => setDepartmentId(e.target.value)}
                      // onChange={(e) => setMemberObj({ ...memberObj, departmentId: e.target.value })}
                      value={memberObj.departmentId ? memberObj.departmentId : ""}
                      onChange={(e) => {
                        setMemberObj({ ...memberObj, departmentId: e.target.value });
                        setIsOpenConfirmationModal("change_member");
                      }}
                    >
                      <option value=""></option>
                      {departmentDataArray &&
                        departmentDataArray.length >= 1 &&
                        departmentDataArray.map((department) => (
                          <option key={department.id} value={department.id}>
                            {department.department_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 係・チーム */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} `}>係・チーム</span>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // value={unitId ? unitId : ""}
                      // onChange={(e) => setUnitId(e.target.value)}
                      // onChange={(e) => setMemberObj({ ...memberObj, unitId: e.target.value })}
                      value={memberObj.unitId ? memberObj.unitId : ""}
                      onChange={(e) => {
                        setMemberObj({ ...memberObj, unitId: e.target.value });
                        setIsOpenConfirmationModal("change_member");
                      }}
                    >
                      <option value=""></option>
                      {unitDataArray &&
                        unitDataArray.length >= 1 &&
                        unitDataArray.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.unit_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>

            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 所属事業所 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>所属事業所</span>
                    <select
                      className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                      // value={officeId ? officeId : ""}
                      // onChange={(e) => setOfficeId(e.target.value)}
                      // onChange={(e) => setMemberObj({ ...memberObj, officeId: e.target.value })}
                      value={memberObj.officeId ? memberObj.officeId : ""}
                      onChange={(e) => {
                        setMemberObj({ ...memberObj, officeId: e.target.value });
                        setIsOpenConfirmationModal("change_member");
                      }}
                    >
                      <option value=""></option>
                      {officeDataArray &&
                        officeDataArray.length >= 1 &&
                        officeDataArray.map((office) => (
                          <option key={office.id} value={office.id}>
                            {office.office_name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* ●自社担当 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] ${styles.required_title}`}>●自社担当</span>
                    <input
                      type="text"
                      placeholder="*入力必須"
                      required
                      className={`${styles.input_box}`}
                      // value={meetingMemberName}
                      // setMeetingMemberName(e.target.value);
                      value={memberObj.memberName ? memberObj.memberName : ""}
                      onChange={(e) => {
                        setMemberObj({ ...memberObj, memberName: e.target.value });
                      }}
                      onKeyUp={() => {
                        if (prevMemberObj.memberName !== memberObj.memberName) {
                          // alert("自社担当名が元のデータと異なります。データの所有者を変更しますか？");
                          // setMeetingMemberName(selectedRowDataMeeting.meeting_member_name);
                          setIsOpenConfirmationModal("change_member");
                          return;
                        }
                      }}
                      onBlur={() => {
                        if (!memberObj.memberName) return;
                        // setMeetingMemberName(toHalfWidthAndSpace(meetingMemberName.trim()));
                        setMemberObj({ ...memberObj, memberName: toHalfWidthAndSpace(memberObj.memberName.trim()) });
                      }}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>

          {/* --------- 横幅全体ラッパーここまで --------- */}
          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* ==================================== 結果エリア ==================================== */}
            <div className={`${styles.row_area} flex w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center `}>
                  <span className={`${styles.section_title}`}>結果</span>

                  {/* <span className={`${styles.value} ${styles.value_highlight}`}>
                      {selectedRowDataMeeting?.company_name ? selectedRowDataMeeting?.company_name : ""}
                    </span> */}
                </div>
                <div className={`${styles.section_underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* ●面談日 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>●面談日</span>
                    <DatePickerCustomInput
                      startDate={resultDate}
                      setStartDate={setResultDate}
                      fontSize="text-[15px]"
                      placeholderText="placeholder:text-[15px]"
                      py="py-[6px]"
                      minHeight="min-h-[32px]"
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* ●面談年月度(結果で修正) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px] ${styles.required_title}${styles.required_title}`}>
                      ●面談年月度
                    </span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title}  ${styles.required_title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) =>
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          // content: "面談日(結果)を選択することで自動的に面談年月度は計算されます。",
                          content: "面談年月度は決算日の翌日(期首)から1ヶ月間を財務サイクルとして計算しています。",
                          content2: !!fiscalEndMonthObjRef.current
                            ? `面談日を選択することで面談年月度は自動計算されるため入力は不要です。`
                            : `決算日が未設定の場合は、デフォルトで3月31日が決算日として設定されます。`,
                          // content3: "決算月が未設定の場合は、デフォルトで3月31日が決算月日として設定されます。",
                          content3:
                            "決算日の変更はダッシュボード右上のアカウント設定の「会社・チーム」から変更可能です。",
                          marginTop: 57,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        })
                      }
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[6px]`}>●面談年月度</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box} pointer-events-none`}
                      // placeholder='"202109" や "202312" などを入力'
                      placeholder="面談日(結果)を選択してください。"
                      value={meetingYearMonth === null ? "" : meetingYearMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setMeetingYearMonth(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setMeetingYearMonth(0);
                          } else {
                            setMeetingYearMonth(numValue);
                          }
                        }
                      }}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 面談開始 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談開始</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="時"
                      value={resultStartTimeHour}
                      onChange={(e) => setResultStartTimeHour(e.target.value === "" ? "" : e.target.value)}
                    >
                      <option value=""></option>
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">時</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="分"
                      value={resultStartTimeMinute}
                      onChange={(e) => setResultStartTimeMinute(e.target.value === "" ? "" : e.target.value)}
                    >
                      <option value=""></option>
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <span className="mx-[10px]">分</span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 面談終了 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談終了</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="時"
                      value={resultEndTimeHour}
                      onChange={(e) => setResultEndTimeHour(e.target.value === "" ? "" : e.target.value)}
                    >
                      <option value=""></option>
                      {hours.map((hour) => (
                        <option key={hour} value={hour}>
                          {hour}
                        </option>
                      ))}
                    </select>

                    <span className="mx-[10px]">時</span>

                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      placeholder="分"
                      value={resultEndTimeMinute}
                      onChange={(e) => setResultEndTimeMinute(e.target.value === "" ? "" : e.target.value)}
                    >
                      <option value=""></option>
                      {minutes.map((minute) => (
                        <option key={minute} value={minute}>
                          {minute}
                        </option>
                      ))}
                    </select>
                    <span className="mx-[10px]">分</span>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 面談人数 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談人数</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box}`}
                      placeholder=""
                      value={resultNumberOfMeetingParticipants === null ? "" : resultNumberOfMeetingParticipants}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setResultNumberOfMeetingParticipants(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setResultNumberOfMeetingParticipants(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setResultNumberOfMeetingParticipants(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {resultNumberOfMeetingParticipants !== null && resultNumberOfMeetingParticipants !== 0 && (
                      <div
                        className={`${styles.close_btn_number}`}
                        onClick={() => setResultNumberOfMeetingParticipants(null)}
                      >
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>

            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 面談時間(分) */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談時間(分)</span>
                    <input
                      type="number"
                      min="0"
                      className={`${styles.input_box} pointer-events-none`}
                      placeholder=""
                      value={resultDuration === null ? "" : resultDuration}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "") {
                          setResultDuration(null);
                        } else {
                          const numValue = Number(val);

                          // 入力値がマイナスかチェック
                          if (numValue < 0) {
                            setResultDuration(0); // ここで0に設定しているが、必要に応じて他の正の値に変更することもできる
                          } else {
                            setResultDuration(numValue);
                          }
                        }
                      }}
                    />
                    {/* バツボタン */}
                    {resultDuration !== null && resultDuration !== 0 && (
                      <div className={`${styles.close_btn_number}`} onClick={() => setResultDuration(null)}>
                        <MdClose className="text-[20px] " />
                      </div>
                    )}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 右ラッパーここまで */}
            </div>
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* ------------------ 実施商品Rowsエリア ------------------ */}
          {/* 実施商品Rowsエリア 「実施商品を追加」クリックで行を１行増やし、selectタグを2つずつ増やす */}
          {resultProductRows &&
            resultProductRows.map((_, index) => (
              <div key={index} className={`${styles.full_contents_wrapper} flex w-full`}>
                {/* --------- 左ラッパー --------- */}
                <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
                  {/* 実施商品1 */}
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        {/* <span className={`${styles.title} !min-w-[140px]`}>実施商品1</span> */}
                        <div
                          className={`${styles.title} relative z-[100] !min-w-[140px] cursor-pointer items-center ${
                            isOpenDropdownMenuFilterProducts ? `` : `hover:text-[var(--color-text-brand-f)]`
                          }`}
                          onMouseEnter={(e) => {
                            if (isOpenDropdownMenuFilterProductsArray.includes(true)) return;
                            handleOpenTooltip({
                              e: e,
                              display: "top",
                              content: "選択する商品を全て、事業部、係・チーム、事業所ごとに",
                              content2: "フィルターの切り替えが可能です。",
                              // marginTop: 57,
                              marginTop: 38,
                              // marginTop: 12,
                              itemsPosition: "center",
                              whiteSpace: "nowrap",
                            });
                          }}
                          onMouseLeave={() => {
                            if (!isOpenDropdownMenuFilterProductsArray.includes(true) || hoveredItemPosModal)
                              handleCloseTooltip();
                          }}
                          onClick={(e) => {
                            // 事業部、係、事業所をフィルターするか しない場合3つをnullにして全て取得する
                            if (isOpenDropdownMenuFilterProductsArray.includes(true)) return;
                            const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
                            const clickedPositionPlusItemHeight = y + 400 + 5; // 400はメニューの最低高さ 5はmargin
                            const clickedPositionMinusItemHeight = y - 400 + height - 25; // 400はメニューの最低高さ
                            const modalHeight = modalProperties?.height ?? window.innerHeight * 0.9;
                            const halfBlankSpaceWithoutModal = (window.innerHeight - modalHeight) / 2;
                            const modalBottomPosition =
                              modalProperties?.bottom ?? window.innerHeight - halfBlankSpaceWithoutModal;
                            const modalTopPosition = modalProperties?.top ?? halfBlankSpaceWithoutModal;
                            if (
                              modalBottomPosition < clickedPositionPlusItemHeight &&
                              modalTopPosition < clickedPositionMinusItemHeight
                            ) {
                              console.log("アップ");
                              setClickedItemPosition({ displayPos: "up", clickedItemWidth: width });
                            } else if (
                              modalTopPosition > clickedPositionMinusItemHeight &&
                              modalBottomPosition < clickedPositionPlusItemHeight
                            ) {
                              console.log("センター");
                              setClickedItemPosition({ displayPos: "center", clickedItemWidth: width });
                            } else {
                              console.log("ダウン");
                              setClickedItemPosition({ displayPos: "down", clickedItemWidth: width });
                            }

                            // setIsOpenDropdownMenuFilterProducts(true);
                            // isOpenDropdownMenuFilterProductsArray[index >= 1 ? index * 2 : index]
                            const newArray = [...isOpenDropdownMenuFilterProductsArray];
                            newArray[index >= 1 ? index * 2 : index] = true;
                            setIsOpenDropdownMenuFilterProductsArray(newArray);
                            handleCloseTooltip();
                          }}
                        >
                          <span className={`mr-[15px] flex flex-col`}>
                            実施商品{index >= 1 ? index * 2 + 1 : index + 1}
                          </span>
                          <NextImage
                            width={24}
                            height={24}
                            src={`/assets/images/icons/business/icons8-process-94.png`}
                            alt="setting"
                          />
                          {/* メンバーデータ編集ドロップダウンメニュー */}
                          {isOpenDropdownMenuFilterProductsArray[index >= 1 ? index * 2 : index] && (
                            <DropDownMenuFilterProducts
                              clickedItemPosition={clickedItemPosition}
                              filterCondition={filterCondition}
                              setFilterCondition={setFilterCondition}
                              isMultiple={true}
                              arrayIndex={index >= 1 ? index * 2 : index}
                              isOpenDropdownMenuArray={isOpenDropdownMenuFilterProductsArray}
                              setIsOpenDropdownMenuArray={setIsOpenDropdownMenuFilterProductsArray}
                              // setIsLoadingUpsertMember={setIsLoadingUpsertMember}
                            />
                          )}
                          {/* メンバーデータ編集ドロップダウンメニューここまで */}
                        </div>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                          // value={plannedProduct1 ? plannedProduct1 : ""}
                          // onChange={(e) => setPlannedProduct1(e.target.value)}
                          // value={
                          //   resultPresentationProductsArray &&
                          //   !!resultPresentationProductsArray[index >= 1 ? index * 2 : index]
                          //     ? (resultPresentationProductsArray[index >= 1 ? index * 2 : index] as string)
                          //     : ""
                          // }
                          value={
                            resultPresentationProductsArray &&
                            !!resultPresentationProductsArray[index >= 1 ? index * 2 : index]?.introduced_product_id
                              ? resultPresentationProductsArray[index >= 1 ? index * 2 : index]?.introduced_product_id
                              : ""
                          }
                          // onChange={(e) => handleChangeSelectProductId(index, e)}
                          // onChange={(e) => handleChangeSelectProductId(index >= 1 ? index * 2 : index, e)}
                          onChange={(e) => {
                            const newResultPresentationProducts = [...resultPresentationProductsArray];
                            // 他を格納
                            if (e.target.value === process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID) {
                              const newOtherObj = {
                                introduced_product_id: e.target.value,
                                introduced_product_name: "他",
                                introduced_outside_short_name: null,
                                introduced_inside_short_name: null,
                                introduced_unit_price: null,
                                introduced_product_priority: null,
                              };
                              newResultPresentationProducts[index >= 1 ? index * 2 : index] = newOtherObj;
                            }
                            // nullを格納
                            else if (e.target.value === "") {
                              newResultPresentationProducts[index >= 1 ? index * 2 : index] = null;
                            }
                            // 該当の商品オブジェクトを格納
                            else {
                              const findProductObj = productDataArray?.find((obj) => obj.id === e.target.value);
                              if (!findProductObj) return;
                              const newProductObj = {
                                introduced_product_id: findProductObj.id,
                                introduced_product_name: findProductObj.product_name,
                                introduced_outside_short_name: findProductObj.outside_short_name,
                                introduced_inside_short_name: findProductObj.inside_short_name,
                                introduced_unit_price: findProductObj.unit_price,
                                introduced_product_priority: null,
                              };
                              newResultPresentationProducts[index >= 1 ? index * 2 : index] = newProductObj;
                            }
                            setResultPresentationProductsArray(newResultPresentationProducts);
                          }}
                        >
                          {/* {(!resultPresentationProductsArray ||
                            !resultPresentationProductsArray[index >= 1 ? index * 2 : index]) && (
                            <option value=""></option>
                          )} */}
                          {(!resultPresentationProductsArray ||
                            !resultPresentationProductsArray[index >= 1 ? index * 2 : index]
                              ?.introduced_product_id) && <option value=""></option>}
                          {/* 商品選択後にuseQueryの条件を変更して商品リストが変更された場合も選択中の商品のidと名前が同じoptionタグに切り替える */}
                          {resultPresentationProductsArray &&
                            !!resultPresentationProductsArray[index >= 1 ? index * 2 : index]
                              ?.introduced_product_id && (
                              <option value={`${resultPresentationProductsArray[index >= 1 ? index * 2 : index]}`}>
                                {process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID !==
                                  resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number]
                                    ?.introduced_product_id &&
                                resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number]
                                  ?.introduced_inside_short_name
                                  ? resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number]
                                      ?.introduced_inside_short_name
                                  : resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number]
                                      ?.introduced_product_name ||
                                    resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number]
                                      ?.introduced_outside_short_name
                                  ? resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number]
                                      ?.introduced_product_name +
                                    " " +
                                    resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number]
                                      ?.introduced_outside_short_name
                                  : ""}
                                {process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID ===
                                  resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number]
                                    ?.introduced_product_id && "他"}
                              </option>
                            )}
                          {/* {resultPresentationProductsArray &&
                            !!resultPresentationProductsArray[index >= 1 ? index * 2 : index] && (
                              <option value={`${resultPresentationProductsArray[index >= 1 ? index * 2 : index]}`}>
                                {process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID !==
                                  resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number] &&
                                productIdToNameMap[
                                  resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number] as string
                                ]?.inside_short_name
                                  ? productIdToNameMap[
                                      resultPresentationProductsArray[
                                        (index >= 1 ? index * 2 : index) as number
                                      ] as string
                                    ]?.inside_short_name
                                  : productIdToNameMap[
                                      resultPresentationProductsArray[
                                        (index >= 1 ? index * 2 : index) as number
                                      ] as string
                                    ]?.product_name ||
                                    productIdToNameMap[
                                      resultPresentationProductsArray[
                                        (index >= 1 ? index * 2 : index) as number
                                      ] as string
                                    ]?.outside_short_name
                                  ? productIdToNameMap[
                                      resultPresentationProductsArray[
                                        (index >= 1 ? index * 2 : index) as number
                                      ] as string
                                    ]?.product_name +
                                    " " +
                                    productIdToNameMap[
                                      resultPresentationProductsArray[
                                        (index >= 1 ? index * 2 : index) as number
                                      ] as string
                                    ]?.outside_short_name
                                  : ""}
                                {process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID ===
                                  resultPresentationProductsArray[(index >= 1 ? index * 2 : index) as number] && "他"}
                              </option>
                            )} */}
                          {/* {plannedProduct2 && (
                            <option value="">
                              {productIdToNameMap[plannedProduct2].inside_short_name
                                ? productIdToNameMap[plannedProduct2].inside_short_name
                                : productIdToNameMap[plannedProduct2].product_name +
                                  " " +
                                  productIdToNameMap[plannedProduct2].outside_short_name}
                            </option>
                          )} */}
                          {productDataArray &&
                            productDataArray.length >= 1 &&
                            productDataArray.map((product) => {
                              if (
                                product.id ===
                                resultPresentationProductsArray[index >= 1 ? index * 2 : index]?.introduced_product_id
                              ) {
                                return;
                              }
                              return (
                                <option key={product.id} value={product.id}>
                                  {product.inside_short_name && product.inside_short_name}
                                  {!product.inside_short_name &&
                                    product.product_name + " " + product.outside_short_name}
                                </option>
                              );
                            })}
                          {/* {productDataArray &&
                            productDataArray.length >= 1 &&
                            productDataArray.map((product) => {
                              if (product.id === resultPresentationProductsArray[index >= 1 ? index * 2 : index]) {
                                return;
                              }
                              return (
                                <option key={product.id} value={product.id}>
                                  {product.inside_short_name && product.inside_short_name}
                                  {!product.inside_short_name &&
                                    product.product_name + " " + product.outside_short_name}
                                </option>
                              );
                            })} */}
                          {/* IM他 直接idを */}
                          {/* {resultPresentationProductsArray[index >= 1 ? index * 2 : index] !==
                            process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID && (
                            <option value={process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID}>他</option>
                          )} */}
                          {resultPresentationProductsArray[index >= 1 ? index * 2 : index]?.introduced_product_id !==
                            process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID && (
                            <option value={process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID}>他</option>
                          )}
                          {/* 選択時のリセット用 */}
                          {/* {resultPresentationProductsArray &&
                            resultPresentationProductsArray[index >= 1 ? index * 2 : index] && (
                              <option value=""></option>
                            )} */}
                          {resultPresentationProductsArray &&
                            resultPresentationProductsArray[index >= 1 ? index * 2 : index]?.introduced_product_id && (
                              <option value=""></option>
                            )}
                        </select>
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>

                  {/* 左ラッパーここまで  実施商品Rowsエリア*/}
                </div>

                {/* --------- 右ラッパー 実施商品Rowsエリア --------- */}
                <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
                  {/* 実施商品2 */}
                  <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                    <div className="flex h-full w-full flex-col pr-[20px]">
                      <div className={`${styles.title_box} flex h-full items-center`}>
                        {/* <span className={`${styles.title} !min-w-[140px]`}>実施商品2</span> */}
                        <div className={`${styles.title} relative z-[0] !min-w-[140px] items-center`}>
                          <span className={`mr-[15px] flex flex-col`}>
                            実施商品{index >= 1 ? index * 2 + 2 : index + 2}
                          </span>
                        </div>
                        <select
                          className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                          // value={plannedProduct1 ? plannedProduct1 : ""}
                          // onChange={(e) => setPlannedProduct1(e.target.value)}
                          // value={
                          //   resultPresentationProductsArray &&
                          //   !!resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]
                          //     ? (resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1] as string)
                          //     : ""
                          // }
                          value={
                            resultPresentationProductsArray &&
                            resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]
                              ? resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]
                                  ?.introduced_product_id
                              : ""
                          }
                          // onChange={(e) => handleChangeSelectProductId(index + 1, e)}
                          // onChange={(e) => handleChangeSelectProductId(index >= 1 ? index * 2 + 1 : index + 1, e)}
                          onChange={(e) => {
                            const newResultPresentationProducts = [...resultPresentationProductsArray];
                            // 他を格納
                            if (e.target.value === process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID) {
                              const newOtherObj = {
                                introduced_product_id: e.target.value,
                                introduced_product_name: "他",
                                introduced_outside_short_name: null,
                                introduced_inside_short_name: null,
                                introduced_unit_price: null,
                                introduced_product_priority: null,
                              };
                              newResultPresentationProducts[index >= 1 ? index * 2 + 1 : index + 1] = newOtherObj;
                            }
                            // nullを格納
                            else if (e.target.value === "") {
                              newResultPresentationProducts[index >= 1 ? index * 2 + 1 : index + 1] = null;
                            }
                            // 該当の商品オブジェクトを格納
                            else {
                              const findProductObj = productDataArray?.find((obj) => obj.id === e.target.value);
                              if (!findProductObj) return;
                              const newProductObj = {
                                introduced_product_id: findProductObj.id,
                                introduced_product_name: findProductObj.product_name,
                                introduced_outside_short_name: findProductObj.outside_short_name,
                                introduced_inside_short_name: findProductObj.inside_short_name,
                                introduced_unit_price: findProductObj.unit_price,
                                introduced_product_priority: null,
                              };
                              newResultPresentationProducts[index >= 1 ? index * 2 + 1 : index + 1] = newProductObj;
                            }
                            setResultPresentationProductsArray(newResultPresentationProducts);
                          }}
                        >
                          {/* {!resultPresentationProductsArray ||
                            (!resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1] && (
                              <option value=""></option>
                            ))} */}
                          {!resultPresentationProductsArray ||
                            (!resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]
                              ?.introduced_product_id && <option value=""></option>)}
                          {/* 商品選択後にuseQueryの条件を変更して商品リストが変更された場合も選択中の商品のidと名前が同じoptionタグに切り替える */}
                          {resultPresentationProductsArray &&
                            !!resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]
                              ?.introduced_product_id && (
                              <option
                                value={`${resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]}`}
                              >
                                {process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID !==
                                  resultPresentationProductsArray[(index >= 1 ? index * 2 + 1 : index + 1) as number]
                                    ?.introduced_product_id &&
                                resultPresentationProductsArray[(index >= 1 ? index * 2 + 1 : index + 1) as number]
                                  ?.introduced_inside_short_name
                                  ? resultPresentationProductsArray[(index >= 1 ? index * 2 + 1 : index + 1) as number]
                                      ?.introduced_inside_short_name
                                  : resultPresentationProductsArray[(index >= 1 ? index * 2 + 1 : index + 1) as number]
                                      ?.introduced_product_name ||
                                    resultPresentationProductsArray[(index >= 1 ? index * 2 + 1 : index + 1) as number]
                                      ?.introduced_outside_short_name
                                  ? resultPresentationProductsArray[(index >= 1 ? index * 2 + 1 : index + 1) as number]
                                      ?.introduced_product_name +
                                    " " +
                                    resultPresentationProductsArray[(index >= 1 ? index * 2 + 1 : index + 1) as number]
                                      ?.introduced_outside_short_name
                                  : ""}
                                {process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID ===
                                  resultPresentationProductsArray[(index >= 1 ? index * 2 + 1 : index + 1) as number]
                                    ?.introduced_product_id && "他"}
                              </option>
                            )}
                          {/* {resultPresentationProductsArray &&
                            !!resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1] && (
                              <option
                                value={`${resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]}`}
                              >
                                {process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID !==
                                  resultPresentationProductsArray[(index >= 1 ? index * 2 + 1 : index + 1) as number] &&
                                productIdToNameMap[
                                  resultPresentationProductsArray[
                                    (index >= 1 ? index * 2 + 1 : index + 1) as number
                                  ] as string
                                ]?.inside_short_name
                                  ? productIdToNameMap[
                                      resultPresentationProductsArray[
                                        (index >= 1 ? index * 2 + 1 : index + 1) as number
                                      ] as string
                                    ]?.inside_short_name
                                  : productIdToNameMap[
                                      resultPresentationProductsArray[
                                        (index >= 1 ? index * 2 + 1 : index + 1) as number
                                      ] as string
                                    ]?.product_name ||
                                    productIdToNameMap[
                                      resultPresentationProductsArray[
                                        (index >= 1 ? index * 2 + 1 : index + 1) as number
                                      ] as string
                                    ]?.outside_short_name
                                  ? productIdToNameMap[
                                      resultPresentationProductsArray[
                                        (index >= 1 ? index * 2 + 1 : index + 1) as number
                                      ] as string
                                    ]?.product_name +
                                    " " +
                                    productIdToNameMap[
                                      resultPresentationProductsArray[
                                        (index >= 1 ? index * 2 + 1 : index + 1) as number
                                      ] as string
                                    ]?.outside_short_name
                                  : ""}
                                {process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID ===
                                  resultPresentationProductsArray[(index >= 1 ? index * 2 + 1 : index + 1) as number] &&
                                  "他"}
                              </option>
                            )} */}
                          {productDataArray &&
                            productDataArray.length >= 1 &&
                            productDataArray.map((product) => {
                              if (
                                product.id ===
                                resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]
                                  ?.introduced_product_id
                              ) {
                                return;
                              }
                              return (
                                <option key={product.id} value={product.id}>
                                  {product.inside_short_name && product.inside_short_name}
                                  {!product.inside_short_name &&
                                    product.product_name + " " + product.outside_short_name}
                                </option>
                              );
                            })}
                          {/* {productDataArray &&
                            productDataArray.length >= 1 &&
                            productDataArray.map((product) => {
                              if (
                                product.id === resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]
                              ) {
                                return;
                              }
                              return (
                                <option key={product.id} value={product.id}>
                                  {product.inside_short_name && product.inside_short_name}
                                  {!product.inside_short_name &&
                                    product.product_name + " " + product.outside_short_name}
                                </option>
                              );
                            })} */}
                          {/* IM他 直接idを */}
                          {resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]
                            ?.introduced_product_id !== process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID && (
                            <option value={process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID}>他</option>
                          )}
                          {/* {resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1] !==
                            process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID && (
                            <option value={process.env.NEXT_PUBLIC_MEETING_RESULT_OTHER_ID}>他</option>
                          )} */}
                          {/* 選択時のリセット用 */}
                          {resultPresentationProductsArray &&
                            resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1]
                              ?.introduced_product_id && <option value=""></option>}
                          {/* {resultPresentationProductsArray &&
                            resultPresentationProductsArray[index >= 1 ? index * 2 + 1 : index + 1] && (
                              <option value=""></option>
                            )} */}
                        </select>
                      </div>
                      <div className={`${styles.underline}`}></div>
                    </div>
                  </div>
                </div>
                {/* 右ラッパーここまで 実施商品Rowsエリア */}
              </div>
            ))}
          {/* ------------------ 実施商品Rowsエリア ここまで ------------------ */}

          {/* --------- 横幅全体ラッパー 「実施商品を追加」 --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full items-center justify-center`}>
                  {/* <span className={``}>実施商品1</span> */}
                  <div
                    className="flex max-w-fit cursor-pointer items-center space-x-2 pb-[5px] text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline"
                    onClick={addMoreResultProductRow}
                  >
                    <AiOutlinePlus className="h-[14px] w-[14px] stroke-2 text-[14px]" />
                    <span>実施した商品をさらに追加</span>
                  </div>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全体ラッパー 「実施商品を追加」ここまで --------- */}

          {/* ------------------ 横幅全体ラッパー 同席者追加 ------------------ */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー 同席者タグ表示エリア --------- */}
            <div className={`${styles.left_contents_wrapper_attendees} flex h-full flex-col`}>
              {/* 面談人数 */}
              <div className={`${styles.row_area} flex h-[55px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    {/* <span className={`${styles.title} !min-w-[140px]`}>同席者</span> */}
                    <div
                      className={`relative flex !min-w-[140px] items-center ${styles.title} hover:text-[var(--color-text-brand-f)]`}
                      onMouseEnter={(e) => {
                        // if (isOpenSearchAttendeesSideTable) return;
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "商品ごとにデータを管理することが可能となります。",
                          content2: "この商品名が見積書の品名に記載されます。",
                          // marginTop: 57,
                          marginTop: 38,
                          // marginTop: 9,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        });
                      }}
                      onMouseLeave={handleCloseTooltip}
                    >
                      <span className={`mr-[8px] `}>同席者</span>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    {/* 同席者リストカード一覧エリア Xスクロール */}
                    <div className={`${styles.input_box} ${styles.attendees} relative`}>
                      <div className={`relative flex h-full w-full items-center space-x-[15px] px-[15px]`}>
                        {(!selectedAttendeesArray || selectedAttendeesArray.length === 0) && (
                          <div className="flex h-full w-full items-center text-[var(--color-text-sub-light)]">
                            <span>まだ同席者は追加されていません。</span>
                          </div>
                        )}
                        {/* メンバーカード */}
                        {selectedAttendeesArray &&
                          selectedAttendeesArray.length > 0 &&
                          selectedAttendeesArray.map((attendee, index) => (
                            <div
                              // key={attendee.contact_id}
                              key={attendee.attendee_id}
                              className={`box-shadow-inset-brand-f  flex min-h-[24px] min-w-max items-center justify-between rounded-[24px] bg-[var(--member-card)] px-[10px] py-[4px]`}
                              // onMouseEnter={(e) => {
                              //   handleOpenTooltip({
                              //     e: e,
                              //     display: "top",
                              //     // content: "追加した同席者リストをリセットします。",
                              //     content: `${attendee.company_name ? `${attendee.company_name} / ` : ``}${
                              //       attendee.contact_name ? `${attendee.contact_name} / ` : ``
                              //     }${
                              //       attendee.department_name
                              //         ? `${attendee.department_name} ${attendee.position_name ? `/` : ``} `
                              //         : ``
                              //     }${attendee.position_name ? `${attendee.position_name}` : ``}`,
                              //     content2: `${
                              //       attendee.address
                              //         ? `住所: ${attendee.address} ${attendee.main_phone_number ? `/` : ``} `
                              //         : ``
                              //     }${
                              //       attendee.main_phone_number
                              //         ? `代表TEL: ${attendee.main_phone_number} ${attendee.contact_email ? `/` : ``} `
                              //         : ``
                              //     }${
                              //       attendee.direct_line
                              //         ? `直通TEL: ${attendee.direct_line} ${attendee.contact_email ? `/` : ``} `
                              //         : ``
                              //     }${attendee.contact_email ? `担当者Email: ${attendee.contact_email}` : ``}`,
                              //     // content2: "この商品名が見積書の品名に記載されます。",
                              //     // marginTop: 57,
                              //     // marginTop: 38,
                              //     marginTop: 24,
                              //     // marginTop: 9,
                              //     // marginTop: 3,
                              //     itemsPosition: "center",
                              //     whiteSpace: "nowrap",
                              //   });
                              // }}
                              onMouseEnter={(e) => {
                                handleOpenTooltip({
                                  e: e,
                                  display: "top",
                                  // content: "追加した同席者リストをリセットします。",
                                  content: `${attendee.attendee_company ? `${attendee.attendee_company} / ` : ``}${
                                    attendee.attendee_name ? `${attendee.attendee_name} / ` : ``
                                  }${
                                    attendee.attendee_department_name
                                      ? `${attendee.attendee_department_name} ${
                                          attendee.attendee_position_name ? `/` : ``
                                        } `
                                      : ``
                                  }${attendee.attendee_position_name ? `${attendee.attendee_position_name}` : ``}`,
                                  content2: `${
                                    attendee.attendee_address
                                      ? `住所: ${attendee.attendee_address} ${
                                          attendee.attendee_direct_line ? `/` : ``
                                        } `
                                      : ``
                                  }${
                                    attendee.attendee_main_phone_number
                                      ? `代表TEL: ${attendee.attendee_main_phone_number} ${
                                          attendee.attendee_direct_line ? `/` : ``
                                        } `
                                      : ``
                                  }${
                                    attendee.attendee_direct_line
                                      ? `直通TEL: ${attendee.attendee_direct_line} ${
                                          attendee.attendee_email ? `/` : ``
                                        } `
                                      : ``
                                  }${attendee.attendee_email ? `担当者Email: ${attendee.attendee_email}` : ``}`,
                                  // content2: "この商品名が見積書の品名に記載されます。",
                                  // marginTop: 57,
                                  // marginTop: 38,
                                  marginTop: 24,
                                  // marginTop: 9,
                                  // marginTop: 3,
                                  itemsPosition: "center",
                                  whiteSpace: "nowrap",
                                });
                              }}
                              onMouseLeave={handleCloseTooltip}
                            >
                              {/* 選択メンバー アバター画像 */}
                              <div
                                // data-text="ユーザー名"
                                className={`flex-center min-h-[24px] min-w-[24px] rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] ${styles.tooltip} pointer-events-none`}
                              >
                                {/* <span>K</span> */}
                                <span className={`pointer-events-none text-[12px]`}>
                                  {/* {attendee?.company_name
                                    ? getCompanyInitial(attendee.company_name)
                                    : `${getCompanyInitial("NoName")}`} */}
                                  {attendee?.attendee_company
                                    ? getCompanyInitial(attendee.attendee_company)
                                    : `${getCompanyInitial("NoName")}`}
                                </span>
                              </div>
                              {/* 選択メンバー 名前 */}
                              <p className={`max-w-[80%] px-[8px] text-[13px]`}>
                                {/* {attendee?.contact_name ?? "No Name"} */}
                                {attendee?.attendee_name ?? "No Name"}
                              </p>
                              {/* クローズボタン */}
                              <div
                                className={`cursor-pointer`}
                                onClick={() => {
                                  const filteredAttendees = selectedAttendeesArray.filter(
                                    (selectedAttendee) => selectedAttendee.attendee_id !== attendee.attendee_id
                                  );
                                  setSelectedAttendeesArray(filteredAttendees);
                                  if (hoveredItemPosModal) handleCloseTooltip();
                                }}
                                // onClick={() => {
                                //   const filteredAttendees = selectedAttendeesArray.filter(
                                //     (selectedAttendee) => selectedAttendee.contact_id !== attendee.contact_id
                                //   );
                                //   setSelectedAttendeesArray(filteredAttendees);
                                //   if (hoveredItemPosModal) handleCloseTooltip();
                                // }}
                              >
                                <MdClose className="pointer-events-none text-[16px]" />
                              </div>
                            </div>
                          ))}
                        {/* メンバーカード ここまで */}
                      </div>
                    </div>
                    {/* 同席者リストカード一覧エリア ここまで */}
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパー 同席者タグ表示エリアここまで */}
            </div>

            {/* --------- 右ラッパー 同席者検索ボタン --------- */}
            <div className={`${styles.right_contents_wrapper_attendees} flex h-full flex-col`}>
              {/* 同席者検索ボタン */}
              <div className={`${styles.row_area} flex h-[55px] w-full items-center`}>
                <div className="flex h-full w-full flex-col justify-center pr-[20px]">
                  <div className="flex w-full items-start justify-end">
                    <div
                      className={`transition-base01 flex-center max-h-[36px] min-h-[36px] min-w-[78px] whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] ${
                        styles.cancel_section_title
                      } hover:bg-[var(--setting-side-bg-select-hover)] ${
                        !selectedAttendeesArray || selectedAttendeesArray.length === 0
                          ? `cursor-not-allowed`
                          : `cursor-pointer`
                      }`}
                      onMouseEnter={(e) => {
                        // if (isOpenSearchAttendeesSideTable) return;
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "追加した同席者リストをリセットします。",
                          // content2: "この商品名が見積書の品名に記載されます。",
                          // marginTop: 57,
                          // marginTop: 38,
                          // marginTop: 9,
                          marginTop: 3,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        });
                      }}
                      onMouseLeave={handleCloseTooltip}
                      onClick={() => {
                        if (!selectedAttendeesArray || selectedAttendeesArray.length === 0) return;
                        setSelectedAttendeesArray([]);
                        if (hoveredItemPosModal) handleCloseTooltip();
                      }}
                    >
                      <span>リセット</span>
                    </div>
                    <div
                      className={`transition-base01 flex-center ml-[12px] min-h-[36px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                      onMouseEnter={(e) => {
                        // if (isOpenSearchAttendeesSideTable) return;
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "データベースから同席者を検索して追加できます。",
                          // content2: "この商品名が見積書の品名に記載されます。",
                          // marginTop: 57,
                          // marginTop: 38,
                          // marginTop: 9,
                          marginTop: 3,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        });
                      }}
                      onMouseLeave={handleCloseTooltip}
                      onClick={() => {
                        setIsOpenSearchAttendeesSideTable(true);
                        handleCloseTooltip();
                      }}
                    >
                      <span>追加</span>
                    </div>
                  </div>
                  <div className={`mt-[3px] min-h-[1px] w-full`}></div>
                </div>
              </div>

              {/* 右ラッパー 同席者検索ボタンここまで */}
            </div>
          </div>
          {/* ------------------ 横幅全体ラッパー 同席者追加ここまで ------------------ */}

          {/* --------- 横幅全体ラッパー --------- */}
          {/* <div className={`${styles.full_contents_wrapper} flex w-full`}>
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>実施商品1</span>
                    <input
                      type="text"
                      placeholder="面談で紹介した商品を入力してください"
                      required
                      className={`${styles.input_box}`}
                      value={resultPresentationProduct1}
                      onChange={(e) => setResultPresentationProduct1(e.target.value)}
                      onBlur={() => setResultPresentationProduct1(toHalfWidth(resultPresentationProduct1.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>

            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>実施商品2</span>
                    <input
                      type="text"
                      placeholder="2つ目に紹介した商品があれば入力してください"
                      required
                      className={`${styles.input_box}`}
                      value={resultPresentationProduct2}
                      onChange={(e) => setResultPresentationProduct2(e.target.value)}
                      onBlur={() => setResultPresentationProduct2(toHalfWidth(resultPresentationProduct2.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>
          </div> */}
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          {/* <div className={`${styles.full_contents_wrapper} flex w-full`}>
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>実施商品3</span>
                    <input
                      type="text"
                      placeholder="3つ目に紹介した商品があれば入力してください"
                      required
                      className={`${styles.input_box}`}
                      value={resultPresentationProduct3}
                      onChange={(e) => setResultPresentationProduct3(e.target.value)}
                      onBlur={() => setResultPresentationProduct3(toHalfWidth(resultPresentationProduct3.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>

            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>実施商品4</span>
                    <input
                      type="text"
                      placeholder="4つ目に紹介した商品があれば入力してください"
                      required
                      className={`${styles.input_box}`}
                      value={resultPresentationProduct4}
                      onChange={(e) => setResultPresentationProduct4(e.target.value)}
                      onBlur={() => setResultPresentationProduct4(toHalfWidth(resultPresentationProduct4.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>
          </div> */}
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          {/* <div className={`${styles.full_contents_wrapper} flex w-full`}>
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>実施商品5</span>
                    <input
                      type="text"
                      placeholder="5つ目に紹介した商品があれば入力してください"
                      required
                      className={`${styles.input_box}`}
                      value={resultPresentationProduct5}
                      onChange={(e) => setResultPresentationProduct5(e.target.value)}
                      onBlur={() => setResultPresentationProduct5(toHalfWidth(resultPresentationProduct5.trim()))}
                    />
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>
          </div> */}
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全部ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full flex-col`}>
            {/* 結果ｺﾒﾝﾄ */}
            <div className={`${styles.row_area} ${styles.text_area_xl} flex h-[35px] w-full items-center`}>
              <div className="flex h-full w-full flex-col pr-[20px]">
                <div className={`${styles.title_box} flex h-full `}>
                  <span className={`${styles.title} !min-w-[140px]`}>結果ｺﾒﾝﾄ</span>
                  <textarea
                    cols={30}
                    // rows={10}
                    placeholder=""
                    className={`${styles.textarea_box}`}
                    value={resultSummary}
                    onChange={(e) => setResultSummary(e.target.value)}
                  ></textarea>
                </div>
                <div className={`${styles.underline}`}></div>
              </div>
            </div>
          </div>
          {/* --------- 横幅全部ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            {/* <div className={`flex h-full w-full flex-col`}> */}
            <div className={`${styles.left_contents_wrapper} flex h-full w-full flex-col`}>
              {/* 面談結果 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                {/* <div className="flex h-full w-[50%] flex-col pr-[20px]"> */}
                <div className="flex h-full w-[100%] flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center`}>
                    <span className={`${styles.title} !min-w-[140px]`}>面談結果</span>
                    <select
                      className={`mr-auto h-full w-[100%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={resultCategory}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("面談目的を選択してください");
                        setResultCategory(e.target.value);
                      }}
                    >
                      <option value="">面談結果を選択してください</option>
                      {optionsResultCategory.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                      {/* <option value="展開F(当期中に導入の可能性あり)">展開F(当期中に導入の可能性あり)</option>
                      <option value="展開N(来期導入の可能性あり)">展開N(来期導入の可能性あり)</option>
                      <option value="展開継続">展開継続</option>
                      <option value="時期尚早">時期尚早</option>
                      <option value="頻度低い(ニーズあるが頻度低く導入には及ばず)">
                        頻度低い(ニーズあるが使用頻度低く導入には及ばず)
                      </option>
                      <option value="結果出ず(再度面談や検証が必要)">結果出ず(再度面談や検証が必要)</option>
                      <option value="担当者の推進力無し(ニーズあり、上長・キーマンにあたる必要有り)">
                        担当者の推進力無し(ニーズあり、上長・キーマンにあたる必要有り)
                      </option>
                      <option value="用途・ニーズなし">用途・ニーズなし</option>
                      <option value="他(立ち上げ、サポート)">他(立ち上げ、サポート)</option>
                      <option value="その他">その他</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>
            {/* 左ラッパーここまで */}
            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 現ステータス解説 */}
              <div className={`mt-[18px] flex h-[35px] w-full items-center`}>
                <div className="mr-[20px] flex items-center space-x-[4px] text-[15px] font-bold">
                  <ImInfo className={`text-[var(--color-text-brand-f)]`} />
                  <span>結果タイプ解説：</span>
                </div>
                <div className="flex items-center space-x-[20px] text-[15px]">
                  <div
                    className={`flex cursor-pointer items-center space-x-[4px] text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline`}
                    // data-text="マーケティングが獲得した引合・リードを管理することで、"
                    // data-text2="獲得したリードから営業のフォロー状況を確認することができます。"
                    // onMouseEnter={(e) => {
                    //   handleOpenTooltip(e, "top");
                    // }}
                    onMouseEnter={(e) =>
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: "面談した結果、「当期中」に導入の可能性がある案件や受注へと展開した際に使用します。",
                        content2: "展開した場合は「案件_作成」から案件を作成しましょう。",
                        // content2: "",
                        // marginTop: 57,
                        marginTop: 39,
                        itemsPosition: "center",
                        whiteSpace: "nowrap",
                      })
                    }
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span className="pointer-events-none">展開F</span>
                    <AiOutlineQuestionCircle className={`pointer-events-none`} />
                  </div>
                  <div
                    className={`flex cursor-pointer items-center space-x-[4px] text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline`}
                    onMouseEnter={(e) =>
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: "面談した結果、「来期」に導入の可能性がある案件へと展開した際に使用します。",
                        content2: "展開した場合は「案件_作成」から案件を作成しましょう。",
                        // marginTop: 57,
                        marginTop: 39,
                        itemsPosition: "center",
                        whiteSpace: "nowrap",
                      })
                    }
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span className="pointer-events-none">展開N</span>
                    <AiOutlineQuestionCircle className={`pointer-events-none`} />
                  </div>
                  <div
                    className={`flex cursor-pointer items-center space-x-[4px] text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline`}
                    onMouseEnter={(e) =>
                      handleOpenTooltip({
                        e: e,
                        display: "top",
                        content: "展開中の客先への再面談で引き続き",
                        content2: "展開が継続、もしくは受注した際に使用します。",
                        // marginTop: 18,
                        marginTop: 39,
                        itemsPosition: "center",
                        whiteSpace: "nowrap",
                      })
                    }
                    onMouseLeave={handleCloseTooltip}
                  >
                    <span className="pointer-events-none">展開継続</span>
                    <AiOutlineQuestionCircle className={`pointer-events-none`} />
                  </div>
                </div>
              </div>
            </div>
            {/* --------- 右ラッパー ---------ここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 面談時_最上位職位 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div
                      className={`${styles.title} flex !min-w-[140px] items-center ${styles.double}`}
                      onMouseEnter={(e) => {
                        // if (isOpenSearchAttendeesSideTable) return;
                        handleOpenTooltip({
                          e: e,
                          display: "top",
                          content: "面談した担当者の中で最上位の職位を選択します。",
                          content2: "受注率と面談時の最上位職位には相関があるため現状把握や分析に役立ちます。",
                          // marginTop: 57,
                          // marginTop: 38,
                          marginTop: 9,
                          itemsPosition: "center",
                          whiteSpace: "nowrap",
                        });
                      }}
                      onMouseLeave={handleCloseTooltip}
                    >
                      <div className={`mr-[8px] flex flex-col ${styles.double}`}>
                        <span>面談時_</span>
                        <span>最上位職位</span>
                      </div>
                      <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} />
                    </div>
                    <select
                      className={`mr-auto h-full w-[100%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={resultTopPositionClass}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("面談目的を選択してください");
                        setResultTopPositionClass(e.target.value);
                      }}
                    >
                      {optionsPositionsClass.map((classNum) => (
                        <option key={classNum} value={`${classNum}`}>
                          {getPositionClassName(classNum)}
                        </option>
                      ))}
                      {/* <option value="">選択してください</option>
                      <option value="決裁者と未商談">決裁者と未商談</option>
                      <option value="決裁者と商談済み">決裁者と商談済み</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}></div>
            {/* --------- 右ラッパーここまで --------- */}
            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* --------- 横幅全体ラッパー --------- */}
          <div className={`${styles.full_contents_wrapper} flex w-full`}>
            {/* --------- 左ラッパー --------- */}
            <div className={`${styles.left_contents_wrapper} flex h-full flex-col`}>
              {/* 面談時_決裁者商談有無 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <div className={`${styles.title} flex !min-w-[140px] flex-col ${styles.double}`}>
                      <span>面談時_</span>
                      <span>決裁者商談有無</span>
                    </div>
                    <select
                      className={`mr-auto h-full w-[100%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={resultNegotiateDecisionMaker}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("面談目的を選択してください");
                        setResultNegotiateDecisionMaker(e.target.value);
                      }}
                    >
                      <option value="">選択してください</option>
                      {optionsResultNegotiateDecisionMaker.map((classNum) => (
                        <option key={classNum} value={`${classNum}`}>
                          {classNum}
                        </option>
                      ))}
                      {/* <option value="決裁者と未商談">決裁者と未商談</option>
                      <option value="決裁者と商談済み">決裁者と商談済み</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>

              {/* 左ラッパーここまで */}
            </div>
            {/* --------- 右ラッパー --------- */}
            <div className={`${styles.right_contents_wrapper} flex h-full flex-col`}>
              {/* 面談時同席依頼 */}
              <div className={`${styles.row_area} flex h-[35px] w-full items-center`}>
                <div className="flex h-full w-full flex-col pr-[20px]">
                  <div className={`${styles.title_box} flex h-full items-center `}>
                    <span className={`${styles.title} !min-w-[140px] !text-[16px]`}>面談時同席依頼</span>
                    <select
                      className={`ml-auto h-full w-[80%] cursor-pointer rounded-[4px] ${styles.select_box}`}
                      value={meetingParticipationRequest}
                      onChange={(e) => {
                        // if (e.target.value === "") return alert("活動タイプを選択してください");
                        setMeetingParticipationRequest(e.target.value);
                      }}
                    >
                      <option value=""></option>
                      {optionsMeetingParticipationRequest.map((option) => (
                        <option key={option} value={`${option}`}>
                          {option}
                        </option>
                      ))}
                      {/* <option value="同席依頼無し">同席依頼無し</option>
                      <option value="同席依頼済み 同席OK">同席依頼済み 同席OK</option>
                      <option value="同席依頼済み 同席NG">同席依頼済み 同席NG</option> */}
                    </select>
                  </div>
                  <div className={`${styles.underline}`}></div>
                </div>
              </div>
            </div>

            {/* 右ラッパーここまで */}
          </div>
          {/* --------- 横幅全体ラッパーここまで --------- */}

          {/* メインコンテンツ コンテナ ここまで */}
        </div>
      </div>

      {/* 同席者検索サイドテーブル */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={
            <FallbackSideTableSearchAttendees isOpenSearchAttendeesSideTable={isOpenSearchAttendeesSideTable} />
          }
        >
          <SideTableSearchAttendees
            isOpenSearchAttendeesSideTable={isOpenSearchAttendeesSideTable}
            setIsOpenSearchAttendeesSideTable={setIsOpenSearchAttendeesSideTable}
            // searchAttendeeFields={searchAttendeeFields}
            selectedAttendeesArray={selectedAttendeesArray}
            setSelectedAttendeesArray={setSelectedAttendeesArray}
          />
        </Suspense>
      </ErrorBoundary>
      {/* <FallbackSideTableSearchAttendees isOpenSearchAttendeesSideTable={isOpenSearchAttendeesSideTable} /> */}

      {/* 「自社担当」変更確認モーダル */}
      {isOpenConfirmationModal === "change_member" && (
        <ConfirmationModal
          clickEventClose={() => {
            // setMeetingMemberName(selectedRowDataMeeting?.meeting_member_name ?? "");
            setMemberObj(prevMemberObj);
            setIsOpenConfirmationModal(null);
          }}
          // titleText="面談データの自社担当を変更してもよろしいですか？"
          titleText={`データの所有者を変更してもよろしいですか？`}
          // titleText2={`データの所有者を変更しますか？`}
          sectionP1="「自社担当」「事業部」「係・チーム」「事業所」を変更すると面談データの所有者が変更されます。"
          sectionP2="注：データの所有者を変更すると、この面談結果は変更先のメンバーの集計結果に移行され、分析結果が変更されます。"
          cancelText="戻る"
          submitText="変更する"
          clickEventSubmit={() => {
            // setMemberObj(prevMemberObj);
            setIsOpenConfirmationModal(null);
            setIsOpenSearchMemberSideTable(true);
          }}
        />
      )}

      {/* 「自社担当」変更サイドテーブル */}
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense
          fallback={<FallbackSideTableSearchMember isOpenSearchMemberSideTable={isOpenSearchMemberSideTable} />}
        >
          <SideTableSearchMember
            isOpenSearchMemberSideTable={isOpenSearchMemberSideTable}
            setIsOpenSearchMemberSideTable={setIsOpenSearchMemberSideTable}
            // currentMemberId={selectedRowDataMeeting?.meeting_created_by_user_id ?? ""}
            // currentMemberName={selectedRowDataMeeting?.meeting_member_name ?? ""}
            // currentMemberDepartmentId={selectedRowDataMeeting?.meeting_created_by_department_of_user ?? null}
            // setChangedMemberObj={setChangedMemberObj}
            // currentMemberId={memberObj.memberId ?? ""}
            // currentMemberName={memberObj.memberName ?? ""}
            // currentMemberDepartmentId={memberObj.departmentId ?? null}
            prevMemberObj={prevMemberObj}
            setPrevMemberObj={setPrevMemberObj}
            memberObj={memberObj}
            setMemberObj={setMemberObj}
            // setMeetingMemberName={setMeetingMemberName}
          />
        </Suspense>
      </ErrorBoundary>

      {/* <>
        {isOpenSearchAttendeesSideTable && (
          <div
            // className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00800030]`}
            className={`absolute left-0 top-0 z-[1100] h-full w-full bg-[#00000000]`}
            onClick={() => setIsOpenSearchAttendeesSideTable(false)}
          ></div>
        )}
        <div
          className={`${styles.side_table} z-[1200] pt-[30px] ${
            isOpenSearchAttendeesSideTable
              ? `${styles.active} transition-transform02 !delay-[0.1s]`
              : `transition-transform01`
          }`}
        >
          <div className="flex h-auto w-full flex-col px-[30px] 2xl:px-[30px]">
            <div className={`relative flex h-full w-full items-center justify-between`}>
              <h3 className="space-y-[1px] text-[22px] font-bold">
                <div className={`flex items-start space-x-[9px]`}>
                  <span>同席者を検索</span>
                  <span>{neonSearchIcon("30px")}</span>
                </div>
                <div className="min-h-[1px] w-full bg-[var(--color-bg-brand-f)]"></div>
              </h3>
              <div
                // className={`flex-center h-[36px] w-[36px] cursor-pointer rounded-full hover:bg-[#666]`}
                className={`z-1 flex-center absolute right-[-10px] top-[50%]  h-[36px] w-[36px] translate-y-[-50%] cursor-pointer rounded-full hover:bg-[#666]`}
                onClick={() => setIsOpenSearchAttendeesSideTable(false)}
              >
                <BsChevronRight className="text-[24px]" />
              </div>
            </div>
          </div>
          <div className="mt-[20px] h-full max-h-[33vh] w-full overflow-y-scroll bg-[#ffffff00] pb-[90px]">
            <div className="flex h-auto w-full flex-col">
              <div className={`flex min-h-[30px] items-end justify-between px-[30px]`}>
                <h3 className="flex min-h-[30px] max-w-max items-end space-y-[1px] text-[14px] font-bold ">
                  <span>条件を入力して同席者を検索</span>
                </h3>
                <div className="flex pr-[0px]">
                  <RippleButton
                    title={`検索`}
                    minHeight="30px"
                    minWidth="78px"
                    fontSize="13px"
                    bgColor="var(--color-bg-brand-f50)"
                    bgColorHover="var(--color-btn-brand-f-hover)"
                    border="var(--color-bg-brand-f)"
                    borderRadius="6px"
                    classText={`select-none`}
                    clickEventHandler={() => {
                      // setIsOpenSettingInvitationModal(true);
                    }}
                  />
                </div>
              </div>
              <ul className={`mt-[20px] flex flex-col text-[13px] text-[var(--color-text-title)]`}>
                {searchAttendeeFields.map((item, index) => (
                  <li
                    key={item.title + index.toString()}
                    className={`relative flex h-[56px] w-full min-w-max items-center justify-between px-[30px] py-[6px] text-[#fff] ${styles.side_table_search_list}`}
                  >
                    <div className={`${styles.list_title_area} flex min-w-[120px] items-center`}>
                      <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                      <div className="flex select-none items-center space-x-[2px]">
                        <span className={`${styles.list_title}`}>{item.title}</span>
                        <span className={``}>：</span>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder=""
                      className={`${styles.input_box}`}
                      value={item.inputValue}
                      onChange={(e) => item.setInputValue(e.target.value)}
                      onBlur={() => item.setInputValue(item.inputValue.trim())}
                    />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <hr className="my-[0px] min-h-[1px] w-full bg-[var(--color-bg-brand-f)]" />

          <div
            ref={sideTableScrollContainerRef}
            className="flex h-full max-h-[calc(100vh-(30px+36px+20px+33vh+1px+0px))] w-full flex-col overflow-y-scroll bg-[#ffffff00] pb-[90px]"
          >
            <div ref={sideTableScrollItemRef} className="flex h-auto w-full flex-col">
              <div
                ref={sideTableScrollHeaderRef}
                className={`sticky top-0 flex min-h-[30px] items-end justify-between px-[30px] pb-[18px] pt-[18px] ${styles.side_table_attendees_header}`}
                // className={`sticky top-0 flex min-h-[30px] items-end justify-between bg-[var(--color-bg-brand-f-deep)] px-[30px] pb-[12px] pt-[12px]`}
              >
                <h3 className="flex min-h-[30px] max-w-max items-center space-y-[1px] text-[14px] font-bold">
                  <span>同席者を選択して追加</span>
                </h3>
                <div className="flex">
                  <RippleButton
                    title={`追加`}
                    minHeight="30px"
                    minWidth="78px"
                    fontSize="13px"
                    textColor={`${selectedAttendeesArray?.length > 0 ? `#fff` : `#666`}`}
                    bgColor={`${selectedAttendeesArray?.length > 0 ? `var(--color-bg-brand50)` : `#33333390`}`}
                    bgColorHover={`${selectedAttendeesArray?.length > 0 ? `var(--color-bg-brand)` : `#33333390`}`}
                    border={`${
                      selectedAttendeesArray?.length > 0 ? `var(--color-bg-brand)` : `var(--color-bg-brandc0)`
                    }`}
                    borderRadius="6px"
                    classText={`select-none ${
                      selectedAttendeesArray?.length > 0 ? `` : `hover:cursor-not-allowed`
                    }`}
                    clickEventHandler={() => {
                      // setIsOpenSettingInvitationModal(true);
                    }}
                  />
                </div>
              </div>
              <ul className={`flex h-auto w-full flex-col`}>
                {Array(12)
                  .fill(null)
                  .map((_, index) => (
                    <li
                      key={index}
                      className={`${styles.attendees_list} flex min-h-[44px] w-full cursor-pointer items-center truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--color-bg-brand-f30)]`}
                      // onClick={() => {
                      // }}
                    >
                      <div
                        // data-text="ユーザー名"
                        className={`${styles.attendees_list_item_Icon} flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                        // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                        // onMouseLeave={handleCloseTooltip}
                      >
                        <span className={`text-[20px]`}>伊</span>
                      </div>
                      <div
                        className={`${styles.attendees_list_item_lines_group} flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}
                      >
                        <div className={`${styles.attendees_list_item_line} flex space-x-[4px] text-[13px]`}>
                          <span>株式会社トラスティファイ</span>
                          <span>代表取締役</span>
                        </div>
                        <div className={`${styles.attendees_list_item_line} flex space-x-[4px]`}>
                          <span>CEO</span>
                          <span className="!ml-[10px]">伊藤 謙太</span>
                        </div>
                        <div className={`${styles.attendees_list_item_line} flex space-x-[10px]`}>
                          <div className="flex space-x-[4px] text-[#ccc]">
                            <span>東京都港区芝浦4-20-2 ローズスクエア12F</span>
                          </div>
                          <span>/</span>
                          {isDesktopGTE1600 && (
                            <>
                              <div className="flex space-x-[4px] text-[#ccc]">
                                <span>01-4567-8900</span>
                              </div>
                              <span>/</span>
                            </>
                          )}
                          <div className={`text-[#ccc]`}>cieletoile.1204@gmail.com</div>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>

            </div>
          </div>
        </div>
      </> */}
    </>
  );
};
