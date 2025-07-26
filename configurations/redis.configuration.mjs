import { createClient } from "redis";

class RedisHandler {
  constructor() {
    this.redisClient = createClient({
      socket: {
        host: "localhost",
        port: 6379,
        reconnectStrategy: (retries) => {
          if (retries > 5) {
            console.error("Too many Redis reconnection attempts.");
            return new Error("Redis reconnection failed");
          }
          console.warn(`Reconnecting to Redis... attempt ${retries}`);
          return Math.min(retries * 1000, 5000); // retry in increasing intervals, max 5s
        },
      },
    });

    this.redisClient.on("error", (err) => {
      console.error("Redis client error:", err);
    });

    this.redisClient.on("reconnecting", () => {
      console.log("Redis client is attempting to reconnect...");
    }); 

    this.redisClient.on("ready", () => {
      console.log("Connected to Redish");
    });

    this.MAX_TRIES = 1;
  }

  async redisConnection() {
    if (!this.redisClient.isOpen) {
      try {
        await this.redisClient.connect();
      } catch (err) {
        console.error("Initial Redis connection failed:", err.message);
        process.exit(1); // Optional: exit only on the first failure
      }
    } else {
      console.log("Redis connection already open.");
    }
  }
}

export const RedisConnection = new RedisHandler();
