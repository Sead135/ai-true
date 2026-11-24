import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { DatabaseModule } from "./database/database.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../.env"],
    }),
    DatabaseModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
