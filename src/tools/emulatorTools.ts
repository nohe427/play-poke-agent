import { z } from "genkit/beta";
import { ai, PokeState } from "../config";
import axios from "axios";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

export let state = {
    "currentGoal": `
        First - Get to Viridian City.
        Next - Train to fight brock in the area near Pewter City
        Next - This means you will likely need to purchase some pokeballs at a pokemart.
        Next - Once you have four pokemon captured, you are ready to battle Brock
        
        Pewter City is North of Pallette town. Try to head North on Route 1 if your
        Pokemon are low on health. once you make it to a pokecenter and heal, head back into
        the grassy area to train`,
    "name": "red",
    "rival": "blue",
    "history": "",
    "lastTakenAction": "",
}

export const updateCurrentGoal = ai.defineTool({
    name: "updateCurrentGoal",
    description: `
        Update the current goal to match what your character needs to accomplish
    `,
    inputSchema: z.object({
        "currentGoal": z.string(),
    }),
    outputSchema: z.string(),
}, async (input) => {
    state.currentGoal = input.currentGoal;
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
        outputSchema: z.object({"dataUrl": z.string().describe('a base64 encoded image from the game')}),
}, async (keyPresses) => {
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
     await sleep(500);
     const img = await axios.get("http://localhost:8000/frame", { responseType: 'arraybuffer' });
     const base64String = Buffer.from(img.data, 'binary').toString('base64');
     const dataUrl = `data:image/jpeg;base64,${base64String}`;
     return {dataUrl};
});