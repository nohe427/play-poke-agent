import { z } from 'genkit';
import {ai} from '../config';
import fs from 'fs';

const KnoweledgeSchema = z.array(
    z.object({
        topic: z.string(),
        content: z.string(),
    })
);

const KnoweledgeUpdateRequestSchema = z.object({
    topic: z.string().describe('the topic that needs to be udpated'),
    content: z.string().describe('the content that this topic should cover now.'),
})

let knowledgeBase: z.infer<typeof KnoweledgeSchema> = [];

const writeToKnowledgeBase = () => {
    fs.writeFileSync('knowledgeBase.json', JSON.stringify(knowledgeBase));
}

const loadFromKnowledgeBase = (): typeof KnoweledgeSchema => {
    const knowledgeBaseString = fs.readFileSync('knowledgeBase.json', 'utf8');
    return JSON.parse(knowledgeBaseString);
}

export const updateKnowledgeBase = ai.defineTool({
    name: 'updateKnowledgeBase',
    description: `
    Used to update a running knowledge base of information that is
    relevant to the game. This should include things like Pokemon strengths
    and weaknesses in certain attacks and what notable dialog there exists in
    the gameplay`,
    inputSchema: KnoweledgeUpdateRequestSchema,
    outputSchema: z.string(),
}, async (input): Promise<string> => {
    const el = knowledgeBase.find(x => x.topic === input.topic);
    if (el !== undefined) {
        el.content = input.content;
        writeToKnowledgeBase();
    }
    knowledgeBase.push({topic: input.topic, content: input.content});
    writeToKnowledgeBase();
    return `Wrote ${input.content} about ${input.topic} to knowledge base`;
});
