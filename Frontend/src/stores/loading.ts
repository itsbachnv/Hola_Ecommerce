import { create } from 'zustand';

interface LoadingState {
  isLoading: boolean;
  loadingText: string;
  loadingType: 'default' | 'creating' | 'updating' | 'deleting' | 'saving';
}

interface LoadingStore {
  loading: LoadingState;
  setLoading: (isLoading: boolean, text?: string, type?: LoadingState['loadingType']) => void;
  clearLoading: () => void;
}

export const useLoadingStore = create<LoadingStore>((set) => ({
  loading: {
    isLoading: false,
    loadingText: '',
    loadingType: 'default'
  },
  
  setLoading: (isLoading, text = 'Đang xử lý...', type = 'default') => {
    set({
      loading: {
        isLoading,
        loadingText: text,
        loadingType: type
      }
    });
  },
  
  clearLoading: () => {
    set({
      loading: {
        isLoading: false,
        loadingText: '',
        loadingType: 'default'
      }
    });
  }
}));
