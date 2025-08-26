import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Configuration } from "./config/configuration";

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService<Configuration>) {}

  getHealthStatus() {
    const appConfig = this.configService.get("app");

    return {
      status: "OK",
      message: `${appConfig?.name || "EPREL API Server"} is running`,
      timestamp: new Date().toISOString(),
      version: appConfig?.version || "1.0.0",
      environment: this.configService.get("nodeEnv") || "development",
    };
  }
}
