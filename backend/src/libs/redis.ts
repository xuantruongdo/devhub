import Redis from "ioredis";

class RedisClient {
  private static instance: Redis;

  static getInstance() {
    if (!this.instance) {
      this.instance = new Redis(process.env.REDIS_URL!, {
        maxRetriesPerRequest: null,
        enableReadyCheck: true,
        lazyConnect: true,

        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
      });

      this.instance.on("connect", () => {
        console.log("[Redis] connecting...");
      });

      this.instance.on("ready", () => {
        console.log("[Redis] ready");
      });

      this.instance.on("error", (err) => {
        console.error("[Redis] error", err);
      });

      this.instance.on("close", () => {
        console.warn("[Redis] connection closed");
      });
    }

    return this.instance;
  }
}

export const redis = RedisClient.getInstance();
