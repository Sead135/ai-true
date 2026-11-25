import { Body, Controller, Get, Param, Patch, Post, Query, Req } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { CompaniesService } from "./companies.service";
import { CompaniesPageDto, CompanyDto } from "./dto/company.dto";
import { CreateCompanyDto } from "./dto/create-company.dto";
import { ListCompaniesQueryDto } from "./dto/list-companies.query.dto";
import { UpdateCompanyDto } from "./dto/update-company.dto";

@ApiTags("companies")
@ApiBearerAuth()
@ApiCookieAuth("access_token")
@Controller("companies")
export class CompaniesController {
  constructor(private readonly companies: CompaniesService) {}

  @Post()
  @Roles("client")
  @ApiCreatedResponse({ type: CompanyDto })
  @ApiForbiddenResponse({ description: "Admin cannot create companies" })
  create(@Req() req: AuthenticatedRequest, @Body() body: CreateCompanyDto): Promise<CompanyDto> {
    return this.companies.create(req.user, body);
  }

  @Get()
  @Roles("admin", "client")
  @ApiOkResponse({ type: CompaniesPageDto })
  list(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListCompaniesQueryDto,
  ): Promise<CompaniesPageDto> {
    return this.companies.list(req.user, query);
  }

  @Get(":id")
  @Roles("admin", "client")
  @ApiOkResponse({ type: CompanyDto })
  @ApiForbiddenResponse({ description: "Company is outside your scope" })
  @ApiNotFoundResponse({ description: "Company not found" })
  getOne(@Req() req: AuthenticatedRequest, @Param("id") id: string): Promise<CompanyDto> {
    return this.companies.getForActor(req.user, id);
  }

  @Patch(":id")
  @Roles("admin", "client")
  @ApiOkResponse({ type: CompanyDto })
  @ApiForbiddenResponse({ description: "Company is outside your scope" })
  @ApiNotFoundResponse({ description: "Company not found" })
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: UpdateCompanyDto,
  ): Promise<CompanyDto> {
    return this.companies.update(req.user, id, body);
  }
}
