// animj-generator.js

function generateJSON() {
    const animation = {
        name: document.getElementById('animationName').value,
        globalDuration: parseFloat(document.getElementById('globalDuration').value) || 0,
        tracks: []
    };

    document.querySelectorAll('#tracks > div').forEach(trackDiv => {
        const trackType = trackDiv.querySelector('.trackType').value;
        const valueType = trackDiv.querySelector('.valueType').value;
        const track = {
            trackType: trackType,
            valueType: valueType,
            data: {
                node: trackDiv.querySelector('.node').value,
                property: trackDiv.querySelector('.property').value,
                keyframes: []
            }
        };

        if (trackType === 'Raw') {
            track.data.interval = parseFloat(trackDiv.querySelector('.interval').value) || 0;
        }

        trackDiv.querySelectorAll('.keyframes > div').forEach(keyframeDiv => {
            const keyframe = {};
            if (trackType !== 'Raw') {
                keyframe.time = parseFloat(keyframeDiv.querySelector('.time').value);
            }
            keyframe.value = parseValue(keyframeDiv.querySelector('.value-container'), valueType);

            if (trackType === 'Curve') {
                keyframe.interpolation = keyframeDiv.querySelector('.interpolation').value;
                if (keyframe.interpolation === 'Tangent' || keyframe.interpolation === 'CubicBezier') {
                    keyframe.leftTangent = parseValue(keyframeDiv.querySelector('.left-tangent-value'), valueType);
                    keyframe.rightTangent = parseValue(keyframeDiv.querySelector('.right-tangent-value'), valueType);
                }
            }

            track.data.keyframes.push(keyframe);
        });

        animation.tracks.push(track);
    });

    document.getElementById('output').textContent = JSON.stringify(animation, null, 2);
}

function copyToClipboard() {
    const output = document.getElementById('output');
    navigator.clipboard.writeText(output.textContent).then(() => {
        alert('JSON copied to clipboard!');
    });
}
