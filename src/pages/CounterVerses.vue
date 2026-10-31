<template>
    <article class="CounterVerses" :data-verse="verse.id">
        <h1 class="sr-only" data-page-heading>{{ $msg('pageTitleCounters') }}</h1>
        <div class="cvTop">
            <div class="cvNav">
                <button type="button"
                        class="cvArrow"
                        aria-label="Previous verse"
                        v-bind:disabled="index === 0"
                        v-on:click="showPrevious">
                    <i aria-hidden="true">keyboard_arrow_left</i>
                </button>
                <div class="cvPager" role="group" v-bind:aria-label="$msg('a11yChooseVerse')" ref="pager" v-on:keydown="onPagerKey">
                    <button type="button"
                            v-for="(item, i) in verses"
                            v-bind:key="item.id"
                            v-bind:aria-label="$msg('a11yVerseOf', { num: i + 1, total: verses.length, title: item.title })"
                            v-bind:aria-current="item.id === session.selectedId ? 'true' : null"
                            v-bind:class="{ on: item.id === session.selectedId }"
                            v-on:click="select(item.id)"></button>
                </div>
                <button type="button"
                        class="cvArrow"
                        aria-label="Next verse"
                        v-bind:disabled="index === verses.length - 1"
                        v-on:click="showNext">
                    <i aria-hidden="true">keyboard_arrow_right</i>
                </button>
            </div>
            <div class="cvCarousel"
                 ref="carousel"
                 v-touch-swipe.horizontal="onSwipe"
                 v-on:pointerdown="onPointerDown"
                 v-on:pointerup="onPointerUp"
                 v-on:pointercancel="onPointerCancel">
                <div class="cvSlide" aria-live="polite">
                    <h2><span class="sr-only">{{ $msg('a11yVersePosition', { num: index + 1, total: verses.length }) }} </span>{{ verse.title }}</h2>
                    <div class="cvTextBox" v-bind:class="{ cvMore: textMore }">
                        <p class="cvText" ref="text" v-on:scroll.passive="checkTextMore">{{ verse.text }}</p>
                    </div>
                    <p class="cvSource">
                        <a v-bind:href="verse.url" target="_blank" rel="noopener">{{ sourceLabel }}</a>
                    </p>
                </div>
            </div>
        </div>
        <div class="cvDock tap95card" v-bind:class="{ cvSwapped: tapSwap }">
            <div class="cvArrange">
                <div class="cvCount">
                    <span class="sr-only">{{ $msg('a11yCountLabel') }}</span>
                    <span class="tapNum" v-bind:style="{ width: dotsWidth }">{{ count }}</span>
                    <p class="cvTimes" v-bind:style="{ width: dotsWidth }">{{ verse.target }} times</p>
                    <div class="cvTapDots" aria-hidden="true">
                        <div v-for="(row, rowIndex) in dotRows" v-bind:key="rowIndex">
                            <span v-for="n in row"
                                  v-bind:key="n"
                                  v-bind:class="{ tapped: n <= count, five: n % 5 === 0 }"></span>
                        </div>
                    </div>
                    <div class="cvGroupSlot" aria-hidden="true">
                        <div class="cvGroupDots" v-show="continues">
                            <div>
                                <span v-for="n in groupSlots"
                                      v-bind:key="n"
                                      v-bind:class="{ tapped: n < group, future: n > group }"
                                      v-bind:style="groupStyle(n)">{{ groupLabel(n) }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <button type="button"
                        class="primary circular big"
                        ref="tapButton"
                        v-on:click="tap"
                        v-bind:disabled="tapBtnDisabled"
                        v-bind:aria-label="tapLabel"
                        v-bind:title="'Tap to count ' + verse.title">{{ tapBtnText }}</button>
            </div>
            <div class="tapControl">
                <div class="cvActions" v-if="allowContinue">
                    <span class="continue" id="cvContinueLabel">
                        {{ $msg('a11yContinuePast', { total: verse.target }) }}
                    </span>
                    <q-toggle v-model="tapContinue" aria-labelledby="cvContinueLabel" />
                </div>
                <div class="cvPrefs">
                    <button type="button" class="reset small light round" ref="resetButton" v-on:click="resetCount">Reset</button>
                    <button type="button"
                            class="cvSwap small light round"
                            v-bind:aria-pressed="tapSwap"
                            title="Move the tap button to the other side"
                            v-on:click="tapSwap = !tapSwap">Swap</button>
                    <label><input type="checkbox" v-model="tapAuto">Auto</label>
                    <label><input type="checkbox" v-model="tapSounds">Sound</label>
                </div>
                <div class="tapDelayArea" v-bind:style="{ opacity: tapAuto ? 1 : 0.25 }">
                    <span>Auto
                        <span>{{ autoSeconds }}</span></span>
                    <q-range v-model="tapAutoDelay" v-bind:step="500" v-bind:min="1000" v-bind:max="15000"
                             v-bind:aria-label="$msg('a11yAutoSpeed')"
                             v-bind:aria-valuetext="autoSecondsText"></q-range>
                </div>
            </div>
        </div>
        <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">{{ announcement }}</p>
        <audio v-bind:id="soundIds.step" preload="auto">
            <source src="/statics/each.mp3">
        </audio>
        <audio v-bind:id="soundIds.step19" preload="auto">
            <source src="/statics/each19.mp3">
        </audio>
        <audio v-bind:id="soundIds.end" preload="auto">
            <source src="/statics/each95.mp3">
        </audio>
    </article>
</template>
<style src="./CounterVerses.vue.css"></style>
<script src="./CounterVerses.vue.js"></script>
