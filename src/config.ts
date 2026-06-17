/**
 * Application configuration interface definitions.
 */
export interface EnvironmentConfig {
	readonly discordToken: string;
	readonly discordAppId: string;
	readonly discordUserId: string;
	readonly osuClientId: number;
	readonly osuClientSecret: string;
	readonly osuUserId: string;
	readonly syncIntervalMs: number;
}

/**
 * Initializes and validates runtime environment configurations.
 * @throws {Error} If mandatory environment configurations are absent or malformed.
 */
function loadAndValidateConfig(): EnvironmentConfig {
	const {
		DISCORD_TOKEN,
		DISCORD_APP_ID,
		DISCORD_USER_ID,
		OSU_CLIENT_ID,
		OSU_CLIENT_SECRET,
		OSU_USER_ID,
		SYNC_INTERVAL_MS,
	} = Bun.env;

	if (
		!DISCORD_TOKEN ||
		!DISCORD_APP_ID ||
		!DISCORD_USER_ID ||
		!OSU_CLIENT_ID ||
		!OSU_CLIENT_SECRET ||
		!OSU_USER_ID
	) {
		throw new Error(
			"ConfigurationInitializationException: Missing vital environment variables.",
		);
	}

	const parsedOsuClientId = Number.parseInt(OSU_CLIENT_ID, 10);
	if (Number.isNaN(parsedOsuClientId)) {
		throw new Error(
			"ConfigurationValidationException: OSU_CLIENT_ID must be a valid integer base 10.",
		);
	}

	const parsedInterval = SYNC_INTERVAL_MS
		? Number.parseInt(SYNC_INTERVAL_MS, 10)
		: 300000;

	return {
		discordToken: DISCORD_TOKEN,
		discordAppId: DISCORD_APP_ID,
		discordUserId: DISCORD_USER_ID,
		osuClientId: parsedOsuClientId,
		osuClientSecret: OSU_CLIENT_SECRET,
		osuUserId: OSU_USER_ID,
		syncIntervalMs: Number.isNaN(parsedInterval) ? 300000 : parsedInterval,
	};
}

export const config = loadAndValidateConfig();
