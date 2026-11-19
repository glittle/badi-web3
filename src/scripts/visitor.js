import moment from 'moment-timezone'

// Default place for a crawler or other automated visitor that has never
// chosen a location. Haifa is the reference city for the Badíʿ day.
// lat/lng are approximate. The time zone is Asia/Jerusalem.
export const CRAWLER_DEFAULT = {
    lat: 32.8193,
    lng: 34.9885,
    name: 'Haifa (default)',
    timeZone: 'Asia/Jerusalem',
    source: 'user'
}

export const OFFLINE_PLACE_NAME = '(No internet)'
export const UNKNOWN_PLACE_NAME = '(unknown)'

// Known crawler and agent tokens. A bare "bot" suffix is not used: phone
// brands such as Cubot would match, and those visitors still need setup.
const BOT_UA = /googlebot|google-inspectiontool|storebot-google|adsbot-google|mediapartners-google|feedfetcher-google|apis-google|googleother|bingbot|bingpreview|duckduckbot|baiduspider|yandexbot|yandeximages|yandexmobilebot|duckduckgo-favicons-bot|slurp|applebot|facebookexternalhit|meta-externalagent|twitterbot|linkedinbot|slackbot|telegrambot|discordbot|pinterestbot|redditbot|embedly|petalbot|ahrefsbot|semrushbot|mj12bot|dotbot|rogerbot|screaming frog|gptbot|chatgpt-user|oai-searchbot|claudebot|claude-searchbot|anthropic-ai|perplexitybot|bytespider|amazonbot|ccbot|cohere-ai|headlesschrome|phantomjs|slimerjs|selenium|puppeteer|playwright|crawler|spider/i

// nav is optional. Called with no argument, this reads the real navigator.
// Pass a stand-in ({ userAgent, webdriver }) from tests.
export function isAutomatedVisitor(nav) {
    const agent = nav === undefined
        ? (typeof navigator === 'undefined' ? null : navigator)
        : nav
    if (!agent) return false
    if (agent.webdriver === true) return true
    return BOT_UA.test(String(agent.userAgent || ''))
}

// Minutes, same sign as Date#getTimezoneOffset (positive west of UTC).
export function timezoneOffsetMinutes(timeZone, date) {
    const zoned = date ? moment.tz(date, timeZone) : moment.tz(timeZone)
    const offset = -zoned.utcOffset()
    // Negating 0 produces -0. Date#getTimezoneOffset returns 0 for UTC.
    return offset === 0 ? 0 : offset
}

// Name to store after a reverse-geocode attempt.
// No internet (navigator.onLine false, or the request never got a response)
// is '(No internet)'. Any other miss stays '(unknown)'.
export function placeNameFromLookup(info) {
    info = info || {}
    if (info.online === false || info.networkError) return OFFLINE_PLACE_NAME
    const name = info.name == null ? '' : String(info.name).trim()
    return name || UNKNOWN_PLACE_NAME
}
