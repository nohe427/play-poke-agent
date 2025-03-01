import axios from "axios";
import { mainFlow } from "./flows/mainFlow";
import { ai } from "./config";

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

let fetching = false;
let promise: Promise<string> | undefined;

async function main() {
    while(true) {
        if(promise !== undefined) {
            promise.then((result) => {
                console.log(result);
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                fetching = false;
            });
        }
        if(fetching === false) {
            console.log('starting to fetch');
            fetching = true;
            // sleep(500).then(() => {
                console.log("RUNNING FETCHING")
                let result = "";
                try {
                    result = await mainFlow({imgUrl: 'http://127.0.0.1:8000/frame'});
                } catch (err) {
                    console.log(err);
                }
                console.log(result);
                await sleep(3000);
                fetching = false;
            // });
        }
    }
}

console.log("Hello world");

main();
