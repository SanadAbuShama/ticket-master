import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { signInSchema, signUpSchema, type SignUpDto, type SignInDto } from './auth.dto.js';
import { CurrentUser, Public } from '@nestjs/authentication';
import { type UserResponse, userResponseSchema, type InternalUser, toUserResponse } from '../users/user.types.js';
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ApiErrorResponse, ApiSessionRequired } from '../common/decorators/api.doc.decorators.js';
import { ErrorCode } from '../common/errors/error.codes.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @ApiCreatedResponse({ description: 'The new user', standardSchema: userResponseSchema })
  @ApiErrorResponse(ErrorCode.VALIDATION_FAILED)
  @ApiErrorResponse(ErrorCode.EMAIL_TAKEN)
  @Post('sign-up')
  async signUp(@Body({ schema: signUpSchema }) body: SignUpDto): Promise<UserResponse> {
    return toUserResponse(await this.authService.signUp(body))
  }

  @Public()
  @HttpCode(200)
  @ApiOkResponse({ description: 'The signed-in user', standardSchema: userResponseSchema })
  @ApiErrorResponse(ErrorCode.VALIDATION_FAILED)
  @ApiErrorResponse(ErrorCode.INVALID_CREDENTIALS)
  @Post('sign-in')
  async signIn(@Body({ schema: signInSchema }) body: SignInDto): Promise<UserResponse> {
    return toUserResponse(await this.authService.signIn(body))
  }

  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiSessionRequired()
  @Post('sign-out')
  async signOut(): Promise<void> {
    await this.authService.signOut()
  }

  @ApiOkResponse({ description: 'The current user', standardSchema: userResponseSchema })
  @ApiSessionRequired()
  @Get('me')
  me(@CurrentUser() user: InternalUser): UserResponse {
    return toUserResponse(user)
  }
}