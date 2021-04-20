const pool = require('../database/config');

async function query(q) {
  const client = await pool.connect();
  let res;
  try {
    await client.query("BEGIN");
    try {
      res = await client.query(q);
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    }
  } finally {
    client.release();
  }
  return res;
}

module.exports.expenseTrends = async (req, res) => {
  try {
    const selectQuery =  `SELECT category, icon_url
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

    const { rows } = await query(selectQuery);

   if(rows < '1') {
        res.status(404).send({
        status: 'Failed',
        message: 'No expense trend for this user',
        });
    } else {
        res.status(200).send({
            status: 'Success',
            message: 'Successfully returned expense trend.',
            data: rows,
        });
    }
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message: "Error while Getting expense trend:" + err,
    });
  }
};


module.exports.getAllWithTypeData = async (req, res) => {
  try {
    const selectQuery =  `SELECT 
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
            type;`;

    const { rows } = await query(selectQuery);

   if(rows < '1') {
        res.status(404).send({
        status: 'Failed',
        message: 'No expense trend by type for this user',
        });
    } else {
        res.status(200).send({
            status: 'Success',
            message: 'Successfully returned transactions by type.',
            data: rows,
        });
    }
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message: "Error while Getting transactions by type:" + err,
    });
  }
};


module.exports.getExpensePerMonth = async (req, res) => {
  try {
    const selectQuery =
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

    const { rows } = await query(selectQuery);

   if(rows < '1') {
        res.status(404).send({
        status: 'Failed',
        message: 'No expense trend per month for this user',
        });
    } else {
        res.status(200).send({
            status: 'Success',
            message: 'Successfully returned expense trend per month',
            data: rows,
        });
    }
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message: "Error while Getting transactions per month:" + err,
    });
  }
};


module.exports.getTopFiveExpenses = async (req, res) => {
  try {
    const selectQuery =
          `SELECT
            category,
            COUNT(category) AS count
            FROM transactions
            WHERE user_id=${req.params.id}
            AND date_time >= date_trunc('month', now()) - interval '12 month' and date_time < date_trunc('month', now())
            GROUP BY category
            ORDER BY count DESC
            LIMIT 5;`

    const { rows } = await query(selectQuery);

   if(rows < '1') {
        res.status(404).send({
            status: 'Failed',
            message: 'No top five data for this user'
        });
    } else {
        res.status(200).send({
            status: 'Success',
            message: 'Successfully returned expense trend per month',
            data: rows,
        });
    }
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message: "Error while Getting top five data for this user':" + err,
    });
  }
};
