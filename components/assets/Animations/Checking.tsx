import checkingAnimeObj from "@/components/assets/Animations/data/checking_anime01.json";
import Lottie from "lottie-react";
// import React from "react";

const CheckingAnime = () => {
  return <Lottie animationData={checkingAnimeObj} loop={true} autoPlay style={{ width: `300px`, height: `300px` }} />;
};

export default CheckingAnime;
