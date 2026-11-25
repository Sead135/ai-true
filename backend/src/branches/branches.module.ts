import { Module } from "@nestjs/common";
import { CompaniesModule } from "../companies/companies.module.js";
import { BranchesController } from "./branches.controller.js";
import { BranchesService } from "./branches.service.js";

@Module({
  imports: [CompaniesModule],
  controllers: [BranchesController],
  providers: [BranchesService],
  exports: [BranchesService],
})
export class BranchesModule {}
