/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import {
	// action-types
	CHILD_REQUEST,
	CHILD_REQUEST_FAILURE,
	CHILD_REQUEST_SUCCESS,
	CHILDREN_RECEIVE,
	CHILDREN_REQUEST,
	CHILDREN_REQUEST_FAILURE,
	CHILDREN_REQUEST_SUCCESS,
	// reducers
	items,
	requests,
	totalChildren,
	queryRequests,
	queries,
	slugs
} from '../src/state';

import children from './fixtures/children';
import child from './fixtures/single';

describe('Child reducer', () => {
	describe('items', () => {
		it( 'should have no change by default', () => {
			const newState = items(undefined, {});
			expect(newState).to.eql( {});
		});

		it('should store the new children in state', () => {
			const newState = items(undefined, { type: CHILDREN_RECEIVE, children });
			const childrenById = keyBy(children, 'id');
			expect(newState).to.eql(childrenById);
		});
	});

	describe('queryRequests', () => {
		it('should have no change by default', () => {
			const newState = queryRequests(undefined, {});
			expect(newState).to.eql({});
		});

		it('should track the requesting state of new queries', () => {
			const newState = queryRequests(undefined, {type: CHILDREN_REQUEST, query: {paged: 1}});
			expect(newState).to.eql({'{"paged":1}': true});
		});

		it('should track the requesting state of successful queries', () => {
			const originalState = deepFreeze({'{"paged":1}': true});
			const newState = queryRequests(originalState, {type: CHILDREN_REQUEST_SUCCESS, query: {paged: 1}});
			expect(newState).to.eql({'{"paged":1}': false});
		});

		it('should track the requesting state of failed queries', () => {
			const originalState = deepFreeze({'{"paged":1}': true });
			const newState = queryRequests(originalState, {type: CHILDREN_REQUEST_FAILURE, query: {paged: 1}});
			expect(newState).to.eql({'{"paged":1}': false});
		});
	});

	describe('requests', () => {
		it('should have no change by default', () => {
			const newState = requests(undefined, {});
			expect(newState).to.eql({});
		});

		it('should track the requesting state of a new child', () => {
			const newState = requests(undefined, {type: CHILD_REQUEST, childSlug: 'some-pending-slug'});
			expect(newState).to.eql({'some-pending-slug': true});
		});

		it('should track the requesting state of successful child requests', () => {
			const originalState = deepFreeze({'some-pending-slug': true});
			const newState = requests(originalState, {type: CHILD_REQUEST_SUCCESS, childSlug: 'some-pending-slug'});
			expect(newState).to.eql({'some-pending-slug': false});
		});

		it('should track the requesting state of failed child requests', () => {
			const originalState = deepFreeze({'some-pending-slug': true});
			const newState = requests(originalState, {type: CHILD_REQUEST_FAILURE, childSlug: 'some-pending-slug'});
			expect(newState).to.eql({ 'some-pending-slug': false } );
		});
	});

	describe('queries', () => {
		it('should have no change by default', () => {
			const newState = queries(undefined, {});
			expect(newState).to.eql({});
		});

		it('should track the child IDs for requested queries', () => {
			const action = {
				type: CHILDREN_REQUEST_SUCCESS,
				query: {paged: 1},
				children
			};
			const newState = queries(undefined, action);
			expect(newState).to.eql({ '{"paged":1}': [2, 5, 6, 8] });
		});

		it('should track the child IDs for additional requested queries', () => {
			const originalState = deepFreeze({ '{"paged":1}': [2, 5, 6, 8] });
			const action = {
				type: CHILDREN_REQUEST_SUCCESS,
				query: {paged: 2},
				children: [child]
			};
			const newState = queries(originalState, action);
			expect(newState).to.eql({
				'{"paged":1}': [2, 5, 6, 8],
				'{"paged":2}': [9]
			});
		});
	});

	describe('slugs', () => {
		it('should have no change by default', () => {
			const newState = slugs(undefined, {});
			expect( newState ).to.eql({});
		});

		it('should track the child IDs for requested child slugs', () => {
			const action = {
				type: CHILD_REQUEST_SUCCESS,
				childId: 2,
				childSlug: 'test-child',
			};
			const newState = slugs(undefined, action);
			expect(newState).to.eql({'test-child': 2});
		});

		it('should track the child IDs for additional requested child slugs', () => {
			const originalState = deepFreeze({'test-child': 2});
			const action = {
				type: CHILD_REQUEST_SUCCESS,
				childId: 9,
				childSlug: 'test-oooo-child',
			};
			const newState = slugs(originalState, action);
			expect(newState).to.eql({
				'test-child': 2,
				'test-oooo-child': 9
			});
		});
	});

	describe('totalChildren', () => {
		it('should have no change by default', () => {
			const newState = totalChildren(undefined,{});
			expect(newState).to.eql({});
		});

		it('should track the pagination count for requested queries', () => {
			const action = {
				type: CHILDREN_REQUEST_SUCCESS,
				query: {paged: 1},
				totalChildren: 3
			};
			const newState = totalChildren(undefined, action);
			expect(newState).to.eql({ '{"paged":1}': 3 });
		});
	});
});
