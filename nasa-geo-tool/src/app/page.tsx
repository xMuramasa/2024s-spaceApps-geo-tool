
import { LatestPost } from "~/app/_components/post";
import { api, HydrateClient } from "~/trpc/server";
import MapComponent from "./_components/MapComponent";
import { useEffect, useState } from "react";

export default async function Home() {
  const hello = await api.post.hello({ text: "from tRPC" });
  const geoData = await api.geoJson.getGeoJSON();

  // const [coords, setCoords] = useState<{ latitude: number, longitude: number } | null>(null);

  // useEffect(() => {
  //   navigator.geolocation.getCurrentPosition(
  //     (position) => {
  //       setCoords(position.coords);
  //     },
  //     (error) => {
  //       console.error('Error getting user location:', error);
  //     }
  //   );
  // }, [])

  void api.post.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container grid grid-cols-1 md:grid-cols-3 gap-x-5">

          <div className="col-start-1 col-end-3">
            <MapComponent
              geoData={geoData}
              // latitude={coords?.latitude}
              // longitude={coords?.longitude}
            />
          </div>

          <div
            className="col-3 flex flex-col justify-between items-center"
          >
            <div className="text-2xl text-white">
              {hello ? hello.greeting : "Loading tRPC query..."}
            </div>

            <LatestPost />

          </div>




        </div>
      </main>
    </HydrateClient>
  );
}
