/*
* *******************************************************************************************
* @author:  Oliver Kaufmann (Kyri123)
* @copyright Copyright (c) 2019-2020, Oliver Kaufmann
* @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
* Github: https://github.com/Kyri123/KAdmin-ArkLIN2
* *******************************************************************************************
*/
"use strict"
let VUE_configContainer = new Vue({
    el      : '#savesContainer',
    data    : {
        steamAPI_ID         : {},
        steamAPI_NAME       : {},
        savegames_Player    : {},
        savegames_Tribe     : {}
    },
    methods: {
        /**
         * Läd alle nötigen Infomationen in VUE ein
         */
        reloadInfos() {
            // Lade SteamAPI Json
            $.get('/json/steamAPI/players.json', (response) => {
                if(response) {
                    if (response.idList)
                        this.steamAPI_ID = response.idList
                    if (response.idList)
                        this.steamAPI_ID = response.idList
                }
            })

            // Lade Tribe Daten
            $.get(`/json/savegames/tibes/${vars.cfg}.json`, (response) => this.savegames_Tribe = response)

            // Lade Spieler Daten
            $.get(`/json/savegames/players/${vars.cfg}.json`, (response) => this.savegames_Player = response)
        }
    },
    created() {
        this.reloadInfos()
        setInterval(() => this.reloadInfos(), 5000)
    }
})