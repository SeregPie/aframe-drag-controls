import AFRAME from 'aframe';

import DragControls from './THREE.DragControls';

let name = 'drag-controls';

AFRAME.registerComponent(name, {
	schema: {
		enabled: {default: true},
		objects: {default: '*'},
	},
	init() {
		let {el} = this;
		let {
			camera,
			renderer,
		} = el.sceneEl;
		let controls = new DragControls(
			[],
			camera,
			renderer.domElement,
		);
		controls.addEventListener('dragstart', () => {
			el.emit(`${name}:changed`, {active: true}, false);
		});
		controls.addEventListener('dragend', () => {
			el.emit(`${name}:changed`, {active: false}, false);
		});
		let mapObjectToEl = new Map();
		[
			'dragstart',
			'drag',
			'dragend',
			'hoveron',
			'hoveroff',
		].forEach(type => {
			controls.addEventListener(type, ({object}) => {
				let el = mapObjectToEl.get(object);
				if (el) {
					el.emit(type, {object3D: object}, false);
				}
			});
		});
		Object.assign(this, {
			camera,
			controls,
			mapObjectToEl,
		});
	},
	update() {
		let {
			controls,
			data,
		} = this;
		let {enabled} = data;
		Object.assign(controls, {enabled});
	},
	remove() {
		this.controls.dispose();
	},
	tock() {
		let {
			controls,
			data,
			el,
			mapObjectToEl,
		} = this;
		let {
			enabled,
			objects: selector,
		} = data;
		if (enabled) {
			let els = Array.from(el.sceneEl.querySelectorAll(selector));
			let objects = [];
			mapObjectToEl.clear();
			els.forEach(el => {
				if (el.isEntity && el.object3D) {
					Object.keys(el.object3DMap).forEach(key => {
						let object = el.getObject3D(key);
						objects.push(object);
						mapObjectToEl.set(object, el);
					});
				}
			});
			controls.getObjects().splice(0, undefined, ...objects);
		}
	},
});
