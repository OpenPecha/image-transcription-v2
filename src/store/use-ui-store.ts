import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Toast {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  action?: {
    label: string
    onClick: () => void
  }
}

export type Theme = 'system' | 'light' | 'dark'
export type Language = 'en' | 'bo'
export type EditorFontFamily = 'monlam' | 'monlam-2' | 'noto-black' | 'noto-bold' | 'noto-medium' | 'noto-regular' | 'noto-semibold'
export type EditorFontSize = 14 | 16 | 18 | 20 | 24 | 28 | 32

interface UIState {
  // Sidebar state
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Theme state
  theme: Theme
  setTheme: (theme: Theme) => void

  // Language state
  language: Language
  setLanguage: (language: Language) => void

  // Editor preferences
  editorFontFamily: EditorFontFamily
  editorFontSize: EditorFontSize
  setEditorFontFamily: (font: EditorFontFamily) => void
  setEditorFontSize: (size: EditorFontSize) => void

  // Toast notifications
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void

  // Modal state
  activeModal: string | null
  modalData: Record<string, unknown>
  openModal: (modalId: string, data?: Record<string, unknown>) => void
  closeModal: () => void

  // Workspace state
  unsavedChanges: boolean
  setUnsavedChanges: (hasChanges: boolean) => void

  // Dictionary panel
  dictionaryPanelOpen: boolean
  dictionaryPanelWidth: number
  toggleDictionaryPanel: () => void
  setDictionaryPanelOpen: (open: boolean) => void
  setDictionaryPanelWidth: (width: number) => void
}

let toastId = 0

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Theme
      theme: 'system',
      setTheme: (theme) => set({ theme }),

      // Language
      language: 'en',
      setLanguage: (language) => set({ language }),

      // Editor preferences
      editorFontFamily: 'monlam',
      editorFontSize: 20,
      setEditorFontFamily: (font) => set({ editorFontFamily: font }),
      setEditorFontSize: (size) => set({ editorFontSize: size }),

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = `toast_${++toastId}`
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
        // Auto-remove after 5 seconds
        setTimeout(() => {
          set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
        }, 5000)
      },
      removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
      clearToasts: () => set({ toasts: [] }),

      // Modal
      activeModal: null,
      modalData: {},
      openModal: (modalId, data = {}) => set({ activeModal: modalId, modalData: data }),
      closeModal: () => set({ activeModal: null, modalData: {} }),

      // Workspace
      unsavedChanges: false,
      setUnsavedChanges: (hasChanges) => set({ unsavedChanges: hasChanges }),

      // Dictionary panel
      dictionaryPanelOpen: false,
      dictionaryPanelWidth: 380,
      toggleDictionaryPanel: () =>
        set((state) => ({ dictionaryPanelOpen: !state.dictionaryPanelOpen })),
      setDictionaryPanelOpen: (open) => set({ dictionaryPanelOpen: open }),
      setDictionaryPanelWidth: (width) => set({ dictionaryPanelWidth: width }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        theme: state.theme,
        language: state.language,
        editorFontFamily: state.editorFontFamily,
        editorFontSize: state.editorFontSize,
        dictionaryPanelOpen: state.dictionaryPanelOpen,
        dictionaryPanelWidth: state.dictionaryPanelWidth,
      }),
    }
  )
)

