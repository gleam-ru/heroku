module.exports.routes = {

    //
    // Main page
    //
    'get  /': 'Main',



    //
    // Profile page
    //
    'get  /me': 'Profile',


    // Settings
    'get  /settings'              : 'Settings',
    //---
    'post /settings/update'      : 'Settings.update',

    // Auth
    'get  /auth'                  : 'Auth',
    'get  /logout'                : 'Auth.logout',
    'get  /auth/:strategy'        : 'Auth.addStrategy',
    'get  /auth/:strategy/remove' : 'Auth.removeStrategy',
    //---
    'post /auth/:action'  : 'Auth.action', // 'login', 'register'



    //
    // Services
    //
    'get  /services': 'Services',

    // Bonds
    'get  /services/bonds'               : 'Bonds',
    'get  /services/bonds/help'          : 'Bonds.help',
    'get  /services/bonds/all'           : 'Bonds.bonds',
    'get  /services/bonds/filters'       : 'Bonds.filters',
    'get  /services/bonds/additional'    : 'Bonds.additional',
    //---
    'post /services/bonds/updateFilter' : 'Bonds.updateFilter',

    // Shares
    'get  /services/shares'              : 'Shares',
    'get  /services/shares/:href'        : 'Shares.ticker',
    'get  /services/shares/:id/edit'     : 'Shares.editorPage', // админка
    'get  /services/shares/:id/info'     : 'Shares.getTickerData', // апи
    'get  /services/shares/branch/:id'   : 'Shares.branchPage', // "финансы", "нефтегаз" и пр.
    //---
    'post /services/shares/:id/update'     : 'Shares.updateGeneral',
    'post /services/shares/:id/new_update' : 'Shares.newUpdate',
    'post /services/shares/:id/parse_divs' : 'Shares.parseDivs',

    // Sunburst
    'get  /services/sunburst': 'Shares.sunburst',
    //

    // фильтры таблички
    'post /API/usersettings'               : 'API.updateUserSettings',
    'post /API/parse_divs'                 : 'Shares.parseDivs',
    'post /API/update_all_shares_candles'  : 'Admin.updateAllCandles',
    //



    //
    // About page
    //
    'get  /about'              : 'About',
    'get  /about/feedback'     : 'About.feedback',
    'get  /about/donation'     : 'About.donation',
    'get  /about/donation/thx' : 'About.thx',



    //
    // Admin
    //
    'get  /adm'                    : 'Admin',
    'get  /adm/bonds_reparse'      : 'Admin.bonds_reparse',
    'get  /adm/bonds_cache'        : 'Admin.bonds_cache',
    'get  /adm/users'              : 'Admin.all_users',
    'get  /adm/domains'            : 'Admin.domains',
    'get  /adm/domains/:domain'    : 'Admin.edit_domain',
    'post /API/domain'             : 'Admin.update_domain_record',
    'get  /adm/users/:id/edit'     : 'Admin.userEditor',
    //---
    'get  /adm/shares_updateInday' : 'Admin.shares_updateInday',
    'get  /adm/shares_cache'       : 'Admin.shares_cache',
    'get  /adm/shares_dropCache'   : 'Admin.shares_dropCache',
    //---
    'get  /adm/mongodump'          : 'Admin.mongodump',
    'post /adm/mongorestore'       : 'Admin.mongorestore',
    //---
    'post /adm/users'              : 'Admin.updateUserData',





    //  ╔╦╗╔═╗╔═╗╔╦╗
    //   ║ ║╣ ╚═╗ ║
    //   ╩ ╚═╝╚═╝ ╩
    'get  /403': {response: 'forbidden'},
    'get  /404': {response: 'notFound'},
    'get  /500': {response: 'serverError'},

    'get  /test': 'Main.test',

};
