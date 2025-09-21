import React, { useState, useEffect } from 'react';

const Personalization = ({ preferences, onSavePreferences }) => {
    const [foodPreferences, setFoodPreferences] = useState([]);

    useEffect(() => {
        if (preferences && preferences.food) {
            setFoodPreferences(preferences.food);
        }
    }, [preferences]);

    const handleFoodChange = (index, value) => {
        const newFoodPreferences = [...foodPreferences];
        newFoodPreferences[index] = value;
        setFoodPreferences(newFoodPreferences);
    };

    const handleAddFood = () => {
        setFoodPreferences([...foodPreferences, '']);
    };

    const handleRemoveFood = (index) => {
        const newFoodPreferences = foodPreferences.filter((_, i) => i !== index);
        setFoodPreferences(newFoodPreferences);
    };

    const handleSave = () => {
        onSavePreferences({ food: foodPreferences });
    };

    if (!preferences) {
        return null;
    }

    return (
        <div className="p-3">
            <h5>Personalization</h5>
            <div>
                <h6>Food Preferences</h6>
                {foodPreferences.map((food, index) => (
                    <div key={index} className="input-group mb-2">
                        <input
                            type="text"
                            className="form-control"
                            value={food}
                            onChange={(e) => handleFoodChange(index, e.target.value)}
                        />
                        <button className="btn btn-outline-danger" type="button" onClick={() => handleRemoveFood(index)}>
                            Remove
                        </button>
                    </div>
                ))}
                <button className="btn btn-outline-primary mb-3" type="button" onClick={handleAddFood}>
                    Add Food Preference
                </button>
            </div>
            <button className="btn btn-primary" onClick={handleSave}>
                Save Preferences
            </button>
        </div>
    );
}

export default Personalization;