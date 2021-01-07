# aframe-drag-controls

A wrapper for `THREE.DragControls`.

## setup

### npm

```shell
npm i aframe-drag-controls
```

---

```javascript
import AFRAME from 'aframe';
import 'aframe-drag-controls';
```

### browser

```html
<script src="https://unpkg.com/aframe"></script>
<script src="https://unpkg.com/aframe-drag-controls"></script>
```

## usage

```html
<a-scene>
  <a-entity
    camera
    drag-controls="objects: .draggable"
    look-controls
    orbit-controls="initialPosition: 0 5 15"
  ></a-entity>
  <a-box
    class="draggable"
  ></a-box>
</a-scene>
```

```javascript
let sceneEl = document.querySelector('a-scene');
{
  let el = sceneEl.querySelector('[camera]');
  el.addEventListener('drag-controls:changed', event => {
    event.target.setAttribute('orbit-controls', 'enabled', !event.detail.active);
  });
}
{
  let onDragStart = (event => {
    event.target.setAttribute('color', 'DeepSkyBlue');
  });
  let onDragEnd = (event => {
    event.target.removeAttribute('color');
  });
  let els = sceneEl.querySelectorAll('a-box.draggable');
  for (let el of els) {
    el.addEventListener('dragstart', onDragStart);
    el.addEventListener('dragend', onDragEnd);
  }
}
```

## properties

| name | type | default |
| ---: | :--- | :--- |
| `enabled` | `'boolean'` | `true` |
| `objects` | `'string'` | `'*'` |


## events

| name |
| ---: |
| `drag-controls:changed` |
