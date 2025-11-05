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

        for (let i = 0; i < this.rows; i++) {
            this.grid[i] = [];
            this.nextGrid[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.grid[i][j] = 0;
                this.nextGrid[i][j] = 0;
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
        this.canvas.addEventListener('mouseup', () => this.isDrawing = false);
        this.canvas.addEventListener('mouseleave', () => this.isDrawing = false);

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

    handleMouseMove(e) {
        if (!this.isDrawing) return;

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
                this.grid[0][Math.floor(this.cols / 2)] = 1;
                break;

            case 'rule110':
                this.setMode('1d');
                this.rule = 110;
                document.getElementById('rule-slider').value = 110;
                document.getElementById('rule-value').textContent = 110;
                this.updateRuleVisualization();
                this.grid[0][Math.floor(this.cols / 2)] = 1;
                break;
        }

        this.render();
    }

    setPattern(startRow, startCol, pattern) {
        for (let i = 0; i < pattern.length; i++) {
            for (let j = 0; j < pattern[i].length; j++) {
                const row = startRow + i;
                const col = startCol + j;
                if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
                    this.grid[row][col] = pattern[i][j];
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
}

// Initialize the application
const app = new CellularAutomata();
