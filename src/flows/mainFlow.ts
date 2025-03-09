import { z } from "genkit";
import { ai, PokeState } from "../config";
import { gemini, gemini20ProExp0205, gemini20Flash001 } from '@genkit-ai/vertexai';
import {gemini20ProExp0205 as AIgemini20ProExp0205} from '@genkit-ai/googleai';
import { sendKeyPress } from "../tools/emulatorTools";
import { state, updateCurrentGoal } from "../tools/goals"
import axios from "axios";
import { GameHistory } from "../tools/history";
import { getKnowledgeBaseAsString, updateKnowledgeBase } from "../tools/knowledge";

let previousState = "";
let currentState = "";

const gameHistory = new GameHistory();

const getCurrentEmulatorState = async (): Promise<string> => {
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
    currentState = await getCurrentEmulatorState();
    let imgPart = {media: {url: input.imgUrl}}
    try{
        const img = await axios.get(input.imgUrl, { responseType: 'arraybuffer' });
        const base64String = Buffer.from(img.data, 'binary').toString('base64');
        const dataUrl = `data:image/jpeg;base64,${base64String}`;
        imgPart = {media: {url: dataUrl}}
    } catch (err) {
        console.log('could not load img part', err);
    }
    // gameHistory.insertHistoryItems({
    //     text: `
    //     Current game state: ${JSON.stringify(state)}
        
    //     ${currentState}

    //     Previous Game State:
    //     ${previousState}`
    // })
    // gameHistory.insertHistoryItems(imgPart);
    // console.log('sending request');
    const logic = await ai.generate({
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

        Rugs on floor indicate you can exit a building at that location.

        In a dialog the right pointing arrow indicates what you currently have selected.

        To run when you are in battle, you must navigate to the RUN option and select it with the 'a' key

        You should try to battle as long as you have 50% of your health so you can level your pokemon up

        If pressing right does not change the menu how you expect it to, then try pressing down instead.

        If pressing down doesn't help, try pressing 'b'

        If you think the game is stuck, send the 'a' button

        To advance dialog you use the 'a' button.

        Try to catch pokemon you do not yet have if you have pokeballs in your inventory
        `,
        // model: gemini20ProExp0205,
        model: gemini20ProExp0205,
        returnToolRequests: true,
        tools: [],
        prompt: [
            ...gameHistory.getHistory(),
            {text:`
                Given image ${Math.round((gameHistory.getHistory().length)/2)} based on the timestamp provided. What is the next key you would
                like to press to advance the game? Explain your reasoning in your response.

                You can only pick one key at a time to press.

                If your game coords did not change between current state and previous state do not
                perform the same action.

                Provide a reason for your button press.

                Characters Current Game State:
                ${currentState}

                Characters Previous Game State:
                ${previousState}

                Characters Goals:
                ${state}

                Knowledge Base:
                ${getKnowledgeBaseAsString()}
                `
            },
            imgPart,
            ],
    });

    gameHistory.insertHistoryItems({text: logic.text})
    gameHistory.insertHistoryItems(imgPart);

    console.log(logic.text);

    const result = await ai.generate({
        system: `
        Your goal is to pick the correct tool call for the logic argument provided
        in the prompt.
        `,
        // model: gemini20ProExp0205,
        model: gemini20Flash001,
        returnToolRequests: true,
        tools: [sendKeyPress],
        prompt: [
            {text:`pick the button press from this reasoning: ${logic.text}`},
        ]
    });
    const tr = result.toolRequests;
    // console.log(result.text);
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
        // if (toolRequest.toolRequest.name === "updateState" && input) {
        //     await updateState(input as PokeState);
        // }
    }

    const goalRevision = await ai.generate({
        system: `
        Update the system goal based on the current game history and screenshots.
        Update the knowledge base if that needs to be updated.
        If no goal needs to be updated, do not update the goal. 

        Provide a reasoning in your response.
        `,
        model: gemini20Flash001,
        returnToolRequests: true,
        tools: [updateCurrentGoal, updateKnowledgeBase],
        prompt: [
            ...gameHistory.getHistory(),
            {text: `current goal : ${state.currentGoal}`},
            {text: `knowledge base : ${getKnowledgeBaseAsString()}`}
        ]
    });
    const gtr = goalRevision.toolRequests;
    console.log(goalRevision.text);
    if (!gtr) {
        return goalRevision.text;
    }
    for(var i = 0; i < gtr.length; i++) {
        const toolRequest = gtr[i];
        const input = toolRequest.toolRequest.input;
        console.log(toolRequest.toolRequest.name, input)
        if (toolRequest.toolRequest.name === "updateCurrentGoal" && input) {
            await updateCurrentGoal(input as {currentGoal: string});
        }
        if (toolRequest.toolRequest.name === "updateKnowledgeBase" && input) {
            await updateKnowledgeBase(input as {topic: string, content: string});
        }
    }

    return result.text;
})