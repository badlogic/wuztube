export type Duration = {
    hours: number;
    minutes: number;
    seconds: number;
};

export function parseISODuration(isoString: string): Duration {
    const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
    const matches = isoString.match(regex);

    return {
        hours: parseInt(matches?.[1] ?? "0", 10),
        minutes: parseInt(matches?.[2] ?? "0", 10),
        seconds: parseInt(matches?.[3] ?? "0", 10),
    };
}

export type Thumbnail = {
    width: number;
    height: number;
    url: string;
};

export type Video = {
    type: "video";
    title: string;
    description: string;
    url: string;
    id: string;
    thumbnail: Thumbnail;
    channel: string;
    channelId: string;
    duration: Duration;
};

export type Channel = {
    type: "channel";
    title: string;
    description: string;
    url: string;
    id: string;
    thumbnail: Thumbnail;
};

export type Playlist = {
    type: "playlist";
    title: string;
    description: string;
    url: string;
    id: string;
    thumbnail: Thumbnail;
    videos: Video[];
    channel: string;
    channelId: string;
};

export function convertYoutubeData(data: any) {
    const items = data.items as any[];
    const result: (Video | Playlist | Channel)[] = [];
    for (const item of items) {
        const id = item.id;
        if (id.kind == "youtube#video") {
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
            result.push(video);
        } else if (id.kind == "youtube#playlist") {
            const playlist: Playlist = {
                type: "playlist",
                title: item.snippet.title,
                description: item.snippet.description,
                url: "https://www.youtube.com/playlist?list=" + id.playlistId,
                id: id.playlistId,
                thumbnail: item.snippet.thumbnails.high ?? item.snippet.thumbnails.default,
                videos: [],
                channel: item.snippet.channelTitle,
                channelId: item.snippet.channelId,
            };
            result.push(playlist);
        } else if (id.kind == "youtube#channel") {
        }
    }
    return result;
}
