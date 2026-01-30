let SETTINGS = {
    dynamic_width: true,
    show_grid: false,
    show_compass: true,
    z_coloring: true
};

const PRESET_FUNCTIONS = [
    { name: "Sine Wave", formula: "10 + 10 * Math.sin(0.005 * (x * x + y * y) - time)" },
    { name: "Cosine Ring", formula: "20 * Math.cos(0.2 * Math.sqrt(x*x + y*y) - time)" },
    { name: "Hyperbolic Paraboloid", formula: "x * y / 100" },
    { name: "Cone", formula: "30 - Math.sqrt(x*x + y*y)" },
    { name: "Stairs", formula: "(Math.round(x/10) + Math.round(y/10)) * 5" },
    { name: "Tilted Plane", formula: "x/2 + y/3" },
    { name: "Paraboloid", formula: "0.1 * (x*x + y*y) - 20" },
    { name: "Egg Carton", formula: "10 * (Math.sin(x/10) + Math.cos(y/10))" },
    { name: "Volcano", formula: "40 / (1 + 0.01 * (x*x + y*y)) - 20" },
    { name: "Saddle", formula: "0.1 * (x*x - y*y)" },
    { name: "Wavy Grid", formula: "Math.sin(x/5) * Math.cos(y/5) * 15" },
    { name: "Gaussian", formula: "30 * Math.exp(-(x*x + y*y)/200)" },
    { name: "Concentric Circles", formula: "Math.sin(Math.sqrt(x*x+y*y)/5) * 10" },
    { name: "Sharp Peaks", formula: "Math.max(0, 20 - Math.abs(x) - Math.abs(y))" },
    { name: "Exponential Decay", formula: "50 * Math.exp(-Math.sqrt(x*x+y*y)/20)" },
    { name: "Interference", formula: "Math.sin(x/8) + Math.cos(y/8) * 10" },
    { name: "Checkerboard", formula: "((Math.floor(x/10) % 2) === (Math.floor(y/10) % 2)) ? 10 : 0" },

    { name: "Spiral Ramp", formula: "0.5 * Math.sqrt(x*x + y*y) + 5 * Math.sin(0.1 * Math.atan2(y, x) - time)" },
    { name: "Moving Hills", formula: "15 * Math.sin(0.1 * x + 0.1 * y - time) * Math.cos(0.1 * x - 0.1 * y - time)" },
    { name: "Pulsating Dome", formula: "30 * Math.exp(-(x*x + y*y)/300) * (1 + 0.5 * Math.sin(time))" },
    { name: "Twisted Plane", formula: "0.1 * (x * Math.cos(0.1 * y) + y * Math.sin(0.1 * x))" },
    { name: "Moving Sin Stairs", formula: "5 * (Math.round(x/10 + Math.sin(time)) + Math.round(y/10 + Math.cos(time)))" },
    { name: "Dynamic Waves", formula: "10 * Math.sin(0.2 * x + time) * Math.cos(0.2 * y + time)" },
    { name: "Rotating Peaks", formula: "20 * Math.sin(0.1 * Math.sqrt(x*x + y*y) - time) / (1 + 0.01 * (x*x + y*y))" },
    { name: "Breathing Saddle", formula: "0.1 * (x*x - y*y) * (1 + 0.3 * Math.sin(time))" },
    { name: "Oscillating Checkerboard", formula: "((Math.floor(x/10 + Math.sin(time)) % 2) === (Math.floor(y/10 + Math.cos(time)) % 2)) ? 10 : 0" },

    { name: "Moving Volcanic Waves", formula: "40 / (1 + 0.01 * (x*x + y*y)) - 20 + 5 * Math.sin(0.1 * Math.sqrt(x*x + y*y) - time)" },
    { name: "Weird Peaks and Valleys", formula: "15 * Math.sin(0.1 * x) * Math.cos(0.1 * y) + 10 * Math.sin(0.2 * Math.sqrt(x*x + y*y) - time)" },

    { name: "Random Noise", formula: "10 * (Math.random() - 0.5)" },
    { name: "Perlin Noise", formula: "10 * noise.perlin2(x / 20, y / 20)" },
    { name: "Simplex Noise", formula: "10 * noise.simplex2(x / 20, y / 20)" },
    { name: "Moving Simplex Noise", formula: "10 * noise.simplex3(x / 20, y / 20, time / 10)" }
];

let current_preset_index = 0;

function initPage() {
    try { if (typeof noise !== 'undefined' && noise.seed) 
        noise.seed(Math.random() * 7474 + performance.now());
    } catch (e) {}
}


function updateUIFromState() {
    // No Verification bcuz i dont give a fk (type shit)
    document.getElementById('nx-slider').value                      = shape.Nx;
    document.getElementById('nx-value').textContent                 = shape.Nx;
    document.getElementById('ny-slider').value                      = shape.Ny;
    document.getElementById('ny-value').textContent                 = shape.Ny;
    document.getElementById('x-min-input').value                    = shape.x_min;
    document.getElementById('x-max-input').value                    = shape.x_max;
    document.getElementById('y-min-input').value                    = shape.y_min;
    document.getElementById('y-max-input').value                    = shape.y_max;
    document.getElementById('linewidth-toggle').checked             = SETTINGS.dynamic_width;
    document.getElementById('grid-toggle').checked                  = SETTINGS.show_grid;
    document.getElementById('compass-toggle').checked               = SETTINGS.show_compass;
    document.getElementById('z-coloring-toggle').checked            = SETTINGS.z_coloring;
    document.getElementById('function-presets').selectedIndex       = current_preset_index;
    document.getElementById('function-input').value                 = PRESET_FUNCTIONS[current_preset_index].formula;
}

function initToggles() {
    const linewidth_toggle  = document.getElementById('linewidth-toggle');
    linewidth_toggle.addEventListener('change', () => SETTINGS.dynamic_width = linewidth_toggle.checked);
    const grid_toggle       = document.getElementById('grid-toggle');
    grid_toggle.addEventListener('change', () => SETTINGS.show_grid = grid_toggle.checked);
    const compass_toggle    = document.getElementById('compass-toggle');
    compass_toggle.addEventListener('change', () => SETTINGS.show_compass = compass_toggle.checked);
    const z_coloring_toggle = document.getElementById('z-coloring-toggle');
    z_coloring_toggle.addEventListener('change', () => SETTINGS.z_coloring = z_coloring_toggle.checked);
}

function initRange() {
    const x_min_input       = document.getElementById('x-min-input');
    x_min_input.addEventListener('input', () => shape.x_min = parseFloat(x_min_input.value));
    const x_max_input       = document.getElementById('x-max-input');
    x_max_input.addEventListener('input', () => shape.x_max = parseFloat(x_max_input.value));
    const y_min_input       = document.getElementById('y-min-input');
    y_min_input.addEventListener('input', () => shape.y_min = parseFloat(y_min_input.value));
    const y_max_input       = document.getElementById('y-max-input');
    y_max_input.addEventListener('input', () => shape.y_max = parseFloat(y_max_input.value));
}

function initSliders() {
    const nx_slider         = document.getElementById('nx-slider');
    const nx_value          = document.getElementById('nx-value');
    nx_slider.addEventListener('input', () => {
        shape.Nx = parseInt(nx_slider.value);
        nx_value.textContent = shape.Nx;
    });
    nx_slider.addEventListener('dblclick', () => {
        nx_slider.value = shape.BASE_NX;
        shape.Nx = shape.BASE_NX;
        nx_value.textContent = shape.Nx;
    });

    const ny_slider         = document.getElementById('ny-slider');
    const ny_value          = document.getElementById('ny-value');
    ny_slider.addEventListener('input', () => {
        shape.Ny = parseInt(ny_slider.value);
        ny_value.textContent = shape.Ny;
    });
    ny_slider.addEventListener('dblclick', () => {
        ny_slider.value     = shape.BASE_NY;
        shape.Ny            = shape.BASE_NY;
        ny_value.textContent = shape.Ny;
    });
}

function initButtons() {
    document.getElementById('reset-camera').addEventListener('click', () => camera.reset());
    document.getElementById('reset-shape').addEventListener('click', () => {
        shape.reset();
        updateUIFromState();
    });

    const help_button       = document.getElementById('help-button');
    const help_modal        = document.getElementById('help-modal');
    help_button.addEventListener('mousedown', () => {
        help_modal.classList.remove('hidden');
    });
    help_button.addEventListener('mouseup', () => {
        help_modal.classList.add('hidden');
    });
    help_button.addEventListener('mouseleave', () => {
        help_modal.classList.add('hidden');
    });
}

function initFpsSelector() {
    const fps_select       = document.getElementById('fps-select');
    fps_select.addEventListener('change', () => {
        TOTAL_FPS = parseInt(fps_select.value);
    });
}