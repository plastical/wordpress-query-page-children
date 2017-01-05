/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import keyBy from 'lodash/keyBy';

/**
 * Internal dependencies
 */
import * as selectors from '../src/selectors';
import children from './fixtures/children';

const childrenById = keyBy(children, 'id');

const state = deepFreeze({
	children: {
		items: childrenById,
		requests: {
			'test-child': false,
			'pending-child': true,
		},
		totalChildren: {
			'{"paged":1}': '3',
			'{"paged":2}': '3',
		},
		queryRequests: {
			'{"paged":1}': false,
			'{"paged":2}': false,
			'{"paged":3}': true,
		},
		queries: {
			'{"paged":1}': [
				2,
				5,
			],
			'{"paged":2}': [
				6,
				8,
			]
		},
		slugs: {
			'test-child': 2,
			'another-child': 5,
			'another-child-another-child': 6,
			'child-another-child': 8,
		}
	}
});

describe('Child selectors', function() {
	it('should contain isRequestingChild method', function() {
		expect(selectors.isRequestingChild).to.be.a('function');
	});

	it('should contain getChildIdFromSlug method', function() {
		expect(selectors.getChildIdFromSlug).to.be.a('function');
	});

	it('should contain getChild method', function() {
		expect(selectors.getChild).to.be.a('function');
	});

	it('should contain isRequestingChildrenForQuery method', function() {
		expect(selectors.isRequestingChildrenForQuery).to.be.a('function');
	});

	it('should contain getChildrenForQuery method', function() {
		expect(selectors.getChildrenForQuery).to.be.a('function');
	});

	it('should contain getTotalChildrenForQuery method', function() {
		expect(selectors.getTotalChildrenForQuery).to.be.a('function');
	});

	describe('isRequestingChild', function() {
		it('Should get `false` if the child has not been requested yet', function() {
			expect(selectors.isRequestingChild(state, 'unrequested-child')).to.be.false;
		});

		it('Should get `false` if this child has already been fetched', function() {
			expect(selectors.isRequestingChild(state, 'test-child')).to.be.false;
		});

		it('Should get `true` if this child is being fetched', function() {
			expect(selectors.isRequestingChild(state, 'pending-child')).to.be.true;
		});
	});

	describe('getChildIdFromSlug', function() {
		it('Should get `false` if the child has not been requested yet', function() {
			expect(selectors.getChildIdFromSlug( state, 'unrequested-child')).to.be.false;
		});

		it( 'Should get the child ID if this child is in our state', function() {
			expect(selectors.getChildIdFromSlug( state, 'test-child')).to.eql(2);
		});
	});

	describe('getChild', function() {
		it('Should get `undefined` if the child has not been requested yet', function() {
			expect(selectors.getChild(state, 10)).to.be.undefined;
		});

		it('Should get the child object if this child is in our state', function() {
			expect(selectors.getChild(state, 2)).to.eql(childrenById[2]);
		});
	});

	describe('isRequestingChildrenForQuery', function() {
		it('Should get `false` if the child query has not been requested yet', function() {
			expect(selectors.isRequestingChildrenForQuery(state, { paged: 4 })).to.be.false;
		});

		it('Should get `false` if this child query has already been fetched', function() {
			expect(selectors.isRequestingChildrenForQuery(state, { paged: 1 } )).to.be.false;
		});

		it('Should get `true` if this child query is being fetched', function() {
			expect(selectors.isRequestingChildrenForQuery(state, { paged: 3 })).to.be.true;
		});
	});

	describe('getChildrenForQuery', function() {
		it('Should get null if the child query has not been requested yet', function() {
			expect(selectors.getChildrenForQuery(state, { paged: 4 })).to.be.null;
		});

		it('Should get a list of child objects if the response is in our state', function() {
			const childList = [
				childrenById[2],
				childrenById[5]
			];
			expect(selectors.getChildrenForQuery(state, { paged: 1 })).to.eql(childList);
		});
	});

	describe('getTotalChildrenForQuery', function() {
		it('Should get a default number (1) of pages available if the query has not been requested yet', function() {
			expect(selectors.getTotalChildrenForQuery(state, { paged: 4 })).to.eql(1);
		});

		it('Should get the number of pages (pagination) available for a query', function() {
			expect(selectors.getTotalChildrenForQuery(state, { paged: 1 })).to.eql(3);
		});
	});
});
