import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Calendar, Users, Star, Camera, Utensils, Plane, Hotel, Car } from 'lucide-react';

const TravelItinerary = ({ itineraries }) => {
  const [selectedDay, setSelectedDay] = useState(1);
  const [selectedItinerary, setSelectedItinerary] = useState(null);

  useEffect(() => {
    if (itineraries && Object.keys(itineraries).length > 0) {
      // Select the first itinerary by default if none is selected
      if (!selectedItinerary) {
        const firstItineraryId = Object.keys(itineraries)[0];
        setSelectedItinerary(itineraries[firstItineraryId].state);
      }
    }
  }, [itineraries, selectedItinerary]);
  

  const handleItinerarySelect = (itineraryId) => {
    setSelectedItinerary(itineraries[itineraryId].state);
    setSelectedDay(1); // Reset to day 1 when a new itinerary is selected
  };

  const getActivityIcon = (activityType) => {
    switch (activityType) {
      case 'flight':
        return <Plane className="text-primary" size={20} />;
      case 'hotel':
        return <Hotel className="text-success" size={20} />;
      case 'cab':
        return <Car className="text-info" size={20} />;
      case 'activity':
        return <Camera className="text-warning" size={20} />;
      default:
        return <Star className="text-secondary" size={20} />;
    }
  };

  if (!itineraries || Object.keys(itineraries).length === 0) {
    return (
      <div className="p-3 text-center">
        <h5>No Itineraries Available</h5>
        <p>Start planning your next trip!</p>
      </div>
    );
  }

  if (!selectedItinerary) {
    return (
      <div className="p-3">
        <h5>Select an Itinerary</h5>
        <div className="list-group">
          {Object.entries(itineraries).map(([itineraryId, itineraryData]) => (
            <button
              key={itineraryId}
              className="list-group-item list-group-item-action"
              onClick={() => handleItinerarySelect(itineraryId)}
            >
              {itineraryData.state.itinerary.trip_name} - {itineraryData.state.itinerary.start_date}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const itineraryData = selectedItinerary.itinerary;
  const preferences = selectedItinerary.preferences;
  const personsDetails = selectedItinerary.persons_details;

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--bs-body-bg)' }}>
      {/* Itinerary Selector */}
      <div className="p-3 border-bottom">
        <h5 className="mb-3">Your Itineraries</h5>
        <select 
          className="form-select mb-3"
          onChange={(e) => handleItinerarySelect(e.target.value)}
          value={Object.keys(itineraries).find(id => itineraries[id].state === selectedItinerary) || ''}
        >
          {Object.entries(itineraries).map(([itineraryId, itinerary]) => (
            <option key={itineraryId} value={itineraryId}>
              {itinerary.state.itinerary.trip_name} ({itinerary.state.itinerary.start_date})
            </option>
          ))}
        </select>
      </div>

      {/* Hero Section */}
      <div className="position-relative" style={{ height: '200px', overflow: 'hidden' }}>
        <img 
          src={itineraryData.coverImage || "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"} 
          alt={itineraryData.trip_name} 
          className="w-100 h-100 object-fit-cover"
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="text-center text-white">
            <h1 className="display-6 fw-bold mb-1">
              {itineraryData.trip_name}
            </h1>
            <p className="lead mb-2">{itineraryData.destination}</p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <div className="d-flex align-items-center gap-1">
                <Calendar size={16} />
                <span>{itineraryData.start_date} - {itineraryData.end_date}</span>
              </div>
              {personsDetails && personsDetails.length > 0 && (
                <div className="d-flex align-items-center gap-1">
                  <Users size={16} />
                  <span>{personsDetails.length} Traveler(s)</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container my-4">
        {/* Day Navigation */}
        <div className="row mb-3">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-3">
                <h6 className="mb-2 text-center">Select Day</h6>
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  {itineraryData.days.map((dayData) => (
                    <button
                      key={dayData.day_number}
                      onClick={() => setSelectedDay(dayData.day_number)}
                      className={`btn btn-sm px-3 py-1 rounded-pill transition-all ${
                        selectedDay === dayData.day_number
                          ? 'btn-primary shadow-lg'
                          : 'btn-outline-primary'
                      }`}
                      style={{ 
                        transform: selectedDay === dayData.day_number ? 'translateY(-1px)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Day {dayData.day_number}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Content */}
        {itineraryData.days
          .filter(day => day.day_number === selectedDay)
          .map((currentDay) => (
            <div key={currentDay.day_number} className="row">
              <div className="col-12">
                <div className="card shadow-sm border-0 mb-3">
                  <div className="card-header bg-primary text-white p-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h5 className="mb-1">Day {currentDay.day_number}</h5>
                        <p className="mb-0 opacity-75">
                          <Calendar size={14} className="me-1" />
                          {currentDay.date}
                        </p>
                      </div>
                      <div className="badge bg-light text-dark fs-7 px-2 py-1">
                        {currentDay.schedule.length} Activities
                      </div>
                    </div>
                  </div>
                </div>

                {/* Activities Timeline */}
                <div className="position-relative">
                  {/* Timeline Line */}
                  <div 
                    className="position-absolute bg-primary rounded"
                    style={{ 
                      left: '20px', 
                      top: '0', 
                      width: '2px', 
                      height: '100%',
                      zIndex: 1
                    }}
                  ></div>

                  {currentDay.schedule.map((activity, index) => (
                    <div key={index} className="row mb-3 position-relative">
                      {/* Timeline Dot */}
                      <div 
                        className="position-absolute bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                          left: '12px',
                          top: '15px',
                          width: '20px',
                          height: '20px',
                          zIndex: 2,
                          fontSize: '10px'
                        }}
                      >
                        {index + 1}
                      </div>

                      <div className="col-12">
                        <div className="ms-4">
                          <div className="card shadow-sm border-0 h-100">
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div className="d-flex align-items-center gap-2">
                                  {getActivityIcon(activity.activity_type)}
                                  <h6 className="mb-0">{activity.description}</h6>
                                </div>
                                <div className="text-end">
                                  <div className="badge bg-secondary mb-1">
                                    <Clock size={12} className="me-1" />
                                    {activity.start_time || activity.departure_time || activity.pickup_time || activity.check_in_time}
                                  </div>
                                  {activity.end_time && <div className="small text-muted">
                                    End: {activity.end_time}
                                  </div>}
                                </div>
                              </div>
                              
                              {(activity.flight_number || activity.name || activity.booking_id) && <p className="text-muted mb-1 fs-7">
                                {activity.flight_number && `Flight: ${activity.flight_number}`}
                                {activity.name && `Hotel: ${activity.name}`}
                                {activity.booking_id && `Booking ID: ${activity.booking_id}`}
                              </p>}
                              
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

        {/* Quick Stats */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-3">
                <h5 className="text-center mb-3">Trip Overview</h5>
                <div className="row text-center">
                  <div className="col-md-3 col-6 mb-2">
                    <div className="p-2">
                      <Calendar className="text-primary mb-1" size={24} />
                      <h6 className="mb-0">Duration</h6>
                      <p className="text-muted mb-0 fs-7">{itineraryData.days.length} Days</p>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-2">
                    <div className="p-2">
                      <Users className="text-success mb-1" size={24} />
                      <h6 className="mb-0">Travelers</h6>
                      <p className="text-muted mb-0 fs-7">{personsDetails ? personsDetails.length : 0} Traveler(s)</p>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-2">
                    <div className="p-2">
                      <MapPin className="text-warning mb-1" size={24} />
                      <h6 className="mb-0">Activities</h6>
                      <p className="text-muted mb-0 fs-7">
                        {itineraryData.days.reduce((total, day) => total + day.schedule.length, 0)} Total
                      </p>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-2">
                    <div className="p-2">
                      <Plane className="text-danger mb-1" size={24} />
                      <h6 className="mb-0">Destination</h6>
                      <p className="text-muted mb-0 fs-7">{itineraryData.destination}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preferences Section */}
        {preferences && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="card shadow-sm border-0">
                <div className="card-body p-3">
                  <h5 className="text-center mb-3">Trip Preferences</h5>
                  <div className="row">
                    {preferences.travel_theme && preferences.travel_theme.length > 0 && (
                      <div className="col-md-6 mb-2">
                        <h6>Travel Theme:</h6>
                        <p className="text-muted fs-7">{preferences.travel_theme.join(', ')}</p>
                      </div>
                    )}
                    {preferences.cuisine_preferences && preferences.cuisine_preferences.length > 0 && (
                      <div className="col-md-6 mb-2">
                        <h6>Cuisine Preferences:</h6>
                        <p className="text-muted fs-7">{preferences.cuisine_preferences.join(', ')}</p>
                      </div>
                    )}
                    {preferences.dietary_restrictions && preferences.dietary_restrictions.length > 0 && (
                      <div className="col-md-6 mb-2">
                        <h6>Dietary Restrictions:</h6>
                        <p className="text-muted fs-7">{preferences.dietary_restrictions.join(', ')}</p>
                      </div>
                    )}
                    {preferences.interests && preferences.interests.length > 0 && (
                      <div className="col-md-6 mb-2">
                        <h6>Interests:</h6>
                        <p className="text-muted fs-7">{preferences.interests.join(', ')}</p>
                      </div>
                    )}
                    {preferences.hotel_type && (
                      <div className="col-md-6 mb-2">
                        <h6>Hotel Type:</h6>
                        <p className="text-muted fs-7">{preferences.hotel_type}</p>
                      </div>
                    )}
                    {preferences.flight_seat_type && (
                      <div className="col-md-6 mb-2">
                        <h6>Flight Seat Type:</h6>
                        <p className="text-muted fs-7">{preferences.flight_seat_type}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelItinerary;