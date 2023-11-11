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

export const compareAccounts = (a: MemberAccounts, b: MemberAccounts): number => {
  const rankA = getRoleRank(a.account_company_role);
  const rankB = getRoleRank(b.account_company_role);
  console.log(
    "compareAccounts関数実行 ✅a.account_company_role rankA name",
    a.account_company_role,
    rankA,
    a.profile_name,
    "✅b.account_company_role rankB name",
    b.account_company_role,
    rankB,
    b.profile_name
  );

  if (rankA !== rankB) {
    return rankA - rankB;
  }

  // 招待済みまたは未設定の場合、他の条件での比較は不要
  if (rankA > 5) return 0;

  // profile_nameがnullの場合は最後に
  if (!a.profile_name) return 1;
  if (!b.profile_name) return -1;

  return a.profile_name.localeCompare(b.profile_name);
};
