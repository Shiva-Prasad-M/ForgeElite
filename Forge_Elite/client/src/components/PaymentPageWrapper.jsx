import { useLocation } from 'react-router-dom';
import PaymentPage from './PaymentPage';

const PaymentPageWrapper = () => {
  const { state } = useLocation();
  return <PaymentPage selectedCourse={state.course} />;
};

export default PaymentPageWrapper;
