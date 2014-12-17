/**
 * StreamCard represents a non-destination entry in Santa's feed.
 * @interface
 */
function StreamCard() {};

/**
 * Time at which the card should be shown. Milliseconds since UNIX epoch.
 * @type {number}
 */
StreamCard.prototype.timestamp;

/**
 * If present, show a piece of trivia.
 *
 * @type {string|undefined}
 */
StreamCard.prototype.didyouknow;

/**
 * If present, show a YouTube video with given YouTube ID.
 *
 * @type {string|undefined}
 */
StreamCard.prototype.youtubeId;

/**
 * If present, show an image with given URL.
 *
 * @type {string|undefined}
 */
StreamCard.prototype.imageUrl;

/**
 * If present, show a jovial status message from Santa.
 *
 * @type {string|undefined}
 */
StreamCard.prototype.status;
