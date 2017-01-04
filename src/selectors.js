/**
 * Internal dependencies
 */
import {
	getSerializedPagesQuery
} from './utils';

/**
 * Returns a page object by its global ID.
 *
 * @param  {Object} state    Global state tree
 * @param  {String} globalId Page global ID
 * @return {Object}          Page object
 */
export function getPage(state, globalId) {
	return state.pages.items[globalId];
}

/**
 * Returns an array of pages for the pages query, or null if no pages have been
 * received.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Page query object
 * @return {?Array}         Pages for the page query
 */
export function getPagesForQuery(state, query) {
	const serializedQuery = getSerializedPagesQuery(query);
	if (!state.pages.queries[serializedQuery]) {
		return null;
	}

	return state.pages.queries[serializedQuery].map((globalId) => {
		return getPage(state, globalId);
	}).filter(Boolean);
}

/**
 * Returns true if currently requesting pages for the pages query, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Page query object
 * @return {Boolean}        Whether pages are being requested
 */
export function isRequestingPagesForQuery(state, query) {
	const serializedQuery = getSerializedPagesQuery(query);
	return !!state.pages.queryRequests[serializedQuery];
}

/**
 * Returns the number of total pages available for a given query.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Page query object
 * @return {int}            Number of pages
 */
export function getTotalPagesForQuery(state, query) {
	const serializedQuery = getSerializedPagesQuery(query);
	if (!state.pages.totalPages[serializedQuery]) {
		return 1;
	}

	return parseInt(state.pages.totalPages[serializedQuery], 10);
}

/**
 * Returns true if a request is in progress for the specified page, or
 * false otherwise.
 *
 * @param  {Object}  state     Global state tree
 * @param  {String}  pageSlug  Page Slug
 * @return {Boolean}           Whether request is in progress
 */
export function isRequestingPage(state, pageSlug) {
	if (!state.pages.requests) {
		return false;
	}

	return !!state.pages.requests[pageSlug];
}

/**
 * Returns the Page ID for a given page slug
 *
 * @param  {Object}  state  Global state tree
 * @param  {string}  slug   Page slug
 * @return {int}            Page ID
 */
export function getPageIdFromSlug(state, slug) {
	if (!state.pages.slugs[slug]) {
		return false;
	}

	return state.pages.slugs[slug];
}
