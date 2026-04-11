// api/tripApi.js
export const getTrips = async ({ page = 0, perPage = 10, type, token ,customer_id=null }) => {
    try {
      const queryParams = new URLSearchParams({
        page,
        perPage,
        ...(type && { type }), // include type only if it exists
        customer_id
      }).toString();
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/trips?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${token}`,
        },
      });
  
      const data = await res.json();
  
      return {
        success: true,
        data: data.data,
        totalItems: data.totalItems,
        totalPages: data.totalPages,
        currentPage: data.currentPage,
        perPage: data.perPage,
      };
    } catch (error) {
      console.error('Error fetching trips:', error);
      return { success: false, error };
    }
  };
  