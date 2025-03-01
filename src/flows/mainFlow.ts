import { z } from "genkit";
import { ai, GcsSessionStorage, PokeState } from "../config";
import { gemini, gemini20ProExp0205, gemini20Flash001 } from '@genkit-ai/vertexai';
import { sendKeyPress, updateState, state } from "../tools/emulatorTools";
import axios from "axios";

let previousState = "";
let currentState = "fresh game";

const getCurrentState = async (): Promise<string> => {
    const state = await axios.get("http://localhost:8000/state");
    return state.data;
}

export const mainFlow = ai.defineFlow({
    name: "mainFlow",
    inputSchema: z.object({
        "imgUrl": z.string(),
    }),
    outputSchema: z.string(),
}, async (input): Promise<string> => {
    previousState = currentState;
    currentState = await getCurrentState();
    console.log('sending request');
    const result = await ai.generate({
        system: `
        You are playing Pokemon Red on the Gameboy. Your goal is to beat the
        Pokemon game by training your pokemon up, capturing as many as you can,
        and beating all gym leaders. You are starting from a fresh game install.
        You must update the state as your play the game so you are aware of the
        current objectives.

        If your GameCoords position doesn't change, you are likely going in the
        wrong direction.
        
        Press the A key to advanced dialog on the screen. If there is text on the
        screen you are likely still in dialog. Otherwise, you are likely in exploratory
        mode.
        `,
        model: gemini20Flash001,
        tools: [sendKeyPress, updateState],
        prompt: [
            {text:`
                Given the following image. What is the next key combination you would
                like to press to advance the game? Explain your reasoning in your response.
    
                Current game state: ${JSON.stringify(state)}
                ${currentState}

                Previous Game State:
                ${previousState}

                If your game coords did not change between current state and previous state do not
                perform the same action.
                `
            },
            {media: {url: input.imgUrl}}
            ],
    });
    return result.text;
})