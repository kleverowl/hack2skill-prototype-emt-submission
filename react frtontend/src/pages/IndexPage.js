
import React, { useState, useEffect } from 'react';
import SideMenu from '../components/SideMenu';
import ChatLeftSidebar from '../components/ChatLeftSidebar';
import UserChat from '../components/UserChat';
import { auth, database } from '../firebase';
import { ref, onValue } from 'firebase/database';

const IndexPage = () => {
    const [activeTab, setActiveTab] = useState('chat');
    const [theme, setTheme] = useState('light');
    const [itineraries, setItineraries] = useState({});
    const [selectedItineraryId, setSelectedItineraryId] = useState(null);

    useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = ref(database, `users/user_id/${currentUser.uid}`);
    const unsubscribe = onValue(userRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const fetchedItineraries = data.itineraries || {};
            setItineraries(fetchedItineraries);

            if (!selectedItineraryId) {
                // Find first itinerary that has at least one message
                const firstWithMessage = Object.entries(fetchedItineraries).find(([id, itinerary]) => {
                    if (!itinerary.messages) return false;

                    // Check both 'messages' and nested 'message_id'
                    const msgKeys = Object.keys(itinerary.messages);
                    return msgKeys.length > 0 && (msgKeys.some(key => key !== 'typing'));
                });

                if (firstWithMessage) {
                    setSelectedItineraryId(firstWithMessage[0]);
                } else {
                    // Fallback to first itinerary
                    const firstId = Object.keys(fetchedItineraries)[0];
                    if (firstId) setSelectedItineraryId(firstId);
                }
            }
        }
    });

    return () => unsubscribe();
}, [selectedItineraryId]); // only run once



    console.log(itineraries)

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    useEffect(() => {
        document.body.setAttribute('data-bs-theme', theme);
    }, [theme]);

    return (
        <div className="layout-wrapper d-lg-flex">
            <SideMenu
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                theme={theme}
                toggleTheme={toggleTheme}
            />
            <ChatLeftSidebar
                activeTab={activeTab}
                itineraries={itineraries}
                selectedItineraryId={selectedItineraryId}
                onItinerarySelect={setSelectedItineraryId}
            />
            <UserChat selectedItineraryId={selectedItineraryId} />
        </div>
    );
}

export default IndexPage;
