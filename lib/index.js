'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _shallowequal = require('shallowequal');

var _shallowequal2 = _interopRequireDefault(_shallowequal);

var _reactRedux = require('react-redux');

var _redux = require('redux');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _selectors = require('./selectors');

var _state = require('./state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * External dependencies
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */


/**
 * Internal dependencies
 */


var debug = (0, _debug2.default)('query:child');

var QueryChildren = function (_Component) {
	_inherits(QueryChildren, _Component);

	function QueryChildren() {
		_classCallCheck(this, QueryChildren);

		return _possibleConstructorReturn(this, (QueryChildren.__proto__ || Object.getPrototypeOf(QueryChildren)).apply(this, arguments));
	}

	_createClass(QueryChildren, [{
		key: 'componentWillMount',
		value: function componentWillMount() {
			this.request(this.props);
		}
	}, {
		key: 'componentWillReceiveProps',
		value: function componentWillReceiveProps(nextProps) {
			if (this.props.childSlug === nextProps.childSlug && (0, _shallowequal2.default)(this.props.query, nextProps.query)) {
				return;
			}

			this.request(nextProps);
		}
	}, {
		key: 'request',
		value: function request(props) {
			var single = !!props.childSlug;

			if (!single && !props.requestingChildren) {
				debug('Request child list using query ' + props.query);
				props.requestChildren(props.query);
			}

			if (single && !props.requestingChild) {
				debug('Request single child ' + props.childSlug);
				props.requestChild(props.childSlug);
			}
		}
	}, {
		key: 'render',
		value: function render() {
			return null;
		}
	}]);

	return QueryChildren;
}(_react.Component);

QueryChildren.propTypes = {
	childSlug: _react.PropTypes.string,
	query: _react.PropTypes.object,
	requestingChildren: _react.PropTypes.bool,
	requestChildren: _react.PropTypes.func
};

QueryChildren.defaultProps = {
	requestChildren: function requestChildren() {}
};

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
	var childSlug = ownProps.childSlug,
	    query = ownProps.query;

	return {
		requestingChild: (0, _selectors.isRequestingChild)(state, childSlug),
		requestingChildren: (0, _selectors.isRequestingChildrenForQuery)(state, query)
	};
}, function (dispatch) {
	return (0, _redux.bindActionCreators)({
		requestChildren: _state.requestChildren,
		requestChild: _state.requestChild
	}, dispatch);
})(QueryChildren);
module.exports = exports['default'];