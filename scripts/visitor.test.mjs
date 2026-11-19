import assert from 'node:assert/strict'
import test from 'node:test'
import {
    isAutomatedVisitor,
    placeNameFromLookup,
    timezoneOffsetMinutes,
    CRAWLER_DEFAULT,
    OFFLINE_PLACE_NAME,
    UNKNOWN_PLACE_NAME
} from '../src/scripts/visitor.js'

function nav(userAgent, webdriver) {
    return { userAgent, webdriver: webdriver === true }
}

test('search crawlers are automated visitors', () => {
    assert.equal(isAutomatedVisitor(nav('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')), true)
    assert.equal(isAutomatedVisitor(nav('Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.6778.264 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)')), true)
    assert.equal(isAutomatedVisitor(nav('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)')), true)
    assert.equal(isAutomatedVisitor(nav('DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)')), true)
    assert.equal(isAutomatedVisitor(nav('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot')), true)
    assert.equal(isAutomatedVisitor(nav('Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)')), true)
    assert.equal(isAutomatedVisitor(nav('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36')), true)
})

test('webdriver is an automated visitor even with a normal browser name', () => {
    const chrome = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    assert.equal(isAutomatedVisitor(nav(chrome, true)), true)
    assert.equal(isAutomatedVisitor(nav(chrome, false)), false)
})

test('ordinary browsers and phone brands are not automated visitors', () => {
    assert.equal(isAutomatedVisitor(nav('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')), false)
    assert.equal(isAutomatedVisitor(nav('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1')), false)
    assert.equal(isAutomatedVisitor(nav('Mozilla/5.0 (Linux; Android 10; CUBOT_X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.210 Mobile Safari/537.36')), false)
    assert.equal(isAutomatedVisitor(nav('Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WhatsApp/2.21.21')), false)
    assert.equal(isAutomatedVisitor(nav('')), false)
    assert.equal(isAutomatedVisitor(null), false)
})

test('a failed place-name lookup says so only when there is no internet', () => {
    assert.equal(placeNameFromLookup({ online: false, name: '' }), OFFLINE_PLACE_NAME)
    assert.equal(placeNameFromLookup({ networkError: true, name: 'Haifa' }), OFFLINE_PLACE_NAME)
    assert.equal(placeNameFromLookup({ name: '' }), UNKNOWN_PLACE_NAME)
    assert.equal(placeNameFromLookup({ name: null }), UNKNOWN_PLACE_NAME)
    assert.equal(placeNameFromLookup({ name: '  ' }), UNKNOWN_PLACE_NAME)
    assert.equal(placeNameFromLookup({ online: false, networkError: false, name: 'Haifa' }), OFFLINE_PLACE_NAME)
    assert.equal(placeNameFromLookup({ name: 'Haifa' }), 'Haifa')
})

test('the crawler default is Haifa in Asia/Jerusalem', () => {
    assert.equal(CRAWLER_DEFAULT.name, 'Haifa (default)')
    assert.equal(CRAWLER_DEFAULT.lat, 32.8193)
    assert.equal(CRAWLER_DEFAULT.lng, 34.9885)
    assert.equal(CRAWLER_DEFAULT.timeZone, 'Asia/Jerusalem')
    const winter = timezoneOffsetMinutes('Asia/Jerusalem', new Date(Date.UTC(2026, 0, 15, 12, 0, 0)))
    const summer = timezoneOffsetMinutes('Asia/Jerusalem', new Date(Date.UTC(2026, 6, 15, 12, 0, 0)))
    assert.equal(winter, -120)
    assert.equal(summer, -180)
    assert.equal(timezoneOffsetMinutes('UTC', new Date(Date.UTC(2026, 0, 15, 12, 0, 0))), 0)
})
