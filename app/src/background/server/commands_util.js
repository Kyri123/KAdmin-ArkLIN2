/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2020-2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

//const rcon                  = require('rcon')
const shell                 = require('./shell')

module.exports = {

    /**
     * sendet ein Befehl zum Screen
     * @param {string} server Server Name
     * @param {string} command
     * @param server
     */
    sendToScreen(server, command) {
        let serverData  = new serverClass(server)
        if(serverData.serverExsists() && shell.runSyncSHELL('screen -list').toString().includes(`.kadmin-${server}`)) {
            let info            = serverData.getServerInfos()
            command             = command
                .replaceAll("%20", " ")
                .replaceAll("%E4", "ä")
                .replaceAll("%F6", "ö")
                .replaceAll("%FC", "ü")
                .replaceAll("%C4", "Ä")
                .replaceAll("%D6", "Ö")
                .replaceAll("%DC", "Ü")
                .replaceAll("%C3", "{")
                .replaceAll("%3E", "}")
            return info.pid !== 0 ? shell.runSHELL(`screen -S kadmin-${server} -p 0 -X stuff "${command}^M"`) : false
        }
        return false
    },
}