import { useAuth } from "@clerk/clerk-react";
import { useNavigate,Route } from "react-router-dom";


const PrivateRoute = ({ children,path }) => {
    const { isSignedIn } = useAuth();
    const navigate = useNavigate(); 

    if (!isSignedIn) {
        navigate("/sign-in"); 
        return null;
    }

    return <Route path={ path} element={children} />;
};

export default PrivateRoute;