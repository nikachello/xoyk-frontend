export function createBoard(rows: number, cols: number): (string | null)[][] {
  return Array(rows)
    .fill(null)
    .map(() => Array(cols).fill(null));
}
