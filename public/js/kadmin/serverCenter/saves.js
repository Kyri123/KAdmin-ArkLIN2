/*
* *******************************************************************************************
* @author:  Oliver Kaufmann (Kyri123)
* @copyright Copyright (c) 2019-2020, Oliver Kaufmann
* @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
* Github: https://github.com/Kyri123/KAdmin-ArkLIN2
* *******************************************************************************************
*/
"use strict"
let VUE_savesContainer = new Vue({
    el      : '#savesContainer',
    data    : {
        steamAPI_ID         : {},
        steamAPI_NAME       : {},
        savegamesPlayer     : [],
        savegamesTribe      : [],
        savegamesMaps       : [],
        listFiles           : [],
        listSavegames       : true,
        listTribes          : false,
        listMaps            : false,
        list                : []
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
            $.get(`/json/savegames/tibes/${vars.cfg}.json`, (response) => this.savegamesTribe = response)

            // Lade Spieler Daten
            $.get(`/json/savegames/players/${vars.cfg}.json`, (response) => this.savegamesPlayer = response)

            // Lade Spieler Daten
            $.get(`/json/savegames/maps/${vars.cfg}.json`, (response) => this.savegamesMaps = response)

            if(this.listTribes) {
                if(Array.isArray(this.savegamesTribe))
                    this.list   = this.savegamesTribe
            }
            else if(this.listMaps) {
                if(Array.isArray(this.savegamesMaps))
                    this.list   = this.savegamesMaps
            }
            else {
                if(Array.isArray(this.savegamesPlayer))
                    this.list   = this.savegamesPlayer
            }

            console.log("list", this.list)
            console.log("steam", this.steamAPI_ID)
        },

        // sendet eine Anfrage die vorher bestätigt werden muss
        sendActionWithAccept(modalCode, type = "question") {
            fireFormModal(modalCode, type, (result) => {
                console.log(result)
            }, {
                swalOptions: {
                    cancelButtonText: "123"
                }
            })
        }
    },
    created() {
        this.reloadInfos()
        setInterval(() => this.reloadInfos(), 1000)
    }
})