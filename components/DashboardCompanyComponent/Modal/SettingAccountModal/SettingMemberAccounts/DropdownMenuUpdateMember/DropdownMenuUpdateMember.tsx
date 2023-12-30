import useDashboardStore from "@/store/useDashboardStore";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import styles from "./DropdownMenuUpdateMember.module.css";
import { MdOutlineDataSaverOff } from "react-icons/md";
import NextImage from "next/image";
import { Department, Employee_id, MemberAccounts, Office, Unit, UserProfileCompanySubscription } from "@/types";
import useStore from "@/store";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";

type EditedMemberData = {
  department_id: Department["id"] | null;
  unit_id: Unit["id"] | null;
  office_id: Office["id"] | null;
  employee_id_name: Employee_id["id"] | null;
};
type ClickedItemPos = { displayPos: "up" | "center" | "down"; clickedItemWidth: number | null };

type Props = {
  memberAccount: MemberAccounts;
  setIsOpenDropdownMenuUpdateMember: Dispatch<SetStateAction<boolean>>;
  clickedItemPositionMember: ClickedItemPos;
  //   filterCondition: FilterCondition;
  //   setFilterCondition: Dispatch<React.SetStateAction<FilterCondition>>;
  // setIsComposing: Dispatch<React.SetStateAction<boolean>>;
};

export const DropDownMenuUpdateMember = ({
  memberAccount,
  setIsOpenDropdownMenuUpdateMember,
  clickedItemPositionMember,
}: //   filterCondition,
//   setFilterCondition,
// setIsComposing,
Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const language = useStore((state) => state.language);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  const menuRef = useRef<HTMLDivElement | null>(null);

  const [editedMemberData, setEditedMemberData] = useState<EditedMemberData>({
    department_id: memberAccount.assigned_department_id ? memberAccount.assigned_department_id : "",
    unit_id: memberAccount.assigned_unit_id ? memberAccount.assigned_unit_id : "",
    office_id: memberAccount.assigned_office_id ? memberAccount.assigned_office_id : "",
    employee_id_name: memberAccount.assigned_employee_id_name ? memberAccount.assigned_employee_id_name : "",
  });

  const cacheDepartmentsArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const cacheUnitsArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const cacheOfficesArray: Office[] | undefined = queryClient.getQueryData(["offices"]);

  // メニュー高さに合わせてtop、クリックアイテムの横幅に合わせてleftを変更
  useEffect(() => {
    if (menuRef.current) {
      const menuHeight = menuRef.current.getBoundingClientRect().height;
      menuRef.current.style.left = `${clickedItemPositionMember.clickedItemWidth}px`;
      if (clickedItemPositionMember.displayPos === "up") {
        menuRef.current.style.top = `${-menuHeight + 36}px`;
        // if (memberAccount.profile_name) {
        //   // menuRef.current.style.top = `${-36 - menuHeight}px`;
        //   menuRef.current.style.top = `${-menuHeight + 36}px`;
        // } else {
        //   // menuRef.current.style.top = `${-36 - menuHeight - 40}px`;
        //   menuRef.current.style.top = `${-menuHeight - 40}px`;
        // }
      } else if (clickedItemPositionMember.displayPos === "center") {
        menuRef.current.style.top = `${-menuHeight / 2}px`;
      } else {
        // menuRef.current.style.top = `${36 + 10}px`;
        menuRef.current.style.top = `${0}px`;
      }
    }
  }, []);

  // ======================= 🌟現在の選択した事業部でチームを絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  useEffect(() => {
    // 選択中の事業部が変化するか、cacheUnitsArrayの内容に変更があったら新たに絞り込んで更新する
    if (cacheUnitsArray && cacheUnitsArray?.length >= 1 && !!editedMemberData.department_id) {
      const filteredUnitArray = cacheUnitsArray.filter(
        (unit) => unit.created_by_department_id === editedMemberData.department_id
      );
      setFilteredUnitBySelectedDepartment(filteredUnitArray);
    }
  }, [cacheUnitsArray, memberAccount?.assigned_department_id, editedMemberData.department_id]);
  console.log("フィルターfilteredUnitBySelectedDepartment", filteredUnitBySelectedDepartment);
  // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================

  console.log("DropDownMenuUpdateMember", cacheDepartmentsArray);
  console.log("DropDownMenuUpdateMember", cacheUnitsArray);
  console.log("DropDownMenuUpdateMember", cacheOfficesArray);

  const handleUpdateSubmit = async () => {
    if (!userProfileState?.company_id) {
      alert("エラー：会社データが見つかりませんでした。");
      return;
    }
    // 全て未設定ならそのまま閉じる
    if (Object.values(editedMemberData).every((value) => value === "" || value === null)) {
      setIsOpenDropdownMenuUpdateMember(false);
      return;
    }
    // 現在のメンバーの値と全て変わらない場合はメニューを閉じる
    const isMatchDepartment = editedMemberData.department_id === memberAccount.assigned_department_id;
    const isMatchUnit = editedMemberData.unit_id === memberAccount.assigned_unit_id;
    const isMatchOffice = editedMemberData.office_id === memberAccount.assigned_office_id;
    const isMatchEmployeeIdName = editedMemberData.employee_id_name === memberAccount.assigned_employee_id_name;
    if (isMatchDepartment && isMatchUnit && isMatchOffice && isMatchEmployeeIdName) {
      console.log("全て同じためリターン");
      setIsOpenDropdownMenuUpdateMember(false);
      return;
    }
    let newDepartmentId = null;
    let newUnitId = null;
    let newOfficeId = null;
    let newEmployeeIdName = null;
    // 一つ以上設定されてるルート
    // 事業部
    if (!!editedMemberData.department_id) {
      // newDepartmentObj = cacheDepartmentsArray?.filter((departmentObj) => departmentObj.id === editedMemberData.department_id);
      newDepartmentId = editedMemberData.department_id;
    }
    // 係・チーム
    if (!!editedMemberData.unit_id) {
      // newUnitObj = cacheUnitsArray?.filter(
      //   (unitObj) => unitObj.id === editedMemberData.unit_id
      // );
      newUnitId = editedMemberData.unit_id;
    }
    // 事業所・営業所
    if (!!editedMemberData.office_id) {
      // newOfficeObj = cacheOfficesArray?.filter(
      //   (officeObj) => officeObj.id === editedMemberData.office_id
      // );
      newOfficeId = editedMemberData.office_id;
    }
    // 社員番号・ID
    if (!!editedMemberData.employee_id_name) {
      newEmployeeIdName = editedMemberData.employee_id_name;
    }
    console.log("結果");
    console.log("newDepartmentId", newDepartmentId);
    console.log("newUnitId", newUnitId);
    console.log("newOfficeId", newOfficeId);
    console.log("newEmployeeIdName", newEmployeeIdName);

    try {
      // 各テーブルの変数がnullの場合にはUPSERTは行わず、null以外のテーブルのみUPSERTを実行
      // unit_assignmentsテーブルのUPSERT有りルート
      const upsertPayload = {
        _user_id: memberAccount.id,
        _company_id: userProfileState.company_id,
        _department_id: newDepartmentId,
        _unit_id: newUnitId,
        _office_id: newOfficeId,
        _employee_id_name: newEmployeeIdName,
        _execute_department_upsert: !!newDepartmentId,
        _execute_unit_upsert: !!newUnitId,
        _execute_office_upsert: !!newOfficeId,
        _execute_employee_id_upsert: !!newEmployeeIdName,
      };
      console.log("upsertPayload", upsertPayload);

      const { error } = await supabase.rpc("upsert_member_assignments", upsertPayload);

      if (error) throw error;

      console.log("事業部UPDATE成功 upsertPayload", upsertPayload);
      // UPSERT成功 自分の更新だった場合にはZustandのuserProfileStateを更新してmember_accountsキャッシュのみinValidate
      // 自身の更新だった場合
      if (memberAccount.id === userProfileState.id) {
        let newUserProfile = { ...userProfileState };

        // 事業部
        if (!!newDepartmentId) {
          //  const newDepartmentObj = cacheDepartmentsArray?.filter((departmentObj) => departmentObj.id === editedMemberData.department_id);
          const newDepartmentObj = cacheDepartmentsArray?.filter(
            (departmentObj) => departmentObj.id === editedMemberData.department_id
          )[0];
          if (newDepartmentObj) {
            newUserProfile = {
              ...newUserProfile,
              department: newDepartmentObj.department_name,
              assigned_department_id: newDepartmentObj.id,
              assigned_department_name: newDepartmentObj.department_name,
            };
          }
        }

        // 係
        if (!!newUnitId) {
          const newUnitObj = cacheUnitsArray?.filter((unitObj) => unitObj.id === editedMemberData.unit_id)[0];
          if (newUnitObj) {
            newUserProfile = {
              ...newUserProfile,
              unit: newUnitObj.unit_name,
              assigned_unit_id: newUnitObj.id,
              assigned_unit_name: newUnitObj.unit_name,
            };
          }
        }

        // オフィス
        if (!!newOfficeId) {
          const newOfficeObj = cacheOfficesArray?.filter((officeObj) => officeObj.id === editedMemberData.office_id)[0];
          if (newOfficeObj) {
            newUserProfile = {
              ...newUserProfile,
              office: newOfficeObj.office_name,
              assigned_office_id: newOfficeObj.id,
              assigned_office_name: newOfficeObj.office_name,
            };
          }
        }

        // 社員番号
        if (!!newEmployeeIdName) {
        }
      }

      // setUserProfileState({
      //   ...(userProfileState as UserProfileCompanySubscription),
      //   department:
      // });
    } catch (e: any) {
      console.error("UPSERTエラー e", e);
      toast.error("メンバーの更新に失敗しました🙇‍♀️");
      setIsOpenDropdownMenuUpdateMember(false);
    }
  };

  return (
    <>
      {/* オーバーレイ */}
      {/* <div
        className="fixed left-[-100vw] top-[-50%] z-[1000] h-[200vh] w-[300vw] bg-[#00000000]"
        onClick={() => {
          setIsOpenDropdownMenuUpdateMember(false);
        }}
      ></div> */}
      {/* モーダル */}
      <div
        ref={menuRef}
        className={`shadow-all-md border-real-with-shadow fade03 absolute left-[0px] z-[20000] flex h-auto w-fit min-w-[276px] flex-col rounded-[4px] bg-[var(--color-edit-bg-solid)] ${
          clickedItemPositionMember.displayPos === "down" ? `top-[60px]` : "top-[-210px]"
        }`}
      >
        {/* 説明エリア */}
        <div className={`relative flex h-auto w-full flex-col items-start space-y-[6px] px-[24px] py-[16px]`}>
          <h2 className="flex items-center space-x-[12px] text-[16px] font-bold text-[var(--color-text-title)]">
            <span>メンバー編集</span>
            <span>
              {/* <img width="24" height="24" src="https://img.icons8.com/3d-fluency/24/job.png" alt="job" /> */}
              {/* <NextImage width={24} height={24} src={`https://img.icons8.com/3d-fluency/24/job.png`} alt="setting" /> */}
              <NextImage
                width={24}
                height={24}
                src={`/assets/images/icons/business/icons8-process-94.png`}
                alt="setting"
              />
            </span>
          </h2>
          <p className="text-start text-[12px] text-[var(--color-text-title)]">
            メンバーの「事業部」「係・チーム」「事業所・営業所」「社員番号・ID」の編集が可能です。メンバー編集は管理者以上の権限を持つユーザーのみ許可されます。
          </p>
        </div>

        {/* <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" /> */}
        <hr className="min-h-[1px] w-full bg-[var(--color-border-light)]" />

        {/* テーマ・アカウント設定エリア */}
        <div className="flex w-full flex-col">
          <ul className={`flex flex-col px-[1px] pb-[1px] text-[13px] text-[var(--color-text-title)]`}>
            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
              //   onMouseEnter={() => setHoveredThemeMenu(true)}
              //   onMouseLeave={() => setHoveredThemeMenu(false)}
            >
              <div className="flex min-w-[145px] items-center ">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>事業部</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div>
                <select
                  className={` ml-auto h-full w-full ${styles.select_box} truncate`}
                  // value={isFetchAllCompanies ? `All` : `Own`}
                  value={editedMemberData.department_id ? editedMemberData.department_id : ""}
                  onChange={(e) => {
                    // setIsOpenDropdownMenuUpdateMember(false);
                    // setIsFetchAllCompanies(e.target.value === "All");
                    let newCondition: EditedMemberData;
                    if (editedMemberData.unit_id) {
                      newCondition = { ...editedMemberData, department_id: e.target.value, unit_id: "" };
                    } else {
                      newCondition = { ...editedMemberData, department_id: e.target.value };
                    }
                    setEditedMemberData(newCondition);
                  }}
                >
                  {/* <option value="">すべての事業部</option> */}
                  {!memberAccount.assigned_department_id && <option value="">未設定</option>}
                  {!!cacheDepartmentsArray &&
                    [...cacheDepartmentsArray]
                      .sort((a, b) => {
                        if (a.department_name === null || b.department_name === null) return 0;
                        return a.department_name.localeCompare(b.department_name, language === "ja" ? "ja" : "en") ?? 0;
                      })
                      .map(
                        (department, index) =>
                          !!department &&
                          department.department_name && (
                            <option key={department.id} value={department.id}>
                              {department.department_name}
                            </option>
                          )
                      )}
                </select>
              </div>
            </li>

            {/* <hr className={`min-h-[1px] w-full bg-[var(--color-border-light)]`} /> */}

            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
            >
              <div className="flex min-w-[145px] items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>係・チーム</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div className={`${styles.list_right_area}`}>
                {!editedMemberData.department_id && (
                  <div className={`ml-auto h-full w-full min-w-[185px]`}>
                    <p className={`text-[12px]`}>先に事業部を設定してください</p>
                  </div>
                )}
                {!!editedMemberData.department_id && filteredUnitBySelectedDepartment?.length === 0 && (
                  <div className={`ml-auto h-full w-full min-w-[185px]`}>
                    <p className={`text-[12px]`}>係を作成してください</p>
                  </div>
                )}
                {!!editedMemberData.department_id && filteredUnitBySelectedDepartment?.length >= 1 && (
                  <select
                    className={` ml-auto h-full w-full ${styles.select_box}`}
                    value={editedMemberData.unit_id ? editedMemberData.unit_id : ""}
                    onChange={(e) => {
                      // setIsOpenDropdownMenuUpdateMember(false);
                      // setIsFetchAllCompanies(e.target.value === "All");
                      const newCondition = { ...editedMemberData, unit_id: e.target.value };
                      setEditedMemberData(newCondition);
                    }}
                  >
                    {/* <option value="">すべての係・チーム</option> */}
                    {!memberAccount.assigned_unit_id && <option value="">未設定</option>}
                    {!!filteredUnitBySelectedDepartment &&
                      [...filteredUnitBySelectedDepartment]
                        .sort((a, b) => {
                          if (a.unit_name === null || b.unit_name === null) return 0;
                          return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en") ?? 0;
                        })
                        .map(
                          (unit, index) =>
                            !!unit &&
                            unit.unit_name && (
                              <option key={unit.id} value={unit.id}>
                                {unit.unit_name}
                              </option>
                            )
                        )}
                    {/* {!!cacheUnitsArray &&
                      [...cacheUnitsArray]
                        .sort((a, b) => {
                          if (a.unit_name === null || b.unit_name === null) return 0;
                          return a.unit_name.localeCompare(b.unit_name, language === "ja" ? "ja" : "en") ?? 0;
                        })
                        .map(
                          (unit, index) =>
                            !!unit &&
                            unit.unit_name && (
                              <option key={unit.id} value={unit.unit_id}>
                                {unit.unit_name}
                              </option>
                            )
                        )} */}
                  </select>
                )}
              </div>
            </li>

            {/* <hr className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`} /> */}

            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
            >
              <div className="flex min-w-[145px] items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>事業所・営業所</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div className={`${styles.list_right_area}`}>
                <select
                  className={` ml-auto h-full w-full ${styles.select_box}`}
                  value={editedMemberData.office_id ? editedMemberData.office_id : ""}
                  onChange={(e) => {
                    // setIsOpenDropdownMenuUpdateMember(false);
                    // setIsFetchAllCompanies(e.target.value === "All");
                    const newCondition = { ...editedMemberData, office_id: e.target.value };
                    setEditedMemberData(newCondition);
                  }}
                >
                  {/* <option value="">すべての事業所・営業所</option> */}
                  {!memberAccount.assigned_office_id && <option value="">未設定</option>}
                  {!!cacheOfficesArray &&
                    [...cacheOfficesArray]
                      .sort((a, b) => {
                        if (a.office_name === null || b.office_name === null) return 0;
                        return a.office_name.localeCompare(b.office_name, language === "ja" ? "ja" : "en") ?? 0;
                      })
                      .map(
                        (office, index) =>
                          !!office &&
                          office.office_name && (
                            <option key={office.id} value={office.id}>
                              {office.office_name}
                            </option>
                          )
                      )}
                </select>
              </div>
            </li>

            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
            >
              <div className="flex min-w-[145px] items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>社員番号・ID</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div className={`${styles.list_right_area}`}>
                <input
                  type="text"
                  placeholder="社員番号・IDを入力"
                  className={`${styles.input_box}`}
                  value={editedMemberData.employee_id_name ? editedMemberData.employee_id_name : ""}
                  onChange={(e) => setEditedMemberData({ ...editedMemberData, employee_id_name: e.target.value })}
                  // onCompositionStart={() => setIsComposing(true)}
                  // onCompositionEnd={() => setIsComposing(false)}
                  onBlur={() => {
                    if (!editedMemberData.employee_id_name) return;
                    const newCondition = toHalfWidthAndSpace(editedMemberData.employee_id_name.trim());
                    setEditedMemberData({ ...editedMemberData, employee_id_name: newCondition });
                  }}
                />
              </div>
            </li>
          </ul>
        </div>
        {/* ボタンエリア */}
        <div
          className={`flex min-h-[58px] w-full items-center justify-center space-x-[12px] px-[24px] pb-[24px] pt-[12px]`}
        >
          <button
            className="min-h-[32px] w-full rounded-[6px] bg-[var(--color-bg-sub)] py-[6px]  text-[var(--color-text-sub)] hover:bg-[var(--color-bg-sub-hover)]"
            onClick={() => setIsOpenDropdownMenuUpdateMember(false)}
          >
            戻る
          </button>
          <button
            className="min-h-[32px] w-full rounded-[6px] bg-[var(--color-bg-brand-f)] py-[6px] text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
            onClick={handleUpdateSubmit}
          >
            変更を保存
          </button>
        </div>
      </div>
    </>
  );
};
