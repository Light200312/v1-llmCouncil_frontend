import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Mail, Lock, User, ArrowRight, Github, AlertCircle } from 'lucide-react';
import { Context } from './context/Context.jsx'; // Adjust path if necessary

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    
    // Pull auth functions from Context
    const { login, register } = useContext(Context);

    // Form States
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors

        let result;
        if (isLogin) {
            result = await login(formData.email, formData.password);
        } else {
            result = await register(formData.username, formData.email, formData.password);
        }

        if (result.success) {
            navigate('/');
        } else {
            setError(result.message); // Display backend error (e.g., "Invalid credentials")
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-200 dark:border-slate-800">
                
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-10">
                    <div className="p-4 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20 mb-4">
                        <Sparkles className="text-white" size={32} />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">
                        {isLogin ? "Welcome Back" : "Join the Council"}
                    </h1>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400 text-sm animate-shake">
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input 
                                name="username"
                                type="text" 
                                placeholder="Full Name" 
                                required={!isLogin}
                                value={formData.username}
                                onChange={handleInputChange}
                                className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                            />
                        </div>
                    )}
                    
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            name="email"
                            type="email" 
                            placeholder="Email Address" 
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                    </div>

                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input 
                            name="password"
                            type="password" 
                            placeholder="Password" 
                            required
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                    </div>

                    <button type="submit" className="w-full bg-slate-900 dark:bg-blue-600 text-white font-bold py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 mt-6 shadow-xl shadow-blue-500/10">
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight size={18} />
                    </button>
                </form>

                <div className="mt-8">
                    <div className="relative flex items-center justify-center mb-6">
                        <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
                        <span className="bg-white dark:bg-slate-900 px-4 text-[10px] uppercase font-bold text-slate-400 absolute">Or continue with</span>
                    </div>

                    <button type="button" className="w-full flex items-center justify-center gap-3 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Github size={20} />
                        GitHub
                    </button>
                </div>

                <p className="text-center text-sm text-slate-500 mt-8">
                    {isLogin ? "Don't have an account?" : "Already a member?"} 
                    <button 
                        type="button"
                        onClick={() => {
                            setIsLogin(!isLogin);
                            setError("");
                        }}
                        className="ml-2 text-blue-500 font-bold hover:underline"
                    >
                        {isLogin ? "Sign Up" : "Log In"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Auth;