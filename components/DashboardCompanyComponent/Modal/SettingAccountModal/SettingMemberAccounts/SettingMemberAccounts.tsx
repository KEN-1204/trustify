import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useStore from "@/store";
import useDashboardStore from "@/store/useDashboardStore";
import useThemeStore from "@/store/useThemeStore";
import axios from "axios";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { FC, memo, useEffect, useRef, useState } from "react";
import styles from "./SettingMemberAccounts.module.css";
import { GridRowMember } from "./GridRowMember";
import { useQueryMemberAccounts } from "@/hooks/useQueryMemberAccounts";
import { FiRefreshCw, FiTrash2 } from "react-icons/fi";
import { RippleButton } from "@/components/Parts/RippleButton/RippleButton";
import SpinnerIDS2 from "@/components/Parts/SpinnerIDS/SpinnerIDS2";
import { TestRowData } from "./TestRowData";
import { HiOutlineUsers } from "react-icons/hi2";
import { MdClose } from "react-icons/md";
import { TooltipModal } from "@/components/Parts/Tooltip/TooltipModal";
import { dataIllustration } from "@/components/assets";
import { toast } from "react-toastify";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQueryClient } from "@tanstack/react-query";
import { Department, Employee_id, MemberAccounts, Office, Unit } from "@/types";
import { compareAccounts } from "@/utils/Helpers/getRoleRank";
import { useQueryDepartments } from "@/hooks/useQueryDepartments";
import { useQueryUnits } from "@/hooks/useQueryUnits";
import { useQueryOffices } from "@/hooks/useQueryOffices";
import { CiFilter } from "react-icons/ci";
import { DropDownMenuFilter } from "./DropDownMenuFilter/DropDownMenuFilter";
import { BsCheck2 } from "react-icons/bs";
import { RxUpdate } from "react-icons/rx";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";

const SettingMemberAccountsMemo: FC = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
  // const theme = useThemeStore((state) => state.theme);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);

  // 上画面の選択中の列データ会社
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const language = useStore((state) => state.language);
  // 招待メールモーダル
  const setIsOpenSettingInvitationModal = useDashboardStore((state) => state.setIsOpenSettingInvitationModal);
  // セッション情報
  const sessionState = useStore((state) => state.sessionState);
  // router
  const router = useRouter();
  // メンバー招待ボタンローディング
  const [loading, setLoading] = useState(false);
  // メンバー一括で事業部・係・事業所を変更ローディング
  const [isLoadingUpsertMember, setIsLoadingUpsertMember] = useState(false);
  // リフェッチローディング
  const [refetchLoading, setRefetchLoading] = useState(false);
  // グローバルローディング
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  // 未設定アカウントを保持するグローバルState
  const notSetAccounts = useDashboardStore((state) => state.notSetAccounts);
  const setNotSetAccounts = useDashboardStore((state) => state.setNotSetAccounts);
  // 未設定かつ削除予定アカウントを保持するグローバルState
  const notSetAndDeleteRequestedAccounts = useDashboardStore((state) => state.notSetAndDeleteRequestedAccounts);
  const setNotSetAndDeleteRequestedAccounts = useDashboardStore((state) => state.setNotSetAndDeleteRequestedAccounts);
  // ツールチップ
  const setHoveredItemPosModalTooltip = useStore((state) => state.setHoveredItemPosHorizon);
  // // 未設定アカウント数を保持するグローバルState
  // const notSetAccountsCount = useDashboardStore((state) => state.notSetAccountsCount);
  // const setNotSetAccountsCount = useDashboardStore((state) => state.setNotSetAccountsCount);
  // 一括役割変更ドロップダウンメニュー開閉状態
  const [openChangeRoleTogetherMenu, setOpenChangeRoleTogetherMenu] = useState(false);
  const [openChangeMemberDetailMenu, setOpenChangeMemberDetailMenu] = useState(false);
  // 一括で事業部、係、事業所変更用の洗濯中state
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  // // チームから削除を選択した場合に削除ターゲットを保持するState
  // const removeTeamMember = useDashboardStore((state) => state.removeTeamMember);
  // const setRemoveTeamMember = useDashboardStore((state) => state.setRemoveTeamMember);
  // // チームロールドロップダウンメニュー
  // const isOpenRoleMenu = useDashboardStore((state) => state.isOpenRoleMenu);
  // const setIsOpenRoleMenu = useDashboardStore((state) => state.setIsOpenRoleMenu);

  // ================================ 🌟メンバーアカウント取得useQuery🌟 ================================
  const {
    data: memberAccountsDataArray,
    error: useQueryError,
    isLoading: useQueryIsLoading,
    refetch: refetchMemberAccounts,
  } = useQueryMemberAccounts();
  // console.log("🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥memberAccountsDataArray", memberAccountsDataArray);
  // ================================ ✅メンバーアカウント取得useQuery✅ ================================
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
  // console.log("departmentDataArray", departmentDataArray);

  // useMutation
  // const { createDepartmentMutation, updateDepartmentFieldMutation, deleteDepartmentMutation } = useMutateDepartment();
  // ================================ ✅事業部リスト取得useQuery✅ ================================
  // ================================ 🌟係・チームリスト取得useQuery🌟 ================================
  const {
    data: unitDataArray,
    isLoading: isLoadingQueryUnit,
    refetch: refetchQUeryUnits,
  } = useQueryUnits(userProfileState?.company_id, true);
  // console.log("unitDataArray", unitDataArray);

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
  // console.log("officeDataArray", officeDataArray);

  // useMutation
  // const { createOfficeMutation, updateOfficeFieldMutation, deleteOfficeMutation } = useMutateOffice();
  // ================================ ✅事業所・営業所リスト取得useQuery✅ ================================

  // メンバー数分チェックするStateの配列
  // const [checkedMembersArray, setCheckedMembersArray] = useState(
  //   memberAccountsDataArray
  //     ? Array(!!memberAccountsDataArray.length ? memberAccountsDataArray.length : 1).fill(false)
  //     : []
  // );

  // フィルターかつ並び替え後のブラウザ表示用
  const [filteredMemberArray, setFilteredMemberArray] = useState<MemberAccounts[]>([]);
  // // 並び替え後のチェック配列 自分と未設定は除く idで保持 idはsubscribed_account_id
  // const [checkedMembersArray, setCheckedMembersArray] = useState<(string | null)[]>([]);
  // const [allCheckedMemberIdsArray, setAllCheckedMemberIdsArray] = useState<(string | null)[]>([]);
  // 並び替え後のチェック配列 自分と未設定は除く memberのobjectで保持
  const [checkedMembersArray, setCheckedMembersArray] = useState<(MemberAccounts | null)[]>([]);
  const [allCheckedMemberIdsArray, setAllCheckedMemberIdsArray] = useState<(MemberAccounts | null)[]>([]);
  // const [checkedMembersArray, setCheckedMembersArray] = useState(
  //   memberAccountsDataArray
  //     ? Array(!!memberAccountsDataArray.length ? memberAccountsDataArray.length : 1).fill(null)
  //     : []
  // );

  // 並べ替え後の配列
  // const [sortedMemberAccountsState, setSortedMemberAccountsState] = useState<MemberAccounts[]>([]);
  useEffect(() => {
    if (typeof memberAccountsDataArray === "undefined") return;
    if (!memberAccountsDataArray) {
      setNotSetAccounts([]);
      // setNotSetAccountsCount(null);
      return;
    }
    // // 全メンバーアカウントの数
    // const allAccountsCount = memberAccountsDataArray ? memberAccountsDataArray.length : 0;
    // アカウントの配列からprofilesのidがnull、かつ、invited_emailがnullで招待中でないアカウントのみをフィルタリング
    const nullIdAccounts = memberAccountsDataArray.filter(
      (account) => account.id === null && account.account_invited_email === null && account.account_state === "active"
    );

    // 削除予定のアカウントを取得してグローバルStateに格納
    const deleteRequestedAccounts = memberAccountsDataArray.filter(
      (account) =>
        account.id === null && account.account_invited_email === null && account.account_state === "delete_requested"
    );

    // idがnullのアカウントの数をカウント
    const nullIdCount = nullIdAccounts ? nullIdAccounts.length : 0;
    // // アカウントの配列からidがnullでないアカウントのみをフィルタリング
    // const notNullIdAccounts = memberAccountsDataArray?.filter((account) => account.id !== null);
    // // idがnullでないアカウントの数をカウント
    // const notNullIdCount = notNullIdAccounts ? notNullIdAccounts.length : 0;
    // // 全アカウント数からnullでないアカウントを引いた数
    // const nullIdCount2 = Math.abs(allAccountsCount - notNullIdCount);

    // メンバーアカウントを並び替え 全てのセクションであいうえお順
    // 1番上が所有者: account_company_role
    // 次が管理者: account_company_role
    // マネージャー: account_company_role
    // メンバー: account_company_role
    // ゲスト: account_company_role
    // 招待済み: id有りだが、profile_name無し
    // 未設定: id有りだが、profile_name無し

    console.log("ソート", "大空大地".localeCompare("佐藤礼司", "ja"));
    console.log("ソート前 memberAccountsDataArray", memberAccountsDataArray);
    const sortedMemberAccountsArray = [...memberAccountsDataArray].sort((a, b) => compareAccounts(a, b, language));
    console.log(
      "ソート後 memberAccountsDataArray",
      memberAccountsDataArray,
      "sortedMemberAccountsArray",
      sortedMemberAccountsArray
    );
    setFilteredMemberArray(sortedMemberAccountsArray);
    // setSortedMemberAccountsState(sortedMemberAccountsArray);
    // 自分と未設定を除いたチェック用の配列を作成してstateに格納
    const checkedArray = [...sortedMemberAccountsArray].filter(
      (account) =>
        account.id !== userProfileState?.id &&
        account.id !== null &&
        account.profile_name !== null &&
        account.account_invited_email === null &&
        account.account_state !== "delete_requested" &&
        account.account_company_role !== "company_owner"
    );
    const _checkedNullArray = Array(checkedArray.length).fill(null);
    setCheckedMembersArray(_checkedNullArray);
    // const _allCheckedIdArray = checkedArray.map((member) => member.id);
    // const _allCheckedIdArray = checkedArray.map((member) => member.subscribed_account_id);
    const _allCheckedIdArray = checkedArray.map((member) => member);
    setAllCheckedMemberIdsArray(_allCheckedIdArray);

    console.log(
      "未設定のアクティブアカウントnullIdAccounts",
      nullIdAccounts,
      "未設定のアクティブアカウント数",
      nullIdCount,
      "削除リクエスト済みアカウント数",
      deleteRequestedAccounts,
      "チェック用の配列の要素数",
      checkedArray.length,
      "チェック用の配列",
      checkedArray,
      "全メンバーmemberAccountsDataArray",
      memberAccountsDataArray
      // "sortedMemberAccountsArray",
      // sortedMemberAccountsArray
    );
    // グローバルStateに格納
    // setNotSetAccountsCount(nullIdCount);
    setNotSetAccounts(nullIdAccounts);
    setNotSetAndDeleteRequestedAccounts(deleteRequestedAccounts);
    // console.log(
    //   "nullIdCount",
    //   nullIdCount,
    //   "引いた数nullIdCount2",
    //   nullIdCount2,
    //   "全アカウント数",
    //   memberAccountsDataArray?.length,
    //   "nullでないアカウント数",
    //   notNullIdCount
    // );
  }, [memberAccountsDataArray, setNotSetAccounts]);

  // ======================= 🌟現在の選択した事業部でチームを絞り込むuseEffect🌟 =======================
  // 検索条件
  // const departmentValuesArray = !!departmentDataArray ? departmentDataArray.map(obj => obj.department_name) : []
  // type DepartmentElementType = typeof departmentValuesArray extends [] ? string : typeof departmentValuesArray[number]
  // type FilterCondition<T> = {department: T | null}
  type FilterCondition = {
    department: Department["department_name"] | null;
    unit: Unit["unit_name"] | null;
    office: Office["office_name"] | null;
    employee_id: Employee_id["employee_id_name"] | null;
  };
  const [filterCondition, setFilterCondition] = useState<FilterCondition>({
    department: null,
    unit: null,
    office: null,
    employee_id: null,
  });

  const [isComposing, setIsComposing] = useState(false); // 日本語のように変換、確定が存在する言語入力の場合の日本語入力の変換中を保持するstate、日本語入力開始でtrue, エンターキーで変換確定した時にfalse
  const [isOpenDropdownMenuFilter, setIsOpenDropdownMenuFilter] = useState(false);
  const [isActiveFilter, setIsActiveFilter] = useState(false);

  useEffect(() => {
    if (isComposing) return console.log("🔥useEffect 入力変換中のためリターン");
    console.log("🔥useEffect 入力変換確定済みなのでフィルター実行");
    // unitが存在せず空にする
    if (!memberAccountsDataArray) return setFilteredMemberArray([]);

    // 検索条件が全てnullならそのまま取得したmemberAccountsDataArrayを全て表示
    if (Object.values(filterCondition).every((value) => value === null || value === "")) {
      console.log("🔥useEffect フィルター全てnull");
      const sortedMemberAccountsArray = [...memberAccountsDataArray].sort((a, b) => compareAccounts(a, b, language));
      setFilteredMemberArray(sortedMemberAccountsArray);
      if (isActiveFilter) setIsActiveFilter(false);
    } else {
      // 検索条件が一つ以上選択されているパターン 条件なしの''の場合はtrueでそのセクションの全て抽出
      const filteredData = memberAccountsDataArray.filter((member) => {
        const matchesDepartment = filterCondition.department
          ? member.assigned_department_name?.includes(filterCondition.department)
          : true;
        const matchesUnit = filterCondition.unit ? member.assigned_unit_name?.includes(filterCondition.unit) : true;
        // const matchesUnit = filterCondition.unit === member.assigned_unit_name;
        const matchesOffice = filterCondition.office
          ? member.assigned_office_name?.includes(filterCondition.office)
          : true;
        const matchesEmployeeId = filterCondition.employee_id
          ? member.assigned_employee_id_name?.includes(filterCondition.employee_id)
          : true;

        return matchesDepartment && matchesUnit && matchesOffice && matchesEmployeeId;
      });
      console.log("🔥useEffect フィルター結果", filteredData);
      const sortedMemberAccountsArray = [...filteredData].sort((a, b) => compareAccounts(a, b, language));
      setFilteredMemberArray(sortedMemberAccountsArray);
      if (!isActiveFilter) setIsActiveFilter(true);
      // setFilteredMemberArray(filteredData);
    }
  }, [memberAccountsDataArray, filterCondition, isComposing]);

  // console.log("フィルター前memberAccountsDataArray", memberAccountsDataArray);
  // console.log("フィルター後filteredMemberArray", filteredMemberArray);
  // console.log("filterCondition", filterCondition);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // ======================= 🌟現在の選択した事業部で係・チームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  // useEffect(() => {
  //   // unitが存在しない場合は空にする
  //   if (!unitDataArray || unitDataArray.length === 0) {
  //     setFilteredUnitBySelectedDepartment([]);
  //     return;
  //   }
  //   // 選択中の事業部が空(全て)でunitDataArrayが存在しているならunitDataArrayをそのまま更新する
  //   // if (!selectedDepartment && unitDataArray && unitDataArray.length >= 1) {
  //   //   setFilteredUnitBySelectedDepartment(unitDataArray);
  //   //   return;
  //   // }
  //   // 選択中の事業部が変化するか、unitDataArrayの内容に変更があったら新たに絞り込んで更新する
  //   if (unitDataArray && unitDataArray.length >= 1 && selectedDepartment) {
  //     const filteredUnitArray = unitDataArray.filter((unit) => unit.created_by_department_id === selectedDepartment.id);
  //     setFilteredUnitBySelectedDepartment(filteredUnitArray);
  //   }
  // }, [unitDataArray, selectedDepartment]);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  // useQueryMemberAccountsで製品テーブルからデータ一覧を取得
  console.log(
    "useQuery前 ",
    "userProfileState?.subscription_id",
    userProfileState?.subscription_id,
    "memberAccountsDataArray",
    memberAccountsDataArray,
    // "並び替え後sortedMemberAccountsState",
    // sortedMemberAccountsState,
    "フィルター並び替え後filteredMemberArray",
    filteredMemberArray,
    "filterCondition",
    filterCondition,
    "useQueryError",
    useQueryError,
    "useQueryIsLoading",
    useQueryIsLoading,
    "各チェック配列checkedMembersArray",
    checkedMembersArray
  );
  console.log("memberAccountsDataArray", memberAccountsDataArray);
  // console.log("並び替え後sortedMemberAccountsState", sortedMemberAccountsState);
  console.log("フィルター後filteredMemberArray", filteredMemberArray);

  // ================================ 一括で事業部・係・事業所のどれかを変更する関数 ================================

  // 事業部・係・事業所クリック時の選択モーダル開閉state
  const [isOpenConfirmUpsertModal, setIsOpenConfirmUpsertModal] = useState<"department" | "unit" | "office" | null>(
    null
  );

  // 一括役割変更関数
  const handleChangeMemberDetailAllAtOnce = async ({
    title,
    departmentId,
    unitId,
    officeId,
  }: {
    title: string;
    departmentId?: string;
    unitId?: string;
    officeId?: string;
  }) => {
    if (!memberAccountsDataArray || memberAccountsDataArray.length === 0)
      return alert("エラー：メンバーデータが見つかりませんでした。");
    if (!checkedMembersArray || checkedMembersArray?.length === 0)
      return alert("エラー：選択したメンバーデータが見つかりませんでした。");
    if (!userProfileState?.company_id) return alert("エラー：会社データが見つかりませんでした。");

    // setLoading(true);
    setIsLoadingUpsertMember(true);
    try {
      // const newMemberArray: MemberAccounts[] = [...memberAccountsDataArray];
      // const promises = newMemberArray.map((member: MemberAccounts, i) => {
      //   // if (checkedMembersArray[i] === true && member.account_company_role !== "company_owner") {
      //   if (checkedMembersArray[i] === member.id && member.account_company_role !== "company_owner") {
      //     console.log("役割変更 i", i);
      //     return handleChangeRole(role, member.subscribed_account_id!);
      //   }
      //   return null;
      // });

      // await Promise.all(promises);
      // const updateIdsArray = checkedMembersArray.filter((id) => id !== null);
      // member is MemberAccountsでfilterが返す配列内の各要素のデータ型を指定してtypescriptに伝える
      const updateProfileIdsArray = checkedMembersArray
        .filter((member): member is MemberAccounts => member !== null && member.id !== null)
        .map((member) => member.id);

      if (title === "department") {
        if (!departmentId) return alert("エラー：事業部データが見つかりませんでした。");
        const upsertDepartmentPayload = {
          _company_id: userProfileState.company_id, // UPSERTの未割り当てのユーザーINSERT用
          _new_department_id: departmentId, // 事業部id
          _user_ids_to_update: updateProfileIdsArray, // 更新するuserのid
        };

        console.log("🌟チーム役割一括変更 upsertDepartmentPayload", upsertDepartmentPayload);

        const { error } = await supabase.rpc("upsert_department_assignments_all_at_once", upsertDepartmentPayload);

        if (error) throw error;

        setSelectedDepartment(null); // 成功したらnullにリセット
      }
      if (title === "unit") {
        if (!departmentId) return alert("エラー：事業部データが見つかりませんでした。");
        if (!unitId) return alert("エラー：係・チームデータが見つかりませんでした。");
        const upsertUnitPayload = {
          _company_id: userProfileState.company_id, // UPSERTの未割り当てのユーザーINSERT用
          _new_department_id: departmentId, // 事業部id
          _new_unit_id: unitId, // 係・チームid
          _user_ids_to_update: updateProfileIdsArray, // 更新するuserのid
        };

        console.log("🌟チーム役割一括変更 upsertUnitPayload", upsertUnitPayload);

        const { error } = await supabase.rpc("upsert_unit_assignments_all_at_once", upsertUnitPayload);

        if (error) throw error;
      }
      if (title === "office") {
        if (!officeId) return alert("エラー：事業所・営業所データが見つかりませんでした。");
        const upsertOfficePayload = {
          _company_id: userProfileState.company_id, // UPSERTの未割り当てのユーザーINSERT用
          _new_office_id: officeId, // 係・チームid
          _user_ids_to_update: updateProfileIdsArray, // 更新するuserのid
        };

        console.log("🌟チーム役割一括変更 upsertOfficePayload", upsertOfficePayload);

        const { error } = await supabase.rpc("upsert_office_assignments_all_at_once", upsertOfficePayload);

        if (error) throw error;
      }

      console.log("✅全ての非同期処理が完了 invalidateQueriesで再フェッチ");
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });

      toast.success("すべての役割の変更が完了しました!🌟", { autoClose: 3000 });
    } catch (error: any) {
      console.error("一括変更エラー", error);
      toast.error("変更に失敗しました...🙇‍♀️", { autoClose: 3000 });
    }
    // setLoading(false);
    setIsLoadingUpsertMember(false);
    setOpenChangeMemberDetailMenu(false);
    setIsOpenConfirmUpsertModal(null);

    const newCheckArray = checkedMembersArray.map((value) => null);
    setCheckedMembersArray(newCheckArray);

    if (selectedDepartment) setSelectedDepartment(null); // 成功したらnullにリセット
    if (selectedUnit) setSelectedUnit(null); // 成功したらnullにリセット
    if (selectedOffice) setSelectedOffice(null); // 成功したらnullにリセット
  };
  // ========================= 一括で事業部・係・事業所のどれかを変更する関数 ここまで =========================

  // ================================ 一括で役割を変更する関数 ================================
  // 役割の変更関数
  // const handleChangeRole = async (companyRole: string, subscribed_account_id: string) => {
  //   const { error } = await supabase
  //     .from("subscribed_accounts")
  //     .update({ company_role: companyRole })
  //     .eq("id", subscribed_account_id)
  //     .select("company_role");

  //   if (error) throw new Error(error.message);
  //   console.log("役割変更成功", subscribed_account_id);
  //   await new Promise((resolve) => setTimeout(resolve, 300));
  // };

  // 一括役割変更関数
  const handleChangeRoleTogether = async (role: string) => {
    if (!memberAccountsDataArray || memberAccountsDataArray.length === 0) return;
    if (!checkedMembersArray || checkedMembersArray?.length === 0) return;

    setLoading(true);
    try {
      // const newMemberArray: MemberAccounts[] = [...memberAccountsDataArray];
      // const promises = newMemberArray.map((member: MemberAccounts, i) => {
      //   // if (checkedMembersArray[i] === true && member.account_company_role !== "company_owner") {
      //   if (checkedMembersArray[i] === member.id && member.account_company_role !== "company_owner") {
      //     console.log("役割変更 i", i);
      //     return handleChangeRole(role, member.subscribed_account_id!);
      //   }
      //   return null;
      // });

      // await Promise.all(promises);
      // const updateIdsArray = checkedMembersArray.filter((id) => id !== null);
      const updateMemberObj = checkedMembersArray.filter(
        (member) => member !== null && !!member?.subscribed_account_id
      );
      const updateIdsArray = updateMemberObj.map((member) => member?.subscribed_account_id);

      const updateAllPayload = {
        _new_company_role: role,
        _update_account_quantity: updateIdsArray.length,
        _ids_to_update: updateIdsArray,
      };
      console.log("🌟チーム役割一括変更 updateAllPayload", updateAllPayload);

      const { error } = await supabase.rpc("update_company_roll_all_at_once", updateAllPayload);

      if (error) throw error;

      console.log("✅全ての非同期処理が完了 invalidateQueriesで再フェッチ");
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });

      toast.success("すべての役割の変更が完了しました!🌟", { autoClose: 3000 });
    } catch (error: any) {
      console.error("役割一括変更エラー", error);
      toast.error("役割の変更に失敗しました...🙇‍♀️", { autoClose: 3000 });
    }
    setLoading(false);
    setOpenChangeRoleTogetherMenu(false);

    const newCheckArray = checkedMembersArray.map((value) => null);
    setCheckedMembersArray(newCheckArray);
  };
  // ================================ 一括で役割を変更する関数 ここまで ================================

  // ================================ 一括でメンバーを削除する関数 ================================
  const [openRemoveTeamTogetherModal, setOpenRemoveTeamTogetherModal] = useState(false);
  // チームから削除する関数
  // const removeFromTeam = async (subscribed_account_id: string) => {
  //   // subscribed_accountsのuser_idカラムをnullにして契約アカウントとの紐付けを解除する
  //   const { data: newAccountData, error: accountUpdateError } = await supabase
  //     .from("subscribed_accounts")
  //     .update({
  //       user_id: null,
  //       company_role: null,
  //     })
  //     .eq("id", subscribed_account_id)
  //     .select();

  //   if (accountUpdateError) throw new Error(accountUpdateError.message);

  //   console.log("紐付け削除UPDATEが成功したアカウントデータ", newAccountData);
  // };

  // 一括メンバー削除関数
  const handleRemoveFromTeamTogether = async () => {
    if (!memberAccountsDataArray || memberAccountsDataArray.length === 0) return;
    if (!checkedMembersArray || checkedMembersArray?.length === 0) return;

    setLoading(true);
    try {
      // const newMemberArray: MemberAccounts[] = [...memberAccountsDataArray];
      // const promises = newMemberArray.map((member: MemberAccounts, i) => {
      //   // if (checkedMembersArray[i] === true && member.account_company_role !== "company_owner") {
      //   if (checkedMembersArray[i] === member.id && member.account_company_role !== "company_owner") {
      //     console.log("紐付け削除 i", i);
      //     return removeFromTeam(member.subscribed_account_id!);
      //   }
      //   return null;
      // });

      // await Promise.all(promises);

      // remove_from_team_all_at_once
      // const removeIdsArray = checkedMembersArray.filter((id) => id !== null);
      const removeMemberObj = checkedMembersArray.filter(
        (member) => member !== null && !!member?.subscribed_account_id
      );
      const removeIdsArray = removeMemberObj.map((member) => member?.subscribed_account_id);

      const removeAllPayload = {
        _remove_account_quantity: removeIdsArray.length,
        _ids_to_remove_from_team: removeIdsArray,
      };
      console.log("🌟チーム役割一括変更 removeAllPayload", removeAllPayload);

      const { error } = await supabase.rpc("remove_from_team_all_at_once", removeAllPayload);

      if (error) throw error;

      console.log("全ての非同期処理が完了 invalidateQueriesで再フェッチ");
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
      toast.success("選択したメンバーをチームから削除しました!", { autoClose: 3000 });
    } catch (error: any) {
      console.error("役割変更エラー", error.message);
      toast.error("チームからの削除に失敗しました!", { autoClose: 3000 });
    }
    setLoading(false);
    setOpenRemoveTeamTogetherModal(false);
    // // 全てのチェックをfalseにして外し、一括操作エリアを閉じる
    // const newCheckArray = checkedMembersArray.map((value) => false);
    // 全てのチェックをnullにして外し、一括操作エリアを閉じる
    const newCheckArray = checkedMembersArray.map((value) => null);
    setCheckedMembersArray(newCheckArray);
  };
  // ================================ 一括でメンバーを削除する関数 ここまで ================================

  // ================================ ツールチップ ================================
  const modalContainerRef = useRef<HTMLDivElement | null>(null);
  const hoveredItemPosModal = useStore((state) => state.hoveredItemPosModal);
  const setHoveredItemPosModal = useStore((state) => state.setHoveredItemPosModal);
  const handleOpenTooltip = (e: React.MouseEvent<HTMLElement, MouseEvent>, display: string) => {
    // モーダルコンテナのleftを取得する
    if (!modalContainerRef.current) return;
    const containerLeft = modalContainerRef.current?.getBoundingClientRect().left;
    const containerTop = modalContainerRef.current?.getBoundingClientRect().top;
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2 = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosModal({
      x: x - containerLeft,
      y: y - containerTop,
      itemWidth: width,
      itemHeight: height,
      content: (e.target as HTMLDivElement).dataset.text as string,
      content2: content2,
      content3: content3,
      display: display,
    });
  };
  // ============================================================================================
  // ================================ ツールチップを非表示 ================================
  const handleCloseTooltip = () => {
    setHoveredItemPosModal(null);
  };
  // ============================================================================================

  console.log(
    "チェック配列",
    checkedMembersArray,
    "チェック配列",
    checkedMembersArray.map((m) => (m ? m.profile_name : null)),
    "selectedDepartment",
    selectedDepartment ? selectedDepartment["department_name"] : null,
    "selectedUnit",
    selectedUnit ? selectedUnit["unit_name"] : null,
    "selectedOffice",
    selectedOffice ? selectedOffice["office_name"] : null
  );

  return (
    <>
      {/* オーバーレイ */}
      {loading && (
        <div className={`flex-center fixed inset-0 z-[3000] bg-[#00000090]`}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )}
      {/* 右側メインエリア メンバーアカウント */}
      {selectedSettingAccountMenu === "Member" && (
        <div className={`relative flex h-full w-full flex-col overflow-y-scroll pb-[20px] pl-[20px] pr-[80px]`}>
          <h2 className={`mt-[20px] text-[18px] font-bold`}>
            メンバーアカウント（<span>{userProfileState?.accounts_to_create}</span>）
          </h2>

          <div className="mt-[20px] flex min-h-[168px] w-full items-center justify-between overflow-hidden rounded-[8px] bg-[var(--setting-bg-sub)]">
            {/* <div className="sticky top-0 z-10 mt-[20px] flex min-h-[168px] w-full items-center justify-between overflow-hidden rounded-[8px] bg-[var(--setting-bg-sub)]"> */}
            <div className="flex flex-col space-y-3 p-[24px] pr-[0px]">
              <h4 className="font-bold">チーム全員がデータを残すかどうかが勝負の分かれ目</h4>
              <p className="text-[13px]">
                {/* <span>コラボレーションとデータサイエンスを駆使して、仕事を素早く終わらせましょう</span> */}
                <span>コラボレーションとデータサイエンスを駆使して、付加価値を最大化させましょう</span>
              </p>
              <div className="w-full">
                <button
                  className={`transition-base01 flex-center max-h-[41px] w-[138px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff]  ${
                    loading ? `` : `hover:bg-[var(--color-bg-brand-f-deep)]`
                  } mt-[10px]`}
                  onClick={() => setIsOpenSettingInvitationModal(true)}
                >
                  <span>メンバーを招待</span>
                  {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
                </button>
              </div>
            </div>

            {/* <div className={`flex-center h-full w-[30%]`}>
              <Image src={`/assets/images/icons/icons8-share-64.png`} alt="share-icon" width={70} height={70} />
            </div> */}
            <div className={`flex h-full w-[30%] items-center`}>
              <div className="ml-[10px]">{dataIllustration}</div>
            </div>
          </div>

          {/* リフレッシュ・並び替えエリア mtの20px入れたらtop188px、mt覗くと168px hは43 */}
          {/* <div className="relative z-0 mt-[20px] h-[50px] w-full border-b border-[var()] bg-red-100"></div> */}
          <div
            className={`sticky top-[0px] z-10 mt-[10px] flex w-full items-center border-b border-solid border-[var(--color-border-deep)] bg-[var(--color-edit-bg-solid)] py-[8px] pt-[18px]`}
            // className={`sticky top-[168px] z-10 mt-[20px] flex w-full items-center border-b border-solid border-[var(--color-border-deep)] bg-[var(--color-edit-bg-solid)] py-[8px]`}
          >
            <button
              className={`flex-center transition-bg03 relative  h-[26px] min-w-[110px]  cursor-pointer space-x-1  rounded-[4px] border border-solid border-transparent px-[6px] text-[12px] text-[var(--color-text-sub)] hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--setting-bg-sub)] hover:text-[var(--color-text)] ${styles.fh_text_btn}`}
              onClick={async () => {
                if (refetchLoading) return;
                console.log("リフレッシュ クリック");
                setRefetchLoading(true);
                //   await queryClient.invalidateQueries({ queryKey: ["companies"] });
                await refetchMemberAccounts();
                setRefetchLoading(false);
              }}
            >
              {/* <FiRefreshCw /> */}
              {/* {!refetchLoading && <SpinnerIDS scale={"scale-[0.2]"} width={12} height={12} />} */}
              {refetchLoading && (
                <div className="relative">
                  <div className="mr-[2px] h-[12px] w-[12px]"></div>
                  <SpinnerIDS2 fontSize={20} width={20} height={20} />
                </div>
              )}
              {!refetchLoading && (
                <div className="flex-center mr-[2px]">
                  <FiRefreshCw />
                </div>
              )}
              <span className="whitespace-nowrap">リフレッシュ</span>
            </button>
            <button
              className={`flex-center transition-bg03 relative  ml-[4px] h-[26px]  min-w-[100px]  space-x-1 rounded-[4px] border border-solid border-transparent px-[6px] text-[12px] hover:border-[var(--color-bg-brand-f)] hover:bg-[var(--setting-bg-sub)] ${
                styles.fh_text_btn
              } ${isOpenDropdownMenuFilter ? `cursor-default` : `cursor-pointer`} ${
                isActiveFilter
                  ? `text-[var(--color-text-brand-f)]`
                  : `text-[var(--color-text-sub)] hover:text-[var(--color-text)]`
              }`}
              onClick={() => {
                if (!isOpenDropdownMenuFilter) setIsOpenDropdownMenuFilter(true);
              }}
            >
              {/* <FiRefreshCw /> */}
              {/* {!refetchLoading && <SpinnerIDS scale={"scale-[0.2]"} width={12} height={12} />} */}
              {refetchLoading && (
                <div className="relative">
                  <div className="mr-[2px] h-[12px] w-[12px]"></div>
                  <SpinnerIDS2 fontSize={20} width={20} height={20} />
                </div>
              )}
              {!refetchLoading && (
                <div className="flex-center mr-[1px]">
                  <CiFilter className="stroke-[0.5] text-[17px]" />
                </div>
              )}
              <span className="whitespace-nowrap">フィルター</span>
              {isOpenDropdownMenuFilter && (
                <DropDownMenuFilter
                  setIsOpenDropdownMenuFilter={setIsOpenDropdownMenuFilter}
                  departmentDataArray={departmentDataArray}
                  unitDataArray={unitDataArray}
                  officeDataArray={officeDataArray}
                  filterCondition={filterCondition}
                  setFilterCondition={setFilterCondition}
                  setIsComposing={setIsComposing}
                />
              )}
              {/* {isActiveFilter && (
                <BsCheck2 className="pointer-events-none min-h-[17px] min-w-[17px] stroke-1 text-[17px] text-[#00d436]" />
              )} */}
            </button>
            {/* <RippleButton
              title={`リフレッシュ`}
              // bgColor="var(--color-btn-brand-f-re)"
              border="var(--color-btn-brand-f-re-hover)"
              borderRadius="2px"
              classText={`select-none`}
              clickEventHandler={() => {
                //   if (tableContainerSize === "all") return;
                //   console.log("クリック コンテナ高さ変更 All");
                //   setTableContainerSize("all");
                console.log("新規サーチ クリック");
              }}
            /> */}
            <div className="ml-auto mr-[10px] text-[12px] text-[var(--color-text-sub)]">
              {!!notSetAccounts.length && (
                // <span className={`${!!notSetAndDeleteRequestedAccounts.length ? `mr-[40px]` : ``}`}>
                <span className={`mr-[20px] ${!!notSetAndDeleteRequestedAccounts.length ? `mr-[40px]` : ``}`}>
                  メンバー未設定アカウント数：{notSetAccounts.length}
                </span>
              )}

              {!!notSetAndDeleteRequestedAccounts.length && (
                <span className="">削除リクエスト済みアカウント数：{notSetAndDeleteRequestedAccounts.length}</span>
              )}
              {/* <span className="">削除リクエスト済みアカウント数：6</span> */}
            </div>
          </div>

          {/* メンバーテーブル sticky mtありでtop231、なしで211 */}
          <div className="z-5 relative mt-[0px] w-full">
            <div role="grid" className="w-full">
              {/* <div role="row" className={`${styles.grid_row} sticky top-[53px] z-10 bg-[var(--color-edit-bg-solid)]`}> */}
              <div role="row" className={`${styles.grid_row} sticky top-[53px] z-[8] bg-[var(--color-edit-bg-solid)]`}>
                {/* <div role="row" className={`${styles.grid_row} sticky top-[211px]`}> */}
                <div role="columnheader" className={styles.column_header}>
                  氏名
                </div>
                <div role="columnheader" className={styles.column_header}>
                  メールアドレス
                </div>
                <div role="columnheader" className={styles.column_header}>
                  チームでの役割
                </div>
                <div role="columnheader" className={styles.column_header}></div>
              </div>
              <div role="rowgroup" className="pb-[calc(74px*7)]">
                {/* Row2 */}
                {/* 並び替え有りバージョン */}
                {/* {sortedMemberAccountsState &&
                  sortedMemberAccountsState.map((account, index) => ( */}
                {filteredMemberArray?.length === 0 && (
                  <div className="flex-center h-[100px] w-full">
                    <p className="text-[13px] text-[var(--color-text-sub)]">データが見つかりませんでした。</p>
                  </div>
                )}
                {filteredMemberArray &&
                  filteredMemberArray.length >= 1 &&
                  filteredMemberArray.map((account, index) => (
                    <React.Fragment key={account.subscribed_account_id}>
                      <GridRowMember
                        memberAccount={account}
                        checkedMembersArray={checkedMembersArray}
                        setCheckedMembersArray={setCheckedMembersArray}
                        index={index}
                      />
                    </React.Fragment>
                  ))}
                {/* 並び替え無しバージョン */}
                {/* {memberAccountsDataArray &&
                  memberAccountsDataArray.map((account, index) => (
                    <React.Fragment key={account.subscribed_account_id}>
                      <GridRowMember
                        memberAccount={account}
                        checkedMembersArray={checkedMembersArray}
                        setCheckedMembersArray={setCheckedMembersArray}
                        index={index}
                      />
                    </React.Fragment>
                  ))} */}
                {/* <GridRowMember /> */}
                {/* <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData />
                <TestRowData /> */}

                {/* ここまで */}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* 右側メインエリア プロフィール ここまで */}
      {/* =================== チェックボックス選択時の一括変更エリア =================== */}
      <div
        // className={`shadow-top-md transition-base03 sticky bottom-0 left-0 z-[1000] flex h-[80px] w-full  origin-bottom items-center justify-between bg-[var(--color-edit-bg-solid)] px-[24px] py-[8px] text-[13px] ${
        //   checkedMembersArray.includes(true) ? `scale-y-100` : `mb-[-80px] scale-y-0`
        // } `}
        className={`shadow-top-md transition-base03 sticky bottom-0 left-0 z-[1000] flex h-[80px] w-full  origin-bottom items-center justify-between bg-[var(--color-edit-bg-solid)] px-[24px] py-[8px] text-[13px] ${
          checkedMembersArray.some((member) => member !== null) ? `scale-y-100` : `mb-[-80px] scale-y-0`
        } `}
        ref={modalContainerRef}
      >
        {/* 一括処理オーバーレイ */}
        {(openChangeRoleTogetherMenu || openChangeMemberDetailMenu) && (
          <div
            className="fixed left-[-100vw] top-[-100vh] z-[100] h-[200vh] w-[200vw]"
            onClick={() => {
              if (openChangeRoleTogetherMenu) setOpenChangeRoleTogetherMenu(false);
              if (openChangeMemberDetailMenu) setOpenChangeMemberDetailMenu(false);
            }}
          ></div>
        )}
        {hoveredItemPosModal && <TooltipModal />}
        <div className="flex items-center justify-start">
          {/* <p>（{checkedMembersArray.filter((value) => value === true).length}件）選択済み</p> */}
          <p>（{checkedMembersArray.filter((member) => member !== null).length}件）選択済み</p>
        </div>
        <div className="flex-center">
          <div className="flex-center space-x-3">
            {/* 部署変更アイコン */}
            <div
              className={`flex-center relative h-[35px] w-[35px] cursor-pointer rounded-[4px] text-[20px] hover:bg-[var(--setting-bg-sub)] ${
                openChangeMemberDetailMenu ? `bg-[var(--setting-bg-sub)]` : ``
              }`}
              data-text="事業部・係・部署を変更"
              onMouseEnter={(e) => {
                if (openChangeMemberDetailMenu) return;
                handleOpenTooltip(e, "top");
              }}
              onMouseLeave={handleCloseTooltip}
              onClick={() => setOpenChangeMemberDetailMenu(true)}
            >
              <RxUpdate className="stroke-[0.1] text-[18px]" />
              {/* 一括で事業部・係・事業所を変更するドロップダウンメニュー */}
              {openChangeMemberDetailMenu && (
                <>
                  {/* 通常時 h-[px] 招待中時 */}
                  <div className="shadow-all-md border-real-with-shadow  absolute left-[-calc(300px-50%)] top-[-253px] z-[2000] h-auto min-w-[300px] rounded-[8px] bg-[var(--color-bg-dropdown-menu)]">
                    <ul className={`flex flex-col py-[0px]`}>
                      <li
                        className={`${styles.dropdown_list_item} flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          // handleChangeMemberDetailAllAtOnce('department', );
                          if (!departmentDataArray || departmentDataArray?.length === 0) {
                            alert("事業部リストが未設定です。先に「会社・チーム」から事業部を作成してください。");
                            return;
                          }
                          const firstDepartmentObj = [...departmentDataArray].sort((a, b) => {
                            if (a.department_name === null) return 1; // null値をリストの最後に移動
                            if (b.department_name === null) return -1;
                            return a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en");
                          })[0];
                          setSelectedDepartment(firstDepartmentObj);
                          setIsOpenConfirmUpsertModal("department");
                        }}
                      >
                        <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                          事業部
                        </span>
                        <p className="select-none text-[12px]">選択したチームメンバーの事業部を一括で変更します。</p>
                      </li>
                      <li
                        className={`${styles.dropdown_list_item} flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          // handleChangeRoleTogether("company_manager");
                          if (!departmentDataArray || departmentDataArray?.length === 0) {
                            alert(
                              "事業所・営業所リストがありません。先に「会社・チーム」から事業所・営業所を作成してください。"
                            );
                            return;
                          }
                          const firstDepartmentObj = [...departmentDataArray].sort((a, b) => {
                            if (a.department_name === null) return 1; // null値をリストの最後に移動
                            if (b.department_name === null) return -1;
                            return a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en");
                          })[0];
                          setSelectedDepartment(firstDepartmentObj);

                          if (!unitDataArray || unitDataArray?.length === 0) {
                            alert(
                              "係・チームリストがありません。先に「会社・チーム」から係・チームを作成してください。"
                            );
                            return;
                          }
                          const filteredUnitList = unitDataArray.filter(
                            (unit) => unit.created_by_department_id === firstDepartmentObj.id
                          );
                          setFilteredUnitBySelectedDepartment(filteredUnitList);
                          if (!filteredUnitList || filteredUnitList?.length === 0) {
                            alert(
                              "係・チームリストがありません。先に「会社・チーム」から係・チームを作成してください。"
                            );
                            return;
                          }
                          const firstUnitObj = [...filteredUnitList].sort((a, b) => {
                            if (a.unit_name === null) return 1; // null値をリストの最後に移動
                            if (b.unit_name === null) return -1;
                            return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en");
                          })[0];
                          setSelectedUnit(firstUnitObj);
                          setIsOpenConfirmUpsertModal("unit");
                        }}
                      >
                        <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                          係・チーム
                        </span>
                        <p className="select-none text-[12px]">
                          選択したチームメンバーの係・チームを一括で変更します。
                        </p>
                      </li>
                      <li
                        className={`${styles.dropdown_list_item} flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          // handleChangeRoleTogether("company_member");
                          if (!officeDataArray || officeDataArray?.length === 0) {
                            alert(
                              "事業所・営業所リストが未設定です。先に「会社・チーム」から事業所・営業所を作成してください。"
                            );
                            return;
                          }
                          const firstOfficeObj = [...officeDataArray].sort((a, b) => {
                            if (a.office_name === null) return 1; // null値をリストの最後に移動
                            if (b.office_name === null) return -1;
                            return a.office_name.localeCompare(b.office_name, language === "ja" ? "ja" : "en");
                          })[0];
                          setSelectedOffice(firstOfficeObj);
                          setIsOpenConfirmUpsertModal("office");
                        }}
                      >
                        <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                          事業所・営業所
                        </span>
                        <p className="select-none text-[12px]">
                          選択したチームメンバーの事業所・営業所を一括で変更します。
                        </p>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>
            {/* チーム役割変更アイコン */}
            <div
              className={`flex-center relative h-[35px] w-[35px] cursor-pointer rounded-[4px] text-[20px] hover:bg-[var(--setting-bg-sub)] ${
                openChangeRoleTogetherMenu ? `bg-[var(--setting-bg-sub)]` : ``
              }`}
              data-text="役割を変更"
              onMouseEnter={(e) => {
                if (openChangeRoleTogetherMenu) return;
                handleOpenTooltip(e, "top");
              }}
              onMouseLeave={handleCloseTooltip}
              onClick={() => setOpenChangeRoleTogetherMenu(true)}
            >
              <HiOutlineUsers className="stroke-2" />
              {/* =============== まとめて役割変更ドロップダウンメニュー =============== */}
              {openChangeRoleTogetherMenu && (
                <>
                  {/* <div
                    className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-red-100"
                    onClick={() => setOpenChangeRoleTogetherMenu(false)}
                  ></div> */}

                  {/* 通常時 h-[152px] 招待中時 */}
                  <div className="shadow-all-md border-real-with-shadow  absolute left-[-calc(200px-50%)] top-[-331px] z-[2000] h-auto min-w-[400px] rounded-[8px] bg-[var(--color-bg-dropdown-menu)]">
                    <ul className={`flex flex-col py-[0px]`}>
                      <li
                        className={`${styles.dropdown_list_item} flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          handleChangeRoleTogether("company_admin");
                        }}
                      >
                        <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                          管理者
                        </span>
                        <p className="select-none text-[12px]">
                          会社・チームの編集、メンバーの管理、招待、製品の追加、編集ができます。
                        </p>
                      </li>
                      <li
                        className={`${styles.dropdown_list_item} flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          handleChangeRoleTogether("company_manager");
                        }}
                      >
                        <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                          マネージャー
                        </span>
                        <p className="select-none text-[12px]">
                          製品の追加、編集、チーム全体の成果の確認、他メンバーの活動の編集、削除が可能です。
                        </p>
                      </li>
                      <li
                        className={`${styles.dropdown_list_item} flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          handleChangeRoleTogether("company_member");
                        }}
                      >
                        <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                          メンバー
                        </span>
                        <p className="select-none text-[12px]">係、ユニット、メンバー自身の成果の確認が可能です。</p>
                      </li>
                      <li
                        className={`${styles.dropdown_list_item} flex min-h-[78px] w-full cursor-pointer flex-col space-y-1 px-[14px] py-[10px] pr-[18px] text-[var(--color-text-title)] hover:bg-[var(--color-bg-sub)]`}
                        onClick={() => {
                          handleChangeRoleTogether("guest");
                        }}
                      >
                        <span className={`${styles.dropdown_list_item_title} select-none text-[14px] font-bold`}>
                          ゲスト
                        </span>
                        <p className="select-none text-[12px]">
                          通常の営業活動の記録、編集のみ行えます。一時的に営業活動に参画してもらう担当者に最適です。
                        </p>
                      </li>
                      {/* <li className="flex-center h-[16px] w-full">
                        <hr className="w-full border-t border-solid border-[var(--color-border-table)]" />
                      </li> */}
                    </ul>
                  </div>
                </>
              )}
              {/* まとめて役割変更ドロップダウンメニュー ここまで */}
            </div>
            <div
              className="flex-center relative h-[35px] w-[35px] cursor-pointer rounded-[4px] text-[20px] hover:bg-[var(--setting-bg-sub)]"
              data-text="メンバーをチームから削除"
              onMouseEnter={(e) => handleOpenTooltip(e, "top")}
              onMouseLeave={handleCloseTooltip}
              onClick={() => setOpenRemoveTeamTogetherModal(true)}
            >
              <FiTrash2 />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end">
          <div className="flex-center space-x-3">
            <div className="flex-center h-[35px] w-[35px]">
              <div
                className={`${styles.grid_select_cell_header} ${styles.checked_area_input_cell}`}
                // data-text="全てのメンバーを選択"
                // data-text={`${
                //   checkedMembersArray.includes(false) ? `全てのメンバーを選択` : `全てのメンバーのチェックを外す`
                // }`}
                data-text={`${
                  checkedMembersArray.some((member) => member === null)
                    ? `全メンバーを選択`
                    : `全メンバーのチェックを外す`
                }`}
                onMouseEnter={(e) => handleOpenTooltip(e, "top")}
                onMouseLeave={handleCloseTooltip}
              >
                <input
                  type="checkbox"
                  // checked={checkedMembersArray[index]}
                  // onChange={() => {
                  //   const newCheckedArray = [...checkedMembersArray];
                  //   newCheckedArray[index] = !checkedMembersArray[index];
                  //   setCheckedMembersArray(newCheckedArray);
                  // defaultChecked={true}
                  // checked={!checkedMembersArray.includes(false)}
                  // checked={checkedMembersArray.some((id) => id !== null)}
                  checked={checkedMembersArray.every((member) => member !== null)}
                  onChange={() => {
                    // if (checkedMembersArray.includes(false)) {
                    //   const newCheckArray = checkedMembersArray.map((value) => true);
                    //   console.log("全てをチェック", newCheckArray);
                    //   setCheckedMembersArray(newCheckArray);
                    // } else {
                    //   const newCheckArray = checkedMembersArray.map((value) => false);
                    //   console.log("全てのチェックを外す", newCheckArray);
                    //   setCheckedMembersArray(newCheckArray);
                    // }
                    // チェックが
                    // if (checkedMembersArray.some((id) => id !== null)) {
                    if (!checkedMembersArray.every((member) => member !== null)) {
                      // const newCheckArray = checkedMembersArray.map((value, index) => true);
                      // console.log("全てをチェック", newCheckArray);
                      // setCheckedMembersArray(newCheckArray);
                      console.log("全てをチェック", allCheckedMemberIdsArray);
                      setCheckedMembersArray(allCheckedMemberIdsArray);
                    } else {
                      // const newCheckArray = checkedMembersArray.map((value) => false);
                      const newCheckArray = checkedMembersArray.map((member) => null);
                      console.log("全てのチェックを外す", newCheckArray);
                      setCheckedMembersArray(newCheckArray);
                      if (openChangeRoleTogetherMenu) setOpenChangeRoleTogetherMenu(false);
                      if (openChangeMemberDetailMenu) setOpenChangeMemberDetailMenu(false);
                    }
                  }}
                  onClick={() => {}}
                  // checked={checked}
                  // onChange={() => setChecked(!checked)}
                  className={`${styles.checked_area_input} relative`}
                />
                <svg viewBox="0 0 16 16" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z" />
                </svg>
              </div>
            </div>
            <div
              className="flex-center h-[35px] w-[35px] cursor-pointer rounded-[4px] text-[24px] hover:bg-[var(--setting-bg-sub)]"
              onClick={() => {
                // const newCheckArray = checkedMembersArray.map((value) => false);
                const newCheckArray = checkedMembersArray.map((member) => null);
                console.log("クローズクリック", newCheckArray);
                setCheckedMembersArray(newCheckArray);
                if (openChangeRoleTogetherMenu) setOpenChangeRoleTogetherMenu(false);
                if (openChangeMemberDetailMenu) setOpenChangeMemberDetailMenu(false);
              }}
            >
              <MdClose className="" />
            </div>
          </div>
        </div>
      </div>
      {/* ============================== 一括でチームから削除モーダル ============================== */}
      {openRemoveTeamTogetherModal && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay)] backdrop-blur-sm"
            onClick={() => {
              console.log("オーバーレイ クリック");
              setOpenRemoveTeamTogetherModal(false);
              //   setNotificationDataState(null);
            }}
          ></div>
          {/* <div className="fade02 fixed left-[50%] top-[50%] z-[2000] h-auto max-h-[284px] w-[40vw] max-w-[576px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)]"> */}
          <div className={`fade02 ${styles.confirm_modal}`}>
            {loading && (
              <div className={`flex-center fixed left-0 top-0 z-[3000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}>
                <SpinnerIDS scale={"scale-[0.5]"} />
              </div>
            )}
            {/* クローズボタン */}
            <button
              className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
              onClick={() => {
                setOpenRemoveTeamTogetherModal(false);
                // setNotificationDataState(null);
              }}
            >
              <MdClose className="text-[20px] text-[#fff]" />
            </button>
            <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
              選択したチームのメンバーを削除しますか？
            </h3>
            <section className={`mt-[20px] flex h-auto w-full flex-col text-[14px]`}>
              <p>これらの人を削除すると、削除された人が保存したデータやコンテンツにアクセスできなくなります。</p>
            </section>
            <section className="flex w-full items-start justify-end">
              <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[30px]`}>
                <button
                  className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={() => setOpenRemoveTeamTogetherModal(false)}
                >
                  キャンセル
                </button>
                <button
                  className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-red-tk)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-red-tk-hover)]"
                  onClick={handleRemoveFromTeamTogether}
                >
                  チームから削除する
                </button>
              </div>
            </section>
          </div>
        </>
      )}
      {/* ============================== 一括でチームから削除モーダル ここまで ============================== */}
      {/* ================ 一括でチームメンバーの事業部・係・事業所のどれかを変更するモーダル ================ */}
      {isOpenConfirmUpsertModal && (
        <>
          {/* オーバーレイ */}
          <div
            className="fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[var(--color-overlay)] backdrop-blur-sm"
            onClick={() => {
              if (isLoadingUpsertMember) return;
              setIsOpenConfirmUpsertModal(null);
              setOpenChangeMemberDetailMenu(false);
              if (selectedDepartment) setSelectedDepartment(null);
              if (selectedUnit) setSelectedUnit(null);
              if (selectedOffice) setSelectedOffice(null);
            }}
          ></div>
          {/* ローディングオーバーレイ */}
          {/* {!isLoadingUpsertMember && (
            <div className={`fixed left-[-100vw] top-[-100vh] z-[1000] h-[200vh] w-[200vw] bg-[#00000000]`}>
              <SpinnerComet h="60px" w="60px" s="5px" />
            </div>
          )} */}
          <div
            className={`fade02 fixed left-[50%] top-[50%] z-[2000] h-auto w-[40vw] max-w-[580px] translate-x-[-50%] translate-y-[-50%] rounded-[8px] bg-[var(--color-bg-notification-modal)] p-[32px] text-[var(--color-text-title)] ${
              (isOpenConfirmUpsertModal === "department" || isOpenConfirmUpsertModal === "office") && `max-h-[321px]`
            } ${isOpenConfirmUpsertModal === "unit" && `max-h-[371px]`}`}
          >
            {isLoadingUpsertMember && (
              <div
                className={`flex-center absolute left-0 top-0 z-[3000] h-[100%] w-[100%] rounded-[8px] bg-[#00000090]`}
              >
                {/* <SpinnerIDS scale={"scale-[0.5]"} /> */}
                <SpinnerComet h="60px" w="60px" s="5px" />
              </div>
            )}
            {/* クローズボタン */}
            <button
              className={`flex-center group absolute right-[-40px] top-0 z-[100] h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0] ${
                isLoadingUpsertMember ? `cursor-not-allowed` : ``
              }`}
              onClick={() => {
                if (isLoadingUpsertMember) return;
                setIsOpenConfirmUpsertModal(null);
                setOpenChangeMemberDetailMenu(false);
                if (selectedDepartment) setSelectedDepartment(null);
                if (selectedUnit) setSelectedUnit(null);
                if (selectedOffice) setSelectedOffice(null);
              }}
              // onClick={clickEventClose}
            >
              <MdClose className="text-[20px] text-[#fff]" />
            </button>
            <h3 className={`flex min-h-[32px] w-full items-center text-[22px] font-bold`}>
              {isOpenConfirmUpsertModal === "department" && "どの事業部に変更しますか？"}
              {isOpenConfirmUpsertModal === "unit" && "どの係・チームに変更しますか？"}
              {isOpenConfirmUpsertModal === "office" && "どの事業所・営業所に変更しますか？"}
            </h3>
            <section className={`mt-[20px] flex h-auto min-h-max w-full flex-col space-y-2 text-[14px]`}>
              <h1>
                {isOpenConfirmUpsertModal === "department" && "変更先の事業部を選択してください。"}
                {isOpenConfirmUpsertModal === "unit" && "変更先の係・チームを選択してください。"}
                {isOpenConfirmUpsertModal === "office" && "変更先の事業所・営業所を選択してください。"}
              </h1>

              <div
                className={`flex items-center justify-between space-x-[40px] ${
                  (isOpenConfirmUpsertModal === "department" || isOpenConfirmUpsertModal === "office") && "!my-[30px]"
                } ${isOpenConfirmUpsertModal === "unit" && "!mt-[30px]"}`}
              >
                <div className="min-w-max">
                  <span className="text-[15px] font-bold">
                    {(isOpenConfirmUpsertModal === "department" || isOpenConfirmUpsertModal === "unit") &&
                      "変更先の事業部"}
                    {isOpenConfirmUpsertModal === "office" && "変更先の事業所・営業所"}
                  </span>
                </div>
                <div className="flex w-full justify-end">
                  {(isOpenConfirmUpsertModal === "department" || isOpenConfirmUpsertModal === "unit") && (
                    <select
                      className={`${styles.select_box} ${styles.confirm}`}
                      value={!!selectedDepartment ? selectedDepartment.id : ""}
                      onChange={(e) => {
                        if (!departmentDataArray) return;
                        const selectedDepartmentObj = departmentDataArray.find((obj) => obj.id === e.target.value);
                        console.log("e.target.value", e.target.value, "selectedDepartmentObj", selectedDepartmentObj);
                        if (selectedDepartmentObj === undefined) {
                          return alert("エラー：事業部データの取得にエラーが発生しました。");
                        }
                        setSelectedDepartment(selectedDepartmentObj);

                        if (isOpenConfirmUpsertModal === "unit") {
                          if (!unitDataArray || unitDataArray?.length === 0) {
                            setFilteredUnitBySelectedDepartment([]);
                            return;
                          }
                          const filteredUnitList = unitDataArray.filter(
                            (unit) => unit.created_by_department_id === selectedDepartmentObj.id
                          );

                          const sortedUnitList = [...filteredUnitList].sort((a, b) => {
                            if (a.unit_name === null) return 1; // null値をリストの最後に移動
                            if (b.unit_name === null) return -1;
                            return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en");
                          });

                          const firstUnitObj = sortedUnitList?.length >= 1 ? sortedUnitList[0] : null;

                          setFilteredUnitBySelectedDepartment(sortedUnitList);
                          setSelectedUnit(firstUnitObj);
                        }
                      }}
                    >
                      {/* <option value="">すべての事業部</option> */}
                      {!!departmentDataArray &&
                        [...departmentDataArray]
                          .sort((a, b) => {
                            if (a.department_name === null) return -1; //null値をリストの最後に移動
                            if (b.department_name === null) return 1;
                            return a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en");
                          })
                          .map((department, index) => (
                            <option key={department.id} value={department.id}>
                              {department.department_name}
                            </option>
                          ))}
                    </select>
                  )}
                  {isOpenConfirmUpsertModal === "office" && (
                    <select
                      className={`${styles.select_box} ${styles.confirm}`}
                      value={!!selectedOffice ? selectedOffice.id : ""}
                      onChange={(e) => {
                        if (!officeDataArray) return;
                        const selectedOfficeObj = officeDataArray.find((obj) => obj.id === e.target.value);
                        console.log("e.target.value", e.target.value, "selectedOfficeObj", selectedOfficeObj);
                        if (selectedOfficeObj === undefined) {
                          return alert("エラー：事業部データの取得にエラーが発生しました。");
                        }
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
                    </select>
                  )}
                </div>
              </div>

              {isOpenConfirmUpsertModal === "unit" && (
                <div className={`!mb-[30px] !mt-[20px] flex items-center justify-between space-x-[40px]`}>
                  <div className="min-w-max">
                    <span className="text-[15px] font-bold">変更先の係・チーム</span>
                  </div>

                  <div className="flex w-full justify-end">
                    {filteredUnitBySelectedDepartment && filteredUnitBySelectedDepartment.length >= 1 && (
                      <select
                        className={`${styles.select_box} ${styles.confirm}`}
                        value={!!selectedUnit ? selectedUnit.id : ""}
                        onChange={(e) => {
                          if (!filteredUnitBySelectedDepartment) return;
                          const selectedUnitObj = filteredUnitBySelectedDepartment.find(
                            (obj) => obj.id === e.target.value
                          );
                          console.log("e.target.value", e.target.value, "selectedUnitObj", selectedUnitObj);
                          if (selectedUnitObj === undefined) {
                            return alert("エラー：事業部データの取得にエラーが発生しました。");
                          }
                          setSelectedUnit(selectedUnitObj);
                        }}
                      >
                        {/* <option value="">すべての事業部</option> */}
                        {/* {!!filteredUnitBySelectedDepartment &&
                          [...filteredUnitBySelectedDepartment]
                            .sort((a, b) => {
                              if (a.unit_name === null || b.unit_name === null) return 0;
                              return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en") ?? 0;
                            }) */}
                        {!!filteredUnitBySelectedDepartment &&
                          filteredUnitBySelectedDepartment.map((unit, index) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.unit_name}
                            </option>
                          ))}
                      </select>
                    )}
                    {(!filteredUnitBySelectedDepartment || filteredUnitBySelectedDepartment.length === 0) && (
                      <div className="flex min-h-[30px] max-w-[307px] items-center text-[13px]">
                        <p className="line-clamp-2">
                          {selectedDepartment && <span>{selectedDepartment?.department_name ?? ""}には</span>}
                          係・チームが存在しません。
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* <p className="!mb-[30px] text-[13px] font-bold">
                注：この操作は変更するメンバーの人数によって少し時間がかかります。画面を閉じずにお待ちください。
              </p> */}
            </section>
            <section className="flex w-full flex-col items-start justify-end">
              <div className={`flex w-[100%] items-center justify-around space-x-5 pt-[0px]`}>
                <button
                  className={`transition-bg01 w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-title)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                  onClick={() => {
                    if (isLoadingUpsertMember) return;
                    setIsOpenConfirmUpsertModal(null);
                    setOpenChangeMemberDetailMenu(false);
                    if (selectedDepartment) setSelectedDepartment(null);
                    if (selectedUnit) setSelectedUnit(null);
                    if (selectedOffice) setSelectedOffice(null);
                  }}
                  // onClick={clickEventClose}
                >
                  戻る
                </button>
                <button
                  className="transition-bg01 w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-hover)]"
                  // onClick={clickEventSubmit}
                  onClick={() => {
                    if (isLoadingUpsertMember) return;
                    if (isOpenConfirmUpsertModal === "department") {
                      if (!selectedDepartment || !selectedDepartment?.id) {
                        alert("エラー：事業部データが見つかりませんでした。");
                        setIsOpenConfirmUpsertModal(null);
                        setOpenChangeMemberDetailMenu(false);
                        if (selectedDepartment) setSelectedDepartment(null);
                        if (selectedUnit) setSelectedUnit(null);
                        if (selectedOffice) setSelectedOffice(null);
                        return;
                      }
                      const payload = {
                        title: "department",
                        departmentId: selectedDepartment.id,
                      };
                      handleChangeMemberDetailAllAtOnce(payload);
                    }

                    if (isOpenConfirmUpsertModal === "unit") {
                      if (!selectedDepartment || !selectedDepartment?.id || !selectedUnit || !selectedUnit?.id) {
                        if (!selectedDepartment || !selectedDepartment?.id)
                          alert("エラー：事業部データが見つかりませんでした。");
                        if (!selectedUnit || !selectedUnit?.id)
                          alert("エラー：係・チームデータが見つかりませんでした。");
                        setIsOpenConfirmUpsertModal(null);
                        setOpenChangeMemberDetailMenu(false);
                        if (selectedDepartment) setSelectedDepartment(null);
                        if (selectedUnit) setSelectedUnit(null);
                        if (selectedOffice) setSelectedOffice(null);
                        return;
                      }
                      const payload = {
                        title: "unit",
                        departmentId: selectedDepartment.id,
                        unitId: selectedUnit.id,
                      };
                      handleChangeMemberDetailAllAtOnce(payload);
                    }

                    if (isOpenConfirmUpsertModal === "office") {
                      if (!selectedOffice || !selectedOffice?.id) {
                        alert("エラー：事業所・営業所データが見つかりませんでした。");
                        setIsOpenConfirmUpsertModal(null);
                        setOpenChangeMemberDetailMenu(false);
                        if (selectedDepartment) setSelectedDepartment(null);
                        if (selectedUnit) setSelectedUnit(null);
                        if (selectedOffice) setSelectedOffice(null);
                        return;
                      }
                      const payload = {
                        title: "office",
                        officeId: selectedOffice.id,
                      };
                      handleChangeMemberDetailAllAtOnce(payload);
                    }
                  }}
                >
                  変更する
                </button>
              </div>
              <p className="mt-[20px] text-[13px] font-bold">
                注：この操作は変更するメンバーの人数によって少し時間がかかります。画面を閉じずにお待ちください。
              </p>
            </section>
          </div>
        </>
      )}
      {/* ================ 一括でチームメンバーの事業部・係・事業所のどれかを変更するモーダル ここまで ================ */}
    </>
  );
};

export const SettingMemberAccounts = memo(SettingMemberAccountsMemo);
