/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

const router        = require('express').Router()
const globalinfos   = require('./../../app/src/global_infos')
const userHelper    = require('./../../app/src/sessions/helper')

router.route('/')

    .all((req,res)=>{
       let GET         = req.query
       let POST        = req.body
       let response    = ""
       let cookies     = req.cookies
       let langStr     = (cookies.lang !== undefined) ?
          fs.existsSync(pathMod.join(mainDir, "lang", cookies.lang)) ?
             cookies.lang : "de_de"
          : "de_de"
       let lang         = LANG[langStr]

        res.render('pages/usersettings', {
            lang            : lang,
            userID          : req.session.uid,
            perm            : userHelper.permissions(req.session.uid),
            page            : "usersettings",
            response        : response,
            sinfos          : globalinfos.get(),
            breadcrumb      : [
                lang.breadcrumb["usersettings"]
            ]
        })
    })

module.exports = router;