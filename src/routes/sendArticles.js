const { Router } = require("express");
const Parser = require("rss-parser");
const auth = require("../middleware/auth");
const User = require("../schema/Users");

const router = Router();
const parser = new Parser();

const FEEDS = [
  "https://techcrunch.com/feed/",
  "https://news.ycombinator.com/rss",
  "https://dev.to/feed",
];

const extractImage = (content) => {
  if (!content) return null;
  const match = content.match(/<img[^>]+(?:src|data-src)="([^">]+)"/i);
  return match ? match[1] : null;
};

router.get("/fetch-articles", auth, async (req, res) => {
  try {
    // 1️⃣ Fetch user preferences
    const user = await User.findById(req.user.id).select("preferences");
    const keywords =
      user?.preferences?.map((p) => p.preference.toLowerCase()) || [];

    let articles = [];

    // 2️⃣ Fetch RSS feeds
    for (const url of FEEDS) {
      try {
        const feed = await parser.parseURL(url);

        for (const item of feed.items || []) {
          const title = item.title || "";
          const content = item.content || item.contentSnippet || "";

          // 3️⃣ Score article by preference matches
          let priority = 0;
          if (keywords.length > 0) {
            keywords.forEach((k) => {
              if (title.toLowerCase().includes(k)) priority += 2;
              else if (content.toLowerCase().includes(k)) priority += 1;
            });
          }

          // 4️⃣ Extract image (fallback to placeholder)
          const image =
            item.enclosure?.url ||
            extractImage(item.content) ||
            item["media:content"]?.$?.url ||
            "missing";

          // 5️⃣ Build article object
          articles.push({
            headline: title,
            preview:
              item.contentSnippet ||
              content.replace(/<[^>]*>?/gm, "").slice(0, 250) + "...",
            image,
            date: item.pubDate ? new Date(item.pubDate) : new Date(),
            priority, // score based on preferences
            source: feed.title || "Unknown",
            link: item.link || "#",
          });
        }
      } catch (feedErr) {
        console.error(`Feed error (${url}):`, feedErr.message);
      }
    }

    // 6️⃣ Remove duplicates by headline
    const uniqueArticles = Array.from(
      new Map(articles.map((a) => [a.headline, a])).values(),
    );

    // 7️⃣ Sort by priority + date
    uniqueArticles.sort((a, b) => b.priority - a.priority || b.date - a.date);

    // 8️⃣ Return array
    return res.json(uniqueArticles);
  } catch (err) {
    console.error("Fetch articles error:", err);
    return res.status(500).json([]);
  }
});

module.exports = router;
