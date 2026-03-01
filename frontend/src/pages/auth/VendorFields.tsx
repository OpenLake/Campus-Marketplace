import React from 'react';
import Input from '../../components/ui/Input.jsx';
import Select from '../../components/ui/Select.jsx'; 

const shopCategories = [
  { value: 'books', label: 'Books' },
  { value: 'electronics', label: 'Electronics' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'services', label: 'Services' },
  { value: 'other', label: 'Other' },
];

const VendorFields = ({ formData, onChange, errors }) => {
  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="font-bold text-gray-800">Vendor Information</h3>
      
      <Input
        label="Shop Name"
        name="shop_name"
        value={formData.shop_name}
        onChange={onChange}
        error={errors.shop_name}
        required
        placeholder="e.g., Campus Books"
      />

      <Select
        label="Shop Category"
        name="shop_category"
        value={formData.shop_category}
        onChange={onChange}
        options={shopCategories}
        error={errors.shop_category}
        required
      />

      <Input
        label="Campus Location"
        name="campus_location"
        value={formData.campus_location}
        onChange={onChange}
        error={errors.campus_location}
        required
        placeholder="e.g., Student Center"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Opening Time"
          name="opening_time"
          type="time"
          value={formData.opening_time}
          onChange={onChange}
          error={errors.opening_time}
          required
        />
        <Input
          label="Closing Time"
          name="closing_time"
          type="time"
          value={formData.closing_time}
          onChange={onChange}
          error={errors.closing_time}
          required
        />
      </div>
    </div>
  );
};

export default VendorFields;