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
	getSerializedPagesQuery
} from './utils';

/**
 * Page actions
 */
export const PAGE_REQUEST = 'wordpress-redux/page/REQUEST';
export const PAGE_REQUEST_SUCCESS = 'wordpress-redux/page/REQUEST_SUCCESS';
export const PAGE_REQUEST_FAILURE = 'wordpress-redux/page/REQUEST_FAILURE';
export const PAGES_RECEIVE = 'wordpress-redux/pages/RECEIVE';
export const PAGES_REQUEST = 'wordpress-redux/pages/REQUEST';
export const PAGES_REQUEST_SUCCESS = 'wordpress-redux/pages/REQUEST_SUCCESS';
export const PAGES_REQUEST_FAILURE = 'wordpress-redux/pages/REQUEST_FAILURE';

/**
 * Tracks all known pages, indexed by page global ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items(state = {}, action) {
	switch (action.type) {
		case PAGES_RECEIVE:
			const pages = keyBy(action.pages, 'id');
			return Object.assign({}, state, pages);
		default:
			return state;
	}
}

/**
 * Returns the updated page requests state after an action has been
 * dispatched. The state reflects a mapping of page ID to a
 * boolean reflecting whether a request for the page is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function requests(state = {}, action) {
	switch (action.type) {
		case PAGE_REQUEST:
		case PAGE_REQUEST_SUCCESS:
		case PAGE_REQUEST_FAILURE:
			return Object.assign({}, state, { [action.pageSlug]: PAGE_REQUEST === action.type });
		default:
			return state;
	}
}

/**
 * Returns the updated page query requesting state after an action has been
 * dispatched. The state reflects a mapping of serialized query to whether a
 * network request is in-progress for that query.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queryRequests(state = {}, action) {
	switch (action.type) {
		case PAGES_REQUEST:
		case PAGES_REQUEST_SUCCESS:
		case PAGES_REQUEST_FAILURE:
			const serializedQuery = getSerializedPagesQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: PAGES_REQUEST === action.type
			});
		default:
			return state;
	}
}

/**
 * Tracks the page length for a given query.
 * @todo Bring in the "without paged" util, to reduce duplication
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function totalPages(state = {}, action) {
	switch (action.type) {
		case PAGES_REQUEST_SUCCESS:
			const serializedQuery = getSerializedPagesQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: action.totalPages
			});      
		default:
			return state;
	}
}

/**
 * Returns the updated page query state after an action has been dispatched.
 * The state reflects a mapping of serialized query key to an array of page
 * global IDs for the query, if a query response was successfully received.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function queries(state = {}, action) {
	switch (action.type) {
		case PAGES_REQUEST_SUCCESS:
			const serializedQuery = getSerializedPagesQuery(action.query);
			return Object.assign({}, state, {
				[serializedQuery]: action.pages.map((page) => page.id)
			});
		default:
			return state;
	}
}

/**
 * Tracks the slug->ID mapping for pages
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function slugs(state = {}, action) {
	switch (action.type) {
		case PAGE_REQUEST_SUCCESS:
			return Object.assign({}, state, {
				[action.pageSlug]: action.pageId
			});
		case PAGES_RECEIVE:
			const pages = reduce(action.pages, (memo, u) => {
				memo[u.slug] = u.id;
				return memo;
			}, {});
			return Object.assign({}, state, pages);
		default:
			return state;
	}
}

export default combineReducers({
	items,
	requests,
	totalPages,
	queryRequests,
	queries,
	slugs
});

/**
 * Triggers a network request to fetch pages for the specified site and query.
 *
 * @param  {String}   query  Page query
 * @return {Function}        Action thunk
 */
export function requestPages(query = {}) {
	return (dispatch) => {
		dispatch({
			type: PAGES_REQUEST,
			query
		});

		query._embed = true;

		api.get('/wp/v2/pages', query).then(pages => {
			dispatch({
				type: PAGES_RECEIVE,
				pages
			});
			requestPageCount('/wp/v2/pages', query).then(count => {
				dispatch({
					type: PAGES_REQUEST_SUCCESS,
					query,
					totalPages: count,
					pages
				});
			} );
			return null;
		}).catch((error) => {
			dispatch({
				type: PAGES_REQUEST_FAILURE,
				query,
				error
			});
		});
	};
}

/**
 * Triggers a network request to fetch a specific page from a site.
 *
 * @param  {string}   pageSlug  Page slug
 * @return {Function}           Action thunk
 */
export function requestPage(pageSlug) {
	return (dispatch) => {
		dispatch({
			type: PAGE_REQUEST,
			pageSlug
		});

		const query = {
			slug: pageSlug,
			_embed: true,
		};

		api.get('/wp/v2/pages', query).then(data => {
			const page = data[0];
			dispatch({
				type: PAGES_RECEIVE,
				pages: [page]
			});
			dispatch({
				type: PAGE_REQUEST_SUCCESS,
				pageId: page.id,
				pageSlug
			});
			return null;
		}).catch((error) => {
			dispatch({
				type: PAGE_REQUEST_FAILURE,
				pageSlug,
				error
			});
		});
	};
}

function requestPageCount(url, data = null) {
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
		return parseInt(response.headers.get('X-WP-TotalPages'), 10) || 1;
	});
}
