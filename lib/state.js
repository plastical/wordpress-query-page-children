'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.CHILDREN_REQUEST_FAILURE = exports.CHILDREN_REQUEST_SUCCESS = exports.CHILDREN_REQUEST = exports.CHILDREN_RECEIVE = exports.CHILD_REQUEST_FAILURE = exports.CHILD_REQUEST_SUCCESS = exports.CHILD_REQUEST = undefined;
exports.items = items;
exports.requests = requests;
exports.queryRequests = queryRequests;
exports.totalChildren = totalChildren;
exports.queries = queries;
exports.slugs = slugs;
exports.requestChildren = requestChildren;
exports.requestChild = requestChild;

var _redux = require('redux');

var _keyBy = require('lodash/keyBy');

var _keyBy2 = _interopRequireDefault(_keyBy);

var _reduce = require('lodash/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _wordpressRestApiOauth = require('wordpress-rest-api-oauth-1');

var _wordpressRestApiOauth2 = _interopRequireDefault(_wordpressRestApiOauth);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; } /*global SiteSettings */
/**
 * External dependencies
 */


var api = new _wordpressRestApiOauth2.default({
	url: SiteSettings.endpoint
});

/**
 * Child actions
 */
var CHILD_REQUEST = exports.CHILD_REQUEST = 'wordpress-redux/child/REQUEST';
var CHILD_REQUEST_SUCCESS = exports.CHILD_REQUEST_SUCCESS = 'wordpress-redux/child/REQUEST_SUCCESS';
var CHILD_REQUEST_FAILURE = exports.CHILD_REQUEST_FAILURE = 'wordpress-redux/child/REQUEST_FAILURE';
var CHILDREN_RECEIVE = exports.CHILDREN_RECEIVE = 'wordpress-redux/children/RECEIVE';
var CHILDREN_REQUEST = exports.CHILDREN_REQUEST = 'wordpress-redux/children/REQUEST';
var CHILDREN_REQUEST_SUCCESS = exports.CHILDREN_REQUEST_SUCCESS = 'wordpress-redux/children/REQUEST_SUCCESS';
var CHILDREN_REQUEST_FAILURE = exports.CHILDREN_REQUEST_FAILURE = 'wordpress-redux/children/REQUEST_FAILURE';

/**
 * Tracks all known children, indexed by child global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function items() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case CHILDREN_RECEIVE:
			var children = (0, _keyBy2.default)(action.children, 'id');
			return Object.assign({}, state, children);
		default:
			return state;
	}
}

/**
 * Returns the updated child requests state after an action has been
 * dispatched. The state reflects a mapping of child ID to a
 * boolean reflecting whether a request for the child is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function requests() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case CHILD_REQUEST:
		case CHILD_REQUEST_SUCCESS:
		case CHILD_REQUEST_FAILURE:
			return Object.assign({}, state, _defineProperty({}, action.childSlug, CHILD_REQUEST === action.type));
		default:
			return state;
	}
}

/**
 * Returns the updated child query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function queryRequests() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case CHILDREN_REQUEST:
		case CHILDREN_REQUEST_SUCCESS:
		case CHILDREN_REQUEST_FAILURE:
			var serializedQuery = (0, _utils.getSerializedChildrenQuery)(action.query);
			return Object.assign({}, state, _defineProperty({}, serializedQuery, CHILDREN_REQUEST === action.type));
		default:
			return state;
	}
}

/**
 * Tracks the child length for a given query.
 * @todo Bring in the "without childd" util, to reduce duplication
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function totalChildren() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case CHILDREN_REQUEST_SUCCESS:
			var serializedQuery = (0, _utils.getSerializedChildrenQuery)(action.query);
			return Object.assign({}, state, _defineProperty({}, serializedQuery, action.totalChildren));
		default:
			return state;
	}
}

/**
 * Returns the updated child query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of child
 * global IDs for the query, if a query response was successfully received.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function queries() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case CHILDREN_REQUEST_SUCCESS:
			var serializedQuery = (0, _utils.getSerializedChildrenQuery)(action.query);
			return Object.assign({}, state, _defineProperty({}, serializedQuery, action.children.map(function (child) {
				return child.id;
			})));
		default:
			return state;
	}
}

/**
 * Tracks the slug->ID mapping for children
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
function slugs() {
	var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	var action = arguments[1];

	switch (action.type) {
		case CHILD_REQUEST_SUCCESS:
			return Object.assign({}, state, _defineProperty({}, action.childSlug, action.childId));
		case CHILDREN_RECEIVE:
			var children = (0, _reduce2.default)(action.children, function (memo, u) {
				memo[u.slug] = u.id;
				return memo;
			}, {});
			return Object.assign({}, state, children);
		default:
			return state;
	}
}

exports.default = (0, _redux.combineReducers)({
	items: items,
	requests: requests,
	totalChildren: totalChildren,
	queryRequests: queryRequests,
	queries: queries,
	slugs: slugs
});

/**
 * Triggers a network request to fetch children for the specified site and query.
 *
 * @param  {String}   query  Child query
 * @return {Function}        Action thunk
 */

function requestChildren() {
	var query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	return function (dispatch) {
		dispatch({
			type: CHILDREN_REQUEST,
			query: query
		});

		query._embed = true;

		api.get('/wp/v2/pages', query).then(function (children) {
			dispatch({
				type: CHILDREN_RECEIVE,
				children: children
			});
			requestChildCount('/wp/v2/pages', query).then(function (count) {
				dispatch({
					type: CHILDREN_REQUEST_SUCCESS,
					query: query,
					totalChildren: count,
					children: children
				});
			});
			return null;
		}).catch(function (error) {
			dispatch({
				type: CHILDREN_REQUEST_FAILURE,
				query: query,
				error: error
			});
		});
	};
}

/**
 * Triggers a network request to fetch a specific child from a site.
 *
 * @param  {string}   childSlug  Child slug
 * @return {Function}           Action thunk
 */
function requestChild(childSlug) {
	return function (dispatch) {
		dispatch({
			type: CHILD_REQUEST,
			childSlug: childSlug
		});

		var query = {
			slug: childSlug,
			_embed: true
		};

		api.get('/wp/v2/pages', query).then(function (data) {
			var child = data[0];
			dispatch({
				type: CHILDREN_RECEIVE,
				children: [child]
			});
			dispatch({
				type: CHILD_REQUEST_SUCCESS,
				childId: child.id,
				childSlug: childSlug
			});
			return null;
		}).catch(function (error) {
			dispatch({
				type: CHILD_REQUEST_FAILURE,
				childSlug: childSlug,
				error: error
			});
		});
	};
}

function requestChildCount(url) {
	var data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	if (url.indexOf('http') !== 0) {
		url = api.config.url + 'wp-json' + url;
	}

	if (data) {
		// must be decoded before being passed to ouath
		url += '?' + decodeURIComponent(_qs2.default.stringify(data));
		data = null;
	}

	var headers = {
		'Accept': 'application/json',
		'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
	};

	return fetch(url, {
		method: 'HEAD',
		headers: headers,
		mode: 'cors',
		body: null
	}).then(function (response) {
		return parseInt(response.headers.get('X-WP-TotalChildren'), 10) || 1;
	});
}