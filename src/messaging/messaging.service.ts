import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import * as admin from 'firebase-admin';
import { FirebaseService } from 'src/firebase/firebase.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseService: FirebaseService,
  ) {}

  async sendMessage(sender: User, payload: CreateMessageDto) {
    if (!sender?.email) {
      throw new BadRequestException('Invalid sender');
    }

    const receiver = await this.prisma.user.findFirst({
      where: {
        email: payload.recipientEmail,
        isVerified: true,
        isBlocked: false,
        isDeleted: false,
      },
    });

    if (!receiver) {
      throw new NotFoundException('Recipient not found');
    }

    const messageData = {
      senderEmail: sender.email,
      recipientEmail: payload.recipientEmail,
      content: payload.content,
    } as {
      senderEmail: string;
      recipientEmail: string;
      content: string;
    };

    const message = await this.prisma.message.create({
      data: messageData,
    });

    const messageResult = await this.prisma.message.findUnique({
      where: {
        id: message.id,
      },
      include: {
        Sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            role: true,
            isVerified: true,
          },
        },
        Receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            image: true,
            role: true,
            isVerified: true,
          },
        },
      },
    });

    const threadId = [sender.email, payload.recipientEmail]
      .sort()
      .join('::');

    await this.firebaseService
      .getFirestore()
      .collection('messages')
      .doc(message.id)
      .set({
        id: message.id,
        senderEmail: sender.email,
        recipientEmail: payload.recipientEmail,
        senderId: sender.id,
        recipientId: receiver.id,
        threadId,
        content: payload.content,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    return messageResult;
  }

  async createFirebaseCustomToken(user: User) {
    const claims = {
      email: user.email,
      role: user.role,
    };

    return this.firebaseService.createCustomToken(user.id, claims);
  }
}
