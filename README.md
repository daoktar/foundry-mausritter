# Mausritter RPG for Foundry VTT
#### This is an unofficial version of the Mausritter RPG system, which is the property of Isaac Williams & Losing Games.
Mausritter can be purchased here: https://mausritter.com/
```
- The official game Weapon, Item, and Spell Icons by Isaac Williams are licensed under CC-BY.
- The sample Rat portrait from the official book was allowed to be used with permission from Isaac Williams
```
# Installation

## Requirements
- Foundry VTT **v14** (this branch's `system.json` declares `minimum: 14`). Self-hosted servers need Node 24 for Foundry v14.
- For older Foundry versions use the upstream legacy branch: [DiegoF824/foundry-mausritter `v10`](https://github.com/DiegoF824/foundry-mausritter/tree/v10).

## Install via manifest URL (recommended)
1. Open Foundry and go to **Game Systems** (Setup screen).
2. Click **Install System**.
3. Paste this URL into the **Manifest URL** field at the bottom:
   ```
   https://raw.githubusercontent.com/daoktar/foundry-mausritter/v14+dark/system.json
   ```
4. Click **Install**.
5. Create a world: **Game Worlds → Create World → Game System: Mausritter**.

Updates are delivered through the same manifest: **Game Systems → Mausritter → Update**.

## Branches
| Branch | Foundry | Notes |
|--------|---------|-------|
| `v14+dark` | v14 | Recommended. ApplicationV2 sheets, dark theme support, per-sheet light/dark override |
| `v14` | v14 | Same content as `v14+dark`, kept as a separate install channel |
| `v10` | v10-v12 | Legacy, pre-ApplicationV2 |

## Manual install
1. Download the zip: `https://github.com/daoktar/foundry-mausritter/archive/refs/heads/v14+dark.zip`
2. Extract it into your Foundry userdata folder as `Data/systems/mausritter` (the folder must contain `system.json` at its root — remove the `foundry-mausritter-v14-dark` wrapper folder from the archive).
3. Restart Foundry. Manual installs do not auto-update — repeat these steps to update, or reinstall via the manifest URL above.

## Theme
Sheets follow the Foundry application theme (light/dark). A per-sheet override is available via **Sheet Configuration → Theme** on any actor or item sheet.

## Troubleshooting
- **System not listed after manual install** — `system.json` is not at `Data/systems/mausritter/system.json`; check the folder nesting.
- **Installed from the old upstream manifest** — updates then come from `DiegoF824/foundry-mausritter`; reinstall using the manifest URL above to switch to this fork.

# Features:
## Styled character sheets
Character, Creature, and NPC sheets were built to resemble the standard print sheets.


## Draggable & Transferrable Item Cards
Inventory is handled through item cards, which can be moved around freely, moved between sheets, or copied with CTRL+Drag.

Cards are styled to resemble the official game cards, with automated rolls, usage dots, and more being included.

For usage, left click the dots to increase, and right click to decrease. You can also swap medium weapon damage between one handed and two by clicking the damage value.

## Item Compendiums
Every Item, Weapon, Condition, and Spell from the game has been included inside of the system's compendiums.

## Storage Sheets with Adjustable Dimensions
Have a cart, chest, bank, etc that players want to store items in? Or maybe you have a treasure horde that you want to allow players to peruse through. You can create 'Storage' actors with adjustable slot counts.

## Automated Skill Rolls
You can roll your stats using the built in advantage/disadvantage system

## Macro Support for Weapons, Items, and Skills
For items, you can simply drag them into the hotbar, or use this script:

```
game.mausritter.rollItemMacro("itemName");
```
For Skills, create a new macro with this
```
game.mausritter.rollStatMacro();
```

# Screenshots
![Alt text](https://i.imgur.com/4PYBj8X.jpg "Game Example")

_Mausritter ©2020 Isaac Williams & Losing Games_

# Legal note
Images used:
- [Icons - Flaticon](https://www.flaticon.com)