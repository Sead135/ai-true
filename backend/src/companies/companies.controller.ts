import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { CompaniesService } from "./companies.service.js";
import { CompaniesPageDto, CompanyDto } from "./dto/company.dto.js";
import { CreateCompanyDto } from "./dto/create-company.dto.js";
import { ListCompaniesQueryDto } from "./dto/list-companies.query.dto.js";
import { UpdateCompanyDto } from "./dto/update-company.dto.js";

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

  @Delete(":id")
  @Roles("admin", "client")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  @ApiForbiddenResponse({ description: "Company is outside your scope" })
  @ApiNotFoundResponse({ description: "Company not found" })
  async remove(@Req() req: AuthenticatedRequest, @Param("id") id: string): Promise<void> {
    await this.companies.remove(req.user, id);
  }
}
