import { formatDisplayPrice } from "@/utils/Helpers/formatDisplayPrice";
import { formatToJapaneseYen } from "@/utils/Helpers/formatToJapaneseYen";
import { memo, useEffect, useState } from "react";

type Props = {
  targetNumber: number;
  startNumber?: number;
  duration: number;
  fontSize?: number;
  textColor?: string;
  margin?: string;
  padding?: string;
  easeFn?: "Cubic" | "Quartic" | "Quintic" | "Sextic";
  isReady?: boolean;
  isPrice?: boolean;
  isPercent?: boolean;
  fade?: string;
  customClass?: string;
};

const ProgressNumberMemo = ({
  targetNumber,
  startNumber = 0,
  duration = 3000,
  fontSize = 15,
  textColor = "var(--color-text-title)",
  margin,
  padding,
  easeFn = "Cubic",
  isReady = true,
  isPrice = true,
  isPercent = false,
  fade,
  customClass,
}: Props) => {
  const [animatedProgress, setAnimatedProgress] = useState(startNumber);

  useEffect(() => {
    if (!isReady) return;
    const start = performance.now(); // アニメーションの開始時刻を取得

    // イージング関数
    // 3次関数: "Ease Out Cubic"
    function easeOutCubic(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    // 4次関数: "Ease Out Quartic"
    function easeOutQuart(t: number): number {
      return 1 - Math.pow(1 - t, 4);
    }
    // ４次関数 90%を超えたタイミングで、さらに増加量をゆっくりにする
    // function easeOutQuart(t: number): number {
    //   if (t < 0.5) {
    //     // 90%まではEase Out Quarticを使用
    //     return 1 - Math.pow(1 - t, 2);
    //   } else {
    //     // 90%を超えた場合、さらにゆっくりさせる
    //     const post90 = (t - 0.9) / 0.1; // 0.9を超えた部分を0から1の範囲に正規化
    //     // この部分では変化をさらにゆっくりさせるために、たとえば指数をさらに高くするなどの処理を追加
    //     return 0.9 + 0.1 * (1 - Math.pow(1 - post90, 10)); // 90%から100%の間をゆっくりと
    //   }
    // }

    // 5次関数: "Ease Out Quintic"
    function easeOutQuint(t: number): number {
      return 1 - Math.pow(1 - t, 5);
    }
    // 6次関数: "Ease Out Sextic"
    function easeOutSextic(t: number): number {
      return 1 - Math.pow(1 - t, 5);
    }

    let easeFunction = easeOutCubic;
    if (easeFn === "Quartic") easeFunction = easeOutQuart;
    if (easeFn === "Quintic") easeFunction = easeOutQuint;
    if (easeFn === "Sextic") easeFunction = easeOutSextic;

    function animate(timestamp: number) {
      const elapsedTime = timestamp - start;
      const t = Math.min(elapsedTime / duration, 1); // アニメーションの進行度（0 から 1）

      const easedProgress = easeFunction(t); // 目標のprogress値に到達するまでイージングを適用

      //   const currentNumber = easedProgress * targetNumber; // 現在の数値を計算
      const currentNumber = startNumber + (targetNumber - startNumber) * easedProgress; // 現在の数値を計算 (targetNumber - startNumber)は到達目標数値から開始点を引いた「増加させるべき数値」

      // Math.round()に入れてstate更新
      const roundedProgress = Math.round(currentNumber);

      setAnimatedProgress(roundedProgress); // 状態更新

      if (t < 1) {
        requestAnimationFrame(animate); // アニメーション継続
      } else {
        setAnimatedProgress(targetNumber); // 最終的な目標数値をセット
      }
    }

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId); // コンポーネントのアンマウント時にアニメーションをキャンセル
    };
  }, [targetNumber, isReady]);
  return (
    <span
      style={{
        fontSize: `${fontSize}px`,
        color: `${textColor}`,
        ...(margin && { margin: `${margin}`, ...(padding && { padding: `${padding}` }) }),
      }}
      className={`${fade && !isReady ? `opacity-0` : ``} ${isReady && fade ? `${fade}` : ``} ${customClass}`}
    >
      {/* {animatedProgress.toLocaleString()} */}
      {isPrice && formatToJapaneseYen(animatedProgress)}
      {!isPrice && animatedProgress}
      {isPercent && `%`}
    </span>
  );
};

export const ProgressNumber = memo(ProgressNumberMemo);
