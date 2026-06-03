export interface PickerAsset {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
}

export const toUploadFile = (asset: PickerAsset, fallbackName: string) => ({
  uri: asset.uri,
  name: asset.fileName || fallbackName,
  type: asset.mimeType || 'image/jpeg',
});

