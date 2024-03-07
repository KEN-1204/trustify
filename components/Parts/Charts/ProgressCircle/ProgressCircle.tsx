import { memo, useEffect, useState } from "react";

type Props = {
  circleId: string;
  textId: string;
  progress?: number;
  duration?: number;
  size?: number;
  strokeWidth?: number;
  fontSize?: number;
  strokeBg?: string;
  direction?: "bl_tr" | "br_tl" | "tr_bl" | "tl_br";
  textVerticalDirReverse?: boolean;
  notGrad?: boolean;
  oneColor?: string;
  textColor?: string;
  easeFn?: "Cubic" | "Quartic" | "Quintic" | "Sextic";
  isReady?: boolean;
  fade?: string;
};

// https://chat.openai.com/chat?model=gpt-4 // こちらを確認
// https://www.youtube.com/watch?v=Ynr4MR5rQGQ
// https://developer.mozilla.org/ja/docs/Web/API/window/requestAnimationFrame

const ProgressCircleMemo = ({
  circleId,
  textId,
  progress = 75,
  duration = 3000,
  size = 150,
  strokeWidth = 12,
  fontSize = 34,
  strokeBg = "var(--color-progress-chart-bg)",
  direction,
  textVerticalDirReverse = false,
  notGrad = false,
  oneColor = "#0abeff",
  textColor,
  easeFn = "Cubic",
  isReady = true,
  fade,
}: Props) => {
  // プログレスアニメーション用state
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Window.requestAnimationFrame():
  // 指定した関数を呼び出して次の再描画の前にアニメーションを更新することを要求します。このメソッドは、再描画の前に呼び出されるコールバック 1 個を引数として取ります。

  //   useEffect(() => {
  //     let timerId: any;
  //     const animateProgress = () => {
  //       if (animatedProgress < progress) {
  //         timerId = setTimeout(() => {
  //           setAnimatedProgress((prevProgress) => prevProgress + 1);
  //         }, 18); // ここでアニメーションの更新間隔を調整できます
  //       }
  //     };
  //     animateProgress();

  //     return () => {
  //       if (timerId) {
  //         clearTimeout(timerId);
  //       }
  //     };
  //   }, [progress, animatedProgress]);

  useEffect(() => {
    if (!isReady) return;
    // const duration = ms; // アニメーションの所要時間（ミリ秒）
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

      //   const easedProgress = easeOutCubic(t) * progress; // 目標のprogress値に到達するまでイージングを適用
      const easedProgress = easeFunction(t) * progress; // 目標のprogress値に到達するまでイージングを適用

      // Math.round()に入れない状態でstate更新、レンダリングをするやり方(レンダリング回数270回)
      //   setAnimatedProgress(easedProgress);
      //   if (t < 1) {
      //     requestAnimationFrame(animate);
      //   }

      // Math.round()に入れてstate更新、レンダリングをするやり方(レンダリング回数501回)
      const roundedProgress = Math.round(easedProgress);
      setAnimatedProgress(roundedProgress);
      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimatedProgress(progress);
      }
    }

    const animationId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [progress, isReady]);

  // プログレスバーの各変数を定義
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedProgress / 100) * circumference;
  const displayProgress = Math.round(animatedProgress);

  console.log("🌟animatedProgress", animatedProgress);

  // svgのdefsで定義するlinearGradientの角度
  // 左から右(0度) : x1="0%" y1="0%" x2="100%" y2="0%"
  // 上から下(90度) : x1="0%" y1="0%" x2="0%" y2="100%"
  // 左下から右上（45度）: x1="0%" y1="0%" x2="100%" y2="100%"
  // 右下から左上（-45度）: x1="0%" y1="100%" x2="100%" y2="0%"
  // 右上から左下 : x1="100%" y1="100%" x2="0%" y2="0%"
  // 右上から左下 : x1="0%" y1="100%" x2="100%" y2="0%"

  // 修正版
  // 左下から右上: x1="0%" y1="0%" x2="100%" y2="100%"
  // 右下から左上: x1="0%" y1="100%" x2="100%" y2="0%"
  // 右上から左下: x1="100%" y1="100%" x2="0%" y2="0%"
  // 左上から右下: x1="100%" y1="0%" x2="0%" y2="100%"

  const bl_tr = { x1: "0%", y1: "0%", x2: "100%", y2: "100%" }; // 左下から右上
  const br_tl = { x1: "0%", y1: "100%", x2: "100%", y2: "0%" }; //
  const tr_bl = { x1: "100%", y1: "100%", x2: "0%", y2: "0%" };
  const tl_br = { x1: "100%", y1: "0%", x2: "0%", y2: "100%" };

  let x1 = "100%";
  let y1 = "0%";
  let x2 = "0%";
  let y2 = "100%";
  if (direction === "bl_tr") {
    x1 = bl_tr.x1;
    x2 = bl_tr.x2;
    y1 = bl_tr.y1;
    y2 = bl_tr.y2;
  }
  if (direction === "br_tl") {
    x1 = br_tl.x1;
    x2 = br_tl.x2;
    y1 = br_tl.y1;
    y2 = br_tl.y2;
  }
  if (direction === "tr_bl") {
    x1 = tr_bl.x1;
    x2 = tr_bl.x2;
    y1 = tr_bl.y1;
    y2 = tr_bl.y2;
  }
  if (direction === "tl_br") {
    x1 = tl_br.x1;
    x2 = tl_br.x2;
    y1 = tl_br.y1;
    y2 = tl_br.y2;
  }

  return (
    <svg
      width={size}
      height={size}
      className={`${fade && !isReady ? `opacity-0` : ``} ${isReady && fade ? `${fade}` : ``} `}
    >
      {/* サークル */}
      <defs>
        {!notGrad && (
          <linearGradient id={`circleLinearGradient_${circleId}`} x1={x1} y1={y1} x2={x2} y2={y2}>
            {/* //   <linearGradient id="circleLinearGradient" x1={x1} y1={y1} x2={x2} y2={y2}> */}
            <stop offset="6%" stopColor="#ffffffe9" />
            <stop offset="18%" stopColor="#cffcfde9" />
            <stop offset="33%" stopColor="#0affffe9" />
            <stop offset="56%" stopColor="#0abeffe9" />
            <stop offset="87%" stopColor="#0066ffe9" />
            {/* <stop offset="0%" stopColor="#a445b2" />
          <stop offset="100%" stopColor="#fa4299" /> */}
            {/* インスタカラー */}
            {/* <stop offset="10%" stopColor="#ffd600" />
          <stop offset="35%" stopColor="#ff7a00" />
          <stop offset="60%" stopColor="#ff0069" />
          <stop offset="90%" stopColor="#d300c5" />
          <stop offset="100%" stopColor="#7638fa" /> */}
            {/*  */}
            {/* <stop offset="10%" stopColor="#12b7e9" />
          <stop offset="50%" stopColor="#c471ed" />
          <stop offset="90%" stopColor="#f64f59" />
          <stop offset="100%" stopColor="#f6894f" /> */}
            {/* <stop offset="6%" stopColor="#fff" />
          <stop offset="9%" stopColor="#cffcfd" />
          <stop offset="30%" stopColor="#0affff" />
          <stop offset="56%" stopColor="#0abeff" />
          <stop offset="88%" stopColor="#0066ff" /> */}
          </linearGradient>
        )}
        {notGrad && (
          <linearGradient id={`circleLinearGradient_${circleId}`} x1={x1} y1={y1} x2={x2} y2={y2}>
            <stop offset="56%" stopColor={oneColor} />
          </linearGradient>
        )}
      </defs>
      {/* <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke="lightgray" fill="none" /> */}
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} stroke={strokeBg} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        // stroke="url(#circleLinearGradient)"
        stroke={`url(#circleLinearGradient_${circleId})`}
        // stroke="blue"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "center",
        }}
      />
      {/* 中央テキスト */}
      <defs>
        {!textVerticalDirReverse && !notGrad && (
          <linearGradient id={`textLinearGradient_${textId}`} x1={x2} y1={y1} x2={x1} y2={y2}>
            <stop offset="6%" stopColor="#fff" />
            <stop offset="18%" stopColor="#cffcfd" />
            <stop offset="33%" stopColor="#0affff" />
            <stop offset="56%" stopColor="#0abeff" />
            <stop offset="87%" stopColor="#0066ff" />
          </linearGradient>
        )}
        {textVerticalDirReverse && !notGrad && (
          <linearGradient id={`textLinearGradient_${textId}`} x1={x2} y1={y2} x2={x1} y2={y1}>
            {/* <stop offset="6%" stopColor="#fff" />
            <stop offset="18%" stopColor="#cffcfd" />
            <stop offset="33%" stopColor="#0affff" />
            <stop offset="56%" stopColor="#0abeff" />
            <stop offset="87%" stopColor="#0066ff" /> */}
            <stop offset="6%" stopColor="#fff" />
            <stop offset="9%" stopColor="#cffcfd" />
            <stop offset="30%" stopColor="#0affff" />
            <stop offset="56%" stopColor="#0abeff" />
            <stop offset="88%" stopColor="#0066ff" />
          </linearGradient>
        )}
        {notGrad && (
          <linearGradient id={`textLinearGradient_${textId}`} x1={x2} y1={y2} x2={x1} y2={y1}>
            <stop offset="100%" stopColor={oneColor} />
          </linearGradient>
        )}
      </defs>
      <text
        x={size / 2}
        y={size / 2}
        textAnchor="middle"
        dy=".3em" // テキストを垂直方向に少し下げるオプション（調整が必要な場合）
        fontSize={fontSize} // フォントサイズ（必要に応じて調整）
        fontWeight={600}
        fontFamily="sans-serif"
        fill={`${textColor ? textColor : `url(#textLinearGradient_${textId})`}`}
      >
        {displayProgress}%
      </text>
    </svg>
  );
};

// propsの引数にデフォルト値を書くのではなく、下記の書き方でもOK
// CircleProgressBar.defaultProps = {
//   progress: 0,
//   size: 100,
//   strokeWidth: 10,
// };

export const ProgressCircle = memo(ProgressCircleMemo);
