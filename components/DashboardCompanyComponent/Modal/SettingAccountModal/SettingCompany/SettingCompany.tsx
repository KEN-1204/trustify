import useDashboardStore from "@/store/useDashboardStore";
import Image from "next/image";
import React, { Suspense, memo, useEffect, useState } from "react";
import styles from "./SettingCompany.module.css";
import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import { useUploadAvatarImg } from "@/hooks/useUploadAvatarImg";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import { UserProfileCompanySubscription } from "@/types";
import { MdClose } from "react-icons/md";
import { teamIllustration } from "@/components/assets";
import { ChangeTeamOwnerModal } from "./ChangeTeamOwnerModal/ChangeTeamOwnerModal";
import { ErrorBoundary } from "react-error-boundary";
import { Fallback } from "@/components/Fallback/Fallback";
import { ErrorFallback } from "@/components/ErrorFallback/ErrorFallback";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { HiOutlineSearch } from "react-icons/hi";
import { SkeletonLoading } from "@/components/Parts/SkeletonLoading/SkeletonLoading";
import { FallbackChangeOwner } from "./FallbackChangeOwner";

const SettingCompanyMemo = () => {
  const supabase = useSupabaseClient();
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  const setUserProfileState = useDashboardStore((state) => state.setUserProfileState);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // Zustand会社所有者名
  const companyOwnerName = useDashboardStore((state) => state.companyOwnerName);
  const setCompanyOwnerName = useDashboardStore((state) => state.setCompanyOwnerName);
  //
  // チームの所有者の変更モーダル ページ数
  const [changeTeamOwnerStep, setChangeTeamOwnerStep] = useState<number | null>(null);

  // 名前編集モード
  const [editCompanyNameMode, setEditCompanyNameMode] = useState(false);
  const [editedCompanyName, setEditedCompanyName] = useState("");
  // 決算月
  const [editFiscalEndMonthMode, setEditFiscalEndMonthMode] = useState(false);
  const [editedFiscalEndMonth, setEditedFiscalEndMonth] = useState("");
  // 規模
  const [editNumberOfEmployeeClassMode, setEditNumberOfEmployeeClassMode] = useState(false);
  const [editedNumberOfEmployeeClass, setEditedNumberOfEmployeeClass] = useState("");

  const { useMutateUploadAvatarImg, useMutateDeleteAvatarImg } = useUploadAvatarImg();
  const { fullUrl: logoUrl, isLoading } = useDownloadUrl(userProfileState?.logo_url, "customer_company_logos");

  // 会社所有者を取得 + 所有権変更の通知を取得
  useEffect(() => {
    if (!userProfileState || companyOwnerName) return;
    const getCompanyOwner = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("profile_name")
          .eq("id", userProfileState.subscription_subscriber_id)
          .single();
        if (error) throw new Error(error.message);
        console.log("会社所有者データ", data);
        setCompanyOwnerName(data.profile_name);
      } catch (e: any) {
        console.error(`会社所有者データ取得エラー: ${e.message}`);
      }
    };

    getCompanyOwner();
  }, [userProfileState]);

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
  const getCompanyInitial = (companyName: string) => {
    // 特定の文字列を削除
    const cleanedName = companyName.replace("株式会社", "").replace("合同会社", "").replace("有限会社", "").trim(); // 余分な空白を削除

    return cleanedName[0]; // 頭文字を返す
  };

  return (
    <>
      {/* 右側メインエリア 会社・チーム */}
      {selectedSettingAccountMenu === "Company" && (
        <div className={`flex h-full w-full flex-col overflow-y-scroll px-[20px] py-[20px] pr-[80px]`}>
          <div className={`text-[18px] font-bold text-[var(--color-text-title)]`}>会社・チーム</div>

          <div className={`mt-[30px] flex min-h-[120px] w-full flex-col `}>
            <div className={`${styles.section_title}`}>会社・チーム ロゴ</div>
            <div className={`flex h-full w-full items-center justify-between`}>
              <div className="">
                {!logoUrl && (
                  <label
                    data-text="ユーザー名"
                    htmlFor="avatar"
                    className={`flex-center h-[75px] w-[75px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                    // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                    // onMouseLeave={handleCloseTooltip}
                  >
                    {/* <span>K</span> */}
                    <span className={`text-[30px]`}>
                      {userProfileState?.customer_name
                        ? getCompanyInitial(userProfileState.customer_name)
                        : `${getCompanyInitial("NoName")}`}
                    </span>
                  </label>
                )}
                {logoUrl && (
                  <label
                    htmlFor="avatar"
                    className={`flex-center group relative h-[75px] w-[75px] cursor-pointer overflow-hidden rounded-full`}
                  >
                    <Image
                      src={logoUrl}
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
                {logoUrl && (
                  <div
                    className={`transition-base01 mr-[10px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    // onClick={async () => {
                    //   if (!userProfileState?.id) return alert("ユーザーIDが見つかりません");
                    //   if (!userProfileState?.avatar_url) return alert("プロフィール画像が見つかりません");
                    //   useMutateDeleteAvatarImg.mutate(userProfileState.avatar_url);
                    // }}
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
                // onChange={(e) => {
                //   useMutateUploadAvatarImg.mutate(e);
                // }}
              />
            </div>
          </div>

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 会社名・チーム名 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>会社名・チーム名</div>
            {!editCompanyNameMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.customer_name ? userProfileState.customer_name : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedCompanyName(userProfileState?.customer_name ? userProfileState.customer_name : "");
                      setEditCompanyNameMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editCompanyNameMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <input
                  type="text"
                  placeholder="名前を入力してください"
                  required
                  autoFocus
                  className={`${styles.input_box}`}
                  value={editedCompanyName}
                  onChange={(e) => setEditedCompanyName(e.target.value)}
                  //   onBlur={() => setEditedName(toHalfWidth(editedName.trim()))}
                  onBlur={() => setEditedCompanyName(toHalfWidthAndSpace(editedCompanyName.trim()))}
                />
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedCompanyName("");
                      setEditCompanyNameMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedCompanyName === "") {
                        alert("有効な会社名を入力してください");
                        return;
                      }
                      if (!userProfileState?.company_id) return alert("会社IDが見つかりません");
                      setLoadingGlobalState(true);
                      const { data: companyData, error } = await supabase
                        .from("companies")
                        .update({ profile_name: editedCompanyName })
                        .eq("id", userProfileState.company_id)
                        .select("customer_name")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditCompanyNameMode(false);
                          alert(error.message);
                          console.log("会社名UPDATEエラー", error.message);
                          toast.error("会社名・チーム名の更新に失敗しました!", {
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
                        console.log("会社名UPDATE成功 companyData", companyData);
                        console.log("会社名UPDATE成功 companyData.customer_name", companyData.customer_name);
                        setUserProfileState({
                          // ...(companyData as UserProfile),
                          ...(userProfileState as UserProfileCompanySubscription),
                          customer_name: companyData.customer_name ? companyData.customer_name : null,
                        });
                        setLoadingGlobalState(false);
                        setEditCompanyNameMode(false);
                        toast.success("会社名・チーム名の更新が完了しました!", {
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
          {/* 会社名・チーム名ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 決算月 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className="flex items-center space-x-4">
              <div className={`${styles.section_title}`}>決算月</div>
              <div className={`text-[13px] text-[var(--color-text-brand-f)]`}>
                ※決算月を入力すると、上期下期、四半期ごとにデータ分析が可能となります。
              </div>
            </div>
            {!editFiscalEndMonthMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.customer_fiscal_end_month ? userProfileState.customer_fiscal_end_month : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedFiscalEndMonth(
                        userProfileState?.customer_fiscal_end_month ? userProfileState.customer_fiscal_end_month : ""
                      );
                      setEditFiscalEndMonthMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editFiscalEndMonthMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <select
                  name="profile_occupation"
                  id="profile_occupation"
                  className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                  value={editedFiscalEndMonth}
                  onChange={(e) => setEditedFiscalEndMonth(e.target.value)}
                >
                  <option value="">回答を選択してください</option>
                  <option value="1月">1月</option>
                  <option value="2月">2月</option>
                  <option value="3月">3月</option>
                  <option value="4月">4月</option>
                  <option value="5月">5月</option>
                  <option value="6月">6月</option>
                  <option value="7月">7月</option>
                  <option value="8月">8月</option>
                  <option value="9月">9月</option>
                  <option value="10月">10月</option>
                  <option value="11月">11月</option>
                  <option value="12月">12月</option>
                </select>
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedFiscalEndMonth("");
                      setEditFiscalEndMonthMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedFiscalEndMonth === "") {
                        alert("有効な決算月を入力してください");
                        return;
                      }
                      if (!userProfileState?.company_id) return alert("会社IDが見つかりません");
                      setLoadingGlobalState(true);
                      const { data: companyData, error } = await supabase
                        .from("companies")
                        .update({ customer_fiscal_end_month: editedFiscalEndMonth })
                        .eq("id", userProfileState.company_id)
                        .select("customer_fiscal_end_month")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditFiscalEndMonthMode(false);
                          alert(error.message);
                          console.log("決算月UPDATEエラー", error.message);
                          toast.error("決算月の更新に失敗しました!", {
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
                        console.log("決算月UPDATE成功 companyData", companyData);
                        console.log(
                          "決算月UPDATE成功 companyData.customer_fiscal_end_month",
                          companyData.customer_fiscal_end_month
                        );
                        setUserProfileState({
                          // ...(companyData as UserProfile),
                          ...(userProfileState as UserProfileCompanySubscription),
                          customer_fiscal_end_month: companyData.customer_fiscal_end_month
                            ? companyData.customer_fiscal_end_month
                            : null,
                        });
                        setLoadingGlobalState(false);
                        setEditFiscalEndMonthMode(false);
                        toast.success("決算月の更新が完了しました!", {
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
          {/* 決算月ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* 規模 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            <div className={`${styles.section_title}`}>規模</div>

            {!editNumberOfEmployeeClassMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>
                  {userProfileState?.customer_number_of_employees_class
                    ? userProfileState.customer_number_of_employees_class
                    : "未設定"}
                </div>
                <div>
                  <div
                    className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedNumberOfEmployeeClass(
                        userProfileState?.customer_number_of_employees_class
                          ? userProfileState.customer_number_of_employees_class
                          : ""
                      );
                      setEditNumberOfEmployeeClassMode(true);
                    }}
                  >
                    編集
                  </div>
                </div>
              </div>
            )}
            {editNumberOfEmployeeClassMode && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <select
                  name="profile_occupation"
                  id="profile_occupation"
                  className={`ml-auto h-full w-full cursor-pointer rounded-[4px] ${styles.select_box}`}
                  value={editedNumberOfEmployeeClass}
                  onChange={(e) => setEditedNumberOfEmployeeClass(e.target.value)}
                >
                  <option value="">回答を選択してください</option>
                  <option value="G 1〜49名">1〜49名</option>
                  <option value="F 50〜99名">50〜99名</option>
                  <option value="E 100〜199名">100〜199名</option>
                  <option value="D 200〜299名">200〜299名</option>
                  <option value="C 300〜499名">300〜499名</option>
                  <option value="B 500〜999名">500〜999名</option>
                  <option value="A 1000名以上">1000名以上</option>
                </select>
                <div className="flex">
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => {
                      setEditedNumberOfEmployeeClass("");
                      setEditNumberOfEmployeeClassMode(false);
                    }}
                  >
                    キャンセル
                  </div>
                  <div
                    className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center ${styles.section_title} text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                    onClick={async () => {
                      if (editedNumberOfEmployeeClass === "") {
                        alert("有効な決算月を入力してください");
                        return;
                      }
                      if (!userProfileState?.company_id) return alert("会社IDが見つかりません");
                      setLoadingGlobalState(true);
                      const { data: companyData, error } = await supabase
                        .from("companies")
                        .update({ customer_number_of_employees_class: editedNumberOfEmployeeClass })
                        .eq("id", userProfileState.company_id)
                        .select("customer_number_of_employees_class")
                        .single();

                      if (error) {
                        setTimeout(() => {
                          setLoadingGlobalState(false);
                          setEditNumberOfEmployeeClassMode(false);
                          alert(error.message);
                          console.log("決算月UPDATEエラー", error.message);
                          toast.error("決算月の更新に失敗しました!", {
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
                        console.log("決算月UPDATE成功 companyData", companyData);
                        console.log(
                          "決算月UPDATE成功 companyData.customer_number_of_employees_class",
                          companyData.customer_number_of_employees_class
                        );
                        setUserProfileState({
                          // ...(companyData as UserProfile),
                          ...(userProfileState as UserProfileCompanySubscription),
                          customer_number_of_employees_class: companyData.customer_number_of_employees_class
                            ? companyData.customer_number_of_employees_class
                            : null,
                        });
                        setLoadingGlobalState(false);
                        setEditNumberOfEmployeeClassMode(false);
                        toast.success("決算月の更新が完了しました!", {
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
          {/* 規模ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* チームの所有者 */}
          <div className={`mt-[20px] flex min-h-[95px] w-full flex-col`}>
            {userProfileState?.is_subscriber && <div className={`${styles.section_title}`}>チームの所有者の変更</div>}
            {!userProfileState?.is_subscriber && <div className={`${styles.section_title}`}>チームの所有者</div>}

            {userProfileState?.is_subscriber && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className="text-[14px] text-[var(--color-text-title)]">
                  現在の所有者である自分を削除し、代わりに別のメンバーを任命します。注：1つのチームに任命できる所有者は1人だけです。
                </div>
                <div>
                  <div
                    className={`transition-base01 ml-[30px] min-w-[78px] cursor-pointer truncate rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] ${styles.section_title} hover:bg-[var(--setting-side-bg-select-hover)]`}
                    onClick={() => setChangeTeamOwnerStep(1)}
                  >
                    所有者の変更
                  </div>
                </div>
              </div>
            )}
            {!userProfileState?.is_subscriber && (
              <div className={`flex h-full w-full items-center justify-between`}>
                <div className={`${styles.section_value}`}>{companyOwnerName}</div>
                <div></div>
              </div>
            )}
          </div>
          {/* 規模ここまで */}

          <div className={`min-h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

          {/* ============================== チームの所有者の変更モーダル ============================== */}
          {/* {changeTeamOwnerStep && (
            <ChangeTeamOwnerModal
              changeTeamOwnerStep={changeTeamOwnerStep}
              setChangeTeamOwnerStep={setChangeTeamOwnerStep}
              logoUrl={logoUrl}
              getCompanyInitial={getCompanyInitial}
            />
          )} */}
          {changeTeamOwnerStep && (
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Suspense
                fallback={
                  <FallbackChangeOwner
                    changeTeamOwnerStep={changeTeamOwnerStep}
                    getCompanyInitial={getCompanyInitial}
                    logoUrl={logoUrl}
                  />
                }
              >
                <ChangeTeamOwnerModal
                  changeTeamOwnerStep={changeTeamOwnerStep}
                  setChangeTeamOwnerStep={setChangeTeamOwnerStep}
                  logoUrl={logoUrl}
                  getCompanyInitial={getCompanyInitial}
                />
              </Suspense>
            </ErrorBoundary>
          )}
          {/* ============================== チームの所有者の変更モーダル ここまで ============================== */}
        </div>
      )}
      {/* 右側メインエリア 会社・チーム ここまで */}
    </>
  );
};

export const SettingCompany = memo(SettingCompanyMemo);
