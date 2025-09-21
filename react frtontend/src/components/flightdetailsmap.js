import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import PropTypes from 'prop-types';

const FlightDetailsMap = ({ 
  departure = { city: "New York", code: "JFK", time: "14:30" },
  arrival = { city: "London", code: "LHR", time: "02:45" },
  flightPath = true 
}) => {
  const mapRef = useRef(null);
  const [mapError, setMapError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Airport coordinates (you would typically get these from an API)
  const airportCoordinates = {
    'JFK': { lat: 40.6413, lng: -73.7781, name: 'John F. Kennedy International Airport' },
    'LAX': { lat: 33.9425, lng: -118.4081, name: 'Los Angeles International Airport' },
    'LHR': { lat: 51.4700, lng: -0.4543, name: 'London Heathrow Airport' },
    'CDG': { lat: 49.0097, lng: 2.5479, name: 'Charles de Gaulle Airport' },
    'YYZ': { lat: 43.6777, lng: -79.6248, name: 'Toronto Pearson International Airport' },
    'MIA': { lat: 25.7959, lng: -80.2870, name: 'Miami International Airport' }
  };

  useEffect(() => {
    const initializeMap = async () => {
      try {
        setIsLoading(true);
        
        // Initialize Google Maps
        const loader = new Loader({
          apiKey: 'AIzaSyCZCT7VDAuQJdH-c6zvfI6G8Yw6dZ7AQko', // Replace with your actual API key
          version: 'weekly',
          libraries: ['geometry']
        });

        const google = await loader.load();
        
        const departureCoords = airportCoordinates[departure.code];
        const arrivalCoords = airportCoordinates[arrival.code];

        if (!departureCoords || !arrivalCoords) {
          throw new Error('Airport coordinates not found');
        }

        // Create map
        const map = new google.maps.Map(mapRef.current, {
          zoom: 4,
          center: {
            lat: (departureCoords.lat + arrivalCoords.lat) / 2,
            lng: (departureCoords.lng + arrivalCoords.lng) / 2
          },
          mapTypeId: 'terrain',
          styles: [
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
            },
            {
              featureType: 'landscape',
              elementType: 'geometry',
              stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
            }
          ]
        });

        // Create departure marker
        const departureMarker = new google.maps.Marker({
          position: departureCoords,
          map: map,
          title: `${departure.city} (${departure.code})`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#fbbf24',
            fillOpacity: 1,
            strokeColor: '#f59e0b',
            strokeWeight: 2
          }
        });

        // Create arrival marker
        const arrivalMarker = new google.maps.Marker({
          position: arrivalCoords,
          map: map,
          title: `${arrival.city} (${arrival.code})`,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#059669',
            strokeWeight: 2
          }
        });

        // Add info windows
        const departureInfoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h6 class="mb-1 fw-bold">${departure.city}</h6>
              <p class="mb-1 small">${departure.code} - ${departureCoords.name}</p>
              <p class="mb-0 small text-muted">Departure: ${departure.time}</p>
            </div>
          `
        });

        const arrivalInfoWindow = new google.maps.InfoWindow({
          content: `
            <div class="p-2">
              <h6 class="mb-1 fw-bold">${arrival.city}</h6>
              <p class="mb-1 small">${arrival.code} - ${arrivalCoords.name}</p>
              <p class="mb-0 small text-muted">Arrival: ${arrival.time}</p>
            </div>
          `
        });

        // Add click listeners for info windows
        departureMarker.addListener('click', () => {
          arrivalInfoWindow.close();
          departureInfoWindow.open(map, departureMarker);
        });

        arrivalMarker.addListener('click', () => {
          departureInfoWindow.close();
          arrivalInfoWindow.open(map, arrivalMarker);
        });

        // Draw flight path if enabled
        if (flightPath) {
          const flightPathLine = new google.maps.Polyline({
            path: [departureCoords, arrivalCoords],
            geodesic: true,
            strokeColor: '#1f2937',
            strokeOpacity: 0.8,
            strokeWeight: 3
          });

          flightPathLine.setMap(map);

          // Add airplane icon along the path
          const airplaneIcon = {
            path: 'M 0,0 -2,-2 0,-5 2,-2 z',
            fillColor: '#1f2937',
            fillOpacity: 1,
            strokeColor: '#1f2937',
            strokeWeight: 1,
            scale: 3,
            rotation: google.maps.geometry.spherical.computeHeading(departureCoords, arrivalCoords)
          };

          const midpoint = google.maps.geometry.spherical.interpolate(
            new google.maps.LatLng(departureCoords.lat, departureCoords.lng),
            new google.maps.LatLng(arrivalCoords.lat, arrivalCoords.lng),
            0.5
          );

          new google.maps.Marker({
            position: midpoint,
            map: map,
            icon: airplaneIcon,
            title: 'Flight Path'
          });
        }

        // Fit map to show both markers
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(departureCoords);
        bounds.extend(arrivalCoords);
        map.fitBounds(bounds);

        // Add some padding to the bounds
        const padding = { top: 50, right: 50, bottom: 50, left: 50 };
        map.fitBounds(bounds, padding);

        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError('Failed to load map. Please check your internet connection.');
        setIsLoading(false);
      }
    };

    if (mapRef.current) {
      initializeMap();
    }
  }, [departure, arrival, flightPath]);

  if (mapError) {
    return (
      <div className="card">
        <div className="card-body text-center py-5">
          <div className="text-danger mb-3">
            <i className="fas fa-exclamation-triangle fa-3x"></i>
          </div>
          <h5 className="text-danger">Map Loading Error</h5>
          <p className="text-muted">{mapError}</p>
          <small className="text-muted">
            Note: This demo requires a valid Google Maps API key to display the interactive map.
          </small>
        </div>
      </div>
    );
  }

  return (
    <div className="card shadow-sm">
      <div className="card-header bg-white border-bottom">
        <h5 className="mb-0 d-flex align-items-center">
          <i className="fas fa-map-marked-alt text-primary me-2"></i>
          Flight Route Map
        </h5>
      </div>
      <div className="card-body p-0 position-relative">
        {isLoading && (
          <div className="position-absolute top-50 start-50 translate-middle z-index-1">
            <div className="d-flex flex-column align-items-center">
              <div className="spinner-border text-primary mb-2" role="status">
                <span className="visually-hidden">Loading map...</span>
              </div>
              <small className="text-muted">Loading flight route...</small>
            </div>
          </div>
        )}
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: '400px',
            opacity: isLoading ? 0.3 : 1,
            transition: 'opacity 0.3s ease'
          }}
        />
        
        {/* Map Legend */}
        <div className="position-absolute bottom-0 start-0 m-3 bg-white rounded shadow-sm p-2" style={{ zIndex: 1000 }}>
          <div className="d-flex align-items-center mb-1">
            <div className="rounded-circle me-2" style={{ width: '12px', height: '12px', backgroundColor: '#fbbf24' }}></div>
            <small className="text-muted">Departure</small>
          </div>
          <div className="d-flex align-items-center">
            <div className="rounded-circle me-2" style={{ width: '12px', height: '12px', backgroundColor: '#10b981' }}></div>
            <small className="text-muted">Arrival</small>
          </div>
        </div>
      </div>
    </div>
  );
};

FlightDetailsMap.propTypes = {
  departure: PropTypes.shape({
    city: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired
  }),
  arrival: PropTypes.shape({
    city: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    time: PropTypes.string.isRequired
  }),
  flightPath: PropTypes.bool
};

export default FlightDetailsMap;