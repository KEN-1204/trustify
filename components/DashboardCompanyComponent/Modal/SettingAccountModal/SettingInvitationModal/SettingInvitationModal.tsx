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
import { useQueryClient } from "@tanstack/react-query";
import { SubscribedAccount } from "@/types";

export const SettingInvitationModal = () => {
  const supabase = useSupabaseClient();
  const queryClient = useQueryClient();
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
  // 🌟メールアドレス入力値を保持するState 初期状態で5つのメールアドレス入力欄を持つ
  // const [emailInputs, setEmailInputs] = useState<string[]>(Array(notSetAccounts ? notSetAccounts : 1).fill(""));
  // const [emailInputs, setEmailInputs] = useState<string[]>(
  //   Array(!!notSetAccounts.length ? notSetAccounts.length : 1).fill("")
  // );
  const [emailInputs, setEmailInputs] = useState<string[]>(Array(1).fill(""));
  // 🌟Emailチェック後のValid、Invalid
  // const [checkedEmail, setCheckedEmail] = useState<string[]>(Array(notSetAccounts ? notSetAccounts : 1).fill(""));
  // const [checkedEmail, setCheckedEmail] = useState<string[]>(
  //   Array(!!notSetAccounts.length ? notSetAccounts.length : 1).fill("")
  // );
  const [checkedEmail, setCheckedEmail] = useState<string[]>(Array(1).fill(""));
  // Emailのinputタグにsuccessクラスとerrorクラスを付与するref
  const emailRef = useRef<(HTMLDivElement | null)[]>([]);
  // 送信準備の状態
  const [isReadyToSubmit, setIsReadyToSubmit] = useState(false);
  // 🌟ユーザーのメールと同じかどうかチェックするState
  // const [checkedSameUserEmailArray, setCheckedSameUserEmailArray] = useState(
  //   Array(notSetAccounts ? notSetAccounts : 1).fill(false)
  // );
  // const [checkedSameUserEmailArray, setCheckedSameUserEmailArray] = useState(
  //   Array(!!notSetAccounts.length ? notSetAccounts.length : 1).fill(false)
  // );
  const [checkedSameUserEmailArray, setCheckedSameUserEmailArray] = useState(Array(1).fill(false));
  // 未設定アカウント数の上限を超えた場合の真偽値を保持するState
  const [overState, setOverState] = useState(false);
  // 「アカウントを増やす」を押したときに増やすモーダルへ遷移させる
  const setIsOpenChangeAccountCountsModal = useDashboardStore((state) => state.setIsOpenChangeAccountCountsModal);

  // 入力値が変更された場合に呼ばれる関数
  const handleInputChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmails = [...emailInputs];
    newEmails[index] = e.target.value;
    setEmailInputs(newEmails);
  };

  // 「他メンバーを追加」ボタンを押下した場合の処理 input欄とinput判定を増やす
  const addMoreEmailInput = () => {
    if (emailInputs.length === notSetAccounts.length || notSetAccounts.length === 0) {
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
      if (isReadyToSubmit) return;
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

    // 未登録、未ログインのユーザーを招待（未登録ユーザー向け）
    const sendInvitationEmail = async (email: string, i: number) => {
      try {
        const { data } = await axios.get(`/api/invitation/${email}`, {
          headers: {
            Authorization: `Bearer ${sessionState.access_token}`,
          },
        });
        const invitedUserId = data.user.id;
        const invitedUserEmail = data.user.email;
        const accountId = notSetAccounts[i]?.subscribed_account_id;
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
          invitedUserEmail,
          "紐付けするアカウントのid notSetAccounts[i]",
          accountId
        );
        toast.success(`${email}の送信が完了しました!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });

        // 招待したユーザーのidと未設定のアカウントのuser_idを紐付けして、company_roleは初期はmemberに設定する
        const { data: newAccountData, error: accountUpdateError } = await supabase
          .from("subscribed_accounts")
          .update({
            user_id: invitedUserId,
            company_role: "company_member",
            // invited_email: invitedUserEmail, // これは既に登録済みのユーザーに対してセットするため不要
          })
          .eq("id", accountId)
          .select();

        if (accountUpdateError) {
          console.log("アカウントのuser_idの紐付けに失敗", accountUpdateError);
          toast.error(`${email}のアカウント紐付けに失敗しました!`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
        console.log("UPDATEが成功したアカウントデータ", newAccountData);
        // 成功したメールは空にする
        const newEmails = [...emailInputs];
        newEmails[i] = "";
        setEmailInputs(newEmails);
      } catch (e: any) {
        console.error("送信エラー", email, e);
        toast.error(`${email}の送信に失敗しました!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    };

    // ============================ 登録済み、サインアップ済みユーザーを招待 ============================
    const sendInvitationEmailForLoggedInUser = async (email: string, i: number, invitedUserProfileId: string) => {
      // 入力したemailがprofilesテーブルに存在する場合、
      // ステップ1 招待する側 Resendで作成したカスタム招待メールを送信し、
      // ステップ2 招待する側 invitationsテーブルにINSERT、invitationsテーブルには、招待先ユーザーid、紹介元のチーム名、紹介者をセットする
      // ステップ3 招待する側 未設定のアカウントのcompany_roleをmemberに更新 「招待済み」が表示される状態にsubscribed_accountをUPDATE
      // ステップ4 招待される側 ユーザーはメールからアクセスして、ログイン時に招待モーダルを表示
      // ステップ5 招待される側 その招待モーダルで「招待を受ける」ボタンを押下
      // ステップ6 招待される側 subscribed_accountsテーブルのuser_idにidを紐付けする
      //
      // ステップ1 Resendで作成したカスタム招待メールを送信
      try {
        const payload = {
          email: email,
          handleName: userProfileState?.profile_name,
          siteUrl: `${process.env.CLIENT_URL ?? `http://localhost:3000`}`,
        };
        const { data } = await axios.post(`/api/send/invite-to-team`, payload, {
          headers: {
            Authorization: `Bearer ${sessionState.access_token}`,
          },
        });

        const invitedUserId = invitedUserProfileId;
        const accountId = notSetAccounts[i]?.subscribed_account_id;

        console.log(
          "送信したメール",
          email,
          "インデックス",
          i,
          "axios.post()、resend.emails.send()の返り値: ",
          data,
          "招待するユーザーid",
          invitedUserId,
          "紐付けするアカウントid",
          accountId
        );
        // return console.log("一旦リターン");

        // ステップ2 invitationsテーブルにINSERT、invitationsテーブルには、招待先ユーザーid、紹介元のチーム名、紹介者をセットする
        const newInvitation = {
          to_user_id: invitedUserId,
          from_user_name: userProfileState?.profile_name ?? "",
          from_company_name: userProfileState?.customer_name ?? "",
          from_company_id: userProfileState?.company_id ?? "",
          subscribed_account_id: accountId,
          result: "pending",
        };
        const { error: invitationError } = await supabase.from("invitations").insert(newInvitation);

        if (invitationError) {
          console.log(`${email}の招待に失敗しました! ステップ2 invitationsテーブルのinsertエラー: `, invitationError);
          throw new Error(invitationError.message);
        }

        // ステップ3 未設定のアカウントのcompany_roleをmemberに更新して、「招待済み」が表示されるようにして、招待したユーザーが招待を受け入れた時に、user_idとユーザーのidを紐付けする
        const { data: newAccountData, error: accountUpdateError } = await supabase
          .from("subscribed_accounts")
          .update({
            // user_id: invitedUserId,
            company_role: "company_member",
            invited_email: email,
          })
          .eq("id", accountId)
          .select();

        if (accountUpdateError) {
          console.log(
            `${email}の招待に失敗しました! ステップ3 subscribed_accountsテーブルのcompany_roleのupdateエラー: `,
            accountUpdateError
          );
          throw new Error(accountUpdateError.message);
        }

        console.log("UPDATEが成功したアカウントデータ", newAccountData);

        // 招待状の送信完了
        toast.success(`${email}の招待状の送信が完了しました!`, {
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
        console.error(email, "送信エラー", e, e.message);
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

    // ======================= 1秒ごとにメールを送信
    console.log("handleSubmit実行 emailInputs", emailInputs);
    for (let i = 0; i < emailInputs.length; i++) {
      if (emailInputs[i] === "") {
        console.log(`メールが空のため${i}回目はスキップしてcontinue`);
        continue;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        console.log(`for文${i}回目 emailInputs[i]`, emailInputs[i]);
        // profilesテーブルに招待先のユーザーの登録があるか確認 => これでサインアップしているか否かを判別
        const { data, error } = await supabase.from("profiles").select().eq("email", emailInputs[i]);

        if (error) throw new Error(error.message);

        console.log(
          "ステップ1 profilesテーブルに招待先のユーザーの登録があるか確認 => これでサインアップしているか否かを判別",
          "profilesテーブルから取得 data",
          data,
          "data.length",
          data.length,
          "!data.length",
          !data.length,
          "!!data.length",
          !!data.length
        );

        // 🌟1-1 既にサインアップ済みユーザーへの招待ルート 取得したdataが1個のパターン
        if (data.length === 1) {
          const userData = data[0];
          if (!userData.email) continue;
          // 招待先のユーザーが既にチームに所属しているか否かを判別 => チームに既に所属している場合は自チーム、他チームのパターンでハンドリング
          // 同一ユーザーがsubscribed_accountsに複数紐付けできるようにする場合はこれは不要、今のところユーザーidに1アカウントの一対一の紐付け
          const invitedUserProfileId = userData.id;
          const { data: accountData, error: accountError } = await supabase
            .from("subscribed_accounts")
            .select()
            .eq("user_id", invitedUserProfileId);
          // const { data: accountData, error: accountError } = await supabase
          //   .from("subscribed_accounts")
          //   .select()
          //   .eq("user_id", invitedUserProfileId)
          //   .single();
          if (accountError) throw accountError;

          console.log(
            "ステップ2 招待先のユーザーが既にチームに所属しているか否かを判別 ",
            "accountData",
            accountData,
            "accountData.length",
            accountData.length
          );

          // 2-1 どのチームにも所属していない場合は、招待メールを送信（既にサインアップ済みユーザー向け）
          // （profilesにデータありで、subscribed_accountsにはデータ無し => つまり招待されずにサインアップしたユーザーに招待する場合）
          if (accountData.length === 0) {
            console.log("🌟ステップ3 どのチームにも所属していないため、resendで招待メールを送信");
            await sendInvitationEmailForLoggedInUser(emailInputs[i], i, invitedUserProfileId);
          }
          // 2-2 既にチームに所属している場合は、自チーム、他チームそれぞれでハンドリング
          else if (accountData.length === 1) {
            // 3-1 自チームの場合
            if ((accountData[0] as SubscribedAccount).company_id === userProfileState?.company_id) {
              console.log(
                `ステップ3 ${emailInputs[i]}のユーザーは既に${userProfileState.customer_name}に所属しているためスキップしてcontinue`
              );
              toast.warning(`${emailInputs[i]}のユーザーは既に${userProfileState.customer_name}に所属しています。`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
              continue;
            }
            // 3-2 他チームに所属している場合（既にサインアップ済みユーザー向け）
            else {
              console.log(
                `${emailInputs[i]}のユーザーは既に他チームに所属しているため招待を送信できなかったためスキップしてcontinue`
              );
              toast.warning(`${emailInputs[i]}のユーザーは既に他チームに所属しているため招待を送信できませんでした。`, {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
              });
              continue;
            }
          }
          // 2-3 ユーザーが複数のチームに参加している場合（既にサインアップ済みユーザー向け）
          else {
            console.log(
              `${emailInputs[i]}のユーザーは複数のチームに所属しているため、招待を送信できなかったためスキップしてcontinue`
            );
            toast.error(`${emailInputs[i]}のユーザーは複数のチームに所属しているため、招待を送信できませんでした。`, {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
            });
            continue;
          }
        }
        // 🌟1-2 まだ未登録ユーザーへの新規登録招待ルート dataの配列内が0個のパターン（未登録ユーザー向け）
        else if (data.length === 0) {
          console.log("🌟ステップ3 どのチームにも所属していないため、resendで招待メールを送信");
          // 入力したemailがprofilesテーブルに存在しない場合、招待＋新規登録のinvitationメールを送信する
          await sendInvitationEmail(emailInputs[i], i);
        }
        // 🌟1-3 メールアドレスがprofilesテーブルに2個以上存在している場合はエラーを通知
        else {
          console.error(`${emailInputs[i]}の登録が複数存在するため招待状を送信できなかったためスキップしてcontinue`);
          toast.error(`${emailInputs[i]}の登録が複数存在するため招待状を送信できませんでした。`, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
          continue;
        }
      } catch (error: any) {
        console.error(`${emailInputs[i]}の招待にエラーが発生しました：${error.message}`);
        toast.error(`${emailInputs[i]}の招待に失敗しました!`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    }
    // forループ処理ここまで

    // アカウントと招待ユーザーの紐付け完了後はMemberAccountsキャッシュをリフレッシュ
    await queryClient.invalidateQueries({ queryKey: ["member_accounts"] });

    // ローディング終了
    setLoading(false);

    // 招待モーダルを閉じる
    setIsOpenSettingInvitationModal(false);

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
    emailRef.current,
    "未設定アカウント",
    notSetAccounts
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
                    sizes="10vw"
                    // sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
                  onClick={() => {
                    // if (notSetAccounts.length === 0) return setOverState(true);
                    setIsOpenSettingInvitationModal(false);
                    setSelectedSettingAccountMenu("PaymentAndPlan");
                    // setIsOpenChangeAccountCountsModal("increase");
                    // テスト 入力したメールが既にサインアップ済みのユーザーだった場合の確認
                  }}
                >
                  <p className="flex items-center space-x-3">
                    <ImLink className="text-[20px]" />
                    <span>メンバーアカウントを増やす</span>
                  </p>
                </button>
              </div>

              <div className="mb-[0px] mt-[20px] flex w-full items-center text-[15px]">
                <h4>
                  メンバー未設定のアカウント数：
                  <span className="font-bold">{notSetAccounts.length}個</span>
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
                      onFocus={() => {
                        if (notSetAccounts.length === 0) return setOverState(true);
                      }}
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

            {/* 招待状メールを送信するボタン */}
            <div className="absolute bottom-0 left-0 w-full rounded-bl-[8px] bg-[var(--color-edit-bg-solid)] px-[32px] pb-[52px] pt-[24px]">
              <button
                className={`flex-center h-[40px] w-full rounded-[6px]  font-bold text-[#fff]  ${
                  isReadyToSubmit
                    ? `cursor-pointer bg-[var(--color-bg-brand-f)] hover:bg-[var(--color-bg-brand-f-deep)]`
                    : `cursor-not-allowed bg-[var(--setting-side-bg-select)] text-[var(--setting-side-bg-select-hover)]`
                }`}
                disabled={!isReadyToSubmit}
                onClick={handleSubmit}
              >
                {!loading && <span>招待状を送信</span>}
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
                      {notSetAccounts.length}個
                    </span>
                    です。
                  </p>
                  {notSetAccounts.length !== 0 && (
                    <p>
                      <span className="text-[18px] font-bold text-[var(--color-text-brand-f)] underline">
                        {notSetAccounts.length}人
                      </span>
                      以上のメンバーを招待する場合は、先に契約アカウントを増やしましょう。
                    </p>
                  )}
                  {notSetAccounts.length === 0 && <p>メンバーを招待する場合は、先に契約アカウントを増やしましょう。</p>}

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
                        // setIsOpenChangeAccountCountsModal("increase");
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
