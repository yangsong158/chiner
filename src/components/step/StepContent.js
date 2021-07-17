import React, { useMemo } from 'react';

export default React.memo(({children, stepId, activeStep}) => {
  const memoChildren = useMemo(() => children, []);
  const actives = useMemo(() => [], []);
  if (!actives.includes(activeStep)) {
    actives.push(activeStep);
  }
  if (actives.includes(stepId)) {
    return <div>
      {memoChildren}
    </div>;
  }
  return null;
});
