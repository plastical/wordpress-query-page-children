/**
 * Internal dependencies
 */
import { getSerializedChildrenQuery } from './utils';

/**
 * Returns a child object by its global ID.
 *
 * @param  {Object} state    Global state tree
 * @param  {String} globalId Child global ID
 * @return {Object}          Child object
 */
export function getChild(state, globalId) {
  return state.children.items[globalId];
}

/**
 * Returns an array of children for the children query, or null if no children have been
 * received.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Child query object
 * @return {?Array}         Children for the child query
 */
export function getChildrenForQuery(state, query) {
  const serializedQuery = getSerializedChildrenQuery(query);
  if (!state.children.queries[serializedQuery]) {
    return null;
  }

  return state.children.queries[serializedQuery].map(globalId => {
    return getChild(state, globalId);
  }).filter(Boolean);
}

/**
 * Returns true if currently requesting children for the children query, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Child query object
 * @return {Boolean}        Whether children are being requested
 */
export function isRequestingChildrenForQuery(state, query) {
  const serializedQuery = getSerializedChildrenQuery(query);
  return !!state.children.queryRequests[serializedQuery];
}

/**
 * Returns the number of total children available for a given query.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  query  Child query object
 * @return {int}            Number of children
 */
export function getTotalChildrenForQuery(state, query) {
  const serializedQuery = getSerializedChildrenQuery(query);
  if (!state.children.totalChildren[serializedQuery]) {
    return 1;
  }

  return parseInt(state.children.totalChildren[serializedQuery], 10);
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
  if (!state.children.requests) {
    return false;
  }

  return !!state.children.requests[childSlug];
}

/**
 * Returns the Child ID for a given child slug
 *
 * @param  {Object}  state  Global state tree
 * @param  {string}  slug   Child slug
 * @return {int}            Child ID
 */
export function getChildIdFromSlug(state, slug) {
  if (!state.children.slugs[slug]) {
    return false;
  }

  return state.children.slugs[slug];
}