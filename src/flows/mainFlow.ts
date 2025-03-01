import { z } from "genkit";
import { ai, GcsSessionStorage, PokeState } from "../config";
import { gemini, gemini20ProExp0205, gemini20Flash001 } from '@genkit-ai/vertexai';
import { sendKeyPress, updateState, state } from "../tools/emulatorTools";
import axios from "axios";
import { GameHistory } from "../tools/history";

let previousState = "";
let currentState = "fresh game";

const gameHistory = new GameHistory();

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
    let imgPart = {media: {url: input.imgUrl}}
    try{
        const img = await axios.get(input.imgUrl, { responseType: 'arraybuffer' });
        const base64String = Buffer.from(img.data, 'binary').toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64String}`;
        imgPart = {media: {url: dataUrl}}
    } catch (err) {
        console.log('could not load img part', err);
    }
    gameHistory.insertHistoryItems({
        text: `
        Current game state: ${JSON.stringify(state)}
        
        ${currentState}

        Previous Game State:
        ${previousState}`
    })
    gameHistory.insertHistoryItems(imgPart);
    console.log('sending request');
    const result = await ai.generate({
        system: `
        You are playing Pokemon Red on the Gameboy. Your goal is to beat the
        Pokemon game by training your pokemon up, capturing as many as you can,
        and beating all gym leaders. You are starting from a fresh game install.
        You must update the state as your play the game so you are aware of the
        current objectives.

        If your GameCoords position doesn't change, you are likely going in the
        wrong direction or hitting a wall. Attempt to go a different direction.

        If there is text on the screen, you are in a dialog.

        The current game state will contain the key presses available for you based on the world exploration.
        
        Look at the "Available Key Presses:" for a list of available keys to press when in exploration mode.

        Stairwells and ladders let you move between floors.

        In a dialog the right pointing arrow indicates what you currently have selected.

        To run when you are in battle, you must navigate to the RUN option and select it with the 'a' key
        `,
        model: gemini20ProExp0205,
        returnToolRequests: true,
        tools: [sendKeyPress, updateState],
        prompt: [
            ...gameHistory.getHistory(),
            {text:`
                Given the latest image based on the timestamp provided. What is the next key you would
                like to press to advance the game? Explain your reasoning in your response.

                You can only pick one key at a time to press.

                If your game coords did not change between current state and previous state do not
                perform the same action.
                `
            },
            ],
    });
    const tr = result.toolRequests;
    if (!tr) {
        return result.text;
    }
    for(var i = 0; i < tr.length; i++) {
        const toolRequest = tr[i];
        const input = toolRequest.toolRequest.input;
        console.log(toolRequest.toolRequest.name, input)
        if (toolRequest.toolRequest.name === "sendKeyPress" && input) {
            await sendKeyPress(input as {buttonPresse: string});
        }
        if (toolRequest.toolRequest.name === "updateState" && input) {
            await updateState(input as PokeState);
        }
    }
    return result.text;
})