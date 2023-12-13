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
    return a.account_state === "active" ? -1 : 1;
  }

  // ここからはaccount_stateが同じ場合のみの処理
  const rankA = getRoleRank(a.account_company_role);
  const rankB = getRoleRank(b.account_company_role);

  // 招待済み company_roleがnullで、account_stateがactiveで、account_invited_emailがnullでない場合の処理
  if (a.account_state === "active" && a.account_company_role === null && b.account_company_role === null) {
    if (a.account_invited_email !== null && b.account_invited_email === null) {
      return -1;
    }
    if (a.account_invited_email === null && b.account_invited_email !== null) {
      return 1;
    }
  }

  if (rankA === rankB) {
    // profile_nameがnullの場合は最後に
    if (!a.profile_name) return 1;
    if (!b.profile_name) return -1;

    // profile_nameで五十音順、アルファベット順に並び替え デフォルトでは日本語の五十音順、アルファベット順に並び替える場合は、enか第三引数を省略
    return a.profile_name.localeCompare(b.profile_name, language);
  }

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  // 招待済みまたは未設定の場合、他の条件での比較は不要
  if (rankA > 5) return 0;

  // ここには通常到達しないが、念のため
  return 0;
};
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
