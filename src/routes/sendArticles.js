const { Router } = require('express');
const Parser = require('rss-parser');
const User = require('../schema/Users');
const Article = require('../schema/Articles');

const router = Router();
const parser = new Parser();

const FEEDS = [
  "https://techcrunch.com/feed/",
  "https://news.ycombinator.com/rss",
  "https://dev.to/feed"
];

const extractImage = (content) => {
    if (!content) return null;
    const imgRegex = /<img[^>]+src="([^">]+)"/;
    const match = content.match(imgRegex);
    return match ? match[1] : null;
};

router.get('/fetch-articles', async (req, res) => {
    console.log("Starting article fetch job...");
    try {
        const users = await User.find().select('preferences');
        if (!users || users.length === 0) {
            console.log("No users found.");
            return res.status(200).json({ message: "No users found to determine article preferences." });
        }

        const allPreferences = users.flatMap(user => user.preferences.map(p => p.preference.toLowerCase()));
        const keywords = [...new Set(allPreferences)];

        if (keywords.length === 0) {
            console.log("No keywords found in user preferences.");
            return res.status(200).json({ message: "No user preferences keywords found to fetch articles." });
        }
        console.log(`Fetching articles for keywords: ${keywords.join(', ')}`);

        let articlesToSave = [];

        for (const url of FEEDS) {
            try {
                const feed = await parser.parseURL(url);
                console.log(`Fetched feed from ${feed.title || url}`);

                for (const item of feed.items) {
                    const title = item.title || '';
                    const content = item.content || item.contentSnippet || '';

                    if (title && keywords.some(k => title.toLowerCase().includes(k) || content.toLowerCase().includes(k))) {
                        
                        const existingArticle = await Article.findOne({ headline: item.title });
                        if (existingArticle) {
                            continue;
                        }
                        
                        let image = (item.enclosure && item.enclosure.url) || extractImage(item.content);
                        
                        if (!image && item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
                            image = item['media:content'].$.url;
                        }

                        if (!image) {
                            continue;
                        }

                        const articleData = {
                            headline: item.title,
                            preview: item.contentSnippet || content.substring(0, 250).replace(/<[^>]*>?/gm, '') + '...',
                            image: image,
                            date: item.pubDate ? new Date(item.pubDate) : new Date(),
                        };

                        articlesToSave.push(articleData);
                    }
                }
            } catch (feedError) {
                console.error(`Error processing feed ${url}:`, feedError.message);
            }
        }
        
        console.log(`Found ${articlesToSave.length} new articles to save.`);
        if (articlesToSave.length > 0) {
            try {
                const result = await Article.insertMany(articlesToSave, { ordered: false });
                console.log(`Successfully saved ${result.length} new articles.`);
                res.json({ message: `Saved ${result.length} new articles.` });
            } catch (dbError) {
                if (dbError.code === 11000) {
                    console.log(`Some articles were duplicates and not inserted.`)
                    res.json({ message: `Some new articles were saved. Some were duplicates.` });

                } else {
                   throw dbError;
                }
            }
        } else {
            res.json({ message: "No new articles matching preferences found." });
        }

    } catch (error) {
        console.error('Error in article fetching job:', error);
        res.status(500).send('Server Error: ' + error.message);
    }
});

module.exports = router;
