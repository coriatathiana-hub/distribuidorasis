import { useNavigate } from "react-router-dom";
import AdminOtpLogin from "@/components/admin/AdminOtpLogin";

const AdminLogin = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <AdminOtpLogin onSuccess={() => navigate("/admin", { replace: true })} />
    </div>
  );
};

export default AdminLogin;
