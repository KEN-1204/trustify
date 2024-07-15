export function validateAndFormatEmail(email: string): { isValid: boolean; formattedEmail: string } {
  // 🌠正式にフロントエンドで使用するlocal部分とDomain部分の正規表現をdot-atom形式に対応したバリデーションチェック
  // local部分とdomain部分を合わせた形でメールアドレス全体のバリデーションチェックをする際にdot-atom形式のみに対応した正規表現
  // (quoted-string形式には対応せず、dot-atom形式のみに対応した正規表現)

  // 【2段階のバリデーションチェック】

  try {
    // トリミングと小文字化
    const normalizedEmail = email.trim().toLowerCase();
    // 1. メールアドレスがdot-atom形式に対応しているか構文チェック atextと(.)ドットのみ許可 連続したdotは禁止,先頭末尾のdotも禁止
    // atext: 英数字（A-Z, a-z, 0-9）や特定の記号（!#$%&'*+-/=?^_`{|}~）
    const regexEmailDotAtom =
      /^[a-zA-Z0-9_+%\-]+(\.[a-zA-Z0-9_+%\-]+)*@[a-zA-Z0-9\-]+(\.[a-zA-Z0-9\-]+)*\.[a-zA-Z]{2,}$/;
    const isValidDotAtom = regexEmailDotAtom.test(normalizedEmail);

    if (!isValidDotAtom) throw new Error("メールアドレスの形式が有効ではありません。");

    // 2. 文字数チェック local部分: 最大64文字, domain部分: 最大255文字
    const regexEmailLength = /^(?=.{1,64}@)(?=.{1,255}$)/;
    const isValidLength = regexEmailLength.test(normalizedEmail);

    if (!isValidLength) throw new Error("メールアドレスの長さが規定を超えています。");

    return { isValid: true, formattedEmail: normalizedEmail };
  } catch (error) {
    console.log("emailバリデーションチェック: ", error);
    return { isValid: false, formattedEmail: "" };
  }
}
