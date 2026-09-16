'use strict';

const { query } = require('express-validator');

const dateRangeRules = [
  query('from')
    .optional()
    .isISO8601()
    .withMessage('"from" must be a valid date (YYYY-MM-DD).'),
  query('to')
    .optional()
    .isISO8601()
    .withMessage('"to" must be a valid date (YYYY-MM-DD).'),
];

const revenueOverTimeRules = [
  ...dateRangeRules,
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('"groupBy" must be day, week, or month.'),
];

const limitRules = [
  ...dateRangeRules,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('"limit" must be an integer between 1 and 100.')
    .toInt(),
];

module.exports = {
  dateRangeRules,
  revenueOverTimeRules,
  limitRules,
};
