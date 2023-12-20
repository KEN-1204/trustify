import { Dispatch, MouseEvent, MouseEventHandler, SetStateAction } from "react";
import { IoIosSend } from "react-icons/io";
import { MdClose } from "react-icons/md";
import styles from "../../CompanyDetail/CompanyDetail.module.css";

type Props = {
  inputState: string;
  setInputState: Dispatch<SetStateAction<string>>;
  onClickSendEvent: MouseEventHandler<HTMLDivElement>;
  required: boolean;
};

export const InputSendAndCloseBtn = ({ inputState, setInputState, onClickSendEvent, required = true }: Props) => {
  return (
    <>
      {/* バツボタン */}
      {inputState !== "" && (
        <div className={`${styles.close_btn}`} onClick={() => setInputState("")}>
          <MdClose className="z-[2100] text-[20px]" />
        </div>
      )}
      {/* 送信ボタン */}
      <div
        className={`flex-center transition-bg03 group absolute right-[10px] top-[calc(50%-2.5px)] z-[2100] min-h-[26px] min-w-[26px] translate-y-[-50%] rounded-full border border-solid border-transparent ${
          required && inputState === ""
            ? `cursor-not-allowed text-[#999]`
            : `border-[var(--color-bg-brand-f) cursor-pointer  hover:bg-[var(--color-bg-brand-f)] hover:shadow-lg`
        }`}
        onClick={onClickSendEvent}
      >
        <IoIosSend
          className={`text-[20px] ${
            inputState !== "" ? `text-[var(--color-bg-brand-f)] group-hover:text-[#fff]` : `text-[#999]`
          } `}
        />
      </div>
    </>
  );
};
