import algoliasearch from 'algoliasearch'
import config from 'config'
import moment from 'moment'

///////////
// STORE //
///////////

import store from 'themekit-docs-store'
store.setRef(config.get('storeFirebaseRef'))

/////////////
// INDICES //
/////////////

const client = algoliasearch(config.get('algolia.appId'), config.get('algolia.writeApiKey'))
const componentsIndex = client.initIndex('components')
const packagesIndex = client.initIndex('packages')

componentsIndex.setSettings({
	'attributesToIndex': ['componentIdData.componentName', 'label', 'description.data'],
	'attributesForFaceting': ['packageVersionIdData.version', 'packageVersionIdData.packageId'],
	'attributeForDistinct': 'componentVersionIdData.componentId'
})
packagesIndex.setSettings({
	'attributesToIndex': ['packageIdData.packageName', 'description.data', 'readme.data'],
	'attributesForFaceting': ['packageVersionIdData.version'],
	'attributeForDistinct': 'packageIdData.objectID'
})

///////////////
// UTILITIES //
///////////////

function now () {
	return moment().format('MM/DD/YYYY HH:mm:ss')
}

function saveObject (data) {
	return this.saveObject(data).then((content) => {
		console.log(now(), '[' + data.objectID + ']', 'Firebase<>Algolia object updated.')
		return content
	})
}

function removeObject (objectID) {
	return this.deleteObject(objectID).then((content) => {
		console.log(now(), '[' + objectID + ']', 'Firebase<>Algolia object deleted.')
		return content
	})
}

//////////////
// PACKAGES //
//////////////

function savePackage (data) {
	data.objectID = data.packageVersionIdData.objectID
	saveObject.call(packagesIndex, data)
}

function removePackage (objectID) {
	removeObject.call(packagesIndex, objectID)
}

function syncPackages () {
	store.onPackageVersionAdded(savePackage)
	store.onPackageVersionChanged(savePackage)
	store.onPackageVersionRemoved(removePackage)
}

////////////////
// COMPONENTS //
////////////////

function saveComponent (data) {
	data.objectID = data.componentVersionIdData.objectID
	saveObject.call(componentsIndex, data)
}

function removeComponent (objectID) {
	removeObject.call(componentsIndex, objectID)
}

function syncComponents () {
	store.onComponentVersionAdded(saveComponent)
	store.onComponentVersionChanged(saveComponent)
	store.onComponentVersionRemoved(removeComponent)
}

//////////
// SYNC //
//////////

packagesIndex.clearIndex().then(syncPackages)
componentsIndex.clearIndex().then(syncComponents)

// syncPackages()
// syncComponents()