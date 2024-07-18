import { useState, useRef, useEffect, Dispatch, SetStateAction, CSSProperties, memo } from "react";
import styles from "./CustomSelectMapping.module.css";
import { HiChevronDown } from "react-icons/hi2";
import { BsCheck2 } from "react-icons/bs";
import useStore from "@/store";

type Props = {
  stateArray: any[];
  dispatch: Dispatch<SetStateAction<any[]>>;
  targetIndex: number;
  selectedSetObj: Set<any>;
  requiredOptionsSet?: Set<any>;
  //   changeEventHandler?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  additionalEventHandlerAfterChange?: () => void;
  options: any[];
  getOptionName?: any;
  defaultValue?: any;
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
};

// stateが配列で、それぞれのカラムに対応したstateと選択肢をマッピング 選択済みは新たに選択できないようにする
const CustomSelectMappingMemo = ({
  stateArray,
  dispatch,
  targetIndex,
  selectedSetObj,
  requiredOptionsSet,
  options,
  getOptionName,
  defaultValue = "",
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

  // デフォルトバリュー
  useEffect(() => {
    if (!defaultValue) return;

    dispatch(defaultValue);
  }, []);

  const handleSelect = (option: any) => {
    const newArray = [...stateArray];
    newArray[targetIndex] = option;
    dispatch(newArray);
    setShowOptions(false);

    if (additionalEventHandlerAfterChange) additionalEventHandlerAfterChange();
  };

  // オプションがレンダリングした時にオプションの最大高さを取得して、画面下をはみ出していれば上側に表示
  useEffect(() => {
    if (!showOptions) {
      if (isRendered) setIsRendered(false);
    }
    // if (!firstMount) return;
    if (showOptions && optionsRef.current && selectRef.current) {
      // setFirstMount(false);
      // ウィンドウの高さとオプションリストの位置を計算
      const optionsRect = optionsRef.current.getBoundingClientRect();
      const selectRect = selectRef.current.getBoundingClientRect();
      // const spaceBelow = window.innerHeight - optionsRect.bottom;
      const spaceBelow = window.innerHeight - selectRect.bottom;
      const spaceAbove = optionsRect.top;

      // 下に十分なスペースがない場合は上に表示
      if (spaceBelow < optionsRect.height && spaceAbove > optionsRect.height) {
        setOptionsPosition("top");

        setDisplayPosition({
          x: selectRect.left - (modalPosition?.x ?? 0) + Math.round(selectRect.width / 2),
          y: selectRect.top - (modalPosition?.y ?? 0),
          // x: 0,
          // y: 0,
        });
      } else {
        setOptionsPosition("bottom");

        setDisplayPosition({
          x: selectRect.left - (modalPosition?.x ?? 0) + Math.round(selectRect.width / 2),
          y: selectRect.bottom - (modalPosition?.y ?? 0),
          // x: 0,
          // y: 0,
        });
      }

      setIsRendered(true);
    }
  }, [showOptions]); // showOptionsが変更された時に実行

  // クリックイベントを監視し、selectタグの外側がクリックされた場合は選択肢を非表示にする
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setShowOptions(false);
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

  return (
    <div
      ref={selectRef}
      className={`${styles.select_wrapper} ${withBorder ? styles.with_border : ``} ${customClass}`}
      style={
        {
          ...(activeColor && { "--active-color-text": activeColor }),
          ...(widthSelectBox && { width: widthSelectBox }),
          ...(maxWidth && { maxWidth: maxWidth }),
          ...(maxHeight && { maxHeight: maxHeight }),
          ...(bgDark && { background: `var(--color-select-bg-deep)` }),
        } as CSSProperties
      }
      //   onMouseDown={(e) => console.log(e)}
      onClick={() => {
        setShowOptions(!showOptions);
        handleCloseTooltip();
      }}
    >
      <div
        className={`${styles.value} ${maxWidth ? `truncate` : ``}`}
        // selectBoxのmaxWidthからarrow: 20, valueのmr: 9を引いた値がmaxWidth
        style={{
          ...(maxWidth && {
            maxWidth: `calc(${maxWidth}px - 20px - 9px - 4px)`,
          }),
          ...(isSelectedActiveColor &&
            stateArray[targetIndex] !== "" && {
              color: activeColor ? activeColor : `var(--main-color-f)`,
            }),
          ...(isBoldActiveText &&
            stateArray[targetIndex] !== "" && {
              fontWeight: 600,
            }),
          ...(requiredOptionsSet &&
            requiredOptionsSet.has(stateArray[targetIndex]) && { color: `var(--main-color-tk)`, fontWeight: 600 }),
        }}
        // style={{ ...(maxWidth && { maxWidth: `calc(${maxWidth - 1 - 3 - 20 - 9})` }) }}
        onMouseEnter={(e) => {
          const tooltipText = !getOptionName ? stateArray[targetIndex] : getOptionName(stateArray[targetIndex]);
          if (!tooltipText) return;
          const el = e.currentTarget;
          if (el.scrollWidth > el.offsetWidth || el.scrollHeight > el.offsetHeight) {
            handleOpenTooltip({
              e: e,
              display: "top",
              content: tooltipText,
              itemsPosition: "left",
            });
          }
        }}
        onMouseLeave={handleCloseTooltip}
      >
        {!getOptionName ? (
          <span>{stateArray[targetIndex]}</span>
        ) : (
          <span>{getOptionName(stateArray[targetIndex])}</span>
        )}
      </div>
      <div className={`${styles.down_arrow_icon} flex-center min-h-[20px] min-w-[20px] cursor-pointer rounded-full`}>
        <HiChevronDown
          className="stroke-[1] text-[13px] text-[var(--color-text-brand-f)]"
          style={{
            ...(isSelectedActiveColor &&
              stateArray[targetIndex] !== "" && {
                color: activeColor ? activeColor : `var(--main-color-f)`,
              }),
          }}
        />
      </div>
      {showOptions && (
        <ul
          ref={optionsRef}
          className={`${styles.options} ${
            optionsPosition === "top" ? `${styles.display_top}` : ``
          } border-real-with-shadow-dark ${isRendered ? `opacity-1` : `opacity-0`}`}
          style={{
            ...(displayX === "left" && { left: "0" }),
            ...(displayX === "center" && { left: "50%", transform: "translateX(-50%)" }),
            ...(displayX === "right" && { right: "0" }),
            ...(displayPosition &&
              optionsPosition === "top" && {
                position: `fixed`,
                zIndex: 8000,
                left: displayPosition.x,
                bottom: displayPosition.y,
                // transform: "unset",
              }),
            ...(displayPosition &&
              optionsPosition === "bottom" && {
                position: `fixed`,
                zIndex: 8000,
                left: displayPosition.x,
                top: displayPosition.y,
                // transform: "unset",
              }),
          }}
        >
          {options.map((option, index) => {
            return (
              <li
                key={index}
                onClick={() => {
                  if (stateArray[targetIndex] === option) {
                    setShowOptions(false);
                    return;
                  }
                  if (selectedSetObj.has(option)) return;
                  handleSelect(option);
                }}
                className={`flex min-w-max items-center truncate ${
                  selectedSetObj.has(option) && stateArray[targetIndex] !== option ? styles.disabled : ``
                } ${stateArray[targetIndex] === option ? `${styles.active}` : ``}`}
                style={{
                  padding: listItemPadding,
                  minWidth: listItemWidth,
                  ...(requiredOptionsSet &&
                    requiredOptionsSet.has(option) &&
                    !selectedSetObj.has(option) && { color: `var(--main-color-tk)`, fontWeight: 600 }),
                }}
              >
                {stateArray[targetIndex] === option ? (
                  <div className="flex-center mr-[5px] min-h-[18px] min-w-[18px]">
                    <BsCheck2 className="pointer-events-none stroke-1 text-[16px] text-[#fff]" />
                  </div>
                ) : (
                  <div className="mr-[5px] min-h-[18px] min-w-[18px]"></div>
                )}
                <span>
                  {!getOptionName && option}
                  {getOptionName && getOptionName(option)}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export const CustomSelectMapping = memo(CustomSelectMappingMemo);

// #00d436
