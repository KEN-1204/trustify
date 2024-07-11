import Lottie from "lottie-react";

import checkingAnimeObj from "@/components/assets/Animations/data/checking_animation_f_3hHOQ5dbBV.json";
import uploadingAnimeObj from "@/components/assets/Animations/data/uploading_animation_1720683681536.json";
import checkAnimeObj from "@/components/assets/Animations/data/check_m2_hC3AT05el3.json";

// import React from "react";

type Props = {
  width?: string;
  height?: string;
  loop?: boolean;
};

// チェッキング
export const AnimeChecking = ({ width = `300px`, height = `300px`, loop = true }: Props) => {
  return <Lottie animationData={checkingAnimeObj} loop={loop} autoPlay style={{ width: width, height: height }} />;
};

// ✅
export const AnimeCheck = ({ width = `300px`, height = `300px`, loop = true }: Props) => {
  return <Lottie animationData={checkAnimeObj} loop={loop} autoPlay style={{ width: width, height: height }} />;
};

// アップロード
export const AnimeUploading = ({ width = `300px`, height = `300px`, loop = true }: Props) => {
  return <Lottie animationData={uploadingAnimeObj} loop={loop} autoPlay style={{ width: width, height: height }} />;
};
