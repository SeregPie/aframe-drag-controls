/* Code copied from this version of DragControl.js: 
   https://github.com/mrdoob/three.js/blob/eadd35e44c49eee5b3910cd2b761fbdfd05d6c67/examples/jsm/controls/DragControls.js
*/

/* eslint-disable */

import AFRAME from 'aframe';

let {THREE} = AFRAME;

let {
	EventDispatcher,
	Matrix4,
	Plane,
	Raycaster,
	Vector2,
	Vector3,
} = THREE;


const _plane = new Plane();
const _raycaster = new Raycaster();

const _pointer = new Vector2();
const _offset = new Vector3();
const _intersection = new Vector3();
const _worldPosition = new Vector3();
const _inverseMatrix = new Matrix4();

class DragControls extends EventDispatcher {

	constructor( _objects, _camera, _domElement ) {

		super();

		_domElement.style.touchAction = 'none'; // disable touch scroll

		let _selected = null, _hovered = null;

		const _intersections = [];

		//

		const scope = this;

		function activate() {

			_domElement.addEventListener( 'pointermove', onPointerMove );
			_domElement.addEventListener( 'pointerdown', onPointerDown );
			_domElement.addEventListener( 'pointerup', onPointerCancel );
			_domElement.addEventListener( 'pointerleave', onPointerCancel );

		}

		function deactivate() {

			_domElement.removeEventListener( 'pointermove', onPointerMove );
			_domElement.removeEventListener( 'pointerdown', onPointerDown );
			_domElement.removeEventListener( 'pointerup', onPointerCancel );
			_domElement.removeEventListener( 'pointerleave', onPointerCancel );

			_domElement.style.cursor = '';

		}

		function dispose() {

			deactivate();

		}

		function getObjects() {

			return _objects;

		}

		function getRaycaster() {

			return _raycaster;

		}

		function onPointerMove( event ) {

			if ( scope.enabled === false ) return;

			updatePointer( event );

			_raycaster.setFromCamera( _pointer, _camera );

			if ( _selected ) {

				if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

					_selected.position.copy( _intersection.sub( _offset ).applyMatrix4( _inverseMatrix ) );

				}

				scope.dispatchEvent( { type: 'drag', object: _selected } );

				return;

			}

			// hover support

			if ( event.pointerType === 'mouse' || event.pointerType === 'pen' ) {

				_intersections.length = 0;

				_raycaster.setFromCamera( _pointer, _camera );
				_raycaster.intersectObjects( _objects, true, _intersections );

				if ( _intersections.length > 0 ) {

					const object = _intersections[ 0 ].object;

					_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( object.matrixWorld ) );

					if ( _hovered !== object && _hovered !== null ) {

						scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

						_domElement.style.cursor = 'auto';
						_hovered = null;

					}

					if ( _hovered !== object ) {

						scope.dispatchEvent( { type: 'hoveron', object: object } );

						_domElement.style.cursor = 'pointer';
						_hovered = object;

					}

				} else {

					if ( _hovered !== null ) {

						scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

						_domElement.style.cursor = 'auto';
						_hovered = null;

					}

				}

			}

		}

		function objectFromIntersection( intersection ) {

			if ( scope.transformGroup === true ) return _objects[ 0 ];

			if ( scope.transformDescendants === true ) return intersection.object;

			function findAncestorInObjectsList( object ) {

				if ( _objects.includes( object ) ) {

					return object;

				} else if ( object.parent ) {

					return findAncestorInObjectsList( object.parent );

				} else {

					return null;

				}

			}

			return findAncestorInObjectsList( intersection.object );

		}

		function onPointerDown( event ) {

			if ( scope.enabled === false ) return;

			updatePointer( event );

			_intersections.length = 0;

			_raycaster.setFromCamera( _pointer, _camera );
			_raycaster.intersectObjects( _objects, true, _intersections );

			if ( _intersections.length > 0 ) {

				_selected = objectFromIntersection( _intersections[ 0 ] );

				_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

				if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

					_inverseMatrix.copy( _selected.parent.matrixWorld ).invert();
					_offset.copy( _intersection ).sub( _worldPosition.setFromMatrixPosition( _selected.matrixWorld ) );

				}

				_domElement.style.cursor = 'move';

				scope.dispatchEvent( { type: 'dragstart', object: _selected } );

			}


		}

		function onPointerCancel() {

			if ( scope.enabled === false ) return;

			if ( _selected ) {

				scope.dispatchEvent( { type: 'dragend', object: _selected } );

				_selected = null;

			}

			_domElement.style.cursor = _hovered ? 'pointer' : 'auto';

		}

		function updatePointer( event ) {

			const rect = _domElement.getBoundingClientRect();

			_pointer.x = ( event.clientX - rect.left ) / rect.width * 2 - 1;
			_pointer.y = - ( event.clientY - rect.top ) / rect.height * 2 + 1;

		}

		activate();

		// API

		this.enabled = true;
		this.transformGroup = false;
		this.transformDescendants = true;

		this.activate = activate;
		this.deactivate = deactivate;
		this.dispose = dispose;
		this.getObjects = getObjects;
		this.getRaycaster = getRaycaster;

	}

}

export default DragControls;
