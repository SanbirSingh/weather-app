import CurrentWeather from "@/components/current-weather";
import FavouriteCities from "@/components/favourite-cities";
import HourlyTemperature from "@/components/hourly-temperature";
import WeatherSkeleton from "@/components/loading-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button"
import WeatherDetails from "@/components/weather-details";
import WeatherForecast from "@/components/weather-forecast";
import { useGeoLocation } from "@/hooks/use-geolocation"
import { useWeatherQuery, useForecastQuery, useReverseGeocodeQuery } from "@/hooks/use-weather";
import { AlertTriangle, MapPin, RefreshCw } from "lucide-react"
import MapCard from "@/components/ui/map-card";

const WeatherDashboard = () => {
const {coordinates, error: locationError, getLocation, isLoading: locationLoading} = useGeoLocation();

const weatherQuery = useWeatherQuery(coordinates);
const forecastQuery = useForecastQuery(coordinates);
const locationQuery = useReverseGeocodeQuery(coordinates);

console.log(weatherQuery.data)


const handleRefresh = () => {
  getLocation()
  if(coordinates){
    weatherQuery.refetch()
    forecastQuery.refetch()
    locationQuery.refetch()
  }
}

if(locationLoading) {
  return <WeatherSkeleton />
}

if(locationError) {
  return(
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Location Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>{locationError}</p>
        <Button onClick={getLocation} variant={"outline"} className="w-fit">
          <MapPin className="mr-2 h-4 w-4" />
          Enable Location
        </Button>
      </AlertDescription>
    </Alert>
  )
}

if(!coordinates) {
  return(
    <Alert variant="destructive">
      <AlertTitle>Location Required</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>lease enable location access to see your local weather.</p>
        <Button onClick={getLocation} variant={"outline"} className="w-fit">
          <MapPin className="mr-2 h-4 w-4" />
          Enable Location
        </Button>
      </AlertDescription>
    </Alert>
  )
}

const locationName = locationQuery.data?.[0];

if(weatherQuery.error || forecastQuery.error) {
  return(
    <Alert variant="destructive">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="flex flex-col gap-4">
        <p>Failed to fetch weather data. Please try again.</p>
        <Button onClick={handleRefresh} variant={"outline"} className="w-fit">
          <RefreshCw className="mr-2 h-4 w-4" />
          retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}

if(!weatherQuery.data || !forecastQuery.data) {
  return <WeatherSkeleton />
}

  return (
    <div className="space-y-4">
      {/* {Favourite Cities} */}
      <FavouriteCities />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight">My Location</h1>
        <Button 
          variant={"outline"} 
          size={"icon"} 
          onClick={handleRefresh} 
          disabled={weatherQuery.isFetching || forecastQuery.isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${weatherQuery.isFetching ? "animate-spin" : ""}`}/>
        </Button>
      </div>

      <div className="grid gap-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <CurrentWeather data={weatherQuery.data} locationName = {locationName} />
          <HourlyTemperature data={forecastQuery.data} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <WeatherDetails data={weatherQuery.data} />
          <MapCard 
            lat={coordinates.lat} 
            lng={coordinates.lon} 
            locationName={locationName?.name} 
          />
        </div>
        <WeatherForecast data={forecastQuery.data} />
      </div>
      </div>
    </div>
  )
}

export default WeatherDashboard 
