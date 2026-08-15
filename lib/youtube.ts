/**
 * Extract YouTube Video ID from URL or raw ID string.
 */
export function extractYouTubeVideoId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // If already an 11-char alphanumeric/dash/underscore ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtube.com")) {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
      
      // Shorts URL format: youtube.com/shorts/VIDEO_ID
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] === "shorts" && parts[1] && /^[a-zA-Z0-9_-]{11}$/.test(parts[1])) {
        return parts[1];
      }
    } else if (url.hostname.includes("youtu.be")) {
      const parts = url.pathname.split("/").filter(Boolean);
      if (parts[0] && /^[a-zA-Z0-9_-]{11}$/.test(parts[0])) {
        return parts[0];
      }
    }
  } catch {
    // Not a URL
  }

  return null;
}

/**
 * Extract YouTube Playlist ID from URL or raw ID string.
 */
export function extractYouTubePlaylistId(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();

  // Common playlist ID patterns (PL..., OLAK5uy..., etc.)
  if (/^[a-zA-Z0-9_-]{12,40}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtube.com")) {
      const list = url.searchParams.get("list");
      if (list && /^[a-zA-Z0-9_-]{12,40}$/.test(list)) return list;
    }
  } catch {
    // Not a URL
  }

  return null;
}

export function getYouTubeThumbnailUrl(videoId: string, quality: "hq" | "max" = "hq"): string {
  if (quality === "max") {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export interface ExtractedTrack {
  youtubeVideoId: string;
  title: string;
  artist: string;
  thumbnail: string;
}

/**
 * Automatically fetch track details from public YouTube Playlist RSS feed (no API key needed).
 */
export async function fetchYouTubePlaylistTracks(playlistId: string): Promise<ExtractedTrack[]> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
    const res = await fetch(rssUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!res.ok) return [];

    const xmlText = await res.text();
    const tracks: ExtractedTrack[] = [];

    const entryMatches = xmlText.match(/<entry>[\s\S]*?<\/entry>/g);
    if (!entryMatches) return [];

    for (let i = 0; i < entryMatches.length; i++) {
      const entry = entryMatches[i];

      const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const authorMatch = entry.match(/<author>[\s\S]*?<name>(.*?)<\/name>/);

      const videoId = videoIdMatch ? videoIdMatch[1].trim() : null;
      let title = titleMatch ? titleMatch[1].trim() : "Ambient Track";
      title = title
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      const artist = authorMatch ? authorMatch[1].trim() : "YouTube Artist";

      if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
        tracks.push({
          youtubeVideoId: videoId,
          title: title,
          artist: artist,
          thumbnail: getYouTubeThumbnailUrl(videoId, "hq"),
        });
      }
    }

    return tracks;
  } catch (error) {
    console.error("Error fetching YouTube RSS playlist tracks:", error);
    return [];
  }
}
