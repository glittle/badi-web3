// import badiCalc from '../scripts/badiCalc'

export default {
    data() {
        return {
        }
    },
    props: {
        info: Object
    },
    computed: {
        // info: function () {
        //     var type = '';
        //     var num = 0;
        //     var di = this.di;
        //     switch (this.display) {
        //         case 'month':
        //             type = 'Day';
        //             num = di.bDay;
        //             break;
        //         case 'year':
        //             type = 'Month';
        //             num = di.bMonth;
        //             break;
        //         case 'vahid':
        //             type = 'Year';
        //             num = di.bYearInVahid;
        //             break;
        //         case 'kull':
        //             type = 'Vahid';
        //             num = di.bVahid;
        //             break;
        //         case 'kull2':
        //             type = 'Kull-i-Shay’';
        //             num = 1;
        //             break;
        //     }
        //     return {
        //         num: num,
        //         type: type
        //     };
        // },
        // di() {
        //     this.$store.state.pulseNum;
        //     // this.$store.commit('newDate', badiCalc.di);
        //     return badiCalc.di;
        // },

    },
    mounted: function () {
        var grid = this.$el;
        var info = this.info;

        for (var c = 1; c <= 19; c++) {
            var cell = grid.getElementsByClassName('cell' + c)[0];
            var a = cell.getElementsByClassName('a')[0];
            a.innerText = c;
            // var b = cell.getElementsByClassName('b')[0];
            // b.innerText = c;
            if (c === info.num) {
                cell.classList.add('past');
                cell.classList.add('now');
            } else if (c < info.num) {
                cell.classList.add('past');
            } else {
                cell.classList.add('future');
                // cell.classList.remove('selectedCell');
            }
        }
    },
    methods: {
    }
}

