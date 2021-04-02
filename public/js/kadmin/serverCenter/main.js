/*
* *******************************************************************************************
* @author:  Oliver Kaufmann (Kyri123)
* @copyright Copyright (c) 2019-2020, Oliver Kaufmann
* @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
* Github: https://github.com/Kyri123/KAdmin-ArkLIN2
* *******************************************************************************************
*/
"use strict"

let joinAdress          = $('#btnJoin').attr('href')
let opList              = false
let whiteList           = false
let banList             = {}
let old_alerts          = undefined
let serverIsInstalled   = false
let steamAPI_Players    = {}
$.get('/json/steamAPI/players.json')
   .done((data) => {
       steamAPI_Players = data
   })

// Vue Serverlist
const VUE_serverCenterHead = new Vue({
    el      : '#serverCenterHead',
    data    : {
        logoBorder      : "border-dark",
        logo            : "/img/logo/logo.png",
        bglogo          : "/img/backgrounds/sc.jpg",
        infoCounter     : 0,
        infoArray       : [],
        clusterInfos    : {},
        state           : "...",
        stateClass      : "description-header text-dark",
        action          : "...",
        actionClass     : "description-header text-dark",
        version         : "...",
        player          : "...",
        playerArray     : [],
        playerAlert     : alerter(2000, "", 3, false, 3, 3, 3, true),
        max             : 0,
        maxis           : 0,
        maxfiles        : 0,
        maxfilesis      : 0,
        maxmemory       : 0,
        memory          : 0,
        cpuUsage        : 0,
        actionParam     : []
    },
    methods: {
        /**
         * Erstellt Informationen über den Server und trägt die Daten ins Frontend ein
         */
        getSCState() {
            $.get('/ajax/serverCenterAny', {
                "getserverinfos": true,
                "server": varser.cfg
            }, (data) => {
                let serverInfos     = JSON.parse(data)
                let inhalt

                VUE_serverCenterHead.max            = serverInfos.backup.max * 1024 * 1024
                VUE_serverCenterHead.maxis          = serverInfos.backup.maxis
                VUE_serverCenterHead.maxfiles       = serverInfos.backup.maxCount
                VUE_serverCenterHead.maxfilesis     = serverInfos.backup.maxCountis
                VUE_serverCenterHead.maxmemory      = serverInfos.maxmemory * 1024 * 1024
                VUE_serverCenterHead.memory         = serverInfos.memory
                VUE_serverCenterHead.cpuUsage       = serverInfos.cpuUsage

                // Serverstatus (Farbe)
                let                                                                             stateColor  = "danger"
                if(!serverInfos.is_installed)                                                   stateColor  = "warning"
                if(serverInfos.pid !== 0 && serverInfos.online)                                 stateColor  = "success"
                if((serverInfos.pid !== 0 && !serverInfos.online) || !serverInfos.isFree)       stateColor  = "primary"
                if(serverInfos.is_installing)                                                   stateColor  = "info"

                serverIsInstalled = serverInfos.is_installed

                VUE_serverCenterHead.logo           = serverInfos.icon
                VUE_serverCenterHead.bglogo         = serverInfos.bgicon
                VUE_serverCenterHead.state          = varser.lang_arr.forservers.state[stateColor]
                VUE_serverCenterHead.stateClass     = `description-header text-${stateColor}`
                VUE_serverCenterHead.logoBorder     = `border-${stateColor}`

                // Versionserfassung
                VUE_serverCenterHead.version        = serverInfos.version

                // Cluster erfassung
                VUE_serverCenterHead.clusterInfos.clusterIsIn        = serverInfos.clusterIsIn
                VUE_serverCenterHead.clusterInfos.clusterType        = serverInfos.clusterType
                VUE_serverCenterHead.clusterInfos.clusterName        = serverInfos.clusterName

                // Action Card
                let css         = 'danger'
                inhalt          = varser.lang_arr.servercenter_any.actionClose

                if(serverInfos.isFree && hasPermissions(globalvars.perm, "actions", varser.cfg)) {
                    inhalt      = `<a href="javascript:void()" class="small-box-footer btn btn-sm btn-success" data-toggle="modal" data-target="#action">${varser.lang_arr.servercenter_any.actionFree}</a>`
                    css         = "success"
                }

                VUE_serverCenterHead.action          = inhalt
                VUE_serverCenterHead.actionClass     = `description-header text-${css}`

                // Spielerliste
                // Button & Anzeige
                VUE_serverCenterHead.player = `${serverInfos.aplayers} / ${serverInfos.players}`
                if(stateColor === "success") {
                    VUE_serverCenterHead.player = hasPermissions(globalvars.perm, "showplayers", varser.cfg)
                       ? `<a href="#" data-toggle="modal" data-target="#playerlist_modal" class="btn btn-sm btn-primary">${serverInfos.aplayers} / ${serverInfos.players}</a>`
                       : `${serverInfos.aplayers} / ${serverInfos.players}`
                }

                // Liste
                VUE_serverCenterHead.playerArray    = []
                let steamInfos  = steamAPI_Players.nameList ? steamAPI_Players.nameList : {}
                serverInfos.aplayersarr.sort((a, b) => (a.name < b.name) ? 1 : -1)
                for(let item of serverInfos.aplayersarr) {
                    let isOP    = "false"
                    for(let op of opList)
                        if(op.uuid === item.id) isOP = true

                    item.img                = steamInfos[item.name] ? steamInfos[item.name].avatar : '/img/unknown.png'
                    item.url                = steamInfos[item.name] ? steamInfos[item.name].profileurl : '#'
                    // todo: WIP
                    /*item.isOP               = isOP
                    item.isOPIcon           = isOP ? "fas fa-angle-double-down" : "fas fa-angle-double-up"
                    item.isOPText           = globalvars.lang_arr["servercenter_any"].playermodal[isOP]
                    item.isOPColor          = `text-${isOP ? "success" : "danger"}`
                    item.canSendCommands    = hasPermissions(globalvars.perm, "sendCommands", varser.cfg)*/
                    VUE_serverCenterHead.playerArray.push(item)
                }

                VUE_serverCenterHead.playerAlert = VUE_serverCenterHead.playerArray.length === 0
                   ? alerter(2000, "", 3, false, 3, 3, 3, true)
                   : ""

                // Alerts
                if(serverInfos.alerts !== undefined) {
                    if(old_alerts === undefined) old_alerts = serverInfos.alerts
                    if(JSON.stringify(old_alerts) !== JSON.stringify(serverInfos.alerts)) {
                        fireToast(20, "info")
                        old_alerts = serverInfos.alerts
                    }

                    VUE_serverCenterHead.infoArray   = []
                    VUE_serverCenterHead.infoCounter = 0

                    serverInfos.alerts.forEach((val) => {
                        VUE_serverCenterHead.infoArray.push({alert: alerter(val, "", 3, false, 3, 3, 3, true)})
                        if(val !== "4000") VUE_serverCenterHead.infoCounter++
                    })
                }
                else {
                    if(old_alerts === undefined) old_alerts = []
                    if(!old_alerts.equals(serverInfos.alerts)) {
                        fireToast(20, "info")
                        old_alerts = []
                    }

                    VUE_serverCenterHead.infoArray   = []
                    VUE_serverCenterHead.infoCounter = 0
                    VUE_serverCenterHead.infoArray.push({alert: alerter("4000", "", 3, false, 3, 3, 3, true)})
                }
            })
        }
    },
    created () {
        this.getSCState()
        this.getInfosInterval  = setInterval(() => this.getSCState(), 2000)
    },
})

// Wenn Aktion Modal geöffnet wird
$('#action').on('show.bs.modal', () => {
    // Selects
    $.get('/json/sites/serverCenterActions.cfg.json' , (datas) => {
        let sels    = datas.actions
        let id      = "#action_sel"
        $(id).html(`<option value="">${varser.lang_arr.all.select_default}</option>`)
        sels.forEach(item => {
            if(!serverIsInstalled && item === "install") {
                $(id).append(`<option value="${item}">${varser.lang_arr.forservers.commands[item]}</option>`)
            }
            else if(serverIsInstalled && item !== "install") {
                $(id).append(`<option value="${item}">${varser.lang_arr.forservers.commands[item]}</option>`)
            }
        })
    })
})

// Sende Aktionen
$("#action_form").submit(() => {
    var valid = true

    // Ist alles OK
    if(valid) {
        $("#action_sel").toggleClass('is-invalid', false)
        $("#beta").toggleClass('is-invalid', false)

        // führe Aktion aus
        $.post(`/ajax/serverCenterAny`, $('#action_form').serialize())
            .done(function(data) {
                try {
                    data = JSON.parse(data)
                    if (data.code !== 404) {
                        $("#action_resp").html(data.msg)
                        $("#all_resp").html(data.msg)
                        $('#action').modal('hide')
                        $('.modal-backdrop').remove()
                        VUE_serverCenterHead.actionParam = {}

                        $("#action_sel").prop('selectedIndex',0)
                        $('#actioninfo').toggleClass('d-none', true)
                        fireToast(15)
                        if(varser.expert) {
                            $('#custom_command').val('')
                            $("#forcethis").prop('checked', false)
                        }
                    }
                }
                catch (e) {
                    fireToast(16, "error")
                    $('#action').modal('hide')
                    $('.modal-backdrop').remove()
                }
            })
    }
    return false
})

// Parameter erstellen
$('#action_sel').change(() => {
    let action = $("#action_sel").val()
    $.get('/json/sites/serverCenterActions.cfg.json', (datas) => {
        let parm        = datas.parameter
        let array       = []

        parm.forEach((val) => {
            if(val.for.includes(action)) {
                let parameter = {}
                parameter.value = val.parameter
                parameter.text = varser.lang_arr.forservers.parameter[val.id_js.replaceAll('#', '')]
                parameter.type = val.type
                parameter.id = val.id_js

                array.push(parameter)
            }
        })
        VUE_serverCenterHead.actionParam = array

    })
})

// von: https://gist.github.com/anazard/d42354f45e172519c0be3cead34fe869
// {
    let $body               = document.getElementsByTagName('body')[0]
    let $btnCopy            = document.getElementById('btnCopy')
    let secretInfo          = document.getElementById('secretInfo').innerHTML

    const copyToClipboard   = (secretInfo) => {
        let $tempInput      = document.createElement('INPUT')
        $body.appendChild($tempInput)
        $tempInput.setAttribute('value', secretInfo)
        $tempInput.select()
        document.execCommand('copy')
        $body.removeChild($tempInput)
    }

    $btnCopy.addEventListener('click', (ev) => {
        copyToClipboard(secretInfo)
        alert("Kopiert: " + secretInfo)
    })
// }

/**
 * Sende Spieleraktion an den die Serverkonsole
 * @param {string} uuid
 * @param {string} name
 * @param {string} action
 * @param {string} isop
 */
function playeraction(uuid, name, action, isop = "false") {
    let command = ""

    if(action === "kick") {
        command = `kick ${name}`
    }
    else if(action === "ban") {
        command = `ban ${name}`
    }

    let postObj = {
        "sendPlayerAction"  : true,
        "command"           : command,
        "server"            : vars.cfg
    }
    $.post('/ajax/serverCenterAny', postObj, (data) =>
        fireToast(data === "true" ? 15 : 16, data === "true" ? "success" : "error")
    )
}