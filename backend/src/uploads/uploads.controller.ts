import { Body, Controller, Post, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiCookieAuth, ApiOkResponse, ApiTags } from "@nestjs/swagger";
import type { AuthenticatedRequest } from "../auth/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { PresignUploadDto, PresignUploadResponseDto } from "./dto/presign-upload.dto";
import { UploadsService } from "./uploads.service";

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
