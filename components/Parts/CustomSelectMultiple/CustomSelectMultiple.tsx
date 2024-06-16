import { useState, useRef, useEffect, Dispatch, SetStateAction, CSSProperties, useMemo } from "react";
import styles from "./CustomSelectMultiple.module.css";
import { HiChevronDown } from "react-icons/hi2";
import { BsCheck2 } from "react-icons/bs";
import useStore from "@/store";

type Props = {
  stateArray: any[];
  dispatch: Dispatch<SetStateAction<any[]>>;
  selectedSetObj: Set<any>;
  //   changeEventHandler?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  additionalEventHandlerAfterChange?: () => void;
  options: any[];
  getOptionName?: any;
  displayX?: string;
  withBorder?: boolean;
  activeColor?: string;
  listItemPadding?: string;
  listItemWidth?: string;
  widthSelectBox?: string;
  maxWidth?: number;
  maxHeight?: number;
  customClass?: string;
  modalPosition?: { x: number; y: number } | null;
  bgDark?: boolean;
  isSelectedActiveColor?: boolean;
  isBoldActiveText?: boolean;
  zIndexOptionContainer?: number;
};

// stateが配列で、それぞれのカラムに対応したstateと選択肢をマッピング 選択済みは新たに選択できないようにする
export const CustomSelectMultiple = ({
  stateArray,
  dispatch,
  selectedSetObj,
  options,
  getOptionName,
  displayX = "center",
  additionalEventHandlerAfterChange,
  withBorder,
  activeColor,
  listItemPadding = `6px 9px 6px 6px`,
  listItemWidth = `120px`,
  // widthSelectBox = "max-content",
  widthSelectBox = "",
  maxWidth,
  maxHeight,
  customClass = ``,
  modalPosition = null,
  bgDark,
  isSelectedActiveColor = true,
  isBoldActiveText = true,
  zIndexOptionContainer = 8000,
}: Props) => {
  // const [value, setValue] = useState(defaultValue ? defaultValue : "");
  const [showOptions, setShowOptions] = useState(false);
  const [optionsPosition, setOptionsPosition] = useState("bottom");
  const [displayPosition, setDisplayPosition] = useState<{
    x?: number;
    y: number;
    displayX?: string;
    maxWidth?: number;
    minWidth?: number;
    fadeType?: string;
    sectionMenuWidth?: number;
  } | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  // const [firstMount, setFirstMount] = useState(true);
  // const valueRef = useRef<HTMLInputElement | null>(null);
  const selectRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLUListElement | null>(null);

  const [optionFirstPosition, setOptionFirstPosition] = useState<{
    x?: number;
    y: number;
  } | null>(null);

  // 選択中の複数テキストを#で区切った一つのテキストとして生成
  const joinedSelectedText = useMemo(() => {
    if (!stateArray?.length) return "";
    return stateArray.map((text) => (getOptionName ? `#${getOptionName(text)}` : `#${text}`)).join("　"); // #text1 #text2
  }, [stateArray]);

  // 選択で実行
  const handleSelect = (selectedOption: any) => {
    const newArray = [...stateArray];

    if (selectedSetObj.has(selectedOption)) {
      // 既に配列内に存在するなら配列から取り除く
      const filteredArray = newArray.filter((option) => option !== selectedOption);
      dispatch(filteredArray);
    } else {
      // まだ配列に存在していない場合には配列に格納する
      newArray.push(selectedOption);
      dispatch(newArray);
    }

    // setShowOptions(false);

    if (additionalEventHandlerAfterChange) additionalEventHandlerAfterChange();
  };

  // オプションがレンダリングした時にオプションの最大高さを取得して、画面下をはみ出していれば上側に表示
  useEffect(() => {
    if (!showOptions) {
      if (isRendered) setIsRendered(false);
      return;
    }
    // if (!firstMount) return;
    if (showOptions && optionsRef.current && selectRef.current) {
      // setFirstMount(false);
      // ウィンドウの高さとオプションリストの位置を計算
      const optionsRect = optionsRef.current.getBoundingClientRect();
      const selectRect = selectRef.current.getBoundingClientRect();
      // const spaceBelow = window.innerHeight - optionsRect.bottom;
      const spaceBelow = window.innerHeight - selectRect.bottom;
      const spaceAbove = selectRect.top;

      // console.log("高さ関連 ------------------------------------------------------------");
      // console.log("下の空き");
      // console.log(
      //   "window.innerHeight",
      //   window.innerHeight,
      //   "-",
      //   "selectRect.bottom",
      //   selectRect.bottom,
      //   "=",
      //   "spaceBelow",
      //   spaceBelow,
      //   "optionsRect.height",
      //   optionsRect.height
      // );
      // console.log(
      //   "spaceBelow < optionsRect.height",
      //   spaceBelow < optionsRect.height,
      //   spaceBelow < optionsRect.height ? `下の空き無し` : `下の空きあり`
      // );
      // console.log("上の空き");
      // console.log("spaceAbove", spaceAbove, "optionsRect.height", optionsRect.height);
      // console.log(
      //   "optionsRect.height < spaceAbove",
      //   optionsRect.height < spaceAbove,
      //   optionsRect.height < spaceAbove ? `上の空きあり` : `上の空きなし`
      // );
      // console.log("高さ関連 ------------------------------------------------------------");

      // 下に十分なスペースがない場合は上に表示
      if (spaceBelow < optionsRect.height && optionsRect.height < spaceAbove) {
        setOptionsPosition("top");

        setDisplayPosition({
          x: selectRect.left - (modalPosition?.x ?? 0) + Math.round(selectRect.width / 2),
          y: selectRect.top - optionsRect.height - (modalPosition?.y ?? 0),
          // x: 0,
          // y: 0,
        });
        console.log("上に表示", "selectRect.top", selectRect.top);
      } else {
        setOptionsPosition("bottom");

        setDisplayPosition({
          x: selectRect.left - (modalPosition?.x ?? 0) + Math.round(selectRect.width / 2),
          y: selectRect.bottom - (modalPosition?.y ?? 0),
          // x: 0,
          // y: 0,
        });
        console.log("下に表示", "selectRect.bottom", selectRect.bottom);
      }

      setIsRendered(true);
    }
  }, [showOptions]); // showOptionsが変更された時に実行

  // クリックイベントを監視し、selectタグの外側がクリックされた場合は選択肢を非表示にする
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // console.log("e.target", event.target, "e.currentTarget", event.currentTarget);

      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
          console.log("オプションボックスではない部分クリック オプションボックスを閉じる");
          setShowOptions(false);
          setDisplayPosition(null);
          setOptionFirstPosition(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [selectRef]);

  // ================== 🌟ツールチップ ==================
  const hoveredItemPosWrap = useStore((state) => state.hoveredItemPosWrap);
  const setHoveredItemPosWrap = useStore((state) => state.setHoveredItemPosWrap);
  type TooltipParams = {
    e: React.MouseEvent<HTMLElement, MouseEvent>;
    display?: "top" | "right" | "bottom" | "left" | "";
    content: string;
    content2?: string | undefined | null;
    marginTop?: number;
    itemsPosition?: string;
  };
  const handleOpenTooltip = ({ e, display = "top", content, content2, marginTop, itemsPosition }: TooltipParams) => {
    // ホバーしたアイテムにツールチップを表示
    const { x, y, width, height } = e.currentTarget.getBoundingClientRect();
    // console.log("ツールチップx, y width , height", x, y, width, height);
    const content2DataSet = ((e.target as HTMLDivElement).dataset.text2 as string)
      ? ((e.target as HTMLDivElement).dataset.text2 as string)
      : "";
    const content3 = ((e.target as HTMLDivElement).dataset.text3 as string)
      ? ((e.target as HTMLDivElement).dataset.text3 as string)
      : "";
    setHoveredItemPosWrap({
      x: x,
      y: y,
      itemWidth: width,
      itemHeight: height,
      content: content ?? ((e.target as HTMLDivElement).dataset.text as string),
      content2: content2 ?? content2DataSet,
      content3: content3,
      display: display,
      marginTop: marginTop,
      itemsPosition: itemsPosition,
    });
  };
  // ツールチップを非表示
  const handleCloseTooltip = () => {
    if (hoveredItemPosWrap) setHoveredItemPosWrap(null);
  };
  // ================== ✅ツールチップ ==================

  console.log(
    "カスタムセレクトボックスMultipleレンダリング"
    // "displayPosition?.y",
    // displayPosition?.y,
    // "optionsPosition",
    // optionsPosition
  );

  return (
    <>
      <div
        ref={selectRef}
        className={`${styles.select_wrapper} ${withBorder ? styles.with_border : ``} ${customClass}`}
        style={
          {
            ...(activeColor && { "--active-color-text": activeColor }),
            ...(widthSelectBox && { width: widthSelectBox }),
            ...(maxWidth && { maxWidth: maxWidth }),
            ...(maxHeight && { maxHeight: maxHeight, minHeight: maxHeight }),
            ...(bgDark && { background: `var(--color-select-bg-deep)` }),
          } as CSSProperties
        }
        //   onMouseDown={(e) => console.log(e)}
        onClick={(e) => {
          if (!showOptions) {
            const { x, bottom, width } = e.currentTarget.getBoundingClientRect();
            const positionX = x - (modalPosition?.x ?? 0) + width / 2;
            const positionY = bottom - (modalPosition?.y ?? 0);
            setOptionFirstPosition({ x: positionX, y: positionY });
            setShowOptions(true);
          }
          if (showOptions) {
            if (optionFirstPosition) setOptionFirstPosition(null);
            setShowOptions(false);
            setDisplayPosition(null);
          }
          handleCloseTooltip();
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget;
          console.log("1-w", el.scrollWidth, el.offsetWidth);
          console.log("1-h", el.scrollHeight, el.offsetHeight);
        }}
      >
        <div
          className={`${styles.value} ${maxWidth ? `truncate` : ``}`}
          // selectBoxのmaxWidthからarrow: 20, valueのmr: 9を引いた値がmaxWidth
          style={{
            fontSize: `12px`,
            ...(maxWidth && { maxWidth: `calc(${maxWidth - 20 - 9})` }),
            // ...(isSelectedActiveColor && { color: activeColor ? activeColor : `rgb(72, 163, 248)` }),
            ...(isSelectedActiveColor && { color: activeColor ? activeColor : `rgb(46 132 212)` }),
            ...(isBoldActiveText && { fontWeight: 600 }),
          }}
          // style={{ ...(maxWidth && { maxWidth: `calc(${maxWidth - 1 - 3 - 20 - 9})` }) }}
          onMouseEnter={(e) => {
            if (!joinedSelectedText) return;
            const el = e.currentTarget;
            console.log("2-w", el.scrollWidth, el.offsetWidth);
            console.log("2-h", el.scrollHeight, el.offsetHeight);
            if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight)
              handleOpenTooltip({
                e: e,
                display: "top",
                content: joinedSelectedText,
                itemsPosition: "left",
                // marginTop: 15,
                // maxWidth: 390,
                // whiteSpace: "pre-wrap",
              });
          }}
          onMouseLeave={handleCloseTooltip}
        >
          <span
          // className={`${maxWidth ? `truncate` : ``}`}
          // style={{ ...(maxWidth && { maxWidth: `calc(${maxWidth - 20 - 9})` }) }}
          >
            {joinedSelectedText}
          </span>
          {/* {!getOptionName ? (
          <>
            {stateArray.map((option, index) => (
              <span key={`${option}_${index}`} className={`mr-[3px]`}>
                {joinedSelectedText}
              </span>
            ))}
          </>
        ) : (
          <>
            {stateArray.map((option, index) => (
              <span key={`${option}_${index}`} className={`mr-[3px]`}>
                #{getOptionName(option)}
              </span>
            ))}
          </>
        )} */}
        </div>
        <div className={`${styles.down_arrow_icon} flex-center min-h-[20px] min-w-[20px] cursor-pointer rounded-full`}>
          <HiChevronDown
            className="stroke-[1] text-[13px] text-[var(--color-text-brand-f)]"
            style={{
              ...(isSelectedActiveColor && {
                color: activeColor ? activeColor : `var(--main-color-f)`,
              }),
            }}
          />
        </div>
      </div>
      {showOptions && (
        <ul
          ref={optionsRef}
          className={`${styles.options}  border-real-with-shadow-dark ${isRendered ? `opacity-1` : `opacity-0`}`}
          style={{
            position: `fixed`,
            zIndex: zIndexOptionContainer, // 8000
            ...(displayX === "center" && { left: "50%", transform: "translateX(-50%)" }),
            ...(!displayPosition &&
              !!optionFirstPosition && { left: optionFirstPosition.x, top: optionFirstPosition.y }),
            ...(displayPosition &&
              optionsPosition === "top" && {
                // position: `fixed`,
                // zIndex: zIndexOptionContainer, // 8000
                left: displayPosition.x,
                top: displayPosition.y,
                // transform: "unset",
              }),
            ...(displayPosition &&
              optionsPosition === "bottom" && {
                // position: `fixed`,
                // zIndex: zIndexOptionContainer, // 8000
                left: displayPosition.x,
                top: displayPosition.y,
                // bottom: "unset",
                // transform: "unset",
              }),
          }}
        >
          {options.map((option, index) => {
            return (
              <li
                key={index}
                onClick={() => {
                  handleSelect(option);
                }}
                // className={`flex min-w-max items-center truncate ${
                //   selectedSetObj.has(option) && stateArray[targetIndex] !== option ? styles.disabled : ``
                // } ${stateArray[targetIndex] ===  ? `${styles.active}` : ``}`}
                className={`flex min-w-max items-center truncate ${
                  selectedSetObj.has(option) ? `${styles.active}` : ``
                }`}
                style={{
                  padding: listItemPadding,
                  minWidth: listItemWidth,
                  fontSize: `12px`,
                }}
              >
                {selectedSetObj.has(option) ? (
                  <div className="flex-center mr-[5px] min-h-[18px] min-w-[18px]">
                    <BsCheck2 className="pointer-events-none stroke-1 text-[16px] text-[#fff]" />
                  </div>
                ) : (
                  <div className="mr-[5px] min-h-[18px] min-w-[18px]"></div>
                )}
                <span>{!getOptionName ? option : getOptionName(option)}</span>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};

// #00d436
