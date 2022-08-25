const fs = require('fs');
const path = require('path');

const exportDAG = async function (dag) {
    const leaves = dag.dag_stats();

    fs.writeFileSync(path.join(path.resolve("."), '/DAG/DAG.json'), [], 'utf8', (_err) => {

        if (_err) {
            console.log(`Error writing file: ${_err}`);
        } else {
            console.log(`File is written successfully!`);
        }

    });

    for (let i = 1; i < leaves; i++) {
        const block = dag.dag_getBlock(i);

        const data = fs.readFileSync(path.join(path.resolve("."), '/DAG/DAG.json'), 'utf8');

        console.log(data);
        const blockList = JSON.parse(data);
        blockList.push({ paymentID: block.paymentID, buyerAddress: block.buyerAddress, toAddress: block.toAddress, value: block.value });
        console.log(blockList);
        fs.writeFileSync(path.join(path.resolve("."), '/DAG/DAG.json'), JSON.stringify(blockList), 'utf8', (_err) => {

            if (_err) {
                console.log(`Error writing file: ${_err}`);
            } else {
                console.log(`File is written successfully!`);
            }

        });
    }
}

const importDAG = async function (dag) {
    fs.readFileSync(path.join(path.resolve("."), '/DAG/DAG.json'), function (err, data) {
        const blockList = JSON.parse(data);
        for (let i = 0; i < blockList.length; i++) {
            dag.dag_pushNewBlock(blockList[i].paymentID, blockList[i].buyerAddress, blockList[i].toAddress, blockList[i].value);
        }
    })
}

module.exports = { exportDAG, importDAG }