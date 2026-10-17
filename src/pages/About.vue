<template>
    <div class="About">
        <article class="layout-padding">
            <h1 class="aboutTitle" data-page-heading>{{this.title}}</h1>
            <aside class=ShareThis aria-labelledby="shareThisHeading">
                <h2 id="shareThisHeading">Share this App!</h2>
                <img class=qr :alt="$msg('a11yQrCode')" src="/statics/qr.png">
                <a href="https://www.wondrous-badi.today/" itemprop="url">
                    <span>Open in any web browser:</span>
                    <span class=underline>Wondrous-Badi.Today</span>
                </a>
            </aside>
            <p>This web app is all about the <span itemprop="applicationCategory">Badíʿ (Wondrous) calendar</span>!
                It is free to use - share it with others!</p>
            <p>Please send suggestions and comments to
                <span itemprop="author" itemscope itemtype="http://schema.org/Person">
                    <span itemprop="name"><a href="mailto:glen.little@gmail.com">Glen Little</a></span>.</span>
            </p>
            <p>
                To financially support ongoing development, please find Glen at <a target="_blank"
                    href="https://patreon.com/GlenLittle">Patreon</a>.
                <br>
                <a href="https://patreon.com/GlenLittle" title="Support Glen at Patreon" target="_blank"><img
                        alt="Patreon" src="/statics/patreon.png"></a>
            </p>
            <p>
                <span>Version <span itemprop="softwareVersion">{{version}}</span> (built {{versionAge}} - <button type="button" class="reload"
                        v-on:click="reload">force a reload now</button>)</span>
            </p>
            <ul>
                <li>ver 2.4.4 - Installed Android app: the strip below the bottom bar is now a neutral dark colour instead of blue, so it suits every colour palette (reinstall the app to see it straight away)</li>
                <li>ver 2.4.3 - Show Now on the Notifications page asks for permission if needed; in the installed Android app, the strip below the bottom bar now matches your colours</li>
                <li>ver 2.4.2 - Removed an old, unused push-messaging library: a smaller, faster download</li>
                <li>ver 2.4.1 - Page-view statistics now use Vercel Web Analytics (no cookies), replacing the old statistics service that Google retired</li>
                <li>ver 2.4 - Theme: choose a colour palette and Light, Dark or Auto (follows your device), on Today and in Other Settings</li>
                <li>ver 2.3 - easier to use with screen readers and the keyboard; colour palettes and counter announcements in Other Settings</li>
                <li>ver 2.2 - Count page uses the Today counter layout, without a back button or page heading</li>
                <li>ver 2.1 - verse carousel beside the 95 counter, each verse with its own count</li>
                <li>ver 2.0 - rebuilt on Vue 3 and Vite; pinch-zoom and browser zoom work</li>
                <li>ver 1.21 - remove old links; improve date listing</li>
            </ul>
        </article>
        <!-- <iframe class="statusDoc" src="https://docs.google.com/document/d/1Q1RtnOocBjW917CHceBbJPSljlDSN5GaZLBp5pu2inA/pub?embedded=false"></iframe>
        <div class="callbackLog">
            <p><strong>Debug log</strong></p>
            <div v-html="callbackLog || 'No server callback yet'"></div>
        </div> -->
    </div>
</template>
<style src="./About.vue.css"></style>
<script>
    import moment from 'moment-timezone'
    import versionInfo from '../../root/version.json'
    import { reloadWithNotice } from '../scripts/swHandler'

    function versionAge(buildDate) {
        var parsed = moment(buildDate, '_ MMM D YYYY HH:mm:ss _Z')
        if (!parsed.isValid()) parsed = moment(new Date(buildDate))
        return parsed.fromNow()
    }

    export default {
        data () {
            return {
                title: 'About',
                icon: 'info'
            }
        },
        computed: {
            version () {
                return versionInfo.version;
            },
            versionAge () {
                return versionAge(versionInfo.buildDate);
            },
            callbackLog () {
                return window._messageBus.serverCallbackLog.join('<br>');
            }

        },
        methods: {
            reload () {
                // skip cache?
                try {
                    navigator.serviceWorker.controller.postMessage('reloading');
                } catch (error) {
                    // ignore errors
                }
                reloadWithNotice('Reloading…');
                return false;
            }
        }
    }

</script>