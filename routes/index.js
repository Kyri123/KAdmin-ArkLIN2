/*
 * *******************************************************************************************
 * @author:  Oliver Kaufmann (Kyri123)
 * @copyright Copyright (c) 2021, Oliver Kaufmann
 * @license MIT License (LICENSE or https://github.com/Kyri123/KAdmin-ArkLIN2/blob/master/LICENSE)
 * Github: https://github.com/Kyri123/KAdmin-ArkLIN2
 * *******************************************************************************************
 */
"use strict"

const router                                       = require('express').Router();
let {isNotLoggedIn, isLoggedIn, logout, checkPerm} = require('./middleware/user')
let {isServerExsits}                               = require('./middleware/server')

// Not LOGEDIN
// Account erstellung
router.use(
   '/reg',
   isNotLoggedIn,
   require('./pages/session_reg')
)

// Login
router.use(
   '/login',
   isNotLoggedIn,
   require('./pages/session_login')
)

// Allgemeine Seiten
router.use(
   '/home',
   isLoggedIn,
   require('./pages/home')
)
router.use(
   '/changelog',
   isLoggedIn,
   require('./pages/changelog')
)
router.use(
   '/usersettings',
   isLoggedIn,
   require('./pages/usersettings')
)
router.use(
   '/grouppanel', checkPerm('all/is_admin'),
   isLoggedIn,
   require('./pages/groupPanel')
)
router.use(
   '/userpanel',
   isLoggedIn, checkPerm('cluster/show'),
   require('./pages/userPanel')
)
router.use(
   '/servercontrolcenter',
   isLoggedIn, checkPerm('servercontrolcenter/show'),
   require('./pages/serverControlCenter')
)
router.use(
   '/config',
   isLoggedIn, checkPerm('all/is_admin'),
   require('./pages/config')
)
router.use(
   '/cluster',
   isLoggedIn, checkPerm('cluster/show'),
   require('./pages/cluster')
)

// Server Center
router.use(
   '/servercenter/:name/backups',
   isLoggedIn, isServerExsits,
   require('./pages/servercenter/serverCenter_backups')
)
router.use(
   '/servercenter/:name/config',
   isLoggedIn, isServerExsits,
   require('./pages/servercenter/serverCenter_config')
)
router.use(
   '/servercenter/:name/home',
   isLoggedIn, isServerExsits,
   require('./pages/servercenter/serverCenter_home')
)
router.use(
   '/servercenter/:name/filebrowser',
   isLoggedIn, isServerExsits,
   require('./pages/servercenter/serverCenter_filebrowser')
)
router.use(
   '/servercenter/:name/mods',
   isLoggedIn, isServerExsits,
   require('./pages/servercenter/serverCenter_mods')
)
router.use(
   '/servercenter/:name',
   isLoggedIn, isServerExsits,
   require('./pages/servercenter/serverCenter')
)

// ajax
router.use(
   '/ajax/usersettings',
   isLoggedIn,
   require('./ajax/usersettings')
)
router.use(
   '/ajax/userpanel',
   isLoggedIn, checkPerm('userpanel/show'),
   require('./ajax/userPanel')
)
router.use(
   '/ajax/grouppanel',
   isLoggedIn, checkPerm('all/is_admin'),
   require('./ajax/groupPanel')
)
router.use(
   '/ajax/servercontrolcenter',
   isLoggedIn, checkPerm('servercontrolcenter/show'),
   require('./ajax/serverControlCenter')
)
router.use(
   '/ajax/all',
   isLoggedIn,
   require('./ajax/all')
)
router.use(
   '/ajax/config',
   isLoggedIn, checkPerm('all/is_admin'),
   require('./ajax/config')
)
router.use(
   '/ajax/cluster',
   isLoggedIn, checkPerm('cluster/show'),
   require('./pages/cluster')
)

// ajax - ServerCenter
router.use(
   '/ajax/serverCenterHome',
   isLoggedIn,
   require('./ajax/servercenter/serverCenterHome')
)
router.use(
   '/ajax/serverCenterAny',
   isLoggedIn,
   require('./ajax/servercenter/serverCenterAny')
)
router.use(
   '/ajax/serverCenterBackups',
   isLoggedIn,
   require('./ajax/servercenter/serverCenterBackups')
)
router.use(
   '/ajax/serverCenterConfig',
   isLoggedIn,
   require('./ajax/servercenter/serverCenterConfig')
)
router.use(
   '/ajax/serverCenterFilebrowser',
   isLoggedIn,
   require('./ajax/servercenter/serverCenterFilebrowser')
)
router.use(
   '/ajax/serverCenterMods',
   isLoggedIn,
   require('./ajax/servercenter/serverCenterMods')
)

// Error seiten
router.use(
   '/404',
   require('./pages/404')
)
router.use(
   '/401',
   require('./pages/401')
)

// Ausloggen
router.use(
   '/logout',
   isLoggedIn, logout
)

// / darf nicht so stehen > zu /home außer wenn !LoggedIn /login
router.all('/', isLoggedIn, (req, res, next) => {
   res.redirect('/home')
   return true
})

// 404
router.all('*', (req, res, next) => {
   res.redirect('/404')
   return true
})

module.exports = router
