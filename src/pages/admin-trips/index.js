import TripListContainer from 'src/components/TripListContainer';

const AdminTripsPage = () => {
    return <TripListContainer isFromAdmin={true} showAddButton={true} title="Admin Trips" />;
};

export default AdminTripsPage;
