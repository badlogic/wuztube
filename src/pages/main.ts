import { PropertyValueMap, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { BaseElement } from "../app.js";
import { searchIcon, settingsIcon } from "../utils/icons.js";
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
    videos: Video[] = [];

    @state()
    filteredVideos: Video[] = [];

    @query("#filter")
    filter!: HTMLInputElement;

    enteredSetup = true;

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
    }

    connectedCallback(): void {
        super.connectedCallback();
        if (this.enteredSetup) {
            this.updateData();
            this.enteredSetup = false;
        }
    }

    updateData() {
        this.videos = [];
        const saved = Store.getSaved();
        for (const item of saved) {
            if (item.type == "video") this.videos.push(item);
            if (item.type == "playlist") this.videos.push(...item.videos);
        }
        shuffleArray(this.videos);
        this.filteredVideos = [...this.videos];

        this.requestUpdate();
    }

    render() {
        return html`<div class="${pageContainerStyle}">
            <div class="${pageContentStyle} items-center p-4 gap-4">
                <button
                    class="absolute left-4 text-primary"
                    @click=${() => {
                        this.enteredSetup = true;
                        router.push("/setup");
                    }}
                >
                    <i class="icon w-8 h-8">${settingsIcon}</i>
                </button>
                <theme-toggle class="absolute right-4"></theme-toggle>
                <h1 class="text-3xl">WuzTube</h1>
                <div class="w-full max-w-[480px] flex rounded-full px-4 py-2 border border-divider">
                    <input
                        id="filter"
                        class="flex-grow outline-none bg-transparent"
                        placeholder="${i18n("filter")}"
                        @keydown=${(ev: KeyboardEvent) => this.handleKeyDown(ev)}
                        @input=${(ev: KeyboardEvent) => this.handleInput(ev)}
                    />
                    <button class="icon w-6 h-6" @click=${() => this.search()}>${searchIcon}</button>
                </div>
                ${this.filteredVideos.length == 0
                    ? html`<div class="flex-grow flex text-xs color-muted text-center justify-center items-center">${i18n("no-saved")}</div>`
                    : html`<div class="flex flex-wrap justify-center gap-2">${repeat(this.filteredVideos, (item) => this.renderItem(item))}</div>`}
            </div>
        </div>`;
    }

    handleKeyDown(ev: Event) {
        this.search();
    }

    handleInput(ev: Event) {
        this.search();
    }

    search() {
        const filter = this.filter.value.trim();
        if (filter.length === 0) {
            this.filteredVideos = [...this.videos];
        } else {
            const tokens = filter.split(/\s+/);
            this.filteredVideos = this.videos.filter((video) =>
                tokens.every(
                    (token) =>
                        video.title.toLowerCase().includes(token.toLowerCase()) || video.description.toLowerCase().includes(token.toLowerCase())
                )
            );
        }
    }

    renderItem(item: Video) {
        const duration = item.duration;
        let time = duration.hours > 0 ? duration.hours.toString().padStart(2, "0") + ":" : "";
        time += duration.minutes.toString().padStart(2, "0") + ":";
        time += duration.seconds.toString().padStart(2, "0");
        return html`<div class="relative">
            <a href="/video/${item.id}"><img src="${item.thumbnail.url}" class="sm:max-w-[240px] aspect-[480/360] rounded-md" /></a>
            <span class="p-1 rounded absolute right-1 bottom-1 bg-[#000] text-[#ccc]">${time}</span>
        </div>`;
    }
}
