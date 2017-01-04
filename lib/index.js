/**
 * External dependencies
 */
import { Component, PropTypes } from 'react';
import shallowEqual from 'shallowequal';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { isRequestingChildrenForQuery, isRequestingChild } from './selectors';
import { requestChildren, requestChild } from './state';

const debug = debugFactory('query:child');

class QueryChildren extends Component {
	componentWillMount() {
		this.request(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.childSlug === nextProps.childSlug && shallowEqual(this.props.query, nextProps.query)) {
			return;
		}

		this.request(nextProps);
	}

	request(props) {
		const single = !!props.childSlug;

		if (!single && !props.requestingChildren) {
			debug(`Request child list using query ${ props.query }`);
			props.requestChildren(props.query);
		}

		if (single && !props.requestingChild) {
			debug(`Request single child ${ props.childSlug }`);
			props.requestChild(props.childSlug);
		}
	}

	render() {
		return null;
	}
}

QueryChildren.propTypes = {
	childSlug: PropTypes.string,
	query: PropTypes.object,
	requestingChildren: PropTypes.bool,
	requestChildren: PropTypes.func
};

QueryChildren.defaultProps = {
	requestChildren: () => {}
};

export default connect((state, ownProps) => {
	const { childSlug, query } = ownProps;
	return {
		requestingChild: isRequestingChild(state, childSlug),
		requestingChildren: isRequestingChildrenForQuery(state, query)
	};
}, dispatch => {
	return bindActionCreators({
		requestChildren,
		requestChild
	}, dispatch);
})(QueryChildren);