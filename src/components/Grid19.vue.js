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

            setTimeout(function () {
                var grid = vue.$el;
                var info = vue.info;

                for (var c = 1; c <= 19; c++) {
                    var cell = grid.getElementsByClassName('cell' + c)[0];
                    var a = cell.getElementsByClassName('a')[0];
                    a.innerText = c;
                    // var b = cell.getElementsByClassName('b')[0];
                    // b.innerText = c;
                    cell.classList.remove('past');
                    cell.classList.remove('now');
                    cell.classList.remove('future');
                    
                    if (c === info.num) {
                        cell.classList.add('now');
                    } else if (c < info.num) {
                        cell.classList.add('past');
                    } else {
                        cell.classList.add('future');
                        // cell.classList.remove('selectedCell');
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

