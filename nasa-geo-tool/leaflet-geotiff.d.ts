// src/types/leaflet-geotiff.d.ts
declare module 'leaflet-geotiff' {
    import { type ImageOverlayOptions } from 'leaflet';

    export interface GeoTIFFLayerOptions extends ImageOverlayOptions {
        arrowSize?: number;
        band?: number;
        renderer?: string;
        colorScale?: string;
        clampLow?: boolean;
        clampHigh?: boolean;
    }

    export class GeoTIFF extends L.ImageOverlay {
        constructor(url: string, options?: GeoTIFFLayerOptions);
        setColorScale(scale: string): void;
    }

    export class GeoTIFFLayer extends L.Layer {
        constructor(url: string, options?: GeoTIFFLayerOptions);
        setColorScale(scale: string): void;
    }
}
 