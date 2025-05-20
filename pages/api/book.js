import axios from 'axios'; // Add this import at the top

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { bearerToken, payload } = req.body;
    
    const response = await axios.post(
      'https://members.wework.com/workplaceone/api/common-booking/',
      payload,
      {
        headers: {
          'authorization': `Bearer ${bearerToken}`,
          'content-type': 'application/json',
          'request-source': 'MemberWeb/WorkplaceOne/Prod',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'weworkmembertype': '2'
        }
      }
    );

    res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('Booking error:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: error.response?.data?.message || error.message 
    });
  }
}