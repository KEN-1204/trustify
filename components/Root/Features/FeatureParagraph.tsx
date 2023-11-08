import useStore from "@/store";
import React, { FC, memo, useEffect, useRef, useState } from "react";
import styles from "../Root.module.css";
import { Feature1TextEn, Feature1TextJa } from "./data";

type Props = {
  hoveredFeature: boolean;
  featureSection: number;
};

const FeatureParagraphMemo: FC<Props> = ({ hoveredFeature, featureSection }) => {
  const language = useStore((state) => state.language);
  const startAnimationFeature1 = useStore((state) => state.startAnimationFeature1);
  // タイプライターアニメーションの実装
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  const textMaterial = language === "Ja" ? Feature1TextJa : Feature1TextEn;

  useEffect(() => {
    if (!startAnimationFeature1) return;
    if (typeof textMaterial === "undefined") return;
    if (running) return console.log("1リターン！");
    if (done) return;

    const typeWriterEvent = () => {
      if (done) return;
      //   console.log("タイプライタースタート1");
      setRunning(true);

      if (index >= textMaterial.length) {
        setDone(true);
        return console.log("1終了！！✅", index, textMaterial.length); // indexが指定した文字数に達したらアニメーションを終了する
      }
      let newText = text.slice();
      newText += textMaterial[index]; // １文字ずつ追加する
      const newIndex = index + 1; // 文字を追加する毎にindexを１増やして、次の追加する文字をindexで指定する
      console.log("タイプライタースタート1", "indexとnewIndex", index, newIndex, "代入後newText", newText);
      setTimeout(
        () => {
          setText(newText);
          setIndex(newIndex);
          setRunning(false);
        },
        language === "Ja" ? 45 : 20
      );
      //   }, 45);
      // }, 60);
    };

    typeWriterEvent();
  }, [text, index, startAnimationFeature1]);

  return (
    <>
      {!done && (
        <p
          ref={paragraphRef}
          className={`relative z-0 min-h-[162px] ${hoveredFeature ? `transition-base text-[#fff]` : ``}`}
        >
          {text}
          <span className={`relative z-10 ml-[-2px] min-h-[16px] max-w-[1px] ${styles.typewriter_caret_blink}`}>|</span>
        </p>
      )}
      {done && startAnimationFeature1 && (
        <p className={`relative z-0 min-h-[162px] ${hoveredFeature ? `transition-base text-[#fff]` : ``}`}>
          {textMaterial}
          <span className={`relative z-10 ml-[0px] min-h-[16px] max-w-[1px] ${styles.typewriter_caret_blink}`}>|</span>
        </p>
      )}
    </>
  );
};

export const FeatureParagraph = memo(FeatureParagraphMemo);
