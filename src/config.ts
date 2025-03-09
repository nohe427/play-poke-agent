import vertexAI from '@genkit-ai/vertexai';
import {genkit, SessionData, SessionStore} from 'genkit';
import {Storage} from '@google-cloud/storage';
import { googleAI } from '@genkit-ai/googleai';

export const projectId = 'old-man-yells-at-cloud';

export interface PokeState {
  name: string;
  rival: string;
  currentGoal: string;
  history: string;
  lastTakenAction: string;
}

export const ai = genkit({
    plugins: [
        // googleAI({
        //   apiKey: '',
        // }),
        vertexAI({
          location: 'us-central1',
          projectId: projectId,
        })
      ],
});