// 全角を半角に変換する関数
export function zenkakuToHankaku(str: string) {
  const zen = ["０", "１", "２", "３", "４", "５", "６", "７", "８", "９"];
  const han = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  for (let i = 0; i < zen.length; i++) {
    const regex = new RegExp(zen[i], "g");
    str = str.replace(regex, han[i]);
  }

  return str;
}
