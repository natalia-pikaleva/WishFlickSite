import React from 'react';
import { Heart, Users, Clock, TrendingUp } from 'lucide-react';

const PopularWishes = () => {
  const wishes = [
    {
      id: 1,
      title: "Professional Photography Equipment",
      user: "Alex Thompson",
      image: "https://images.pexels.com/photos/90946/pexels-photo-90946.jpeg?auto=compress&cs=tinysrgb&w=400",
      progress: 75,
      raised: 1875,
      goal: 2500,
      supporters: 23,
      category: "Creative",
      timeLeft: "12 days"
    },
    {
      id: 2,
      title: "Coding Bootcamp Tuition",
      user: "Maria Rodriguez",
      image: "https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400",
      progress: 45,
      raised: 1350,
      goal: 3000,
      supporters: 31,
      category: "Education",
      timeLeft: "25 days"
    },
    {
      id: 3,
      title: "Mountain Bike Adventure",
      user: "Jake Wilson",
      image: "https://images.pexels.com/photos/100582/pexels-photo-100582.jpeg?auto=compress&cs=tinysrgb&w=400",
      progress: 88,
      raised: 1320,
      goal: 1500,
      supporters: 18,
      category: "Adventure",
      timeLeft: "8 days"
    },
    {
      id: 4,
      title: "Art Studio Setup",
      user: "Sarah Chen",
      image: "https://images.pexels.com/photos/1047540/pexels-photo-1047540.jpeg?auto=compress&cs=tinysrgb&w=400",
      progress: 62,
      raised: 930,
      goal: 1500,
      supporters: 27,
      category: "Creative",
      timeLeft: "18 days"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trending Wishes
            </h2>
            <p className="text-xl text-gray-600">
              Discover what the community is supporting right now
            </p>
          </div>
          
          <button className="hidden sm:flex items-center text-[#6A49C8] font-semibold hover:text-[#B48DFE] transition-colors">
            View All
            <TrendingUp className="ml-2 w-5 h-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {wishes.map((wish) => (
            <div key={wish.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
              <div className="relative">
                <img 
                  src={wish.image} 
                  alt={wish.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-[#B48DFE] text-white px-3 py-1 rounded-full text-sm font-medium">
                    {wish.category}
                  </span>
                </div>
                <button className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                  <Heart className="w-4 h-4 text-gray-600" />
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {wish.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">by {wish.user}</p>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-semibold">${wish.raised} / ${wish.goal}</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${wish.progress}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{wish.supporters} supporters</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{wish.timeLeft}</span>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-4 bg-gradient-to-r from-[#B48DFE] to-[#6A49C8] text-white py-2 rounded-full font-medium hover:shadow-lg transition-all duration-300">
                  Support This Wish
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PopularWishes;