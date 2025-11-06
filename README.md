# Cellular Automata Studio

A beautiful, interactive web application for creating and exploring cellular automata patterns. Experience the mesmerizing world of emergent complexity through 2D (Conway's Game of Life), 1D (Wolfram Elementary) cellular automata, and artistic image dithering with 3D depth effects.

## Features

### Three Modes of Cellular Automata

**2D Mode - Game of Life Variants**
- Classic Conway's Game of Life implementation
- Fully customizable birth and survival rules (B/S notation)
- Interactive canvas for drawing custom patterns
- Adjustable cell size for different grid resolutions
- Support for famous patterns: Gliders, Pulsars, Gosper Glider Gun, and more

**1D Mode - Elementary Cellular Automata**
- All 256 Wolfram elementary rules (Rule 0-255)
- Visual rule lookup table
- Famous patterns like Rule 30 (chaotic) and Rule 110 (universal)
- Watch patterns evolve from top to bottom

**Dither Mode - Image Processing**
- Upload images for artistic dithering effects
- Floyd-Steinberg dithering algorithm
- Adjustable threshold, contrast, and scale controls
- 3D depth layering with parallax effects
- Transform photos into cellular automata-style art

### Interactive Controls

- **Play/Pause/Step**: Full control over animation timing
- **Speed Control**: Adjust FPS from 1 to 60
- **Draw Mode**: Click and drag to create custom patterns
- **Random Fill**: Generate random starting configurations
- **Clear Canvas**: Reset to blank state
- **Preset Patterns**: Load classic automata patterns instantly

### Customization Options

- **Custom Rules**: Define your own birth and survival conditions (2D)
- **Rule Selection**: Explore all 256 elementary rules (1D)
- **Color Themes**: Customize alive and dead cell colors
- **Grid Size**: Adjust cell size for different perspectives

## How to Use

1. **Open the App**: Simply open `index.html` in a modern web browser
2. **Choose a Mode**: Select between 2D (Game of Life), 1D (Elementary), or Dither (Image) modes
3. **Draw Patterns**: Click and drag on the canvas to draw living cells (2D/1D modes)
4. **Or Upload an Image**: In Dither mode, upload an image to apply artistic dithering effects
5. **Or Use Presets**: Try classic patterns like Gliders, Pulsars, or Rule 30
6. **Customize Rules**: Experiment with different birth/survival rules or rule numbers
7. **Animate**: Press Play to watch your patterns evolve
8. **Adjust Speed**: Use the speed slider to control animation FPS
9. **Enable Parallax**: Toggle parallax effects and 3D depth for stunning visual effects

## Getting Started

### Quick Start

No installation required! Just open `index.html` in your browser:

```bash
# If you want to use a local server (optional):
python3 -m http.server 8000
# Then open http://localhost:8000 in your browser
```

### Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Understanding Cellular Automata

### 2D Cellular Automata (Game of Life)

Each cell has 8 neighbors. Rules determine cell fate:
- **Birth**: How many neighbors cause a dead cell to become alive
- **Survival**: How many neighbors keep a living cell alive

**Classic Conway's Rules (B3/S23):**
- A dead cell with exactly 3 neighbors becomes alive (birth)
- A living cell with 2 or 3 neighbors stays alive (survival)
- All other cells die or stay dead

### 1D Elementary Automata

Each cell has 2 neighbors (left and right). A rule number (0-255) defines the lookup table:
- The rule number's binary representation determines outcomes
- Each of the 8 possible 3-cell patterns maps to a new state

**Famous Rules:**
- **Rule 30**: Produces chaotic, random-looking patterns
- **Rule 110**: Proven to be Turing complete (universal computation)
- **Rule 90**: Generates Sierpiński triangle patterns

### Image Dithering Mode

Transform images into artistic black-and-white patterns using the Floyd-Steinberg dithering algorithm:
- Upload any image file (JPG, PNG, etc.)
- Adjust threshold to control black/white balance
- Modify contrast for dramatic effects
- Scale images to different resolutions
- Apply 3D depth effects and parallax scrolling to dithered images
- Create unique artistic interpretations of photographs

## Preset Patterns

### 2D Patterns

- **Glider**: A small spaceship that moves diagonally
- **Blinker**: Simplest oscillator, period 2
- **Toad**: Another period-2 oscillator
- **Beacon**: Period-2 oscillator
- **Pulsar**: Beautiful period-3 oscillator
- **Gosper Glider Gun**: Infinite pattern generator

### 1D Patterns

- **Rule 30**: Chaotic pattern generation
- **Rule 110**: Universal computation

## Technical Details

### File Structure

```
cellular-automata/
├── index.html    # Main HTML structure
├── style.css     # Styling and layout
├── script.js     # Cellular automata logic
└── README.md     # Documentation
```

### Core Technologies

- **Pure JavaScript**: No dependencies or frameworks
- **HTML5 Canvas**: High-performance rendering
- **CSS3**: Modern, responsive design
- **Vanilla JS**: Lightweight and fast

### Key Algorithms

**2D Update (Game of Life):**
```javascript
for each cell:
    count living neighbors (8-connectivity)
    if alive and neighbors in survival set: stay alive
    if dead and neighbors in birth set: become alive
    otherwise: die or stay dead
```

**1D Update (Elementary):**
```javascript
for each cell in current row:
    get 3-bit neighborhood (left, center, right)
    lookup result in rule's binary representation
    set cell in next row to result
```

## Customization Ideas

Try these rule variations:

- **HighLife (B36/S23)**: Like Conway's but with replicators
- **Day & Night (B3678/S34678)**: Symmetrical rules
- **Seeds (B2/S)**: Explosive growth patterns
- **Maze (B3/S12345)**: Creates maze-like structures
- **Rule 184**: Simple traffic flow model
- **Rule 226**: Complex patterns from simple initial states

## Performance

- Optimized grid updates with double buffering
- Efficient neighbor counting with boundary wrapping
- Canvas rendering with minimal redraws
- Configurable FPS for smooth animations
- Handles grids up to 200x200+ cells smoothly

## Future Enhancements

Potential features for future versions:
- Pattern import/export (RLE format)
- History/undo functionality
- Pattern search and classification
- Multi-color states (more than alive/dead)
- 3D cellular automata
- Pattern statistics and analysis

## License

This project is open source and available for educational and personal use.

## Credits

Inspired by:
- John Conway's Game of Life (1970)
- Stephen Wolfram's Elementary Cellular Automata (1983)
- The beautiful complexity of emergence

---

**Enjoy exploring the infinite patterns of cellular automata!**
