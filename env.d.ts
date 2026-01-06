import { DirectoryPickerOptions, FileSystemDirectoryHandle } from 'wicg-file-system-access'

declare global {
  interface Window {
    // optional because the API is not available in all browsers at runtime
    showDirectoryPicker?: (options?: DirectoryPickerOptions) => Promise<FileSystemDirectoryHandle>;
  }
}

export {}
