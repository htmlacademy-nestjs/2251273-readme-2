import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { SERVICES } from '../common/clients/services';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly http: HttpService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация (proxy → users)' })
  @ApiResponse({ status: 201, description: 'Пользователь создан' })
  @ApiResponse({ status: 400, description: 'Ошибка валидации' })
  @ApiResponse({ status: 409, description: 'Email уже занят' })
  async register(@Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.post(`${SERVICES.users}/auth/register`, body),
    );
    return data;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Логин → пара токенов (proxy → users)' })
  @ApiResponse({
    status: 200,
    schema: {
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
      },
    },
  })
  async login(@Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.post(`${SERVICES.users}/auth/login`, body),
    );
    return data;
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновить пару токенов (proxy → users)' })
  async refresh(@Body() body: unknown) {
    const { data } = await firstValueFrom(
      this.http.post(`${SERVICES.users}/auth/refresh`, body),
    );
    return data;
  }
}
