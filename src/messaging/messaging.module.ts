import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { AuthGuard } from 'src/common/guards/auth/auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagingController } from './messaging.controller';
import { MessagingGateway } from './messaging.gateway';
import { MessagingService } from './messaging.service';

@Module({
    imports: [PrismaModule, FirebaseModule],
    controllers: [MessagingController],
    providers: [MessagingGateway, MessagingService, AuthGuard],
})
export class MessagingModule {}
