/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2020-2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

const { spawn, exec, execSync }  = require('child_process')

/**
 * Führt einen Befehl aus
 * @param {string} command
 * @return {boolean}
 */
function spawnShell(command) {
    try {
        spawn(command, { shell: true, detached: true })
        return true
    }
    catch (e) {
        if(debug) console.log('[DEBUG_FAILED]', e)
        return false
    }
}

module.exports  = {
    /**
     * Führt SHELL Command aus
     * @param {string} command CMD command
     * @param {string} screenName Screen Name
     * @returns {boolean}
     */
    runSHELLInScreen: (command, screenName) => {
        console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[36m runCMD > screen -mdS ${screenName} bash -c "${command}"`)
        return spawnShell(command)
    },

    /**
     * Führt SHELL Command aus
     * @param {string} command CMD command
     * @returns {boolean}
     */
    runSHELL: (command) => {
        console.log('\x1b[33m%s\x1b[0m', `[${dateFormat(new Date(), "dd.mm.yyyy HH:MM:ss")}]\x1b[36m runCMD > ${command}`)
        return spawnShell(command)
    },

    /**
     * Führt SHELL Command aus
     * @param {string} command CMD command
     * @returns {string}
     */
    runSyncSHELL: (command) => {
        return execSync(command).toString()
    },
}