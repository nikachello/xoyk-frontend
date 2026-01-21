"use client";

import { useEffect, useState } from "react";
import { Player } from "../game/types";
import { apiClient } from "../lib/api";
import { socket, connectSocket } from "../lib/socket";

type CreateRoomResponse = {
  roomId: string;
};

export const useGame = () => {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [roomId, setRoomId] = useState<string | null>(null);

  // CONNECT SOCKET
  useEffect(() => {
    connectSocket();

    const onConnect = () => {
      if (roomId && currentPlayer) {
        socket.emit("joinRoom", {
          roomId,
          player: currentPlayer,
        });
      }
    };

    socket.on("connect", onConnect);

    return () => {
      socket.off("connect", onConnect);
    };
  }, [roomId, currentPlayer]);

  // HANDLE MOBILE BACKGROUND / FOREGROUND
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        connectSocket();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  const createRoom = async () => {
    if (!currentPlayer) return;

    const { data } = await apiClient.post<CreateRoomResponse>("/rooms", {
      player: currentPlayer,
    });

    setRoomId(data.roomId);

    socket.emit("joinRoom", {
      roomId: data.roomId,
      player: currentPlayer,
    });
  };

  const joinRoom = async (id: string) => {
    if (!currentPlayer) return;

    const { data } = await apiClient.post<CreateRoomResponse>(
      `/rooms/join/${id}`,
      { player: currentPlayer }
    );

    setRoomId(data.roomId);

    socket.emit("joinRoom", {
      roomId: data.roomId,
      player: currentPlayer,
    });
  };

  return {
    currentPlayer,
    setCurrentPlayer,
    roomId,
    createRoom,
    joinRoom,
  };
};
