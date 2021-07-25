const machineId = require('node-machine-id')

function getMachineId() {
    return machineId.machineIdSync()
}

module.exports.getMachineId = getMachineId
