import React, { useState, memo, useEffect, ChangeEvent, useRef, Suspense } from "react";
import styles from "../SettingAccountModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import { Department, Employee_id, Office, Unit, UserProfileCompanySubscription } from "@/types";
import { useUploadAvatarImg } from "@/hooks/useUploadAvatarImg";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import Image from "next/image";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import useStore from "@/store";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";
import { useMutateAuth } from "@/hooks/useMutateAuth";
import {
  getOccupationName,
  getPositionClassNameForCustomer,
  optionsOccupation,
  optionsPositionsClassForCustomer,
} from "@/utils/selectOptions";
import SpinnerIDS2 from "@/components/Parts/SpinnerIDS/SpinnerIDS2";
import { FiRefreshCw } from "react-icons/fi";
import SpinnerIDS3 from "@/components/Parts/SpinnerIDS/SpinnerIDS3";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { useQueryClient } from "@tanstack/react-query";
import { ErrorBoundary } from "react-error-boundary";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import { SideTableSearchSignatureStamp } from "../../UpdateMeetingModal/SideTableSearchSignatureStamp/SideTableSearchSignatureStamp";
import { FallbackSideTableSearchSignatureStamp } from "../../UpdateMeetingModal/SideTableSearchSignatureStamp/FallbackSideTableSearchSignatureStamp";
import { SkeletonLoadingLineCustom } from "@/components/Parts/SkeletonLoading/SkeletonLoadingLineCustom";
import { ImInfo } from "react-icons/im";

const SettingProfileMemo = () => {
  const language = useStore((state) => state.language);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);

  // infoアイコン
  const infoIconStampRef = useRef<HTMLDivElement | null>(null);

  // 名前編集モード
  const [editNameMode, setEditNameMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  // Email
  const [editEmailMode, setEditEmailMode] = useState(false);
  const [editedEmail, setEditedEmail] = useState("");
  const emailRef = useRef<HTMLInputElement | null>(null);
  const rowAreaEmailRef = useRef<HTMLDivElement | null>(null);
  const [checkedEmail, setCheckedEmail] = useState("");
  const [checkedSameUserEmail, setCheckedSameUserEmail] = useState(false);
  const [submittedErrorEmail, setSubmittedErrorEmail] = useState<string[]>([]);
  // 電話番号
  const [editTELMode, setEditTELMode] = useState(false);
  const [editedTEL, setEditedTEL] = useState("");
  // 事業部
  const [editDepartmentMode, setEditDepartmentMode] = useState(false);
  const [editedDepartment, setEditedDepartment] = useState("");
  const [isSelectModeDepartment, setIsSelectModeDepartment] = useState(true); // セレクトボックスで選択
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  // 係・チーム
  const [editUnitMode, setEditUnitMode] = useState(false);
  const [editedUnit, setEditedUnit] = useState("");
  const [isSelectModeUnit, setIsSelectModeUnit] = useState(true); // セレクトボックスで選択
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  // 役職クラス
  const [editPositionClassMode, setEditPositionClassMode] = useState(false);
  const [editedPositionClass, setEditedPositionClass] = useState("");
  // 役職名
  const [editPositionNameMode, setEditPositionNameMode] = useState(false);
  const [editedPositionName, setEditedPositionName] = useState("");
  // 所属事業所・営業所
  const [editOfficeMode, setEditOfficeMode] = useState(false);
  const [editedOffice, setEditedOffice] = useState("");
  const [isSelectModeOffice, setIsSelectModeOffice] = useState(true); // セレクトボックスで選択
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  // 社員番号・ID
  const [editEmployeeIdMode, setEditEmployeeIdMode] = useState(false);
  const [editedEmployeeId, setEditedEmployeeId] = useState("");
  // 職種
  const [editOccupationMode, setEditOccupationMode] = useState(false);
  const [editedOccupation, setEditedOccupation] = useState("");
  // 利用用途
  const [editUsageMode, setEditUsageMode] = useState(false);
  const [editedUsage, setEditedUsage] = useState("");
  // 使用目的
  const [editPurposeOfUseMode, setEditPurposeOfUseMode] = useState(false);
  const [editedPurposeOfUse, setEditedPurposeOfUse] = useState("");
  // 印鑑データ
  const [editSignatureStampMode, setEditSignatureStampMode] = useState(false);
  const [editedSignatureStamp, setEditedSignatureStamp] = useState("");
  // const [isOpenSearchStampSideTableBefore, setIsOpenSearchStampSideTableBefore] = useState(false);
  // const [isOpenSearchStampSideTable, setIsOpenSearchStampSideTable] = useState(false);
  // 印鑑オブジェクト
  type StampObj = {
    signature_stamp_id: string | null;
    signature_stamp_url: string | null;
  };
  const initialStampObj = {
    signature_stamp_id: userProfileState?.assigned_signature_stamp_id ?? null,
    signature_stamp_url: userProfileState?.assigned_signature_stamp_url ?? null,
  };
  // const [prevStampObj, setPrevStampObj] = useState<StampObj>(initialStampObj);
  // const [stampObj, setStampObj] = useState<StampObj>(initialStampObj);
  const prevStampObj = useDashboardStore((state) => state.prevStampObj);
  const setPrevStampObj = useDashboardStore((state) => state.setPrevStampObj);
  const stampObj = useDashboardStore((state) => state.stampObj);
  const setStampObj = useDashboardStore((state) => state.setStampObj);
  const setIsOpenSearchStampSideTableBefore = useDashboardStore((state) => state.setIsOpenSearchStampSideTableBefore);
  const setIsOpenSearchStampSideTable = useDashboardStore((state) => state.setIsOpenSearchStampSideTable);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  const { updateUserEmail } = useMutateAuth();
  // const { createActivityMutation } = useMutateActivity();
  const { useMutateUploadAvatarImg, useMutateDeleteAvatarImg } = useUploadAvatarImg();
  const { fullUrl: avatarUrl, isLoading } = useDownloadUrl(userProfileState?.avatar_url, "avatars");
  const { fullUrl: stampUrl, isLoading: isLoadingStamp } = useDownloadUrl(
    userProfileState?.assigned_signature_stamp_url,
    "signature_stamps"
  );

  // ================================ 🌟事業部、係、事業所リスト取得useQuery🌟 ================================
  // const departmentDataArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  // const unitDataArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  // const officeDataArray: Office[] | undefined = queryClient.getQueryData(["offices"]);
  // ================================ ✅事業部、係、事業所リスト取得useQuery✅ ================================
  // ================================ 🌟事業部リスト取得useQuery🌟 ================================
  const {
    data: departmentDataArray,
    isLoading: isLoadingQueryDepartment,
    refetch: refetchQUeryDepartments,
  } = useQueryDepartments(userProfileState?.company_id, true);
  console.log("departmentDataArray", departmentDataArray, "selectedDepartment", selectedDepartment);

  // useMutation
  // const { createDepartmentMutation, updateDepartmentFieldMutation, deleteDepartmentMutation } = useMutateDepartment();
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟係・チームリスト取得useQuery🌟 ================================
  const {
    data: unitDataArray,
    isLoading: isLoadingQueryUnit,
    refetch: refetchQUeryUnits,
  } = useQueryUnits(userProfileState?.company_id, true);
  console.log("unitDataArray", unitDataArray);

  // useMutation
  // const { createUnitMutation, updateUnitFieldMutation, updateMultipleUnitFieldsMutation, deleteUnitMutation } =
  // useMutateUnit();
  // ================================ ✅係・チームリスト取得useQuery✅ ================================
  // ================================ 🌟事業所・営業所リスト取得useQuery🌟 ================================
  const {
    data: officeDataArray,
    isLoading: isLoadingQueryOffice,
    refetch: refetchQUeryOffices,
  } = useQueryOffices(userProfileState?.company_id, true);
  console.log("officeDataArray", officeDataArray);

  // useMutation
  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅事業所・営業所リスト取得useQuery✅ ================================
  // ======================= 🌟現在の選択した事業部で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  useEffect(() => {
    // unitが存在せず、stateに要素が1つ以上存在しているなら空にする
    if (!unitDataArray?.length && !userProfileState?.assigned_department_id)
      return setFilteredUnitBySelectedDepartment([]);
    // selectの選択中の事業部が空(全て)でunitDataArrayが存在しているならunitDataArrayをそのまま更新する
    if (!userProfileState?.assigned_department_id && unitDataArray) {
      setFilteredUnitBySelectedDepartment(unitDataArray);
      return;
    }
    // 選択中の事業部が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
    if (unitDataArray && userProfileState?.assigned_department_id) {
      const filteredUnitArray = unitDataArray.filter(
        (unit) => unit.created_by_department_id === userProfileState.assigned_department_id
      );
      setFilteredUnitBySelectedDepartment(filteredUnitArray);
    }
  }, [unitDataArray, userProfileState?.assigned_department_id]);
  console.log("フィルターfilteredUnitBySelectedDepartment", filteredUnitBySelectedDepartment);
  console.log("ユーザープロフィール", userProfileState);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // 全角文字を半角に変換する関数
  const toHalfWidth = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal.replace(/[！-～]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
    });
    // .replace(/　/g, " "); // 全角スペースを半角スペースに
  };
  const toHalfWidthAndSpace = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal
      .replace(/[！-～]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
      })
      .replace(/　/g, " "); // 全角スペースを半角スペースに
  };
  const toHalfWidthAndSpaceAndHyphen = (strVal: string) => {
    // 全角文字コードの範囲は65281 - 65374、スペースの全角文字コードは12288
    return strVal
      .replace(/[！-～]/g, (match) => {
        return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
      })
      .replace(/　/g, " ") // 全角スペースを半角スペースに
      .replace(/ー/g, "-"); // 全角ハイフンを半角ハイフンに
  };

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

  // 頭文字のみ抽出
  const getInitial = (name: string) => name[0];

  // company_roll：所有者(契約者)、管理者、マネージャー、メンバー、ゲスト
  const getCompanyRole = (company_role: string | null) => {
    switch (company_role) {
      case "company_owner":
        return "所有者";
        break;
      case "company_admin":
        return "管理者";
        break;
      case "company_manager":
        return "マネージャー";
      case "company_member":
        return "メンバー";
      case "guest":
        return "ゲスト";
      default:
        return "未設定";
        break;
    }
  };

  // Emailチェック関数 引数eventバージョン
  const handleCheckEmail = (e: ChangeEvent<HTMLInputElement>): boolean => {
    if (!emailRef.current) return false;

    const regex = /^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

    // Submit時にemailRefのクラスを初期化
    emailRef.current.classList.remove(`${styles.success}`);
    emailRef.current.classList.remove(`${styles.error}`);
    rowAreaEmailRef.current?.classList.remove(`${styles.error}`);

    const email = e.target.value;

    // ====== メールアドレスチェック ======
    if (email === "") {
      console.log("Modal handleSubmitメールアドレスチェック メール空");
      emailRef.current.classList.remove(`${styles.success}`);
      emailRef.current.classList.remove(`${styles.error}`);
      rowAreaEmailRef.current?.classList.remove(`${styles.error}`);
      if (checkedEmail !== "") setCheckedEmail("");
      // 自分のメールと同じでないのでSameCheckもfalseに
      setCheckedSameUserEmail(false);
      console.log("メール空のためリターン");
      return false;
    }
    console.log("email", email);
    console.log("regex.test(email)", regex.test(email));
    // 有効なメールルート
    if (regex.test(email)) {
      // 自分のメールの場合はInvalidにしてcheckedSameUserEmailをtrueに
      if (email === userProfileState?.email) {
        emailRef.current.classList.add(`${styles.error}`);
        rowAreaEmailRef.current?.classList.add(`${styles.error}`);
        emailRef.current.classList.remove(`${styles.success}`);
        if (checkedEmail !== "Invalid") setCheckedEmail("Invalid");
        if (!checkedSameUserEmail) setCheckedSameUserEmail(true);
        console.log("自分のメールアドレスと同じためInvalid、checkedSameUserEmailをtrueに変更");
        return false;
      }
      emailRef.current.classList.add(`${styles.success}`);
      emailRef.current.classList.remove(`${styles.error}`);
      rowAreaEmailRef.current?.classList.remove(`${styles.error}`);
      if (checkedEmail !== "Valid") setCheckedEmail("Valid");
      // 自分のEmailと違う場合はfalseに
      if (checkedSameUserEmail) setCheckedSameUserEmail(false);
      return true;
    }
    // 無効なメールルート
    else {
      emailRef.current.classList.add(`${styles.error}`);
      rowAreaEmailRef.current?.classList.add(`${styles.error}`);
      emailRef.current.classList.remove(`${styles.success}`);
      if (checkedEmail !== "Invalid") setCheckedEmail("Invalid");
      // 自分のEmailと違う場合はfalseに
      if (checkedSameUserEmail) setCheckedSameUserEmail(false);
      console.log("メールが有効では無いためリターン");
      return false;
    }
  };
  // Emailチェック関数 引数stringバージョン
  const checkEmail = (inputEmail: string): boolean => {
    if (!emailRef.current) return false;

    const regex = /^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

    // Submit時にemailRefのクラスを初期化
    emailRef.current.classList.remove(`${styles.success}`);
    emailRef.current.classList.remove(`${styles.error}`);
    rowAreaEmailRef.current?.classList.remove(`${styles.error}`);

    const email = inputEmail;

    // ====== メールアドレスチェック ======
    if (email === "") {
      console.log("Modal handleSubmitメールアドレスチェック メール空");
      emailRef.current.classList.remove(`${styles.success}`);
      emailRef.current.classList.remove(`${styles.error}`);
      rowAreaEmailRef.current?.classList.remove(`${styles.error}`);
      if (checkedEmail !== "") setCheckedEmail("");
      // 自分のメールと同じでないのでSameCheckもfalseに
      setCheckedSameUserEmail(false);
      console.log("メール空のためリターン");
      return false;
    }
    console.log("email", email);
    console.log("regex.test(email)", regex.test(email));
    // 有効なメールルート
    if (regex.test(email)) {
      // 自分のメールの場合はInvalidにしてcheckedSameUserEmailをtrueに
      if (email === userProfileState?.email) {
        emailRef.current.classList.add(`${styles.error}`);
        rowAreaEmailRef.current?.classList.add(`${styles.error}`);
        emailRef.current.classList.remove(`${styles.success}`);
        if (checkedEmail !== "Invalid") setCheckedEmail("Invalid");
        if (!checkedSameUserEmail) setCheckedSameUserEmail(true);
        console.log("自分のメールアドレスと同じためInvalid、checkedSameUserEmailをtrueに変更");
        return false;
      }
      emailRef.current.classList.add(`${styles.success}`);
      emailRef.current.classList.remove(`${styles.error}`);
      rowAreaEmailRef.current?.classList.remove(`${styles.error}`);
      if (checkedEmail !== "Valid") setCheckedEmail("Valid");
      // 自分のEmailと違う場合はfalseに
      if (checkedSameUserEmail) setCheckedSameUserEmail(false);
      return true;
    }
    // 無効なメールルート
    else {
      emailRef.current.classList.add(`${styles.error}`);
      rowAreaEmailRef.current?.classList.add(`${styles.error}`);
      emailRef.current.classList.remove(`${styles.success}`);
      if (checkedEmail !== "Invalid") setCheckedEmail("Invalid");
      // 自分のEmailと違う場合はfalseに
      if (checkedSameUserEmail) setCheckedSameUserEmail(false);
      console.log("メールが有効では無いためリターン");
      return false;
    }
  };

  // ===================== 🌟ツールチップ 3点リーダーの時にツールチップ表示🌟 =====================
  const setHoveredItemPos = useStore((state) => state.setHoveredItemPos);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display: string;
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({
    e,
    display,
    content,
    content2,
    marginTop = 0,
    // itemsPosition = "start",
    itemsPosition = "center",
  }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);

    setHoveredItemPos({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content,
      content2: content2,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    setHoveredItemPos(null);
  };
  // ==================================================================================

  const [isLoadingRefresh, setIsLoadingRefresh] = useState(false);

  return (
    <>
      {loadingGlobalState && (
        <div className={`${styles.loading_overlay_modal_outside}`}>
          <div className={`${styles.loading_overlay_modal_inside}`}>
            {/* <SpinnerIDS scale={"scale-[0.5]"} /> */}
            <SpinnerComet w="50px" h="50px" s="5px" />
          </div>
        </div>
      )}
      {selectedSettingAccountMenu === "Profile" && (
        <div className={`flex h-full w-full flex-col overflow-y-scroll px-[20px] py-[20px] pr-[80px]`}>
          {/* <div className={`text-[18px] font-bold`}>プロフィール</div> */}
          <div className="flex max-h-[27px] items-center">
            <h2 className={`mr-[10px] text-[18px] font-bold`}>プロフィール</h2>
            <button
              className={`flex-center transition-bg03 relative  h-[26px] min-w-[110px]  cursor-pointer space-x-1  rounded-[4px] border border-solid border-transparent px-[6px] text-[12px]  hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-fc0)] hover:text-[#fff] ${
                styles.fh_text_btn
              } ${
                isLoadingRefresh
                  ? `border-[var(--color-bg-brand-f)] bg-[var(--color-bg-brand-fc0)] text-[#fff]`
                  : `text-[var(--color-text-sub)]`
              }`}
              data-text={`最新の状態にリフレッシュ`}
              onMouseEnter={(e) =>
                handleOpenTooltip({
                  e: e,
                  display: "top",
                  content: "最新の状態にリフレッシュ",
                  marginTop: 8,
                })
              }
              onMouseLeave={handleCloseTooltip}
              onClick={async () => {
                if (isLoadingRefresh) return;
                if (!userProfileState) return alert("エラー：ユーザーデータが見つかりませんでした。");
                console.log("リフレッシュ クリック");
                setIsLoadingRefresh(true);
                //   await queryClient.invalidateQueries({ queryKey: ["companies"] });
                // await refetchMemberAccounts();
                try {
                  const { data: userProfileArray, error: error } = await supabase.rpc("get_user_data", {
                    _user_id: userProfileState.id,
                  });
                  if (error) throw error;
                  console.log("新たなuserProfile", userProfileArray[0]);
                  setUserProfileState(userProfileArray[0] as UserProfileCompanySubscription);
                } catch (e: any) {
                  console.error("最新のユーザーデータの取得に失敗しました。");
                  alert("最新のユーザーデータの取得に失敗しました...🙇‍♀️");
                }
                setTimeout(() => {
                  setIsLoadingRefresh(false);
                }, 1000);
              }}
            >
              {/* <FiRefreshCw /> */}
              {/* {!refetchLoading && <SpinnerIDS scale={"scale-[0.2]"} width={12} height={12} />} */}
              {isLoadingRefresh && (
                <div className="relative">
                  <div className="mr-[2px] h-[12px] w-[12px]"></div>
                  {/* <SpinnerIDS2 fontSize={16} width={16} height={16} color="#fff" /> */}
                  <SpinnerIDS3 fontSize={16} width={16} height={16} color="#fff" left="40%" />
                </div>
              )}
              {!isLoadingRefresh && (
                <div className="flex-center mr-[2px]">
                  <FiRefreshCw />
                </div>
              )}
              <span className="whitespace-nowrap">リフレッシュ</span>
            </button>
          </div>

          <div className={`mt-[30px] flex min-h-[120px] w-full flex-col `}>
            <div className={`${styles.section_title}`}>プロフィール画像</div>
            <div className={`flex h-full w-full items-center justify-between`}>
              <div className="">
                {!avatarUrl && (
                  <label
                    data-text="ユーザー名"
                    htmlFor="avatar"
                    className={`flex-center h-[75px] w-[75px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                    // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    // onMouseLeave={handleCloseTooltip}
                  >
                    {/* <span>K</span> */}
                    <span className={`text-[30px]`}>
                      {userProfileState?.profile_name
                        ? getInitial(userProfileState.profile_name)
                        : `${getInitial("NoName")}`}
                    </span>
                  </label>
                )}
                {avatarUrl && (
                  <label
                    htmlFor="avatar"
                    className={`flex-center group relative h-[75px] w-[75px] cursor-pointer overflow-hidden rounded-full`}
                  >
                    <Image
                      src={avatarUrl}
                      alt="Avatar"
                      className={`h-full w-full object-cover text-[#fff]`}
                      width={75}
                      height={75}
                    />
                    <div className={`transition-base01 absolute inset-0 z-10 group-hover:bg-[#00000060]`}></div>
                  </label>
                )}
              </div>
              <div className="flex">
                {avatarUrl && (
                  <div
                    className={`transition-base01 mr-[10px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={async () => {
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      if (!userProfileState?.avatar_url) return alert("プロフィール画像が見つかりません");
                      useMutateDeleteAvatarImg.mutate(userProfileState.avatar_url);
                    }}
                  >
                    画像を削除
                  </div>
                )}

                <label htmlFor="avatar">
                  <div
                    className={`transition-base01 flex-center max-h-[41px] max-w-[120px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      // setLoading(true);
                    }}
                  >
                    <span>画像を変更</span>
                    {/* {!loading && <span>画像を変更</span>}
                          {loading && <SpinnerIDS scale={"scale-[0.3]"} />} */}
                  </div>
                </label>
              </div>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  useMutateUploadAvatarImg.mutate(e);
                }}
              />
            </div>
          </div>

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 印鑑データ */}
          <div className={`mt-[30px] flex min-h-[120px] w-full flex-col `}>
            <div className={`${styles.section_title}`}>
              <div
                className="flex max-w-max items-center space-x-[9px]"
                onMouseEnter={(e) => {
                  if (infoIconStampRef.current && infoIconStampRef.current.classList.contains(styles.animate_ping)) {
                    infoIconStampRef.current.classList.remove(styles.animate_ping);
                  }
                  handleOpenTooltip({
                    e: e,
                    display: "top",
                    content: "データベース内の印鑑データと紐付けすることで",
                    content2: "見積書の印鑑や承認の押印をデータベース上で処理が可能になります。",
                    marginTop: 33,
                    // marginTop: 8,
                  });
                }}
                onMouseLeave={handleCloseTooltip}
              >
                <span>印鑑データ</span>
                {/* <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-text-brand-f)]`} /> */}
                <div className="flex-center relative h-[16px] w-[16px] rounded-full">
                  <div
                    ref={infoIconStampRef}
                    className={`flex-center absolute left-0 top-0 h-[16px] w-[16px] rounded-full border border-solid border-[var(--color-bg-brand-f)] ${styles.animate_ping}`}
                  ></div>
                  <ImInfo className={`min-h-[16px] min-w-[16px] text-[var(--color-bg-brand-f)]`} />
                </div>
              </div>
            </div>
            <div className={`flex h-full w-full items-center justify-between`}>
              <div className="">
                {!stampUrl && !isLoadingStamp && (
                  <div className={`${styles.section_value}`}>
                    <span>未設定</span>
                  </div>
                )}
                {stampUrl && !isLoadingStamp && (
                  <label
                    className={`flex-center group relative ml-[9px] h-[56px] w-[56px] overflow-hidden rounded-full`}
                  >
                    <Image
                      src={stampUrl}
                      alt="stamp"
                      className={`h-full w-full object-cover text-[#fff]`}
                      width={56}
                      height={56}
                    />
                    <div className={`absolute inset-0 z-10`}></div>
                  </label>
                )}
                {isLoadingStamp && (
                  <label
                    className={`flex-center relative ml-[9px] min-h-[56px] min-w-[56px] overflow-hidden rounded-full`}
                  >
                    <SkeletonLoadingLineCustom rounded="50%" h="56px" w="56px" />
                  </label>
                )}
              </div>

              <div>
                <div
                  className={`transition-bg01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={() => {
                    setEditedSignatureStamp(
                      userProfileState?.signature_stamp_id ? userProfileState.signature_stamp_id : ""
                    );
                    setPrevStampObj(initialStampObj);
                    setStampObj(initialStampObj);
                    setIsOpenSearchStampSideTableBefore(true);
                    setTimeout(() => {
                      setIsOpenSearchStampSideTable(true);
                    }, 100);
                    handleCloseTooltip();
                  }}
                  onMouseEnter={(e) =>
                    handleOpenTooltip({
                      e: e,
                      display: "top",
                      content: "データベース内の印鑑データと紐付けすることで",
                      content2: "見積書の印鑑や承認の押印をデータベース上で処理が可能になります。",
                      // marginTop: 33,
                      marginTop: 18,
                    })
                  }
                  onMouseLeave={handleCloseTooltip}
                >
                  {!userProfileState?.assigned_signature_stamp_id && <span>設定</span>}
                  {userProfileState?.assigned_signature_stamp_id && <span>編集</span>}
                </div>
              </div>
            </div>
          </div>

          {/* <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>印鑑データ</div>
            {!editSignatureStampMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.signature_stamp_id ? "設定済み" : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedSignatureStamp(
                        userProfileState?.signature_stamp_id ? userProfileState.signature_stamp_id : ""
                      );
                      setPrevStampObj(initialStampObj);
                      setStampObj(initialStampObj);
                      setIsOpenSearchStampSideTableBefore(true);
                      setTimeout(() => {
                        setIsOpenSearchStampSideTable(true);
                      }, 100);
                    }}
                  >
                    {!userProfileState?.signature_stamp_id && <span>編集</span>}
                    {userProfileState?.signature_stamp_id && <span>設定</span>}
                  </div>
                </div>
              </div>
            )}
          </div> */}
          {/* 印鑑データここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 名前 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>名前</div>
            {!editNameMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.profile_name ? userProfileState?.profile_name : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedName(userProfileState?.profile_name ? userProfileState.profile_name : "");
                      setEditNameMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editNameMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <input
                  type="text"
                  placeholder="名前を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  // onBlur={() => setEditedName(toHalfWidth(editedName.trim()))}
                  onBlur={() => setEditedName(toHalfWidthAndSpace(editedName.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedName("");
                      setEditNameMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedName === "") {
                        alert("有効な名前を入力してください");
                        return;
                      }
                      if (userProfileState?.profile_name === editedName) {
                        setEditNameMode(false);
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      setLoadingGlobalState(true);
                      const { data: profileData, error } = await supabase
                        .from("profiles")
                        .update({ profile_name: editedName })
                        .eq("id", userProfileState.id)
                        .select("profile_name")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditNameMode(false);
                          alert(error.message);
                          console.log("UPDATEエラー", error.message);
                          toast.error("名前の更新に失敗しました!", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            // theme: `${theme === "light" ? "light" : "dark"}`,
                          });
                        }, 500);
                        return;
                      }
                      setTimeout(() => {
                        console.log("UPDATE成功 profileData", profileData);
                        console.log("UPDATE成功 profileData.profile_name", profileData.profile_name);
                        setUserProfileState({
                          // ...(profileData as UserProfile),
                          ...(userProfileState as UserProfileCompanySubscription),
                          profile_name: profileData.profile_name ? profileData.profile_name : null,
                        });
                        setLoadingGlobalState(false);
                        setEditNameMode(false);
                        toast.success("名前の更新が完了しました!", {
                          position: "top-right",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          // theme: `${theme === "light" ? "light" : "dark"}`,
                        });
                      }, 500);
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 名前ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* Email */}
          <div ref={rowAreaEmailRef} className={`mt-[20px] flex min-h-[95px] w-full flex-col ${styles.row_area_email}`}>
            {/* タイトルエリア */}
            <div className="relative flex items-start">
              <div className={`${styles.section_title}`}>Email</div>
              {editEmailMode && (
                <div className="absolute left-[60px] top-0 flex flex-col text-[11px] text-[var(--main-color-tk)]">
                  <p>※メールアドレス変更を保存後に一度ログアウトします。</p>
                  <p>
                    　新たなメールアドレス宛に届く変更確認メールから「変更を確定」を押してログインすることで変更が完了となります。
                  </p>
                </div>
              )}
            </div>
            {!editEmailMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.email ? userProfileState.email : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedEmail(userProfileState?.email ? userProfileState.email : "");
                      setEditEmailMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editEmailMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className="flex w-full flex-col">
                  <input
                    // ref={emailRef}
                    ref={(ref) => (emailRef.current = ref)}
                    type="text"
                    placeholder="メールを入力してください"
                    required
                    autoFocus
                    className={`${styles.input_box}`}
                    value={editedEmail}
                    onChange={(e) => {
                      if (checkedEmail === "Invalid") {
                        emailRef.current?.classList.remove(`${styles.success}`);
                        emailRef.current?.classList.remove(`${styles.error}`);
                        rowAreaEmailRef.current?.classList.remove(`${styles.error}`);
                        setCheckedEmail("");
                        if (checkedSameUserEmail) setCheckedSameUserEmail(false);
                      }
                      setEditedEmail(e.target.value);
                    }}
                    //   onBlur={() => setMainPhoneNumber(toHalfWidth(mainPhoneNumber.trim()))}
                    onBlur={(e) => handleCheckEmail(e)}
                  />
                  {checkedEmail === "Invalid" && !checkedSameUserEmail && (
                    <span className={styles.msg}>有効なメールアドレスを入力してください</span>
                  )}
                  {checkedEmail === "Invalid" && checkedSameUserEmail && (
                    <span className={styles.msg}>現在のメールアドレスと同じです。</span>
                  )}
                </div>
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (checkedEmail === "Invalid") {
                        emailRef.current?.classList.remove(`${styles.success}`);
                        emailRef.current?.classList.remove(`${styles.error}`);
                        rowAreaEmailRef.current?.classList.remove(`${styles.error}`);
                        if (checkedSameUserEmail) setCheckedSameUserEmail(false);
                      }
                      setEditedEmail("");
                      setEditEmailMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      // setLoadingGlobalState(true);
                      // await updateUserEmail.mutate({ _email: editedEmail });
                      // setEditEmailMode(false);
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");

                      if (editedEmail === "") return setEditEmailMode(false);
                      // if (userProfileState?.email === editedEmail) return

                      if (checkedEmail === "Invalid" && checkedSameUserEmail)
                        return console.log("Invalid 同じメールアドレス", editedEmail);

                      if (checkedEmail === "Invalid" && !checkedSameUserEmail)
                        return console.log("Invalid", editedEmail);

                      if (checkedEmail === "Valid" && !checkedSameUserEmail) {
                        console.log("valid", editedEmail);
                        const result = checkEmail(editedEmail);
                        console.log("result", result);
                        if (!result) return;
                        if (submittedErrorEmail.includes(editedEmail)) {
                          return alert("一度送信済みのEmailです。別のEmailをお試しください。");
                        }
                        const sentEmailArray = [...submittedErrorEmail, editedEmail];
                        setSubmittedErrorEmail(sentEmailArray);
                        setLoadingGlobalState(true);
                        await updateUserEmail.mutate({ _email: editedEmail });
                        setEditEmailMode(false);
                        // ============================🌟🌟🌟🌟
                        // await updateUserEmail.mutate({ _email: editedEmail, dispatch: setEditEmailMode });
                        // setLoadingGlobalState(false);
                        // setLoadingGlobalState(true);
                        // const { data: profileData, error } = await supabase
                        //   .from("profiles")
                        //   .update({ email: editedEmail })
                        //   .eq("id", userProfileState.id)
                        //   .select("email")
                        //   .single();
                        // if (error) {
                        //   setTimeout(() => {
                        //     setLoadingGlobalState(false);
                        //     setEditEmailMode(false);
                        //     alert(error.message);
                        //     console.log("メールUPDATEエラー", error.message);
                        //     toast.error("メールの更新に失敗しました!");
                        //   }, 500);
                        //   return;
                        // }
                        // setTimeout(() => {
                        //   console.log("メールUPDATE成功 profileData", profileData);
                        //   setUserProfileState({
                        //     ...(userProfileState as UserProfileCompanySubscription),
                        //     email: profileData.email ? profileData.email : null,
                        //   });
                        //   setLoadingGlobalState(false);
                        //   setEditEmailMode(false);
                        //   toast.success("メールの更新が完了しました!");
                        // }, 500);
                      }
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Emailここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 電話番号 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>電話番号</div>
            {!editTELMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.direct_line ? userProfileState.direct_line : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedTEL(userProfileState?.direct_line ? userProfileState.direct_line : "");
                      setEditTELMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editTELMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <input
                  type="text"
                  placeholder="電話番号を入力してください　例：080-0000-0000"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedTEL}
                  onChange={(e) => setEditedTEL(e.target.value)}
                  onBlur={() => setEditedTEL(toHalfWidthAndSpaceAndHyphen(editedTEL.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedTEL("");
                      setEditTELMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedTEL === "") {
                        alert("有効な電話番号を入力してください");
                        return;
                      }
                      if (userProfileState?.direct_line === editedTEL) {
                        setEditTELMode(false);
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      setLoadingGlobalState(true);
                      const { data: profileData, error } = await supabase
                        .from("profiles")
                        .update({ direct_line: editedTEL })
                        .eq("id", userProfileState.id)
                        .select("direct_line")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditTELMode(false);
                          alert(error.message);
                          console.log("電話番号UPDATEエラー", error.message);
                          toast.error("電話番号の更新に失敗しました!", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            // theme: `${theme === "light" ? "light" : "dark"}`,
                          });
                        }, 500);
                        return;
                      }
                      setTimeout(() => {
                        console.log("電話番号UPDATE成功 profileData", profileData);
                        setUserProfileState({
                          ...(userProfileState as UserProfileCompanySubscription),
                          direct_line: profileData.direct_line ? profileData.direct_line : null,
                        });
                        setLoadingGlobalState(false);
                        setEditTELMode(false);
                        toast.success("電話番号の更新が完了しました!", {
                          position: "top-right",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          // theme: `${theme === "light" ? "light" : "dark"}`,
                        });
                      }, 500);
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 電話番号ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 事業部 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            {/* <div className={`${styles.section_title}`}>事業部</div> */}
            {/* タイトルエリア */}
            <div className="relative flex items-start">
              <div className={`${styles.section_title}`}>事業部</div>
              {(!departmentDataArray || departmentDataArray.length === 0) && (
                <div className="absolute left-[60px] top-0 flex flex-col text-[11px] text-[var(--main-color-tk)]">
                  <p>※事業部リストが作成されていません。</p>
                  <p>　事業部ごとにデータをを統一、分析する場合は「会社・チーム」から事業部を作成してください。</p>
                </div>
              )}
            </div>
            {!editDepartmentMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                {!userProfileState?.assigned_department_name && (
                  <div className={`${styles.section_value}`}>
                    {userProfileState?.department ? userProfileState.department : "未設定"}
                  </div>
                )}
                {userProfileState?.assigned_department_name && (
                  <div className={`${styles.section_value}`}>
                    {userProfileState?.assigned_department_name ? userProfileState.assigned_department_name : "未設定"}
                  </div>
                )}
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (!officeDataArray || officeDataArray.length === 0) {
                        alert("事業部リスト未設定です。先に「会社・チーム」から事業部を作成してください。");
                        return;
                      }
                      if (!!departmentDataArray && departmentDataArray.length >= 1) {
                        if (userProfileState?.assigned_department_id) {
                          const selectedDepartmentObj = departmentDataArray.find(
                            (obj) => obj.id === userProfileState.assigned_department_id
                          );
                          console.log(
                            "🔥selectedDepartmentObj",
                            selectedDepartmentObj,
                            "userProfileState?.assigned_department_id",
                            userProfileState.assigned_department_id
                          );
                          setSelectedDepartment(selectedDepartmentObj ? selectedDepartmentObj : departmentDataArray[0]);
                        } else {
                          setSelectedDepartment(departmentDataArray[0]);
                        }
                      } else {
                        setEditedDepartment(userProfileState?.department ? userProfileState.department : "");
                      }
                      setEditDepartmentMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editDepartmentMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                {(!departmentDataArray || departmentDataArray?.length === 0 || !isSelectModeDepartment) && (
                  <input
                    type="text"
                    placeholder="事業部を入力してください"
                    required
                    autoFocus
                    className={`${styles.input_box}`}
                    value={editedDepartment}
                    onChange={(e) => setEditedDepartment(e.target.value)}
                    onBlur={() => setEditedDepartment(toHalfWidth(editedDepartment.trim()))}
                  />
                )}
                {!!departmentDataArray && departmentDataArray.length >= 1 && isSelectModeDepartment && (
                  <select
                    className={`${styles.select_box}`}
                    value={!!selectedDepartment ? selectedDepartment.id : ""}
                    onChange={(e) => {
                      if (!departmentDataArray) return;
                      const selectedDepartmentObj = departmentDataArray.find((obj) => obj.id === e.target.value);
                      console.log("e.target.value", e.target.value, "selectedDepartmentObj", selectedDepartmentObj);
                      if (selectedDepartmentObj === undefined)
                        return alert("エラー：事業部データの取得にエラーが発生しました。");
                      setSelectedDepartment(selectedDepartmentObj);
                    }}
                  >
                    {/* <option value="">すべての事業部</option> */}
                    {!!departmentDataArray &&
                      [...departmentDataArray]
                        .sort((a, b) => {
                          if (a.department_name === null || b.department_name === null) return 0;
                          return (
                            a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en") ?? 0
                          );
                        })
                        .map((department, index) => (
                          <option key={department.id} value={department.id}>
                            {department.department_name}
                          </option>
                        ))}
                    {/* {!!departmentDataArray &&
                      [...departmentDataArray]
                        .sort((a, b) =>
                          a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en")
                        )
                        .map((department, index) => (
                          <option key={department.id} value={department.id}>
                            {department.department_name}
                          </option>
                        ))} */}
                  </select>
                )}
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (!isSelectModeDepartment) {
                        setEditedDepartment("");
                      } else {
                        setSelectedDepartment(null);
                      }
                      setEditDepartmentMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      if (!isSelectModeDepartment) {
                        // inputタグで入力ルート
                        if (editedDepartment === "") {
                          alert("有効な事業部を入力してください");
                          return;
                        }
                        if (userProfileState?.department === editedDepartment) {
                          setEditDepartmentMode(false);
                          return;
                        }
                        setLoadingGlobalState(true);
                        const { data: profileData, error } = await supabase
                          .from("profiles")
                          .update({ department: editedDepartment })
                          .eq("id", userProfileState.id)
                          .select("department")
                          .single();

                        if (error) {
                          setTimeout(() => {
                            setLoadingGlobalState(false);
                            setEditDepartmentMode(false);
                            console.log("事業部UPDATEエラー", error.message);
                            toast.error("事業部の更新に失敗しました🙇‍♀️");
                          }, 500);
                          return;
                        }
                        setTimeout(() => {
                          console.log("事業部UPDATE成功 profileData", profileData);
                          setUserProfileState({
                            ...(userProfileState as UserProfileCompanySubscription),
                            department: profileData.department ? profileData.department : null,
                          });
                          setLoadingGlobalState(false);
                          setEditDepartmentMode(false);
                          toast.success("事業部の更新が完了しました🌟");
                        }, 500);
                      } else {
                        // セレクトボックスから選択ルート
                        if (!selectedDepartment) return alert("有効な事業部を選択してください。");
                        // まだdepartment_assignmentsテーブルに割り当てられてない場合には、INSERT
                        if (!userProfileState?.assigned_department_id) {
                          try {
                            setLoadingGlobalState(true);
                            const insertPayload = {
                              created_by_company_id: userProfileState.company_id,
                              to_user_id: userProfileState.id,
                              department_id: selectedDepartment.id,
                            };
                            const { data: insertData, error: insertError } = await supabase
                              .from("department_assignments")
                              .insert(insertPayload);

                            if (insertError) throw insertError;

                            console.log("事業部UPDATE成功 insertData", insertData);
                            setUserProfileState({
                              ...(userProfileState as UserProfileCompanySubscription),
                              department: selectedDepartment.department_name
                                ? selectedDepartment.department_name
                                : null,
                              assigned_department_id: selectedDepartment.id,
                              assigned_department_name: selectedDepartment.department_name,
                            });
                            toast.success("事業部の更新が完了しました🌟");
                          } catch (e: any) {
                            console.error("事業部UPDATEエラー", e);
                            toast.error("事業部の更新に失敗しました🙇‍♀️");
                          }
                          setLoadingGlobalState(false);
                          setEditDepartmentMode(false);
                          return;
                        } else {
                          // 既にdepartment_assignmentsに割り当てられている場合は、department_idを変更する
                          try {
                            setLoadingGlobalState(true);
                            // 既に係unit_idが設定されている場合は事業部の変更に伴い係をリセットする
                            // unitが既に割り当てられている場合は事業部が変わるためunit_idをnullにする
                            if (userProfileState.assigned_unit_id) {
                              const updatePayload = {
                                _department_id: selectedDepartment.id,
                                _company_id: userProfileState.company_id,
                                _user_id: userProfileState.id,
                                _unit_id: userProfileState.assigned_unit_id,
                              };
                              const { error: updateError } = await supabase.rpc(
                                "update_department_delete_unit",
                                updatePayload
                              );
                              if (updateError) throw updateError;

                              setUserProfileState({
                                ...(userProfileState as UserProfileCompanySubscription),
                                department: selectedDepartment.department_name
                                  ? selectedDepartment.department_name
                                  : null,
                                assigned_department_id: selectedDepartment.id,
                                assigned_department_name: selectedDepartment.department_name,
                                unit: null,
                                assigned_unit_id: null,
                                assigned_unit_name: null,
                              });
                            } else {
                              // まだ係unit_idが未設定の場合には事業部のみ更新する
                              const updatePayload = {
                                department_id: selectedDepartment.id,
                              };
                              const { data: updateData, error: updateError } = await supabase
                                .from("department_assignments")
                                .update(updatePayload)
                                .eq("to_user_id", userProfileState.id)
                                .eq("created_by_company_id", userProfileState.company_id)
                                .select();

                              if (updateError) throw updateError;

                              console.log("事業部UPDATE成功 updateData", updateData);

                              setUserProfileState({
                                ...(userProfileState as UserProfileCompanySubscription),
                                department: selectedDepartment.department_name
                                  ? selectedDepartment.department_name
                                  : null,
                                assigned_department_id: selectedDepartment.id,
                                assigned_department_name: selectedDepartment.department_name,
                              });
                            }

                            toast.success("事業部の更新が完了しました🌟");
                          } catch (e: any) {
                            console.error("事業部UPDATEエラー", e);
                            toast.error("事業部の更新に失敗しました🙇‍♀️");
                          }
                          setLoadingGlobalState(false);
                          setEditDepartmentMode(false);
                        }
                      }
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 事業部ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 係・チーム */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            {/* <div className={`${styles.section_title}`}>係・チーム</div> */}
            {/* タイトルエリア */}
            <div className="relative flex items-start">
              <div className={`${styles.section_title}`}>係・チーム</div>
              {(!unitDataArray || unitDataArray.length === 0) && (
                <div className="absolute left-[80px] top-0 flex flex-col text-[11px] text-[var(--main-color-tk)]">
                  <p>※係・チームリストが作成されていません。</p>
                  <p>
                    　係・チームごとにデータを統一、分析する場合は「会社・チーム」から係・チームを作成してください。
                  </p>
                </div>
              )}
            </div>
            {!editUnitMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                {!userProfileState?.assigned_unit_name && (
                  <div className={`${styles.section_value}`}>
                    {userProfileState?.unit ? userProfileState.unit : "未設定"}
                  </div>
                )}
                {userProfileState?.assigned_unit_name && (
                  <div className={`${styles.section_value}`}>{userProfileState.assigned_unit_name}</div>
                )}
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (!unitDataArray || unitDataArray.length === 0) {
                        alert("係・チームリスト未設定です。先に「会社・チーム」から係・チームを作成してください。");
                        return;
                      }
                      // setEditedUnit(userProfileState?.unit ? userProfileState.unit : "");
                      // setEditUnitMode(true);
                      if (!userProfileState?.assigned_department_id) return alert("先に事業部を設定してください。");
                      if (!filteredUnitBySelectedDepartment || filteredUnitBySelectedDepartment?.length === 0)
                        return alert(
                          "係・チームデータが存在しません。先に左メニューの「会社・チーム」から「係・チーム」を作成してください。"
                        );
                      if (!!filteredUnitBySelectedDepartment && filteredUnitBySelectedDepartment.length >= 1) {
                        if (userProfileState?.assigned_unit_id) {
                          const selectedUnitObj = filteredUnitBySelectedDepartment.find(
                            (obj) => obj.id === userProfileState.assigned_unit_id
                          );
                          setSelectedUnit(selectedUnitObj ? selectedUnitObj : filteredUnitBySelectedDepartment[0]);
                        } else {
                          setSelectedUnit(filteredUnitBySelectedDepartment[0]);
                        }
                      } else {
                        setEditedDepartment(userProfileState?.unit ? userProfileState.unit : "");
                      }
                      setEditUnitMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editUnitMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                {(!filteredUnitBySelectedDepartment ||
                  filteredUnitBySelectedDepartment?.length === 0 ||
                  !isSelectModeUnit) && (
                  <input
                    type="text"
                    placeholder="係・チームを入力してください"
                    required
                    autoFocus
                    className={`${styles.input_box}`}
                    value={editedUnit}
                    onChange={(e) => setEditedUnit(e.target.value)}
                    onBlur={() => setEditedUnit(toHalfWidth(editedUnit.trim()))}
                  />
                )}
                {(!filteredUnitBySelectedDepartment || filteredUnitBySelectedDepartment?.length === 0) &&
                  isSelectModeUnit && <div>係・チームデータが存在しません。</div>}
                {!!filteredUnitBySelectedDepartment &&
                  filteredUnitBySelectedDepartment.length >= 1 &&
                  isSelectModeUnit && (
                    <select
                      className={`${styles.select_box}`}
                      value={!!selectedUnit ? selectedUnit.id : ""}
                      onChange={(e) => {
                        if (!filteredUnitBySelectedDepartment) return;
                        const selectedUnitObj = filteredUnitBySelectedDepartment.find(
                          (obj) => obj.id === e.target.value
                        );
                        console.log("e.target.value", e.target.value, "selectedUnitObj", selectedUnitObj);
                        if (selectedUnitObj === undefined)
                          return alert("エラー：係・チームデータの取得にエラーが発生しました。");
                        setSelectedUnit(selectedUnitObj);
                      }}
                    >
                      {/* <option value="">すべての事業部</option> */}
                      {
                        // !!unitDataArray &&
                        //   [...unitDataArray]
                        !!filteredUnitBySelectedDepartment &&
                          [...filteredUnitBySelectedDepartment]
                            .sort((a, b) => {
                              if (a.unit_name === null || b.unit_name === null) return 0;
                              return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en") ?? 0;
                            })
                            .map((unit, index) => (
                              <option key={unit.id} value={unit.id}>
                                {unit.unit_name}
                              </option>
                            ))
                      }
                    </select>
                  )}
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (isSelectModeUnit) {
                        setEditedUnit("");
                      } else {
                        setSelectedUnit(null);
                      }
                      setEditUnitMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      if (!isSelectModeUnit) {
                        if (editedUnit === "") {
                          alert("有効な係・チームを入力してください");
                          return;
                        }
                        if (userProfileState?.unit === editedUnit) {
                          setEditUnitMode(false);
                          return;
                        }

                        setLoadingGlobalState(true);
                        const { data: profileData, error } = await supabase
                          .from("profiles")
                          .update({ unit: editedUnit })
                          .eq("id", userProfileState.id)
                          .select("unit")
                          .single();

                        if (error) {
                          setTimeout(() => {
                            setLoadingGlobalState(false);
                            setEditUnitMode(false);
                            alert(error.message);
                            console.log("係・チームUPDATEエラー", error.message);
                            toast.error("係・チームの更新に失敗しました!", {
                              position: "top-right",
                              autoClose: 3000,
                              hideProgressBar: false,
                              closeOnClick: true,
                              pauseOnHover: true,
                              draggable: true,
                              progress: undefined,
                              // theme: `${theme === "light" ? "light" : "dark"}`,
                            });
                          }, 500);
                          return;
                        }
                        setTimeout(() => {
                          console.log("係・チームUPDATE成功 profileData", profileData);
                          setUserProfileState({
                            ...(userProfileState as UserProfileCompanySubscription),
                            unit: profileData.unit ? profileData.unit : null,
                          });
                          setLoadingGlobalState(false);
                          setEditUnitMode(false);
                          toast.success("係・チームの更新が完了しました!");
                        }, 500);
                      } else {
                        // 🔹セレクトボックスから選択ルート
                        console.log("係🔹セレクトボックスから選択ルート");
                        if (!selectedUnit) return alert("有効な係・チームを選択してください。");
                        if (userProfileState?.assigned_unit_name === selectedUnit.unit_name) {
                          setEditUnitMode(false);
                          return;
                        }
                        // 🔹🔹まだunit_assignmentsテーブルに割り当てられてない場合には、INSERT
                        if (!userProfileState?.assigned_unit_id) {
                          console.log(
                            "係🔹セレクトボックスから選択ルート userProfileState?.assigned_unit_idなしINSERT"
                          );
                          try {
                            setLoadingGlobalState(true);
                            const insertPayload = {
                              created_by_company_id: userProfileState.company_id,
                              created_by_department_id: selectedUnit.created_by_department_id,
                              to_user_id: userProfileState.id,
                              unit_id: selectedUnit.id,
                            };
                            const { data: insertData, error: insertError } = await supabase
                              .from("unit_assignments")
                              .insert(insertPayload);

                            if (insertError) throw insertError;

                            console.log("係・チームUPDATE成功 insertData", insertData);
                            setUserProfileState({
                              ...(userProfileState as UserProfileCompanySubscription),
                              unit: selectedUnit.unit_name ? selectedUnit.unit_name : null,
                              assigned_unit_id: selectedUnit.id,
                              assigned_unit_name: selectedUnit.unit_name,
                            });
                            toast.success("係・チームの作成が完了しました🌟");
                          } catch (e: any) {
                            console.error("係・チームUPDATEエラー", e);
                            toast.error("係・チームの作成に失敗しました🙇‍♀️");
                          }
                          setLoadingGlobalState(false);
                          setEditUnitMode(false);
                          return;
                        } else {
                          // 🔹🔹既にunit_assignmentsに割り当てられている場合は、unit_idを変更する
                          console.log(
                            "係🔹セレクトボックスから選択ルート userProfileState?.assigned_unit_id有りUPDATE",
                            userProfileState.assigned_department_id
                          );
                          try {
                            setLoadingGlobalState(true);
                            const updatePayload = {
                              unit_id: selectedUnit.id,
                            };
                            const { data: updateData, error: updateError } = await supabase
                              .from("unit_assignments")
                              .update(updatePayload)
                              .eq("to_user_id", userProfileState.id)
                              .eq("created_by_company_id", userProfileState.company_id)
                              .eq("created_by_department_id", userProfileState.assigned_department_id)
                              .select();

                            if (updateError) throw updateError;

                            console.log("係・チームUPDATE成功 updateData", updateData);
                            setUserProfileState({
                              ...(userProfileState as UserProfileCompanySubscription),
                              unit: selectedUnit.unit_name ? selectedUnit.unit_name : null,
                              assigned_unit_id: selectedUnit.id,
                              assigned_unit_name: selectedUnit.unit_name,
                            });

                            toast.success("係・チームの更新が完了しました🌟");
                          } catch (e: any) {
                            console.error("係・チームUPDATEエラー", e);
                            toast.error("係・チームの更新に失敗しました🙇‍♀️");
                          }
                          setLoadingGlobalState(false);
                          setEditUnitMode(false);
                        }
                      }
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 係・チームここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 職種 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>職種</div>
            {!editOccupationMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.occupation ? userProfileState.occupation : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedOccupation(userProfileState?.occupation ? userProfileState.occupation : "経営者/CEO");
                      setEditOccupationMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editOccupationMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <select
                  className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                  value={editedOccupation}
                  onChange={(e) => setEditedOccupation(e.target.value)}
                >
                  {/* <option value="経営者/CEO">経営者/CEO</option>
                  <option value="役員">役員</option>
                  <option value="営業">営業</option>
                  <option value="マーケティング">マーケティング</option>
                  <option value="人事">人事</option>
                  <option value="法務">法務</option>
                  <option value="財務">財務</option>
                  <option value="エンジニアリング">エンジニアリング</option>
                  <option value="データサイエンス">データサイエンス</option>
                  <option value="総務">総務</option>
                  <option value="経理">経理</option>
                  <option value="購買">購買</option>
                  <option value="事務">事務</option>
                  <option value="情報システム・IT管理者">情報システム・IT管理者</option>
                  <option value="広報">広報</option>
                  <option value="プロジェクト管理">プロジェクト管理</option>
                  <option value="プロダクト管理">プロダクト管理</option>
                  <option value="プロダクトデザイン">プロダクトデザイン</option>
                  <option value="カスタマーサービス">カスタマーサービス</option>
                  <option value="学生">学生</option>
                  <option value="教育関係者">教育関係者</option>
                  <option value="その他">その他</option> */}
                  {optionsOccupation.map((option) => (
                    <option key={option} value={option}>
                      {getOccupationName(option)}
                    </option>
                  ))}
                </select>
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedOccupation("");
                      setEditOccupationMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedOccupation === "") {
                        alert("有効な職種を入力してください");
                        return;
                      }
                      if (userProfileState?.occupation === editedOccupation) {
                        setEditOccupationMode(false);
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      if (editedOccupation === userProfileState.occupation) {
                        setEditOccupationMode(false);
                        return;
                      }
                      setLoadingGlobalState(true);
                      const { data: profileData, error } = await supabase
                        .from("profiles")
                        .update({ occupation: editedOccupation })
                        .eq("id", userProfileState.id)
                        .select("occupation")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditOccupationMode(false);
                          alert(error.message);
                          console.log("職種UPDATEエラー", error.message);
                          toast.error("職種の更新に失敗しました!", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            // theme: `${theme === "light" ? "light" : "dark"}`,
                          });
                        }, 500);
                        return;
                      }
                      setTimeout(() => {
                        console.log("職種UPDATE成功 profileData", profileData);
                        setUserProfileState({
                          ...(userProfileState as UserProfileCompanySubscription),
                          occupation: profileData.occupation ? profileData.occupation : null,
                        });
                        setLoadingGlobalState(false);
                        setEditOccupationMode(false);
                        toast.success("職種の更新が完了しました!", {
                          position: "top-right",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          // theme: `${theme === "light" ? "light" : "dark"}`,
                        });
                      }, 500);
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 職種ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 役職クラス */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>役職クラス</div>
            {!editPositionClassMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.position_class
                    ? getPositionClassNameForCustomer(userProfileState.position_class)
                    : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedPositionClass(
                        userProfileState?.position_class ? userProfileState.position_class : "1 代表者"
                      );
                      setEditPositionClassMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editPositionClassMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <select
                  className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                  value={editedPositionClass}
                  onChange={(e) => setEditedPositionClass(e.target.value)}
                >
                  <option value="">回答を選択してください</option>
                  {/* <option value="1 代表者">代表者</option>
                  <option value="2 取締役/役員">取締役/役員</option>
                  <option value="3 部長">部長</option>
                  <option value="4 課長">課長</option>
                  <option value="5 チームメンバー">チームメンバー</option>
                  <option value="6 所長・工場長">所長・工場長</option>
                  <option value="7 フリーランス・個人事業主">フリーランス・個人事業主</option> */}
                  {optionsPositionsClassForCustomer.map((option) => (
                    <option key={option} value={option}>
                      {getPositionClassNameForCustomer(option)}
                    </option>
                  ))}
                </select>
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedPositionClass("");
                      setEditPositionClassMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedPositionClass === "") {
                        alert("有効な役職クラスを入力してください");
                        return;
                      }
                      if (userProfileState?.position_class === editedPositionClass) {
                        setEditPositionClassMode(false);
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      if (editedPositionClass === userProfileState.position_class) {
                        setEditPositionClassMode(false);
                        return;
                      }
                      setLoadingGlobalState(true);
                      const { data: profileData, error } = await supabase
                        .from("profiles")
                        .update({ position_class: editedPositionClass })
                        .eq("id", userProfileState.id)
                        .select("position_class")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditPositionClassMode(false);
                          alert(error.message);
                          console.log("役職クラスUPDATEエラー", error.message);
                          toast.error("役職クラスの更新に失敗しました!", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            // theme: `${theme === "light" ? "light" : "dark"}`,
                          });
                        }, 500);
                        return;
                      }
                      setTimeout(() => {
                        console.log("役職クラスUPDATE成功 profileData", profileData);
                        setUserProfileState({
                          ...(userProfileState as UserProfileCompanySubscription),
                          position_class: profileData.position_class ? profileData.position_class : null,
                        });
                        setLoadingGlobalState(false);
                        setEditPositionClassMode(false);
                        toast.success("役職クラスの更新が完了しました!", {
                          position: "top-right",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          // theme: `${theme === "light" ? "light" : "dark"}`,
                        });
                      }, 500);
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 役職クラスここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 役職名 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>役職名</div>
            {!editPositionNameMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.position_name ? userProfileState.position_name : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedPositionName(userProfileState?.position_name ? userProfileState.position_name : "");
                      setEditPositionNameMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editPositionNameMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <input
                  type="text"
                  placeholder="役職名を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedPositionName}
                  onChange={(e) => setEditedPositionName(e.target.value)}
                  onBlur={() => setEditedPositionName(toHalfWidth(editedPositionName.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedPositionName("");
                      setEditPositionNameMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedPositionName === "") {
                        alert("有効な役職名を入力してください");
                        return;
                      }
                      if (userProfileState?.position_name === editedPositionName) {
                        setEditPositionNameMode(false);
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      setLoadingGlobalState(true);
                      const { data: profileData, error } = await supabase
                        .from("profiles")
                        .update({ position_name: editedPositionName })
                        .eq("id", userProfileState.id)
                        .select("position_name")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditPositionNameMode(false);
                          alert(error.message);
                          console.log("役職名UPDATEエラー", error.message);
                          toast.error("役職名の更新に失敗しました!", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            // theme: `${theme === "light" ? "light" : "dark"}`,
                          });
                        }, 500);
                        return;
                      }
                      setTimeout(() => {
                        console.log("役職名UPDATE成功 profileData", profileData);
                        setUserProfileState({
                          ...(userProfileState as UserProfileCompanySubscription),
                          position_name: profileData.position_name ? profileData.position_name : null,
                        });
                        setLoadingGlobalState(false);
                        setEditPositionNameMode(false);
                        toast.success("役職名の更新が完了しました!", {
                          position: "top-right",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          // theme: `${theme === "light" ? "light" : "dark"}`,
                        });
                      }, 500);
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 役職名ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 所属事業所・営業所 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            {/* <div className={`${styles.section_title}`}>所属事業所・営業所</div> */}
            {/* タイトルエリア */}
            <div className="relative flex items-start">
              <div className={`${styles.section_title}`}>所属事業所・営業所</div>
              {(!officeDataArray || officeDataArray.length === 0) && (
                <div className="absolute left-[140px] top-0 flex flex-col text-[11px] text-[var(--main-color-tk)]">
                  <p>※事業所リストが作成されていません。</p>
                  <p>
                    　事業所・営業所ごとにデータを統一、分析する場合は「会社・チーム」から事業所・営業所を作成してください。
                  </p>
                </div>
              )}
            </div>
            {!editOfficeMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                {!userProfileState?.assigned_office_name && (
                  <div className={`${styles.section_value}`}>
                    {userProfileState?.office ? userProfileState.office : "未設定"}
                  </div>
                )}
                {userProfileState?.assigned_office_name && (
                  <div className={`${styles.section_value}`}>
                    {userProfileState?.assigned_office_name ? userProfileState.assigned_office_name : "未設定"}
                  </div>
                )}
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (!officeDataArray || officeDataArray.length === 0) {
                        alert("事業所リスト未設定です。先に「会社・チーム」から事業所・営業所を作成してください。");
                        return;
                      }
                      // setEditedOffice(userProfileState?.office ? userProfileState.office : "");
                      // setEditOfficeMode(true);
                      if (!!officeDataArray && officeDataArray.length >= 1) {
                        if (userProfileState?.assigned_office_id) {
                          const selectedOfficeObj = officeDataArray.find(
                            (obj) => obj.id === userProfileState.assigned_office_id
                          );
                          console.log(
                            "🔥selectedOfficeObj",
                            selectedOfficeObj,
                            "userProfileState?.assigned_office_id",
                            userProfileState.assigned_office_id
                          );
                          setSelectedOffice(selectedOfficeObj ? selectedOfficeObj : officeDataArray[0]);
                        } else {
                          // const topSelectedOffice = [...officeDataArray].sort((a, b) =>
                          //   a.office_name.localeCompare(b.office_name, language === "ja" ? "ja" : "en")
                          // )[0];
                          const topSelectedOffice = [...officeDataArray].sort((a, b) => {
                            if (a.office_name === null || b.office_name === null) return 0;
                            return a.office_name.localeCompare(b.office_name, language === "ja" ? "ja" : "en") ?? 0;
                          })[0];
                          // setSelectedOffice(officeDataArray[0]);
                          setSelectedOffice(topSelectedOffice);
                        }
                      } else {
                        setEditedOffice(userProfileState?.office ? userProfileState.office : "");
                      }
                      setEditOfficeMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editOfficeMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                {(!officeDataArray || officeDataArray?.length === 0 || !isSelectModeOffice) && (
                  <input
                    type="text"
                    placeholder="所属事業所・営業所を入力してください"
                    required
                    autoFocus
                    className={`${styles.input_box}`}
                    value={editedOffice}
                    onChange={(e) => setEditedOffice(e.target.value)}
                    onBlur={() => setEditedOffice(toHalfWidth(editedOffice.trim()))}
                  />
                )}
                {!!officeDataArray && officeDataArray.length >= 1 && isSelectModeOffice && (
                  <select
                    className={`${styles.select_box}`}
                    value={!!selectedOffice ? selectedOffice.id : ""}
                    onChange={(e) => {
                      if (!officeDataArray) return;
                      const selectedOfficeObj = officeDataArray.find((obj) => obj.id === e.target.value);
                      console.log("e.target.value", e.target.value, "selectedOfficeObj", selectedOfficeObj);
                      if (selectedOfficeObj === undefined)
                        return alert("エラー：事業所データの取得にエラーが発生しました。");
                      setSelectedOffice(selectedOfficeObj);
                    }}
                  >
                    {/* <option value="">すべての事業部</option> */}
                    {!!officeDataArray &&
                      [...officeDataArray]
                        .sort((a, b) => {
                          if (a.office_name === null || b.office_name === null) return 0;
                          return a.office_name.localeCompare(b.office_name, language === "ja" ? "ja" : "en") ?? 0;
                        })
                        .map((office, index) => (
                          <option key={office.id} value={office.id}>
                            {office.office_name}
                          </option>
                        ))}
                    {/* {!!officeDataArray &&
                      [...officeDataArray]
                        .sort((a, b) => a.office_name.localeCompare(b.office_name, language === "ja" ? "ja" : "en"))
                        .map((office, index) => (
                          <option key={office.id} value={office.id}>
                            {office.office_name}
                          </option>
                        ))} */}
                  </select>
                )}
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (!isSelectModeOffice) {
                        setEditedOffice("");
                      } else {
                        setSelectedOffice(null);
                      }
                      setEditOfficeMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      if (!isSelectModeOffice) {
                        // 🔹inputタグで入力ルート
                        if (editedOffice === "") {
                          alert("有効な所属事業所・営業所を入力してください");
                          return;
                        }
                        if (userProfileState?.office === editedOffice) {
                          setEditOfficeMode(false);
                          return;
                        }

                        setLoadingGlobalState(true);
                        const { data: profileData, error } = await supabase
                          .from("profiles")
                          .update({ office: editedOffice })
                          .eq("id", userProfileState.id)
                          .select("office")
                          .single();

                        if (error) {
                          setTimeout(() => {
                            setLoadingGlobalState(false);
                            setEditOfficeMode(false);
                            alert(error.message);
                            console.log("所属事業所・営業所UPDATEエラー", error.message);
                            toast.error("所属事業所・営業所の更新に失敗しました!");
                          }, 500);
                          return;
                        }
                        setTimeout(() => {
                          console.log("所属事業所・営業所UPDATE成功 profileData", profileData);
                          setUserProfileState({
                            ...(userProfileState as UserProfileCompanySubscription),
                            office: profileData.office ? profileData.office : null,
                          });
                          setLoadingGlobalState(false);
                          setEditOfficeMode(false);
                          toast.success("所属事業所・営業所の更新が完了しました!");
                        }, 500);
                      } else {
                        // 🔹セレクトボックスから選択ルート
                        if (!selectedOffice) return alert("有効な事業所・営業所を選択してください。");
                        // まだoffice_assignmentsテーブルに割り当てられてない場合には、INSERT
                        if (!userProfileState?.assigned_office_id) {
                          try {
                            setLoadingGlobalState(true);
                            const insertPayload = {
                              created_by_company_id: userProfileState.company_id,
                              to_user_id: userProfileState.id,
                              office_id: selectedOffice.id,
                            };
                            const { data: insertData, error: insertError } = await supabase
                              .from("office_assignments")
                              .insert(insertPayload);

                            if (insertError) throw insertError;

                            console.log("所属事業所・営業所UPDATE成功 insertData", insertData);
                            setUserProfileState({
                              ...(userProfileState as UserProfileCompanySubscription),
                              office: selectedOffice.office_name ? selectedOffice.office_name : null,
                              assigned_office_id: selectedOffice.id,
                              assigned_office_name: selectedOffice.office_name,
                            });
                            toast.success("所属事業所・営業所の更新が完了しました🌟");
                          } catch (e: any) {
                            console.error("所属事業所・営業所UPDATEエラー", e);
                            toast.error("所属事業所・営業所の更新に失敗しました🙇‍♀️");
                          }
                          setLoadingGlobalState(false);
                          setEditOfficeMode(false);
                          return;
                        } else {
                          // 🔹既にoffice_assignmentsに割り当てられている場合は、office_idを変更する
                          try {
                            const updatePayload = {
                              office_id: selectedOffice.id,
                            };
                            const { data: updateData, error: updateError } = await supabase
                              .from("office_assignments")
                              .update(updatePayload)
                              .eq("to_user_id", userProfileState.id)
                              .eq("created_by_company_id", userProfileState.company_id)
                              .select();

                            if (updateError) throw updateError;

                            console.log("所属事業所・営業所UPDATE成功 updateData", updateData);

                            setUserProfileState({
                              ...(userProfileState as UserProfileCompanySubscription),
                              office: selectedOffice.office_name ? selectedOffice.office_name : null,
                              assigned_office_id: selectedOffice.id,
                              assigned_office_name: selectedOffice.office_name,
                            });

                            toast.success("所属事業所・営業所の更新が完了しました🌟");
                          } catch (e: any) {
                            console.error("所属事業所・営業所UPDATEエラー", e);
                            toast.error("所属事業所・営業所の更新に失敗しました🙇‍♀️");
                          }
                          setLoadingGlobalState(false);
                          setEditOfficeMode(false);
                        }
                      }
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 所属事業所・営業所ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 社員番号・ID */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>社員番号・ID</div>
            {!editEmployeeIdMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                {!userProfileState?.assigned_employee_id_name && (
                  <div className={`${styles.section_value}`}>
                    {userProfileState?.employee_id ? userProfileState.employee_id : "未設定"}
                  </div>
                )}
                {userProfileState?.assigned_employee_id_name && (
                  <div className={`${styles.section_value}`}>
                    {userProfileState?.assigned_employee_id_name
                      ? userProfileState.assigned_employee_id_name
                      : "未設定"}
                  </div>
                )}
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      if (userProfileState?.assigned_employee_id_name) {
                        setEditedEmployeeId(userProfileState.assigned_employee_id_name);
                      } else {
                        setEditedEmployeeId(userProfileState?.employee_id ? userProfileState.employee_id : "");
                      }
                      setEditEmployeeIdMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editEmployeeIdMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <input
                  type="text"
                  placeholder="社員番号・IDを入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedEmployeeId}
                  onChange={(e) => setEditedEmployeeId(e.target.value)}
                  onBlur={() => setEditedEmployeeId(toHalfWidth(editedEmployeeId.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedEmployeeId("");
                      setEditEmployeeIdMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedEmployeeId === "") {
                        alert("有効な社員番号・IDを入力してください");
                        return;
                      }
                      if (userProfileState?.employee_id === editedEmployeeId) {
                        setEditEmployeeIdMode(false);
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      // if (editedEmployeeId === userProfileState.employee_id) {
                      if (editedEmployeeId === userProfileState.assigned_employee_id_name) {
                        setEditEmployeeIdMode(false);
                        return;
                      }
                      try {
                        // const { data: profileData, error } = await supabase
                        //   .from("profiles")
                        //   .update({ employee_id: editedEmployeeId })
                        //   .eq("id", userProfileState.id)
                        //   .select("employee_id")
                        //   .single();
                        setLoadingGlobalState(true);

                        if (!userProfileState.assigned_employee_id) {
                          // 🔹まだ社員番号テーブルに割り当てられてないならINSERT
                          const insertPayload = {
                            created_by_company_id: userProfileState.company_id,
                            to_user_id: userProfileState.id,
                            employee_id_name: editedEmployeeId,
                          };
                          const { data: insertData, error }: { data: Employee_id[]; error: any } = await supabase
                            .from("employee_ids")
                            .insert(insertPayload)
                            .select();

                          if (error) throw error;

                          setTimeout(() => {
                            console.log("社員番号・ID INSERT成功 insertData[0]", insertData[0]);
                            setUserProfileState({
                              ...(userProfileState as UserProfileCompanySubscription),
                              assigned_employee_id: insertData[0] ? insertData[0].id : null,
                              assigned_employee_id_name: insertData[0] ? insertData[0].employee_id_name : null,
                            });
                            setLoadingGlobalState(false);
                            setEditEmployeeIdMode(false);
                            toast.success("社員番号・IDの更新が完了しました🌟");
                          }, 500);
                        } else {
                          // 🔹既に社員番号テーブルに設定済みならnameのみ変更
                          const updatePayload = {
                            employee_id_name: editedEmployeeId,
                          };
                          const { data: updateData, error }: { data: Employee_id[]; error: any } = await supabase
                            .from("employee_ids")
                            .update(updatePayload)
                            .eq("id", userProfileState.assigned_employee_id)
                            .select();

                          if (error) throw error;

                          setTimeout(() => {
                            console.log("社員番号・ID UPDATE成功 updateData", updateData[0]);
                            setUserProfileState({
                              ...(userProfileState as UserProfileCompanySubscription),
                              assigned_employee_id_name: updateData[0] ? updateData[0].employee_id_name : null,
                            });
                            setLoadingGlobalState(false);
                            setEditEmployeeIdMode(false);
                            toast.success("社員番号・IDの更新が完了しました🌟");
                          }, 500);
                        }
                      } catch (e: any) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditEmployeeIdMode(false);
                          console.error("社員番号・ID UPDATEエラー", e.message);
                          toast.error("社員番号・IDの更新に失敗しました🙇‍♀️");
                        }, 500);
                        return;
                      }
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 社員番号・IDここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 利用用途 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>利用用途</div>
            {!editUsageMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.usage ? userProfileState.usage : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedUsage(userProfileState?.usage ? userProfileState.usage : "1 チーム");
                      setEditUsageMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editUsageMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <select
                  className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                  value={editedUsage}
                  onChange={(e) => setEditedUsage(e.target.value)}
                >
                  <option value="1 チームで利用">1 チームで利用</option>
                  <option value="2 個人で利用">2 個人で利用</option>
                  <option value="3 学業・教育機関での利用">3 学業・教育機関での利用</option>
                </select>
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedUsage("");
                      setEditUsageMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedUsage === "") {
                        alert("有効な利用用途を入力してください");
                        return;
                      }
                      if (userProfileState?.usage === editedUsage) {
                        setEditUsageMode(false);
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      if (editedUsage === userProfileState.usage) {
                        setEditUsageMode(false);
                        return;
                      }
                      setLoadingGlobalState(true);
                      const { data: profileData, error } = await supabase
                        .from("profiles")
                        .update({ usage: editedUsage })
                        .eq("id", userProfileState.id)
                        .select("usage")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditUsageMode(false);
                          alert(error.message);
                          console.log("利用用途UPDATEエラー", error.message);
                          toast.error("利用用途の更新に失敗しました!", {
                            position: "top-right",
                            autoClose: 3000,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                            // theme: `${theme === "light" ? "light" : "dark"}`,
                          });
                        }, 500);
                        return;
                      }
                      setTimeout(() => {
                        console.log("利用用途UPDATE成功 profileData", profileData);
                        setUserProfileState({
                          ...(userProfileState as UserProfileCompanySubscription),
                          usage: profileData.usage ? profileData.usage : null,
                        });
                        setLoadingGlobalState(false);
                        setEditUsageMode(false);
                        toast.success("利用用途の更新が完了しました!", {
                          position: "top-right",
                          autoClose: 3000,
                          hideProgressBar: false,
                          closeOnClick: true,
                          pauseOnHover: true,
                          draggable: true,
                          progress: undefined,
                          // theme: `${theme === "light" ? "dark" : "light"}`,
                        });
                      }, 500);
                    }}
                  >
                    保存
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 利用用途ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* チーム内権限・役割 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>チーム内権限・役割</div>

            <div className={`flex h-full w-full items-center justify-between`}>
              <div className={`${styles.section_value}`}>
                {/* {userProfileState?.account_company_role ? userProfileState.account_company_role : "未設定"} */}
                {/* {userProfileState?.is_subscriber */}
                {userProfileState?.account_company_role === "company_owner"
                  ? "所有者"
                  : getCompanyRole(
                      userProfileState?.account_company_role ? userProfileState.account_company_role : null
                    )}
              </div>
              <div>
                {/* <div
                          className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                          onClick={() => {
                            setEditedUsage(userProfileState?.usage ? userProfileState.usage : "1 チーム");
                            setEditUsageMode(true);
                          }}
                        >
                          編集
                        </div> */}
              </div>
            </div>
          </div>
          {/* チーム内権限・役割ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>
        </div>
      )}

      {/* 「自社担当」変更サイドテーブル */}
      {/* {isOpenSearchStampSideTableBefore && (
        <div
          className={`fixed inset-0 z-[20000] bg-[#ffffff00] ${
            isOpenSearchStampSideTable ? `` : `pointer-events-none`
          }`}
        >
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Suspense
              fallback={
                <FallbackSideTableSearchSignatureStamp isOpenSearchStampSideTable={isOpenSearchStampSideTable} />
              }
            >
              <SideTableSearchSignatureStamp
                isOpenSearchStampSideTable={isOpenSearchStampSideTable}
                setIsOpenSearchStampSideTable={setIsOpenSearchStampSideTable}
                isOpenSearchStampSideTableBefore={isOpenSearchStampSideTableBefore}
                setIsOpenSearchStampSideTableBefore={setIsOpenSearchStampSideTableBefore}
                prevStampObj={prevStampObj}
                setPrevStampObj={setPrevStampObj}
                stampObj={stampObj}
                setStampObj={setStampObj}
                // searchSignatureStamp={sideTableState !== "author" ? true : false}
              />
            </Suspense>
          </ErrorBoundary>
        </div>
      )} */}
    </>
  );
};

export const SettingProfile = memo(SettingProfileMemo);
