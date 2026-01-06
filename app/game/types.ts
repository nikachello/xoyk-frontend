export type Player = {
  id: string;
  name: string;
  char: string;
};

export type Coord = { row: number; col: number };

export type GameState = {
  board: (string | null)[][];
  players: Player[] | null;
  currentTurn: number;
  winner: Player | null;
  winningCells: Coord[];
};
