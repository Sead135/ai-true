import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  Req,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { ListUsersQueryDto } from "./dto/list-users.query.dto.js";
import { UpdateUserDto } from "./dto/update-user.dto.js";
import { UserDto, UsersPageDto } from "./dto/user.dto.js";
import { UsersService } from "./users.service.js";

@ApiTags("users")
@ApiBearerAuth()
@ApiCookieAuth("access_token")
@Controller("users")
@Roles("admin")
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @ApiOkResponse({ type: UsersPageDto })
  list(@Query() query: ListUsersQueryDto): Promise<UsersPageDto> {
    return this.users.list(query);
  }

  @Get(":id")
  @ApiOkResponse({ type: UserDto })
  getOne(@Param("id") id: string): Promise<UserDto> {
    return this.users.getOne(id);
  }

  @Patch(":id")
  @ApiOkResponse({ type: UserDto })
  update(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserDto> {
    return this.users.update(req.user, id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse()
  async remove(@Req() req: AuthenticatedRequest, @Param("id") id: string): Promise<void> {
    await this.users.remove(req.user, id);
  }
}
