import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { User } from '@prisma/client';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { sendResponse } from 'src/utils/sendResponse';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagingService } from './messaging.service';

@Controller('messages')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @UseGuards(AuthGuard)
  @Post()
  async sendMessage(
    @Req() req: Request & { user: User },
    @Body() payload: CreateMessageDto,
  ) {
    const message = await this.messagingService.sendMessage(req.user, payload);
    return sendResponse('Message sent', message);
  }

  @UseGuards(AuthGuard)
  @Get('firebase-token')
  async getFirebaseToken(@Req() req: Request & { user: User }) {
    const token = await this.messagingService.createFirebaseCustomToken(
      req.user,
    );
    return sendResponse('Firebase token generated', { token });
  }
}
