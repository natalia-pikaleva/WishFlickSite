import React from 'react';
import { ArrowRight, Play, Users, Heart, Target } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#B48DFE] via-[#6A49C8] to-[#98E2D5] text-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-white rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-white rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 border-2 border-white rounded-full animate-pulse delay-2000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                Turn Your
                <br />
                <span className="text-[#98E2D5]">Dreams</span> Into
                <br />
                Reality
              </h1>
              <p className="text-lg sm:text-xl text-purple-100 leading-relaxed">
                Join the community where wishes come true through social funding, 
                shared dreams, and collective support.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-white text-[#6A49C8] px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center group">
                Get Started
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="border-2 border-white text-white px-8 py-4 rounded-full font-semibold hover:bg-white hover:text-[#6A49C8] transition-all duration-300 flex items-center justify-center group">
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-purple-200 text-sm">Dreams Fulfilled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-purple-200 text-sm">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">$2M+</div>
                <div className="text-purple-200 text-sm">Raised Together</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
              <div className="space-y-6">
                {/* Mock Wishlist Item */}
                <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-[#98E2D5] rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold">Dream Vacation</div>
                      <div className="text-sm text-purple-200">by Sarah M.</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>$2,400 / $5,000</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <div className="bg-[#98E2D5] h-2 rounded-full w-[48%]"></div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="w-4 h-4" />
                      <span>23 supporters</span>
                    </div>
                  </div>
                </div>

                {/* Mock Social Activity */}
                <div className="bg-white/15 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-8 h-8 bg-[#B48DFE] rounded-full"></div>
                    <div className="text-sm">
                      <span className="font-semibold">Alex</span> supported your wish
                    </div>
                  </div>
                  <div className="text-sm text-purple-200">
                    "Hope you get that camera! 📸"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;