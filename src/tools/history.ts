import { Part } from "genkit";

export class GameHistory {
    history: Part[] = [];
    constructor() {}

    insertHistoryItems(part: Part) {
        if(part.text) {
            part.text = `Timestamp: ${Date.now()}\n${part.text}`
        }
        if (this.history.length > 399) {
            this.history.shift();
        }
        this.history.push(part);
    }
 
    getHistory() {
        return this.history;
    }
    
}