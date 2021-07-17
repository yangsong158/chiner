const Upload = (accept, onChange, validate, needParse = true) => {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', accept);
  input.onchange = (e) => {
    const { files = [] } = e.target;
    if (files[0] && validate(files[0])) {
      if (needParse) {
        const reader = new FileReader();
        reader.readAsText(files[0]);
        reader.onload = (event) => {
          const result = event.target.result;
          onChange && onChange(result, files[0]);
        };
      } else {
        onChange && onChange(files[0]);
      }
    }
  };
  input.click();
};

export default Upload;
