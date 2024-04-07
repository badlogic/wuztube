import { html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { BaseElement } from "../app.js";
import { pageContainerStyle, pageContentStyle } from "../utils/styles.js";
import { i18n } from "../utils/i18n.js";
import { Store } from "../utils/store.js";
import { arrowLeftIcon } from "../utils/icons.js";
import { router } from "../utils/routing.js";
import { Channel, Playlist, Video } from "../common/data.js";
import { repeat } from "lit-html/directives/repeat.js";

@customElement("setup-page")
export class SetupPage extends BaseElement {
    @state()
    saved = Store.getSaved();

    connectedCallback(): void {
        super.connectedCallback();
        this.saved = [...Store.getSaved()];
    }

    render() {
        const saved = this.saved;

        return html`<div class="${pageContainerStyle}">
            <div class="${pageContentStyle} items-center p-4 gap-4">
                <button class="absolute left-4 text-primary" @click=${() => router.replace("/")}><i class="icon w-8 h-8">${arrowLeftIcon}</i></button>
                <h1 class="text-3xl">WuzTube</h1>
                <div class="flex flex-col items-center gap-4">${i18n("setup-text")}</div>
                <a href="/search" class="button my-4">${i18n("add-video")}</a>
                ${saved.length == 0
                    ? html`<div class="flex-grow flex text-xs color-muted text-center justify-center items-center">${i18n("no-saved")}</div>`
                    : repeat([...saved].reverse(), (item) => html`<div class="flex flex-col w-full">${this.renderItem(item)}</div>`)}
            </div>
        </div>`;
    }

    renderItem(item: Video | Playlist | Channel) {
        const add = (ev: Event) => {
            let saved = Store.getSaved();
            saved = saved.filter((other) => other.id != item.id);
            Store.setSaved(saved);
            this.saved = [...saved];
        };
        const actionButton = html`<button class="button" @click=${(ev: Event) => add(ev)}>${i18n("remove")}</button>`;

        if (item.type == "video") {
            return html`<video-element class="w-full" .item=${item} .action=${actionButton}></video-element>`;
        } else if (item.type == "playlist") {
            return html`<playlist-element class="w-full" .item=${item} .action=${actionButton}></playlist-element>`;
        }
    }

    removeItem(item: Video | Channel | Playlist) {}
}
