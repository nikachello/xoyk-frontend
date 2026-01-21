"use client";

import { useEffect, useState } from "react";
import { GameState, Player } from "./game/types";
import { createBoard } from "./game/board";
import { socket } from "./lib/socket";
import { useGame } from "./hooks/useGame";

const initialState: GameState = {
  board: createBoard(13, 13),
  players: null,
  currentTurn: 0,
  winner: null,
  winningCells: [],
};

const colors: Record<string, string> = {
  X: "#6366f1",
  O: "#ec4899",
  Y: "#22c55e",
  K: "#f59e0b",
};
export default function Home() {
  const { currentPlayer, setCurrentPlayer, roomId, createRoom, joinRoom } =
    useGame();

  const [state, setState] = useState<GameState | null>(null);
  const [tempName, setTempName] = useState("");
  const [inputRoomId, setInputRoomId] = useState("");

  useEffect(() => {
    if (!roomId || !currentPlayer) return;

    socket.emit("joinRoom", { roomId, player: currentPlayer });

    socket.on("gameUpdate", (newState: GameState) => {
      setState(newState);
    });

    return () => {
      socket.off("gameUpdate");
    };
  }, [roomId, currentPlayer]);

  const handleSetPlayer = () => {
    if (!tempName.trim()) return;

    setCurrentPlayer({
      id: self.crypto.randomUUID(),
      name: tempName,
      char: "",
    });
  };

  if (!currentPlayer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h1 className="text-3xl font-bold mb-6">XOYK</h1>
        <input
          className="p-2 rounded bg-gray-800 border border-indigo-500 mb-4"
          placeholder="შეიყვანე სახელი"
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
        />
        <button
          className="px-6 py-2 bg-indigo-600 rounded"
          onClick={handleSetPlayer}
        >
          შესვლა
        </button>
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <h2 className="text-xl mb-4">გამარჯობა, {currentPlayer.name}!</h2>
        <div className="space-y-4 flex flex-col">
          <button
            className="px-6 py-3 bg-green-600 rounded-xl font-bold"
            onClick={createRoom}
          >
            ახალი ოთახის შექმნა
          </button>
          <div className="flex gap-2">
            <input
              className="p-2 rounded bg-gray-800 border border-gray-600"
              placeholder="ოთახის ID"
              value={inputRoomId}
              onChange={(e) => setInputRoomId(e.target.value)}
            />
            <button
              className="px-4 py-2 bg-indigo-600 rounded"
              onClick={() => joinRoom(inputRoomId)}
            >
              შეერთება
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="animate-pulse">თამაში იტვირთება...</p>
      </div>
    );
  }

  if (!state || !state.players || state.players.length < 4) {
    const playersJoined = state?.players?.length || 0;
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
        <p className="text-xl font-semibold">ველოდებით მოთამაშეებს...</p>
        <p className="text-gray-400 mt-2">შეერთებულია: {playersJoined} / 4</p>
        <div className="mt-6 w-full max-w-xs">
          <p className="text-sm text-gray-500 mb-2">მოთამაშეები:</p>
          <div className="space-y-2">
            {state.players!.map((p, i) => (
              <div
                key={i}
                className="flex justify-between bg-gray-800 p-2 rounded border border-gray-700"
              >
                <span>{p.name}</span>
                <span className="font-bold text-indigo-400">{p.char}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 p-4 bg-gray-800 rounded-lg">
          <p className="text-sm">გაუზიარე ოთახის ID მეგობრებს:</p>
          <p className="text-indigo-400 font-mono font-bold select-all">
            {roomId}
          </p>
        </div>
      </div>
    );
  }

  const handleClick = (row: number, col: number) => {
    if (!currentPlayer || !state) return;

    // Local check: is it my turn?
    const isMyTurn = state.players![state.currentTurn].id === currentPlayer.id;

    if (!isMyTurn) {
      console.log("It's not your turn!");
      return;
    }

    socket.emit("makeMove", {
      row,
      col,
    });
  };

  const resetGame = () => {
    setState(initialState);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-white mb-2">
          {state.winner ? (
            <>
              გილოცავთ! მოიგო {state.winner.name} ({state.winner.char})
            </>
          ) : (
            <>
              შემდეგი სვლა: {state.players[state.currentTurn].name} -{" "}
              {state.players[state.currentTurn].char}
            </>
          )}
        </h1>
        <button
          className="mt-2 px-6 py-2 bg-indigo-500 text-white rounded-xl shadow hover:bg-indigo-600 transition"
          onClick={resetGame}
        >
          თავიდან დაწყება
        </button>
      </div>

      {/* Board */}
      <div className="bg-white/5 p-4 rounded-2xl backdrop-blur-sm">
        <div
          className="grid gap-1 bg-white/20 p-2 rounded-xl"
          style={{
            gridTemplateColumns: `repeat(${state.board[0].length}, minmax(0, 1fr))`,
          }}
        >
          {state.board.map((rowArr, rowIndex) =>
            rowArr.map((cell, colIndex) => {
              const isWinningCell = state.winningCells.some(
                (coord) => coord.row === rowIndex && coord.col === colIndex
              );
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-8 h-8 bg-white rounded-md shadow-sm flex items-center justify-center font-bold text-lg transition-all
                    ${
                      isWinningCell
                        ? "ring-4 ring-yellow-400 scale-125 animate-pulse"
                        : "hover:bg-indigo-100 hover:scale-110"
                    }
                  `}
                  style={{ color: colors[cell as keyof typeof colors] }}
                  onClick={() => handleClick(rowIndex, colIndex)}
                >
                  {cell}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
