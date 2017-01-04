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

import {
	getSerializedChildrenQuery
} from './utils';

/**
 * Child actions
 */
export const CHILD_REQUEST = 'wordpress-redux/child/REQUEST';
export const CHILD_REQUEST_SUCCESS = 'wordpress-redux/child/REQUEST_SUCCESS';
export const CHILD_REQUEST_FAILURE = 'wordpress-redux/child/REQUEST_FAILURE';
export const CHILDREN_RECEIVE = 'wordpress-redux/children/RECEIVE';
export const CHILDREN_REQUEST = 'wordpress-redux/children/REQUEST';
export const CHILDREN_REQUEST_SUCCESS = 'wordpress-redux/children/REQUEST_SUCCESS';
export const CHILDREN_REQUEST_FAILURE = 'wordpress-redux/children/REQUEST_FAILURE';

/**
 * Tracks all known children, indexed by child global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items(state = {}, action) {
	switch (action.type) {
		case CHILDREN_RECEIVE:
			const children = keyBy(action.children, 'id');
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
		case CHILDREN_REQUEST:
		case CHILDREN_REQUEST_SUCCESS:
		case CHILDREN_REQUEST_FAILURE:
			const serializedQuery = getSerializedChildrenQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: CHILDREN_REQUEST === action.type
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
export function totalChildren(state = {}, action) {
	switch (action.type) {
		case CHILDREN_REQUEST_SUCCESS:
			const serializedQuery = getSerializedChildrenQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: action.totalChildren
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
		case CHILDREN_REQUEST_SUCCESS:
			const serializedQuery = getSerializedChildrenQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: action.children.map((child) => child.id)
			});
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
export function slugs(state = {}, action) {
	switch (action.type) {
		case CHILD_REQUEST_SUCCESS:
			return Object.assign({}, state, {
				[action.childSlug]: action.childId
			});
		case CHILDREN_RECEIVE:
			const children = reduce(action.children, (memo, u) => {
				memo[u.slug] = u.id;
				return memo;
			}, {});
			return Object.assign({}, state, children);
		default:
			return state;
	}
}

export default combineReducers({
	items,
	requests,
	totalChildren,
	queryRequests,
	queries,
	slugs
});

/**
 * Triggers a network request to fetch children for the specified site and query.
 *
 * @param  {String}   query  Child query
 * @return {Function}        Action thunk
 */
export function requestChildren(query = {}) {
	return (dispatch) => {
		dispatch({
			type: CHILDREN_REQUEST,
			query
		});

		query._embed = true;

		api.get('/wp/v2/pages', query).then(children => {
			dispatch({
				type: CHILDREN_RECEIVE,
				children
			});
			requestChildCount('/wp/v2/pages', query).then(count => {
				dispatch({
					type: CHILDREN_REQUEST_SUCCESS,
					query,
					totalChildren: count,
					children
				});
			} );
			return null;
		}).catch((error) => {
			dispatch({
				type: CHILDREN_REQUEST_FAILURE,
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
	return (dispatch) => {
		dispatch({
			type: CHILD_REQUEST,
			childSlug
		});

		const query = {
			slug: childSlug,
			_embed: true,
		};

		api.get('/wp/v2/pages', query).then(data => {
			const child = data[0];
			dispatch({
				type: CHILDREN_RECEIVE,
				children: [child]
			});
			dispatch({
				type: CHILD_REQUEST_SUCCESS,
				childId: child.id,
				childSlug
			});
			return null;
		}).catch((error) => {
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
		url = `${api.config.url}wp-json${url}`
	}

	if (data) {
		// must be decoded before being passed to ouath
		url += `?${decodeURIComponent(qs.stringify(data))}`;
		data = null
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
	})
	.then(response => {
		return parseInt(response.headers.get('X-WP-TotalChildren'), 10) || 1;
	});
}
