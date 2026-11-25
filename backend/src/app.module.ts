import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module.js";
import { AppController } from "./app.controller.js";
import { BranchesModule } from "./branches/branches.module.js";
import { CompaniesModule } from "./companies/companies.module.js";
import { DatabaseModule } from "./database/database.module.js";
import { ReviewsModule } from "./reviews/reviews.module.js";
import { StatsModule } from "./stats/stats.module.js";
import { UploadsModule } from "./uploads/uploads.module.js";
import { UsersModule } from "./users/users.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env", "../.env"],
    }),
    DatabaseModule,
    AuthModule,
    CompaniesModule,
    BranchesModule,
    StatsModule,
    ReviewsModule,
    UsersModule,
    UploadsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
