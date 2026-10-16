import storage from '../scripts/storage'
import messages from '../scripts/messages'
import { tapAnnouncement, announcementsOn } from '../scripts/announce'
import {
    verses,
    session,
    ensureSession,
    selectVerse,
    rememberCounter,
    verseById,
    linkedSourceName,
    LEGACY_VERSE_ID
} from '../scripts/counterVerses'

const SWIPE_MIN = 48

export default {
    data() {
        ensureSession()
        return {
            name: 'Counters',
            title: 'Count',
            icon: '/statics/counter95.svg',
            session: session,
            verses: verses,
            tapContinue: storage.get('tapContinue', false),
            tapBtnText: '',
            tapAutoRunning: false,
            tapAutoTimer: null,
            tapAutoDelay: storage.get('tapAutoDelay', 2000),
            tapAuto: storage.get('tapAuto', true),
            tapSounds: storage.get('tapSounds', true),
            tapSwap: storage.get('tapSwap', false),
            tapLastTime: 0,
            announcement: '',
            drag: null,
            soundIds: {
                step: 'cvTapSoundStep',
                step19: 'cvTapSound19',
                end: 'cvTapSoundEnd'
            }
        }
    },
    computed: {
        verse() {
            return verseById(this.session.selectedId)
        },
        index() {
            return this.verses.findIndex(function (verse) {
                return verse.id === session.selectedId
            })
        },
        count() {
            const entry = this.session.counts[this.verse.id]
            return entry ? entry.count : 0
        },
        group() {
            const entry = this.session.counts[this.verse.id]
            return entry ? entry.group : 1
        },
        tapBtnDisabled() {
            return !!this.session.locked[this.verse.id]
        },
        dotRows() {
            const target = this.verse.target
            const perRow = target > 19 ? 19 : target
            const rows = []
            for (let n = 1; n <= target; n += perRow) {
                const row = []
                for (let i = n; i < n + perRow && i <= target; i++) row.push(i)
                rows.push(row)
            }
            return rows
        },
        // Width of one row of dots: each dot is 7px plus 2px margin on each side.
        dotsWidth() {
            return Math.min(this.verse.target, 19) * 11 + 'px'
        },
        groupSlots() {
            return [1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        autoSeconds() {
            return (Math.round(this.tapAutoDelay / 100) / 10).toFixed(1) + ' s'
        },
        autoSecondsText() {
            const seconds = (Math.round(this.tapAutoDelay / 100) / 10).toFixed(1)
            return messages.get(seconds === '1.0' ? 'a11ySecond' : 'a11ySeconds', { seconds: seconds })
        },
        // The button name carries the count, so a screen reader can check it
        // at any time without an announcement on every tap.
        tapLabel() {
            const values = { action: this.tapBtnText, count: this.count, total: this.verse.target, round: this.group }
            return messages.get(this.continues && this.group > 1 ? 'a11yTapLabelRound' : 'a11yTapLabel', values)
        },
        sourceLabel() {
            return linkedSourceName(this.verse)
        },
        // Continue-past is the shared Alláh-u-Abhá setting. Other verses always stop at their target.
        allowContinue() {
            return this.verse.id === LEGACY_VERSE_ID
        },
        continues() {
            return this.allowContinue && this.tapContinue
        }
    },
    watch: {
        tapContinue: function (value) {
            if (!this.allowContinue) return
            const id = this.verse.id
            const entry = this.session.counts[id]
            if (value) {
                this.session.locked[id] = false
            } else if (this.session.locked[id]) {
                rememberCounter(id, entry.count, 1, { storedCount: 0, storedGroup: 1, locked: true })
            } else {
                rememberCounter(id, entry.count, 1, { locked: false })
            }
            storage.set('tapContinue', value)
            this.updateTapDisplay()
        },
        tapSounds: function (value) {
            storage.set('tapSounds', value)
        },
        tapSwap: function (value) {
            storage.set('tapSwap', value)
        },
        tapAuto: function (value) {
            storage.set('tapAuto', value)
            if (!value) this.stopAuto()
            this.updateTapDisplay()
        },
        tapAutoRunning: function () {
            this.updateTapDisplay()
        },
        tapAutoDelay: function (value, previous) {
            if (isNaN(value)) {
                this.tapAutoDelay = storage.get('tapAutoDelay', 2000)
                return
            }
            storage.set('tapAutoDelay', value)
            if (!this.tapAutoRunning) return
            clearTimeout(this.tapAutoTimer)
            const elapsed = new Date().getTime() - this.tapLastTime
            const wait = Math.max(0, value - elapsed)
            this.tapAutoTimer = setTimeout(() => this.doTap(), wait)
            if (previous == null) return
        }
    },
    mounted() {
        this.updateTapDisplay()
    },
    activated() {
        this.tapAuto = storage.get('tapAuto', true)
        this.tapSounds = storage.get('tapSounds', true)
        this.tapContinue = storage.get('tapContinue', false)
        this.tapAutoDelay = storage.get('tapAutoDelay', 2000)
        this.updateTapDisplay()
    },
    deactivated() {
        this.stopAuto()
    },
    beforeUnmount() {
        this.stopAuto()
    },
    methods: {
        select(id) {
            if (id === this.verse.id) return
            this.stopAuto()
            selectVerse(id)
            this.announcement = ''
            this.updateTapDisplay()
        },
        // Arrow keys move between the verse dots.
        onPagerKey(event) {
            let next = null
            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = this.index + 1
            else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = this.index - 1
            else if (event.key === 'Home') next = 0
            else if (event.key === 'End') next = this.verses.length - 1
            if (next === null) return
            event.preventDefault()
            next = Math.max(0, Math.min(this.verses.length - 1, next))
            this.select(this.verses[next].id)
            this.$nextTick(() => {
                const dots = this.$refs.pager ? this.$refs.pager.querySelectorAll('button') : []
                if (dots[next]) dots[next].focus()
            })
        },
        announce(text) {
            // Clear first so the same words twice in a row are still read.
            this.announcement = ''
            this.$nextTick(() => { this.announcement = text })
        },
        // What is said depends on the Counter announcements setting
        // (Other Settings): off, every 19 and the target, or every tap.
        announceFor(count, target) {
            const text = tapAnnouncement(messages, count, target, this.group,
                this.continues ? 'a11yRoundDone' : 'a11yCountDone')
            if (text) this.announce(text)
        },
        showPrevious() {
            if (this.index <= 0) return
            this.select(this.verses[this.index - 1].id)
        },
        showNext() {
            if (this.index >= this.verses.length - 1) return
            this.select(this.verses[this.index + 1].id)
        },
        onSwipe(obj) {
            if (!obj || !obj.distance || Math.abs(obj.distance.x) < SWIPE_MIN) return
            if (obj.direction === 'left') this.showNext()
            else if (obj.direction === 'right') this.showPrevious()
        },
        onPointerDown(event) {
            if (event.pointerType !== 'mouse' || event.button !== 0) return
            this.drag = { x: event.clientX, y: event.clientY }
        },
        onPointerUp(event) {
            if (!this.drag || event.pointerType !== 'mouse') return
            const dx = event.clientX - this.drag.x
            const dy = event.clientY - this.drag.y
            this.drag = null
            if (Math.abs(dx) < SWIPE_MIN || Math.abs(dx) < Math.abs(dy)) return
            if (dx < 0) this.showNext()
            else this.showPrevious()
        },
        onPointerCancel() {
            this.drag = null
        },
        updateTapDisplay() {
            // No underlined letter: the Count page has no single-key shortcut.
            if (this.tapAuto) {
                this.tapBtnText = messages.get(this.tapAutoRunning ? 'tapBtnPause' : this.count === 0 ? 'tapBtnStart' : 'tapBtnResume')
            } else {
                this.tapBtnText = messages.get('tapBtnTap')
            }
        },
        tap() {
            if (this.tapAuto) {
                clearTimeout(this.tapAutoTimer)
                if (this.tapAutoRunning) {
                    this.tapAutoRunning = false
                } else {
                    this.tapAutoRunning = true
                    this.tapAutoTimer = setTimeout(() => this.doTap(), 200)
                }
                this.updateTapDisplay()
                return
            }
            this.doTap()
        },
        doTap() {
            clearTimeout(this.tapAutoTimer)
            const verse = this.verse
            const entry = this.session.counts[verse.id]
            const target = verse.target
            if (!this.count && this.$ga) {
                this.$ga.event('tapVerse', 'started', verse.id)
            }
            if (entry.count === target && !this.continues) {
                this.tapAutoRunning = false
                rememberCounter(verse.id, entry.count, entry.group, {
                    storedCount: 0,
                    storedGroup: 1,
                    locked: true
                })
                this.updateTapDisplay()
                this.keepFocusWhenLocked()
                return
            }
            let count = entry.count + 1
            let group = entry.group
            if (count > target) {
                count = 1
                group += 1
            }
            rememberCounter(verse.id, count, group, { locked: false })
            this.playFor(count, target)
            this.announceFor(count, target)
            if (count === target && !this.continues) this.tapAutoRunning = false
            if (this.tapAutoRunning) {
                this.tapAutoTimer = setTimeout(() => this.doTap(), this.tapAutoDelay)
            }
            this.tapLastTime = new Date().getTime()
            this.updateTapDisplay()
        },
        resetCount() {
            this.stopAuto()
            rememberCounter(this.verse.id, 0, 1, { locked: false })
            this.updateTapDisplay()
            if (announcementsOn()) this.announce(messages.get('a11yCountReset'))
        },
        // The tap button is disabled when a set is finished. If it had focus,
        // move focus to Reset instead of losing it.
        keepFocusWhenLocked() {
            const button = this.$refs.tapButton
            if (!button || document.activeElement !== button) return
            this.$nextTick(() => {
                if (this.$refs.resetButton) this.$refs.resetButton.focus()
            })
        },
        stopAuto() {
            this.tapAutoRunning = false
            clearTimeout(this.tapAutoTimer)
        },
        playFor(count, target) {
            if (!this.tapSounds) return
            if (count === target) this.playSound(this.soundIds.end)
            else if (target >= 19 && count % 19 === 0) this.playSound(this.soundIds.step19)
            else this.playSound(this.soundIds.step)
        },
        playSound(id) {
            const audio = document.getElementById(id)
            if (!audio) return
            try {
                audio.pause()
                audio.currentTime = 0
            } catch (e) {
                // a browser that cannot seek still tries to play
            }
            try {
                audio.volume = 1
                const pending = audio.play()
                if (pending && pending.catch) pending.catch(function () {})
            } catch (e) {
                // autoplay can be blocked; the count still advances
            }
        },
        groupLabel(n) {
            if (n < this.group) return String(this.verse.target)
            if (n === this.group) return String(this.count)
            return '\u00a0'
        },
        groupStyle(n) {
            if (n > this.group) return {}
            const pct = n < this.group ? 100 : Math.round((this.count / this.verse.target) * 100)
            return { background: 'linear-gradient(to top, #FFA726 ' + pct + '%, #eee ' + pct + '%)' }
        }
    }
}
