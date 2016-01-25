import algoliasearch from 'algoliasearch'
import config from 'config'
import moment from 'moment'

import store from 'themekit-docs-store'
store.setRef(config.get('storeFirebaseRef'))

const client = algoliasearch(config.get('algolia.appId'), config.get('algolia.writeApiKey'))
const index = client.initIndex('components')

function now () {
	return moment().format('MM/DD/YYYY HH:mm:ss')
}

function updateComponent (componentIndex) {
	let component = componentIndex.merge
	component.objectID = component.name
	index.saveObject(component, (err, content) => {
		if (err) {
			throw err
		}
		console.log(now() + ' [' + component.name + '] Firebase<>Algolia object updated.')
	})
}

store.onComponentAdded(updateComponent)
store.onComponentChanged(updateComponent)

store.onComponentRemoved((objectID) => {
	index.deleteObject(objectID, (err, content) => {
		if (err) {
			throw err
		}
		console.log(now() + ' [' + objectID + '] Firebase<>Algolia object deleted.')
	})
})