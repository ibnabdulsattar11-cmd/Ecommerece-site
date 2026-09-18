'use strict';

/**
 * Small helper belt for turning query params into safe date ranges
 * and Sequelize-friendly date-trunc buckets.
 */

const VALID_GROUPINGS = ['day', 'week', 'month'];

/**
 * Resolves `from`/`to` query params into real Date objects.
 * Defaults to "last 30 days" when nothing is supplied.
 */
function resolveDateRange({ from, to } = {}) {
  const now = new Date();
  const defaultTo = now;
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const parsedFrom = from ? new Date(from) : defaultFrom;
  const parsedTo = to ? new Date(to) : defaultTo;

  if (Number.isNaN(parsedFrom.getTime()) || Number.isNaN(parsedTo.getTime())) {
    const err = new Error('Invalid date format for "from" or "to". Use YYYY-MM-DD.');
    err.status = 400;
    throw err;
  }

  if (parsedFrom > parsedTo) {
    const err = new Error('"from" date must be before "to" date.');
    err.status = 400;
    throw err;
  }

  // Push `to` to end-of-day so the range is inclusive.
  parsedTo.setHours(23, 59, 59, 999);

  return { from: parsedFrom, to: parsedTo };
}

/**
 * Returns the immediately preceding period of the same length,
 * used to compute period-over-period % change on the overview cards.
 */
function previousPeriod({ from, to }) {
  const spanMs = to.getTime() - from.getTime();
  const prevTo = new Date(from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - spanMs);
  return { from: prevFrom, to: prevTo };
}

function assertValidGrouping(groupBy) {
  if (!VALID_GROUPINGS.includes(groupBy)) {
    const err = new Error(`"groupBy" must be one of: ${VALID_GROUPINGS.join(', ')}`);
    err.status = 400;
    throw err;
  }
}

function pctChange(current, previous) {
  if (previous === 0 || previous === null || previous === undefined) {
    return current > 0 ? 100 : 0;
  }
  return Number((((current - previous) / previous) * 100).toFixed(2));
}

export default {
  VALID_GROUPINGS,
  resolveDateRange,
  previousPeriod,
  assertValidGrouping,
  pctChange,
};
