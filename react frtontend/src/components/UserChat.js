import { auth, database, db } from '../firebase';
import { ref, onValue, set, push,update,get } from 'firebase/database';
import { doc, updateDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import HotelDetails from './hotel';
import FlightCard from './flightcard';
import FlightDetailsCard from './flightdetailedcard';
import FlightDetailsMap from './flightdetailsmap';
import TravelItinerary from './iternity';
import Personalization from './Personalization';
import ItineraryTimeline from './iternitytimeline';
import ItineraryContent from './iternitytimeline';
import { useRef } from 'react';
import axios from 'axios';

const UserChat = ({ selectedItineraryId }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [userName, setUserName] = useState("Doris Brown");
    const [messages, setMessages] = useState([]);
    const [preferences, setPreferences] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [user, setUser] = useState(null);
    const [tripName, setTripName] = useState("");
    const [selectedActivityObject, setSelectedActivityObject] = useState(null);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            setUser(currentUser);
            setUserName(currentUser.displayName || "User");
        }
    }, []);

    // Effect to get messages when the itinerary ID is known
    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser || !selectedItineraryId) {
            setMessages([]); // Clear messages if no itinerary is selected
            return;
        }

        const messagesRef = ref(database, `users/user_id/${currentUser.uid}/itineraries/${selectedItineraryId}/messages/message_id`);
        const unsubscribe = onValue(messagesRef, (snapshot) => {
            const messagesData = snapshot.val() || {};
            const messagesList = Object.values(messagesData);
            setMessages(messagesList);
            console.log("Fetched messages:", messagesList);
        });

        return () => unsubscribe();
    }, [selectedItineraryId]); // Re-run when selectedItineraryId changes

    const fetchTripName = async () => {
        const currentUser = auth.currentUser;
        if (currentUser && selectedItineraryId) {
            try {
                const itineraryNameRef = ref(
                    database,
                    `users/user_id/${currentUser.uid}/itineraries/${selectedItineraryId}/state/itinerary`
                );
                const snapshot = await get(itineraryNameRef);
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    console.log("Fetched trip name:", data.trip_name);
                    setTripName(data.trip_name); // update state if using React
                } else {
                    console.log("No trip name found");
                }
            } catch (error) {
                console.error("Error fetching trip name:", error);
            }
        }
    };

    useEffect(() => {
        fetchTripName();
    }, [selectedItineraryId])

    const handleSave = async () => {
        setIsEditing(false);
        const currentUser = auth.currentUser;
        if (currentUser && selectedItineraryId) {
            try {
                const itineraryNameRef = ref(database, `users/user_id/${currentUser.uid}/itineraries/${selectedItineraryId}/state/itinerary`);
                await update(itineraryNameRef, { trip_name: tripName });
                console.log("Updated trip name:", tripName);
            } catch (error) {
                console.error("Error updating trip name:", error);
            }
        }
    };

    const handleSavePreferences = async (updatedPreferences) => {
        if (auth.currentUser) {
            try {
                const userPreferencesRef = ref(database, 'users/' + auth.currentUser.uid + '/preferences');
                await set(userPreferencesRef, updatedPreferences);
                console.log("Preferences updated successfully!");
            } catch (error) {
                console.error("Error updating preferences:", error);
            }
        }
    };

    const sendMessage = async () => {
        if (newMessage.trim() === "" || !user || !selectedItineraryId) return;

        try {
            const messagesRef = ref(
                database,
                `users/user_id/${user.uid}/itineraries/${selectedItineraryId}/messages/message_id`
            );

            // Push new user message
            const newMessageRef = push(messagesRef);
            const messageId = newMessageRef.key;
            const timestamp = new Date().toISOString();

            const message = {
                id: messageId,
                sender: "user",
                message_type: "text",
                message: newMessage,
                timestamp: timestamp,
            };




            // Save user message
            await set(newMessageRef, message);
            setNewMessage("");

            // Set typing = true (backend will later set false)
            const typingRef = ref(
                database,
                `users/user_id/${user.uid}/itineraries/${selectedItineraryId}/messages/typing`
            );
            await set(typingRef, true);


const payload={
  user_id: user.uid, // Firebase user UID
      itinerary_id: selectedItineraryId, // Selected itinerary
      sender: "user",
      message: newMessage,
      timestamp: timestamp,
}

            console.log("Message sent and typing=true set. Waiting for backend...");
await axios.post(process.env.REACT_APP_CHAT_API_URL, {
  user_id: user.uid,
  itinerary_id: selectedItineraryId,
  sender: "user",
  message: newMessage,
  timestamp: timestamp,
}, {
  headers: { "Content-Type": "application/json" },
});
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser || !selectedItineraryId) return;

        const typingRef = ref(
            database,
            `users/user_id/${currentUser.uid}/itineraries/${selectedItineraryId}/messages/typing`
        );

        const unsubscribe = onValue(typingRef, (snapshot) => {
            const typingValue = snapshot.val();
            setIsTyping(!!typingValue);
        });

        return () => unsubscribe();
    }, [selectedItineraryId]);

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleActivityButtonClick = (activityType, activityObject) => {
        setSelectedActivityObject(activityObject);

        console.log(activityObject,activityType)
        
        // Open the corresponding offcanvas based on activity type
        const offcanvasMap = {
            'hotel': '#hotelOffcanvas',
            'flight': '#flightOffcanvas',
            'train': '#trainOffcanvas',
            'bus': '#busOffcanvas',
            'itinerary': '#itineraryOffcanvas'
        };

        const offcanvasTarget = offcanvasMap[activityType.toLowerCase()];
        if (offcanvasTarget) {
            // Use Bootstrap's offcanvas API to show the offcanvas
            const offcanvasElement = document.querySelector(offcanvasTarget);
            if (offcanvasElement) {
                const bsOffcanvas = new window.bootstrap.Offcanvas(offcanvasElement);
                bsOffcanvas.show();
            }
        }
    };

console.log(selectedActivityObject,"itinerary")


    const getActivityButtonInfo = (activityType) => {
        const buttonConfigs = {
            'hotel': { 
                label: 'View Hotel', 
                icon: 'ri-hotel-line',
                color: '#28a745'
            },
            'flight': { 
                label: 'View Flight', 
                icon: 'ri-flight-takeoff-line',
                color: '#007bff'
            },
            'train': { 
                label: 'View Train', 
                icon: 'ri-train-line',
                color: '#6f42c1'
            },
            'bus': { 
                label: 'View Bus', 
                icon: 'ri-bus-line',
                color: '#fd7e14'
            },
            'itinerary': { 
                label: 'View Itinerary', 
                icon: 'ri-calendar-todo-line',
                color: '#20c997'
            }
        };

        return buttonConfigs[activityType.toLowerCase()] || {
            label: 'View Details',
            icon: 'ri-eye-line',
            color: '#6c757d'
        };
    };
 const [visibleCount, setVisibleCount] = useState(20);
  const chatRef = useRef(null);
  const [allMessages, setAllMessages] = useState(messages);

  useEffect(() => {
    setAllMessages(messages);
  }, [messages]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [allMessages]);

  const handleScroll = () => {
    const el = chatRef.current;
    if (el.scrollTop === 0 && visibleCount < allMessages.length) {
      const oldScrollHeight = el.scrollHeight;

      setVisibleCount((prev) => Math.min(prev + 20, allMessages.length));

      // Wait for DOM to update, then adjust scrollTop so view doesn't jump
      setTimeout(() => {
        const newScrollHeight = el.scrollHeight;
        el.scrollTop = newScrollHeight - oldScrollHeight;
      }, 0);
    }
  };

  const displayedMessages = allMessages.slice(
    Math.max(allMessages.length - visibleCount, 0),
    allMessages.length
  );


    const MessageDropdown = ({ messageId }) => (
        <div className="dropdown align-self-start">
            <button
                className="btn btn-link dropdown-toggle p-0"
                type="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
                style={{ border: 'none', background: 'none' }}
            >
            </button>
            <div className="dropdown-menu">
                <a className="dropdown-item" href="#">Copy <i className="ri-file-copy-line float-end text-muted"></i></a>
                <a className="dropdown-item" href="#">Save <i className="ri-save-line float-end text-muted"></i></a>
                <a className="dropdown-item" href="#">Forward <i className="ri-chat-forward-line float-end text-muted"></i></a>
                <a className="dropdown-item" href="#">Delete <i className="ri-delete-bin-line float-end text-muted"></i></a>
            </div>
        </div>
    );

const TextMessage = ({ message }) => (
    <div
        className={`ctext-wrap-content ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
        style={{
            backgroundColor: message.sender === 'user' ? '#E8F0FE' : '#ffffff', // User messages blue, bot white
            color: '#000000',             // text color black for both
            padding: '8px 12px',          // WhatsApp-like padding
            borderRadius: '12px',         // rounded corners
            boxShadow: '0 1px 2px rgba(0,0,0,0.1)', // subtle shadow
            position: 'relative',
            wordBreak: 'break-word',      // handle long words
        }}
    >
        <div className="mb-2" style={{ color: '#000000', margin: '0 0 6px 0', whiteSpace: 'pre-wrap' }}>
            {message.message}
        </div>

        {/* Activity Button - Show only if activityType exists */}
        {message.activityType && (
            <div className="mb-2">
                <button
                    className="btn btn-sm"
                    style={{
                        backgroundColor: getActivityButtonInfo(message.activityType).color,
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '12px',
                        padding: '6px 12px',
                    }}
                    onClick={() => handleActivityButtonClick(message.activityType, message.activity_object)}
                >
                    <i className={`${getActivityButtonInfo(message.activityType).icon} me-1`}></i>
                    {getActivityButtonInfo(message.activityType).label}
                </button>
            </div>
        )}

        <p className="chat-time mb-0" style={{ 
            fontSize: '11px', 
            color: '#667781', // WhatsApp-like time color
            textAlign: 'right',
            margin: '4px 0 0 0',
            lineHeight: '1'
        }}>
            <i className="ri-time-line align-middle me-1" style={{ fontSize: '10px' }}></i>
            <span className="align-middle">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </p>
    </div>
);



    const renderMessageContent = (message) => {
        return <TextMessage message={message} />;
    };

    return (
        <div className="user-chat w-100 overflow-hidden d-flex flex-column vh-100">
            <style>
{`
@keyframes blink {
  0%, 20% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
}
`}
            </style>

            <div className="d-lg-flex">
                <div className="w-100 overflow-hidden position-relative">
                    <div className="p-3 p-lg-4 border-bottom user-chat-topbar">
                        <div className="row align-items-center">
                            <div className="col-sm-4 col-8">
                                <div className="d-flex align-items-center">
                                    <div className="d-block d-lg-none me-2 ms-0">
                                        <a href="#" className="user-chat-remove text-muted font-size-16 p-2"><i className="ri-arrow-left-s-line"></i></a>
                                    </div>
                                    <div className="avatar-xs">
                                        <div className="avatar-xs">
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold text-uppercase"
                                                style={{
                                                    background: "linear-gradient(135deg, #0980B5, #17B8E0)",
                                                    width: "32px",
                                                    height: "32px",
                                                }}
                                            >
                                                {tripName?.charAt(0) || "U"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-grow-1 overflow-hidden">
                                        <h5 className="font-size-16 mb-0 text-truncate d-flex align-items-center">
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    value={tripName}
                                                    onChange={(e) => setTripName(e.target.value)}
                                                    onBlur={handleSave}
                                                    autoFocus
                                                    className="me-2"
                                                    style={{ maxWidth: "200px" }}
                                                />
                                            ) : (
                                                <span className="text-reset">{tripName}</span>
                                            )}
                                            <i
                                                className="ri-pencil-fill font-size-14 text-primary ms-2"
                                                style={{ cursor: "pointer" }}
                                                onClick={() => setIsEditing(true)}
                                            ></i>
                                        </h5>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-8 col-4">
                                <ul className="list-inline user-chat-nav text-end mb-0">
                                    <li className="list-inline-item">
                                        <div className="dropdown">
                                        </div>
                                    </li>

                                    <li className="list-inline-item d-none d-lg-inline-block me-2 ms-0">
                                        <button type="button" className="btn nav-btn" data-bs-toggle="offcanvas" data-bs-target="#flightOffcanvas" aria-controls="flightOffcanvas">
                                            <i className="ri-flight-takeoff-line"></i>
                                        </button>
                                    </li>

                                    <li className="list-inline-item d-none d-lg-inline-block me-2 ms-0">
                                        <button type="button" className="btn nav-btn" data-bs-toggle="offcanvas" data-bs-target="#hotelOffcanvas" aria-controls="hotelOffcanvas">
                                            <i className="ri-hotel-line"></i>
                                        </button>
                                    </li>

                                    <li className="list-inline-item d-none d-lg-inline-block me-2 ms-0">
                                        <button type="button" className="btn nav-btn" data-bs-toggle="offcanvas" data-bs-target="#itineraryOffcanvas" aria-controls="itineraryOffcanvas">
                                            <i className="ri-calendar-todo-line"></i>
                                        </button>
                                    </li>

                                    <li className="list-inline-item">
                                        <div className="dropdown">
                                            <button className="btn" type="button" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{
                                                backgroundColor: "#17B8E0",
                                                borderColor: "#17B8E0",
                                                color: "#ffffff",
                                            }}>
                                                <i className="ri-more-fill"></i>
                                            </button>
                                            <div className="dropdown-menu dropdown-menu-end">
                                                <a className="dropdown-item d-block d-lg-none user-profile-show" href="#">View profile <i className="ri-user-2-line float-end text-muted"></i></a>
                                                <a className="dropdown-item d-block d-lg-none" href="#" data-bs-toggle="offcanvas" data-bs-target="#flightOffcanvas" aria-controls="flightOffcanvas">Flights <i className="ri-flight-takeoff-line float-end text-muted"></i></a>
                                                <a className="dropdown-item d-block d-lg-none" href="#" data-bs-toggle="offcanvas" data-bs-target="#hotelOffcanvas" aria-controls="hotelOffcanvas">Hotels <i className="ri-hotel-line float-end text-muted"></i></a>
                                                <a className="dropdown-item d-block d-lg-none" href="#" data-bs-toggle="offcanvas" data-bs-target="#itineraryOffcanvas" aria-controls="itineraryOffcanvas">Itinerary <i className="ri-calendar-todo-line float-end text-muted"></i></a>
                                                <a className="dropdown-item" href="#">Archive <i className="ri-archive-line float-end text-muted"></i></a>
                                                <a className="dropdown-item" href="#">Delete <i className="ri-delete-bin-line float-end text-muted"></i></a>
                                            </div>
                                        </div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

  <div
    className="chat-conversation p-3 flex-grow-1"
    style={{ overflowY: "auto" }}
    ref={chatRef}
    onScroll={handleScroll}
>
    <ul className="list-unstyled mb-0">
        {displayedMessages
            .filter((msg) => msg && msg.message)
            .map((message, index) => (
                <li
                    key={index}
                    className={`${message.sender === "user" ? "d-flex justify-content-end" : "d-flex justify-content-start"} mb-3`}
                >
                    <div className={`conversation-list d-flex ${message.sender === "user" ? "flex-row-reverse" : "flex-row"} align-items-start`} 
                         style={{ 
                             maxWidth: '70%', // WhatsApp-like max width
                             minWidth: '200px' // Minimum width
                         }}>
                        
                        {/* Avatar */}
                        <div className={`chat-avatar flex-shrink-0 ${message.sender === "user" ? "ms-2" : "me-2"}`}>
                            <div
                                className="avatar-placeholder bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                                style={{ width: "32px", height: "32px" }}
                            >
                                {message.sender === "user" ? (
                                    <i className="ri-user-fill text-white" style={{ fontSize: '14px' }}></i>
                                ) : (
                                    <i className="ri-robot-fill text-white" style={{ fontSize: '14px' }}></i>
                                )}
                            </div>
                        </div>

                        {/* Message Content */}
                        <div className="user-chat-content flex-grow-1">
                            <div className="ctext-wrap">
                                {renderMessageContent(message)}
                            </div>
                            
                            {/* Sender name - positioned outside the bubble */}
                            <div className={`conversation-name text-muted small mt-1 ${message.sender === "user" ? "text-end" : "text-start"}`}
                                 style={{ fontSize: '10px', color: '#8696a0' }}>
                                {message.sender === "user" ? "You" : "Assistant"}
                            </div>
                        </div>
                    </div>
                </li>
            ))}

        {/* Updated Typing Indicator */}
        {isTyping && (
            <li className="d-flex justify-content-start mb-3">
                <div className="conversation-list d-flex flex-row align-items-start" 
                     style={{ maxWidth: '70%', minWidth: '120px' }}>
                    
                    <div className="chat-avatar flex-shrink-0 me-2">
                        <div
                            className="avatar-placeholder rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                                width: "32px",
                                height: "32px",
                                backgroundColor: "#6c757d",
                            }}
                        >
                            <i className="ri-robot-fill text-white" style={{ fontSize: '14px' }}></i>
                        </div>
                    </div>

                    <div className="user-chat-content flex-grow-1">
                        <div className="ctext-wrap">
                            <div
                                className="ctext-wrap-content"
                                style={{
                                    backgroundColor: "#ffffff",
                                    color: "#667781",
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                }}
                            >
                                <div className="d-flex align-items-center">
                                    <span className="fst-italic me-1" style={{ fontSize: '14px' }}>Typing</span>
                                    <span
                                        style={{
                                            display: "flex",
                                            gap: "2px",
                                        }}
                                    >
                                        <span
                                            style={{
                                                animation: "blink 1.5s infinite",
                                                animationDelay: "0s",
                                                opacity: 0,
                                                fontSize: '16px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            •
                                        </span>
                                        <span
                                            style={{
                                                animation: "blink 1.5s infinite",
                                                animationDelay: "0.3s",
                                                opacity: 0,
                                                fontSize: '16px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            •
                                        </span>
                                        <span
                                            style={{
                                                animation: "blink 1.5s infinite",
                                                animationDelay: "0.6s",
                                                opacity: 0,
                                                fontSize: '16px',
                                                lineHeight: '1'
                                            }}
                                        >
                                            •
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="conversation-name text-muted small mt-1 text-start"
                             style={{ fontSize: '10px', color: '#8696a0' }}>
                            Assistant
                        </div>
                    </div>
                </div>
            </li>
        )}
    </ul>
</div>

  

                    <div className="p-3 p-lg-4 border-top mb-0">
                        <div className="row g-0 align-items-center">
                            <div className="col">
                                <textarea
                                    type="text"
                                    className="form-control bg-light border-light"
                                    placeholder="Enter Message..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                />
                            </div>
                            <div className="col-auto">
                                <div className="chat-input-links ms-2">
                                    <ul className="list-inline mb-0">
                                        <li className="list-inline-item">
                                            <button
                                                type="button"
                                                className="btn font-size-16 btn-lg chat-send waves-effect waves-light"
                                                onClick={sendMessage}
                                                style={{
                                                    backgroundColor: "#17B8E0",
                                                    borderColor: "#17B8E0",
                                                    color: "#ffffff",
                                                }}
                                            >
                                                <i className="ri-send-plane-2-fill"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Offcanvas Components */}
                <div className="offcanvas offcanvas-end " tabIndex="-1" id="flightOffcanvas" aria-labelledby="flightOffcanvasLabel" style={{width: "600px"}}>
                    <div className="offcanvas-header">
                        <h5 id="flightOffcanvasLabel">Flight Information</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        <FlightCard activityObject={selectedActivityObject} />
                        <FlightDetailsMap activityObject={selectedActivityObject} />
                    </div>
                </div>

                <div className="offcanvas offcanvas-end" tabIndex="-1" id="hotelOffcanvas" aria-labelledby="hotelOffcanvasLabel" style={{width: "600px"}}>
                    <div className="offcanvas-header">
                        <h5 id="hotelOffcanvasLabel">Hotel Information</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        <HotelDetails hotelId={selectedActivityObject} />
                    </div>
                </div>

                {/* Train Offcanvas */}
                <div className="offcanvas offcanvas-end" tabIndex="-1" id="trainOffcanvas" aria-labelledby="trainOffcanvasLabel" style={{width: "600px"}}>
                    <div className="offcanvas-header">
                        <h5 id="trainOffcanvasLabel">Train Information</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        {/* Add your train component here */}
                        <div>Train details will be displayed here with activityObject: {selectedActivityObject}</div>
                    </div>
                </div>

                {/* Bus Offcanvas */}
                <div className="offcanvas offcanvas-end" tabIndex="-1" id="busOffcanvas" aria-labelledby="busOffcanvasLabel" style={{width: "600px"}}>
                    <div className="offcanvas-header">
                        <h5 id="busOffcanvasLabel">Bus Information</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        {/* Add your bus component here */}
                        <div>Bus details will be displayed here with activityObject: {selectedActivityObject}</div>
                    </div>
                </div>

                <div 
                    className="offcanvas offcanvas-end" 
                    tabIndex="-1" 
                    id="itineraryOffcanvas" 
                    aria-labelledby="itineraryOffcanvasLabel" 
                    style={{ width: "600px" }}
                >
                    <div className="offcanvas-header">
                        <h5 id="itineraryOffcanvasLabel">Itinerary</h5>
                        <button 
                            type="button" 
                            className="btn-close text-reset" 
                            data-bs-dismiss="offcanvas" 
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="offcanvas-body">
                        <ItineraryContent activityObject={selectedActivityObject}  userid={user} />

                        {/* Share Itinerary Button */}
                        <div className="mt-3 text-end">
                            <button 
                                className="btn btn-primary" 
                                onClick={() => window.open("/iternity", "_blank")}
                            >
                                Share Itinerary
                            </button>
                        </div>
                    </div>
                </div>

                <div className="offcanvas offcanvas-end" tabIndex="-1" id="personalizationOffcanvas" aria-labelledby="personalizationOffcanvasLabel" style={{width: "600px"}}>
                    <div className="offcanvas-header">
                        <h5 id="personalizationOffcanvasLabel">Personalization</h5>
                        <button type="button" className="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                    </div>
                    <div className="offcanvas-body">
                        <Personalization preferences={preferences} onSavePreferences={handleSavePreferences} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default UserChat;