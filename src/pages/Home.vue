<template>
    <article class="layout-padding tightTop Home">
        <div v-if="!setupDone" class="card" v-cloak>
            <div class="locationHolder">
                <location-setup></location-setup>
            </div>
        </div>

        <div v-if="setupDone" class="card">
            <div class="heading">
                <span class="desc">
                    <span v-html="sunDisplay"></span>
                    <span v-html="location" class="bold"></span>
                    <button v-on:click="changeLocation" class="push small">
                        <i class="clickable">place</i></button>
                </span>
                <span class="type">
                    <button v-on:click="refresh" class="push small">
                        <i class="clickable">autorenew</i></button>
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
        <div v-show="setupDone" class="card verse">
            <div class="heading">
                <span class="desc" v-html="verseTime"></span>
                <span>
                    <button v-on:click="$router.push('verse')" class="small light round">More</button>
                </span>
            </div>
            <Verse v-bind:toggleVerseSpeech="toggleVerseSpeech"></Verse>
        </div>
        <div class="card prayer">
            <div class="heading">
                <span class="desc">A prayer, by <span v-text="prayer.by" class="by"></span>
                </span>
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
                <span class="desc">95 Alláh-u-Abhás</span>
                <span>
                    <label><input type=checkbox v-model="tapAuto">Auto</label>
                    <label><input type=checkbox v-model="tapSounds">Sound</label>
                </span>
            </div>
            <div class="main95">
                <div>
                    <span class=tapNum v-html="tapNum"></span>
                    <div id="tapDots"></div>
                    <div id="groupDots" v-show="tapContinue"></div>
                </div>
                <button v-on:click="tap95" v-bind:disabled="tapBtnDisabled" v-html="tapBtnText" title="Tap here. In Auto mode, tap to Start or Stop" class="primary circular big"></button>
            </div>
            <div class="tapControl">
                <div>
                    <button v-on:click="reset95" class="reset small light round">Reset</button>

                    <span class="continue">
                        Continue past 95?
                    </span>
                    <q-toggle v-model="tapContinue" />

                </div>
                <div class="tapDelayArea" v-bind:style="{opacity: tapAuto ? 1 : 0.25}">
                    <span>Auto
                        <span v-html="(Math.round(tapAutoDelay/100)/10).toFixed(1) + ' s'"></span></span>
                    <q-range v-model="tapAutoDelay" :step="500" :min="1000" :max="15000"></q-range>
                </div>

            </div>
        </div>
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
                <span class="desc">Calendar for this month</span>
            </div>
            <div class="content">
                <a v-if="thisMonthImage" :href="thisMonthImage" target="calendar"><img alt="Calendar Image" :src="thisMonthImage"></a>
                <div v-else>
                    (Not available yet)
                </div>
            </div>
        </div>
        <div v-show="setupDone" class="card share">
            <div class="heading">
                <span class="desc">Upcoming Dates</span>
                <span>
                    <button v-on:click="$router.push('listing')" class="small light round">More</button>
                </span>
            </div>
            <Listing :onHome="true"></Listing>
        </div>

        <div class="card share">
            <div class="heading">
                <span class="desc">Share and Support</span>
                <span>
                    <button v-on:click="$router.push('about')" class="small light round">About</button>
                </span>
            </div>
            <div class="support">
                <img class="qr" alt="Scannable QR Code" src="~statics/qr.png">
                <p>
                    Share this site (https://wondrous-badi.today) with a friend! See the "About" page to support the developer and send suggestions! For more calendar tools, get the <a href="https://sites.google.com/site/badicalendartools/home/web-extension" rel="noopener" target='sites'>Badí Calendar</a> web extension for Chrome and Edge (desktop only).
                </p>
            </div>
        </div>

    </article>
</template>
<style src="./Home.vue.css"></style>
<script src="./Home.vue.js"></script>
