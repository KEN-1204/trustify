// import { Session } from "@supabase/auth-helpers-nextjs";
// import { useQuery } from "@tanstack/react-query";
// import axios from "axios";

// export const useQueryDefaultPaymentMethod = (
//   stripeCustomerId: string | undefined | null,
//   stripeSubscriptionId: string | undefined | null,
//   session: Session | undefined
// ) => {
//   const getPaymentMethodFromStripe = async () => {
//     if (!stripeCustomerId) return console.log("stripeCustomerIdなしのためリターン");
//     if (!stripeSubscriptionId) return console.log("supabaseのサブスクidなしのためリターン");
//     if (!session) return console.log("sessionなしのためリターン", session);
//     console.log("getPlansFromStripe実行");

//     try {
//       const payload = {
//         stripeCustomerId: stripeCustomerId,
//         stripeSubscriptionId: stripeSubscriptionId,
//       };
//       console.log("axios.post()でAPIルートretrieve-payment-methodへリクエスト 引数のpayload", payload);
//       const {
//         data: { data: paymentMethod, error: paymentMethodError },
//       } = await axios.post(`/api/retrieve-payment-method`, payload, {
//         headers: {
//           Authorization: `Bearer ${session.access_token}`,
//         },
//       });
//       if (paymentMethodError) {
//         console.error("支払い方法の取得に失敗 エラーオブジェクト", paymentMethodError);
//         throw new Error(paymentMethodError.message);
//       }
//       console.log("支払い方法の取得に成功 paymentMethod", paymentMethod);

//       return paymentMethod;
//     } catch (e: any) {
//       console.error("支払い方法の取得に失敗 エラーオブジェクト", e);
//       return null;
//     }
//   };

//   return useQuery({
//     queryKey: ["default_payment_method"],
//     queryFn: getPaymentMethodFromStripe,
//     staleTime: Infinity,
//     onError: (error: any) => {
//       alert(error.message);
//       console.error("useQueryDefaultPaymentMethodカスタムフック error:", error);
//     },
//   });
// };
