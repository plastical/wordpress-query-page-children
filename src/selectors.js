/**
 * Internal dependencies
 */
import {
	getSerializedChildsQuery
} from './utils';

/**
 * Returns a child object by its global ID.
 *
 * @param  {Object} state    Global state tree
 * @param  {String} globalId Child global ID
 * @return {Object}          Child object
 */
export function getChild(state, globalId) {
	return state.childs.items[globalId];
}

/**
 * Returns an array of childs for the childs query, or null if no childs have been
 * received.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Child query object
 * @return {?Array}         Childs for the child query
 */
export function getChildsForQuery(state, query) {
	const serializedQuery = getSerializedChildsQuery(query);
	if (!state.childs.queries[serializedQuery]) {
		return null;
	}

	return state.childs.queries[serializedQuery].map((globalId) => {
		return getChild(state, globalId);
	}).filter(Boolean);
}

/**
 * Returns true if currently requesting childs for the childs query, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Child query object
 * @return {Boolean}        Whether childs are being requested
 */
export function isRequestingChildsForQuery(state, query) {
	const serializedQuery = getSerializedChildsQuery(query);
	return !!state.childs.queryRequests[serializedQuery];
}

/**
 * Returns the number of total childs available for a given query.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Child query object
 * @return {int}            Number of childs
 */
export function getTotalChildsForQuery(state, query) {
	const serializedQuery = getSerializedChildsQuery(query);
	if (!state.childs.totalChilds[serializedQuery]) {
		return 1;
	}

	return parseInt(state.childs.totalChilds[serializedQuery], 10);
}

/**
 * Returns true if a request is in progress for the specified child, or
 * false otherwise.
 *
 * @param  {Object}  state     Global state tree
 * @param  {String}  childSlug  Child Slug
 * @return {Boolean}           Whether request is in progress
 */
export function isRequestingChild(state, childSlug) {
	if (!state.childs.requests) {
		return false;
	}

	return !!state.childs.requests[childSlug];
}

/**
 * Returns the Child ID for a given child slug
 *
 * @param  {Object}  state  Global state tree
 * @param  {string}  slug   Child slug
 * @return {int}            Child ID
 */
export function getChildIdFromSlug(state, slug) {
	if (!state.childs.slugs[slug]) {
		return false;
	}

	return state.childs.slugs[slug];
}
