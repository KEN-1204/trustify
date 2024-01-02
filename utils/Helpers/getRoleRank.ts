import { MemberAccounts } from "@/types";

// チームの役割でメンバーアカウントの配列の順番を並び替える関数

const getRoleRank = (role: string | null) => {
  switch (role) {
    case "company_owner":
      return 1;
    case "company_admin":
      return 2;
    case "company_manager":
      return 3;
    case "company_member":
      return 4;
    case "guest":
      return 5;
    default:
      return 6; // 招待済みか未設定
  }
};

export const compareAccounts = (a: MemberAccounts, b: MemberAccounts, language: string = "ja"): number => {
  // 片方がaccount_stateがactive、もう片方がdelete_requestedの場合のチェック
  if (a.account_state !== b.account_state) {
    console.log("1", a.profile_name, b.profile_name);
    return a.account_state === "active" ? -1 : 1;
  }

  // ここからはaccount_stateが同じ場合のみの処理
  // const rankA = getRoleRank(a.account_company_role);
  // const rankB = getRoleRank(b.account_company_role);

  // 招待済み company_roleがnullで、account_stateがactiveで、account_invited_emailがnullでない場合の処理
  if (a.account_state === "active" && a.account_company_role === null && b.account_company_role === null) {
    if (a.account_invited_email !== null && b.account_invited_email === null) {
      console.log("2", a.profile_name, b.profile_name, -1);
      return -1;
    }
    if (a.account_invited_email === null && b.account_invited_email !== null) {
      console.log("3", a.profile_name, b.profile_name, 1);
      return 1;
    }
  }

  // 役職で比較
  const rankA = getRoleRank(a.account_company_role);
  const rankB = getRoleRank(b.account_company_role);
  if (rankA !== rankB) return rankA - rankB;
  // if (rankA === rankB) {
  //   // profile_nameがnullの場合は最後に
  //   if (!a.profile_name) {
  //     console.log("4", a.profile_name, b.profile_name, 1);
  //     return 1;
  //   }
  //   if (!b.profile_name) {
  //     console.log("5", a.profile_name, b.profile_name, -1);
  //     return -1;
  //   }
  // }

  // 事業部で比較
  if (a.assigned_department_name !== null && b.assigned_department_name !== null) {
    // 両方ともnullでない場合、事業部名で五十音順に並べ替え
    console.log(
      a.assigned_department_name,
      b.assigned_department_name,
      a.assigned_department_name.localeCompare(b.assigned_department_name, language)
    );
    return a.assigned_department_name.localeCompare(b.assigned_department_name, language);
  } else if (a.assigned_department_name !== null) {
    // aのみnullでない場合
    return -1;
  } else if (b.assigned_department_name !== null) {
    // bのみnullでない場合
    return 1;
  }

  // 係で比較
  if (a.assigned_unit_name !== null && b.assigned_unit_name !== null) {
    // 両方ともnullでない場合、事業部名で五十音順に並べ替え
    console.log(
      a.assigned_unit_name,
      b.assigned_unit_name,
      a.assigned_unit_name.localeCompare(b.assigned_unit_name, language)
    );
    return a.assigned_unit_name.localeCompare(b.assigned_unit_name, language);
  } else if (a.assigned_unit_name !== null) {
    // aのみnullでない場合
    return -1;
  } else if (b.assigned_unit_name !== null) {
    // bのみnullでない場合
    return 1;
  }

  // 事業所で比較
  if (a.assigned_office_name !== null && b.assigned_office_name !== null) {
    // 両方ともnullでない場合、事業部名で五十音順に並べ替え
    console.log(
      a.assigned_office_name,
      b.assigned_office_name,
      a.assigned_office_name.localeCompare(b.assigned_office_name, language)
    );
    return a.assigned_office_name.localeCompare(b.assigned_office_name, language);
  } else if (a.assigned_office_name !== null) {
    // aのみnullでない場合
    return -1;
  } else if (b.assigned_office_name !== null) {
    // bのみnullでない場合
    return 1;
  }

  // 名前で比較
  if (a.profile_name && b.profile_name) {
    return a.profile_name.localeCompare(b.profile_name, language);
  }
  return !a.profile_name ? 1 : -1;
};

// const getRank = (value: string | null, defaultValue: number) => {
//   if (value === null) return defaultValue;
//   return defaultValue - 1; // nullでない値は上に
// };

// export const compareAccounts = (a: MemberAccounts, b: MemberAccounts, language: string = "ja"): number => {
//   // 片方がaccount_stateがactive、もう片方がdelete_requestedの場合のチェック
//   if (a.account_state !== b.account_state) {
//     console.log("1", a.profile_name, b.profile_name);
//     return a.account_state === "active" ? -1 : 1;
//   }

//   // ここからはaccount_stateが同じ場合のみの処理
//   const rankA = getRoleRank(a.account_company_role);
//   const rankB = getRoleRank(b.account_company_role);

//   // 招待済み company_roleがnullで、account_stateがactiveで、account_invited_emailがnullでない場合の処理
//   if (a.account_state === "active" && a.account_company_role === null && b.account_company_role === null) {
//     if (a.account_invited_email !== null && b.account_invited_email === null) {
//       console.log("2", a.profile_name, b.profile_name, -1);
//       return -1;
//     }
//     if (a.account_invited_email === null && b.account_invited_email !== null) {
//       console.log("3", a.profile_name, b.profile_name, 1);
//       return 1;
//     }
//   }

//   if (rankA === rankB) {
//     // profile_nameがnullの場合は最後に
//     if (!a.profile_name) {
//       console.log("4", a.profile_name, b.profile_name, 1);
//       return 1;
//     }
//     if (!b.profile_name) {
//       console.log("5", a.profile_name, b.profile_name, -1);
//       return -1;
//     }

//     // profile_nameで五十音順、アルファベット順に並び替え デフォルトでは日本語の五十音順、アルファベット順に並び替える場合は、enか第三引数を省略
//     console.log("6", a.profile_name, b.profile_name, a.profile_name.localeCompare(b.profile_name, "ja"));
//     return a.profile_name.localeCompare(b.profile_name, language);
//     // return a.profile_name.localeCompare(b.profile_name, "ja");
//   }

//   if (rankA !== rankB) {
//     console.log("7", a.profile_name, b.profile_name, rankA - rankB);
//     return rankA - rankB;
//   }

//   // 招待済みまたは未設定の場合、他の条件での比較は不要
//   if (rankA > 5) {
//     console.log("8", a.profile_name, b.profile_name, 0);

//     return 0;
//   }

//   // ここには通常到達しないが、念のため
//   console.log("9", a.profile_name, b.profile_name);
//   return 0;
// };

// export const compareAccounts = (a: MemberAccounts, b: MemberAccounts): number => {
//   const rankA = getRoleRank(a.account_company_role);
//   const rankB = getRoleRank(b.account_company_role);

//   if (rankA !== rankB) {
//     return rankA - rankB;
//   }

//   // 招待済みまたは未設定の場合、他の条件での比較は不要
//   if (rankA > 5) return 0;

//   // profile_nameがnullの場合は最後に
//   if (!a.profile_name) return 1;
//   if (!b.profile_name) return -1;

//   return a.profile_name.localeCompare(b.profile_name);
// };

/**
 * console.log(
    "compareAccounts関数実行 ✅a.account_company_role rankA name",
    a.account_company_role,
    rankA,
    a.profile_name,
    "✅b.account_company_role rankB name",
    b.account_company_role,
    rankB,
    b.profile_name
  );
 */
