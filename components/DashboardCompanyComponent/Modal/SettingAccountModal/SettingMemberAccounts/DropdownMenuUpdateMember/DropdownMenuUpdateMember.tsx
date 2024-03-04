import useDashboardStore from "@/store/useDashboardStore";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import styles from "./DropdownMenuUpdateMember.module.css";
import { MdOutlineDataSaverOff } from "react-icons/md";
import NextImage from "next/image";
import {
  Department,
  Employee_id,
  MemberAccounts,
  Office,
  Section,
  Unit,
  UserProfileCompanySubscription,
} from "@/types";
import useStore from "@/store";
import { toHalfWidthAndSpace } from "@/utils/Helpers/toHalfWidthAndSpace";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import { getValueOrNull } from "@/utils/Helpers/getValueOrNull";

type EditedMemberData = {
  // department_id: Department["id"] | null;
  // unit_id: Unit["id"] | null;
  // office_id: Office["id"] | null;
  // employee_id_name: Employee_id["id"] | null;
  department_id: Department["id"];
  section_id: Section["id"];
  unit_id: Unit["id"];
  office_id: Office["id"];
  employee_id_name: Employee_id["id"];
};
type ClickedItemPos = { displayPos: "up" | "center" | "down"; clickedItemWidth: number | null };

type Props = {
  memberAccount: MemberAccounts;
  setIsOpenDropdownMenuUpdateMember: Dispatch<SetStateAction<boolean>>;
  setIsLoadingUpsertMember: Dispatch<SetStateAction<boolean>>;
  clickedItemPositionMember: ClickedItemPos;
  //   filterCondition: FilterCondition;
  //   setFilterCondition: Dispatch<React.SetStateAction<FilterCondition>>;
  // setIsComposing: Dispatch<React.SetStateAction<boolean>>;
};

export const DropDownMenuUpdateMember = ({
  memberAccount,
  setIsOpenDropdownMenuUpdateMember,
  setIsLoadingUpsertMember,
  clickedItemPositionMember,
}: //   filterCondition,
//   setFilterCondition,
// setIsComposing,
Props) => {
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  const language = useStore((state) => state.language);

  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();

  const menuRef = useRef<HTMLDivElement | null>(null);

  // 課なしパターン
  // const [editedMemberData, setEditedMemberData] = useState<EditedMemberData>({
  //   department_id: memberAccount.assigned_department_id ? memberAccount.assigned_department_id : "",
  //   unit_id: memberAccount.assigned_unit_id ? memberAccount.assigned_unit_id : "",
  //   office_id: memberAccount.assigned_office_id ? memberAccount.assigned_office_id : "",
  //   employee_id_name: memberAccount.assigned_employee_id_name ? memberAccount.assigned_employee_id_name : "",
  // });
  // 課ありパターン
  const [editedMemberData, setEditedMemberData] = useState<EditedMemberData>({
    department_id: memberAccount.assigned_department_id ? memberAccount.assigned_department_id : "",
    section_id: memberAccount.assigned_section_id ? memberAccount.assigned_section_id : "",
    unit_id: memberAccount.assigned_unit_id ? memberAccount.assigned_unit_id : "",
    office_id: memberAccount.assigned_office_id ? memberAccount.assigned_office_id : "",
    employee_id_name: memberAccount.assigned_employee_id_name ? memberAccount.assigned_employee_id_name : "",
  });

  const cacheDepartmentsArray: Department[] | undefined = queryClient.getQueryData(["departments"]);
  const cacheSectionsArray: Section[] | undefined = queryClient.getQueryData(["sections"]);
  const cacheUnitsArray: Unit[] | undefined = queryClient.getQueryData(["units"]);
  const cacheOfficesArray: Office[] | undefined = queryClient.getQueryData(["offices"]);

  // メニュー高さに合わせてtop、クリックアイテムの横幅に合わせてleftを変更
  useEffect(() => {
    if (menuRef.current) {
      const menuHeight = menuRef.current.getBoundingClientRect().height;
      menuRef.current.style.left = `${(clickedItemPositionMember.clickedItemWidth ?? 135) + 10}px`;
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

  // 課ありパターン
  // ======================= 🌟現在の選択した事業部で課を絞り込むuseEffect🌟 =======================
  const [filteredSectionBySelectedDepartment, setFilteredSectionBySelectedDepartment] = useState<Section[]>([]);
  useEffect(() => {
    // 選択中の事業部が変化するか、cacheSectionsArrayの内容に変更があったら新たに絞り込んで更新する
    if (cacheSectionsArray && cacheSectionsArray?.length >= 1 && !!editedMemberData.department_id) {
      const filteredSectionArray = cacheSectionsArray.filter(
        (section) => section.created_by_department_id === editedMemberData.department_id
      );
      setFilteredSectionBySelectedDepartment(filteredSectionArray);
    }
  }, [cacheSectionsArray, memberAccount?.assigned_department_id, editedMemberData.department_id]);
  // ======================= ✅現在の選択した事業部で課を絞り込むuseEffect✅ =======================

  // 課ありパターン
  // ======================= 🌟現在の選択した課で係を絞り込むuseEffect🌟 =======================
  const [filteredUnitBySelectedSection, setFilteredUnitBySelectedSection] = useState<Unit[]>([]);
  useEffect(() => {
    // 選択中の事業部・課が変化するか、cacheUnitsArrayの内容に変更があったら新たに絞り込んで更新する
    if (cacheUnitsArray && cacheUnitsArray?.length >= 1 && !!editedMemberData.section_id) {
      const filteredUnitArray = cacheUnitsArray.filter(
        (unit) => unit.created_by_section_id === editedMemberData.section_id
      );
      setFilteredUnitBySelectedSection(filteredUnitArray);
    }
  }, [cacheUnitsArray, memberAccount?.assigned_section_id, editedMemberData.section_id]);
  // ======================= ✅現在の選択した課で係を絞り込むuseEffect✅ =======================

  // // 課なしパターン
  // // ======================= 🌟現在の選択した事業部でチームを絞り込むuseEffect🌟 =======================
  // const [filteredUnitBySelectedDepartment, setFilteredUnitBySelectedDepartment] = useState<Unit[]>([]);
  // useEffect(() => {
  //   // 選択中の事業部が変化するか、cacheUnitsArrayの内容に変更があったら新たに絞り込んで更新する
  //   if (cacheUnitsArray && cacheUnitsArray?.length >= 1 && !!editedMemberData.department_id) {
  //     const filteredUnitArray = cacheUnitsArray.filter(
  //       (unit) => unit.created_by_department_id === editedMemberData.department_id
  //     );
  //     setFilteredUnitBySelectedDepartment(filteredUnitArray);
  //   }
  // }, [cacheUnitsArray, memberAccount?.assigned_department_id, editedMemberData.department_id]);
  // // ======================= ✅現在の選択した事業部でチームを絞り込むuseEffect✅ =======================
  console.log(
    "フィルター",
    // "filteredUnitBySelectedDepartment",
    // filteredUnitBySelectedDepartment,
    "filteredSectionBySelectedDepartment",
    filteredSectionBySelectedDepartment,
    "filteredUnitBySelectedSection",
    filteredUnitBySelectedSection,
    "cacheDepartmentsArray",
    cacheDepartmentsArray,
    "cacheUnitsArray",
    cacheUnitsArray,
    "cacheOfficesArray",
    cacheOfficesArray
  );

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

    // 現在のメンバーの値と全て変わらない場合はメニューを閉じる editedMemberDataの各値は空文字でmemberAccountの各所属関連情報がない場合にはnullなので、互いに二重否定でfalsyかをチェック
    const isMatchDepartment = getValueOrNull(editedMemberData.department_id) === memberAccount.assigned_department_id;
    const isMatchSection = getValueOrNull(editedMemberData.section_id) === memberAccount.assigned_section_id;
    const isMatchUnit = getValueOrNull(editedMemberData.unit_id) === memberAccount.assigned_unit_id;
    const isMatchOffice = getValueOrNull(editedMemberData.office_id) === memberAccount.assigned_office_id;
    const isMatchEmployeeIdName =
      getValueOrNull(editedMemberData.employee_id_name) === memberAccount.assigned_employee_id_name;
    if (isMatchDepartment && isMatchSection && isMatchUnit && isMatchOffice && isMatchEmployeeIdName) {
      console.log("全て同じためリターン");
      setIsOpenDropdownMenuUpdateMember(false);
      return;
    }

    // 既に社員番号が存在していて、社員番号をリセットしようとするならリターンする
    if (memberAccount.assigned_employee_id_name && editedMemberData.employee_id_name === "") {
      alert("社員番号・IDを入力してください。");
      return;
    }

    // ローディング開始
    setIsLoadingUpsertMember(true);

    let newDepartmentId = null;
    let newSectionId = null;
    let newUnitId = null;
    let newOfficeId = null;
    let newEmployeeIdName = null;
    // 一つ以上設定されてるルート
    // 事業部
    if (!!editedMemberData.department_id) {
      // newDepartmentObj = cacheDepartmentsArray?.filter((departmentObj) => departmentObj.id === editedMemberData.department_id);
      newDepartmentId =
        editedMemberData.department_id !== memberAccount.assigned_department_id ? editedMemberData.department_id : null;
    }
    // 課・セクション
    if (!!editedMemberData.section_id) {
      newSectionId =
        editedMemberData.section_id !== memberAccount.assigned_section_id ? editedMemberData.section_id : null;
    }
    // 係・チーム
    if (!!editedMemberData.unit_id) {
      // newUnitObj = cacheUnitsArray?.filter(
      //   (unitObj) => unitObj.id === editedMemberData.unit_id
      // );
      newUnitId = editedMemberData.unit_id !== memberAccount.assigned_unit_id ? editedMemberData.unit_id : null;
    }
    // 事業所・営業所
    if (!!editedMemberData.office_id) {
      // newOfficeObj = cacheOfficesArray?.filter(
      //   (officeObj) => officeObj.id === editedMemberData.office_id
      // );
      newOfficeId = editedMemberData.office_id !== memberAccount.assigned_office_id ? editedMemberData.office_id : null;
    }
    // 社員番号・ID
    if (!!editedMemberData.employee_id_name) {
      newEmployeeIdName =
        editedMemberData.employee_id_name !== memberAccount.assigned_employee_id_name
          ? editedMemberData.employee_id_name
          : null;
    }
    console.log("結果");
    console.log("newDepartmentId", newDepartmentId);
    console.log("newSectionId", newSectionId);
    console.log("newUnitId", newUnitId);
    console.log("newOfficeId", newOfficeId);
    console.log("newEmployeeIdName", newEmployeeIdName);

    // ------------------------------🔹課ありパターン ------------------------------
    try {
      // 🔸既に課・セクションが存在していて、事業部変更により課・セクションが空になったらisExecuteをtrueにする
      let isExecuteUpdateSection;
      if (editedMemberData.section_id === "" && !!memberAccount.assigned_section_id && !newSectionId) {
        console.log(
          "既に課・セクションが存在していて、事業部変更により課・セクションが空になったらisExecuteをtrueにする",
          newSectionId,
          memberAccount.assigned_section_id
        );
        isExecuteUpdateSection = true;
        newSectionId = null;
      } else {
        isExecuteUpdateSection = !!newSectionId;
      }

      // 🔸既に係が存在していて、事業部or課・セクション変更により係が空になったらisExecuteをtrueにする
      let isExecuteUpdateUnit;
      if (editedMemberData.unit_id === "" && !!memberAccount.assigned_unit_id && !newUnitId) {
        console.log(
          "既に係が存在していて、事業部変更により係が空になったらisExecuteをtrueにする",
          newUnitId,
          memberAccount.assigned_unit_id
        );
        isExecuteUpdateUnit = true;
        newUnitId = null;
      } else {
        isExecuteUpdateUnit = !!newUnitId;
      }

      // 各テーブルの変数がnullの場合にはUPSERTは行わず、null以外のテーブルのみUPSERTを実行
      // unit_assignmentsテーブルのUPSERT有りルート
      const upsertPayload = {
        _user_id: memberAccount.id,
        _company_id: userProfileState.company_id,
        // _department_id: newDepartmentId,
        // _section_id: newSectionId,
        // _unit_id: newUnitId,
        // _office_id: newOfficeId,
        // _employee_id_name: newEmployeeIdName,
        _department_id: editedMemberData.department_id,
        _section_id: editedMemberData.section_id,
        _unit_id: editedMemberData.unit_id,
        _office_id: editedMemberData.office_id,
        _employee_id_name: editedMemberData.employee_id_name,
        _execute_department_upsert: !!newDepartmentId,
        // _execute_unit_upsert: !!newUnitId,
        _execute_section_upsert: isExecuteUpdateSection,
        _execute_unit_upsert: isExecuteUpdateUnit,
        _execute_office_upsert: !!newOfficeId,
        _execute_employee_id_upsert: !!newEmployeeIdName,
      };
      console.log("upsertPayload", upsertPayload);

      const { data: new_employee_id, error } = await supabase.rpc("upsert_member_assignments", upsertPayload);

      if (error) throw error;

      console.log("事業部UPDATE成功 返り値new_employee_id", new_employee_id);
      // UPSERT成功 自分の更新だった場合にはZustandのuserProfileStateを更新してmember_accountsキャッシュのみinValidate
      // 自身の更新だった場合
      if (memberAccount.id === userProfileState.id) {
        // let newUserProfile = { ...userProfileState };

        // 変更をまとめすためのオブジェクトを初期化
        let changes = {};

        // 事業部
        if (!!newDepartmentId) {
          //  const newDepartmentObj = cacheDepartmentsArray?.filter((departmentObj) => departmentObj.id === editedMemberData.department_id);
          // const newDepartmentObj = cacheDepartmentsArray?.filter(
          //   (departmentObj) => departmentObj.id === editedMemberData.department_id
          // )[0];
          const newDepartmentObj = cacheDepartmentsArray?.find(
            (departmentObj) => departmentObj.id === editedMemberData.department_id
          );
          if (newDepartmentObj) {
            // newUserProfile = {
            //   ...newUserProfile,
            //   department: newDepartmentObj.department_name,
            //   assigned_department_id: newDepartmentObj.id,
            //   assigned_department_name: newDepartmentObj.department_name,
            // };
            changes = {
              ...changes,
              department: newDepartmentObj.department_name,
              assigned_department_id: newDepartmentObj.id,
              assigned_department_name: newDepartmentObj.department_name,
            };
          }
        }

        // 課・セクション
        if (isExecuteUpdateSection) {
          if (!!editedMemberData.section_id) {
            const newSectionObj = cacheSectionsArray?.find(
              (sectionObj) => sectionObj.id === editedMemberData.section_id
            );
            console.log("🔥🔥🔥🔥🔥", newSectionObj);
            if (newSectionObj) {
              changes = {
                ...changes,
                section: newSectionObj.section_name,
                assigned_section_id: newSectionObj.id,
                assigned_section_name: newSectionObj.section_name,
              };
            }
          } else if (editedMemberData.section_id === "") {
            console.log("🔥🔥🔥🔥🔥sectionを空にする");
            changes = {
              ...changes,
              section: null,
              assigned_section_id: null,
              assigned_section_name: null,
            };
          }
        }

        // 係
        if (isExecuteUpdateUnit) {
          if (!!editedMemberData.unit_id) {
            const newUnitObj = cacheUnitsArray?.find((unitObj) => unitObj.id === editedMemberData.unit_id);
            console.log("🔥🔥🔥🔥🔥", newUnitObj);
            if (newUnitObj) {
              changes = {
                ...changes,
                unit: newUnitObj.unit_name,
                assigned_unit_id: newUnitObj.id,
                assigned_unit_name: newUnitObj.unit_name,
              };
            }
          } else if (editedMemberData.unit_id === "") {
            console.log("🔥🔥🔥🔥🔥unitを空にする");
            changes = {
              ...changes,
              unit: null,
              assigned_unit_id: null,
              assigned_unit_name: null,
            };
          }
        }

        // オフィス
        if (!!newOfficeId) {
          const newOfficeObj = cacheOfficesArray?.find((officeObj) => officeObj.id === editedMemberData.office_id);
          if (newOfficeObj) {
            changes = {
              ...changes,
              office: newOfficeObj.office_name,
              assigned_office_id: newOfficeObj.id,
              assigned_office_name: newOfficeObj.office_name,
            };
          }
        }

        // 社員番号
        if (!!newEmployeeIdName) {
          changes = {
            ...changes,
            office: editedMemberData.employee_id_name,
            // assigned_employee_id: Array.isArray(new_employee_id) ? new_employee_id[0] : new_employee_id,
            assigned_employee_id: new_employee_id,
            assigned_employee_id_name: editedMemberData.employee_id_name,
          };
        }

        console.log("🔥🔥🔥🔥🔥 changes", changes);

        // 新しいプロファイルオブジェクトを生成してZUstandの状態を更新
        const newUserProfile = { ...userProfileState, ...changes };

        // 自身のZustandを更新
        setUserProfileState(newUserProfile);
      } else {
      }
      // 自分以外のメンバーを更新したルート
      await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
      toast.success("メンバーの更新に成功しました🌟");
      // ------------------------------🔹課ありパターン ------------------------------
      // // ------------------------------🔹課なしパターン ------------------------------
      // try {
      //   let isExecuteUpdateUnit;
      //   // 既に係が存在していて、事業部変更により係が空になったらisExecuteをtrueにする
      //   if (editedMemberData.unit_id === "" && !!memberAccount.assigned_unit_id && !newUnitId) {
      //     console.log(
      //       "既に係が存在していて、事業部変更により係が空になったらisExecuteをtrueにする",
      //       newUnitId,
      //       memberAccount.assigned_unit_id
      //     );
      //     isExecuteUpdateUnit = true;
      //     newUnitId = null;
      //   } else {
      //     isExecuteUpdateUnit = !!newUnitId;
      //   }
      //   // 各テーブルの変数がnullの場合にはUPSERTは行わず、null以外のテーブルのみUPSERTを実行
      //   // unit_assignmentsテーブルのUPSERT有りルート
      //   const upsertPayload = {
      //     _user_id: memberAccount.id,
      //     _company_id: userProfileState.company_id,
      //     _department_id: newDepartmentId,
      //     _unit_id: newUnitId,
      //     _office_id: newOfficeId,
      //     _employee_id_name: newEmployeeIdName,
      //     _execute_department_upsert: !!newDepartmentId,
      //     // _execute_unit_upsert: !!newUnitId,
      //     _execute_unit_upsert: isExecuteUpdateUnit,
      //     _execute_office_upsert: !!newOfficeId,
      //     _execute_employee_id_upsert: !!newEmployeeIdName,
      //   };
      //   console.log("upsertPayload", upsertPayload);

      //   const { data: new_employee_id, error } = await supabase.rpc("upsert_member_assignments", upsertPayload);

      //   if (error) throw error;

      //   console.log("事業部UPDATE成功 返り値new_employee_id", new_employee_id);
      //   // UPSERT成功 自分の更新だった場合にはZustandのuserProfileStateを更新してmember_accountsキャッシュのみinValidate
      //   // 自身の更新だった場合
      //   if (memberAccount.id === userProfileState.id) {
      //     // let newUserProfile = { ...userProfileState };

      //     // 変更をまとめすためのオブジェクトを初期化
      //     let changes = {};

      //     // 事業部
      //     if (!!newDepartmentId) {
      //       //  const newDepartmentObj = cacheDepartmentsArray?.filter((departmentObj) => departmentObj.id === editedMemberData.department_id);
      //       // const newDepartmentObj = cacheDepartmentsArray?.filter(
      //       //   (departmentObj) => departmentObj.id === editedMemberData.department_id
      //       // )[0];
      //       const newDepartmentObj = cacheDepartmentsArray?.find(
      //         (departmentObj) => departmentObj.id === editedMemberData.department_id
      //       );
      //       if (newDepartmentObj) {
      //         // newUserProfile = {
      //         //   ...newUserProfile,
      //         //   department: newDepartmentObj.department_name,
      //         //   assigned_department_id: newDepartmentObj.id,
      //         //   assigned_department_name: newDepartmentObj.department_name,
      //         // };
      //         changes = {
      //           ...changes,
      //           department: newDepartmentObj.department_name,
      //           assigned_department_id: newDepartmentObj.id,
      //           assigned_department_name: newDepartmentObj.department_name,
      //         };
      //       }
      //     }

      //     // 係
      //     if (isExecuteUpdateUnit) {
      //       if (!!editedMemberData.unit_id) {
      //         const newUnitObj = cacheUnitsArray?.find((unitObj) => unitObj.id === editedMemberData.unit_id);
      //         console.log("🔥🔥🔥🔥🔥", newUnitObj);
      //         if (newUnitObj) {
      //           changes = {
      //             ...changes,
      //             unit: newUnitObj.unit_name,
      //             assigned_unit_id: newUnitObj.id,
      //             assigned_unit_name: newUnitObj.unit_name,
      //           };
      //         }
      //       } else if (editedMemberData.unit_id === "") {
      //         console.log("🔥🔥🔥🔥🔥unitを空にする");
      //         changes = {
      //           ...changes,
      //           unit: null,
      //           assigned_unit_id: null,
      //           assigned_unit_name: null,
      //         };
      //       }
      //     }

      //     // オフィス
      //     if (!!newOfficeId) {
      //       const newOfficeObj = cacheOfficesArray?.find((officeObj) => officeObj.id === editedMemberData.office_id);
      //       if (newOfficeObj) {
      //         changes = {
      //           ...changes,
      //           office: newOfficeObj.office_name,
      //           assigned_office_id: newOfficeObj.id,
      //           assigned_office_name: newOfficeObj.office_name,
      //         };
      //       }
      //     }

      //     // 社員番号
      //     if (!!newEmployeeIdName) {
      //       changes = {
      //         ...changes,
      //         office: editedMemberData.employee_id_name,
      //         // assigned_employee_id: Array.isArray(new_employee_id) ? new_employee_id[0] : new_employee_id,
      //         assigned_employee_id: new_employee_id,
      //         assigned_employee_id_name: editedMemberData.employee_id_name,
      //       };
      //     }

      //     console.log("🔥🔥🔥🔥🔥 changes", changes);

      //     // 新しいプロファイルオブジェクトを生成してZUstandの状態を更新
      //     const newUserProfile = { ...userProfileState, ...changes };

      //     // 自身のZustandを更新
      //     setUserProfileState(newUserProfile);
      //   } else {
      //   }
      //   // 自分以外のメンバーを更新したルート
      //   await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });
      //   toast.success("メンバーの更新に成功しました🌟");
      //   // ------------------------------🔹課なしパターン ------------------------------
    } catch (e: any) {
      console.error("UPSERTエラー e", e);
      toast.error("メンバーの更新に失敗しました🙇‍♀️");
    }
    // ローディング開始
    setIsLoadingUpsertMember(false);
    // メニューを閉じる
    setIsOpenDropdownMenuUpdateMember(false);
  };
  console.log("editedMemberData", editedMemberData);

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
                className={`${styles.title_icon}`}
              />
            </span>
          </h2>
          <p className="text-start text-[12px] text-[var(--color-text-title)]">
            メンバーの「事業部」「課・セクション」「係・チーム」「事業所・営業所」「社員番号・ID」の編集が可能です。メンバー編集は管理者以上の権限を持つユーザーのみ許可されます。
          </p>
        </div>

        {/* <hr className="min-h-[1px] w-full bg-[var(--color-border-base)]" /> */}
        <hr className="min-h-[1px] w-full bg-[var(--color-border-light)]" />

        {/* テーマ・アカウント設定エリア */}
        <div className="flex w-full flex-col">
          <ul className={`flex flex-col px-[1px] pb-[1px] text-[13px] text-[var(--color-text-title)]`}>
            {/* 事業部 */}
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
                    // --------------------- 🔹課ありパターン ---------------------
                    let newCondition: EditedMemberData;
                    // 1. section_idが選択されてる状態で事業部が変更されたら、section_idを初期値に設定する(事業部に合致する選択肢の1番目)
                    // 2. unit_idが選択されてる状態で事業部が変更されたら、unit_idを初期値に設定する(事業部に合致する選択肢の1番目)

                    // 1. section_idが選択されてる状態で事業部が変更されたら、section_idを初期値に設定する
                    let firstSectionData: Section | null = null;
                    if (editedMemberData.section_id) {
                      if (cacheSectionsArray && cacheSectionsArray?.length >= 1) {
                        firstSectionData =
                          cacheSectionsArray.find((section) => section.created_by_department_id === e.target.value) ??
                          null;
                        console.log("フィルターfirstSectionData", firstSectionData);
                        // sectionsキャッシュに要素が1つ以上存在するならキャッシュの１番目を初期値として格納
                        newCondition = {
                          ...editedMemberData,
                          department_id: e.target.value,
                          section_id: firstSectionData?.id ?? "",
                        };
                      } else {
                        // sectionsキャッシュに要素がundefinedか空なら、section_idに初期値の空文字をセットする
                        newCondition = {
                          ...editedMemberData,
                          department_id: e.target.value,
                          section_id: "",
                        };
                      }
                    } else {
                      newCondition = { ...editedMemberData, department_id: e.target.value };
                    }

                    // 2. unit_idが選択されてる状態で事業部が変更されたら、unit_idを初期値に設定する
                    if (editedMemberData.unit_id) {
                      if (cacheUnitsArray && cacheUnitsArray?.length >= 1 && firstSectionData) {
                        const firstUnitData = cacheUnitsArray.find(
                          (unit) => unit.created_by_section_id === firstSectionData?.id
                        );
                        console.log("フィルターfirstUnitData", firstUnitData);
                        // unitsキャッシュに要素が1つ以上存在するならキャッシュの１番目を初期値として格納
                        newCondition = {
                          ...newCondition,
                          department_id: e.target.value,
                          unit_id: firstUnitData?.id ?? "",
                        };
                      } else {
                        // unitsキャッシュに要素がundefinedか空なら、unit_idに初期値の空文字をセットする
                        newCondition = {
                          ...newCondition,
                          department_id: e.target.value,
                          unit_id: "",
                        };
                      }
                    } else {
                      newCondition = { ...newCondition, department_id: e.target.value };
                    }
                    console.log("newCondition", newCondition);

                    setEditedMemberData(newCondition);
                    // --------------------- 🔹課ありパターン ここまで ---------------------
                    // // --------------------- 🔹課なしパターン ---------------------
                    // let newCondition: EditedMemberData;
                    // // unit_idが選択されてる状態で事業部が変更されたら、user_idを初期値に設定する
                    // if (editedMemberData.unit_id) {
                    //   if (cacheUnitsArray && cacheUnitsArray?.length >= 1) {
                    //     const firstUnitData = cacheUnitsArray.find(
                    //       (unit) => unit.created_by_department_id === e.target.value
                    //     );
                    //     console.log("フィルターfirstUnitData", firstUnitData);
                    //     // unitsキャッシュに要素が1つ以上存在するならキャッシュの１番目を初期値として格納
                    //     newCondition = {
                    //       ...editedMemberData,
                    //       department_id: e.target.value,
                    //       unit_id: firstUnitData?.id ?? "",
                    //     };
                    //   } else {
                    //     // unitsキャッシュに要素がundefinedか空なら、unit_idに初期値の空文字をセットする
                    //     newCondition = {
                    //       ...editedMemberData,
                    //       department_id: e.target.value,
                    //       unit_id: "",
                    //     };
                    //   }
                    // } else {
                    //   newCondition = { ...editedMemberData, department_id: e.target.value };
                    // }

                    // setEditedMemberData(newCondition);
                    // // --------------------- 🔹課なしパターン ここまで ---------------------
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

            {/* -------------------- 課・セクション -------------------- */}
            <li
              className={`relative flex h-[40px] w-full min-w-max items-center justify-between space-x-[30px] px-[18px] py-[6px] pr-[18px] hover:text-[var(--color-dropdown-list-hover-text)] ${styles.dropdown_list}`}
            >
              <div className="flex min-w-[145px] items-center">
                <MdOutlineDataSaverOff className="mr-[16px] min-h-[20px] min-w-[20px] text-[20px]" />
                <div className="flex select-none items-center space-x-[2px]">
                  <span className={`${styles.list_title}`}>課・セクション</span>
                  <span className={``}>：</span>
                </div>
              </div>
              <div className={`${styles.list_right_area}`}>
                {!editedMemberData.department_id && (
                  <div className={`ml-auto h-full w-full min-w-[185px]`}>
                    <p className={`text-[12px]`}>先に事業部を設定してください</p>
                  </div>
                )}
                {!!editedMemberData.department_id && filteredSectionBySelectedDepartment?.length === 0 && (
                  <div className={`ml-auto h-full w-full min-w-[185px]`}>
                    <p className={`text-[12px]`}>課・セクションを作成してください</p>
                  </div>
                )}
                {!!editedMemberData.department_id && filteredSectionBySelectedDepartment?.length >= 1 && (
                  <select
                    className={` ml-auto h-full w-full ${styles.select_box}`}
                    value={editedMemberData.section_id ? editedMemberData.section_id : ""}
                    onChange={(e) => {
                      // const newCondition = { ...editedMemberData, section_id: e.target.value };
                      // setEditedMemberData(newCondition);

                      // --------------------- 🔹課ありパターン ---------------------
                      let newCondition: EditedMemberData;
                      // 1. unit_idが選択されてる状態で課・セクションが変更されたら、unit_idを初期値に設定する(課・セクションに合致する選択肢の1番目)

                      // 1. unit_idが選択されてる状態で課・セクションが変更されたら、unit_idを初期値に設定する
                      if (editedMemberData.unit_id) {
                        if (cacheUnitsArray && cacheUnitsArray?.length >= 1) {
                          const firstUnitData = cacheUnitsArray.find(
                            (unit) => unit.created_by_section_id === e.target.value
                          );
                          console.log("フィルターfirstUnitData", firstUnitData);
                          // unitsキャッシュに要素が1つ以上存在するならキャッシュの１番目を初期値として格納
                          newCondition = {
                            ...editedMemberData,
                            section_id: e.target.value,
                            unit_id: firstUnitData?.id ?? "",
                          };
                        } else {
                          // unitsキャッシュに要素がundefinedか空なら、unit_idに初期値の空文字をセットする
                          newCondition = {
                            ...editedMemberData,
                            section_id: e.target.value,
                            unit_id: "",
                          };
                        }
                      } else {
                        newCondition = { ...editedMemberData, section_id: e.target.value };
                      }

                      setEditedMemberData(newCondition);
                      // const newCondition = { ...editedMemberData, section_id: e.target.value };
                      // setEditedMemberData(newCondition);
                      // --------------------- 🔹課ありパターン ここまで ---------------------
                    }}
                  >
                    {!memberAccount.assigned_section_id && <option value="">未設定</option>}
                    {!!filteredSectionBySelectedDepartment &&
                      [...filteredSectionBySelectedDepartment]
                        .sort((a, b) => {
                          if (a.section_name === null || b.section_name === null) return 0;
                          return a.section_name.localeCompare(b.section_name, language === "ja" ? "ja" : "en") ?? 0;
                        })
                        .map(
                          (section, index) =>
                            !!section &&
                            section.section_name && (
                              <option key={section.id} value={section.id}>
                                {section.section_name}
                              </option>
                            )
                        )}
                  </select>
                )}
              </div>
            </li>
            {/* -------------------- 課・セクション ここまで -------------------- */}

            {/* <hr className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`} /> */}

            {/* -------------------- 係・チーム -------------------- */}
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
                  <div className={`ml-auto h-full w-full min-w-[215px]`}>
                    <p className={`text-[12px]`}>先に事業部を設定してください</p>
                  </div>
                )}
                {!editedMemberData.section_id && (
                  <div className={`ml-auto h-full w-full min-w-[215px]`}>
                    <p className={`text-[12px]`}>先に課・セクションを設定してください</p>
                  </div>
                )}
                {!!editedMemberData.department_id &&
                  !!editedMemberData.section_id &&
                  filteredUnitBySelectedSection?.length === 0 && (
                    <div className={`ml-auto h-full w-full min-w-[215px]`}>
                      <p className={`text-[12px]`}>係・チームを作成してください</p>
                    </div>
                  )}
                {!!editedMemberData.department_id &&
                  !!editedMemberData.section_id &&
                  filteredUnitBySelectedSection?.length >= 1 && (
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
                      {!!filteredUnitBySelectedSection &&
                        [...filteredUnitBySelectedSection]
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
                    </select>
                  )}
              </div>
            </li>
            {/* -------------------- 係・チーム ここまで -------------------- */}

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
