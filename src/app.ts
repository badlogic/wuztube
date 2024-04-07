import { LitElement, PropertyValueMap, html } from "lit";
import { customElement } from "lit/decorators.js";
import { i18n } from "./utils/i18n.js";
import { setupLiveReload } from "./utils/live-reload.js";
import { renderError } from "./utils/ui-components.js";
import { router } from "./utils/routing.js";
import { Store } from "./utils/store.js";
export * from "./pages/index.js";
export * from "./utils/ui-components.js";

setupLiveReload();

@customElement("app-main")
export class App extends LitElement {
    constructor() {
        super();
    }

    protected createRenderRoot(): Element | ShadowRoot {
        return this;
    }

    protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
        super.firstUpdated(_changedProperties);
        router.addRoute(
            "/",
            () => html`<main-page></main-page>`,
            () => "app"
        );
        router.addRoute(
            "/404",
            () => renderError(i18n("Whoops, that page doesn't exist")),
            () => "404"
        );
        router.addRoute(
            "/setup",
            () => html`<setup-page></setup-page>`,
            () => "Setup"
        );
        router.addRoute(
            "/search",
            () => html`<search-page></search-page>`,
            () => "Search"
        );
        router.addRoute(
            "/video/:id",
            () => html`<video-page></video-page>`,
            () => "Search"
        );
        router.addRoute(
            "/playlist/:id",
            () => html`<playlist-page></playlist-page>`,
            () => "Search"
        );

        router.setRootRoute("/");
        router.setNotFoundRoot("/404");

        /*if (Store.getIsFirstTime()) {
            router.replace("/setup");
        } else {
            router.replace(location.pathname);
        }*/
        router.replace(location.pathname);
    }
}
