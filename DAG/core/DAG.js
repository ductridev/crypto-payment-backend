const { MerkleTree } = require('merkletreejs')
const keccak256 = require('keccak256');
const { hex_to_ascii, ascii_to_hex } = require('../utils/basicUtils');
const Block = require('./Block');

class DAG {
    constructor() {
        this.key = 'DUCTRIDEV!';

        const root = ['rootBlock'].map(x => keccak256(x));
        this.tree = new MerkleTree(root, keccak256);
    }

    dag_getLastBlock() {
        let lastBlock = hex_to_ascii(this.tree.bufferToHex(this.tree.getLeaf(this.tree.getLeafCount() - 1)));
        return JSON.parse(lastBlock.replace(lastBlock.charAt(0), ''));
    }

    dag_stats() {
        return this.tree.getLeafCount();
    }

    dag_allBlock() {
        return this.tree.toString();
    }

    dag_getBlock(blockNumber) {
        if (typeof blockNumber === 'number') {
            let block = hex_to_ascii(this.tree.bufferToHex(this.tree.getLeaf(blockNumber)));
            return JSON.parse(block.replace(block.charAt(0), ''));
        }
        else {
            return "Invalid Parameters";
        }
    }

    dag_pushNewBlock(paymentID, buyerAddress, toAddress, value) {
        if (typeof paymentID !== 'undefined' || typeof buyerAddress !== 'undefined' || typeof toAddress !== 'undefined' || typeof value !== 'undefined') {

            const leaves = this.tree.getLeaves();
            const root = this.tree.getRoot();
            const leavesCount = this.tree.getLeafCount();

            let verified;

            if (leavesCount > 3) {
                verified = this.dag_verifyMultiBlock(leavesCount, root, leaves);
            }
            else {
                verified = this.dag_verifySingleBlock(leavesCount, root, leaves);
            }

            if (verified) {
                const proof = this.tree.getProof(leaves[leavesCount - 1])
                let block = new Block(paymentID, buyerAddress, toAddress, value, proof);
                this.tree.addLeaf(Buffer.from(JSON.stringify(block)));
                return block;
            }
            else {
                return "Verify previous block failed";
            }
        }
        else {
            return "Parameter is missing!";
        }
    }

    dag_verifyMultiBlock(leavesCount, root, leaves) {
        const proofIndices = [leavesCount - 3, leavesCount - 2, leavesCount - 1];
        const treeFlat = this.tree.getLayersFlat();
        const proofLeaves = proofIndices.map(i => leaves[i]);
        const proof = this.tree.getMultiProof(treeFlat, proofIndices);
        const verified = this.tree.verifyMultiProof(root, proofIndices, proofLeaves, leavesCount, proof);
        return verified;
    }

    dag_verifySingleBlock(leavesCount, root, leaves) {
        const proof = this.tree.getProof(leaves[leavesCount - 1]);
        const verified = this.tree.verify(proof, leaves[leavesCount - 1], root);
        return verified;
    }
}

module.exports = DAG;