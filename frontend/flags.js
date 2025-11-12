export const FLAGS = {
  SHOW_FILTER_BAR: (import.meta?.env?.VITE_SHOW_FILTER_BAR ?? "false") === "true",
  GRID_LAYOUT_V2:  (import.meta?.env?.VITE_GRID_LAYOUT_V2  ?? "false") === "true",
  ONSCREEN_ONLY:   (import.meta?.env?.VITE_ONSCREEN_ONLY   ?? "false") === "true",
};
