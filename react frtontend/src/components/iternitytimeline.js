import React, { useState, useEffect } from 'react';
import { Plane, Building, Coffee, MapPin, Car, Clock, Calendar } from 'lucide-react';
import travelImage from '../travel.webp';
import { getDatabase, ref, get } from 'firebase/database';
import { initializeApp } from 'firebase/app';
import { db, auth as firebaseAuth } from "../firebase";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const componentStyles = `
:root {
    --primary-color: #2093EF;
    --primary-color-light: #e9f5ff;
}
.itinerary-container {
    margin: 0;
    padding: 0;
}
.itinerary-header {
    position: relative;
    height: 200px;
    color: white;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 1.5rem;
    overflow: hidden;
    margin: 0;
}
.itinerary-header::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url(${travelImage});
    background-size: cover;
    background-position: center;
    z-index: 0;
}
.itinerary-header .header-overlay {
    position: relative;
    z-index: 2;
}
.itinerary-header::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.1));
    z-index: 1;
}
.itinerary-header h2 {
    font-weight: 700;
    margin-bottom: 0.25rem;
}
.itinerary-details-bar {
    display: flex;
    gap: 1.5rem;
    font-size: 0.9rem;
    opacity: 0.9;
}
.day-selector {
    padding: 1.5rem;
    background-color: #fff;
    border-bottom: 1px solid #dee2e6;
    margin: 0;
}
.day-selector .nav-pills .nav-link {
    border-radius: 50px;
    font-weight: 500;
    color: #6c757d;
    padding: 0.5rem 1rem;
    white-space: nowrap;
    border: 1px solid transparent;
}
.day-selector .nav-pills .nav-link.active {
    background-color: var(--primary-color);
    color: white;
    box-shadow: 0 4px 12px rgba(32, 147, 239, 0.3);
}
.day-scroll-wrapper {
    overflow-x: auto;
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.day-scroll-wrapper::-webkit-scrollbar {
    display: none;
}
.day-scroll-wrapper .nav-pills {
    flex-wrap: nowrap;
    display: inline-flex;
}
.timeline-container {
    padding: 1.5rem;
    margin: 0;
}
.timeline-day-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding: 1rem;
    background-color: var(--primary-color-light);
    border-radius: 0.75rem;
    border-left: 5px solid var(--primary-color);
}
.timeline-day-header h4 {
    margin-bottom: 0;
    font-weight: 600;
    color: var(--primary-color);
}
.timeline-day-header .badge {
    font-size: 0.8rem;
    padding: 0.5em 0.9em;
    background-color: var(--primary-color);
    border-radius: 50px;
}
.timeline {
    position: relative;
    padding-left: 4rem;
}
.timeline::before {
    content: '';
    position: absolute;
    left: 36px;
    top: 0;
    bottom: 0;
    width: 3px;
    background-color: #e9ecef;
    border-radius: 2px;
}
.timeline-item {
    position: relative;
    margin-bottom: 2rem;
}
.timeline-item:last-child {
    margin-bottom: 0;
}
.timeline-icon {
    position: absolute;
    left: -45px;
    top:  16px;
    width: 36px;
    height: 36px;
    background-color: white;
    border: 3px solid var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--primary-color);
    z-index: 1;
}
.timeline-content {
    background-color: #ffffff;
    border-radius: 0.75rem;
    border: 1px solid #dee2e6;
    padding: 1rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: all 0.3s ease;
    margin-left: 1rem;
}
.timeline-content.clickable-card {
    cursor: pointer;
}
.timeline-content.clickable-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}
.card-img-top {
    width: 100%;
    height: 150px;
    margin: -1rem -1rem 1rem -1rem;
    border-top-left-radius: 0.75rem;
    border-top-right-radius: 0.75rem;
    object-fit: cover;
}
.timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}
.timeline-header h5 {
    margin-bottom: 0;
    font-weight: 600;
    font-size: 1rem;
    color: #343a40;
}
.timeline-time {
    font-size: 0.8rem;
    font-weight: 600;
    background-color: #e9ecef;
    color: #495057;
    padding: 0.25rem 0.6rem;
    border-radius: 50px;
}
.timeline-body {
    font-size: 0.9rem;
    color: #6c757d;
}
.timeline-body p {
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
}
.timeline-body svg {
    margin-right: 0.5rem;
    width: 16px;
    height: 16px;
}
`;

const getIconComponent = (type) => {
    switch(type) {
        case 'flight': return <Plane size={18} />;
        case 'hotel': return <Building size={18} />;
        case 'cab': return <Car size={18} />;
        case 'activity': return <MapPin size={18} />;
        default: return <Clock size={18} />;
    }
};

const getDetailIcon = (iconType) => {
    const iconMap = {
        'plane': <Plane size={16} />,
        'map-pin': <MapPin size={16} />,
        'building': <Building size={16} />,
        'car': <Car size={16} />,
        'clock': <Clock size={16} />,
        'calendar': <Calendar size={16} />
    };
    return iconMap[iconType] || <Clock size={16} />;
};

const getActivityImage = (activityType, description, activity_object, activityImages) => {
    if (activityImages[activity_object]) {
        return activityImages[activity_object];
    }

    // Fallback to existing logic
    switch(activityType) {
        case 'flight': return 'https://placehold.co/600x400/2c3e50/ffffff?text=Flight';
        case 'hotel': return 'https://placehold.co/600x400/34495e/ffffff?text=Hotel';
        case 'cab': return 'https://placehold.co/600x400/e67e22/ffffff?text=Transport';
        case 'activity':
            if (description?.toLowerCase().includes('cruise')) return 'https://placehold.co/600x400/3498db/ffffff?text=Cruise';
            if (description?.toLowerCase().includes('diving')) return 'https://placehold.co/600x400/16a085/ffffff?text=Diving';
            return 'https://placehold.co/600x400/9b59b6/ffffff?text=Activity';
        default: return 'https://placehold.co/600x400/95a5a6/ffffff?text=Trip';
    }
};

const formatTime = (time) => time || '';

const getActivityDetails = (activity) => {
    const details = [];
    switch(activity.activity_type) {
        case 'flight':
            if (activity.flight_number) details.push({ icon: 'plane', text: `Flight: ${activity.flight_number}` });
            if (activity.start_time) details.push({ icon: 'clock', text: `Departure: ${formatTime(activity.start_time)}` });
            if (activity.end_time) details.push({ icon: 'clock', text: `Arrival: ${formatTime(activity.end_time)}` });
            break;
        case 'hotel':
            if (activity.description) details.push({ icon: 'building', text: activity.description });
            if (activity.start_time) details.push({ icon: 'clock', text: `Check-in: ${formatTime(activity.start_time)}` });
            break;
        case 'cab':
            if (activity.cab_number) details.push({ icon: 'car', text: `Cab No: ${activity.cab_number}` });
            if (activity.start_time) details.push({ icon: 'clock', text: `Pickup: ${formatTime(activity.start_time)}` });
            break;
        case 'activity':
            if (activity.start_time) details.push({ icon: 'clock', text: `Start: ${formatTime(activity.start_time)}` });
            if (activity.end_time) details.push({ icon: 'clock', text: `End: ${formatTime(activity.end_time)}` });
            break;
    }
    if (activity.description) details.push({ icon: 'map-pin', text: activity.description });
    return details;
};

const getActivityTime = (activity) => {
    switch(activity.activity_type) {
        case 'flight': return activity.start_time ? formatTime(activity.start_time) : '';
        case 'hotel': return activity.start_time ? formatTime(activity.start_time) : '';
        case 'cab': return activity.start_time ? formatTime(activity.start_time) : '';
        case 'activity': return activity.start_time ? formatTime(activity.start_time) : '';
        default: return '';
    }
};

const getActivityTitle = (activity) => {
    if (activity.description) return activity.description;
    switch(activity.activity_type) {
        case 'flight': return `Flight ${activity.flight_number || ''}`;
        case 'hotel': return 'Hotel Check-in';
        case 'cab': return 'Transportation';
        case 'activity': return 'Activity';
        default: return 'Event';
    }
};

const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

// Helper function to extract data from Firestore's nested structure
const extractFirestoreData = (firestoreData) => {
    if (!firestoreData || !firestoreData.fields) return null;
    
    const fields = firestoreData.fields;
    const extracted = {};
    
    Object.keys(fields).forEach(key => {
        const field = fields[key];
        
        if (field.stringValue !== undefined) {
            extracted[key] = field.stringValue;
        } else if (field.integerValue !== undefined) {
            extracted[key] = parseInt(field.integerValue);
        } else if (field.doubleValue !== undefined) {
            extracted[key] = parseFloat(field.doubleValue);
        } else if (field.booleanValue !== undefined) {
            extracted[key] = field.booleanValue;
        } else if (field.arrayValue && field.arrayValue.values) {
            extracted[key] = field.arrayValue.values.map(item => {
                if (item.stringValue !== undefined) return item.stringValue;
                if (item.integerValue !== undefined) return parseInt(item.integerValue);
                if (item.doubleValue !== undefined) return parseFloat(item.doubleValue);
                return item;
            });
        } else if (field.mapValue) {
            extracted[key] = extractFirestoreData(field.mapValue);
        }
    });
    
    return extracted;
};

export default function ItineraryContent({ activityObject, userid }) {
    console.log(activityObject, "activity object");

    const rddb = getFirestore();  // Firestore
    const db = getDatabase();
    const auth = getAuth();
    const user = auth.currentUser;
    
    const [tripData, setTripData] = useState(null);
    const [activeDay, setActiveDay] = useState(1);
    const [activityImages, setActivityImages] = useState({});
    
    useEffect(() => {
        const fetchData = async () => {
            console.log("activityObject:", activityObject);
            console.log("user:", user);
    
            try {
                const itineraryRef = ref(
                    db,
                    `users/user_id/${userid.uid}/itineraries/${activityObject}`
                );
                const snapshot = await get(itineraryRef);
                if (snapshot.exists()) {
                    setTripData(snapshot.val().state || snapshot.val());
                    console.log("Itinerary data fetched:", snapshot.val());
                } else {
                    console.log("No data available at this path");
                }
            } catch (error) {
                console.error("Error fetching itinerary:", error);
            }
        };
    
        if (userid?.uid && activityObject) {
            fetchData();
        }
    }, [user, userid, activityObject]);
    
    useEffect(() => {
        const styleTag = document.createElement('style');
        styleTag.id = 'itinerary-component-styles';
        styleTag.innerHTML = componentStyles;
        document.head.appendChild(styleTag);
        return () => {
            const styleElement = document.getElementById('itinerary-component-styles');
            if (styleElement) document.head.removeChild(styleElement);
        };
    }, []);
    
    const days = tripData?.itinerary?.days || [];
    const currentDay = days.find(d => d.day_number === activeDay);
    
    useEffect(() => {
        const fetchActivityImages = async () => {
            if (!currentDay) return;

            const imagePromises = currentDay.schedule.map(async (activity) => {
                if (activity.activity_object) {
                    try {
                        // Construct path correctly
                        const activityRef = doc(rddb, `dummyData/${activity.activity_type}s/list/${activity.activity_object}`);
                        const snapshot = await getDoc(activityRef);
                        console.log(`Fetching image for ${activity.activity_object}:`, snapshot.data());

                        if (snapshot.exists()) {
                            const rawData = snapshot.data();
                            console.log("Raw Firestore data:", rawData);
                            
                            // Handle the nested Firestore structure
                            let extractedData = null;
                            if (rawData.value && rawData.value.mapValue) {
                                extractedData = extractFirestoreData(rawData.value.mapValue);
                            } else {
                                // Fallback for direct document structure
                                extractedData = rawData;
                            }
                            
                            console.log("Extracted data:", extractedData);
                            
                            // Try different possible image field names
                            const thumbnail = extractedData?.thumbnail || 
                                            extractedData?.img || 
                                            extractedData?.image || 
                                            extractedData?.airline_logo ||
                                            extractedData?.photo ||
                                            extractedData?.picture;
                                            
                            console.log("Found thumbnail:", thumbnail);
                            
                            if (thumbnail) {
                                return { [activity.activity_object]: thumbnail };
                            }
                        }
                    } catch (error) {
                        console.error(`Error fetching activity image for ${activity.activity_object}:`, error);
                    }
                }
                return null;
            });

            const images = await Promise.all(imagePromises);
            const imageMap = images.reduce((acc, curr) => {
                if (curr) return { ...acc, ...curr };
                return acc;
            }, {});

            setActivityImages(imageMap);
            console.log("Final activity images:", imageMap);
        };

        fetchActivityImages();
    }, [currentDay, rddb]);
    
    if (!tripData) {
        return <div>Loading...</div>;
    }
    
    const userDetails = tripData.user_details ? [tripData?.user_details] : [];
    const personsDetails = tripData.persons_details || [];
    const preferences = tripData.preferences || {};
    const tripName = tripData.itinerary?.trip_name || 'My Trip';
    const start_date = tripData.itinerary?.start_date;
    const end_date = tripData.itinerary?.end_date;
    
    const dateRange = start_date && end_date ? formatDateRange(start_date, end_date) : 'Travel Dates';
    const tripType = preferences.travel_theme?.length > 0 ? preferences.travel_theme.join(', ').replace(/^\w/, c => c.toUpperCase()) : 'Adventure';
    
    const handleCardClick = (activity) => {
        // if (typeof onShowDetails === 'function' && activity.activity_type === 'flight') {
        //     onShowDetails(activity);
        // }
    };
    
    return (
        <div className="itinerary-container">
            <header className="itinerary-header">
                <div className="header-overlay">
                    <h2 className='text-white'>{tripName}</h2>
                    <div className="itinerary-details-bar">
                        <span>📅 {dateRange}</span>
                        <span>🎯 {tripType}</span>
                        <span>👥 {userDetails.length + personsDetails.length} Travelers</span>
                    </div>
                </div>
            </header>

            <div className="day-selector">
                <h6 style={{ marginBottom: '1rem', fontWeight: 'bold' }}>Select Day</h6>
                <div className="day-scroll-wrapper">
                    <ul className="nav nav-pills" style={{ margin: 0, padding: 0 }}>
                        {days.map((day) => (
                            <li className="nav-item" key={day.day_number}>
                                <a 
                                    className={`nav-link ${activeDay === day.day_number ? 'active' : ''}`} 
                                    href="#" 
                                    onClick={(e) => { e.preventDefault(); setActiveDay(day.day_number); }}
                                    style={{ textDecoration: 'none' }}
                                >
                                    Day {day.day_number}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {currentDay ? (
                <div className="timeline-container">
                    <div className="timeline-day-header">
                        <h4>
                            <span style={{ fontWeight: 300 }}>Day {currentDay.day_number}: &nbsp;</span> 
                            {new Date(currentDay.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                        </h4>
                        <span className="badge">{currentDay.schedule?.length || 0} Activities</span>
                    </div>
                    <div className="timeline">
                        {currentDay.schedule?.map((activity, index) => (
                            <div className="timeline-item" key={`${currentDay.day_number}-${index}`}>
                                <div className="timeline-icon">
                                    {getIconComponent(activity.activity_type)}
                                </div>
                                <div 
                                    className={`timeline-content ${activity.activity_type === 'flight' ? 'clickable-card' : ''}`} 
                                    onClick={() => handleCardClick(activity)}
                                >
                                    <img 
                                        src={getActivityImage(activity.activity_type, activity.description, activity.activity_object, activityImages)} 
                                        alt={getActivityTitle(activity)} 
                                        className="card-img-top" 
                                        onError={(e) => {
                                            console.log(`Image failed to load: ${e.target.src}`);
                                            e.target.src = getActivityImage(activity.activity_type, activity.description, null, {});
                                        }}
                                    />
                                    <div className="timeline-header">
                                        <h5>{getActivityTitle(activity)}</h5>
                                        {getActivityTime(activity) && (
                                            <span className="timeline-time">{getActivityTime(activity)} IST</span>
                                        )}
                                    </div>
                                    <div className="timeline-body">
                                        {getActivityDetails(activity).map((detail, i) => (
                                            <p key={i}>
                                                {getDetailIcon(detail.icon)}
                                                {detail.text}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div style={{ padding: '1rem', textAlign: 'center' }}>
                    <p style={{ color: '#6c757d' }}>No activities scheduled for this day.</p>
                </div>
            )}
        </div>
    );
}