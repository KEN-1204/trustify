import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";
import Stripe from "stripe";
// @ts-ignore
import { Session } from "@supabase/supabase-js";
import { useRef } from "react";
import useDashboardStore from "@/store/useDashboardStore";

// export const useQueryUpcomingInvoiceChangeQuantity = ({
//   changeQuantity,
//   stripeCustomerId,
//   stripeSubscriptionId,
//   sessionState,
// }: {
//   changeQuantity: number;
//   stripeCustomerId: string | undefined;
//   stripeSubscriptionId: string | undefined;
//   sessionState: Session | undefined;
// }) => {
export const useQueryUpcomingInvoiceChangeQuantity = (
  changeQuantity: number,
  stripeCustomerId: string | undefined | null,
  stripeSubscriptionId: string | undefined | null,
  sessionState: Session | undefined | null
  // isReadyQueryInvoice: boolean,
  // setIsReadyQueryInvoice: React.Dispatch<React.SetStateAction<boolean>>
  // isReadyRef: React.MutableRefObject<boolean>
) => {
  // ZustandでuseQueryのisReadyをグローバルStateとして保持
  const isReadyQueryInvoice = useDashboardStore((state) => state.isReadyQueryInvoice);
  const setIsReadyQueryInvoice = useDashboardStore((state) => state.setIsReadyQueryInvoice);

  const getUpcomingInvoice = async () => {
    if (!changeQuantity || typeof changeQuantity !== "number") return;
    if (!stripeCustomerId || typeof stripeCustomerId !== "string") return;
    if (!stripeSubscriptionId || typeof stripeSubscriptionId !== "string") return;
    if (!sessionState) return;
    if (isReadyQueryInvoice === false)
      return console.log("isReadyQueryInvoiceがfalseのためgetUpcomingInvoice関数リターン", isReadyQueryInvoice);
    console.log("useQuery getUpcomingInvoice関数実行 isReadyQueryInvoice", isReadyQueryInvoice);
    // if (isReadyRef.current === false)
    //   return console.log("isReadyRef.currentがfalseのためgetUpcomingInvoice関数リターン", isReadyRef.current);
    // console.log("useQuery getUpcomingInvoice関数実行 isReadyRef.current", isReadyRef.current);

    try {
      const payload = {
        stripeCustomerId: stripeCustomerId,
        stripeSubscriptionId: stripeSubscriptionId,
        changeQuantity: changeQuantity, // 数量変更後の合計アカウント数
        changePlanName: null, // プラン変更ではないので、nullをセット
      };

      const {
        data: { data: upcomingInvoiceData, error: upcomingInvoiceError },
      } = await axios.post(`/api/subscription/retrieve-upcoming-invoice`, payload, {
        headers: {
          Authorization: `Bearer ${sessionState.access_token}`,
        },
      });

      if (!!upcomingInvoiceError) {
        console.log(
          "🌟Stripe将来のインボイス取得ステップ7 /retrieve-upcoming-invoiceへのaxios.postエラー",
          upcomingInvoiceError
        );
        throw new Error(upcomingInvoiceError);
      }

      // フェッチした後に再度falseを格納することで、enableにfalseが渡され自動で実行されなくなる

      if (isReadyQueryInvoice === true) setIsReadyQueryInvoice(false);
      console.log(
        "🌟Stripe将来のインボイス取得ステップ7 /retrieve-upcoming-invoiceへのaxios.postで次回のインボイスの取得成功",
        upcomingInvoiceData,
        "🌟isReadyQueryInvoiceを更新関数でfalseを格納 直後のisReadyQueryInvoice",
        isReadyQueryInvoice
      );

      return upcomingInvoiceData as Stripe.UpcomingInvoice;
    } catch (e: any) {
      console.error(`getUpcomingInvoice関数実行エラー: `, e);
      toast.error(`請求金額の取得に失敗しました...`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return null;
    }
  };

  return useQuery({
    queryKey: ["upcoming_invoice", changeQuantity],
    queryFn: getUpcomingInvoice,
    staleTime: Infinity,
    onError: (error: any) => {
      alert(error.message);
      console.error("useQueryUpcomingInvoiceChangeQuantityカスタムフック error:", error);
    },
    enabled: isReadyQueryInvoice,
  });
};
