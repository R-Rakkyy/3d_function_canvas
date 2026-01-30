const pressedKeys = new Set();

function isInputFocused() {
    return (document.activeElement.tagName === 'INPUT' 
    || document.activeElement.tagName === 'SELECT' 
    || document.activeElement.tagName === 'TEXTAREA');
}

/* INPUT FUNCTIONS UTILITY HERE */
function initFunctionPresets() {
    const presets_select = document.getElementById('function-presets');
    PRESET_FUNCTIONS.forEach(preset => {
        const option                = document.createElement('option');
        option.value                = preset.formula;
        option.textContent          = preset.name;
        presets_select.appendChild(option);
    });
    presets_select.addEventListener('change', () => {
        // TO DO (rework it)
        const function_input        = document.getElementById('function-input');
        function_input.value        = presets_select.value;
        try {
            const func              = new Function('x', 'y', 'time', 'return ' + function_input.value);
            shape.z_func            = func;
            current_preset_index    = presets_select.selectedIndex;
        } catch (e) {
            alert('Invalid function');
        }
    });
}

function updatePresetFunction() {
    // TO DO (rework it)
    const new_formula = PRESET_FUNCTIONS[current_preset_index].formula;
    shape.z_func = new Function('x', 'y', 'time', 'return ' + new_formula);
    document.getElementById('function-input').value = new_formula;
    document.getElementById('function-presets').selectedIndex = current_preset_index;
}


function initFunctionInput() {
    initFunctionPresets();
    const function_input    = document.getElementById('function-input');
    function_input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            try {
                const func = new Function('x', 'y', 'time', 'return ' + function_input.value);
                shape.z_func = func;
                function_input.blur();
            } catch (e) {
                alert('Invalid function');
            }
        }
    });
}
/* **************************************************** */

function handleCtrlShortcuts(event) {
    if (!event.ctrlKey) return;

    let prevent = true;
    const x_min_input = document.getElementById('x-min-input');
    const x_max_input = document.getElementById('x-max-input');
    const y_min_input = document.getElementById('y-min-input');
    const y_max_input = document.getElementById('y-max-input');

    switch (event.key) {
        case '+':
        case '=':
            shape.Nx                                        = Math.min(200, shape.Nx + 1);
            shape.Ny                                        = Math.min(200, shape.Ny + 1);
            document.getElementById('nx-slider').value      = shape.Nx;
            document.getElementById('nx-value').textContent = shape.Nx;
            document.getElementById('ny-slider').value      = shape.Ny;
            document.getElementById('ny-value').textContent = shape.Ny;
            break;
        case '-':
            shape.Nx                                        = Math.max(2, shape.Nx - 1);
            shape.Ny                                        = Math.max(2, shape.Ny - 1);
            document.getElementById('nx-slider').value      = shape.Nx;
            document.getElementById('nx-value').textContent = shape.Nx;
            document.getElementById('ny-slider').value      = shape.Ny;
            document.getElementById('ny-value').textContent = shape.Ny;
            break;
        case 'ArrowLeft':
            shape.x_min             -= 1;
            shape.x_max             -= 1;
            x_min_input.value       = shape.x_min;
            x_max_input.value       = shape.x_max;
            break;
        case 'ArrowRight':
            shape.x_min             += 1;
            shape.x_max             += 1;
            x_min_input.value       = shape.x_min;
            x_max_input.value       = shape.x_max;
            break;
        case 'ArrowUp':
            shape.y_min             += 1;
            shape.y_max             += 1;
            y_min_input.value       = shape.y_min;
            y_max_input.value       = shape.y_max;
            break;
        case 'ArrowDown':
            shape.y_min             -= 1;
            shape.y_max             -= 1;
            y_min_input.value       = shape.y_min;
            y_max_input.value       = shape.y_max;
            break;
        default:
            prevent                 = false;
    }
    if (prevent) {
        event.preventDefault();
    }
}


function initKeyboardListeners() {
    window.addEventListener('keydown', (event) => {
        const key = event.key.toLowerCase();
        if (document.pointerLockElement === render) {
            if (key === 'escape') {
               document.exitPointerLock();
            }
            if (key === 't' || key === 'enter') {
                document.exitPointerLock();
                document.getElementById('function-input').focus();
            }
            if (key === 'f') {
                current_preset_index = (current_preset_index + 1) % PRESET_FUNCTIONS.length;
                updatePresetFunction();
            }
            if (key === 'g') {
                current_preset_index = (current_preset_index - 1 + PRESET_FUNCTIONS.length) % PRESET_FUNCTIONS.length;
                updatePresetFunction();
            }
            handleCtrlShortcuts(event);
        } else if (isInputFocused()) {
            if (key === 'escape') {
                document.activeElement.blur();
            }
        } else {
            switch (key) {
                case 'f':
                    current_preset_index = (current_preset_index + 1) % PRESET_FUNCTIONS.length;
                    updatePresetFunction();
                    break;
                case 'g':
                    current_preset_index = (current_preset_index - 1 + PRESET_FUNCTIONS.length) % PRESET_FUNCTIONS.length;
                    updatePresetFunction();
                    break;
                case 't':
                case 'enter':
                    event.preventDefault();
                    document.getElementById('function-input').focus();
                    break;
            }
            handleCtrlShortcuts(event);
        }
        if (isInputFocused() || event.ctrlKey) return;
        pressedKeys.add(key);
    });

    window.addEventListener('keyup', (event) => {
        pressedKeys.delete(event.key.toLowerCase());
    });

    window.addEventListener('blur', () => {
        pressedKeys.clear();
    });
}

function initInputs() {
    initSliders();
    initButtons();
    initFunctionInput();
    initFpsSelector();
    initToggles();
    initRange();
    updateUIFromState();

    const render = document.getElementById('render');
    render.addEventListener('click', () => { 
        if (document.pointerLockElement !== render) {
            render.requestPointerLock();
        }
    });

    document.addEventListener('pointerlockchange', () => {
        if (document.pointerLockElement === render) {
            document.addEventListener("mousemove", camera.updateRotation, false);
        } else {
            document.removeEventListener("mousemove", camera.updateRotation, false);
            pressedKeys.clear();
        }
    });

    initKeyboardListeners();
    
}
