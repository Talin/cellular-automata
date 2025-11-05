// Cellular Automata Studio
class CellularAutomata {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Mode: '2d' or '1d'
        this.mode = '2d';

        // Grid settings
        this.cellSize = 8;
        this.cols = 100;
        this.rows = 80;

        // Grid state
        this.grid = [];
        this.nextGrid = [];
        this.depthGrid = []; // Depth values for 3D effect

        // 1D automata settings
        this.rule = 30;
        this.row1D = 0;

        // Animation
        this.isPlaying = false;
        this.fps = 10;
        this.lastFrameTime = 0;

        // 2D rules (Conway's Game of Life by default: B3/S23)
        this.birthRules = new Set([3]);
        this.survivalRules = new Set([2, 3]);

        // Colors
        this.aliveColor = '#00ff88';
        this.deadColor = '#0a0a0a';

        // Mouse interaction
        this.isDrawing = false;
        this.drawValue = true;

        // Parallax settings
        this.parallaxEnabled = false;
        this.parallaxIntensity = 0.5; // 0-1 range
        this.parallaxSpeed = 1.0; // Scroll speed multiplier
        this.parallaxDirection = 'both'; // 'horizontal', 'vertical', or 'both'
        this.depthParallaxEnabled = false;
        this.depthLayers = 5; // Number of depth layers
        this.scrollOffset = 0; // Current scroll-based offset (horizontal)
        this.scrollOffsetY = 0; // Vertical scroll offset
        this.canvasContainer = document.querySelector('.canvas-container');

        // Fullscreen state
        this.isFullscreen = false;
        this.wasParallaxEnabled = false; // Store state before fullscreen

        // Eraser settings
        this.eraserSize = 3; // Radius in cells
        this.isErasing = false;

        this.init();
    }

    init() {
        this.resizeCanvas();
        this.initGrid();
        this.setupEventListeners();
        this.render();
    }

    resizeCanvas() {
        if (this.mode === '2d') {
            this.canvas.width = this.cols * this.cellSize;
            this.canvas.height = this.rows * this.cellSize;
        } else {
            this.canvas.width = this.cols * this.cellSize;
            this.canvas.height = 600;
        }
    }

    initGrid() {
        this.grid = [];
        this.nextGrid = [];
        this.depthGrid = [];

        for (let i = 0; i < this.rows; i++) {
            this.grid[i] = [];
            this.nextGrid[i] = [];
            this.depthGrid[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = 0;
                this.nextGrid[i][j] = 0;
                // Assign random depth value (0 to depthLayers-1)
                this.depthGrid[i][j] = Math.floor(Math.random() * this.depthLayers);
            }
        }

        if (this.mode === '1d') {
            this.row1D = 0;
            // Start with a single cell in the middle
            this.grid[0][Math.floor(this.cols / 2)] = 1;
        }
    }

    setupEventListeners() {
        // Mode buttons
        document.getElementById('mode-2d').addEventListener('click', () => this.setMode('2d'));
        document.getElementById('mode-1d').addEventListener('click', () => this.setMode('1d'));

        // Control buttons
        document.getElementById('play-btn').addEventListener('click', () => this.play());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('step-btn').addEventListener('click', () => this.step());
        document.getElementById('clear-btn').addEventListener('click', () => this.clear());
        document.getElementById('random-btn').addEventListener('click', () => this.randomize());

        // Speed slider
        const speedSlider = document.getElementById('speed-slider');
        speedSlider.addEventListener('input', (e) => {
            this.fps = parseInt(e.target.value);
            document.getElementById('speed-value').textContent = this.fps;
        });

        // Cell size slider (2D only)
        const cellSizeSlider = document.getElementById('cell-size-slider');
        cellSizeSlider.addEventListener('input', (e) => {
            this.cellSize = parseInt(e.target.value);
            document.getElementById('cell-size-value').textContent = this.cellSize;
            this.cols = Math.floor(800 / this.cellSize);
            this.rows = Math.floor(600 / this.cellSize);
            this.resizeCanvas();
            this.initGrid();
            this.render();
        });

        // Rule slider (1D only)
        const ruleSlider = document.getElementById('rule-slider');
        ruleSlider.addEventListener('input', (e) => {
            this.rule = parseInt(e.target.value);
            document.getElementById('rule-value').textContent = this.rule;
            this.updateRuleVisualization();
        });

        // Birth and survival rules (2D)
        document.querySelectorAll('.birth-rule').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.birthRules = new Set();
                document.querySelectorAll('.birth-rule:checked').forEach(cb => {
                    this.birthRules.add(parseInt(cb.value));
                });
            });
        });

        document.querySelectorAll('.survival-rule').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                this.survivalRules = new Set();
                document.querySelectorAll('.survival-rule:checked').forEach(cb => {
                    this.survivalRules.add(parseInt(cb.value));
                });
            });
        });

        // Color pickers
        document.getElementById('alive-color').addEventListener('input', (e) => {
            this.aliveColor = e.target.value;
            this.render();
        });

        document.getElementById('dead-color').addEventListener('input', (e) => {
            this.deadColor = e.target.value;
            this.render();
        });

        // Canvas mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', () => {
            this.isDrawing = false;
            this.isErasing = false;
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.isDrawing = false;
            this.isErasing = false;
            // Hide eraser cursor when leaving canvas
            const cursor = document.getElementById('eraser-cursor');
            if (cursor) cursor.style.display = 'none';
        });

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.canvas.dispatchEvent(mouseEvent);
        });

        this.canvas.addEventListener('touchend', () => {
            this.isDrawing = false;
        });

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const preset = btn.getAttribute('data-preset');
                this.loadPreset(preset);
            });
        });

        // Parallax toggle
        const parallaxToggle = document.getElementById('parallax-toggle');
        parallaxToggle.addEventListener('change', (e) => {
            this.parallaxEnabled = e.target.checked;
            if (this.parallaxEnabled) {
                this.canvasContainer.classList.add('parallax-enabled');
                this.setupParallax();
            } else {
                this.canvasContainer.classList.remove('parallax-enabled');
                this.canvasContainer.style.transform = '';
                this.canvasContainer.style.opacity = '';
            }
        });

        // Parallax intensity slider
        const parallaxIntensity = document.getElementById('parallax-intensity');
        parallaxIntensity.addEventListener('input', (e) => {
            this.parallaxIntensity = parseInt(e.target.value) / 100;
            document.getElementById('parallax-intensity-value').textContent = e.target.value;
        });

        // Parallax speed slider
        const parallaxSpeed = document.getElementById('parallax-speed');
        parallaxSpeed.addEventListener('input', (e) => {
            this.parallaxSpeed = parseFloat(e.target.value);
            document.getElementById('parallax-speed-value').textContent = e.target.value;
        });

        // Parallax direction selector
        const parallaxDirection = document.getElementById('parallax-direction');
        parallaxDirection.addEventListener('change', (e) => {
            this.parallaxDirection = e.target.value;
            this.render();
        });

        // Depth parallax toggle
        const depthParallaxToggle = document.getElementById('depth-parallax-toggle');
        depthParallaxToggle.addEventListener('change', (e) => {
            this.depthParallaxEnabled = e.target.checked;
            this.render();
        });

        // Depth layers slider
        const depthLayers = document.getElementById('depth-layers');
        depthLayers.addEventListener('input', (e) => {
            this.depthLayers = parseInt(e.target.value);
            document.getElementById('depth-layers-value').textContent = e.target.value;
            // Reinitialize depth grid with new layer count
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.depthGrid[i][j] = Math.floor(Math.random() * this.depthLayers);
                }
            }
            this.render();
        });

        // Fullscreen toggle
        const fullscreenBtn = document.getElementById('fullscreen-toggle');
        fullscreenBtn.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        // Eraser size slider
        const eraserSize = document.getElementById('eraser-size');
        eraserSize.addEventListener('input', (e) => {
            this.eraserSize = parseInt(e.target.value);
            document.getElementById('eraser-size-value').textContent = e.target.value;
        });

        // Window resize for responsive fullscreen
        window.addEventListener('resize', () => {
            if (this.isFullscreen) {
                this.resizeFullscreenCanvas();
            }
        });
    }

    setMode(mode) {
        this.mode = mode;
        this.pause();

        // Update button states
        document.getElementById('mode-2d').classList.toggle('active', mode === '2d');
        document.getElementById('mode-1d').classList.toggle('active', mode === '1d');

        // Toggle control sections
        document.getElementById('mode-2d-controls').classList.toggle('hidden', mode !== '2d');
        document.getElementById('mode-1d-controls').classList.toggle('hidden', mode !== '1d');

        // Reset grid and canvas
        if (mode === '1d') {
            this.updateRuleVisualization();
        }

        this.resizeCanvas();
        this.initGrid();
        this.render();
    }

    handleMouseDown(e) {
        if (this.isFullscreen) {
            // Enable erasing in fullscreen mode
            this.isErasing = true;
            this.eraseAtPosition(e);
        } else {
            // Normal drawing mode
            this.isDrawing = true;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const col = Math.floor(x / this.cellSize);
            const row = Math.floor(y / this.cellSize);

            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                this.drawValue = !this.grid[row][col];
                this.grid[row][col] = this.drawValue ? 1 : 0;
                this.render();
            }
        }
    }

    handleMouseMove(e) {
        if (this.isFullscreen && this.isErasing) {
            // Erase cells in fullscreen
            this.eraseAtPosition(e);
        } else if (this.isDrawing && !this.isFullscreen) {
            // Normal drawing mode
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const col = Math.floor(x / this.cellSize);
            const row = Math.floor(y / this.cellSize);

            if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                this.grid[row][col] = this.drawValue ? 1 : 0;
                this.render();
            }
        }

        // Update custom cursor position in fullscreen
        if (this.isFullscreen) {
            this.updateEraserCursor(e);
        }
    }

    eraseAtPosition(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerCol = Math.floor(x / this.cellSize);
        const centerRow = Math.floor(y / this.cellSize);

        // Erase in a circular area around the cursor
        for (let i = -this.eraserSize; i <= this.eraserSize; i++) {
            for (let j = -this.eraserSize; j <= this.eraserSize; j++) {
                const row = centerRow + i;
                const col = centerCol + j;

                // Check if within eraser radius (circular)
                const distance = Math.sqrt(i * i + j * j);
                if (distance <= this.eraserSize &&
                    row >= 0 && row < this.rows &&
                    col >= 0 && col < this.cols) {
                    this.grid[row][col] = 0; // Erase cell
                }
            }
        }

        this.render();
    }

    updateEraserCursor(e) {
        // Create or update custom cursor indicator
        let cursor = document.getElementById('eraser-cursor');
        if (!cursor) {
            cursor = document.createElement('div');
            cursor.id = 'eraser-cursor';
            cursor.className = 'eraser-cursor';
            document.body.appendChild(cursor);
        }

        const size = this.eraserSize * this.cellSize * 2;
        cursor.style.width = size + 'px';
        cursor.style.height = size + 'px';
        cursor.style.left = (e.clientX - size / 2) + 'px';
        cursor.style.top = (e.clientY - size / 2) + 'px';
        cursor.style.display = 'block';
    }

    play() {
        this.isPlaying = true;
        this.animate();
    }

    pause() {
        this.isPlaying = false;
    }

    step() {
        this.update();
        this.render();
    }

    clear() {
        this.pause();
        this.initGrid();
        this.render();
    }

    randomize() {
        this.pause();

        if (this.mode === '2d') {
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    this.grid[i][j] = Math.random() > 0.7 ? 1 : 0;
                }
            }
        } else {
            this.row1D = 0;
            for (let j = 0; j < this.cols; j++) {
                this.grid[0][j] = Math.random() > 0.5 ? 1 : 0;
            }
        }

        this.render();
    }

    animate(currentTime = 0) {
        if (!this.isPlaying) return;

        const deltaTime = currentTime - this.lastFrameTime;
        const frameInterval = 1000 / this.fps;

        if (deltaTime >= frameInterval) {
            this.lastFrameTime = currentTime - (deltaTime % frameInterval);
            this.update();
            this.render();
        }

        requestAnimationFrame((time) => this.animate(time));
    }

    update() {
        if (this.mode === '2d') {
            this.update2D();
        } else {
            this.update1D();
        }
    }

    update2D() {
        // Conway's Game of Life with custom rules
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const neighbors = this.countNeighbors(i, j);
                const isAlive = this.grid[i][j] === 1;

                if (isAlive) {
                    // Cell is alive
                    this.nextGrid[i][j] = this.survivalRules.has(neighbors) ? 1 : 0;
                } else {
                    // Cell is dead
                    this.nextGrid[i][j] = this.birthRules.has(neighbors) ? 1 : 0;
                }
            }
        }

        // Swap grids
        [this.grid, this.nextGrid] = [this.nextGrid, this.grid];
    }

    countNeighbors(row, col) {
        let count = 0;

        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;

                const newRow = (row + i + this.rows) % this.rows;
                const newCol = (col + j + this.cols) % this.cols;

                count += this.grid[newRow][newCol];
            }
        }

        return count;
    }

    update1D() {
        // Elementary cellular automaton
        if (this.row1D >= this.rows - 1) {
            // Reached bottom, stop
            this.pause();
            return;
        }

        const currentRow = this.row1D;
        const nextRow = this.row1D + 1;

        for (let j = 0; j < this.cols; j++) {
            const left = this.grid[currentRow][(j - 1 + this.cols) % this.cols];
            const center = this.grid[currentRow][j];
            const right = this.grid[currentRow][(j + 1) % this.cols];

            const neighborhood = (left << 2) | (center << 1) | right;
            const newState = (this.rule >> neighborhood) & 1;

            this.grid[nextRow][j] = newState;
        }

        this.row1D++;
    }

    render() {
        this.ctx.fillStyle = this.deadColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.depthParallaxEnabled && this.parallaxEnabled) {
            // Render with depth-based parallax
            this.renderWithDepth();
        } else {
            // Normal rendering
            this.ctx.fillStyle = this.aliveColor;
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    if (this.grid[i][j] === 1) {
                        this.ctx.fillRect(
                            j * this.cellSize,
                            i * this.cellSize,
                            this.cellSize - 1,
                            this.cellSize - 1
                        );
                    }
                }
            }
        }
    }

    renderWithDepth() {
        // Render cells in layers based on depth
        for (let layer = this.depthLayers - 1; layer >= 0; layer--) {
            // Calculate parallax offset for this layer
            const depthFactor = layer / (this.depthLayers - 1); // 0 (far) to 1 (near)

            // Apply parallax based on direction setting
            let parallaxOffsetX = 0;
            let parallaxOffsetY = 0;

            if (this.parallaxDirection === 'horizontal' || this.parallaxDirection === 'both') {
                parallaxOffsetX = this.scrollOffset * depthFactor * this.parallaxIntensity * 2 * this.parallaxSpeed;
            }
            if (this.parallaxDirection === 'vertical' || this.parallaxDirection === 'both') {
                parallaxOffsetY = this.scrollOffsetY * depthFactor * this.parallaxIntensity * 2 * this.parallaxSpeed;
            }

            // Adjust opacity and size based on depth
            const opacity = 0.3 + (depthFactor * 0.7); // Far = dimmer, Near = brighter
            const sizeMultiplier = 0.7 + (depthFactor * 0.3); // Far = smaller, Near = larger

            // Set color with opacity
            const color = this.hexToRgb(this.aliveColor);
            this.ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity})`;

            // Render cells at this depth layer
            for (let i = 0; i < this.rows; i++) {
                for (let j = 0; j < this.cols; j++) {
                    if (this.grid[i][j] === 1 && this.depthGrid[i][j] === layer) {
                        const x = j * this.cellSize + parallaxOffsetX;
                        const y = i * this.cellSize + parallaxOffsetY;
                        const size = (this.cellSize - 1) * sizeMultiplier;
                        const offset = ((this.cellSize - 1) - size) / 2; // Center smaller cells

                        this.ctx.fillRect(
                            x + offset,
                            y + offset,
                            size,
                            size
                        );
                    }
                }
            }
        }
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 255, b: 136 };
    }

    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;

        if (this.isFullscreen) {
            // Store previous parallax state
            this.wasParallaxEnabled = this.parallaxEnabled;
            this.wasDepthParallaxEnabled = this.depthParallaxEnabled;

            // Auto-enable parallax for fullscreen mode
            this.parallaxEnabled = true;
            this.depthParallaxEnabled = true;
            document.getElementById('parallax-toggle').checked = true;
            document.getElementById('depth-parallax-toggle').checked = true;

            // Make body tall enough to scroll
            document.body.style.minHeight = '300vh';

            this.canvasContainer.classList.add('fullscreen');
            this.setupParallax(); // Re-setup parallax listeners

            // Resize canvas to fill screen
            const oldCellSize = this.cellSize;
            this.cols = Math.floor(window.innerWidth / this.cellSize);
            this.rows = Math.floor(window.innerHeight / this.cellSize);
            this.resizeCanvas();

            // Preserve existing pattern in center
            const tempGrid = this.grid;
            const tempDepth = this.depthGrid;
            this.initGrid();

            // Copy old grid to center of new grid
            const offsetRow = Math.floor((this.rows - tempGrid.length) / 2);
            const offsetCol = Math.floor((this.cols - tempGrid[0].length) / 2);
            for (let i = 0; i < tempGrid.length && i + offsetRow < this.rows; i++) {
                for (let j = 0; j < tempGrid[0].length && j + offsetCol < this.cols; j++) {
                    if (offsetRow + i >= 0 && offsetCol + j >= 0) {
                        this.grid[offsetRow + i][offsetCol + j] = tempGrid[i][j];
                        this.depthGrid[offsetRow + i][offsetCol + j] = tempDepth[i][j];
                    }
                }
            }
        } else {
            this.canvasContainer.classList.remove('fullscreen');

            // Hide eraser cursor
            const cursor = document.getElementById('eraser-cursor');
            if (cursor) cursor.style.display = 'none';

            // Restore body height
            document.body.style.minHeight = '100vh';

            // Restore previous parallax state
            this.parallaxEnabled = this.wasParallaxEnabled;
            this.depthParallaxEnabled = this.wasDepthParallaxEnabled;
            document.getElementById('parallax-toggle').checked = this.parallaxEnabled;
            document.getElementById('depth-parallax-toggle').checked = this.depthParallaxEnabled;

            if (!this.parallaxEnabled) {
                this.canvasContainer.style.transform = '';
                this.canvasContainer.style.opacity = '';
            }

            // Restore normal size
            this.cellSize = 8;
            this.cols = 100;
            this.rows = 80;
            this.resizeCanvas();
            this.initGrid();
        }

        this.render();
    }

    resizeFullscreenCanvas() {
        // Save current grid
        const tempGrid = this.grid;
        const tempDepth = this.depthGrid;
        const oldCols = this.cols;
        const oldRows = this.rows;

        // Calculate new dimensions
        this.cols = Math.floor(window.innerWidth / this.cellSize);
        this.rows = Math.floor(window.innerHeight / this.cellSize);
        this.resizeCanvas();

        // Initialize new grid
        this.initGrid();

        // Copy old grid to center of new grid
        const offsetRow = Math.floor((this.rows - oldRows) / 2);
        const offsetCol = Math.floor((this.cols - oldCols) / 2);

        for (let i = 0; i < oldRows; i++) {
            for (let j = 0; j < oldCols; j++) {
                const newRow = offsetRow + i;
                const newCol = offsetCol + j;
                if (newRow >= 0 && newRow < this.rows && newCol >= 0 && newCol < this.cols) {
                    this.grid[newRow][newCol] = tempGrid[i][j];
                    this.depthGrid[newRow][newCol] = tempDepth[i][j];
                }
            }
        }

        this.render();
    }

    loadPreset(preset) {
        this.pause();
        this.clear();

        const centerRow = Math.floor(this.rows / 2);
        const centerCol = Math.floor(this.cols / 2);

        switch(preset) {
            case 'glider':
                this.setMode('2d');
                this.setPattern(centerRow, centerCol, [
                    [0, 1, 0],
                    [0, 0, 1],
                    [1, 1, 1]
                ]);
                break;

            case 'blinker':
                this.setMode('2d');
                this.setPattern(centerRow, centerCol, [
                    [1, 1, 1]
                ]);
                break;

            case 'toad':
                this.setMode('2d');
                this.setPattern(centerRow, centerCol, [
                    [0, 1, 1, 1],
                    [1, 1, 1, 0]
                ]);
                break;

            case 'beacon':
                this.setMode('2d');
                this.setPattern(centerRow, centerCol, [
                    [1, 1, 0, 0],
                    [1, 1, 0, 0],
                    [0, 0, 1, 1],
                    [0, 0, 1, 1]
                ]);
                break;

            case 'pulsar':
                this.setMode('2d');
                this.setPattern(centerRow - 6, centerCol - 6, [
                    [0,0,1,1,1,0,0,0,1,1,1,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [1,0,0,0,0,1,0,1,0,0,0,0,1],
                    [1,0,0,0,0,1,0,1,0,0,0,0,1],
                    [1,0,0,0,0,1,0,1,0,0,0,0,1],
                    [0,0,1,1,1,0,0,0,1,1,1,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,1,1,1,0,0,0,1,1,1,0,0],
                    [1,0,0,0,0,1,0,1,0,0,0,0,1],
                    [1,0,0,0,0,1,0,1,0,0,0,0,1],
                    [1,0,0,0,0,1,0,1,0,0,0,0,1],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,1,1,1,0,0,0,1,1,1,0,0]
                ]);
                break;

            case 'gosper':
                this.setMode('2d');
                this.setPattern(centerRow - 5, centerCol - 18, [
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
                    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
                    [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
                    [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
                ]);
                break;

            case 'rule30':
                this.setMode('1d');
                this.rule = 30;
                document.getElementById('rule-slider').value = 30;
                document.getElementById('rule-value').textContent = 30;
                this.updateRuleVisualization();
                const col30 = Math.floor(this.cols / 2);
                this.grid[0][col30] = 1;
                this.depthGrid[0][col30] = Math.floor(this.depthLayers / 2);
                break;

            case 'rule110':
                this.setMode('1d');
                this.rule = 110;
                document.getElementById('rule-slider').value = 110;
                document.getElementById('rule-value').textContent = 110;
                this.updateRuleVisualization();
                const col110 = Math.floor(this.cols / 2);
                this.grid[0][col110] = 1;
                this.depthGrid[0][col110] = Math.floor(this.depthLayers / 2);
                break;
        }

        this.render();
    }

    setPattern(startRow, startCol, pattern) {
        // Use middle depth layer for all preset patterns so they're clearly visible
        const presetDepth = Math.floor(this.depthLayers / 2);

        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[i].length; j++) {
                const row = startRow + i;
                const col = startCol + j;
                if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                    this.grid[row][col] = pattern[i][j];
                    // Set all pattern cells to the same depth for consistent appearance
                    if (pattern[i][j] === 1) {
                        this.depthGrid[row][col] = presetDepth;
                    }
                }
            }
        }
    }

    updateRuleVisualization() {
        const container = document.getElementById('rule-visualization');
        container.innerHTML = '<div style="color: #b0b0b0; margin-bottom: 10px;">Rule ' + this.rule + ' lookup table:</div>';

        const table = document.createElement('div');
        table.style.display = 'flex';
        table.style.flexWrap = 'wrap';
        table.style.gap = '8px';

        for (let i = 7; i >= 0; i--) {
            const cell = document.createElement('div');
            cell.className = 'rule-cell';

            const pattern = document.createElement('div');
            pattern.className = 'rule-cell-pattern';

            for (let j = 2; j >= 0; j--) {
                const box = document.createElement('div');
                box.className = 'rule-cell-box';
                if ((i >> j) & 1) {
                    box.classList.add('filled');
                }
                pattern.appendChild(box);
            }

            const result = document.createElement('div');
            result.className = 'rule-cell-result';
            result.textContent = '↓ ' + ((this.rule >> i) & 1);

            cell.appendChild(pattern);
            cell.appendChild(result);
            table.appendChild(cell);
        }

        container.appendChild(table);
    }

    setupParallax() {
        // Remove existing scroll listener if any
        if (this.scrollHandler) {
            window.removeEventListener('scroll', this.scrollHandler);
        }

        // Create and bind scroll handler
        this.scrollHandler = () => this.handleParallaxScroll();
        window.addEventListener('scroll', this.scrollHandler, { passive: true });

        // Initial call
        this.handleParallaxScroll();
    }

    handleParallaxScroll() {
        if (!this.parallaxEnabled) return;

        const rect = this.canvasContainer.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementBottom = rect.bottom;
        const elementHeight = rect.height;

        // Calculate visibility percentage (0 to 1)
        let visiblePercentage;

        if (elementTop >= windowHeight || elementBottom <= 0) {
            // Element is out of view
            visiblePercentage = 0;
        } else if (elementTop <= 0 && elementBottom >= windowHeight) {
            // Element fills entire viewport
            visiblePercentage = 1;
        } else if (elementTop > 0 && elementBottom < windowHeight) {
            // Element is fully visible within viewport
            visiblePercentage = 1;
        } else if (elementTop > 0) {
            // Element is entering from bottom
            visiblePercentage = (windowHeight - elementTop) / elementHeight;
        } else {
            // Element is leaving from top
            visiblePercentage = elementBottom / elementHeight;
        }

        // Normalize scroll progress (-1 to 1, where 0 is centered)
        const elementCenter = elementTop + elementHeight / 2;
        const viewportCenter = windowHeight / 2;
        const scrollProgress = (viewportCenter - elementCenter) / windowHeight;

        // Store horizontal scroll offset for depth parallax
        this.scrollOffset = scrollProgress * 100;

        // Calculate vertical scroll offset based on absolute scroll position
        // In fullscreen, use the scroll position directly
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const maxScroll = document.documentElement.scrollHeight - windowHeight;
        const scrollPercentage = maxScroll > 0 ? scrollY / maxScroll : 0;
        // Map scroll percentage to -1 to 1 range (centered at 0.5)
        this.scrollOffsetY = (scrollPercentage - 0.5) * 200; // -100 to 100

        // Apply parallax transformations to container
        if (!this.depthParallaxEnabled) {
            const translateY = scrollProgress * 100 * this.parallaxIntensity * this.parallaxSpeed;
            const scale = 1 + (Math.abs(scrollProgress) * 0.1 * this.parallaxIntensity);
            const opacity = Math.max(0.3, Math.min(1, visiblePercentage + 0.3));

            this.canvasContainer.style.transform = `translateY(${translateY}px) scale(${1 / scale})`;
            this.canvasContainer.style.opacity = opacity;
        } else {
            // Reset container transform when using depth parallax
            this.canvasContainer.style.transform = '';
            this.canvasContainer.style.opacity = '1';
            // Re-render with depth effect
            this.render();
        }
    }
}

// Initialize the application
const app = new CellularAutomata();
