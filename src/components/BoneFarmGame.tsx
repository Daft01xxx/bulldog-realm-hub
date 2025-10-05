import React, { useState, useCallback, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { ArrowLeft, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from './ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface BoneFarmGameProps {
  keys: number;
  onKeysUpdate: (newKeys: number) => void;
  onBonesEarned: (bones: number) => void;
  onRecordUpdate: (record: number) => void;
}

const GRID_SIZE = 9;

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
  const [claimed, setClaimed] = useState(false);
  const gameGridRef = useRef<HTMLDivElement>(null);

  const calculateGridPosition = (clientX: number, clientY: number): { row: number; col: number } | null => {
    if (!gameGridRef.current) {
      return null;
    }
    
    const gridRect = gameGridRef.current.getBoundingClientRect();
    
    // Убеждаемся что элемент видим и имеет правильные размеры
    if (gridRect.width === 0 || gridRect.height === 0) {
      return null;
    }
    
    const cellSize = gridRect.width / GRID_SIZE;
    
    const relativeX = clientX - gridRect.left;
    const relativeY = clientY - gridRect.top;
    
    // Добавляем небольшой отступ для лучшего попадания в нижние ячейки
    const col = Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((relativeX + cellSize * 0.1) / cellSize)));
    const row = Math.max(0, Math.min(GRID_SIZE - 1, Math.floor((relativeY + cellSize * 0.1) / cellSize)));
    
    return { row, col };
  };

  const generateRandomBlocks = useCallback((count: number = 2) => {
    const blocks = [];
    for (let i = 0; i < count; i++) {
      const randomShape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
      blocks.push({
        id: Date.now() + i, // Unique ID using timestamp
        shape: randomShape.shape,
        color: randomShape.color,
      });
    }
    setCurrentBlocks(blocks);
  }, []);

  const startGame = () => {
    // Keys are now infinite, no need to check
    setGameActive(true);
    setGameOver(false);
    setBonesEarnedLocal(0);
    setClaimed(false);
    
    // Create fresh grid
    const newGrid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(null).map(() => ({ filled: false, color: '' })));
    
    // Place 5 random blocks on the grid
    for (let i = 0; i < 5; i++) {
      const randomShape = BLOCK_SHAPES[Math.floor(Math.random() * BLOCK_SHAPES.length)];
      let placed = false;
      let attempts = 0;
      
      // Try to place block randomly, max 20 attempts per block
      while (!placed && attempts < 20) {
        const randomRow = Math.floor(Math.random() * (GRID_SIZE - randomShape.shape.length + 1));
        const randomCol = Math.floor(Math.random() * (GRID_SIZE - randomShape.shape[0].length + 1));
        
        // Check if block can be placed
        let canPlace = true;
        for (let r = 0; r < randomShape.shape.length; r++) {
          for (let c = 0; c < randomShape.shape[r].length; c++) {
            if (randomShape.shape[r][c] && newGrid[randomRow + r][randomCol + c].filled) {
              canPlace = false;
              break;
            }
          }
          if (!canPlace) break;
        }
        
        // Place block if possible
        if (canPlace) {
          for (let r = 0; r < randomShape.shape.length; r++) {
            for (let c = 0; c < randomShape.shape[r].length; c++) {
              if (randomShape.shape[r][c]) {
                newGrid[randomRow + r][randomCol + c] = { filled: true, color: randomShape.color };
              }
            }
          }
          placed = true;
        }
        
        attempts++;
      }
    }
    
    setGrid(newGrid);
    generateRandomBlocks(2); // Give player 2 blocks to work with
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
    setDraggedBlock(null);

    // Update blocks state and handle game logic
    setCurrentBlocks(prevBlocks => {
      const remainingBlocks = prevBlocks.filter(b => b.id !== block.id);
      console.log('Remaining blocks after placement:', remainingBlocks.length);
      
      // Check for completed lines first
      checkAndClearLines(newGrid);
      
      // If no blocks remain, generate new ones after a delay
      if (remainingBlocks.length === 0) {
        console.log('No blocks remaining, generating new ones...');
        setTimeout(() => {
          generateRandomBlocks();
        }, 300);
      } else {
        // Check game over with remaining blocks
        setTimeout(() => {
          checkGameOverWithBlocks(newGrid, remainingBlocks);
        }, 100);
      }
      
      return remainingBlocks;
    });
  };

  const checkAndClearLines = (currentGrid: GridCell[][]) => {
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
      const bonesEarned = linesCleared * 3; // 3x больше косточек
      
      // Анимация очистки линий
      setTimeout(() => {
        setBonesEarnedLocal(prev => prev + bonesEarned);
        setGrid(newGrid);
        
        toast({
          title: `✨ +${bonesEarned} косточек!`,
          description: `🔥 Очищено линий: ${linesCleared}`,
        });
      }, 200);
    }
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

  // Effect to check game over when new blocks are generated
  React.useEffect(() => {
    if (currentBlocks.length > 0 && gameActive && !gameOver) {
      const hasValidMoves = currentBlocks.some(block => {
        for (let row = 0; row < GRID_SIZE; row++) {
          for (let col = 0; col < GRID_SIZE; col++) {
            if (canPlaceBlock(grid, block, row, col)) {
              return true;
            }
          }
        }
        return false;
      });

      if (!hasValidMoves) {
        setGameOver(true);
        setGameActive(false);
        onBonesEarned(bonesEarned);
        onRecordUpdate(bonesEarned);
        
        toast({
          title: "Игра окончена!",
          description: `Заработано косточек: ${bonesEarned}`,
        });
      }
    }
  }, [currentBlocks, grid, gameActive, gameOver, bonesEarned, onBonesEarned, onRecordUpdate]);

  const forceEndGame = () => {
    setGameOver(true);
    setGameActive(false);
    onBonesEarned(bonesEarned);
    onRecordUpdate(bonesEarned);
  };

  const getBlockSize = (block: Block) => {
    const rows = block.shape.length;
    const cols = block.shape[0]?.length || 0;
    
    // Вертикальные блоки (больше рядов, чем колонок) - маленькие
    if (rows > cols) {
      return 'w-16 h-20'; // Увеличенный размер для вертикальных
    }
    
    // Большие блоки
    if (rows >= 3 || cols >= 3) {
      return 'w-20 h-20';
    }
    
    // Средние блоки
    return 'w-16 h-16';
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
    e.preventDefault();
    e.stopPropagation();
    
    const touch = e.touches[0];
    
    setDraggedBlock(block);
    setIsDragging(true);
    setTouchStartPos({ x: touch.clientX, y: touch.clientY });
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    
    // Добавляем визуальную обратную связь
    const target = e.currentTarget as HTMLElement;
    target.style.transform = 'scale(1.05)';
    target.style.transition = 'transform 0.1s ease';
  };

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isDragging || !draggedBlock) {
      return;
    }
    
    const touch = e.touches[0];
    setDragPosition({ x: touch.clientX, y: touch.clientY });
    
    // Calculate ghost position on grid with improved precision
    const gridPos = calculateGridPosition(touch.clientX, touch.clientY);
    setGhostGridPosition(gridPos);
  }, [isDragging, draggedBlock, calculateGridPosition]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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
      placeBlock(ghostGridPosition.row, ghostGridPosition.col, draggedBlock);
      // Вибрация при успешном размещении (если поддерживается)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    }
    
    // Reset all drag states
    setIsDragging(false);
    setDraggedBlock(null);
    setDragPosition(null);
    setGhostGridPosition(null);
    setTouchStartPos(null);
    
    // Сбрасываем стили всех блоков
    document.querySelectorAll('[data-block-card]').forEach(el => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.transform = '';
      htmlEl.style.transition = '';
    });
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
        <Card className="glass-card p-8 max-w-md w-full text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gold" />
          <h2 className="text-2xl font-bold mb-4 text-gold">Игра окончена!</h2>
          <p className="text-lg mb-2">Заработано косточек: <span className="font-bold text-gold">{bonesEarned}</span></p>
          {!claimed && (
            <Button 
              onClick={async () => {
                if (bonesEarned <= 0) return;
                
                try {
                  const { error } = await supabase.rpc('add_bones', { amount: bonesEarned });
                  
                  if (error) {
                    console.error('Error adding bones:', error);
                    return;
                  }
                  
                  onBonesEarned(bonesEarned);
                  setClaimed(true);
                  
                  toast({
                    title: "✅ Косточки зачислены!",
                    description: `Добавлено ${bonesEarned} косточек`,
                  });
                  
                } catch (error) {
                  console.error('Error claiming bones:', error);
                }
              }}
              className="button-gold w-full mb-4"
              disabled={bonesEarned <= 0}
            >
              Забрать косточки ({bonesEarned})
            </Button>
          )}
          <Button onClick={() => navigate('/menu')} variant="outline" className="button-outline-gold w-full">
            Меню
          </Button>
        </Card>
      </div>
    );
  }

  if (!gameActive) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="max-w-md mx-auto">

          <Card className="card-glow p-6 text-center mb-6">
            <h2 className="text-2xl font-bold mb-4 text-gold">Фарм косточек</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Размещайте блоки на сетке 9x9. Очищайте полные линии чтобы заработать косточки!
            </p>
            <p className="text-lg mb-4">Ключи: <span className="font-bold text-gold">∞</span></p>
            
            <Button 
              onClick={startGame} 
              className="button-gold w-full"
              disabled={false}
            >
              Играть
            </Button>
          </Card>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-2 py-4 pb-8 touch-none overscroll-none">
        <div className="max-w-md mx-auto touch-none">
          <div className="flex justify-between items-center mb-4 animate-fade-in">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Косточки</p>
              <p className="font-bold text-gold text-2xl transition-all duration-300">{bonesEarned}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={forceEndGame}
              className="button-outline-gold hover:scale-105 transition-transform"
            >
              Завершить
            </Button>
          </div>

        {/* Game Grid */}
        <Card className="card-glow p-1 mb-6">
          <div ref={gameGridRef} className="grid gap-0 mx-auto bg-muted/5 p-1 rounded-lg" style={{ maxWidth: '306px', gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))` }}>
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
                    data-filled={cell.filled ? 'true' : 'false'}
                    className={`aspect-square border-[0.5px] border-muted-foreground/20 transition-all duration-300 ${
                      cell.filled 
                        ? `${cell.color} shadow-lg animate-scale-in` 
                        : isGhostCell 
                          ? 'bg-gold/40 border-gold border-2 shadow-gold/50 shadow-md animate-pulse' 
                          : 'bg-muted/10 hover:bg-muted/20'
                    }`}
                    style={{ width: '32px', height: '32px' }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, rowIndex, colIndex)}
                  />
                );
              })
            )}
          </div>
        </Card>

        {/* Available Blocks */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          {currentBlocks.map((block, index) => {
            const blockSizeClass = getBlockSize(block);
            
            return (
              <Card
                key={block.id}
                data-block-card
                className={`card-glow p-4 cursor-move transition-all duration-300 hover:scale-110 select-none shadow-lg animate-fade-in ${
                  isDragging && draggedBlock?.id === block.id ? 'opacity-30 scale-90' : 'hover:shadow-gold/30 hover:rotate-2'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                onTouchStart={(e) => handleTouchStart(e, block)}
                draggable
                onDragStart={(e) => handleDragStart(e, block)}
              >
                <div className={`grid mx-auto ${blockSizeClass} bg-muted/5 p-0 rounded overflow-hidden`} style={{
                  gridTemplateColumns: `repeat(${block.shape[0].length}, minmax(0, 1fr))`,
                  gridTemplateRows: `repeat(${block.shape.length}, minmax(0, 1fr))`,
                  gap: '1px'
                }}>
                  {block.shape.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`aspect-square transition-all duration-200 ${
                          cell ? `${block.color}` : 'bg-transparent'
                        }`}
                        style={{ minWidth: '14px', minHeight: '14px' }}
                      />
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};