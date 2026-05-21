import React, { useEffect, useState } from 'react';

export const ClientDate: React.FC = () => {
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDateStr(new Date().toLocaleDateString());
  }, []);

  return <>{dateStr}</>;
};
