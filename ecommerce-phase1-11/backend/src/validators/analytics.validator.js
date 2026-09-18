'use strict';

import { query } from 'express-validator';

export const dateRangeRules = [
  query('from')
    .optional()
    .isISO8601()
    .withMessage('"from" must be a valid date (YYYY-MM-DD).'),
  query('to')
    .optional()
    .isISO8601()
    .withMessage('"to" must be a valid date (YYYY-MM-DD).'),
];

export const revenueOverTimeRules = [
  ...dateRangeRules,
  query('groupBy')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('"groupBy" must be day, week, or month.'),
];

export const limitRules = [
  ...dateRangeRules,
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('"limit" must be an integer between 1 and 100.')
    .toInt(),
];

export default  {
  dateRangeRules,
  revenueOverTimeRules,
  limitRules,
};
