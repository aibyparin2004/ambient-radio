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
 * Fetch ALL tracks (up to 100+) from a YouTube Playlist using HTML Scraper + RSS fallback.
 */
export async function fetchYouTubePlaylistTracks(playlistId: string): Promise<ExtractedTrack[]> {
  if (!playlistId) return [];
  const cleanId = extractYouTubePlaylistId(playlistId) || playlistId;

  // 1. Strategy A: Direct YouTube Playlist Page HTML Scraper (Extracts ALL videos in playlist, 50-100+)
  try {
    const pageUrl = `https://www.youtube.com/playlist?list=${cleanId}`;
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (res.ok) {
      const htmlText = await res.text();
      const ytDataMatch = htmlText.match(/var ytInitialData = ({[\s\S]*?});<\/script>/);

      if (ytDataMatch && ytDataMatch[1]) {
        const jsonData = JSON.parse(ytDataMatch[1]);
        const tracks: ExtractedTrack[] = [];
        const seenIds = new Set<string>();

        // Recursively extract all playlistVideoRenderer objects from JSON
        const extractVideoRenderers = (obj: any) => {
          if (!obj || typeof obj !== "object") return;

          if (obj.playlistVideoRenderer) {
            const renderer = obj.playlistVideoRenderer;
            const videoId = renderer.videoId;
            const title =
              renderer.title?.runs?.[0]?.text ||
              renderer.title?.simpleText ||
              "Ambient Track";
            const artist =
              renderer.shortBylineText?.runs?.[0]?.text ||
              renderer.ownerText?.runs?.[0]?.text ||
              "YouTube Artist";

            if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId) && !seenIds.has(videoId)) {
              seenIds.add(videoId);
              tracks.push({
                youtubeVideoId: videoId,
                title: title.trim(),
                artist: artist.trim(),
                thumbnail: getYouTubeThumbnailUrl(videoId, "hq"),
              });
            }
          }

          // Recurse down children
          for (const key of Object.keys(obj)) {
            if (Array.isArray(obj[key])) {
              obj[key].forEach((child: any) => extractVideoRenderers(child));
            } else if (typeof obj[key] === "object") {
              extractVideoRenderers(obj[key]);
            }
          }
        };

        extractVideoRenderers(jsonData);

        if (tracks.length > 0) {
          return tracks;
        }
      }
    }
  } catch (htmlErr) {
    console.warn("HTML Scraper warning, falling back to RSS:", htmlErr);
  }

  // 2. Strategy B: YouTube RSS Feed (Fallback)
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${cleanId}`;
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
