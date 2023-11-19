import useStore from "@/store";
import React, { FC, memo, useEffect, useRef, useState } from "react";
import styles from "../Root.module.css";
import { Feature3TextEn, Feature3TextJa } from "./data";

type Props = {
  hoveredFeature: boolean;
  featureSection: number;
};

const FeatureParagraph3Memo: FC<Props> = ({ hoveredFeature, featureSection }) => {
  const language = useStore((state) => state.language);
  const startAnimationFeature3 = useStore((state) => state.startAnimationFeature3);
  // タイプライターアニメーションの実装
  const paragraphRef = useRef<HTMLParagraphElement | null>(null);
  const textRef = useRef<string>("");
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [textArea, setTextArea] = useState("");

  const textMaterial = language === "ja" ? Feature3TextJa : Feature3TextEn;

  useEffect(() => {
    if (!startAnimationFeature3) return;
    if (typeof textMaterial === "undefined") return;
    if (running) return console.log("3リターン！");
    if (done) return;

    const typeWriterEvent = () => {
      if (done) return;
      setRunning(true);

      if (index >= textMaterial.length) {
        setDone(true);
        return console.log("1終了！！✅", index, textMaterial.length); // indexが指定した文字数に達したらアニメーションを終了する
      }
      let newText = text.slice();
      newText += textMaterial[index]; // １文字ずつ追加する
      const newIndex = index + 1; // 文字を追加する毎にindexを１増やして、次の追加する文字をindexで指定する
      console.log("タイプライタースタート3", "indexとnewIndex", index, newIndex, "代入後newText", newText);
      setTimeout(
        () => {
          setText(newText);
          setIndex(newIndex);
          setRunning(false);
        },
        language === "ja" ? 45 : 20
      );
      //   }, 45);
      // }, 60);
    };

    typeWriterEvent();
  }, [text, index, startAnimationFeature3]);

  return (
    <>
      {!done && (
        <p
          ref={paragraphRef}
          className={`pointer-events-none relative z-0 min-h-[216px] select-none ${
            hoveredFeature ? `transition-base text-[#fff]` : ``
          }`}
          style={{ whiteSpace: "pre-line" }}
        >
          {text}
          <span className={`relative z-10 ml-[-2px] min-h-[16px] max-w-[1px] ${styles.typewriter_caret_blink}`}>|</span>
        </p>
      )}
      {done && startAnimationFeature3 && (
        <p
          className={`pointer-events-none relative z-0 min-h-[216px] select-none ${
            hoveredFeature ? `transition-base text-[#fff]` : ``
          }`}
          style={{ whiteSpace: "pre-line" }}
        >
          {textMaterial}
          <span className={`relative z-10 ml-[0px] min-h-[16px] max-w-[1px] ${styles.typewriter_caret_blink}`}>|</span>
        </p>
      )}
    </>
  );
};

export const FeatureParagraph3 = memo(FeatureParagraph3Memo);
