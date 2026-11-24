import { Body, Controller, Get, Param, Post, Req } from "@nestjs/common";
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
import { BranchesService } from "./branches.service";
import { BranchDto } from "./dto/branch.dto";
import { CreateBranchDto } from "./dto/create-branch.dto";

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
  @ApiOkResponse({ type: BranchDto, isArray: true })
  list(@Req() req: AuthenticatedRequest): Promise<BranchDto[]> {
    return this.branches.list(req.user);
  }

  @Get(":id")
  @Roles("admin", "client")
  @ApiOkResponse({ type: BranchDto })
  @ApiForbiddenResponse({ description: "Branch is outside your scope" })
  @ApiNotFoundResponse({ description: "Branch not found" })
  getOne(@Req() req: AuthenticatedRequest, @Param("id") id: string): Promise<BranchDto> {
    return this.branches.getForActor(req.user, id);
  }
}
