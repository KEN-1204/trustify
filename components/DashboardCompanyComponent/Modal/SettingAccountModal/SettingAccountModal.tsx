import React, { useState } from "react";
import styles from "./SettingAccountModal.module.css";
import useDashboardStore from "@/store/useDashboardStore";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import { toast } from "react-toastify";
import useThemeStore from "@/store/useThemeStore";
import { isNaN } from "lodash";
import { useMutateActivity } from "@/hooks/useMutateActivity";
import productCategoriesM from "@/utils/productCategoryM";
import { MdClose } from "react-icons/md";
import { VscAccount } from "react-icons/vsc";

export const SettingAccountModal = () => {
  const setIsOpenSettingAccountModal = useDashboardStore((state) => state.setIsOpenSettingAccountModal);
  const selectedSettingAccountMenu = useDashboardStore((state) => state.selectedSettingAccountMenu);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  const loadingGlobalState = useDashboardStore((state) => state.loadingGlobalState);
  const setLoadingGlobalState = useDashboardStore((state) => state.setLoadingGlobalState);
  // const theme = useThemeStore((state) => state.theme);
  // 上画面の選択中の列データ会社
  // const selectedRowDataCompany = useDashboardStore((state) => state.selectedRowDataCompany);
  const userProfileState = useDashboardStore((state) => state.userProfileState);

  // 名前編集モード
  const [editNameMode, setEditNameMode] = useState(false);
  const [editedName, setEditedName] = useState("");

  const [summary, setSummary] = useState("");
  const [scheduledFollowUpDate, setScheduledFollowUpDate] = useState("");
  const [followUpFlag, setFollowUpFlag] = useState(false);
  const [documentURL, setDocumentURL] = useState("");
  const [activityType, setActivityType] = useState("");
  const [claimFlag, setClaimFlag] = useState(false);
  const [productIntroduction1, setProductIntroduction1] = useState("");
  const [productIntroduction2, setProductIntroduction2] = useState("");
  const [productIntroduction3, setProductIntroduction3] = useState("");
  const [productIntroduction4, setProductIntroduction4] = useState("");
  const [productIntroduction5, setProductIntroduction5] = useState("");
  const [departmentName, setDepartmentName] = useState(
    userProfileState?.department ? userProfileState?.department : ""
  );
  const [businessOffice, setBusinessOffice] = useState("");
  const [memberName, setMemberName] = useState(
    userProfileState?.last_name ? userProfileState?.last_name + userProfileState?.first_name : ""
  );
  const [priority, setPriority] = useState("");

  const supabase = useSupabaseClient();
  const { createActivityMutation } = useMutateActivity();

  // console.log("InsertNewActivityModalコンポーネント レンダリング selectedRowDataCompany", selectedRowDataCompany);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenSettingAccountModal(false);
  };
  const handleSaveAndClose = async () => {
    if (!summary) return alert("活動概要を入力してください");
    if (!activityType) return alert("活動タイプを選択してください");

    setLoadingGlobalState(true);

    // 新規作成するデータをオブジェクトにまとめる
    const newActivity = {
      created_by_company_id: userProfileState?.company_id ? userProfileState.company_id : null,
      created_by_user_id: userProfileState?.id ? userProfileState.id : null,
      created_by_department_of_user: departmentName ? departmentName : null,
      created_by_unit_of_user: userProfileState?.unit ? userProfileState.unit : null,
      client_contact_id: userProfileState?.unit ? userProfileState.unit : null,
      client_company_id: userProfileState?.unit ? userProfileState.unit : null,
      summary: summary,
      scheduled_follow_up_date: scheduledFollowUpDate ? scheduledFollowUpDate : null,
      follow_up_flag: followUpFlag ? followUpFlag : null,
      activity_type: activityType ? activityType : null,
      claim_flag: claimFlag ? claimFlag : null,
      product_introduction1: productIntroduction1 ? productIntroduction1 : null,
      product_introduction2: productIntroduction2 ? productIntroduction2 : null,
      product_introduction3: productIntroduction3 ? productIntroduction3 : null,
      product_introduction4: productIntroduction4 ? productIntroduction4 : null,
      product_introduction5: productIntroduction5 ? productIntroduction5 : null,
      de: businessOffice ? businessOffice : null,
      business_office: businessOffice ? businessOffice : null,
      member_name: userProfileState?.last_name ? userProfileState?.last_name + userProfileState?.first_name : "",
    };

    // supabaseにINSERT
    createActivityMutation.mutate(newActivity);

    // setLoadingGlobalState(false);

    // モーダルを閉じる
    // setIsOpenInsertNewActivityModal(false);
  };

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

  // 頭文字のみ抽出
  const getInitial = (name: string) => name[0];

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />
      {loadingGlobalState && (
        <div className={`${styles.loading_overlay} `}>
          <SpinnerIDS scale={"scale-[0.5]"} />
        </div>
      )}
      <div className={`${styles.container} `}>
        {/* <div className="flex w-full  items-center justify-between whitespace-nowrap py-[10px] pb-[10px] text-center text-[18px]">
          <div className="font-samibold w-[90px] cursor-pointer hover:text-[#aaa]" onClick={handleCancelAndReset}>
          </div>
          <div className="-translate-x-[25px] font-bold">アカウント設定</div>
          <div
            className={`flex-center h-[36px] w-[36px] cursor-pointer rounded-full border-2 border-solid border-[var(--color-text)]`}
            onClick={handleCancelAndReset}
          >
            <MdClose className="text-[24px] text-[#282828]" />
          </div>
        </div> */}
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          <div className={`${styles.left_container} h-full w-3/12 `}>
            <div className={`mb-[10px] truncate px-[10px] pb-[6px] pt-0`}>
              <div className={`w-full text-[14px] font-bold`}>アカウント設定</div>
            </div>
            <div className={`mb-[12px] flex h-[44px] w-full items-center truncate pl-[4px]`}>
              <div
                data-text="ユーザー名"
                className={`flex-center h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)] ${styles.tooltip} mr-[15px]`}
                // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
                // onMouseLeave={handleCloseTooltip}
              >
                {/* <span>K</span> */}
                <span>
                  {userProfileState?.profile_name
                    ? getInitial(userProfileState.profile_name)
                    : `${getInitial("NoName")}`}
                </span>
              </div>
              <div className={`flex h-full flex-col pt-[4px] text-[12px]`}>
                <div className={`font-bold`}>
                  <span>{userProfileState?.profile_name ? userProfileState.profile_name : "未設定"}</span>
                  {/* <span> Ito</span> */}
                </div>
                <div className={`text-[var(--color-text-sub)]`}>
                  {userProfileState?.email ? userProfileState.email : "未設定"}
                </div>
              </div>
            </div>
            <div
              className={`rounded-[4px]] mb-[3px] flex h-[40px] w-full cursor-pointer items-center truncate rounded-[4px] px-[10px] py-[6px] font-bold hover:bg-[var(--setting-side-bg-select)] ${
                selectedSettingAccountMenu === "Profile" ? `bg-[var(--setting-side-bg-select)]` : ``
              }`}
              onClick={() => setSelectedSettingAccountMenu("Profile")}
            >
              <div className="flex-center mr-[15px] h-[24px] w-[24px]">
                <VscAccount className="text-[22px]" />
              </div>
              <span>プロフィール</span>
            </div>
            <div
              className={`rounded-[4px]] mb-[3px] flex h-[40px] w-full cursor-pointer items-center truncate rounded-[4px] px-[10px] py-[6px] font-bold hover:bg-[var(--setting-side-bg-select)] ${
                selectedSettingAccountMenu === "Member" ? `bg-[var(--setting-side-bg-select)]` : ``
              }`}
              onClick={() => setSelectedSettingAccountMenu("Member")}
            >
              <div className="flex-center mr-[15px] h-[24px] w-[24px]">
                <VscAccount className="text-[22px]" />
              </div>
              <span>メンバー</span>
            </div>
            <div
              className={`rounded-[4px]] mb-[3px] flex h-[40px] w-full cursor-pointer items-center truncate rounded-[4px] px-[10px] py-[6px] font-bold hover:bg-[var(--setting-side-bg-select)] ${
                selectedSettingAccountMenu === "Plan" ? `bg-[var(--setting-side-bg-select)]` : ``
              }`}
              onClick={() => setSelectedSettingAccountMenu("Plan")}
            >
              <div className="flex-center mr-[15px] h-[24px] w-[24px]">
                <VscAccount className="text-[22px]" />
              </div>
              <span>支払いとプラン</span>
            </div>
          </div>
          <div className={`${styles.right_container} flex h-full w-9/12`}>
            {selectedSettingAccountMenu === "Profile" && (
              <div className={`flex h-full w-full flex-col px-[20px] py-[20px]`}>
                <div className={`text-[20px] font-bold`}>プロフィール</div>

                <div className={`mt-[30px] flex h-[120px] w-full flex-col `}>
                  <div className={`text-[14px] font-bold`}>プロフィール写真</div>
                  <div className={`flex h-full w-full items-center justify-between`}>
                    <div className="">
                      <div
                        data-text="ユーザー名"
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
                      </div>
                    </div>
                    <div>
                      <div
                        className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold hover:bg-[var(--setting-side-bg-select-hover)]`}
                      >
                        写真を変更
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-[10px] h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

                <div className={`mt-[20px] flex h-[95px] w-full flex-col`}>
                  <div className={`text-[14px] font-bold`}>名前</div>
                  {!editNameMode && (
                    <div className={`flex h-full w-full items-center justify-between`}>
                      <div className="text-[16px] font-semibold">
                        {userProfileState?.profile_name ? userProfileState?.profile_name : "未設定"}
                      </div>
                      <div>
                        <div
                          className={`transition-base01 min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold hover:bg-[var(--setting-side-bg-select-hover)]`}
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
                        //   onBlur={() => setMainPhoneNumber(toHalfWidth(mainPhoneNumber.trim()))}
                      />
                      <div className="flex">
                        <div
                          className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer whitespace-nowrap rounded-[8px] bg-[var(--setting-side-bg-select)] px-[20px] py-[10px] text-[14px] font-bold hover:bg-[var(--setting-side-bg-select-hover)]`}
                          onClick={() => {
                            setEditedName("");
                            setEditNameMode(false);
                          }}
                        >
                          キャンセル
                        </div>
                        <div
                          className={`transition-base01 ml-[10px] h-[40px] min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[20px] py-[10px] text-center text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]`}
                          onClick={async () => {
                            if (editedName === "") {
                              alert("有効な名前を入力してください");
                              return;
                            }
                            // await supabase.from('profiles').update('')
                            // setEditedName(userProfileState?.profile_name ? userProfileState.profile_name : "");
                            setEditNameMode(false);
                          }}
                        >
                          保存
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`mt-[10px] h-[1px] w-full bg-[var(--color-border-deep)]`}></div>

                <div className={`mt-[20px] flex h-[95px] w-full flex-col`}>
                  <div className={`text-[14px] font-bold`}>名前</div>
                  <div className={`flex h-full w-full items-center justify-between`}>
                    <div className="text-[16px] font-semibold">伊藤謙太</div>
                    <div>
                      <div
                        className={`transition-base01 cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold hover:bg-[var(--setting-side-bg-select-hover)]`}
                      >
                        編集
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className={`flex h-full w-[80px] flex-col items-center `}>
              <div
                className={`flex-center group mt-[20px] h-[36px] w-[36px] cursor-pointer rounded-full border-2 border-solid border-[var(--color-text)] hover:border-[var(--color-text-hover)]`}
                onClick={handleCancelAndReset}
              >
                <MdClose className="text-[24px] text-[var(--color-text)] group-hover:text-[var(--color-text-hover)]" />
              </div>
            </div>
          </div>
          {/* <div className={`${styles.right_container} h-full w-1/12 bg-red-100`}></div> */}
        </div>
        {/* メインコンテンツ コンテナ ここまで */}
      </div>
    </>
  );
};
