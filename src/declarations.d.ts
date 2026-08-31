import '@hugeicons/react';

declare module '@hugeicons/react' {
  export interface HugeiconsProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: React.MouseEventHandler<SVGSVGElement>;
    [key: string]: any;
  }
}
