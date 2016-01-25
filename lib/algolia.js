'use strict';

var _algoliasearch = require('algoliasearch');

var _algoliasearch2 = _interopRequireDefault(_algoliasearch);

var _config = require('config');

var _config2 = _interopRequireDefault(_config);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _themekitDocsStore = require('themekit-docs-store');

var _themekitDocsStore2 = _interopRequireDefault(_themekitDocsStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_themekitDocsStore2.default.setRef(_config2.default.get('storeFirebaseRef'));

var client = (0, _algoliasearch2.default)(_config2.default.get('algolia.appId'), _config2.default.get('algolia.writeApiKey'));
var index = client.initIndex('components');

function now() {
	return (0, _moment2.default)().format('MM/DD/YYYY HH:mm:ss');
}

function updateComponent(componentIndex) {
	var component = componentIndex.merge;
	component.objectID = component.name;
	index.saveObject(component, function (err, content) {
		if (err) {
			throw err;
		}
		console.log(now() + ' [' + component.name + '] Firebase<>Algolia object updated.');
	});
}

_themekitDocsStore2.default.onComponentAdded(updateComponent);
_themekitDocsStore2.default.onComponentChanged(updateComponent);

_themekitDocsStore2.default.onComponentRemoved(function (objectID) {
	index.deleteObject(objectID, function (err, content) {
		if (err) {
			throw err;
		}
		console.log(now() + ' [' + objectID + '] Firebase<>Algolia object deleted.');
	});
});