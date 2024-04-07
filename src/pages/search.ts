import { PropertyValueMap, TemplateResult, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { BaseElement, renderError } from "../app.js";
import { Api } from "../common/api.js";
import { Channel, Playlist, Video } from "../common/data.js";
import { i18n } from "../utils/i18n.js";
import { arrowLeftIcon, searchIcon } from "../utils/icons.js";
import { router } from "../utils/routing.js";
import { pageContainerStyle, pageContentStyle } from "../utils/styles.js";
import { repeat } from "lit-html/directives/repeat.js";
import { Store } from "../utils/store.js";

@customElement("video-element")
export class VideoElement extends BaseElement {
    @property()
    item!: Video;

    @property()
    action?: TemplateResult;

    render() {
        const duration = this.item.duration;
        let time = duration.hours > 0 ? duration.hours.toString().padStart(2, "0") + ":" : "";
        time += duration.minutes.toString().padStart(2, "0") + ":";
        time += duration.seconds.toString().padStart(2, "0");

        return html`<div class="w-full flex flex-col sm:flex-row gap-1 sm:gap-4">
            <div class="relative">
                <a href="/video/${this.item.id}"><img src="${this.item.thumbnail.url}" class="sm:max-w-[240px] aspect-[480/360] rounded-md" /></a>
                <span class="p-1 rounded absolute right-1 bottom-1 bg-[#000] text-[#ccc]">${time}</span>
            </div>
            <div class="flex flex-col flex-grow gap-2">
                <span class="line-clamp-2 font-semibold">${this.item.title}</span>
                <span class="line-clamp-2">${this.item.description}</span>
                ${this.action ? this.action : nothing}
            </div>
        </div>`;
    }
}

@customElement("playlist-element")
export class PlaylistElement extends BaseElement {
    @property()
    item!: Playlist;

    @property()
    action?: TemplateResult;

    render() {
        return html`<div class="w-full flex flex-col sm:flex-row gap-1 sm:gap-4">
            <div class="relative">
                <a href="/playlist/${this.item.id}"><img src="${this.item.thumbnail.url}" class="sm:max-w-[240px] aspect-[480/360] rounded-md" /></a>
                <span class="p-1 rounded absolute right-1 bottom-1 bg-[#000] text-[#ccc]">${this.item.videos.length} Videos</span>
            </div>
            <div class="flex flex-col flex-grow gap-2">
                <span class="line-clamp-2 font-semibold">${this.item.title}</span>
                <span class="line-clamp-2">${this.item.description}</span>
                ${this.action ? this.action : nothing}
            </div>
        </div>`;
    }
}

function renderItem(item: Video | Playlist | Channel) {
    const saved = Store.getSaved();
    const action = saved.some((other) => other.id == item.id) ? i18n("remove") : i18n("add");

    const add = (ev: Event) => {
        let saved = Store.getSaved();
        const button = ev.target as HTMLButtonElement;
        if (button.innerText == i18n("add")) {
            if (item.type == "video") {
                saved.push(item);
            } else if (item.type == "playlist") {
                saved.push(...item.videos);
            }
            button.innerText = i18n("remove");
        } else {
            if (item.type == "video") {
                saved = saved.filter((other) => other.id != item.id);
            } else if (item.type == "playlist") {
                const lookup = new Set<string>(item.videos.map((item) => item.id));
                saved = saved.filter((other) => !lookup.has(other.id));
            }
            button.innerText = i18n("add");
        }
        Store.setSaved(saved);
    };
    const actionButton = html`<button class="button" @click=${(ev: Event) => add(ev)}>${action}</button>`;

    if (item.type == "video") {
        return html`<video-element class="w-full" .item=${item} .action=${actionButton}></video-element>`;
    } else if (item.type == "playlist") {
        return html`<playlist-element class="w-full" .item=${item} .action=${actionButton}></playlist-element>`;
    }
}

@customElement("search-page")
export class SearchPage extends BaseElement {
    @state()
    searching = false;

    @state()
    searchResult: (Video | Channel | Playlist)[] = [];

    @state()
    error?: string;

    @query("#search")
    searchElement!: HTMLInputElement;

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
        this.search();
    }

    render() {
        return html`<div class="${pageContainerStyle}">
            <div class="${pageContentStyle} items-center p-4 gap-4">
                <button class="absolute left-4 text-primary" @click=${() => router.replace("/setup")}>
                    <i class="icon w-8 h-8">${arrowLeftIcon}</i>
                </button>
                <h1 class="text-3xl">WuzTube</h1>
                <div class="text-xl text-center font-semibold">${i18n("search-text")}</div>
                <div class="w-full max-w-[480px] flex rounded-full px-4 py-2 border border-divider">
                    <input
                        id="search"
                        class="flex-grow outline-none"
                        placeholder="${i18n("search")}"
                        @keydown=${(ev: KeyboardEvent) => this.handleKeyDown(ev)}
                        value="der kleine maulwurf"
                    />
                    <button class="icon w-6 h-6" @click=${() => this.search()}>${searchIcon}</button>
                </div>
                ${this.searching ? html`<loading-spinner></loading-spinner>` : nothing} ${this.error ? renderError(this.error) : nothing}
                ${this.searchResult.length > 0 ? repeat(this.searchResult, renderItem) : nothing}
            </div>
        </div>`;
    }

    handleKeyDown(ev: KeyboardEvent) {
        if (ev.key === "Enter" && !ev.shiftKey) {
            ev.preventDefault();
            ev.stopPropagation();
            this.search();
        }
    }

    async search() {
        if (this.searching) return;
        try {
            this.error = undefined;
            this.searchResult = [];
            this.searching = true;
            const query = this.searchElement.value.trim();
            const response = await Api.search(query);
            if (response instanceof Error) throw response;
            this.searchResult = response;
        } catch {
            this.error = i18n("search-error");
        } finally {
            this.searching = false;
        }
    }
}
