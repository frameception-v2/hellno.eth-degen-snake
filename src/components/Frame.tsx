"use client";

import { useEffect, useCallback, useState } from "react";
import { useFrameSDK } from "../hooks/useFrameSDK";
import { GAME_SIZE, CELL_SIZE, GAME_SPEED } from "~/lib/constants";

type Position = {
  x: number;
  y: number;
};

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

export default function Frame() {
  const { isSDKLoaded } = useFrameSDK();
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Direction>("RIGHT");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  const generateFood = useCallback(() => {
    const x = Math.floor(Math.random() * (GAME_SIZE / CELL_SIZE));
    const y = Math.floor(Math.random() * (GAME_SIZE / CELL_SIZE));
    return { x, y };
  }, []);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowUp":
        setDirection(prev => prev !== "DOWN" ? "UP" : prev);
        break;
      case "ArrowDown":
        setDirection(prev => prev !== "UP" ? "DOWN" : prev);
        break;
      case "ArrowLeft":
        setDirection(prev => prev !== "RIGHT" ? "LEFT" : prev);
        break;
      case "ArrowRight":
        setDirection(prev => prev !== "LEFT" ? "RIGHT" : prev);
        break;
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const startX = touch.clientX;
    const startY = touch.clientY;

    const handleTouchEnd = (e: TouchEvent) => {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;

      const diffX = endX - startX;
      const diffY = endY - startY;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (diffX > 0) {
          setDirection(prev => prev !== "LEFT" ? "RIGHT" : prev);
        } else {
          setDirection(prev => prev !== "RIGHT" ? "LEFT" : prev);
        }
      } else {
        // Vertical swipe
        if (diffY > 0) {
          setDirection(prev => prev !== "UP" ? "DOWN" : prev);
        } else {
          setDirection(prev => prev !== "DOWN" ? "UP" : prev);
        }
      }

      document.removeEventListener("touchend", handleTouchEnd);
    };

    document.addEventListener("touchend", handleTouchEnd);
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("touchstart", handleTouchStart);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("touchstart", handleTouchStart);
    };
  }, [handleKeyPress, handleTouchStart]);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        const newSnake = [...prev];
        const head = { ...newSnake[0] };

        switch (direction) {
          case "UP":
            head.y--;
            break;
          case "DOWN":
            head.y++;
            break;
          case "LEFT":
            head.x--;
            break;
          case "RIGHT":
            head.x++;
            break;
        }

        // Check collision with walls
        if (
          head.x < 0 ||
          head.x >= GAME_SIZE / CELL_SIZE ||
          head.y < 0 ||
          head.y >= GAME_SIZE / CELL_SIZE
        ) {
          setGameOver(true);
          return prev;
        }

        // Check collision with self
        if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
          setGameOver(true);
          return prev;
        }

        // Check if food is eaten
        if (head.x === food.x && head.y === food.y) {
          setScore(s => s + 1);
          setFood(generateFood());
        } else {
          newSnake.pop();
        }

        newSnake.unshift(head);
        return newSnake;
      });
    };

    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [direction, food, gameOver, generateFood]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-[300px] mx-auto py-2 px-2">
      <div className="relative bg-black" style={{ width: GAME_SIZE, height: GAME_SIZE }}>
        {snake.map((segment, i) => (
          <div
            key={i}
            className="absolute bg-green-500"
            style={{
              width: CELL_SIZE,
              height: CELL_SIZE,
              left: segment.x * CELL_SIZE,
              top: segment.y * CELL_SIZE,
            }}
          />
        ))}
        <div
          className="absolute text-2xl"
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            left: food.x * CELL_SIZE,
            top: food.y * CELL_SIZE,
          }}
        >
          🎩
        </div>
        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-white text-center">
              <h2 className="text-xl font-bold">Game Over!</h2>
              <p>Score: {score}</p>
              <button
                className="mt-4 px-4 py-2 bg-green-500 rounded"
                onClick={() => {
                  setSnake([{ x: 10, y: 10 }]);
                  setFood(generateFood());
                  setDirection("RIGHT");
                  setGameOver(false);
                  setScore(0);
                }}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 text-center">
        <p>Score: {score}</p>
        <p className="text-sm text-gray-500">Swipe or use arrow keys to play</p>
      </div>
    </div>
  );
}
