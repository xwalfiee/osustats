import axios from "axios";
import { config } from "../config";
import type { DiscordWidgetPayload } from "../types/discord";

export async function syncUserDiscordWidget(
  discordId: string,
  stats: {
    username: string;
    avatarUrl: string;
    joinDate: string;
    globalRank: string;
    countryRank: string;
    pp: string;
    accuracy: string;
    topPlay: string;
    playtime: string;
  },
): Promise<void> {
  const dynamicData: DiscordWidgetPayload["data"]["dynamic"] = [
    { type: 1, name: "username", value: stats.username },
    { type: 3, name: "avatar", value: { url: stats.avatarUrl } },
    { type: 1, name: "join_date", value: stats.joinDate },
    { type: 1, name: "global_ranking", value: stats.globalRank },
    { type: 1, name: "country_ranking", value: stats.countryRank },
    { type: 1, name: "performance_points", value: stats.pp },
    { type: 1, name: "accuracy", value: stats.accuracy },
    { type: 1, name: "top_play", value: stats.topPlay },
    { type: 1, name: "playtime", value: stats.playtime },
  ];

  const payload: DiscordWidgetPayload = {
    username: stats.username,
    data: {
      dynamic: dynamicData,
    },
  };

  console.log(
    `[INFO] [${new Date().toISOString()}] Updating Discord widget for ${discordId}`,
  );

  console.table({
    username: stats.username,
    avatar: stats.avatarUrl,
    join_date: stats.joinDate,
    global_rank: stats.globalRank,
    country_rank: stats.countryRank,
    pp: stats.pp,
    accuracy: stats.accuracy,
    top_play: stats.topPlay,
    playtime: stats.playtime,
  });

  const url = `https://discord.com/api/v9/applications/${config.discordAppId}/users/${discordId}/identities/0/profile`;

  try {
    const response = await axios.patch(url, payload, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bot ${config.discordToken}`,
        "User-Agent":
          "DiscordBot (https://github.com/discord/discord-api-docs, 1.0.0)",
      },
    });

    if (![200, 201, 204].includes(response.status)) {
      throw new Error(JSON.stringify(response.data));
    }

    console.log(
      `[INFO] [${new Date().toISOString()}] Discord widget updated successfully for ${discordId}`,
    );
  } catch (error) {
    const details = axios.isAxiosError(error)
      ? JSON.stringify(error.response?.data)
      : String(error);

    throw new Error(`DiscordWidgetMutationException: ${details}`);
  }
}
