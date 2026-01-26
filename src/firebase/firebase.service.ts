import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { existsSync, readFileSync } from 'fs';

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

    const serviceAccountPath = this.configService.get<string>(
      'FIREBASE_SERVICE_ACCOUNT_PATH',
    );
    if (!serviceAccountPath) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH is not set');
    }
    if (!existsSync(serviceAccountPath)) {
      throw new Error(
        `Firebase service account file not found at ${serviceAccountPath}`,
      );
    }

    const serviceAccount = JSON.parse(
      readFileSync(serviceAccountPath, 'utf8'),
    ) as admin.ServiceAccount;

    return admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
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
