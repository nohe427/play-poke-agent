import { Part } from "genkit";
import fs from 'fs';

console.log("Sorry about the human intervention :(")

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
        if (this.history.length > 16) {
            this.history.shift();
        }
        this.history.push(part);
        this.exportHistory()
    }
 
    getHistory(): Part[] {
        let cloned =  this.history.map(x => Object.assign({}, x));
        for (let i = 0; i < cloned.length; i++) {
            if(cloned[i].text) {
                cloned[i].text = cloned[i].text + `
                This history state refers to image ${Math.round((i/2) + 1)}
                `;
            }
        }
        return cloned;
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