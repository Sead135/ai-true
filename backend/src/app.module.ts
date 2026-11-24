import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { AppController } from "./app.controller";
import { BranchesModule } from "./branches/branches.module";
import { CompaniesModule } from "./companies/companies.module";
import { DatabaseModule } from "./database/database.module";
import { ReviewsModule } from "./reviews/reviews.module";
import { StatsModule } from "./stats/stats.module";

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
  ],
  controllers: [AppController],
})
export class AppModule {}
