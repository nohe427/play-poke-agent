# TODO:
- Cleanup code. I wrote most of this in a rush while I should have been doing other things like chores, etc...
- Read out inventory into game state from ROM ram
- Give the AI more actionable goals based on location + game status
  - How many badges does the player have?
- Make multiple handoffs for combat encounters
  - AI tries to run from trainer battles which it cannot do!
  - AI needs to attempt to capture injured Pokemon with pokeballs
- Give the AI smarter intelligence when it runs into a pokemart or a pokestore
  - Right now the AI has trouble figuring out how to exit a pokecenter or pokemart
- Give the AI a way to assess goals based on ROM state
- Give the AI a better sink map
  - The AI will occassionally get stuck pacing on screen for no reason. Make it
    see that there are other places to step based on frequence of step location.
- Read out the pokemon level, experience, and attack / moves (with amount of
  attack) power from ROM state.
- Give more button presses other than left, right, up, and down. Sometimes the
  AI isn't aware it can interact with signs, etc...
