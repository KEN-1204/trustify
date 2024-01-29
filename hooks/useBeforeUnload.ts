// ページ遷移時に確認画面を表示
import { useEffect } from "react";

const useBeforeUnload = (message: string) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.returnValue = message;
      return message;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [message]);
};

export default useBeforeUnload;
