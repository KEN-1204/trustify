// import { useMutateAuth } from "@/hooks/useMutateAuth";
// import useStore from "@/store";
// import React, { FC, FormEvent, useState } from "react";

// export const Auth1: FC = () => {
//   const language = useStore((state) => state.language);
//   const [isLogin, setIsLogin] = useState(true);
//   const { email, setEmail, password, setPassword, loginMutation, registerMutation } = useMutateAuth();

//   const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     if (isLogin) {
//       loginMutation.mutate();
//     } else {
//       registerMutation.mutate();
//     }
//   };

//   return (
//     <div>
//       <div>
//         <div>×</div>
//       </div>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           required
//           className="my-2 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
//           value={email}
//           onChange={(e) => {
//             setEmail(e.target.value);
//           }}
//         />
//         <input
//           type="password"
//           required
//           className="my-2 rounded border border-gray-300 px-3 py-2 text-sm focus:outline-none"
//           placeholder={`${language === "Ja" && "パスワード"}`}
//           value={password}
//           onChange={(e) => {
//             setPassword(e.target.value);
//           }}
//         />
//         <div className="my-6 flex items-center justify-center text-sm">
//           <span>{isLogin ? "アカウントを持っていませんか?" : "アカウントをお持ちですか?"}</span>
//           <span onClick={() => setIsLogin(!isLogin)} className="cursor-pointer font-medium hover:text-indigo-500">
//             {isLogin ? "作成する" : "ログイン"}
//           </span>
//         </div>
//         <button
//           type="submit"
//           className="flex w-full justify-center rounded-md bg-indigo-500 px-4 py-2 text-sm text-white"
//         >
//           {isLogin ? "ログイン" : "アカウントを作成"}
//         </button>
//       </form>
//     </div>
//   );
// };
