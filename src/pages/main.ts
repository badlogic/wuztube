import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { BaseElement } from "../app.js";
import { settingsIcon } from "../utils/icons.js";
import { router } from "../utils/routing.js";
import { pageContainerStyle, pageContentStyle } from "../utils/styles.js";
import { Store } from "../utils/store.js";
import { i18n } from "../utils/i18n.js";
import { Channel, Playlist, Video } from "../common/data.js";
import { repeat } from "lit-html/directives/repeat.js";

function shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // swap elements
    }
    return array;
}

@customElement("main-page")
export class MainPage extends BaseElement {
    @state()
    saved = shuffleArray([...Store.getSaved()]);

    connectedCallback(): void {
        super.connectedCallback();
        this.saved = shuffleArray([...Store.getSaved()]);
    }

    render() {
        return html`<div class="${pageContainerStyle}">
            <div class="${pageContentStyle} items-center p-4">
                <button class="absolute left-4 text-primary" @click=${() => router.replace("/setup")}>
                    <i class="icon w-8 h-8">${settingsIcon}</i>
                </button>
                <h1 class="text-3xl">WuzTube</h1>
                ${this.saved.length == 0
                    ? html`<div class="flex-grow flex text-xs color-muted text-center justify-center items-center">${i18n("no-saved")}</div>`
                    : html`<div class="flex flex-wrap justify-center gap-2">${repeat(this.saved, (item) => this.renderItem(item))}</div>`}
            </div>
        </div>`;
    }

    renderItem(item: Video | Playlist | Channel) {
        if (item.type == "video") {
            const duration = item.duration;
            let time = duration.hours > 0 ? duration.hours.toString().padStart(2, "0") + ":" : "";
            time += duration.minutes.toString().padStart(2, "0") + ":";
            time += duration.seconds.toString().padStart(2, "0");
            return html`<div class="relative">
                <a href="/video/${item.id}"><img src="${item.thumbnail.url}" class="sm:max-w-[240px] aspect-[480/360] rounded-md" /></a>
                <span class="p-1 rounded absolute right-1 bottom-1 bg-[#000] text-[#ccc]">${time}</span>
            </div>`;
        }
        return html``;
    }
}
