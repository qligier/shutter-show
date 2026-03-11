export interface LoadedMedia {
  readonly handle: FileSystemFileHandle,
  readonly file: File
  readonly url: string
  readonly mediaType: MediaType
}

export enum MediaType {
  PHOTO, VIDEO
}

export class LoadedPhoto implements LoadedMedia {
  public readonly mediaType: MediaType = MediaType.PHOTO
  constructor(public readonly handle: FileSystemFileHandle,
              public readonly file: File,
              public readonly url: string) {
  }
}

export class LoadedVideo implements LoadedMedia {
  public readonly mediaType: MediaType = MediaType.VIDEO
  constructor(public readonly handle: FileSystemFileHandle,
              public readonly file: File,
              public readonly url: string) {
  }
}
