var Q = require('q');
var moment = require('moment');
var request = require('request');
var iConv = require('iconv-lite');
var $ = require('cheerio');
var me = {};
var ddf = 'DD.MM.YYYY';

// Данные от гуглофинансов:
// https://www.google.com/finance?ei=_d0gV_mWFcfrsgGI5JTYAQ#stockscreener
//
// name - ключ для запроса
// serverName - ключ в данных, которыми отвечает сервер
// title - название параметра
// desc - описание параметра
//
me.params = [
    {
        name: "change_today_percent",
        serverName: "QuotePercChange",
        type: "number",
        title: "Quote change (%)",
        desc: "The percent change between the stock price and the prior trading day's closing price.",
        desc_ru: "Процент изменения цены акции со вчерашней цены закрытия",
    }, {
        name: "price_to_book",
        serverName: "PriceToBook",
        type: "number",
        title: "Price to book",
        desc: "The stock price divided by book value per share.",
        desc_ru: "Отношение цены акции к балансовой стоимости за минусом долгов.",
    }, {
        name: "price_to_sales_trailing_12months",
        serverName: "PriceSales",
        type: "number",
        title: "Price to sales",
        desc: "The stock price divided by annual sales per share.",
        desc_ru: "Цена акции к выручке за последний год на акцию",
    }, {
        name: "last_price",
        serverName: "QuoteLast",
        type: "number",
        title: "Last price",
        desc: "The most recently reported trade price, which is not necessarily the most recently traded price.",
        desc_ru: "Последняя цена сделки",
    }, {
        name: "earnings_per_share",
        serverName: "EPS",
        type: "number",
        title: "EPS",
        desc: "The net income per share according to the most recent quarterly report.",
        desc_ru: "Выручка на акцию по последнему квартальному отчету",
    }, {
        name: "high_52week",
        serverName: "High52Week",
        type: "number",
        title: "52w high",
        desc: "The highest closing price in the last 52 weeks.",
        desc_ru: "Максимальная цена закрытия за год",
    }, {
        name: "low_52week",
        serverName: "Low52Week",
        type: "number",
        title: "52w low",
        desc: "The lowest closing price in the last 52 weeks.",
        desc_ru: "Минимальная цена закрытия за год",
    }, {
        name: "price_change_52week",
        serverName: "Price52WeekPercChange",
        type: "number",
        title: "52w price change (%)",
        desc: "The percent change in the price over the past year, plus or minus the nearest trading day.",
        desc_ru: "Процентное изменение цены акции за год.",
    }, {
        name: "average_50day_price",
        serverName: "Price50DayAverage",
        type: "number",
        title: "50d avg price",
        desc: "The average price over the last 50 tradable days.",
        desc_ru: "Средняя цена за 50 торговых дней",
    }, {
        name: "average_150day_price",
        serverName: "Price150DayAverage",
        type: "number",
        title: "150d avg price",
        desc: "The average price over the last 150 tradable days.",
        desc_ru: "Средняя цена за 150 торговых дней",
    }, {
        name: "average_200day_price",
        serverName: "Price200DayAverage",
        type: "number",
        title: "200d avg price",
        desc: "The average price over the last 200 tradable days.",
        desc_ru: "Средняя цена за 200 торговых дней",
    }, {
        name: "price_change_13week",
        serverName: "Price13WeekPercChange",
        type: "number",
        title: "13w price change (%)",
        desc: "The percent change in the price over the last thirteen weeks",
        desc_ru: "Процент изменения цены за последние тринадцать недель",
    }, {
        name: "price_change_26week",
        serverName: "Price26WeekPercChange",
        type: "number",
        title: "26w price change (%)",
        desc: "The percent change in the price over the last twenty six weeks",
        desc_ru: "Процент изменения цены за последние шесть недель",
    }, {
        name: "market_cap",
        serverName: "MarketCap",
        type: "number",
        title: "Market cap",
        desc: "Market capitalization is the total value of a company in the stock market. It is calculated by multiplying total shares outstanding by the current price per share.",
        desc_ru: "Рыночная капитализация (общая рыночная цена) компании, вычисленная по текущей цене акции",
    }, {
        name: "pe_ratio",
        serverName: "PE",
        type: "number",
        title: "P/E ratio",
        desc: "The ratio of the stock price to the sum of its reported earnings, which may or may not account for dilution, over the last 4 quarters.",
        desc_ru: "Мультипликатор Цена к Прибыли, который может быть взят за 4 квартала или за меньший отчетный период",
    }, {
        name: "forward_pe_1year",
        serverName: "ForwardPE1Year",
        type: "number",
        title: "1y fwd P/E",
        desc: "The stock price divided by a forecast of this year's earnings.",
        desc_ru: "Прогнозный мультипликатор Цена к Прогнозу прибыли за будущий год",
    }, {
        name: "dividend_recent_quarter",
        serverName: "DividendRecentQuarter",
        type: "number",
        title: "Div recent quarter",
        desc: "The dividend per share which was paid to shareholders in the most recent quarter.",
        desc_ru: "Сумма дивидендов, выплаченная на акцию в последнем квартале",
    }, {
        name: "dividend_next_quarter",
        serverName: "DividendNextQuarter",
        type: "number",
        title: "Div next quarter",
        desc: "The forecast value of the next quarterly dividend, per share, to be paid.",
        desc_ru: "Прогноз суммы дивидендов к выплате в следующем квартале",
    }, {
        name: "dividend_per_share",
        serverName: "DPSRecentYear",
        type: "number",
        title: "Div per share (Recent yr)",
        desc: "The sum of all dividends, per share, paid within the past year.",
        desc_ru: "Сумма всех дивидендов, выплаченных на акцию за последний год",
    }, {
        name: "dividend_next_year",
        serverName: "IAD",
        type: "number",
        title: "Div rate indicated annual",
        desc: "The forecast sum of all dividends, per share, to be paid in the coming year.",
        desc_ru: "Прогноз суммы дивидендов на акцию к следующем году",
    }, {
        name: "dividend_per_share_trailing_12months",
        serverName: "DividendPerShare",
        type: "number",
        title: "Div per share",
        desc: "Dividend per share is the total amount of dividend that shareholders receive over one year for each share owned.",
        desc_ru: "ДИвиденды на акцию за 365/366 дней владения",
    }, {
        name: "dividend_yield",
        serverName: "DividendYield",
        type: "number",
        title: "Div yield (%)",
        desc: "The value of the most recent dividend per share, multiplied by the number of times per year which dividends are typically paid, divided by the stock price.",
        desc_ru: "Грубый прогноз годовой дивидендной доходность в процентах от стоимости акции",
    }, {
        name: "dividend_recent_year",
        serverName: "Dividend",
        type: "number",
        title: "Div from cash flow",
        desc: "A dividend is a portion of a company's profit paid to common and preferred shareholders.",
        desc_ru: "Доля дивидендов от прибыли компании.",
    }, {
        name: "book_value_per_share_year",
        serverName: "BookValuePerShareYear",
        type: "number",
        title: "Book value/share",
        desc: "A company's total assets minus its total liabilities, expressed per share.",
        desc_ru: "Балансовая стоимость на акцию: cтоимость активов за вычетом долгов в расчете на акцию",
    }, {
        name: "cash_per_share_year",
        serverName: "CashPerShareYear",
        type: "number",
        title: "Cash/share",
        desc: "The sum of cash and equivalents, such as liquid money market securities, expressed per share.",
        desc_ru: "Стоимость ликвидных активов(наличные, облигации) на акцию",
    }, {
        name: "current_assets_to_liabilities_ratio_year",
        serverName: "CurrentRatioYear",
        type: "number",
        title: "Current ratio",
        desc: "The ratio of current assets divided by current liabilities. Current ratio is a measure of liquidity.",
        desc_ru: "Коэффициент текущей ликвидности: отношение оборотных активов к краткосрочных обязательствам",
    }, {
        name: "longterm_debt_to_assets_year",
        serverName: "LTDebtToAssetsYear",
        type: "number",
        title: "LT debt/assets (Recent yr) (%)",
        desc: "Total Long Term Debt for the most recent fiscal year divided by the Total Assets for same period.",
        desc_ru: "Доля долгосрочной задолженности к стоимости активов по годовому отчету",
    }, {
        name: "longterm_debt_to_assets_quarter",
        serverName: "LTDebtToAssetsQuarter",
        type: "number",
        title: "LT debt/assets (Recent qtr) (%)",
        desc: "Total Long Term Debt for the most recent quarter divided by the Total Assets for the same period.",
        desc_ru: "Доля долгосрочной задолженности к стоимости активов по квартальному отчету",
    }, {
        name: "total_debt_to_assets_year",
        serverName: "TotalDebtToAssetsYear",
        type: "number",
        title: "Total debt/assets (Recent yr) (%)",
        desc: "Total Debt for the most recent fiscal year divided by Total Assets for the same period.",
        desc_ru: "Отношение задолженности(краткосрочной+долгосрочной) к активам по годовому отчету",
    }, {
        name: "total_debt_to_assets_quarter",
        serverName: "TotalDebtToAssetsQuarter",
        type: "number",
        title: "Total debt/assets (Recent qtr) (%)",
        desc: "Total Debt for the most recent quarter divided by Total Assets for the same period.",
        desc_ru: "Отношение всей задолженности к активам по квартальному отчету",
    }, {
        name: "longterm_debt_to_equity_year",
        serverName: "LTDebtToEquityYear",
        type: "number",
        title: "LT debt/equity (Recent yr) (%)",
        desc: "Total Long Term Debt for the most recent fiscal year divided by Total Shareholder Equity for the same period.",
        desc_ru: "Отношение долгосрочной задолженности к акционерному капиталу по годовому отчету",
    }, {
        name: "longterm_debt_to_equity_quarter",
        serverName: "LTDebtToEquityQuarter",
        type: "number",
        title: "LT debt/equity (Recent qtr) (%)",
        desc: "Total Long Term Debt for the most recent quarter divided by Total Shareholder Equity for the same period.",
        desc_ru: "Отношение долгосрочной задолженности к акционерному капиталу по квартальному отчету",
    }, {
        name: "total_debt_to_equity_year",
        serverName: "TotalDebtToEquityYear",
        type: "number",
        title: "Total debt/equity (Recent yr) (%)",
        desc: "Total Debt for the most recent fiscal year divided by Total Shareholder Equity for the same period.",
        desc_ru: "Коэффициент финансовой зависимости: Отношение задолженности к акционерному капиталу по годовому отчету",
    }, {
        name: "total_debt_to_equity_quarter",
        serverName: "TotalDebtToEquityQuarter",
        type: "number",
        title: "Total debt/equity (Recent qtr) (%)",
        desc: "Total Debt for the most recent quarter divided by Total Shareholder Equity for the same period.",
        desc_ru: "Коэффициент финансовой зависимости: Отношение задолженности к акционерному капиталу по квартальному отчету",
    }, {
        name: "interest_coverage_year",
        serverName: "AINTCOV",
        type: "number",
        title: "Interest coverage",
        desc: "Also known as Times Interest Earned, this is the ratio of Earnings Before Interest and Taxes for the most recent year divided by the Interest Expense for the same period.",
        desc_ru: "Коэффицие?нт покры?тия проце?нтов: прибыль до выплаты процентов по кредиту и уплаты налогов к издержками по выплате процентов.",
    }, {
        name: "return_on_investment_trailing_12months",
        serverName: "ReturnOnInvestmentTTM",
        type: "number",
        title: "Return on investment (TTM) (%)",
        desc: "Trailing twelve month Income after taxes divided by the average (Total Long term Debt + Long term Liabilities + Shareholders Equity), expressed as a percentage.",
        desc_ru: "Возврат на инвестированный долгосрочный капитал: Прибыль после уплаты налогов к среднемесячному (за 12 месяцев) долгосрочному капиталу (Долгосрочная задолженность + Акционерный капитал)",
    }, {
        name: "return_on_investment_5years",
        serverName: "ReturnOnInvestment5Years",
        type: "number",
        title: "Return on investment (5 yr avg) (%)",
        desc: "Most recent 5y Avg. Income After Taxes divided by the average (Total Long term Debt + Long term Liabilities + Shareholders Equity), expressed as a percentage.",
        desc_ru: "Возврат на инвестированный долгосрочный капитал: Прибыль после уплаты налогов к среднемесячному (за 5 лет) долгосрочному капиталу (Долгосрочная задолженность + Акционерный капитал)",
    }, {
        name: "return_on_investment_year",
        serverName: "ReturnOnInvestmentYear",
        type: "number",
        title: "Return on investment (Recent yr) (%)",
        desc: "Annual Income After Taxes divided by the average (Total Long term Debt + Long term Liabilities + Shareholders Equity), expressed as a percentage.",
        desc_ru: "Возврат на инвестированный долгосрочный капитал: Прибыль после уплаты налогов к среднемесячному (за год) долгосрочному капиталу (Долгосрочная задолженность + Акционерный капитал)",
    }, {
        name: "return_on_assets_trailing_12months",
        serverName: "ReturnOnAssetsTTM",
        type: "number",
        title: "Return on assets (TTM) (%)",
        desc: "Trailing twelve month Income after taxes divided by the Average Total Assets, expressed as a percentage.",
        desc_ru: "Возврат на активы: Прибыль после уплаты налогов к среднемесячным (за 12 месяцев) активам",
    }, {
        name: "return_on_assets_5years",
        serverName: "ReturnOnAssets5Years",
        type: "number",
        title: "Return on assets (5 yr avg) (%)",
        desc: "Most recent 5y Avg. Income after taxes divided by the Average Total Assets, expressed as a percentage.",
        desc_ru: "Возврат на активы: Прибыль после уплаты налогов к средней величине (за 5 лет) активов",
    }, {
        name: "return_on_assets_year",
        serverName: "ReturnOnAssetsYear",
        type: "number",
        title: "Return on assets (Recent yr) (%)",
        desc: "Most recent Year Income after taxes divided by the Average Total Assets, expressed as a percentage.",
        desc_ru: "Возврат на активы: Прибыль после уплаты налогов к средней величине (за год) активов",
    }, {
        name: "return_on_equity_trailing_12months",
        serverName: "ReturnOnEquityTTM",
        type: "number",
        title: "Return on equity (TTM) (%)",
        desc: "Trailing twelve month Income divided by the Average Common Equity, expressed as a percentage.",
        desc_ru: "Возврат на капитал: Прибыль после уплаты налогов к средней величине (за 12 месяцев) акционерного капитала",
    }, {
        name: "return_on_equity_5years",
        serverName: "ReturnOnEquity5Years",
        type: "number",
        title: "Return on equity (5 yr avg) (%)",
        desc: "Most recent 5y Avg. Income divided by the Average Common Equity, expressed as a percentage.",
        desc_ru: "Возврат на капитал: Прибыль после уплаты налогов к средней величине (за 5 лет) акционерного капитала",
    }, {
        name: "return_on_equity_year",
        serverName: "ReturnOnEquityYear",
        type: "number",
        title: "Return on equity (Recent yr) (%)",
        desc: "Most recent fiscal year Income divided by the Average Common Equity, expressed as a percentage.",
        desc_ru: "Возврат на капитал: Прибыль после уплаты налогов к средней величине (за год) акционерного капитала",
    }, {
        name: "beta",
        serverName: "Beta",
        type: "number",
        title: "Beta",
        desc: "The measure of a fund's or a stock's risk in relation to the market or to an alternative benchmark.",
        desc_ru: "Бета-коэффициент: отражаем изменчивость цены акции по отношению к изменению индекса акций",
    }, {
        name: "shares_floating",
        serverName: "Float",
        type: "number",
        title: "Float",
        desc: "Shares outstanding, excluding those owned by insiders, owned by 5%-or-more owners, or subject to SEC rule 144 (regarding restricted securities).",
        desc_ru: "Доля акций в свободном обращении (кроме инсайдеров и владельцев более чем 5% пакетами)",
    }, {
        name: "percent_institutional_held",
        serverName: "InstitutionalPercentHeld",
        type: "number",
        title: "Institutional percent held",
        desc: "The percent of the outstanding common shares held by institutional investors, such as pension plans.",
        desc_ru: "Процент акций, которыми владеют институциональные инвесторы, такие как пенсионные фонды",
    }, {
        name: "volume",
        serverName: "Volume",
        type: "number",
        title: "Volume",
        desc: "The number of shares of stock traded in a given period of time. Note that some markets report volume on both buy and sell sides, whereas others report it on only one.",
        desc_ru: "Количество сделок с акцией за определенный период",
    }, {
        name: "average_volume",
        serverName: "AverageVolume",
        type: "number",
        title: "Average volume",
        desc: "The average volume over some time period, usually one year.",
        desc_ru: "Среднее количество сделок с акцией за период, как правило за один год",
    }, {
        name: "gross_margin_trailing_12months",
        serverName: "GrossMargin",
        type: "number",
        title: "Gross margin (%)",
        desc: "The ratio of gross income to net sales, expressed as a percent.",
        desc_ru: "Прибыль от продаж в процентах: Грязная прибыль к выручке от продаж",
    }, {
        name: "ebitd_margin_trailing_12months",
        serverName: "EBITDMargin",
        type: "number",
        title: "EBITDA margin (%)",
        desc: "The ratio of EBITDA (Earnings Before Interest, Taxes, Depreciation and Amortization) to total revenue.",
        desc_ru: "Прибыль до вычета процентов по кредитам и налогов выраженная в процентах от выручки",
    }, {
        name: "operating_margin_trailing_12months",
        serverName: "OperatingMargin",
        type: "number",
        title: "Operating margin (%)",
        desc: "The ratio of operating income to revenue.",
        desc_ru: "Операционная прибыль в процентах: Прибыль от основной деятельности к выручке",
    }, {
        name: "net_profit_margin_percent_trailing_12months",
        serverName: "NetProfitMarginPercent",
        type: "number",
        title: "Net profit margin (%)",
        desc: "The ratio of net income to revenue.",
        desc_ru: "Чистая прибыль к выручке в процентах",
    }, {
        name: "net_income_growth_rate_5years",
        serverName: "NetIncomeGrowthRate5Years",
        type: "number",
        title: "5y net income growth rate",
        desc: "The compound average annual growth rate of net income, which may or may not account for dilution, over the past 5 years.",
        desc_ru: "Среднегодовой темп роста чистой прибыли, который может разбавляться за 5 лет",
    }, {
        name: "revenue_growth_rate_5years",
        serverName: "RevenueGrowthRate5Years",
        type: "number",
        title: "5y revenue growth rate",
        desc: "The compound average annual growth rate of revenue over the past 5 years.",
        desc_ru: "Среднегодовой темп прироста выручки за 5 лет",
    }, {
        name: "revenue_growth_rate_10years",
        serverName: "RevenueGrowthRate10Years",
        type: "number",
        title: "10y revenue growth rate",
        desc: "The compound average annual growth rate of revenue over the past 10 years.",
        desc_ru: "Среднегодовой темп прироста выручки за 10 лет",
    }, {
        name: "eps_growth_rate_5years",
        serverName: "EPSGrowthRate5Years",
        type: "number",
        title: "5y EPS growth rate",
        desc: "The percentage change in earnings per share over the past 5 years.",
        desc_ru: "Среднегодовой процент прироста прибыли за 5 лет",
    }, {
        name: "eps_growth_rate_10years",
        serverName: "EPSGrowthRate10Years",
        type: "number",
        title: "10y EPS growth rate",
        desc: "The percentage change in earnings per share over the past 10 years.",
        desc_ru: "Процент прироста прибыли за 10 лет",
    },
];


// Промис.
// Полностью получает данные от гугла, оформленные как мне нужно.
me.getFullData = function() {
    return Q()
        .then(function() {
            return me.createUrls(me.params);
        })
        .then(function(urls) {
            return Q.all(_.map(urls, function(url) {
                return me.getJsonFromUrl(url);
            }));
        })
        .spread(function(json1, json2) {
            function tickerFromResult(r) {
                return {
                    name: r.title,
                    code: r.ticker,
                    cols: r.columns,
                };
            }
            var tickers1 = json1.searchresults.map(tickerFromResult);
            var tickers2 = json2.searchresults.map(tickerFromResult);

            if (tickers1.length !== tickers2.length) {
                console.warn('Вероятно, битые данные. Дальнейший код 100% отработает неправильно');
            }
            _.each(tickers1, function(t1, idx) {
                var t2 = tickers2[idx];
                t1.cols = t1.cols.concat(t2.cols);
            });

            return tickers1;
        })
        .then(function(tickers) {

            var parseNumber = function(value) {
                if (value === '-') {
                    return '';
                }

                value = value.replace(/[\,\ ]/g, '');

                var mult = 1;
                if (value.indexOf('M') !== -1) {
                    mult = 1000000;
                }
                else if (value.indexOf('B') !== -1) {
                    mult = 1000000000;
                }
                else if (value.indexOf('T') !== -1) {
                    mult = 1000000000000;
                }

                value = parseFloat(value);

                if (isNaN(value)) {
                    console.warn('NaN: sharesGoogleParser.getFullData');
                    return '';
                }

                return value * mult;
            };


            var result = _.map(tickers, function(t) {
                var data = {};
                _.each(t.cols, function(c) {
                    var column = _.find(me.params, {serverName: c.field});
                    if (column.type === 'number') {
                        data[c.field] = parseNumber(c.value);
                    }
                    else {
                        data[c.field] = c.value;
                    }
                });
                t.cols = data;
                return t;
            });
            return result;
        })
        // .then(function(res) {
        //     console.log(res);
        // })
        ;
};

// Промис.
// получает ответ гугла по юрл-ке в виде json
//
me.getJsonFromUrl = function(url) {
    console.log('sharesGoogleParser getFUrl');
    return Q.resolve()
        .then(function() {
            return new Promise(function(resolve, reject) {
                return request({
                    method: 'GET',
                    uri: url,
                    encoding: null,
                    timeout: 1000 * 60 * 5, // 5 min
                }, function(err, response, body) {
                    if (err) {
                        return reject(err);
                    }
                    else {
                        if (response.statusCode === 500) {
                            console.warn('err500 от google!');
                            return reject();
                        }
                        return resolve(iConv.decode(response.body, 'utf-8'));
                    }
                });
            });
        })
        .then(function(data) {
            var re = /\\x([\d\w]{2})/gi;
            data = data.replace(re, function (match, grp) {
                var chr = String.fromCharCode(parseInt(grp, 16));
                if (chr === '"') {
                    chr = '\\"';
                }
                return chr;
            });
            var parsed = JSON.parse(data);
            return parsed;
        })
        ;
};


// одной ссылкой не получается получить все данные - слишком длинная.
// Поэтому приходится "рубить" желаемую ссылку на две коротких
//
// Ожидает параметры вида {name}
me.createUrls = function(params) {
    var updatedParams = params.map(function(p) {
        return {
            name: p.name,
            cond: '>=',
            value: '',
        };
    });

    return [
        me.createUrl(updatedParams.slice(0, 30)),
        me.createUrl(updatedParams.slice(30, 999)),
    ];
};

// создает ссылку для запроса к гуглу по указанным параметрам
//
// Ожидаются параметры вида: {name, cond, value}
//
me.createUrl = function(params) {
    return [
        'https://www.google.com/finance?',
        'start=0',
        '&num=999',
        '&q=%5B', // '['
    ].concat(
        [ // эти параметры нужны в каждом запросе
            {
                name:  'currency',
                cond:  '==',
                value: '"RUB"',
            }, {
                name:  'exchange',
                cond:  '==',
                value: '"MCX"',
            }
        ]
        .concat(params) // это текущие параметры
        .map(function(p) {
            var name = p.name;

            var value = p.value
                .split('"').join('%22')
                ;

            var cond = p.cond;
            if (cond === '==') {
                cond = '%20%3D%3D%20'; // ' == '
            }
            else if (cond === '<=') {
                cond = '%20%3C%3D%20'; // ' <= '
                value = 999999999999999;
            }
            else if (cond === '>=') {
                cond = '%20%3E%3D%20'; // ' >= '
                value = -999999999999999;
            }
            else {
                console.warn('unknown cond:', p.cond);
            }

            return '('+name+cond+value+')%20%26%20';
        })
    )
    .concat([
        '(heeeeeymakarena!)',
        '%5D', // '['
        '&restype=company',
        '&output=json',
    ])
    .join('')
    .replace('%20%26%20(heeeeeymakarena!)', '')
    ;
};




module.exports = me;
