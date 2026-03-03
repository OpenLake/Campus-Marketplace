import React, { useState } from 'react';

import VendorFields from './VendorFields';
import { validateRegistrationForm } from '../../utils/validation';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx';
import Button from '../../components/ui/Button.jsx';



const RegistrationForm = ({ onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: '',
    role: 'student',
    // vendor fields
    shop_name: '',
    shop_category: '',
    campus_location: '',
    opening_time: '',
    closing_time: '',
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateRegistrationForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit(formData);
  };

  const roleOptions = [
    { value: 'student', label: 'Student' },
    { value: 'vendor', label: 'Vendor' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          error={errors.first_name}
          required
          placeholder="John"
        />
        <Input
          label="Last Name"
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          error={errors.last_name}
          required
          placeholder="Doe"
        />
      </div>

      <Input
        label="Phone Number"
        name="phone_number"
        type="tel"
        value={formData.phone_number}
        onChange={handleChange}
        error={errors.phone_number}
        required
        placeholder="9876543210"
        helperText="Enter 10-digit mobile number"
      />

      <Select
        label="I am a"
        name="role"
        value={formData.role}
        onChange={handleChange}
        options={roleOptions}
        required
      />

      {formData.role === 'vendor' && (
        <VendorFields
          formData={formData}
          onChange={handleChange}
          errors={errors}
        />
      )}

      <Button type="submit" variant="primary" fullWidth disabled={loading}>
        {loading ? 'Creating Account...' : 'Complete Registration'}
      </Button>
    </form>
  );
};

export default RegistrationForm;