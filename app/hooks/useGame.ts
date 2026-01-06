"use client";
import { useState } from "react";
import { Player } from "../game/types";

export const useGame = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);

  const [roomId, setRoomId] = useState<string | null>(null);

  const createRoom = async () => {
    if (!currentPlayer) return;
    const res = await fetch("https://xoyk-backend.onrender.com/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player: currentPlayer }),
    });

    const data = await res.json();
    setRoomId(data.roomId);
  };

  const joinRoom = async (id: string) => {
    if (!currentPlayer) return;
    const res = await fetch(
      `https://xoyk-backend.onrender.com/rooms/join/${id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player: currentPlayer }),
      }
    );

    const data = await res.json();
    setRoomId(data.roomId);
  };

  return {
    currentPlayer,
    setCurrentPlayer,
    roomId,
    setRoomId,
    createRoom,
    joinRoom,
  };
};
