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

  // Common playlist ID patterns (PL..., OLAK5uy..., RD..., etc.)
  if (/^[a-zA-Z0-9_-]{12,60}$/.test(trimmed)) {
    return trimmed;
  }

  try {
    const url = new URL(trimmed);
    if (url.hostname.includes("youtube.com")) {
      const list = url.searchParams.get("list");
      if (list && /^[a-zA-Z0-9_-]{12,60}$/.test(list)) return list;
    }
  } catch {
    // Not a URL
  }

  return null;
}

/**
 * Extract all unique 11-character YouTube Video IDs from any bulk text or list of links.
 */
export function extractAllVideoIdsFromText(text: string): string[] {
  if (!text) return [];
  const seen = new Set<string>();
  const results: string[] = [];

  const regex = /(?:v=|videoId"[:\s]*"|youtu\.be\/|\/shorts\/)([a-zA-Z0-9_-]{11})/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const vId = match[1];
    if (vId && !seen.has(vId)) {
      seen.add(vId);
      results.push(vId);
    }
  }

  return results;
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
 * Fetch video title and author metadata for a single YouTube video ID via oEmbed.
 */
export async function fetchYouTubeVideoInfo(videoId: string): Promise<{ title: string; artist: string }> {
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || "Ambient Track",
        artist: data.author_name || "YouTube Creator",
      };
    }
  } catch {}
  return { title: "Ambient Track", artist: "YouTube Creator" };
}

/**
 * Fetch ALL 50-200+ tracks from ANY YouTube Playlist URL or ID using Multi-Engine & Direct Regex Extractor.
 */
export async function fetchYouTubePlaylistTracks(playlistId: string): Promise<ExtractedTrack[]> {
  if (!playlistId) return [];
  const cleanId = extractYouTubePlaylistId(playlistId) || playlistId.trim();

  // 1. Strategy A: Open YouTube API Instances (Piped / Invidious - Fetches ALL 50-200+ items)
  const apiInstances = [
    `https://pipedapi.kavin.rocks/playlists/${cleanId}`,
    `https://api.piped.yt/playlists/${cleanId}`,
    `https://invidious.projectsegfau.lt/api/v1/playlists/${cleanId}`,
    `https://yt.drgnz.club/api/v1/playlists/${cleanId}`,
  ];

  for (const apiUrl of apiInstances) {
    try {
      const apiRes = await fetch(apiUrl, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(5000),
      });

      if (apiRes.ok) {
        const apiData = await apiRes.json();
        const rawItems = apiData.relatedStreams || apiData.videos || [];

        if (Array.isArray(rawItems) && rawItems.length > 0) {
          const tracks: ExtractedTrack[] = [];
          const seen = new Set<string>();

          for (const item of rawItems) {
            const rawVId = item.url ? item.url.split("v=")[1] : item.videoId;
            const cleanVId = extractYouTubeVideoId(rawVId || "");

            if (cleanVId && !seen.has(cleanVId)) {
              seen.add(cleanVId);
              tracks.push({
                youtubeVideoId: cleanVId,
                title: (item.title || "Ambient Track").trim(),
                artist: (item.uploaderName || item.author || "YouTube Creator").trim(),
                thumbnail: getYouTubeThumbnailUrl(cleanVId, "hq"),
              });
            }
          }

          if (tracks.length > 0) {
            console.log(`✔ Strategy A (API) fetched ${tracks.length} tracks from YouTube playlist ${cleanId}`);
            return tracks;
          }
        }
      }
    } catch (e) {}
  }

  // 2. Strategy B: Direct YouTube Playlist Page HTML Scraper with Regex Deep Search (Gets 50-200+ items)
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

      const tracks: ExtractedTrack[] = [];
      const seenIds = new Set<string>();

      // B1. Structured JSON extraction
      if (ytDataMatch && ytDataMatch[1]) {
        try {
          const jsonData = JSON.parse(ytDataMatch[1]);
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

            for (const key of Object.keys(obj)) {
              if (Array.isArray(obj[key])) {
                obj[key].forEach((child: any) => extractVideoRenderers(child));
              } else if (typeof obj[key] === "object") {
                extractVideoRenderers(obj[key]);
              }
            }
          };

          extractVideoRenderers(jsonData);
        } catch (e) {}
      }

      // B2. Deep Regex extraction from full HTML if initial renderers had few items
      const allExtractedIds = extractAllVideoIdsFromText(htmlText);
      for (const vId of allExtractedIds) {
        if (!seenIds.has(vId)) {
          seenIds.add(vId);
          tracks.push({
            youtubeVideoId: vId,
            title: `Ambient Track #${tracks.length + 1}`,
            artist: "YouTube Creator",
            thumbnail: getYouTubeThumbnailUrl(vId, "hq"),
          });
        }
      }

      if (tracks.length > 0) {
        console.log(`✔ Strategy B (HTML Deep Search) fetched ${tracks.length} tracks from YouTube playlist ${cleanId}`);
        return tracks;
      }
    }
  } catch (htmlErr) {
    console.warn("HTML Scraper warning, falling back to RSS:", htmlErr);
  }

  // 3. Strategy C: YouTube RSS Feed (Fallback)
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
