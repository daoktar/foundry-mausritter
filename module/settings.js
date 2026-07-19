// Optional AI-generated creature art. Owl, Spider, Faerie and Ghost have no
// illustration in the Mausritter books, so their portraits/tokens are AI-made.
// Map each AI image to the fallback icon used when the setting is turned off.
export const AI_CREATURE_ART = {
  "systems/mausritter/images/creatures/owl.png": "icons/svg/mystery-man.svg",
  "systems/mausritter/images/creatures/spider.png": "icons/svg/mystery-man.svg",
  "systems/mausritter/images/creatures/faerie.png": "icons/svg/mystery-man.svg",
  "systems/mausritter/images/creatures/ghost.png": "icons/svg/mystery-man.svg"
};

export const registerSettings = function () {
  game.settings.register("mausritter", "aiCreatureArt", {
    name: "Maus.SettingAIArtName",
    hint: "Maus.SettingAIArtHint",
    scope: "world",
    config: true,
    type: Boolean,
    default: true
  });
};
