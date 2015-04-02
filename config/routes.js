module.exports.routes = {

    '/'        : {view: 'index'},

    /**
     * Необязательно... только чтобы посмотреть страницы
     */
    '/403'     : {response: 'forbidden'},
    '/404'     : {response: 'notFound'},
    '/500'     : {response: 'serverError'},

};
