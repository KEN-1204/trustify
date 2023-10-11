import SpinnerIDS from "@/components/Parts/SpinnerIDS/SpinnerIDS";
import useDashboardStore from "@/store/useDashboardStore";
import React, { useEffect, useRef, useState } from "react";
import styles from "./SettingInvitationModal.module.css";
import { BsCheck2 } from "react-icons/bs";
import useStore from "@/store";
import Image from "next/image";
import { MdClose } from "react-icons/md";
import Vertical_SlideCards from "@/components/Parts/Vertical_SlideCards/Vertical_SlideCards";
import { HiOutlineLink } from "react-icons/hi2";
import { ImLink } from "react-icons/im";
import { AiOutlinePlus } from "react-icons/ai";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { toast } from "react-toastify";
import axios from "axios";

export const SettingInvitationModal = () => {
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(false);
  const [accountQuantity, setAccountQuantity] = useState<number | null>(1);
  const [selectedRadioButton, setSelectedRadioButton] = useState("business_plan");
  const sessionState = useStore((state) => state.sessionState);
  const setSelectedSettingAccountMenu = useDashboardStore((state) => state.setSelectedSettingAccountMenu);
  // 未設定アカウント数を保持するグローバルState
  const notSetAccounts = useDashboardStore((state) => state.notSetAccounts);
  // ユーザーState
  const userProfileState = useDashboardStore((state) => state.userProfileState);
  // 招待メールモーダル
  const setIsOpenSettingInvitationModal = useDashboardStore((state) => state.setIsOpenSettingInvitationModal);
  // メールアドレス入力値を保持するState 初期状態で5つのメールアドレス入力欄を持つ
  const [emailInputs, setEmailInputs] = useState<string[]>(Array(notSetAccounts ? notSetAccounts : 1).fill(""));
  // Emailチェック後のValid、Invalid
  const [checkedEmail, setCheckedEmail] = useState<string[]>(Array(notSetAccounts ? notSetAccounts : 1).fill(""));
  // Emailのinputタグにsuccessクラスとerrorクラスを付与するref
  const emailRef = useRef<(HTMLDivElement | null)[]>([]);
  // 送信準備の状態
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  // ユーザーのメールと同じかどうかチェックするState
  const [checkedSameUserEmailArray, setCheckedSameUserEmailArray] = useState(
    Array(notSetAccounts ? notSetAccounts : 1).fill(false)
  );
  // 未設定アカウント数の上限を超えた場合の真偽値を保持するState
  const [overState, setOverState] = useState(false);
  // 送信時のローディング

  // 入力値が変更された場合に呼ばれる関数
  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmails = [...emailInputs];
    newEmails[index] = e.target.value;
    setEmailInputs(newEmails);
  };

  // 「他メンバーを追加」ボタンを押下した場合の処理 input欄とinput判定を増やす
  const addMoreEmailInput = () => {
    if (emailInputs.length === notSetAccounts) {
      setOverState(true);
      return console.log(`上限オーバー`);
    }
    setEmailInputs((prev) => [...prev, ""]);
    setCheckedEmail((prev) => [...prev, ""]);
    setCheckedSameUserEmailArray((prev) => [...prev, false]);
  };

  const regex = /^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

  // Emailチェック関数
  const handleCheckEmail = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmails = [...emailInputs];
    const newCheckedEmail = [...checkedEmail];
    const newCheckedSameUserEmailArray = [...checkedSameUserEmailArray];

    // Submit時にemailRefのクラスを初期化
    emailRef.current[index]?.classList.remove(`${styles.success}`);
    emailRef.current[index]?.classList.remove(`${styles.error}`);

    const email = e.target.value;

    // ====== メールアドレスチェック ======
    if (email === "") {
      console.log("Modal handleSubmitメールアドレスチェック メール空");
      emailRef.current[index]?.classList.remove(`${styles.success}`);
      emailRef.current[index]?.classList.remove(`${styles.error}`);
      newCheckedEmail[index] = "";
      setCheckedEmail(newCheckedEmail);
      // 自分のメールと同じでないのでSameCheckもfalseに
      newCheckedSameUserEmailArray[index] = false;
      setCheckedSameUserEmailArray(newCheckedSameUserEmailArray);
      return console.log("メール空のためリターン");
    }
    console.log("email", email);
    console.log("regex.test(email)", regex.test(email));
    // 有効なメールルート
    if (regex.test(email)) {
      // 自分のメールの場合はInvalidにしてcheckedSameUserEmailをtrueに
      if (email === userProfileState?.email) {
        emailRef.current[index]?.classList.add(`${styles.error}`);
        emailRef.current[index]?.classList.remove(`${styles.success}`);
        newCheckedEmail[index] = "Invalid";
        setCheckedEmail(newCheckedEmail);
        newCheckedSameUserEmailArray[index] = true;
        setCheckedSameUserEmailArray(newCheckedSameUserEmailArray);
        return console.log("自分のメールアドレスと同じためInvalid、checkedSameUserEmailをtrueに変更");
      }
      emailRef.current[index]?.classList.add(`${styles.success}`);
      emailRef.current[index]?.classList.remove(`${styles.error}`);
      newCheckedEmail[index] = "Valid";
      setCheckedEmail(newCheckedEmail);
      // 自分のEmailと違う場合はfalseに
      if (checkedSameUserEmailArray[index]) {
        newCheckedSameUserEmailArray[index] = false;
        setCheckedSameUserEmailArray(newCheckedSameUserEmailArray);
      }
    }
    // 無効なメールルート
    else {
      emailRef.current[index]?.classList.add(`${styles.error}`);
      emailRef.current[index]?.classList.remove(`${styles.success}`);
      newCheckedEmail[index] = "Invalid";
      setCheckedEmail(newCheckedEmail);
      // 自分のEmailと違う場合はfalseに
      if (checkedSameUserEmailArray[index]) {
        newCheckedSameUserEmailArray[index] = false;
        setCheckedSameUserEmailArray(newCheckedSameUserEmailArray);
      }
      return console.log("メールが有効では無いためリターン");
    }
    // =================================
    // newEmails[index] = email;
    // setEmailInputs(newEmails);
  };

  // 全てのinputをチェック Invalidが存在するか、Validが存在しないならfalseに
  useEffect(() => {
    if (
      !checkedEmail.includes("Invalid") &&
      checkedEmail.includes("Valid") &&
      !checkedEmail.every((currentValue) => currentValue === "")
    ) {
      setIsReadyToSubmit(true);
      console.log("チェック isReadyToSubmitをtrueに変更");
    } else {
      if (!isReadyToSubmit) return;
      setIsReadyToSubmit(false);
      console.log("チェック isReadyToSubmitをfalseに変更");
    }
  }, [checkedEmail]);

  // 「招待状メールを送信」ボタンを押下した場合の処理
  const handleSubmit = async () => {
    console.log("招待状メールを送信", emailInputs);
    // ローディングを開始
    setLoading(true);

    const sendInvitationEmail = async (email: string, i: number) => {
      try {
        const { data } = await axios.get(`/api/invitation/${email}`, {
          headers: {
            Authorization: `Bearer ${sessionState.access_token}`,
          },
        });
        const invitedUserId = data.user.id;
        const invitedUserEmail = data.user.email;
        console.log(
          "送信したメール",
          email,
          "インデックス",
          i,
          "axios.get()の返り値: ",
          data,
          "招待したユーザーのid",
          invitedUserId,
          "招待したユーザーのEmail",
          invitedUserEmail
        );
        toast.success(`${email}の送信が完了しました!`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        // 成功したメールは空にする
        const newEmails = [...emailInputs];
        newEmails[i] = "";
        setEmailInputs(newEmails);
      } catch (e: any) {
        console.error("送信エラー", email, e);
        toast.error(`${email}の送信に失敗しました!`, {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };

    // 1秒ごとにメールを送信
    for (let i = 0; i < emailInputs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await sendInvitationEmail(emailInputs[i], i);
    }

    // ローディング終了
    setLoading(false);

    // 招待モーダルを閉じる
    // setIsOpenSettingInvitationModal(false);

    // const sendInvitationEmail = async (email: string) => {
    //   try {
    //     const { data } = await axios.get(`/api/invitation/${email}`, {
    //       headers: {
    //         Authorization: `Bearer ${sessionState.access_token}`,
    //       },
    //     });
    //     console.log("送信したメール", email, "axios.get()の返り値: ", data);
    //     toast.success(`${email}の送信が完了しました!`, {
    //       position: "top-right",
    //       autoClose: 2000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //     });
    //   } catch (e: any) {
    //     console.error("送信エラー", email, e);
    //     toast.error(`${email}の送信に失敗しました!`, {
    //       position: "top-right",
    //       autoClose: 2000,
    //       hideProgressBar: false,
    //       closeOnClick: true,
    //       pauseOnHover: true,
    //       draggable: true,
    //       progress: undefined,
    //     });
    //   }
    // };

    // // map を使って Promise の配列を作成し、それを Promise.all で処理する
    // await Promise.all(emailInputs.map((email) => sendInvitationEmail(email)));
  };

  //   useEffect(() => {
  //     const getPlansFromStripe = async () => {
  //       if (!!plansState.length) return console.log("既にプラン取得済み", plansState, !!plansState.length);
  //       const { data: plans } = await axios.get("/api/get-stripe-plans");
  //       console.log("stripe-plansモーダル getPlansFromStripe plans", plans);

  //       setPlansState(plans);
  //     };

  //     getPlansFromStripe();
  //   }, []);

  // キャンセルでモーダルを閉じる
  const handleCancelAndReset = () => {
    setIsOpenSettingInvitationModal(false);
  };

  console.log("sessionState", sessionState);
  console.log(
    "全てのチェック結果",
    isReadyToSubmit,
    "Email",
    emailInputs,
    "チェック判定結果checkedEmail",
    checkedEmail,
    "自分のメールと同じかチェック",
    checkedSameUserEmailArray,
    "emailRef.current",
    emailRef.current
  );

  return (
    <>
      <div className={`${styles.overlay} `} onClick={handleCancelAndReset} />

      <div className={`${styles.container} `}>
        {loading && (
          <div className={`${styles.loading_overlay} `}>
            <SpinnerIDS scale={"scale-[0.5]"} />
          </div>
        )}
        {/* クローズボタン */}
        <button
          className={`flex-center group absolute right-[-40px] top-0 z-10 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
          onClick={() => setIsOpenSettingInvitationModal(false)}
        >
          <MdClose className="text-[20px] text-[#fff]" />
        </button>
        {/* メインコンテンツ コンテナ */}
        <div className={`${styles.main_contents_container}`}>
          <div className={`${styles.left_container} relative h-full w-5/12`}>
            <div className="relative w-full overflow-y-auto px-[40px] pb-[calc(116px+20px)] pt-[40px]">
              <div className={`flex-center h-[40px] w-full`}>
                <div className="relative flex h-[60px] w-[145px] select-none items-center justify-center">
                  <Image
                    src={`/assets/images/Trustify_Logo_icon_bg-black@3x.png`}
                    alt=""
                    className="h-full w-[90%] object-contain"
                    fill
                    priority={true}
                    // sizes="10vw"
                  />
                </div>
              </div>
              <h1 className={`mt-[10px] w-full text-center text-[24px] font-bold`}>チームメンバーを招待しましょう！</h1>
              {/* <h1 className={`w-full text-[24px] font-bold`}>プランを選んで早速始めましょう！</h1> */}
              <div className={`w-full py-[20px] text-[15px] text-[var(--color-text-sub)]`}>
                <p>チーム全体で共同作業して、TRSUSTiFYの機能を最大限に活用しましょう。</p>
              </div>

              <div className="mt-[0px] flex w-full">
                <button
                  className={`transition-base01 flex-center max-h-[41px] w-full min-w-[78px] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[25px] py-[10px] text-[14px] font-bold hover:bg-[var(--setting-side-bg-select-hover)]`}
                >
                  <p className="flex items-center space-x-3">
                    <ImLink className="text-[20px]" />
                    <span>招待リンクを取得する</span>
                  </p>
                </button>
              </div>

              <div className="mb-[0px] mt-[20px] flex w-full items-center text-[15px]">
                <h4>
                  メンバー未設定アカウント数：
                  <span className="font-bold">{notSetAccounts}個</span>
                </h4>
              </div>

              {/* メールアドレス入力エリア */}
              <div className="mt-[20px] flex w-full flex-col items-center">
                {emailInputs.map((email, index) => (
                  <React.Fragment key={index}>
                    <input
                      ref={(ref) => (emailRef.current[index] = ref)}
                      type="email"
                      placeholder="メールアドレスを入力してください..."
                      className={`${styles.input_box}`}
                      value={email}
                      onChange={(e) => {
                        // Emailチェック+input入力値変更
                        if (checkedEmail[index] === "Invalid") {
                          handleCheckEmail(index, e);
                          handleInputChange(index, e);
                        } else {
                          handleInputChange(index, e);
                        }

                        // 初回入力時のみサブミットをtrueに
                        if (
                          !checkedEmail.includes("Invalid") &&
                          !checkedEmail.includes("Valid") &&
                          !emailInputs.every((currentValue) => currentValue === "") &&
                          !isReadyToSubmit
                        ) {
                          console.log("初回input入力のためボタンに色をつけるために発火🔥", checkedEmail);
                          setIsReadyToSubmit(true);
                        }
                      }}
                      // onBlur={() => setMainPhoneNumber(toHalfWidth(mainPhoneNumber.trim()))}
                      onBlur={(e) => handleCheckEmail(index, e)}
                    />
                    {checkedEmail[index] === "Invalid" && !checkedSameUserEmailArray[index] && (
                      <span className={styles.msg}>
                        {email}は有効なメールアドレスではないようです。やり直しますか？
                      </span>
                    )}
                    {checkedEmail[index] === "Invalid" && checkedSameUserEmailArray[index] && (
                      <span className={styles.msg}>
                        自分を招待しようとしています。あなたはすでにチームに参加しています。クローン人間が必要かも！？
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-[16px] w-full">
                <div
                  className="flex max-w-fit cursor-pointer items-center space-x-2 text-[var(--color-text-sub)] hover:text-[var(--color-text-brand-f)] hover:underline"
                  onClick={addMoreEmailInput}
                >
                  <AiOutlinePlus className="h-[14px] w-[14px] stroke-2 text-[14px]" />
                  <span>他のメンバーを追加</span>
                </div>
              </div>
            </div>

            {/* メンバーシップを開始するボタン */}
            <div className="absolute bottom-0 left-0 w-full rounded-bl-[8px] bg-[var(--color-edit-bg-solid)] px-[32px] pb-[52px] pt-[24px]">
              <button
                className={`flex-center h-[40px] w-full rounded-[6px]  font-bold text-[#fff]  ${
                  isReadyToSubmit
                    ? `cursor-pointer bg-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f-deep)]`
                    : `cursor-not-allowed bg-[var(--setting-side-bg-select)] text-[var(--setting-side-bg-select-hover)]`
                }`}
                disabled={!isReadyToSubmit}
                onClick={handleSubmit}
                // onClick={() => {
                //   if (selectedRadioButton === "business_plan")
                //     processSubscription("price_1NmPoFFTgtnGFAcpw1jRtcQs", accountQuantity);
                //   if (selectedRadioButton === "premium_plan")
                //     processSubscription("price_1NmQAeFTgtnGFAcpFX60R4YY", accountQuantity);
                // }}
              >
                {!loading && <span>招待状メールを送信</span>}
                {loading && <SpinnerIDS scale={"scale-[0.4]"} />}
                {/* {!loading && <Spinner />} */}
              </button>
            </div>
          </div>
          <div className={`${styles.right_container} flex-col-center h-full w-7/12`}>
            <Vertical_SlideCards />
            <div className={`mb-[-30px] flex max-w-[500px] flex-col justify-center space-y-5 py-[30px]`}>
              <div className="flex space-x-3">
                <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                <p>全メンバーの活動データを１ヶ所に集約</p>
              </div>
              <div className="flex space-x-3">
                <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                <p>データを分析・活用可能にして資産を構築</p>
              </div>
              <div className="flex space-x-3">
                <BsCheck2 className="min-h-[24px] min-w-[24px] stroke-1 text-[24px] text-[#00d436]" />
                <p>全メンバーがいつでもリアルタイムにデータにアクセス・追加・編集が可能に</p>
              </div>
            </div>
          </div>
        </div>

        {/* アカウントを増やすモーダル */}
        {overState && (
          <>
            <div className={`${styles.modal_overlay}`} onClick={() => setOverState(false)}></div>
            <div className={`${styles.modal} relative flex flex-col`}>
              {/* クローズボタン */}
              <button
                className={`flex-center z-100 group absolute right-[-40px] top-0 h-[32px] w-[32px] rounded-full bg-[#00000090] hover:bg-[#000000c0]`}
                onClick={() => setOverState(false)}
              >
                <MdClose className="text-[20px] text-[#fff]" />
              </button>
              <div className={`relative h-[50%] w-full ${styles.modal_right_container}`}></div>
              <div className={`relative flex h-[50%] w-full flex-col items-center pt-[20px]`}>
                <div className="flex w-[80%] flex-col space-y-1 text-[16px]">
                  <div className="mb-[10px] flex w-full flex-col text-center text-[20px] font-bold">
                    <h2>アカウントが足りません！</h2>
                    <h2>アカウントを増やしますか？</h2>
                  </div>

                  <p>
                    現在の未設定アカウントは
                    <span className="text-[18px] font-bold text-[var(--color-text-brand-f)] underline">
                      {notSetAccounts}個
                    </span>
                    です。
                  </p>
                  <p>
                    <span className="text-[18px] font-bold text-[var(--color-text-brand-f)] underline">
                      {notSetAccounts}人
                    </span>
                    以上のメンバーを招待する場合は、先に契約アカウントを増やしましょう。
                  </p>

                  <div className={`flex w-full items-center justify-around space-x-5 pt-[30px]`}>
                    <button
                      className={`w-[50%] cursor-pointer rounded-[8px] bg-[var(--setting-side-bg-select)] px-[15px] py-[10px] text-[14px] font-bold text-[var(--color-text-sub)] hover:bg-[var(--setting-side-bg-select-hover)]`}
                      onClick={() => setOverState(false)}
                    >
                      戻る
                    </button>
                    <button
                      className="w-[50%] cursor-pointer rounded-[8px] bg-[var(--color-bg-brand-f)] px-[15px] py-[10px] text-[14px] font-bold text-[#fff] hover:bg-[var(--color-bg-brand-f-deep)]"
                      onClick={() => {
                        setOverState(false);
                        setIsOpenSettingInvitationModal(false);
                        setSelectedSettingAccountMenu("PaymentAndPlan");
                      }}
                    >
                      アカウントを増やす
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
