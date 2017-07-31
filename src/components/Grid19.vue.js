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
        showDelayed() {
            var vue = this;
            var dummy = this.$store.state.pulseNum;
            // console.log('grid', dummy);
console.log(vue.info)
            setTimeout(function () {
                var grid = vue.$el;
                var info = vue.info;
                var numToShow = info.ayyamiha ? info.ayyamiha : 19;
                for (var c = 1; c <= 19; c++) {
                    var cell = grid.getElementsByClassName('cell' + c)[0];
                    if (c > numToShow) {
                        cell.style.visibility = 'hidden';
                        continue;
                    } else {
                        cell.style.visibility = 'visible'
                    }

                    var a = cell.getElementsByClassName('a')[0];
                    a.innerText = c;
                    // var b = cell.getElementsByClassName('b')[0];
                    // b.innerText = c;
                    cell.classList.remove('past');
                    cell.classList.remove('now');
                    cell.classList.remove('future');

                    if (c === info.num) {
                        cell.classList.add('now');
                    // } else if (c < info.num) {
                    //     cell.classList.add('past');
                    } else {
                        cell.classList.add('past');
                        //cell.classList.add('future');
                    }
                }

            }, 0);

            return dummy;
        }
    },
    mounted: function () {
        // this.showMe;
    },
    methods: {
    }
}

