import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { BaseElement } from "../app.js";
import { arrowLeftIcon } from "../utils/icons.js";
import { router } from "../utils/routing.js";
import { pageContainerStyle, pageContentStyle } from "../utils/styles.js";

@customElement("video-page")
export class VideoPage extends BaseElement {
    videoId: string;
    controls: boolean;

    constructor() {
        super();
        this.videoId = router.getCurrentParams()?.get("id") ?? "";
        const queryParams = new URLSearchParams(window.location.search);
        this.controls = queryParams.has("controls");
    }

    render() {
        return html`<div class="${pageContainerStyle}">
            <div class="${pageContentStyle} h-full w-full items-center">
                <button
                    class="flex items-center justify-center absolute rounded-full left-2 top-2 text-primary bg-[#000] w-12 h-12"
                    @click=${() => router.pop()}
                >
                    <i class="icon w-8 h-8">${arrowLeftIcon}</i>
                </button>
                <iframe
                    class="flex-grow w-full"
                    src="https://www.youtube.com/embed/${this.videoId}?mute=0&autoplay=1&controls=${this.controls ? "1" : "0"}"
                    frameborder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                ></iframe>
            </div>
        </div>`;
    }
}
