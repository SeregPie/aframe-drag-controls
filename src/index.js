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
		[
			'dragstart',
			'drag',
			'dragend',
			'hoveron',
			'hoveroff',
		].forEach(type => {
			controls.addEventListener(type, ({object}) => {
				let el = object.el;
				if (el) {
					el.emit(type, {object3D: object}, false);
				}
			});
		});
		Object.assign(this, {
			camera,
			controls,
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
		} = this;
		let {
			enabled,
			objects: selector,
		} = data;
		if (enabled) {
			let els = Array.from(el.sceneEl.querySelectorAll(selector));
			let objects = [];
			els.forEach(el => {
				if (el.isEntity && el.object3D) {
          objects.push(el.object3D);
				}
			});
			controls.getObjects().splice(0, undefined, ...objects);
		}
	},
});
