declare module "heic-decode" {
  export default function decode(options: {
    buffer: Buffer | ArrayBuffer | Uint8Array;
  }): Promise<{
    width: number;
    height: number;
    data: Uint8ClampedArray | Uint8Array;
  }>;
}
