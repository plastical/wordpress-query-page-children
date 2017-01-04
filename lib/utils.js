/**
 * External dependencies
 */
import omitBy from 'lodash/omitBy';

const DEFAULT_PAGES_QUERY = {
  _embed: true,
  number: 10,
  offset: 0,
  order_by: 'menu',
  order: 'ASC',
  fields: 'all_with_meta'
};

/**
 * Returns a normalized pages query, excluding any values which match the
 * default page query.
 *
 * @param  {Object} query Pages query
 * @return {Object}       Normalized pages query
 */
export function getNormalizedPagesQuery(query) {
  return omitBy(query, (value, key) => DEFAULT_PAGES_QUERY[key] === value);
}

/**
 * Returns a serialized pages query, used as the key in the
 * `state.pages.queries` state object.
 *
 * @param  {Object} query  Pages query
 * @return {String}        Serialized pages query
 */
export function getSerializedPagesQuery(query = {}) {
  const normalizedQuery = getNormalizedPagesQuery(query);
  return JSON.stringify(normalizedQuery).toLocaleLowerCase();
}