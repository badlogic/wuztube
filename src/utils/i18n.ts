import { TemplateResult, html } from "lit";

export interface Messages {
    "Whoops, that page doesn't exist": string;
    "Couldn't load mesage": string;
    "Invalid stream": string;
    "Sorry, an unknown error occured": string;
    "End of list": string;
    "setup-text": TemplateResult;
    "add-video": string;
    "no-saved": string;
    "search-text": string;
    search: string;
    "search-error": string;
    add: string;
    remove: string;
    filter: string;
    "parental-check": string;
}

const english: Messages = {
    "Whoops, that page doesn't exist": "Whoops, that page doesn't exist",
    "Couldn't load mesage": "Couldn't load mesage",
    "Invalid stream": "Invalid stream",
    "Sorry, an unknown error occured": "Sorry, an unknown error occured",
    "End of list": "End of list",
    "setup-text": html`<h1 class="text-xl">Settings</h1>
        <p class="max-w-[640px] text-center">
            With WuzTube, you can set a list of YouTube videos, channels, and playlists from which your child can then independently choose.
        </p> `,
    "add-video": "Add video, channel, or playlist",
    "no-saved": "No videos, channels, or playlists added yet",
    "search-text": "Add videos, channels, and playlists",
    search: "Search",
    "search-error": "Whoops, something went wrong",
    add: "Add",
    remove: "Remove",
    filter: "Filter",
    "parental-check": "Enter the sum of these numbers",
};

const german: Messages = {
    "Whoops, that page doesn't exist": "Whoops, that page doesn't exist",
    "Couldn't load mesage": "Couldn't load mesage",
    "Invalid stream": "Invalid stream",
    "Sorry, an unknown error occured": "Sorry, an unknown error occured",
    "End of list": "End of list",
    "setup-text": html` <h1 class="text-xl">Einstellungen</h1>
        <p class="max-w-[640px] text-center">
            Mit WuzTube kannst du eine Liste von YouTube Videos, Kanälen und Playlists festlegen, aus der dein Kind dann selbständig auswählen kann.
        </p>`,
    "add-video": "Video / Kanal / Playlist hinzufügen",
    "no-saved": "Noch keine Videos, Kanäle oder Playlists hinzugefügt",
    "search-text": "Videos, Kanäle und Playlisten hinzufügen",
    search: "Suchen",
    "search-error": "Ups, da ist etwas schief gelaufen",
    add: "Hinzufügen",
    remove: "Entfernen",
    filter: "Filtern",
    "parental-check": "Gib die Summe beider Zahlen ein",
};

export type LanguageCode = "en" | "de";

const translations: Record<LanguageCode, Messages> = {
    en: english,
    de: german,
};

export function i18n<T extends keyof Messages>(key: T): Messages[T] {
    const userLocale = navigator.language || (navigator as any).userLanguage;
    const languageCode = userLocale ? (userLocale.split("-")[0] as LanguageCode) : "en";
    const implementation = translations[languageCode];
    const message = implementation ? implementation[key] : translations["en"][key];
    if (!message) {
        console.error("Unknown i18n string " + key);
        return key as any as Messages[T];
    }
    return message;
}
