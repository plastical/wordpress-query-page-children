/*global SiteSettings */
/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import keyBy from 'lodash/keyBy';
import reduce from 'lodash/reduce';
import qs from 'qs';
import API from 'wordpress-rest-api-oauth-1';
const api = new API({
	url: SiteSettings.endpoint
});

import { getSerializedChildsQuery } from './utils';

/**
 * Child actions
 */
export const CHILD_REQUEST = 'wordpress-redux/child/REQUEST';
export const CHILD_REQUEST_SUCCESS = 'wordpress-redux/child/REQUEST_SUCCESS';
export const CHILD_REQUEST_FAILURE = 'wordpress-redux/child/REQUEST_FAILURE';
export const CHILDS_RECEIVE = 'wordpress-redux/childs/RECEIVE';
export const CHILDS_REQUEST = 'wordpress-redux/childs/REQUEST';
export const CHILDS_REQUEST_SUCCESS = 'wordpress-redux/childs/REQUEST_SUCCESS';
export const CHILDS_REQUEST_FAILURE = 'wordpress-redux/childs/REQUEST_FAILURE';

/**
 * Tracks all known childs, indexed by child global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items(state = {}, action) {
	switch (action.type) {
		case CHILDS_RECEIVE:
			const childs = keyBy(action.childs, 'id');
			return Object.assign({}, state, childs);
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
export function requests(state = {}, action) {
	switch (action.type) {
		case CHILD_REQUEST:
		case CHILD_REQUEST_SUCCESS:
		case CHILD_REQUEST_FAILURE:
			return Object.assign({}, state, { [action.childSlug]: CHILD_REQUEST === action.type });
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
export function queryRequests(state = {}, action) {
	switch (action.type) {
		case CHILDS_REQUEST:
		case CHILDS_REQUEST_SUCCESS:
		case CHILDS_REQUEST_FAILURE:
			const serializedQuery = getSerializedChildsQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: CHILDS_REQUEST === action.type
			});
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
export function totalChilds(state = {}, action) {
	switch (action.type) {
		case CHILDS_REQUEST_SUCCESS:
			const serializedQuery = getSerializedChildsQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: action.totalChilds
			});
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
export function queries(state = {}, action) {
	switch (action.type) {
		case CHILDS_REQUEST_SUCCESS:
			const serializedQuery = getSerializedChildsQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: action.childs.map(child => child.id)
			});
		default:
			return state;
	}
}

/**
 * Tracks the slug->ID mapping for childs
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function slugs(state = {}, action) {
	switch (action.type) {
		case CHILD_REQUEST_SUCCESS:
			return Object.assign({}, state, {
				[action.childSlug]: action.childId
			});
		case CHILDS_RECEIVE:
			const childs = reduce(action.childs, (memo, u) => {
				memo[u.slug] = u.id;
				return memo;
			}, {});
			return Object.assign({}, state, childs);
		default:
			return state;
	}
}

export default combineReducers({
	items,
	requests,
	totalChilds,
	queryRequests,
	queries,
	slugs
});

/**
 * Triggers a network request to fetch childs for the specified site and query.
 *
 * @param  {String}   query  Child query
 * @return {Function}        Action thunk
 */
export function requestChilds(query = {}) {
	return dispatch => {
		dispatch({
			type: CHILDS_REQUEST,
			query
		});

		query._embed = true;

		api.get('/wp/v2/childs', query).then(childs => {
			dispatch({
				type: CHILDS_RECEIVE,
				childs
			});
			requestChildCount('/wp/v2/childs', query).then(count => {
				dispatch({
					type: CHILDS_REQUEST_SUCCESS,
					query,
					totalChilds: count,
					childs
				});
			});
			return null;
		}).catch(error => {
			dispatch({
				type: CHILDS_REQUEST_FAILURE,
				query,
				error
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
export function requestChild(childSlug) {
	return dispatch => {
		dispatch({
			type: CHILD_REQUEST,
			childSlug
		});

		const query = {
			slug: childSlug,
			_embed: true
		};

		api.get('/wp/v2/childs', query).then(data => {
			const child = data[0];
			dispatch({
				type: CHILDS_RECEIVE,
				childs: [child]
			});
			dispatch({
				type: CHILD_REQUEST_SUCCESS,
				childId: child.id,
				childSlug
			});
			return null;
		}).catch(error => {
			dispatch({
				type: CHILD_REQUEST_FAILURE,
				childSlug,
				error
			});
		});
	};
}

function requestChildCount(url, data = null) {
	if (url.indexOf('http') !== 0) {
		url = `${ api.config.url }wp-json${ url }`;
	}

	if (data) {
		// must be decoded before being passed to ouath
		url += `?${ decodeURIComponent(qs.stringify(data)) }`;
		data = null;
	}

	const headers = {
		'Accept': 'application/json',
		'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
	};

	return fetch(url, {
		method: 'HEAD',
		headers: headers,
		mode: 'cors',
		body: null
	}).then(response => {
		return parseInt(response.headers.get('X-WP-TotalChilds'), 10) || 1;
	});
}