import { create } from "zustand";

type NewPageStore = {
  selectedTemplate: number;
  setSelectedTemplate: (projectId: number) => void;
  titleInput: string;
  setTitleInput: (title: string) => void;
  filters: { id: number; selected: boolean }[];
  getSelectedFilters: () => { id: number; selected: boolean }[];
  setFilters: (filters: { id: number; selected: boolean }[]) => void;
  getFilter: (id: number) => { id: number; selected: boolean } | undefined;
  toggleFilter: (id: number) => void;
};

export const useNewPageStore = create<NewPageStore>((set, get) => ({
  selectedTemplate: 21,
  setSelectedTemplate: (projectId) => set({ selectedTemplate: projectId }),
  titleInput: "Untitled",
  setTitleInput: (title) => set({ titleInput: title }),
  filters: [],
  getSelectedFilters: () => {
    const selectedFilters = get().filters.filter((filter) => filter.selected);
    return selectedFilters;
  },
  setFilters: (filters) => set({ filters }),
  getFilter: (id) => {
    const filter = get().filters.find((filter) => filter.id === id);
    return filter;
  },
  toggleFilter: (id) => {
    const filters = get().filters.map((filter) =>
      filter.id === id ? { ...filter, selected: !filter.selected } : filter,
    );
    set({ filters: filters });
  },
}));
