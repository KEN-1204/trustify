import React, { FC, memo } from "react";

type Props = {
  from_user_name: string | null;
  from_user_email: string | null;
  team_name: string | null;
};

const NotificationTextChangeTeamOwnerMemo: FC<Props> = ({ from_user_name, from_user_email, team_name }) => {
  return (
    <p>
      <span className="font-bold">{from_user_name ?? from_user_email}</span>さんが
      <span className="font-bold">{team_name ?? "チーム"}</span>
      の所有者として代わりにあなたを任命しました。確認してください。
    </p>
  );
};

export const NotificationTextChangeTeamOwner = memo(NotificationTextChangeTeamOwnerMemo);
