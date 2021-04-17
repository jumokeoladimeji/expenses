const pool = require('../database/config');

module.exports.expenseTrends = async (req, res) => {
    pool.connect((err, client, done) => {
        const query = 
            `SELECT category, icon_url
            FROM (SELECT
                category, icon_url,
                DATE_TRUNC('month', date_time)
                AS  date_time_month,
                COUNT(category) AS count
                FROM transactions
                WHERE user_id=${req.params.id}
                AND date_time >= date_trunc('month', now()) - interval '12 month' and date_time < date_trunc('month', now())
                GROUP BY category, icon_url, DATE_TRUNC('month',date_time)
                ORDER BY date_time_month) 
                AS twelveMonthTrend
            GROUP BY category, icon_url
            HAVING COUNT(category) > 6;`;

        client.query(query, (error, result) => {
            done();
            if (error) {
                res.status(400).json({error})
            } 
            if(result.rows < '1') {
                res.status(404).send({
                status: 'Failed',
                message: 'No expense trend for this user',
                });
            } else {
                res.status(200).send({
                    status: 'Success',
                    message: 'Successfully returned expense trend.',
                    data: result.rows,
                });
            }
        });
    });
};

module.exports.getAllWithTypeData = async (req, res) => {
    pool.connect((err, client, done) => {
        const query = 
            `SELECT 
            'total sum' AS type, 
            sum(amount) AS sum 
            FROM 
            transactions 
            UNION ALL 
            SELECT 
            type, 
            sum(amount) AS sum 
            FROM 
            transactions 
            WHERE user_id=${req.params.id} 
                        AND date_time >= date_trunc('month', now()) - interval '12 month' 
                        AND date_time < date_trunc('month', now()) 
            GROUP BY 
            type;`

        client.query(query, (error, result) => {
            done();
            if (error) {
                res.status(400).json({error})
            } 
            if(result.rows < '1') {
                res.status(404).send({
                status: 'Failed',
                message: 'No transactions for this user',
                });
            } else {
                res.status(200).send({
                    status: 'Success',
                    message: 'Successfully returned transactions by type.',
                    data: result.rows,
                });
            }
        });
    });
};

module.exports.getExpensePerMonth= async (req, res) => {
    pool.connect((err, client, done) => {
        const query = 
           `SELECT
            category, 
            DATE_TRUNC('month', date_time)
            AS  month_time,
            COUNT(category) AS finalCount
            FROM transactions
            WHERE category = ANY
            (SELECT category 
            FROM (SELECT
                category, 
                DATE_TRUNC('month', date_time)
                AS  date_time_month,
                COUNT(category) AS count
                FROM transactions
                WHERE user_id=${req.params.id}
                AND date_time >= date_trunc('month', now()) - interval '12 month' and date_time < date_trunc('month', now())
                GROUP BY category, date_time_month
                ORDER BY date_time_month) 
                AS twelveMonthTrend
            GROUP BY category
            HAVING COUNT(category) > 6)
            GROUP BY category, month_time
            ORDER BY month_time DESC;`

        client.query(query, (error, result) => {
            done();
            if (error) {
                res.status(400).json({error})
            } 
            if(result.rows < '1') {
                res.status(404).send({
                status: 'Failed',
                message: 'No expense trend for this user',
                });
            } else {
                res.status(200).send({
                    status: 'Success',
                    message: 'Successfully returned expense trend per month.',
                    data: result.rows,
                });
            }
        });
    });
};

module.exports.getTopFiveExpenses = async (req, res) => {
    pool.connect((err, client, done) => {
        const query = 
           `SELECT
            category,
            COUNT(category) AS count
            FROM transactions
            WHERE user_id=${req.params.id}
            AND date_time >= date_trunc('month', now()) - interval '12 month' and date_time < date_trunc('month', now())
            GROUP BY category
            ORDER BY count DESC
            LIMIT 5;`

        client.query(query, (error, result) => {
            done();
            if (error) {
                res.status(400).json({error})
            } 
            if(result.rows < '1') {
                res.status(404).send({
                status: 'Failed',
                message: 'No top five data for this user',
                });
            } else {
                res.status(200).send({
                    status: 'Success',
                    message: 'Successfully returned top five expense trend.',
                    data: result.rows,
                });
            }
        });
    });
};
