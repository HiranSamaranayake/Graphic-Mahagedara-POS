import React, { useState } from 'react';
import { PageHeader } from '../components/ui/PageHeader';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useApp } from '../context/AppContext';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Sun,
  Moon,
  Bell,
  User,
  ShieldCheck,
  Save,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { theme, toggleTheme, addToast } = useApp();

  const [businessName, setBusinessName] = useState('GRAPHIC MAHAGEDARA');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [email, setEmail] = useState('info@graphicmahagedara.lk');
  const [address, setAddress] = useState('No. 124, High Level Road, Maharagama, Sri Lanka');
  const [currency, setCurrency] = useState('LKR (Rs.)');

  const [userName, setUserName] = useState('Admin User');
  const [userEmail, setUserEmail] = useState('admin@graphicmahagedara.lk');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Business Info Updated',
      message: 'Business information saved successfully (Frontend state).',
    });
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      type: 'success',
      title: 'Profile Updated',
      message: 'Admin profile information saved successfully.',
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <PageHeader
        title="Settings"
        subtitle="Manage Graphic Mahagedara business configuration, user preferences & system parameters"
      />

      {/* Business Information Section */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Business Information</h3>
            <p className="text-xs text-slate-500 font-medium">Official company details displayed on receipts & reports</p>
          </div>
        </div>

        <form onSubmit={handleSaveBusiness} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Business Name"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              icon={<Building2 className="w-4 h-4 text-teal-600" />}
              required
            />

            <Input
              label="Contact Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              icon={<Phone className="w-4 h-4 text-teal-600" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Official Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-teal-600" />}
            />

            <Input
              label="Default Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              icon={<DollarSign className="w-4 h-4 text-emerald-600" />}
            />
          </div>

          <Input
            label="Studio Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            icon={<MapPin className="w-4 h-4 text-teal-600" />}
          />

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Save Business Details
            </Button>
          </div>
        </form>
      </div>

      {/* System Settings & Theme */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl">
            <Sun className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">System Settings</h3>
            <p className="text-xs text-slate-500 font-medium">Visual theme mode & notification controls</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Appearance Theme</h4>
              <p className="text-xs text-slate-500 font-medium">Current active theme: {theme.toUpperCase()}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleTheme}
              icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            >
              Toggle to {theme === 'dark' ? 'Light' : 'Dark'} Mode
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-teal-600" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">System Notifications</h4>
                <p className="text-xs text-slate-500 font-medium">Receive alerts for income submissions & expenses</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                notificationsEnabled ? 'bg-teal-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* User Profile Section */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
          <div className="p-2 bg-teal-50 text-teal-600 border border-teal-200 rounded-xl">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">User Profile</h3>
            <p className="text-xs text-slate-500 font-medium">Manage administrator account details</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              icon={<User className="w-4 h-4 text-teal-600" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              icon={<Mail className="w-4 h-4 text-teal-600" />}
              required
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 font-medium">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Assigned Role: <strong className="text-teal-950 font-bold">System Administrator (Admin)</strong></span>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
