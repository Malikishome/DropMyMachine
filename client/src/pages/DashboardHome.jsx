import { useOutletContext } from 'react-router-dom';
import OperatorDashboard from './OperatorDashboard.jsx';
import HostDashboard from './HostDashboard.jsx';

function DashboardHome() {
  const { profile, ...hostProps } = useOutletContext();

  if (profile?.role === 'operator') {
    return <OperatorDashboard profile={profile} />;
  }

  return <HostDashboard profile={profile} {...hostProps} />;
}

export default DashboardHome;
