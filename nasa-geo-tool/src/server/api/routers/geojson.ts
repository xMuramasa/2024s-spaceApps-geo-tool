import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { readFileSync } from 'fs';
import { join } from 'path';

import { FeatureCollectionSchema } from "~/app/models/geojson";

export const geojsonRouter = createTRPCRouter({
  getGeoJSON: publicProcedure
    .query(() => {
      // Read the file from the filesystem
      const filePath = join(process.cwd(), 'public', 'geofiles', 'data.json');
      const geojsonData = FeatureCollectionSchema.parse(
        JSON.parse(readFileSync(filePath, 'utf8'))
      );

      return geojsonData as GeoJSON.FeatureCollection; // Return the parsed GeoJSON data
    }),
});