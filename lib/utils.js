'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getNormalizedChildrenQuery = getNormalizedChildrenQuery;
exports.getSerializedChildrenQuery = getSerializedChildrenQuery;

var _omitBy = require('lodash/omitBy');

var _omitBy2 = _interopRequireDefault(_omitBy);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DEFAULT_CHILDREN_QUERY = {
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
/**
 * External dependencies
 */
function getNormalizedChildrenQuery(query) {
  return (0, _omitBy2.default)(query, function (value, key) {
    return DEFAULT_CHILDREN_QUERY[key] === value;
  });
}

/**
 * Returns a serialized children query, used as the key in the
 * `state.children.queries` state object.
 *
 * @param  {Object} query  Children query
 * @return {String}        Serialized children query
 */
function getSerializedChildrenQuery() {
  var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  var normalizedQuery = getNormalizedChildrenQuery(query);
  return JSON.stringify(normalizedQuery).toLocaleLowerCase();
}