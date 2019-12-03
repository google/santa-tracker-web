import api from '../../src/scene/api.js'
import Storybook from './js/storybook.js'

new Storybook(document.getElementById('module-storybook'))

api.ready(async () => {})
