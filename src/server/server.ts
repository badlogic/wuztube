import bodyParser from "body-parser";
import * as chokidar from "chokidar";
import compression from "compression";
import cors from "cors";
import express from "express";
import * as fs from "fs";
import * as http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Channel, Playlist, Video, convertYoutubeData, parseISODuration } from "../common/data";

const port = process.env.PORT ?? 3333;
const youtubeKey = process.env.YOUTUBE_KEY;
if (!youtubeKey) {
    console.error("Set YOUTUBE_KEY environment value");
    process.exit(-1);
}

let videoCache: Record<string, Video> = {};
let playlistCache: Record<string, Playlist> = {};
let channelCache: Record<string, Channel> = {};
let queryCache: Record<string, any> = {};

async function fetchVideoDetails(videosToFetch: Video[], youtubeKey: string) {
    if (videosToFetch.length > 0) {
        const params = new URLSearchParams();
        params.set("id", videosToFetch.map((item) => item.id).join(","));
        params.set("part", "contentDetails");
        params.append("maxResults", "50");
        params.append("key", youtubeKey);
        const response = await fetch("https://www.googleapis.com/youtube/v3/videos?" + params.toString());
        if (!response.ok) throw new Error(await response.text());
        const contentDetails = await response.json();
        for (let i = 0; i < videosToFetch.length; i++) {
            const video = videosToFetch[i];
            const details = contentDetails.items[i]?.contentDetails;
            if (!details) {
                console.error("WTF");
            }
            video.duration = parseISODuration(details.duration);
            videoCache[video.id] = video;
        }
        fs.writeFileSync("/data/videocache.json", JSON.stringify(videoCache, null, 2), "utf-8");
    }
}

async function fetchPlaylistDetails(playlistsToFetch: Playlist[], youtubeKey: string) {
    if (playlistsToFetch.length > 0) {
        for (const playlist of playlistsToFetch) {
            const params = new URLSearchParams();
            params.set("playlistId", playlist.id);
            params.set("part", "contentDetails,snippet");
            params.append("maxResults", "50");
            params.append("key", youtubeKey);
            const url = "https://www.googleapis.com/youtube/v3/playlistItems?" + params.toString();
            const response = await fetch(url);
            if (!response.ok) throw new Error(await response.text());
            const contentDetails = await response.json();
            const videos: Video[] = [];
            for (const item of contentDetails.items) {
                const id = item.contentDetails;
                if (item.snippet.title == "Private video" && item.snippet.description == "This video is private.") {
                    continue;
                }
                if (item.snippet.title == "Deleted video" && item.snippet.description == "This video is unavailable.") {
                    continue;
                }
                const video: Video = {
                    type: "video",
                    title: item.snippet.title,
                    description: item.snippet.description,
                    url: "https://www.youtube.com/watch?v=" + id.videoId,
                    id: id.videoId,
                    thumbnail: item.snippet.thumbnails.high ?? item.snippet.thumbnails.default,
                    channel: item.snippet.channelTitle,
                    channelId: item.snippet.channelId,
                    duration: { hours: 0, minutes: 0, seconds: 0 },
                };
                videos.push(video);
            }

            const videosToFetch = videos.filter((item) => item.type == "video" && videoCache[item.id] == undefined) as Video[];
            await fetchVideoDetails(videosToFetch, youtubeKey);
            for (let i = 0; i < videos.length; i++) {
                videos[i] = videoCache[videos[i].id];
            }

            playlist.videos = videos;
            playlistCache[playlist.id] = playlist;
        }
        fs.writeFileSync("/data/playlistcache.json", JSON.stringify(playlistCache, null, 2), "utf-8");
    }
}

(async () => {
    if (!fs.existsSync("docker/data")) {
        fs.mkdirSync("docker/data");
    }

    if (fs.existsSync("/data/videocache.json")) {
        videoCache = JSON.parse(fs.readFileSync("/data/videocache.json", "utf-8"));
    }

    if (fs.existsSync("/data/querycache.json")) {
        queryCache = JSON.parse(fs.readFileSync("/data/querycache.json", "utf-8"));
    }

    const app = express();
    app.set("json spaces", 2);
    app.use(cors());
    app.use(compression());
    app.use(bodyParser.urlencoded({ extended: true }));

    app.get("/api/search", async (req, res) => {
        try {
            let data = queryCache[req.query.query as string];
            if (!data) {
                const params = new URLSearchParams();
                params.append("q", (req.query.query as string) ?? "");
                params.append("part", "snippet");
                params.append("maxResults", "50");
                params.append("key", youtubeKey);
                let response = await fetch("https://www.googleapis.com/youtube/v3/search?" + params.toString());
                if (!response.ok) throw new Error(await response.text());
                data = await response.json();
                queryCache[req.query.query as string] = data;
                fs.writeFileSync("/data/querycache.json", JSON.stringify(queryCache, null, 2), "utf-8");
            }
            const items = convertYoutubeData(data);

            const videosToFetch = items.filter((item) => item.type == "video" && videoCache[item.id] == undefined) as Video[];
            await fetchVideoDetails(videosToFetch, youtubeKey);

            const playlistsToFetch = items.filter((item) => item.type == "playlist" && playlistCache[item.id] == undefined) as Playlist[];
            await fetchPlaylistDetails(playlistsToFetch, youtubeKey);

            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type == "video") {
                    items[i] = videoCache[item.id];
                } else if (item.type == "playlist") {
                    items[i] = playlistCache[item.id];
                }
            }
            res.json(items);
        } catch (e) {
            console.error("Search failed", e);
            res.status(400);
        }
    });

    const server = http.createServer(app);
    server.listen(port, async () => {
        console.log(`App listening on port ${port}`);
    });

    setupLiveReload(server);
})();

function setupLiveReload(server: http.Server) {
    const wss = new WebSocketServer({ server });
    const clients: Set<WebSocket> = new Set();
    wss.on("connection", (ws: WebSocket) => {
        clients.add(ws);
        ws.on("close", () => {
            clients.delete(ws);
        });
    });

    chokidar.watch("html/", { ignored: /(^|[\/\\])\../, ignoreInitial: true }).on("all", (event, path) => {
        clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(`File changed: ${path}`);
            }
        });
    });
    console.log("Initialized live-reload");
}
