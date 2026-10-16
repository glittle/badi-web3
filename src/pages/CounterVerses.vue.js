import storage from '../scripts/storage'
import {
    verses,
    session,
    ensureSession,
    selectVerse,
    rememberCounter,
    verseById,
    LEGACY_VERSE_ID
} from '../scripts/counterVerses'

const SWIPE_MIN = 48

export default {
    data() {
        ensureSession()
        return {
            name: 'Counters',
            title: 'Verses',
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
            tapLastTime: 0,
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
        groupSlots() {
            return [1, 2, 3, 4, 5, 6, 7, 8, 9]
        },
        autoSeconds() {
            return (Math.round(this.tapAutoDelay / 100) / 10).toFixed(1) + ' s'
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
        goBack() {
            const state = window.history.state
            if (state && state.back) this.$router.back()
            else this.$router.push('/')
        },
        select(id) {
            if (id === this.verse.id) return
            this.stopAuto()
            selectVerse(id)
            this.updateTapDisplay()
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
            if (this.tapAuto) {
                this.tapBtnText = this.tapAutoRunning ? 'Pau<u>s</u>e' : this.count === 0 ? '<u>S</u>tart' : 'Re<u>s</u>ume'
            } else {
                this.tapBtnText = '<u>T</u>ap'
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
    },
    head: {
        title: function () {
            return { inner: 'Verses' }
        }
    }
}
