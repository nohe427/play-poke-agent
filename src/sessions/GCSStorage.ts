import { SessionData, SessionStore } from "genkit/beta";
import { projectId } from "../config";
import {Storage} from "@google-cloud/storage";

const storage  = new Storage({projectId: projectId})
const bucket = 'my-chat-bucket';

export class GcsSessionStorage<S = any> implements SessionStore<S> {
    async get(sessionId: string): Promise<SessionData<S> | undefined> {
      try {
        const file = await storage.bucket(bucket).file(`chats/${sessionId}`).download();
        return JSON.parse(file[0].toString("utf-8"));
      } catch (error) {
        console.error(error);
        return undefined;
      }
    }
  
    async save(sessionId: string, data: Omit<SessionData<S>, 'id'>): Promise<void> {
      try {
        await storage.bucket(bucket).file(`chats/${sessionId}`).save(JSON.stringify(data));
        console.log('file written to GCS');
      }
      catch (error) {
        console.error(error);
      }
    }
  }
  // end session management