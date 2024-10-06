// animj-core.js

const valueTypes = [
    "bool", "bool2", "bool3", "bool4",
    "byte", "sbyte", "short", "ushort", "int", "uint", "long", "ulong",
    "float", "double",
    "int2", "int3", "int4", "uint2", "uint3", "uint4", "long2", "long3", "long4",
    "float2", "float3", "float4", "floatQ",
    "double2", "double3", "double4", "doubleQ",
    "color", "color32", "string"
];

let trackCount = 0;

function parseValue(container, type) {
    if (type.startsWith('bool')) {
        const boolValues = Array.from(container.querySelectorAll('.bool-value')).map(select => select.value === 'true');
        return type === 'bool' ? boolValues[0] : boolValues;
    } else if (['byte', 'sbyte', 'short', 'ushort', 'int', 'uint', 'long', 'ulong'].includes(type)) {
        return parseInt(container.querySelector('input').value);
    } else if (['float', 'double'].includes(type)) {
        return parseFloat(container.querySelector('input').value);
    } else if (type.includes('2') || type.includes('3') || type.includes('4') || type === 'floatQ' || type === 'doubleQ') {
        return Array.from(container.querySelectorAll('input')).map(input => parseFloat(input.value));
    } else if (type === 'color' || type === 'color32') {
        return Array.from(container.querySelectorAll('input')).reduce((obj, input, index) => {
            obj[['r', 'g', 'b', 'a'][index]] = parseFloat(input.value);
            return obj;
        }, {});
    } else {
        return container.querySelector('input').value;
    }
}
