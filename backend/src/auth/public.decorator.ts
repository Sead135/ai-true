import { SetMetadata } from "@nestjs/common";

export const IS_PUBLIC_KEY = "isPublic";

/** Skip global JwtAuthGuard (login, register, refresh, logout, health). */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
