import { useDownloadUrl } from "@/hooks/useDownloadUrl";
import useDashboardStore from "@/store/useDashboardStore";
import { MemberAccounts } from "@/types";
import NextImage from "next/image";
import React, { memo } from "react";
import { BsCheck2 } from "react-icons/bs";

const MemberCardMemo = ({ member }: { member: MemberAccounts }) => {
  // 選択された削除メンバーの配列Zustand
  const selectedMembersArrayForDeletion = useDashboardStore((state) => state.selectedMembersArrayForDeletion);
  const setSelectedMembersArrayForDeletion = useDashboardStore((state) => state.setSelectedMembersArrayForDeletion);
  // const { fullUrl: avatarUrl, isLoading: isLoadingAvatar } = useDownloadUrl(member.avatar_url, "avatars");
  const { fullUrl: avatarUrl, isLoading: isLoadingAvatar, setFullUrl } = useDownloadUrl(member.avatar_url, "avatars");

  // ローカルstateで画像のオブジェクトURL文字列を生成しているため、行コンポーネントがアンマウントした時点でリソースを解放
  useEffect(() => {
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
        setFullUrl(null);
      }
    };
  }, []);

  // 頭文字のみ抽出
  const getInitial = (name: string) => name[0];

  const isSelected = selectedMembersArrayForDeletion.some((deletion) => deletion.id === member.id);
  return (
    <div
      //   key={member.id}
      className={`flex min-h-[44px] w-full cursor-pointer items-center justify-between truncate rounded-[8px] py-[12px] pl-[24px] hover:bg-[var(--setting-side-bg-select)] ${
        isSelected ? `` : ``
      }`}
      onClick={() => {
        // 既にこのメンバーが選択されている場合
        if (selectedMembersArrayForDeletion.some((deletion) => deletion.id === member.id)) {
          // let ingredients_list_deepcopy = JSON.parse(JSON.stringify(ingredients_list)); // ディープコピー
          const copiedMembersArray = [...selectedMembersArrayForDeletion]; // シャローコピー
          // ・filter()で配列からメンバーのオブジェクトを取り除く方法
          // const filteredMembersArray = newMembersArray.filter((deletion) => deletion.id !== member.id)
          // ・findIndex()とsplice()で配列をインプレース(*1)する方法
          //   => 削除対象のobjのindexを配列から取得し、splice()でそのindexのobjを1つ削除
          const deletionIndex = copiedMembersArray.findIndex((deletion) => deletion.id === member.id);
          if (deletionIndex !== -1) copiedMembersArray.splice(deletionIndex, 1);
          setSelectedMembersArrayForDeletion(copiedMembersArray);
        }
        // mまだこのメンバーが選択されていない場合
        else {
          const newMembersArray = [...selectedMembersArrayForDeletion];
          newMembersArray.push(member);
          setSelectedMembersArrayForDeletion(newMembersArray);
        }
      }}
    >
      <div className="flex h-full  items-center">
        {!avatarUrl && (
          <div
            // data-text="ユーザー名"
            className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer rounded-full bg-[var(--color-bg-brand-sub)] text-[#fff] hover:bg-[var(--color-bg-brand-sub-hover)]`}
            // onMouseEnter={(e) => handleOpenTooltip(e, "center")}
            // onMouseLeave={handleCloseTooltip}
          >
            <span className={`text-[20px]`}>{getInitial(member.profile_name ? member.profile_name : "")}</span>
          </div>
        )}
        {avatarUrl && (
          <div
            className={`flex-center mr-[15px] h-[40px] w-[40px] cursor-pointer overflow-hidden rounded-full hover:bg-[#00000020]`}
          >
            <NextImage
              src={avatarUrl}
              alt="logo"
              className={`h-full w-full object-cover text-[#fff]`}
              width={75}
              height={75}
            />
          </div>
        )}
        <div className={`flex h-full flex-col space-y-[3px] pl-[5px] text-[12px]`}>
          <div className={`text-[13px] ${isSelected ? `text-[var(--color-text-brand-f)]` : ``}`}>
            <span>{member.profile_name ? member.profile_name : ""}</span>
          </div>
          <div className={`${isSelected ? `text-[var(--color-bg-brand-fc0)]` : `text-[var(--color-text-sub)]`}`}>
            {member.email ? member.email : ""}
          </div>
        </div>
      </div>
      {/* {isSelected && (
        <div className="flex-center mr-[15px] min-h-[32px] min-w-[32px] rounded-full bg-[var(--color-bg-brand-fe0)]">
          <BsCheck2 className="stroke-[0.5] text-[20px] text-[#fff]" />
        </div>
      )} */}
      {isSelected && (
        <div className="flex-center mr-[15px] min-h-[32px] min-w-[32px] rounded-full">
          <BsCheck2 className="stroke-[0.5] text-[24px] text-[var(--color-text-brand-f)]" />
        </div>
      )}
    </div>
  );
};

export const MemberCard = memo(MemberCardMemo);

/**
 * *1 filter()と「findIndex()とsplice()の破壊的メソッド」のパフォーマンスの観点
 * ・filter()メソッドは、条件に一致しない要素をすべて含む新しい配列を作成するため、配列が大きい場合はそれなりのコストがかかります。ただし、一致する要素が少ない場合は、このメソッドが効率的です。
 * 
 * ・配列が非常に大きく、取り除きたいオブジェクトが配列の前方にある場合は、findIndex()とsplice()を組み合わせて使用することで、検索を早期に終了させ、配列を「インプレース」で変更することも可能です。
 * 
 * ○「インプレース」とは：
 * 「インプレース（in-place）」という用語は、データ構造やアルゴリズムにおいて、新しいデータ構造を作成せずに、既存のデータをその場で（in-place）変更する操作を指します。これは、追加のメモリを消費することなく元のデータ構造上で直接変更を加えることを意味し、メモリ効率が良いという利点があります。

例えば、配列の要素を削除する際にsplice()メソッドを使用すると、その配列自体が変更されます。新しい配列を作成するのではなく、元の配列の内容が直接変更されるため、「インプレース」での変更と呼ばれます。

let numbers = [1, 2, 3, 4, 5];
// 3を削除する
numbers.splice(numbers.indexOf(3), 1);
// numbersは現在[1, 2, 4, 5]になっている

この例では、numbers配列から3がインプレースで削除されており、元のnumbers配列が直接変更されています。これに対し、非インプレース（out-of-place）な操作では、新しい配列が作成され元の配列は変更されません。

インプレース操作はメモリを節約できる反面、元のデータが失われるため、変更前のデータが必要な場合は注意が必要です。また、Reactなどのライブラリを使用する場合は、状態の不変性を保つために非インプレース操作を使用することが一般的です。

○シャローコピーすれば不変性は保たれる。

const copiedNumbers = [...numbers]を使って配列numbersのシャローコピー（浅いコピー）を作成し、そのコピーに対してfindIndex()とsplice()を実行すると、元のnumbers配列の不変性は保たれます。これは、copiedNumbersがnumbersの新しいインスタンスを指しているため、copiedNumbersに対する変更がnumbersに影響を与えないからです。

let numbers = [1, 2, 3, 4, 5];

// numbersのシャローコピーを作成
const copiedNumbers = [...numbers];

// copiedNumbersから値3を削除
const index = copiedNumbers.findIndex(number => number === 3);
if (index !== -1) {
  copiedNumbers.splice(index, 1);
}

// numbersは変更されていない
console.log(numbers); // 出力: [1, 2, 3, 4, 5]

// copiedNumbersは変更されている
console.log(copiedNumbers); // 出力: [1, 2, 4, 5]

このコードでは、numbersは元の状態のままであり、変更が加えられたのはcopiedNumbersだけです。このようなアプローチは、Reactの状態管理で特に重要です。状態を直接変更せずに、新しい状態のコピーを作成し、そのコピーに変更を加えた後、新しい状態をuseStateのセッター関数に渡して状態を更新することで、Reactの再レンダリングの最適化とコンポーネントの予測可能な動作が保証されます。
 */
