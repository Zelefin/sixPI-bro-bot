import React from "react";

interface InfoItemProps {
  label: string;
  value: string | number;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="text-lg font-medium">{value}</span>
  </div>
);
