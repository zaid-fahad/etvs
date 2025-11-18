declare module "qrcode" {
  interface Options {
    errorCorrectionLevel?: "L" | "M" | "Q" | "H";
    type?: "image/png" | "image/jpeg" | "svg";
    width?: number;
    margin?: number;
    color?: {
      dark: string;
      light: string;
    };
  }

  export function toDataURL(
    text: string,
    options?: Options
  ): Promise<string>;

  export function toBuffer(
    text: string,
    options?: Options
  ): Promise<Buffer>;
}
