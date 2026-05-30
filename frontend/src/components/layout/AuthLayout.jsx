import { Outlet } from 'react-router-dom';
import {
  Sparkles,
  Globe,
  Users,
} from 'lucide-react';

import logo from "../../assets/logo.png";

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-[#0b0b12] flex items-center justify-center p-4">

      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">

        {/* Gradient Blobs */}
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-pink-500/20 rounded-full blur-3xl" />

        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] bg-blue-500/20 rounded-full blur-3xl" />

        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-purple-500/10 rounded-full blur-3xl" />

        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md">

        {/* Branding */}
        <div className="text-center mb-10">

          {/* Logo */}
          <div className="flex justify-center mb-5">
            <img
              src={logo}
              alt="SocioConnect Logo"
              className="w-24 h-24 rounded-3xl shadow-2xl border border-white/10"
            />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
            SocioConnect
          </h1>

          {/* Subtitle */}
          <p className="mt-3 text-gray-400 text-sm">
            Connect • Share • Explore
          </p>

          {/* Features */}
          <div className="flex items-center justify-center gap-5 mt-5 text-xs text-gray-500">

            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-pink-500" />
              Community
            </div>

            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4 text-blue-500" />
              Social
            </div>

            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Modern
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl">

          {/* Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-blue-500/5" />

          {/* Content */}
          <div className="relative z-10 p-8">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          © 2026 SocioConnect 
        </p>
      </div>
    </div>
  );
}