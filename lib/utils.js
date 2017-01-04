/**
 * External dependencies
 */
import omitBy from 'lodash/omitBy';

const DEFAULT_CHILDREN_QUERY = {
  _embed: true,
  number: 10,
  offset: 0,
  order_by: 'meta_value',
  type: 'children',
  order: 'ASC',
  fields: 'all_with_meta'
};

/**
 * Returns a normalized children query, excluding any values which match the
 * default child query.
 *
 * @param  {Object} query Children query
 * @return {Object}       Normalized children query
 */
export function getNormalizedChildrenQuery(query) {
  return omitBy(query, (value, key) => DEFAULT_CHILDREN_QUERY[key] === value);
}

/**
 * Returns a serialized children query, used as the key in the
 * `state.children.queries` state object.
 *
 * @param  {Object} query  Children query
 * @return {String}        Serialized children query
 */
export function getSerializedChildrenQuery(query = {}) {
  const normalizedQuery = getNormalizedChildrenQuery(query);
  return JSON.stringify(normalizedQuery).toLocaleLowerCase();
}