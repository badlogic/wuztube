import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseElement } from "../app.js";
import { arrowLeftIcon } from "../utils/icons.js";
import { router } from "../utils/routing.js";
import { pageContainerStyle, pageContentStyle } from "../utils/styles.js";

@customElement("video-page")
export class VideoPage extends BaseElement {
    videoId: string;

    constructor() {
        super();
        this.videoId = router.getCurrentParams()?.get("id") ?? "";
    }

    render() {
        return html`<div class="${pageContainerStyle}">
            <div class="${pageContentStyle} h-full w-full items-center">
                <button class="absolute rounded left-0 text-primary bg-[#000]" @click=${() => router.pop()}>
                    <i class="icon w-8 h-8">${arrowLeftIcon}</i>
                </button>
                <iframe
                    class="flex-grow w-full"
                    src="https://www.youtube.com/embed/${this.videoId}?mute=0&autoplay=1&controls=0"
                    frameborder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
            </div>
        </div>`;
    }
}
