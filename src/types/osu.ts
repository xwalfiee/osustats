export interface OsuTokenResponse {
	readonly token_type: string;
	readonly expires_in: number;
	readonly access_token: string;
}

export interface OsuUserResponse {
	readonly id: number;
	readonly username: string;
	readonly avatar_url: string;

	readonly join_date: string;

	readonly statistics: {
		readonly global_rank: number | null;
		readonly country_rank: number | null;
		readonly pp: number;
		readonly hit_accuracy: number;
		readonly play_time: number;
	};
}

export interface OsuScoreResponse {
	readonly pp: number;
}

export interface NormalizedOsuStats {
	readonly username: string;
	readonly avatarUrl: string;
	readonly joinDate: string;
	readonly globalRank: string;
	readonly countryRank: string;
	readonly pp: string;
	readonly accuracy: string;
	readonly topPlay: string;
	readonly playtime: string;
}
