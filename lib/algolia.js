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

/////////////
// INDICES //
/////////////

///////////
// STORE //
///////////

var client = (0, _algoliasearch2.default)(_config2.default.get('algolia.appId'), _config2.default.get('algolia.writeApiKey'));
var componentsIndex = client.initIndex('components');
var packagesIndex = client.initIndex('packages');

componentsIndex.setSettings({
	'attributesToIndex': ['componentIdData.componentName', 'label', 'description.data'],
	'attributesForFaceting': ['packageVersionIdData.version', 'packageVersionIdData.packageId'],
	'attributeForDistinct': 'componentVersionIdData.componentId'
});
packagesIndex.setSettings({
	'attributesToIndex': ['packageIdData.packageName', 'description.data', 'readme.data'],
	'attributesForFaceting': ['packageVersionIdData.version'],
	'attributeForDistinct': 'packageIdData.objectID'
});

///////////////
// UTILITIES //
///////////////

function now() {
	return (0, _moment2.default)().format('MM/DD/YYYY HH:mm:ss');
}

function saveObject(data) {
	return this.saveObject(data).then(function (content) {
		console.log(now(), '[' + data.objectID + ']', 'Firebase<>Algolia object updated.');
		return content;
	});
}

function removeObject(objectID) {
	return this.deleteObject(objectID).then(function (content) {
		console.log(now(), '[' + objectID + ']', 'Firebase<>Algolia object deleted.');
		return content;
	});
}

//////////////
// PACKAGES //
//////////////

function savePackage(data) {
	data.objectID = data.packageVersionIdData.objectID;
	saveObject.call(packagesIndex, data);
}

function removePackage(objectID) {
	removeObject.call(packagesIndex, objectID);
}

function syncPackages() {
	_themekitDocsStore2.default.onPackageVersionAdded(savePackage);
	_themekitDocsStore2.default.onPackageVersionChanged(savePackage);
	_themekitDocsStore2.default.onPackageVersionRemoved(removePackage);
}

////////////////
// COMPONENTS //
////////////////

function saveComponent(data) {
	data.objectID = data.componentVersionIdData.objectID;
	saveObject.call(componentsIndex, data);
}

function removeComponent(objectID) {
	removeObject.call(componentsIndex, objectID);
}

function syncComponents() {
	_themekitDocsStore2.default.onComponentVersionAdded(saveComponent);
	_themekitDocsStore2.default.onComponentVersionChanged(saveComponent);
	_themekitDocsStore2.default.onComponentVersionRemoved(removeComponent);
}

//////////
// SYNC //
//////////

packagesIndex.clearIndex().then(syncPackages);
componentsIndex.clearIndex().then(syncComponents);

// syncPackages()
// syncComponents()