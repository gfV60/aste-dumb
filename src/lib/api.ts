export async function fetchFantacalcioPlayers() {
  try {
    const response = await fetch('https://apileague.fantacalcio.it/onboarding/v1/league/players', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('API Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
}