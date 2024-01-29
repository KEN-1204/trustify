import { Dispatch, FC, MouseEvent, MouseEventHandler, SetStateAction } from "react";
import { IoIosSend } from "react-icons/io";
import { MdClose } from "react-icons/md";
import styles from "../../CompanyDetail/CompanyDetail.module.css";
import { SpinnerComet } from "@/components/Parts/SpinnerComet/SpinnerComet";

// デフォルトのデータ型はstring
type Props<T = string> = {
  inputState: T; // string or (number | null)
  setInputState: Dispatch<SetStateAction<T>>;
  onClickSendEvent: MouseEventHandler<HTMLDivElement>;
  required: boolean;
  isDisplayClose?: boolean;
  btnPositionY?: string;
  isOutside?: boolean;
  outsidePosition?: string;
  isLoadingSendEvent?: boolean;
  iconSize?: string;
  btnSize?: string;
};
// type StringProps = {
//   inputState: string; // string or (number | null)
//   setInputState: Dispatch<SetStateAction<string>>;
//   onClickSendEvent: MouseEventHandler<HTMLDivElement>;
//   required: boolean;
//   isDisplayClose?: boolean;
//   btnPositionY?: string;
//   isOutside?: boolean;
//   outsidePosition?: string;
//   isLoadingSendEvent?: boolean;
// };
// type NumberOrNullProps = {
//   inputState: number | null; // number | null or (number | null)
//   setInputState: Dispatch<SetStateAction<number | null>>;
//   onClickSendEvent: MouseEventHandler<HTMLDivElement>;
//   required: boolean;
//   isDisplayClose?: boolean;
//   btnPositionY?: string;
//   isOutside?: boolean;
//   outsidePosition?: string;
//   isLoadingSendEvent?: boolean;
// };

// type Props = StringProps | NumberOrNullProps;

// <T,>の,はジェネリック型パラメータのリストの終了を明示する
// export const InputSendAndCloseBtn = <T,>({
// export const InputSendAndCloseBtn = <T,>({
export const InputSendAndCloseBtn = <T extends string | (number | null) = string>({
  inputState,
  setInputState,
  onClickSendEvent,
  required = true,
  isDisplayClose = true,
  btnPositionY = "top-[calc(50%-2.5px)] translate-y-[-50%]",
  isOutside = false,
  outsidePosition = "under_right",
  isLoadingSendEvent = false,
  iconSize,
  btnSize,
}: Props<T>) => {
  console.log("inputState", inputState);
  return (
    <>
      {!isOutside && (
        <>
          {/* バツボタン */}
          {isDisplayClose && (
            <div
              className={`${styles.close_btn} ${btnPositionY} right-[10px] ${
                isDisplayClose && inputState !== ""
                  ? `hover:bg-[var(--close-bg-deep)] hover:text-[#fff]`
                  : `!cursor-not-allowed text-[#999]`
              }`}
              onClick={() => {
                if (typeof inputState === "number" || inputState === null) {
                  if (isDisplayClose && inputState === null) return;
                  setInputState(null as T);
                  return;
                }
                if (isDisplayClose && inputState === "") return;
                setInputState("" as T);
              }}
            >
              <MdClose className="z-[2100] text-[20px]" />
            </div>
          )}
          {/* 送信ボタン */}
          <div
            className={`flex-center transition-bg03 group absolute ${
              isDisplayClose ? `right-[36px]` : `right-[10px]`
            } z-[2100] min-h-[26px] min-w-[26px] ${btnPositionY} rounded-full border border-solid border-transparent ${
              required && (inputState === "" || inputState === null)
                ? `cursor-not-allowed text-[#999]`
                : `border-[var(--color-bg-brand-f) cursor-pointer hover:bg-[var(--color-bg-brand-f)] hover:shadow-lg`
            }`}
            style={{ ...(btnSize && { minHeight: `${btnSize}px`, minWidth: `${btnSize}px` }) }}
            onClick={onClickSendEvent}
          >
            <IoIosSend
              className={`text-[20px] ${
                required && (inputState === "" || inputState === null)
                  ? `text-[#999] group-hover:text-[#999]`
                  : `text-[var(--color-bg-brand-f)] group-hover:text-[#fff]`
              } `}
              style={{ ...(iconSize && { fontSize: `${iconSize}px` }) }}
            />
          </div>
        </>
      )}
      {/* フィールドエディットモード専用エリア 入力ボックスの右下に配置 */}
      {/* {startDate && isFieldEditMode && ( */}
      {isOutside && (
        <div
          className={`${styles.field_edit_mode_btn_area} ${
            outsidePosition === "right" && !isLoadingSendEvent && styles.right_position
          } ${outsidePosition === "right" && isLoadingSendEvent && styles.right_position_loading} ${
            outsidePosition === "under_right" && !isLoadingSendEvent && styles.under_right_position
          } ${
            outsidePosition === "under_right" && isLoadingSendEvent && styles.under_right_position_loading
          } space-x-[6px]`}
        >
          {/* 送信ボタン フィールドエディットモード専用 */}
          {!isLoadingSendEvent && (
            <div
              className={`flex-center transition-bg03 group min-h-[26px] min-w-[26px] rounded-full border border-solid border-transparent ${
                required && (inputState === "" || inputState === null)
                  ? `cursor-not-allowed text-[#999]`
                  : `border-[var(--color-bg-brand-f) cursor-pointer hover:bg-[var(--color-bg-brand-f)] hover:shadow-lg`
              }`}
              onClick={onClickSendEvent}
            >
              <IoIosSend
                className={`text-[20px] ${
                  required && (inputState === "" || inputState === null)
                    ? `text-[#999] group-hover:text-[#999]`
                    : `text-[var(--color-bg-brand-f)] group-hover:text-[#fff]`
                }`}
              />
            </div>
          )}
          {/* バツボタン フィールドエディットモード専用 */}
          {!isLoadingSendEvent && (
            <div
              className={`${
                inputState
                  ? `${styles.close_btn_field_edit_mode} hover:shadow-lg`
                  : `${styles.close_btn_field_edit_mode_empty}`
              }`}
              onClick={() => {
                if (typeof inputState === "number" || inputState === null) {
                  if (inputState === null && inputState === undefined) return;
                  setInputState(null as T);
                  return;
                }
                if (!inputState) return;
                setInputState("" as T);
              }}
            >
              <MdClose className="text-[20px] " />
            </div>
          )}
          {/* ローディング フィールドエディットモード専用 */}
          {isLoadingSendEvent && (
            <div className={``}>
              <SpinnerComet w="22px" h="22px" s="3px" />
            </div>
          )}
        </div>
      )}
    </>
  );
};
