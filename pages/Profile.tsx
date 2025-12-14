import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, Input, Button } from '../components/Common';
import { User as UserIcon, Mail, Shield, Clock, Save, X, Edit2 } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Edit Profile Details State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  // Change Password State
  const [passData, setPassData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    try {
      await updateProfile({
        name: formData.name,
        email: formData.email
      });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
        return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      await updateProfile({ password: passData.newPassword });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPassData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update password.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold leading-7 text-gray-900">User Profile</h2>
        {message && (
            <div className={`px-4 py-2 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message.text}
            </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="col-span-1 p-6 text-center h-fit">
          <div className="inline-block h-24 w-24 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-4xl font-bold mb-4 mx-auto">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h3 className="text-xl font-medium text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-500 mb-4">{user.role.toUpperCase()}</p>
          <div className="flex justify-center">
             <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
               Active
             </span>
          </div>
        </Card>

        {/* Profile Details & Settings */}
        <div className="col-span-1 md:col-span-2 space-y-6">
            
            {/* Account Details */}
            <Card className="p-6">
                <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Account Details</h3>
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="text-sm text-primary-600 hover:text-primary-700 flex items-center">
                            <Edit2 className="h-4 w-4 mr-1" /> Edit
                        </button>
                    ) : (
                         <button onClick={() => setIsEditing(false)} className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                            <X className="h-4 w-4 mr-1" /> Cancel
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleProfileUpdate} className="space-y-4">
                        <Input 
                            label="Full Name" 
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                        />
                        <Input 
                            label="Email Address" 
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                label="Role & Permissions" 
                                value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                disabled
                                className="bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                            <Input 
                                label="Member Since" 
                                value={new Date(user.createdAt).toLocaleDateString()}
                                disabled
                                className="bg-gray-100 text-gray-500 cursor-not-allowed"
                            />
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button type="submit" isLoading={isLoading} icon={Save}>Save Changes</Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-4">
                        <div className="flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                            <p className="text-base text-gray-900">{user.name}</p>
                        </div>
                        </div>

                        <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Email Address</p>
                            <p className="text-base text-gray-900">{user.email}</p>
                        </div>
                        </div>

                        <div className="flex items-center">
                        <Shield className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Role & Permissions</p>
                            <p className="text-base text-gray-900 capitalize">{user.role}</p>
                        </div>
                        </div>

                        <div className="flex items-center">
                        <Clock className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                            <p className="text-sm font-medium text-gray-500">Member Since</p>
                            <p className="text-base text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Security Settings */}
            <Card className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">Security Settings</h4>
                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input 
                            label="New Password" 
                            type="password" 
                            placeholder="Min 6 characters"
                            value={passData.newPassword}
                            onChange={e => setPassData({...passData, newPassword: e.target.value})}
                        />
                        <Input 
                            label="Confirm Password" 
                            type="password" 
                            placeholder="Confirm new password"
                            value={passData.confirmPassword}
                            onChange={e => setPassData({...passData, confirmPassword: e.target.value})}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button 
                            type="submit" 
                            variant="primary" 
                            isLoading={isLoading}
                            disabled={!passData.newPassword || !passData.confirmPassword}
                        >
                            Update Password
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
      </div>
    </div>
  );
};