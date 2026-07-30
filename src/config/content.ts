/**
 * =============================================================================
 *  CONTENU  —  Tout le texte de la surprise est centralisé ici.
 *  Pour personnaliser la carte, il suffit de modifier ce fichier.
 * =============================================================================
 */

/** Fichiers média (placés dans /public/media). */
export const MEDIA = {
  video: "/media/surprise-video.mp4",
  music: "/media/background-music.mp3",
} as const;

/** Nom affiché de la destinataire et signature. */
export const PERSON = {
  name: "Ma Lauvia",
  signature: "Yannicka",
} as const;

/** Écran d'introduction (avant le clic). */
export const INTRO = {
  teaser: "Une surprise t'attend...",
  buttonLabel: "Clique ici ✨",
} as const;

/** Messages de l'écran de chargement, affichés dans l'ordre. */
export const LOADING_MESSAGES = [
  "Préparation de ta surprise...",
  "Encore quelques secondes...",
  "Parce que tu le mérites \u2764\ufe0f",
  "100 %",
] as const;

/** Grand titre révélé (les lettres apparaissent une à une). */
export const TITLE = "Joyeux Anniversaire Ma Lauvia";

/** Message principal, écrit à la machine. */
export const MESSAGE =
  "Dans un monde où beaucoup portent des masques, toi tu restes une personne vraie. " +
  "Les plus belles personnes ne sont pas celles qui brillent le plus aux yeux du monde, " +
  "mais celles qui illuminent discrètement la vie des autres par leur gentillesse, " +
  "leur sincérité et leur grand cœur. Tu fais partie de ces personnes rares qui rendent " +
  "le monde un peu plus beau simplement par leur présence. Ne laisse jamais personne " +
  "changer cette belle personne que tu es. Joyeux anniversaire, Ma Lauvia. " +
  "Je t'aime fort. \u2764\ufe0f Yannicka";

/** Le bouton piège — strictement impossible à cliquer (aucun message). */
export const PRANK = {
  label: "Clique ici pour recevoir ton dépôt de 10 000 FCFA de la part de Yannicka",
} as const;

/** Section finale. */
export const FINALE = {
  thanks: "Merci d'exister pour nous",
  wish:
    "Je te souhaite une année remplie de bonheur, de santé, de réussite, d'amour " +
    "et de magnifiques souvenirs. Tu mérites tout ce qu'il y a de plus beau.",
  replay: "Revoir la surprise",
} as const;
