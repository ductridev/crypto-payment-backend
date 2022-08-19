const DAG = require('./DAG/core/DAG');
let _DAG;

module.exports = {
    initDAG: function () {
        _DAG = new DAG();
    },
    getDAG: function () {
        return _DAG;
    }
}