import React, { useState } from 'react';
import { MapPin, Clock, Calendar, Users, Star, Camera, Utensils, Plane } from 'lucide-react';

const TravelItinerary = () => {
  const [selectedDay, setSelectedDay] = useState(1);

  const itineraryData = {
    destination: "Tokyo, Japan",
    duration: "7 Days",
    travelers: 2,
    budget: "$2,500",
    season: "Spring (Cherry Blossom Season)",
    coverImage: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
    days: [
      {
        day: 1,
        title: "Arrival & Shibuya Exploration",
        date: "March 15, 2024",
        activities: [
          {
            time: "10:00 AM",
            title: "Arrival at Narita Airport",
            description: "Land and take the Skyliner to downtown Tokyo",
            location: "Narita International Airport",
            icon: <Plane className="text-primary" size={20} />,
            duration: "2 hours"
          },
          {
            time: "2:00 PM",
            title: "Check-in at Hotel",
            description: "Rest and refresh at the Park Hyatt Tokyo",
            location: "Shinjuku District",
            icon: <MapPin className="text-success" size={20} />,
            duration: "1 hour"
          },
          {
            time: "4:00 PM",
            title: "Shibuya Crossing Experience",
            description: "Experience the world's busiest pedestrian crossing",
            location: "Shibuya",
            icon: <Camera className="text-warning" size={20} />,
            duration: "2 hours"
          },
          {
            time: "7:00 PM",
            title: "Traditional Kaiseki Dinner",
            description: "Multi-course traditional Japanese dinner",
            location: "Kikunoi Restaurant",
            icon: <Utensils className="text-danger" size={20} />,
            duration: "2 hours"
          }
        ]
      },
      {
        day: 2,
        title: "Cultural Immersion Day",
        date: "March 16, 2024",
        activities: [
          {
            time: "8:00 AM",
            title: "Senso-ji Temple Visit",
            description: "Explore Tokyo's oldest temple and traditional markets",
            location: "Asakusa",
            icon: <Star className="text-primary" size={20} />,
            duration: "3 hours"
          },
          {
            time: "12:00 PM",
            title: "Traditional Lunch",
            description: "Authentic tempura at a local restaurant",
            location: "Asakusa District",
            icon: <Utensils className="text-danger" size={20} />,
            duration: "1 hour"
          },
          {
            time: "2:00 PM",
            title: "Imperial Palace Gardens",
            description: "Peaceful walk through the Emperor's gardens",
            location: "Chiyoda",
            icon: <Camera className="text-success" size={20} />,
            duration: "2 hours"
          },
          {
            time: "5:00 PM",
            title: "Tea Ceremony Experience",
            description: "Learn the art of Japanese tea ceremony",
            location: "Traditional Tea House",
            icon: <Star className="text-warning" size={20} />,
            duration: "1.5 hours"
          }
        ]
      },
      {
        day: 3,
        title: "Modern Tokyo & Shopping",
        date: "March 17, 2024",
        activities: [
          {
            time: "9:00 AM",
            title: "Tsukiji Outer Market",
            description: "Fresh sushi breakfast and market exploration",
            location: "Tsukiji",
            icon: <Utensils className="text-danger" size={20} />,
            duration: "2 hours"
          },
          {
            time: "11:30 AM",
            title: "Tokyo Skytree",
            description: "Panoramic views from Japan's tallest tower",
            location: "Sumida",
            icon: <Camera className="text-primary" size={20} />,
            duration: "2 hours"
          },
          {
            time: "2:00 PM",
            title: "Harajuku & Takeshita Street",
            description: "Explore youth culture and unique fashion",
            location: "Harajuku",
            icon: <MapPin className="text-warning" size={20} />,
            duration: "3 hours"
          },
          {
            time: "6:00 PM",
            title: "Roppongi Nightlife",
            description: "Experience Tokyo's vibrant nightlife",
            location: "Roppongi",
            icon: <Star className="text-success" size={20} />,
            duration: "3 hours"
          }
        ]
      }
    ]
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fa' }}>
      {/* Hero Section */}
      <div className="position-relative" style={{ height: '400px', overflow: 'hidden' }}>
        <img 
          src={itineraryData.coverImage} 
          alt="Tokyo" 
          className="w-100 h-100 object-fit-cover"
        />
        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" 
             style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div className="text-center text-white">
            <h1 className="display-3 fw-bold mb-3">
              {itineraryData.destination}
            </h1>
            <p className="lead mb-4">{itineraryData.season}</p>
            <div className="d-flex justify-content-center gap-4 flex-wrap">
              <div className="d-flex align-items-center gap-2">
                <Calendar size={20} />
                <span>{itineraryData.duration}</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <Users size={20} />
                <span>{itineraryData.travelers} Travelers</span>
              </div>
              <div className="d-flex align-items-center gap-2">
                <span className="fw-bold">Budget: {itineraryData.budget}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container my-5">
        {/* Day Navigation */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="mb-3 text-center">Select Day</h4>
                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  {itineraryData.days.map((dayData) => (
                    <button
                      key={dayData.day}
                      onClick={() => setSelectedDay(dayData.day)}
                      className={`btn px-4 py-2 rounded-pill transition-all ${
                        selectedDay === dayData.day
                          ? 'btn-primary shadow-lg'
                          : 'btn-outline-primary'
                      }`}
                      style={{ 
                        transform: selectedDay === dayData.day ? 'translateY(-2px)' : 'none',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      Day {dayData.day}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Content */}
        {itineraryData.days
          .filter(day => day.day === selectedDay)
          .map((currentDay) => (
            <div key={currentDay.day} className="row">
              <div className="col-12">
                <div className="card shadow-sm border-0 mb-4">
                  <div className="card-header bg-primary text-white p-4">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h2 className="mb-1">Day {currentDay.day}: {currentDay.title}</h2>
                        <p className="mb-0 opacity-75">
                          <Calendar size={16} className="me-2" />
                          {currentDay.date}
                        </p>
                      </div>
                      <div className="badge bg-light text-dark fs-6 px-3 py-2">
                        {currentDay.activities.length} Activities
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
                      left: '30px', 
                      top: '0', 
                      width: '3px', 
                      height: '100%',
                      zIndex: 1
                    }}
                  ></div>

                  {currentDay.activities.map((activity, index) => (
                    <div key={index} className="row mb-4 position-relative">
                      {/* Timeline Dot */}
                      <div 
                        className="position-absolute bg-primary rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                        style={{
                          left: '18px',
                          top: '20px',
                          width: '24px',
                          height: '24px',
                          zIndex: 2,
                          fontSize: '12px'
                        }}
                      >
                        {index + 1}
                      </div>

                      <div className="col-12">
                        <div className="ms-5">
                          <div className="card shadow-sm border-0 h-100">
                            <div className="card-body p-4">
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div className="d-flex align-items-center gap-2">
                                  {activity.icon}
                                  <h5 className="mb-0">{activity.title}</h5>
                                </div>
                                <div className="text-end">
                                  <div className="badge bg-secondary mb-1">
                                    <Clock size={14} className="me-1" />
                                    {activity.time}
                                  </div>
                                  <div className="small text-muted">
                                    Duration: {activity.duration}
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-muted mb-2">{activity.description}</p>
                              
                              <div className="d-flex align-items-center text-muted small">
                                <MapPin size={14} className="me-1" />
                                {activity.location}
                              </div>
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
        <div className="row mt-5">
          <div className="col-12">
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                <h4 className="text-center mb-4">Trip Overview</h4>
                <div className="row text-center">
                  <div className="col-md-3 col-6 mb-3">
                    <div className="p-3">
                      <Calendar className="text-primary mb-2" size={32} />
                      <h6 className="mb-1">Duration</h6>
                      <p className="text-muted mb-0">{itineraryData.duration}</p>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="p-3">
                      <Users className="text-success mb-2" size={32} />
                      <h6 className="mb-1">Travelers</h6>
                      <p className="text-muted mb-0">{itineraryData.travelers} People</p>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="p-3">
                      <MapPin className="text-warning mb-2" size={32} />
                      <h6 className="mb-1">Activities</h6>
                      <p className="text-muted mb-0">
                        {itineraryData.days.reduce((total, day) => total + day.activities.length, 0)} Total
                      </p>
                    </div>
                  </div>
                  <div className="col-md-3 col-6 mb-3">
                    <div className="p-3">
                      <Star className="text-danger mb-2" size={32} />
                      <h6 className="mb-1">Budget</h6>
                      <p className="text-muted mb-0">{itineraryData.budget}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelItinerary;