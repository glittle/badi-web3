<template>
    <article class="layout-padding tightTop Home">
        <h1 class="sr-only" data-page-heading>{{ $msg('pageTitleHome') }}</h1>
        <div v-if="!setupDone" class="card" v-cloak>
            <div class="locationHolder">
                <location-setup></location-setup>
            </div>
        </div>

        <div v-if="setupDone" class="card">
            <h2 class="sr-only">{{ $msg('a11yTodaySummary') }}</h2>
            <div class="heading">
                <span class="desc">
                    <span v-html="sunDisplay"></span>
                    <span v-html="location" class="bold"></span>
                    <button v-on:click="changeLocation" class="push small" :aria-label="$msg('a11yChangeLocation')" :title="$msg('a11yChangeLocation')">
                        <i class="clickable" aria-hidden="true">place</i></button>
                </span>
                <span class="type">
                    <button v-on:click="refresh" class="push small" :aria-label="$msg('a11yRefresh')" :title="$msg('a11yRefresh')">
                        <i class="clickable" aria-hidden="true">autorenew</i></button>
                    …in this Day
                </span>
            </div>
            <div id="sunChart"></div>
            <Grid19 v-bind:info="info('month')"></Grid19>
            <Grid19 v-bind:info="info('year')"></Grid19>
            <Grid19 v-bind:info="info('vahid')"></Grid19>
            <Grid19 v-bind:info="info('kull')"></Grid19>
        </div>
        <div v-show="setupDone && notificationStatus==='default'" class="card">
            <div class="locationHolder">
                <notifications></notifications>
            </div>
        </div>
        <div v-if="addToHomeScreenEvent" class="cardBtn">
            <button v-on:click="addToHomeScreen" class="push">
                Add Icon to Home Screen
            </button>

        </div>
        <!-- iPhone/iPad: Safari never offers an install prompt, so explain the Share menu. -->
        <div v-if="iosInstallHint && !addToHomeScreenEvent" class="cardBtn iosInstallBtn">
            <button v-on:click="iosInstallOpen = !iosInstallOpen" class="push"
                    aria-controls="iosInstallCard" :aria-expanded="iosInstallOpen ? 'true' : 'false'">
                Add Icon to Home Screen
            </button>
        </div>
        <div v-if="iosInstallHint && !addToHomeScreenEvent" v-show="iosInstallOpen" id="iosInstallCard" class="card iosInstall">
            <section aria-labelledby="iosInstallTitle">
                <div class="heading">
                    <h2 class="desc" id="iosInstallTitle">Add to your Home Screen</h2>
                    <span>
                        <button v-on:click="iosInstallOpen = false" class="small light round">Close</button>
                    </span>
                </div>
                <div class="content">
                    <ol>
                        <li>Tap the Share button <i class="iosShareIcon" aria-hidden="true">ios_share</i> in Safari's toolbar (on newer iPhones it may be under the <span aria-hidden="true">•••</span><span class="sr-only">More</span> button).</li>
                        <li>Scroll down and tap <strong>Add to Home Screen</strong>, then <strong>Add</strong>.</li>
                    </ol>
                    <p>The Home Screen app keeps its own settings, so you will set your location again the first time you open it.</p>
                    <p>On iOS 16.4 or later, notifications work only in the Home Screen app.</p>
                </div>
            </section>
        </div>
        <div v-show="setupDone" class="card verse">
            <div class="heading">
                <h2 class="desc" v-html="verseTime"></h2>
                <span>
                    <button v-on:click="$router.push('verse')" class="small light round" :aria-label="$msg('a11yMoreVerses')">More</button>
                </span>
            </div>
            <Verse v-bind:toggleVerseSpeech="toggleVerseSpeech"></Verse>
        </div>
        <div class="card prayer">
            <div class="heading">
                <h2 class="desc">A prayer, by <span v-text="prayer.by" class="by"></span>
                </h2>
                <span>
                    <button v-on:click="showPrayerOnline(prayer.link)" class="small light round">Continue Online</button>
                </span>
            </div>
            <div class="content">
                <span class="firstLine" v-text="prayer.text"></span>
                <button v-on:click="getNewPrayer()" class="small light round right">Change</button>
            </div>
        </div>
        <div class="card tap95card">
            <div class="heading">
                <h2 class="desc">95 Alláh-u-Abhás</h2>
                <span>
                    <button v-on:click="$router.push('counters')" class="small light round more" :aria-label="$msg('a11yMoreCounters')">More</button>
                    <label><input type=checkbox v-model="tapAuto">Auto</label>
                    <label><input type=checkbox v-model="tapSounds">Sound</label>
                </span>
            </div>
            <div class="main95">
                <div>
                    <span class="sr-only">{{ $msg('a11yCountLabel') }}</span>
                    <span class=tapNum v-html="tapNum"></span>
                    <div id="tapDots"></div>
                    <div id="groupDots" v-show="tapContinue"></div>
                </div>
                <button v-on:click="tap95" v-bind:disabled="tapBtnDisabled" v-html="tapBtnText" v-bind:aria-label="tapLabel" title="Tap here. In Auto mode, tap to Start or Stop" class="primary circular big"></button>
            </div>
            <div class="tapControl">
                <div>
                    <button v-on:click="reset95" class="reset small light round">Reset</button>

                    <span class="continue" id="homeContinueLabel">
                        Continue past 95?
                    </span>
                    <q-toggle v-model="tapContinue" aria-labelledby="homeContinueLabel" />

                </div>
                <div class="tapDelayArea" v-bind:style="{opacity: tapAuto ? 1 : 0.25}">
                    <span>Auto
                        <span v-html="(Math.round(tapAutoDelay/100)/10).toFixed(1) + ' s'"></span></span>
                    <q-range v-model="tapAutoDelay" :step="500" :min="1000" :max="15000"
                             :aria-label="$msg('a11yAutoSpeed')" :aria-valuetext="autoSecondsText"></q-range>
                </div>

            </div>
        </div>
        <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ tapAnnouncement }}</p>
        <audio id="tapSoundForSteps" preload="auto" autobuffer="autobuffer">
            <source src="/statics/each.mp3">
        </audio>
        <audio id="tapSoundForSteps19" preload="auto" autobuffer="autobuffer">
            <source src="/statics/each19.mp3">
        </audio>
        <audio id="tapSoundForEnd" preload="auto" autobuffer="autobuffer">
            <source src="/statics/each95.mp3">
        </audio>
        <div v-show="setupDone" v-if="thisMonthImage" class="card calendar">
            <div class="heading">
                <h2 class="desc">Calendar for this month</h2>
            </div>
            <div class="content">
                <a v-if="thisMonthImage" :href="thisMonthImage" target="calendar"><img :alt="$msg('a11yCalendarImage')" :src="thisMonthImage"></a>
                <div v-else>
                    (Not available yet)
                </div>
            </div>
        </div>
        <div v-show="setupDone" class="card share">
            <div class="heading">
                <h2 class="desc">Upcoming Dates</h2>
                <span>
                    <button v-on:click="$router.push('listing')" class="small light round" :aria-label="$msg('a11yMoreDates')">More</button>
                </span>
            </div>
            <Listing :onHome="true"></Listing>
        </div>

        <div v-if="!themeChosen" class="card themeCard">
            <section class="ThemeSetup" aria-labelledby="themeCardTitle">
                <h2 class="pageTitle" id="themeCardTitle">{{ $msg('themeCardTitle') }}</h2>
                <p class="themeIntro">{{ $msg('themeCardIntro') }}</p>
                <theme-chooser id-prefix="card"></theme-chooser>
                <p class="themeConfirm">
                    <button class="primary" v-on:click="confirmTheme">{{ $msg('themeCardConfirm') }}</button>
                </p>
            </section>
        </div>

        <div class="card share">
            <div class="heading">
                <h2 class="desc">Share and Support</h2>
                <span>
                    <button v-on:click="$router.push('about')" class="small light round">About</button>
                </span>
            </div>
            <div class="support">
                <img class="qr" :alt="$msg('a11yQrCode')" src="/statics/qr.png">
                <p>
                    Share this site (<a href="https://wondrous-badi.today">https://wondrous-badi.today</a>) with a friend! See the "About" page to support the developer and send suggestions! For more calendar tools, get the <a href="https://sites.google.com/site/badicalendartools/home/web-extension" rel="noopener" target='sites'>Badí Calendar</a> web extension for Chrome and Edge (desktop only).
                </p>
            </div>
        </div>

    </article>
</template>
<style src="./Home.vue.css"></style>
<script src="./Home.vue.js"></script>
