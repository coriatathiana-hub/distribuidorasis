import { useNavigate } from "react-router-dom";
import AdminOtpLogin from "@/components/admin/AdminOtpLogin";

const AdminLogin = () => {
  const navigate = useNavigate();
  return (
    <AdminOtpLogin onSuccess={() => navigate("/admin", { replace: true })} />
  );
};

export default AdminLogin;
