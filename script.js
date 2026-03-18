// Thundrix-ElChess Game Logic

class ElChess {
    constructor() {
        this.board = this.initializeBoard();
        this.currentPlayer = 'white';
        this.whiteElixir = 1;
        this.blackElixir = 0;
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.isRotated = false;
        this.theme = 'dark';
        this.turnoIniziatoElixir = false;
        this.init();
    }

    init() {
        this.loadTheme();
        this.setupEventListeners();
        this.renderBoard();
        this.updateUI();
    }

    initializeBoard() {
        const board = Array(8).fill().map(() => Array(8).fill(null));
        // Posiziona i re
        board[0][4] = { type: 'king', color: 'white' };
        board[7][4] = { type: 'king', color: 'black' };
        return board;
    }

    setupEventListeners() {
        // Menu navigation
        if (document.getElementById('play-btn')) {
            document.getElementById('play-btn').addEventListener('click', () => {
                window.location.href = 'game.html';
            });
        }
        if (document.getElementById('info-btn')) {
            document.getElementById('info-btn').addEventListener('click', () => {
                this.showSection('info');
            });
        }
        if (document.getElementById('credits-btn')) {
            document.getElementById('credits-btn').addEventListener('click', () => {
                this.showSection('credits');
            });
        }
        if (document.getElementById('back-btn')) {
            document.getElementById('back-btn').addEventListener('click', () => {
                window.location.href = 'index.html';
            });
        }

        // Theme toggle
        const themeToggles = document.querySelectorAll('#theme-toggle');
        themeToggles.forEach(toggle => {
            toggle.addEventListener('click', () => this.toggleTheme());
        });

        // Game elements
        if (document.getElementById('chessboard')) {
            document.getElementById('chessboard').addEventListener('click', (e) => this.handleBoardClick(e));
        }
        if (document.getElementById('rotate-board')) {
            document.getElementById('rotate-board').addEventListener('click', () => this.rotateBoard());
        }

        // Shop buttons
        document.querySelectorAll('.shop-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleShopClick(e));
        });
    }

    showSection(section) {
        document.querySelectorAll('#content > div').forEach(div => div.classList.add('hidden'));
        document.getElementById(section).classList.remove('hidden');
    }

    loadTheme() {
        const stored = localStorage.getItem('thundrixTheme');
        if (stored === 'light' || stored === 'dark') {
            this.theme = stored;
        }
        document.body.classList.toggle('light-theme', this.theme === 'light');
        this.updateThemeButtons();
    }

    toggleTheme() {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('thundrixTheme', this.theme);
        document.body.classList.toggle('light-theme', this.theme === 'light');
        this.updateThemeButtons();
    }

    updateThemeButtons() {
        const toggles = document.querySelectorAll('#theme-toggle');
        toggles.forEach(toggle => {
            toggle.textContent = `Tema: ${this.theme === 'dark' ? 'Scuro' : 'Chiaro'}`;
        });
    }

    renderBoard() {
        const boardElement = document.getElementById('chessboard');
        if (!boardElement) return;
        boardElement.innerHTML = '';
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.className = `square ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;
                square.dataset.row = row;
                square.dataset.col = col;
                const piece = this.board[row][col];
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = this.getPieceSymbol(piece);
                    pieceElement.style.color = piece.color === 'white' ? '#22c55e' : '#000000';
                    square.appendChild(pieceElement);
                }
                boardElement.appendChild(square);
            }
        }
        this.updatePossibleMoves();
    }

    getPieceSymbol(piece) {
        const symbols = {
            king: '♔',
            queen: '♕',
            rook: '♖',
            bishop: '♗',
            knight: '♘',
            pawn: '♙'
        };
        return symbols[piece.type];
    }

    updateUI() {
        if (document.getElementById('white-elixir')) {
            document.getElementById('white-elixir').textContent = this.whiteElixir;
        }
        if (document.getElementById('black-elixir')) {
            document.getElementById('black-elixir').textContent = this.blackElixir;
        }
        if (document.getElementById('turn-indicator')) {
            document.getElementById('turn-indicator').textContent = `Turno: ${this.currentPlayer === 'white' ? 'Bianco' : 'Nero'}`;
        }
    }

    handleShopClick(e) {
        const piece = e.target.dataset.piece;
        const cost = parseInt(e.target.dataset.cost);
        const elixir = this.currentPlayer === 'white' ? this.whiteElixir : this.blackElixir;
        if (elixir >= cost) {
            this.selectedPiece = piece;
            this.shopMode = true;
            alert(`Seleziona una casella nelle tue prime due righe per posizionare il ${piece}`);
        } else {
            alert('Non hai abbastanza elisir!');
        }
    }

    handleBoardClick(e) {
        const square = e.target.closest('.square');
        if (!square) return;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);

        if (this.shopMode) {
            this.placePiece(row, col);
            return;
        }

        const piece = this.board[row][col];
        if (this.selectedSquare) {
            const [selectedRow, selectedCol] = this.selectedSquare;
            if (selectedRow === row && selectedCol === col) {
                this.deselectSquare();
            } else if (this.isValidMove(selectedRow, selectedCol, row, col)) {
                this.movePiece(selectedRow, selectedCol, row, col);
            } else {
                this.selectSquare(row, col);
            }
        } else if (piece && piece.color === this.currentPlayer) {
            this.selectSquare(row, col);
        }
    }

    placePiece(row, col) {
        const playerRows = this.currentPlayer === 'white' ? [0, 1] : [6, 7];
        if (!playerRows.includes(row) || this.board[row][col]) {
            alert('Posizione non valida!');
            return;
        }
        const cost = this.getPieceCost(this.selectedPiece);
        if (this.currentPlayer === 'white') {
            this.whiteElixir -= cost;
        } else {
            this.blackElixir -= cost;
        }
        this.board[row][col] = { type: this.selectedPiece, color: this.currentPlayer };
        this.shopMode = false;
        this.selectedPiece = null;
        this.renderBoard();
        this.updateUI();
        this.endTurn();
    }

    getPieceCost(piece) {
        const costs = { pawn: 1, bishop: 3, knight: 3, rook: 4, queen: 5 };
        return costs[piece];
    }

    selectSquare(row, col) {
        this.selectedSquare = [row, col];
        this.possibleMoves = this.getPossibleMoves(row, col);
        this.renderBoard();
    }

    deselectSquare() {
        this.selectedSquare = null;
        this.possibleMoves = [];
        this.renderBoard();
    }

    updatePossibleMoves() {
        document.querySelectorAll('.possible-move').forEach(el => el.classList.remove('possible-move'));
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
        if (this.selectedSquare) {
            const [row, col] = this.selectedSquare;
            const square = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            square.classList.add('selected');
            this.possibleMoves.forEach(([r, c]) => {
                const moveSquare = document.querySelector(`[data-row="${r}"][data-col="${c}"]`);
                moveSquare.classList.add('possible-move');
            });
        }
    }

    getPossibleMoves(row, col) {
        const piece = this.board[row][col];
        if (!piece) return [];
        const moves = [];
        switch (piece.type) {
            case 'pawn':
                // Pedoni bianchi si muovono verso riga 7 (verso i neri), neri verso riga 0 (verso i bianchi)
                const direction = piece.color === 'white' ? 1 : -1;
                // Movimento doppio dai confini della propria metà
                const canDoubleMove = (piece.color === 'white' && (row === 0 || row === 1)) || 
                                     (piece.color === 'black' && (row === 6 || row === 7));
                
                // Move forward
                const nextRow = row + direction;
                if (nextRow >= 0 && nextRow < 8 && !this.board[nextRow][col]) {
                    moves.push([nextRow, col]);
                    // Double move from starting position
                    const doubleRow = row + 2 * direction;
                    if (canDoubleMove && doubleRow >= 0 && doubleRow < 8 && !this.board[doubleRow][col]) {
                        moves.push([doubleRow, col]);
                    }
                }
                // Captures
                for (let dc = -1; dc <= 1; dc += 2) {
                    const newCol = col + dc;
                    const captureRow = row + direction;
                    if (captureRow >= 0 && captureRow < 8 && newCol >= 0 && newCol < 8 && 
                        this.board[captureRow][newCol] && this.board[captureRow][newCol].color !== piece.color) {
                        moves.push([captureRow, newCol]);
                    }
                }
                break;
            case 'rook':
                this.addLinearMoves(moves, row, col, piece.color, [0, 1], [0, -1], [1, 0], [-1, 0]);
                break;
            case 'bishop':
                this.addLinearMoves(moves, row, col, piece.color, [1, 1], [1, -1], [-1, 1], [-1, -1]);
                break;
            case 'queen':
                this.addLinearMoves(moves, row, col, piece.color, [0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]);
                break;
            case 'knight':
                const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
                knightMoves.forEach(([dr, dc]) => {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== piece.color)) {
                        moves.push([newRow, newCol]);
                    }
                });
                break;
            case 'king':
                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const newRow = row + dr;
                        const newCol = col + dc;
                        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8 && (!this.board[newRow][newCol] || this.board[newRow][newCol].color !== piece.color)) {
                            moves.push([newRow, newCol]);
                        }
                    }
                }
                break;
        }
        return moves;
    }

    addLinearMoves(moves, row, col, color, ...directions) {
        directions.forEach(([dr, dc]) => {
            let r = row + dr;
            let c = col + dc;
            while (r >= 0 && r < 8 && c >= 0 && c < 8) {
                if (this.board[r][c]) {
                    if (this.board[r][c].color !== color) {
                        moves.push([r, c]);
                    }
                    break;
                }
                moves.push([r, c]);
                r += dr;
                c += dc;
            }
        });
    }

    isValidMove(fromRow, fromCol, toRow, toCol) {
        return this.possibleMoves.some(([r, c]) => r === toRow && c === toCol);
    }

    movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = this.board[fromRow][fromCol];
        const capturedPiece = this.board[toRow][toCol];
        this.board[toRow][toCol] = piece;
        this.board[fromRow][fromCol] = null;

        // Pawn promotion - automatic to queen
        if (piece.type === 'pawn' && ((piece.color === 'white' && toRow === 0) || (piece.color === 'black' && toRow === 7))) {
            piece.type = 'queen';
        }

        // Check if opponent's king was captured
        if (capturedPiece && capturedPiece.type === 'king') {
            const winner = piece.color === 'white' ? 'Bianco' : 'Nero';
            setTimeout(() => {
                alert(`Il Re è stato catturato! ${winner} ha vinto la partita!`);
                window.location.href = 'index.html';
            }, 300);
            return;
        }

        this.endTurn();
    }

    endTurn() {
        this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
        // Gain elixir for new current player
        if (this.currentPlayer === 'white') {
            this.whiteElixir += 1;
        } else {
            this.blackElixir += 1;
        }
        this.deselectSquare();
        this.renderBoard();
        this.updateUI();
    }

    rotateBoard() {
        this.isRotated = !this.isRotated;
        const board = document.getElementById('chessboard');
        board.style.transform = this.isRotated ? 'rotate(180deg)' : 'rotate(0deg)';
    }
}

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    new ElChess();
});