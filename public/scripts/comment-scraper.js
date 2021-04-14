var scraper = require("youtube-comment-scraper");

const scraperPromise = scraper.comments("https://www.youtube.com/watch?v=IeWMT2PVhE0");

scraperPromise.then((value) => {
	console.log(value);
})