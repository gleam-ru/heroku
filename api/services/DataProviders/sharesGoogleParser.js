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
        title: "Quote change (%)",
        desc: "The percent change between the stock price and the prior trading day's closing price.",
    }, {
        name: "price_to_book",
        serverName: "PriceToBook",
        title: "Price to book",
        desc: "The stock price divided by book value per share.",
    }, {
        name: "price_to_sales_trailing_12months",
        serverName: "PriceSales",
        title: "Price to sales",
        desc: "The stock price divided by annual sales per share.",
    }, {
        name: "last_price",
        serverName: "QuoteLast",
        title: "Last price",
        desc: "The most recently reported trade price, which is not necessarily the most recently traded price.",
    }, {
        name: "earnings_per_share",
        serverName: "EPS",
        title: "EPS",
        desc: "The net income per share according to the most recent quarterly report.",
    }, {
        name: "high_52week",
        serverName: "High52Week",
        title: "52w high",
        desc: "The highest closing price in the last 52 weeks.",
    }, {
        name: "low_52week",
        serverName: "Low52Week",
        title: "52w low",
        desc: "The lowest closing price in the last 52 weeks.",
    }, {
        name: "price_change_52week",
        serverName: "Price52WeekPercChange",
        title: "52w price change (%)",
        desc: "The percent change in the price over the past year, plus or minus the nearest trading day.",
    }, {
        name: "average_50day_price",
        serverName: "Price50DayAverage",
        title: "50d avg price",
        desc: "The average price over the last 50 tradable days.",
    }, {
        name: "average_150day_price",
        serverName: "Price150DayAverage",
        title: "150d avg price",
        desc: "The average price over the last 150 tradable days.",
    }, {
        name: "average_200day_price",
        serverName: "Price200DayAverage",
        title: "200d avg price",
        desc: "The average price over the last 200 tradable days.",
    }, {
        name: "price_change_13week",
        serverName: "Price13WeekPercChange",
        title: "13w price change (%)",
        desc: "The percent change in the price over the last thirteen weeks",
    }, {
        name: "price_change_26week",
        serverName: "Price26WeekPercChange",
        title: "26w price change (%)",
        desc: "The percent change in the price over the last twenty six weeks",
    }, {
        name: "market_cap",
        serverName: "MarketCap",
        title: "Market cap",
        desc: "Market capitalization is the total value of a company in the stock market. It is calculated by multiplying total shares outstanding by the current price per share.",
    }, {
        name: "pe_ratio",
        serverName: "PE",
        title: "P/E ratio",
        desc: "The ratio of the stock price to the sum of its reported earnings, which may or may not account for dilution, over the last 4 quarters.",
    }, {
        name: "forward_pe_1year",
        serverName: "ForwardPE1Year",
        title: "1y fwd P/E",
        desc: "The stock price divided by a forecast of this year's earnings.",
    }, {
        name: "dividend_recent_quarter",
        serverName: "DividendRecentQuarter",
        title: "Div recent quarter",
        desc: "The dividend per share which was paid to shareholders in the most recent quarter.",
    }, {
        name: "dividend_next_quarter",
        serverName: "DividendNextQuarter",
        title: "Div next quarter",
        desc: "The forecast value of the next quarterly dividend, per share, to be paid.",
    }, {
        name: "dividend_per_share",
        serverName: "DPSRecentYear",
        title: "Div per share (Recent yr)",
        desc: "The sum of all dividends, per share, paid within the past year.",
    }, {
        name: "dividend_next_year",
        serverName: "IAD",
        title: "Div rate indicated annual",
        desc: "The forecast sum of all dividends, per share, to be paid in the coming year.",
    }, {
        name: "dividend_per_share_trailing_12months",
        serverName: "DividendPerShare",
        title: "Div per share",
        desc: "Dividend per share is the total amount of dividend that shareholders receive over one year for each share owned.",
    }, {
        name: "dividend_yield",
        serverName: "DividendYield",
        title: "Div yield (%)",
        desc: "The value of the most recent dividend per share, multiplied by the number of times per year which dividends are typically paid, divided by the stock price.",
    }, {
        name: "dividend_recent_year",
        serverName: "Dividend",
        title: "Div from cash flow",
        desc: "A dividend is a portion of a company's profit paid to common and preferred shareholders.",
    }, {
        name: "book_value_per_share_year",
        serverName: "BookValuePerShareYear",
        title: "Book value/share",
        desc: "A company's total assets minus its total liabilities, expressed per share.",
    }, {
        name: "cash_per_share_year",
        serverName: "CashPerShareYear",
        title: "Cash/share",
        desc: "The sum of cash and equivalents, such as liquid money market securities, expressed per share.",
    }, {
        name: "current_assets_to_liabilities_ratio_year",
        serverName: "CurrentRatioYear",
        title: "Current ratio",
        desc: "The ratio of current assets divided by current liabilities. Current ratio is a measure of liquidity.",
    }, {
        name: "longterm_debt_to_assets_year",
        serverName: "LTDebtToAssetsYear",
        title: "LT debt/assets (Recent yr) (%)",
        desc: "Total Long Term Debt for the most recent fiscal year divided by the Total Assets for same period.",
    }, {
        name: "longterm_debt_to_assets_quarter",
        serverName: "LTDebtToAssetsQuarter",
        title: "LT debt/assets (Recent qtr) (%)",
        desc: "Total Long Term Debt for the most recent quarter divided by the Total Assets for the same period.",
    }, {
        name: "total_debt_to_assets_year",
        serverName: "TotalDebtToAssetsYear",
        title: "Total debt/assets (Recent yr) (%)",
        desc: "Total Debt for the most recent fiscal year divided by Total Assets for the same period.",
    }, {
        name: "total_debt_to_assets_quarter",
        serverName: "TotalDebtToAssetsQuarter",
        title: "Total debt/assets (Recent qtr) (%)",
        desc: "Total Debt for the most recent quarter divided by Total Assets for the same period.",
    }, {
        name: "longterm_debt_to_equity_year",
        serverName: "LTDebtToEquityYear",
        title: "LT debt/equity (Recent yr) (%)",
        desc: "Total Long Term Debt for the most recent fiscal year divided by Total Shareholder Equity for the same period.",
    }, {
        name: "longterm_debt_to_equity_quarter",
        serverName: "LTDebtToEquityQuarter",
        title: "LT debt/equity (Recent qtr) (%)",
        desc: "Total Long Term Debt for the most recent quarter divided by Total Shareholder Equity for the same period.",
    }, {
        name: "total_debt_to_equity_year",
        serverName: "TotalDebtToEquityYear",
        title: "Total debt/equity (Recent yr) (%)",
        desc: "Total Debt for the most recent fiscal year divided by Total Shareholder Equity for the same period.",
    }, {
        name: "total_debt_to_equity_quarter",
        serverName: "TotalDebtToEquityQuarter",
        title: "Total debt/equity (Recent qtr) (%)",
        desc: "Total Debt for the most recent quarter divided by Total Shareholder Equity for the same period.",
    }, {
        name: "interest_coverage_year",
        serverName: "AINTCOV",
        title: "Interest coverage",
        desc: "Also known as Times Interest Earned, this is the ratio of Earnings Before Interest and Taxes for the most recent year divided by the Interest Expense for the same period.",
    }, {
        name: "return_on_investment_trailing_12months",
        serverName: "ReturnOnInvestmentTTM",
        title: "Return on investment (TTM) (%)",
        desc: "Trailing twelve month Income after taxes divided by the average (Total Long term Debt + Long term Liabilities + Shareholders Equity), expressed as a percentage.",
    }, {
        name: "return_on_investment_5years",
        serverName: "ReturnOnInvestment5Years",
        title: "Return on investment (5 yr avg) (%)",
        desc: "Most recent 5y Avg. Income After Taxes divided by the average (Total Long term Debt + Long term Liabilities + Shareholders Equity), expressed as a percentage.",
    }, {
        name: "return_on_investment_year",
        serverName: "ReturnOnInvestmentYear",
        title: "Return on investment (Recent yr) (%)",
        desc: "Annual Income After Taxes divided by the average (Total Long term Debt + Long term Liabilities + Shareholders Equity), expressed as a percentage.",
    }, {
        name: "return_on_assets_trailing_12months",
        serverName: "ReturnOnAssetsTTM",
        title: "Return on assets (TTM) (%)",
        desc: "Trailing twelve month Income after taxes divided by the Average Total Assets, expressed as a percentage.",
    }, {
        name: "return_on_assets_5years",
        serverName: "ReturnOnAssets5Years",
        title: "Return on assets (5 yr avg) (%)",
        desc: "Most recent 5y Avg. Income after taxes divided by the Average Total Assets, expressed as a percentage.",
    }, {
        name: "return_on_assets_year",
        serverName: "ReturnOnAssetsYear",
        title: "Return on assets (Recent yr) (%)",
        desc: "Most recent Year Income after taxes divided by the Average Total Assets, expressed as a percentage.",
    }, {
        name: "return_on_equity_trailing_12months",
        serverName: "ReturnOnEquityTTM",
        title: "Return on equity (TTM) (%)",
        desc: "Trailing twelve month Income divided by the Average Common Equity, expressed as a percentage.",
    }, {
        name: "return_on_equity_5years",
        serverName: "ReturnOnEquity5Years",
        title: "Return on equity (5 yr avg) (%)",
        desc: "Most recent 5y Avg. Income divided by the Average Common Equity, expressed as a percentage.",
    }, {
        name: "return_on_equity_year",
        serverName: "ReturnOnEquityYear",
        title: "Return on equity (Recent yr) (%)",
        desc: "Most recent fiscal year Income divided by the Average Common Equity, expressed as a percentage.",
    }, {
        name: "beta",
        serverName: "Beta",
        title: "Beta",
        desc: "The measure of a fund's or a stock's risk in relation to the market or to an alternative benchmark.",
    }, {
        name: "shares_floating",
        serverName: "Float",
        title: "Float",
        desc: "Shares outstanding, excluding those owned by insiders, owned by 5%-or-more owners, or subject to SEC rule 144 (regarding restricted securities).",
    }, {
        name: "percent_institutional_held",
        serverName: "InstitutionalPercentHeld",
        title: "Institutional percent held",
        desc: "The percent of the outstanding common shares held by institutional investors, such as pension plans.",
    }, {
        name: "volume",
        serverName: "Volume",
        title: "Volume",
        desc: "The number of shares of stock traded in a given period of time. Note that some markets report volume on both buy and sell sides, whereas others report it on only one.",
    }, {
        name: "average_volume",
        serverName: "AverageVolume",
        title: "Average volume",
        desc: "The average volume over some time period, usually one year.",
    }, {
        name: "gross_margin_trailing_12months",
        serverName: "GrossMargin",
        title: "Gross margin (%)",
        desc: "The ratio of gross income to net sales, expressed as a percent.",
    }, {
        name: "ebitd_margin_trailing_12months",
        serverName: "EBITDMargin",
        title: "EBITDA margin (%)",
        desc: "The ratio of EBITDA (Earnings Before Interest, Taxes, Depreciation and Amortization) to total revenue.",
    }, {
        name: "operating_margin_trailing_12months",
        serverName: "OperatingMargin",
        title: "Operating margin (%)",
        desc: "The ratio of operating income to revenue.",
    }, {
        name: "net_profit_margin_percent_trailing_12months",
        serverName: "NetProfitMarginPercent",
        title: "Net profit margin (%)",
        desc: "The ratio of net income to revenue.",
    }, {
        name: "net_income_growth_rate_5years",
        serverName: "NetIncomeGrowthRate5Years",
        title: "5y net income growth rate",
        desc: "The compound average annual growth rate of net income, which may or may not account for dilution, over the past 5 years.",
    }, {
        name: "revenue_growth_rate_5years",
        serverName: "RevenueGrowthRate5Years",
        title: "5y revenue growth rate",
        desc: "The compound average annual growth rate of revenue over the past 5 years.",
    }, {
        name: "revenue_growth_rate_10years",
        serverName: "RevenueGrowthRate10Years",
        title: "10y revenue growth rate",
        desc: "The compound average annual growth rate of revenue over the past 10 years.",
    }, {
        name: "eps_growth_rate_5years",
        serverName: "EPSGrowthRate5Years",
        title: "5y EPS growth rate",
        desc: "The percentage change in earnings per share over the past 5 years.",
    }, {
        name: "eps_growth_rate_10years",
        serverName: "EPSGrowthRate10Years",
        title: "10y EPS growth rate",
        desc: "The percentage change in earnings per share over the past 10 years.",
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
            var result = _.map(tickers, function(t) {
                var data = {};
                _.each(t.cols, function(c) {
                    data[c.field] = c.value;
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
