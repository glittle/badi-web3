import badi from '../scripts/badiCalc'
import * as shared from '../scripts/shared'
import storage from '../scripts/storage'
import dateLinksInfo from '../assets/datelinks.json'

var cloneDeep = require('lodash/cloneDeep');

export default {
    name: 'listing', // for Vue debugger
    props: {
        onHome: Boolean
    },
    data() {
        return {
            title: "Dates",
            icon: '../statics/calendarWhite.png',
            includeHolyDays: storage.get('includeHolyDays', true),
            includeFeasts: storage.get('includeFeasts', true),
            includeOther: storage.get('includeOther', true),
            includeFast: storage.get('includeFast', false),
            suggestedStart: storage.get('suggestedStart', '1930'),
            originalYear: 0,
            firstYear: 9999,
            lastYear: -1,
            list: [],
            location: shared.coords.name,
            scrollDone: false,
            makeId: shared.makeId
        }
    },

    computed: {
        nextYear: function() {
            return this.lastYear + 1;
        },
        prevYear: function() {
            return this.firstYear - 1;
        },
        filteredList: function() {
            var filter = ['Today'];
            if (this.includeHolyDays) {
                filter.push('HS');
                filter.push('HO');
            }
            if (this.includeFeasts) {
                filter.push('M');
            }
            if (this.includeOther) {
                filter.push('Ayyam');
                filter.push('OtherDay');
            }
            if (this.includeFast) {
                filter.push('Fast');
            }
            return this.list.filter(item => filter.includes(item.Type));
        },
    },
    watch: {
        includeHolyDays: function(v) {
            storage.set('includeHolyDays', v)
        },
        includeFeasts: function(v) {
            storage.set('includeFeasts', v)
        },
        includeOther: function(v) {
            storage.set('includeOther', v)
        },
        includeFast: function(v) {
            storage.set('includeFast', v)
        },
        suggestedStart: function(v) {
            storage.set('suggestedStart', v)
            var vue = this;
            vue.list = [];
            // TODO: does not redisplay if reusing previous year
            for (var i = vue.firstYear; i <= vue.lastYear; i++) {
                vue.loadDates(i);
            }
        },
    },
    created: function() {
        var vue = this;

        _messageBus.$on('setupDone', function() {
            vue.prepare();
        })

        if (!badi.di || !badi.di.stamp) {
            vue.$router.push('/');
            return;
        }
        this.prepare();
        _messageBus.$on('changedDay', this.prepare);
    },
    methods: {
        prepare: function() {
            this.originalYear = badi.di.bYear;
            this.lastYear = -1;
            this.loadDates(this.originalYear);

            if (badi.di.bMonth > 17 || badi.di.bMonth === 0) {
                this.loadDates(this.nextYear);
            }
        },
        ayyam2: function(day) {
            // console.log(day)
            return day.lastDayDi.gCombinedY
        },
        resetToFirstYear: function() {
            var vue = this;
            vue.list = [];
            this.firstYear = this.originalYear;
            this.lastYear = this.originalYear;
            vue.loadDates(this.originalYear);
        },
        getDateLinks: function(day) {
            if (day.links) {
                // console.log('reused links')
                return day.links;
            }
            var id = shared.makeId(day);
            var info = dateLinksInfo[id];
            var links = [];
            if (info) {
                this.getLinks(links, info);
            }

            var parts = id.split('-');
            info = dateLinksInfo[parts[0]];
            if (info) {
                this.getLinks(links, info);
            }

            if (parts[0] === 'M') {
                var id2 = parts[0] + parts[2];
                info = dateLinksInfo[id2];
                if (info) {
                    this.getLinks(links, info);
                }
            } else {}
            day.links = links;
            return day.links;
        },
        getLinks: function(links, info) {
            for (var i = 0; i < info.length; i++) {
                var item = info[i];
                switch (item.icon) {
                    case '-badiMonthA':
                        item.icon = '/images/thumb/' + item.url + '.jpg';
                        item.url = '/images/' + item.url;
                        item.class = 'monthImage'
                        break;
                    case '-DOR':
                        item.icon = '../statics/divider.png';
                        item.class = 'iconDivider'
                        break;
                    case '-readingsDoc':
                        item.icon = '../statics/doc.gif';
                        item.class = 'icon20'
                        break;
                    case '-readingsWeb':
                        item.icon = '../statics/web.png';
                        item.class = 'icon20'
                        break;
                }
                links.push(item);
            }
        },
        getSpecialTime: function(day) {
            var prefix = 'Suggested start at';
            var list = ['SpecialTime'];

            switch (day.EventType) {
                case 'Tablet':
                    prefix = 'Recite tablet at';
                    list.push('setTime')
                    break;

                case 'Celebrate':
                    prefix = 'Celebrate at';
                    list.push('setTime')
                    break;

                default:
                    if (!this.suggestedStart || !day.EventTime) {
                        return {
                            classes: '',
                            html: ''
                        }
                    }
                    break;
            }

            return {
                // must be a better way to bind to two values...
                classes: list,
                html: prefix + ' ' + day.EventTime
            }
        },
        getNoWork: function(v) {
            if (v) {
                return 'Suspend work on ' + v
            }
        },
        getNoWorkClass: function(weekday) {
            var list = ['NoWork'];
            if (weekday > 0 && weekday < 6) {
                // very simple M - F. Should be settable by user!
                list.push('Workday')
            }
            return list;
        },
        loadDates: function(year) {
            var vue = this;
            // debugger;
            // console.log('load dates', year)
            if (!window._nowDi) {
                console.log('skip', year, ' not ready')
                return;
            }
            if (year < vue.firstYear) {
                vue.firstYear = year
            }
            if (year > vue.lastYear) {
                vue.lastYear = year
            }
            if (year === vue.originalYear) {
                vue.list.splice(0);
            }
            // console.log('loading', year)
            var info = badi.buildSpecialDaysTable(year, this.suggestedStart);

            window._days = cloneDeep(info); // for developer access in console
            vue.list = vue.list.concat(info.map(function(d) {
                return extendDayInfo(vue, d, year - vue.originalYear)
            }));
            vue.list.sort(sortDates)

            if (vue.onHome) {
                // vue.includeFeast = true;
                // vue.includeFast = true;
                // vue.includeHolyDays = true;
                // vue.includeOther = true;
                var numShown = 0;
                var toShow = 4;
                var today = window._nowDi.frag1SunTimes.sunset;
                var newList = vue.list.filter(function(day) {
                    if (numShown >= toShow) {
                        return false;
                    }
                    if (day.di.frag1SunTimes.sunset < today) {
                        return false;
                    }
                    if (day.Type === 'Today') {
                        return false;
                    }
                    if (numShown === 0) {
                        day.showingLinks = true;
                    }
                    numShown++;
                    return true;
                });
                vue.list = newList;
            }

            // if (!this.scrollDone) {
            //   this.moveToThisMonth()
            //   this.scrollDone = true;
            // }
        },
        moveToThisMonth: function() {
            var target = shared.makeId({
                Type: 'M',
                di: badi.di
            });
            setTimeout(function() {
                var el = document.getElementById(target);
                if (el) {
                    el.scrollIntoView(true);
                }
            }, 0)
        },
        test: function(cell) {
            switch (cell.data) {
                case 'M':
                    return "Feast"
                case 'HS':
                case 'HD':
                    return "Holy Day"
                default:
                    return cell;
            }
        }
    },
    head: {
        title: function() {
            return {
                inner: this.title
            }
        },
        meta: [{
            name: 'description2',
            content: 'My description',
            //id: 'desc'
        }, {
            itemprop: 'name',
            content: 'Content Title'
        }]
    },

}

function extendDayInfo(vue, d, diff) {
    d.showingLinks = false;
    d.Month = '{bMonthNamePri} {bYear}'.filledWith(d.di)
    if (Math.abs(diff) % 2 === 1) {
        d.RowClass.push('oddYear')
    }
    d.links = vue.getDateLinks(d)
    return d;
}

function sortDates(a, b) {
    return a.GDate < b.GDate ? -1 :
        a.GDate > b.GDate ? 1 :
        a.Type === 'Fast' ? 1 :
        a.Type === 'M' ? -1 :
        a.Type === 'HS' ? -1 :
        a.Type === 'HO' ? -1 :
        1;
}
