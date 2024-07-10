import { memo, useEffect, useState } from "react";

type Props = {
  targetNumber: number;
  startNumber?: number;
  duration: number;
  fontSize?: number;
  fontWeight?: number;
  textColor?: string;
  margin?: string;
  padding?: string;
  easeFn?: "Cubic" | "Quartic" | "Quintic" | "Sextic";
  isReady?: boolean;
  isPrice?: boolean;
  isPercent?: boolean;
  fade?: string;
  customClass?: string;
  includeCurrencySymbol?: boolean;
  showNegativeSign?: boolean;
};

const ProgressNumberIncrementMemo = ({
  targetNumber,
  startNumber = 0,
  duration = 3000,
  fontSize = 15,
  fontWeight = 500,
  textColor = "var(--color-text-title)",
  margin,
  padding,
  easeFn = "Quintic",
  isReady = true,
  isPrice = true,
  isPercent = false,
  //   includeCurrencySymbol = true,
  //   showNegativeSign = true,
  fade,
  customClass,
}: Props) => {
  const [animatedProgress, setAnimatedProgress] = useState(startNumber);

  // 動的にprogressがインクリメントされても対応するバージョン (バルクインサートなどの進行状況などに使用)
  // progressの値が動的に変更された場合でも現在加算中の値を開始値として変更されたprogressを目標値として徐々に加算していく
  useEffect(() => {
    if (!isReady) return;
    // const duration = ms; // アニメーションの所要時間（ミリ秒）
    const start = performance.now(); // アニメーションの開始時刻を取得
    let fromProgress = animatedProgress; // 開始時のアニメーションの進捗

    // イージング関数
    // 4次関数: "Ease Out Quartic"
    function easeOutQuart(t: number): number {
      return 1 - Math.pow(1 - t, 4);
    }

    let easeFunction = easeOutQuart;

    function animate(timestamp: number) {
      const elapsedTime = timestamp - start;
      const t = Math.min(elapsedTime / duration, 1); // アニメーションの進行度（0 から 1）

      // 目標のprogress値に到達するまでイージングを適用
      const easedProgress = fromProgress + easeFunction(t) * (targetNumber - fromProgress);

      const currentProgress = Math.round(easedProgress);
      setAnimatedProgress(currentProgress);

      //   console.log("currentProgress", currentProgress);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedProgress(targetNumber);
      }
    }

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [targetNumber, isReady]);

  return (
    <span
      style={{
        fontSize: `${fontSize}px`,
        fontWeight: fontWeight,
        color: `${textColor}`,
        ...(margin && { margin: `${margin}`, ...(padding && { padding: `${padding}` }) }),
      }}
      className={`${fade && !isReady ? `opacity-0` : ``} ${isReady && fade ? `${fade}` : ``} ${customClass}`}
    >
      {/* {animatedProgress.toLocaleString()} */}
      {/* {isPrice && formatToJapaneseYen(animatedProgress, includeCurrencySymbol, showNegativeSign)} */}
      {!isPrice && animatedProgress}
      {isPercent && `%`}
    </span>
  );
};

export const ProgressNumberIncrement = memo(ProgressNumberIncrementMemo);
