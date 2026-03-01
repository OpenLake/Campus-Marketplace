// src/components/auth/GoogleButton.jsx
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';

const GoogleButton = ({ onSuccess, onFailure, disabled }) => {
  return (
    <div className="w-full flex justify-center">
      <GoogleLogin
        onSuccess={onSuccess}
        onError={onFailure} 
        useOneTap={false}
        theme="filled_black"
        shape="pill"
        text="signin_with"
        size="large"
        width="300"
        disabled={disabled}
      />
    </div>
  );
};

export default GoogleButton;