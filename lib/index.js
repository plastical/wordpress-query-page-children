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
import { isRequestingPagesForQuery, isRequestingPage } from './selectors';
import { requestPages, requestPage } from './state';

const debug = debugFactory('query:page');

class QueryPages extends Component {
	componentWillMount() {
		this.request(this.props);
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.pageSlug === nextProps.pageSlug && shallowEqual(this.props.query, nextProps.query)) {
			return;
		}

		this.request(nextProps);
	}

	request(props) {
		const single = !!props.pageSlug;

		if (!single && !props.requestingPages) {
			debug(`Request page list using query ${ props.query }`);
			props.requestPages(props.query);
		}

		if (single && !props.requestingPage) {
			debug(`Request single page ${ props.pageSlug }`);
			props.requestPage(props.pageSlug);
		}
	}

	render() {
		return null;
	}
}

QueryPages.propTypes = {
	pageSlug: PropTypes.string,
	query: PropTypes.object,
	requestingPages: PropTypes.bool,
	requestPages: PropTypes.func
};

QueryPages.defaultProps = {
	requestPages: () => {}
};

export default connect((state, ownProps) => {
	const { pageSlug, query } = ownProps;
	return {
		requestingPage: isRequestingPage(state, pageSlug),
		requestingPages: isRequestingPagesForQuery(state, query)
	};
}, dispatch => {
	return bindActionCreators({
		requestPages,
		requestPage
	}, dispatch);
})(QueryPages);