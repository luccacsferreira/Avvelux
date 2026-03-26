import React from 'react';
import { Clock, Users, Globe } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

export default function AudienceDemographics({ isLight, followers }) {
  // Simulated demographic data
  const ageData = [
    { age: '13-17', value: 8 },
    { age: '18-24', value: 32 },
    { age: '25-34', value: 28 },
    { age: '35-44', value: 18 },
    { age: '45-54', value: 9 },
    { age: '55+', value: 5 },
  ];

  const genderData = [
    { name: 'Male', value: 55, color: '#8b5cf6' },
    { name: 'Female', value: 42, color: '#ec4899' },
    { name: 'Other', value: 3, color: '#06b6d4' },
  ];

  const locationData = [
    { country: 'United States', viewers: 35 },
    { country: 'United Kingdom', viewers: 15 },
    { country: 'Canada', viewers: 12 },
    { country: 'Australia', viewers: 10 },
    { country: 'Germany', viewers: 8 },
    { country: 'France', viewers: 6 },
    { country: 'Brazil', viewers: 5 },
    { country: 'Other', viewers: 9 },
  ];

  const peakHoursData = [
    { hour: '6AM', viewers: 5 },
    { hour: '9AM', viewers: 15 },
    { hour: '12PM', viewers: 25 },
    { hour: '3PM', viewers: 30 },
    { hour: '6PM', viewers: 45 },
    { hour: '9PM', viewers: 60 },
    { hour: '12AM', viewers: 20 },
  ];

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Age Distribution */}
      <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Users className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`font-semibold ${isLight ? 'text-black' : 'text-white'}`}>Age Distribution</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={ageData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e5e7eb' : '#374151'} />
            <XAxis type="number" stroke={isLight ? '#6b7280' : '#9ca3af'} fontSize={12} />
            <YAxis dataKey="age" type="category" stroke={isLight ? '#6b7280' : '#9ca3af'} fontSize={12} width={50} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isLight ? '#fff' : '#1f2937', 
                border: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value}%`, 'Audience']}
            />
            <Bar dataKey="value" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gender Distribution */}
      <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Users className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`font-semibold ${isLight ? 'text-black' : 'text-white'}`}>Gender Distribution</h3>
        </div>
        <div className="flex items-center">
          <ResponsiveContainer width="60%" height={250}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-3">
            {genderData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{item.name}</span>
                <span className={`ml-auto font-medium ${isLight ? 'text-black' : 'text-white'}`}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Locations */}
      <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Globe className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`font-semibold ${isLight ? 'text-black' : 'text-white'}`}>Top Locations</h3>
        </div>
        <div className="space-y-3">
          {locationData.map((location, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className={`text-sm w-32 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>{location.country}</span>
              <div className={`flex-1 h-2 rounded-full ${isLight ? 'bg-gray-200' : 'bg-gray-700'}`}>
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-purple-500 to-cyan-500" 
                  style={{ width: `${location.viewers}%` }}
                />
              </div>
              <span className={`text-sm font-medium w-10 text-right ${isLight ? 'text-black' : 'text-white'}`}>{location.viewers}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Peak Viewing Hours */}
      <div className={`rounded-xl p-6 border ${isLight ? 'bg-white border-gray-200' : 'bg-[#2a2a2a] border-gray-800'}`}>
        <div className="flex items-center gap-2 mb-4">
          <Clock className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} />
          <h3 className={`font-semibold ${isLight ? 'text-black' : 'text-white'}`}>Peak Viewing Hours</h3>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={peakHoursData}>
            <CartesianGrid strokeDasharray="3 3" stroke={isLight ? '#e5e7eb' : '#374151'} />
            <XAxis dataKey="hour" stroke={isLight ? '#6b7280' : '#9ca3af'} fontSize={12} />
            <YAxis stroke={isLight ? '#6b7280' : '#9ca3af'} fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: isLight ? '#fff' : '#1f2937', 
                border: `1px solid ${isLight ? '#e5e7eb' : '#374151'}`,
                borderRadius: '8px'
              }}
              formatter={(value) => [`${value}%`, 'Activity']}
            />
            <Bar dataKey="viewers" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        <p className={`text-sm text-center mt-2 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
          Best time to post: <span className="text-cyan-500 font-medium">6PM - 10PM</span>
        </p>
      </div>
    </div>
  );
}