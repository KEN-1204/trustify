import React, { useState, memo } from "react";
import styles from "../SettingAccountModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import { UserProfileCompanySubscription } from "@/types";
import { useUploadAvatarImg } from "@/hooks/useUploadAvatarImg";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import Image from "next/image";

const SettingProfileMemo = () => {
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);

  // 名前編集モード
  const [editNameMode, setEditNameMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  // Email
  const [editEmailMode, setEditEmailMode] = useState(false);
  const [editedEmail, setEditedEmail] = useState("");
  // 電話番号
  const [editTELMode, setEditTELMode] = useState(false);
  const [editedTEL, setEditedTEL] = useState("");
  // 部署
  const [editDepartmentMode, setEditDepartmentMode] = useState(false);
  const [editedDepartment, setEditedDepartment] = useState("");
  // 係・チーム
  const [editUnitMode, setEditUnitMode] = useState(false);
  const [editedUnit, setEditedUnit] = useState("");
  // 役職クラス
  const [editPositionClassMode, setEditPositionClassMode] = useState(false);
  const [editedPositionClass, setEditedPositionClass] = useState("");
  // 役職名
  const [editPositionNameMode, setEditPositionNameMode] = useState(false);
  const [editedPositionName, setEditedPositionName] = useState("");
  // 所属事業所・営業所
  const [editOfficeMode, setEditOfficeMode] = useState(false);
  const [editedOffice, setEditedOffice] = useState("");
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

  const supabase = useSupabaseClient();
  // const { createActivityMutation } = useMutateActivity();
  const { useMutateUploadAvatarImg, useMutateDeleteAvatarImg } = useUploadAvatarImg();
  const { fullUrl: avatarUrl, isLoading } = useDownloadUrl(userProfileState?.avatar_url, "avatars");

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
  return (
    <>
      {selectedSettingAccountMenu === "Profile" && (
        <div className={`flex h-full w-full flex-col overflow-y-scroll px-[20px] py-[20px] pr-[80px]`}>
          <div className={`text-[18px] font-bold`}>プロフィール</div>

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
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>Email</div>
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
                <input
                  type="text"
                  placeholder="メールを入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  //   onBlur={() => setMainPhoneNumber(toHalfWidth(mainPhoneNumber.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedEmail("");
                      setEditEmailMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedEmail === "") {
                        alert("有効なメールを入力してください");
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      setLoadingGlobalState(true);
                      const { data: profileData, error } = await supabase
                        .from("profiles")
                        .update({ email: editedEmail })
                        .eq("id", userProfileState.id)
                        .select("email")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditEmailMode(false);
                          alert(error.message);
                          console.log("メールUPDATEエラー", error.message);
                          toast.error("メールの更新に失敗しました!", {
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
                        console.log("メールUPDATE成功 profileData", profileData);
                        setUserProfileState({
                          ...(userProfileState as UserProfileCompanySubscription),
                          email: profileData.email ? profileData.email : null,
                        });
                        setLoadingGlobalState(false);
                        setEditEmailMode(false);
                        toast.success("メールの更新が完了しました!", {
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

          {/* 部署 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>部署</div>
            {!editDepartmentMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.department ? userProfileState.department : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedDepartment(userProfileState?.department ? userProfileState.department : "");
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
                <input
                  type="text"
                  placeholder="部署を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedDepartment}
                  onChange={(e) => setEditedDepartment(e.target.value)}
                  onBlur={() => setEditedDepartment(toHalfWidth(editedDepartment.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedDepartment("");
                      setEditDepartmentMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedDepartment === "") {
                        alert("有効な部署を入力してください");
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
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
                          alert(error.message);
                          console.log("部署UPDATEエラー", error.message);
                          toast.error("部署の更新に失敗しました!", {
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
                        console.log("部署UPDATE成功 profileData", profileData);
                        setUserProfileState({
                          ...(userProfileState as UserProfileCompanySubscription),
                          department: profileData.department ? profileData.department : null,
                        });
                        setLoadingGlobalState(false);
                        setEditDepartmentMode(false);
                        toast.success("部署の更新が完了しました!", {
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
          {/* 部署ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 係・チーム */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>係・チーム</div>
            {!editUnitMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.unit ? userProfileState.unit : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedUnit(userProfileState?.unit ? userProfileState.unit : "");
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
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedUnit("");
                      setEditUnitMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedUnit === "") {
                        alert("有効な係・チームを入力してください");
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
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
                        toast.success("係・チームの更新が完了しました!", {
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
                  name="profile_occupation"
                  id="profile_occupation"
                  className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                  value={editedOccupation}
                  onChange={(e) => setEditedOccupation(e.target.value)}
                >
                  <option value="経営者/CEO">経営者/CEO</option>
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
                  <option value="その他">その他</option>
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
                  {userProfileState?.position_class ? userProfileState.position_class : "未設定"}
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
                  name="profile_occupation"
                  id="profile_occupation"
                  className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                  value={editedPositionClass}
                  onChange={(e) => setEditedPositionClass(e.target.value)}
                >
                  <option value="">回答を選択してください</option>
                  <option value="1 代表者">代表者</option>
                  <option value="2 取締役/役員">取締役/役員</option>
                  <option value="3 部長">部長</option>
                  <option value="4 課長">課長</option>
                  <option value="5 チームメンバー">チームメンバー</option>
                  <option value="6 所長・工場長">所長・工場長</option>
                  <option value="7 フリーランス・個人事業主">フリーランス・個人事業主</option>
                  {/* <option value="1 代表者">1 代表者</option>
                        <option value="2 取締役/役員">2 取締役/役員</option>
                        <option value="3 部長">3 部長</option>
                        <option value="4 課長">4 課長</option>
                        <option value="5 チームメンバー">5 チームメンバー</option>
                        <option value="6 所長">6 所長</option>
                        <option value="7 個人事業主・フリーランス">7 個人事業主・フリーランス</option>
                        <option value="8 個人利用">8 個人利用</option> */}
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
            <div className={`${styles.section_title}`}>所属事業所・営業所</div>
            {!editOfficeMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.office ? userProfileState.office : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedOffice(userProfileState?.office ? userProfileState.office : "");
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
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedOffice("");
                      setEditOfficeMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.save_section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedOffice === "") {
                        alert("有効な所属事業所・営業所を入力してください");
                        return;
                      }
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
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
                          toast.error("所属事業所・営業所の更新に失敗しました!", {
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
                        console.log("所属事業所・営業所UPDATE成功 profileData", profileData);
                        setUserProfileState({
                          ...(userProfileState as UserProfileCompanySubscription),
                          office: profileData.office ? profileData.office : null,
                        });
                        setLoadingGlobalState(false);
                        setEditOfficeMode(false);
                        toast.success("所属事業所・営業所の更新が完了しました!", {
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
          {/* 所属事業所・営業所ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 社員番号・ID */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>社員番号・ID</div>
            {!editEmployeeIdMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.employee_id ? userProfileState.employee_id : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedEmployeeId(userProfileState?.employee_id ? userProfileState.employee_id : "");
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
                      if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                      if (editedEmployeeId === userProfileState.employee_id) {
                        setEditEmployeeIdMode(false);
                        return;
                      }
                      setLoadingGlobalState(true);
                      const { data: profileData, error } = await supabase
                        .from("profiles")
                        .update({ employee_id: editedEmployeeId })
                        .eq("id", userProfileState.id)
                        .select("employee_id")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditEmployeeIdMode(false);
                          alert(error.message);
                          console.log("社員番号・ID UPDATEエラー", error.message);
                          toast.error("社員番号・IDの更新に失敗しました!", {
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
                        console.log("社員番号・ID UPDATE成功 profileData", profileData);
                        setUserProfileState({
                          ...(userProfileState as UserProfileCompanySubscription),
                          employee_id: profileData.employee_id ? profileData.employee_id : null,
                        });
                        setLoadingGlobalState(false);
                        setEditEmployeeIdMode(false);
                        toast.success("社員番号・IDの更新が完了しました!", {
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
                  name="profile_usage"
                  id="profile_usage"
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
    </>
  );
};

export const SettingProfile = memo(SettingProfileMemo);