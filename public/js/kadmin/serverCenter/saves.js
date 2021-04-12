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
        infoModal           : {},
        savegamesPlayer     : [],
        savegamesTribe      : [],
        savegamesMaps       : [],
        listFiles           : [],
        listSavegames       : true,
        listTribes          : false,
        listMaps            : false,
        list                : [],
        tmp                 : ""
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
        },

        /**
         * gibt das Object vom Spieler
         * @param {string|number} name Name oder ID
         * @return {object}
         */
        getSavegameInfos(name) {
            let obj = {}
            for (const char of this.savegamesPlayer) {
                if(char.CharacterName === name || char.PlayerId === name)
                    obj    = char
            }
            return obj
        },

        /**
         * Öffnet das InfoModal
         * @param fileInfos
         * @param isSavegame
         */
        openInfoModal(fileInfos) {
            this.infoModal = fileInfos
            console.log(this.infoModal, this.savegamesTribe, this.savegamesPlayer)
            setTimeout(() => $('#infoModal').modal('show'), 500)
        },

        /**
         * sendet eine Anfrage die vorher bestätigt werden muss
         * @param {string|number} modalCode
         * @param {string} type
         * @param {string} confirmButtonText
         * @param {object} datas
         */
        sendActionWithAccept(modalCode, type = "question", confirmButtonText = '<i class="fas fa-save"></i>', datas) {
            let options = {
                swalOptions: {
                    confirmButtonText: confirmButtonText
                }
            }

            if(datas.swalText) {
                options.swalOptions.text = datas.swalText
                delete datas.swalText
            }

            fireFormModal(modalCode, type, (result) => {
                if(result.isConfirmed && !result.isDenied) {
                    $.post('/ajax/serverCenterSaves', datas)
                       .then((response) => {
                           response = JSON.parse(response)
                           if(!response.success) {
                               fireToast("FAIL", "error")
                           }
                            else {
                                this.reloadInfos()
                                if(response.sendToast) {
                                    fireToast(response.Toast.code, response.Toast.type, response.Toast.options)
                                }
                           }
                       })
                       .fail(() => {
                           fireToast("FAIL", "error")
                       })
                }
            }, options)
        }
    },
    created() {
        this.reloadInfos()
        setInterval(() => this.reloadInfos(), 500)
    }
})