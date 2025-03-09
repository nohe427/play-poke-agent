import { z } from "genkit";
import { ai } from "../config";

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