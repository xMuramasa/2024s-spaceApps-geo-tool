import z from 'zod';

// Geometry schema (simplified for common cases)
export const GeometrySchema = z.object({
  type: z.enum(['Point', 'LineString', 'Polygon', 'MultiPoint', 'MultiLineString', 'MultiPolygon']),
  coordinates: z.any(), // You can make this more strict based on geometry type
});

// Feature schema
export const FeatureSchema = z.object({
  type: z.literal('Feature'),
  geometry: GeometrySchema.nullable(), // Geometry can be null
  properties: z.record(z.any()).nullable(), // Properties object or null
});

// FeatureCollection schema
export const FeatureCollectionSchema = z.object({
  type: z.literal('FeatureCollection'),
  features: z.array(FeatureSchema),
});