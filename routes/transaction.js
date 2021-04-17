const transactionController = require('../controllers/transaction');

module.exports = (app) => {
    app.route('/api/v1/users/:id/transactions') 
        .get(transactionController.getAllWithTypeData)
    app.route('/api/v1/users/:id/transactions/trends') 
        .get(transactionController.expenseTrends)
    app.route('/api/v1/users/:id/transactions/trends/month') 
        .get(transactionController.getExpensePerMonth)
    app.route('/api/v1/users/:id/transactions/trends/topfive') 
    .get(transactionController.getTopFiveExpenses)
}
