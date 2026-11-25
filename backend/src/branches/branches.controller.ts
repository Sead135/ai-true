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
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { BranchesService } from "./branches.service.js";
import { BranchDto, BranchesPageDto } from "./dto/branch.dto.js";
import { CreateBranchDto } from "./dto/create-branch.dto.js";
import { ListBranchesQueryDto } from "./dto/list-branches.query.dto.js";
import { UpdateBranchDto } from "./dto/update-branch.dto.js";

@ApiTags("branches")
@ApiBearerAuth()
@ApiCookieAuth("access_token")
@Controller("branches")
export class BranchesController {
  constructor(private readonly branches: BranchesService) {}

  @Post()
  @Roles("client")
  @ApiCreatedResponse({ type: BranchDto })
  @ApiForbiddenResponse({ description: "Admin cannot create branches" })
  create(@Req() req: AuthenticatedRequest, @Body() body: CreateBranchDto): Promise<BranchDto> {
    return this.branches.create(req.user, body);
  }

  @Get()
  @Roles("admin", "client")
  @ApiOkResponse({ type: BranchesPageDto })
  list(
    @Req() req: AuthenticatedRequest,
    @Query() query: ListBranchesQueryDto,
  ): Promise<BranchesPageDto> {
    return this.branches.list(req.user, query);
  }

  @Get(":id")
  @Roles("admin", "client")
  @ApiOkResponse({ type: BranchDto })
  @ApiForbiddenResponse({ description: "Branch is outside your scope" })
  @ApiNotFoundResponse({ description: "Branch not found" })
  getOne(@Req() req: AuthenticatedRequest, @Param("id") id: string): Promise<BranchDto> {
    return this.branches.getForActor(req.user, id);
  }

  @Patch(":id")
  @Roles("admin", "client")
  @ApiOkResponse({ type: BranchDto })
  @ApiForbiddenResponse({ description: "Branch is outside your scope" })
  @ApiNotFoundResponse({ description: "Branch not found" })
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: UpdateBranchDto,
  ): Promise<BranchDto> {
    return this.branches.update(req.user, id, body);
  }
}
