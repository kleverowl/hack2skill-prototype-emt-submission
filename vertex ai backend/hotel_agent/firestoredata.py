import requests
import json
import logging

# Base URL for your Firestore API
BASE_URL = "https://firestore.googleapis.com/v1/projects/hack2skill-emt/databases/(default)/documents"

logger = logging.getLogger(__name__)

def get_firestore_data(collection_name: str) -> list[str]:
    """
    A generic function to fetch document IDs from a specified Firestore collection.
    
    Args:
        collection_name: The name of the collection (e.g., 'hotels', 'buses').
        
    Returns:
        A list of document IDs (names) from the collection.
    """
    url = f"{BASE_URL}/{collection_name}"
    logger.info(f"Requesting URL: {url}")
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        data = response.json()
        
        # Extract just the name from the full document path
        # e.g., "projects/.../documents/dummyData/hotels/list/Taj Hotel" -> "Taj Hotel"
        names = [doc['name'].split('/')[-1] for doc in data.get('documents', [])]
        return names
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching data from {collection_name}: {e}")
        return [f"Error: Could not fetch data for {collection_name}."]
    except (KeyError, IndexError) as e:
        logger.error(f"Error parsing response for {collection_name}: {e}")
        return [f"Error: Invalid data format for {collection_name}."]

# Create specific tool functions that your agent can call
def get_hotels() -> list[str]:
    """Fetches the names of all available hotels from Firestore."""
    return get_firestore_data("dummyData/hotels/list?mask.fieldPaths=_id_only_")
