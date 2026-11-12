import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SERVICES } from '../common/clients/services';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly http: HttpService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Профиль пользователя (proxy → users)' })
  @ApiParam({ name: 'id', description: 'MongoDB ObjectId' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 400, description: 'Невалидный ObjectId' })
  @ApiResponse({ status: 404, description: 'Не найден' })
  async getUser(@Param('id') id: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${SERVICES.users}/users/${id}`),
      );
      return data;
    } catch (error: any) {
      const status = error?.response?.status ?? 500;
      const message = error?.response?.data ?? { message: 'Internal error' };
      throw new HttpException(message, status);
    }
  }

  @Patch('password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Смена пароля (proxy → users)' })
  async changePassword(
    @Headers('authorization') auth: string,
    @Body() body: unknown,
  ) {
    try {
      const { data } = await firstValueFrom(
        this.http.patch(`${SERVICES.users}/users/password`, body, {
          headers: { Authorization: auth },
        }),
      );
      return data;
    } catch (error: any) {
      const status = error?.response?.status ?? 500;
      const message = error?.response?.data ?? { message: 'Internal error' };
      throw new HttpException(message, status);
    }
  }
}
