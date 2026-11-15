import { useOutletContext } from 'react-router-dom';
import OperatorDashboard from './OperatorDashboard.jsx';
import HostDashboard from './HostDashboard.jsx';

function DashboardHome() {
  const {
    profile,
    myRequests,
    myRequestsLoading,
    myRequestsError,
    onMyRequestsRetry,
    onSendRequest,
    ...hostProps
  } = useOutletContext();

  if (profile?.role === 'operator') {
    return (
      <OperatorDashboard
        profile={profile}
        myRequests={myRequests}
        myRequestsLoading={myRequestsLoading}
        myRequestsError={myRequestsError}
        onMyRequestsRetry={onMyRequestsRetry}
        onSendRequest={onSendRequest}
      />
    );
  }

  return <HostDashboard profile={profile} {...hostProps} />;
}

export default DashboardHome;
