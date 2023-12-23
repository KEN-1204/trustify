import { Dispatch, MouseEvent, MouseEventHandler, SetStateAction } from "react";
import { IoIosSend } from "react-icons/io";
import { MdClose } from "react-icons/md";
import styles from "../../CompanyDetail/CompanyDetail.module.css";

type Props = {
  inputState: string;
  setInputState: Dispatch<SetStateAction<string>>;
  onClickSendEvent: MouseEventHandler<HTMLDivElement>;
  required: boolean;
  isDisplayClose?: boolean;
  btnPositionY?: string;
};

export const InputSendAndCloseBtn = ({
  inputState,
  setInputState,
  onClickSendEvent,
  required = true,
  isDisplayClose = true,
  btnPositionY = "top-[calc(50%-2.5px)] translate-y-[-50%]",
}: Props) => {
  return (
    <>
      {/* バツボタン */}
      {isDisplayClose && (
        <div
          // className={`${styles.close_btn} ${btnPositionY} right-[10px] ${
          //   isDisplayClose && inputState !== ""
          //     ? `hover:bg-[var(--color-bg-sub-deep)]`
          //     : `!cursor-not-allowed text-[#999]`
          // }`}
          className={`${styles.close_btn} ${btnPositionY} right-[10px] ${
            isDisplayClose && inputState !== ""
              ? `hover:bg-[var(--close-bg-deep)] hover:text-[#fff]`
              : `!cursor-not-allowed text-[#999]`
          }`}
          onClick={() => {
            if (isDisplayClose && inputState === "") return;
            setInputState("");
          }}
        >
          <MdClose className="z-[2100] text-[20px]" />
        </div>
      )}
      {/* {isDisplayClose && inputState !== "" && (
        <div className={`${styles.close_btn} ${btnPositionY} right-[10px]`} onClick={() => setInputState("")}>
          <MdClose className="z-[2100] text-[20px]" />
        </div>
      )} */}
      {/* 送信ボタン */}
      <div
        className={`flex-center transition-bg03 group absolute ${
          isDisplayClose ? `right-[36px]` : `right-[10px]`
        } z-[2100] min-h-[26px] min-w-[26px] ${btnPositionY} rounded-full border border-solid border-transparent ${
          required && inputState === ""
            ? `cursor-not-allowed text-[#999]`
            : `border-[var(--color-bg-brand-f) cursor-pointer hover:bg-[var(--color-bg-brand-f)] hover:shadow-lg`
        }`}
        onClick={onClickSendEvent}
      >
        <IoIosSend
          className={`text-[20px] ${
            required && inputState === ""
              ? `text-[#999] group-hover:text-[#999]`
              : `text-[var(--color-bg-brand-f)] group-hover:text-[#fff]`
          } `}
        />
      </div>
    </>
  );
};
