import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
  private readonly app: admin.app.App;
  private readonly firestore: admin.firestore.Firestore;

  constructor(private readonly configService: ConfigService) {
    this.app = this.initApp();
    this.firestore = this.app.firestore();
  }

  private initApp(): admin.app.App {
    if (admin.apps.length > 0) {
      const existingApp = admin.apps[0];
      if (existingApp) {
        return existingApp;
      }
    }



    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Firebase service account env is not set (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY)',
      );
    }

    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }

  getFirestore(): admin.firestore.Firestore {
    return this.firestore;
  }

  async createCustomToken(
    uid: string,
    claims?: Record<string, unknown>,
  ): Promise<string> {
    return this.app.auth().createCustomToken(uid, claims);
  }
}
