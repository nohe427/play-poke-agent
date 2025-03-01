import { Part } from "genkit";
import fs from 'fs';

export class GameHistory {
    history: Part[] = [];
    constructor(loadHistory: boolean = false) {
        if(loadHistory) {
            this.loadHistory();
        }
    }

    insertHistoryItems(part: Part) {
        if(part.text) {
            part.text = `Timestamp: ${Date.now()}\n${part.text}`
        }
        if (this.history.length > 399) {
            this.history.shift();
        }
        this.history.push(part);
    }
 
    getHistory(): Part[] {
        return this.history;
    }

    exportHistory(): Promise<void> {
        fs.writeFileSync('history.json', JSON.stringify(this.history));
        return Promise.resolve();
    }

    private loadHistory(): Promise<void> {
        const history = fs.readFileSync('history.json', 'utf8');
        this.history = JSON.parse(history);
        return Promise.resolve();
    }

}