import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";
import { config } from "@/config/env";

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis(config.redisUrl, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    this.client.on("error", (error) => {
      console.error("Redis Client Error:", error);
    });

    this.client.on("connect", () => {
      if (config.env !== "production") {
        console.log("Redis Client Connected");
      }
    });
  }

  getClient() {
    return this.client;
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
