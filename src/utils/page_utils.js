let SETTINGS = {
    dynamic_width: true,
    show_grid: false,
    show_compass: true,
    coloring_mode: 'axis', // 'axis', 'depth', or 'none'
    coloring_axis: 'z',    // 'x', 'y', 'z'
    complex_mode: false,
    display_points: true,

    function_axis: 'z',
    
    depth_smoother: false,
    depth_smoother_factor: 0.5,
    
    render_type: 'line'
}

let current_preset_index = 0

function initPage() {
    try { if (typeof noise !== 'undefined' && noise.seed) 
        noise.seed(Math.random() * 7474 + performance.now())
    } catch (e) {}
}


function updateUIFromState() {
    // No Verification bcuz i dont give a fk (type shit)
    updateFunctionPresets()
    document.getElementById('nx-slider').value                      = shape.Nx
    document.getElementById('nx-value').textContent                 = shape.Nx
    document.getElementById('ny-slider').value                      = shape.Ny
    document.getElementById('ny-value').textContent                 = shape.Ny
    document.getElementById('depth-scale-slider').value             = shape.depth_scale
    document.getElementById('depth-scale-value').textContent        = shape.depth_scale
    document.getElementById('linewidth-toggle').checked             = SETTINGS.dynamic_width
    document.getElementById('grid-toggle').checked                  = SETTINGS.show_grid
    document.getElementById('compass-toggle').checked               = SETTINGS.show_compass
    document.getElementById('function-type-toggle').checked         = SETTINGS.complex_mode
    document.getElementById('display-points-toggle').checked        = SETTINGS.display_points
    document.getElementById('depth-smoother-toggle').checked        = SETTINGS.depth_smoother
    document.getElementById('depth-smoother-slider').value          = SETTINGS.depth_smoother_factor
    document.getElementById('depth-smoother-value').textContent     = SETTINGS.depth_smoother_factor
    document.getElementById('render-type-select').value             = SETTINGS.render_type
    document.getElementById('coloring-mode-select').value           = SETTINGS.coloring_mode
    document.getElementById('coloring-axis-select').value           = SETTINGS.coloring_axis
    document.getElementById('function-presets').selectedIndex       = current_preset_index
    document.getElementById('function-input').value                 = (SETTINGS.complex_mode ? PRESET_COMPLEX_FUNCTIONS : PRESET_FUNCTIONS)[current_preset_index].formula
    document.getElementById('pause-toggle').checked                 = isPaused
    document.getElementById('stop-vertex-recalc-toggle').checked    = isVertexRecalcStopped
    document.getElementById('function-axis-select').value           = SETTINGS.function_axis

    DOM.syncXDisplays(shape)
    DOM.syncYDisplays(shape)
}

function updateFunctionPresets() {
    const presets = SETTINGS.complex_mode ? PRESET_COMPLEX_FUNCTIONS : PRESET_FUNCTIONS
    const select = document.getElementById('function-presets')
    select.innerHTML = ''
    presets.forEach((preset, index) => {
        const option = document.createElement('option')
        option.value = index
        option.textContent = preset.name
        select.appendChild(option)
    })
}

function initToggles() {
    const linewidth_toggle  = document.getElementById('linewidth-toggle')
    linewidth_toggle.addEventListener('change', () => SETTINGS.dynamic_width = linewidth_toggle.checked)
    const grid_toggle       = document.getElementById('grid-toggle')
    grid_toggle.addEventListener('change', () => SETTINGS.show_grid = grid_toggle.checked)
    const compass_toggle    = document.getElementById('compass-toggle')
    compass_toggle.addEventListener('change', () => SETTINGS.show_compass = compass_toggle.checked)
    const coloring_mode_select = document.getElementById('coloring-mode-select')
    coloring_mode_select.addEventListener('change', () => SETTINGS.coloring_mode = coloring_mode_select.value)
    const coloring_axis_select = document.getElementById('coloring-axis-select')
    coloring_axis_select.addEventListener('change', () => SETTINGS.coloring_axis = coloring_axis_select.value)
    
    const display_points_toggle = document.getElementById('display-points-toggle')
    if (display_points_toggle) display_points_toggle.addEventListener('change', () => SETTINGS.display_points = display_points_toggle.checked)
    const function_type_toggle = document.getElementById('function-type-toggle')
    function_type_toggle.addEventListener('change', () => {
        SETTINGS.complex_mode = function_type_toggle.checked
        current_preset_index = 0
        updateUIFromState()
        shape.custom_function = new CustomFunctionManager(
            (SETTINGS.complex_mode ? PRESET_COMPLEX_FUNCTIONS : PRESET_FUNCTIONS)[0].formula
        ).func
    })

    const depth_smoother_toggle = document.getElementById('depth-smoother-toggle')
    depth_smoother_toggle.addEventListener('change', () => SETTINGS.depth_smoother = depth_smoother_toggle.checked)

    const depth_smoother_slider = document.getElementById('depth-smoother-slider')
    const depth_smoother_value = document.getElementById('depth-smoother-value')
    depth_smoother_slider.addEventListener('input', () => {
        SETTINGS.depth_smoother_factor = parseFloat(depth_smoother_slider.value)
        depth_smoother_value.textContent = SETTINGS.depth_smoother_factor
    })

    const render_type_select = document.getElementById('render-type-select')
    render_type_select.addEventListener('change', () => SETTINGS.render_type = render_type_select.value)

    const pause_toggle = document.getElementById('pause-toggle')
    pause_toggle.addEventListener('change', () => isPaused = pause_toggle.checked)
    const stop_vertex_recalc_toggle = document.getElementById('stop-vertex-recalc-toggle')
    stop_vertex_recalc_toggle.addEventListener('change', () => isVertexRecalcStopped = stop_vertex_recalc_toggle.checked)
}

function initRange() {
    const xMinSlider    = document.getElementById('x-min-slider')
    const xMaxSlider    = document.getElementById('x-max-slider')
    const xMinDisplay   = document.getElementById('x-min-display')
    const xMaxDisplay   = document.getElementById('x-max-display')

    const clampX = () => {
        let min = parseFloat(xMinSlider.value)
        let max = parseFloat(xMaxSlider.value)
        if (min > max) { const t = min; min = max; max = t; }
        shape.x_min = min; shape.x_max = max
        xMinDisplay.textContent = min
        xMaxDisplay.textContent = max
    }
    xMinSlider.addEventListener('input', clampX)
    xMaxSlider.addEventListener('input', clampX)

    const yMinSlider    = document.getElementById('y-min-slider')
    const yMaxSlider    = document.getElementById('y-max-slider')
    const yMinDisplay   = document.getElementById('y-min-display')
    const yMaxDisplay   = document.getElementById('y-max-display')

    const clampY = () => {
        let min = parseFloat(yMinSlider.value)
        let max = parseFloat(yMaxSlider.value)
        if (min > max) { const t = min; min = max; max = t; }
        shape.y_min = min; shape.y_max = max
        yMinDisplay.textContent = min
        yMaxDisplay.textContent = max
    }
    yMinSlider.addEventListener('input', clampY)
    yMaxSlider.addEventListener('input', clampY)
}

function initSliders() {
    const nx_slider         = document.getElementById('nx-slider')
    const nx_value          = document.getElementById('nx-value')
    nx_slider.addEventListener('input', () => {
        shape.Nx = parseInt(nx_slider.value)
        nx_value.textContent = shape.Nx
    })
    nx_slider.addEventListener('dblclick', () => {
        nx_slider.value = shape.BASE_NX
        shape.Nx = shape.BASE_NX
        nx_value.textContent = shape.Nx
    })

    const ny_slider         = document.getElementById('ny-slider')
    const ny_value          = document.getElementById('ny-value')
    ny_slider.addEventListener('input', () => {
        shape.Ny = parseInt(ny_slider.value)
        ny_value.textContent = shape.Ny
    })
    ny_slider.addEventListener('dblclick', () => {
        ny_slider.value     = shape.BASE_NY
        shape.Ny            = shape.BASE_NY
        ny_value.textContent = shape.Ny
    })

    const depth_scale_slider    = document.getElementById('depth-scale-slider')
    const depth_scale_value     = document.getElementById('depth-scale-value')
    depth_scale_slider.addEventListener('input', () => {
        shape.depth_scale = parseFloat(depth_scale_slider.value)
        depth_scale_value.textContent = shape.depth_scale
    })
    depth_scale_slider.addEventListener('dblclick', () => {
        depth_scale_slider.value = 1
        shape.depth_scale = 1
        depth_scale_value.textContent = shape.depth_scale
    })
}

function initButtons() {
    document.getElementById('reset-camera').addEventListener('click', () => camera.reset())
    document.getElementById('reset-shape').addEventListener('click', () => {
        shape.reset()
        updateUIFromState()
    })

    const help_button       = document.getElementById('help-button')
    const help_modal        = document.getElementById('help-modal')
    help_button.addEventListener('mousedown', () => {
        help_modal.classList.remove('hidden')
    })
    help_button.addEventListener('mouseup', () => {
        help_modal.classList.add('hidden')
    })
    help_button.addEventListener('mouseleave', () => {
        help_modal.classList.add('hidden')
    })
}

function initFpsSelector() {
    const fps_select       = document.getElementById('fps-select')
    fps_select.addEventListener('change', () => {
        TOTAL_FPS = parseInt(fps_select.value)
    })
}