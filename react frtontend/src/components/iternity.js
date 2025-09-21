import React, { useState } from 'react';
import { Plane, Car, Building, Utensils, Camera, X, Edit3, Clock, MapPin, Calendar } from 'lucide-react';

function TravelItinerary() {
  const [selectedDay, setSelectedDay] = useState(1);

  const itineraryData = {
    1: [
      {
        id: 1,
        type: 'Flight',
        time: '9:00 AM',
        endTime: '11:00 AM',
        duration: '2 hrs',
        title: 'Flight from JFK to LAX',
        description: 'American Airlines • AA 1234 • Economy',
        location: 'NYC to Los Angeles',
        icon: Plane,
        image: 'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 2,
        type: 'Hotel',
        time: '12:00 PM',
        endTime: '',
        duration: 'Check-in',
        title: 'Hotel Check-in',
        description: 'The Beverly Hills Hotel • Deluxe Room',
        location: 'Beverly Hills, CA',
        icon: Building,
        image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 3,
        type: 'Transport',
        time: '1:00 PM',
        endTime: '1:30 PM',
        duration: '30 mins',
        title: 'Airport to Hotel Transfer',
        description: 'Uber Black • Toyota Camry',
        location: 'LAX to Beverly Hills',
        icon: Car,
        image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 4,
        type: 'Dining',
        time: '7:00 PM',
        endTime: '9:00 PM',
        duration: '2 hrs',
        title: 'Welcome Dinner',
        description: 'Nobu Beverly Hills • Japanese Cuisine',
        location: 'Beverly Hills, CA',
        icon: Utensils,
        image: 'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      }
    ],
    2: [
      {
        id: 5,
        type: 'Activity',
        time: '9:00 AM',
        endTime: '12:00 PM',
        duration: '3 hrs',
        title: 'Hollywood City Tour',
        description: 'Guided tour • Hollywood Walk of Fame & Griffith Observatory',
        location: 'Hollywood, CA',
        icon: Camera,
        image: 'https://images.pexels.com/photos/1007657/pexels-photo-1007657.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 6,
        type: 'Dining',
        time: '1:00 PM',
        endTime: '2:30 PM',
        duration: '1.5 hrs',
        title: 'Lunch at The Ivy',
        description: 'Table reservation for 2 • American Cuisine',
        location: 'West Hollywood, CA',
        icon: Utensils,
        image: 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 7,
        type: 'Activity',
        time: '3:00 PM',
        endTime: '6:00 PM',
        duration: '3 hrs',
        title: 'Santa Monica Beach',
        description: 'Beach day • Pier visit & shopping',
        location: 'Santa Monica, CA',
        icon: Camera,
        image: 'https://images.pexels.com/photos/533769/pexels-photo-533769.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 8,
        type: 'Dining',
        time: '8:00 PM',
        endTime: '10:00 PM',
        duration: '2 hrs',
        title: 'Seafood Dinner',
        description: 'Ocean view restaurant • Fresh catch',
        location: 'Santa Monica, CA',
        icon: Utensils,
        image: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      }
    ],
    3: [
      {
        id: 9,
        type: 'Activity',
        time: '10:00 AM',
        endTime: '1:00 PM',
        duration: '3 hrs',
        title: 'Universal Studios',
        description: 'Theme park adventure • Studio tours',
        location: 'Universal City, CA',
        icon: Camera,
        image: 'https://images.pexels.com/photos/2647973/pexels-photo-2647973.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 10,
        type: 'Dining',
        time: '2:00 PM',
        endTime: '3:00 PM',
        duration: '1 hr',
        title: 'Theme Park Lunch',
        description: 'Quick service • American favorites',
        location: 'Universal Studios, CA',
        icon: Utensils,
        image: 'https://images.pexels.com/photos/1199957/pexels-photo-1199957.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 11,
        type: 'Activity',
        time: '3:30 PM',
        endTime: '7:00 PM',
        duration: '3.5 hrs',
        title: 'More Park Adventures',
        description: 'Rides & attractions • Wizarding World',
        location: 'Universal Studios, CA',
        icon: Camera,
        image: 'https://images.pexels.com/photos/1382394/pexels-photo-1382394.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 12,
        type: 'Transport',
        time: '8:00 PM',
        endTime: '9:00 PM',
        duration: '1 hr',
        title: 'Return to Hotel',
        description: 'Uber • Evening ride back',
        location: 'Universal to Beverly Hills',
        icon: Car,
        image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      }
    ],
    4: [
      {
        id: 13,
        type: 'Activity',
        time: '8:00 AM',
        endTime: '11:00 AM',
        duration: '3 hrs',
        title: 'Beverly Hills Shopping',
        description: 'Rodeo Drive • Luxury shopping experience',
        location: 'Beverly Hills, CA',
        icon: Camera,
        image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 14,
        type: 'Hotel',
        time: '12:00 PM',
        endTime: '',
        duration: 'Check-out',
        title: 'Hotel Check-out',
        description: 'The Beverly Hills Hotel • Final departure',
        location: 'Beverly Hills, CA',
        icon: Building,
        image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 15,
        type: 'Transport',
        time: '1:00 PM',
        endTime: '2:00 PM',
        duration: '1 hr',
        title: 'Airport Transfer',
        description: 'Hotel to LAX • Final journey',
        location: 'Beverly Hills to LAX',
        icon: Car,
        image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      },
      {
        id: 16,
        type: 'Flight',
        time: '4:00 PM',
        endTime: '11:00 PM',
        duration: '5 hrs',
        title: 'Flight LAX to JFK',
        description: 'American Airlines • AA 4321 • Economy',
        location: 'Los Angeles to NYC',
        icon: Plane,
        image: 'https://images.pexels.com/photos/46148/aircraft-jet-landing-cloud-46148.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop'
      }
    ]
  };

  const dayNames = {
    1: 'Arrival Day',
    2: 'Exploration Day',
    3: 'Adventure Day',
    4: 'Departure Day'
  };

  const dayDates = {
    1: 'March 15, 2024',
    2: 'March 16, 2024',
    3: 'March 17, 2024',
    4: 'March 18, 2024'
  };

  const currentDayItems = itineraryData[selectedDay] || [];

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-primary text-white py-4 px-0" 
           style={{ 
             background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' 
           }}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <h1 className="h2 fw-bold mb-2">Los Angeles Adventure</h1>
              <p className="mb-2" style={{ color: 'rgba(255,255,255,0.9)' }}>
                4-Day Itinerary • March 15-18, 2024
              </p>
              <div className="d-flex align-items-center" style={{ color: 'rgba(255,255,255,0.8)' }}>
                <MapPin size={16} className="me-2" />
                <span>New York to Los Angeles</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid">
        <div className="row">
          {/* Sidebar */}
          <div className="col-lg-3 col-md-4 bg-white shadow-sm p-0">
            <div className="sticky-top" style={{ top: '0' }}>
              <div className="p-4 border-bottom">
                <h5 className="mb-3 d-flex align-items-center">
                  <Calendar className="me-2" size={20} />
                  Select Day
                </h5>
                <div className="d-grid gap-2">
                  {Object.keys(itineraryData).map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(parseInt(day))}
                      className={`btn text-start p-3 border rounded ${
                        selectedDay === parseInt(day)
                          ? 'btn-primary shadow-sm'
                          : 'btn-outline-secondary'
                      }`}
                      style={{ 
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">Day {day}</div>
                          <div className={`small ${
                            selectedDay === parseInt(day) ? 'text-white-50' : 'text-muted'
                          }`}>
                            {dayNames[day]}
                          </div>
                          <div className={`small ${
                            selectedDay === parseInt(day) ? 'text-white-50' : 'text-muted'
                          }`}>
                            {dayDates[day]}
                          </div>
                        </div>
                        <div className={`badge rounded-pill ${
                          selectedDay === parseInt(day) 
                            ? 'bg-white text-primary' 
                            : 'bg-secondary'
                        }`}>
                          {itineraryData[day].length}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Day Summary */}
              <div className="p-4">
                <h6 className="text-muted mb-3">Day {selectedDay} Summary</h6>
                <div className="small">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Total Activities:</span>
                    <span className="fw-semibold">{currentDayItems.length}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Start Time:</span>
                    <span className="fw-semibold">
                      {currentDayItems.length > 0 ? currentDayItems[0].time : '-'}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>End Time:</span>
                    <span className="fw-semibold">
                      {currentDayItems.length > 0 ? 
                        (currentDayItems[currentDayItems.length - 1].endTime || 
                         currentDayItems[currentDayItems.length - 1].time) : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-lg-9 col-md-8 p-4">
            <div className="mb-4">
              <h3 className="fw-bold mb-1">Day {selectedDay}: {dayNames[selectedDay]}</h3>
              <p className="text-muted mb-0">{dayDates[selectedDay]}</p>
            </div>

            {/* Timeline Container */}
            <div className="position-relative">
              {/* Timeline Line */}
              <div 
                className="position-absolute bg-primary opacity-25"
                style={{ 
                  left: '30px', 
                  top: '20px', 
                  width: '3px', 
                  height: 'calc(100% - 40px)',
                  zIndex: 1
                }}
              ></div>

              {/* Timeline Items */}
              <div>
                {currentDayItems.map((item, index) => {
                  const IconComponent = item.icon;
                  
                  return (
                    <div key={item.id} className="position-relative d-flex mb-4">
                      {/* Timeline Dot */}
                      <div className="flex-shrink-0 position-relative me-4" style={{ zIndex: 2 }}>
                        <div 
                          className="bg-primary rounded-circle d-flex align-items-center justify-content-center border border-3 border-white shadow"
                          style={{ width: '60px', height: '60px' }}
                        >
                          <IconComponent size={24} className="text-white" />
                        </div>
                        {/* Time Label */}
                        <div className="position-absolute text-center" style={{ 
                          top: '70px', 
                          left: '50%', 
                          transform: 'translateX(-50%)',
                          whiteSpace: 'nowrap'
                        }}>
                          <div className="small fw-semibold text-primary">{item.time}</div>
                          {item.endTime && (
                            <div className="small text-muted">to {item.endTime}</div>
                          )}
                        </div>
                      </div>

                      {/* Card */}
                      <div className="flex-fill">
                        <div className="card border-0 shadow-sm h-100" 
                             style={{ 
                               transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                               cursor: 'default'
                             }}
                             onMouseEnter={(e) => {
                               e.currentTarget.style.transform = 'translateY(-2px)';
                               e.currentTarget.classList.add('shadow');
                             }}
                             onMouseLeave={(e) => {
                               e.currentTarget.style.transform = 'translateY(0)';
                               e.currentTarget.classList.remove('shadow');
                             }}>
                          <div className="row g-0">
                            {/* Image */}
                            <div className="col-md-4">
                              <img 
                                src={item.image} 
                                alt={item.title}
                                className="img-fluid h-100 object-fit-cover"
                                style={{ 
                                  minHeight: '200px',
                                  borderTopLeftRadius: 'calc(0.375rem - 1px)',
                                  borderBottomLeftRadius: 'calc(0.375rem - 1px)'
                                }}
                              />
                            </div>

                            {/* Content */}
                            <div className="col-md-8">
                              <div className="card-body h-100 d-flex flex-column">
                                <div className="flex-fill">
                                  {/* Item Type Badge */}
                                  <div className="d-inline-flex align-items-center px-3 py-1 rounded-pill small fw-medium bg-primary bg-opacity-10 text-primary mb-3">
                                    <IconComponent size={14} className="me-1" />
                                    {item.type}
                                  </div>

                                  {/* Title & Duration */}
                                  <h5 className="card-title fw-bold mb-2">{item.title}</h5>
                                  <div className="d-flex align-items-center text-muted small mb-3">
                                    <Clock size={16} className="me-2" />
                                    Duration: {item.duration}
                                  </div>

                                  {/* Description */}
                                  <p className="card-text text-muted mb-3">{item.description}</p>
                                  
                                  {/* Location */}
                                  <div className="d-flex align-items-center text-muted small mb-3">
                                    <MapPin size={16} className="me-2" />
                                    {item.location}
                                  </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex gap-2">
                                  <button className="btn btn-light btn-sm d-flex align-items-center">
                                    <Edit3 size={14} className="me-1" />
                                    Edit
                                  </button>
                                  <button className="btn btn-outline-danger btn-sm d-flex align-items-center">
                                    <X size={14} className="me-1" />
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .object-fit-cover {
          object-fit: cover;
        }
      `}</style>
    </div>
  );
}

export default TravelItinerary;