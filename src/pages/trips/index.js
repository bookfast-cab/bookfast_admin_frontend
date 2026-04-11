import TripListContainer from 'src/components/TripListContainer';

const TripsPage = () => {
  return <TripListContainer isFromAdmin={false} showAddButton={false} title="Trips" />;
};

export default TripsPage;
