import { PropertyValueMap, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { BaseElement } from "../app.js";
import { pageContainerStyle, pageContentStyle } from "../utils/styles.js";
import { i18n } from "../utils/i18n.js";
import { Store } from "../utils/store.js";
import { arrowLeftIcon } from "../utils/icons.js";
import { router } from "../utils/routing.js";
import { Channel, Playlist, Video } from "../common/data.js";
import { repeat } from "lit-html/directives/repeat.js";

@customElement("parental-page")
export class ParentalPage extends BaseElement {
    a = 0;
    b = 0;

    @query("#number")
    numberElement!: HTMLInputElement;

    connectedCallback(): void {
        super.connectedCallback();
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
        this.numberElement.focus();
    }

    render() {
        this.a = (1 + Math.random() * 10) | 0;
        this.b = (1 + Math.random() * 10) | 0;

        return html`<div class="${pageContainerStyle}">
            <div class="${pageContentStyle} items-center p-4 gap-4">
                <button class="absolute left-4 text-primary" @click=${() => router.pop()}><i class="icon w-8 h-8">${arrowLeftIcon}</i></button>
                <h1 class="text-3xl">WuzTube</h1>
                <div class="flex flex-col items-center gap-4">${i18n("parental-check")}</div>
                <div class="flex items-center font-semibold text-3xl">${this.a} + ${this.b}</div>
                <div class="flex items-center font-semibold text-3xl">=</div>
                <input
                    id="number"
                    class="outline-none bg-transparent border border-divider rounded-full w-24 max-w-24 p-2 text-3xl text-center"
                    focus
                    @input=${() => this.check()}
                />
            </div>
        </div>`;
    }

    check() {
        const value = parseInt(this.numberElement.value.trim());
        if (value == this.a + this.b) {
            router.replace("/setup");
        }
    }
}
