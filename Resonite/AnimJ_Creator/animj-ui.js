// animj-ui.js

function addTrack() {
    const tracksDiv = document.getElementById('tracks');
    const trackDiv = document.createElement('div');
    trackDiv.className = 'track';
    trackDiv.innerHTML = `
        <h3>Track ${++trackCount}</h3>
        <select class="trackType" onchange="updateTrackType(this)">
            <option value="Raw">Raw</option>
            <option value="Discrete">Discrete</option>
            <option value="Curve">Curve</option>
        </select>
        <select class="valueType" onchange="updateValueType(this)">
            ${valueTypes.map(type => `<option value="${type}">${type}</option>`).join('')}
        </select>
        <input type="text" class="node" placeholder="Node">
        <input type="text" class="property" placeholder="Property">
        <div class="keyframes"></div>
        <button onclick="addKeyframe(this)">Add Keyframe</button>
        <button class="remove-btn" onclick="removeTrack(this)">Remove Track</button>
        <input type="number" class="interval" placeholder="Interval (for Raw type)" style="display:none;">
    `;
    tracksDiv.appendChild(trackDiv);
}

function updateTrackType(select) {
    const trackDiv = select.closest('.track');
    const intervalInput = trackDiv.querySelector('.interval');
    const keyframesDiv = trackDiv.querySelector('.keyframes');
    const interpolationSelects = trackDiv.querySelectorAll('.interpolation');

    if (select.value === 'Raw') {
        intervalInput.style.display = 'inline-block';
        keyframesDiv.innerHTML = '';
        addKeyframe(trackDiv.querySelector('button'));
    } else {
        intervalInput.style.display = 'none';
    }

    interpolationSelects.forEach(sel => {
        sel.style.display = select.value === 'Curve' ? 'inline-block' : 'none';
    });

    updateKeyframeOrder(keyframesDiv);
}

function updateValueType(select) {
    const trackDiv = select.closest('.track');
    const keyframes = trackDiv.querySelectorAll('.keyframe');
    keyframes.forEach(keyframe => {
        updateValueInputType(keyframe.querySelector('.value-container'), select.value);
    });
}

function addKeyframe(button) {
    const keyframesDiv = button.previousElementSibling;
    const keyframeDiv = document.createElement('div');
    keyframeDiv.className = 'keyframe';
    const trackType = button.closest('.track').querySelector('.trackType').value;
    const valueType = button.closest('.track').querySelector('.valueType').value;

    keyframeDiv.innerHTML = `
        <span class="keyframe-number"></span>
        ${trackType !== 'Raw' ? '<input type="number" class="time" placeholder="Time" step="0.01">' : ''}
        <div class="value-container"></div>
        <select class="interpolation" style="display:none;">
            <option value="Linear">Linear</option>
            <option value="Tangent">Tangent</option>
            <option value="Hold">Hold</option>
            <option value="CubicBezier">CubicBezier</option>
        </select>
        <button class="order-btn" onclick="moveKeyframeUp(this)">↑</button>
        <button class="order-btn" onclick="moveKeyframeDown(this)">↓</button>
        <button class="remove-btn" onclick="removeKeyframe(this)">Remove</button>
    `;
    keyframesDiv.appendChild(keyframeDiv);

    if (trackType === 'Curve') {
        keyframeDiv.querySelector('.interpolation').style.display = 'inline-block';
    }

    updateValueInputType(keyframeDiv.querySelector('.value-container'), valueType);
    updateKeyframeOrder(keyframesDiv);
}

function removeTrack(button) {
    button.closest('.track').remove();
    updateTrackNumbers();
}

function removeKeyframe(button) {
    const keyframesDiv = button.closest('.keyframes');
    button.closest('.keyframe').remove();
    updateKeyframeOrder(keyframesDiv);
}

function moveKeyframeUp(button) {
    const keyframe = button.closest('.keyframe');
    const prevKeyframe = keyframe.previousElementSibling;
    if (prevKeyframe) {
        keyframe.parentNode.insertBefore(keyframe, prevKeyframe);
        updateKeyframeOrder(keyframe.closest('.keyframes'));
    }
}

function moveKeyframeDown(button) {
    const keyframe = button.closest('.keyframe');
    const nextKeyframe = keyframe.nextElementSibling;
    if (nextKeyframe) {
        keyframe.parentNode.insertBefore(nextKeyframe, keyframe);
        updateKeyframeOrder(keyframe.closest('.keyframes'));
    }
}

function updateValueInputType(container, valueType) {
    container.innerHTML = '';
    if (valueType.startsWith('bool')) {
        const count = valueType === 'bool' ? 1 : parseInt(valueType.slice(-1));
        for (let i = 0; i < count; i++) {
            container.innerHTML += `
                <select class="bool-value">
                    <option value="true">true</option>
                    <option value="false">false</option>
                </select>
            `;
        }
    } else if (['byte', 'sbyte', 'short', 'ushort', 'int', 'uint', 'long', 'ulong'].includes(valueType)) {
        container.innerHTML = '<input type="number" step="1">';
    } else if (['float', 'double'].includes(valueType)) {
        container.innerHTML = '<input type="number" step="any">';
    } else if (valueType.includes('2') || valueType.includes('3') || valueType.includes('4') || valueType === 'floatQ' || valueType === 'doubleQ') {
        const count = valueType.endsWith('Q') ? 4 : parseInt(valueType.slice(-1));
        for (let i = 0; i < count; i++) {
            container.innerHTML += `<input type="number" step="any" placeholder="${['x', 'y', 'z', 'w'][i]}">`;
        }
    } else if (valueType === 'color' || valueType === 'color32') {
        container.innerHTML = `
            <input type="number" step="0.01" min="0" max="1" placeholder="R">
            <input type="number" step="0.01" min="0" max="1" placeholder="G">
            <input type="number" step="0.01" min="0" max="1" placeholder="B">
            <input type="number" step="0.01" min="0" max="1" placeholder="A">
        `;
    } else {
        container.innerHTML = '<input type="text">';
    }
}

function updateTrackNumbers() {
    document.querySelectorAll('.track').forEach((track, index) => {
        track.querySelector('h3').textContent = `Track ${index + 1}`;
    });
    trackCount = document.querySelectorAll('.track').length;
}

function updateKeyframeOrder(container) {
    container.querySelectorAll('.keyframe').forEach((keyframe, index) => {
        keyframe.querySelector('.keyframe-number').textContent = `#${index + 1}`;
    });
}
