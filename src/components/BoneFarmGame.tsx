import React, { useState, useCallback, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from './ui/use-toast';

interface BoneFarmGameProps {
  keys: number;
  onKeysUpdate: (newKeys: number) => void;
  onBonesEarned: (bones: number) => void;
  onRecordUpdate: (record: number) => void;
}

const GRID_SIZE = 7;

interface Block {
  id: number;
  shape: boolean[][];
  color: string;
}

interface GridCell {
  filled: boolean;
  color: string;
}

const BLOCK_SHAPES = [
  // Маленькие блоки
  { shape: [[true]], color: 'bg-yellow-500' },
  { shape: [[true, true]], color: 'bg-blue-500' },
  { shape: [[true], [true]], color: 'bg-green-500' },
  
  // Средние блоки
  { shape: [[true, true, true]], color: 'bg-red-500' },
  { shape: [[true], [true], [true]], color: 'bg-purple-500' },
  { shape: [[true, true], [true, true]], color: 'bg-orange-500' },
  
  // Крупные блоки
  { shape: [[true, true, true, true]], color: 'bg-pink-500' },
  { shape: [[true], [true], [true], [true]], color: 'bg-cyan-500' },
  { shape: [[true, true, true], [true, true, true]], color: 'bg-lime-500' },
  { shape: [[true, true], [true, true], [true, true]], color: 'bg-indigo-500' },
  
  // Неправильные формы
  { shape: [[true, true, false], [false, true, true]], color: 'bg-rose-500' },
  { shape: [[false, true], [true, true], [true, false]], color: 'bg-amber-500' },
  { shape: [[true, false, true], [true, true, true]], color: 'bg-emerald-500' },
  { shape: [[true, true, true], [false, true, false]], color: 'bg-violet-500' },
  { shape: [[true, false], [true, true], [false, true]], color: 'bg-teal-500' },
  
  // Большие L-формы
  { shape: [[true, false, false], [true, false, false], [true, true, true]], color: 'bg-sky-500' },
  { shape: [[false, false, true], [false, false, true], [true, true, true]], color: 'bg-fuchsia-500' },
  
  // Крестообразные
  { shape: [[false, true, false], [true, true, true], [false, true, false]], color: 'bg-slate-500' },
  
  // Большие квадраты
  { shape: [[true, true, true], [true, true, true], [true, true, true]], color: 'bg-stone-500' },
];

export const BoneFarmGame: React.FC<BoneFarmGameProps> = ({
  keys,
  onKeysUpdate,
  onBonesEarned,
  onRecordUpdate,
}) => {
  const navigate = useNavigate();
  const [grid, setGrid] = useState<GridCell[][]>(() => 
    Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ filled: false, color: '' })))
  );
  const [currentBlocks, setCurrentBlocks] = useState<Block[]>([]);
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null);
  const [bonesEarned, setBonesEarnedLocal] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [ghostGridPosition, setGhostGridPosition] = useState<{ row: number; col: number } | null>(null);
  const [touchStartPos, setTouchStartPos] = useState<{ x: number; y: number } | null>(null);
  const gameGridRef = useRef<HTMLDivElement>(null);

  const calculateGridPosition = (clientX: number, clientY: number): { row: number; col: number } | null => {
    if (!gameGridRef.current) {
      console.log('gameGridRef.current is null');
      return null;
    }
    
    const gridRect = gameGridRef.current.getBoundingClientRect();
    console.log('Grid rect:', gridRect);
    
    // Убеждаемся что элемент видим и имеет правильные размеры
    if (gridRect.width === 0 || gridRect.height === 0) {
      console.log('Grid has zero dimensions');
      return null;
    }
    
    const cellSize = gridRect.width / GRID_SIZE;
    
    const relativeX = clientX - gridRect.left;
    const relativeY = clientY - gridRect.top;
    
    console.log('Touch calculation:', {
      clientX, clientY,
      gridLeft: gridRect.left, gridTop: gridRect.top,
      relativeX, relativeY,
      cellSize
    });
    
    const col = Math.floor(relativeX / cellSize);
    const row = Math.floor(relativeY / cellSize);
    
    console.log('Calculated position:', { row, col });
    
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) {
      console.log('Position out of bounds:', { row, col, GRID_SIZE });
      return null;
    }
    
    return { row, col };
  };

  const generateRandomBlocks = useCallback(() => {
    const blocks = [];
    for (let i = 0; i < 2; i++) {
      const randomShape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
      blocks.push({
        id: i,
        shape: randomShape.shape,
        color: randomShape.color,
      });
    }
    setCurrentBlocks(blocks);
  }, []);

  const startGame = () => {
    if (keys <= 0) {
      toast({
        title: "Недостаточно ключей",
        description: "Подождите до завтра для восстановления ключей",
        variant: "destructive",
      });
      return;
    }

    onKeysUpdate(keys - 1);
    setGameActive(true);
    setGameOver(false);
    setBonesEarnedLocal(0);
    setGrid(Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ filled: false, color: '' }))));
    generateRandomBlocks();
  };

  const canPlaceBlock = (grid: GridCell[][], block: Block, row: number, col: number): boolean => {
    const { shape } = block;
    console.log('Checking if can place block at:', row, col, 'Shape:', shape);
    
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newRow = row + r;
          const newCol = col + c;
          console.log('Checking cell:', newRow, newCol);
          
          if (newRow >= GRID_SIZE || newCol >= GRID_SIZE) {
            console.log('Out of bounds:', newRow, newCol);
            return false;
          }
          
          if (grid[newRow][newCol].filled) {
            console.log('Cell already filled:', newRow, newCol);
            return false;
          }
        }
      }
    }
    console.log('Block can be placed');
    return true;
  };

  const placeBlock = (row: number, col: number, block: Block) => {
    console.log('Attempting to place block at:', row, col, 'Block shape:', block.shape);
    console.log('Can place block:', canPlaceBlock(grid, block, row, col));
    
    if (!canPlaceBlock(grid, block, row, col)) {
      console.log('Cannot place block - invalid position');
      return;
    }

    console.log('Placing block successfully');
    const newGrid = grid.map(row => row.map(cell => ({ ...cell })));
    const { shape, color } = block;
    
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          newGrid[row + r][col + c] = { filled: true, color };
        }
      }
    }

    setGrid(newGrid);
    
    // Remove the placed block and get the remaining blocks
    const remainingBlocks = currentBlocks.filter(b => b.id !== block.id);
    setCurrentBlocks(remainingBlocks);
    setDraggedBlock(null);

    // Check for completed lines and handle new block generation
    checkAndClearLines(newGrid, remainingBlocks);
  };

  const checkAndClearLines = (currentGrid: GridCell[][], remainingBlocks: Block[]) => {
    let newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
    let linesCleared = 0;

    // Check rows
    for (let row = 0; row < GRID_SIZE; row++) {
      if (newGrid[row].every(cell => cell.filled)) {
        newGrid[row] = Array(GRID_SIZE).fill(null).map(() => ({ filled: false, color: '' }));
        linesCleared++;
      }
    }

    // Check columns
    for (let col = 0; col < GRID_SIZE; col++) {
      if (newGrid.every(row => row[col].filled)) {
        newGrid.forEach(row => row[col] = { filled: false, color: '' });
        linesCleared++;
      }
    }

    if (linesCleared > 0) {
      const bonesEarned = linesCleared;
      setBonesEarnedLocal(prev => prev + bonesEarned);
      setGrid(newGrid);
      
      toast({
        title: `+${bonesEarned} косточек!`,
        description: `Очищено линий: ${linesCleared}`,
      });
    }

    // Generate new blocks if all are placed
    if (remainingBlocks.length === 0) {
      console.log('All blocks placed, generating new blocks...');
      setTimeout(() => {
        generateRandomBlocks();
        // Check game over after new blocks are generated
        setTimeout(() => {
          checkGameOver(newGrid);
        }, 50);
      }, 100);
    } else {
      // Check game over with remaining blocks
      setTimeout(() => {
        checkGameOverWithBlocks(newGrid, remainingBlocks);
      }, 100);
    }
  };

  const checkGameOver = (currentGrid: GridCell[][]) => {
    // Wait a bit for currentBlocks to be updated with new blocks
    setTimeout(() => {
      const hasValidMoves = currentBlocks.some(block => {
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (canPlaceBlock(currentGrid, block, row, col)) {
              return true;
            }
          }
        }
        return false;
      });

      if (!hasValidMoves && currentBlocks.length > 0) {
        setGameOver(true);
        setGameActive(false);
        onBonesEarned(bonesEarned);
        onRecordUpdate(bonesEarned);
        
        toast({
          title: "Игра окончена!",
          description: `Заработано косточек: ${bonesEarned}`,
        });
      }
    }, 200);
  };

  const checkGameOverWithBlocks = (currentGrid: GridCell[][], blocksToCheck: Block[]) => {
    const hasValidMoves = blocksToCheck.some(block => {
      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (canPlaceBlock(currentGrid, block, row, col)) {
            return true;
          }
        }
      }
      return false;
    });

    if (!hasValidMoves && blocksToCheck.length > 0) {
      setGameOver(true);
      setGameActive(false);
      onBonesEarned(bonesEarned);
      onRecordUpdate(bonesEarned);
      
      toast({
        title: "Игра окончена!",
        description: `Заработано косточек: ${bonesEarned}`,
      });
    }
  };

  const handleDragStart = (e: React.DragEvent, block: Block) => {
    console.log('Drag start:', block);
    setDraggedBlock(block);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, row: number, col: number) => {
    e.preventDefault();
    console.log('Drop at:', row, col, 'Block:', draggedBlock);
    if (draggedBlock) {
      placeBlock(row, col, draggedBlock);
    }
  };

  const handleTouchStart = (e: React.TouchEvent, block: Block) => {
    console.log('=== TOUCH START ===');
    console.log('Event:', e);
    console.log('Block:', block);
    console.log('Current state - isDragging:', isDragging, 'draggedBlock:', draggedBlock);
    
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    console.log('Touch info:', {
      clientX: touch.clientX,
      clientY: touch.clientY,
      touches_length: e.touches.length
    });
    
    const rect = e.currentTarget.getBoundingClientRect();
    console.log('Element rect:', rect);
    
    setDraggedBlock(block);
    setIsDragging(true);
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    
    console.log('State updated - setting draggedBlock:', block, 'isDragging: true');
  };

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    console.log('=== TOUCH MOVE ===');
    console.log('isDragging:', isDragging, 'draggedBlock:', draggedBlock);
    
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDragging || !draggedBlock) {
      console.log('Skipping touch move - not dragging or no block');
      return;
    }
    
    const touch = e.touches[0];
    console.log('Touch move position:', touch.clientX, touch.clientY);
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    
    // Calculate ghost position on grid
    const gridPos = calculateGridPosition(touch.clientX, touch.clientY);
    console.log('Touch move - grid position:', gridPos, 'Touch coords:', touch.clientX, touch.clientY);
    setGhostGridPosition(gridPos);
  }, [isDragging, draggedBlock, calculateGridPosition]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Touch end, isDragging:', isDragging, 'draggedBlock:', draggedBlock, 'ghostGridPosition:', ghostGridPosition);
    
    if (!isDragging || !draggedBlock) {
      setIsDragging(false);
      setDraggedBlock(null);
      setDragPosition(null);
      setGhostGridPosition(null);
      setTouchStartPos(null);
      return;
    }

    // Use ghost grid position for placement
    if (ghostGridPosition && canPlaceBlock(grid, draggedBlock, ghostGridPosition.row, ghostGridPosition.col)) {
      console.log('Placing block at ghost position:', ghostGridPosition);
      placeBlock(ghostGridPosition.row, ghostGridPosition.col, draggedBlock);
    } else {
      console.log('Cannot place block - invalid ghost position');
    }
    
    setIsDragging(false);
    setDraggedBlock(null);
    setDragPosition(null);
    setGhostGridPosition(null);
    setTouchStartPos(null);
  }, [isDragging, draggedBlock, ghostGridPosition, grid, canPlaceBlock, placeBlock]);

  // Add global touch event listeners for drag operations
  React.useEffect(() => {
    if (isDragging) {
      const handleGlobalTouchMove = (e: TouchEvent) => {
        handleTouchMove(e);
      };
      
      const handleGlobalTouchEnd = (e: TouchEvent) => {
        handleTouchEnd(e);
      };
      
      document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
      document.addEventListener('touchend', handleGlobalTouchEnd, { passive: false });
      
      return () => {
        document.removeEventListener('touchmove', handleGlobalTouchMove);
        document.removeEventListener('touchend', handleGlobalTouchEnd);
      };
    }
  }, [isDragging, handleTouchMove, handleTouchEnd]);

  const endGame = () => {
    setGameActive(false);
    setGameOver(false);
    navigate('/game');
  };

  if (gameOver) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="card-glow p-8 max-w-md w-full text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gold" />
          <h2 className="text-2xl font-bold mb-4 text-gold">Игра окончена!</h2>
          <p className="text-lg mb-2">Заработано косточек: <span className="font-bold text-gold">{bonesEarned}</span></p>
          <div className="flex gap-2 mt-6">
            <Button onClick={() => navigate('/game')} className="button-gold flex-1">
              Назад в BDOG GAME
            </Button>
            <Button onClick={() => navigate('/menu')} variant="outline" className="button-outline-gold flex-1">
              Меню
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!gameActive) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/game')}
              className="button-outline-gold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>

          <Card className="card-glow p-6 text-center mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gold">Фарм косточек</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Размещайте блоки на сетке 7x7. Очищайте полные линии чтобы заработать косточки!
            </p>
            <p className="text-lg mb-4">Ключи: <span className="font-bold text-gold">{keys}</span></p>
            
            <Button 
              onClick={startGame} 
              className="button-gold w-full"
              disabled={keys <= 0}
            >
              Играть
            </Button>
          </Card>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-2 py-4">
      <div className="max-w-md mx-auto">
          <div className="flex justify-center items-center mb-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Косточки</p>
              <p className="font-bold text-gold">{bonesEarned}</p>
            </div>
          </div>

        {/* Game Grid */}
        <Card className="card-glow p-3 mb-4">
          <div ref={gameGridRef} className="grid grid-cols-7 gap-1 mb-4">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                // Проверяем, должна ли эта клетка быть частью призрака
                let isGhostCell = false;
                if (ghostGridPosition && draggedBlock && isDragging) {
                  const validPlacement = canPlaceBlock(grid, draggedBlock, ghostGridPosition.row, ghostGridPosition.col);
                  const inGhostRange = rowIndex >= ghostGridPosition.row && 
                                     rowIndex < ghostGridPosition.row + draggedBlock.shape.length &&
                                     colIndex >= ghostGridPosition.col && 
                                     colIndex < ghostGridPosition.col + draggedBlock.shape[0].length;
                  
                  if (validPlacement && inGhostRange) {
                    const shapeRow = rowIndex - ghostGridPosition.row;
                    const shapeCol = colIndex - ghostGridPosition.col;
                    isGhostCell = draggedBlock.shape[shapeRow]?.[shapeCol] === true;
                  }
                }
                
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    data-row={rowIndex}
                    data-col={colIndex}
                    className={`aspect-square border border-muted-foreground/20 rounded-sm ${
                      cell.filled 
                        ? cell.color 
                        : isGhostCell 
                          ? 'bg-gold/30 border-gold border-2' 
                          : 'bg-muted/20'
                    }`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                  />
                );
              })
            )}
          </div>
        </Card>

        {/* Available Blocks */}
        <div className="grid grid-cols-2 gap-3">
          {currentBlocks.map((block) => (
            <Card
              key={block.id}
              className={`card-glow p-2 cursor-move transition-all hover:scale-105 select-none ${
                isDragging && draggedBlock?.id === block.id ? 'opacity-50' : ''
              }`}
              onTouchStart={(e) => handleTouchStart(e, block)}
            >
              <div className="grid gap-0.5 max-w-[80px] mx-auto" style={{
                gridTemplateColumns: `repeat(${block.shape[0].length}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${block.shape.length}, minmax(0, 1fr))`
              }}>
                {block.shape.map((row, rowIndex) =>
                  row.map((cell, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`aspect-square rounded-sm ${
                        cell ? block.color : 'bg-transparent'
                      }`}
                      style={{ minWidth: '8px', minHeight: '8px' }}
                    />
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};