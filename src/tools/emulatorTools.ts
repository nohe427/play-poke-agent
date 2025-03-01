import { z } from "genkit/beta";
import { ai, PokeState } from "../config";
import axios from "axios";

export let state = {
    "currentGoal": "Leave pallet town and get a starter pokemon",
    "name": "red",
    "rival": "blue",
    "history": "",
    "lastTakenAction": "",
}

export const updateState = ai.defineTool({
    name: "updateState",
    description: `
        Updates the game state to reflect the new goals in the game given the
        screenshots and recent button presses.
    `,
    inputSchema: z.object({
        "currentGoal": z.string(),
        "name": z.string(),
        "rival": z.string(),
        "history": z.string(),
        "lastTakenAction": z.string(),
    }),
    outputSchema: z.string(),
}, async (input) => {
    state = input;
    return JSON.stringify(state);
});

export const sendKeyPress = ai.defineTool({
    name: "sendKeyPress",
    description: `
        This sends a key press to the gameboy emulator. The options for key
        presses are:
            ['a', 'b', 'up', 'down', 'left', 'right', 'select', 'start']
        Only send one key press at a time.`,
        inputSchema: z.object({
            "buttonPresse": z.string(),
        }),
        outputSchema: z.string(),
}, async (keyPresses): Promise<string> => {
    state.lastTakenAction = keyPresses.buttonPresse.toLowerCase().trim();
     switch(keyPresses.buttonPresse.toLowerCase().trim()) {
        case 'a':
            await axios.get("http://localhost:8000/a");
            break;
        case 'b':
            await axios.get("http://localhost:8000/b");
            break;
        case 'up':
            await axios.get("http://localhost:8000/up");
            break;
        case 'down':
            await axios.get("http://localhost:8000/down");
            break;
        case 'left':
            await axios.get("http://localhost:8000/left");
            break;
        case 'right':
            await axios.get("http://localhost:8000/right");
            break;
        case 'select':
            await axios.get("http://localhost:8000/select");
            break;
        case 'start':
            await axios.get("http://localhost:8000/start");
            break;
        default:
            console.log('could not find keypress');
            break;
     }
   return 'done';
});