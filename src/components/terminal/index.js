import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';

import 'xterm/css/xterm.css';

export default React.memo(({termReady}) => {
  const terminalRef = useRef(null);
  useEffect(() => {
    const { current } = terminalRef;
    const term = new Terminal();
    term.open(current);
    termReady && termReady(term);
  }, []);
  return <div ref={terminalRef}>{}</div>;
});
