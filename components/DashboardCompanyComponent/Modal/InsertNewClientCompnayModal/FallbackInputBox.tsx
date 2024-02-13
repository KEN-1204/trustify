import styles from "./InsertNewClientCompanyModal.module.css";

export const FallbackInputBox = () => {
  return (
    <div className={`input_container relative z-[100] flex h-[32px] w-full items-start`}>
      <div className={`${styles.input_box}`}></div>
    </div>
  );
};
