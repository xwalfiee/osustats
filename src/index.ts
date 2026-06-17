import { config } from "./config";
import { syncUserDiscordWidget } from "./services/discord.service";
import { fetchProfileStatistics } from "./services/osu.service";

/**
 * Executes the synchronization pipeline wrapping external interactions inside retry mechanisms.
 */
async function executePipelineWithRetry(
  retries = 3,
  delayMs = 2000,
): Promise<void> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const statistics = await fetchProfileStatistics();
      await syncUserDiscordWidget(config.discordUserId, statistics);

      console.log(
        `[INFO] [${new Date().toISOString()}] Synchronization pipeline cycle executed successfully.`,
      );
      return;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `[WARN] [${new Date().toISOString()}] Pipeline attempt ${attempt} failed: ${errorMessage}`,
      );

      if (attempt === retries) {
        console.error(
          `[ERROR] [${new Date().toISOString()}] Maximum retries reached. Pipeline synchronization aborted.`,
        );
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
    }
  }
}

/**
 * Sets up execution interval handlers monitoring background process health states.
 */
function initialize(): void {
  console.log(
    `[INFO] [${new Date().toISOString()}] Initializing Synchronization Worker Service. Interval: ${config.syncIntervalMs}ms.`,
  );

  // Execute immediately on system launch
  executePipelineWithRetry();

  // Schedule background loop
  setInterval(() => {
    executePipelineWithRetry();
  }, config.syncIntervalMs);
}

// System daemon entry point
initialize();
