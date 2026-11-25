import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard.js";
import { Roles } from "../auth/roles.decorator.js";
import { PresignUploadDto, PresignUploadResponseDto } from "./dto/presign-upload.dto.js";
import { UploadsService } from "./uploads.service.js";

@ApiTags("uploads")
@ApiBearerAuth()
@ApiCookieAuth("access_token")
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploads: UploadsService) {}

  @Post("presign")
  @Roles("admin", "client")
  @ApiOkResponse({ type: PresignUploadResponseDto })
  presign(
    @Req() req: AuthenticatedRequest,
    @Body() body: PresignUploadDto,
  ): Promise<PresignUploadResponseDto> {
    return this.uploads.presign(req.user, body);
  }
}
