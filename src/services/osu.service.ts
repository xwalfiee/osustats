import axios from "axios";
import { config } from "../config";
import type {
	NormalizedOsuStats,
	OsuTokenResponse,
	OsuUserResponse,
} from "../types/osu";

const BASE_URL = "https://osu.ppy.sh/api/v2";

function formatJoinDate(dateInput: string | Date): string {
	const date = new Date(dateInput);

	const day = date.getDate();
	const month = date.toLocaleString("en-GB", { month: "long" });
	const year = date.getFullYear();

	const getOrdinal = (n: number) => {
		if (n >= 11 && n <= 13) return "th";
		switch (n % 10) {
			case 1:
				return "st";
			case 2:
				return "nd";
			case 3:
				return "rd";
			default:
				return "th";
		}
	};

	return `${day}${getOrdinal(day)} ${month} ${year}`;
}

function formatPlaytime(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);

	if (hours <= 0) return `${minutes}m`;
	return `${hours}h ${minutes}m`;
}

/**
 * Requests a client credentials grant access token from the osu! OAuth endpoint.
 */
async function getClientCredentialsToken(): Promise<string> {
	try {
		const response = await axios.post<OsuTokenResponse>(
			"https://osu.ppy.sh/oauth/token",
			{
				client_id: config.osuClientId,
				client_secret: config.osuClientSecret,
				grant_type: "client_credentials",
				scope: "public",
			},
			{
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
			},
		);

		return response.data.access_token;
	} catch (error) {
		const details =
			axios.isAxiosError(error) && error.response?.data
				? JSON.stringify(error.response.data)
				: error instanceof Error
					? error.message
					: String(error);

		throw new Error(`OsuAuthenticationException: ${details}`);
	}
}

/**
 * Fetches profile statistics and top play data.
 */
export async function fetchProfileStatistics(): Promise<NormalizedOsuStats> {
	const accessToken = await getClientCredentialsToken();

	const headers = {
		Authorization: `Bearer ${accessToken}`,
		Accept: "application/json",
	};

	try {
		const userResponse = await axios.get<OsuUserResponse>(
			`${BASE_URL}/users/${config.osuUserId}/osu`,
			{ headers },
		);

		const user = userResponse.data;
		const joinDate = formatJoinDate(user.join_date);
		const stats = user.statistics;

		const topResponse = await axios.get<Array<{ pp: number }>>(
			`${BASE_URL}/users/${user.id}/scores/best`,
			{
				headers,
				params: {
					limit: 1,
				},
			},
		);

		const topPlay =
			topResponse.data.length > 0
				? `${Math.round(topResponse.data[0].pp)}pp`
				: "N/A";

		return {
			username: user.username,
			avatarUrl: user.avatar_url,
			joinDate,
			globalRank: stats.global_rank
				? `#${stats.global_rank.toLocaleString()}`
				: "N/A",
			countryRank: stats.country_rank
				? `#${stats.country_rank.toLocaleString()}`
				: "N/A",
			pp: Math.round(stats.pp).toLocaleString(),
			accuracy: `${stats.hit_accuracy.toFixed(2)}%`,
			topPlay,
			playtime: formatPlaytime(stats.play_time),
		};
	} catch (error) {
		const details =
			axios.isAxiosError(error) && error.response?.data
				? JSON.stringify(error.response.data)
				: error instanceof Error
					? error.message
					: String(error);

		throw new Error(`OsuDataRetrievalException: ${details}`);
	}
}
