import vertexAI from '@genkit-ai/vertexai';
import {genkit, SessionData, SessionStore} from 'genkit';
import {Storage} from '@google-cloud/storage';

const projectId = 'old-man-yells-at-cloud';
const storage  = new Storage({projectId: projectId})
const bucket = 'my-chat-bucket';

export interface PokeState {
  name: string;
  rival: string;
  currentGoal: string;
  history: string;
  lastTakenAction: string;
}

export const ai = genkit({
    plugins: [
        vertexAI({
          location: 'us-central1',
          projectId: projectId,
        })
      ],
});

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